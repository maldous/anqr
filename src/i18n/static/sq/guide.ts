import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Udhëzuesi i përdoruesit ANQR',
  description: 'Udhëzues i plotë për përdorimin e ANQR për krijimin e kodeve QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Hapni gjeneratorin', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Shfletoni artikujt Mësoni', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Shikoni shembuj QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Fillimi',
      paragraphs: [
        'ANQR është një gjenerues i kodit QR me një qasje të parë klienti. Si parazgjedhje, kodet QR gjenerohen në nivel lokal në shfletuesin tuaj - nuk kërkohet llogari dhe të dhënat tuaja mbeten private. Për futjen profesionale, mund të përdorni gjithashtu API-në nga ana e serverit.',
        'Ndërfaqja ka tre nivele të ndërfaqes: bazë, e avancuar dhe profesionale. Zgjidhni nivelin tuaj duke përdorur skedat në kokë. Çdo nivel zhbllokon veçori shtesë duke e mbajtur ndërfaqen të fokusuar në atë që ju nevojitet.',
      ],
      bullets: [
        'Baza: Krijimi i thjeshtë i kodit QR me përmbajtje të thjeshtë teksti/URL dhe mbivendosje të imazhit.',
        'Të avancuara: Opsionet e kodimit QR, stilet e interpretimit, animacioni, formatet e daljes, llojet e zgjeruara të përmbajtjes dhe personalizimi i mbivendosjes.',
        'Profesionale: filigranë, metadata, ndarja, analiza e sigurisë, kodet QR të pagesave dhe veçoritë e ndërmarrjes.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Hapni gjeneratorin', type: 'generator' }],
    },
    {
      heading: 'Fillimi i shpejtë',
      paragraphs: ['Për të krijuar kodin tuaj të parë QR:'],
      bullets: [
        '1. Zgjidhni një lloj përmbajtjeje (URL, tekst, WiFi, etj.) nga menyja rënëse Lloji i përmbajtjes.',
        '2. Futni të dhënat tuaja në fushat e dhëna.',
        '3. Rregulloni opsionalisht ngjyrat, stilet dhe shtoni një imazh të mbivendosur.',
        '4. Klikoni Export për të shkarkuar kodin tuaj QR si PNG, GIF, WebP ose SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Karakteristikat themelore',
      paragraphs: [
        'Niveli bazë ofron një ndërfaqe të thjeshtuar për krijimin e kodeve QR me përmbajtje të ngarkesës dhe mbivendosje të imazheve. Kjo është mënyra më e thjeshtë për të filluar.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Llojet e përmbajtjes (bazë)',
      paragraphs: [
        'Tekst i thjeshtë: kodoni çdo tekst deri në kufirin e kapacitetit të kodit QR. Ideale për mesazhe të shkurtra, kode ose identifikues.',
        'URL: kodoni adresat e uebit. Kodi QR do të hapë URL-në kur të skanohet. Mbështet protokollet http:// dhe https://.',
      ],
    },
    {
      heading: 'Mbivendosja e imazhit (bazë)',
      paragraphs: [
        "Ngarko një imazh (JPG, PNG, GIF, WebP) për t'u përzier me kodin tuaj QR. Karakteristikat themelore të mbivendosjes përfshijnë:",
      ],
      bullets: [
        'Ngarkimi nga skedari: Zgjidhni një imazh nga pajisja juaj.',
        'Ngarkoni nga URL-ja: Futni një URL të imazhit (duhet të lejojë CORS).',
        'Logo qendrore: Vendos imazhin në qendër, duke u mbështetur në korrigjimin e gabimeve.',
        'Përzierje: Përzierje e thjeshtë alfa e imazhit me modelin QR.',
        'Intensiteti: Kontrollon se sa fuqishëm ndikon mbivendosja në kodin QR (0-100%).',
        'Modaliteti i ngjyrave: me ngjyra të plota, shkallë gri ose bardh e zi.',
        'Ruaj modelet e gjetësit: Mban modelet e qosheve të pandryshuara për skanim të besueshëm.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Karakteristikat e avancuara',
      paragraphs: [
        'Niveli i avancuar zhbllokon opsionet e kodimit QR, stilet e interpretimit, animacionin, formatet e daljes, llojet e zgjeruara të përmbajtjes dhe personalizimin e avancuar të mbivendosjes.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cilësimet e kodimit QR',
      paragraphs: [
        'Versioni: Kodet QR vijnë në versionet 1-40, me versionet më të larta që mbajnë më shumë të dhëna, por janë më të mëdha. Vendoseni në 0 (Auto) për të lejuar ANQR të zgjedhë versionin më të vogël që i përshtatet përmbajtjes suaj.',
        'Korrigjimi i gabimit: Përcakton se sa dëme mund të pësojë një kod QR ndërsa mbetet i skanueshëm.',
      ],
      bullets: [
        'L (I ulët): 7% korrigjim gabimi - madhësia më e vogël, teprica më e vogël.',
        'M (Medium): 15% korrigjim gabimi - opsion i balancuar.',
        'Q (Quartile): 25% korrigjim gabimi - i mirë për kodet e printuara.',
        'H (I lartë): 30% korrigjim gabimi - më i miri për kodet me mbivendosje ose në kushte të vështira.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zonë e qetë (Margjina)',
      paragraphs: [
        'Zona e qetë është hapësira e bardhë rreth kodit QR. Skanerët kanë nevojë për këtë kufi për të zbuluar se ku fillon kodi. Standardi rekomandon të paktën 4 module. Zvogëlimi nën 4 mund të shkaktojë probleme me skanimin.',
      ],
    },
    {
      heading: 'Stili i Modulit',
      paragraphs: [
        'Modulet janë katrorët individualë që përbëjnë një kod QR. ANQR ofron pesë stile:',
      ],
      bullets: [
        'Sheshi: Pamja klasike QR me qoshe të mprehta.',
        'Të rrumbullakosura: Qoshe të zbutura për një pamje më miqësore.',
        'Pika: Module rrethore për një estetikë moderne.',
        'Diamant: katrorë të rrotulluar 45° për një model të veçantë.',
        'Lidhur: Modulet bashkohen kur janë ngjitur, duke krijuar forma organike.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Stili i modelit të gjetësit',
      paragraphs: [
        'Modelet e gjetësit janë tre katrorët e mëdhenj në qoshet QR që ndihmojnë skanerët të orientojnë kodin. Stilet e disponueshme:',
      ],
      bullets: [
        'Sheshi: Qoshe standarde katrore.',
        'Rrumbullakosura: Qoshet e zbutura që përputhen me stilin e modulit të rrumbullakosur.',
        'Rrethi: Modele rrethore gjetës për kodet e stilit me pika.',
      ],
    },
    {
      heading: 'Modelet e shtrirjes dhe kohës',
      paragraphs: [
        'Modelet e shtrirjes shfaqen në kode më të mëdha QR (versioni 2+) për të ndihmuar në korrigjimin e shtrembërimit. Modelet e kohës janë linjat e alternuara që lidhin modelet e gjetësit.',
      ],
      bullets: [
        'Stili i shtrirjes: Gjetësi i ndeshjeve, katror, i rrumbullakosur ose rreth.',
        'Stili i kohës: Moduli i ndeshjes, i ngurtë ose i ndërprerë.',
      ],
    },
    {
      heading: 'Ngjyrat',
      paragraphs: [
        'Në plan të parë: Ngjyra e moduleve QR. E zeza (#000000) është standarde, por çdo ngjyrë e errët funksionon.',
        'Sfondi: Ngjyra e sfondit. E bardha (#ffffff) është standarde. Siguroni kontrast të mjaftueshëm me planin e parë.',
        'Sfondi transparent: Hiqni tërësisht sfondin për përdorim në sipërfaqe me ngjyra. Sigurohuni që sipërfaqja të sigurojë kontrast të mjaftueshëm.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Madhësia dhe boshllëku i modulit',
      paragraphs: [
        "Madhësia e modulit: Kontrollon se sa i madh është dhënë çdo modul në piksel. Vlerat më të mëdha krijojnë kode më të mëdha dhe më të lehta për t'u skanuar.",
        'Module Gap: Shton hapësirë midis moduleve si përqindje. Boshllëqet e vogla (5-15%) mund të përmirësojnë skanueshmërinë në disa kushte, por boshllëqet e tepërta ulin besueshmërinë.',
      ],
    },
    {
      heading: 'Cilësimet e daljes',
      paragraphs: ['Formati: Zgjidhni formatin tuaj të eksportit bazuar në rastin e përdorimit.'],
      bullets: [
        'PNG: Format raster pa humbje, ideal për shumicën e përdorimeve. Më e mira për printim dhe dixhital.',
        'WebP: Format modern me madhësi më të vogla skedarësh. I mirë për përdorim në internet.',
        'GIF: Kërkohet për kodet QR të animuara. Mbështet transparencën.',
        'SVG: Format vektorial që përshkallëzohet pafundësisht. Më e mira për printime të mëdha ose kur ju duhet të modifikoni kodin.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Dimensionet e daljes',
      paragraphs: [
        'Gjerësia/ Lartësia: Caktoni madhësinë e daljes në piksel. Për printim, llogaritni bazuar në DPI (p.sh., 300 DPI në 1 inç = 300 px). Madhësitë më të mëdha skanojnë me më shumë siguri në distancë.',
      ],
    },
    {
      heading: 'Cilësimet e animacionit (të avancuara)',
      paragraphs: ['Kontrolloni sjelljen e kodit të animuar QR:'],
      bullets: [
        'Shpejtësia: Shpejtësia e kuadrove të animacionit në milisekonda.',
        'Loop: Animacion i vazhdueshëm ose me luajtje të vetme.',
        'Bounce: Drejtimi i animacionit ping-pong.',
        'Fillimi i kornizës: Filloni animacionin nga një kornizë specifike.',
        'Max Frames: Kufizoni totalin e kornizave në animacion.',
        'Hapi i kornizës: Kapërceni kornizat për animacion më të shpejtë.',
        'Interpolimi: Asnjë, Crossfade, ose Morph midis kornizave.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Llojet e përmbajtjes (të avancuara)',
      paragraphs: ['Niveli i avancuar zhbllokon formate shtesë të ngarkesës:'],
      bullets: [
        'Numri i telefonit (tel:): Krijon një lidhje telefonike të thirrshme.',
        'Email (mailto:): Hap klientin e emailit me subjekt dhe tekst opsional.',
        'SMS: Mesazh me tekst i plotësuar paraprakisht në një numër telefoni.',
        'vCard: Karta e plotë e kontaktit me emrin, organizatën, telefonin, emailin, adresën.',
        'MeCard: Format kompakt i kontaktit i popullarizuar në Japoni.',
        'BizCard: Format i vjetër i kartës së biznesit.',
        'Vendndodhja gjeografike: koordinatat GPS që hapen në harta.',
        'WiFi: Kredencialet e rrjetit për lidhjen automatike (SSID, fjalëkalimi, lloji i sigurisë).',
        'Ngjarja e kalendarit: Formati iCalendar me titull, vendndodhje, datë/orë.',
        'Ngjarja RSVP: Lidhja me faqen e regjistrimit të ngjarjes.',
        'Abonohu në kalendar: Abonohu në një furnizim ICS/WebCal.',
        'URL e skedarit/dokumentit: Lidhje direkte me skedarët e shkarkueshëm.',
        'Lidhja e ruajtjes në renë kompjuterike: Lidhje me Google Drive, Dropbox, OneDrive, etj.',
        'Profili social: Lidhje me LinkedIn, Twitter, Instagram, etj.',
        'Lidhja e mesazheve: WhatsApp, Telegram, Sinjalizoni lidhje të thella.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Karakteristikat e avancuara të mbivendosjes',
      paragraphs: ['Aftësi shtesë mbivendosjeje:'],
      bullets: [
        'Crop: Aktivizo prerjen për të zgjedhur një rajon katror të imazhit tuaj.',
        'Gjysmëton: Modeli klasik me pika në stilin e printimit bazuar në ndriçimin e imazhit.',
        'Dithered: Dithered error-difuzion për riprodhim të detajuar.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mënyrat e përzierjes së mbivendosjes (të avancuara)',
      paragraphs: ['Modalitete shtesë të përzierjes në nivelin e avancuar:'],
      bullets: [
        'Nënpiksel: Ndan çdo modul në nënpiksel për detaje më të larta.',
        'Zhurma blu: Përdor zhurmën blu për modele pa objekte.',
        'Mozaik: Efekti i bazuar në pllakë që ruan strukturën e imazhit.',
        'Gap Fill: Vendos imazhin në boshllëqe midis moduleve.',
        'Ndriçimi: Ndryshon madhësinë e modulit bazuar në shkëlqimin e imazhit.',
        'Duotone: Harton imazhin në dy ngjyra për kontrast të mrekullueshëm.',
      ],
    },
    {
      heading: 'Intensiteti i mbivendosjes',
      paragraphs: [
        'Kontrollon se sa fuqishëm ndikon mbivendosja në kodin QR (0-100%). Vlerat më të larta tregojnë më shumë detaje të imazhit, por mund të zvogëlojnë skanueshmërinë. Filloni rreth 70% dhe rregullojeni në bazë të testimit.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Modaliteti i ngjyrave',
      paragraphs: ['Si përpunohet imazhi i mbivendosjes:'],
      bullets: [
        'Ngjyra e plotë: Ruan ngjyrat origjinale të imazhit.',
        'Grayscale: Konvertohet në tone bardh e zi.',
        'Bardh e zi: Konvertimi binar me kontrast të lartë.',
      ],
    },
    {
      heading: 'Ruaj modelet e gjetësit',
      paragraphs: [
        'Kur aktivizohet, i mban tre modelet e gjetësit të qosheve të pandryshuara nga mbivendosja. Rekomandohet fuqimisht për skanim të besueshëm.',
      ],
    },
    {
      heading: 'Parapërpunimi i imazhit',
      paragraphs: [
        'Aplikoni filtra në imazhin tuaj të mbivendosjes përpara se të përzieni. Këto rregullime mund të përmirësojnë mënyrën se si imazhi shfaqet në kodin përfundimtar QR.',
      ],
      bullets: [
        'Shkëlqimi (-100 deri në +100): Ndriçoni ose errësoni imazhin.',
        'Kontrasti (-100 në +100): Rritni ose ulni gamën tonale.',
        'Gama (0,2 deri në 3,0): Rregullim jolinear i ndriçimit. Vlerat nën 1 i ndriçojnë tonet e mesme, mbi 1 i errësojnë ato.',
        'Ngopja (-100 deri në +100): Intensiteti i ngjyrës. -100 është shkallë gri, +100 është e mbingopur.',
        'Rrotullimi i ngjyrës (0-360°): Zhvendos të gjitha ngjyrat rreth rrotullës së ngjyrave.',
        'Turbullim (0-20 px): Zbut detajet e imazhit.',
        'Mprehje (0-100%): Përmirësoni skajet dhe detajet.',
        'Posterize (0-16 nivele): Ulni nivelet e ngjyrave për një efekt posteri.',
        'Pragu (0-255): Konverto në të zezë/bardhë binare në pikën e ndërprerjes.',
        'Zbulimi i skajeve: Algoritmet Sobel ose Canny për të treguar vetëm skajet.',
        'Invert: Kthoni të gjitha ngjyrat.',
      ],
    },
    {
      heading: 'Modaliteti i përshtatjes',
      paragraphs: ['Si përshtatet imazhi i mbivendosjes me zonën e kodit QR:'],
      bullets: [
        'Kopertina: Imazhi mbush të gjithë zonën, duke prerë nëse është e nevojshme.',
        'Përmbajë: I gjithë imazhi i dukshëm, mund të ketë kufij.',
        "Shtrirja: Imazhi shtrembërohet për t'u mbushur saktësisht.",
      ],
    },
    {
      heading: 'Opsionet e transformimit',
      paragraphs: [
        'Rrotullimi: Rrotulloni mbivendosjen me ngritje 90°.',
        'Kthejeni X/Y: Pasqyroni imazhin horizontalisht ose vertikalisht.',
      ],
    },
    {
      heading: 'Algoritmet e dithering',
      paragraphs: [
        'Dithering konverton imazhet me tone të vazhdueshme në modele që mund të përfaqësojnë kodet QR. Disponohet kur përdorni modalitetet e përzierjes Dithered, Blue Noise ose True Dither.',
      ],
      bullets: [
        'Difuzioni i gabimeve: stili klasik Floyd-Steinberg. Përhap gabimin e kuantizimit në pikselët fqinjë.',
        'Ordered (Bayer): Përdor një matricë pragu për modelet e rregullta.',
        'Pika e grumbulluar: Simulon printimin me gjysmëton.',
        'Void & Cluster: Dithering i optimizuar i renditur.',
        'Zhurma blu: Model vizualisht i këndshëm me pamje të rastësishme.',
        'Pragu i zhurmës blu: Pragu i zhurmës bluhet me teksturë të zhurmës blu.',
        'Zhurma e bardhë: Acarim i rastësishëm i pragut.',
        'Zhurma Gaussian/Triangular Noise: Zhurmë me shpërndarje të ndryshme.',
        'Zhurma blu + Difuzioni i gabimit: Hibrid që kombinon të dyja teknikat.',
        'Zhurma blu e ekranit: Modeli i zhurmës blu i ngjashëm me ekranin.',
        'Perceptues: I peshuar nga ndriçimi për rezultate më të mira vizuale.',
        'Edge-Aware: Ruan skajet e imazhit gjatë dithering.',
        'Pragu Adaptive: Pragu i Përshtatshëm Lokal.',
        'Zhurma e përkohshme blu: Për imazhet GIF të animuara, modeli ndryshon për kornizë.',
      ],
    },
    {
      heading: 'Kernelet e difuzionit',
      paragraphs: ['Kur përdorni Dithering Error Diffusion, zgjidhni se si shpërndahet gabimi:'],
      bullets: [
        'Floyd-Steinberg: Difuzion klasik me 4 fqinjë. Zgjedhje e mirë e përgjithshme.',
        'Jarvis-Judice-Ninke: 12-fqinj, më i butë, por më i ngadalshëm.',
        'Stucki: Ngjashëm me JJN me pesha të ndryshme.',
        'Burkes: JJN e thjeshtuar, më shpejt.',
        'Sierra: Familja e bërthamave që balancojnë cilësinë dhe shpejtësinë.',
        'Atkinson: Difuzioni i dritës, ruan detajet, por mund të jetë me kokrra.',
      ],
    },
    {
      heading: 'Forca Dither',
      paragraphs: [
        'Kontrollon se sa ditering aplikohet (0-100%). Vlerat më të ulëta ruajnë më shumë modelin origjinal, vlerat më të larta tregojnë më shumë detaje të imazhit.',
      ],
    },
    {
      heading: 'Cilësimet e nënpikselit',
      paragraphs: ['Kur përdorni modalitetin e përzierjes së nënpikselëve:'],
      bullets: [
        'Madhësia e rrjetit: 2×2, 3×3 ose 4×4 nënpikselë për modul. Më e lartë = më shumë detaje.',
        'Rregulli qendror: Strikte kërkon nënpiksel qendror që të përputhet me modulin. Qendra Halftone lejon variacionin.',
        'Ngjyra neutrale: Ngjyra e përdorur për nënpikselë të papërcaktuar.',
        'Mbështetja e gjetësit: Si përkthehen modelet e gjetësit (të ngurta ose të stilizuara).',
      ],
    },
    {
      heading: 'Cilësimet e gjysmëtonit',
      paragraphs: ['Kur përdorni modalitetin e përzierjes gjysmëton:'],
      bullets: [
        'Madhësia e qelizës: Për modul ose rrjetë N×N.',
        'Forma e pikës: rrethi, katrori ose vija.',
        'Kurba e ndriçimit: Linear, S-Kurba ose Gamma.',
      ],
    },
    {
      heading: 'Ngjyrat duotone',
      paragraphs: [
        'Kur përdorni modalitetin e përzierjes Duotone, vendosni ngjyrën e hijes (zonat e errëta) dhe ngjyrën e nënvizimit (zonat e ndritshme).',
      ],
    },
    {
      heading: 'Cilësimet e animacionit GIF',
      paragraphs: ['Kur përdorni mbivendosje të animuara GIF:'],
      bullets: [
        'Përdorni vonesat e kornizës: Respektoni kohën origjinale të GIF-it.',
        'Max FPS: Kufizoni shpejtësinë e kuadrove (1-60 fps).',
        'Trajtimi i asgjësimit: Respektoni ose thjeshtoni metodat e asgjësimit të kornizës.',
      ],
    },
    {
      heading: 'Opsione të avancuara të interpretimit',
      paragraphs: ['Kontrolle shtesë të paraqitjes:'],
      bullets: [
        'Modaliteti i boshllëqit: Asnjë, stilimi i hendekut me futje, goditje ose hapësirë negative.',
        'Rrezja e këndit: Përqindja e këndeve të rrumbullakosura për modulet.',
        'Gradient: Asnjë, gradient linear, radial ose konik në module.',
        'Stili i jashtëm/ i brendshëm i syrit: Stilim i pavarur për unazat e modelit gjetës.',
        'Rotacioni me pika: Rrotulloni modulet e diamantit/pikës.',
        'Shkalla e syve: Rregullimi i madhësisë për modelet e gjetësit.',
        'Stili i kornizës: Shtoni korniza dekorative (kornizë e rrumbullakosur, ngjitëse, etiketë).',
        'Teksti i kornizës: Shtoni tekst si "Scan Me!" te kornizat.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kodimi i avancuar QR',
      paragraphs: ['Rregulloni mirë kodimin QR:'],
      bullets: [
        'Mënyra e kodimit: Auto, Numerike, Alfanumerike, Byte/UTF-8 ose Kanji.',
        'Zbatoni Zonën Minimale të Qetë: Siguroni të paktën 4 diferencë të modulit.',
        'Modeli i maskës: Auto (optimale), ose zgjidhni manualisht modelet 0-7 për të kontrolluar shpërndarjen e modulit. Modele të ndryshme krijojnë pamje të ndryshme vizuale ndërsa kodojnë të njëjtat të dhëna.',
        'Kodimi i karaktereve: ISO-8859-1 (Latin-1 parazgjedhje), UTF-8 (Unikod i plotë duke përfshirë emoji) ose Shift-JIS (japonisht). Zgjidhni bazuar në kërkesat e karakterit të përmbajtjes suaj.',
      ],
    },
    {
      heading: 'Opsione të avancuara të daljes',
      paragraphs: ['Cilësimet shtesë të eksportit:'],
      bullets: [
        'Emri i skedarit: Emri i skedarit të personalizuar për shkarkime.',
        'Madhësia e paletës GIF: 2-256 ngjyra në daljen GIF.',
        'GIF Quantizer: Prerje mesatare, NeuQuant ose Reduktim i ngjyrave Octree.',
        'GIF Dithering: Off, Floyd-Steinberg, ose Ordered.',
        'Ngjyra transparente GIF: Vendosni një ngjyrë të jetë transparente.',
        'SVG True Vector: Përdorni shtigjet në vend të rasterit të integruar.',
        'Precisioni i formës SVG: Paraqitja e pikselit ose e saktë e rrugës.',
        'SVG Embed Raster Overlay: Përfshi mbivendosjen si imazh të ngulitur.',
        'Mbështetja e sfondit: Forconi një ngjyrë specifike të sfondit në dalje.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opsionet e Validimit',
      paragraphs: ['Cilësimet e përpunimit të hyrjes:'],
      bullets: [
        'Vlereso hyrjen: Kontrollo formatin e përmbajtjes përpara se të kodosh.',
        'Shkurtoni hapësirën e bardhë: Hiqni hapësirat kryesore/pasuese.',
        'Normalizimi i linjave të reja: Konvertoni të gjitha mbaresat e rreshtave në LF.',
        'Mbrojtja e gjatësisë maksimale: Paralajmëroni nëse përmbajtja tejkalon kapacitetin QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Karakteristikat profesionale',
      paragraphs: [
        'Niveli profesional shton filigranë, meta të dhëna, opsione të ndarjes, analiza të sigurisë, kode QR të pagesave dhe veçori të ndërmarrjes.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Filigram',
      paragraphs: ['Shtoni filigranë në kodet tuaja QR:'],
      bullets: [
        'Lloji: Teksti, imazhi ose filigrani i modelit.',
        'Pozicioni: në qendër, kënde, skaje, prapa ose zonë e qetë.',
        'Opacity: Transparenca e filigranit (0-100%).',
        'Modaliteti i përzierjes: Përzierje normale, shumëzuese, ekrani ose mbivendosjeje.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadatat',
      paragraphs: ['Vendosni të dhënat meta në skedarët e eksportuar:'],
      bullets: [
        'Fushat Titulli, Autori, E Drejta e Autorit, Licenca, Përshkrimi.',
        'Koha e krijimit: Vendos vulën kohore të gjenerimit.',
        'Çelës-Vlera e personalizuar: Shtoni çifte arbitrare të meta të dhënave.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ndarja',
      paragraphs: ['Ndani konfigurimet e kodit tuaj QR:'],
      bullets: [
        'Lidhja e drejtpërdrejtë: Gjeneroni një URL të ndashme me cilësimet tuaja aktuale.',
        'Embed HTML: Merrni kodin e ngulitjes për faqet e internetit.',
        'Parametrat e kodimit: Përfshini të gjitha cilësimet në URL-në e ndarjes.',
        'Shënim: Imazhet e mbivendosjes nga skedarët lokalë nuk mund të ndahen përmes URL-së.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Analiza e Sigurisë',
      paragraphs: ['Sigurohuni që kodet QR të mbeten të skanueshme:'],
      bullets: [
        'Modaliteti i sigurisë: Kërkesat e skanimit joaktiv, të balancuar ose të rreptë.',
        'Madhësia minimale e modulit: Madhësia minimale e pikselit për modul.',
        'Zona Minimale e Qetë: Modulet e marzhit minimal.',
        'Lock Finders/Timing/Align/Format/Version: Mbroni elemente specifike.',
        'Intensiteti maksimal i mbivendosjes sipas ECC: Kufijtë automatikë të intensitetit bazuar në nivelin e korrigjimit të gabimit.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Llojet e përmbajtjes (profesionale)',
      paragraphs: ['Niveli profesional shton llojet e pagesave dhe përmbajtjes së ndërmarrjes:'],
      bullets: [
        'EPC/SEPA (BE): Kodet QR të transfertave bankare evropiane me IBAN, BIC, shuma, referencë.',
        'UPI (Indi): Ndërfaqja e Unifikuar e Pagesave me VPA, emri i marrësit, shuma.',
        'PayNow (Singapore): Pagesë e shpejtë në Singapor me UEN ose numër celular.',
        'PromptPay (Tajlandë): Sistemi kombëtar i pagesave tajlandeze.',
        'PIX (Brazil): Pagesë e menjëhershme braziliane me çelësin PIX.',
        'Kripto: Adresat e pagesave të Bitcoin, Ethereum, Litecoin me shumë opsionale.',
        'Lidhja e fushatës së marketingut: URL-të me përcjelljen e parametrave të plotë të UTM (Etiketat e Marketingut).',
        'Lidhje e shkurtër: Për përdorim me shkurtuesit e URL-ve për kodet QR dinamike/të gjurmueshme.',
        'GS1 Digital Link: Identifikimi i produktit me GTIN, serial, grup, skadim.',
        'Lidhja e thellë e aplikacionit: Lidhje të thella të aplikacioneve iOS/Android me skema të personalizuara.',
        'Format i personalizuar: Të dhëna të papërpunuara pa formatim ose vërtetim.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Pagesat përkatëse për gjuhën në modalitetin e avancuar',
      paragraphs: [
        'Kur përdorni modalitetin e përparuar, ANQR tregon automatikisht mënyrat e pagesës që lidhen me gjuhën tuaj të zgjedhur. Për shembull, përdoruesit vietnamezë shohin VietQR, përdoruesit tajlandez shohin PromptPay dhe përdoruesit e gjuhës indiane shohin UPI dhe BharatQR. Metodat globale të pagesës (kriptomonedha, PayPal, Cash App) janë të disponueshme për të gjitha gjuhët. Modaliteti profesional zhbllokon të gjitha standardet e pagesave pavarësisht nga gjuha.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standardet Evropiane të Pagesave',
      bullets: [
        'EPC/SEPA (BE): Kodet QR të transfertave bankare evropiane sipas standardit të kodit EPC QR. Mbështet IBAN, BIC (opsionale për vendas), shumën në EUR dhe referenca të strukturuara ose të pastrukturuara të pagesave. Përdoret në të gjithë zonën SEPA duke përfshirë vendet e BE-së plus Zvicrën, Norvegjinë, Islandën, Lihtenshtajnin, Monakon dhe San Marinon.',
        'Faturë zvicerane QR: Standardi zviceran i pagesave sipas GJASHTË Udhëzimeve të Zbatimit. Mbështet CHF dhe EUR, QR-Referenca (QRR), Referenca e Kreditorit (ISO 11649), adresat e strukturuara të kreditorit/debitorit dhe informacionin e faturave. Kërkohet për faturat zvicerane që nga viti 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standardet Indiane të Pagesave',
      bullets: [
        'UPI (Indi): Ndërfaqja e unifikuar e pagesave pas specifikimit të lidhjes së thellë NPCI. Mbështet VPA (Adresa virtuale e pagesës), emrin e marrësit, shumën në INR, shënimin e transaksionit, ID-në e referencës, kodin e kategorisë së tregtarit dhe mënyrën e transaksionit.',
        'BharatQR (Indi): Standardi i unifikuar QR që mbështet si UPI ashtu edhe pagesat me kartë. Kombinon UPI VPA me PAN-in e kartës për pajtueshmëri maksimale. Përfshin emrin e tregtarit, qytetin, MCC, detajet GST dhe numrat e faturës/referencës.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standardet e pagesave të Azisë Juglindore',
      bullets: [
        'PayNow (Singapore): Sistemi i pagesave të shpejta të Singaporit duke përdorur specifikimin EMVCo QR me profilin SGQR. Mbështet UEN (regjistrimin e biznesit), numrin celular ose NRIC si identifikues përfaqësues. Përfshin flamurin e redaktueshmërisë së shumës dhe datën e skadimit.',
        'PromptPay (Tajlandë): Sistemi kombëtar i pagesave tajlandeze që ndjek profilin EMV të Bankës së Tajlandës. Mbështet numrin celular, ID-në kombëtare, ID-në tatimore, ID-në e portofolit elektronik dhe pagesën e faturave me fusha të shumta referimi.',
        'QRIS (Indonezi): Kodi i përgjigjes së shpejtë Standard indonezian. Standardi kombëtar i pagesave i bazuar në EMV që mbështet ID-në e tregtarit, NMID (National Merchant ID), klasifikimin e kritereve të tregtarit dhe tarifat e komoditetit (fikse ose në përqindje).',
        'DuitNow (Malajzi): Sistemi Malajzian i pagesave të menjëhershme. Mbështet lloje të shumta proxy duke përfshirë NRIC, celular, pasaportë, ID të ushtrisë dhe numrat e regjistrimit të biznesit.',
        'VietQR (Vietnam): Standardi Vietnamez i transfertave ndërbankare. Kërkon BIN-in e bankës (identifikimin e NPAS) dhe numrin e llogarisë. Mbështet kode të shumta shërbimi për lloje të ndryshme transferimi (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipinet): Standardi i pagesës QR i Filipineve për InstaPay dhe PESONet. Përdor numrat e llogarisë me identifikimin e tregtarit për transaksionet P2M (person me tregtar).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standardet e pagesave të Azisë Lindore',
      bullets: [
        'TWQR (Tajvan): Standardi i pagesës QR tajvaneze. Mbështet ID-në e tregtarit, ID-në tatimore dhe shumat TWD.',
        'HKQR/FPS (Hong Kong): Kodet QR të sistemit të pagesave më të shpejta në Hong Kong. Mbështet ID-në FPS, numrin celular ose emailin si identifikues pagese. Shumat në HKD.',
        'JPQR (Japoni): Standardi japonez i pagesës së kodit QR të unifikuar. Përdor ID-në e dyqanit për identifikimin e tregtarit me shuma JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standarde të tjera Rajonale të Pagesave',
      bullets: [
        'PIX (Brazil): Sistemi i pagesave të menjëhershme të Bankës Qendrore të Brazilit sipas specifikimit të Kodit BR. Mbështet çelësat PIX (CPF, CNPJ, email, telefon ose çelës i rastësishëm), emrin/qytetin e tregtarit, ID-në e transaksionit dhe shumat BRL.',
        'AusPayNet/NPP PayID (Australi): Sistemi i PayID i Platformës së Re të Pagesave Australiane. Mbështet llojet e PayID (email, celular, ABN, ID e organizatës) ose numrin tradicional të llogarisë BSB +. Emri i tregtarit është opsional pasi paguesit shohin emrin e regjistruar nga kërkimi i NPP.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pagesat në kriptomonedhë',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): URI standarde të pagesave të kriptomonedhave me adresën e portofolit, shumën opsionale dhe etiketën. E përputhshme me të gjitha kuletat kryesore Bitcoin dhe Litecoin.',
        'Lightning Network (BOLT11): Faturat e pagesave të Rrjetit Rrufeja. Ngjit një varg faturë të koduar BOLT11 për pagesa të menjëhershme të Bitcoin me tarifa minimale.',
        'Ethereum (EIP-681): URI-të e kërkesave të transaksionit Ethereum që mbështesin transferimet vendase ETH dhe transferimet e tokenit ERC-20. Përfshin ID-në e zinxhirit për mbështetjen e shumë rrjeteve (Mainnet, Polygon, BSC, Arbitrum, Optimism, Orteku), parametrat e gazit dhe thirrjet e funksionit të kontratës.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Shërbimet e lidhjes së pagesës',
      bullets: [
        'PayPal.Me: Lidhje pagese PayPal me emrin e përdoruesit dhe shumën opsionale të para-mbushur. Marrësit mund të paguajnë nëpërmjet bilancit të PayPal, kartave ose llogarive bankare.',
        'Aplikacioni Cash: Lidhjet e pagesave të aplikacionit Cash duke përdorur $cashtag me shumë opsionale. I njohur në Shtetet e Bashkuara për pagesat nga kolegët.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'EMV QR gjenerike',
      bullets: [
        'EMV Generic: Krijoni kode QR të personalizuara të modalitetit të prezantimit të tregtarit EMV për skemat e pagesave që nuk janë të listuara në mënyrë specifike. Konfiguro emrin e tregtarit, qytetin, kodin e shtetit (ISO 3166-1), kodin e monedhës (numerik ISO 4217), MCC, opsionet e tarifës së bakshishit/komoditetit dhe fushat shtesë të të dhënave. I dobishëm për testim ose integrime me porosi.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Mënyrat e përzierjes së mbivendosjes (profesionale)',
      paragraphs: ['Modalitete shtesë të përzierjes në nivelin profesional:'],
      bullets: [
        'Pixelate: Efekti i mbivendosjes me pixel.',
        'Skicë: Mbivendosja e zbulimit të skajeve që tregon vetëm konturet.',
        'Vala: Efekti i shtrembërimit të valëzuar.',
        'Madhësia e nënpikselit: Madhësia e ndryshueshme e nënpikselit bazuar në imazh.',
        'True Dither: Acarim i avancuar me zgjedhje të renditur të matricës.',
        'Ekstreme: Dukshmëria maksimale e imazhit, mund të ndikojë në skanimin.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cilësimet e mbrojtjes',
      paragraphs: [
        'Kontroll i imët mbi të cilët elementë QR mbrohen nga modifikimi i mbivendosjes:',
      ],
      bullets: [
        'Ruajtja e kohës: Mbani modelet e kohës të pandryshuara.',
        'Ruaj shtrirjen: Mbajini të pandryshuara modelet e shtrirjes.',
        'Protect Format Info: Modulet e informacionit të formatit të mbrojtjes.',
        'Mbrojtja e informacionit të versionit: Mbrojtja e moduleve të informacionit të versionit.',
      ],
    },
    {
      heading: 'Modaliteti ECC-Aware',
      paragraphs: [
        'Shpërndan në mënyrë inteligjente intensitetin e mbivendosjes bazuar në kapacitetin e korrigjimit të gabimeve. Sistemi analizon se cilat module mund të modifikohen duke ruajtur skanueshmërinë.',
      ],
      bullets: [
        "Buxheti i rrezikut: Përqindja e kapacitetit të korrigjimit të gabimeve për t'u përdorur (0-100%).",
        'Buxheti më i lartë = mbivendosje më e dukshme, por skanim më i rrezikshëm.',
        'Buxheti më i ulët = skanim më i sigurt, por mbivendosje më pak e dukshme.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opsionet e paraqitjes profesionale',
      paragraphs: ['Kontrollet e përparuara të paraqitjes:'],
      bullets: [
        'Skajet e qarta: Përdorni paraqitjen e imazhit me pikselë për skajet e mprehta të modulit.',
        'Pixel Snap: Shtrirja e pikselëve në dysheme, të rrumbullakëta ose tavan.',
        'Modaliteti i ngjyrave për çdo modul: I ngurtë, sipas shkëlqimit, sipas pozicionit, sipas mbivendosjes, sipas grupit.',
        'Paleta e ngjyrave: Përcaktoni paletën e ngjyrave të personalizuara për ngjyrosjen për çdo modul.',
        'Ruajtja e kontrastit: Siguroni raportin minimal të kontrastit midis ngjyrave.',
        'Raporti Minim Kontrasti: Kërkesa e kontrastit të stilit WCAG (1:1 deri në 21:1).',
        'Modulet shtesë kufitare: Kufiri shtesë përtej zonës së qetë.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opsionet e daljes profesionale',
      paragraphs: ['Cilësimet e eksportit të ndërmarrjes:'],
      bullets: [
        'DPI: Cakto rezolucionin e printimit (72-600 DPI). 300 DPI rekomandohet për printim.',
        'Përfshi zonën e qetë: Ndrysho zonën e qetë në dimensionet e daljes.',
        'Eksporto si shtesë: Gjeneroni PDF së bashku me formatin kryesor.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cilësimet e animacionit (profesionale)',
      paragraphs: ['Karakteristikat shtesë të animacionit profesional:'],
      bullets: [
        'Ngërryerje e përkohshme: Joaktiv, Zhurmë blu ose dridhje e sigurt për çdo kornizë.',
        'Modeli: Asnjë, Efektet Pulse, Valë, Scanline, Shimmer ose Drift.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Referenca API',
      paragraphs: [
        'ANQR ofron një API nga ana e serverit për gjenerimin e kodeve QR nëpërmjet parametrave të URL-së. Kjo është ideale për futjen e kodeve QR në faqet e internetit, emailet, dokumentet ose rrjedhat e automatizuara të punës pa JavaScript nga ana e klientit.',
        'URL-ja bazë: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Shikoni shembuj QR', type: 'example' }],
    },
    {
      heading: 'Parametrat Bazë',
      paragraphs: ['Parametrat e kërkuar dhe të zakonshëm (emrat e parametrave nuk përkthehen):'],
      bullets: [
        'të dhënat (kërkohen): Përmbajtja për të koduar në kodin QR. URL-kodojnë karaktere speciale.',
        'madhësia: Madhësia e imazhit në piksel (e parazgjedhur: 400, maksimumi: 2000). Përdoret nëse w/h nuk specifikohet.',
        'w, h: Gjerësia dhe lartësia e daljes në piksel. Anulon parametrin e madhësisë.',
        'formati: Formati i daljes - png, webp ose gif (i parazgjedhur: png).',
        'ec: Niveli i korrigjimit të gabimit - L, M, Q ose H (i parazgjedhur: H).',
        'fg: Ngjyra e planit të parë si heks pa # (parazgjedhja: 000000).',
        'bg: Ngjyra e sfondit si heks pa # (parazgjedhja: ffffff).',
        'transparent: Vendoseni në 1 për sfond transparent.',
        'margjina: Zonë e qetë në module (parazgjedhja: 4).',
      ],
    },
    {
      heading: 'Parametrat e stilimit',
      paragraphs: ['Stilimi i modulit dhe modelit:'],
      bullets: [
        'stili: Stili i modulit - katror, i rrumbullakosur, pika, diamant, i lidhur.',
        'finder: Stili i modelit Finder - katror, i rrumbullakosur, rreth.',
        'align: Stili i modelit të shtrirjes - match_finder, katror, i rrumbullakosur, rrethi.',
        'koha: Stili i modelit të kohës - match_module, solid, me ndërprerje.',
        'rrezja: Përqindja e rrezes së këndit 0-100.',
        'boshllëk: Përqindja e hendekut të modulit 0-50.',
        'gapMode: Modaliteti i boshllëkut - asnjë, futje, goditje, hapësirë_negative.',
        'eyeOuter, eyeInner: Stilet e syve - katror, i rrumbullakosur, rreth.',
        'EyeScale: Përqindja e shkallës së syrit (e parazgjedhur: 100).',
        'grad: Lloji i gradientit - asnjë, linear, radial, konik.',
        'gradAngle: Këndi i gradientit për gradientët linearë.',
        'gradStops: Gradienti ndalon si color1,pos1,color2,pos2,... (p.sh., ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Parametrat e mbivendosjes',
      paragraphs: [
        'Opsionet e mbivendosjes së imazhit (imazhi i mbivendosjes merret nga ana e serverit):',
      ],
      bullets: [
        'img: URL për mbivendosjen e imazhit (duhet të jetë e aksesueshme publikisht).',
        'modaliteti: Modaliteti i mbivendosjes - qendër, gjysmëton, përzierje, ndriçim, mozaik, ngërç, zhurmë blu, nënpiksel.',
        'intensiteti: Intensiteti i mbivendosjes 0-100 (parazgjedhja: 100).',
        'ColorMode: Modaliteti i mbivendosjes së ngjyrave - ngjyra, shkallë gri, bw.',
        'përshtatje: Si përshtatet mbivendosja - mbulo, përmban, shtrihet.',
        'rot: Rrotullimi i mbivendosjes në gradë.',
        'FlipX, FlipY: Vendoseni në 1 për të kthyer mbivendosjen.',
        'KeepFinders: Ruani modelet e gjetësit (parazgjedhja: 1).',
        'KeepTiming, KeepAlign: Cakto në 1 për të ruajtur modelet e kohës/shtrirjes.',
      ],
    },
    {
      heading: 'Parametrat e përpunimit',
      paragraphs: ['Parapërpunimi i imazhit u aplikua në mbivendosje:'],
      bullets: [
        'ndriçimi: Rregullimi -100 në 100 (parazgjedhja: 0).',
        'kontrasti: Rregullimi -100 në 100 (parazgjedhja: 0).',
        'gama: Vlera 0.1 deri në 3 (e parazgjedhur: 1).',
        'ngopja: Rregullimi -100 në 100 (parazgjedhja: 0).',
        'nuanca: Rrotullimi i nuancës në gradë.',
        'blur: Mjegullimi në piksel.',
        'mpreh: Sasia e mprehjes 0-100.',
        'posterize: Posterize nivelet.',
        'pragu: Pragu binar 0-255.',
        'buzë: Zbulimi i skajeve - i fikur, i sobel, i zgjuar.',
        'invert: Vendoseni në 1 për të përmbysur ngjyrat.',
      ],
    },
    {
      heading: 'Parametrat e filigranit',
      paragraphs: ['Shtoni filigranë në kodet QR të krijuara:'],
      bullets: [
        'wmEn: Vendoseni në 1 për të aktivizuar filigranin.',
        'wmKind: Lloji i filigranit - tekst, imazh, model.',
        'wmText: Teksti i filigranit (i koduar me URL).',
        'wmImg: URL për imazhin e filigranit.',
        'wmPos: Pozicioni - në qendër, qoshet, skajet, prapa, zona_qetë.',
        'wmOpacity: Opacity 0-100 (parazgjedhja: 50).',
        'wmBlend: Modaliteti i përzierjes - normale, shumëzoj, ekran, mbivendosje.',
      ],
    },
    {
      heading: 'Parametrat e animacionit',
      paragraphs: ['Për dalje të animuar GIF (kërkon format=gif):'],
      bullets: [
        'animPattern: Modeli i animacionit - asnjë, puls, valë, skanim, shimmer, drift, cikli_ngjyrë.',
        'animFrames: Numri i kornizave 1-60 (parazgjedhja: 24).',
        'animSpeed: Vonesa e kuadrit në milisekonda 10-1000 (parazgjedhja: 100).',
        'animSeed: Farë e rastësishme për animacion.',
        'lehtësim: Lehtësim i animacionit - linear, ease_in, ease_out, ease_in_out, bounce.',
      ],
    },
    {
      heading: 'Parametrat e daljes',
      paragraphs: ['Opsionet e formatit të daljes:'],
      bullets: [
        'cilësia: Cilësia WebP 0-1 (e parazgjedhur: 0.9).',
        'webpQ: Cilësia WebP 0-100 (parazgjedhja: 90).',
        'gifNgjyrat: madhësia e paletës GIF 2-256 (parazgjedhja: 256).',
        'dpi: DPI dalëse për PNG (e parazgjedhur: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: fushat e meta të dhënave PNG.',
      ],
    },
    {
      heading: 'Shembull i përdorimit',
      paragraphs: [
        'Kodi bazë QR:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Kodi QR i stiluar me ngjyra të personalizuara:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'Kodi QR me imazhin e mbivendosjes:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF i animuar:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Shikoni shembuj QR', type: 'example' }],
    },
    {
      heading: 'Përfshirja e kodeve QR',
      paragraphs: [
        'Në modalitetin Professional, veçoria Share gjeneron HTML dhe URL të integruara. Ja se si funksionon embedding:',
      ],
      bullets: [
        'Ndani lidhjen: Krijon një URL në aplikacionin ANQR me të gjitha cilësimet tuaja të koduara si parametra URL. Marrësit mund të shikojnë dhe modifikojnë kodin QR.',
        'Embed Image: Gjeneron një etiketë <img> që tregon API-në e serverit. Kodi QR jepet nga ana e serverit dhe shërbehet si imazh.',
        'Embed Markdown: Krijon sintaksën e imazhit Markdown për dokumentacionin dhe skedarët README.',
        'URL e drejtpërdrejtë e API-së: URL-ja e papërpunuar e API-së për përdorim në aplikacione, skripte ose integrime të tjera.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Shembull HTML',
      paragraphs: [
        'Për të futur një kod QR në faqen tuaj të internetit:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        'Për madhësinë e përgjegjshme:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />',
        'Serveri ruan përgjigjet me kokë të gjatë të cache-it, kështu që kërkesat e përsëritura për të njëjtën URL janë të shpejta.',
      ],
    },
    {
      heading: 'Ndani formatin e URL-së',
      paragraphs: [
        'Kur klikoni Ndani në modalitetin profesional, ANQR kodon cilësimet tuaja aktuale në parametrat e URL-së. Formati është:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Këta parametra pasqyrojnë parametrat API, kështu që ju mund të konvertoni një URL të përbashkët në një URL API duke ndryshuar shtegun bazë nga / në /api/qr dhe duke rregulluar parametrat w/h sipas nevojës.',
        'Shënim: Imazhet e mbivendosjes të ngarkuara nga skedarët lokalë nuk mund të ndahen me URL - vetëm mbivendosjet e bazuara në URL (parametri img) funksionojnë në lidhjet e përbashkëta dhe thirrjet API.',
      ],
    },
    {
      heading: 'Kufijtë e normës dhe përdorimi',
      paragraphs: [
        "API është falas për t'u përdorur për vëllime të arsyeshme. Për përdorim me volum të lartë ose aplikacione komerciale që kërkojnë kohë të garantuar, ju lutemi na kontaktoni.",
        'Përgjigjet e API përfshijnë titujt agresivë të memorizimit. Për performancën më të mirë, përgjigjet në cache në fundin tuaj ose përdorni të njëjtën URL vazhdimisht për kode identike QR.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Praktikat më të mira',
      paragraphs: ['Ndiqni këto udhëzime për kode QR të besueshme:'],
      bullets: [
        'Gjithmonë provoni kodet tuaja QR me aplikacione të shumta skaner përpara printimit.',
        'Përdorni korrigjimin e gabimit H (i lartë) kur shtoni mbivendosje.',
        'Mbani të paktën 4 module të zonës së qetë (diferencë).',
        'Siguroni kontrast të lartë midis planit të parë dhe sfondit.',
        'Për printim, përdorni të paktën 300 DPI dhe provoni në madhësinë aktuale të printimit.',
        'Aktivizo Ruajtjen e Modeleve të Gjetësit kur përdorni mbivendosje.',
        'Filloni me intensitet më të ulët të mbivendosjes dhe rriteni gradualisht.',
        'Për përdorim të jashtëm, merrni parasysh madhësitë më të mëdha të moduleve dhe korrigjimin më të lartë të gabimeve.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Shfletoni artikujt Mësoni', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Shikoni shembuj QR', type: 'example' },
      ],
    },
    {
      heading: 'Zgjidhja e problemeve',
      paragraphs: ['Problemet dhe zgjidhjet e zakonshme:'],
      bullets: [
        'QR nuk do të skanojë: zvogëloni intensitetin e mbivendosjes, rrisni korrigjimin e gabimeve, kontrolloni kontrastin.',
        'Kodi shumë i madh: Zvogëlo gjatësinë e përmbajtjes, përdor shkurtuesin e URL-së, versionin më të ulët.',
        'Prodhimi i turbullt: Rritni madhësinë e modulit, përdorni PNG në vend të formateve të ngjeshur.',
        'Ngjyrat duken të gabuara: Kontrolloni kontrastin e ngjyrave, provoni modalitetin e mbivendosjes në shkallë gri.',
        'GIF nuk animohet: Sigurohuni që përdorni daljen e formatit GIF, kontrolloni numrin e kornizave.',
        'Mbivendosja e imazhit nuk ngarkohet: Kontrolloni lejet CORS në imazhet në distancë.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Shih udhëzuesit dhe shembujt përkatës',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Shkurtoret e tastierës',
      paragraphs: [
        'ANQR mbështet shkurtoret standarde të tastierës. Përdorni Ctrl/Cmd+S për të aktivizuar eksportin (kur fokusohet në pamjen paraprake).',
      ],
    },
    {
      heading: 'Ndarje & Embedding',
      paragraphs: [
        'Në modalitetin profesional, klikoni butonin Share për të kopjuar një URL me cilësimet tuaja aktuale. Marrësit mund ta hapin këtë URL për të parë konfigurimin tuaj të saktë. Shënim: Imazhet e mbivendosjes nga skedarët lokalë nuk mund të ndahen përmes URL-së.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Provoni këtë konfigurim direkt në gjeneratorin ANQR.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Shfletoni artikujt Mësoni', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Shikoni shembuj QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Shikoni shembuj QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Hapni gjeneratorin', type: 'generator' },
  ],
};

export default guide;
