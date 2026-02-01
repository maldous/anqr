import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Help ANQR vertalen',
  description: 'Sluit u aan bij onze gemeenschap van vertalers die ANQR toegankelijk maken voor gebruikers over de hele wereld. Geen codeerervaring vereist - draag rechtstreeks vanuit uw browser bij.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Open de vertaalopslagplaats', type: 'external' },
    { href: '/?lang=${lang}', label: 'Open de generator', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Over ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Neem contact met ons op', type: 'external' },
  ],
  sections: [
    {
      heading: 'Waarom bijdragen?',
      paragraphs: ['ANQR wordt door mensen over de hele wereld gebruikt om QR-codes te maken voor bedrijven, evenementen, betalingen en persoonlijke projecten. Door vertalingen bij te dragen, helpt u deze krachtige tool toegankelijk te maken voor gebruikers die de voorkeur geven aan hun moedertaal.', 'Elke vertaalbijdrage - of het nu gaat om het corrigeren van een typefout of het vertalen van een hele taal - maakt een echt verschil voor gebruikers in uw gemeenschap.'],
    },
    {
      heading: 'Wat kun je vertalen?',
      paragraphs: ['ANQR heeft twee soorten vertaalbare inhoud:'],
      bullets: ['UI-tekenreeksen: knoplabels, menu-items, tooltips en interfacetekst die in de hele app verschijnen.', 'Statische inhoud: documentatiepagina\'s inclusief handleidingen, voorbeelden, privacybeleid en helpartikelen.', 'Beide typen worden opgeslagen als eenvoudige tekstbestanden die u rechtstreeks in uw browser kunt bewerken - er is geen speciale software voor nodig.', 'Vertalingen worden beoordeeld voordat ze worden samengevoegd om de kwaliteit en consistentie te garanderen.'],
    },
    {
      heading: 'Hoe u kunt bijdragen',
      paragraphs: ['Bijdragen is eenvoudig en vereist geen Git-kennis:'],
      bullets: ['Bezoek onze openbare vertaalopslagplaats op GitHub.', 'Zoek uw taalbestand (of maak een nieuw bestand als uw taal nog niet wordt ondersteund).', 'Klik op het potloodpictogram om rechtstreeks in uw browser te bewerken.', 'Breng uw wijzigingen aan en klik op "Wijzigingen voorstellen" - GitHub maakt automatisch een pull-verzoek.', 'Uw bijdrage wordt doorgaans binnen een paar dagen beoordeeld en samengevoegd.'],
    },
    {
      heading: 'Vertaalrichtlijnen',
      paragraphs: ['Houd bij het vertalen tijdelijke aanduidingen zoals {name}, {count} en {{variable}} ongewijzigd. Deze worden tijdens runtime vervangen door dynamische waarden. Behoud ook HTML-achtige syntaxis, zoals links in de indeling [[/pad|Label]].', 'Als u twijfelt over een vertaling, kunt u deze beter in het Engels laten dan een onjuiste vertaling geven. Je kunt ook een issue op GitHub openen om om opheldering te vragen.'],
    },
    {
      heading: 'Momenteel ondersteunde talen',
      paragraphs: ['ANQR ondersteunt momenteel meer dan 40 talen, waaronder:'],
      bullets: ['Belangrijke wereldtalen: Engels, Chinees, Spaans, Arabisch, Hindi, Portugees, Japans, Koreaans, Frans, Duits, Russisch en meer.', 'Zuidoost-Aziatische talen: Thais, Vietnamees, Indonesisch, Filipijns, Maleis, Khmer, Laotiaans, Birmaans.', 'Zuid-Aziatische talen: Hindi, Tamil, Telugu, Bengaals, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepalees.'],
    },
    {
      heading: 'Erkenning',
      paragraphs: ['Alle bijdragers worden vermeld in onze repository. Dankzij uw werk krijgen duizenden gebruikers toegang tot ANQR in hun voorkeurstaal.', 'Hartelijk dank aan al onze vertalingsbijdragers voor hun bijdrage aan het wereldwijd toegankelijk maken van ANQR!'],
    },
    {
      heading: 'Vragen?',
      paragraphs: ['Als je vragen hebt over het bijdragen aan vertalingen, open dan een probleem in onze GitHub-repository of neem contact met ons op via e-mail. Wij helpen u graag op weg.'],
    },
  ],
};

export default translate;
