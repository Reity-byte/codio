/**
 * Kurz 1: Základy – výpis do konzole, proměnné, datové typy, operátory,
 * porovnávání a práce s textem.
 *
 * Formát lekce:
 *   { id, title, description, icon?, theory: [bloky], exercises: [cvičení] }
 * Bloky výkladu: text (md), code, tip, warn, playground.
 * Typy cvičení viz js/exercises/*.js a README.
 */
export default {
  id: "zaklady",
  title: "Základy",
  description: "První kroky: výpis do konzole, proměnné, datové typy a operátory.",
  icon: "let",
  color: "green",
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "ahoj-konzole",
      title: "Ahoj, konzole!",
      description: "Tvůj úplně první program a příkaz console.log.",
      icon: "terminal",
      theory: [
        {
          type: "text",
          md: `**JavaScript** je programovací jazyk, ve kterém běží skoro celý web – tlačítka, hry, mapy, chaty…

Program je jen seznam **příkazů**, které počítač provádí **shora dolů**. Náš první příkaz je \`console.log()\` – vypíše do **konzole** (textového výstupu) to, co mu dáš do závorek.`,
        },
        { type: "code", code: `console.log("Ahoj, světe!");\nconsole.log(42);\nconsole.log(2 + 3);`, caption: "Text píšeme do uvozovek, čísla bez nich. Výsledek: Ahoj, světe! · 42 · 5" },
        {
          type: "tip",
          md: "Středník `;` na konci příkazu je jako tečka za větou. JavaScript si ho často domyslí, ale je dobrý zvyk ho psát.",
        },
        {
          type: "text",
          md: `### Komentáře
Text za \`//\` je **komentář** – počítač ho ignoruje. Slouží k poznámkám pro lidi (a pro tebe za týden).`,
        },
        {
          type: "playground",
          code: `// Klikni na Spustit (nebo Ctrl+Enter)\nconsole.log("Ahoj, světe!");\nconsole.log("Jmenuji se Bajtík.");\nconsole.log(10 * 4 + 2);\n\n// Zkus změnit text nebo přidat další řádek!`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Kterým příkazem vypíšeš text do konzole?",
          options: ['`console.log("Ahoj")`', '`print("Ahoj")`', '`echo "Ahoj"`', '`console.write("Ahoj")`'],
          answer: 0,
          explanation: "V JavaScriptu se do konzole vypisuje pomocí `console.log(…)`. `print` a `echo` znáš možná z jiných jazyků (Python, PHP, Bash).",
          hint: "Hledej příkaz, který začíná slovem `console` a pokračuje slovem, které znamená „zapsat do deníku“.",
        },
        {
          type: "output",
          code: `console.log("Ahoj");\nconsole.log(2 + 3);`,
          answer: "Ahoj\n5",
          explanation: "Příkazy běží shora dolů. První vypíše text `Ahoj`, druhý nejdřív spočítá `2 + 3` a vypíše výsledek `5`. Každý `console.log` píše na nový řádek.",
          hint: "Každý `console.log` vypíše jeden řádek. Čísla bez uvozovek se spočítají.",
        },
        {
          type: "fill",
          prompt: "Doplň chybějící slovo, aby program vypsal text.",
          code: `console.___("Jsem programátor!");`,
          blanks: [["log"]],
          words: ["log", "print", "write", "echo"],
          explanation: "Celý příkaz je `console.log(…)`.",
          hint: "Je to stejné slovo jako v anglickém „logbook“ (lodní deník).",
        },
        {
          type: "bug",
          prompt: "Tento program skončí chybou. Na kterém řádku je chyba?",
          code: `console.log("Začínám");\nconsole.log("Učím se JavaScript);\nconsole.log("Hotovo");`,
          bugLine: 2,
          fix: `console.log("Učím se JavaScript");`,
          explanation: "Na řádku 2 chybí **zavírací uvozovka**. Každý text musí začínat i končit uvozovkou.",
          hint: "Zkontroluj uvozovky – mají všechny texty začátek i konec?",
        },
        {
          type: "choice",
          prompt: 'Co udělá tento řádek?\n\n`// console.log("tajná zpráva");`',
          options: ["Nic – je to komentář", "Vypíše `tajná zpráva`", "Skončí chybou", 'Vypíše `// console.log("tajná zpráva");`'],
          answer: 0,
          shuffle: false,
          explanation: "Všechno za `//` je komentář, který počítač přeskočí. Takhle se dá kód dočasně „vypnout“.",
        },
        {
          type: "code",
          prompt: "Napiš program, který vypíše do konzole přesně text **Ahoj, Codio!**",
          starter: "// Napiš svůj kód sem\n",
          solution: `console.log("Ahoj, Codio!");`,
          tests: [
            { name: "Používá console.log", type: "source", pattern: "console\\.log\\s*\\(" },
            { name: "Vypíše „Ahoj, Codio!“", type: "output", expected: "Ahoj, Codio!" },
          ],
          explanation: "Stačí jeden příkaz: `console.log(\"Ahoj, Codio!\");`",
          hint: "Text dej do uvozovek uvnitř závorek: `console.log(\"…\");` Pozor na čárku a vykřičník.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "promenne",
      title: "Proměnné",
      description: "Krabičky na data: let a const.",
      icon: "edit",
      theory: [
        {
          type: "text",
          md: `**Proměnná** je pojmenovaná „krabička“, do které si uložíš hodnotu a později ji použiješ.

- \`let\` – proměnná, jejíž hodnotu můžeš **měnit**,
- \`const\` – **konstanta**, hodnota se nastaví jednou a už se nemění.`,
        },
        {
          type: "code",
          code: `let skore = 0;          // vytvoření proměnné\nskore = 10;             // změna hodnoty (už bez let!)\n\nconst jmeno = "Ada";    // konstanta\nconsole.log(jmeno, skore); // Ada 10`,
        },
        {
          type: "tip",
          md: "**Pravidlo:** používej `const`, dokud nepotřebuješ hodnotu měnit. Pak použij `let`. Starší `var` raději nepoužívej.",
        },
        {
          type: "text",
          md: `### Jak proměnné pojmenovat
- používej popisná jména: \`pocetZivotu\` je lepší než \`x\`,
- víceslovná jména se píšou **camelCase**: \`mojeOblibeneCislo\`,
- jméno nesmí začínat číslicí a nesmí obsahovat mezery,
- velikost písmen hraje roli: \`vek\` a \`Vek\` jsou dvě různé proměnné.`,
        },
        {
          type: "playground",
          code: `let zivoty = 3;\nconsole.log("Životy:", zivoty);\n\nzivoty = zivoty - 1; // ouch!\nconsole.log("Životy:", zivoty);\n\nconst hrac = "Bajtík";\nconsole.log("Hráč:", hrac);\n\n// Co se stane, když zkusíš změnit konstantu?\n// hrac = "Někdo jiný";`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Které klíčové slovo použiješ pro hodnotu, která se **nikdy nezmění**?",
          options: ["`const`", "`let`", "`var`", "`fixed`"],
          answer: 0,
          explanation: "`const` vytváří konstantu – hodnotu nelze přepsat. `let` slouží pro hodnoty, které se mění.",
        },
        {
          type: "output",
          code: `let body = 10;\nbody = body + 5;\nconsole.log(body);`,
          options: ["`15`", "`10`", "`body`", "`105`"],
          answer: 0,
          explanation: "Nejdřív je v `body` 10. Pak vezmeme aktuální hodnotu (10), přičteme 5 a výsledek (15) uložíme zpět do `body`.",
        },
        {
          type: "fill",
          prompt: "Doplň klíčové slovo, kterým se vytvoří proměnná.",
          code: `___ jmeno = "Ada";\nconsole.log(jmeno);`,
          blanks: [["let", "const"]],
          words: ["let", "const", "variable", "new"],
          explanation: "Proměnnou vytvoříš pomocí `let` nebo `const`. Tady funguje obojí, protože hodnotu dál neměníme.",
        },
        {
          type: "bug",
          prompt: "Tento kód skončí chybou `TypeError`. Na kterém řádku chyba nastane?",
          code: `const pocet = 1;\nconsole.log(pocet);\npocet = 2;\nconsole.log(pocet);`,
          bugLine: 3,
          fix: "// buď na řádku 1 použij let pocet = 1;\n// nebo hodnotu konstanty neměň",
          explanation: "Konstantu (`const`) nejde přepsat. Řádek 3 se o to pokouší, a proto program spadne. Řešení: na řádku 1 použít `let`.",
          hint: "Která proměnná je vytvořená jako `const`? A kde se jí snažíme přiřadit novou hodnotu?",
        },
        {
          type: "order",
          prompt: "Seřaď řádky tak, aby program vypsal `10`.",
          lines: ["let skore = 0;", "skore = skore + 10;", "console.log(skore);"],
          explanation: "Proměnnou musíš nejdřív **vytvořit**, pak ji můžeš změnit a nakonec vypsat.",
        },
        {
          type: "code",
          prompt:
            "Vytvoř proměnnou `vek` s hodnotou `15` a konstantu `jmeno` s libovolným textem (třeba tvým jménem). Pak vypiš hodnotu proměnné `vek`.",
          starter: "// 1. vytvoř proměnnou vek\n\n// 2. vytvoř konstantu jmeno\n\n// 3. vypiš vek\n",
          solution: `let vek = 15;\nconst jmeno = "Ada";\nconsole.log(vek);`,
          tests: [
            { name: "Proměnná vek má hodnotu 15", type: "check", code: "return typeof vek !== 'undefined' && vek === 15;" },
            { name: "jmeno je konstanta s textem", type: "source", pattern: "const\\s+jmeno\\s*=\\s*['\"`]" },
            { name: "Vypíše 15", type: "output", expected: "15" },
          ],
          hint: "`let vek = 15;` vytvoří proměnnou. Konstanta: `const jmeno = \"…\";`. Výpis: `console.log(vek);`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "datove-typy",
      title: "Datové typy",
      description: "Čísla, texty, pravda/nepravda a „nic“.",
      icon: "list",
      theory: [
        {
          type: "text",
          md: `Každá hodnota má svůj **typ**. Nejčastější jsou:

- \`number\` – čísla: \`42\`, \`3.14\`, \`-7\`
- \`string\` – texty v uvozovkách: \`"Ahoj"\`, \`'kočka'\`
- \`boolean\` – pravda/nepravda: \`true\`, \`false\`
- \`undefined\` – proměnná existuje, ale nemá hodnotu
- \`null\` – „záměrně prázdná“ hodnota`,
        },
        {
          type: "code",
          code: `console.log(typeof 42);       // number\nconsole.log(typeof "42");     // string – pozor, uvozovky!\nconsole.log(typeof true);     // boolean\nlet nic;\nconsole.log(nic);             // undefined`,
          caption: "Operátor typeof ti řekne, jakého typu je hodnota.",
        },
        {
          type: "warn",
          md: "`42` a `\"42\"` **nejsou** to samé! První je číslo, druhé je text, který jen vypadá jako číslo.",
        },
        {
          type: "playground",
          code: `const vek = 15;\nconst jmeno = "Ada";\nconst maPsa = true;\n\nconsole.log(typeof vek);\nconsole.log(typeof jmeno);\nconsole.log(typeof maPsa);\nconsole.log(typeof "15");`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: 'Jaký typ má hodnota `"42"`?',
          options: ["`string`", "`number`", "`boolean`", "`undefined`"],
          answer: 0,
          explanation: "Cokoliv v uvozovkách je text – `string`. I když uvnitř jsou číslice.",
        },
        {
          type: "output",
          code: `console.log(typeof 3.14);`,
          answer: "number",
          explanation: "Desetinná čísla jsou v JavaScriptu také typu `number` – žádný zvláštní typ pro ně není.",
        },
        {
          type: "choice",
          prompt: "Která hodnota je typu **boolean**?",
          options: ["`true`", '`"true"`', "`1`", '`"ano"`'],
          answer: 0,
          explanation: 'Boolean má jen dvě hodnoty: `true` a `false` – bez uvozovek. `"true"` v uvozovkách je obyčejný text.',
        },
        {
          type: "output",
          code: `let x;\nconsole.log(x);`,
          options: ["`undefined`", "`null`", "`0`", "Program skončí chybou"],
          answer: 0,
          shuffle: false,
          explanation: "Proměnná `x` existuje, ale nikdy nedostala hodnotu, a proto je `undefined`.",
        },
        {
          type: "fill",
          prompt: "Doplň hodnotu typu **boolean**, která říká, že úkol je hotový.",
          code: `let jeHotovo = ___;\nconsole.log(typeof jeHotovo); // boolean`,
          blanks: [["true"]],
          words: ["true", '"true"', "1", "yes"],
          explanation: "`true` (bez uvozovek) je boolean. `\"true\"` by byl string.",
        },
        {
          type: "code",
          prompt:
            "Vytvoř tři proměnné: `text` (libovolný string), `cislo` (libovolné number) a `pravda` (boolean). Pak vypiš `typeof` každé z nich – v tomto pořadí.",
          starter: "// vytvoř proměnné text, cislo a pravda\n\n\n// vypiš jejich typy\n",
          solution: `const text = "Ahoj";\nconst cislo = 7;\nconst pravda = true;\n\nconsole.log(typeof text);\nconsole.log(typeof cislo);\nconsole.log(typeof pravda);`,
          tests: [
            { name: "text je string", type: "check", code: "return typeof text === 'string';" },
            { name: "cislo je number", type: "check", code: "return typeof cislo === 'number';" },
            { name: "pravda je boolean", type: "check", code: "return typeof pravda === 'boolean';" },
            { name: "Vypíše string, number, boolean", type: "output", expected: "string\nnumber\nboolean" },
          ],
          hint: "Např. `const cislo = 7;` a pak `console.log(typeof cislo);`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "operatory",
      title: "Operátory a výpočty",
      description: "Počítáme jako kalkulačka a skládáme texty.",
      icon: "code",
      theory: [
        {
          type: "text",
          md: `### Aritmetika
\`+\` sčítání, \`-\` odčítání, \`*\` násobení, \`/\` dělení a \`%\` **zbytek po dělení** (modulo).

Platí přednost operací jako v matematice – násobení před sčítáním. Závorky \`( )\` pořadí změní.`,
        },
        { type: "code", code: `console.log(2 + 3 * 4);    // 14\nconsole.log((2 + 3) * 4);  // 20\nconsole.log(7 % 3);        // 1 (7 = 2·3 + 1)` },
        {
          type: "text",
          md: `### Zkratky
\`x += 5\` je zkratka pro \`x = x + 5\`. Podobně \`-=\`, \`*=\`. A \`x++\` zvýší hodnotu o 1.

### Skládání textů
Operátor \`+\` u textů je **spojí**. Pohodlnější je **template literal** – text ve **zpětných uvozovkách** (na české klávesnici AltGr + ý), do kterého vkládáš hodnoty pomocí \`\${…}\`.`,
        },
        { type: "code", code: "const jmeno = \"Ada\";\nconsole.log(\"Ahoj, \" + jmeno + \"!\");   // Ahoj, Ada!\nconsole.log(`Ahoj, ${jmeno}!`);         // Ahoj, Ada!\nconsole.log(\"5\" + 3);                   // 53 – text + číslo = text!" },
        {
          type: "warn",
          md: '`"5" + 3` je `"53"`, protože když je jedna strana text, `+` hodnoty **spojí**. Text na číslo převedeš pomocí `Number("5")`.',
        },
        {
          type: "playground",
          code: "const cena = 250;\nconst pocet = 3;\nlet celkem = cena * pocet;\n\nconsole.log(`Celkem: ${celkem} Kč`);\n\ncelkem -= 50; // sleva\nconsole.log(`Po slevě: ${celkem} Kč`);\nconsole.log(\"Zbytek 17 / 5 =\", 17 % 5);",
        },
      ],
      exercises: [
        {
          type: "output",
          code: `console.log(7 % 3);`,
          options: ["`1`", "`2`", "`2.33`", "`0`"],
          answer: 0,
          explanation: "`%` vrací zbytek po dělení: 7 = 2 · 3 + **1**.",
        },
        {
          type: "output",
          code: `console.log("5" + 3);`,
          answer: "53",
          explanation: "Když je jedna strana `+` text, JavaScript hodnoty spojí jako text: `\"5\" + 3` → `\"53\"`.",
          hint: "Pozor na uvozovky kolem pětky!",
        },
        {
          type: "choice",
          prompt: "Co udělá zápis `x += 2`?",
          options: ["Zvětší hodnotu `x` o 2", "Porovná `x` s číslem 2", "Nastaví `x` na 2", "Vypíše `x + 2`"],
          answer: 0,
          explanation: "`x += 2` je zkratka pro `x = x + 2`.",
        },
        {
          type: "fill",
          prompt: "Doplň do template literalu proměnnou `jmeno`, aby se vypsalo `Ahoj, Ada!`.",
          code: 'const jmeno = "Ada";\nconsole.log(`Ahoj, ___!`);',
          blanks: [["${jmeno}"]],
          words: ["${jmeno}", "jmeno", "{jmeno}", "$jmeno"],
          explanation: "V template literalu (zpětné uvozovky) se hodnoty vkládají přes `${…}`.",
        },
        {
          type: "order",
          prompt: "Seřaď řádky tak, aby program spočítal a vypsal obsah obdélníku.",
          lines: ["const sirka = 4;", "const vyska = 5;", "const obsah = sirka * vyska;", "console.log(`Obsah je ${obsah}`);"],
          alternatives: [[1, 0, 2, 3]],
          explanation: "Proměnné musí existovat dřív, než je použiješ. Šířka a výška můžou být v libovolném pořadí, ale výpočet musí být až po nich.",
        },
        {
          type: "code",
          prompt:
            "Spočítej do proměnné `celkem` cenu za `pocet` kusů a vypiš pomocí **template literalu** text `Celkem: 360 Kč`.",
          starter: "const cena = 120;\nconst pocet = 3;\n\n// tvůj kód\n",
          solution: "const cena = 120;\nconst pocet = 3;\n\nconst celkem = cena * pocet;\nconsole.log(`Celkem: ${celkem} Kč`);",
          tests: [
            { name: "celkem je 360", type: "check", code: "return typeof celkem !== 'undefined' && celkem === 360;" },
            { name: "Výpočet používá proměnné (ne napsané číslo)", type: "source", pattern: "cena\\s*\\*\\s*pocet|pocet\\s*\\*\\s*cena" },
            { name: "Používá template literal ${…}", type: "source", pattern: "`[^`]*\\$\\{[^`]*`" },
            { name: "Vypíše „Celkem: 360 Kč“", type: "output", expected: "Celkem: 360 Kč" },
          ],
          hint: "`const celkem = cena * pocet;` a pak ``console.log(`Celkem: ${celkem} Kč`);``",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "porovnani",
      title: "Porovnávání a logika",
      description: "===, <, >, && a || – základ každého rozhodování.",
      icon: "target",
      theory: [
        {
          type: "text",
          md: `Porovnání vrací vždy **boolean** – \`true\` nebo \`false\`.

- \`===\` je rovno, \`!==\` není rovno
- \`<\`, \`>\`, \`<=\`, \`>=\` menší, větší, menší nebo rovno, větší nebo rovno`,
        },
        { type: "code", code: `console.log(5 > 3);        // true\nconsole.log(5 === 5);      // true\nconsole.log(5 === "5");    // false – jiný typ!\nconsole.log(4 !== 5);      // true` },
        {
          type: "warn",
          md: "Používej **tři** rovnítka `===`. Dvě `==` dělají podivné převody typů (`5 == \"5\"` je `true`). A jedno `=` vůbec neporovnává – **přiřazuje**!",
        },
        {
          type: "text",
          md: `### Logické operátory
- \`&&\` (a zároveň) – \`true\`, jen když platí **obě** strany
- \`||\` (nebo) – \`true\`, když platí **aspoň jedna** strana
- \`!\` (ne) – otočí hodnotu: \`!true\` je \`false\``,
        },
        {
          type: "playground",
          code: `const vek = 16;\nconst maVstupenku = true;\n\nconsole.log("Je mu aspoň 15?", vek >= 15);\nconsole.log("Může dovnitř?", vek >= 15 && maVstupenku);\nconsole.log("Je víkend nebo prázdniny?", false || true);\nconsole.log("Opak:", !maVstupenku);`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `console.log(5 > 3);`,
          answer: "true",
          explanation: "5 je opravdu větší než 3, výsledkem porovnání je `true`.",
        },
        {
          type: "choice",
          prompt: 'Jaký je výsledek `5 === "5"`?',
          options: ["`false`", "`true`", "Chyba", "`undefined`"],
          answer: 0,
          shuffle: false,
          explanation: "`===` kontroluje i **typ**. `5` je number, `\"5\"` je string – nejsou si tedy rovny.",
        },
        {
          type: "output",
          code: `console.log(true && false);\nconsole.log(true || false);`,
          answer: "false\ntrue",
          explanation: "`&&` potřebuje, aby platilo obojí → `false`. `||` stačí jedna pravdivá strana → `true`.",
        },
        {
          type: "fill",
          prompt: "Doplň operátor tak, aby `plnolety` bylo `true` pro věk **18 a více**.",
          code: `const vek = 18;\nconst plnolety = vek ___ 18;\nconsole.log(plnolety); // true`,
          blanks: [[">="]],
          words: [">=", "=>", ">", "="],
          explanation: "„Větší nebo rovno“ se píše `>=`. Pozor, `=>` je něco úplně jiného (šipková funkce).",
        },
        {
          type: "bug",
          prompt: "Program má vypsat, jestli se hesla shodují, ale skončí chybou. Kde je chyba?",
          code: `const heslo = "tajne123";\nconst zadane = "tajne123";\nconst shoda = heslo = zadane;\nconsole.log(shoda);`,
          bugLine: 3,
          fix: "const shoda = heslo === zadane;",
          explanation: "Jedno `=` je **přiřazení**, ne porovnání. Kód se snaží přepsat konstantu `heslo`. Správně je `===`.",
        },
        {
          type: "code",
          prompt:
            "Vytvoř konstantu `muzeVstoupit`, která bude `true`, pokud je `vek` **alespoň 15** a zároveň `maVstupenku` je `true`. Pak ji vypiš.",
          starter: "const vek = 16;\nconst maVstupenku = true;\n\n// tvůj kód\n",
          solution: "const vek = 16;\nconst maVstupenku = true;\n\nconst muzeVstoupit = vek >= 15 && maVstupenku;\nconsole.log(muzeVstoupit);",
          tests: [
            { name: "Používá operátor &&", type: "source", pattern: "&&" },
            { name: "Porovnává věk s 15", type: "source", pattern: "vek\\s*>=\\s*15|15\\s*<=\\s*vek|vek\\s*>\\s*14" },
            { name: "muzeVstoupit je true", type: "check", code: "return typeof muzeVstoupit !== 'undefined' && muzeVstoupit === true;" },
            { name: "Vypíše true", type: "output", expected: "true" },
          ],
          hint: "`const muzeVstoupit = vek >= 15 && maVstupenku;`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "text",
      title: "Práce s textem",
      description: "Délka textu, velká písmena a hledání.",
      icon: "book",
      theory: [
        {
          type: "text",
          md: `Texty (stringy) umí spoustu užitečných věcí. Zapisují se přes **tečku**:

- \`text.length\` – počet znaků
- \`text.toUpperCase()\` / \`toLowerCase()\` – VELKÁ / malá písmena
- \`text.includes("…")\` – obsahuje text daný kousek? (\`true\`/\`false\`)
- \`text.trim()\` – odstraní mezery na začátku a konci
- \`text[0]\` – první znak (počítá se **od nuly**!)`,
        },
        {
          type: "code",
          code: `const slovo = "JavaScript";\nconsole.log(slovo.length);          // 10\nconsole.log(slovo.toUpperCase());   // JAVASCRIPT\nconsole.log(slovo.includes("Script")); // true\nconsole.log(slovo[0]);              // J`,
        },
        { type: "tip", md: "`length` je **vlastnost** (bez závorek), `toUpperCase()` je **metoda** – něco dělá, a proto má závorky." },
        {
          type: "playground",
          code: `const zprava = "  Ahoj, já jsem Bajtík!  ";\n\nconsole.log(zprava.trim());\nconsole.log(zprava.trim().length);\nconsole.log(zprava.toUpperCase());\nconsole.log(zprava.includes("Bajtík"));\nconsole.log(zprava.trim()[0]);`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `console.log("Ahoj".length);`,
          answer: "4",
          explanation: "Slovo `Ahoj` má 4 znaky: A, h, o, j.",
        },
        {
          type: "choice",
          prompt: 'Co vrátí `"javascript".toUpperCase()`?',
          options: ['`"JAVASCRIPT"`', '`"Javascript"`', '`"javascript"`', '`"JavaScript"`'],
          answer: 0,
          explanation: "`toUpperCase()` převede **všechna** písmena na velká.",
        },
        {
          type: "fill",
          prompt: "Doplň metodu, která zjistí, jestli text obsahuje slovo `světe`.",
          code: `const zprava = "Ahoj světe";\nconsole.log(zprava.___("světe")); // true`,
          blanks: [["includes"]],
          words: ["includes", "contains", "has", "find"],
          explanation: "Správná metoda je `includes`. `contains` existuje v jiných jazycích, ale v JS u textů ne.",
        },
        {
          type: "output",
          code: `const s = "Programování";\nconsole.log(s[0]);\nconsole.log(s[3]);`,
          answer: "P\ng",
          explanation: "Znaky se číslují od **nuly**: `s[0]` je `P`, `s[1]` je `r`, `s[2]` je `o`, `s[3]` je `g`.",
          hint: "Počítej od nuly: P=0, r=1, o=2…",
        },
        {
          type: "bug",
          prompt: "Program má vypsat délku jména, ale skončí chybou. Kde je problém?",
          code: `const jmeno = "Ada";\nconst delka = jmeno.length();\nconsole.log(delka);`,
          bugLine: 2,
          fix: "const delka = jmeno.length;",
          explanation: "`length` je **vlastnost**, ne metoda – píše se bez závorek. `jmeno.length()` skončí chybou „is not a function“.",
        },
        {
          type: "code",
          prompt: "Z konstanty `jmeno` vypiš dva řádky:\n\n1. jméno velkými písmeny s pozdravem: `AHOJ, ADA!`\n2. větu o délce jména: `Jméno má 3 znaky.`\n\nPoužij `toUpperCase()` a `length` – nepiš výsledky ručně.",
          starter: 'const jmeno = "Ada";\n\n// tvůj kód\n',
          solution: 'const jmeno = "Ada";\n\nconsole.log(`AHOJ, ${jmeno.toUpperCase()}!`);\nconsole.log(`Jméno má ${jmeno.length} znaky.`);',
          tests: [
            { name: "Používá toUpperCase()", type: "source", pattern: "\\.toUpperCase\\(\\)" },
            { name: "Používá length", type: "source", pattern: "\\.length\\b" },
            { name: "Vypíše oba řádky", type: "output", expected: ["AHOJ, ADA!", "Jméno má 3 znaky."] },
          ],
          hint: "``console.log(`AHOJ, ${jmeno.toUpperCase()}!`);`` – a podobně pro délku.",
        },
      ],
    },
  ],
};
