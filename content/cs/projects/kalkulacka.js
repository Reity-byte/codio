/**
 * Projekt: Kalkulačka (4 kroky).
 */
const HTML = `<main class="kalk">
  <div id="displej">0</div>
  <div class="tlacitka">
    <button data-cislo="7">7</button><button data-cislo="8">8</button><button data-cislo="9">9</button><button class="op" data-op="/">÷</button>
    <button data-cislo="4">4</button><button data-cislo="5">5</button><button data-cislo="6">6</button><button class="op" data-op="*">×</button>
    <button data-cislo="1">1</button><button data-cislo="2">2</button><button data-cislo="3">3</button><button class="op" data-op="-">−</button>
    <button id="smazat">C</button><button data-cislo="0">0</button><button id="rovno">=</button><button class="op" data-op="+">+</button>
  </div>
</main>`;

const CSS = `body { font-family: system-ui, sans-serif; background: #0b1b18; display: grid; place-items: center; min-height: 90vh; }
.kalk { width: 260px; padding: 16px; border-radius: 18px; background: #102824; border: 2px solid #39ff9f; }
#displej { padding: 12px; margin-bottom: 12px; border-radius: 10px; background: #031510; color: #39ff9f;
  font: 700 32px ui-monospace, monospace; text-align: right; overflow: hidden; }
.tlacitka { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
button { padding: 14px 0; font-size: 20px; font-weight: 700; border: 0; border-radius: 10px; background: #1f3a36; color: #e8fff7; cursor: pointer; }
button:active { transform: translateY(2px); }
.op { background: #2ee6ff; color: #021418; }
#rovno { background: #39ff9f; color: #032015; }
#smazat { background: #ff5c7a; color: #fff; }`;

const STEP1 = `const displej = document.querySelector("#displej");
let aktualni = "";

// Každé tlačítko s číslem připíše svou číslici na displej
document.querySelectorAll("[data-cislo]").forEach((tlacitko) => {
  tlacitko.addEventListener("click", () => {
    aktualni += tlacitko.dataset.cislo;
    displej.textContent = aktualni;
  });
});`;

const STEP2 = `${STEP1}

let prvni = null;
let operator = null;

function spocitej(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return a / b;
}

document.querySelectorAll("[data-op]").forEach((tlacitko) => {
  tlacitko.addEventListener("click", () => {
    if (aktualni === "") return;
    prvni = Number(aktualni);
    operator = tlacitko.dataset.op;
    aktualni = "";
  });
});

document.querySelector("#rovno").addEventListener("click", () => {
  if (prvni === null || aktualni === "") return;
  const vysledek = spocitej(prvni, Number(aktualni), operator);
  displej.textContent = vysledek;
  aktualni = String(vysledek);
  prvni = null;
  operator = null;
});`;

const FINAL = STEP2.replace("  if (op === \"/\") return a / b;", "  if (op === \"/\") return b === 0 ? \"Chyba\" : a / b;")
  .replace("  aktualni = String(vysledek);", "  aktualni = vysledek === \"Chyba\" ? \"\" : String(vysledek);")
  .concat(`

document.querySelector("#smazat").addEventListener("click", () => {
  aktualni = "";
  prvni = null;
  operator = null;
  displej.textContent = "0";
});`);

const STEP3 = FINAL;

// Krok 4: ovládání klávesnicí (klávesa = kliknutí na odpovídající tlačítko)
const STEP4 = `${STEP3}

const KLAVESY = { Enter: "#rovno", "=": "#rovno", Escape: "#smazat", c: "#smazat" };

document.addEventListener("keydown", (event) => {
  let selektor = KLAVESY[event.key];
  if (!selektor && "0123456789".includes(event.key)) selektor = '[data-cislo="' + event.key + '"]';
  if (!selektor && "+-*/".includes(event.key)) selektor = '[data-op="' + event.key + '"]';
  if (selektor) {
    event.preventDefault();
    document.querySelector(selektor).click();
  }
});`;

const keys = (list) => list.map((k) => `await press("body", ${JSON.stringify(k)});`).join(" ");

const press = (keys) => keys.map((k) => (/[0-9]/.test(k) ? `await click('[data-cislo="${k}"]');` : k === "=" ? 'await click("#rovno");' : k === "C" ? 'await click("#smazat");' : `await click('[data-op="${k}"]');`)).join(" ");

