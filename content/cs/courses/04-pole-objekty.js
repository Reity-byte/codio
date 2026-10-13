/**
 * Kurz 4: Pole a objekty – pole, metody map/filter/reduce, objekty,
 * destrukturování, spread a procházení objektů.
 */
export default {
  id: "pole-objekty",
  title: "Pole a objekty",
  description: "Seznamy a struktury dat: map, filter, reduce, objekty, destrukturování a spread.",
  icon: "[ ]",
  color: "orange",
  lessons: [
    {
      id: "pole",
      title: "Pole",
      description: "Seznam hodnot pod jedním jménem.",
      icon: "list",
      theory: [
        {
          type: "text",
          md: `**Pole** (array) je seřazený seznam hodnot v hranatých závorkách. K prvkům se dostaneš přes **index** – pořadí od **nuly**.

- \`pole.length\` – počet prvků
- \`pole.push(x)\` – přidá prvek na konec
- \`pole.pop()\` – odebere poslední prvek
- \`for (const prvek of pole)\` – projde všechny prvky`,
        },
        { type: "code", code: `const ovoce = ["jablko", "banán", "kiwi"];\n\nconsole.log(ovoce[0]);      // jablko\nconsole.log(ovoce.length);  // 3\n\novoce.push("mango");\nconsole.log(ovoce);         // ["jablko", "banán", "kiwi", "mango"]\n\nfor (const kus of ovoce) {\n  console.log("Mám rád " + kus);\n}` },
        {
          type: "playground",
          code: `const znamky = [1, 2, 1, 3, 1];\nlet soucet = 0;\n\nfor (const z of znamky) {\n  soucet += z;\n}\n\nconsole.log("Počet známek:", znamky.length);\nconsole.log("Průměr:", soucet / znamky.length);`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const barvy = ["červená", "zelená", "modrá"];\nconsole.log(barvy[1]);`,
          answer: "zelená",
          explanation: "Indexy začínají nulou: `[0]` je červená, `[1]` je **zelená**.",
        },
        {
          type: "output",
          code: `const cisla = [5, 10];\ncisla.push(15);\nconsole.log(cisla.length);`,
          options: ["`3`", "`2`", "`15`", "`30`"],
          answer: 0,
          explanation: "`push` přidal třetí prvek, takže délka je 3.",
        },
        {
          type: "fill",
          prompt: "Doplň, aby cyklus prošel všechny prvky pole.",
          code: `const zvirata = ["pes", "kočka", "křeček"];\nfor (const zvire ___ zvirata) {\n  console.log(zvire);\n}`,
          blanks: [["of"]],
          words: ["of", "in", "from", "at"],
          explanation: "`for…of` prochází **hodnoty** pole. (`for…in` by procházel indexy jako texty.)",
        },
        {
          type: "code",
          prompt: "Napiš funkci `soucet(pole)`, která vrátí součet všech čísel v poli.",
          starter: "function soucet(pole) {\n  // tvůj kód\n}\n",
          solution: "function soucet(pole) {\n  let s = 0;\n  for (const n of pole) {\n    s += n;\n  }\n  return s;\n}",
          tests: [
            { name: "soucet([1, 2, 3]) → 6", type: "call", expr: "soucet([1, 2, 3])", expected: 6 },
            { name: "soucet([]) → 0", type: "call", expr: "soucet([])", expected: 0 },
            { name: "soucet([10, -5, 20]) → 25", type: "call", expr: "soucet([10, -5, 20])", expected: 25 },
          ],
          hint: "Začni s `let s = 0;`, v cyklu `for…of` přičítej a na konci `return s;`",
        },
      ],
    },
    {
      id: "metody-poli",
      title: "map, filter, reduce",
      description: "Supersíly polí bez psaní cyklů.",
      icon: "sparkles",
      theory: [
        {
          type: "text",
          md: `Pole mají metody, které přijímají **funkci** a zavolají ji pro každý prvek:

- \`map(fn)\` – vytvoří **nové pole**, kde je každý prvek přetvořený funkcí,
- \`filter(fn)\` – nové pole jen s prvky, pro které funkce vrátí \`true\`,
- \`reduce(fn, start)\` – „sloučí“ pole do jedné hodnoty (např. součet).`,
        },
        { type: "code", code: `const cisla = [1, 2, 3, 4, 5];\n\nconst dvojnasobky = cisla.map((n) => n * 2);       // [2, 4, 6, 8, 10]\nconst suda = cisla.filter((n) => n % 2 === 0);      // [2, 4]\nconst soucet = cisla.reduce((acc, n) => acc + n, 0); // 15` },
        { type: "tip", md: "Tyhle metody **nemění** původní pole – vrací nové. To je v JavaScriptu dobrý zvyk." },
        {
          type: "playground",
          code: `const ceny = [120, 45, 300, 80, 15];\n\nconst sDph = ceny.map((c) => Math.round(c * 1.21));\nconst levne = ceny.filter((c) => c < 100);\nconst celkem = ceny.reduce((s, c) => s + c, 0);\n\nconsole.log("S DPH:", sDph);\nconsole.log("Levné:", levne);\nconsole.log("Celkem:", celkem);`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const a = [1, 2, 3];\nconsole.log(a.map((x) => x * 10));`,
          answer: "[10, 20, 30]",
          accept: ["[10,20,30]", "[ 10, 20, 30 ]"],
          explanation: "`map` vynásobí každý prvek deseti a vrátí nové pole.",
        },
        {
          type: "choice",
          prompt: "Která metoda vybere z pole jen některé prvky?",
          options: ["`filter`", "`map`", "`reduce`", "`push`"],
          answer: 0,
          explanation: "`filter` ponechá jen prvky, pro které funkce vrátí `true`.",
        },
        {
          type: "fill",
          prompt: "Doplň metodu, která spočítá součet pole.",
          code: `const body = [3, 5, 2];\nconst celkem = body.___((acc, b) => acc + b, 0);\nconsole.log(celkem); // 10`,
          blanks: [["reduce"]],
          words: ["reduce", "map", "filter", "sum"],
          explanation: "`reduce` postupně „sbírá“ výsledek do akumulátoru `acc`.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `jenDospeli(lide)`, která z pole věků vrátí nové pole jen s věky **18 a více**. Použij `filter`.",
          starter: "function jenDospeli(lide) {\n  // tvůj kód\n}\n",
          solution: "function jenDospeli(lide) {\n  return lide.filter((vek) => vek >= 18);\n}",
          tests: [
            { name: "Používá filter", type: "source", pattern: "\\.filter\\s*\\(" },
            { name: "jenDospeli([12, 18, 30, 5]) → [18, 30]", type: "call", expr: "jenDospeli([12, 18, 30, 5])", expected: [18, 30] },
            { name: "jenDospeli([1, 2]) → []", type: "call", expr: "jenDospeli([1, 2])", expected: [] },
          ],
          hint: "`return lide.filter((vek) => vek >= 18);`",
        },
      ],
    },
    {
      id: "objekty",
      title: "Objekty, destrukturování a spread",
      description: "Data s pojmenovanými vlastnostmi.",
      icon: "book",
      theory: [
        {
          type: "text",
          md: `**Objekt** sdružuje hodnoty pod **klíči** (názvy vlastností). Zapisuje se do složených závorek.`,
        },
        { type: "code", code: `const hrac = {\n  jmeno: "Bajtík",\n  level: 3,\n  zbrane: ["klávesnice", "myš"],\n};\n\nconsole.log(hrac.jmeno);     // Bajtík\nhrac.level++;                // změna vlastnosti\nconsole.log(hrac["level"]);  // 4` },
        {
          type: "text",
          md: `### Destrukturování a spread
- **destrukturování** vybalí vlastnosti do proměnných: \`const { jmeno, level } = hrac;\`
- **spread** \`...\` rozbalí pole/objekt do nového: \`const kopie = { ...hrac, level: 10 };\``,
        },
        {
          type: "playground",
          code: `const auto = { znacka: "Škoda", rok: 2019, barva: "modrá" };\n\nconst { znacka, rok } = auto;\nconsole.log(znacka, rok);\n\nconst nalakovane = { ...auto, barva: "zelená" };\nconsole.log(nalakovane);\nconsole.log(auto.barva); // původní se nezměnil\n\nconst a = [1, 2];\nconst b = [...a, 3, 4];\nconsole.log(b);`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const pes = { jmeno: "Rex", vek: 4 };\nconsole.log(pes.jmeno);`,
          answer: "Rex",
          explanation: "K vlastnosti se dostaneš tečkou: `pes.jmeno`.",
        },
        {
          type: "fill",
          prompt: "Destrukturuj vlastnosti `x` a `y` z objektu `bod`.",
          code: `const bod = { x: 3, y: 7 };\nconst { ___, ___ } = bod;\nconsole.log(x + y); // 10`,
          blanks: [["x"], ["y"]],
          explanation: "Názvy v `{ }` musí odpovídat názvům vlastností objektu.",
        },
        {
          type: "output",
          code: `const a = [1, 2];\nconst b = [...a, 3];\nconsole.log(b);`,
          options: ["`[1, 2, 3]`", "`[[1, 2], 3]`", "`[3]`", "`[1, 2]`"],
          answer: 0,
          explanation: "Spread `...a` rozbalí prvky pole `a` do nového pole.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `popis(produkt)`, která z objektu `{ nazev, cena }` vrátí text `Rohlík stojí 3 Kč` (podle hodnot). Použij destrukturování.",
          starter: "function popis(produkt) {\n  // tvůj kód\n}\n",
          solution: "function popis(produkt) {\n  const { nazev, cena } = produkt;\n  return `${nazev} stojí ${cena} Kč`;\n}",
          tests: [
            { name: "Používá destrukturování", type: "source", pattern: "\\{\\s*\\w+\\s*,\\s*\\w+\\s*\\}\\s*=" },
            { name: "Rohlík za 3 Kč", type: "call", expr: 'popis({ nazev: "Rohlík", cena: 3 })', expected: "Rohlík stojí 3 Kč" },
            { name: "Mléko za 25 Kč", type: "call", expr: 'popis({ nazev: "Mléko", cena: 25 })', expected: "Mléko stojí 25 Kč" },
          ],
          hint: "``const { nazev, cena } = produkt; return `${nazev} stojí ${cena} Kč`;``",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "dalsi-metody",
      title: "Hledání a řazení",
      description: "find, some, every, includes, sort a join.",
      icon: "target",
      theory: [
        {
          type: "text",
          md: `Další užitečné metody polí:

- \`includes(x)\` – obsahuje pole hodnotu \`x\`? (\`true\`/\`false\`)
- \`find(fn)\` – vrátí **první** prvek, pro který funkce vrátí \`true\` (nebo \`undefined\`)
- \`some(fn)\` – platí podmínka **aspoň pro jeden** prvek?
- \`every(fn)\` – platí podmínka **pro všechny** prvky?
- \`join(", ")\` – spojí prvky do textu
- \`sort(fn)\` – seřadí pole (**mění** původní pole!)`,
        },
        { type: "code", code: `const cisla = [5, 12, 8, 130, 44];\n\nconsole.log(cisla.includes(8));           // true\nconsole.log(cisla.find((n) => n > 10));    // 12\nconsole.log(cisla.some((n) => n > 100));   // true\nconsole.log(cisla.every((n) => n > 1));    // true\nconsole.log(cisla.join(" | "));            // 5 | 12 | 8 | 130 | 44` },
        {
          type: "warn",
          md: "`sort()` bez funkce řadí **jako text**: `[10, 9, 1].sort()` dá `[1, 10, 9]`. Čísla řaď vzestupně takhle: `sort((a, b) => a - b)`.",
        },
        {
          type: "playground",
          code: `const body = [42, 7, 100, 15, 63];\n\nconst serazene = [...body].sort((a, b) => a - b); // kopie, ať se původní nezmění\nconsole.log("Vzestupně:", serazene);\nconsole.log("Sestupně:", [...body].sort((a, b) => b - a));\nconsole.log("První nad 50:", body.find((b) => b > 50));\nconsole.log("Všichni prošli (≥ 10)?", body.every((b) => b >= 10));`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const a = [3, 8, 12, 5];\nconsole.log(a.find((n) => n > 4));`,
          answer: "8",
          explanation: "`find` vrátí **první** prvek splňující podmínku. 3 není větší než 4, 8 ano.",
        },
        {
          type: "choice",
          prompt: "Co vrátí `[2, 4, 7].every((n) => n % 2 === 0)`?",
          options: ["`false`", "`true`", "`[2, 4]`", "`7`"],
          answer: 0,
          shuffle: false,
          explanation: "`every` vyžaduje, aby podmínka platila pro **všechny** prvky. 7 je liché → `false`.",
        },
        {
          type: "output",
          code: `console.log([10, 9, 1].sort());`,
          options: ["`[1, 10, 9]`", "`[1, 9, 10]`", "`[10, 9, 1]`", "`[9, 10, 1]`"],
          answer: 0,
          explanation: "Bez porovnávací funkce `sort` řadí čísla **jako text**: „1“ < „10“ < „9“. Proto se používá `sort((a, b) => a - b)`.",
        },
        {
          type: "fill",
          prompt: "Doplň metody tak, aby se vypsalo `Ada, Grace, Linus` (abecedně a oddělené čárkou).",
          code: `const jmena = ["Linus", "Ada", "Grace"];\nconsole.log(jmena.___().___(", "));`,
          blanks: [["sort"], ["join"]],
          words: ["sort", "join", "reverse", "concat"],
          explanation: "U textů funguje `sort()` abecedně i bez funkce. `join(\", \")` spojí prvky do jednoho textu.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `nejdelsi(slova)`, která vrátí **nejdelší** slovo z pole. Pokud je jich víc stejně dlouhých, vrať to první.",
          starter: "function nejdelsi(slova) {\n  // tvůj kód\n}\n",
          solution: "function nejdelsi(slova) {\n  let vysledek = slova[0];\n  for (const slovo of slova) {\n    if (slovo.length > vysledek.length) vysledek = slovo;\n  }\n  return vysledek;\n}",
          tests: [
            { name: "nejdelsi([\"pes\", \"kočka\", \"myš\"]) → kočka", type: "call", expr: 'nejdelsi(["pes", "kočka", "myš"])', expected: "kočka" },
            { name: "Při shodě vrátí první", type: "call", expr: 'nejdelsi(["ab", "cd", "e"])', expected: "ab" },
          ],
          hint: "Pamatuj si zatím nejdelší slovo a v cyklu ho nahraď, když najdeš delší (`>`, ne `>=`).",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "pole-objektu",
      title: "Pole objektů",
      description: "Seznamy záznamů – data, se kterými pracuje každá aplikace.",
      icon: "list",
      theory: [
        {
          type: "text",
          md: `Skutečná data mají obvykle podobu **pole objektů** – seznam žáků, produktů, úkolů… Metody \`map\`, \`filter\`, \`find\` a \`reduce\` s nimi pracují úplně stejně jako s čísly.`,
        },
        {
          type: "code",
          code: `const zaci = [\n  { jmeno: "Ada", body: 92 },\n  { jmeno: "Linus", body: 67 },\n  { jmeno: "Grace", body: 85 },\n];\n\nconst jmena = zaci.map((z) => z.jmeno);           // ["Ada", "Linus", "Grace"]\nconst dobri = zaci.filter((z) => z.body >= 80);    // Ada, Grace\nconst prumer = zaci.reduce((s, z) => s + z.body, 0) / zaci.length;`,
        },
        { type: "tip", md: "Metody se dají **řetězit**: `zaci.filter(…).map(…)` – nejdřív vyfiltruješ, pak z výsledku vybereš, co potřebuješ." },
        {
          type: "playground",
          code: `const kosik = [\n  { nazev: "Rohlík", cena: 3, kusy: 6 },\n  { nazev: "Mléko", cena: 25, kusy: 2 },\n  { nazev: "Sýr", cena: 45, kusy: 1 },\n];\n\nconst celkem = kosik.reduce((s, p) => s + p.cena * p.kusy, 0);\nconsole.log("Celkem:", celkem, "Kč");\n\nconst drahe = kosik.filter((p) => p.cena > 20).map((p) => p.nazev);\nconsole.log("Dražší než 20 Kč:", drahe);`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const lide = [\n  { jmeno: "Ada", vek: 36 },\n  { jmeno: "Bob", vek: 12 },\n];\nconsole.log(lide.map((c) => c.jmeno));`,
          answer: '["Ada", "Bob"]',
          accept: ['["Ada","Bob"]', "['Ada', 'Bob']", "[Ada, Bob]"],
          explanation: "`map` z každého objektu vybere vlastnost `jmeno` a vytvoří z nich nové pole.",
        },
        {
          type: "choice",
          prompt: "Jak najdeš v poli `produkty` produkt s názvem „Sýr“?",
          options: ['`produkty.find((p) => p.nazev === "Sýr")`', '`produkty.filter("Sýr")`', '`produkty["Sýr"]`', '`produkty.includes("Sýr")`'],
          answer: 0,
          explanation: "`find` s funkcí, která porovnává vlastnost `nazev`. `includes` by hledal celý prvek, ne jeho vlastnost.",
        },
        {
          type: "order",
          prompt: "Seřaď kód, který vypíše jména žáků s aspoň 80 body.",
          lines: ["const vysledek = zaci", "  .filter((z) => z.body >= 80)", "  .map((z) => z.jmeno);", "console.log(vysledek);"],
          explanation: "Nejdřív vyfiltruješ žáky, pak z nich vybereš jména a nakonec výsledek vypíšeš.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `celkovaCena(kosik)`, která pro pole `{ nazev, cena, kusy }` vrátí celkovou cenu (cena × kusy pro každou položku, sečteno).",
          starter: "function celkovaCena(kosik) {\n  // tvůj kód\n}\n",
          solution: "function celkovaCena(kosik) {\n  return kosik.reduce((soucet, p) => soucet + p.cena * p.kusy, 0);\n}",
          tests: [
            {
              name: "Košík za 113 Kč",
              type: "call",
              expr: 'celkovaCena([{ nazev: "Rohlík", cena: 3, kusy: 6 }, { nazev: "Mléko", cena: 25, kusy: 2 }, { nazev: "Sýr", cena: 45, kusy: 1 }])',
              expected: 113,
            },
            { name: "Prázdný košík → 0", type: "call", expr: "celkovaCena([])", expected: 0 },
          ],
          hint: "`reduce((soucet, p) => soucet + p.cena * p.kusy, 0)`",
        },
        {
          type: "code",
          prompt: "Napiš funkci `jmenaProslych(zaci)`, která vrátí **pole jmen** žáků, kteří mají aspoň 50 bodů.",
          starter: "function jmenaProslych(zaci) {\n  // tvůj kód\n}\n",
          solution: "function jmenaProslych(zaci) {\n  return zaci.filter((z) => z.body >= 50).map((z) => z.jmeno);\n}",
          tests: [
            {
              name: "Vrátí [\"Ada\", \"Grace\"]",
              type: "call",
              expr: 'jmenaProslych([{ jmeno: "Ada", body: 92 }, { jmeno: "Linus", body: 41 }, { jmeno: "Grace", body: 50 }])',
              expected: ["Ada", "Grace"],
            },
          ],
          hint: "Zřetěz `filter` a `map`.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "prochazeni-objektu",
      title: "Procházení objektů",
      description: "Object.keys, Object.values, Object.entries.",
      icon: "book",
      theory: [
        {
          type: "text",
          md: `Objekt nemá metody jako pole, ale pomocí \`Object\` z něj pole snadno uděláš:

- \`Object.keys(obj)\` – pole **klíčů**
- \`Object.values(obj)\` – pole **hodnot**
- \`Object.entries(obj)\` – pole dvojic \`[klíč, hodnota]\``,
        },
        { type: "code", code: `const znamky = { matika: 1, cestina: 2, fyzika: 1 };\n\nconsole.log(Object.keys(znamky));    // ["matika", "cestina", "fyzika"]\nconsole.log(Object.values(znamky));  // [1, 2, 1]\n\nfor (const [predmet, znamka] of Object.entries(znamky)) {\n  console.log(predmet + ": " + znamka);\n}` },
        { type: "tip", md: "K vlastnosti, jejíž název máš v proměnné, se dostaneš hranatými závorkami: `obj[klic]`. Tečka `obj.klic` by hledala vlastnost, která se jmenuje doslova „klic“." },
        {
          type: "playground",
          code: `const text = "abrakadabra";\nconst pocty = {};\n\nfor (const znak of text) {\n  pocty[znak] = (pocty[znak] || 0) + 1;\n}\n\nconsole.log(pocty);\nfor (const [znak, n] of Object.entries(pocty)) {\n  console.log(znak, "×", n);\n}`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const auto = { znacka: "Škoda", rok: 2020 };\nconsole.log(Object.keys(auto).length);`,
          answer: "2",
          explanation: "Objekt má dva klíče (`znacka` a `rok`), takže pole klíčů má délku 2.",
        },
        {
          type: "choice",
          prompt: 'Máš `const klic = "barva";`. Jak přečteš vlastnost `barva` z objektu `obj`?',
          options: ["`obj[klic]`", "`obj.klic`", '`obj."klic"`', "`obj->klic`"],
          answer: 0,
          explanation: "Když je název vlastnosti v proměnné, používají se hranaté závorky: `obj[klic]`.",
        },
        {
          type: "fill",
          prompt: "Doplň, aby cyklus prošel dvojice klíč–hodnota.",
          code: `for (const [k, v] of Object.___(obj)) {\n  console.log(k, v);\n}`,
          blanks: [["entries"]],
          words: ["entries", "keys", "values", "pairs"],
          explanation: "`Object.entries` vrací pole dvojic `[klíč, hodnota]`, které se v cyklu rovnou rozbalí.",
        },
        {
          type: "code",
          prompt: "Napiš funkci `spocitejZnaky(text)`, která vrátí objekt, kde klíče jsou znaky textu a hodnoty počet jejich výskytů. Např. `spocitejZnaky(\"ana\")` → `{ a: 2, n: 1 }`.",
          starter: "function spocitejZnaky(text) {\n  const pocty = {};\n  // tvůj kód\n  return pocty;\n}\n",
          solution: "function spocitejZnaky(text) {\n  const pocty = {};\n  for (const znak of text) {\n    pocty[znak] = (pocty[znak] || 0) + 1;\n  }\n  return pocty;\n}",
          tests: [
            { name: "spocitejZnaky(\"ana\")", type: "call", expr: 'spocitejZnaky("ana")', expected: { a: 2, n: 1 } },
            { name: "spocitejZnaky(\"\") → {}", type: "call", expr: 'spocitejZnaky("")', expected: {} },
            { name: "spocitejZnaky(\"kokos\")", type: "call", expr: 'spocitejZnaky("kokos")', expected: { k: 2, o: 2, s: 1 } },
          ],
          hint: "`pocty[znak] = (pocty[znak] || 0) + 1;` – když znak ještě nemá počet, začni od 0.",
        },
      ],
    },
  ],
};
