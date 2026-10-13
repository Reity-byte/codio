/**
 * Cvičení "Seřaď řádky kódu" – drag & drop přes Pointer Events
 * (funguje myší i dotykem) + tlačítka nahoru/dolů pro klávesnici.
 *
 * Data: { type: "order", prompt, lines: ["…", "…"], alternatives?: [[indexy…]] }
 * `lines` jsou ve správném pořadí; zobrazí se zamíchané.
 */
import { h, highlight, shuffle } from "../ui.js";
import { t } from "../i18n.js";
import { icon } from "../icons.js";
import { promptBlock } from "./simple.js";
import { playSound } from "../effects.js";

export function createOrder(def, ctx) {
  const n = def.lines.length;
  let order = shuffle([...Array(n).keys()]);
  // ať zamíchané pořadí není náhodou správné
  let guard = 0;
  while (order.every((v, i) => v === i) && n > 1 && guard++ < 10) order = shuffle(order);

  const list = h("ol", { class: "order-list", "aria-label": t("exercise.orderInstruction") });
  const items = new Map(); // původní index → <li>

  def.lines.forEach((line, idx) => {
    const indent = /^\s*/.exec(line)[0].length;
    const li = h(
      "li",
      { class: "order-item", dataset: { index: idx }, tabindex: "0", "aria-label": line.trim() },
      h("span", { class: "order-handle", html: icon("grip"), "aria-hidden": "true" }),
      h("code", { class: "order-code", style: { paddingLeft: `${indent * 0.6}ch` }, html: highlight(line.trim()) }),
      h(
        "span",
        { class: "order-buttons" },
        h("button", { class: "icon-btn order-up", type: "button", "aria-label": t("exercise.moveUp"), html: icon("up"), onclick: () => move(li, -1) }),
        h("button", { class: "icon-btn order-down", type: "button", "aria-label": t("exercise.moveDown"), html: icon("down"), onclick: () => move(li, 1) })
      )
    );
    li.addEventListener("keydown", (e) => {
      if (api.locked) return;
      if ((e.altKey || e.ctrlKey) && e.key === "ArrowUp") {
        e.preventDefault();
        move(li, -1);
      } else if ((e.altKey || e.ctrlKey) && e.key === "ArrowDown") {
        e.preventDefault();
        move(li, 1);
      } else if (e.key === "ArrowUp" && !e.altKey) {
        e.preventDefault();
        li.previousElementSibling?.focus();
      } else if (e.key === "ArrowDown" && !e.altKey) {
        e.preventDefault();
        li.nextElementSibling?.focus();
      }
    });
    li.querySelector(".order-handle").addEventListener("pointerdown", (e) => startDrag(e, li));
    li.querySelector(".order-code").addEventListener("pointerdown", (e) => startDrag(e, li));
    items.set(idx, li);
  });
  order.forEach((idx) => list.append(items.get(idx)));

  /** Plynulé přeuspořádání (FLIP animace). */
  function animateReorder(mutate) {
    const before = new Map([...list.children].map((el) => [el, el.getBoundingClientRect().top]));
    mutate();
    if (document.documentElement.dataset.motion === "reduce") return;
    [...list.children].forEach((el) => {
      if (el.classList.contains("is-dragging")) return;
      const dy = before.get(el) - el.getBoundingClientRect().top;
      if (!dy) return;
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 180, easing: "ease-out" });
    });
  }

  function move(li, dir) {
    if (api.locked) return;
    const sibling = dir < 0 ? li.previousElementSibling : li.nextElementSibling;
    if (!sibling) return;
    animateReorder(() => (dir < 0 ? list.insertBefore(li, sibling) : list.insertBefore(sibling, li)));
    li.focus();
    playSound("click");
    ctx.onReadyChange();
  }

  function startDrag(e, li) {
    if (api.locked || e.button > 0) return;
    e.preventDefault();
    const startY = e.clientY;
    const originTop = li.offsetTop; // pozice v rámci seznamu (position: relative)
    li.classList.add("is-dragging");
    li.setPointerCapture?.(e.pointerId);

    const onMove = (ev) => {
      // kde by prvek "chtěl" být podle kurzoru
      const desired = originTop + (ev.clientY - startY);
      const center = desired + li.offsetHeight / 2;
      const prev = li.previousElementSibling;
      const next = li.nextElementSibling;
      if (prev && center < prev.offsetTop + prev.offsetHeight / 2) {
        animateReorder(() => list.insertBefore(li, prev));
      } else if (next && center > next.offsetTop + next.offsetHeight / 2) {
        animateReorder(() => list.insertBefore(next, li));
      }
      li.style.transform = `translateY(${desired - li.offsetTop}px)`;
    };
    const onUp = () => {
      li.classList.remove("is-dragging");
      li.style.transform = "";
      li.removeEventListener("pointermove", onMove);
      li.removeEventListener("pointerup", onUp);
      li.removeEventListener("pointercancel", onUp);
      ctx.onReadyChange();
    };
    li.addEventListener("pointermove", onMove);
    li.addEventListener("pointerup", onUp);
    li.addEventListener("pointercancel", onUp);
  }

  const el = h(
    "div",
    { class: "exercise exercise-order" },
    promptBlock({ prompt: def.prompt || `**${t("exercise.types.order")}**` }),
    h("p", { class: "muted exercise-instruction" }, t("exercise.orderInstruction")),
    list
  );

  const currentOrder = () => [...list.children].map((li) => Number(li.dataset.index));

  const api = {
    el,
    locked: false,
    canCheck: () => true,
    async check() {
      api.locked = true;
      const cur = currentOrder();
      const valid = [[...Array(n).keys()], ...(def.alternatives || [])];
      const correct = valid.some((v) => v.every((x, i) => x === cur[i]));
      [...list.children].forEach((li, pos) => {
        // řádek je "na správném místě", pokud tam patří v hlavním řešení
        li.classList.add(Number(li.dataset.index) === pos || correct ? "is-correct" : "is-wrong");
        li.querySelectorAll("button").forEach((b) => (b.disabled = true));
        li.removeAttribute("tabindex");
      });
      return { correct, answerCode: def.lines.join("\n") };
    },
    focus: () => list.firstElementChild?.focus(),
    destroy() {},
  };
  return api;
}
