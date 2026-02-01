import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Over ANQR',
  description: 'ANQR is een gratis QR-codegenerator met een klantgerichte aanpak: genereer lokaal QR-codes of gebruik onze API voor insluiting.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open de generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Blader door artikels', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Privacybeleid', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Servicevoorwaarden', type: 'external' },
  ],
  sections: [
    {
      heading: 'Wat is ANQR?',
      paragraphs: ['ANQR (uitgesproken als "anker") is een gratis QR-codegenerator die scanbare codes maakt voor URL\'s, tekst, Wi-Fi-inloggegevens, contactkaarten, agenda-evenementen en meer.', 'Het is gebouwd voor individuen, kleine bedrijven, marketeers en ontwikkelaars die krachtige QR-tools willen zonder zich aan te melden. Het klantgerichte ontwerp betekent dat QR-codes standaard lokaal in uw browser worden gegenereerd, met een optionele server-API voor professionele inbedding en integratie.'],
    },
    {
      heading: 'Belangrijkste kenmerken',
      bullets: ['Genereer QR-codes direct in uw browser - geen account vereist.', 'Pas kleuren, modulestijlen, zoekpatronen aan en voeg afbeeldingen toe.', 'Exporteren in meerdere formaten: PNG, SVG, WebP en geanimeerde GIF.', 'Geavanceerde controles voor foutcorrectie niveau, QR-versie, codering modus, en masker selectie.', 'Scan-veiligheid begeleiding en live preview om codes leesbaar te houden in afdruk en op schermen.', 'Server-side API voor professionele inbedding met volledige parameter ondersteuning.', 'Werkt offline zodra deze is geladen. Het is een statische webapp die u overal kunt uitvoeren.'],
    },
    {
      heading: 'Hoe werkt ANQR?',
      paragraphs: ['ANQR draait in uw browser en codeert uw invoer in een standaard QR matrix met Reed', 'Het genereren gebeurt standaard lokaal in uw browser. Voor professioneel gebruik kunt u ook de server-side API gebruiken om QR-codes te genereren via URL-parameters - perfect voor insluiting in websites, e-mails of geautomatiseerde workflows.', 'Wanneer u overlays of animaties toevoegt, brengt ANQR de styling in evenwicht met de betrouwbaarheid van de scan, zodat het resultaat scanbaar blijft.', 'ANQR richt zich op statische codes (de gegevens bevinden zich in de QR). Als u een dynamische code (bewerkbare bestemming) nodig heeft, kunt u uw eigen omleidings-URL of korte link coderen.'],
    },
    {
      heading: 'Wie beheert ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reclame en hoe we vrij blijven',
      paragraphs: ['ANQR is gratis te gebruiken en wordt ondersteund door advertenties. Het is mogelijk dat wij advertenties tonen via Google AdSense en/of andere advertentiepartners.', 'Advertentieaanbieders kunnen cookies of vergelijkbare technologieën gebruiken om advertenties te personaliseren op basis van uw interesses en browse-activiteit. U kunt advertentievoorkeuren beheren in uw apparaatinstellingen en via de advertentie-instellingen van Google. Lees meer in ons Privacybeleid.', 'Wij verkopen de inhoud die u codeert niet in QR-codes. Ads helpen de kosten van het uitvoeren en verbeteren van het project te dekken.'],
    },
    {
      heading: 'Open standaarden',
      paragraphs: ['ANQR genereert QR-codes op basis van de ISO/IEC 18004-norm en streeft naar brede compatibiliteit tussen scanners, camera\'s en printworkflows.'],
    },
    {
      heading: 'Kennisgeving merk',
      paragraphs: ['QR Code® is een geregistreerd handelsmerk van DENSO WAVE INCORPORATED. ANQR is niet aangesloten bij, onderschreven door of gesponsord door DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Feedback en bijdragen',
      paragraphs: ['We verwelkomen feedback, bugrapporten en suggesties voor functies. Neem contact met ons op via e-mail of de contactpagina. We lezen elk bericht, hoewel de reactietijden kunnen variëren.'],
    },
  ],
};

export default about;
