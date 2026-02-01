import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const about: PageDefinition = {
  title: 'Acerca de ANQR',
  description:
    'ANQR es un generador de códigos QR gratuito con un enfoque centrado en el cliente: genere códigos QR localmente o utilice nuestra API para incrustarlos.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'abre el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explorar artículos de aprendizaje', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Política de privacidad', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Términos de servicio', type: 'external' },
  ],
  sections: [
    {
      heading: '¿Qué es ANQR?',
      paragraphs: [
        'ANQR (pronunciado "ancla") es un generador de códigos QR gratuito que crea códigos escaneables para URL, texto, credenciales de Wi-Fi, tarjetas de contacto, eventos de calendario y más.',
        'Está diseñado para individuos, pequeñas empresas, especialistas en marketing y desarrolladores que desean potentes herramientas QR sin necesidad de registrarse. El diseño centrado en el cliente significa que los códigos QR se generan localmente en su navegador de forma predeterminada, con una API de servidor opcional para incrustación e integración profesionales.',
      ],
    },
    {
      heading: 'Características clave',
      bullets: [
        'Genere códigos QR instantáneamente en su navegador, no se requiere una cuenta.',
        'Personalice colores, estilos de módulos, patrones de buscador y agregue superposiciones de imágenes.',
        'Exporte en múltiples formatos: PNG, SVG, WebP y GIF animado.',
        'Controles avanzados para el nivel de corrección de errores, versión QR, modo de codificación y selección de máscara.',
        'Guía de seguridad de escaneo y vista previa en vivo para ayudar a mantener los códigos legibles impresos y en las pantallas.',
        'API del lado del servidor para integración profesional con soporte completo de parámetros.',
        'Funciona sin conexión una vez cargada: es una aplicación web estática que puedes ejecutar en cualquier lugar.',
      ],
    },
    {
      heading: 'Cómo funciona ANQR',
      paragraphs: [
        'ANQR se ejecuta en su navegador y codifica su entrada en una matriz QR estándar con corrección de errores Reed-Solomon, luego la representa en el formato que elija.',
        'De forma predeterminada, la generación ocurre localmente en su navegador. Para uso profesional, también puede utilizar la API del lado del servidor para generar códigos QR a través de parámetros de URL, perfecto para insertar en sitios web, correos electrónicos o flujos de trabajo automatizados.',
        'Cuando agrega superposiciones o animaciones, ANQR equilibra el estilo con la confiabilidad del escaneo para que el resultado siga siendo escaneable.',
        'ANQR se centra en códigos estáticos (los datos están dentro del QR). Si necesita un código dinámico (destino editable), puede codificar su propia URL de redireccionamiento o enlace corto.',
      ],
    },
    {
      heading: '¿Quién opera ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Publicidad y cómo nos mantenemos libres',
      paragraphs: [
        'ANQR es de uso gratuito y está respaldado por publicidad. Podemos mostrar anuncios a través de Google AdSense y/u otros socios publicitarios.',
        'Los proveedores de publicidad pueden utilizar cookies o tecnologías similares para personalizar anuncios según sus intereses y actividad de navegación. Puede administrar las preferencias de anuncios en la configuración de su dispositivo y a través de la configuración de anuncios de Google, y obtener más información en nuestra Política de privacidad.',
        'No vendemos el contenido que usted codifica en códigos QR. Los anuncios ayudan a cubrir el costo de ejecutar y mejorar el proyecto.',
      ],
    },
    {
      heading: 'Estándares abiertos',
      paragraphs: [
        'ANQR genera códigos QR basados en el estándar ISO/IEC 18004 y apunta a una amplia compatibilidad entre escáneres, cámaras y flujos de trabajo de impresión.',
      ],
    },
    {
      heading: 'aviso de marca registrada',
      paragraphs: [
        'QR Code® es una marca registrada de DENSO WAVE INCORPORATED. ANQR no está afiliado, respaldado ni patrocinado por DENSO WAVE INCORPORATED.',
      ],
    },
    {
      heading: 'Comentarios y contribuciones',
      paragraphs: [
        'Agradecemos comentarios, informes de errores y sugerencias de funciones. Póngase en contacto por correo electrónico o a través de la página de contacto; leemos todos los mensajes, aunque los tiempos de respuesta pueden variar.',
      ],
    },
  ],
};

export default about;
