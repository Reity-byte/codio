/**
 * Cvičení "Napiš kód" – editor + automatické testy.
 *
 * Data:
 * {
 *   type: "code", prompt, starter: "…", solution: "…",
 *   mode?: "console" | "dom", html?, css?,
 *   tests: [
 *     { name, type: "output", expected: "řádek\nřádek" | [..], contains?: true },
 *     { name, type: "call",   expr: "secti(2, 3)", expected: 5 },
 *     { name, type: "check",  code: "return typeof vek === 'number';" },
 *     { name, type: "source", pattern: "for\\s*\\(", message?: "…", mustNot?: false }
 *   ]
 * }
 */
import { h, codeBlock, openModal } from "../ui.js";
import { t } from "../i18n.js";
import { icon } from "../icons.js";
import { createPlayground } from "../playground.js";
import { promptBlock } from "./simple.js";

export function createCode(def, ctx) {
  const host = h("div", { class: "code-exercise-host" });
  const testsPreview = h(
    "ul",
    { class: "tests-preview" },
    def.tests.map((test) => h("li", { class: "mono" }, h("span", { html: icon("target") }), test.name))
  );
  const el = h(
    "div",
    { class: "exercise exercise-code" },
    promptBlock(def),
    h("details", { class: "tests-details", open: true }, h("summary", { class: "mono" }, t("lesson.runTests")), testsPreview),
    host
  );

  let playground = null;
  const ready = createPlayground(host, {
    code: def.starter || "",
    mode: def.mode || "console",
    html: def.html || "",
    css: def.css || "",
  }).then((pg) => {
    playground = pg;
    ctx.onReadyChange();
    return pg;
  });

  const api = {
    el,
    retryable: true, // špatná odpověď nekončí cvičení – uživatel opravuje kód
    canCheck: () => !!playground,
    async check() {
      const pg = await ready;
      const result = await pg.check(def.tests);
      if (!result) return { correct: false };
      return { correct: result.passed, tests: result.tests, error: result.error };
    },
    /** Zobrazí ukázkové řešení s možností vložit ho do editoru. */
    showSolution(onUsed) {
      openModal({
        title: t("lesson.solutionTitle"),
        className: "modal-wide",
        content: h("div", {}, codeBlock(def.solution || "", { lang: "js", lineNumbers: true })),
        actions: [
          { label: t("common.close"), variant: "ghost" },
          {
            label: t("lesson.useSolution"),
            variant: "primary",
            onClick: () => {
              playground?.setCode(def.solution || "");
              onUsed?.();
            },
          },
        ],
      });
    },
    focus: () => playground?.editor.focus(),
    destroy: () => playground?.destroy(),
  };
  return api;
}
