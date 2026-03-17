import type { PageDefinition } from "../types";

export const privacy: PageDefinition = {
  title: "Privacy Policy",
  description:
    "Information ANQR indsamler, hvordan det bruges, og dine rettigheder i henhold til gældende love om beskyttelse af personlige oplysninger.",
  lastUpdated: "1. februar 2026",
  relatedLinks: [{ href: "/terms?lang=${lang}", label: "Tjenestevilkår", type: "external" }],
  sections: [
    {
      heading: "Oversigt",
      paragraphs: [
        "ANQR er en QR kode generator med en klient- første tilgang. Vi kræver ikke, at du opretter en konto. Som standard genereres QR-koder lokalt i din browser - vi har ikke adgang til det indhold, du indkoder.",
        "Til professionel brug leverer ANQR en server-side API, der genererer QR-koder fra URL-parametre. Når du bruger API'en, behandles dit QR-indhold på vores servere for at gengive billedet, men det gemmes eller logges ikke.",
        "Vi bruger Google AdSense til reklame og kan bruge analysetjenester. Disse tjenester indsamler information gennem cookies og lignende teknologier. Denne politik forklarer, hvilke data der indsamles, hvordan det anvendes, og dine rettigheder.",
      ],
    },
    {
      heading: "Oplysninger, vi indsamler",
      bullets: [
        "Oplysninger, du giver: Hvis du kontakter os via e-mail eller vores kontakt formular, vi indsamle dit navn, e-mail-adresse, og besked indhold.",
        "Automatisk indsamlede oplysninger: Vores hosting udbyder (Netlify), reklame partnere, og analytics-tjenester kan indsamle: IP-adresse, browser type og version, operativsystem, enhed type, henviser URL, sider besøgte, tid på stedet, og omtrentlig geografisk placering.",
        "Third-party cookies: Vores reklamepartnere (Google AdSense) bruger cookies og lignende teknologier til at tjene og måle reklamer. ANQR selv ikke indstille nogen førstegangscookies.",
      ],
    },
    {
      heading: "Cookies og tredjepartsteknologier",
      paragraphs: [
        "ANQR sætter ikke førstegangscookies. Dine præferencer (såsom mørk tilstand) gemmes lokalt på din enhed, som ikke overføres til nogen server.",
        "Vores reklamepartnere (Google AdSense) og hosting udbyder kan dog bruge cookies og lignende tracking teknologier:",
      ],
      bullets: [
        "Reklamecookies (tredjepart): Sæt af Google AdSense og annonce partnere til at tjene relevante annoncer, måle annonce ydeevne, og forstå brugerinteresser. Disse cookies kan spore din aktivitet på tværs af forskellige hjemmesider.",
        "Analytiske cookies (tredjeparts): Kan bruges af vores hosting udbyder eller analytics tjenester til at indsamle anonymiserede brugerdata.",
      ],
    },
    {
      heading: "Google AdSense og reklame",
      paragraphs: [
        "Vi viser annoncer via Google AdSense. Google og dets partnere bruger cookies til at servere annoncer baseret på din browserhistorik på dette websted og andre hjemmesider (interest-based reklame).",
        "Lær, hvordan Google bruger dine oplysninger: https: / / politi.google.com / technologies / partner- sites",
        "I henhold til artikel 14, stk. 1, i forordning (EU) nr. 1380 / 2013 skal en medlemsstat:",
        "Opt out via Network Advertising Initiative: https: / / optout.networkannoncing.org",
        "Opt out via Digital Advertising Alliance: https: / / optout.abouts.info",
      ],
    },
    {
      heading: "Hvordan vi bruger information",
      bullets: [
        "At svare på dine forespørgsler og yde støtte.",
        "At vise relevante reklamer gennem vores annonceringspartnere.",
        "At analysere brugen af webstedet og forbedre vores tjenester.",
        "At opdage, forebygge og håndtere svig, misbrug og sikkerhedsspørgsmål.",
        "At overholde retlige forpligtelser.",
      ],
    },
    {
      heading: "Tjenester ydet af tredjemand",
      bullets: [
        "Google AdSense: Modtager data til at tjene og måle reklamer.",
        "Analytiske leverandører: Modtag anonymiserede brugsdata.",
        "Netlify (vært): Behandler anmodninger og kan logge IP-adresser.",
        'Vi sælger ikke dine personlige oplysninger. Men deling af data med reklamepartnere kan betragtes som et "salg" under CCPA (se nedenfor).',
      ],
    },
    {
      heading: "Dataopbevaring",
      bullets: [
        "Kontaktindlæg: Op til 2 år.",
        "Serverlogfiler: Op til 30 dage (hosting udbyder).",
        "Analytiske data: Op til 26 måneder (anonymiseret).",
        "Reklamecookies: Typisk 13 måneder (varierer efter partner).",
      ],
    },
    {
      heading: "Dine rettigheder i henhold til GDPR (EØS-brugere)",
      paragraphs: [
        "Hvis du befinder dig i Det Europæiske Økonomiske Samarbejdsområde, har du følgende rettigheder i henhold til den generelle databeskyttelsesforordning:",
      ],
      bullets: [
        "Adgangsret: Anmoder om en kopi af personlige oplysninger om dig.",
        "Ret til berigtigelse: Anmoder om rettelse af unøjagtige oplysninger.",
        'Ret til sletning: Anmoder om sletning af dine data ("ret til at blive glemt").',
        "Ret til at begrænse behandlingen: Anmod om grænser for, hvordan vi bruger dine data.",
        "Ret til dataportabilitet: Bed om dine data i et bærbart format.",
        "Ret til indsigelse: Indsigelse mod behandling, herunder til direkte markedsføring.",
        "Ret til at trække sit samtykke tilbage: Tilbagekaldelse af samtykke på et hvilket som helst tidspunkt, hvor behandlingen er samtykke- baseret.",
        "Retten til at indgive klage: Send en klage til din databeskyttelsesmyndighed.",
      ],
    },
    {
      heading: "GDPR retsgrundlag",
      paragraphs: [
        "Vi behandler data på disse baser: (a) Samtykke - til personlig reklame (forvaltes af vores annonceringspartnere); (b) Legitimative interesser - til analyse, sikkerhed og forbedring; (c) Kontrakt - til at besvare forespørgsler.",
        "For at udøve dine rettigheder, kontakt email@anqr.link. Vi svarer inden for 30 dage.",
      ],
    },
    {
      heading: "Dine rettigheder under CCPA (California-brugere)",
      bullets: [
        "Ret til at vide: Anmoder om oplysninger om indsamlede data, kilder, formål og tredjeparter.",
        "Ret til at slette: Anmoder om sletning af dine personlige oplysninger.",
        'Ret til opt- out: Undtaget fra "salg" af personlige oplysninger (deling med annoncepartnere kan kvalificere sig).',
        "Ret til ikke-forskelsbehandling: Vi vil ikke diskriminere for at udøve dine rettigheder.",
      ],
    },
    {
      heading: "CCPA-kategorier indsamlet",
      paragraphs: [
        "Kategorier: Identifikatorer (IP-adresse, enhedsidentifikation), internetaktivitet (browsing, annonce-interaktioner), geografisk beliggenhed (omtrentlig), Intentioner (interesser fra browsing).",
        "At udøve rettigheder eller fravælge: $_ _ ANQR _ PH _ 0 _ _ eller justere cookie indstillinger.",
      ],
    },
    {
      heading: "Internationale overførsler",
      paragraphs: [
        "Dine oplysninger kan overføres til lande med forskellige databeskyttelseslove, herunder USA. Vi bruger passende sikkerhedsforanstaltninger som standard kontraktbestemmelser.",
      ],
    },
    {
      heading: "Børns privatliv",
      paragraphs: [
        "ANQR er ikke rettet mod børn under 13 år (eller 16 i EØS). Vi indsamler ikke bevidst data fra børn. Kontakt $_ _ ANQR _ PH _ 0 _ hvis du mener, at et barn har givet oplysninger.",
      ],
    },
    {
      heading: "Sikkerhed",
      paragraphs: [
        "Vi bruger passende tekniske og organisatoriske foranstaltninger til at beskytte data, herunder HTTPS kryptering. Men ingen internet transmission er 100% sikker.",
      ],
    },
    {
      heading: "Ikke spor",
      paragraphs: [
        "Vi ære Do Not Track browser signaler, hvor det er muligt, selvom reklame partnere kan ikke reagere på DNT.",
      ],
    },
    {
      heading: "Ændringer i denne politik",
      paragraphs: [
        'Vi kan opdatere denne politik med jævne mellemrum. Datoen "Senest opdateret" angiver den seneste revision. Væsentlige ændringer kan meddeles via et websted banner.',
      ],
    },
    {
      heading: "Kontakt os",
      paragraphs: [
        "For spørgsmål om privatliv eller for at udøve dine rettigheder: email@anqr.link eller brug vores kontaktside. Vi besvarer anmodninger om privatliv inden for 30 dage.",
      ],
    },
    {
      heading: "Fuld privatlivspolitik",
      paragraphs: [
        "Denne side giver en oversigt over vores privatlivspraksis. For den komplette, juridisk bindende privatlivspolitik med alle detaljer om databehandling, dine rettigheder og vores forpligtelser i henhold til GDPR, CCPA og anden privatlivslovgivning, se venligst vores fulde politik hostet af iubenda.",
      ],
      links: [
        {
          href: "https://www.iubenda.com/privacy-policy/70266922",
          label: "Se den fulde privatlivspolitik på iubenda",
          type: "external",
        },
      ],
    },
  ],
};

export default privacy;
