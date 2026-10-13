/**
 * Seznam mini projektů.
 */
import { h } from "../ui.js";
import { t } from "../i18n.js";
import { icon } from "../icons.js";
import { createMascot } from "../mascot.js";
import { getProjects, getCourse, mascotLine } from "../content.js";
import { getProjectState } from "../gamification.js";

export default {
  render(container) {
    const mascot = createMascot({ size: 96, mood: "happy", bubble: "right" });
    const cards = getProjects().map((project) => {
      const state = getProjectState(project.id);
      const total = project.steps.length;
      const done = state.completed ? total : state.step;
      const course = project.recommendedAfter ? getCourse(project.recommendedAfter) : null;
      const label = state.completed ? t("projects.review") : done > 0 ? t("projects.continue") : t("projects.start");
      return h(
        "a",
        { class: `card card-interactive project-card color-${project.color || "green"} ${state.completed ? "is-done" : ""}`, href: `#/projekt/${project.id}` },
        h("div", { class: "project-thumb", html: icon(project.icon || "code") }),
        h("h2", { class: "card-title" }, project.title),
        h("p", { class: "muted" }, project.description),
        h(
          "div",
          { class: "project-meta" },
          h("span", { class: "tag" }, t(`projects.difficulty.${project.difficulty || 1}`)),
          h("span", { class: "tag" }, t("projects.steps", { n: total })),
          state.completed ? h("span", { class: "tag tag-green" }, h("span", { html: icon("award") }), t("projects.finished")) : null
        ),
        course ? h("p", { class: "dim mono", style: { fontSize: "var(--fs-xs)", margin: 0 } }, t("projects.recommended", { course: course.title })) : null,
        h("div", { class: "progress progress-sm", "aria-hidden": "true" }, h("div", { class: "progress-fill", style: { width: `${(done / total) * 100}%` } })),
        h("span", { class: `btn btn-sm ${state.completed ? "btn-ghost" : "btn-primary"}` }, label, h("span", { html: icon("arrowRight") }))
      );
    });

    container.append(
      h(
        "div",
        { class: "page" },
        h("div", { class: "row", style: { justifyContent: "space-between", alignItems: "flex-start" } }, h("div", {}, h("h1", { class: "page-title" }, t("projects.title")), h("p", { class: "page-lead" }, t("projects.lead"))), mascot.el),
        h("div", { class: "projects-grid stagger" }, cards)
      )
    );
    mascot.say(mascotLine("projectsIntro"));
  },
};
