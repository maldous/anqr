import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Oor ANQR',
  description: 'ANQR is \'n gratis QR-kode-opwekker met \'n kliënt-eerste benadering - genereer QR-kodes plaaslik of gebruik ons API vir inbedding.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Maak die kragopwekker oop', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Blaai deur Leer artikels', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Privaatheidsbeleid', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Diensbepalings', type: 'external' },
  ],
  sections: [
    {
      heading: 'Wat is ANQR?',
      paragraphs: ['ANQR (uitgespreek "anker") is \'n gratis QR-kode-opwekker wat skandeerbare kodes vir URL\'s, teks, Wi-Fi-bewyse, kontakkaarte, kalendergeleenthede en meer skep.', 'Dit is gebou vir individue, klein besighede, bemarkers en ontwikkelaars wat kragtige QR-instrumente wil hê sonder om aan te meld. Die kliënt-eerste ontwerp beteken dat QR-kodes by verstek plaaslik in jou blaaier gegenereer word, met \'n opsionele bediener-API vir professionele inbedding en integrasie.'],
    },
    {
      heading: 'Sleutel kenmerke',
      bullets: ['Genereer QR-kodes onmiddellik in jou blaaier - geen rekening nodig nie.', 'Pas kleure, modulestyle, vindpatrone aan en voeg prentbedekkings by.', 'Voer uit in verskeie formate: PNG, SVG, WebP en geanimeerde GIF.', 'Gevorderde kontroles vir foutkorreksievlak, QR-weergawe, enkoderingsmodus en maskerkeuse.', 'Skandeerveiligheidsleiding en regstreekse voorskou om te help om kodes leesbaar in druk en op skerms te hou.', 'Bedienerkant-API vir professionele inbedding met volledige parameterondersteuning.', 'Werk vanlyn sodra dit gelaai is - dit is \'n statiese webtoepassing wat u enige plek kan gebruik.'],
    },
    {
      heading: 'Hoe ANQR werk',
      paragraphs: ['ANQR loop in jou blaaier en kodeer jou invoer in \'n standaard QR-matriks met Reed–Solomon-foutkorreksie, en gee dit dan weer na die formaat wat jy kies.', 'Generering vind by verstek plaaslik plaas in jou blaaier. Vir professionele gebruik kan jy ook die bedienerkant-API gebruik om QR-kodes via URL-parameters te genereer - perfek vir inbedding in webwerwe, e-posse of outomatiese werkvloeie.', 'Wanneer jy oorlegsels of animasies byvoeg, balanseer ANQR stilering met skanderingsbetroubaarheid sodat die resultaat skandeerbaar bly.', 'ANQR fokus op statiese kodes (die data is binne die QR). As jy \'n dinamiese kode (bewerkbare bestemming) benodig, kan jy jou eie aanstuur-URL of kort skakel enkodeer.'],
    },
    {
      heading: 'Wie bedryf ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Advertensies en hoe ons vry bly',
      paragraphs: ['ANQR is gratis om te gebruik en word ondersteun deur advertensies. Ons kan dalk advertensies wys via Google AdSense en/of ander advertensievennote.', 'Advertensieverskaffers kan webkoekies of soortgelyke tegnologieë gebruik om advertensies te personaliseer op grond van jou belangstellings en blaai-aktiwiteit. Jy kan advertensievoorkeure in jou toestelinstellings en deur Google-advertensie-instellings bestuur, en kom meer te wete in ons Privaatheidsbeleid.', 'Ons verkoop nie die inhoud wat jy in QR-kodes kodeer nie. Advertensies help om die koste van die bestuur en verbetering van die projek te dek.'],
    },
    {
      heading: 'Oop standaarde',
      paragraphs: ['ANQR genereer QR-kodes gebaseer op die ISO/IEC 18004-standaard en streef na breë versoenbaarheid oor skandeerders, kameras en drukwerkstrome.'],
    },
    {
      heading: 'Handelsmerkkennisgewing',
      paragraphs: ['QR Code® is \'n geregistreerde handelsmerk van DENSO WAVE INCORPORATED. ANQR is nie geaffilieer met, onderskryf deur of geborg deur DENSO WAVE INCORPORATED nie.'],
    },
    {
      heading: 'Terugvoer en bydraes',
      paragraphs: ['Ons verwelkom terugvoer, foutverslae en kenmerkvoorstelle. Kontak asseblief per e-pos of die kontakbladsy - ons lees elke boodskap, alhoewel reaksietye kan verskil.'],
    },
  ],
};

export default about;
