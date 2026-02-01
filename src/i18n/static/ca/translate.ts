import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Ajuda a traduir ANQR',
  description: 'Uniu-vos a la nostra comunitat de traductors que ajuden a fer accessible ANQR als usuaris del món. No es requereix experiència de codificació - contribueix directament al vostre navegador.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Obre repositori de traduccions', type: 'external' },
    { href: '/?lang=${lang}', label: 'Obre el generador', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Quant a ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contacte amb nosaltres', type: 'external' },
  ],
  sections: [
    {
      heading: 'Per què Contribueix?',
      paragraphs: ['ANQR es fa servir per gent d\'arreu del món per crear codis QR per a empreses, esdeveniments, pagaments i projectes personals. Per contribuir a traduir, ajuda a fer accessible aquesta eina potent als usuaris que prefereixin la seva llengua nativa.', 'Cada contribució de traducció - si arregla un error o traduir un idioma sencer - marca una diferència real per als usuaris de la vostra comunitat.'],
    },
    {
      heading: 'Què pots traduir?',
      paragraphs: ['ANQR té dos tipus de contingut translatable:'],
      bullets: ['Cadenes de la IU: etiquetes de botons, elements de menú, consells i text de la interfície que apareix a tota l\' aplicació.', 'Contingut estàtic: Pàgines de documentació incloent guies, exemples, política de privacitat i articles d\' ajuda.', 'Ambdós tipus es desen com a fitxers de text simples que podeu editar directament al vostre navegador, no cal programari especial.', 'Les traduccions es revisen abans de barrejar-se per assegurar la qualitat i la consistència.'],
    },
    {
      heading: 'Com aportar',
      paragraphs: ['Contribuir és fàcil i no requereix coneixement Git:'],
      bullets: ['Visiteu el nostre repositori de traducció públic al GitHub.', 'Trobeu el vostre fitxer d\' idioma (o creeu- ne un de nou si el vostre idioma encara no està implementat).', 'Feu clic sobre la icona del llapis per editar directament al vostre navegador.', 'Fes els canvis i clica "Proposa els canvis" - GitHub crearà automàticament una sol·licitud d\'accés.', 'La seva contribució serà revisada i fusionada, normalment en uns dies.'],
    },
    {
      heading: 'Línies guia de traducció',
      paragraphs: ['En traduir, si us plau, mantingui les variables de posició com _ FANQR_ PH_ 0__, _ FRO_ FH_ 1____ text, i _ FH_ sense canvis - aquests són substituïts per valors dinàmics a l\' hora d\' execució. Preserva també qualsevol sintaxi HTML com ara els enllaços en el format [=[=[ pathLabelLabel].', 'Si no esteu segur d\' una traducció, és millor deixar- la en anglès que proporcionar una traducció incorrecta. També podeu obrir un problema a GitHub per demanar-li requiificació.'],
    },
    {
      heading: 'Idiomes acceptats actualment',
      paragraphs: ['ANQR actualment accepta més de 40 idiomes, incloent-hi:'],
      bullets: ['Els principals idiomes mundials: Anglès, xinesos, espanyol, àrab, portuguès, japonès, coreà, francès, alemany, rus i més.', 'Per tant, les llengües del sud-est asiàtic: Tailandesos, Indonesis, filipí, Malai, Khmer, Lao, birmans.', 'Llengües d\'Àsia del Sud: Hindi, Tàmil, Bengalí, Marathi, Gujarati, Kanarès, Malaialam, Panjabi, Nepal.'],
    },
    {
      heading: 'Reconeixement',
      paragraphs: ['Tots els col·laboradors són credits en el nostre repositori. El teu treball ajuda a milers d\'usuaris a accedir a ANP en el seu idioma preferit.', 'Gràcies a tots els nostres col·laboradors de traducció per ajudar a fer accessible l\'ANAQR a tot el món!'],
    },
    {
      heading: 'Preguntes?',
      paragraphs: ['Si teniu preguntes sobre la col·laboració de traduccions, si us plau, obriu un problema en el repositori GitHub o contacteu amb nosaltres mitjançant correu electrònic. Estem contents d\'ajudar-te a començar.'],
    },
  ],
};

export default translate;
