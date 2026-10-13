/**
 * main.js – vstupní bod aplikace.
 * Načte postup a jazyk, vykreslí kostru (hlavička, navigace), zaregistruje
 * stránky v routeru a napojí události gamifikace na UI (toasty, zvuky).
 */
window.__codioBooted = true;

import { initStorage, getProgress, onProgressChange } from "./storage.js";
import { loadLocale, t, plural } from "./i18n.js";
import { route, setNotFound, startRouter, onRouteChange, currentPath } from "./router.js";
import { h, toast, announce } from "./ui.js";
import { icon } from "./icons.js";
import { applyMotionSetting, playSound, confetti } from "./effects.js";
import * as game from "./gamification.js";
import { initPwa } from "./pwa.js";

/* ------------------------------------------------------------------------ */
/* Kostra aplikace                                                           */
/* ------------------------------------------------------------------------ */

// mobile: false = položka se na mobilu ve spodní liště nezobrazí (je dostupná z profilu)
const NAV = [
  { path: "/mapa", icon: "map", key: "nav.map" },
  { path: "/procvicovani", icon: "reset", key: "nav.practice", badge: true },
  { path: "/projekty", icon: "code", key: "nav.projects" },
  { path: "/hriste", icon: "terminal", key: "nav.playground" },
  { path: "/profil", icon: "user", key: "nav.profile" },
  { path: "/nastaveni", icon: "settings", key: "nav.settings", mobile: false },
];

function navLinks({ mobile = false } = {}) {
  return NAV.filter((item) => !mobile || item.mobile !== false).map((item) =>
    h(
      "a",
      { href: `#${item.path}`, dataset: { path: item.path } },
      h("span", { class: "nav-icon", html: icon(item.icon) }),
      h("span", { class: "nav-label" }, t(item.key)),
      // počet chyb k opakování
      item.badge ? h("span", { class: "nav-badge mono", hidden: true }) : null
    )
  );
}

/** Odznáček s počtem chyb k opakování u položky Procvičit. */
function renderNavBadges() {
  const n = game.dueReviews().length;
  document.querySelectorAll(".nav-badge").forEach((el) => {
    el.hidden = n === 0;
    el.textContent = n > 9 ? "9+" : String(n);
    el.setAttribute("aria-label", t("practice.mapCard", { n }));
  });
}

function buildShell() {
  const app = document.getElementById("app");
  const stats = h("div", { class: "header-stats", id: "header-stats" });
  const header = h(
    "header",
    { class: "app-header" },
    h("a", { class: "logo", href: "#/", "aria-label": `${t("app.name")} – úvod` }, h("span", { class: "logo-prompt" }, ">"), "codio", h("span", { class: "logo-cursor", "aria-hidden": "true" }, "_")),
    h("nav", { class: "main-nav", "aria-label": t("nav.main") }, navLinks()),
    stats
  );
  const main = h("main", { class: "app-main", id: "main", tabindex: "-1" });
  const tabbar = h("nav", { class: "tabbar", "aria-label": t("nav.main") }, navLinks({ mobile: true }));

  app.replaceChildren(
    h("a", { class: "skip-link", href: "#main", onclick: (e) => (e.preventDefault(), main.focus()) }, t("app.skip")),
    h("canvas", { class: "bg-canvas", id: "bg-canvas", "aria-hidden": "true" }),
    header,
    main,
    tabbar,
    h("div", { id: "live-region", class: "sr-only", "aria-live": "polite" })
  );
  return main;
}

