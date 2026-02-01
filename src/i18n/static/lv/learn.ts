import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Mācieties, izmantojot ANQR',
  description: 'Praktiski, biznesam domāti ceļveži QR kodu pārvēršanai reālos mārketinga aktīvos — ne tikai funkcionālos kvadrātos. Uzziniet, kā jaunināt mantotos tirdzniecības vietu kodus, izveidot saderīgus maksājumu QR signālus, sagatavot drukāšanai gatavu eksportēšanu, droši izmantot animāciju digitālajos displejos un koplietot bloķētas konfigurācijas daudzvalodu komandās, izmantojot ANQR ("enkura") saites.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Atveriet ģeneratoru', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Skatiet QR piemērus', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Atveriet pilnu lietotāja rokasgrāmatu', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Esošo QR kampaņu uzlabošana',
      paragraphs: ['Lielākajai daļai uzņēmumu QR kodi ir izkaisīti visā to darbībā — uz ēdienkartēm, stendiem, iepakojumiem un reklāmas materiāliem. Daudzi no šiem kodiem tika izveidoti pirms vairākiem gadiem, izmantojot pamata ģeneratorus, kā rezultātā tika izveidoti vispārīgi melnbalti kvadrāti, kas nerada pārliecību vai neatbilst jūsu zīmola identitātei. Šajā visaptverošajā rokasgrāmatā ir sniegta informācija par sistemātisku pieeju esošās QR infrastruktūras auditēšanai, jaunināšanai un optimizēšanai, netraucējot jau izveidotos klientu ceļus.', 'Stratēģiskā priekšrocība, ko sniedz QR kodu jaunināšana, nevis aizstāšana, ir nepārtrauktības saglabāšana. Jūsu klienti jau ir iemācījušies sagaidīt noteiktus galamērķus, kad viņi skenē jūsu kodus. Saglabājot kodētos URL identiskus, vienlaikus ievērojami uzlabojot vizuālo prezentāciju, skenēšanas uzticamību un zīmola saskaņošanu, jūs izveidojat nemanāmu pāreju, kas uzlabo uzticību, neprasot nekādas izmaiņas jūsu digitālajā infrastruktūrā vai analītikas izsekošanas jomā.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Blakus salīdzinājums, kurā redzams izbalējis, vispārīgs QR kods blakus modernai zīmola versijai, kas kodē to pašu URL',
          caption: 'Pirms un pēc: viens un tas pats galamērķa URL ir pārveidots no datēta vispārīga koda par profesionālu zīmola līdzekli',
        },
      ],
    },
    {
      heading: 'Kāpēc mantotie QR kodi nedarbojas?',
      paragraphs: ['QR kodi, kas izveidoti agrīnā ieviešanas posmā, jo īpaši 2020.–2021. gadā, kad uzņēmumi steidzās ieviest bezkontakta risinājumus, bieži cieš no vairākām kritiskām problēmām. Zemi kļūdu labošanas iestatījumi padara tos trauslus, drukājot uz teksturētām virsmām vai skatoties sarežģītā apgaismojumā. Nepietiekams kluso zonu skaits izraisa skenēšanas kļūmes, ja kodi tiek novietoti citu vizuālo elementu tuvumā. Vispārējais stils nespēj paziņot par zīmola leģitimitāti, radot vilcināšanos un samazinātu skenēšanas ātrumu.', 'Papildus tehniskajiem ierobežojumiem mantotie kodi bieži vien ir neizmantotas zīmola veidošanas iespējas. Katrs QR kods ir kontaktpunkts ar jūsu klientu — brīdis, kad viņš ir aktīvi iesaistīts un vēlas rīkoties. Profesionāli veidots kods, kas atbilst jūsu zīmola krāsām, ietver atbilstošas ​​drošības robežas un ietver izvēles zīmola elementus, pārvērš šo utilītu par mārketinga līdzekli, kas pastiprina jūsu identitāti katrā mijiedarbībā.'],
    },
    {
      heading: 'QR koda audita veikšana',
      paragraphs: ['Sāciet savu jaunināšanas projektu, izveidojot visaptverošu sarakstu ar katru QR kodu, kas pašlaik ir izvietots jūsu uzņēmumā. Dokumentējiet fizisko atrašanās vietu, kodēto galamērķi, drukātā materiāla pašreizējo stāvokli un tipisko skenēšanas vidi, tostarp apgaismojuma apstākļus un skata leņķus. Pārbaudiet katru kodu ar vairākām ierīcēm — vecāki viedtālruņi un budžeta ierīces bieži atklāj uzticamības problēmas, kuras tiek maskētas.', 'Pievērsiet īpašu uzmanību kodiem vietās, kur ir lielas likmes: maksājumu vietās, reģistrācijas zonās un reklāmas displejos, kur skenēšanas kļūme tieši ietekmē ieņēmumus vai klientu pieredzi. Tiem ir jāpiešķir prioritāte tūlītējai jaunināšanai. Ņemiet vērā arī kodus, kas tiek rādīti fotogrāfiju vai video saturā, jo, lai atjauninātu vizuālos līdzekļus, būs nepieciešama saskaņošana ar mārketinga komandu.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Kontrolsaraksta saskarne, kurā parādītas QR audita kategorijas: atrašanās vieta, stāvoklis, skenēšanas uzticamība un prioritātes vērtējums',
          caption: 'Sistemātiska QR audita veidne jaunināšanas kandidātu dokumentēšanai un prioritāšu noteikšanai',
        },
      ],
    },
    {
      heading: 'Drošas jaunināšanas stratēģija',
      paragraphs: ['QR jauninājumu galvenais noteikums ir galamērķa saglabāšana. Izņemiet precīzu URL no katra esošā koda un iekodējiet to identiski jaunajā versijā. Tas nodrošina, ka visa esošā analīze, novirzīšanas loģika un klientu vēlmes paliek neskartas. Ja jums ir nepieciešama galamērķa elastība turpmākiem atjauninājumiem, šis ir ideāls laiks, lai ieviestu īsu URL vai novirzīšanas pakalpojumu, taču ieviesiet to kā atsevišķu projektu, lai izvairītos no izmaiņu salikšanas.', 'Vizuālajai jaunināšanai izmantojiet uzlabojumus slāņos: vispirms nodrošiniet tehnisko uzticamību (atbilstoša kļūdu labošana un klusā zona), pēc tam pievienojiet zīmola stilu (krāsas, moduļu formas) un visbeidzot apsveriet papildu uzlabojumus (centra pārklājumus, rāmjus). Katrs slānis ir jāpārbauda, ​​​​pirms turpināt. ANQR drošais režīms palīdz īstenot šīs prioritātes, brīdinot, kad stila izvēle var apdraudēt skenējamību.'],
    },
    {
      heading: 'Zīmola identitātes pievienošana, neapdraudot uzticamību',
      paragraphs: ['Efektīvs QR zīmols līdzsvaro vizuālo ietekmi un skenēšanas uzticamību. Sāciet ar krāsu: nomainiet noklusējuma melno priekšplānu ar primāro zīmola krāsu, nodrošinot pietiekamu kontrastu uz fona. Lielākajai daļai zīmolu vislabāk darbojas tumšas krāsas uz gaiša fona. Izvairieties no zema kontrasta kombinācijām, gradientiem, kas samazina malu skaidrību, vai krāsām, kas parastos apgaismojuma apstākļos šķiet līdzīgas.', 'Moduļa formas pielāgošana piedāvā vēl vienu zīmola veidošanas iespēju ar minimālu ietekmi uz uzticamību. Noapaļoti moduļi rada maigāku, pieejamāku izskatu, vienlaikus saglabājot izcilu skenējamību. Punktu stila moduļi labi darbojas moderniem, moderniem zīmoliem. Savienotie moduļi ir piemēroti rūpnieciskai vai korporatīvai identitātei. Neatkarīgi no izvēlētā stila saglabājiet konsekvenci visos QR izvietojumos, lai nekavējoties atpazītu zīmolu.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Krāsu rata diagramma, kurā parādītas optimālas QR krāsu kombinācijas ar kontrasta attiecības indikatoriem',
          caption: 'Zīmola krāsu izvēles ceļvedis, kurā parādītas augsta kontrasta kombinācijas, kas nodrošina skenēšanas uzticamību',
        },
      ],
    },
    {
      heading: 'Testēšanas un validācijas protokols',
      paragraphs: ['Nekad neizvietojiet jauninātus QR kodus bez stingras pārbaudes. Drukājiet fizisku apliecinājumu precīzā izmērā un uz tā paša materiāla kā jūsu galīgā izvietošana. Lai ņemtu vērā apgaismojuma atšķirības, pārbaudiet faktiskajā vietā, kur kods atradīsies dažādos diennakts laikos. Izmantojiet vismaz trīs dažādas ierīces: pašreizējo vadošo tālruni, vidējas klases ierīci un vecāku vai budžeta viedtālruni.', 'Reģistrējiet katra testa skenēšanas laiku un veiksmes rādītājus. Labi optimizētam kodam vajadzētu skenēt 1–2 sekunžu laikā jebkurā modernā ierīcē. Ja novērojat konsekventas aizkaves vai kļūmes, samaziniet veidošanas intensitāti — noņemiet vai samaziniet pārklājumus, palieliniet klusās zonas izmēru vai pārslēdzieties uz augstāku kļūdu labošanas līmeni. Uzticamība vienmēr ir svarīgāka par vizuālo izsmalcinātību.'],
    },
    {
      heading: 'Konfigurācijas bloķēšana konsekvences nodrošināšanai',
      paragraphs: ['Kad esat apstiprinājis optimālo konfigurāciju, saglabājiet to, izmantojot ANQR koplietojamās saites. Tādējādi tiek izveidots pastāvīgs ieraksts par katru iestatījumu, kas izmantots jūsu apstiprinātā koda ģenerēšanai — krāsas, moduļa stils, kļūdu labošana, izmēri un jebkādi pārklājumi. Kopīgojiet šo saiti ar savu dizaina komandu, drukas pārdevējiem un ikvienu, kam nākotnē varētu būt nepieciešams pavairot kodu.', 'Šī konfigurācijas bloķēšana novērš pakāpenisku degradāciju, kas nomoka daudzas QR izvietošanas. Bez tā darbinieki atkārtoti izveido kodus no ekrānuzņēmumiem, dizaineri atjauno iestatījumus no atmiņas, un drukas pārdevēji veic "noderīgus" pielāgojumus. Katrs variants rada iespējamās problēmas. Ar bloķētu konfigurācijas saiti katra reprodukcija ir identiska jūsu pārbaudītajam, apstiprinātajam oriģinālam.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Diagramma, kurā parādīta konfigurācijas novirze: ekrānuzņēmumi, kas ved uz atpūtu, kas noved pie variantiem, pret vienu patiesības avota saiti',
          caption: 'Novērsiet konfigurācijas novirzi, izveidojot vienu autoritatīvu avotu visām QR reprodukcijām',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Skatiet QR piemērus',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR kodi mazumtirdzniecības maksājumiem',
      paragraphs: ['Maksājumu QR kodi darbojas visprasīgākajā mazumtirdzniecības vidē: darījuma brīdī. Klienti ir gatavi maksāt, bieži vien aiz viņiem veidojas rinda, un katra kavēšanās sekunde rada berzi. Tomēr šis augstspiediena moments ir arī galvenais zīmola nostiprināšanas īpašums. Šajā rokasgrāmatā ir paskaidrots, kā izveidot maksājumu QR kodus, kas nekavējoties tiek skenēti banku lietotnēs, vienlaikus nodrošinot profesionālu, zīmola izskatu, kas vairo klientu uzticību.', 'Maksājumu QR kodu pamatprincips ir uzticamība pār estētiku. Skaisti izstrādāts kods, kuru neizdodas skenēt viena klienta bankas lietotnē, jums izmaksās daudz vairāk par pamestiem darījumiem un neapmierinātiem klientiem, nekā to varētu radīt konservatīvs dizains. Sāciet ar atbilstību, pievienojiet uzticamību, pēc tam uzmanīgi iekļaujiet zīmolu tikai tur, kur tas neapdraud primāro funkciju.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Mazumtirdzniecības skaitītāja displejs, kurā redzams maksājuma QR kods, kas tiek skenēts ar viedtālruni ar bankas lietotni',
          caption: 'Maksājumu QR kodiem ir nekavējoties jādarbojas ar banku un maku lietotnēm reālos apstākļos',
        },
      ],
    },
    {
      heading: 'Izpratne par maksājumu QR standartiem',
      paragraphs: ['Maksājumu QR kodi parasti atbilst reģionālajiem standartiem, kas nosaka kravas formātu. Singapūrā PayNow QR izmanto īpašu formatējumu. Indijā UPI kodi atbilst BharatQR vai UPI dziļo saišu standartiem. Eiropas SEPA maksājumos tiek izmantoti EPC QR kodi. Katrs standarts pastāv, lai nodrošinātu, ka banku lietotnes var uzreiz atpazīt un apstrādāt maksājumu informāciju. Atkāpjoties no šiem standartiem — pat nedaudz, maksājumu lietotnes var noraidīt kodus, ko parastie kameru skeneri nolasa bez problēmām.', 'ANQR ietver galveno maksājumu standartu veidnes, kas automātiski formatē jūsu tirgotāja informāciju atbilstošā lietderīgā slodzē. Vienmēr izmantojiet šīs veidnes, nevis manuāli veidojiet maksājumu virknes, jo pat nelielas formatēšanas kļūdas var izraisīt darījumu kļūmes. Ja jūsu reģiona maksājumu standarts nav pieejams kā veidne, precīzas formatēšanas prasības skatiet maksājumu pakalpojumu sniedzēja tehniskajā dokumentācijā.'],
    },
    {
      heading: 'Izmēru noteikšana un izvietojums letes displejiem',
      paragraphs: ['Countertop QR kodi saskaras ar unikālām fiziskām problēmām. Klienti skenē rokas stiepiena attālumā, bieži vien leņķī, dažreiz caur šķaudīšanas aizsargiem vai vitrīnām. Gaismas apgaismojums rada atspīdumu plankumus. Kods konkurē ar citiem prettraucējumiem par uzmanību un skaidrām redzamības līnijām. Pielāgojiet maksājuma QR lielumu — lielākajai daļai skaitītāju ir ieteicams vismaz 4–5 cm, palielinot izmēru, ja kods atrodas aiz stikla vai vāji apgaismotā vietā.', 'Pozīcijai ir tikpat liela nozīme kā izmēram. Novietojiet kodu vietā, kur klienti var ērti turēt tālruni, nebloķējot rindu vai neveikli aizsniedzot tālruni. Pagrieziet displeju leņķī pret klientu, nevis novietojiet to plakaniski. Ja iespējams, izmantojiet matētu laminātu vai neatstarojošus displeja materiālus, lai samazinātu gaismas atspīdumu no augšējā apgaismojuma. Pārbaudiet galīgo izvietojumu dažādos dienas laikos, lai noskaidrotu apgaismojuma problēmas.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Diagramma, kurā parādīti optimālie QR izvietojuma augstumi un leņķi dažādām skaitītāja konfigurācijām',
          caption: 'Skaitītāja izvietošanas rokasgrāmata: optimāli augstumi, leņķi un attālumi uzticamai maksājumu skenēšanai',
        },
      ],
    },
    {
      heading: 'Konservatīvs zīmols maksājumu kodiem',
      paragraphs: ['Maksājumu lietotnes ir mazāk piedodošas nekā parastie kameru skeneri. Daudzas banku lietotnes izmanto vecākus, vienkāršākus QR lasīšanas algoritmus, kas optimizēti ātrumam, nevis elastībai. Tas nozīmē, ka stils, kas lieliski darbojas ar tālruņa kameru, var neizdoties ar noteiktām maksājumu programmām. Saglabājiet konservatīvu zīmolu: izmantojiet zīmola krāsu priekšplānā, ja tā saglabā spēcīgu kontrastu, taču izvairieties no gradientiem, smagiem pārklājumiem vai dekoratīviem elementiem, kas varētu traucēt atpazīšanu.', 'Ja vēlaties centra logotipu vai pārklājumu, saglabājiet to ļoti mazu — ne vairāk kā 10–15% no QR zonas — un rūpīgi pārbaudiet katru maksājumu lietotni, ko varētu izmantot jūsu klienti. Daudzi uzņēmumi izvēlas nepārklāt maksājumu kodus, paturot šo stilu QR kodu mārketingam, kur uzticamības prasības nav tik stingras. Maksājuma koda uzdevums ir apstrādāt darījumus, nevis radīt vizuālu iespaidu.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Salīdzinājums, kas parāda pieņemamu un riskantu zīmolu līmeņus maksājumu QR kodiem',
          caption: 'Maksājumu QR zīmolrades spektrs: no droša konservatīva stila līdz riskantām dekoratīvām pieejām',
        },
      ],
    },
    {
      heading: 'Materiālu un drukas apsvērumi',
      paragraphs: ['Fiziskā displeja materiāls būtiski ietekmē skenēšanas uzticamību. Glancētā laminēšana atstaro virsgaismas gaismas tieši klienta kamerā. Teksturēti materiāli var izkropļot moduļa malas. Lēta druka var aizmiglot smalkas detaļas. Maksājumu QR kodiem investējiet kvalitātē: izmantojiet matētu vai satīna laminēšanu, nodrošiniet augstas izšķirtspējas drukāšanu un nomainiet displejus, pirms tie ir nolietojušies. Saskrāpēts vai izbalējis maksājuma kods maksā jums darījumus.', 'Ņemiet vērā displeja izturību un nomaināmību. Displeji tiek aizskarti, pārvietoti, apšļakstīti un laiku pa laikam apgāzti. Izveidojiet displeja sistēmu tā, lai QR ieliktni varētu viegli nomainīt, nenomainot visu statīvu. Saglabājiet rezerves izdrukas, kas ģenerētas no jūsu bloķētās konfigurācijas saites, lai nolietotos kodus varētu nekavējoties apmainīt.'],
    },
    {
      heading: 'Testēšana ar Real Payment Apps',
      paragraphs: ['Vispārējie kameru skeneri atšifrēs gandrīz jebkuru saprātīgi formatētu QR kodu. Maksājumu lietotnes ir izvēlīgākas. Pirms jebkura maksājuma QR koda izvietošanas pārbaudiet to ar katru maksājumu lietotni, ko varētu izmantot jūsu klienti. Vairāku maksājumu vidēs tas var nozīmēt testēšanu ar vairākām banku lietotnēm, digitālajiem makiem un maksājumu platformām. Dokumentējiet pārbaudītās lietotnes un to versijas — maksājumu lietotnes tiek bieži atjauninātas, un atjauninājums var mainīt skenēšanas darbību.', 'Pārbaude reālos apstākļos: faktiskais displejs, faktiskais apgaismojums, faktiskais skenēšanas attālums. Kods, kas tiek skenēts uzreiz uz jūsu rakstāmgalda, pulksten 17:00 var tikt pie letes, kad pēcpusdienas saule rada atspīdumu. Izmēģiniet ar vecāko, lētāko viedtālruni, ko varat atrast – ja tas uzticami darbojas budžeta ierīcē, tas darbosies ar visu. Atzīmējiet jebkuru skenēšanas laiku, kas pārsniedz 2 sekundes, lai veiktu izmeklēšanu un iespējamo pārprojektēšanu.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Testēšanas kontrolsaraksts, kurā parādītas dažādas maksājumu lietotnes, ierīču veidi un vides apstākļi, kas jāpārbauda',
          caption: 'Visaptveroša maksājumu QR testēšanas matrica, kas aptver lietotnes, ierīces un vides faktorus',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Skatiet QR piemērus',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Drukāšanai gatavi QR kodi: SVG vs PNG',
      paragraphs: ['Atšķirība starp QR kodu, kas skenē perfekti, un kodu, kas neizdodas, bieži vien ir saistīts ar to, kā tas tika eksportēts un apstrādāts drukas darbplūsmā. Šajā rokasgrāmatā ir izskaidrotas kritiskās atšķirības starp vektora (SVG) un rastra (PNG) formātiem, kad tos izmantot un kā QR mākslas darbus nodot dizaineriem un drukas pārdevējiem tā, lai saglabātu skenēšanas uzticamību no vizītkartēm līdz stenda izmēra izkārtnēm.', 'Drukas ražošanā tiek ieviesti mainīgie, kas ekrānā nepastāv: tintes izkliede, substrāta tekstūra, apdares procesi un vairāku failu konvertēšanas kumulatīvā ietekme. QR kods, kas jūsu dizaina programmatūrā izskatās perfekti, var parādīties no printera ar mīkstinātām malām, samazinātu kontrastu vai smalki izkropļotiem moduļiem. Izpratne par formāta atlases un darbplūsmas paraugpraksi novērš šīs klusās kļūmes.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Palielināts skats, kurā salīdzināti vektoru QR moduļi ar skaidrām malām un rastra moduļi, kuros redzami pikseļu artefakti',
          caption: 'Vektors pret rastru drukas mērogā: precizitātes atšķirība, kas nosaka skenēšanas uzticamību',
        },
      ],
    },
    {
      heading: 'Kāpēc drukāšanai priekšroka tiek dota vektoram (SVG)',
      paragraphs: ['SVG faili apraksta QR kodus kā matemātiskas formas, nevis pikseļu režģus. Tas nozīmē, ka kodu var mērogot jebkurā izmērā — no 1 cm etiķetes līdz 10 metru reklāmkarogam — nezaudējot malu asumu. Printera RIP (rastra attēla procesors) atveido vektorus ar izvadierīces sākotnējo izšķirtspēju, nodrošinot, ka katra moduļa mala ir tik skaidra, cik to atļauj aparatūra. Nav ne interpolācijas, ne anti-aliasing artefaktu, ne uzkrāta izplūšana no vairākām izmēru maiņas darbībām.', 'Papildus mērogojamībai SVG faili ir izturīgāki profesionālajās darbplūsmās. Viņi izdzīvo turp un atpakaļ, izmantojot projektēšanas programmatūru, bez degradācijas. Tos var koriģēt bez atkārtotas paraugu ņemšanas. Tie ir tīri iegulti PDF failos, lai tie būtu gatavi presei. Jebkurai drukas lietojumprogrammai, kur kvalitātei ir nozīme, SVG ir jābūt noklusējuma eksporta formātam.'],
    },
    {
      heading: 'Kad PNG ir pieņemams',
      paragraphs: ['PNG kļūst nepieciešams, ja jūsu darbplūsma vai mērķa platforma neatbalsta vektoru formātus. Dažām tīmekļa platformām, norāžu CMS sistēmām un mantotajām drukas darbplūsmām ir nepieciešami rastra attēli. Šādos gadījumos PNG var darboties labi, taču tikai tad, ja ievērojat stingrus noteikumus: eksportējiet galīgajā fiziskajā izmērā un izšķirtspējā, pēc eksportēšanas nekad nepalieliniet mērogu un izvairieties no saspiešanas vai formāta konvertēšanas ar zaudējumiem.', 'Svarīgs PNG noteikums ir pirms eksportēšanas aprēķināt nepieciešamos pikseļu izmērus. Ja jūsu QR drukā 5 cm un printeris darbojas ar 300 DPI, jums ir nepieciešami aptuveni 590 pikseļi. Eksportējiet ar šo vai lielāku izmēru, pēc tam samaziniet mērogu, ja nepieciešams, — nekad nepalieliniet. Iekļaujiet šo informāciju faila nosaukumā vai metadatos, lai nākamie lietotāji nejauši neizmantotu izmēram raksturīgu eksportēšanu.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Kalkulatora saskarne, kas parāda saistību starp fizisko izmēru, DPI un nepieciešamajiem pikseļu izmēriem',
          caption: 'Drukas izšķirtspējas kalkulators: minimālo pikseļu izmēru noteikšana mērķa izvades izmēram',
        },
      ],
    },
    {
      heading: 'Paskaidrotas ANQR eksporta opcijas',
      paragraphs: ['ANQR piedāvā vairākus SVG eksportēšanas režīmus, lai tie atbilstu dažādām darbplūsmām. True Vector režīms nodrošina tīru uz ceļu balstītu izvadi, kas ir ideāli piemērota drukas un profesionāliem dizaina rīkiem. Kad esat pievienojis rastra pārklājumus vai noteiktus efektus, ANQR var tos iegult, vienlaikus saglabājot vektoru moduļus, vai arī varat eksportēt pilnībā rastrētu versiju ar norādīto izšķirtspēju. Izpratne par šīm opcijām palīdz izvēlēties pareizo eksportēšanas veidu katram lietošanas gadījumam.', 'PNG eksportam ANQR ļauj norādīt precīzus izmērus un ietver caurspīdīga fona opcijas. DPI iestatījums palīdz aprēķināt piemērotus izdrukas izmērus, taču atcerieties, ka DPI ir metadati — drukāšanai ir svarīgi, lai jūsu fiziskajam izmēram būtu pietiekami daudz pikseļu. Ja rodas šaubas, eksportējiet lielākus apjomus, nekā jums šķiet nepieciešams; samazināšana saglabā kvalitāti, savukārt palielināšana to iznīcina.'],
    },
    {
      heading: 'Failu sagatavošana pārsūtīšanai',
      paragraphs: ['Nododot QR mākslas darbus dizaineriem vai drukas pārdevējiem, iekļaujiet skaidras specifikācijas: paredzēto fizisko izmēru, minimālās klusās zonas prasības un visus krāsu telpas apsvērumus. Svarīgām lietojumprogrammām nodrošiniet gan SVG galveno, gan augstas izšķirtspējas PNG dublējumu, kas skaidri marķēts ar paredzēto lietojumu. Iekļaujiet savu ANQR konfigurācijas saiti, lai vajadzības gadījumā kodu varētu atjaunot.', 'Paredziet izplatītākās kļūdas nodošanas procesā. Skaidri norādiet, ka QR nedrīkst mērogot, pagriezt, sašķiebt vai izmantot efektus. Norādiet, ka klusajai zonai ir jāpaliek brīvai — nedrīkst iekļūt apgriešanas zīmes, reģistrācijas zīmes vai dizaina elementi. Ja QR tiks novietots uz krāsaina vai fotogrāfiska fona, nodrošiniet versiju ar necaurspīdīgu pamatnes formu, lai nodrošinātu atbilstošu kontrastu.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Failu pakotnes diagramma, kas parāda SVG galveno failu, PNG dublējumu, specifikāciju dokumentu un konfigurācijas saiti',
          caption: 'Profesionāla QR nodošanas pakotne: viss, kas dizainerim vai drukas pārdevējam nepieciešams precīzai reproducēšanai',
        },
      ],
    },
    {
      heading: 'Drukas apliecinājumu pārbaude',
      paragraphs: ['Nekad neapstipriniet tirāžu, neskenējot fizisku pierādījumu. Pieprasiet uz faktiskā pamatnes uzdrukātu apliecinājumu ar faktisko apdari, kas tiks izmantota ražošanā. Skenējiet pierādījumus apgaismojuma apstākļos, kas ir līdzīgi vietai, kur tiks parādīts pēdējais gabals. Testējiet ar vairākām ierīcēm, tostarp vecākiem viedtālruņiem, kuriem varētu būt problēmas ar minimālu kvalitāti.', 'Ja pierādījums tiek skenēts lēni vai nekonsekventi, pirms apstiprināšanas pārbaudiet. Bieži sastopamas problēmas ir nepietiekams kontrasts uz krāsainām pamatnēm, klusās zonas pārkāpumi apgriešanas dēļ, tintes izkliedēšanas mīkstināšanas moduļa malas vai laminēšana, kas rada atspīdumu. Jebkuru no tiem var atrisināt pirms apņemšanās nodrošināt pilnu tirāžu, taču tikai tad, ja jūs tos uztverat pārbaudes stadijā.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Pierādījumu pārskata kontrolsaraksts ar skenēšanas testa rezultātiem, kontrasta mērījumiem un apstiprinājuma parakstiem',
          caption: 'Drukas pierādījuma verifikācijas darbplūsma: sistemātiska pārbaude pirms ražošanas apjoma noteikšanas',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Skatiet QR piemērus',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Animētu QR kodu izveide',
      paragraphs: ['Animētie QR kodi apvieno standarta QR kodu funkcionalitāti ar uzkrītošām kustībām, kas ievērojami palielina iesaistīšanās līmeni. Digitālajos izkārtnēs, sociālajos saziņas līdzekļos un interaktīvos displejos animācija pārveido statisku lietderību pārliecinošā vizuālā elementā, kas piesaista acis un aicina mijiedarboties. Šajā rokasgrāmatā ir aprakstīti principi, paņēmieni un praktiskie ierobežojumi, lai izveidotu animētus QR kodus, kas uzticami skenē, vienlaikus nodrošinot vizuālu efektu.', 'Animētu QR kodu galvenais izaicinājums ir līdzsvarot vizuālo interesi un skenēšanas uzticamību. Katram kadram ir jābūt atsevišķi skenējamam — skeneris var uztvert kodu jebkurā animācijas cikla punktā. Šis ierobežojums nosaka katru dizaina lēmumu: kuri elementi var pārvietoties, cik daudz tie var mainīties un kam jāpaliek stabilam visā animācijas laikā.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Digitālo izkārtņu displejs, kurā redzams animēts QR kods, kas piesaista skatītāju uzmanību publiskajā telpā',
          caption: 'Animēti QR kodi digitālajās izkārtnēs: kustība, kas piesaista uzmanību un mudina skenēt',
        },
      ],
    },
    {
      heading: 'Kā animācija ietekmē skenējamību',
      paragraphs: ['QR skeneri darbojas, tverot vienu kadru un analizējot gaišo un tumšo moduļu modeli. Lai animēts kods darbotos, katrā kadrā ir jāietver pilns, derīgs QR raksts. Tas izslēdz animācijas, kas maina koda struktūru, izšķīdina moduļus vai būtiski maina kontrasta modeli. Datu nesošajiem moduļiem - šķietami nejaušajam modelim centrā - ir jāpaliek vizuāli stabilam visā garumā.', 'Drošas animācijas pieejas modificē elementus, kas nenes datus: fonus, krāsas, dekoratīvos rāmjus un pārklājuma elementus. Strukturālajiem komponentiem - meklētāja modeļiem (lielie stūra kvadrāti), laika modeļiem (mainīgās līnijas) un izlīdzināšanas modeļiem (mazāki kvadrāti lielākos kodos) - ir jāsaglabā savas pozīcijas un proporcijas. Darbs šo ierobežojumu ietvaros joprojām ļauj radīt pārsteidzoši dinamiskas un saistošas ​​animācijas.'],
    },
    {
      heading: 'Animācijas metodes, kas darbojas',
      paragraphs: ['Krāsu cikls animē priekšplāna un fona krāsas, izmantojot paleti, vienlaikus saglabājot pietiekamu kontrastu katrā solī. Tas rada dinamisku, uzmanību piesaistošu efektu ar minimālu skenēšanas risku – ja vien kontrasts nekad nenoslīd zem salasāmā līmeņa. ANQR krāsu cikla sākotnējie iestatījumi ir paredzēti, lai saglabātu skenējamību visa cikla laikā.', 'Animēti pārklājumi novieto kustīgus attēlus aiz daļēji caurspīdīga QR raksta. Kods paliek stabils, kamēr fons tiek animēts — iespējams, cilpas videoklips, animēti zīmola elementi vai abstrakta kustības grafika. Šis paņēmiens prasa rūpīgu intensitātes pārvaldību, lai fons nepārslogotu QR modeli, bet rada vizuāli pārsteidzošākos rezultātus.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Diagramma, kurā parādīta animēta QR slāņveida struktūra: stabils koda slānis virs animēta fona slāņa',
          caption: 'Animācijas slāņu princips: QR raksts paliek nemainīgs, bet fona elementi animē apakšā',
        },
      ],
    },
    {
      heading: 'Animācijas parametru konfigurēšana',
      paragraphs: ['Kadru nomaiņas ātrums ietekmē gan vizuālo gludumu, gan faila lielumu. Lielākajai daļai lietojumprogrammu 10–15 kadri sekundē nodrošina vienmērīgu kustību bez pārmērīga faila lieluma. Lielāks kadru nomaiņas ātrums samazina vizuālo atdevi, vienlaikus ievērojami palielinot failu izmērus. Apsveriet piegādes kontekstu — liela ciparzīme var apstrādāt lielākus failus nekā mobilās reklāmas izvietojums.', 'Ciklas darbība nosaka animācijas ciklu. Bezšuvju cilpas rada nepārtrauktu kustību, kas ir ideāli piemērota izkārtnēm un apkārtējās vides displejiem. Ping-pong (uz priekšu, pēc tam atpakaļ) cilpas labi darbojas vienkāršām animācijām. Lai iegūtu uzmanību piesaistošus impulsus, apsveriet animācijas ar aizturēšanu — klusuma periodus, ko caurvij kustība, kas piesaista aci bez pastāvīgas kustības noguruma.'],
    },
    {
      heading: 'Animētu pārklājumu izveide',
      paragraphs: ['Izmantojot animētus attēlus (GIF, animētus WebP vai video) kā pārklājumus, ANQR izņem kadrus un apvieno tos ar jūsu QR kodu. Pārklājuma intensitātes iestatījums nosaka, cik liela daļa animācijas tiek rādīta — zemākas vērtības nosaka skenējamību, bet augstākas vērtības dod priekšroku vizuālajam iespaidam. Pārbaudiet savu izvēlēto intensitāti vairākos kadros, lai nodrošinātu konsekventu skenējamību.', 'Izejmateriāla kvalitāte būtiski ietekmē rezultātus. Izmantojiet pārklājumus ar skaidriem objektiem un labu kontrastu. Izvairieties no avota animācijām ar strauji mirgojošu vai ārkārtēju spilgtuma maiņu, kas var radīt neregulārus zema kontrasta kadrus. Pirms eksportēšanas priekšskatiet visu animācijas ciklu, lai uztvertu visus problemātiskos kadrus, kurus varētu neizdoties skenēt.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Animēta pārklājuma skats pa kadram, kurā redzami visā secībā saglabātie kontrasta līmeņi',
          caption: 'Kadru analīze: konsekventas skenējamības pārbaude visā animācijas ciklā',
        },
      ],
    },
    {
      heading: 'Eksporta un piegādes apsvērumi',
      paragraphs: ['GIF joprojām ir visplašāk atbalstītais animācijas formāts, kas lielākajā daļā kontekstu tiek atskaņots automātiski, neprasot video atskaņotāja atbalstu. Tomēr GIF 256 krāsu palete ierobežo krāsu precizitāti. Krāsām kritiskām animācijām apsveriet animētu WebP, kur tas tiek atbalstīts, vai izmantojiet video formātus, lai iegūtu augstāko kvalitāti. ANQR GIF eksportā ir iekļautas atdalīšanas iespējas, lai maksimāli palielinātu kvalitāti paletes ierobežojumu ietvaros.', 'Faila lielumam ir nozīme piegādei. Digitālās norāžu sistēmas, e-pasta klienti un sociālās platformas bieži nosaka lieluma ierobežojumus. Ja jūsu animācija pārsniedz šos ierobežojumus, samaziniet kadru skaitu, izmērus vai krāsu dziļumu. Dažreiz, sadalot sarežģītu animāciju īsākā cilpā, tiek sasniegti labāki rezultāti nekā ar agresīvu saspiešanu, kas pasliktina katru kadru.'],
    },
    {
      heading: 'Animētu QR kodu testēšana',
      paragraphs: ['Lai pārbaudītu animētos kodus, ir jāveic skenēšana vairākos animācijas cikla punktos. Neskenējiet tikai vienu reizi un uzņemieties panākumus — skenējiet atkārtoti, dažādos brīžos, lai pārbaudītu, vai katrs kadrs ir lasāms. Īpašu uzmanību pievērsiet kadriem krāsu cikla galējās robežās vai pārklājuma intensitātes maksimumos, kur kontrasts var būt viszemākais.', 'Ja iespējams, pārbaudiet faktisko displeja aparatūru. Monitora krāsu kalibrēšana, skata leņķis un apkārtējais apgaismojums ietekmē animācijas izskatu un skenēšanu. Spilgta animācija, kas nevainojami skenē jūsu monitorā, var izplūst uz āra ekrāna vai kļūt nesalasāma slīpā skata leņķī.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Testēšanas matrica, kas parāda skenēšanas panākumus dažādos kadros, ierīcēs un displeja apstākļos',
          caption: 'Animēts QR testēšanas protokols: sistemātiska kadru, ierīču un skatīšanās apstākļu pārbaude',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Skatiet QR piemērus',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR drošības un atbilstības paraugprakse',
      paragraphs: ['Skaisti izstrādāts QR kods, kuru neizdodas skenēt, ir sliktāks par bezjēdzīgu — tas rada vilšanos klientiem, sabojā zīmola uztveri un izšķērdē visus tā izveidē un izplatīšanā ieguldītos resursus. Šajā rokasgrāmatā ir aprakstīti tehniskie un praktiskie faktori, kas nosaka, vai QR kods tiks skenēts droši, un kā izmantot ANQR drošības līdzekļus, lai konstatētu iespējamās problēmas, pirms tās nonāk ražošanā.', 'QR koda uzticamība nav bināra. Kods var lieliski skenēt vadošajos tālruņos, bet neizdoties budžeta ierīcēs. Tas var darboties ideālā apgaismojumā, bet grūti darboties blāvās restorānos vai spilgtā saules gaismā. Izpratne par faktoriem, kas ietekmē skenējamību, palīdz veikt apzinātus kompromisus starp vizuālo stilu un reālo uzticamību.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Uzticamības spektrs, kas parāda QR kodus, sākot no ļoti skenējamiem līdz nedaudz salasāmiem',
          caption: 'Skenējamības spektrs: no ložu necaurlaidīgiem kodiem līdz stilam, kas pārsniedz uzticamības robežas',
        },
      ],
    },
    {
      heading: 'Izpratne par kļūdu labošanas līmeņiem',
      paragraphs: ['QR kodi ietver iebūvētu dublēšanu, kas ļauj tos nolasīt pat tad, ja tie ir daļēji bojāti vai aizsegti. Kļūdu labošanas līmenis — L (7%), M (15%), Q (25%) vai H (30%) — nosaka, cik daudz koda var pietrūkt, vienlaikus dekodējot pareizi. Lielāka kļūdu labošana rada lielākus kodus, bet nodrošina drošības rezervi pārklājumiem, drukas nepilnībām un vides bojājumiem.', 'Kodiem ar attēla pārklājumiem kļūdu labošanas līmenis H ir būtisks — pārklājums fiziski aizēno koda daļu, un jums ir nepieciešama šī 30% dublēšana, lai saglabātu uzticamību. Tīriem, bez stila kodiem kontrolētā vidē bieži pietiek ar M līmeni. L līmenis ir jārezervē situācijām, kad koda lielums ir kritiski ierobežots un jūs varat garantēt neskartus apstākļus.'],
    },
    {
      heading: 'Kritiskā klusā zona',
      paragraphs: ['Klusā zona ir tukša mala, kas aptver katru QR kodu. Skeneri izmanto šo robežu, lai noteiktu, kur kods sākas un beidzas. ISO standarts nosaka minimālo kluso zonu, kas sastāv no četriem moduļiem (četras reizes lielāka par koda mazākā kvadrāta platumu). Šīs vietas pārkāpšana — ar dizaina elementiem, apdares malām vai blakus esošajam saturam — ir viens no biežākajiem skenēšanas kļūmju cēloņiem.', 'ANQR kluso zonu izpilde palīdz saglabāt šo kritisko atstarpi, taču jums arī jānodrošina, lai tā tiktu saglabāta jūsu gala dizainā. Nododot QR mākslas darbus, skaidri norādiet klusās zonas prasības. Ievietojot kodus izkārtojumos, pārbaudiet, vai šajā vietā neietilpst nekādi elementi. Daži milimetri brīvas vietas var nozīmēt atšķirību starp uzticamu skenēšanu un neapmierinātiem klientiem.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Diagramma, kas parāda pareizu kluso zonu atstatumu pret bieži sastopamiem pārkāpumiem, kas izraisa skenēšanas kļūmes',
          caption: 'Prasības klusai zonai: neredzamā robeža, kas nosaka skenēšanas panākumus',
        },
      ],
    },
    {
      heading: 'Kontrasta un krāsu drošība',
      paragraphs: ['QR skeneri nosaka gaišo un tumšo moduļu modeli. Jebkurš stils, kas samazina šo kontrastu — gaiši priekšplāni, tumši foni, gradienta efekti vai zemas necaurredzamības pārklājumi — padara kodu grūtāk lasāmu. ANQR aprēķina kontrasta attiecības un brīdina, kad jūsu krāsu izvēle tuvojas bīstamam līmenim, taču galīgais šķīrējtiesnesis vienmēr ir reālās pasaules pārbaude.', 'Krāsu uztvere mainās atkarībā no apgaismojuma apstākļiem. Krāsu kombināciju, kas monitorā šķiet augsta kontrasta, var būt grūti atšķirt siltā kvēlspuldzes apgaismojumā vai vēsās dienasgaismas lampās. Ja jūsu kods tiks izvietots dažādos apgaismojuma apstākļos, pārbaudiet vairākos gaismas avotos un kā drošības rezervi apsveriet konservatīvākas kontrasta attiecības.'],
    },
    {
      heading: 'Moduļa izmērs un skatīšanās attālums',
      paragraphs: ['Atsevišķu moduļu fiziskais izmērs nosaka maksimālo attālumu, no kura var skenēt kodu. Mazāki moduļi nozīmē mazākus kodus, bet tiem ir nepieciešams tuvāks skenēšanas attālums. Vispārīgais noteikums ir tāds, ka katram modulim ir jābūt vismaz 0,5 mm no paredzētā skenēšanas attāluma, proporcionāli mērogojot lielāku attālumu. Kodam uz stenda ir nepieciešami daudz lielāki moduļi nekā kodam uz vizītkartes.', 'Aprēķinot moduļa izmēru, ņemiet vērā sliktāko scenāriju: klients ar vecāku tālruni nepilnīgā apgaismojumā, skenēšanu no maksimālā iespējamā attāluma. Dizains šim lietotājam, un visiem pārējiem būs vēl labāka pieredze. ANQR lieluma ieteikumi ņem vērā šos reālās pasaules mainīgos, lai ieteiktu piemērotus izmērus jūsu paredzētajam lietojumam.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Diagramma par moduļa izmēru, drukas izmēriem un maksimālo efektīvo skenēšanas attālumu',
          caption: 'Skenēšanas attāluma rokasgrāmata: moduļa izmēra pielāgošana jūsu izvietošanas prasībām',
        },
      ],
    },
    {
      heading: 'ANQR drošības režīma izmantošana',
      paragraphs: ['ANQR drošais režīms nodrošina reāllaika atgriezenisko saiti par skenēšanas uzticamību. Tas uzrauga kontrasta attiecības, klusās zonas atbilstību, pārklājuma intensitāti un citus faktorus, kas ietekmē skenējamību. Kad kāds parametrs tuvojas riskantiem līmeņiem, jūs redzēsit brīdinājumus ar konkrētiem norādījumiem par to, kā uzlabot uzticamību. Profesionālai izvietošanai, kur kļūme ir dārga, saglabājiet drošā režīma aktivitāti visā projektēšanas procesā.', 'Drošajā režīmā ir iekļauta arī skenēšanas pārbaudes funkcija, kas mēģina atšifrēt jūsu ģenerēto kodu un ziņo par panākumiem vai neveiksmēm. Lai gan šī lietotnē veiktā verifikācija nevar atkārtot visus reālos apstākļus, tā novērš daudzas izplatītas problēmas, pirms ieguldāt drukāšanā vai izplatīšanā. Uztveriet veiksmīgu verifikāciju kā minimumu, nevis garantiju — reālās pasaules testēšana joprojām ir būtiska.'],
    },
    {
      heading: 'Reālās pasaules testēšanas protokoli',
      paragraphs: ['Nekāda programmatūras verifikācija neaizstāj fizisko testēšanu. Izdrukājiet kodu paredzētajā izmērā uz reprezentatīva materiāla. Pārbaudiet to faktiskajā izvietošanas vidē ar apgaismojuma apstākļiem, kas atbilst reālai lietošanai. Skenējiet, izmantojot vairākas ierīces — ne tikai savu vadošo tālruni, bet arī budžeta Android ierīces, vecākus iPhone tālruņus un citas konkrētas ierīces, ko jūsu auditorija parasti izmanto.', 'Sistemātiski dokumentējiet savu testēšanu. Pierakstiet, kuras ierīces tika pārbaudītas, kādos apstākļos, ar kādiem rezultātiem. Ja izvietojat kodus lielā mērogā, nosakiet pieņemšanas kritērijus: iespējams, 95% veiksmes rādītājs visā jūsu ierīču testa grupā vai veiksmīga skenēšana 2 sekunžu laikā visās pārbaudītajās ierīcēs. Šie standarti palīdz pieņemt lēmumus par aizliegumiem objektīvi, nevis cerēt uz labāko.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Visaptverošs testēšanas kontrolsaraksts, kas aptver ierīces, nosacījumus un pieņemšanas kritērijus',
          caption: 'QR izvietošanas testēšanas protokols: sistemātiska pārbaude pirms ražošanas apņemšanās',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Atveriet ģeneratoru',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Skatiet QR piemērus',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Skatiet QR piemērus', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Atveriet pilnu lietotāja rokasgrāmatu', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Atveriet galeriju', type: 'gallery' },
  ],
};
