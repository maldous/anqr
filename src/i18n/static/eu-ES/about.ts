import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'ANQRri buruz',
  description: 'ANQR doako QR kode-sorgailu bat da, bezeroaren lehen ikuspegia duena. Sortu QR kodeak lokalean edo erabili gure APIa txertatzeko.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ireki sorgailua', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Arakatu Ikasi artikuluak', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Pribatutasun politika', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Zerbitzu-baldintzak', type: 'external' },
  ],
  sections: [
    {
      heading: 'Zer da ANQR?',
      paragraphs: ['ANQR ("aingura" ahoskatua) doako QR kode-sorgailu bat da, URLak, testuak, Wi-Fi kredentzialak, kontaktu-txartelak, egutegiko gertaerak eta abarretarako kode eskanegarriak sortzen dituena.', 'Erregistratu gabe QR tresna indartsuak nahi dituzten pertsonentzat, enpresa txikientzat, merkatarientzat eta garatzaileentzat eraikia dago. Bezeroaren lehen diseinuak QR kodeak zure arakatzailean lokalean sortzen direla esan nahi du lehenespenez, txertatze eta integrazio profesionalerako zerbitzariaren aukerako API batekin.'],
    },
    {
      heading: 'Funtsezko ezaugarriak',
      bullets: ['Sortu QR kodeak berehala zure arakatzailean - ez da konturik behar.', 'Pertsonalizatu koloreak, moduluen estiloak, bilatzaileen ereduak eta gehitu irudien gainjartzeak.', 'Esportatu hainbat formatutan: PNG, SVG, WebP eta GIF animatua.', 'Akatsak zuzentzeko maila, QR bertsioa, kodetze modua eta maskara aukeratzeko kontrol aurreratuak.', 'Eskaneatzeko segurtasun-gidak eta zuzeneko aurrebista, kodeak irakurgarri mantentzen laguntzeko, inprimatu eta pantailetan.', 'Zerbitzariaren alboko APIa txertatze profesionalerako parametroen laguntza osoarekin.', 'Lineaz kanpo funtzionatzen du behin kargatuta - edonon exekutatu dezakezun web-aplikazio estatiko bat da.'],
    },
    {
      heading: 'ANQR nola funtzionatzen duen',
      paragraphs: ['ANQR zure arakatzailean exekutatzen da eta zure sarrera QR matrize estandar batean kodetzen du Reed-Solomon errore-zuzenketarekin, eta, ondoren, zuk aukeratutako formatuan errendatzen du.', 'Lehenespenez, sorkuntza lokalean gertatzen da zure arakatzailean. Erabilera profesionalerako, zerbitzariaren aldeko APIa ere erabil dezakezu URL parametroen bidez QR kodeak sortzeko; ezin hobea webguneetan, mezu elektronikoetan edo lan-fluxu automatizatuetan txertatzeko.', 'Gainjartzeak edo animazioak gehitzen dituzunean, ANQR-k estiloa eskaneatze fidagarritasunarekin orekatzen du, emaitza eskaneatu ahal izateko.', 'ANQR kode estatikoetan zentratzen da (datuak QR barruan daude). Kode dinamiko bat behar baduzu (helmuga editagarria), zure birbideratzeko URLa edo esteka laburra kodetu dezakezu.'],
    },
    {
      heading: 'Nork funtzionatzen du ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Publizitatea eta nola geratzen garen aske',
      paragraphs: ['ANQR erabiltzeko doakoa da eta iragarkiak onartzen ditu. Google AdSense eta/edo beste publizitate-bazkide batzuen bidez iragarkiak erakutsi ditzakegu.', 'Iragarkien hornitzaileek cookieak edo antzeko teknologiak erabil ditzakete iragarkiak pertsonalizatzeko, zure interesen eta nabigazio-jardueraren arabera. Iragarkien hobespenak zure gailuaren ezarpenetan eta Google iragarkien ezarpenen bidez kudea ditzakezu, eta informazio gehiago gure Pribatutasun-gidalerroetan.', 'Ez dugu QR kodeetan kodetzen duzun edukia saltzen. Iragarkiek proiektua martxan jartzeko eta hobetzeko kostuak estaltzen laguntzen dute.'],
    },
    {
      heading: 'Estandar irekiak',
      paragraphs: ['ANQR-k ISO/IEC 18004 estandarrean oinarritutako QR kodeak sortzen ditu eta eskaner, kamera eta inprimaketa-fluxuen bateragarritasun zabala du helburu.'],
    },
    {
      heading: 'Marken oharra',
      paragraphs: ['QR Code® DENSO WAVE INCORPORATED-en marka erregistratua da. ANQR ez dago DENSO WAVE INCORPORATED-ekin afiliatuta, babestuta edo babestuta.'],
    },
    {
      heading: 'Iritziak eta ekarpenak',
      paragraphs: ['Iritziak, akatsen txostenak eta eginbideen iradokizunak ongi etorriak ditugu. Mesedez, jarri harremanetan posta elektroniko bidez edo kontaktu-orriaren bidez - mezu guztiak irakurtzen ditugu, erantzun-epeak alda daitezkeen arren.'],
    },
  ],
};

export default about;
