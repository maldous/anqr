import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Términos de servicio',
  description: 'Al acceder o utilizar el sitio, usted acepta estar obligado por estos términos.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Política de privacidad', type: 'external' }],
  sections: [
    {
      heading: 'Aceptación de términos',
      paragraphs: ['Al acceder o utilizar ANQR (anqr.link), usted acepta estar obligado por estos Términos de Servicio y nuestra Política de Privacidad. Si no acepta estos términos, no utilice el sitio.', 'Podemos actualizar estos Términos de vez en cuando. El uso continuado del sitio después de los cambios constituye la aceptación de los nuevos términos.'],
    },
    {
      heading: 'Eligibilidad',
      paragraphs: ['Debe tener al menos 13 años para usar ANQR. Al utilizar el sitio, usted representa que cumple con este requisito de edad. Si usted es menor de 18 años, usted representa que tiene el permiso de su padre o tutor para utilizar el sitio.'],
    },
    {
      heading: 'Uso permitido',
      paragraphs: ['Puede usar ANQR para fines legales solamente. Usted es el único responsable del contenido que codifica en códigos QR y de cómo utiliza cualquier código QR que genera.'],
    },
    {
      heading: 'Conducta prohibida',
      paragraphs: ['Usted acepta no:'],
      bullets: ['Utilice ANQR para crear códigos QR que faciliten el phishing, distribución de malware, fraude, estafas, acoso, difamación o cualquier actividad ilegal.', 'Codificar contenido que infringe los derechos de propiedad intelectual, viola la privacidad o contiene material ilegal.', 'Intente interrumpir, sobrecargar o interferir con la operación o seguridad del sitio.', 'Ingeniero inverso, descompilado, o intentar extraer código fuente del sitio.', 'Utilice herramientas automatizadas (bots, raspadores) para acceder al sitio de una manera que degrada el rendimiento para otros usuarios.', 'Circunsta o deshabilita cualquier función de control de seguridad o acceso.', 'Hacerse pasar por cualquier persona o entidad o tergiversar su afiliación.'],
    },
    {
      heading: 'Propiedad intelectual',
      paragraphs: ['Retiene la propiedad del contenido que codifica en códigos QR. ANQR no reclama la propiedad de sus datos.', 'El nombre ANQR, logotipo, diseño de interfaz y código subyacente están protegidos por derechos de autor, marca registrada y otras leyes de propiedad intelectual. Usted no puede copiar, modificar, distribuir o crear trabajos derivados sin nuestro permiso.', 'QR Code® es una marca registrada de DENSO WAVE INCORPORATED. ANQR no está afiliado con DENSO WAVE.'],
    },
    {
      heading: 'Licencia de contenido de usuario',
      paragraphs: ['Al utilizar ANQR, no nos concede ningún derecho a su contenido. Al utilizar la generación local (por defecto), toda la generación de código QR ocurre en su navegador y no accedemos, almacenamos o transmitimos sus datos codificados.', 'Al utilizar la API del lado del servidor, su contenido se procesa para generar la imagen QR pero no se almacena, se registra o se utiliza para cualquier otro propósito más allá de renderizar la imagen solicitada.'],
    },
    {
      heading: 'Servicios de terceros y publicidad',
      paragraphs: ['El sitio muestra anuncios a través de Google AdSense y puede incluir enlaces a sitios web de terceros. No somos responsables de contenidos, servicios o prácticas de privacidad de terceros.', 'Sus interacciones con los anunciantes y terceros son solamente entre usted y ellos. Consulte nuestra Política de Privacidad para obtener información sobre las prácticas de datos publicitarios.'],
    },
    {
      heading: 'Descargo de las garantías',
      paragraphs: ['ANQR ES PROVIDADO EN UN "SAS ES" Y "SAS DISPONIBLE" BASE SIN AGUAS DE CUALQUIER CENTRO, EXPRESO O IMPLIADO, INCLUIDO PERO NO LIMITIDO A LOS AGUAS IMPLIADAS DE MERCANTABILIDAD, FITENA PARA UN PURSO PARTICULAR, Y NON-INFRACIÓN.', 'No garantizamos que: (a) el sitio será ininterrumpido, seguro o libre de errores; (b) los códigos QR escanearán en todos los entornos, en todos los dispositivos, o con todas las aplicaciones del escáner; (c) el sitio cumplirá sus requisitos.', 'Siempre debe probar códigos QR en las condiciones en las que se utilizarán (tamaño de impresión, iluminación, tipo de pantalla, distancia, calidad de cámara).'],
    },
    {
      heading: 'Limitación de la responsabilidad',
      paragraphs: ['EL MAXIMUM EXTENT PERMITTED BY LAW, ANQR AND ITS OPERATORS, AFFILIATES, AND LICENSORS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES.', 'SUPONGO QUE NO ENTIENDE QUE SU USO DE LA SERVICIA ESTÉ EN SU CARRERA. LA SERVICIOS ES PROVISTA DE CORTESÍA, Y DE ACUERDO, USTED AFIRMA QUE LOS ANQR Y SUS AGENTES NO TIENEN NADA QUE VER CON USTED LO QUE SEA POR CUALQUIER IMAGEN O PÉRDIDA. EN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY EXCEED ZERO DOLLARS ($0 AUD).', 'USTED SE COMPROMETE A RELACIONAR, ESPERAR, Y DESENMASCARAR CUALQUIER COSA Y TODAS LAS REGLAS, DEMANDOS, Y CAUSOS DE ACCIÓN CONTRA ANQR Y SUS OPERATORES DESPUÉS DE SU UTILIZACIÓN DE LA SERVICIO.', 'ALGUNAS JERICÓDICIУN NO TODA LA EXCLUSIÓN DE LAS ARMAS CIERTAS O LIMITACIONES DE LA LIABILIDAD. EN SUCH JURISDICTIONS, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.'],
    },
    {
      heading: 'Indemnización',
      paragraphs: ['Usted acepta indemnizar, defender y mantener ANQR inofensivo, sus operadores, afiliados, y sus respectivos funcionarios, directores, empleados y agentes de cualquier reclamación, daños, pérdidas, pasivos, costos y gastos (incluyendo honorarios legales) derivados de: (a) su uso del sitio; (b) su violación de estos Términos; (c) su violación de cualquier derecho de terceros; (d) cualquier contenido que codifica en.'],
    },
    {
      heading: 'Resolución de controversias',
      paragraphs: ['Cualquier disputa que surja de estos Términos o su uso de ANQR se tratará primero de resolverse mediante negociación informal contactando a email@anqr.link.', 'Si la resolución informal fracasa, las controversias se resolverán mediante un arbitraje vinculante en Victoria (Australia), salvo que cualquiera de las partes pueda solicitar un recurso judicial por violaciones de la propiedad intelectual.'],
    },
    {
      heading: 'Exención de acción de clase',
      paragraphs: ['A LA EXTENTE PERMITADA POR DERECHO, USTED AFIRMA QUE CUALQUIER MEDIDA DE RESOLUCIÓN DESACTIVADA SERÁ REALIZADA SOLAMENTE EN UN BASE INDIVIDUAL Y NO EN UNA CLASE, CONSAGRADO, O ACCIÓN REPETITIVA.'],
    },
    {
      heading: 'Derecho rector',
      paragraphs: ['Estos Términos se rigen por las leyes de Victoria, Australia, sin tener en cuenta los principios de conflicto de leyes. Usted acepta la jurisdicción exclusiva de los tribunales ubicados en Victoria, Australia.'],
    },
    {
      heading: 'Cambios y disponibilidad',
      paragraphs: ['Podemos modificar, suspender o interrumpir el sitio (o cualquier parte de él) en cualquier momento sin previo aviso o responsabilidad.', 'Podemos actualizar estos Términos en cualquier momento. La fecha "Última actualización" indica cuando fueron revisados más recientemente. El uso continuado después de los cambios constituye aceptación.'],
    },
    {
      heading: 'Severability',
      paragraphs: ['Si alguna disposición de estos Términos se considera inválida o inaplicable, esa disposición se aplicará en la mayor medida posible y las disposiciones restantes seguirán siendo plenamente efectivas.'],
    },
    {
      heading: 'Waiver',
      paragraphs: ['Nuestro incumplimiento de cualquier derecho o disposición de estos Términos no se considerará una renuncia a dicho derecho o disposición.'],
    },
    {
      heading: 'Acuerdo total',
      paragraphs: ['Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y ANQR con respecto a su uso del sitio y superan cualquier acuerdo previo.'],
    },
    {
      heading: 'Fuerza mayor',
      paragraphs: ['No seremos responsables por ningún fracaso o retraso en el desempeño debido a circunstancias ajenas a nuestro control razonable, incluidos los desastres naturales, la guerra, el terrorismo, los disturbios, las acciones del gobierno o los fallos de Internet/infraestructura.'],
    },
    {
      heading: 'Contacto',
      paragraphs: ['Preguntas sobre estas Los términos se pueden enviar a: email@anqr.link'],
    },
  ],
};

export default terms;
