import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Hjælp Oversæt ANQR',
  description: 'Deltag i vores fællesskab af oversættere hjælpe med at gøre ANQR tilgængelig for brugere over hele verden. Ingen kodning erfaring kræves - bidrage direkte fra din browser.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Åbn oversættelseslager', type: 'external' },
    { href: '/?lang=${lang}', label: 'Åbn generatoren', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Om ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontakt os', type: 'external' },
  ],
  sections: [
    {
      heading: 'Hvorfor bidrage?',
      paragraphs: ['ANQR bruges af folk over hele verden til at oprette QR-koder for virksomheder, events, betalinger og personlige projekter. Ved at bidrage oversættelser, du hjælper med at gøre dette kraftfulde værktøj tilgængeligt for brugere, der foretrækker deres modersmål.', 'Hver oversættelse bidrag - uanset om fastsættelse af en typo eller oversætte et helt sprog - gør en reel forskel for brugerne i dit samfund.'],
    },
    {
      heading: 'Hvad kan du oversætte?',
      paragraphs: ['ANQR har to typer af translaterbart indhold:'],
      bullets: ['UI Strings: Knapetiketter, menupunkter, værktøjstips og grænsefladetekst, der vises i hele appen.', 'Statisk indhold: Dokumentationssider, herunder vejledninger, eksempler, fortrolighedspolitik og hjælp artikler.', 'Begge typer gemmes som simple tekstfiler, som du kan redigere direkte i din browser - ingen speciel software nødvendig.', 'Oversættelser gennemgås inden de sammenlægges for at sikre kvalitet og konsistens.'],
    },
    {
      heading: 'Hvordan at bidrage',
      paragraphs: ['Bidrage er let og kræver ingen Git viden:'],
      bullets: ['Besøg vores offentlige oversættelsesarkiv på GitHub.', 'Find din sprogfil (eller opret en ny, hvis dit sprog endnu ikke er understøttet).', 'Klik på blyant- ikonet for at redigere direkte i din browser.', 'Lav dine ændringer og klik på "Foreslå ændringer" - GitHub vil automatisk oprette en pull anmodning.', 'Dit bidrag vil blive gennemgået og fusioneret, typisk inden for et par dage.'],
    },
    {
      heading: 'Oversættelsesvejledninger',
      paragraphs: ['Når du oversætter, skal du holde pladsholdere som _ _ ANQR _ PH _ 0 _ _, _ _ ANQR _ PH _ 1 _ _, og _ _ ANQR _ PH _ 2 _ _ uændret - disse erstattes med dynamiske værdier ved runtime. Også bevare enhver HTML- lignende syntaks såsom links i formatet [[/ stie; 124; Label]].', 'Hvis du er usikker på en oversættelse, er det bedre at forlade det på engelsk end at give en forkert oversættelse. Du kan også åbne et spørgsmål om GitHub at bede om afklaring.'],
    },
    {
      heading: 'Nuværende understøttede sprog',
      paragraphs: ['ANQR understøtter i øjeblikket over 40 sprog, herunder:'],
      bullets: ['Større verdenssprog: Engelsk, kinesisk, spansk, arabisk, hindi, portugisisk, japansk, koreansk, fransk, tysk, russisk og meget mere.', 'Sydøstasien sprog: thailandsk, vietnamesisk, indonesisk, filippinsk, Malay, Khmer, Lao, burmesisk.', 'Sydasiatiske sprog: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malasalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Anerkendelse',
      paragraphs: ['Alle bidragydere krediteres vores arkiv. Dit arbejde hjælper tusindvis af brugere adgang til ANQR i deres foretrukne sprog.', 'Tak til alle vores oversættelse bidragydere for at hjælpe med at gøre ANQR tilgængelig på verdensplan!'],
    },
    {
      heading: 'Spørgsmål?',
      paragraphs: ['Hvis du har spørgsmål om at bidrage med oversættelser, bedes du åbne et problem på vores GitHub arkiv eller kontakte os via e-mail. Vi hjælper dig gerne i gang.'],
    },
  ],
};

export default translate;
