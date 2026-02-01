import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Aprèn amb ANQR',
  description: 'Pràctic, guies de negocis per convertir codis QR en actius reals, no només quadrats funcionals. Apreneu a actualitzar els codis de punts heretats, creeu una signatura del pagament QR compatible amb el pagament QR, prepareu les exportacions de la impressió, useu l\' animació segura en les pantalles digitals i compartiu les configuracions tancades a través d\' equips multilingüe usant els enllaços ANQR ("anchor").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Obre el generador', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Obre la guia completa d\' usuari', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Millores existents',
      paragraphs: ['La majoria de negocis tenen codis QR escampats per les seves operacions - en menús, el comptador és, l\'empaquetament i materials promocionals. Molts d\'aquests codis es van crear fa anys amb generadors bàsics, resultants en quadrats negres i blancs genèrics que no inspiraven confiança o coincideixen amb la vostra identitat de marca. Aquesta guia completa us porta a través d\'una aproximació sistemàtica auditar, actualitzar, i optimitzar la infraestructura QR existent sense trencar els viatges dels clients que ja heu establert.', 'L\'avantatge estratègica d\'actualitzar en comptes de substituir els codis QR es troba en preservar la continuïtat. Els vostres clients ja han après a esperar certs destins quan escanegeu els codis. En mantenir els URL codificats idèntics mentre millora radicalment la presentació visual, la fiabilitat de l\' exploració i l\' alineació de la marca, creeu una transició robusta que millora la confiança sense demanar cap canvi a la vostra infraestructura digital o un seguiment anàlisi.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Una comparació lateral mostrant un codi QR gastat, genèric al costat d\' una versió marcada moderna codificació de la mateixa URL',
          caption: 'Abans i després: La mateixa URL de destí transformada des d\' un codi genèric amb data a un actiu en marca professional',
        },
      ],
    },
    {
      heading: 'Per què s\'ha heretat el codi QR sota forma',
      paragraphs: ['Els codis QR van crear durant la fase d\'adopció de principis - sobretot durant 202021 quan els negocis es van precipitar per implementar solucions sense contacte - sovint pateixen de diversos problemes crítics. Els valors de correcció d\' errors baixos els fan fràgils quan s\' imprimeixen en superfícies amb textures o veuen sota il· luminació desafiant. No hi ha prou zones tranquil·les per a explorar els errors quan els codis es col·loquen prop d\' altres elements visuals. L\'estiment genèric no falla en comunicar la legitimitat de marca, cosa que fa a dubtar i reduir les taxes d\'escanejat.', 'Més enllà de les limitacions tècniques, els codis heretats sovint representen oportunitats de marca. Cada codi QR és un punt de contacte amb el vostre client, un moment en què estan compromesos activament i disposats a actuar. Un codi d\' estil professional que concordi amb els vostres colors de marca, inclou marges de seguretat apropiats, i característiques opcionals dels elements marcats transforma aquesta utilitat en un actiu de màrqueting que reforça la vostra identitat a cada interacció.'],
    },
    {
      heading: 'Conductora un auditoria del codi QR',
      paragraphs: ['Comenceu el projecte d\'actualització creant un inventari complet de cada codi QR actualment usat pel vostre negoci. Documenta la localització física, el destí codificat, la condició actual del material imprès, i l\' entorn d\' exploració típic incloent les condicions d\' il· luminació i els angles de visualització. Proveu cada codi amb múltiples dispositius - els telèfons intel·ligents i dispositius de pressupostos antics sovint revelen problemes de fiabilitat que la màscara de telèfons mòbils més gran.', 'Paga atenció particular als codis en les localitzacions d\'alta resolució: punts de pagament, àrees de selecció i pantalles promocionals on el fracàs d\' exploració impacta directament els ingressos o l\'experiència de clients. Això hauria d\'estar previitzat per a l\'actualització immediata. També tingueu en compte codis que apareixen en el contingut de la fotografia o del vídeo, ja que això requerirà coordinació amb el vostre equip de màrqueting per actualitzar actius visuals.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Una interfície de llista de comprovació que mostra categories d\'auditoria QR: ubicació, condició, fiabilitat de l\' exploració i puntuació prioritat',
          caption: 'Plantilla d\'auditoria Systematic QR per documentar i prioritzar els vostres candidats d\'actualització',
        },
      ],
    },
    {
      heading: 'L\' estratègia d\'actualització dels Safe',
      paragraphs: ['La regla cardinal de les actualitzacions QR és la preservació del destí. Extreu l\' URL exacte de cada codi existent i codifica\' l idènticament a la vostra nova versió. Això assegura que tots els anàlisi existents, la lògica redireccionat i les expectatives dels clients segueixen intactes. Si necessiteu una flexibilitat de destí per a futures actualitzacions, aquest és el moment ideal per introduir un servei URL o redireccionat curt - però implementar això com a un projecte separat per evitar canvis composts.', 'Per a l\' actualització visual, apliqueu millores en capes: primer assegureu- vos de la fiabilitat tècnica (correcció d\' errors no apropiada i zona horària), després afegiu l\' execució de la marca (colors, formes de mòdul), i finalment considereu millores opcionals (registres, marcs). Cada capa ha de ser validada a través de la prova abans de procedir. El mode de seguretat de l\'ANQR ajuda a imposar aquestes prioritats en advertir quan les opcions es podrien comprometre a l\'escàner.'],
    },
    {
      heading: 'S\' està afegint la identitat Brand sense la recomproming Relibilitat',
      paragraphs: ['L\'efecte de marca QR té un impacte visual efectiu en la fiabilitat de l\'escanejat. Comença amb color: substitueix el primer pla negre per omissió amb el color de la marca primària, assegurant- vos que hi ha prou contrast contra el fons. Per a la majoria de marques, els colors foscos en els fons lleugers funcionen millor. Eviteu combinacions de baixa contrast, degradats que redueixen la claredat de la vora, o colors similars en condicions d\' il· luminació habituals.', 'El costum de la forma de mòduls ofereix una altra oportunitat de marca amb un impacte mínim de fiabilitat. Els mòduls arrodonits creen una aparença més tova, més aproximació i mantenint excel· lent possibilitats. Els mòduls d\'estil Dot treballen bé per a les marques modernes, la tecnologia en marxa. Mòduls connectats s\'acosten a industrials o identitats corporatius. Sigui quin sigui l\'estil que triïs, mantingui la consistència de tots els seus desplegaments per al reconeixement de marca instantània.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Un diagrama de roda de colors mostra combinacions de color òptimes amb indicadors de relacions amb contrast',
          caption: 'Marca la guia de selecció de color mostrant combinacions d\' alt contrast que mantenen la fiabilitat de l\' exploració',
        },
      ],
    },
    {
      heading: 'Protocol de prova i validació',
      paragraphs: ['Mai desplegueu codis QR sense provar rigor. Imprimeix una prova física a la mida exacta i en el mateix material que el desplegament final. Prova en la localització on viu el codi, en diferents temps de dia per explicar les variacions de la llum. Usa com a mínim tres dispositius diferents: un telèfon amb la bandera actual, un dispositiu d\' interval mig, i un telèfon intel· ligent antic o pressupostari.', 'Enregistreu temps d\'escanejat i índex d\'èxit per a cada prova. Un codi ben qualificat hauria d\'investigar en 1-2 segons en qualsevol dispositiu modern raonablement. Si esteu veient els retards o fracassos consistents, reduir la intensitat de l\' aversió - eliminar o encongir recobriment, incrementar la mida de zona tranquil· la, o canviar a un nivell de correcció d\' errors més alt. La responsabilitat sempre té preferència sobre la sofisticació visual.'],
    },
    {
      heading: 'Tancant la vostra configuració per la consistència',
      paragraphs: ['Un cop hàgiu validat una configuració òptima, preservar-la usant els enllaços compartits deQR. Això crea un registre permanent de cada arranjament usat per generar el codi aprovat - colors, estil de mòdul, correcció d\' errors, mida de l\' error, i qualsevol recobriment. Compartiu aquest enllaç amb el vostre equip de disseny, venedors d\' impressió, i qualsevol que pugui necessitar reproduir el codi en el futur.', 'Aquest bloc de configuració evita la degradació gradual que plaguen molts desplegaments. Sense ell, els membres del personal tornen a crear codis de captures de pantalla, els dissenyadors reconstrueixen l\' arranjament de la memòria, i els venedors d\' impressió fan ajustaments "helpful ." Cada variació introdueix problemes potencials. Amb un enllaç de configuració bloquejat, cada reproducció és idèntica a la prova, aprovat original.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Un diagrama que mostra la deriva de la configuració: instantànies liderant les recreacions que condueixen a variants, amb un únic enllaç de codi font de la veritat',
          caption: 'Evita la deriva de la configuració establint una única font autoritativa per a totes les reproducció QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Visualitzeu exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Codis QR per als pagaments de la cua',
      paragraphs: ['Els codis " QR " operen en l\'entorn més exigent en el detall: el moment de la transacció. Els clients estan a punt de pagar, sovint amb una cua que forma al seu darrera, i cada segon de retard crea fricció. No obstant això, aquest moment d\'alt rendiment també és la primera propietat de reforç de marca. Aquesta guia explica com crear codis de pagament de QR que s\'escaneja instantàniament a les aplicacions bancàries mentre encara presenta un professional, l\'aparença que crea confiança dels clients.', 'El principi fonamental per pagar codis QR és de fiabilitat sobre estètics. Un codi ben dissenyat que falla en explorar l\'aplicació banca d\'un client et costarà molt més en transaccions abandonades i frustrats als clients que un disseny conservador mai podria. Comença amb el compliment, afegeix fiabilitat, llavors amb cura la capa en marca només on no compromet la funció primària.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Una pantalla de comptadors que mostra un codi QR de pagament sent escanejat per un telèfon intel· ligent amb una aplicació bancària',
          caption: 'Els codis " QR " han de treballar instantàniament amb banca i carteres sota condicions de contra el món real',
        },
      ],
    },
    {
      heading: 'S\' estan entén els estàndards del pagament QR',
      paragraphs: ['Els codis " QR" solen seguir els estàndards regionals que dicta el format de càrrega. A Singapur, Pay Ara QR fa servir un formatat específic. A l\'Índia, els codis de dalt segueixen els estàndards d\'enllaç de BharatQR o UPC. Els pagaments europeus usen codis EPC QR. Cada estàndard existeix per assegurar que les aplicacions bancàries poden reconèixer instantàniament i processar la informació del pagament. Desviar-se d\'aquests estàndards - fins i tot pot provocar aplicacions de pagament per a rebutjar codis que els escàners de càmera genèric sàpiguen sense problema.', 'ANQR inclou plantilles per als estàndards de pagament importants que formatin automàticament els detalls del vostre mercader per a les carregacions de pagament. Usa sempre aquestes plantilles en comptes de construir cadenes de pagament manualment, ja que fins i tot els errors de format menor pot causar errors de transacció. Si l\' estàndard del pagament de la vostra regió no està disponible com a plantilla, consulteu la documentació tècnica del vostre proveïdor de pagament per a requeriments de formatat exactes.'],
    },
    {
      heading: 'S\' està reduint i col· locació de les pantalles Comptador',
      paragraphs: ['Codis de contració QR front a reptes físics únics. Els clients analitzen la longitud del braç, sovint a un angle, a vegades a través de guàrdies esternuts o casos de pantalla. La il·luminació del cap crea taques de llum. El codi competir amb altres parades d\'atenció i vistes clares. Mida del vostre pagament QR generosament - un mínim de 4- 5cm és recomanable per a la majoria d\' aplicacions de comptadors, escalat si el codi es troba darrere del vidre o en una àrea enfosquida.', 'La posició importa tant com la mida. Col·loqueu el codi on els clients puguin mantenir el seu telèfon sense bloquejar la cua o arribar a estranyament. Posa la vista cap al client en comptes de posar-la plana. Si és possible, useu la dominació de Matte o els materials que no reflectes mostren la llum del tot il·luminació. Proveu l\' emplaçament final a diferents vegades del dia per a captar problemes d\'il·luminació.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Un diagrama que mostra les alçades òptimes de QR col· locació i angles per a configuracions diferents',
          caption: 'Guia de col· locació: alçades òptimes, angles i distàncies per a l\' exploració de pagament fiable',
        },
      ],
    },
    {
      heading: 'Brandant per als codis monetaris',
      paragraphs: ['Les aplicacions de pagament són menys per adular que escàners de càmera genèrics. Moltes aplicacions bancàries usen algorismes més antics, més senzills de lectura de QR per a la velocitat que la flexibilitat. Això vol dir fer servir una càmera telefònica pot fallar amb aplicacions de pagament específiques. Manté el ressaltat de marca: useu el color de la marca per al primer pla si manté un contrast fort, però eviteu degradats, recobriment pesats o elements de decoració que poden interferir en el reconeixement.', 'Si voleu un logo o recobriment del centre, mantingueu-lo extremadament petit - no més de 10-1% de l\'àrea QR - i proveu-ho extensament amb cada aplicació de pagament que els vostres clients puguin usar. Molts negocis opten per no recobriment dels codis de pagament específicament, reservent-se que s\'esforen als codis de màrqueting QR on els requeriments de fiabilitat són menys importants. El treball del pagament és processar assentaments, no per impressionar visualment.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Una comparació que mostra els nivells acceptables per al pagament QR',
          caption: 'Entorn de marca QR: des d\'un lloc conservador segur a un enfocament arriscat',
        },
      ],
    },
    {
      heading: 'Material i Medicions d\' impressió',
      paragraphs: ['El material de visualització físic impacta significativament de fiabilitat. Levitació reflecteix les llums generals directament a la càmera del client. Els materials amb textures poden distorsionar les vores del mòdul. La impressió Cheap pot distingir detalls detallats. Per als codis QR, invertir en qualitat: usar Matte o satin laminació, assegurar la impressió d\' alta resolució i substituir les pantalles abans de mostrar l\' ús. Un flux de pagament es va gratar o es va esvair.', 'Considereu la imperabilitat i substitució de la pantalla. Contra els espectacles es van tocar, es van moure, esquitxar, i de tant en tant va cridar. Dissenyeu el sistema de visualització per tal que el QR inserir es pugui substituir fàcilment sense substituir tota la posició sencera. Mantén les empremtes de reserva preparades, generades des de l\' enllaç de configuració bloquejada, de manera que els codis usats es poden canviar immediatament.'],
    },
    {
      heading: 'Proves amb pagament realComment Apps',
      paragraphs: ['Els escàners de càmera genèrics descodificaran gairebé qualsevol codi QR en format raonable. Les aplicacions de pagament són més exigents. Abans de desplegar qualsevol codi del pagament QR, proveu-lo amb cada aplicació de pagament que els vostres clients puguin usar. En entorns multipagament, això podria significar provar amb múltiples aplicacions bancàries, carteres digitals i plataformes de pagament. Document quines aplicacions heu provat i les seves versions - les aplicacions de pagament s\'actualitza sovint, i una actualització pot canviar el comportament de l\' exploració.', 'Prova sota condicions realistes: la vista real, la llum real, l\' exploració de distància real. Un codi que s\'escaneja a l\'instant en el teu escriptori pot lluitar en el taulell a les 5:00 quan el sol de la tarda crea llum. Prova amb el telèfon més vell i barat que pots trobar - si funciona amb seguretat en un dispositiu de pressupostos, funcionarà en tot. Marca qualsevol moment d\'escanejar durant 2 segons per a la investigació i el bombarder potencial.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Una llista de proves que mostra diverses aplicacions de pagament, tipus de dispositiu i condicions ambientals per verificar',
          caption: 'Matriu de pagament QR que cobreix aplicacions, dispositius i factors mediambientals',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Visualitzeu exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Imprimeix codis QR de lectura: SVG contra PNG',
      paragraphs: ['La diferència entre un codi QR que explora perfectament i un que falla sovint es redueix a com es va exportar i es va gestionar en el flux de treball d\' impressió. Aquesta guia explica les distinció crítiques entre vectors (SVG) i formats raster (PNG), quan s\'utilitzen cada, i com treure les obres d\'art de QR als dissenyadors i imprimir venedors de maneres que preserva la fiabilitat de les targetes de negoci a la llista de cartells.', 'Imprimeix la producció introdueix variables que no existeixen a la pantalla: l\' expansió de tinta, textures substratrats, processos d\' acabat, i l\' efecte acumulatiu de múltiples conversions de fitxer. Un codi QR que sembla perfecte en el vostre programa de disseny pot sorgir des de la impressora amb vores suaus, reduir contrast, o mòduls distorsionats. Entendre la selecció del format i les millors pràctiques del flux de treball evita que aquests fracassos en silenci.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Una vista ampliada comparant mòduls de vector QR amb vores fregides i mòduls de trama que mostren artefactes de píxelsName',
          caption: 'Vector contra escala de trama: la diferència de precisió que determina la fiabilitat de l\' exploració',
        },
      ],
    },
    {
      heading: 'Per què vector (SVG) és el preferit d\' impressió',
      paragraphs: ['Els fitxers SVG descriuen codis QR com formes matemàtiques enlloc de les graella de píxels. Això significa que el codi es pot escalar a qualsevol mida - des d\'una etiqueta 1cm a un bàner de 10 metres - sense pèrdua de definició de vora. El RIP de la impressora (Raster Image Processador de fotografies) representa els vectors a la resolució nativa del dispositiu de sortida, assegurant- vos que cada vora del mòdul és tan cruixent com permet el maquinari. No hi ha magnificació, cap artefacte d\' antialiàsing, no hi ha un difuminat acumulat en múltiples operacions de redimensionament.', 'Més enllà d\'obaltabilitat, els fitxers SVG són més robustos en flux de treball professional. Sobreviuen sense degradació. Poden ser corregits de color sense fer res. Es van encastar netament en fitxers PDF per a la sortida de premsa. Per a qualsevol aplicació d\' impressió on importa la qualitat, SVG hauria de ser el format d\' exportació per omissió.'],
    },
    {
      heading: 'Quan PNG sigui acceptable',
      paragraphs: ['PNG esdevé necessari quan el vostre flux de treball o plataforma de destí no permet formats vectorials. Algunes plataformes web, sistemes de senyal CMS i flux de treball heretat d\' impressió requereixen imatges de trama. En aquests casos, PNG pot funcionar bé - però només si seguiu les regles estrictes: exportar a la mida física final i resolució, no escalar mai després de l\' exportació, i evitar cap compressió o conversió de format.', 'La regla crítica per a PNG és calcular les dimensions dels píxels requerits abans d\' exportar. Si la vostra QR imprimirà a 5cm i la vostra impressora opera a 300 PPP, cal aproximadament 590 píxels. Exporta a aquesta mida o més gran, després escala avall si cal - mai dalt. Inclou aquesta informació en el vostre nom de fitxer o metadades, de manera que els futurs usuaris no usen una exportació específica de mida.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Una interfície calculadora que mostra la relació entre la mida física, el DPI i les dimensions dels píxels requerits',
          caption: 'Calculadora de resolució d\' impressió: determinar les dimensions mínimes del píxel per a la mida de la sortida de destí',
        },
      ],
    },
    {
      heading: 'Opcions d\' exportació ANQR explicades',
      paragraphs: ['ANQR ofereix diversos modes d\' exportació SVG per a palar fluxos de treball diferents. Mode vectorial real produeix un ideal de sortida pura per a les eines de disseny print i professional. Quan heu afegit recobriment de trama o certs efectes, unANQR pot encastar- los mentre manté mòduls de vector, o podeu exportar una versió completament tramada a la vostra resolució especificada. En entendre aquestes opcions us ajuda a escollir l\' exportació correcta per a cada cas d\' ús.', 'Per a exportar a PNG, ANQR us permet especificar les dimensions exactes i incloure opcions per a fons transparents. La configuració del DPI us ajuda a calcular les mides apropiades per a la impressió, encara que recordeu que el DPI és les metadades - el que importa per a imprimir té suficients píxels per a la mida física. Quan en dubte, exporteu més gran del que creieu que necessiteu; escalateu la qualitat mentre escalateu destruir-la.'],
    },
    {
      heading: 'S\' estan preparant fitxers per a la Màoff',
      paragraphs: ['Quan passa l\'art de QR als dissenyadors o proveïdors d\' impressió, inclouen especificacions clares: la mida física proposada, requeriments mínims de zona tranquil· la, i qualsevol consideració de color. Per a aplicacions crítiques, proporcionen tant un mestre SVG com una còpia de seguretat PNG d\'alta resolució, clarament etiquetada amb els seus usos destinats. Inclou el vostre enllaç de configuració ANQR per tal que el codi es pugui regenerar si cal.', 'Un error comú d\' anètic en el procés de sortida. L\'estat d\'expulsió que el QR no ha de ser escalat, girat, esbiaixat, o han aplicat efectes. Especifiqueu que la zona tranquil·la no ha de ser clara - sense marques de cultiu, marques de registre o elements de disseny intruding. Si el QR es situarà en un fons acolorit o fotogràfic, proporcioneu una versió amb una forma de suport opaca per assegurar un contrast adequat.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Un diagrama de paquets de fitxers que mostra còpies de seguretat SVG mestre, PNG, especificacions del document, i l\'enllaç de configuració',
          caption: 'Paquet del QR de màff professional: Tot un dissenyador o un venedor d\' impressió necessita per a la reproducció exacta',
        },
      ],
    },
    {
      heading: 'Verificant les proves d\' impressió',
      paragraphs: ['Mai aproven una impressió sense escanejar una prova física. Sol· licita una prova impresa en el substrat actual amb el final real que s\' usarà en la producció. Escaneja la prova sota condicions d\' il· luminació similars a on es mostrarà la peça final. Prova amb múltiples dispositius, incloent-hi els telèfons intel·ligents antics que podrien lluitar amb la qualitat marginal.', 'Si la prova escaneja lentament o inconsistentament, investigui abans de l\'anàlisi. Els temes comuns inclouen insuficient contrast sobre substrats de color, violacions de zona tranquil·les de retall, tinta expandida per vores de mòdul de suavitzat, o la dominació creant reflexes. Qualsevol d\'aquests es pot abordar abans de publicar una execució completa d\' impressió, però només si les atraves a l\'escenari de proves.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Una llista de comprovació de proves amb resultats d\' escaneig, mesuracions del contrast i les signatures d\'aprovació',
          caption: 'Imprimeix el flux de verificació de proves: proves sistemàtica abans de cometre quantitats de producció',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Visualitzeu exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Creant codis QR animades',
      paragraphs: ['Codis animats QR combinen la funcionalitat dels codis estàndard QR amb moviment d\'ull que incrementa dràsticament les taxes de compromís. En la firma digital, els mitjans socials i les pantalles interactius, l\'animació transforma una utilitat estàtica en un element visual convincent que dibuixa l\'ull i la interacció. Aquesta guia cobreix els principis, tècniques i restriccions pràctiques de crear codis de QR animades que s\'escanegeu de manera fiable mentre proporciona l\'impacte visual.', 'El repte fonamental dels codis QR animats és l\'interès de l\'equilibri visual contra la fiabilitat de l\'escaneig. Cada marc ha de ser escanejat individualment - un escàner pot capturar el codi en qualsevol moment del cicle d\' animació. Aquesta restricció forma cada decisió de disseny: quins elements poden moure, quant poden canviar, i el que ha de quedar estable durant l\' animació.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Una mostra de signes digitals que mostra un visor de codi QR animat en un espai públic',
          caption: 'Codis de QR animats en el signe digital: moviment que atrau l\'atenció i anima l\' exploració',
        },
      ],
    },
    {
      heading: 'Com afecta l\' animació a l\' exploració',
      paragraphs: ['Els escàners QR treballen capturant un únic marc i analitzant el patró de la llum i els mòduls foscos. Per a un codi animat a treballar, cada marc ha de contenir el patró complet, vàlid QR. Aquestes regles s\'han desactivat les animacions que es fonen l\'estructura del codi, es dissolen mòduls, o s\'ha alt el patró del contrast. Els mòduls de base de dades - el patró aparentment aleatori al centre - ha de quedar estable visualment durant tot el temps.', 'Un enfocament segur d\' animació modifica els elements que no porten dades: fons, colors, marcs de decoració i els elements de recobriment. Els components estructurals - patrons de cerca (els quadrats grans de les cantonades), patrons de temps (les línies i alternants), i patrons d\' alineació (els quadrats més petits en codis més grans) - han de mantenir les seves posicions i proporcions. Treballant dins d\'aquestes restriccions encara permet adoptar animacions dinàmiques i en joc sorprenentment.'],
    },
    {
      heading: 'Technaquets d\' animació Aquesta feina',
      paragraphs: ['Color cyclock anima els colors de primer pla i de fons a través d\' una paleta mentre manté el suficient contrast a cada pas. Això crea un efecte vibrant i l\'atenció amb un risc mínim d\'escanejar, mentre el contrast no cau sota nivells llegibles. Els ambients de cicles de color de l\'ANQR estan dissenyats per mantenir l\'escàner durant el cicle.', 'Rellectors animats col·locats movent imatges darrere d\' un patró QR semitransparent. El codi es manté estable mentre el fons anima, potser un vídeo d\'animació, elements de marca, o gràfiques de moviment abstractes. Aquesta tècnica requereix una gestió intensa d\' intensitat per evitar que el fons alenteixi el patró QR, però crea els resultats més visuals.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Un diagrama que mostra l\' estructura en capa d\' un QR animat: capa de codi estable sobre la capa de fons animada',
          caption: 'El principi de la capa d\' animació: el patró QR continua constant mentre els elements de fons s\' animen sota',
        },
      ],
    },
    {
      heading: 'Configurar els paràmetres d\' animació',
      paragraphs: ['La taxa de fotogrames afecta tant la suavitzat visual com la mida del fitxer. Per a la majoria d\' aplicacions, 1015 marcs per segon proveeix moviment d\' aspecte suau sense mides excessivas de fitxer. Les taxes més elevades dels marcs ofereixen la disminució de la vista mentre s\' incrementen significativament les mides dels fitxers. Considereu el vostre context d\'entrega: un gran signe digital pot gestionar fitxers més grans que una col· locació de mòbil.', 'El comportament del bucle determina com canvien els cicles d\' animació. Els bucles indemes creen moviment continu ideal per a les pantalles de signes i de forma objectiva. Ping-pong (ara enrere) realitza bé les animacions simples. Pels polss d\'atenció, considereu les animacions amb les seves prioritats - períodes de silenci penetrat en moviment que dibuixa l\'ull sense fatiga constant del moviment.'],
    },
    {
      heading: 'Creant modificacions animades',
      paragraphs: ['Quan s\' usa imatges animades (GIFs, WebPs animats, o vídeo) com a remarcacions, AAQR extracte marcs i els composicions amb el codi QR. L\' arranjament d\' intensitat del recobriment controla quant de l\' animació mostra a través - els valors inferiors previs d\' exploració mentre que l\' impacte més alt dels valors de favor. Prova la intensitat seleccionada a través de múltiples marcs per assegurar la capacitat d\' escaneig consistent.', 'La qualitat del material font impacta significativament als resultats. Usa recobriment amb subjectes clars i bons contrastos. Evita les animacions de codi font amb canvis de brillantor ràpids i extrems que poden crear ocasionals de marcs de baixa contrast. Previsualitza el cicle d\' animació complet abans d\' exportar a capturar qualsevol marc problemàtic que pugui fallar a explorar.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Una vista amb marcs d\' un recobriment animat que mostra els nivells de contrast mantinguts a través de la seqüència',
          caption: 'Anàlisi del marc: S\' està verificant l\' escaneig consistent a tot el cicle d\' animació',
        },
      ],
    },
    {
      heading: 'Exporta i lliuraments',
      paragraphs: ['GIF segueix sent el format més acceptat animades, tocant automàticament en la majoria de contexts sense necessitat de funcionament amb el reproductor de vídeo. No obstant això, la paleta de 256 colors del GIF dóna la fidelitat. Per a animacions críctiques de color, considereu la WebP animada on està implementada, o torneu als formats de vídeo per a la qualitat més alta. L\' exportació GIF d\'ANQR inclou opcions de tramat per a maximitzar la qualitat en limitacions de paleta.', 'La mida de fitxer importa el lliurament. Sistemes de signes digitals, clients de correu electrònic i plataformes socials sovint representen límits de mida. Si la vostra animació supera aquests límits, redueix el nombre de fotogrames, dimensions o profunditat de color. De vegades dividir una animació complexa en un bucle més curt aconsegueix millors resultats que compressió agressiva que degrada cada marc.'],
    },
    {
      heading: 'Proves de codi QR animats',
      paragraphs: ['Els codis animats requereix explorar en múltiples punts en el cicle d\' animació. No només exploris una vegada i assumeixis l\'èxit - Explorant repetidament, en diferents moments, per a verificar que cada marc es pot llegir. Doneu atenció particular als marcs als cicles extrems de color o recobriment de la intensitat en què el contrast pot ser més baix.', 'Prova amb el maquinari de visualització real on és possible. Controla el calibratge del color, l\' angle de visualització i la il·luminació del tot afectar com apareix l\' animació i els escàners. Una animació brillant que s\'escaneja perfectament al teu monitor pot rentar-se en una pantalla exterior o ser illegible als angles de visualització obliqüós.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Una matriu de proves que mostra les taxes d\'èxit a través de diferents marcs, dispositius i condicions de visualització',
          caption: 'Protocol de proves QR animades: Verificació sistemàtica a través dels marcs, dispositius i condicions de visualització',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Visualitzeu exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Seguretat QR i consultes millor pràctiques',
      paragraphs: ['Un codi molt dissenyat QR que falla a explorar és pitjor que inútil - que els clients, danys en marca, i residus tots els recursos invertits en la seva creació i distribució. Aquesta guia cobreix els factors tècnics i pràctics que determinen si un codi QR explorarà amb fiabilitat, i com utilitzar les característiques de seguretat de l\'ANQR per a captar problemes potencials abans d\'arribar a la producció.', 'La fiabilitat del codi QR no és binària. Un codi podria escanejar perfectament els telèfons flagstats però fallar en els dispositius pressupostaris. Podria funcionar en una il·luminació ideal però en restaurants fosca o brillant llum del sol. Entendre els factors que afecten l\'escannera us ajuda a fer sacrificis informats entre la visió i la fiabilitat del món real.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Un espectre de fiabilitat que mostra els codis QR que va aparèixer des deltament escannable a l\' espai de lectura marginalment',
          caption: 'L\' espectre de l\' exploració: dels codis de bala a l\' alinear que empeny els límits de fiabilitat',
        },
      ],
    },
    {
      heading: 'S\' estan entén els nivells de correcció d\' errors',
      paragraphs: ['Els codis QR inclouen una vermellundància integrada que els permet llegir fins i tot quan parcialment danyats o obscurs. El nivell de correcció d\' errors - L (7%), M (15%), Q (25%), o H (30%) - determina quant del codi es pot perdre mentre encara es descodifica correctament. Correcció d\' errors més alta crea codis més grans però proporciona un marge de seguretat per als recobriment, la impressió i el dany ambiental.', 'Per als codis amb recobriment de la imatge, nivell de correcció d\' errors L\'H és essencial - el recobriment físicament fosc part del codi, i necessites que el 30% de redundància per mantenir la fiabilitat. Per netejar, codis sense estil en entorns controlats, el nivell M sovint és suficient. Nivell Hauria d\'estar reservat per a situacions en les que la mida del codi està exstricta críticament i podeu garantir les condicions inactives.'],
    },
    {
      heading: 'La Zona Silenci crítica',
      paragraphs: ['La zona tranquil·la és el marge buit que envolta cada codi QR. Els escàners usen aquest límit per identificar on comença el codi i finalitza. L\' estàndard ISO especifica una zona mínima tranquil· la de quatre mòduls (quatre vegades l\' amplada del quadrat més petit del codi). Violar aquest espai - amb elements de disseny, retallar vores, o contingut adjacent - és una de les causes més comuns dels errors d\' exploració.', 'La zona tranquil·la de l\'ANQR ajuda a mantenir aquest espai crític, però també has d\'assegurar-te que es preserva en els teus dissenys finals. Quan es marca l\' art de QR, especifica explícitament els requeriments de zona tranquil· la. Quan es col·loquen codis de disposicions, verificar que no hi ha elements que s\'interposin en aquest espai. Algunes mimes d\'espai clar poden significar la diferència entre l\'escanejat fiable i els clients frustrats.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Un diagrama que mostra l\' espaiat de zona tranquil· la i les violacions comunes que causen errors d\' exploració',
          caption: 'Criteri de zona tranquil· la: el marge invisible que determina l\' èxit d\' escaneig',
        },
      ],
    },
    {
      heading: 'Comment',
      paragraphs: ['Els escàners QR detecten el patró dels mòduls llum i foscos. Qualsevol força que redueix aquest contrast, primer pla de llum, fons foscos, efectes degradats, o recobriment de baixa densitat - fa el codi més difícil de llegir. ANQR calcula les ràtios de contrast i adverteix quan les vostres opcions de color s\'acosten a nivells perillosos, però l\'abitador final sempre és la prova del món real.', 'La percepció del color varia amb condicions de il·luminació. Una combinació de color que apareix amb alt contrast en el vostre monitor pot resultar difícil de distingir sota l\' escalfor en l\' il·luminació d\' il· luminació o tubs fluorescents freds. Si el vostre codi s\'utilitzarà en unes condicions d\'il·luminació diferents, s\' usarà la prova sota múltiples fonts de llum, i considera més raons amb contrast conservador com a marge de seguretat.'],
    },
    {
      heading: 'Mida del mòdul i distància de visualització',
      paragraphs: ['La mida física dels mòduls individuals determina la distància màxima des del qual es pot escanejar un codi. Els mòduls petits volen dir codis més petits però requereixen distàncies més properes. La regla general és que cada mòdul hauria de ser com a mínim 0,5m a la distància d\' exploració prevista, escalat proporcionalment per a més grans distàncies. Un codi en un cartell necessita mòduls molt més grans que un codi en una targeta de negoci.', 'En calcular la mida del mòdul, considereu l\' escenari del pitjor dels casos: el client amb un telèfon més antic, en il· luminació imperfectiva, explorant a la distància màxima possible. Disseny per a aquest usuari, i tots els altres tindran una millor experiència. Factor d\' recomanacions de mida ANQR en aquestes variables del món reals per suggerir dimensions apropiades per al vostre ús.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Un diagrama de mida relacionada amb el mòdul, imprimeix les dimensions, i la distància màxima d\' exploració efectiva',
          caption: 'Explorant la guia de distància: Mida del mòdul coincident als vostres requeriments de desplegament',
        },
      ],
    },
    {
      heading: 'Usar el mode de seguretat ANQR',
      paragraphs: ['El mode de seguretat de l\'ANQR proporciona informació en temps real en la fiabilitat de l\' escaneig. Controla les ràtios de contrast, el compliment de la zona tranquil· la, la intensitat del recobriment, i altres factors que afecten l\' escaneig. Quan qualsevol paràmetre s\'acosta a nivells arriscats, veureu avisos amb orientació específica sobre com millorar la fiabilitat. Per a desplegament professional on el fracàs és costosament, mantenir activa el mode de seguretat durant el procés de disseny.', 'El mode de seguretat també inclou una característica de verificació d\' escaneig que intenta descodificar el codi generat i informes d\'èxit o fallada. Mentre aquesta verificació no pot reproduir totes les condicions reals del món, representa molts problemes comuns abans d\'invertir en la impressió o la distribució. Tracta amb èxit la verificació com a barra mínima, no és una garantia... que el món real segueixi sent essencial.'],
    },
    {
      heading: 'Protocols de proves reals del món',
      paragraphs: ['No hi ha cap quantitat de verificació de programari reemplaça la prova física. Imprimeix el codi a la mida prevista en material representatiu. Prova-ho en l\'entorn de desplegament amb condicions que coincideixen amb l\'ús real. Explorar amb múltiples dispositius - no només el telèfon amb la bandera, sinó els dispositius d\'Android, antics iPhones, i qualsevol dispositiu específic que el públic faci servir normalment.', 'Documenteu les proves sistemàticament. Enregistra quins dispositius es van provar, en quines condicions, amb quins resultats. Si esteu expandint codis a escala, estableixi criteris d\' acceptació: potser el 95% de la taxa d\'èxit a través de la vostra piscina de proves de dispositiu, o s\' explora amb èxit en 2 segons en tots els dispositius de proves. Aquests estàndards ajuden a prendre decisions objectivas en lloc d\'esperar el millor.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Una llista de proves completa que cobreix dispositius, condicions i criteris d\' acceptació',
          caption: 'Protocol de proves del QR desplegament: verificació sistemàtica abans del compromís de producció',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Visualitzeu exemples QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Obre la guia completa d\' usuari', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Obre la galeria', type: 'gallery' },
  ],
};
