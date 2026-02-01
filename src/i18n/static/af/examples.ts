import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR voorbeelde',
  description: 'Vyf werklike, produksiestyl-voorbeelde wat wys waar QR-kodes meetbare waarde skep: die opheffing van \'n erfenis-kleinhandeltoonbankkode, handelsmerk-kleinhandelbetalings en "scan-to"-aksies, drukskaal van strooibiljette na advertensieborde, geanimeerde QR vir digitale naamborde, en kruistalige samewerking deur gebruik te maak van deelbare Anchor-skakels. Elke voorbeeld bevat beelde, praktiese beperkings en \'n hermengskakel terug na die kragopwekker.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Maak die kragopwekker oop', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Blaai deur Leer artikels', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Maak die volledige gebruikersgids oop', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Gevallestudie: Kleinhandel-toonbank QR-opheffing',
      paragraphs: ['Hierdie werklike voorbeeld volg op \'n klein kafee wat vir drie jaar dieselfde QR-kode op hul toonbank gebruik het. Die oorspronklike kode is vinnig tydens die pandemiese stormloop gegenereer, op standaardpapier gedruk en in \'n plastiekstaander gegly. Dit het steeds gewerk – tegnies – maar klante het dikwels veelvuldige pogings nodig gehad om dit te skandeer, en dit het niks gedoen om die kafee se sorgvuldig vervaardigde handelsmerkidentiteit te versterk nie.', 'Die transformasie het begin met \'n eenvoudige oudit: die bestaande kode het die kafee se aanlyn spyskaart-URL geënkodeer, wat hulle wou behou. Die uitdaging was om die QR soos deel van die kafee-ervaring te laat voel eerder as \'n nagedagte-hulpmiddel vanaf 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: '\'n Verweerde QR-kode in \'n plastiekstaander wat sigbare slytasie, vingerafdrukke en verbleikte drukwerk toon',
          caption: 'Die beginpunt: drie jaar se toonbankdiens het die oorspronklike QR skaars funksioneel gelaat',
        },
      ],
    },
    {
      heading: 'Diagnose van die oorspronklike kode se probleme',
      paragraphs: ['Toetsing het verskeie kwessies aan die lig gebring: die oorspronklike kode wat Foutkorreksie L (minimum oortolligheid) gebruik het, het \'n stil sone van slegs 2 modules gehad en is teen lae resolusie gedruk. Onder die kafee se warm wolframbeligting het die reeds verbleikte swart modules skaars gekontrasteer teen die vergeelde papier. Ouer telefone het gesukkel; nuwer fone het daarin geslaag, maar met merkbare vertraging.', 'Behalwe vir tegniese probleme, het die generiese swart-en-wit vierkant niks oor die handelsmerk gekommunikeer nie. Kliënte het gehuiwer voordat hulle geskandeer het - \'n subtiele vertrouehindernis wat die betrokkenheid by die kafee se noukeurig ontwerpte digitale spyskaart verminder het.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: '\'n Diagnostiese oorleg wat die oorspronklike QR se tegniese tekortkominge toon: lae ECC, minimale stil sone, swak kontras',
          caption: 'Tegniese ontleding wat onthul waarom die nalatenskapkode in werklike toestande onderpresteer het',
        },
      ],
    },
    {
      heading: 'Die Opheffingsproses',
      paragraphs: ['Deur ANQR te gebruik, het die kafee-eienaar die kode herskep met die identiese spyskaart-URL, maar die instellings dramaties verbeter: Foutkorreksie H vir maksimum veerkragtigheid, \'n 6-module stil sone vir betroubare grensbespeuring, en handelsmerkkleure (diep wynrooi modules op room agtergrond) wat by die kafee se binnepalet pas.', '\'n Klein middelste oorleg met die kafee se logo is bygevoeg - doelbewus subtiel gehou om skandeerbaarheid te handhaaf terwyl dit onmiddellike handelsmerkherkenning verskaf. Veiligheidsmodus het bevestig dat die nuwe ontwerp betroubaar oor toetstoestelle geskandeer is voor enige drukwerk.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Die ANQR-koppelvlak wat die konfigurasie wys: handelsmerkkleure, toepaslike ECC, ruim stil sone, subtiele logo-oorleg',
          caption: 'Bou die opgegradeerde konfigurasie: elke instelling wat gekies word om handelsmerkuitdrukking met skanderingsbetroubaarheid te balanseer',
        },
      ],
    },
    {
      heading: 'Meetbare resultate',
      paragraphs: ['Nadat die nuwe QR op professionele mat-gelamineerde kaartvoorraad ontplooi is, het die kafee resultate oor vier weke gevolg. Skandering sukseskoers het verbeter van \'n geskatte 70% tot byna 100%. Gemiddelde skanderingstyd het van 3-4 sekondes tot minder as 1 sekonde gedaal. Die belangrikste is dat spyskaartbetrokkenheid met 40% toegeneem het - kliënte wat voorheen na die QR gekyk het en opgegee het, het nou met selfvertroue geskandeer.', 'Personeel het minder kliëntevrae oor \'hoe om die QR te gebruik\' gerapporteer en geen gevalle meer van die handmatige intik van die URL vir gefrustreerde kliënte nie. Die handelsmerkvoorkoms het ook gesprekke laat ontstaan, met kliënte wat positief oor die samehangende ontwerp kommentaar gelewer het.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: '\'n Voor/na-vergelyking met maatstawwe: skanderingsukseskoers, gemiddelde skanderingstyd en weeklikse skanderingtellingverbeterings',
          caption: 'Vier weke se data wat die meetbare impak van \'n deurdagte QR-opheffing toon',
        },
      ],
    },
    {
      heading: 'Herskep hierdie konfigurasie',
      paragraphs: ['Die kafee se konfigurasie demonstreer konserwatiewe maar effektiewe handelsmerk: Foutkorreksie H, 6-module stil sone, hoë-kontras handelsmerkkleure en \'n minimale middel-oorleg. Hierdie balans werk vir die meeste kleinhandeltoonbanktoepassings waar betroubaarheid eerste moet kom, maar handelsmerkteenwoordigheid steeds saak maak.', 'Maak die kragopwekker oop met hierdie instellings vooraf gelaai en pas die kleure en oorleg by jou eie handelsmerk aan. Die sleutelinsig: betroubaarheidverbeterings alleen kan betrokkenheid dramaties verhoog, selfs voordat enige visuele stilering bygevoeg word.', 'Bekyk die verwante Leer-gids oor die verbetering van bestaande QR-veldtogte vir die volledige metodologie agter hierdie benadering.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Skakel na die kragopwekker wat vooraf opgestel is met die kafee se instellings vir onmiddellike aanpassing',
          caption: 'Begin met \'n bewese opset en pasmaak vir jou handelsmerk',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Blaai deur Leer artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Gevallestudie: Multi-betaling toonbank vertoon',
      paragraphs: ['Hierdie voorbeeld volg \'n boetiekklerewinkel wat vyf verskillende QR-kodes by hul register opgehoop het: bankbetaling, wenke, Instagram, Google-resensies en \'n huurskakel. Elkeen is uit \'n ander bron gegenereer, op verskillende tye gedruk en in ongelyke staanplekke vertoon. Die visuele chaos het die winkel se noukeurig saamgestelde estetika ondermyn, en personeel het gereeld te doen gehad met klante wat die verkeerde kode skandeer.', 'Die oplossing het skeidingskwessies vereis: betalingskodes het maksimum betroubaarheid met konserwatiewe stilering nodig gehad, terwyl bemarkingskodes meer ekspressief kon wees. Die verenigde vertoonstelsel wat na vore gekom het, demonstreer hoe om handelsmerkteenwoordigheid te balanseer teen die funksionele eise van verskillende QR-gebruiksgevalle.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: '\'n Deurmekaar registerarea wat vyf verkeerde QR-kodes in verskeie staanplekke en gedrukte materiaal toon',
          caption: 'Die chaotiese beginpunt: vyf ontkoppelde QR-kodes wat meeding om aandag en verwarring by kliënte veroorsaak',
        },
      ],
    },
    {
      heading: 'Prioritisering van die betalingservaring',
      paragraphs: ['Die winkel se primêre betaalmetode het \'n streekstandaard gebruik wat streng nakoming van loonvrag vereis het. Toetse het aan die lig gebring dat selfs geringe stilering skandeerspoed met sekere banktoepassings beïnvloed het. Die besluit: hou die betaling QR heeltemal ongewysig, behalwe vir grootteoptimalisering en professionele drukwerk op mat kaartvoorraad.', 'Hierdie konserwatiewe benadering het beteken dat die betalingskode minder \'gebrandmerk\' as ideaal gelyk het, maar die transaksievoltooiingskoerse het dramaties verbeter. Die insig: betaalmomente is nie handelsmerkgeleenthede nie – dit is betroubaarheidsmomente. Kliënte waardeer spoed en sekerheid oor estetika wanneer geld betrokke is.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: '\'n Skoon, groot betalings QR-kode op professionele mat kaartvoorraad, prominent by die register geposisioneer',
          caption: 'Die betaling QR: ruim grootte, professioneel gedruk, konserwatief gestileer vir onmiddellike herkenning deur banktoepassings',
        },
      ],
    },
    {
      heading: 'Die skep van die sekondêre aksievertoning',
      paragraphs: ['Vir wenke, resensies, sosiale en huur, kan die winkel meer ekspressief wees. Hierdie kodes is in ANQR herskep met konsekwente handelsmerkstilering: die winkel se kenmerkende olyfgroen op room, afgeronde modulestyl en \'n subtiele middelste oortreksel met die winkel se ikoon. Foutkorreksie H het betroubaarheid verseker, selfs met die stilering.', 'Hierdie vier kodes is gerangskik in \'n handelsmerkpaneel wat langs die betaalkode geplaas is (nie meeding nie). Duidelike etikette in die winkel se tipografie het elke kode se doel verduidelik. Die visuele hiërargie was opsetlik: betaling het alleen en prominent gestaan; sekondêre aksies saam gegroepeer as opsies.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: '\'n Gemerkte paneel wat vier gestileerde QR-kodes wys vir wenke, resensies, sosiaal en huur, met duidelike etikette',
          caption: 'Die sekondêre aksiepaneel: konsekwente handelsmerk, duidelike etikettering, geposisioneer as opsies eerder as afleidings',
        },
      ],
    },
    {
      heading: 'Vertoonstelselontwerp',
      paragraphs: ['Die fisiese vertoning het verskeie probleme gelyktydig opgelos. Beide die betaalstaander en die sekondêre paneel het mat materiaal gebruik om glans van oorhoofse beligting uit te skakel. Hoogtes is geoptimaliseer vir kliënte van verskillende statuur. Hoeke gerig na die klant se tou eerder as plat op die toonbank.', 'Kritiek, die winkel het spaarafdrukke van geslote ANQR-konfigurasieskakels geskep. Toe die wenkekode uiteindelik koffie gespat het, het personeel dit binne minute vervang deur die gestoorde konfigurasie te gebruik - geen skermkiekies, geen raai by instellings, geen kwaliteit agteruitgang.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: '\'n Diagram wat die fisiese vertoonuitleg toon: hoogtes, hoeke, materiale en die verhouding tussen betaling en sekondêre uitstallings',
          caption: 'Vertoonstelselbloudruk: fisiese ergonomie geoptimaliseer vir betroubare skandering oor klanthoogtes en beligtingstoestande',
        },
      ],
    },
    {
      heading: 'Operasionele verbeterings',
      paragraphs: ['Ses weke na ontplooiing het die winkel beduidende verbeterings gedokumenteer: geen klante-klagtes oor \'verkeerde kode\'-verwarring nie, vinniger transaksietye en \'n 3x toename in fooi-voorleggings (kliënte kon nou die wenkkode vind en skandeer sonder om personeel ongemaklik te vra). Google-resensies het ook toegeneem namate die toegewyde, goed-gemerkte QR wrywing verwyder het.', 'Personeelopleiding het eenvoudiger geword: \'betalingskode is die groot een, al die ander is op die paneel.\' Toe betaaltoepassings opgedateer is en een kortliks stadiger skandering gewys het, het die konserwatiewe betalingskode-ontwerp beteken dat dit steeds werk - net effens stadiger eerder as om heeltemal te misluk.', 'Sien die Leer-gids oor QR-kodes vir kleinhandelbetalings vir die beginsels agter hierdie vertoonstelselontwerp.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: '\'n Metrieke-kontroleskerm wat voor/na-vergelykings wys: verwarringsvoorvalle, transaksietyd, frekwensie van fooitjies, hersieningsvoorleggings',
          caption: 'Ses weke se operasionele data wat die besigheidsimpak van \'n deurdagte multi-QR-vertoonstelsel demonstreer',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Blaai deur Leer artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Gevallestudie: Van besigheidskaartjie tot reklamebord',
      paragraphs: ['Hierdie voorbeeld volg op \'n gebeurtenisproduksiemaatskappy wat vir \'n groot konferensie voorberei. Hulle het dieselfde QR-kode nodig gehad – gekoppel aan die geleentheid-app – wat oor radikaal verskillende formate ontplooi is: bywonerskenteken-invoegsels (3 cm), tafeltentkaarte (8 cm), registrasiebordtekens (30 cm), padvindplakkate (60 cm) en \'n massiewe verhoog-agtergrondbanier (4 meter). Elke formaat het verskillende kykafstande, beligtingstoestande en produksiewerkvloei gehad.', 'Die uitdaging was nie net tegnies nie – dit was operasioneel. Verskeie verskaffers het verskillende druktake hanteer, en die maatskappy moes konsekwente, skandeerbare resultate verseker, ongeag wie wat vervaardig het. Hul oplossing het gesentreer op SVG-uitvoer en streng oorhandigingsdokumentasie.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: '\'n Collage wat dieselfde QR-kode wys wat oor vyf verskillende groottes ontplooi is, van kenteken tot banier',
          caption: 'Een QR-kode, vyf ontplooiingsgroottes: die uitdaging om skandeerbaarheid van sentimeter tot meter te handhaaf',
        },
      ],
    },
    {
      heading: 'Waarom vorige gebeurtenisse probleme gehad het',
      paragraphs: ['Op hul laaste konferensie het die maatskappy verleentheid ervaar. Die verhoogbanier QR is as \'n klein PNG gegenereer en opgeskaal in ontwerpsagteware - die resultaat het op \'n afstand aanvaarbaar gelyk, maar kon nie betroubaar vanaf die gehoor skandeer nie. Kenteken-QR\'s was oorstyl en te klein, frustrerende deelnemers wat probeer om kontakte by te voeg. Inkonsekwente instellings oor formate het beteken dat \'dieselfde\' QR eintlik anders op elke stuk gelyk het.', 'Na-gebeurtenis-analise het die oorsaak aan die lig gebring: geen enkele bron van waarheid nie. Elke ontwerper het die QR met effens verskillende instellings herskep, en elke drukverkoper het lêers anders verwerk. Kwaliteit verswak deur die telefoonspel van lêeroorhandigings.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Nabyfoto\'s wat skanderingsfoute wys: gepixeleerde baniermodules, ondermaat kentekenkodes, inkonsekwente stilering oor formate heen',
          caption: 'Forensiese ontleding van vorige gebeurtenis mislukkings: elke formaat het verskillende kwaliteit probleme ingestel',
        },
      ],
    },
    {
      heading: 'Die SVG-First Workflow',
      paragraphs: ['Vir hierdie geleentheid het die maatskappy \'n streng protokol daargestel: een meester QR gegenereer in ANQR met optimale instellings (Foutkorreksie H, ruim stil sone, skoon stilering), uitgevoer as SVG, en gestoor as die enkele gesaghebbende bron. Die ANQR-konfigurasieskakel is langs die SVG-lêer gedokumenteer sodat die kode herskep kon word indien nodig.', 'Elke ontwerper en verkoper het dieselfde SVG-meester ontvang met eksplisiete instruksies: plaas op vereiste grootte, moenie verander nie, handhaaf stil sone-vryhoogte. Vir verskaffers wat rasterformate benodig, het die maatskappy voorafgemaakte PNG\'s van spesifieke groottes voorsien met duidelike naamkonvensies wat beoogde gebruik aandui.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: '\'n Lêerpakket wat die SVG-meester, groottespesifieke PNG\'e, spesifikasiedokument en konfigurasieskakel wys',
          caption: 'Die oorhandigingspakket: alles wat verkopers nodig het om konsekwente resultate te lewer sonder om te raai',
        },
      ],
    },
    {
      heading: 'Grootte-spesifieke oorwegings',
      paragraphs: ['Elke formaat het spesifieke aandag vereis. Kenteken-insetsels op 3 cm het die QR nodig gehad om maksimum beskikbare spasie te beset – skandeerafstand sou armlengte wees. Tafeltente op 8 cm kan dekoratiewe raamwerk buite die stil sone insluit. Die 4-meter-banier vereis berekening: vanaf tipiese gehoorafstand (15-20 meter) moes modules duidelik onderskeibaar wees deur telefoonkameras, wat beteken het dat die QR minstens 80 cm binne die banierontwerp moes wees.', 'Die maatskappy het \'n groottegids geskep wat minimum QR-afmetings vir elke verwagte skandeerafstand dokumenteer. Dit het \'n herbruikbare bate vir toekomstige gebeure geword, wat raaiwerk uit die ontwerpproses verwyder het.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: '\'n Grafiek wat die verhouding tussen skandeerafstand, minimum QR-grootte en module-afmetings vir elke gebeurtenisformaat aantoon',
          caption: 'Die groottematriks: berekende afmetings wat betroubare skandering op elke formaat se verwagte kykafstand verseker',
        },
      ],
    },
    {
      heading: 'Produksie resultate',
      paragraphs: ['Konferensiedag-bekragtiging was sistematies: personeel het elke ontplooide QR getoets voordat deure oopgemaak het. Die kenteken-insetsels word onmiddellik op armlengte geskandeer. Tafeltente het betroubaar gewerk in die veranderlike beligting van wegbreekkamers. Die verhoogbanier – die vorige geleentheid se verleentheid – het suksesvol vanaf die middel van die gehoorarea geskandeer.', 'Geen skanderingklagtes is by meer as 2 000 deelnemers aangeteken nie. Die operasionele oorwinning was ewe beduidend: wanneer \'n laaste-minuut-borgbyvoeging nuwe naamborde vereis het, het die produksiespan dit binne minute vanaf die meester-SVG gegenereer, vol vertroue dat dit met alles sou ooreenstem.', 'Sien die Leer-gids oor drukklaar QR-kodes vir die SVG vs PNG-besluitraamwerk en beste praktyke vir oorhandiging.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Gebeurtenisfotografie wat wys hoe deelnemers QR-kodes op verskillende groottes en afstande deur die hele lokaal suksesvol skandeer',
          caption: 'Konferensiedag-sukses: betroubare skandering oor elke formaat, van kentekennabyte tot verhoogbanierafstandskote',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Blaai deur Leer artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Gevallestudie: Lughawe Lounge Digital Display',
      paragraphs: ['Hierdie voorbeeld volg \'n lugredery-sitkamer wat statiese QR-kodes op hul digitale verwelkomingsskerms gebruik het. Die skerms het roterende promosie-inhoud vertoon, maar die QR-kode vir sitkamer-aanmelding het in \'n hoek gesit, staties en maklik oor die hoof gesien. Ontleding het getoon dat slegs 15% van kwalifiserende gaste die QR-aanmelding gebruik het, al was dit vinniger as die lessenaartou. Die meeste gaste het dit eenvoudig nie opgemerk nie.', 'Die hipotese was eenvoudig: in \'n visueel besige omgewing met bewegende inhoud, word \'n statiese QR onsigbaar. Die oplossing wat nodig is om die QR merkbaar te maak sonder om die betroubaarheid te benadeel wat vereis word vir \'n inklokvloei waar mislukking gefrustreerde reisigers en langer lessenaartoue sou beteken.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: '\'n Digitale skerm in \'n lughawe-sitkamer wat promosie-inhoud wys met \'n klein, statiese QR-kode in die hoek',
          caption: 'Die oorspronklike opstelling: \'n statiese QR verlore in \'n see van dinamiese promosie-inhoud, wat slegs 15% aanneming behaal',
        },
      ],
    },
    {
      heading: 'Ontwerp veilige animasie',
      paragraphs: ['Die sitkamer se digitale naamborde het groot LED-panele gebruik – \'n uitdagende omgewing waar aggressiewe animasie skanderingsprobleme kan veroorsaak. Die ontwerpspan het konserwatief begin: \'n sagte polseffek wat die QR se visuele teenwoordigheid subtiel uitgebrei en gekrimp het sonder om die werklike kodestruktuur te verander. Raamtydsberekening is stadig gestel (250 ms) om enige flikkerprobleme met die LED-verfristempo te vermy.', 'Veiligheidsmodus-bekragtiging het bevestig dat elke raam skandeerbaar gebly het. Bykomende toetse op die werklike LED-panele het aan die lig gebring dat die polsslag selfs meer subtiel moes wees as wat voorskoue op die tafelblad voorgestel word - LED-helderheid en kykhoeke het die waargenome kontras meer beïnvloed as wat verwag is.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Die ANQR-animasie-instellingspaneel wat polskonfigurasie wys: stadige tydsberekening, subtiele intensiteit, Veiligheidsmodus geaktiveer',
          caption: 'Animasiekonfigurasie: parameters ingestel vir LED-paneelvertoning terwyl skanderingsbetroubaarheid in elke raam gehandhaaf word',
        },
      ],
    },
    {
      heading: 'Integrasie met naambordinhoud',
      paragraphs: ['Die geanimeerde QR is in \'n toegewyde \'stabiele sone\' van die skermuitleg geplaas - \'n area wat konstant gebly het terwyl promosie-inhoud in die hoofvertoonarea geroteer het. Hierdie skeiding was deurslaggewend: die QR het visuele stabiliteit nodig gehad vir skandering, selfs terwyl dit aandag trek deur sy subtiele animasie.', '\'n Duidelike oproep tot aksie is langs die QR bygevoeg: \'Slaan die tou oor - skandeer om in te meld.\' Die teks het staties gebly terwyl die QR gepols het, wat \'n visuele hiërargie geskep het wat die oog na die skanderingsgeleentheid getrek het sonder om die promosie-inhoud te oorweldig.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: '\'n Skermuitlegdiagram wat die geanimeerde QR in \'n stabiele sone wys terwyl promosie-inhoud in die hoofarea roteer',
          caption: 'Skerm-eiendomstoekenning: die geanimeerde QR beslaan \'n stabiele sone apart van roterende promosie-inhoud',
        },
      ],
    },
    {
      heading: 'Tegniese ontplooiing',
      paragraphs: ['Die geanimeerde QR is as \'n GIF uitgevoer met geoptimaliseerde instellings vir die naambord-CMS. Lêergrootte-oorwegings het saak gemaak - die sitkamer se inhoudbestuurstelsel het oplaailimiete gehad, en te groot lêers het die afspeel hakkel veroorsaak. Die finale uitvoer het visuele kwaliteit teen lêergrootte gebalanseer deur die kleurpalet te beperk en raamtelling te optimaliseer.', 'Ontplooiing het \'n terugval ingesluit: as die GIF om enige rede nie speel nie, sal die naambordstelsel \'n statiese PNG-rugsteun vertoon. Hierdie oortolligheid het verseker dat inklokvermoë nooit verlore gegaan het as gevolg van tegniese probleme met die animasie nie.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: '\'n CMS-koppelvlak wat die geanimeerde QR-oplaai wys met terugval-statiese beeld opgestel',
          caption: 'Signage CMS-konfigurasie: geanimeerde primêre met statiese terugval wat verseker dat inklokvermoë nooit onderbreek word nie',
        },
      ],
    },
    {
      heading: 'Gemeet impak',
      paragraphs: ['Na een maand van operasie het QR-aanmelding toegeneem van 15% tot 24% - \'n relatiewe verbetering van 60%. Gasterugvoeropnames het aangedui dat die geanimeerde QR \'makliker is om op te let\' en \'meer modern voel\'. Toutye vir lessenaars het tydens spitstye meetbaar afgeneem namate meer gaste self bedien het via die QR.', 'Wat belangrik is, is dat nul skanderingsfoute gerapporteer is ondanks duisende daaglikse skanderings. Die konserwatiewe animasiebenadering het die aandagdoelwit bereik sonder om die betroubaarheid in te boet wat \'n inklokvloei vereis het. Die sitkamer het daarna soortgelyke geanimeerde QR\'s na hul ander liggings uitgerol.', 'Sien die Leer-gids oor geanimeerde QR-kodes vir digitale naamborde vir die tegniese beginsels agter veilige animasie-ontwerp.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: '\'n Kontroleskerm wat aannemingskoersverhoging, toutydvermindering en betroubaarheid van skandering met geen foute oor die ontplooiingstydperk wys',
          caption: 'Een maand se data: 60% toename in aanneming, verminderde toutye en volmaakte skanderingsbetroubaarheid gehandhaaf',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Blaai deur Leer artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Gevallestudie: Wêreldwye produkbekendstelling QR-veldtog',
      paragraphs: ['Hierdie voorbeeld volg op \'n verbruikerselektronika-maatskappy wat \'n nuwe produk gelyktydig in 12 markte in 8 tale bekendstel. Elke streekbemarkingspan moes verpakking, kleinhandeluitstallings en promosiemateriaal vervaardig wat QR-kodes bevat wat na gelokaliseerde produkbladsye skakel. Vorige bekendstellings het gelei tot inkonsekwente QR-stilering, af en toe skanderingsfoute en \'n \'telefoonspeletjie\' van konfigurasieverskuiwing, aangesien elke span kodes van skermkiekies herskep het.', 'Die oplossing het ANQR se deelbare konfigurasieskakels gebruik om \'n enkele bron van waarheid te vestig waartoe elke streekspan toegang kon kry, ongeag hul koppelvlaktaal. Die QR-loonvrag het \'n slim herleiding gebruik wat gebruikerstaal opgespoor het, so een kode het wêreldwyd gewerk terwyl dit gelokaliseerde ervarings gelewer het.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: '\'n Wêreldkaart wat 12 markliggings met QR-kodes aantoon, sommige visueel inkonsekwent met mekaar',
          caption: 'Die uitdaging: 12 markte, 8 tale en \'n geskiedenis van inkonsekwente QR-implementerings oor streke heen',
        },
      ],
    },
    {
      heading: 'Vestiging van die meesterkonfigurasie',
      paragraphs: ['Die wêreldwye handelsmerkspan het die gesaghebbende QR-konfigurasie in ANQR geskep: handelsmerkkleure wat ooreenstem met die produklyn se visuele identiteit, Foutkorreksie H vir betroubaarheid oor alle druk- en digitale toepassings, en stilering wat konsekwent sal reproduseer ongeag plaaslike produksiemetodes. Die konfigurasie is gesluit en die deelskakel is in die globale veldtogopdrag gedokumenteer.', 'Die geënkodeerde URL het \'n taalopsporende herleidingdiens gebruik. Wanneer dit geskandeer is, is gebruikers outomaties na hul plaaslike taalprodukbladsy herlei. Dit het beteken dat al 12 markte identiese QR-kodes kon gebruik - geen per-mark loonvragvariasies wat foute kan veroorsaak nie.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Die ANQR-koppelvlak wat die meesterkonfigurasie met handelsmerkkleure, ECC H en die slim herleiding-URL wys',
          caption: 'Die meesterkonfigurasie: globale handelsmerkstandaarde wat in \'n enkele, deelbare bron van waarheid geënkodeer is',
        },
      ],
    },
    {
      heading: 'Streekspanwerkvloei',
      paragraphs: ['Elke streekbemarkingspan het die konfigurasieskakel met eenvoudige instruksies ontvang: maak die skakel oop, verifieer die voorskou pas by die handelsmerkriglyne, voer uit in die vereiste formaat vir jou toepassing. Die ANQR-koppelvlak het in elke span se voorkeurtaal vertoon, maar die onderliggende QR-instellings het identies gebly ongeag die koppelvlaktaal.', 'Toe die Japannese span SVG nodig gehad het vir hoë-end kleinhandelvertonings en die Brasiliaanse span PNG vir sosiale media nodig gehad het, is albei van dieselfde konfigurasie uitgevoer. Wanneer die Duitse span se drukverkoper spesifieke kleurwaardes versoek het, kon hulle direk na die konfigurasie verwys eerder as om van \'n skermskoot te raai.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Skermkiekies wat dieselfde konfigurasieskakel wys, is in Japannese, Portugese en Duitse koppelvlakke oopgemaak',
          caption: 'Dieselfde konfigurasie, verskillende koppelvlakke: streekspanne werk in hul voorkeurtaal terwyl hulle globale konsekwentheid behou',
        },
      ],
    },
    {
      heading: 'Hantering van streeksvariasies',
      paragraphs: ['Sommige markte het geringe aanpassings vereis. Die Chinese span het \'n weergawe nodig gehad met \'n WeChat-geoptimaliseerde raam vir sosiale deel. Eerder as om die meester te wysig, het hulle \'n gedokumenteerde variant met sy eie konfigurasieskakel geskep, duidelik gemerk as \'CN-WeChat-variant\' in die veldtogbatebiblioteek. Dit het naspeurbaarheid gehandhaaf terwyl die nodige lokalisering moontlik gemaak is.', 'Die handelsmerkspan het \'n eenvoudige reël vasgestel: enige variasie van meester het \'n nuwe, gedokumenteerde konfigurasieskakel vereis. Geen wysigings aan uitgevoer lêers, geen \'vinnige oplossings\' in ontwerp sagteware. Dit het die konfigurasieverskuiwing verhoed wat vorige bekendstellings geteister het.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: '\'n Batebiblioteekkoppelvlak wat die hoofkonfigurasie en goedgekeurde streeksvariante wys, elk met sy eie skakel',
          caption: 'Veldtogbatebestuur: meesterkonfigurasie plus gedokumenteerde variante, alles naspeurbaar via konfigurasieskakels',
        },
      ],
    },
    {
      heading: 'Begin resultate',
      paragraphs: ['Op produkbekendstellingsdag is QR-kodes oor verpakking, kleinhandeluitstallings, geleentheidsmateriaal en digitale veldtogte in al 12 markte gelyktydig ontplooi. Kwaliteit-oudits het visuele konsekwentheid oor streke heen bevestig - die QR op Tokio-kleinhandeluitstallings het ooreenstem met die QR op São Paulo-verpakking, ooreenstem met die QR op Berlynse gebeurtenisbaniere.', 'Geen skanderingsfoute is oor markte heen aangemeld nie. Wanneer \'n na-bekendstelling produk bladsy URL verandering nodig was, die herleiding diens het dit onsigbaar hanteer - geen herdruk vereis. Die wêreldspan het beraam dat die konfigurasieskakelbenadering 40+ uur se koördineringstyd bespaar het in vergelyking met hul vorige bekendstellingsmetodologie.', 'Sien die Leer-gids oor kruistalige QR-samewerking vir die werkvloeibeginsels agter globale veldtogkonsekwentheid.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: '\'n Rooster van foto\'s wat konsekwente QR-ontplooiing oor verskillende markte toon: Tokio-kleinhandel, São Paulo-verpakking, Berlynse gebeure',
          caption: 'Wêreldwye konsekwentheid bereik: identiese QR-aanbieding oor 12 markte ten spyte van verskillende tale, verskaffers en formate',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Blaai deur Leer artikels',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Blaai deur Leer artikels', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Maak die volledige gebruikersgids oop', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Maak die galery oop', type: 'gallery' },
  ],
};
