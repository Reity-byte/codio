/**
 * Mapa kurzů – cesta s uzly lekcí (zamčené / odemčené / aktuální / dokončené).
 */
import { h, toast } from "../ui.js";
import { t, plural } from "../i18n.js";
import { icon } from "../icons.js";
import { createMascot } from "../mascot.js";
import { getCourses, mascotLine } from "../content.js";
import { getProgress } from "../storage.js";
import * as game from "../gamification.js";
import { playSound, confetti } from "../effects.js";
import { preloadEditor } from "../editor.js";

/** Vodorovné posuny uzlů – vytvářejí "hadovitou" cestu. */
const OFFSETS = [0, 70, 105, 70, 0, -70, -105, -70];
const ROW_H = 112;
const PATH_W = 340;

function lessonState(ci, li, course, lesson, current) {
  if (game.isLessonCompleted(course.id, lesson.id)) return "done";
  if (!game.isLessonUnlocked(ci, li)) return "locked";
  if (current && current.course.id === course.id && current.lesson.id === lesson.id) return "current";
  return "open";
}

/** SVG cesta mezi uzly; druhá (zářící) vede přes dokončené lekce. */
function pathSvg(points, doneCount) {
  const d = (pts) =>
    pts
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = pts[i - 1];
        const my = (prev.y + p.y) / 2;
        return `C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
      })
      .join(" ");
  const height = points.length ? points[points.length - 1].y + ROW_H / 2 : 0;
  const donePts = points.slice(0, Math.max(0, doneCount + 1));
  return `<svg class="path-svg" viewBox="0 0 ${PATH_W} ${height}" width="${PATH_W}" height="${height}" aria-hidden="true">
    <path class="path-bg" d="${d(points)}"/>
    ${donePts.length > 1 ? `<path class="path-done" pathLength="1" d="${d(donePts)}"/>` : ""}
  </svg>`;
}

function renderCourse(course, ci, current, onOpen) {
  const unlocked = game.isCourseUnlocked(ci);
  const prog = game.courseProgress(course);
  const prevCourse = getCourses()[ci - 1];
  const points = course.lessons.map((_, li) => ({ x: PATH_W / 2 + OFFSETS[li % OFFSETS.length], y: li * ROW_H + ROW_H / 2 }));
  const doneCount = course.lessons.findIndex((l) => !game.isLessonCompleted(course.id, l.id));
  const completedCount = doneCount === -1 ? course.lessons.length - 1 : doneCount;

  const nodes = course.lessons.map((lesson, li) => {
    const state = lessonState(ci, li, course, lesson, current);
    const stateLabel = t(`map.state${state[0].toUpperCase()}${state.slice(1)}`);
    const iconName = state === "done" ? "check" : state === "locked" ? "lock" : state === "current" ? "star" : lesson.icon || "code";
    const node = h(
      "div",
      {
        class: `lesson-node is-${state}`,
        style: { left: `${points[li].x}px`, top: `${points[li].y}px` },
      },
      state === "current" ? h("span", { class: "node-flag mono", "aria-hidden": "true" }, t("common.start")) : null,
      h(
        "button",
        {
          class: "node-btn",
          type: "button",
          "aria-label": t("map.nodeLabel", { title: lesson.title, state: stateLabel }),
          "aria-haspopup": "dialog",
          onclick: (e) => onOpen(e.currentTarget.parentElement, course, ci, li, state),
        },
        h("span", { html: icon(iconName) })
      ),
      h("span", { class: "node-label", "aria-hidden": "true" }, lesson.title)
    );
    return node;
  });

  const section = h(
    "section",
    { class: `course ${unlocked ? "" : "is-locked"} course-${course.color || "green"}`, id: `kurz-${course.id}`, dataset: { course: course.id } },
    h(
      "header",
      { class: "course-banner scanlines" },
      h("div", { class: "course-icon mono", "aria-hidden": "true" }, course.icon || "{}"),
      h(
        "div",
        { class: "course-info" },
        h("p", { class: "course-kicker mono" }, t("map.courseN", { n: ci + 1 })),
        h("h2", { class: "course-title" }, course.title),
        h("p", { class: "course-desc" }, course.description),
        unlocked
          ? h(
              "div",
              { class: "course-progress" },
              h("div", { class: "progress progress-sm" }, h("div", { class: "progress-fill", style: { width: `${prog.ratio * 100}%` } })),
              h("span", { class: "mono dim" }, t("map.lessonsCount", prog))
            )
          : h("p", { class: "course-locked mono" }, h("span", { html: icon("lock") }), t("map.lockedCourse", { course: prevCourse?.title || "" }))
      )
    ),
    h(
      "div",
      { class: "course-path", style: { height: `${course.lessons.length * ROW_H}px` } },
      h("div", { class: "course-path-inner", style: { width: `${PATH_W}px` }, html: pathSvg(points, unlocked ? completedCount : -1) }, nodes)
    )
  );
  return section;
}

export default {
  render(container) {
    preloadEditor();
    const progress = getProgress();
    const courses = getCourses();
    const current = game.currentLesson();
    const streak = game.streakStatus();
    const goal = game.dailyGoal();
    const today = game.todayXp();

    // ---------- Horní panel: maskot + denní cíl + pokračovat ----------
    const mascot = createMascot({ size: 110, mood: "wave", bubble: "right" });
    const name = progress.user.name ? `, ${progress.user.name}` : "";
    let line;
    if (!current && courses.every(game.isCourseCompleted)) line = mascotLine("allDone");
    else if (streak.atRisk) line = mascotLine("streakRisk", { n: streak.current });
    else if (progress.xp === 0) line = mascotLine("mapIdle");
    else line = mascotLine("welcome", { name });

    const goalCard = h(
      "div",
      { class: "card goal-card" },
      h("div", { class: "row" }, h("span", { class: "goal-icon", html: icon("target") }), h("strong", { class: "mono" }, t("map.dailyGoal")), h("span", { class: "spacer" }), today >= goal ? h("span", { class: "tag tag-green" }, t("map.goalDone")) : null),
      h("div", { class: "progress progress-xp" }, h("div", { class: "progress-fill", style: { width: `${Math.min(100, (today / goal) * 100)}%` } })),
      h("p", { class: "mono dim goal-text" }, t("map.todayXp", { xp: today, goal })),
      current
        ? h("a", { class: "btn btn-primary btn-block", href: `#/lekce/${current.course.id}/${current.lesson.id}` }, t("map.continue"), h("span", { html: icon("arrowRight") }))
        : null
    );

    const top = h("div", { class: "map-top" }, h("div", { class: "map-mascot" }, mascot.el), goalCard);

    const banners = [];
    if (streak.atRisk) {
      banners.push(
        h(
          "div",
          { class: `callout callout-warn streak-banner ${streak.urgent ? "is-urgent" : ""}`, role: "status" },
          h("span", { class: "callout-icon", html: icon("flame") }),
          h("p", {}, t("map.streakRisk", { n: streak.current, days: plural(streak.current, ["den", "dny", "dní"]) }))
        )
      );
    }
    const dueCount = game.dueReviews().length;
    if (dueCount) {
      banners.push(
        h(
          "div",
          { class: "callout review-banner row" },
          h("span", { class: "callout-icon", html: icon("reset") }),
          h("p", {}, t("practice.mapCard", { n: dueCount })),
          h("a", { class: "btn btn-sm btn-secondary", href: "#/procvicovani/chyby" }, t("practice.reviewStart", { n: dueCount }))
        )
      );
    }
    if (progress.settings.unlockAll) {
      banners.push(h("div", { class: "callout" }, h("span", { class: "callout-icon", html: icon("unlock") }), h("p", {}, t("map.explorer"))));
    }

    // ---------- Popover uzlu ----------
    let popover = null;
    const closePopover = () => {
      popover?.remove();
      popover = null;
    };
    function openPopover(nodeEl, course, ci, li, state) {
      const same = popover && popover.dataset.key === `${ci}-${li}`;
      closePopover();
      if (same) return;
      playSound("click");
      const lesson = course.lessons[li];
      const href = `#/lekce/${course.id}/${lesson.id}`;
      const exCount = lesson.exercises?.length || 0;
      popover = h(
        "div",
        { class: `node-popover is-${state}`, role: "dialog", "aria-label": lesson.title, dataset: { key: `${ci}-${li}` } },
        h("h3", { class: "popover-title" }, lesson.title),
        lesson.description ? h("p", { class: "popover-desc" }, lesson.description) : null,
        h("p", { class: "mono dim popover-meta" }, `${exCount} ${plural(exCount, ["cvičení", "cvičení", "cvičení"])} · +${exCount * game.XP_RULES.exercise + game.XP_RULES.lessonBonus} XP`),
        state === "locked"
          ? h("p", { class: "popover-locked" }, h("span", { html: icon("lock") }), t("map.lockedLesson"))
          : h("a", { class: `btn ${state === "done" ? "btn-ghost" : "btn-primary"} btn-block`, href }, state === "done" ? t("map.repeatLesson") : t("map.startLesson"))
      );
      // Popover se zobrazí pod uzlem, ale nesmí vyjet mimo obrazovku
      nodeEl.append(popover);
      const rect = popover.getBoundingClientRect();
      const overflowRight = rect.right - (window.innerWidth - 12);
      const overflowLeft = 12 - rect.left;
      if (overflowRight > 0) popover.style.marginLeft = `${-overflowRight}px`;
      else if (overflowLeft > 0) popover.style.marginLeft = `${overflowLeft}px`;
      popover.querySelector("a,button")?.focus();
    }

    const coursesEl = h("div", { class: "courses" }, courses.map((c, ci) => renderCourse(c, ci, current, openPopover)));
    const page = h("div", { class: "page map-page" }, h("h1", { class: "sr-only" }, t("map.title")), top, banners, coursesEl);
    container.append(page);
    mascot.say(line);
    setTimeout(() => mascot.setMood("neutral"), 2200);

    const onDocClick = (e) => {
      if (popover && !e.target.closest(".lesson-node")) closePopover();
    };
    const onKey = (e) => {
      if (e.key === "Escape" && popover) {
        const btn = popover.parentElement.querySelector(".node-btn");
        closePopover();
        btn?.focus();
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    // Posun na aktuální lekci
    if (current) {
      const node = page.querySelector(".lesson-node.is-current");
      if (node && progress.xp > 0) setTimeout(() => node.scrollIntoView({ block: "center", behavior: "smooth" }), 350);
    }

    // Efekt odemknutí nového kurzu (jen jednou)
    const unseen = game.unseenUnlocks();
    if (unseen.length) {
      setTimeout(() => {
        unseen.forEach((course) => {
          const el = page.querySelector(`[data-course="${course.id}"]`);
          el?.classList.add("anim-unlock", "just-unlocked");
          el?.scrollIntoView({ block: "center", behavior: "smooth" });
          toast(t("map.unlockedText", { course: course.title }), { type: "success", iconName: "unlock", duration: 4500 });
          game.markUnlockSeen(course.id);
        });
        playSound("unlock");
        confetti({ y: 0.5, count: 100 });
        mascot.say(mascotLine("courseUnlocked"), { mood: "excited", duration: 3000 });
      }, 600);
    }

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  },
};
