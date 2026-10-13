# Codio – nauč se JavaScript

Výuková webová aplikace, která učí programovat v JavaScriptu formou krátkých lekcí
s okamžitou zpětnou vazbou, gamifikací a mini projekty. Tmavý „hacker“ vzhled,
maskot **Bajtík** (robot s CRT monitorem místo hlavy) a vše v češtině.

- čisté HTML + CSS + vanilla JavaScript (ES moduly), **žádný build krok**
- jediná externí knihovna: **CodeMirror 6** (z CDN esm.sh, se záložním editorem, když CDN nejde)
- konfety, zvuky (Web Audio) a Matrix pozadí jsou vlastní implementace bez závislostí
- postup se ukládá do `localStorage` přes jednu vyměnitelnou vrstvu (`js/storage.js`)

---

## Spuštění

ES moduly se v prohlížeči nenačtou při otevření souboru přes `file://`, proto
spusť ve složce projektu libovolný statický server:

```bash
python tools/dev-server.py 8000
```

a otevři <http://localhost:8000>. `tools/dev-server.py` je běžný Python server,
který navíc vypíná cache, takže po úpravě souborů vždy uvidíš novou verzi.
Fungují i alternativy:

```bash
npx serve
```

```bash
python -m http.server 8000
```

Pokud stránku přesto otevřeš přímo ze souboru, aplikace ukáže návod, co dělat.

### Instalace a offline režim (PWA)

Codio je PWA: v Chromu/Edge/Androidu ho nainstaluješ z **Nastavení → Nainstalovat
Codio** (nebo z nabídky prohlížeče), na iPhonu v Safari přes **Sdílet → Přidat na plochu**.

Offline režim zajišťuje `sw.js`:

- vlastní soubory: nejdřív síť, při výpadku cache – po úpravě kódu se vždy načte
  nová verze,
- CDN (CodeMirror, písma): nejdřív cache – po prvním načtení fungují i bez internetu.

Seznam souborů pro offline režim (`PRECACHE`) a verzi cache generuje

```bash
python tools/build-sw.py
```

Spusť ho po přidání nebo přejmenování souborů. Při nasazení na GitHub Pages ho
spouští workflow automaticky. Ikony aplikace vygeneruje `python tools/make-icons.py`
(potřebuje Pillow).

### Nasazení na GitHub Pages

1. Nahraj projekt do repozitáře na GitHubu (větev `main`).
2. V repozitáři: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Každý push do `main` spustí `.github/workflows/pages.yml`, který aktualizuje
   `sw.js` a nasadí web na `https://<uživatel>.github.io/<repozitář>/`.

Aplikace používá jen relativní cesty a hash routing, takže funguje i v podsložce.

### Kontrola obsahu

Na adrese <http://localhost:8000/tools/check-content.html> je nástroj pro autory obsahu.
Spustí ukázková řešení všech kódových cvičení a projektů proti jejich testům,
skutečně spustí kód u cvičení „Co vypíše tento kód?“ a ověří správnou odpověď
a zkontroluje strukturu cvičení (počty mezer, indexy odpovědí…).
Pusť ho po každé úpravě obsahu. Výsledek musí být `✖ 0`.

---

## Co aplikace umí

