/**
 * ui.js – sdílené pomocné funkce pro práci s DOM:
 * vytváření elementů, mini‑markdown, zvýraznění kódu, toasty, modální okna.
 */
import { t } from "./i18n.js";
import { icon } from "./icons.js";

/* ------------------------------------------------------------------------ */
/* Vytváření elementů                                                        */
/* ------------------------------------------------------------------------ */

/**
 * Hyperscript pomocník.
 * @example h("button", { class: "btn", onclick: fn }, "Klikni")
 * Atributy začínající "on" se registrují jako posluchače událostí,
 * `html` nastaví innerHTML (jen pro důvěryhodný obsah!).
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "class") {
      el.className = value;
    } else if (key === "html") {
      el.innerHTML = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else if (key === "dataset") {
      Object.assign(el.dataset, value);
    } else if (value === true) {
      el.setAttribute(key, "");
    } else {
      el.setAttribute(key, value);
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $$(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

/** Restartuje CSS animaci (např. zatřesení při chybě). */
export function replayAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // vynutí reflow, aby se animace spustila znovu
  el.classList.add(className);
  el.addEventListener("animationend", () => el.classList.remove(className), { once: true });
}

/** Ohlášení pro čtečky obrazovky. */
export function announce(message) {
  const region = document.getElementById("live-region");
  if (!region) return;
  region.textContent = "";
  setTimeout(() => (region.textContent = message), 30);
}

/* ------------------------------------------------------------------------ */
/* Zvýraznění syntaxe (pro statické ukázky – editor má vlastní)               */
/* ------------------------------------------------------------------------ */

const JS_KEYWORDS = new Set(
  ("let const var function return if else for while do switch case break continue default new " +
    "class extends import export from of in typeof instanceof async await try catch finally throw " +
    "this delete void yield static get set").split(" ")
);
const JS_LITERALS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);

/** Velmi jednoduchý tokenizér JS → HTML se <span class="tok-*">. */
export function highlightJs(code) {
  let out = "";
  let i = 0;
  const n = code.length;
  const push = (cls, text) => {
    out += cls ? `<span class="tok-${cls}">${escapeHtml(text)}</span>` : escapeHtml(text);
  };
  let prevSignificant = "";
  while (i < n) {
    const ch = code[i];
    const next = code[i + 1];
    // komentáře
    if (ch === "/" && next === "/") {
      const end = code.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      push("com", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = code.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      push("com", code.slice(i, stop));
      i = stop;
      continue;
    }
    // řetězce
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < n && code[j] !== ch) {
        if (code[j] === "\\") j++;
        if (ch !== "`" && code[j] === "\n") break;
        j++;
      }
      push("str", code.slice(i, j + 1));
      i = j + 1;
      prevSignificant = "str";
      continue;
    }
    // čísla
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(next || ""))) {
      const m = /^(0x[0-9a-f]+|\d*\.?\d+(e[+-]?\d+)?n?)/i.exec(code.slice(i));
      push("num", m[0]);
      i += m[0].length;
      prevSignificant = "num";
      continue;
    }
    // identifikátory
    if (/[A-Za-z_$À-ɏ]/.test(ch)) {
      const m = /^[A-Za-z0-9_$À-ɏ]+/.exec(code.slice(i));
      const word = m[0];
      const after = code.slice(i + word.length).match(/^\s*(\(|=>)?/)[1];
      let cls = "";
      if (JS_KEYWORDS.has(word)) cls = "kw";
      else if (JS_LITERALS.has(word)) cls = "lit";
      else if (prevSignificant === ".") cls = after === "(" ? "fn" : "prop";
      else if (after === "(") cls = "fn";
      else if (word === "console" || word === "document" || word === "Math" || word === "window") cls = "glob";
      push(cls, word);
      i += word.length;
      prevSignificant = "id";
      continue;
    }
    if (!/\s/.test(ch)) prevSignificant = ch;
    push(/[{}()[\];,]/.test(ch) ? "" : /[=+\-*/%<>!&|?:]/.test(ch) ? "op" : "", ch);
    i++;
  }
  return out;
}

