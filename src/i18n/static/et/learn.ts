import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Õppige ANQR-iga',
  description:
    'Praktilised ärikesksed juhendid QR-koodide muutmiseks tõelisteks turundusvaradeks – mitte ainult funktsionaalseteks ruutudeks. Siit saate teada, kuidas uuendada müügikoha pärandkoode, luua nõuetele vastavaid maksete QR-märke, valmistada ette printimisvalmis eksporti, kasutada digitaalekraanidel turvaliselt animatsioone ja jagada lukustatud konfiguratsioone mitmekeelsete meeskondade vahel, kasutades ANQR-i ("ankur") linke.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avage generaator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Avage täielik kasutusjuhend', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Olemasolevate QR-kampaaniate täiustamine',
      paragraphs: [
        'Enamikul ettevõtetel on QR-koodid hajutatud kogu oma tegevuses – menüüdel, lettidel, pakenditel ja reklaammaterjalidel. Paljud neist koodidest loodi aastaid tagasi põhigeneraatoritega, mille tulemuseks on üldised must-valged ruudud, mis ei tekita usaldust ega sobitu teie kaubamärgi identiteediga. See põhjalik juhend juhendab teid olemasoleva QR-infrastruktuuri auditeerimisel, uuendamisel ja optimeerimisel süstemaatiliselt, ilma et see häiriks teie juba loodud klienditeekondi.',
        'QR-koodide väljavahetamise asemel uuendamise strateegiline eelis seisneb järjepidevuse säilitamises. Teie kliendid on juba õppinud teie koode skannides teatud sihtkohti ootama. Hoides kodeeritud URL-id identsetena, parandades samal ajal dramaatiliselt visuaalset esitlust, skannimise töökindlust ja brändi joondust, loote sujuva ülemineku, mis suurendab usaldust, ilma et oleks vaja muuta teie digitaalset infrastruktuuri või analüütika jälgimist.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Kõrvuti võrdlus, mis näitab tuhmunud üldist QR-koodi kaasaegse kaubamärgiga versiooni kõrval, mis kodeerib sama URL-i',
          caption:
            'Enne ja pärast: sama sihtkoha URL on muudetud dateeritud üldisest koodist professionaalse kaubamärgiga varaks',
        },
      ],
    },
    {
      heading: 'Miks pärand QR-koodid ei toimi?',
      paragraphs: [
        'Varajases kasutuselevõtufaasis – eriti aastatel 2020–2021, mil ettevõtted tormasid kasutusele võtma kontaktivabu lahendusi – loodud QR-koodid kannatavad sageli mitme kriitilise probleemi all. Madalad veaparandussätted muudavad need tekstuursetele pindadele printimisel või keerulises valguses vaadates hapraks. Ebapiisavad vaiksed tsoonid põhjustavad skannimistõrkeid, kui koodid asetatakse muude visuaalsete elementide lähedusse. Üldine stiil ei suuda edastada kaubamärgi legitiimsust, põhjustades kõhklusi ja vähendades skannimissagedust.',
        'Lisaks tehnilistele piirangutele esindavad pärandkoodid sageli kasutamata jäänud kaubamärgivõimalusi. Iga QR-kood on kontaktpunkt teie kliendiga – hetk, mil ta on aktiivselt kaasatud ja valmis tegutsema. Professionaalselt kujundatud kood, mis sobib teie brändi värvidega, sisaldab sobivaid ohutusvarusid ja valikulisi kaubamärgiga elemente, muudab selle utiliidi turundusvaraks, mis tugevdab teie identiteeti igal suhtlusel.',
      ],
    },
    {
      heading: 'QR-koodi auditi läbiviimine',
      paragraphs: [
        'Alustage oma versiooniuuendusprojekti, luues põhjaliku loendi kõigist teie ettevõttes praegu kasutatavatest QR-koodidest. Dokumenteerige füüsiline asukoht, kodeeritud sihtkoht, prinditud materjali hetkeseisund ja tüüpiline skannimiskeskkond, sealhulgas valgustingimused ja vaatenurgad. Testige iga koodi mitme seadmega – vanemad nutitelefonid ja taskukohased seadmed paljastavad sageli töökindlusprobleeme, mida esmaklassilised telefonid varjavad.',
        'Pöörake erilist tähelepanu koodidele kõrge panusega kohtades: maksepunktid, sisseregistreerimise alad ja reklaamkuvad, kus skannimise ebaõnnestumine mõjutab otseselt tulusid või kliendikogemust. Need tuleks koheseks uuendamiseks prioriteediks seada. Pange tähele ka fotograafias või videosisus kuvatavaid koode, kuna need nõuavad visuaalsete varade värskendamiseks teie turundusmeeskonnaga kooskõlastamist.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Kontrollnimekirja liides, mis näitab QR-auditi kategooriaid: asukoht, seisund, skannimise usaldusväärsus ja prioriteetsuse hinnang',
          caption:
            'Süstemaatiline QR-auditi mall teie versiooniuuenduse kandidaatide dokumenteerimiseks ja tähtsuse järjekorda seadmiseks',
        },
      ],
    },
    {
      heading: 'Ohutu täiendamise strateegia',
      paragraphs: [
        'QR-uuenduste põhireegel on sihtkoha säilitamine. Ekstraheerige igast olemasolevast koodist täpne URL ja kodeerige see oma uues versioonis identselt. See tagab, et kogu olemasolev analüüs, ümbersuunamisloogika ja klientide ootused jäävad puutumatuks. Kui vajate tulevaste värskenduste jaoks sihtkoha paindlikkust, on see ideaalne aeg kaubamärgiga lühikese URL-i või ümbersuunamisteenuse kasutuselevõtmiseks, kuid rakendage seda eraldi projektina, et vältida muudatuste liitmist.',
        'Visuaalseks uuenduseks rakendage kihtides täiustusi: esmalt tagage tehniline töökindlus (sobiv veaparandus ja vaikne tsoon), seejärel lisage brändi stiil (värvid, mooduli kujundid) ja lõpuks kaaluge valikulisi täiustusi (keskmised ülekatted, raamid). Iga kiht tuleks enne jätkamist testimise teel valideerida. ANQR-i ohutusrežiim aitab neid prioriteete jõustada, hoiatades, kui stiilivalikud võivad skannitavust kahjustada.',
      ],
    },
    {
      heading: 'Brändi identiteedi lisamine usaldusväärsust kahjustamata',
      paragraphs: [
        'Tõhus QR-bränd tasakaalustab visuaalset mõju ja skannimise usaldusväärsust. Alustage värviga: asendage vaikimisi must esiplaan oma põhivärviga, tagades taustal piisava kontrasti. Enamiku kaubamärkide puhul sobivad kõige paremini tumedad värvid heledal taustal. Vältige madala kontrastsusega kombinatsioone, servade selgust vähendavaid gradiente või tavalistes valgustingimustes sarnaseid värve.',
        'Mooduli kuju kohandamine pakub veel üht brändinguvõimalust, millel on minimaalne mõju usaldusväärsusele. Ümardatud moodulid loovad pehmema ja paremini ligipääsetava välimuse, säilitades samas suurepärase skannitavuse. Punkt-stiilis moodulid sobivad hästi kaasaegsete tehnoloogiliste kaubamärkide jaoks. Ühendatud moodulid sobivad tööstusliku või ettevõtte identiteediga. Ükskõik millise stiili valite, säilitage järjepidevus kõigis QR-juurutustes, et brändi kohe ära tunda.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Värviratta diagramm, mis näitab optimaalseid QR-värvikombinatsioone koos kontrastsuse suhte indikaatoritega',
          caption:
            'Brändi värvivaliku juhend, mis näitab suure kontrastsusega kombinatsioone, mis säilitavad skannimise töökindluse',
        },
      ],
    },
    {
      heading: 'Testimis- ja valideerimisprotokoll',
      paragraphs: [
        'Ärge kunagi juurutage uuendatud QR-koode ilma range testimiseta. Printige lõpliku kasutuselevõtuga täpses suuruses ja samale materjalile füüsiline tõend. Katsetage tegelikus kohas, kus kood elab, erinevatel kellaaegadel, et võtta arvesse valgustuse erinevusi. Kasutage vähemalt kolme erinevat seadet: praegust lipulaeva telefoni, keskklassi seadet ja vanemat või soodsat nutitelefoni.',
        'Salvestage iga testi skannimisajad ja edukuse määrad. Hästi optimeeritud kood peaks skannima 1–2 sekundi jooksul igas mõistlikult kaasaegses seadmes. Kui näete püsivaid viivitusi või tõrkeid, vähendage stiili intensiivsust – eemaldage või vähendage ülekatteid, suurendage vaikse tsooni suurust või lülituge kõrgemale veaparandustasemele. Usaldusväärsus on alati visuaalse keerukuse ees ülimuslik.',
      ],
    },
    {
      heading: 'Konfiguratsiooni lukustamine järjepidevuse tagamiseks',
      paragraphs: [
        'Kui olete optimaalse konfiguratsiooni kinnitanud, säilitage see ANQR-i jagatavate linkide abil. See loob püsiva kirje kõigist teie kinnitatud koodi genereerimiseks kasutatud sätetest – värvid, mooduli stiil, veaparandus, suurus ja kõik ülekatted. Jagage seda linki oma disainimeeskonna, trükimüüjate ja kõigiga, kellel võib tekkida vajadus tulevikus koodi reprodutseerida.',
        'See konfiguratsioonilukk hoiab ära järkjärgulise halvenemise, mis vaevab paljusid QR-juurutusi. Ilma selleta loovad töötajad ekraanipiltidest koode uuesti, disainerid loovad sätted mälust uuesti ja prindimüüjad teevad „kasulikke" muudatusi. Iga variatsioon toob kaasa võimalikud probleemid. Lukustatud konfiguratsioonilingiga on iga reproduktsioon identne teie testitud ja heakskiidetud originaaliga.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Diagramm, mis näitab konfiguratsiooni triivi: ekraanipildid, mis viivad meelelahutusteni, mis viivad variantideni, versus üks tõeallika link',
          caption:
            'Vältige konfiguratsiooni triivimist, luues kõigi QR-reproduktsioonide jaoks ühe autoriteetse allika',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Vaadake QR-i näiteid',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR-koodid jaemaksete jaoks',
      paragraphs: [
        'Maksete QR-koodid toimivad jaekaubanduse kõige nõudlikumas keskkonnas: tehingu tegemise hetkel. Kliendid on valmis maksma, sageli tekib nende taha järjekord ja iga sekund tekitab hõõrdumist. Kuid see kõrgsurvemoment on ka peamine kinnisvara kaubamärgi tugevdamiseks. Selles juhendis selgitatakse, kuidas luua maksete QR-koode, mis skannivad pangarakendustes koheselt, pakkudes samas professionaalset kaubamärgiga välimust, mis suurendab klientide usaldust.',
        'Maksete QR-koodide põhiprintsiip on usaldusväärsus esteetilisuse ees. Kauni disainiga kood, mida ei õnnestu ühe kliendi pangarakenduses skannida, maksab teile hüljatud tehingute ja pettunud klientide puhul palju rohkem kui konservatiivne disain. Alustage vastavusest, lisage usaldusväärsus, seejärel lisage hoolikalt brändingusse ainult seal, kus see ei kahjusta peamist funktsiooni.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Jaemüügi loenduri ekraan, mis näitab makse QR-koodi, mida skannib nutitelefon pangarakendusega',
          caption:
            'Maksete QR-koodid peavad töötama koheselt panga- ja rahakotirakendustega reaalsetes tingimustes',
        },
      ],
    },
    {
      heading: 'Maksete QR-standardite mõistmine',
      paragraphs: [
        'Maksete QR-koodid järgivad tavaliselt piirkondlikke standardeid, mis määravad kasuliku koormuse vormingu. Singapuris kasutab PayNow QR spetsiifilist vormingut. Indias järgivad UPI koodid BharatQR-i või UPI sügavate linkide standardeid. Euroopa SEPA maksed kasutavad EPC QR-koode. Kõik standardid on olemas selleks, et pangarakendused saaksid makseteavet kohe ära tunda ja töödelda. Nendest standarditest – isegi veidi – kõrvalekaldumine võib põhjustada makserakenduste keeldumise koodidest, mida tavalised kaameraskannerid probleemideta loevad.',
        'ANQR sisaldab peamiste maksestandardite malle, mis vormindavad teie kaupmehe andmed automaatselt nõuetele vastavaks koormaks. Kasutage maksestringide käsitsi koostamise asemel alati neid malle, kuna isegi väikesed vormindusvead võivad põhjustada tehingu ebaõnnestumist. Kui teie piirkonna maksestandard pole mallina saadaval, vaadake täpsete vormindusnõuete kohta oma makseteenuse pakkuja tehnilist dokumentatsiooni.',
      ],
    },
    {
      heading: 'Letiekraanide suurus ja paigutus',
      paragraphs: [
        'Letipealsed QR-koodid seisavad silmitsi ainulaadsete füüsiliste väljakutsetega. Kliendid skaneerivad käeulatuses, sageli nurga all, mõnikord läbi aevastamiskaitsete või vitriinide. Overhead lighting creates glare spots. Tähelepanu ja selgete vaatejoonte pärast konkureerib kood teiste vastu segadustega. Mõõtke oma makse QR-i suurust heldelt – enamiku loendurirakenduste jaoks on soovitatav vähemalt 4–5 cm, suurendades selle suurust, kui kood asub klaasi taga või hämaras.',
        'Position matters as much as size. Asetage kood kohta, kus kliendid saavad mugavalt oma telefoni hoida ilma järjekorda blokeerimata või kohmakalt kätte saamata. Kallutage ekraan kliendi poole, mitte ei aseta seda tasaseks. Võimalusel kasutage matt-lamineerimist või mittepeegeldavaid kuvamaterjale, et minimeerida ülavalgustuse pimestamist. Valgustusprobleemide tuvastamiseks testige lõplikku paigutust erinevatel kellaaegadel.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Diagramm, mis näitab optimaalseid QR paigutuse kõrgusi ja nurki erinevate loenduri konfiguratsioonide jaoks',
          caption:
            'Loenduri paigutuse juhend: optimaalsed kõrgused, nurgad ja kaugused usaldusväärseks maksete skannimiseks',
        },
      ],
    },
    {
      heading: 'Maksekoodide konservatiivne kaubamärk',
      paragraphs: [
        'Makserakendused on vähem andestavad kui tavalised kaameraskannerid. Paljud pangarakendused kasutavad vanemaid ja lihtsamaid QR-lugemisalgoritme, mis on optimeeritud pigem kiiruse kui paindlikkuse jaoks. See tähendab, et telefoni kaameraga ideaalselt töötav stiil võib teatud makserakendustega ebaõnnestuda. Hoidke bränding konservatiivne: kasutage esiplaanil oma brändi värvi, kui see säilitab tugeva kontrasti, kuid vältige kaldeid, tugevaid ülekatteid või dekoratiivseid elemente, mis võivad tuvastamist segada.',
        'Kui soovite keskuse logo või ülekatet, hoidke see väga väikesena – mitte rohkem kui 10–15% QR-alast – ja testige põhjalikult iga makserakendusega, mida teie kliendid võivad kasutada. Paljud ettevõtted ei soovi konkreetselt maksekoode katta, jättes selle stiili QR-koodide turustamiseks, kus usaldusväärsuse nõuded on vähem ranged. Maksekoodi ülesanne on tehinguid töödelda, mitte visuaalselt muljet avaldada.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Võrdlus, mis näitab maksete QR-koodide vastuvõetavaid ja riskantseid kaubamärgitasemeid',
          caption:
            'Maksete QR-brändingu spekter: turvalisest konservatiivsest stiilist riskantsete dekoratiivsete lähenemisviisideni',
        },
      ],
    },
    {
      heading: 'Materjali ja trükiga seotud kaalutlused',
      paragraphs: [
        'Füüsiline kuvamaterjal mõjutab oluliselt skannimise usaldusväärsust. Läikiv lamineerimine peegeldab ülavalgust otse kliendi kaamerasse. Textured materials can distort module edges. Cheap printing can blur fine details. Maksete QR-koodide puhul investeerige kvaliteeti: kasutage matt- või satiinlamineerimist, tagage kõrge eraldusvõimega printimine ja vahetage ekraanid enne kulumist. Kriimustatud või pleekinud maksekood maksab teile tehinguid.',
        'Võtke arvesse ekraani vastupidavust ja vahetatavust. Letiekraane puudutatakse, liigutatakse, pritsitakse ja aeg-ajalt lükatakse ümber. Kujundage oma kuvasüsteem nii, et QR-i vahetükki saaks hõlpsasti vahetada ilma kogu alust välja vahetamata. Hoidke oma lukustatud konfiguratsioonilingi kaudu loodud tagavaraprindid valmis, et kulunud koode saaks kohe vahetada.',
      ],
    },
    {
      heading: 'Testimine pärismakserakendustega',
      paragraphs: [
        'Üldised kaameraskannerid dekodeerivad peaaegu iga mõistlikult vormindatud QR-koodi. Makserakendused on valivamad. Enne makse QR-koodi juurutamist testige seda iga makserakendusega, mida teie kliendid võivad kasutada. Mitme maksega keskkondades võib see tähendada testimist mitme pangarakenduse, digitaalse rahakoti ja makseplatvormiga. Dokumenteerige testitud rakendusi ja nende versioone – makserakendusi värskendatakse sageli ja värskendus võib skannimiskäitumist muuta.',
        'Testige realistlikes tingimustes: tegelik ekraan, tegelik valgustus, tegelik skaneerimiskaugus. Kohe teie töölaual skanniv kood võib kell 17.00 letil olla hädas, kui pärastlõunane päike tekitab pimestamist. Testige vanima odavaima nutitelefoniga, mille leiate – kui see töötab eelarveseadmes usaldusväärselt, töötab see kõigega. Uurimiseks ja võimalikuks ümberkujundamiseks märkige mis tahes skannimisaeg üle 2 sekundi.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Testimise kontroll-loend, mis näitab erinevaid makserakendusi, seadmetüüpe ja keskkonnatingimusi, mida kontrollida',
          caption:
            'Põhjalik maksete QR-testimaatriks, mis hõlmab rakendusi, seadmeid ja keskkonnategureid',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Vaadake QR-i näiteid',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Trükivalmis QR-koodid: SVG vs PNG',
      paragraphs: [
        'Erinevus suurepäraselt skanniva QR-koodi ja ebaõnnestuva QR-koodi vahel tuleneb sageli sellest, kuidas see eksporditi ja prinditöövoos käsitleti. Selles juhendis selgitatakse kriitilisi erinevusi vektor- (SVG) ja rastervormingute (PNG) vahel, millal neid kasutada ning kuidas QR-kunstiteoseid disaineritele ja prindimüüjatele üle anda viisil, mis säilitab skannimise usaldusväärsuse visiitkaartidest kuni stendisuuruste märkideni.',
        'Prinditootmine tutvustab muutujaid, mida ekraanil ei ole: tindi levik, substraadi tekstuur, viimistlusprotsessid ja mitme faili teisendamise kumulatiivne mõju. QR-kood, mis näeb teie disainitarkvaras täiuslik välja, võib printerist välja tulla pehmendatud servade, vähendatud kontrasti või peenelt moonutatud moodulitega. Vormingu valiku ja töövoo parimate tavade mõistmine hoiab ära need vaikivad tõrked.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Suurendatud vaade, mis võrdleb teravate servadega vektor-QR-mooduleid pikslite artefakte kuvavate rastermoodulitega',
          caption:
            'Vektor vs raster printimise skaalal: täpsuse erinevus, mis määrab skannimise töökindluse',
        },
      ],
    },
    {
      heading: 'Miks eelistatakse printimiseks vektorit (SVG)',
      paragraphs: [
        'SVG-failid kirjeldavad QR-koode pigem matemaatilisi kujundeid kui pikslite võrgustikke. See tähendab, et koodi saab skaleerida igale suurusele – alates 1 cm sildist kuni 10-meetrise bännerini – ilma servade teravuse kaotamata. Printeri RIP (Raster Image Processor) renderdab vektorid väljundseadme loomuliku eraldusvõimega, tagades, et iga mooduli serv on nii terav, kui riistvara võimaldab. Puudub interpolatsioon, antialiasing-artefaktid ega mitme suuruse muutmise toiminguga kogunenud hägusus.',
        'Lisaks skaleeritavusele on SVG-failid professionaalsetes töövoogudes tugevamad. Nad elavad edasi-tagasi läbi projekteerimistarkvara ilma halvenemiseta. Nende värvi saab korrigeerida ilma uuesti proovi võtmata. Need manustatakse puhtalt PDF-failidesse pressivalmis väljundiks. Kõigi prindirakenduste puhul, kus kvaliteet on oluline, peaks SVG olema teie ekspordi vaikevorming.',
      ],
    },
    {
      heading: 'Kui PNG on vastuvõetav',
      paragraphs: [
        'PNG muutub vajalikuks, kui teie töövoog või sihtkoha platvorm ei toeta vektorvorminguid. Mõned veebiplatvormid, märgistus-CMS-süsteemid ja pärandprintimise töövood nõuavad rasterkujutisi. Sellistel juhtudel võib PNG hästi töötada, kuid ainult siis, kui järgite rangeid reegleid: eksportige lõpliku füüsilise suuruse ja eraldusvõimega, ärge suurendage pärast eksportimist kunagi ja vältige kadudeta tihendamist või vormingu teisendamist.',
        'PNG-i kriitiline reegel on enne eksportimist arvutada pikslite mõõtmed. Kui teie QR prindib 5 cm ja teie printer töötab 300 DPI-ga, vajate umbes 590 pikslit. Eksportige selles või suuremas suuruses ja vajadusel vähendage – mitte kunagi üles. Lisage see teave oma failinimesse või metaandmetesse, et tulevased kasutajad ei kasutaks kogemata suurusepõhist eksporti.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Kalkulaatori liides, mis näitab seost füüsilise suuruse, DPI ja nõutavate pikslimõõtmete vahel',
          caption:
            'Prindieraldusvõime kalkulaator: teie sihtväljundi suuruse minimaalsete pikslite mõõtmete määramine',
        },
      ],
    },
    {
      heading: 'ANQR-i ekspordivõimaluste selgitus',
      paragraphs: [
        'ANQR pakub mitut SVG-ekspordirežiimi, mis sobivad erinevate töövoogudega. True Vector režiim loob puhta teepõhise väljundi, mis sobib ideaalselt trüki- ja professionaalsete disainitööriistade jaoks. Kui olete lisanud rasterkatteid või teatud efekte, saab ANQR need manustada, säilitades samas vektormoodulid, või saate eksportida täielikult rasterdatud versiooni oma määratud eraldusvõimega. Nende valikute mõistmine aitab teil valida iga kasutusjuhtumi jaoks õige ekspordi.',
        'PNG-ekspordi puhul võimaldab ANQR määrata täpsed mõõtmed ja sisaldab läbipaistva tausta valikuid. DPI-säte aitab teil arvutada printimiseks sobivad suurused, kuid pidage meeles, et DPI on metaandmed – printimisel on oluline, et teie füüsilise suuruse jaoks oleks piisavalt piksleid. Kahtluse korral eksportige suuremaks, kui arvate, et vajate; vähendamine säilitab kvaliteedi, suurendamine aga hävitab selle.',
      ],
    },
    {
      heading: 'Failide ettevalmistamine üleandmiseks',
      paragraphs: [
        'QR-kunsti disaineritele või prindimüüjatele edastamisel lisage selged spetsifikatsioonid: kavandatud füüsiline suurus, minimaalsed vaikse tsooni nõuded ja värviruumiga seotud kaalutlused. Kriitiliste rakenduste jaoks esitage nii SVG põhifail kui ka kõrge eraldusvõimega PNG-varukoopia, millele on selgelt märgitud nende kavandatud kasutus. Lisage oma ANQR-i konfiguratsioonilink, et koodi saaks vajadusel uuesti luua.',
        'Ennetage üleandmise protsessis levinud vigu. Öelge selgesõnaliselt, et QR-d ei tohiks skaleerida, pöörata, viltu pöörata ega efekte rakendada. Määrake, et vaikne tsoon peab jääma vabaks – ei tohi sisse tungida kärpimisjälgi, registreerimismärke ega kujunduselemente. Kui QR asetatakse värvilisele või fotograafilisele taustale, esitage piisava kontrasti tagamiseks läbipaistmatu taustakujuga versioon.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Failipaketi diagramm, mis näitab SVG põhifaili, PNG-varukoopiat, spetsifikatsioonidokumenti ja konfiguratsioonilinki',
          caption:
            'Professionaalne QR-ülekande pakett: kõik, mida disainer või prindimüüja vajab täpseks reprodutseerimiseks',
        },
      ],
    },
    {
      heading: 'Trükiproovide kontrollimine',
      paragraphs: [
        'Ärge kunagi kinnitage tiraaži ilma füüsilist prooviproovi skannimata. Taotlege tegelikule aluspinnale trükitud tõendit tegeliku viimistlusega, mida tootmises kasutatakse. Skannige tõendit valgustingimustes, mis on sarnased viimase osa kuvamiskohaga. Testige mitme seadmega, sealhulgas vanemate nutitelefonidega, mis võivad olla hädas marginaalse kvaliteediga.',
        'Kui tõend skannib aeglaselt või ebajärjekindlalt, uurige enne kinnitamist. Levinud probleemide hulka kuuluvad ebapiisav kontrastsus värvilistel aluspindadel, vaikse tsooni rikkumised kärpimisel, tindiga laialivalguvad pehmendusmooduli servad või lamineerimine, mis tekitab sära. Kõike neist saab käsitleda enne täielikule tiraažile pühendumist, kuid ainult siis, kui tabate need proovimise etapis.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Tõendusülevaate kontroll-loend skaneerimistesti tulemuste, kontrasti mõõtmiste ja kinnitusallkirjadega',
          caption:
            'Prinditõendi kontrollimise töövoog: süstemaatiline testimine enne tootmiskogustele pühendumist',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Vaadake QR-i näiteid',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Animeeritud QR-koodide loomine',
      paragraphs: [
        'Animeeritud QR-koodid ühendavad standardsete QR-koodide funktsionaalsuse pilkupüüdva liigutusega, mis suurendab märkimisväärselt kaasamise määra. Digitaalmärkides, sotsiaalmeedias ja interaktiivsetes kuvades muudab animatsioon staatilise utiliidi mõjuvaks visuaalseks elemendiks, mis tõmbab pilku ja kutsub suhtlema. See juhend hõlmab põhimõtteid, tehnikaid ja praktilisi piiranguid animeeritud QR-koodide loomisel, mis skannivad usaldusväärselt, pakkudes visuaalset mõju.',
        'Animeeritud QR-koodide peamine väljakutse on visuaalse huvi ja skannimise usaldusväärsuse tasakaalustamine. Iga kaader peab olema eraldi skannitav – skanner võib koodi jäädvustada animatsioonitsükli mis tahes punktis. See piirang kujundab iga disainiotsuse: millised elemendid võivad liikuda, kui palju nad võivad muutuda ja mis peab kogu animatsiooni jooksul stabiilseks jääma.',
      ],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Digitaalviitade ekraan, mis näitab animeeritud QR-koodi, mis köidab vaatajate tähelepanu avalikus ruumis',
          caption:
            'Animeeritud QR-koodid digitaalses märgistuses: liikumine, mis tõmbab tähelepanu ja julgustab skannima',
        },
      ],
    },
    {
      heading: 'Kuidas animatsioon mõjutab skaneeritavust',
      paragraphs: [
        'QR-skannerid töötavad ühe kaadri jäädvustamisel ning heledate ja tumedate moodulite mustri analüüsimisel. Animeeritud koodi toimimiseks peab iga kaader sisaldama täielikku kehtivat QR-mustrit. See välistab animatsioonid, mis muudavad koodi struktuuri, lahustavad mooduleid või muudavad oluliselt kontrastmustrit. Andmeid kandvad moodulid – näiliselt juhuslik muster keskel – peavad jääma kogu aeg visuaalselt stabiilseks.',
        'Turvalised animatsioonimeetodid muudavad elemente, mis ei kanna andmeid: tausta, värve, dekoratiivraame ja ülekatteelemente. Struktuurikomponendid – leidjamustrid (suured nurgaruudud), ajastusmustrid (vahelduvad jooned) ja joondusmustrid (väiksemad ruudud suuremates koodides) – peavad säilitama oma positsioonid ja proportsioonid. Nende piirangute raames töötamine võimaldab siiski üllatavalt dünaamilisi ja kaasahaaravaid animatsioone.',
      ],
    },
    {
      heading: 'Töötavad animatsioonitehnikad',
      paragraphs: [
        'Värvirežiim animeerib esiplaani ja tausta värve läbi paleti, säilitades samal ajal piisava kontrasti igal sammul. See loob elava, tähelepanu köitva efekti minimaalse skannimisriskiga – seni, kuni kontrastsus ei lange kunagi alla loetava taseme. ANQR-i värvitsükli eelseadistused on loodud skannitavuse säilitamiseks kogu tsükli vältel.',
        'Animeeritud ülekatted asetavad liikuvad kujutised poolläbipaistva QR-mustri taha. Kood jääb stabiilseks, kuni taust animeerib – võib-olla silmusvideo, animeeritud brändielemendid või abstraktne liikuv graafika. See meetod nõuab hoolikat intensiivsuse juhtimist, et taust ei saaks QR-mustrit üle koormata, kuid loob visuaalselt kõige silmatorkavamad tulemused.',
      ],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Diagramm, mis näitab animeeritud QR-i kihilist struktuuri: stabiilne koodikiht animeeritud taustakihi kohal',
          caption:
            'Animatsiooni kihistamise põhimõte: QR-muster jääb konstantseks, samal ajal kui taustaelemendid all animeeruvad',
        },
      ],
    },
    {
      heading: 'Animatsiooni parameetrite seadistamine',
      paragraphs: [
        'Kaadrisagedus mõjutab nii visuaalset sujuvust kui ka faili suurust. Enamiku rakenduste puhul tagab 10–15 kaadrit sekundis sujuva liikumise ilma liigsete failisuurusteta. Suurem kaadrisagedus vähendab visuaalset tulu, suurendades samal ajal oluliselt faili suurust. Arvestage oma edastamise konteksti – suur digimärk suudab käsitleda suuremaid faile kui mobiilireklaami paigutus.',
        'Silmuskäitumine määrab, kuidas animatsioon tsükkel käib. Õmblusteta silmused loovad pideva liikumise, mis sobib ideaalselt siltide ja ümbritsevate kuvade jaoks. Ping-pongi (edasi- ja siis tagasi) silmused sobivad hästi lihtsate animatsioonide jaoks. Tähelepanu köitvate impulsside jaoks kaaluge animatsioone, millel on kinnijäämine – paigalolekuperioodid, mida katkestab liikumine, mis tõmbab pilku ilma pideva liikumisest väsimata.',
      ],
    },
    {
      heading: 'Animeeritud ülekatete loomine',
      paragraphs: [
        'Animeeritud kujutiste (GIF-id, animeeritud WebP-d või video) kasutamisel ülekatetena eraldab ANQR raamid ja ühendab need teie QR-koodiga. Ülekatte intensiivsuse säte määrab, kui palju animatsioonist läbi näidatakse – madalamad väärtused seavad prioriteediks skannitavuse, kõrgemad aga visuaalset mõju. Testige valitud intensiivsust mitmes kaadris, et tagada ühtlane skannitavus.',
        'Lähtematerjali kvaliteet mõjutab oluliselt tulemusi. Kasutage selgete objektide ja hea kontrastiga ülekatteid. Vältige kiire vilkumise või äärmuslike heleduse muutustega allikaanimatsioone, mis võivad aeg-ajalt luua madala kontrastsusega kaadreid. Enne eksportimist vaadake kogu animatsioonitsükli eelvaadet, et tabada probleemsed kaadrid, mille skannimine võib ebaõnnestuda.',
      ],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Animeeritud ülekatte kaadrihaaval vaade, mis näitab kogu järjestuses säilinud kontrastsuse taset',
          caption:
            'Kaadri analüüs: järjepideva skannitavuse kontrollimine kogu animatsioonitsükli jooksul',
        },
      ],
    },
    {
      heading: 'Ekspordi- ja tarnekaalutlused',
      paragraphs: [
        'GIF on endiselt kõige laialdasemalt toetatud animeeritud vorming, mida esitatakse enamikus kontekstides automaatselt, ilma et oleks vaja videopleieri tuge. Kuid GIF-i 256-värviline palett piirab värvide täpsust. Värvikriitiliste animatsioonide puhul kaaluge animeeritud WebP-d, kus seda toetatakse, või pöörduge tagasi videovormingute juurde, et saavutada kõrgeim kvaliteet. ANQR-i GIF-eksport sisaldab valikuvõimalusi kvaliteedi maksimeerimiseks paleti piirangute piires.',
        'Faili suurus on kohaletoimetamisel oluline. Digitaalmärgisüsteemid, e-posti kliendid ja sotsiaalsed platvormid seavad sageli suurusepiirangud. Kui teie animatsioon ületab need piirangud, vähendage kaadrite arvu, mõõtmeid või värvisügavust. Mõnikord annab keerulise animatsiooni jagamine lühemaks tsükliks paremaid tulemusi kui agressiivne tihendamine, mis halvendab iga kaadrit.',
      ],
    },
    {
      heading: 'Animeeritud QR-koodide testimine',
      paragraphs: [
        'Animeeritud koodide testimine nõuab skannimist animatsioonitsükli mitmes punktis. Ärge skaneerige ainult üks kord ja eeldage edu – skannige korduvalt, erinevatel hetkedel, et kontrollida, kas iga kaader on loetav. Pöörake erilist tähelepanu kaadritele värvitsükli äärmuslikes piirides või ülekatte intensiivsuse tipptasemel, kus kontrast võib olla madalaim.',
        'Võimaluse korral testige tegelikku kuvari riistvara. Monitori värvide kalibreerimine, vaatenurk ja ümbritsev valgustus mõjutavad seda, kuidas animatsioon kuvatakse ja skannib. Ere animatsioon, mis skannib ideaalselt teie monitoril, võib väliekraanil tuhmuda või muutuda kaldse vaatenurga korral loetamatuks.',
      ],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Testimismaatriks, mis näitab skannimise õnnestumise määra erinevates kaadrites, seadmetes ja kuvatingimustes',
          caption:
            'Animeeritud QR-testimise protokoll: süstemaatiline kontrollimine kaadrite, seadmete ja vaatamistingimuste vahel',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Vaadake QR-i näiteid',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR-ohutuse ja vastavuse parimad tavad',
      paragraphs: [
        'Kauni disainiga QR-kood, mida skannimine ebaõnnestub, on hullem kui kasutu – see tekitab klientides frustratsiooni, kahjustab kaubamärgi tajumist ja raiskab iga selle loomisesse ja levitamisse investeeritud ressurssi. See juhend hõlmab tehnilisi ja praktilisi tegureid, mis määravad, kas QR-kood skannib usaldusväärselt, ja kuidas kasutada ANQR-i turvafunktsioone võimalike probleemide tuvastamiseks enne nende tootmist.',
        'QR-koodi usaldusväärsus ei ole binaarne. Kood võib lipulaevade telefonides ideaalselt skannida, kuid eelarveseadmetes ebaõnnestub. See võib töötada ideaalse valgustuse korral, kuid hämaras restoranis või eredas päikesevalguses võib see töötada. Skaneeritavust mõjutavate tegurite mõistmine aitab teil teha teadlikke kompromisse visuaalse stiili ja reaalse töökindluse vahel.',
      ],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Usaldusväärsuse spekter, mis näitab QR-koode väga skannitavatest kuni väheloetavateni',
          caption:
            'Skaneeritavuse spekter: kuulikindlatest koodidest kuni usaldusväärsuse piire nihutava stiilini',
        },
      ],
    },
    {
      heading: 'Veaparandustasemete mõistmine',
      paragraphs: [
        'QR-koodid sisaldavad sisseehitatud liiasust, mis võimaldab neid lugeda ka siis, kui need on osaliselt kahjustatud või varjatud. Veaparandustase – L (7%), M (15%), Q (25%) või H (30%) – määrab, kui palju koodist võib korrektselt dekodeerimisel puudu olla. Suurem veaparandus loob suuremad koodid, kuid annab ohutusvaru ülekatete, prindivigade ja keskkonnakahjustuste jaoks.',
        'Pildi ülekatetega koodide puhul on veaparandustase H hädavajalik – ülekate varjab osa koodist füüsiliselt ja usaldusväärsuse säilitamiseks on vaja seda 30% liiasust. Puhaste, stiilideta koodide jaoks kontrollitud keskkondades piisab sageli tasemest M. Tase L tuleks reserveerida olukordadeks, kus koodi suurus on kriitiliselt piiratud ja saate tagada puutumatud tingimused.',
      ],
    },
    {
      heading: 'Kriitiline vaikne tsoon',
      paragraphs: [
        'Vaikne tsoon on iga QR-koodi ümbritsev tühi veeris. Skannerid kasutavad seda piiri koodi alguse ja lõpu tuvastamiseks. ISO standard määrab minimaalse vaikse tsooni neljast moodulist (koodis oleva väikseima ruudu neli korda suurem). Selle ruumi rikkumine – kujunduselementide, trimmi servade või külgneva sisuga – on skannimistõrgete üks levinumaid põhjuseid.',
        'ANQR-i vaikse tsooni jõustamine aitab seda kriitilist vahekaugust säilitada, kuid peate ka tagama, et see säiliks teie lõplikes kujundustes. QR-pildi üleandmisel täpsustage selgelt vaikse tsooni nõuded. Paigutustes koodide paigutamisel veenduge, et sellesse ruumi ei tungiks ükski element. Mõni millimeeter vaba ruumi võib tähendada erinevust usaldusväärse skannimise ja pettunud klientide vahel.',
      ],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Diagramm, mis näitab õiget vaikse tsooni vahekaugust võrreldes tavaliste rikkumistega, mis põhjustavad skannimise tõrkeid',
          caption: 'Vaikse tsooni nõuded: nähtamatu veeris, mis määrab skannimise õnnestumise',
        },
      ],
    },
    {
      heading: 'Kontrasti ja värvi ohutus',
      paragraphs: [
        'QR-skannerid tuvastavad heledate ja tumedate moodulite mustri. Igasugune seda kontrasti vähendav stiil – heledad esiplaanid, tumedad taustad, gradiendiefektid või vähese läbipaistmatusega ülekatted – muudavad koodi raskemini loetavaks. ANQR arvutab kontrastsuse suhted ja hoiatab, kui teie värvivalikud lähenevad ohtlikule tasemele, kuid lõplik vahekohtunik on alati reaalne testimine.',
        'Värvitaju varieerub sõltuvalt valgustingimustest. Värvikombinatsiooni, mis paistab teie monitoril suure kontrastsusega, võib sooja hõõglambi või jahedate luminofoorlampide korral olla raske eristada. Kui teie koodi kasutatakse erinevates valgustingimustes, katsetage mitme valgusallikaga ja kaaluge ohutusvaruna konservatiivsemaid kontrastsussuhteid.',
      ],
    },
    {
      heading: 'Mooduli suurus ja vaatekaugus',
      paragraphs: [
        'Üksikute moodulite füüsiline suurus määrab maksimaalse kauguse, millest koodi saab skannida. Väiksemad moodulid tähendavad väiksemaid koode, kuid nõuavad väiksemat skannimiskaugust. Üldreegel on, et iga moodul peaks olema kavandatud skaneerimiskaugusel vähemalt 0,5 mm, suurendades seda proportsionaalselt suuremate vahemaade jaoks. Kood stendil vajab palju suuremaid mooduleid kui kood visiitkaardil.',
        'Mooduli suuruse arvutamisel arvestage halvima stsenaariumiga: vanema telefoniga klient, ebatäiuslik valgustus, skannib maksimaalse tõenäolise vahemaa tagant. Disain selle kasutaja jaoks ja kõik teised saavad veelgi parema kogemuse. ANQR-i suuruse soovitused võtavad arvesse neid reaalseid muutujaid, et soovitada teie kavandatud kasutuseks sobivaid mõõtmeid.',
      ],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Tabel, mis käsitleb mooduli suurust, prindimõõtmeid ja maksimaalset efektiivset skannimiskaugust',
          caption: 'Skannimiskauguse juhend: mooduli suuruse sobitamine teie juurutamisnõuetega',
        },
      ],
    },
    {
      heading: 'ANQR-i ohutusrežiimi kasutamine',
      paragraphs: [
        'ANQR-i ohutusrežiim annab reaalajas tagasisidet skannimise töökindluse kohta. See jälgib kontrastsuse suhet, vaikse tsooni vastavust, ülekatte intensiivsust ja muid skannitavust mõjutavaid tegureid. Kui mõni parameeter läheneb riskantsele tasemele, näete hoiatusi koos konkreetsete juhistega töökindluse parandamiseks. Professionaalsete juurutuste puhul, kus rike on kulukas, hoidke ohutusrežiim aktiivsena kogu projekteerimisprotsessi vältel.',
        'Ohutusrežiim sisaldab ka skannimiskinnitusfunktsiooni, mis püüab teie loodud koodi dekodeerida ja teatab õnnestumisest või ebaõnnestumisest. Kuigi see rakendusesisene kinnitamine ei saa replitseerida kõiki reaalseid tingimusi, tabab see palju levinud probleeme enne, kui investeerite printimisse või levitamisse. Käsitlege edukat kinnitamist kui miinimumi, mitte garantiid – reaalne testimine on endiselt hädavajalik.',
      ],
    },
    {
      heading: 'Reaalmaailma testimisprotokollid',
      paragraphs: [
        "Ükski tarkvara kontrollimine ei asenda füüsilist testimist. Printige oma kood soovitud suuruses esinduslikule materjalile. Katsetage seda tegelikus kasutuskeskkonnas tegelikule kasutamisele vastavate valgustingimustega. Skannige mitme seadmega – mitte ainult teie lipulaeva telefoniga, vaid ka soodsa hinnaga Android-seadmetega, vanemate iPhone'idega ja mis tahes konkreetsete seadmetega, mida teie vaatajaskond tavaliselt kasutab.",
        'Dokumenteerige oma testimine süstemaatiliselt. Pange kirja, milliseid seadmeid testiti, millistel tingimustel, milliste tulemustega. Kui juurutate koode laialdaselt, kehtestage aktsepteerimiskriteeriumid: võib-olla 95% edukuse määr kogu seadme testkogumis või edukad skannimised 2 sekundi jooksul kõigis testitud seadmetes. Need standardid aitavad muuta minemise/keelamise otsused objektiivseks, mitte loota parimat.',
      ],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Põhjalik testimise kontroll-loend, mis hõlmab seadmeid, tingimusi ja aktsepteerimiskriteeriume',
          caption:
            'QR-kasutuse testimise protokoll: süstemaatiline kontrollimine enne tootmiskohustust',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Vaadake QR-i näiteid',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Avage täielik kasutusjuhend', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Avage galerii', type: 'gallery' },
  ],
};
