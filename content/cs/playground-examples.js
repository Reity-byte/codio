/**
 * Ukázky pro Hřiště (volný editor). mode: "console" | "web".
 */
export default {
  /** Kód, který uvidí nový uživatel na prázdném hřišti. */
  welcome: {
    mode: "console",
    js: `// Vítej na hřišti! 🛝\n// Tady můžeš psát, co chceš – nic se neboduje a nic nerozbiješ.\n// Kód se ukládá automaticky. Spusť ho tlačítkem Spustit (Ctrl+Enter).\n\nconst jmeno = "programátore";\nconsole.log(\`Ahoj, \${jmeno}!\`);\n`,
    html: `<h1>Moje stránka</h1>\n<button id="tlacitko">Klikni</button>\n`,
    css: `body { font-family: system-ui, sans-serif; }\n`,
  },
  examples: [
    {
      id: "fibonacci",
      title: "Fibonacciho posloupnost",
      mode: "console",
      js: `// Každé číslo je součtem dvou předchozích\nlet a = 0;\nlet b = 1;\n\nfor (let i = 0; i < 15; i++) {\n  console.log(a);\n  [a, b] = [b, a + b];\n}\n`,
    },
    {
      id: "prvocisla",
      title: "Prvočísla do 100",
      mode: "console",
      js: `function jePrvocislo(n) {\n  if (n < 2) return false;\n  for (let d = 2; d * d <= n; d++) {\n    if (n % d === 0) return false;\n  }\n  return true;\n}\n\nconst prvocisla = [];\nfor (let n = 2; n <= 100; n++) {\n  if (jePrvocislo(n)) prvocisla.push(n);\n}\nconsole.log(prvocisla);\nconsole.log("Počet:", prvocisla.length);\n`,
    },
    {
      id: "pocasi",
      title: "Počasí z API",
      mode: "console",
      js: `// api.codio.dev je cvičné API, funguje i offline\nconst mesta = ["praha", "brno"];\n\nfor (const mesto of mesta) {\n  const res = await fetch(\`https://api.codio.dev/pocasi/\${mesto}\`);\n  const data = await res.json();\n  console.log(\`\${data.mesto}: \${data.teplota} °C, \${data.obloha}\`);\n}\n`,
    },
    {
      id: "pocitadlo",
      title: "Počítadlo kliknutí",
      mode: "web",
      html: `<h1 id="cislo">0</h1>\n<button id="minus">−</button>\n<button id="plus">+</button>\n`,
      css: `body { font-family: system-ui, sans-serif; text-align: center; }\nh1 { font-size: 64px; margin: 16px; }\nbutton { font-size: 28px; width: 64px; height: 64px; border-radius: 50%; border: 0; background: #39ff9f; cursor: pointer; }\n`,
      js: `let pocet = 0;\nconst cislo = document.querySelector("#cislo");\n\nfunction obnov() {\n  cislo.textContent = pocet;\n  cislo.style.color = pocet < 0 ? "crimson" : "black";\n}\n\ndocument.querySelector("#plus").addEventListener("click", () => { pocet++; obnov(); });\ndocument.querySelector("#minus").addEventListener("click", () => { pocet--; obnov(); });\n`,
    },
    {
      id: "barvy",
      title: "Generátor barev",
      mode: "web",
      html: `<div id="plocha">\n  <h1 id="kod">#39FF9F</h1>\n  <button id="nova">Nová barva</button>\n</div>\n`,
      css: `body { margin: 0; font-family: ui-monospace, monospace; }\n#plocha { min-height: 100vh; display: grid; place-content: center; gap: 12px; text-align: center; background: #39ff9f; transition: background 0.4s; }\nbutton { padding: 10px 18px; font-size: 18px; border: 0; border-radius: 10px; cursor: pointer; }\n`,
      js: `const plocha = document.querySelector("#plocha");\nconst kod = document.querySelector("#kod");\n\nfunction nahodnaBarva() {\n  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");\n  return "#" + hex.toUpperCase();\n}\n\ndocument.querySelector("#nova").addEventListener("click", () => {\n  const barva = nahodnaBarva();\n  plocha.style.background = barva;\n  kod.textContent = barva;\n});\n`,
    },
    {
      id: "hodiny",
      title: "Digitální hodiny",
      mode: "web",
      html: `<div id="hodiny">--:--:--</div>\n`,
      css: `body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #05090c; }\n#hodiny { font: 800 64px ui-monospace, monospace; color: #39ff9f; text-shadow: 0 0 16px #39ff9f; }\n`,
      js: `const hodiny = document.querySelector("#hodiny");\n\nfunction tik() {\n  const ted = new Date();\n  hodiny.textContent = ted.toLocaleTimeString("cs-CZ");\n}\n\ntik();\nsetInterval(tik, 1000);\n`,
    },
  ],
};
