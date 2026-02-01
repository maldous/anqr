import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Ejemplos de ANQR',
  description: 'Cinco ejemplos de estilo de producción en el mundo real que muestran dónde los códigos QR crean un valor mensurable: elevando un código de contador minorista legado, pagos de venta al por menor marca y acciones "scan-to", escalada de folletos a vallas publicitarias, QR animado para señalización digital, y colaboración interlingüe usando enlaces de Anchor compartidos. Cada ejemplo incluye imágenes, limitaciones prácticas y un remix enlace de vuelta al generador.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Buscar artículos de aprendizaje', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra la guía completa del usuario', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Estudio de caso: Retail Counter QR Uplift',
      paragraphs: ['Este ejemplo del mundo real sigue una pequeña cafetería que había estado usando el mismo código QR en su mostrador durante tres años. El código original se generó rápidamente durante la precipitación pandémica, impreso en papel estándar, y se metió en un soporte de plástico. Todavía funcionó - técnicamente - pero los clientes a menudo necesitaban múltiples intentos de escanear, y no hizo nada para reforzar la identidad de marca cuidadosamente elaborada de la cafetería.', 'La transformación comenzó con una simple auditoría: el código existente codifica la URL del menú online de la cafetería, que querían conservar. El reto era hacer que el QR se sintiera como parte de la experiencia de la cafetería en lugar de una utilidad después de 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Un código QR climatizado en un soporte de plástico que muestra el desgaste visible, las huellas digitales y la impresión desvanecida',
          caption: 'El punto de partida: tres años de servicio contrario habían dejado el QR original apenas funcional',
        },
      ],
    },
    {
      heading: 'Diagnosticar los problemas del código original',
      paragraphs: ['Las pruebas revelaron múltiples problemas: el código original utilizado Error Corrección L (mínimo redundancia), tenía una zona tranquila de sólo 2 módulos, y se imprimió en baja resolución. Bajo la cálida iluminación de tungsteno de la cafetería, los módulos negros ya de moda apenas contrastaban con el papel amarillento. Los teléfonos más antiguos lucharon; los teléfonos más nuevos tuvieron éxito pero con retraso notable.', 'Más allá de cuestiones técnicas, la plaza genérica en blanco y negro no comunicaba nada sobre la marca. Los clientes dudaron antes de escanear - una sutil barrera de confianza que redujo el compromiso con el menú digital cuidadosamente diseñado de la cafetería.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Una superposición diagnóstica que muestra las deficiencias técnicas originales de QR: baja ECC, mínima zona tranquila, pobre contraste',
          caption: 'Análisis técnico revelando por qué el código hereditario subperformó en condiciones del mundo real',
        },
      ],
    },
    {
      heading: 'El proceso de elevación',
      paragraphs: ['Utilizando ANQR, el dueño de la cafetería recreaba el código con la URL del menú idéntico pero mejoraba dramáticamente la configuración: Corrección de errores H para la máxima resiliencia, una zona tranquila de 6 módulos para la detección de límites confiables, y colores de marca (modulos burgundy profundos sobre fondo crema) que coinciden con la paleta interior de la cafetería.', 'Se agregó un pequeño recubrimiento del centro con el logotipo de la cafetería, que se mantuvo deliberadamente sutil para mantener la escandalidad mientras que proporciona un reconocimiento instantáneo de la marca. Safety Mode confirmó el nuevo diseño escaneado fiablemente a través de dispositivos de prueba antes de cualquier impresión.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'La interfaz ANQR muestra la configuración: colores de marca, ECC apropiado, zona tranquila generosa, relé sutil del logotipo',
          caption: 'Construyendo la configuración actualizada: cada ajuste elegido para equilibrar la expresión de la marca con la fiabilidad del escaneo',
        },
      ],
    },
    {
      heading: 'Resultados mensurables',
      paragraphs: ['Después de desplegar el nuevo QR en el stock profesional de tarjetas mate-laminadas, el café rastreó los resultados durante cuatro semanas. La tasa de éxito del escáner mejoró de un 70% estimado a cerca del 100%. El tiempo medio de escaneo se redujo de 3-4 segundos a menos de 1 segundo. Lo más importante es que el compromiso del menú aumentó un 40% - los clientes que antes miraban el QR y se rindieron ahora estaban escaneando con confianza.', 'El personal reportó menos preguntas de clientes sobre cómo utilizar el QR y no más instancias de escribir manualmente la URL para clientes frustrados. La apariencia de marca también provocó conversaciones, con clientes comentando positivamente sobre el diseño cohesivo.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Una comparación antes/después con métricas: tasa de éxito del escaneo, tiempo promedio del escaneo y mejoras del escaneo semanal',
          caption: 'Cuatro semanas de datos que muestran el impacto mensurable de un elevador QR considerado',
        },
      ],
    },
    {
      heading: 'Recrear esta configuración',
      paragraphs: ['La configuración de la cafetería demuestra una marca conservadora pero eficaz: Corrección de errores H, zona tranquila de 6 módulos, colores de marca de alto contraste, y un mínimo centro superpuesto. Este equilibrio funciona para la mayoría de las aplicaciones de contadores minoristas donde la fiabilidad debe venir primero pero la presencia de marca todavía importa.', 'Abra el generador con estos ajustes precargado y adapte los colores y la superposición a su propia marca. La visión clave: las mejoras de fiabilidad por sí solas pueden aumentar dramáticamente el compromiso, incluso antes de añadir cualquier estilo visual.', 'Vea la guía de aprendizaje relacionada para mejorar las campañas QR existentes para la metodología completa detrás de este enfoque.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Enlace al generador preconfigurado con la configuración de la cafetería para la personalización inmediata',
          caption: 'Comience con una configuración probada y personalice para su marca',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Abra el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Buscar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Estudio de caso: pantalla de contador de pago múltiple',
      paragraphs: ['Este ejemplo sigue una tienda de ropa boutique que había acumulado cinco códigos QR diferentes en su registro: pago bancario, consejos, Instagram, Google comentarios, y un enlace de contratación. Cada uno se generó de una fuente diferente, impreso en diferentes momentos, y se exhibió en stands desajustados. El caos visual estaba socavando la estética cuidadosamente curada de la tienda, y el personal trató regularmente con los clientes escaneando el código equivocado.', 'La solución requiere la separación de preocupaciones: los códigos de pago necesitan la máxima fiabilidad con estilo conservador, mientras que los códigos de marketing pueden ser más expresivos. El sistema de visualización unificado que surgió demuestra cómo equilibrar la presencia de marca contra las exigencias funcionales de diferentes casos de uso de QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Un área de registro desordenada que muestra cinco códigos QR desajustados en varios soportes y materiales impresos',
          caption: 'El punto de partida caótico: cinco códigos QR desconectados compitiendo por atención y causando confusión al cliente',
        },
      ],
    },
    {
      heading: 'Priorizar la experiencia de pago',
      paragraphs: ['El método de pago primario de la tienda utiliza un estándar regional que requiere estricto cumplimiento de la carga útil. Las pruebas revelaron que incluso el estilo menor afectaba la velocidad del escaneo con ciertas aplicaciones bancarias. La decisión: mantener el pago QR completamente sin modificar excepto la optimización del tamaño y la impresión profesional en el stock de tarjetas mate.', 'Este enfoque conservador significaba que el código de pago parecía menos \'marcado\' que ideal, pero las tasas de terminación de transacciones mejoraron dramáticamente. La visión: los momentos de pago no son oportunidades de marca - son momentos de fiabilidad. Los clientes aprecian la velocidad y la certeza sobre la estética cuando el dinero está involucrado.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Un código QR de pago limpio y grande en stock profesional de tarjetas mate, colocado prominentemente en el registro',
          caption: 'El pago QR: tamaño generoso, impreso profesionalmente, con estilo conservador para el reconocimiento instantáneo por las aplicaciones bancarias',
        },
      ],
    },
    {
      heading: 'Creación de la pantalla de acción secundaria',
      paragraphs: ['Para consejos, comentarios, sociales y contratación, la tienda podría ser más expresiva. Estos códigos fueron regenerados en ANQR con un estilo de marca consistente: la firma de la tienda verde oliva en crema, estilo de módulo redondeado, y un centro sutil superpuesto con el icono de la tienda. Corrección de errores H aseguraba la fiabilidad incluso con el estilo.', 'Estos cuatro códigos fueron arreglados en un panel de marca situado junto (no compitiendo con) el código de pago. Las etiquetas claras en la tipografía de la tienda explicaron el propósito de cada código. La jerarquía visual era intencional: el pago era único y prominente; las acciones secundarias agrupadas como opciones.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Un panel de marca que muestra cuatro códigos QR de estilo para consejos, opiniones, sociales y contratación, con etiquetas claras',
          caption: 'El panel de acción secundario: marca consistente, etiquetado claro, posicionado como opciones en lugar de distracciones',
        },
      ],
    },
    {
      heading: 'Diseño de sistema de visualización',
      paragraphs: ['La pantalla física resolvió varios problemas simultáneamente. Tanto el soporte de pago como el panel secundario utilizaron materiales mates para eliminar el resplandor de la iluminación superior. Heights fueron optimizados para clientes de diferentes estaturas. Angles dirigido hacia la cola del cliente en lugar de plana en el mostrador.', 'Críticamente, la tienda creó huellas de repuesto de enlaces de configuración ANQR bloqueados. Cuando el código de consejos finalmente consiguió café-splashed, el personal lo reemplazó en minutos utilizando la configuración almacenada - sin capturas de pantalla, sin adivinar en los ajustes, sin degradación de calidad.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Un diagrama que muestra el diseño de la pantalla física: alturas, ángulos, materiales y la relación entre el pago y las pantallas secundarias',
          caption: 'Sistema de visualización: ergonomía física optimizada para un escaneo fiable a través de las alturas del cliente y las condiciones de iluminación',
        },
      ],
    },
    {
      heading: 'Mejoras operacionales',
      paragraphs: ['Seis semanas después del despliegue, la tienda documentó mejoras significativas: cero quejas de clientes sobre la confusión del \'código equivocado\', tiempos de transacción más rápidos, y un aumento de 3 veces en las presentaciones de propinas (los clientes podrían ahora encontrar y escanear el código de propina sin pedir indirectamente al personal). Las reseñas de Google también aumentaron a medida que la fricción removida QR dedicada, bien etiquetada.', 'La capacitación del personal se hizo más sencilla: El código de pago es el grande, todo lo demás está en el panel. Cuando las aplicaciones de pago se actualizaron y una brevemente mostraron un escaneo más lento, el diseño de código de pago conservador significaba que todavía funcionaba - sólo marginalmente más lento en lugar de fallar por completo.', 'Vea la guía Aprende sobre códigos QR para pagos al por menor por los principios detrás de este diseño del sistema de visualización.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Un panel de control de métricas que muestra comparaciones antes/después: incidentes de confusión, tiempo de transacción, frecuencia de la propina, presentaciones de revisión',
          caption: 'Seis semanas de datos operativos que demuestran el impacto empresarial de un sistema de pantalla multi-QR considerado',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Abra el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Buscar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Estudio de caso: desde la tarjeta de empresa a Billboard',
      paragraphs: ['Este ejemplo sigue a una empresa de producción de eventos preparándose para una conferencia importante. Necesitaban el mismo código QR - enlazando a la aplicación del evento - desplegados en formatos radicalmente diferentes: inserciones de placa de asistentes (3cm), tarjetas de mesa (8cm), señalización de mesa de registro (30cm), carteles de determinación (60cm), y una masiva bandera de fondo de escenario (4 metros). Cada formato tenía diferentes distancias de visualización, condiciones de iluminación y flujos de trabajo de producción.', 'El desafío no era sólo técnico, sino operativo. Múltiples proveedores manejaron diferentes trabajos de impresión, y la empresa necesitaba asegurar resultados consistentes y escandalosos independientemente de quién produjo qué. Su solución se centró en la exportación de SVG y la documentación de entrega rigurosa.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Un collage que muestra el mismo código QR desplegado en cinco tamaños diferentes, desde la insignia a la bandera',
          caption: 'Un código QR, cinco tamaños de despliegue: el desafío de mantener la escanerabilidad de centímetros a metros',
        },
      ],
    },
    {
      heading: '¿Por qué los eventos anteriores tenían problemas',
      paragraphs: ['En su última conferencia, la compañía había experimentado fracasos embarazosos. El banner de escenario QR fue generado como un pequeño PNG y escalado en el software de diseño - el resultado parecía aceptable desde una distancia, pero no pudo escanear fiablemente de la audiencia. Badge Los QR eran demasiado estilo y demasiado pequeños, frustrantes asistentes tratando de agregar contactos. La configuración inconsistente a través de formatos significaba que el QR \'samo\' realmente parecía diferente en cada pieza.', 'El análisis post-evento reveló la causa raíz: ninguna única fuente de verdad. Cada diseñador había recreado el QR con ajustes ligeramente diferentes, y cada proveedor de impresión había procesado archivos de manera diferente. Calidad degradada a través del juego telefónico de las entregas de archivos.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografías cercanas que muestran fallas de escaneo: módulos de banner pixelated, códigos de insignia subvencionados, estilo inconsistente a través de formatos',
          caption: 'Análisis forense de fracasos anteriores del evento: cada formato había introducido diferentes problemas de calidad',
        },
      ],
    },
    {
      heading: 'El primer flujo de trabajo SVG',
      paragraphs: ['Para este evento, la empresa estableció un protocolo estricto: un maestro QR generado en ANQR con ajustes óptimos (Error Correction H, zona tranquila generosa, estilo limpio), exportado como SVG, y almacenado como única fuente autorizada. El enlace de configuración ANQR se documentó junto con el archivo SVG para que el código pudiera ser regenerado si fuera necesario.', 'Cada diseñador y proveedor recibió el mismo maestro SVG con instrucciones explícitas: lugar al tamaño requerido, no modificar, mantener la limpieza de zona tranquila. Para los proveedores que requieren formatos de raster, la compañía proporcionó PNGs pre-rendered en tamaños específicos con convenciones claras de nombres que indican uso previsto.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Un paquete de archivo que muestra el master SVG, PNG específico de tamaño, documento de especificación y enlace de configuración',
          caption: 'El paquete de entrega: todo lo que los proveedores necesitan para producir resultados consistentes sin adivinar',
        },
      ],
    },
    {
      heading: 'Consideraciones específicas de tamaño',
      paragraphs: ['Cada formato requiere atención específica. Inserciones de placa a 3cm necesitaban el QR para ocupar el máximo espacio disponible - distancia de exploración sería la longitud del brazo. Tiendas de mesa a 8cm podrían incluir enmarcado decorativo fuera de la zona tranquila. El banner de 4 metros requiere cálculo: desde la distancia típica del público (15-20 metros), los módulos deben ser claramente distinguidos por las cámaras telefónicas, lo que significa que el QR necesita ser al menos 80 cm dentro del diseño del banner.', 'La empresa creó una guía de tamaño que documenta las dimensiones mínimas de QR para cada distancia de escaneado esperada. Esto se convirtió en un activo reutilizable para eventos futuros, eliminando las adivinanzas del proceso de diseño.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Un gráfico que muestra la relación entre distancia de escaneado, tamaño mínimo de QR y dimensiones de módulos para cada formato de evento',
          caption: 'La matriz de tamaño: dimensiones calculadas garantizando un escaneo fiable en la distancia de visualización esperada de cada formato',
        },
      ],
    },
    {
      heading: 'Resultados de producción',
      paragraphs: ['La validación del día de la conferencia fue sistemática: el personal puso a prueba cada QR desplegado antes de abrir las puertas. La placa inserta escaneada instantáneamente a la longitud del brazo. Las carpas de mesa funcionaban de forma fiable en la iluminación variable de las salas de descanso. La bandera del escenario - la vergüenza del evento anterior - escaneado con éxito desde el centro del área de audiencia.', 'Cero quejas de escaneo fueron registradas entre 2.000 asistentes. El triunfo operativo fue igualmente significativo: cuando una adición de patrocinador de última hora requirió nueva señalización, el equipo de producción lo generó del maestro SVG en minutos, con confianza en que coincidiría con todo lo demás.', 'Vea la guía de aprendizaje sobre códigos QR listos para imprimir para el marco de decisión SVG vs PNG y las mejores prácticas de entrega.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografía de eventos que muestra a los asistentes escaneando con éxito códigos QR en varios tamaños y distancias en todo el lugar',
          caption: 'El éxito del día de la conferencia: el escaneo fiable en todos los formatos, desde los primeros planos de placas hasta los tiros de distancia de banner de escenario',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Abra el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Buscar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Estudio de caso: Salón del aeropuerto Visualización digital',
      paragraphs: ['Este ejemplo sigue un salón de aerolíneas que había estado utilizando códigos QR estáticos en sus pantallas de bienvenida digital. Las pantallas mostraron contenido promocional rotativo, pero el código QR para el registro de salón se sentó en una esquina, estática y fácilmente pasada por alto. Análisis mostró sólo el 15% de los huéspedes elegibles utilizaron el check-in de QR a pesar de ser más rápido que la cola de escritorio. La mayoría de los invitados simplemente no lo notaron.', 'La hipótesis era simple: en un entorno visualmente ocupado con contenido en movimiento, un QR estático se vuelve invisible. La solución necesaria para que el QR sea notable sin comprometer la fiabilidad necesaria para un flujo de facturación donde el fracaso significaría viajeros frustrados y colas de escritorio más largas.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Una pantalla digital en un salón del aeropuerto que muestra contenido promocional con un pequeño código QR estático en la esquina',
          caption: 'La configuración original: un QR estático perdido en un mar de contenido promocional dinámico, alcanzando sólo el 15% de adopción',
        },
      ],
    },
    {
      heading: 'Designing Safe Animation',
      paragraphs: ['La señalización digital del salón utilizó grandes paneles LED - un ambiente desafiante donde la animación agresiva podría crear problemas de escaneo. El equipo de diseño comenzó de forma conservadora: un suave efecto de pulso que subtly expandió y contrajo la presencia visual de QR sin modificar la estructura de código real. El tiempo del marco se estableció lento (250ms) para evitar cualquier problema del flicker con la frecuencia de refresco LED.', 'La validación del modo de seguridad confirmó que cada marco seguía siendo escandaloso. Pruebas adicionales en los paneles LED reales revelaron que el pulso necesitaba ser aún más sutil que las previsiones de escritorio sugeridas - brillo LED y ángulos de visualización afectados el contraste percibido más de lo esperado.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'El panel de ajustes de animación ANQR que muestra la configuración del pulso: tiempo lento, intensidad sutil, modo de seguridad activado',
          caption: 'Configuración de animación: parámetros ajustados para la pantalla del panel LED manteniendo la fiabilidad del escaneo en cada marco',
        },
      ],
    },
    {
      heading: 'Integración con Contenido de Signage',
      paragraphs: ['El QR animado fue colocado en una "zona estable" dedicada del diseño de la pantalla - un área que permaneció constante mientras el contenido promocional giraba en el área de visualización principal. Esta separación fue crucial: el QR necesitaba estabilidad visual para escanear incluso a la vez que atraer la atención a través de su sutil animación.', 'Se agregó una llamada a la acción clara junto al QR: "Skip the queue - escaneo para entrar." El texto permaneció estático mientras el QR pulsaba, creando una jerarquía visual que atrajo el ojo a la oportunidad de escanear sin abrumar el contenido promocional.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Un diagrama de diseño de pantalla que muestra el QR animado en una zona estable mientras el contenido promocional gira en la zona principal',
          caption: 'Asignación inmobiliaria de pantalla: el QR animado ocupa una zona estable separada del contenido promocional rotativo',
        },
      ],
    },
    {
      heading: 'Despliegue técnico',
      paragraphs: ['El QR animado fue exportado como un GIF con ajustes optimizados para la señalización CMS. Consideraciones de tamaño de archivo importadas - el sistema de gestión de contenidos del salón tenía límites de carga, y archivos demasiado grandes causaron tartamudeo de reproducción. La última exportación equilibrada calidad visual contra el tamaño del archivo limitando la paleta de colores y optimizando el conteo del marco.', 'El despliegue incluía un retroceso: si el GIF no jugaba por ningún motivo, el sistema de señalización mostraría una copia de seguridad de PNG estática. Esta redundancia asegura que la capacidad de facturación nunca se perdió debido a problemas técnicos con la animación.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Una interfaz CMS que muestra la carga QR animada con la imagen estática de retroceso configurada',
          caption: 'Configuración CMS de señalización: primario animado con retroceso estático asegurando la capacidad de check-in nunca se interrumpe',
        },
      ],
    },
    {
      heading: 'Impacto medido',
      paragraphs: ['Después de un mes de operación, la adopción de check-in QR aumentó de 15% a 24% - un 60% de mejora relativa. Las encuestas de comentarios de los clientes indicaron que el QR animado era "más fácil de notar" y "sentirse más moderno". Los horarios de la oficina disminuyeron mediblemente durante los períodos máximos, ya que más invitados se sirvieron por vía QR.', 'Importantemente, se reportaron cero fallos de escaneo a pesar de miles de escaneos diarios. El enfoque conservador de animación había alcanzado el objetivo de atención sin sacrificar la confiabilidad que demandaba un flujo de check-in. El salón posteriormente lanzó QRs similares animados a sus otros lugares.', 'Vea la guía Aprende sobre códigos QR animados para señalización digital para los principios técnicos detrás del diseño de animación seguro.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Un dashboard muestra aumento de la tasa de adopción, reducción del tiempo de cola y fiabilidad del escaneo de cero falla durante el período de despliegue',
          caption: 'Un mes de datos: aumento del 60% de la adopción, tiempos reducidos de cola y mantenimiento de la confiabilidad perfecta del escaneo',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Abra el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Buscar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Case Study: Global Product Launch QR Campaign',
      paragraphs: ['Este ejemplo sigue a una empresa de electrónica de consumo lanzando un nuevo producto simultáneamente en 12 mercados a través de 8 idiomas. Cada equipo regional de marketing necesitaba producir embalaje, exhibiciones al por menor y materiales promocionales con códigos QR que se vinculan con las páginas de productos localizadas. Los lanzamientos anteriores habían resultado en un estilo QR inconsistente, fallas ocasionales de escaneo, y un "juego de teléfono" de la deriva de configuración mientras cada equipo recreaba códigos de capturas de pantalla.', 'La solución aprovechó los enlaces de configuración compartidos de ANQR para establecer una única fuente de verdad que cada equipo regional podría acceder, independientemente de su lenguaje de interfaz. La carga útil QR utilizó una redireccion inteligente que detectó el lenguaje de usuario, por lo que un código funcionó globalmente mientras entregaba experiencias localizadas.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Un mapa mundial que muestra 12 ubicaciones de mercado con códigos QR, algunos visualmente inconsistentes entre sí',
          caption: 'El reto: 12 mercados, 8 idiomas, y una historia de incoherentes implementaciones QR en todas las regiones',
        },
      ],
    },
    {
      heading: 'Establecimiento de la configuración maestra',
      paragraphs: ['El equipo de marca global creó la configuración autorizada de QR en ANQR: colores de marca que coinciden con la identidad visual de la línea de productos, corrección de errores H para la fiabilidad en todas las aplicaciones impresas y digitales, y estilo que reproduciría consistentemente independientemente de los métodos de producción locales. La configuración estaba bloqueada y el enlace de acciones documentado en el resumen de la campaña mundial.', 'Críticamente, la URL codificada utilizó un servicio de redirección de detección de idiomas. Cuando se escanea, los usuarios fueron automáticamente enrutados a su página de producto del idioma local. Esto significaba que los 12 mercados podían utilizar códigos QR idénticos - ninguna variación de carga útil de mercado que pudiera introducir errores.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'La interfaz ANQR muestra la configuración principal con colores de marca, ECC H y la URL de redireccion inteligente',
          caption: 'La configuración maestra: estándares de marca global codificados en una única fuente de verdad compartida',
        },
      ],
    },
    {
      heading: 'Corriente de trabajo del equipo regional',
      paragraphs: ['Cada equipo regional de marketing recibió el enlace de configuración con instrucciones simples: abrir el enlace, verificar la vista previa coincide con las directrices de la marca, exportar en el formato requerido para su aplicación. La interfaz ANQR mostrada en el idioma preferido de cada equipo, pero los ajustes QR subyacentes siguieron siendo idénticos independientemente del lenguaje de interfaz.', 'Cuando el equipo japonés necesitaba SVG para exhibiciones de alta gama y el equipo brasileño necesitaba PNG para redes sociales, ambos exportados desde la misma configuración. Cuando el proveedor de impresión del equipo alemán solicitó valores de color específicos, podrían hacer referencia a la configuración directamente en lugar de adivinar desde una captura de pantalla.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Capturas de pantalla que muestran el mismo enlace de configuración abierto en interfaces japonesas, portuguesas y alemanas',
          caption: 'La misma configuración, diferentes interfaces: los equipos regionales trabajan en su idioma preferido manteniendo la coherencia global',
        },
      ],
    },
    {
      heading: 'Gestión de las diferencias regionales',
      paragraphs: ['Algunos mercados requerían adaptaciones menores. El equipo chino necesitaba una versión con un marco optimizado WeChat para compartir social. En lugar de modificar al maestro, crearon una variante documentada con su propio enlace de configuración, claramente etiquetada como "variante CN-WeChat" en la biblioteca de activos de la campaña. Esto mantuvo la trazabilidad permitiendo la localización necesaria.', 'El equipo de marca estableció una regla simple: cualquier variación del maestro requiere un nuevo enlace de configuración documentado. No hay modificaciones en los archivos exportados, no \'quick fixes\' en el software de diseño. Esto impidió la deriva de configuración que había asolado los lanzamientos anteriores.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Una interfaz de biblioteca de activos que muestra la configuración principal y las variantes regionales aprobadas, cada una con su propio enlace',
          caption: 'Gobernanza de activos de campaña: configuración master más variantes documentadas, todo rastreable a través de enlaces de configuración',
        },
      ],
    },
    {
      heading: 'Resultados de lanzamiento',
      paragraphs: ['El día de lanzamiento del producto vio códigos QR desplegados en envases, pantallas al por menor, materiales de eventos y campañas digitales en los 12 mercados simultáneamente. Las auditorías de calidad confirmaron la consistencia visual en todas las regiones - el QR en las pantallas minoristas de Tokio coincidieron con el QR en el embalaje de São Paulo coincidieron con los banners del evento de Berlín.', 'Se reportaron cero fallos de escaneo en los mercados. Cuando se necesitaba un cambio de URL de la página de producto post-lanzamiento, el servicio de redireccionamiento lo manejaba invisiblemente - sin necesidad de reimpresión. El equipo mundial estimó que el enfoque de enlace de configuración ahorraba más de 40 horas de tiempo de coordinación en comparación con su metodología de lanzamiento anterior.', 'Vea la guía de Aprende sobre la colaboración interlingüe de QR para los principios de flujo de trabajo detrás de la coherencia de la campaña mundial.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Una cuadrícula de fotografías que muestran el despliegue constante de QR en diferentes mercados: Tienda minorista de Tokio, embalaje São Paulo, eventos de Berlín',
          caption: 'Concordancia global alcanzada: presentación QR idéntica en 12 mercados a pesar de diferentes idiomas, proveedores y formatos',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Abra el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Buscar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Buscar artículos de aprendizaje', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra la guía completa del usuario', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abra la galería', type: 'gallery' },
  ],
};
