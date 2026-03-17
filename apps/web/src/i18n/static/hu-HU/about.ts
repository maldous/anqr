import type { PageDefinition } from "../types";

export const about: PageDefinition = {
  title: "Az ANQR-ről",
  description:
    "Az ANQR egy ingyenes QR kódgenerátor kliens-első megközelítéssel - QR-kódokat generál helyben vagy API-t használ beágyazáshoz.",
  lastUpdated: "2026. február 1",
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Nyisd ki a generátort", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Böngészés Tanulj cikkeket", type: "learn" },
  ],
  relatedLinks: [
    { href: "/privacy?lang=${lang}", label: "Adatvédelmi irányelvek", type: "external" },
    { href: "/terms?lang=${lang}", label: "Szolgáltatási feltételek", type: "external" },
  ],
  sections: [
    {
      heading: "Milyen típusú gyógyszer az ANQR?",
      paragraphs: [
        'ANQR (kiejtett "horgony") egy ingyenes QR kód generátor, amely létrehoz scannable kódok URL, szöveg, WiFi hitelesítő, névjegykártyák, naptár események, és így tovább.',
        "Olyan magánszemélyeknek, kisvállalkozásoknak, marketingeseknek és fejlesztőknek épült, akik erős QR-eszközöket akarnak, anélkül, hogy feliratkoznának. A kliens-first design azt jelenti, hogy a QR-kódokat alapértelmezés szerint helyben generálják a böngészőben, a professzionális beágyazás és integráció opcionális API szerverével.",
      ],
    },
    {
      heading: "Főbb jellemzők",
      bullets: [
        "Azonnal generálja a QR-kódokat a böngészőjében - nincs szükség fiókra.",
        "Egyéni színek, modul stílusok, kereső minták, és add kép overlays.",
        "Export több formátumban: PNG, SVG, WebP, és animált GIF.",
        "Speciális vezérlések hibajavítási szinthez, QR verzióhoz, kódolási módhoz és maszkkiválasztáshoz.",
        "Biztonsági szkennelési útmutatás és élő előnézet a kódok olvashatóságának megőrzéséhez nyomtatásban és képernyőn.",
        "Szerver-side API professzionális beágyazott teljes paraméter támogatás.",
        "Működik offline egyszer betöltött - ez egy statikus web app lehet futtatni bárhol.",
      ],
    },
    {
      heading: "Hogyan hat az ANQR",
      paragraphs: [
        "ANQR fut a böngészőben, és kódolja a bemenet egy szabványos QR mátrix Reed- Solomon hiba korrekció, majd adja meg a formátum, amit választ.",
        "Alapértelmezés szerint a generálás helyileg, a böngészőben történik. Professzionális használatra a szerveroldali API segítségével QR-kódokat is generálhat URL-paramétereken keresztül – ez tökéletes webhelyekbe, e-mailekbe vagy automatizált munkafolyamatokba való beágyazáshoz.",
        "Amikor hozzáadjuk az átfedéseket vagy animációkat, az ANQR egyensúlyozza a letapogatás megbízhatóságát, így az eredmény nem változik.",
        "Az ANQR a statikus kódokra összpontosít (az adatok a QR-en belül vannak). Ha dinamikus kódra van szüksége (szerkeszthető cél), kódolhatja saját URL-jét vagy rövid linket.",
      ],
    },
    {
      heading: "Ki irányítja az ANQR-t?",
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: "Reklám és hogyan maradunk szabadok",
      paragraphs: [
        "Az ANQR szabadon használható, és reklámozással támogatja. A Google AdSense-en és / vagy más reklámpartnereken keresztül hirdetéseket mutathatunk.",
        "A hirdetési szolgáltatók cookie-kat vagy hasonló technológiákat használhatnak az Ön érdekeire és böngészési tevékenységére épülő hirdetések személyre szabására. Az eszközbeállításokban és a Google hirdetési beállításokon keresztül kezelheti a hirdetési preferenciákat, és többet megtudhat az Adatvédelmi irányelveinkben.",
        "Nem adjuk el a QR kódokba kódolt tartalmat. A hirdetések hozzájárulnak a projekt működtetésének és fejlesztésének költségeihez.",
      ],
    },
    {
      heading: "Nyílt szabványok",
      paragraphs: [
        "Az ANQR az ISO / IEC 18004 szabványon alapuló QR-kódokat generál, amelyek célja a szkennerek, kamerák és nyomtatási munkafolyamatok széles körű összeegyeztethetősége.",
      ],
    },
    {
      heading: "Kereskedelmi közlemény",
      paragraphs: [
        "A QR Code ® a DENSO WAVE INCORPORATED bejegyzett védjegye. Az ANQR nem kapcsolódik a DENSO WAVE INCORPORATION-hoz, nem támogatja vagy támogatja azt.",
      ],
    },
    {
      heading: "Visszajelzés és hozzájárulások",
      paragraphs: [
        "Üdvözöljük a visszajelzéseket, hibajelentéseket és javaslatokat. Kérjük, lépjen kapcsolatba e-mailben vagy a kapcsolattartó oldalon - minden üzenetet elolvasunk, bár a válaszidő változhat.",
      ],
    },
  ],
};

export default about;
