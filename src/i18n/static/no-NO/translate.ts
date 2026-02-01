import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Hjelp til å oversette ANQR',
  description: 'Bli med i vårt fellesskap av oversettere for å gjøre ANQR tilgjengelig for brukere over hele verden. Ingen kodeerfaring kreves - bidra direkte fra nettleseren din.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Åpne oversettelsesarkiv', type: 'external' },
    { href: '/?lang=${lang}', label: 'Åpne generatoren', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Om ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontakt oss', type: 'external' },
  ],
  sections: [
    {
      heading: 'Hvorfor bidra?',
      paragraphs: ['ANQR brukes av mennesker over hele verden til å lage QR-koder for bedrifter, arrangementer, betalinger og personlige prosjekter. Ved å bidra med oversettelser bidrar du til å gjøre dette kraftige verktøyet tilgjengelig for brukere som foretrekker morsmålet sitt.', 'Hvert oversettelsesbidrag – enten det er å fikse en skrivefeil eller oversette et helt språk – utgjør en reell forskjell for brukerne i fellesskapet ditt.'],
    },
    {
      heading: 'Hva kan du oversette?',
      paragraphs: ['ANQR har to typer oversettbart innhold:'],
      bullets: ['UI-strenger: Knappeetiketter, menyelementer, verktøytips og grensesnitttekst som vises i hele appen.', 'Statisk innhold: Dokumentasjonssider inkludert guider, eksempler, personvernregler og hjelpeartikler.', 'Begge typene lagres som enkle tekstfiler som du kan redigere direkte i nettleseren - ingen spesiell programvare nødvendig.', 'Oversettelser gjennomgås før de slås sammen for å sikre kvalitet og konsistens.'],
    },
    {
      heading: 'Hvordan bidra',
      paragraphs: ['Å bidra er enkelt og krever ingen Git-kunnskap:'],
      bullets: ['Besøk vårt offentlige oversettelsesregister på GitHub.', 'Finn språkfilen din (eller lag en ny hvis språket ditt ikke støttes ennå).', 'Klikk på blyantikonet for å redigere direkte i nettleseren.', 'Gjør endringene dine og klikk "Foreslå endringer" - GitHub vil automatisk opprette en pull-forespørsel.', 'Bidraget ditt vil bli vurdert og slått sammen, vanligvis innen noen få dager.'],
    },
    {
      heading: 'Retningslinjer for oversettelse',
      paragraphs: ['Når du oversetter, vennligst behold plassholdere som {name}, {count} og {{variable}} uendret - disse erstattes med dynamiske verdier under kjøring. Ta også vare på HTML-lignende syntaks som lenker i formatet [[/path|Label]].', 'Hvis du er usikker på en oversettelse, er det bedre å la den stå på engelsk enn å gi en feil oversettelse. Du kan også åpne et problem på GitHub for å be om avklaring.'],
    },
    {
      heading: 'Språk som støttes for øyeblikket',
      paragraphs: ['ANQR støtter for tiden over 40 språk, inkludert:'],
      bullets: ['Viktige verdensspråk: engelsk, kinesisk, spansk, arabisk, hindi, portugisisk, japansk, koreansk, fransk, tysk, russisk og mer.', 'Sørøstasiatiske språk: thai, vietnamesisk, indonesisk, filippinsk, malaysisk, khmer, lao, burmesisk.', 'Sørasiatiske språk: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Anerkjennelse',
      paragraphs: ['Alle bidragsytere krediteres i vårt depot. Arbeidet ditt hjelper tusenvis av brukere med å få tilgang til ANQR på deres foretrukne språk.', 'Takk til alle våre oversettelsesbidragsytere for å hjelpe til med å gjøre ANQR tilgjengelig over hele verden!'],
    },
    {
      heading: 'Spørsmål?',
      paragraphs: ['Hvis du har spørsmål om å bidra med oversettelser, vennligst åpne et problem på vårt GitHub-lager eller kontakt oss via e-post. Vi hjelper deg gjerne i gang.'],
    },
  ],
};

export default translate;
