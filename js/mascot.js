/**
 * mascot.js – maskot Bajtík: malý robot s CRT monitorem místo hlavy.
 *
 * SVG je vložené inline, takže jednotlivé části (oči, pusa, ruka, LED)
 * lze animovat přes CSS. Nálada se přepíná atributem data-mood na kořeni:
 *   neutral | happy | sad | excited | sleep | wave | think
 *
 * Použití:
 *   const m = createMascot({ size: 180, mood: "wave" });
 *   container.append(m.el);
 *   m.say("Ahoj!", { mood: "happy" });
 */
import { h } from "./ui.js";
import { typewriter, prefersReducedMotion } from "./effects.js";
import { mascotLine, getMascotInfo } from "./content.js";

export const MOODS = ["neutral", "happy", "sad", "excited", "sleep", "wave", "think"];

const IDLE_TO_SLEEP_MS = 90_000;

/** SVG maskota – bez <defs> s ID, aby šlo mít více maskotů na stránce. */
function mascotSvg(label) {
  return `
<svg class="mascot-svg" viewBox="0 0 200 232" role="img" aria-label="${label}" focusable="false">
  <ellipse class="m-shadow" cx="100" cy="222" rx="44" ry="6"/>
  <g class="m-zzz" aria-hidden="true">
    <text x="150" y="40">z</text><text x="162" y="24">z</text><text x="176" y="10">Z</text>
  </g>
  <g class="m-sparkles" aria-hidden="true">
    <path d="M22 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z"/>
    <path d="M176 70 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/>
    <path d="M168 150 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/>
  </g>
  <g class="m-rig">
    <g class="m-legs">
      <rect x="76" y="194" width="16" height="20" rx="6"/>
      <rect x="108" y="194" width="16" height="20" rx="6"/>
      <rect class="m-foot" x="70" y="208" width="26" height="9" rx="4.5"/>
      <rect class="m-foot" x="104" y="208" width="26" height="9" rx="4.5"/>
    </g>
    <rect class="m-torso" x="66" y="146" width="68" height="54" rx="16"/>
    <text class="m-chest" x="100" y="180">&lt;/&gt;</text>
    <g class="m-head">
      <line class="m-antenna" x1="100" y1="40" x2="100" y2="20"/>
      <circle class="m-led" cx="100" cy="15" r="6.5"/>
      <rect class="m-neck" x="90" y="136" width="20" height="14" rx="4"/>
      <rect class="m-skull" x="32" y="38" width="136" height="104" rx="26"/>
      <rect class="m-screen" x="46" y="52" width="108" height="74" rx="14"/>
      <g class="m-scan">
        <line x1="52" y1="62" x2="148" y2="62"/><line x1="50" y1="74" x2="150" y2="74"/>
        <line x1="50" y1="86" x2="150" y2="86"/><line x1="50" y1="98" x2="150" y2="98"/>
        <line x1="50" y1="110" x2="150" y2="110"/>
      </g>
      <circle class="m-knob" cx="150" cy="134" r="3"/>
      <circle class="m-knob" cx="140" cy="134" r="3"/>
      <g class="m-face">
        <g class="m-eyes m-eyes-neutral">
          <rect x="70" y="72" width="15" height="24" rx="6"/>
          <rect x="115" y="72" width="15" height="24" rx="6"/>
        </g>
        <g class="m-eyes m-eyes-happy">
          <path d="M68 90 q9.5 -16 19 0"/>
          <path d="M113 90 q9.5 -16 19 0"/>
        </g>
        <g class="m-eyes m-eyes-sad">
          <path class="m-brow" d="M66 80 l20 -7"/>
          <path class="m-brow" d="M134 80 l-20 -7"/>
          <rect x="71" y="84" width="13" height="13" rx="6"/>
          <rect x="116" y="84" width="13" height="13" rx="6"/>
        </g>
        <g class="m-eyes m-eyes-think">
          <rect x="76" y="70" width="13" height="18" rx="6"/>
          <rect x="120" y="70" width="13" height="18" rx="6"/>
          <circle class="m-dot" cx="138" cy="112" r="2.5"/>
          <circle class="m-dot" cx="130" cy="112" r="2.5"/>
          <circle class="m-dot" cx="122" cy="112" r="2.5"/>
        </g>
        <g class="m-eyes m-eyes-excited">
          <path d="M77 68 l4 9 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z"/>
          <path d="M123 68 l4 9 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z"/>
        </g>
        <g class="m-eyes m-eyes-sleep">
          <path d="M68 86 q9.5 7 19 0"/>
          <path d="M113 86 q9.5 7 19 0"/>
        </g>
        <path class="m-mouth m-mouth-neutral" d="M91 110 h18"/>
        <path class="m-mouth m-mouth-happy" d="M86 104 q14 14 28 0"/>
        <path class="m-mouth m-mouth-sad" d="M89 114 q11 -9 22 0"/>
        <path class="m-mouth m-mouth-excited" d="M84 102 q16 20 32 0 z"/>
        <ellipse class="m-mouth m-mouth-sleep" cx="100" cy="110" rx="4" ry="3"/>
        <path class="m-mouth m-mouth-think" d="M92 110 q4 -3 8 0 q4 3 8 0"/>
        <ellipse class="m-cheek" cx="62" cy="104" rx="7" ry="4"/>
        <ellipse class="m-cheek" cx="138" cy="104" rx="7" ry="4"/>
        <path class="m-tear" d="M134 98 q5 8 0 11 q-5 -3 0 -11z"/>
      </g>
    </g>
    <!-- ruce až za hlavou, aby byla mávající ruka vidět před ní -->
    <g class="m-arm m-arm-left">
      <path d="M70 160 Q54 170 52 186"/>
      <circle cx="52" cy="190" r="7"/>
    </g>
    <g class="m-arm m-arm-right">
      <path d="M130 160 Q146 170 148 186"/>
      <circle cx="148" cy="190" r="7"/>
    </g>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------------ */
/* Globální sledování nečinnosti a pohybu kurzoru                             */
/* ------------------------------------------------------------------------ */

const instances = new Set();
let idleTimer = null;
let sleeping = false;
let pointerRaf = 0;

function resetIdle() {
  if (sleeping) {
    sleeping = false;
    eachInstance((m) => m.wake());
  }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    sleeping = true;
    eachInstance((m) => m.sleep());
  }, IDLE_TO_SLEEP_MS);
}

function onPointerMove(e) {
  if (pointerRaf) return;
  pointerRaf = requestAnimationFrame(() => {
    pointerRaf = 0;
    eachInstance((m) => m.lookAt(e.clientX, e.clientY));
  });
}

let globalListeners = false;
function ensureGlobalListeners() {
  if (globalListeners) return;
  globalListeners = true;
  ["pointerdown", "keydown", "scroll", "touchstart"].forEach((ev) =>
    window.addEventListener(ev, resetIdle, { passive: true })
  );
  window.addEventListener("pointermove", (e) => {
    resetIdle();
    onPointerMove(e);
  }, { passive: true });
  resetIdle();
}

/* ------------------------------------------------------------------------ */
/* Komponenta                                                                */
/* ------------------------------------------------------------------------ */

/**
 * @param {object} opts
 * @param {number} [opts.size=160]   šířka v px
 * @param {string} [opts.mood]       počáteční nálada
 * @param {"right"|"left"|"top"|"none"} [opts.bubble="right"] pozice bubliny
 * @param {boolean} [opts.followPointer=false] oči sledují kurzor
 * @param {boolean} [opts.interactive=true]    kliknutí = vtipná hláška
 */
export function createMascot({ size = 160, mood = "neutral", bubble = "right", followPointer = false, interactive = true, className = "" } = {}) {
  ensureGlobalListeners();
  const info = getMascotInfo();

  const figure = h("div", {
    class: "mascot-figure",
    style: { width: `${size}px` },
    html: mascotSvg(info.name),
  });
  const bubbleText = h("span", { class: "mascot-bubble-text" });
  const bubbleEl =
    bubble === "none"
      ? null
      : h("div", { class: "mascot-bubble", role: "status", "aria-live": "polite", hidden: true }, bubbleText);

  const el = h("div", { class: `mascot mascot-bubble-${bubble} ${className}`, dataset: { mood } }, figure, bubbleEl);

  let baseMood = mood;
  let moodTimer = null;
  let typing = null;
  let hideTimer = null;
  const face = figure.querySelector(".m-face");

  if (interactive) {
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `${info.name} – klikni pro hlášku`);
    const poke = () => api.say(mascotLine("poke"), { mood: "happy", duration: 3500 });
    figure.addEventListener("click", poke);
    figure.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        poke();
      }
    });
  }

  const api = {
    el,
    get mood() {
      return el.dataset.mood;
    },
    /**
     * Nastaví náladu. S `duration` se po čase vrátí k základní náladě.
     */
    setMood(newMood, duration = 0) {
      clearTimeout(moodTimer);
      // restart animací stejné nálady (např. opakovaná radost)
      if (el.dataset.mood === newMood) {
        el.dataset.mood = "neutral";
        void el.offsetWidth;
      }
      el.dataset.mood = newMood;
      if (duration) {
        moodTimer = setTimeout(() => (el.dataset.mood = baseMood), duration);
      } else {
        baseMood = newMood;
      }
    },
    /**
     * Maskot něco řekne v bublině (s efektem psaní).
     * @param {string} text
     * @param {{mood?: string, duration?: number, persist?: boolean}} opts
     */
    say(text, { mood: sayMood, duration = 0, persist = true } = {}) {
      if (sayMood) api.setMood(sayMood, duration);
      if (!bubbleEl || !text) return Promise.resolve();
      clearTimeout(hideTimer);
      typing?.cancel();
      bubbleEl.hidden = false;
      bubbleEl.classList.remove("is-popping");
      void bubbleEl.offsetWidth;
      bubbleEl.classList.add("is-popping");
      typing = typewriter(bubbleText, text, { speed: 22 });
      if (!persist) hideTimer = setTimeout(() => (bubbleEl.hidden = true), Math.max(3500, text.length * 70));
      return typing.done;
    },
    hideBubble() {
      if (bubbleEl) bubbleEl.hidden = true;
    },
    sleep() {
      if (el.dataset.mood === "sleep") return;
      api._beforeSleep = el.dataset.mood;
      el.dataset.mood = "sleep";
      if (bubbleEl && !bubbleEl.hidden) api._bubbleBeforeSleep = bubbleText.textContent;
      api.say(mascotLine("sleep"), { persist: true });
    },
    wake() {
      if (el.dataset.mood !== "sleep") return;
      el.dataset.mood = "wave";
      moodTimer = setTimeout(() => (el.dataset.mood = api._beforeSleep === "sleep" ? "neutral" : api._beforeSleep || baseMood), 1800);
      api.say(api._bubbleBeforeSleep || mascotLine("wake"), { persist: true });
    },
    /** Oči sledují bod na obrazovce (jen u neutrální nálady). */
    lookAt(x, y) {
      if (!followPointer || prefersReducedMotion() || !el.isConnected) return;
      const rect = figure.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.35;
      const dx = Math.max(-1, Math.min(1, (x - cx) / 400));
      const dy = Math.max(-1, Math.min(1, (y - cy) / 400));
      face.style.transform = `translate(${dx * 6}px, ${dy * 4}px)`;
    },
    destroy() {
      clearTimeout(moodTimer);
      clearTimeout(hideTimer);
      typing?.cancel();
      instances.delete(api);
      el.remove();
    },
  };

  instances.add(api);
  return api;
}

/** Projde živé instance; odpojené (stránka se změnila) průběžně zahazuje. */
function eachInstance(fn) {
  instances.forEach((m) => {
    if (!m.el.isConnected) {
      if (m._seen) instances.delete(m);
      return;
    }
    m._seen = true;
    fn(m);
  });
}
