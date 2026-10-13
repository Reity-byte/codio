/**
 * errors.js – převod technických chyb JavaScriptu na lidské vysvětlení
 * hlasem maskota. Vzory a texty jsou v content/<jazyk>/errors.js.
 */
import { getErrorHelp } from "./content.js";
import { interpolate } from "./i18n.js";

/**
 * @param {{name: string, message: string, line?: number}} error
 * @returns {string} markdown text s vysvětlením
 */
export function explainError(error) {
  if (!error) return "";
  const help = getErrorHelp();
  for (const rule of help.rules) {
    if (rule.name && rule.name !== error.name) continue;
    const m = rule.match ? rule.match.exec(error.message) : [];
    if (!m) continue;
    const vars = { line: error.line ?? "?" };
    m.slice(1).forEach((g, i) => (vars[i] = g ?? ""));
    // první nalezená skupina jako {x} – praktické pro vzory s alternativami
    vars.x = m.slice(1).find((g) => g) ?? "";
    let text = interpolate(rule.text, vars);
    if (error.line && help.lineHint) text += " " + interpolate(help.lineHint, vars);
    return text;
  }
  const byName = help.byName[error.name] || help.byName.default;
  let text = interpolate(byName, {});
  if (error.line && help.lineHint) text += " " + interpolate(help.lineHint, { line: error.line });
  return text;
}
