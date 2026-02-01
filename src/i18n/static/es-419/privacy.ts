import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Política de privacidad',
  description:
    'Información ANQR recopila, cómo se utiliza, y sus derechos bajo las leyes de privacidad aplicables.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Términos de servicio', type: 'external' }],
  sections: [
    {
      heading: 'Resumen',
      paragraphs: [
        'ANQR es un generador de código QR con un enfoque cliente-primer. No necesitamos que cree una cuenta. Por defecto, los códigos QR se generan localmente en su navegador - no tenemos acceso al contenido que codifica.',
        'Para uso profesional, ANQR proporciona una API del lado del servidor que genera códigos QR desde parámetros URL. Al utilizar la API, su contenido de QR se procesa en nuestros servidores para renderizar la imagen, pero no se almacena ni se registra.',
        'Utilizamos Google AdSense para publicidad y puede usar servicios de análisis. Estos servicios recopilan información a través de cookies y tecnologías similares. Esta política explica qué datos se recopilan, cómo se utiliza y sus derechos.',
      ],
    },
    {
      heading: 'Información que recopilamos',
      bullets: [
        'Información que proporciona: Si contacta con nosotros por correo electrónico o nuestro formulario de contacto, recopilamos su nombre, dirección de correo electrónico y contenido del mensaje.',
        'Información recopilada automáticamente: Nuestro proveedor de alojamiento (Netlify), socios publicitarios y servicios de análisis pueden recopilar: dirección IP, tipo de navegador y versión, sistema operativo, tipo de dispositivo, URL de referencia, páginas visitadas, tiempo en el sitio y ubicación geográfica aproximada.',
        'Cookies de terceros: Nuestros socios publicitarios (Google AdSense) utilizan cookies y tecnologías similares para servir y medir anuncios. ANQR no establece cookies propias.',
      ],
    },
    {
      heading: 'Cookies y tecnologías de terceros',
      paragraphs: [
        'ANQR no establece cookies propias. Sus preferencias (como el modo oscuro) se almacenan localmente en su dispositivo, que no se transmite a ningún servidor.',
        'Sin embargo, nuestros socios de publicidad (Google AdSense) y proveedor de alojamiento pueden utilizar cookies y tecnologías de seguimiento similares:',
      ],
      bullets: [
        'Cookies publicitarias (de terceros): Establecer por Google AdSense y socios publicitarios para servir anuncios relevantes, medir el rendimiento de los anuncios y entender los intereses de los usuarios. Estas cookies pueden rastrear su actividad en diferentes sitios web.',
        'Cookies analíticas (tercer partido): Puede ser utilizado por nuestro proveedor de alojamiento o servicios de análisis para recopilar datos de uso anónimos.',
      ],
    },
    {
      heading: 'Google AdSense y publicidad',
      paragraphs: [
        'Mostramos anuncios a través de Google AdSense. Google y sus socios utilizan cookies para servir anuncios basados en su historial de navegación en este sitio y otros sitios web ( publicidad basada en el interés).',
        'Descubra cómo Google utiliza su información: https://policies.google.com/technologies/partner-sites',
        'Administrar la personalización de anuncios: https://adssettings.google.com',
        'Opt out via Network Advertising Initiative: https://optout.networkadvertising.org',
        'Opt out via Digital Advertising Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Cómo utilizamos la información',
      bullets: [
        'Para responder a sus preguntas y proporcionar apoyo.',
        'Para mostrar anuncios relevantes a través de nuestros socios publicitarios.',
        'Para analizar el uso del sitio y mejorar nuestros servicios.',
        'Detectar, prevenir y abordar problemas de fraude, abuso y seguridad.',
        'Para cumplir con las obligaciones legales.',
      ],
    },
    {
      heading: 'Servicios de terceros',
      bullets: [
        'Google AdSense: Recibe datos para servir y medir anuncios.',
        'Proveedores de análisis: Recibir datos de uso anónimos.',
        'Netlify (hosting): Procesa solicitudes y puede registrar direcciones IP.',
        'No vendemos su información personal. Sin embargo, compartir datos con socios publicitarios puede ser considerado como una "venta" bajo CCPA (ver abajo).',
      ],
    },
    {
      heading: 'Retención de datos',
      bullets: [
        'Comunicaciones de contacto: Hasta 2 años.',
        'Registros del servidor: Hasta 30 días (proveedor de hospedaje).',
        'Datos analíticos: Hasta 26 meses (anónimo).',
        'Cookies publicitarias: Típicamente 13 meses (varios por socio).',
      ],
    },
    {
      heading: 'Sus derechos bajo GDPR (usuarios de EEE)',
      paragraphs: [
        'Si usted está en el Espacio Económico Europeo, tiene los siguientes derechos bajo el Reglamento General de Protección de Datos:',
      ],
      bullets: [
        'Derecho de acceso: Solicite una copia de los datos personales que tenemos sobre usted.',
        'Derecho a la rectificación: Solicitar corrección de datos inexactos.',
        'Derecho a borrar: Solicitar la eliminación de sus datos ("derecho a ser olvidado").',
        'Derecho a restringir el procesamiento: Solicite límites sobre cómo utilizamos sus datos.',
        'Derecho a la portabilidad de datos: Solicite sus datos en formato portátil.',
        'Derecho a oponerse: Objeto al procesamiento, incluyendo para el marketing directo.',
        'Derecho a retirar el consentimiento: Retirar el consentimiento en cualquier momento en que el procesamiento se base en el consentimiento.',
        'Derecho a presentar una queja: Presentar una queja con su autoridad de protección de datos.',
      ],
    },
    {
      heading: 'Base jurídica del RGPD',
      paragraphs: [
        'Procesamos datos sobre estas bases: a) Consentimiento - para publicidad personalizada ( gestionada por nuestros socios publicitarios); b) Intereses legítimos - para análisis, seguridad y mejora; c) Contrato - para responder a las preguntas.',
        'Para ejercer sus derechos, comuníquese con email@anqr.link. Respondemos dentro de 30 días.',
      ],
    },
    {
      heading: 'Sus derechos bajo CCPA (usuarios de California)',
      bullets: [
        'Derecho a saber: Solicitar información sobre datos recogidos, fuentes, propósitos y terceros.',
        'Derecho a eliminar: Solicitar la supresión de su información personal.',
        'Derecho a la exclusión: Opt out of the "sale" of personal information (sharing with ad partners may eligible).',
        'Derecho a la no discriminación: No discriminaremos por ejercer sus derechos.',
      ],
    },
    {
      heading: 'Categorías de la CCPA',
      paragraphs: [
        'Categorías: Identificadores (dirección IP, ID de dispositivo), actividad de Internet (crecimiento, interacciones de anuncios), Geolocalización (aproximada), Inferencias (interés de navegación).',
        'Para ejercer derechos o optar por salir: email@anqr.link o ajustar la configuración de cookies.',
      ],
    },
    {
      heading: 'Transferencias internacionales',
      paragraphs: [
        'Su información puede ser transferida a países con diferentes leyes de protección de datos, incluidos los Estados Unidos. Utilizamos salvaguardias adecuadas como las Cláusulas Contractuales Estándar.',
      ],
    },
    {
      heading: 'Privacidad de los niños',
      paragraphs: [
        'ANQR no está dirigido a niños menores de 13 años (o 16 en el EEE). No recopilamos a sabiendas datos de niños. Póngase en contacto con email@anqr.link si cree que un niño ha proporcionado información.',
      ],
    },
    {
      heading: 'Seguridad',
      paragraphs: [
        'Utilizamos medidas técnicas y organizativas adecuadas para proteger los datos, incluyendo el cifrado HTTPS. Sin embargo, ninguna transmisión de Internet es 100% segura.',
      ],
    },
    {
      heading: 'No rastreo',
      paragraphs: [
        'No rastreamos las señales del navegador cuando sea factible, aunque los socios de publicidad no pueden responder a DNT.',
      ],
    },
    {
      heading: 'Cambios en esta política',
      paragraphs: [
        'Podemos actualizar esta política periódicamente. La fecha "Última actualización" indica la revisión más reciente. Se pueden comunicar cambios significativos a través de una pancarta del sitio.',
      ],
    },
    {
      heading: 'Contacta con nosotros',
      paragraphs: [
        'Para preguntas de privacidad o para ejercer sus derechos: email@anqr.link o utilice nuestra página de Contacto. Respondemos a las solicitudes de privacidad dentro de 30 días.',
      ],
    },
    {
      heading: 'Política de privacidad completa',
      paragraphs: [
        'Esta página proporciona un resumen de nuestras prácticas de privacidad. Para obtener la política de privacidad completa y legalmente vinculante con detalles completos sobre el procesamiento de datos, sus derechos y nuestras obligaciones según GDPR, CCPA y otras leyes de privacidad, consulte nuestra política completa alojada en iubenda.',
      ],
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
