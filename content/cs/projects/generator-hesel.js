/**
 * Projekt: Generátor hesel (4 kroky).
 */
const HTML = `<main class="gen">
  <h1>Generátor hesel 🔐</h1>
  <label>Délka: <input id="delka" type="number" value="12" min="4" max="64"></label>
  <div class="volby">
    <label><input type="checkbox" id="velka" checked> Velká písmena</label>
    <label><input type="checkbox" id="cisla" checked> Číslice</label>
    <label><input type="checkbox" id="symboly"> Symboly</label>
  </div>
  <button id="generuj">Vygenerovat</button>
  <output id="heslo"></output>
  <p id="sila"></p>
  <h2>Historie</h2>
  <ol id="historie"></ol>
</main>`;

const CSS = `body { font-family: system-ui, sans-serif; background: #0b1b18; color: #e8fff7; display: grid; place-items: center; min-height: 90vh; }
.gen { display: grid; gap: 12px; width: 320px; padding: 20px; border: 2px solid #c77dff; border-radius: 16px; background: #102824; }
.volby { display: grid; gap: 4px; }
input[type="number"] { width: 70px; padding: 6px; border-radius: 6px; }
button { padding: 10px; font-size: 16px; font-weight: 700; border: 0; border-radius: 8px; background: #c77dff; color: #1a0630; cursor: pointer; }
#heslo { display: block; min-height: 1.6em; padding: 10px; border-radius: 8px; background: #031510; color: #39ff9f; font: 700 18px ui-monospace, monospace; word-break: break-all; }`;

const BASE = `const MALA = "abcdefghijklmnopqrstuvwxyz";
const VELKA = MALA.toUpperCase();
const CISLA = "0123456789";
const SYMBOLY = "!@#$%&*?-_=+";

// Vrátí náhodné heslo dané délky ze zvolených sad znaků
function vygeneruj(delka, sady = {}) {
  let znaky = MALA;
  if (sady.velka) znaky += VELKA;
  if (sady.cisla) znaky += CISLA;
  if (sady.symboly) znaky += SYMBOLY;

  let heslo = "";
  for (let i = 0; i < delka; i++) {
    heslo += znaky[Math.floor(Math.random() * znaky.length)];
  }
  return heslo;
}`;

const STEP2 = `${BASE}

document.querySelector("#generuj").addEventListener("click", () => {
  const delka = Number(document.querySelector("#delka").value);
  const heslo = vygeneruj(delka, {
    velka: document.querySelector("#velka").checked,
    cisla: document.querySelector("#cisla").checked,
    symboly: document.querySelector("#symboly").checked,
  });
  document.querySelector("#heslo").textContent = heslo;
});`;

const FINAL = `${BASE}

// Jednoduché hodnocení síly hesla
function sila(heslo) {
  let body = 0;
  if (heslo.length >= 12) body++;
  if (heslo.length >= 16) body++;
  if (/[A-Z]/.test(heslo)) body++;
  if (/[0-9]/.test(heslo)) body++;
  if (/[^A-Za-z0-9]/.test(heslo)) body++;
  if (body <= 2) return "slabé";
  if (body === 3) return "střední";
  return "silné";
}

document.querySelector("#generuj").addEventListener("click", () => {
  const delka = Number(document.querySelector("#delka").value);
  const heslo = vygeneruj(delka, {
    velka: document.querySelector("#velka").checked,
    cisla: document.querySelector("#cisla").checked,
    symboly: document.querySelector("#symboly").checked,
  });
  document.querySelector("#heslo").textContent = heslo;
  document.querySelector("#sila").textContent = \`Síla hesla: \${sila(heslo)}\`;
});`;

// Krok 4: historie posledních 5 hesel (nejnovější nahoře)
const STEP4 = `${FINAL}

// Historie: po každém kliknutí na Vygenerovat přidáme heslo do seznamu.
// (Druhý posluchač stejného tlačítka se spustí po tom prvním, heslo už je zobrazené.)
document.querySelector("#generuj").addEventListener("click", () => {
  pridejDoHistorie(document.querySelector("#heslo").textContent);
});

const historie = [];

function pridejDoHistorie(heslo) {
  historie.unshift(heslo);         // na začátek pole
  if (historie.length > 5) historie.pop();

  const seznam = document.querySelector("#historie");
  seznam.innerHTML = "";
  for (const h of historie) {
    const li = document.createElement("li");
    li.textContent = h;
    seznam.append(li);
  }
}`;

