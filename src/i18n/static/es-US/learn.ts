import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Aprende con ANQR',
  description:
    'Guías prácticas y orientadas a los negocios para convertir códigos QR en activos de marketing reales, no solo cuadrados funcionales. Aprenda a actualizar códigos de punto de venta heredados, crear carteles QR de pago compatibles, preparar exportaciones listas para imprimir, utilizar animaciones de forma segura en pantallas digitales y compartir configuraciones bloqueadas entre equipos multilingües mediante enlaces ANQR ("ancla").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'abre el generador', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Abra la Guía del usuario completa', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Mejora de las campañas QR existentes',
      paragraphs: [
        'La mayoría de las empresas tienen códigos QR repartidos por sus operaciones: en menús, mostradores, embalajes y materiales promocionales. Muchos de estos códigos se crearon hace años con generadores básicos, lo que da como resultado cuadrados genéricos en blanco y negro que no logran inspirar confianza ni coincidir con la identidad de su marca. Esta guía completa lo guía a través de un enfoque sistemático para auditar, actualizar y optimizar su infraestructura QR existente sin interrumpir los recorridos de los clientes que ya ha establecido.',
        'La ventaja estratégica de actualizar en lugar de reemplazar sus códigos QR radica en preservar la continuidad. Sus clientes ya han aprendido a esperar ciertos destinos cuando escanean sus códigos. Al mantener idénticas las URL codificadas y al mismo tiempo mejorar drásticamente la presentación visual, la confiabilidad del escaneo y la alineación de la marca, se crea una transición perfecta que mejora la confianza sin requerir ningún cambio en su infraestructura digital o seguimiento analítico.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Una comparación lado a lado que muestra un código QR genérico y descolorido junto a una versión de marca moderna que codifica la misma URL',
          caption:
            'Antes y después: la misma URL de destino transformada de un código genérico anticuado a un activo de marca profesional',
        },
      ],
    },
    {
      heading: 'Por qué los códigos QR heredados tienen un rendimiento inferior',
      paragraphs: [
        'Los códigos QR creados durante la fase de adopción temprana, particularmente durante 2020-2021, cuando las empresas se apresuraron a implementar soluciones sin contacto, a menudo sufren varios problemas críticos. Los ajustes bajos de corrección de errores los hacen frágiles cuando se imprimen en superficies texturizadas o se ven bajo una iluminación difícil. Las zonas silenciosas insuficientes provocan fallas en el escaneo cuando los códigos se colocan cerca de otros elementos visuales. El estilo genérico no logra comunicar la legitimidad de la marca, lo que genera dudas y tasas de escaneo reducidas.',
        'Más allá de las limitaciones técnicas, los códigos heredados a menudo representan oportunidades de marca perdidas. Cada código QR es un punto de contacto con su cliente: un momento en el que participa activamente y está dispuesto a actuar. Un código de estilo profesional que combine con los colores de su marca, incluya márgenes de seguridad adecuados y presente elementos de marca opcionales transforma esta utilidad en un activo de marketing que refuerza su identidad en cada interacción.',
      ],
    },
    {
      heading: 'Realización de una auditoría de código QR',
      paragraphs: [
        'Comience su proyecto de actualización creando un inventario completo de cada código QR actualmente implementado en su empresa. Documente la ubicación física, el destino codificado, el estado actual del material impreso y el entorno de escaneo típico, incluidas las condiciones de iluminación y los ángulos de visión. Pruebe cada código con múltiples dispositivos: los teléfonos inteligentes más antiguos y los dispositivos económicos a menudo revelan problemas de confiabilidad que los teléfonos premium enmascaran.',
        'Preste especial atención a los códigos en ubicaciones de alto riesgo: puntos de pago, áreas de check-in y exhibidores promocionales donde la falla del escaneo afecta directamente los ingresos o la experiencia del cliente. Estos deben tener prioridad para una actualización inmediata. También tenga en cuenta los códigos que aparecen en contenido de fotografía o video, ya que requerirán coordinación con su equipo de marketing para actualizar los recursos visuales.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Una interfaz de lista de verificación que muestra las categorías de auditoría QR: ubicación, condición, confiabilidad del escaneo y clasificación de prioridad.',
          caption:
            'Plantilla de auditoría QR sistemática para documentar y priorizar sus candidatos a actualización',
        },
      ],
    },
    {
      heading: 'La estrategia de actualización segura',
      paragraphs: [
        'La regla fundamental de las actualizaciones QR es la preservación del destino. Extraiga la URL exacta de cada código existente y codifíquela de manera idéntica en su nueva versión. Esto garantiza que todos los análisis existentes, la lógica de redireccionamiento y las expectativas de los clientes permanezcan intactos. Si necesita flexibilidad de destino para futuras actualizaciones, este es el momento ideal para introducir una URL corta de marca o un servicio de redireccionamiento, pero impleméntelo como un proyecto separado para evitar cambios complicados.',
        'Para la actualización visual, aplique mejoras en capas: primero garantice la confiabilidad técnica (corrección de errores adecuada y zona silenciosa), luego agregue estilo de marca (colores, formas de módulos) y finalmente considere mejoras opcionales (superposiciones centrales, marcos). Cada capa debe validarse mediante pruebas antes de continuar. El modo de seguridad de ANQR ayuda a hacer cumplir estas prioridades advirtiendo cuando las opciones de estilo podrían comprometer la capacidad de escaneo.',
      ],
    },
    {
      heading: 'Agregar identidad de marca sin comprometer la confiabilidad',
      paragraphs: [
        'La marca QR efectiva equilibra el impacto visual con la confiabilidad del escaneo. Comience con el color: reemplace el primer plano negro predeterminado con el color principal de su marca, asegurando un contraste suficiente con el fondo. Para la mayoría de las marcas, los colores oscuros sobre fondos claros funcionan mejor. Evite combinaciones de bajo contraste, degradados que reduzcan la claridad de los bordes o colores que parezcan similares en condiciones de iluminación comunes.',
        'La personalización de la forma del módulo ofrece otra oportunidad de marca con un impacto mínimo en la confiabilidad. Los módulos redondeados crean una apariencia más suave y accesible al mismo tiempo que mantienen una excelente capacidad de escaneo. Los módulos de estilo punto funcionan bien para marcas modernas y tecnológicas. Los módulos conectados se adaptan a identidades industriales o corporativas. Cualquiera que sea el estilo que elija, mantenga la coherencia en todas sus implementaciones de QR para lograr un reconocimiento de marca instantáneo.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Un diagrama de rueda de colores que muestra combinaciones óptimas de colores QR con indicadores de relación de contraste',
          caption:
            'Guía de selección de colores de marca que muestra combinaciones de alto contraste que mantienen la confiabilidad del escaneo',
        },
      ],
    },
    {
      heading: 'Protocolo de prueba y validación',
      paragraphs: [
        'Nunca implementes códigos QR actualizados sin realizar pruebas rigurosas. Imprima una prueba física del tamaño exacto y en el mismo material que su implementación final. Pruebe en la ubicación real donde residirá el código, en diferentes momentos del día para tener en cuenta las variaciones de iluminación. Utilice al menos tres dispositivos diferentes: un teléfono insignia actual, un dispositivo de gama media y un teléfono inteligente más antiguo o económico.',
        'Registre los tiempos de escaneo y las tasas de éxito para cada prueba. Un código bien optimizado debería escanearse en 1 o 2 segundos en cualquier dispositivo razonablemente moderno. Si observa retrasos o fallas constantes, reduzca la intensidad del peinado: elimine o reduzca las superposiciones, aumente el tamaño de la zona silenciosa o cambie a un nivel de corrección de errores más alto. La fiabilidad siempre tiene prioridad sobre la sofisticación visual.',
      ],
    },
    {
      heading: 'Bloquear su configuración para lograr coherencia',
      paragraphs: [
        'Una vez que haya validado una configuración óptima, consérvela utilizando los enlaces para compartir de ANQR. Esto crea un registro permanente de cada configuración utilizada para generar su código aprobado: colores, estilo de módulo, corrección de errores, tamaño y cualquier superposición. Comparta este enlace con su equipo de diseño, proveedores de impresión y cualquier persona que necesite reproducir el código en el futuro.',
        'Este bloqueo de configuración evita la degradación gradual que afecta a muchas implementaciones de QR. Sin él, los miembros del personal recrean códigos a partir de capturas de pantalla, los diseñadores reconstruyen la configuración desde la memoria y los proveedores de impresión realizan ajustes "útiles". Cada variación introduce problemas potenciales. Con un enlace de configuración bloqueado, cada reproducción es idéntica al original probado y aprobado.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Un diagrama que muestra la deriva de la configuración: capturas de pantalla que conducen a recreaciones que conducen a variantes, frente a un único enlace de fuente de verdad',
          caption:
            'Evite cambios de configuración estableciendo una única fuente autorizada para todas las reproducciones de QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Ver ejemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Códigos QR para pagos minoristas',
      paragraphs: [
        'Los códigos QR de pago operan en el entorno más exigente del comercio minorista: el momento de la transacción. Los clientes están listos para pagar, a menudo se forma una cola detrás de ellos, y cada segundo de retraso crea fricciones. Sin embargo, este momento de alta presión también es un terreno privilegiado para el refuerzo de la marca. Esta guía explica cómo crear códigos QR de pago que se escanean instantáneamente en aplicaciones bancarias y al mismo tiempo presentan una apariencia de marca profesional que genera confianza en el cliente.',
        'El principio fundamental para los códigos QR de pago es la confiabilidad por encima de la estética. Un código bellamente diseñado que no se puede escanear en la aplicación bancaria de un cliente le costará mucho más en transacciones abandonadas y clientes frustrados que lo que podría costarle un diseño conservador. Comience con el cumplimiento, agregue confiabilidad y luego agregue cuidadosamente la marca solo donde no comprometa la función principal.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Un mostrador minorista que muestra un código QR de pago escaneado por un teléfono inteligente con una aplicación bancaria',
          caption:
            'Los códigos QR de pago deben funcionar instantáneamente con aplicaciones bancarias y de billetera en condiciones de mostrador del mundo real.',
        },
      ],
    },
    {
      heading: 'Comprender los estándares QR de pago',
      paragraphs: [
        'Los códigos QR de pago suelen seguir los estándares regionales que dictan el formato de carga útil. En Singapur, PayNow QR utiliza un formato específico. En India, los códigos UPI siguen los estándares de enlaces profundos BharatQR o UPI. Los pagos SEPA europeos utilizan códigos QR EPC. Cada estándar existe para garantizar que las aplicaciones bancarias puedan reconocer y procesar instantáneamente la información de pago. Desviarse de estos estándares, aunque sea ligeramente, puede hacer que las aplicaciones de pago rechacen códigos que los escáneres de cámara genéricos leen sin problemas.',
        'ANQR incluye plantillas para los principales estándares de pago que formatean automáticamente los datos de su comerciante en cargas útiles compatibles. Utilice siempre estas plantillas en lugar de crear cadenas de pago manualmente, ya que incluso errores de formato menores pueden provocar errores en las transacciones. Si el estándar de pago de su región no está disponible como plantilla, consulte la documentación técnica de su proveedor de pagos para conocer los requisitos de formato exactos.',
      ],
    },
    {
      heading: 'Dimensionamiento y ubicación de expositores de mostrador',
      paragraphs: [
        'Los códigos QR de mostrador enfrentan desafíos físicos únicos. Los clientes escanean con el brazo extendido, a menudo en ángulo, a veces a través de protectores contra estornudos o vitrinas. La iluminación cenital crea puntos deslumbrantes. El código compite con otro desorden por la atención y las líneas de visión claras. Dimensione generosamente su QR de pago: se recomienda un mínimo de 4 a 5 cm para la mayoría de aplicaciones de mostrador, ampliando su tamaño si el código se encuentra detrás de un vidrio o en un área con poca luz.',
        'La posición importa tanto como el tamaño. Coloque el código donde los clientes puedan sostener cómodamente su teléfono sin bloquear la cola o alcanzarlo de manera incómoda. Incline la pantalla hacia el cliente en lugar de colocarla plana. Si es posible, utilice laminado mate o materiales de visualización no reflectantes para minimizar el resplandor de la iluminación superior. Pruebe la ubicación final en diferentes momentos del día para detectar problemas de iluminación.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Un diagrama que muestra alturas y ángulos óptimos de colocación de QR para diferentes configuraciones de mostrador',
          caption:
            'Guía de colocación de mostradores: alturas, ángulos y distancias óptimas para un escaneo de pagos confiable',
        },
      ],
    },
    {
      heading: 'Marca conservadora para códigos de pago',
      paragraphs: [
        'Las aplicaciones de pago son menos indulgentes que los escáneres de cámara genéricos. Muchas aplicaciones bancarias utilizan algoritmos de lectura de QR más antiguos y simples, optimizados para brindar velocidad en lugar de flexibilidad. Esto significa que un estilo que funciona perfectamente con la cámara de un teléfono puede fallar con aplicaciones de pago específicas. Mantenga la marca conservadora: utilice el color de su marca para el primer plano si mantiene un fuerte contraste, pero evite degradados, superposiciones pesadas o elementos decorativos que puedan interferir con el reconocimiento.',
        'Si desea un logotipo central o una superposición, manténgalo extremadamente pequeño (no más del 10-15 % del área QR) y pruébelo exhaustivamente con cada aplicación de pago que sus clientes puedan usar. Muchas empresas optan por no superponer específicamente los códigos de pago, reservando ese estilo para comercializar códigos QR donde los requisitos de confiabilidad son menos estrictos. La función del código de pago es procesar transacciones, no impresionar visualmente.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Una comparación que muestra niveles de marca aceptables y riesgosos para códigos QR de pago',
          caption:
            'Espectro de marca QR de pago: desde un estilo conservador seguro hasta enfoques decorativos arriesgados',
        },
      ],
    },
    {
      heading: 'Consideraciones sobre materiales e impresión',
      paragraphs: [
        'El material de visualización física afecta significativamente la confiabilidad del escaneo. La laminación brillante refleja las luces del techo directamente hacia la cámara del cliente. Los materiales texturizados pueden distorsionar los bordes del módulo. La impresión barata puede difuminar los detalles finos. Para los códigos QR de pago, invierta en calidad: utilice laminación mate o satinada, garantice una impresión de alta resolución y reemplace las pantallas antes de que se desgasten. Un código de pago rayado o descolorido le cuesta las transacciones.',
        'Considere la durabilidad y reemplazabilidad de la pantalla. Los mostradores se tocan, se mueven, se salpican y, en ocasiones, se derriban. Diseñe su sistema de visualización de modo que el inserto QR se pueda reemplazar fácilmente sin reemplazar todo el soporte. Mantenga listas las impresiones de repuesto, generadas desde su enlace de configuración bloqueado, para que los códigos desgastados se puedan intercambiar inmediatamente.',
      ],
    },
    {
      heading: 'Pruebas con aplicaciones de pago reales',
      paragraphs: [
        'Los escáneres de cámara genéricos decodificarán casi cualquier código QR con un formato razonable. Las aplicaciones de pago son más exigentes. Antes de implementar cualquier código QR de pago, pruébelo con cada aplicación de pago que sus clientes puedan usar. En entornos de pagos múltiples, esto podría significar realizar pruebas con múltiples aplicaciones bancarias, billeteras digitales y plataformas de pago. Documente qué aplicaciones ha probado y sus versiones: las aplicaciones de pago se actualizan con frecuencia y una actualización podría cambiar el comportamiento de escaneo.',
        'Pruebe en condiciones realistas: visualización real, iluminación real, distancia de escaneo real. Un código que se escanea instantáneamente en su escritorio puede tener problemas en el mostrador a las 5 p. m., cuando el sol de la tarde crea reflejos. Pruebe con el teléfono inteligente más antiguo y barato que pueda encontrar; si funciona de manera confiable en un dispositivo económico, funcionará en todo. Marque cualquier tiempo de escaneo superior a 2 segundos para investigación y posible rediseño.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Una lista de verificación de prueba que muestra varias aplicaciones de pago, tipos de dispositivos y condiciones ambientales para verificar',
          caption:
            'Matriz de prueba QR de pago integral que cubre aplicaciones, dispositivos y factores ambientales',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Ver ejemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Códigos QR listos para imprimir: SVG vs PNG',
      paragraphs: [
        'La diferencia entre un código QR que se escanea perfectamente y uno que falla a menudo se reduce a cómo se exportó y se gestionó en el flujo de trabajo de impresión. Esta guía explica las distinciones fundamentales entre los formatos vectorial (SVG) y rasterizado (PNG), cuándo utilizar cada uno y cómo entregar ilustraciones QR a diseñadores y proveedores de impresión de manera que se preserve la confiabilidad del escaneo, desde tarjetas de presentación hasta carteles del tamaño de vallas publicitarias.',
        'La producción impresa introduce variables que no existen en la pantalla: dispersión de la tinta, textura del sustrato, procesos de acabado y el efecto acumulativo de múltiples conversiones de archivos. Un código QR que se ve perfecto en su software de diseño puede salir de la impresora con bordes suavizados, contraste reducido o módulos sutilmente distorsionados. Comprender las mejores prácticas de selección de formato y flujo de trabajo evita estos fallos silenciosos.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Una vista ampliada que compara módulos QR vectoriales con bordes nítidos versus módulos rasterizados que muestran artefactos de píxeles',
          caption:
            'Vector vs ráster a escala de impresión: la diferencia de precisión que determina la confiabilidad del escaneo',
        },
      ],
    },
    {
      heading: 'Por qué se prefiere Vector (SVG) para imprimir',
      paragraphs: [
        'Los archivos SVG describen los códigos QR como formas matemáticas en lugar de cuadrículas de píxeles. Esto significa que el código se puede escalar a cualquier tamaño, desde una etiqueta de 1 cm hasta un cartel de 10 metros, sin pérdida de nitidez de los bordes. El RIP (procesador de imágenes rasterizadas) de la impresora representa los vectores con la resolución nativa del dispositivo de salida, lo que garantiza que el borde de cada módulo sea tan nítido como lo permita el hardware. No hay interpolación, ni artefactos de suavizado, ni desenfoque acumulado por múltiples operaciones de cambio de tamaño.',
        'Más allá de la escalabilidad, los archivos SVG son más sólidos en los flujos de trabajo profesionales. Sobreviven a los viajes de ida y vuelta a través del software de diseño sin degradación. Se pueden corregir el color sin necesidad de volver a muestrear. Se integran limpiamente en archivos PDF para una salida lista para imprimir. Para cualquier aplicación de impresión donde la calidad importe, SVG debería ser su formato de exportación predeterminado.',
      ],
    },
    {
      heading: 'Cuando PNG es aceptable',
      paragraphs: [
        'PNG se vuelve necesario cuando su flujo de trabajo o plataforma de destino no admite formatos vectoriales. Algunas plataformas web, sistemas CMS de señalización y flujos de trabajo de impresión heredados requieren imágenes rasterizadas. En estos casos, PNG puede funcionar bien, pero solo si sigue reglas estrictas: exportar con el tamaño físico y la resolución finales, nunca aumentar la escala después de la exportación y evitar cualquier compresión o conversión de formato con pérdida.',
        'La regla fundamental para PNG es calcular las dimensiones en píxeles requeridas antes de exportar. Si su QR se imprime a 5 cm y su impresora funciona a 300 DPI, necesita aproximadamente 590 píxeles. Exporte a este tamaño o mayor, luego reduzca si es necesario, nunca aumente. Incluya esta información en su nombre de archivo o metadatos para que futuros usuarios no hagan un mal uso accidental de una exportación de tamaño específico.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Una interfaz de calculadora que muestra la relación entre el tamaño físico, DPI y las dimensiones de píxeles requeridas.',
          caption:
            'Calculadora de resolución de impresión: determinación de las dimensiones mínimas en píxeles para el tamaño de salida objetivo',
        },
      ],
    },
    {
      heading: 'Opciones de exportación ANQR explicadas',
      paragraphs: [
        'ANQR ofrece varios modos de exportación SVG para adaptarse a diferentes flujos de trabajo. El modo True Vector produce resultados puramente basados ​​en rutas, ideales para impresión y herramientas de diseño profesionales. Cuando haya agregado superposiciones rasterizadas o ciertos efectos, ANQR puede incrustarlos mientras mantiene los módulos vectoriales, o puede exportar una versión completamente rasterizada a la resolución especificada. Comprender estas opciones le ayudará a elegir la exportación adecuada para cada caso de uso.',
        'Para las exportaciones de PNG, ANQR le permite especificar dimensiones exactas e incluye opciones para fondos transparentes. La configuración de DPI le ayuda a calcular los tamaños adecuados para la impresión, aunque recuerde que los DPI son metadatos; lo que importa para la impresión es tener suficientes píxeles para su tamaño físico. En caso de duda, exporte más cantidad de la que cree que necesita; La reducción preserva la calidad, mientras que la ampliación la destruye.',
      ],
    },
    {
      heading: 'Preparar archivos para la transferencia',
      paragraphs: [
        'Al pasar obras de arte QR a diseñadores o proveedores de impresión, incluya especificaciones claras: el tamaño físico previsto, los requisitos mínimos de zona silenciosa y cualquier consideración sobre el espacio de color. Para aplicaciones críticas, proporcione un archivo maestro SVG y una copia de seguridad PNG de alta resolución, claramente etiquetados con sus usos previstos. Incluya su enlace de configuración ANQR para que el código pueda regenerarse si es necesario.',
        'Anticípese a errores comunes en el proceso de traspaso. Indique explícitamente que el QR no se debe escalar, rotar, sesgar ni aplicar efectos. Especifique que la zona silenciosa debe permanecer despejada: sin que se entrometan marcas de corte, marcas de registro ni elementos de diseño. Si el QR se colocará sobre un fondo fotográfico o de color, proporcione una versión con una forma de respaldo opaca para garantizar un contraste adecuado.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Un diagrama de paquete de archivos que muestra el maestro SVG, la copia de seguridad PNG, el documento de especificaciones y el enlace de configuración.',
          caption:
            'Paquete de transferencia QR profesional: todo lo que un diseñador o proveedor de impresión necesita para una reproducción precisa',
        },
      ],
    },
    {
      heading: 'Verificación de pruebas de impresión',
      paragraphs: [
        'Nunca apruebe una tirada sin escanear una prueba física. Solicite una prueba impresa sobre el sustrato real con el acabado real que se utilizará en la producción. Escanee la prueba en condiciones de iluminación similares a las del lugar donde se exhibirá la pieza final. Pruebe con varios dispositivos, incluidos teléfonos inteligentes más antiguos que pueden tener problemas con una calidad marginal.',
        'Si la prueba se escanea de forma lenta o inconsistente, investigue antes de aprobarla. Los problemas comunes incluyen contraste insuficiente en sustratos coloreados, violaciones de la zona silenciosa debido al recorte, dispersión de tinta que suaviza los bordes del módulo o laminación que crea reflejos. Cualquiera de estos se puede abordar antes de comprometerse con una tirada completa, pero solo si los detecta en la etapa de prueba.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Una lista de verificación de revisión de pruebas con resultados de pruebas de escaneo, mediciones de contraste y firmas de aprobación.',
          caption:
            'Flujo de trabajo de verificación de pruebas de impresión: pruebas sistemáticas antes de comprometerse con las cantidades de producción',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Ver ejemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Crear códigos QR animados',
      paragraphs: [
        'Los códigos QR animados combinan la funcionalidad de los códigos QR estándar con movimientos llamativos que aumentan drásticamente las tasas de participación. En la señalización digital, las redes sociales y las pantallas interactivas, la animación transforma una utilidad estática en un elemento visual convincente que atrae la atención e invita a la interacción. Esta guía cubre los principios, técnicas y limitaciones prácticas de la creación de códigos QR animados que se lean de manera confiable y al mismo tiempo generen impacto visual.',
        'El desafío fundamental de los códigos QR animados es equilibrar el interés visual con la confiabilidad del escaneo. Cada fotograma debe poder escanearse individualmente: un escáner puede capturar el código en cualquier punto del ciclo de animación. Esta restricción da forma a cada decisión de diseño: qué elementos pueden moverse, cuánto pueden cambiar y qué debe permanecer estable durante toda la animación.',
      ],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Una pantalla de señalización digital que muestra un código QR animado que capta la atención del espectador en un espacio público.',
          caption:
            'Códigos QR animados en cartelería digital: movimiento que llama la atención y fomenta el escaneo',
        },
      ],
    },
    {
      heading: 'Cómo la animación afecta la capacidad de escaneado',
      paragraphs: [
        'Los escáneres QR funcionan capturando un solo cuadro y analizando el patrón de módulos claros y oscuros. Para que funcione un código animado, cada cuadro debe contener el patrón QR completo y válido. Esto descarta animaciones que transforman la estructura del código, disuelven módulos o alteran significativamente el patrón de contraste. Los módulos que transportan datos (el patrón aparentemente aleatorio en el centro) deben permanecer visualmente estables en todo momento.',
        'Los enfoques de animación segura modifican elementos que no contienen datos: fondos, colores, marcos decorativos y elementos superpuestos. Los componentes estructurales (patrones de búsqueda (los grandes cuadrados de las esquinas), patrones de sincronización (las líneas alternas) y patrones de alineación (cuadrados más pequeños en códigos más grandes) deben mantener sus posiciones y proporciones. Trabajar dentro de estas limitaciones todavía permite animaciones sorprendentemente dinámicas y atractivas.',
      ],
    },
    {
      heading: 'Técnicas de animación que funcionan',
      paragraphs: [
        'El ciclo de color anima los colores de primer plano y de fondo a través de una paleta manteniendo suficiente contraste en cada paso. Esto crea un efecto vibrante y que llama la atención con un riesgo de escaneo mínimo, siempre y cuando el contraste nunca caiga por debajo de niveles legibles. Los ajustes preestablecidos del ciclo de color de ANQR están diseñados para mantener la capacidad de escaneo durante todo el ciclo.',
        'Las superposiciones animadas colocan imágenes en movimiento detrás de un patrón QR semitransparente. El código permanece estable mientras el fondo se anima, tal vez un vídeo en bucle, elementos animados de la marca o gráficos en movimiento abstractos. Esta técnica requiere un manejo cuidadoso de la intensidad para evitar que el fondo abrume el patrón QR, pero crea los resultados visualmente más sorprendentes.',
      ],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Un diagrama que muestra la estructura en capas de un QR animado: capa de código estable sobre capa de fondo animada',
          caption:
            'Principio de capas de animación: el patrón QR permanece constante mientras que los elementos de fondo se animan debajo',
        },
      ],
    },
    {
      heading: 'Configurar parámetros de animación',
      paragraphs: [
        'La velocidad de fotogramas afecta tanto a la suavidad visual como al tamaño del archivo. Para la mayoría de las aplicaciones, entre 10 y 15 fotogramas por segundo proporcionan un movimiento fluido sin tamaños de archivo excesivos. Las velocidades de fotogramas más altas ofrecen rendimientos visuales decrecientes al tiempo que aumentan significativamente el tamaño de los archivos. Considere su contexto de entrega: un letrero digital grande puede manejar archivos más grandes que una ubicación de anuncio móvil.',
        'El comportamiento del bucle determina cómo se realiza el ciclo de la animación. Los bucles continuos crean un movimiento continuo ideal para señalización y pantallas ambientales. Los bucles de ping-pong (avance y luego retroceso) funcionan bien para animaciones simples. Para pulsos que llamen la atención, considere animaciones con pausas: períodos de quietud puntuados por movimiento que atrae la atención sin fatiga constante por movimiento.',
      ],
    },
    {
      heading: 'Crear superposiciones animadas',
      paragraphs: [
        'Cuando se utilizan imágenes animadas (GIF, WebP animados o vídeos) como superposiciones, ANQR extrae fotogramas y los compone con su código QR. La configuración de intensidad de superposición controla la cantidad de animación que se muestra: los valores más bajos priorizan la capacidad de escaneo, mientras que los valores más altos favorecen el impacto visual. Pruebe la intensidad elegida en varios fotogramas para garantizar una capacidad de escaneo constante.',
        'La calidad del material de origen afecta significativamente los resultados. Utilice superposiciones con sujetos claros y buen contraste. Evite animaciones de origen con parpadeos rápidos o cambios extremos de brillo que podrían crear cuadros ocasionales de bajo contraste. Obtenga una vista previa del ciclo de animación completo antes de exportar para detectar cualquier fotograma problemático que pueda no escanearse.',
      ],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Una vista cuadro por cuadro de una superposición animada que muestra los niveles de contraste mantenidos a lo largo de la secuencia.',
          caption:
            'Análisis de fotogramas: verificación de una capacidad de escaneo consistente en todo el ciclo de animación',
        },
      ],
    },
    {
      heading: 'Consideraciones de exportación y entrega',
      paragraphs: [
        'GIF sigue siendo el formato animado más compatible y se reproduce automáticamente en la mayoría de los contextos sin necesidad de compatibilidad con el reproductor de vídeo. Sin embargo, la paleta de 256 colores del GIF limita la fidelidad del color. Para animaciones en las que el color es crítico, considere WebP animado cuando sea compatible, o recurra a formatos de video para obtener la más alta calidad. La exportación GIF de ANQR incluye opciones de tramado para maximizar la calidad dentro de las limitaciones de la paleta.',
        'El tamaño del archivo es importante para la entrega. Los sistemas de señalización digital, los clientes de correo electrónico y las plataformas sociales suelen imponer límites de tamaño. Si su animación excede estos límites, reduzca el número de fotogramas, las dimensiones o la profundidad del color. A veces, dividir una animación compleja en un bucle más corto logra mejores resultados que una compresión agresiva que degrada cada fotograma.',
      ],
    },
    {
      heading: 'Prueba de códigos QR animados',
      paragraphs: [
        'Probar códigos animados requiere escanear en múltiples puntos del ciclo de animación. No escanee solo una vez y asuma que fue exitoso; escanee repetidamente, en diferentes momentos, para verificar que cada cuadro sea legible. Preste especial atención a los fotogramas en los extremos del ciclo de color o picos de intensidad de superposición donde el contraste puede ser menor.',
        'Pruebe en el hardware de pantalla real cuando sea posible. La calibración del color del monitor, el ángulo de visión y la iluminación ambiental afectan la forma en que aparece y se escanea la animación. Una animación brillante que se escanea perfectamente en su monitor puede desaparecer en una pantalla exterior o volverse ilegible en ángulos de visión oblicuos.',
      ],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Una matriz de prueba que muestra las tasas de éxito del escaneo en diferentes marcos, dispositivos y condiciones de visualización.',
          caption:
            'Protocolo de prueba QR animado: verificación sistemática en fotogramas, dispositivos y condiciones de visualización',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Ver ejemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Mejores prácticas de cumplimiento y seguridad de QR',
      paragraphs: [
        'Un código QR bellamente diseñado que no se puede escanear es peor que inútil: frustra a los clientes, daña la percepción de la marca y desperdicia todos los recursos invertidos en su creación y distribución. Esta guía cubre los factores técnicos y prácticos que determinan si un código QR se escaneará de manera confiable y cómo usar las funciones de seguridad de ANQR para detectar problemas potenciales antes de que lleguen a producción.',
        'La confiabilidad del código QR no es binaria. Un código puede escanearse perfectamente en teléfonos emblemáticos, pero fallar en dispositivos económicos. Puede que funcione con una iluminación ideal, pero tenga problemas en restaurantes con poca luz o con luz solar intensa. Comprender los factores que afectan la capacidad de escaneo lo ayuda a hacer concesiones informadas entre el estilo visual y la confiabilidad en el mundo real.',
      ],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Un espectro de confiabilidad que muestra códigos QR que van desde altamente escaneables hasta marginalmente legibles',
          caption:
            'El espectro de escaneabilidad: desde códigos a prueba de balas hasta estilos que superan los límites de confiabilidad',
        },
      ],
    },
    {
      heading: 'Comprender los niveles de corrección de errores',
      paragraphs: [
        'Los códigos QR incluyen redundancia incorporada que permite leerlos incluso cuando están parcialmente dañados u oscurecidos. El nivel de corrección de errores (L (7%), M (15%), Q (25%) o H (30%) determina qué parte del código puede faltar mientras se sigue decodificando correctamente. Una mayor corrección de errores crea códigos más grandes pero proporciona un margen de seguridad para superposiciones, imperfecciones de impresión y daños ambientales.',
        'Para códigos con superposiciones de imágenes, el nivel de corrección de errores H es esencial: la superposición oscurece físicamente parte del código y se necesita esa redundancia del 30 % para mantener la confiabilidad. Para códigos limpios y sin estilo en entornos controlados, el nivel M suele ser suficiente. El nivel L debe reservarse para situaciones en las que el tamaño del código está críticamente limitado y se pueden garantizar condiciones impecables.',
      ],
    },
    {
      heading: 'La zona crítica de silencio',
      paragraphs: [
        'La zona tranquila es el margen en blanco que rodea cada código QR. Los escáneres utilizan este límite para identificar dónde comienza y termina el código. El estándar ISO especifica una zona silenciosa mínima de cuatro módulos (cuatro veces el ancho del cuadrado más pequeño del código). Violar este espacio (con elementos de diseño, bordes recortados o contenido adyacente) es una de las causas más comunes de fallas en el escaneo.',
        'La aplicación de zonas silenciosas de ANQR ayuda a mantener este espacio crítico, pero también debe asegurarse de que se conserve en sus diseños finales. Al entregar ilustraciones QR, especifique explícitamente los requisitos de la zona tranquila. Al colocar códigos en diseños, verifique que ningún elemento entre en este espacio. Unos pocos milímetros de espacio libre pueden marcar la diferencia entre un escaneo confiable y clientes frustrados.',
      ],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Un diagrama que muestra el espaciado correcto de las zonas silenciosas versus las infracciones comunes que causan fallas en el escaneo.',
          caption:
            'Requisitos de zona silenciosa: el margen invisible que determina el éxito del escaneo',
        },
      ],
    },
    {
      heading: 'Contraste y seguridad del color',
      paragraphs: [
        'Los escáneres QR detectan el patrón de módulos claros y oscuros. Cualquier estilo que reduzca este contraste (primeros planos claros, fondos oscuros, efectos de degradado o superposiciones de baja opacidad) hace que el código sea más difícil de leer. ANQR calcula las relaciones de contraste y advierte cuando sus elecciones de color se acercan a niveles peligrosos, pero el árbitro final siempre son las pruebas del mundo real.',
        'La percepción del color varía según las condiciones de iluminación. Una combinación de colores que aparece con alto contraste en el monitor puede resultar difícil de distinguir bajo una iluminación incandescente cálida o tubos fluorescentes fríos. Si su código se implementará en diferentes condiciones de iluminación, pruébelo con múltiples fuentes de luz y considere relaciones de contraste más conservadoras como margen de seguridad.',
      ],
    },
    {
      heading: 'Tamaño del módulo y distancia de visualización',
      paragraphs: [
        'El tamaño físico de los módulos individuales determina la distancia máxima desde la que se puede escanear un código. Los módulos más pequeños significan códigos más pequeños pero requieren distancias de escaneo más cercanas. La regla general es que cada módulo debe tener al menos 0,5 mm en la distancia de escaneo prevista, ampliando proporcionalmente para distancias mayores. Un código en una valla publicitaria necesita módulos mucho más grandes que un código en una tarjeta de presentación.',
        'Al calcular el tamaño del módulo, considere el peor de los casos: el cliente con un teléfono antiguo, con iluminación imperfecta, escaneando a la distancia máxima probable. Diseñe para este usuario y todos los demás tendrán una experiencia aún mejor. Las recomendaciones de tamaño de ANQR tienen en cuenta estas variables del mundo real para sugerir dimensiones apropiadas para el uso previsto.',
      ],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Un cuadro que relaciona el tamaño del módulo, las dimensiones de impresión y la distancia máxima de escaneo efectiva.',
          caption:
            'Guía de distancia de escaneo: adaptación del tamaño del módulo a sus requisitos de implementación',
        },
      ],
    },
    {
      heading: 'Usando el modo de seguridad ANQR',
      paragraphs: [
        'El modo de seguridad de ANQR proporciona información en tiempo real sobre la confiabilidad del escaneo. Supervisa las relaciones de contraste, el cumplimiento de la zona silenciosa, la intensidad de la superposición y otros factores que afectan la capacidad de escaneo. Cuando cualquier parámetro se acerque a niveles de riesgo, verá advertencias con orientación específica sobre cómo mejorar la confiabilidad. Para implementaciones profesionales donde las fallas son costosas, mantenga activo el modo de seguridad durante todo el proceso de diseño.',
        'El modo de seguridad también incluye una función de verificación de escaneo que intenta decodificar el código generado e informa el éxito o el fracaso. Si bien esta verificación en la aplicación no puede replicar todas las condiciones del mundo real, detecta muchos problemas comunes antes de invertir en impresión o distribución. Trate la verificación exitosa como una barrera mínima, no como una garantía: las pruebas en el mundo real siguen siendo esenciales.',
      ],
    },
    {
      heading: 'Protocolos de prueba del mundo real',
      paragraphs: [
        'Ninguna verificación de software reemplaza las pruebas físicas. Imprima su código en el tamaño previsto en material representativo. Pruébelo en el entorno de implementación real con condiciones de iluminación que coincidan con el uso real. Escanee con múltiples dispositivos, no solo con su teléfono insignia, sino también con dispositivos Android económicos, iPhones más antiguos y cualquier dispositivo específico que su audiencia utilice habitualmente.',
        'Documente sus pruebas sistemáticamente. Registre qué dispositivos se probaron, en qué condiciones y con qué resultados. Si está implementando códigos a escala, establezca criterios de aceptación: tal vez una tasa de éxito del 95 % en todo el grupo de pruebas de su dispositivo, o escaneos exitosos en 2 segundos en todos los dispositivos probados. Estos estándares ayudan a que las decisiones de ir/no ir sean objetivas en lugar de esperar lo mejor.',
      ],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Una lista de verificación de pruebas completa que cubre dispositivos, condiciones y criterios de aceptación.',
          caption:
            'Protocolo de prueba de implementación de QR: verificación sistemática antes del compromiso de producción',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Ver ejemplos de QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Abra la Guía del usuario completa', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abre la galería', type: 'gallery' },
  ],
};
