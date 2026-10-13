/**
 * i18n.js – načítání jazykového balíčku a překlad UI textů.
 *
 * Veškeré texty (UI, lekce, hlášky maskota…) žijí v `content/<jazyk>/`.
 * Nový jazyk = zkopírovat složku `content/cs` a přeložit ji.
 */

let bundle = null;
let currentLocale = "cs";

export const SUPPORTED_LOCALES = ["cs"];

/** Načte balíček pro daný jazyk (dynamický import ES modulu). */
export async function loadLocale(locale = "cs") {
  const safe = SUPPORTED_LOCALES.includes(locale) ? locale : "cs";
  bundle = await import(`../content/${safe}/index.js`);
  currentLocale = safe;
  document.documentElement.lang = safe;
  return bundle;
}

export function getLocale() {
  return currentLocale;
}

/** Vrátí celý načtený balíček (kurzy, projekty, hlášky…). */
export function getBundle() {
  if (!bundle) throw new Error("Jazykový balíček ještě není načtený.");
  return bundle;
}

function lookup(obj, path) {
  return path.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

/**
 * Překlad UI textu podle klíče, s doplněním proměnných.
 * @example t("header.xp", { xp: 120 })  // "120 XP"
 */
export function t(key, vars = {}) {
  const value = bundle ? lookup(bundle.ui, key) : undefined;
  if (value == null) {
    console.warn(`[i18n] Chybí text pro klíč "${key}"`);
    return key;
  }
  if (typeof value === "function") return value(vars);
  if (typeof value === "object") return value; // pole/objekty (např. seznam funkcí na úvodní stránce)
  return interpolate(String(value), vars);
}

export function interpolate(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

/**
 * Výběr tvaru slova podle čísla. Pravidla jsou v balíčku jazyka (`ui.pluralRule`),
 * takže čeština (1 / 2–4 / 5+) i jiné jazyky fungují bez úprav logiky.
 * @example plural(3, ["den", "dny", "dní"]) // "dny"
 */
export function plural(n, forms) {
  const rule = bundle?.ui?.pluralRule;
  const index = rule ? rule(n) : n === 1 ? 0 : 1;
  return forms[Math.min(index, forms.length - 1)];
}

export function formatNumber(n) {
  return new Intl.NumberFormat(currentLocale).format(n);
}

export function formatDate(date, options = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat(currentLocale, options).format(new Date(date));
}
