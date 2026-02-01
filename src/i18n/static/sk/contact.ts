import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const contact: PageDefinition = {
  title: 'Kontaktujte nás',
  description: 'Vítame spätnú väzbu, hlásenia chýb, požiadavky na funkcie a všeobecné otázky.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Ako sa k nám dostať',
      paragraphs: ['Ponúkame niekoľko spôsobov, ako nás kontaktovať v závislosti od vašich potrieb. Čítame každú správu, aj keď doba odozvy sa môže líšiť v závislosti od objemu a typu dopytu.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Pre všetky otázky: email@anqr.link', 'Toto je najspoľahlivejší spôsob, ako sa k nám dostať, a odporúčame ho na podrobné otázky, obchodné otázky alebo akékoľvek iné otázky.'],
    },
    {
      heading: 'Typy dopytov',
      bullets: ['Všeobecné otázky: Otázky o tom, ako používať ANQR, vysvetlenia funkcií alebo všeobecnú spätnú väzbu.', 'Hlásenia chýb: Uveďte svoj prehliadač, operačný systém, kroky na reprodukciu a všetky chybové hlásenia, ktoré sa vám zobrazia.', 'Požiadavky na funkcie: Návrhy na nové funkcie alebo vylepšenia. Zvažujeme všetky požiadavky, hoci nemôžeme sľúbiť implementáciu.', 'Obchodné otázky: Partnerské príležitosti, otázky týkajúce sa licencií alebo otázky komerčného využitia.', 'Žiadosti o ochranu osobných údajov: Žiadosti o uplatnenie vašich práv na ochranu osobných údajov podľa GDPR, CCPA alebo iných zákonov o ochrane osobných údajov (pozri Zásady ochrany osobných údajov).', 'DMCA/Autorské práva: Požiadavky na oznámenie o zastavení šírenia nájdete v sekcii DMCA nižšie.'],
    },
    {
      heading: 'Časy odozvy',
      paragraphs: ['Naším cieľom je odpovedať na otázky do 5-7 pracovných dní. Žiadosti týkajúce sa ochrany osobných údajov budú riešené do 30 dní, ako to vyžaduje zákon.', 'Počas rušných období môžu byť časy odozvy dlhšie. V prípade naliehavých záležitostí uveďte v riadku predmetu „URGENT".'],
    },
    {
      heading: 'Skôr ako nás budete kontaktovať',
      paragraphs: ['Odpovede na bežné otázky o používaní funkcií ANQR nájdete na našej stránke Dokumentácia. Nájdete tu mnoho otázok o generovaní QR kódu, možnostiach štýlu a exportu.'],
    },
    {
      heading: 'Oznámenia o autorských právach DMCA',
      paragraphs: ['Ak sa domnievate, že obsah dostupný na ANQR porušuje vaše autorské práva, môžete odoslať oznámenie o zastavení šírenia podľa zákona DMCA (Digital Millennium Copyright Act). Aby bolo oznámenie platné, musí obsahovať:'],
      bullets: ['Fyzický alebo elektronický podpis vlastníka autorských práv alebo oprávneného zástupcu.', 'Identifikácia diela chráneného autorskými právami, ktoré údajne bolo porušené.', 'Identifikácia materiálu, ktorý údajne porušuje autorské práva, s informáciami postačujúcimi na jeho nájdenie.', 'Vaše kontaktné údaje (adresa, telefónne číslo a e-mailová adresa).', 'Vyhlásenie, že v dobrej viere veríte, že použitie materiálu nie je povolené vlastníkom autorských práv.', 'Vyhlásenie pod hrozbou trestu za krivú prísahu, že informácie vo vašom oznámení sú presné a že ste vlastníkom autorských práv alebo máte oprávnenie konať v ich mene.'],
    },
    {
      heading: 'Kontakt DMCA',
      paragraphs: ['Oznámenia DMCA posielajte na: email@anqr.link', 'Do predmetu uveďte „Oznámenie DMCA". Na platné oznámenia budeme reagovať v súlade s platnými právnymi predpismi. Všimnite si, že ANQR generuje QR kódy lokálne na zariadeniach používateľov a nehostuje obsah vytvorený používateľmi.'],
    },
    {
      heading: 'komunita Reddit',
      paragraphs: ['Pripojte sa k našej komunite Reddit na r/ANQR a zdieľajte svoje QR výtvory, pýtajte sa, získajte pomoc a spojte sa s ostatnými používateľmi ANQR.'],
    },
  ],
};

export default contact;
