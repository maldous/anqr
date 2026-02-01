import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Axuda a traducir ANQR',
  description: 'Únete á nosa comunidade de tradutores para que ANQR sexa accesible para os usuarios de todo o mundo. Non se precisa experiencia de codificación: contribúa directamente desde o teu navegador.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Abrir o repositorio de tradución', type: 'external' },
    { href: '/?lang=${lang}', label: 'Abre o xerador', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Acerca de ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contacta connosco', type: 'external' },
  ],
  sections: [
    {
      heading: 'Por que contribuír?',
      paragraphs: ['ANQR é usado por persoas de todo o mundo para crear códigos QR para empresas, eventos, pagos e proxectos persoais. Ao contribuír con traducións, axudas a que esta poderosa ferramenta sexa accesible para os usuarios que prefiren a súa lingua nativa.', 'Cada contribución á tradución, xa sexa para corrixir un erro tipográfico ou traducir un idioma enteiro, marca unha verdadeira diferenza para os usuarios da túa comunidade.'],
    },
    {
      heading: 'Que podes traducir?',
      paragraphs: ['ANQR ten dous tipos de contido traducible:'],
      bullets: ['Cadenas de interface de usuario: etiquetas de botóns, elementos de menú, información sobre ferramentas e texto da interface que aparece na aplicación.', 'Contido estático: páxinas de documentación que inclúen guías, exemplos, política de privacidade e artigos de axuda.', 'Ambos tipos gárdanse como ficheiros de texto sinxelos que pode editar directamente no seu navegador, sen necesidade de software especial.', 'As traducións son revisadas antes de fusionarse para garantir a calidade e a coherencia.'],
    },
    {
      heading: 'Como contribuír',
      paragraphs: ['Contribuír é sinxelo e non require coñecementos de Git:'],
      bullets: ['Visita o noso repositorio público de traducións en GitHub.', 'Busca o teu ficheiro de idioma (ou crea un novo se o teu idioma aínda non é compatible).', 'Fai clic na icona do lapis para editar directamente no teu navegador.', 'Fai os teus cambios e fai clic en "Propoñer cambios". GitHub creará automaticamente unha solicitude de extracción.', 'A túa contribución revisarase e fusionarase, normalmente nuns días.'],
    },
    {
      heading: 'Directrices de tradución',
      paragraphs: ['Ao traducir, mantén os marcadores de posición como {name}, {count} e {{variable}} sen cambios; estes substitúense por valores dinámicos no tempo de execución. Conserve tamén calquera sintaxe semellante ao HTML, como as ligazóns no formato [[/path|Label]].', 'Se non está seguro dunha tradución, é mellor deixala en inglés que proporcionar unha tradución incorrecta. Tamén podes abrir un problema en GitHub para pedir aclaracións.'],
    },
    {
      heading: 'Idiomas actualmente admitidos',
      paragraphs: ['Actualmente ANQR admite máis de 40 idiomas, incluíndo:'],
      bullets: ['Principais idiomas do mundo: inglés, chinés, español, árabe, hindi, portugués, xaponés, coreano, francés, alemán, ruso e moito máis.', 'Idiomas do sueste asiático: tailandés, vietnamita, indonesio, filipino, malaio, khmer, laosiano e birmano.', 'Idiomas do sur de Asia: hindi, tamil, telugu, bengalí, marathi, gujarati, kannada, malayalam, punjabi e nepalí.'],
    },
    {
      heading: 'Recoñecemento',
      paragraphs: ['Todos os colaboradores están acreditados no noso repositorio. O teu traballo axuda a miles de usuarios a acceder a ANQR no seu idioma preferido.', 'Grazas a todos os nosos colaboradores de tradución por axudarnos a que ANQR sexa accesible en todo o mundo!'],
    },
    {
      heading: 'Preguntas?',
      paragraphs: ['Se tes preguntas sobre a contribución de traducións, abre un problema no noso repositorio de GitHub ou ponte en contacto connosco por correo electrónico. Estamos encantados de axudarche a comezar.'],
    },
  ],
};

export default translate;