| Oblast | Funkce |
|---|---|
| **Stránky** | úvod (landing), mapa kurzů, lekce (celoobrazovkový režim), procvičování, hřiště, projekty, detail projektu, profil, nastavení, 404 |
| **Procvičování** | opakování chyb (Leitnerovy krabičky: hned → 1 → 3 → 7 → 14 dní), procvičovací mix 8 cvičení z hotových lekcí, bez ztráty srdíček a s dobitím jednoho srdíčka |
| **Hřiště** | volný editor bez zadání: konzole nebo webová stránka (HTML/CSS/JS), ukázky, automatické ukládání |
| **Obsah** | 6 kurzů / 35 lekcí / 6 projektů (26 kroků) – kurzy 1–2 nejpodrobněji, kurzy 3–6 po 5–6 lekcích |
| **Cvičení** | výběr z možností, doplň do mezery (i s nabídkou slov), co vypíše kód, najdi chybu, seřaď řádky (drag & drop + klávesnice), napiš kód s automatickými testy |
| **Sandbox** | Web Worker pro konzolové programy, `<iframe sandbox="allow-scripts allow-forms">` pro stránky; hlídání nekonečných cyklů, timeout, zachytávání `console.*`, lidské vysvětlení chyb hlasem maskota |
| **Gamifikace** | XP, úrovně, denní série s upozorněním, srdíčka s obnovou (vypínatelná), denní cíl 10/20/50 XP, 26 odznaků |
| **Maskot** | 7 nálad (neutrální, radost, smutek, zamyšlení, nadšení, spánek, mávání), idle animace (dýchání, mrkání, LED), oči sledují kurzor, usne po 90 s nečinnosti, hlášky v bublině |
| **Přístupnost** | ovládání klávesnicí (Enter = zkontrolovat, 1–9 = volba odpovědi, šipky, Alt+šipky u řazení), `aria-live` oznámení, viditelný fokus, `prefers-reduced-motion` + vlastní přepínač animací, žádné ligatury v kódu |
| **Data** | export/import postupu do JSON, reset postupu |
| **PWA** | instalace jako aplikace (Android, iOS, desktop), funguje offline včetně editoru, sandboxu a cvičného API |

---

## Struktura projektu

```
index.html              kostra stránky (vše ostatní vykresluje JS)
css/
  tokens.css            design tokeny – barvy, písma, mezery, stíny (JEDINÉ místo)
  base.css              reset, typografie, rozvržení, tlačítka, formuláře
  components.css        karty, toasty, modaly, konzole, editor, testy…
  mascot.css            vzhled a animace maskota
  pages.css             styly jednotlivých stránek
  animations.css        keyframes + respektování prefers-reduced-motion
js/
  main.js               start aplikace, hlavička, registrace stránek
  router.js             hash router (#/mapa, #/lekce/:kurz/:lekce, …)
  storage.js            ukládání postupu (adaptér localStorage / REST)
  i18n.js               načítání jazykového balíčku, t(), plurály
  content.js            přístup k obsahu (kurzy, lekce, projekty, hlášky)
  gamification.js       XP, úrovně, série, srdíčka, odznaky, odemykání
  mascot.js             SVG maskot + nálady + bublina
  editor.js             CodeMirror 6 + záložní <textarea>
  sandbox.js            spouštění kódu (Worker / iframe), instrumentace cyklů, testy
  sandbox-runtime.js    kód, který běží UVNITŘ sandboxu (console, guard, testy)
  playground.js         komponenta editor + výstup + tlačítka
  session.js            průchod sadou cvičení (sdílí lekce i procvičování)
  practice.js           výběr cvičení pro procvičování a opakování chyb
  errors.js             překlad chyb JS na lidské vysvětlení
  effects.js            konfety, zvuky, Matrix pozadí, efekt psaní
  ui.js                 h(), markdown, zvýraznění syntaxe, toasty, modaly
  icons.js              SVG ikony
  exercises/            typy cvičení (simple.js, order.js, code.js, index.js)
  pages/                stránky (landing, map, lesson, practice, practice-session, hriste,
                        projects, project, profile, settings, not-found)
content/cs/             VEŠKERÝ obsah a texty (čeština)
  index.js              jazykový balíček – co se načítá
  ui.js                 texty rozhraní
  mascot.js             jméno, příběh a hlášky maskota
  errors.js             vysvětlení častých chyb JS
  badges.js             odznaky
  mock-api.js           falešné API pro lekce o fetch
  playground-examples.js ukázky pro Hřiště
  courses/              kurzy a lekce
  projects/             mini projekty
assets/                 favicon a statické SVG maskota
tools/                  vývojový server a kontrola obsahu
```

---

## Jak přidat obsah

Obsah jsou obyčejné JS moduly (`export default { … }`). Žádný zásah do logiky
aplikace není potřeba.

### Nová lekce

Přidej objekt do pole `lessons` v souboru kurzu (např. `content/cs/courses/03-funkce.js`):

