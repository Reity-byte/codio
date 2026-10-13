/**
 * sandbox.js – bezpečné spouštění kódu uživatele.
 *
 *  runConsole(code, opts)  → Web Worker (čistý JS, výstup do konzole).
 *                             Worker lze kdykoli ukončit → ochrana proti zaseknutí.
 *  createPreview(host)     → <iframe sandbox="allow-scripts allow-forms">
 *                             pro stránky s HTML/CSS/JS (DOM kurz, projekty).
 *                             Bez allow-same-origin = žádný přístup k aplikaci
 *                             ani k jejímu localStorage.
 *
 * Do kódu se před spuštěním vkládá hlídání cyklů (instrumentLoops), které
 * nekonečný cyklus ukončí chybou dřív, než zasekne kartu.
 */
import { codioRuntime } from "./sandbox-runtime.js";
import { t, getBundle } from "./i18n.js";

const WORKER_TIMEOUT_MS = 5000;
const LOOP_LIMIT_MS = 1500;
const WORKER_LINE_OFFSET = 3; // hlavička AsyncFunction (2 řádky) + "let __codioTestFns;"

/* ------------------------------------------------------------------------ */
/* Instrumentace cyklů                                                       */
/* ------------------------------------------------------------------------ */

const isIdStart = (c) => /[A-Za-z_$À-￿]/.test(c);
const isIdPart = (c) => /[A-Za-z0-9_$À-￿]/.test(c);
const REGEX_PREV = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^"]);
const REGEX_PREV_WORDS = new Set(["return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "yield", "await"]);

/** Vrátí index za koncem řetězce/šablony začínající na pozici i. */
function skipString(code, i) {
  const q = code[i];
  let j = i + 1;
  let depth = 0;
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") {
      j += 2;
      continue;
    }
    if (q === "`") {
      if (c === "$" && code[j + 1] === "{") {
        depth++;
        j += 2;
        continue;
      }
      if (c === "}" && depth > 0) {
        depth--;
        j++;
        continue;
      }
      if (c === "`" && depth === 0) return j + 1;
      if ((c === '"' || c === "'" || c === "`") && depth > 0) {
        j = skipString(code, j);
        continue;
      }
    } else {
      if (c === q) return j + 1;
      if (c === "\n") return j; // neukončený řetězec – necháme na parseru
    }
    j++;
  }
  return j;
}

function skipRegex(code, i) {
  let j = i + 1;
  let inClass = false;
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") {
      j += 2;
      continue;
    }
    if (c === "\n") return j;
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      j++;
      while (j < code.length && /[a-z]/i.test(code[j])) j++;
      return j;
    }
    j++;
  }
  return j;
}

/**
 * Projde kód a zavolá callback pro každý "kód mimo řetězce/komentáře".
 * Vrací pole segmentů { text, kind: "code"|"string"|"comment"|"regex" }.
 */
function scan(code) {
  const segs = [];
  let i = 0;
  let buf = "";
  let prevSig = "";
  let prevWord = "";
  const flush = () => {
    if (buf) segs.push({ text: buf, kind: "code" });
    buf = "";
  };
  while (i < code.length) {
    const c = code[i];
    const n = code[i + 1];
    if (c === "/" && n === "/") {
      flush();
      const e = code.indexOf("\n", i);
      const s = e === -1 ? code.length : e;
      segs.push({ text: code.slice(i, s), kind: "comment" });
      i = s;
      continue;
    }
    if (c === "/" && n === "*") {
      flush();
      const e = code.indexOf("*/", i + 2);
      const s = e === -1 ? code.length : e + 2;
      segs.push({ text: code.slice(i, s), kind: "comment" });
      i = s;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      flush();
      const s = skipString(code, i);
      segs.push({ text: code.slice(i, s), kind: "string" });
      i = s;
      prevSig = "str";
      prevWord = "";
      continue;
    }
    if (c === "/" && (REGEX_PREV.has(prevSig) || REGEX_PREV_WORDS.has(prevWord))) {
      flush();
      const s = skipRegex(code, i);
      segs.push({ text: code.slice(i, s), kind: "regex" });
      i = s;
      prevSig = "re";
      prevWord = "";
      continue;
    }
    if (isIdStart(c)) {
      let j = i;
      while (j < code.length && isIdPart(code[j])) j++;
      const w = code.slice(i, j);
      buf += w;
      prevSig = "id";
      prevWord = w;
      i = j;
      continue;
    }
    if (!/\s/.test(c)) {
      prevSig = c === ")" || c === "]" ? "id" : c;
      prevWord = "";
    }
    buf += c;
    i++;
  }
  flush();
  return segs;
}

