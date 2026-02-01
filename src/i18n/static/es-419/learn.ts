import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Aprender con ANQR',
  description: 'Guías prácticas para convertir códigos QR en activos reales de marketing - no sólo cuadrados funcionales. Aprenda a actualizar los códigos de puntos de venta heredados, crear un registro QR de pago fiable, preparar exportaciones de impresión, utilizar la animación de forma segura en pantallas digitales y compartir configuraciones bloqueadas en equipos multilingües usando enlaces ANQR ("anchor").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra el generador', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Abra la guía completa del usuario', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Mejoramiento de las campañas QR existentes',
      paragraphs: ['La mayoría de las empresas tienen códigos QR dispersos a través de sus operaciones - en menús, contra stands, embalaje y materiales promocionales. Muchos de estos códigos fueron creados hace años con generadores básicos, resultando en cuadrados genéricos en blanco y negro que no inspiran confianza ni coinciden con su identidad de marca. Esta guía integral le lleva a través de un enfoque sistemático para auditar, actualizar y optimizar su infraestructura QR existente sin interrumpir los viajes de clientes que ya ha establecido.', 'La ventaja estratégica de actualizar en lugar de sustituir sus códigos QR reside en preservar la continuidad. Sus clientes ya han aprendido a esperar ciertos destinos cuando escanean sus códigos. Al mantener las URLs codificadas idénticas mientras mejora dramáticamente la presentación visual, la fiabilidad del escaneo y la alineación de la marca, usted crea una transición perfecta que mejora la confianza sin requerir cambios en su infraestructura digital o el seguimiento de analítica.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Una comparación de lado a lado que muestra un código QR decolorado y genérico junto a una versión de marca moderna encodificando la misma URL',
          caption: 'Antes y después: La misma URL de destino transformada de un código genérico de fecha a un activo de marca profesional',
        },
      ],
    },
    {
      heading: 'Por qué Legacy QR Codes Underperform',
      paragraphs: ['Los códigos QR creados durante la fase de adopción temprana - particularmente durante 2020-2021 cuando las empresas se apresuraron a implementar soluciones sin contacto - a menudo sufren de varios problemas críticos. Los ajustes de corrección de errores bajos los hacen frágiles cuando se imprimen en superficies texturadas o se ven bajo iluminación desafiante. Zonas tranquilas insuficientes causan fallos de escaneo cuando se colocan códigos cerca de otros elementos visuales. El estilo genérico no comunica la legitimidad de la marca, lo que lleva a la vacilación y reduce las tasas de escaneo.', 'Más allá de las limitaciones técnicas, los códigos heredados a menudo representan oportunidades perdidas de marca. Cada código QR es un punto de contacto con su cliente - un momento en el que están activamente comprometidos y dispuestos a tomar acción. Un código de estilo profesional que coincide con los colores de su marca, incluye márgenes de seguridad adecuados, y características de elementos de marca opcional transforma esta utilidad en un activo de marketing que refuerza su identidad en cada interacción.'],
    },
    {
      heading: 'Realización de una auditoría del código QR',
      paragraphs: ['Comience su proyecto de actualización creando un inventario completo de cada código QR actualmente desplegado en su negocio. Documenta la ubicación física, el destino codificado, la condición actual del material impreso, y el entorno de escaneo típico, incluyendo las condiciones de iluminación y los ángulos de visualización. Prueba cada código con múltiples dispositivos - teléfonos inteligentes antiguos y dispositivos presupuestarios a menudo revelan problemas de fiabilidad que los teléfonos premium máscara.', 'Preste especial atención a los códigos en las ubicaciones de altas tomas: puntos de pago, áreas de facturación y pantallas promocionales donde el fallo de exploración impacta directamente los ingresos o la experiencia del cliente. Estos deben ser priorizados para la actualización inmediata. También note códigos que aparecen en contenido de fotografía o video, ya que estos requerirán coordinación con su equipo de marketing para actualizar activos visuales.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Una interfaz de lista de verificación que muestra las categorías de auditoría QR: ubicación, condición, fiabilidad del escaneo y calificación prioritaria',
          caption: 'Plantilla de auditoría de QR sistemática para documentar y priorizar a sus candidatos de actualización',
        },
      ],
    },
    {
      heading: 'Estrategia de actualización segura',
      paragraphs: ['La regla cardinal de las actualizaciones de QR es la preservación del destino. Extraer la URL exacta de cada código existente y codificarla de forma idéntica en su nueva versión. Esto asegura que todos los análisis existentes, la lógica de redireccion y las expectativas del cliente permanecen intactas. Si necesita flexibilidad de destino para futuras actualizaciones, este es el momento ideal para introducir una URL corta de marca o un servicio redireccionado - pero implementar esto como un proyecto separado para evitar cambios de composición.', 'Para la actualización visual, aplicar mejoras en capas: primero garantizar la confiabilidad técnica (corrección de error adecuada y zona tranquila), luego añadir estilo de marca (colores, formas de módulos), y finalmente considerar mejoras opcionales (sobreimpuestos de centro, marcos). Cada capa debe ser validada a través de pruebas antes de proceder. El modo de seguridad de ANQR ayuda a hacer cumplir estas prioridades advirtiendo cuando las opciones de estilo podrían comprometer la escasibilidad.'],
    },
    {
      heading: 'Añadiendo identidad de marca sin fiabilidad',
      paragraphs: ['Eficaz marca QR equilibra el impacto visual contra la fiabilidad del escaneo. Comience con el color: reemplace el primer plano negro por defecto con su color de marca principal, asegurando un contraste suficiente con su fondo. Para la mayoría de las marcas, los colores oscuros sobre fondo ligero funcionan mejor. Evite combinaciones de bajo contraste, gradientes que reduzcan la claridad del borde, o colores que aparecen similares en condiciones de iluminación comunes.', 'La personalización de la forma del módulo ofrece otra oportunidad de marca con un impacto mínimo de fiabilidad. Los módulos redondeados crean una apariencia más suave y accesible, manteniendo una excelente escanerabilidad. Los módulos de estilo de puntos funcionan bien para las marcas modernas y tecnológicas. Los módulos conectados se adaptan a las identidades industriales o corporativas. Cualquier estilo que elija, mantenga la coherencia en todas sus implementaciones QR para el reconocimiento de marca instantánea.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Un diagrama de rueda de color que muestra combinaciones de colores QR óptimas con indicadores de relación de contraste',
          caption: 'Guía de selección de colores de marca que muestra combinaciones de alto contraste que mantienen la confiabilidad del escaneo',
        },
      ],
    },
    {
      heading: 'Protocolo de prueba y validación',
      paragraphs: ['Nunca implemente códigos QR actualizados sin pruebas rigurosas. Imprima una prueba física en el tamaño exacto y en el mismo material que su despliegue final. Prueba en la ubicación real donde el código vivirá, en diferentes momentos del día para contabilizar las variaciones de iluminación. Utilice al menos tres dispositivos diferentes: un teléfono insignia actual, un dispositivo de gama media y un teléfono inteligente más antiguo o presupuestario.', 'Grabar tiempos de escaneo y tasas de éxito para cada prueba. Un código bien optimizado debe escanear dentro de 1-2 segundos en cualquier dispositivo razonablemente moderno. Si usted está viendo retrasos o fallos consistentes, reducir la intensidad del estilo - eliminar o reducir las superposiciones, aumentar el tamaño de la zona tranquila, o cambiar a un nivel de corrección de error más alto. La fiabilidad siempre tiene precedencia sobre la sofisticación visual.'],
    },
    {
      heading: 'Cerrar su configuración para la coherencia',
      paragraphs: ['Una vez que haya validado una configuración óptima, preservarlo usando los enlaces accionables de ANQR. Esto crea un registro permanente de cada ajuste utilizado para generar su código aprobado - colores, estilo de módulo, corrección de errores, tamaño y cualquier superposición. Comparte este enlace con tu equipo de diseño, imprime proveedores y cualquiera que necesite reproducir el código en el futuro.', 'Este bloqueo de configuración impide la degradación gradual que plaga muchos despliegues de QR. Sin ella, los miembros del personal recrean códigos de capturas de pantalla, los diseñadores reconstruir la configuración de la memoria, y los proveedores de impresión hacen ajustes \'ayuda\'. Cada variación introduce posibles problemas. Con un enlace de configuración bloqueado, cada reproducción es idéntica a su original probado y aprobado.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Un diagrama que muestra la configuración deriva: capturas de pantalla que conducen a recreaciones que conducen a variantes, frente a un único enlace fuente de verdad',
          caption: 'Prevenir la deriva de configuración estableciendo una única fuente autorizada para todas las reproducciones QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Abra el generador',
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
      paragraphs: ['Pago Los códigos QR funcionan en el entorno más exigente en el retail: el momento de la transacción. Los clientes están listos para pagar, a menudo con una cola formando detrás de ellos, y cada segundo de retraso crea fricción. Sin embargo, este momento de alta presión es también la propiedad principal para el refuerzo de la marca. Esta guía explica cómo crear códigos QR de pago que escanean instantáneamente en aplicaciones bancarias mientras todavía presenta una apariencia profesional y de marca que construye la confianza del cliente.', 'El principio fundamental para el pago de códigos QR es la fiabilidad sobre la estética. Un código bien diseñado que no puede escanear en la aplicación bancaria de un cliente le costará mucho más en operaciones abandonadas y clientes frustrados de lo que un diseño conservador podría. Comience con el cumplimiento, agregue confiabilidad, luego capa cuidadosamente en la marca sólo donde no compromete la función primaria.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Un mostrador de venta minorista que muestra un código QR de pago siendo escaneado por un smartphone con una aplicación bancaria',
          caption: 'Pago Los códigos QR deben trabajar al instante con aplicaciones bancarias y billeteras bajo condiciones de contador del mundo real',
        },
      ],
    },
    {
      heading: 'Comprender las normas de pago',
      paragraphs: ['Los códigos de QR de pago suelen seguir normas regionales que dictan el formato de carga útil. En Singapur, PayNow QR utiliza formato específico. En la India, los códigos UPI siguen los estándares de conexión profunda BharatQR o UPI. Los pagos europeos de SEPA usan códigos EPC QR. Cada estándar existe para asegurar que las aplicaciones bancarias puedan reconocer y procesar al instante la información de pago. Desviando de estos estándares - incluso ligeramente - puede causar aplicaciones de pago para rechazar códigos que los escáneres de cámara genéricos leen sin problemas.', 'ANQR incluye plantillas para las principales normas de pago que formatean automáticamente los detalles del comerciante en cargas de pago compatibles. Utilice siempre estas plantillas en lugar de construir manualmente cadenas de pago, ya que incluso errores de formato menores pueden causar fallos de transacción. Si el estándar de pago de su región no está disponible como plantilla, consulte la documentación técnica de su proveedor de pagos para requisitos de formato exactos.'],
    },
    {
      heading: 'Dimensionamiento y ubicación de expositores de mostrador',
      paragraphs: ['Los códigos QR encimera enfrentan desafíos físicos únicos. Los clientes escanean la longitud del brazo, a menudo en un ángulo, a veces a través de protectores estornudos o casos de visualización. La iluminación superior crea manchas de brillo. El código compite con otro contador para la atención y líneas claras. Tamaño de su pago QR generosamente - un mínimo de 4-5cm se recomienda para la mayoría de las aplicaciones de contador, escalar si el código se sienta detrás de vidrio o en un área iluminada.', 'La posición importa tanto como el tamaño. Coloque el código en el que los clientes puedan mantener cómodamente su teléfono sin bloquear la cola o llegar de forma incómoda. Enciende la pantalla hacia el cliente en lugar de ponerla plana. Si es posible, utilice materiales de laminación mate o de visualización no reflectante para minimizar el resplandor de la iluminación superior. Prueba la colocación final en diferentes momentos del día para detectar problemas de iluminación.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Un diagrama que muestra alturas y ángulos de colocación QR óptimos para diferentes configuraciones de contadores',
          caption: 'Guía de colocación: alturas óptimas, ángulos y distancias para el escaneo de pago fiable',
        },
      ],
    },
    {
      heading: 'Marca conservadora para códigos de pago',
      paragraphs: ['Las aplicaciones de pago son menos indulgentes que los escáneres de cámara genéricos. Muchas aplicaciones bancarias utilizan algoritmos de lectura QR más antiguos y simples optimizados para la velocidad en lugar de flexibilidad. Esto significa estilo que funciona perfectamente con una cámara telefónica puede fallar con aplicaciones de pago específicas. Mantenga la marca conservadora: use su color de marca para el primer plano si mantiene un fuerte contraste, pero evite los gradientes, las capas pesadas o elementos decorativos que podrían interferir con el reconocimiento.', 'Si desea un logotipo de centro o superposición, manténgalo extremadamente pequeño - no más del 10-15% del área de QR - y prueba extensamente con cada aplicación de pago que sus clientes podrían utilizar. Muchas empresas optan por no sobreponerse en los códigos de pago específicamente, reservando ese estilo para la comercialización de códigos QR donde los requisitos de fiabilidad son menos estrictos. El trabajo del código de pago es procesar las transacciones, no impresionar visualmente.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Una comparación que muestra niveles de marca aceptables vs riesgosos para el pago de códigos QR',
          caption: 'Pago espectro de marca QR: desde el estilo conservador seguro hasta enfoques decorativos arriesgados',
        },
      ],
    },
    {
      heading: 'Consideraciones materiales e impresas',
      paragraphs: ['El material de visualización física impacta significativamente la fiabilidad del escaneo. Laminación brillante refleja las luces superiores directamente en la cámara del cliente. Los materiales texturizados pueden distorsionar los bordes del módulo. La impresión barata puede difuminar detalles finos. Para el pago Los códigos QR, invierten en calidad: usan laminación mate o satinada, aseguran la impresión de alta resolución y reemplazan las pantallas antes de mostrar desgaste. Un código de pago rayado o descolorido cuesta sus transacciones.', 'Considere la durabilidad y reemplazabilidad de la pantalla. Las pantallas se tocan, se mueven, se salpican y ocasionalmente se golpean. Diseña tu sistema de visualización para que la inserción QR pueda ser reemplazada fácilmente sin reemplazar el soporte completo. Mantenga las huellas de repuesto listas, generadas desde el enlace de configuración bloqueado, así que los códigos usados se pueden cambiar inmediatamente.'],
    },
    {
      heading: 'Pruebas con Pago Real Aplicaciones',
      paragraphs: ['Los escáneres de cámara genéricos decodificarán casi cualquier código QR con formato razonable. Las aplicaciones de pago son más selectas. Antes de implementar cualquier código QR de pago, prueba con cada aplicación de pago que tus clientes puedan usar. En entornos de pago múltiple, esto podría significar pruebas con múltiples aplicaciones bancarias, carteras digitales y plataformas de pago. Documentar qué aplicaciones has probado y sus versiones - las aplicaciones de pago actualizan con frecuencia, y una actualización podría cambiar el comportamiento de escaneo.', 'Prueba bajo condiciones realistas: la pantalla real, iluminación real, distancia de escaneo real. Un código que escanea instantáneamente en su escritorio podría luchar en el mostrador a las 5pm cuando el sol de la tarde crea resplandor. Prueba con el smartphone más antiguo y más barato que puedas encontrar - si funciona de forma fiable en un dispositivo presupuestario, funcionará en todo. Marcar cualquier tiempo de escaneo más de 2 segundos para investigación y posible rediseño.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Una lista de verificación de pruebas que muestra varias aplicaciones de pago, tipos de dispositivos y condiciones ambientales para verificar',
          caption: 'Pago completo matriz de pruebas QR que cubre aplicaciones, dispositivos y factores ambientales',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Abra el generador',
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
      heading: 'Códigos QR de impresión: SVG vs PNG',
      paragraphs: ['La diferencia entre un código QR que escanea perfectamente y uno que falla a menudo se reduce a cómo fue exportado y manejado en el flujo de trabajo de impresión. Esta guía explica las distinciones críticas entre los formatos vectores (SVG) y raster (PNG), cuándo utilizar cada uno, y cómo entregar la obra QR a los diseñadores e imprimir proveedores de maneras que preserven la confiabilidad de la exploración de tarjetas de visita a la señalización tamaño de cartel.', 'La producción de impresión introduce variables que no existen en la pantalla: distribución de tinta, textura de sustrato, procesos de acabado, y el efecto acumulativo de múltiples conversiones de archivos. Un código QR que se ve perfecto en su software de diseño puede emerger de la impresora con bordes suavizados, contraste reducido o módulos subtutamente distorsionados. Comprender la selección de formato y las mejores prácticas de flujo de trabajo evita estos fallos silenciosos.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Una vista magnificada comparando módulos vectoriales QR con bordes nítidos versus módulos de raster que muestran artefactos de píxeles',
          caption: 'Vector vs raster a escala de impresión: la diferencia de precisión que determina la fiabilidad del escaneo',
        },
      ],
    },
    {
      heading: 'Por qué Vector (SVG) Es Preferido para Imprimir',
      paragraphs: ['Los archivos SVG describen códigos QR como formas matemáticas en lugar de cuadrículas de píxeles. Esto significa que el código se puede escalar a cualquier tamaño - desde una etiqueta de 1 cm a una bandera de 10 metros - sin ninguna pérdida de agudeza del borde. El RIP de la impresora (Procesador de Imagen Raster) hace que los vectores de la resolución nativa del dispositivo de salida, asegurando que cada borde del módulo sea tan nítido como el hardware permite. No hay interpolación, ni artefactos anti-aliasing, ni borrón acumulado de múltiples operaciones de tamaño.', 'Más allá de la escalabilidad, los archivos SVG son más robustos en los flujos de trabajo profesionales. Sobreviven ida y vuelta a través del software de diseño sin degradación. Pueden ser corregidos por colores sin resonancia. Se incrustan limpiamente en archivos PDF para la salida de prensa. Para cualquier aplicación de impresión donde importe la calidad, SVG debe ser su formato de exportación predeterminado.'],
    },
    {
      heading: 'Cuando PNG es aceptable',
      paragraphs: ['PNG se hace necesario cuando su plataforma de flujo de trabajo o destino no admite formatos vectoriales. Algunas plataformas web, sistemas CMS de señalización y flujos de trabajo de impresión heredados requieren imágenes de mapa. En estos casos, PNG puede funcionar bien - pero sólo si sigue reglas estrictas: exportar al tamaño y resolución físico final, nunca escalar después de la exportación, y evitar cualquier compresión o conversión de formato perdido.', 'La regla crítica para PNG es calcular sus dimensiones de píxel requeridas antes de exportar. Si su QR imprimirá a 5 cm y su impresora opera a 300 DPI, necesita aproximadamente 590 píxeles. Exportar a este tamaño o más grande, luego escalar si es necesario - nunca arriba. Incluya esta información en su nombre de archivo o metadatos para que los usuarios futuros no usen accidentalmente una exportación específica de tamaño.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Una interfaz de calculadora que muestra la relación entre el tamaño físico, DPI y las dimensiones de píxel requeridas',
          caption: 'Calculadora de resolución de impresión: determinación de las dimensiones mínimas del píxel para el tamaño de la salida del objetivo',
        },
      ],
    },
    {
      heading: 'Opciones de exportación ANQR Explicadas',
      paragraphs: ['ANQR ofrece varios modos de exportación SVG para adaptarse a diferentes flujos de trabajo. El modo Vector Verdadero produce una salida pura vía ideal para herramientas de diseño profesional y de impresión. Cuando usted ha añadido superposiciones de raster o ciertos efectos, ANQR puede incrustar estos al tiempo que mantiene módulos vectoriales, o puede exportar una versión completamente rasterizada en su resolución especificada. Comprender estas opciones le ayuda a elegir la exportación adecuada para cada caso de uso.', 'Para las exportaciones de PNG, ANQR le permite especificar dimensiones exactas e incluye opciones para fondos transparentes. El ajuste DPI le ayuda a calcular los tamaños apropiados para imprimir, aunque recuerde que DPI es metadatos - lo que importa para imprimir es tener suficientes píxeles para su tamaño físico. Cuando en duda, exportar más grande de lo que usted piensa que necesita; escalar preserva la calidad mientras que el escalar lo destruye.'],
    },
    {
      heading: 'Preparación de archivos para Handoff',
      paragraphs: ['Al pasar las obras de arte QR a diseñadores o proveedores de impresión, incluyen especificaciones claras: el tamaño físico previsto, requisitos mínimos de zona tranquila, y cualquier consideración de espacio de color. Para aplicaciones críticas, proporcione tanto un maestro SVG como una copia de seguridad PNG de alta resolución, claramente etiquetada con sus usos previstos. Incluya su enlace de configuración ANQR para que el código pueda regenerarse si es necesario.', 'Anticipar errores comunes en el proceso de entrega. Explicitly state that the QR should not be scaled, rotated, skewed, or have effects applied. Especifique que la zona tranquila debe permanecer clara - sin marcas de cultivo, marcas de registro, o elementos de diseño intrusos. Si el QR se coloca en un fondo coloreado o fotográfico, proporcione una versión con una forma de respaldo opaca para asegurar un contraste adecuado.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Un diagrama de paquete de archivos que muestra SVG master, copia de seguridad PNG, documento de especificaciones y enlace de configuración',
          caption: 'Paquete profesional QR: todo lo que un diseñador o proveedor de impresión necesita para una reproducción precisa',
        },
      ],
    },
    {
      heading: 'Pruebas de impresión verificables',
      paragraphs: ['Nunca apruebe una carrera de impresión sin escanear una prueba física. Solicitar una prueba impresa en el sustrato real con el acabado real que se utilizará en la producción. Escanee la prueba en condiciones de iluminación similares a donde se mostrará la pieza final. Prueba con múltiples dispositivos, incluyendo teléfonos inteligentes antiguos que podrían luchar con la calidad marginal.', 'Si la prueba escanea lentamente o incoherentemente, investigue antes de aprobar. Los problemas comunes incluyen el contraste insuficiente en los sustratos de colores, las violaciones de zonas tranquilas desde el recortado, los bordes del módulo de ablandamiento de tinta, o laminación creando resplandor. Cualquiera de estos puede ser abordado antes de comprometerse a una carrera de impresión completa - pero sólo si los atrapa en la etapa de prueba.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Una lista de verificación de revisión de pruebas con resultados de análisis, mediciones de contraste y firmas de aprobación',
          caption: 'Corriente de trabajo de verificación de pruebas de impresión: pruebas sistemáticas antes de comprometerse a cantidades de producción',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Abra el generador',
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
      paragraphs: ['Los códigos Animated QR combinan la funcionalidad de los códigos QR estándar con el movimiento llamativo que aumenta drásticamente las tasas de compromiso. En señalización digital, redes sociales y pantallas interactivas, la animación transforma una utilidad estática en un elemento visual convincente que dibuja el ojo e invita la interacción. Esta guía cubre los principios, técnicas y limitaciones prácticas de la creación de códigos QR animados que escanean de forma fiable mientras brindan impacto visual.', 'El reto fundamental de los códigos QR animados es equilibrar el interés visual contra la confiabilidad del escaneo. Cada marco debe ser escaneado individualmente - un escáner puede capturar el código en cualquier punto del ciclo de animación. Esta limitación forma cada decisión de diseño: qué elementos pueden moverse, cuánto pueden cambiar, y qué debe permanecer estable a lo largo de la animación.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Una muestra digital de señalización que muestra un código QR animado captando la atención del espectador en un espacio público',
          caption: 'Códigos QR animados en señalización digital: movimiento que atrae la atención y alienta el escaneo',
        },
      ],
    },
    {
      heading: 'Cómo Animación Afecta la Escanerabilidad',
      paragraphs: ['Los escáneres QR funcionan capturando un solo marco y analizando el patrón de módulos ligeros y oscuros. Para que un código animado funcione, cada marco debe contener el patrón QR completo y válido. Esto descarta animaciones que alteran la estructura de código, disuelvan módulos o alteran significativamente el patrón de contraste. Los módulos de carga de datos - el patrón aparentemente aleatorio en el centro - deben permanecer visualmente estables en todas partes.', 'Se trata de una animación segura que modifica elementos que no llevan datos: fondos, colores, marcos decorativos y elementos superpuestos. Los componentes estructurales - patrones de búsqueda (las grandes plazas de esquina), patrones de tiempo (las líneas alternas), y patrones de alineación (plazas más pequeñas en códigos más grandes) - deben mantener sus posiciones y proporciones. Trabajar dentro de estas limitaciones todavía permite animaciones sorprendentemente dinámicas y atractivas.'],
    },
    {
      heading: 'Técnicas de animación Ese trabajo',
      paragraphs: ['El ciclismo de color anima el primer plano y los colores de fondo a través de una paleta manteniendo un contraste suficiente a cada paso. Esto crea un efecto vibrante y llamativo de atención con un riesgo mínimo de escaneo, siempre y cuando el contraste nunca caiga por debajo de los niveles legibles. Los presets del ciclo de color de ANQR están diseñados para mantener la escandalidad a lo largo del ciclo.', 'Los overlays animados colocan imágenes móviles detrás de un patrón de QR semitransparente. El código permanece estable mientras el fondo anima - tal vez un video de bucle, elementos de marca animados, o gráficos de movimiento abstracto. Esta técnica requiere una cuidadosa gestión de intensidad para evitar que el fondo abrumara el patrón de QR, pero crea los resultados más llamativos visualmente.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Un diagrama que muestra la estructura capa de un QR animado: capa de código estable sobre capa de fondo animada',
          caption: 'Principio de capa de animación: el patrón QR sigue siendo constante mientras los elementos de fondo animan bajo',
        },
      ],
    },
    {
      heading: 'Configuración de parámetros de animación',
      paragraphs: ['La tasa de marco afecta tanto la suavidad visual como el tamaño de archivo. Para la mayoría de las aplicaciones, 10-15 marcos por segundo proporciona movimiento de aspecto suave sin tamaños de archivos excesivos. Los índices de marco más altos ofrecen rendimientos visuales disminuyentes y aumentan significativamente los tamaños de los archivos. Considere su contexto de entrega - un gran signo digital puede manejar archivos más grandes que una colocación de anuncio móvil.', 'El comportamiento del bucle determina cómo los ciclos de animación. Los bucles sin costura crean movimiento continuo ideal para señalización y pantallas ambiente. Los bucles Ping-pong (en adelante-en-reverso) funcionan bien para animaciones sencillas. Para los pulsos de agarre de la atención, considere animaciones con soportes - períodos de quietud perforados por el movimiento que dibuja el ojo sin fatiga constante del movimiento.'],
    },
    {
      heading: 'Creación de superposiciones animadas',
      paragraphs: ['Al utilizar imágenes animadas (GIFs, WebPs animados o video) como overlays, ANQR extrae marcos y los compone con su código QR. El ajuste de intensidad de superposición controla cuánto de la animación muestra a través de - menor valor priorización de la digitalización mientras que valores superiores favorecen el impacto visual. Pruebe su intensidad escogida a través de múltiples marcos para asegurar una escaneabilidad consistente.', 'La calidad del material fuente impacta significativamente los resultados. Use superposiciones con sujetos claros y buen contraste. Evite las animaciones de origen con rápidos cambios de parpadeo o brillo extremo que podrían crear marcos ocasionales de bajo contraste. Avance el ciclo de animación completo antes de exportar para capturar cualquier marco problemático que pueda dejar de escanear.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Una vista de marco por marco de una superposición animada que muestra niveles de contraste mantenidos a través de la secuencia',
          caption: 'Análisis del marco: verificación de la escaneabilidad consistente en todo el ciclo de animación',
        },
      ],
    },
    {
      heading: 'Consideraciones de exportación y entrega',
      paragraphs: ['GIF sigue siendo el formato de animación más ampliamente soportado, jugando automáticamente en la mayoría de contextos sin requerir soporte de reproductor de vídeo. Sin embargo, la paleta de 256 colores de GIF limita la fidelidad al color. Para animaciones color-críticas, considere WebP animado donde se admite, o retroceda a formatos de vídeo para la más alta calidad. La exportación GIF de ANQR incluye opciones de separación para maximizar la calidad dentro de las limitaciones de la paleta.', 'El tamaño del archivo importa para la entrega. Sistemas de señalización digital, clientes de correo electrónico y plataformas sociales a menudo imponen límites de tamaño. Si su animación excede estos límites, reduzca el conteo de marcos, dimensiones o profundidad de color. A veces dividir una animación compleja en un bucle más corto logra mejores resultados que la compresión agresiva que degrada cada marco.'],
    },
    {
      heading: 'Testing Animated QR Codes',
      paragraphs: ['Probar códigos animados requiere escanear en varios puntos en el ciclo de animación. No sólo escanear una vez y asumir el éxito - escanear repetidamente, en diferentes momentos, para verificar que cada marco es legible. Preste especial atención a los marcos en los extremos del ciclo de color o los picos de intensidad superpuesta donde el contraste podría ser más bajo.', 'Prueba en el hardware de visualización real cuando sea posible. Monitorear la calibración del color, el ángulo de visión y la iluminación ambiental afectan cómo aparece la animación y los escaneos. Una animación brillante que escanea perfectamente en su monitor puede lavarse en una pantalla al aire libre o no se puede leer en ángulos de visualización oblicuas.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Una matriz de pruebas que muestra las tasas de éxito del escaneo en diferentes marcos, dispositivos y condiciones de visualización',
          caption: 'Protocolo de prueba de QR animado: verificación sistemática a través de marcos, dispositivos y condiciones de visualización',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Abra el generador',
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
      paragraphs: ['Un código QR bien diseñado que no escanea es peor que inútil - frustra a los clientes, daña la percepción de la marca, y desperdicia cada recurso invertido en su creación y distribución. Esta guía cubre los factores técnicos y prácticos que determinan si un código QR escanea de forma fiable, y cómo utilizar las características de seguridad de ANQR para detectar problemas potenciales antes de alcanzar la producción.', 'La confiabilidad del código QR no es binaria. Un código puede escanear perfectamente en los teléfonos insignia pero fallar en los dispositivos presupuestarios. Puede funcionar en la iluminación ideal pero lucha en restaurantes dim o luz solar brillante. Comprender los factores que afectan la escandalidad le ayuda a hacer cambios informados entre el estilo visual y la fiabilidad del mundo real.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Un espectro de confiabilidad que muestra códigos QR que van desde muy escandalosas hasta ligeramente legibles',
          caption: 'El espectro de escaneabilidad: desde códigos antibalas a estilo que empuja límites de fiabilidad',
        },
      ],
    },
    {
      heading: 'Comprender los niveles de corrección de errores',
      paragraphs: ['Los códigos QR incluyen redundancia incorporada que les permite ser leídos incluso cuando se daña parcialmente o se obsesiona. El nivel de corrección de errores - L (7%), M (15%), Q (25%), o H (30%) - determina cuánto del código puede faltar mientras se decodifica correctamente. La corrección de error más alta crea códigos más grandes pero proporciona un margen de seguridad para sobreimpresiones, imperfecciones de impresión y daños ambientales.', 'Para códigos con superposiciones de imagen, nivel de corrección de errores H es esencial - la superposición oculta físicamente parte del código, y necesita que el 30% de redundancia para mantener la fiabilidad. Para códigos limpios y sin estilo en entornos controlados, el nivel M suele ser suficiente. Nivel L debe ser reservado para situaciones donde el tamaño de código es limitado críticamente y puede garantizar condiciones prístinas.'],
    },
    {
      heading: 'La zona tranquila crítica',
      paragraphs: ['La zona tranquila es el margen en blanco que rodea cada código QR. Los escáneres utilizan este límite para identificar dónde comienza y termina el código. El estándar ISO especifica una zona silenciosa mínima de cuatro módulos (cuatro veces la anchura de la plaza más pequeña del código). Violar este espacio - con elementos de diseño, bordes de bordes o contenido adyacente - es una de las causas más comunes de fallos de escaneo.', 'La zona tranquila de ANQR ayuda a mantener este espaciado crítico, pero también debe asegurarse de que se conserva en sus diseños finales. Al entregar la obra QR, especificar explícitamente los requisitos de zona tranquila. Al colocar códigos en diseños, verifique que ningún elemento intrude en este espacio. Algunos milímetros de espacio claro pueden significar la diferencia entre el escaneo fiable y los clientes frustrados.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Un diagrama que muestra el espaciamiento correcto de zona tranquila frente a violaciones comunes que causan fallos de escaneo',
          caption: 'Requisitos de zona tranquila: el margen invisible que determina el éxito de la exploración',
        },
      ],
    },
    {
      heading: 'Contraste y seguridad en color',
      paragraphs: ['Los escáneres QR detectan el patrón de módulos ligeros y oscuros. Cualquier estilo que reduzca este contraste - primer plano ligero, fondo oscuro, efectos gradientes o superposiciones de baja opacidad - hace que el código sea más difícil de leer. ANQR calcula ratios de contraste y advierte cuando sus opciones de color se acercan a niveles peligrosos, pero el árbitro final es siempre pruebas reales.', 'La percepción del color varía con las condiciones de iluminación. Una combinación de color que aparece de alto contraste en su monitor podría ser difícil distinguir bajo iluminación incandescente cálida o tubos fluorescentes frescos. Si su código se implementará en diferentes condiciones de iluminación, prueba bajo múltiples fuentes de luz, y considera más relaciones de contraste conservadoras como un margen de seguridad.'],
    },
    {
      heading: 'Tamaño del módulo y distancia de visualización',
      paragraphs: ['El tamaño físico de los módulos individuales determina la distancia máxima de la que se puede escanear un código. Los módulos más pequeños significan códigos más pequeños pero requieren distancias de escaneo más cercanas. La regla general es que cada módulo debe ser al menos 0,5 mm a la distancia de escaneado prevista, escalando proporcionalmente para mayores distancias. Un código en un cartel necesita módulos mucho más grandes que un código en una tarjeta de visita.', 'Al calcular el tamaño del módulo, considere el peor de los casos: el cliente con un teléfono mayor, en iluminación imperfecta, escaneando a la máxima distancia posible. Diseño para este usuario, y todos los demás tendrán una experiencia aún mejor. Factor de recomendaciones de tamaño de ANQR en estas variables del mundo real para sugerir dimensiones apropiadas para su uso previsto.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Un gráfico relacionado el tamaño del módulo, las dimensiones de impresión y la distancia de exploración máxima efectiva',
          caption: 'Guía de distancia de escaneado: tamaño del módulo a los requisitos de implementación',
        },
      ],
    },
    {
      heading: 'Usando el modo de seguridad ANQR',
      paragraphs: ['El modo de seguridad de ANQR proporciona retroalimentación en tiempo real sobre la fiabilidad del escaneo. Supervisa los coeficientes de contraste, el cumplimiento de zona tranquila, la intensidad de superposición y otros factores que afectan la escasibilidad. Cuando cualquier parámetro se acerca a niveles de riesgo, verá advertencias con orientación específica sobre cómo mejorar la fiabilidad. Para despliegues profesionales donde el fallo es costoso, mantenga el modo de seguridad activo durante todo el proceso de diseño.', 'El modo de seguridad también incluye una función de verificación del escaneo que intenta descifrar su código generado e informa de éxito o fracaso. Si bien esta verificación en aplicación no puede reproducir todas las condiciones del mundo real, captura muchos problemas comunes antes de invertir en la impresión o distribución. Tratar la verificación exitosa como una barra mínima, no una garantía - las pruebas del mundo real siguen siendo esenciales.'],
    },
    {
      heading: 'Protocolos de ensayo en el mundo real',
      paragraphs: ['Ninguna cantidad de verificación del software reemplaza las pruebas físicas. Imprima su código en el tamaño previsto en el material representativo. Pruébalo en el entorno de despliegue real con condiciones de iluminación que coincidan con el uso real. Escaneo con múltiples dispositivos - no sólo su teléfono insignia, sino presupuesto Android dispositivos, iPhones antiguos, y cualquier dispositivo específico que su público utiliza comúnmente.', 'Documenta tus pruebas sistemáticamente. Grabar qué dispositivos fueron probados, en qué condiciones, con qué resultados. Si usted está implementando códigos a escala, establezca criterios de aceptación: tal vez el porcentaje de éxito del 95% en la piscina de pruebas de dispositivo, o escáneres exitosos dentro de 2 segundos en todos los dispositivos probados. Estos estándares ayudan a que las decisiones go/no-go sean objetivas en lugar de esperar lo mejor.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Una lista completa de verificación de pruebas que cubre dispositivos, condiciones y criterios de aceptación',
          caption: 'Protocolo de prueba de despliegue de QR: verificación sistemática antes del compromiso de producción',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Abra el generador',
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
    { href: '/guide?lang=${lang}', label: 'Abra la guía completa del usuario', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abra la galería', type: 'gallery' },
  ],
};
