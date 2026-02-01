import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Privaatheidsbeleid',
  description:
    'Inligting wat ANQR insamel, hoe dit gebruik word en jou regte onder toepaslike privaatheidswette.',
  lastUpdated: '1 Februarie 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Diensbepalings', type: 'external' }],
  sections: [
    {
      heading: 'Opsomming',
      paragraphs: [
        "ANQR is 'n QR-kode-opwekker met 'n kliënt-eerste benadering. Ons vereis nie van jou om 'n rekening te skep nie. QR-kodes word by verstek plaaslik in jou blaaier gegenereer – ons het nie toegang tot die inhoud wat jy enkodeer nie.",
        "Vir professionele gebruik bied ANQR 'n bedienerkant API wat QR-kodes genereer vanaf URL-parameters. Wanneer die API gebruik word, word jou QR-inhoud op ons bedieners verwerk om die beeld weer te gee, maar word nie gestoor of aangeteken nie.",
        'Ons gebruik Google AdSense vir advertensies en kan ontledingsdienste gebruik. Hierdie dienste versamel inligting deur middel van koekies en soortgelyke tegnologieë. Hierdie beleid verduidelik watter data ingesamel word, hoe dit gebruik word en jou regte.',
      ],
    },
    {
      heading: 'Inligting wat ons insamel',
      bullets: [
        'Inligting wat jy verskaf: As jy ons kontak via e-pos of ons kontakvorm, versamel ons jou naam, e-posadres en boodskapinhoud.',
        'Outomaties ingesamel inligting: Ons gasheerverskaffer (Netlify), advertensievennote en ontledingsdienste kan insamel: IP-adres, blaaiertipe en weergawe, bedryfstelsel, toesteltipe, verwysende URL, bladsye wat besoek is, tyd op werf en benaderde geografiese ligging.',
        'Derdepartykoekies: Ons advertensievennote (Google AdSense) gebruik webkoekies en soortgelyke tegnologieë om advertensies te bedien en te meet. ANQR self stel geen eerstepartykoekies nie.',
      ],
    },
    {
      heading: 'Koekies en derdeparty-tegnologieë',
      paragraphs: [
        'ANQR stel geen eerstepartykoekies nie. Jou voorkeure (soos donker modus) word plaaslik op jou toestel gestoor, wat nie na enige bediener oorgedra word nie.',
        'Ons advertensievennote (Google AdSense) en gasheerverskaffer kan egter webkoekies en soortgelyke opsporingstegnologieë gebruik:',
      ],
      bullets: [
        'Advertensiekoekies (derdeparty): Stel deur Google AdSense en advertensievennote om relevante advertensies te bedien, advertensieprestasie te meet en gebruikersbelangstellings te verstaan. Hierdie webkoekies kan jou aktiwiteit op verskillende webwerwe naspoor.',
        'Ontledingskoekies (derdeparty): Kan deur ons gasheerverskaffer of ontledingsdienste gebruik word om anonieme gebruiksdata in te samel.',
      ],
    },
    {
      heading: 'Google AdSense en advertensies',
      paragraphs: [
        'Ons vertoon advertensies deur Google AdSense. Google en sy vennote gebruik webkoekies om advertensies op hierdie werf en ander webwerwe op grond van jou blaaigeskiedenis te bedien (belangstellinggebaseerde advertensies).',
        'Leer hoe Google jou inligting gebruik: https://policies.google.com/technologies/partner-sites',
        'Bestuur advertensiepersonalisering: https://adssettings.google.com',
        'Onttrek via Network Advertising Initiative: https://optout.networkadvertising.org',
        'Onttrek via Digital Advertising Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Hoe ons inligting gebruik',
      bullets: [
        'Om op jou navrae te reageer en ondersteuning te bied.',
        'Om relevante advertensies deur ons advertensievennote te vertoon.',
        'Om werfgebruik te ontleed en ons dienste te verbeter.',
        'Om bedrog, misbruik en sekuriteitkwessies op te spoor, te voorkom en aan te spreek.',
        'Om te voldoen aan wetlike verpligtinge.',
      ],
    },
    {
      heading: 'Derdepartydienste',
      bullets: [
        'Google AdSense: Ontvang data om advertensies te bedien en te meet.',
        'Ontledingsverskaffers: Ontvang anonieme gebruiksdata.',
        'Netlify (gasheer): Verwerk versoeke en kan IP-adresse aanteken.',
        'Ons verkoop nie jou persoonlike inligting nie. Die deel van data met advertensievennote kan egter as \'n "verkope" onder CCPA beskou word (sien hieronder).',
      ],
    },
    {
      heading: 'Databewaring',
      bullets: [
        'Kontakvoorleggings: Tot 2 jaar.',
        'Bedienerlogboeke: Tot 30 dae (gasheerverskaffer).',
        'Ontledingsdata: Tot 26 maande (geanonimiseer).',
        'Advertensiekoekies: Tipies 13 maande (wissel volgens vennoot).',
      ],
    },
    {
      heading: 'Jou regte onder GDPR (EEA-gebruikers)',
      paragraphs: [
        'As jy in die Europese Ekonomiese Ruimte is, het jy die volgende regte onder die Algemene Databeskermingsregulasie:',
      ],
      bullets: [
        "Reg van toegang: Versoek 'n afskrif van persoonlike data wat ons oor jou hou.",
        'Reg op regstelling: Versoek regstelling van onakkurate data.',
        'Reg op uitvee: Versoek om jou data te skrap ("reg om vergeet te word").',
        'Reg om verwerking te beperk: Versoek beperkings op hoe ons jou data gebruik.',
        "Reg op data-oordraagbaarheid: Versoek jou data in 'n draagbare formaat.",
        'Reg op beswaar: Beswaar teen verwerking, insluitend vir direkte bemarking.',
        'Reg om toestemming terug te trek: Onttrek toestemming te eniger tyd waar verwerking toestemmingsgebaseer is.',
        "Reg om 'n klag in te dien: Dien 'n klag by jou databeskermingsowerheid in.",
      ],
    },
    {
      heading: 'GDPR-regsgrondslag',
      paragraphs: [
        'Ons verwerk data op hierdie basisse: (a) Toestemming - vir gepersonaliseerde advertensies (bestuur deur ons advertensievennote); (b) Wettige belange - vir ontleding, sekuriteit en verbetering; (c) Kontrak - om op navrae te reageer.',
        'Kontak email@anqr.link om jou regte uit te oefen. Ons reageer binne 30 dae.',
      ],
    },
    {
      heading: 'Jou regte onder CCPA (Kalifornië gebruikers)',
      bullets: [
        'Reg om te weet: Versoek inligting oor data wat ingesamel is, bronne, doeleindes en derde partye.',
        'Reg om te skrap: Versoek om jou persoonlike inligting te skrap.',
        'Reg om te onttrek: Onttrek uit die "verkoop" van persoonlike inligting (deel met advertensievennote kan kwalifiseer).',
        'Reg op nie-diskriminasie: Ons sal nie diskrimineer vir die uitoefening van jou regte nie.',
      ],
    },
    {
      heading: 'CCPA-kategorieë ingesamel',
      paragraphs: [
        'Kategorieë: Identifiseerders (IP-adres, toestel-ID), internetaktiwiteit (blaai, advertensie-interaksies), geoligging (benadering), afleidings (belangstellings van blaai).',
        'Om regte uit te oefen of te onttrek: email@anqr.link of pas koekie-instellings aan.',
      ],
    },
    {
      heading: 'Internasionale oordragte',
      paragraphs: [
        'Jou inligting kan oorgedra word na lande met verskillende databeskermingswette, insluitend die Verenigde State. Ons gebruik toepaslike voorsorgmaatreëls soos standaard kontraktuele klousules.',
      ],
    },
    {
      heading: 'Kinders se privaatheid',
      paragraphs: [
        "ANQR is nie gerig op kinders onder 13 (of 16 in die EER nie). Ons samel nie bewustelik data van kinders in nie. Kontak email@anqr.link as jy glo dat 'n kind inligting verskaf het.",
      ],
    },
    {
      heading: 'Sekuriteit',
      paragraphs: [
        'Ons gebruik toepaslike tegniese en organisatoriese maatreëls om data te beskerm, insluitend HTTPS-enkripsie. Geen internettransmissie is egter 100% veilig nie.',
      ],
    },
    {
      heading: 'Moenie dop nie',
      paragraphs: [
        'Ons eerbiedig Do Not Track-blaaierseine waar moontlik, alhoewel advertensievennote dalk nie op DNT reageer nie.',
      ],
    },
    {
      heading: 'Veranderinge aan hierdie beleid',
      paragraphs: [
        'Ons kan hierdie beleid periodiek opdateer. Die "Laas opgedateer" datum dui die mees onlangse hersiening aan. Beduidende veranderinge kan via \'n webwerfbanier gekommunikeer word.',
      ],
    },
    {
      heading: 'Kontak ons',
      paragraphs: [
        'Vir privaatheidsvrae of om jou regte uit te oefen: email@anqr.link of gebruik ons Kontakbladsy. Ons reageer binne 30 dae op privaatheidsversoeke.',
      ],
    },
    {
      heading: 'Volledige privaatheidsbeleid',
      paragraphs: [
        "Hierdie bladsy bied 'n opsomming van ons privaatheidspraktyke. Vir die volledige, wetlik bindende privaatheidsbeleid met volledige besonderhede oor dataverwerking, jou regte en ons verpligtinge onder GDPR, CCPA en ander privaatheidswette, sien asseblief ons volledige beleid wat deur iubenda aangebied word.",
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Sien volledige privaatheidsbeleid op iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