/** Odstraní komentáře (pro testy typu "source"). Řetězce zůstávají. */
export function stripComments(code) {
  return scan(code)
    .map((s) => (s.kind === "comment" ? s.text.replace(/[^\n]/g, " ") : s.text))
    .join("");
}

/**
 * Najde odpovídající ")" k "(" na pozici open. Řetězce a komentáře přeskakuje.
 * Pracuje nad "maskovaným" kódem, kde jsou řetězce nahrazené mezerami.
 */
function findClose(masked, open) {
  let depth = 0;
  for (let i = open; i < masked.length; i++) {
    const c = masked[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      depth--;
      if (depth === 0) return c === ")" ? i : -1;
    }
  }
  return -1;
}

function splitTopLevel(masked, start, end) {
  const idx = [];
  let depth = 0;
  for (let i = start; i < end; i++) {
    const c = masked[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === ";" && depth === 0) idx.push(i);
  }
  return idx;
}

/**
 * Vloží do podmínek cyklů `for`/`while`/`do…while` volání __lp(),
 * které při zaseknutí vyhodí chybu. Zachovává čísla řádků.
 *   while (x)            → while (__lp() && (x))
 *   for (a; b; c)        → for (a; __lp() && (b); c)
 *   for (;;)             → for (; __lp(); )
 *   for (x of y)         → beze změny (konečné)
 */
export function instrumentLoops(code) {
  const segs = scan(code);
  // maskovaný kód: stejná délka, řetězce/komentáře/regexy nahrazené mezerami
  const masked = segs.map((s) => (s.kind === "code" ? s.text : s.text.replace(/[^\n]/g, " "))).join("");
  const inserts = []; // { pos, text } nebo { pos, end, wrap: true }
  const re = /(^|[^.\w$])(for|while)\b/g;
  let m;
  while ((m = re.exec(masked))) {
    const kwEnd = m.index + m[0].length;
    let k = kwEnd;
    while (/\s/.test(masked[k] || "")) k++;
    if (m[2] === "for" && masked.startsWith("await", k)) {
      k += 5;
      while (/\s/.test(masked[k] || "")) k++;
    }
    if (masked[k] !== "(") continue;
    const close = findClose(masked, k);
    if (close === -1) continue;
    if (m[2] === "while") {
      inserts.push({ pos: k + 1, text: "__lp() && (" }, { pos: close, text: ")" });
    } else {
      const semis = splitTopLevel(masked, k + 1, close);
      if (semis.length !== 2) continue; // for-in / for-of
      const condStart = semis[0] + 1;
      const condEnd = semis[1];
      if (masked.slice(condStart, condEnd).trim()) {
        inserts.push({ pos: condStart, text: " __lp() && (" }, { pos: condEnd, text: ")" });
      } else {
        inserts.push({ pos: condStart, text: " __lp()" });
      }
    }
  }
  if (!inserts.length) return code;
  inserts.sort((a, b) => b.pos - a.pos);
  let out = code;
  for (const ins of inserts) out = out.slice(0, ins.pos) + ins.text + out.slice(ins.pos);
  return out;
}

/* ------------------------------------------------------------------------ */
/* Konfigurace runtime                                                       */
/* ------------------------------------------------------------------------ */

function runtimeMessages() {
  return {
    truncated: t("sandbox.truncated"),
    infiniteLoop: t("sandbox.infiniteLoop"),
    promptUnsupported: t("sandbox.promptUnsupported"),
    testTimeout: t("sandbox.testTimeout"),
    elementMissing: t("sandbox.elementMissing"),
  };
}

let workerUrl = null;
function getWorkerUrl() {
  if (!workerUrl) {
    const cfg = {
      env: "worker",
      messages: runtimeMessages(),
      loopLimitMs: LOOP_LIMIT_MS,
      lineOffset: WORKER_LINE_OFFSET,
      mockApi: getBundle().mockApi || null,
    };
    const src = `(${codioRuntime.toString()})(${JSON.stringify(cfg)});`;
    workerUrl = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
  }
  return workerUrl;
}

/* ------------------------------------------------------------------------ */
/* Vyhodnocení testů na straně aplikace                                      */
/* ------------------------------------------------------------------------ */

const normalizeLine = (s) => String(s).replace(/\s+$/g, "");

/**
 * Spojí výsledky testů z sandboxu (call/check) s testy vyhodnocenými zde
 * (output/source). Vrací pole { name, passed, message } v původním pořadí.
 */
