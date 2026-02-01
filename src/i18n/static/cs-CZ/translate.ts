import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Nápověda Přeložit ANQR',
  description: 'Připojte se k naší komunitě překladatelů, kteří pomáhají zpřístupnit ANQR uživatelům po celém světě. Nevyžaduje se žádná zkušenost s kódováním - přispívejte přímo ze svého prohlížeče.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Otevřít úložiště překladu', type: 'external' },
    { href: '/?lang=${lang}', label: 'Otevřít generátor', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'O ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontaktujte nás', type: 'external' },
  ],
  sections: [
    {
      heading: 'Proč přispět?',
      paragraphs: ['ANQR používají lidé po celém světě k vytváření QR kódů pro podniky, akce, platby a osobní projekty. Tím, že přispívají překlady, pomůžete, aby tento mocný nástroj přístupné uživatelům, kteří dávají přednost jejich rodný jazyk.', 'Každý příspěvek na překlad - ať už fixaci na stroji nebo překlad celého jazyka - dělá skutečný rozdíl pro uživatele ve vaší komunitě.'],
    },
    {
      heading: 'Co můžete přeložit?',
      paragraphs: ['ANQR má dva typy překládatelného obsahu:'],
      bullets: ['UI Strings: Tlačítka štítky, položky menu, tipy nástrojů a text rozhraní, který se objeví v celé aplikaci.', 'Statický obsah: Dokumentační stránky včetně průvodců, příkladů, zásad ochrany osobních údajů a článků.', 'Oba typy jsou ukládány jako jednoduché textové soubory, které můžete editovat přímo ve svém prohlížeči - není potřeba žádný speciální software.', 'Překlady se před sloučením přezkoumávají, aby byla zajištěna kvalita a konzistentnost.'],
    },
    {
      heading: 'Jak přispět',
      paragraphs: ['Přispívání je snadné a nevyžaduje žádné znalosti Git:'],
      bullets: ['Navštivte náš veřejný překlad úložiště na GitHub.', 'Najděte svůj jazykový soubor (nebo vytvořte nový, pokud váš jazyk ještě není podporován).', 'Kliknutím na ikonu tužky můžete editovat přímo ve svém prohlížeči.', 'Proveďte změny a klikněte na "Změny návrhu" - GitHub automaticky vytvoří požadavek na tahání.', 'Váš příspěvek bude přezkoumán a sloučen, obvykle během několika dnů.'],
    },
    {
      heading: 'Pokyny pro překlad',
      paragraphs: ['Při překladu, prosím, udržujte umístění jako _ _ ANQR _ PH _ 0 _ _, _ _ ANQR _ PH _ 1 _ _, a _ _ ANQR _ PH _ 2 _ _ beze změny - tyto jsou nahrazeny dynamickými hodnotami v runtime. Uchovejte také všechny HTML- like syntaxe, jako jsou odkazy ve formátu [[/ path CLAS124; Label]].', 'Pokud si nejste jisti o překladu, je lepší nechat v angličtině, než poskytnout nesprávný překlad. Můžete také otevřít otázku GitHub požádat o vysvětlení.'],
    },
    {
      heading: 'V současné době podporované jazyky',
      paragraphs: ['ANQR v současné době podporuje více než 40 jazyků, včetně:'],
      bullets: ['Hlavní světové jazyky: angličtina, čínština, španělština, arabština, hindština, portugalština, japonština, korejština, francouzština, němčina, ruština a další.', 'Jazyky jihovýchodní Asie: thajské, vietnamské, indonéské, filipínské, malajské, khmer, laoské, barmské.', 'Jihoasijské jazyky: Hindština, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Uznání',
      paragraphs: ['Všichni přispěvatelé jsou připsáni do našeho úložiště. Vaše práce pomáhá tisícům uživatelů přístup k ANQR v jejich preferovaném jazyce.', 'Děkujeme všem našim překladatelům za pomoc, aby ANQR přístupné po celém světě!'],
    },
    {
      heading: 'Otázky?',
      paragraphs: ['Máte-li dotazy týkající se přispívání překlady, otevřete prosím problém v našem úložišti GitHub nebo nás kontaktujte e-mailem. Rádi vám pomůžeme začít.'],
    },
  ],
};

export default translate;
