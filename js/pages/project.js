/**
 * Detail projektu: kroky se zadáním, editor (HTML/CSS/JS), živý náhled,
 * konzole a kontrola kroku automatickými testy. Na konci odznak.
 */
import { h, renderMarkdown, codeBlock, openModal, confirmDialog, toast, debounce } from "../ui.js";
import { t } from "../i18n.js";
import { icon } from "../icons.js";
import { createMascot } from "../mascot.js";
import { getProject, mascotLine } from "../content.js";
import { createEditor } from "../editor.js";
import { createPreview } from "../sandbox.js";
import { createConsolePanel, renderTestResults } from "../playground.js";
import { getSandboxStorage, setSandboxStorage } from "../storage.js";
import * as game from "../gamification.js";
import { playSound, celebrate } from "../effects.js";

const FILES = [
  { key: "html", label: "index.html", lang: "html" },
  { key: "css", label: "style.css", lang: "css" },
  { key: "js", label: "script.js", lang: "js" },
];

/** Soubory na začátku kroku = výchozí soubory + řešení všech předchozích kroků. */
function filesAtStep(project, stepIndex) {
  return project.steps.slice(0, stepIndex).reduce((acc, s) => ({ ...acc, ...(s.solution || {}) }), { ...project.starter });
}

export default {
  async render(container, { id }) {
    const project = getProject(id);
    if (!project) {
      return (await import("./not-found.js")).default.render(container, { path: `/projekt/${id}` });
    }
    const cleanups = [];
    const storageNs = `project:${project.id}`;
    const saved = game.getProjectState(project.id);
    let files = saved.files ? { ...project.starter, ...saved.files } : { ...project.starter };
    let reached = Math.min(saved.step, project.steps.length - 1); // nejvyšší dostupný krok
    let current = reached;
    let testing = false;
    let autoRun = true;

    // ---------- Panely ----------
    const consolePanel = createConsolePanel();
    // výsledky kontroly kroku – samostatně, aby je obnovení náhledu nesmazalo
    const testsHost = h("div", { class: "tests-host", "aria-live": "polite" });
    const previewHost = h("div", { class: "preview-host" });
    const mascot = createMascot({ size: 72, mood: "happy", bubble: "right" });
    const stepBody = h("div", { class: "step-card" });
    const stepDots = h("ol", { class: "step-list", "aria-label": t("projects.tabSteps") });

    const checkBtn = h("button", { class: "btn btn-primary btn-block", type: "button" }, h("span", { html: icon("check") }), t("projects.check"));
    const hintBtn = h("button", { class: "btn btn-ghost btn-sm", type: "button" }, h("span", { html: icon("bulb") }), t("projects.hint"));
    const finalBtn = h("button", { class: "btn btn-ghost btn-sm", type: "button" }, h("span", { html: icon("eye") }), t("projects.showFinal"));
    const prevBtn = h("button", { class: "btn btn-ghost btn-sm", type: "button" }, h("span", { html: icon("arrowLeft") }), t("projects.prev"));
    const nextBtn = h("button", { class: "btn btn-secondary btn-sm", type: "button" }, t("projects.next"), h("span", { html: icon("arrowRight") }));

    const stepsPanel = h(
      "aside",
      { class: "card project-steps", "aria-label": t("projects.instructions") },
      mascot.el,
      stepDots,
      stepBody,
      checkBtn,
      h("div", { class: "step-nav" }, prevBtn, nextBtn),
      h("div", { class: "step-nav" }, hintBtn, finalBtn)
    );

    // Editor se záložkami souborů
    const tabButtons = [];
    const editorHosts = {};
    const editors = {};
    let activeFile = "js";
    const fileTabs = h(
      "div",
      { class: "file-tabs", role: "tablist", "aria-label": t("projects.files") },
      FILES.map((f) => {
        const btn = h("button", { class: "file-tab", type: "button", role: "tab", "aria-selected": String(f.key === activeFile), id: `tab-${f.key}`, onclick: () => selectFile(f.key) }, f.label);
        tabButtons.push(btn);
        return btn;
      })
    );
    const editorsWrap = h(
      "div",
      { class: "editors" },
      FILES.map((f) => {
        const host = h("div", { role: "tabpanel", "aria-labelledby": `tab-${f.key}`, hidden: f.key !== activeFile });
        editorHosts[f.key] = host;
        return host;
      })
    );
    const runBtn = h("button", { class: "btn btn-primary btn-sm", type: "button", title: "Ctrl+Enter" }, h("span", { html: icon("play") }), t("playground.run"));
    const resetBtn = h("button", { class: "btn btn-ghost btn-sm", type: "button" }, h("span", { html: icon("reset") }), t("projects.resetStep"));
    const autoSwitch = h(
      "label",
      { class: "switch mono", style: { fontSize: "var(--fs-sm)" } },
      h("input", { type: "checkbox", checked: true, onchange: (e) => (autoRun = e.target.checked) }),
      h("span", { class: "switch-track", "aria-hidden": "true" }),
      t("projects.autoRun")
    );
    const editorPanel = h("section", { class: "project-editor", "aria-label": t("projects.tabCode") }, fileTabs, editorsWrap, h("div", { class: "editor-actions" }, runBtn, resetBtn, h("span", { class: "spacer" }), autoSwitch));

    const outputPanel = h(
      "section",
      { class: "project-output", "aria-label": t("projects.livePreview") },
      h("div", { class: "preview-wrap" }, h("div", { class: "preview-bar mono" }, t("projects.livePreview")), previewHost),
      testsHost,
      consolePanel.el
    );

    const layout = h("div", { class: "project-layout", dataset: { tab: "steps" } }, stepsPanel, editorPanel, outputPanel);
    const mobileTabs = h(
      "div",
      { class: "project-tabs segmented", role: "tablist" },
      [
        ["steps", t("projects.tabSteps")],
        ["code", t("projects.tabCode")],
        ["preview", t("projects.tabPreview")],
      ].map(([key, label]) =>
        h("label", {}, h("input", { type: "radio", name: "ptab", value: key, checked: key === "steps", onchange: () => setMobileTab(key) }), h("span", {}, label))
      )
    );
    function setMobileTab(key) {
      layout.dataset.tab = key;
      mobileTabs.querySelectorAll("input").forEach((i) => (i.checked = i.value === key));
    }

    const badgeTag = h("span", { class: `tag color-${project.badge.color || "purple"}`, style: { color: "var(--badge-color)", borderColor: "var(--badge-color)" } }, h("span", { html: icon(project.badge.icon || "trophy") }), project.badge.name);
    container.append(
      h(
        "div",
        { class: "page project-page" },
        h(
          "div",
          { class: "project-head" },
          h("a", { class: "btn btn-ghost btn-sm", href: "#/projekty" }, h("span", { html: icon("arrowLeft") }), t("projects.backToList")),
          h("h1", {}, project.title),
          h("span", { class: "tag" }, t(`projects.difficulty.${project.difficulty || 1}`)),
          badgeTag
        ),
        mobileTabs,
        layout
      )
    );

    // ---------- Náhled ----------
    const preview = createPreview(previewHost, {
      title: t("projects.livePreview"),
      onLog: (m) => consolePanel.log(m),
      onClear: () => consolePanel.clear(),
      onStorage: (data) => {
        if (!testing) setSandboxStorage(storageNs, data);
      },
    });
    cleanups.push(() => preview.destroy());

    async function runPreview() {
      if (testing) return;
      consolePanel.clear();
      const result = await preview.run({ ...files, storage: getSandboxStorage(storageNs) });
      if (result.cancelled) return;
      if (result.error) consolePanel.explain(result.error);
      consolePanel.showEmptyIfNeeded();
      game.recordCodeRun();
    }
    const autoRunPreview = debounce(() => autoRun && runPreview(), 700);
    const persist = debounce(() => game.saveProjectFiles(project.id, files), 400);

    // ---------- Editory ----------
    for (const f of FILES) {
      editors[f.key] = await createEditor(editorHosts[f.key], {
        value: files[f.key] || "",
        language: f.lang,
        ariaLabel: `${f.label} – ${t("projects.tabCode")}`,
        onRun: () => runPreview(),
        onChange: (value) => {
          files[f.key] = value;
          persist();
          autoRunPreview();
        },
      });
    }
    cleanups.push(() => Object.values(editors).forEach((e) => e.destroy()));

    function selectFile(key) {
      activeFile = key;
      tabButtons.forEach((b, i) => b.setAttribute("aria-selected", String(FILES[i].key === key)));
      FILES.forEach((f) => (editorHosts[f.key].hidden = f.key !== key));
      editors[key]?.focus();
    }

    function setAllEditors(newFiles) {
      files = { ...newFiles };
      FILES.forEach((f) => editors[f.key].setValue(files[f.key] || ""));
      game.saveProjectFiles(project.id, files);
      runPreview();
    }

    // ---------- Kroky ----------
    function renderStep() {
      const step = project.steps[current];
      const state = game.getProjectState(project.id);
      stepDots.replaceChildren(
        ...project.steps.map((s, i) => {
          const done = i < state.step || state.completed;
          return h(
            "li",
            {},
            h(
              "button",
              {
                class: `step-dot ${done ? "is-done" : ""} ${i === current ? "is-active" : ""}`,
                type: "button",
                disabled: i > reached,
                "aria-current": i === current ? "step" : null,
                "aria-label": `${t("projects.stepOf", { n: i + 1, total: project.steps.length })}: ${s.title}`,
                onclick: () => {
                  current = i;
                  renderStep();
                },
              },
              done ? h("span", { html: icon("check", { size: 16 }) }) : String(i + 1)
            )
          );
        })
      );
      stepBody.replaceChildren(
        h("p", { class: "lesson-kicker mono" }, t("projects.stepOf", { n: current + 1, total: project.steps.length })),
        h("h2", {}, step.title),
        h("div", { class: "prose", html: renderMarkdown(step.instructions) })
      );
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= reached;
      const stepDone = current < state.step || state.completed;
      checkBtn.classList.toggle("btn-ghost", stepDone);
      checkBtn.classList.toggle("btn-primary", !stepDone);
    }

    prevBtn.addEventListener("click", () => {
      current = Math.max(0, current - 1);
      renderStep();
    });
    nextBtn.addEventListener("click", () => {
      current = Math.min(reached, current + 1);
      renderStep();
    });

    hintBtn.addEventListener("click", () => {
      const step = project.steps[current];
      const content = h(
        "div",
        { class: "stack" },
        h("div", { class: "prose", html: renderMarkdown(step.hint || "") }),
        h("details", {}, h("summary", { class: "mono text-cyan", style: { cursor: "pointer" } }, t("lesson.showSolution")), codeBlock(step.solution?.js || "", { lineNumbers: true }))
      );
      game.recordHint();
      openModal({
        title: t("projects.hint"),
        className: "modal-wide",
        content,
        actions: [
          { label: t("common.close"), variant: "ghost" },
          {
            label: t("lesson.useSolution"),
            variant: "secondary",
            onClick: () => {
              setAllEditors({ ...files, ...(step.solution || {}) });
            },
          },
        ],
      });
    });

    finalBtn.addEventListener("click", () => {
      const host = h("div", { class: "preview-wrap" });
      const modal = openModal({
        title: `${t("projects.preview")}: ${project.title}`,
        className: "modal-wide",
        content: host,
        onClose: () => finalPreview.destroy(),
      });
      const finalPreview = createPreview(host, { title: t("projects.preview") });
      finalPreview.run({ ...project.final, storage: {} });
      void modal;
    });

    resetBtn.addEventListener("click", async () => {
      const ok = await confirmDialog({ title: t("projects.resetStep"), message: t("projects.resetConfirm"), danger: true });
      if (ok) setAllEditors(filesAtStep(project, current));
    });

    runBtn.addEventListener("click", () => runPreview());

    checkBtn.addEventListener("click", async () => {
      const step = project.steps[current];
      checkBtn.disabled = true;
      testing = true;
      // Na mobilu ukázat náhled – skrytý iframe by měl zpomalené časovače
      if (window.matchMedia("(max-width: 760px)").matches) setMobileTab("preview");
      consolePanel.clear();
      consolePanel.setStatus(t("console.running"), "running");
      const result = await preview.run({ ...files, tests: step.tests, storage: step.testStorage || {} });
      testing = false;
      checkBtn.disabled = false;
      if (result.cancelled) return;
      if (result.error) consolePanel.explain(result.error);
      consolePanel.showEmptyIfNeeded();
      testsHost.replaceChildren(
        h("p", { class: "tests-host-title mono" }, `${t("tests.lastCheck")} · ${t("projects.stepOf", { n: current + 1, total: project.steps.length })}`),
        renderTestResults(result.tests)
      );

      if (result.passed) {
        consolePanel.setStatus(t("projects.stepDone"), "ok");
        playSound("correct");
        const newlyCompleted = game.completeProjectStep(project.id, current, project.steps.length);
        reached = Math.min(Math.max(reached, current + 1), project.steps.length - 1);
        if (newlyCompleted) {
          projectCompleted();
        } else {
          mascot.say(mascotLine("projectStep"), { mood: "happy", duration: 2500 });
          toast(`${t("projects.stepDone")} +${game.XP_RULES.projectStep} XP`, { type: "xp" });
          if (current < project.steps.length - 1) current++;
        }
        renderStep();
      } else {
        consolePanel.setStatus(t("console.failed"), "error");
        playSound("wrong");
        mascot.say(result.error ? mascotLine("codeError") : mascotLine("testsFailed"), { mood: "think", duration: 3000 });
      }
    });

    function projectCompleted() {
      playSound("complete");
      celebrate();
      mascot.say(mascotLine("projectDone"), { mood: "excited" });
      const m = createMascot({ size: 120, mood: "excited", bubble: "none", interactive: false });
      openModal({
        title: t("projects.completeTitle"),
        content: h(
          "div",
          { class: "lesson-complete" },
          m.el,
          h("div", { class: `badge-chip color-${project.badge.color || "purple"} anim-pop` }, h("span", { class: "badge-icon", html: icon(project.badge.icon || "trophy") }), h("span", { class: "badge-name" }, project.badge.name)),
          h("p", {}, t("projects.completeText", { badge: project.badge.name })),
          h("p", { class: "text-xp mono" }, `+${game.XP_RULES.projectStep + game.XP_RULES.projectComplete} XP`)
        ),
        actions: [
          { label: t("projects.backToList"), variant: "ghost", onClick: () => (location.hash = "#/projekty") },
          { label: t("common.continue"), variant: "primary" },
        ],
      });
    }

    renderStep();
    mascot.say(saved.step > 0 || saved.completed ? mascotLine("welcome", { name: "" }) : mascotLine("projectStart"));
    setTimeout(() => mascot.setMood("neutral"), 2500);
    runPreview();

    return () => cleanups.forEach((fn) => fn());
  },
};
