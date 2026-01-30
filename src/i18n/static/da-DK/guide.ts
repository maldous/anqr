import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Brugervejledning til ANQR',
  description: 'Komplet guide til at bruge ANQR til at oprette QR-koder.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Åbn generatoren', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Gennemse Lær artikler', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Vis QR- eksempler', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Kom i gang',
      paragraphs: [
        'ANQR er en QR kode generator med en klient- første tilgang. Som standard genereres QR-koder lokalt i din browser - ingen konto kræves, og dine data forbliver private. For professionel indlejring, kan du også bruge serverside API.',
        'Grænsefladen har tre grænsefladeniveauer: Basic, Advanced og Professional. Vælg dit niveau ved hjælp af fanerne i overskriften. Hvert niveau låser op for yderligere funktioner, mens brugerfladen holdes fokuseret på det, du har brug for.',
      ],
      bullets: [
        'Grundlæggende: Simpel QR kode skabelse med almindelig tekst / URL indhold og billede overlay.',
        'Avanceret: QR kodning muligheder, rendering stilarter, animation, output formater, udvidet indhold typer, og overlay tilpasning.',
        'Professionel: Vandmærker, metadata, deling, sikkerhedsanalyse, betaling QR-koder, og virksomhedens funktioner.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Åbn generatoren', type: 'generator' }],
    },
    {
      heading: 'Hurtig start',
      paragraphs: ['For at oprette din første QR-kode:'],
      bullets: [
        '1. Vælg en indholdstype (URL, tekst, WiFi osv.) fra indholdstypen dropdown.',
        '2. Indtast dine data i de angivne felter.',
        '3. Muligvis tilpasse farver, stilarter, og tilføje en overlay billede.',
        '4. Klik på Eksporter for at downloade din QR-kode som PNG, GIF, WebP eller SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Grundlæggende funktioner',
      paragraphs: [
        'Det grundlæggende niveau giver en strømlinet grænseflade til at skabe QR-koder med nyttelast indhold og billede overskrifter. Det er den enkleste måde at komme i gang på.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indhold typer (grundlæggende)',
      paragraphs: [
        'Plain Text: Koder enhver tekst op til QR-kodekapacitetsgrænsen. Ideel til korte meddelelser, koder eller identifikatorer.',
        "URL: Indkode webadresser. QR-koden åbner URL 'en når den scannes. Ifølge de oplysninger, der er fremlagt af de interesserede parter, er der ingen grund til at antage, at der er tale om statsstøtte.",
      ],
    },
    {
      heading: 'Billedovertræk (grundlæggende)',
      paragraphs: [
        'Upload et billede (JPG, PNG, GIF, WebP) til at blande med din QR-kode. Grundlæggende overlay funktioner omfatter:',
      ],
      bullets: [
        'Upload fra fil: Vælg et billede fra din enhed.',
        'Indlæs fra URL: Indtast en billed- URL (skal tillade CORS).',
        'Center Logo: Placerer billede i midten, afhængig af fejlkorrektion.',
        'Blend: Simpel alfablanding af billede med QR mønster.',
        'Intensitet: Kontrollerer hvor stærkt overlay påvirker QR-koden (0- 100%).',
        'Farvetilstand: Fuld farve, gråskala eller sort & hvid.',
        'Bevar Finder-mønstre: Holder hjørnemønstre uændrede for pålidelig scanning.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Avancerede funktioner',
      paragraphs: [
        'Avanceret niveau låser QR kodning muligheder, rendering stilarter, animation, output formater, udvidet indhold typer, og avanceret overlay tilpasning.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR- indkodningsindstillinger',
      paragraphs: [
        'Version: QR-koder kommer i version 1-40, med højere versioner, der indeholder flere data, men er større. Indstil til 0 (Auto) for at lade ANQR vælge den mindste version, der passer til dit indhold.',
        'Fejlkorrektion: Bestemmer hvor meget skade en QR-kode kan bære, mens den kan scannes.',
      ],
      bullets: [
        'L (Lav): 7% fejlkorrektion - mindste størrelse, mindste redundans.',
        'M (Medium): 15% fejlkorrektion - afbalanceret indstilling.',
        'Q (Quarelle): 25% fejlkorrektion - god til trykte koder.',
        'H (Høj): 30 % fejlkorrektion - bedst til koder med overlejringer eller under barske forhold.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Stille zone (Margin)',
      paragraphs: [
        'Den stille zone er det hvide rum omkring QR-koden. Scannere har brug for denne margen for at registrere, hvor koden starter. Standarden anbefaler mindst 4 moduler. Reduktion til under 4 kan forårsage scanningsproblemer.',
      ],
    },
    {
      heading: 'Modul stil',
      paragraphs: [
        'Moduler er de enkelte felter, der udgør en QR-kode. ANQR tilbyder fem stilarter:',
      ],
      bullets: [
        'Square: Classic QR udseende med skarpe hjørner.',
        'Afrundede: Blødgjorte hjørner for et venligere look.',
        'Dots: Cirkulære moduler til en moderne æstetik.',
        'Diamant: 45° roterede firkanter for et markant mønster.',
        'Forbundet: Moduler smelter sammen, når de støder op til hinanden, skaber organiske former.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Finde mønster stil',
      paragraphs: [
        'Finde mønstre er de tre store firkanter i QR hjørner, der hjælper scannere orientere koden. Tilgængelige stilarter:',
      ],
      bullets: [
        'Square: Standard firkantede hjørner.',
        'Afrundet: Blødte hjørner matchende afrundede modul stil.',
        'Cirkel: Cirkulære findermønstre til koder i prikstil.',
      ],
    },
    {
      heading: 'Justering & Timing Mønstre',
      paragraphs: [
        'Justeringsmønstre vises i større QR-koder (version 2+) for at hjælpe med at korrigere forvrængning. Timingmønstre er de skiftende linjer, der forbinder findermønstre.',
      ],
      bullets: [
        'Tilpas stil: Match Finder, Square, Afrunded, eller Circle.',
        'Timing Style: Match modul, Solid, eller Dashed.',
      ],
    },
    {
      heading: 'Farver',
      paragraphs: [
        'Forgrund: Farven på QR moduler. Sort (# 000000) er standard, men enhver mørk farve virker.',
        'Baggrund: Baggrundsfarven. Hvid (#ffffff) er standard. Sørg for tilstrækkelig kontrast til forgrunden.',
        'Gennemsigtig baggrund: Fjern baggrunden helt til brug på farvede overflader. Sørg for, at overfladen giver tilstrækkelig kontrast.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Modul størrelse & Gap',
      paragraphs: [
        'Modul Størrelse: Kontrollerer hvor stort hvert modul er i pixels. Større værdier skaber større, lettere at scanne koder.',
        'Modul Gap: Tilfører plads mellem modulerne i procent. Små huller (5-15%) kan forbedre scanbarheden under visse forhold, men overdrevne huller reducerer pålideligheden.',
      ],
    },
    {
      heading: 'Outputindstillinger',
      paragraphs: ['Format: Vælg dit eksportformat baseret på brugstilfælde.'],
      bullets: [
        'PNG: Lossless raster format, ideel til de fleste anvendelser. Bedste til print og digital.',
        'WebP: Moderne format med mindre filstørrelser. Godt til brug på nettet.',
        'GIF: Påkrævet for animerede QR-koder. Understøtter gennemsigtighed.',
        'SVG: Vektorformat, der skaleres uendeligt. Bedst til stor skrift, eller når du skal redigere koden.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Udgangsdimensioner',
      paragraphs: [
        'Bredde / højde: Sæt outputstørrelsen i pixels. Til udskrift beregnes baseret på DPI (f.eks. 300 DPI ved 1 tomme = 300px). Større størrelser scannes mere pålideligt i afstand.',
      ],
    },
    {
      heading: 'Animeringsindstillinger (Avanceret)',
      paragraphs: ['Kontrol animeret QR kode adfærd:'],
      bullets: [
        'Hastighed: Animation frame rate i millisekunder.',
        'Loop: Kontinuerlig eller single-play animation.',
        'Bounce: Pingpong animation retning.',
        'Start ramme: Begynd animation fra specifik ramme.',
        'Max Frame: Begræns samlede rammer i animation.',
        'Rammetrin: Spring rammer over for hurtigere animation.',
        'Interpolation: Ingen, Crossfade, eller Morph mellem rammer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Indhold Typer (Avanceret)',
      paragraphs: ['Avanceret niveau låser yderligere nyttelast formater:'],
      bullets: [
        'Telefonnummer (tlf.:): Opretter et kaldeligt telefonlink.',
        'E-mail (mailto:): Åbner e-mail-klient med valgfrit emne og krop.',
        'SMS: Forfyldt tekstbesked til et telefonnummer.',
        'vCard: Fuld kontakt med navn, organisation, telefon, e-mail, adresse.',
        'MeCard: Kompakt kontaktformat populær i Japan.',
        'BizCard: Legacy visitkort format.',
        'Geo Placering: GPS koordinater, der åbner i kort.',
        'WiFi: Netværkslegitimation til automatisk tilslutning (SSID, adgangskode, sikkerhedstype).',
        'Kalender Event: iCalendar format med titel, placering, dato / tid.',
        'Begivenhed RSVP: Link til begivenhed registrering side.',
        'Kalender Abonner: Abonner på en ICS / WebCal feed.',
        'Fil / Dokument URL: Direkte link til downloades filer.',
        'Cloud Storage Link: Links til Google Drev, Dropbox, OneDrive, osv.',
        'Social profil: Links til LinkedIn, Twitter, Instagram, osv.',
        'Besked Link: WhatsApp, Telegram, Signal dybe links.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Avancerede overlay-funktioner',
      paragraphs: ['Yderligere overlay kapaciteter:'],
      bullets: [
        'Beskær: Aktiver beskæring for at vælge et kvadratisk område af dit billede.',
        'Halftone: Klassisk print-stil prik mønster baseret på billede lysstyrke.',
        'Dithered: Error-diffusion dithering for detaljeret gengivelse.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overlay Blend Modes (Avanceret)',
      paragraphs: ['Yderligere blandingstilstande i Avanceret niveau:'],
      bullets: [
        'Subpixel: Opdeler hvert modul i subpixels for at få flere detaljer.',
        'Blue Noise: Bruger blå støj-dithering til artefaktfrie mønstre.',
        'Mosaik: Tilebaseret effekt bevare billedstruktur.',
        'Gap fyld: Placerer billede i mellemrum mellem moduler.',
        'Lysstyrke: Varers modulstørrelse baseret på billedets lysstyrke.',
        'Duotone: Tilordner billedet til to farver for slående kontrast.',
      ],
    },
    {
      heading: 'Overlevelsesintensitet',
      paragraphs: [
        'Kontrollerer hvor stærkt overlay påvirker QR kode (0- 100%). Højere værdier viser flere billeddetaljer, men kan reducere scannen. Start omkring 70% og juster baseret på test.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Farvetilstand',
      paragraphs: ['Hvordan overliggende billede behandles:'],
      bullets: [
        'Fuld farve: Beholder originale billedfarver.',
        'Grayscale: Konverterer til sorte og hvide toner.',
        'Sort & hvid: Høj kontrast binær konvertering.',
      ],
    },
    {
      heading: 'Bevar Finder Mønstre',
      paragraphs: [
        'Når det er aktiveret, holder de tre hjørne findere mønstre umodificeret af overlay. Stærkt anbefales til pålidelig scanning.',
      ],
    },
    {
      heading: 'Forbehandling af billeder',
      paragraphs: [
        'Anvend filtre på dit overlejrede billede før blanding. Disse justeringer kan forbedre hvordan billedet vises i den endelige QR-kode.',
      ],
      bullets: [
        'Lysstyrke (-100 til + 100): Lys eller mørkere billedet.',
        'Kontrast (- 100 til + 100): Forøg eller fald tonalt område.',
        'Gamma (0,2 til 3.0): Ikke-lineær lysstyrke justering. Værdier under 1 lysere midtoner, over 1 mørkere dem.',
        'Mætning (-100 til + 100): Farveintensitet. -100 er gråskala, + 100 er overmættet.',
        'Hue Rotat (0- 360 °): Skift alle farver omkring farvehjulet.',
        'Blur (0- 20px): Svæve billeddetaljer.',
        'Sharpen (0- 100%): Forbedre kanter og detaljer.',
        'Posterize (0-16 niveauer): Reducer farveniveauer for en plakateffekt.',
        'Tærskel (0-255): Konverter til binær sort / hvid ved cutoff punkt.',
        'Kantdetektion: Sobel eller Canny algoritmer til at vise kun kanter.',
        'Invertér: Vend alle farver tilbage.',
      ],
    },
    {
      heading: 'Fit tilstand',
      paragraphs: ['Hvordan overliggende billede passer til QR-kodeområdet:'],
      bullets: [
        'Dække: Billede fylder hele området, beskæring hvis det er nødvendigt.',
        'Indeholder: Hele billedet er synligt, kan have marginer.',
        'Stræk: Billede forvrænger at fylde præcist.',
      ],
    },
    {
      heading: 'Transformér indstillinger',
      paragraphs: [
        'Rotation: Rotér overlay i 90 ° trin.',
        'Flip X / Y: Spejl billedet vandret eller lodret.',
      ],
    },
    {
      heading: 'Dithering algoritmer',
      paragraphs: [
        'Dithering konverterer kontinuert-tone billeder til mønstre, QR-koder kan repræsentere. Fås ved brug af Dithered, Blue Noise, eller True Dither blanding tilstande.',
      ],
      bullets: [
        'Fejl Diffusion: Klassisk Floyd- Steinberg stil. Spreader kvantiseringsfejl til tilstødende pixels.',
        'Bestilt (Bayer): Bruger en tærskelmatrix til regelmæssige mønstre.',
        'Clusted Dot: Simulerer halftontryk.',
        'Void & klynge: Optimeret rækkefølge.',
        'Blå støj: Synligt behageligt randomiseringsmønster.',
        'Blå støj Tærskel: Tærskel dithering med blå støj tekstur.',
        'Hvid støj: Tilfældig tærskel disthering.',
        'Gausisk / trekantet Støj: Støj med forskellige distributioner.',
        'Blå støj + Fejl Diffusion: Hybrid kombinerer begge teknikker.',
        'Screened Blue Noise: Screen- lignende blå støjmønster.',
        'Perceptuel: Luminansvægtet for bedre visuelle resultater.',
        'Kantbevidst: Bevarer billedkanterne under dithering.',
        'Tilpasset tærskelværdi: Lokal-adaptive tærskeværk.',
        'Temporal blå støj: For animerede GIF, varierer mønster per ramme.',
      ],
    },
    {
      heading: 'Diffusion Kernels',
      paragraphs: [
        'Når du bruger Fejl Diffusion dithering, skal du vælge, hvordan fejl er fordelt:',
      ],
      bullets: [
        'Floyd- Steinberg: Klassisk 4-nabo diffusion. Godt valg.',
        'Jarvis- Justice - Ninke: 12-nabo, glattere, men langsommere.',
        'Stucki: Svarende til JJN med forskellige vægte.',
        'Burkes: Forenklet JJN, hurtigere.',
        'Sierra: familie af kerner balancering kvalitet og hastighed.',
        'Atkinson: Lys diffusion, bevarer detaljer, men kan være kornet.',
      ],
    },
    {
      heading: 'Diter- styrke',
      paragraphs: [
        'Kontrollerer hvor meget disthering der anvendes (0- 100%). Lavere værdier bevare mere af det oprindelige mønster, højere værdier viser mere billede detaljer.',
      ],
    },
    {
      heading: 'Subpixelindstillinger',
      paragraphs: ['Når du bruger Subpixel blanding tilstand:'],
      bullets: [
        'Grid Størrelse: 2 × 2, 3 × 3, eller 4 × 4 subpixels pr. modul. Højere = flere detaljer.',
        'Centerregel: Streng kræver center subpixel til at matche modul. Halftone Center tillader variation.',
        'Neutral farve: Farve bruges til ubestemte subpixels.',
        'Finde Override: Hvordan findere mønstre bliver leveret (Solid eller Stiliseret).',
      ],
    },
    {
      heading: 'Halfton- indstillinger',
      paragraphs: ['Ved brug af Halftone blandingstilstand:'],
      bullets: [
        'Cellestørrelse: Per modul eller N × N gitter.',
        'Dot form: Circle, Square, eller linje.',
        'Lysstyrke Curve: Linear, S-Curve, eller Gamma.',
      ],
    },
    {
      heading: 'Duotonfarver',
      paragraphs: [
        'Når du bruger Duotone blanding tilstand, indstille Skygge farve (mørke områder) og Fremhæv farve (lyse områder).',
      ],
    },
    {
      heading: 'GIF-animationsindstillinger',
      paragraphs: ['Når du bruger animerede GIF overskrifter:'],
      bullets: [
        'Brug ramme-forsinkelser: Respekter den oprindelige GIF-timing.',
        'Max FPS: Begræns billedhastighed (1-60 fps).',
        'Bortskaffelse Håndtering: Respekt eller simplificere frame bortskaffelse metoder.',
      ],
    },
    {
      heading: 'Avancerede udstillingsindstillinger',
      paragraphs: ['Yderligere destruktionskontrol:'],
      bullets: [
        'Gap tilstand: Ingen, Inset, Stroke, eller negativ mellemrum styling.',
        'Hjørneradius: Afrundede hjørner i procent for moduler.',
        'Gradient: Ingen, lineær, radial eller konisk gradient på moduler.',
        'Øjens ydre/indre stil: Uafhængig styling til ring med søgemønster.',
        'Dot Rotation: Rotér diamant / dot moduler.',
        'Øjenskala: Størrelsesjustering til findermønstre.',
        'Frame Style: Tilføj dekorative rammer (Afrunded Frame, Sticker, Tag).',
        'Ramme tekst: Tilføj tekst som "Scan Me!" til rammer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Avanceret QR - indkodning',
      paragraphs: ['Fine- tune QR- kodning:'],
      bullets: [
        'Indkodningstilstand: Auto, Numerisk, Alfanumerisk, Byte / UTF-8 eller Kanji.',
        'Håndhæv Min Quiet Zone: Sørg for mindst 4 modulers margen.',
        'Mask Mønster: Auto (optimal), eller manuelt vælge mønstre 0-7 til kontrol modul distribution. Forskellige mønstre skaber forskellige visuelle fremtoninger, mens indkodning af de samme data.',
        'Tegnsæt: ISO- 8859-1 (Latin1- standard), UTF- 8 (fuld Unicode inklusive emoji) eller Shift- JIS (japansk). Vælg baseret på dit indholds karakterkrav.',
      ],
    },
    {
      heading: 'Avancerede outputindstillinger',
      paragraphs: ['Yderligere eksportindstillinger:'],
      bullets: [
        'Filnavn: Brugerdefineret filnavn til downloads.',
        'GIF Palette Størrelse: 2-256 farver i GIF output.',
        'GIF Kvantizer: Median Cut, NeuQuant, eller Octree farve reduktion.',
        'GIF Dithering: Off, Floyd- Steinberg, eller Ordered.',
        'GIF-gennemsigtig farve: Indstil en farve til at være gennemsigtig.',
        'SVG True Vector: Brug stier i stedet for indlejret raster.',
        'SVG Form Præcision: Pixel eller Præcise sti rendering.',
        'SVG Indlejret Raster Overlay: Inkludér overlay som indlejret billede.',
        'Baggrund Tilsidesæt: Tving en bestemt baggrundsfarve i output.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Valideringsindstillinger',
      paragraphs: ['Indstillinger for inputbehandling:'],
      bullets: [
        'Validér input: Tjek indholdsformat før indkodning.',
        'Trim Whitespace: Fjern forreste / bageste mellemrum.',
        'Normaliser Newlines: Konverter alle linjens ender til LF.',
        'Max Længde Guard: Advar hvis indhold overstiger QR kapacitet.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Faglige funktioner',
      paragraphs: [
        'Det professionelle niveau tilføjer vandmærker, metadata, deling muligheder, sikkerhedsanalyse, betaling QR-koder, og virksomhedens funktioner.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vandmærke',
      paragraphs: ['Tilføj vandmærker til dine QR-koder:'],
      bullets: [
        'Kind: Tekst, billede eller mønster vandmærke.',
        'Position: center, hjørner, kanter, bag, eller stille zone.',
        'Ugennemsigtighed: Vandmærke gennemsigtighed (0- 100%).',
        'Blend tilstand: Normal, Multiply, Screen, eller Overlay blanding.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Indlejrede metadata i eksporterede filer:'],
      bullets: [
        'Titel, forfatter, ophavsret, licens, beskrivelse felter.',
        'Skabelsestid: Indlejret generation tidsstempel.',
        'Brugerdefineret nøgleværdi: Tilføj vilkårlige metadatapar.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Deling',
      paragraphs: ['Del dine QR-kodekonfigurationer:'],
      bullets: [
        'Direkte link: Generér en delbar URL med dine nuværende indstillinger.',
        'Indlejret HTML: Få integreret kode til hjemmesider.',
        "Kode Parametre: Inkludér alle indstillinger i aktie- URL 'en.",
        'Bemærk: Overlæg billeder fra lokale filer kan ikke deles via URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Sikkerhedsanalyse',
      paragraphs: ['Sørg for, at QR-koder forbliver scanbare:'],
      bullets: [
        'Sikkerhedstilstand: Off, Balanceret, eller Streng Scanning krav.',
        'Minimodul Størrelse: Minimum pixel størrelse pr. modul.',
        'Min stille Zone: Minimum margin moduler.',
        'Lås Finder / Timing / Justér / Format / Version: Beskyt specifikke elementer.',
        'Maks. overlejringsintensitet efter ECC: Automatiske intensitetsgrænser baseret på fejlkorrektionsniveau.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Indhold typer (Professional)',
      paragraphs: ['Professionelt niveau tilføjer betaling og enterprise indhold typer:'],
      bullets: [
        'EPC/SEPA (EU): Europæisk bankoverførsel QR-koder med IBAN, BIC, beløb, reference.',
        'UPI (Indien): Unified Payments Interface med VPA, betalingsmodtagernavn, beløb.',
        'PayNow (Singapore): Singapore hurtig betaling med UEN eller mobilnummer.',
        'PromptPay (Thailand): Thailands nationale betalingssystem.',
        'PIX (Brasilien): Brasiliansk øjeblikkelig betaling med PIX nøgle.',
        'Crypto: Bitcoin, Ethereum, Litecoin betalingsadresser med valgfrit beløb.',
        "Marketing Kampagne Link: URL 'er med fuld UTM parameter (Marketing Tags) sporing.",
        'Kort link: Til brug med URL-forkortere til dynamiske/sporbare QR-koder.',
        'GS1 Digital Link: Produktidentifikation med GTIN, seriel, batch, udløb.',
        'App Deep Link: iOS / Android app dybe links med brugerdefinerede ordninger.',
        'Brugerdefineret format: Raw data uden formatering eller validering.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Language-Relevante betalinger i avanceret tilstand',
      paragraphs: [
        'Når du bruger avanceret tilstand, viser ANQR automatisk betalingsmetoder, der er relevante for dit valgte sprog. For eksempel ser vietnamesiske brugere VietQR, thailandske brugere ser PromptPay, og brugere på indiske sprog ser UPI og BharatQR. Globale betalingsmetoder (cryptocurrency, PayPal, Cash App) er tilgængelige på alle sprog. Professionel tilstand låser op for alle betalingsstandarder uanset sprog.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Europæiske betalingsstandarder',
      bullets: [
        'EPC/SEPA (EU): Europæiske QR-koder for bankoverførsler efter EPC QR Code Standard. Understøtter IBAN, BIC (valgfrit for indenlandsk), beløb i EUR og strukturerede eller ustrukturerede betalingsreferencer. Anvendes på tværs af SEPA-zonen inklusive EU-lande plus Schweiz, Norge, Island, Liechtenstein, Monaco og San Marino.',
        'Swiss QR-bill: Schweizisk betalingsstandard efter SIX Implementation Guidelines. Understøtter CHF og EUR, QR-Reference (QRR), Kreditorreference (ISO 11649), strukturerede kreditor-/debitoradresser og fakturaoplysninger. Påkrævet for schweiziske fakturaer siden 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indiske betalingsstandarder',
      bullets: [
        'UPI (Indien): Unified Payments Interface following NPCI Deep Linking Specification. Understøtter VPA (Virtual Payment Address), betalingsmodtagerens navn, beløb i INR, transaktionsnote, referencenr, handelskategori kode og transaktionsmåde.',
        'BharatQR (Indien): Unified QR-standard, der understøtter både UPI og kortbaserede betalinger. Kombinerer UPI VPA med kort PAN for maksimal kompatibilitet. Indeholder sælgernavn, by, MCC, GST-oplysninger og faktura-/referencenumre.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Sydøstasien Betalingsstandarder',
      bullets: [
        'PayNow (Singapore): Singapore hurtigt betalingssystem ved hjælp EMVCo QR specifikation med SGQR profil. Understøtter UEN (virksomhedsregistrering), mobilnummer eller NRIC som proxyidentifikatorer. Omfatter destinationsflag og udløbsdato.',
        'PromptPay (Thailand): Thai nationalt betalingssystem efter Bank of Thailand EMV-profil. Understøtter mobilnummer, nationalt ID, skatte-id, e-wallet ID og fakturabetaling med flere referencefelter.',
        'QRIS (Indonesien): Hurtig reaktionskode Indonesisk standard. EMV- baseret national betalingsstandard, der understøtter handelsidentifikation, NMID (National Merchant ID), handelskriteriklassifikation og bekvemmelighedsgebyrer (fast eller procentdel).',
        'DuitNow (Malaysia): Malaysisk instant payment system. Understøtter flere proxy typer, herunder NRIC, mobil, pas, hær ID, og business registreringsnumre.',
        'VietQR (Vietnam): Vietnamesisk interbankoverførselsstandard. Kræver bank BIN (NAPAS identifikation) og kontonummer. Understøtter flere servicekoder til forskellige overførselstyper (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filippinerne): Filippinsk QR-betalingsstandard for InstaPay og PESONet. Bruger kontonumre med købmandsidentifikation til P2M (person-til-købmand) transaktioner.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Østasiatiske betalingsstandarder',
      bullets: [
        'TWQR (Taiwan): Taiwanese QR-betalingsstandard. Understøtter handel ID, skat ID, og TWD beløb.',
        'HKQR / FPS (Hongkong): QR-koder i Hong Kong. Understøtter FPS-id, mobilnummer eller e-mail som betalingsidentifikatorer. Beløb i HKD.',
        'JPQR (Japan): Japansk samlet QR kode betalingsstandard. Bruger lagerid til handelsmæssig identifikation med JPY beløb.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Andre regionale betalingsstandarder',
      bullets: [
        'PIX (Brasilien): Brasiliansk Central Bank instant payment system efter BR Code specifikation. Understøtter PIX nøgler (CPF, CNPJ, e-mail, telefon, eller tilfældig nøgle), handelsnavn / by, transaktion ID, og BRL beløb.',
        'AusPayNet / NPP PayID (Australien): Australian New Payments Platform PayID system. Understøtter betaling ID-typer (e-mail, mobil, ABN, organisationsidentifikation) eller traditionelt BSB + -kontonummer. Handelsnavn er valgfrit, når betalerne ser det registrerede navn fra NPP lookup.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kryptocurrency Betalinger',
      bullets: [
        "Bitcoin / Litecoin (BIP-21): Standard cryptocurrency betaling URI 'er med tegnebogsadresse, valgfrit beløb og etiket. Kompatibel med alle store Bitcoin og Litecoin punge.",
        'Lightning Network (BOLT11): Lightning Network betaling fakturaer. Indsæt en BOLT11 kodet faktura streng til instant Bitcoin betalinger med minimale gebyrer.',
        "Ethereum (EIP-681): Ethereum-transaktionsanmodnings-URI'er, der understøtter native ETH-overførsler og ERC-20-tokenoverførsler. Inkluderer kæde-id til multi-netværkssupport (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gasparametre og kontraktfunktionskald.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Betalingslinketjenester',
      bullets: [
        'PayPal.Me: PayPal betaling links med brugernavn og valgfri forfyldt beløb. Modtagere kan betale via PayPal balance, kort eller bankkonti.',
        'Cash App: Cash App betalingslinks ved hjælp af $cashtag med valgfrit beløb. Populært i USA for peer-to-peer-betalinger.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Generisk EMV QR',
      bullets: [
        'EMV Generisk: Opret brugerdefinerede EMV Merchant-Presented Mode QR-koder til betalingsordninger, der ikke specifikt er angivet. Konfigurer forhandlernavn, by, landekode (ISO 3166-1), valutakode (ISO 4217 numerisk), MCC, muligheder for drikkepenge/bekvemmelighedsgebyrer og yderligere datafelter. Nyttig til test eller tilpassede integrationer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blend Modes (Professional)',
      paragraphs: ['Yderligere blanding tilstande i Professional niveau:'],
      bullets: [
        'Pixelat: Pixelated overlay effekt.',
        'Indhold: Kantdetektering overlay viser kun konturer.',
        'Bølge: Bølgeforvrængningseffekt.',
        'Subpixel størrelse: Variabel subpixel størrelse baseret på billede.',
        'Sand Dither: Avanceret dithering med bestilt matrix valg.',
        'Ekstrem: Maksimal billedsynlighed kan påvirke scanbarheden.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Beskyttelsesindstillinger',
      paragraphs: [
        'Finkornet kontrol over, hvilke QR-elementer der er beskyttet mod overlejringsændringer:',
      ],
      bullets: [
        'Reserve Timing: Hold tidsmønstrene uændrede.',
        'Bevar tilpasning: Hold indstillingsmønstre uændrede.',
        'Beskyt format Info: Informationsmoduler i skjoldformat.',
        'Beskyt version Info: Skjoldversionsinformationsmoduler.',
      ],
    },
    {
      heading: 'ECC- Aware tilstand',
      paragraphs: [
        'Intelligent distribuerer overlay intensitet baseret på fejlkorrektionskapacitet. Systemet analyserer, hvilke moduler der kan ændres, samtidig med at scannen bevares.',
      ],
      bullets: [
        'Risikobudget: Procentdel fejlkorrektionskapacitet at bruge (0- 100%).',
        'Højere budget = mere synlig overlay, men mere risikabel scannability.',
        'Lavere budget = sikrere scanning, men mindre synlige overlay.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professionelle udlejningsmuligheder',
      paragraphs: ['Avancerede destruktionskontroller:'],
      bullets: [
        'Crisp Edges: Brug pixeleret billede rendering til skarpe modul kanter.',
        'Pixel Snap: Gulv, runde, eller Ceil pixel justering.',
        'Per- Modul farve tilstand: Solid, ved lysstyrke, ved position, ved overlay, ved klynge.',
        'Farvepalet: Definer brugerdefinerede farve palette til per- modul farve.',
        'Kontrastbeskyttelse: Sørg for minimalt kontrastforhold mellem farver.',
        'Min kontrast Ratio: WCAG- stil kontrast krav (1: 1 til 21: 1).',
        'Ekstra kant Moduler: Yderligere grænse ud over stille zone.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professionelle outputindstillinger',
      paragraphs: ['Virksomhedens eksportindstillinger:'],
      bullets: [
        'DPI: Sæt udskriftsopløsning (72- 600 DPI). 300 DPI anbefales til udskrift.',
        'Inkludér stille zone: Slå stille zone i output dimensioner.',
        'Eksportér som ekstra: Generér PDF sammen med det primære format.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Animeringsindstillinger (Professional)',
      paragraphs: ['Yderligere professionelle animation funktioner:'],
      bullets: [
        'Temporal Dither: Off, Blå Støj, eller Flicker Safe per- frame dithering.',
        'Mønster: Ingen, Pulse, Wave, Scanline, Shimmer, eller Drift effekter.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Henvisning',
      paragraphs: [
        'ANQR giver en serverside API til at generere QR-koder via URL-parametre. Dette er ideel til indlejring QR-koder i hjemmesider, e-mails, dokumenter eller automatiserede arbejdsgange uden klient- side JavaScript.',
        'Base URL: https: / / anqr.link / api / qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Vis QR- eksempler', type: 'example' }],
    },
    {
      heading: 'Basisparametre',
      paragraphs: ['Krævede og fælles parametre (parameternavne er ikke oversat):'],
      bullets: [
        'data (påkrævet): Indholdet indkodes i QR-koden. URL- kode særlige tegn.',
        'størrelse: Billedstørrelse i pixels (standard: 400, max: 2000). Anvendes, hvis w / h ikke er specificeret.',
        'w, h: Udgangsbredde og højde i pixels. Overstiger størrelsesparameter.',
        'format: Output format - png, webp, eller gif (standard: png).',
        'ec: Fejlkorrektionsniveau - L, M, Q eller H (standard: H).',
        'fg: Forgrundsfarve som hex uden # (standard: 000000).',
        'bg: Baggrundsfarve som hex uden # (standard: ffffff).',
        'transparent: Indstil til 1 for gennemsigtig baggrund.',
        'margen: Stille zone i moduler (standard: 4).',
      ],
    },
    {
      heading: 'Stylingparametre',
      paragraphs: ['Modul og mønster styling:'],
      bullets: [
        'stil: Modul stil - firkantet, afrundet, prikker, diamant, tilsluttet.',
        'finder: Finde mønster stil - firkantet, afrundet, cirkel.',
        'tilpas: Tilpas mønster stil - match _ finder, firkantet, afrundet, cirkel.',
        'timing: Timing mønster stil - match _ modul, solid, stiplet.',
        'radius: Corner radius procentdel 0-100.',
        'mellemrum: Modul mellemrum procent 0-50.',
        'gapMode: Gap tilstand - ingen, inset, slagtilfælde, negativ _ space.',
        'øje Ydre, eyInner: Øje stilarter - firkantet, afrundet, cirkel.',
        'eye Scale: Øjenskalaprocent (standard: 100).',
        'gradient type - ingen, lineær, radial, conic.',
        'gradAngle: Gradientvinkel for lineære gradienter.',
        'gradient stopper som color1, pos1, color2, pos2,... (f.eks. ff0000,0,0000ff, 1).',
      ],
    },
    {
      heading: 'Overliggende parametre',
      paragraphs: ['Billedoverlay muligheder (overlay billede er hentet serverside):'],
      bullets: [
        'img: URL til at overlay billede (skal være offentligt tilgængelig).',
        'mode: Overlay mode - center, halftone, blanding, lysstyrke, mosaik, dithered, blue-larm, subpixel.',
        'intensitet: Overlay intensitet 0- 100 (standard: 100).',
        'farve Mode: Overlay farve mode - farve, gråskala, bw.',
        'fit: Hvordan overlay passer - dække, indeholde, strech.',
        'rot: Overlay rotation i grader.',
        'flipX, flipY: Sæt til 1 til flip overlay.',
        'behold Findere: Bevar findermønstre (standard: 1).',
        'keepTiming, keepAlign: Indstil til 1 for at bevare timing/justeringsmønstre.',
      ],
    },
    {
      heading: 'Forbehandling Parametre',
      paragraphs: ['Forbehandling af billeder anvendt på overlay:'],
      bullets: [
        'lysstyrke: Justering -100 til 100 (standard: 0).',
        'kontrast: Justering - 100 til 100 (standard: 0).',
        'gamma: Værdi 0,1 til 3 (standard: 1).',
        'mætning: Justering -100 til 100 (standard: 0).',
        'farvetone: Farvetone i grader.',
        'blur: Blur i pixels.',
        'skarphed: skarphed beløb 0- 100.',
        'posterize niveauer.',
        'tærskelværdi: Binær tærskel 0-255.',
        'kant: Kantdetektion - off, sobel, canny.',
        'invertér: Sæt til 1 til invertfarver.',
      ],
    },
    {
      heading: 'Vandmærkeparametre',
      paragraphs: ['Tilføj vandmærker til genererede QR-koder:'],
      bullets: [
        'wmEn: Indstil til 1 for at aktivere vandmærke.',
        'wm Kind: Vandmærke type - tekst, billede, mønster.',
        'wmText: Vandmærke tekst (URL- kodet).',
        'wmImg: URL til vandmærke billede.',
        'wmPos: Position - center, hjørner, kanter, bag, rolige _ zone.',
        'wmOpacity: Opacity 0- 100 (standard: 50).',
        'wmBlend: Blend mode - normal, multiplikation, skærm, overlay.',
      ],
    },
    {
      heading: 'Animeringsparametre',
      paragraphs: ['For animeret GIF output (kræver format = gif):'],
      bullets: [
        'anim Mønster: Animation mønster - ingen, puls, bølge, scanline, shimmer, drift, farve _ cycle.',
        'anim Rammer: Antal rammer 1-60 (standard: 24).',
        'anim Hastighed: Frame forsinkelse i millisekunder 10- 1000 (standard: 100).',
        'anim Frø: Tilfældigt frø til animation.',
        'lease: Animation lease - lineær, leasy _ in, leasy _ out, leasy _ in _ out, bounce.',
      ],
    },
    {
      heading: 'Udgangsparametre',
      paragraphs: ['Indstillinger for outputformat:'],
      bullets: [
        'kvalitet: WebP kvalitet 0-1 (standard: 0.9).',
        'webpQ: WebP kvalitet 0- 100 (standard: 90).',
        'gifColors: GIF palettestørrelse 2-256 (standard: 256).',
        'dpi: Output DPI for PNG (standard: 72).',
        'metaTitle, metaForfatter, metaCopy, meta Desc: PNG metadata felter.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Beskæringsparametre',
      paragraphs: ['Valgmuligheder for beskæring af overlaybillede:'],
      bullets: [
        'cropEn: Aktiver overlejringsbeskæring 0/1 (standard: 0).',
        'cropX: Afgrødecenter X som brøk 0-1 (standard: 0,5).',
        'cropY: Afgrødecenter Y som brøk 0-1 (standard: 0,5).',
        'cropSize: Beskæringsstørrelse som brøkdel af billede 0-1 (standard: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Sikkerhedslåsparametre',
      paragraphs: ['Kontroller, hvilke QR-elementer der er beskyttet mod overlejringsændringer:'],
      bullets: [
        'lockF: Låsefindermønstre 0/1 (standard: 1).',
        'lockT: Lås timing mønstre 0/1 (standard: 1).',
        'lockA: Lås justeringsmønstre 0/1 (standard: 1).',
        'lockFmt: Låseformatinfo 0/1 (standard: 1).',
        'lockV: Lås version info 0/1 (standard: 1).',
        'safeMode: Sikkerhedstilstand - slukket, balanceret, streng (standard: slukket).',
        'safeMinPx: Minimum modulstørrelse i pixels (standard: 2).',
        'safeMinQz: Minimum stille zone moduler (standard: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Auto-tuning parametre',
      paragraphs: ['Indstillinger for automatisk optimering:'],
      bullets: [
        'autoVer: Auto-vælg QR-version 0/1 (standard: 1).',
        'autoEcc: Automatisk valg af ECC-niveau 0/1 (standard: 0) - kun tip på serversiden.',
        'autoReducer: [KUN KLIENT] Reducer automatisk intensiteten, indtil den kan scannes - kræver scanningsvalideringsløkke.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Yderligere animationsparametre',
      paragraphs: ['Udvidede animationskontroller til GIF-output:'],
      bullets: [
        'loop: Animation looper kontinuerligt 0/1 (standard: 1).',
        'bounce: Ping-pong animationsretning 0/1 (standard: 0).',
        'omvendt: Afspil animation omvendt 0/1 (standard: 0).',
        'colorCycle: Aktiver farvecykluseffekt 0/1 (standard: 0).',
        'interp: Rammeinterpolation - ingen, crossfade, morph (standard: ingen).',
        'tempDither: Temporal dithering - off, blue_noise, flicker_safe (standard: off).',
        'startF: Animationens startramme (standard: 0).',
        'maxF: Maksimalt antal billeder at gengive (standard: 0 = auto).',
        'stepF: Frame step interval (standard: 1).',
        'jitter: [KUN KLIENT] Modul-jitter i pixels - kræver QR-regenerering pr. frame.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Dithering-parametre',
      paragraphs: ['Styr dithering-algoritmer til overlejringsbehandling:'],
      bullets: [
        'ditherKind: Dither-algoritme - error_diffusion, ordered_bayer, blue_noise osv. (standard: ordered_bayer).',
        'diffusionKernel: Fejldiffusionskerne - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (standard: floyd_steinberg).',
        'ditherStrength: Dither-intensitet 0-100 (standard: 50).',
        'serpentine: Serpentine dithering 0/1 (standard: 0).',
        'matrix: Ordnet dither-matrix - bayer2, bayer4, bayer8 (standard: bayer4).',
        'bnTile: Blue noise-flisestørrelse (standard: 64).',
        'bnSeed: Blå støj tilfældig frø (standard: 0).',
        'colorDither: Farve-dithering - ingen, per_kanal, perceptuel (standard: ingen).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixel parametre',
      paragraphs: ['Indstillinger for subpixel blandingstilstand:'],
      bullets: [
        'spGrid: Subpixelgitterstørrelse - 2x2, 3x3, 4x4 (standard: 3x3).',
        'spCenter: Centerregel - streng, halvtone_center (standard: streng).',
        'spNeutral: Neutral farve hex uden # (standard: 808080).',
        'spFinder: Finder tilsidesættelse - solid, stiliseret (standard: solid).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Halvtoneparametre',
      paragraphs: ['Indstillinger for halvtoneblandingstilstand:'],
      bullets: [
        'htCell: Halvtonecellestørrelse - per_modul eller nxn-gitter (standard: per_modul).',
        'htDot: Prikform - cirkel, firkant, linje (standard: cirkel).',
        'htKurve: Lysstyrkekurve - lineær, s-kurve, gamma (standard: lineær).',
        'duo1: Duotone skyggefarve hex uden # (standard: 000000).',
        'duo2: Duotone highlight farve hex uden # (standard: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-bevidste tilstandsparametre',
      paragraphs: ['Intelligent overlejringsfordeling baseret på fejlkorrektionskapacitet:'],
      bullets: [
        'eccAware: Aktiver ECC-bevidst tilstand 0/1 (standard: 0).',
        'eccRisk: Risikobudgetprocent 0-100 (standard: 50).',
        'eccMap: Vægtkort - distance_to_finders, block_heatmap, empirical_scan_heatmap (standard: distance_to_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Rammeparametre',
      paragraphs: ['Indstillinger for dekorative rammer:'],
      bullets: [
        'frame: Frame style - none, rounded_frame, sticker, tag (standard: none).',
        'frameText: Tekst, der skal vises i ramme (URL-kodet).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Farveparametre pr. modul',
      paragraphs: ['Individuelle modulfarvemuligheder:'],
      bullets: [
        'modColor: Farvetilstand - solid, by_brightness, by_position, by_overlay, by_cluster (standard: solid).',
        'cGuard: Kontrastbeskyttelse 0/1 (standard: 0).',
        'minContrast: Minimum kontrastforhold 1-21 (standard: 4,5).',
        'palette: Kommaseparerede hex-farver til palettilstand.',
        'paletteMode: Palettefordeling - position, lysstyrke, diagonal, radial, tilfældig, række, kolonne (standard: position).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF-overlejringsparametre',
      paragraphs: ['Indstillinger for animerede GIF-overlejringsbilleder:'],
      bullets: [
        'ovType: Overlejringstype - statisk, gif, apng, webp_anim, video (standard: statisk).',
        'ovFramePick: Rammevalg - alle, hver_n, max_rammer, varighedsgrænse (standard: alle).',
        'gifDelays: Brug originale GIF-rammeforsinkelser 0/1 (standard: 1).',
        'gifDispH: GIF-bortskaffelseshåndtering - respektere, forenkle (standard: respekt).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Per-ECC intensitetsgrænser',
      paragraphs: ['Maksimal overlejringsintensitet pr. fejlkorrektionsniveau:'],
      bullets: [
        'maxIntL: Maks. intensitet for ECC L 0-100 (standard: 100).',
        'maxIntM: Maks. intensitet for ECC M 0-100 (standard: 100).',
        'maxIntQ: Maks. intensitet for ECC Q 0-100 (standard: 100).',
        'maxIntH: Maks. intensitet for ECC H 0-100 (standard: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA-simuleringsparametre (kun klient)',
      paragraphs: [
        'Disse parametre analyseres for URL-kompatibilitet, men fungerer kun i browseren:',
      ],
      bullets: [
        'qaContrast: Aktiver kontrastkontrol 0/1 - kræver interaktiv validering.',
        'qaBlur: Simuler sløring i pixels - kun til interaktiv test.',
        'qaNoise: Simuler støjniveau - kun til interaktiv test.',
        'qaHeatmap: Vis læsbarhed varmekort 0/1 - kræver lærredsoverlejring UI.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Kun klient-parametre',
      paragraphs: [
        'De fleste API-parametre er fuldt understøttet på serversiden. Parametre markeret med [KUN KLIENT] parses for URL-kompatibilitet, men kræver browserfunktioner:',
      ],
      bullets: [
        'jitter: Modul jitter kræver per-frame QR-regenerering med tilfældighed.',
        'autoReducer: Autoreducer intensiteten kræver iterativ scanningstest.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: QA-simulering kræver interaktiv lærredsvalidering.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Yderligere outputparametre',
      paragraphs: ['Udvidede output- og eksportindstillinger:'],
      bullets: [
        'fname: Brugerdefineret filnavn til downloads (standard: anqr-qrcode).',
        'inclQz: Inkluder stille zone i outputmål 0/1 (standard: 1).',
        'bgOver: Baggrundsfarve tilsidesætter hex uden # (tilsidesætter bg-parameter).',
        'fmtExtra: Yderligere formatoutput - ingen, eps, animated_webp (standard: ingen). Bemærk: eps er [DELVIS].',
        'svgPrec: SVG-formpræcision - pixel, præcis (standard: pixel). [DELVIS] SVG-output begrænset server-side.',
        'svgEmbed: Integrer rasteroverlejring i SVG 0/1 (standard: 1). [DELVIS] SVG-output begrænset server-side.',
        'modulPx: Modulpixelstørrelse (standard: automatisk beregnet ud fra størrelse).',
        'border: Ekstra kantmoduler ud over stille zone (standard: 0).',
        'crisp: Aktiver skarp/pixeleret billedgengivelse 0/1 (standard: 1).',
        'snap: Pixel snap-tilstand - gulv, rund, loft (standard: gulv).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Mønsterbevaringsparametre',
      paragraphs: ['Kontroller, hvilke strukturelle elementer der er beskyttet mod overlejring:'],
      bullets: [
        'keepFinders: Bevar findermønstre 0/1 (standard: 1).',
        'keepTiming: Bevar timingmønstre 0/1 (standard: 0).',
        'keepAlign: Bevar justeringsmønstre 0/1 (standard: 0).',
        'protectFmt: Beskyt format info moduler 0/1 (standard: 0).',
        'protectVer: Beskyt version info moduler 0/1 (standard: 0).',
      ],
    },
    {
      heading: 'Eksempel på brug',
      paragraphs: [
        'Grundlæggende QR-kode:',
        'https: / / anqr.link / api / qr? data = https: / / example.com',
        'Stillet QR-kode med brugerdefinerede farver:',
        'https: / / anqr.link / api / qr? data = Hello & size = 300 & fg = 1e40af & bg = ffffff & style = afrundet & radius = 30',
        'QR-kode med overlejret billede:',
        'http: / / anqr.link / api / qr? data = https: / / example.com & ec = H & img = https: / / example.com / logo.png & mode = halftone & intensitet = 70',
        'Animeret GIF:',
        'https: / / anqr.link / api / qr? data = Hello & format = gif & animMønster = puls & animFrames = 24 & lease = leasy _ in _ out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Vis QR- eksempler', type: 'example' }],
    },
    {
      heading: 'Indlejring af QR-koder',
      paragraphs: [
        "I Professionel tilstand genererer Share-funktionen indlejret HTML og URL 'er. Her er hvordan indlejring virker:",
      ],
      bullets: [
        'Del Link: Opretter en URL til ANQR-appen med alle dine indstillinger indkodet som URL-parametre. Modtagere kan se og ændre QR-koden.',
        'Indlejret billede: Genererer en < img > tag peger på serveren API. QR-koden bliver serversiden og bruges som et billede.',
        'Integrer Markdown: Opretter Markdown-billedsyntaks til dokumentation og README-filer.',
        'Direkte API URL: Den rå API URL til brug i programmer, scripts eller andre integreringer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML- eksempel',
      paragraphs: [
        'For at indføje en QR-kode på dit websted:',
        '< img src = "https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 200" alt = "QR Code" / >',
        'For responderende størrelsessortering:',
        '< img src = "https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 400" alt = "QR Code" stil = "max- bredde: 100%; højde: auto;" / >',
        'Serveren caches svar med lange cache headers, så gentagne anmodninger om den samme URL er hurtige.',
      ],
    },
    {
      heading: 'Del URL-format',
      paragraphs: [
        'Når du klikker på Del i Professionel tilstand, indkoder ANQR dine nuværende indstillinger i URL-parametre. Formatet er:',
        'https: / / anqr.link /? data =... & ec = H & style = afrundet &....',
        'Disse parametre afspejler API parametre, så du kan konvertere en aktie URL til en API URL ved at ændre base sti fra / til / api / qr og justere w / h parametre efter behov.',
        'Bemærk: Overlay billeder uploadet fra lokale filer kan ikke deles via URL - kun URL- baserede overskrifter (img parameter) arbejde i delte links og API-opkald.',
      ],
    },
    {
      heading: 'Rate grænser og brug',
      paragraphs: [
        'API er gratis at bruge til rimelige mængder. For brug af høj volumen eller kommercielle applikationer, der kræver garanteret oppetid, bedes du kontakte os.',
        'API-svar inkluderer aggressive caching-headere. For at opnå den bedste ydeevne skal du cache svar på din side eller bruge den samme URL konsekvent til identiske QR-koder.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Bedste praksis',
      paragraphs: ['Følg disse retningslinjer for pålidelige QR-koder:'],
      bullets: [
        'Test altid dine QR-koder med flere scanner apps før udskrivning.',
        'Brug fejlkorrektion H (høj) når der tilføjes overskrifter.',
        'Hold mindst 4 moduler af stille zone (margin).',
        'Sikre høj kontrast mellem forgrund og baggrund.',
        'Til udskrift anvendes mindst 300 DPI og test ved den faktiske udskriftsstørrelse.',
        'Aktivér reservemønstre ved brug af overlejringer.',
        'Start med lavere overlay intensitet og stigning gradvist.',
        'Til udendørs brug, overveje større modul størrelser og højere fejlkorrektion.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Gennemse Lær artikler', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Vis QR- eksempler', type: 'example' },
      ],
    },
    {
      heading: 'Fejlfinding',
      paragraphs: ['Fælles spørgsmål og løsninger:'],
      bullets: [
        'QR vil ikke scanne: Reducer overlay intensitet, øge fejlkorrektion, kontrollere kontrast.',
        'Koden er for stor: Reducer indholdslængden, brug URL-forkorter, lavere version.',
        'Sløret output: Forøg modulstørrelsen, brug PNG i stedet for komprimerede formater.',
        'Farver ser forkerte ud: Tjek farve kontrast, prøv gråskala overlay mode.',
        'GIF animerer ikke: Sørg for at bruge GIF-format output, tjek antal billeder.',
        'Billedoverlejring ikke indlæsning: Tjek CORS tilladelser på fjernbilleder.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Se tilhørende vejledninger og eksempler',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tastaturgenveje',
      paragraphs: [
        'ANQR understøtter standard tastaturgenveje. Brug Ctrl / Cmd + S til at udløse eksport (når du fokuserer på forhåndsvisningen).',
      ],
    },
    {
      heading: 'Deling og indlejring',
      paragraphs: [
        'I professionel tilstand skal du klikke på knappen Del for at kopiere en URL med dine nuværende indstillinger. Modtagere kan åbne denne URL for at se din nøjagtige konfiguration. Bemærk: Overlejringsbilleder fra lokale filer kan ikke deles via URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Prøv denne konfiguration direkte i ANQR generatoren.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Gennemse Lær artikler', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Vis QR- eksempler', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Vis QR- eksempler', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Åbn generatoren', type: 'generator' },
  ],
};

export default guide;
