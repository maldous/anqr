import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR-i kasutusjuhend',
  description: 'Täielik juhend ANQR-i kasutamiseks QR-koodide loomiseks.',
  lastUpdated: '1. veebruar 2026',
  breadcrumb: ['Juhend'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avage generaator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Sirvi Learn artikleid', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Alustamine',
      paragraphs: ['ANQR on kliendikeskse lähenemisega QR-koodi generaator. Vaikimisi genereeritakse QR-koodid teie brauseris lokaalselt – kontot pole vaja ja teie andmed jäävad privaatseks. Professionaalseks manustamiseks võite kasutada ka serveripoolset API-d.', 'Liidesel on kolm liidese taset: Basic, Advanced ja Professional. Valige oma tase päises olevate vahekaartide abil. Iga tase avab lisafunktsioonid, hoides samal ajal liidese keskendunud sellele, mida vajate.'],
      bullets: ['Põhiline: lihtne QR-koodi loomine lihtteksti/URL-i sisu ja pildi ülekattega.', 'Täiustatud: QR-kodeeringu valikud, renderdusstiilid, animatsioon, väljundvormingud, laiendatud sisutüübid ja ülekatte kohandamine.', 'Professionaalne: vesimärgid, metaandmed, jagamine, ohutusanalüüs, maksete QR-koodid ja ettevõtte funktsioonid.'],
      links: [{ href: '/?lang=${lang}', label: 'Avage generaator', type: 'generator' }],
    },
    {
      heading: 'Kiire algus',
      paragraphs: ['Esimese QR-koodi loomiseks tehke järgmist.'],
      bullets: ['1. Valige rippmenüüst Sisu tüüp sisutüüp (URL, tekst, WiFi jne).', '2. Sisestage oma andmed ettenähtud väljadele.', '3. Soovi korral kohandage värve, stiile ja lisage ülekattepilt.', '4. Klõpsake nuppu Ekspordi, et laadida alla oma QR-kood PNG-, GIF-, WebP- või SVG-vormingus.'],
      links: [{ href: '/?lang=${lang}', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Põhifunktsioonid',
      paragraphs: ['Põhitase pakub sujuvamat liidest kasuliku koormuse sisu ja kujutise ülekatetega QR-koodide loomiseks. See on lihtsaim viis alustamiseks.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Sisutüübid (põhiline)',
      paragraphs: ['Lihttekst: kodeerige mis tahes tekst kuni QR-koodi mahupiiranguni. Ideaalne lühisõnumite, koodide või identifikaatorite jaoks.', 'URL: kodeerige veebiaadressid. QR-kood avab skannimisel URL-i. Toetab http:// ja https:// protokolle.'],
    },
    {
      heading: 'Pildi ülekate (tavaline)',
      paragraphs: ['Laadige üles pilt (JPG, PNG, GIF, WebP), mis sobib teie QR-koodiga. Ülekatte põhifunktsioonid hõlmavad järgmist:'],
      bullets: ['Laadi üles failist: valige oma seadmest pilt.', 'Laadi URL-ist: sisestage pildi URL (peab lubama CORS-i).', 'Keskmise logo: asetab pildi keskele, tuginedes veaparandusele.', 'Segamine: pildi lihtne alfa-segamine QR-mustriga.', 'Intensiivsus: juhib, kui tugevalt ülekate QR-koodi mõjutab (0–100%).', 'Värvirežiim: täisvärviline, halltoonid või mustvalge.', 'Säilitage leidja mustrid: usaldusväärse skannimise tagamiseks hoiab nurgamustrid muutmata.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Täiustatud funktsioonid',
      paragraphs: ['Täiustatud tase avab QR-kodeeringu valikud, renderdusstiilid, animatsioonid, väljundvormingud, laiendatud sisutüübid ja täiustatud ülekatte kohandamise.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'QR-kodeeringu seaded',
      paragraphs: ['Versioon: QR-koodid on versioonides 1–40, kõrgemates versioonides on rohkem andmeid, kuid need on suuremad. Määrake väärtusele 0 (Automaatne), et lasta ANQR-il valida väikseima versiooni, mis sobib teie sisuga.', 'Veaparandus: määrab, kui palju kahjustusi QR-kood võib skannitavaks jääda.'],
      bullets: ['L (Madal): 7% veaparandus – väikseim suurus, vähim liiasus.', 'M (Medium): 15% veaparandus – tasakaalustatud valik.', 'Q (Kvartiil): 25% veaparandus - hea trükitud koodide jaoks.', 'H (kõrge): 30% veaparandus – parim ülekattega koodide või karmides tingimustes.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Vaikne tsoon (marginaal)',
      paragraphs: ['Vaikne tsoon on QR-koodi ümber olev valge ruum. Skannerid vajavad seda varu, et tuvastada, kust kood algab. Standard soovitab vähemalt 4 moodulit. Vähendamine alla 4 võib põhjustada skannimisprobleeme.'],
    },
    {
      heading: 'Mooduli stiil',
      paragraphs: ['Moodulid on üksikud ruudud, mis moodustavad QR-koodi. ANQR pakub viit stiili:'],
      bullets: ['Ruut: klassikaline QR-välimus teravate nurkadega.', 'Ümardatud: pehmendatud nurgad sõbralikuma välimuse saamiseks.', 'Täpid: ümmargused moodulid kaasaegse esteetika jaoks.', 'Teemant: 45° pööratud ruudud eristuva mustri saavutamiseks.', 'Ühendatud: moodulid ühinevad kõrvuti asetsedes, luues orgaanilisi kujundeid.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Leidja mustri stiil',
      paragraphs: ['Finder mustrid on kolm suurt ruutu QR-nurkades, mis aitavad skanneritel koodi orienteerida. Saadaolevad stiilid:'],
      bullets: ['Ruut: standardsed ruudukujulised nurgad.', 'Ümardatud: pehmendatud nurgad, mis sobivad ümara mooduli stiiliga.', 'Ring: täpistiilis koodide ringikujulised otsimismustrid.'],
    },
    {
      heading: 'Joondus- ja ajastusmustrid',
      paragraphs: ['Joondusmustrid kuvatakse suuremates QR-koodides (versioon 2+), et aidata moonutusi parandada. Ajastusmustrid on leidja mustreid ühendavad vahelduvad jooned.'],
      bullets: ['Joondusstiil: vaste leidja, ruut, ümardatud või ring.', 'Ajastusstiil: sobitage moodul, ühtlane või katkendlik.'],
    },
    {
      heading: 'Värvid',
      paragraphs: ['Esiplaan: QR-moodulite värv. Must (#000000) on standardne, kuid iga tume värv töötab.', 'Taust: taustavärv. Valge (#ffffff) on standardne. Tagada piisav kontrast esiplaaniga.', 'Läbipaistev taust: värvilistel pindadel kasutamiseks eemaldage taust täielikult. Veenduge, et pind oleks piisava kontrastiga.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Mooduli suurus ja vahe',
      paragraphs: ['Mooduli suurus: juhib, kui suureks iga moodul pikslites renderdatakse. Suuremad väärtused loovad suuremad ja hõlpsamini skannitavad koodid.', 'Moodulivahe: lisab moodulite vahele ruumi protsentides. Väikesed lüngad (5–15%) võivad teatud tingimustes parandada skaneeritavust, kuid liigsed lüngad vähendavad töökindlust.'],
    },
    {
      heading: 'Väljundi sätted',
      paragraphs: ['Vorming: valige ekspordivorming kasutusjuhtumi põhjal.'],
      bullets: ['PNG: kadudeta rastervorming, ideaalne enamiku kasutuste jaoks. Parim printimiseks ja digitaalseks kasutamiseks.', 'WebP: kaasaegne formaat väiksema failisuurusega. Hea veebis kasutamiseks.', 'GIF: nõutav animeeritud QR-koodide jaoks. Toetab läbipaistvust.', 'SVG: vektorvorming, mis skaleerib lõputult. Parim suures trükis või siis, kui peate koodi redigeerima.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' },
      ],
    },
    {
      heading: 'Väljundi mõõtmed',
      paragraphs: ['Laius/kõrgus: määrake väljundi suurus pikslites. Printimisel arvutage DPI põhjal (nt 300 DPI 1 tolli juures = 300 pikslit). Suuremad suurused skannivad kaugemalt usaldusväärsemalt.'],
    },
    {
      heading: 'Animatsiooni seaded (täpsem)',
      paragraphs: ['Animeeritud QR-koodi käitumise juhtimine:'],
      bullets: ['Kiirus: animatsiooni kaadrisagedus millisekundites.', 'Loop: pidev või ühekordne animatsioon.', 'Bounce: ping-pongi animatsiooni suund.', 'Alusta kaadrit: alustage animatsiooni konkreetsest kaadrist.', 'Maksimaalne kaadrite arv: piirake animatsiooni kaadrite koguarvu.', 'Kaadri samm: jätke kaadrid vahele, et animatsioon oleks kiirem.', 'Interpolatsioon: puudub, Crossfade või Morph kaadrite vahel.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' },
      ],
    },
    {
      heading: 'Sisutüübid (täpsem)',
      paragraphs: ['Täiustatud tase avab täiendavad kandevõime vormingud:'],
      bullets: [
        'Telefoninumber (tel:): loob helistatava telefonilingi.',
        'E-post (mailto:): avab valikulise teema ja kehaga meilikliendi.',
        'SMS: eeltäidetud tekstsõnum telefoninumbrile.',
        'vCard: täielik kontaktikaart koos nime, organisatsiooni, telefoni, e-posti ja aadressiga.',
        'MeCard: Jaapanis populaarne kompaktne kontaktivorming.',
        'BizCard: pärand visiitkaardivorming.',
        'Geo Location: GPS-koordinaadid, mis avanevad kaartidel.',
        'WiFi: automaatse ühenduse loomise võrgumandaadid (SSID, parool, turvatüüp).',
        'Kalendrisündmus: iCalendari vorming koos pealkirja, asukoha, kuupäeva/kellaajaga.',
        'Sündmuse vastus: link sündmuse registreerimislehele.',
        'Kalendri tellimine: ICS-i/WebCali kanali tellimine.',
        'Faili/dokumendi URL: otselink allalaaditavatele failidele.',
        'Pilvesalvestuse link: lingid Google Drive\'i, Dropboxi, OneDrive\'i jne.',
        'Sotsiaalne profiil: lingid LinkedIni, Twitteri, Instagrami jne.',
        'Sõnumside link: WhatsApp, Telegram, Signaali sügavad lingid.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Ülekatte täiustatud funktsioonid',
      paragraphs: ['Täiendavad ülekatte võimalused:'],
      bullets: ['Kärbi: lubage kärpimine, et valida pildi ruudukujuline piirkond.', 'Pooltoon: klassikaline trükistiilis punktmuster, mis põhineb pildi heledusel.', 'Dithered: Error-diffusion dithering üksikasjalikuks reprodutseerimiseks.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Ülekatte segamisrežiimid (täiustatud)',
      paragraphs: ['Täiendavad segamisrežiimid kõrgtasemel:'],
      bullets: ['Alampikslid: jagab iga mooduli alampiksliteks, et saada rohkem detaile.', 'Sinine müra: artefaktivabade mustrite jaoks kasutab sinist müra.', 'Mosaiik: plaadipõhine efekt, mis säilitab pildistruktuuri.', 'Lüngade täitmine: asetab pildi moodulite vahele.', 'Heledus: muudab mooduli suurust sõltuvalt pildi heledusest.', 'Duotone: muudab pildi kahe värviga silmatorkava kontrasti saavutamiseks.'],
    },
    {
      heading: 'Ülekatte intensiivsus',
      paragraphs: ['Määrab, kui tugevalt ülekate QR-koodi mõjutab (0–100%). Kõrgemad väärtused näitavad pildi detaile, kuid võivad vähendada skannitavust. Alustage umbes 70% ja kohandage testimise põhjal.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' }],
    },
    {
      heading: 'Värvirežiim',
      paragraphs: ['Ülekattepildi töötlemine:'],
      bullets: ['Täisvärv: säilitab pildi originaalvärvid.', 'Halltoonid: teisendab must-valgeteks toonideks.', 'Must-valge: suure kontrastsusega kahendkonversioon.'],
    },
    {
      heading: 'Säilitage leidja mustrid',
      paragraphs: ['Kui see on lubatud, jätab ülekatte kolm nurgaleidja mustrit muutmata. Usaldusväärseks skannimiseks tungivalt soovitatav.'],
    },
    {
      heading: 'Pildi eeltöötlus',
      paragraphs: ['Enne segamist rakendage ülekattepildile filtreid. Need kohandused võivad parandada seda, kuidas pilt lõplikus QR-koodis kuvatakse.'],
      bullets: ['Heledus (-100 kuni +100): pildi heledamaks või tumedamaks muutmine.', 'Kontrastsus (-100 kuni +100): toonivahemiku suurendamine või vähendamine.', 'Gamma (0,2 kuni 3,0): mittelineaarne heleduse reguleerimine. Väärtused alla 1 muudavad kesktoonid heledamaks, üle 1 tumedamaks.', 'Küllastus (-100 kuni +100): värvi intensiivsus. -100 on halltoonid, +100 on üleküllastunud.', 'Tooni pööramine (0–360°): nihutage kõiki värve ümber värviratta.', 'Hägu (0–20 pikslit): pehmendage pildi üksikasju.', 'Teritamine (0–100%): täiustage servi ja detaile.', 'Plakatistamine (0–16 taset): plakatiefekti saavutamiseks vähendage värvitasemeid.', 'Lävi (0–255): teisenda binaarseks mustaks/valgeks lõikepunktis.', 'Serva tuvastamine: Sobeli või Canny algoritmid näitavad ainult servi.', 'Invert: pöörake kõik värvid ümber.'],
    },
    {
      heading: 'Fit Mode',
      paragraphs: ['Kuidas ülekattepilt QR-koodi alale sobib:'],
      bullets: ['Kaas: pilt täidab kogu ala, vajadusel kärbitakse.', 'Sisaldab: kogu pilt nähtav, võib olla veerisid.', 'Venitamine: pilt moondub täpselt täitmiseks.'],
    },
    {
      heading: 'Teisendusvalikud',
      paragraphs: ['Pööramine: pöörake ülekatet 90° sammuga.', 'Pööra X/Y: peegeldab pilti horisontaalselt või vertikaalselt.'],
    },
    {
      heading: 'Dithering algoritmid',
      paragraphs: ['Dithering teisendab pideva tooniga pildid mustriteks, mida QR-koodid kujutavad. Saadaval Dithered, Blue Noise või True Dither segamisrežiimide kasutamisel.'],
      bullets: [
        'Vigade levitamine: klassikaline Floydi-Steinbergi stiil. Levitab kvantimisvea naaberpikslitele.',
        'Tellitud (Bayer): kasutab tavaliste mustrite jaoks lävimaatriksit.',
        'Kobarpunkt: simuleerib pooltooni printimist.',
        'Tühjus ja kobar: optimeeritud järjestatud dithering.',
        'Sinine müra: visuaalselt meeldiv juhusliku välimusega muster.',
        'Blue Noise Threshold: läve värvimine sinise müra tekstuuriga.',
        'Valge müra: juhuslik lävega segamine.',
        'Gaussi/kolmnurkne müra: erineva jaotusega müra.',
        'Sinine müra + vea hajutamine: mõlemat tehnikat kombineeriv hübriid.',
        'Ekraanitud sinine müra: Ekraani sarnane sinine müra muster.',
        'Tajuv: heledusega kaalutud paremate visuaalsete tulemuste saavutamiseks.',
        'Edge-Aware: säilitab kujutise servad värvimise ajal.',
        'Adaptiivne lävi: lokaalselt kohanduv lävi.',
        'Ajutine sinine müra: animeeritud GIF-ide puhul varieerub muster kaadri kohta.',
      ],
    },
    {
      heading: 'Difusioonituumad',
      paragraphs: ['Kui kasutate Error Diffusion ditheringut, valige vea jaotamise viis:'],
      bullets: ['Floyd-Steinberg: klassikaline 4-naaberdifusioon. Hea üldine valik.', 'Jarvis-Judice-Ninke: 12-naaber, sujuvam, kuid aeglasem.', 'Stucki: Sarnane JJN-iga erineva kaaluga.', 'Burkes: lihtsustatud JJN, kiirem.', 'Sierra: tuumade perekond, mis tasakaalustab kvaliteeti ja kiirust.', 'Atkinson: valguse difusioon, säilitab detailid, kuid võib olla teraline.'],
    },
    {
      heading: 'Dither Tugevus',
      paragraphs: ['Juhib, kui palju ditheringit rakendatakse (0–100%). Madalamad väärtused säilitavad rohkem algset mustrit, kõrgemad väärtused näitavad rohkem pildi detaile.'],
    },
    {
      heading: 'Alampiksli seaded',
      paragraphs: ['Subpiksli segamisrežiimi kasutamisel:'],
      bullets: ['Ruudustiku suurus: 2 × 2, 3 × 3 või 4 × 4 alampikslit mooduli kohta. Kõrgem = rohkem üksikasju.', 'Keskmise reegel: range nõuab mooduliga sobitamiseks keskmist alampikslit. Pooltoonide keskus võimaldab varieerida.', 'Neutraalne värv: määramata alampikslite jaoks kasutatav värv.', 'Finder Override: Finder mustrite renderdamine (tahke või stiliseeritud).'],
    },
    {
      heading: 'Pooltooni seaded',
      paragraphs: ['Pooltoonide segamisrežiimi kasutamisel:'],
      bullets: ['Lahtri suurus: mooduli või N × N ruudustiku kohta.', 'Punkti kuju: ring, ruut või joon.', 'Heleduse kõver: lineaarne, S-kõver või gamma.'],
    },
    {
      heading: 'Duotone värvid',
      paragraphs: ['Duotone\'i segamisrežiimi kasutamisel määrake Shadow color (tumedad alad) ja Highlight color (heledad alad).'],
    },
    {
      heading: 'GIF-animatsiooni seaded',
      paragraphs: ['Animeeritud GIF-ülekatete kasutamisel tehke järgmist.'],
      bullets: ['Kasutage kaadri viivitusi: austage algset GIF-i ajastust.', 'Max FPS: piirata kaadrisagedust (1–60 kaadrit sekundis).', 'Jäätmekäitlus: austage või lihtsustage raami kõrvaldamise meetodeid.'],
    },
    {
      heading: 'Täpsemad renderdusvalikud',
      paragraphs: ['Täiendavad renderdusjuhtelemendid:'],
      bullets: ['Vaherežiim: puudub, sisestus, tõmme või negatiivne tühimik.', 'Nurgaraadius: moodulite ümardatud nurkade protsent.', 'Gradient: puudub, lineaarne, radiaalne või kooniline gradient moodulitel.', 'Silma välimine/sisemine stiil: otsimismustri rõngaste iseseisev stiil.', 'Punktide pööramine: pöörake teemant-/punktimooduleid.', 'Silmakaal: suuruse reguleerimine leidja mustrite jaoks.', 'Raami stiil: lisage dekoratiivsed raamid (ümarraam, kleebis, silt).', 'Raami tekst: lisage tekst nagu "Skanni mind!" raamidesse.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Täiustatud QR-kodeering',
      paragraphs: ['Täpsustage QR-kodeeringut:'],
      bullets: ['Kodeerimisrežiim: automaatne, numbriline, tähtnumbriline, bait/UTF-8 või kanji.', 'Jõusta minimaalne vaikne tsoon: tagage vähemalt 4 mooduli varu.', 'Mask Muster: Automaatne (optimaalne) või käsitsi valida mustrid 0-7, et juhtida mooduli jaotust. Erinevad mustrid loovad samu andmeid kodeerides erinevaid visuaalseid välimusi.', 'Märgi kodeering: ISO-8859-1 (ladina-1 vaikeväärtus), UTF-8 (täis Unicode, sh emotikon) või Shift-JIS (jaapani kood). Valige vastavalt oma sisu iseloomu nõuetele.'],
    },
    {
      heading: 'Täpsemad väljundsuvandid',
      paragraphs: ['Ekspordi lisaseaded:'],
      bullets: ['Failinimi: allalaadimiseks kohandatud failinimi.', 'GIF-paleti suurus: 2–256 värvi GIF-väljundis.', 'GIF-kvantier: Mediaan Cut, NeuQuant või Octree värvide vähendamine.', 'GIF-i segamine: väljas, Floyd-Steinberg või tellitud.', 'GIF-i läbipaistev värv: määrake värv läbipaistvaks.', 'SVG True Vector: kasutage manustatud rastri asemel radu.', 'SVG kuju täpsus: pikslite või täpse tee renderdamine.', 'SVG Embed Raster Overlay: lisage manustatud kujutisena ülekate.', 'Tausta alistamine: sunnib väljundis teatud taustavärvi.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Valideerimisvalikud',
      paragraphs: ['Sisestuse töötlemise seaded:'],
      bullets: ['Kinnitage sisend: enne kodeerimist kontrollige sisu vormingut.', 'Tühje kärpimine: eemaldage eesmised/lõpuvad tühikud.', 'Reavahetuste normaliseerimine: teisendage kõik realõpud LF-iks.', 'Max Length Guard: hoiatage, kui sisu ületab QR-i mahutavuse.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Professionaalsed omadused',
      paragraphs: ['Professionaalne tase lisab vesimärgid, metaandmed, jagamisvalikud, ohutusanalüüsi, maksete QR-koodid ja ettevõtte funktsioonid.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Vesimärk',
      paragraphs: ['Lisage oma QR-koodidele vesimärgid:'],
      bullets: ['Tüüp: tekst, pilt või muster vesimärk.', 'Asend: keskel, nurgad, servad, taga või vaikne tsoon.', 'Läbipaistmatus: vesimärgi läbipaistvus (0-100%).', 'Segamisrežiim: tavaline, korrutamine, ekraan või ülekatte segamine.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
      ],
    },
    {
      heading: 'Metaandmed',
      paragraphs: ['Manustage eksporditud failidesse metaandmed:'],
      bullets: ['Väljad Pealkiri, Autor, Autoriõigus, Litsents, Kirjeldus.', 'Loomise aeg: manustage genereerimise ajatempel.', 'Kohandatud võtme-väärtus: lisage suvalised metaandmete paarid.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
      ],
    },
    {
      heading: 'Jagamine',
      paragraphs: ['Jagage oma QR-koodi konfiguratsioone:'],
      bullets: ['Otselink: looge oma praeguste seadetega jagatav URL.', 'HTML-i manustamine: hankige veebisaitide manustamiskood.', 'Parameetrite kodeerimine: lisage jagamise URL-i kõik sätted.', 'Märkus. Kohalike failide ülekattepilte ei saa URL-i kaudu jagada.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' },
      ],
    },
    {
      heading: 'Ohutusanalüüs',
      paragraphs: ['Veenduge, et QR-koodid oleksid skannitavad:'],
      bullets: ['Ohutusrežiim: väljalülitatud, tasakaalustatud või ranged skannimisnõuded.', 'Minimaalne mooduli suurus: minimaalne pikslite suurus mooduli kohta.', 'Minimaalne vaikne tsoon: minimaalse varu moodulid.', 'Lukuotsijad/Ajastus/Joondamine/Vorming/Versioon: kaitske konkreetseid elemente.', 'Maksimaalne ülekatte intensiivsus ECC järgi: automaatsed intensiivsuse piirid, mis põhinevad veaparandustasemel.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' },
      ],
    },
    {
      heading: 'Sisutüübid (professionaalne)',
      paragraphs: ['Professionaalne tase lisab makse- ja ettevõtte sisutüübid:'],
      bullets: ['EPC/SEPA (EL): Euroopa pangaülekande QR-koodid IBAN-i, BIC-i, summa, viitega.', 'UPI (India): ühtne makseliides VPA-ga, makse saaja nimi, summa.', 'PayNow (Singapur): Singapuri kiirmakse UEN-i või mobiilinumbriga.', 'PromptPay (Tai): Tai riiklik maksesüsteem.', 'PIX (Brasiilia): Brasiilia kiirmakse PIX-võtmega.', 'Krüpto: Bitcoini, Ethereumi, Litecoini makseaadressid valikulise summaga.', 'Turunduskampaania link: täieliku UTM-i parameetri (turundussildid) jälgimisega URL-id.', 'Lühilink: kasutamiseks koos dünaamiliste/jälgitavate QR-koodide URL-i lühenditega.', 'GS1 digitaalne link: toote identifitseerimine GTIN-iga, seeria, partii, aegumiskuupäev.', 'Rakenduse sügav link: iOS-i/Androidi rakenduste süvalingid kohandatud skeemidega.', 'Kohandatud vorming: töötlemata andmed ilma vormindamise või kinnitamiseta.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Keelepõhised maksed täiustatud režiimis',
      paragraphs: ['Täiustatud režiimi kasutamisel näitab ANQR automaatselt teie valitud keele jaoks asjakohaseid makseviise. Näiteks Vietnami kasutajad näevad VietQR-i, Tai kasutajad PromptPayt ja India keele kasutajad UPI-d ja BharatQR-i. Globaalsed makseviisid (krüptovaluuta, PayPal, sularaharakendus) on saadaval kõikides keeltes. Professionaalne režiim avab kõik maksestandardid, olenemata keelest.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Euroopa maksestandardid',
      bullets: ['EPC/SEPA (EL): Euroopa pangaülekande QR-koodid, mis järgivad EPC QR-koodi standardit. Toetab IBAN-i, BIC-i (siseriikliku puhul valikuline), summat eurodes ning struktureeritud või struktureerimata makseviiteid. Kasutatakse kogu SEPA tsoonis, sealhulgas ELi riikides ning Šveitsis, Norras, Islandil, Liechtensteinis, Monacos ja San Marinos.', 'Šveitsi QR-arve: Šveitsi maksestandard, mis vastab kuuele rakendusjuhisele. Toetab CHF ja EUR, QR-viite (QRR), võlausaldaja viide (ISO 11649), struktureeritud võlausaldaja/võlgniku aadressid ja arveteave. Nõutav Šveitsi arvete puhul alates 2022. aastast.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'India maksestandardid',
      bullets: ['UPI (India): ühtne makseliides, mis järgib NPCI süvalinkimise spetsifikatsiooni. Toetab VPA-d (virtuaalne makseaadress), makse saaja nime, summat INR-is, tehingumärget, viite ID-d, kaupmehe kategooria koodi ja tehingurežiimi.', 'BharatQR (India): ühtne QR-standard, mis toetab nii UPI- kui ka kaardipõhiseid makseid. Maksimaalse ühilduvuse tagamiseks kombineerib UPI VPA kaardi PAN-iga. Sisaldab kaupmehe nime, linna, MCC-d, GST üksikasju ja arve/viite numbreid.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Kagu-Aasia maksestandardid',
      bullets: ['PayNow (Singapur): Singapuri kiire maksesüsteem, mis kasutab SGQR-profiiliga EMVCo QR-spetsifikatsiooni. Toetab puhverserveri identifikaatoritena UEN-i (ettevõtte registreerimist), mobiilinumbrit või NRIC-i. Sisaldab summa redigeeritavuse lippu ja aegumiskuupäeva.', 'PromptPay (Tai): Tai riiklik maksesüsteem, mis järgib Bank of Thai EMV profiili. Toetab mobiiltelefoni numbrit, riiklikku ID-d, maksu ID-d, e-rahakoti ID-d ja mitme viiteväljaga arve maksmist.', 'QRIS (Indoneesia): Indoneesia standardne kiirreageerimiskood. EMV-põhine riiklik maksestandard, mis toetab kaupmehe ID-d, NMID-d (National Merchant ID), kaupmehe kriteeriumide klassifikatsiooni ja mugavustasusid (fikseeritud või protsentuaalne).', 'DuitNow (Malaisia): Malaisia kiirmaksesüsteem. Toetab mitut tüüpi puhverserverit, sealhulgas NRIC-i, mobiiltelefoni, passi, armee ID-d ja ettevõtte registreerimisnumbreid.', 'VietQR (Vietnam): Vietnami pankadevahelise ülekande standard. Nõuab panga BIN-i (NAPAS-i identifitseerimine) ja kontonumbrit. Toetab mitut teeninduskoodi erinevate edastustüüpide jaoks (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filipiinid): Filipiinide QR-maksestandard InstaPay ja PESONeti jaoks. Kasutab P2M (isikult kaupmehele) tehingute jaoks kaupmehe identifikaatoriga kontonumbreid.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Ida-Aasia maksestandardid',
      bullets: ['TWQR (Taiwan): Taiwani QR-maksestandard. Toetab kaupmehe ID-d, maksu-ID-d ja TWD-summasid.', 'HKQR/FPS (Hongkong): Hongkongi kiirema maksesüsteemi QR-koodid. Toetab makseidentifikaatoritena FPS-i ID-d, mobiilinumbrit või e-posti. Summad HKD-des.', 'JPQR (Jaapan): Jaapani ühtne QR-koodi maksestandard. Kasutab JPY summadega kaupmehe tuvastamiseks poe ID-d.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Muud piirkondlikud maksestandardid',
      bullets: ['PIX (Brasiilia): Brasiilia keskpanga kiirmaksesüsteem, mis järgib BR-koodi spetsifikatsiooni. Toetab PIX-klahve (CPF, CNPJ, e-post, telefon või juhuslik võti), kaupmehe nime/linna, tehingu ID-d ja BRL-i summasid.', 'AusPayNet/NPP PayID (Austraalia): Austraalia uue makseplatvormi PayID süsteem. Toetab PayID tüüpe (e-post, mobiil, ABN, organisatsiooni ID) või traditsioonilist BSB + kontonumbrit. Kaupmehe nimi on valikuline, kuna maksjad näevad registreeritud nime tuumaelektrijaama otsingust.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Krüptovaluuta maksed',
      bullets: ['Bitcoin/Litecoin (BIP-21): standardsed krüptovaluutamaksete URI-d koos rahakoti aadressi, valikulise summa ja sildiga. Ühildub kõigi suuremate Bitcoini ja Litecoini rahakottidega.', 'Lightning Network (BOLT11): Lightning Network maksearved. Kleepige BOLT11 kodeeritud arve string minimaalsete tasudega koheste Bitcoini maksete jaoks.', 'Ethereum (EIP-681): Ethereumi tehingupäringu URI-d, mis toetavad natiivseid ETH-edastusi ja ERC-20 märgiülekandeid. Sisaldab keti ID-d mitme võrgu toe jaoks (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gaasiparameetrid ja lepingufunktsioonide väljakutsed.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Makselingi teenused',
      bullets: ['PayPal.Me: PayPali makselingid koos kasutajanime ja valikulise eeltäidetud summaga. Saajad saavad maksta PayPali saldo, kaartide või pangakontode kaudu.', 'Sularaharakendus: sularaharakenduse makselingid, kasutades valikulise summaga $cashtag. Populaarne Ameerika Ühendriikides võrdõigusmaksete jaoks.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Üldine EMV QR',
      bullets: ['EMV Generic: looge kohandatud EMV kaupmehe esitletud režiimi QR-koodid makseskeemide jaoks, mida pole konkreetselt loetletud. Konfigureerige kaupmehe nimi, linn, riigikood (ISO 3166-1), valuutakood (ISO 4217 numbriline), MCC, jootraha / mugavustasu valikud ja täiendavad andmeväljad. Kasulik testimiseks või kohandatud integreerimiseks.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Ülekatte segamisrežiimid (professionaalne)',
      paragraphs: ['Täiendavad segamisrežiimid professionaalsel tasemel:'],
      bullets: ['Pixelate: pikslitud ülekatteefekt.', 'Kontuur: servatuvastuse ülekate, mis näitab ainult kontuure.', 'Laine: laineline moonutusefekt.', 'Subpiksli suurus: pildi alusel muutuv alampiksli suurus.', 'True Dither: täiustatud dithering koos tellitud maatriksivalikuga.', 'Äärmuslik: maksimaalne kujutise nähtavus, võib mõjutada skannitavust.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Kaitse sätted',
      paragraphs: ['Täpne juhtimine selle üle, millised QR-elemendid on ülekatte muutmise eest kaitstud:'],
      bullets: ['Säilita ajastus: hoidke ajastusmustrid muutmata.', 'Säilita joondus: hoidke joondusmustrid muutmata.', 'Protect Format Info: Varjestusvormingu teabemoodulid.', 'Versiooniteabe kaitsmine: kaitse versiooniteabe moodulid.'],
    },
    {
      heading: 'ECC-teadlik režiim',
      paragraphs: ['Jaotab arukalt ülekatte intensiivsust veaparandusvõime põhjal. Süsteem analüüsib, milliseid mooduleid saab muuta, säilitades samal ajal skannitavuse.'],
      bullets: ['Riskieelarve: kasutatud veaparandusvõimekuse protsent (0–100%).', 'Suurem eelarve = nähtavam ülekate, kuid riskantsem skannitavus.', 'Madalam eelarve = turvalisem skannimine, kuid vähem nähtav ülekate.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Professionaalsed renderdusvalikud',
      paragraphs: ['Täpsemad renderdusjuhtelemendid:'],
      bullets: ['Teravad servad: kasutage mooduli teravate servade jaoks pikslitekujulist kujutise renderdamist.', 'Pixel Snap: põranda, ümmarguse või lae pikslite joondamine.', 'Moodulipõhine värvirežiim: ühtlane, heleduse, asukoha, ülekatte, klastri järgi.', 'Värvipalett: määrake kohandatud värvipalett moodulipõhiseks värvimiseks.', 'Kontrastikaitse: tagage värvide minimaalne kontrastsuse suhe.', 'Minimaalne kontrastsuhe: WCAG-stiilis kontrastinõue (1:1 kuni 21:1).', 'Täiendavad piirimoodulid: lisapiir vaikse tsooni taga.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Professionaalsed väljundvalikud',
      paragraphs: ['Ettevõtte ekspordi seaded:'],
      bullets: ['DPI: määrake prindieraldusvõime (72–600 DPI). Printimiseks soovitatav 300 DPI.', 'Kaasa vaikne tsoon: lülitage vaikne tsoon väljundmõõtmetes sisse.', 'Ekspordi lisana: looge PDF-i põhivormingu kõrval.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'Animatsiooni seaded (professionaalne)',
      paragraphs: ['Täiendavad professionaalsed animatsioonifunktsioonid:'],
      bullets: ['Temporal Dither: Väljas, Blue Noise või Flicker Safe kaadripõhine värvimine.', 'Muster: Puuduvad, Pulse, Laine, Scanline, Shimmer või Triivi efektid.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API viide',
      paragraphs: ['ANQR pakub serveripoolset API-d QR-koodide genereerimiseks URL-i parameetrite kaudu. See sobib ideaalselt QR-koodide manustamiseks veebisaitidele, e-kirjadesse, dokumentidesse või automatiseeritud töövoogudesse ilma kliendipoolse JavaScriptita.', 'Baas-URL: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'example' }],
    },
    {
      heading: 'Põhiparameetrid',
      paragraphs: ['Nõutavad ja levinud parameetrid (parameetrite nimesid ei tõlgita):'],
      bullets: ['andmed (nõutav): QR-koodi kodeeritav sisu. URL-kood erimärgid.', 'suurus: pildi suurus pikslites (vaikimisi: 400, max: 2000). Kasutatakse, kui w/h pole täpsustatud.', 'w, h: väljundi laius ja kõrgus pikslites. Alistab suuruse parameetri.', 'vorming: väljundvorming – png, webp või gif (vaikimisi: png).', 'ec: veaparanduse tase – L, M, Q või H (vaikeseade: H).', 'fg: esiplaani värv kuueteistkümnendarvuna ilma # (vaikimisi: 000000).', 'bg: taustavärv kuueteistkümnendmärgina ilma # (vaikimisi: ffffff).', 'läbipaistev: läbipaistva tausta jaoks määrake väärtusele 1.', 'marginaal: vaikne tsoon moodulites (vaikimisi: 4).'],
    },
    {
      heading: 'Stiiliparameetrid',
      paragraphs: ['Mooduli ja mustri stiil:'],
      bullets: ['stiil: mooduli stiil - ruudukujuline, ümar, täpid, romb, ühendatud.', 'leidja: Finder mustri stiil - ruut, ümar, ring.', 'joondus: joondusmustri stiil – match_finder, ruut, ümar, ring.', 'ajastus: ajastusmustri stiil – match_module, pidev, katkendlik.', 'raadius: Nurgaraadiuse protsent 0-100.', 'vahe: mooduli vahe protsent 0-50.', 'gapMode: vaherežiim – puudub, sisestus, joon, negatiivne_tühik.', 'eyeOuter, eyeInner: Silmade stiilid - ruudukujulised, ümarad, ringid.', 'eyeScale: silmade skaala protsent (vaikeseade: 100).', 'grad: gradiendi tüüp - puudub, lineaarne, radiaalne, kooniline.', 'gradAngle: gradiendi nurk lineaarsete gradientide jaoks.', 'gradStops: gradient peatub kujul color1,pos1,color2,pos2,... (nt ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Ülekatte parameetrid',
      paragraphs: ['Pildi ülekatte valikud (ülekattepilt tuuakse serveri poolelt):'],
      bullets: ['img: ülekattepildi URL (peab olema avalikult juurdepääsetav).', 'režiim: Overlay režiim – keskpunkt, pooltoon, segu, heledus, mosaiik, hajutatud, sinine müra, alampikslid.', 'intensiivsus: ülekatte intensiivsus 0–100 (vaikeväärtus: 100).', 'colorMode: ülekatte värvirežiim – värv, halltoonid, mustvalge.', 'sobivus: kuidas ülekate sobib – katta, sisaldada, venitada.', 'mäda: ülekatte pöörlemine kraadides.', 'flipX, flipY: ülekatte pööramiseks määrake väärtuseks 1.', 'keepFinders: säilitab leidja mustrid (vaikimisi: 1).', 'keepTiming, keepAlign: määrake väärtusele 1, et säilitada ajastus-/joondusmustrid.'],
    },
    {
      heading: 'Eeltöötluse parameetrid',
      paragraphs: ['Ülekattele rakendatud pildi eeltöötlus:'],
      bullets: ['heledus: reguleerimine -100 kuni 100 (vaikeväärtus: 0).', 'kontrastsus: reguleerimine -100 kuni 100 (vaikeväärtus: 0).', 'gamma: väärtus 0,1 kuni 3 (vaikeväärtus: 1).', 'küllastus: reguleerimine -100 kuni 100 (vaikeväärtus: 0).', 'toon: tooni pööramine kraadides.', 'hägusus: hägusus pikslites.', 'teritama: terituskogus 0-100.', 'posterize: plakati tasemed.', 'lävi: binaarne lävi 0-255.', 'serv: serva tuvastamine – väljas, sobel, kaval.', 'invert: värvide ümberpööramiseks määrake väärtusele 1.'],
    },
    {
      heading: 'Vesimärgi parameetrid',
      paragraphs: ['Lisage loodud QR-koodidele vesimärgid:'],
      bullets: ['wmEn: määrake väärtus 1, et lubada vesimärk.', 'wmKind: vesimärgi tüüp – tekst, pilt, muster.', 'wmText: vesimärgi tekst (URL-koodiga).', 'wmImg: URL vesimärgi kujutisele.', 'wmPos: asend – keskpunkt, nurgad, servad, taga, vaikne_tsoon.', 'wmOpacity: läbipaistmatus 0–100 (vaikeväärtus: 50).', 'wmBlend: segamisrežiim – tavaline, korrutamine, ekraan, ülekate.'],
    },
    {
      heading: 'Animatsiooni parameetrid',
      paragraphs: ['Animeeritud GIF-väljundi jaoks (nõuab format=gif):'],
      bullets: ['animPattern: animatsioonimuster – puudub, pulss, laine, skannimine, virvendus, triiv, värvitsükkel.', 'animFrames: kaadrite arv 1–60 (vaikimisi: 24).', 'animSpeed: kaadri viivitus millisekundites 10–1000 (vaikeseade: 100).', 'animSeed: Animatsiooni juhuslik seeme.', 'leevendumine: animatsiooni leevendamine – lineaarne, kergendus sisse, kergendus välja, kergendus sisse_välja, põrge.'],
    },
    {
      heading: 'Väljundi parameetrid',
      paragraphs: ['Väljundvormingu valikud:'],
      bullets: ['kvaliteet: WebP kvaliteet 0-1 (vaikimisi: 0,9).', 'webpQ: WebP kvaliteet 0–100 (vaikimisi: 90).', 'gifColors: GIF-paleti suurus 2–256 (vaikeväärtus: 256).', 'dpi: väljund DPI PNG jaoks (vaikeväärtus: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: PNG metaandmete väljad.'],
    },
    // Crop Parameters
    {
      heading: 'Kärpimisparameetrid',
      paragraphs: ['Ülekattepildi kärpimise valikud:'],
      bullets: ['cropEn: lubab ülekatte kärpimise 0/1 (vaikeseade: 0).', 'cropX: kärbi keskpunkti X murdosana 0–1 (vaikeseade: 0,5).', 'cropY: kärpimise keskpunkt Y murdosana 0-1 (vaikeseade: 0,5).', 'cropSize: kärpimise suurus murdosa kujutisest 0-1 (vaikeseade: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Turvaluku parameetrid',
      paragraphs: ['Saate juhtida, millised QR-elemendid on ülekatte muutmise eest kaitstud.'],
      bullets: ['lockF: lukuotsija mustrid 0/1 (vaikimisi: 1).', 'lockT: lukustamise ajastusmustrid 0/1 (vaikeseade: 1).', 'lockA: lukustuse joondusmustrid 0/1 (vaikeseade: 1).', 'lockFmt: lukuvormingu teave 0/1 (vaikeseade: 1).', 'lockV: luku versiooni teave 0/1 (vaikimisi: 1).', 'safeMode: ohutusrežiim – väljas, tasakaalustatud, range (vaikimisi: väljas).', 'safeMinPx: mooduli minimaalne suurus pikslites (vaikimisi: 2).', 'safeMinQz: vaikse tsooni minimaalsed moodulid (vaikimisi: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parameetrite automaatne häälestamine',
      paragraphs: ['Automaatse optimeerimise seaded:'],
      bullets: ['autoVer: QR-versiooni 0/1 automaatne valimine (vaikeseade: 1).', 'autoEcc: ECC taseme automaatne valimine 0/1 (vaikeseade: 0) – ainult serveripoolne vihje.', 'automaatne vähendamine: [AINULT KLIENDIL] Vähendab intensiivsust automaatselt kuni skannimiseni – nõuab skannimise valideerimissilmust.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Täiendavad animatsiooniparameetrid',
      paragraphs: ['Laiendatud animatsiooni juhtnupud GIF-väljundi jaoks:'],
      bullets: ['tsükkel: animatsioonitsüklid pidevalt 0/1 (vaikeseade: 1).', 'põrge: pingpongi animatsiooni suund 0/1 (vaikeseade: 0).', 'tagurpidi: esita animatsiooni tagurpidi 0/1 (vaikeseade: 0).', 'colorCycle: lubab värvide tsükliefekti 0/1 (vaikeseade: 0).', 'interp: kaadri interpolatsioon – puudub, risttumedus, morph (vaikimisi: puudub).', 'tempDither: Ajutine segamine – väljas, sinine_müra, virvendusohutu (vaikimisi: väljas).', 'startF: animatsiooni alguskaader (vaikimisi: 0).', 'maxF: maksimaalne renderdatavate kaadrite arv (vaikeseade: 0 = automaatne).', 'sammF: kaadri sammude intervall (vaikeseade: 1).', 'värin: [AINULT KLIENDIL] Mooduli värin pikslites – nõuab QR-i taastamist kaadri kohta.'],
    },
    // Dithering Parameters
    {
      heading: 'Dithering parameetrid',
      paragraphs: ['Ülekatte töötlemiseks kasutatavate dithering-algoritmide juhtimine:'],
      bullets: ['ditherKind: Ditheri algoritm – error_diffusion, ordered_bayer, blue_noise jne (vaikimisi: ordered_bayer).', 'diffusionKernel: Viga difusioonituum – floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (vaikimisi: floyd_steinberg).', 'ditherStrength: ditheri intensiivsus 0-100 (vaikimisi: 50).', 'serpentiin: Serpentine dithering 0/1 (vaikimisi: 0).', 'maatriks: tellitud dither-maatriks - bayer2, bayer4, bayer8 (vaikimisi: bayer4).', 'bnTile: sinise müraplaadi suurus (vaikeseade: 64).', 'bnSeed: Blue Noise juhuslik seeme (vaikimisi: 0).', 'colorDither: värvide erinevus – puudub, kanali kohta, tajutav (vaikeseade: puudub).'],
    },
    // Subpixel Parameters
    {
      heading: 'Subpiksli parameetrid',
      paragraphs: ['Alampikslite segamisrežiimi seaded:'],
      bullets: ['spGrid: alampikslite ruudustiku suurus – 2x2, 3x3, 4x4 (vaikimisi: 3x3).', 'spCenter: keskreegel – range, pooltooni_keskus (vaikimisi: range).', 'spNeutral: neutraalse värvi hex ilma # (vaikeseade: 808080).', 'spFinder: Finderi alistamine – ühtlane, stiliseeritud (vaikimisi: tahke).'],
    },
    // Halftone Parameters
    {
      heading: 'Pooltooni parameetrid',
      paragraphs: ['Pooltoonide segamisrežiimi seaded:'],
      bullets: ['htCell: pooltooni lahtri suurus – per_moodul või nxn-võrk (vaikimisi: per_moodul).', 'htDot: punkti kuju – ring, ruut, joon (vaikimisi: ring).', 'htCurve: heleduse kõver – lineaarne, s-kõver, gamma (vaikimisi: lineaarne).', 'duo1: Duotone varjuvärvi kuusnurk ilma # (vaikimisi: 000000).', 'duo2: Duotone esiletõstmise värv kuueteistkümnend ilma # (vaikimisi: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-teadliku režiimi parameetrid',
      paragraphs: ['Arukas ülekatte jaotus, mis põhineb veaparandusvõimel:'],
      bullets: ['eccAware: lubage ECC-teadlik režiim 0/1 (vaikeseade: 0).', 'eccRisk: riskieelarve protsent 0–100 (vaikimisi: 50).', 'eccMap: kaalukaart – kaugus_leidjateni, block_heatmap, empiiriline_scan_heatmap (vaikimisi: kaugus_leidjateni).'],
    },
    // Frame Parameters
    {
      heading: 'Raami parameetrid',
      paragraphs: ['Dekoratiivse raami seaded:'],
      bullets: ['raam: raami stiil – puudub, ümardatud_raam, kleebis, silt (vaikimisi: puudub).', 'frameText: raamis kuvatav tekst (URL kodeeritud).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Moodulipõhised värviparameetrid',
      paragraphs: ['Üksikute moodulite värvimisvalikud:'],
      bullets: ['modColor: värvirežiim – ühtlane, heleduse järgi, asukoha järgi, ülekatte järgi, klastri järgi (vaikimisi: ühtlane).', 'cGuard: kontrastikaitse 0/1 (vaikimisi: 0).', 'minContrast: minimaalne kontrastsussuhe 1-21 (vaikimisi: 4,5).', 'palett: komadega eraldatud kuueteistkümnendvärvid palettrežiimi jaoks.', 'paletirežiim: Paleti jaotus – asukoht, heledus, diagonaal, radiaalne, juhuslik, rida, veerg (vaikimisi: asukoht).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF-i ülekatte parameetrid',
      paragraphs: ['Animeeritud GIF-ülekattepiltide seaded:'],
      bullets: ['ovType: ülekatte tüüp – staatiline, gif, apng, webp_anim, video (vaikimisi: staatiline).', 'ovFramePick: kaadri valik – kõik, iga_n, max_kaadrid, kestuse_piirang (vaikimisi: kõik).', 'gifDelays: kasutage algseid GIF-kaadri viivitusi 0/1 (vaikimisi: 1).', 'gifDispH: GIF-i kõrvaldamise käsitlemine – austa, lihtsusta (vaikimisi: austus).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'ECC intensiivsuse piirid',
      paragraphs: ['Ülekatte maksimaalne intensiivsus veaparandustaseme kohta:'],
      bullets: ['maxIntL: maksimaalne intensiivsus ECC L 0–100 jaoks (vaikeväärtus: 100).', 'maxIntM: ECC M maksimaalne intensiivsus 0–100 (vaikeväärtus: 100).', 'maxIntQ: ECC Q maksimaalne intensiivsus 0–100 (vaikeväärtus: 100).', 'maxIntH: maksimaalne intensiivsus ECC H 0-100 jaoks (vaikeväärtus: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA simulatsiooni parameetrid (ainult kliendile)',
      paragraphs: ['Need parameetrid sõelutakse URL-i ühilduvuse tagamiseks, kuid need töötavad ainult brauseris:'],
      bullets: ['qaContrast: kontrastsuse kontrolli lubamine 0/1 – nõuab interaktiivset valideerimist.', 'qaBlur: simuleerige hägusust pikslites – ainult interaktiivseks testimiseks.', 'qaNoise: simuleerige mürataset – ainult interaktiivseks testimiseks.', 'qaHeatmap: kuva loetavuse soojuskaart 0/1 – nõuab lõuendi ülekatte kasutajaliidest.'],
    },
    // Client-Only Parameters
    {
      heading: 'Ainult kliendi parameetrid',
      paragraphs: ['Enamik API parameetreid on serveripoolselt täielikult toetatud. Parameetrid, mis on märgitud [KLIENT-AINULT], sõelutakse URL-i ühilduvuse tagamiseks, kuid nõuavad brauseri funktsioone:'],
      bullets: ['värin: mooduli värin nõuab kaadri kohta QR-regenereerimist juhuslikult.', 'automaatne vähendamine: automaatse vähendamise intensiivsus nõuab iteratiivset skannimistesti.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: QA simulatsioon nõuab interaktiivset lõuendi valideerimist.'],
    },
    // Additional Output Parameters
    {
      heading: 'Täiendavad väljundparameetrid',
      paragraphs: ['Laiendatud väljundi ja ekspordi sätted:'],
      bullets: ['fname: allalaadimiseks kohandatud failinimi (vaikimisi: anqr-qrcode).', 'inclQz: vaikse tsooni kaasamine väljundmõõtmetesse 0/1 (vaikimisi: 1).', 'bgOver: taustavärvi alistamine kuueteistkümnendikuta ilma # (alistab bg parameetri).', 'fmtExtra: lisavormingu väljund – puudub, eps, animated_webp (vaikimisi: puudub). Märkus: eps on [PARTIAL].', 'svgPrec: SVG kuju täpsus – piksel, täpne (vaikimisi: piksel). [OSALINE] SVG väljund piiratud serveripoolne.', 'svgEmbed: manustatakse rastri ülekate SVG-s 0/1 (vaikeseade: 1). [OSALINE] SVG väljund piiratud serveripoolne.', 'modulePx: mooduli piksli suurus (vaikimisi: arvutatakse automaatselt suuruse järgi).', 'ääris: vaiksest tsoonist kaugemal olevad lisapiirimoodulid (vaikimisi: 0).', 'crisp: lubage terava/pikslilise pildi renderdamine 0/1 (vaikeseade: 1).', 'snap: Pixel Snap režiim – põrand, ümmargune, lae (vaikimisi: põrand).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Mustri säilitamise parameetrid',
      paragraphs: ['Kontrollige, millised konstruktsioonielemendid on ülekatte eest kaitstud:'],
      bullets: ['keepFinders: säilitab leidja mustrid 0/1 (vaikimisi: 1).', 'keepTiming: säilitab ajastusmustrid 0/1 (vaikimisi: 0).', 'keepAlign: Säilitage joondusmustrid 0/1 (vaikimisi: 0).', 'ProtectFmt: Kaitsevormingu teabemoodulid 0/1 (vaikeseade: 0).', 'ProtectVer: Kaitske versiooni teabemooduleid 0/1 (vaikimisi: 0).'],
    },
    {
      heading: 'Kasutamise näide',
      paragraphs: ['Põhiline QR-kood:', 'https://anqr.link/api/qr?data=https://example.com', 'Stiilis QR-kood kohandatud värvidega:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'QR-kood koos ülekattepildiga:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'Animeeritud GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'example' }],
    },
    {
      heading: 'QR-koodide manustamine',
      paragraphs: ['Professionaalses režiimis loob jagamise funktsioon manustatava HTML-i ja URL-id. Manustamine toimib järgmiselt.'],
      bullets: ['Jaga linki: loob ANQR-i rakendusele URL-i, kus kõik teie seaded on kodeeritud URL-i parameetritena. Saajad saavad QR-koodi vaadata ja muuta.', 'Embed Image: loob märgendi <img>, mis osutab serveri API-le. QR-kood renderdatakse serveri poolel ja serveeritakse pildina.', 'Embed Markdown: loob Markdowni kujutise süntaksi dokumentatsiooni ja README-failide jaoks.', 'Direct API URL: API töötlemata URL, mida kasutatakse rakendustes, skriptides või muudes integratsioonides.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
    {
      heading: 'HTML-i näide',
      paragraphs: ['QR-koodi manustamiseks veebisaidile tehke järgmist.', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR-kood" />', 'Reageeriva suuruse määramiseks:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR-kood" style="maksimaalne laius: 100%; kõrgus: automaatne;" />', 'Server salvestab vastused vahemällu pikkade vahemälu päistega, nii et korduvad sama URL-i päringud on kiired.'],
    },
    {
      heading: 'Jaga URL-i vormingut',
      paragraphs: ['Kui klõpsate Jaga professionaalses režiimis, kodeerib ANQR teie praegused sätted URL-i parameetriteks. Formaat on:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Need parameetrid peegeldavad API parameetreid, nii et saate jagatava URL-i teisendada API URL-iks, muutes baasteed / kohta /api/qr ja kohandades vastavalt vajadusele w/h parameetreid.', 'Märkus. Kohalikest failidest üles laaditud ülekattepilte ei saa URL-i kaudu jagada – jagatud linkides ja API-kutsetes töötavad ainult URL-ipõhised ülekatted (img-parameeter).'],
    },
    {
      heading: 'Hindade piirangud ja kasutamine',
      paragraphs: ['API-t saab mõistlike mahtude jaoks tasuta kasutada. Suuremahulise kasutuse või kommertsrakenduste jaoks, mis nõuavad garanteeritud tööaega, võtke meiega ühendust.', 'API vastused sisaldavad agressiivseid vahemällu salvestamise päiseid. Parima jõudluse saavutamiseks salvestage vastused vahemällu või kasutage identsete QR-koodide jaoks pidevalt sama URL-i.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Parimad tavad',
      paragraphs: ['Usaldusväärsete QR-koodide saamiseks järgige neid juhiseid.'],
      bullets: ['Enne printimist testige alati oma QR-koode mitme skannerirakendusega.', 'Kasutage ülekatete lisamisel veaparandust H (kõrge).', 'Keep at least 4 modules of quiet zone (margin).', 'Tagage esiplaani ja tausta vaheline kõrge kontrastsus.', 'Printimiseks kasutage vähemalt 300 DPI ja testige tegeliku prindisuurusega.', 'Lubage ülekatete kasutamisel leidja mustrite säilitamine.', 'Alustage madalama ülekatte intensiivsusega ja suurendage järk-järgult.', 'Välistingimustes kasutamiseks kaaluge suuremaid mooduli suurusi ja suuremat veaparandust.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Sirvi Learn artikleid', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'example' },
      ],
    },
    {
      heading: 'Veaotsing',
      paragraphs: ['Levinud probleemid ja lahendused:'],
      bullets: ['QR ei skanni: vähendage ülekatte intensiivsust, suurendage veaparandust, kontrollige kontrasti.', 'Liiga suur kood: vähendage sisu pikkust, kasutage URL-i lühendajat, vähendage versiooni.', 'Hägune väljund: suurendage mooduli suurust, kasutage tihendatud vormingute asemel PNG-d.', 'Värvid tunduvad valed: kontrollige värvikontrasti, proovige halltoonides ülekatte režiimi.', 'GIF ei animeeri: kasutage GIF-vormingus väljundit, kontrollige kaadrite arvu.', 'Kujutise ülekatet ei laadita: kontrollige kaugpiltide CORS-i lube.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Vaadake seotud juhendeid ja näiteid', type: 'learn' }],
    },
    {
      heading: 'Klaviatuuri otseteed',
      paragraphs: ['ANQR supports standard keyboard shortcuts. Kasutage eksportimise käivitamiseks klahvikombinatsiooni Ctrl/Cmd+S (kui keskendute eelvaatele).'],
    },
    {
      heading: 'Jagamine ja manustamine',
      paragraphs: ['Professionaalses režiimis klõpsake nuppu Jaga, et kopeerida URL oma praeguste seadetega. Saajad saavad selle URL-i avada, et näha teie täpset konfiguratsiooni. Märkus. Kohalike failide ülekattepilte ei saa URL-i kaudu jagada.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Proovige seda konfiguratsiooni otse ANQR-generaatoris.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Sirvi Learn artikleid', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Vaadake QR-i näiteid', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Avage generaator', type: 'generator' },
  ],
};

export default guide;
