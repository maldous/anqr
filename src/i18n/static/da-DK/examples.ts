import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR Eksempler',
  description: 'Fem real-world, produktion-stil eksempler, der viser, hvor QR-koder skaber målelig værdi: Opløfte en ældre detail counter kode, mærkevarer detailbetalinger og "scan- til" handlinger, udskrive skalering fra flyers til billboards, animeret QR til digital skiltning, og tværsprogligt samarbejde ved hjælp af shareable Anchor links. Hvert eksempel omfatter billeder, praktiske begrænsninger og et remix link tilbage til generatoren.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Åbn generatoren', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Gennemse Lær artikler', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Åbn den fulde brugervejledning', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Case Study: Retail Counter QR Uplift',
      paragraphs: ['Dette eksempel fra den virkelige verden følger en lille café, der havde brugt den samme QR-kode på deres disk i tre år. Den originale kode blev genereret hurtigt under pandemien, trykt på standardpapir og smuttede ind i et plastikstativ. Det fungerede stadig - teknisk - men kunderne havde ofte brug for flere forsøg på at scanne det, og det gjorde intet for at forstærke caféens omhyggeligt udformede brandidentitet.', 'Transformationen begyndte med en simpel revision: den eksisterende kode kodede caféens online menu-URL, som de ønskede at beholde. Udfordringen var at få QR\'en til at føles som en del af caféoplevelsen i stedet for et eftertænkt hjælpeprogram fra 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'En vævet QR-kode i et plaststativ med synligt slid, fingeraftryk og falmet tryk',
          caption: 'Udgangspunktet: tre års counter service havde forladt den oprindelige QR knap fungerende',
        },
      ],
    },
    {
      heading: 'Diagnosticering af den oprindelige kodes problemer',
      paragraphs: ['Test afslørede flere problemer: den oprindelige kode, der anvendes Fejl korrektion L (minimum redundans), havde en rolig zone på kun 2 moduler, og blev trykt ved lav opløsning. Under caféen varme wolfram belysning, den allerede falmede sorte moduler knapt kontrastet mod gult papir. Ældre telefoner kæmpede; nyere telefoner lykkedes, men med mærkbar forsinkelse.', 'Ud over tekniske spørgsmål, den generiske sort-og-hvid firkant kommunikerede intet om mærket. Kunderne tøvede før scanningen - en diskret tillidsbarriere, der reducerede engagementet med caféens omhyggeligt designede digitale menu.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Et diagnostisk overlay, der viser den oprindelige QR tekniske mangler: lav ECC, minimal stille zone, dårlig kontrast',
          caption: 'Teknisk analyse, der viser, hvorfor den nedarvede kode undergik realverdens forhold',
        },
      ],
    },
    {
      heading: 'Opløftningsprocessen',
      paragraphs: ['Ved hjælp af ANQR genskabte caféejeren koden med den identiske menu-URL, men dramatisk forbedrede indstillinger: Fejlkorrektion H for maksimal modstandskraft, en 6-moduls stille zone til pålidelig grænsedetektering og mærkefarver (dybe bordeaux-moduler på cremebaggrund), der matchede caféens indvendige palette.', 'Et lille centeroverlay med caféens logo blev tilføjet - holdt bevidst subtilt for at bevare scanbarheden og samtidig give øjeblikkelig brandgenkendelse. Safety Mode bekræftede, at det nye design scannede pålideligt på tværs af testenheder før enhver udskrivning.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR-grænsefladen viser konfigurationen: mærkefarver, passende ECC, generøs stille zone, subtile logo overlay',
          caption: 'Opbygning af den opgraderede konfiguration: Hver indstilling valgt til at balancere mærke udtryk med scanningspålidelighed',
        },
      ],
    },
    {
      heading: 'Målbare resultater',
      paragraphs: ['Efter implementering af den nye QR på professionel mat-lamineret kort lager, caféen sporet resultater over fire uger. Scan succesrate forbedret fra anslået 70% til næsten 100%. Gennemsnitlig scanningstid faldt fra 3-4 sekunder til under 1 sekund. Mest markant, menu engagement steg 40% - kunder, der tidligere kiggede på QR og gav op var nu scanne trygt.', 'Personalet rapporterede færre kundespørgsmål om \'hvordan man bruger QR\'en\' og ikke flere tilfælde af manuel indtastning af URL\'en for frustrerede kunder. Det brandede udseende satte også gang i samtaler, hvor kunderne kommenterede positivt på det sammenhængende design.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A før / efter sammenligning med målinger: scan succesrate, gennemsnitlig scan tid, og ugentlige scan tæller forbedringer',
          caption: 'Fire ugers data, der viser den målelige virkning af en tankevækkende QR opløft',
        },
      ],
    },
    {
      heading: 'Genoprette denne indstilling',
      paragraphs: ['Caféens konfiguration demonstrerer konservativ, men effektiv branding: Fejlkorrektion H, 6-moduls stille zone, mærkefarver med høj kontrast og en minimal overlejring i midten. Denne balance fungerer for de fleste detaildiskanvendelser, hvor pålidelighed skal komme først, men mærketilstedeværelse stadig betyder noget.', 'Åbn generatoren med disse indstillinger forudindlæst og tilpasse farver og overlay til dit eget mærke. Den vigtigste indsigt: pålidelighed forbedringer alene kan dramatisk øge engagement, selv før tilføje nogen visuel styling.', 'Se den relaterede Lær-vejledning om forbedring af eksisterende QR-kampagner for at se den fulde metodologi bag denne tilgang.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link til generatoren forudkonfigureret med caféens indstillinger for øjeblikkelig tilpasning',
          caption: 'Start med en dokumenteret konfiguration og tilpasse til dit mærke',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Gennemse Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Case Study: Multi- Payment Counter Display',
      paragraphs: ['Dette eksempel følger en boutique tøj butik, der havde akkumuleret fem forskellige QR-koder på deres register: bank betaling, tips, Instagram, Google anmeldelser, og en leje link. Hver blev genereret fra en anden kilde, trykt på forskellige tidspunkter, og vises i mismatchede stande. Det visuelle kaos undergravede butikkens omhyggeligt kurerede æstetik, og personalet tog sig regelmæssigt af kunderne og scannede den forkerte kode.', 'Løsningen krævede adskillelse af bekymringer: betalingskoder krævede maksimal pålidelighed med konservativ styling, mens markedsføringskoder kunne være mere ekspressive. Det samlede display system, der opstod, viser, hvordan man kan afbalancere mærkets tilstedeværelse i forhold til de funktionelle krav i forskellige QR-anvendelsestilfælde.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Et rodet register med fem QR-koder i forskellige stande og trykte materialer',
          caption: 'Det kaotiske udgangspunkt: fem frakoblede QR-koder konkurrerer om opmærksomhed og forårsager kundeforvirring',
        },
      ],
    },
    {
      heading: 'Prioritering af betalingsoplevelsen',
      paragraphs: ['Butikkens primære betalingsmetode brugte en regional standard, der krævede streng overholdelse af nyttelast. Test afslørede, at selv mindre styling påvirkede scanningshastigheden med visse bankapps. Beslutningen: Hold betalingen QR fuldstændig uændret bortset fra størrelsesoptimering og professionelt print på mat karton.', 'Denne konservative tilgang betød, at betalingskoden så mindre "mærket" end ideel, men transaktionernes gennemførelsesgrad blev forbedret dramatisk. Indsigt: Betalingsøjeblikke er ikke branding muligheder - de er pålidelighed øjeblikke. Kunderne sætter pris på hastighed og sikkerhed over æstetik, når penge er involveret.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'En ren, stor betaling QR kode på professionel mat kort lager, placeret fremtrædende i registret',
          caption: 'Betalings-QR: generøst størrelse, trykt professionelt, stilet konservativt til øjeblikkelig genkendelse af bankapps',
        },
      ],
    },
    {
      heading: 'Oprettelse af den sekundære handlingsskærm',
      paragraphs: ['For tips, anmeldelser, sociale, og leje, kan butikken være mere udtryksfuld. Disse koder blev regenereret i ANQR med konsekvent mærke styling: butikkens signatur oliven grøn på fløde, afrundet modul stil, og en subtile center overlay med butikkens ikon. Fejlkorrektion H sikret pålidelighed selv med styling.', 'Disse fire koder blev arrangeret i et mærkepanel placeret ved siden af (ikke konkurrerer med) betalingskoden. Klare etiketter i butikkens typografi forklarede hver kodes formål. Det visuelle hierarki var bevidst: betaling stod alene og fremtrædende; sekundære handlinger grupperet sammen som muligheder.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Et brandet panel, der viser fire stilede QR-koder til tips, anmeldelser, sociale medier og ansættelser med tydelige etiketter',
          caption: 'Det sekundære aktionspanel: ensartet branding, klar mærkning, placeret som valgmuligheder snarere end distraktioner',
        },
      ],
    },
    {
      heading: 'Displaysystemdesign',
      paragraphs: ['Den fysiske skærm løste flere problemer samtidigt. Både betalingsstangen og det sekundære panel brugte mat materiale til at fjerne blænding fra overhead belysning. Højderne blev optimeret til kunder af forskellig størrelse. Vinkler rettet mod kunden kø snarere end flad på disken.', 'Kritisk er det, at butikken oprettede reserveudskrifter fra låste ANQR-konfigurationslinks. Da tipskoden til sidst fik kaffesprøjt, udskiftede personalet den inden for få minutter ved hjælp af den gemte konfiguration - ingen skærmbilleder, ingen gæt på indstillinger, ingen kvalitetsforringelse.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Et diagram, der viser det fysiske display layout: højder, vinkler, materialer og forholdet mellem betaling og sekundære skærme',
          caption: 'Displaysystemtegning: fysisk ergonomi optimeret til pålidelig scanning på tværs af kundehøjder og lysforhold',
        },
      ],
    },
    {
      heading: 'Operationelle forbedringer',
      paragraphs: ['Seks uger efter indsættelsen, butikken dokumenteret betydelige forbedringer: nul kunde klager over "forkert kode" forvirring, hurtigere transaktionstider, og en 3x stigning i tip indlæg (kunder kunne nu finde og scanne tip kode uden uforskammet spørger personale). Google anmeldelser også øget som den dedikerede, velmærket QR fjernet friktion.', 'Personaleuddannelsen blev enklere: \'betalingskoden er den store, alt andet er på panelet.\' Da betalingsapps blev opdateret, og en kortvarigt viste langsommere scanning, betød det konservative betalingskodedesign, at det stadig virkede - bare marginalt langsommere i stedet for at fejle fuldstændigt.', 'Se vejledningen Lær om QR-koder til detailbetalinger for principperne bag dette displaysystemdesign.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Et måleinstrumentbræt, der viser før / efter sammenligninger: forvirring, transaktionstid, tipfrekvens, anmeldelser',
          caption: 'Seks ugers operationelle data, der viser den forretningsmæssige virkning af et gennemtænkt multi- QR display system',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Gennemse Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Case Study: Fra business card til Billboard',
      paragraphs: ['Dette eksempel følger et eventproduktionsselskab, der forbereder sig til en større konference. De havde brug for den samme QR-kode - der linkede til begivenhedsappen - udrullet på tværs af radikalt forskellige formater: deltageremblem (3 cm), bordteltkort (8 cm), registreringsbordskilte (30 cm), vejfindende plakater (60 cm) og et massivt scenebaggrundsbanner (4 meter). Hvert format havde forskellige visningsafstande, lysforhold og produktionsarbejdsgange.', 'Udfordringen var ikke kun teknisk – den var operationel. Flere leverandører håndterede forskellige printjob, og virksomheden skulle sikre ensartede, scanbare resultater, uanset hvem der producerede hvad. Deres løsning var centreret om SVG-eksport og streng overdragelsesdokumentation.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'En collage, der viser samme QR-kode fordelt på fem forskellige størrelser, fra skilt til banner',
          caption: 'En QR-kode, fem implementeringsstørrelser: udfordringen med at opretholde scanbarheden fra centimeter til meter',
        },
      ],
    },
    {
      heading: 'Hvorfor tidligere begivenheder havde problemer',
      paragraphs: ['På deres sidste konference havde virksomheden oplevet pinlige fiaskoer. Scenebanneret QR blev genereret som en lille PNG og opskaleret i designsoftware - resultatet så acceptabelt ud på afstand, men kunne ikke scanne pålideligt fra publikum. Badge QR\'er var over-stylede og for små, frustrerende deltagere, der forsøgte at tilføje kontakter. Inkonsekvente indstillinger på tværs af formater betød, at den \'samme\' QR faktisk så anderledes ud på hvert stykke.', 'Efter-begivenhed analyse afslørede den grundlæggende årsag: ingen enkelt kilde til sandhed. Hver designer havde genskabt QR med lidt forskellige indstillinger, og hver printleverandør havde behandlet filer forskelligt. Kvalitet nedbrudt gennem telefonspil fil tømmermænd.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Close- up fotografier viser scanningsfejl: pixelerede bannermoduler, underdimensionerede badge koder, inkonsekvent styling på tværs af formater',
          caption: 'Kritisk analyse af tidligere begivenheder: hvert format havde indført forskellige kvalitetsproblemer',
        },
      ],
    },
    {
      heading: 'SVG-første arbejdsgang',
      paragraphs: ['For denne begivenhed, selskabet etableret en streng protokol: en master QR genereret i ANQR med optimale indstillinger (Fejl Korrektion H, generøs stille zone, ren styling), eksporteret som SVG, og gemt som den eneste autoritative kilde. ANQR konfigurationslinket blev dokumenteret sammen med SVG-filen, så koden kunne regenereres om nødvendigt.', 'Hver designer og sælger modtaget den samme SVG master med udtrykkelige instruktioner: sted på den ønskede størrelse, ikke ændre, opretholde rolige zone clearance. For sælgere, der kræver raster formater, virksomheden leveret præ-gjorde PNGs i specifikke størrelser med klare navngivning konventioner, der angiver påtænkte anvendelse.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'En filpakke, der viser SVG-master, SELSKABSspecifikke PNGs, specifikationsdokument og konfigurationslink',
          caption: 'Overdragelsespakken: alt, hvad leverandørerne havde brug for for at producere ensartede resultater uden at gætte',
        },
      ],
    },
    {
      heading: 'Size-specifikke overvejelser',
      paragraphs: ['Hvert format krævede særlig opmærksomhed. Badge-indsatser på 3 cm havde brug for QR\'en for at optage maksimalt tilgængelig plads - scanningsafstanden ville være armslængde. Bordtelte på 8 cm kan omfatte dekorative rammer uden for den stille zone. 4-meter banneret krævede beregning: fra typisk publikumsafstand (15-20 meter) skulle moduler være tydeligt skelnelige med telefonkameraer, hvilket betød, at QR\'en skulle være mindst 80 cm inden for bannerdesignet.', 'Virksomheden har lavet en størrelsesguide, der dokumenterer minimum QR-dimensioner for hver forventet scanningsafstand. Dette blev et genanvendeligt aktiv til fremtidige begivenheder, hvilket fjernede gætværk fra designprocessen.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Et diagram, der viser forholdet mellem scanningsafstand, minimum QR-størrelse og moduldimensioner for hvert hændelsesformat',
          caption: 'Størrelsesmatrix: beregnede dimensioner, der sikrer pålidelig scanning i hvert format \'forventede synsafstand',
        },
      ],
    },
    {
      heading: 'Produktionsresultater',
      paragraphs: ['Valideringen af konferencedagen var systematisk: personalet testede hver indsat QR, før dørene blev åbnet. Skiltet indsætter scannet øjeblikkeligt på armlængde. Bordtelte arbejdede pålideligt i den variable belysning af breakout rum. Scenebanneret - den forrige begivenheds forlegenhed - scannet med succes fra midten af publikum området.', 'Ingen scanningsklager blev logget på tværs af 2.000 + deltagere. Den operationelle gevinst var lige så betydelig: Når en sidste-minut sponsor tilføjelse krævede ny skiltning, produktionen team genereret det fra master SVG i minutter, sikker på, at det ville matche alt andet.', 'Se Lær-vejledningen om printklare QR-koder til beslutningsrammen for SVG vs PNG og bedste praksis for overdragelse.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Event fotografering viser deltagere vellykket scanning QR-koder i forskellige størrelser og afstande i hele mødestedet',
          caption: 'Konferencedag succes: pålidelig scanning på tværs af alle formater, fra badge closeups til scene banner afstand skud',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Gennemse Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Case Study: Lufthavnslokale Digital Display',
      paragraphs: ['Dette eksempel følger en flyselskabslounge, der havde brugt statiske QR-koder på deres digitale velkomstskærme. Skærmene viste roterende reklameindhold, men QR-koden til lounge check-in sad i et hjørne, statisk og let overset. Analytics viste, at kun 15 % af de kvalificerede gæster brugte QR-indtjekningen, selvom det var hurtigere end skrivebordskøen. De fleste gæster lagde simpelthen ikke mærke til det.', 'Hypotesen var enkel: I et visuelt travlt miljø med bevægende indhold bliver en statisk QR usynlig. Løsningen er nødvendig for at gøre QR\'en mærkbar uden at gå på kompromis med den pålidelighed, der kræves for et check-in flow, hvor fejl ville betyde frustrerede rejsende og længere skrivebordskøer.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'En digital skærm i en lufthavn lounge, der viser salgsfremmende indhold med en lille, statisk QR-kode i hjørnet',
          caption: 'Den oprindelige setup: en statisk QR tabt i et hav af dynamisk salgsfremmende indhold, opnå kun 15% vedtagelse',
        },
      ],
    },
    {
      heading: 'Designer sikker animering',
      paragraphs: ['Loungens digitale skiltning brugte store LED-paneler - et udfordrende miljø, hvor aggressiv animation kunne skabe scanningsproblemer. Designteamet startede konservativt: en blid pulseffekt, der subtilt udvidede og fortrak QR\'ens visuelle tilstedeværelse uden at ændre den faktiske kodestruktur. Frame timing blev sat langsomt (250ms) for at undgå flimren problemer med LED opdateringshastigheden.', 'Valideringen af sikkerhedstilstanden bekræftede, at alle rammer kan scannes. Yderligere test på de faktiske LED paneler afslørede, at pulsen skulle være endnu mere subtile end desktop forhåndsvisninger foreslået - LED lysstyrke og visning vinkler påvirket opfattes kontrast mere end forventet.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR-animationsindstillingspanelet viser pulskonfiguration: langsom timing, subtil intensitet, sikkerhedstilstand aktiveret',
          caption: 'Animation konfiguration: parametre tunet til LED panel display, mens opretholde scanningen pålidelighed i hver ramme',
        },
      ],
    },
    {
      heading: 'Integration med signageindhold',
      paragraphs: ['Den animerede QR var placeret i en dedikeret \'stabil zone\' af skærmen layout - et område, der forblev konstant, mens salgsfremmende indhold roteret i de vigtigste display område. Denne adskillelse var afgørende: QR nødvendig visuel stabilitet til scanning, selv mens tiltrække opmærksomhed gennem sin subtile animation.', 'En tydelig opfordring til handling blev tilføjet ved siden af QR\'en: \'Spring køen over - scan for at tjekke ind.\' Teksten forblev statisk, mens QR\'en pulserede, hvilket skabte et visuelt hierarki, der trak øjet til scanningsmuligheden uden at overvælde det salgsfremmende indhold.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'En skærm layout diagram viser den animerede QR i en stabil zone, mens salgsfremmende indhold roterer i hovedområdet',
          caption: 'Screen fast ejendom tildeling: den animerede QR indtager en stabil zone adskilt fra roterende salgsfremmende indhold',
        },
      ],
    },
    {
      heading: 'Teknisk implementering',
      paragraphs: ['Den animerede QR blev eksporteret som en GIF med optimerede indstillinger for skiltning CMS. Filstørrelsesovervejelser var vigtige - loungens indholdsstyringssystem havde uploadgrænser, og alt for store filer forårsagede hakkende afspilninger. Den endelige eksport afbalancerede visuel kvalitet i forhold til filstørrelsen ved at begrænse farvepaletten og optimere antal billeder.', 'Implementering omfattede en fallback: hvis GIF undlod at spille af en eller anden grund, skiltning system ville vise en statisk PNG backup. Denne redundans sikrede checkin kapacitet blev aldrig tabt på grund af tekniske problemer med animation.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'En CMS grænseflade, der viser den animerede QR upload med fallback statisk billede konfigureret',
          caption: 'Signal CMS konfiguration: animeret primær med statisk fall back sikrer check-in kapacitet aldrig afbrydes',
        },
      ],
    },
    {
      heading: 'Målt virkning',
      paragraphs: ['Efter en måneds drift, QR check-in adoption steg fra 15% til 24% - en 60% relativ forbedring. Gæstetilbagemeldinger viste, at den animerede QR var \'lettere at bemærke\' og \'følte sig mere moderne\'. Deskekøetiden faldt målbart i spidsbelastningsperioder, da flere gæster serverede selv via QR.', 'Vigtigt, ingen scanningsfejl blev rapporteret på trods af tusindvis af daglige scanninger. Den konservative animation tilgang havde opnået opmærksomhed mål uden at ofre den pålidelighed en check-in flow krævede. Loungen efterfølgende rullet ud lignende animerede QR \'er til deres andre steder.', 'Se Lær-guiden om animerede QR-koder til digital skiltning for de tekniske principper bag sikkert animationsdesign.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Et instrumentbræt, der viser en stigning i adoptionshastigheden, en reduktion af køens tid og en scanningspålidelighed med zero-fejl i implementeringsperioden',
          caption: 'En måneds data: 60% adoption stigning, reduceret kø gange, og opretholdt perfekt scanning pålidelighed',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Gennemse Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Case Study: Global produkt lancering QR kampagne',
      paragraphs: ['Dette eksempel følger en forbrugerelektronikvirksomhed, der lancerer et nyt produkt samtidigt på 12 markeder på 8 sprog. Hvert regionalt marketingteam skulle producere emballage, detaildisplays og salgsfremmende materialer med QR-koder, der linker til lokaliserede produktsider. Tidligere lanceringer havde resulteret i inkonsekvent QR-styling, lejlighedsvise scanningsfejl og et "telefonspil" med konfigurationsdrift, da hvert hold genskabte koder fra skærmbilleder.', 'Løsningen gearede ANQR \'s delelige konfiguration links til at etablere en enkelt kilde til sandhed, at hvert regionalt hold kunne få adgang, uanset deres interface sprog. QR nyttelasten brugte en smart omdirigering, der detekterede brugersproget, så en kode fungerede globalt og leverede lokale oplevelser.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Et verdenskort med 12 markedsplaceringer med QR-koder, nogle visuelt uforenelige med hinanden',
          caption: 'Udfordringen: 12 markeder, 8 sprog og en historie med inkonsekvente QR implementeringer på tværs af regioner',
        },
      ],
    },
    {
      heading: 'Oprettelse af masterkonfiguration',
      paragraphs: ['Det globale brandteam skabte den autoritative QR-konfiguration i ANQR: mærkefarver, der matcher produktlinjens visuelle identitet, Error Correction H for pålidelighed på tværs af alle print og digitale applikationer, og styling, der ville reproducere konsekvent uanset lokale produktionsmetoder. Konfigurationen blev låst, og delelinket blev dokumenteret i den globale kampagneoversigt.', 'Kritisk, den kodede URL brugt et sprog-detektere omdirigering service. Når scannet, brugere blev automatisk omdirigeret til deres lokale sprog produkt side. Dette betød, at alle 12 markeder kunne bruge identiske QR-koder - ingen variationer i nyttelast på markedet, der kunne indføre fejl.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR-grænsefladen, der viser hovedkonfigurationen med mærkefarver, ECC H og den smarte omdirigerede URL',
          caption: 'Master konfiguration: globale brand standarder kodet ind i en enkelt, delelig kilde til sandhed',
        },
      ],
    },
    {
      heading: 'Regional Team Workflow',
      paragraphs: ['Hvert regionalt marketinghold modtog konfigurationslinket med enkle instruktioner: Åbn linket, verificer forhåndsvisningen matcher mærkets retningslinjer, eksport i det ønskede format til din ansøgning. Den ANQR interface vises i hvert holds foretrukne sprog, men de underliggende QR indstillinger forblev identiske uanset interface sprog.', 'Da det japanske team havde brug for SVG til avancerede detailskærme, og det brasilianske team havde brug for PNG til sociale medier, blev begge eksporteret fra den samme konfiguration. Når det tyske teams printleverandør anmodede om specifikke farveværdier, kunne de referere til konfigurationen direkte i stedet for at gætte fra et skærmbillede.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Skærmbilleder, der viser det samme konfigurationslink åbnet i japanske, portugisiske og tyske grænseflader',
          caption: 'Samme konfiguration, forskellige grænseflader: Regionale hold arbejder i deres foretrukne sprog, samtidig med at den globale sammenhæng bevares',
        },
      ],
    },
    {
      heading: 'Håndtering af regionale variationer',
      paragraphs: ['Nogle markeder krævede mindre tilpasninger. Det kinesiske team havde brug for en version med en WeChat-optimeret ramme til social deling. I stedet for at ændre masteren skabte de en dokumenteret variant med sit eget konfigurationslink, tydeligt mærket som \'CN-WeChat-variant\' i kampagneaktivbiblioteket. Dette bibeholdt sporbarheden og muliggjorde samtidig nødvendig lokalisering.', 'Mærketeamet indførte en simpel regel: Enhver variation fra master krævede et nyt dokumenteret konfigurationslink. Ingen ændringer til eksporterede filer, ingen "hurtige rettelser" i design software. Dette forhindrede den konfiguration drift, der havde plaget tidligere lanceringer.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'En grænseflade til aktivbiblioteket, der viser masterkonfigurationen og godkendte regionale varianter, hver med sit eget link',
          caption: 'Kampagne forvaltning af aktiver: master konfiguration plus dokumenterede varianter, alle sporbar via konfigurationslinks',
        },
      ],
    },
    {
      heading: 'Start resultater',
      paragraphs: ['Produkt lanceringen dag så QR koder indsat på tværs af emballage, detaildisplays, begivenhed materialer, og digitale kampagner på alle 12 markeder samtidig. Kvalitetskontrol bekræftede visuel konsistens på tværs af regioner - QR på Tokyo detaildisplays matchede QR på São Paulo emballage matchede QR på Berlin event bannere.', 'Nul scanningsfejl blev rapporteret på tværs af markeder. Når en post- lancering produkt side URL ændring var nødvendig, omdirigering service håndteret det usynligt - ingen genudskrivning kræves. Det globale team anslog konfigurationsforbindelsesmetoden sparet 40 + timers koordinationstid sammenlignet med deres tidligere lanceringsmetode.', 'Se Lær-vejledningen om tværsproget QR-samarbejde for at se arbejdsprocesprincipperne bag global kampagnekonsistens.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Et gitter af fotografier, der viser konsekvent QR implementering på forskellige markeder: Tokyo detailhandel, São Paulo emballage, Berlin begivenheder',
          caption: 'Global sammenhæng opnået: identisk QR præsentation på 12 markeder på trods af forskellige sprog, leverandører og formater',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Gennemse Lær artikler',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Gennemse Lær artikler', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Åbn den fulde brugervejledning', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Åbn galleriet', type: 'gallery' },
  ],
};
