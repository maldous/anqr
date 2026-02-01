import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Jarri gurekin harremanetan',
  description: 'Iritziak, akatsen txostenak, funtzioen eskaerak eta kontsulta orokorrak ongi etorriak ditugu.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Nola iritsi gurera',
      paragraphs: ['Gurekin harremanetan jartzeko hainbat modu eskaintzen ditugu zure beharren arabera. Mezu guztiak irakurtzen ditugu, baina erantzun denborak alda daitezke bolumenaren eta kontsulta motaren arabera.'],
    },
    {
      heading: 'Posta elektronikoa',
      paragraphs: ['Kontsulta guztietarako: email@anqr.link', 'Hau da gurekin harremanetan jartzeko modurik fidagarriena eta galdera zehatzak, negozio-kontsultak edo beste edozein kontsulta egiteko gomendatzen da.'],
    },
    {
      heading: 'Kontsulta motak',
      bullets: ['Galdera orokorrak: ANQR erabiltzeari buruzko galderak, eginbideen azalpenak edo iritzi orokorrak.', 'Akatsen txostenak: sartu zure arakatzailea, sistema eragilea, erreproduzitzeko urratsak eta ikusten dituzun errore-mezuak.', 'Eginbideen eskaerak: eginbide edo hobekuntza berrietarako iradokizunak. Eskaera guztiak kontuan hartzen ditugu, nahiz eta gauzatzea ezin dugun agindu.', 'Enpresa-kontsultak: lankidetza-aukerak, lizentzia-galderak edo erabilera komertzialen kontsultak.', 'Pribatutasun-eskaerak: GDPR, CCPA edo beste pribatutasun-lege batzuen arabera zure pribatutasun-eskubideak erabiltzeko eskaerak (ikus Pribatutasun-politika).', 'DMCA/Copyright: ikusi beheko DMCA atala kentzeko jakinarazpenen eskakizunetarako.'],
    },
    {
      heading: 'Erantzun denborak',
      paragraphs: ['Kontsultei 5-7 laneguneko epean erantzutea dugu helburu. Pribatutasunarekin lotutako eskaerak 30 eguneko epean zuzenduko dira, legeak agintzen duen moduan.', 'Lanpetuta dagoen garaietan, erantzun denborak luzeagoak izan daitezke. Premiazko gaietarako, mesedez adierazi "URGENTE" gaian.'],
    },
    {
      heading: 'Gurekin harremanetan jarri aurretik',
      paragraphs: ['Mesedez, begiratu gure Dokumentazio orria ANQR funtzioak erabiltzeari buruzko ohiko galderei erantzuteko. QR kodea sortzeari, estiloari eta esportatzeko aukerei buruzko galdera asko azaltzen dira bertan.'],
    },
    {
      heading: 'DMCA Copyright-oharrak',
      paragraphs: ['ANQR-n eskuragarri dagoen edukiak zure egile-eskubideak urratzen dituela uste baduzu, Digital Millennium Copyright Act (DMCA) kentzeko oharra bidal dezakezu. Baliozkoa izan dadin, zure oharrak honako hauek jaso behar ditu:'],
      bullets: ['Copyright-jabearen edo baimendutako agentearen sinadura fisikoa edo elektronikoa.', 'Egile-eskubidedun lanaren identifikazioa urratu dela.', 'Urratu egiten duela alegatzen den materialaren identifikazioa, hura aurkitzeko informazio nahikoarekin.', 'Zure harremanetarako informazioa (helbidea, telefono zenbakia eta helbide elektronikoa).', 'Materiala erabiltzeko copyright-jabeak baimendu ez duela uste duzula dioen adierazpena.', 'Zure oharrean agertzen den informazioa zehatza dela eta egile-eskubideen jabea zarela edo haien izenean jarduteko baimena duzula dioen adierazpena, perjurio zigorpean.'],
    },
    {
      heading: 'DMCA kontaktua',
      paragraphs: ['Bidali DMCA oharrak helbide honetara: email@anqr.link', 'Mesedez, sartu "DMCA oharra" gaian. Indarreko legediaren arabera erantzungo diegu baliozko oharrei. Kontuan izan ANQR-k QR kodeak lokalean sortzen dituela erabiltzaileen gailuetan eta ez duela erabiltzaileek sortutako edukia hartzen.'],
    },
    {
      heading: 'Reddit komunitatea',
      paragraphs: ['Sartu gure Reddit komunitatean r/ANQR-n zure QR sorkuntzak partekatzeko, galderak egiteko, laguntza lortzeko eta ANQR-eko beste erabiltzaile batzuekin konektatzeko.'],
    },
  ],
};

export default contact;
