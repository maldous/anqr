import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contacteer ons',
  description: 'We verwelkomen feedback, bug rapporten, feature verzoeken, en algemene vragen.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Hoe ons te bereiken',
      paragraphs: ['Wij bieden verschillende manieren om contact met ons op te nemen afhankelijk van uw behoeften. We lezen elk bericht, hoewel de responstijden kunnen variëren op basis van volume en het type aanvraag.'],
    },
    {
      heading: 'E-mail',
      paragraphs: ['Voor alle vragen: email@anqr.link_', 'Dit is de meest betrouwbare manier om ons te bereiken en wordt aanbevolen voor gedetailleerde vragen, zakelijke vragen of andere vragen.'],
    },
    {
      heading: 'Soorten onderzoeken',
      bullets: ['Algemene vragen: Vragen over het gebruik van ANQR, uitleg van functies of algemene feedback.', 'Foutmeldingen: Gelieve uw browser, besturingssysteem, stappen te reproduceren, en eventuele foutmeldingen die u ziet.', 'Functieverzoeken: suggesties voor nieuwe functies of verbeteringen. We nemen alle verzoeken in overweging, hoewel we de uitvoering ervan niet kunnen beloven.', 'Zakelijke vragen: partnerschapsmogelijkheden, licentievragen of vragen over commercieel gebruik.', 'Privacyverzoeken: Verzoeken om uw privacyrechten uit te oefenen onder de AVG, CCPA of andere privacywetten (zie Privacybeleid).', 'DMCA/Copyright: Zie de DMCA-sectie hieronder voor de vereisten voor het nemen van een kennisgeving.'],
    },
    {
      heading: 'Responstijden',
      paragraphs: ['We willen binnen 5-7 werkdagen antwoorden op vragen. Privacy-gerelateerde verzoeken zullen worden behandeld binnen 30 dagen zoals vereist door de wet.', 'Tijdens drukke periodes kunnen de responstijden langer zijn. Voor dringende zaken, gelieve "URGENTIE" in uw onderwerplijn aan te geven.'],
    },
    {
      heading: 'Alvorens ons te contacteren',
      paragraphs: ['Bekijk onze documentatiepagina voor antwoorden op veelgestelde vragen over het gebruik van ANQR-functies. Veel vragen over het genereren van QR-codes, de stijl en de exportopties worden daar behandeld.'],
    },
    {
      heading: 'DMCA Auteursrechten',
      paragraphs: ['Als u van mening bent dat content beschikbaar op ANQR uw auteursrecht schendt, kunt u een digitale Millennium Copyright Act (DMCA) takedown notificatie indienen. Om geldig te zijn, moet uw kennisgeving bevatten:'],
      bullets: ['Een fysieke of elektronische handtekening van de eigenaar van het auteursrecht of een bevoegde agent.', 'Identificatie van het auteursrechtelijk beschermde werk waarop inbreuk zou zijn gemaakt.', 'Identificatie van het materiaal waarvan wordt beweerd dat het inbreuk maakt, met voldoende informatie om het te lokaliseren.', 'Uw contactgegevens (adres, telefoonnummer en e-mailadres).', 'Een verklaring dat u te goeder trouw gelooft dat het gebruik van het materiaal niet is toegestaan door de eigenaar van het auteursrecht.', 'Een verklaring, op straffe van meineed, dat de informatie in uw kennisgeving juist is en dat u de eigenaar van het auteursrecht bent of bevoegd bent om namens hen op te treden.'],
    },
    {
      heading: 'DMCA Contact',
      paragraphs: ['Verzend DMCA berichten naar: email@anqr.link', 'Gelieve "DMCA Notice" in de onderwerpregel op te nemen. We zullen reageren op geldige kennisgevingen in overeenstemming met het toepasselijke recht. Merk op dat ANQR QR-codes lokaal genereert op gebruikersapparaten en geen door gebruikers gegenereerde inhoud host.'],
    },
    {
      heading: 'Reddit-gemeenschap',
      paragraphs: ['Sluit u aan bij onze Reddit-community op r/ANQR om uw QR-creaties te delen, vragen te stellen, hulp te krijgen en in contact te komen met andere ANQR-gebruikers.'],
    },
  ],
};

export default contact;
