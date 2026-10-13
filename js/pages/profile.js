/**
 * Profil: přezdívka, úroveň, statistiky, graf aktivity, kurzy a odznaky.
 */
import { h, debounce } from "../ui.js";
import { t, formatDate, formatNumber } from "../i18n.js";
import { icon } from "../icons.js";
import { createMascot } from "../mascot.js";
import { getCourses, mascotLine } from "../content.js";
import { getProgress, updateProgress } from "../storage.js";
import * as game from "../gamification.js";

/**
 * Sloupcový graf XP za posledních 7 dní. Jedna řada = jedna barva, bez legendy;
 * referenční čára denního cíle; hodnoty v tooltipu (hover/fokus) a ve skryté
 * tabulce pro čtečky obrazovky.
 */
function activityChart() {
  const p = getProgress();
  const days = game.lastDays(7);
  const goal = game.dailyGoal();
  const values = days.map((d) => p.history[d] || 0);
  const max = Math.max(goal, ...values, 1) * 1.15;
  const today = game.dateKey();
  const weekday = (d) => formatDate(`${d}T12:00:00`, { weekday: "short" });
  const fullDate = (d) => formatDate(`${d}T12:00:00`, { weekday: "long", day: "numeric", month: "numeric" });
  const tooltip = h("div", { class: "chart-tooltip", role: "status", hidden: true });

  const cols = days.map((d, i) => {
    const v = values[i];
    const isToday = d === today;
    const show = () => {
      tooltip.hidden = false;
      tooltip.textContent = `${fullDate(d)}: ${v} XP${v >= goal ? " ✓" : ""}`;
    };
    return h(
      "div",
      {
        class: `activity-col ${isToday ? "is-today" : ""}`,
        tabindex: "0",
        "aria-label": `${fullDate(d)}: ${v} XP`,
        onmouseenter: show,
        onfocus: show,
        onmouseleave: () => (tooltip.hidden = true),
        onblur: () => (tooltip.hidden = true),
      },
      // přímý popisek jen u dneška (ostatní hodnoty jsou v tooltipu)
      h("span", { class: "activity-value" }, isToday ? `${v}` : ""),
      h("div", { class: "activity-track" }, h("div", { class: "activity-bar", style: { height: `${(v / max) * 100}%`, minHeight: v > 0 ? "3px" : "0", animationDelay: `${i * 50}ms` } })),
      h("span", { class: "activity-day" }, isToday ? t("profile.today") : weekday(d))
    );
  });

  const goalLine = h(
    "div",
    { class: "chart-goal", style: { bottom: `${(goal / max) * 100}%` }, "aria-hidden": "true" },
    h("span", {}, t("profile.goalLine", { goal }))
  );

  const table = h(
    "table",
    { class: "sr-only" },
    h("caption", {}, t("profile.activity")),
    h("tr", {}, h("th", {}, t("profile.day")), h("th", {}, "XP")),
    days.map((d, i) => h("tr", {}, h("td", {}, fullDate(d)), h("td", {}, String(values[i]))))
  );

  return h("div", { class: "card activity-card" }, h("div", { class: "activity-plot" }, h("div", { class: "chart-overlay" }, goalLine), h("div", { class: "activity-chart", role: "group", "aria-label": t("profile.activity") }, cols)), tooltip, table);
}

function statTile(iconName, value, label, colorVar) {
  return h(
    "div",
    { class: "card stat-tile" },
    h("span", { class: "stat-tile-icon", style: { color: `var(${colorVar})` }, html: icon(iconName) }),
    h("span", { class: "stat-tile-value" }, value),
    h("span", { class: "stat-tile-label" }, label)
  );
}

