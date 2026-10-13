/**
 * storage.js – jediná vrstva pro ukládání postupu uživatele.
 *
 * Zbytek aplikace NIKDY nesahá přímo na localStorage. Pracuje jen s funkcemi
 * getProgress() / saveProgress() / updateProgress() atd.
 *
 * Jak to funguje:
 *  - Při startu se zavolá `initStorage()`, která přes *adapter* načte data
 *    (asynchronně) do paměťové cache.
 *  - `getProgress()` vrací synchronně cache, takže UI nemusí řešit Promise.
 *  - `saveProgress()` aktualizuje cache a zápis přes adapter odloží (debounce).
 *
 * Napojení backendu: stačí napsat nový adapter se stejným rozhraním
 * `{ read(): Promise<object|null>, write(data): Promise<void> }`
 * (viz `createRestAdapter` níže a README) a předat ho do `initStorage()`.
 */

const STORAGE_KEY = "codio:progress";
const SANDBOX_PREFIX = "codio:sandbox:";
export const SCHEMA_VERSION = 1;

/** Výchozí (prázdný) postup. */
export function createDefaultProgress() {
  const now = new Date().toISOString();
  return {
    version: SCHEMA_VERSION,
    createdAt: now,
    lastSeenAt: now,
    user: { name: "" },
    xp: 0,
    stats: {
      exercisesCorrect: 0,
      exercisesWrong: 0,
      lessonsCompleted: 0,
      perfectLessons: 0,
      hintsUsed: 0,
      codeRuns: 0,
      bugsFound: 0,
      projectsCompleted: 0,
      secondsLearning: 0,
      practiceSessions: 0,
      reviewsMastered: 0,
    },
    /** klíč "kurz/lekce" → { completed, completedAt, bestAccuracy, perfect, timesCompleted } */
    lessons: {},
    /** klíč cvičení „kurz/lekce#index“ → { box, due, misses, added } – opakování chyb */
    review: {},
    /** obsah Hřiště (volný editor) */
    playground: { mode: "console", js: "", html: "", css: "" },
    /** id projektu → { step, files: {html, css, js}, completed, completedAt } */
    projects: {},
    streak: { current: 0, best: 0, lastActiveDate: null },
    /** datum (YYYY-MM-DD) → získané XP v daný den */
    history: {},
    hearts: { count: 5, updatedAt: now },
    /** id odznaku → ISO datum získání */
    badges: {},
    /** id kurzů, jejichž odemknutí už uživatel viděl (kvůli jednorázovému efektu) */
    seenUnlocks: [],
    settings: {
      dailyGoal: 20,
      sound: true,
      motion: "auto", // "auto" | "on" | "off"
      hearts: true,
      unlockAll: false,
      locale: "cs",
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Adaptery                                                                  */
/* ------------------------------------------------------------------------ */

/** Výchozí adapter – localStorage prohlížeče. */
export function createLocalStorageAdapter(key = STORAGE_KEY) {
  return {
    async read() {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.warn("[storage] Nelze číst localStorage:", err);
        return null;
      }
    },
    async write(data) {
      try {
        window.localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.warn("[storage] Nelze zapsat do localStorage:", err);
      }
    },
  };
}

/**
 * Ukázkový adapter pro budoucí backend (Node.js + databáze).
 * Zatím se nepoužívá – slouží jako vzor, viz README.
 */
export function createRestAdapter(baseUrl, getToken = () => null) {
  const headers = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };
  return {
    async read() {
      const res = await fetch(`${baseUrl}/progress`, { headers: headers() });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    async write(data) {
      await fetch(`${baseUrl}/progress`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
      });
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Stav a veřejné API                                                        */
/* ------------------------------------------------------------------------ */

let adapter = createLocalStorageAdapter();
let cache = createDefaultProgress();
let writeTimer = null;
const listeners = new Set();

/**
 * Hluboké sloučení uložených dat s výchozí strukturou – díky tomu starší
 * záloha bez nového pole aplikaci nerozbije.
 */
function mergeDefaults(defaults, data) {
  if (Array.isArray(defaults)) return Array.isArray(data) ? data : defaults;
  if (defaults && typeof defaults === "object") {
    const out = { ...defaults };
    if (data && typeof data === "object") {
      for (const key of Object.keys(data)) {
        out[key] = key in defaults ? mergeDefaults(defaults[key], data[key]) : data[key];
      }
    }
    return out;
  }
  return data === undefined ? defaults : data;
}

/** Migrace mezi verzemi schématu (zatím jen v1). */
function migrate(data) {
  if (!data || typeof data !== "object") return createDefaultProgress();
  // Příklad budoucí migrace:
  // if (data.version === 1) { data.newField = ...; data.version = 2; }
  return mergeDefaults(createDefaultProgress(), data);
}

/** Načte postup přes adapter. Volá se jednou při startu aplikace. */
export async function initStorage(customAdapter) {
  if (customAdapter) adapter = customAdapter;
  try {
    const data = await adapter.read();
    cache = migrate(data);
  } catch (err) {
    console.warn("[storage] Načtení selhalo, použije se prázdný postup.", err);
    cache = createDefaultProgress();
  }
  return cache;
}

/** Vrátí aktuální postup (referenci na cache – neupravovat napřímo, použij updateProgress). */
export function getProgress() {
  return cache;
}

/** Uloží celý objekt postupu. */
export function saveProgress(progress) {
  cache = progress;
  scheduleWrite();
  listeners.forEach((fn) => fn(cache));
}

/**
 * Bezpečná úprava: předaná funkce dostane postup a může ho mutovat.
 * @example updateProgress(p => { p.xp += 10; })
 */
export function updateProgress(mutator) {
  mutator(cache);
  saveProgress(cache);
  return cache;
}

/** Odběr změn postupu (např. pro hlavičku s XP). Vrací funkci pro odhlášení. */
export function onProgressChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function scheduleWrite() {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(flush, 250);
}

/** Okamžitý zápis (např. před zavřením stránky). */
export function flush() {
  clearTimeout(writeTimer);
  cache.lastSeenAt = new Date().toISOString();
  return adapter.write(cache);
}

/** Smaže veškerý postup. */
export function resetProgress() {
  const keepSettings = { ...cache.settings, unlockAll: false };
  cache = createDefaultProgress();
  cache.settings = keepSettings;
  clearSandboxStorage();
  saveProgress(cache);
  return flush();
}

/** Export postupu jako JSON řetězec (záloha). */
export function exportProgress() {
  return JSON.stringify({ app: "codio", exportedAt: new Date().toISOString(), progress: cache }, null, 2);
}

/**
 * Import zálohy. Vyhodí chybu, pokud soubor nevypadá jako záloha Codio.
 * @param {string} json
 */
export function importProgress(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("invalid-json");
  }
  const data = parsed && parsed.app === "codio" ? parsed.progress : parsed;
  if (!data || typeof data !== "object" || typeof data.xp !== "number" || !data.settings) {
    throw new Error("invalid-format");
  }
  cache = migrate(data);
  saveProgress(cache);
  return flush();
}

/* ------------------------------------------------------------------------ */
/* Úložiště pro kód uživatele v sandboxu (např. To-do projekt s localStorage) */
/* Je oddělené od postupu, aby kód uživatele nemohl postup přepsat.           */
/* ------------------------------------------------------------------------ */

export function getSandboxStorage(namespace) {
  try {
    return JSON.parse(window.localStorage.getItem(SANDBOX_PREFIX + namespace) || "{}");
  } catch {
    return {};
  }
}

export function setSandboxStorage(namespace, data) {
  try {
    const json = JSON.stringify(data);
    // Ochrana proti zahlcení – kód uživatele smí uložit max. ~200 kB
    if (json.length > 200_000) return false;
    window.localStorage.setItem(SANDBOX_PREFIX + namespace, json);
    return true;
  } catch {
    return false;
  }
}

function clearSandboxStorage() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(SANDBOX_PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* nic */
  }
}

window.addEventListener("pagehide", () => {
  if (writeTimer) flush();
});
