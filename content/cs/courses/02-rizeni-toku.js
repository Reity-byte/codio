/**
 * Kurz 2: Řízení toku – podmínky, switch a cykly.
 */
export default {
  id: "rizeni-toku",
  title: "Řízení toku",
  description: "Program se rozhoduje a opakuje: if/else, switch, for a while.",
  icon: "if",
  color: "cyan",
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "podminky",
      title: "Podmínka if / else",
      description: "Když platí tohle, udělej tamto.",
      icon: "target",
      theory: [
        {
          type: "text",
          md: `Programy se musí umět **rozhodovat**. K tomu slouží \`if\` (pokud):

- do kulatých závorek napíšeš **podmínku** (něco, co je \`true\`/\`false\`),
- do složených závorek \`{ }\` kód, který se provede, **jen když podmínka platí**,
- volitelný blok \`else\` (jinak) se provede, když podmínka **neplatí**.`,
        },
        {
          type: "code",
          code: `const teplota = 25;\n\nif (teplota > 20) {\n  console.log("Je teplo, vem si kraťasy.");\n} else {\n  console.log("Je zima, vem si mikinu.");\n}`,
        },
        { type: "tip", md: "Kód uvnitř `{ }` se odsazuje o 2 mezery. Počítači je to jedno, ale lidé díky tomu hned vidí, co k čemu patří." },
        {
          type: "playground",
          code: `const body = 42;\n\nif (body >= 50) {\n  console.log("Prošel jsi! 🎉");\n} else {\n  console.log("Tentokrát ne. Chybí ti " + (50 - body) + " bodů.");\n}\n\n// Zkus změnit počet bodů a spustit znovu.`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Kdy se provede kód uvnitř bloku `if`?",
          options: ["Když je podmínka `true`", "Vždycky", "Když je podmínka `false`", "Nikdy, pokud chybí `else`"],
          answer: 0,
          explanation: "Blok `if` se provede jen tehdy, když se podmínka vyhodnotí jako `true`. `else` je nepovinný.",
        },
        {
          type: "output",
          code: `const teplota = 15;\n\nif (teplota > 20) {\n  console.log("Teplo");\n} else {\n  console.log("Zima");\n}`,
          options: ["`Zima`", "`Teplo`", "`Teplo` a `Zima`", "Nic"],
          answer: 0,
          explanation: "15 není větší než 20, podmínka je `false` → provede se větev `else`.",
        },
        {
          type: "fill",
          prompt: "Doplň kód tak, aby při 50 a více bodech vypsal „Prošel jsi!“, jinak „Zkus to znovu.“",
          code: `if (body ___ 50) {\n  console.log("Prošel jsi!");\n} ___ {\n  console.log("Zkus to znovu.");\n}`,
          blanks: [[">="], ["else"]],
          words: [">=", "<=", "else", "then", "or"],
          explanation: "„50 a více“ znamená `>= 50`. Větev „jinak“ se uvozuje slovem `else`.",
        },
        {
          type: "bug",
          prompt: "Tento program skončí syntaktickou chybou. Kde?",
          code: `const vek = 20;\nif vek >= 18 {\n  console.log("Dospělý");\n}`,
          bugLine: 2,
          fix: "if (vek >= 18) {",
          explanation: "Podmínka u `if` musí být vždy v **kulatých závorkách**: `if (vek >= 18)`.",
        },
        {
          type: "order",
          prompt: "Seřaď řádky do programu, který vypíše, jestli je číslo sudé, nebo liché.",
          lines: ["const cislo = 7;", "if (cislo % 2 === 0) {", '  console.log("sudé");', "} else {", '  console.log("liché");', "}"],
          explanation: "Číslo je sudé, když je zbytek po dělení dvěma nula: `cislo % 2 === 0`.",
        },
        {
          type: "code",
          prompt:
            'Napiš podmínku: pokud je `heslo` rovno textu `"codio"`, vypiš `Přístup povolen`, jinak vypiš `Špatné heslo`.',
          starter: 'const heslo = "codio";\n\n// tvůj kód\n',
          solution: 'const heslo = "codio";\n\nif (heslo === "codio") {\n  console.log("Přístup povolen");\n} else {\n  console.log("Špatné heslo");\n}',
          tests: [
            { name: "Používá if", type: "source", pattern: "\\bif\\s*\\(" },
            { name: "Používá else", type: "source", pattern: "\\belse\\b" },
            { name: "Porovnává pomocí ===", type: "source", pattern: "===" },
            { name: "Vypíše „Přístup povolen“", type: "output", expected: "Přístup povolen" },
          ],
          hint: 'Struktura: `if (heslo === "codio") { … } else { … }`',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "else-if",
      title: "else if a ternární operátor",
      description: "Víc možností najednou a krátké podmínky.",
      icon: "list",
      theory: [
        {
          type: "text",
          md: `Když potřebuješ víc než dvě možnosti, řetězíš podmínky pomocí \`else if\`. JavaScript je zkouší **shora dolů** a provede **první**, která platí – ostatní přeskočí.`,
        },
        {
          type: "code",
          code: `const body = 75;\n\nif (body >= 90) {\n  console.log("Výborně");\n} else if (body >= 70) {\n  console.log("Chvalitebně");   // ← tahle se provede\n} else if (body >= 50) {\n  console.log("Dobře");\n} else {\n  console.log("Nevyhověl");\n}`,
        },
        { type: "warn", md: "Na **pořadí** záleží! Kdyby první podmínka byla `body >= 50`, platila by i pro 95 bodů a k „Výborně“ by se program nikdy nedostal." },
        {
          type: "text",
          md: `### Ternární operátor
Krátká podmínka, která **vrací hodnotu**: \`podmínka ? hodnotaKdyžAno : hodnotaKdyžNe\`.`,
        },
        { type: "code", code: `const vek = 12;\nconst vstupne = vek < 15 ? 50 : 120;\nconsole.log(vstupne); // 50` },
        {
          type: "playground",
          code: `const hodina = 14;\n\nif (hodina < 10) {\n  console.log("Dobré ráno!");\n} else if (hodina < 18) {\n  console.log("Dobrý den!");\n} else {\n  console.log("Dobrý večer!");\n}\n\nconst jeVikend = false;\nconsole.log(jeVikend ? "Spím do oběda" : "Vstávám do školy");`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const body = 75;\n\nif (body >= 90) {\n  console.log("A");\n} else if (body >= 70) {\n  console.log("B");\n} else {\n  console.log("C");\n}`,
          answer: "B",
          explanation: "75 ≥ 90 neplatí, 75 ≥ 70 platí → vypíše se `B` a zbytek se přeskočí.",
        },
        {
          type: "choice",
          prompt: 'Jakou hodnotu bude mít `text`?\n\n`const vek = 12;`  \n`const text = vek >= 18 ? "dospělý" : "dítě";`',
          options: ['`"dítě"`', '`"dospělý"`', "`true`", "`12`"],
          answer: 0,
          explanation: "Podmínka `12 >= 18` je `false`, takže ternární operátor vrátí hodnotu za dvojtečkou – `\"dítě\"`.",
        },
        {
          type: "fill",
          prompt: "Doplň ternární operátor.",
          code: `const jeDen = true;\nconst pozdrav = jeDen ___ "Dobrý den" ___ "Dobrou noc";`,
          blanks: [["?"], [":"]],
          words: ["?", ":", "||", "else"],
          explanation: "Zápis je `podmínka ? ano : ne`.",
        },
        {
          type: "bug",
          prompt: "Pro 95 bodů má program vypsat „Výborně!“, ale vypíše „Prošel“. Který řádek je potřeba změnit (podmínky jsou ve špatném pořadí)?",
          code: `const body = 95;\nif (body >= 50) {\n  console.log("Prošel");\n} else if (body >= 90) {\n  console.log("Výborně!");\n}`,
          bugLine: [2, 4],
          fix: "if (body >= 90) {\n  console.log(\"Výborně!\");\n} else if (body >= 50) {\n  console.log(\"Prošel\");\n}",
          explanation: "První podmínka `body >= 50` platí i pro 95, takže se `else if` vůbec nevyhodnotí. Přísnější podmínka (`>= 90`) musí být **první**.",
        },
        {
          type: "code",
          prompt: "Podle hodnoty `teplota` vypiš:\n\n- pod 0 → `Mrzne`\n- od 0 do 20 (včetně) → `Chladno`\n- nad 20 → `Teplo`",
          starter: "const teplota = 15;\n\n// tvůj kód\n",
          solution: 'const teplota = 15;\n\nif (teplota < 0) {\n  console.log("Mrzne");\n} else if (teplota <= 20) {\n  console.log("Chladno");\n} else {\n  console.log("Teplo");\n}',
          tests: [
            { name: "Používá else if", type: "source", pattern: "else\\s+if" },
            { name: "Pro 15 °C vypíše „Chladno“", type: "output", expected: "Chladno" },
          ],
          hint: "Začni nejnižší hranicí: `if (teplota < 0) … else if (teplota <= 20) … else …`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "switch",
      title: "Příkaz switch",
      description: "Elegantní volba z mnoha možností.",
      icon: "menu",
      theory: [
        {
          type: "text",
          md: `Když porovnáváš **jednu hodnotu** s mnoha konkrétními možnostmi, je přehlednější \`switch\`:

- \`case hodnota:\` – „v případě, že je to tahle hodnota“,
- \`break\` – ukončí switch (bez něj by kód „propadl“ do dalšího case!),
- \`default:\` – když nesedí žádný case (jako \`else\`).`,
        },
        {
          type: "code",
          code: `const den = "sobota";\n\nswitch (den) {\n  case "sobota":\n  case "neděle":\n    console.log("Víkend! 🎉");\n    break;\n  case "pátek":\n    console.log("Skoro víkend");\n    break;\n  default:\n    console.log("Všední den");\n}`,
          caption: "Víc case za sebou bez break = stejná akce pro více hodnot.",
        },
        {
          type: "playground",
          code: `const prikaz = "skok";\n\nswitch (prikaz) {\n  case "vpred":\n    console.log("Bajtík jde dopředu");\n    break;\n  case "skok":\n    console.log("Bajtík skáče! 🦘");\n    break;\n  default:\n    console.log("Neznámý příkaz: " + prikaz);\n}\n\n// Zkus smazat jeden break a uvidíš, co se stane.`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `const ovoce = "jablko";\n\nswitch (ovoce) {\n  case "banán":\n    console.log("žluté");\n    break;\n  case "jablko":\n    console.log("červené");\n    break;\n  default:\n    console.log("neznámé");\n}`,
          answer: "červené",
          explanation: "Hodnota `\"jablko\"` odpovídá druhému `case`. Vypíše se `červené` a `break` switch ukončí.",
        },
        {
          type: "choice",
          prompt: "Co se stane, když na konci `case` chybí `break`?",
          options: [
            "Pokračuje se do dalšího `case` (propadnutí)",
            "Program skončí chybou",
            "Switch se ukončí automaticky",
            "Provede se `default`, ale nic jiného",
          ],
          answer: 0,
          explanation: "Bez `break` JavaScript pokračuje provádět kód **dalšího** case, dokud nenarazí na `break` nebo konec switche.",
        },
        {
          type: "fill",
          prompt: "Doplň chybějící klíčová slova.",
          code: `switch (znamka) {\n  ___ 1:\n    console.log("Výborně");\n    ___;\n  ___:\n    console.log("Jiná známka");\n}`,
          blanks: [["case"], ["break"], ["default"]],
          words: ["case", "break", "default", "else", "stop"],
          explanation: "`case` uvozuje možnost, `break` ukončí switch a `default` je větev pro všechno ostatní.",
        },
        {
          type: "order",
          prompt: "Seřaď řádky switche, který pro `\"start\"` vypíše `Spouštím…`, jinak `Neznámý příkaz`.",
          lines: ["switch (prikaz) {", '  case "start":', '    console.log("Spouštím…");', "    break;", "  default:", '    console.log("Neznámý příkaz");', "}"],
          explanation: "Každý `case` končí `break`. `default` bývá na konci.",
        },
        {
          type: "code",
          prompt:
            "Pomocí `switch` vypiš podle proměnné `semafor`:\n\n- `\"zelena\"` → `Jeď`\n- `\"oranzova\"` → `Pozor`\n- `\"cervena\"` → `Stůj`\n- cokoliv jiného → `Porucha`",
          starter: 'const semafor = "oranzova";\n\n// tvůj kód\n',
          solution:
            'const semafor = "oranzova";\n\nswitch (semafor) {\n  case "zelena":\n    console.log("Jeď");\n    break;\n  case "oranzova":\n    console.log("Pozor");\n    break;\n  case "cervena":\n    console.log("Stůj");\n    break;\n  default:\n    console.log("Porucha");\n}',
          tests: [
            { name: "Používá switch", type: "source", pattern: "switch\\s*\\(" },
            { name: "Má větev default", type: "source", pattern: "default\\s*:" },
            { name: "Pro oranžovou vypíše „Pozor“", type: "output", expected: "Pozor" },
          ],
          hint: "Nezapomeň na `break;` na konci každého case – jinak se vypíše víc řádků.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cyklus-for",
      title: "Cyklus for",
      description: "Opakuj kód přesně tolikrát, kolikrát chceš.",
      icon: "reset",
      theory: [
        {
          type: "text",
          md: `**Cyklus** opakuje kód. Cyklus \`for\` má v závorce tři části oddělené středníkem:

1. **začátek** – vytvoření počítadla: \`let i = 0\`
2. **podmínka** – dokud platí, cyklus běží: \`i < 5\`
3. **krok** – co se stane po každém kole: \`i++\` (zvýšení o 1)`,
        },
        { type: "code", code: `for (let i = 0; i < 5; i++) {\n  console.log("Kolo číslo", i);\n}\n// vypíše 0, 1, 2, 3, 4 – pětkrát`, caption: "Programátoři počítají od nuly – proto i < 5 dá přesně 5 opakování." },
        {
          type: "warn",
          md: "Pozor na **nekonečný cyklus** – když se podmínka nikdy nestane `false` (třeba `i--` místo `i++`). Codio takový cyklus po chvíli zastaví, ale ve skutečném prohlížeči by se stránka zasekla.",
        },
        {
          type: "playground",
          code: `// Odpočet\nfor (let i = 5; i >= 1; i--) {\n  console.log(i + "…");\n}\nconsole.log("Start! 🚀");\n\n// Součet čísel 1 až 10\nlet soucet = 0;\nfor (let i = 1; i <= 10; i++) {\n  soucet += i;\n}\nconsole.log("Součet:", soucet);`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `for (let i = 0; i < 3; i++) {\n  console.log(i);\n}`,
          answer: "0\n1\n2",
          explanation: "Počítadlo začíná na 0 a cyklus běží, dokud `i < 3`: vypíše se 0, 1 a 2. Pro `i = 3` už podmínka neplatí.",
          hint: "Každé číslo na samostatný řádek. Začíná se nulou.",
        },
        {
          type: "choice",
          prompt: "Kolikrát proběhne tělo tohoto cyklu?\n\n`for (let i = 1; i <= 5; i++) { … }`",
          options: ["5×", "4×", "6×", "Nekonečněkrát"],
          answer: 0,
          shuffle: false,
          explanation: "`i` nabude hodnot 1, 2, 3, 4, 5 – to je pět opakování.",
        },
        {
          type: "fill",
          prompt: "Doplň cyklus tak, aby vypsal čísla **1 až 10** (včetně).",
          code: `for (let i = ___; i ___ 10; i++) {\n  console.log(i);\n}`,
          blanks: [["1"], ["<="]],
          words: ["0", "1", "<", "<="],
          explanation: "Začínáme jedničkou a pokračujeme, dokud `i <= 10`, aby se vypsala i desítka.",
        },
        {
          type: "bug",
          prompt: "Tento cyklus se nikdy nezastaví. Kde je chyba?",
          code: `let soucet = 0;\nfor (let i = 0; i < 5; i--) {\n  soucet += i;\n}\nconsole.log(soucet);`,
          bugLine: 2,
          fix: "for (let i = 0; i < 5; i++) {",
          explanation: "`i--` počítadlo **zmenšuje**, takže `i < 5` platí navždy. Má tam být `i++`.",
        },
        {
          type: "code",
          prompt: "Pomocí cyklu `for` vypiš čísla od **1 do 5** – každé na samostatný řádek.",
          starter: "// tvůj cyklus\n",
          solution: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}",
          tests: [
            { name: "Používá cyklus for", type: "source", pattern: "for\\s*\\(" },
            { name: "Vypíše 1 až 5", type: "output", expected: "1\n2\n3\n4\n5" },
          ],
          hint: "`for (let i = 1; i <= 5; i++) { console.log(i); }`",
        },
        {
          type: "code",
          prompt: "Sečti pomocí cyklu všechna čísla od **1 do 100** a výsledek ulož do proměnné `soucet`. Pak ho vypiš.",
          starter: "let soucet = 0;\n\n// tvůj cyklus\n\nconsole.log(soucet);\n",
          solution: "let soucet = 0;\n\nfor (let i = 1; i <= 100; i++) {\n  soucet += i;\n}\n\nconsole.log(soucet);",
          tests: [
            { name: "Používá cyklus", type: "source", pattern: "\\b(for|while)\\s*\\(" },
            { name: "soucet je 5050", type: "check", code: "return soucet === 5050;" },
            { name: "Vypíše 5050", type: "output", expected: "5050" },
          ],
          hint: "V každém kole přičti `i` k součtu: `soucet += i;`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cyklus-while",
      title: "while, break a continue",
      description: "Opakuj, dokud platí podmínka.",
      icon: "clock",
      theory: [
        {
          type: "text",
          md: `Cyklus \`while\` (dokud) opakuje kód, **dokud platí podmínka**. Hodí se, když předem nevíš, kolikrát se má opakovat.`,
        },
        { type: "code", code: `let penize = 100;\nlet tydny = 0;\n\nwhile (penize < 500) {\n  penize += 60;   // kapesné\n  tydny++;\n}\nconsole.log(\`Za \${tydny} týdnů mám \${penize} Kč\`);` },
        {
          type: "text",
          md: `### break a continue
- \`break\` – okamžitě **ukončí** celý cyklus,
- \`continue\` – přeskočí **zbytek aktuálního kola** a pokračuje dalším.

\`do { … } while (podmínka)\` je varianta, která proběhne **vždy aspoň jednou** – podmínka se kontroluje až na konci.`,
        },
        {
          type: "playground",
          code: `// Najdi první číslo dělitelné 7 i 5\nlet n = 1;\nwhile (true) {\n  if (n % 7 === 0 && n % 5 === 0) {\n    break;\n  }\n  n++;\n}\nconsole.log("Nalezeno:", n);\n\n// Vypiš lichá čísla do 10\nfor (let i = 1; i <= 10; i++) {\n  if (i % 2 === 0) continue;\n  console.log(i);\n}`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `let n = 3;\nwhile (n > 0) {\n  console.log(n);\n  n--;\n}`,
          answer: "3\n2\n1",
          explanation: "Začínáme na 3, vypíšeme a zmenšíme. Pro `n = 0` už podmínka `n > 0` neplatí.",
        },
        {
          type: "choice",
          prompt: "Čím se liší `do…while` od `while`?",
          options: [
            "Tělo `do…while` proběhne vždy aspoň jednou",
            "`do…while` je rychlejší",
            "`do…while` nemůže použít `break`",
            "Ničím, je to jen jiný zápis",
          ],
          answer: 0,
          explanation: "`do…while` kontroluje podmínku až **na konci** kola, takže tělo se provede minimálně jednou.",
        },
        {
          type: "output",
          code: `for (let i = 1; i <= 5; i++) {\n  if (i === 3) {\n    continue;\n  }\n  console.log(i);\n}`,
          answer: "1\n2\n4\n5",
          explanation: "`continue` přeskočí zbytek kola pro `i === 3`, takže trojka se nevypíše. Cyklus ale pokračuje dál.",
        },
        {
          type: "bug",
          prompt: "Odpočet se nikdy nezastaví. Najdi chybný řádek.",
          code: `let odpocet = 5;\nwhile (odpocet > 0) {\n  console.log(odpocet);\n  odpocet++;\n}\nconsole.log("Start!");`,
          bugLine: 4,
          fix: "  odpocet--;",
          explanation: "Odpočet se musí **zmenšovat** (`odpocet--`), jinak bude pořád větší než 0.",
        },
        {
          type: "fill",
          prompt: "Doplň, aby cyklus skončil, jakmile najde číslo dělitelné 13.",
          code: `let n = 50;\nwhile (true) {\n  if (n % 13 === 0) {\n    ___;\n  }\n  n++;\n}\nconsole.log(n); // 52`,
          blanks: [["break"]],
          words: ["break", "continue", "stop", "return"],
          explanation: "`break` okamžitě ukončí cyklus – i ten „nekonečný“ `while (true)`.",
        },
        {
          type: "code",
          prompt: "Pomocí cyklu `while` najdi **nejmenší mocninu dvojky větší než 1000** (1, 2, 4, 8, …) a vypiš ji.",
          starter: "let mocnina = 1;\n\n// tvůj cyklus while\n\nconsole.log(mocnina);\n",
          solution: "let mocnina = 1;\n\nwhile (mocnina <= 1000) {\n  mocnina *= 2;\n}\n\nconsole.log(mocnina);",
          tests: [
            { name: "Používá while", type: "source", pattern: "while\\s*\\(" },
            { name: "Vypíše 1024", type: "output", expected: "1024" },
          ],
          hint: "Dokud je `mocnina <= 1000`, násob ji dvěma: `mocnina *= 2;`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "fizzbuzz",
      title: "Velké finále: FizzBuzz",
      description: "Slavná úloha z pracovních pohovorů. Zvládneš ji!",
      icon: "trophy",
      theory: [
        {
          type: "text",
          md: `**FizzBuzz** je klasika. Pro čísla 1 až N vypiš:

- \`Fizz\`, když je číslo dělitelné **3**,
- \`Buzz\`, když je dělitelné **5**,
- \`FizzBuzz\`, když je dělitelné **3 i 5**,
- jinak číslo samotné.

Kombinuješ všechno, co už znáš: cyklus, podmínky a operátor \`%\`.`,
        },
        { type: "tip", md: "Dělitelnost zjistíš zbytkem: `cislo % 3 === 0` znamená „dělitelné třemi“. A pamatuj na **pořadí** podmínek – nejpřísnější (3 i 5) musí být první!" },
        {
          type: "playground",
          code: `// Rozcvička: které z čísel 1–10 jsou dělitelná třemi?\nfor (let i = 1; i <= 10; i++) {\n  if (i % 3 === 0) {\n    console.log(i, "je dělitelné 3");\n  }\n}`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Jak zjistíš, že je číslo `n` dělitelné **3 i 5** zároveň?",
          options: ["`n % 3 === 0 && n % 5 === 0`", "`n % 3 === 0 || n % 5 === 0`", "`n / 15 === 0`", "`n % 8 === 0`"],
          answer: 0,
          explanation: "Obě podmínky musí platit současně → `&&`. (Funguje i `n % 15 === 0`.)",
        },
        {
          type: "output",
          code: `const n = 10;\nif (n % 3 === 0 && n % 5 === 0) {\n  console.log("FizzBuzz");\n} else if (n % 3 === 0) {\n  console.log("Fizz");\n} else if (n % 5 === 0) {\n  console.log("Buzz");\n} else {\n  console.log(n);\n}`,
          answer: "Buzz",
          explanation: "10 není dělitelné třemi, ale pěti ano → `Buzz`.",
        },
        {
          type: "order",
          prompt: "Seřaď větve podmínky ve FizzBuzz správně.",
          lines: [
            "if (i % 3 === 0 && i % 5 === 0) {",
            '  console.log("FizzBuzz");',
            "} else if (i % 3 === 0) {",
            '  console.log("Fizz");',
            "} else if (i % 5 === 0) {",
            '  console.log("Buzz");',
            "} else {",
            "  console.log(i);",
            "}",
          ],
          alternatives: [[0, 1, 4, 5, 2, 3, 6, 7, 8]],
          explanation: "Nejdřív se musí testovat „3 i 5“, jinak by čísla jako 15 skončila už u `Fizz`.",
        },
        {
          type: "code",
          prompt: "Napiš FizzBuzz pro čísla **1 až 15**. Každý výsledek vypiš na samostatný řádek.",
          starter: "for (let i = 1; i <= 15; i++) {\n  // tvůj kód\n}\n",
          solution:
            'for (let i = 1; i <= 15; i++) {\n  if (i % 3 === 0 && i % 5 === 0) {\n    console.log("FizzBuzz");\n  } else if (i % 3 === 0) {\n    console.log("Fizz");\n  } else if (i % 5 === 0) {\n    console.log("Buzz");\n  } else {\n    console.log(i);\n  }\n}',
          tests: [
            { name: "Používá cyklus", type: "source", pattern: "\\b(for|while)\\s*\\(" },
            {
              name: "Vypíše správnou posloupnost 1–15",
              type: "output",
              expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"],
            },
          ],
          hint: "Uvnitř cyklu použij `if / else if / else`. První podmínka: `i % 3 === 0 && i % 5 === 0`.",
        },
        {
          type: "code",
          prompt: "Bonus: vypiš násobilku čísla **7** ve tvaru `7 × 1 = 7` až `7 × 10 = 70`.",
          starter: "const cislo = 7;\n\n// tvůj cyklus\n",
          solution: "const cislo = 7;\n\nfor (let i = 1; i <= 10; i++) {\n  console.log(`${cislo} × ${i} = ${cislo * i}`);\n}",
          tests: [
            { name: "Používá cyklus", type: "source", pattern: "\\b(for|while)\\s*\\(" },
            {
              name: "Vypíše 10 řádků násobilky",
              type: "output",
              expected: ["7 × 1 = 7", "7 × 2 = 14", "7 × 3 = 21", "7 × 4 = 28", "7 × 5 = 35", "7 × 6 = 42", "7 × 7 = 49", "7 × 8 = 56", "7 × 9 = 63", "7 × 10 = 70"],
            },
          ],
          hint: "Použij template literal: ``console.log(`${cislo} × ${i} = ${cislo * i}`);`` Znak × zkopíruj ze zadání.",
        },
      ],
    },
  ],
};
