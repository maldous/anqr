import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR Erabiltzailearen Gida',
  description: 'QR kodeak sortzeko ANQR erabiltzeko gida osoa.',
  lastUpdated: '2026ko otsailaren 1a',
  breadcrumb: ['Gida'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ireki sorgailua', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Arakatu Ikasi artikuluak', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ikusi QR adibideak', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Hasteko',
      paragraphs: ['ANQR QR kode-sorgailu bat da, bezeroaren lehen ikuspegia duena. Lehenespenez, QR kodeak lokalean sortzen dira zure arakatzailean; ez da konturik behar eta zure datuak pribatuak dira. Kapsulatze profesionalerako, zerbitzariaren aldeko APIa ere erabil dezakezu.', 'Interfazeak hiru interfaze maila ditu: Oinarrizkoa, Aurreratua eta Profesionala. Hautatu zure maila goiburuko fitxak erabiliz. Maila bakoitzak eginbide gehigarriak desblokeatzen ditu interfazea behar duzun horretan zentratuta mantenduz.'],
      bullets: ['Oinarrizkoa: QR kode sinplea sortzea testu arruntarekin/URL edukiarekin eta irudien gainjartzearekin.', 'Aurreratua: QR kodetze aukerak, errendatze estiloak, animazioa, irteera formatuak, eduki mota hedatuak eta gainjarri pertsonalizazioa.', 'Profesionala: Ur-markak, metadatuak, partekatzea, segurtasun-analisia, ordainketa QR kodeak eta enpresa-eginbideak.'],
      links: [{ href: '/?lang=${lang}', label: 'Ireki sorgailua', type: 'generator' }],
    },
    {
      heading: 'Hasiera azkarra',
      paragraphs: ['Zure lehen QR kodea sortzeko:'],
      bullets: ['1. Hautatu eduki mota bat (URLa, testua, WiFi, etab.) Eduki mota goitibeherako.', '2. Sartu zure datuak emandako eremuetan.', '3. Aukeran pertsonalizatu koloreak, estiloak eta gehitu gainjarritako irudi bat.', '4. Sakatu Esportatu zure QR kodea PNG, GIF, WebP edo SVG gisa deskargatzeko.'],
      links: [{ href: '/?lang=${lang}', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Oinarrizko Ezaugarriak',
      paragraphs: ['Oinarrizko mailak interfaze erraztua eskaintzen du QR kodeak sortzeko karga-edukiarekin eta irudien gainjartzeekin. Hau da hasteko modurik errazena.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Eduki motak (oinarrizkoa)',
      paragraphs: ['Testu arrunta: kodetu edozein testu QR kodearen edukiera mugaraino. Mezu labur, kode edo identifikatzaileetarako aproposa.', 'URL: web helbideak kodetu. QR kodeak URLa irekiko du eskaneatzen denean. http:// eta https:// protokoloak onartzen ditu.'],
    },
    {
      heading: 'Irudiaren gainjartzea (oinarrizkoa)',
      paragraphs: ['Kargatu irudi bat (JPG, PNG, GIF, WebP) zure QR kodearekin nahasteko. Oinarrizko gainjartze ezaugarriak hauek dira:'],
      bullets: ['Kargatu fitxategitik: hautatu zure gailuko irudi bat.', 'Load from URL: Sartu irudiaren URL bat (CORS baimendu behar du).', 'Zentroko logotipoa: irudia erdian jartzen du, erroreen zuzenketa oinarri hartuta.', 'Nahasketa: QR ereduarekin irudiaren alfa nahasketa sinplea.', 'Intentsitatea: gainjartzeak QR kodeari zenbaterainoko eragina duen kontrolatzen du (% 0-100).', 'Kolore modua: Kolore osoa, Grisen eskala edo Zuri-beltza.', 'Gorde bilatzaile-ereduak: izkin-ereduak aldatu gabe mantentzen ditu eskaneatze fidagarrirako.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Ezaugarri aurreratuak',
      paragraphs: ['Maila aurreratuak QR kodetze aukerak, errendatze estiloak, animazioa, irteera formatuak, eduki mota hedatuak eta gainjarri pertsonalizazio aurreratua desblokeatzen ditu.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'QR kodeketaren ezarpenak',
      paragraphs: ['Bertsioa: QR kodeak 1-40 bertsioetan datoz, bertsio altuagoekin datu gehiago edukitzen dituzte baina handiagoak dira. Ezarri 0 (Automatikoki) ANQRri zure edukiari egokitzen zaion bertsiorik txikiena aukera dezan.', 'Erroreen zuzenketa: QR kode batek zenbat kalte jasan dezakeen zehazten du eskaneatu daitekeen bitartean.'],
      bullets: ['L (Baxua): % 7ko erroreen zuzenketa - tamaina txikiena, erredundantzia txikiena.', 'M (Ertain): % 15eko erroreen zuzenketa - aukera orekatua.', 'Q (kuartil): % 25eko erroreen zuzenketa - egokia inprimatutako kodeetarako.', 'H (Altua): % 30eko erroreen zuzenketa - aproposa gainjarriz edo baldintza gogorretan dauden kodeetarako.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Zona lasaia (marjina)',
      paragraphs: ['Zona lasaia QR kodearen inguruko zuriunea da. Eskanerrek marjina hori behar dute kodea non hasten den detektatzeko. Estandarrak gutxienez 4 modulu gomendatzen ditu. 4tik behera murrizteak eskaneatzeko arazoak sor ditzake.'],
    },
    {
      heading: 'Moduluaren estiloa',
      paragraphs: ['Moduluak QR kode bat osatzen duten karratu indibidualak dira. ANQR-k bost estilo eskaintzen ditu:'],
      bullets: ['Karratua: QR itxura klasikoa ertz zorrotzekin.', 'Biribilduak: ertz leunak itxura atseginagoa izateko.', 'Puntuak: Estetika modernorako modulu zirkularrak.', 'Diamantea: 45° biratuta dauden karratuak eredu bereizgarri baterako.', 'Konektatuta: moduluak elkartzen dira ondoan daudenean, forma organikoak sortuz.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Finder ereduaren estiloa',
      paragraphs: ['Finder ereduak QR izkinetako hiru karratu handiak dira, eskanerrek kodea orientatzen laguntzen dietenak. Eskuragarri dauden estiloak:'],
      bullets: ['Karratua: ertz karratu estandarrak.', 'Biribilduak: ertz leunak modulu biribilduaren estiloarekin bat datozenak.', 'Zirkulua: puntu estiloko kodeentzako bilatzaile zirkular ereduak.'],
    },
    {
      heading: 'Lerrokatze eta denbora-ereduak',
      paragraphs: ['Lerrokatze-ereduak QR kode handiagoetan agertzen dira (2 bertsioa+) distortsioa zuzentzen laguntzeko. Denbora-ereduak bilatzaile-ereduak lotzen dituzten lerro txandakatuak dira.'],
      bullets: ['Lerrokatze-estiloa: bat-etortzeen bilatzailea, karratua, biribildua edo zirkulua.', 'Denbora-estiloa: Bat-etortze-modulua, Solidoa edo Etengabea.'],
    },
    {
      heading: 'Koloreak',
      paragraphs: ['Lehen planoa: QR moduluen kolorea. Beltza (#000000) estandarra da, baina edozein kolore ilun funtzionatzen du.', 'Atzeko planoa: atzeko planoaren kolorea. Zuria (#ffffff) estandarra da. Ziurtatu nahikoa kontraste lehen planoarekin.', 'Hondo gardena: kendu atzeko planoa guztiz koloretako gainazaletan erabiltzeko. Ziurtatu gainazalak kontraste egokia ematen duela.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Moduluaren tamaina eta hutsunea',
      paragraphs: ['Moduluaren tamaina: modulu bakoitza pixeletan zenbaterainokoa den errendatzen den kontrolatzen du. Balio handiagoek kode handiagoak eta eskaneatzeko errazagoak sortzen dituzte.', 'Moduluaren hutsunea: moduluen arteko espazioa gehitzen du ehuneko gisa. Hutsune txikiek (% 5-15) eskaneagarritasuna hobe dezakete baldintza batzuetan, baina gehiegizko hutsuneek fidagarritasuna murrizten dute.'],
    },
    {
      heading: 'Irteerako ezarpenak',
      paragraphs: ['Formatua: Aukeratu esportazio formatua erabilera kasuaren arabera.'],
      bullets: ['PNG: galerarik gabeko raster formatua, erabilera gehienetarako aproposa. Inprimatu eta digitaletarako onena.', 'WebP: formatu modernoa fitxategi tamaina txikiagoarekin. Web erabiltzeko egokia.', 'GIF: beharrezkoa da animaziozko QR kodeetarako. Gardentasuna onartzen du.', 'SVG: infinitu eskalatzen duen formatu bektoriala. Letra handietarako edo kodea editatu behar duzunean egokiena.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' },
      ],
    },
    {
      heading: 'Irteerako neurriak',
      paragraphs: ['Zabalera/Altuera: Ezarri irteerako tamaina pixeletan. Inprimatzeko, kalkulatu DPIn oinarrituta (adibidez, 300 DPI 1 hazbeteko = 300px). Tamaina handiagoek urrutitik fidagarritasun handiagoz eskaneatu.'],
    },
    {
      heading: 'Animazio ezarpenak (aurreratua)',
      paragraphs: ['Kontrolatu animaziozko QR kodearen portaera:'],
      bullets: ['Abiadura: animazioaren fotograma-tasa milisegundotan.', 'Loop: Etengabeko edo bakarreko animazioa.', 'Errebotea: Ping-pong animazioaren zuzendaritza.', 'Hasi fotograma: Hasteko animazioa fotograma zehatz batetik.', 'Gehienezko fotogramak: mugatu animazioko fotogramak guztira.', 'Frame Step: Saltatu fotogramak animazio azkarrago lortzeko.', 'Interpolazioa: bat ere ez, Crossfade edo Morph fotograma artean.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' },
      ],
    },
    {
      heading: 'Eduki motak (aurreratua)',
      paragraphs: ['Maila aurreratuak karga-formatu gehigarriak desblokeatzen ditu:'],
      bullets: [
        'Telefono-zenbakia (tel:): telefono-esteka deigarria sortzen du.',
        'Posta elektronikoa (mailto:): posta elektronikoko bezeroa irekitzen du aukerako gaiarekin eta gorputzarekin.',
        'SMSa: telefono zenbaki batera aurrez betetako testu-mezua.',
        'vCard: kontaktu-txartel osoa izena, erakundea, telefonoa, posta elektronikoa, helbidearekin.',
        'MeCard: Japonian ezaguna den kontaktu formatu trinkoa.',
        'BizCard: Legatutako bisita-txartel formatua.',
        'Geo kokapena: mapetan irekitzen diren GPS koordenatuak.',
        'WiFi: sareko kredentzialak konexio automatikorako (SSID, pasahitza, segurtasun mota).',
        'Egutegiko Gertaera: iCalendar formatua izenburua, kokapena, data/orduarekin.',
        'Gertaeraren erantzuna: esteka ekitaldia erregistratzeko orrira.',
        'Egutegia Harpidetu: Harpidetu ICS/WebCal jario batera.',
        'Fitxategi/Dokumentuaren URLa: deskarga daitezkeen fitxategietarako esteka zuzena.',
        'Cloud Storage Link: Google Drive, Dropbox, OneDrive, etab. estekak.',
        'Profil soziala: Linkedin, Twitter, Instagram, etab. estekak.',
        'Mezularitzaren esteka: WhatsApp, Telegram, Seinalearen esteka sakonak.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Gainjartze-eginbide aurreratuak',
      paragraphs: ['Gainjartze gaitasun gehigarriak:'],
      bullets: ['Moztu: Gaitu mozketa zure irudiaren eskualde karratu bat hautatzeko.', 'Tonu erdiak: inprimatze-estilo klasikoko puntu-eredua irudiaren distira oinarrituta.', 'Dithered: errore-difusioa dithering zehatza erreproduzitzeko.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Gainjarri nahasketa moduak (aurreratua)',
      paragraphs: ['Maila aurreratuan nahasketa modu gehigarriak:'],
      bullets: ['Azpipixela: modulu bakoitza azpipixeletan banatzen du xehetasun handiagoa lortzeko.', 'Zarata urdina: zarata urdina dithering erabiltzen du artefaktu gabeko ereduetarako.', 'Mosaikoa: fitxan oinarritutako efektua irudiaren egitura zaintzeko.', 'Gap Fill: irudia moduluen arteko hutsuneetan jartzen du.', 'Distira: moduluaren tamaina aldatzen du irudiaren distiraren arabera.', 'Duotonoa: irudia bi koloretan mapatzen du kontraste nabarmena lortzeko.'],
    },
    {
      heading: 'Gainjartzearen intentsitatea',
      paragraphs: ['Gainjartzeak QR kodeari zenbaterainoko eragina duen kontrolatzen du (% 0-100). Balio altuagoek irudiaren xehetasun gehiago erakusten dute, baina eskaneatzeko gaitasuna murriztu dezakete. Hasi % 70 inguru eta egokitu proben arabera.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' }],
    },
    {
      heading: 'Kolore modua',
      paragraphs: ['Gainjarritako irudia nola prozesatzen den:'],
      bullets: ['Kolore osoa: jatorrizko irudiaren koloreak gordetzen ditu.', 'Grisen eskala: zuri-beltzeko tonuetara bihurtzen da.', 'Zuri-beltza: kontraste handiko bihurketa bitarra.'],
    },
    {
      heading: 'Gorde bilatzailearen ereduak',
      paragraphs: ['Gaituta dagoenean, gainjartzeak aldatu gabe mantentzen ditu hiru izkin bilatzailearen ereduak. Biziki gomendagarria eskaneatze fidagarria egiteko.'],
    },
    {
      heading: 'Irudien aurreprozesatzea',
      paragraphs: ['Aplikatu iragazkiak gainjarritako irudiari nahastu aurretik. Doikuntza hauek irudia azken QR kodean nola agertzen den hobetu dezakete.'],
      bullets: ['Distira (-100tik +100era): irudia argitu edo ilundu.', 'Kontrastea (-100tik +100era): areagotu edo txikitu tonu-barrutia.', 'Gamma (0,2tik 3.0ra): distira ez-lineala doitzea. 1etik beherako balioek tonu erdiak argitzen dituzte, 1etik gorakoak iluntzen dituzte.', 'Saturazioa (-100tik +100era): kolorearen intentsitatea. -100 gris-eskala da, +100 gainsaturatuta dago.', 'Tonalitatea Biratu (0-360°): aldatu kolore guztiak kolore-gurpilaren inguruan.', 'Lausotzea (0-20 px): Irudiaren xehetasunak leundu.', 'Zorroztu (% 0-100): Hobetu ertzak eta xehetasunak.', 'Posterize (0-16 maila): Murriztu kolore-mailak poster efektu baterako.', 'Atalasea (0-255): Biratu beltz/zuri bitar bihurtu ebaki puntuan.', 'Ertzak hautematea: Sobel edo Canny algoritmoak ertzak bakarrik erakusteko.', 'Alderantzikatu: kolore guztiak alderantzikatu.'],
    },
    {
      heading: 'Fit modua',
      paragraphs: ['Gainjarritako irudia QR kodearen eremura nola egokitzen den:'],
      bullets: ['Azala: irudiak eremu osoa betetzen du, behar izanez gero moztuta.', 'Eduki: Irudi osoa ikusgai, marjinak izan ditzake.', 'Luzatu: irudia desitxuratzen da zehazki betetzeko.'],
    },
    {
      heading: 'Eraldatu aukerak',
      paragraphs: ['Biraketa: biratu gainjartzea 90°-ko gehikuntzatan.', 'Biratu X/Y: islatu irudia horizontalki edo bertikalki.'],
    },
    {
      heading: 'Dithering algoritmoak',
      paragraphs: ['Dithering-ak tonu jarraituko irudiak QR kodeak irudika ditzaketen ereduetara bihurtzen ditu. Dithered, Blue Noise edo True Dither nahasketa moduak erabiltzen dituzunean erabilgarri dago.'],
      bullets: [
        'Errore-difusioa: Floyd-Steinberg estilo klasikoa. Kuantizazio-errorea inguruko pixeletara zabaltzen du.',
        'Ordenatua (Bayer): eredu arruntetarako atalase-matrize bat erabiltzen du.',
        'Clustered Dot: tonu erdiko inprimaketa simulatzen du.',
        'Void & Cluster: ordenatutako dithering optimizatua.',
        'Zarata urdina: ikusmen atsegina ausazko itxurako eredua.',
        'Blue Noise Threshold: zarata urdinaren ehundura duen atalasea dithering.',
        'Zarata zuria: ausazko atalasearen dithering.',
        'Zarata gaussiarra/triangeluarra: banaketa ezberdineko zarata.',
        'Blue Noise + Error Diffusion: Bi teknikak uztartzen dituen hibridoa.',
        'Screened Blue Noise: pantaila itxurako zarata urdinaren eredua.',
        'Pertzepzioa: Luminantza-haztatuta, emaitza bisual hobeak lortzeko.',
        'Edge-Aware: irudien ertzak gordetzen ditu dithering zehar.',
        'Atalase egokitzailea: lokalki moldagarria den atalasea.',
        'Denboraldia Blue Noise: GIF animatuetarako, eredua aldatu egiten da fotograma bakoitzeko.',
      ],
    },
    {
      heading: 'Difusio Nukleoak',
      paragraphs: ['Error Diffusion dithering erabiltzean, aukeratu errorea nola banatzen den:'],
      bullets: ['Floyd-Steinberg: 4 auzoko difusio klasikoa. Aukera orokor ona.', 'Jarvis-Judice-Ninke: 12 auzokide, leunagoa baina motelagoa.', 'Stucki: JJN-ren antzekoa pisu ezberdinekin.', 'Burkes: JJN sinplifikatua, azkarragoa.', 'Sierra: kalitatea eta abiadura orekatzen dituzten nukleoen familia.', 'Atkinson: argi difusioa, xehetasunak gordetzen ditu baina pikortsua izan daiteke.'],
    },
    {
      heading: 'Dither Indarra',
      paragraphs: ['Dithering zenbat aplikatzen den kontrolatzen du (% 0-100). Balio baxuagoek jatorrizko eredua gehiago gordetzen dute, balio altuek irudiaren xehetasun gehiago erakusten dute.'],
    },
    {
      heading: 'Azpipixelen ezarpenak',
      paragraphs: ['Azpipixelen nahasketa modua erabiltzean:'],
      bullets: ['Sarearen tamaina: 2×2, 3×3 edo 4×4 azpipixel modulu bakoitzeko. Goiena = xehetasun gehiago.', 'Zentroko araua: zorrotzak zentroko azpipixela behar du moduluarekin bat etor dadin. Tonu erdiko zentroak aldakuntza ahalbidetzen du.', 'Kolore neutroa: zehaztu gabeko azpipixeletarako erabiltzen den kolorea.', 'Bilatzailea gainidaztea: bilatzailearen ereduak nola errendatzen diren (solidoak edo estilizatuak).'],
    },
    {
      heading: 'Tonu erdiko ezarpenak',
      paragraphs: ['Tonu erdiko nahasketa modua erabiltzean:'],
      bullets: ['Gelaxken tamaina: Modulu bakoitzeko edo N×N sareta.', 'Puntu forma: zirkulua, karratua edo lerroa.', 'Distira-kurba: Lineala, S-Kurba edo Gamma.'],
    },
    {
      heading: 'Duotono koloreak',
      paragraphs: ['Duotone nahasketa modua erabiltzean, ezarri Itzalen kolorea (eremu ilunak) eta Nabarmendu kolorea (eremu argiak).'],
    },
    {
      heading: 'GIF animazio ezarpenak',
      paragraphs: ['GIF animaziozko gainjartzeak erabiltzen dituzunean:'],
      bullets: ['Erabili fotograma-atzerapenak: errespetatu jatorrizko GIF denbora.', 'FPS gehienez: fotograma-abiadura mugatu (1-60 fps).', 'Ezabaketa-kudeaketa: errespetatu edo sinplifikatu markoa botatzeko metodoak.'],
    },
    {
      heading: 'Errendatze aukera aurreratuak',
      paragraphs: ['Errendatzeko kontrol gehigarriak:'],
      bullets: ['Hutsune modua: bat ere ez, txertaketa, trazua edo espazio negatiboa hutsunearen estiloa.', 'Txokoen erradioa: ertz biribilduen ehunekoa moduluen kasuan.', 'Gradientea: bat ere ez, gradiente lineala, erradiala edo konikoa moduluetan.', 'Begiaren kanpoko/barneko estiloa: bilatzaileen eredu-eraztunentzako estilo independentea.', 'Puntuen biraketa: biratu diamante/puntu moduluak.', 'Begien eskala: bilatzaileen ereduetarako tamaina doitzea.', 'Markoaren estiloa: Gehitu marko apaingarriak (marko biribila, eranskailua, etiketa).', 'Markoaren testua: Gehitu "Eskanea nazazu!" markoetara.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'QR kodeketa aurreratua',
      paragraphs: ['Doitu QR kodeketa:'],
      bullets: ['Kodetze modua: automatikoa, zenbakizkoa, alfanumerikoa, byte/UTF-8 edo kanji.', 'Ezar ezazu Gutxieneko Zona Isila: Ziurtatu gutxienez 4 moduluko marjina.', 'Maskara eredua: Auto (optimoa), edo eskuz hautatu 0-7 ereduak moduluaren banaketa kontrolatzeko. Eredu ezberdinek itxura bisual desberdinak sortzen dituzte datu berak kodetzen dituzten bitartean.', 'Karaktere-kodeketa: ISO-8859-1 (Latin-1 lehenetsia), UTF-8 (Unicode osoa emoji barne), edo Maius-JIS (Japoniarra). Aukeratu zure edukiaren ezaugarrien arabera.'],
    },
    {
      heading: 'Irteera-aukera aurreratuak',
      paragraphs: ['Esportazio ezarpen gehigarriak:'],
      bullets: ['Fitxategi-izena: deskargak egiteko fitxategi-izen pertsonalizatua.', 'GIF Paleta Tamaina: 2-256 kolore GIF irteeran.', 'GIF Quantizer: Median Cut, NeuQuant edo Octree kolore murrizketa.', 'GIF Dithering: Desaktibatuta, Floyd-Steinberg edo Agindua.', 'GIF Kolore gardena: Ezarri kolore bat gardena izan dadin.', 'SVG True Vector: Erabili bideak txertatutako raster-aren ordez.', 'SVG forma zehaztasuna: pixel edo bide zehatza errendatzea.', 'SVG kapsulatu raster gainjartzea: sartu gainjartzea kapsulatutako irudi gisa.', 'Atzeko planoa gainidaztea: behartu atzeko planoko kolore zehatz bat irteeran.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Baliozkotzeko aukerak',
      paragraphs: ['Sarrera prozesatzeko ezarpenak:'],
      bullets: ['Baliozkotu sarrera: egiaztatu edukiaren formatua kodetu aurretik.', 'Moztu zuriunea: kendu hasierako/azkeneko zuriuneak.', 'Lerro berriak normalizatu: lerro amaiera guztiak LF bihurtu.', 'Max Length Guard: abisatu edukiak QR ahalmena gainditzen badu.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Ezaugarri Profesionalak',
      paragraphs: ['Profesional mailak ur-markak, metadatuak, partekatzeko aukerak, segurtasun-analisia, ordainketa QR kodeak eta enpresa-eginbideak gehitzen ditu.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Ur-marka',
      paragraphs: ['Gehitu ur-markak zure QR kodeetan:'],
      bullets: ['Mota: testua, irudia edo eredua ur-marka.', 'Kokapena: Erdialdea, Izkinak, Ertzak, Atzean edo Zona lasaia.', 'Opakotasuna: Ur-markaren gardentasuna (% 0-100).', 'Nahasketa modua: normala, biderkatzea, pantaila edo gainjartzea.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadatuak',
      paragraphs: ['Kapsulatu metadatuak esportatutako fitxategietan:'],
      bullets: ['Izenburua, Egilea, Copyright, Lizentzia, Deskribapen eremuak.', 'Sorkuntza-denbora: txertatu belaunaldi-zigilua.', 'Gako-balio pertsonalizatua: Gehitu metadatu bikote arbitrarioak.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
      ],
    },
    {
      heading: 'Partekatzea',
      paragraphs: ['Partekatu zure QR kodearen konfigurazioak:'],
      bullets: ['Esteka zuzena: Sortu parteka daitekeen URL bat zure uneko ezarpenekin.', 'HTML txertatu: Lortu webguneetarako kapsulatutako kodea.', 'Kodetu parametroak: Sartu ezarpen guztiak partekatzeko URLan.', 'Oharra: tokiko fitxategietako irudiak gainjarri ezin dira URL bidez partekatu.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' },
      ],
    },
    {
      heading: 'Segurtasun Analisia',
      paragraphs: ['Ziurtatu QR kodeak eskaneatu daitezkeela:'],
      bullets: ['Segurtasun modua: desaktibatuta, orekatua edo eskaneatzeko eskakizun zorrotzak.', 'Gutxieneko moduluaren tamaina: modulu bakoitzeko gutxieneko pixel-tamaina.', 'Gutxieneko Zona lasaia: gutxieneko marjina moduluak.', 'Blokeatu bilatzaileak/denbora/lerrokatzea/formatua/bertsioa: babestu elementu zehatzak.', 'Gehienezko gainjartze intentsitatea ECCren arabera: intentsitate-muga automatikoak erroreak zuzentzeko mailan oinarrituta.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' },
      ],
    },
    {
      heading: 'Eduki motak (profesionala)',
      paragraphs: ['Profesional mailak ordainketa eta enpresa eduki motak gehitzen ditu:'],
      bullets: ['EPC/SEPA (EB): Europako banku-transferentzia QR kodeak IBAN, BIC, zenbatekoa, erreferentziarekin.', 'UPI (India): Ordainketen Interfazea VPArekin, ordaintzailearen izena, zenbatekoa.', 'PayNow (Singapur): Singapurreko ordainketa azkarra UEN edo mugikor zenbakiarekin.', 'PromptPay (Thailandia): Thailandiako ordainketa sistema nazionala.', 'PIX (Brasil): Brasilgo berehalako ordainketa PIX gakoarekin.', 'Crypto: Bitcoin, Ethereum, Litecoin ordainketa helbideak aukerako zenbatekoarekin.', 'Marketing-kanpainaren esteka: UTM parametro osoa (Marketing-etiketak) jarraipena duten URLak.', 'Esteka laburra: QR kode dinamiko/jarraigarrietarako URL laburtzaileekin erabiltzeko.', 'GS1 Digital Link: produktuaren identifikazioa GTINarekin, seriearekin, lotearekin, iraungipenarekin.', 'Esteka sakona aplikazioa: iOS/Android aplikazioaren esteka sakonak eskema pertsonalizatuekin.', 'Formatu pertsonalizatua: formatu edo baliozkotzerik gabeko datu gordinak.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Hizkuntzari dagozkion ordainketak modu aurreratuan',
      paragraphs: ['Modu aurreratua erabiltzean, ANQR-k automatikoki erakusten ditu hautatutako hizkuntzari dagozkion ordainketa-metodoak. Adibidez, vietnamdarrek VietQR ikusten dute, thailandiarrek PromptPay eta Indiako erabiltzaileek UPI eta BharatQR. Ordainketa-metodo globalak (kriptomoneta, PayPal, Cash App) hizkuntza guztietan daude eskuragarri. Modu profesionalak ordainketa estandar guztiak desblokeatzen ditu hizkuntza edozein dela ere.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Europako Ordainketa Arauak',
      bullets: ['EPC/SEPA (EB): Europako banku-transferentziaren QR kodeak EPC QR Code Arauari jarraituz. IBAN, BIC (aukerakoa etxekoentzat), EUR-ko zenbatekoa eta ordainketa-erreferentzia egituratuak edo egituratuak onartzen ditu. SEPA eremuan erabiltzen da EBko herrialdeak eta Suitza, Norvegia, Islandia, Liechtenstein, Monako eta San Marino barne.', 'Suitzako QR-faktura: Suitzako ordainketa estandarra SIX Ezarpen-gidalerroei jarraituz. CHF eta EUR, QR-erreferentzia (QRR), hartzekodunen erreferentzia (ISO 11649), hartzekodun/zordun helbide egituratuak eta fakturaren informazioa onartzen ditu. Suitzako fakturetarako beharrezkoa da 2022tik.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Indiako Ordainketa Arauak',
      bullets: ['UPI (India): Ordainketen Interfazea NPCI Deep Linking zehaztapenari jarraituz. VPA (Ordainketa Helbide Birtuala), ordaintzailearen izena, INR-ko zenbatekoa, transakzio-oharra, erreferentzia ID, merkatari-kategoriaren kodea eta transakzio-modua onartzen ditu.', 'BharatQR (India): UPI eta txartelen bidezko ordainketak onartzen dituen QR estandar bateratua. UPI VPA txartela PANarekin konbinatzen du gehienezko bateragarritasunerako. Merkatariaren izena, hiria, MCC, GST xehetasunak eta faktura/erreferentzia zenbakiak biltzen ditu.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Hego-ekialdeko Asiako Ordainketa Arauak',
      bullets: ['PayNow (Singapur): Singapurreko ordainketa azkarra sistema EMVCo QR zehaztapena erabiliz SGQR profilarekin. UEN (enpresen erregistroa), mugikor-zenbakia edo NRIC onartzen ditu proxy-identifikatzaile gisa. Kopuruaren editagarritasun-marka eta iraungitze-data barne hartzen ditu.', 'PromptPay (Thailandia): Thailandiako ordainketa sistema nazionala Thailandiako Bankuaren EMV profilari jarraituz. Mugikor-zenbakia, identifikazio nazionala, identifikazio fiskala, zorro elektronikoaren IDa eta fakturak ordaintzea onartzen ditu erreferentzia-eremu anitzekin.', 'QRIS (Indonesia): erantzun azkarreko kodea Indonesian estandarra. EMV-n oinarritutako ordainketa estandarra nazionala, merkatarien IDa, NMID (National Merchant ID), merkatarien irizpideen sailkapena eta erosotasun-kuotak (finkoak edo ehunekoa) onartzen ditu.', 'DuitNow (Malaysia): Malaysiako berehalako ordainketa-sistema. Hainbat proxy mota onartzen ditu NRIC, mugikorra, pasaportea, armadaren IDa eta negozioen erregistro-zenbakiak barne.', 'VietQR (Vietnam): Vietnamgo banku arteko transferentzia estandarra. Bankuaren BIN (NAPAS identifikazioa) eta kontu zenbakia behar dira. Hainbat zerbitzu-kode onartzen ditu transferentzia mota desberdinetarako (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filipinak): Filipinetako QR ordainketa estandarra InstaPay eta PESONet-en. Kontu-zenbakiak erabiltzen ditu merkatarien identifikazioarekin P2M (pertsonatik merkatari) transakzioetarako.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Ekialdeko Asiako Ordainketa Arauak',
      bullets: ['TWQR (Taiwan): Taiwango QR ordainketa estandarra. Merkatari ID, zerga ID eta TWD zenbatekoak onartzen ditu.', 'HKQR/FPS (Hong Kong): Hong Kong-eko ordainketa-sistema azkarrago QR kodeak. FPS IDa, mugikorraren zenbakia edo posta elektronikoa onartzen ditu ordainketa-identifikatzaile gisa. Zenbatekoa HKDtan.', 'JPQR (Japonia): Japoniako QR kodea ordaintzeko estandar bateratua. Denda IDa erabiltzen du merkatariak JPY kopuruekin identifikatzeko.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Eskualdeko beste ordainketa-arau batzuk',
      bullets: ['PIX (Brasil): Brasilgo Banku Zentrala berehalako ordainketa sistema BR kodearen zehaztapenarekin jarraituz. PIX gakoak (CPF, CNPJ, posta elektronikoa, telefonoa edo ausazko tekla), merkatariaren izena/hiria, transakzio IDa eta BRL zenbatekoak onartzen ditu.', 'AusPayNet/NPP PayID (Australia): Australian New Payments Platform PayID sistema. PayID motak onartzen ditu (posta elektronikoa, mugikorra, ABN, erakundearen ID) edo BSB + kontu-zenbaki tradizionala. Merkatariaren izena hautazkoa da, ordaintzaileek NPP bilaketan erregistratutako izena ikusten baitute.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Kriptomoneta Ordainketak',
      bullets: ['Bitcoin/Litecoin (BIP-21): zorroaren helbidea, aukerako zenbatekoa eta etiketa dituzten kriptografia-moneta ordainketa-URI estandarrak. Bitcoin eta Litecoin zorro nagusi guztiekin bateragarria.', 'Lightning Network (BOLT11): Lightning Network ordainketa-fakturak. Itsatsi BOLT11 kodetutako faktura-kate bat Bitcoin berehalako ordainketak gutxieneko kuotak egiteko.', 'Ethereum (EIP-681): Ethereum transakzio eskaera URIak jatorrizko ETH transferentziak eta ERC-20 token transferentziak onartzen dituztenak. Sare anitzeko laguntzarako katearen IDa (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gas-parametroak eta kontratu-funtzio-deiak barne hartzen ditu.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Ordainketa Lotura Zerbitzuak',
      bullets: ['PayPal.Me: PayPal ordainketa estekak erabiltzaile-izena eta aukerako aurrez betetako zenbatekoarekin. Hartzaileek PayPal saldoaren, txartelaren edo banku-kontuen bidez ordain dezakete.', 'Cash App: Cash App ordainketa estekak $ cashtag erabiliz aukerako zenbatekoarekin. Estatu Batuetan ezaguna den pareko ordainketetarako.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'EMV QR generikoa',
      bullets: ['EMV Orokorra: Sortu EMV Merkatariak Aurkeztutako Moduaren QR kode pertsonalizatuak berariaz zerrendatuta ez dauden ordainketa-eskemetarako. Konfiguratu merkatariaren izena, hiria, herrialde-kodea (ISO 3166-1), moneta-kodea (ISO 4217 zenbakizkoa), MCC, propina/erosotasun-kuoten aukerak eta datu-eremu osagarriak. Probetarako edo integrazio pertsonalizatuetarako erabilgarria.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Gainjarri nahasketa moduak (profesionala)',
      paragraphs: ['Nahasketa modu osagarriak Profesional mailan:'],
      bullets: ['Pixelatu: Gainjartze-efektua pixelatua.', 'Eskema: ertzak hautemateko gainjartzea ingerada bakarrik erakusten duena.', 'Uhina: distortsio uhin-efektua.', 'Azpipixelen tamaina: irudiaren araberako azpipixelen tamaina aldakorra.', 'True Dither: Dithering aurreratua matrize hautaketa ordenatuarekin.', 'Muturrekoa: irudiaren ikusgarritasun handiena, eskaneagarritasunari eragin diezaioke.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Babes-ezarpenak',
      paragraphs: ['Kontrol zehatza zein QR elementu babesten diren gainjarriz aldaketetatik:'],
      bullets: ['Gorde denbora: mantendu denbora-ereduak aldatu gabe.', 'Gorde lerrokatzea: mantendu lerrokadura-ereduak aldatu gabe.', 'Babestu formatuaren informazioa: blindatu formatuaren informazio moduluak.', 'Babestu bertsioaren informazioa: babestu bertsioaren informazio moduluak.'],
    },
    {
      heading: 'ECC-aware modua',
      paragraphs: ['Gainjartzearen intentsitatea modu adimentsuan banatzen du erroreak zuzentzeko ahalmenean oinarrituta. Sistemak aztertzen du zein modulu alda daitezkeen eskaneagarritasuna mantenduz.'],
      bullets: ['Arrisku-aurrekontua: Erabili beharreko erroreak zuzentzeko ahalmenaren ehunekoa (% 0-100).', 'Aurrekontu handiagoa = gainjarri ikusgarriagoa baina eskaneatzeko aukera arriskutsuagoa.', 'Aurrekontu txikiagoa = eskaneatze seguruagoa baina gainjarri ez da ikusten.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Errendatzeko aukera profesionalak',
      paragraphs: ['Errendatze-kontrol aurreratuak:'],
      bullets: ['Ertz zorrotzak: Erabili pixelatutako irudien errendaketa moduluaren ertz zorrotzetarako.', 'Pixel Snap: zorua, biribila edo sabaia pixelen lerrokatzea.', 'Modulu bakoitzeko kolore modua: Solidoa, Distiraren arabera, Posizioaren arabera, Gainjartzearen arabera, Klusterren arabera.', 'Kolore-paleta: definitu kolore-paleta pertsonalizatua modulu bakoitzeko koloreztatzeko.', 'Kontraste babeslea: Ziurtatu koloreen arteko gutxieneko kontraste-erlazioa.', 'Gutxieneko kontraste-erlazioa: WCAG estiloko kontraste-eskakizuna (1:1etik 21:1era).', 'Muga gehigarriko moduluak: eremu lasaitik haratago muga gehigarria.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Irteera profesionalen aukerak',
      paragraphs: ['Enpresa esportatzeko ezarpenak:'],
      bullets: ['DPI: ezarri inprimatzeko bereizmena (72-600 DPI). 300 DPI gomendatzen da inprimatzeko.', 'Sartu zona lasaia: txandakatu eremu lasaia irteerako dimentsioetan.', 'Esportatu gehigarri gisa: Sortu PDF formatu nagusiarekin batera.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'Animazio ezarpenak (profesionala)',
      paragraphs: ['Animazio profesionalaren ezaugarri osagarriak:'],
      bullets: ['Dithering tenporala: desaktibatuta, Blue Noise edo Flicker Safe fotograma bakoitzeko dithering.', 'Eredua: bat ere ez, pultsu, uhin, eskaneatu, distira edo noraeza efektuak.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Erreferentzia',
      paragraphs: ['ANQR-k zerbitzariaren aldeko API bat eskaintzen du URL parametroen bidez QR kodeak sortzeko. Hau ezin hobea da QR kodeak webguneetan, mezu elektronikoetan, dokumentuetan edo lan-fluxu automatizatuetan txertatzeko, bezeroaren aldetik JavaScript gabe.', 'Oinarrizko URLa: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Ikusi QR adibideak', type: 'example' }],
    },
    {
      heading: 'Oinarrizko Parametroak',
      paragraphs: ['Beharrezko eta ohiko parametroak (parametroen izenak ez dira itzuli):'],
      bullets: ['datuak (beharrezkoa): QR kodean kodetu beharreko edukia. URL-kodetzeko karaktere bereziak.', 'tamaina: irudiaren tamaina pixeletan (lehenetsia: 400, gehienez: 2000). Zehazten ez bada erabiltzen.', 'w, h: irteerako zabalera eta altuera pixeletan. Tamaina-parametroa gainidazten du.', 'formatua: Irteerako formatua - png, webp edo gif (lehenetsia: png).', 'ec: Erroreak zuzentzeko maila - L, M, Q edo H (lehenetsia: H).', 'fg: lehen planoko kolorea # gabe hexagonal gisa (lehenetsia: 000000).', 'bg: Atzeko planoaren kolorea hexadera gisa # gabe (lehenetsia: ffffff).', 'gardena: 1ean ezarri hondo gardenerako.', 'marjina: Zona lasaia moduluetan (lehenetsia: 4).'],
    },
    {
      heading: 'Estilizazio-parametroak',
      paragraphs: ['Moduluaren eta ereduen estiloa:'],
      bullets: ['estiloa: Moduluaren estiloa - karratua, biribildua, puntuak, diamantea, konektatuta.', 'Finder: Finder ereduaren estiloa - karratua, biribildua, zirkulua.', 'lerrokatu: Lerrokatze ereduaren estiloa - match_finder, karratua, biribildua, zirkulua.', 'tenporizazioa: denbora-ereduaren estiloa - match_module, solido, etenarekin.', 'erradioa: izkinako erradioaren ehunekoa 0-100.', 'hutsunea: moduluaren hutsunearen ehunekoa 0-50.', 'gapMode: Gap modua - bat ere ez, txertaketa, trazua, espazio_negatiboa.', 'eyeOuter, eyeInner: begien estiloak - karratua, biribildua, zirkulua.', 'eyeScale: begi-eskalaren ehunekoa (lehenetsia: 100).', 'grad: Gradiente mota - bat ere ez, lineala, erradiala, konikoa.', 'gradAngle: gradiente linealetarako gradiente-angelua.', 'gradStops: Gradientea kolore1, pos1, kolore2, pos2,... gisa gelditzen da (adibidez, ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Gainjartze-parametroak',
      paragraphs: ['Irudia gainjartzeko aukerak (gainjarritako irudia zerbitzariaren aldetik lortzen da):'],
      bullets: ['img: irudia gainjartzeko URLa (publikoki eskuragarri egon behar du).', 'modua: gainjartze modua: erdigunea, tonu erdiak, nahasketa, distira, mosaikoa, dithered, zarata urdina, azpipixela.', 'intentsity: gainjartze intentsitatea 0-100 (lehenetsia: 100).', 'colorMode: gainjartzeko kolore modua - kolorea, gris-eskala, bw.', 'egokitzea: gainjartzea nola egokitzen den - estali, eduki, luzatu.', 'ustel: biraketa gradutan gainjarri.', 'flipX, flipY: 1ean ezarri gainjartzea iraultzeko.', 'keepFinders: gorde bilatzaile-ereduak (lehenetsia: 1).', 'keepTiming, keepAlign: 1ean ezarri denbora/lerrokatze ereduak gordetzeko.'],
    },
    {
      heading: 'Aurreprozesatzeko parametroak',
      paragraphs: ['Gainjarriari irudiaren aurreprozesatzea aplikatu zaio:'],
      bullets: ['distira: -100 eta 100 arteko doikuntza (lehenetsia: 0).', 'kontrastea: Doikuntza -100tik 100era (lehenetsia: 0).', 'gamma: Balioa 0,1etik 3ra (lehenetsia: 1).', 'saturazioa: Doikuntza -100tik 100era (lehenetsia: 0).', 'ñabardura: ñabardura biraketa gradutan.', 'lauso: pixeletan lausotu.', 'zorroztu: zorroztu zenbatekoa 0-100.', 'posterize: Mailak posterizatu.', 'atalasea: 0-255 atalase bitarra.', 'ertza: ertzak hautematea - off, sobel, canny.', 'alderantzikatu: 1ean ezarri koloreak alderantzikatzeko.'],
    },
    {
      heading: 'Ur-markaren parametroak',
      paragraphs: ['Gehitu ur-markak sortutako QR kodeei:'],
      bullets: ['wmEn: Ezarri 1ean ur-marka gaitzeko.', 'wmKind: Ur-marka mota - testua, irudia, eredua.', 'wmText: Ur-markaren testua (URL bidez kodetuta).', 'wmImg: ur-markaren irudiaren URLa.', 'wmPos: Posizioa - erdigunea, ertzak, ertzak, atzealdea, zona_lasai.', 'wmOpacity: Opacity 0-100 (lehenetsia: 50).', 'wmBlend: Nahasketa modua - normala, biderkatzea, pantaila, gainjartzea.'],
    },
    {
      heading: 'Animazio-parametroak',
      paragraphs: ['GIF animatuen irteerarako (formatua=gif behar da):'],
      bullets: ['animPattern: animazio eredua - bat ere ez, pultsua, uhina, eskaneatu lerroa, distira, noraeza, kolore_zikloa.', 'animFrames: fotograma kopurua 1-60 (lehenetsia: 24).', 'animSpeed: fotograma atzerapena milisegundotan 10-1000 (lehenetsia: 100).', 'animSeed: animaziorako ausazko hazia.', 'easing: Animazio easing - lineala, ease_in, ease_out, ease_in_out, errebote.'],
    },
    {
      heading: 'Irteerako parametroak',
      paragraphs: ['Irteerako formatuaren aukerak:'],
      bullets: ['kalitatea: WebP kalitatea 0-1 (lehenetsia: 0,9).', 'webpQ: WebP kalitatea 0-100 (lehenetsia: 90).', 'gifColors: GIF paletaren tamaina 2-256 (lehenetsia: 256).', 'dpi: PNG-rako irteerako DPI (lehenetsia: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: PNG metadatuen eremuak.'],
    },
    // Crop Parameters
    {
      heading: 'Mozketa-parametroak',
      paragraphs: ['Gainjarri irudiak mozteko aukerak:'],
      bullets: ['cropEn: Gaitu gainjarrizko mozketa 0/1 (lehenetsia: 0).', 'cropX: Moztu zentro X 0-1 frakzio gisa (lehenetsia: 0,5).', 'cropY: Moztu Y zentroa 0-1 frakzio gisa (lehenetsia: 0,5).', 'cropSize: Moztu tamaina 0-1 irudiaren zati gisa (lehenetsia: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Segurtasun-blokeoaren parametroak',
      paragraphs: ['Kontrolatu zein QR elementu babestuta dauden gainjarriz aldaketetatik:'],
      bullets: ['lockF: Blokeatu bilatzailearen ereduak 0/1 (lehenetsia: 1).', 'lockT: Blokeatu denbora-ereduak 0/1 (lehenetsia: 1).', 'lockA: Blokeatu lerrokatze ereduak 0/1 (lehenetsia: 1).', 'lockFmt: Blokeatu formatuaren informazioa 0/1 (lehenetsia: 1).', 'lockV: Blokeatu bertsioaren informazioa 0/1 (lehenetsia: 1).', 'safeMode: Segurtasun modua - desaktibatuta, orekatua, zorrotza (lehenetsia: desaktibatuta).', 'safeMinPx: Moduluaren gutxieneko tamaina pixeletan (lehenetsia: 2).', 'safeMinQz: gutxieneko gune lasaien moduluak (lehenetsia: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Sintonizazio automatikoko parametroak',
      paragraphs: ['Optimizazio automatikoaren ezarpenak:'],
      bullets: ['autoVer: 0/1 QR bertsioa automatikoki hautatzea (lehenetsia: 1).', 'autoEcc: ECC maila automatikoki hautatzea 0/1 (lehenetsia: 0) - zerbitzariaren aldeko aholkua soilik.', 'autoReduce: [BEZEROA BAKARRIK] Intentsitatea automatikoki murriztea eskaneatu arte - eskaneatzea baliozkotzeko begizta behar du.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Animazio-parametro osagarriak',
      paragraphs: ['GIF irteerarako animazio-kontrol hedatuak:'],
      bullets: ['begizta: animazio begiztak etengabe 0/1 (lehenetsia: 1).', 'Errebotea: Ping-pong animazioaren norabidea 0/1 (lehenetsia: 0).', 'alderantzizkoa: 0/1 alderantziz erreproduzitu animazioa (lehenetsia: 0).', 'colorCycle: Gaitu koloreen ziklo-efektua 0/1 (lehenetsia: 0).', 'interp: Markoen interpolazioa - none, crossfade, morph (lehenetsia: none).', 'tempDither: dithering tenporala - desaktibatuta, blue_noise, flicker_safe (lehenetsia: desaktibatuta).', 'startF: animazioaren hasierako fotograma (lehenetsia: 0).', 'maxF: Errendatu beharreko gehienezko fotograma (lehenetsia: 0 = automatikoa).', 'stepF: fotograma-pauso-tartea (lehenetsia: 1).', 'jitter: [BEZEROA BAKARRIK] Moduluaren jitter pixeletan - fotograma bakoitzeko QR birsorkuntza behar du.'],
    },
    // Dithering Parameters
    {
      heading: 'Dithering-parametroak',
      paragraphs: ['Kontrolatu dithering algoritmoak gainjarri prozesatzeko:'],
      bullets: ['ditherKind: Dither algoritmoa - error_diffusion, ordered_bayer, blue_noise, etab (lehenetsia: ordered_bayer).', 'diffusionKernel: Error diffusion kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (lehenetsia: floyd_steinberg).', 'ditherStrength: Dither intentsitatea 0-100 (lehenetsia: 50).', 'serpentine: Serpentine dithering 0/1 (lehenetsia: 0).', 'matrizea: dither matrize ordenatua - bayer2, bayer4, bayer8 (lehenetsia: bayer4).', 'bnTile: Blue noise lauzaren tamaina (lehenetsia: 64).', 'bnSeed: Blue noise ausazko hazia (lehenetsia: 0).', 'colorDither: Koloreen dithering - bat ere ez, kanal bakoitzeko, pertzeptiboa (lehenetsia: bat ere ez).'],
    },
    // Subpixel Parameters
    {
      heading: 'Azpipixeleko parametroak',
      paragraphs: ['Azpipixelen nahasketa moduaren ezarpenak:'],
      bullets: ['spGrid: azpipixeleko sareta-tamaina - 2x2, 3x3, 4x4 (lehenetsia: 3x3).', 'spCenter: Erdiko araua - zorrotza, erdi-tonu_zentroa (lehenetsia: zorrotza).', 'spNeutral: kolore neutroko hex # gabe (lehenetsia: 808080).', 'spFinder: Bilatzailea gainidaztea - solidoa, estilizatua (lehenetsia: solidoa).'],
    },
    // Halftone Parameters
    {
      heading: 'Tonu erdiko parametroak',
      paragraphs: ['Tonu erdiko nahasketa moduaren ezarpenak:'],
      bullets: ['htCell: tonu erdiko gelaxken tamaina - per_module edo nxn grid (lehenetsia: per_module).', 'htDot: Puntu forma - zirkulua, karratua, lerroa (lehenetsia: zirkulua).', 'htCurve: Distira-kurba - lineala, s-kurba, gamma (lehenetsia: lineala).', 'duo1: Itzalen kolore bikoitza # gabe (lehenetsia: 000000).', 'duo2: Duotone nabarmendu kolorea # gabe (lehenetsia: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-aware moduko parametroak',
      paragraphs: ['Gainjarri banaketa adimenduna erroreak zuzentzeko ahalmenean oinarrituta:'],
      bullets: ['eccAware: Gaitu ECC-aware modua 0/1 (lehenetsia: 0).', 'eccRisk: Arriskuaren aurrekontuaren ehunekoa 0-100 (lehenetsia: 50).', 'eccMap: Pisu-mapa - distance_to_finders, block_heatmap, enpirical_scan_heatmap (lehenetsia: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Marko-parametroak',
      paragraphs: ['Marko apaingarriaren ezarpenak:'],
      bullets: ['markoa: markoaren estiloa - bat ere ez, marko_biribildua, eranskailua, etiketa (lehenetsia: bat ere ez).', 'frameText: markoan bistaratzeko testua (URL kodetuta).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Modulu bakoitzeko kolore-parametroak',
      paragraphs: ['Modulu indibidualak koloreztatzeko aukerak:'],
      bullets: ['modColor: Kolore modua - solidoa, by_distira, by_position, by_overlay, by_cluster (lehenetsia: solidoa).', 'cGuard: kontraste babeslea 0/1 (lehenetsia: 0).', 'minKontrastea: gutxieneko kontraste-erlazioa 1-21 (lehenetsia: 4,5).', 'paleta: komaz bereizitako hex koloreak paleta modurako.', 'paletteMode: Paleta banaketa - posizioa, distira, diagonala, erradiala, ausazkoa, errenkada, zutabea (lehenetsia: posizioa).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF gainjartze-parametroak',
      paragraphs: ['GIF animatuen gainjartze-irudien ezarpenak:'],
      bullets: ['ovType: gainjarri mota - estatikoa, gif, apng, webp_anim, bideoa (lehenetsia: estatikoa).', 'ovFramePick: fotograma hautatzea - ​​guztiak, every_n, max_frames, duration_limit (lehenetsia: guztiak).', 'gifDelays: Erabili jatorrizko GIF fotograma atzerapenak 0/1 (lehenetsia: 1).', 'gifDispH: GIF eliminazio-kudeaketa - errespetatu, sinplifikatu (lehenetsia: errespetatu).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'ECC bakoitzeko Intentsitate Mugak',
      paragraphs: ['Gehienezko gainjartze intentsitatea erroreak zuzentzeko maila bakoitzeko:'],
      bullets: ['maxIntL: ECC L 0-100erako intentsitate maximoa (lehenetsia: 100).', 'maxIntM: ECC M 0-100rako intentsitate maximoa (lehenetsia: 100).', 'maxIntQ: ECC Q 0-100erako intentsitate maximoa (lehenetsia: 100).', 'maxIntH: ECC H 0-100erako intentsitate maximoa (lehenetsia: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA simulazio-parametroak (bezeroarentzat soilik)',
      paragraphs: ['Parametro hauek URL bateragarritasunerako analizatzen dira, baina arakatzailean bakarrik funtzionatzen dute:'],
      bullets: ['qaContrast: Gaitu kontraste egiaztapena 0/1 - baliozkotze interaktiboa behar du.', 'qaBlur: simulatu lausotzea pixeletan - proba interaktiboetarako soilik.', 'qaNoise: simulatu zarata maila - proba interaktiboetarako soilik.', 'qaHeatmap: Erakutsi irakurgarritasunaren bero-mapa 0/1 - mihisearen gainjartze-interfazea behar du.'],
    },
    // Client-Only Parameters
    {
      heading: 'Bezeroentzako soilik parametroak',
      paragraphs: ['API parametro gehienak zerbitzariaren aldetik guztiz onartzen dira. [BEZEROA BAKARRIK] markatutako parametroak URL bateragarritasunerako analizatzen dira, baina arakatzailearen funtzioak behar dituzte:'],
      bullets: ['jitter: moduluen jitter-ek fotograma bakoitzeko QR birsorkuntza behar du ausaz.', 'autoReduce: Auto-murrizketaren intentsitatea eskaneatze proba errepikakorra behar da.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: QA simulazioak mihise interaktiboa balioztatzea behar du.'],
    },
    // Additional Output Parameters
    {
      heading: 'Irteera-parametro gehigarriak',
      paragraphs: ['Irteera eta esportazio ezarpen hedatuak:'],
      bullets: ['fname: deskargak egiteko fitxategi-izen pertsonalizatua (lehenetsia: anqr-qrcode).', 'inclQz: Sartu gune lasaia irteerako 0/1 dimentsioetan (lehenetsia: 1).', 'bgOver: atzeko planoko kolorea gainidazten du hex # gabe (bg parametroa gainidazten du).', 'fmtExtra: Formatu gehigarriaren irteera - none, eps, animated_webp (lehenetsia: bat ere ez). Oharra: eps [PARTEZIALA] da.', 'svgPrec: SVG forma zehaztasuna - pixel, zehatza (lehenetsia: pixel). [PARTIALA] SVG irteera mugatua zerbitzariaren aldetik.', 'svgEmbed: txertatu raster gainjartzea SVG 0/1-n (lehenetsia: 1). [PARTIALA] SVG irteera mugatua zerbitzariaren aldetik.', 'modulePx: Moduluaren pixel-tamaina (lehenetsia: tamainatik automatikoki kalkulatua).', 'ertza: ertz-modulu gehigarriak eremu lasaitik haratago (lehenetsia: 0).', 'kurruskaria: gaitu irudi kurruskariak/pixelatuak errendatzea 0/1 (lehenetsia: 1).', 'snap: Pixel snap modua - solairua, biribila, sabai (lehenetsia: solairua).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Ereduak zaintzeko parametroak',
      paragraphs: ['Kontrolatu zein egitura-elementu babesten diren gainjartzetik:'],
      bullets: ['keepFinders: gorde bilatzaile-ereduak 0/1 (lehenetsia: 1).', 'keepTiming: gorde denbora-ereduak 0/1 (lehenetsia: 0).', 'keepAlign: Lerrokatze ereduak gorde 0/1 (lehenetsia: 0).', 'protectFmt: Babestu formatuaren informazio moduluak 0/1 (lehenetsia: 0).', 'protectVer: Babestu bertsioaren informazio moduluak 0/1 (lehenetsia: 0).'],
    },
    {
      heading: 'Erabilera adibidea',
      paragraphs: ['Oinarrizko QR kodea:', 'https://anqr.link/api/qr?data=https://example.com', 'Estilodun QR kodea kolore pertsonalizatuekin:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'QR kodea gainjarritako irudiarekin:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'GIF animatua:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Ikusi QR adibideak', type: 'example' }],
    },
    {
      heading: 'QR kodeak txertatzea',
      paragraphs: ['Profesional moduan, Partekatu eginbideak HTML eta URL txertagarriak sortzen ditu. Hona hemen kapsulatzea nola funtzionatzen duen:'],
      bullets: ['Partekatu esteka: ANQR aplikaziorako URL bat sortzen du zure ezarpen guztiak URL parametro gisa kodetuta. Hartzaileek QR kodea ikusi eta alda dezakete.', 'Kapsulatu irudia: <img> etiketa bat sortzen du zerbitzariaren APIra seinalatzen duena. QR kodea zerbitzariaren aldetik errendatzen da eta irudi gisa balio du.', 'Kapsulatu Markdown: Markdown irudiaren sintaxia sortzen du dokumentaziorako eta README fitxategietarako.', 'Zuzeneko APIaren URLa: aplikazioetan, scriptetan edo bestelako integrazioetan erabiltzeko APIaren URL gordina.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
    {
      heading: 'HTML Adibidea',
      paragraphs: ['QR kode bat zure webgunean txertatzeko:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />', 'Tamaina sentikorra lortzeko:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: %100; height: auto;" />', 'Zerbitzariak cacheko goiburu luzeak dituzten erantzunak gordetzen ditu, beraz, URL beraren eskaera errepikatuak azkarrak dira.'],
    },
    {
      heading: 'Partekatu URL formatua',
      paragraphs: ['Partekatu sakatzen duzunean Profesional moduan, ANQR-k zure uneko ezarpenak URL parametroetan kodetzen ditu. Formatua hau da:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Parametro hauek APIaren parametroak islatzen dituzte, eta, beraz, partekatze-URL bat API URL bihur dezakezu oinarrizko bidea /-tik /api/qr-era aldatuz eta w/h parametroak behar bezala egokituz.', 'Oharra: tokiko fitxategietatik kargatutako gainjarritako irudiak ezin dira URL bidez partekatu; URLetan oinarritutako gainjartzeek (img parametroa) soilik funtzionatzen dute partekatutako esteketan eta API deietan.'],
    },
    {
      heading: 'Tarifaren mugak eta erabilera',
      paragraphs: ['APIa doakoa da zentzuzko bolumenetarako. Bolumen handiko erabilerarako edo funtzionamendu-denbora bermatua behar duten aplikazio komertzialetarako, jar zaitez gurekin harremanetan.', 'APIaren erantzunek cacheko goiburu oldarkorrak dituzte. Errendimendu onena lortzeko, gorde erantzunak zure aldetik edo erabili URL bera etengabe QR kode berdinetarako.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Praktika Egokiak',
      paragraphs: ['Jarraitu jarraibide hauek QR kode fidagarrietarako:'],
      bullets: ['Probatu beti zure QR kodeak eskaner-aplikazio anitzekin inprimatu aurretik.', 'Erabili errore-zuzenketa H (Altua) gainjartzeak gehitzean.', 'Mantendu gutxienez 4 modulu gune lasaia (marjina).', 'Ziurtatu kontraste handia lehen planoaren eta atzeko planoaren artean.', 'Inprimatzeko, erabili gutxienez 300 DPI eta probatu benetako inprimatzeko tamainan.', 'Gaitu Preserve Finder Patterns gainjartzeak erabiltzean.', 'Hasi gainjartze intentsitate txikiagoarekin eta handitu pixkanaka.', 'Kanpoan erabiltzeko, kontuan hartu modulu tamaina handiagoak eta erroreen zuzenketa handiagoa.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Arakatu Ikasi artikuluak', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Ikusi QR adibideak', type: 'example' },
      ],
    },
    {
      heading: 'Arazoak konpontzea',
      paragraphs: ['Ohiko arazoak eta irtenbideak:'],
      bullets: ['QR-k ez du eskaneatzen: murriztu gainjartzearen intentsitatea, handitu erroreen zuzenketa, egiaztatu kontrastea.', 'Kodea handiegia: murriztu edukiaren luzera, erabili URL laburtzailea, bertsio txikiagoa.', 'Irteera lausoa: handitu moduluaren tamaina, erabili PNG formatu konprimituen ordez.', 'Koloreek gaizki ikusten dute: egiaztatu kolore-kontrastea, probatu gris-eskala gainjartzeko modua.', 'GIF ez da animatzen: ziurtatu GIF formatuko irteera erabiltzen duzula, egiaztatu fotograma kopurua.', 'Irudiaren gainjartzea ez da kargatzen: egiaztatu CORS baimenak urruneko irudietan.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Ikusi erlazionatutako gidak eta adibideak', type: 'learn' }],
    },
    {
      heading: 'Teklatuko lasterbideak',
      paragraphs: ['ANQR-k teklatu lasterbide estandarrak onartzen ditu. Erabili Ctrl/Cmd+S esportazioa abiarazteko (aurrebistara bideratuta dagoenean).'],
    },
    {
      heading: 'Partekatzea eta txertatzea',
      paragraphs: ['Profesional moduan, egin klik Partekatu botoian zure uneko ezarpenekin URL bat kopiatzeko. Hartzaileek URL hau ireki dezakete zure konfigurazio zehatza ikusteko. Oharra: tokiko fitxategietako irudiak gainjarri ezin dira URL bidez partekatu.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Saiatu konfigurazio hau zuzenean ANQR sorgailuan.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Arakatu Ikasi artikuluak', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ikusi QR adibideak', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Ikusi QR adibideak', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Ireki sorgailua', type: 'generator' },
  ],
};

export default guide;
