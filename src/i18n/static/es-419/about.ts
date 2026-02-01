import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Acerca de ANQR',
  description: 'ANQR es un generador gratuito de código QR con un enfoque cliente primero - generar códigos QR localmente o utilizar nuestra API para incrustar.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Buscar artículos de aprendizaje', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Política de privacidad', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Términos de servicio', type: 'external' },
  ],
  sections: [
    {
      heading: '¿Qué es ANQR?',
      paragraphs: ['ANQR (pronunciado "anchor") es un generador gratuito de código QR que crea códigos escandalosos para URLs, texto, credenciales Wi-Fi, tarjetas de contacto, eventos calendario y más.', 'Se construye para individuos, pequeñas empresas, marketers y desarrolladores que quieren poderosas herramientas de QR sin registrarse. El primer diseño del cliente significa que los códigos QR se generan localmente en su navegador por defecto, con una API de servidor opcional para la integración e integración profesional.'],
    },
    {
      heading: 'Características clave',
      bullets: ['Generar códigos QR al instante en su navegador - ninguna cuenta requerida.', 'Personalice los colores, los estilos de módulos, los patrones de búsqueda, y agregue las superposiciones de imagen.', 'Exportar en múltiples formatos: PNG, SVG, WebP y GIF animado.', 'Controles avanzados para el nivel de corrección de errores, versión QR, modo de codificación y selección de máscaras.', 'Guía de seguridad del escáner y vista previa en vivo para ayudar a mantener los códigos legibles en impresión y en pantallas.', 'API lado del servidor para incrustación profesional con soporte de parámetro completo.', 'Funciona sin conexión una vez cargado - es una aplicación web estática que puede ejecutar en cualquier lugar.'],
    },
    {
      heading: 'Cómo funciona ANQR',
      paragraphs: ['ANQR se ejecuta en su navegador y codifica su entrada en una matriz QR estándar con la corrección de error Reed-Solomon, y luego lo convierte en el formato que elija.', 'Por defecto, la generación ocurre localmente en su navegador. Para uso profesional, también puede utilizar la API lado servidor para generar códigos QR a través de parámetros de URL - perfecto para incrustar en sitios web, correos electrónicos o flujos de trabajo automatizados.', 'Cuando se agregan superposiciones o animaciones, ANQR equilibra el estilo con la fiabilidad del escaneo por lo que el resultado sigue siendo escandaloso.', 'ANQR se centra en códigos estáticos (los datos están dentro del QR). Si necesita un código dinámico (destino editable), puede codificar su propia URL de redireccion o enlace corto.'],
    },
    {
      heading: '¿Quién opera ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Publicidad y cómo nos mantenemos libres',
      paragraphs: ['ANQR es libre de uso y es apoyado por la publicidad. Podemos mostrar anuncios a través de Google AdSense y/o otros socios de publicidad.', 'Los proveedores de anuncios pueden utilizar cookies o tecnologías similares para personalizar anuncios basados en sus intereses y actividad de navegación. Puede gestionar las preferencias de anuncios en la configuración de su dispositivo y a través de la configuración de anuncios de Google, y aprender más en nuestra Política de Privacidad.', 'No vendemos el contenido que codifica en códigos QR. Los anuncios ayudan a cubrir el costo de ejecutar y mejorar el proyecto.'],
    },
    {
      heading: 'Normas abiertas',
      paragraphs: ['ANQR genera códigos QR basados en el estándar ISO/IEC 18004 y busca una amplia compatibilidad entre escáneres, cámaras y flujos de trabajo de impresión.'],
    },
    {
      heading: 'Nota de marca registrada',
      paragraphs: ['QR Code® es una marca registrada de DENSO WAVE INCORPORATED. ANQR no está afiliado, respaldado por, o patrocinado por DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Comentarios y contribuciones',
      paragraphs: ['Damos la bienvenida a comentarios, informes de fallos y sugerencias de características. Por favor póngase en contacto a través de correo electrónico o la página de contacto - leemos cada mensaje, aunque los tiempos de respuesta pueden variar.'],
    },
  ],
};

export default about;
