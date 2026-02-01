import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contáctenos',
  description: 'Agradecemos comentarios, informes de errores, solicitudes de funciones y consultas generales.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Cómo llegar a nosotros',
      paragraphs: ['Ofrecemos varias formas de contactarnos dependiendo de sus necesidades. Leemos todos los mensajes, aunque los tiempos de respuesta pueden variar según el volumen y el tipo de consulta.'],
    },
    {
      heading: 'Correo electrónico',
      paragraphs: ['Para todas las consultas: email@anqr.link', 'Esta es la forma más confiable de comunicarse con nosotros y se recomienda para preguntas detalladas, consultas comerciales o cualquier otra consulta.'],
    },
    {
      heading: 'Tipos de consultas',
      bullets: ['Preguntas generales: preguntas sobre cómo utilizar ANQR, explicaciones de funciones o comentarios generales.', 'Informes de errores: incluya su navegador, sistema operativo, pasos para reproducirlo y cualquier mensaje de error que vea.', 'Solicitudes de funciones: sugerencias de nuevas funciones o mejoras. Consideramos todas las solicitudes, aunque no podemos prometer su implementación.', 'Consultas comerciales: oportunidades de asociación, preguntas sobre licencias o consultas sobre uso comercial.', 'Solicitudes de privacidad: solicitudes para ejercer sus derechos de privacidad según GDPR, CCPA u otras leyes de privacidad (consulte Política de privacidad).', 'DMCA/Derechos de autor: consulte la sección DMCA a continuación para conocer los requisitos de aviso de eliminación.'],
    },
    {
      heading: 'Tiempos de respuesta',
      paragraphs: ['Nuestro objetivo es responder a las consultas dentro de 5 a 7 días hábiles. Las solicitudes relacionadas con la privacidad se atenderán dentro de los 30 días según lo exige la ley.', 'Durante los períodos de mayor actividad, los tiempos de respuesta pueden ser más largos. Para asuntos urgentes, indique "URGENTE" en su línea de asunto.'],
    },
    {
      heading: 'Antes de contactarnos',
      paragraphs: ['Consulte nuestra página de documentación para obtener respuestas a preguntas comunes sobre cómo utilizar las funciones ANQR. Allí se tratan muchas preguntas sobre las opciones de generación, estilo y exportación de códigos QR.'],
    },
    {
      heading: 'Avisos de derechos de autor de la DMCA',
      paragraphs: ['Si cree que el contenido disponible en ANQR infringe sus derechos de autor, puede enviar un aviso de eliminación de la Ley de derechos de autor del milenio digital (DMCA). Para ser válido, su aviso debe incluir:'],
      bullets: ['Una firma física o electrónica del propietario de los derechos de autor o del agente autorizado.', 'Identificación de la obra protegida por derechos de autor que se alega ha sido infringida.', 'Identificación del material que se alega infractor, con información suficiente para localizarlo.', 'Su información de contacto (dirección, número de teléfono y dirección de correo electrónico).', 'Una declaración de que usted cree de buena fe que el uso del material no está autorizado por el propietario de los derechos de autor.', 'Una declaración, bajo pena de perjurio, de que la información contenida en su aviso es precisa y que usted es el propietario de los derechos de autor o está autorizado a actuar en su nombre.'],
    },
    {
      heading: 'Contacto DMCA',
      paragraphs: ['Envíe avisos de DMCA a: email@anqr.link', 'Incluya "Aviso DMCA" en la línea de asunto. Responderemos a los avisos válidos de acuerdo con la ley aplicable. Tenga en cuenta que ANQR genera códigos QR localmente en los dispositivos de los usuarios y no aloja contenido generado por el usuario.'],
    },
    {
      heading: 'Comunidad Reddit',
      paragraphs: ['Únase a nuestra comunidad de Reddit en r/ANQR para compartir sus creaciones QR, hacer preguntas, obtener ayuda y conectarse con otros usuarios de ANQR.'],
    },
  ],
};

export default contact;
