/**
 * gamification.js – XP, úrovně, denní série, srdíčka, denní cíl, odznaky
 * a odemykání kurzů/lekcí. Veškerá pravidla hry jsou na jednom místě.
 *
 * Modul vysílá události (on("badge"|"level"|"goal"|"streak", fn)),
 * na které reaguje UI (toasty, oslavy) – logika tak nezávisí na vzhledu.
 */
import { getProgress, updateProgress } from "./storage.js";
import { getCourses, getProjects, getBadgeDefs, lessonKey } from "./content.js";

/** Bodování – změnou těchto čísel se vyladí celá hra. */
export const XP_RULES = {
  exercise: 10, // správná odpověď napoprvé
  exerciseRetry: 5, // správná odpověď po chybě
  hintCost: 3, // srážka za nápovědu
  lessonBonus: 20, // dokončení lekce
  perfectBonus: 10, // lekce bez chyby
  projectStep: 15,
  projectComplete: 50,
  practiceBonus: 10, // dokončené procvičování
};

export const HEARTS_MAX = 5;
export const HEART_REGEN_MINUTES = 20;
export const DAILY_GOALS = [10, 20, 50];

/* ------------------------------------------------------------------------ */
/* Události                                                                  */
/* ------------------------------------------------------------------------ */
const handlers = {};
export function on(event, fn) {
  (handlers[event] ||= new Set()).add(fn);
  return () => handlers[event].delete(fn);
}
function emit(event, payload) {
  handlers[event]?.forEach((fn) => fn(payload));
}

/* ------------------------------------------------------------------------ */
/* Datum                                                                     */
/* ------------------------------------------------------------------------ */

/** Lokální datum ve formátu YYYY-MM-DD (série se počítá podle místního času). */
export function dateKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db - da) / 86_400_000);
}

/** Posledních n dní (nejstarší první) – pro graf v profilu. */
export function lastDays(n = 7) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* Úrovně                                                                    */
/* ------------------------------------------------------------------------ */

/** Celkové XP potřebné pro dosažení úrovně n (1 → 0, 2 → 100, 3 → 300, 4 → 600…). */
export function xpForLevel(n) {
  return 50 * n * (n - 1);
}

export function levelInfo(xp = getProgress().xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xpInLevel: xp - base, xpNeeded: next - base, progress: (xp - base) / (next - base), nextAt: next };
}

/* ------------------------------------------------------------------------ */
/* XP a série                                                                */
/* ------------------------------------------------------------------------ */

export function todayXp() {
  return getProgress().history[dateKey()] || 0;
}

export function dailyGoal() {
  return getProgress().settings.dailyGoal;
}

/**
 * Přičte XP, zapíše aktivitu dne, aktualizuje sérii a zkontroluje
 * úroveň, denní cíl a odznaky.
 */
export function addXp(amount) {
  if (amount <= 0) {
    touchStreak();
    return;
  }
  const before = levelInfo().level;
  const goal = dailyGoal();
  const todayBefore = todayXp();
  updateProgress((p) => {
    p.xp += amount;
    const key = dateKey();
    p.history[key] = (p.history[key] || 0) + amount;
  });
  touchStreak();
  const after = levelInfo().level;
  if (after > before) emit("level", { level: after });
  if (todayBefore < goal && todayXp() >= goal) emit("goal", { goal });
  checkBadges();
}

/** Zaznamená aktivitu dne do série. */
function touchStreak() {
  const today = dateKey();
  const p = getProgress();
  const last = p.streak.lastActiveDate;
  if (last === today) return;
  updateProgress((pr) => {
    const diff = last ? daysBetween(last, today) : Infinity;
    pr.streak.current = diff === 1 ? pr.streak.current + 1 : 1;
    pr.streak.best = Math.max(pr.streak.best, pr.streak.current);
    pr.streak.lastActiveDate = today;
  });
  emit("streak", { current: getProgress().streak.current });
}

/**
 * Stav série pro zobrazení.
 * atRisk = uživatel má sérii, ale dnes ještě nic nedělal.
 */
export function streakStatus() {
  const { streak } = getProgress();
  const today = dateKey();
  if (!streak.lastActiveDate) return { current: 0, best: streak.best, activeToday: false, atRisk: false };
  const diff = daysBetween(streak.lastActiveDate, today);
  const alive = diff <= 1;
  const current = alive ? streak.current : 0;
  const activeToday = diff === 0;
  return {
    current,
    best: streak.best,
    activeToday,
    atRisk: alive && !activeToday && current > 0,
    // večer už hoří – upozornění je naléhavější
    urgent: alive && !activeToday && current > 0 && new Date().getHours() >= 18,
  };
}

