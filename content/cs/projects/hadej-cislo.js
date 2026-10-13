/**
 * Projekt: Hádej číslo (plný obsah).
 *
 * Formát projektu:
 *   starter  – výchozí soubory { html, css, js }
 *   final    – hotový výsledek (ukázka)
 *   steps[]  – { title, instructions (md), hint, solution: {soubory po kroku}, tests, testStorage? }
 * Testy kroků běží v náhledu (iframe) – viz README, sekce „Testy projektů“.
 */
const HTML = `<main class="hra">
  <h1>Hádej číslo 🎯</h1>
  <p>Myslím si číslo od 1 do 100. Uhodneš ho?</p>
  <div class="radek">
    <input id="tip" type="number" min="1" max="100" placeholder="Tvůj tip">
    <button id="hadej">Hádej</button>
  </div>
  <p id="zprava"></p>
  <p class="info">Počet pokusů: <span id="pokusy">0</span></p>
  <button id="znovu" class="vedlejsi">Nová hra</button>
</main>`;

const CSS = `body {
  font-family: system-ui, sans-serif;
  background: #0b1b18;
  color: #e8fff7;
  display: grid;
  place-items: center;
  min-height: 90vh;
}
.hra {
  text-align: center;
  padding: 24px 32px;
  border: 2px solid #39ff9f;
  border-radius: 16px;
  background: #102824;
}
.radek { display: flex; gap: 8px; justify-content: center; }
input {
  width: 120px;
  padding: 8px;
  font-size: 18px;
  border-radius: 8px;
  border: 2px solid #2ee6ff;
}
button {
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 700;
  border: 0;
  border-radius: 8px;
  background: #39ff9f;
  color: #032015;
  cursor: pointer;
}
.vedlejsi { background: #2ee6ff; margin-top: 8px; }
#zprava { min-height: 1.5em; font-size: 20px; font-weight: 700; }
.info { opacity: 0.8; }`;

const STEP1 = `// Tajné číslo od 1 do 100
let tajne = Math.floor(Math.random() * 100) + 1;
let pokusy = 0;

console.log("Pšt, tajné číslo je:", tajne);`;

const STEP2 = `const vstup = document.querySelector("#tip");
const tlacitko = document.querySelector("#hadej");
const zprava = document.querySelector("#zprava");
const pocitadlo = document.querySelector("#pokusy");

let tajne = Math.floor(Math.random() * 100) + 1;
let pokusy = 0;

tlacitko.addEventListener("click", () => {
  const tip = Number(vstup.value);
  pokusy++;
  pocitadlo.textContent = pokusy;
  console.log("Tip:", tip);
});`;

const STEP3 = `const vstup = document.querySelector("#tip");
const tlacitko = document.querySelector("#hadej");
const zprava = document.querySelector("#zprava");
const pocitadlo = document.querySelector("#pokusy");

let tajne = Math.floor(Math.random() * 100) + 1;
let pokusy = 0;

tlacitko.addEventListener("click", () => {
  const tip = Number(vstup.value);
  pokusy++;
  pocitadlo.textContent = pokusy;

  if (tip < tajne) {
    zprava.textContent = "Tajné číslo je větší ⬆";
  } else if (tip > tajne) {
    zprava.textContent = "Tajné číslo je menší ⬇";
  } else {
    zprava.textContent = \`Uhodl jsi na \${pokusy}. pokus! 🎉\`;
  }
});`;

const STEP4 = `const vstup = document.querySelector("#tip");
const tlacitko = document.querySelector("#hadej");
const zprava = document.querySelector("#zprava");
const pocitadlo = document.querySelector("#pokusy");

let tajne = Math.floor(Math.random() * 100) + 1;
let pokusy = 0;

tlacitko.addEventListener("click", () => {
  const tip = Number(vstup.value);

  // Kontrola vstupu – neplatný tip se nepočítá
  if (vstup.value === "" || tip < 1 || tip > 100) {
    zprava.textContent = "Zadej číslo od 1 do 100.";
    return;
  }

  pokusy++;
  pocitadlo.textContent = pokusy;

  if (tip < tajne) {
    zprava.textContent = "Tajné číslo je větší ⬆";
  } else if (tip > tajne) {
    zprava.textContent = "Tajné číslo je menší ⬇";
  } else {
    zprava.textContent = \`Uhodl jsi na \${pokusy}. pokus! 🎉\`;
  }
});`;

