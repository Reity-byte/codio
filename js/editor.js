/**
 * editor.js – obal nad CodeMirror 6 (načítaný z CDN esm.sh).
 *
 * Když se CDN nepodaří načíst (offline, blokace), použije se záložní
 * <textarea> s automatickým odsazením – aplikace tak funguje vždy.
 *
 * API:  const ed = await createEditor(el, { value, language, onChange, onRun });
 *       ed.getValue(); ed.setValue("..."); ed.focus(); ed.destroy();
 */
import { h } from "./ui.js";

const CDN = "https://esm.sh";
const VERSIONS = {
  codemirror: "6.0.1",
  "lang-javascript": "6.2.2",
  "lang-html": "6.4.9",
  "lang-css": "6.3.0",
};

let cmPromise = null;

/** Načte moduly CodeMirroru jednou pro celou aplikaci. */
function loadCodeMirror() {
  if (!cmPromise) {
    const load = Promise.all([
      import(`${CDN}/codemirror@${VERSIONS.codemirror}`),
      import(`${CDN}/@codemirror/lang-javascript@${VERSIONS["lang-javascript"]}`),
      import(`${CDN}/@codemirror/lang-html@${VERSIONS["lang-html"]}`),
      import(`${CDN}/@codemirror/lang-css@${VERSIONS["lang-css"]}`),
      import(`${CDN}/@codemirror/view`),
      import(`${CDN}/@codemirror/state`),
      import(`${CDN}/@codemirror/language`),
      import(`${CDN}/@codemirror/commands`),
      import(`${CDN}/@lezer/highlight`),
    ]).then(([cm, js, html, css, view, state, language, commands, lezer]) => ({
      EditorView: cm.EditorView,
      basicSetup: cm.basicSetup,
      javascript: js.javascript,
      html: html.html,
      css: css.css,
      keymap: view.keymap,
      EditorState: state.EditorState,
      Compartment: state.Compartment,
      HighlightStyle: language.HighlightStyle,
      syntaxHighlighting: language.syntaxHighlighting,
      indentUnit: language.indentUnit,
      indentWithTab: commands.indentWithTab,
      tags: lezer.tags,
    }));
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("CodeMirror timeout")), 8000));
    cmPromise = Promise.race([load, timeout]).catch((err) => {
      console.warn("[editor] CodeMirror se nenačetl, používám záložní editor.", err);
      return null;
    });
  }
  return cmPromise;
}

/** Spustí načítání dopředu (např. na mapě kurzů), ať je editor v lekci hned. */
export function preloadEditor() {
  loadCodeMirror();
}

/** Tmavé "hacker" téma ladící s design tokeny. */
function buildTheme(cm) {
  const { EditorView, HighlightStyle, syntaxHighlighting, tags: tg } = cm;
  const theme = EditorView.theme(
    {
      "&": {
        color: "var(--c-text)",
        backgroundColor: "var(--c-bg-2)",
        fontSize: "15px",
        height: "100%",
      },
      ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.6" },
      ".cm-content": { caretColor: "var(--c-green)", padding: "10px 0" },
      "&.cm-focused .cm-cursor": { borderLeftColor: "var(--c-green)", borderLeftWidth: "2px" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
        backgroundColor: "rgb(46 230 255 / 0.22) !important",
      },
      ".cm-gutters": {
        backgroundColor: "var(--c-bg-2)",
        color: "var(--c-text-dim)",
        border: "none",
        borderRight: "1px solid var(--c-border)",
      },
      ".cm-activeLine": { backgroundColor: "rgb(57 255 159 / 0.04)" },
      ".cm-activeLineGutter": { backgroundColor: "rgb(57 255 159 / 0.08)", color: "var(--c-green)" },
      ".cm-matchingBracket": { backgroundColor: "rgb(57 255 159 / 0.18)", outline: "1px solid var(--c-green-dim)" },
      ".cm-tooltip": { backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border-strong)", color: "var(--c-text)" },
      ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--c-green-a20)", color: "var(--c-text)" },
      ".cm-panels": { backgroundColor: "var(--c-surface)", color: "var(--c-text)" },
      ".cm-foldPlaceholder": { backgroundColor: "var(--c-surface-3)", border: "none", color: "var(--c-text-muted)" },
      ".cm-line.cm-error-line": { backgroundColor: "rgb(255 92 122 / 0.12)" },
    },
    { dark: true }
  );
  const highlight = HighlightStyle.define([
    { tag: [tg.keyword, tg.controlKeyword, tg.definitionKeyword, tg.moduleKeyword], color: "#c77dff" },
    { tag: [tg.string, tg.special(tg.string), tg.regexp], color: "#ffe066" },
    { tag: [tg.number, tg.bool, tg.null, tg.atom], color: "#ffb547" },
    { tag: [tg.comment, tg.lineComment, tg.blockComment], color: "#5d7d76", fontStyle: "italic" },
    { tag: [tg.function(tg.variableName), tg.function(tg.propertyName)], color: "#2ee6ff" },
    { tag: [tg.propertyName], color: "#8fe9ff" },
    { tag: [tg.variableName], color: "#d8f3ec" },
    { tag: [tg.definition(tg.variableName)], color: "#39ff9f" },
    { tag: [tg.operator, tg.punctuation], color: "#8fb3aa" },
    { tag: [tg.tagName], color: "#ff5c7a" },
    { tag: [tg.attributeName], color: "#ffb547" },
    { tag: [tg.className, tg.typeName], color: "#39ff9f" },
  ]);
  return [theme, syntaxHighlighting(highlight)];
}

