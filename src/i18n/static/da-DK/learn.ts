import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Lær med ANQR',
  description: 'Praktiske, business-first guides til at omdanne QR-koder til rigtige marketingaktiver - ikke kun funktionelle firkanter. Lær, hvordan du opgraderer ældre salgssteder-koder, skaber kompatibel betalings-QR-skiltning, forbereder printklar eksport, bruger animation sikkert på digitale skærme og deler låste konfigurationer på tværs af flersprogede teams ved hjælp af ANQR ("anker")-links.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Åbn generatoren', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Vis QR- eksempler', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Åbn den fulde brugervejledning', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Forbedring af eksisterende QR-kampagner',
      paragraphs: ['De fleste virksomheder har QR-koder spredt over deres aktiviteter - på menuer, modstande, emballage og reklamemateriale. Mange af disse koder blev skabt år siden med grundlæggende generatorer, hvilket resulterer i generiske sort-og-hvide firkanter, der undlader at inspirere tillid eller matche din brand identitet. Denne omfattende guide fører dig gennem en systematisk tilgang til revision, opgradering og optimering af din eksisterende QR-infrastruktur uden at forstyrre de kunderejser, du allerede har etableret.', 'Den strategiske fordel ved at opgradere frem for at erstatte dine QR-koder ligger i at bevare kontinuiteten. Dine kunder har allerede lært at forvente bestemte destinationer, når de scanner dine koder. Ved at holde de kodede URL\'er identiske, mens du dramatisk forbedrer den visuelle præsentation, scanningspålidelighed og brandtilpasning, skaber du en problemfri overgang, der øger tilliden uden at kræve ændringer i din digitale infrastruktur eller analysesporing.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'En side- by- side sammenligning viser en falmet, generisk QR-kode ved siden af en moderne mærkevare version indkodning den samme URL',
          caption: 'Før og efter: Den samme destination URL omdannet fra en dateret generisk kode til en professionel mærkevare aktiv',
        },
      ],
    },
    {
      heading: 'Hvorfor Legacy QR-koder underpræsterer',
      paragraphs: ['QR-koder oprettet i den tidlige adoptionsfase - især i 2020- 2021, hvor virksomheder skyndte sig at gennemføre kontaktløse løsninger - lider ofte under flere kritiske spørgsmål. Lav fejlkorrektion indstillinger gør dem skrøbelige, når de trykkes på teksturerede overflader eller ses under udfordrende belysning. Utilstrækkelige stille zoner forårsager scanningsfejl, når koder placeres nær andre visuelle elementer. Generisk styling undlader at kommunikere mærke legitimitet, hvilket fører til tøven og reducerede scanningsrater.', 'Ud over de tekniske begrænsninger repræsenterer ældre koder ofte forspildte brandingmuligheder. Hver QR kode er et touchpoint med din kunde - et øjeblik, hvor de er aktivt engageret og villige til at tage affære. En professionelt udformet kode, der matcher dine mærkefarver, indeholder passende sikkerhedsmargener, og funktioner valgfri mærkevarer elementer forvandler dette værktøj til et markedsføringsaktiv, der styrker din identitet ved enhver interaktion.'],
    },
    {
      heading: 'Udførelse af en QR-kodeaudit',
      paragraphs: ['Begynd din opgradering projekt ved at skabe en omfattende opgørelse over hver QR-kode, der i øjeblikket anvendes på tværs af din virksomhed. Dokumentér den fysiske placering, den kodede destination, det trykte materiales nuværende tilstand og det typiske scanningsmiljø, herunder lysforhold og synsvinkler. Test hver kode med flere enheder - ældre smartphones og budget enheder ofte afsløre pålidelighed spørgsmål, som premium telefoner maske.', 'Vær særlig opmærksom på koder i high-stakes steder: betalingspunkter, check-i områder, og salgsfremmende skærme, hvor scanningsfejl direkte påvirker indtægter eller kundeoplevelse. Disse bør prioriteres med henblik på øjeblikkelig opgradering. Bemærk også koder, der vises i fotografering eller video indhold, da disse vil kræve koordinering med din marketing team til at opdatere visuelle aktiver.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'En tjeklistegrænseflade, der viser QR-revisionskategorier: placering, tilstand, scanningspålidelighed og prioriteret bedømmelse',
          caption: 'Systematisk QR revisionsskabelon til dokumentation og prioritering af dine opgraderingskandidater',
        },
      ],
    },
    {
      heading: 'Den sikre opgraderingsstrategi',
      paragraphs: ['Hovedreglen for QR-opgraderinger er destinationsbevaring. Uddrag den nøjagtige URL fra hver eksisterende kode og indkod den identisk i din nye version. Dette sikrer, at alle eksisterende analyser, omdirigeringslogik og kundernes forventninger forbliver intakte. Hvis du har brug for destinationsfleksibilitet til fremtidige opdateringer, er dette det ideelle tidspunkt at introducere en brandet kort URL eller omdirigeringstjeneste - men implementer dette som et separat projekt for at undgå komplicerede ændringer.', 'For visuel opgradering, anvende forbedringer i lag: først sikre teknisk pålidelighed (passende fejlkorrektion og stille zone), derefter tilføje mærke styling (farver, modul former), og endelig overveje valgfri forbedringer (center overlejringer, rammer). Hvert lag bør valideres ved test, før der fortsættes. ANQR "s sikkerhedsmetode hjælper med at håndhæve disse prioriteter ved advarsel, når styling valg kan kompromittere scannability.'],
    },
    {
      heading: 'Tilføjelse af mærke identitet uden Komproming Pålidelighed',
      paragraphs: ['Effektiv QR branding balancerer visuel effekt mod scanningspålidelighed. Start med farve: Udskift standard sort forgrund med din primære mærkefarve, hvilket sikrer tilstrækkelig kontrast mod din baggrund. For de fleste mærker, mørke farver på lys baggrunde fungerer bedst. Undgå lavkontrast kombinationer, gradienter, der reducerer kant klarhed, eller farver, der synes ens under almindelige lysforhold.', 'Tilpasning af modulform giver endnu en mulighed for branding med minimal indflydelse på pålideligheden. Afrundede moduler skaber et blødere, mere tilgængeligt udseende, mens de bevarer fremragende scanbarhed. Moduler i dot-stil fungerer godt for moderne, tech-forward brands. Forbundne moduler passer til industrielle eller virksomhedsidentiteter. Uanset hvilken stil du vælger, bevar ensartetheden på tværs af alle dine QR-implementeringer for øjeblikkelig brandgenkendelse.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Et farvehjulsdiagram med optimale QR-farvekombinationer med kontrastindikatorer',
          caption: 'Brand farvevalg guide viser høj kontrast kombinationer, der opretholder scanningspålidelighed',
        },
      ],
    },
    {
      heading: 'Test- og valideringsprotokol',
      paragraphs: ['Implementer aldrig opgraderede QR-koder uden strenge tests. Udskriv et fysisk korrektur i den nøjagtige størrelse og på det samme materiale som din endelige implementering. Test på det faktiske sted, hvor koden vil leve, på forskellige tidspunkter af dagen for at tage højde for belysningsvariationer. Brug mindst tre forskellige enheder: en nuværende flagskibstelefon, en mellemklasseenhed og en ældre smartphone eller budgetsmartphone.', 'Registrer scanningstider og succesrater for hver test. En veloptimeret kode bør scanne inden for 1-2 sekunder på enhver rimeligt moderne enhed. Hvis du ser konsekvente forsinkelser eller fejl, skal du reducere stylingintensiteten - fjern eller formindsk overlejringer, øg størrelsen på den stille zone, eller skift til et højere fejlkorrektionsniveau. Pålidelighed har altid forrang over visuel sofistikering.'],
    },
    {
      heading: 'Låsning af din konfiguration for konsistens',
      paragraphs: ['Når du har valideret en optimal konfiguration, bevare det ved hjælp af ANQR \'s delelige links. Dette skaber en permanent registrering af alle indstillinger, der bruges til at generere din godkendte kode - farver, modulstil, fejlkorrektion, størrelsessortering og eventuelle overskridelser. Del dette link med dit designhold, udskriftsleverandører og alle, der måske skal reproducere koden i fremtiden.', 'Denne konfigurationslås forhindrer den gradvise nedbrydning, der plager mange QR deployeringer. Uden det, ansatte genskaber koder fra screenshots, designere genopbygge indstillinger fra hukommelsen, og print leverandører foretage \'nyttige\' justeringer. Hver variation introducerer potentielle problemer. Med en låst konfiguration link, hver reproduktion er identisk med din testet, godkendt original.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Et diagram, der viser konfigurationsdrift: skærmbilleder, der fører til rekreationer, der fører til varianter, versus et enkelt link til sandheden',
          caption: 'Forebyg konfigurationsdrift ved at oprette en enkelt autoritativ kilde til alle QR-reproduktioner',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Vis QR- eksempler',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR-koder til detailbetalinger',
      paragraphs: ['Betalings-QR-koder fungerer i det mest krævende miljø i detailhandlen: transaktionsøjeblikket. Kunderne er klar til at betale, ofte med en kø bag sig, og hvert sekunds forsinkelse skaber friktion. Alligevel er dette højtryksmoment også den bedste ejendom til brandforstærkning. Denne vejledning forklarer, hvordan du opretter betalings-QR-koder, der scanner øjeblikkeligt på bankapps, mens de stadig præsenterer et professionelt brandet udseende, der opbygger kundernes tillid.', 'Det grundlæggende princip for betalings-QR-koder er pålidelighed frem for æstetik. En smukt designet kode, der ikke kan scanne på én kundes bankapp, vil koste dig langt mere i forladte transaktioner og frustrerede kunder, end et konservativt design nogensinde kunne. Start med compliance, tilføj pålidelighed, og læg derefter omhyggeligt branding i, hvor det ikke kompromitterer den primære funktion.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'En detail tæller viser en betaling QR-kode bliver scannet af en smartphone med en bank app',
          caption: 'Betalings-QR-koder skal virke øjeblikkeligt med bank- og tegnebogsapps under tællerforhold i den virkelige verden',
        },
      ],
    },
    {
      heading: 'Forståelse af betalingsQR-standarder',
      paragraphs: ['Betalings-QR-koder følger typisk regionale standarder, der dikterer nyttelastformatet. I Singapore bruger PayNow QR specifik formatering. I Indien følger UPI-koder BharatQR- eller UPI-deep link-standarder. Europæiske SEPA-betalinger bruger EPC QR-koder. Hver standard eksisterer for at sikre, at bankapps øjeblikkeligt kan genkende og behandle betalingsoplysningerne. Afvigelse fra disse standarder - selv lidt - kan få betalingsapps til at afvise koder, som generiske kamerascannere læser uden problemer.', 'ANQR inkluderer skabeloner til større betalingsstandarder, der automatisk formaterer dine sælgeroplysninger til kompatible nyttelaster. Brug altid disse skabeloner i stedet for manuelt at konstruere betalingsstrenge, da selv mindre formateringsfejl kan forårsage transaktionsfejl. Hvis din regions betalingsstandard ikke er tilgængelig som skabelon, skal du se din betalingsudbyders tekniske dokumentation for nøjagtige formateringskrav.'],
    },
    {
      heading: 'Dimensionering og placering af tællerdisplays',
      paragraphs: ['Counter-top QR-koder står over for unikke fysiske udfordringer. Kunder scanner i armslængde, ofte i en vinkel, nogle gange gennem nysebeskyttere eller montrer. Overheadbelysning skaber blændingspletter. Koden konkurrerer med andet rod om opmærksomhed og klare sigtelinjer. Dimensionér din betaling QR generøst - et minimum på 4-5 cm anbefales til de fleste skrankeapplikationer, opskalering, hvis koden sidder bag glas eller i et svagt oplyst område.', 'Position betyder lige så meget som størrelse. Placer koden, hvor kunderne komfortabelt kan holde deres telefon uden at blokere køen eller række akavet. Vinkel skærmen mod kunden i stedet for at lægge den fladt. Hvis det er muligt, skal du bruge mat laminering eller ikke-reflekterende displaymaterialer for at minimere blænding fra overheadbelysning. Test den endelige placering på forskellige tidspunkter af dagen for at fange belysningsproblemer.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Et diagram, der viser optimale QR-placeringshøjder og -vinkler for forskellige tællerkonfigurationer',
          caption: 'Vejledning til tællerplacering: optimale højder, vinkler og afstande til pålidelig betalingsscanning',
        },
      ],
    },
    {
      heading: 'Konservativ mærkning af betalingskoder',
      paragraphs: ['Betaling apps er mindre tilgivende end generiske kamera scannere. Mange bank apps bruger ældre, enklere QR læsning algoritmer optimeret til hastighed snarere end fleksibilitet. Dette betyder styling, der fungerer perfekt med et telefonkamera kan mislykkes med specifikke betalingsapps. Hold branding konservativ: Brug din mærke farve til forgrunden, hvis det fastholder stærk kontrast, men undgå gradienter, tunge overlejringer, eller dekorative elementer, der kan forstyrre anerkendelse.', 'Hvis du ønsker et center logo eller overlay, holde det ekstremt lille - ikke mere end 10-15% af QR-området - og teste omfattende med hver betaling app dine kunder kan bruge. Mange virksomheder vælger ingen overlay på betalingskoder specifikt, reservere at styling til markedsføring QR-koder, hvor pålidelighedskrav er mindre strenge. Betalingskodens opgave er at behandle transaktioner, ikke at imponere visuelt.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'En sammenligning, der viser acceptable kontra risikable brandingniveauer for betalings-QR-koder',
          caption: 'Betaling QR branding spektrum: fra sikker konservativ styling til risikable dekorative tilgange',
        },
      ],
    },
    {
      heading: 'Materielle og grafiske overvejelser',
      paragraphs: ['Det fysiske display materiale væsentligt påvirker scanningspålidelighed. Glossy laminering afspejler overhead lys direkte ind i kundens kamera. Tekstureret materiale kan forvrænge modulkanter. Billige udskrivning kan sløre fine detaljer. For betaling QR-koder, investere i kvalitet: Brug mat eller satin laminering, sikre høj opløsning trykning, og erstatte skærme, før de viser slid. En ridset eller falmet betalingskode koster dig transaktioner.', 'Overvej visningens holdbarhed og udskiftelighed. Tællerdisplays bliver rørt, flyttet, sprøjtet, og lejlighedsvis væltet over. Design dit display system, så QR-indsatsen nemt kan udskiftes uden at erstatte hele standen. Hold ekstra aftryk klar, genereret fra din låste konfiguration link, så slidte koder kan byttes med det samme.'],
    },
    {
      heading: 'Test med realbetaling Apps',
      paragraphs: ['Generisk kamera scannere vil afkode næsten enhver rimeligt formateret QR kode. Betalings apps er bedre. Før du anvender nogen betaling QR kode, teste det med hver betaling app dine kunder kan bruge. I multi-betaling miljøer, kan dette betyde test med flere bank apps, digitale tegnebøger, og betalingsplatforme. Dokument hvilke apps du har testet og deres versioner - betalingsapps opdateres ofte, og en opdatering kan ændre scanningsadfærd.', 'Test under realistiske forhold: det faktiske display, faktisk belysning, faktisk scanningsafstand. En kode, der scanner øjeblikkeligt på dit skrivebord, kan kæmpe på disken klokken 17, når eftermiddagssolen skaber blænding. Test med den ældste, billigste smartphone du kan finde - hvis den fungerer pålideligt på en budgetenhed, fungerer den på alt. Markér enhver scanningstid over 2 sekunder for undersøgelse og potentielt redesign.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'En testtjekliste, der viser forskellige betalingsapps, enhedstyper og miljøforhold, der skal verificeres',
          caption: 'Omfattende betaling QR testmatrix, der dækker apps, enheder og miljøfaktorer',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Vis QR- eksempler',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Print- Ready QR-koder: SVG vs PNG',
      paragraphs: ['Forskellen mellem en QR-kode, der scanner perfekt og en, der fejler ofte kommer ned til, hvordan det blev eksporteret og håndteret i print workflow. Denne vejledning forklarer de kritiske sondringer mellem vektor (SVG) og raster (PNG) formater, når de skal bruge hver, og hvordan man afleverer QR-grafik til designere og udskrive leverandører på måder, der bevarer scanne pålidelighed fra visitkort til billboard- størrelse skiltning.', 'Print produktion introducerer variabler, der ikke findes på skærmen: blæk spredning, substrat tekstur, efterbehandling processer, og den kumulative effekt af flere fil konverteringer. En QR kode, der ser perfekt ud i dit design software kan dukke op fra printeren med blødgjorte kanter, reduceret kontrast, eller subtilt forvrængede moduler. Forståelse format udvælgelse og workflow bedste praksis forhindrer disse tavse svigt.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'En forstørret visning sammenligner vektor QR moduler med sprøde kanter versus raster moduler viser pixel artefakter',
          caption: 'Vector vs raster på print skala: præcisionsforskellen, der bestemmer scanningspålidelighed',
        },
      ],
    },
    {
      heading: 'Hvorfor Vector (SVG) Foretages til Print',
      paragraphs: ['SVG filer beskriver QR-koder som matematiske figurer snarere end gitter af pixels. Det betyder, at koden kan skaleres til enhver størrelse - fra en 1cm etiket til en 10- meter banner - uden tab af kant skarphed. Printerens RIP (Raster Image Processor) gør vektorerne ved outputenhedens oprindelige opløsning, så hvert modul kant er så sprød, som hardware tillader. Der er ingen interpolation, ingen antialiasing artefakter, ingen akkumuleret sløring fra flere omstørrelsesoperationer.', 'Ud over skalerbarhed, SVG-filer er mere robuste i professionelle arbejdsgange. De overlever rundture gennem design software uden nedbrydning. De kan farve- korrigeret uden omsmeltning. De indlejret rent i PDF-filer til presseready output. For ethvert udskriftsprogram, hvor kvalitet betyder noget, bør SVG være din standard eksport format.'],
    },
    {
      heading: 'Når PNG er acceptabel',
      paragraphs: ['PNG bliver nødvendigt, når din workflow eller destination platform ikke understøtter vektor formater. Nogle webplatforme, skiltning CMS-systemer, og arv print arbejdsgange kræver raster billeder. I disse tilfælde, kan PNG arbejde godt - men kun hvis du følger strenge regler: eksport på den endelige fysiske størrelse og opløsning, aldrig skalere op efter eksport, og undgå enhver lossy komprimering eller format konvertering.', 'Den kritiske regel for PNG er at beregne dine nødvendige pixeldimensioner før eksport. Hvis din QR udskriver ved 5 cm, og din printer kører ved 300 DPI, har du brug for cirka 590 pixels. Eksportér i denne størrelse eller større, og skaler derefter ned, hvis det er nødvendigt - aldrig op. Inkluder disse oplysninger i dit filnavn eller metadata, så fremtidige brugere ikke ved et uheld misbruger en størrelsesspecifik eksport.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'En regnemaskinegrænseflade, der viser forholdet mellem fysisk størrelse, DPI og krævede pixeldimensioner',
          caption: 'Lommeregner for udskriftsopløsning: bestemmer minimumspixeldimensionerne for din måloutputstørrelse',
        },
      ],
    },
    {
      heading: 'ANQR Eksportmuligheder forklaret',
      paragraphs: ['ANQR tilbyder flere SVG-eksporttilstande, der passer til forskellige arbejdsgange. True Vector-tilstand producerer rent sti-baseret output, ideelt til print og professionelle designværktøjer. Når du har tilføjet rasteroverlejringer eller visse effekter, kan ANQR indlejre disse, mens du bibeholder vektormoduler, eller du kan eksportere en fuldt rasteriseret version med din specificerede opløsning. Forståelse af disse muligheder hjælper dig med at vælge den rigtige eksport til hver brugssag.', 'For PNG-eksporter giver ANQR dig mulighed for at angive nøjagtige dimensioner og inkluderer muligheder for gennemsigtige baggrunde. DPI-indstillingen hjælper dig med at beregne passende størrelser til print, men husk, at DPI er metadata - det, der betyder noget for print, er at have nok pixels til din fysiske størrelse. Når du er i tvivl, eksporter større end du tror, ​​du har brug for; nedskalering bevarer kvaliteten, mens opskalering ødelægger den.'],
    },
    {
      heading: 'Klargøring af filer til Handoff',
      paragraphs: ['Ved fremsendelse af QR-grafik til designere eller udskriftsleverandører, omfatter klare specifikationer: den påtænkte fysiske størrelse, minimumskrav til roligt område, og enhver farvepladshensyn. For kritiske programmer, give både en SVG master og en høj opløsning PNG backup, tydeligt mærket med deres planlagte anvendelser. Inkludér din ANQR konfiguration link, så koden kan regenereres, hvis det er nødvendigt.', 'Foregribe almindelige fejl i overdragelsesprocessen. Angiv udtrykkeligt, at QR\'en ikke skal skaleres, roteres, skævt eller have effekter. Angiv, at den stille zone skal forblive fri - ingen skæremærker, registreringsmærker eller designelementer trænger ind. Hvis QR\'en skal placeres på en farvet eller fotografisk baggrund, skal du levere en version med en uigennemsigtig bagsideform for at sikre tilstrækkelig kontrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'En fil pakke diagram viser SVG master, PNG backup, specifikationer dokument, og konfigurationslink',
          caption: 'Professionel QR-overdragelsespakke: alt, hvad en designer eller printleverandør har brug for til nøjagtig gengivelse',
        },
      ],
    },
    {
      heading: 'Verifikation af udskriftsproofer',
      paragraphs: ['Aldrig godkende en print køre uden at scanne et fysisk bevis. Anmoder om et bevis trykt på det faktiske substrat med den faktiske efterbehandling, der vil blive anvendt i produktionen. Scan beviset under lysforhold svarende til hvor det endelige stykke vil blive vist. Test med flere enheder, herunder ældre smartphones, der kan kæmpe med marginal kvalitet.', 'Hvis beviset scanner langsomt eller inkonsekvent, undersøge før godkendelse. Almindelige spørgsmål omfatter utilstrækkelig kontrast på farvede substrater, rolige zone overtrædelser fra trimning, blæk spredning blødgøringsmodul kanter, eller laminering skaber blænding. Enhver af disse kan behandles, før du forpligter dig til en fuld print køre - men kun hvis du fanger dem på bevisstadiet.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'En kontrolliste med scanningsresultater, kontrastmålinger og godkendelsesunderskrifter',
          caption: 'Workflow for verifikation af trykkorrektur: systematisk test før forpligtelse til produktionsmængder',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Vis QR- eksempler',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Oprettelse af animerede QR-koder',
      paragraphs: ['Animerede QR-koder kombinerer funktionaliteten af standard QR-koder med øje- fangst bevægelse, der dramatisk øger engagement satser. I digital skiltning, sociale medier og interaktive skærme, animation forvandler et statisk værktøj til et overbevisende visuelt element, der trækker øjet og inviterer interaktion. Denne vejledning dækker de principper, teknikker og praktiske begrænsninger ved at skabe animerede QR-koder, der scanner pålideligt, mens du leverer visuel effekt.', 'Den grundlæggende udfordring ved animerede QR-koder er at afbalancere visuel interesse mod scanningspålidelighed. Hver ramme skal scannes individuelt - en scanner kan optage koden på ethvert tidspunkt i animationscyklussen. Denne begrænsning danner hver design beslutning: hvilke elementer kan flytte, hvor meget de kan ændre, og hvad skal forblive stabilt i hele animationen.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Et digitalt signaldisplay, der viser en animeret QR-kode, der fanger seerens opmærksomhed i et offentligt rum',
          caption: 'Animerede QR-koder i digital skiltning: bevægelse, der tiltrækker opmærksomhed og opfordrer til scanning',
        },
      ],
    },
    {
      heading: 'Hvordan Animation påvirker Scannability',
      paragraphs: ['QR scannere virker ved at opfange en enkelt ramme og analysere mønsteret af lys og mørke moduler. For at en animeret kode kan virke, skal hver ramme indeholde det komplette, gyldige QR-mønster. Dette udelukker animationer, der morph koden struktur, opløse moduler, eller væsentligt ændre kontrastmønster. Databærende moduler - det tilsyneladende tilfældige mønster i midten - skal forblive visuelt stabile hele vejen igennem.', 'Sikre animationstilgange ændrer elementer, der ikke bærer data: baggrunde, farver, dekorative rammer og overlejringselementer. De strukturelle komponenter - findermønstre (de store hjørnefirkanter), timingmønstre (de vekslende linjer) og alignmentmønstre (mindre firkanter i større koder) - skal bevare deres positioner og proportioner. At arbejde inden for disse begrænsninger giver stadig mulighed for overraskende dynamiske og engagerende animationer.'],
    },
    {
      heading: 'Animationsteknikker Det arbejde',
      paragraphs: ['Farvecykling animerer forgrunds- og baggrundsfarverne gennem en palet, samtidig med at der opretholdes tilstrækkelig kontrast på hvert trin. Dette skaber en levende, opmærksomme effekt med minimal scanningsrisiko - så længe kontrast aldrig falder under læsbare niveauer. ANQR \'s farvekredsløbspres er designet til at opretholde scanbarheden gennem hele cyklussen.', 'Animerede overlejringer placerer bevægelige billeder bag et semi-transparent QR-mønster. Koden forbliver stabil, mens baggrunden animerer - måske en looping-video, animerede mærkeelementer eller abstrakt motion graphics. Denne teknik kræver omhyggelig intensitetsstyring for at forhindre baggrunden i at overvælde QR-mønsteret, men skaber de mest visuelt slående resultater.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Et diagram, der viser den lagdelte struktur af et animeret QR: stabilt kodelag over animeret baggrundslag',
          caption: 'Animation layering princip: QR mønster forbliver konstant, mens baggrundselementer animere under',
        },
      ],
    },
    {
      heading: 'Indstil Animeringsparametre',
      paragraphs: ['Ramme hastighed påvirker både visuel glathed og filstørrelse. For de fleste programmer, 10- 15 rammer per sekund giver glat- udseende bevægelse uden overdreven filstørrelser. Højere frame satser tilbyder faldende visuelle afkast, mens betydeligt stigende filstørrelser. Overvej din leveringssammenhæng - et stort digitalt skilt kan håndtere større filer end en mobil annonce placering.', 'Loopadfærd bestemmer, hvordan animationen cykler. Sømløse sløjfer skaber kontinuerlig bevægelse, der er ideel til skiltning og omgivende visninger. Ping-pong-løkker (frem-og-tilbage) fungerer godt til simple animationer. For opmærksomhedsfangende pulser, overvej animationer med hold - perioder med stilhed præget af bevægelse, der trækker øjet uden konstant bevægelsestræthed.'],
    },
    {
      heading: 'Oprettelse af animerede overlays',
      paragraphs: ['Når du bruger animerede billeder (GIF\'er, animerede WebP\'er eller video) som overlejringer, udtrækker ANQR rammer og sammensætter dem med din QR-kode. Indstillingen for overlejringsintensitet styrer, hvor meget af animationen, der vises igennem - lavere værdier prioriterer scanning, mens højere værdier favoriserer visuel effekt. Test din valgte intensitet på tværs af flere billeder for at sikre ensartet scanbarhed.', 'Kildematerialekvalitet påvirker i betydelig grad resultaterne. Brug overlejringer med klare emner og god kontrast. Undgå kilder animationer med hurtig blink eller ekstreme lysstyrke ændringer, der kan skabe lejlighedsvis lavkontrastrammer. Vise den fulde animation cyklus, før du eksporterer til at fange eventuelle problematiske rammer, der kan undlade at scanne.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Et ramme- by- frame visning af et animeret overlay, der viser kontrastniveauer opretholdt på tværs af sekvensen',
          caption: 'Rammeanalyse: kontrol af konsistent scanbarhed gennem hele animationscyklussen',
        },
      ],
    },
    {
      heading: 'Eksport- og leveringsovervejelser',
      paragraphs: ['GIF forbliver det mest udbredte animerede format, der afspilles automatisk i de fleste sammenhænge uden at kræve understøttelse af videoafspiller. GIF\'s 256-farvepalet begrænser dog farvegengivelse. For farvekritiske animationer skal du overveje animeret WebP, hvor det understøttes, eller vende tilbage til videoformater for den højeste kvalitet. ANQRs GIF-eksport inkluderer dithering-muligheder for at maksimere kvaliteten inden for paletbegrænsninger.', 'Filstørrelsen har betydning for levering. Digitale skiltesystemer, e-mail-klienter og sociale platforme pålægger ofte størrelsesgrænser. Hvis din animation overskrider disse grænser, skal du reducere antal billeder, dimensioner eller farvedybde. Nogle gange opnås bedre resultater ved at opdele en kompleks animation i en kortere loop end aggressiv komprimering, der forringer hvert enkelt billede.'],
    },
    {
      heading: 'Test af animerede QR-koder',
      paragraphs: ['Test af animerede koder kræver scanning på flere punkter i animationscyklussen. Scan ikke bare én gang og antag succes - scan gentagne gange, på forskellige tidspunkter, for at verificere, at hver frame er læsbar. Vær særlig opmærksom på rammer ved ekstreme farvecyklusser eller overlejringsintensitetstoppe, hvor kontrasten kan være lavest.', 'Test på den faktiske display hardware, hvor det er muligt. Overvågning af farvekalibrering, synsvinkel og omgivende belysning påvirker alle animationen og scanningen. En lys animation, der scanner perfekt på din skærm kan vaske ud på en udendørs skærm eller blive ulæselig på skrå synsvinkler.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'En testmatrix, der viser scan succesrater på tværs af forskellige rammer, enheder og display betingelser',
          caption: 'Animeret QR testprotokol: systematisk verifikation på tværs af rammer, enheder og synsbetingelser',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Vis QR- eksempler',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR Sikkerhed og overholdelse Bedste praksis',
      paragraphs: ['En smukt designet QR kode, der undlader at scanne er værre end ubrugelig - det frustrerer kunder, skader mærke opfattelse, og spild enhver ressource investeret i sin skabelse og distribution. Denne vejledning dækker de tekniske og praktiske faktorer, der afgør, om en QR-kode vil scanne pålideligt, og hvordan man bruger ANQR \'s sikkerhedselementer til at fange potentielle problemer, før de når frem til produktionen.', 'QR kode pålidelighed er ikke binær. En kode kan scanne perfekt på flagskib telefoner, men mislykkes på budget enheder. Det kan arbejde i ideel belysning, men kæmper i dim restauranter eller lyse sollys. Forståelse af de faktorer, der påvirker scannability hjælper dig med at foretage informerede afvejninger mellem visuel styling og realverden pålidelighed.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Et pålidelighedsspektrum, der viser QR-koder, der spænder fra meget scannede til marginalt læsbare',
          caption: 'Scannability spektret: fra skudsikre koder til styling, der skubber pålideligheden grænser',
        },
      ],
    },
    {
      heading: 'Forståelse af fejlkorrektionsniveauer',
      paragraphs: ['QR-koder inkluderer indbygget redundans, der gør det muligt at læse dem, selv når de er delvist beskadigede eller skjulte. Fejlkorrektionsniveauet - L (7%), M (15%), Q (25%) eller H (30%) - bestemmer, hvor meget af koden der kan mangle, mens den stadig afkoder korrekt. Højere fejlkorrektion skaber større koder, men giver en sikkerhedsmargen for overlejringer, udskrivningsfejl og miljøskader.', 'For koder med billedoverlejringer er fejlkorrektionsniveau H afgørende - overlejringen skjuler fysisk en del af koden, og du har brug for den 30 % redundans for at opretholde pålideligheden. For rene, ustylede koder i kontrollerede miljøer er niveau M ofte tilstrækkeligt. Niveau L bør reserveres til situationer, hvor kodestørrelsen er kritisk begrænset, og du kan garantere uberørte forhold.'],
    },
    {
      heading: 'Den kritiske stille zone',
      paragraphs: ['Den rolige zone er den tomme margin omkring hver QR kode. Scannere bruger denne grænse til at identificere hvor koden begynder og slutter. ISO-standarden specificerer en mindst rolig zone på fire moduler (fire gange bredden af den mindste firkant i koden). At krænke dette rum - med designelementer, trimme kanter eller tilstødende indhold - er en af de mest almindelige årsager til scanningsfejl.', 'ANQR rolige zone håndhævelse hjælper med at opretholde denne kritiske afstand, men du skal også sikre, at det er bevaret i dine endelige design. Ved aflevering af QR-kunst angives udtrykkeligt kravene til stille zone. Ved placering af koder i layouts, kontrollere, at ingen elementer trænger ind i dette rum. Et par millimeter klart rum kan betyde forskellen mellem pålidelig scanning og frustrerede kunder.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Et diagram, der viser korrekt afstand mellem roligt område og almindelige overtrædelser, der forårsager scanningsfejl',
          caption: 'Stille zone krav: den usynlige margin, der bestemmer scan succes',
        },
      ],
    },
    {
      heading: 'Kontrast- og farvesikkerhed',
      paragraphs: ['QR scannere registrerer mønsteret af lys og mørke moduler. Enhver styling, der reducerer denne kontrast - lyse forgrunde, mørke baggrunde, gradient effekter, eller lav-opacitet overlejringer - gør koden sværere at læse. ANQR beregner kontrastforhold og advarer, når dine farvevalg nærmer sig farlige niveauer, men den endelige arbiter er altid real- verden test.', 'Farveopfattelsen varierer med lysforholdene. Det kan blive svært at skelne mellem en farvekombination med høj kontrast på din skærm under varm glødelampe eller kølige lysstofrør. Hvis din kode vil blive indsat under varierende lysforhold, test under flere lyskilder, og overveje mere konservative kontrastforhold som en sikkerhedsmargen.'],
    },
    {
      heading: 'Modul størrelse og visningsafstand',
      paragraphs: ['Den fysiske størrelse af individuelle moduler bestemmer den maksimale afstand, hvorfra en kode kan scannes. Mindre moduler betyder mindre koder, men kræver tættere scanningsafstande. Den generelle regel er, at hvert modul skal være mindst 0,5 mm ved den tilsigtede scanningsafstand, og skaleres proportionalt op for større afstande. En kode på et billboard har brug for meget større moduler end en kode på et visitkort.', 'Ved beregning modul størrelse, overveje worst-case scenario: kunden med en ældre telefon, i ufuldkommen belysning, scanning på den maksimale sandsynlige afstand. Design til denne bruger, og alle andre vil have en endnu bedre oplevelse. ANQR størrelse anbefalinger faktor i disse realverden variabler til at foreslå passende dimensioner til din påtænkte brug.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Et diagram over modulstørrelse, udskriftsdimensioner og maksimal effektiv scanningsafstand',
          caption: 'Scanner distance guide: matchende modul størrelse til din implementering krav',
        },
      ],
    },
    {
      heading: 'Brug af ANQR sikkerhedstilstand',
      paragraphs: ['ANQR "s Safety Mode giver real- time feedback på scanningspålidelighed. Det overvåger kontrastforhold, overholdelse af rolige zoner, overlay intensitet, og andre faktorer, der påvirker scannability. Når nogen parameter nærmer sig risikable niveauer, vil du se advarsler med specifik vejledning om, hvordan man forbedrer pålideligheden. For professionelle deployeringer, hvor svigt er dyrt, holde sikkerhed tilstand aktiv under hele designprocessen.', 'Sikkerhedstilstand omfatter også en scanningskontrol funktion, der forsøger at afkode din genererede kode og rapporterer succes eller fiasko. Mens denne in- app verifikation kan ikke kopiere hver real- verden tilstand, det fanger mange almindelige problemer, før du investerer i udskrivning eller distribution. Behandl vellykket verifikation som et minimum bar, ikke en garanti - real-world test forbliver afgørende.'],
    },
    {
      heading: 'Real- World Testing Protokoller',
      paragraphs: ['Ingen software verifikation erstatter fysisk test. Udskriv din kode i den ønskede størrelse på repræsentativt materiale. Test det i den faktiske implementering miljø med belysning betingelser, der matcher reel brug. Scan med flere enheder - ikke kun din flagskib telefon, men budget Android-enheder, ældre iPhones, og eventuelle specifikke enheder dit publikum almindeligt bruger.', 'Dokumenter din test systematisk. Registrer hvilke enheder der blev testet, under hvilke forhold, med hvilke resultater. Hvis du implementerer koder i stor skala, skal du etablere acceptkriterier: måske 95 % succesrate på tværs af din enhedstestpulje eller vellykkede scanninger inden for 2 sekunder på alle testede enheder. Disse standarder hjælper med at gøre go/no-go beslutninger objektive frem for at håbe på det bedste.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'En omfattende testcheckliste, der omfatter udstyr, betingelser og acceptkriterier',
          caption: 'QR-testprotokol: systematisk verifikation før produktionsforpligtelse',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Åbn generatoren',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Vis QR- eksempler',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Vis QR- eksempler', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Åbn den fulde brugervejledning', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Åbn galleriet', type: 'gallery' },
  ],
};
