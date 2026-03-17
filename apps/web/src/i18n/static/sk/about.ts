import type { PageDefinition } from "../types";

export const about: PageDefinition = {
  title: "O ANQR",
  description:
    "ANQR je bezplatný generátor QR kódov s prístupom na prvom mieste klienta – generujte QR kódy lokálne alebo použite naše API na vkladanie.",
  lastUpdated: "1. februára 2026",
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Otvorte generátor", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Prechádzať Učiť sa články", type: "learn" },
  ],
  relatedLinks: [
    { href: "/privacy?lang=${lang}", label: "Zásady ochrany osobných údajov", type: "external" },
    { href: "/terms?lang=${lang}", label: "Zmluvné podmienky", type: "external" },
  ],
  sections: [
    {
      heading: "čo je ANQR?",
      paragraphs: [
        'ANQR (vyslovuje sa „kotva") je bezplatný generátor QR kódov, ktorý vytvára skenovateľné kódy pre adresy URL, text, poverenia Wi-Fi, karty kontaktov, udalosti v kalendári a ďalšie.',
        "Je vytvorený pre jednotlivcov, malé podniky, obchodníkov a vývojárov, ktorí chcú výkonné nástroje QR bez registrácie. Klientsky prvý dizajn znamená, že QR kódy sa predvolene generujú lokálne vo vašom prehliadači, s voliteľným serverovým API pre profesionálne vkladanie a integráciu.",
      ],
    },
    {
      heading: "Kľúčové vlastnosti",
      bullets: [
        "Okamžite generujte QR kódy vo svojom prehliadači – nie je potrebný žiadny účet.",
        "Prispôsobte farby, štýly modulov, vzory vyhľadávača a pridajte prekryvné obrázky.",
        "Exportujte vo viacerých formátoch: PNG, SVG, WebP a animovaný GIF.",
        "Pokročilé ovládacie prvky pre úroveň opravy chýb, verziu QR, režim kódovania a výber masky.",
        "Bezpečnostné pokyny na skenovanie a živý náhľad pomáhajú udržiavať kódy čitateľné v tlači a na obrazovkách.",
        "Server-side API pre profesionálne vkladanie s plnou podporou parametrov.",
        "Po načítaní funguje offline – ide o statickú webovú aplikáciu, ktorú môžete spustiť kdekoľvek.",
      ],
    },
    {
      heading: "Ako funguje ANQR",
      paragraphs: [
        "ANQR beží vo vašom prehliadači a zakóduje váš vstup do štandardnej matice QR s opravou chýb Reed-Solomon a potom ho vykreslí do formátu, ktorý si vyberiete.",
        "V predvolenom nastavení prebieha generovanie lokálne vo vašom prehliadači. Na profesionálne použitie môžete tiež použiť API na strane servera na generovanie QR kódov prostredníctvom parametrov URL – ideálne na vkladanie do webových stránok, e-mailov alebo automatizovaných pracovných postupov.",
        "Keď pridáte prekrytia alebo animácie, ANQR vyváži štýl so spoľahlivosťou skenovania, takže výsledok zostane skenovateľný.",
        "ANQR sa zameriava na statické kódy (údaje sú vo vnútri QR). Ak potrebujete dynamický kód (upraviteľný cieľ), môžete zakódovať vlastnú adresu URL presmerovania alebo krátky odkaz.",
      ],
    },
    {
      heading: "Kto prevádzkuje ANQR?",
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: "Reklama a ako zostaneme zadarmo",
      paragraphs: [
        "Použitie ANQR je bezplatné a je podporované reklamou. Reklamy môžeme zobrazovať prostredníctvom služby Google AdSense a/alebo iných reklamných partnerov.",
        "Poskytovatelia reklamy môžu používať súbory cookie alebo podobné technológie na prispôsobenie reklám na základe vašich záujmov a aktivity prehliadania. Predvoľby reklám môžete spravovať v nastaveniach svojho zariadenia a prostredníctvom nastavení reklám Google a ďalšie informácie nájdete v našich pravidlách ochrany osobných údajov.",
        "Obsah, ktorý zakódujete do QR kódov, nepredávame. Reklamy pomáhajú pokryť náklady na prevádzku a zlepšovanie projektu.",
      ],
    },
    {
      heading: "Otvorené štandardy",
      paragraphs: [
        "ANQR generuje QR kódy na základe normy ISO/IEC 18004 a zameriava sa na širokú kompatibilitu medzi skenermi, fotoaparátmi a tlačovými pracovnými postupmi.",
      ],
    },
    {
      heading: "Oznámenie o ochrannej známke",
      paragraphs: [
        "QR Code® je registrovaná ochranná známka spoločnosti DENSO WAVE INCORPORATED. ANQR nie je pridružená, podporovaná ani sponzorovaná spoločnosťou DENSO WAVE INCORPORATED.",
      ],
    },
    {
      heading: "Spätná väzba a príspevky",
      paragraphs: [
        "Vítame spätnú väzbu, hlásenia chýb a návrhy funkcií. Kontaktujte nás prostredníctvom e-mailu alebo kontaktnej stránky – čítame každú správu, aj keď doba odozvy sa môže líšiť.",
      ],
    },
  ],
};

export default about;
