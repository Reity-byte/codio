/**
 * playground.js – znovupoužitelné komponenty pro práci s kódem:
 *   createConsolePanel() – terminálový panel výstupu (logy, chyby, testy)
 *   createPlayground()   – editor + tlačítka Spustit/Resetovat/Nápověda + výstup
 *                          (režim "console" = Worker, "dom" = iframe s náhledem)
 */
import { h, renderMarkdown, codeBlock, $ } from "./ui.js";
import { icon } from "./icons.js";
import { t } from "./i18n.js";
import { createEditor } from "./editor.js";
import { runConsole, createPreview } from "./sandbox.js";
import { explainError } from "./errors.js";
import { recordCodeRun } from "./gamification.js";
import { getMascotInfo } from "./content.js";

/* ------------------------------------------------------------------------ */
/* Panel výstupu                                                             */
/* ------------------------------------------------------------------------ */

export function createConsolePanel({ title = t("console.title") } = {}) {
  const body = h("div", { class: "console-body", role: "log", "aria-live": "polite", "aria-label": title });
  const status = h("span", { class: "console-status" });
  const el = h(
    "section",
    { class: "console-panel scanlines" },
    h(
      "header",
      { class: "console-header" },
      h("span", { class: "console-dots", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
      h("span", { class: "console-title" }, title),
      status,
      h("button", { class: "icon-btn console-clear", type: "button", "aria-label": t("console.clear"), title: t("console.clear"), html: icon("trash"), onclick: () => api.clear() })
    ),
    body
  );
  const placeholder = () => body.append(h("div", { class: "console-empty" }, t("console.empty")));
  placeholder();

  const api = {
    el,
    clear() {
      body.replaceChildren();
      status.textContent = "";
      status.className = "console-status";
    },
    log({ level = "log", text }) {
      body.querySelector(".console-empty")?.remove();
      const prefix = { error: "✖", warn: "⚠", info: "ℹ" }[level] || "›";
      body.append(h("div", { class: `console-line console-${level}` }, h("span", { class: "console-prefix", "aria-hidden": "true" }, prefix), h("span", { class: "console-text" }, text)));
      body.scrollTop = body.scrollHeight;
    },
    /** Lidské vysvětlení chyby hlasem maskota. */
    explain(error) {
      const text = explainError(error);
      if (!text) return;
      body.append(
        h(
          "div",
          { class: "console-explain" },
          h("div", { class: "console-explain-who mono" }, `${getMascotInfo().name} ${t("console.says")}`),
          h("div", { class: "console-explain-text", html: renderMarkdown(text) })
        )
      );
      body.scrollTop = body.scrollHeight;
    },
    setStatus(text, kind = "") {
      status.textContent = text;
      status.className = `console-status ${kind ? `is-${kind}` : ""}`;
    },
    showEmptyIfNeeded() {
      if (!body.children.length) placeholder();
    },
  };
  return api;
}

/** Seznam výsledků testů. */
export function renderTestResults(results) {
  const passed = results.filter((r) => r.passed).length;
  return h(
    "div",
    { class: "test-results" },
    h("div", { class: `test-summary ${passed === results.length ? "is-pass" : "is-fail"}` }, t("tests.summary", { passed, total: results.length })),
    h(
      "ul",
      { class: "test-list" },
      results.map((r) =>
        h(
          "li",
          { class: `test-item ${r.passed ? "is-pass" : "is-fail"}` },
          h("span", { class: "test-icon", html: icon(r.passed ? "check" : "x") }),
          h("span", { class: "test-name" }, r.name, r.message ? h("span", { class: "test-msg" }, r.message) : null),
          h("span", { class: "sr-only" }, r.passed ? t("tests.passed") : t("tests.failed"))
        )
      )
    )
  );
}

/* ------------------------------------------------------------------------ */
/* Playground                                                                */
/* ------------------------------------------------------------------------ */

/**
 * @param {HTMLElement} container
 * @param {object} opts
 * @param {string} opts.code              počáteční JS kód
 * @param {"console"|"dom"} [opts.mode]
 * @param {string} [opts.html]            HTML pro režim dom (needitovatelné)
 * @param {string} [opts.css]
 * @param {Array}  [opts.tests]           testy (spouští se tlačítkem "Zkontrolovat" přes check())
 * @param {Function} [opts.onHint]        zobrazí tlačítko Nápověda
 * @param {boolean} [opts.autoRun]        spustit hned po vytvoření
 */
export async function createPlayground(container, { code = "", mode = "console", html = "", css = "", onHint, autoRun = false, label } = {}) {
  const initial = code;
  const editorHost = h("div", { class: "playground-editor" });
  const consolePanel = createConsolePanel();
  const previewHost = mode === "dom" ? h("div", { class: "preview-host" }) : null;

  const runBtn = h("button", { class: "btn btn-primary btn-sm", type: "button", title: "Ctrl+Enter" }, h("span", { html: icon("play") }), t("playground.run"));
  const resetBtn = h("button", { class: "btn btn-ghost btn-sm", type: "button" }, h("span", { html: icon("reset") }), t("playground.reset"));
  const hintBtn = onHint ? h("button", { class: "btn btn-ghost btn-sm", type: "button" }, h("span", { html: icon("bulb") }), t("playground.hint")) : null;

  const toolbar = h(
    "div",
    { class: "playground-toolbar" },
    h("span", { class: "playground-label mono" }, h("span", { html: icon("terminal") }), label || (mode === "dom" ? "script.js" : "main.js")),
    h("span", { class: "spacer" }),
    hintBtn,
    resetBtn,
    runBtn
  );

  const htmlView =
    mode === "dom" && html
      ? h("details", { class: "playground-html" }, h("summary", { class: "mono" }, t("playground.showHtml")), codeBlock(html.trim(), { lang: "html" }))
      : null;

  // Výsledky testů mají vlastní panel – „Spustit“ je nesmaže
  const testsHost = h("div", { class: "tests-host", "aria-live": "polite" });

  const el = h(
    "div",
    { class: `playground playground-${mode}` },
    toolbar,
    htmlView,
    h("div", { class: "playground-body" }, editorHost, h("div", { class: "playground-output" }, previewHost ? h("div", { class: "preview-wrap" }, h("div", { class: "preview-bar mono" }, t("playground.preview")), previewHost) : null, consolePanel.el, testsHost))
  );
  container.append(el);

  let preview = null;
  if (mode === "dom") {
    preview = createPreview(previewHost, {
      onLog: (m) => consolePanel.log(m),
      onClear: () => consolePanel.clear(),
      title: t("playground.preview"),
    });
  }

  let running = false;
  const editor = await createEditor(editorHost, { value: code, language: "js", onRun: () => api.run() });

  /** Spustí kód (volitelně s testy). Vrací výsledek běhu. */
  async function execute(tests = []) {
    if (running) return null;
    running = true;
    runBtn.disabled = true;
    consolePanel.clear();
    consolePanel.setStatus(t("console.running"), "running");
    recordCodeRun();
    const source = editor.getValue();
    let result;
    if (mode === "dom") {
      result = await preview.run({ html, css, js: source, tests });
    } else {
      result = await runConsole(source, { tests, onLog: (m) => consolePanel.log(m), onClear: () => consolePanel.clear() });
    }
    if (result.error) {
      consolePanel.explain(result.error);
      if (result.error.line) editor.markLine(result.error.line);
      consolePanel.setStatus(t("console.failed"), "error");
    } else if (result.timedOut) {
      consolePanel.setStatus(t("console.stopped"), "error");
    } else {
      consolePanel.setStatus(result.durationMs != null ? t("console.doneIn", { ms: result.durationMs }) : t("console.done"), "ok");
    }
    consolePanel.showEmptyIfNeeded();
    running = false;
    runBtn.disabled = false;
    return result;
  }

  const api = {
    el,
    editor,
    console: consolePanel,
    getCode: () => editor.getValue(),
    setCode: (c) => editor.setValue(c),
    run: () => execute(),
    /** Spustí kód s testy a vykreslí jejich výsledky do panelu. */
    async check(tests) {
      const result = await execute(tests);
      if (result && result.tests.length) {
        testsHost.replaceChildren(h("p", { class: "tests-host-title mono" }, t("tests.lastCheck")), renderTestResults(result.tests));
      }
      return result;
    },
    reset() {
      editor.setValue(initial);
      consolePanel.clear();
      testsHost.replaceChildren();
      consolePanel.showEmptyIfNeeded();
      editor.focus();
    },
    destroy() {
      editor.destroy();
      preview?.destroy();
      el.remove();
    },
  };

  runBtn.addEventListener("click", () => api.run());
  resetBtn.addEventListener("click", () => api.reset());
  hintBtn?.addEventListener("click", () => onHint());
  // DOM režim se spustí hned, ať je v náhledu vidět stránka
  if (autoRun || mode === "dom") api.run();
  return api;
}
