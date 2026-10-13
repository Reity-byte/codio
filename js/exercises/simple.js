/**
 * Jednodušší typy cvičení: výběr z možností, doplňování, předpověď výstupu,
 * hledání chyby. Každá továrna vrací instanci se společným rozhraním:
 *
 *   { el, canCheck(), check() → Promise<{correct, answer?}>, focus(), destroy() }
 *
 * `ctx.onReadyChange()` se volá, když se změní, zda lze odpověď zkontrolovat.
 */
import { h, renderMarkdown, inlineMd, codeBlock, highlight, shuffle, escapeHtml } from "../ui.js";
import { t } from "../i18n.js";

/** Normalizace pro porovnání textových odpovědí. */
export function normalizeAnswer(s) {
  return String(s)
    .replace(/\r/g, "")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/"/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s*([(){}[\];,=+\-*/<>!])\s*/g, "$1")
    .trim()
    .replace(/;$/, "");
}

function normalizeOutput(s) {
  return String(s)
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim().replace(/[“”„]/g, '"').replace(/[‘’]/g, "'"))
    .join("\n")
    .trim();
}

export function promptBlock(def) {
  return h("div", { class: "exercise-prompt prose", html: renderMarkdown(def.prompt || "") });
}

/* ------------------------------------------------------------------------ */
/* Výběr z možností                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Data: { type: "choice", prompt, code?, options: [..], answer: index, shuffle?: true }
 * Varianta "output" s options používá stejný komponent.
 */
export function createChoice(def, ctx, { lineNumbers = false } = {}) {
  let selected = null;
  // Zamíchání možností (pokud to obsah nezakáže), pamatujeme původní index
  const order = def.shuffle === false ? def.options.map((_, i) => i) : shuffle(def.options.map((_, i) => i));
  const name = `opt-${Math.random().toString(36).slice(2, 7)}`;
  const buttons = order.map((origIndex, pos) =>
    h(
      "button",
      {
        class: "option",
        type: "button",
        role: "radio",
        "aria-checked": "false",
        dataset: { index: origIndex },
        onclick: () => select(origIndex),
      },
      h("kbd", { class: "option-key", "aria-hidden": "true" }, String(pos + 1)),
      h("span", { class: "option-text", html: inlineMd(def.options[origIndex]) })
    )
  );
  const list = h("div", { class: "options", role: "radiogroup", "aria-label": t("exercise.types.choice"), id: name }, buttons);

  function select(index) {
    if (api.locked) return;
    selected = index;
    buttons.forEach((b) => {
      const on = Number(b.dataset.index) === index;
      b.classList.toggle("is-selected", on);
      b.setAttribute("aria-checked", String(on));
    });
    ctx.onReadyChange();
  }

  // Šipky v radiogroup
  list.addEventListener("keydown", (e) => {
    const i = buttons.indexOf(document.activeElement);
    if (i === -1) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      buttons[(i + 1) % buttons.length].focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      buttons[(i - 1 + buttons.length) % buttons.length].focus();
    }
  });

  const el = h(
    "div",
    { class: "exercise exercise-choice" },
    promptBlock(def),
    def.code ? codeBlock(def.code, { lang: def.lang || "js", lineNumbers }) : null,
    list
  );

  const api = {
    el,
    locked: false,
    canCheck: () => selected !== null,
    async check() {
      api.locked = true;
      const correct = selected === def.answer;
      buttons.forEach((b) => {
        const idx = Number(b.dataset.index);
        if (idx === def.answer) b.classList.add("is-correct");
        else if (idx === selected) b.classList.add("is-wrong");
        b.disabled = true;
      });
      return { correct, answer: def.options[def.answer] };
    },
    /** Klávesové zkratky 1–9 */
    onKey(e) {
      const n = Number(e.key);
      if (n >= 1 && n <= buttons.length && !api.locked) {
        select(Number(buttons[n - 1].dataset.index));
        buttons[n - 1].focus();
        return true;
      }
      return false;
    },
    focus: () => buttons[0]?.focus(),
    destroy() {},
  };
  return api;
}

