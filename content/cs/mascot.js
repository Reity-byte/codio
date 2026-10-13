/**
 * Maskot Bajtík – identita a sada hlášek.
 * Tón: přátelský, lehce vtipný, povzbudivý, nikdy ponižující.
 * Proměnné ve složených závorkách doplňuje aplikace ({name}, {xp}, {n}…).
 */
export default {
  name: "Bajtík",
  tagline: "Malý robot s velkým srdcem pro středníky.",
  bio:
    "Bajtík se narodil v serverovně, když se jednomu monitoru omylem spustil vlastní kód. Od té doby miluje JavaScript, " +
    "sbírá ztracené středníky a strašně rád pomáhá lidem napsat jejich první program.",

  lines: {
    landing: [
      "Ahoj! Já jsem Bajtík. Naučím tě JavaScript – po malých kouscích, slibuju.",
      "Čau! Programování není magie. Teda… trochu jo. Ale naučitelná!",
    ],
    welcome: [
      "Vítej zpátky{name}! Jdeme na to?",
      "Ahoj{name}! Moje antény cítí, že dneska to půjde skvěle.",
      "Systém nabootován. Kodér{name} detekován. Paráda!",
    ],
    mapIdle: [
      "Klikni na zářící uzel a pokračuj, kde jsi skončil.",
      "Jedna lekce denně a z tebe bude programátor. Matematika nelže.",
      "Tip: lekce se dají opakovat. Opakování je matka moudrosti… a XP.",
    ],
    streakRisk: [
      "Pssst! Tvoje série {n} dní hoří. Jedna krátká lekce ji zachrání!",
      "Neopouštěj mě! Teda… sérii. Dneska ještě chybí aspoň pár XP.",
    ],
    allDone: ["Dokončil jsi všechno! Jsem na tebe tak pyšný, že se mi přehřívá procesor."],
    poke: [
      "Hihi, to lechtá!",
      "Víš, proč programátoři nosí brýle? Protože neumí C#.",
      "Moje oblíbené číslo? 0x2A. To je 42, mimochodem.",
      "Nejsem bug, jsem feature!",
      "Kdybys mě hledal, jsem ve smyčce while(true) { pomáhej(); }",
      "Pozor, nemačkej mě moc, mám jen 8 bitů trpělivosti. Dělám si srandu, mám jich 64.",
      "Psst. `const` je jako slib – jednou řekneš a platí.",
    ],
    sleep: ["Zzz… zzz… sním o elektrických ovečkách…", "Zzz… jen si na chvilku zavřu monitor…"],
    wake: ["Á, jsi zpátky! Ani jsem nespal. Vůbec ne.", "Jéé, ahoj! Můžeme pokračovat?"],

    theoryIntro: [
      "Nejdřív trocha teorie. Neboj, krátká!",
      "Přečti si výklad a klidně si ukázku spusť a uprav. Nic nerozbiješ!",
    ],
    exercisesIntro: ["Teď si to vyzkoušíme. Já věřím, že to dáš!", "Čas na cvičení! Ukaž, co umíš."],
    correct: [
      "Přesně tak!",
      "Bum! Správně!",
      "Tvůj kód by mi udělal radost i v produkci.",
      "Správně! Moje LEDka svítí radostí.",
      "Jo! Takhle se to dělá.",
      "Bezchybné. Jako dobře uzavřená závorka.",
    ],
    wrong: [
      "Těsně vedle. Přečti si vysvětlení – příště to dáš!",
      "Nevadí! Chyby jsou jen ladění v praxi.",
      "Hmm, tohle ne. Ale každý bug je lekce.",
      "Skoro! Zkusíme to pak znovu.",
      "Ani já jsem neuměl všechno hned. První verze mě psala nekonečný cyklus.",
    ],
    hint: ["Tady máš malou nápovědu. Pšt, nikomu to neříkej.", "Nápověda je tu, aby se používala!"],
    codeError: ["Hups, chyba! Podívej se, co jsem ti k ní napsal.", "Program spadl, ale ty ne. Opravíme to!"],
    testsPassed: ["Všechny testy prošly! Zelená je moje oblíbená barva.", "Testy svítí zeleně. Jsi programátor!"],
    testsFailed: ["Některé testy neprošly. Podívej se, které – a zkus to znovu.", "Skoro! Pár testů ještě svítí červeně."],
    solutionShown: ["Žádná ostuda – číst cizí kód je taky učení.", "Projdi si řešení řádek po řádku a pak to zkus sám."],
    heartsEmpty: ["Došla srdíčka. Dej si pauzu, protáhni se, vypij vodu – a pak zase!"],
    lessonComplete: [
      "Lekce hotová! Jsi o kus blíž ke svému prvnímu webu.",
      "Paráda! Tvoje mozkové synapse se právě zkompilovaly.",
      "Hotovo! Mám radost, až mi blikají diody.",
    ],
    perfect: ["PERFEKTNÍ! Ani jedna chyba! Musím si to zapsat do logu.", "Bez chyby! Ty jsi snad taky robot?"],
    courseUnlocked: ["Nový kurz odemčen! Jdeme objevovat!"],
    levelUp: ["Level up! Cítíš ten nárůst výkonu?"],
    goalReached: ["Denní cíl splněn! Dneska jsi hvězda."],

    practice: [
      "Trénink dělá mistra! I já si každý den defragmentuju paměť.",
      "Opakování je matka moudrosti. A babička XP.",
      "Krátký trénink a hned se ti to usadí v hlavě. Jako cache!",
    ],
    projectsIntro: ["Projekty jsou to nejlepší – postavíš něco opravdového!", "Vyber si projekt. Já držím palce… teda manipulátory."],
    projectStart: ["Pojďme na to krok za krokem. Vpravo uvidíš živý náhled."],
    projectStep: ["Krok splněn! Další kousek skládačky je na místě.", "Funguje to! Jdeme dál."],
    projectDone: ["Projekt dokončen! Tohle si klidně ukaž kamarádům.", "Hotovo! Postavil jsi skutečnou aplikaci!"],

    profile: ["Tohle jsou tvoje statistiky. Já bych se s nimi chlubil.", "Každé XP se počítá. Doslova – mám na to proměnnou."],
    settings: ["Tady si všechno nastavíš podle sebe.", "Můžeš vypnout zvuky, animace i srdíčka. Hlavně ať tě to baví!"],
    notFound: ["404! Hledal jsem všude, i pod klávesnicí. Nic.", "Tahle stránka neexistuje. Možná je v jiném vesmíru."],
    error: ["Něco se rozbilo. Ale klid, to se programátorům stává denně."],
  },
};
