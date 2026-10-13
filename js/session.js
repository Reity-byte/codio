/**
 * session.js – průchod sadou cvičení (sdílí ho lekce i procvičování).
 *
 * Průběh: (volitelný výklad) → cvičení jedno po druhém → závěrečná obrazovka.
 * Špatně zodpovězená cvičení se vrací na konec fronty a zapisují se
 * do opakování chyb (gamification.recordReview).
 *
 *   runSession(container, {
 *     mode: "lesson" | "practice",
 *     title, kicker, theory?,           // výklad jen u lekce
 *     items: [{ def, key, lesson? }],   // cvičení + klíč pro opakování
 *     hearts: true,                     // ubírat srdíčka za chyby?
 *     closeHref: "#/mapa",
 *     onFinish(stats) → { title, perfect, bonusXp, mascotLine, notes[], primary{href,label}, secondary{href,label} }
 *   }) → { cleanup, canLeave }
 */
import { h, renderMarkdown, inlineMd, codeBlock, openModal, confirmDialog, replayAnimation, countUp, announce } from "./ui.js";
import { t } from "./i18n.js";
import { icon } from "./icons.js";
import { createMascot } from "./mascot.js";
import { mascotLine } from "./content.js";
import { createExercise } from "./exercises/index.js";
import { createPlayground } from "./playground.js";
import { playSound, celebrate } from "./effects.js";
import * as game from "./gamification.js";

/* ------------------------------------------------------------------------ */
/* Výklad                                                                    */
/* ------------------------------------------------------------------------ */

