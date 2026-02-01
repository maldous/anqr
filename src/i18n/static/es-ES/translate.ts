import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Ayuda a Traducir ANQR',
  description: 'Únete a nuestra comunidad de traductores ayudando a que ANQR sea accesible a usuarios de todo el mundo. No se requiere experiencia de codificación - contribuir directamente desde su navegador.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Repositorio de traducción abierta', type: 'external' },
    { href: '/?lang=${lang}', label: 'Abra el Generador', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Acerca de ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contáctenos', type: 'external' },
  ],
  sections: [
    {
      heading: '¿Por qué Gentileza?',
      paragraphs: ['ANQR es utilizado por personas de todo el mundo para crear códigos QR para empresas, eventos, pagos y proyectos personales. Al contribuir a las traducciones, ayuda a que esta poderosa herramienta sea accesible a los usuarios que prefieren su idioma nativo.', 'Cada contribución de traducción - ya sea la fijación de un tipo o la traducción de un idioma entero - hace una diferencia real para los usuarios en su comunidad.'],
    },
    {
      heading: '¿Qué puedes traducir?',
      paragraphs: ['ANQR tiene dos tipos de contenido translatable:'],
      bullets: ['UI Strings: Etiquetas de botones, elementos de menú, tooltips y texto de interfaz que aparece en toda la aplicación.', 'Contenido Estatico: páginas de documentación que incluyen guías, ejemplos, política de privacidad y artículos de ayuda.', 'Ambos tipos se almacenan como archivos de texto simples que puede editar directamente en su navegador - ningún software especial necesario.', 'Las traducciones se revisan antes de fusionarse para garantizar la calidad y la coherencia.'],
    },
    {
      heading: 'Cómo contribuir',
      paragraphs: ['Contribuir es fácil y no requiere ningún conocimiento Git:'],
      bullets: ['Visita nuestro repositorio de traducción pública en GitHub.', 'Encuentre su archivo de idioma (o cree uno nuevo si su idioma aún no está soportado).', 'Haga clic en el icono del lápiz para editar directamente en su navegador.', 'Haga sus cambios y haga clic en "Proponer cambios" - GitHub creará automáticamente una solicitud de tirado.', 'Su contribución será revisada y fusionada, normalmente dentro de unos pocos días.'],
    },
    {
      heading: 'Directrices de traducción',
      paragraphs: ['Al traducir, por favor mantenga los marcadores de posición como {name}_, {count}, y {{variable}}_ sin cambios - estos son reemplazados por valores dinámicos en tiempo de ejecución. Conservar también cualquier sintaxis tipo HTML, como enlaces en el formato [[/path WordPressLabel]].', 'Si usted no está seguro acerca de una traducción, es mejor dejarlo en inglés que proporcionar una traducción incorrecta. También puede abrir una cuestión sobre GitHub para pedir aclaraciones.'],
    },
    {
      heading: 'Idiomas actualmente apoyados',
      paragraphs: ['ANQR actualmente soporta más de 40 idiomas, incluyendo:'],
      bullets: ['Principales idiomas: inglés, chino, español, árabe, hindi, portugués, japonés, coreano, francés, alemán, ruso y más.', 'Idiomas del sudeste asiático: tailandés, vietnamita, indonesio, filipino, malayo, khmer, lao, birmano.', 'Idiomas del Asia meridional: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Reconocimiento',
      paragraphs: ['Todos los contribuyentes se acreditan en nuestro repositorio. Su trabajo ayuda a miles de usuarios a acceder a ANQR en su idioma preferido.', 'Gracias a todos nuestros colaboradores de la traducción por ayudar a que ANQR sea accesible en todo el mundo!'],
    },
    {
      heading: '¿Preguntas?',
      paragraphs: ['Si tiene preguntas sobre la contribución de las traducciones, por favor abra un problema en nuestro repositorio GitHub o contáctenos por correo electrónico. Estamos felices de ayudarte a empezar.'],
    },
  ],
};

export default translate;