/* ------------------------------------------------------------------------ */
/* Srdíčka                                                                   */
/* ------------------------------------------------------------------------ */

export function heartsEnabled() {
  return getProgress().settings.hearts;
}

/** Aktuální počet srdíček včetně obnovy podle uplynulého času. */
export function getHearts() {
  const { hearts } = getProgress();
  if (hearts.count >= HEARTS_MAX) return { count: HEARTS_MAX, nextInMs: 0 };
  const elapsed = Date.now() - new Date(hearts.updatedAt).getTime();
  const period = HEART_REGEN_MINUTES * 60_000;
  const regained = Math.floor(elapsed / period);
  if (regained > 0) {
    const count = Math.min(HEARTS_MAX, hearts.count + regained);
    updateProgress((p) => {
      p.hearts.count = count;
      p.hearts.updatedAt = new Date(new Date(hearts.updatedAt).getTime() + regained * period).toISOString();
    });
    return getHearts();
  }
  return { count: hearts.count, nextInMs: period - elapsed };
}

export function loseHeart() {
  if (!heartsEnabled()) return getHearts();
  const { count } = getHearts();
  updateProgress((p) => {
    if (count >= HEARTS_MAX) p.hearts.updatedAt = new Date().toISOString();
    p.hearts.count = Math.max(0, count - 1);
  });
  return getHearts();
}

export function refillHearts() {
  updateProgress((p) => {
    p.hearts.count = HEARTS_MAX;
    p.hearts.updatedAt = new Date().toISOString();
  });
}

/* ------------------------------------------------------------------------ */
/* Statistiky cvičení                                                        */
/* ------------------------------------------------------------------------ */

export function recordExercise({ correct, type, usedHint = false }) {
  updateProgress((p) => {
    if (correct) p.stats.exercisesCorrect++;
    else p.stats.exercisesWrong++;
    if (usedHint) p.stats.hintsUsed++;
    if (correct && type === "bug") p.stats.bugsFound++;
  });
}

export function recordHint() {
  updateProgress((p) => p.stats.hintsUsed++);
}

export function recordCodeRun() {
  updateProgress((p) => p.stats.codeRuns++);
}

export function recordTime(seconds) {
  updateProgress((p) => (p.stats.secondsLearning += Math.round(seconds)));
}

/* ------------------------------------------------------------------------ */
/* Opakování chyb (Leitnerův systém krabiček)                                */
/*                                                                           */
/* Špatně zodpovězené cvičení se uloží do krabičky 0 (k opakování hned).     */
/* Každá správná odpověď ho posune o krabičku výš a oddálí další opakování.  */
/* Po správné odpovědi v poslední krabičce je cvičení „zvládnuté“ a zmizí.   */
/* ------------------------------------------------------------------------ */

/** Za kolik dní se cvičení vrátí po správné odpovědi v dané krabičce. */
export const REVIEW_INTERVALS = [0, 1, 3, 7, 14];

