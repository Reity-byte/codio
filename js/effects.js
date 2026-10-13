/**
 * effects.js – vizuální a zvukové efekty:
 * konfety (vlastní lehká implementace na canvasu), zvuky přes Web Audio API
 * (bez externích souborů), Matrix pozadí a efekt psaní textu.
 * Vše respektuje nastavení animací/zvuku.
 */
import { getProgress } from "./storage.js";

/** true, pokud se mají omezit animace (nastavení nebo systém). */
export function prefersReducedMotion() {
  return document.documentElement.dataset.motion === "reduce";
}

/** Nastaví data-motion na <html> podle nastavení uživatele. */
export function applyMotionSetting(setting = getProgress().settings.motion) {
  const systemReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reduce = setting === "off" || (setting === "auto" && systemReduce);
  document.documentElement.dataset.motion = reduce ? "reduce" : setting === "on" ? "full" : "auto";
}

/* ------------------------------------------------------------------------ */
/* Zvuky                                                                     */
/* ------------------------------------------------------------------------ */

let audioCtx = null;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, start, duration, { type = "sine", volume = 0.08 } = {}) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  gain.gain.setValueAtTime(0, ac.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
}

const SOUNDS = {
  correct: () => {
    tone(660, 0, 0.12, { type: "triangle" });
    tone(990, 0.09, 0.18, { type: "triangle" });
  },
  wrong: () => {
    tone(220, 0, 0.16, { type: "square", volume: 0.04 });
    tone(165, 0.12, 0.22, { type: "square", volume: 0.04 });
  },
  complete: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.25, { type: "triangle", volume: 0.07 }));
  },
  click: () => tone(1200, 0, 0.03, { type: "square", volume: 0.02 }),
  unlock: () => {
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.07, 0.2, { type: "sine", volume: 0.06 }));
  },
  badge: () => {
    tone(784, 0, 0.15, { type: "triangle" });
    tone(1175, 0.12, 0.3, { type: "triangle" });
  },
  heart: () => tone(140, 0, 0.25, { type: "sawtooth", volume: 0.03 }),
};

export function playSound(name) {
  if (!getProgress().settings.sound) return;
  try {
    SOUNDS[name]?.();
  } catch {
    /* zvuk není kritický */
  }
}

/* ------------------------------------------------------------------------ */
/* Konfety                                                                   */
/* ------------------------------------------------------------------------ */

const CONFETTI_COLORS = ["#39ff9f", "#2ee6ff", "#c77dff", "#ffb547", "#ffe066"];

/**
 * Výbuch konfet z daného bodu (v procentech obrazovky).
 * @param {{x?: number, y?: number, count?: number, spread?: number}} opts
 */
export function confetti({ x = 0.5, y = 0.4, count = 120, spread = 1 } = {}) {
  if (prefersReducedMotion()) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.append(canvas);
  const c = canvas.getContext("2d");
  c.scale(dpr, dpr);

  const parts = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9 * spread;
    const speed = 7 + Math.random() * 9;
    return {
      x: x * innerWidth,
      y: y * innerHeight,
      vx: Math.cos(angle) * speed * (0.6 + Math.random()),
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: Math.random() < 0.3 ? "char" : "rect",
      char: ["{", "}", ";", "<", ">", "/", "0", "1"][Math.floor(Math.random() * 8)],
    };
  });

  const start = performance.now();
  function frame(now) {
    const elapsed = now - start;
    c.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28; // gravitace
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      c.save();
      c.globalAlpha = Math.max(0, 1 - elapsed / 2600);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      if (p.shape === "char") {
        c.font = `bold ${p.size * 2.2}px JetBrains Mono, monospace`;
        c.fillText(p.char, 0, 0);
      } else {
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      c.restore();
    }
    if (elapsed < 2600) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

/** Dvojitý výbuch z boků obrazovky – pro velké oslavy. */
export function celebrate() {
  confetti({ x: 0.2, y: 0.7, count: 90 });
  setTimeout(() => confetti({ x: 0.8, y: 0.7, count: 90 }), 180);
}

/* ------------------------------------------------------------------------ */
/* Matrix pozadí – nízké FPS, pauza při skryté kartě, vypnuto při reduce      */
/* ------------------------------------------------------------------------ */

export function startMatrixBackground(canvas) {
  if (!canvas) return () => {};
  const c = canvas.getContext("2d");
  const chars = "01{}[]()<>=+;:.constletif=>jsJS$_".split("");
  const fontSize = 16;
  let columns = 0;
  let drops = [];
  let running = true;
  let last = 0;

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    columns = Math.ceil(innerWidth / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -60);
  }
  resize();
  window.addEventListener("resize", resize);

  function draw(now) {
    if (!running) return;
    requestAnimationFrame(draw);
    if (prefersReducedMotion() || document.hidden) return;
    if (now - last < 66) return; // ~15 FPS stačí a šetří výkon
    last = now;
    c.fillStyle = "rgba(5, 9, 12, 0.16)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.font = `${fontSize}px JetBrains Mono, monospace`;
    for (let i = 0; i < columns; i++) {
      const y = drops[i] * fontSize;
      if (y > 0) {
        c.fillStyle = Math.random() < 0.06 ? "#2ee6ff" : "#1fae6a";
        c.fillText(chars[(Math.random() * chars.length) | 0], i * fontSize, y);
      }
      drops[i] += 0.5 + (i % 3) * 0.15;
      if (y > canvas.height && Math.random() > 0.975) drops[i] = Math.random() * -20;
    }
  }
  requestAnimationFrame(draw);

  return () => {
    running = false;
    window.removeEventListener("resize", resize);
    c.clearRect(0, 0, canvas.width, canvas.height);
  };
}

/* ------------------------------------------------------------------------ */
/* Efekt psaní textu                                                         */
/* ------------------------------------------------------------------------ */

/**
 * Postupně "napíše" text do elementu. Vrací Promise a funkci cancel.
 * Pro čtečky obrazovky je celý text dostupný hned (aria-label).
 */
export function typewriter(el, text, { speed = 28 } = {}) {
  let cancelled = false;
  el.setAttribute("aria-label", text);
  if (prefersReducedMotion()) {
    el.textContent = text;
    return { done: Promise.resolve(), cancel() {} };
  }
  el.textContent = "";
  const done = new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (cancelled) return resolve();
      i += text[i] === " " ? 2 : 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(tick, speed);
      else {
        el.removeAttribute("aria-label");
        resolve();
      }
    };
    tick();
  });
  return {
    done,
    cancel() {
      cancelled = true;
      el.textContent = text;
    },
  };
}
