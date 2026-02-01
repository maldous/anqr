import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Ikasi ANQR-ekin',
  description: 'QR kodeak benetako marketin-aktibo bihurtzeko gida praktikoak, negozioak, ez soilik karratu funtzionalak. Ikasi salmenta-puntuetako kodeak berritzen, ordainketa-QR seinaleztapena sortzen, inprimatzeko prest dauden esportazioak prestatzen, pantaila digitaletan animazioa modu seguruan erabiltzen eta talde eleanitzetan blokeatutako konfigurazioak partekatu ANQR ("aingura") estekak erabiliz.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ireki sorgailua', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Ikusi QR adibideak', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Ireki Erabiltzailearen Gida osoa', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Dauden QR kanpainak hobetzea',
      paragraphs: ['Enpresa gehienek QR kodeak dituzte beren eragiketetan sakabanatuta: menuetan, erakusmahaietan, ontzietan eta sustapen-materialetan. Kode horietako asko duela urte batzuk sortu ziren oinarrizko sorgailuekin, eta, ondorioz, zuri-beltzeko karratu generikoak sortzen dira, ez dute konfiantzarik sortzen edo zure marka identitatearekin bat etortzen ez dutenak. Gida zabal honek lehendik duzun QR azpiegitura ikuskatzeko, berritzeko eta optimizatzeko ikuspegi sistematiko batean ibiltzen zaitu, dagoeneko ezarri dituzun bezeroen bidaiak eten gabe.', 'Zure QR kodeak ordezkatu beharrean eguneratzearen abantaila estrategikoa jarraitutasuna zaintzean datza. Zure bezeroek dagoeneko ikasi dute helmuga jakin batzuk espero dituztela zure kodeak eskaneatzen dituztenean. Kodetutako URLak berdinak mantenduz, ikus-entzunezko aurkezpena, eskanearen fidagarritasuna eta markaren lerrokatzea nabarmen hobetuz, konfiantza hobetzen duen trantsiziorik gabeko trantsizio bat sortzen duzu, zure azpiegitura digitalean edo analitiken jarraipenean inolako aldaketarik behar izan gabe.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Alboko alderaketa bat, lausotutako QR kode generiko bat erakusten duena, URL bera kodetzen duen markako bertsio moderno baten ondoan',
          caption: 'Aurretik eta ondoren: helmuga URL bera datatutako kode generiko batetik marka profesionaleko aktibo izatera pasa da',
        },
      ],
    },
    {
      heading: 'Zergatik Legacy QR Kodeek errendimendu gutxi dute',
      paragraphs: ['Adopzio goiztiarreko fasean sortutako QR kodeak -batez ere 2020-2021 bitartean enpresek kontakturik gabeko irtenbideak ezartzera presaka ibili zirenean- askotan arazo larri batzuk izaten dituzte. Erroreen zuzenketa baxuko ezarpenek hauskor bihurtzen dituzte testurazko gainazaletan inprimatzen direnean edo argiztapen zailarekin ikusten denean. Eremu lasai nahikoak eskaneatze hutsak eragiten ditu kodeak beste elementu bisualetatik gertu jartzen direnean. Estilo generikoak ez du markaren zilegitasuna komunikatzen, zalantzak eta eskaneaketa tasak murrizten ditu.', 'Muga teknikoetatik haratago, ondare-kodeek askotan galdutako marka aukerak adierazten dituzte. QR kode bakoitza zure bezeroarekiko ukipen-puntu bat da, aktiboki parte hartzen duten eta neurriak hartzeko prest dauden unea. Zure markaren koloreekin bat datorren estilo profesionaleko kode batek, segurtasun-marjina egokiak barne hartzen dituena eta marka hautazko elementuak dituena, erabilgarritasun hau interakzio bakoitzean zure identitatea indartzen duen marketin-aktibo bihurtzen du.'],
    },
    {
      heading: 'QR Kodeen Auditoria egitea',
      paragraphs: ['Hasi berritze-proiektua une honetan zure negozioan zabaldutako QR kode guztien inbentario osoa sortuz. Dokumentatu kokapen fisikoa, kodetutako helmuga, inprimatutako materialaren uneko egoera eta eskaneatzeko ingurune tipikoa, argi-baldintzak eta ikusteko angeluak barne. Probatu kode bakoitza gailu anitzekin - telefono zaharrek eta aurrekontu-gailuek maiz erakusten dituzte premium telefonoek estaltzen dituzten fidagarritasun-arazoak.', 'Arreta berezia jarri apustu handiko kokapenetako kodeak: ordainketa-puntuak, check-in-eremuak eta sustapen-pantailak, non eskaneatzea hutsegiteak diru-sarreretan edo bezeroaren esperientzian eragiten duen zuzenean. Horiei lehentasuna eman behar zaie berehala eguneratzeko. Kontuan izan argazki- edo bideo-edukietan agertzen diren kodeak ere, hauek zure marketin-taldearekin koordinazioa beharko baitute ikusizko aktiboak eguneratzeko.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'QR auditoria-kategoriak erakusten dituen kontrol-zerrenda interfazea: kokapena, egoera, eskaneatu fidagarritasuna eta lehentasun-balorazioa',
          caption: 'QR auditoria sistematikoko txantiloia zure bertsio berritzeko hautagaiak dokumentatzeko eta lehenesteko',
        },
      ],
    },
    {
      heading: 'Berritze-estrategia segurua',
      paragraphs: ['QR berritzeen arau nagusia helmuga kontserbatzea da. Atera ezazu lehendik dagoen kode bakoitzeko URL zehatza eta kodetu berdin-berdin zure bertsio berrian. Horrek bermatzen du lehendik dauden analisi guztiak, birbideratzeko logika eta bezeroen itxaropenak bere horretan mantentzen direla. Etorkizuneko eguneraketetarako helmuga-malgutasuna behar baduzu, hau da markako URL laburra edo birbideratze-zerbitzua sartzeko une aproposa, baina inplementatu hau aparteko proiektu gisa, aldaketak konposatu ez daitezen.', 'Ikus-berritzeko, aplikatu hobekuntzak geruzetan: lehenik eta behin, ziurtatu fidagarritasun teknikoa (erroreen zuzenketa egokia eta gune lasaia), ondoren gehitu markaren estiloa (koloreak, moduluen formak) eta, azkenik, kontuan hartu aukerako hobekuntzak (erdiko gainjartzeak, markoak). Geruza bakoitza probaren bidez balioztatu behar da aurrera egin aurretik. ANQR-ren Segurtasun Moduak lehentasun horiek betetzen laguntzen du, estilo-aukerek eskaneagarritasuna arriskuan jar dezaketenean ohartaraziz.'],
    },
    {
      heading: 'Markaren identitatea gehitzea fidagarritasuna arriskuan jarri gabe',
      paragraphs: ['QR marka eraginkorrak ikusmen-inpaktua eskaneatzeko fidagarritasunarekin orekatzen du. Hasi kolorez: ordezkatu lehen plano beltza lehen planoa zure markako kolore nagusiarekin, zure hondoarekiko kontraste nahikoa ziurtatuz. Marka gehienentzat, hondo argietan kolore ilunak funtzionatzen dute onena. Saihestu kontraste baxuko konbinazioak, ertzen argitasuna murrizten duten gradienteak edo argi-baldintza arruntetan antzekoak diren koloreak.', 'Moduluen forma pertsonalizatzeak beste marka aukera bat eskaintzen du fidagarritasun gutxieneko eraginarekin. Modulu biribilduek itxura leunagoa eta hurbilagoa sortzen dute, eskaneagarritasun bikaina mantenduz. Dot estiloko moduluek ondo funtzionatzen dute marka moderno eta teknologikoetarako. Konektatutako moduluak nortasun industrial edo korporatiboetara egokitzen dira. Aukeratzen duzun estiloa edozein dela ere, mantendu koherentzia zure QR inplementazio guztietan marka berehala ezagutzeko.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Kolore-gurpilaren diagrama QR kolore-konbinazio optimoak erakusten dituena, kontraste-erlazioaren adierazleekin',
          caption: 'Markaren kolorea aukeratzeko gidaliburua, eskaneatzea fidagarritasuna mantentzen duten kontraste handiko konbinazioak erakusten dituena',
        },
      ],
    },
    {
      heading: 'Proba eta Balioztatze Protokoloa',
      paragraphs: ['Inoiz ez zabaldu QR kode berrituak proba zorrotzik egin gabe. Inprimatu froga fisiko bat zure azken hedapenaren tamaina zehatzean eta material berean. Probatu kodea biziko den tokian, eguneko ordu desberdinetan, argiaren aldaerak kontuan hartzeko. Erabili gutxienez hiru gailu desberdin: egungo telefono enblematiko bat, gama ertaineko gailu bat eta zaharrago edo aurrekontuko telefono bat.', 'Grabatu azterketa-denborak eta arrakasta-tasak proba bakoitzeko. Ondo optimizatutako kode batek 1-2 segundotan eskaneatu beharko luke nahiko moderno gailu batean. Atzerapen edo hutsegite koherenteak ikusten ari bazara, murriztu estiloaren intentsitatea; kendu edo txikitu gainjartzeak, handitu gune lasaien tamaina edo aldatu erroreak zuzentzeko maila altuago batera. Fidagarritasuna beti du lehentasun bisualaren sofistikazioaren gainetik.'],
    },
    {
      heading: 'Zure konfigurazioa koherentziarako blokeatzea',
      paragraphs: ['Konfigurazio optimoa balioztatu ondoren, gorde ANQRren parteka daitezkeen estekak erabiliz. Honen bidez, onartutako kodea sortzeko erabilitako ezarpen guztien erregistro iraunkorra sortzen da: koloreak, modulu-estiloa, errore-zuzenketa, tamaina eta gainjartze guztiak. Partekatu esteka hau zure diseinu-taldearekin, inprimatze-saltzaileekin eta etorkizunean kodea erreproduzitu behar duen edonorekin.', 'Konfigurazio blokeo honek QR inplementazio asko eragiten dituen pixkanakako degradazioa saihesten du. Hori gabe, langileek pantaila-argazkietatik kodeak birsortzen dituzte, diseinatzaileek memoriatik ezarpenak berreraikitzen dituzte eta inprimatze-saltzaileek doikuntza "lagungarriak" egiten dituzte. Aldaera bakoitzak arazo potentzialak aurkezten ditu. Blokeatutako konfigurazio esteka batekin, erreprodukzio bakoitza probatutako eta onartutako jatorrizkoaren berdina da.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Konfigurazio-noraeza erakusten duen diagrama bat: aldaeretara bideratzen duten aisialdietara eramaten duten pantaila-argazkiak, egia iturriko esteka bakarraren aldean',
          caption: 'Saihestu konfigurazio-noraeza QR erreprodukzio guztietarako autoritate-iturri bakarra ezarriz',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Ikusi QR adibideak',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Txikizkako ordainketetarako QR kodeak',
      paragraphs: ['Ordainketa QR kodeak txikizkako ingurunerik zorrotzenean funtzionatzen dute: transakzioaren unean. Bezeroak ordaintzeko prest daude, sarritan ilara bat sortzen dute atzean, eta atzerapen segundo bakoitzak marruskadura sortzen du. Hala ere, presio handiko une hau marka sendotzeko higiezin nagusia ere bada. Gida honek banku-aplikazioetan berehala eskaneatzen diren ordainketa-QR kodeak nola sortu azaltzen du, bezeroen konfiantza sortzen duen marka-itxura profesional bat aurkezten duen bitartean.', 'Ordainketa QR kodeen oinarrizko printzipioa estetikaren gaineko fidagarritasuna da. Bezero baten banku-aplikazioan eskaneatzen ez duen kode eder batek diseinu kontserbadore batek inoiz egin dezakeen baino askoz gehiago kostatuko zaitu abandonatutako transakzioetan eta bezero frustratuetan. Hasi betetzetik, gehitu fidagarritasuna, eta gero arretaz jarri markak funtzio nagusia arriskuan jartzen ez duen tokian.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Smartphone batek banku-aplikazio batekin eskaneatzen ari den ordainketa-QR kodea erakusten duen txikizkako kontagailu pantaila',
          caption: 'Ordainketa QR kodeek berehala funtzionatu behar dute banku- eta zorro-aplikazioekin, mundu errealeko kontagailu baldintzetan',
        },
      ],
    },
    {
      heading: 'Ordainketa QR estandarrak ulertzea',
      paragraphs: ['Ordainketa QR kodeak normalean kargaren formatua agintzen duten eskualdeko estandarrak jarraitzen dituzte. Singapurren, PayNow QR-k formatu zehatza erabiltzen du. Indian, UPI kodeak BharatQR edo UPI deep link estandarrak jarraitzen dituzte. Europako SEPA ordainketek EPC QR kodeak erabiltzen dituzte. Estandar bakoitza banku-aplikazioek ordainketa-informazioa berehala ezagutu eta prozesatu dezaketela ziurtatzeko dago. Estandar horietatik aldenduz gero, nahiz eta apur bat, ordainketa-aplikazioek kamera-eskaner generikoek arazorik gabe irakurtzen dituzten kodeak baztertu ditzakete.', 'ANQR-k ordainketa estandar nagusien txantiloiak biltzen ditu, zure merkatariaren xehetasunak automatikoki formateatzen dituzten karga kargatuetan. Erabili beti txantiloi hauek ordainketa-kateak eskuz eraiki beharrean, formateatzeko errore txikiek ere transakzio-hutsak eragin ditzakete eta. Zure eskualdeko ordainketa estandarra txantiloi gisa erabilgarri ez badago, kontsultatu ordainketa-hornitzailearen dokumentazio teknikoa formatu-eskakizun zehatzak ezagutzeko.'],
    },
    {
      heading: 'Tamaina eta kokatzea erakusleihoetarako',
      paragraphs: ['Counter-top QR kodeak erronka fisiko bereziak dituzte. Bezeroek besoaren luzera eskaneatzen dute, askotan angelu batean, batzuetan doministiku babesleen edo erakusleihoen bidez. Goiko argiak distira-guneak sortzen ditu. Kodea beste kontrako nahasteekin lehiatzen da arretarako eta bista argietarako. Tamainatu zure ordainketa QR eskuzabal: gutxienez 4-5 cm-koa gomendatzen da mostradorearen aplikazio gehienetarako, eskalatzea kodea kristalaren atzean edo argi gutxiko eremu batean badago.', 'Posizioak tamainak bezainbeste du garrantzia. Jarri kodea bezeroek telefonoa eroso eutsi ahal izateko ilara blokeatu edo baldar heldu gabe. Inklinatu pantaila bezeroaren aldera laua jarri beharrean. Ahal izanez gero, erabili laminazio matea edo islatzen ez diren materialak, goiko argiaren distira gutxitzeko. Probatu azken kokapena eguneko ordu desberdinetan argiztapen arazoak ikusteko.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Kontadorearen konfigurazio desberdinetarako QR kokapen-altuera eta angelu optimoak erakusten dituen diagrama',
          caption: 'Kontadorea jartzeko gida: altuera, angelu eta distantzia optimoak ordainketa fidagarrian eskaneatzeko',
        },
      ],
    },
    {
      heading: 'Ordainketa-kodeetarako marka kontserbadorea',
      paragraphs: ['Ordainketa-aplikazioek kamera-eskaner generikoek baino ez dute barkatzen. Banku-aplikazio askok malgutasunerako baino abiadurarako optimizatutako QR irakurketa algoritmo zaharrago eta sinpleagoak erabiltzen dituzte. Horrek esan nahi du telefonoko kamerarekin ezin hobeto funtzionatzen duen estiloak ordainketa-aplikazio zehatzekin huts egin dezakeela. Mantendu marka kontserbadorea: erabili zure markaren kolorea lehen planorako kontraste handia mantentzen badu, baina saihestu errekonozimendua oztopa dezaketen gradienteak, gainjartze astunak edo dekorazio-elementuak.', 'Zentroko logotipoa edo gainjarri bat nahi baduzu, mantendu oso txikia (QR eremuaren % 10-15 baino gehiago ez) eta proba sakona zure bezeroek erabil ditzaketen ordainketa-aplikazio guztietan. Enpresa askok ordainketa-kodeetan ez gainjartzea aukeratzen dute bereziki, estilo hori QR kodeak merkaturatzeko erreserbatuz fidagarritasun-eskakizunak ez hain zorrotzak diren. Ordainketa-kodearen lana transakzioak prozesatzea da, ez bisualki hunkitzea.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Ordainketa QR kodeetarako marka onargarriak eta arriskutsuak dituzten mailak erakusten dituen konparaketa',
          caption: 'Ordainketa QR markaren espektroa: estilo kontserbadore segurutik dekorazio-ikuspegi arriskutsuetara',
        },
      ],
    },
    {
      heading: 'Materiala eta inprimaketa gogoetak',
      paragraphs: ['Pantaila fisikoko materialak eskanearen fidagarritasuna nabarmen eragiten du. Laminazio distiratsuak goiko argiak zuzenean islatzen ditu bezeroaren kameran. Testuradun materialek moduluaren ertzak desitxuratu ditzakete. Inprimatze merkeak xehetasunak lausotu ditzake. Ordainketa QR kodeak egiteko, inbertitu kalitatean: erabili ijezketa matea edo satinatua, ziurtatu bereizmen handiko inprimaketa eta ordezkatu pantailak higadura erakutsi aurretik. Ordainketa-kode urratuak edo lausotuak kosta egiten zaizu transakzioak.', 'Kontuan hartu pantailaren iraunkortasuna eta ordezkagarritasuna. Mostradoreko pantailak ukitu, mugitu, zipriztindu eta noizean behin irauli egiten dira. Diseina ezazu zure bistaratze-sistema QR txertaketa erraz ordezkatu ahal izateko stand osoa ordeztu gabe. Mantendu prest ordezko inprimaketak, blokeatutako konfigurazio-estekatik sortutakoak, gastatutako kodeak berehala trukatu ahal izateko.'],
    },
    {
      heading: 'Ordainketa errealen aplikazioekin probak',
      paragraphs: ['Kamera-eskaner orokorrek ia zentzuzko formateatutako QR kode guztiak deskodetuko dituzte. Ordainketa-aplikazioak altuagoak dira. Ordainketa QR kodea zabaldu aurretik, proba ezazu bezeroek erabil ditzaketen ordainketa-aplikazio guztietan. Ordainketa anitzeko inguruneetan, horrek banku-aplikazio, zorro digital eta ordainketa-plataforma anitzekin probak egitea esan nahi du. Dokumentatu zein aplikazio probatu dituzun eta haien bertsioak: ordainketa-aplikazioak maiz eguneratzen dira, eta eguneratzeak eskaneatzeko portaera alda dezake.', 'Proba baldintza errealetan: benetako pantaila, benetako argia, benetako eskaneatzeko distantzia. Zure mahaian berehala eskaneatzen duen kode batek erakusmahaian borrokan egon liteke arratsaldeko 5etan arratsaldeko eguzkiak distira sortzen duenean. Probatu aurki dezakezun telefono zahar eta merkeenarekin; aurrekontuko gailu batean modu fidagarrian funtzionatzen badu, denetan funtzionatuko du. Markatu 2 segundo baino gehiagoko edozein eskaneatu denbora ikertzeko eta balizko birdiseinurako.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Ordainketa-aplikazio, gailu mota eta ingurune-baldintza ezberdinak erakusten dituen proba-zerrenda',
          caption: 'Ordainketa QR probaren matrize integrala aplikazioak, gailuak eta ingurumen-faktoreak biltzen dituena',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Ikusi QR adibideak',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Inprimatzeko prest dauden QR kodeak: SVG eta PNG',
      paragraphs: ['Primeran eskaneatzen duen QR kode baten eta askotan huts egiten duenaren arteko aldea inprimatzeko lan-fluxuan esportatu eta kudeatu zenaren araberakoa da. Gida honek bektorial (SVG) eta raster (PNG) formatuen arteko bereizketa kritikoak azaltzen ditu, bakoitza noiz erabili eta QR artelanak nola entregatu diseinatzaileei eta inprimatu saltzaileei eskaneatze fidagarritasuna negozio-txarteletatik iragarki-tamainako seinaleztapenera arte.', 'Inprimatze-ekoizpenak pantailan existitzen ez diren aldagaiak sartzen ditu: tinta hedatzea, substratuaren ehundura, akabera-prozesuak eta hainbat fitxategi-bihurketen efektu metatua. Zure diseinu-softwarean itxura ezin hobea duen QR kode bat atera daiteke inprimagailutik ertz leunekin, kontraste murriztuarekin edo modu sotilki distortsionatutako moduluekin. Formatu-hautaketa eta lan-fluxuaren jardunbide onenak ulertzeak huts isil horiek saihesten ditu.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Ikuspegi handitua, QR modulu bektorialak ertz kurruskariekin alderatuz, pixel artefaktuak erakusten dituzten raster moduluekin alderatuz.',
          caption: 'Bektorea vs raster inprimatze eskalan: eskaneatzeko fidagarritasuna zehazten duen zehaztasun-aldea',
        },
      ],
    },
    {
      heading: 'Zergatik nahiago da Vector (SVG) inprimatzeko',
      paragraphs: ['SVG fitxategiek QR kodeak forma matematiko gisa deskribatzen dituzte, pixelen sareta baino. Horrek esan nahi du kodea edozein tamainatara eskala daitekeela (1 cm-ko etiketa batetik 10 metroko pankartara) ertzaren zorroztasuna galdu gabe. Inprimagailuaren RIP (Raster Image Processor) bektoreak irteerako gailuaren jatorrizko bereizmenean errendatzen ditu, moduluaren ertz bakoitza hardwareak ahalbidetzen duen bezain zorrotza dela ziurtatuz. Ez dago interpolaziorik, ez aliasaren aurkako artefaktuak, ez dago metatutako lausotzerik tamaina aldatzeko eragiketa anitzetan.', 'Eskalagarritasunetik haratago, SVG fitxategiak sendoagoak dira lan-fluxu profesionaletan. Diseinu-softwarearen bidez joan-etorrietan bizirik irauten dute degradatu gabe. Kolorea zuzendu daitezke berriro laginketarik gabe. PDF fitxategietan garbi txertatzen dute prentsarako prest ateratzeko. Kalitatea garrantzitsua den edozein inprimatzeko aplikazioetarako, SVG zure esportazio formatu lehenetsia izan beharko litzateke.'],
    },
    {
      heading: 'PNG Onargarria denean',
      paragraphs: ['PNG beharrezkoa bihurtzen da zure lan-fluxua edo helmuga plataformak formatu bektorialak onartzen ez dituenean. Zenbait web-plataformak, seinaleztapen-CMS sistemak eta inprimatze-lan-fluxu zaharrak raster irudiak behar dituzte. Kasu hauetan, PNG ondo funtziona dezake, baina arau zorrotzak jarraitzen badituzu: esportatu azken tamaina fisikoan eta bereizmenean, ez handitu inoiz esportatu ondoren eta saihestu galerarik gabeko konpresio edo formatu bihurtzerik.', 'PNG-ren arau kritikoa esportatu aurretik behar diren pixel-dimentsioak kalkulatzea da. Zure QR 5 cm-ra inprimatuko bada eta inprimagailuak 300 DPI-n funtzionatzen badu, 590 pixel beharko dituzu gutxi gorabehera. Esportatu tamaina honetan edo handiagoan, gero eskalatu behar izanez gero, inoiz ez igo. Sartu informazio hau zure fitxategi-izen edo metadatuetan, etorkizuneko erabiltzaileek tamaina zehatzeko esportazio bat nahi gabe gaizki erabili ez dezaten.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Tamaina fisikoaren, DPIaren eta beharrezko pixel-dimentsioen arteko erlazioa erakusten duen kalkulagailu-interfazea',
          caption: 'Inprimatze-bereizmenaren kalkulagailua: zure helburuko irteera-tamainaren gutxieneko pixel-dimentsioak zehaztea',
        },
      ],
    },
    {
      heading: 'ANQR esportazio aukerak azalduta',
      paragraphs: ['ANQR-k hainbat SVG esportatzeko modu eskaintzen ditu lan-fluxu ezberdinetara egokitzeko. True Vector moduak bideetan oinarritutako irteera hutsa sortzen du, inprimatzeko eta diseinu profesionaletarako tresnetarako aproposa. Raster gainjarri edo efektu jakin batzuk gehitu dituzunean, ANQR-k hauek txerta ditzake modulu bektorialak mantenduz, edo guztiz rasterizatutako bertsio bat esportatu dezakezu zehaztutako bereizmenarekin. Aukera hauek ulertzeak erabilera-kasu bakoitzerako esportazio egokia aukeratzen laguntzen dizu.', 'PNG esportazioetarako, ANQR-k dimentsio zehatzak zehazten uzten dizu eta hondo gardenetarako aukerak barne hartzen ditu. DPI ezarpenak inprimatzeko tamaina egokiak kalkulatzen laguntzen dizu, baina gogoratu DPI metadatuak direla; inprimatzeko axola duena zure tamaina fisikorako pixel nahikoa izatea da. Zalantzarik baduzu, esportatu behar duzula uste baino handiagoa; eskalatzeak kalitatea mantentzen du, igotzeak suntsitzen du.'],
    },
    {
      heading: 'Handoff-erako fitxategiak prestatzen',
      paragraphs: ['QR artelanak diseinatzaileei edo inprimaketa-saltzaileei pasatzean, sartu zehaztapen argiak: aurreikusitako tamaina fisikoa, gutxieneko gune lasaien baldintzak eta kolore-espazioaren edozein kontu. Aplikazio kritikoetarako, eman SVG maisua eta bereizmen handiko PNG babeskopia, nahi dituzten erabilerekin argi eta garbi markatuta. Sartu zure ANQR konfigurazio esteka, behar izanez gero kodea birsortu ahal izateko.', 'Esku-hartze prozesuan ohiko akatsak aurreikustea. Esplizituki adierazi QR ez dela eskalatu, biratu, okertu edo eraginik aplikatu behar. Zehaztu gune lasaiak garbi egon behar duela: ez da mozketa-markarik, erregistro-markarik edo diseinu-elementurik sartu. QR koloretako edo argazki-hondo batean jarriko bada, eman atzealde opakua duen bertsio bat kontraste egokia bermatzeko.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'SVG maisua, PNG babeskopia, zehaztapenen dokumentua eta konfigurazio esteka erakusten dituen fitxategi-pakete diagrama',
          caption: 'QR entrega-pakete profesionala: diseinatzaile edo inprimatze-saltzaile batek behar duen guztia erreprodukzio zehatza lortzeko',
        },
      ],
    },
    {
      heading: 'Inprimatutako frogak egiaztatzea',
      paragraphs: ['Inoiz ez onartu inprimaketa bat froga fisiko bat eskaneatu gabe. Eskatu benetako substratuan inprimatutako froga bat ekoizpenean erabiliko den benetako akaberarekin. Eskaneatu froga azken pieza erakutsiko den lekuaren antzeko argi-baldintzetan. Probatu hainbat gailurekin, kalitate marjinala izan dezaketen telefono zaharragoekin barne.', 'Froga poliki edo koherentziarik gabe eskaneatzen bada, ikertu onartu aurretik. Arazo ohikoenak hauek dira: koloretako substratuetan kontraste nahikorik ez izatea, mozketak eragindako gune lasaien urraketak, tinta hedatzea leuntzeko moduluen ertzak edo laminazioa distira sortzen duena. Horietako edozein bidera daiteke inprimaketa osoa egiteko konpromisoa hartu aurretik, baina froga-fasean harrapatzen badituzu soilik.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Froga berrikusteko kontrol-zerrenda, eskaneatu proben emaitzekin, kontraste-neurketekin eta onespen sinadurarekin',
          caption: 'Inprimatu frogak egiaztatzeko lan-fluxua: proba sistematikoak ekoizpen-kopuruekin konpromisoa hartu aurretik',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Ikusi QR adibideak',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'QR kode animatuak sortzea',
      paragraphs: ['QR kode animatuek QR kode estandarren funtzionaltasuna konbinatzen duten mugimendu deigarriarekin konbinatzen dituzte, eta horrek ikaragarri handitzen ditu konpromiso tasak. Seinaleztapen digitalean, sare sozialetan eta pantaila interaktiboetan, animazioak erabilgarritasun estatiko bat erakartzen du begia erakartzen duen eta elkarrekintza gonbidatzen duen elementu bisual sinesgarri batean. Gida honek ikusmen-inpaktua ematen duten bitartean modu fidagarrian eskaneatzen duten animaziozko QR kodeak sortzeko printzipioak, teknikak eta muga praktikoak biltzen ditu.', 'Animaziozko QR kodeen oinarrizko erronka ikusmen-interesa eskaneatze fidagarritasuna eta fidagarritasuna orekatzea da. Fotograma bakoitzak banaka eskaneatu behar du - eskaner batek animazio-zikloko edozein unetan har dezake kodea. Muga honek diseinuaren erabaki bakoitzari forma ematen dio: zein elementu mugi daitezkeen, zenbat alda daitezkeen eta zer egonkor egon behar duen animazioan zehar.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Seinale digitalaren pantaila, QR kode animatu bat erakusten duena, ikuslearen arreta erakartzen duena espazio publiko batean',
          caption: 'QR kode animatuak seinaleztapen digitalean: arreta erakartzen duen eta eskaneatzea bultzatzen duen mugimendua',
        },
      ],
    },
    {
      heading: 'Animazioak nola eragiten duen eskaneagarritasuna',
      paragraphs: ['QR eskanerrek fotograma bakarra harrapatzen dute eta modulu argien eta ilunen eredua aztertzen dute. Kode animatu batek funtziona dezan, fotograma bakoitzak baliozko QR eredu osoa eduki behar du. Horrek baztertzen ditu kode-egitura aldatzen duten, moduluak desegiten edo kontraste-eredua nabarmen aldatzen duten animazioak. Datuak garraiatzeko moduluak -erdialdean itxuraz ausazko eredua - bisualki egonkor mantendu behar dute.', 'Animazio seguruen planteamenduek daturik ez daramaten elementuak aldatzen dituzte: atzeko planoak, koloreak, marko apaingarriak eta gainjarritako elementuak. Egitura-osagaiek - bilatzaile-ereduak (izkina-lauki handiak), denbora-ereduak (lerro txandakatuak) eta lerrokatze-ereduak (lauki txikiak kode handiagoetan) - beren posizioak eta proportzioak mantendu behar dituzte. Muga horien barruan lan egiteak animazio harrigarri dinamikoak eta erakargarriak egiteko aukera ematen du.'],
    },
    {
      heading: 'Funtzionatzen duten animazio teknikak',
      paragraphs: ['Koloreen txirrindularitzak paleta baten bidez lehen planoko eta atzeko planoko koloreak animatzen ditu, pauso bakoitzean kontraste nahikoa mantenduz. Horrek arreta erakargarria duen efektu bizia sortzen du eskaneatzeko arrisku minimoarekin, betiere kontrastea irakur daitekeen mailatik behera jaisten ez den bitartean. ANQR-ren kolore-zikloaren aurrezarpenak ziklo osoan zehar eskaneagarritasuna mantentzeko diseinatuta daude.', 'Gainjartze animatuek QR eredu erdi-garden baten atzean jartzen dituzte mugitzen diren irudiak. Kodea egonkor mantentzen da atzeko planoa animatzen den bitartean - agian bideo-loop bat, animaziozko markako elementuak edo mugimendu grafiko abstraktuak. Teknika honek intentsitatea kudeatu behar du hondoak QR eredua gaindi ez dezan, baina emaitza ikusgarrienak sortzen ditu.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'QR animatu baten geruza-egitura erakusten duen diagrama bat: kode-geruza egonkorra atzeko geruza animatuaren gainean',
          caption: 'Animazio-geruzaren printzipioa: QR eredua konstante mantentzen da atzeko planoko elementuak azpian animatzen diren bitartean',
        },
      ],
    },
    {
      heading: 'Animazio-parametroak konfiguratzea',
      paragraphs: ['Fotograma-tasak ikusmen-leuntasunari eta fitxategi-tamainari eragiten die. Aplikazio gehienetarako, segundoko 10-15 fotogramak itxura leuna ematen du fitxategien tamainarik gabe. Fotograma-tasa handiagoak errentagarritasun bisual txikiagoak eskaintzen ditu fitxategien tamainak nabarmen handitzen dituen bitartean. Kontuan hartu zure bidalketa-testuingurua: seinale digital handi batek mugikorreko iragarkiak jartzea baino fitxategi handiagoak kudea ditzake.', 'Begizta-jokaerak animazioaren zikloak zehazten du. Loturarik gabeko begizkek etengabeko mugimendua sortzen dute seinaleztapenerako eta inguruneko pantailetarako aproposa. Ping-pong (aurrera-gero-atzera) begiztak ondo funtzionatzen du animazio sinpleetarako. Arreta erakartzen duten pultsuak lortzeko, kontuan hartu atxikimenduak dituzten animazioak: etengabeko mugimenduaren nekerik gabe begia erakartzen duten mugimenduek marrazten duten gelditasun-aldiak.'],
    },
    {
      heading: 'Gainjartze animatuak sortzea',
      paragraphs: ['Animaziozko irudiak (GIFak, animaziozko WebPak edo bideoak) gainjarri gisa erabiltzean, ANQR-k fotogramak ateratzen ditu eta zure QR kodearekin konposatzen ditu. Gainjartze-intentsitatearen ezarpenak animazioaren zenbateraino erakusten den kontrolatzen du: balio baxuek eskaneagarritasuna lehenesten dute, eta balio altuek inpaktu bisuala hobetzen dute. Probatu aukeratutako intentsitatea hainbat fotogramatan eskaneagarritasun koherentea ziurtatzeko.', 'Jatorrizko materialaren kalitateak nabarmen eragiten du emaitzetan. Erabili gainjartzeak gai argiekin eta kontraste onarekin. Saihestu noizean behin kontraste baxuko fotogramak sor ditzaketen distira azkarrak edo muturreko distira-aldaketak dituzten iturri-animazioak. Aurreikusi animazio-ziklo osoa esportatu aurretik, eskaneatzen huts egin dezaketen fotograma arazotsuak harrapatzeko.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Gainjarri animazio baten fotogramaz fotograma ikuspegia, sekuentzia osoan mantendutako kontraste-mailak erakusten dituena',
          caption: 'Markoen analisia: animazio-ziklo osoan zehar eskaneagarritasun koherentea egiaztatzea',
        },
      ],
    },
    {
      heading: 'Esportazio eta entregatzeko gogoetak',
      paragraphs: ['GIF animazio-formaturik onartuena izaten jarraitzen du, eta testuinguru gehienetan automatikoki erreproduzitzen da bideo-erreproduzitzaileen laguntza behar izan gabe. Hala ere, GIFaren 256 koloreko paletak koloreen fideltasuna mugatzen du. Kolore kritikoko animazioetarako, kontuan hartu WebP animatua onartzen den tokian, edo itzuli bideo formatuetara kalitaterik handiena lortzeko. ANQR-en GIF esportazioak dithering aukerak biltzen ditu paleta mugen barruan kalitatea maximizatzeko.', 'Fitxategiaren tamaina garrantzitsua da entregatzeko. Errotulazio digitalaren sistemek, posta elektronikoko bezeroek eta plataforma sozialek askotan tamaina mugak ezartzen dituzte. Zure animazioak muga horiek gainditzen baditu, murrizteko fotograma-kopurua, dimentsioak edo kolore-sakonera. Batzuetan, animazio konplexu bat begizta laburrago batean zatitzeak emaitza hobeak lortzen ditu fotograma guztiak degradatzen dituen konpresio oldarkorra baino.'],
    },
    {
      heading: 'Animaziozko QR kodeak probatzen',
      paragraphs: ['Kode animatuak probatzeko animazio-zikloko hainbat puntutan eskaneatu behar da. Ez eskaneatu behin eta arrakasta izan; eskaneatu behin eta berriz, une ezberdinetan, fotograma bakoitza irakurgarria dela egiaztatzeko. Arreta berezia jarri kolore-zikloaren muturreko markoei edo kontrastea baxuena izan daitekeen gainjarritako intentsitate-gailurretan.', 'Probatu benetako pantailaren hardwarean, ahal denean. Monitorearen koloreen kalibrazioak, ikuspegi angeluak eta giroko argiak eragiten dute animazioa nola agertzen den eta eskaneatzen den moduan. Zure monitorean ezin hobeto eskaneatzen den animazio distiratsua kanpoko pantaila batean garbitu daiteke edo ikuste-angelu zeiharretan irakurezin bihur daiteke.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Proba-matrize bat, fotograma, gailu eta pantaila-baldintza ezberdinetan eskaneatzeko arrakasta-tasak erakusten dituena',
          caption: 'QR probaren protokolo animatua: egiaztapen sistematikoa fotograma, gailu eta ikusteko baldintzen artean',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Ikusi QR adibideak',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR Segurtasun eta betetze praktika onak',
      paragraphs: ['Eskaneatzen ez duen QR kode eder bat alferrikakoa baino okerragoa da: bezeroak zapuzten ditu, markaren pertzepzioa kaltetzen du eta bere sorkuntzan eta banaketan inbertitutako baliabide guztiak xahutzen ditu. Gida honek QR kode bat modu fidagarrian eskaneatuko den ala ez zehazten duten faktore teknikoak eta praktikoak biltzen ditu, eta ANQRren segurtasun-eginbideak nola erabili arazo potentzialak produkziora iritsi aurretik nola erabili.', 'QR kodearen fidagarritasuna ez da bitarra. Baliteke kode batek ezin hobeto eskaneatzea telefono enblematikoetan, baina huts egin dezake aurrekontuko gailuetan. Baliteke argiztapen ezin hobean funtzionatzea, baina jatetxe ilunetan edo eguzki-argi distiratsuetan borrokatzen da. Eskaneagarritasuna eragiten duten faktoreak ulertzeak estilo bisualaren eta mundu errealeko fidagarritasunaren arteko truke informatuak egiten laguntzen dizu.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'QR kodeak erakusten dituen fidagarritasun-espektroa, oso eskaneagarriak eta gutxi irakurgarriak arte',
          caption: 'Eskaneatzeko espektroa: balen aurkako kodeetatik fidagarritasun-mugak bultzatzen dituen estilora',
        },
      ],
    },
    {
      heading: 'Erroreen zuzenketa-mailak ulertzea',
      paragraphs: ['QR kodeek erredundantzia integratua dute, partzialki hondatuta edo iluntuta egonda ere irakur daitezkeela ahalbidetzen duena. Erroreak zuzentzeko mailak - L (% 7), M (% 15), Q (% 25) edo H (% 30) - kodearen zenbat falta izan daitekeen zehazten du behar bezala deskodetzen den bitartean. Erroreen zuzenketa handiagoak kode handiagoak sortzen ditu, baina gainjarrietarako, inprimatzeko akatsetarako eta ingurumen-kalteetarako segurtasun-marjina eskaintzen du.', 'Irudi-gainjartzeak dituzten kodeetarako, erroreak zuzentzeko H maila ezinbestekoa da; gainjartzeak fisikoki ezkutatzen du kodearen zati bat, eta % 30eko erredundantzia hori behar duzu fidagarritasuna mantentzeko. Ingurune kontrolatuetan estilorik gabeko kode garbietarako, M maila nahikoa izaten da. L maila kodearen tamaina kritikoki mugatuta dagoen egoeretarako gorde behar da eta baldintza ezin hobeak berma ditzakezu.'],
    },
    {
      heading: 'Lasaitasun Gune Kritikoa',
      paragraphs: ['Zona lasaia QR kode bakoitza inguratzen duen marjina hutsa da. Eskanerrek muga hori erabiltzen dute kodea non hasten eta bukatzen den identifikatzeko. ISO arauak lau moduluko gutxieneko gune lasaia zehazten du (kodeko karratu txikienaren zabalera lau aldiz). Espazio hau urratzea (diseinu-elementuekin, ertz moztuekin edo ondoko edukiarekin) eskaneatze hutsegiteen kausa ohikoenetako bat da.', 'ANQR-en gune lasaiak betearazteak tarte kritiko hori mantentzen laguntzen du, baina zure azken diseinuetan ere kontserbatzen dela ziurtatu behar duzu. QR artelanak entregatzerakoan, zehaztu esplizituki gune lasaien baldintzak. Kodeak diseinuetan jartzerakoan, egiaztatu ez dela elementurik sartzen espazio honetan. Espazio garbi batzuk milimetro batzuk eskaneatze fidagarriaren eta bezero frustratuen arteko aldea esan dezake.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Eremu lasaien arteko tarte zuzena erakusten duen diagrama bat, eskaneatutako hutsegiteak eragiten dituzten urraketa arrunten aldean',
          caption: 'Zona lasaiaren eskakizunak: eskaneatze arrakasta zehazten duen marjina ikusezina',
        },
      ],
    },
    {
      heading: 'Kontrastea eta Koloreen Segurtasuna',
      paragraphs: ['QR eskanerrek modulu argien eta ilunen eredua detektatzen dute. Kontraste hori murrizten duen edozein estilok (lehen plano argiak, atzealde ilunak, degradatu efektuak edo opakotasun gutxiko gainjartzeak) kodea irakurtzea zailagoa da. ANQR-k kontraste-erlazioak kalkulatzen ditu eta zure kolore-aukerak maila arriskutsuetara hurbiltzen direnean ohartarazten du, baina azken arbitroa mundu errealeko probak egiten ditu beti.', 'Koloreen pertzepzioa argi-baldintzen arabera aldatzen da. Zure monitorean kontraste handiko ageri den kolore-konbinazioa zaila izan daiteke bereiztea argi gori epeletan edo hodi fluoreszente hotzetan. Zure kodea argiztapen-baldintza desberdinetan zabalduko bada, probatu hainbat argi-iturritan eta kontuan hartu kontraste erlazio kontserbadoreagoak segurtasun-marjina gisa.'],
    },
    {
      heading: 'Moduluaren tamaina eta bistaratzeko distantzia',
      paragraphs: ['Modulu indibidualen tamaina fisikoak kode bat eskaneatu ahal izateko gehienezko distantzia zehazten du. Modulu txikiagoek kode txikiagoak esan nahi dituzte, baina eskaneatzeko distantzia hurbilagoak behar dituzte. Arau orokorra da modulu bakoitzak gutxienez 0,5 mm-koa izan behar duela aurreikusitako eskaneatzeko distantzian, proportzionalki handituz distantzia handiagoetarako. Karteldegi bateko kode batek bisita-txarteleko kode batek baino modulu askoz handiagoak behar ditu.', 'Moduluaren tamaina kalkulatzerakoan, kontuan hartu kasurik txarrena: telefono zaharrago bat duen bezeroa, argiztapen inperfektuan, ahalik eta distantzia maximoan eskaneatzen. Erabiltzaile honentzako diseinua eta beste guztiek esperientzia are hobea izango dute. ANQR-ren tamaina-gomendioak mundu errealeko aldagai hauek hartzen ditu kontuan, nahi duzun erabilerarako neurri egokiak iradokitzeko.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Moduluaren tamaina, inprimatze-dimentsioak eta eskaneatzeko distantzia eraginkor maximoa erlazionatzen dituen taula',
          caption: 'Eskaneatzeko distantzia-gida: moduluaren tamaina zure inplementazio-baldintzekin bat etortzea',
        },
      ],
    },
    {
      heading: 'ANQR Segurtasun Modua erabiliz',
      paragraphs: ['ANQR-en Segurtasun Moduak denbora errealeko iritzia ematen du eskaneatu fidagarritasunari buruz. Kontraste-erlazioak, gune lasaiak betetzen dituena, gainjartzearen intentsitatea eta eskaneagarritasuna eragiten duten beste faktore batzuk kontrolatzen ditu. Parametroren bat arrisku-mailara hurbiltzen denean, fidagarritasuna hobetzeko jarraibide zehatzak dituzten abisuak ikusiko dituzu. Porrotak garestia diren inplementazio profesionaletarako, mantendu Segurtasun-modua aktibo diseinu-prozesu osoan.', 'Segurtasun-moduak eskaneatzea egiaztatzeko eginbide bat ere badakar, sortutako kodea deskodetzen saiatzen dena eta arrakasta edo porrotaren berri ematen duena. Aplikazio barruko egiaztapen honek mundu errealeko baldintza guztiak errepikatu ezin dituen arren, ohiko arazo asko aurkitzen ditu inprimatzeko edo banatzeko inbertitu aurretik. Tratatu egiaztapen arrakastatsua gutxieneko barra gisa, ez berme gisa - mundu errealeko probak ezinbestekoak dira.'],
    },
    {
      heading: 'Mundu errealeko proba-protokoloak',
      paragraphs: ['Software-egiaztapenak ez du proba fisikoak ordezkatzen. Inprimatu zure kodea nahi den tamainan material adierazgarrian. Probatu benetako hedapen-ingurunean erabilera errealarekin bat datozen argi-baldintzekin. Eskaneatu hainbat gailurekin, ez zure telefono enblematikoekin bakarrik, baita aurrekontuko Android gailuekin, iPhone zaharrekin eta zure publikoak erabili ohi dituen gailu zehatzekin ere.', 'Dokumentatu zure probak sistematikoki. Erregistratu zein gailu probatu diren, zein baldintzatan, zein emaitzekin. Kodeak eskalan zabaltzen ari bazara, ezarri onarpen-irizpideak: beharbada % 95eko arrakasta-tasa zure gailuaren proba-multzoan, edo 2 segundoko epean azterketa arrakastatsuak probatutako gailu guztietan. Arau hauek hoberenaren esperantza izan beharrean, joan-etorriko erabakiak objektiboak izaten laguntzen dute.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Gailuak, baldintzak eta onarpen-irizpideak biltzen dituen proba-zerrenda integrala',
          caption: 'QR hedatze-protokoloa probatzeko protokoloa: ekoizpen-konpromisoaren aurretik egiaztatze sistematikoa',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Ikusi QR adibideak',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Ikusi QR adibideak', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Ireki Erabiltzailearen Gida osoa', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Ireki galeria', type: 'gallery' },
  ],
};