```js
{
  id: "rekurze",                       // unikátní v rámci kurzu (je v URL)
  title: "Rekurze",
  description: "Funkce, která volá sama sebe.",
  icon: "reset",                       // název ikony z js/icons.js
  theory: [
    { type: "text", md: "Markdown: **tučně**, `kód`, seznamy, ### nadpisy, ```js bloky```" },
    { type: "code", code: "console.log(1);", caption: "Popisek pod kódem" },
    { type: "tip", md: "Tip v rámečku" },
    { type: "warn", md: "Varování v rámečku" },
    { type: "playground", code: "console.log('spusť mě');" },                       // konzole
    { type: "playground", mode: "dom", html: "<button>…</button>", css: "…", code: "…" }, // živá stránka
  ],
  exercises: [ /* viz níže */ ],
}
```

### Typy cvičení

Každé cvičení může mít `explanation` (zobrazí se po odpovědi) a `hint`
(nápověda za −3 XP). Texty jsou v markdownu.

```js
// Výběr z možností (shuffle: false = nemíchat pořadí)
{ type: "choice", prompt: "…", code: "volitelná ukázka", options: ["`a`", "`b`"], answer: 0 }

// Doplň do mezery – každé ___ odpovídá jedné položce v blanks (pole přijatelných odpovědí)
{ type: "fill", prompt: "…", code: "let ___ = 5;", blanks: [["vek", "x"]], words: ["vek", "var"] }

// Co vypíše kód – buď s možnostmi (options + answer index), nebo psaná odpověď
{ type: "output", code: "console.log(1 + 1);", answer: "2", accept: ["2.0"] }

// Najdi chybu – číslo řádku (nebo pole čísel), fix = opravený řádek
{ type: "bug", prompt: "…", code: "…", bugLine: 2, fix: "opravený řádek" }

// Seřaď řádky – lines ve SPRÁVNÉM pořadí, alternatives = další platná pořadí (indexy)
{ type: "order", prompt: "…", lines: ["a", "b", "c"], alternatives: [[1, 0, 2]] }

// Napiš kód – starter, solution a testy (mode: "dom" + html/css pro stránky)
{ type: "code", prompt: "…", starter: "// …", solution: "…", tests: [ … ] }
```

### Testy u cvičení „Napiš kód“ a u projektů

```js
{ name: "Vypíše 15", type: "output", expected: "15" }            // celý výstup konzole (řádky)
{ name: "…", type: "output", expected: ["a", "b"], contains: true } // výstup jen obsahuje řádky
{ name: "secti(2,3) → 5", type: "call", expr: "secti(2, 3)", expected: 5 } // hluboké porovnání
{ name: "…", type: "check", code: "return vek === 15;" }          // libovolná podmínka (může být async)
{ name: "Používá for", type: "source", pattern: "for\\s*\\(", mustNot: false, message: "…" } // regex nad kódem bez komentářů
```

Testy `call` a `check` běží uvnitř sandboxu a vidí proměnné a funkce uživatele.
V režimu `dom` (iframe) mají k dispozici pomocníky:
`$(sel)`, `$$(sel)`, `text(sel)`, `click(sel|el)`, `type(sel, hodnota)`,
`submit(sel)`, `press(sel, klávesa)`, `wait(ms)`, `logs()`, `storage()`.

### Nový kurz

1. Zkopíruj např. `content/cs/courses/03-funkce.js` jako nový soubor a uprav `id`, `title`, `description`, `icon` (krátký text) a `color` (`green|cyan|purple|orange|yellow|red`).
2. Přidej import a položku do pole v `content/cs/courses/index.js`. Pořadí v poli = pořadí odemykání.
3. Volitelně přidej odznak za kurz do `content/cs/badges.js` (`condition: { type: "course", id: "…" }`).

### Nový projekt

Viz `content/cs/projects/hadej-cislo.js`. Projekt má `starter` a `final` soubory
(`{ html, css, js }`), `badge` a pole `steps`. Každý krok má `title`,
`instructions` (markdown), `hint`, `solution` (soubory po dokončení kroku) a `tests`.
Volitelně `testStorage` (výchozí obsah localStorage pro testy). Projekt pak přidej do
`content/cs/projects/index.js`. Odznak za projekt se vytvoří automaticky.

### Další jazyk

