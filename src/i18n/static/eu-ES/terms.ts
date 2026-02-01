import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Zerbitzu-baldintzak',
  description: 'Gunean sartuz edo erabiliz gero, baldintza hauek betetzea onartzen duzu.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Pribatutasun politika', type: 'external' }],
  sections: [
    {
      heading: 'Baldintzak onartzea',
      paragraphs: ['ANQR (anqr.link) atzitu edo erabiliz gero, Zerbitzu-baldintza hauek eta gure Pribatutasun-politika onartzen dituzu. Baldintza hauekin ados ez bazaude, ez erabili gunea.', 'Baldintza hauek noizean behin egunera ditzakegu. Aldaketen ondoren gunea etengabe erabiltzeak baldintza berriak onartzea dakar.'],
    },
    {
      heading: 'Hautagarritasuna',
      paragraphs: ['ANQR erabiltzeko gutxienez 13 urte izan behar dituzu. Gunea erabiliz, adin baldintza hori betetzen duzula adierazten duzu. 18 urte baino gutxiago badituzu, webgunea erabiltzeko gurasoen edo tutoreen baimena duzula adierazten duzu.'],
    },
    {
      heading: 'Baimendutako erabilera',
      paragraphs: ['ANQR legezko helburuetarako soilik erabil dezakezu. QR kodeetan kodetzen duzun edukiaren eta sortzen dituzun QR kodeen erabileraren erantzule bakarra zara.'],
    },
    {
      heading: 'Jokabide debekatua',
      paragraphs: ['Ez duzula onartzen duzu:'],
      bullets: ['Erabili ANQR phishing, malware banaketa, iruzurra, iruzurrak, jazarpena, difamazioa edo legez kanpoko edozein jarduera errazten dituzten QR kodeak sortzeko.', 'Kodetu jabetza intelektualaren eskubideak urratzen dituen, pribatutasuna urratzen duen edo legez kanpoko materiala duen edukia.', 'Gunearen funtzionamendua edo segurtasuna eten, gainkargatu edo oztopatzen saiatu.', 'Alderantzizko ingeniaritza egin, deskonpilatu edo gunetik iturburu kodea ateratzen saiatu.', 'Erabili tresna automatizatuak (botak, scrapers) gunera sartzeko, beste erabiltzaile batzuen errendimendua gutxitzen duen moduan.', 'Saihestu edo desgaitu segurtasun- edo sarbide-kontroleko funtzioak.', 'Edozein pertsona edo entitate ordezkatu edo zure afiliazioa faltsutu.'],
    },
    {
      heading: 'Jabetza intelektuala',
      paragraphs: ['QR kodeetan kodetzen duzun edukiaren jabetza mantentzen duzu. ANQR-k ez du zure datuen jabetza aldarrikatzen.', 'ANQR izena, logotipoa, interfazearen diseinua eta azpiko kodea copyright, marka komertzial eta jabetza intelektualeko beste lege batzuek babestuta daude. Ezin duzu kopiatu, aldatu, banatu edo eratorritako lanik sortu gure baimenik gabe.', 'QR Code® DENSO WAVE INCORPORATED-en marka erregistratua da. ANQR ez dago DENSO WAVE-rekin afiliatuta.'],
    },
    {
      heading: 'Erabiltzailearen edukiaren lizentzia',
      paragraphs: ['ANQR erabiliz, ez diguzu zure edukiaren gaineko eskubiderik ematen. Sorkuntza lokala erabiltzean (lehenetsia), QR kode guztiak zure nabigatzailean sortzen dira eta ez ditugu kodetutako datuak sartzen, gordetzen edo transmititzen.', 'Zerbitzariaren APIa erabiltzean, zure edukia QR irudia sortzeko prozesatzen da, baina ez da gordetzen, erregistratzen edo eskatutako irudia errendatzeaz gain beste helburu batzuetarako erabiltzen.'],
    },
    {
      heading: 'Hirugarrenen zerbitzuak eta publizitatea',
      paragraphs: ['Guneak Google AdSense bidez iragarkiak bistaratzen ditu eta hirugarrenen webguneetarako estekak izan ditzake. Ez gara hirugarrenen eduki, zerbitzu edo pribatutasun praktiken erantzule.', 'Iragarleekin eta hirugarrenekin dituzun interakzioak zure eta haien artekoak dira soilik. Ikus gure Pribatutasun-politika publizitate-datuen praktikei buruzko informazioa lortzeko.'],
    },
    {
      heading: 'Bermeei uko egitea',
      paragraphs: ['ANQR "DEN BEZALA" ETA "ESKURAGARRI" DAGOEN OINARRIAN EMATEN DA, INOLAKO BERMErik GABE, ADIERAZKOA EDO INPLIZITAKOA, MERKATARITZAREN, HELBURU BEREZIKO EGOKITASUNAREN ETA URRATZE EZKO BERME INPLIZITUAK BARNE, BAINA MUGATU EZ.', 'Ez dugu bermatzen: (a) gunea etenik, segurua edo akatsik gabekoa izango denik; (b) QR kodeak eskaneatu egingo dira ingurune guztietan, gailu guztietan edo eskaner-aplikazio guztiekin; (c) guneak zure eskakizunak beteko ditu.', 'Beti probatu behar dituzu QR kodeak erabiliko diren baldintzetan (inprimatzeko tamaina, argiztapena, pantaila mota, distantzia, kameraren kalitatea).'],
    },
    {
      heading: 'Erantzukizunaren muga',
      paragraphs: ['LEGEAK AGINTEN DUEN GEHIEN MUTEAN, ANQR ETA HAREN ERAGILEAK, AFILIATUAK ETA LIZENTZIA-EMAGILEAK EZ DIRA EGINDAKO KALTE ZUZENEKO, ZEHARKUN, BEHARREZKO, BEREZIA, ONDORIOZ, ZIGOR EDO EREDIBIDEEZ, IRABAKIAK, ERRENTARAK MUGATUTA, IRABAKIAK BARNE. ZERBITZUAREN SARTZEKO EDO ERABILTZEKO (EDO SARTZEKO EDO ERABILTZEKO EZINA) BORONDATE ONUA, ERABILERA EDO BESTE ZERBITZUAREN SARBIDEAREN EDO ERABILTZEAREN GAINEKO EDO HORRETAKO GALERA EZIN.', 'ZERBITZUAREN ERABILERA ZURE ARRISKU BAKARRIK DOLA ULERTZEN DUZU ETA ONARTZEN DUZU. ZERBITZUA DOAN EMATEN DA, ETA HORREGATIK, ONARTZEN DUZUE ANQR ETA BERE ERAGILEEK EZ DUZELA EZ DUTE ERABILKIZUN KALTE EDO GALERAGATIK. GURE ERANTZUKIZUN GUZTIRA EZ DIRA ZERO DOLLAR ($0 AUD) GAINDIKOA.', 'ZERBITZUAREN ERABILERATIK ERABILTZEN DITUZUN ANQR ETA BERE ERAGILEEN AURKAKO ERREKLAMAZIO, ESKAI ETA EDOZEIN ERREKLAMAZIO, ESKAI ETA KAUSA GUZTIAK ASKATZEA, UKO EGIN ETA ESKUTZEA ONARTZEN DUZUE.', 'JURISDIKZIO ZENBAIT EZ DUTE ONARTZEN ZENBAIT BERME EDO ERANTZUKIZUN MUGA BAZTERTZEA. JURISDIKZIO HONETAN, GURE ERANTZUKIZUNA MUGATUKO DA APLIKATZEKO LEGEAK BAIMENDUTAKO GEHIENEZ.'],
    },
    {
      heading: 'Kalte-ordaina',
      paragraphs: ['ANQR, bere operadoreak, afiliatuak eta dagozkien ofizialak, zuzendariak, langileak eta agenteak indemnizatzea, defendatzea eta kalterik gabe uztea onartzen duzu: (a) webgunearen erabileraren ondoriozko edozein erreklamazio, kalte, galera, erantzukizun, kostu eta gastuengatik (lege-tasak barne); (b) Baldintza hauek urratzea; (c) zure hirugarrenen eskubideen urraketa; (d) QR kodeetan kodetzen duzun edozein eduki.'],
    },
    {
      heading: 'Gatazkak ebaztea',
      paragraphs: ['Baldintza hauetatik edo ANQR erabiltzeagatik sortutako edozein gatazka negoziazio informalen bidez konpontzen saiatuko da, posta elektronikoa@anqr.link helbidera bidalita.', 'Ebazpen informalak huts egiten badu, gatazkak arbitraje loteslearen bidez ebatziko dira Victorian (Australia), aldeetako edozeinek epaitegian epaitegietan babesa eska dezake jabetza intelektualaren urraketagatik.'],
    },
    {
      heading: 'Ekintza kolektiboaren uko egitea',
      paragraphs: ['LEGEZAK AHALTZATZEN DUEN MUTURITAN, ONARTZEN DUZUE GATAZKAK EBAZTEKO PROZEDURAK BAKARRIK BAKARRIK IZANGO DITUELA ETA EZ KLASEKO EKINTZA, BATERATU EDO ORDEZKARITZAKO EKINTZA BATEAN IZANGO DELA.'],
    },
    {
      heading: 'Arau-legea',
      paragraphs: ['Baldintza hauek Victoriako (Australia) legeek arautzen dituzte, legeen arteko gatazkaren printzipioak kontuan hartu gabe. Victorian (Australia) dauden epaitegien jurisdikzio esklusiboa onartzen duzu.'],
    },
    {
      heading: 'Aldaketak eta erabilgarritasuna',
      paragraphs: ['Webgunea (edo haren zatiren bat) aldatu, eten edo eten dezakegu edozein unetan ohartarazpenik edo erantzukizunik gabe.', 'Baldintza hauek edozein unetan egunera ditzakegu. "Azken eguneratutako" datak adierazten du noiz berrikusi diren azken aldiz. Aldaketen ondoren etengabe erabiltzeak onarpena dakar.'],
    },
    {
      heading: 'Banagarritasuna',
      paragraphs: ['Baldintza hauetako xedapenen bat baliogabetzat edo bete ezinezkotzat jotzen bada, xedapen hori onartuko den neurrian beteko da, eta gainerako xedapenek indarrean jarraituko dute.'],
    },
    {
      heading: 'Uko egitea',
      paragraphs: ['Baldintza hauetako edozein eskubide edo xedapen ez betetzea ez da eskubide edo xedapen horri uko egiten zaiola ulertuko.'],
    },
    {
      heading: 'Akordio osoa',
      paragraphs: ['Baldintza hauek, gure Pribatutasun Politikarekin batera, zure eta ANQRren arteko akordio osoa osatzen dute webgunearen erabilerari buruz eta aurreko akordioak ordezkatzen dituzte.'],
    },
    {
      heading: 'Ezinbesteko kasua',
      paragraphs: ['Ez dugu erantzule izango gure arrazoizko kontroletik kanpo dauden zirkunstantziaengatik, hondamendi naturalak, gerrak, terrorismoak, istiluak, gobernu-ekintzak edo Interneteko/azpiegituren hutsegiteak barne.'],
    },
    {
      heading: 'Harremanetan jarri',
      paragraphs: ['Baldintza hauei buruzko galderak helbide honetara bidal daitezke: email@anqr.link'],
    },
  ],
};

export default terms;