const FINAL = `${STEP4}

const znovu = document.querySelector("#znovu");

znovu.addEventListener("click", () => {
  tajne = Math.floor(Math.random() * 100) + 1;
  pokusy = 0;
  pocitadlo.textContent = 0;
  zprava.textContent = "";
  vstup.value = "";
  vstup.focus();
});`;

export default {
  id: "hadej-cislo",
  title: "Hádej číslo",
  description: "Počítač si myslí číslo a ty hádáš. Naučíš se náhodná čísla, události a podmínky.",
  difficulty: 1,
  icon: "target",
  color: "green",
  recommendedAfter: "rizeni-toku",
  badge: { name: "Věštec", description: "Dokonči projekt Hádej číslo.", icon: "target", color: "green" },
  starter: {
    html: HTML,
    css: CSS,
    js: "// Krok za krokem tu vznikne celá hra.\n// Vpravo vidíš živý náhled stránky.\n",
  },
  final: { html: HTML, css: CSS, js: FINAL },
  steps: [
    {
      title: "Tajné číslo",
      instructions: `Každá hra začíná tím, že si počítač **myslí číslo**.

1. Vytvoř proměnnou \`tajne\` (pomocí \`let\` – v posledním kroku ji budeme měnit) s náhodným celým číslem **od 1 do 100**.
2. Vytvoř proměnnou \`pokusy\` s hodnotou \`0\`.
3. Pro kontrolu tajné číslo vypiš do konzole.

\`Math.random()\` vrací náhodné číslo od 0 do 1 (bez jedničky). Vynásob ho stem, zaokrouhli dolů pomocí \`Math.floor()\` a přičti 1.`,
      hint: "`let tajne = Math.floor(Math.random() * 100) + 1;`",
      solution: { js: STEP1 },
      tests: [
        { name: "Používá Math.random()", type: "source", pattern: "Math\\.random\\s*\\(" },
        { name: "tajne je celé číslo 1–100", type: "check", code: "return typeof tajne === 'number' && Number.isInteger(tajne) && tajne >= 1 && tajne <= 100;" },
        { name: "pokusy začínají na 0", type: "check", code: "return pokusy === 0;" },
      ],
    },
    {
      title: "Tlačítko a počítání pokusů",
      instructions: `Teď hru propojíme se stránkou.

1. Najdi prvky \`#tip\` (pole pro tip), \`#hadej\` (tlačítko), \`#zprava\` a \`#pokusy\` pomocí \`document.querySelector\`.
2. Na tlačítko přidej posluchače události \`"click"\`.
3. Při každém kliknutí zvyš \`pokusy\` o 1 a jejich počet zobraz v \`#pokusy\`.

Hodnotu z pole přečteš přes \`vstup.value\` – je to text, převeď ho funkcí \`Number()\`.`,
      hint: '`tlacitko.addEventListener("click", () => { pokusy++; pocitadlo.textContent = pokusy; });`',
      solution: { js: STEP2 },
      tests: [
        { name: "Reaguje na kliknutí", type: "source", pattern: "addEventListener\\s*\\(\\s*['\"`]click" },
        { name: "1. klik → 1 pokus", type: "check", code: 'await type("#tip", "50"); await click("#hadej"); return text("#pokusy") === "1";' },
        { name: "2. klik → 2 pokusy", type: "check", code: 'await type("#tip", "20"); await click("#hadej"); return text("#pokusy") === "2";' },
      ],
    },
    {
      title: "Vyhodnocení tipu",
      instructions: `Hra musí hráči poradit. Po každém tipu vypiš do \`#zprava\`:

- když je tip **menší** než tajné číslo → text obsahující slovo **„větší“** (např. „Tajné číslo je větší ⬆“),
- když je tip **větší** → text se slovem **„menší“**,
- když se trefí → text se slovem **„Uhodl“** (třeba i s počtem pokusů).`,
      hint: "Použij `if (tip < tajne) … else if (tip > tajne) … else …` a nastavuj `zprava.textContent`.",
      solution: { js: STEP3 },
      tests: [
        {
          name: "Menší tip → „větší“",
          type: "check",
          code: 'if (tajne === 1) return true; await type("#tip", String(tajne - 1)); await click("#hadej"); return text("#zprava").includes("větší");',
        },
        {
          name: "Větší tip → „menší“",
          type: "check",
          code: 'if (tajne === 100) return true; await type("#tip", String(tajne + 1)); await click("#hadej"); return text("#zprava").includes("menší");',
        },
        { name: "Správný tip → „Uhodl“", type: "check", code: 'await type("#tip", String(tajne)); await click("#hadej"); return text("#zprava").includes("Uhodl");' },
      ],
    },
    {
      title: "Kontrola vstupu",
      instructions: `Co když hráč nic nenapíše nebo zadá 150? Takový tip **nesmí** zvýšit počet pokusů.

Na začátku obsluhy kliknutí zkontroluj, jestli je pole prázdné nebo číslo mimo rozsah 1–100. Pokud ano, vypiš do \`#zprava\` text obsahující **„1 do 100“** (např. „Zadej číslo od 1 do 100.“) a funkci ukonči pomocí \`return\`.`,
      hint: '`if (vstup.value === "" || tip < 1 || tip > 100) { zprava.textContent = "Zadej číslo od 1 do 100."; return; }`',
      solution: { js: STEP4 },
      tests: [
        {
          name: "Prázdný tip se nepočítá",
          type: "check",
          code: 'const pred = text("#pokusy"); await type("#tip", ""); await click("#hadej"); return text("#zprava").includes("1 do 100") && text("#pokusy") === pred;',
        },
        {
          name: "Tip 150 se nepočítá",
          type: "check",
          code: 'const pred = text("#pokusy"); await type("#tip", "150"); await click("#hadej"); return text("#zprava").includes("1 do 100") && text("#pokusy") === pred;',
        },
        { name: "Platný tip se počítá", type: "check", code: 'const pred = Number(text("#pokusy")); await type("#tip", "42"); await click("#hadej"); return Number(text("#pokusy")) === pred + 1;' },
      ],
    },
    {
      title: "Nová hra",
      instructions: `Poslední krok! Tlačítko \`#znovu\` má spustit novou hru:

- vymysli nové tajné číslo,
- vynuluj \`pokusy\` (i jejich zobrazení v \`#pokusy\`),
- vymaž text v \`#zprava\` a v poli \`#tip\`.

Hotovo? Zahraj si! 🎮`,
      hint: "V posluchači tlačítka `#znovu` nastav `tajne = …`, `pokusy = 0`, `pocitadlo.textContent = 0`, `zprava.textContent = \"\"` a `vstup.value = \"\"`.",
      solution: { js: FINAL },
      tests: [
        { name: "Tlačítko Nová hra reaguje", type: "source", pattern: "#znovu" },
        {
          name: "Vynuluje pokusy a zprávu",
          type: "check",
          code: 'await type("#tip", "10"); await click("#hadej"); await click("#znovu"); return text("#pokusy") === "0" && text("#zprava") === "" && $("#tip").value === "";',
        },
        { name: "Nové tajné číslo je platné", type: "check", code: 'await click("#znovu"); return Number.isInteger(tajne) && tajne >= 1 && tajne <= 100 && pokusy === 0;' },
      ],
    },
  ],
};
