/**
 * Lidská vysvětlení častých chyb JavaScriptu (hlasem maskota).
 * Pravidla se zkoušejí postupně; `match` je regulární výraz nad zprávou chyby
 * (pokrývá formulace z Chrome, Firefoxu i Safari). Skupiny jsou dostupné
 * jako {0}, {1}… a {x} = první nalezená skupina.
 */
export default {
  lineHint: "Podívej se hlavně na **řádek {line}**.",
  rules: [
    {
      name: "InfiniteLoopError",
      text:
        "Tvůj cyklus se nejspíš **nikdy nezastaví**. Zkontroluj, jestli se podmínka cyklu někdy stane `false` – " +
        "třeba jestli zvyšuješ počítadlo (`i++`).",
    },
    {
      name: "ReferenceError",
      match: /^(?:'?([^'\s]+)'? is not defined|Can't find variable: (\S+))/,
      text:
        "Proměnná nebo funkce **`{x}`** neexistuje. Nepřeklepl ses? JavaScript rozlišuje velká a malá písmena " +
        "(`jmeno` ≠ `Jmeno`). A nezapomněl jsi ji vytvořit pomocí `let` nebo `const`?",
    },
    {
      name: "ReferenceError",
      match: /before initialization|can't access lexical declaration/i,
      text: "Používáš proměnnou **dřív, než jsi ji vytvořil**. Přesuň řádek s `let`/`const` výš, před první použití.",
    },
    {
      name: "TypeError",
      match: /Assignment to constant variable|invalid assignment to const/i,
      text:
        "Snažíš se změnit hodnotu **konstanty** (`const`). Konstanta se nastavuje jen jednou. " +
        "Pokud ji potřebuješ měnit, vytvoř ji pomocí `let`.",
    },
    {
      name: "TypeError",
      match: /(\S+) is not a function/,
      text:
        "Voláš **`{x}`** jako funkci (se závorkami `()`), ale funkce to není. Zkontroluj název – " +
        "třeba `console.log` vs. `console.Log` – nebo jestli to opravdu je funkce.",
    },
    {
      name: "TypeError",
      match: /Cannot read propert(?:y|ies) of (undefined|null)|(\S+) is (undefined|null)/,
      text:
        "Snažíš se něco číst z hodnoty **`{x}`** – tedy z ničeho. Většinou to znamená, že proměnná nemá hodnotu, " +
        "nebo že `document.querySelector` nic nenašel (zkontroluj selektor).",
    },
    {
      name: "TypeError",
      match: /Cannot set propert(?:y|ies) of (undefined|null)/,
      text: "Snažíš se nastavit vlastnost na hodnotě **`{x}`**. Nejčastěji `querySelector` nenašel element – zkontroluj `#id` nebo `.třídu`.",
    },
    {
      name: "TypeError",
      match: /is not iterable/,
      text: "Pokoušíš se procházet (`for…of`, rozbalení `...`) něco, co **není pole** ani jiný seznam.",
    },
    {
      name: "SyntaxError",
      match: /Unexpected end of input|missing \} |expected expression, got end of script/i,
      text: "Kód náhle **skončil** – nejspíš ti chybí zavírací závorka `}` nebo `)`. Spočítej si otevírací a zavírací závorky.",
    },
    {
      name: "SyntaxError",
      match: /missing \) after argument list|missing \) after/i,
      text: "Chybí **zavírací závorka `)`** – nejčastěji u `console.log(...)` nebo volání funkce. Nebo chybí čárka mezi argumenty.",
    },
    {
      name: "SyntaxError",
      match: /Invalid or unexpected token|unterminated string|Unterminated string/i,
      text:
        "V kódu je **neplatný znak** nebo **neuzavřený řetězec**. Zkontroluj, že každý text začíná i končí stejnou uvozovkou " +
        "(`'…'` nebo `\"…\"`).",
    },
    {
      name: "SyntaxError",
      match: /Identifier '?(\S+?)'? has already been declared|redeclaration of (?:let|const) (\S+)/,
      text: "Proměnnou **`{x}`** jsi vytvořil **dvakrát**. Podruhé už nepiš `let`/`const` – stačí `{x} = novaHodnota`.",
    },
    {
      name: "SyntaxError",
      match: /Missing initializer in const declaration|missing = in const declaration/i,
      text: "Konstanta (`const`) musí dostat hodnotu hned při vytvoření, třeba `const pi = 3.14;`.",
    },
    {
      name: "SyntaxError",
      match: /Unexpected token '?(.+?)'?$|unexpected token: '?(.+?)'?$/,
      text: "JavaScript na tomhle místě nečekal **`{x}`**. Často jde o chybějící nebo přebývající závorku, čárku či uvozovku.",
    },
    {
      name: "SyntaxError",
      match: /Unexpected identifier|unexpected token: identifier/i,
      text: "Na tomhle místě je **nečekané slovo**. Možná chybí operátor, čárka, závorka nebo uvozovky kolem textu.",
    },
    {
      name: "RangeError",
      match: /Maximum call stack|too much recursion/i,
      text:
        "Funkce volá sama sebe **donekonečna** (rekurze bez konce). Každá rekurze potřebuje podmínku, " +
        "kdy se zastaví.",
    },
    {
      name: "RangeError",
      match: /Invalid array length/i,
      text: "Pole nemůže mít zápornou nebo nesmyslně velkou délku.",
    },
  ],
  byName: {
    SyntaxError: "V kódu je **syntaktická chyba** – JavaScript mu nerozumí. Zkontroluj závorky, uvozovky a čárky.",
    ReferenceError: "Používáš něco, co **neexistuje**. Zkontroluj názvy proměnných a funkcí.",
    TypeError: "Pracuješ s hodnotou **nesprávného typu** – třeba voláš něco, co není funkce.",
    RangeError: "Nějaké číslo je **mimo povolený rozsah**.",
    TimeoutError: "Program běžel moc dlouho, tak jsem ho zastavil.",
    default: "Program skončil chybou. Přečti si zprávu výše – často napoví, kde je problém.",
  },
};
