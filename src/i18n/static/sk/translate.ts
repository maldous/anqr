import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const translate: PageDefinition = {
  title: 'Pomôžte preložiť ANQR',
  description: 'Pripojte sa k našej komunite prekladateľov, ktorí pomáhajú sprístupniť ANQR používateľom na celom svete. Nevyžadujú sa žiadne skúsenosti s kódovaním – prispievajte priamo z vášho prehliadača.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Otvorte úložisko prekladov', type: 'external' },
    { href: '/?lang=${lang}', label: 'Otvorte Generátor', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'O ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontaktujte nás', type: 'external' },
  ],
  sections: [
    {
      heading: 'Prečo prispievať?',
      paragraphs: ['ANQR používajú ľudia na celom svete na vytváranie QR kódov pre firmy, udalosti, platby a osobné projekty. Prispievaním prekladov pomáhate sprístupniť tento výkonný nástroj používateľom, ktorí uprednostňujú svoj rodný jazyk.', 'Každý príspevok k prekladu – či už oprava preklepu alebo preklad celého jazyka – predstavuje skutočný rozdiel pre používateľov vo vašej komunite.'],
    },
    {
      heading: 'Čo môžete preložiť?',
      paragraphs: ['ANQR má dva typy preložiteľného obsahu:'],
      bullets: ['Reťazce používateľského rozhrania: Označenia tlačidiel, položky ponuky, popisky a text rozhrania, ktorý sa zobrazuje v celej aplikácii.', 'Statický obsah: Stránky s dokumentáciou vrátane príručiek, príkladov, zásad ochrany osobných údajov a článkov pomocníka.', 'Oba typy sú uložené ako jednoduché textové súbory, ktoré môžete upravovať priamo vo svojom prehliadači – nie je potrebný žiadny špeciálny softvér.', 'Preklady sa pred zlúčením kontrolujú, aby sa zabezpečila kvalita a konzistentnosť.'],
    },
    {
      heading: 'Ako prispieť',
      paragraphs: ['Prispievanie je jednoduché a nevyžaduje žiadne znalosti Git:'],
      bullets: ['Navštívte naše verejné úložisko prekladov na GitHub.', 'Nájdite svoj jazykový súbor (alebo vytvorte nový, ak váš jazyk ešte nie je podporovaný).', 'Kliknutím na ikonu ceruzky upravíte priamo v prehliadači.', 'Vykonajte zmeny a kliknite na „Navrhnúť zmeny" – GitHub automaticky vytvorí požiadavku na stiahnutie.', 'Váš príspevok bude skontrolovaný a zlúčený, zvyčajne v priebehu niekoľkých dní.'],
    },
    {
      heading: 'Pokyny pre preklad',
      paragraphs: ['Pri preklade ponechajte zástupné symboly ako {name}, {count} a {{variable}} nezmenené – pri spustení sa nahradia dynamickými hodnotami. Zachovajte tiež akúkoľvek syntax podobnú HTML, napríklad odkazy, vo formáte [[/path|Label]].', 'Ak si prekladom nie ste istí, je lepšie nechať ho v angličtine, ako uvádzať nesprávny preklad. Môžete tiež otvoriť problém na GitHub a požiadať o vysvetlenie.'],
    },
    {
      heading: 'Aktuálne podporované jazyky',
      paragraphs: ['ANQR v súčasnosti podporuje viac ako 40 jazykov vrátane:'],
      bullets: ['Hlavné svetové jazyky: angličtina, čínština, španielčina, arabčina, hindčina, portugalčina, japončina, kórejčina, francúzština, nemčina, ruština a ďalšie.', 'Jazyky juhovýchodnej Ázie: thajčina, vietnamčina, indonézčina, filipínčina, malajčina, khmérčina, laočina, barmčina.', 'Juhoázijské jazyky: hindčina, tamilčina, telugčina, bengálčina, maráthčina, gudžarátčina, kannadčina, malajálamčina, pandžábčina, nepálčina.'],
    },
    {
      heading: 'Uznanie',
      paragraphs: ['Všetci prispievatelia sú uvedení v našom úložisku. Vaša práca pomáha tisíckam používateľov pristupovať k ANQR v ich preferovanom jazyku.', 'Ďakujeme všetkým našim prispievateľom do prekladov za pomoc pri sprístupňovaní ANQR na celom svete!'],
    },
    {
      heading: 'otázky?',
      paragraphs: ['Ak máte otázky týkajúce sa prispievania prekladmi, otvorte problém v našom úložisku GitHub alebo nás kontaktujte e-mailom. Radi vám pomôžeme začať.'],
    },
  ],
};

export default translate;
