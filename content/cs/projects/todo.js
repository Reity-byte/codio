/**
 * Projekt: To-do seznam s ukládáním do localStorage (plný obsah).
 * Pozn.: localStorage v náhledu je oddělený od dat aplikace (viz js/sandbox-runtime.js).
 */
const HTML = `<main class="todo">
  <h1>📝 Moje úkoly</h1>
  <form id="novy">
    <input id="text" placeholder="Co je potřeba udělat?" autocomplete="off">
    <button>Přidat</button>
  </form>
  <ul id="seznam"></ul>
  <p id="pocet"></p>
</main>`;

const CSS = `body { font-family: system-ui, sans-serif; background: #0b1b18; color: #e8fff7; }
.todo { max-width: 420px; margin: 24px auto; }
form { display: flex; gap: 8px; }
input { flex: 1; padding: 10px; font-size: 16px; border-radius: 8px; border: 2px solid #2ee6ff; }
button { padding: 10px 14px; font-weight: 700; border: 0; border-radius: 8px; background: #39ff9f; color: #032015; cursor: pointer; }
ul { list-style: none; padding: 0; }
li {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; margin: 6px 0; border-radius: 8px;
  background: #102824; cursor: pointer; user-select: none;
}
li.hotovo span { text-decoration: line-through; opacity: 0.5; }
.smazat { background: #ff5c7a; color: #fff; padding: 2px 8px; }
#pocet { opacity: 0.8; }`;

const STEP1 = `const seznam = document.querySelector("#seznam");

// Úkoly držíme v poli objektů
let ukoly = [{ text: "Naučit se JavaScript", hotovo: false }];

// Vykreslí celé pole do <ul>
function vykresli() {
  seznam.innerHTML = "";
  ukoly.forEach((ukol) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = ukol.text;
    li.append(span);
    seznam.append(li);
  });
}

vykresli();`;

const STEP2 = `const form = document.querySelector("#novy");
const vstup = document.querySelector("#text");
const seznam = document.querySelector("#seznam");

let ukoly = [{ text: "Naučit se JavaScript", hotovo: false }];

function vykresli() {
  seznam.innerHTML = "";
  ukoly.forEach((ukol) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = ukol.text;
    li.append(span);
    seznam.append(li);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = vstup.value.trim();
  if (!text) return; // prázdný úkol nepřidáváme
  ukoly.push({ text, hotovo: false });
  vstup.value = "";
  vykresli();
});

vykresli();`;

const STEP3 = `const form = document.querySelector("#novy");
const vstup = document.querySelector("#text");
const seznam = document.querySelector("#seznam");

let ukoly = [{ text: "Naučit se JavaScript", hotovo: false }];

function vykresli() {
  seznam.innerHTML = "";
  ukoly.forEach((ukol, index) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = ukol.text;
    if (ukol.hotovo) li.classList.add("hotovo");

    // kliknutí na úkol = splněno / nesplněno
    li.addEventListener("click", () => {
      ukol.hotovo = !ukol.hotovo;
      vykresli();
    });

    // tlačítko pro smazání
    const smazat = document.createElement("button");
    smazat.textContent = "✕";
    smazat.className = "smazat";
    smazat.addEventListener("click", (event) => {
      event.stopPropagation(); // ať se úkol zároveň neoznačí jako hotový
      ukoly.splice(index, 1);
      vykresli();
    });

    li.append(span, smazat);
    seznam.append(li);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = vstup.value.trim();
  if (!text) return;
  ukoly.push({ text, hotovo: false });
  vstup.value = "";
  vykresli();
});

vykresli();`;

const STEP4 = STEP3.replace(
  `    li.append(span, smazat);
    seznam.append(li);
  });
}`,
  `    li.append(span, smazat);
    seznam.append(li);
  });

  // počítadlo nesplněných úkolů
  const zbyva = ukoly.filter((ukol) => !ukol.hotovo).length;
  pocet.textContent = \`Zbývá: \${zbyva}\`;
}`
).replace(`const seznam = document.querySelector("#seznam");`, `const seznam = document.querySelector("#seznam");\nconst pocet = document.querySelector("#pocet");`);

