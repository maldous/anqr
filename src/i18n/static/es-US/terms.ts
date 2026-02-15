import type { PageDefinition } from '../types';

export const terms: PageDefinition = {
  title: 'Términos de servicio',
  description: 'Al acceder o utilizar el sitio, usted acepta estar sujeto a estos términos.',
  lastUpdated: '1 de febrero de 2026',
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Política de privacidad', type: 'external' },
  ],
  sections: [
    {
      heading: 'Aceptación de términos',
      paragraphs: [
        'Al acceder o utilizar ANQR (anqr.link), usted acepta estar sujeto a estos Términos de servicio y nuestra Política de privacidad. Si no está de acuerdo con estos términos, no utilice el sitio.',
        'Podemos actualizar estos Términos de vez en cuando. El uso continuo del sitio después de los cambios constituye la aceptación de los nuevos términos.',
      ],
    },
    {
      heading: 'Elegibilidad',
      paragraphs: [
        'Debes tener al menos 13 años para utilizar ANQR. Al utilizar el sitio, usted declara que cumple con este requisito de edad. Si es menor de 18 años, declara que tiene el permiso de sus padres o tutores para utilizar el sitio.',
      ],
    },
    {
      heading: 'Uso permitido',
      paragraphs: [
        'Puede utilizar ANQR únicamente con fines legales. Usted es el único responsable del contenido que codifica en códigos QR y de cómo utiliza los códigos QR que genera.',
      ],
    },
    {
      heading: 'Conducta prohibida',
      paragraphs: ['Usted acepta no:'],
      bullets: [
        'Utilice ANQR para crear códigos QR que faciliten el phishing, la distribución de malware, el fraude, las estafas, el acoso, la difamación o cualquier actividad ilegal.',
        'Codifique contenido que infrinja los derechos de propiedad intelectual, viole la privacidad o contenga material ilegal.',
        'Intentar interrumpir, sobrecargar o interferir con el funcionamiento o la seguridad del sitio.',
        'Realizar ingeniería inversa, descompilar o intentar extraer el código fuente del sitio.',
        'Utilice herramientas automatizadas (bots, scrapers) para acceder al sitio de una manera que degrade el rendimiento de otros usuarios.',
        'Eludir o desactivar cualquier función de seguridad o control de acceso.',
        'Hacerse pasar por cualquier persona o entidad o tergiversar su afiliación.',
      ],
    },
    {
      heading: 'Propiedad intelectual',
      paragraphs: [
        'Usted conserva la propiedad del contenido que codifica en códigos QR. ANQR no reclama la propiedad de sus datos.',
        'El nombre, el logotipo, el diseño de la interfaz y el código subyacente de ANQR están protegidos por derechos de autor, marcas comerciales y otras leyes de propiedad intelectual. No puede copiar, modificar, distribuir ni crear trabajos derivados sin nuestro permiso.',
        'QR Code® es una marca registrada de DENSO WAVE INCORPORATED. ANQR no está afiliado a DENSO WAVE.',
      ],
    },
    {
      heading: 'Licencia de contenido de usuario',
      paragraphs: [
        'Al utilizar ANQR, no nos otorga ningún derecho sobre su contenido. Cuando se utiliza la generación local (la opción predeterminada), toda la generación de códigos QR ocurre en su navegador y no accedemos, almacenamos ni transmitimos sus datos codificados.',
        'Cuando se utiliza la API del lado del servidor, su contenido se procesa para generar la imagen QR, pero no se almacena, registra ni utiliza para ningún otro propósito más allá de representar la imagen solicitada.',
      ],
    },
    {
      heading: 'Servicios de terceros y publicidad.',
      paragraphs: [
        'El sitio muestra anuncios a través de Google AdSense y puede incluir enlaces a sitios web de terceros. No somos responsables del contenido, los servicios o las prácticas de privacidad de terceros.',
        'Sus interacciones con anunciantes y terceros son únicamente entre usted y ellos. Consulte nuestra Política de privacidad para obtener información sobre las prácticas de datos publicitarios.',
      ],
    },
    {
      heading: 'Renuncia de garantías',
      paragraphs: [
        'ANQR SE PROPORCIONA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD" SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS O IMPLÍCITAS, INCLUYENDO, PERO NO LIMITADO A, GARANTÍAS IMPLÍCITAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN.',
        'No garantizamos que: (a) el sitio será ininterrumpido, seguro o estará libre de errores; (b) los códigos QR se escanearán en todos los entornos, en todos los dispositivos o con todas las aplicaciones de escáner; (c) el sitio cumplirá con sus requisitos.',
        'Siempre debes probar los códigos QR en las condiciones en las que se utilizarán (tamaño de impresión, iluminación, tipo de pantalla, distancia, calidad de la cámara).',
      ],
    },
    {
      heading: 'Limitación de responsabilidad',
      paragraphs: [
        'EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY, ANQR Y SUS OPERADORES, AFILIADOS Y LICENCIANTES NO SERÁN RESPONSABLES DE NINGÚN DAÑO DIRECTO, INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE, PUNITIVO O EJEMPLAR, INCLUYENDO, PERO NO LIMITADO A, DAÑOS POR PÉRDIDA DE GANANCIAS, INGRESOS, DATOS, BUENA VOLUNTAD, USO O OTRAS PÉRDIDAS INTANGIBLES, DERIVADAS DE O RELACIONADAS CON SU ACCESO O USO (O INCAPACIDAD DE ACCEDER O UTILIZAR) EL SERVICIO.',
        'USTED ENTIENDE Y ACEPTA EXPRESAMENTE QUE EL USO DEL SERVICIO ES BAJO SU PROPIO RIESGO. EL SERVICIO SE PROPORCIONA DE FORMA GRATUITA Y, EN CONSECUENCIA, USTED ACEPTA QUE ANQR Y SUS OPERADORES NO TENDRÁN NINGUNA RESPONSABILIDAD ANTE USTED POR CUALQUIER DAÑO O PÉRDIDA. EN NINGÚN CASO NUESTRA RESPONSABILIDAD AGREGADA TOTAL SUPERARÁ CERO DÓLARES ($0 AUD).',
        'USTED ACEPTA LIBERAR, RENUNCIA Y DESCARGAR CUALQUIER RECLAMACIÓN, DEMANDA Y CAUSAS DE ACCIÓN CONTRA ANQR Y SUS OPERADORES QUE SURJAN DE SU USO DEL SERVICIO.',
        'ALGUNAS JURISDICCIONES NO PERMITEN LA EXCLUSIÓN DE CIERTAS GARANTÍAS O LIMITACIONES DE RESPONSABILIDAD. EN TALES JURISDICCIONES, NUESTRA RESPONSABILIDAD SE LIMITARÁ AL MÁXIMO PERMITIDO POR LA LEY APLICABLE.',
      ],
    },
    {
      heading: 'Indemnización',
      paragraphs: [
        'Usted acepta indemnizar, defender y eximir de responsabilidad a ANQR, sus operadores, afiliados y sus respectivos funcionarios, directores, empleados y agentes de cualquier reclamo, daño, pérdida, responsabilidad, costo y gasto (incluidos los honorarios legales) que surjan de: (a) su uso del sitio; (b) su violación de estos Términos; (c) su violación de cualquier derecho de terceros; (d) cualquier contenido que codifique en códigos QR.',
      ],
    },
    {
      heading: 'Resolución de disputas',
      paragraphs: [
        'Cualquier disputa que surja de estos Términos o de su uso de ANQR primero deberá intentar resolverse mediante una negociación informal comunicándose con email@anqr.link.',
        'Si falla la resolución informal, las disputas se resolverán mediante arbitraje vinculante en Victoria, Australia, excepto que cualquiera de las partes pueda solicitar medidas cautelares ante los tribunales por violaciones de propiedad intelectual.',
      ],
    },
    {
      heading: 'Renuncia a demanda colectiva',
      paragraphs: [
        'EN LA MEDIDA EN QUE LO PERMITA LA LEY, USTED ACEPTA QUE CUALQUIER PROCEDIMIENTO DE RESOLUCIÓN DE DISPUTAS SE REALIZARÁ SOLAMENTE DE FORMA INDIVIDUAL Y NO EN UNA ACCIÓN COLECTIVA, CONSOLIDADA O REPRESENTATIVA.',
      ],
    },
    {
      heading: 'Ley aplicable',
      paragraphs: [
        'Estos Términos se rigen por las leyes de Victoria, Australia, sin tener en cuenta los principios de conflicto de leyes. Usted acepta la jurisdicción exclusiva de los tribunales ubicados en Victoria, Australia.',
      ],
    },
    {
      heading: 'Cambios y disponibilidad',
      paragraphs: [
        'Podemos modificar, suspender o discontinuar el sitio (o cualquier parte del mismo) en cualquier momento sin previo aviso ni responsabilidad.',
        'Podemos actualizar estos Términos en cualquier momento. La fecha de "Última actualización" indica cuándo se revisaron por última vez. El uso continuo después de los cambios constituye aceptación.',
      ],
    },
    {
      heading: 'Divisibilidad',
      paragraphs: [
        'Si alguna disposición de estos Términos se considera inválida o inaplicable, esa disposición se aplicará en la máxima medida permitida y las disposiciones restantes permanecerán en pleno vigor y efecto.',
      ],
    },
    {
      heading: 'Renuncia',
      paragraphs: [
        'Nuestra incapacidad para hacer cumplir cualquier derecho o disposición de estos Términos no se considerará una renuncia a dicho derecho o disposición.',
      ],
    },
    {
      heading: 'Acuerdo completo',
      paragraphs: [
        'Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y ANQR con respecto a su uso del sitio y reemplazan cualquier acuerdo anterior.',
      ],
    },
    {
      heading: 'Fuerza mayor',
      paragraphs: [
        'No seremos responsables de ninguna falla o retraso en el desempeño debido a circunstancias más allá de nuestro control razonable, incluidos desastres naturales, guerras, terrorismo, disturbios, acciones gubernamentales o fallas de Internet/infraestructura.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: ['Las preguntas sobre estos Términos se pueden enviar a: email@anqr.link'],
    },
  ],
};

export default terms;
