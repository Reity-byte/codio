/**
 * router.js – jednoduchý hash router (funguje i bez serveru).
 *
 * Stránka (modul v js/pages/) exportuje default objekt:
 *   {
 *     focusMode?: boolean | (params) => boolean, // skryje navigaci (lekce)
 *     render(container, params): cleanup | { cleanup, canLeave } | Promise<...>
 *   }
 * `canLeave()` může vrátit false / Promise<false> a zabránit odchodu
 * (např. rozpracovaná lekce).
 */

const routes = [];
let mainEl = null;
let current = null; // { cleanup, canLeave, path }
let notFoundLoader = null;
let navigationId = 0;
const afterHooks = new Set();

/**
 * Registrace cesty. Parametry se zapisují jako `:jmeno`.
 * @example route("/lekce/:course/:lesson", () => import("./pages/lesson.js"))
 */
export function route(pattern, loader) {
  const keys = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/\/:([^/]+)/g, (m, key) => {
        keys.push(key);
        return "/([^/]+)";
      }) +
      "/?$"
  );
  routes.push({ pattern, regex, keys, loader });
}

export function setNotFound(loader) {
  notFoundLoader = loader;
}

export function currentPath() {
  return decodeURI(location.hash.replace(/^#/, "")) || "/";
}

export function navigate(path, { replace = false } = {}) {
  const hash = `#${path}`;
  if (location.hash === hash) {
    handleRoute();
    return;
  }
  if (replace) {
    history.replaceState(null, "", hash);
    handleRoute();
  } else {
    location.hash = hash;
  }
}

/** Callback po každém vykreslení stránky (např. zvýraznění navigace). */
export function onRouteChange(fn) {
  afterHooks.add(fn);
  return () => afterHooks.delete(fn);
}

function match(path) {
  for (const r of routes) {
    const m = r.regex.exec(path);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { route: r, params };
    }
  }
  return null;
}

let lastPath = null;
let leavePending = false;

async function handleRoute() {
  const path = currentPath();

  // Dotaz stávající stránky, zda ji lze opustit
  if (current?.canLeave && lastPath !== null && lastPath !== path) {
    // Dialog už je otevřený (např. dvojí klik na Zpět) – druhý neotevírat
    if (leavePending) return;
    leavePending = true;
    const ok = await current.canLeave();
    leavePending = false;
    if (!ok) {
      // replaceState nevyvolá hashchange → jen vrátíme adresu zpět
      history.replaceState(null, "", `#${lastPath}`);
      return;
    }
  }

  const myId = ++navigationId;
  const found = match(path);
  const loader = found ? found.route.loader : notFoundLoader;
  const params = found ? found.params : { path };

  // Odchodová animace
  const reduce = document.documentElement.dataset.motion === "reduce";
  if (current && !reduce) {
    mainEl.classList.add("is-leaving");
    await new Promise((r) => setTimeout(r, 110));
  }

  let page;
  try {
    page = (await loader()).default;
  } catch (err) {
    console.error("[router] Nelze načíst stránku", err);
    page = (await notFoundLoader()).default;
  }
  if (myId !== navigationId) return; // mezitím přišla jiná navigace

  try {
    runCleanup();
  } catch (err) {
    console.error(err);
  }

  mainEl.classList.remove("is-leaving", "is-entering");
  mainEl.replaceChildren();
  const focusMode = typeof page.focusMode === "function" ? page.focusMode(params) : !!page.focusMode;
  document.body.classList.toggle("is-focus-mode", focusMode);
  window.scrollTo({ top: 0, behavior: "instant" });

  let result;
  try {
    result = await page.render(mainEl, params);
  } catch (err) {
    console.error("[router] Chyba při vykreslení stránky", err);
    const errPage = (await notFoundLoader()).default;
    result = await errPage.render(mainEl, { path, error: err });
  }
  if (myId !== navigationId) {
    // Stránka se mezitím změnila – uklidit, co jsme právě vytvořili
    (typeof result === "function" ? result : result?.cleanup)?.();
    return;
  }
  current = {
    cleanup: typeof result === "function" ? result : result?.cleanup,
    canLeave: result?.canLeave,
  };
  lastPath = path;

  void mainEl.offsetWidth;
  mainEl.classList.add("is-entering");
  setTimeout(() => mainEl.classList.remove("is-entering"), 600);

  // Přesun fokusu na obsah kvůli čtečkám obrazovky
  const heading = mainEl.querySelector("h1");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  } else {
    mainEl.focus({ preventScroll: true });
  }

  afterHooks.forEach((fn) => fn(path, params));
}

function runCleanup() {
  if (current?.cleanup) current.cleanup();
  current = null;
}

export function startRouter(container) {
  mainEl = container;
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