Zkopíruj složku `content/cs` (např. na `content/en`), přelož ji a přidej kód
jazyka do `SUPPORTED_LOCALES` v `js/i18n.js`. Jazyk se vybírá v `settings.locale`.

---

## Ukládání postupu a napojení backendu

Veškerý přístup k datům jde přes `js/storage.js`:

| Funkce | Popis |
|---|---|
| `initStorage(adapter?)` | načte postup při startu (asynchronně) |
| `getProgress()` | vrátí aktuální postup (synchronně z paměti) |
| `saveProgress(p)` / `updateProgress(fn)` | uloží změny (zápis je odložený, debounce 250 ms) |
| `onProgressChange(fn)` | odběr změn (např. hlavička s XP) |
| `exportProgress()` / `importProgress(json)` / `resetProgress()` | záloha a reset |

Úložiště používá **adaptér** s rozhraním `{ read(): Promise<object|null>, write(data): Promise<void> }`.
Výchozí je `createLocalStorageAdapter()`. Pro backend (Node.js + databáze) je
v souboru připravený vzor `createRestAdapter(baseUrl, getToken)`, který volá
`GET /progress` a `PUT /progress`. Stačí ho předat při startu v `js/main.js`:

```js
import { initStorage, createRestAdapter } from "./storage.js";
await initStorage(createRestAdapter("https://api.example.com", () => token));
```

Zbytek aplikace se nemění. Schéma dat má číslo verze (`SCHEMA_VERSION`) a místo
pro migrace (`migrate()`); starší zálohy se doplní o nová pole automaticky.

Postup obsahuje mimo jiné `review` (cvičení k opakování pod klíčem
`kurz/lekce#index`) a `playground` (obsah Hřiště). Pokud se změní obsah lekcí
a klíč už neodpovídá žádnému cvičení, opakování ho jednoduše ignoruje.

Data, která si ukládá **kód uživatele** v projektech (např. To-do seznam přes
`localStorage`), jsou uložena odděleně pod klíči `codio:sandbox:*`. Kód
v sandboxu k postupu aplikace přístup nemá.

---

## Bezpečnost spouštění kódu

- **Konzolové programy** běží ve **Web Workeru** vytvořeném z Blobu. Worker nemá
  přístup k DOM ani k `localStorage`. `indexedDB`, `caches`, `BroadcastChannel`
  a `importScripts` jsou v něm vypnuté. Po 5 s se natvrdo ukončí (`terminate()`).
- **Stránky** (DOM kurz, projekty) běží v `<iframe sandbox="allow-scripts allow-forms">`
  **bez** `allow-same-origin`. Mají tedy neprůhledný původ, žádný přístup
  k aplikaci ani jejímu úložišti. `localStorage`, `alert`, `confirm` a `prompt`
  jsou v něm nahrazené bezpečnými náhradami.
- **Nekonečné cykly:** před spuštěním se do podmínek `for`/`while`/`do…while` vloží
  kontrola `__lp()` (zachovává čísla řádků). Když vlákno visí v cyklu déle než 1,5 s,
  cyklus skončí chybou a maskot vysvětlí, co se stalo.
- Výstup konzole je omezený na 500 řádků.

---

## Známá omezení a nápady na pokračování

- Kurzy 3–6 mají po 5–6 lekcích a menší projekty po 4 krocích. Kurzy 1–2 jsou
  nejpodrobnější. Další obsah se přidává ve stejném formátu.
- Chrome u syntaktických chyb z `new Function` neuvádí číslo řádku. Sandbox ho proto
  zjišťuje náhradním načtením kódu přes `importScripts` (kód se přitom nespustí).
  Funguje to v Chromiu, v jiných prohlížečích může číslo řádku chybět.
- Když test neprojde kvůli jinému názvu proměnné nebo funkce, než je v zadání,
  sandbox to pozná (`typeof` v kontextu uživatele) a napíše, který název chybí.
- Chrome zpomaluje časovače v **neviditelných** iframech. Proto se na mobilu
  při kontrole kroku projektu automaticky přepne na záložku Náhled.
- CodeMirror se načítá z CDN. Offline se použije jednodušší záložní editor.
- Možná rozšíření: účty a backend, žebříčky, další jazyky.