const FINAL = STEP4.replace(
  `let ukoly = [{ text: "Naučit se JavaScript", hotovo: false }];`,
  `// Načtení uložených úkolů (nebo prázdné pole)
let ukoly = JSON.parse(localStorage.getItem("ukoly") || "[]");

function uloz() {
  localStorage.setItem("ukoly", JSON.stringify(ukoly));
}`
).replace(
  `  pocet.textContent = \`Zbývá: \${zbyva}\`;
}`,
  `  pocet.textContent = \`Zbývá: \${zbyva}\`;
  uloz();
}`
);

export default {
  id: "todo",
  title: "To-do seznam",
  description: "Seznam úkolů, který si pamatuje data i po zavření stránky. Pole objektů, DOM a localStorage.",
  difficulty: 2,
  icon: "list",
  color: "cyan",
  recommendedAfter: "dom",
  badge: { name: "Organizátor", description: "Dokonči projekt To-do seznam.", icon: "check", color: "cyan" },
  starter: {
    html: HTML,
    css: CSS,
    js: "// Tady vznikne tvůj to-do seznam.\n",
  },
  final: { html: HTML, css: CSS, js: FINAL },
  steps: [
    {
      title: "Úkoly v poli",
      instructions: `Úkoly budeme držet v **poli objektů**, např. \`{ text: "Nakoupit", hotovo: false }\`. Stránka se pak z pole jen „vykreslí“.

1. Vytvoř \`let ukoly\` – pole s jedním úkolem.
2. Napiš funkci \`vykresli()\`, která vymaže obsah \`#seznam\` (\`seznam.innerHTML = ""\`) a pro každý úkol vytvoří \`<li>\` s textem (text dej do \`<span>\`).
3. Funkci zavolej.`,
      hint: "Pro každý úkol: `const li = document.createElement(\"li\");` … `seznam.append(li);`",
      solution: { js: STEP1 },
      tests: [
        { name: "ukoly je pole a vykresli je funkce", type: "check", code: "return Array.isArray(ukoly) && typeof vykresli === 'function';" },
        {
          name: "vykresli() zobrazí všechny úkoly",
          type: "check",
          code: 'ukoly.push({ text: "Test z Codia", hotovo: false }); vykresli(); const li = $$("#seznam li"); return li.length === ukoly.length && li.some((x) => x.textContent.includes("Test z Codia"));',
        },
      ],
    },
    {
      title: "Přidávání úkolů",
      instructions: `Teď přidáme úkoly přes formulář \`#novy\`.

1. Poslouchej událost \`"submit"\` formuláře a zavolej \`event.preventDefault()\`.
2. Přečti text z \`#text\` a ořízni mezery (\`trim()\`). **Prázdný** úkol nepřidávej.
3. Přidej do pole objekt \`{ text, hotovo: false }\`, vymaž pole pro text a zavolej \`vykresli()\`.`,
      hint: "`ukoly.push({ text: text, hotovo: false });` a pak `vykresli();`",
      solution: { js: STEP2 },
      tests: [
        {
          name: "Přidá nový úkol",
          type: "check",
          code: 'const pred = $$("#seznam li").length; await type("#text", "Nakoupit"); await submit("#novy"); const li = $$("#seznam li"); return li.length === pred + 1 && li.at(-1).textContent.includes("Nakoupit");',
        },
        { name: "Vymaže textové pole", type: "check", code: 'await type("#text", "Uklidit"); await submit("#novy"); return $("#text").value === "";' },
        { name: "Prázdný úkol nepřidá", type: "check", code: 'const pred = $$("#seznam li").length; await type("#text", "   "); await submit("#novy"); return $$("#seznam li").length === pred;' },
      ],
    },
    {
      title: "Splnění a mazání",
      instructions: `Úkoly musí jít odškrtnout a smazat.

1. Kliknutí na \`<li>\` přepne \`ukol.hotovo\` a znovu vykreslí seznam. Hotový úkol dostane třídu \`hotovo\`.
2. Do každého \`<li>\` přidej tlačítko s třídou \`smazat\`, které úkol odebere z pole (\`ukoly.splice(index, 1)\`).

Tip: u tlačítka zavolej \`event.stopPropagation()\`, jinak se kliknutí „probublá“ i na \`<li>\`.`,
      hint: "`forEach((ukol, index) => { … })` – druhý parametr je index úkolu v poli.",
      solution: { js: STEP3 },
      tests: [
        {
          name: "Klik označí úkol jako hotový",
          type: "check",
          code: 'if (!ukoly.length) { await type("#text", "Úkol"); await submit("#novy"); } await click($$("#seznam li")[0]); return $$("#seznam li")[0].classList.contains("hotovo") && ukoly[0].hotovo === true;',
        },
        { name: "Druhý klik vrátí zpět", type: "check", code: 'await click($$("#seznam li")[0]); return !$$("#seznam li")[0].classList.contains("hotovo");' },
        {
          name: "Tlačítko .smazat úkol odstraní",
          type: "check",
          code: 'const pred = ukoly.length; const btn = $$("#seznam li")[0].querySelector(".smazat"); if (!btn) return { pass: false, message: "V <li> chybí tlačítko s třídou smazat." }; await click(btn); return ukoly.length === pred - 1 && $$("#seznam li").length === pred - 1;',
        },
      ],
    },
    {
      title: "Počítadlo",
      instructions: `Pod seznam vypiš do \`#pocet\` kolik úkolů **zbývá** (nesplněných), ve tvaru \`Zbývá: 2\`.

Počet spočítej na konci funkce \`vykresli()\` – třeba pomocí \`ukoly.filter(…).length\`.`,
      hint: "``pocet.textContent = `Zbývá: ${ukoly.filter((u) => !u.hotovo).length}`;``",
      solution: { js: STEP4 },
      tests: [
        { name: "Zobrazí počet zbývajících", type: "check", code: 'const n = ukoly.filter((u) => !u.hotovo).length; return text("#pocet") === `Zbývá: ${n}`;' },
        {
          name: "Aktualizuje se po přidání i splnění",
          type: "check",
          code: 'await type("#text", "Další"); await submit("#novy"); await click($$("#seznam li")[0]); const n = ukoly.filter((u) => !u.hotovo).length; return text("#pocet") === `Zbývá: ${n}`;',
        },
      ],
    },
    {
      title: "Ukládání do localStorage",
      instructions: `Po obnovení stránky úkoly zmizí. Opravíme to!

1. Při startu načti úkoly: \`JSON.parse(localStorage.getItem("ukoly") || "[]")\`.
2. Po každé změně (na konci \`vykresli()\`) ulož pole: \`localStorage.setItem("ukoly", JSON.stringify(ukoly))\`.

\`localStorage\` umí ukládat jen text – proto převod přes \`JSON\`. Test spustí stránku s jedním uloženým úkolem „Z paměti“.`,
      hint: "Nahraď počáteční pole: `let ukoly = JSON.parse(localStorage.getItem(\"ukoly\") || \"[]\");`",
      solution: { js: FINAL },
      testStorage: { ukoly: JSON.stringify([{ text: "Z paměti", hotovo: false }]) },
      tests: [
        { name: "Načte uložené úkoly", type: "check", code: 'return text("#seznam").includes("Z paměti");' },
        {
          name: "Ukládá při přidání",
          type: "check",
          code: 'await type("#text", "Uložit mě"); await submit("#novy"); const data = JSON.parse(localStorage.getItem("ukoly") || "[]"); return data.length === 2 && data[1].text === "Uložit mě";',
        },
        {
          name: "Ukládá i splnění",
          type: "check",
          code: 'await click($$("#seznam li")[0]); const data = JSON.parse(localStorage.getItem("ukoly") || "[]"); return data[0].hotovo === true;',
        },
      ],
    },
  ],
};
