import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'O ANQR-u',
  description: 'ANQR je besplatni generator QR koda s pristupom klijentu na prvom mjestu - generirajte QR kodove lokalno ili koristite naš API za ugradnju.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otvorite generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Pregledajte članke Learna', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Politika privatnosti', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Uvjeti usluge', type: 'external' },
  ],
  sections: [
    {
      heading: 'Što je ANQR?',
      paragraphs: ['ANQR (izgovara se "sidro") besplatni je generator QR kodova koji stvara kodove koji se mogu skenirati za URL-ove, tekst, Wi-Fi vjerodajnice, kartice kontakata, događaje u kalendaru i više.', 'Napravljen je za pojedince, mala poduzeća, trgovce i programere koji žele moćne QR alate bez prijave. Dizajn na prvom mjestu znači da se QR kodovi prema zadanim postavkama generiraju lokalno u vašem pregledniku, s dodatnim API-jem poslužitelja za profesionalno ugrađivanje i integraciju.'],
    },
    {
      heading: 'Ključne značajke',
      bullets: ['Generirajte QR kodove trenutno u svom pregledniku - nije potreban račun.', 'Prilagodite boje, stilove modula, uzorke tražila i dodajte slojeve slika.', 'Izvoz u više formata: PNG, SVG, WebP i animirani GIF.', 'Napredne kontrole za razinu ispravljanja pogrešaka, QR verziju, način kodiranja i odabir maske.', 'Smjernice za sigurnost skeniranja i pregled uživo kako bi se kodovi održali čitljivima u tisku i na zaslonima.', 'API na strani poslužitelja za profesionalno ugrađivanje s punom podrškom za parametre.', 'Radi izvanmrežno nakon učitavanja - to je statična web-aplikacija koju možete pokrenuti bilo gdje.'],
    },
    {
      heading: 'Kako radi ANQR',
      paragraphs: ['ANQR se pokreće u vašem pregledniku i kodira vaš unos u standardnu QR matricu s Reed–Solomonovim ispravljanjem pogrešaka, a zatim ga prikazuje u formatu koji odaberete.', 'Generiranje se prema zadanim postavkama događa lokalno u vašem pregledniku. Za profesionalnu upotrebu također možete koristiti API na strani poslužitelja za generiranje QR kodova putem URL parametara - savršeno za ugradnju u web stranice, e-poštu ili automatizirane tijekove rada.', 'Kada dodate slojeve ili animacije, ANQR uravnotežuje stil s pouzdanošću skeniranja tako da rezultat ostaje skeniran.', 'ANQR se fokusira na statične kodove (podaci su unutar QR-a). Ako vam je potreban dinamički kod (odredište koje se može uređivati), možete kodirati vlastiti URL za preusmjeravanje ili kratku vezu.'],
    },
    {
      heading: 'Tko upravlja ANQR-om?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Oglašavanje i kako ostajemo besplatni',
      paragraphs: ['ANQR je besplatan za korištenje i podržava ga oglašavanje. Oglase možemo prikazivati ​​putem Google AdSensea i/ili drugih partnera za oglašavanje.', 'Davatelji oglasa mogu koristiti kolačiće ili slične tehnologije za personalizaciju oglasa na temelju vaših interesa i aktivnosti pregledavanja. Možete upravljati postavkama oglasa u postavkama svog uređaja i putem Google postavki oglasa, a saznajte više u našim Pravilima privatnosti.', 'Ne prodajemo sadržaj koji kodirate u QR kodove. Oglasi pomažu u pokrivanju troškova vođenja i poboljšanja projekta.'],
    },
    {
      heading: 'Otvoreni standardi',
      paragraphs: ['ANQR generira QR kodove na temelju standarda ISO/IEC 18004 i ima za cilj široku kompatibilnost među skenerima, kamerama i radnim procesima ispisa.'],
    },
    {
      heading: 'Obavijest o zaštitnim znakovima',
      paragraphs: ['QR Code® je registrirani zaštitni znak tvrtke DENSO WAVE INCORPORATED. ANQR nije povezan, podržan od strane DENSO WAVE INCORPORATED niti ga sponzorira.'],
    },
    {
      heading: 'Povratne informacije i doprinosi',
      paragraphs: ['Pozdravljamo povratne informacije, izvješća o greškama i prijedloge značajki. Molimo stupite u kontakt putem e-pošte ili stranice za kontakt - čitamo svaku poruku, iako vrijeme odgovora može varirati.'],
    },
  ],
};

export default about;
