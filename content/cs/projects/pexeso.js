/**
 * Projekt: Pexeso (4 kroky).
 */
const HTML = `<main class="pexeso">
  <h1>Pexeso 🧠</h1>
  <p>Tahy: <strong id="tahy">0</strong> · Rekord: <strong id="rekord">–</strong></p>
  <div id="plocha"></div>
  <p id="vyhra"></p>
  <button id="nova">Nová hra</button>
</main>`;

const CSS = `body { font-family: system-ui, sans-serif; background: #0b1b18; color: #e8fff7; display: grid; place-items: center; }
.pexeso { text-align: center; }
#plocha { display: grid; grid-template-columns: repeat(4, 64px); gap: 8px; justify-content: center; margin: 12px 0; }
.karta { width: 64px; height: 64px; font-size: 32px; border: 2px solid #2ee6ff; border-radius: 10px; background: #102824; cursor: pointer; transition: transform 0.2s; }
.karta.otocena { background: #e8fff7; transform: rotateY(180deg) scaleX(-1); }
.karta.nalezena { background: #39ff9f; border-color: #39ff9f; }
#vyhra { min-height: 1.5em; font-size: 20px; font-weight: 700; color: #39ff9f; }
#nova { padding: 8px 16px; font-weight: 700; border: 0; border-radius: 8px; background: #2ee6ff; cursor: pointer; }`;

const STEP1 = `const symboly = ["🍎", "🍌", "🍇", "🍓", "🥝", "🍒", "🍍", "🥥"];
const plocha = document.querySelector("#plocha");

// Fisher–Yates: spravedlivé zamíchání pole
function zamichej(pole) {
  const a = [...pole];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function novaHra() {
  plocha.innerHTML = "";
  zamichej([...symboly, ...symboly]).forEach((symbol) => {
    const karta = document.createElement("button");
    karta.className = "karta";
    karta.dataset.symbol = symbol;
    plocha.append(karta);
  });
}

novaHra();`;

const STEP2 = STEP1.replace(
  "    karta.dataset.symbol = symbol;\n",
  "    karta.dataset.symbol = symbol;\n    karta.addEventListener(\"click\", () => otoc(karta));\n"
).replace(
  "novaHra();",
  `function otoc(karta) {
  if (karta.classList.contains("otocena")) return;
  karta.classList.add("otocena");
  karta.textContent = karta.dataset.symbol;
}

novaHra();`
);

const FINAL = `const symboly = ["🍎", "🍌", "🍇", "🍓", "🥝", "🍒", "🍍", "🥥"];
const plocha = document.querySelector("#plocha");
const tahyEl = document.querySelector("#tahy");
const vyhraEl = document.querySelector("#vyhra");

let otocene = [];
let tahy = 0;
let zamceno = false; // během otáčení zpět nejde klikat

function zamichej(pole) {
  const a = [...pole];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function novaHra() {
  plocha.innerHTML = "";
  otocene = [];
  tahy = 0;
  zamceno = false;
  tahyEl.textContent = 0;
  vyhraEl.textContent = "";
  zamichej([...symboly, ...symboly]).forEach((symbol) => {
    const karta = document.createElement("button");
    karta.className = "karta";
    karta.dataset.symbol = symbol;
    karta.addEventListener("click", () => otoc(karta));
    plocha.append(karta);
  });
}

function otoc(karta) {
  if (zamceno || karta.classList.contains("otocena") || karta.classList.contains("nalezena")) return;
  karta.classList.add("otocena");
  karta.textContent = karta.dataset.symbol;
  otocene.push(karta);
  if (otocene.length === 2) vyhodnot();
}

function vyhodnot() {
  tahy++;
  tahyEl.textContent = tahy;
  const [a, b] = otocene;
  if (a.dataset.symbol === b.dataset.symbol) {
    a.classList.add("nalezena");
    b.classList.add("nalezena");
    otocene = [];
    if (document.querySelectorAll(".nalezena").length === symboly.length * 2) {
      vyhraEl.textContent = \`Vyhrál jsi na \${tahy} tahů! 🎉\`;
    }
  } else {
    zamceno = true;
    setTimeout(() => {
      a.classList.remove("otocena");
      b.classList.remove("otocena");
      a.textContent = "";
      b.textContent = "";
      otocene = [];
      zamceno = false;
    }, 800);
  }
}

document.querySelector("#nova").addEventListener("click", novaHra);
novaHra();`;