/** Ukazatele v hlavičce: série, denní cíl (kroužek), XP, srdíčka. */
function renderHeaderStats() {
  const el = document.getElementById("header-stats");
  if (!el) return;
  const streak = game.streakStatus();
  const goal = game.dailyGoal();
  const today = game.todayXp();
  const ratio = Math.min(1, today / goal);
  const hearts = game.getHearts();
  const heartsOn = game.heartsEnabled();
  const circumference = 2 * Math.PI * 14;

  el.replaceChildren(
    h(
      "a",
      {
        class: `stat-pill stat-streak ${streak.atRisk ? "is-risk" : ""} ${streak.activeToday ? "is-active" : ""}`,
        href: "#/profil",
        title: t("header.streak", { n: streak.current }),
        "aria-label": t("header.streak", { n: streak.current }),
      },
      h("span", { html: icon("flame") }),
      h("span", { class: "stat-value" }, streak.current)
    ),
    h(
      "a",
      { class: `stat-pill stat-goal ${ratio >= 1 ? "is-done" : ""}`, href: "#/profil", title: t("header.goal", { xp: today, goal }), "aria-label": t("header.goal", { xp: today, goal }) },
      h("span", {
        class: "goal-ring",
        html: `<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" class="goal-ring-bg"/><circle cx="18" cy="18" r="14" class="goal-ring-fg" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - ratio)}"/></svg>${icon("bolt")}`,
      }),
      h("span", { class: "stat-value" }, getProgress().xp)
    ),
    h(
      "span",
      { class: `stat-pill stat-hearts ${heartsOn ? "" : "is-off"}`, title: heartsOn ? t("header.hearts", { n: hearts.count }) : t("header.heartsOff"), "aria-label": heartsOn ? t("header.hearts", { n: hearts.count }) : t("header.heartsOff") },
      h("span", { html: icon("heart") }),
      h("span", { class: "stat-value" }, heartsOn ? hearts.count : "∞")
    )
  );
}

function highlightNav(path) {
  document.querySelectorAll(".main-nav a, .tabbar a").forEach((a) => {
    const active = path.startsWith(a.dataset.path) || (a.dataset.path === "/projekty" && path.startsWith("/projekt/"));
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

/* ------------------------------------------------------------------------ */
/* Reakce na události gamifikace                                              */
/* ------------------------------------------------------------------------ */

function wireGameEvents() {
  game.on("badge", (badge) => {
    playSound("badge");
    toast(t("toasts.badge", { name: badge.name }), { type: "badge", duration: 4500 });
    announce(t("toasts.badge", { name: badge.name }));
  });
  game.on("level", ({ level }) => {
    toast(t("toasts.level", { level }), { type: "xp", iconName: "award", duration: 4000 });
    confetti({ y: 0.15, count: 60 });
  });
  game.on("goal", () => {
    toast(t("toasts.goal"), { type: "success", iconName: "target", duration: 4000 });
  });
  game.on("streak", ({ n, current }) => {
    const count = current ?? n;
    if (count > 1) toast(t("toasts.streak", { n: count, days: plural(count, ["den", "dny", "dní"]) }), { type: "streak" });
  });
}

/* ------------------------------------------------------------------------ */
/* Start                                                                     */
/* ------------------------------------------------------------------------ */

async function boot() {
  await initStorage();
  await loadLocale(getProgress().settings.locale);
  applyMotionSetting();
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => applyMotionSetting());

  const main = buildShell();
  renderHeaderStats();
  renderNavBadges();
  onProgressChange(() => {
    renderHeaderStats();
    renderNavBadges();
  });
  // obnova srdíček a stavu série i při otevřené kartě
  setInterval(renderHeaderStats, 60_000);
  wireGameEvents();

  route("/", () => import("./pages/landing.js"));
  route("/mapa", () => import("./pages/map.js"));
  route("/lekce/:course/:lesson", () => import("./pages/lesson.js"));
  route("/procvicovani", () => import("./pages/practice.js"));
  route("/procvicovani/:druh", () => import("./pages/practice-session.js"));
  route("/hriste", () => import("./pages/hriste.js"));
  route("/projekty", () => import("./pages/projects.js"));
  route("/projekt/:id", () => import("./pages/project.js"));
  route("/profil", () => import("./pages/profile.js"));
  route("/nastaveni", () => import("./pages/settings.js"));
  setNotFound(() => import("./pages/not-found.js"));

  initPwa();
  onRouteChange((path) => highlightNav(path));
  startRouter(main);
  highlightNav(currentPath());
}

boot().catch((err) => {
  console.error(err);
  const app = document.getElementById("app");
  app.innerHTML = `<div class="boot-error"><h1>Chyba při spuštění</h1><pre>${String(err?.message || err).replace(/</g, "&lt;")}</pre></div>`;
});