/* ------------------------------------------------------------------------ */
/* Doplň do mezery                                                           */
/* ------------------------------------------------------------------------ */

/**
 * Data: { type: "fill", prompt, code: "let ___ = 5;", blanks: [["vek"], ...], words?: [..] }
 * Každá mezera `___` v kódu odpovídá jedné položce v `blanks` (pole přijatelných odpovědí).
 * Volitelná nabídka slov `words` se zobrazí jako klikací "čipy".
 */
export function createFill(def, ctx) {
  const parts = def.code.split("___");
  const inputs = [];
  const pre = h("pre", { class: "code-block fill-code" });
  let html = "";
  parts.forEach((part, i) => {
    html += highlight(part, def.lang || "js");
    if (i < parts.length - 1) html += `<span class="blank-slot" data-i="${i}"></span>`;
  });
  pre.innerHTML = `<code>${html}</code>`;
  pre.querySelectorAll(".blank-slot").forEach((slot) => {
    const i = Number(slot.dataset.i);
    const longest = Math.max(...(def.blanks[i] || [""]).map((a) => a.length), 3);
    const input = h("input", {
      class: "blank-input",
      type: "text",
      autocomplete: "off",
      autocapitalize: "off",
      spellcheck: "false",
      "aria-label": t("exercise.blank", { n: i + 1 }),
      style: { width: `${longest + 2}ch` },
    });
    input.addEventListener("input", () => ctx.onReadyChange());
    input.addEventListener("focus", () => (lastFocused = input));
    inputs.push(input);
    slot.replaceWith(input);
  });
  let lastFocused = inputs[0];

  const words = def.words
    ? h(
        "div",
        { class: "word-bank", "aria-label": "Nabídka slov" },
        shuffle(def.words).map((w) =>
          h(
            "button",
            {
              class: "word-chip mono",
              type: "button",
              onclick: () => {
                if (api.locked) return;
                const target = lastFocused && !lastFocused.value ? lastFocused : inputs.find((x) => !x.value) || lastFocused;
                target.value = w;
                const next = inputs.find((x) => !x.value);
                (next || target).focus();
                ctx.onReadyChange();
              },
            },
            w
          )
        )
      )
    : null;

  const el = h("div", { class: "exercise exercise-fill" }, promptBlock(def), pre, words);

  const api = {
    el,
    locked: false,
    canCheck: () => inputs.every((i) => i.value.trim() !== ""),
    async check() {
      api.locked = true;
      let correct = true;
      inputs.forEach((input, i) => {
        const ok = (def.blanks[i] || []).some((a) => normalizeAnswer(a) === normalizeAnswer(input.value));
        input.classList.add(ok ? "is-correct" : "is-wrong");
        input.readOnly = true;
        if (!ok) correct = false;
      });
      el.querySelectorAll(".word-chip").forEach((b) => (b.disabled = true));
      // Správné řešení = kód s doplněnými prvními variantami odpovědí
      const solved = parts.reduce((acc, part, i) => acc + part + (i < parts.length - 1 ? def.blanks[i][0] : ""), "");
      return { correct, answerCode: solved };
    },
    focus: () => inputs[0]?.focus(),
    destroy() {},
  };
  return api;
}

/* ------------------------------------------------------------------------ */
/* Co vypíše tento kód?                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Data: { type: "output", code, options?: [...], answer: index | "text" }
 * S `options` jde o výběr z možností, jinak uživatel výstup napíše.
 */
