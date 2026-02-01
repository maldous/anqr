import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Help om ANQR te vertaal',
  description: 'Sluit aan by ons gemeenskap van vertalers wat help om ANQR vir gebruikers wêreldwyd toeganklik te maak. Geen koderingservaring nodig nie - dra direk vanaf jou blaaier by.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Maak vertaalbewaarplek oop', type: 'external' },
    { href: '/?lang=${lang}', label: 'Maak die kragopwekker oop', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Oor ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontak ons', type: 'external' },
  ],
  sections: [
    {
      heading: 'Hoekom bydra?',
      paragraphs: ['ANQR word deur mense regoor die wêreld gebruik om QR-kodes vir besighede, geleenthede, betalings en persoonlike projekte te skep. Deur vertalings by te dra, help jy om hierdie kragtige hulpmiddel toeganklik te maak vir gebruikers wat hul moedertaal verkies.', 'Elke vertaalbydrae - of dit nou \'n tikfout reggemaak word of \'n hele taal vertaal word - maak \'n werklike verskil vir gebruikers in jou gemeenskap.'],
    },
    {
      heading: 'Wat kan jy vertaal?',
      paragraphs: ['ANQR het twee tipes vertaalbare inhoud:'],
      bullets: ['UI-stringe: Knoppie-etikette, kieslysitems, nutswenke en koppelvlakteks wat regdeur die toepassing verskyn.', 'Statiese inhoud: Dokumentasiebladsye, insluitend gidse, voorbeelde, privaatheidsbeleid en hulpartikels.', 'Albei tipes word gestoor as eenvoudige tekslêers wat jy direk in jou blaaier kan wysig – geen spesiale sagteware nodig nie.', 'Vertalings word hersien voordat dit saamgevoeg word om kwaliteit en konsekwentheid te verseker.'],
    },
    {
      heading: 'Hoe om by te dra',
      paragraphs: ['Om by te dra is maklik en vereis geen Git-kennis nie:'],
      bullets: ['Besoek ons openbare vertaalbewaarplek op GitHub.', 'Vind jou taallêer (of skep \'n nuwe een as jou taal nog nie ondersteun word nie).', 'Klik op die potloodikoon om direk in jou blaaier te wysig.', 'Maak jou veranderinge en klik "Stel veranderinge voor" - GitHub sal outomaties \'n trekversoek skep.', 'Jou bydrae sal hersien en saamgevoeg word, gewoonlik binne \'n paar dae.'],
    },
    {
      heading: 'Vertaalriglyne',
      paragraphs: ['Wanneer jy vertaal, hou asseblief plekhouers soos {name}, {count} en {{variable}} onveranderd - dit word vervang met dinamiese waardes tydens looptyd. Bewaar ook enige HTML-agtige sintaksis soos skakels in die formaat [[/path|Etiket]].', 'As jy onseker is oor \'n vertaling, is dit beter om dit in Engels te laat as om \'n verkeerde vertaling te verskaf. U kan ook \'n probleem op GitHub oopmaak om verduideliking te vra.'],
    },
    {
      heading: 'Tans ondersteunde tale',
      paragraphs: ['ANQR ondersteun tans meer as 40 tale, insluitend:'],
      bullets: ['Groot wêreldtale: Engels, Chinees, Spaans, Arabies, Hindi, Portugees, Japannees, Koreaans, Frans, Duits, Russies en meer.', 'Suidoos-Asiatiese tale: Thai, Viëtnamees, Indonesies, Filippyns, Maleis, Khmer, Lao, Birmaans.', 'Suid-Asiatiese tale: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malabaars, Punjabi, Nepalees.'],
    },
    {
      heading: 'Erkenning',
      paragraphs: ['Alle bydraers word in ons bewaarplek gekrediteer. Jou werk help duisende gebruikers om toegang tot ANQR in hul voorkeurtaal te kry.', 'Dankie aan al ons vertaalbydraers wat gehelp het om ANQR wêreldwyd toeganklik te maak!'],
    },
    {
      heading: 'Vrae?',
      paragraphs: ['As jy vrae het oor bydraende vertalings, maak asseblief \'n kwessie op ons GitHub-bewaarplek oop of kontak ons per e-pos. Ons help jou graag om aan die gang te kom.'],
    },
  ],
};

export default translate;