function addDays(key, days) {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

/**
 * Zapíše výsledek cvičení do opakování.
 * @param {string} key  klíč cvičení „kurz/lekce#index“
 * @param {boolean} correct
 */
export function recordReview(key, correct) {
  const today = dateKey();
  const existing = getProgress().review[key];
  if (!correct) {
    updateProgress((p) => {
      p.review[key] = { box: 0, due: today, misses: (existing?.misses || 0) + 1, added: existing?.added || today };
    });
    return;
  }
  if (!existing) return; // správně zodpovězené a nesledované cvičení nás nezajímá
  const box = existing.box + 1;
  updateProgress((p) => {
    if (box >= REVIEW_INTERVALS.length) {
      delete p.review[key];
      p.stats.reviewsMastered = (p.stats.reviewsMastered || 0) + 1;
    } else {
      p.review[key] = { ...existing, box, due: addDays(today, REVIEW_INTERVALS[box]) };
    }
  });
}

/** Existuje cvičení s tímto klíčem v aktuálním obsahu? (obsah se mohl změnit) */
function reviewKeyExists(key) {
  const m = /^([^/]+)\/([^#]+)#(\d+)$/.exec(key);
  if (!m) return false;
  const lesson = getCourses().find((c) => c.id === m[1])?.lessons.find((l) => l.id === m[2]);
  return !!lesson?.exercises?.[Number(m[3])];
}

function validReviews() {
  return Object.entries(getProgress().review).filter(([key]) => reviewKeyExists(key));
}

/** Klíče cvičení k opakování (dnes a dřív), nejstarší první. */
export function dueReviews() {
  const today = dateKey();
  return validReviews()
    .filter(([, r]) => r.due <= today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || a[1].box - b[1].box)
    .map(([key]) => key);
}

/** Přehled pro stránku procvičování: kolik je dnes, zítra, později. */
export function reviewSummary() {
  const today = dateKey();
  const tomorrow = addDays(today, 1);
  const all = validReviews().map(([, r]) => r);
  return {
    total: all.length,
    due: all.filter((r) => r.due <= today).length,
    tomorrow: all.filter((r) => r.due === tomorrow).length,
    later: all.filter((r) => r.due > tomorrow).length,
  };
}

/** Dokončení procvičování: bonus XP a jedno dobité srdíčko. */
export function completePractice() {
  const heartRefilled = heartsEnabled() && getHearts().count < HEARTS_MAX;
  updateProgress((p) => {
    p.stats.practiceSessions = (p.stats.practiceSessions || 0) + 1;
    if (heartRefilled) p.hearts.count = Math.min(HEARTS_MAX, p.hearts.count + 1);
  });
  addXp(XP_RULES.practiceBonus);
  checkBadges();
  return { bonusXp: XP_RULES.practiceBonus, heartRefilled };
}

/* ------------------------------------------------------------------------ */
/* Kurzy a lekce                                                             */
/* ------------------------------------------------------------------------ */

export function isLessonCompleted(courseId, lessonId) {
  return !!getProgress().lessons[lessonKey(courseId, lessonId)]?.completed;
}

export function courseProgress(course) {
  const done = course.lessons.filter((l) => isLessonCompleted(course.id, l.id)).length;
  return { done, total: course.lessons.length, ratio: course.lessons.length ? done / course.lessons.length : 0 };
}

export function isCourseCompleted(course) {
  const { done, total } = courseProgress(course);
  return total > 0 && done === total;
}

export function isCourseUnlocked(courseIndex) {
  if (getProgress().settings.unlockAll || courseIndex === 0) return true;
  const courses = getCourses();
  return isCourseCompleted(courses[courseIndex - 1]);
}

export function isLessonUnlocked(courseIndex, lessonIndex) {
  if (getProgress().settings.unlockAll) return true;
  if (!isCourseUnlocked(courseIndex)) return false;
  if (lessonIndex === 0) return true;
  const course = getCourses()[courseIndex];
  return isLessonCompleted(course.id, course.lessons[lessonIndex - 1].id);
}

/** První nedokončená odemčená lekce – "kde pokračovat". */
export function currentLesson() {
  const courses = getCourses();
  for (let ci = 0; ci < courses.length; ci++) {
    for (let li = 0; li < courses[ci].lessons.length; li++) {
      const lesson = courses[ci].lessons[li];
      if (!isLessonCompleted(courses[ci].id, lesson.id) && isLessonUnlocked(ci, li)) {
        return { course: courses[ci], lesson, courseIndex: ci, lessonIndex: li };
      }
    }
  }
  return null;
}

/**
 * Zapíše dokončení lekce. Vrací { firstTime, bonusXp, newlyUnlockedCourses }.
 */
export function completeLesson(courseId, lessonId, { accuracy, mistakes }) {
  const key = lessonKey(courseId, lessonId);
  const prev = getProgress().lessons[key];
  const firstTime = !prev?.completed;
  const perfect = mistakes === 0;
  const unlockedBefore = getCourses().map((_, i) => isCourseUnlocked(i));

  updateProgress((p) => {
    p.lessons[key] = {
      completed: true,
      completedAt: new Date().toISOString(),
      bestAccuracy: Math.max(prev?.bestAccuracy || 0, accuracy),
      perfect: prev?.perfect || perfect,
      timesCompleted: (prev?.timesCompleted || 0) + 1,
    };
    p.stats.lessonsCompleted++;
    if (perfect) p.stats.perfectLessons++;
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) p.stats.nightLessons = (p.stats.nightLessons || 0) + 1;
  });

  const bonusXp = XP_RULES.lessonBonus + (perfect ? XP_RULES.perfectBonus : 0);
  addXp(bonusXp);

  const newlyUnlockedCourses = getCourses().filter((c, i) => !unlockedBefore[i] && isCourseUnlocked(i));
  checkBadges();
  return { firstTime, bonusXp, perfect, newlyUnlockedCourses };
}

/** Kurzy odemčené, ale uživatel ještě neviděl efekt odemknutí. */
export function unseenUnlocks() {
  const seen = new Set(getProgress().seenUnlocks);
  return getCourses().filter((c, i) => i > 0 && isCourseUnlocked(i) && !seen.has(c.id) && !getProgress().settings.unlockAll);
}

export function markUnlockSeen(courseId) {
  updateProgress((p) => {
    if (!p.seenUnlocks.includes(courseId)) p.seenUnlocks.push(courseId);
  });
}

/* ------------------------------------------------------------------------ */
/* Projekty                                                                  */
/* ------------------------------------------------------------------------ */

export function getProjectState(projectId) {
  return getProgress().projects[projectId] || { step: 0, files: null, completed: false };
}

export function saveProjectFiles(projectId, files) {
  updateProgress((p) => {
    p.projects[projectId] = { ...getProjectState(projectId), ...p.projects[projectId], files };
  });
}

/** Posun na další krok projektu. Vrací true, pokud je projekt nově dokončen. */
export function completeProjectStep(projectId, stepIndex, totalSteps) {
  const state = getProjectState(projectId);
  if (stepIndex < state.step) return false; // krok už byl splněn dříve
  const finished = stepIndex + 1 >= totalSteps;
  const newlyCompleted = finished && !state.completed;
  updateProgress((p) => {
    p.projects[projectId] = {
      ...state,
      ...p.projects[projectId],
      step: Math.min(stepIndex + 1, totalSteps),
      completed: state.completed || finished,
      completedAt: newlyCompleted ? new Date().toISOString() : state.completedAt,
    };
    if (newlyCompleted) p.stats.projectsCompleted++;
  });
  addXp(XP_RULES.projectStep + (newlyCompleted ? XP_RULES.projectComplete : 0));
  return newlyCompleted;
}

/* ------------------------------------------------------------------------ */
/* Odznaky                                                                   */
/* Podmínky jsou popsané daty v content/<jazyk>/badges.js:                    */
/*   { condition: { type: "streak", min: 7 } } apod.                         */
/* ------------------------------------------------------------------------ */

const CONDITIONS = {
  lessons: (p, c) => p.stats.lessonsCompleted >= c.min,
  perfect: (p, c) => p.stats.perfectLessons >= c.min,
  streak: (p, c) => p.streak.best >= c.min,
  xp: (p, c) => p.xp >= c.min,
  level: (p, c) => levelInfo(p.xp).level >= c.min,
  bugs: (p, c) => p.stats.bugsFound >= c.min,
  codeRuns: (p, c) => p.stats.codeRuns >= c.min,
  projects: (p, c) => p.stats.projectsCompleted >= c.min,
  project: (p, c) => !!p.projects[c.id]?.completed,
  course: (p, c) => {
    const course = getCourses().find((x) => x.id === c.id);
    return !!course && isCourseCompleted(course);
  },
  anyCourse: () => getCourses().some(isCourseCompleted),
  allCourses: () => getCourses().every(isCourseCompleted),
  nightOwl: (p) => (p.stats.nightLessons || 0) >= 1,
  practice: (p, c) => (p.stats.practiceSessions || 0) >= c.min,
  reviews: (p, c) => (p.stats.reviewsMastered || 0) >= c.min,
  noHints: (p, c) => p.stats.lessonsCompleted >= c.min && p.stats.hintsUsed === 0,
};

/** Všechny odznaky = obecné z badges.js + odznaky za jednotlivé projekty. */
export function allBadges() {
  const projectBadges = getProjects().map((proj) => ({
    id: `project-${proj.id}`,
    name: proj.badge.name,
    description: proj.badge.description,
    icon: proj.badge.icon || "trophy",
    color: proj.badge.color || "purple",
    condition: { type: "project", id: proj.id },
    group: "projects",
  }));
  return [...getBadgeDefs(), ...projectBadges];
}

/** Vyhodnotí odznaky a udělí nové. Vrací pole nově získaných. */
export function checkBadges() {
  const p = getProgress();
  const earned = [];
  for (const badge of allBadges()) {
    if (p.badges[badge.id]) continue;
    const test = CONDITIONS[badge.condition?.type];
    if (test && test(p, badge.condition)) earned.push(badge);
  }
  if (earned.length) {
    updateProgress((pr) => {
      earned.forEach((b) => (pr.badges[b.id] = new Date().toISOString()));
    });
    earned.forEach((b) => emit("badge", b));
  }
  return earned;
}
