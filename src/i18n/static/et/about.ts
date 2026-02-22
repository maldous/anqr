import type { PageDefinition } from '../types';

export const about: PageDefinition = {
  title: 'ANQR-i kohta',
  description:
    'ANQR on tasuta QR-koodi generaator, mis on kliendikeskne – genereerige QR-koode kohapeal või kasutage manustamiseks meie API-d.',
  lastUpdated: '1. veebruar 2026',
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avage generaator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Sirvi Learn artikleid', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Privaatsuspoliitika', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Kasutustingimused', type: 'external' },
  ],
  sections: [
    {
      heading: 'Mis on ANQR?',
      paragraphs: [
        'ANQR (hääldatakse \\"ankur\\") on tasuta QR-koodi generaator, mis loob skannitavaid koode URL-ide, teksti, Wi-Fi mandaatide, kontaktikaartide, kalendrisündmuste ja muu jaoks.',
        'See on loodud üksikisikutele, väikeettevõtetele, turundajatele ja arendajatele, kes soovivad võimsaid QR-tööriistu ilma registreerumata. Kliendipõhine disain tähendab, et QR-koodid genereeritakse vaikimisi teie brauseris kohapeal koos valikulise serveri API-ga professionaalseks manustamiseks ja integreerimiseks.',
      ],
    },
    {
      heading: 'Põhiomadused',
      bullets: [
        'Genereerige QR-koode koheselt oma brauseris – kontot pole vaja.',
        'Kohandage värve, mooduli stiile, leidja mustreid ja lisage pildi ülekatteid.',
        'Eksportige mitmes vormingus: PNG, SVG, WebP ja animeeritud GIF.',
        'Täiustatud juhtnupud veaparandustaseme, QR-versiooni, kodeerimisrežiimi ja maski valimise jaoks.',
        'Skannimise ohutusjuhised ja reaalajas eelvaade, mis aitavad hoida koode trükituna ja ekraanil loetavana.',
        'Serveripoolne API professionaalseks manustamiseks koos täieliku parameetritoega.',
        'Pärast laadimist töötab võrguühenduseta – see on staatiline veebirakendus, mida saate kõikjal käivitada.',
      ],
    },
    {
      heading: 'Kuidas ANQR töötab',
      paragraphs: [
        'ANQR töötab teie brauseris ja kodeerib teie sisendi standardsesse QR-maatriksisse koos Reed-Solomoni veaparandusega, seejärel renderdab selle teie valitud vormingusse.',
        'Vaikimisi toimub loomine teie brauseris lokaalselt. Professionaalseks kasutamiseks saate kasutada ka serveripoolset API-d QR-koodide genereerimiseks URL-i parameetrite kaudu – see sobib suurepäraselt veebisaitidele, e-kirjadesse või automatiseeritud töövoogudesse manustamiseks.',
        'Kui lisate ülekatteid või animatsioone, tasakaalustab ANQR stiili ja skannimise usaldusväärsust, nii et tulemus jääb skannitavaks.',
        'ANQR keskendub staatilistele koodidele (andmed on QR-i sees). Kui vajate dünaamilist koodi (redigeeritav sihtkoht), saate kodeerida oma ümbersuunamise URL-i või lühilingi.',
      ],
    },
    {
      heading: 'Kes opereerib ANQR-i?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklaam ja kuidas me vabaks jääme',
      paragraphs: [
        "ANQR-i kasutamine on tasuta ja seda toetab reklaam. Võime näidata reklaame Google AdSense'i ja/või teiste reklaamipartnerite kaudu.",
        "Reklaamipakkujad võivad kasutada küpsiseid või sarnaseid tehnoloogiaid, et isikupärastada reklaame teie huvide ja sirvimistegevuse alusel. Saate hallata reklaamieelistusi oma seadme seadetes ja Google'i reklaamiseadetes ning lisateavet leiate meie privaatsuseeskirjadest.",
        'Me ei müü sisu, mille kodeerite QR-koodidesse. Reklaamid aitavad katta projekti käitamise ja täiustamise kulusid.',
      ],
    },
    {
      heading: 'Avatud standardid',
      paragraphs: [
        'ANQR genereerib ISO/IEC 18004 standardil põhinevaid QR-koode ning selle eesmärk on laialdane ühilduvus skannerite, kaamerate ja printimistöövoogude vahel.',
      ],
    },
    {
      heading: 'Kaubamärgi teade',
      paragraphs: [
        "QR Code® on ettevõtte DENSO WAVE INCORPORATED registreeritud kaubamärk. ANQR ei ole DENSO WAVE INCORPORATED'iga seotud, toetatud ega sponsoreeritud.",
      ],
    },
    {
      heading: 'Tagasiside ja kaastööd',
      paragraphs: [
        'Ootame tagasisidet, veaaruandeid ja funktsioonisoovitusi. Võtke ühendust e-posti või kontaktide lehel – loeme iga sõnumi läbi, kuigi vastamisajad võivad erineda.',
      ],
    },
  ],
};

export default about;