/** Jednoduché zvýraznění HTML. */
export function highlightHtml(code) {
  return escapeHtml(code)
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-com">$1</span>')
    .replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="tok-kw">$2</span>')
    .replace(/\s([a-zA-Z-:]+)=(&quot;.*?&quot;)/g, ' <span class="tok-prop">$1</span>=<span class="tok-str">$2</span>');
}

/** Jednoduché zvýraznění CSS. */
export function highlightCss(code) {
  return escapeHtml(code)
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>')
    .replace(/([a-z-]+)(\s*:\s*)([^;{}\n]+)(;)/g, '<span class="tok-prop">$1</span>$2<span class="tok-str">$3</span>$4');
}

export function highlight(code, lang = "js") {
  if (lang === "html") return highlightHtml(code);
  if (lang === "css") return highlightCss(code);
  return highlightJs(code);
}

/** Blok kódu jako element (pre > code), volitelně s čísly řádků. */
export function codeBlock(code, { lang = "js", lineNumbers = false, className = "" } = {}) {
  const pre = h("pre", { class: `code-block ${className}`, dataset: { lang } });
  if (lineNumbers) {
    const lines = highlight(code, lang).split("\n");
    pre.innerHTML = lines
      .map((line, i) => `<span class="code-line"><span class="ln" aria-hidden="true">${i + 1}</span>${line || " "}</span>`)
      .join(""); // řádky jsou display:block, odřádkování by bylo dvojité
  } else {
    pre.innerHTML = `<code>${highlight(code, lang)}</code>`;
  }
  return pre;
}

/* ------------------------------------------------------------------------ */
/* Mini markdown pro texty lekcí                                             */
/* Podporuje: odstavce, **tučné**, *kurzívu*, `kód`, odkazy, seznamy, ###,    */
/* bloky ```js```. Vstup se nejdřív escapuje → bezpečné i pro cizí obsah.    */
/* ------------------------------------------------------------------------ */

export function inlineMd(text) {
  const codes = [];
  const stash = (m, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  };
  // ``kód s `backticky` uvnitř`` i obyčejný `kód`
  let s = escapeHtml(text).replace(/``\s?(.+?)\s?``/g, stash).replace(/`([^`]+)`/g, stash);
  s = s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/==(.+?)==/g, '<mark class="hl">$1</mark>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[i]}</code>`);
}

export function renderMarkdown(md = "") {
  const lines = String(md).replace(/\r/g, "").split("\n");
  let html = "";
  let list = null; // "ul" | "ol"
  let para = [];
  const flushPara = () => {
    if (para.length) html += `<p>${inlineMd(para.join(" "))}</p>`;
    para = [];
  };
  const closeList = () => {
    if (list) html += `</${list}>`;
    list = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      flushPara();
      closeList();
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      html += `<pre class="code-block" data-lang="${fence[1] || "js"}"><code>${highlight(buf.join("\n"), fence[1] || "js")}</code></pre>`;
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = Math.min(heading[1].length + 1, 5);
      html += `<h${level}>${inlineMd(heading[2])}</h${level}>`;
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const type = ul ? "ul" : "ol";
      if (list !== type) {
        closeList();
        html += `<${type}>`;
        list = type;
      }
      html += `<li>${inlineMd((ul || ol)[1])}</li>`;
      continue;
    }
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }
    closeList();
    para.push(line.trim());
  }
  flushPara();
  closeList();
  return html;
}

/* ------------------------------------------------------------------------ */
/* Toasty                                                                    */
/* ------------------------------------------------------------------------ */

