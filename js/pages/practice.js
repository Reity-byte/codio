/**
 * Procvičování – přehled: opakování chyb, procvičovací mix a odkaz na Hřiště.
 */
import { h } from "../ui.js";
import { t } from "../i18n.js";
import { icon } from "../icons.js";
import { createMascot } from "../mascot.js";
import { mascotLine } from "../content.js";
import { reviewSummary } from "../gamification.js";
import { canPractice } from "../practice.js";

export default {
  render(container) {
    const summary = reviewSummary();
    const practiceOk = canPractice();
    const mascot = createMascot({ size: 96, mood: summary.due ? "think" : "happy", bubble: "right" });

    const reviewCard = h(
      "article",
      { class: "card practice-card" },
      h("span", { class: "practice-icon color-orange", html: icon("reset") }),
      h("h2", { class: "card-title" }, t("practice.reviewTitle")),
      h("p", { class: "muted" }, t("practice.reviewText")),
      h("p", { class: "practice-due mono" }, t("practice.reviewDue", { n: summary.due })),
      summary.total ? h("p", { class: "dim mono practice-later" }, t("practice.reviewLater", { tomorrow: summary.tomorrow, later: summary.later })) : null,
      summary.due
        ? h("a", { class: "btn btn-primary btn-block", href: "#/procvicovani/chyby" }, t("practice.reviewStart", { n: summary.due }), h("span", { html: icon("arrowRight") }))
        : h("p", { class: "practice-none" }, h("span", { html: icon("check") }), t("practice.reviewNone"))
    );

    const mixCard = h(
      "article",
      { class: "card practice-card" },
      h("span", { class: "practice-icon color-cyan", html: icon("sparkles") }),
      h("h2", { class: "card-title" }, t("practice.mixTitle")),
      h("p", { class: "muted" }, t("practice.mixText")),
      practiceOk
        ? h("a", { class: "btn btn-secondary btn-block", href: "#/procvicovani/mix" }, t("practice.mixStart"), h("span", { html: icon("arrowRight") }))
        : h("p", { class: "practice-none dim" }, h("span", { html: icon("lock") }), t("practice.mixLocked"))
    );

    const playgroundCard = h(
      "article",
      { class: "card practice-card" },
      h("span", { class: "practice-icon color-purple", html: icon("terminal") }),
      h("h2", { class: "card-title" }, t("practice.playgroundTitle")),
      h("p", { class: "muted" }, t("practice.playgroundText")),
      h("a", { class: "btn btn-ghost btn-block", href: "#/hriste" }, t("practice.playgroundOpen"), h("span", { html: icon("arrowRight") }))
    );

    container.append(
      h(
        "div",
        { class: "page" },
        h(
          "div",
          { class: "row", style: { justifyContent: "space-between", alignItems: "flex-start" } },
          h("div", {}, h("h1", { class: "page-title" }, t("practice.title")), h("p", { class: "page-lead" }, t("practice.lead"))),
          mascot.el
        ),
        h("div", { class: "practice-grid stagger" }, reviewCard, mixCard, playgroundCard)
      )
    );
    mascot.say(summary.due ? t("practice.mapCard", { n: summary.due }) : mascotLine("practice"));
  },
};
