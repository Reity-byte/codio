/**
 * Kurz 3: Funkce – deklarace, parametry, návratové hodnoty, arrow funkce a scope.
 * Lekce lze dále rozšiřovat ve stejném formátu.
 */
export default {
  id: "funkce",
  title: "Funkce",
  description: "Zabal kód do znovupoužitelných bloků: parametry, return, arrow funkce a scope.",
  icon: "ƒ()",
  color: "purple",
  lessons: [
    {
      id: "deklarace",
      title: "Vlastní funkce",
      description: "Deklarace, volání a parametry.",
      icon: "code",
      theory: [
        {
          type: "text",
          md: `**Funkce** je pojmenovaný kus kódu, který můžeš spustit (zavolat), kdykoli potřebuješ. Místo opakování stejného kódu ho napíšeš jednou.

- \`function jmeno(parametry) { … }\` – **deklarace** (vytvoření) funkce,
- \`jmeno(argumenty)\` – **volání** funkce.

**Parametry** jsou proměnné, do kterých se při volání dosadí předané hodnoty (**argumenty**).`,
        },
        { type: "code", code: `function pozdrav(jmeno) {\n  console.log("Ahoj, " + jmeno + "!");\n}\n\npozdrav("Ada");    // Ahoj, Ada!\npozdrav("Linus");  // Ahoj, Linus!` },
        {
          type: "playground",
          code: `function nakresliCaru(delka) {\n  console.log("-".repeat(delka));\n}\n\nnakresliCaru(5);\nnakresliCaru(12);\nnakresliCaru(3);`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Jak zavoláš funkci `skoc`?",
          options: ["`skoc();`", "`function skoc();`", "`call skoc;`", "`skoc;`"],
          answer: 0,
          explanation: "Funkce se volá jménem a kulatými závorkami: `skoc()`. Bez závorek se nespustí.",
        },
        {
          type: "output",
          code: `function dvakrat(text) {\n  console.log(text);\n  console.log(text);\n}\n\ndvakrat("hop");`,
          answer: "hop\nhop",
          explanation: "Při volání se do parametru `text` dosadí `\"hop\"` a funkce ho dvakrát vypíše.",
        },
        {
          type: "fill",
          prompt: "Doplň deklaraci funkce s parametrem `jmeno`.",
          code: `___ pozdrav(___) {\n  console.log("Ahoj " + jmeno);\n}`,
          blanks: [["function"], ["jmeno"]],
          words: ["function", "jmeno", "func", "def"],
          explanation: "Funkce se deklaruje klíčovým slovem `function`, parametr se píše do závorek.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `predstavSe(jmeno, vek)`, která vypíše `Jsem Ada a je mi 15 let.` (podle parametrů). Pak ji zavolej s hodnotami `\"Ada\"` a `15`.",
          starter: "// tvoje funkce\n\n\n// zavolání\n",
          solution: 'function predstavSe(jmeno, vek) {\n  console.log(`Jsem ${jmeno} a je mi ${vek} let.`);\n}\n\npredstavSe("Ada", 15);',
          tests: [
            { name: "Funkce predstavSe existuje", type: "check", code: "return typeof predstavSe === 'function';" },
            { name: "Má dva parametry", type: "check", code: "return predstavSe.length === 2;" },
            { name: "Vypíše správnou větu", type: "output", expected: "Jsem Ada a je mi 15 let." },
          ],
          hint: "``function predstavSe(jmeno, vek) { console.log(`Jsem ${jmeno} a je mi ${vek} let.`); }``",
        },
      ],
    },
    {
      id: "navratove-hodnoty",
      title: "Návratové hodnoty",
      description: "return – funkce, které něco spočítají.",
      icon: "arrowLeft",
      theory: [
        {
          type: "text",
          md: `Funkce může výsledek **vrátit** pomocí \`return\`. Vrácenou hodnotu pak uložíš do proměnné nebo hned použiješ.

\`return\` funkci zároveň **ukončí** – kód za ním se už neprovede.`,
        },
        { type: "code", code: `function secti(a, b) {\n  return a + b;\n}\n\nconst vysledek = secti(2, 3);\nconsole.log(vysledek);        // 5\nconsole.log(secti(10, 20));   // 30` },
        { type: "warn", md: "Rozdíl: `console.log` výsledek jen **ukáže**, `return` ho **předá** dál do programu. Funkce bez `return` vrací `undefined`." },
        {
          type: "playground",
          code: `function jeSude(cislo) {\n  return cislo % 2 === 0;\n}\n\nfunction obsahKruhu(r) {\n  return Math.PI * r * r;\n}\n\nconsole.log(jeSude(4), jeSude(7));\nconsole.log(obsahKruhu(2).toFixed(2));`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `function nasob(a, b) {\n  return a * b;\n}\n\nconsole.log(nasob(3, 4));`,
          answer: "12",
          explanation: "Funkce vrátí 3 · 4 = 12 a `console.log` tuto hodnotu vypíše.",
        },
        {
          type: "output",
          code: `function nic() {\n  const x = 5;\n}\n\nconsole.log(nic());`,
          options: ["`undefined`", "`5`", "`null`", "Chyba"],
          answer: 0,
          shuffle: false,
          explanation: "Funkce nemá `return`, takže vrací `undefined`.",
        },
        {
          type: "bug",
          prompt: "Funkce má vracet dvojnásobek čísla, ale `vysledek` je `undefined`. Kde je chyba?",
          code: `function dvojnasobek(n) {\n  n * 2;\n}\n\nconst vysledek = dvojnasobek(5);\nconsole.log(vysledek);`,
          bugLine: 2,
          fix: "  return n * 2;",
          explanation: "Výsledek se spočítá, ale nikam se nevrátí. Chybí `return`.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `secti(a, b)`, která **vrátí** součet dvou čísel. (Nic nevypisuj – testy funkci zavolají samy.)",
          starter: "function secti(a, b) {\n  // tvůj kód\n}\n",
          solution: "function secti(a, b) {\n  return a + b;\n}",
          tests: [
            { name: "secti(2, 3) vrátí 5", type: "call", expr: "secti(2, 3)", expected: 5 },
            { name: "secti(-1, 1) vrátí 0", type: "call", expr: "secti(-1, 1)", expected: 0 },
            { name: "secti(10, 32) vrátí 42", type: "call", expr: "secti(10, 32)", expected: 42 },
          ],
          hint: "Uvnitř funkce stačí `return a + b;`",
        },
        {
          type: "code",
          prompt: "Napiš funkci `znamka(body)`, která vrátí `\"A\"` pro 90+ bodů, `\"B\"` pro 70–89, `\"C\"` pro 50–69 a `\"F\"` pro méně.",
          starter: "function znamka(body) {\n  // tvůj kód\n}\n",
          solution: 'function znamka(body) {\n  if (body >= 90) return "A";\n  if (body >= 70) return "B";\n  if (body >= 50) return "C";\n  return "F";\n}',
          tests: [
            { name: "znamka(95) → A", type: "call", expr: "znamka(95)", expected: "A" },
            { name: "znamka(70) → B", type: "call", expr: "znamka(70)", expected: "B" },
            { name: "znamka(55) → C", type: "call", expr: "znamka(55)", expected: "C" },
            { name: "znamka(12) → F", type: "call", expr: "znamka(12)", expected: "F" },
          ],
          hint: "`return` funkci hned ukončí, takže můžeš psát podmínky za sebou: `if (body >= 90) return \"A\";` …",
        },
      ],
    },
    {
      id: "arrow-scope",
      title: "Arrow funkce a scope",
      description: "Krátký zápis funkcí a platnost proměnných.",
      icon: "arrowRight",
      theory: [
        {
          type: "text",
          md: `**Arrow funkce** (šipková) je kratší zápis. Když má jen jeden výraz, \`return\` a složené závorky se vynechají:`,
        },
        { type: "code", code: `// klasická funkce\nfunction na2(x) {\n  return x * x;\n}\n\n// arrow funkce\nconst na2b = (x) => x * x;\n\nconsole.log(na2(4), na2b(4)); // 16 16` },
        {
          type: "text",
          md: `### Scope (platnost proměnných)
Proměnná vytvořená uvnitř \`{ }\` (funkce, if, cyklu) existuje **jen uvnitř** těchto závorek. Zvenku ji nevidíš. Proměnné vytvořené venku ale funkce vidí.`,
        },
        { type: "code", code: `const globalni = "vidím všude";\n\nfunction test() {\n  const lokalni = "jen tady";\n  console.log(globalni, lokalni);\n}\n\ntest();\n// console.log(lokalni); // ReferenceError!` },
        {
          type: "playground",
          code: `const pozdrav = (jmeno) => \`Ahoj, \${jmeno}!\`;\nconst secti = (a, b) => a + b;\nconst nahodne = () => Math.floor(Math.random() * 6) + 1;\n\nconsole.log(pozdrav("Bajtíku"));\nconsole.log(secti(2, 40));\nconsole.log("Kostka:", nahodne());`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Která arrow funkce vrací dvojnásobek čísla?",
          options: ["`const dvakrat = (n) => n * 2;`", "`const dvakrat = (n) => { n * 2 };`", "`const dvakrat => (n) n * 2;`", "`arrow dvakrat(n) = n * 2;`"],
          answer: 0,
          explanation: "S jedním výrazem bez `{ }` se výsledek vrátí automaticky. Se `{ }` by bylo potřeba napsat `return`.",
        },
        {
          type: "bug",
          prompt: "Program skončí chybou `ReferenceError`. Na kterém řádku?",
          code: `function spocitej() {\n  const vysledek = 6 * 7;\n}\n\nspocitej();\nconsole.log(vysledek);`,
          bugLine: 6,
          fix: "// vysledek z funkce vrať pomocí return a ulož si ho:\n// const vysledek = spocitej();",
          explanation: "`vysledek` existuje jen uvnitř funkce (její scope). Zvenku k němu nemáš přístup.",
        },
        {
          type: "code",
          prompt: "Vytvoř arrow funkci `jeDospely`, která pro zadaný věk vrátí `true`, pokud je věk 18 a více, jinak `false`.",
          starter: "// const jeDospely = …\n",
          solution: "const jeDospely = (vek) => vek >= 18;",
          tests: [
            { name: "Je to arrow funkce", type: "source", pattern: "=>" },
            { name: "jeDospely(18) → true", type: "call", expr: "jeDospely(18)", expected: true },
            { name: "jeDospely(17) → false", type: "call", expr: "jeDospely(17)", expected: false },
            { name: "jeDospely(40) → true", type: "call", expr: "jeDospely(40)", expected: true },
          ],
          hint: "`const jeDospely = (vek) => vek >= 18;`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "vychozi-parametry",
      title: "Výchozí parametry",
      description: "Co když argument chybí? A jak vrátit víc hodnot.",
      icon: "settings",
      theory: [
        {
          type: "text",
          md: `Když funkci zavoláš s méně argumenty, chybějící parametry mají hodnotu \`undefined\`. Často je lepší dát jim **výchozí hodnotu** přímo v deklaraci:`,
        },
        { type: "code", code: `function pozdrav(jmeno = "kamaráde") {\n  return "Ahoj, " + jmeno + "!";\n}\n\nconsole.log(pozdrav("Ado")); // Ahoj, Ado!\nconsole.log(pozdrav());      // Ahoj, kamaráde!` },
        {
          type: "text",
          md: `### Víc výsledků najednou
\`return\` vrací jen **jednu** hodnotu. Když potřebuješ víc, vrať **objekt** nebo **pole** a na straně volajícího ho rozbal.`,
        },
        { type: "code", code: `function minMax(a, b) {\n  return { min: Math.min(a, b), max: Math.max(a, b) };\n}\n\nconst vysledek = minMax(8, 3);\nconsole.log(vysledek.min, vysledek.max); // 3 8` },
        {
          type: "playground",
          code: `function cena(zaklad, sleva = 0) {\n  return zaklad - zaklad * sleva;\n}\n\nconsole.log(cena(200));       // bez slevy\nconsole.log(cena(200, 0.25)); // 25% sleva\n\nfunction statistika(cisla) {\n  const soucet = cisla.reduce((a, b) => a + b, 0);\n  return { soucet, prumer: soucet / cisla.length };\n}\nconsole.log(statistika([2, 4, 9]));`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `function obal(text, znak = "*") {\n  return znak + text + znak;\n}\n\nconsole.log(obal("hi"));\nconsole.log(obal("hi", "#"));`,
          answer: "*hi*\n#hi#",
          explanation: "Při prvním volání chybí druhý argument, použije se výchozí `\"*\"`. Při druhém se předá `\"#\"`.",
        },
        {
          type: "output",
          code: `function f(a, b) {\n  return b;\n}\n\nconsole.log(f(1));`,
          options: ["`undefined`", "`1`", "`null`", "Chyba"],
          answer: 0,
          shuffle: false,
          explanation: "Druhý argument nebyl předán a parametr `b` nemá výchozí hodnotu – je tedy `undefined`.",
        },
        {
          type: "fill",
          prompt: "Doplň výchozí hodnotu tak, aby `mocnina(5)` vrátilo 25 (druhá mocnina).",
          code: `function mocnina(zaklad, exponent ___ 2) {\n  return zaklad ** exponent;\n}`,
          blanks: [["="]],
          words: ["=", "==", ":", "=>"],
          explanation: "Výchozí hodnota se zapisuje rovnítkem přímo v závorce: `exponent = 2`.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `obdelnik(a, b = a)`, která vrátí **objekt** `{ obsah, obvod }`. Když se zadá jen jedna strana, jde o čtverec.",
          starter: "function obdelnik(a, b = a) {\n  // tvůj kód\n}\n",
          solution: "function obdelnik(a, b = a) {\n  return { obsah: a * b, obvod: 2 * (a + b) };\n}",
          tests: [
            { name: "obdelnik(3, 4) → { obsah: 12, obvod: 14 }", type: "call", expr: "obdelnik(3, 4)", expected: { obsah: 12, obvod: 14 } },
            { name: "obdelnik(5) je čtverec", type: "call", expr: "obdelnik(5)", expected: { obsah: 25, obvod: 20 } },
          ],
          hint: "`return { obsah: a * b, obvod: 2 * (a + b) };`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "funkce-jako-hodnoty",
      title: "Funkce jako hodnoty",
      description: "Funkci můžeš uložit do proměnné i předat jiné funkci.",
      icon: "sparkles",
      theory: [
        {
          type: "text",
          md: `V JavaScriptu je funkce obyčejná **hodnota** – jako číslo nebo text. Můžeš ji uložit do proměnné, dát do pole, nebo **předat jiné funkci** jako argument. Takové předané funkci se říká **callback**.`,
        },
        {
          type: "code",
          code: `function dvakrat(akce) {\n  akce();\n  akce();\n}\n\ndvakrat(() => console.log("Hop!"));\n// Hop!\n// Hop!`,
          caption: "Funkci předáváme BEZ závorek (nebo jako šipkovou funkci) – zavolá ji až dvakrat().",
        },
        { type: "warn", md: "`dvakrat(skoc)` předá funkci. `dvakrat(skoc())` by funkci **hned zavolalo** a předalo jen její výsledek." },
        {
          type: "playground",
          code: `function proKazdy(pole, akce) {\n  for (const prvek of pole) {\n    akce(prvek);\n  }\n}\n\nproKazdy(["Ada", "Linus", "Grace"], (jmeno) => {\n  console.log("Ahoj, " + jmeno);\n});\n\nconst operace = {\n  plus: (a, b) => a + b,\n  krat: (a, b) => a * b,\n};\nconsole.log(operace.krat(6, 7));`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `function proved(fn, x) {\n  return fn(x);\n}\n\nconsole.log(proved((n) => n + 1, 41));`,
          answer: "42",
          explanation: "`proved` zavolá předanou funkci s argumentem 41 a vrátí výsledek 42.",
        },
        {
          type: "choice",
          prompt: "Máš funkci `function ahoj() { console.log(\"ahoj\"); }`. Který zápis ji předá jako callback do `setTimeout` (a nezavolá ji hned)?",
          options: ["`setTimeout(ahoj, 1000)`", "`setTimeout(ahoj(), 1000)`", "`setTimeout(\"ahoj\", 1000)`", "`setTimeout(function ahoj, 1000)`"],
          answer: 0,
          explanation: "Bez závorek předáváš samotnou funkci. `ahoj()` by ji zavolalo okamžitě.",
        },
        {
          type: "bug",
          prompt: "Program má vypsat „Klik!“ až po 1 sekundě, ale vypíše ho hned. Kde je chyba?",
          code: `function klik() {\n  console.log("Klik!");\n}\n\nsetTimeout(klik(), 1000);`,
          bugLine: 5,
          fix: "setTimeout(klik, 1000);",
          explanation: "`klik()` se zavolá hned a do `setTimeout` se předá jeho výsledek (`undefined`). Správně se předává `klik` bez závorek.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `opakuj(n, akce)`, která zavolá funkci `akce` přesně `n`-krát a pokaždé jí předá číslo pokusu (1, 2, …, n).",
          starter: "function opakuj(n, akce) {\n  // tvůj kód\n}\n\nopakuj(3, (i) => console.log(\"Kolo\", i));\n",
          solution: "function opakuj(n, akce) {\n  for (let i = 1; i <= n; i++) {\n    akce(i);\n  }\n}\n\nopakuj(3, (i) => console.log(\"Kolo\", i));",
          tests: [
            { name: "Vypíše Kolo 1 až Kolo 3", type: "output", expected: ["Kolo 1", "Kolo 2", "Kolo 3"] },
            { name: "Předává čísla 1…n", type: "check", code: "const seen = []; opakuj(4, (i) => seen.push(i)); return seen.join(',') === '1,2,3,4';" },
          ],
          hint: "V cyklu `for (let i = 1; i <= n; i++)` zavolej `akce(i)`.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "rekurze",
      title: "Rekurze",
      description: "Funkce, která volá sama sebe.",
      icon: "reset",
      theory: [
        {
          type: "text",
          md: `**Rekurze** je, když funkce volá **sama sebe** na menší verzi stejného problému. Každá rekurze potřebuje:

1. **ukončovací podmínku** – kdy už se dál nevolá,
2. **krok** – zavolání sama sebe s „menším“ vstupem.`,
        },
        { type: "code", code: `function odpocet(n) {\n  if (n === 0) {          // ukončovací podmínka\n    console.log("Start!");\n    return;\n  }\n  console.log(n);\n  odpocet(n - 1);          // krok\n}\n\nodpocet(3); // 3, 2, 1, Start!` },
        { type: "warn", md: "Bez ukončovací podmínky funkce volá sama sebe donekonečna a program spadne s chybou `Maximum call stack size exceeded`." },
        {
          type: "playground",
          code: `// Faktoriál: 5! = 5 · 4 · 3 · 2 · 1\nfunction faktorial(n) {\n  if (n <= 1) return 1;\n  return n * faktorial(n - 1);\n}\n\nconsole.log(faktorial(5));\nconsole.log(faktorial(10));`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Co musí mít každá rekurzivní funkce, aby program nespadl?",
          options: ["Ukončovací podmínku", "Cyklus `for`", "Návratovou hodnotu typu number", "Alespoň dva parametry"],
          answer: 0,
          explanation: "Bez ukončovací podmínky by se funkce volala donekonečna.",
        },
        {
          type: "output",
          code: `function f(n) {\n  if (n === 0) return 0;\n  return n + f(n - 1);\n}\n\nconsole.log(f(4));`,
          answer: "10",
          explanation: "f(4) = 4 + f(3) = 4 + 3 + f(2) = 4 + 3 + 2 + 1 + 0 = 10.",
        },
        {
          type: "bug",
          prompt: "Tahle funkce nikdy neskončí. Který řádek je špatně?",
          code: `function odpocet(n) {\n  if (n === 0) return;\n  console.log(n);\n  odpocet(n + 1);\n}\n\nodpocet(3);`,
          bugLine: 4,
          fix: "  odpocet(n - 1);",
          explanation: "Číslo se má zmenšovat k nule. S `n + 1` se nule nikdy nepřiblíží.",
        },
        {
          type: "code",
          prompt: "Napiš **rekurzivní** funkci `mocnina(zaklad, n)`, která vrátí `zaklad` na `n` (pro n ≥ 0). Nepoužívej `**` ani `Math.pow`.",
          starter: "function mocnina(zaklad, n) {\n  // tvůj kód\n}\n",
          solution: "function mocnina(zaklad, n) {\n  if (n === 0) return 1;\n  return zaklad * mocnina(zaklad, n - 1);\n}",
          tests: [
            { name: "mocnina(2, 10) → 1024", type: "call", expr: "mocnina(2, 10)", expected: 1024 },
            { name: "mocnina(5, 0) → 1", type: "call", expr: "mocnina(5, 0)", expected: 1 },
            { name: "mocnina(3, 3) → 27", type: "call", expr: "mocnina(3, 3)", expected: 27 },
            { name: "Je rekurzivní (volá sama sebe)", type: "source", pattern: "mocnina\\s*\\([^)]*\\)[\\s\\S]*mocnina\\s*\\(" },
            { name: "Nepoužívá ** ani Math.pow", type: "source", pattern: "\\*\\*|Math\\.pow", mustNot: true, message: "Zkus to bez ** a Math.pow – pomocí rekurze." },
          ],
          hint: "Cokoliv na nultou je 1. Jinak `zaklad * mocnina(zaklad, n - 1)`.",
        },
      ],
    },
  ],
};
