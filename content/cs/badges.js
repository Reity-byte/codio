/**
 * Definice odznaků. Podmínky (condition) vyhodnocuje js/gamification.js:
 *   lessons, perfect, streak, xp, level, bugs, codeRuns, projects,
 *   project (id), course (id), anyCourse, allCourses, nightOwl, noHints.
 * Odznaky za jednotlivé projekty se generují z dat projektů.
 * icon = název ikony z js/icons.js, color = green|cyan|purple|orange|yellow|red.
 */
export default [
  { id: "first-lesson", name: "Hello, World!", description: "Dokonči svou první lekci.", icon: "sparkles", color: "green", condition: { type: "lessons", min: 1 } },
  { id: "lessons-10", name: "Rozjetý kodér", description: "Dokonči 10 lekcí.", icon: "book", color: "cyan", condition: { type: "lessons", min: 10 } },
  { id: "perfect-lesson", name: "Bez chyby", description: "Dokonči lekci bez jediné chyby.", icon: "star", color: "yellow", condition: { type: "perfect", min: 1 } },
  { id: "perfect-5", name: "Perfekcionista", description: "Dokonči 5 lekcí bez chyby.", icon: "target", color: "yellow", condition: { type: "perfect", min: 5 } },
  { id: "streak-3", name: "Zahříváme se", description: "Uč se 3 dny v řadě.", icon: "flame", color: "orange", condition: { type: "streak", min: 3 } },
  { id: "streak-7", name: "Týdenní série", description: "Uč se 7 dní v řadě.", icon: "flame", color: "orange", condition: { type: "streak", min: 7 } },
  { id: "streak-30", name: "Neúnavný", description: "Uč se 30 dní v řadě.", icon: "flame", color: "red", condition: { type: "streak", min: 30 } },
  { id: "xp-500", name: "Půl kila XP", description: "Nasbírej 500 XP.", icon: "bolt", color: "yellow", condition: { type: "xp", min: 500 } },
  { id: "level-5", name: "Level 5", description: "Dosáhni 5. úrovně.", icon: "award", color: "purple", condition: { type: "level", min: 5 } },
  { id: "bug-hunter", name: "Lovec bugů", description: "Najdi chybu v kódu v 5 cvičeních.", icon: "bug", color: "red", condition: { type: "bugs", min: 5 } },
  { id: "code-runner", name: "Spouštěč", description: "Spusť kód 50krát.", icon: "terminal", color: "cyan", condition: { type: "codeRuns", min: 50 } },
  { id: "first-course", name: "Absolvent", description: "Dokonči celý kurz.", icon: "trophy", color: "green", condition: { type: "anyCourse" } },
  { id: "course-zaklady", name: "Základy zvládnuty", description: "Dokonči kurz Základy.", icon: "award", color: "green", condition: { type: "course", id: "zaklady" } },
  { id: "course-rizeni-toku", name: "Pán toku", description: "Dokonči kurz Řízení toku.", icon: "award", color: "cyan", condition: { type: "course", id: "rizeni-toku" } },
  { id: "all-courses", name: "JS Ninja", description: "Dokonči všechny kurzy.", icon: "trophy", color: "purple", condition: { type: "allCourses" } },
  { id: "first-project", name: "Stavitel", description: "Dokonči svůj první projekt.", icon: "code", color: "purple", condition: { type: "projects", min: 1 } },
  { id: "practice-1", name: "Trénink", description: "Dokonči první procvičování.", icon: "reset", color: "cyan", condition: { type: "practice", min: 1 } },
  { id: "practice-10", name: "Vytrvalec", description: "Dokonči 10 procvičování.", icon: "reset", color: "purple", condition: { type: "practice", min: 10 } },
  { id: "reviews-10", name: "Z chyb se učím", description: "Natrvalo oprav 10 cvičení, ve kterých ses spletl.", icon: "check", color: "green", condition: { type: "reviews", min: 10 } },
  { id: "night-owl", name: "Noční sova", description: "Dokonči lekci mezi 22:00 a 5:00.", icon: "clock", color: "purple", condition: { type: "nightOwl" } },
];
