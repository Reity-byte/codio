/**
 * Kurz 5: DOM a události – práce se stránkou, události, formuláře.
 * Ukázky a cvičení běží v režimu "dom" (iframe s živým náhledem).
 */
const KARTA_HTML = `<div class="karta">
  <h1 id="nadpis">Ahoj!</h1>
  <p class="text">Tohle je odstavec.</p>
</div>`;

const KARTA_CSS = `.karta { padding: 16px; border-radius: 12px; background: #eefaf5; }
.zvyraznena { background: #39ff9f; }`;

export default {
  id: "dom",
  title: "DOM a události",
  description: "Ovládni webovou stránku: hledání prvků, změny obsahu, kliknutí a formuláře.",
  icon: "</>",
  color: "yellow",
  lessons: [
    {
      id: "dom-zaklady",
      title: "Práce se stránkou",
      description: "querySelector, textContent a styly.",
      icon: "eye",
      theory: [
        {
          type: "text",
          md: `Každá webová stránka je pro JavaScript strom objektů – **DOM** (Document Object Model). Přes objekt \`document\` můžeš prvky najít a měnit:

- \`document.querySelector("#id")\` – najde **první** prvek podle CSS selektoru (\`#id\`, \`.trida\`, \`h1\`)
- \`prvek.textContent = "…"\` – změní text
- \`prvek.style.color = "red"\` – změní styl
- \`prvek.classList.add("trida")\` – přidá CSS třídu`,
        },
        { type: "code", code: `const nadpis = document.querySelector("#nadpis");\nnadpis.textContent = "Změněno JavaScriptem!";\nnadpis.style.color = "crimson";` },
        {
          type: "playground",
          mode: "dom",
          html: KARTA_HTML,
          css: KARTA_CSS,
          code: `const nadpis = document.querySelector("#nadpis");\nconst odstavec = document.querySelector(".text");\n\nnadpis.textContent = "Ahoj z JavaScriptu! 👋";\nodstavec.style.fontSize = "20px";\ndocument.querySelector(".karta").classList.add("zvyraznena");\n\nconsole.log("Nadpis teď je:", nadpis.textContent);`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: 'Co najde `document.querySelector(".tlacitko")`?',
          options: ["První prvek s třídou `tlacitko`", "Prvek s id `tlacitko`", "Všechny prvky s třídou `tlacitko`", "Prvek `<tlacitko>`"],
          answer: 0,
          explanation: "Tečka v selektoru znamená **třídu**. `querySelector` vrací jen **první** nalezený prvek (všechny vrací `querySelectorAll`).",
        },
        {
          type: "fill",
          prompt: "Doplň kód, který změní text nadpisu s id `titulek`.",
          code: `const h = document.querySelector("___");\nh.___ = "Nový text";`,
          blanks: [["#titulek"], ["textContent", "innerText"]],
          words: ["#titulek", ".titulek", "textContent", "value"],
          explanation: "Id se v selektoru píše s mřížkou `#`. Text prvku se mění přes `textContent`.",
        },
        {
          type: "code",
          mode: "dom",
          html: KARTA_HTML,
          css: KARTA_CSS,
          prompt: "Změň text nadpisu `#nadpis` na **Umím DOM!** a kartě `.karta` přidej třídu `zvyraznena`.",
          starter: "// tvůj kód\n",
          solution: 'document.querySelector("#nadpis").textContent = "Umím DOM!";\ndocument.querySelector(".karta").classList.add("zvyraznena");',
          tests: [
            { name: "Nadpis má text „Umím DOM!“", type: "check", code: 'return text("#nadpis") === "Umím DOM!";' },
            { name: "Karta má třídu zvyraznena", type: "check", code: 'return $(".karta").classList.contains("zvyraznena");' },
          ],
          hint: '`document.querySelector(".karta").classList.add("zvyraznena");`',
        },
      ],
    },
    {
      id: "udalosti",
      title: "Události a kliknutí",
      description: "addEventListener – stránka reaguje na uživatele.",
      icon: "bolt",
      theory: [
        {
          type: "text",
          md: `**Událost** je něco, co se stane: kliknutí, stisk klávesy, pohyb myši… Na událost „posloucháš“ pomocí \`addEventListener\` a předáš mu **funkci**, která se zavolá, až událost nastane.`,
        },
        { type: "code", code: `const tlacitko = document.querySelector("#tlacitko");\n\ntlacitko.addEventListener("click", () => {\n  console.log("Klik!");\n});` },
        { type: "tip", md: "Funkce se nespustí hned – jen se „zaregistruje“. Zavolá ji až prohlížeč při kliknutí." },
        {
          type: "playground",
          mode: "dom",
          html: `<button id="plus">+1</button>\n<p>Počet kliknutí: <strong id="pocet">0</strong></p>`,
          code: `let pocet = 0;\nconst tlacitko = document.querySelector("#plus");\nconst vystup = document.querySelector("#pocet");\n\ntlacitko.addEventListener("click", () => {\n  pocet++;\n  vystup.textContent = pocet;\n  console.log("Kliknuto", pocet + "×");\n});\n\n// Klikni na tlačítko v náhledu!`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Jakou událost použiješ pro kliknutí myší?",
          options: ['`"click"`', '`"press"`', '`"tap"`', '`"mouse"`'],
          answer: 0,
          explanation: "Kliknutí je událost `\"click\"` (funguje i při stisku Enteru na tlačítku a ťuknutí na mobilu).",
        },
        {
          type: "order",
          prompt: "Seřaď kód, který po kliknutí na tlačítko změní text odstavce.",
          lines: [
            'const btn = document.querySelector("#btn");',
            'const p = document.querySelector("#text");',
            'btn.addEventListener("click", () => {',
            '  p.textContent = "Kliknuto!";',
            "});",
          ],
          alternatives: [[1, 0, 2, 3, 4]],
          explanation: "Nejdřív si najdeš prvky, pak zaregistruješ posluchače, uvnitř kterého měníš text.",
        },
        {
          type: "code",
          mode: "dom",
          html: `<button id="prepni">Přepnout</button>\n<div id="lampa">💡 vypnuto</div>`,
          css: `#lampa { margin-top: 12px; padding: 12px; border-radius: 8px; background: #ddd; }\n#lampa.zapnuto { background: #ffe066; }`,
          prompt: "Po kliknutí na `#prepni` přepni u `#lampa` třídu `zapnuto` (použij `classList.toggle`) a nastav text na `💡 zapnuto` nebo `💡 vypnuto` podle stavu.",
          starter: 'const tlacitko = document.querySelector("#prepni");\nconst lampa = document.querySelector("#lampa");\n\n// tvůj kód\n',
          solution:
            'const tlacitko = document.querySelector("#prepni");\nconst lampa = document.querySelector("#lampa");\n\ntlacitko.addEventListener("click", () => {\n  lampa.classList.toggle("zapnuto");\n  const zapnuto = lampa.classList.contains("zapnuto");\n  lampa.textContent = zapnuto ? "💡 zapnuto" : "💡 vypnuto";\n});',
          tests: [
            { name: "Používá addEventListener", type: "source", pattern: "addEventListener\\s*\\(\\s*['\"`]click" },
            { name: "1. klik lampu zapne", type: "check", code: 'await click("#prepni"); return $("#lampa").classList.contains("zapnuto") && text("#lampa") === "💡 zapnuto";' },
            { name: "2. klik lampu vypne", type: "check", code: 'await click("#prepni"); return !$("#lampa").classList.contains("zapnuto") && text("#lampa") === "💡 vypnuto";' },
          ],
          hint: "Uvnitř posluchače: `lampa.classList.toggle(\"zapnuto\")` a pak podle `lampa.classList.contains(\"zapnuto\")` nastav text.",
        },
      ],
    },
    {
      id: "formulare",
      title: "Formuláře a vstupy",
      description: "Čtení hodnot z inputů a odeslání formuláře.",
      icon: "edit",
      theory: [
        {
          type: "text",
          md: `Hodnotu z textového pole přečteš přes \`input.value\` – je to vždy **text** (i když uživatel napíše číslo). Na číslo ho převedeš funkcí \`Number(...)\`.

Formulář při odeslání vyvolá událost \`"submit"\`. Prohlížeč by stránku znovu načetl – to zastavíš pomocí \`event.preventDefault()\`.`,
        },
        { type: "code", code: `form.addEventListener("submit", (event) => {\n  event.preventDefault();          // nenačítat stránku znovu\n  const jmeno = input.value.trim();\n  vystup.textContent = "Ahoj, " + jmeno;\n});` },
        {
          type: "playground",
          mode: "dom",
          html: `<form id="form">\n  <label>Tvoje jméno: <input id="jmeno" placeholder="Ada"></label>\n  <button>Pozdravit</button>\n</form>\n<p id="vystup"></p>`,
          code: `const form = document.querySelector("#form");\nconst input = document.querySelector("#jmeno");\nconst vystup = document.querySelector("#vystup");\n\nform.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const jmeno = input.value.trim() || "neznámý";\n  vystup.textContent = \`Ahoj, \${jmeno}! 👋\`;\n  input.value = "";\n});`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: 'Uživatel napíše do pole `<input id="vek">` číslo 15. Jaký typ má `document.querySelector("#vek").value`?',
          options: ["`string`", "`number`", "`boolean`", "`undefined`"],
          answer: 0,
          explanation: "Hodnota inputu je **vždy text**. Pro počítání ji převeď: `Number(input.value)`.",
        },
        {
          type: "bug",
          prompt: "Po odeslání formuláře stránka „problikne“ a text zmizí. Který řádek chybí/je špatně?",
          code: `form.addEventListener("submit", (event) => {\n  event.stopPropagation();\n  vystup.textContent = input.value;\n});`,
          bugLine: 2,
          fix: "  event.preventDefault();",
          explanation: "Výchozí akci (odeslání a znovunačtení stránky) zastaví `preventDefault()`, ne `stopPropagation()`.",
        },
        {
          type: "code",
          mode: "dom",
          html: `<form id="kalk">\n  <input id="a" type="number" value="2"> +\n  <input id="b" type="number" value="3">\n  <button>=</button>\n</form>\n<p>Výsledek: <strong id="vysledek">?</strong></p>`,
          prompt: "Při odeslání formuláře `#kalk` sečti čísla z `#a` a `#b` a výsledek napiš do `#vysledek`. Nezapomeň na `preventDefault()` a převod na číslo!",
          starter: 'const form = document.querySelector("#kalk");\n\n// tvůj kód\n',
          solution:
            'const form = document.querySelector("#kalk");\n\nform.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const a = Number(document.querySelector("#a").value);\n  const b = Number(document.querySelector("#b").value);\n  document.querySelector("#vysledek").textContent = a + b;\n});',
          tests: [
            { name: "Používá preventDefault", type: "source", pattern: "preventDefault\\s*\\(" },
            { name: "2 + 3 = 5", type: "check", code: 'await submit("#kalk"); return text("#vysledek") === "5";' },
            { name: "10 + 32 = 42 (převod na číslo)", type: "check", code: 'await type("#a", "10"); await type("#b", "32"); await submit("#kalk"); return text("#vysledek") === "42";' },
          ],
          hint: "Bez `Number(...)` by `\"10\" + \"32\"` dalo `\"1032\"`!",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "vytvareni-prvku",
      title: "Vytváření prvků",
      description: "createElement, append a remove – stránka roste z kódu.",
      icon: "edit",
      theory: [
        {
          type: "text",
          md: `Prvky nemusí být v HTML předem – JavaScript je umí **vytvořit**:

1. \`document.createElement("li")\` – vytvoří nový prvek (zatím není na stránce),
2. nastavíš mu text, třídy, atributy…,
3. \`rodic.append(prvek)\` – vloží ho na stránku (na konec rodiče).

Prvek odstraníš pomocí \`prvek.remove()\`.`,
        },
        { type: "code", code: `const seznam = document.querySelector("#seznam");\n\nconst li = document.createElement("li");\nli.textContent = "Nová položka";\nli.classList.add("nova");\nseznam.append(li);` },
        { type: "warn", md: "Na text od uživatele používej `textContent`, ne `innerHTML`. `innerHTML` by vložil i HTML značky – a to je bezpečnostní riziko (XSS)." },
        {
          type: "playground",
          mode: "dom",
          html: `<button id="pridat">Přidat ovoce</button>\n<ul id="seznam"></ul>`,
          code: `const ovoce = ["🍎 jablko", "🍌 banán", "🍇 hrozny", "🍓 jahoda"];\nlet index = 0;\n\ndocument.querySelector("#pridat").addEventListener("click", () => {\n  const li = document.createElement("li");\n  li.textContent = ovoce[index % ovoce.length];\n  li.addEventListener("click", () => li.remove()); // klik = smazat\n  document.querySelector("#seznam").append(li);\n  index++;\n});`,
        },
      ],
      exercises: [
        {
          type: "order",
          prompt: "Seřaď řádky tak, aby se na stránku přidal nový odstavec.",
          lines: ['const p = document.createElement("p");', 'p.textContent = "Ahoj!";', "document.body.append(p);"],
          explanation: "Nejdřív prvek vytvoříš, pak ho naplníš a nakonec vložíš na stránku.",
        },
        {
          type: "choice",
          prompt: "Co udělá `document.createElement(\"div\")`?",
          options: ["Vytvoří nový `div`, ale zatím ho nevloží na stránku", "Najde první `div` na stránce", "Vloží nový `div` na konec stránky", "Smaže všechny `div`y"],
          answer: 0,
          explanation: "`createElement` jen vytvoří prvek v paměti. Na stránku se dostane až přes `append` (nebo podobnou metodu).",
        },
        {
          type: "code",
          mode: "dom",
          html: `<ul id="nakup"></ul>`,
          prompt: "Pro každou položku pole `polozky` vytvoř `<li>` s jejím textem a vlož ho do `#nakup`.",
          starter: 'const polozky = ["chleba", "máslo", "kakao"];\nconst seznam = document.querySelector("#nakup");\n\n// tvůj kód\n',
          solution:
            'const polozky = ["chleba", "máslo", "kakao"];\nconst seznam = document.querySelector("#nakup");\n\nfor (const polozka of polozky) {\n  const li = document.createElement("li");\n  li.textContent = polozka;\n  seznam.append(li);\n}',
          tests: [
            { name: "Používá createElement", type: "source", pattern: "createElement\\s*\\(" },
            { name: "Seznam má 3 položky", type: "check", code: 'return $$("#nakup li").length === 3;' },
            { name: "Položky mají správný text", type: "check", code: 'return $$("#nakup li").map((li) => li.textContent).join(",") === "chleba,máslo,kakao";' },
          ],
          hint: "V cyklu `for…of`: `createElement(\"li\")`, `textContent = polozka`, `seznam.append(li)`.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "tridy-a-data",
      title: "Třídy a data-atributy",
      description: "classList.toggle a dataset – stav uložený v HTML.",
      icon: "settings",
      theory: [
        {
          type: "text",
          md: `Vzhled se nejlépe mění **CSS třídami** – styly zůstanou v CSS a JavaScript jen přepíná:

- \`classList.add("x")\`, \`classList.remove("x")\`
- \`classList.toggle("x")\` – přidá, když chybí; odebere, když tam je
- \`classList.contains("x")\` – má prvek třídu?

Do HTML můžeš uložit i vlastní data přes atributy \`data-…\`. V JS je najdeš v \`prvek.dataset\`: \`<button data-barva="red">\` → \`tlacitko.dataset.barva\`.`,
        },
        {
          type: "playground",
          mode: "dom",
          html: `<button data-barva="#ff5c7a">Červená</button>\n<button data-barva="#39ff9f">Zelená</button>\n<button data-barva="#2ee6ff">Modrá</button>\n<div id="ctverec"></div>`,
          css: `#ctverec { width: 120px; height: 120px; margin-top: 12px; border-radius: 12px; background: #ccc; transition: all 0.3s; }\n#ctverec.kulaty { border-radius: 50%; }`,
          code: `const ctverec = document.querySelector("#ctverec");\n\ndocument.querySelectorAll("[data-barva]").forEach((tlacitko) => {\n  tlacitko.addEventListener("click", () => {\n    ctverec.style.background = tlacitko.dataset.barva;\n  });\n});\n\nctverec.addEventListener("click", () => ctverec.classList.toggle("kulaty"));`,
        },
      ],
      exercises: [
        {
          // typ choice (ne output) – kód potřebuje stránku, kontrola obsahu ho nespouští
          type: "choice",
          prompt: "**Co vypíše tento kód?**",
          code: `// <div id="box" class="a"></div>\nconst box = document.querySelector("#box");\nbox.classList.toggle("a");\nbox.classList.toggle("b");\nconsole.log(box.className);`,
          options: ["`b`", "`a b`", "`a`", "prázdný text"],
          answer: 0,
          explanation: "První `toggle` třídu `a` odebere (byla tam), druhý třídu `b` přidá (nebyla tam).",
        },
        {
          type: "fill",
          prompt: 'Doplň, jak přečíst hodnotu atributu `data-cena="49"` z prvku `produkt`.',
          code: `const cena = Number(produkt.___.___);`,
          blanks: [["dataset"], ["cena"]],
          words: ["dataset", "cena", "data", "value"],
          explanation: "Atributy `data-*` jsou v objektu `dataset` – bez předpony `data-`.",
        },
        {
          type: "code",
          mode: "dom",
          html: `<button class="hvezda" data-hodnota="1">★</button>\n<button class="hvezda" data-hodnota="2">★</button>\n<button class="hvezda" data-hodnota="3">★</button>\n<p>Hodnocení: <span id="hodnoceni">0</span></p>`,
          css: `.hvezda { font-size: 28px; background: none; border: 0; color: #bbb; cursor: pointer; }\n.hvezda.aktivni { color: #ffb547; }`,
          prompt:
            "Hodnocení hvězdičkami: po kliknutí na hvězdu zobraz v `#hodnoceni` její `data-hodnota` a třídu `aktivni` dej všem hvězdám **do této hodnoty včetně** (ostatním ji odeber).",
          starter: 'const hvezdy = document.querySelectorAll(".hvezda");\n\n// tvůj kód\n',
          solution:
            'const hvezdy = document.querySelectorAll(".hvezda");\n\nhvezdy.forEach((hvezda) => {\n  hvezda.addEventListener("click", () => {\n    const hodnota = Number(hvezda.dataset.hodnota);\n    document.querySelector("#hodnoceni").textContent = hodnota;\n    hvezdy.forEach((h) => {\n      h.classList.toggle("aktivni", Number(h.dataset.hodnota) <= hodnota);\n    });\n  });\n});',
          tests: [
            { name: "Klik na 2. hvězdu → hodnocení 2", type: "check", code: 'await click($$(".hvezda")[1]); return text("#hodnoceni") === "2";' },
            { name: "Aktivní jsou hvězdy 1 a 2", type: "check", code: 'return $$(".hvezda").map((h) => h.classList.contains("aktivni")).join() === "true,true,false";' },
            { name: "Klik na 1. hvězdu zhasne ostatní", type: "check", code: 'await click($$(".hvezda")[0]); return $$(".hvezda").map((h) => h.classList.contains("aktivni")).join() === "true,false,false" && text("#hodnoceni") === "1";' },
          ],
          hint: "`classList.toggle(\"aktivni\", podminka)` – s druhým parametrem třídu přidá, když je podmínka true, jinak ji odebere.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "klavesnice",
      title: "Psaní a klávesnice",
      description: "Události input a keydown – reakce na každé písmeno.",
      icon: "terminal",
      theory: [
        {
          type: "text",
          md: `Některé události se hodí pro okamžitou reakci:

- \`"input"\` – nastane **při každé změně** textového pole (napsání, smazání, vložení),
- \`"keydown"\` – stisk klávesy; která to byla, zjistíš z \`event.key\` (např. \`"Enter"\`, \`"a"\`, \`"ArrowUp"\`).`,
        },
        { type: "code", code: `input.addEventListener("input", () => {\n  pocet.textContent = input.value.length;\n});\n\ninput.addEventListener("keydown", (event) => {\n  if (event.key === "Enter") console.log("Odesláno:", input.value);\n});` },
        {
          type: "playground",
          mode: "dom",
          html: `<input id="zprava" placeholder="Napiš tweet…" maxlength="140">\n<p><span id="pocet">0</span> / 140</p>\n<p id="nahled"></p>`,
          code: `const vstup = document.querySelector("#zprava");\nconst pocet = document.querySelector("#pocet");\nconst nahled = document.querySelector("#nahled");\n\nvstup.addEventListener("input", () => {\n  pocet.textContent = vstup.value.length;\n  nahled.textContent = vstup.value.toUpperCase();\n});\n\nvstup.addEventListener("keydown", (e) => {\n  if (e.key === "Enter") {\n    console.log("Odesláno:", vstup.value);\n    vstup.value = "";\n    pocet.textContent = 0;\n  }\n});`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Která událost nastane při **každém** napsaném nebo smazaném znaku v textovém poli?",
          options: ['`"input"`', '`"change"`', '`"submit"`', '`"click"`'],
          answer: 0,
          explanation: "`input` reaguje okamžitě. `change` nastane až po opuštění pole (nebo potvrzení).",
        },
        {
          type: "fill",
          prompt: "Doplň podmínku, která pozná stisk klávesy Enter.",
          code: `pole.addEventListener("keydown", (event) => {\n  if (event.___ === "___") {\n    odesli();\n  }\n});`,
          blanks: [["key"], ["Enter"]],
          words: ["key", "Enter", "code", "enter"],
          explanation: "Název klávesy je v `event.key` a pro Enter má hodnotu `\"Enter\"` (s velkým E).",
        },
        {
          type: "code",
          mode: "dom",
          html: `<input id="jmeno" placeholder="Tvoje jméno">\n<h2 id="pozdrav">Ahoj!</h2>`,
          prompt: "Při každé změně pole `#jmeno` zobraz v `#pozdrav` text `Ahoj, <jméno>!`. Když je pole prázdné, ukaž jen `Ahoj!`.",
          starter: 'const pole = document.querySelector("#jmeno");\nconst pozdrav = document.querySelector("#pozdrav");\n\n// tvůj kód\n',
          solution:
            'const pole = document.querySelector("#jmeno");\nconst pozdrav = document.querySelector("#pozdrav");\n\npole.addEventListener("input", () => {\n  const jmeno = pole.value.trim();\n  pozdrav.textContent = jmeno ? `Ahoj, ${jmeno}!` : "Ahoj!";\n});',
          tests: [
            { name: "Reaguje na událost input", type: "source", pattern: "addEventListener\\s*\\(\\s*['\"`]input" },
            { name: "Ada → „Ahoj, Ada!“", type: "check", code: 'await type("#jmeno", "Ada"); return text("#pozdrav") === "Ahoj, Ada!";' },
            { name: "Prázdné pole → „Ahoj!“", type: "check", code: 'await type("#jmeno", ""); return text("#pozdrav") === "Ahoj!";' },
          ],
          hint: "Ternární operátor: ``jmeno ? `Ahoj, ${jmeno}!` : \"Ahoj!\"``",
        },
      ],
    },
  ],
};
