/**
 * sandbox-runtime.js – kód, který běží UVNITŘ izolovaného prostředí
 * (Web Worker nebo <iframe sandbox>). Funkce `codioRuntime` se do sandboxu
 * vkládá jako text přes `codioRuntime.toString()`, proto:
 *   - nesmí používat nic z okolního modulu (žádné importy ani closure),
 *   - veškerá konfigurace přichází v parametru `cfg`.
 *
 * Co runtime dělá:
 *   - podvrhne `console` a posílá výpisy rodiči přes postMessage,
 *   - hlídá nekonečné cykly (funkce __lp(), kterou do cyklů vkládá instrumentace),
 *   - zachytává chyby a nezachycené Promise,
 *   - ve workeru sleduje časovače/fetch, aby poznal konec programu,
 *   - v iframe nahrazuje localStorage/alert/prompt a spouští testy.
 */
export function codioRuntime(cfg) {
  "use strict";
  const G = globalThis;
  const isWorker = cfg.env === "worker";
  const M = cfg.messages || {};
  const post = isWorker
    ? (msg) => G.postMessage(msg)
    : (msg) => G.parent.postMessage(Object.assign({ __codio: cfg.runId }, msg), "*");

  /* ---------------- Formátování hodnot (podobné konzoli prohlížeče) ------- */
  function fmt(value, depth, seen, nested) {
    depth = depth || 0;
    seen = seen || new WeakSet();
    const t = typeof value;
    if (value === null) return "null";
    if (t === "undefined") return "undefined";
    if (t === "string") return nested ? JSON.stringify(value) : value;
    if (t === "number") return Object.is(value, -0) ? "0" : String(value);
    if (t === "boolean" || t === "bigint") return String(value) + (t === "bigint" ? "n" : "");
    if (t === "symbol") return value.toString();
    if (t === "function") {
      const src = Function.prototype.toString.call(value);
      if (/^class\s/.test(src)) return "class " + (value.name || "(anonymní)");
      return "ƒ " + (value.name || "(anonymní)") + "()";
    }
    if (seen.has(value)) return "[Circular]";
    if (value instanceof Error) return value.name + ": " + value.message;
    if (value instanceof Date) return isNaN(value) ? "Invalid Date" : value.toISOString();
    if (value instanceof RegExp) return String(value);
    if (typeof Promise !== "undefined" && value instanceof Promise) return "Promise {…}";
    if (!isWorker && typeof Element !== "undefined" && value instanceof Element) {
      let s = "<" + value.tagName.toLowerCase();
      if (value.id) s += ' id="' + value.id + '"';
      if (value.className && typeof value.className === "string") s += ' class="' + value.className + '"';
      return s + ">";
    }
    if (depth > 3) return Array.isArray(value) ? "[Array]" : "[Object]";
    seen.add(value);
    let out;
    if (Array.isArray(value)) {
      const items = value.slice(0, 100).map((v) => fmt(v, depth + 1, seen, true));
      if (value.length > 100) items.push("… a dalších " + (value.length - 100));
      out = "[" + items.join(", ") + "]";
    } else if (value instanceof Map) {
      const items = [...value].slice(0, 50).map(([k, v]) => fmt(k, depth + 1, seen, true) + " => " + fmt(v, depth + 1, seen, true));
      out = "Map(" + value.size + ") {" + (items.length ? " " + items.join(", ") + " " : "") + "}";
    } else if (value instanceof Set) {
      const items = [...value].slice(0, 50).map((v) => fmt(v, depth + 1, seen, true));
      out = "Set(" + value.size + ") {" + (items.length ? " " + items.join(", ") + " " : "") + "}";
    } else {
      const keys = Object.keys(value);
      const ctor = value.constructor && value.constructor !== Object ? value.constructor.name + " " : "";
      if (!keys.length) out = ctor + "{}";
      else {
        const items = keys.slice(0, 50).map((k) => {
          const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
          return key + ": " + fmt(value[k], depth + 1, seen, true);
        });
        out = ctor + "{ " + items.join(", ") + " }";
      }
    }
    seen.delete(value);
    return out;
  }

  /** Hluboké porovnání pro testy (čísla, řetězce, pole, objekty). */
  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9;
    if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }

  /* ---------------- Konzole ------------------------------------------------ */
  const MAX_LOGS = cfg.maxLogs || 500;
  let logCount = 0;
  let phase = "main";
  const mainLogs = [];
  const counters = {};
  const timersLabel = {};
  let groupDepth = 0;

  function emitLog(level, args) {
    const text = "  ".repeat(groupDepth) + args.map((a) => fmt(a)).join(" ");
    if (phase === "main") mainLogs.push(text);
    logCount++;
    if (logCount <= MAX_LOGS) post({ type: "log", level, text });
    else if (logCount === MAX_LOGS + 1) post({ type: "log", level: "warn", text: M.truncated || "…" });
  }

  const fakeConsole = {
    log: (...a) => emitLog("log", a),
    info: (...a) => emitLog("info", a),
    debug: (...a) => emitLog("log", a),
    warn: (...a) => emitLog("warn", a),
    error: (...a) => emitLog("error", a),
    table: (data) => {
      if (Array.isArray(data)) data.forEach((row, i) => emitLog("log", [i + " │ " + fmt(row)]));
      else emitLog("log", [data]);
    },
    clear: () => post({ type: "clear" }),
    group: (...a) => {
      if (a.length) emitLog("log", a);
      groupDepth++;
    },
    groupEnd: () => (groupDepth = Math.max(0, groupDepth - 1)),
    count: (label = "default") => {
      counters[label] = (counters[label] || 0) + 1;
      emitLog("log", [label + ": " + counters[label]]);
    },
    time: (label = "default") => (timersLabel[label] = Date.now()),
    timeEnd: (label = "default") => emitLog("log", [label + ": " + (Date.now() - (timersLabel[label] || Date.now())) + " ms"]),
    assert: (cond, ...a) => {
      if (!cond) emitLog("error", ["Assertion failed:", ...a]);
    },
  };
  try {
    Object.defineProperty(G, "console", { value: fakeConsole, configurable: true, writable: true });
  } catch {
    G.console = fakeConsole;
  }

  /* ---------------- Hlídání nekonečných cyklů ------------------------------ */
  // "Srdeční tep": interval aktualizuje lastTick. Když vlákno uvízne v cyklu,
  // interval neběží a __lp() zjistí, že od posledního tepu uběhlo moc času.
  const _setTimeout = G.setTimeout.bind(G);
  const _clearTimeout = G.clearTimeout.bind(G);
  const _setInterval = G.setInterval.bind(G);
  const _clearInterval = G.clearInterval.bind(G);
  let lastTick = Date.now();
  _setInterval(() => (lastTick = Date.now()), 50);
  let lpCounter = 0;
  const LOOP_LIMIT = cfg.loopLimitMs || 1500;

  function InfiniteLoopError() {
    const e = new Error(M.infiniteLoop || "Infinite loop");
    e.name = "InfiniteLoopError";
    return e;
  }
  Object.defineProperty(G, "__lp", {
    value: function () {
      if ((++lpCounter & 1023) === 0 && Date.now() - lastTick > LOOP_LIMIT) {
        lastTick = Date.now();
        throw InfiniteLoopError();
      }
      return true;
    },
  });

  /* ---------------- Chyby -------------------------------------------------- */
  function lineFromStack(err) {
    const stack = (err && err.stack) || "";
    let m = /<anonymous>:(\d+):(\d+)/.exec(stack) || /(?:Function|AsyncFunction):(\d+):(\d+)/.exec(stack);
    if (m) return Math.max(1, Number(m[1]) - (cfg.lineOffset || 0));
    return null;
  }
  let errorReported = false;
  function reportError(err, line) {
    errorReported = true;
    const name = (err && err.name) || "Error";
    const message = (err && err.message !== undefined ? String(err.message) : String(err))
      // Chrome u syntaktických chyb ve vloženém <script> přidává technický prefix
      .replace(/^Failed to execute '[^']+' on '[^']+': /, "")
      .replace(/^Uncaught (\w+Error: )?/, "");
    post({ type: "error", name, message, line: line || lineFromStack(err) });
  }
  G.addEventListener("unhandledrejection", (e) => {
    e.preventDefault();
    reportError(e.reason);
  });

  /* ---------------- Testy -------------------------------------------------- */
  const KEYWORDS = new Set(
    ("return typeof instanceof true false null undefined await async const let var if else for of in new function " +
      "this while do break continue switch case default try catch finally throw delete void yield class extends super NaN Infinity")
      .split(" ")
  );

  /**
   * Názvy, které test čte z kódu uživatele (např. `vek`, `secti`). Vynechá
   * klíčová slova, globální objekty, vlastnosti za tečkou a proměnné
   * deklarované přímo v testu (parametry šipkových funkcí, const/let).
   */
  function candidateNames(src, exclude) {
    const clean = String(src || "").replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, '""');
    const declared = new Set();
    const add = (list) => list.split(/[,\s:=]+/).forEach((n) => n && declared.add(n));
    let m;
    const decl = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
    while ((m = decl.exec(clean))) declared.add(m[1]);
    const destr = /\b(?:const|let|var)\s*[[{]([^\]}]*)[\]}]/g;
    while ((m = destr.exec(clean))) add(m[1]);
    const arrow = /\(([^()]*)\)\s*=>/g;
    while ((m = arrow.exec(clean))) add(m[1]);
    const arrow1 = /([A-Za-z_$][\w$]*)\s*=>/g;
    while ((m = arrow1.exec(clean))) declared.add(m[1]);
    const out = [];
    // (?![\w$]) – celý identifikátor; (?!\s*:) – ne klíč objektu
    const id = /(^|[^.\w$])([A-Za-z_$][\w$]*)(?![\w$])(?!\s*:)/g;
    while ((m = id.exec(clean))) {
      const n = m[2];
      if (KEYWORDS.has(n) || declared.has(n) || exclude.has(n) || n in G || out.includes(n)) continue;
      out.push(n);
    }
    return out;
  }

  // Každý test je async funkce vrácená z uživatelského kontextu.
  // probe(název) vrací výsledek `typeof název` v kontextu uživatele.
  async function runTests(fns, defs, probe, exclude) {
    phase = "test";
    const results = [];
    const missingFor = (def) => {
      if (!probe) return [];
      return candidateNames(def.type === "call" ? def.expr : def.code, exclude || new Set()).filter((n) => probe(n) === "undefined");
    };
    for (let i = 0; i < fns.length; i++) {
      const def = defs[i] || {};
      let result;
      try {
        const actual = await Promise.race([
          fns[i](),
          new Promise((_, rej) => _setTimeout(() => rej(new Error(M.testTimeout || "Test timeout")), 4000)),
        ]);
        if (def.type === "call") {
          result = { passed: deepEqual(actual, def.expected), actual: fmt(actual, 0, null, true), expected: fmt(def.expected, 0, null, true) };
        } else if (actual && typeof actual === "object" && "pass" in actual) {
          result = { passed: !!actual.pass, message: actual.message };
        } else {
          result = { passed: !!actual };
        }
      } catch (err) {
        result = { passed: false, error: (err && err.name ? err.name + ": " : "") + (err && err.message ? err.message : String(err)) };
      }
      if (!result.passed) {
        const missing = missingFor(def);
        if (missing.length) result.missing = missing;
      }
      results.push(result);
    }
    phase = "main";
    return results;
  }
  Object.defineProperty(G, "__codioRunTests", { value: runTests });

  /* ======================================================================= */
  /* Web Worker – konzolové programy                                          */
  /* ======================================================================= */
  if (isWorker) {
    // importScripts si necháme jen pro sebe – s ním zjistíme řádek syntaktické chyby
    const origImportScripts = G.importScripts ? G.importScripts.bind(G) : null;

    // Zablokování API, která uživatelský kód nepotřebuje a mohla by sahat na data aplikace
    ["indexedDB", "caches", "BroadcastChannel", "importScripts", "localStorage", "sessionStorage"].forEach((k) => {
      try {
        Object.defineProperty(G, k, { value: undefined, configurable: false, writable: false });
      } catch {
        /* nic */
      }
    });

    // Sledování časovačů, aby šlo poznat, kdy program skončil
    const timers = new Set();
    let pendingFetch = 0;
    let mainDone = false;
    let finished = false;
    let testResults = null;

    function runTask(fn, args) {
      lastTick = Date.now();
      try {
        if (typeof fn === "function") fn(...args);
      } catch (err) {
        reportError(err);
      }
    }
    G.setTimeout = function (fn, ms, ...args) {
      const id = _setTimeout(() => {
        timers.delete(id);
        runTask(fn, args);
        checkDone();
      }, ms);
      timers.add(id);
      return id;
    };
    G.clearTimeout = function (id) {
      timers.delete(id);
      _clearTimeout(id);
      checkDone();
    };
    G.setInterval = function (fn, ms, ...args) {
      const id = _setInterval(() => runTask(fn, args), Math.max(ms || 0, 10));
      timers.add(id);
      return id;
    };
    G.clearInterval = function (id) {
      timers.delete(id);
      _clearInterval(id);
      checkDone();
    };

    // fetch: falešné API pro lekce (deterministické a funguje offline)
    const realFetch = G.fetch ? G.fetch.bind(G) : null;
    const mock = cfg.mockApi || {};
    G.fetch = function (url, opts) {
      pendingFetch++;
      const u = String(url);
      let p;
      if (mock.base && u.startsWith(mock.base)) {
        const path = u.slice(mock.base.length).replace(/\/$/, "");
        const hit = Object.prototype.hasOwnProperty.call(mock.routes, path);
        const body = hit ? JSON.stringify(mock.routes[path]) : JSON.stringify({ chyba: "Nenalezeno" });
        p = new Promise((res) =>
          _setTimeout(() => res(new Response(body, { status: hit ? 200 : 404, headers: { "Content-Type": "application/json" } })), 300)
        );
      } else if (realFetch) {
        p = realFetch(url, opts);
      } else {
        p = Promise.reject(new TypeError("fetch není k dispozici"));
      }
      return p.finally(() => {
        pendingFetch--;
        lastTick = Date.now();
        checkDone();
      });
    };

    function checkDone() {
      if (!mainDone || finished) return;
      _setTimeout(() => {
        if (!finished && timers.size === 0 && pendingFetch === 0) finish();
      }, 0);
    }
    function finish() {
      finished = true;
      post({ type: "done", mainLogs, testResults, errorReported });
    }

    /**
     * Chrome u SyntaxError z konstruktoru funkce neuvádí řádek. Stejný kód
     * proto zkusíme načíst přes importScripts – chyba parsování pak přijde
     * do onerror i s číslem řádku. Kód se nikdy nespustí (jde jen o deklaraci
     * funkce, a parsování stejně selže).
     */
    function syntaxLine(code) {
      return new Promise((resolve) => {
        if (!origImportScripts) return resolve(null);
        const url = URL.createObjectURL(new Blob(["async function __codioSyntax(){\n" + code + "\n}"], { type: "text/javascript" }));
        const prev = G.onerror;
        let settled = false;
        const done = (line) => {
          if (settled) return;
          settled = true;
          G.onerror = prev;
          URL.revokeObjectURL(url);
          resolve(line);
        };
        G.onerror = (msg, file, line) => {
          done(line ? Math.max(1, line - 1) : null);
          return true;
        };
        _setTimeout(() => origImportScripts(url));
        _setTimeout(() => done(null), 500);
      });
    }

    G.onmessage = async (e) => {
      const { code, tests } = e.data;
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      // Testy se připojí na konec těla, aby viděly proměnné a funkce uživatele
      const testFns = (tests || [])
        .map((t) => (t.type === "call" ? "async () => (" + t.expr + "\n)" : "async () => {\n" + t.code + "\n}"))
        .join(",\n");
      const body =
        code +
        "\n;__codioTestFns = [" + testFns + "];" +
        // probe: `typeof název` přímo v rozsahu uživatelského kódu (přímý eval)
        "\n__codioProbe = (n) => { try { return eval('typeof ' + n); } catch (e) { return 'tdz'; } };";
      let fn;
      try {
        // Pozor: první řádek s `let` posouvá čísla řádků o 1 (cfg.lineOffset)
        fn = new AsyncFunction("let __codioTestFns, __codioProbe;\n" + body + "\nreturn [__codioTestFns, __codioProbe];");
      } catch (err) {
        reportError(err, err && err.name === "SyntaxError" ? await syntaxLine(code) : null);
        mainDone = true;
        finish();
        return;
      }
      lastTick = Date.now();
      try {
        const [fns, probe] = await fn();
        if (tests && tests.length) testResults = await runTests(fns, tests, probe);
      } catch (err) {
        reportError(err);
      }
      mainDone = true;
      checkDone();
    };
    post({ type: "ready" });
    return;
  }

  /* ======================================================================= */
  /* <iframe sandbox> – stránky s HTML/CSS/JS (DOM kurz a projekty)           */
  /* ======================================================================= */

  // localStorage: iframe bez allow-same-origin k němu nemá přístup, takže
  // podvrhneme vlastní úložiště, které rodič uloží odděleně od postupu.
  const store = Object.assign(Object.create(null), cfg.storage || {});
  const sync = () => post({ type: "storage", data: Object.assign({}, store) });
  const fakeStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
      sync();
    },
    removeItem: (k) => {
      delete store[k];
      sync();
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
      sync();
    },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
  ["localStorage", "sessionStorage"].forEach((k) => {
    try {
      Object.defineProperty(G, k, { value: fakeStorage, configurable: true });
    } catch {
      /* nic */
    }
  });

  // Modální okna nejsou v sandboxu povolená → výpis do konzole
  G.alert = (msg) => emitLog("info", ["🔔 alert: " + fmt(msg)]);
  G.confirm = (msg) => {
    emitLog("info", ["❔ confirm: " + fmt(msg) + " → true"]);
    return true;
  };
  G.prompt = (msg, def) => {
    emitLog("warn", [(M.promptUnsupported || "prompt()") + " " + fmt(msg)]);
    return def ?? "";
  };

  G.addEventListener("error", (e) => {
    reportError(e.error || { name: "Error", message: e.message }, e.lineno);
  });

  // Pomocníci pro testy projektů
  const helpers = {
    $: (s) => document.querySelector(s),
    $$: (s) => [...document.querySelectorAll(s)],
    text: (s) => (document.querySelector(s)?.textContent || "").trim(),
    wait: (ms = 50) => new Promise((r) => _setTimeout(r, ms)),
    click: async (s) => {
      const el = typeof s === "string" ? document.querySelector(s) : s;
      if (!el) throw new Error((M.elementMissing || "Element nenalezen: ") + s);
      el.click();
      await new Promise((r) => _setTimeout(r, 30));
    },
    type: async (s, value) => {
      const el = typeof s === "string" ? document.querySelector(s) : s;
      if (!el) throw new Error((M.elementMissing || "Element nenalezen: ") + s);
      el.focus();
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((r) => _setTimeout(r, 30));
    },
    press: async (s, key) => {
      const el = typeof s === "string" ? document.querySelector(s) : s;
      el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      el.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
      await new Promise((r) => _setTimeout(r, 30));
    },
    submit: async (s) => {
      const form = document.querySelector(s);
      if (!form) throw new Error((M.elementMissing || "Element nenalezen: ") + s);
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await new Promise((r) => _setTimeout(r, 30));
    },
    logs: () => mainLogs.slice(),
    storage: () => Object.assign({}, store),
  };

  // Spuštění kódu uživatele – vložením <script>, aby čísla řádků v chybách
  // odpovídala řádkům v editoru a top-level proměnné byly globální.
  Object.defineProperty(G, "__codioStart", {
    value: function (code) {
      const s = document.createElement("script");
      s.textContent = code;
      lastTick = Date.now();
      document.body.appendChild(s);
      s.remove();
      const tests = cfg.tests || [];
      const finish = async () => {
        let results = null;
        if (tests.length) {
          await new Promise((r) => _setTimeout(r, 60));
          const fns = tests.map((t) => {
            const src = t.type === "call" ? "return (" + t.expr + "\n);" : t.code;
            try {
              const f = new Function("h", "with (h) { return (async () => {\n" + src + "\n})(); }");
              return () => f(helpers);
            } catch (err) {
              return () => Promise.reject(err);
            }
          });
          const probe = (n) => {
            try {
              return (0, eval)("typeof " + n);
            } catch {
              return "tdz";
            }
          };
          results = await runTests(fns, tests, probe, new Set(Object.keys(helpers)));
        }
        post({ type: "done", mainLogs, testResults: results, errorReported });
      };
      if (document.readyState === "complete") finish();
      else G.addEventListener("load", finish, { once: true });
    },
  });
}
