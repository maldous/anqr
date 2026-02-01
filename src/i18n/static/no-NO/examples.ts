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
  description: 'Fem virkelige eksempler i produksjonsstil som viser hvor QR-koder skaper målbar verdi: oppløfting av en eldre tellerkode, merkevarebetalinger og "skanne-til"-handlinger, utskriftsskalering fra flygeblad til reklametavler, animert QR for digital skilting og tverrspråklig samarbeid ved bruk av delbare ankerlenker. Hvert eksempel inkluderer bilder, praktiske begrensninger og en remikskobling tilbake til generatoren.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Åpne generatoren', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Bla gjennom Lær artikler', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Åpne hele brukerveiledningen', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Saksstudie: Retail Counter QR Uplift',
      paragraphs: ['Dette virkelige eksemplet følger en liten kafé som hadde brukt den samme QR-koden på disken i tre år. Den originale koden ble generert raskt under pandemien, trykt på standardpapir og skled inn i et plaststativ. Det fungerte fortsatt – teknisk – men kundene trengte ofte flere forsøk på å skanne det, og det gjorde ingenting for å forsterke kafeens nøye utformede merkeidentitet.', 'Transformasjonen begynte med en enkel revisjon: den eksisterende koden kodet kafeens nettmeny-URL, som de ønsket å beholde. Utfordringen var å få QR-en til å føles som en del av kaféopplevelsen i stedet for et ettertankeverktøy fra 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'En forvitret QR-kode i et plaststativ som viser synlig slitasje, fingeravtrykk og falmet utskrift',
          caption: 'Utgangspunktet: tre års kontratjeneste hadde forlatt den opprinnelige QR knapt funksjonell',
        },
      ],
    },
    {
      heading: 'Diagnostisering av den opprinnelige kodens problemer',
      paragraphs: ['Testing avslørte flere problemer: den opprinnelige koden som ble brukt feilretting L (minimum redundans), hadde en rolig sone på bare 2 moduler, og ble trykt ved lav oppløsning. Under kaféens varme wolframbelysning var de allerede falske svarte modulene knapt i kontrast til det gule papiret. Eldre telefoner kjempet; nyere telefoner lyktes men med merkbar forsinkelse.', 'Utover tekniske problemer, den generiske svart-hvitt firkanten ikke kommunisert noe om merket. Kundene nølte før skanning - en subtil tillitsbarriere som reduserte engasjementet med kaféens nøye designet digitale meny.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'En diagnostisk overlegg som viser den opprinnelige QRs tekniske mangler: lav ECC, minimal rolig sone, dårlig kontrast',
          caption: 'Teknisk analyse avslører hvorfor den arvelige koden underutviklet i virkelige forhold',
        },
      ],
    },
    {
      heading: 'Oppløftingsprosessen',
      paragraphs: ['Ved å bruke ANQR gjenskapte kaféeieren koden med identisk meny-URL, men dramatisk forbedrede innstillinger: Feilretting H for maksimal motstandskraft, en 6-moduls stillesone for pålitelig grensedeteksjon og merkefarger (dyp burgunder-moduler på krembakgrunn) som matchet kafeens interiørpalett.', 'Et lite midtoverlegg med kafeens logo ble lagt til - holdt bevisst subtilt for å opprettholde skanbarhet samtidig som det gir umiddelbar merkegjenkjenning. Sikkerhetsmodus bekreftet den nye designen skannet pålitelig på tvers av testenheter før noen utskrift.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR-grensesnitt som viser konfigurasjonen: merkefarger, passende ECC, sjenerøs stille sone, subtil logooverlegg',
          caption: 'Bygge den oppgraderte konfigurasjonen: hver innstilling valgt for å balansere merkeuttrykk med skanningspålitelighet',
        },
      ],
    },
    {
      heading: 'Målbare resultater',
      paragraphs: ['Etter å ha utplassert den nye QR på profesjonell matt-laminert kort aksje, sporet kaféen resultater over fire uker. Scan suksessrate forbedres fra en estimert 70% til nær-100%. Gjennomsnittlig skanningstid falt fra 3-4 sekunder til under 1 sekund. Mest betydelig økte menuen engasjement 40% - kunder som tidligere hadde sett på QR og gitt opp var nå skanning trygt.', 'Personalet rapporterte færre kundespørsmål om "hvordan bruke QR-en" og ingen flere tilfeller av manuell inntasting av URL-en for frustrerte kunder. Det merkede utseendet utløste også samtaler, med kunder som kommenterte positivt på det sammenhengende designet.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A før/etter sammenligning med metrikk: skanne suksessrate, gjennomsnittlig skannetid og ukentlige skannetallsforbedringer',
          caption: 'Fire ukers data som viser den målbare effekten av en tankefull QR-oppløfting',
        },
      ],
    },
    {
      heading: 'Opprett dette konfigurasjonen på nytt',
      paragraphs: ['Kaféens konfigurasjon demonstrerer konservativ, men effektiv merkevarebygging: Feilretting H, 6-modulers stillesone, merkefarger med høy kontrast og minimalt midtoverlegg. Denne balansen fungerer for de fleste skrankeapplikasjoner der pålitelighet må komme først, men tilstedeværelse av merkevarer fortsatt betyr noe.', 'Åpne generatoren med disse innstillingene forhåndslastet og tilpasse farger og overlegg til ditt eget merke. Nøkkelinnsikten er at pålitelighetsforbedringer alene kan øke engasjement dramatisk, selv før du legger til noen visuell styling.', 'Se den relaterte Learn-veiledningen for å forbedre eksisterende QR-kampanjer for hele metodikken bak denne tilnærmingen.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link til generatoren forhåndskonfigurert med kafeens innstillinger for umiddelbar tilpasning',
          caption: 'Start med en velprøvd konfigurasjon og tilpass merkevaren din',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Åpne generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Bla gjennom Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Case study: Multi-Payment Counter Display',
      paragraphs: ['Dette eksempelet følger en boutique klesbutikk som hadde akkumulert fem forskjellige QR-koder på deres register: bankbetaling, tips, Instagram, Google-anmeldelser og en ansettelseslenke. Hver ble generert fra en annen kilde, trykt på forskjellige tidspunkter, og vist i feilaktige stander. Det visuelle kaoset underminerte butikkens nøye kuratert estetisk, og ansatte behandlet regelmessig kunder som skanner feil kode.', 'Løsningen som kreves separering av bekymringer: betalingskoder trengte maksimal pålitelighet med konservativ styling, mens markedsføringskoder kan være mer uttrykkelig. Det forente skjermsystemet som dukket opp viser hvordan man balanserer merkevarens tilstedeværelse mot de funksjonelle kravene i ulike QR-brukstilfeller.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Et rotet registerområde som viser fem feilaktige QR-koder i ulike stativer og trykte materialer',
          caption: 'Kaotisk utgangspunkt: fem frakoblede QR-koder som konkurrerer om oppmerksomhet og forårsaker kundeforvirring',
        },
      ],
    },
    {
      heading: 'Prioritere betalingsopplevelsen',
      paragraphs: ['Butikkens primære betalingsmetode brukte en regional standard som krevde streng etterlevelse av nyttelast. Testing viste at selv mindre styling påvirket skannehastighet med visse bankapps. Beslutningen: Hold betalingen QR helt uendret, bortsett fra størrelsesoptimering og profesjonell utskrift på matt kortlager.', 'Denne konservative tilnærmingen innebar at betalingskoden så mindre «merket» ut enn ideelt, men transaksjonsfullføringsratene forbedret dramatisk. Innsikten: betaling øyeblikk er ikke branding muligheter - de er pålitelige øyeblikk. Kundene setter pris på hastighet og sikkerhet over estetikk når penger er involvert.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'En ren, stor betaling QR-kode på profesjonell matt kortlager, plassert fremtredende på registeret',
          caption: 'Betalings-QR: generøst størrelse, profesjonelt skrevet ut, stilet konservativt for umiddelbar gjenkjennelse av bankapper',
        },
      ],
    },
    {
      heading: 'Oppretter sekundærhandlingsskjermen',
      paragraphs: ['For tips, anmeldelser, sosiale, og ansettelse, kan butikken være mer uttrykkelig. Disse kodene ble regenerert i ANQR med konsistent merkestyling: butikkens signatur olivengrønn på krem, avrundet modulstil og et subtilt senter overlegg med butikkens ikon. Feilretting H sikret pålitelighet selv med styling.', 'Disse fire kodene ble arrangert i et merket panel plassert ved siden av (ikke konkurrere med) betalingskoden. Klare etiketter i butikkens typografi forklarte hver kodes formål. Det visuelle hierarkiet var intensjonelt: betalingen sto alene og fremtredende; sekundære handlinger gruppert sammen som alternativer.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Et merkepanel som viser fire stilede QR-koder for tips, anmeldelser, sosiale medier og ansettelse, med tydelige etiketter',
          caption: 'Det sekundære handlingspanelet: konsekvent merkevarebygging, tydelig merking, plassert som alternativer i stedet for distraksjoner',
        },
      ],
    },
    {
      heading: 'Visningssystemdesign',
      paragraphs: ['Den fysiske skjermen løste flere problemer samtidig. Både betalingsstativet og det sekundære panelet brukte matte materialer for å eliminere gjenskinn fra takbelysning. Høyder ble optimalisert for kunder av varierende statur. Vinkler rettet mot kundekøen i stedet for flatt på disken.', 'Kritisk opprettet lagret reserveutskrifter fra låste ANQR konfigurasjonslenker. Når tipskoden til slutt fikk kaffe-plashed, erstattet personalet det i løpet av minutter ved hjelp av den lagrede konfigurasjonen - ingen skjermbilde, ingen gjetting på innstillinger, ingen kvalitetsnedbrytning.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Et diagram som viser den fysiske visningen: høyder, vinkler, materialer og forholdet mellom betaling og sekundærskjermer',
          caption: 'Skjermsystemplan: fysisk ergonomi optimalisert for pålitelig skanning på tvers av kundehøyder og lysforhold',
        },
      ],
    },
    {
      heading: 'Operasjonelle forbedringer',
      paragraphs: ['Seks uker etter distribusjon dokumenterte butikken betydelige forbedringer: null kundeklager om \\"feilkode\\" forvirring, raskere transaksjonstider og en 3x økning i tip-innsendelser (kunder kan nå finne og skanne tip-koden uten å måtte be ansatte). Googles vurderinger økte også etter hvert som den dedikerte, godt merket QR fjernet friksjon.', 'Personalopplæringen ble enklere: "betalingskoden er den store, alt annet er på panelet." Når betalingsapper oppdaterte og en kort viste langsommere skanning, betydde den konservative betalingskodedesignen at den fortsatt fungerte - bare marginalt tregere i stedet for å feile helt.', 'Se Lær-veiledningen om QR-koder for detaljhandelsbetalinger for prinsippene bak dette skjermsystemdesignet.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'En metrikk dashboard som viser før/etter sammenligninger: forvirring hendelser, transaksjonstid, tip frekvens, gjennomgang innlegg',
          caption: 'Seks ukers driftsdata som demonstrerer forretningspåvirkningen av et tankevekkende multi-QR-skjermsystem',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Åpne generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Bla gjennom Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Case Study: Fra visittkort til Billboard',
      paragraphs: ['Dette eksemplet følger et arrangement produksjonsselskap som forbereder seg på en større konferanse. De trengte den samme QR-koden - kobling til arrangementsappen - utplassert på tvers av radikalt forskjellige formater: deltakermerkeinnlegg (3cm), bordteltekort (8cm), registreringsskrivebord (30cm), wayfinding plakater (60cm) og et massivt scene backdrop banner (4 meter). Hvert format hadde forskjellige visningsavstander, belysningsforhold og produksjonsarbeidsflyter.', 'Utfordringen var ikke bare teknisk - det var i drift. Flere leverandører håndterte ulike utskriftsjobber, og selskapet trengte å sikre konsekvente, skannedy resultater uansett hvem som produserte det. Løsningen har fokusert på SVG-eksport og streng avleveringsdokumentasjon.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'En collage som viser den samme QR-kode utplassert over fem forskjellige størrelser, fra merke til banner',
          caption: 'En QR-kode, fem distribusjonsstørrelser: utfordringen med å opprettholde skannbarhet fra centimeter til meter',
        },
      ],
    },
    {
      heading: 'Hvorfor tidligere hendelser hadde problemer',
      paragraphs: ['På deres siste konferanse hadde selskapet opplevd pinlige fiaskoer. Scenebanneret QR ble generert som en liten PNG og oppskalert i designprogramvare - resultatet så akseptabelt ut på avstand, men klarte ikke å skanne pålitelig fra publikum. Merke-QR-er var overstilte og for små, frustrerende deltakere som prøvde å legge til kontakter. Inkonsekvente innstillinger på tvers av formater betydde at den "samme" QR-en faktisk så annerledes ut på hvert stykke.', 'Post-event analyse avdekket årsaken: ingen enkelt kilde til sannhet. Hver designer hadde gjenskapt QR med litt forskjellige innstillinger, og hver utskriftsleverandør hadde behandlet filer annerledes. Kvalitet degradert gjennom telefonspillet til filavleveringer.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Nærbildebilder som viser skanningsfeil: pixelerte bannermoduler, understørrelsesmerkekoder, inkonsekvent styling på tvers av formater',
          caption: 'Forensisk analyse av tidligere hendelsesfeil: hvert format hadde introdusert ulike kvalitetsproblemer',
        },
      ],
    },
    {
      heading: 'SVG-første arbeidsflyt',
      paragraphs: ['For dette arrangementet etablerte selskapet en streng protokoll: én mester QR generert i ANQR med optimale innstillinger (Error Correction H, generøs stille sone, ren styling), eksportert som SVG, og lagret som den enkelt autoritative kilde. ANQR konfigurasjonslenken ble dokumentert sammen med SVG-filen slik at koden kunne regenereres om nødvendig.', 'Hver designer og leverandør mottok samme SVG master med eksplisitte instruksjoner: plasser i nødvendig størrelse, ikke endre, opprettholde stille sone clearance. For leverandører som krever rasterformater, tilveiebringte selskapet forhåndsinnstilt PNG i spesifikke størrelser med klare navnekonvensjoner som indikerer tiltenkt bruk.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'En filpakke som viser SVG-master, størrelsesspesifikke PNG-er, spesifikasjonsdokument og konfigurasjonslenke',
          caption: 'Overleveringspakken: alt leverandører trengte for å produsere konsistente resultater uten å gjette',
        },
      ],
    },
    {
      heading: 'Størrelsesspesifikke vurderinger',
      paragraphs: ['Hvert format krever spesiell oppmerksomhet. Badge innsatser på 3cm trengte QR å okkupere maksimal tilgjengelig plass - skanneavstand ville være armens lengde. Bordtelt på 8cm kan omfatte dekorativ utforming utenfor den rolige sonen. Den 4-meters banneren som kreves beregning: fra typisk publikum avstand (15-20 meter), må moduler være klart adskilt med telefonkameraer, noe som betydde at QR måtte være minst 80cm i bannerdesignen.', 'Selskapet laget en størrelsesguide som dokumenterer minimum QR-dimensjoner for hver forventet skanneavstand. Dette ble en gjenbrukbar ressurs for fremtidige arrangementer, og fjernet gjetting fra designprosessen.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Et diagram som viser forholdet mellom skanneavstand, minimum QR-størrelse og moduldimensjoner for hvert hendelsesformat',
          caption: 'Størrelsesmatrisen: beregnede dimensjoner som sikrer pålitelig skanning på hvert formats forventede visningsavstand',
        },
      ],
    },
    {
      heading: 'Produksjonsresultater',
      paragraphs: ['Konferansedagsvalidering ble systematisk: personalet testet alle utplasserte QR før dørene åpnes. Merket setter skannet umiddelbart i armens lengde. Bordtelt jobbet pålitelig i variabel belysning av utbruddsrom. Scanet banner - den forrige hendelsens flaum - skannet med hell fra midten av publikumsområdet.', 'Null scanning klager ble logget over 2.000+ deltakere. Den operative gevinsten var like stor: Når et siste minutts sponsortilskudd krevde ny skilting, genererte produksjonsteamet det fra mesteren SVG i minutter, selv om det ville matche alt annet.', 'Se Lær-veiledningen om utskriftsklare QR-koder for beslutningsrammeverket SVG vs PNG og beste praksis for overlevering.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Eventfotografering som viser deltakerne vellykket skanne QR-koder i ulike størrelser og avstander gjennom hele arenaen',
          caption: 'Konferanse dag suksess: pålitelig skanning over hvert format, fra merket nærbilde til scene banner avstandsbilder',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Åpne generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Bla gjennom Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Case Study: Flyplass Lounge Digital skjerm',
      paragraphs: ['Dette eksemplet følger en flyselskapslounge som hadde brukt statiske QR-koder på sine digitale velkomstskjermer. Skjermene viste roterende reklameinnhold, men QR-koden for lounge-innsjekking satt i et hjørne, statisk og lett oversett. Analytics viste at bare 15 % av de kvalifiserte gjestene brukte QR-innsjekkingen til tross for at den var raskere enn skrivebordskøen. De fleste gjestene la rett og slett ikke merke til det.', 'Hypotesen var enkel: i et visuelt travelt miljø med bevegelig innhold, blir en statisk QR usynlig. Løsningen som trengs for å gjøre QR-en merkbar uten å gå på bekostning av påliteligheten som kreves for en innsjekkingsflyt der feil vil bety frustrerte reisende og lengre skrivebordskøer.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'En digital skjerm i en flyplasslounge som viser salgsfremmende innhold med en liten statisk QR-kode i hjørnet',
          caption: 'Den opprinnelige oppsettet: en statisk QR tapt i et hav av dynamisk salgsfremmende innhold, oppnår bare 15 % adopsjon',
        },
      ],
    },
    {
      heading: 'Designe sikker animasjon',
      paragraphs: ['Salongens digitale skilting brukte store LED-paneler – et utfordrende miljø hvor aggressiv animasjon kunne skape skanningsproblemer. Designteamet startet konservativt: en mild pulseffekt som subtilt utvidet og kontraherte QR-ens visuelle tilstedeværelse uten å endre selve kodestrukturen. Bildetimingen ble satt sakte (250 ms) for å unngå flimringsproblemer med LED-oppdateringsfrekvensen.', 'Validering av sikkerhetsmodus bekreftet at hver ramme forble skanneaktivert. Ytterligere testing på de faktiske LED-panelene viste at pulsen måtte være enda mer subtil enn desktop-forhåndsvisninger foreslått - LED-lysstyrke og visningsvinkler påvirket oppfattet kontrast mer enn forventet.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR animasjonsinnstillingspanelet som viser pulskonfigurasjon: langsom timing, subtil intensitet, sikkerhetsmodus aktivert',
          caption: 'Animasjonskonfigurasjon: parametere innstilt for LED-panelskjerm samtidig som skannepålitelighet opprettholdes i hver ramme',
        },
      ],
    },
    {
      heading: 'Integrasjon med skiltinnhold',
      paragraphs: ['Den animerte QR-en ble plassert i en dedikert "stabil sone" av skjermoppsettet - et område som forble konstant mens reklameinnhold roterte i hovedvisningsområdet. Denne separasjonen var avgjørende: QR-en trengte visuell stabilitet for skanning selv mens den vekket oppmerksomhet gjennom sin subtile animasjon.', 'En tydelig handlingsfremmende oppfordring ble lagt til ved siden av QR-en: \'Hopp over køen - skann for å sjekke inn.\' Teksten forble statisk mens QR-en pulserte, og skapte et visuelt hierarki som trakk blikket til skanningsmuligheten uten å overvelde reklameinnholdet.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Et skjermutformingsdiagram som viser den animerte QR i en stabil sone mens innholdet roterer i hovedområdet',
          caption: 'Screen fast eiendom tildeling: den animerte QR opptar en stabil sone adskilt fra roterende salgsfremmende innhold',
        },
      ],
    },
    {
      heading: 'Teknisk deployering',
      paragraphs: ['Den animerte QR-en ble eksportert som en GIF med optimaliserte innstillinger for skilt-CMS. Filstørrelseshensyn var viktig – salongens innholdsstyringssystem hadde opplastingsgrenser, og altfor store filer forårsaket hakking i avspillingen. Den endelige eksporten balanserte visuell kvalitet mot filstørrelse ved å begrense fargepaletten og optimalisere antall bilder.', 'Hvis GIF ikke spilte av noen grunn, vil skiltingssystemet vise en statisk PNG-sikkerhetskopi. Denne redundansen sikret innsjekkingskapasiteten ble aldri tapt på grunn av tekniske problemer med animasjonen.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Et CMS-grensesnitt som viser den animerte QR-opplastingen med reservestatisk bilde konfigurert',
          caption: 'Signage CMS konfigurasjon: animert primær med statisk tilbakefall som sikrer at innsjekkingskapasitet aldri avbrytes',
        },
      ],
    },
    {
      heading: 'Målt effekt',
      paragraphs: ['Etter en måneds drift økte QR-innsjekking fra 15% til 24% - en 60% relativ forbedring. Guest feedback undersøkelser indikerte den animerte QR var \'nøyere å legge merke til\' og \'filt mer moderne\'. Desk køtider reduserte betydelig i toppperioder som flere gjester selvbevaret via QR.', 'Viktigere, null skanningsfeil ble rapportert til tross for tusenvis av daglige skanninger. Den konservative animasjonstilnærmingen hadde oppnådd oppmerksomhetsmålet uten å ofre påliteligheten en innsjekkingsflyt krevde. Salongen rullet deretter ut lignende animerte QR-er til sine andre lokasjoner.', 'Se Lær-veiledningen om animerte QR-koder for digital skilting for de tekniske prinsippene bak sikker animasjonsdesign.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'En dashboard som viser adopsjonshastighetsøkning, kø tidsreduksjon og null-feil-skanning pålitelighet i løpet av utplasseringsperioden',
          caption: 'En måned med data: 60% adopsjonsøkning, redusert køtider og vedlikeholdt perfekt skanne pålitelighet',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Åpne generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Bla gjennom Lær artikler',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Case Study: Global produktlansering QR kampanje',
      paragraphs: ['Dette eksemplet følger et forbrukerelektronikkselskap som lanserer et nytt produkt samtidig i 12 markeder på 8 språk. Hvert regionalt markedsføringsteam trengte å produsere emballasje, detaljhandelsskjermer og reklamemateriell med QR-koder som linker til lokaliserte produktsider. Tidligere lanseringer hadde resultert i inkonsekvent QR-stil, sporadiske skannefeil og et "telefonspill" med konfigurasjonsdrift ettersom hvert lag gjenskapte koder fra skjermbilder.', 'Løsningen utnyttet ANQRs delbare konfigurasjonskoblinger for å etablere en enkelt kilde til sannhet som alle regionale team kunne få tilgang til, uavhengig av grensesnittspråket deres. QR-nyttelasten brukte en smart omdirigering som oppdaget brukerspråk, så én kode fungerte globalt mens den leverte lokaliserte opplevelser.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Et verdenskart som viser 12 markedssteder med QR-koder, noen visuelt inkonsekvent med hverandre',
          caption: 'Utfordringen: 12 markeder, 8 språk og en historie av inkonsistente QR-implementasjoner i hele regionen',
        },
      ],
    },
    {
      heading: 'Opprette masterkonfigurasjonen',
      paragraphs: ['Det globale merkevareteamet skapte den autoritative QR-konfigurasjonen i ANQR: merkefarger som matcher produktlinjens visuelle identitet, Error Correction H for pålitelighet på tvers av alle trykte og digitale applikasjoner, og styling som ville reproduseres konsekvent uavhengig av lokale produksjonsmetoder. Konfigurasjonen ble låst og delingslenken dokumentert i den globale kampanjebriefen.', 'Kritisk brukte den kodede URL-en en språkoppdagende omdirigeringstjeneste. Når skannet, ble brukerne automatisk dirigert til deres lokale språkproduktside. Dette betydde at alle 12 markeder kunne bruke identiske QR-koder - ingen per marked nyttelast variasjoner som kunne introdusere feil.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR-grensesnitt som viser masterkonfigurasjonen med merkefarger, ECC H og den smarte omdirigeringsadressen',
          caption: 'Hovedkonfigurasjonen: globale merkestandarder kodet til en enkelt, delt kilde til sannhet',
        },
      ],
    },
    {
      heading: 'Regionalt team arbeidsflyt',
      paragraphs: ['Hvert regionalt markedsføringsteam mottok konfigurasjonslenken med enkle instruksjoner: åpne lenken, kontroller at forhåndsvisningen samsvarer med merkevareretningslinjene, eksporter i det nødvendige formatet for applikasjonen din. ANQR-grensesnittet ble vist på hvert teams foretrukne språk, men de underliggende QR-innstillingene forble identiske uavhengig av grensesnittspråk.', 'Da det japanske teamet trengte SVG for high-end detaljhandelsskjermer og det brasilianske teamet trengte PNG for sosiale medier, ble begge eksportert fra samme konfigurasjon. Når det tyske teamets utskriftsleverandør ba om spesifikke fargeverdier, kunne de referere til konfigurasjonen direkte i stedet for å gjette fra et skjermbilde.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Skjermbilde som viser den samme konfigurasjonslenken åpnet i japanske, portugisiske og tyske grensesnitt',
          caption: 'Samme konfigurasjon, forskjellige grensesnitt: regionale team jobber på sitt foretrukne språk samtidig som det opprettholdes global konsistens',
        },
      ],
    },
    {
      heading: 'Håndtering av regionale variasjoner',
      paragraphs: ['Noen markeder krevde mindre tilpasninger. Det kinesiske teamet trengte en versjon med en WeChat-optimalisert ramme for sosial deling. I stedet for å modifisere masteren, opprettet de en dokumentert variant med sin egen konfigurasjonslenke, tydelig merket som \'CN-WeChat-variant\' i biblioteket for kampanjeelementer. Dette opprettholdt sporbarheten samtidig som nødvendig lokalisering tillot.', 'Merketeamet etablerte en enkel regel: Enhver variasjon fra master trengte en ny, dokumentert konfigurasjonslenke. Ingen endringer i eksporterte filer, ingen \\"snøggreparasjon\\" i designprogramvare. Dette hindret konfigurasjon drift som hadde plaget tidligere lanseringer.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Et grensesnitt for ressursbibliotek som viser hovedkonfigurasjonen og godkjente regionale varianter, hver med sin egen kobling',
          caption: 'Campaign Account Governance: master configuration pluss dokumenterte varianter, alle sporbare via konfigurasjonslenker',
        },
      ],
    },
    {
      heading: 'Launch Results',
      paragraphs: ['Produkt lanseringsdag så QR-koder som er utplassert på tvers av emballasje, detaljhandelsskjermer, eventmaterialer og digitale kampanjer i alle 12 markeder samtidig. Kvalitetsrevisjoner bekreftet visuell konsistens i hele regionene - QR på Tokyo-butikker matchet QR på São Paulo-emballasjen matchet QR på Berlin event bannere.', 'Nullskanningsfeil ble rapportert på tvers av markeder. Når det var nødvendig med en URL-endring etter lansering, håndterte omdirigeringstjenesten den usynlig - ingen utskrift nødvendig. Det globale teamet estimerte konfigurasjonslinktilnærmingen lagret 40 + timers koordineringstid sammenlignet med tidligere lanseringsmetode.', 'Se Lær-veiledningen om tverrspråklig QR-samarbeid for arbeidsflytprinsippene bak global kampanjekonsistens.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Et rutenett med fotografier som viser konsistent QR-utplassering i ulike markeder: Tokyo detaljhandel, São Paulo emballasje, Berlin hendelser',
          caption: 'Global konsistens oppnådd: identisk QR-presentasjon på tvers av 12 markeder til tross for forskjellige språk, leverandører og formater',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Åpne generatoren',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Bla gjennom Lær artikler',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Bla gjennom Lær artikler', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Åpne hele brukerveiledningen', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Åpne galleriet', type: 'gallery' },
  ],
};