function languageExt(cm, language) {
  if (language === "html") return cm.html();
  if (language === "css") return cm.css();
  return cm.javascript();
}

/**
 * Vytvoří editor v elementu `parent`.
 * @param {HTMLElement} parent
 * @param {{value?: string, language?: "js"|"html"|"css", onChange?: Function, onRun?: Function, ariaLabel?: string, readOnly?: boolean}} opts
 */
export async function createEditor(parent, { value = "", language = "js", onChange, onRun, ariaLabel = "Editor kódu", readOnly = false } = {}) {
  parent.classList.add("editor-host");
  const loading = h("div", { class: "editor-loading mono" }, "načítám editor…");
  parent.append(loading);
  const cm = await loadCodeMirror();
  loading.remove();
  if (cm) {
    try {
      return createCodeMirror(cm, parent, { value, language, onChange, onRun, ariaLabel, readOnly });
    } catch (err) {
      console.warn("[editor] CodeMirror selhal, používám záložní editor.", err);
    }
  }
  return createFallback(parent, { value, onChange, onRun, ariaLabel, readOnly });
}

function createCodeMirror(cm, parent, { value, language, onChange, onRun, ariaLabel, readOnly }) {
  const { EditorView, EditorState, basicSetup, keymap, indentWithTab, indentUnit } = cm;
  const runKeymap = keymap.of([
    {
      key: "Mod-Enter",
      run: () => {
        onRun?.();
        return true;
      },
    },
    indentWithTab,
  ]);
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: value,
      extensions: [
        runKeymap,
        basicSetup,
        indentUnit.of("  "),
        EditorState.tabSize.of(2),
        languageExt(cm, language),
        ...buildTheme(cm),
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        EditorView.contentAttributes.of({ "aria-label": ariaLabel, spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange?.(u.state.doc.toString());
        }),
      ],
    }),
  });
  return {
    kind: "codemirror",
    getValue: () => view.state.doc.toString(),
    setValue: (text) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } }),
    focus: () => view.focus(),
    /** Zvýrazní řádek s chybou (1-based) a posune na něj. */
    markLine(line) {
      try {
        const l = view.state.doc.line(Math.min(Math.max(1, line), view.state.doc.lines));
        view.dispatch({ selection: { anchor: l.from }, scrollIntoView: true });
      } catch {
        /* nic */
      }
    },
    destroy: () => view.destroy(),
  };
}

/** Záložní editor – textarea s Tabulátorem a automatickým odsazením. */
function createFallback(parent, { value, onChange, onRun, ariaLabel, readOnly }) {
  const ta = h("textarea", {
    class: "editor-fallback",
    spellcheck: "false",
    autocapitalize: "off",
    autocomplete: "off",
    "aria-label": ariaLabel,
    readonly: readOnly,
  });
  ta.value = value;
  ta.addEventListener("input", () => onChange?.(ta.value));
  ta.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun?.();
      return;
    }
    const { selectionStart: s, selectionEnd: end, value: v } = ta;
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      ta.setRangeText("  ", s, end, "end");
      onChange?.(ta.value);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const indent = /^\s*/.exec(v.slice(lineStart, s))[0];
      const extra = /[{([]\s*$/.test(v.slice(lineStart, s)) ? "  " : "";
      ta.setRangeText("\n" + indent + extra, s, end, "end");
      onChange?.(ta.value);
    }
  });
  parent.append(ta);
  return {
    kind: "fallback",
    getValue: () => ta.value,
    setValue: (text) => {
      ta.value = text;
    },
    focus: () => ta.focus(),
    markLine(line) {
      const lines = ta.value.split("\n");
      const pos = lines.slice(0, line - 1).join("\n").length + (line > 1 ? 1 : 0);
      ta.focus();
      ta.setSelectionRange(pos, pos + (lines[line - 1] || "").length);
    },
    destroy: () => ta.remove(),
  };
}
