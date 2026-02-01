import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Lagundu ANQR itzultzen',
  description: 'Sartu gure itzultzaileen komunitateari ANQR mundu osoko erabiltzaileei eskuragarri jartzen laguntzen. Ez da beharrezkoa kodeketa esperientziarik - lagundu zuzenean zure arakatzailetik.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Ireki Itzulpen Biltegia', type: 'external' },
    { href: '/?lang=${lang}', label: 'Ireki Sorgailua', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'ANQRri buruz', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Jarri gurekin harremanetan', type: 'external' },
  ],
  sections: [
    {
      heading: 'Zergatik lagundu?',
      paragraphs: ['ANQR mundu osoko jendeak erabiltzen du QR kodeak sortzeko, negozioetarako, ekitaldietarako, ordainketak eta proiektu pertsonaletarako. Itzulpenen ekarpenak eginez, tresna indartsu hau ama-hizkuntza nahiago duten erabiltzaileentzat eskuragarri jartzen laguntzen duzu.', 'Itzulpen-ekarpen bakoitzak - akatsak konpontzeak edo hizkuntza osoa itzultzeak - benetako aldea eragiten du zure komunitateko erabiltzaileentzat.'],
    },
    {
      heading: 'Zer Itzuli dezakezu?',
      paragraphs: ['ANQR-k bi eduki itzulgarri mota ditu:'],
      bullets: ['Interfazearen kateak: botoien etiketak, menu-elementuak, tresna-aholkuak eta aplikazioan zehar agertzen diren interfazearen testua.', 'Eduki estatikoa: dokumentazio orriak gidak, adibideak, pribatutasun politika eta laguntza artikuluak barne.', 'Bi motak zure arakatzailean zuzenean edita ditzakezun testu-fitxategi soil gisa gordetzen dira - ez da software berezirik behar.', 'Itzulpenak batu aurretik berrikusten dira kalitatea eta koherentzia bermatzeko.'],
    },
    {
      heading: 'Nola lagundu',
      paragraphs: ['Ekartzea erraza da eta ez du Git ezagutzarik behar:'],
      bullets: ['Bisitatu gure itzulpen-biltegi publikoa GitHub-en.', 'Bilatu zure hizkuntza-fitxategia (edo sortu berri bat zure hizkuntza oraindik onartzen ez bada).', 'Egin klik arkatzaren ikonoan zuzenean arakatzailean editatzeko.', 'Egin aldaketak eta egin klik "Proposatu aldaketak" - GitHub-ek automatikoki tira-eskaera bat sortuko du.', 'Zure ekarpena berrikusi eta bateratuko da, normalean egun batzuen buruan.'],
    },
    {
      heading: 'Itzulpen-jarraibideak',
      paragraphs: ['Itzultzen duzunean, mantendu {name}, {count} eta {{variable}} bezalako leku-markak aldatu gabe - horiek balio dinamikoekin ordezkatzen dira exekuzioan. Era berean, gorde HTML antzeko sintaxia, adibidez, estekak [[/path|Etiketa]] formatuan.', 'Itzulpen bati buruz ziur ez bazaude, hobe da ingelesez uztea itzulpen oker bat ematea baino. Arazo bat ere ireki dezakezu GitHub-en argibideak eskatzeko.'],
    },
    {
      heading: 'Gaur egun onartzen diren hizkuntzak',
      paragraphs: ['Gaur egun ANQR-k 40 hizkuntza baino gehiago onartzen ditu, besteak beste:'],
      bullets: ['Munduko hizkuntza nagusiak: ingelesa, txinera, gaztelania, arabiera, hindia, portugesa, japoniera, koreera, frantsesa, alemana, errusiera eta abar.', 'Asiako hego-ekialdeko hizkuntzak: thailandiera, vietnamera, indonesiera, filipinar, malaysiera, khmer, laosera, birmana.', 'Hego Asiako hizkuntzak: hindia, tamila, telugu, bengalera, marathia, gujaratera, kannada, malayalamera, punjabera, nepalera.'],
    },
    {
      heading: 'Aitortza',
      paragraphs: ['Kolaboratzaile guztiak gure biltegian kreditatzen dira. Zure lanak milaka erabiltzaileri ANQR atzitzen laguntzen die euren hizkuntza hobetsietan.', 'Eskerrik asko gure itzulpen laguntzaile guztiei ANQR mundu osoan eskuragarri jartzen laguntzeagatik!'],
    },
    {
      heading: 'Galderak?',
      paragraphs: ['Itzulpenen ekarpenari buruzko galderarik baduzu, ireki arazo bat gure GitHub biltegian edo jarri gurekin harremanetan posta elektroniko bidez. Pozik gaude hasten laguntzeko.'],
    },
  ],
};

export default translate;