export default {
  render(container) {
    const p = getProgress();
    const lvl = game.levelInfo();
    const streak = game.streakStatus();
    const answered = p.stats.exercisesCorrect + p.stats.exercisesWrong;
    const accuracy = answered ? Math.round((p.stats.exercisesCorrect / answered) * 100) : 0;
    const minutes = Math.round(p.stats.secondsLearning / 60);
    const mascot = createMascot({ size: 90, mood: "happy", bubble: "left" });

    const initial = (p.user.name || "?").trim().charAt(0).toUpperCase() || "?";
    const avatar = h("div", { class: "avatar", "aria-hidden": "true" }, initial);
    const nameInput = h("input", { class: "input", id: "nick", value: p.user.name, placeholder: t("profile.namePlaceholder"), maxlength: "30", autocomplete: "nickname" });
    const saveName = debounce((v) => updateProgress((pr) => (pr.user.name = v.trim())), 400);
    nameInput.addEventListener("input", () => {
      avatar.textContent = (nameInput.value.trim().charAt(0) || "?").toUpperCase();
      saveName(nameInput.value);
    });

    const allBadges = game.allBadges();
    const earned = allBadges.filter((b) => p.badges[b.id]).length;

    const page = h(
      "div",
      { class: "page" },
      h(
        "div",
        { class: "row", style: { justifyContent: "space-between" } },
        h("h1", { class: "page-title" }, t("profile.title")),
        // na mobilu není Nastavení ve spodní liště – odkaz je tady
        h("a", { class: "btn btn-ghost btn-sm", href: "#/nastaveni" }, h("span", { html: icon("settings") }), t("nav.settings"))
      ),
      h(
        "section",
        { class: "card" },
        h(
          "div",
          { class: "profile-head" },
          avatar,
          h(
            "div",
            { class: "profile-name" },
            h("label", { class: "field-label", for: "nick" }, t("profile.nameLabel")),
            nameInput,
            h("span", { class: "dim mono", style: { fontSize: "var(--fs-xs)" } }, t("profile.memberSince", { date: formatDate(p.createdAt) }))
          ),
          mascot.el
        ),
        h(
          "div",
          { class: "level-box" },
          h("div", { class: "level-row" }, h("strong", { class: "text-green" }, t("profile.level", { level: lvl.level })), h("span", { class: "muted" }, t("profile.toNext", { xp: lvl.xpNeeded - lvl.xpInLevel }))),
          h("div", { class: "progress progress-xp", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(lvl.xpNeeded), "aria-valuenow": String(lvl.xpInLevel), "aria-label": t("profile.level", { level: lvl.level }) }, h("div", { class: "progress-fill", style: { width: `${lvl.progress * 100}%` } }))
        )
      ),
      h("h2", { class: "section-title" }, h("span", { html: icon("bolt") }), t("profile.stats")),
      h(
        "div",
        { class: "stats-grid stagger" },
        statTile("bolt", formatNumber(p.xp), t("profile.totalXp"), "--c-xp"),
        statTile("flame", t("profile.days", { n: streak.current }), t("profile.streak"), "--c-streak"),
        statTile("trophy", t("profile.days", { n: streak.best }), t("profile.bestStreak"), "--c-orange"),
        statTile("book", p.stats.lessonsCompleted, t("profile.lessons"), "--c-green"),
        statTile("check", p.stats.exercisesCorrect, t("profile.exercises"), "--c-green"),
        statTile("target", `${accuracy} %`, t("profile.accuracy"), "--c-cyan"),
        statTile("star", p.stats.perfectLessons, t("profile.perfect"), "--c-yellow"),
        statTile("code", p.stats.projectsCompleted, t("profile.projects"), "--c-purple"),
        statTile("terminal", p.stats.codeRuns, t("profile.codeRuns"), "--c-cyan"),
        statTile("reset", p.stats.practiceSessions || 0, t("profile.practice"), "--c-orange"),
        statTile("clock", t("common.minutes", { n: minutes }), t("profile.time"), "--c-text-muted")
      ),
      h("h2", { class: "section-title" }, h("span", { html: icon("calendar") }), t("profile.activity")),
      activityChart(),
      h("h2", { class: "section-title" }, h("span", { html: icon("map") }), t("profile.courses")),
      h(
        "div",
        { class: "card course-list" },
        getCourses().map((c, i) => {
          const pr = game.courseProgress(c);
          const unlocked = game.isCourseUnlocked(i);
          return h(
            "div",
            { class: "course-row" },
            h("span", { class: "mono" }, unlocked ? "" : h("span", { html: icon("lock", { size: 14 }), style: { display: "inline-block", marginRight: "6px" } }), c.title),
            h("div", { class: "progress progress-sm", "aria-hidden": "true" }, h("div", { class: "progress-fill", style: { width: `${pr.ratio * 100}%` } })),
            h("span", { class: "mono dim" }, `${pr.done}/${pr.total}`)
          );
        })
      ),
      h("h2", { class: "section-title" }, h("span", { html: icon("award") }), `${t("profile.badges")} · ${t("profile.badgesCount", { n: earned, total: allBadges.length })}`),
      h(
        "div",
        { class: "card badges-grid" },
        allBadges.map((b) => {
          const when = p.badges[b.id];
          return h(
            "div",
            { class: `badge-chip color-${b.color} ${when ? "" : "is-locked"}`, title: when ? t("profile.badgeEarned", { date: formatDate(when) }) : t("profile.badgeLocked") },
            h("span", { class: "badge-icon", html: icon(when ? b.icon : "lock") }),
            h("span", { class: "badge-name" }, b.name),
            h("span", { class: "badge-desc" }, b.description),
            h("span", { class: "sr-only" }, when ? t("profile.badgeEarned", { date: formatDate(when) }) : t("profile.badgeLocked"))
          );
        })
      )
    );
    container.append(page);
    mascot.say(mascotLine("profile"));
  },
};
