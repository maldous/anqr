import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Aprende con ANQR',
  description: 'Guías prácticas e orientadas ás empresas para converter códigos QR en activos de marketing reais, non só cadrados funcionais. Aprende a actualizar códigos de punto de venda legados, crear sinalizacións QR de pago compatibles, preparar exportacións listas para imprimir, usar animacións de forma segura en pantallas dixitais e compartir configuracións bloqueadas en equipos multilingües mediante ligazóns ANQR ("ancora").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abre o xerador', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Ver exemplos de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Abra a Guía de usuario completa', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Mellorando as campañas QR existentes',
      paragraphs: ['A maioría das empresas teñen códigos QR espallados polas súas operacións: menús, mostradores, envases e materiais promocionais. Moitos destes códigos creáronse hai anos con xeradores básicos, dando lugar a cadrados xenéricos en branco e negro que non inspiran confianza nin coinciden coa identidade da túa marca. Esta guía completa guíache a través dun enfoque sistemático para auditar, actualizar e optimizar a túa infraestrutura QR existente sen interromper as viaxes dos clientes que xa estableceches.', 'A vantaxe estratéxica de actualizar os teus códigos QR en lugar de substituír está en preservar a continuidade. Os teus clientes xa aprenderon a esperar certos destinos cando escanean os teus códigos. Ao manter os URL codificados idénticos mentres melloras drasticamente a presentación visual, a fiabilidade da dixitalización e o aliñamento da marca, creas unha transición perfecta que mellora a confianza sen necesidade de modificar a túa infraestrutura dixital ou o seguimento analítico.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Unha comparación lado a lado que mostra un código QR xenérico e esvaído xunto a unha versión de marca moderna que codifica o mesmo URL',
          caption: 'Antes e despois: o mesmo URL de destino transformouse dun código xenérico datado a un activo de marca profesional',
        },
      ],
    },
    {
      heading: 'Por que os códigos QR legados teñen un rendemento inferior',
      paragraphs: ['Os códigos QR creados durante a fase de adopción temperá, especialmente durante 2020-2021, cando as empresas se apresuraron a implementar solucións sen contacto, adoitan sufrir varios problemas críticos. As configuracións de corrección de erros baixas fan que sexan fráxiles cando se imprimen en superficies con textura ou se ven cunha iluminación difícil. As zonas de silencio insuficientes provocan erros na exploración cando os códigos se colocan preto doutros elementos visuais. O estilo xenérico non comunica a lexitimidade da marca, o que provoca dúbidas e reducións nas taxas de exploración.', 'Ademais das limitacións técnicas, os códigos legados adoitan representar oportunidades de marca perdidas. Cada código QR é un punto de contacto co teu cliente, un momento no que están activamente comprometidos e dispostos a actuar. Un código de estilo profesional que coincide coas cores da túa marca, inclúe marxes de seguridade adecuadas e inclúe elementos de marca opcionais que transforma esta utilidade nun activo de marketing que reforza a túa identidade en cada interacción.'],
    },
    {
      heading: 'Realización dunha auditoría de código QR',
      paragraphs: ['Comeza o teu proxecto de actualización creando un inventario completo de todos os códigos QR actualmente implantados na túa empresa. Documente a localización física, o destino codificado, o estado actual do material impreso e o ambiente de dixitalización típico, incluíndo as condicións de iluminación e os ángulos de visión. Proba cada código con varios dispositivos: os teléfonos intelixentes máis antigos e os dispositivos económicos adoitan revelar problemas de fiabilidade que ocultan os teléfonos premium.', 'Preste especial atención aos códigos en lugares de alto risco: puntos de pago, áreas de facturación e pantallas promocionais onde a falla da exploración afecta directamente os ingresos ou a experiencia do cliente. Estes deben ter prioridade para a actualización inmediata. Teña en conta tamén os códigos que aparecen no contido de fotografía ou vídeo, xa que requirirán coordinación co seu equipo de marketing para actualizar os recursos visuais.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Unha interface de lista de verificación que mostra categorías de auditoría QR: localización, estado, fiabilidade da exploración e clasificación de prioridade',
          caption: 'Modelo de auditoría QR sistemática para documentar e priorizar os candidatos de actualización',
        },
      ],
    },
    {
      heading: 'A estratexia de actualización segura',
      paragraphs: ['A regra principal das actualizacións de QR é a preservación do destino. Extrae o URL exacto de cada código existente e codificao de forma idéntica na túa nova versión. Isto garante que todas as análises existentes, a lóxica de redirección e as expectativas dos clientes permanecen intactas. Se necesitas flexibilidade de destino para futuras actualizacións, este é o momento ideal para introducir un URL curto de marca ou un servizo de redirección, pero implementalo como un proxecto separado para evitar cambios complicados.', 'Para a actualización visual, aplique melloras nas capas: primeiro garantice a fiabilidade técnica (corrección de erros adecuada e zona silenciosa), despois engade o estilo da marca (cores, formas de módulo) e, finalmente, considere melloras opcionais (superposicións centrais, marcos). Cada capa debe ser validada mediante probas antes de continuar. O modo de seguranza de ANQR axuda a facer cumprir estas prioridades avisando cando as opcións de estilo poden comprometer a escaneable.'],
    },
    {
      heading: 'Engadindo identidade de marca sen comprometer a fiabilidade',
      paragraphs: ['A marca QR eficaz equilibra o impacto visual coa fiabilidade da exploración. Comeza pola cor: substitúe o primeiro plano negro predeterminado pola cor da túa marca principal, garantindo un contraste suficiente contra o teu fondo. Para a maioría das marcas, as cores escuras sobre fondos claros funcionan mellor. Evite combinacións de baixo contraste, degradados que reduzan a claridade dos bordos ou cores que parecen similares en condicións de iluminación habituais.', 'A personalización da forma do módulo ofrece outra oportunidade de marca cun impacto mínimo de fiabilidade. Os módulos redondeados crean unha aparencia máis suave e accesible mentres manteñen unha excelente capacidade de dixitalización. Os módulos tipo punto funcionan ben para marcas modernas e avanzadas en tecnoloxía. Os módulos conectados se adaptan ás identidades industriais ou corporativas. Sexa cal sexa o estilo que elixas, mantén a coherencia en todas as túas implementacións de QR para o recoñecemento instantáneo da marca.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Un diagrama de roda de cores que mostra combinacións de cores QR óptimas con indicadores de relación de contraste',
          caption: 'Guía de selección de cores de marca que mostra combinacións de alto contraste que manteñen a fiabilidade da dixitalización',
        },
      ],
    },
    {
      heading: 'Protocolo de proba e validación',
      paragraphs: ['Nunca implementes códigos QR actualizados sen probas rigorosas. Imprima unha proba física co tamaño exacto e no mesmo material que a súa implementación final. Proba no lugar real onde vivirá o código, a diferentes horas do día para ter en conta as variacións de iluminación. Utiliza polo menos tres dispositivos diferentes: un teléfono insignia actual, un dispositivo de gama media e un teléfono intelixente máis antigo ou económico.', 'Rexistra os tempos de exploración e as taxas de éxito de cada proba. Un código ben optimizado debería escanear en 1-2 segundos en calquera dispositivo razoablemente moderno. Se observas atrasos ou fallos constantes, reduce a intensidade do estilo: elimina ou reduce as superposicións, aumenta o tamaño da zona de silencio ou cambia a un nivel de corrección de erros superior. A fiabilidade sempre prima sobre a sofisticación visual.'],
    },
    {
      heading: 'Bloqueo da súa configuración para a coherencia',
      paragraphs: ['Unha vez que validas unha configuración óptima, consérvaa mediante as ligazóns compartibles de ANQR. Isto crea un rexistro permanente de cada configuración utilizada para xerar o código aprobado: cores, estilo do módulo, corrección de erros, tamaño e calquera superposición. Comparte esta ligazón co teu equipo de deseño, os provedores de impresión e calquera persoa que teña que reproducir o código no futuro.', 'Este bloqueo de configuración evita a degradación gradual que afecta a moitos despregamentos de QR. Sen el, os membros do persoal recrean códigos a partir de capturas de pantalla, os deseñadores reconstruen a configuración a partir da memoria e os provedores de impresión fan axustes "útiles". Cada variación introduce problemas potenciais. Cunha ligazón de configuración bloqueada, cada reprodución é idéntica ao orixinal probado e aprobado.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Un diagrama que mostra a deriva da configuración: capturas de pantalla que conducen a recreacións que conducen a variantes, fronte a unha única ligazón fonte da verdade',
          caption: 'Evita a deriva da configuración establecendo unha única fonte autorizada para todas as reproducións QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Ver exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Códigos QR para pagos minoristas',
      paragraphs: ['Os códigos QR de pago funcionan no ambiente máis esixente no comercio polo miúdo: o momento da transacción. Os clientes están listos para pagar, moitas veces cunha cola formando detrás deles, e cada segundo de atraso crea fricción. Non obstante, este momento de alta presión tamén é un inmoble principal para o reforzo da marca. Esta guía explica como crear códigos QR de pago que se escanean instantáneamente en aplicacións bancarias, aínda que presentan un aspecto profesional e de marca que fomenta a confianza dos clientes.', 'O principio fundamental dos códigos QR de pago é a fiabilidade fronte á estética. Un código ben deseñado que non se escanea na aplicación bancaria dun cliente custarache moito máis en transaccións abandonadas e clientes frustrados que un deseño conservador. Comeza polo cumprimento, engade fiabilidade e, a continuación, coloca coidadosamente a marca só onde non comprometa a función principal.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Unha pantalla de mostrador de venda polo miúdo que mostra un código QR de pago escaneado por un teléfono intelixente cunha aplicación bancaria',
          caption: 'Os códigos QR de pago deben funcionar ao instante coas aplicacións bancarias e de carteira en condicións de mostrador do mundo real',
        },
      ],
    },
    {
      heading: 'Comprensión dos estándares QR de pago',
      paragraphs: ['Os códigos QR de pago normalmente seguen os estándares rexionais que ditan o formato de carga útil. En Singapur, PayNow QR usa un formato específico. Na India, os códigos UPI seguen os estándares de enlace profundo BharatQR ou UPI. Os pagos europeos SEPA utilizan códigos QR EPC. Cada estándar existe para garantir que as aplicacións bancarias poidan recoñecer e procesar instantáneamente a información de pago. Desviarse destes estándares, aínda que sexa lixeiramente, pode provocar que as aplicacións de pago rexeiten códigos que os escáneres de cámara xenéricos len sen problemas.', 'ANQR inclúe modelos para os principais estándares de pago que formatan automaticamente os detalles do teu comerciante en cargas útiles compatibles. Use sempre estes modelos en lugar de construír manualmente cadeas de pago, xa que ata pequenos erros de formato poden provocar erros nas transaccións. Se o estándar de pago da túa rexión non está dispoñible como modelo, consulta a documentación técnica do teu provedor de pagos para coñecer os requisitos de formato exactos.'],
    },
    {
      heading: 'Dimensionamento e colocación de mostradores',
      paragraphs: ['Os códigos QR de mostrador enfróntanse a desafíos físicos únicos. Os clientes escanean a distancia, moitas veces en ángulo, ás veces a través de protectores para estornudos ou vitrinas. A iluminación superior crea puntos de brillo. O código compite con outros desordes de contador pola atención e as liñas de visión claras. Dimensiona xenerosamente o teu QR de pago: recoméndase un mínimo de 4-5 cm para a maioría das aplicacións de mostrador, aumentando a escala se o código está detrás do cristal ou nunha zona pouco iluminada.', 'A posición importa tanto como o tamaño. Coloque o código onde os clientes poidan soster o teléfono comodamente sen bloquear a cola nin chegar de forma incómoda. Incline a pantalla cara ao cliente en lugar de colocala plana. Se é posible, use laminación mate ou materiais de visualización non reflectantes para minimizar o brillo da iluminación aérea. Proba a colocación final en diferentes momentos do día para detectar problemas de iluminación.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Un diagrama que mostra as alturas e ángulos de colocación óptimos de QR para diferentes configuracións de contadores',
          caption: 'Guía de colocación do mostrador: alturas, ángulos e distancias óptimos para unha dixitalización de pagos fiable',
        },
      ],
    },
    {
      heading: 'Marca conservadora para códigos de pago',
      paragraphs: ['As aplicacións de pago son menos tolerantes que os escáneres de cámara xenéricos. Moitas aplicacións bancarias usan algoritmos de lectura QR máis antigos e máis sinxelos, optimizados para a velocidade e non para a flexibilidade. Isto significa que o estilo que funciona perfectamente cunha cámara do teléfono pode fallar con aplicacións de pago específicas. Mantén a marca conservadora: utiliza a cor da túa marca en primeiro plano se mantén un forte contraste, pero evita os degradados, as superposicións pesadas ou os elementos decorativos que poidan interferir co recoñecemento.', 'Se queres un logotipo ou unha superposición do centro, manténo moi pequeno (non máis do 10 ao 15 % da área QR) e proba extensamente con todas as aplicacións de pago que poidan usar os teus clientes. Moitas empresas optan por non superpoñer os códigos de pago en concreto, reservando ese estilo para comercializar códigos QR onde os requisitos de fiabilidade son menos estritos. O traballo do código de pago é procesar transaccións, non impresionar visualmente.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Unha comparación que mostra niveis de marca aceptables e arriscados para os códigos QR de pago',
          caption: 'Espectro de marca QR de pago: desde un estilo conservador seguro ata enfoques decorativos arriscados',
        },
      ],
    },
    {
      heading: 'Consideracións de material e impresión',
      paragraphs: ['O material da pantalla física afecta significativamente a fiabilidade da exploración. A laminación brillante reflicte as luces aéreas directamente na cámara do cliente. Os materiais texturizados poden distorsionar os bordos do módulo. A impresión barata pode difuminar detalles finos. Para os códigos QR de pago, inviste en calidade: usa laminación mate ou satinada, asegúrate de imprimir en alta resolución e substitúe as pantallas antes de que estean desgastadas. Un código de pago raiado ou descolorido cústalle transaccións.', 'Considere a durabilidade e a substitución da pantalla. As pantallas dos mostradores tócanse, móvense, salpican e, ocasionalmente, derrubadas. Deseña o teu sistema de visualización para que a inserción QR se poida substituír facilmente sen substituír todo o soporte. Mantén listas as impresións de recambio xeradas desde a ligazón de configuración bloqueada, para que os códigos gastados se poidan intercambiar inmediatamente.'],
    },
    {
      heading: 'Proba con aplicacións de pago reais',
      paragraphs: ['Os escáneres de cámara xenéricos descodificarán case calquera código QR con formato razoable. As aplicacións de pago son máis esixentes. Antes de implementar calquera código QR de pago, próbao con todas as aplicacións de pago que poidan usar os teus clientes. En contornos de pagos múltiples, isto pode significar probas con varias aplicacións bancarias, carteiras dixitais e plataformas de pago. Documenta cales son as aplicacións que probaches e as súas versións: as aplicacións de pago actualízanse con frecuencia e unha actualización podería cambiar o comportamento da dixitalización.', 'Proba en condicións realistas: a pantalla real, a iluminación real, a distancia de dixitalización real. Un código que escanea ao instante na túa mesa pode loitar no mostrador ás 17:00 cando o sol da tarde crea brillo. Proba co teléfono intelixente máis antigo e máis barato que podes atopar: se funciona de forma fiable nun dispositivo económico, funcionará en todo. Marca calquera tempo de exploración superior a 2 segundos para a investigación e o posible redeseño.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Unha lista de verificación de probas que mostra varias aplicacións de pago, tipos de dispositivos e condicións ambientais para verificar',
          caption: 'Matriz de probas QR de pagos completa que abarca aplicacións, dispositivos e factores ambientais',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Ver exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Códigos QR listos para imprimir: SVG vs PNG',
      paragraphs: ['A diferenza entre un código QR que se escanea perfectamente e un que falla moitas veces reside en como foi exportado e tratado no fluxo de traballo de impresión. Esta guía explica as distincións críticas entre os formatos vectoriales (SVG) e ráster (PNG), cando usar cada un e como entregar as obras de arte QR a deseñadores e vendedores de impresión de xeito que preserven a fiabilidade da dixitalización desde tarxetas de visita ata sinalizacións do tamaño de cartelería.', 'A produción impresa introduce variables que non existen na pantalla: a extensión da tinta, a textura do substrato, os procesos de acabado e o efecto acumulativo das conversións múltiples de ficheiros. Un código QR que parece perfecto no teu software de deseño pode saír da impresora con bordos suavizados, contraste reducido ou módulos sutilmente distorsionados. A comprensión das mellores prácticas de selección de formato e fluxo de traballo evita estes fallos silenciosos.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Unha vista ampliada que compara módulos QR vectoriales con bordos nítidos fronte a módulos ráster que mostran artefactos de píxeles',
          caption: 'Vector vs ráster a escala de impresión: a diferenza de precisión que determina a fiabilidade da exploración',
        },
      ],
    },
    {
      heading: 'Por que se prefire o vector (SVG) para a impresión',
      paragraphs: ['Os ficheiros SVG describen códigos QR como formas matemáticas en lugar de cuadrículas de píxeles. Isto significa que o código pódese escalar a calquera tamaño, desde unha etiqueta de 1 cm ata unha pancarta de 10 metros, sen que se perda a nitidez dos bordos. O RIP (procesador de imaxe ráster) da impresora representa os vectores coa resolución nativa do dispositivo de saída, garantindo que cada bordo do módulo sexa tan nítido como o permita o hardware. Non hai interpolación, non hai artefactos de suavización, non hai desenfoque acumulado por varias operacións de cambio de tamaño.', 'Ademais da escalabilidade, os ficheiros SVG son máis robustos nos fluxos de traballo profesionais. Sobreviven de ida e volta a través de software de deseño sen degradación. Pódense corrixir a cor sen remuestrear. Incorpóranse de forma limpa en ficheiros PDF para obter unha saída lista para a prensa. Para calquera aplicación de impresión onde a calidade importa, SVG debería ser o teu formato de exportación predeterminado.'],
    },
    {
      heading: 'Cando o PNG é aceptable',
      paragraphs: ['PNG faise necesario cando o teu fluxo de traballo ou plataforma de destino non admite formatos vectoriais. Algunhas plataformas web, sistemas CMS de sinalización e fluxos de traballo de impresión legados requiren imaxes rasterizadas. Nestes casos, PNG pode funcionar ben, pero só se segues regras estritas: exporta co tamaño físico e resolución final, nunca se escala despois da exportación e evita calquera compresión con perdas ou conversión de formato.', 'A regra crítica para PNG é calcular as dimensións de píxeles necesarias antes de exportar. Se o teu QR imprime a 5 cm e a túa impresora funciona a 300 DPI, necesitas aproximadamente 590 píxeles. Exporta a este tamaño ou máis e, a continuación, redúceo se é necesario, nunca aumenta. Inclúe esta información no teu nome de ficheiro ou metadatos para que futuros usuarios non fagan un mal uso accidental dunha exportación de tamaño específico.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Unha interface de calculadora que mostra a relación entre o tamaño físico, o DPI e as dimensións de píxeles necesarias',
          caption: 'Calculadora de resolución de impresión: determina as dimensións mínimas de píxeles para o tamaño de saída de destino',
        },
      ],
    },
    {
      heading: 'Opcións de exportación ANQR explicadas',
      paragraphs: ['ANQR ofrece varios modos de exportación SVG para adaptarse a diferentes fluxos de traballo. O modo True Vector produce un resultado puro baseado en rutas, ideal para ferramentas de impresión e deseño profesionais. Cando engades superposicións rasterizadas ou certos efectos, ANQR pode incorporalos mantendo os módulos vectoriais, ou pode exportar unha versión totalmente rasterizada coa resolución especificada. A comprensión destas opcións axúdache a escoller a exportación correcta para cada caso de uso.', 'Para as exportacións PNG, ANQR permíteche especificar dimensións exactas e inclúe opcións para fondos transparentes. A configuración DPI axúdache a calcular os tamaños adecuados para imprimir, aínda que recorda que os DPI son metadatos; o que importa para imprimir é ter suficientes píxeles para o teu tamaño físico. En caso de dúbida, exporta máis do que pensas que necesitas; a redución preserva a calidade mentres que a ampliación destrúea.'],
    },
    {
      heading: 'Preparando ficheiros para a entrega',
      paragraphs: ['Ao pasar obras de arte QR a deseñadores ou vendedores de impresión, inclúa especificacións claras: o tamaño físico previsto, os requisitos mínimos de zona de silencio e calquera consideración sobre o espazo de cor. Para aplicacións críticas, proporcione tanto un SVG mestre como unha copia de seguranza PNG de alta resolución, etiquetados claramente cos usos previstos. Inclúe a súa ligazón de configuración ANQR para que o código se poida rexenerar se é necesario.', 'Anticipar erros comúns no proceso de entrega. Indique explícitamente que o QR non se debe escalar, xirar, sesgar ou aplicar efectos. Especifique que a zona tranquila debe permanecer despexada, sen marcas de recorte, marcas de rexistro ou elementos de deseño. Se o QR se colocará sobre un fondo de cores ou fotográfico, proporcione unha versión cunha forma de respaldo opaca para garantir un contraste adecuado.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Un diagrama do paquete de ficheiros que mostra o mestre SVG, a copia de seguranza de PNG, o documento de especificacións e a ligazón de configuración',
          caption: 'Paquete de entrega QR profesional: todo o que un deseñador ou vendedor de impresión necesita para unha reprodución precisa',
        },
      ],
    },
    {
      heading: 'Verificación de probas de impresión',
      paragraphs: ['Nunca aprobe unha tirada sen escanear unha proba física. Solicite unha proba impresa no substrato real co acabado real que se utilizará na produción. Escanear a proba en condicións de iluminación similares a onde se mostrará a peza final. Proba con varios dispositivos, incluídos os teléfonos intelixentes máis antigos que poden ter problemas de calidade marxinal.', 'Se a proba escanea lentamente ou de forma inconsistente, investigue antes de aprobar. Os problemas comúns inclúen o contraste insuficiente nos substratos de cores, as infraccións das zonas silenciosas debido ao recorte, os bordos do módulo de suavización da propagación da tinta ou a laminación que crea brillo. Calquera destes pode ser abordado antes de comprometerse cunha tirada completa, pero só se os detecta na fase de proba.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Unha lista de verificación de revisión de probas con resultados de probas de dixitalización, medicións de contraste e sinaturas de aprobación',
          caption: 'Fluxo de traballo de verificación da proba de impresión: probas sistemáticas antes de comprometerse coas cantidades de produción',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Ver exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Creación de códigos QR animados',
      paragraphs: ['Os códigos QR animados combinan a funcionalidade dos códigos QR estándar cun movemento atractivo que aumenta drasticamente as taxas de participación. Na sinalización dixital, as redes sociais e as pantallas interactivas, a animación transforma unha utilidade estática nun elemento visual convincente que chama a atención e invita á interacción. Esta guía abarca os principios, as técnicas e as limitacións prácticas para crear códigos QR animados que escanean de forma fiable ao tempo que ofrecen un impacto visual.', 'O reto fundamental dos códigos QR animados é equilibrar o interese visual coa fiabilidade da exploración. Cada fotograma debe ser escaneable individualmente; un escáner pode capturar o código en calquera momento do ciclo de animación. Esta limitación dá forma a cada decisión de deseño: que elementos poden moverse, canto poden cambiar e que debe permanecer estable ao longo da animación.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Unha pantalla de sinalización dixital que mostra un código QR animado que capta a atención do espectador nun espazo público',
          caption: 'Códigos QR animados na sinalización dixital: movemento que chama a atención e fomenta a dixitalización',
        },
      ],
    },
    {
      heading: 'Como afecta a animación á dixitalización',
      paragraphs: ['Os escáneres QR funcionan capturando un único cadro e analizando o patrón de módulos claros e escuros. Para que funcione un código animado, cada fotograma debe conter o patrón QR completo e válido. Isto descarta animacións que transformen a estrutura do código, disolvan módulos ou alteren significativamente o patrón de contraste. Os módulos de transporte de datos, o patrón aparentemente aleatorio no centro, deben permanecer visualmente estables.', 'Os enfoques de animación segura modifican elementos que non levan datos: fondos, cores, marcos decorativos e elementos superpostos. Os compoñentes estruturais - patróns de busca (os cadrados de esquina grandes), patróns de tempo (as liñas alternas) e patróns de aliñamento (cadrados máis pequenos en códigos máis grandes) - deben manter as súas posicións e proporcións. Traballar dentro destas limitacións aínda permite animacións sorprendentemente dinámicas e atractivas.'],
    },
    {
      heading: 'Técnicas de animación que funcionan',
      paragraphs: ['O ciclo de cores anima as cores de primeiro plano e de fondo a través dunha paleta mantendo o contraste suficiente en cada paso. Isto crea un efecto vibrante e que chama a atención cun risco mínimo de exploración, sempre que o contraste nunca baixe dos niveis lexibles. Os predefinidos do ciclo de cores de ANQR están deseñados para manter a escanebilidade durante todo o ciclo.', 'As superposicións animadas sitúan as imaxes en movemento detrás dun patrón QR semitransparente. O código permanece estable mentres se anima o fondo, quizais un vídeo en bucle, elementos de marca animados ou gráficos en movemento abstractos. Esta técnica require unha coidadosa xestión da intensidade para evitar que o fondo supere o patrón QR, pero crea os resultados visualmente máis sorprendentes.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Un diagrama que mostra a estrutura en capas dun QR animado: capa de código estable sobre a capa de fondo animada',
          caption: 'Principio de capas de animación: o patrón QR permanece constante mentres que os elementos do fondo se animan debaixo',
        },
      ],
    },
    {
      heading: 'Configuración de parámetros de animación',
      paragraphs: ['A velocidade de fotogramas afecta tanto a suavidade visual como o tamaño do ficheiro. Para a maioría das aplicacións, 10-15 fotogramas por segundo proporcionan un movemento suave sen tamaños excesivos de ficheiros. As taxas de fotogramas máis altas ofrecen rendementos visuais decrecentes mentres aumentan significativamente o tamaño dos ficheiros. Considere o seu contexto de entrega: un letrero dixital grande pode xestionar ficheiros máis grandes que a colocación de anuncios para móbiles.', 'O comportamento do bucle determina o ciclo da animación. Os bucles sen fisuras crean un movemento continuo ideal para sinalización e pantallas ambientais. Os bucles de ping-pong (adiante e logo atrás) funcionan ben para animacións sinxelas. Para os pulsos que captan a atención, considere animacións con retencións: períodos de quietude marcados por movementos que atraen a mirada sen fatiga constante polo movemento.'],
    },
    {
      heading: 'Creación de superposicións animadas',
      paragraphs: ['Cando se usan imaxes animadas (GIF, WebP animadas ou vídeos) como superposicións, ANQR extrae cadros e combínaos co teu código QR. A configuración de intensidade de superposición controla a parte da animación que se mostra: os valores máis baixos priorizan a escaneable mentres que os valores máis altos favorecen o impacto visual. Proba a intensidade escollida en varios fotogramas para garantir unha dixitalización consistente.', 'A calidade do material de orixe afecta significativamente os resultados. Use superposicións con temas claros e bo contraste. Evite animacións de orixe con intermitentes rápidos ou cambios de brillo extremos que poidan crear fotogramas ocasionais de baixo contraste. Previsualice o ciclo completo de animación antes de exportar para detectar os fotogramas problemáticos que poidan fallar ao escanear.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Unha vista fotograma a fotograma dunha superposición animada que mostra os niveis de contraste mantidos na secuencia',
          caption: 'Análise de fotogramas: verificando a escanebilidade consistente en todo o ciclo de animación',
        },
      ],
    },
    {
      heading: 'Consideracións de exportación e entrega',
      paragraphs: ['GIF segue sendo o formato animado máis admitido, reproducíndose automaticamente na maioría dos contextos sen necesidade de compatibilidade con reprodutor de vídeo. Non obstante, a paleta de 256 cores do GIF limita a fidelidade da cor. Para as animacións de cores críticas, considere WebP animada onde sexa compatible ou volve aos formatos de vídeo para obter a máxima calidade. A exportación GIF de ANQR inclúe opcións de tramado para maximizar a calidade dentro das limitacións da paleta.', 'O tamaño do ficheiro é importante para a entrega. Os sistemas de sinalización dixital, os clientes de correo electrónico e as plataformas sociais adoitan impoñer límites de tamaño. Se a túa animación supera estes límites, reduce o número de fotogramas, as dimensións ou a profundidade da cor. Ás veces, dividir unha animación complexa nun bucle máis curto consegue mellores resultados que a compresión agresiva que degrada cada fotograma.'],
    },
    {
      heading: 'Probando códigos QR animados',
      paragraphs: ['A proba de códigos animados require a dixitalización en varios puntos do ciclo de animación. Non só escanee unha vez e asuma o éxito: escanee repetidamente, en diferentes momentos, para verificar que cada fotograma é lexible. Preste especial atención aos fotogramas nos extremos do ciclo de cores ou aos picos de intensidade de superposición onde o contraste pode ser máis baixo.', 'Proba o hardware real da pantalla sempre que sexa posible. A calibración da cor do monitor, o ángulo de visión e a iluminación ambiental afectan a forma en que aparece e dixitaliza a animación. Unha animación brillante que escanea perfectamente no teu monitor pode desaparecer nunha pantalla exterior ou volverse ilexible en ángulos de visión oblicuos.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Unha matriz de proba que mostra as taxas de éxito da exploración en diferentes cadros, dispositivos e condicións de visualización',
          caption: 'Protocolo de proba QR animado: verificación sistemática en cadros, dispositivos e condicións de visualización',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Ver exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Mellores prácticas de seguridade e cumprimento de QR',
      paragraphs: ['Un código QR de deseño fermoso que non se escanea é peor que inútil: frustra aos clientes, dana a percepción da marca e desperdicia todos os recursos investidos na súa creación e distribución. Esta guía abarca os factores técnicos e prácticos que determinan se un código QR escaneará de forma fiable e como utilizar as funcións de seguridade de ANQR para detectar posibles problemas antes de que cheguen á produción.', 'A fiabilidade do código QR non é binaria. Un código pode escanear perfectamente nos teléfonos emblemáticos pero fallar nos dispositivos económicos. Pode que funcione cunha iluminación ideal, pero teña dificultades en restaurantes tenues ou luz solar brillante. A comprensión dos factores que afectan á escanebilidade axúdache a facer compromisos informados entre o estilo visual e a fiabilidade no mundo real.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Un espectro de fiabilidade que amosa códigos QR que van desde moi escaneables ata marxinalmente lexibles',
          caption: 'O espectro de escaneo: desde códigos a proba de balas ata estilos que superan os límites de fiabilidade',
        },
      ],
    },
    {
      heading: 'Comprensión dos niveis de corrección de erros',
      paragraphs: ['Os códigos QR inclúen redundancia integrada que permite lelos mesmo cando estean parcialmente danados ou escurecidos. O nivel de corrección de erros - L (7%), M (15%), Q (25%) ou H (30%) - determina a cantidade de código que pode faltar mentres se segue a decodificar correctamente. A corrección de erros máis alta crea códigos máis grandes pero proporciona unha marxe de seguridade para as superposicións, as imperfeccións de impresión e os danos ambientais.', 'Para códigos con superposicións de imaxes, o nivel de corrección de erros H é esencial: a superposición oculta fisicamente parte do código e necesitas ese 30 % de redundancia para manter a fiabilidade. Para códigos limpos e sen estilo en ambientes controlados, o nivel M a miúdo é suficiente. O nivel L debería reservarse para situacións nas que o tamaño do código estea moi limitado e pode garantir condicións impecables.'],
    },
    {
      heading: 'Zona Crítica Tranquila',
      paragraphs: ['A zona tranquila é a marxe en branco que rodea cada código QR. Os escáneres usan este límite para identificar onde comeza e remata o código. A norma ISO especifica unha zona silenciosa mínima de catro módulos (catro veces o ancho do cadrado máis pequeno do código). Incumprir este espazo -con elementos de deseño, bordos recortados ou contido adxacente- é unha das causas máis comúns de erros na exploración.', 'A aplicación da zona tranquila de ANQR axuda a manter este espazo crítico, pero tamén debes asegurarte de que se conserve nos teus deseños finais. Ao entregar obras de arte QR, especifique explícitamente os requisitos da zona tranquila. Ao colocar códigos en esquemas, verifique que non se introduza ningún elemento neste espazo. Uns poucos milímetros de espazo libre poden significar a diferenza entre a dixitalización fiable e os clientes frustrados.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Un diagrama que mostra o espazamento correcto das zonas silenciosas fronte ás infraccións comúns que provocan erros de exploración',
          caption: 'Requisitos da zona tranquila: a marxe invisible que determina o éxito da exploración',
        },
      ],
    },
    {
      heading: 'Contraste e seguridade da cor',
      paragraphs: ['Os escáneres QR detectan o patrón de módulos claros e escuros. Calquera estilo que reduza este contraste (primeiros planos claros, fondos escuros, efectos de degradado ou superposicións de pouca opacidade) dificulta a lectura do código. ANQR calcula as relacións de contraste e avisa cando as túas eleccións de cores se achegan a niveis perigosos, pero o árbitro final sempre está a facer probas no mundo real.', 'A percepción da cor varía coas condicións de iluminación. Unha combinación de cores que aparece con alto contraste no teu monitor pode resultar difícil de distinguir baixo unha iluminación incandescente cálida ou tubos fluorescentes fríos. Se o teu código se implementará en diferentes condicións de iluminación, proba con varias fontes de luz e considera unhas relacións de contraste máis conservadoras como marxe de seguridade.'],
    },
    {
      heading: 'Tamaño do módulo e distancia de visualización',
      paragraphs: ['O tamaño físico dos módulos individuais determina a distancia máxima desde a que se pode escanear un código. Os módulos máis pequenos significan códigos máis pequenos pero requiren distancias de exploración máis próximas. A regra xeral é que cada módulo debe ser de polo menos 0,5 mm á distancia de exploración prevista, aumentando proporcionalmente para distancias maiores. Un código nunha carteleira necesita módulos moito máis grandes que un código nunha tarxeta de visita.', 'Ao calcular o tamaño do módulo, considere o peor dos casos: o cliente cun teléfono máis antigo, cunha iluminación imperfecta, escaneando á distancia máxima probable. Deseña para este usuario e todos os demais terán unha experiencia aínda mellor. As recomendacións de tamaño de ANQR teñen en conta estas variables do mundo real para suxerir dimensións axeitadas para o seu uso.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Un gráfico que relaciona o tamaño do módulo, as dimensións de impresión e a distancia de dixitalización efectiva máxima',
          caption: 'Guía de distancia de dixitalización: adapta o tamaño do módulo aos teus requisitos de implantación',
        },
      ],
    },
    {
      heading: 'Usando o modo de seguranza ANQR',
      paragraphs: ['O modo de seguridade de ANQR ofrece comentarios en tempo real sobre a fiabilidade da exploración. Supervisa as relacións de contraste, o cumprimento da zona de silencio, a intensidade de superposición e outros factores que afectan á capacidade de dixitalización. Cando algún parámetro se achegue a niveis de risco, verás avisos con orientación específica sobre como mellorar a fiabilidade. Para as implantacións profesionais onde a falla é custosa, mantén o Modo de seguranza activo durante todo o proceso de deseño.', 'O modo de seguranza tamén inclúe unha función de verificación de dixitalización que tenta decodificar o código xerado e informa de éxito ou fallo. Aínda que esta verificación na aplicación non pode reproducir todas as condicións do mundo real, detecta moitos problemas comúns antes de investir en impresión ou distribución. Trate a verificación exitosa como unha barra mínima, non como unha garantía; as probas no mundo real seguen sendo esenciales.'],
    },
    {
      heading: 'Protocolos de probas no mundo real',
      paragraphs: ['Ningunha cantidade de verificación de software substitúe ás probas físicas. Imprima o seu código no tamaño previsto en material representativo. Probao no ambiente de implantación real con condicións de iluminación que coincidan co uso real. Escanea con varios dispositivos, non só co teu teléfono emblemático, senón tamén con dispositivos Android económicos, iPhones máis antigos e calquera dispositivo específico que use habitualmente a túa audiencia.', 'Documenta as túas probas de forma sistemática. Rexistra que dispositivos se probaron, en que condicións, con que resultados. Se estás implementando códigos a gran escala, establece criterios de aceptación: quizais unha taxa de éxito do 95 % no conxunto de probas do teu dispositivo ou exploracións exitosas en 2 segundos en todos os dispositivos probados. Estes estándares axudan a tomar decisións obxectivas en lugar de esperar o mellor.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Unha lista de verificación de probas completa que abrangue os dispositivos, as condicións e os criterios de aceptación',
          caption: 'Protocolo de proba de implantación QR: verificación sistemática antes do compromiso de produción',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Ver exemplos de QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Ver exemplos de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Abra a Guía de usuario completa', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abre a galería', type: 'gallery' },
  ],
};
