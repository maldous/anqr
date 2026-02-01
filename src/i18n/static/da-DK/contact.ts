import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontakt os',
  description: 'Vi glæder os over feedback, fejlrapporter, anmodninger om funktioner og generelle forespørgsler.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Hvordan får vi fat i os',
      paragraphs: ['Vi tilbyder flere måder at kontakte os på afhængigt af dine behov. Vi læser alle meddelelser, selv om svartider kan variere baseret på volumen og forespørgsel type.'],
    },
    {
      heading: 'E- mail',
      paragraphs: ['For alle forespørgsler: $_ _ ANQR _ PH _ 0 _ _', 'Dette er den mest pålidelige måde at nå os på og anbefales til detaljerede spørgsmål, forretningsforespørgsler eller andre forespørgsler.'],
    },
    {
      heading: 'Typer af forespørgsler',
      bullets: ['Generelle spørgsmål: Spørgsmål om hvordan du bruger ANQR, feature forklaringer, eller generel feedback.', 'Fejlrapporter: Du bedes inkludere din browser, operativsystem, trin til at reproducere, og eventuelle fejlmeddelelser, du ser.', 'Feature anmodninger: Forslag til nye funktioner eller forbedringer. Vi behandler alle anmodninger, selv om vi ikke kan love gennemførelse.', 'Virksomhedsforespørgsler: Partnerskabsmuligheder, licensspørgsmål eller kommercielle forespørgsler.', 'Forespørgsler om beskyttelse af personlige oplysninger: Anmodninger om at udøve dine personlige rettigheder under GDPR, CCPA eller andre love om beskyttelse af personlige oplysninger (se Privacy Policy).', 'DMCA/Copyright: Se DMCA-afsnittet nedenfor for krav om meddelelse om fjernelse.'],
    },
    {
      heading: 'Responstid',
      paragraphs: ['Vi bestræber os på at besvare henvendelser inden for 5-7 hverdage. Privatlivsrelaterede anmodninger vil blive behandlet inden for 30 dage som krævet ved lov.', 'I travle perioder kan responstiden være længere. I hastende tilfælde anføres "URGENT" i emnelinjen.'],
    },
    {
      heading: 'Før du kontakter os',
      paragraphs: ['Se venligst vores dokumentationsside for svar på almindelige spørgsmål om, hvordan du bruger ANQR-funktioner. Mange spørgsmål om QR-kodegenerering, styling og eksportmuligheder er dækket der.'],
    },
    {
      heading: 'DMCA Meddelelser om ophavsret',
      paragraphs: ['Hvis du mener, at indhold tilgængelige på ANQR overtræder din ophavsret, kan du indsende en Digital Millennium Copyright Act (DMCA) takedown meddelelse. For at være gyldig skal din meddelelse indeholde:'],
      bullets: ['En fysisk eller elektronisk underskrift fra ophavsretsindehaveren eller den befuldmægtigede.', 'Identifikation af det ophavsretligt beskyttede arbejde, der hævdes at være blevet krænket.', 'Identifikation af det materiale, der hævdes at krænke, med tilstrækkelige oplysninger til at lokalisere det.', 'Din kontaktinformation (adresse, telefonnummer og e-mailadresse).', 'En erklæring om, at du har en god tro på, at brugen af materialet ikke er godkendt af ejeren af ophavsretten.', 'En erklæring, under straf for mened, om, at oplysningerne i din meddelelse er nøjagtige, og at du er ophavsretsejeren eller autoriseret til at handle på deres vegne.'],
    },
    {
      heading: 'DMCA-kontakt',
      paragraphs: ['Send DMCA meddelelser til: $_ _ ANQR _ PH _ 0 _ _', 'Medtag venligst "DMCA Notice" i emnelinjen. Vi vil reagere på gyldige bekendtgørelser i overensstemmelse med gældende lov. Bemærk, at ANQR genererer QR-koder lokalt på brugerenheder og ikke vært brugergenereret indhold.'],
    },
    {
      heading: 'Reddit-fællesskab',
      paragraphs: ['Tilmeld dig vores Reddit-fællesskab på r/ANQR for at dele dine QR-kreationer, stille spørgsmål, få hjælp og oprette forbindelse til andre ANQR-brugere.'],
    },
  ],
};

export default contact;
