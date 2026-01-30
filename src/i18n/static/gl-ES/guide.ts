import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Guía de usuario de ANQR',
  description: 'Guía completa para usar ANQR para crear códigos QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abre o xerador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explorar artigos para aprender', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ver exemplos de QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Comezando',
      paragraphs: [
        'ANQR é un xerador de códigos QR cun enfoque centrado no cliente. De forma predeterminada, os códigos QR xéranse localmente no teu navegador; non se precisa ningunha conta e os teus datos permanecen privados. Para a incorporación profesional, tamén pode usar a API do servidor.',
        'A interface ten tres niveis de interface: básico, avanzado e profesional. Selecciona o teu nivel usando as pestanas da cabeceira. Cada nivel desbloquea funcións adicionais mentres mantén a interface centrada no que necesitas.',
      ],
      bullets: [
        'Básico: creación sinxela de código QR con contido de texto/URL simple e superposición de imaxes.',
        'Avanzado: opcións de codificación QR, estilos de renderizado, animación, formatos de saída, tipos de contido ampliados e personalización de superposición.',
        'Profesional: marcas de auga, metadatos, uso compartido, análise de seguridade, códigos QR de pago e funcións empresariais.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Abre o xerador', type: 'generator' }],
    },
    {
      heading: 'Inicio rápido',
      paragraphs: ['Para crear o teu primeiro código QR:'],
      bullets: [
        '1. Seleccione un tipo de contido (URL, texto, WiFi, etc.) no menú despregable Tipo de contido.',
        '2. Introduza os seus datos nos campos proporcionados.',
        '3. Opcionalmente, personaliza cores, estilos e engade unha imaxe superposta.',
        '4. Fai clic en Exportar para descargar o teu código QR como PNG, GIF, WebP ou SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Características básicas',
      paragraphs: [
        'O nivel básico ofrece unha interface simplificada para crear códigos QR con contido de carga útil e superposicións de imaxes. Esta é a forma máis sinxela de comezar.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tipos de contido (básico)',
      paragraphs: [
        'Texto simple: codifica calquera texto ata o límite de capacidade do código QR. Ideal para mensaxes curtas, códigos ou identificadores.',
        'URL: codifica enderezos web. O código QR abrirá o URL cando se escanee. Admite protocolos http:// e https://.',
      ],
    },
    {
      heading: 'Superposición de imaxes (básico)',
      paragraphs: [
        'Carga unha imaxe (JPG, PNG, GIF, WebP) para combinar co teu código QR. As características básicas de superposición inclúen:',
      ],
      bullets: [
        'Cargar desde ficheiro: selecciona unha imaxe do teu dispositivo.',
        'Cargar desde o URL: introduza un URL de imaxe (debe permitir CORS).',
        'Logotipo do centro: coloca a imaxe no centro, baseándose na corrección de erros.',
        'Mestura: mestura alfa sinxela de imaxe con patrón QR.',
        'Intensidade: controla a forza que afecta a superposición ao código QR (0-100%).',
        'Modo de cor: a toda cor, escala de grises ou branco e negro.',
        'Conserva os patróns do buscador: mantén os patróns de esquina sen modificar para unha dixitalización fiable.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Funcións avanzadas',
      paragraphs: [
        'O nivel avanzado desbloquea opcións de codificación QR, estilos de renderizado, animación, formatos de saída, tipos de contido estendidos e personalización avanzada de superposición.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Configuración de codificación QR',
      paragraphs: [
        'Versión: os códigos QR veñen nas versións 1-40, e as versións superiores conteñen máis datos pero son máis grandes. Establece a 0 (Automático) para que ANQR elixa a versión máis pequena que se adapte ao teu contido.',
        'Corrección de erros: determina cantos danos pode sufrir un código QR mentres segue sendo escaneable.',
      ],
      bullets: [
        'L (Baixa): 7% de corrección de erros: tamaño máis pequeno, menor redundancia.',
        'M (Medio): 15% de corrección de erros - opción equilibrada.',
        'Q (cuartil): corrección de erros do 25 % - boa para códigos impresos.',
        'H (Alto): corrección de erros do 30 %: mellor para códigos con superposicións ou en condicións difíciles.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zona tranquila (marxe)',
      paragraphs: [
        'A zona tranquila é o espazo en branco que rodea o código QR. Os escáneres necesitan esta marxe para detectar onde comeza o código. A norma recomenda polo menos 4 módulos. Reducir por debaixo de 4 pode causar problemas de dixitalización.',
      ],
    },
    {
      heading: 'Estilo do módulo',
      paragraphs: [
        'Os módulos son os cadrados individuais que forman un código QR. ANQR ofrece cinco estilos:',
      ],
      bullets: [
        'Cadrado: aspecto QR clásico con esquinas afiadas.',
        'Redondeado: cantos suavizados para un aspecto máis agradable.',
        'Puntos: Módulos circulares para unha estética moderna.',
        'Diamante: cadrados xirados 45° para un patrón distintivo.',
        'Conectado: os módulos únense cando están adxacentes, creando formas orgánicas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Estilo de patrón do buscador',
      paragraphs: [
        'Os patróns do buscador son os tres cadrados grandes nas esquinas QR que axudan aos escáneres a orientar o código. Estilos dispoñibles:',
      ],
      bullets: [
        'Cadrado: esquinas cadradas estándar.',
        'Redondeado: esquinas suavizadas que coinciden co estilo do módulo redondeado.',
        'Círculo: patróns de buscador circular para códigos de estilo de puntos.',
      ],
    },
    {
      heading: 'Patróns de aliñación e tempo',
      paragraphs: [
        'Os patróns de aliñamento aparecen en códigos QR máis grandes (versión 2+) para axudar a corrixir a distorsión. Os patróns de tempo son as liñas alternas que conectan os patróns do buscador.',
      ],
      bullets: [
        'Estilo de aliñamento: Buscador de coincidencias, cadrado, redondeado ou círculo.',
        'Estilo de temporización: Módulo de coincidencia, sólido ou discontinuo.',
      ],
    },
    {
      heading: 'Cores',
      paragraphs: [
        'Primeiro plano: a cor dos módulos QR. O negro (#000000) é estándar pero calquera cor escura funciona.',
        'Fondo: a cor de fondo. O branco (#ffffff) é estándar. Garantir un contraste suficiente co primeiro plano.',
        'Fondo transparente: elimina o fondo por completo para usalo en superficies de cores. Asegúrese de que a superficie proporciona un contraste adecuado.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tamaño e espazo do módulo',
      paragraphs: [
        'Tamaño do módulo: controla o tamaño de cada módulo en píxeles. Os valores máis grandes crean códigos máis grandes e máis fáciles de escanear.',
        'Module Gap: engade espazo entre módulos como porcentaxe. As pequenas lagoas (5-15%) poden mellorar a escaneable nalgunhas condicións, pero as lagoas excesivas reducen a fiabilidade.',
      ],
    },
    {
      heading: 'Configuración de saída',
      paragraphs: ['Formato: escolla o seu formato de exportación en función do caso de uso.'],
      bullets: [
        'PNG: formato ráster sen perdas, ideal para a maioría dos usos. O mellor para impresión e dixital.',
        'WebP: formato moderno con tamaños de ficheiro máis pequenos. Bo para uso web.',
        'GIF: necesario para códigos QR animados. Admite a transparencia.',
        'SVG: formato vectorial que escala infinitamente. O mellor para letras grandes ou cando necesites editar o código.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Dimensións de saída',
      paragraphs: [
        'Ancho/Alto: define o tamaño de saída en píxeles. Para imprimir, calcule en base a DPI (por exemplo, 300 DPI a 1 polgada = 300px). Os tamaños maiores escanean de forma máis fiable a distancia.',
      ],
    },
    {
      heading: 'Configuración de animación (avanzado)',
      paragraphs: ['Controla o comportamento do código QR animado:'],
      bullets: [
        'Velocidade: velocidade de fotogramas da animación en milisegundos.',
        'Loop: animación continua ou de reprodución única.',
        'Bounce: dirección de animación de ping-pong.',
        'Fotograma de inicio: comeza a animación desde un marco específico.',
        'Fotogramas máximos: limita o total de fotogramas na animación.',
        'Paso de fotograma: saltar fotogramas para unha animación máis rápida.',
        'Interpolación: None, Crossfade ou Morph entre fotogramas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tipos de contido (avanzado)',
      paragraphs: ['O nivel avanzado desbloquea formatos adicionais de carga útil:'],
      bullets: [
        'Número de teléfono (tel:): crea unha ligazón telefónica á que se pode chamar.',
        'Correo electrónico (mailto:): abre o cliente de correo electrónico co asunto e o corpo opcionais.',
        'SMS: mensaxe de texto precargada a un número de teléfono.',
        'vCard: tarxeta de contacto completa con nome, organización, teléfono, correo electrónico, enderezo.',
        'MeCard: formato de contacto compacto popular en Xapón.',
        'BizCard: formato de tarxeta de visita herdado.',
        'Localización xeográfica: coordenadas GPS que se abren nos mapas.',
        'WiFi: credenciais de rede para conexión automática (SSID, contrasinal, tipo de seguridade).',
        'Evento do calendario: formato iCalendar con título, localización, data/hora.',
        'RSVP do evento: ligazón á páxina de rexistro do evento.',
        'Subscribirse ao calendario: subscríbase a unha fonte de ICS/WebCal.',
        'URL do ficheiro/documento: ligazón directa a ficheiros descargables.',
        'Ligazón de almacenamento na nube: ligazóns a Google Drive, Dropbox, OneDrive, etc.',
        'Perfil social: ligazóns a LinkedIn, Twitter, Instagram, etc.',
        'Ligazón de mensaxería: WhatsApp, Telegram, ligazóns profundas de sinal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Funcións avanzadas de superposición',
      paragraphs: ['Capacidades adicionais de superposición:'],
      bullets: [
        'Recortar: activa o recorte para seleccionar unha rexión cadrada da túa imaxe.',
        'Semitono: patrón de puntos de estilo impreso clásico baseado no brillo da imaxe.',
        'Tramado: difusión de erros para unha reprodución detallada.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Modos de mestura de superposición (avanzado)',
      paragraphs: ['Modos de mestura adicionais no nivel avanzado:'],
      bullets: [
        'Subpíxel: Divide cada módulo en subpíxeles para obter máis detalles.',
        'Ruído azul: usa dithering de ruído azul para patróns sen artefactos.',
        'Mosaico: efecto baseado en mosaicos que preserva a estrutura da imaxe.',
        'Gap Fill: coloca a imaxe en ocos entre módulos.',
        'Brillo: varía o tamaño do módulo en función do brillo da imaxe.',
        'Duotono: asigna a imaxe a dúas cores para un contraste sorprendente.',
      ],
    },
    {
      heading: 'Intensidade de superposición',
      paragraphs: [
        'Controla a forza que afecta a superposición ao código QR (0-100%). Os valores máis altos mostran máis detalles da imaxe, pero poden reducir a escaneable. Comeza ao redor do 70 % e axusta en función das probas.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Modo de cor',
      paragraphs: ['Como se procesa a imaxe de superposición:'],
      bullets: [
        'A toda cor: conserva as cores orixinais da imaxe.',
        'Escala de grises: convértese en tons branco e negro.',
        'Branco e negro: conversión binaria de alto contraste.',
      ],
    },
    {
      heading: 'Conserva os patróns do buscador',
      paragraphs: [
        'Cando está activado, mantén os tres patróns do buscador de esquinas sen modificar pola superposición. Recomendado encarecidamente para dixitalización fiable.',
      ],
    },
    {
      heading: 'Preprocesamento de imaxes',
      paragraphs: [
        'Aplica filtros á túa imaxe de superposición antes de mesturar. Estes axustes poden mellorar a forma en que aparece a imaxe no código QR final.',
      ],
      bullets: [
        'Brillo (-100 a +100): ilumina ou escurece a imaxe.',
        'Contraste (-100 a +100): aumenta ou diminúe o rango tonal.',
        'Gamma (0,2 a 3,0): axuste de brillo non lineal. Os valores inferiores a 1 aclaran os tons medios, os valores superiores a 1 oscurecen.',
        'Saturación (-100 a +100): intensidade da cor. -100 é escala de grises, +100 é sobresaturado.',
        'Xirar tonalidade (0-360°): cambia todas as cores ao redor da roda de cores.',
        'Desenfoque (0-20px): suaviza os detalles da imaxe.',
        'Afilar (0-100%): mellora os bordos e os detalles.',
        'Posterizar (0-16 niveis): reduce os niveis de cor para obter un efecto póster.',
        'Limiar (0-255): converte en branco/negro binario no punto de corte.',
        'Detección de bordes: algoritmos Sobel ou Canny para mostrar só bordos.',
        'Inverter: inverte todas as cores.',
      ],
    },
    {
      heading: 'Modo de axuste',
      paragraphs: ['Como se adapta a imaxe superposta á área do código QR:'],
      bullets: [
        'Portada: a imaxe enche toda a área, recortando se é necesario.',
        'Conter: imaxe completa visible, pode ter marxes.',
        'Estirar: a imaxe distorsiona para encher exactamente.',
      ],
    },
    {
      heading: 'Opcións de transformación',
      paragraphs: [
        'Rotación: xira a superposición en incrementos de 90°.',
        'Xire X/Y: reflicte a imaxe horizontal ou verticalmente.',
      ],
    },
    {
      heading: 'Algoritmos de dithering',
      paragraphs: [
        'O tramado converte imaxes de tons continuos en patróns que os códigos QR poden representar. Dispoñible cando se usan os modos de mestura Dithered, Blue Noise ou True Dither.',
      ],
      bullets: [
        'Difusión de erros: estilo clásico de Floyd-Steinberg. Estende o erro de cuantificación aos píxeles veciños.',
        'Ordenado (Bayer): usa unha matriz de limiar para patróns regulares.',
        'Punto agrupado: simula a impresión de medios tonos.',
        'Void & Cluster: tramado ordenado optimizado.',
        'Blue Noise: patrón de aspecto aleatorio visualmente agradable.',
        'Limiar de ruído azul: dithering de limiar con textura de ruído azul.',
        'Ruído branco: dithering de limiar aleatorio.',
        'Ruído gaussiano/triangular: ruído con diferentes distribucións.',
        'Blue Noise + Error Diffusion: híbrido que combina ambas técnicas.',
        'Ruído azul filtrado: patrón de ruído azul similar a pantalla.',
        'Perceptual: ponderado en luminancia para mellores resultados visuais.',
        'Edge-Aware: conserva os bordos da imaxe durante o tramado.',
        'Limiar adaptativo: Limiar adaptativo localmente.',
        'Ruído azul temporal: para os GIF animados, o patrón varía por fotograma.',
      ],
    },
    {
      heading: 'Núcleos de difusión',
      paragraphs: [
        'Cando utilice o tramado de difusión de erros, escolla como se distribúe o erro:',
      ],
      bullets: [
        'Floyd-Steinberg: difusión clásica de 4 veciños. Boa elección xeral.',
        'Jarvis-Judice-Ninke: 12-veciño, máis suave pero máis lento.',
        'Stucki: Similar a JJN con diferentes pesos.',
        'Burkes: JJN simplificado, máis rápido.',
        'Sierra: Familia de núcleos que equilibran calidade e velocidade.',
        'Atkinson: difusión da luz, conserva os detalles pero pode ser granuloso.',
      ],
    },
    {
      heading: 'Dither Strength',
      paragraphs: [
        'Controla a cantidade de tramado que se aplica (0-100%). Os valores máis baixos conservan máis do patrón orixinal, os valores máis altos mostran máis detalles da imaxe.',
      ],
    },
    {
      heading: 'Configuración de subpíxeles',
      paragraphs: ['Cando se usa o modo de mestura de subpíxeles:'],
      bullets: [
        'Tamaño da cuadrícula: 2×2, 3×3 ou 4×4 subpíxeles por módulo. Máis alto = máis detalle.',
        'Regra central: Strict require que o subpíxel central coincida con o módulo. O centro de semitonos permite variación.',
        'Cor neutra: cor usada para subpíxeles indeterminados.',
        'Anulación do buscador: como se representan os patróns do buscador (sólido ou estilizado).',
      ],
    },
    {
      heading: 'Configuración de semitonos',
      paragraphs: ['Cando se usa o modo de mestura de semitonos:'],
      bullets: [
        'Tamaño da cela: por módulo ou cuadrícula N×N.',
        'Forma do punto: círculo, cadrado ou liña.',
        'Curva de brillo: lineal, curva S ou gamma.',
      ],
    },
    {
      heading: 'Cores duotono',
      paragraphs: [
        'Cando use o modo de mestura Duotone, configure a cor de sombra (zonas escuras) e a cor de resaltado (zonas claras).',
      ],
    },
    {
      heading: 'Configuración de animación GIF',
      paragraphs: ['Cando se usan superposicións de GIF animados:'],
      bullets: [
        'Usa atrasos de fotogramas: respecta o tempo orixinal do GIF.',
        'FPS máximo: límite de frecuencia de fotogramas (1-60 fps).',
        'Tratamento da eliminación: respectar ou simplificar os métodos de eliminación do marco.',
      ],
    },
    {
      heading: 'Opcións de renderización avanzadas',
      paragraphs: ['Controis adicionais de renderizado:'],
      bullets: [
        'Modo de espazo: ningún, inserción, trazo ou estilo de espazo negativo.',
        'Raio de cantos: porcentaxe de cantos redondeados para módulos.',
        'Gradiente: gradiente ningún, lineal, radial ou cónico en módulos.',
        'Estilo exterior/interior do ollo: estilo independente para aneis de patrón de buscador.',
        'Rotación de puntos: xira os módulos de diamante/punto.',
        'Escala de ollos: axuste de tamaño para patróns de buscador.',
        'Estilo de marco: engade marcos decorativos (marco redondeado, adhesivo, etiqueta).',
        'Texto do marco: engade texto como "Scan Me!" aos cadros.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Codificación QR avanzada',
      paragraphs: ['Axustar a codificación QR:'],
      bullets: [
        'Modo de codificación: Automático, Numérico, Alfanumérico, Byte/UTF-8 ou Kanji.',
        'Aplicar zona silenciosa mínima: asegúrese de que polo menos 4 módulos de marxe.',
        'Patrón de máscaras: Auto (optimal), ou selecciona manualmente patróns 0-7 para controlar a distribución dos módulos. Diferentes patróns crean diferentes aparencias visuais ao codificar os mesmos datos.',
        'Código de caracteres: ISO-8859-1 (por defecto latino), UTF-8 (completo Unicode incluíndo emoji), ou Shift-JIS (xaponés). Escolla en función das características do seu contido.',
      ],
    },
    {
      heading: 'Opcións de saída avanzadas',
      paragraphs: ['Configuración adicional de exportación:'],
      bullets: [
        'Nome de ficheiro: nome de ficheiro personalizado para descargas.',
        'Tamaño da paleta GIF: 2-256 cores na saída GIF.',
        'Cuantizador de GIF: redución de cor Median Cut, NeuQuant ou Octree.',
        'GIF Dithering: Desactivado, Floyd-Steinberg ou Ordenado.',
        'Cor transparente GIF: define unha cor para que sexa transparente.',
        'SVG True Vector: use camiños en lugar de ráster incrustado.',
        'Precisión de forma SVG: representación de píxel ou ruta precisa.',
        'Superposición de trama incorporada SVG: inclúe a superposición como imaxe incrustada.',
        'Anulación de fondo: forza unha cor de fondo específica na saída.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opcións de validación',
      paragraphs: ['Configuración de procesamento de entrada:'],
      bullets: [
        'Validar entrada: verifique o formato de contido antes de codificar.',
        'Recortar espazos en branco: elimina os espazos principais/finales.',
        'Normalizar novas liñas: converte todos os finais de liña en LF.',
        'Protección de lonxitude máxima: avisa se o contido supera a capacidade QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Características profesionais',
      paragraphs: [
        'O nivel Profesional engade marcas de auga, metadatos, opcións de uso compartido, análise de seguridade, códigos QR de pago e funcións empresariais.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Marca de auga',
      paragraphs: ['Engade marcas de auga aos teus códigos QR:'],
      bullets: [
        'Tipo: marca de auga de texto, imaxe ou patrón.',
        'Posición: Centro, Esquinas, Bordes, Detrás ou Zona tranquila.',
        'Opacidade: transparencia da marca de auga (0-100%).',
        'Modo de mestura: Normal, Multiplicar, Pantalla ou mestura de superposición.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadatos',
      paragraphs: ['Inserir metadatos nos ficheiros exportados:'],
      bullets: [
        'Campos Título, Autor, Copyright, Licenza, Descrición.',
        'Tempo de creación: incrusta a marca de tempo da xeración.',
        'Valor clave personalizado: engade pares de metadatos arbitrarios.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Compartindo',
      paragraphs: ['Comparte as configuracións do teu código QR:'],
      bullets: [
        'Ligazón directa: xera un URL que se pode compartir coa túa configuración actual.',
        'Inserir HTML: obtén código de incrustación para sitios web.',
        'Parámetros de codificación: inclúe todas as configuracións no URL compartido.',
        'Nota: As imaxes superpostas de ficheiros locais non se poden compartir mediante o URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Análise de seguridade',
      paragraphs: ['Asegúrese de que os códigos QR sigan escaneables:'],
      bullets: [
        'Modo de seguridade: requisitos de dixitalización desactivados, equilibrados ou estritos.',
        'Tamaño mínimo do módulo: tamaño mínimo de píxeles por módulo.',
        'Zona tranquila mínima: módulos de marxe mínima.',
        'Bloquear buscadores/temporización/alinear/formato/versión: protexe elementos específicos.',
        'Max Overlay Intensity by ECC: límites de intensidade automáticos baseados no nivel de corrección de erros.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tipos de contido (profesional)',
      paragraphs: ['O nivel profesional engade tipos de contido empresarial e de pago:'],
      bullets: [
        'EPC/SEPA (UE): Códigos QR de transferencia bancaria europea con IBAN, BIC, importe, referencia.',
        'UPI (India): interface de pagos unificados con VPA, nome do beneficiario, cantidade.',
        'PayNow (Singapur): pago rápido de Singapur con UEN ou número de móbil.',
        'PromptPay (Tailandia): sistema de pago nacional tailandés.',
        'PIX (Brasil): pago instantáneo brasileiro con clave PIX.',
        'Crypto: enderezos de pago de Bitcoin, Ethereum, Litecoin con cantidade opcional.',
        'Ligazón á campaña de marketing: URL con seguimento completo do parámetro UTM (etiquetas de mercadotecnia).',
        'Ligazón curta: para usar con acurtadores de URL para códigos QR dinámicos ou rastreables.',
        'GS1 Digital Link: identificación do produto con GTIN, serie, lote, caducidade.',
        'Ligazón profunda da aplicación: ligazóns profundas da aplicación iOS/Android con esquemas personalizados.',
        'Formato personalizado: datos en bruto sen formato nin validación.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Pagos relevantes para o idioma no modo avanzado',
      paragraphs: [
        'Ao usar o modo avanzado, ANQR mostra automaticamente os métodos de pago relevantes para o idioma seleccionado. Por exemplo, os usuarios vietnamitas ven VietQR, os tailandeses ven PromptPay e os de lingua india ven UPI e BharatQR. Os métodos de pago globais (criptomoeda, PayPal, aplicación Cash) están dispoñibles en todos os idiomas. O modo profesional desbloquea todos os estándares de pago independentemente do idioma.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Normas europeas de pagamento',
      bullets: [
        'EPC/SEPA (UE): códigos QR de transferencia bancaria europea seguindo o estándar de códigos QR EPC. Admite IBAN, BIC (opcional para nacional), importe en EUR e referencias de pago estruturadas ou non estruturadas. Usado en toda a zona SEPA, incluídos os países da UE máis Suíza, Noruega, Islandia, Liechtenstein, Mónaco e San Marino.',
        'Swiss QR-factura: estándar de pago suízo seguindo as directrices de implementación de SIX. Admite CHF e EUR, referencia QR (QRR), referencia do acredor (ISO 11649), enderezos estruturados de acredores/debedores e información de facturas. Obrigatorio para as facturas suízas desde 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Estándares de pagamento indios',
      bullets: [
        'UPI (India): interface de pagos unificadas seguindo a especificación de ligazón profunda NPCI. Admite VPA (enderezo de pago virtual), nome do beneficiario, cantidade en INR, nota de transacción, ID de referencia, código de categoría de comerciante e modo de transacción.',
        'BharatQR (India): estándar QR unificado que admite pagos con UPI e con tarxeta. Combina UPI VPA con tarxeta PAN para a máxima compatibilidade. Inclúe o nome do comerciante, a cidade, o MCC, os detalles do GST e os números de factura/referencia.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Estándares de pago do sueste asiático',
      bullets: [
        'PayNow (Singapur): sistema de pago rápido de Singapur que utiliza a especificación QR de EMVCo con perfil SGQR. Admite UEN (rexistro comercial), número de móbil ou NRIC como identificadores de proxy. Inclúe a marca de editabilidade da cantidade e a data de caducidade.',
        'PromptPay (Tailandia): sistema de pago nacional tailandés seguindo o perfil EMV do Banco de Tailandia. Admite número de móbil, identificación nacional, identificación fiscal, identificación de carteira electrónica e pago de facturas con varios campos de referencia.',
        'QRIS (Indonesia): código de resposta rápida estándar indonesio. Estándar nacional de pago baseado en EMV que admite o ID do comerciante, o NMID (ID do comerciante nacional), a clasificación dos criterios do comerciante e as tarifas de conveniencia (fixas ou porcentuais).',
        'DuitNow (Malaisia): sistema de pago instantáneo de Malaisia. Admite varios tipos de proxy, incluíndo NRIC, móbil, pasaporte, identificación do exército e números de rexistro de empresas.',
        'VietQR (Vietnam): estándar de transferencias interbancarias vietnamitas. Require BIN bancario (identificación NAPAS) e número de conta. Admite varios códigos de servizo para diferentes tipos de transferencia (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipinas): estándar de pago QR filipino para InstaPay e PESONet. Usa números de conta con identificación de comerciante para transaccións P2M (persoa a comerciante).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Estándares de pagamento de Asia Oriental',
      bullets: [
        'TWQR (Taiwán): estándar de pago QR taiwanés. Admite cantidades de identificación de comerciante, identificación fiscal e TWD.',
        'HKQR/FPS (Hong Kong): códigos QR do sistema de pago máis rápido de Hong Kong. Admite ID de FPS, número de móbil ou correo electrónico como identificadores de pago. Cantidades en HKD.',
        'JPQR (Xapón): estándar de pago de código QR unificado xaponés. Usa o ID da tenda para a identificación do comerciante con cantidades en JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Outras normas de pagamento rexionais',
      bullets: [
        'PIX (Brasil): sistema de pago instantáneo do Banco Central do Brasil seguindo a especificación do código BR. Admite claves PIX (CPF, CNPJ, correo electrónico, teléfono ou clave aleatoria), nome/cidade do comerciante, ID de transacción e cantidades de BRL.',
        'AusPayNet/NPP PayID (Australia): sistema Australian New Payments Platform PayID. Admite tipos de PayID (correo electrónico, móbil, ABN, ID de organización) ou BSB + número de conta tradicional. O nome do comerciante é opcional xa que os pagadores ven o nome rexistrado na busca de NPP.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pagos de criptomonedas',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): URI de pago estándar de criptomoneda con enderezo de carteira, cantidade opcional e etiqueta. Compatible con todas as carteiras principais de Bitcoin e Litecoin.',
        'Lightning Network (BOLT11): facturas de pago de Lightning Network. Pega unha cadea de factura codificada BOLT11 para pagos instantáneos de Bitcoin con tarifas mínimas.',
        'Ethereum (EIP-681): URI de solicitude de transacción de Ethereum que admiten transferencias ETH nativas e transferencias de tokens ERC-20. Inclúe ID de cadea para compatibilidade con varias redes (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parámetros de gas e chamadas de funcións de contrato.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Servizos de enlace de pago',
      bullets: [
        'PayPal.Me: ligazóns de pago de PayPal con nome de usuario e cantidade precargada opcional. Os destinatarios poden pagar mediante o saldo de PayPal, tarxetas ou contas bancarias.',
        'Aplicación Cash: ligazóns de pago da aplicación Cash usando $cashtag cun importe opcional. Popular nos Estados Unidos para pagos peer-to-peer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR EMV xenérico',
      bullets: [
        'Genérico EMV: crea códigos QR personalizados do modo presentado polo comerciante EMV para esquemas de pago que non se indican especificamente. Configure o nome do comerciante, a cidade, o código de país (ISO 3166-1), o código de moeda (ISO 4217 numérico), o MCC, as opcións de tarifas de propina/como conveniencia e campos de datos adicionais. Útil para probas ou integracións personalizadas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Modos de mestura de superposición (profesional)',
      paragraphs: ['Modos de mestura adicionais no nivel profesional:'],
      bullets: [
        'Pixelado: efecto de superposición pixelado.',
        'Esquema: superposición de detección de bordos que mostra só contornos.',
        'Onda: efecto de distorsión ondulado.',
        'Tamaño do subpíxel: tamaño variable do subpíxel en función da imaxe.',
        'True Dither: tramado avanzado con selección de matriz ordenada.',
        'Extrema: visibilidade máxima da imaxe, pode afectar á escanebilidade.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Configuración de protección',
      paragraphs: [
        'Control detallado sobre cales elementos QR están protexidos da modificación de superposición:',
      ],
      bullets: [
        'Conservar o tempo: mantén os patróns de tempo sen modificar.',
        'Conservar o aliñamento: mantén os patróns de aliñamento sen modificar.',
        'Protexer a información de formato: protexe os módulos de información de formato.',
        'Protexer a información da versión: protexe os módulos de información da versión.',
      ],
    },
    {
      heading: 'Modo ECC-Aware',
      paragraphs: [
        'Distribúe de forma intelixente a intensidade de superposición en función da capacidade de corrección de erros. O sistema analiza que módulos se poden modificar mantendo a escaneable.',
      ],
      bullets: [
        'Orzamento de risco: Porcentaxe de capacidade de corrección de erros a utilizar (0-100%).',
        'Orzamento máis alto = superposición máis visible pero escaneable máis arriscada.',
        'Menor orzamento = dixitalización máis segura pero superposición menos visible.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opcións de representación profesional',
      paragraphs: ['Controis de renderización avanzados:'],
      bullets: [
        'Bordes nítidos: use a representación de imaxes pixeladas para os bordos nítidos do módulo.',
        'Pixel Snap: aliñación de píxeles de piso, redondo ou teito.',
        'Modo de cor por módulo: sólido, por brillo, por posición, por superposición, por clúster.',
        'Paleta de cores: define unha paleta de cores personalizada para a cor por módulo.',
        'Protección de contraste: garantice a relación de contraste mínima entre as cores.',
        'Relación de contraste mínima: requisito de contraste estilo WCAG (1:1 a 21:1).',
        'Módulos de borde extra: borde adicional máis aló da zona tranquila.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opcións de saída profesional',
      paragraphs: ['Configuración de exportación empresarial:'],
      bullets: [
        'DPI: Definir resolución de impresión (72-600 DPI). 300 DPI recomendado para impresión.',
        'Incluír zona silenciosa: alterna a zona silenciosa nas dimensións de saída.',
        'Exportar como adicional: xera PDF xunto co formato principal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Configuración de animación (profesional)',
      paragraphs: ['Funcións adicionais de animación profesional:'],
      bullets: [
        'Tramado temporal: desactivado, ruído azul ou parpadeo seguro por fotograma.',
        'Patrón: efectos Ningún, Pulso, Onda, Scanline, Shimmer ou Deriva.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Referencia da API',
      paragraphs: [
        'ANQR ofrece unha API do servidor para xerar códigos QR mediante parámetros URL. Isto é ideal para inserir códigos QR en sitios web, correos electrónicos, documentos ou fluxos de traballo automatizados sen JavaScript do lado do cliente.',
        'URL base: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Ver exemplos de QR', type: 'example' }],
    },
    {
      heading: 'Parámetros básicos',
      paragraphs: [
        'Parámetros obrigatorios e comúns (os nomes dos parámetros non están traducidos):',
      ],
      bullets: [
        'datos (obrigatorio): o contido a codificar no código QR. Caracteres especiais de codificación URL.',
        'tamaño: tamaño da imaxe en píxeles (predeterminado: 400, máximo: 2000). Úsase se non se especifica.',
        'w, h: ancho e alto de saída en píxeles. Anula o parámetro de tamaño.',
        'formato: formato de saída: png, webp ou gif (predeterminado: png).',
        'ec: Nivel de corrección de erros - L, M, Q ou H (predeterminado: H).',
        'fg: cor do primeiro plano como hexadecimal sen # (predeterminado: 000000).',
        'bg: cor de fondo como hexadecimal sen # (predeterminado: ffffff).',
        'transparente: Establécese en 1 para o fondo transparente.',
        'marxe: Zona tranquila en módulos (predeterminado: 4).',
      ],
    },
    {
      heading: 'Parámetros de estilo',
      paragraphs: ['Módulo e estilo de patrón:'],
      bullets: [
        'estilo: estilo de módulo: cadrado, redondeado, puntos, rombo, conectado.',
        'finder: estilo de patrón Finder: cadrado, redondeado, círculo.',
        'aliñar: estilo de patrón de aliñamento: match_finder, cadrado, redondeado, círculo.',
        'timing: estilo de patrón de temporización: match_module, sólido, discontinuo.',
        'raio: porcentaxe de raio de esquina 0-100.',
        'gap: porcentaxe de desfase do módulo 0-50.',
        'gapMode: modo Gap: ningún, inserto, trazo, espazo_negativo.',
        'eyeOuter, eyeInner: estilos de ollos: cadrado, redondeado, círculo.',
        'eyeScale: porcentaxe de escala de ollos (predeterminado: 100).',
        'grad: tipo de gradiente - ningún, lineal, radial, cónico.',
        'gradAngle: ángulo de gradiente para gradientes lineais.',
        'gradStops: o degradado detén como color1,pos1,color2,pos2,... (por exemplo, ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Parámetros de superposición',
      paragraphs: [
        'Opcións de superposición de imaxes (a imaxe de superposición obtense do lado do servidor):',
      ],
      bullets: [
        'img: URL para superpoñer a imaxe (debe ser de acceso público).',
        'modo: modo de superposición: centro, semitono, mestura, brillo, mosaico, difuminado, ruído azul, subpíxel.',
        'intensidade: intensidade de superposición 0-100 (por defecto: 100).',
        'colorMode: modo de cor de superposición: cor, escala de grises, bw.',
        'encaixar: como encaixa a superposición: cubrir, conter, estirar.',
        'podremia: Superposición de rotación en graos.',
        'flipX, flipY: Establécese en 1 para voltear a superposición.',
        'keepFinders: conserva os patróns do buscador (predeterminado: 1).',
        'keepTiming, keepAlign: Establécese en 1 para preservar os patróns de sincronización/alineación.',
      ],
    },
    {
      heading: 'Parámetros de preprocesamento',
      paragraphs: ['Preprocesamento de imaxe aplicado á superposición:'],
      bullets: [
        'brillo: Axuste -100 a 100 (predeterminado: 0).',
        'contraste: Axuste -100 a 100 (predeterminado: 0).',
        'gamma: Valor de 0,1 a 3 (predeterminado: 1).',
        'saturación: Axuste -100 a 100 (predeterminado: 0).',
        'matiz: rotación da tonalidade en graos.',
        'desenfoque: desenfoque en píxeles.',
        'afiar: cantidade de afiar 0-100.',
        'posterizar: posterizar niveis.',
        'limiar: limiar binario 0-255.',
        'edge: detección de bordes - off, sobel, canny.',
        'inverter: Establécese en 1 para inverter as cores.',
      ],
    },
    {
      heading: 'Parámetros da marca de auga',
      paragraphs: ['Engade marcas de auga aos códigos QR xerados:'],
      bullets: [
        'wmEn: Establécese en 1 para activar a marca de auga.',
        'wmKind: tipo de marca de auga: texto, imaxe, patrón.',
        'wmText: texto de marca de auga (codificado por URL).',
        'wmImg: URL para a imaxe da marca de auga.',
        'wmPos: Posición: centro, esquinas, bordos, detrás, zona_tranquila.',
        'wmOpacity: Opacidade 0-100 (predeterminado: 50).',
        'wmBlend: Modo de mestura: normal, multiplicar, pantalla, superposición.',
      ],
    },
    {
      heading: 'Parámetros de animación',
      paragraphs: ['Para a saída GIF animada (require formato=gif):'],
      bullets: [
        'animPattern: patrón de animación: none, pulso, wave, scanline, shimmer, drift, color_cycle.',
        'animFrames: número de fotogramas 1-60 (predeterminado: 24).',
        'animSpeed: atraso de fotogramas en milisegundos 10-1000 (predeterminado: 100).',
        'animSeed: semente aleatoria para animación.',
        'easing: animación easing - lineal, ease_in, ease_out, ease_in_out, rebote.',
      ],
    },
    {
      heading: 'Parámetros de saída',
      paragraphs: ['Opcións de formato de saída:'],
      bullets: [
        'calidade: calidade WebP 0-1 (predeterminado: 0,9).',
        'webpQ: calidade WebP 0-100 (predeterminado: 90).',
        'gifColors: tamaño da paleta GIF 2-256 (predeterminado: 256).',
        'dpi: DPI de saída para PNG (predeterminado: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: campos de metadatos PNG.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Parámetros de recorte',
      paragraphs: ['Opcións de recorte de imaxe de superposición:'],
      bullets: [
        'cropEn: Activa o recorte de superposición 0/1 (predeterminado: 0).',
        'cropX: corta o centro X como fracción 0-1 (predeterminado: 0,5).',
        'cropY: Centro de cultivo Y como fracción 0-1 (por defecto: 0,5).',
        'cropSize: recorta o tamaño como fracción da imaxe 0-1 (predeterminado: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Parámetros de bloqueo de seguridade',
      paragraphs: ['Controla que elementos QR están protexidos da modificación de superposición:'],
      bullets: [
        'lockF: bloquear patróns de buscador 0/1 (predeterminado: 1).',
        'lockT: bloqueo de patróns de temporización 0/1 (predeterminado: 1).',
        'lockA: bloqueo de patróns de aliñamento 0/1 (predeterminado: 1).',
        'lockFmt: información de formato de bloqueo 0/1 (predeterminado: 1).',
        'lockV: bloqueo da información da versión 0/1 (predeterminado: 1).',
        'safeMode: Modo de seguridade: desactivado, equilibrado, estrito (predeterminado: desactivado).',
        'safeMinPx: tamaño mínimo do módulo en píxeles (predeterminado: 2).',
        'safeMinQz: Módulos mínimos de zona silenciosa (predeterminado: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parámetros de autoajuste',
      paragraphs: ['Configuración de optimización automática:'],
      bullets: [
        'autoVer: selección automática de QR versión 0/1 (predeterminado: 1).',
        'autoEcc: selección automática de nivel ECC 0/1 (predeterminado: 0) - só unha suxestión do lado do servidor.',
        'autoReduce: [SÓ CLIENTE] Reduce automaticamente a intensidade ata que se poida escanear: require un bucle de validación de exploración.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Parámetros adicionais de animación',
      paragraphs: ['Controis de animación estendidos para a saída GIF:'],
      bullets: [
        'bucle: bucles de animación continuamente 0/1 (predeterminado: 1).',
        'rebote: dirección de animación de ping-pong 0/1 (predeterminado: 0).',
        'reverse: reproduce a animación ao revés 0/1 (predeterminado: 0).',
        'colorCycle: activa o efecto de ciclo de cores 0/1 (predeterminado: 0).',
        'interp: interpolación de fotogramas: none, crossfade, morph (predeterminado: none).',
        'tempDither: dithering temporal: desactivado, blue_noise, flicker_safe (predeterminado: desactivado).',
        'startF: marco de inicio da animación (predeterminado: 0).',
        'maxF: fotogramas máximos para renderizar (predeterminado: 0 = automático).',
        'stepF: intervalo de pasos de fotograma (predeterminado: 1).',
        'jitter: [SÓ CLIENTE] Tremulo do módulo en píxeles - require rexeneración de QR por fotograma.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Parámetros de tramado',
      paragraphs: ['Controle os algoritmos de tramado para o procesamento de superposición:'],
      bullets: [
        'ditherKind: algoritmo de dither - error_diffusion, ordered_bayer, blue_noise, etc (predeterminado: ordered_bayer).',
        'diffusionKernel: kernel de difusión de erro - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (predeterminado: floyd_steinberg).',
        'ditherStrength: intensidade de dither 0-100 (predeterminado: 50).',
        'serpentina: dithering en serpentina 0/1 (predeterminado: 0).',
        'matriz: matriz de tramado ordenada: bayer2, bayer4, bayer8 (predeterminado: bayer4).',
        'bnTile: tamaño de mosaico de ruído azul (predeterminado: 64).',
        'bnSeed: semente aleatoria de ruído azul (predeterminado: 0).',
        'colorDither: difuminación de cores: ningunha, por_canle, perceptiva (predeterminada: ningunha).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Parámetros de subpíxeles',
      paragraphs: ['Configuración para o modo de mestura de subpíxeles:'],
      bullets: [
        'spGrid: tamaño da cuadrícula de subpíxeles: 2x2, 3x3, 4x4 (predeterminado: 3x3).',
        'spCenter: regra central - estrita, semitono_centro (predeterminado: estrita).',
        'spNeutral: hexadecimal de cor neutra sen # (predeterminado: 808080).',
        'spFinder: Anulación do Finder - sólido, estilizado (predeterminado: sólido).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Parámetros de semitono',
      paragraphs: ['Configuración para o modo de mestura de medios tons:'],
      bullets: [
        'htCell: tamaño da cela de semitonos - por_módulo ou cuadrícula nxn (predeterminado: por_módulo).',
        'htDot: forma de punto: círculo, cadrado, liña (predeterminado: círculo).',
        'htCurve: Curva de brillo - lineal, curva s, gamma (predeterminado: lineal).',
        'duo1: hexadecimal de cor de sombra duotono sen # (predeterminado: 000000).',
        'duo2: hexadecimal de cor de resaltado duotono sen # (predeterminado: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parámetros do modo ECC-Aware',
      paragraphs: [
        'Distribución de superposición intelixente baseada na capacidade de corrección de erros:',
      ],
      bullets: [
        'eccAware: habilite o modo ECC-aware 0/1 (predeterminado: 0).',
        'eccRisk: porcentaxe do orzamento de risco 0-100 (por defecto: 50).',
        'eccMap: mapa de peso - distance_to_finders, block_heatmap, empirical_scan_heatmap (predeterminado: distance_to_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Parámetros do cadro',
      paragraphs: ['Configuración do marco decorativo:'],
      bullets: [
        'marco: estilo de marco: ningún, marco_redondeado, adhesivo, etiqueta (predeterminado: ningún).',
        'frameText: texto para mostrar no marco (URL codificado).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parámetros de cor por módulo',
      paragraphs: ['Opcións de cor do módulo individual:'],
      bullets: [
        'modColor: modo de cor: sólido, por_brillo, por_posición, por_superposición, por_cluster (predeterminado: sólido).',
        'cGuard: protección de contraste 0/1 (predeterminado: 0).',
        'minContrast: relación de contraste mínima 1-21 (predeterminado: 4,5).',
        'paleta: cores hexadecimales separadas por comas para o modo de paleta.',
        'paletteMode: distribución da paleta: posición, brillo, diagonal, radial, aleatorio, fila, columna (predeterminado: posición).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parámetros de superposición GIF',
      paragraphs: ['Configuración para imaxes de superposición GIF animadas:'],
      bullets: [
        'ovType: tipo de superposición: estático, gif, apng, webp_anim, vídeo (predeterminado: estático).',
        'ovFramePick: selección de fotogramas - all, every_n, max_frames, duration_limit (predeterminado: todos).',
        'gifDelays: use atrasos de fotogramas GIF orixinais 0/1 (predeterminado: 1).',
        'gifDispH: xestión de eliminación de GIF - respectar, simplificar (predeterminado: respectar).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Límites de intensidade por ECC',
      paragraphs: ['Intensidade máxima de superposición por nivel de corrección de erros:'],
      bullets: [
        'maxIntL: intensidade máxima para ECC L 0-100 (predeterminado: 100).',
        'maxIntM: intensidade máxima para ECC M 0-100 (predeterminado: 100).',
        'maxIntQ: intensidade máxima para ECC Q 0-100 (predeterminado: 100).',
        'maxIntH: intensidade máxima para ECC H 0-100 (predeterminado: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parámetros de simulación de control de calidade (só para o cliente)',
      paragraphs: [
        'Estes parámetros analízanse para a compatibilidade de URL, pero só funcionan no navegador:',
      ],
      bullets: [
        'qaContrast: activa a comprobación de contraste 0/1 - require validación interactiva.',
        'qaBlur: simula o desenfoque en píxeles, só para probas interactivas.',
        'qaNoise: simula o nivel de ruído, só para probas interactivas.',
        'qaHeatmap: Mostra o mapa de calor de lexibilidade 0/1: require a interface de usuario de superposición de lenzo.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Parámetros só para o cliente',
      paragraphs: [
        'A maioría dos parámetros da API son totalmente compatibles no servidor. Os parámetros marcados como [SÓ CLIENTE] analízanse para a compatibilidade de URL, pero requiren funcións do navegador:',
      ],
      bullets: [
        'jitter: o jitter do módulo require a rexeneración de QR por fotograma con aleatoriedade.',
        'autoReduce: a intensidade de redución automática require probas de exploración iterativas.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: a simulación de control de calidade require a validación do lenzo interactivo.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Parámetros adicionais de saída',
      paragraphs: ['Configuración ampliada de saída e exportación:'],
      bullets: [
        'fname: nome de ficheiro personalizado para descargas (predeterminado: anqr-qrcode).',
        'inclQz: inclúe a zona tranquila nas dimensións de saída 0/1 (predeterminado: 1).',
        'bgOver: a cor de fondo anula hexadecimal sen # (anulla o parámetro bg).',
        'fmtExtra: saída de formato adicional: none, eps, animated_webp (predeterminado: none). Nota: o eps é [PARCIAL].',
        'svgPrec: precisión de forma SVG - píxel, preciso (predeterminado: píxel). [PARCIAL] Saída SVG limitada no lado do servidor.',
        'svgEmbed: incrusta a superposición de trama en SVG 0/1 (predeterminado: 1). [PARCIAL] Saída SVG limitada no lado do servidor.',
        'modulePx: tamaño de píxel do módulo (predeterminado: cálculo automático a partir do tamaño).',
        'border: módulos de borde extra máis aló da zona tranquila (predeterminado: 0).',
        'nítido: activa a representación de imaxe nítida/pixelada 0/1 (predeterminado: 1).',
        'snap: modo Pixel snap - chan, redondo, teito (predeterminado: chan).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parámetros de preservación de patróns',
      paragraphs: ['Controle que elementos estruturais están protexidos da superposición:'],
      bullets: [
        'keepFinders: conserva os patróns do buscador 0/1 (predeterminado: 1).',
        'keepTiming: conserva os patróns de temporización 0/1 (predeterminado: 0).',
        'keepAlign: conserva os patróns de aliñamento 0/1 (predeterminado: 0).',
        'protectFmt: protexe os módulos de información de formato 0/1 (predeterminado: 0).',
        'protectVer: protexe os módulos de información da versión 0/1 (predeterminado: 0).',
      ],
    },
    {
      heading: 'Exemplo de uso',
      paragraphs: [
        'Código QR básico:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Código QR con estilo con cores personalizadas:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'Código QR con imaxe superposta:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF animado:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Ver exemplos de QR', type: 'example' }],
    },
    {
      heading: 'Incorporando códigos QR',
      paragraphs: [
        'No modo Profesional, a función Compartir xera HTML e URL incrustables. Así é como funciona a incorporación:',
      ],
      bullets: [
        'Compartir ligazón: crea un URL para a aplicación ANQR con todas as túas configuracións codificadas como parámetros de URL. Os destinatarios poden ver e modificar o código QR.',
        'Incrustar imaxe: xera unha etiqueta <img> que apunta á API do servidor. O código QR represéntase no servidor e serve como imaxe.',
        'Incrustar Markdown: crea a sintaxe de imaxe Markdown para a documentación e os ficheiros README.',
        'URL da API directa: o URL da API en bruto para usar en aplicacións, scripts ou outras integracións.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Exemplo HTML',
      paragraphs: [
        'Para inserir un código QR no teu sitio web:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="Código QR" />',
        'Para o tamaño sensible:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="Código QR" style="max-width: 100%; height: auto;" />',
        'O servidor almacena na caché as respostas con cabeceiras longas, polo que as solicitudes repetidas para o mesmo URL son rápidas.',
      ],
    },
    {
      heading: 'Compartir formato de URL',
      paragraphs: [
        'Cando fas clic en Compartir en modo profesional, ANQR codifica a túa configuración actual en parámetros de URL. O formato é:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Estes parámetros reflicten os parámetros da API, polo que pode converter un URL compartido nun URL da API cambiando a ruta base de / a /api/qr e axustando os parámetros w/h segundo sexa necesario.',
        'Nota: As imaxes superpostas cargadas desde ficheiros locais non se poden compartir mediante URL; só as superposicións baseadas en URL (parámetro img) funcionan nas ligazóns compartidas e nas chamadas de API.',
      ],
    },
    {
      heading: 'Límites de taxas e uso',
      paragraphs: [
        'A API é gratuíta para volumes razoables. Para usos de gran volume ou aplicacións comerciais que requiran tempo de actividade garantido, póñase en contacto connosco.',
        'As respostas da API inclúen cabeceiras de caché agresivas. Para obter un mellor rendemento, almacena na caché as respostas da túa parte ou utiliza o mesmo URL de forma coherente para códigos QR idénticos.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Mellores prácticas',
      paragraphs: ['Siga estas directrices para obter códigos QR fiables:'],
      bullets: [
        'Proba sempre os teus códigos QR con varias aplicacións de escáner antes de imprimir.',
        'Use a corrección de erros H (alta) ao engadir superposicións.',
        'Manter polo menos 4 módulos de zona tranquila (marxe).',
        'Garantir un alto contraste entre o primeiro plano e o fondo.',
        'Para imprimir, use polo menos 300 DPI e proba o tamaño de impresión real.',
        'Activa Preservar patróns do buscador ao usar superposicións.',
        'Comeza cunha intensidade de superposición máis baixa e aumenta gradualmente.',
        'Para uso en exteriores, considere módulos maiores e corrección de erros máis alta.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Explorar artigos para aprender', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Ver exemplos de QR', type: 'example' },
      ],
    },
    {
      heading: 'Resolución de problemas',
      paragraphs: ['Problemas comúns e solucións:'],
      bullets: [
        'QR non escaneará: reduce a intensidade da superposición, aumenta a corrección de erros, verifica o contraste.',
        'O código demasiado grande: reduce a lonxitude do contido, usa o acurtador de URL, a versión inferior.',
        'Saída borrosa: aumenta o tamaño do módulo, usa PNG en lugar de formatos comprimidos.',
        'As cores parecen incorrectas: comprobe o contraste das cores, proba o modo de superposición en escala de grises.',
        'GIF non animado: asegúrese de usar a saída en formato GIF, comprobe o número de fotogramas.',
        'Non se carga a superposición de imaxes: comproba os permisos de CORS nas imaxes remotas.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Consulta guías e exemplos relacionados',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Atallos de teclado',
      paragraphs: [
        'ANQR admite atallos de teclado estándar. Use Ctrl/Cmd+S para activar a exportación (cando se concentre na vista previa).',
      ],
    },
    {
      heading: 'Compartir e incorporar',
      paragraphs: [
        'No modo Profesional, fai clic no botón Compartir para copiar un URL coa túa configuración actual. Os destinatarios poden abrir este URL para ver a súa configuración exacta. Nota: As imaxes superpostas de ficheiros locais non se poden compartir mediante o URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Proba esta configuración directamente no xerador ANQR.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Explorar artigos para aprender', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Ver exemplos de QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Ver exemplos de QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Abre o xerador', type: 'generator' },
  ],
};

export default guide;