export default {
  id: "kalkulacka",
  title: "Kalkulačka",
  description: "Klasická kalkulačka s tlačítky. Události, data-atributy a funkce.",
  difficulty: 1,
  icon: "code",
  color: "orange",
  recommendedAfter: "dom",
  badge: { name: "Matematik", description: "Dokonči projekt Kalkulačka.", icon: "bolt", color: "orange" },
  starter: { html: HTML, css: CSS, js: "// Rozpohybuj kalkulačku!\n" },
  final: { html: HTML, css: CSS, js: STEP4 },
  steps: [
    {
      title: "Psaní čísel",
      instructions: `Každé číselné tlačítko má atribut \`data-cislo\`. V JavaScriptu ho přečteš přes \`tlacitko.dataset.cislo\`.

1. Vytvoř proměnnou \`aktualni\` s prázdným textem.
2. Všem tlačítkům \`[data-cislo]\` (najdeš je přes \`querySelectorAll\`) přidej posluchače kliknutí.
3. Po kliknutí připiš číslici na konec \`aktualni\` a zobraz ji v \`#displej\`.`,
      hint: '`document.querySelectorAll("[data-cislo]").forEach((t) => t.addEventListener("click", () => { … }));`',
      solution: { js: STEP1 },
      tests: [
        { name: "Kliknutí na 1 a 2 zobrazí 12", type: "check", code: `${press(["1", "2"])} return text("#displej") === "12";` },
        { name: "Další číslice se připisují", type: "check", code: `${press(["0"])} return text("#displej") === "120";` },
      ],
    },
    {
      title: "Operace a výsledek",
      instructions: `Při kliknutí na operátor (\`[data-op]\`) si zapamatuj první číslo a operaci (\`+\`, \`-\`, \`*\`, \`/\`) a začni psát druhé číslo.

Tlačítko \`#rovno\` spočítá výsledek a zobrazí ho na displeji. Výpočet dej do samostatné funkce \`spocitej(a, b, op)\`.`,
      hint: "Text převeď na číslo pomocí `Number(aktualni)`. Operaci si ulož z `tlacitko.dataset.op`.",
      solution: { js: STEP2 },
      tests: [
        { name: "12 + 3 = 15", type: "check", code: `${press(["1", "2", "+", "3", "="])} return text("#displej") === "15";` },
        { name: "funkce spocitej(6, 7, '*') vrátí 42", type: "call", expr: "spocitej(6, 7, '*')", expected: 42 },
        { name: "Pokračování s výsledkem: 15 − 5 = 10", type: "check", code: `${press(["-", "5", "="])} return text("#displej") === "10";` },
      ],
    },
    {
      title: "Mazání a dělení nulou",
      instructions: `Dvě vylepšení na závěr:

1. Tlačítko \`#smazat\` (C) vše vynuluje a na displeji ukáže \`0\`.
2. Dělení nulou nesmí vrátit \`Infinity\` – zobraz místo toho text \`Chyba\`.`,
      hint: '`if (op === "/") return b === 0 ? "Chyba" : a / b;`',
      solution: { js: STEP3 },
      tests: [
        { name: "C vynuluje displej", type: "check", code: `${press(["9", "C"])} return text("#displej") === "0";` },
        { name: "8 ÷ 0 = Chyba", type: "check", code: `${press(["C", "8", "/", "0", "="])} return text("#displej") === "Chyba";` },
        { name: "Po chybě jde počítat dál", type: "check", code: `${press(["C", "2", "*", "4", "="])} return text("#displej") === "8";` },
      ],
    },
    {
      title: "Ovládání klávesnicí",
      instructions: `Opravdová kalkulačka se dá ovládat i z klávesnice.

Poslouchej událost \`"keydown"\` na celém \`document\` a podle \`event.key\`:

- číslice \`0–9\` → klikni na odpovídající \`[data-cislo]\`,
- \`+ - * /\` → klikni na \`[data-op]\`,
- \`Enter\` nebo \`=\` → \`#rovno\`, \`Escape\` → \`#smazat\`.

Nejjednodušší je tlačítko najít a zavolat na něm \`.click()\` – nemusíš psát logiku znovu.`,
      hint: "Udělej si objekt `KLAVESY = { Enter: \"#rovno\", Escape: \"#smazat\" }` a pro číslice sestav selektor `[data-cislo=\"7\"]`.",
      solution: { js: STEP4 },
      tests: [
        { name: "Klávesy 4 * 5 Enter → 20", type: "check", code: `${keys(["4", "*", "5", "Enter"])} return text("#displej") === "20";` },
        { name: "Escape vynuluje", type: "check", code: `${keys(["Escape"])} return text("#displej") === "0";` },
        { name: "Klávesa = počítá taky", type: "check", code: `${keys(["9", "-", "2", "="])} return text("#displej") === "7";` },
      ],
    },
  ],
};