// Krok 4: rekord (nejmenší počet tahů) uložený v localStorage
const STEP4 = FINAL.replace(
  `let zamceno = false; // během otáčení zpět nejde klikat`,
  `let zamceno = false; // během otáčení zpět nejde klikat

const rekordEl = document.querySelector("#rekord");
let rekord = Number(localStorage.getItem("pexeso-rekord")) || null;
rekordEl.textContent = rekord ?? "–";`
).replace(
  `      vyhraEl.textContent = \`Vyhrál jsi na \${tahy} tahů! 🎉\`;`,
  `      vyhraEl.textContent = \`Vyhrál jsi na \${tahy} tahů! 🎉\`;
      if (rekord === null || tahy < rekord) {
        rekord = tahy;
        localStorage.setItem("pexeso-rekord", String(rekord));
        rekordEl.textContent = rekord;
        vyhraEl.textContent += " Nový rekord!";
      }`
);

// Pomocné kousky kódu pro testy: najdi dvojici / dvě různé karty
const FIND_PAIR = 'const karty = $$(".karta:not(.nalezena)"); const a = karty[0]; const b = karty.find((k) => k !== a && k.dataset.symbol === a.dataset.symbol);';

export default {
  id: "pexeso",
  title: "Pexeso",
  description: "Paměťová hra s kartičkami. Pole, míchání, stav hry a časovače.",
  difficulty: 3,
  icon: "star",
  color: "yellow",
  recommendedAfter: "pole-objekty",
  badge: { name: "Paměťový mág", description: "Dokonči projekt Pexeso.", icon: "star", color: "yellow" },
  starter: { html: HTML, css: CSS, js: "// Zamíchej karty a hrajeme!\n" },
  final: { html: HTML, css: CSS, js: STEP4 },
  steps: [
    {
      title: "Rozdání karet",
      instructions: `Máme 8 symbolů – každý musí být ve hře **dvakrát**.

1. Napiš funkci \`zamichej(pole)\`, která vrátí zamíchanou kopii pole.
2. Funkce \`novaHra()\` vytvoří 16 tlačítek s třídou \`karta\` a symbol si uloží do \`karta.dataset.symbol\` (zatím ho nezobrazuj!). Tlačítka vlož do \`#plocha\`.

Zdvojení pole: \`[...symboly, ...symboly]\`.`,
      hint: "Klasické míchání (Fisher–Yates): projdi pole od konce a každý prvek prohoď s náhodným prvkem před ním.",
      solution: { js: STEP1 },
      tests: [
        { name: "Na ploše je 16 karet", type: "check", code: 'return $$("#plocha .karta").length === 16;' },
        {
          name: "Každý symbol je tam dvakrát",
          type: "check",
          code: 'const pocty = {}; $$(".karta").forEach((k) => (pocty[k.dataset.symbol] = (pocty[k.dataset.symbol] || 0) + 1)); const v = Object.values(pocty); return v.length === 8 && v.every((n) => n === 2);',
        },
        { name: "Symboly zatím nejsou vidět", type: "check", code: 'return $$(".karta").every((k) => k.textContent.trim() === "");' },
      ],
    },
    {
      title: "Otáčení karet",
      instructions: `Po kliknutí na kartu ji „otoč“ – přidej třídu \`otocena\` a zobraz symbol (\`karta.textContent = karta.dataset.symbol\`).

Logiku dej do funkce \`otoc(karta)\`, kterou zavoláš z posluchače kliknutí.`,
      hint: '`karta.addEventListener("click", () => otoc(karta));`',
      solution: { js: STEP2 },
      tests: [
        {
          name: "Kliknutá karta se otočí",
          type: "check",
          code: 'const k = $$(".karta")[0]; await click(k); return k.classList.contains("otocena") && k.textContent === k.dataset.symbol;',
        },
      ],
    },
    {
      title: "Páry, tahy a výhra",
      instructions: `Teď skutečná hra:

1. Pamatuj si otočené karty v poli. Když jsou otočené **dvě**, zvyš počet tahů (\`#tahy\`).
2. Stejné symboly → obě karty dostanou třídu \`nalezena\` a zůstanou otočené.
3. Různé symboly → po 800 ms je otoč zpět (\`setTimeout\`). Během čekání nejde klikat.
4. Když jsou nalezené všechny páry, napiš do \`#vyhra\` gratulaci.
5. Tlačítko \`#nova\` spustí novou hru.`,
      hint: "Pole `otocene` – po druhé kartě zavolej `vyhodnot()`. Proměnná `zamceno` zabrání klikání během otáčení zpět.",
      solution: { js: FINAL },
      tests: [
        { name: "Nalezený pár zůstane", type: "check", code: `${FIND_PAIR} await click(a); await click(b); return a.classList.contains("nalezena") && b.classList.contains("nalezena") && text("#tahy") === "1";` },
        {
          name: "Různé karty se otočí zpět",
          type: "check",
          code: 'const karty = $$(".karta:not(.nalezena)"); const a = karty[0]; const b = karty.find((k) => k.dataset.symbol !== a.dataset.symbol); await click(a); await click(b); await wait(950); return !a.classList.contains("otocena") && !b.classList.contains("otocena") && text("#tahy") === "2";',
        },
        {
          name: "Po nalezení všech párů je výhra",
          type: "check",
          code: `for (let i = 0; i < 7; i++) { ${FIND_PAIR} await click(a); await click(b); } return $$(".nalezena").length === 16 && text("#vyhra") !== "";`,
        },
      ],
    },
    {
      title: "Rekord",
      instructions: `Hra je zábavnější, když je co překonávat!

1. Při startu načti rekord (nejmenší počet tahů) z \`localStorage\` pod klíčem \`"pexeso-rekord"\` a zobraz ho v \`#rekord\` (když žádný není, ukaž \`–\`).
2. Po výhře porovnej počet tahů s rekordem. Když je nový výsledek **lepší** (menší), ulož ho a zobraz.

Test spustí hru s uloženým rekordem 12 a dohraje ji bez jediné chyby (8 tahů).`,
      hint: '`let rekord = Number(localStorage.getItem("pexeso-rekord")) || null;` – a po výhře `localStorage.setItem("pexeso-rekord", String(tahy))`.',
      solution: { js: STEP4 },
      testStorage: { "pexeso-rekord": "12" },
      tests: [
        { name: "Zobrazí uložený rekord", type: "check", code: 'return text("#rekord") === "12";' },
        {
          name: "Lepší výsledek přepíše rekord",
          type: "check",
          code: `for (let i = 0; i < 8; i++) { ${FIND_PAIR} await click(a); await click(b); } return text("#tahy") === "8" && text("#rekord") === "8" && localStorage.getItem("pexeso-rekord") === "8";`,
        },
        {
          name: "Horší výsledek rekord nemění",
          type: "check",
          code: 'await click("#nova"); const karty = $$(".karta"); const a = karty[0]; const b = karty.find((k) => k.dataset.symbol !== a.dataset.symbol); await click(a); await click(b); await wait(900); ' +
            `for (let i = 0; i < 8; i++) { ${FIND_PAIR} await click(a); await click(b); } return text("#tahy") === "9" && localStorage.getItem("pexeso-rekord") === "8";`,
        },
      ],
    },
  ],
};
