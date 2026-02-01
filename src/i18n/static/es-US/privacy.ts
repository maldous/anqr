import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: 'Política de privacidad',
  description: 'Información que ANQR recopila, cómo se utiliza y sus derechos según las leyes de privacidad aplicables.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Términos de servicio', type: 'external' }],
  sections: [
    {
      heading: 'Resumen',
      paragraphs: ['ANQR es un generador de códigos QR con un enfoque centrado en el cliente. No requerimos que cree una cuenta. De forma predeterminada, los códigos QR se generan localmente en su navegador; no tenemos acceso al contenido que usted codifica.', 'Para uso profesional, ANQR proporciona una API del lado del servidor que genera códigos QR a partir de parámetros de URL. Cuando utiliza la API, su contenido QR se procesa en nuestros servidores para representar la imagen, pero no se almacena ni se registra.', 'Utilizamos Google AdSense para publicidad y podemos utilizar servicios de análisis. Estos servicios recopilan información a través de cookies y tecnologías similares. Esta política explica qué datos se recopilan, cómo se utilizan y sus derechos.'],
    },
    {
      heading: 'Información que recopilamos',
      bullets: ['Información que usted proporciona: si se comunica con nosotros por correo electrónico o mediante nuestro formulario de contacto, recopilamos su nombre, dirección de correo electrónico y contenido del mensaje.', 'Información recopilada automáticamente: nuestro proveedor de alojamiento (Netlify), socios publicitarios y servicios de análisis pueden recopilar: dirección IP, tipo y versión del navegador, sistema operativo, tipo de dispositivo, URL de referencia, páginas visitadas, tiempo en el sitio y ubicación geográfica aproximada.', 'Cookies de terceros: nuestros socios publicitarios (Google AdSense) utilizan cookies y tecnologías similares para publicar y medir anuncios. ANQR en sí no establece cookies de origen.'],
    },
    {
      heading: 'Cookies y tecnologías de terceros',
      paragraphs: ['ANQR no establece ninguna cookie de origen. Sus preferencias (como el modo oscuro) se almacenan localmente en su dispositivo y no se transmiten a ningún servidor.', 'Sin embargo, nuestros socios publicitarios (Google AdSense) y nuestro proveedor de alojamiento pueden utilizar cookies y tecnologías de seguimiento similares:'],
      bullets: ['Cookies publicitarias (de terceros): establecidas por Google AdSense y socios publicitarios para publicar anuncios relevantes, medir el rendimiento de los anuncios y comprender los intereses de los usuarios. Estas cookies pueden rastrear su actividad en diferentes sitios web.', 'Cookies de análisis (de terceros): pueden ser utilizadas por nuestro proveedor de alojamiento o servicios de análisis para recopilar datos de uso anónimos.'],
    },
    {
      heading: 'Google AdSense y publicidad',
      paragraphs: ['Mostramos anuncios a través de Google AdSense. Google y sus socios utilizan cookies para publicar anuncios basados ​​en su historial de navegación en este sitio y otros sitios web (publicidad basada en intereses).', 'Descubra cómo Google utiliza su información: https://policies.google.com/technologies/partner-sites', 'Administrar la personalización de anuncios: https://adssettings.google.com', 'Opte por no participar a través de la Iniciativa de publicidad en red: https://optout.networkadvertising.org', 'Optar por no participar a través de Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Cómo utilizamos la información',
      bullets: ['Para responder a sus consultas y brindarle apoyo.', 'Para mostrar anuncios relevantes a través de nuestros socios publicitarios.', 'Analizar el uso del sitio y mejorar nuestros servicios.', 'Detectar, prevenir y abordar fraudes, abusos y problemas de seguridad.', 'Para cumplir con obligaciones legales.'],
    },
    {
      heading: 'Servicios de terceros',
      bullets: ['Google AdSense: recibe datos para publicar y medir anuncios.', 'Proveedores de análisis: reciba datos de uso anónimos.', 'Netlify (alojamiento): Procesa solicitudes y puede registrar direcciones IP.', 'No vendemos su información personal. Sin embargo, compartir datos con socios publicitarios puede considerarse una "venta" según la CCPA (ver más abajo).'],
    },
    {
      heading: 'Retención de datos',
      bullets: ['Envíos de contactos: Hasta 2 años.', 'Registros del servidor: hasta 30 días (proveedor de hosting).', 'Datos analíticos: Hasta 26 meses (anonimizados).', 'Cookies publicitarias: normalmente 13 meses (varía según el socio).'],
    },
    {
      heading: 'Sus derechos según el RGPD (usuarios del EEE)',
      paragraphs: ['Si se encuentra en el Espacio Económico Europeo, tiene los siguientes derechos según el Reglamento General de Protección de Datos:'],
      bullets: ['Derecho de acceso: Solicitar una copia de los datos personales que tenemos sobre usted.', 'Derecho de rectificación: Solicitar la corrección de los datos inexactos.', 'Derecho de supresión: Solicitar la supresión de tus datos ("derecho al olvido").', 'Derecho a restringir el procesamiento: Solicitar límites sobre cómo utilizamos sus datos.', 'Derecho a la portabilidad de los datos: Solicitar tus datos en un formato portátil.', 'Derecho de oposición: Oponerse al procesamiento, incluso para marketing directo.', 'Derecho a retirar el consentimiento: Retirar el consentimiento en cualquier momento cuando el procesamiento se base en el consentimiento.', 'Derecho a presentar una reclamación: Presentar una reclamación ante su autoridad de protección de datos.'],
    },
    {
      heading: 'Base jurídica del RGPD',
      paragraphs: ['Procesamos datos sobre estas bases: (a) Consentimiento: para publicidad personalizada (administrada por nuestros socios publicitarios); (b) Intereses legítimos: para análisis, seguridad y mejora; (c) Contrato - para responder a consultas.', 'Para ejercer sus derechos, póngase en contacto con email@anqr.link. Respondemos en un plazo de 30 días.'],
    },
    {
      heading: 'Sus derechos según la CCPA (usuarios de California)',
      bullets: ['Derecho a saber: Solicitar información sobre los datos recabados, fuentes, finalidades y terceros.', 'Derecho de eliminación: Solicitar la eliminación de su información personal.', 'Derecho a excluirse: optar por no participar en la "venta" de información personal (compartirla con socios publicitarios puede calificar).', 'Derecho a la no discriminación: No discriminaremos por ejercer tus derechos.'],
    },
    {
      heading: 'Categorías CCPA recopiladas',
      paragraphs: ['Categorías: Identificadores (dirección IP, ID del dispositivo), Actividad de Internet (navegación, interacciones con anuncios), Geolocalización (aproximada), Inferencias (intereses de la navegación).', 'Para ejercer derechos o cancelar su suscripción: email@anqr.link o ajustar la configuración de cookies.'],
    },
    {
      heading: 'Transferencias internacionales',
      paragraphs: ['Su información puede transferirse a países con diferentes leyes de protección de datos, incluido Estados Unidos. Utilizamos salvaguardias adecuadas, como las cláusulas contractuales estándar.'],
    },
    {
      heading: 'privacidad de los niños',
      paragraphs: ['ANQR no está dirigido a niños menores de 13 años (o 16 en el EEE). No recopilamos conscientemente datos de niños. Comuníquese con email@anqr.link si cree que un niño ha proporcionado información.'],
    },
    {
      heading: 'Seguridad',
      paragraphs: ['Utilizamos medidas técnicas y organizativas adecuadas para proteger los datos, incluido el cifrado HTTPS. Sin embargo, ninguna transmisión por Internet es 100% segura.'],
    },
    {
      heading: 'No rastrear',
      paragraphs: ['Respetamos las señales de No rastrear del navegador siempre que sea posible, aunque es posible que los socios publicitarios no respondan al DNT.'],
    },
    {
      heading: 'Cambios a esta política',
      paragraphs: ['Podemos actualizar esta política periódicamente. La fecha de "Última actualización" indica la revisión más reciente. Los cambios significativos pueden comunicarse a través de un banner del sitio.'],
    },
    {
      heading: 'Contáctenos',
      paragraphs: ['Para preguntas sobre privacidad o para ejercer sus derechos: email@anqr.link o utilice nuestra página de Contacto. Respondemos a las solicitudes de privacidad dentro de los 30 días.'],
    },
    {
      heading: 'Política de privacidad completa',
      paragraphs: ['Esta página proporciona un resumen de nuestras prácticas de privacidad. Para obtener la política de privacidad completa y legalmente vinculante con detalles completos sobre el procesamiento de datos, sus derechos y nuestras obligaciones según GDPR, CCPA y otras leyes de privacidad, consulte nuestra política completa alojada en iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Ver la política de privacidad completa en iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
