/**
 * Projekt: Stopky (4 kroky).
 */
const HTML = `<main class="stopky">
  <div id="cas">00:00.0</div>
  <div class="ovladani">
    <button id="start">Start</button>
    <button id="stop">Stop</button>
    <button id="kolo">Kolo</button>
    <button id="reset">Reset</button>
  </div>
  <ol id="kola"></ol>
</main>`;

const CSS = `body { font-family: system-ui, sans-serif; background: #0b1b18; color: #e8fff7; display: grid; place-items: center; min-height: 90vh; }
.stopky { text-align: center; }
#cas { font: 800 56px ui-monospace, monospace; color: #39ff9f; text-shadow: 0 0 12px #39ff9f88; margin-bottom: 16px; }
.ovladani { display: flex; gap: 8px; justify-content: center; }
button { padding: 10px 16px; font-size: 16px; font-weight: 700; border: 0; border-radius: 10px; background: #2ee6ff; color: #021418; cursor: pointer; }
#start { background: #39ff9f; }
#reset { background: #ff5c7a; color: #fff; }
ol { text-align: left; font-family: ui-monospace, monospace; }
li.nejlepsi { color: #39ff9f; font-weight: 800; }
li.nejlepsi::after { content: " 🏆"; }`;

const STEP1 = `const casEl = document.querySelector("#cas");

// Převede milisekundy na text MM:SS.d
function formatuj(ms) {
  const minuty = Math.floor(ms / 60000);
  const sekundy = Math.floor((ms % 60000) / 1000);
  const desetiny = Math.floor((ms % 1000) / 100);
  return \`\${String(minuty).padStart(2, "0")}:\${String(sekundy).padStart(2, "0")}.\${desetiny}\`;
}

casEl.textContent = formatuj(0);`;

const STEP2 = `${STEP1}

let ubehlo = 0;          // naměřený čas z předchozích běhů
let posledniStart = 0;   // kdy jsme naposledy spustili
let interval = null;

function aktualniCas() {
  return interval ? ubehlo + (Date.now() - posledniStart) : ubehlo;
}

function obnov() {
  casEl.textContent = formatuj(aktualniCas());
}

document.querySelector("#start").addEventListener("click", () => {
  if (interval) return; // už běží
  posledniStart = Date.now();
  interval = setInterval(obnov, 100);
});

document.querySelector("#stop").addEventListener("click", () => {
  if (!interval) return;
  ubehlo += Date.now() - posledniStart;
  clearInterval(interval);
  interval = null;
  obnov();
});`;

const FINAL = `${STEP2}

const kola = document.querySelector("#kola");

document.querySelector("#kolo").addEventListener("click", () => {
  const li = document.createElement("li");
  li.textContent = formatuj(aktualniCas());
  kola.append(li);
});

document.querySelector("#reset").addEventListener("click", () => {
  clearInterval(interval);
  interval = null;
  ubehlo = 0;
  kola.innerHTML = "";
  obnov();
});`;

// Krok 4: délka každého kola a zvýraznění nejrychlejšího
const STEP4 = `${STEP2}

const kola = document.querySelector("#kola");
let posledniKolo = 0;   // čas, kdy skončilo předchozí kolo
const casyKol = [];

function zvyrazniNejlepsi() {
  const nejlepsi = Math.min(...casyKol);
  [...kola.children].forEach((li, i) => {
    li.classList.toggle("nejlepsi", casyKol[i] === nejlepsi);
  });
}

document.querySelector("#kolo").addEventListener("click", () => {
  const ted = aktualniCas();
  const delka = ted - posledniKolo;
  posledniKolo = ted;
  casyKol.push(delka);

  const li = document.createElement("li");
  li.textContent = \`Kolo \${casyKol.length}: \${formatuj(delka)}\`;
  kola.append(li);
  zvyrazniNejlepsi();
});

document.querySelector("#reset").addEventListener("click", () => {
  clearInterval(interval);
  interval = null;
  ubehlo = 0;
  posledniKolo = 0;
  casyKol.length = 0;
  kola.innerHTML = "";
  obnov();
});`;

