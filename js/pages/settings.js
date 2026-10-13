/**
 * Nastavení: denní cíl, zvuky, animace, srdíčka, režim průzkumníka,
 * export/import zálohy (JSON) a reset postupu.
 */
import { h, toast, confirmDialog, downloadText } from "../ui.js";
import { t } from "../i18n.js";
import { icon } from "../icons.js";
import { createMascot } from "../mascot.js";
import { mascotLine, getMascotInfo } from "../content.js";
import { getProgress, updateProgress, exportProgress, importProgress, resetProgress } from "../storage.js";
import { DAILY_GOALS, dateKey } from "../gamification.js";
import { applyMotionSetting, playSound } from "../effects.js";
import { canInstall, promptInstall, isInstalled, isIos, onInstallChange } from "../pwa.js";

function setting(title, help, control, id) {
  return h(
    "div",
    { class: "card setting" },
    h("div", { class: "setting-text" }, h("h2", { class: "setting-title", id }, title), help ? h("p", { class: "setting-help" }, help) : null),
    control
  );
}

function toggle(id, checked, labelledBy, onChange) {
  return h(
    "label",
    { class: "switch" },
    h("input", { type: "checkbox", id, checked, "aria-labelledby": labelledBy, onchange: (e) => onChange(e.target.checked) }),
    h("span", { class: "switch-track", "aria-hidden": "true" })
  );
}

function radioGroup(name, options, value, labelledBy, onChange) {
  return h(
    "div",
    { class: "segmented", role: "radiogroup", "aria-labelledby": labelledBy },
    options.map(([val, label]) =>
      h("label", {}, h("input", { type: "radio", name, value: String(val), checked: String(val) === String(value), onchange: () => onChange(val) }), h("span", {}, label))
    )
  );
}

export default {
  render(container) {
    const s = getProgress().settings;
    const saved = () => toast(t("settings.saved"), { type: "success", duration: 1500 });
    const mascot = createMascot({ size: 90, mood: "neutral", bubble: "left" });

    const fileInput = h("input", { type: "file", accept: "application/json,.json", class: "sr-only", tabindex: "-1", "aria-hidden": "true" });
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        await importProgress(await file.text());
        applyMotionSetting();
        toast(t("settings.importOk"), { type: "success" });
        setTimeout(() => location.reload(), 600);
      } catch {
        toast(t("settings.importFail"), { type: "error" });
        mascot.say(mascotLine("error"), { mood: "sad", duration: 3000 });
      }
      fileInput.value = "";
    });

    // Instalace jako aplikace (PWA) – obsah karty se mění podle možností prohlížeče
    const pwaBody = h("div", { class: "stack" });
    const renderPwa = () => {
      if (isInstalled()) {
        pwaBody.replaceChildren(h("p", { class: "setting-help text-green" }, t("pwa.installedNote")));
      } else if (canInstall()) {
        pwaBody.replaceChildren(
          h("div", {}, h("button", { class: "btn btn-primary", type: "button", onclick: () => promptInstall() }, h("span", { html: icon("download") }), t("pwa.install")))
        );
      } else {
        pwaBody.replaceChildren(h("p", { class: "setting-help" }, isIos() ? t("pwa.iosHint") : t("pwa.otherHint")));
      }
    };
    renderPwa();
    const stopPwa = onInstallChange(renderPwa);
    const pwaCard = h("div", { class: "card setting-block" }, h("h2", { class: "setting-title" }, t("pwa.title")), h("p", { class: "setting-help" }, t("pwa.help")), pwaBody);

    const page = h(
      "div",
      { class: "page" },
      h("div", { class: "row", style: { justifyContent: "space-between" } }, h("h1", { class: "page-title" }, t("settings.title")), mascot.el),
      h(
        "div",
        { class: "settings-list stagger" },
        setting(
          t("settings.goal"),
          t("settings.goalHelp"),
          radioGroup("goal", DAILY_GOALS.map((g) => [g, t(`settings.goals.${g}`)]), s.dailyGoal, "set-goal", (v) => {
            updateProgress((p) => (p.settings.dailyGoal = Number(v)));
            saved();
          }),
          "set-goal"
        ),
        setting(
          t("settings.sound"),
          t("settings.soundHelp"),
          toggle("sound", s.sound, "set-sound", (on) => {
            updateProgress((p) => (p.settings.sound = on));
            if (on) playSound("correct");
          }),
          "set-sound"
        ),
        setting(
          t("settings.motion"),
          t("settings.motionHelp"),
          radioGroup("motion", ["auto", "on", "off"].map((m) => [m, t(`settings.motionOptions.${m}`)]), s.motion, "set-motion", (v) => {
            updateProgress((p) => (p.settings.motion = v));
            applyMotionSetting(v);
            saved();
          }),
          "set-motion"
        ),
        setting(
          t("settings.hearts"),
          t("settings.heartsHelp"),
          toggle("hearts", s.hearts, "set-hearts", (on) => updateProgress((p) => (p.settings.hearts = on))),
          "set-hearts"
        ),
        setting(
          t("settings.unlockAll"),
          t("settings.unlockAllHelp"),
          toggle("unlock", s.unlockAll, "set-unlock", (on) => updateProgress((p) => (p.settings.unlockAll = on))),
          "set-unlock"
        ),
        pwaCard,
        h(
          "div",
          { class: "card setting-block" },
          h("h2", { class: "setting-title" }, t("settings.data")),
          h("p", { class: "setting-help" }, t("settings.dataHelp")),
          h(
            "div",
            { class: "row" },
            h(
              "button",
              { class: "btn btn-secondary", type: "button", onclick: () => downloadText(`codio-zaloha-${dateKey()}.json`, exportProgress()) },
              h("span", { html: icon("download") }),
              t("settings.export")
            ),
            h("button", { class: "btn btn-ghost", type: "button", onclick: () => fileInput.click() }, h("span", { html: icon("upload") }), t("settings.import")),
            fileInput
          )
        ),
        h(
          "div",
          { class: "card setting-block danger-zone" },
          h("h2", { class: "setting-title text-red" }, t("settings.reset")),
          h("p", { class: "setting-help" }, t("settings.resetText")),
          h(
            "div",
            {},
            h(
              "button",
              {
                class: "btn btn-danger",
                type: "button",
                onclick: async () => {
                  const ok = await confirmDialog({ title: t("settings.resetTitle"), message: t("settings.resetText"), confirmLabel: t("settings.resetConfirm"), danger: true });
                  if (!ok) return;
                  await resetProgress();
                  toast(t("settings.resetDone"), { type: "info" });
                  setTimeout(() => {
                    location.hash = "#/";
                    location.reload();
                  }, 500);
                },
              },
              h("span", { html: icon("trash") }),
              t("settings.reset")
            )
          )
        ),
        h(
          "div",
          { class: "card setting-block" },
          h("h2", { class: "setting-title" }, t("settings.about")),
          h("p", { class: "setting-help" }, t("settings.aboutText")),
          h("p", { class: "setting-help" }, `${getMascotInfo().name}: ${getMascotInfo().bio}`)
        )
      )
    );
    container.append(page);
    mascot.say(mascotLine("settings"));
    return () => stopPwa();
  },
};
