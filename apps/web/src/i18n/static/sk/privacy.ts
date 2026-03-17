import type { PageDefinition } from "../types";

export const privacy: PageDefinition = {
  title: "Zásady ochrany osobných údajov",
  description:
    "Informácie, ktoré ANQR zhromažďuje, ako sa používajú a vaše práva podľa platných zákonov na ochranu súkromia.",
  lastUpdated: "1. februára 2026",
  relatedLinks: [{ href: "/terms?lang=${lang}", label: "Zmluvné podmienky", type: "external" }],
  sections: [
    {
      heading: "Zhrnutie",
      paragraphs: [
        "ANQR je generátor QR kódu s prístupom na prvom mieste klienta. Nevyžadujeme, aby ste si vytvorili účet. Štandardne sa QR kódy generujú lokálne vo vašom prehliadači – nemáme prístup k obsahu, ktorý zakódujete.",
        "Pre profesionálne použitie poskytuje ANQR server-side API, ktoré generuje QR kódy z parametrov URL. Pri používaní rozhrania API sa váš obsah QR spracováva na našich serveroch na vykreslenie obrázka, ale neukladá sa ani nezaznamenáva.",
        "Na inzerciu používame službu Google AdSense a môžeme využívať analytické služby. Tieto služby zhromažďujú informácie prostredníctvom súborov cookie a podobných technológií. Tieto zásady vysvetľujú, aké údaje sa zhromažďujú, ako sa používajú a aké máte práva.",
      ],
    },
    {
      heading: "Informácie, ktoré zhromažďujeme",
      bullets: [
        "Informácie, ktoré poskytujete: Ak nás kontaktujete prostredníctvom e-mailu alebo nášho kontaktného formulára, zhromažďujeme vaše meno, e-mailovú adresu a obsah správy.",
        "Automaticky zhromažďované informácie: Náš poskytovateľ hostingu (Netlify), reklamní partneri a analytické služby môžu zhromažďovať: IP adresu, typ a verziu prehliadača, operačný systém, typ zariadenia, odkazujúcu adresu URL, navštívené stránky, čas na stránke a približnú geografickú polohu.",
        "Súbory cookie tretích strán: Naši reklamní partneri (Google AdSense) používajú súbory cookie a podobné technológie na zobrazovanie a meranie reklám. Samotný ANQR nenastavuje žiadne súbory cookie prvej strany.",
      ],
    },
    {
      heading: "Súbory cookie a technológie tretích strán",
      paragraphs: [
        "ANQR nenastavuje žiadne súbory cookie prvej strany. Vaše predvoľby (napríklad tmavý režim) sú uložené lokálne vo vašom zariadení, ktoré sa neprenášajú na žiadny server.",
        "Naši reklamní partneri (Google AdSense) a poskytovateľ hostingu však môžu používať súbory cookie a podobné technológie sledovania:",
      ],
      bullets: [
        "Reklamné súbory cookie (tretej strany): Nastavené službou Google AdSense a reklamnými partnermi na zobrazovanie relevantných reklám, meranie výkonnosti reklám a pochopenie záujmov používateľov. Tieto súbory cookie môžu sledovať vašu aktivitu na rôznych webových stránkach.",
        "Analytické súbory cookie (tretej strany): Môže ich použiť náš poskytovateľ hostingu alebo analytické služby na zhromažďovanie anonymizovaných údajov o používaní.",
      ],
    },
    {
      heading: "Google AdSense a reklama",
      paragraphs: [
        "Reklamy zobrazujeme prostredníctvom služby Google AdSense. Google a jej partneri používajú súbory cookie na zobrazovanie reklám na základe vašej histórie prehliadania na tejto stránke a iných webových stránkach (záujmovo orientovaná reklama).",
        "Zistite, ako Google používa vaše informácie: https://policies.google.com/technologies/partner-sites",
        "Spravujte prispôsobenie reklám: https://adssettings.google.com",
        "Odhlásiť sa prostredníctvom iniciatívy Network Advertising Initiative: https://optout.networkadvertising.org",
        "Odhlásiť sa cez Digital Advertising Alliance: https://optout.aboutads.info",
      ],
    },
    {
      heading: "Ako používame informácie",
      bullets: [
        "Ak chcete odpovedať na vaše otázky a poskytnúť podporu.",
        "Na zobrazovanie relevantných reklám prostredníctvom našich reklamných partnerov.",
        "Analyzovať používanie stránok a zlepšovať naše služby.",
        "Na zisťovanie, prevenciu a riešenie podvodov, zneužitia a bezpečnostných problémov.",
        "Dodržiavať zákonné povinnosti.",
      ],
    },
    {
      heading: "Služby tretích strán",
      bullets: [
        "Google AdSense: Prijíma údaje na zobrazovanie a meranie reklám.",
        "Poskytovatelia analýzy: Dostávajte anonymizované údaje o používaní.",
        "Netlify (hosting): Spracováva požiadavky a môže zaznamenávať IP adresy.",
        'Vaše osobné údaje nepredávame. Zdieľanie údajov s reklamnými partnermi však možno považovať za „predaj" podľa zákona CCPA (pozri nižšie).',
      ],
    },
    {
      heading: "Uchovávanie údajov",
      bullets: [
        "Kontaktné údaje: do 2 rokov.",
        "Protokoly servera: Až 30 dní (poskytovateľ hostingu).",
        "Analytické údaje: do 26 mesiacov (anonymizované).",
        "Reklamné súbory cookie: Zvyčajne 13 mesiacov (líši sa podľa partnera).",
      ],
    },
    {
      heading: "Vaše práva podľa GDPR (používatelia EHP)",
      paragraphs: [
        "Ak sa nachádzate v Európskom hospodárskom priestore, máte podľa všeobecného nariadenia o ochrane údajov nasledujúce práva:",
      ],
      bullets: [
        "Právo na prístup: Vyžiadajte si kópiu osobných údajov, ktoré o vás uchovávame.",
        "Právo na opravu: Požadovať opravu nepresných údajov.",
        'Právo na vymazanie: Žiadosť o vymazanie vašich údajov („právo byť zabudnutý").',
        "Právo na obmedzenie spracovania: Požiadajte o obmedzenie spôsobu, akým používame vaše údaje.",
        "Právo na prenosnosť údajov: Vyžiadajte si svoje údaje v prenosnom formáte.",
        "Právo namietať: Namietať proti spracovaniu vrátane priameho marketingu.",
        "Právo odvolať súhlas: Odvolať súhlas kedykoľvek, ak je spracovanie založené na súhlase.",
        "Právo podať sťažnosť: Podajte sťažnosť svojmu úradu na ochranu údajov.",
      ],
    },
    {
      heading: "Právny základ GDPR",
      paragraphs: [
        "Údaje spracovávame na týchto základoch: (a) Súhlas – pre personalizovanú reklamu (spravovanú našimi reklamnými partnermi); (b) Oprávnené záujmy – pre analýzu, bezpečnosť a zlepšenie; (c) Zmluva – odpovedať na otázky.",
        "Ak chcete uplatniť svoje práva, kontaktujte email@anqr.link. Odpovedáme do 30 dní.",
      ],
    },
    {
      heading: "Vaše práva podľa zákona CCPA (používatelia z Kalifornie)",
      bullets: [
        "Právo vedieť: Vyžiadajte si informácie o zhromaždených údajoch, zdrojoch, účeloch a tretích stranách.",
        "Právo na vymazanie: Žiadosť o vymazanie vašich osobných údajov.",
        'Právo na odstúpenie: Odhláste sa z „predaja" osobných údajov (môže sa vzťahovať na zdieľanie s reklamnými partnermi).',
        "Právo na nediskrimináciu: Nebudeme diskriminovať pri uplatňovaní vašich práv.",
      ],
    },
    {
      heading: "Zhromaždené kategórie CCPA",
      paragraphs: [
        "Kategórie: Identifikátory (IP adresa, ID zariadenia), Internetová aktivita (prehliadanie, interakcie s reklamami), Geolokácia (približná), Inferencie (záujmy z prehliadania).",
        "Na uplatnenie práv alebo odhlásenie: email@anqr.link alebo upraviť nastavenia súborov cookie.",
      ],
    },
    {
      heading: "Medzinárodné prevody",
      paragraphs: [
        "Vaše informácie môžu byť prenesené do krajín s rôznymi zákonmi na ochranu údajov, vrátane Spojených štátov amerických. Používame vhodné záruky, ako sú štandardné zmluvné doložky.",
      ],
    },
    {
      heading: "Súkromie detí",
      paragraphs: [
        "ANQR nie je zameraný na deti mladšie ako 13 rokov (alebo 16 rokov v EHP). Vedome nezhromažďujeme údaje od detí. Kontaktujte email@anqr.link, ak si myslíte, že dieťa poskytlo informácie.",
      ],
    },
    {
      heading: "Bezpečnosť",
      paragraphs: [
        "Na ochranu údajov používame vhodné technické a organizačné opatrenia vrátane šifrovania HTTPS. Žiadny internetový prenos však nie je 100% bezpečný.",
      ],
    },
    {
      heading: "Nesledovať",
      paragraphs: [
        "Rešpektujeme signály prehliadača Do Not Track tam, kde je to možné, hoci reklamní partneri nemusia na DNT reagovať.",
      ],
    },
    {
      heading: "Zmeny v tejto politike",
      paragraphs: [
        'Tieto zásady môžeme pravidelne aktualizovať. Dátum „Posledná aktualizácia" označuje najnovšiu revíziu. Významné zmeny môžu byť oznámené prostredníctvom bannera na stránke.',
      ],
    },
    {
      heading: "Kontaktujte nás",
      paragraphs: [
        "V prípade otázok týkajúcich sa ochrany osobných údajov alebo uplatnenia vašich práv: email@anqr.link alebo použite našu stránku Kontakt. Na žiadosti o ochranu osobných údajov odpovedáme do 30 dní.",
      ],
    },
    {
      heading: "Úplné zásady ochrany osobných údajov",
      paragraphs: [
        "Táto stránka poskytuje súhrn našich postupov ochrany osobných údajov. Úplné, právne záväzné zásady ochrany osobných údajov s úplnými podrobnosťami o spracovaní údajov, vašich právach a našich povinnostiach podľa GDPR, CCPA a iných zákonov o ochrane osobných údajov nájdete v našich úplných zásadách, ktorých hostiteľom je iubenda.",
      ],
      links: [
        {
          href: "https://www.iubenda.com/privacy-policy/70266922",
          label: "Zobraziť úplné zásady ochrany osobných údajov na iubenda",
          type: "external",
        },
      ],
    },
  ],
};

export default privacy;