export function toast(message, { type = "info", duration = 3200, iconName } = {}) {
  let host = document.getElementById("toasts");
  if (!host) {
    host = h("div", { id: "toasts", class: "toasts", role: "status", "aria-live": "polite" });
    document.body.append(host);
  }
  const iconMap = { info: "info", success: "check", error: "alert", xp: "bolt", badge: "award", streak: "flame" };
  const el = h(
    "div",
    { class: `toast toast-${type}` },
    h("span", { class: "toast-icon", html: icon(iconName || iconMap[type] || "info") }),
    h("span", { class: "toast-text" }, message)
  );
  host.append(el);
  setTimeout(() => {
    el.classList.add("is-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 600);
  }, duration);
  return el;
}

/* ------------------------------------------------------------------------ */
/* Modální okno s pastí na fokus                                             */
/* ------------------------------------------------------------------------ */

/**
 * Otevře modální okno. Vrací objekt { el, close }.
 * @param {{title?: string, content: Node|string, actions?: Array, onClose?: Function, className?: string, dismissable?: boolean}} opts
 */
export function openModal({ title, content, actions = [], onClose, className = "", dismissable = true }) {
  const previouslyFocused = document.activeElement;
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;
  const body = typeof content === "string" ? h("div", { html: content }) : content;
  const footer = actions.length
    ? h(
        "div",
        { class: "modal-actions" },
        actions.map((a) =>
          h(
            "button",
            {
              class: `btn ${a.variant ? `btn-${a.variant}` : ""}`,
              type: "button",
              onclick: () => {
                const keepOpen = a.onClick?.() === false;
                if (!keepOpen) close();
              },
            },
            a.label
          )
        )
      )
    : null;

  const dialog = h(
    "div",
    { class: `modal ${className}`, role: "dialog", "aria-modal": "true", "aria-labelledby": title ? titleId : null },
    dismissable
      ? h("button", { class: "icon-btn modal-close", type: "button", "aria-label": t("common.close"), html: icon("x"), onclick: () => close() })
      : null,
    title ? h("h2", { id: titleId, class: "modal-title" }, title) : null,
    body,
    footer
  );
  const overlay = h("div", { class: "modal-overlay" }, dialog);

  function onKey(e) {
    if (e.key === "Escape" && dismissable) {
      e.preventDefault();
      close();
    }
    if (e.key === "Tab") {
      const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', dialog).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey, true);
    overlay.classList.add("is-leaving");
    setTimeout(() => overlay.remove(), 180);
    previouslyFocused?.focus?.();
    onClose?.();
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && dismissable) close();
  });
  document.addEventListener("keydown", onKey, true);
  document.body.append(overlay);
  requestAnimationFrame(() => {
    const target = dialog.querySelector(".modal-actions .btn-primary, .modal-actions .btn, input, button");
    target?.focus();
  });
  return { el: dialog, close };
}

/** Potvrzovací dialog → Promise<boolean>. */
export function confirmDialog({ title, message, confirmLabel, cancelLabel, danger = false }) {
  return new Promise((resolve) => {
    let result = false;
    openModal({
      title,
      content: h("p", {}, message),
      actions: [
        // Pozor: onClick nesmí vracet false (to by znamenalo „nechat okno otevřené“)
        {
          label: cancelLabel || t("common.cancel"),
          variant: "ghost",
          onClick: () => {
            result = false;
          },
        },
        {
          label: confirmLabel || t("common.confirm"),
          variant: danger ? "danger" : "primary",
          onClick: () => {
            result = true;
          },
        },
      ],
      onClose: () => resolve(result),
    });
  });
}

/* ------------------------------------------------------------------------ */
/* Ostatní                                                                   */
/* ------------------------------------------------------------------------ */

/** Animované přičítání čísla (např. XP na oslavné obrazovce). */
export function countUp(el, from, to, duration = 900) {
  if (document.documentElement.dataset.motion === "reduce" || from === to) {
    el.textContent = String(to);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

/** Zamíchá kopii pole (Fisher–Yates). */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Stáhne textový soubor (export zálohy). */
export function downloadText(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = h("a", { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
