import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontakta oss',
  description: 'Vi välkomnar feedback, buggrapporter, funktionsförfrågningar och allmänna förfrågningar.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Hur du når oss',
      paragraphs: ['Vi erbjuder flera sätt att kontakta oss beroende på dina behov. Vi läser alla meddelanden, även om svarstider kan variera beroende på volym och typ av förfrågning.'],
    },
    {
      heading: 'E-post',
      paragraphs: ['För alla förfrågningar: email@anqr.link', 'Detta är det mest pålitliga sättet att nå oss och rekommenderas för detaljerade frågor, affärsförfrågningar eller andra förfrågningar.'],
    },
    {
      heading: 'Typer av förfrågningar',
      bullets: ['Allmänna frågor: Frågor om hur man använder ANQR, funktionsförklaringar eller allmän feedback.', 'Felrapporter: Inkludera din webbläsare, operativsystem, steg för att återskapa och eventuella felmeddelanden du ser.', 'Funktionsförfrågningar: Förslag på nya funktioner eller förbättringar. Vi överväger alla förfrågningar även om vi inte kan lova genomförande.', 'Affärsförfrågningar: Partnerskapsmöjligheter, licensfrågor eller förfrågningar om kommersiell användning.', 'Sekretessförfrågningar: Begäran om att få utöva dina integritetsrättigheter enligt GDPR, CCPA eller andra integritetslagar (se Sekretesspolicy).', 'DMCA/Copyright: Se DMCA-avsnittet nedan för krav på meddelande om borttagning.'],
    },
    {
      heading: 'Svarstider',
      paragraphs: ['Vi strävar efter att svara på förfrågningar inom 5-7 arbetsdagar. Sekretessrelaterade förfrågningar kommer att behandlas inom 30 dagar enligt lag.', 'Under hektiska perioder kan svarstiderna bli längre. För brådskande ärenden, vänligen ange "BRÄSKT" i ​​din ämnesrad.'],
    },
    {
      heading: 'Innan du kontaktar oss',
      paragraphs: ['Se vår dokumentationssida för svar på vanliga frågor om hur du använder ANQR-funktioner. Många frågor om QR-kodgenerering, styling och exportalternativ behandlas där.'],
    },
    {
      heading: 'DMCA-upphovsrättsmeddelanden',
      paragraphs: ['Om du anser att innehåll som är tillgängligt på ANQR gör intrång i din upphovsrätt kan du skicka in ett meddelande om borttagning från Digital Millennium Copyright Act (DMCA). För att vara giltigt måste ditt meddelande innehålla:'],
      bullets: ['En fysisk eller elektronisk signatur från upphovsrättsinnehavaren eller auktoriserad agent.', 'Identifiering av det upphovsrättsskyddade verk som påstås ha gjorts intrång.', 'Identifiering av det material som påstås göra intrång, med tillräcklig information för att lokalisera det.', 'Dina kontaktuppgifter (adress, telefonnummer och e-postadress).', 'Ett uttalande om att du i god tro tror att användningen av materialet inte är godkänd av upphovsrättsinnehavaren.', 'Ett uttalande, under straff för mened, att informationen i ditt meddelande är korrekt och att du är upphovsrättsinnehavaren eller behörig att agera å deras vägnar.'],
    },
    {
      heading: 'DMCA-kontakt',
      paragraphs: ['Skicka DMCA-meddelanden till: email@anqr.link', 'Inkludera "DMCA Notice" i ämnesraden. Vi kommer att svara på giltiga meddelanden i enlighet med tillämplig lag. Observera att ANQR genererar QR-koder lokalt på användarnas enheter och inte är värd för användargenererat innehåll.'],
    },
    {
      heading: 'Reddit Community',
      paragraphs: ['Gå med i vår Reddit-community på r/ANQR för att dela dina QR-skapelser, ställa frågor, få hjälp och få kontakt med andra ANQR-användare.'],
    },
  ],
};

export default contact;
