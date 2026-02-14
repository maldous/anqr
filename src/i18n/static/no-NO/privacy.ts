import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Personvernerklæring',
  description: 'Informasjon ANQR samler inn, hvordan den brukes, og dine rettigheter i henhold til gjeldende personvernlover.',
  lastUpdated: '1. februar 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Vilkår for bruk', type: 'external' }],
  sections: [
    {
      heading: 'Sammendrag',
      paragraphs: ['ANQR er en QR-kodegenerator med en klient-første tilnærming. Vi krever ikke at du oppretter en konto. Som standard genereres QR-koder lokalt i nettleseren din - vi har ikke tilgang til innholdet du koder.', 'For profesjonell bruk tilbyr ANQR en server-side API som genererer QR-koder fra URL-parametere. Når du bruker API, behandles QR-innholdet ditt på våre servere for å gjengi bildet, men lagres eller logges ikke.', 'Vi bruker Google AdSense til reklame og kan bruke analysetjenester. Disse tjenestene samler inn informasjon gjennom informasjonskapsler og lignende teknologier. Denne policyen forklarer hvilke data som samles inn, hvordan de brukes og dine rettigheter.'],
    },
    {
      heading: 'Informasjon vi samler inn',
      bullets: ['Informasjon du gir: Hvis du kontakter oss via e-post eller kontaktskjemaet vårt, samler vi inn ditt navn, e-postadresse og innhold i meldingen.', 'Innsamlet informasjon automatisk: Vår hostingleverandør (Netlify), reklamepartnere og analysetjenester kan samle inn: IP-adresse, nettlesertype og versjon, operativsystem, enhetstype, henvisning URL, sider besøkt, tid på stedet og omtrentlig geografisk plassering.', 'Tredjeparts cookies: Våre reklamepartnere (Google AdSense) bruker informasjonskapsler og lignende teknologier til å betjene og måle annonser. ANQR selv angir ingen førsteparts cookies.'],
    },
    {
      heading: 'Cookies og tredjeparts teknologier',
      paragraphs: ['ANQR setter ingen førsteparts informasjonskapsler. Preferansene dine (som mørk modus) lagres lokalt på enheten din, som ikke overføres til noen server.', 'Våre reklamepartnere (Google AdSense) og hostingleverandør kan imidlertid bruke informasjonskapsler og lignende sporingsteknologier:'],
      bullets: ['Annonseinformasjonskapsler (tredjepart): Angitt av Google AdSense og annonsepartnere for å vise relevante annonser, måle annonseresultater og forstå brukerinteresser. Disse informasjonskapslene kan spore aktiviteten din på tvers av forskjellige nettsteder.', 'Analytics-informasjonskapsler (tredjepart): Kan brukes av vår vertsleverandør eller analysetjenester for å samle inn anonymiserte bruksdata.'],
    },
    {
      heading: 'Google AdSense og reklame',
      paragraphs: ['Vi viser annonser gjennom Google AdSense. Google og dens partnere bruker informasjonskapsler til å betjene annonser basert på din nettleserlogg på dette nettstedet og andre nettsteder (interessebasert annonsering).', 'Finn ut hvordan Google bruker informasjonen din: https://policies.google.com/technologies/partner-sites', 'Handle annonse personalisering: https://adssettings.google.com', 'Åpne via Network Advertising Initiative: https://optout.networkadvertising.org', 'Åpne via Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Hvordan vi bruker informasjon',
      bullets: ['For å svare på dine henvendelser og gi støtte.', 'Å vise relevante annonser gjennom våre reklamepartnere.', 'For å analysere bruk av nettstedet og forbedre tjenestene våre.', 'Å oppdage, forhindre og håndtere svindel, misbruk og sikkerhetsproblemer.', 'Å overholde juridiske forpliktelser.'],
    },
    {
      heading: 'Tredjepartstjenester',
      bullets: ['Google AdSense: Mottar data for å vise og måle annonser.', 'Analytiske leverandører: Få anonymiserte bruksdata.', 'Netlify (vert): Prosessforespørsler og kan logge IP-adresser.', 'Vi selger ikke din personlige informasjon. Imidlertid kan deling av data med annonsepartnere betraktes som et "salg" under CCPA (se nedenfor).'],
    },
    {
      heading: 'Databevaring',
      bullets: ['Kontaktinnlegg: Opp til 2 år.', 'Serverlogger: Opp til 30 dager (vertsleverandør).', 'Analytiske data: Opp til 26 måneder (anonymt).', 'Reklamecookies: Vanligvis 13 måneder (varer etter partner).'],
    },
    {
      heading: 'Dine rettigheter under GDPR (EØS-brukere)',
      paragraphs: ['Hvis du er i Det europeiske økonomiske samarbeidsområdet, har du følgende rettigheter i henhold til den generelle personvernforordningen:'],
      bullets: ['Rett til tilgang: Be om en kopi av personopplysninger vi har om deg.', 'Rett til rettelse: Be om rettelse av unøyaktige data.', 'Rett til å slette: Be om sletting av dataene dine (" rett til å bli glemt").', 'Rett til å begrense behandlingen: Begrensninger for hvordan vi bruker dataene dine.', 'Rett til dataportabilitet: Be om dine data i et bærbar format.', 'Rett til å protestere: Objekt mot behandling, inkludert direkte markedsføring.', 'Rett til å trekke tilbake samtykke: Trekk tilbake samtykke når som helst der behandling er samtykkebasert.', 'Rett til å klage: Oppgi en klage til datatilsynet.'],
    },
    {
      heading: 'GDPRs juridiske grunnlag',
      paragraphs: ['Vi behandler data på disse grunnlagene: (a) Samtykke - for personlig tilpasset annonsering (administrert av våre annonsepartnere); (b) Legitime interesser - for analyser, sikkerhet og forbedring; (c) Kontrakt - for å svare på henvendelser.', 'For å utøve dine rettigheter, kontakt email@anqr.link. Vi svarer innen 30 dager.'],
    },
    {
      heading: 'Dine rettigheter under CCPA (California-brukere)',
      bullets: ['Rett til å vite: Be om informasjon om innsamlede data, kilder, formål og tredjeparter.', 'Rett til å slette: Be om sletting av dine personopplysninger.', 'Rett til å velge ut: Opt ut av salget av personopplysninger (deling med annonsepartnere kan kvalifiseres).', 'Rett til ikke-diskriminering: Vi vil ikke diskriminere dine rettigheter.'],
    },
    {
      heading: 'CCPA kategorier samlet',
      paragraphs: ['Kategorier: Identifikasjoner (IP-adresse, enhets-ID), Internett-aktivitet (browsing, annonseinteraksjoner), Geolocation (approximat), Inferenser (interesser fra surfing).', 'For å utøve rettigheter eller velge ut: email@anqr.link eller justere informasjonskapselinnstillingene.'],
    },
    {
      heading: 'Internasjonal overføring',
      paragraphs: ['Informasjonen kan overføres til land med ulike databeskyttelseslover, inkludert USA. Vi bruker passende sikkerhetstiltak som standard kontraktsklausuler.'],
    },
    {
      heading: 'Barns personvern',
      paragraphs: ['ANQR er ikke rettet mot barn under 13 år (eller 16 i EØS). Vi samler ikke bevisst inn data fra barn. Kontakt email@anqr.link hvis du tror et barn har gitt informasjon.'],
    },
    {
      heading: 'Sikkerhet',
      paragraphs: ['Vi bruker passende tekniske og organisatoriske tiltak for å beskytte data, inkludert HTTPS-kryptering. Imidlertid er ingen internettoverføring 100 % sikker.'],
    },
    {
      heading: 'Ikke spor',
      paragraphs: ['Vi ærer ikke spor nettlesersignaler der det er mulig, men reklamepartnere kan ikke svare på DNT.'],
    },
    {
      heading: 'Endringer i denne politikken',
      paragraphs: ['Vi kan oppdatere disse retningslinjene regelmessig. Den siste oppdaterte datoen indikerer den siste revisjonen. Betydelige endringer kan kommuniseres via et nettstedsbanner.'],
    },
    {
      heading: 'Kontakt oss',
      paragraphs: ['For personvernspørsmål eller å utøve dine rettigheter: email@anqr.link eller bruk vår kontaktside. Vi svarer på personvernforespørsler innen 30 dager.'],
    },
    {
      heading: 'Fullstendig personvernerklæring',
      paragraphs: ['Denne siden gir et sammendrag av vår personvernpraksis. For den fullstendige, juridisk bindende personvernerklæringen med fullstendige detaljer om databehandling, dine rettigheter og våre forpliktelser i henhold til GDPR, CCPA og andre personvernlover, vennligst se våre fullstendige retningslinjer hostet av iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Se hele personvernreglene på iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
