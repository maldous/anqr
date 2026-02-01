import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR Adibideak',
  description: 'Mundu errealeko bost adibide, QR kodeak balio neurgarria non sortzen duten erakusten duten: txikizkako txikizkako kontagailu kode tradizional bat hobetzea, markako txikizkako ordainketak eta "eskaneatzeko" ekintzak, flyeretatik iragarkietara inprimatzeko eskalatzea, seinaleztapen digitalerako QR animatua eta hizkuntza anitzeko lankidetza parteka daitezkeen Anchor estekak erabiliz. Adibide bakoitzak irudiak, murrizketa praktikoak eta sorgailura itzultzeko remix esteka bat biltzen ditu.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ireki sorgailua', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Arakatu Ikasi artikuluak', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Ireki Erabiltzailearen Gida osoa', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Kasu praktikoa: Txikizkako Counter QR Uplift',
      paragraphs: ['Mundu errealeko adibide honek hiru urtez euren mostradorean QR kode bera erabiltzen ari zen kafetegi txiki baten atzetik dator. Jatorrizko kodea azkar sortu zen pandemiaren presan, paper estandarrean inprimatu eta plastikozko euskarri batean sartu zen. Oraindik funtzionatzen zuen - teknikoki - baina bezeroek askotan saiakera ugari behar izan zituzten eskaneatzeko, eta ez zuen ezer egin kafetegiaren marka-identitatea arretaz landutakoa indartzeko.', 'Eraldaketa auditoria sinple batekin hasi zen: lehendik zegoen kodeak kafetegiaren lineako menuaren URLa kodetzen zuen, eta gorde nahi zuten. Erronka zen QR kafetegiaren esperientziaren parte sentitzea 2020tik aurrera pentsatutako erabilgarritasun bat baino.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'QR kode meteorizatu bat plastikozko euskarri batean, higadura agerikoa, hatz-markak eta lausotutako inprimaketa erakusten dituena',
          caption: 'Abiapuntua: hiru urteko leihatila-zerbitzuak jatorrizko QR-a apenas funtzionatzen utzi zuen',
        },
      ],
    },
    {
      heading: 'Jatorrizko kodearen arazoak diagnostikatzea',
      paragraphs: ['Probak hainbat arazo agerian utzi zituen: jatorrizko kodeak Erroreen zuzenketa L erabiltzen zuen (gutxieneko erredundantzia), 2 modulu baino ez zituen gune lasaia zuen eta bereizmen baxuan inprimatzen zen. Kafetegiko tungsteno-argi beroaren azpian, jada lausotutako modulu beltzek ia kontraste egiten zuten paper horiztatuarekin. Telefono zaharrenek borrokan zeuden; telefono berriek arrakasta izan zuten baina atzerapen nabarmenarekin.', 'Arazo teknikoetatik haratago, zuri-beltzeko karratu generikoak ez zuen markari buruz ezer komunikatzen. Bezeroek eskaneatu aurretik zalantzan jarri zuten - kafetegiaren arreta handiz diseinatutako menu digitalarekiko konpromisoa murrizten zuen konfiantzazko oztopo sotila.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Jatorrizko QRren gabezia teknikoak erakusten dituen diagnostiko gainjartzea: ECC baxua, gutxieneko zona lasaia, kontraste eskasa.',
          caption: 'Azterketa teknikoak agerian uzten du ondare-kodeak mundu errealeko baldintzetan zer-nolako funtzionamendua izan duen',
        },
      ],
    },
    {
      heading: 'Igoera Prozesua',
      paragraphs: ['ANQR erabiliz, kafetegiaren jabeak kodea birsortu zuen menuaren URL berdinarekin, baina ezarpenak nabarmen hobetu zituen: Errore-zuzenketa H erresilientzia maximorako, muga fidagarria detektatzeko 6 moduluko gune lasaia eta kafetegiaren barruko paletarekin bat datozen markaren koloreak (borgoina sakoneko moduluak atzeko planoan).', 'Kafetegiaren logotipoa zuen erdiko gainjarri txiki bat gehitu zen; nahita sotila mantendu zen eskaneagarritasuna mantentzeko, marka berehalako errekonozimendua emanez. Segurtasun-moduak diseinu berria inprimatu baino lehen proba-gailuetan modu fidagarrian eskaneatu dela baieztatu du.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Konfigurazioa erakusten duen ANQR interfazea: markaren koloreak, ECC egokia, isil-gune eskuzabala, logoaren gainjartze sotila',
          caption: 'Konfigurazio berritua eraikitzea: marka-espresioa eta eskaneatzeko fidagarritasuna orekatzeko aukeratutako ezarpen guztiak',
        },
      ],
    },
    {
      heading: 'Emaitza neurgarriak',
      paragraphs: ['QR berria mate-laminatutako txartel profesionaletan zabaldu ondoren, kafetegiak lau astetan egin zituen emaitzen jarraipena. Eskaneatzeko arrakasta-tasa % 70 ingurutik % 100 ingurura hobetu da. Batez besteko eskaneaketa-denbora 3-4 segundotik segundo 1 baino gutxiagora jaitsi da. Esanguratsuena, menuen konpromisoa % 40 handitu zen; lehen QRri begiratua eman eta amore eman zuten bezeroek konfiantzaz eskaneatzen ari ziren orain.', 'Langileek bezeroei galdera gutxiago eman zizkieten "QR-a nola erabili"-ri buruz eta ez zuten URLa eskuz idazteko kasu gehiago bezero frustratuentzat. Markaren itxurak ere elkarrizketak piztu zituen, bezeroek diseinu kohesionatuari positiboki komentatu baitzuten.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Neurriekin aurretik/ondoren alderaketa: eskaneatu arrakasta-tasa, eskaneatzeko batez besteko denbora eta asteko eskaneaketa-zenbaketa hobekuntzak',
          caption: 'Lau asteko datuek QR igoera gogotsu baten eragin neurgarria erakusten dute',
        },
      ],
    },
    {
      heading: 'Birsortu konfigurazio hau',
      paragraphs: ['Kafetegiaren konfigurazioak marka kontserbadorea baina eraginkorra erakusten du: erroreen zuzenketa H, 6 moduluko gune lasaia, kontraste handiko markaren koloreak eta erdiko gainjartze minimoa. Balantze honek txikizkako kontagailu aplikazio gehienetarako funtzionatzen du, non fidagarritasuna izan behar duen lehena baina markaren presentzia oraindik garrantzitsua den.', 'Ireki sorgailua ezarpen hauek aurrez kargatuta eta egokitu koloreak eta gainjartzea zure markara. Funtsezko ikuspegia: fidagarritasunaren hobekuntzak soilik ikaragarri handitu dezakete konpromisoa, nahiz eta ikusizko estilorik gehitu aurretik.', 'Ikusi erlazionatutako Ikasi gida lehendik dauden QR kanpainak hobetzeko ikuspegi honen atzean dagoen metodologia osoa lortzeko.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Lotu kafetegiaren ezarpenekin aurrez konfiguratutako sorgailura berehala pertsonalizatzeko',
          caption: 'Hasi konfigurazio frogatu batekin eta pertsonalizatu zure markarako',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Arakatu Ikasi artikuluak',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Kasu praktikoa: ordainketa anitzeko kontagailuaren pantaila',
      paragraphs: ['Adibide honek bere erregistroan bost QR kode ezberdin pilatu zituen arropa-denda baten atzetik dator: bankuko ordainketa, aholkuak, Instagram, Google-ren iritziak eta kontratazio-esteka. Bakoitza iturri ezberdin batetik sortu zen, une ezberdinetan inprimatu eta bat ez datozen standetan erakutsi zen. Kaosa bisuala dendaren arretaz zaindutako estetika ahultzen ari zen, eta langileek aldizka kode okerra eskaneatzen zuten bezeroei aurre egiten zien.', 'Irtenbideak kezkak bereiztea eskatzen zuen: ordainketa-kodeek fidagarritasun handiena behar zuten estilo kontserbadorearekin, eta marketin-kodeek adierazgarriagoak izan zitezkeen bitartean. Sortu zen bistaratzeko sistema bateratuak erakusten du nola orekatzen duen markaren presentzia QR erabilera-kasu desberdinen eskakizun funtzionalekin.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Erregistro eremu nahasi bat, hainbat stand eta material inprimatuetan bat ez datozen bost QR kode erakusten dituena',
          caption: 'Abiapuntu kaotikoa: deskonektatutako bost QR kode arretarako lehian eta bezeroen nahasmena eragiten dute',
        },
      ],
    },
    {
      heading: 'Ordainketa-esperientziari lehentasuna ematea',
      paragraphs: ['Dendaren ordainketa-metodo nagusiak karga karga zorrotza betetzea eskatzen zuen eskualdeko estandarra erabiltzen zuen. Testek agerian utzi zuten estilo txikiek ere eskaneatzeko abiadura eragiten zutela banku-aplikazio jakin batzuekin. Erabakia: mantendu ordainketa QR guztiz aldatu gabe tamaina optimizatzea eta txartel mateen inprimaketa profesionala izan ezik.', 'Ikuspegi kontserbadore honek ordainketa-kodeak ezin hobea baino "marka" gutxiago zuela esan nahi zuen, baina transakzioak burutzeko tasak izugarri hobetu ziren. Ikuspegia: ordainketa-uneak ez dira marka aukerak; fidagarritasun-uneak dira. Bezeroek abiadura eta ziurtasuna estimatzen dituzte estetikaren gainetik dirua tartean denean.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Ordainketa QR kode garbi eta handi bat txartel mate profesionalean, erregistroan nabarmen kokatuta',
          caption: 'Ordainketa QR: tamaina handikoa, modu profesionalean inprimatua, estilo kontserbadorea, banku-aplikazioek berehala aitortzeko',
        },
      ],
    },
    {
      heading: 'Bigarren mailako ekintza pantaila sortzea',
      paragraphs: ['Aholkuak, iritziak, sare sozialak eta kontratazioetarako, denda adierazgarriagoa izan daiteke. Kode hauek ANQRn birsortu ziren marka-estilo koherentearekin: dendaren sinadura oliba berdea krema gainean, modulu biribilduaren estiloa eta dendaren ikonoaren erdiko gainjarri sotila. Errore-zuzenketak H-k fidagarritasuna bermatzen zuen estiloarekin ere.', 'Lau kode hauek ordainketa-kodearen ondoan kokatutako markako panel batean kokatu ziren (konpetentziarik gabe). Dendaren tipografiako etiketa argiek kode bakoitzaren helburua azaltzen zuten. Hierarkia bisuala nahita zegoen: ordainketa bakarrik eta nabarmena zen; aukera gisa bildutako bigarren mailako ekintzak.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Aholkuak, iritziak, sare sozialak eta kontrataziorako lau QR kode erakusten dituen markako panela, etiketa argiekin',
          caption: 'Bigarren mailako ekintzen panela: marka koherentea, etiketa argia, distrakzioa baino aukera gisa kokatuta',
        },
      ],
    },
    {
      heading: 'Bistaratzeko sistemaren diseinua',
      paragraphs: ['Pantaila fisikoak hainbat arazo konpondu zituen aldi berean. Ordainketa-postuak zein bigarren mailako panelak material mateak erabiltzen zituzten goiko argiaren distira ezabatzeko. Altuerak altuera desberdineko bezeroentzat optimizatu ziren. Bezeroen ilarara zuzendutako angeluak, mostradorean laua baino.', 'Larriki, dendak blokeatutako ANQR konfigurazio esteketatik ordezko inprimaketak sortu zituen. Aholkuen kodea azkenean kafea zipriztindu zenean, langileek minutu gutxiren buruan ordeztu zuten gordetako konfigurazioa erabiliz - ez pantaila-argazkirik, ez ezarpenak asmatzen, ez kalitatearen degradazioa.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Pantaila fisikoaren diseinua erakusten duen diagrama bat: altuerak, angeluak, materialak eta ordainketa eta bigarren mailako pantailen arteko erlazioa',
          caption: 'Bistaratzeko sistemaren planoa: ergonomia fisikoa bezeroen altueran eta argi-baldintzetan eskaneatze fidagarrirako optimizatua',
        },
      ],
    },
    {
      heading: 'Operazio Hobekuntzak',
      paragraphs: ['Inplementatu eta sei astera, dendak hobekuntza esanguratsuak dokumentatu zituen: bezeroen kexarik ez "kode okerra" nahasmenari buruz, transakzio-denbora azkarragoak eta propinen bidalketak hiru aldiz handitu ziren (bezeroek aholku-kodea aurkitu eta eskaneatu ahal izan zuten langileei trakets galdetu gabe). Google-ren iritziak ere gora egin zuen QR dedikatu eta ongi etiketatuak marruskadura kendu zuen heinean.', 'Langileen prestakuntza errazagoa bihurtu zen: "ordainketa kodea da handia, gainerako guztia panelean dago". Ordainketa-aplikazioak eguneratu zirenean eta laburki eskaneatze motelagoa erakutsi zuenean, ordainketa-kodeen diseinu kontserbadoreak esan nahi zuen oraindik funtzionatzen zuela - apur bat motelago huts egin beharrean.', 'Ikusi txikizkako ordainketetarako QR kodeei buruzko Ikasi gida pantaila-sistemaren diseinu honen printzipioei buruz.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Aurretik/ondoko konparaketak erakusten dituen neurketa-panel bat: nahasmen-gertaerak, transakzio-denbora, aholkuen maiztasuna, berrikuspenen bidalketak',
          caption: 'Sei asteko datu operatiboek QR anitzeko pantaila-sistema pentsakor baten negozioaren eragina erakusten dute',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Arakatu Ikasi artikuluak',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Kasu praktikoa: Bisita-txarteletik Karteldegira',
      paragraphs: ['Adibide honek hitzaldi garrantzitsu baterako prestatzen ari den ekitaldi ekoiztetxe bat jarraitzen du. QR kode bera behar zuten -ekitaldiaren aplikazioarekin lotzen zuen- formatu guztiz desberdinetan zabalduta: parte-hartzaileen txapak (3 cm), mahai-karpan txartelak (8 cm), izen-emate mahaiaren seinaleztapena (30 cm), bide-ezarpeneko kartelak (60 cm) eta eszenatokiaren atzealdeko pankarta erraldoi bat (4 metro). Formatu bakoitzak ikusteko distantzia, argi-baldintza eta ekoizpen-fluxu desberdinak zituen.', 'Erronka ez zen teknikoa soilik, operatiboa zen. Saltzaile anitzek inprimaketa-lan desberdinak kudeatzen zituzten, eta konpainiak emaitza koherenteak eta eskaneagarriak ziurtatu behar zituen nork ekoizten zuena edozein izanda ere. Haien irtenbidea SVG esportazioan eta eskualdaketaren dokumentazio zorrotzean zentratu zen.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Bost tamaina ezberdinetan zabaldutako QR kode bera erakusten duen collage bat, txapatik pankartaraino',
          caption: 'QR kode bat, bost hedapen-tamaina: zentimetroetatik metroetara eskaneagarritasuna mantentzearen erronka',
        },
      ],
    },
    {
      heading: 'Zergatik izan zituzten arazoak aurreko gertaerek',
      paragraphs: ['Azken hitzaldian, konpainiak porrot lotsagarriak izan zituen. QR eszenarako pankarta PNG txiki gisa sortu zen eta diseinu-softwarean handitu zen. Emaitza onargarria zirudien urrunetik, baina ezin izan zuen ikusleengandik fidagarri eskaneatu. Txapa QR-ak gehiegizko estiloa eta txikiegia ziren, eta parte-hartzaileak kontaktuak gehitzen saiatzen ziren frustranteak. Formatuetan zehar ezarpenak ez-koherenteak esan nahi du QR "berak" itxura desberdina zuela pieza bakoitzean.', 'Gertaera osteko analisiak arrazoi nagusia agerian utzi zuen: egia iturri bakarra ez. Diseinatzaile bakoitzak QR birsortu zuen ezarpen apur bat desberdinekin, eta inprimatze-saltzaile bakoitzak fitxategiak modu ezberdinean prozesatu zituen. Fitxategien eskualdaketen telefono-jokoaren bidez kalitatea degradatu da.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Eskaneatutako akatsak erakusten dituzten lehen planoko argazkiak: pixelatutako banner-moduluak, txapa-kode txikiak, formatu guztietan estilo koherentea',
          caption: 'Aurreko gertaeren hutsegiteen azterketa forentsea: formatu bakoitzak kalitate arazo desberdinak sartu zituen',
        },
      ],
    },
    {
      heading: 'SVG-Lehenengo lan-fluxua',
      paragraphs: ['Gertaera honetarako, konpainiak protokolo zorrotz bat ezarri zuen: ANQRn sortutako QR maisu bat ezarpen optimoekin (Erroreen zuzenketa H, gune lasai zabala, estilo garbia), SVG gisa esportatu eta iturri autoritario bakar gisa gordeta. ANQR konfigurazio esteka SVG fitxategiarekin batera dokumentatu zen, behar izanez gero kodea birsortu ahal izateko.', 'Diseinatzaile eta saltzaile guztiek SVG maisu bera jaso zuten argibide esplizituekin: jarri behar den tamainan, ez aldatu, mantendu gune lasaia. Raster formatuak behar dituzten saltzaileei, konpainiak aurrez errendatutako PNGak eman zituen tamaina zehatzetan, nahi den erabilera adierazten duten izendapen-konbentzio argiekin.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'SVG maisua, tamainako PNGak, zehaztapen dokumentua eta konfigurazio esteka erakusten dituen fitxategi-paketea',
          caption: 'Handoff paketea: saltzaileek behar zuten guztia emaitza koherenteak lortzeko asmatu gabe',
        },
      ],
    },
    {
      heading: 'Tamaina-Berariazko gogoetak',
      paragraphs: ['Formatu bakoitzak arreta berezia behar zuen. 3 cm-ko txapa-txertatzeek QR-a behar zuten gehieneko espazio librea okupatzeko - eskaneatzeko distantzia besoaren luzera izango litzateke. 8 cm-ko ohol-dendak eremu lasaitik kanpo apaingarriak izan ditzakete. 4 metroko pankartak kalkulua behar zuen: ikusleen distantzia arruntetik (15-20 metro), moduluak telefono-kamerek argi eta garbi bereizi behar zituzten, hau da, QR-ak gutxienez 80 cm-ra egon behar zuen pankartaren diseinuan.', 'Konpainiak dimentsio-gida bat sortu zuen espero zen eskaneatzeko distantzia bakoitzeko QR gutxieneko dimentsioak dokumentatzen dituena. Hau etorkizuneko ekitaldietarako berrerabil daitekeen aktibo bihurtu zen, diseinu prozesutik asmakizunak kenduz.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Gertaeren formatu bakoitzeko eskaneatzeko distantziaren, QR minimoaren tamainaren eta moduluen dimentsioen arteko erlazioa erakusten duen grafikoa',
          caption: 'Tamaina-matrizea: kalkulatutako dimentsioak eskaneatzea fidagarria bermatuz formatu bakoitzaren bistaratzeko distantzian',
        },
      ],
    },
    {
      heading: 'Ekoizpen Emaitzak',
      paragraphs: ['Konferentzia eguneko baliozkotzea sistematikoa izan zen: langileek inplementatutako QR guztiak probatu zituzten ateak ireki aurretik. Txapa txertatzeak berehala eskaneatu dira beso luzera. Mahai-dendak modu fidagarrian funtzionatzen zuen geltokietako argiztapen aldakorrean. Eszenatokiaren pankarta - aurreko ekitaldiaren lotsa - arrakastaz eskaneatu da ikusle-eremuaren erditik.', 'Zero eskaneatutako kexa erregistratu ziren 2.000 parte-hartzaile baino gehiagotan. Irabazi operatiboa ere esanguratsua izan zen: azken orduko babeslearen gehikuntzak seinaleztapen berria behar zuenean, produkzio taldeak SVG maisutik sortu zuen minutu batzuetan, beste guztiarekin bat egingo zuela ziur.', 'Ikusi inprimatzeko prest dauden QR kodeei buruzko Ikasi gida SVG eta PNG erabaki-esparrurako eta eskualdaketa-jardunbide egokietarako.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Ekitaldien argazkia, parte-hartzaileei QR kodeak arrakastaz eskaneatzen ari diren tokian zehar hainbat tamaina eta distantziatan',
          caption: 'Konferentziaren egunaren arrakasta: formatu guztietan eskaneatzea fidagarria, txapelen lehen planoetatik hasi eta eszenako pankartaren distantziako planoetaraino',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Arakatu Ikasi artikuluak',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Kasu praktikoa: Aireportuko Egongela pantaila digitala',
      paragraphs: ['Adibide honek harrera-pantaila digitaletan QR kode estatikoak erabiltzen ari diren hegazkin-konpainia-egongela bat jarraitzen du. Pantailek sustapen-eduki birakaria erakusten zuten, baina egongelan fakturatzeko QR kodea izkina batean eserita zegoen, estatiko eta erraz ahaztu egiten zen. Analytics-ek erakutsi zuen gonbidatu hautagarrien % 15ek soilik erabiltzen zuten QR check-in-a, nahiz eta mahaiko ilara baino azkarragoa izan. Gonbidatu gehienek ez zuten konturatu.', 'Hipotesia sinplea zen: mugitzen den edukia duen ikusmen lanpetuta dagoen ingurune batean, QR estatiko bat ikusezina bihurtzen da. Irtenbideak QR nabarmena izan dadin behar zuen fakturazio-fluxurako behar den fidagarritasuna arriskuan jarri gabe, non hutsegiteak bidaiariak zapuztuta eta mahai-ilara luzeagoak ekarriko lituzkeen.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Pantaila digital bat aireportuko egongela batean, izkinan QR kode txiki eta estatiko batekin sustapen-edukia erakusten duena',
          caption: 'Jatorrizko konfigurazioa: QR estatiko bat sustapen-eduki dinamikoen itsaso batean galduta, %15eko adopzioa baino ez da lortu.',
        },
      ],
    },
    {
      heading: 'Animazio segurua diseinatzea',
      paragraphs: ['Egongelako seinaleztapen digitalak LED panel handiak erabiltzen zituen - ingurune zaila non animazio oldarkorrak eskaneatzeko arazoak sor ditzakeen. Diseinu taldea modu kontserbadoreaz hasi zen: pultsu efektu leuna, QR-aren ikusmen presentzia sotilki zabaldu eta uzkurtu zuen benetako kodearen egitura aldatu gabe. Fotograma-denbora motela ezarri zen (250 ms) LED freskatze-abiadurarekin keinu-arazorik ekiditeko.', 'Segurtasun-moduaren baliozkotzeak berretsi du fotograma guztiak eskaneatzen jarraitzen duela. Benetako LED paneletan egindako proba gehigarriek agerian utzi zuten pultsuak mahaigaineko aurrebistak iradokitakoa baino are sotilagoa izan behar zuela - LED distira eta ikusmen-angeluak uste baino gehiago eragiten zuten hautematen kontrastea.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR animazio-ezarpenen panela pultsuaren konfigurazioa erakusten du: denbora motela, intentsitate sotila, Segurtasun modua gaituta',
          caption: 'Animazio-konfigurazioa: LED paneleko pantailarako sintonizatutako parametroak fotograma guztietan eskaneatzeko fidagarritasuna mantenduz',
        },
      ],
    },
    {
      heading: 'Seinaleen edukiarekin integratzea',
      paragraphs: ['QR animatua pantaila-diseinuko "zona egonkor" dedikatu batean kokatu zen; eremu hori etengabe mantentzen zen sustapen-edukia bistaratze-eremu nagusian biratzen zen bitartean. Bereizketa hori funtsezkoa zen: QR-ak ikusmen egonkortasuna behar zuen eskaneatzeko, nahiz eta arreta erakartzen zuen animazio sotilen bidez.', 'Ekintzarako dei argi bat gehitu zen QR-aren ondoan: "Saltatu ilara - eskaneatu erregistratzeko". Testua estatiko mantendu zen QR-ak pultsatzen zuen bitartean, eta hierarkia bisual bat sortuz, eskaneatzeko aukerari begia erakarri zion sustapen-edukia larritu gabe.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Pantaila-diseinuaren diagrama, QR animatua eremu egonkor batean erakusten duena, sustapen-edukia eremu nagusian biratzen den bitartean',
          caption: 'Pantaila higiezinen esleipena: QR animatuak sustapen-eduki birakarietatik bereizten den eremu egonkor bat hartzen du',
        },
      ],
    },
    {
      heading: 'Inplementazio Teknikoa',
      paragraphs: ['QR animatua GIF gisa esportatu da seinaleztapen CMSrako ezarpen optimizatuekin. Fitxategien tamainari buruzko gogoetak garrantzi handia zuen: aretoko edukiak kudeatzeko sistemak kargatzeko mugak zituen, eta fitxategi handiegiek erreprodukzioaren toteltasuna eragiten zuten. Azken esportazioak ikusizko kalitatea orekatu zuen fitxategiaren tamainaren aurrean, kolore-paleta mugatuz eta fotograma kopurua optimizatuz.', 'Inplementazioak ordezko bat barne hartzen zuen: GIFak edozein arrazoirengatik erreproduzitzen ez bazuen, seinaleztapen-sistemak PNG babeskopia estatiko bat erakutsiko luke. Erredundantzia honek animazioaren arazo teknikoengatik ez zela inoiz galduko egiaztatzeko gaitasuna bermatu zuen.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'CMS interfazea QR animatua kargatzea erakusten duena, ordezko irudi estatikoa konfiguratuta',
          caption: 'Seinaleztapenaren CMS konfigurazioa: animazio nagusia erreserba estatikoarekin fakturazio-gaitasuna inoiz eteten dela bermatuz',
        },
      ],
    },
    {
      heading: 'Neurtutako Eragina',
      paragraphs: ['Hilabeteko funtzionamenduaren ondoren, QR check-in-a hartzea % 15etik % 24ra igo zen, % 60ko hobekuntza erlatiboa. Gonbidatuen iritzien inkesten arabera, QR animatua "errazagoa da antzematen" eta "modernoagoa iruditzen zaio". Mahaigaineko ilara-denborak nabarmen gutxitu ziren puntako garaietan, gonbidatu gehiago QR bidez autozerbitzua izan zen eta.', 'Garrantzitsua da, zero eskaneatze hutsegite jakinarazi zirela egunero milaka azterketa egin arren. Animazio-ikuspegi kontserbadoreak arreta-helburua lortu zuen check-in-fluxu batek eskatzen zuen fidagarritasunari uko egin gabe. Egongela gero, antzeko QR animatuak zabaldu zituen beste kokapenetara.', 'Ikusi seinaleztapen digitalerako QR kode animatuei buruzko Ikasi gida animazio seguruaren diseinuaren atzean dauden printzipio teknikoetarako.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Adopzio-tasa handitzea, ilara-denbora murriztea eta hutsegiterik gabeko eskaneatzeko fidagarritasuna erakusten duen panela inplementazio-aldian zehar',
          caption: 'Hilabeteko datuak: % 60ko adopzioa handitu, ilara-denborak murriztu eta eskaneatzeko fidagarritasun perfektua mantendu da',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Arakatu Ikasi artikuluak',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Kasu praktikoa: Global Product Launch QR Campaign',
      paragraphs: ['Adibide honek produktu berri bat aldi berean merkaturatzen duen kontsumo-elektronika-enpresa batek 8 hizkuntzatan 12 merkatutan jarraitzen du. Eskualdeko marketin-talde bakoitzak produktu lokalizatuen orrietara lotzen dituzten QR kodeak dituzten ontziak, txikizkako pantailak eta sustapen-materialak ekoitzi behar zituen. Aurreko abiarazteek QR estilo koherentea, noizbehinkako eskaneatze akatsak eta konfigurazio-noraezeko "telefono joko" bat eragin zuten, talde bakoitzak pantaila-argazkietatik kodeak birsortzen zituen bitartean.', 'Irtenbideak ANQRren konfigurazio-esteka partekagarriak aprobetxatu zituen eskualdeko talde guztiek atzi zezakeen egia-iturri bakarra ezartzeko, interfazearen hizkuntza edozein dela ere. QR kargak erabiltzailearen hizkuntza detektatzen zuen birbideratze adimendun bat erabiltzen zuen, beraz, kode batek globalki funtzionatu zuen esperientzia lokalizatuak eskaintzen zituen bitartean.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'QR kodeekin 12 merkatu-kokapen erakusten dituen munduko mapa bat, batzuk elkarren artean ikusmen inkoherenteak',
          caption: 'Erronka: 12 merkatu, 8 hizkuntza eta eskualdeetan QR inplementazio koherenteen historia',
        },
      ],
    },
    {
      heading: 'Konfigurazio Nagusia ezartzea',
      paragraphs: ['Marka-talde globalak QR konfigurazio autoritarioa sortu zuen ANQR-en: marka-koloreak produktu-lerroaren ikus-identitatearekin bat datozenak, Errore-zuzenketa H aplikazio inprimatu eta digital guztietan fidagarritasuna lortzeko, eta estiloa etengabe erreproduzituko litzatekeen tokiko ekoizpen-metodoak kontuan hartu gabe. Konfigurazioa blokeatu zen eta partekatzeko esteka kanpaina globalaren laburpenean dokumentatu zen.', 'Larriki, kodetutako URLak hizkuntza detektatzeko birbideratze-zerbitzua erabili zuen. Eskaneatu zutenean, erabiltzaileak automatikoki bideratzen ziren bertako hizkuntzako produktuen orrira. Horrek esan nahi du 12 merkatu guztiek QR kode berdinak erabil ditzakete - akatsak sor ditzakeen merkatu bakoitzeko karga-aldaketarik ez.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR interfazea marka koloreekin, ECC H eta birbideratze URL adimendunarekin konfigurazio nagusia erakusten duena',
          caption: 'Konfigurazio nagusia: marka globalaren estandarrak egia-iturri bakar batean kodetuta',
        },
      ],
    },
    {
      heading: 'Eskualdeko taldeen lan-fluxua',
      paragraphs: ['Eskualdeko marketin-talde bakoitzak argibide errazekin jaso zuen konfigurazio-esteka: ireki esteka, egiaztatu aurrebista markaren jarraibideekin bat datorrela, esportatu zure aplikaziorako behar den formatuan. ANQR interfazea talde bakoitzaren hobetsitako hizkuntzan bistaratzen zen, baina azpiko QR ezarpenak berdinak izaten jarraitzen zuen interfazearen hizkuntza edozein izanda ere.', 'Japoniako taldeak SVG behar zuenean goi mailako txikizkako pantailetarako eta Brasilgo taldeak PNG behar zuen sare sozialetarako, biak konfigurazio beretik esportatu ziren. Alemaniako taldearen inprimatze-saltzaileak kolore-balio zehatzak eskatzen zituenean, konfigurazioa zuzenean erreferentzia egin zezakeen pantaila-argazki batetik asmatzea baino.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Konfigurazio-esteka bera erakusten duten pantaila-argazkiak japoniera, portugesa eta alemaneko interfazeetan irekita daude',
          caption: 'Konfigurazio bera, interfaze desberdinak: eskualdeko taldeek nahiago duten hizkuntzan lan egiten dute, koherentzia globala mantenduz',
        },
      ],
    },
    {
      heading: 'Eskualdeko aldaerak maneiatzea',
      paragraphs: ['Merkatu batzuek egokitzapen txikiak behar zituzten. Txinako taldeak WeChat-en optimizatutako marko batekin bertsio bat behar zuen sare sozialetan partekatzeko. Maisua aldatu beharrean, dokumentatutako aldaera bat sortu zuten konfigurazio-esteka propioarekin, kanpainaren aktiboen liburutegian argi eta garbi "CN-WeChat aldaera" gisa etiketatuta. Horrek trazabilitatea mantendu zuen beharrezko lokalizazioa ahalbidetzen zuen bitartean.', 'Marka taldeak arau sinple bat ezarri zuen: maisuaren edozein aldakuntzak konfigurazio-esteka berri eta dokumentatua behar zuen. Esportatutako fitxategietan aldaketarik ez, ez dago "konponketa azkarrik" diseinu-softwarean. Horrek aurreko abian jarritako konfigurazio-noraeza saihestu zuen.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Konfigurazio nagusia eta onartutako eskualde-aldaerak erakusten dituen aktiboen liburutegiko interfazea, bakoitza bere esteka batekin',
          caption: 'Kanpainaren aktiboen gobernantza: konfigurazio nagusia gehi dokumentatutako aldaerak, guztiak konfigurazio esteken bidez traza daitezke',
        },
      ],
    },
    {
      heading: 'Abiarazi emaitzak',
      paragraphs: ['Produktuen aurkezpen egunean QR kodeak zabaldu ziren aldi berean ontzietan, txikizkako pantailetan, gertaeren materialetan eta kanpaina digitaletan 12 merkatuetan. Kalitate-ikuskaritzek ikusizko koherentzia berretsi zuten eskualde guztietan - Tokioko txikizkako pantailetan QR bat dator São Pauloko ontzien QR-arekin bat dator Berlingo ekitaldietako pankartarekin.', 'Zero eskaneatzeko hutsegiteak merkatu guztietan jakinarazi ziren. Abian jarri osteko produktuaren orriaren URL-aldaketa behar zenean, birbideratze-zerbitzuak modu ikusezinan kudeatzen zuen, ez zen berriro inprimatu behar. Talde globalak konfigurazio-loturaren ikuspegiak koordinazio-denbora 40+ ordu aurreztu zuela kalkulatu zuen aurreko abiarazteko metodologiarekin alderatuta.', 'Ikusi QR arteko lankidetzari buruzko Ikas gida kanpaina globalaren koherentziaren atzean dauden lan-fluxuaren printzipioak ezagutzeko.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Merkatu ezberdinetan QR hedapen koherentea erakusten duten argazki-sare bat: Tokioko txikizkako salmenta, São Pauloko ontziak, Berlingo ekitaldiak',
          caption: 'Lortutako koherentzia globala: QR aurkezpen berdina 12 merkatutan hizkuntza, saltzaile eta formatu desberdinak izan arren',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Ireki sorgailua',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Arakatu Ikasi artikuluak',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Arakatu Ikasi artikuluak', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Ireki Erabiltzailearen Gida osoa', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Ireki galeria', type: 'gallery' },
  ],
};
