import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR-exempel',
  description: 'Fem verkliga, produktionsliknande exempel som visar var QR-koder skapar mätbart värde: upplyftande av en äldre detaljhandelsräknekod, varumärkesbetalningar och "skanna-till"-åtgärder, tryckskalning från flygblad till skyltar, animerad QR för digital skyltning och tvärspråkigt samarbete med delbara ankarlänkar. Varje exempel innehåller bilder, praktiska begränsningar och en remixlänk tillbaka till generatorn.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Öppna generatorn', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Bläddra Lär artiklar', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Öppna hela användarhandboken', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Fallstudie: Retail Counter QR Uplift',
      paragraphs: ['Detta verkliga exempel följer ett litet kafé som hade använt samma QR-kod på sin disk i tre år. Den ursprungliga koden genererades snabbt under pandemirushen, trycktes på standardpapper och halkade in i ett plastställ. Det fungerade fortfarande - tekniskt - men kunderna behövde ofta flera försök att skanna det, och det gjorde ingenting för att förstärka caféets noggrant utformade varumärkesidentitet.', 'Förvandlingen började med en enkel granskning: den befintliga koden kodade caféets webbadress för meny, som de ville behålla. Utmaningen var att få QR:n att kännas som en del av caféupplevelsen snarare än ett eftertanke från 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'En väderbiten QR-kod i ett plastställ som visar synligt slitage, fingeravtryck och blekta tryck',
          caption: 'Utgångspunkten: tre års diskservice hade gjort att den ursprungliga QR-koden knappt fungerade',
        },
      ],
    },
    {
      heading: 'Diagnostisera originalkodens problem',
      paragraphs: ['Testning avslöjade flera problem: den ursprungliga koden använde Error Correction L (minsta redundans), hade en tyst zon på endast 2 moduler och skrevs ut med låg upplösning. Under caféets varma volframbelysning kontrasterade de redan blekta svarta modulerna knappt mot det gulnade pappret. Äldre telefoner kämpade; nyare telefoner lyckades men med märkbar fördröjning.', 'Utöver tekniska problem kommunicerade den generiska svart-vita kvadraten ingenting om varumärket. Kunderna tvekade innan de skannade – en subtil förtroendebarriär som minskade engagemanget med caféets noggrant designade digitala meny.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'En diagnostisk överlagring som visar den ursprungliga QR:s tekniska brister: låg ECC, minimal tyst zon, dålig kontrast',
          caption: 'Teknisk analys som avslöjar varför den äldre koden underpresterade under verkliga förhållanden',
        },
      ],
    },
    {
      heading: 'Upplyftsprocessen',
      paragraphs: ['Med hjälp av ANQR återskapade caféägaren koden med identisk meny-URL men dramatiskt förbättrade inställningar: Felkorrigering H för maximal motståndskraft, en tyst zon med 6 moduler för tillförlitlig gränsdetektering och märkesfärger (djupa vinröda moduler på krämfärgad bakgrund) som matchade caféets interiörpalett.', 'Ett litet mittöverlägg med caféets logotyp lades till - hölls medvetet subtilt för att bibehålla skanningsbarheten samtidigt som det ger omedelbar varumärkesigenkänning. Säkerhetsläge bekräftade att den nya designen skannades tillförlitligt över testenheter innan någon utskrift.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR-gränssnittet som visar konfigurationen: märkesfärger, lämplig ECC, generös tyst zon, subtil logotypöverlagring',
          caption: 'Bygga den uppgraderade konfigurationen: varje inställning vald för att balansera varumärkesuttryck med skanningspålitlighet',
        },
      ],
    },
    {
      heading: 'Mätbara resultat',
      paragraphs: ['Efter att ha implementerat den nya QR på professionellt mattlaminerat kartong spårade caféet resultat under fyra veckor. Framgångsfrekvensen för skanningen förbättrades från uppskattningsvis 70 % till nästan 100 %. Den genomsnittliga skanningstiden sjönk från 3-4 sekunder till under 1 sekund. Det viktigaste var att menyengagemang ökade med 40 % - kunder som tidigare tittade på QR:en och gav upp skannade nu med tillförsikt.', 'Personalen rapporterade färre kundfrågor om hur man använder QR:n och inga fler fall av manuell inmatning av URL:en för frustrerade kunder. Märkesutseendet väckte också konversationer, med kunder som kommenterade positivt om den sammanhållna designen.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'En jämförelse före/efter med mätvärden: sökningsframgångsfrekvens, genomsnittlig sökningstid och förbättringar av antalet sökningar per vecka',
          caption: 'Fyra veckors data som visar den mätbara effekten av en genomtänkt QR-höjning',
        },
      ],
    },
    {
      heading: 'Återskapa denna konfiguration',
      paragraphs: ['Kaféets konfiguration visar konservativt men effektivt varumärke: Error Correction H, 6-moduls tyst zon, högkontrast märkesfärger och en minimal mittöverlägg. Denna balans fungerar för de flesta butiksdisktillämpningar där tillförlitlighet måste komma i första hand men varumärkesnärvaro fortfarande spelar roll.', 'Öppna generatorn med dessa inställningar förinstallerade och anpassa färgerna och överlägget till ditt eget varumärke. Nyckelinsikten: enbart tillförlitlighetsförbättringar kan dramatiskt öka engagemanget, även innan du lägger till någon visuell stil.', 'Se den relaterade Learn-guiden för att förbättra befintliga QR-kampanjer för hela metoden bakom detta tillvägagångssätt.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Länk till generatorn förkonfigurerad med caféets inställningar för omedelbar anpassning',
          caption: 'Börja med en beprövad konfiguration och anpassa efter ditt varumärke',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Bläddra Lär artiklar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Fallstudie: Multi-Payment Counter Display',
      paragraphs: ['Det här exemplet följer en klädbutik i boutiquestil som hade samlat fem olika QR-koder i sitt register: bankbetalning, tips, Instagram, recensioner från Google och en anställningslänk. Var och en genererades från en annan källa, trycktes vid olika tidpunkter och visades i felaktiga montrar. Det visuella kaoset undergrävde butikens noggrant kurerade estetik, och personalen hanterade regelbundet kunder som skannar fel kod.', 'Lösningen krävde separata bekymmer: betalningskoder behövde maximal tillförlitlighet med konservativ stil, medan marknadsföringskoder kunde vara mer uttrycksfulla. Det enhetliga displaysystemet som uppstod visar hur man balanserar varumärkesnärvaro mot de funktionella kraven från olika QR-användningsfall.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Ett rörigt registerområde som visar fem felaktiga QR-koder i olika stativ och tryckt material',
          caption: 'Den kaotiska utgångspunkten: fem bortkopplade QR-koder som tävlar om uppmärksamheten och orsakar kundförvirring',
        },
      ],
    },
    {
      heading: 'Prioritera betalningsupplevelsen',
      paragraphs: ['Butikens primära betalningsmetod använde en regional standard som krävde strikt efterlevnad av nyttolast. Tester visade att även mindre styling påverkade skanningshastigheten med vissa bankappar. Beslutet: behåll QR-betalningen helt oförändrad förutom storleksoptimering och professionellt tryck på matt kartong.', 'Detta konservativa tillvägagångssätt innebar att betalningskoden såg mindre "märkt" ut än idealisk, men transaktionsgenomförandet förbättrades dramatiskt. Insikten: betalningsmoment är inte varumärkesmöjligheter – de är pålitlighetsmoment. Kunder uppskattar snabbhet och säkerhet över estetik när pengar är inblandade.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'En ren, stor QR-kod för betalning på professionellt matt kartong, placerad väl vid registret',
          caption: 'Betalningen QR: generöst storlek, professionellt tryckt, konservativt utformad för omedelbar igenkänning av bankappar',
        },
      ],
    },
    {
      heading: 'Skapar den sekundära åtgärdsskärmen',
      paragraphs: ['För tips, recensioner, sociala medier och anställning kan butiken vara mer uttrycksfull. Dessa koder återskapades i ANQR med konsekvent varumärkesstyling: butikens signatur olivgrön på kräm, rundad modulstil och ett subtilt mittöverlägg med butikens ikon. Felkorrigering H säkerställde tillförlitlighet även med stylingen.', 'Dessa fyra koder var arrangerade i en märkespanel placerad bredvid (inte konkurrerar med) betalningskoden. Tydliga etiketter i butikens typografi förklarade varje kods syfte. Den visuella hierarkin var avsiktlig: betalningen stod ensam och framträdande; sekundära åtgärder grupperade som alternativ.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'En varumärkespanel som visar fyra stiliserade QR-koder för tips, recensioner, sociala medier och anställning, med tydliga etiketter',
          caption: 'The secondary action panel: consistent branding, clear labelling, positioned as options rather than distractions',
        },
      ],
    },
    {
      heading: 'Displaysystemdesign',
      paragraphs: ['Den fysiska displayen löste flera problem samtidigt. Både betalningsstället och den sekundära panelen använde matta material för att eliminera bländning från takbelysning. Höjderna optimerades för kunder av varierande storlek. Vinklar riktade mot kundkön snarare än platt mot disken.', 'Kritiskt nog skapade butiken reservutskrifter från låsta ANQR-konfigurationslänkar. När tipskoden så småningom blev kaffestänkt ersatte personalen den inom några minuter med den lagrade konfigurationen - inga skärmdumpar, inga gissningar på inställningar, ingen kvalitetsförsämring.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Ett diagram som visar den fysiska displaylayouten: höjder, vinklar, material och förhållandet mellan betalning och sekundära displayer',
          caption: 'Displaysystemritning: fysisk ergonomi optimerad för tillförlitlig skanning över kundhöjder och ljusförhållanden',
        },
      ],
    },
    {
      heading: 'Operativa förbättringar',
      paragraphs: ['Sex veckor efter implementeringen dokumenterade butiken betydande förbättringar: noll kundklagomål om förvirring av "fel kod", snabbare transaktionstider och en trefaldig ökning av tipsinlämningar (kunder kunde nu hitta och skanna tipskoden utan att fråga personalen obekvämt). Googles recensioner ökade också i takt med att den dedikerade, välmärkta QR tog bort friktionen.', 'Personalutbildningen blev enklare: "betalningskoden är den stora, allt annat finns på panelen." När betalningsappar uppdaterades och en kort visade långsammare skanning, innebar den konservativa betalningskoddesignen att den fortfarande fungerade - bara marginellt långsammare snarare än att misslyckas helt.', 'Se Learn-guiden om QR-koder för detaljhandelsbetalningar för principerna bakom denna displaysystemdesign.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'En mätinstrumentpanel som visar före/efter jämförelser: förvirringstillbud, transaktionstid, tipsfrekvens, granskningsinlämningar',
          caption: 'Sex veckors driftsdata som visar affärseffekten av ett genomtänkt multi-QR-displaysystem',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Bläddra Lär artiklar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Fallstudie: Från visitkort till anslagstavla',
      paragraphs: ['Det här exemplet följer ett produktionsbolag för evenemang som förbereder sig för en stor konferens. De behövde samma QR-kod – länkad till evenemangsappen – utplacerad i radikalt olika format: deltagaremärken (3 cm), bordstältkort (8 cm), registreringsskrivbordsskyltar (30 cm), vägvisande affischer (60 cm) och en massiv scenbakgrundsbanner (4 meter). Varje format hade olika visningsavstånd, ljusförhållanden och produktionsarbetsflöden.', 'Utmaningen var inte bara teknisk – den var operativ. Flera leverantörer hanterade olika utskriftsjobb och företaget behövde säkerställa konsekventa, skanningsbara resultat oavsett vem som producerade vad. Deras lösning fokuserade på SVG-export och rigorös handoff-dokumentation.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Ett collage som visar samma QR-kod distribuerad i fem olika storlekar, från märke till banner',
          caption: 'En QR-kod, fem implementeringsstorlekar: utmaningen att bibehålla skanningsbarhet från centimeter till meter',
        },
      ],
    },
    {
      heading: 'Varför tidigare evenemang hade problem',
      paragraphs: ['Vid sin senaste konferens hade företaget upplevt pinsamma misslyckanden. Scenbannern QR genererades som en liten PNG och skalades upp i designprogramvara - resultatet såg acceptabelt ut på avstånd men kunde inte skanna tillförlitligt från publiken. Märkets QR:er var överstilade och för små, frustrerande deltagare som försökte lägga till kontakter. Inkonsekventa inställningar i olika format innebar att "samma" QR faktiskt såg olika ut på varje del.', 'Analys efter händelsen avslöjade grundorsaken: ingen enskild källa till sanning. Varje designer hade återskapat QR:en med lite olika inställningar, och varje trycksaksleverantör hade bearbetat filer på olika sätt. Kvaliteten försämrades genom telefonspelet med filöverlämningar.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Close-up photographs showing scanning failures: pixelated banner modules, undersized badge codes, inconsistent styling across formats',
          caption: 'Forensisk analys av tidigare händelsefel: varje format hade introducerat olika kvalitetsproblem',
        },
      ],
    },
    {
      heading: 'SVG-First Workflow',
      paragraphs: ['För detta evenemang etablerade företaget ett strikt protokoll: en master QR genererad i ANQR med optimala inställningar (felkorrigering H, generös tyst zon, ren stil), exporteras som SVG och lagras som den enda auktoritativa källan. ANQR-konfigurationslänken dokumenterades tillsammans med SVG-filen så att koden kunde återskapas vid behov.', 'Varje designer och leverantör fick samma SVG-master med tydliga instruktioner: placera i önskad storlek, modifiera inte, bibehåll frigång till tyst zon. För leverantörer som kräver rasterformat tillhandahöll företaget förrenderade PNG-filer i specifika storlekar med tydliga namnkonventioner som indikerar avsedd användning.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Ett filpaket som visar SVG-mastern, storleksspecifika PNG:er, specifikationsdokument och konfigurationslänk',
          caption: 'Handoff-paketet: allt leverantörer behövde för att producera konsekventa resultat utan att gissa',
        },
      ],
    },
    {
      heading: 'Storleksspecifika överväganden',
      paragraphs: ['Varje format krävde särskild uppmärksamhet. Badge-insatser på 3 cm behövde QR för att uppta maximalt tillgängligt utrymme - skanningsavståndet skulle vara armlängds avstånd. Bordstält på 8 cm kan inkludera dekorativ inramning utanför den tysta zonen. 4-metersbannern krävde beräkning: från typiskt publikavstånd (15-20 meter) behövde moduler vara tydligt urskiljbara med telefonkameror, vilket innebar att QR-en behövde vara minst 80 cm inom bannerdesignen.', 'Företaget skapade en storleksguide som dokumenterar lägsta QR-mått för varje förväntat skanningsavstånd. Detta blev en återanvändbar tillgång för framtida evenemang, vilket tog bort gissningar från designprocessen.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Ett diagram som visar förhållandet mellan skanningsavstånd, lägsta QR-storlek och moduldimensioner för varje händelseformat',
          caption: 'The sizing matrix: calculated dimensions ensuring reliable scanning at each format\'s expected viewing distance',
        },
      ],
    },
    {
      heading: 'Production Results',
      paragraphs: ['Konferensdagens validering var systematisk: personalen testade varje utplacerad QR innan dörrarna öppnades. Märkets insatser skannas omedelbart på armlängds avstånd. Bordstält fungerade tillförlitligt i den variabla belysningen av grupprum. Scenbannern – det förra evenemangets pinsamhet – skannades framgångsrikt från mitten av publikområdet.', 'Zero scanning complaints were logged across 2,000+ attendees. Den operativa vinsten var lika betydande: när ett sponsortillskott i sista minuten krävde ny skyltning, genererade produktionsteamet det från huvud-SVG på några minuter, övertygade om att det skulle matcha allt annat.', 'Se Learn-guiden om utskriftsklara QR-koder för beslutsramverket SVG vs PNG och bästa praxis för handoff.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Eventfotografering som visar deltagare som framgångsrikt skannar QR-koder i olika storlekar och avstånd över hela lokalen',
          caption: 'Konferensdagens framgång: tillförlitlig skanning i alla format, från märkenärbilder till scenbilder på avstånd',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Bläddra Lär artiklar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Fallstudie: Airport Lounge Digital Display',
      paragraphs: ['Det här exemplet följer en flygbolagslounge som hade använt statiska QR-koder på sina digitala välkomstskärmar. Skärmarna visade roterande reklaminnehåll, men QR-koden för loungeincheckning satt i ett hörn, statisk och lätt förbisedd. Analytics visade att endast 15 % av de kvalificerade gästerna använde QR-incheckningen trots att den var snabbare än skrivbordskön. De flesta gäster märkte det helt enkelt inte.', 'Hypotesen var enkel: i en visuellt hektisk miljö med rörligt innehåll blir en statisk QR osynlig. Lösningen som behövdes för att göra QR:n märkbar utan att kompromissa med tillförlitligheten som krävs för ett incheckningsflöde där ett misslyckande skulle innebära frustrerade resenärer och längre skrivbordsköer.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'En digital display i en flygplatslounge som visar reklaminnehåll med en liten statisk QR-kod i hörnet',
          caption: 'Den ursprungliga inställningen: en statisk QR förlorad i ett hav av dynamiskt reklaminnehåll, som endast uppnår 15 % adoption',
        },
      ],
    },
    {
      heading: 'Designa säker animering',
      paragraphs: ['Loungens digitala skyltning använde stora LED-paneler – en utmanande miljö där aggressiv animering kunde skapa skanningsproblem. Designteamet började konservativt: en mild pulseffekt som subtilt utökade och drog ihop QR:s visuella närvaro utan att ändra den faktiska kodstrukturen. Frame timing var långsam (250ms) för att undvika flimmerproblem med LED-uppdateringsfrekvensen.', 'Safety Mode validation confirmed every frame remained scannable. Ytterligare tester på de faktiska LED-panelerna avslöjade att pulsen behövde vara ännu mer subtil än förhandsvisningar på skrivbordet föreslog - LED-ljusstyrka och betraktningsvinklar påverkade den upplevda kontrasten mer än förväntat.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR-animationsinställningspanelen som visar pulskonfiguration: långsam timing, subtil intensitet, säkerhetsläge aktiverat',
          caption: 'Animationskonfiguration: parametrar inställda för LED-paneldisplay samtidigt som skanningens tillförlitlighet bibehålls i varje bildruta',
        },
      ],
    },
    {
      heading: 'Integration med Signage Content',
      paragraphs: ['Den animerade QR:en placerades i en dedikerad "stabil zon" i skärmlayouten - ett område som förblev konstant medan reklaminnehåll roterade i huvudvisningsområdet. Denna separation var avgörande: QR:n behövde visuell stabilitet för att skanna även när den väckte uppmärksamhet genom sin subtila animering.', 'En tydlig uppmaning lades till bredvid QR:en: "Hoppa över kön - skanna för att checka in." Texten förblev statisk medan QR:en pulserade, vilket skapade en visuell hierarki som drog blickarna till skanningsmöjligheten utan att överväldiga det reklaminnehållet.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Ett skärmlayoutdiagram som visar den animerade QR-koden i en stabil zon medan reklaminnehåll roterar i huvudområdet',
          caption: 'Skärmfastighetstilldelning: den animerade QR-enheten upptar en stabil zon skild från roterande reklaminnehåll',
        },
      ],
    },
    {
      heading: 'Teknisk distribution',
      paragraphs: ['Den animerade QR-koden exporterades som en GIF med optimerade inställningar för skylt-CMS. Filstorleksöverväganden spelade roll - loungens innehållshanteringssystem hade uppladdningsgränser, och alltför stora filer orsakade uppspelningsstamning. Den slutliga exporten balanserade visuell kvalitet mot filstorlek genom att begränsa färgpaletten och optimera bildruteantalet.', 'Implementeringen inkluderade en reserv: om GIF misslyckades med att spela av någon anledning, skulle skyltsystemet visa en statisk PNG-säkerhetskopia. Denna redundans säkerställde att incheckningsförmågan aldrig gick förlorad på grund av tekniska problem med animeringen.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Ett CMS-gränssnitt som visar den animerade QR-uppladdningen med statisk reservbild konfigurerad',
          caption: 'Signage CMS-konfiguration: animerad primär med statisk reserv som säkerställer att incheckningsförmågan aldrig avbryts',
        },
      ],
    },
    {
      heading: 'Uppmätt påverkan',
      paragraphs: ['Efter en månads drift ökade användningen av QR-incheckning från 15 % till 24 % – en relativ förbättring på 60 %. Gästfeedback-undersökningar visade att den animerade QR-koden var "lättare att lägga märke till" och "känndes mer modern". Kötiderna på skrivbordet minskade mätbart under högsäsong då fler gäster betjänade sig själv via QR.', 'Viktigt är att noll skanningsfel rapporterades trots tusentals dagliga skanningar. Det konservativa animationssättet hade uppnått uppmärksamhetsmålet utan att offra den tillförlitlighet som ett incheckningsflöde krävde. Loungen rullade därefter ut liknande animerade QR:er till sina andra platser.', 'Se Learn-guiden om animerade QR-koder för digital skyltning för de tekniska principerna bakom säker animationsdesign.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'En instrumentpanel som visar ökad användningsfrekvens, minskning av kötiden och tillförlitlighet med nollfelssökning under implementeringsperioden',
          caption: 'En månads data: 60 % ökad användning, minskade kötider och bibehållen perfekt skanningstillförlitlighet',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Bläddra Lär artiklar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Fallstudie: Global produktlansering QR-kampanj',
      paragraphs: ['Detta exempel följer ett hemelektronikföretag som lanserar en ny produkt samtidigt på 12 marknader på 8 språk. Varje regionalt marknadsföringsteam behövde producera förpackningar, detaljhandelsdisplayer och reklammaterial med QR-koder som länkar till lokaliserade produktsidor. Tidigare lanseringar hade resulterat i inkonsekvent QR-stil, enstaka skanningsfel och ett "telefonspel" med konfigurationsdrift när varje lag återskapade koder från skärmdumpar.', 'Lösningen utnyttjade ANQR:s delbara konfigurationslänkar för att etablera en enda källa till sanning som varje regionalt team kunde komma åt, oavsett deras gränssnittsspråk. QR-nyttolasten använde en smart omdirigering som upptäckte användarspråk, så en kod fungerade globalt samtidigt som den levererade lokaliserade upplevelser.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'En världskarta som visar 12 marknadsplatser med QR-koder, några visuellt inkonsekventa med varandra',
          caption: 'Utmaningen: 12 marknader, 8 språk och en historia av inkonsekventa QR-implementeringar över regioner',
        },
      ],
    },
    {
      heading: 'Etablera huvudkonfigurationen',
      paragraphs: ['Det globala varumärkesteamet skapade den auktoritativa QR-konfigurationen i ANQR: märkesfärger som matchar produktlinjens visuella identitet, Error Correction H för tillförlitlighet i alla tryckta och digitala applikationer och styling som skulle reproduceras konsekvent oavsett lokala produktionsmetoder. Konfigurationen låstes och delningslänken dokumenterades i den globala kampanjrapporten.', 'Kritiskt sett använde den kodade URL:en en språkdetekterande omdirigeringstjänst. När de skannades omdirigerades användarna automatiskt till sin produktsida på det lokala språket. Detta innebar att alla 12 marknader kunde använda identiska QR-koder - inga nyttolastvariationer per marknad som kunde skapa fel.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR-gränssnittet som visar huvudkonfigurationen med varumärkesfärger, ECC H och den smarta omdirigeringsadressen',
          caption: 'Huvudkonfigurationen: globala varumärkesstandarder kodade till en enda, delbar sanningskälla',
        },
      ],
    },
    {
      heading: 'Regionalt arbetsflöde',
      paragraphs: ['Varje regionalt marknadsföringsteam fick konfigurationslänken med enkla instruktioner: öppna länken, kontrollera att förhandsgranskningen stämmer överens med varumärkets riktlinjer, exportera i det format som krävs för din applikation. ANQR-gränssnittet visades på varje teams föredragna språk, men de underliggande QR-inställningarna förblev identiska oavsett gränssnittsspråk.', 'När det japanska teamet behövde SVG för avancerade detaljhandelsskärmar och det brasilianska teamet behövde PNG för sociala medier, exporterade båda från samma konfiguration. När det tyska lagets tryckerileverantör begärde specifika färgvärden kunde de referera till konfigurationen direkt istället för att gissa från en skärmdump.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Skärmdumpar som visar samma konfigurationslänk öppnade i japanska, portugisiska och tyska gränssnitt',
          caption: 'Samma konfiguration, olika gränssnitt: regionala team arbetar på sitt föredragna språk samtidigt som de bibehåller global konsistens',
        },
      ],
    },
    {
      heading: 'Hantering av regionala variationer',
      paragraphs: ['Vissa marknader krävde mindre anpassningar. Det kinesiska teamet behövde en version med en WeChat-optimerad ram för social delning. Istället för att modifiera mastern skapade de en dokumenterad variant med en egen konfigurationslänk, tydligt märkt som "CN-WeChat-variant" i kampanjtillgångsbiblioteket. Detta bibehöll spårbarheten samtidigt som nödvändig lokalisering möjliggjordes.', 'Varumärkesteamet fastställde en enkel regel: varje variation från master krävde en ny, dokumenterad konfigurationslänk. Inga ändringar av exporterade filer, inga "snabbfixar" i designprogramvara. Detta förhindrade konfigurationsdriften som hade plågat tidigare lanseringar.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Ett gränssnitt för tillgångsbibliotek som visar huvudkonfigurationen och godkända regionala varianter, var och en med sin egen länk',
          caption: 'Campaign asset governance: master configuration plus documented variants, all traceable via configuration links',
        },
      ],
    },
    {
      heading: 'Startresultat',
      paragraphs: ['På produktlanseringsdagen distribuerades QR-koder över förpackningar, återförsäljare, evenemangsmaterial och digitala kampanjer på alla 12 marknader samtidigt. Kvalitetsrevisioner bekräftade visuell överensstämmelse mellan regioner - QR-koden på Tokyo-butiksskärmarna matchade QR-koden på São Paulo-förpackningen och QR-koden på Berlin-evenemangsbanner.', 'Noll skanningsfel rapporterades på marknaderna. När en webbadress för produktsidan efter lanseringen behövdes, hanterade omdirigeringstjänsten det osynligt - ingen ny utskrift krävs. Det globala teamet uppskattade att konfigurationslänkmetoden sparade 40+ timmars koordinationstid jämfört med deras tidigare lanseringsmetod.', 'Se Learn-guiden om tvärspråkigt QR-samarbete för arbetsflödesprinciperna bakom global kampanjkonsistens.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Ett rutnät med fotografier som visar konsekvent QR-distribution på olika marknader: Tokyo-detaljhandel, São Paulo-förpackningar, Berlin-evenemang',
          caption: 'Global konsekvens uppnådd: identisk QR-presentation på 12 marknader trots olika språk, leverantörer och format',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Öppna generatorn',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Bläddra Lär artiklar',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Bläddra Lär artiklar', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Öppna hela användarhandboken', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Öppna galleriet', type: 'gallery' },
  ],
};
