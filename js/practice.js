/**
 * practice.js – výběr cvičení pro procvičování a opakování chyb.
 *
 * Každé cvičení má stabilní klíč „kurz/lekce#index“, pod kterým se
 * ukládá do opakování (viz gamification.recordReview).
 */
import { getCourses, getLesson } from "./content.js";
import { isLessonCompleted, dueReviews } from "./gamification.js";
import { shuffle } from "./ui.js";

export const PRACTICE_SIZE = 8;
const MAX_REVIEWS_IN_MIX = 4;
const MAX_CODE_IN_MIX = 1; // kódová cvičení trvají déle – v mixu nanejvýš jedno

export function exerciseKey(courseId, lessonId, index) {
  return `${courseId}/${lessonId}#${index}`;
}

/** Převede klíč na cvičení. Vrací null, pokud už v obsahu neexistuje. */
export function resolveKey(key) {
  const m = /^([^/]+)\/([^#]+)#(\d+)$/.exec(key);
  if (!m) return null;
  const found = getLesson(m[1], m[2]);
  const def = found?.lesson.exercises?.[Number(m[3])];
  if (!def) return null;
  return { key, def, course: found.course, lesson: found.lesson };
}

/** Všechna cvičení z dokončených lekcí. */
function completedExercises() {
  const out = [];
  for (const course of getCourses()) {
    for (const lesson of course.lessons) {
      if (!isLessonCompleted(course.id, lesson.id)) continue;
      (lesson.exercises || []).forEach((def, i) => out.push({ key: exerciseKey(course.id, lesson.id, i), def, course, lesson }));
    }
  }
  return out;
}

/** Jsou vůbec nějaká cvičení k procvičování? */
export function canPractice() {
  return completedExercises().length > 0 || dueReviews().length > 0;
}

/**
 * Sestaví sadu cvičení.
 * @param {"chyby"|"mix"} kind  chyby = jen opakování, mix = opakování + náhodná cvičení
 */
export function buildPracticeSet(kind) {
  const reviews = dueReviews().map(resolveKey).filter(Boolean);
  if (kind === "chyby") return reviews.slice(0, 10);

  const picked = reviews.slice(0, MAX_REVIEWS_IN_MIX);
  const used = new Set(picked.map((x) => x.key));
  let codeCount = picked.filter((x) => x.def.type === "code").length;
  for (const item of shuffle(completedExercises())) {
    if (picked.length >= PRACTICE_SIZE) break;
    if (used.has(item.key)) continue;
    if (item.def.type === "code") {
      if (codeCount >= MAX_CODE_IN_MIX) continue;
      codeCount++;
    }
    picked.push(item);
    used.add(item.key);
  }
  // kódové cvičení dej na konec – po rozehřátí
  return [...picked.filter((x) => x.def.type !== "code"), ...picked.filter((x) => x.def.type === "code")];
}
