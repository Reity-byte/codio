/**
 * sw.js – service worker: Codio funguje i offline a jde nainstalovat (PWA).
 *
 * Strategie:
 *  - vlastní soubory aplikace: NEJDŘÍV SÍŤ, při výpadku cache
 *    → po úpravě kódu se vždy načte nová verze, offline se použije poslední známá,
 *  - CDN (CodeMirror z esm.sh, písma Google): NEJDŘÍV CACHE
 *    → verze knihoven se nemění, po prvním načtení fungují i offline.
 *
 * Seznam souborů (PRECACHE) a VERSION generuje `python tools/build-sw.py`
 * – spusť ho po přidání nebo přejmenování souborů (na GitHub Pages to dělá workflow).
 */

const VERSION = "4540c333be"; // @version
// @precache-start
const PRECACHE = [
  "./",
  "./assets/favicon.svg",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/mascot.svg",
  "./content/cs/badges.js",
  "./content/cs/courses/01-zaklady.js",
  "./content/cs/courses/02-rizeni-toku.js",
  "./content/cs/courses/03-funkce.js",
  "./content/cs/courses/04-pole-objekty.js",
  "./content/cs/courses/05-dom.js",
  "./content/cs/courses/06-async.js",
  "./content/cs/courses/index.js",
  "./content/cs/errors.js",
  "./content/cs/index.js",
  "./content/cs/mascot.js",
  "./content/cs/mock-api.js",
  "./content/cs/playground-examples.js",
  "./content/cs/projects/generator-hesel.js",
  "./content/cs/projects/hadej-cislo.js",
  "./content/cs/projects/index.js",
  "./content/cs/projects/kalkulacka.js",
  "./content/cs/projects/pexeso.js",
  "./content/cs/projects/stopky.js",
  "./content/cs/projects/todo.js",
  "./content/cs/ui.js",
  "./css/animations.css",
  "./css/base.css",
  "./css/components.css",
  "./css/mascot.css",
  "./css/pages.css",
  "./css/tokens.css",
  "./index.html",
  "./js/content.js",
  "./js/editor.js",
  "./js/effects.js",
  "./js/errors.js",
  "./js/exercises/code.js",
  "./js/exercises/index.js",
  "./js/exercises/order.js",
  "./js/exercises/simple.js",
  "./js/gamification.js",
  "./js/i18n.js",
  "./js/icons.js",
  "./js/main.js",
  "./js/mascot.js",
  "./js/pages/hriste.js",
  "./js/pages/landing.js",
  "./js/pages/lesson.js",
  "./js/pages/map.js",
  "./js/pages/not-found.js",
  "./js/pages/practice-session.js",
  "./js/pages/practice.js",
  "./js/pages/profile.js",
  "./js/pages/project.js",
  "./js/pages/projects.js",
  "./js/pages/settings.js",
  "./js/playground.js",
  "./js/practice.js",
  "./js/pwa.js",
  "./js/router.js",
  "./js/sandbox-runtime.js",
  "./js/sandbox.js",
  "./js/session.js",
  "./js/storage.js",
  "./js/ui.js",
  "./manifest.webmanifest",
];
// @precache-end

const APP_CACHE = `codio-app-${VERSION}`;
const CDN_CACHE = "codio-cdn-v1";
const CDN_HOSTS = ["esm.sh", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      // cache: "reload" = obejít HTTP cache prohlížeče, ať se uloží čerstvé soubory
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("codio-app-") && k !== APP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = (await cache.match(request, { ignoreSearch: true })) || (await caches.match(request, { ignoreSearch: true }));
    if (cached) return cached;
    // navigace offline → kostra aplikace (o zbytek se postará hash router)
    if (request.mode === "navigate") {
      const shell = await cache.match("./index.html");
      if (shell) return shell;
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CDN_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // opaque odpovědi (no-cors) mají status 0 – ukládáme je také (písma)
  if (response.ok || response.type === "opaque") cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  } else if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request));
  }
  // ostatní požadavky (např. fetch z kódu uživatele na cizí API) jdou rovnou na síť
});
