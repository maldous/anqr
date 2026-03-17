import type { PageDefinition } from "../types";

export const guide: PageDefinition = {
  title: "ANQR Brukerveiledning",
  description: "Komplett guide til å bruke ANQR til å opprette QR-koder.",
  lastUpdated: "1. februar 2026",
  breadcrumb: ["Veiledning"],
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Åpne generatoren", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Bla gjennom Lær artikler", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Vis QR eksempler", type: "example" },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: "Komme i gang",
      paragraphs: [
        "ANQR er en QR-kodegenerator med en klient-første tilnærming. Som standard genereres QR-koder lokalt i nettleseren din - ingen konto kreves og dataene forblir private. For profesjonell innlegging kan du også bruke serversiden API.",
        "Grensesnittet har tre grensesnittnivå: Basic, Advanced og Professional. Velg nivået ved hjelp av fanene i overskriften. Hvert nivå låser opp ekstra funksjoner mens du holder grensesnittet fokusert på det du trenger.",
      ],
      bullets: [
        "Grunnleggende: Enkel QR-kodeskaping med vanlig tekst/URL-innhold og bildeoverlegg.",
        "Avansert: QR-kodingsalternativer, gjengivelsesstiler, animasjon, utdataformater, utvidede innholdstyper og overleggstilpassing.",
        "Profesjonell: Vannmerker, metadata, deling, sikkerhetsanalyse, betaling QR-koder og bedriftsfunksjoner.",
      ],
      links: [{ href: "/?lang=${lang}", label: "Åpne generatoren", type: "generator" }],
    },
    {
      heading: "Rask start",
      paragraphs: ["For å lage din første QR-kode:"],
      bullets: [
        "1. Velg en innholdstype (URL, tekst, WiFi, etc.) fra innholdstype.",
        "2. Skriv inn dine data i de angitte feltene.",
        "3. Valgfritt å tilpasse farger, stiler og legge til et overleggsbilde.",
        "4. Klikk på Eksporter for å laste ned QR-koden som PNG, GIF, WebP eller SVG.",
      ],
      links: [
        {
          href: "/?lang=${lang}",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: "Grunnleggende funksjoner",
      paragraphs: [
        "Grunnnivået gir et strømlinjeformet grensesnitt for å lage QR-koder med nyttelastinnhold og bildeoverlegg. Dette er den enkleste måten å komme i gang på.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Innholdstyper (Basic)",
      paragraphs: [
        "Ren tekst: Kod hvilken som helst tekst opp til grensen for QR-kodekapasitet. Ideell for korte meldinger, koder eller identifikatorer.",
        "URL: Kode webadresser. QR-koden åpner URL-en når den skannes. Støtter http://og https://protokoller.",
      ],
    },
    {
      heading: "Bilder Overlegg (Basic)",
      paragraphs: [
        "Last opp et bilde (JPG, PNG, GIF, WebP) for å blande seg med QR-koden din. Grunnleggende overleggsfunksjoner inkluderer:",
      ],
      bullets: [
        "Last opp fra fil: Velg et bilde fra enheten.",
        "Last fra URL: Skriv inn en bildeadresse (må ikke tillate CORS).",
        "Senter logo: Plasserer bildet i sentrum, avhengig av feilretting.",
        "Blanding: Enkel alfa blanding av bildet med QR-mønster.",
        "Intensitet: Kontroller hvor sterkt overlegget påvirker QR-koden (0-100%).",
        "Fargemodus: Full farge, gråtone eller svart/hvitt.",
        "Bevar Finder-mønstre: Holder hjørnemønstre uendret for pålitelig skanning.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic#overlay",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: "Avanserte funksjoner",
      paragraphs: [
        "Det avanserte nivået låser QR-kodingsalternativer, gjengivelsesstiler, animasjon, utgangsformater, utvidede innholdstyper og avansert overleggstilpasning.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "QR-kodingsinnstillinger",
      paragraphs: [
        "Versjon: QR-koder kommer i versjon 1-40, med høyere versjoner som inneholder mer data, men er større. Sett til 0 (Auto) for å la ANQR velge den minste versjonen som passer til innholdet ditt.",
        "Feilretting: Avgjør hvor mye skade en QR-kode kan opprettholde mens den forblir skantable.",
      ],
      bullets: [
        "L (Low): 7% feilretting - minste størrelse, minst redundans.",
        "M (medium): 15% feilretting - balansert alternativ.",
        "Q (kvartil): 25 % feilretting - bra for trykte koder.",
        "H (Høy): 30 % feilretting – best for koder med overlegg eller under tøffe forhold.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#qr-encoding",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Stille Zone (Margin)",
      paragraphs: [
        "Stillesonen er det hvite rommet rundt QR-koden. Skannere trenger denne margen for å oppdage hvor koden starter. Standarden anbefaler minst 4 moduler. Reduksjon til under 4 kan føre til skanneproblemer.",
      ],
    },
    {
      heading: "Modulstil",
      paragraphs: [
        "Moduler er de enkelte firkanter som utgjør en QR-kode. ANQR tilbyr fem stiler:",
      ],
      bullets: [
        "Square: Klassisk QR utseende med skarpe hjørner.",
        "Avrundede: Mykede hjørner for et vennligere utseende.",
        "Prikker: Sirkulære moduler for en moderne estetikk.",
        "Diamant: 45° roterte firkanter for et særegent mønster.",
        "Tilkoblet: Moduler slås sammen når de tilstøter, og skaper organiske former.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Finder mønster stil",
      paragraphs: [
        "Finnemønstre er de tre store firkantene i QR hjørner som hjelper skannere orientere koden. Tilgjengelige stiler:",
      ],
      bullets: [
        "Square: Standard firkantede hjørner.",
        "Avrundet: Mykte hjørner som passer avrundet modulstil.",
        "Sirkel: Sirkulære finnermønstre for koder i prikkstil.",
      ],
    },
    {
      heading: "Justering & Timing-mønster",
      paragraphs: [
        "Justeringsmønstre vises i større QR-koder (versjon 2+) for å hjelpe til med å korrigere forvrengning. Tidsmønstre er de vekslende linjene som forbinder finnermønstre.",
      ],
      bullets: [
        "Justeringsstil: Match Finder, firkant, rundet eller sirkel.",
        "Timing Style: Match Module, Solid eller Dashed.",
      ],
    },
    {
      heading: "Farger",
      paragraphs: [
        "Forgrunn: Fargen på QR-modulene. Svart (# 0,00000) er standard, men alle mørke farger fungerer.",
        "Bakgrunn: Bakgrunnsfarge. Hvit (#ffffff) er standard. Sikre tilstrekkelig kontrast med forgrunnen.",
        "Gjennomsiktig bakgrunn: Fjern bakgrunnen helt for bruk på fargede overflater. Sørg for at overflaten gir tilstrekkelig kontrast.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Modulstørrelse & Gap",
      paragraphs: [
        "Modulstørrelse: Kontrollerer hvor stor hver modul er i piksler. Større verdier skaper større, enklere å skanne koder.",
        "Modul Gap: Legger til plass mellom moduler som prosent. Små hull (5-15%) kan forbedre skannbarheten i enkelte forhold, men store hull reduserer påliteligheten.",
      ],
    },
    {
      heading: "Utgangsinnstillinger",
      paragraphs: ["Format: Velg eksportformat basert på brukstilfelle."],
      bullets: [
        "PNG: Tapsfritt rasterformat, ideelt for de fleste bruksområder. Best for print og digital.",
        "WebP: Moderne format med mindre filstørrelser. Bra for nettbruk.",
        "GIF: Påkrevd for animerte QR-koder. Støtter åpenhet.",
        "SVG: Vektorformat som skaleres uendelig. Best for stor skrift eller når du trenger å redigere koden.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-3",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    {
      heading: "Utgangsdimensjoner",
      paragraphs: [
        "Breidde/høyde: Angi utgangsstørrelse i piksler. For utskrift, beregne basert på DPI (f.eks. 300 DPI på 1 tomme = 300px). Større størrelser skanner mer pålitelig på avstand.",
      ],
    },
    {
      heading: "Animasjonsinnstillinger (Avansert)",
      paragraphs: ["Kontroller animert QR-kodeadferd:"],
      bullets: [
        "Hastighet: Animasjonsrammehastighet i millisekunder.",
        "Loop: Kontinuerlig eller enkeltspill animasjon.",
        "Bounce: Ping-pong animasjon retning.",
        "Start ramme: Begynn animasjon fra spesifikk ramme.",
        "Max Frames: Begrens totale rammer i animasjon.",
        "Frame Step: Hopp over rammer for raskere animasjon.",
        "Interpolering: Ingen, Crossfade eller Morph mellom rammer.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    {
      heading: "Innholdstyper (Avansert)",
      paragraphs: ["Avansert nivå låser opp ytterligere nyttelastformater:"],
      bullets: [
        "Telefonnummer (tel:): Oppretter en telefonlenke.",
        "E-post (post til:): Åpner e-postklient med valgfritt emne og kropp.",
        "SMS: Forfylt tekstmelding til et telefonnummer.",
        "vCard: Full kontaktkort med navn, organisasjon, telefon, e-post, adresse.",
        "MeCard: Kompakt kontaktformat populært i Japan.",
        "BizCard: Legacy visittkortformat.",
        "Geo Plassering: GPS koordinater som åpnes i kart.",
        "WiFi: Nettverkslegitimasjon for automatisk tilkobling (SSID, passord, sikkerhetstype).",
        "Kalender Hendelse: iCalendar-format med tittel, plassering, dato/tid.",
        "Hendelsesbesvarelse: Link til hendelsesregistrering.",
        "Abonner på en ICS/WebCal-feed.",
        "Fil/dokument URL: Direkte lenke til nedlastbare filer.",
        "Cloud Storage Link: Linker til Google Drive, Dropbox, OneDrive, etc.",
        "Sosial profil: Linker til LinkedIn, Twitter, Instagram osv.",
        "Meldingslink: WhatsApp, Telegram, Signal dype lenker.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Avanserte overleggsfunksjoner",
      paragraphs: ["Ytterligere overleggsfunksjoner:"],
      bullets: [
        "Beskjær: Aktiver beskjæring for å velge et kvadratisk område av bildet ditt.",
        "Halftone: Klassisk utskrift-stil prikk mønster basert på bilde lysstyrke.",
        "Dithered: Feil-diffusjonsdithering for detaljert reproduksjon.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#overlay",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Overlegg blandemoduser (avansert)",
      paragraphs: ["Ytterligere blandingsmoduser i avansert nivå:"],
      bullets: [
        "Underpiksel: Deler hver modul inn i underpiksler for høyere detaljer.",
        "Blue Noise: Bruker blå støydithering for artefaktfrie mønstre.",
        "Mosaikk: Flisebasert effekt som bevarer bildestruktur.",
        "Gap Fyll: Plasserer bildet i hull mellom moduler.",
        "Lysstyrke: Varies modulstørrelse basert på bildelysstyrke.",
        "Duotone: Tilordner bildet til to farger for slående kontrast.",
      ],
    },
    {
      heading: "Overlegg Intensitet",
      paragraphs: [
        "Kontrollerer hvor sterkt overlegget påvirker QR-koden (0,100%). Høyere verdier viser mer bildedetaljer, men kan redusere skannbarhet. Start rundt 70% og justere basert på testing.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    {
      heading: "Fargemodus",
      paragraphs: ["Hvordan overleggsbildet behandles:"],
      bullets: [
        "Full farge: Bevarer originalbildefarger.",
        "Gråskala: Konverterer til svart og hvitt.",
        "Svart/hvitt: Høy kontrast binær konvertering.",
      ],
    },
    {
      heading: "Bevar Finder mønster",
      paragraphs: [
        "Når aktivert, holder de tre hjørnesøkermønstrene uendret av overlegget. Anbefales på det sterkeste for pålitelig skanning.",
      ],
    },
    {
      heading: "Forbehandling av bilder",
      paragraphs: [
        "Bruk filtre på overleggsbildet før blanding. Disse justeringene kan forbedre hvordan bildet vises i den endelige QR-koden.",
      ],
      bullets: [
        "Lysstyrke (-100 til +100): Lysere eller mørkere bildet.",
        "Kontrast (-100 til +100): Øke eller redusere tonalt område.",
        "Gamma (0,2 til 3.0): Ikke-lineær lysstyrkejustering. Verdier under 1 lysere midtoner, over 1 mørkere dem.",
        "Metning (-100 til +100): Fargeintensitet. -100 er gråton, +100 er overmettet.",
        "Hue rotasjon (0-360°): Skift alle farger rundt fargehjulet.",
        "Slør (0-0px): Myke bildedetaljer.",
        "Skjerp (0-100%): Forbedre kanter og detaljer.",
        "Posterize (0-16 nivåer): Reduser fargenivåer for en plakateffekt.",
        "Terskel (0-255): Konverter til binær svart/hvitt ved avskjæring.",
        "Kantgjenkjenning: Sobel- eller Canny-algoritmer for kun å vise kanter.",
        "Reverser alle farger.",
      ],
    },
    {
      heading: "Fitmodus",
      paragraphs: ["Hvordan overleggsbildet passer QR-kodeområdet:"],
      bullets: [
        "Deksel: Bilde fyller hele området, beskjering om nødvendig.",
        "Inneholder: Hele bildet synlig, kan ha marginer.",
        "Stretch: Bildet forvrenger å fylle nøyaktig.",
      ],
    },
    {
      heading: "Transformasjonsalternativer",
      paragraphs: [
        "Rotasjon: Roter overlegg i 90° trinn.",
        "Flip X/Y: Speil bildet horisontalt eller vertikalt.",
      ],
    },
    {
      heading: "Dindringsalgoritmer",
      paragraphs: [
        "Dithering konverterer kontinuerlig tonebilder til mønstre som QR-koder kan representere. Tilgjengelig når du bruker Dithered, Blue Noise eller True Dither blandingsmodus.",
      ],
      bullets: [
        "Feil Diffusion: Classic Floyd-Steinberg stil. Sprer kvantiseringsfeil til nabopiksler.",
        "Bestilt (Bayer): Bruker en terskelmatrise for vanlige mønstre.",
        "Clustered Dot: Simulerer halvtoneutskrift.",
        "Void & Cluster: Optimert bestilling.",
        "Blå støy: Visuelt hyggelig tilfeldig utseende mønster.",
        "Blåstøy Terskel: Terskel utjamning med blå støy tekstur.",
        "Hvit støy: Tilfeldig terskel.",
        "Gaussisk/triangulær Støy: Støy med forskjellige distribusjoner.",
        "Blå støy + feildiffusion: Hybrid kombinerer begge teknikkene.",
        "Skjermet blå støy: Skjermlignende blå støymønster.",
        "Perseptuell: Luminansvektet for bedre visuelle resultater.",
        "Kantbevisst: Bevarer bildekantene under dithering.",
        "Adaptiv terskel: Lokalt adaptiv terskel.",
        "Temporal blå støy: For animerte GIFs, varierer mønster per ramme.",
      ],
    },
    {
      heading: "Diffusion Kerneler",
      paragraphs: ["Velg hvordan feilen distribueres ved bruk av Feil Diffusion dithering:"],
      bullets: [
        "Floyd-Steinberg: Klassisk 4-nærliggende diffusjon. Godt generelt valg.",
        "Jarvis-Judice-Ninke: 12-neighbor, jevnere men langsommere.",
        "Stucki: Lignende JJN med ulike vekter.",
        "Burker: Forenklet JJN, raskere.",
        "Sierra: Familie av kjerner balansere kvalitet og hastighet.",
        "Atkinson: Lys diffusjon, bevarer detaljer, men kan være kornaktig.",
      ],
    },
    {
      heading: "Endere styrke",
      paragraphs: [
        "Kontrollerer hvor mye dithering brukes (0,100%). Lavere verdier bevarer mer av det opprinnelige mønsteret, høyere verdier viser mer bildedetaljer.",
      ],
    },
    {
      heading: "Underpikselinnstillinger",
      paragraphs: ["Ved bruk av subpikselblandingsmodus:"],
      bullets: [
        "Gridstørrelse: 2×2, 3×3, eller 4×4 underpiksler per modul. Høyere = mer detaljer.",
        "Senterregel: Strengt krever midt underpiksel for å matche modulen. Halvtonesenter tillater variasjon.",
        "Nøytral farge: Farge brukt for ubestemte underpiksler.",
        "Finner Overstyr: Hvordan finne mønstre er gjengitt (solid eller stilisert).",
      ],
    },
    {
      heading: "Halvtoneinnstillinger",
      paragraphs: ["Når du bruker Halftone blandingsmodus:"],
      bullets: [
        "Cellstørrelse: per modul eller NxN rutenett.",
        "Punktform: Sirkel, firkant eller linje.",
        "Lysstyrkekurve: Linear, S-Kurve eller Gamma.",
      ],
    },
    {
      heading: "Duotonefarger",
      paragraphs: [
        "Når du bruker duotone blandemodus, angi skyggefarge (mørke områder) og fargeheve (høyre områder).",
      ],
    },
    {
      heading: "GIF- animasjonsinnstillinger",
      paragraphs: ["Når du bruker animerte GIF-overlegg:"],
      bullets: [
        "Bruk rammeforsinkelser: Respekt original GIF-tid.",
        "Maks FPS: Begrens rammehastighet (1-60 fps).",
        "Dispositionshåndtering: Respekt eller forenkle rammeavhendingsmetoder.",
      ],
    },
    {
      heading: "Avanserte gjengivelsesalternativer",
      paragraphs: ["Ytterligere gjengivelseskontroller:"],
      bullets: [
        "Gapmodus: Ingen, Innsats, Stroke eller Negativ mellomroms gap styling.",
        "Hjørneradius: Prosent av avrundede hjørner for moduler.",
        "Gradient: Ingen, lineær, Radiell eller konisk gradient på moduler.",
        "Øye ytre/indre stil: Uavhengig styling for ringer med finnermønster.",
        "Dot rotasjon: Roter diamant/dot moduler.",
        "Øyeskala: Størrelsesjustering for finnermønstre.",
        "Rammestil: Legg til dekorative rammer (Rounded Frame, Sticker, Tag).",
        'Rammetekst: Legg til tekst som "Scan Me!" i rammer.',
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Avansert QR-koding",
      paragraphs: ["Fine-tune QR-koding:"],
      bullets: [
        "Kodingsmodus: Auto, Numeric, Alfanumeric, Byte/UTF-8 eller Kanji.",
        "Enforce Min Stille Zone: sikre minst 4 modulmargin.",
        "Maskemønster: Auto (optimalt), eller manuelt velg mønstre 0-7 for å kontrollere moduldistribusjonen. Ulike mønstre skaper forskjellige visuelle utseende mens de koder for de samme dataene.",
        "Tegnkoding: ISO-8859-1 (Latin-1 standard), UTF-8 (full Unicode inkludert emoji) eller Shift-JIS (japansk). Velg basert på innholdets karakterkrav.",
      ],
    },
    {
      heading: "Avanserte utgangsalternativer",
      paragraphs: ["Ekstra eksportinnstillinger:"],
      bullets: [
        "Filnavn: Egendefinert filnavn for nedlastinger.",
        "GIF Palettstørrelse: 2-256 farger i GIF-utgang.",
        "GIF Quantizer: Median Cut, NeuQuant eller Octree fargereduksjon.",
        "GIF Dithering: Av, Floyd-Steinberg, eller Bestill.",
        "GIF Gjennomsiktig farge: Sett en farge som skal være gjennomsiktig.",
        "SVG True Vector: Bruk baner i stedet for innebygd raster.",
        "SVG Form presisjon: Pixel eller presis banegjengivelse.",
        "SVG Bygg inn Raster Overlay: Inkluder overlegg som innebygd bilde.",
        "Bakgrunn Overstyr: Tving en bestemt bakgrunnsfarge i utgangen.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Valideringsalternativer",
      paragraphs: ["Inndatabehandlingsinnstillinger:"],
      bullets: [
        "Valider inndata: Sjekk innholdsformat før koding.",
        "Trim Whitespace: Fjern ledende/strimbare områder.",
        "Normalisere nye linjer: Konverter alle linjer til LF.",
        "Maks lengdevakt: Varsle om innhold overstiger QR-kapasitet.",
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: "Profesjonelle funksjoner",
      paragraphs: [
        "Profesjonelt nivå legger til vannmerker, metadata, delingsalternativer, sikkerhetsanalyse, betaling QR-koder og bedriftsfunksjoner.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Vannmerke",
      paragraphs: ["Legg vannmerker til dine QR-koder:"],
      bullets: [
        "Type: Tekst, bilde eller mønster vannmerke.",
        "Posisjon: Senter, hjørner, kanter, bak, eller stille sone.",
        "Dekkevne: Vannmerke gjennomsiktighet (0-100%).",
        "Blandemodus: Normal, multiplisert, skjerm eller overleggsblanding.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#watermark",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Metadata",
      paragraphs: ["Bygg inn metadata i eksporterte filer:"],
      bullets: [
        "Tittel, Forfatter, opphavsrett, lisens, Beskrivelse felt.",
        "Skapelsestid: Bygg inn generasjonens tidsstempel.",
        "Egendefinert nøkkelverdi: Legg til vilkårlige metadatapar.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#metadata",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Deling",
      paragraphs: ["Del dine QR-kodekonfigurasjoner:"],
      bullets: [
        "Direkte link: Opprett en delt URL med gjeldende innstillinger.",
        "Bygg inn HTML: Få innbyggingskode for nettsteder.",
        "Kodeparametere: Ta med alle innstillinger i delt URL.",
        "Merk: Overlegg bilder fra lokale filer kan ikke deles via URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-7",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    {
      heading: "Sikkerhetsanalyse",
      paragraphs: ["Sørg for at QR-koder fortsatt kan skannes:"],
      bullets: [
        "Sikkerhetsmodus: Av, balansert eller strenge skannekrav.",
        "Min Module Størrelse: Minimum pikselstørrelse per modul.",
        "Min stille Sone: Minimum marginmoduler.",
        "Lock Finders/Timing/Align/Format/Version: Beskytt bestemte elementer.",
        "Max Overlay Intensitet ved ECC: Automatiske intensitetsgrenser basert på feilrettingsnivå.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#safety",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    {
      heading: "Innholdstyper (Profesjonell)",
      paragraphs: ["Profesjonelt nivå legger til betalings- og foretaksinnholdstyper:"],
      bullets: [
        "EPC/SEPA (EU): Europeisk bankoverføring QR-koder med IBAN, BIC, beløp, referanse.",
        "UPI (India): Unified Payments Interface med VPA, Payee name, beløp.",
        "PayNow (Singapore): Singapore hurtig betaling med UEN eller mobilnummer.",
        "(Thailand): Thai nasjonale betalingssystem.",
        "PIX (Brazil): Brasiliansk øyeblikksbetaling med PIX-nøkkel.",
        "Crypto: Bitcoin, Ethereum, Litecoin-betalingsadresser med valgfritt beløp.",
        "Markedsføringskampanje Link: URL-adresser med full UTM-parameter (Marketing Tags) sporing.",
        "Short Link: For bruk med URL-forkortere for dynamiske/sporbare QR-koder.",
        "GS1 Digital Link: Produktidentifikasjon med GTIN, serie, sats, utløp.",
        "App Deep Link: iOS/Android app dype lenker med tilpassede ordninger.",
        "Tilpasset format: Rå data uten formatering eller validering.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-2",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: "Language-Relevante betalinger i avansert modus",
      paragraphs: [
        "Når du bruker avansert modus, viser ANQR automatisk betalingsmåter som er relevante for ditt valgte språk. For eksempel ser vietnamesiske brukere VietQR, thailandske brukere ser PromptPay, og indiskspråklige brukere ser UPI og BharatQR. Globale betalingsmåter (kryptovaluta, PayPal, Cash App) er tilgjengelig på alle språk. Profesjonell modus låser opp alle betalingsstandarder uavhengig av språk.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Europeiske betalingsstandarder",
      bullets: [
        "EPC/SEPA (EU): Europeiske QR-koder for bankoverføring som følger EPC QR Code Standard. Støtter IBAN, BIC (valgfritt for innenlandsk), beløp i EUR og strukturerte eller ustrukturerte betalingsreferanser. Brukes på tvers av SEPA-sonen inkludert EU-land pluss Sveits, Norge, Island, Liechtenstein, Monaco og San Marino.",
        "Sveitsisk QR-bill: Sveitsisk betalingsstandard etter SIX implementeringsretningslinjer. Støtter CHF og EUR, QR-reference (QRR), Creditor Reference (ISO 11649), strukturerte kreditor-/debitoradresser og faktureringsinformasjon. Det er nødvendig med sveitsiske fakturaer siden 2022.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Indiske betalingsstandarder",
      bullets: [
        "UPI (India): Unified Payments Interface som følger NPCI Deep Linking Spesifikasjon. Støtter VPA (Virtual Payment Address), betalingsnavn, beløp i INR, transaksjonsnote, referanse-ID, handelskategorikode og transaksjonsmodus.",
        "BharatQR (India): Enhetlig QR-standard som støtter både UPI- og kortbaserte betalinger. Kombinerer UPI VPA med kort PAN for maksimal kompatibilitet. Inkluderer selgernavn, by, MCC, GST-detaljer og faktura-/referansenumre.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Sørøstasiatiske betalingsstandarder",
      bullets: [
        "PayNow (Singapore): Singapore rask betalingssystem ved hjelp av EMVCo QR spesifikasjon med SGQR profil. Støtter UEN (bedriftsregistrering), mobilnummer eller NRIC som proxy-identifikatorer. Inkluderer mengderedigeringsflagg og utløpsdato.",
        "PromptPay (Thailand): Thai nasjonalt betalingssystem som følger Bank of Thailand EMV-profil. Støtter mobilnummer, nasjonal ID, skatte-ID, e-lommebok-ID og fakturabetaling med flere referansefelt.",
        "QRIS (Indonesia): Rask responskode Indonesisk standard. EMV-basert nasjonal betalingsstandard som støtter kjøpmanns-ID, NMID (Nasjonal merchant ID), kjøpmannskriterier klassifisering og bekvemmelighetsgebyrer (fast eller prosent).",
        "DuitNow (Malayasia): Malaysias øyeblikkelige betalingssystem. Støtter flere proxytyper, inkludert NRIC, mobil, pass, hær-ID og forretningsnummer.",
        "VietQR (Vietnam): Vietnamesisk standard for interbankoverføring. Krever bank BIN (NAPAS-identifikasjon) og kontonummer. Støtter flere tjenestekoder for forskjellige overføringstyper (QRPUSH, QRIBFTTA, QRIBFTTC).",
        "QR Ph (Filippinene): Filippinsk QR-betalingsstandard for InstaPay og PESONet. Bruker kontonumre med selgeridentifikasjon for P2M-transaksjoner (person-til-selger).",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Østasiatiske betalingsstandarder",
      bullets: [
        "TWQR (Taiwan): Taiwansk QR betalingsstandard. Støtter handels-ID, skatte-ID og TWD-beløp.",
        "HKQR/FPS (Hong Kong): Hongkong raskere betalingssystem QR-koder. Støtter FPS ID, mobilnummer eller e-post som betalingsidentifikatorer. Beløp i HKD.",
        "JPQR (Japan): Japansk enhetlig betalingsstandard for QR-koder. Bruker butikk-ID for selgeridentifikasjon med JPY-beløp.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Andre regionale betalingsstandarder",
      bullets: [
        "PIX (Brazil): Brasiliansk sentralbank Instant Payment system etter BR Code spesifikasjon. Støtter PIX-nøkler (CPF, CNPJ, e-post, telefon eller tilfeldig nøkkel), handelsnavn/by, transaksjons-ID og BRL-beløp.",
        "AusPayNet/NPP PayID (Australia): Australian New Payments Platform PayID-system. Støtter betaler ID-typer (e-post, mobil, ABN, organisasjons-ID) eller tradisjonelle BSB + kontonummer. Merchant navn er valgfritt som betalere se registrert navn fra NPP-oppslag.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Cryptocurrency Betalinger",
      bullets: [
        "Bitcoin/Litecoin (BIP-21): Standard cryptocurrency-betalingsadresser med lommebokadresse, valgfritt beløp og etikett. Kompatibel med alle store Bitcoin og Litecoin lommeboker.",
        "Lightning Network (BOLT11): Lightning Network-betalingsfakturaer. Lim inn en BOLT11-kodet fakturastreng for umiddelbare Bitcoin-betalinger med minimale gebyrer.",
        "Ethereum (EIP-681): Ethereum-transaksjonsforespørsels-URIer som støtter native ETH-overføringer og ERC-20-tokenoverføringer. Inkluderer kjede-ID for støtte for flere nettverk (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gassparametere og kontraktsfunksjonsanrop.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Betalingslink-tjenester",
      bullets: [
        "PayPal.Me: PayPal betalingskoblinger med brukernavn og valgfritt forhåndsfylt beløp. Mottakere kan betale via PayPal-saldo, kort eller bankkontoer.",
        "Cash App: Cash App betalingskoblinger ved hjelp av $cashtag med valgfritt beløp. Populært i USA for peer-to-peer-betalinger.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Generisk EMV QR",
      bullets: [
        "EMV Generic: Lag egendefinerte EMV Merchant-Presented Mode QR-koder for betalingsordninger som ikke er spesifikt oppført. Konfigurer selgernavn, by, landskode (ISO 3166-1), valutakode (numerisk ISO 4217), MCC, alternativer for tips/bekvemmelighetsgebyr og tilleggsdatafelt. Nyttig for testing eller tilpassede integrasjoner.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: "Overlegg blandemoduser (profesjonell)",
      paragraphs: ["Ytterligere blandingsmoduser i profesjonelt nivå:"],
      bullets: [
        "Pixelate: Pixelert overlegg effekt.",
        "Outline: Edge deteksjon overlegg som kun viser konturer.",
        "Wavy distortion effekt.",
        "Subpixel Størrelse: Variabel underpiksel størrelse basert på bildet.",
        "True Dither: Avansert utjamning med bestilt matrise utvalg.",
        "Ekstrem: Maksimal bildesynlighet, kan påvirke skannbarhet.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Beskyttelsesinnstillinger",
      paragraphs: [
        "Finkornet kontroll over hvilke QR-elementer som er beskyttet mot modifikasjon av overlegg:",
      ],
      bullets: [
        "Bevar Timing: Hold timingsmønstre uendret.",
        "Bevar justering: Hold justeringsmønstre umodifisert.",
        "Beskytt format Info: Skjold format informasjon moduler.",
        "Beskytt versjon Info: Skjold versjon informasjon moduler.",
      ],
    },
    {
      heading: "ECC-Aware-modus",
      paragraphs: [
        "Intelligent distribuerer overleggsintensitet basert på feilrettingskapasitet. Systemet analyserer hvilke moduler som kan modifiseres mens skannbarhet opprettholdes.",
      ],
      bullets: [
        "Risikobudsjett: Prosentandel feilrettelseskapasitet til bruk (0-100%).",
        "Høyere budsjett = mer synlig overlegg, men risikofriere skannbarhet.",
        "Lavere budsjett = tryggere skanning, men mindre synlig overlegg.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesjonelle gjengivelsesalternativer",
      paragraphs: ["Avanserte gjengivelseskontroller:"],
      bullets: [
        "Skarpe kanter: Bruk pikselert bildegjengivelse for skarpe modulkanter.",
        "Pixel Snap: Gulv, runde eller Ceil pixel justering.",
        "Per-module fargemodus: solid, etter lysstyrke, etter posisjon, ved overlegg, ved Cluster.",
        "Fargepalett: Definer egendefinert fargepalett for fargelegging per modul.",
        "Kontrastbeskyttelse: Sørg for minimum kontrastforhold mellom farger.",
        "Min kontrastforhold: WCAG-stil kontrastkrav (1:1 til 21:1).",
        "Ekstra grense Moduler: Ytterligere grense utenfor stille sone.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#render",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesjonelle utgangsalternativer",
      paragraphs: ["Bedriftseksportinnstillinger:"],
      bullets: [
        "DPI: Angi utskriftsoppløsning (72-600 DPI). 300 DPI anbefalt for utskrift.",
        "Inkluder Stille Zone: Bytt rolig sone i utgangsdimensjoner.",
        "Eksporter som ekstra: Opprett PDF sammen med primærformat.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#output",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Animasjonsinnstillinger (Profesjonell)",
      paragraphs: ["Ytterligere profesjonell animasjonsfunksjoner:"],
      bullets: [
        "Temporal diner: Av, Blå støy, eller Flicker Safe per-frame dithering.",
        "Mønster: Ingen, Pulse, bølge, Scanline, Shimmer eller Drift effekter.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#animation",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: "API referanse",
      paragraphs: [
        "ANQR gir en server-side API for generering av QR-koder via URL-parametere. Dette er ideelt for å bygge inn QR-koder i nettsteder, e-poster, dokumenter eller automatiserte arbeidsflyter uten JavaScript på klientsiden.",
        "Base URL: https://anqr.link/api/qr",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Vis QR eksempler", type: "example" }],
    },
    {
      heading: "Grunnleggende parametere",
      paragraphs: ["Nødvendige og felles parametere (parameternavn er ikke oversatt):"],
      bullets: [
        "data (nødvendig): Innholdet som skal kodes i QR-koden. URL-kode spesielle tegn.",
        "størrelse: Bildestørrelse i piksler (standard: 400, max: 2000). Brukes hvis w/h ikke er spesifisert.",
        "w, h: Utgangsbredde og høyde i piksler. Overstyrer størrelsesparameter.",
        "format: Utgangsformat - png, webp eller gif (standard: png).",
        "ec: Feilrettingsnivå - L, M, Q eller H (standard: H).",
        "fg: Forgrunnsfarge som heks uten # (standard: 0000).",
        "bg: Bakgrunnsfarge som heks uten # (standard: ffffff).",
        "transparent: Sett til 1 for gjennomsiktig bakgrunn.",
        "margin: Stille sone i moduler (standard: 4).",
      ],
    },
    {
      heading: "Stilparametre",
      paragraphs: ["Modul og mønster styling:"],
      bullets: [
        "stil: Modul stil - firkantet, rundet, prikker, diamant, tilkoblet.",
        "finner: Finder mønster stil - firkantet, avrundet, sirkel.",
        "justering: Juster mønster stil - match_finder, firkantet, avrundet, sirkel.",
        "timing: Timing mønster stil - match_module, solid, dashed.",
        "radius: Corner radius prosent 0-100.",
        "gap: Modul gap prosent 0-50.",
        "gapMode: Gap modus - ingen, inset, slag, negativ_rom.",
        "øye Ytre, øyeInner: Øye stiler - firkantet, avrundet, sirkel.",
        "øyeskala: Øyeskalaprosent (standard: 100).",
        "grad: Grad: Gradient type - ingen, lineær, radial, konisk.",
        "gradAngle: Gradientvinkel for lineære gradienter.",
        "gradStops: Gradient stopper som farge1,pos1,color2,pos2,... (f.eks. ff0000, 00000ff,1).",
      ],
    },
    {
      heading: "Overleggsparametere",
      paragraphs: ["Bildeoverlegg (overleggsbilde hentes serversiden):"],
      bullets: [
        "img: URL til overlegg bilde (må være offentlig tilgjengelig).",
        "modus: Overlegg modus - sentrum, halvtone, blanding, lysstyrke, mosaikk, pyntet, blå-støyt, subpiksel.",
        "intensitet: Overlegg intensitet 0-100 (standard: 100).",
        "farge Mode: Overlegg fargemodus - farge, gråtone, bw.",
        "passform: Hvor overlegg passer - deksel, inneholder, strekk.",
        "rott: Overlegg rotasjon i grader.",
        "flipX, flipY: Sett til 1 for å snu overlegget.",
        "hold Finnere: Bevar Finder mønstre (standard: 1).",
        "keepTiming, keepAlign: Sett til 1 for å bevare timing/justeringsmønstre.",
      ],
    },
    {
      heading: "Forbehandlingsparametre",
      paragraphs: ["Forbehandling av bilder påført overlegg:"],
      bullets: [
        "lysstyrke: Justering -100 til 100 (standard: 0).",
        "kontrast: Justering -100 til 100 (standard: 0).",
        "gamma: Verdi 0.1 til 3 (standard: 1).",
        "metning: Justering -100 til 100 (standard: 0).",
        "nyanse: Hue rotasjon i grader.",
        "sløring: Blur i piksler.",
        "skjerpe: Skärpe mengde 0-100.",
        "plakat: Posterize nivåer.",
        "terskel: Binær terskel 0-255.",
        "kant: Edge deteksjon - off, sobel, canni.",
        "invert: Sett til 1 å invertere farger.",
      ],
    },
    {
      heading: "Vannmerkeparametere",
      paragraphs: ["Legg vannmerker til genererte QR-koder:"],
      bullets: [
        "wmEn: Sett til 1 for å aktivere vannmerke.",
        "wm Type: Vannmerke type - tekst, bilde, mønster.",
        "wmText: Vannmerketekst (URL-kodet).",
        "wmImg: URL til vannmerkebilde.",
        "wmPos: Posisjon - sentrum, hjørner, kanter, bak, roe_zone.",
        "wmOpacity: Dekkevne 0-100 (standard: 50).",
        "wmBlend: Blandemodus - normal, multiplisere, skjerm, overlegg.",
      ],
    },
    {
      heading: "Animasjonsparametere",
      paragraphs: ["For animert GIF-utgang (krever format=gif):"],
      bullets: [
        "anim Mønster: animasjonsmønster - ingen, puls, bølge, skanneline, skimmer, drift, color_syklus.",
        "anim Rammer: Antall rammer 1-60 (standard: 24).",
        "anim Hastighet: Rammeforsinkelse i millisekunder 10-1000 (standard: 100).",
        "animSeed: Tilfeldig frø for animasjon.",
        "easing: Animation easing - lineær, easy_in, easy_out, easy_in_out, studse.",
      ],
    },
    {
      heading: "Utgangsparametere",
      paragraphs: ["Utdataformatalternativer:"],
      bullets: [
        "kvalitet: WebP kvalitet 0-1 (standard: 0.9).",
        "webpQ: WebP-kvalitet 0-100 (standard: 90).",
        "gifColors: GIF palettstørrelse 2-256 (standard: 256).",
        "dpi: Output DPI for PNG (standard: 72).",
        "metaTitel, metaAuthor, metaCopy, meta Desc: PNG metadata felt.",
      ],
    },
    // Crop Parameters
    {
      heading: "Beskjæringsparametere",
      paragraphs: ["Alternativer for beskjæring av overleggsbilde:"],
      bullets: [
        "cropEn: Aktiver overleggsbeskjæring 0/1 (standard: 0).",
        "cropX: Beskjæringssenter X som brøk 0-1 (standard: 0,5).",
        "cropY: Avlingssenter Y som brøk 0-1 (standard: 0,5).",
        "cropSize: Beskjæringsstørrelse som brøkdel av bildet 0-1 (standard: 1).",
      ],
    },
    // Safety Lock Parameters
    {
      heading: "Sikkerhetslåsparametere",
      paragraphs: ["Kontroller hvilke QR-elementer som er beskyttet mot modifikasjon av overlegg:"],
      bullets: [
        "lockF: Låssøkermønstre 0/1 (standard: 1).",
        "lockT: Lås timing mønstre 0/1 (standard: 1).",
        "lockA: Lås justeringsmønstre 0/1 (standard: 1).",
        "lockFmt: Låseformatinfo 0/1 (standard: 1).",
        "lockV: Lås versjon info 0/1 (standard: 1).",
        "safeMode: Sikkerhetsmodus - av, balansert, streng (standard: av).",
        "safeMinPx: Minimum modulstørrelse i piksler (standard: 2).",
        "safeMinQz: Minimum stillesonemoduler (standard: 4).",
      ],
    },
    // Auto-tuning Parameters
    {
      heading: "Auto-tuning parametere",
      paragraphs: ["Innstillinger for automatisk optimalisering:"],
      bullets: [
        "autoVer: Velg QR-versjon 0/1 automatisk (standard: 1).",
        "autoEcc: Automatisk velg ECC-nivå 0/1 (standard: 0) - kun hint på serversiden.",
        "autoReduce: [KUN KLIENT] Reduser intensiteten automatisk til den kan skannes – krever skanningsvalideringssløyfe.",
      ],
    },
    // Additional Animation Parameters
    {
      heading: "Ytterligere animasjonsparametere",
      paragraphs: ["Utvidede animasjonskontroller for GIF-utdata:"],
      bullets: [
        "loop: Animasjon looper kontinuerlig 0/1 (standard: 1).",
        "sprett: Ping-pong animasjonsretning 0/1 (standard: 0).",
        "revers: Spill av animasjon i revers 0/1 (standard: 0).",
        "colorCycle: Aktiver fargesykluseffekt 0/1 (standard: 0).",
        "interp: Rammeinterpolasjon - ingen, crossfade, morph (standard: ingen).",
        "tempDither: Temporal dithering - off, blue_noise, flicker_safe (standard: off).",
        "startF: Animasjons startramme (standard: 0).",
        "maxF: Maksimalt antall bilder å gjengi (standard: 0 = auto).",
        "stepF: Frame step intervall (standard: 1).",
        "jitter: [KUN KLIENT] Modul jitter i piksler – krever QR-regenerering per bilde.",
      ],
    },
    // Dithering Parameters
    {
      heading: "Dithering-parametere",
      paragraphs: ["Kontroller dithering-algoritmer for overleggsbehandling:"],
      bullets: [
        "ditherKind: Dither-algoritme - error_diffusion, ordered_bayer, blue_noise, etc (standard: ordered_bayer).",
        "diffusionKernel: Feil diffusjonskjerne - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (standard: floyd_steinberg).",
        "ditherStrength: Dither-intensitet 0-100 (standard: 50).",
        "serpentine: Serpentine-dithering 0/1 (standard: 0).",
        "matrise: Bestilt dither-matrise - bayer2, bayer4, bayer8 (standard: bayer4).",
        "bnTile: Blå støyflisestørrelse (standard: 64).",
        "bnSeed: Blå støy tilfeldig frø (standard: 0).",
        "colorDither: Fargedithering - ingen, per_kanal, perseptuell (standard: ingen).",
      ],
    },
    // Subpixel Parameters
    {
      heading: "Subpikselparametere",
      paragraphs: ["Innstillinger for blandingsmodus for underpiksler:"],
      bullets: [
        "spGrid: Størrelse på underpiksler - 2x2, 3x3, 4x4 (standard: 3x3).",
        "spCenter: Senterregel - streng, halvtone_senter (standard: streng).",
        "spNøytral: Nøytral farge hex uten # (standard: 808080).",
        "spFinder: Finder-overstyring - solid, stilisert (standard: solid).",
      ],
    },
    // Halftone Parameters
    {
      heading: "Halvtoneparametere",
      paragraphs: ["Innstillinger for halvtoneblandingsmodus:"],
      bullets: [
        "htCell: Halvtone cellestørrelse - per_modul eller nxn rutenett (standard: per_module).",
        "htDot: Punktform - sirkel, firkant, linje (standard: sirkel).",
        "htCurve: Lysstyrkekurve - lineær, s-kurve, gamma (standard: lineær).",
        "duo1: Duotone skyggefarge hex uten # (standard: 000000).",
        "duo2: Duotone highlight color hex uten # (standard: ffffff).",
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: "ECC-Aware Mode Parameters",
      paragraphs: ["Intelligent overleggsdistribusjon basert på feilrettingskapasitet:"],
      bullets: [
        "eccAware: Aktiver ECC-bevisst modus 0/1 (standard: 0).",
        "eccRisk: Risikobudsjettprosent 0-100 (standard: 50).",
        "eccMap: Vektkart - distance_to_finders, block_heatmap, empirical_scan_heatmap (standard: distance_to_finders).",
      ],
    },
    // Frame Parameters
    {
      heading: "Rammeparametere",
      paragraphs: ["Innstillinger for dekorative rammer:"],
      bullets: [
        "frame: Rammestil - ingen, avrundet_ramme, klistremerke, tag (standard: ingen).",
        "frameText: Tekst som skal vises i ramme (URL-kodet).",
      ],
    },
    // Per-Module Color Parameters
    {
      heading: "Fargeparametere per modul",
      paragraphs: ["Individuelle modulfargealternativer:"],
      bullets: [
        "modColor: Fargemodus - solid, by_brightness, by_position, by_overlay, by_cluster (standard: solid).",
        "cGuard: Kontrastvakt 0/1 (standard: 0).",
        "minContrast: Minimum kontrastforhold 1-21 (standard: 4,5).",
        "palett: Kommaseparerte sekskantfarger for palettmodus.",
        "paletteMode: Palettfordeling - posisjon, lysstyrke, diagonal, radial, tilfeldig, rad, kolonne (standard: posisjon).",
      ],
    },
    // GIF Overlay Parameters
    {
      heading: "GIF-overleggsparametere",
      paragraphs: ["Innstillinger for animerte GIF-overleggsbilder:"],
      bullets: [
        "ovType: Overleggstype - statisk, gif, apng, webp_anim, video (standard: statisk).",
        "ovFramePick: Rammevalg - alle, hver_n, maks_rammer, varighetsgrense (standard: alle).",
        "gifDelays: Bruk originale GIF-rammeforsinkelser 0/1 (standard: 1).",
        "gifDispH: GIF-avhendingshåndtering - respektere, forenkle (standard: respekt).",
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: "Per-ECC Intensitetsgrenser",
      paragraphs: ["Maksimal overleggsintensitet per feilkorrigeringsnivå:"],
      bullets: [
        "maxIntL: Maks intensitet for ECC L 0-100 (standard: 100).",
        "maxIntM: Maks intensitet for ECC M 0-100 (standard: 100).",
        "maxIntQ: Maks intensitet for ECC Q 0-100 (standard: 100).",
        "maxIntH: Maks intensitet for ECC H 0-100 (standard: 100).",
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: "QA-simuleringsparametere (kun klient)",
      paragraphs: [
        "Disse parameterne analyseres for URL-kompatibilitet, men fungerer bare i nettleseren:",
      ],
      bullets: [
        "qaContrast: Aktiver kontrastkontroll 0/1 - krever interaktiv validering.",
        "qaBlur: Simuler uskarphet i piksler – kun for interaktiv testing.",
        "qaNoise: Simuler støynivå - kun for interaktiv testing.",
        "qaHeatmap: Vis varmekart for lesbarhet 0/1 – krever grensesnitt for lerretsoverlegg.",
      ],
    },
    // Client-Only Parameters
    {
      heading: "Kun klientparametere",
      paragraphs: [
        "De fleste API-parametere støttes fullt ut på serversiden. Parametere merket med [KUN KLIENT] analyseres for URL-kompatibilitet, men krever nettleserfunksjoner:",
      ],
      bullets: [
        "jitter: Modul jitter krever per-frame QR-regenerering med tilfeldighet.",
        "autoreduksjon: Autoreduser intensitet krever iterativ skanningstesting.",
        "qaContrast, qaBlur, qaNoise, qaHeatmap: QA-simulering krever interaktiv lerretsvalidering.",
      ],
    },
    // Additional Output Parameters
    {
      heading: "Ytterligere utgangsparametere",
      paragraphs: ["Utvidede utdata- og eksportinnstillinger:"],
      bullets: [
        "fname: Egendefinert filnavn for nedlastinger (standard: anqr-qrcode).",
        "inclQz: Inkluder stillesone i utgangsdimensjoner 0/1 (standard: 1).",
        "bgOver: Bakgrunnsfarge overstyrer hex uten # (overstyrer bg-parameter).",
        "fmtExtra: Ytterligere formatutgang - ingen, eps, animated_webp (standard: ingen). Merk: eps er [DELVIS].",
        "svgPrec: SVG-formpresisjon - piksel, presis (standard: piksel). [DELVIS] SVG-utdata begrenset på serversiden.",
        "svgEmbed: Bygg inn rasteroverlegg i SVG 0/1 (standard: 1). [DELVIS] SVG-utdata begrenset på serversiden.",
        "modulePx: Modulpikselstørrelse (standard: automatisk beregnet fra størrelse).",
        "border: Ekstra kantmoduler utenfor stillesonen (standard: 0).",
        "crisp: Aktiver skarp/pikselert bildegjengivelse 0/1 (standard: 1).",
        "snap: Pixel snap-modus - gulv, rund, tak (standard: gulv).",
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: "Parametere for mønsterbevaring",
      paragraphs: ["Kontroller hvilke strukturelle elementer som er beskyttet mot overlegg:"],
      bullets: [
        "keepFinders: Bevar finnermønstre 0/1 (standard: 1).",
        "keepTiming: Bevar timingmønstrene 0/1 (standard: 0).",
        "keepAlign: Bevar justeringsmønstre 0/1 (standard: 0).",
        "protectFmt: Beskytt formatinfomoduler 0/1 (standard: 0).",
        "protectVer: Beskytt versjonsinfomoduler 0/1 (standard: 0).",
      ],
    },
    {
      heading: "Eksempel Bruk",
      paragraphs: [
        "Grunnleggende QR-kode:",
        "https://anqr.link/api/qr?data=https://example.com",
        "Stilt QR-kode med egendefinerte farger:",
        "https://anqr.link/api/qr?data=Hallo&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30",
        "QR-kode med overleggsbilde:",
        "https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halvton&intensity=70",
        "Animert GIF:",
        "https://anqr.link/api/qr?data=Hallo&format=gif&animMønster=pulse&animFrames=24&easing=ease_in_out",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Vis QR eksempler", type: "example" }],
    },
    {
      heading: "Innbygging QR Koder",
      paragraphs: [
        "I profesjonell modus genererer Share-funksjonen embeddable HTML og URLs. Her er hvordan innbygging fungerer:",
      ],
      bullets: [
        "Share Link: Oppretter en URL til ANQR-appen med alle innstillingene kodet som URL-parametre. Mottakere kan vise og endre QR-koden.",
        "Bygg inn bildet: Generererer en <img> tag som peker på server-API. QR-koden gjøres serversiden og fungerer som et bilde.",
        "Embed Markdown: Oppretter Markdown-bildesyntaks for dokumentasjon og README-filer.",
        "Direct API URL: Rå API URL for bruk i applikasjoner, skript eller andre integrasjoner.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
    {
      heading: "HTML- eksempel",
      paragraphs: [
        "For å legge inn en QR-kode på nettsiden din:",
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR-kode" />',
        "For responsiv størrelse:",
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR-kode" style="max-bredde: 100%; høyde: auto;" >',
        "Server cache svar med lange cache overskrifter, så gjentatte forespørsler om samme URL er raskt.",
      ],
    },
    {
      heading: "Del URL-format",
      paragraphs: [
        "Når du klikker på Del i profesjonell modus, koder ANQR dine gjeldende innstillinger til URL-parametre. Formatet er:",
        "https://anqr.link/?data=...&ec=H&style=rounded&....",
        "Disse parametrene speiler API-parametrene, slik at du kan konvertere en delt URL til en API-adresse ved å endre basisstien fra / til /api/qr og justere w/h-parametre etter behov.",
        "Merk: Overlegg bilder som lastes opp fra lokale filer kan ikke deles via URL - bare URL-baserte overlegg (img parameter) fungerer i delt lenker og API-samtaler.",
      ],
    },
    {
      heading: "Prisgrenser og bruk",
      paragraphs: [
        "API-en er gratis å bruke for rimelige volumer. For høyvolumbruk eller kommersielle applikasjoner som krever garantert oppetid, vennligst kontakt oss.",
        "API-svar inkluderer aggressive caching-overskrifter. For best ytelse, bufre svarene på siden din eller bruk samme URL konsekvent for identiske QR-koder.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: "Beste praksis",
      paragraphs: ["Følg disse retningslinjene for pålitelige QR-koder:"],
      bullets: [
        "Test alltid QR-kodene dine med flere skannerapper før du skriver ut.",
        "Bruk feilretting H (høy) når du legger til overlegg.",
        "Hold minst 4 moduler av rolig sone (margin).",
        "Sikre høy kontrast mellom forgrunn og bakgrunn.",
        "For utskrift, bruk minst 300 DPI og test i faktisk utskriftsstørrelse.",
        "Aktiver Bevar søkemønster når du bruker overlegg.",
        "Start med lavere overlegg intensitet og øke gradvis.",
        "For utendørs bruk, vurdere større modulstørrelser og høyere feilkorreksjon.",
      ],
      links: [
        { href: "/learn?lang=${lang}", label: "Bla gjennom Lær artikler", type: "learn" },
        { href: "/examples?lang=${lang}", label: "Vis QR eksempler", type: "example" },
      ],
    },
    {
      heading: "Feilsøking",
      paragraphs: ["Vanlige problemer og løsninger:"],
      bullets: [
        "QR vil ikke skanne: Reduser overleggsintensitet, øke feilretting, sjekk kontrast.",
        "Koden er for stor: Reduser innholdslengden, bruk URL-forkorter, lavere versjon.",
        "Uskarpt utdata: Øk modulstørrelsen, bruk PNG i stedet for komprimerte formater.",
        "Farger ser feil ut: Sjekk fargekontrast, prøv gråtone overlegg modus.",
        "GIF animerer ikke: Sørg for å bruke GIF-formatutgang, sjekk antall bilder.",
        "Bildeoverlegg lastes ikke inn: Sjekk CORS-tillatelser på eksterne bilder.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Se relaterte guider og eksempler",
          type: "learn",
        },
      ],
    },
    {
      heading: "Tastatursnarveier",
      paragraphs: [
        "ANQR støtter standard tastatursnarveier. Bruk Ctrl/Cmd+S til å utløse eksport (når fokusert på forhåndsvisningen).",
      ],
    },
    {
      heading: "Deling og innbygging",
      paragraphs: [
        "I profesjonell modus klikker du på Del-knappen for å kopiere en URL med gjeldende innstillinger. Mottakere kan åpne denne URL-en for å se den nøyaktige konfigurasjonen din. Merk: Overleggsbilder fra lokale filer kan ikke deles via URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Prøv denne konfigurasjonen direkte i ANQR-generatoren.",
          type: "generator",
        },
      ],
    },
  ],
  relatedLinks: [
    { href: "/learn?lang=${lang}", label: "Bla gjennom Lær artikler", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Vis QR eksempler", type: "example" },
    { href: "/gallery?lang=${lang}", label: "Vis QR eksempler", type: "gallery" },
    { href: "/?lang=${lang}", label: "Åpne generatoren", type: "generator" },
  ],
};

export default guide;
