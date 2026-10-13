/**
 * Úvodní stránka (landing): maskot, efekt psaní, představení, CTA.
 */
import { h } from "../ui.js";
import { t } from "../i18n.js";
import { icon } from "../icons.js";
import { createMascot } from "../mascot.js";
import { mascotLine, getCourses, getProjects } from "../content.js";
import { startMatrixBackground, typewriter, prefersReducedMotion } from "../effects.js";
import { getProgress } from "../storage.js";

export default {
  render(container) {
    const progress = getProgress();
    const returning = progress.xp > 0 || Object.keys(progress.lessons).length > 0;
    const courses = getCourses();
    const lessonCount = courses.reduce((n, c) => n + c.lessons.length, 0);

    const typedLine = h("span", { class: "typed-text" });
    const terminal = h(
      "div",
      { class: "hero-terminal scanlines", "aria-hidden": "true" },
      h("div", { class: "hero-terminal-bar" }, h("i"), h("i"), h("i"), h("span", {}, "~/codio")),
      h("div", { class: "hero-terminal-body mono" }, h("span", { class: "text-green" }, "$ "), typedLine, h("span", { class: "term-cursor" }, "▍"))
    );

    const mascot = createMascot({ size: 230, mood: "wave", bubble: "top", followPointer: true });

    const page = h(
      "div",
      { class: "page landing" },
      h(
        "section",
        { class: "hero" },
        h(
          "div",
          { class: "hero-text" },
          terminal,
          h("h1", { class: "hero-title" }, t("landing.title"), h("span", { class: "glow-text" }, ".")),
          h("p", { class: "hero-lead" }, t("landing.lead")),
          h(
            "div",
            { class: "row hero-cta" },
            h("a", { class: "btn btn-primary btn-lg", href: "#/mapa" }, returning ? t("landing.ctaContinue") : t("landing.cta"), h("span", { html: icon("arrowRight") })),
            h("a", { class: "btn btn-ghost btn-lg", href: "#/projekty" }, t("landing.secondary"))
          ),
          h("p", { class: "hero-stats mono dim" }, t("landing.stats", { courses: courses.length, lessons: lessonCount, projects: getProjects().length }))
        ),
        h("div", { class: "hero-mascot" }, mascot.el)
      ),
      h(
        "section",
        { class: "features stagger", "aria-label": "Co tě čeká" },
        t("landing.features").map((f) =>
          h("article", { class: "card feature-card" }, h("span", { class: "feature-icon", html: icon(f.icon) }), h("h2", { class: "card-title" }, f.title), h("p", { class: "muted" }, f.text))
        )
      )
    );
    container.append(page);

    setTimeout(() => mascot.say(mascotLine("landing")), 400);

    // Cyklické psaní ukázek kódu v terminálu
    const lines = t("landing.typed");
    let alive = true;
    let current = null;
    (async () => {
      let i = 0;
      while (alive) {
        current = typewriter(typedLine, lines[i % lines.length], { speed: 55 });
        await current.done;
        await new Promise((r) => setTimeout(r, prefersReducedMotion() ? 4000 : 1800));
        i++;
      }
    })();

    const stopMatrix = startMatrixBackground(document.getElementById("bg-canvas"));
    return () => {
      alive = false;
      current?.cancel();
      stopMatrix();
    };
  },
};
