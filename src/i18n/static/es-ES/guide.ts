import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Guía de usuario de ANQR',
  description: 'Guía completa para usar ANQR para crear códigos QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Buscar artículos de aprendizaje', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Comienzo',
      paragraphs: [
        'ANQR es un generador de código QR con un enfoque cliente-primer. Por defecto, los códigos QR se generan localmente en su navegador - no se requiere cuenta y sus datos permanecen privados. Para la incrustación profesional, también puede utilizar la API del lado del servidor.',
        'La interfaz tiene tres niveles de interfaz: Básico, Avanzado y Profesional. Seleccione su nivel usando las pestañas en el encabezado. Cada nivel desbloquea funciones adicionales manteniendo la interfaz centrada en lo que necesita.',
      ],
      bullets: [
        'Básico: Creación sencilla de código QR con contenido simple/URL y superposición de imagen.',
        'Avanzadas: Opciones de codificación QR, estilos de renderización, animación, formatos de salida, tipos de contenido extendido y personalización superpuesta.',
        'Profesional: Marcas de agua, metadatos, compartir, análisis de seguridad, códigos QR de pago y características empresariales.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Abra el generador', type: 'generator' }],
    },
    {
      heading: 'Inicio rápido',
      paragraphs: ['Para crear su primer código QR:'],
      bullets: [
        '1. Seleccione un tipo de contenido (URL, texto, WiFi, etc.) del desplegable Tipo de Contenido.',
        '2. Introduzca sus datos en los campos proporcionados.',
        '3. Opcionalmente personalizar colores, estilos, y añadir una imagen superpuesta.',
        '4. Haga clic en Exportar para descargar su código QR como PNG, GIF, WebP o SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Características básicas',
      paragraphs: [
        'El nivel básico proporciona una interfaz simplificada para crear códigos QR con contenido de carga útil y superposiciones de imagen. Esta es la forma más simple de empezar.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tipos de contenido (Basic)',
      paragraphs: [
        'Texto del mensaje: codifica cualquier texto hasta el límite de capacidad del código QR. Ideal para mensajes cortos, códigos o identificadores.',
        'URL: codifica direcciones web. El código QR abrirá la URL cuando se escanee. Admite protocolos http:// y https://.',
      ],
    },
    {
      heading: 'Image Overlay (Basic)',
      paragraphs: [
        'Cargue una imagen (JPG, PNG, GIF, WebP) para combinarse con su código QR. Las características básicas de superposición incluyen:',
      ],
      bullets: [
        'Subir desde el archivo: Seleccione una imagen desde el dispositivo.',
        'Carga de URL: Introduzca una URL de imagen (debe permitir CORS).',
        'Logo del centro: Coloca la imagen en el centro, confiando en la corrección de errores.',
        'Blend: Mezcla alfa simple de la imagen con patrón QR.',
        'Intensidad: Controla cuán fuerte afecta la superposición al código QR (0-100%).',
        'Modo de color: Color completo, escala gris o blanco negro.',
        'Preserve Finder Patterns: Mantiene los patrones de esquina sin modificar para un escaneo confiable.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Características avanzadas',
      paragraphs: [
        'El nivel avanzado desbloquea las opciones de codificación QR, estilos de renderización, animación, formatos de salida, tipos de contenido extendidos y personalización avanzada.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Configuración de codificación QR',
      paragraphs: [
        'Versión: Los códigos QR vienen en versiones 1-40, con versiones más altas conteniendo más datos pero siendo más grandes. Set a 0 (Auto) para permitir que ANQR elija la versión más pequeña que se ajuste a su contenido.',
        'Corrección: Determina cuánto daño puede sostener un código QR mientras se mantiene escandaloso.',
      ],
      bullets: [
        'L (Low): 7% corrección de error - tamaño más pequeño, menos redundancia.',
        'M (Medium): 15% corrección de errores - opción equilibrada.',
        'Q (Cuartil): 25% corrección de error - bueno para los códigos impresos.',
        'H (High): 30% de corrección de errores - mejor para los códigos con superposiciones o en condiciones duras.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zona tranquila (Margen)',
      paragraphs: [
        'La zona tranquila es el espacio blanco alrededor del código QR. Los escáneres necesitan este margen para detectar dónde comienza el código. La norma recomienda al menos 4 módulos. Reducir abajo 4 puede causar problemas de escaneo.',
      ],
    },
    {
      heading: 'Estilo del módulo',
      paragraphs: [
        'Los módulos son los cuadrados individuales que componen un código QR. ANQR ofrece cinco estilos:',
      ],
      bullets: [
        'Plaza: Aparición clásica QR con esquinas afiladas.',
        'Redondeado: Las esquinas suavizadas para un aspecto más agradable.',
        'Puntos: Módulos circulares para una estética moderna.',
        'Diamante: cuadrados girados de 45° para un patrón distintivo.',
        'Conectado: Los módulos se fusionan cuando están adyacentes, creando formas orgánicas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Finder Pattern Style',
      paragraphs: [
        'Los patrones del Finder son los tres grandes cuadrados en esquinas QR que ayudan a los escáneres orientar el código. Estilos disponibles:',
      ],
      bullets: [
        'Plaza: esquinas cuadradas estándar.',
        'Redondeado: Las esquinas suavizadas coinciden con el estilo del módulo redondeado.',
        'Círculo: Patrones circulares para códigos de estilo de punto.',
      ],
    },
    {
      heading: 'Pautas de alineación "',
      paragraphs: [
        'Los patrones de alineación aparecen en códigos QR más grandes (versión 2+) para ayudar a corregir la distorsión. Los patrones de sincronización son las líneas alternantes que conectan patrones de búsqueda.',
      ],
      bullets: [
        'Estilo de alineación: Buscador de coincidencias, cuadrado, redondeado o círculo.',
        'Estilo de instalación: Módulo de coincidencia, sólido o destrozado.',
      ],
    },
    {
      heading: 'Colores',
      paragraphs: [
        'Antecedentes: El color de los módulos QR. Negro (#000000) es estándar pero cualquier color oscuro funciona.',
        'Antecedentes: El color de fondo. Blanco (#ffffffff) es estándar. Asegurar un contraste suficiente con el primer plano.',
        'Fondo transparente: Retire el fondo completamente para su uso en superficies de color. Asegurar que la superficie proporciona un contraste adecuado.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tamaño del módulo & Gap',
      paragraphs: [
        'Tamaño del módulo: Controla el tamaño de cada módulo en píxeles. Los valores más grandes crean códigos más grandes, más fáciles de reproducir.',
        'Módulo Gap: Añade espacio entre módulos como porcentaje. Las pequeñas brechas (5-15%) pueden mejorar la escasez en algunas condiciones, pero las deficiencias excesivas reducen la fiabilidad.',
      ],
    },
    {
      heading: 'Configuración de salida',
      paragraphs: ['Formato: Elija su formato de exportación basado en el caso de uso.'],
      bullets: [
        'PNG: Formato de raster sin pérdidas, ideal para la mayoría de los usos. Mejor para imprimir y digital.',
        'WebP: Formato moderno con tamaños de archivo más pequeños. Bien para uso web.',
        'GIF: Necesario para códigos QR animados. Apoya la transparencia.',
        'SVG: Formato vectorial que escala infinitamente. Mejor para impresión grande o cuando necesita editar el código.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Medidas de producción',
      paragraphs: [
        'Ancho/Altura: Establecer el tamaño de la salida en píxeles. Para imprimir, calcular basado en DPI (por ejemplo, 300 DPI a 1 pulgada = 300 px). Los tamaños más grandes escanean más fiable a distancia.',
      ],
    },
    {
      heading: 'Ajustes de animación (Advanced)',
      paragraphs: ['Control de comportamiento de código QR animado:'],
      bullets: [
        'Velocidad: Tasa de animación de marcos en milisegundos.',
        'Loop: animación continua o de un solo juego.',
        'Bounce: dirección de animación Ping-pong.',
        'Inicio Marco: Comience la animación del marco específico.',
        'Max Frames: Limite los marcos totales en la animación.',
        'Paso del marco: Saltar marcos para una animación más rápida.',
        'Interpolación: Ninguno, Crossfade o Morph entre marcos.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tipos de contenido (Advanced)',
      paragraphs: ['Nivel avanzado desbloquea formatos adicionales de carga útil:'],
      bullets: [
        'Número de teléfono (tel:): Crea un enlace telefónico confidencial.',
        'Correo electrónico: Abre cliente de correo electrónico con sujeto opcional y cuerpo.',
        'SMS: Mensaje de texto impreso a un número de teléfono.',
        'vCard: Tarjeta de contacto completa con nombre, organización, teléfono, correo electrónico, dirección.',
        'MeCard: Formato de contacto compacto popular en Japón.',
        'BizCard: formato de tarjeta de visita Legacy.',
        'Geo Location: coordenadas GPS que se abren en mapas.',
        'WiFi: credenciales de red para conexión automática (SSID, contraseña, tipo de seguridad).',
        'Calendario Evento: iCalendar formato con título, ubicación, fecha/hora.',
        'Evento RSVP: Enlace a la página de registro de eventos.',
        'Calendario Suscribirse: Suscribirse a un ICS/WebCal feed.',
        'Archivo/Document URL: Enlace directo a archivos descargables.',
        'Enlace de almacenamiento en la nube: Enlaces a Google Drive, Dropbox, OneDrive, etc.',
        'Perfil social: Enlaces a LinkedIn, Twitter, Instagram, etc.',
        'Messaging Link: WhatsApp, Telegram, Signal deep links.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Características avanzadas de superposición',
      paragraphs: ['Capacidades adicionales de superposición:'],
      bullets: [
        'Cultivo: Activar el cultivo para seleccionar una región cuadrada de tu imagen.',
        'Halftone: Patrón de punto de estilo clásico basado en el brillo de la imagen.',
        'Cierre: Medición de la diffusión de error para una reproducción detallada.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overlay Blend Modes (Advanced)',
      paragraphs: ['Modos de mezcla adicionales en nivel avanzado:'],
      bullets: [
        'Subpixel: Divide cada módulo en subpíxeles para mayor detalle.',
        'Blue Noise: Utiliza el ruido azul para los patrones libres de artefactos.',
        'Mosaico: Efecto a base de azulejos preservando la estructura de imagen.',
        'Gap Fill: Coloca la imagen en huecos entre módulos.',
        'Brillo: Varia el tamaño del módulo basado en el brillo de la imagen.',
        'Duotone: Mapas imagen a dos colores para el contraste llamativo.',
      ],
    },
    {
      heading: 'Intensidad excesiva',
      paragraphs: [
        'Controla cuán fuerte afecta la superposición al código QR (0-100%). Los valores más altos muestran más detalles de la imagen pero pueden reducir la escandalidad. Comience alrededor del 70% y ajuste basado en pruebas.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Modo de color',
      paragraphs: ['Cómo se procesa la imagen superpuesta:'],
      bullets: [
        'Color completo: Conserva los colores originales de la imagen.',
        'Grayscale: se convierte en tonos blancos y negros.',
        'Blanco y negro: Conversión binaria de alto contraste.',
      ],
    },
    {
      heading: 'Patrones de Buscador Preserve',
      paragraphs: [
        'Cuando está habilitado, mantiene los tres patrones de búsqueda de esquina sin modificar por la superposición. Fue muy recomendable para un escaneo fiable.',
      ],
    },
    {
      heading: 'Preprocesamiento de imagen',
      paragraphs: [
        'Aplicar filtros a tu imagen superpuesta antes de mezclar. Estos ajustes pueden mejorar cómo aparece la imagen en el código QR final.',
      ],
      bullets: [
        'Brillo (-100 a +100): Enciende o oscurece la imagen.',
        'Contraste (-100 a +100): Aumentar o disminuir el rango tonal.',
        'Gamma (0.2 a 3.0): Ajuste de brillo no lineal. Valores debajo de 1 tonos medio iluminados, sobre 1 oscurecerlos.',
        'Saturación (-100 a +100): Intensidad de color. -100 es grayscale, +100 está sobresaturado.',
        'Hue Rotación (0-360°): Cambie todos los colores alrededor de la rueda de color.',
        'Blur (0-20px): Suave los detalles de la imagen.',
        'Sharpen (0-100%): Mejorar los bordes y detalles.',
        'Posterize (0-16 niveles): Reducir los niveles de color para un efecto poster.',
        'Umbral (0-255): Convertir en negro/blanco binario en punto de corte.',
        'Detección de bordes: algoritmos Sobel o Canny para mostrar sólo los bordes.',
        'Invertido: Invierte todos los colores.',
      ],
    },
    {
      heading: 'Modo de ajuste',
      paragraphs: ['Cómo la imagen superpuesta encaja en el área de código QR:'],
      bullets: [
        'Cubierta: Imagen llena todo el área, recortando si es necesario.',
        'Contiene: Imagen entera visible, puede tener márgenes.',
        'Stretch: La imagen distorsiona para rellenar exactamente.',
      ],
    },
    {
      heading: 'Opciones de transformación',
      paragraphs: [
        'Rotación: Rota la superposición en incrementos de 90°.',
        'Flip X/Y: Mirror la imagen horizontal o verticalmente.',
      ],
    },
    {
      heading: 'Algoritmos de separación',
      paragraphs: [
        'Dithering convierte imágenes de tono continuo a patrones que los códigos QR pueden representar. Disponible cuando use modos de mezcla Dithered, Blue Noise o True Dither.',
      ],
      bullets: [
        'Difusión de error: estilo clásico Floyd-Steinberg. Difunde error de cuantificación a píxeles vecinos.',
        'Pedido (Bayer): Usa una matriz de umbral para patrones regulares.',
        'Clustered Dot: Simulates halftone printing.',
        'Void & Cluster: Optimizado orden de separación.',
        'Blue Noise: Patrón visualmente agradable al azar.',
        'Blue Noise Umbral: Colgando con textura de ruido azul.',
        'Blanco Noise: El umbral aleatorio que se separa.',
        'Gaussian/Triangular Noise: Noise con diferentes distribuciones.',
        'Blue Noise + Difusión de error: híbrido que combina ambas técnicas.',
        'Anclado Blue Noise: patrón de ruido azul.',
        'Perceptual: Luminance para mejores resultados visuales.',
        'Edge-Aware: Conserva los bordes de la imagen durante la separación.',
        'Umbral adaptativo: Umbralización local.',
        'Temporal Blue Noise: Para los GIF animados, varía el patrón por marco.',
      ],
    },
    {
      heading: 'Carros de difusión',
      paragraphs: [
        'Al utilizar la separación de la Difusión de Error, elija cómo se distribuye el error:',
      ],
      bullets: [
        'Floyd-Steinberg: Difusión clásica de 4 vecinos. Buena elección general.',
        'Jarvis-Judice-Ninke: 12 vecinos, más suave pero más lento.',
        'Stucki: Similar a JJN con diferentes pesos.',
        'Burkes: Simplified JJN, más rápido.',
        'Sierra: Familia de núcleos equilibrando calidad y velocidad.',
        'Atkinson: Difusión de luz, conserva detalles pero puede ser granulada.',
      ],
    },
    {
      heading: 'Dither Strength',
      paragraphs: [
        'Controla cuánto se aplica la separación (0-100%). Los valores inferiores conservan más del patrón original, los valores más altos muestran más detalles de imagen.',
      ],
    },
    {
      heading: 'Ajustes de subpixel',
      paragraphs: ['Al utilizar el modo de mezcla Subpixel:'],
      bullets: [
        'Tamaño de la parrilla: 2×2, 3×3, o 4×4 subpixeles por módulo. Más alto = más detalle.',
        'Regla del centro: Strict requiere subpixel central para combinar módulo. Mediatone Center permite la variación.',
        'Color neutro: Color utilizado para subpixeles indeterminados.',
        'Finder Override: Cómo se producen los patrones de búsqueda (Solid o Stylized).',
      ],
    },
    {
      heading: 'Ajustes de Mediatone',
      paragraphs: ['Al utilizar el modo de mezcla de Halftone:'],
      bullets: [
        'Tamaño de la célula: Por módulo o rejilla N×N.',
        'Forma de puntos: Círculo, Plaza o Línea.',
        'Curva de brillo: Linear, S-Curve o Gamma.',
      ],
    },
    {
      heading: 'Colores Duotone',
      paragraphs: [
        'Al utilizar el modo de mezcla de Duotone, establece el color de la sombra (zonas oscuras) y el color de Highlight (zonas rectas).',
      ],
    },
    {
      heading: 'Ajustes de animación GIF',
      paragraphs: ['Cuando se utiliza GIF animada superpone:'],
      bullets: [
        'Use Frame Delays: Respete el tiempo original de GIF.',
        'Max FPS: Límite tasa de marco (1-60 fps).',
        'Manejo de eliminación: Respetar o simplificar los métodos de eliminación de marcos.',
      ],
    },
    {
      heading: 'Opciones avanzadas de rendering',
      paragraphs: ['Controles adicionales de renderización:'],
      bullets: [
        'Modo Gap: Ninguno, Inset, Stroke, o estilo espacial negativo.',
        'Corner Radius: Porcentaje de esquinas redondeadas para módulos.',
        'Gradiente: Ninguno, gradiente lineal, radial o conic en módulos.',
        'Ojo Estilo Exterior/Inner: Estilo independiente para anillos de patrón del buscador.',
        'Rotación de puntos: Rotar los módulos de diamante / puntos.',
        'Escala de ojos: Ajuste de tamaño para los patrones del buscador.',
        'Estilo de marco: Agregue marcos decorativos (frame resonado, pegatina, etiqueta).',
        'Texto del marco: Añadir texto como "Scan Me!" a marcos.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Codificación avanzada de QR',
      paragraphs: ['Codificación QR fino:'],
      bullets: [
        'Modo de codificación: Auto, Numeric, Alphanumeric, Byte/UTF-8, o Kanji.',
        'Enforce Min Quiet Zone: Asegurar al menos 4 márgenes de módulo.',
        'Patrón de máscaras: Auto (optimal), o selecciona manualmente patrones 0-7 para controlar la distribución del módulo. Diferentes patrones crean diferentes apariencias visuales mientras se encogen los mismos datos.',
        'Codificación de caracteres: ISO-8859-1 (por defecto de latín-1), UTF-8 (un código completo incluyendo emoji), o Shift-JIS (japonés). Elija basado en los requisitos de carácter de su contenido.',
      ],
    },
    {
      heading: 'Opciones avanzadas de salida',
      paragraphs: ['Ajustes adicionales de exportación:'],
      bullets: [
        'Nombre de archivo: Nombre de archivo personalizado para descargas.',
        'GIF Tamaño de la paleta: 2-256 colores en salida GIF.',
        'GIF Quantizer: Median Cut, NeuQuant o Octree reducción de color.',
        'GIF Dithering: Off, Floyd-Steinberg, o Ordenado.',
        'GIF Color transparente: Establece un color para ser transparente.',
        'SVG True Vector: Use caminos en lugar de raster incrustado.',
        'SVG Precisión de la forma: Pixel o Corrección precisa.',
        'SVG Embed Raster Overlay: Incluya la superposición como imagen incrustada.',
        'Antecedentes Anulación: Forzar un color de fondo específico en la salida.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opciones de validación',
      paragraphs: ['Ajustes de procesamiento de entrada:'],
      bullets: [
        'Validar Entrada: Verifique el formato de contenido antes de la codificación.',
        'Trim Whitespace: Quitar los espacios líderes/trailing.',
        'Normalizar Newlines: Convertir todos los finales de línea en LF.',
        'Guardar la longitud máxima: Advierta si el contenido excede la capacidad de QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Características profesionales',
      paragraphs: [
        'El nivel profesional añade marcas de agua, metadatos, opciones compartidas, análisis de seguridad, códigos QR de pago y características empresariales.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Watermark',
      paragraphs: ['Añadir marcas de agua a sus códigos QR:'],
      bullets: [
        'Tipo: Texto, Imagen o marca de agua Pattern.',
        'Posición: Centro, Corners, Edges, Detrás o Zona tranquila.',
        'Opacity: Transparencia Watermark (0-100%).',
        'Modo Blend: Combinación Normal, Multiply, Screen o Overlay.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadatos',
      paragraphs: ['Insertar metadatos en archivos exportados:'],
      bullets: [
        'Título, Autor, Copyright, Licencia, Descripción campos.',
        'Tiempo de creación: Embed generación timetamp.',
        'Valor Clave personalizado: Añadir pares de metadatos arbitrarios.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Compartir',
      paragraphs: ['Comparta sus configuraciones de código QR:'],
      bullets: [
        'Enlace directo: Genera una URL compartida con tu configuración actual.',
        'Insertar HTML: Insertar código para sitios web.',
        'Parámetros de código: Incluye todos los ajustes en la URL de la acción.',
        'Nota: Las imágenes superpuestas de archivos locales no se pueden compartir a través de URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Análisis de seguridad',
      paragraphs: ['Ensure QR codes remain scannable:'],
      bullets: [
        'Modo de seguridad: Desactivados, equilibrados o estrictos requisitos de escaneo.',
        'Min Module Tamaño: Tamaño mínimo del píxel por módulo.',
        'Min Quiet Zona: Módulos de margen mínimos.',
        'Lock Finders/Timing/Align/Format/Version: Proteger elementos específicos.',
        'Max Overlay Intensity by ECC: Límites de intensidad automática basados en el nivel de corrección de errores.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tipos de contenido (profesional)',
      paragraphs: ['El nivel profesional añade tipos de pago y contenidos institucionales:'],
      bullets: [
        'EPC/SEPA (UE): Códigos QR de transferencia bancaria europea con IBAN, BIC, importe, referencia.',
        'UPI (India): Interfaz de pagos unificada con VPA, nombre del beneficiario, monto.',
        'PayNow (Singapur): Pago rápido de Singapur con UEN o número móvil.',
        'PromptPay (Tailandia): Sistema nacional de pago tailandés.',
        'PIX (Brasil): pago instantáneo brasileño con llave PIX.',
        'Crypto: Bitcoin, Ethereum, Litecoin direcciones de pago con cantidad opcional.',
        'Marketing Campaign Enlace: URLs con el parámetro UTM completo (Marketing Tags) seguimiento.',
        'Enlace corto: Para su uso con acortadores de URL para códigos QR dinámicos/ rastreables.',
        'GS1 Digital Link: identificación de productos con GTIN, serie, lote, caducidad.',
        'App Deep Link: iOS/Android app vínculos profundos con esquemas personalizados.',
        'Formato personalizado: Datos brutos sin formato ni validación.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Pagos relevantes del lenguaje en modo avanzado',
      paragraphs: [
        'Al utilizar el modo Avanzado, ANQR muestra automáticamente métodos de pago relevantes para tu idioma seleccionado. Por ejemplo, los usuarios vietnamitas ven a VietQR, los usuarios tailandeses ven a PromptPay, y los usuarios del idioma indio ven UPI y BharatQR. Los métodos de pago globales (criptomoneda, PayPal, Cash App) están disponibles para todos los idiomas. El modo profesional desbloquea todos los estándares de pago independientemente del idioma.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'European Payment Standards',
      bullets: [
        'EPC/SEPA (UE): códigos QR de transferencia bancaria europea siguiendo el estándar de códigos QR EPC. Admite IBAN, BIC (opcional para nacionales), importe en EUR y referencias de pago estructuradas o no estructuradas. Se utiliza en toda la zona SEPA, incluidos los países de la UE, además de Suiza, Noruega, Islandia, Liechtenstein, Mónaco y San Marino.',
        'Swiss QR-bill: Swiss payment standard following SIX Implementation Guidelines. Soporta CHF y EUR, QR-Reference (QRR), Referencia del acreedor (ISO 11649), direcciones de acreedor/deuda estructuradas y información de facturación. Se requiere para facturas suizas desde 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Normas de pago indios',
      bullets: [
        'UPI (India): Unified Payments Interface following NPCI Deep Linking Specification. Soporta VPA (Dirección de Pago Virtual), nombre de pago, cantidad en INR, nota de transacción, ID de referencia, código de la categoría mercante y modo de transacción.',
        'BharatQR (India): estándar QR unificado que admite pagos con UPI y con tarjeta. Combina UPI VPA con tarjeta PAN para máxima compatibilidad. Incluye nombre del comerciante, ciudad, MCC, detalles de GST y números de factura/referencia.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Normas de Pago de Asia Sudoriental',
      bullets: [
        'PayNow (Singapur): Sistema de pago rápido de Singapur mediante especificación EMVCo QR con perfil SGQR. Soporta UEN (inscripción de negocios), número móvil o NRIC como identificadores proxy. Incluye bandera de editabilidad de la cantidad y fecha de vencimiento.',
        'PromptPay (Tailandia): sistema de pago nacional tailandés que sigue el perfil EMV del Banco de Tailandia. Admite número de teléfono móvil, identificación nacional, identificación fiscal, identificación de billetera electrónica y pago de facturas con múltiples campos de referencia.',
        'QRIS (Indonesia): Código de Respuesta Rápida de Indonesia Estandar de pago nacional basado en EMV, NMID (ID Merchant Nacional), clasificación de criterios de mercader y tarifas de conveniencia (fijo o porcentaje).',
        'DuitNow (Malasia): Sistema de pago instantáneo de Malasia. Soporta varios tipos de proxy incluyendo NRIC, móvil, pasaporte, identificación del ejército y números de registro de negocios.',
        'VietQR (Vietnam): norma de transferencia interbancaria vietnamita. Requiere banco BIN (identificación de NAPAS) y número de cuenta. Soporta múltiples códigos de servicio para diferentes tipos de transferencia (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipinas): Philippine QR estándar de pago para InstaPay y PESONet. Usa números de cuenta con identificación comercial para transacciones P2M (persona a mercante).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'East Asian Payment Standards',
      bullets: [
        'TWQR (Taiwan): estándar de pago QR taiwanés. Soporta identificación comercial, identificación fiscal y cantidades TWD.',
        'HKQR/FPS (Hong Kong): Hong Kong Faster Payment System códigos QR. Admite identificación FPS, número móvil o email como identificadores de pago. Cantidades en HKD.',
        'JPQR (Japón): Japonés unificado estándar de pago de código QR. Usa ID de almacén para identificación comercial con cantidades JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Otras normas regionales de pago',
      bullets: [
        'PIX (Brasil): Sistema de pago instantáneo del Banco Central Brasileño después de la especificación del código BR. Admite las teclas PIX (CPF, CNPJ, correo electrónico, teléfono o clave aleatoria), nombre mercante/ciudad, ID de transacción y cantidades BRL.',
        'AusPayNet/NPP PayID (Australia): Australian New Payments Platform PayID system. Paga de apoyo Tipos de identificación (email, móvil, ABN, ID de organización) o número de cuenta BSB + tradicional. El nombre Merchant es opcional ya que los pagadores ven el nombre registrado de la búsqueda del PNP.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cryptocurrency Payments',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): Pago estándar de criptomonedas URIs con dirección de cartera, cantidad opcional y etiqueta. Compatible con todas las principales carteras de Bitcoin y Litecoin.',
        'Lightning Network (BOLT11): Relámpago Red facturas de pago. Pruebe una cadena de factura codificada BOLT11 para pagos instantáneos de Bitcoin con tarifas mínimas.',
        'Ethereum (EIP-681): URI de solicitud de transacciones de Ethereum que admiten transferencias nativas de ETH y transferencias de tokens ERC-20. Incluye ID de cadena para soporte de múltiples redes (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parámetros de gas y llamadas a funciones de contrato.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Servicios de Enlace de Pago',
      bullets: [
        'PayPal.Me: Enlaces de pago con el nombre de usuario y la cantidad prellenada opcional. Los beneficiarios pueden pagar a través del saldo de PayPal, tarjetas o cuentas bancarias.',
        'Efectivo: efectivo Aplicar enlaces de pago utilizando $cashtag con cantidad opcional. Popular en los Estados Unidos para pagos entre pares.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Genérico EMV QR',
      bullets: [
        'EMV Genérico: Crear un modo personalizado EMV Merchant-Presentado Códigos QR para esquemas de pago no especificados. Configurar nombre comercial, ciudad, código de país (ISO 3166-1), código de divisas (ISO 4217 numérico), MCC, opciones de tarifas de punta/conveniencia, y campos de datos adicionales. Útil para pruebas o integraciones personalizadas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blend Modes (Profesional)',
      paragraphs: ['Modos de mezcla adicionales en el nivel profesional:'],
      bullets: [
        'Pixelato: Efecto de sobreposición pixelada.',
        'Esquema: Superposición de detección de bordes mostrando sólo contornos.',
        'Efecto de distorsión onda.',
        'Tamaño del subpixel: Tamaño del subpixel variable basado en la imagen.',
        'True Dither: Dithering avanzado con selección de matriz ordenada.',
        'Extrema: La visibilidad máxima de la imagen puede afectar la escandalidad.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ajustes de protección',
      paragraphs: [
        'Control fino sobre el cual los elementos QR están protegidos de la modificación de la superposición:',
      ],
      bullets: [
        'Preserve Timing: Mantener patrones de tiempo sin modificar.',
        'Alineación Preserve: Mantenga los patrones de alineación sin modificar.',
        'Proteger formato Información: Módulos de información de formato escudo.',
        'Proteger la versión Información: Módulos de información de la versión escudo.',
      ],
    },
    {
      heading: 'ECC-Aware Mode',
      paragraphs: [
        'Distribuye de forma inteligente la intensidad de superposición basada en la capacidad de corrección de errores. El sistema analiza qué módulos pueden ser modificados manteniendo la escanerabilidad.',
      ],
      bullets: [
        'Presupuesto de Riesgo: Porcentaje de capacidad de corrección de errores para utilizar (0-100%).',
        'Presupuesto más alto = superposición más visible pero escanerabilidad más arriesgada.',
        'Presupuesto inferior = escaneo más seguro pero menos visible.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opciones de renderización profesional',
      paragraphs: ['Controles avanzados de renderización:'],
      bullets: [
        'Crisp Edges: Utilice la representación de imagen pixelada para bordes de módulos afilados.',
        'Pixel Snap: Alineación de suelo, redondo o píxeles de Ceil.',
        'Modo Per-Module Color: Sólido, por brillo, por posición, por superposición, por grupo.',
        'Paleta de color: Define la paleta de colores personalizada para colorear por módulo.',
        'Guardia de contraste: Asegurar una relación de contraste mínima entre los colores.',
        'Proporción de contraste Min Contrast: requisito de contraste de estilo WCAG (1:1 a 21:1).',
        'Extra Border Módulos: Frontera adicional más allá de la zona tranquila.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opciones de productos profesionales',
      paragraphs: ['Ajustes de las exportaciones institucionales:'],
      bullets: [
        'DPI: Establecer resolución de impresión (72-600 DPI). 300 DPI recomendado para imprimir.',
        'Incluir Zona tranquila: Toggle zona tranquila en dimensiones de salida.',
        'Exportar como adicional: Generar PDF junto con el formato primario.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ajustes de animación (profesional)',
      paragraphs: ['Características adicionales de animación profesional:'],
      bullets: [
        'Temporal Dither: Off, Blue Noise o Flicker Safe per-frame dithering.',
        'Patrón: Ninguno, Pulso, Wave, Scanline, Shimmer o efectos de derivación.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Referencia',
      paragraphs: [
        'ANQR proporciona una API lado servidor para generar códigos QR a través de parámetros URL. Esto es ideal para incrustar códigos QR en sitios web, correos electrónicos, documentos o flujos de trabajo automatizados sin JavaScript cliente.',
        'Base URL: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' }],
    },
    {
      heading: 'Parámetros básicos',
      paragraphs: ['Parámetros necesarios y comunes (no se traducen los nombres del parámetro):'],
      bullets: [
        'datos (requeridos): El contenido para codificar en el código QR. caracteres especiales de código URL.',
        'tamaño: tamaño de la imagen en píxeles (por defecto: 400, max: 2000). Usado si no se especifica.',
        'w, h: Ancho de salida y altura en píxeles. Anula el parámetro de tamaño.',
        'formato: Formato de salida - png, webp, o gif (por defecto: png).',
        'ec: Nivel de corrección de error - L, M, Q, o H (predeterminado: H).',
        'fg: Foreground color as hex without # (default: 000000).',
        'bg: Color de fondo como hex sin # (por defecto: ffffff).',
        'transparente: Conjunto a 1 para fondo transparente.',
        'margen: Zona tranquila en módulos (predeterminado: 4).',
      ],
    },
    {
      heading: 'Parámetros de estilo',
      paragraphs: ['Módulo y estilo de patrón:'],
      bullets: [
        'estilo: estilo del módulo - cuadrado, redondeado, puntos, diamante, conectado.',
        'buscador: Estilo de patrón de Finder - cuadrado, redondeado, círculo.',
        'alineado: Estilo de patrón de alineación - match_finder, cuadrado, redondeado, círculo.',
        'tiempo: Estilo de patrón de Timing - match_module, sólido, destrozado.',
        'radio: Rincón radio porcentaje 0-100.',
        'brecha: Porcentaje de distancia del módulo 0-50.',
        'brechaMode: Modo de salida - ninguno, inicio, trazo, negativo_espacio.',
        'ojo Exterior, EyeInner: Estilos de ojos - cuadrado, redondeado, círculo.',
        'eyeScale: Porcentaje de escala de ojos (por defecto: 100).',
        'grad: Tipo de gradiente - ninguno, lineal, radial, conic.',
        'gradAngle: ángulo de gradiente para gradientes lineales.',
        'gradStops: Gradient para como color1,pos1,color2,pos2,... (por ejemplo, ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Parámetros de superposición',
      paragraphs: [
        'Opciones de superposición de imagen (la imagen superpuesta se obtiene lado servidor):',
      ],
      bullets: [
        'img: URL a imagen superpuesta (debe ser accesible públicamente).',
        'modo: modo Overlay - centro, mediatona, mezcla, brillo, mosaico, atenuado, azul-noise, subpixel.',
        'intensidad: Intensidad de superposición 0-100 (por defecto: 100).',
        'color Modo: Modo de color superpuesto - color, escala gris, bw.',
        'ajuste: Cuánta capa cabe - tapa, contiene, estiramiento.',
        'rot: Rotación superpuesta en grados.',
        'fíjate en 1 para voltear.',
        'manténganse. Buscadores: Patrones de búsqueda predeterminados (por defecto: 1).',
        'keepTiming, keepAlign: establezca en 1 para preservar los patrones de sincronización/alineación.',
      ],
    },
    {
      heading: 'Parámetros de Preprocesamiento',
      paragraphs: ['Preprocesamiento de imagen aplicado a superposición:'],
      bullets: [
        'brillo: Ajuste -100 a 100 (por defecto: 0).',
        'contraste: Ajuste -100 a 100 (por defecto: 0).',
        'gamma: valor 0.1 a 3 (por defecto: 1).',
        'saturación: Ajuste -100 a 100 (por defecto: 0).',
        'hue: rotación de Hue en grados.',
        'borrón en píxeles.',
        'afilado: Cantidad afilada 0-100.',
        'posterize: Posterize levels.',
        'umbral: umbral binario 0-255.',
        'borde de detección - apagado, sobel, canny.',
        'invert: Set a 1 para invertir colores.',
      ],
    },
    {
      heading: 'Parámetros Watermark',
      paragraphs: ['Añadir marcas de agua a códigos QR generados:'],
      bullets: [
        'wmEn: Set a 1 para habilitar la marca de agua.',
        'wm Tipo: Tipo Watermark - texto, imagen, patrón.',
        'wmText: Texto de marca de agua (codificado por URL).',
        'wmImg: URL a la imagen de marca de agua.',
        'wmPos: Posición - centro, esquinas, bordes, detrás, quiet_zona.',
        'wmOpacity: Opacity 0-100 (default: 50).',
        'wmBlend: Modo Blend - normal, multiplicar, pantalla, overlay.',
      ],
    },
    {
      heading: 'Parámetros de animación',
      paragraphs: ['Para la salida GIF animada (requiere formato=gif):'],
      bullets: [
        'anim Patrón: Patrón de animación - ninguno, pulso, onda, escaneo, brillo, deriva, color_ciclo.',
        'anim Marcos: Número de marcos 1-60 (predeterminado: 24).',
        'anim Velocidad: Frame delay in milliseconds 10-1000 (default: 100).',
        'anim Semillas: Semilla aleatoria para la animación.',
        'alimentación: Alimentación alargada - lineal, cabal_in, cabal_out, cabal_in_out, rebote.',
      ],
    },
    {
      heading: 'Parámetros de salida',
      paragraphs: ['Opciones de formato de salida:'],
      bullets: [
        'calidad: WebP calidad 0-1 (predeterminado: 0.9).',
        'webpQ: Calidad WebP 0-100 (predeterminado: 90).',
        'gifColors: GIF paleette size 2-256 (default: 256).',
        'dpi: Salida DPI para PNG (por defecto: 72).',
        'metaTítulo, metaAuthor, metaCopy, meta Desc: Campos de metadatos PNG.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Parámetros de cultivo',
      paragraphs: ['Opciones de recorte de imágenes superpuestas:'],
      bullets: [
        'cropEn: habilita el recorte de superposición 0/1 (predeterminado: 0).',
        'cropX: Recorta el centro X como fracción 0-1 (predeterminado: 0,5).',
        'cropY: Centro de cultivo Y como fracción 0-1 (predeterminado: 0,5).',
        'cropSize: tamaño de recorte como fracción de la imagen 0-1 (predeterminado: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Parámetros de bloqueo de seguridad',
      paragraphs: [
        'Controle qué elementos QR están protegidos contra modificaciones de superposición:',
      ],
      bullets: [
        'lockF: Bloquea los patrones del buscador 0/1 (predeterminado: 1).',
        'lockT: Bloquea los patrones de sincronización 0/1 (predeterminado: 1).',
        'lockA: Bloquea los patrones de alineación 0/1 (predeterminado: 1).',
        'lockFmt: información de formato de bloqueo 0/1 (predeterminado: 1).',
        'lockV: información de versión de bloqueo 0/1 (predeterminado: 1).',
        'safeMode: Modo de seguridad: desactivado, equilibrado, estricto (predeterminado: desactivado).',
        'safeMinPx: tamaño mínimo del módulo en píxeles (predeterminado: 2).',
        'safeMinQz: Módulos mínimos de zona silenciosa (predeterminado: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parámetros de ajuste automático',
      paragraphs: ['Configuración de optimización automática:'],
      bullets: [
        'autoVer: Selección automática de QR versión 0/1 (predeterminado: 1).',
        'autoEcc: selección automática del nivel ECC 0/1 (predeterminado: 0): solo sugerencia del lado del servidor.',
        'autoReduce: [SOLO PARA EL CLIENTE] Reduce automáticamente la intensidad hasta que se pueda escanear; requiere un bucle de validación de escaneo.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Parámetros de animación adicionales',
      paragraphs: ['Controles de animación ampliados para salida GIF:'],
      bullets: [
        'bucle: la animación se repite continuamente 0/1 (predeterminado: 1).',
        'rebote: Dirección de animación de ping-pong 0/1 (predeterminado: 0).',
        'inversa: reproduce la animación en reversa 0/1 (predeterminado: 0).',
        'colorCycle: habilita el efecto de ciclo de color 0/1 (predeterminado: 0).',
        'interp: interpolación de fotogramas: ninguno, fundido cruzado, transformación (predeterminado: ninguno).',
        'tempDither: tramado temporal: desactivado, blue_noise, flicker_safe (predeterminado: desactivado).',
        'startF: cuadro de inicio de la animación (predeterminado: 0).',
        'maxF: fotogramas máximos para renderizar (predeterminado: 0 = automático).',
        'stepF: Intervalo de paso de fotograma (predeterminado: 1).',
        'Jitter: [SOLO CLIENTE] Jitter del módulo en píxeles: requiere regeneración QR por cuadro.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Parámetros de tramado',
      paragraphs: ['Controle los algoritmos de tramado para el procesamiento de superposición:'],
      bullets: [
        'ditherKind: Algoritmo de tramado: error_diffusion,order_bayer, blue_noise, etc. (predeterminado:order_bayer).',
        'diffusionKernel: Error en el kernel de difusión: floyd_steinberg, jarvis_judice_ninke,sticki, burkes, sierra, atkinson (predeterminado: floyd_steinberg).',
        'ditherStrength: intensidad de dither 0-100 (predeterminado: 50).',
        'serpentina: tramado serpentino 0/1 (predeterminado: 0).',
        'matriz: matriz de interpolación ordenada: bayer2, bayer4, bayer8 (predeterminado: bayer4).',
        'bnTile: tamaño del mosaico de ruido azul (predeterminado: 64).',
        'bnSeed: semilla aleatoria de ruido azul (predeterminado: 0).',
        'colorDither: tramado de color: ninguno, por canal, perceptivo (predeterminado: ninguno).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Parámetros de subpíxeles',
      paragraphs: ['Configuraciones para el modo de fusión de subpíxeles:'],
      bullets: [
        'spGrid: tamaño de cuadrícula de subpíxeles: 2x2, 3x3, 4x4 (predeterminado: 3x3).',
        'spCenter: Regla central: estricta, halftone_center (predeterminado: estricta).',
        'spNeutral: hexadecimal de color neutro sin # (predeterminado: 808080).',
        'spFinder: Anulación del buscador: sólido, estilizado (predeterminado: sólido).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Parámetros de medios tonos',
      paragraphs: ['Configuraciones para el modo de fusión de medios tonos:'],
      bullets: [
        'htCell: tamaño de celda de semitono: per_module o nxn grid (predeterminado: per_module).',
        'htDot: Forma de punto: círculo, cuadrado, línea (predeterminado: círculo).',
        'htCurve: Curva de brillo: lineal, curva s, gamma (predeterminado: lineal).',
        'duo1: color de sombra duotono hexadecimal sin # (predeterminado: 000000).',
        'duo2: color de resaltado duotono hexadecimal sin # (predeterminado: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parámetros del modo compatible con ECC',
      paragraphs: [
        'Distribución de superposición inteligente basada en la capacidad de corrección de errores:',
      ],
      bullets: [
        'eccAware: habilita el modo compatible con ECC 0/1 (predeterminado: 0).',
        'eccRisk: porcentaje del presupuesto de riesgo 0-100 (predeterminado: 50).',
        'eccMap: mapa de peso: distancia_a_finders, block_heatmap, empirical_scan_heatmap (predeterminado: distancia_a_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Parámetros del marco',
      paragraphs: ['Configuración del marco decorativo:'],
      bullets: [
        'marco: estilo de marco: ninguno, marco_redondeado, etiqueta, etiqueta (predeterminado: ninguno).',
        'frameText: texto que se mostrará en el marco (codificado en URL).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parámetros de color por módulo',
      paragraphs: ['Opciones de coloración de módulos individuales:'],
      bullets: [
        'modColor: modo de color: sólido, por_brillo, por_posición, por_superposición, por_cluster (predeterminado: sólido).',
        'cGuard: Guardia de contraste 0/1 (predeterminado: 0).',
        'minContrast: Relación de contraste mínima 1-21 (predeterminado: 4,5).',
        'paleta: colores hexadecimales separados por comas para el modo paleta.',
        'PaletteMode: Distribución de la paleta: posición, brillo, diagonal, radial, aleatoria, fila, columna (predeterminado: posición).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parámetros de superposición de GIF',
      paragraphs: ['Configuraciones para imágenes superpuestas GIF animadas:'],
      bullets: [
        'ovType: tipo de superposición: estática, gif, apng, webp_anim, video (predeterminado: estática).',
        'ovFramePick: selección de fotogramas: todos, cada_n, max_frames, duración_limit (predeterminado: todos).',
        'gifDelays: utiliza retrasos de fotogramas GIF originales 0/1 (predeterminado: 1).',
        'gifDispH: manejo de eliminación de GIF: respetar, simplificar (predeterminado: respetar).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Límites de intensidad por ECC',
      paragraphs: ['Intensidad máxima de superposición por nivel de corrección de errores:'],
      bullets: [
        'maxIntL: Intensidad máxima para ECC L 0-100 (predeterminado: 100).',
        'maxIntM: Intensidad máxima para ECC M 0-100 (predeterminado: 100).',
        'maxIntQ: Intensidad máxima para ECC Q 0-100 (predeterminado: 100).',
        'maxIntH: Intensidad máxima para ECC H 0-100 (predeterminado: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parámetros de simulación de control de calidad (solo cliente)',
      paragraphs: [
        'Estos parámetros se analizan para comprobar la compatibilidad de URL, pero solo funcionan en el navegador:',
      ],
      bullets: [
        'qaContrast: Habilite la verificación de contraste 0/1; requiere validación interactiva.',
        'qaBlur: simula el desenfoque en píxeles, solo para pruebas interactivas.',
        'qaNoise: simula el nivel de ruido, solo para pruebas interactivas.',
        'qaHeatmap: muestra el mapa de calor de legibilidad 0/1: requiere una interfaz de usuario superpuesta en el lienzo.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Parámetros sólo del cliente',
      paragraphs: [
        'La mayoría de los parámetros API son totalmente compatibles con el lado del servidor. Los parámetros marcados como [SOLO PARA EL CLIENTE] se analizan para determinar la compatibilidad de URL, pero requieren funciones del navegador:',
      ],
      bullets: [
        'Jitter: el jitter del módulo requiere una regeneración QR por cuadro con aleatoriedad.',
        'autoReduce: la intensidad de reducción automática requiere pruebas de escaneo iterativas.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: la simulación de control de calidad requiere una validación interactiva del lienzo.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Parámetros de salida adicionales',
      paragraphs: ['Configuración extendida de salida y exportación:'],
      bullets: [
        'fname: nombre de archivo personalizado para descargas (predeterminado: anqr-qrcode).',
        'inclQz: incluye zona silenciosa en las dimensiones de salida 0/1 (predeterminado: 1).',
        'bgOver: el color de fondo anula el hexadecimal sin # (anula el parámetro bg).',
        'fmtExtra: formato de salida adicional: ninguno, eps, animación_webp (predeterminado: ninguno). Nota: eps es [PARCIAL].',
        'svgPrec: Precisión de forma SVG: píxel, preciso (predeterminado: píxel). [PARCIAL] Salida SVG limitada en el lado del servidor.',
        'svgEmbed: incrustar superposición ráster en SVG 0/1 (predeterminado: 1). [PARCIAL] Salida SVG limitada en el lado del servidor.',
        'modulePx: tamaño de píxel del módulo (predeterminado: calculado automáticamente a partir del tamaño).',
        'borde: módulos de borde adicionales más allá de la zona silenciosa (predeterminado: 0).',
        'nítido: habilita la representación de imágenes nítidas/pixeladas 0/1 (predeterminado: 1).',
        'snap: modo de captura de píxeles: piso, redondo, techo (predeterminado: piso).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parámetros de conservación de patrones',
      paragraphs: [
        'Controle qué elementos estructurales están protegidos contra la superposición:',
      ],
      bullets: [
        'keepFinders: conserva los patrones del buscador 0/1 (predeterminado: 1).',
        'keepTiming: conserva los patrones de sincronización 0/1 (predeterminado: 0).',
        'keepAlign: conserva los patrones de alineación 0/1 (predeterminado: 0).',
        'protectFmt: protege los módulos de información de formato 0/1 (predeterminado: 0).',
        'protectVer: protege los módulos de información de versión 0/1 (predeterminado: 0).',
      ],
    },
    {
      heading: 'Ejemplo de uso',
      paragraphs: [
        'Código básico de QR:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Código QR de estilo con colores personalizados:',
        'https://anqr.link/api/qr?data=Hello limitsize=300 implicafg=1e40af pacientebg=ffffffff limit=rounded',
        'Código QR con imagen superpuesta:',
        'https://anqr.link/api/qr?data=https://example.com implicaec=H disminuyeimg=https://example.com/logo.png limitmode=halftone restintensity=70',
        'GIF animado:',
        'https://anqr.link/api/qr?data=Hello recurformat=gif sensibleanimPattern=pulse limitanimFrames=24 coineasing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' }],
    },
    {
      heading: 'Incorporación de códigos QR',
      paragraphs: [
        'En modo Profesional, la función Share genera HTML y URL incrustables. Así es como funciona la incrustación:',
      ],
      bullets: [
        'Compartir Enlace: Crea una URL a la aplicación ANQR con todas sus configuraciones codificadas como parámetros URL. Los destinatarios pueden ver y modificar el código QR.',
        'Imagen Insertada: Genera una etiqueta <img confianza apuntando a la API del servidor. El código QR se ejecuta lado servidor y se sirve como imagen.',
        'Embed Markdown: Crea sintaxis de imagen de Markdown para documentación y archivos README.',
        'Direct API URL: La URL de API cruda para uso en aplicaciones, scripts u otras integraciones.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ejemplo de HTML',
      paragraphs: [
        'Para incrustar un código QR en su sitio web:',
        '■img src="https://anqr.link/api/qr?data=https://yoursite.com adultsize=200" alt="QR Code" / titulado',
        'Para el tamaño sensible:',
        '■img src="https://anqr.link/api/qr?data=https://yoursite.com adultsize=400" alt="QR Code" style="max-width: 100%; height: auto;" / confidencial',
        'Las respuestas del servidor con cabeceras de caché largas, por lo que las solicitudes repetidas para la misma URL son rápidas.',
      ],
    },
    {
      heading: 'Compartir formato URL',
      paragraphs: [
        'Al hacer clic en Compartir en modo Profesional, ANQR codifica sus configuraciones actuales en parámetros URL. El formato es:',
        'https://anqr.link/?data=...',
        'Estos parámetros reflejan los parámetros de API, para que pueda convertir una URL de compartir a una URL de API cambiando la ruta base de / a /api/qr y ajustar los parámetros w/h según sea necesario.',
        'Nota: Las imágenes superpuestas subidas de archivos locales no pueden ser compartidas a través de URL - sólo superposiciones basadas en URL (img parámetro) funcionan en enlaces compartidos y llamadas API.',
      ],
    },
    {
      heading: 'Límites de tarifas y uso',
      paragraphs: [
        'La API es libre de utilizar para volúmenes razonables. Para uso de alto volumen o aplicaciones comerciales que requieren tiempo de espera garantizado, por favor contáctenos.',
        'Las respuestas de la API incluyen encabezados de caché agresivos. Para el mejor rendimiento, las respuestas de caché en su extremo o utilizar la misma URL consistentemente para códigos QR idénticos.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Buenas prácticas',
      paragraphs: ['Siga estas directrices para códigos QR confiables:'],
      bullets: [
        'Siempre prueba tus códigos QR con múltiples aplicaciones de escáner antes de imprimir.',
        'Utilice la corrección de error H (alto) al añadir superposiciones.',
        'Mantenga al menos 4 módulos de zona tranquila (margin).',
        'Asegurar un alto contraste entre el primer plano y el fondo.',
        'Para imprimir, utilice al menos 300 DPI y prueba en tamaño de impresión real.',
        'Activar los patrones de búsqueda de presérvelos al usar superposiciones.',
        'Comience con menor intensidad de superposición y aumente gradualmente.',
        'Para uso al aire libre, considere tamaños de módulos más grandes y corrección de error más alta.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Buscar artículos de aprendizaje', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
      ],
    },
    {
      heading: 'Solución de problemas',
      paragraphs: ['Problemas y soluciones comunes:'],
      bullets: [
        'QR no escaneará: Reduzca la intensidad de superposición, aumente la corrección de errores, compruebe el contraste.',
        'Código demasiado grande: Reduzca la longitud del contenido, utilice el acortador de URL, versión inferior.',
        'Salida de borretería: Aumentar el tamaño del módulo, utilizar PNG en lugar de formatos comprimidos.',
        'Los colores se ven mal: Comprueba el contraste de color, prueba el modo de superposición a escala gris.',
        'GIF no anima: Asegúrese de utilizar la salida de formato GIF, cuenta de marco de verificación.',
        'Superposición de imagen no carga: Compruebe los permisos de CORS en imágenes remotas.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Ver guías y ejemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Atajos de teclado',
      paragraphs: [
        'ANQR admite atajos de teclado estándar. Utilice Ctrl/Cmd+S para activar la exportación (cuando se centra en la vista previa).',
      ],
    },
    {
      heading: 'Compartir " Embedding "',
      paragraphs: [
        'En modo Profesional, haga clic en el botón Compartir para copiar una URL con la configuración actual. Los destinatarios pueden abrir esta URL para ver su configuración exacta. Nota: Las imágenes superpuestas de los archivos locales no pueden ser compartidas por URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Pruebe esta configuración directamente en el generador ANQR.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Buscar artículos de aprendizaje', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Ver ejemplos de QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Abra el generador', type: 'generator' },
  ],
};

export default guide;