function evaluateTests(tests, code, sandboxResults, mainLogs, error) {
  const runtimeTests = tests.filter((x) => x.type === "call" || x.type === "check");
  return tests.map((test) => {
    const name = test.name;
    if (test.type === "output") {
      const expected = (Array.isArray(test.expected) ? test.expected : String(test.expected).split("\n")).map(normalizeLine);
      const actual = (mainLogs || []).join("\n").split("\n").map(normalizeLine);
      const passed = test.contains
        ? expected.every((line) => actual.some((a) => a.includes(line)))
        : expected.length === actual.length && expected.every((line, i) => line === actual[i]);
      return {
        name,
        passed,
        message: passed ? "" : t("tests.outputMismatch", { expected: expected.join(" ⏎ "), actual: actual.join(" ⏎ ") || t("tests.nothing") }),
      };
    }
    if (test.type === "source") {
      const src = stripComments(code);
      const found = new RegExp(test.pattern, test.flags || "").test(src);
      const passed = test.mustNot ? !found : found;
      return { name, passed, message: passed ? "" : test.message || t("tests.sourceMismatch") };
    }
    // call / check – výsledek přišel ze sandboxu
    const r = sandboxResults?.[runtimeTests.indexOf(test)];
    if (!r) return { name, passed: false, message: error ? t("tests.codeCrashed") : t("tests.notRun") };
    // Nejčastější chyba začátečníků: jiný název proměnné/funkce než v zadání
    const notDefined = /^ReferenceError: (\S+) is not defined/.exec(r.error || "");
    const missing = r.missing?.length ? r.missing : notDefined ? [notDefined[1]] : null;
    if (!r.passed && missing) {
      return { name, passed: false, message: t("tests.missingNames", { names: missing.map((n) => `„${n}“`).join(", "), count: missing.length }) };
    }
    if (r.error) return { name, passed: false, message: r.error };
    if (test.type === "call" && !r.passed) {
      return { name, passed: false, message: t("tests.callMismatch", { expr: test.expr, expected: r.expected, actual: r.actual }) };
    }
    return { name, passed: r.passed, message: r.passed ? "" : r.message || test.message || t("tests.checkFailed") };
  });
}

/* ------------------------------------------------------------------------ */
/* Konzolový běh ve Web Workeru                                              */
/* ------------------------------------------------------------------------ */

/**
 * Spustí JS kód ve Workeru.
 * @param {string} code
 * @param {{tests?: Array, onLog?: Function, onClear?: Function, timeoutMs?: number}} opts
 * @returns {Promise<{logs, error, timedOut, tests, passed, durationMs}>}
 */
export function runConsole(code, { tests = [], onLog, onClear, timeoutMs = WORKER_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    const started = performance.now();
    const logs = [];
    let error = null;
    let settled = false;
    let worker;
    try {
      worker = new Worker(getWorkerUrl());
    } catch (err) {
      resolve({ logs, error: { name: "Error", message: String(err) }, timedOut: false, tests: [], passed: false, durationMs: 0 });
      return;
    }

    const runtimeTests = tests.filter((x) => x.type === "call" || x.type === "check");

    const finish = (payload = {}) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      const testResults = tests.length ? evaluateTests(tests, code, payload.testResults, payload.mainLogs, error) : [];
      resolve({
        logs,
        error,
        timedOut: !!payload.timedOut,
        tests: testResults,
        passed: testResults.length > 0 && testResults.every((r) => r.passed),
        durationMs: Math.round(performance.now() - started),
      });
    };

    const timer = setTimeout(() => {
      const msg = t("sandbox.timeout", { seconds: Math.round(timeoutMs / 1000) });
      logs.push({ level: "warn", text: msg });
      onLog?.({ level: "warn", text: msg });
      finish({ timedOut: true, mainLogs: logs.filter((l) => l.level !== "warn").map((l) => l.text) });
    }, timeoutMs);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "log") {
        logs.push({ level: msg.level, text: msg.text });
        onLog?.(msg);
      } else if (msg.type === "clear") {
        logs.length = 0;
        onClear?.();
      } else if (msg.type === "error") {
        error = { name: msg.name, message: msg.message, line: msg.line };
        onLog?.({ level: "error", text: `${msg.name}: ${msg.message}`, error });
      } else if (msg.type === "done") {
        finish(msg);
      }
    };
    worker.onerror = (e) => {
      e.preventDefault();
      error = { name: "Error", message: e.message };
      finish({});
    };
    worker.postMessage({ code: instrumentLoops(code), tests: runtimeTests });
  });
}

/* ------------------------------------------------------------------------ */
/* Náhled stránky v <iframe sandbox>                                         */
/* ------------------------------------------------------------------------ */

const PREVIEW_BASE_CSS = `
  html { color-scheme: light; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; margin: 16px; color: #1b2a28; line-height: 1.5; }
  button { font: inherit; cursor: pointer; }
`;

