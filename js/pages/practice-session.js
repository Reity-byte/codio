/**
 * Procvičovací sezení: #/procvicovani/chyby (jen opakování) nebo #/procvicovani/mix.
 * Používá stejný průběh jako lekce (js/session.js), ale bez srdíček a výkladu.
 */
import { h } from "../ui.js";
import { t } from "../i18n.js";
import { createMascot } from "../mascot.js";
import { mascotLine } from "../content.js";
import { buildPracticeSet } from "../practice.js";
import { runSession } from "../session.js";
import * as game from "../gamification.js";

export default {
  focusMode: true,
  async render(container, { druh }) {
    // "?…" za druhem jen vynutí nové sezení při kliknutí na „Znovu“
    const kind = druh.split("?")[0] === "chyby" ? "chyby" : "mix";
    const items = buildPracticeSet(kind);

    if (!items.length) {
      const m = createMascot({ size: 150, mood: "think", bubble: "top" });
      container.append(
        h(
          "div",
          { class: "page empty-state" },
          m.el,
          h("h1", {}, t("practice.emptyTitle")),
          h("p", { class: "muted" }, t("practice.emptyText")),
          h("a", { class: "btn btn-primary", href: "#/mapa" }, t("lesson.toMap"))
        )
      );
      m.say(t("practice.emptyText"));
      return;
    }

    return runSession(container, {
      mode: "practice",
      title: t("practice.sessionTitle", { kind }),
      kicker: t("practice.kicker"),
      items,
      hearts: false, // procvičování srdíčka neubírá
      closeHref: "#/procvicovani",
      onFinish: ({ mistakes }) => {
        const result = game.completePractice();
        const remaining = game.dueReviews().length;
        const notes = [];
        if (result.heartRefilled) notes.push(t("practice.heartRefilled"));
        notes.push(remaining ? t("practice.remaining", { n: remaining }) : t("practice.allClear"));
        return {
          title: t("practice.doneTitle"),
          bonusXp: result.bonusXp,
          mascotLine: mascotLine(mistakes === 0 ? "perfect" : "lessonComplete"),
          notes,
          secondary: { href: "#/procvicovani", label: t("practice.back") },
          // u opakování chyb nabídni další kolo, jen pokud ještě něco zbývá
          primary:
            kind === "chyby" && !remaining
              ? { href: "#/mapa", label: t("lesson.toMap") }
              : { href: `#/procvicovani/${kind}?${Date.now()}`, label: t("practice.again") },
        };
      },
    });
  },
};
