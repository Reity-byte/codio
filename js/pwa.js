/**
 * pwa.js – instalovatelná aplikace (PWA): registrace service workeru,
 * tlačítko „Nainstalovat“ a upozornění na offline/online.
 */
import { toast } from "./ui.js";
import { t } from "./i18n.js";

let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

/** Běží aplikace jako nainstalovaná (samostatné okno)? */
export function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

/** iPhone/iPad – tam se instaluje ručně přes Sdílet → Přidat na plochu. */
export function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Nabízí prohlížeč instalaci (Chrome/Edge/Android)? */
export function canInstall() {
  return !!deferredPrompt && !isInstalled();
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return outcome === "accepted";
}

/** Odběr změny dostupnosti instalace (např. pro stránku Nastavení). */
export function onInstallChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initPwa() {
  // Service worker jen přes http(s) – z file:// to nejde
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch((err) => console.warn("[pwa] Service worker se nezaregistroval", err));
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // vlastní tlačítko v Nastavení místo automatické lišty
    deferredPrompt = e;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    toast(t("pwa.installed"), { type: "success", iconName: "download" });
    notify();
  });

  window.addEventListener("offline", () => toast(t("pwa.offline"), { type: "info", iconName: "alert", duration: 5000 }));
  window.addEventListener("online", () => toast(t("pwa.online"), { type: "success", duration: 2500 }));
}