export function createOutput(def, ctx) {
  const withPrompt = { ...def, prompt: def.prompt || `**${t("exercise.types.output")}**` };
  if (def.options) return createChoice(withPrompt, ctx, { lineNumbers: true });

  const multiline = String(def.answer).includes("\n");
  const input = multiline
    ? h("textarea", { class: "input output-input", rows: String(def.answer).split("\n").length + 1, spellcheck: "false", "aria-label": t("exercise.yourAnswer"), placeholder: t("exercise.typeYourAnswer") })
    : h("input", { class: "input output-input", type: "text", spellcheck: "false", autocomplete: "off", "aria-label": t("exercise.yourAnswer"), placeholder: t("exercise.typeYourAnswer") });
  input.addEventListener("input", () => ctx.onReadyChange());

  const el = h(
    "div",
    { class: "exercise exercise-output" },
    promptBlock(withPrompt),
    codeBlock(def.code, { lineNumbers: true }),
    h("label", { class: "field" }, h("span", { class: "field-label" }, `> ${t("exercise.outputLabel")}`), input)
  );

  const api = {
    el,
    canCheck: () => input.value.trim() !== "",
    async check() {
      input.readOnly = true;
      const accepted = [def.answer, ...(def.accept || [])].map(normalizeOutput);
      const correct = accepted.includes(normalizeOutput(input.value));
      input.classList.add(correct ? "is-correct" : "is-wrong");
      return { correct, answer: String(def.answer) };
    },
    onKey(e) {
      // V jednořádkovém poli Enter = kontrola (řeší stránka lekce)
      return false;
    },
    focus: () => input.focus(),
    destroy() {},
  };
  return api;
}

/* ------------------------------------------------------------------------ */
/* Najdi chybu                                                               */
/* ------------------------------------------------------------------------ */

/**
 * Data: { type: "bug", prompt, code, bugLine: 3 | [3, 4], fix?: "opravený řádek" }
 */
export function createBug(def, ctx) {
  const lines = def.code.split("\n");
  const bugLines = Array.isArray(def.bugLine) ? def.bugLine : [def.bugLine];
  let selected = null;
  const buttons = lines.map((line, i) =>
    h(
      "button",
      {
        class: "bug-line",
        type: "button",
        role: "option",
        "aria-selected": "false",
        "aria-label": `${t("exercise.line", { n: i + 1 })}: ${line.trim() || "(prázdný)"}`,
        onclick: () => select(i + 1),
      },
      h("span", { class: "ln", "aria-hidden": "true" }, String(i + 1)),
      h("code", { class: "bug-code", html: highlight(line, def.lang || "js") || " " })
    )
  );
  function select(n) {
    if (api.locked) return;
    selected = n;
    buttons.forEach((b, i) => {
      b.classList.toggle("is-selected", i + 1 === n);
      b.setAttribute("aria-selected", String(i + 1 === n));
    });
    ctx.onReadyChange();
  }
  const list = h("div", { class: "bug-code-list code-block", role: "listbox", "aria-label": t("exercise.bugInstruction") }, buttons);
  list.addEventListener("keydown", (e) => {
    const i = buttons.indexOf(document.activeElement);
    if (i === -1) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[Math.min(buttons.length - 1, i + 1)].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttons[Math.max(0, i - 1)].focus();
    }
  });

  const el = h(
    "div",
    { class: "exercise exercise-bug" },
    promptBlock({ prompt: def.prompt || `**${t("exercise.types.bug")}**` }),
    h("p", { class: "muted exercise-instruction" }, t("exercise.bugInstruction")),
    list
  );

  const api = {
    el,
    locked: false,
    canCheck: () => selected !== null,
    async check() {
      api.locked = true;
      const correct = bugLines.includes(selected);
      buttons.forEach((b, i) => {
        if (bugLines.includes(i + 1)) b.classList.add("is-correct");
        else if (i + 1 === selected) b.classList.add("is-wrong");
        b.disabled = true;
      });
      return {
        correct,
        answer: t("exercise.line", { n: bugLines[0] }),
        answerCode: def.fix || null,
      };
    },
    focus: () => buttons[0]?.focus(),
    destroy() {},
  };
  return api;
}

export { escapeHtml };
