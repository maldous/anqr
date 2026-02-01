import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'O ANQR',
  description: 'ANQR je svobodný QR generátor kódů s klient- první přístup - generovat QR kódy lokálně nebo používat naše API pro vkládání.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otevři generátor', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Procházení Učit články', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Ochrana osobních údajů', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Podmínky služby', type: 'external' },
  ],
  sections: [
    {
      heading: 'Co je ANQR?',
      paragraphs: ['ANQR (vyslovená "kotva") je svobodný QR kód generátor, který vytváří scannable kódy pro URL, text, Wi-Fi pověření, kontaktní karty, kalendář události a další.', 'Je postaven pro jednotlivce, malé podniky, obchodníci, a vývojáři, kteří chtějí výkonné QR nástroje bez přihlášení. Klient- první design znamená, že QR kódy jsou generovány lokálně ve vašem prohlížeči ve výchozím nastavení, s volitelným serverem API pro profesionální vkládání a integraci.'],
    },
    {
      heading: 'Klíčové funkce',
      bullets: ['Vygenerovat QR kódy okamžitě ve vašem prohlížeči - není potřeba žádný účet.', 'Vlastní barvy, styly modulu, nálezné vzory a přidejte překryvy obrazu.', 'Export ve více formátech: PNG, SVG, WebP a animovaný GIF.', 'Pokročilé ovládání pro úroveň opravy chyb, QR verze, kódování režimu a výběr masky.', 'Scan- bezpečnostní navádění a živý náhled, který pomůže udržet kódy čitelné v tisku i na obrazovkách.', 'Serverside API pro profesionální vkládání s plnou podporou parametru.', 'Po načtení funguje offline – je to statická webová aplikace, kterou můžete spustit kdekoli.'],
    },
    {
      heading: 'Jak ANQR funguje',
      paragraphs: ['ANQR běží ve vašem prohlížeči a zakóduje váš vstup do standardní QR matrice s Reed- Solomonovou korekcí chyb, pak ji převede do formátu, který si zvolíte.', 'Ve výchozím nastavení, generace se děje lokálně ve vašem prohlížeči. Pro profesionální použití můžete také použít server- side API k generování QR kódů pomocí URL parametrů - ideální pro vložení do webových stránek, e-mailů nebo automatizovaných pracovních toků.', 'Když přidáte překryvy nebo animace, ANQR vyvažuje styling se spolehlivostí skenování, takže výsledek zůstává škálovatelný.', 'ANQR se zaměřuje na statické kódy (data jsou uvnitř QR). Pokud potřebujete dynamický kód (editable destination), můžete enkódovat vlastní přesměrování URL nebo krátký odkaz.'],
    },
    {
      heading: 'Kdo provozuje ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklama a jak jsme zůstat zdarma',
      paragraphs: ['ANQR je volný a je podporován reklamou. Můžeme zobrazit reklamy prostřednictvím Google AdSense a / nebo jiných reklamních partnerů.', 'Poskytovatelé reklam mohou používat cookies nebo podobné technologie k personalizaci reklam na základě vašich zájmů a procházení aktivit. Můžete spravovat preference reklamy v nastavení zařízení a prostřednictvím nastavení reklamy Google, a dozvědět se více v našich Zásadách ochrany osobních údajů.', 'Neprodáváme obsah, který kódujete do QR kódů. Reklamy pomáhají pokrýt náklady na provoz a zlepšení projektu.'],
    },
    {
      heading: 'Otevřené normy',
      paragraphs: ['ANQR generuje kódy QR na základě normy ISO / IEC 18004 a zaměřuje se na širokou kompatibilitu napříč skenery, kamerami a tiskovými pracovními toky.'],
    },
    {
      heading: 'Oznámení o ochranné známce',
      paragraphs: ['QR Code ® je registrovaná ochranná známka DENSO WAVE INCORPORATED. ANQR není přidružen, schválen nebo sponzorován DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Zpětná vazba a příspěvky',
      paragraphs: ['Vítáme zpětnou vazbu, zprávy o chybách a návrhy. Kontaktujte nás e-mailem nebo na kontaktní stránce - přečteme každou zprávu, i když časy odezvy se mohou lišit.'],
    },
  ],
};

export default about;
