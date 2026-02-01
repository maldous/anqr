import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contáctenos',
  description: 'Damos la bienvenida a los comentarios, informes de fallos, peticiones de características y preguntas generales.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Cómo llegar a nosotros',
      paragraphs: ['Ofrecemos varias maneras de contactarnos dependiendo de sus necesidades. Leemos cada mensaje, aunque los tiempos de respuesta pueden variar según el volumen y el tipo de investigación.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Para todas las consultas: email@anqr.link', 'Esta es la forma más fiable de llegar a nosotros y se recomienda para preguntas detalladas, preguntas empresariales o cualquier otra investigación.'],
    },
    {
      heading: 'Tipos de consultas',
      bullets: ['Cuestiones generales: Preguntas sobre cómo utilizar ANQR, explicaciones de características o comentarios generales.', 'Informes de errores: Por favor incluya su navegador, sistema operativo, pasos para reproducir y cualquier mensaje de error que vea.', 'Solicitudes de tarifas: Sugerencias para nuevas características o mejoras. Consideramos todas las solicitudes aunque no podemos prometer aplicación.', 'Consultas empresariales: Oportunidades de asociación, cuestiones de concesión de licencias o solicitudes de uso comercial.', 'Solicitudes de privacidad: Solicitudes de ejercicio de sus derechos de privacidad en virtud del RGPD, CCPA u otras leyes de privacidad (véase Política de privacidad).', 'DMCA/Copyright: Véase la sección DMCA a continuación para los requisitos de aviso de retiro.'],
    },
    {
      heading: 'Tiempos de respuesta',
      paragraphs: ['Nos proponemos responder a las preguntas dentro de 5-7 días hábiles. Las solicitudes relacionadas con la privacidad se atenderán dentro de los 30 días previstos por la ley.', 'Durante períodos ocupados, los tiempos de respuesta pueden ser más largos. Para asuntos urgentes, indique "URGENT" en su línea de asunto.'],
    },
    {
      heading: 'Antes de contactarnos',
      paragraphs: ['Por favor, compruebe nuestra página de documentación para respuestas a preguntas comunes sobre cómo utilizar las características de ANQR. Hay muchas preguntas sobre la generación de código QR, el estilo y las opciones de exportación.'],
    },
    {
      heading: 'DMCA Avisos de derechos de autor',
      paragraphs: ['Si cree que el contenido disponible en ANQR infringe sus derechos de autor, puede presentar un aviso de retiro de la Ley de Derechos de Autor del Milenio (DMCA). Para ser válido, su aviso debe incluir:'],
      bullets: ['Una firma física o electrónica del propietario del copyright o agente autorizado.', 'Identificación del trabajo con derechos de autor alegado haber sido infringido.', 'Identificación del material que se afirma que está infringiendo, con información suficiente para localizarlo.', 'Su información de contacto (dirección, número de teléfono y dirección de correo electrónico).', 'Una declaración de que usted tiene una creencia de buena fe que el uso del material no es autorizado por el propietario del copyright.', 'Una declaración, bajo pena de perjurio, que la información en su aviso es exacta y que usted es el propietario de los derechos de autor o autorizado para actuar en su nombre.'],
    },
    {
      heading: 'DMCA Contacto',
      paragraphs: ['Enviar avisos de DMCA a: email@anqr.link', 'Por favor incluya "Notificación DMCA" en la línea de asunto. Responderemos a avisos válidos de acuerdo con la ley aplicable. Tenga en cuenta que ANQR genera códigos QR localmente en dispositivos de usuarios y no alberga contenido generado por el usuario.'],
    },
    {
      heading: 'Comunidad Reddit',
      paragraphs: ['Únase a nuestra comunidad de Reddit en r/ANQR para compartir sus creaciones QR, hacer preguntas, obtener ayuda y conectarse con otros usuarios de ANQR.'],
    },
  ],
};

export default contact;
