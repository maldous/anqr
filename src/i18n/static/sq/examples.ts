import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Shembuj të ANQR',
  description: 'Pesë shembuj të botës reale, të stilit të prodhimit që tregojnë se ku kodet QR krijojnë vlerë të matshme: ngritja e një kodi numërues të vjetër të shitjes me pakicë, pagesat me pakicë të markës dhe veprimet "skanimi në", shkallëzimi i printimit nga fletushkat në tabela, QR i animuar për sinjalistikën dixhitale dhe bashkëpunimi ndërgjuhësor duke përdorur lidhje të përbashkëta Anchor. Secili shembull përfshin imazhe, kufizime praktike dhe një lidhje ripërzierjeje në gjenerator.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Hapni gjeneratorin', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Shfletoni artikujt Mësoni', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Hapni udhëzuesin e plotë të përdoruesit', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Studimi i rastit: Ngritja e QR Counter me pakicë',
      paragraphs: ['Ky shembull i botës reale ndjek një kafene të vogël që kishte përdorur të njëjtin kod QR në banakun e tyre për tre vjet. Kodi origjinal u krijua shpejt gjatë nxitimit të pandemisë, u printua në letër standarde dhe u fut në një stendë plastike. Ajo ende funksionoi - teknikisht - por klientët shpesh kishin nevojë për përpjekje të shumta për ta skanuar atë dhe nuk bëri asgjë për të përforcuar identitetin e markës së kafenesë të krijuar me kujdes.', 'Transformimi filloi me një kontroll të thjeshtë: kodi ekzistues kodonte URL-në e menysë në internet të kafenesë, të cilën ata donin ta mbanin. Sfida ishte ta bënte QR-në të ndihej si pjesë e përvojës së kafenesë dhe jo si një mjet i menduar më vonë nga viti 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Një kod QR i gërryer në një stendë plastike që tregon veshje të dukshme, gjurmë gishtash dhe printim të zbehur',
          caption: 'Pika e fillimit: tre vjet shërbim sportel e kishin lënë QR-në origjinale mezi funksionale',
        },
      ],
    },
    {
      heading: 'Diagnostifikimi i problemeve të kodit origjinal',
      paragraphs: ['Testimi zbuloi probleme të shumta: kodi origjinal përdorte Error Correction L (tepricë minimale), kishte një zonë të qetë prej vetëm 2 modulesh dhe ishte printuar me rezolucion të ulët. Nën ndriçimin e ngrohtë të tungstenit të kafenesë, modulet e zeza tashmë të zbehura mezi bënin kontrast me letrën e zverdhur. Telefonat e vjetër kishin vështirësi; telefonat e rinj patën sukses, por me vonesë të dukshme.', 'Përtej çështjeve teknike, katrori i përgjithshëm bardh e zi nuk komunikonte asgjë për markën. Klientët hezituan përpara se të skanonin - një pengesë delikate besimi që reduktoi angazhimin me menunë dixhitale të dizajnuar me kujdes të kafenesë.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Një mbivendosje diagnostike që tregon mangësitë teknike të QR origjinale: ECC e ulët, zonë minimale e qetë, kontrast i dobët',
          caption: 'Analiza teknike që zbulon pse kodi i trashëguar nuk funksionoi në kushte të botës reale',
        },
      ],
    },
    {
      heading: 'Procesi i Ngritjes',
      paragraphs: ['Duke përdorur ANQR, pronari i kafenesë rikrijoi kodin me URL-në identike të menysë, por cilësimet e përmirësuara në mënyrë dramatike: Korrigjimi i gabimit H për elasticitet maksimal, një zonë e qetë me 6 module për zbulimin e besueshëm të kufijve dhe ngjyrat e markës (module të thella ngjyrë burgundy në sfond krem) që përputheshin me paletën e brendshme të kafenesë.', 'U shtua një shtresë e vogël qendrore që përmban logon e kafenesë - e mbajtur qëllimisht delikate për të ruajtur skanueshmërinë duke ofruar njohje të menjëhershme të markës. Safety Mode konfirmoi se dizajni i ri u skanua në mënyrë të besueshme në pajisjet e testimit përpara çdo printimi.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Ndërfaqja ANQR që tregon konfigurimin: ngjyrat e markës, ECC e përshtatshme, zonë e qetë bujare, mbivendosje delikate e logos',
          caption: 'Ndërtimi i konfigurimit të përmirësuar: çdo cilësim i zgjedhur për të balancuar shprehjen e markës me besueshmërinë e skanimit',
        },
      ],
    },
    {
      heading: 'Rezultate të matshme',
      paragraphs: ['Pas vendosjes së QR-së së re në kartën profesionale të petëzuar me mat, kafeneja gjurmoi rezultatet për katër javë. Shkalla e suksesit të skanimit u përmirësua nga rreth 70% në gati 100%. Koha mesatare e skanimit ra nga 3-4 sekonda në nën 1 sekondë. Më e rëndësishmja, angazhimi i menusë u rrit me 40% - klientët që më parë hodhën një sy në QR dhe hoqën dorë, tani po skanonin me besim.', 'Stafi raportoi më pak pyetje të klientëve rreth \'si të përdoret QR\' dhe jo më shumë raste të shtypjes manuale të URL-së për klientët e frustruar. Pamja e markës ndezi gjithashtu biseda, me klientët që komentuan pozitivisht për dizajnin koheziv.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Një krahasim para/pas me metrikat: shkalla e suksesit të skanimit, koha mesatare e skanimit dhe përmirësimet e numrit javor të skanimit',
          caption: 'Katër javë të dhëna që tregojnë ndikimin e matshëm të një ngritjeje të menduar QR',
        },
      ],
    },
    {
      heading: 'Rikrijo këtë konfigurim',
      paragraphs: ['Konfigurimi i kafenesë demonstron markë konservatore, por efektive: Korrigjimi i gabimit H, zonë e qetë me 6 module, ngjyra të markave me kontrast të lartë dhe një mbivendosje minimale në qendër. Ky bilanc funksionon për shumicën e aplikacioneve të sporteleve me pakicë ku besueshmëria duhet të jetë e para, por prania e markës është ende e rëndësishme.', 'Hapni gjeneratorin me këto cilësime të para-ngarkuar dhe përshtatni ngjyrat dhe mbivendosjen me markën tuaj. Vështrimi kryesor: vetëm përmirësimet e besueshmërisë mund të rrisin në mënyrë dramatike angazhimin, edhe para se të shtoni ndonjë stil vizual.', 'Shikoni udhëzuesin përkatës Mësoni për përmirësimin e fushatave ekzistuese QR për metodologjinë e plotë që qëndron pas kësaj qasjeje.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Lidhja me gjeneratorin e para-konfiguruar me cilësimet e kafenesë për personalizim të menjëhershëm',
          caption: 'Filloni me një konfigurim të provuar dhe personalizoni për markën tuaj',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Shfletoni artikujt Mësoni',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Studim i rastit: Ekran i numëratorit me shumë pagesa',
      paragraphs: ['Ky shembull ndjek një dyqan veshjesh butiku që kishte grumbulluar pesë kode QR të ndryshme në regjistrin e tyre: pagesa bankare, këshilla, Instagram, komente në Google dhe një lidhje punësimi. Secili u krijua nga një burim i ndryshëm, u printua në kohë të ndryshme dhe u shfaq në stendat e papërputhshme. Kaosi vizual po minonte estetikën e dyqanit të kuruar me kujdes dhe stafi merrej rregullisht me klientët që skanonin kodin e gabuar.', 'Zgjidhja kërkonte shqetësime të ndara: kodet e pagesave kishin nevojë për besueshmëri maksimale me një stil konservator, ndërsa kodet e marketingut mund të ishin më ekspresive. Sistemi i unifikuar i ekranit që u shfaq tregon se si të balancohet prania e markës ndaj kërkesave funksionale të rasteve të ndryshme të përdorimit të QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Një zonë e rrëmujshme regjistrash që tregon pesë kode QR të papërputhshme në stendat e ndryshme dhe materialet e printuara',
          caption: 'Pika kaotike e fillimit: pesë kode QR të shkëputura që konkurrojnë për vëmendje dhe shkaktojnë konfuzion të klientit',
        },
      ],
    },
    {
      heading: 'Duke i dhënë përparësi përvojës së pagesës',
      paragraphs: ['Mënyra kryesore e pagesës së dyqanit përdorte një standard rajonal që kërkonte pajtueshmëri të rreptë të ngarkesës. Testimi zbuloi se edhe stilimi i vogël ndikoi në shpejtësinë e skanimit me disa aplikacione bankare. Vendimi: mbaj QR-në e pagesës plotësisht të pamodifikuar, përveç optimizimit të madhësisë dhe printimit profesional në stokun e kartës mat.', 'Kjo qasje konservatore nënkuptonte se kodi i pagesës dukej më pak \'markë\' sesa ideali, por normat e përfundimit të transaksioneve u përmirësuan në mënyrë dramatike. Vështrimi: momentet e pagesës nuk janë mundësi markimi - ato janë momente besueshmërie. Konsumatorët vlerësojnë shpejtësinë dhe sigurinë mbi estetikën kur përfshihen paratë.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Një kod QR i pastër dhe i madh pagese në stokun e kartave profesionale mat, i pozicionuar dukshëm në regjistër',
          caption: 'QR e pagesës: me madhësi bujare, të printuar në mënyrë profesionale, të stiluar në mënyrë konservative për njohje të menjëhershme nga aplikacionet bankare',
        },
      ],
    },
    {
      heading: 'Krijimi i ekranit të veprimit dytësor',
      paragraphs: ['Për këshilla, komente, sociale dhe punësim, dyqani mund të jetë më ekspresiv. Këta kode u rigjeneruan në ANQR me një stil të qëndrueshëm të markës: jeshile ulliri me firmë në krem, stil i rrumbullakosur i modulit dhe një mbivendosje delikate në qendër me ikonën e dyqanit. Korrigjimi i gabimit H siguroi besueshmëri edhe me stilimin.', 'Këto katër kode u rregulluan në një panel të markës të pozicionuar pranë (jo konkurrues) kodit të pagesës. Etiketat e qarta në tipografinë e dyqanit shpjeguan qëllimin e secilit kod. Hierarkia vizuale ishte e qëllimshme: pagesa qëndronte e vetme dhe e spikatur; veprime dytësore të grupuara së bashku si opsione.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Një panel i markës që tregon katër kode QR të stilizuara për këshilla, komente, sociale dhe punësim, me etiketa të qarta',
          caption: 'Paneli dytësor i veprimit: markë e qëndrueshme, etiketim i qartë, i pozicionuar si opsione dhe jo si shpërqendrime',
        },
      ],
    },
    {
      heading: 'Dizajni i Sistemit të Ekranit',
      paragraphs: ['Ekrani fizik zgjidhi disa probleme në të njëjtën kohë. Si bazamenti i pagesës ashtu edhe paneli dytësor përdorën materiale mat për të eliminuar shkëlqimin nga ndriçimi i sipërm. Lartësitë u optimizuan për klientët me shtat të ndryshëm. Këndet e drejtuara drejt radhës së klientit dhe jo të sheshtë në banak.', 'Në mënyrë kritike, dyqani krijoi printime rezervë nga lidhjet e konfigurimit të kyçur ANQR. Kur kodi i këshillave përfundimisht u spërkat me kafe, stafi e zëvendësoi atë brenda pak minutash duke përdorur konfigurimin e ruajtur - pa pamje nga ekrani, pa hamendje në cilësimet, pa degradim të cilësisë.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Një diagram që tregon paraqitjen fizike të ekranit: lartësitë, këndet, materialet dhe marrëdhëniet midis pagesës dhe ekraneve dytësore',
          caption: 'Plani i sistemit të ekranit: ergonomia fizike e optimizuar për skanim të besueshëm në lartësitë e klientëve dhe kushtet e ndriçimit',
        },
      ],
    },
    {
      heading: 'Përmirësimet Operacionale',
      paragraphs: ['Gjashtë javë pas vendosjes, dyqani dokumentoi përmirësime të rëndësishme: zero ankesa të klientëve për konfuzionin e \'kodit të gabuar\', kohë më të shpejta transaksionesh dhe një rritje 3 herë në dorëzimet e bakshishit (klientët tani mund të gjenin dhe skanonin kodin e bakshishit pa pyetur në mënyrë të sikletshme stafin). Rishikimet e Google u rritën gjithashtu pasi QR-ja e dedikuar dhe e etiketuar mirë hoqi fërkimin.', 'Trajnimi i stafit u bë më i thjeshtë: \'kodi i pagesës është i madh, gjithçka tjetër është në panel.\' Kur aplikacionet e pagesave u përditësuan dhe njëri shfaqi shkurtimisht skanim më të ngadaltë, dizajni konservativ i kodit të pagesës nënkuptonte se ai ende funksiononte - thjesht pak më i ngadalshëm në vend që të dështonte plotësisht.', 'Shihni udhëzuesin Mësoni mbi kodet QR për pagesat me pakicë për parimet që qëndrojnë pas këtij dizajni të sistemit të ekranit.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Një panel metrikë që tregon para/pas krahasimeve: incidente konfuzioni, koha e transaksionit, shpeshtësia e bakshishit, dorëzimet e rishikimit',
          caption: 'Gjashtë javë të dhëna operacionale që demonstrojnë ndikimin e biznesit të një sistemi të zhytur në mendime të ekranit me shumë QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Shfletoni artikujt Mësoni',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Rast Studimi: Nga Kartëvizita në Billboard',
      paragraphs: ['Ky shembull ndjek një kompani të prodhimit të ngjarjeve që përgatitet për një konferencë të madhe. Ata kishin nevojë për të njëjtin kod QR - që lidhej me aplikacionin e ngjarjes - i vendosur në formate rrënjësisht të ndryshme: futje simbolesh të pjesëmarrësve (3 cm), kartat e çadrës së tavolinës (8 cm), sinjalistikë në tavolinën e regjistrimit (30 cm), postera për gjetjen e rrugës (60 cm) dhe një bander masiv me sfond skene (4 metra). Secili format kishte distanca të ndryshme shikimi, kushte ndriçimi dhe rrjedha të punës së prodhimit.', 'Sfida nuk ishte vetëm teknike - ajo ishte operacionale. Shitësit e shumtë trajtuan punë të ndryshme printimi dhe kompanisë i duhej të siguronte rezultate të qëndrueshme dhe të skanueshme, pavarësisht se kush prodhoi çfarë. Zgjidhja e tyre përqendrohej në eksportin SVG dhe dokumentacionin rigoroz të dorëzimit.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Një kolazh që tregon të njëjtin kod QR të vendosur në pesë madhësi të ndryshme, nga distinktivi në baner',
          caption: 'Një kod QR, pesë madhësi të vendosjes: sfida e ruajtjes së skanimit nga centimetra në metra',
        },
      ],
    },
    {
      heading: 'Pse ngjarjet e mëparshme kishin probleme',
      paragraphs: ['Në konferencën e tyre të fundit, kompania kishte përjetuar dështime të turpshme. Banneri i skenës QR u krijua si një PNG i vogël dhe u përshkallëzua në softuerin e projektimit - rezultati dukej i pranueshëm nga një distancë, por nuk arriti të skanohej në mënyrë të besueshme nga audienca. QR-të e distinktivit ishin shumë të stilizuara dhe shumë të vogla, të pranishmit zhgënjyes që përpiqeshin të shtonin kontakte. Cilësimet e paqëndrueshme nëpër formate nënkuptonin se "i njëjti" QR në fakt dukej i ndryshëm në secilën pjesë.', 'Analiza pas ngjarjes zbuloi shkakun kryesor: asnjë burim i vetëm i së vërtetës. Secili projektues kishte rikrijuar QR-në me cilësime paksa të ndryshme dhe çdo shitës printimi kishte përpunuar skedarët ndryshe. Cilësia e degraduar përmes lojës telefonike të dorëzimit të dosjeve.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografitë nga afër që tregojnë dështimet e skanimit: module banderolash me piksel, kode distinktive të vogla, stilim jokonsistent në të gjitha formatet',
          caption: 'Analiza mjeko-ligjore e dështimeve të ngjarjeve të mëparshme: secili format kishte paraqitur probleme të ndryshme të cilësisë',
        },
      ],
    },
    {
      heading: 'Rrjedha e punës SVG-First',
      paragraphs: ['Për këtë ngjarje, kompania krijoi një protokoll të rreptë: një QR master i gjeneruar në ANQR me cilësime optimale (Korrigjimi i gabimit H, zonë e qetë, stil i pastër), eksportohet si SVG dhe ruhet si burimi i vetëm autoritar. Lidhja e konfigurimit ANQR u dokumentua së bashku me skedarin SVG, në mënyrë që kodi të mund të rigjenerohej nëse ishte e nevojshme.', 'Çdo projektues dhe shitës mori të njëjtin master SVG me udhëzime të qarta: vendoseni në madhësinë e kërkuar, mos modifikoni, ruani hapësirën e zonës së qetë. Për shitësit që kërkojnë formate raster, kompania ofroi PNG të parapërgatitura në madhësi specifike me konventa të qarta emërtimi që tregojnë përdorimin e synuar.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Një paketë skedari që tregon masterin SVG, PNG-të specifike për madhësinë, dokumentin e specifikimit dhe lidhjen e konfigurimit',
          caption: 'Paketa e dorëzimit: gjithçka që u nevojitet shitësve për të prodhuar rezultate të qëndrueshme pa hamendje',
        },
      ],
    },
    {
      heading: 'Konsiderata specifike për madhësinë',
      paragraphs: ['Çdo format kërkonte vëmendje të veçantë. Futjet e distinktivit në 3 cm kishin nevojë për QR për të zënë hapësirën maksimale të disponueshme - distanca e skanimit do të ishte gjatësia e krahut. Tenda tavoline në 8 cm mund të përfshijnë kornizë dekorative jashtë zonës së qetë. Banneri prej 4 metrash kërkonte llogaritje: nga distanca tipike e audiencës (15-20 metra), modulet duhej të dalloheshin qartë nga kamerat e telefonit, që do të thoshte që QR duhej të ishte të paktën 80 cm brenda dizajnit të banderit.', 'Kompania krijoi një udhëzues përmasash që dokumenton dimensionet minimale QR për çdo distancë të pritshme skanimi. Ky u bë një aktiv i ripërdorshëm për ngjarjet e ardhshme, duke hequr supozimet nga procesi i projektimit.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Një grafik që tregon lidhjen midis distancës së skanimit, madhësisë minimale QR dhe dimensioneve të modulit për çdo format ngjarjeje',
          caption: 'Matrica e madhësisë: dimensionet e llogaritura që sigurojnë skanim të besueshëm në distancën e pritur të shikimit të secilit format',
        },
      ],
    },
    {
      heading: 'Rezultatet e prodhimit',
      paragraphs: ['Vlefshmëria e ditës së konferencës ishte sistematike: stafi testoi çdo QR të vendosur përpara se të hapeshin dyert. Futjet e distinktivit skanohen menjëherë në gjatësinë e krahut. Çadrat e tavolinave funksionuan me besueshmëri në ndriçimin e ndryshueshëm të dhomave të ndarjes. Banneri i skenës - turpi i ngjarjes së mëparshme - u skanua me sukses nga mesi i zonës së audiencës.', 'Zero ankesa për skanim u regjistruan në mbi 2000 pjesëmarrës. Fitorja operacionale ishte po aq domethënëse: kur një shtesë sponsori në minutën e fundit kërkonte sinjalistikë të re, ekipi i prodhimit e gjeneroi atë nga masteri SVG në minuta, me besim se do të përputhej me gjithçka tjetër.', 'Shihni udhëzuesin Mësoni për kodet QR të gatshme për printim për kuadrin e vendimeve SVG kundër PNG dhe praktikat më të mira të dorëzimit.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografia e ngjarjes që tregon pjesëmarrësit duke skanuar me sukses kodet QR në madhësi dhe distanca të ndryshme në të gjithë vendin',
          caption: 'Suksesi i ditës së konferencës: skanim i besueshëm në çdo format, nga pamjet e afërta të distinktivit deri te shkrepjet në distancë të banderolave',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Shfletoni artikujt Mësoni',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Rast Studimi: Ekrani Dixhital i Sallës së Aeroportit',
      paragraphs: ['Ky shembull ndjek një sallë pritjeje linja ajrore që kishte përdorur kode QR statike në ekranet e tyre dixhitale të mirëseardhjes. Ekranet shfaqnin përmbajtje promocionale rrotulluese, por kodi QR për regjistrimin në sallë pritjeje ishte në një cep, statik dhe lehtësisht i anashkaluar. Analiza tregoi se vetëm 15% e të ftuarve të kualifikuar përdorën regjistrimin QR, pavarësisht se ishte më i shpejtë se radha e tavolinës. Shumica e të ftuarve thjesht nuk e vunë re atë.', 'Hipoteza ishte e thjeshtë: në një mjedis të ngarkuar vizualisht me përmbajtje lëvizëse, një QR statike bëhet e padukshme. Zgjidhja e nevojshme për ta bërë QR-në të dukshme pa kompromentuar besueshmërinë e kërkuar për një fluks check-in ku dështimi do të nënkuptonte udhëtarë të frustruar dhe radhë më të gjata në tavolinë.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Një ekran dixhital në një sallë pritjeje aeroporti që tregon përmbajtje promovuese me një kod të vogël QR statik në qoshe',
          caption: 'Konfigurimi origjinal: një QR statike e humbur në një det me përmbajtje dinamike promovuese, duke arritur vetëm 15% miratim',
        },
      ],
    },
    {
      heading: 'Dizajnimi i animacionit të sigurt',
      paragraphs: ['Sinjalet dixhitale të sallës përdorën panele të mëdha LED - një mjedis sfidues ku animacioni agresiv mund të krijonte probleme skanimi. Ekipi i projektimit filloi në mënyrë konservative: një efekt i butë pulsi që zgjeroi dhe kontraktoi në mënyrë delikate praninë vizuale të QR-së pa modifikuar strukturën aktuale të kodit. Koha e kuadrit u caktua e ngadaltë (250 ms) për të shmangur çdo problem dridhjeje me shpejtësinë e rifreskimit LED.', 'Vleresimi i modalitetit të sigurisë konfirmoi se çdo kornizë mbeti e skanueshme. Testimi shtesë në panelet aktuale LED zbuloi se pulsi duhej të ishte edhe më delikat se sa sugjeroheshin pamjet paraprake të desktopit - ndriçimi LED dhe këndet e shikimit ndikuan në kontrastin e perceptuar më shumë se sa pritej.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Paneli i cilësimeve të animacionit ANQR që tregon konfigurimin e pulsit: koha e ngadaltë, intensiteti delikat, Modaliteti i sigurisë i aktivizuar',
          caption: 'Konfigurimi i animacionit: parametrat e akorduar për ekranin e panelit LED duke ruajtur besueshmërinë e skanimit në çdo kornizë',
        },
      ],
    },
    {
      heading: 'Integrimi me përmbajtjen e sinjalistikës',
      paragraphs: ['QR-ja e animuar u pozicionua në një \'zonë të qëndrueshme\' të dedikuar të paraqitjes së ekranit - një zonë që mbeti konstante ndërsa përmbajtja promovuese rrotullohej në zonën kryesore të ekranit. Kjo ndarje ishte thelbësore: QR kishte nevojë për stabilitet vizual për skanim edhe kur tërhiqte vëmendjen përmes animacionit të tij delikate.', 'Një thirrje e qartë për veprim u shtua ngjitur me QR: "Kapërceni radhën - skanoni për t\'u regjistruar". Teksti mbeti statik ndërsa QR-ja pulsonte, duke krijuar një hierarki vizuale që tërhoqi vëmendjen te mundësia e skanimit pa e mbingarkuar përmbajtjen promovuese.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Një diagram i paraqitjes së ekranit që tregon QR-në e animuar në një zonë të qëndrueshme ndërsa përmbajtja promovuese rrotullohet në zonën kryesore',
          caption: 'Shpërndarja e pasurive të paluajtshme në ekran: QR-ja e animuar zë një zonë të qëndrueshme të ndarë nga përmbajtja e rradhës promovuese',
        },
      ],
    },
    {
      heading: 'Vendosja teknike',
      paragraphs: ['QR-ja e animuar u eksportua si një GIF me cilësime të optimizuara për CMS-në e sinjalistikës. Konsideratat e madhësisë së skedarit kishin rëndësi - sistemi i menaxhimit të përmbajtjes së sallës kishte kufizime të ngarkimit dhe skedarët tepër të mëdhenj shkaktuan belbëzimin e riprodhimit. Eksporti përfundimtar balancon cilësinë vizuale kundrejt madhësisë së skedarit duke kufizuar paletën e ngjyrave dhe duke optimizuar numrin e kornizave.', 'Vendosja përfshinte një kthim prapa: nëse GIF nuk do të luhej për ndonjë arsye, sistemi i sinjalistikës do të shfaqte një kopje rezervë statike PNG. Kjo tepricë siguroi që aftësia e regjistrimit të mos humbiste kurrë për shkak të problemeve teknike me animacionin.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Një ndërfaqe CMS që tregon ngarkimin e animuar të QR me imazhin statik të konfiguruar prapa',
          caption: 'Konfigurimi i Signage CMS: primar i animuar me rikthim statik që siguron që aftësia e regjistrimit të mos ndërpritet kurrë',
        },
      ],
    },
    {
      heading: 'Ndikimi i matur',
      paragraphs: ['Pas një muaji funksionimi, miratimi i regjistrimit në QR u rrit nga 15% në 24% - një përmirësim relativ 60%. Sondazhet e komenteve të të ftuarve treguan se QR-ja e animuar ishte \'më e lehtë për t\'u vënë re\' dhe \'ndihej më moderne\'. Kohët e radhës së tavolinave u ulën në mënyrë të matshme gjatë periudhave të pikut pasi më shumë të ftuar shërbyen vetë nëpërmjet QR.', 'E rëndësishmja, u raportuan zero dështime të skanimit pavarësisht mijëra skanimeve ditore. Qasja konservatore e animacionit kishte arritur qëllimin e vëmendjes pa sakrifikuar besueshmërinë që kërkonte një fluks kontrolli. Salla e pritjes më pas shpërndau QR të ngjashme të animuara në vendet e tyre të tjera.', 'Shihni udhëzuesin Mësoni mbi kodet e animuara QR për sinjalistikën dixhitale për parimet teknike prapa dizajnit të sigurt të animacionit.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Një panel kontrolli që tregon rritjen e shkallës së miratimit, reduktimin e kohës së radhës dhe besueshmërinë e skanimit me dështim zero gjatë periudhës së vendosjes',
          caption: 'Një muaj të dhëna: 60% rritje miratimi, reduktimi i kohës së radhës dhe ruajtja e besueshmërisë së përsosur të skanimit',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Shfletoni artikujt Mësoni',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Studimi i rastit: Fushata QR e nisjes së produktit global',
      paragraphs: ['Ky shembull ndjek një kompani elektronike të konsumit që lançon një produkt të ri njëkohësisht në 12 tregje në 8 gjuhë. Çdo ekip rajonal marketingu kishte nevojë të prodhonte paketim, ekrane me pakicë dhe materiale promovuese që paraqesin kode QR që lidhen me faqet e produkteve të lokalizuara. Lansimet e mëparshme kishin rezultuar në një stil të paqëndrueshëm QR, dështime të herëpashershme të skanimit dhe një \'lojë telefonike\' të zhvendosjes së konfigurimit ndërsa secili ekip rikrijonte kodet nga pamjet e ekranit.', 'Zgjidhja përdori lidhjet e konfigurimit të ndashëm të ANQR për të krijuar një burim të vetëm të së vërtetës që çdo ekip rajonal mund të aksesonte, pavarësisht nga gjuha e tyre e ndërfaqes. Ngarkesa QR përdori një ridrejtim inteligjent që zbuloi gjuhën e përdoruesit, kështu që një kod funksionoi globalisht duke ofruar përvoja të lokalizuara.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Një hartë botërore që tregon 12 vendndodhje tregu me kode QR, disa vizualisht në kundërshtim me njëri-tjetrin',
          caption: 'Sfida: 12 tregje, 8 gjuhë dhe një histori e zbatimeve jokonsistente të QR nëpër rajone',
        },
      ],
    },
    {
      heading: 'Krijimi i konfigurimit Master',
      paragraphs: ['Ekipi global i markës krijoi konfigurimin autoritar QR në ANQR: ngjyrat e markës që përputhen me identitetin vizual të linjës së produktit, Korrigjimi i gabimit H për besueshmërinë në të gjitha aplikacionet e printimit dhe dixhital, dhe stil që do të riprodhohej vazhdimisht, pavarësisht nga metodat e prodhimit vendas. Konfigurimi u bllokua dhe lidhja e ndarjes u dokumentua në përmbledhjen e fushatës globale.', 'Në mënyrë kritike, URL-ja e koduar përdori një shërbim ridrejtues për zbulimin e gjuhës. Kur skanoheshin, përdoruesit u dërguan automatikisht në faqen e produktit të gjuhës së tyre lokale. Kjo do të thoshte se të 12 tregjet mund të përdornin kode identike QR - pa ndryshime të ngarkesës për treg që mund të shkaktonin gabime.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Ndërfaqja ANQR që tregon konfigurimin kryesor me ngjyrat e markës, ECC H dhe URL-në inteligjente të ridrejtimit',
          caption: 'Konfigurimi kryesor: standardet globale të markave të koduara në një burim të vetëm, të përbashkët të së vërtetës',
        },
      ],
    },
    {
      heading: 'Rrjedha e punës së ekipit rajonal',
      paragraphs: ['Çdo ekip rajonal i marketingut mori lidhjen e konfigurimit me udhëzime të thjeshta: hapni lidhjen, verifikoni që pamja paraprake përputhet me udhëzimet e markës, eksportoni në formatin e kërkuar për aplikacionin tuaj. Ndërfaqja ANQR shfaqet në gjuhën e preferuar të secilit ekip, por cilësimet themelore të QR mbetën identike pavarësisht nga gjuha e ndërfaqes.', 'Kur ekipi japonez kishte nevojë për SVG për ekranet e shitjes me pakicë të nivelit të lartë dhe ekipit brazilian kishte nevojë për PNG për mediat sociale, të dyja të eksportuara nga i njëjti konfigurim. Kur shitësi i printimeve të ekipit gjerman kërkonte vlera specifike ngjyrash, ata mund t\'i referoheshin konfigurimit drejtpërdrejt në vend që të merrnin me mend nga një pamje ekrani.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Pamjet e ekranit që tregojnë të njëjtën lidhje konfigurimi u hapën në ndërfaqet japoneze, portugeze dhe gjermane',
          caption: 'I njëjti konfigurim, ndërfaqe të ndryshme: ekipet rajonale punojnë në gjuhën e tyre të preferuar duke ruajtur konsistencën globale',
        },
      ],
    },
    {
      heading: 'Trajtimi i variacioneve rajonale',
      paragraphs: ['Disa tregje kërkonin përshtatje të vogla. Ekipi kinez kishte nevojë për një version me një kornizë të optimizuar nga WeChat për ndarjen sociale. Në vend që të modifikonin masterin, ata krijuan një variant të dokumentuar me lidhjen e vet të konfigurimit, të etiketuar qartë si \'Varianti CN-WeChat\' në bibliotekën e aseteve të fushatës. Kjo ruajti gjurmueshmërinë duke lejuar lokalizimin e nevojshëm.', 'Ekipi i markës vendosi një rregull të thjeshtë: çdo ndryshim nga masteri kërkonte një lidhje të re, të dokumentuar konfigurimi. Asnjë modifikim në skedarët e eksportuar, pa \'rregullime të shpejta\' në softuerin e projektimit. Kjo parandaloi zhvendosjen e konfigurimit që kishte pllakosur lëshimet e mëparshme.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Një ndërfaqe e bibliotekës së aseteve që tregon konfigurimin kryesor dhe variantet e miratuara rajonale, secila me lidhjen e vet',
          caption: 'Qeverisja e aseteve të fushatës: konfigurimi kryesor plus variante të dokumentuara, të gjitha të gjurmueshme nëpërmjet lidhjeve të konfigurimit',
        },
      ],
    },
    {
      heading: 'Rezultatet e nisjes',
      paragraphs: ['Dita e prezantimit të produktit pa kode QR të vendosura në paketim, ekrane me pakicë, materiale ngjarjesh dhe fushata dixhitale në të 12 tregjet njëkohësisht. Auditimet e cilësisë konfirmuan qëndrueshmëri vizuale në të gjithë rajonet - QR në ekranet e shitjes me pakicë në Tokio përputhej me QR në paketimin e São Paulo përputhej me QR në banderolat e ngjarjeve në Berlin.', 'Zero dështime të skanimit u raportuan nëpër tregje. Kur nevojitej një ndryshim i URL-së së faqes së produktit pas lançimit, shërbimi i ridrejtimit e trajtoi atë në mënyrë të padukshme - nuk kërkohet riprintim. Ekipi global vlerësoi se qasja e lidhjes së konfigurimit kurseu 40+ orë kohë koordinimi në krahasim me metodologjinë e mëparshme të nisjes.', 'Shihni udhëzuesin Mësoni mbi bashkëpunimin ndërgjuhësor QR për parimet e rrjedhës së punës që qëndrojnë pas konsistencës globale të fushatës.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Një rrjet fotografish që tregon vendosjen e qëndrueshme të QR në tregje të ndryshme: shitje me pakicë në Tokio, paketim në São Paulo, ngjarje në Berlin',
          caption: 'Konsistenca globale e arritur: prezantim identik QR në 12 tregje pavarësisht gjuhëve, shitësve dhe formateve të ndryshme',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Shfletoni artikujt Mësoni',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Shfletoni artikujt Mësoni', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Hapni udhëzuesin e plotë të përdoruesit', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Hapni galerinë', type: 'gallery' },
  ],
};
