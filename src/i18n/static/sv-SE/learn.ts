import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Lär dig med ANQR',
  description: 'Praktiska, business-first guider för att förvandla QR-koder till riktiga marknadsföringstillgångar – inte bara funktionella rutor. Lär dig hur du uppgraderar äldre kassakoder, skapar kompatibel QR-skyltning för betalningar, förbereder utskriftsklara exporter, använder animation säkert på digitala skärmar och delar inlåsta konfigurationer mellan flerspråkiga team med ANQR ("ankare") länkar.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Öppna generatorn', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Se QR-exempel', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Öppna hela användarhandboken', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Förbättra befintliga QR-kampanjer',
      paragraphs: ['De flesta företag har QR-koder utspridda över sin verksamhet – på menyer, diskställ, förpackningar och reklammaterial. Många av dessa koder skapades för flera år sedan med grundläggande generatorer, vilket resulterade i generiska svart-vita rutor som inte inspirerar förtroende eller matchar din varumärkesidentitet. Den här omfattande guiden leder dig genom ett systematiskt tillvägagångssätt för att granska, uppgradera och optimera din befintliga QR-infrastruktur utan att störa de kundresor du redan har etablerat.', 'Den strategiska fördelen med att uppgradera snarare än att ersätta dina QR-koder ligger i att bevara kontinuiteten. Dina kunder har redan lärt sig att förvänta sig vissa destinationer när de skannar dina koder. Genom att hålla de kodade webbadresserna identiska samtidigt som du dramatiskt förbättrar den visuella presentationen, skanningens tillförlitlighet och varumärkesanpassning, skapar du en sömlös övergång som ökar förtroendet utan att kräva några ändringar i din digitala infrastruktur eller analysspårning.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'En jämförelse sida vid sida som visar en blek, generisk QR-kod bredvid en modern märkesversion som kodar samma URL',
          caption: 'Före och efter: Samma måladress omvandlad från en daterad generisk kod till en tillgång med professionellt varumärke',
        },
      ],
    },
    {
      heading: 'Varför äldre QR-koder underpresterar',
      paragraphs: ['QR-koder som skapades under den tidiga adoptionsfasen - särskilt under 2020-2021 när företag skyndade sig att implementera kontaktlösa lösningar - lider ofta av flera kritiska problem. Låga felkorrigeringsinställningar gör dem ömtåliga när de skrivs ut på strukturerade ytor eller ses under utmanande belysning. Otillräckliga tysta zoner orsakar skanningsfel när koder placeras nära andra visuella element. Generisk styling misslyckas med att kommunicera varumärkets legitimitet, vilket leder till tvekan och minskade skanningsfrekvenser.', 'Utöver tekniska begränsningar representerar äldre koder ofta missade varumärkesmöjligheter. Varje QR-kod är en kontaktpunkt med din kund – ett ögonblick då de är aktivt engagerade och villiga att vidta åtgärder. En professionellt utformad kod som matchar dina varumärkesfärger, inkluderar lämpliga säkerhetsmarginaler och har valfria märkeselement förvandlar detta verktyg till en marknadsföringstillgång som stärker din identitet vid varje interaktion.'],
    },
    {
      heading: 'Genomföra en QR-kodrevision',
      paragraphs: ['Börja ditt uppgraderingsprojekt genom att skapa en omfattande inventering av varje QR-kod som för närvarande används i ditt företag. Dokumentera den fysiska platsen, den kodade destinationen, det aktuella tillståndet för det tryckta materialet och den typiska skanningsmiljön inklusive ljusförhållanden och betraktningsvinklar. Testa varje kod med flera enheter – äldre smartphones och budgetenheter avslöjar ofta tillförlitlighetsproblem som premiumtelefoner maskerar.', 'Var särskilt uppmärksam på koder på platser med hög insats: betalningsställen, incheckningsområden och kampanjskärmar där skanningsfel direkt påverkar intäkter eller kundupplevelse. Dessa bör prioriteras för omedelbar uppgradering. Notera också koder som visas i fotografi eller videoinnehåll, eftersom dessa kommer att kräva samordning med ditt marknadsföringsteam för att uppdatera visuella tillgångar.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Ett checklista-gränssnitt som visar QR-revisionskategorier: plats, skick, skanningspålitlighet och prioritetsklassificering',
          caption: 'Systematisk QR-revisionsmall för att dokumentera och prioritera dina uppgraderingskandidater',
        },
      ],
    },
    {
      heading: 'Strategin för säker uppgradering',
      paragraphs: ['Huvudregeln för QR-uppgraderingar är bevarande av destinationer. Extrahera den exakta webbadressen från varje befintlig kod och koda den identiskt i din nya version. Detta säkerställer att all befintlig analys, omdirigeringslogik och kundernas förväntningar förblir intakta. Om du behöver destinationsflexibilitet för framtida uppdateringar är det här den perfekta tiden att introducera en kort webbadress eller omdirigeringstjänst – men implementera detta som ett separat projekt för att undvika komplicerade ändringar.', 'För den visuella uppgraderingen, tillämpa förbättringar i lager: säkerställ först teknisk tillförlitlighet (lämplig felkorrigering och tyst zon), lägg sedan till varumärkesstyling (färger, modulformer) och överväg slutligen valfria förbättringar (centrumöverlägg, ramar). Varje lager bör valideras genom testning innan du fortsätter. ANQR:s säkerhetsläge hjälper till att upprätthålla dessa prioriteringar genom att varna när stylingval kan äventyra skanningsbarheten.'],
    },
    {
      heading: 'Lägga till varumärkesidentitet utan att kompromissa med tillförlitligheten',
      paragraphs: ['Effektiv QR-varumärkning balanserar visuell påverkan mot skanningstillförlitlighet. Börja med färg: ersätt den svarta standardförgrunden med din primära märkesfärg, för att säkerställa tillräcklig kontrast mot din bakgrund. För de flesta märken fungerar mörka färger på ljus bakgrund bäst. Undvik kombinationer med låg kontrast, gradienter som minskar kanternas klarhet eller färger som ser likadana ut under vanliga ljusförhållanden.', 'Anpassning av modulform erbjuder ytterligare ett varumärkesmöjlighet med minimal påverkan på tillförlitligheten. Rundade moduler skapar ett mjukare, mer lättillgängligt utseende samtidigt som de bibehåller utmärkt skanningsbarhet. Dot-style moduler fungerar bra för moderna, tekniskt framåtriktade varumärken. Anslutna moduler passar industriella eller företagsidentiteter. Oavsett vilken stil du väljer, bibehåll konsistens över alla dina QR-distributioner för omedelbar varumärkesigenkänning.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Ett färghjulsdiagram som visar optimala QR-färgkombinationer med kontrastförhållandeindikatorer',
          caption: 'Varumärkesfärgvalsguide som visar kombinationer med hög kontrast som bibehåller skanningens tillförlitlighet',
        },
      ],
    },
    {
      heading: 'Testnings- och valideringsprotokoll',
      paragraphs: ['Använd aldrig uppgraderade QR-koder utan rigorösa tester. Skriv ut ett fysiskt provtryck i exakt storlek och på samma material som din slutgiltiga distribution. Testa på den faktiska plats där koden kommer att leva, vid olika tider på dygnet för att ta hänsyn till ljusvariationer. Använd minst tre olika enheter: en nuvarande flaggskeppstelefon, en medelstor enhet och en äldre eller budgetsmarttelefon.', 'Registrera skanningstider och framgångsfrekvenser för varje test. En väl optimerad kod bör skannas inom 1-2 sekunder på vilken någorlunda modern enhet som helst. Om du ser konsekventa förseningar eller misslyckanden, minska stylingintensiteten - ta bort eller förminska överlägg, öka storleken på den tysta zonen eller byt till en högre felkorrigeringsnivå. Tillförlitlighet har alltid företräde framför visuell sofistikering.'],
    },
    {
      heading: 'Låsa din konfiguration för konsekvens',
      paragraphs: ['När du har validerat en optimal konfiguration, bevara den med hjälp av ANQR:s delbara länkar. Detta skapar en permanent registrering av varje inställning som används för att generera din godkända kod - färger, modulstil, felkorrigering, storlek och eventuella överlagringar. Dela den här länken med ditt designteam, tryckerileverantörer och alla som kan behöva reproducera koden i framtiden.', 'Detta konfigurationslås förhindrar den gradvisa försämringen som plågar många QR-installationer. Utan det återskapar personalen koder från skärmdumpar, designers bygger om inställningar från minnet och tryckerileverantörer gör "nyttiga" justeringar. Varje variant introducerar potentiella problem. Med en låst konfigurationslänk är varje reproduktion identisk med ditt testade, godkända original.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Ett diagram som visar konfigurationsdrift: skärmdumpar som leder till rekreationer som leder till varianter, kontra en enda länk till sanningen',
          caption: 'Förhindra konfigurationsavvikelser genom att skapa en enda auktoritativ källa för alla QR-reproduktioner',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Se QR-exempel',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR-koder för detaljhandelsbetalningar',
      paragraphs: ['QR-koder för betalning fungerar i den mest krävande miljön inom detaljhandeln: transaktionsögonblicket. Kunderna är redo att betala, ofta med en kö bakom sig, och varje sekund av förseningar skapar friktion. Ändå är detta högtrycksmoment också en utmärkt fastighet för varumärkesförstärkning. Den här guiden förklarar hur du skapar betalnings-QR-koder som skannar omedelbart på bankappar samtidigt som de ger ett professionellt varumärke som skapar förtroende hos kunderna.', 'Grundprincipen för QR-koder för betalning är tillförlitlighet framför estetik. En vackert designad kod som inte går att skanna på en kunds bankapp kommer att kosta dig mycket mer i övergivna transaktioner och frustrerade kunder än en konservativ design någonsin skulle kunna. Börja med efterlevnad, lägg till tillförlitlighet och lägg sedan försiktigt in varumärket endast där det inte äventyrar den primära funktionen.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'En butiksdisk som visar en QR-kod för betalning som skannas av en smartphone med en bankapp',
          caption: 'QR-koder för betalning måste fungera omedelbart med bank- och plånboksappar under verkliga motförhållanden',
        },
      ],
    },
    {
      heading: 'Förstå betalnings QR-standarder',
      paragraphs: ['QR-koder för betalning följer vanligtvis regionala standarder som dikterar nyttolastformatet. I Singapore använder PayNow QR specifik formatering. I Indien följer UPI-koder BharatQR- eller UPI-djuplänksstandarder. Europeiska SEPA-betalningar använder EPC QR-koder. Varje standard finns för att säkerställa att bankappar omedelbart kan känna igen och behandla betalningsinformationen. Att avvika från dessa standarder – till och med något – kan få betalningsappar att avvisa koder som generiska kameraskannrar läser utan problem.', 'ANQR innehåller mallar för viktiga betalningsstandarder som automatiskt formaterar dina säljaruppgifter till kompatibla nyttolaster. Använd alltid dessa mallar istället för att manuellt konstruera betalningssträngar, eftersom även mindre formateringsfel kan orsaka transaktionsfel. Om din regions betalningsstandard inte är tillgänglig som en mall, se din betalningsleverantörs tekniska dokumentation för exakta formateringskrav.'],
    },
    {
      heading: 'Dimensionering och placering för bänkskärmar',
      paragraphs: ['Counter-top QR codes face unique physical challenges. Kunderna skannar på armlängds avstånd, ofta i vinkel, ibland genom nysskydd eller montrar. Takbelysning skapar bländande fläckar. Koden tävlar med andra disktrasor om uppmärksamhet och tydliga siktlinjer. Storleken på din betalnings QR generöst - minst 4-5 cm rekommenderas för de flesta diskapplikationer, skala upp om koden sitter bakom glas eller i ett svagt upplyst område.', 'Positionen spelar lika stor roll som storleken. Placera koden där kunderna bekvämt kan hålla sin telefon utan att blockera kön eller sträcka sig obekvämt. Vinkla displayen mot kunden istället för att lägga den platt. Om möjligt, använd matt laminering eller icke-reflekterande displaymaterial för att minimera bländning från takbelysning. Testa den slutliga placeringen vid olika tidpunkter på dagen för att fånga belysningsproblem.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Ett diagram som visar optimala QR-placeringshöjder och vinklar för olika räknarkonfigurationer',
          caption: 'Räknarplaceringsguide: optimala höjder, vinklar och avstånd för pålitlig betalningsskanning',
        },
      ],
    },
    {
      heading: 'Konservativt varumärke för betalningskoder',
      paragraphs: ['Betalningsappar är mindre förlåtande än generiska kameraskannrar. Många bankappar använder äldre, enklare QR-läsalgoritmer optimerade för hastighet snarare än flexibilitet. Detta innebär att styling som fungerar perfekt med en telefonkamera kan misslyckas med specifika betalningsappar. Håll varumärket konservativt: använd din varumärkesfärg i förgrunden om den bibehåller stark kontrast, men undvik gradienter, tunga överlagringar eller dekorativa element som kan störa igenkänningen.', 'Om du vill ha en centerlogotyp eller överlägg, håll den extremt liten - inte mer än 10-15 % av QR-ytan - och testa utförligt med varje betalningsapp som dina kunder kan använda. Många företag väljer att inte lägga över betalningskoder specifikt, och reserverar denna stil för marknadsföring av QR-koder där tillförlitlighetskraven är mindre stränga. Betalningskodens uppgift är att behandla transaktioner, inte att imponera visuellt.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'En jämförelse som visar acceptabla kontra riskabla varumärkesnivåer för QR-koder för betalning',
          caption: 'Payment QR-varumärkesspektrum: från säker konservativ styling till riskabla dekorativa tillvägagångssätt',
        },
      ],
    },
    {
      heading: 'Material och tryck överväganden',
      paragraphs: ['Det fysiska visningsmaterialet påverkar skanningens tillförlitlighet avsevärt. Blank laminering reflekterar överljus direkt in i kundens kamera. Texturerade material kan förvränga modulens kanter. Billiga utskrifter kan sudda ut fina detaljer. För betalnings-QR-koder, investera i kvalitet: använd matt- eller satinlaminering, säkerställ högupplösta utskrifter och byt ut skärmar innan de visar slitage. En repad eller blek betalningskod kostar dig transaktioner.', 'Tänk på skärmens hållbarhet och utbytbarhet. Diskskärmar blir rörda, flyttade, stänkte och då och då välta. Designa ditt displaysystem så att QR-insatsen enkelt kan bytas ut utan att byta ut hela stativet. Håll reservutskrifter redo, genererade från din låsta konfigurationslänk, så att slitna koder kan bytas omedelbart.'],
    },
    {
      heading: 'Testa med riktiga betalningsappar',
      paragraphs: ['Generiska kameraskannrar avkodar nästan alla rimligt formaterade QR-koder. Betalningsappar är mer valbara. Innan du använder en QR-kod för betalning, testa den med alla betalningsappar som dina kunder kan använda. I miljöer med flera betalningar kan detta innebära testning med flera bankappar, digitala plånböcker och betalningsplattformar. Dokumentera vilka appar du har testat och deras versioner – betalningsappar uppdateras ofta, och en uppdatering kan ändra skanningsbeteende.', 'Testa under realistiska förhållanden: den faktiska displayen, faktisk belysning, faktiska skanningsavstånd. En kod som omedelbart skannar på ditt skrivbord kan kämpa på disken klockan 17.00 när eftermiddagssolen skapar bländning. Testa med den äldsta, billigaste smartphone du kan hitta - om den fungerar tillförlitligt på en budgetenhet, fungerar den på allt. Flagga valfri skanningstid över 2 sekunder för undersökning och eventuell omdesign.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'En checklista för testning som visar olika betalningsappar, enhetstyper och miljöförhållanden att verifiera',
          caption: 'Omfattande QR-testmatris för betalning som täcker appar, enheter och miljöfaktorer',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Se QR-exempel',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Utskriftsfärdiga QR-koder: SVG vs PNG',
      paragraphs: ['Skillnaden mellan en QR-kod som skannar perfekt och en som misslyckas beror ofta på hur den exporterades och hanterades i utskriftsarbetsflödet. Den här guiden förklarar de kritiska skillnaderna mellan vektor- (SVG) och raster- (PNG)-format, när de ska användas och hur man lämnar ut QR-konstverk till designers och tryckerileverantörer på ett sätt som bevarar skanningens tillförlitlighet från visitkort till skyltar i storleken på skyltar.', 'Tryckproduktion introducerar variabler som inte finns på skärmen: bläckspridning, substratstruktur, efterbehandlingsprocesser och den kumulativa effekten av flera filkonverteringar. En QR-kod som ser perfekt ut i din designprogramvara kan komma ut från skrivaren med mjuka kanter, minskad kontrast eller subtilt förvrängda moduler. Att förstå formatval och bästa praxis för arbetsflöde förhindrar dessa tysta misslyckanden.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'En förstorad vy som jämför vektor QR-moduler med skarpa kanter mot rastermoduler som visar pixelartefakter',
          caption: 'Vektor vs raster i utskriftsskala: precisionsskillnaden som avgör skanningens tillförlitlighet',
        },
      ],
    },
    {
      heading: 'Varför Vector (SVG) är att föredra för utskrift',
      paragraphs: ['SVG-filer beskriver QR-koder som matematiska former snarare än rutnät av pixlar. Detta innebär att koden kan skalas till vilken storlek som helst - från en etikett på 1 cm till en 10-meters banderoll - utan förlust av kantskärpa. Skrivarens RIP (Raster Image Processor) återger vektorerna med utenhetens ursprungliga upplösning, vilket säkerställer att varje modulkant är så skarp som hårdvaran tillåter. Det finns ingen interpolation, inga anti-aliasing-artefakter, ingen ackumulerad oskärpa från flera storleksändringsoperationer.', 'Utöver skalbarhet är SVG-filer mer robusta i professionella arbetsflöden. De överlever rundresor genom designprogramvara utan försämring. De kan färgkorrigeras utan omsampling. De bäddar in rent i PDF-filer för pressklar utmatning. För alla utskriftsapplikationer där kvaliteten är viktig bör SVG vara ditt standardexportformat.'],
    },
    {
      heading: 'När PNG är acceptabelt',
      paragraphs: ['PNG blir nödvändigt när ditt arbetsflöde eller målplattform inte stöder vektorformat. Vissa webbplattformar, signage CMS-system och äldre utskriftsarbetsflöden kräver rasterbilder. I dessa fall kan PNG fungera bra - men bara om du följer strikta regler: exportera med den slutliga fysiska storleken och upplösningen, skala aldrig upp efter exporten och undvik all förlustbringande komprimering eller formatkonvertering.', 'Den kritiska regeln för PNG är att beräkna dina nödvändiga pixeldimensioner innan du exporterar. Om din QR kommer att skriva ut vid 5 cm och din skrivare arbetar med 300 DPI, behöver du cirka 590 pixlar. Exportera till denna storlek eller större, skala sedan ner om det behövs - aldrig upp. Inkludera denna information i ditt filnamn eller metadata så att framtida användare inte missbrukar en storleksspecifik export av misstag.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Ett kalkylatorgränssnitt som visar förhållandet mellan fysisk storlek, DPI och nödvändiga pixeldimensioner',
          caption: 'Kalkylator för utskriftsupplösning: bestämmer minsta pixeldimensioner för din målstorlek',
        },
      ],
    },
    {
      heading: 'ANQR-exportalternativ förklaras',
      paragraphs: ['ANQR erbjuder flera SVG-exportlägen för att passa olika arbetsflöden. True Vector-läget producerar ren banbaserad utskrift, idealisk för utskriftsverktyg och professionella designverktyg. När du har lagt till rasteröverlägg eller vissa effekter kan ANQR bädda in dessa samtidigt som vektormoduler bibehålls, eller så kan du exportera en helt rastrerad version med din specificerade upplösning. Att förstå dessa alternativ hjälper dig att välja rätt export för varje användningsfall.', 'För PNG-exporter låter ANQR dig ange exakta mått och inkluderar alternativ för transparenta bakgrunder. DPI-inställningen hjälper dig att beräkna lämpliga storlekar för utskrift, men kom ihåg att DPI är metadata - det som är viktigt för utskriften är att ha tillräckligt med pixlar för din fysiska storlek. När du är osäker, exportera större än du tror att du behöver; nedskalning bevarar kvaliteten medan uppskalning förstör den.'],
    },
    {
      heading: 'Förbereder filer för överlämnande',
      paragraphs: ['När du skickar QR-konstverk till designers eller tryckerileverantörer, inkludera tydliga specifikationer: den avsedda fysiska storleken, minimikrav för tyst zon och eventuella färgrymdsöverväganden. För kritiska applikationer, tillhandahåll både en SVG-master och en högupplöst PNG-säkerhetskopia, tydligt märkt med deras avsedda användningsområden. Inkludera din ANQR-konfigurationslänk så att koden kan återskapas om det behövs.', 'Förutse vanliga misstag i överlämningsprocessen. Ange uttryckligen att QR:en inte ska skalas, roteras, skevt eller ha effekter. Ange att den tysta zonen måste förbli fri - inga skärmärken, registreringsmärken eller designelement som tränger in. Om QR ska placeras på en färgad eller fotografisk bakgrund, tillhandahåll en version med en ogenomskinlig baksida för att säkerställa tillräcklig kontrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Ett filpaketdiagram som visar SVG-master, PNG-säkerhetskopia, specifikationsdokument och konfigurationslänk',
          caption: 'Professionellt QR-överlämningspaket: allt en designer eller tryckerileverantör behöver för korrekt återgivning',
        },
      ],
    },
    {
      heading: 'Verifiera tryckprov',
      paragraphs: ['Godkänn aldrig en utskrift utan att skanna ett fysiskt korrektur. Begär ett provtryck tryckt på själva substratet med den faktiska efterbehandlingen som kommer att användas i produktionen. Skanna provet under ljusförhållanden som liknar där den sista biten kommer att visas. Testa med flera enheter, inklusive äldre smartphones som kan kämpa med marginell kvalitet.', 'Om beviset skannar långsamt eller inkonsekvent, undersök det innan du godkänner. Vanliga problem inkluderar otillräcklig kontrast på färgade underlag, tysta zonöverträdelser från trimning, bläckspridning av mjukningsmodulens kanter eller laminering som skapar bländning. Alla dessa kan åtgärdas innan du bestämmer dig för en fullständig upplaga - men bara om du fångar dem vid provningsstadiet.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'En checklista för provgranskning med skanningstestresultat, kontrastmätningar och godkännandesignaturer',
          caption: 'Arbetsflöde för verifiering av utskriftsbevis: systematisk testning innan man bestämmer sig för produktionskvantiteter',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Se QR-exempel',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Skapa animerade QR-koder',
      paragraphs: ['Animerade QR-koder kombinerar funktionaliteten hos vanliga QR-koder med iögonfallande rörelser som dramatiskt ökar engagemangsgraden. I digital skyltning, sociala medier och interaktiva skärmar förvandlar animation ett statiskt verktyg till ett övertygande visuellt element som drar ögat och inbjuder till interaktion. Den här guiden täcker principerna, teknikerna och praktiska begränsningarna för att skapa animerade QR-koder som skannar på ett tillförlitligt sätt samtidigt som de ger visuell effekt.', 'Den grundläggande utmaningen med animerade QR-koder är att balansera visuellt intresse mot skanningstillförlitlighet. Varje bildruta måste vara individuellt skanningsbar - en skanner kan fånga koden när som helst i animeringscykeln. Denna begränsning formar varje designbeslut: vilka element som kan röra sig, hur mycket de kan förändras och vad som måste förbli stabilt under hela animeringen.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'En digital skyltskärm som visar en animerad QR-kod som fångar tittarens uppmärksamhet i ett offentligt utrymme',
          caption: 'Animerade QR-koder i digital skyltning: rörelse som drar till sig uppmärksamhet och uppmuntrar till skanning',
        },
      ],
    },
    {
      heading: 'Hur animering påverkar skanningsbarhet',
      paragraphs: ['QR-skannrar fungerar genom att fånga en enda ram och analysera mönstret av ljusa och mörka moduler. För att en animerad kod ska fungera måste varje bildruta innehålla det kompletta, giltiga QR-mönstret. Detta utesluter animationer som förändrar kodstrukturen, löser upp moduler eller väsentligt ändrar kontrastmönstret. De databärande modulerna - det till synes slumpmässiga mönstret i mitten - måste förbli visuellt stabila hela tiden.', 'Säkra animeringsmetoder ändrar element som inte bär data: bakgrunder, färger, dekorativa ramar och överläggselement. De strukturella komponenterna - sökmönster (de stora hörnrutorna), tidsmönster (de alternerande linjerna) och inriktningsmönster (mindre rutor i större koder) - måste behålla sina positioner och proportioner. Att arbeta inom dessa begränsningar möjliggör fortfarande förvånansvärt dynamiska och engagerande animationer.'],
    },
    {
      heading: 'Animationstekniker som fungerar',
      paragraphs: ['Färgcykling animerar förgrunds- och bakgrundsfärgerna genom en palett samtidigt som tillräcklig kontrast bibehålls vid varje steg. Detta skapar en levande, uppmärksamhetsfångande effekt med minimal skanningsrisk - så länge kontrasten aldrig sjunker under läsbara nivåer. ANQR:s färgcykelförinställningar är utformade för att bibehålla skanningsbarhet under hela cykeln.', 'Animerade överlägg placerar rörliga bilder bakom ett halvtransparent QR-mönster. Koden förblir stabil medan bakgrunden animeras - kanske en looping-video, animerade varumärkeselement eller abstrakt rörlig grafik. Denna teknik kräver noggrann intensitetshantering för att förhindra att bakgrunden överväldigar QR-mönstret, men skapar de mest visuellt slående resultaten.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Ett diagram som visar lagerstrukturen för ett animerat QR: stabilt kodlager över animerat bakgrundslager',
          caption: 'Animationslagerprincip: QR-mönstret förblir konstant medan bakgrundselement animeras under',
        },
      ],
    },
    {
      heading: 'Konfigurera animationsparametrar',
      paragraphs: ['Bildhastighet påverkar både visuell jämnhet och filstorlek. För de flesta applikationer ger 10-15 bilder per sekund smidiga rörelser utan överdrivna filstorlekar. Högre bildfrekvens ger minskande visuell avkastning samtidigt som filstorlekarna ökar avsevärt. Tänk på ditt leveranssammanhang – en stor digital skylt kan hantera större filer än en mobilannonsplacering.', 'Slingbeteende avgör hur animeringen cyklar. Sömlösa slingor skapar kontinuerlig rörelse idealisk för skyltar och omgivande visningar. Ping-pong-loopar (framåt-sedan-bakåt) fungerar bra för enkla animationer. För att fånga uppmärksamheten pulser, överväg animationer med hållningar - perioder av stillhet som avbryts av rörelser som drar ögat utan konstant rörelsetrötthet.'],
    },
    {
      heading: 'Skapa animerade överlägg',
      paragraphs: ['När du använder animerade bilder (GIF, animerade WebPs eller video) som överlagringar, extraherar ANQR ramar och sammansätter dem med din QR-kod. Inställningen för överlagringsintensitet styr hur mycket av animeringen som visas - lägre värden prioriterar skanningsbarhet medan högre värden gynnar visuell effekt. Testa din valda intensitet över flera bildrutor för att säkerställa konsekvent skanningsbarhet.', 'Källmaterialets kvalitet påverkar resultaten avsevärt. Använd överlägg med tydliga motiv och bra kontrast. Undvik källanimationer med snabbt blinkande eller extrema ljusstyrkaförändringar som kan skapa enstaka bildrutor med låg kontrast. Förhandsgranska hela animeringscykeln innan du exporterar för att fånga eventuella problematiska bildrutor som inte kan skannas.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'En bildruta-för-bildruta-vy av en animerad överlagring som visar kontrastnivåer som bibehålls över sekvensen',
          caption: 'Ramanalys: verifierar konsekvent skanningsbarhet över hela animeringscykeln',
        },
      ],
    },
    {
      heading: 'Export- och leveransöverväganden',
      paragraphs: ['GIF är fortfarande det animerade formatet som stöds mest och spelas automatiskt i de flesta sammanhang utan att behöva stöd för videospelare. GIFs palett med 256 färger begränsar dock färgåtergivningen. För färgkritiska animationer, överväg animerad WebP där det stöds, eller fall tillbaka till videoformat för högsta kvalitet. ANQR:s GIF-export inkluderar rastreringsalternativ för att maximera kvaliteten inom palettbegränsningar.', 'Filstorleken har betydelse för leverans. Digitala skyltsystem, e-postklienter och sociala plattformar sätter ofta storleksgränser. Om din animering överskrider dessa gränser, minska antalet bildrutor, dimensioner eller färgdjup. Ibland ger en uppdelning av en komplex animation i en kortare loop bättre resultat än aggressiv komprimering som försämrar varje bildruta.'],
    },
    {
      heading: 'Testar animerade QR-koder',
      paragraphs: ['Att testa animerade koder kräver skanning vid flera punkter i animeringscykeln. Skanna inte bara en gång och förutsätt att du lyckas – skanna upprepade gånger, vid olika tillfällen, för att verifiera att varje bildruta är läsbar. Var särskilt uppmärksam på ramar vid extrema färgcykler eller toppar av överlagringsintensitet där kontrasten kan vara lägst.', 'Testa på den faktiska displayhårdvaran där det är möjligt. Övervakningsfärgkalibrering, betraktningsvinkel och omgivande belysning påverkar alla hur animeringen visas och skannar. En ljus animation som skannar perfekt på din bildskärm kan sköljas ut på en utomhusskärm eller bli oläslig i sneda betraktningsvinklar.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'En testmatris som visar skanningsframgångsfrekvenser över olika ramar, enheter och visningsförhållanden',
          caption: 'Animerat QR-testprotokoll: systematisk verifiering över ramar, enheter och visningsförhållanden',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Se QR-exempel',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Bästa praxis för QR-säkerhet och efterlevnad',
      paragraphs: ['En vackert designad QR-kod som inte går att skanna är värre än värdelös - den frustrerar kunder, skadar varumärkesuppfattningen och slösar bort varje resurs som investeras i att skapa och distribuera den. Den här guiden täcker de tekniska och praktiska faktorerna som avgör om en QR-kod ska skannas tillförlitligt, och hur man använder ANQR:s säkerhetsfunktioner för att fånga upp potentiella problem innan de når produktionen.', 'QR-kodens tillförlitlighet är inte binär. En kod kan skanna perfekt på flaggskeppstelefoner men misslyckas på budgetenheter. Det kan fungera i idealisk belysning men kämpar i svaga restauranger eller starkt solljus. Att förstå faktorerna som påverkar skanningsbarheten hjälper dig att göra välgrundade avvägningar mellan visuell stil och verklig tillförlitlighet.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Ett tillförlitlighetsspektrum som visar QR-koder som sträcker sig från mycket skanningsbara till marginellt läsbara',
          caption: 'Skanningsspektrat: från skottsäkra koder till styling som tänjer på tillförlitlighetsgränserna',
        },
      ],
    },
    {
      heading: 'Förstå felkorrigeringsnivåer',
      paragraphs: ['QR-koder inkluderar inbyggd redundans som gör att de kan läsas även när de är delvis skadade eller mörka. Felkorrigeringsnivån - L (7%), M (15%), Q (25%) eller H (30%) - bestämmer hur mycket av koden som kan saknas medan den fortfarande avkodas korrekt. Högre felkorrigering skapar större koder men ger en säkerhetsmarginal för överlagringar, utskriftsfel och miljöskador.', 'För koder med bildöverlägg är felkorrigeringsnivå H väsentlig - överlägget skymmer fysiskt en del av koden, och du behöver den 30 % redundansen för att bibehålla tillförlitligheten. För rena, ostylade koder i kontrollerade miljöer räcker ofta nivå M. Nivå L bör reserveras för situationer där kodstorleken är kritiskt begränsad och du kan garantera orörda förhållanden.'],
    },
    {
      heading: 'Den kritiska tysta zonen',
      paragraphs: ['Den tysta zonen är den tomma marginalen som omger varje QR-kod. Scanners använder denna gräns för att identifiera var koden börjar och slutar. ISO-standarden specificerar en minsta tyst zon på fyra moduler (fyra gånger bredden på den minsta kvadraten i koden). Att kränka detta utrymme - med designelement, trimkanter eller intilliggande innehåll - är en av de vanligaste orsakerna till skanningsfel.', 'ANQR:s tillämpning av tysta zoner hjälper till att bibehålla detta kritiska avstånd, men du måste också se till att det bevaras i dina slutliga design. När du lämnar ut QR-konstverk, ange uttryckligen kraven på tyst zon. När du placerar koder i layouter, kontrollera att inga element tränger in i detta utrymme. Några millimeters fritt utrymme kan betyda skillnaden mellan pålitlig skanning och frustrerade kunder.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Ett diagram som visar korrekt tyst zonavstånd kontra vanliga överträdelser som orsakar skanningsfel',
          caption: 'Krav på tyst zon: den osynliga marginalen som avgör skanningens framgång',
        },
      ],
    },
    {
      heading: 'Kontrast och färgsäkerhet',
      paragraphs: ['QR-skannrar upptäcker mönstret av ljusa och mörka moduler. Varje stil som minskar denna kontrast – ljusa förgrunder, mörka bakgrunder, gradienteffekter eller låg opacitet – gör koden svårare att läsa. ANQR beräknar kontrastförhållanden och varnar när dina färgval närmar sig farliga nivåer, men den slutliga bedömningen är alltid tester i verkligheten.', 'Färguppfattningen varierar med ljusförhållandena. En färgkombination som verkar ha hög kontrast på din bildskärm kan bli svår att urskilja under varm glödlampsbelysning eller svala lysrör. Om din kod kommer att användas i olika ljusförhållanden, testa under flera ljuskällor och överväg mer konservativa kontrastförhållanden som en säkerhetsmarginal.'],
    },
    {
      heading: 'Modulstorlek och visningsavstånd',
      paragraphs: ['Den fysiska storleken på enskilda moduler bestämmer det maximala avståndet från vilket en kod kan skannas. Mindre moduler betyder mindre koder men kräver kortare skanningsavstånd. Den allmänna regeln är att varje modul ska vara minst 0,5 mm vid det avsedda skanningsavståndet, och skala upp proportionellt för större avstånd. En kod på en skylt behöver mycket större moduler än en kod på ett visitkort.', 'När du beräknar modulstorlek, överväg det värsta scenariot: kunden med en äldre telefon, i ofullständig belysning, skannar på det största sannolika avståndet. Designa för den här användaren, så får alla andra en ännu bättre upplevelse. ANQR:s storleksrekommendationer tar hänsyn till dessa verkliga variabler för att föreslå lämpliga dimensioner för din avsedda användning.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Ett diagram över modulstorlek, utskriftsmått och maximalt effektivt skanningsavstånd',
          caption: 'Avståndsguide för skanning: anpassa modulstorleken till dina installationskrav',
        },
      ],
    },
    {
      heading: 'Använder ANQR säkerhetsläge',
      paragraphs: ['ANQR:s säkerhetsläge ger feedback i realtid om skanningens tillförlitlighet. Den övervakar kontrastförhållanden, tyst zonkompatibilitet, överlagringsintensitet och andra faktorer som påverkar skanningsbarheten. När någon parameter närmar sig riskabla nivåer kommer du att se varningar med specifik vägledning om hur man kan förbättra tillförlitligheten. För professionella installationer där fel är kostsamt, håll Säkerhetsläget aktivt under hela designprocessen.', 'Säkerhetsläge inkluderar också en skanningsverifieringsfunktion som försöker avkoda din genererade kod och rapporterar framgång eller misslyckande. Även om denna verifiering i appen inte kan replikera alla verkliga tillstånd, fångar den många vanliga problem innan du investerar i utskrift eller distribution. Behandla framgångsrik verifiering som ett minimikrav, inte en garanti - tester i verkligheten är fortfarande viktiga.'],
    },
    {
      heading: 'Testprotokoll i verkliga världen',
      paragraphs: ['Ingen mängd programverifiering ersätter fysisk testning. Skriv ut din kod i avsedd storlek på representativt material. Testa den i den faktiska implementeringsmiljön med ljusförhållanden som matchar verklig användning. Skanna med flera enheter – inte bara din flaggskeppstelefon, utan budgetbaserade Android-enheter, äldre iPhones och alla specifika enheter som din publik ofta använder.', 'Dokumentera dina tester systematiskt. Registrera vilka enheter som testades, under vilka förhållanden, med vilka resultat. Om du distribuerar koder i stor skala, upprätta acceptanskriterier: kanske 95 % framgångsfrekvens för din enhetstestpool, eller framgångsrika skanningar inom 2 sekunder på alla testade enheter. Dessa standarder hjälper till att göra go/no-go-beslut objektiva snarare än att hoppas på det bästa.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'En omfattande checklista för testning som täcker enheter, villkor och acceptanskriterier',
          caption: 'Testprotokoll för QR-distribution: systematisk verifiering före produktionsåtagande',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Se QR-exempel',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Se QR-exempel', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Öppna hela användarhandboken', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Öppna galleriet', type: 'gallery' },
  ],
};
