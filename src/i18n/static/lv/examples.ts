import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR piemēri',
  description: 'Pieci reāli, ražošanas stila piemēri, kas parāda, kur QR kodi rada izmērāmu vērtību: mantotā mazumtirdzniecības skaitītāja koda uzlabošana, zīmola mazumtirdzniecības maksājumi un skenēšanas darbības, drukas mērogošana no skrejlapām līdz stendiem, animēts QR digitālajām norādēm un vairāku valodu sadarbība, izmantojot koplietojamas enkura saites. Katrs piemērs ietver attēlus, praktiskus ierobežojumus un remiksa saiti atpakaļ uz ģeneratoru.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Atveriet ģeneratoru', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Pārlūkot Uzziniet rakstus', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Atveriet pilnu lietotāja rokasgrāmatu', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Gadījuma izpēte: mazumtirdzniecības skaitītāju QR palielināšana',
      paragraphs: ['Šis reālās pasaules piemērs seko nelielai kafejnīcai, kas trīs gadus uz sava letes izmantoja vienu un to pašu QR kodu. Sākotnējais kods tika ātri ģenerēts pandēmijas laikā, izdrukāts uz standarta papīra un ieslīdēts plastmasas statīvā. Tas joprojām darbojās — tehniski —, taču klientiem bieži bija vajadzīgi vairāki mēģinājumi to skenēt, un tas nekādi nepastiprināja kafejnīcas rūpīgi izstrādāto zīmola identitāti.', 'Pārveidošana sākās ar vienkāršu auditu: esošajā kodā tika iekodēts kafejnīcas tiešsaistes izvēlnes URL, kuru viņi vēlējās paturēt. Izaicinājums bija panākt, lai QR justos kā daļa no kafejnīcas pieredzes, nevis kā pārdomāta lietderība no 2020. gada.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Noturīgs QR kods plastmasas statīvā, kas parāda redzamu nodilumu, pirkstu nospiedumus un izbalējušu apdruku',
          caption: 'Sākumpunkts: trīs gadus ilgs letes kalpošanas laiks bija atstājis sākotnējo QR tikko funkcionējošu',
        },
      ],
    },
    {
      heading: 'Sākotnējā koda problēmu diagnostika',
      paragraphs: ['Pārbaude atklāja vairākas problēmas: sākotnējā kodā tika izmantota kļūdu labošana L (minimālā dublēšana), tajā bija tikai 2 moduļu klusā zona, un tas tika drukāts ar zemu izšķirtspēju. Zem kafejnīcas siltā volframa apgaismojuma jau izbalējušie melnie moduļi tik tikko kontrastēja ar dzelteno papīru. Vecāki tālruņi cīnījās; jaunākie tālruņi izdevās, bet ar ievērojamu kavēšanos.', 'Papildus tehniskām problēmām vispārējais melnbaltais kvadrāts neko neinformēja par zīmolu. Klienti vilcinājās pirms skenēšanas — tas ir smalks uzticības šķērslis, kas mazināja iesaistīšanos kafejnīcas rūpīgi izstrādātajā digitālajā ēdienkartē.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnostikas pārklājums, kurā redzami sākotnējā QR tehniskie trūkumi: zems ECC, minimāla klusā zona, slikts kontrasts',
          caption: 'Tehniskā analīze, kas atklāj, kāpēc mantotais kods nedarbojās reālos apstākļos',
        },
      ],
    },
    {
      heading: 'Pacelšanas process',
      paragraphs: ['Izmantojot ANQR, kafejnīcas īpašnieks no jauna izveidoja kodu ar identisku izvēlnes URL, taču ievērojami uzlaboja iestatījumus: kļūdu labojums H maksimālai noturībai, 6 moduļu klusā zona uzticamai robežu noteikšanai un zīmola krāsas (dziļi bordo moduļi uz krēmkrāsas fona), kas atbilst kafejnīcas interjera paletei.', 'Tika pievienots neliels centrālais pārklājums ar kafejnīcas logotipu — tas tika saglabāts apzināti smalks, lai saglabātu skenējamību, vienlaikus nodrošinot tūlītēju zīmola atpazīšanu. Drošais režīms apstiprināja, ka jaunais dizains tika droši skenēts visās testa ierīcēs pirms jebkādas drukāšanas.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR interfeiss, kas parāda konfigurāciju: zīmola krāsas, atbilstoša ECC, plaša klusā zona, smalks logotipa pārklājums',
          caption: 'Jauninātās konfigurācijas izveide: katrs iestatījums, kas izvēlēts, lai līdzsvarotu zīmola izteiksmi ar skenēšanas uzticamību',
        },
      ],
    },
    {
      heading: 'Izmērāmi rezultāti',
      paragraphs: ['Pēc jaunā QR izvietošanas uz profesionālas matētas laminētas kartītes kafejnīca četru nedēļu laikā novēroja rezultātus. Skenēšanas panākumu līmenis uzlabojās no aptuveni 70% līdz gandrīz 100%. Vidējais skenēšanas laiks samazinājās no 3–4 sekundēm līdz mazāk nekā 1 sekundei. Vissvarīgākais ir tas, ka ēdienkartes iesaistīšanās palielinājās par 40% — klienti, kuri iepriekš paskatījās uz QR un atteicās, tagad skenēja pārliecinoši.', 'Darbinieki ziņoja, ka ir mazāk klientu jautājumu par to, kā izmantot QR attēlu, un neapmierinātiem klientiem vairs nav manuāli jāievada URL. Zīmola izskats arī izraisīja sarunas, klientiem pozitīvi vērtējot vienoto dizainu.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Pirms/pēc salīdzinājums ar metriku: skenēšanas panākumu līmenis, vidējais skenēšanas laiks un iknedēļas skenēšanas skaita uzlabojumi',
          caption: 'Četru nedēļu dati, kas parāda pārdomāta QR paaugstināšanas izmērāmo ietekmi',
        },
      ],
    },
    {
      heading: 'Atkārtoti izveidojiet šo konfigurāciju',
      paragraphs: ['Kafejnīcas konfigurācija demonstrē konservatīvu, bet efektīvu zīmolu: kļūdu labojums H, 6 moduļu klusā zona, augsta kontrasta zīmola krāsas un minimāls centra pārklājums. Šis līdzsvars darbojas lielākajā daļā mazumtirdzniecības lietojumprogrammu, kur uzticamība ir pirmajā vietā, taču zīmola klātbūtne joprojām ir svarīga.', 'Atveriet ģeneratoru ar iepriekš ielādētiem iestatījumiem un pielāgojiet krāsas un pārklājumu savam zīmolam. Galvenais ieskats: uzticamības uzlabojumi vien var ievērojami palielināt iesaisti pat pirms jebkāda vizuālā stila pievienošanas.', 'Skatiet saistīto mācību rokasgrāmatu par esošo QR kampaņu uzlabošanu, lai uzzinātu visu šīs pieejas metodoloģiju.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Saite uz ģeneratoru, kas iepriekš konfigurēts ar kafejnīcas iestatījumiem tūlītējai pielāgošanai',
          caption: 'Sāciet ar pārbaudītu konfigurāciju un pielāgojiet to savam zīmolam',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Pārlūkot Uzziniet rakstus',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Gadījuma izpēte: vairāku maksājumu skaitītāja displejs',
      paragraphs: ['Šis piemērs seko modes apģērbu veikalam, kura reģistrā bija uzkrāti pieci dažādi QR kodi: bankas maksājums, padomi, Instagram, Google atsauksmes un darbā pieņemšanas saite. Katrs tika ģenerēts no cita avota, drukāts dažādos laikos un parādīts neatbilstošos stendos. Vizuālais haoss iedragāja veikala rūpīgi izstrādāto estētiku, un darbinieki regulāri saskārās ar klientiem, kas skenēja nepareizu kodu.', 'Risinājumam bija jānošķir bažas: maksājumu kodiem bija nepieciešama maksimāla uzticamība ar konservatīvu stilu, savukārt mārketinga kodi varētu būt izteiksmīgāki. Izveidotā vienotā displeja sistēma parāda, kā līdzsvarot zīmola klātbūtni ar dažādu QR lietošanas gadījumu funkcionālajām prasībām.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Pārblīvēta reģistra zona, kurā redzami pieci neatbilstoši QR kodi dažādos stendos un drukātajos materiālos',
          caption: 'Haotiskais sākumpunkts: pieci atvienoti QR kodi, kas sacenšas par uzmanību un rada klientu apjukumu',
        },
      ],
    },
    {
      heading: 'Maksājumu pieredzes prioritāte',
      paragraphs: ['Veikala primārajā maksājuma veidā tika izmantots reģionālais standarts, kas prasīja stingru lietderīgās kravas atbilstību. Testēšana atklāja, ka pat neliela stils ietekmēja skenēšanas ātrumu noteiktās banku lietotnēs. Lēmums: saglabāt maksājuma QR informāciju pilnībā nemodificētu, izņemot izmēru optimizāciju un profesionālu drukāšanu uz matētas kartītes.', 'Šī konservatīvā pieeja nozīmēja, ka maksājuma kods izskatījās mazāk "zīmola" nekā ideāls, taču darījumu pabeigšanas rādītāji ievērojami uzlabojās. Ieskats: maksājumu momenti nav zīmola veidošanas iespējas, bet gan uzticamības momenti. Klienti novērtē ātrumu un noteiktību, nevis estētiku, ja ir iesaistīta nauda.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Tīrs, liels maksājuma QR kods uz profesionālas matētas kartes, kas atrodas labi redzamā vietā reģistrā',
          caption: 'Maksājuma QR kods: dāsna izmēra, profesionāli izdrukāts, konservatīvi veidots, lai bankas lietotnes to uzreiz atpazītu.',
        },
      ],
    },
    {
      heading: 'Sekundārās darbības displeja izveide',
      paragraphs: ['Padomiem, atsauksmēm, sociālajiem jautājumiem un darbā pieņemšanai veikals varētu būt izteiksmīgāks. Šie kodi tika atjaunoti ANQR ar konsekventu zīmola stilu: veikala parakstu olīvzaļa krāsa uz krēmkrāsas, noapaļots moduļa stils un smalks centra pārklājums ar veikala ikonu. Kļūdu labojums H nodrošināja uzticamību pat ar stilu.', 'Šie četri kodi tika izvietoti zīmola panelī, kas novietots blakus maksājuma kodam (nekonkurējot ar to). Skaidras etiķetes veikala tipogrāfijā izskaidro katra koda mērķi. Vizuālā hierarhija bija apzināta: maksājums bija atsevišķi un pamanāms; sekundārās darbības, kas sagrupētas kā iespējas.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Zīmola panelis ar skaidrām etiķetēm, kurā redzami četri stilisti QR kodi padomiem, atsauksmēm, sociālajiem tīkliem un darbā iekārtošanai',
          caption: 'Sekundārās darbības panelis: konsekvents zīmols, skaidrs marķējums, pozicionēts kā iespējas, nevis kā traucēklis',
        },
      ],
    },
    {
      heading: 'Displeja sistēmas dizains',
      paragraphs: ['Fiziskais displejs vienlaikus atrisināja vairākas problēmas. Gan maksājumu stendā, gan sekundārajā panelī tika izmantoti matēti materiāli, lai novērstu gaismas atspīdumu no augšējā apgaismojuma. Augstumi tika optimizēti dažāda auguma klientiem. Leņķi, kas vērsti pret klientu rindu, nevis plakaniski uz letes.', 'Būtiski, ka veikals izveidoja rezerves izdrukas no bloķētām ANQR konfigurācijas saitēm. Kad padomu kods galu galā tika apšļakstīts ar kafiju, darbinieki to dažu minūšu laikā nomainīja, izmantojot saglabāto konfigurāciju — bez ekrānuzņēmumiem, bez minējumiem par iestatījumiem, bez kvalitātes pasliktināšanās.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Diagramma, kas parāda fizisko displeja izkārtojumu: augstumus, leņķus, materiālus un saistību starp maksājumu un sekundārajiem displejiem',
          caption: 'Displeja sistēmas projekts: fiziskā ergonomika optimizēta uzticamai skenēšanai klienta augumā un apgaismojuma apstākļos',
        },
      ],
    },
    {
      heading: 'Darbības uzlabojumi',
      paragraphs: ['Sešas nedēļas pēc izvietošanas veikalā tika dokumentēti būtiski uzlabojumi: nulle klientu sūdzību par "nepareiza koda" apjukumu, ātrāks darījumu laiks un 3 reizes palielinājies dzeramnaudu skaits (tagad klienti varēja atrast un skenēt dzeramnaudas kodu, neveikli nejautājot darbiniekiem). Google atsauksmes arī palielinājās, jo īpašais, labi marķētais QR novērsa berzi.', 'Darbinieku apmācība kļuva vienkāršāka: "maksājuma kods ir lielais, viss pārējais ir uz paneļa". Kad maksājumu lietotnes tika atjauninātas un vienā uz īsu brīdi tika rādīta lēnāka skenēšana, konservatīvais maksājumu koda dizains nozīmēja, ka tas joprojām darbojās — tikai nedaudz lēnāk, nevis pilnībā neizdevās.', 'Skatiet mācību rokasgrāmatu par QR kodiem mazumtirdzniecības maksājumiem, lai uzzinātu šīs displeja sistēmas dizaina principus.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Metrikas informācijas panelis, kas parāda salīdzinājumus pirms/pēc: neskaidrības, darījumu laiks, padomu biežums, pārskatīšanas iesniegumi',
          caption: 'Sešu nedēļu darbības dati, kas parāda pārdomātas vairāku QR displeju sistēmas ietekmi uz uzņēmējdarbību',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Pārlūkot Uzziniet rakstus',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Gadījuma izpēte: no vizītkartes līdz stendam',
      paragraphs: ['Šis piemērs seko pasākumu producēšanas uzņēmumam, kas gatavojas lielai konferencei. Viņiem bija nepieciešams viens un tas pats QR kods — saite uz pasākuma lietotni — izvietots radikāli atšķirīgos formātos: dalībnieku emblēmu ieliktņi (3 cm), galda telts kartes (8 cm), reģistrācijas galda izkārtnes (30 cm), ceļa noteikšanas plakāti (60 cm) un masīvs skatuves fona reklāmkarogs (4 metri). Katram formātam bija atšķirīgs skatīšanās attālums, apgaismojuma apstākļi un ražošanas darbplūsmas.', 'Izaicinājums nebija tikai tehnisks — tas bija operatīvs. Vairāki pārdevēji apstrādāja dažādus drukas darbus, un uzņēmumam bija jānodrošina konsekventi, skenējami rezultāti neatkarīgi no tā, kurš ko ražojis. Viņu risinājums koncentrējās uz SVG eksportu un stingru nodošanas dokumentāciju.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kolāža, kurā redzams viens un tas pats QR kods, kas izvietots piecos dažādos izmēros — no emblēmas līdz reklāmkarogam',
          caption: 'Viens QR kods, pieci izvietošanas izmēri: izaicinājums saglabāt skenējamību no centimetriem līdz metriem',
        },
      ],
    },
    {
      heading: 'Kāpēc iepriekšējiem notikumiem bija problēmas',
      paragraphs: ['Pēdējā konferencē uzņēmums piedzīvoja apkaunojošas neveiksmes. Skatuves reklāmkarogs QR tika ģenerēts kā mazs PNG un palielināts projektēšanas programmatūrā — rezultāts izskatījās pieņemams no attāluma, taču neizdevās ticami skenēt no skatītājiem. Emblēmas QR bija pārlieku veidoti un pārāk mazi, satraucot dalībniekus, kuri mēģināja pievienot kontaktpersonas. Nekonsekventi iestatījumi dažādos formātos nozīmēja, ka "vienāds" QR katrā gabalā izskatījās savādāk.', 'Pēcnotikuma analīze atklāja galveno cēloni: nav viena patiesības avota. Katrs dizainers bija no jauna izveidojis QR ar nedaudz atšķirīgiem iestatījumiem, un katrs drukas piegādātājs bija apstrādājis failus atšķirīgi. Kvalitāte pasliktinājusies, izmantojot telefona spēli ar failu nodošanu.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Tuvplāna fotogrāfijas, kurās redzamas skenēšanas kļūmes: pikseļu reklāmkarogu moduļi, maza izmēra emblēmu kodi, nekonsekvents stils dažādos formātos',
          caption: 'Iepriekšējo notikumu kļūmju kriminālistikas analīze: katrs formāts bija radījis dažādas kvalitātes problēmas',
        },
      ],
    },
    {
      heading: 'SVG Pirmā darbplūsma',
      paragraphs: ['Šim notikumam uzņēmums izveidoja stingru protokolu: viens galvenais QR tika ģenerēts ANQR ar optimāliem iestatījumiem (kļūdas labojums H, bagātīga klusā zona, tīrs stils), eksportēts kā SVG un saglabāts kā vienīgais autoritatīvs avots. ANQR konfigurācijas saite tika dokumentēta kopā ar SVG failu, lai vajadzības gadījumā kodu varētu atjaunot.', 'Katrs dizainers un pārdevējs saņēma vienu un to pašu SVG galveno failu ar skaidriem norādījumiem: novietojiet vajadzīgajā izmērā, nemodificējiet, saglabājiet klusas zonas atstarpi. Pārdevējiem, kuriem nepieciešami rastra formāti, uzņēmums nodrošināja iepriekš renderētus PNG konkrētos izmēros ar skaidriem nosaukumiem, kas norāda paredzēto lietojumu.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Failu pakotne, kas parāda SVG galveno failu, izmēram raksturīgus PNG, specifikācijas dokumentu un konfigurācijas saiti',
          caption: 'Nodošanas pakotne: viss, kas piegādātājiem bija vajadzīgs, lai bez minējumiem iegūtu konsekventus rezultātus',
        },
      ],
    },
    {
      heading: 'Izmēram specifiski apsvērumi',
      paragraphs: ['Katrs formāts prasīja īpašu uzmanību. Emblēmas ieliktņiem 3 cm garumā bija nepieciešams QR, lai tas aizņemtu maksimāli pieejamo vietu — skenēšanas attālums būtu rokas stiepiena attālumā. Galda teltis 8 cm augstumā var ietvert dekoratīvu ierāmējumu ārpus klusās zonas. 4 metru reklāmkarogs prasīja aprēķinu: no parastā auditorijas attāluma (15–20 metri) moduļiem bija jābūt skaidri atšķiramiem ar tālruņu kamerām, kas nozīmēja, ka QR bija jāatrodas vismaz 80 cm reklāmkaroga dizainā.', 'Uzņēmums izveidoja izmēru rokasgrāmatu, kurā dokumentēti minimālie QR izmēri katram paredzamajam skenēšanas attālumam. Tas kļuva par atkārtoti izmantojamu līdzekli turpmākiem pasākumiem, novēršot minējumus no projektēšanas procesa.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Diagramma, kurā parādīta saistība starp skenēšanas attālumu, minimālo QR izmēru un moduļa izmēriem katram pasākuma formātam',
          caption: 'Izmēru matrica: aprēķināti izmēri, kas nodrošina uzticamu skenēšanu katra formāta paredzamajā skatīšanās attālumā',
        },
      ],
    },
    {
      heading: 'Ražošanas rezultāti',
      paragraphs: ['Konferences dienas validācija bija sistemātiska: darbinieki pārbaudīja katru izvietoto QR pirms durvju atvēršanas. Emblēmas ieliktņi tika skenēti uzreiz rokas stiepiena attālumā. Galda teltis uzticami darbojās sadales telpu mainīgajā apgaismojumā. Skatuves baneris – iepriekšējā pasākuma apmulsums – veiksmīgi noskenēts no skatītāju zonas vidus.', 'Vairāk nekā 2000 apmeklētāju netika reģistrētas nekādas skenēšanas sūdzības. Operatīvā uzvara bija vienlīdz nozīmīga: kad pēdējā brīža sponsora papildinājumam bija nepieciešamas jaunas izkārtnes, ražošanas komanda dažu minūšu laikā to ģenerēja no galvenā SVG, pārliecinoties, ka tas atbilst visam pārējam.', 'Skatiet mācību rokasgrāmatu par drukāšanai gataviem QR kodiem SVG un PNG lēmumu ietvaram un nodošanas paraugpraksi.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Pasākuma fotogrāfija, kurā redzams, kā dalībnieki veiksmīgi skenē QR kodus dažādos izmēros un attālumos visā pasākuma norises vietā',
          caption: 'Konferences dienas panākumi: uzticama skenēšana visos formātos, sākot no emblēmu tuvplāniem līdz skatuves reklāmkaroga attāluma kadriem',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Pārlūkot Uzziniet rakstus',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Gadījuma izpēte: lidostas atpūtas telpas digitālais displejs',
      paragraphs: ['Šis piemērs seko aviokompānijas atpūtas telpai, kas savos digitālajos sveiciena ekrānos izmantoja statiskus QR kodus. Ekrānos tika rādīts rotējošs reklāmas saturs, bet QR kods, kas paredzēts reģistrēšanās telpā, stāvēja stūrī, statisks un viegli nepamanāms. Analytics rādīja, ka tikai 15% piemēroto viesu izmantoja QR reģistrēšanos, lai gan tā bija ātrāka par galda rindu. Lielākā daļa viesu to vienkārši nepamanīja.', 'Hipotēze bija vienkārša: vizuāli noslogotā vidē ar kustīgu saturu statisks QR kļūst neredzams. Risinājums, kas nepieciešams, lai QR būtu pamanāms, neapdraudot uzticamību, kas nepieciešama reģistrēšanās plūsmai, kur neveiksmes nozīmētu neapmierinātus ceļotājus un garākas rindas pie galdiņiem.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Digitālais displejs lidostas atpūtas telpā, kurā redzams reklāmas saturs ar nelielu, statisku QR kodu stūrī',
          caption: 'Sākotnējā iestatīšana: statisks QR, kas pazudis dinamiska reklāmas satura jūrā, sasniedzot tikai 15% pārņemšanu',
        },
      ],
    },
    {
      heading: 'Drošas animācijas projektēšana',
      paragraphs: ['Atpūtas telpas digitālajās izkārtnēs tika izmantoti lieli LED paneļi — izaicinoša vide, kurā agresīva animācija var radīt skenēšanas problēmas. Dizaina komanda sāka konservatīvi: maiga pulsa efekts, kas smalki paplašināja un samazināja QR vizuālo klātbūtni, nemainot faktisko koda struktūru. Kadra laiks tika iestatīts lēns (250 ms), lai izvairītos no mirgošanas problēmām ar LED atsvaidzes intensitāti.', 'Drošā režīma validācija apstiprināja, ka katrs kadrs joprojām ir skenējams. Papildu testēšana faktiskajiem LED paneļiem atklāja, ka impulsam bija jābūt vēl smalkākam, nekā ieteica darbvirsmas priekšskatījumos — LED spilgtums un skata leņķi ietekmēja uztverto kontrastu vairāk, nekā gaidīts.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR animācijas iestatījumu panelis, kurā redzama impulsa konfigurācija: lēns laiks, smalka intensitāte, iespējots drošais režīms',
          caption: 'Animācijas konfigurācija: parametri, kas pielāgoti LED paneļa displejam, vienlaikus saglabājot skenēšanas uzticamību katrā kadrā',
        },
      ],
    },
    {
      heading: 'Integrācija ar apzīmējumu saturu',
      paragraphs: ['Animētais QR tika novietots tam paredzētajā ekrāna izkārtojuma "stabilajā zonā" — apgabalā, kas palika nemainīgs, kamēr reklāmas saturs rotēja galvenajā displeja apgabalā. Šī atdalīšana bija ļoti svarīga: QR skenēšanai bija nepieciešama vizuāla stabilitāte, pat piesaistot uzmanību ar savu smalko animāciju.', 'Blakus QR tika pievienots skaidrs aicinājums uz darbību: "Izlaist rindu — skenēt, lai reģistrētos". Teksts palika statisks, kamēr QR pulsēja, radot vizuālu hierarhiju, kas pievērsa uzmanību skenēšanas iespējai, nepārslogojot reklāmas saturu.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Ekrāna izkārtojuma diagramma, kurā redzams animēts QR attēls stabilā zonā, kamēr reklāmas saturs rotē galvenajā zonā',
          caption: 'Ekrāna nekustamā īpašuma piešķiršana: animētais QR aizņem stabilu zonu, kas ir nošķirta no rotējoša reklāmas satura',
        },
      ],
    },
    {
      heading: 'Tehniskā izvietošana',
      paragraphs: ['Animētais QR tika eksportēts kā GIF ar optimizētiem signage CMS iestatījumiem. Svarīgi bija faila lieluma apsvērumi — atpūtas telpas satura pārvaldības sistēmai bija augšupielādes ierobežojumi, un pārāk lieli faili izraisīja atskaņošanas stostīšanos. Galīgais eksports sabalansēja vizuālo kvalitāti ar faila lielumu, ierobežojot krāsu paleti un optimizējot kadru skaitu.', 'Izvietošana ietvēra atkāpšanos: ja GIF kāda iemesla dēļ neizdevās atskaņot, apzīmējumu sistēma parādīs statisku PNG dublējumu. Šī dublēšana nodrošināja, ka reģistrēšanās iespēja nekad netika zaudēta animācijas tehnisku problēmu dēļ.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'SPS saskarne, kas parāda animētu QR augšupielādi ar konfigurētu statisko atkāpšanās attēlu',
          caption: 'Signage CMS konfigurācija: animēta primārā ar statisku atkāpšanās iespēju, kas nodrošina reģistrēšanās iespēju nekad netiktu pārtraukta',
        },
      ],
    },
    {
      heading: 'Izmērītā ietekme',
      paragraphs: ['Pēc viena mēneša darbības QR reģistrēšanās pieņemšana palielinājās no 15% līdz 24% - relatīvais uzlabojums par 60%. Viesu atsauksmju aptaujas liecināja, ka animētais QR bija "vieglāk pamanāms" un "šķita modernāks". Raksturgaldu rindu laiks ievērojami samazinājās sastrēgumu periodos, jo vairāk viesu pašapkalpojās, izmantojot QR.', 'Svarīgi ir tas, ka, neraugoties uz tūkstošiem ikdienas skenēšanas, tika ziņots par nulles skenēšanas kļūmēm. Konservatīvā animācijas pieeja bija sasniegusi uzmanības mērķi, nezaudējot uzticamību, ko pieprasīja reģistrācijas plūsma. Pēc tam atpūtas telpa izlaida līdzīgus animētus QR attēlus citās vietās.', 'Skatiet mācību rokasgrāmatu par animētiem QR kodiem digitālajām norādēm, lai uzzinātu par drošas animācijas dizaina tehniskajiem principiem.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Informācijas panelis, kurā parādīts pieņemšanas līmeņa pieaugums, rindas laika samazinājums un skenēšanas uzticamība bez atteices izvietošanas periodā',
          caption: 'Viena mēneša dati: 60% ieviešanas pieaugums, samazināts rindas laiks un saglabāta perfekta skenēšanas uzticamība',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Pārlūkot Uzziniet rakstus',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Gadījuma izpēte: globālā produktu palaišanas QR kampaņa',
      paragraphs: ['Šis piemērs seko plaša patēriņa elektronikas uzņēmumam, kurš vienlaikus laiž klajā jaunu produktu 12 tirgos 8 valodās. Katrai reģionālajai mārketinga komandai bija jāizgatavo iepakojums, mazumtirdzniecības displeji un reklāmas materiāli ar QR kodiem, kas novirza uz lokalizētām produktu lapām. Iepriekšējās palaišanas rezultātā radās nekonsekvents QR stils, neregulāras skenēšanas kļūmes un konfigurācijas novirzīšanās "telefona spēle", jo katra komanda no ekrānuzņēmumiem no jauna izveidoja kodus.', 'Risinājums izmantoja ANQR koplietojamās konfigurācijas saites, lai izveidotu vienotu patiesības avotu, kuram varētu piekļūt katra reģionālā komanda neatkarīgi no saskarnes valodas. QR slodze izmantoja viedo novirzīšanu, kas noteica lietotāja valodu, tāpēc viens kods darbojās globāli, vienlaikus nodrošinot lokalizētu pieredzi.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Pasaules karte, kurā parādītas 12 tirgus atrašanās vietas ar QR kodiem, daži vizuāli neatbilst viens otram',
          caption: 'Izaicinājums: 12 tirgi, 8 valodas un nekonsekventas QR ieviešanas vēsture dažādos reģionos',
        },
      ],
    },
    {
      heading: 'Galvenās konfigurācijas izveide',
      paragraphs: ['Globālā zīmola komanda izveidoja autoritatīvu QR konfigurāciju ANQR: zīmola krāsas, kas atbilst produktu līnijas vizuālajai identitātei, kļūdu labojums H, lai nodrošinātu uzticamību visās drukas un digitālajās lietojumprogrammās, un stils, kas konsekventi atveidotos neatkarīgi no vietējām ražošanas metodēm. Konfigurācija tika bloķēta, un kopīgošanas saite tika dokumentēta globālajā kampaņas īsumā.', 'Būtiski, ka kodētais URL izmantoja valodas noteikšanas novirzīšanas pakalpojumu. Pēc skenēšanas lietotāji tika automātiski novirzīti uz viņu vietējās valodas produkta lapu. Tas nozīmēja, ka visi 12 tirgi varēja izmantot identiskus QR kodus — nebija nevienas tirgus kravnesības variācijas, kas varētu radīt kļūdas.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR saskarne, kas parāda galveno konfigurāciju ar zīmola krāsām, ECC H un viedās novirzīšanas URL',
          caption: 'Galvenā konfigurācija: globālie zīmolu standarti, kas iekodēti vienā, koplietojamā patiesības avotā',
        },
      ],
    },
    {
      heading: 'Reģionālās komandas darbplūsma',
      paragraphs: ['Katra reģionālā mārketinga komanda saņēma konfigurācijas saiti ar vienkāršiem norādījumiem: atveriet saiti, pārbaudiet, vai priekšskatījums atbilst zīmola vadlīnijām, eksportējiet lietojumprogrammai vajadzīgajā formātā. ANQR saskarne tika parādīta katras komandas izvēlētajā valodā, taču pamatā esošie QR iestatījumi palika identiski neatkarīgi no saskarnes valodas.', 'Kad Japānas komandai bija nepieciešams SVG augstas klases mazumtirdzniecības displejiem un Brazīlijas komandai PNG sociālajiem medijiem, abi tika eksportēti no vienas konfigurācijas. Kad Vācijas komandas drukas pārdevējs pieprasīja noteiktas krāsu vērtības, viņi varēja tieši atsaukties uz konfigurāciju, nevis uzminēt no ekrānuzņēmuma.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Ekrānuzņēmumi, kuros redzama viena un tā pati konfigurācijas saite, kas atvērta japāņu, portugāļu un vācu saskarnēs',
          caption: 'Tāda pati konfigurācija, dažādas saskarnes: reģionālās komandas strādā sev vēlamajā valodā, vienlaikus saglabājot globālo konsekvenci',
        },
      ],
    },
    {
      heading: 'Reģionālo atšķirību apstrāde',
      paragraphs: ['Dažiem tirgiem bija nepieciešami nelieli pielāgojumi. Ķīnas komandai sociālajai kopīgošanai bija nepieciešama versija ar WeChat optimizētu rāmi. Tā vietā, lai pārveidotu galveno, viņi izveidoja dokumentētu variantu ar savu konfigurācijas saiti, kas kampaņas līdzekļu bibliotēkā skaidri marķēta kā "CN-WeChat variants". Tas saglabāja izsekojamību, vienlaikus nodrošinot nepieciešamo lokalizāciju.', 'Zīmola komanda izveidoja vienkāršu noteikumu: jebkuram maģistra variantam bija nepieciešama jauna, dokumentēta konfigurācijas saite. Nekādu modifikāciju eksportētajos failos, bez "ātro labojumu" projektēšanas programmatūrā. Tas novērsa konfigurācijas novirzi, kas bija nomocījusi iepriekšējās palaišanas reizes.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Līdzekļu bibliotēkas saskarne, kurā parādīta galvenā konfigurācija un apstiprinātie reģionālie varianti, katrs ar savu saiti',
          caption: 'Kampaņas līdzekļu pārvaldība: galvenā konfigurācija un dokumentēti varianti, kas visi ir izsekojami, izmantojot konfigurācijas saites',
        },
      ],
    },
    {
      heading: 'Palaišanas rezultāti',
      paragraphs: ['Produktu izlaišanas dienā visos 12 tirgos vienlaikus tika izvietoti QR kodi iepakojumā, mazumtirdzniecības displejos, pasākumu materiālos un digitālajās kampaņās. Kvalitātes auditi apstiprināja vizuālo konsekvenci dažādos reģionos — QR informācija Tokijas mazumtirdzniecības displejos atbilda QR informācijai uz Sanpaulu iepakojuma, kas atbilda QR informācijai Berlīnes pasākumu baneros.', 'Visos tirgos tika ziņots par nulles skenēšanas kļūmēm. Kad pēc palaišanas bija jāmaina produkta lapas URL, novirzīšanas pakalpojums to apstrādāja nemanāmi — nebija nepieciešama atkārtota drukāšana. Globālā komanda lēsa, ka konfigurācijas saites pieeja ietaupīja vairāk nekā 40 stundu koordinācijas laika, salīdzinot ar iepriekšējo palaišanas metodoloģiju.', 'Skatiet mācību rokasgrāmatu par starpvalodu QR sadarbību, lai uzzinātu par globālās kampaņas konsekvences nodrošināšanas darbplūsmas principiem.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Fotogrāfiju režģis, kas parāda konsekventu QR izvietošanu dažādos tirgos: Tokijas mazumtirdzniecībā, Sanpaulu iepakojumā, Berlīnes pasākumos',
          caption: 'Panākta globāla konsekvence: identiska QR prezentācija 12 tirgos, neskatoties uz dažādām valodām, piegādātājiem un formātiem',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Pārlūkot Uzziniet rakstus',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Pārlūkot Uzziniet rakstus', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Atveriet pilnu lietotāja rokasgrāmatu', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Atveriet galeriju', type: 'gallery' },
  ],
};
