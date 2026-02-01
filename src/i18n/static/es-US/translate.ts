import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Ayuda a traducir ANQR',
  description: 'Únase a nuestra comunidad de traductores que ayudan a que ANQR sea accesible para usuarios de todo el mundo. No se requiere experiencia en codificación: contribuya directamente desde su navegador.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Repositorio de traducción abierto', type: 'external' },
    { href: '/?lang=${lang}', label: 'Abrir el generador', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Acerca de ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contáctenos', type: 'external' },
  ],
  sections: [
    {
      heading: '¿Por qué contribuir?',
      paragraphs: ['ANQR es utilizado por personas de todo el mundo para crear códigos QR para empresas, eventos, pagos y proyectos personales. Al contribuir con traducciones, ayudas a que esta poderosa herramienta sea accesible para los usuarios que prefieren su idioma nativo.', 'Cada contribución de traducción, ya sea corregir un error tipográfico o traducir un idioma completo, marca una diferencia real para los usuarios de su comunidad.'],
    },
    {
      heading: '¿Qué puedes traducir?',
      paragraphs: ['ANQR tiene dos tipos de contenido traducible:'],
      bullets: ['Cadenas de interfaz de usuario: etiquetas de botones, elementos de menú, información sobre herramientas y texto de interfaz que aparece en toda la aplicación.', 'Contenido estático: páginas de documentación que incluyen guías, ejemplos, política de privacidad y artículos de ayuda.', 'Ambos tipos se almacenan como archivos de texto simples que puedes editar directamente en tu navegador, sin necesidad de software especial.', 'Las traducciones se revisan antes de fusionarlas para garantizar la calidad y la coherencia.'],
    },
    {
      heading: 'Cómo contribuir',
      paragraphs: ['Contribuir es fácil y no requiere conocimientos de Git:'],
      bullets: ['Visite nuestro repositorio de traducción público en GitHub.', 'Busque su archivo de idioma (o cree uno nuevo si su idioma aún no es compatible).', 'Haga clic en el ícono de lápiz para editar directamente en su navegador.', 'Realice sus cambios y haga clic en "Proponer cambios". GitHub creará automáticamente una solicitud de extracción.', 'Su contribución será revisada y fusionada, normalmente dentro de unos días.'],
    },
    {
      heading: 'Directrices de traducción',
      paragraphs: ['Al traducir, mantenga los marcadores de posición como {name}, {count} y {{variable}} sin cambios; estos se reemplazan con valores dinámicos en tiempo de ejecución. Conserve también cualquier sintaxis similar a HTML, como enlaces en el formato [[/path|Label]].', 'Si no está seguro de una traducción, es mejor dejarla en inglés que proporcionar una traducción incorrecta. También puedes abrir un problema en GitHub para solicitar una aclaración.'],
    },
    {
      heading: 'Idiomas actualmente admitidos',
      paragraphs: ['ANQR actualmente admite más de 40 idiomas, incluidos:'],
      bullets: ['Principales idiomas del mundo: inglés, chino, español, árabe, hindi, portugués, japonés, coreano, francés, alemán, ruso y más.', 'Idiomas del sudeste asiático: tailandés, vietnamita, indonesio, filipino, malayo, jemer, laosiano, birmano.', 'Idiomas del sur de Asia: hindi, tamil, telugu, bengalí, marathi, gujarati, kannada, malayalam, punjabi, nepalí.'],
    },
    {
      heading: 'Reconocimiento',
      paragraphs: ['Todos los contribuyentes están acreditados en nuestro repositorio. Su trabajo ayuda a miles de usuarios a acceder a ANQR en su idioma preferido.', '¡Gracias a todos nuestros colaboradores de traducción por ayudar a que ANQR sea accesible en todo el mundo!'],
    },
    {
      heading: '¿Preguntas?',
      paragraphs: ['Si tiene preguntas sobre cómo contribuir con traducciones, abra una incidencia en nuestro repositorio de GitHub o contáctenos por correo electrónico. Estaremos encantados de ayudarle a empezar.'],
    },
  ],
};

export default translate;