export default {
  id: "stopky",
  title: "Stopky",
  description: "Přesné stopky s mezičasy. Časovače setInterval, práce s časem a formátování.",
  difficulty: 2,
  icon: "clock",
  color: "purple",
  recommendedAfter: "funkce",
  badge: { name: "Časoměřič", description: "Dokonči projekt Stopky.", icon: "clock", color: "purple" },
  starter: { html: HTML, css: CSS, js: "// Tik tak…\n" },
  final: { html: HTML, css: CSS, js: STEP4 },
  steps: [
    {
      title: "Formátování času",
      instructions: `Stopky měří v **milisekundách**, ale člověk chce vidět \`01:05.3\` (minuty:sekundy.desetiny).

Napiš funkci \`formatuj(ms)\`, která vrátí text ve tvaru \`MM:SS.d\`. Na doplnění nul použij \`String(cislo).padStart(2, "0")\`. Na začátku zobraz v \`#cas\` hodnotu \`formatuj(0)\`.`,
      hint: "Minuty: `Math.floor(ms / 60000)`, sekundy: `Math.floor((ms % 60000) / 1000)`, desetiny: `Math.floor((ms % 1000) / 100)`.",
      solution: { js: STEP1 },
      tests: [
        { name: "formatuj(0) → 00:00.0", type: "call", expr: "formatuj(0)", expected: "00:00.0" },
        { name: "formatuj(61500) → 01:01.5", type: "call", expr: "formatuj(61500)", expected: "01:01.5" },
        { name: "formatuj(9999) → 00:09.9", type: "call", expr: "formatuj(9999)", expected: "00:09.9" },
      ],
    },
    {
      title: "Start a Stop",
      instructions: `Tlačítko \`#start\` spustí časovač \`setInterval\`, který každých 100 ms obnoví zobrazený čas. \`#stop\` ho zastaví (\`clearInterval\`).

Pozor: interval není úplně přesný. Spolehlivější je pamatovat si **čas spuštění** (\`Date.now()\`) a počítat rozdíl.`,
      hint: "Při startu ulož `posledniStart = Date.now()`. Aktuální čas pak je `ubehlo + (Date.now() - posledniStart)`.",
      solution: { js: STEP2 },
      tests: [
        { name: "Po startu čas běží", type: "check", code: 'await click("#start"); await wait(350); return text("#cas") !== "00:00.0";' },
        { name: "Po stopu se čas zastaví", type: "check", code: 'await click("#stop"); const t = text("#cas"); await wait(300); return text("#cas") === t;' },
      ],
    },
    {
      title: "Mezičasy a reset",
      instructions: `1. Tlačítko \`#kolo\` přidá do seznamu \`#kola\` nový \`<li>\` s aktuálním časem.
2. Tlačítko \`#reset\` zastaví stopky, vynuluje čas na \`00:00.0\` a smaže mezičasy.`,
      hint: '`const li = document.createElement("li"); li.textContent = formatuj(aktualniCas()); kola.append(li);`',
      solution: { js: FINAL },
      tests: [
        { name: "Kolo přidá mezičas", type: "check", code: 'await click("#start"); await wait(150); await click("#kolo"); return $$("#kola li").length === 1;' },
        { name: "Reset vše vynuluje", type: "check", code: 'await click("#reset"); await wait(150); return text("#cas") === "00:00.0" && $$("#kola li").length === 0;' },
      ],
    },
    {
      title: "Nejrychlejší kolo",
      instructions: `Závodníky zajímá spíš **délka každého kola** než celkový čas.

1. Pamatuj si, kdy skončilo předchozí kolo, a do \`<li>\` piš délku aktuálního kola ve tvaru \`Kolo 1: 00:03.2\`.
2. Délky kol si ukládej do pole a **nejkratší** kolo označ třídou \`nejlepsi\` (ostatním ji odeber).
3. Reset musí vynulovat i paměť kol.`,
      hint: "Délka kola = `aktualniCas() - posledniKolo`. Nejkratší najdeš přes `Math.min(...casyKol)`.",
      solution: { js: STEP4 },
      tests: [
        { name: "Mezičas má tvar „Kolo 1: …“", type: "check", code: 'await click("#start"); await wait(120); await click("#kolo"); return $$("#kola li")[0].textContent.startsWith("Kolo 1:");' },
        {
          name: "Nejkratší kolo je zvýrazněné",
          type: "check",
          code: 'await wait(450); await click("#kolo"); const li = $$("#kola li"); return li[0].classList.contains("nejlepsi") && !li[1].classList.contains("nejlepsi");',
        },
        { name: "Druhé kolo měří jen svou délku", type: "check", code: 'const t = $$("#kola li")[1].textContent; return /Kolo 2: 00:00\\.[3-7]/.test(t);' },
        { name: "Reset smaže i paměť kol", type: "check", code: 'await click("#reset"); await click("#start"); await wait(100); await click("#kolo"); return $$("#kola li").length === 1 && $$("#kola li")[0].classList.contains("nejlepsi");' },
      ],
    },
  ],
};
