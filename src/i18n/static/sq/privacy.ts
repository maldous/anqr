import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Politika e privatësisë',
  description:
    'Informacioni që mbledh ANQR, mënyra se si përdoret dhe të drejtat tuaja sipas ligjeve të zbatueshme të privatësisë.',
  lastUpdated: '1 shkurt 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Kushtet e Shërbimit', type: 'external' }],
  sections: [
    {
      heading: 'Përmbledhje',
      paragraphs: [
        'ANQR është një gjenerues i kodit QR me një qasje të parë klienti. Ne nuk kërkojmë që ju të krijoni një llogari. Si parazgjedhje, kodet QR krijohen lokalisht në shfletuesin tuaj - ne nuk kemi qasje në përmbajtjen që kodoni.',
        'Për përdorim profesional, ANQR ofron një API nga ana e serverit që gjeneron kode QR nga parametrat e URL-së. Kur përdorni API-në, përmbajtja juaj QR përpunohet në serverët tanë për të dhënë imazhin, por nuk ruhet ose regjistrohet.',
        'Ne përdorim Google AdSense për reklama dhe mund të përdorim shërbime analitike. Këto shërbime mbledhin informacion përmes cookies dhe teknologjive të ngjashme. Kjo politikë shpjegon se cilat të dhëna mblidhen, si përdoren dhe të drejtat tuaja.',
      ],
    },
    {
      heading: 'Informacioni që mbledhim',
      bullets: [
        'Informacioni që jepni: Nëse na kontaktoni përmes emailit ose formularit tonë të kontaktit, ne mbledhim emrin tuaj, adresën e emailit dhe përmbajtjen e mesazhit.',
        'Informacioni i mbledhur automatikisht: Ofruesi ynë i pritjes (Netlify), partnerët e reklamave dhe shërbimet analitike mund të mbledhin: adresën IP, llojin dhe versionin e shfletuesit, sistemin operativ, llojin e pajisjes, URL-në referuese, faqet e vizituara, kohën në vend dhe vendndodhjen e përafërt gjeografike.',
        'Kukit e palëve të treta: Partnerët tanë reklamues (Google AdSense) përdorin kuki dhe teknologji të ngjashme për të shërbyer dhe matur reklamat. Vetë ANQR nuk vendos asnjë kuki të palës së parë.',
      ],
    },
    {
      heading: 'Cookies dhe teknologjitë e palëve të treta',
      paragraphs: [
        'ANQR nuk vendos asnjë kuki të palës së parë. Preferencat tuaja (siç është modaliteti i errët) ruhen lokalisht në pajisjen tuaj, e cila nuk transmetohet në asnjë server.',
        'Megjithatë, partnerët tanë reklamues (Google AdSense) dhe ofruesi i pritjes mund të përdorin cookie dhe teknologji të ngjashme gjurmimi:',
      ],
      bullets: [
        'Kukit e reklamave (të palëve të treta): Të vendosura nga Google AdSense dhe partnerët e reklamave për të shërbyer reklama përkatëse, për të matur performancën e reklamave dhe për të kuptuar interesat e përdoruesve. Këto cookie mund të gjurmojnë aktivitetin tuaj nëpër uebsajte të ndryshme.',
        'Kukit e analitikës (të palëve të treta): Mund të përdoren nga ofruesi ynë i pritjes ose shërbimet analitike për të mbledhur të dhëna anonime përdorimi.',
      ],
    },
    {
      heading: 'Google AdSense dhe reklamat',
      paragraphs: [
        'Ne shfaqim reklama përmes Google AdSense. Google dhe partnerët e tij përdorin kuki për të shërbyer reklama bazuar në historikun tuaj të shfletimit në këtë sajt dhe në faqet e tjera të internetit (reklamim i bazuar në interes).',
        'Mësoni se si Google përdor informacionin tuaj: https://policies.google.com/technologies/partner-sites',
        'Menaxho personalizimin e reklamave: https://adssettings.google.com',
        'Tërhiqe përmes Iniciativës së Reklamimit të Rrjetit: https://optout.networkadvertising.org',
        'Hiqni dorë nga Aleanca e Reklamimit Dixhital: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Si e përdorim informacionin',
      bullets: [
        "Për t'iu përgjigjur pyetjeve tuaja dhe për të ofruar mbështetje.",
        'Për të shfaqur reklama përkatëse përmes partnerëve tanë reklamues.',
        'Për të analizuar përdorimin e faqes dhe për të përmirësuar shërbimet tona.',
        'Për të zbuluar, parandaluar dhe trajtuar çështjet e mashtrimit, abuzimit dhe sigurisë.',
        'Për të përmbushur detyrimet ligjore.',
      ],
    },
    {
      heading: 'Shërbime të palëve të treta',
      bullets: [
        'Google AdSense: Merr të dhëna për të shërbyer dhe matur reklamat.',
        'Ofruesit e analitikës: Merrni të dhëna anonime përdorimi.',
        'Netlify (hosting): Përpunon kërkesat dhe mund të regjistrojë adresat IP.',
        'Ne nuk i shesim të dhënat tuaja personale. Megjithatë, ndarja e të dhënave me partnerët e reklamave mund të konsiderohet një "shitje" sipas CCPA (shih më poshtë).',
      ],
    },
    {
      heading: 'Ruajtja e të dhënave',
      bullets: [
        'Paraqitjet e kontaktit: Deri në 2 vjet.',
        'Regjistrimet e serverit: Deri në 30 ditë (ofruesi i pritjes).',
        'Të dhënat e analitikës: Deri në 26 muaj (të anonimizuara).',
        'Kuki reklamash: Zakonisht 13 muaj (ndryshon sipas partnerit).',
      ],
    },
    {
      heading: 'Të drejtat tuaja sipas GDPR (përdoruesit e ZEE)',
      paragraphs: [
        'Nëse jeni në Zonën Ekonomike Evropiane, ju keni të drejtat e mëposhtme sipas Rregullores së Përgjithshme të Mbrojtjes së të Dhënave:',
      ],
      bullets: [
        'E drejta e aksesit: Kërkoni një kopje të të dhënave personale që mbajmë për ju.',
        'E drejta për korrigjim: Kërkoni korrigjim të të dhënave të pasakta.',
        'E drejta për t\'u fshirë: Kërkoni fshirjen e të dhënave tuaja ("e drejta për t\'u harruar").',
        'E drejta për të kufizuar përpunimin: Kërkoni kufizime se si ne i përdorim të dhënat tuaja.',
        'E drejta për transportueshmëri të të dhënave: Kërkoni të dhënat tuaja në një format portativ.',
        'E drejta e kundërshtimit: Objekt për përpunim, duke përfshirë edhe marketingun e drejtpërdrejtë.',
        'E drejta për të tërhequr pëlqimin: Tërhiqni pëlqimin në çdo kohë kur përpunimi është i bazuar në pëlqimin.',
        'E drejta për të paraqitur një ankesë: Paraqisni një ankesë tek autoriteti juaj për mbrojtjen e të dhënave.',
      ],
    },
    {
      heading: 'Baza ligjore e GDPR',
      paragraphs: [
        "Ne i përpunojmë të dhënat mbi këto baza: (a) Pëlqimi - për reklama të personalizuara (të menaxhuara nga partnerët tanë reklamues); (b) Interesat legjitime - për analitikë, siguri dhe përmirësim; (c) Kontrata - për t'iu përgjigjur pyetjeve.",
        'Për të ushtruar të drejtat tuaja, kontaktoni email@anqr.link. Ne përgjigjemi brenda 30 ditëve.',
      ],
    },
    {
      heading: 'Të drejtat tuaja sipas CCPA (përdoruesit e Kalifornisë)',
      bullets: [
        'E drejta për të ditur: Kërkoni informacion për të dhënat e mbledhura, burimet, qëllimet dhe palët e treta.',
        'E drejta për të fshirë: Kërkoni fshirjen e të dhënave tuaja personale.',
        'E drejta për t\'u tërhequr: Hiqni dorë nga "shitja" e informacionit personal (ndarja me partnerët e reklamave mund të kualifikohet).',
        'E drejta për mosdiskriminim: Ne nuk do të diskriminojmë për ushtrimin e të drejtave tuaja.',
      ],
    },
    {
      heading: 'Kategoritë e CCPA të mbledhura',
      paragraphs: [
        'Kategoritë: Identifikuesit (adresa IP, ID-ja e pajisjes), Aktiviteti në internet (shfletimi, ndërveprimet me reklamat), Gjeolokacioni (i përafërt), Konkluzionet (interesat nga shfletimi).',
        'Për të ushtruar të drejtat ose për të hequr dorë: email@anqr.link ose rregulloni cilësimet e kukive.',
      ],
    },
    {
      heading: 'Transfertat ndërkombëtare',
      paragraphs: [
        'Informacioni juaj mund të transferohet në vende me ligje të ndryshme për mbrojtjen e të dhënave, duke përfshirë Shtetet e Bashkuara. Ne përdorim masat mbrojtëse të përshtatshme siç janë klauzola standarde kontraktuale.',
      ],
    },
    {
      heading: 'Privatësia e fëmijëve',
      paragraphs: [
        'ANQR nuk u drejtohet fëmijëve nën 13 vjeç (ose 16 vjeç në EEA). Ne nuk mbledhim me vetëdije të dhëna nga fëmijët. Kontaktoni email@anqr.link nëse besoni se një fëmijë ka dhënë informacion.',
      ],
    },
    {
      heading: 'Siguria',
      paragraphs: [
        'Ne përdorim masat e duhura teknike dhe organizative për të mbrojtur të dhënat, duke përfshirë enkriptimin HTTPS. Megjithatë, asnjë transmetim në internet nuk është 100% i sigurt.',
      ],
    },
    {
      heading: 'Mos gjurmoni',
      paragraphs: [
        'Ne respektojmë sinjalet e shfletuesit "Mos gjurmoni" aty ku është e mundur, megjithëse partnerët reklamues mund të mos i përgjigjen DNT.',
      ],
    },
    {
      heading: 'Ndryshimet në këtë politikë',
      paragraphs: [
        'Ne mund ta përditësojmë këtë politikë periodikisht. Data "Përditësimi i fundit" tregon rishikimin më të fundit. Ndryshimet e rëndësishme mund të komunikohen nëpërmjet një baneri të faqes.',
      ],
    },
    {
      heading: 'Na kontaktoni',
      paragraphs: [
        'Për pyetje rreth privatësisë ose për të ushtruar të drejtat tuaja: email@anqr.link ose përdorni faqen tonë të Kontaktit. Ne i përgjigjemi kërkesave për privatësi brenda 30 ditëve.',
      ],
    },
    {
      heading: 'Politika e plotë e privatësisë',
      paragraphs: [
        'Kjo faqe ofron një përmbledhje të praktikave tona të privatësisë. Për politikën e plotë, ligjërisht të detyrueshme të privatësisë me detaje të plota mbi përpunimin e të dhënave, të drejtat tuaja dhe detyrimet tona sipas GDPR, CCPA dhe ligjeve të tjera të privatësisë, ju lutemi shikoni politikën tonë të plotë të organizuar nga iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Shikoni politikën e plotë të privatësisë në iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