export default {
  id: "generator-hesel",
  title: "Generátor hesel",
  description: "Vytvoř si bezpečná hesla. Náhoda, práce s textem, checkboxy a regulární výrazy.",
  difficulty: 2,
  icon: "lock",
  color: "purple",
  recommendedAfter: "funkce",
  badge: { name: "Strážce hesel", description: "Dokonči projekt Generátor hesel.", icon: "lock", color: "red" },
  starter: { html: HTML, css: CSS, js: "// Bezpečnost především!\n" },
  final: { html: HTML, css: CSS, js: STEP4 },
  steps: [
    {
      title: "Náhodné heslo",
      instructions: `Napiš funkci \`vygeneruj(delka, sady)\`, která vrátí náhodné heslo dané délky.

- Základ tvoří malá písmena \`a–z\`.
- Pokud \`sady.velka\`, \`sady.cisla\` nebo \`sady.symboly\` je \`true\`, přidej do výběru i tyto znaky.
- Náhodný znak z textu: \`znaky[Math.floor(Math.random() * znaky.length)]\`.

Parametr \`sady\` dej výchozí hodnotu \`{}\`, aby šlo volat i \`vygeneruj(10)\`.`,
      hint: "V cyklu `for` připojuj k heslu po jednom náhodném znaku.",
      solution: { js: BASE },
      tests: [
        { name: "vygeneruj(10) má délku 10", type: "check", code: "return vygeneruj(10).length === 10;" },
        { name: "Bez voleb jen malá písmena", type: "check", code: "return /^[a-z]+$/.test(vygeneruj(40));" },
        { name: "S číslicemi obsahuje jen povolené znaky", type: "check", code: "const h = vygeneruj(200, { cisla: true }); return /^[a-z0-9]+$/.test(h) && /[0-9]/.test(h);" },
      ],
    },
    {
      title: "Tlačítko a volby",
      instructions: `Propoj funkci se stránkou: po kliknutí na \`#generuj\` přečti délku z \`#delka\` a zaškrtnutí checkboxů \`#velka\`, \`#cisla\`, \`#symboly\` (vlastnost \`.checked\`) a vygenerované heslo zobraz v \`#heslo\`.`,
      hint: '`document.querySelector("#cisla").checked` je `true`, když je políčko zaškrtnuté.',
      solution: { js: STEP2 },
      tests: [
        { name: "Heslo má zvolenou délku", type: "check", code: 'await type("#delka", "20"); await click("#generuj"); return text("#heslo").length === 20;' },
        {
          name: "Respektuje vypnuté volby",
          type: "check",
          code: '$("#velka").checked = false; $("#cisla").checked = false; $("#symboly").checked = false; await click("#generuj"); return /^[a-z]+$/.test(text("#heslo"));',
        },
      ],
    },
    {
      title: "Síla hesla",
      instructions: `Napiš funkci \`sila(heslo)\`, která vrátí \`"slabé"\`, \`"střední"\` nebo \`"silné"\`. Za každé splněné kritérium dej bod:

- délka aspoň 12, délka aspoň 16,
- obsahuje velké písmeno, číslici, symbol (pomůžou regulární výrazy jako \`/[A-Z]/.test(heslo)\`).

0–2 body = slabé, 3 = střední, 4–5 = silné. Výsledek po vygenerování zobraz v \`#sila\` jako \`Síla hesla: …\`.`,
      hint: "`/[^A-Za-z0-9]/` najde znak, který není písmeno ani číslice – tedy symbol.",
      solution: { js: FINAL },
      tests: [
        { name: "sila(\"abc\") → slabé", type: "call", expr: 'sila("abc")', expected: "slabé" },
        { name: "sila(\"Abcdefgh1234\") → střední", type: "call", expr: 'sila("Abcdefgh1234")', expected: "střední" },
        { name: "sila(\"Abcdefgh1234!@#$\") → silné", type: "call", expr: 'sila("Abcdefgh1234!@#$")', expected: "silné" },
        { name: "Síla se zobrazí na stránce", type: "check", code: 'await click("#generuj"); return text("#sila").startsWith("Síla hesla:");' },
      ],
    },
    {
      title: "Historie hesel",
      instructions: `Občas se hodí vrátit k heslu, které jsi vygeneroval před chvílí.

Po každém vygenerování přidej heslo do seznamu \`#historie\`:

- **nejnovější** heslo je nahoře (\`unshift\` přidá prvek na začátek pole),
- seznam ukazuje nejvýš **5** posledních hesel (starší vyhoď přes \`pop\`).`,
      hint: "Drž si pole `historie` a po každé změně celý `<ol>` znovu vykresli (`innerHTML = \"\"` a pak `append` pro každé heslo).",
      solution: { js: STEP4 },
      tests: [
        { name: "Nejnovější heslo je nahoře", type: "check", code: 'await click("#generuj"); return $$("#historie li").length === 1 && $$("#historie li")[0].textContent === text("#heslo");' },
        {
          name: "Ukazuje nejvýš 5 hesel",
          type: "check",
          code: 'for (let i = 0; i < 6; i++) await click("#generuj"); const li = $$("#historie li"); return li.length === 5 && li[0].textContent === text("#heslo");',
        },
      ],
    },
  ],
};