async function renderTheoryBlock(block, cleanups) {
  switch (block.type) {
    case "text":
      return h("div", { class: "prose", html: renderMarkdown(block.md) });
    case "code":
      return h("figure", { class: "theory-code" }, codeBlock(block.code, { lang: block.lang || "js" }), block.caption ? h("figcaption", { class: "muted" }, block.caption) : null);
    case "tip":
    case "warn":
      return h(
        "div",
        { class: `callout ${block.type === "warn" ? "callout-warn" : ""}` },
        h("span", { class: "callout-icon", html: icon(block.type === "warn" ? "alert" : "bulb") }),
        h("div", { class: "prose", html: renderMarkdown(block.md) })
      );
    case "playground": {
      const wrap = h("div", { class: "theory-playground" }, h("h3", { class: "theory-pg-title mono" }, h("span", { html: icon("play") }), block.title || t("lesson.tryIt")));
      const pg = await createPlayground(wrap, { code: block.code, mode: block.mode || "console", html: block.html, css: block.css });
      cleanups.push(() => pg.destroy());
      return wrap;
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------------ */
/* Sezení                                                                    */
/* ------------------------------------------------------------------------ */

export async function runSession(container, opts) {
  const { mode = "lesson", title, kicker, theory = [], items, closeHref = "#/mapa", onFinish } = opts;
  const useHearts = opts.hearts !== false && game.heartsEnabled();
  const cleanups = [];
  const startedAt = Date.now();
  const total = items.length;

  const state = {
    phase: theory.length ? "theory" : "exercises",
    queue: items.map((_, i) => i),
    solved: new Set(),
    mistakes: 0,
    firstTryCorrect: 0,
    attempts: new Map(), // index → počet neúspěchů
    hintUsed: new Set(),
    solutionUsed: new Set(),
    xpEarned: 0,
    finished: false,
    current: null, // { index, instance, checked, def }
  };

  const newBadges = [];
  cleanups.push(game.on("badge", (b) => newBadges.push(b)));

  // ---------- Kostra stránky ----------
  const progressFill = h("div", { class: "progress-fill" });
  const progressBar = h(
    "div",
    { class: "progress lesson-progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": "0", "aria-label": t("lesson.progress", { done: 0, total }) },
    progressFill
  );
  const heartsEl = h("div", { class: "lesson-hearts", "aria-live": "polite" });
  const closeBtn = h("button", { class: "icon-btn", type: "button", "aria-label": t("lesson.close"), html: icon("x"), onclick: () => (location.hash = closeHref) });
  const stage = h("div", { class: "lesson-stage" });
  const footer = h("footer", { class: "lesson-footer" });
  container.append(h("div", { class: `lesson-page is-${mode}` }, h("header", { class: "lesson-top" }, closeBtn, progressBar, heartsEl), h("main", { class: "lesson-main" }, stage), footer));

  function renderHearts(lost = false) {
    if (!useHearts) {
      const label = mode === "practice" ? t("practice.noHearts") : t("header.heartsOff");
      heartsEl.replaceChildren(h("span", { class: "hearts-off", title: label, html: icon("heart") }), h("span", { class: "mono", "aria-label": label }, "∞"));
      return;
    }
    const { count } = game.getHearts();
    heartsEl.replaceChildren(h("span", { class: "heart-icon", html: icon("heart") }), h("span", { class: "mono", "aria-label": t("header.hearts", { n: count }) }, String(count)));
    heartsEl.setAttribute("title", t("header.hearts", { n: count }));
    if (lost) replayAnimation(heartsEl, "anim-heart");
  }

  function updateProgressBar() {
    const done = state.solved.size;
    progressFill.style.width = `${total ? (done / total) * 100 : 0}%`;
    progressBar.setAttribute("aria-valuenow", String(done));
    progressBar.setAttribute("aria-label", t("lesson.progress", { done, total }));
  }

  renderHearts();
  updateProgressBar();

  const canLeave = async () => {
    // nic nezodpovězeno = není co ztratit, potvrzení netřeba
    if (state.finished || (state.solved.size === 0 && state.mistakes === 0)) return true;
    return confirmDialog({ title: t("lesson.leaveTitle"), message: t("lesson.leaveText"), confirmLabel: t("lesson.leaveConfirm"), cancelLabel: t("lesson.leaveCancel"), danger: true });
  };

  // ---------- Výklad ----------
  async function showTheory() {
    const mascot = createMascot({ size: 90, mood: "happy", bubble: "right" });
    const blocks = [];
    for (const block of theory) {
      const el = await renderTheoryBlock(block, cleanups);
      if (el) blocks.push(el);
    }
    stage.replaceChildren(
      h("article", { class: "theory" }, h("p", { class: "lesson-kicker mono" }, `${kicker} · ${t("lesson.theory")}`), h("h1", { class: "lesson-title" }, title), h("div", { class: "theory-mascot" }, mascot.el), blocks)
    );
    mascot.say(mascotLine("theoryIntro"));
    setTimeout(() => mascot.setMood("neutral"), 2000);
    const goBtn = h("button", { class: "btn btn-primary btn-lg", type: "button", onclick: () => startExercises() }, t("lesson.toExercises"), h("span", { html: icon("arrowRight") }));
    footer.className = "lesson-footer";
    footer.replaceChildren(h("div", { class: "footer-inner" }, h("span", { class: "dim mono footer-hint" }, t("lesson.exercisesCount", { n: total })), goBtn));
  }

  function startExercises() {
    state.phase = "exercises";
    if (!total) return finish();
    if (useHearts && game.getHearts().count <= 0) return heartsEmpty();
    nextExercise();
  }

  // ---------- Cvičení ----------
  const checkBtn = h("button", { class: "btn btn-primary btn-lg", type: "button", disabled: true }, t("lesson.check"));
  const hintBtn = h("button", { class: "btn btn-ghost", type: "button" }, h("span", { html: icon("bulb") }), t("lesson.hintCost", { xp: game.XP_RULES.hintCost }));
  const solutionBtn = h("button", { class: "btn btn-ghost", type: "button" }, h("span", { html: icon("eye") }), t("lesson.showSolution"));

  function setFooterIdle(instance, def) {
    footer.className = "lesson-footer";
    checkBtn.disabled = !instance.canCheck();
    checkBtn.textContent = t("lesson.check");
    const left = h("div", { class: "footer-left" });
    if (def.hint) left.append(hintBtn);
    if (def.type === "code" && (state.attempts.get(state.current.index) || 0) >= 2 && def.solution) left.append(solutionBtn);
    footer.replaceChildren(h("div", { class: "footer-inner" }, left, checkBtn));
  }

  function nextExercise() {
    state.current?.instance.destroy?.();
    if (!state.queue.length) return finish();
    const index = state.queue.shift();
    const item = items[index];
    const def = item.def;
    const instance = createExercise(def, {
      onReadyChange: () => {
        if (!state.current?.checked) checkBtn.disabled = !instance.canCheck();
      },
    });
    state.current = { index, instance, checked: false, def };

    // pořadí = počet vyřešených + 1 (vrácená cvičení neposouvají počítadlo zpět)
    const position = state.solved.size + 1;
    const kickerEl = h(
      "p",
      { class: "lesson-kicker mono" },
      h("span", {}, t(`exercise.types.${def.type}`)),
      h("span", { class: "dim" }, ` · ${t("lesson.exerciseOf", { n: Math.min(position, total), total })}`),
      // u procvičování ukaž, odkud cvičení pochází
      mode === "practice" && item.lesson ? h("span", { class: "dim" }, ` · ${t("practice.from", { lesson: item.lesson.title })}`) : null
    );
    const wrap = h("section", { class: "exercise-wrap", "aria-labelledby": "ex-title" }, h("h1", { class: "sr-only", id: "ex-title" }, t(`exercise.types.${def.type}`)), kickerEl, instance.el);
    stage.replaceChildren(wrap);
    setFooterIdle(instance, def);
    window.scrollTo({ top: 0 });
    setTimeout(() => instance.focus?.(), 60);
  }

  hintBtn.addEventListener("click", () => {
    const { index, def } = state.current;
    if (!state.hintUsed.has(index)) {
      state.hintUsed.add(index);
      game.recordHint();
    }
    const m = createMascot({ size: 70, mood: "think", bubble: "none", interactive: false });
    openModal({ title: t("lesson.hintTitle"), content: h("div", { class: "hint-modal" }, m.el, h("div", { class: "prose", html: renderMarkdown(def.hint) })) });
  });

  solutionBtn.addEventListener("click", () => {
    const { index, instance } = state.current;
    instance.showSolution?.(() => state.solutionUsed.add(index));
  });

  async function check() {
    const cur = state.current;
    if (!cur || cur.checked || checkBtn.disabled) return;
    checkBtn.disabled = true;
    const { instance, def, index } = cur;
    const key = items[index].key;
    const result = await instance.check();
    if (state.current !== cur) return;

    if (instance.retryable && !result.correct) {
      // Kódová cvičení: chyba neukončí cvičení, jen ukáže zpětnou vazbu
      const fails = (state.attempts.get(index) || 0) + 1;
      state.attempts.set(index, fails);
      if (fails === 1) {
        state.mistakes++;
        if (key) game.recordReview(key, false);
      }
      game.recordExercise({ correct: false, type: def.type });
      playSound("wrong");
      replayAnimation(stage, "anim-flash");
      showRetryFeedback(def, result, fails);
      return;
    }

    cur.checked = true;
    const failedBefore = state.attempts.get(index) || 0;
    if (result.correct) {
      state.solved.add(index);
      let xp = failedBefore ? game.XP_RULES.exerciseRetry : game.XP_RULES.exercise;
      if (state.hintUsed.has(index)) xp = Math.max(0, xp - game.XP_RULES.hintCost);
      if (state.solutionUsed.has(index)) xp = 0;
      state.xpEarned += xp;
      if (!failedBefore) state.firstTryCorrect++;
      // zobrazené řešení se nepočítá jako zvládnuté
      if (key && !state.solutionUsed.has(index)) game.recordReview(key, true);
      game.recordExercise({ correct: true, type: def.type });
      playSound("correct");
      replayAnimation(instance.el, "anim-pulse");
      updateProgressBar();
      showFeedback(true, def, result, xp);
    } else {
      state.attempts.set(index, failedBefore + 1);
      state.mistakes++;
      state.queue.push(index); // vrátí se na konci
      if (key) game.recordReview(key, false);
      game.recordExercise({ correct: false, type: def.type });
      playSound("wrong");
      replayAnimation(instance.el, "anim-shake");
      replayAnimation(stage, "anim-flash");
      if (useHearts) {
        game.loseHeart();
        playSound("heart");
        renderHearts(true);
      }
      showFeedback(false, def, result, 0);
    }
  }
  checkBtn.addEventListener("click", check);

  const feedbackMascot = (mood) => createMascot({ size: 64, mood, bubble: "none", interactive: false, className: "footer-mascot" });

  function showFeedback(correct, def, result, xp) {
    const m = feedbackMascot(correct ? "happy" : "sad");
    const line = mascotLine(correct ? "correct" : "wrong");
    const answerEl =
      !correct && (result.answer || result.answerCode)
        ? h(
            "div",
            { class: "feedback-answer" },
            h("strong", {}, t("lesson.correctAnswer")),
            result.answerCode ? codeBlock(result.answerCode) : h("span", { class: "feedback-answer-text", html: " " + inlineMd(result.answer) })
          )
        : null;
    const continueBtn = h("button", { class: `btn btn-lg ${correct ? "btn-primary" : "btn-danger"}`, type: "button", onclick: () => afterFeedback() }, t("lesson.continue"));
    footer.className = `lesson-footer is-${correct ? "correct" : "wrong"}`;
    footer.replaceChildren(
      h(
        "div",
        { class: "footer-inner feedback", role: "status" },
        m.el,
        h(
          "div",
          { class: "feedback-text" },
          h("h2", { class: "feedback-title" }, correct ? t("lesson.correct") : t("lesson.wrong"), xp ? h("span", { class: "feedback-xp mono" }, ` +${xp} XP`) : null),
          h("p", { class: "feedback-line" }, line),
          answerEl,
          def.explanation ? h("details", { class: "feedback-why", open: !correct }, h("summary", {}, t("lesson.explanation")), h("div", { class: "prose", html: renderMarkdown(def.explanation) })) : null,
          !correct ? h("p", { class: "dim feedback-later" }, t("lesson.retryLater")) : null
        ),
        continueBtn
      )
    );
    announce(`${correct ? t("lesson.correct") : t("lesson.wrong")} ${line}`);
    continueBtn.focus({ preventScroll: true });
  }

  function showRetryFeedback(def, result, fails) {
    const m = feedbackMascot("think");
    const line = result.error ? mascotLine("codeError") : mascotLine("testsFailed");
    const firstFail = (result.tests || []).find((r) => !r.passed);
    const left = h("div", { class: "footer-left" });
    if (def.hint) left.append(hintBtn);
    if (fails >= 2 && def.solution) left.append(solutionBtn);
    checkBtn.disabled = false;
    checkBtn.textContent = t("lesson.check");
    footer.className = "lesson-footer is-wrong is-soft";
    footer.replaceChildren(
      h(
        "div",
        { class: "footer-inner feedback" },
        m.el,
        h(
          "div",
          { class: "feedback-text" },
          h("h2", { class: "feedback-title" }, t("lesson.wrong")),
          h("p", { class: "feedback-line" }, line),
          // konkrétní důvod prvního neprošlého testu (např. chybějící proměnná)
          firstFail ? h("p", { class: "feedback-detail" }, h("strong", {}, t("tests.firstFail", { name: firstFail.name })), firstFail.message ? ` – ${firstFail.message}` : "") : null
        ),
        left,
        checkBtn
      )
    );
    announce(`${t("lesson.wrong")} ${line}`);
  }

  function afterFeedback() {
    if (useHearts && game.getHearts().count <= 0 && state.queue.length) return heartsEmpty();
    nextExercise();
  }

  // ---------- Došla srdíčka ----------
  function heartsEmpty() {
    state.finished = true;
    const m = createMascot({ size: 150, mood: "sad", bubble: "top" });
    const { nextInMs } = game.getHearts();
    const minutes = Math.max(1, Math.ceil(nextInMs / 60000));
    stage.replaceChildren(
      h(
        "div",
        { class: "empty-state" },
        m.el,
        h("h1", {}, t("lesson.heartsEmptyTitle")),
        h("p", { class: "muted" }, t("lesson.heartsEmptyText", { minutes: game.HEART_REGEN_MINUTES })),
        h("p", { class: "mono dim" }, t("lesson.heartsNext", { time: t("common.minutes", { n: minutes }) }))
      )
    );
    m.say(mascotLine("heartsEmpty"));
    footer.className = "lesson-footer";
    footer.replaceChildren(
      h(
        "div",
        { class: "footer-inner" },
        h("a", { class: "btn btn-ghost", href: "#/nastaveni" }, t("lesson.toSettings")),
        // procvičování srdíčka neubírá a jedno vrátí
        h("a", { class: "btn btn-secondary", href: "#/procvicovani/mix" }, t("practice.refillHeart")),
        h("a", { class: "btn btn-primary btn-lg", href: "#/mapa" }, t("lesson.toMap"))
      )
    );
  }

  // ---------- Konec ----------
  function finish() {
    state.finished = true;
    const seconds = (Date.now() - startedAt) / 1000;
    const accuracy = total ? Math.round((state.firstTryCorrect / total) * 100) : 100;
    game.recordTime(seconds);
    game.addXp(state.xpEarned);
    const outcome = onFinish({ accuracy, mistakes: state.mistakes, xpEarned: state.xpEarned, seconds });
    const totalXp = state.xpEarned + (outcome.bonusXp || 0);

    const m = createMascot({ size: 180, mood: "excited", bubble: "top" });
    const xpValue = h("span", { class: "stat-big-value text-xp" }, "0");
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    const statCard = (label, valueEl, iconName, cls) => h("div", { class: `card stat-big ${cls}` }, h("span", { class: "stat-big-icon", html: icon(iconName) }), h("span", { class: "stat-big-label mono" }, label), valueEl);

    stage.replaceChildren(
      h(
        "div",
        { class: "lesson-complete" },
        m.el,
        h("h1", { class: "complete-title glow-text" }, outcome.title),
        h(
          "div",
          { class: "complete-stats stagger" },
          statCard(t("lesson.xpEarned"), xpValue, "bolt", "is-xp"),
          statCard(t("lesson.accuracy"), h("span", { class: "stat-big-value text-green" }, `${accuracy} %`), "target", "is-acc"),
          statCard(t("lesson.time"), h("span", { class: "stat-big-value text-cyan" }, `${minutes}:${String(secs).padStart(2, "0")}`), "clock", "is-time")
        ),
        (outcome.notes || []).map((n) => h("p", { class: "complete-note mono" }, n)),
        newBadges.length
          ? h(
              "div",
              { class: "complete-badges" },
              h("h2", { class: "section-title" }, h("span", { html: icon("award") }), t("lesson.newBadge")),
              h(
                "div",
                { class: "badge-row" },
                newBadges.map((b) => h("div", { class: `badge-chip color-${b.color} anim-pop` }, h("span", { class: "badge-icon", html: icon(b.icon) }), h("span", { class: "badge-name" }, b.name)))
              )
            )
          : null
      )
    );
    progressFill.style.width = "100%";
    m.say(outcome.mascotLine);
    playSound("complete");
    celebrate();
    setTimeout(() => countUp(xpValue, 0, totalXp, 1200), 300);

    footer.className = "lesson-footer is-complete";
    footer.replaceChildren(
      h(
        "div",
        { class: "footer-inner" },
        h("a", { class: "btn btn-ghost", href: outcome.secondary.href }, outcome.secondary.label),
        h("a", { class: "btn btn-primary btn-lg", href: outcome.primary.href }, outcome.primary.label, h("span", { html: icon("arrowRight") }))
      )
    );
    footer.querySelector(".btn-primary")?.focus({ preventScroll: true });
  }

  // ---------- Klávesnice ----------
  const onKey = (e) => {
    if (state.phase !== "exercises" || state.finished) return;
    const inEditor = e.target.closest?.(".cm-editor, textarea");
    const cur = state.current;
    if (!cur) return;
    // Enter = zkontrolovat/pokračovat (kromě tlačítek v liště, odkazů a modálních oken)
    if (e.key === "Enter" && !inEditor && !e.target.closest?.(".lesson-footer, a, summary, .modal, .order-buttons, .playground-toolbar")) {
      e.preventDefault();
      if (cur.checked) afterFeedback();
      else check();
      return;
    }
    if (!cur.checked && !inEditor && !e.target.closest?.("input") && cur.instance.onKey?.(e)) e.preventDefault();
  };
  document.addEventListener("keydown", onKey);
  cleanups.push(() => document.removeEventListener("keydown", onKey));

  if (state.phase === "theory") await showTheory();
  else startExercises();

  return {
    cleanup: () => {
      state.current?.instance.destroy?.();
      cleanups.forEach((fn) => fn());
    },
    canLeave,
  };
}
