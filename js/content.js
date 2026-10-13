/**
 * content.js – přístup k obsahu (kurzy, lekce, projekty, odznaky, hlášky).
 * Logika aplikace se k datům dostává jen přes tyto funkce, takže obsah lze
 * přidávat do `content/<jazyk>/` bez zásahu do zbytku kódu.
 */
import { getBundle } from "./i18n.js";

export function getCourses() {
  return getBundle().courses;
}

export function getCourse(courseId) {
  return getCourses().find((c) => c.id === courseId) || null;
}

export function getLesson(courseId, lessonId) {
  const course = getCourse(courseId);
  if (!course) return null;
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) return null;
  return { course, lesson: course.lessons[index], index };
}

/** Další lekce v pořadí (i přes hranici kurzu), nebo null. */
export function getNextLesson(courseId, lessonId) {
  const courses = getCourses();
  const ci = courses.findIndex((c) => c.id === courseId);
  if (ci === -1) return null;
  const li = courses[ci].lessons.findIndex((l) => l.id === lessonId);
  if (li + 1 < courses[ci].lessons.length) {
    return { course: courses[ci], lesson: courses[ci].lessons[li + 1] };
  }
  if (ci + 1 < courses.length && courses[ci + 1].lessons.length) {
    return { course: courses[ci + 1], lesson: courses[ci + 1].lessons[0] };
  }
  return null;
}

export function lessonKey(courseId, lessonId) {
  return `${courseId}/${lessonId}`;
}

export function getProjects() {
  return getBundle().projects;
}

export function getProject(projectId) {
  return getProjects().find((p) => p.id === projectId) || null;
}

export function getBadgeDefs() {
  return getBundle().badges;
}

export function getErrorHelp() {
  return getBundle().errors;
}

/**
 * Náhodná hláška maskota z dané kategorie, s doplněním proměnných.
 * @param {string} category např. "correct", "wrong", "welcome"
 */
export function mascotLine(category, vars = {}) {
  const lines = getBundle().mascot.lines[category];
  if (!lines || !lines.length) return "";
  const line = lines[Math.floor(Math.random() * lines.length)];
  return line.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function getMascotInfo() {
  return getBundle().mascot;
}
