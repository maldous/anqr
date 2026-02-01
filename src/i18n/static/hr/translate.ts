import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Pomozite prevesti ANQR',
  description: 'Pridružite se našoj zajednici prevoditelja koji pomažu da ANQR bude dostupan korisnicima širom svijeta. Nije potrebno iskustvo kodiranja - doprinosite izravno iz svog preglednika.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Otvorite spremište prijevoda', type: 'external' },
    { href: '/?lang=${lang}', label: 'Otvorite Generator', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'O ANQR-u', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontaktirajte nas', type: 'external' },
  ],
  sections: [
    {
      heading: 'Zašto doprinositi?',
      paragraphs: ['ANQR koriste ljudi diljem svijeta za stvaranje QR kodova za tvrtke, događaje, plaćanja i osobne projekte. Doprinosom prijevoda pomažete da ovaj moćni alat postane dostupan korisnicima koji preferiraju svoj materinji jezik.', 'Svaki doprinos prijevodu - bilo da se radi o ispravljanju pogreške pri upisu ili prijevodu cijelog jezika - čini stvarnu razliku za korisnike u vašoj zajednici.'],
    },
    {
      heading: 'Što možete prevesti?',
      paragraphs: ['ANQR ima dvije vrste prevodivog sadržaja:'],
      bullets: ['UI nizovi: Oznake gumba, stavke izbornika, opisi alata i tekst sučelja koji se pojavljuje u cijeloj aplikaciji.', 'Statički sadržaj: Stranice s dokumentacijom uključujući vodiče, primjere, pravila o privatnosti i članke pomoći.', 'Obje su vrste pohranjene kao jednostavne tekstualne datoteke koje možete uređivati izravno u svom pregledniku - nije potreban poseban softver.', 'Prijevodi se pregledavaju prije spajanja kako bi se osigurala kvaliteta i dosljednost.'],
    },
    {
      heading: 'Kako doprinijeti',
      paragraphs: ['Doprinos je jednostavan i ne zahtijeva poznavanje Gita:'],
      bullets: ['Posjetite naše javno spremište prijevoda na GitHubu.', 'Pronađite svoju jezičnu datoteku (ili stvorite novu ako vaš jezik još nije podržan).', 'Kliknite ikonu olovke za uređivanje izravno u pregledniku.', 'Unesite svoje izmjene i kliknite "Predloži izmjene" - GitHub će automatski kreirati zahtjev za povlačenje.', 'Vaš će doprinos biti pregledan i spojen, obično u roku od nekoliko dana.'],
    },
    {
      heading: 'Smjernice za prijevod',
      paragraphs: ['Prilikom prevođenja neka rezervirana mjesta kao što su {name}, {count} i {{variable}} budu nepromijenjena - zamjenjuju se dinamičkim vrijednostima tijekom izvođenja. Također sačuvajte sintaksu sličnu HTML-u kao što su veze u formatu [[/path|Oznaka]].', 'Ako niste sigurni u prijevod, bolje je da ga ostavite na engleskom nego da date netočan prijevod. Također možete otvoriti problem na GitHubu i zatražiti pojašnjenje.'],
    },
    {
      heading: 'Trenutno podržani jezici',
      paragraphs: ['ANQR trenutno podržava više od 40 jezika, uključujući:'],
      bullets: ['Glavni svjetski jezici: engleski, kineski, španjolski, arapski, hindi, portugalski, japanski, korejski, francuski, njemački, ruski i drugi.', 'Jezici jugoistočne Azije: tajlandski, vijetnamski, indonezijski, filipinski, malajski, kmerski, laoski, burmanski.', 'Južnoazijski jezici: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Prepoznavanje',
      paragraphs: ['Svi suradnici zapisani su u našem repozitoriju. Vaš rad pomaže tisućama korisnika pristupiti ANQR-u na željenom jeziku.', 'Hvala svim našim suradnicima u prijevodima što su nam pomogli da ANQR postane dostupan u cijelom svijetu!'],
    },
    {
      heading: 'Pitanja?',
      paragraphs: ['Ako imate pitanja o doprinosu prijevodima, otvorite problem na našem GitHub repozitoriju ili nas kontaktirajte putem e-pošte. Rado ćemo vam pomoći da započnete.'],
    },
  ],
};

export default translate;
