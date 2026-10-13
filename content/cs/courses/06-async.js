/**
 * Kurz 6 (volitelný): Asynchronní JavaScript – callbacky, Promise,
 * async/await a fetch. Požadavky na https://api.codio.dev obsluhuje
 * falešné API (content/cs/mock-api.js), takže lekce fungují offline.
 */
export default {
  id: "async",
  title: "Asynchronní JavaScript",
  description: "Čekání bez zasekávání: setTimeout, Promise, async/await a fetch.",
  icon: "⏱",
  color: "red",
  lessons: [
    {
      id: "callbacky-promise",
      title: "Callbacky a Promise",
      description: "Kód, který doběhne později.",
      icon: "clock",
      theory: [
        {
          type: "text",
          md: `Některé věci trvají – stažení dat, časovač, čtení souboru. JavaScript na ně **nečeká** a mezitím pokračuje dál. Až je hotovo, zavolá funkci, kterou mu předáš – **callback**.`,
        },
        { type: "code", code: `console.log("1. Objednávám pizzu");\n\nsetTimeout(() => {\n  console.log("3. Pizza je tu! 🍕");\n}, 1000);\n\nconsole.log("2. Mezitím hraju hru");` },
        {
          type: "text",
          md: `**Promise** (příslib) je objekt, který reprezentuje výsledek, jenž přijde **později**. Na výsledek reaguješ pomocí \`.then()\`, na chybu \`.catch()\`.`,
        },
        {
          type: "playground",
          code: `function hodKostkou() {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(Math.floor(Math.random() * 6) + 1), 500);\n  });\n}\n\nconsole.log("Házím…");\nhodKostkou().then((cislo) => {\n  console.log("Padlo:", cislo);\n});\nconsole.log("(kostka se ještě kutálí)");`,
        },
      ],
      exercises: [
        {
          type: "output",
          code: `console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");`,
          answer: "A\nC\nB",
          explanation: "I s nulovým zpožděním se callback `setTimeout` spustí až **po** dokončení aktuálního kódu. Proto `C` předběhne `B`.",
        },
        {
          type: "choice",
          prompt: "Kterou metodou zpracuješ úspěšný výsledek Promise?",
          options: ["`.then()`", "`.catch()`", "`.wait()`", "`.result()`"],
          answer: 0,
          explanation: "`.then()` dostane výsledek, `.catch()` chybu.",
        },
        {
          type: "code",
          prompt: "Pomocí `setTimeout` vypiš po 300 ms text `Hotovo!`. Hned na začátku programu vypiš `Čekám…`.",
          starter: "// tvůj kód\n",
          solution: 'console.log("Čekám…");\nsetTimeout(() => {\n  console.log("Hotovo!");\n}, 300);',
          tests: [
            { name: "Používá setTimeout", type: "source", pattern: "setTimeout\\s*\\(" },
            { name: "Vypíše „Čekám…“ a pak „Hotovo!“", type: "output", expected: ["Čekám…", "Hotovo!"] },
          ],
          hint: "Tři tečky zkopíruj ze zadání (je to jeden znak „…“), nebo použij `console.log(\"Čekám…\")`.",
        },
      ],
    },
    {
      id: "async-await-fetch",
      title: "async/await a fetch",
      description: "Stahování dat z internetu (API).",
      icon: "download",
      theory: [
        {
          type: "text",
          md: `\`async/await\` je pohodlnější zápis práce s Promise. Uvnitř \`async\` funkce můžeš napsat \`await\` – kód „počká“ na výsledek, ale stránka se nezasekne.

\`fetch(url)\` stáhne data z adresy. Odpověď převedeš na objekt pomocí \`await odpoved.json()\`.`,
        },
        {
          type: "code",
          code: `async function nactiUzivatele() {\n  const odpoved = await fetch("https://api.codio.dev/uzivatele/1");\n  const data = await odpoved.json();\n  console.log(data.jmeno); // Ada\n}\n\nnactiUzivatele();`,
          caption: "Adresa api.codio.dev je cvičné API, které v Codiu funguje i bez internetu.",
        },
        { type: "tip", md: "Dostupné cvičné adresy: `/uzivatele`, `/uzivatele/1`, `/uzivatele/2`, `/pocasi/praha`, `/pocasi/brno`, `/vtip`." },
        {
          type: "playground",
          code: `async function pocasi(mesto) {\n  try {\n    const res = await fetch(\`https://api.codio.dev/pocasi/\${mesto}\`);\n    if (!res.ok) throw new Error("Město nenalezeno");\n    const data = await res.json();\n    console.log(\`\${data.mesto}: \${data.teplota} °C, \${data.obloha}\`);\n  } catch (chyba) {\n    console.error("Chyba:", chyba.message);\n  }\n}\n\nawait pocasi("praha");\nawait pocasi("brno");\nawait pocasi("atlantida");`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Kde smíš použít `await`?",
          options: ["Uvnitř funkce označené `async`", "Kdekoliv v kódu", "Jen uvnitř cyklu", "Jen uvnitř `.then()`"],
          answer: 0,
          explanation: "`await` patří do `async` funkcí. (Moderní moduly ho dovolují i na nejvyšší úrovni – tady v Codiu taky.)",
        },
        {
          type: "fill",
          prompt: "Doplň, aby kód počkal na odpověď a převedl ji na data.",
          code: `async function vtip() {\n  const res = ___ fetch("https://api.codio.dev/vtip");\n  const data = await res.___();\n  console.log(data.otazka);\n}`,
          blanks: [["await"], ["json"]],
          words: ["await", "async", "json", "text"],
          explanation: "`await fetch(…)` počká na odpověď a `res.json()` z ní udělá objekt (taky přes `await`).",
        },
        {
          type: "code",
          prompt: "Napiš `async` funkci `jmenoUzivatele(id)`, která stáhne `https://api.codio.dev/uzivatele/` + id a **vrátí** jméno uživatele (`data.jmeno`).",
          starter: "async function jmenoUzivatele(id) {\n  // tvůj kód\n}\n",
          solution: "async function jmenoUzivatele(id) {\n  const res = await fetch(`https://api.codio.dev/uzivatele/${id}`);\n  const data = await res.json();\n  return data.jmeno;\n}",
          tests: [
            { name: "Používá await fetch", type: "source", pattern: "await\\s+fetch\\s*\\(" },
            { name: "jmenoUzivatele(1) → Ada", type: "call", expr: "await jmenoUzivatele(1)", expected: "Ada" },
            { name: "jmenoUzivatele(2) → Linus", type: "call", expr: "await jmenoUzivatele(2)", expected: "Linus" },
          ],
          hint: "``const res = await fetch(`https://api.codio.dev/uzivatele/${id}`);`` a pak `return (await res.json()).jmeno;`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "osetreni-chyb",
      title: "Když se něco pokazí",
      description: "try/catch, reject a odpověď 404.",
      icon: "alert",
      theory: [
        {
          type: "text",
          md: `Internet není spolehlivý – server může být mimo provoz nebo data neexistují. Chyby v \`async\` funkcích zachytíš pomocí \`try { … } catch (chyba) { … }\`:

- kód v \`try\` se provádí normálně,
- když v něm nastane chyba (nebo \`await\` na Promise, který skončil chybou), skočí se do \`catch\`.

Pozor: \`fetch\` **nevyhodí** chybu u odpovědi 404! Musíš zkontrolovat \`odpoved.ok\` a chybu vyhodit sám přes \`throw new Error("…")\`.`,
        },
        {
          type: "code",
          code: `async function nacti(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error("Server vrátil " + res.status);\n    return await res.json();\n  } catch (chyba) {\n    console.log("Nepovedlo se:", chyba.message);\n    return null;\n  }\n}`,
        },
        {
          type: "playground",
          code: `function hodMinci() {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (Math.random() < 0.5) resolve("Panna 🪙");\n      else reject(new Error("Orel – prohrál jsi!"));\n    }, 300);\n  });\n}\n\ntry {\n  const vysledek = await hodMinci();\n  console.log("Výhra:", vysledek);\n} catch (chyba) {\n  console.log("Smůla:", chyba.message);\n}\n// Spusť víckrát!`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Co udělá `fetch`, když server odpoví stavem **404 (nenalezeno)**?",
          options: ["Vrátí odpověď s `ok: false` – chybu nevyhodí", "Vyhodí chybu, kterou zachytí `catch`", "Vrátí `null`", "Zkusí to znovu"],
          answer: 0,
          explanation: "`fetch` končí chybou jen při selhání sítě. Stav 404 nebo 500 je pro něj „úspěšná“ odpověď – proto se kontroluje `res.ok`.",
        },
        {
          type: "output",
          code: `try {\n  console.log("A");\n  throw new Error("B");\n  console.log("C");\n} catch (e) {\n  console.log(e.message);\n}\nconsole.log("D");`,
          answer: "A\nB\nD",
          explanation: "Po `throw` se zbytek `try` přeskočí (C se nevypíše), provede se `catch` a program pak normálně pokračuje.",
        },
        {
          type: "code",
          prompt:
            "Napiš `async` funkci `teplota(mesto)`, která stáhne `https://api.codio.dev/pocasi/<mesto>` a vrátí `data.teplota`. Když město neexistuje (odpověď není `ok`), vrať `null`.",
          starter: "async function teplota(mesto) {\n  // tvůj kód\n}\n",
          solution:
            "async function teplota(mesto) {\n  try {\n    const res = await fetch(`https://api.codio.dev/pocasi/${mesto}`);\n    if (!res.ok) return null;\n    const data = await res.json();\n    return data.teplota;\n  } catch (chyba) {\n    return null;\n  }\n}",
          tests: [
            { name: "teplota(\"praha\") → 18", type: "call", expr: 'await teplota("praha")', expected: 18 },
            { name: "teplota(\"brno\") → 21", type: "call", expr: 'await teplota("brno")', expected: 21 },
            { name: "Neexistující město → null", type: "call", expr: 'await teplota("atlantida")', expected: null },
          ],
          hint: "Po `await fetch(…)` zkontroluj `if (!res.ok) return null;`",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "promise-all",
      title: "Víc požadavků najednou",
      description: "Promise.all – čekání na několik věcí zároveň.",
      icon: "bolt",
      theory: [
        {
          type: "text",
          md: `Když potřebuješ několik nezávislých dat, nestahuj je **po jednom** – trvalo by to zbytečně dlouho. \`Promise.all([…])\` spustí všechny najednou a počká, až budou **všechny** hotové. Výsledkem je pole výsledků ve stejném pořadí.`,
        },
        {
          type: "code",
          code: `// pomalu: 300 ms + 300 ms\nconst a = await fetch(url1);\nconst b = await fetch(url2);\n\n// rychle: oba najednou ≈ 300 ms\nconst [c, d] = await Promise.all([fetch(url1), fetch(url2)]);`,
        },
        { type: "warn", md: "Když **jeden** z Promise skončí chybou, skončí chybou i celé `Promise.all`." },
        {
          type: "playground",
          code: `const zakladni = "https://api.codio.dev";\n\nconsole.time("najednou");\nconst odpovedi = await Promise.all([\n  fetch(zakladni + "/pocasi/praha"),\n  fetch(zakladni + "/pocasi/brno"),\n]);\nconst data = await Promise.all(odpovedi.map((r) => r.json()));\nconsole.timeEnd("najednou");\n\nfor (const d of data) console.log(d.mesto, d.teplota + " °C");`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Co vrátí `await Promise.all([p1, p2, p3])`, když všechny skončí úspěšně?",
          options: ["Pole výsledků v pořadí p1, p2, p3", "Výsledek toho nejrychlejšího", "Jen výsledek p3", "Počet úspěšných Promise"],
          answer: 0,
          explanation: "`Promise.all` vrátí pole výsledků ve stejném pořadí, v jakém byly Promise předány – bez ohledu na to, který doběhl dřív.",
        },
        {
          type: "output",
          code: `const cekej = (ms, x) => new Promise((r) => setTimeout(() => r(x), ms));\n\nconst vysledky = await Promise.all([cekej(300, "pomalý"), cekej(10, "rychlý")]);\nconsole.log(vysledky);`,
          answer: '["pomalý", "rychlý"]',
          accept: ['["pomalý","rychlý"]', "[pomalý, rychlý]"],
          explanation: "I když druhý Promise doběhne dřív, pořadí výsledků odpovídá pořadí v poli.",
        },
        {
          type: "code",
          prompt:
            "Napiš `async` funkci `jmena(idcka)`, která pro pole id (např. `[1, 2]`) stáhne **najednou** (`Promise.all`) uživatele z `https://api.codio.dev/uzivatele/<id>` a vrátí pole jejich jmen.",
          starter: "async function jmena(idcka) {\n  // tvůj kód\n}\n",
          solution:
            "async function jmena(idcka) {\n  const odpovedi = await Promise.all(idcka.map((id) => fetch(`https://api.codio.dev/uzivatele/${id}`)));\n  const data = await Promise.all(odpovedi.map((r) => r.json()));\n  return data.map((u) => u.jmeno);\n}",
          tests: [
            { name: "Používá Promise.all", type: "source", pattern: "Promise\\.all\\s*\\(" },
            { name: "jmena([1, 2]) → [\"Ada\", \"Linus\"]", type: "call", expr: "await jmena([1, 2])", expected: ["Ada", "Linus"] },
            { name: "jmena([2]) → [\"Linus\"]", type: "call", expr: "await jmena([2])", expected: ["Linus"] },
          ],
          hint: "Z pole id udělej pole `fetch(…)` pomocí `map`, počkej přes `Promise.all`, pak totéž pro `.json()`.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "intervaly",
      title: "Opakované časovače",
      description: "setInterval a clearInterval.",
      icon: "reset",
      theory: [
        {
          type: "text",
          md: `\`setInterval(funkce, ms)\` volá funkci **opakovaně** každých \`ms\` milisekund. Vrátí číslo (id), pomocí kterého interval zastavíš: \`clearInterval(id)\`.

Na interval nezapomínej – když ho nezastavíš, běží pořád (v Codiu ho po 5 s vypneme za tebe).`,
        },
        { type: "code", code: `let zbyva = 3;\nconst id = setInterval(() => {\n  console.log(zbyva);\n  zbyva--;\n  if (zbyva === 0) {\n    clearInterval(id);\n    console.log("Start! 🚀");\n  }\n}, 1000);` },
        {
          type: "playground",
          code: `let tik = 0;\nconst id = setInterval(() => {\n  tik++;\n  console.log("tik", tik);\n  if (tik === 5) {\n    clearInterval(id);\n    console.log("Hotovo");\n  }\n}, 200);`,
        },
      ],
      exercises: [
        {
          type: "choice",
          prompt: "Jak zastavíš interval spuštěný jako `const id = setInterval(fn, 100)`?",
          options: ["`clearInterval(id)`", "`clearInterval(fn)`", "`id.stop()`", "`setInterval(id, 0)`"],
          answer: 0,
          explanation: "`clearInterval` potřebuje id, které vrátil `setInterval`.",
        },
        {
          type: "bug",
          prompt: "Program má vypsat čísla 1–3 a skončit, ale interval běží dál. Kde je chyba?",
          code: `let n = 0;\nconst id = setInterval(() => {\n  n++;\n  console.log(n);\n  if (n === 3) clearInterval(n);\n}, 100);`,
          bugLine: 5,
          fix: "  if (n === 3) clearInterval(id);",
          explanation: "`clearInterval` dostává počítadlo `n` místo id intervalu.",
        },
        {
          type: "code",
          prompt: "Pomocí `setInterval` (každých 100 ms) vypiš `3`, `2`, `1` a pak `Start!`. Potom interval zastav.",
          starter: "let zbyva = 3;\n\n// tvůj kód\n",
          solution:
            'let zbyva = 3;\n\nconst id = setInterval(() => {\n  if (zbyva > 0) {\n    console.log(zbyva);\n    zbyva--;\n  } else {\n    console.log("Start!");\n    clearInterval(id);\n  }\n}, 100);',
          tests: [
            { name: "Používá setInterval", type: "source", pattern: "setInterval\\s*\\(" },
            { name: "Zastavuje přes clearInterval", type: "source", pattern: "clearInterval\\s*\\(" },
            { name: "Vypíše 3, 2, 1, Start!", type: "output", expected: ["3", "2", "1", "Start!"] },
          ],
          hint: "V intervalu: dokud `zbyva > 0`, vypiš a zmenši; jinak vypiš Start! a `clearInterval(id)`.",
        },
      ],
    },
  ],
};
