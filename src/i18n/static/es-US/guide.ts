import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Guía del usuario de ANQR',
  description: 'Guía completa sobre el uso de ANQR para crear códigos QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'abre el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explorar artículos de aprendizaje', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Empezando',
      paragraphs: [
        'ANQR es un generador de códigos QR con un enfoque centrado en el cliente. De forma predeterminada, los códigos QR se generan localmente en su navegador; no se requiere una cuenta y sus datos permanecen privados. Para una integración profesional, también puede utilizar la API del lado del servidor.',
        'La interfaz tiene tres niveles de interfaz: Básico, Avanzado y Profesional. Seleccione su nivel usando las pestañas en el encabezado. Cada nivel desbloquea funciones adicionales mientras mantiene la interfaz enfocada en lo que necesitas.',
      ],
      bullets: [
        'Básico: creación de códigos QR simples con contenido de texto sin formato/URL y superposición de imágenes.',
        'Avanzado: opciones de codificación QR, estilos de representación, animación, formatos de salida, tipos de contenido extendido y personalización de superposición.',
        'Profesional: marcas de agua, metadatos, uso compartido, análisis de seguridad, códigos QR de pago y funciones empresariales.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'abre el generador', type: 'generator' }],
    },
    {
      heading: 'Inicio rápido',
      paragraphs: ['Para crear su primer código QR:'],
      bullets: [
        '1. Seleccione un tipo de contenido (URL, texto, WiFi, etc.) en el menú desplegable Tipo de contenido.',
        '2. Ingrese sus datos en los campos provistos.',
        '3. Opcionalmente, personalice colores y estilos y agregue una imagen superpuesta.',
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
      heading: 'Funciones básicas',
      paragraphs: [
        'El nivel Básico proporciona una interfaz optimizada para crear códigos QR con contenido de carga útil y superposiciones de imágenes. Esta es la forma más sencilla de empezar.',
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
      heading: 'Tipos de contenido (básico)',
      paragraphs: [
        'Texto sin formato: codifique cualquier texto hasta el límite de capacidad del código QR. Ideal para mensajes cortos, códigos o identificadores.',
        'URL: codifica direcciones web. El código QR abrirá la URL cuando se escanee. Admite protocolos http:// y https://.',
      ],
    },
    {
      heading: 'Superposición de imágenes (básica)',
      paragraphs: [
        'Cargue una imagen (JPG, PNG, GIF, WebP) para combinarla con su código QR. Las funciones básicas de superposición incluyen:',
      ],
      bullets: [
        'Cargar desde archivo: seleccione una imagen de su dispositivo.',
        'Cargar desde URL: ingrese la URL de una imagen (debe permitir CORS).',
        'Logotipo central: coloca la imagen en el centro, basándose en la corrección de errores.',
        'Mezcla: combinación alfa simple de imagen con patrón QR.',
        'Intensidad: controla la fuerza con la que la superposición afecta el código QR (0-100%).',
        'Modo de color: A todo color, Escala de grises o Blanco y negro.',
        'Conservar patrones del buscador: Mantiene los patrones de las esquinas sin modificar para un escaneo confiable.',
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
      heading: 'Funciones avanzadas',
      paragraphs: [
        'El nivel Avanzado desbloquea opciones de codificación QR, estilos de representación, animaciones, formatos de salida, tipos de contenido extendido y personalización de superposición avanzada.',
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
        'Versión: los códigos QR vienen en las versiones 1 a 40, y las versiones superiores contienen más datos pero son más grandes. Configúrelo en 0 (Automático) para permitir que ANQR elija la versión más pequeña que se ajuste a su contenido.',
        'Corrección de errores: determina cuánto daño puede sufrir un código QR sin dejar de ser escaneable.',
      ],
      bullets: [
        'L (Bajo): 7 % de corrección de errores: tamaño más pequeño, menor redundancia.',
        'M (Medio): 15% de corrección de errores - opción balanceada.',
        'Q (cuartil): corrección de errores del 25 %; bueno para códigos impresos.',
        'H (Alto): 30 % de corrección de errores; lo mejor para códigos con superposiciones o en condiciones difíciles.',
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
      heading: 'Zona tranquila (margen)',
      paragraphs: [
        'La zona tranquila es el espacio en blanco alrededor del código QR. Los escáneres necesitan este margen para detectar dónde comienza el código. La norma recomienda al menos 4 módulos. Reducir por debajo de 4 puede causar problemas de escaneo.',
      ],
    },
    {
      heading: 'Estilo del módulo',
      paragraphs: [
        'Los módulos son los cuadrados individuales que forman un código QR. ANQR ofrece cinco estilos:',
      ],
      bullets: [
        'Cuadrado: Aspecto QR clásico con esquinas afiladas.',
        'Redondeado: Esquinas suavizadas para una apariencia más amigable.',
        'Dots: Módulos circulares para una estética moderna.',
        'Diamante: cuadrados girados 45° para un patrón distintivo.',
        'Conectado: los módulos se fusionan cuando están adyacentes, creando formas orgánicas.',
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
      heading: 'Estilo de patrón del buscador',
      paragraphs: [
        'Los patrones del buscador son los tres cuadrados grandes en las esquinas QR que ayudan a los escáneres a orientar el código. Estilos disponibles:',
      ],
      bullets: [
        'Cuadrado: Esquinas cuadradas estándar.',
        'Redondeado: Esquinas suavizadas que combinan con el estilo del módulo redondeado.',
        'Círculo: Patrones de buscador circular para códigos de estilo de puntos.',
      ],
    },
    {
      heading: 'Patrones de alineación y sincronización',
      paragraphs: [
        'Los patrones de alineación aparecen en códigos QR más grandes (versión 2+) para ayudar a corregir la distorsión. Los patrones de tiempo son las líneas alternas que conectan los patrones del buscador.',
      ],
      bullets: [
        'Estilo de alineación: Buscador de coincidencias, Cuadrado, Redondeado o Círculo.',
        'Estilo de sincronización: Módulo coincidente, sólido o discontinuo.',
      ],
    },
    {
      heading: 'Colores',
      paragraphs: [
        'Primer plano: el color de los módulos QR. El negro (#000000) es estándar, pero cualquier color oscuro funciona.',
        'Fondo: el color de fondo. El blanco (#ffffff) es estándar. Asegúrese de que haya suficiente contraste con el primer plano.',
        'Fondo transparente: elimine el fondo por completo para usarlo en superficies coloreadas. Asegúrese de que la superficie proporcione el contraste adecuado.',
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
      heading: 'Tamaño y espacio del módulo',
      paragraphs: [
        'Tamaño del módulo: controla el tamaño de cada módulo en píxeles. Los valores más grandes crean códigos más grandes y más fáciles de escanear.',
        'Espacio entre módulos: agrega espacio entre módulos como porcentaje. Los espacios pequeños (5-15%) pueden mejorar la capacidad de escaneo en algunas condiciones, pero los espacios excesivos reducen la confiabilidad.',
      ],
    },
    {
      heading: 'Configuración de salida',
      paragraphs: ['Formato: elija su formato de exportación según el caso de uso.'],
      bullets: [
        'PNG: formato ráster sin pérdidas, ideal para la mayoría de usos. Lo mejor para impresión y digital.',
        'WebP: formato moderno con tamaños de archivo más pequeños. Bueno para uso web.',
        'GIF: Requerido para códigos QR animados. Apoya la transparencia.',
        'SVG: Formato vectorial que escala infinitamente. Lo mejor para letra grande o cuando necesite editar el código.',
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
      heading: 'Dimensiones de salida',
      paragraphs: [
        'Ancho/Alto: establece el tamaño de salida en píxeles. Para imprimir, calcule según los DPI (por ejemplo, 300 DPI a 1 pulgada = 300 px). Los tamaños más grandes escanean de manera más confiable a distancia.',
      ],
    },
    {
      heading: 'Configuración de animación (avanzada)',
      paragraphs: ['Controle el comportamiento del código QR animado:'],
      bullets: [
        'Velocidad: velocidad de cuadros de animación en milisegundos.',
        'Bucle: Animación continua o de una sola reproducción.',
        'Rebote: Dirección de animación de ping-pong.',
        'Cuadro inicial: comienza la animación desde un cuadro específico.',
        'Max Frames: limita el total de fotogramas en la animación.',
        'Paso de fotograma: omita fotogramas para una animación más rápida.',
        'Interpolación: Ninguna, Fundido cruzado o Transformación entre fotogramas.',
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
      heading: 'Tipos de contenido (avanzado)',
      paragraphs: ['El nivel avanzado desbloquea formatos de carga útiles adicionales:'],
      bullets: [
        'Número de teléfono (tel:): crea un enlace telefónico al que se puede llamar.',
        'Correo electrónico (mailto:): abre un cliente de correo electrónico con asunto y cuerpo opcionales.',
        'SMS: mensaje de texto precargado a un número de teléfono.',
        'vCard: Tarjeta de contacto completa con nombre, organización, teléfono, correo electrónico, dirección.',
        'MeCard: formato de contacto compacto popular en Japón.',
        'BizCard: formato de tarjeta de presentación heredado.',
        'Ubicación geográfica: coordenadas GPS que se abren en mapas.',
        'WiFi: Credenciales de red para conexión automática (SSID, contraseña, tipo de seguridad).',
        'Evento de calendario: formato iCalendar con título, ubicación, fecha/hora.',
        'Confirmación de asistencia al evento: enlace a la página de registro del evento.',
        'Suscripción al calendario: suscríbase a un feed de ICS/WebCal.',
        'URL de archivo/documento: enlace directo a archivos descargables.',
        'Enlace de almacenamiento en la nube: enlaces a Google Drive, Dropbox, OneDrive, etc.',
        'Perfil social: enlaces a LinkedIn, Twitter, Instagram, etc.',
        'Enlace de mensajería: WhatsApp, Telegram, enlaces profundos de Signal.',
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
      heading: 'Funciones avanzadas de superposición',
      paragraphs: ['Capacidades de superposición adicionales:'],
      bullets: [
        'Recortar: habilite el recorte para seleccionar una región cuadrada de su imagen.',
        'Medio tono: patrón de puntos de estilo de impresión clásico basado en el brillo de la imagen.',
        'Difuminado: Difuminado de difusión de errores para una reproducción detallada.',
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
      heading: 'Modos de fusión de superposición (avanzado)',
      paragraphs: ['Modos de fusión adicionales en el nivel Avanzado:'],
      bullets: [
        'Subpíxel: divide cada módulo en subpíxeles para obtener mayor detalle.',
        'Ruido azul: utiliza difuminado de ruido azul para patrones sin artefactos.',
        'Mosaico: Efecto a base de mosaicos que preserva la estructura de la imagen.',
        'Relleno de espacios: coloca la imagen en espacios entre módulos.',
        'Brillo: varía el tamaño del módulo según el brillo de la imagen.',
        'Duotono: asigna la imagen a dos colores para lograr un contraste sorprendente.',
      ],
    },
    {
      heading: 'Intensidad de superposición',
      paragraphs: [
        'Controla la fuerza con la que la superposición afecta el código QR (0-100%). Los valores más altos muestran más detalles de la imagen, pero pueden reducir la capacidad de escaneo. Comience alrededor del 70% y ajuste según las pruebas.',
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
        'A todo color: conserva los colores originales de la imagen.',
        'Escala de grises: convierte a tonos de blanco y negro.',
        'Blanco y negro: conversión binaria de alto contraste.',
      ],
    },
    {
      heading: 'Preservar patrones del buscador',
      paragraphs: [
        'Cuando está habilitado, mantiene los patrones del buscador de tres esquinas sin modificar por la superposición. Altamente recomendado para un escaneo confiable.',
      ],
    },
    {
      heading: 'Preprocesamiento de imágenes',
      paragraphs: [
        'Aplique filtros a su imagen superpuesta antes de fusionarla. Estos ajustes pueden mejorar la apariencia de la imagen en el código QR final.',
      ],
      bullets: [
        'Brillo (-100 a +100): aclara u oscurece la imagen.',
        'Contraste (-100 a +100): aumenta o disminuye el rango tonal.',
        'Gamma (0,2 a 3,0): Ajuste de brillo no lineal. Los valores inferiores a 1 aclaran los medios tonos y los superiores a 1 los oscurecen.',
        'Saturación (-100 a +100): Intensidad del color. -100 es escala de grises, +100 está sobresaturado.',
        'Rotar tono (0-360°): cambia todos los colores alrededor de la rueda de colores.',
        'Desenfocar (0-20px): suaviza los detalles de la imagen.',
        'Enfocar (0-100%): mejora los bordes y los detalles.',
        'Posterizar (niveles 0-16): reduzca los niveles de color para obtener un efecto de póster.',
        'Umbral (0-255): convierte a blanco/negro binario en el punto de corte.',
        'Detección de bordes: algoritmos de Sobel o Canny para mostrar solo bordes.',
        'Invertir: invertir todos los colores.',
      ],
    },
    {
      heading: 'Modo de ajuste',
      paragraphs: ['Cómo se ajusta la imagen superpuesta al área del código QR:'],
      bullets: [
        'Portada: la imagen ocupa toda el área y se recorta si es necesario.',
        'Contiene: Imagen completa visible, puede tener márgenes.',
        'Estirar: la imagen se distorsiona para rellenarse exactamente.',
      ],
    },
    {
      heading: 'Opciones de transformación',
      paragraphs: [
        'Rotación: gire la superposición en incrementos de 90°.',
        'Voltear X/Y: refleja la imagen horizontal o verticalmente.',
      ],
    },
    {
      heading: 'Algoritmos de tramado',
      paragraphs: [
        'El tramado convierte imágenes de tonos continuos en patrones que los códigos QR pueden representar. Disponible cuando se utilizan los modos de fusión Dithered, Blue Noise o True Dither.',
      ],
      bullets: [
        'Difusión de errores: estilo clásico de Floyd-Steinberg. Distribuye el error de cuantificación a los píxeles vecinos.',
        'Ordenado (Bayer): utiliza una matriz de umbral para patrones regulares.',
        'Punto agrupado: simula la impresión de medios tonos.',
        'Void & Cluster: tramado ordenado optimizado.',
        'Ruido azul: patrón de aspecto aleatorio visualmente agradable.',
        'Umbral de ruido azul: Umbral de tramado con textura de ruido azul.',
        'Ruido blanco: tramado de umbral aleatorio.',
        'Ruido Gaussiano/Triangular: Ruido con diferentes distribuciones.',
        'Ruido Azul + Difusión de Error: Híbrido que combina ambas técnicas.',
        'Ruido azul filtrado: patrón de ruido azul similar a una pantalla.',
        'Perceptual: ponderado por luminancia para mejores resultados visuales.',
        'Edge-Aware: conserva los bordes de la imagen durante el tramado.',
        'Umbral adaptativo: Umbral adaptativo local.',
        'Ruido azul temporal: para GIF animados, varía el patrón por cuadro.',
      ],
    },
    {
      heading: 'Núcleos de difusión',
      paragraphs: [
        'Cuando utilice el difuminado de difusión de errores, elija cómo se distribuye el error:',
      ],
      bullets: [
        'Floyd-Steinberg: Difusión clásica de 4 vecinos. Buena elección general.',
        'Jarvis-Judice-Ninke: 12 vecinos, más suaves pero más lentos.',
        'Stucki: Similar a JJN con diferentes pesos.',
        'Burkes: JJN simplificado, más rápido.',
        'Sierra: Familia de granos que equilibran calidad y velocidad.',
        'Atkinson: Difusión de luz, conserva los detalles pero puede ser granulada.',
      ],
    },
    {
      heading: 'Fuerza de tramado',
      paragraphs: [
        'Controla la cantidad de tramado que se aplica (0-100%). Los valores más bajos conservan más del patrón original, los valores más altos muestran más detalles de la imagen.',
      ],
    },
    {
      heading: 'Configuración de subpíxeles',
      paragraphs: ['Cuando se utiliza el modo de fusión de subpíxeles:'],
      bullets: [
        'Tamaño de cuadrícula: 2×2, 3×3 o 4×4 subpíxeles por módulo. Mayor = más detalle.',
        'Regla central: estricta requiere que el subpíxel central coincida con el módulo. El centro de semitonos permite variaciones.',
        'Color Neutro: Color utilizado para subpíxeles indeterminados.',
        'Anulación del buscador: cómo se representan los patrones del buscador (sólidos o estilizados).',
      ],
    },
    {
      heading: 'Configuración de medios tonos',
      paragraphs: ['Cuando se utiliza el modo de fusión de medios tonos:'],
      bullets: [
        'Tamaño de celda: por módulo o cuadrícula N×N.',
        'Forma de punto: círculo, cuadrado o línea.',
        'Curva de brillo: lineal, curva S o gamma.',
      ],
    },
    {
      heading: 'Colores duotono',
      paragraphs: [
        'Cuando utilice el modo de fusión Duotono, establezca el color de Sombra (áreas oscuras) y el color de Resaltado (áreas brillantes).',
      ],
    },
    {
      heading: 'Configuración de animación GIF',
      paragraphs: ['Cuando se utilizan superposiciones de GIF animados:'],
      bullets: [
        'Utilice retrasos de fotogramas: respete el tiempo del GIF original.',
        'FPS máximo: limita la velocidad de fotogramas (1-60 fps).',
        'Manejo de eliminación: Respetar o simplificar los métodos de eliminación del marco.',
      ],
    },
    {
      heading: 'Opciones de renderizado avanzadas',
      paragraphs: ['Controles de renderizado adicionales:'],
      bullets: [
        'Modo de espacio: Estilo de espacio Ninguno, Insertado, Trazo o Espacio negativo.',
        'Radio de esquina: Porcentaje de esquinas redondeadas para módulos.',
        'Degradado: Ninguno, Degradado lineal, radial o cónico en los módulos.',
        'Estilo exterior/interior del ojo: estilo independiente para los anillos del patrón del buscador.',
        'Rotación de puntos: rota los módulos de diamantes/puntos.',
        'Escala de ojos: ajuste de tamaño para los patrones del buscador.',
        'Estilo de marco: agregue marcos decorativos (marco redondeado, pegatina, etiqueta).',
        'Texto del marco: agregue texto como "¡Escanéame!" a marcos.',
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
      heading: 'Codificación QR avanzada',
      paragraphs: ['Ajuste la codificación QR:'],
      bullets: [
        'Modo de codificación: Automático, Numérico, Alfanumérico, Byte/UTF-8 o Kanji.',
        'Aplicar zona mínima de silencio: garantice un margen de al menos 4 módulos.',
        'Patrón de máscaras: Auto (optimal), o selecciona manualmente patrones 0-7 para controlar la distribución del módulo. Diferentes patrones crean diferentes apariencias visuales mientras se encogen los mismos datos.',
        'Codificación de caracteres: ISO-8859-1 (por defecto de latín-1), UTF-8 (un código completo incluyendo emoji), o Shift-JIS (japonés). Elija basado en los requisitos de carácter de su contenido.',
      ],
    },
    {
      heading: 'Opciones de salida avanzadas',
      paragraphs: ['Configuraciones de exportación adicionales:'],
      bullets: [
        'Nombre de archivo: nombre de archivo personalizado para descargas.',
        'Tamaño de paleta GIF: 2-256 colores en salida GIF.',
        'Cuantizador GIF: reducción de color Median Cut, NeuQuant u Octree.',
        'Difuminado GIF: Desactivado, Floyd-Steinberg u Ordenado.',
        'Color transparente GIF: establece un color para que sea transparente.',
        'SVG True Vector: utilice rutas en lugar de ráster incrustado.',
        'Precisión de forma SVG: Representación de ruta precisa o de píxeles.',
        'Superposición ráster integrada de SVG: incluye superposición como imagen incrustada.',
        'Anulación de fondo: fuerza un color de fondo específico en la salida.',
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
      paragraphs: ['Configuración de procesamiento de entrada:'],
      bullets: [
        'Validar entrada: verifique el formato del contenido antes de codificar.',
        'Recortar espacios en blanco: elimina los espacios iniciales y finales.',
        'Normalizar nuevas líneas: convierte todos los finales de línea a LF.',
        'Guardia de longitud máxima: advierte si el contenido excede la capacidad QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Funciones profesionales',
      paragraphs: [
        'El nivel Profesional agrega marcas de agua, metadatos, opciones para compartir, análisis de seguridad, códigos QR de pago y funciones empresariales.',
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
      heading: 'marca de agua',
      paragraphs: ['Agregue marcas de agua a sus códigos QR:'],
      bullets: [
        'Tipo: Texto, Imagen o Patrón de marca de agua.',
        'Posición: Centro, Esquinas, Bordes, Detrás o Zona tranquila.',
        'Opacidad: Transparencia de marca de agua (0-100%).',
        'Modo de fusión: fusión Normal, Multiplicar, Trama o Superposición.',
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
      paragraphs: ['Incrustar metadatos en archivos exportados:'],
      bullets: [
        'Campos Título, Autor, Copyright, Licencia, Descripción.',
        'Hora de creación: incrustar la marca de tiempo de generación.',
        'Valor-clave personalizado: agregue pares de metadatos arbitrarios.',
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
      paragraphs: ['Comparta las configuraciones de su código QR:'],
      bullets: [
        'Enlace directo: genere una URL que se pueda compartir con su configuración actual.',
        'Insertar HTML: obtenga código para insertar para sitios web.',
        'Parámetros de codificación: incluya todas las configuraciones en la URL compartida.',
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
      paragraphs: ['Asegúrese de que los códigos QR sigan siendo escaneables:'],
      bullets: [
        'Modo de seguridad: Requisitos de escaneo desactivados, equilibrados o estrictos.',
        'Tamaño mínimo de módulo: tamaño mínimo de píxel por módulo.',
        'Min Quiet Zone: Módulos de margen mínimo.',
        'Bloquear buscadores/Tiempo/Alinear/Formato/Versión: Protege elementos específicos.',
        'Intensidad máxima de superposición por ECC: límites de intensidad automáticos basados en el nivel de corrección de errores.',
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
      paragraphs: ['El nivel profesional agrega tipos de contenido empresarial y de pago:'],
      bullets: [
        'EPC/SEPA (UE): Códigos QR de transferencia bancaria europea con IBAN, BIC, importe, referencia.',
        'UPI (India): Interfaz de pagos unificada con VPA, nombre del beneficiario, monto.',
        'PayNow (Singapur): Pago rápido en Singapur con UEN o número de móvil.',
        'PromptPay (Tailandia): sistema de pago nacional tailandés.',
        'PIX (Brasil): Pago instantáneo brasileño con clave PIX.',
        'Cripto: Direcciones de pago Bitcoin, Ethereum, Litecoin con monto opcional.',
        'Enlace de campaña de marketing: URL con seguimiento completo de parámetros UTM (etiquetas de marketing).',
        'Enlace corto: para usar con acortadores de URL para códigos QR dinámicos/rastreables.',
        'Enlace Digital GS1: Identificación del producto con GTIN, serial, lote, vencimiento.',
        'Enlace profundo de aplicaciones: enlaces profundos de aplicaciones iOS/Android con esquemas personalizados.',
        'Formato personalizado: datos sin formato sin formato ni validación.',
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
      heading: 'Pagos relevantes para el idioma en modo avanzado',
      paragraphs: [
        'Al utilizar el modo avanzado, ANQR muestra automáticamente los métodos de pago relevantes para el idioma seleccionado. Por ejemplo, los usuarios vietnamitas ven VietQR, los usuarios tailandeses ven PromptPay y los usuarios de idiomas indios ven UPI y BharatQR. Los métodos de pago globales (criptomoneda, PayPal, Cash App) están disponibles en todos los idiomas. El modo Profesional desbloquea todos los estándares de pago independientemente del idioma.',
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
      heading: 'Estándares de pago europeos',
      bullets: [
        'EPC/SEPA (UE): códigos QR de transferencia bancaria europea siguiendo el estándar de códigos QR EPC. Admite IBAN, BIC (opcional para nacionales), importe en EUR y referencias de pago estructuradas o no estructuradas. Se utiliza en toda la zona SEPA, incluidos los países de la UE, además de Suiza, Noruega, Islandia, Liechtenstein, Mónaco y San Marino.',
        'Factura QR suiza: estándar de pago suizo que sigue las SEIS pautas de implementación. Admite CHF y EUR, referencia QR (QRR), referencia de acreedor (ISO 11649), direcciones estructuradas de acreedor/deudor e información de facturas. Requerido para facturas suizas desde 2022.',
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
      heading: 'Estándares de pago indios',
      bullets: [
        'UPI (India): Interfaz de pagos unificada según la especificación de enlaces profundos de NPCI. Admite VPA (dirección de pago virtual), nombre del beneficiario, monto en INR, nota de transacción, ID de referencia, código de categoría de comerciante y modo de transacción.',
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
      heading: 'Estándares de pago del sudeste asiático',
      bullets: [
        'PayNow (Singapur): sistema de pago rápido de Singapur que utiliza la especificación QR EMVCo con perfil SGQR. Admite UEN (registro comercial), número de teléfono móvil o NRIC como identificadores de proxy. Incluye indicador de editabilidad del monto y fecha de vencimiento.',
        'PromptPay (Tailandia): sistema de pago nacional tailandés que sigue el perfil EMV del Banco de Tailandia. Admite número de teléfono móvil, identificación nacional, identificación fiscal, identificación de billetera electrónica y pago de facturas con múltiples campos de referencia.',
        'QRIS (Indonesia): Código de respuesta rápida Estándar indonesio. Estándar de pago nacional basado en EMV que admite identificación de comerciante, NMID (ID de comerciante nacional), clasificación de criterios de comerciante y tarifas de conveniencia (fijas o porcentuales).',
        'DuitNow (Malasia): sistema de pago instantáneo de Malasia. Admite múltiples tipos de proxy, incluidos NRIC, móvil, pasaporte, identificación militar y números de registro comercial.',
        'VietQR (Vietnam): estándar de transferencias interbancarias vietnamita. Requiere BIN bancario (identificación NAPAS) y número de cuenta. Admite múltiples códigos de servicio para diferentes tipos de transferencias (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipinas): estándar de pago QR filipino para InstaPay y PESONet. Utiliza números de cuenta con identificación de comerciante para transacciones P2M (de persona a comerciante).',
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
      heading: 'Estándares de pago del este de Asia',
      bullets: [
        'TWQR (Taiwán): estándar de pago QR taiwanés. Admite montos de identificación de comerciante, identificación fiscal y TWD.',
        'HKQR/FPS (Hong Kong): códigos QR del sistema de pago más rápido de Hong Kong. Admite ID de FPS, número de móvil o correo electrónico como identificadores de pago. Importes en HKD.',
        'JPQR (Japón): estándar de pago con código QR unificado japonés. Utiliza el ID de la tienda para la identificación del comerciante con montos en JPY.',
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
      heading: 'Otros estándares de pago regionales',
      bullets: [
        'PIX (Brasil): Sistema de pago instantáneo del Banco Central de Brasil según especificación del Código BR. Admite claves PIX (CPF, CNPJ, correo electrónico, teléfono o clave aleatoria), nombre/ciudad del comerciante, ID de transacción y montos en BRL.',
        'AusPayNet/NPP PayID (Australia): Nuevo sistema PayID de la plataforma de pagos australiana. Admite tipos de PayID (correo electrónico, móvil, ABN, ID de organización) o número de cuenta BSB + tradicional. El nombre del comerciante es opcional ya que los pagadores ven el nombre registrado en la búsqueda de NPP.',
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
      heading: 'Pagos con criptomonedas',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): URI de pago de criptomonedas estándar con dirección de billetera, monto opcional y etiqueta. Compatible con todas las principales carteras de Bitcoin y Litecoin.',
        'Lightning Network (BOLT11): Facturas de pago de Lightning Network. Pegue una cadena de factura codificada BOLT11 para pagos instantáneos de Bitcoin con tarifas mínimas.',
        'Ethereum (EIP-681): URI de solicitud de transacción de Ethereum que admiten transferencias ETH nativas y transferencias de tokens ERC-20. Incluye ID de cadena para soporte de múltiples redes (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parámetros de gas y llamadas a funciones de contrato.',
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
      heading: 'Servicios de enlace de pago',
      bullets: [
        'PayPal.Me: enlaces de pago de PayPal con nombre de usuario y monto precargado opcional. Los destinatarios pueden pagar mediante saldo de PayPal, tarjetas o cuentas bancarias.',
        'Aplicación Cash: enlaces de pago de la aplicación Cash usando $cashtag con monto opcional. Popular en los Estados Unidos para pagos entre pares.',
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
      heading: 'QR EMV genérico',
      bullets: [
        'EMV genérico: cree códigos QR personalizados en modo presentado por comerciantes EMV para esquemas de pago que no figuran específicamente en la lista. Configure el nombre del comerciante, la ciudad, el código de país (ISO 3166-1), el código de moneda (numérico ISO 4217), MCC, opciones de propinas/tarifas de conveniencia y campos de datos adicionales. Útil para pruebas o integraciones personalizadas.',
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
      heading: 'Modos de fusión de superposición (profesional)',
      paragraphs: ['Modos de fusión adicionales en el nivel Profesional:'],
      bullets: [
        'Pixelar: efecto de superposición pixelada.',
        'Contorno: superposición de detección de bordes que muestra solo contornos.',
        'Onda: Efecto de distorsión ondulada.',
        'Tamaño de subpíxel: tamaño de subpíxel variable según la imagen.',
        'True Dither: Tramado avanzado con selección de matriz ordenada.',
        'Extremo: Visibilidad máxima de la imagen, puede afectar la capacidad de escaneo.',
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
      heading: 'Configuración de protección',
      paragraphs: [
        'Control detallado sobre qué elementos QR están protegidos contra modificaciones de superposición:',
      ],
      bullets: [
        'Preservar el tiempo: Mantenga los patrones de tiempo sin modificar.',
        'Preservar alineación: mantiene los patrones de alineación sin modificar.',
        'Proteger información de formato: Proteger módulos de información de formato.',
        'Información de versión protegida: módulos de información de versión protegida.',
      ],
    },
    {
      heading: 'Modo compatible con ECC',
      paragraphs: [
        'Distribuye inteligentemente la intensidad de la superposición según la capacidad de corrección de errores. El sistema analiza qué módulos se pueden modificar manteniendo la capacidad de escaneo.',
      ],
      bullets: [
        'Presupuesto de Riesgo: Porcentaje de capacidad de corrección de errores a utilizar (0-100%).',
        'Mayor presupuesto = superposición más visible pero escaneabilidad más riesgosa.',
        'Presupuesto más bajo = escaneo más seguro pero superposición menos visible.',
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
      heading: 'Opciones de renderizado profesional',
      paragraphs: ['Controles de renderizado avanzados:'],
      bullets: [
        'Bordes nítidos: utilice la representación de imágenes pixeladas para obtener bordes de módulo nítidos.',
        'Ajuste de píxeles: alineación de píxeles de suelo, redondo o techo.',
        'Modo de color por módulo: sólido, por brillo, por posición, por superposición, por grupo.',
        'Paleta de colores: defina una paleta de colores personalizada para colorear por módulo.',
        'Contrast Guard: garantiza una relación de contraste mínima entre colores.',
        'Relación de contraste mínima: requisito de contraste estilo WCAG (1:1 a 21:1).',
        'Módulos fronterizos adicionales: frontera adicional más allá de la zona tranquila.',
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
      heading: 'Opciones de salida profesional',
      paragraphs: ['Configuración de exportación empresarial:'],
      bullets: [
        'DPI: establece la resolución de impresión (72-600 DPI). Se recomiendan 300 DPI para imprimir.',
        'Incluir zona silenciosa: alterna la zona silenciosa en las dimensiones de salida.',
        'Exportar como adicional: genere PDF junto con el formato principal.',
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
      heading: 'Configuración de animación (profesional)',
      paragraphs: ['Funciones adicionales de animación profesional:'],
      bullets: [
        'Tramado temporal: Desactivado, Ruido azul o Parpadeo Tramado seguro por fotograma.',
        'Patrón: Efectos Ninguno, Pulso, Onda, Línea de exploración, Brillo o Deriva.',
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
      heading: 'Referencia de API',
      paragraphs: [
        'ANQR proporciona una API del lado del servidor para generar códigos QR mediante parámetros de URL. Esto es ideal para incrustar códigos QR en sitios web, correos electrónicos, documentos o flujos de trabajo automatizados sin JavaScript del lado del cliente.',
        'URL base: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' }],
    },
    {
      heading: 'Parámetros básicos',
      paragraphs: [
        'Parámetros obligatorios y comunes (los nombres de los parámetros no están traducidos):',
      ],
      bullets: [
        'datos (obligatorio): El contenido a codificar en el código QR. Caracteres especiales con codificación URL.',
        'tamaño: Tamaño de la imagen en píxeles (predeterminado: 400, máximo: 2000). Se utiliza si no se especifica w/h.',
        'w, h: ancho y alto de salida en píxeles. Anula el parámetro de tamaño.',
        'formato: formato de salida: png, webp o gif (predeterminado: png).',
        'ec: Nivel de corrección de errores: L, M, Q o H (predeterminado: H).',
        'fg: color de primer plano como hexadecimal sin # (predeterminado: 000000).',
        'bg: color de fondo como hexadecimal sin # (predeterminado: ffffff).',
        'transparente: establezca en 1 para un fondo transparente.',
        'margen: Zona silenciosa en módulos (por defecto: 4).',
      ],
    },
    {
      heading: 'Parámetros de estilo',
      paragraphs: ['Estilo de módulos y patrones:'],
      bullets: [
        'estilo: Estilo de módulo: cuadrado, redondeado, puntos, diamante, conectado.',
        'finder: Estilo de patrón del buscador: cuadrado, redondeado, círculo.',
        'align: Estilo de patrón de alineación: match_finder, cuadrado, redondeado, círculo.',
        'sincronización: estilo de patrón de sincronización: match_module, sólido, discontinuo.',
        'radio: porcentaje del radio de la esquina 0-100.',
        'brecha: Porcentaje de brecha del módulo 0-50.',
        'gapMode: Modo de espacio: ninguno, recuadro, trazo, espacio_negativo.',
        'eyeOuter, eyeInner: Estilos de ojos: cuadrado, redondeado, círculo.',
        'eyeScale: porcentaje de escala ocular (predeterminado: 100).',
        'grad: tipo de gradiente: ninguno, lineal, radial, cónico.',
        'gradAngle: ángulo de gradiente para gradientes lineales.',
        'gradStops: el degradado se detiene como color1, pos1, color2, pos2,... (por ejemplo, ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Parámetros de superposición',
      paragraphs: [
        'Opciones de superposición de imágenes (la imagen superpuesta se obtiene del lado del servidor):',
      ],
      bullets: [
        'img: URL para superponer la imagen (debe ser de acceso público).',
        'modo: Modo de superposición: centro, medios tonos, fusión, brillo, mosaico, difuminado, ruido azul, subpíxel.',
        'intensidad: Intensidad de superposición 0-100 (predeterminado: 100).',
        'colorMode: modo de color de superposición: color, escala de grises, blanco y negro.',
        'ajuste: Cómo encaja la superposición: cubrir, contener, estirar.',
        'rot: rotación de superposición en grados.',
        'flipX, flipY: establezca en 1 para voltear la superposición.',
        'keepFinders: conserva los patrones del buscador (predeterminado: 1).',
        'keepTiming, keepAlign: establezca en 1 para preservar los patrones de sincronización/alineación.',
      ],
    },
    {
      heading: 'Parámetros de preprocesamiento',
      paragraphs: ['Preprocesamiento de imagen aplicado a la superposición:'],
      bullets: [
        'brillo: Ajuste -100 a 100 (predeterminado: 0).',
        'contraste: Ajuste -100 a 100 (predeterminado: 0).',
        'gamma: Valor de 0,1 a 3 (predeterminado: 1).',
        'saturación: Ajuste -100 a 100 (predeterminado: 0).',
        'tono: Rotación de tono en grados.',
        'desenfoque: Desenfoque en píxeles.',
        'afilar: cantidad de agudización 0-100.',
        'posterizar: Posterizar niveles.',
        'umbral: umbral binario 0-255.',
        'borde: Detección de bordes: apagado, sobel, astuto.',
        'invertir: establezca en 1 para invertir los colores.',
      ],
    },
    {
      heading: 'Parámetros de marca de agua',
      paragraphs: ['Agregue marcas de agua a los códigos QR generados:'],
      bullets: [
        'wmEn: establezca en 1 para habilitar la marca de agua.',
        'wmKind: tipo de marca de agua: texto, imagen, patrón.',
        'wmText: texto de marca de agua (codificado en URL).',
        'wmImg: URL a la imagen de marca de agua.',
        'wmPos: Posición: centro, esquinas, bordes, detrás, zona_quieta.',
        'wmOpacity: Opacidad 0-100 (predeterminado: 50).',
        'wmBlend: Modo de fusión: normal, multiplicar, pantalla, superposición.',
      ],
    },
    {
      heading: 'Parámetros de animación',
      paragraphs: ['Para salida de GIF animado (requiere formato=gif):'],
      bullets: [
        'animPattern: patrón de animación: ninguno, pulso, onda, línea de exploración, brillo, deriva, ciclo de color.',
        'animFrames: número de fotogramas del 1 al 60 (predeterminado: 24).',
        'animSpeed: retraso del cuadro en milisegundos 10-1000 (predeterminado: 100).',
        'animSeed: semilla aleatoria para animación.',
        'flexibilización: Facilitación de animación: lineal, facilidad_in, facilidad_salida, facilidad_in_out, rebote.',
      ],
    },
    {
      heading: 'Parámetros de salida',
      paragraphs: ['Opciones de formato de salida:'],
      bullets: [
        'Calidad: calidad WebP 0-1 (predeterminado: 0,9).',
        'webpQ: calidad WebP 0-100 (predeterminado: 90).',
        'gifColors: tamaño de paleta GIF 2-256 (predeterminado: 256).',
        'ppp: DPI de salida para PNG (predeterminado: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: campos de metadatos PNG.',
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
      heading: 'Uso de ejemplo',
      paragraphs: [
        'Código QR básico:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Código QR con estilo y colores personalizados:',
        'https://anqr.link/api/qr?data=Hola&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'Código QR con imagen superpuesta:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF animado:',
        'https://anqr.link/api/qr?data=Hola&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' }],
    },
    {
      heading: 'Incrustar códigos QR',
      paragraphs: [
        'En el modo Profesional, la función Compartir genera HTML y URL incrustables. Así es como funciona la incrustación:',
      ],
      bullets: [
        'Compartir enlace: crea una URL para la aplicación ANQR con todas sus configuraciones codificadas como parámetros de URL. Los destinatarios pueden ver y modificar el código QR.',
        'Insertar imagen: genera una etiqueta <img> que apunta a la API del servidor. El código QR se representa en el lado del servidor y se muestra como una imagen.',
        'Incrustar Markdown: crea sintaxis de imagen de Markdown para documentación y archivos README.',
        'URL de API directa: la URL de API sin formato para usar en aplicaciones, scripts u otras integraciones.',
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
      heading: 'Ejemplo HTML',
      paragraphs: [
        'Para insertar un código QR en su sitio web:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="Código QR" />',
        'Para un tamaño adaptable:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="Código QR" style="ancho máximo: 100%; alto: automático;" />',
        'El servidor almacena en caché las respuestas con encabezados de caché largos, por lo que las solicitudes repetidas para la misma URL son rápidas.',
      ],
    },
    {
      heading: 'Compartir formato de URL',
      paragraphs: [
        'Cuando hace clic en Compartir en modo Profesional, ANQR codifica su configuración actual en parámetros de URL. El formato es:',
        'https://anqr.link/?data=...&ec=H&style=redondeado&....',
        'Estos parámetros reflejan los parámetros de API, por lo que puede convertir una URL compartida en una URL de API cambiando la ruta base de / a /api/qr y ajustando los parámetros w/h según sea necesario.',
        'Nota: Las imágenes superpuestas cargadas desde archivos locales no se pueden compartir a través de URL; solo las superposiciones basadas en URL (parámetro img) funcionan en enlaces compartidos y llamadas API.',
      ],
    },
    {
      heading: 'Límites de tarifas y uso',
      paragraphs: [
        'La API es de uso gratuito para volúmenes razonables. Para uso de gran volumen o aplicaciones comerciales que requieren tiempo de actividad garantizado, contáctenos.',
        'Las respuestas de la API incluyen encabezados de almacenamiento en caché agresivos. Para obtener el mejor rendimiento, almacene en caché las respuestas de su parte o use la misma URL de manera consistente para códigos QR idénticos.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Mejores prácticas',
      paragraphs: ['Siga estas pautas para obtener códigos QR confiables:'],
      bullets: [
        'Pruebe siempre sus códigos QR con varias aplicaciones de escáner antes de imprimirlos.',
        'Utilice la corrección de errores H (alta) al agregar superposiciones.',
        'Mantenga al menos 4 módulos de zona tranquila (margen).',
        'Asegure un alto contraste entre el primer plano y el fondo.',
        'Para imprimir, utilice al menos 300 ppp y pruebe con el tamaño de impresión real.',
        'Habilite Conservar patrones del buscador cuando utilice superposiciones.',
        'Comience con una intensidad de superposición más baja y aumente gradualmente.',
        'Para uso en exteriores, considere tamaños de módulo más grandes y una mayor corrección de errores.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Explorar artículos de aprendizaje', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
      ],
    },
    {
      heading: 'Solución de problemas',
      paragraphs: ['Problemas comunes y soluciones:'],
      bullets: [
        'El QR no escanea: reduzca la intensidad de la superposición, aumente la corrección de errores, verifique el contraste.',
        'Código demasiado grande: reduzca la longitud del contenido, utilice un acortador de URL, versión inferior.',
        'Salida borrosa: aumente el tamaño del módulo, use PNG en lugar de formatos comprimidos.',
        'Los colores se ven mal: verifique el contraste de color, pruebe el modo de superposición en escala de grises.',
        'GIF no animado: asegúrese de utilizar la salida en formato GIF, verifique el recuento de fotogramas.',
        'La superposición de imágenes no se carga: verifique los permisos CORS en imágenes remotas.',
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
        'ANQR admite atajos de teclado estándar. Utilice Ctrl/Cmd+S para activar la exportación (cuando esté enfocado en la vista previa).',
      ],
    },
    {
      heading: 'Compartir e incrustar',
      paragraphs: [
        'En el modo Profesional, haga clic en el botón Compartir para copiar una URL con su configuración actual. Los destinatarios pueden abrir esta URL para ver su configuración exacta. Nota: Las imágenes superpuestas de archivos locales no se pueden compartir a través de URL.',
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
    { href: '/learn?lang=${lang}', label: 'Explorar artículos de aprendizaje', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ver ejemplos de QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Ver ejemplos de QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'abre el generador', type: 'generator' },
  ],
};

export default guide;
