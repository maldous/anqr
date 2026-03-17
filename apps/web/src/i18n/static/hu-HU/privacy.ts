import type { PageDefinition } from "../types";

export const privacy: PageDefinition = {
  title: "Adatvédelmi irányelvek",
  description:
    "Információ ANQR gyűjti, hogyan használják, és az Ön jogait vonatkozó adatvédelmi törvények.",
  lastUpdated: "2026. február 1",
  relatedLinks: [
    { href: "/terms?lang=${lang}", label: "Szolgáltatási feltételek", type: "external" },
  ],
  sections: [
    {
      heading: "Összefoglaló",
      paragraphs: [
        "Az ANQR egy QR kódgenerátor, az ügyfelek első megközelítésével. Nem kérjük, hogy hozzon létre egy fiókot. Alapértelmezés szerint a QR kódok a böngésződben keletkeznek - nincs hozzáférésünk a kódolt tartalomhoz.",
        "Szakmai használatra az ANQR egy szerveroldalas API-t biztosít, amely QR-kódokat generál URL paraméterekből. Az API használatakor az Ön QR-tartalmát a szervereinken dolgozzák fel a kép elkészítéséhez, de nem tárolja vagy nem naplózza.",
        "A Google AdSense hirdetési szolgáltatást használjuk, és használhatunk elemzési szolgáltatásokat. Ezek a szolgáltatások cookie-kon és hasonló technológiákon keresztül gyűjtenek információkat. Ez a szabályzat elmagyarázza, hogy milyen adatokat gyűjtünk, hogyan használjuk fel azokat, valamint az Ön jogait.",
      ],
    },
    {
      heading: "Információgyűjtés",
      bullets: [
        "Az Ön által megadott információk: Ha e-mailben vagy a kapcsolatfelvételi űrlapon lép velünk kapcsolatba, összegyűjtjük a nevét, e-mail címét és üzenettartalmát.",
        "Automatikusan gyűjtött információk: A hosting szolgáltatónk (Netlify), hirdetési partnereink és analitikus szolgáltatásaink gyűjthetnek: IP-cím, böngésző típus és verzió, operációs rendszer, eszköztípus, hivatkozó URL, meglátogatott oldalak, idő a helyszínen, és hozzávetőleges földrajzi elhelyezkedés.",
        "Third-party cookie: Hirdetési partnereink (Google AdSense) cookie-kat és hasonló technológiákat használnak reklámok kiszolgálására és mérésére. Maga az ANQR nem állít be első-fél sütiket.",
      ],
    },
    {
      heading: "Sütik és harmadik felek technológiái",
      paragraphs: [
        "Az ANQR nem állít be első fél sütit. A beállításokat (mint például a sötét üzemmódot) helyileg tároljuk az eszközön, amelyet nem továbbítunk semmilyen szerverre.",
        "Reklámpartnereink (Google AdSense) és tárhelyszolgáltatóink azonban sütiket és hasonló nyomkövető technológiákat használhatnak:",
      ],
      bullets: [
        "Reklámsütik (harmadik fél): A Google AdSense és reklámpartnerek által beállított hirdetések, hirdetési teljesítmény mérése és a felhasználói érdekek megértése. Ezek a cookie-k nyomon követhetik az Ön tevékenységét különböző honlapokon.",
        "Analitikai sütik (harmadik fél): A tárhelyszolgáltatónk vagy elemzőnk felhasználhatja anonim használati adatok gyűjtésére.",
      ],
    },
    {
      heading: "Google Adsense és reklám",
      paragraphs: [
        "A Google AdSense-en keresztül hirdetéseket jelenítünk meg. A Google és partnerei cookie-kat használnak az Ön böngészési előzményei és más honlapok (érdekalapú hirdetések) alapján.",
        "Ismerje meg, hogyan használja a Google az adatait: https: / / policies.google.com / technologies / partner- sites",
        "Az Európai Parlament és a Tanács (EU) 2015 / 849 rendelete (2015. április 26.) a személyes adatok feldolgozása tekintetében az egyének védelméről, valamint az ilyen adatok szabad áramlásáról (HL L 298., 2015.10.26., 1. o.)",
        "A hálózat hirdetési kezdeményezése útján történő kilépés: https: / / optout.networkadistising.org",
        "A Digital Advertising Alliance (Digital Advertising Alliance) útján történő kilépés: https: / / optout.abopads.info",
      ],
    },
    {
      heading: "Hogyan használjuk az információkat",
      bullets: [
        "Hogy válaszoljak a kérdéseire, és támogatást nyújtsak.",
        "Hogy reklámpartnereinken keresztül megjelenítse a megfelelő reklámokat.",
        "A weboldal használatának elemzése és szolgáltatásaink javítása.",
        "A csalások, visszaélések és biztonsági problémák felderítése, megelőzése és kezelése.",
        "A jogi kötelezettségek teljesítése.",
      ],
    },
    {
      heading: "Harmadik fél szolgáltatásai",
      bullets: [
        "Google AdSense: A hirdetések kiszolgálásához és méréséhez adatokat kap.",
        "Analitikai szolgáltatók: Névtelen felhasználási adatok fogadása.",
        "Nettify (hosting): A folyamatok kérése és az IP-címek bejelentkezése.",
        'Nem adjuk el a személyes adatait. A reklámpartnerekkel való adatmegosztás azonban a CCPA keretében "értékesítésnek" tekinthető (lásd alább).',
      ],
    },
    {
      heading: "Adatmegőrzés",
      bullets: [
        "Kapcsolattartók: Két évig.",
        "A kiszolgáló naplója: Legfeljebb 30 nap (tárhelyszolgáltató).",
        "Analitikai adatok: Legfeljebb 26 hónap (anonimizált).",
        "Reklámsütik: Jellemzően 13 hónap (partnerenként változik).",
      ],
    },
    {
      heading: "Az Ön jogai a GDPR (EGT felhasználók) alapján",
      paragraphs: [
        "Ha Ön az Európai Gazdasági Térségben tartózkodik, az általános adatvédelmi rendelet értelmében a következő jogokkal rendelkezik:",
      ],
      bullets: [
        "Hozzáférési jog: Kérjen egy másolatot a személyes adatairól, amit őrzünk magáról.",
        "A helyesbítéshez való jog: A pontatlan adatok helyesbítését kérem.",
        'A törléshez való jog: Adatainak törlését kérjük ("a felejtéshez való jog").',
        "A feldolgozás korlátozásának joga: Határokat kérek, hogy hogyan használjuk az adatait.",
        "Az adathordozhatóság joga: Kérje adatait hordozható formátumban.",
        "Tiltakozási jog: Tiltakozás a feldolgozás ellen, beleértve a direkt marketing célját is.",
        "A hozzájárulás visszavonása: A hozzájárulás visszavonása bármikor, amikor a feldolgozás konszenzus alapján történik.",
        "A panasz benyújtásának joga: Panaszt nyújt be adatvédelmi hatóságánál.",
      ],
    },
    {
      heading: "A GDPR jogalapja",
      paragraphs: [
        "Ezekre az alapokra vonatkozó adatokat dolgozzuk fel: a) hozzájárulás - személyre szabott reklámhoz (reklámpartnereink által kezelt); b) törvényes érdekek - az analitika, a biztonság és a fejlesztés érdekében; c) Szerződés - a kérdések megválaszolására.",
        "A jogok gyakorlásához lépjen kapcsolatba $_ _ _ ANQR _ PH _ 0 _ _. 30 napon belül válaszolunk.",
      ],
    },
    {
      heading: "Az Ön jogai a CCPA (California felhasználók) alapján",
      bullets: [
        "Joga van tudni: Információt kér az összegyűjtött adatokról, forrásokról, célokról és harmadik felekről.",
        "Törlés joga: Törölje a személyes adatait.",
        'A kijelentkezéshez való jog: A személyes adatok "értékesítéséből" való kizárás (a hirdetési partnerekkel való megosztás jogosult lehet).',
        "A megkülönböztetésmentességhez való jog: Nem fogunk diszkriminálni a jogaik gyakorlása miatt.",
      ],
    },
    {
      heading: "Összegyűjtött CCPA-kategóriák",
      paragraphs: [
        "Kategóriák: Azonosítók (IP-cím, eszközazonosító), Internet aktivitás (böngészés, hirdetési kölcsönhatások), Geoslocation (hozzávetőleges), Beállítások (böngészési érdekek).",
        "Joggyakorlás vagy kívülmaradás: $_ _ ANQR _ PH _ 0 _ _ vagy cookie beállítások beállítása.",
      ],
    },
    {
      heading: "Nemzetközi transzferek",
      paragraphs: [
        "Az Ön adatait más adatvédelmi törvényekkel rendelkező országokba továbbíthatjuk, beleértve az Egyesült Államokat is. Megfelelő biztosítékokat alkalmazunk, például szabványos szerződési feltételeket.",
      ],
    },
    {
      heading: "A gyermekek magánélete",
      paragraphs: [
        "Az ANQR nem vonatkozik a 13 év alatti (vagy az EGT-ben 16 éves) gyermekekre. Tudatosan nem gyűjtünk adatokat a gyerekekről. Lépjen kapcsolatba a $_ _ ANQR _ PH _ 0 _ _ -al, ha úgy gondolja, hogy egy gyermek információt szolgáltatott.",
      ],
    },
    {
      heading: "Biztonság",
      paragraphs: [
        "Megfelelő technikai és szervezeti intézkedéseket alkalmazunk az adatok védelmére, beleértve a HTTPS titkosítást. Az internetes átvitel azonban nem 100% -ig biztonságos.",
      ],
    },
    {
      heading: "Nem követhető",
      paragraphs: [
        "Tiszteletben tartjuk a Do Not Track böngésző jeleket, ha ez megvalósítható, bár a reklámpartnerek nem válaszolnak a DNT-re.",
      ],
    },
    {
      heading: "E politika módosításai",
      paragraphs: [
        'Ezt a szabályzatot rendszeresen frissíthetjük. Az "Utolsó frissítés" dátuma a legutóbbi változatot jelzi. A jelentős változásokat a webhely szalaghirdetésén keresztül lehet közölni.',
      ],
    },
    {
      heading: "Lépjen kapcsolatba velünk",
      paragraphs: [
        "Az adatvédelmi kérdések vagy a jogok gyakorlása: $_ _ ANQR _ PH _ 0 _ _ vagy használja a Kapcsolattartó oldalunkat. 30 napon belül válaszolunk a kérésekre.",
      ],
    },
    {
      heading: "Teljes adatvédelmi szabályzat",
      paragraphs: [
        "Ez az oldal adatvédelmi gyakorlataink összefoglalását tartalmazza. A teljes, jogilag kötelező erejű adatvédelmi szabályzatért, amely az adatkezelésről, az Ön jogairól és a GDPR, CCPA és más adatvédelmi törvények szerinti kötelezettségeinkről részletesen tájékozódhat, tekintse meg az iubenda által üzemeltetett teljes szabályzatunkat.",
      ],
      links: [
        {
          href: "https://www.iubenda.com/privacy-policy/70266922",
          label: "Tekintse meg az iubenda teljes adatvédelmi szabályzatát",
          type: "external",
        },
      ],
    },
  ],
};

export default privacy;
