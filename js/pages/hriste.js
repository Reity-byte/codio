/**
 * Hřiště – volný editor bez zadání a testů.
 * Režim „Konzole“ (Web Worker) nebo „Webová stránka“ (HTML/CSS/JS v iframe).
 * Kód se ukládá do postupu (progress.playground), takže je i v záloze.
 */
import { h, confirmDialog, debounce } from "../ui.js";
import { t, getBundle } from "../i18n.js";
import { icon } from "../icons.js";
import { createEditor } from "../editor.js";
import { runConsole, createPreview } from "../sandbox.js";
import { createConsolePanel } from "../playground.js";
import { getProgress, updateProgress, getSandboxStorage, setSandboxStorage } from "../storage.js";
import { recordCodeRun } from "../gamification.js";

const FILES = [
  { key: "html", label: "index.html", lang: "html" },
  { key: "css", label: "style.css", lang: "css" },
  { key: "js", label: "script.js", lang: "js" },
];
const STORAGE_NS = "hriste";

export default {
  async render(container) {
    const { welcome, examples } = getBundle().playgroundExamples;
    const saved = getProgress().playground || {};
    const isEmpty = !saved.js && !saved.html && !saved.css;
    const state = isEmpty ? { ...welcome } : { mode: "console", ...saved };
    const cleanups = [];

    // ---------- Ovládání ----------
    const modeSwitch = h(
      "div",
      { class: "segmented", role: "radiogroup", "aria-label": t("playgroundPage.title") },
      [
        ["console", t("playgroundPage.modeConsole")],
        ["web", t("playgroundPage.modeWeb")],
      ].map(([val, label]) =>
        h("label", {}, h("input", { type: "radio", name: "hmode", value: val, checked: state.mode === val, onchange: () => setMode(val) }), h("span", {}, label))
      )
    );
    const exampleSelect = h(
      "select",
      { class: "input hriste-select", "aria-label": t("playgroundPage.examples") },
      h("option", { value: "" }, t("playgroundPage.examplesPick")),
      examples.map((ex) => h("option", { value: ex.id }, `${ex.mode === "web" ? "🌐" : "›_"} ${ex.title}`))
    );
    const runBtn = h("button", { class: "btn btn-primary btn-sm", type: "button", title: "Ctrl+Enter" }, h("span", { html: icon("play") }), t("playground.run"));
    const clearBtn = h("button", { class: "btn btn-ghost btn-sm", type: "button" }, h("span", { html: icon("trash") }), t("playgroundPage.clear"));
    const savedEl = h("span", { class: "dim mono hriste-saved", "aria-live": "polite" });

    // ---------- Editor ----------
    const tabButtons = {};
    const editorHosts = {};
    const editors = {};
    let activeFile = "js";
    const fileTabs = h(
      "div",
      { class: "file-tabs", role: "tablist" },
      FILES.map((f) => (tabButtons[f.key] = h("button", { class: "file-tab", type: "button", role: "tab", onclick: () => selectFile(f.key) }, f.label)))
    );
    const editorsWrap = h("div", { class: "editors" }, FILES.map((f) => (editorHosts[f.key] = h("div", { role: "tabpanel" }))));

    // ---------- Výstup ----------
    const consolePanel = createConsolePanel();
    const previewHost = h("div", { class: "preview-host" });
    const previewWrap = h("div", { class: "preview-wrap" }, h("div", { class: "preview-bar mono" }, t("playground.preview")), previewHost);

    const page = h(
      "div",
      { class: "page hriste-page" },
      h("h1", { class: "page-title" }, t("playgroundPage.title")),
      h("p", { class: "page-lead" }, t("playgroundPage.lead")),
      h("div", { class: "hriste-toolbar" }, modeSwitch, exampleSelect, h("span", { class: "spacer" }), savedEl, clearBtn, runBtn),
      h("div", { class: "hriste-layout" }, h("section", { class: "project-editor" }, fileTabs, editorsWrap), h("section", { class: "hriste-output" }, previewWrap, consolePanel.el))
    );
    container.append(page);

    const preview = createPreview(previewHost, {
      title: t("playground.preview"),
      onLog: (m) => consolePanel.log(m),
      onClear: () => consolePanel.clear(),
      onStorage: (data) => setSandboxStorage(STORAGE_NS, data),
    });
    cleanups.push(() => preview.destroy());

    // ---------- Logika ----------
    const persist = debounce(() => {
      updateProgress((p) => (p.playground = { mode: state.mode, js: state.js || "", html: state.html || "", css: state.css || "" }));
      savedEl.textContent = `✓ ${t("playgroundPage.saved")}`;
      setTimeout(() => (savedEl.textContent = ""), 1500);
    }, 500);

    async function run() {
      consolePanel.clear();
      recordCodeRun();
      if (state.mode === "web") {
        const res = await preview.run({ html: state.html, css: state.css, js: state.js, storage: getSandboxStorage(STORAGE_NS) });
        if (res.cancelled) return;
        if (res.error) {
          consolePanel.explain(res.error);
          if (res.error.line) editors.js?.markLine(res.error.line);
        }
      } else {
        consolePanel.setStatus(t("console.running"), "running");
        const res = await runConsole(state.js || "", { onLog: (m) => consolePanel.log(m), onClear: () => consolePanel.clear() });
        if (res.error) {
          consolePanel.explain(res.error);
          if (res.error.line) editors.js.markLine(res.error.line);
          consolePanel.setStatus(t("console.failed"), "error");
        } else {
          consolePanel.setStatus(t("console.doneIn", { ms: res.durationMs }), "ok");
        }
      }
      consolePanel.showEmptyIfNeeded();
    }
    const autoRun = debounce(() => state.mode === "web" && run(), 700);

    function selectFile(key) {
      activeFile = key;
      FILES.forEach((f) => {
        tabButtons[f.key].setAttribute("aria-selected", String(f.key === key));
        editorHosts[f.key].hidden = f.key !== key;
      });
    }

    function setMode(mode) {
      state.mode = mode;
      page.dataset.mode = mode;
      // v režimu konzole je jen script.js
      fileTabs.hidden = mode !== "web";
      previewWrap.hidden = mode !== "web";
      if (mode !== "web") selectFile("js");
      modeSwitch.querySelectorAll("input").forEach((i) => (i.checked = i.value === mode));
      persist();
      run();
    }

    for (const f of FILES) {
      editors[f.key] = await createEditor(editorHosts[f.key], {
        value: state[f.key] || "",
        language: f.lang,
        ariaLabel: f.label,
        onRun: () => run(),
        onChange: (value) => {
          state[f.key] = value;
          persist();
          autoRun();
        },
      });
    }
    cleanups.push(() => Object.values(editors).forEach((e) => e.destroy()));

    function loadFiles(files) {
      FILES.forEach((f) => {
        state[f.key] = files[f.key] ?? state[f.key] ?? "";
        editors[f.key].setValue(state[f.key]);
      });
    }

    exampleSelect.addEventListener("change", async () => {
      const ex = examples.find((e) => e.id === exampleSelect.value);
      exampleSelect.value = "";
      if (!ex) return;
      const hasCode = (state.js || "").trim() || (state.html || "").trim();
      if (hasCode && !(await confirmDialog({ title: ex.title, message: t("playgroundPage.replaceConfirm") }))) return;
      loadFiles({ js: ex.js || "", html: ex.html || "", css: ex.css || "" });
      setMode(ex.mode);
    });

    clearBtn.addEventListener("click", async () => {
      if (!(await confirmDialog({ title: t("playgroundPage.clear"), message: t("playgroundPage.clearConfirm"), danger: true }))) return;
      loadFiles({ js: "", html: "", css: "" });
      setSandboxStorage(STORAGE_NS, {});
      persist();
      consolePanel.clear();
      consolePanel.showEmptyIfNeeded();
      editors.js.focus();
    });
    runBtn.addEventListener("click", () => run());

    setMode(state.mode);
    selectFile(state.mode === "web" ? activeFile : "js");

    return () => cleanups.forEach((fn) => fn());
  },
};
