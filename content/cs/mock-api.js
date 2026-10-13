/**
 * Falešné API pro lekce o fetch/async. Požadavky na `base` adresu se
 * v sandboxu neposílají na internet, ale odpoví se daty níže (se zpožděním
 * 300 ms). Lekce tak fungují offline a pokaždé stejně.
 */
export default {
  base: "https://api.codio.dev",
  routes: {
    "/uzivatele/1": { id: 1, jmeno: "Ada", mesto: "Brno", jazyky: ["JavaScript", "Python"] },
    "/uzivatele/2": { id: 2, jmeno: "Linus", mesto: "Praha", jazyky: ["C", "Rust"] },
    "/uzivatele": [
      { id: 1, jmeno: "Ada" },
      { id: 2, jmeno: "Linus" },
      { id: 3, jmeno: "Grace" },
    ],
    "/pocasi/praha": { mesto: "Praha", teplota: 18, obloha: "polojasno" },
    "/pocasi/brno": { mesto: "Brno", teplota: 21, obloha: "slunečno" },
    "/vtip": { otazka: "Proč programátoři nemají rádi přírodu?", odpoved: "Je v ní moc bugů." },
  },
};
