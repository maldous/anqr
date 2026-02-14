import type { PageDefinition } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR-i näited',
  description: 'Viis reaalset tootmisstiilis näidet, mis näitavad, kus QR-koodid loovad mõõdetavat väärtust: pärand jaemüügi loenduri koodi täiustamine, kaubamärgiga jaemüügimaksed ja skannimistoimingud, printimise skaleerimine flaieritelt stendidele, animeeritud QR digitaalsete märgistuste jaoks ja keeleülene koostöö jagatavate ankrulinkide abil. Iga näide sisaldab pilte, praktilisi piiranguid ja remiksi linki tagasi generaatorisse.',
  lastUpdated: '1. veebruar 2026',

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avage generaator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Sirvi Learn artikleid', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Avage täielik kasutusjuhend', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Juhtumiuuring: jaemüügi loenduri QR-taseme tõus',
      paragraphs: ['See pärismaailma näide järgib väikest kohvikut, mis oli kolm aastat kasutanud oma letil sama QR-koodi. Algne kood genereeriti pandeemia ajal kiiresti, trükiti tavalisele paberile ja libistati plastalusele. See töötas endiselt - tehniliselt -, kuid kliendid vajasid sageli selle skannimiseks mitu katset ja see ei tugevdanud kohviku hoolikalt kujundatud kaubamärgi identiteeti.', 'Ümberkujundamine algas lihtsa auditiga: olemasolev kood kodeeris kohviku veebimenüü URL-i, mida taheti alles jätta. Väljakutse oli panna QR tundma end kohvikukogemuse osana, mitte 2020. aasta järelmõeldud utiliidina.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Ilmastikuga QR-kood plastikalusel, millel on nähtav kulumine, sõrmejäljed ja pleekinud trükk',
          caption: 'Lähtepunkt: kolm aastat letiteenust oli jätnud algse QR-i vaevu toimivaks',
        },
      ],
    },
    {
      heading: 'Algkoodi probleemide diagnoosimine',
      paragraphs: ['Testimine paljastas mitmeid probleeme: algses koodis kasutati veaparandust L (minimaalne liiasus), vaikses tsoonis oli ainult 2 moodulit ja see trükiti madala eraldusvõimega. Kohviku sooja volframvalgustuse all olid juba pleekinud mustad moodulid kolletunud paberiga vaevu kontrastsed. Vanemad telefonid nägid vaeva; uuemad telefonid õnnestusid, kuid märgatava viivitusega.', 'Lisaks tehnilistele probleemidele ei andnud üldine must-valge ruut kaubamärgi kohta midagi. Kliendid kõhklesid enne skannimist – peen usaldusbarjäär, mis vähendas seotust kohviku hoolikalt kujundatud digitaalse menüüga.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnostiline ülekate, mis näitab algse QR-i tehnilisi puudusi: madal ECC, minimaalne vaikne tsoon, halb kontrast',
          caption: 'Tehniline analüüs, mis näitab, miks pärandkood reaalsetes tingimustes halvemini toimis',
        },
      ],
    },
    {
      heading: 'Ülestõusmise protsess',
      paragraphs: ['ANQR-i abil lõi kohviku omanik koodi uuesti identse menüü URL-iga, kuid parandas oluliselt sätteid: veaparandus H maksimaalse vastupidavuse tagamiseks, 6-mooduliline vaikne tsoon piiride usaldusväärseks tuvastamiseks ja brändivärvid (sügavad bordoopunased moodulid kreemjas taustal), mis sobisid kohviku sisepaletiga.', 'Lisati väike keskosa kohviku logoga kattekiht, mida hoiti teadlikult peenena, et säilitada skaneeritavus, tagades samal ajal kaubamärgi kohese äratundmise. Ohutusrežiim kinnitas, et uus kujundus skanniti enne printimist kõigis testseadmetes usaldusväärselt.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR-liides, mis näitab konfiguratsiooni: brändi värvid, sobiv ECC, rikkalik vaikne tsoon, peen logo ülekate',
          caption: 'Täiendatud konfiguratsiooni loomine: kõik sätted, mis on valitud tasakaalustamaks kaubamärgi väljendust ja skannimise usaldusväärsust',
        },
      ],
    },
    {
      heading: 'Mõõdetavad tulemused',
      paragraphs: ['Pärast uue QR-i kasutuselevõttu professionaalsel matt-lamineeritud kartongil jälgis kohvik tulemusi nelja nädala jooksul. Skaneerimise õnnestumise määr paranes hinnanguliselt 70%-lt peaaegu 100%-le. Keskmine skannimisaeg langes 3–4 sekundilt alla 1 sekundi. Kõige olulisem on see, et menüüde seotus kasvas 40% – kliendid, kes varem viskasid QR-le pilgu ja loobusid, skaneerisid nüüd enesekindlalt.', 'Töötajad teatasid, et klientidel on vähem küsimusi QR-koodi kasutamise kohta ja pettunud klientide URL-i käsitsi sisestamise juhtudest. Brändi välimus tekitas ka vestlusi, kliendid kommenteerisid ühtset disaini positiivselt.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Võrdlus enne/pärast mõõdikutega: skannimise õnnestumise määr, keskmine skannimisaeg ja iganädalase skannimise arvu täiustused',
          caption: 'Nelja nädala andmed, mis näitavad läbimõeldud QR-taseme tõusu mõõdetavat mõju',
        },
      ],
    },
    {
      heading: 'Loo see konfiguratsioon uuesti',
      paragraphs: ['Kohviku konfiguratsioon demonstreerib konservatiivset, kuid tõhusat brändingut: veaparandus H, 6-mooduliline vaikne tsoon, suure kontrastsusega kaubamärgivärvid ja minimaalne keskosa. See tasakaal töötab enamiku jaemüügirakenduste puhul, kus usaldusväärsus peab olema esikohal, kuid kaubamärgi kohalolek on siiski oluline.', 'Avage generaator, kus need sätted on eellaaditud, ja kohandage värvid ja ülekate vastavalt oma kaubamärgile. Peamine arusaam: ainuüksi töökindluse täiustused võivad kaasatust märkimisväärselt suurendada, isegi enne visuaalse stiili lisamist.', 'Selle lähenemisviisi täieliku metoodika kohta vaadake seotud õppejuhendit olemasolevate QR-kampaaniate täiustamise kohta.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Viivitamatuks kohandamiseks on link generaatorile, mis on eelnevalt konfigureeritud kohviku sätetega',
          caption: 'Alustage tõestatud konfiguratsiooniga ja kohandage seda oma kaubamärgi jaoks',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Sirvi Learn artikleid',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Juhtumiuuring: mitme makse loenduri kuva',
      paragraphs: ['See näide järgib rõivaste butiikpoodi, mille registrisse oli kogunenud viis erinevat QR-koodi: pangamakse, jootraha, Instagram, Google\'i ülevaated ja töölevõtmise link. Igaüks neist loodi erinevast allikast, trükiti erinevatel aegadel ja kuvati mittevastavates stendides. Visuaalne kaos õõnestas poe hoolikalt kureeritud esteetikat ja töötajad tegelesid regulaarselt klientidega, kes skannisid vale koodi.', 'Lahendus nõudis murede eraldamist: maksekoodid vajasid maksimaalset usaldusväärsust konservatiivse stiiliga, samas kui turunduskoodid võiksid olla väljendusrikkamad. Tekkinud ühtne kuvamissüsteem näitab, kuidas tasakaalustada kaubamärgi kohalolekut erinevate QR-kasutusjuhtude funktsionaalsete nõudmistega.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Segane registriala, mis näitab viit mittevastavat QR-koodi erinevates stendides ja trükitud materjalides',
          caption: 'Kaootiline alguspunkt: viis lahti ühendatud QR-koodi, mis võistlevad tähelepanu pärast ja tekitavad klientides segadust',
        },
      ],
    },
    {
      heading: 'Maksekogemuse eelistamine',
      paragraphs: ['Poe peamine makseviis kasutas piirkondlikku standardit, mis nõudis kasuliku koormuse ranget järgimist. Testimine näitas, et isegi väike stiil mõjutas teatud pangarakenduste skannimise kiirust. Otsus: hoida makse QR täielikult muutmata, välja arvatud suuruse optimeerimine ja professionaalne printimine mattkaardile.', 'See konservatiivne lähenemine tähendas, et maksekood nägi välja vähem "kaubamärgiga" kui ideaalne, kuid tehingute lõpetamise määr paranes dramaatiliselt. Ülevaade: maksehetked ei ole brändingu võimalused – need on usaldusväärsuse hetked. Kliendid hindavad raha puhul kiirust ja kindlust esteetika asemel.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Puhas suur makse QR-kood professionaalsel mattkaardil, mis on registri juures silmapaistvalt paigutatud',
          caption: 'Makse QR: suures suuruses, professionaalselt trükitud, konservatiivse stiiliga, et pangarakendused saaksid kohe ära tunda',
        },
      ],
    },
    {
      heading: 'Teisese toimingu kuva loomine',
      paragraphs: ['Nõuannete, arvustuste, suhtluse ja palkamise jaoks võiks pood olla väljendusrikkam. Need koodid genereeriti uuesti ANQR-is koos ühtse brändistiiliga: poele iseloomulik oliiviroheline kreemjas, ümardatud mooduli stiil ja peen keskosa poe ikooniga. Veaparandus H tagas töökindluse isegi stiiliga.', 'Need neli koodi olid paigutatud kaubamärgiga paneelile, mis paiknes maksekoodi kõrval (ei konkureerinud sellega). Selged sildid poe tüpograafias selgitasid iga koodi eesmärki. Visuaalne hierarhia oli tahtlik: maksmine oli üksi ja silmapaistev; sekundaarsed toimingud, mis on rühmitatud valikuteks.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Kaubamärgiga paneel, millel on selgete siltidega neli stiilis QR-koodi näpunäidete, arvustuste, suhtlusvõrgustike ja värbamise jaoks',
          caption: 'Teisene tegevuspaneel: järjekindel bränding, selge märgistus, pigem valikuvõimalus kui segaja',
        },
      ],
    },
    {
      heading: 'Kuvasüsteemi disain',
      paragraphs: ['Füüsiline ekraan lahendas korraga mitu probleemi. Nii maksealusel kui ka sekundaarsel paneelil kasutati matte materjale, et kõrvaldada ülavalgustuse pimestamine. Kõrgused optimeeriti erineva kasvuga klientide jaoks. Nurgad, mis on suunatud pigem kliendijärjekorra poole, mitte leti peal.', 'Kriitiline on see, et pood lõi tagavaraprinte lukustatud ANQR-i konfiguratsioonilinkidest. Kui näpunäidete kood lõpuks kohvipritsmesse sattus, vahetasid töötajad selle mõne minuti jooksul salvestatud konfiguratsiooni kasutades välja – ei mingeid ekraanipilte, seadeid ei arvanud, kvaliteet ei halvenenud.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Diagramm, mis näitab ekraani füüsilist paigutust: kõrgused, nurgad, materjalid ning maksete ja teiseste kuvade seos',
          caption: 'Kuvasüsteemi kavand: füüsiline ergonoomika, mis on optimeeritud usaldusväärseks skannimiseks kõigis klientide kõrgustes ja valgustingimustes',
        },
      ],
    },
    {
      heading: 'Tegevuse täiustused',
      paragraphs: ['Kuus nädalat pärast kasutuselevõttu dokumenteeris pood olulisi täiustusi: klientide kaebuste puudumine "vale koodi" segaduse kohta, kiirem tehinguaeg ja 3-kordne vihjete esitamise arv (kliendid said nüüd vihjekoodi leida ja skannida ilma töötajatelt kohmakalt küsimata). Google\'i arvustused suurenesid ka, kuna spetsiaalne, hästi märgistatud QR eemaldas hõõrdumise.', 'Töötajate koolitus muutus lihtsamaks: "maksekood on suur, kõik muu on paneelil." Kui makserakendusi värskendati ja üks näitas korraks aeglasemat skannimist, siis konservatiivne maksekoodi kujundus tähendas, et see ikkagi töötas – pigem veidi aeglasemalt, kui täielikult ebaõnnestus.', 'Selle kuvasüsteemi kujunduse põhimõtete kohta vaadake jaemaksete QR-koodide õppimise juhendit.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Mõõdikute armatuurlaud, mis näitab enne/pärast võrdlusi: segadusjuhtumid, tehinguaeg, vihjete sagedus, ülevaatamise esildised',
          caption: 'Kuus nädalat tööandmeid, mis näitavad läbimõeldud mitme QR-kuvasüsteemi mõju äritegevusele',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Sirvi Learn artikleid',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Juhtumiuuring: visiitkaardist reklaamtahvlini',
      paragraphs: ['See näide järgib ürituste tootmisettevõtet, kes valmistub suureks konverentsiks. Nad vajasid sama QR-koodi – sündmuse rakendusega linkimist –, mida kasutati radikaalselt erinevates vormingutes: osaleja märgi lisad (3 cm), lauatelgikaardid (8 cm), registreerimislaua sildid (30 cm), teeotsimisplakatid (60 cm) ja massiivne lavatausta bänner (4 meetrit). Igal formaadil olid erinevad vaatamiskaugused, valgustingimused ja tootmise töövood.', 'Väljakutse ei olnud ainult tehniline – see oli toimiv. Mitmed tarnijad tegelesid erinevate prinditöödega ja ettevõte pidi tagama järjepidevad ja skannitavad tulemused olenemata sellest, kes mida tootis. Nende lahendus keskendus SVG ekspordile ja rangele üleandmise dokumentatsioonile.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kollaaž, mis näitab sama QR-koodi viies erinevas suuruses, märgist bännerini',
          caption: 'Üks QR-kood, viis juurutussuurust: väljakutse säilitada skaneeritavus sentimeetritest meetriteni',
        },
      ],
    },
    {
      heading: 'Miks oli eelmistel sündmustel probleeme?',
      paragraphs: ['Nende viimasel konverentsil oli ettevõte kogenud piinlikke ebaõnnestumisi. Lavabänner QR genereeriti väikese PNG-vormingus ja suurendati disainitarkvaras – tulemus tundus eemalt vaadates vastuvõetav, kuid seda ei õnnestunud publikult usaldusväärselt skaneerida. Märgi QR-koodid olid liiga kujundatud ja liiga väikesed, tekitades kontaktide lisamisel osalejaid masendavalt. Ebajärjekindlad seaded vormingute lõikes tähendasid, et "sama" QR nägi tegelikult iga tüki puhul erinev välja.', 'Sündmusejärgne analüüs paljastas algpõhjuse: ühest tõeallikast polnud. Iga disainer oli QR-i uuesti loonud veidi erinevate sätetega ja iga prindimüüja oli faile erinevalt töötlenud. Failide üleandmise telefonimäng halvenes kvaliteeti.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Lähivõtted, mis näitavad skannimise tõrkeid: pikslitega bännerimoodulid, alamõõdulised märgikoodid, ebaühtlane stiil erinevates vormingutes',
          caption: 'Varasemate sündmuste rikete kohtuekspertiisi analüüs: igas vormingus olid toodud erinevad kvaliteediprobleemid',
        },
      ],
    },
    {
      heading: 'SVG-esimene töövoog',
      paragraphs: ['Selle sündmuse jaoks kehtestas ettevõte range protokolli: üks põhi-QR genereeriti ANQR-is optimaalsete sätetega (veaparandus H, suuremeelne vaikne tsoon, puhas stiil), eksporditi SVG-vormingus ja salvestati ühe autoriteetse allikana. ANQR-i konfiguratsioonilink dokumenteeriti koos SVG-failiga, et koodi saaks vajadusel uuesti luua.', 'Kõik disainerid ja müüjad said sama SVG-meistri koos selgete juhistega: asetage nõutavale suurusele, ärge muutke, säilitage vaikse tsooni kliirens. Rastervorminguid nõudvate tarnijate jaoks pakkus ettevõte kindla suurusega eelrenderdatud PNG-sid koos selgete nimetamisreeglitega, mis näitavad kavandatud kasutust.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Failipakett, mis näitab SVG põhifaili, suurusepõhiseid PNG-sid, spetsifikatsioonidokumenti ja konfiguratsioonilinki',
          caption: 'Üleandmise pakett: kõik, mida müüjad vajasid ühtlaste tulemuste saamiseks ilma aimamata',
        },
      ],
    },
    {
      heading: 'Suuruspetsiifilised kaalutlused',
      paragraphs: ['Iga formaat nõudis erilist tähelepanu. 3 cm kõrgused märgid vajasid QR-d, et hõivata maksimaalselt saadaolevat ruumi – skannimiskaugus oleks käeulatuses. 8 cm kõrgustel laudtelgidel võiks olla dekoratiivne raamistus väljaspool vaikset tsooni. 4-meetrine bänner nõudis arvutust: tavapärasest publikukaugusest (15-20 meetrit) pidid moodulid olema telefonikaamerate abil selgelt eristatavad, mis tähendas, et QR pidi bänneri kujunduses olema vähemalt 80 cm kaugusel.', 'Ettevõte koostas suuruse juhendi, mis dokumenteeris iga eeldatava skannimiskauguse minimaalsed QR-mõõtmed. Sellest sai tulevaste sündmuste jaoks korduvkasutatav vara, mis eemaldas disainiprotsessist oletusi.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Diagramm, mis näitab iga sündmuse vormingu skannimiskauguse, QR-i minimaalse suuruse ja mooduli mõõtmete vahelist seost',
          caption: 'Suuruse maatriks: arvutatud mõõtmed, mis tagavad usaldusväärse skannimise iga formaadi eeldataval vaatamiskaugusel',
        },
      ],
    },
    {
      heading: 'Tootmise tulemused',
      paragraphs: ['Konverentsipäeva valideerimine oli süstemaatiline: töötajad testisid enne uste avamist iga kasutusele võetud QR-d. Märgi lisad skanniti kohe käeulatuses. Lauatelgid töötasid usaldusväärselt läbimurderuumide muutuva valgustusega. Lavabänner – eelmise ürituse piinlikkus – skaneeriti edukalt publikuala keskelt.', 'Rohkem kui 2000 osaleja kohta ei registreeritud skannimiskaebusi. Operatsioonivõit oli sama oluline: kui viimase hetke sponsori lisamine nõudis uut märgistust, genereeris tootmismeeskond selle mõne minutiga SVG-st, olles kindel, et see sobib kõige muuga.', 'Vaadake SVG vs PNG otsustusraamistiku ja üleandmise parimate tavade jaoks printimisvalmis QR-koodide õppimise juhendit.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Sündmuste fotograafia, mis näitab, kuidas osalejad skannivad edukalt QR-koode erinevates suurustes ja kaugustel kogu toimumiskohas',
          caption: 'Konverentsipäeva edu: usaldusväärne skaneerimine igas vormingus, alates märgi lähivõtetest kuni lavabänneri kaugvõteteni',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Sirvi Learn artikleid',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Juhtumiuuring: Airport Lounge\'i digitaalne ekraan',
      paragraphs: ['See näide järgib lennufirma salongi, mis kasutas oma digitaalsetel tervitusekraanidel staatilisi QR-koode. Ekraanidel kuvati pöörlevat reklaamsisu, kuid salongi sisseregistreerimise QR-kood seisis nurgas, staatiline ja kergesti tähelepanuta jäetud. Analüüs näitas, et ainult 15% sobilikest külalistest kasutas QR-sisseregistreerimist, kuigi see oli kiirem kui lauajärjekord. Enamik külalisi lihtsalt ei märganud seda.', 'Hüpotees oli lihtne: visuaalselt hõivatud liikuva sisuga keskkonnas muutub staatiline QR nähtamatuks. Lahendus, mis on vajalik QR-i märgatavaks muutmiseks, ilma et see kahjustaks registreerimisvoo usaldusväärsust, kus ebaõnnestumine tähendaks pettunud reisijaid ja pikemaid lauajärjekordi.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Lennujaama salongi digitaalne ekraan, mis näitab reklaamsisu koos väikese staatilise QR-koodiga nurgas',
          caption: 'Algne seadistus: staatiline QR, mis on kadunud dünaamilise reklaamsisu merre, saavutades vaid 15% kasutuselevõtu',
        },
      ],
    },
    {
      heading: 'Ohutu animatsiooni kujundamine',
      paragraphs: ['Salongi digitaalsel märgistusel kasutati suuri LED-paneele – väljakutseid pakkuv keskkond, kus agressiivne animatsioon võib skannimisprobleeme tekitada. Disainimeeskond alustas konservatiivselt: õrn pulsiefekt, mis laiendas ja kahandas peenelt QR-i visuaalset kohalolekut, muutmata tegelikku koodistruktuuri. Kaadri ajastus määrati aeglaseks (250 ms), et vältida LED-i värskendussagedusega seotud virvendusprobleeme.', 'Ohutusrežiimi valideerimine kinnitas, et iga kaader jäi skannitavaks. Tegelike LED-paneelide täiendav testimine näitas, et impulss peab olema veelgi peenem, kui töölaua eelvaates soovitati – LED-i heledus ja vaatenurgad mõjutasid tajutavat kontrasti oodatust rohkem.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR-i animatsiooni seadete paneel, mis näitab impulsi konfiguratsiooni: aeglane ajastus, peen intensiivsus, ohutusrežiim lubatud',
          caption: 'Animatsiooni konfiguratsioon: LED-paneeli ekraani jaoks häälestatud parameetrid, säilitades skannimise usaldusväärsuse igas kaadris',
        },
      ],
    },
    {
      heading: 'Integreerimine märgistussisuga',
      paragraphs: ['Animeeritud QR paigutati ekraanipaigutuse spetsiaalsesse "stabiilsesse tsooni" – piirkonda, mis jäi samaks, samal ajal kui reklaamsisu peamisel kuvaalal pöörles. See eraldamine oli ülioluline: QR vajas skannimiseks visuaalset stabiilsust isegi siis, kui tõmbas tähelepanu oma peene animatsiooniga.', 'QR-koodi kõrvale lisati selge üleskutse: „Jäta järjekord vahele – sisseregistreerimiseks skanni". Tekst jäi QR pulseerimise ajal staatiliseks, luues visuaalse hierarhia, mis tõmbas pilgu skannimisvõimalusele ilma reklaamisisu üle koormamata.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Ekraani paigutusskeem, mis näitab animeeritud QR-d stabiilses tsoonis, samal ajal kui reklaamsisu pöörleb põhialal',
          caption: 'Kinnisvarajaotuse kuvamine: animeeritud QR-ekraan on stabiilses tsoonis, mis on eraldi pöörlevast reklaamsisust',
        },
      ],
    },
    {
      heading: 'Tehniline juurutamine',
      paragraphs: ['Animeeritud QR eksporditi GIF-vormingus koos märgistus-CMS-i jaoks optimeeritud sätetega. Faili suuruse kaalutlused olid olulised – salongi sisuhaldussüsteemil olid üleslaadimispiirangud ja liiga suured failid põhjustasid taasesituse kogelemise. Lõplik eksport tasakaalustas visuaalse kvaliteedi ja faili suuruse, piirates värvipaletti ja optimeerides kaadrite arvu.', 'Juurutamine sisaldas varuvarianti: kui GIF-i mingil põhjusel ei õnnestunud esitada, kuvab märgistussüsteem staatilise PNG-varukoopia. See koondamine tagas, et sisseregistreerimise võimalus ei läinud kunagi animatsiooni tehniliste probleemide tõttu kaduma.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'CMS-i liides, mis näitab animeeritud QR-üleslaadimist koos konfigureeritud varupildiga',
          caption: 'Signage CMS-i konfiguratsioon: animeeritud esmane koos staatilise varuga, mis tagab, et registreerimisfunktsiooni ei katkestata kunagi',
        },
      ],
    },
    {
      heading: 'Mõõdetud mõju',
      paragraphs: ['Pärast ühekuulist tegutsemist kasvas QR-registri kasutuselevõtt 15%-lt 24%-le – suhteline paranemine on 60%. Külaliste tagasiside küsitlused näitasid, et animeeritud QR oli "kergemini märgatav" ja "tundus kaasaegsem". Lauajärjekorraajad vähenesid mõõdetavalt tippperioodidel, kuna rohkem külalisi teenindas QR-i kaudu iseteenindust.', 'Oluline on see, et vaatamata tuhandetele igapäevastele skannimistele ei teatatud ühtegi skannimistõrget. Konservatiivne animatsioon oli saavutanud tähelepanu eesmärgi, ohverdamata registreerimisvoo usaldusväärsust. Seejärel levitas salong sarnaseid animeeritud QR-e oma teistesse asukohtadesse.', 'Turvalise animatsiooni kujundamise tehniliste põhimõtete kohta vaadake juhendit Learn juhendist animeeritud QR-koodide kohta digitaalsete märgistuste jaoks.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Armatuurlaud, mis näitab kasutuselevõtu määra suurenemist, järjekorraaja lühenemist ja tõrkevaba skannimise usaldusväärsust juurutusperioodi jooksul',
          caption: 'Üks kuu andmeid: kasutuselevõtu suurenemine 60%, lühendatud järjekorraajad ja säilinud täiuslik skannimise töökindlus',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Sirvi Learn artikleid',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Juhtumiuuring: globaalne toote käivitamise QR-kampaania',
      paragraphs: ['See näide järgib olmeelektroonikaettevõtet, kes toob üheaegselt turule uue toote 12 turul 8 keeles. Iga piirkondlik turundusmeeskond pidi tootma pakendeid, jaemüügiväljapanekuid ja reklaammaterjale, mis sisaldasid QR-koode, mis viivad lokaliseeritud tootelehtedele. Varasemad käivitamised olid toonud kaasa ebaühtlase QR-stiili, aeg-ajalt skannimise tõrkeid ja konfiguratsiooni triivimise "telefonimängu", kuna iga meeskond lõi ekraanipiltidest koode uuesti.', 'Lahendus kasutas ANQR-i jagatavaid konfiguratsioonilinke, et luua ühtne tõeallikas, millele pääses juurde iga piirkondlik meeskond, olenemata liidese keelest. QR-koormus kasutas nutikat ümbersuunamist, mis tuvastas kasutaja keele, nii et üks kood töötas lokaliseeritud kasutuskogemuse pakkumisel globaalselt.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Maailmakaart, mis näitab 12 turu asukohta QR-koodidega, millest mõned on visuaalselt üksteisega vastuolus',
          caption: 'Väljakutse: 12 turgu, 8 keelt ja ebajärjekindlate QR-rakenduste ajalugu piirkondades',
        },
      ],
    },
    {
      heading: 'Põhikonfiguratsiooni loomine',
      paragraphs: ['Ülemaailmne brändimeeskond lõi ANQR-is autoriteetse QR-konfiguratsiooni: tootesarja visuaalse identiteediga sobivad brändivärvid, veaparandus H töökindluse tagamiseks kõigis trüki- ja digitaalrakendustes ning stiil, mis reprodutseerib järjepidevalt sõltumata kohalikest tootmismeetoditest. Konfiguratsioon lukustati ja jagamise link dokumenteeriti globaalses kampaania lühikirjelduses.', 'Kriitiline on see, et kodeeritud URL kasutas keelt tuvastavat ümbersuunamisteenust. Skaneerimisel suunati kasutajad automaatselt nende kohaliku keele tootelehele. See tähendas, et kõik 12 turgu said kasutada identseid QR-koode – puudusid turupõhised kasuliku koormuse variatsioonid, mis võiksid põhjustada vigu.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR-liides, mis näitab põhikonfiguratsiooni koos brändivärvidega, ECC H ja nutika ümbersuunamise URL-iga',
          caption: 'Põhikonfiguratsioon: globaalsed brändistandardid, mis on kodeeritud üheks jagatavaks tõeallikaks',
        },
      ],
    },
    {
      heading: 'Piirkondliku meeskonna töövoog',
      paragraphs: ['Iga piirkondlik turundusmeeskond sai konfiguratsioonilingi koos lihtsate juhistega: avage link, veenduge, et eelvaade vastab brändi juhistele, eksportige oma rakenduse jaoks vajalikus vormingus. ANQR-liides kuvatakse iga meeskonna eelistatud keeles, kuid selle aluseks olevad QR-sätted jäid liidese keelest sõltumata samaks.', 'Kui Jaapani meeskond vajas tipptasemel jaemüügiekraanide jaoks SVG-d ja Brasiilia meeskond sotsiaalmeedia jaoks PNG-d, eksporditi mõlemad samast konfiguratsioonist. Kui Saksa meeskonna prindimüüja nõudis konkreetseid värviväärtusi, võisid nad konfiguratsioonile otse viidata, mitte ekraanipildi põhjal arvata.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Ekraanipildid, mis näitavad sama konfiguratsioonilinki, mis on avatud jaapani, portugali ja saksa liidestes',
          caption: 'Sama konfiguratsioon, erinevad liidesed: piirkondlikud meeskonnad töötavad eelistatud keeles, säilitades samal ajal globaalse järjepidevuse',
        },
      ],
    },
    {
      heading: 'Piirkondlike erinevuste käsitlemine',
      paragraphs: ['Mõned turud vajasid väiksemaid kohandusi. Hiina meeskond vajas sotsiaalseks jagamiseks WeChati jaoks optimeeritud raamiga versiooni. Põhifaili muutmise asemel lõid nad oma konfiguratsioonilingiga dokumenteeritud variandi, mis oli kampaania varade teegis selgelt märgistatud kui „CN-WeChati variant". See säilitas jälgitavuse, võimaldades samal ajal vajalikku lokaliseerimist.', 'Brändimeeskond kehtestas lihtsa reegli: mis tahes variatsioon meistrilt nõudis uut dokumenteeritud konfiguratsioonilinki. Eksporditud failides ei tehta muudatusi, disainitarkvaras pole "kiirparandusi". See hoidis ära konfiguratsiooni triivi, mis oli varasemaid käivitamisi vaevanud.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Varade teegi liides, mis näitab põhikonfiguratsiooni ja heakskiidetud piirkondlikke variante, millest igaühel on oma link',
          caption: 'Kampaania varade haldamine: põhikonfiguratsioon ja dokumenteeritud variandid, kõik on jälgitavad konfiguratsioonilinkide kaudu',
        },
      ],
    },
    {
      heading: 'Käivitage tulemused',
      paragraphs: ['Toodete turuletoomise päeval kasutati QR-koode korraga kõikidel 12 turul pakendites, jaemüügiväljapanekutes, sündmuste materjalides ja digikampaaniates. Kvaliteediauditid kinnitasid visuaalset järjepidevust piirkondade lõikes – Tokyo jaemüügiekraanidel olev QR vastas São Paulo pakendil olevale QR-koodile Berliini sündmuste bänneritel.', 'Kõigil turgudel ei teatatud skannimise tõrgetest. Kui toote lansseerimisjärgset URL-i oli vaja muuta, käsitles ümbersuunamisteenus seda nähtamatult – uuesti printimist polnud vaja. Ülemaailmse meeskonna hinnangul säästis konfiguratsioonilingi lähenemisviis võrreldes nende eelmise käivitusmetoodikaga 40+ tundi koordineerimisaega.', 'Globaalse kampaania järjepidevuse tagamise töövoo põhimõtete kohta vaadake keeleülese QR-koostöö õppimise juhendit.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Fotode ruudustik, mis näitab QR-koodi ühtlast kasutuselevõttu erinevatel turgudel: Tokyo jaemüük, São Paulo pakend, Berliini sündmused',
          caption: 'Saavutatud ülemaailmne järjepidevus: identne QR-esitlus 12 turul, hoolimata erinevatest keeltest, hankijatest ja vormingutest',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Avage generaator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Sirvi Learn artikleid',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Sirvi Learn artikleid', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Avage täielik kasutusjuhend', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Avage galerii', type: 'gallery' },
  ],
};
