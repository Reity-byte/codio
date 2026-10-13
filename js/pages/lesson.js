/**
 * Lekce – celoobrazovkový režim bez navigace.
 * Samotný průběh (výklad → cvičení → oslava) obstarává js/session.js,
 * tady se jen připraví data lekce a vyhodnotí její dokončení.
 */
import { h } from "../ui.js";
import { t } from "../i18n.js";
import { createMascot } from "../mascot.js";
import { getLesson, getNextLesson, getCourses, mascotLine } from "../content.js";
import { runSession } from "../session.js";
import { exerciseKey } from "../practice.js";
import * as game from "../gamification.js";

export default {
  focusMode: true,
  async render(container, { course: courseId, lesson: lessonId }) {
    const found = getLesson(courseId, lessonId);
    if (!found) {
      return (await import("./not-found.js")).default.render(container, { path: `/lekce/${courseId}/${lessonId}` });
    }
    const { course, lesson, index: lessonIndex } = found;
    const courseIndex = getCourses().findIndex((c) => c.id === course.id);

    if (!game.isLessonUnlocked(courseIndex, lessonIndex)) {
      const m = createMascot({ size: 150, mood: "think", bubble: "top" });
      container.append(h("div", { class: "page empty-state" }, m.el, h("h1", {}, t("lesson.locked")), h("a", { class: "btn btn-primary", href: "#/mapa" }, t("lesson.toMap"))));
      m.say(t("map.lockedLesson"));
      return;
    }

    return runSession(container, {
      mode: "lesson",
      title: lesson.title,
      kicker: course.title,
      theory: lesson.theory || [],
      items: (lesson.exercises || []).map((def, i) => ({ def, key: exerciseKey(course.id, lesson.id, i), lesson })),
      closeHref: "#/mapa",
      onFinish: ({ accuracy, mistakes }) => {
        const result = game.completeLesson(course.id, lesson.id, { accuracy, mistakes });
        const next = getNextLesson(course.id, lesson.id);
        const nextOpen = next && game.isLessonUnlocked(getCourses().indexOf(next.course), next.course.lessons.indexOf(next.lesson));
        return {
          title: result.perfect ? t("lesson.perfectTitle") : t("lesson.completeTitle"),
          bonusXp: result.bonusXp,
          mascotLine: mascotLine(result.perfect ? "perfect" : "lessonComplete"),
          notes: mistakes ? [t("practice.addedToReview")] : [],
          secondary: { href: "#/mapa", label: t("lesson.backToMap") },
          primary: nextOpen ? { href: `#/lekce/${next.course.id}/${next.lesson.id}`, label: t("lesson.nextLesson") } : { href: "#/mapa", label: t("lesson.continue") },
        };
      },
    });
  },
};
