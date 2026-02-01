import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Mësoni me ANQR',
  description: 'Udhëzues praktik, të parë të biznesit për kthimin e kodeve QR në asete reale marketingu - jo vetëm katrorë funksionalë. Mësoni se si të përmirësoni kodet e vjetra të pikave të shitjes, të krijoni sinjalistikë QR në përputhje me pagesën, të përgatitni eksporte të gatshme për printim, të përdorni animacionin në mënyrë të sigurt në ekranet dixhitale dhe të ndani konfigurimet e kyçura në ekipet shumëgjuhëshe duke përdorur lidhjet ANQR ("ankor").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Hapni gjeneratorin', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Shikoni shembuj QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Hapni udhëzuesin e plotë të përdoruesit', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Përmirësimi i fushatave ekzistuese QR',
      paragraphs: ['Shumica e bizneseve kanë kode QR të shpërndara nëpër operacionet e tyre - në menu, stendat e sportelit, paketimet dhe materialet promovuese. Shumë prej këtyre kodeve u krijuan vite më parë me gjeneratorë bazë, duke rezultuar në kuadrate të përgjithshme bardh e zi që nuk arrijnë të frymëzojnë besim ose të përputhen me identitetin tuaj të markës. Ky udhëzues gjithëpërfshirës ju udhëzon në një qasje sistematike për auditimin, përmirësimin dhe optimizimin e infrastrukturës suaj ekzistuese QR pa ndërprerë udhëtimet e klientëve që keni krijuar tashmë.', 'Avantazhi strategjik i përmirësimit në vend të zëvendësimit të kodeve QR qëndron në ruajtjen e vazhdimësisë. Klientët tuaj tashmë kanë mësuar të presin destinacione të caktuara kur skanojnë kodet tuaja. Duke i mbajtur URL-të e koduara identike, ndërkohë që përmirësoni në mënyrë dramatike prezantimin vizual, besueshmërinë e skanimit dhe shtrirjen e markës, ju krijoni një tranzicion të qetë që rrit besimin pa kërkuar ndonjë ndryshim në infrastrukturën tuaj dixhitale ose gjurmimin e analitikës.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Një krahasim krah për krah që tregon një kod QR të zbehur, gjenerik pranë një versioni modern të markës që kodon të njëjtën URL',
          caption: 'Para dhe pas: E njëjta URL e destinacionit e transformuar nga një kod gjenerik i datës në një aktiv të markës profesionale',
        },
      ],
    },
    {
      heading: 'Pse kodet QR të trashëgimisë nuk funksionojnë',
      paragraphs: ['Kodet QR të krijuara gjatë fazës së miratimit të hershëm - veçanërisht gjatë 2020-2021 kur bizneset nxituan të zbatojnë zgjidhje pa kontakt - shpesh vuajnë nga disa çështje kritike. Cilësimet e ulëta të korrigjimit të gabimeve i bëjnë ato të brishta kur printohen në sipërfaqe me teksturë ose kur shikohen nën ndriçim sfidues. Zonat e pamjaftueshme të qetësisë shkaktojnë dështime të skanimit kur kodet vendosen pranë elementëve të tjerë vizualë. Stili i përgjithshëm nuk arrin të komunikojë legjitimitetin e markës, duke çuar në hezitim dhe ulje të shkallës së skanimit.', 'Përtej kufizimeve teknike, kodet e vjetra shpesh përfaqësojnë mundësi të humbura të markës. Çdo kod QR është një pikë kontakti me klientin tuaj - një moment ku ata janë të angazhuar në mënyrë aktive dhe të gatshëm për të ndërmarrë veprime. Një kod i stiluar profesionalisht që përputhet me ngjyrat e markës suaj, përfshin kufijtë e duhur të sigurisë dhe përmban elemente opsionale të markës, e transformon këtë mjet në një aktiv marketingu që përforcon identitetin tuaj në çdo ndërveprim.'],
    },
    {
      heading: 'Kryerja e një auditimi të kodit QR',
      paragraphs: ['Filloni projektin tuaj të përmirësimit duke krijuar një inventar gjithëpërfshirës të çdo kodi QR të vendosur aktualisht në biznesin tuaj. Dokumentoni vendndodhjen fizike, destinacionin e koduar, gjendjen aktuale të materialit të printuar dhe mjedisin tipik të skanimit, duke përfshirë kushtet e ndriçimit dhe këndet e shikimit. Testoni çdo kod me pajisje të shumta - telefonat inteligjentë të vjetër dhe pajisjet buxhetore shpesh zbulojnë probleme të besueshmërisë që maskojnë telefonat premium.', 'Kushtojini vëmendje të veçantë kodeve në vendet me aksione të larta: pikat e pagesës, zonat e regjistrimit dhe ekranet promocionale ku dështimi i skanimit ndikon drejtpërdrejt në të ardhurat ose përvojën e klientit. Këto duhet të kenë prioritet për përmirësim të menjëhershëm. Vini re gjithashtu kodet që shfaqen në përmbajtje fotografike ose video, pasi këto do të kërkojnë koordinim me ekipin tuaj të marketingut për të përditësuar asetet vizuale.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Një ndërfaqe me listë kontrolli që tregon kategoritë e auditimit QR: vendndodhjen, gjendjen, besueshmërinë e skanimit dhe vlerësimin e përparësisë',
          caption: 'Modeli sistematik i auditimit QR për dokumentimin dhe prioritizimin e kandidatëve tuaj për përmirësim',
        },
      ],
    },
    {
      heading: 'Strategjia e Përmirësimit të Sigurt',
      paragraphs: ['Rregulli kryesor i përmirësimeve QR është ruajtja e destinacionit. Ekstraktoni URL-në e saktë nga çdo kod ekzistues dhe kodoni atë në mënyrë identike në versionin tuaj të ri. Kjo siguron që të gjitha analitika ekzistuese, logjika e ridrejtimit dhe pritshmëritë e klientëve të mbeten të paprekura. Nëse keni nevojë për fleksibilitet të destinacionit për përditësimet e ardhshme, kjo është koha ideale për të prezantuar një URL të shkurtër të markës ose shërbim ridrejtues - por zbatojeni këtë si një projekt të veçantë për të shmangur ndryshimet e ndërlikuara.', 'Për përmirësimin vizual, aplikoni përmirësime në shtresa: së pari siguroni besueshmërinë teknike (korrigjimin e duhur të gabimit dhe zonën e qetë), më pas shtoni stilin e markës (ngjyrat, format e moduleve) dhe në fund merrni parasysh përmirësimet opsionale (mbivendosjet qendrore, kornizat). Çdo shtresë duhet të vërtetohet përmes testimit përpara se të vazhdohet. Modaliteti i sigurisë i ANQR ndihmon në zbatimin e këtyre prioriteteve duke paralajmëruar kur zgjedhjet e stilit mund të rrezikojnë skanueshmërinë.'],
    },
    {
      heading: 'Shtimi i identitetit të markës pa kompromentuar besueshmërinë',
      paragraphs: ['Markimi efektiv QR balancon ndikimin vizual ndaj besueshmërisë së skanimit. Filloni me ngjyrën: zëvendësoni planin e parë të zi të paracaktuar me ngjyrën e markës tuaj kryesore, duke siguruar kontrast të mjaftueshëm në sfond. Për shumicën e markave, ngjyrat e errëta në sfonde të lehta funksionojnë më së miri. Shmangni kombinimet me kontrast të ulët, gradientët që reduktojnë qartësinë e skajeve ose ngjyrat që duken të ngjashme në kushte të zakonshme ndriçimi.', 'Përshtatja e formës së modulit ofron një tjetër mundësi markimi me ndikim minimal në besueshmëri. Modulet e rrumbullakosura krijojnë një pamje më të butë dhe më të arritshme duke ruajtur skanueshmëri të shkëlqyer. Modulet e stilit me pika funksionojnë mirë për markat moderne, të teknologjisë. Modulet e lidhura i përshtaten identiteteve industriale ose korporative. Çfarëdo stili që zgjidhni, ruani qëndrueshmërinë në të gjitha vendosjet tuaja QR për njohjen e menjëhershme të markës.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Një diagram me rrota me ngjyra që tregon kombinime optimale të ngjyrave QR me tregues të raportit të kontrastit',
          caption: 'Udhëzues për përzgjedhjen e ngjyrave të markës që tregon kombinime me kontrast të lartë që ruajnë besueshmërinë e skanimit',
        },
      ],
    },
    {
      heading: 'Protokolli i Testimit dhe Validimit',
      paragraphs: ['Asnjëherë mos vendosni kode QR të përmirësuara pa testime rigoroze. Printoni një provë fizike në madhësinë e saktë dhe në të njëjtin material si vendosja juaj përfundimtare. Testoni në vendndodhjen aktuale ku do të vendoset kodi, në kohë të ndryshme të ditës për të llogaritur ndryshimet e ndriçimit. Përdorni të paktën tre pajisje të ndryshme: një telefon aktual kryesor, një pajisje të rangut të mesëm dhe një smartphone më të vjetër ose me kosto të ulët.', 'Regjistroni kohët e skanimit dhe normat e suksesit për çdo test. Një kod i optimizuar mirë duhet të skanojë brenda 1-2 sekondave në çdo pajisje mjaft moderne. Nëse po shihni vonesa ose dështime të vazhdueshme, zvogëloni intensitetin e stilimit - hiqni ose zvogëloni mbivendosjet, rrisni madhësinë e zonës së qetë ose kaloni në një nivel më të lartë korrigjimi të gabimeve. Besueshmëria ka gjithmonë përparësi mbi sofistikimin vizual.'],
    },
    {
      heading: 'Mbyllja e konfigurimit tuaj për konsistencë',
      paragraphs: ['Pasi të keni vërtetuar një konfigurim optimal, ruajeni atë duke përdorur lidhjet e ndashme të ANQR. Kjo krijon një regjistrim të përhershëm të çdo cilësimi të përdorur për të gjeneruar kodin tuaj të miratuar - ngjyrat, stili i modulit, korrigjimi i gabimeve, madhësia dhe çdo mbivendosje. Ndani këtë lidhje me ekipin tuaj të dizajnit, shitësit e printimeve dhe këdo që mund të ketë nevojë të riprodhojë kodin në të ardhmen.', 'Ky bllokim konfigurimi parandalon degradimin gradual që dëmton shumë vendosje QR. Pa të, anëtarët e stafit rikrijojnë kodet nga pamjet e ekranit, dizajnerët rindërtojnë cilësimet nga memoria dhe shitësit e printimeve bëjnë rregullime \'të dobishme\'. Çdo variant paraqet probleme të mundshme. Me një lidhje konfigurimi të kyçur, çdo riprodhim është identik me origjinalin tuaj të testuar dhe të miratuar.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Një diagram që tregon zhvendosjen e konfigurimit: pamjet e ekranit që çojnë në argëtime që çojnë në variante, kundrejt një lidhjeje të vetme burimi të së vërtetës',
          caption: 'Parandaloni zhvendosjen e konfigurimit duke krijuar një burim të vetëm autoritar për të gjitha riprodhimet QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Shikoni shembuj QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Kodet QR për pagesat me pakicë',
      paragraphs: ['Kodet QR të pagesës funksionojnë në mjedisin më kërkues të shitjes me pakicë: në momentin e transaksionit. Klientët janë gati të paguajnë, shpesh me një radhë që krijohet pas tyre dhe çdo sekondë vonese krijon fërkime. Megjithatë, ky moment i presionit të lartë është gjithashtu pasuria e paluajtshme kryesore për përforcimin e markës. Ky udhëzues shpjegon se si të krijoni kode QR të pagesave që skanohen në çast në aplikacionet bankare, ndërkohë që ende paraqesin një pamje profesionale dhe të markës që ndërton besimin e klientit.', 'Parimi themelor për kodet QR të pagesës është besueshmëria mbi estetikën. Një kod i dizajnuar bukur që dështon të skanohet në aplikacionin bankar të një klienti do t\'ju kushtojë shumë më tepër në transaksionet e braktisura dhe klientët e frustruar sesa një dizajn konservator ndonjëherë. Filloni me pajtueshmërinë, shtoni besueshmërinë, pastaj vendosni me kujdes markimin vetëm aty ku nuk cenon funksionin parësor.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Një ekran sportel me pakicë që tregon një kod QR pagese që skanohet nga një smartphone me një aplikacion bankar',
          caption: 'Kodet QR të pagesave duhet të funksionojnë menjëherë me aplikacionet bankare dhe të portofolit në kushtet reale të banakut',
        },
      ],
    },
    {
      heading: 'Kuptimi i standardeve QR të Pagesave',
      paragraphs: ['Kodet QR të pagesës zakonisht ndjekin standardet rajonale që diktojnë formatin e ngarkesës. Në Singapor, PayNow QR përdor formatim specifik. Në Indi, kodet UPI ndjekin standardet e lidhjeve të thella BharatQR ose UPI. Pagesat evropiane SEPA përdorin kode QR EPC. Çdo standard ekziston për të siguruar që aplikacionet bankare mund të njohin dhe përpunojnë menjëherë informacionin e pagesës. Devijimi nga këto standarde - qoftë edhe pak - mund të shkaktojë që aplikacionet e pagesave të refuzojnë kodet që skanerët e përgjithshëm të kamerës lexojnë pa problem.', 'ANQR përfshin shabllone për standardet kryesore të pagesave që formatojnë automatikisht detajet e tregtarit tuaj në ngarkesa të pajtueshme. Përdorni gjithmonë këto shabllone në vend që të ndërtoni manualisht vargjet e pagesave, pasi edhe gabimet e vogla të formatimit mund të shkaktojnë dështime të transaksionit. Nëse standardi i pagesës i rajonit tuaj nuk disponohet si shabllon, konsultohuni me dokumentacionin teknik të ofruesit tuaj të pagesave për kërkesat e sakta të formatimit.'],
    },
    {
      heading: 'Madhësia dhe vendosja për ekranet e kundërta',
      paragraphs: ['Kodet QR kundër-top përballen me sfida fizike unike. Klientët skanojnë në gjatësinë e krahut, shpesh në një kënd, ndonjëherë përmes mbrojtëseve të teshtitjes ose vitrinëve. Ndriçimi i sipërm krijon pika verbuese. Kodi konkurron me rrëmujën e tjera të kundërta për vëmendje dhe pamje të qarta. Madhësia QR e pagesës suaj është bujare - një minimum prej 4-5 cm rekomandohet për shumicën e aplikacioneve të sportelit, duke u rritur nëse kodi qëndron pas xhamit ose në një zonë me ndriçim të dobët.', 'Pozicioni ka rëndësi po aq sa edhe madhësia. Vendosni kodin ku klientët mund ta mbajnë rehat telefonin e tyre pa bllokuar radhën ose pa arritur në mënyrë të sikletshme. Kthejeni ekranin drejt klientit në vend që ta vendosni atë të sheshtë. Nëse është e mundur, përdorni petëzimin mat ose materialet e ekranit jo-reflektues për të minimizuar shkëlqimin nga ndriçimi i sipërm. Testoni vendosjen përfundimtare në kohë të ndryshme të ditës për të kapur problemet e ndriçimit.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Një diagram që tregon lartësitë dhe këndet optimale të vendosjes së QR për konfigurime të ndryshme të numëratorit',
          caption: 'Udhëzues për vendosjen e sportelit: lartësitë, këndet dhe distancat optimale për skanim të besueshëm të pagesave',
        },
      ],
    },
    {
      heading: 'Marka konservative për kodet e pagesave',
      paragraphs: ['Aplikacionet e pagesave janë më pak false se skanerët e përgjithshëm të kamerës. Shumë aplikacione bankare përdorin algoritme më të vjetra, më të thjeshta të leximit QR të optimizuar për shpejtësi dhe jo për fleksibilitet. Kjo do të thotë se stili që funksionon në mënyrë të përsosur me një kamerë telefoni mund të dështojë me aplikacione specifike pagese. Mbani markën konservative: përdorni ngjyrën e markës tuaj për plan të parë nëse ruan kontrast të fortë, por shmangni gradientët, mbivendosjet e rënda ose elementët dekorativë që mund të ndërhyjnë në njohjen.', 'Nëse dëshironi një logo qendrore ose mbivendosje, mbajeni atë jashtëzakonisht të vogël - jo më shumë se 10-15% të zonës QR - dhe provoni gjerësisht me çdo aplikacion pagese që mund të përdorin klientët tuaj. Shumë biznese zgjedhin të mos mbivendosen në mënyrë specifike në kodet e pagesës, duke e rezervuar atë stil për marketingun e kodeve QR ku kërkesat e besueshmërisë janë më pak të rrepta. Detyra e kodit të pagesës është të përpunojë transaksionet, jo të bëjë përshtypje vizuale.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Një krahasim që tregon nivele të pranueshme dhe të rrezikshme të markës për kodet QR të pagesës',
          caption: 'Spektri i markës së pagesës QR: nga stilimi i sigurt konservator deri te qasjet e rrezikshme dekorative',
        },
      ],
    },
    {
      heading: 'Konsiderata materiale dhe printimi',
      paragraphs: ['Materiali fizik i ekranit ndikon ndjeshëm në besueshmërinë e skanimit. Petëzim me shkëlqim reflekton dritat e sipërme direkt në kamerën e klientit. Materialet me teksturë mund të shtrembërojnë skajet e modulit. Printimi i lirë mund të turbullojë detajet e imëta. Për kodet QR të pagesave, investoni në cilësi: përdorni petëzimin mat ose saten, sigurohuni printim me rezolucion të lartë dhe zëvendësoni ekranet përpara se të shfaqin konsum. Një kod pagese i gërvishtur ose i zbehur ju kushton transaksionet.', 'Merrni parasysh qëndrueshmërinë dhe zëvendësueshmërinë e ekranit. Ekranet e banakut preken, lëvizen, spërkaten dhe herë pas here rrëzohen. Dizajnoni sistemin tuaj të ekranit në mënyrë që futja QR të mund të zëvendësohet lehtësisht pa e zëvendësuar të gjithë stendë. Mbani gati printimet rezervë, të krijuara nga lidhja juaj e konfigurimit e kyçur, në mënyrë që kodet e konsumuara të mund të ndërrohen menjëherë.'],
    },
    {
      heading: 'Testimi me aplikacionet e pagesave reale',
      paragraphs: ['Skanerët gjenerikë të kamerës do të deshifrojnë pothuajse çdo kod QR të formatuar në mënyrë të arsyeshme. Aplikacionet e pagesave janë më të zgjedhura. Përpara se të vendosni ndonjë kod QR pagese, provojeni atë me çdo aplikacion pagese që mund të përdorin klientët tuaj. Në mjediset me shumë pagesa, kjo mund të nënkuptojë testimin me shumë aplikacione bankare, kuleta dixhitale dhe platforma pagese. Dokumentoni cilat aplikacione keni testuar dhe versionet e tyre - aplikacionet e pagesave përditësohen shpesh dhe një përditësim mund të ndryshojë sjelljen e skanimit.', 'Testoni në kushte realiste: ekrani aktual, ndriçimi aktual, distanca aktuale e skanimit. Një kod që skanon menjëherë në tavolinën tuaj mund të jetë i vështirë në banak në orën 17:00 kur dielli i pasdites krijon shkëlqim verbues. Testoni me smartfonin më të vjetër dhe më të lirë që mund të gjeni - nëse funksionon me besueshmëri në një pajisje buxhetore, do të funksionojë në gjithçka. Shënoni çdo kohë skanimi mbi 2 sekonda për hetim dhe ridizajnim të mundshëm.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Një listë kontrolli testimi që tregon aplikacione të ndryshme pagesash, lloje pajisjesh dhe kushte mjedisore për t\'u verifikuar',
          caption: 'Matrica gjithëpërfshirëse e testimit të pagesës QR që mbulon aplikacionet, pajisjet dhe faktorët mjedisorë',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Shikoni shembuj QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Kodet QR të gatshme për printim: SVG kundrejt PNG',
      paragraphs: ['Dallimi midis një kodi QR që skanon në mënyrë të përsosur dhe atij që dështon shpesh varet nga mënyra se si u eksportua dhe trajtohej në rrjedhën e punës së printimit. Ky udhëzues shpjegon dallimet kritike midis formateve vektoriale (SVG) dhe raster (PNG), kur duhet përdorur secili dhe si t\'ua dorëzoni veprat artistike QR projektuesve dhe shitësve të printimeve në mënyra që ruajnë besueshmërinë e skanimit nga kartat e biznesit deri te sinjalistika me madhësi të tabelës.', 'Prodhimi i printimit prezanton variabla që nuk ekzistojnë në ekran: përhapja e bojës, tekstura e substratit, proceset e përfundimit dhe efekti kumulativ i konvertimeve të shumëfishta të skedarëve. Një kod QR që duket i përsosur në softuerin tuaj të dizajnit mund të dalë nga printeri me skaje të zbutura, kontrast të reduktuar ose module të shtrembëruara në mënyrë delikate. Kuptimi i praktikave më të mira të përzgjedhjes së formatit dhe rrjedhës së punës parandalon këto dështime të heshtura.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Një pamje e zmadhuar që krahason modulet vektoriale QR me skaje të qarta kundrejt moduleve raster që tregojnë objekte pikselësh',
          caption: 'Vektori kundrejt rasterit në shkallë printimi: ndryshimi i saktësisë që përcakton besueshmërinë e skanimit',
        },
      ],
    },
    {
      heading: 'Pse Vektori (SVG) është i preferuar për printim',
      paragraphs: ['Skedarët SVG përshkruajnë kodet QR si forma matematikore dhe jo si rrjete pikselësh. Kjo do të thotë se kodi mund të shkallëzohet në çdo madhësi - nga një etiketë 1 cm në një bander 10 metra - pa ndonjë humbje të mprehtësisë së skajit. RIP i printerit (Raster Image Processor) i jep vektorët në rezolucionin origjinal të pajisjes dalëse, duke siguruar që çdo skaj i modulit të jetë aq i qartë sa e lejon hardueri. Nuk ka interpolim, asnjë artefakte anti-aliasing, asnjë turbullim të akumuluar nga operacionet e shumëfishta të ndryshimit të madhësisë.', 'Përtej shkallëzueshmërisë, skedarët SVG janë më të fortë në flukset e punës profesionale. Ata i mbijetojnë udhëtimeve vajtje-ardhje përmes softuerit të projektimit pa degradim. Ato mund të korrigjohen me ngjyra pa rimostrim. Ata futen pastër në skedarët PDF për dalje të gatshme për shtyp. Për çdo aplikacion printimi ku cilësia ka rëndësi, SVG duhet të jetë formati juaj i parazgjedhur i eksportit.'],
    },
    {
      heading: 'Kur PNG është i pranueshëm',
      paragraphs: ['PNG bëhet i nevojshëm kur fluksi juaj i punës ose platforma e destinacionit nuk mbështet formatet vektoriale. Disa platforma ueb, sisteme CMS të sinjalistikës dhe rrjedha e punës së printimit të vjetër kërkojnë imazhe raster. Në këto raste, PNG mund të funksionojë mirë - por vetëm nëse ndiqni rregulla strikte: eksportoni në madhësinë dhe rezolucionin përfundimtar fizik, mos u rritni kurrë pas eksportit dhe shmangni çdo kompresim me humbje ose konvertim të formatit.', 'Rregulli kritik për PNG është të llogaritni dimensionet tuaja të kërkuara të pikselit përpara se të eksportoni. Nëse QR juaj do të printojë me 5 cm dhe printeri juaj funksionon me 300 DPI, ju nevojiten afërsisht 590 piksele. Eksportojeni në këtë madhësi ose më të madhe, pastaj zvogëloni nëse është e nevojshme - asnjëherë lart. Përfshini këtë informacion në emrin e skedarit ose në meta të dhënat tuaja në mënyrë që përdoruesit e ardhshëm të mos keqpërdorin aksidentalisht një eksportim të madhësisë specifike.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Një ndërfaqe llogaritëse që tregon lidhjen midis madhësisë fizike, DPI dhe dimensioneve të kërkuara të pikselit',
          caption: 'Llogaritësi i rezolucionit të printimit: përcaktimi i përmasave minimale të pikselëve për madhësinë e daljes së synuar',
        },
      ],
    },
    {
      heading: 'Shpjegohen opsionet e eksportit ANQR',
      paragraphs: ['ANQR ofron disa mënyra eksporti SVG për t\'iu përshtatur flukseve të ndryshme të punës. Modaliteti True Vector prodhon rezultate të pastra të bazuara në shtigje, ideale për printim dhe mjete dizajni profesional. Kur keni shtuar mbivendosje raster ose efekte të caktuara, ANQR mund t\'i ngulitë këto duke ruajtur modulet vektoriale, ose mund të eksportoni një version plotësisht të rasterizuar në rezolucionin tuaj të specifikuar. Kuptimi i këtyre opsioneve ju ndihmon të zgjidhni eksportin e duhur për çdo rast përdorimi.', 'Për eksportet PNG, ANQR ju lejon të specifikoni dimensionet e sakta dhe përfshin opsione për sfonde transparente. Cilësimi DPI ju ndihmon të llogaritni madhësitë e përshtatshme për printim, megjithëse mbani mend se DPI është meta të dhëna - ajo që ka rëndësi për printimin është të kesh pikselë të mjaftueshëm për madhësinë tënde fizike. Kur keni dyshime, eksportoni më shumë sesa mendoni se ju nevojitet; zvogëlimi ruan cilësinë ndërsa përshkallëzimi e shkatërron atë.'],
    },
    {
      heading: 'Përgatitja e skedarëve për dorëzimin',
      paragraphs: ['Kur ua kaloni veprat artistike QR projektuesve ose shitësve të printimeve, përfshini specifikime të qarta: madhësinë e synuar fizike, kërkesat minimale të zonës së qetë dhe çdo konsideratë të hapësirës së ngjyrave. Për aplikacionet kritike, siguroni si një master SVG ashtu edhe një rezervë PNG me rezolucion të lartë, të etiketuar qartë me përdorimet e tyre të synuara. Përfshi lidhjen tuaj të konfigurimit ANQR në mënyrë që kodi të mund të rigjenerohet nëse është e nevojshme.', 'Parashikoni gabimet e zakonshme në procesin e dorëzimit. Thuaj në mënyrë të qartë se QR nuk duhet të jetë i shkallëzuar, rrotulluar, anuar ose të ketë efekte. Specifikoni se zona e qetë duhet të mbetet e qartë - të mos ndërhyjnë shenja të korrjes, shenja regjistrimi ose elemente dizajni. Nëse QR do të vendoset në një sfond me ngjyra ose fotografik, jepni një version me një formë mbështetëse të errët për të siguruar kontrast adekuat.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Një diagram i paketës së skedarëve që tregon masterin SVG, rezervimin PNG, dokumentin e specifikimeve dhe lidhjen e konfigurimit',
          caption: 'Paketa profesionale e dorëzimit të QR: gjithçka që i nevojitet një stilisti ose shitësi printimi për riprodhim të saktë',
        },
      ],
    },
    {
      heading: 'Verifikimi i provave të printimit',
      paragraphs: ['Asnjëherë mos miratoni një printim pa skanuar një provë fizike. Kërkoni një provë të printuar në nënshtresën aktuale me përfundimin aktual që do të përdoret në prodhim. Skanoni provën në kushte ndriçimi të ngjashme me vendin ku do të shfaqet pjesa përfundimtare. Testoni me pajisje të shumta, duke përfshirë telefonat inteligjentë më të vjetër që mund të kenë probleme me cilësinë margjinale.', 'Nëse prova skanohet ngadalë ose në mënyrë jokonsistente, hetoni përpara se ta miratoni. Problemet e zakonshme përfshijnë kontrast të pamjaftueshëm në nënshtresat me ngjyra, shkelje të zonës së qetë nga shkurtimi, skajet e modulit zbutës të përhapjes së bojës ose petëzimi që krijon shkëlqim verbues. Secila prej tyre mund të adresohet përpara se të kryeni një printim të plotë - por vetëm nëse i kapni në fazën e provës.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Një listë kontrolli për rishikimin e provave me rezultatet e testit të skanimit, matjet e kontrastit dhe nënshkrimet e miratimit',
          caption: 'Rrjedha e punës e verifikimit të provës së printimit: testim sistematik përpara se të angazhoheni për sasitë e prodhimit',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Shikoni shembuj QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Krijimi i kodeve të animuara QR',
      paragraphs: ['Kodet e animuara QR kombinojnë funksionalitetin e kodeve standarde QR me lëvizjet tërheqëse që rrit në mënyrë dramatike normat e angazhimit. Në sinjalistikën dixhitale, mediat sociale dhe ekranet interaktive, animacioni transformon një mjet statik në një element vizual bindës që tërheq syrin dhe fton ndërveprim. Ky udhëzues mbulon parimet, teknikat dhe kufizimet praktike të krijimit të kodeve QR të animuar që skanojnë në mënyrë të besueshme ndërkohë që japin ndikim vizual.', 'Sfida themelore e kodeve QR të animuar është balancimi i interesit vizual ndaj besueshmërisë së skanimit. Çdo kornizë duhet të jetë individualisht e skanueshme - një skaner mund të kap kodin në çdo pikë të ciklit të animacionit. Ky kufizim i jep formë çdo vendimi të projektimit: cilët elementë mund të lëvizin, sa mund të ndryshojnë dhe çfarë duhet të mbetet e qëndrueshme gjatë gjithë animacionit.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Një ekran dixhital sinjalistik që tregon një kod QR të animuar që tërheq vëmendjen e shikuesit në një hapësirë publike',
          caption: 'Kodet QR të animuara në sinjalistikën dixhitale: lëvizje që tërheq vëmendjen dhe inkurajon skanimin',
        },
      ],
    },
    {
      heading: 'Si ndikon animacioni në skanim',
      paragraphs: ['Skanerët QR funksionojnë duke kapur një kornizë të vetme dhe duke analizuar modelin e moduleve të lehta dhe të errëta. Që një kod i animuar të funksionojë, çdo kornizë duhet të përmbajë modelin e plotë dhe të vlefshëm QR. Kjo përjashton animacionet që modifikojnë strukturën e kodit, shpërndajnë modulet ose ndryshojnë ndjeshëm modelin e kontrastit. Modulet që mbartin të dhënat - modeli në dukje i rastësishëm në qendër - duhet të mbeten vizualisht të qëndrueshëm gjatë gjithë kohës.', 'Qasjet e sigurta të animacionit modifikojnë elementët që nuk përmbajnë të dhëna: sfondet, ngjyrat, kornizat dekorative dhe elementët e mbivendosjes. Komponentët strukturorë - modelet e gjetësit (sheshet e mëdha të qosheve), modelet e kohës (vijat e alternuara) dhe modelet e shtrirjes (sheshet më të vogla në kode më të mëdha) - duhet të ruajnë pozicionet dhe përmasat e tyre. Puna brenda këtyre kufizimeve ende lejon për animacione çuditërisht dinamike dhe tërheqëse.'],
    },
    {
      heading: 'Teknikat e animacionit që funksionojnë',
      paragraphs: ['Cikli i ngjyrave animon ngjyrat e planit dhe sfondit përmes një palete duke ruajtur kontrast të mjaftueshëm në çdo hap. Kjo krijon një efekt të gjallë dhe tërheqës me rrezik minimal të skanimit - për sa kohë që kontrasti nuk bie kurrë nën nivelet e lexueshme. Paracaktimet e ciklit të ngjyrave të ANQR janë krijuar për të ruajtur skanueshmërinë gjatë gjithë ciklit.', 'Mbivendosjet e animuara vendosin imazhe lëvizëse pas një modeli QR gjysmë transparent. Kodi mbetet i qëndrueshëm ndërkohë që sfondi animohet - ndoshta një video në lidhje, elementë të animuar të markës ose grafika abstrakte të lëvizjes. Kjo teknikë kërkon menaxhim të kujdesshëm të intensitetit për të parandaluar që sfondi të mbingarkojë modelin QR, por krijon rezultatet më të mahnitshme vizualisht.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Një diagram që tregon strukturën me shtresa të një QR të animuar: shtresa e qëndrueshme e kodit mbi shtresën e sfondit të animuar',
          caption: 'Parimi i shtresimit të animacionit: modeli QR mbetet konstant ndërsa elementët e sfondit animojnë poshtë',
        },
      ],
    },
    {
      heading: 'Konfigurimi i parametrave të animacionit',
      paragraphs: ['Shpejtësia e kuadrove ndikon si në butësinë vizuale ashtu edhe në madhësinë e skedarit. Për shumicën e aplikacioneve, 10-15 korniza për sekondë siguron lëvizje me pamje të qetë pa madhësi të tepërta skedarësh. Shkalla më e lartë e kuadrove ofrojnë kthime vizuale të pakësuara ndërsa rrit ndjeshëm madhësinë e skedarëve. Merrni parasysh kontekstin tuaj të dorëzimit - një shenjë e madhe dixhitale mund të trajtojë skedarë më të mëdhenj sesa një vendosje reklame celulare.', 'Sjellja e lakut përcakton se si cikle animacioni. Rrathët e qetë krijojnë lëvizje të vazhdueshme ideale për sinjalistikën dhe ekranet e ambientit. Llojet e ping-pongut (përpara-pastaj mbrapsht) funksionojnë mirë për animacione të thjeshta. Për impulse që tërheqin vëmendjen, merrni parasysh animacionet me mbajtje - periudha qetësie të shoqëruara nga lëvizjet që tërheqin syrin pa lodhje të vazhdueshme në lëvizje.'],
    },
    {
      heading: 'Krijimi i mbivendosjeve të animuara',
      paragraphs: ['Kur përdorni imazhe të animuara (GIF, WebP të animuar ose video) si mbivendosje, ANQR nxjerr korniza dhe i kombinon ato me kodin tuaj QR. Cilësimi i intensitetit të mbivendosjes kontrollon se sa nga animacioni shfaqet përmes - vlerat më të ulëta i japin përparësi skanimit ndërsa vlerat më të larta favorizojnë ndikimin vizual. Testoni intensitetin tuaj të zgjedhur nëpër korniza të shumta për të siguruar skanueshmëri të qëndrueshme.', 'Cilësia e materialit burimor ndikon ndjeshëm në rezultatet. Përdorni mbivendosje me subjekte të qarta dhe kontrast të mirë. Shmangni animacionet burimore me ndezje të shpejtë ose ndryshime ekstreme të ndriçimit që mund të krijojnë korniza të rastësishme me kontrast të ulët. Shikoni paraprakisht ciklin e plotë të animacionit përpara se të eksportoni për të kapur çdo kornizë problematike që mund të dështojë në skanim.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Një pamje kornizë për kornizë e një mbivendosjeje të animuar që tregon nivelet e kontrastit të ruajtura përgjatë sekuencës',
          caption: 'Analiza e kornizës: verifikimi i skanueshmërisë së qëndrueshme gjatë gjithë ciklit të animacionit',
        },
      ],
    },
    {
      heading: 'Konsideratat e eksportit dhe dorëzimit',
      paragraphs: ['GIF mbetet formati i animuar më i mbështetur gjerësisht, duke luajtur automatikisht në shumicën e konteksteve pa kërkuar mbështetje për luajtësin e videos. Megjithatë, paleta me 256 ngjyra të GIF kufizon besnikërinë e ngjyrave. Për animacionet kritike për ngjyrat, merrni parasysh WebP-në e animuar ku mbështetet, ose kthehuni te formatet e videos për cilësinë më të lartë. Eksportimi GIF i ANQR përfshin opsione të ndryshme për të maksimizuar cilësinë brenda kufizimeve të paletës.', 'Madhësia e skedarit ka rëndësi për dorëzimin. Sistemet e sinjalistikës dixhitale, klientët e postës elektronike dhe platformat sociale shpesh vendosin kufij përmasash. Nëse animacioni juaj i kalon këto kufij, zvogëloni numrin e kuadrove, dimensionet ose thellësinë e ngjyrave. Ndonjëherë ndarja e një animacioni kompleks në një lak më të shkurtër arrin rezultate më të mira sesa kompresimi agresiv që degradon çdo kornizë.'],
    },
    {
      heading: 'Testimi i kodeve të animuara QR',
      paragraphs: ['Testimi i kodeve të animuara kërkon skanim në pika të shumta në ciklin e animacionit. Mos skanoni vetëm një herë dhe supozoni sukses - skanoni në mënyrë të përsëritur, në momente të ndryshme, për të verifikuar që çdo kornizë është e lexueshme. Kushtojini vëmendje të veçantë kornizave në skajet e ciklit të ngjyrave ose majat e intensitetit të mbivendosjes ku kontrasti mund të jetë më i ulët.', 'Testoni në harduerin aktual të ekranit kur është e mundur. Kalibrimi i ngjyrave të monitorit, këndi i shikimit dhe ndriçimi i ambientit ndikojnë të gjitha në mënyrën se si shfaqet dhe skanohet animacioni. Një animacion i ndritshëm që skanon në mënyrë të përsosur në monitorin tuaj mund të shpërndahet në një ekran të jashtëm ose të bëhet i palexueshëm në kënde të pjerrëta shikimi.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Një matricë testimi që tregon shkallët e suksesit të skanimit nëpër korniza, pajisje dhe kushte të ndryshme të ekranit',
          caption: 'Protokolli i animuar i testimit QR: verifikim sistematik nëpër korniza, pajisje dhe kushte shikimi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Shikoni shembuj QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Praktikat më të mira të sigurisë dhe pajtueshmërisë QR',
      paragraphs: ['Një kod QR i dizajnuar bukur që dështon të skanohet është më keq se i padobishëm - ai frustron klientët, dëmton perceptimin e markës dhe harxhon çdo burim të investuar në krijimin dhe shpërndarjen e tij. Ky udhëzues mbulon faktorët teknikë dhe praktikë që përcaktojnë nëse një kod QR do të skanojë në mënyrë të besueshme dhe si të përdoren veçoritë e sigurisë së ANQR për të kapur problemet e mundshme përpara se ato të arrijnë në prodhim.', 'Besueshmëria e kodit QR nuk është binare. Një kod mund të skanojë në mënyrë të përsosur në telefonat kryesorë, por të dështojë në pajisjet buxhetore. Mund të funksionojë në ndriçim ideal, por të luftojë në restorante të zbehta ose në rrezet e diellit të ndritshme. Kuptimi i faktorëve që ndikojnë në skanueshmërinë ju ndihmon të bëni shkëmbime të informuara midis stilit vizual dhe besueshmërisë në botën reale.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Një spektër besueshmërie që tregon kodet QR që variojnë nga shumë skanues deri te lexueshëm pak',
          caption: 'Spektri i skanimit: nga kodet antiplumb tek stilimi që shtyn kufijtë e besueshmërisë',
        },
      ],
    },
    {
      heading: 'Kuptimi i niveleve të korrigjimit të gabimeve',
      paragraphs: ['Kodet QR përfshijnë tepricë të integruar që i lejon ato të lexohen edhe kur janë pjesërisht të dëmtuara ose të errësuar. Niveli i korrigjimit të gabimit - L (7%), M (15%), Q (25%), ose H (30%) - përcakton se sa nga kodi mund të mungojë gjatë deshifrimit të saktë. Korrigjimi më i lartë i gabimeve krijon kode më të mëdha, por siguron një diferencë sigurie për mbivendosjet, papërsosmëritë e printimit dhe dëmtimet mjedisore.', 'Për kodet me mbivendosje të imazhit, niveli i korrigjimit të gabimit H është thelbësor - mbivendosja errëson fizikisht një pjesë të kodit dhe ju nevojitet ajo tepricë prej 30% për të ruajtur besueshmërinë. Për kode të pastra dhe të pa stiluara në mjedise të kontrolluara, niveli M shpesh mjafton. Niveli L duhet të rezervohet për situatat kur madhësia e kodit është e kufizuar në mënyrë kritike dhe ju mund të garantoni kushte të paprekura.'],
    },
    {
      heading: 'Zona kritike e qetë',
      paragraphs: ['Zona e qetë është diferenca e zbrazët që rrethon çdo kod QR. Skanerët përdorin këtë kufi për të identifikuar se ku fillon dhe ku mbaron kodi. Standardi ISO specifikon një zonë minimale të qetë prej katër modulesh (katër herë gjerësia e katrorit më të vogël në kod). Shkelja e kësaj hapësire - me elementë të projektimit, skajet e zbukurimit ose përmbajtjen ngjitur - është një nga shkaqet më të zakonshme të dështimeve të skanimit.', 'Zbatimi i zonës së qetë të ANQR ndihmon në ruajtjen e kësaj hapësire kritike, por duhet gjithashtu të siguroheni që ajo të ruhet në planet tuaja përfundimtare. Kur dorëzoni vepra arti QR, specifikoni në mënyrë eksplicite kërkesat e zonës së qetë. Kur vendosni kode në paraqitje, verifikoni që asnjë element të mos ndërhyjë në këtë hapësirë. Disa milimetra hapësirë ​​​​të pastër mund të nënkuptojnë ndryshimin midis skanimit të besueshëm dhe klientëve të frustruar.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Një diagram që tregon ndarjen e saktë të zonës së qetë kundrejt shkeljeve të zakonshme që shkaktojnë dështime të skanimit',
          caption: 'Kërkesat e zonës së qetë: kufiri i padukshëm që përcakton suksesin e skanimit',
        },
      ],
    },
    {
      heading: 'Kontrasti dhe siguria e ngjyrave',
      paragraphs: ['Skanerët QR zbulojnë modelin e moduleve të lehta dhe të errëta. Çdo stil që zvogëlon këtë kontrast - plane të përparme të lehta, sfonde të errëta, efekte gradient ose mbivendosje me tejdukshmëri të ulët - e bën kodin më të vështirë për t\'u lexuar. ANQR llogarit raportet e kontrastit dhe paralajmëron kur zgjedhjet tuaja të ngjyrave i afrohen niveleve të rrezikshme, por arbitri përfundimtar është gjithmonë testimi i botës reale.', 'Perceptimi i ngjyrave ndryshon me kushtet e ndriçimit. Një kombinim ngjyrash që shfaqet me kontrast të lartë në monitorin tuaj mund të bëhet i vështirë për t\'u dalluar nën ndriçimin e ngrohtë inkandeshentë ose tubat fluoreshente të ftohtë. Nëse kodi juaj do të vendoset në kushte të ndryshme ndriçimi, provoni nën burime të shumta drite dhe merrni parasysh raportet më konservatore të kontrastit si një diferencë sigurie.'],
    },
    {
      heading: 'Madhësia e modulit dhe distanca e shikimit',
      paragraphs: ['Madhësia fizike e moduleve individuale përcakton distancën maksimale nga e cila mund të skanohet një kod. Modulet më të vogla nënkuptojnë kode më të vogla, por kërkojnë distanca më të afërta skanimi. Rregulli i përgjithshëm është që çdo modul duhet të jetë së paku 0,5 mm në distancën e synuar të skanimit, duke u shkallëzuar proporcionalisht për distanca më të mëdha. Një kod në një billboard ka nevojë për module shumë më të mëdha se një kod në një kartëvizitë.', 'Kur llogaritni madhësinë e modulit, merrni parasysh skenarin më të keq: klienti me një telefon të vjetër, me ndriçim të papërsosur, duke skanuar në distancën maksimale të mundshme. Dizajni për këtë përdorues dhe të gjithë të tjerët do të kenë një përvojë edhe më të mirë. Rekomandimet e madhësisë së ANQR-së ndikojnë në këto variabla të botës reale për të sugjeruar dimensione të përshtatshme për përdorimin tuaj të synuar.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Një grafik që lidhet me madhësinë e modulit, dimensionet e printimit dhe distancën maksimale efektive të skanimit',
          caption: 'Udhëzuesi i distancës së skanimit: përputhja e madhësisë së modulit me kërkesat tuaja të vendosjes',
        },
      ],
    },
    {
      heading: 'Përdorimi i modalitetit të sigurisë ANQR',
      paragraphs: ['Modaliteti i sigurisë i ANQR ofron reagime në kohë reale mbi besueshmërinë e skanimit. Ai monitoron raportet e kontrastit, pajtueshmërinë e zonës së qetë, intensitetin e mbivendosjes dhe faktorë të tjerë që ndikojnë në skanueshmërinë. Kur ndonjë parametër i afrohet niveleve të rrezikshme, do të shihni paralajmërime me udhëzime specifike se si të përmirësoni besueshmërinë. Për vendosjet profesionale ku dështimi është i kushtueshëm, mbajeni Safety Mode aktiv gjatë gjithë procesit të projektimit.', 'Modaliteti i sigurisë përfshin gjithashtu një veçori verifikimi të skanimit që përpiqet të deshifrojë kodin tuaj të krijuar dhe raporton suksesin ose dështimin. Ndërsa ky verifikim përmes aplikacionit nuk mund të përsërisë çdo kusht të botës reale, ai kap shumë probleme të zakonshme përpara se të investoni në printim ose shpërndarje. Trajtojeni verifikimin e suksesshëm si një bar minimal, jo një garanci - testimi në botën reale mbetet thelbësor.'],
    },
    {
      heading: 'Protokollet e testimit në botën reale',
      paragraphs: ['Asnjë sasi e verifikimit të softuerit nuk zëvendëson testimin fizik. Shtypni kodin tuaj në madhësinë e synuar në materialin përfaqësues. Provoni atë në mjedisin aktual të vendosjes me kushte ndriçimi që përputhen me përdorimin real. Skanoni me pajisje të shumta - jo vetëm telefonin tuaj kryesor, por pajisjet buxhetore Android, iPhone të vjetër dhe çdo pajisje specifike që përdor zakonisht audienca juaj.', 'Dokumentoni testimin tuaj në mënyrë sistematike. Regjistroni cilat pajisje janë testuar, në çfarë kushtesh, me çfarë rezultate. Nëse po vendosni kode në shkallë, vendosni kriteret e pranimit: ndoshta 95% normë suksesi në grupin e testimit të pajisjes tuaj ose skanime të suksesshme brenda 2 sekondave në të gjitha pajisjet e testuara. Këto standarde ndihmojnë në bërjen objektive të vendimeve për të shkuar/mos shkuar, në vend që të shpresojmë për më të mirën.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Një listë kontrolli gjithëpërfshirëse testimi që mbulon pajisjet, kushtet dhe kriteret e pranimit',
          caption: 'Protokolli i testimit të vendosjes QR: verifikimi sistematik përpara angazhimit të prodhimit',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Hapni gjeneratorin',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Shikoni shembuj QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Shikoni shembuj QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Hapni udhëzuesin e plotë të përdoruesit', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Hapni galerinë', type: 'gallery' },
  ],
};