/** Zabezpečí řetězec pro vložení do <script> v srcdoc. */
function scriptSafe(value) {
  // znak "<" se escapuje (kvůli </script>); U+2028/2029 jsou v JSON povolené, ale ne v JS řetězcích
  const BS = String.fromCharCode(92); // zpětné lomítko
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  return JSON.stringify(value)
    .split("<").join(BS + "u003c")
    .split(LS).join(BS + "u2028")
    .split(PS).join(BS + "u2029");
}

function buildSrcdoc({ html = "", css = "", js = "", runId, tests = [], storage = {} }) {
  const cfg = {
    env: "iframe",
    runId,
    messages: runtimeMessages(),
    loopLimitMs: LOOP_LIMIT_MS,
    tests,
    storage,
  };
  return `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${PREVIEW_BASE_CSS}</style>
<style>${css.replace(/<\/style/gi, "<\\/style")}</style>
<script>(${codioRuntime.toString()})(${scriptSafe(cfg)});</script>
</head><body>
${html}
<script>__codioStart(${scriptSafe(instrumentLoops(js))});</script>
</body></html>`;
}

/**
 * Vytvoří náhled (iframe) v elementu host.
 * @param {HTMLElement} host
 * @param {{onLog?: Function, onClear?: Function, onStorage?: Function, title?: string}} opts
 */
export function createPreview(host, { onLog, onClear, onStorage, title = "Náhled" } = {}) {
  let iframe = null;
  let runId = null;
  let pending = null; // { resolve, logs, error, timer }

  function onMessage(e) {
    if (!iframe || e.source !== iframe.contentWindow) return;
    const msg = e.data;
    if (!msg || msg.__codio !== runId) return;
    if (msg.type === "log") {
      pending?.logs.push({ level: msg.level, text: msg.text });
      onLog?.(msg);
    } else if (msg.type === "clear") {
      onClear?.();
    } else if (msg.type === "error") {
      const error = { name: msg.name, message: msg.message, line: msg.line };
      if (pending) pending.error = error;
      onLog?.({ level: "error", text: `${msg.name}: ${msg.message}`, error });
    } else if (msg.type === "storage") {
      onStorage?.(msg.data);
    } else if (msg.type === "done" && pending) {
      const p = pending;
      pending = null;
      clearTimeout(p.timer);
      p.resolve({ ...msg, logs: p.logs, error: p.error });
    }
  }
  window.addEventListener("message", onMessage);

  return {
    /**
     * Načte stránku do iframe. Vrací Promise s výsledky testů.
     * @param {{html?: string, css?: string, js?: string, tests?: Array, storage?: object}} files
     */
    run({ html, css, js, tests = [], storage = {} }) {
      if (pending) {
        clearTimeout(pending.timer);
        pending.resolve({ cancelled: true, logs: pending.logs, error: pending.error, tests: [] });
        pending = null;
      }
      runId = Math.random().toString(36).slice(2);
      const runtimeTests = tests.filter((x) => x.type === "call" || x.type === "check");
      // iframe se vytváří znovu – čistý stav, žádné staré posluchače ani časovače
      const fresh = document.createElement("iframe");
      fresh.className = "preview-frame";
      fresh.title = title;
      fresh.setAttribute("sandbox", "allow-scripts allow-forms");
      fresh.setAttribute("referrerpolicy", "no-referrer");
      fresh.srcdoc = buildSrcdoc({ html, css, js, runId, tests: runtimeTests, storage });
      if (iframe) iframe.replaceWith(fresh);
      else host.append(fresh);
      iframe = fresh;

      return new Promise((resolve) => {
        pending = {
          logs: [],
          error: null,
          resolve: (raw) => {
            const testResults = tests.length ? evaluateTests(tests, js || "", raw.testResults, raw.mainLogs, raw.error) : [];
            resolve({
              logs: raw.logs,
              error: raw.error,
              cancelled: !!raw.cancelled,
              tests: testResults,
              passed: testResults.length > 0 && testResults.every((r) => r.passed),
            });
          },
          timer: setTimeout(() => {
            if (!pending) return;
            const p = pending;
            pending = null;
            p.resolve({ logs: p.logs, error: p.error || { name: "TimeoutError", message: t("sandbox.previewTimeout") }, testResults: null });
          }, 15000), // celkový limit – víc testů s čekáním
        };
      });
    },
    get element() {
      return iframe;
    },
    destroy() {
      window.removeEventListener("message", onMessage);
      if (pending) clearTimeout(pending.timer);
      pending = null;
      iframe?.remove();
      iframe = null;
    },
  };
}
