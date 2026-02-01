import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Tjenestevilkår',
  description: 'Ved at få adgang til eller bruge webstedet, accepterer du at være bundet af disse vilkår.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Privacy Policy', type: 'external' }],
  sections: [
    {
      heading: 'Accept af udtryk',
      paragraphs: ['Ved at få adgang til eller bruge ANQR (anqr.link), accepterer du at være bundet af disse Servicevilkår og vores fortrolighedspolitik. Hvis du ikke accepterer disse vilkår, skal du ikke bruge webstedet.', 'Vi kan opdatere disse vilkår fra tid til anden. Fortsat brug af grunden efter ændringer udgør accept af de nye vilkår.'],
    },
    {
      heading: 'Støtteberettigelse',
      paragraphs: ['Du skal være mindst 13 år for at bruge ANQR. Ved at bruge siden erklærer du, at du opfylder dette alderskrav. Hvis du er under 18 år, repræsenterer du, at du har din forælders eller værges tilladelse til at bruge siden.'],
    },
    {
      heading: 'Tilladt anvendelse',
      paragraphs: ['Du må kun bruge ANQR til lovlige formål. Du er alene ansvarlig for det indhold, du koder til QR-koder, og for hvordan du bruger de QR-koder, du genererer.'],
    },
    {
      heading: 'Forbudte handlinger',
      paragraphs: ['Du accepterer ikke at:'],
      bullets: ['Brug ANQR til at oprette QR-koder, der letter phishing, malware distribution, svig, svindel, chikane, ærekrænkelse, eller enhver ulovlig aktivitet.', 'Indkode indhold, der krænker intellektuelle ejendomsrettigheder, krænker privatlivets fred, eller indeholder ulovligt materiale.', 'Forsøg at forstyrre, overbelaste eller forstyrre driften eller sikkerheden på stedet.', 'Omvendt ingeniør, dekompilere, eller forsøge at udtrække kildekode fra webstedet.', 'Brug automatiserede værktøjer (bots, skrabere) til at få adgang til webstedet på en måde, der forringer andre brugeres ydeevne.', 'Omkreds eller deaktivere eventuelle sikkerheds- eller adgangskontrolfunktioner.', 'Udgive enhver person eller enhed eller misrepræsentere din tilknytning.'],
    },
    {
      heading: 'Intellektuel ejendomsret',
      paragraphs: ['Du bevarer ejendomsretten til det indhold, du indkoder i QR-koder. ANQR gør ikke krav på ejerskab af dine data.', 'Den ANQR navn, logo, interface design, og underliggende kode er beskyttet af ophavsret, varemærke, og andre intellektuelle ejendomsrettigheder love. Du må ikke kopiere, ændre, distribuere eller oprette afledte værker uden vores tilladelse.', 'QR Code ® er et registreret varemærke tilhørende DENSO WAVE INCORPOREED. ANQR er ikke tilknyttet DENSO WAVE.'],
    },
    {
      heading: 'Brugerindholdslicens',
      paragraphs: ['Ved at bruge ANQR giver du os ingen rettigheder til dit indhold. Når du bruger lokal generation (standard), alle QR kode generation sker i din browser, og vi ikke adgang, gemme, eller sende dine kodede data.', 'Når du bruger serverside API, dit indhold er behandlet til at generere QR-billedet, men er ikke gemt, logget eller bruges til noget andet formål end at gøre det ønskede billede.'],
    },
    {
      heading: 'Tredjepartstjenester og reklame',
      paragraphs: ['Siden viser annoncer gennem Google AdSense og kan indeholde links til tredjepartswebsteder. Vi er ikke ansvarlige for tredjepartsindhold, tjenester eller privatlivspraksis.', 'Dine interaktioner med annoncører og tredjeparter er udelukkende mellem dig og dem. Se vores privatlivspolitik for oplysninger om praksis for annonceringsdata.'],
    },
    {
      heading: 'Ansvarsfraskrivelse af garantier',
      paragraphs: ['ANQR ER FASTSAT PÅ ET "SOM ER" OG "SOM BRUGBAR" BASIS UDEN NOGEN FORM FOR BESKYTTELSE, UNDTAGELSE ELLER INDFØRT, HERUNDER, MEN IKKE BEGRÆNSET TIL AT INDVIRKE PÅ OMRÅDER MED HANDELSMULIGHEDER, SIKKERHED TIL ET SÆRLIGT FORMÅL, OG NONSVINDEL.', 'Vi garanterer ikke, at: (a) webstedet vil være uafbrudt, sikker eller errorfri; (b) QR-koder vil scanne i alle miljøer, på alle enheder, eller med alle scanningsprogrammer; (c) webstedet vil opfylde dine krav.', 'Du bør altid teste QR-koder under de forhold, hvor de vil blive brugt (udskriftsstørrelse, belysning, skærmtype, afstand, kamerakvalitet).'],
    },
    {
      heading: 'Begrænsning af ansvar',
      paragraphs: ['TIL DE MAKSI MALE SAGKYNDIGE, DER ER UDPEGET I HENHOLD TIL LOV, LOVE OG ADMINISTRATIVE BESTEMMELSER, SAMT TIL DERES STEDFORTRÆDERE, ADVOKATER OG AUTORISATORER, ER DER IKKE ADGANG TIL NOGEN FORM FOR DIREKTE, INDIRECT, INCIDENTAL, SÆRLIG, KONFESSIONELLE, FAMILIEMÆSSIGE ELLER EXCEPTIONELLE DAEMAGER, HERUNDER OGSÅ DAEMMER, DER IKKE HAR NOGET AT GØRE MED TAB AF OVERSKUD, INDTÆGTER, DATA, GOODWILL, BRUG ELLER ANDRE INTANGIBLE TAB, DER ER KNYTTET TIL ELLER KNYTTET TIL DIN ADGANG TIL ELLER BRUG AF (ELLER UEGNETHED TIL ADGANG ELLER BRUG) TJENESTEN.', 'DU FORSTÅR OG ACCEPTERER, AT DIN BRUG AF TJENESTEN ER PÅ DIN SOLRISIKO. SERVICEN ER GRATIS, OG DU ER ENIG I, AT ANKER OG DENS OPERATØRER IKKE HAR NOGET ANSVAR OVER FOR DIG, UANSET OM DER ER TALE OM NOGEN DØDSFALD ELLER TAB. I INTET TILFAELDE KAN DER I ALT INDROEMMES ERSTATNINGSHENSAETTELSER ($0).', 'DU INDVILLIGER I AT FLYTTE, VENTE, OG DEGRADERE ALLE OG ALLE KRAV, DEMANS, OG CAUSES OF ACTION MOD ANQR OG DENS OPERATØRER, DER REPRÆSENTERER FRA DIN BRUG AF TJENESTEN.', 'NOGLE RETSHANDLINGER GØR DET IKKE MULIGT AT UNDTAGE VISSE OMRÅDER ELLER BEGRÆNSNINGER AF ERSTATNINGSANSVAR. VED SÅDANNE DOMME BEGRÆNSES VORES ANSVAR TIL DET MAKSIMALE ANTAL DOMMERE, DER ER UNDERGIVET GÆLDENDE RET.'],
    },
    {
      heading: 'Afgrænsning',
      paragraphs: ['Du accepterer at skadesløsholde, forsvare og holde harmløs ANQR, dets operatører, associerede selskaber og deres respektive officerer, direktører, medarbejdere og agenter fra eventuelle krav, skader, tab, forpligtelser, omkostninger og omkostninger (herunder advokatgebyrer), der opstår ved: (a) din brug af webstedet; (b) din overtrædelse af disse Vilkår; (c) din overtrædelse af tredjeparts rettigheder; (d) ethvert indhold, du indkode i QR-koder.'],
    },
    {
      heading: 'Tvistbilæggelse',
      paragraphs: ['Enhver tvist, der opstår som følge af disse vilkår eller din brug af ANQR skal først søges løst gennem uformelle forhandlinger ved at kontakte $_ _ ANQR _ PH _ 0 _ _.', 'Hvis uformel løsning mislykkes, skal tvister løses gennem bindende voldgift i Victoria, Australien, bortset fra at hver af parterne kan anmode om forbud i retten for krænkelser af intellektuel ejendom.'],
    },
    {
      heading: 'Klasseaktionsdispensation',
      paragraphs: ['DE ER ENIGE OM, AT ENHVER MISFORSTÅET AFVIKLINGSPROCEDURE KUN VIL BLIVE GENNEMFØRT PÅ ET INDIVIDUELT GRUNDLAG OG IKKE I EN CLASS, KONSOLIDERET ELLER REPRÆ SENTATIV HANDLING.'],
    },
    {
      heading: 'Lovvalg',
      paragraphs: ['Disse vilkår er styret af lovene i Victoria, Australien, uden hensyn til konflikt af love principper. Du accepterer den eksklusive jurisdiktion af domstolene i Victoria, Australien.'],
    },
    {
      heading: 'Ændringer og tilgængelighed',
      paragraphs: ['Vi kan ændre, suspendere eller afbryde webstedet (eller en del af det) til enhver tid uden varsel eller ansvar.', 'Vi kan til enhver tid opdatere disse vilkår. Datoen "Senest opdateret" angiver, hvornår de senest blev revideret. Fortsat brug efter ændringer udgør accept.'],
    },
    {
      heading: 'Severability',
      paragraphs: ['Hvis en bestemmelse i disse vilkår er ugyldig eller ikke kan håndhæves, vil denne bestemmelse blive håndhævet i det maksimalt tilladte omfang, og de resterende bestemmelser vil forblive i fuld kraft og virkning.'],
    },
    {
      heading: 'Ophævelse',
      paragraphs: ['Vores manglende håndhævelse af rettigheder eller bestemmelser i disse vilkår betragtes ikke som afkald på sådanne rettigheder eller bestemmelser.'],
    },
    {
      heading: 'Fuldstændig aftale',
      paragraphs: ['Disse vilkår udgør sammen med vores fortrolighedspolitik hele aftalen mellem dig og ANQR om din brug af webstedet og erstatter eventuelle tidligere aftaler.'],
    },
    {
      heading: 'Force majeure',
      paragraphs: ['Vi er ikke ansvarlige for fejl eller forsinkelser i ydeevnen på grund af omstændigheder uden for vores rimelige kontrol, herunder naturkatastrofer, krig, terrorisme, optøjer, regeringshandlinger eller internet-/infrastrukturfejl.'],
    },
    {
      heading: 'Kontakt',
      paragraphs: ['Spørgsmål om disse vilkår kan sendes til: $_ _ _ ANQR _ PH _ 0 _ _'],
    },
  ],
};

export default terms;
