/**
 * 404 a chybová stránka – se smutným maskotem.
 */
import { h } from "../ui.js";
import { t } from "../i18n.js";
import { createMascot } from "../mascot.js";
import { mascotLine } from "../content.js";

export default {
  render(container, params = {}) {
    const isError = !!params.error;
    const mascot = createMascot({ size: 170, mood: isError ? "think" : "sad", bubble: "top" });
    container.append(
      h(
        "div",
        { class: "page empty-state" },
        mascot.el,
        h("h1", { class: "glitch-title", dataset: { text: isError ? t("notFound.errorTitle") : "404" } }, isError ? t("notFound.errorTitle") : "404"),
        h("p", { class: "muted" }, isError ? t("notFound.errorText") : t("notFound.text")),
        !isError && params.path ? h("p", { class: "mono dim" }, `GET #${params.path} → 404`) : null,
        h("a", { class: "btn btn-primary", href: "#/mapa" }, t("notFound.home"))
      )
    );
    mascot.say(mascotLine(isError ? "error" : "notFound"));
  },
};
