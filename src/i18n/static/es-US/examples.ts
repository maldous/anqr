import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Ejemplos de ANQR',
  description:
    'Cinco ejemplos de estilo de producción del mundo real que muestran dónde los códigos QR crean valor medible: mejora de un código de mostrador minorista heredado, pagos minoristas de marca y acciones de "escaneo", escala de impresión desde folletos hasta vallas publicitarias, QR animado para señalización digital y colaboración multilingüe mediante enlaces Anchor que se pueden compartir. Cada ejemplo incluye imágenes, restricciones prácticas y un enlace de remezcla al generador.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'abre el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explorar artículos de aprendizaje', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra la Guía del usuario completa', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Estudio de caso: Mejora del QR del mostrador minorista',
      paragraphs: [
        'Este ejemplo del mundo real sigue a un pequeño café que había estado usando el mismo código QR en su mostrador durante tres años. El código original se generó rápidamente durante la pandemia, se imprimió en papel estándar y se deslizó en un soporte de plástico. Todavía funcionaba (técnicamente) pero los clientes a menudo necesitaban múltiples intentos para escanearlo y no hizo nada para reforzar la identidad de marca cuidadosamente elaborada del café.',
        'La transformación comenzó con una simple auditoría: el código existente codificaba la URL del menú en línea de la cafetería, que querían conservar. El desafío era hacer que el QR pareciera parte de la experiencia del café en lugar de una utilidad de último momento a partir de 2020.',
      ],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Un código QR desgastado en un soporte de plástico que muestra desgaste visible, huellas dactilares e impresiones descoloridas.',
          caption:
            'El punto de partida: tres años de servicio en el mostrador habían dejado el QR original apenas funcional',
        },
      ],
    },
    {
      heading: 'Diagnóstico de los problemas del código original',
      paragraphs: [
        'Las pruebas revelaron múltiples problemas: el código original usaba Corrección de Error L (redundancia mínima), tenía una zona silenciosa de solo 2 módulos y se imprimió en baja resolución. Bajo la cálida iluminación de tungsteno del café, los módulos negros ya descoloridos apenas contrastaban con el papel amarillento. Los teléfonos más antiguos tuvieron problemas; Los teléfonos más nuevos tuvieron éxito, pero con un retraso notable.',
        'Más allá de las cuestiones técnicas, el cuadrado genérico en blanco y negro no comunicaba nada sobre la marca. Los clientes dudaron antes de escanear, una sutil barrera de confianza que redujo el compromiso con el menú digital cuidadosamente diseñado de la cafetería.',
      ],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Una superposición de diagnóstico que muestra las deficiencias técnicas del QR original: ECC baja, zona silenciosa mínima, contraste deficiente',
          caption:
            'Análisis técnico que revela por qué el código heredado tuvo un rendimiento inferior en condiciones del mundo real',
        },
      ],
    },
    {
      heading: 'El proceso de elevación',
      paragraphs: [
        'Utilizando ANQR, el propietario de la cafetería recreó el código con la URL del menú idéntica pero con configuraciones drásticamente mejoradas: Corrección de errores H para máxima resiliencia, una zona silenciosa de 6 módulos para una detección de límites confiable y colores de marca (módulos de color burdeos intenso sobre fondo crema) que coincidían con la paleta interior de la cafetería.',
        'Se agregó una pequeña superposición central con el logotipo de la cafetería, mantenida deliberadamente sutil para mantener la capacidad de escaneo y al mismo tiempo proporcionar un reconocimiento instantáneo de la marca. El modo de seguridad confirmó que el nuevo diseño se escaneó de manera confiable en los dispositivos de prueba antes de cualquier impresión.',
      ],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'La interfaz ANQR que muestra la configuración: colores de la marca, ECC apropiado, zona silenciosa generosa, superposición sutil del logotipo',
          caption:
            'Creación de la configuración mejorada: cada configuración elegida para equilibrar la expresión de la marca con la confiabilidad del escaneo',
        },
      ],
    },
    {
      heading: 'Resultados mensurables',
      paragraphs: [
        'Después de implementar el nuevo QR en cartulina laminada mate profesional, la cafetería realizó un seguimiento de los resultados durante cuatro semanas. La tasa de éxito del escaneo mejoró de aproximadamente el 70% a casi el 100%. El tiempo promedio de escaneo se redujo de 3 a 4 segundos a menos de 1 segundo. Lo más significativo es que la participación en el menú aumentó un 40 %: los clientes que antes miraban el QR y se daban por vencidos, ahora escaneaban con confianza.',
        'El personal informó menos preguntas de los clientes sobre "cómo usar el QR" y no más casos de escribir manualmente la URL para clientes frustrados. La apariencia de la marca también generó conversaciones y los clientes comentaron positivamente sobre el diseño cohesivo.',
      ],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Una comparación antes/después con métricas: tasa de éxito del escaneo, tiempo promedio de escaneo y mejoras en el recuento de escaneos semanales',
          caption:
            'Cuatro semanas de datos que muestran el impacto mensurable de una mejora reflexiva del QR',
        },
      ],
    },
    {
      heading: 'Recrea esta configuración',
      paragraphs: [
        "The café's configuration demonstrates conservative but effective branding: Error Correction H, 6-module quiet zone, high-contrast brand colours, and a minimal centre overlay. Este equilibrio funciona para la mayoría de las aplicaciones de mostradores minoristas donde la confiabilidad debe ser lo primero pero la presencia de la marca aún es importante.",
        'Abre el generador con estas configuraciones precargadas y adapta los colores y la superposición a tu propia marca. La idea clave: las mejoras en la confiabilidad por sí solas pueden aumentar drásticamente la participación, incluso antes de agregar cualquier estilo visual.',
        'Consulte la guía de aprendizaje relacionada sobre cómo mejorar las campañas QR existentes para conocer la metodología completa detrás de este enfoque.',
      ],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Enlace al generador preconfigurado con la configuración de la cafetería para una personalización inmediata',
          caption: 'Comience con una configuración probada y personalícela para su marca',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Explorar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Estudio de caso: mostrador de mostrador de pagos múltiples',
      paragraphs: [
        'This example follows a boutique clothing store that had accumulated five different QR codes at their register: bank payment, tips, Instagram, Google reviews, and a hiring link. Cada uno se generó a partir de una fuente diferente, se imprimió en diferentes momentos y se exhibió en soportes que no coincidían. El caos visual estaba socavando la estética cuidadosamente seleccionada de la tienda, y el personal trataba regularmente con clientes que escaneaban el código incorrecto.',
        'The solution required separating concerns: payment codes needed maximum reliability with conservative styling, while marketing codes could be more expressive. El sistema de visualización unificado que surgió demuestra cómo equilibrar la presencia de la marca con las demandas funcionales de diferentes casos de uso de QR.',
      ],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Un área de registro desordenada que muestra cinco códigos QR que no coinciden en varios stands y materiales impresos.',
          caption:
            'El caótico punto de partida: cinco códigos QR desconectados que compiten por la atención y causan confusión en los clientes',
        },
      ],
    },
    {
      heading: 'Priorizar la experiencia de pago',
      paragraphs: [
        'El método de pago principal de la tienda utilizaba un estándar regional que requería un estricto cumplimiento de la carga útil. Las pruebas revelaron que incluso un estilo menor afectaba la velocidad de escaneo con ciertas aplicaciones bancarias. La decisión: mantener el QR de pago sin modificaciones, excepto para la optimización del tamaño y la impresión profesional en cartulina mate.',
        "Este enfoque conservador significó que el código de pago pareciera menos 'de marca' de lo ideal, pero las tasas de finalización de transacciones mejoraron dramáticamente. La idea: los momentos de pago no son oportunidades de marca, son momentos de confiabilidad. Los clientes valoran la velocidad y la seguridad por encima de la estética cuando se trata de dinero.",
      ],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Un código QR de pago grande y limpio en cartulina mate profesional, ubicado en un lugar destacado en la caja registradora',
          caption:
            'El QR de pago: de tamaño generoso, impreso profesionalmente y con un estilo conservador para que las aplicaciones bancarias lo reconozcan instantáneamente',
        },
      ],
    },
    {
      heading: 'Crear la pantalla de acción secundaria',
      paragraphs: [
        'Para consejos, reseñas, redes sociales y contratación, la tienda podría ser más expresiva. Estos códigos se regeneraron en ANQR con un estilo de marca consistente: el verde oliva característico de la tienda sobre crema, un estilo de módulo redondeado y una sutil superposición central con el ícono de la tienda. La Corrección de Error H aseguró la confiabilidad incluso con el estilo.',
        'Estos cuatro códigos se organizaron en un panel con la marca ubicado al lado (sin competir con) el código de pago. Las etiquetas claras en la tipografía de la tienda explicaban el propósito de cada código. La jerarquía visual fue intencionada: el pago era único y prominente; acciones secundarias agrupadas como opciones.',
      ],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Un panel de marca que muestra cuatro códigos QR con estilos para sugerencias, reseñas, redes sociales y contratación, con etiquetas claras.',
          caption:
            'El panel de acción secundario: marca consistente, etiquetado claro, posicionado como opciones en lugar de distracciones.',
        },
      ],
    },
    {
      heading: 'Diseño del sistema de visualización',
      paragraphs: [
        'La pantalla física resolvió varios problemas simultáneamente. Tanto el puesto de pago como el panel secundario utilizaron materiales mate para eliminar el resplandor de la iluminación cenital. Las alturas se optimizaron para clientes de diferentes estaturas. Ángulos dirigidos hacia la cola de clientes en lugar de planos sobre el mostrador.',
        'Fundamentalmente, la tienda creó impresiones de repuesto a partir de enlaces de configuración ANQR bloqueados. Cuando el código de sugerencias finalmente se salpicó con café, el personal lo reemplazó en cuestión de minutos usando la configuración almacenada: sin capturas de pantalla, sin adivinar la configuración, sin degradación de la calidad.',
      ],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Un diagrama que muestra el diseño de la pantalla física: alturas, ángulos, materiales y la relación entre el pago y las pantallas secundarias.',
          caption:
            'Plano del sistema de visualización: ergonomía física optimizada para un escaneo confiable en todas las alturas y condiciones de iluminación del cliente',
        },
      ],
    },
    {
      heading: 'Mejoras operativas',
      paragraphs: [
        'Seis semanas después de la implementación, la tienda documentó mejoras significativas: cero quejas de los clientes sobre la confusión del "código incorrecto", tiempos de transacción más rápidos y un aumento de 3 veces en los envíos de propinas (los clientes ahora podían encontrar y escanear el código de propina sin preguntar incómodamente al personal). Las reseñas de Google también aumentaron a medida que el QR dedicado y bien etiquetado eliminó la fricción.',
        'La formación del personal se volvió más sencilla: "el código de pago es el más grande, todo lo demás está en el panel". Cuando las aplicaciones de pago se actualizaron y una mostró brevemente un escaneo más lento, el diseño conservador del código de pago significó que todavía funcionaba, sólo que un poco más lento en lugar de fallar por completo.',
        'Consulte la guía de aprendizaje sobre códigos QR para pagos minoristas para conocer los principios detrás del diseño de este sistema de visualización.',
      ],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Un panel de métricas que muestra comparaciones antes y después: incidentes de confusión, tiempo de transacción, frecuencia de propinas, envíos de reseñas.',
          caption:
            'Seis semanas de datos operativos que demuestran el impacto empresarial de un inteligente sistema de visualización QR múltiple',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Explorar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Estudio de caso: de la tarjeta de presentación al cartel publicitario',
      paragraphs: [
        'Este ejemplo sigue a una empresa de producción de eventos que se prepara para una conferencia importante. Necesitaban el mismo código QR, vinculado a la aplicación del evento, implementado en formatos radicalmente diferentes: inserciones de credenciales de asistente (3 cm), tarjetas de mesa (8 cm), señalización en el mostrador de registro (30 cm), carteles de orientación (60 cm) y un enorme cartel de fondo para el escenario (4 metros). Cada formato tenía diferentes distancias de visualización, condiciones de iluminación y flujos de trabajo de producción.',
        'El desafío no era sólo técnico: era operativo. Varios proveedores manejaban diferentes trabajos de impresión y la empresa necesitaba garantizar resultados consistentes y escaneables independientemente de quién produjera qué. Su solución se centró en la exportación SVG y una documentación de transferencia rigurosa.',
      ],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Un collage que muestra el mismo código QR desplegado en cinco tamaños diferentes, desde una insignia hasta un banner.',
          caption:
            'Un código QR, cinco tamaños de implementación: el desafío de mantener la escaneabilidad de centímetros a metros',
        },
      ],
    },
    {
      heading: 'Por qué los eventos anteriores tuvieron problemas',
      paragraphs: [
        'En su última conferencia, la empresa experimentó fracasos vergonzosos. El QR del banner del escenario se generó como un pequeño PNG y se amplió en un software de diseño; el resultado parecía aceptable desde la distancia, pero no logró escanearse de manera confiable desde la audiencia. Los QR de las insignias tenían demasiado estilo y eran demasiado pequeños, lo que frustraba a los asistentes que intentaban agregar contactos. Las configuraciones inconsistentes entre los formatos significaban que el "mismo" QR en realidad se veía diferente en cada pieza.',
        'El análisis posterior al evento reveló la causa raíz: no hay una única fuente de verdad. Cada diseñador había recreado el QR con configuraciones ligeramente diferentes y cada proveedor de impresión había procesado los archivos de manera diferente. Calidad degradada por el juego telefónico de entrega de archivos.',
      ],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografías en primer plano que muestran fallas de escaneo: módulos de pancartas pixelados, códigos de identificación de tamaño insuficiente, estilos inconsistentes en todos los formatos.',
          caption:
            'Análisis forense de fallos de eventos anteriores: cada formato había introducido diferentes problemas de calidad',
        },
      ],
    },
    {
      heading: 'El primer flujo de trabajo SVG',
      paragraphs: [
        'Para este evento, la empresa estableció un protocolo estricto: un QR maestro generado en ANQR con configuraciones óptimas (corrección de errores H, zona silenciosa generosa, estilo limpio), exportado como SVG y almacenado como única fuente autorizada. El enlace de configuración ANQR se documentó junto con el archivo SVG para que el código pudiera regenerarse si fuera necesario.',
        'Cada diseñador y proveedor recibió el mismo archivo maestro SVG con instrucciones explícitas: colocarlo en el tamaño requerido, no modificar, mantener la zona tranquila. Para los proveedores que requieren formatos ráster, la empresa proporcionó PNG prerenderizados en tamaños específicos con convenciones de nomenclatura claras que indicaban el uso previsto.',
      ],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Un paquete de archivos que muestra el maestro SVG, los PNG de tamaño específico, el documento de especificaciones y el enlace de configuración.',
          caption:
            'El paquete de transferencia: todo lo que los proveedores necesitaban para producir resultados consistentes sin adivinar',
        },
      ],
    },
    {
      heading: 'Consideraciones específicas del tamaño',
      paragraphs: [
        'Cada formato requería una atención específica. Las inserciones de insignias de 3 cm necesitaban que el QR ocupara el máximo espacio disponible; la distancia de escaneo sería la longitud del brazo. Las carpas de mesa de 8 cm podrían incluir marcos decorativos fuera de la zona tranquila. El banner de 4 metros requirió cálculos: desde la distancia típica de la audiencia (15-20 metros), los módulos debían ser claramente distinguibles por las cámaras de los teléfonos, lo que significaba que el QR debía estar al menos a 80 cm dentro del diseño del banner.',
        'La empresa creó una guía de tallas que documenta las dimensiones mínimas de QR para cada distancia de escaneo esperada. Esto se convirtió en un activo reutilizable para eventos futuros, eliminando conjeturas del proceso de diseño.',
      ],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Un gráfico que muestra la relación entre la distancia de escaneo, el tamaño mínimo de QR y las dimensiones del módulo para cada formato de evento.',
          caption:
            'La matriz de tamaño: dimensiones calculadas que garantizan un escaneo confiable a la distancia de visualización esperada de cada formato',
        },
      ],
    },
    {
      heading: 'Resultados de producción',
      paragraphs: [
        'La validación del día de la conferencia fue sistemática: el personal probó cada QR desplegado antes de que se abrieran las puertas. Las inserciones de la insignia se escanean instantáneamente con el brazo extendido. Las carpas de mesa funcionaron de manera confiable en la iluminación variable de las salas de descanso. El cartel del escenario, la vergüenza del evento anterior, se escaneó con éxito desde el centro del área de audiencia.',
        'No se registraron quejas de escaneo entre más de 2000 asistentes. La victoria operativa fue igualmente significativa: cuando la incorporación de un patrocinador de último momento requirió una nueva señalización, el equipo de producción la generó a partir del SVG maestro en minutos, confiando en que coincidiría con todo lo demás.',
        'Consulte la guía de aprendizaje sobre códigos QR listos para imprimir para el marco de decisión SVG vs PNG y las mejores prácticas de transferencia.',
      ],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografía del evento que muestra a los asistentes escaneando con éxito códigos QR en varios tamaños y distancias en todo el lugar.',
          caption:
            'Éxito del día de la conferencia: escaneo confiable en todos los formatos, desde primeros planos de credenciales hasta tomas a distancia de pancartas del escenario',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Explorar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Estudio de caso: Pantalla digital de sala VIP de aeropuerto',
      paragraphs: [
        'Este ejemplo sigue la sala VIP de una aerolínea que había estado utilizando códigos QR estáticos en sus pantallas de bienvenida digitales. Las pantallas mostraban contenido promocional rotativo, pero el código QR para el check-in en la sala VIP estaba en un rincón, estático y era fácil de pasar por alto. Los análisis mostraron que solo el 15% de los huéspedes elegibles utilizaron el check-in QR a pesar de ser más rápido que la cola en el escritorio. La mayoría de los invitados simplemente no lo notaron.',
        'La hipótesis era simple: en un entorno visualmente intenso con contenido en movimiento, un QR estático se vuelve invisible. La solución necesitaba hacer que el QR fuera visible sin comprometer la confiabilidad requerida para un flujo de check-in donde una falla significaría viajeros frustrados y colas de escritorio más largas.',
      ],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Una pantalla digital en una sala VIP de un aeropuerto que muestra contenido promocional con un pequeño código QR estático en la esquina',
          caption:
            'La configuración original: un QR estático perdido en un mar de contenido promocional dinámico, logrando solo un 15% de adopción',
        },
      ],
    },
    {
      heading: 'Diseñar animación segura',
      paragraphs: [
        'La señalización digital del salón utilizó grandes paneles LED: un entorno desafiante donde la animación agresiva podría crear problemas de escaneo. El equipo de diseño comenzó de manera conservadora: un efecto de pulso suave que expandía y contraía sutilmente la presencia visual del QR sin modificar la estructura del código real. La sincronización de fotogramas se configuró lenta (250 ms) para evitar problemas de parpadeo con la frecuencia de actualización del LED.',
        'La validación del modo de seguridad confirmó que todos los fotogramas seguían siendo escaneables. Pruebas adicionales en los paneles LED reales revelaron que el pulso debía ser incluso más sutil de lo que sugerían las vistas previas de escritorio: el brillo del LED y los ángulos de visión afectaron el contraste percibido más de lo esperado.',
      ],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'El panel de configuración de animación ANQR que muestra la configuración del pulso: sincronización lenta, intensidad sutil, modo de seguridad habilitado',
          caption:
            'Configuración de animación: parámetros ajustados para la visualización del panel LED manteniendo la confiabilidad del escaneo en cada cuadro',
        },
      ],
    },
    {
      heading: 'Integración con contenido de señalización',
      paragraphs: [
        'El QR animado se colocó en una "zona estable" dedicada del diseño de la pantalla, un área que permaneció constante mientras el contenido promocional rotaba en el área de visualización principal. Esta separación era crucial: el QR necesitaba estabilidad visual para escanear incluso mientras atraía la atención a través de su sutil animación.',
        'Se agregó una llamada a la acción clara junto al QR: "Salta la cola - escanea para registrarte". El texto permaneció estático mientras el QR pulsaba, creando una jerarquía visual que atraía la atención hacia la oportunidad de escaneo sin abrumar el contenido promocional.',
      ],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Un diagrama de diseño de pantalla que muestra el QR animado en una zona estable mientras el contenido promocional gira en el área principal.',
          caption:
            'Asignación de espacio en pantalla: el QR animado ocupa una zona estable separada del contenido promocional rotativo',
        },
      ],
    },
    {
      heading: 'Despliegue técnico',
      paragraphs: [
        'El QR animado se exportó como GIF con configuraciones optimizadas para el CMS de señalización. Las consideraciones sobre el tamaño de los archivos eran importantes: el sistema de gestión de contenidos de la sala tenía límites de carga y los archivos demasiado grandes provocaban interrupciones en la reproducción. La exportación final equilibró la calidad visual con el tamaño del archivo al limitar la paleta de colores y optimizar el número de fotogramas.',
        'La implementación incluyó una alternativa: si el GIF no se reproducía por algún motivo, el sistema de señalización mostraría una copia de seguridad PNG estática. Esta redundancia garantizó que la capacidad de registro nunca se perdiera debido a problemas técnicos con la animación.',
      ],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Una interfaz CMS que muestra la carga QR animada con una imagen estática alternativa configurada',
          caption:
            'Configuración de Signage CMS: principal animado con respaldo estático que garantiza que la capacidad de registro nunca se interrumpa',
        },
      ],
    },
    {
      heading: 'Impacto medido',
      paragraphs: [
        'Después de un mes de funcionamiento, la adopción del check-in QR aumentó del 15% al 24%, una mejora relativa del 60%. Las encuestas de comentarios de los huéspedes indicaron que el QR animado era "más fácil de notar" y "parecía más moderno". Los tiempos de cola en el escritorio disminuyeron considerablemente durante los períodos pico, ya que más huéspedes se auto atendieron a través del QR.',
        'Es importante destacar que no se informaron fallas de escaneo a pesar de miles de escaneos diarios. El enfoque de animación conservador había logrado el objetivo de atención sin sacrificar la confiabilidad que exigía el flujo de registro. Posteriormente, la sala lanzó QR animados similares en sus otras ubicaciones.',
        'Consulte la guía de aprendizaje sobre códigos QR animados para señalización digital para conocer los principios técnicos detrás del diseño de animación seguro.',
      ],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Un panel que muestra el aumento de la tasa de adopción, la reducción del tiempo de cola y la confiabilidad del escaneo sin fallas durante el período de implementación.',
          caption:
            'Un mes de datos: aumento del 60 % en la adopción, reducción de los tiempos de espera y mantenimiento de una confiabilidad de escaneo perfecta',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Explorar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Estudio de caso: Campaña QR de lanzamiento global de producto',
      paragraphs: [
        "Este ejemplo sigue a una empresa de electrónica de consumo que lanza un nuevo producto simultáneamente en 12 mercados en 8 idiomas. Cada equipo de marketing regional necesitaba producir empaques, exhibidores minoristas y materiales promocionales con códigos QR que vincularan a páginas de productos localizadas. Los lanzamientos anteriores habían resultado en estilos QR inconsistentes, fallas ocasionales en el escaneo y un 'juego telefónico' de deriva de configuración a medida que cada equipo recreaba códigos a partir de capturas de pantalla.",
        'La solución aprovechó los enlaces de configuración compartibles de ANQR para establecer una única fuente de información a la que todos los equipos regionales podían acceder, independientemente del idioma de su interfaz. La carga útil QR utilizó una redirección inteligente que detectaba el idioma del usuario, por lo que un código funcionaba globalmente y ofrecía experiencias localizadas.',
      ],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Un mapa mundial que muestra 12 ubicaciones de mercados con códigos QR, algunos visualmente inconsistentes entre sí.',
          caption:
            'El desafío: 12 mercados, 8 idiomas y un historial de implementaciones QR inconsistentes en todas las regiones',
        },
      ],
    },
    {
      heading: 'Estableciendo la configuración maestra',
      paragraphs: [
        'El equipo de marca global creó la configuración QR autorizada en ANQR: colores de marca que coinciden con la identidad visual de la línea de productos, Corrección de errores H para confiabilidad en todas las aplicaciones impresas y digitales, y un estilo que se reproduciría consistentemente independientemente de los métodos de producción locales. La configuración se bloqueó y el enlace para compartir se documentó en el resumen de la campaña global.',
        'Fundamentalmente, la URL codificada utilizó un servicio de redireccionamiento de detección de idioma. Cuando se escaneaba, los usuarios eran dirigidos automáticamente a la página del producto en su idioma local. Esto significaba que los 12 mercados podían usar códigos QR idénticos, sin variaciones de carga útil por mercado que pudieran introducir errores.',
      ],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'La interfaz ANQR que muestra la configuración maestra con colores de marca, ECC H y la URL de redireccionamiento inteligente',
          caption:
            'La configuración maestra: estándares de marca globales codificados en una única fuente de verdad que se puede compartir',
        },
      ],
    },
    {
      heading: 'Flujo de trabajo del equipo regional',
      paragraphs: [
        'Cada equipo de marketing regional recibió el enlace de configuración con instrucciones simples: abra el enlace, verifique que la vista previa coincida con las pautas de la marca, exporte en el formato requerido para su aplicación. La interfaz ANQR se mostraba en el idioma preferido de cada equipo, pero la configuración QR subyacente permaneció idéntica independientemente del idioma de la interfaz.',
        'Cuando el equipo japonés necesitaba SVG para exhibidores minoristas de alta gama y el equipo brasileño necesitaba PNG para las redes sociales, ambos exportaron desde la misma configuración. Cuando el proveedor de impresión del equipo alemán solicitó valores de color específicos, pudo consultar la configuración directamente en lugar de adivinar a partir de una captura de pantalla.',
      ],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Capturas de pantalla que muestran el mismo enlace de configuración abierto en las interfaces japonesa, portuguesa y alemana',
          caption:
            'Misma configuración, diferentes interfaces: los equipos regionales trabajan en su idioma preferido manteniendo la coherencia global',
        },
      ],
    },
    {
      heading: 'Manejo de variaciones regionales',
      paragraphs: [
        'Algunos mercados requirieron adaptaciones menores. El equipo chino necesitaba una versión con un marco optimizado para WeChat para compartir en redes sociales. En lugar de modificar el maestro, crearon una variante documentada con su propio enlace de configuración, claramente etiquetada como "variante CN-WeChat" en la biblioteca de activos de la campaña. Esto mantuvo la trazabilidad al tiempo que permitió la localización necesaria.',
        'El equipo de la marca estableció una regla simple: cualquier variación del maestro requería un enlace de configuración nuevo y documentado. Sin modificaciones en los archivos exportados, sin "soluciones rápidas" en el software de diseño. Esto evitó la desviación de configuración que había afectado a lanzamientos anteriores.',
      ],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Una interfaz de biblioteca de activos que muestra la configuración maestra y las variantes regionales aprobadas, cada una con su propio enlace.',
          caption:
            'Gobernanza de activos de campaña: configuración maestra más variantes documentadas, todas rastreables a través de enlaces de configuración',
        },
      ],
    },
    {
      heading: 'Resultados del lanzamiento',
      paragraphs: [
        'El día del lanzamiento del producto se implementaron códigos QR en empaques, exhibidores minoristas, materiales para eventos y campañas digitales en los 12 mercados simultáneamente. Las auditorías de calidad confirmaron la coherencia visual en todas las regiones: el QR de los expositores minoristas de Tokio coincidía con el QR de los envases de São Paulo y el QR de los carteles de los eventos de Berlín.',
        'No se informaron fallas de escaneo en todos los mercados. Cuando era necesario un cambio en la URL de la página del producto posterior al lanzamiento, el servicio de redireccionamiento lo manejaba de forma invisible, sin necesidad de reimprimir. El equipo global estimó que el enfoque del enlace de configuración ahorró más de 40 horas de tiempo de coordinación en comparación con su metodología de lanzamiento anterior.',
        'Consulte la guía de aprendizaje sobre colaboración QR entre idiomas para conocer los principios del flujo de trabajo detrás de la coherencia de las campañas globales.',
      ],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Una cuadrícula de fotografías que muestra el despliegue consistente de QR en diferentes mercados: comercio minorista en Tokio, embalajes en São Paulo, eventos en Berlín.',
          caption:
            'Consistencia global lograda: presentación QR idéntica en 12 mercados a pesar de diferentes idiomas, proveedores y formatos',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'abre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Explorar artículos de aprendizaje',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Explorar artículos de aprendizaje', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra la Guía del usuario completa', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abre la galería', type: 'gallery' },
  ],
};
