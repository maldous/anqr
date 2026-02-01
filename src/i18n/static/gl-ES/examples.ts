import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Exemplos de ANQR',
  description: 'Cinco exemplos de estilo de produción do mundo real que mostran onde os códigos QR crean un valor medible: elevar un código de mostrador de venda polo miúdo legado, pagos de venda polo miúdo de marca e accións de "escanear", escalado de impresión desde folletos ata vallas publicitarias, QR animado para sinalización dixital e colaboración multilingüe mediante ligazóns Anchor compartibles. Cada exemplo inclúe imaxes, restricións prácticas e unha ligazón de remix de volta ao xerador.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abre o xerador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explorar artigos para aprender', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra a Guía de usuario completa', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Estudo de caso: Retail Counter QR Uplift',
      paragraphs: ['Este exemplo do mundo real segue a unha pequena cafetería que levaba tres anos usando o mesmo código QR no seu mostrador. O código orixinal foi xerado rapidamente durante a crise da pandemia, impreso en papel estándar e colocouse nun soporte de plástico. Aínda funcionaba, tecnicamente, pero os clientes a miúdo necesitaban varios intentos para escanealo, e non fixo nada para reforzar a identidade de marca coidadosamente elaborada da cafetería.', 'A transformación comezou cunha auditoría sinxela: o código existente codificaba o URL do menú en liña da cafetería, que querían conservar. O desafío foi facer que o QR se sentise como parte da experiencia do café en lugar dunha utilidade posterior a partir de 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Un código QR desgastado nun soporte de plástico que mostra o desgaste visible, as impresións dixitais e as impresións descoloridas',
          caption: 'O punto de partida: tres anos de servizo de mostrador deixaran apenas funcional o QR orixinal',
        },
      ],
    },
    {
      heading: 'Diagnosticar os problemas do código orixinal',
      paragraphs: ['As probas revelaron varios problemas: o código orixinal utilizaba Corrección de erros L (redundancia mínima), tiña unha zona tranquila de só 2 módulos e imprimíase a baixa resolución. Baixo a cálida iluminación de tungsteno da cafetería, os módulos negros xa esvaídos apenas contrastaban co papel amarelento. Os teléfonos máis vellos loitaban; os teléfonos máis novos tiveron éxito pero con notable atraso.', 'Máis aló de problemas técnicos, o cadrado xenérico en branco e negro non comunicou nada sobre a marca. Os clientes dubidaron antes de escanear: unha sutil barreira de confianza que reduciu o compromiso co menú dixital coidadosamente deseñado da cafetería.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Unha superposición de diagnóstico que mostra as deficiencias técnicas do QR orixinal: ECC baixo, zona de silencio mínima, contraste deficiente',
          caption: 'Análise técnica que revela por que o código heredado ten un rendemento inferior en condicións do mundo real',
        },
      ],
    },
    {
      heading: 'O proceso de elevación',
      paragraphs: ['Usando ANQR, o propietario da cafetería recreou o código co URL do menú idéntico pero mellorou drasticamente a configuración: Corrección de erros H para a máxima resistencia, unha zona silenciosa de 6 módulos para unha detección fiable de límites e cores de marca (módulos burdeos profundos sobre fondo crema) que coincidían coa paleta interior da cafetería.', 'Engadiuse unha pequena superposición central co logotipo da cafetería, que se mantivo deliberadamente sutil para manter a escanebilidade ao tempo que proporciona un recoñecemento de marca instantáneo. O modo de seguridade confirmou que o novo deseño foi dixitalizado de forma fiable en dispositivos de proba antes de imprimir.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'A interface ANQR que mostra a configuración: cores da marca, ECC axeitado, zona de silencio xenerosa, superposición de logotipo sutil',
          caption: 'Creación da configuración actualizada: cada opción escollida para equilibrar a expresión da marca coa fiabilidade da exploración',
        },
      ],
    },
    {
      heading: 'Resultados medibles',
      paragraphs: ['Despois de implementar o novo QR en cartóns laminados con mate profesionais, a cafetería seguiu os resultados durante catro semanas. A taxa de éxito da exploración mellorou dun 70% estimado a case o 100%. O tempo medio de exploración baixou de 3 a 4 segundos a menos de 1 segundo. O máis significativo é que o compromiso do menú aumentou un 40 %: os clientes que antes miraban o QR e renunciaron agora estaban a escanear con confianza.', 'O persoal informou de menos preguntas dos clientes sobre "como usar o QR" e non máis casos de escribir manualmente o URL para clientes frustrados. O aspecto da marca tamén provocou conversas, cos clientes que comentaron positivamente o deseño cohesionado.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Unha comparación antes/despois coas métricas: taxa de éxito da exploración, tempo medio de exploración e melloras na conta de exploración semanal',
          caption: 'Catro semanas de datos que mostran o impacto medible dun aumento reflexivo do QR',
        },
      ],
    },
    {
      heading: 'Recree esta configuración',
      paragraphs: ['A configuración da cafetería demostra unha marca conservadora pero eficaz: corrección de erros H, zona silenciosa de 6 módulos, cores de marca de alto contraste e superposición central mínima. Este equilibrio funciona para a maioría das aplicacións de mostrador de venda polo miúdo onde a fiabilidade debe ser o primeiro, pero a presenza da marca aínda importa.', 'Abre o xerador con esta configuración precargada e adapta as cores e a superposición á túa propia marca. A idea clave: só as melloras de fiabilidade poden aumentar drasticamente o compromiso, mesmo antes de engadir calquera estilo visual.', 'Consulta a guía de aprendizaxe relacionada sobre a mellora das campañas QR existentes para obter a metodoloxía completa que está detrás deste enfoque.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Enlace ao xerador preconfigurado coa configuración da cafetería para a personalización inmediata',
          caption: 'Comeza cunha configuración comprobada e personaliza a túa marca',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Explorar artigos para aprender',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Estudo de caso: Mostrador de contador multipago',
      paragraphs: ['Este exemplo segue a unha tenda de roupa boutique que acumulara cinco códigos QR diferentes no seu rexistro: pago bancario, consellos, Instagram, comentarios de Google e unha ligazón de contratación. Cada un deles foi xerado a partir dunha fonte diferente, impreso en diferentes momentos e amosado en stands non coincidentes. O caos visual estaba minando a estética coidadosamente seleccionada da tenda e o persoal trataba regularmente cos clientes que escaneaban o código incorrecto.', 'A solución requiría separar as preocupacións: os códigos de pago necesitaban a máxima fiabilidade cun estilo conservador, mentres que os códigos de mercadotecnia podían ser máis expresivos. O sistema de visualización unificado que xurdiu demostra como equilibrar a presenza da marca coas demandas funcionais dos diferentes casos de uso de QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Unha zona de rexistro desordenada que mostra cinco códigos QR que non coinciden en varios stands e materiais impresos',
          caption: 'O punto de partida caótico: cinco códigos QR desconectados que compiten pola atención e causan confusión ao cliente',
        },
      ],
    },
    {
      heading: 'Priorizando a experiencia de pago',
      paragraphs: ['O método de pago principal da tenda utilizaba un estándar rexional que esixía un estrito cumprimento da carga útil. As probas revelaron que incluso un estilo menor afectaba a velocidade de exploración con certas aplicacións bancarias. A decisión: manter o QR de pago completamente sen modificar agás a optimización do tamaño e a impresión profesional en cartón mate.', 'Este enfoque conservador significaba que o código de pago parecía menos "de marca" que o ideal, pero as taxas de realización das transaccións melloraron drasticamente. A idea: os momentos de pago non son oportunidades de marca, son momentos de fiabilidade. Os clientes aprecian a velocidade e a certeza sobre a estética cando se trata de cartos.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Un código QR de pago limpo e grande nun cartón profesional mate, situado de forma destacada no rexistro',
          caption: 'O QR de pago: tamaño xeneroso, impreso profesionalmente, estilo conservador para o recoñecemento instantáneo das aplicacións bancarias',
        },
      ],
    },
    {
      heading: 'Creando a pantalla de acción secundaria',
      paragraphs: ['Para consellos, recensións, redes sociais e contratación, a tenda podería ser máis expresiva. Estes códigos rexeneráronse en ANQR cun estilo de marca consistente: o verde oliva característico da tenda sobre crema, o estilo de módulo redondeado e unha sutil superposición central coa icona da tenda. A corrección de erros H garantiu a fiabilidade mesmo co estilo.', 'Estes catro códigos dispuxéronse nun panel de marca situado ao lado (sen competir con) do código de pago. Etiquetas claras na tipografía da tenda explicaban o propósito de cada código. A xerarquía visual foi intencionada: o pago estaba só e destacado; accións secundarias agrupadas como opcións.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Un panel de marca que mostra catro códigos QR con estilo para consellos, recensións, redes sociais e contratación, con etiquetas claras',
          caption: 'O panel de acción secundaria: marca coherente, etiquetado claro, posicionado como opcións en lugar de distraccións',
        },
      ],
    },
    {
      heading: 'Deseño do sistema de visualización',
      paragraphs: ['A pantalla física resolveu varios problemas ao mesmo tempo. Tanto o soporte de pago como o panel secundario utilizaron materiais mate para eliminar o brillo da iluminación aérea. Optimizáronse as alturas para clientes de distinta estatura. Ángulos dirixidos cara á cola dos clientes en lugar de planos no mostrador.', 'Criticamente, a tenda creou impresións de reserva a partir de ligazóns de configuración ANQR bloqueadas. Cando o código de consellos finalmente foi salpicado de café, o persoal substituíuno en poucos minutos usando a configuración almacenada: sen capturas de pantalla, sen adiviñar a configuración, sen degradación da calidade.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Un diagrama que mostra a disposición física da pantalla: alturas, ángulos, materiais e a relación entre o pago e as pantallas secundarias',
          caption: 'Plano do sistema de visualización: ergonomía física optimizada para unha dixitalización fiable en todas as alturas dos clientes e as condicións de iluminación',
        },
      ],
    },
    {
      heading: 'Melloras operativas',
      paragraphs: ['Seis semanas despois da implantación, a tenda documentou melloras significativas: cero queixas dos clientes sobre a confusión de "código incorrecto", tempos de transacción máis rápidos e un aumento de 3 veces nos envíos de propinas (agora os clientes podían atopar e escanear o código de propina sen preguntar torpemente ao persoal). As opinións de Google tamén aumentaron a medida que o QR dedicado e ben etiquetado eliminou a fricción.', 'A formación do persoal fíxose máis sinxela: "O código de pago é o máis importante, todo o demais está no panel". Cando as aplicacións de pago se actualizaron e unha mostrou brevemente unha dixitalización máis lenta, o deseño conservador do código de pago fixo que aínda funcionase, un pouco máis lento en lugar de fallar por completo.', 'Consulta a guía de información sobre códigos QR para pagos polo miúdo para coñecer os principios que están detrás deste deseño do sistema de visualización.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Un panel de métricas que mostra comparacións antes e despois: incidentes de confusión, tempo de transacción, frecuencia de consellos, envíos de revisións',
          caption: 'Seis semanas de datos operativos que demostran o impacto empresarial dun sistema de visualización multi-QR pensado',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Explorar artigos para aprender',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Caso práctico: da tarxeta de visita á carteleira',
      paragraphs: ['Este exemplo segue a unha produtora de eventos que se prepara para unha conferencia importante. Necesitaban o mesmo código QR -enlazado coa aplicación do evento- implantado en formatos radicalmente diferentes: insercións de distintivos dos asistentes (3 cm), tarxetas de tendas de mesa (8 cm), sinalización da mesa de rexistro (30 cm), carteis de orientación (60 cm) e unha pancarta masiva de fondo de escenario (4 metros). Cada formato tiña diferentes distancias de visualización, condicións de iluminación e fluxos de traballo de produción.', 'O desafío non era só técnico, era operativo. Varios provedores xestionaban diferentes traballos de impresión e a empresa necesitaba garantir resultados coherentes e escaneables independentemente de quen producise o que. A súa solución centrouse na exportación de SVG e na documentación de entrega rigorosa.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Un collage que mostra o mesmo código QR despregado en cinco tamaños diferentes, desde a insignia ata a pancarta',
          caption: 'Un código QR, cinco tamaños de despregamento: o reto de manter a escanebilidade de centímetros a metros',
        },
      ],
    },
    {
      heading: 'Por que os eventos anteriores tiveron problemas',
      paragraphs: ['Na súa última conferencia, a empresa sufrira fracasos vergonzosos. O banner QR do escenario foi xerado como un pequeno PNG e ampliado no software de deseño; o resultado parecía aceptable desde a distancia, pero non puido escanear de forma fiable desde o público. Os QR das insignias tiñan un estilo excesivo e eran demasiado pequenos, o que frustraba aos asistentes ao tentar engadir contactos. As configuracións inconsistentes entre os formatos significaban que o "mesmo" QR en realidade parecía diferente en cada peza.', 'A análise posterior ao evento revelou a causa raíz: ningunha fonte única de verdade. Cada deseñador recreara o QR con configuracións lixeiramente diferentes e cada provedor de impresión procesara os ficheiros de forma diferente. Calidade degradada a través do xogo telefónico de entregas de ficheiros.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografías en primeiro plano que mostran erros de dixitalización: módulos de banners pixelados, códigos de distintivos de tamaño insuficiente, estilos inconsistentes en todos os formatos',
          caption: 'Análise forense de fallos de eventos anteriores: cada formato introducira problemas de calidade diferentes',
        },
      ],
    },
    {
      heading: 'O fluxo de traballo SVG-First',
      paragraphs: ['Para este evento, a compañía estableceu un protocolo estrito: un QR mestre xerado en ANQR cunha configuración óptima (corrección de erros H, zona de silencio xenerosa, estilo limpo), exportado como SVG e almacenado como fonte única de autoridade. A ligazón de configuración ANQR documentouse xunto co ficheiro SVG para que o código se poida rexenerar se fose necesario.', 'Todos os deseñadores e vendedores recibiron o mesmo mestre SVG con instrucións explícitas: colocar no tamaño necesario, non modificar, manter a zona libre de tranquilidade. Para os provedores que requirían formatos ráster, a compañía proporcionou PNG pre-representados en tamaños específicos con convencións de nomenclatura claras que indican o uso previsto.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Un paquete de ficheiros que mostra o mestre SVG, os PNG específicos de tamaño, o documento de especificación e a ligazón de configuración',
          caption: 'O paquete de entrega: todo o que necesitaban os provedores para producir resultados consistentes sen adiviñar',
        },
      ],
    },
    {
      heading: 'Consideracións específicas do tamaño',
      paragraphs: ['Cada formato requiriu unha atención específica. As insercións de insignias a 3 cm necesitaban o QR para ocupar o máximo espazo dispoñible; a distancia de dixitalización sería a lonxitude dun brazo. As tendas de mesa de 8 cm poden incluír marco decorativo fóra da zona tranquila. O banner de 4 metros requiría un cálculo: a partir da distancia típica da audiencia (15-20 metros), os módulos debían ser claramente distinguibles polas cámaras do teléfono, o que significaba que o QR debía estar de polo menos 80 cm dentro do deseño do banner.', 'A empresa creou unha guía de tallas que documenta as dimensións QR mínimas para cada distancia de dixitalización esperada. Isto converteuse nun activo reutilizable para eventos futuros, eliminando as suposicións do proceso de deseño.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Un gráfico que mostra a relación entre a distancia de exploración, o tamaño mínimo do QR e as dimensións do módulo para cada formato de evento',
          caption: 'A matriz de tamaños: dimensións calculadas que garanten unha dixitalización fiable á distancia de visualización esperada de cada formato',
        },
      ],
    },
    {
      heading: 'Production Results',
      paragraphs: ['A validación do día da conferencia foi sistemática: o persoal probou todos os QR despregados antes de que se abrisen as portas. As insercións da insignia escaneáronse ao instante ao longo do brazo. As tendas de mesa funcionaron de forma fiable na iluminación variable das salas de descanso. A pancarta do escenario -a vergoña do evento anterior- escaneouse con éxito dende o medio da zona de público.', 'Non se rexistraron queixas de dixitalización entre máis de 2.000 asistentes. O triunfo operativo foi igualmente significativo: cando unha incorporación de patrocinador de última hora requiría unha nova sinalización, o equipo de produción xerouno a partir do SVG mestre en minutos, seguro de que coincidiría con todo o demais.', 'Consulta a guía de aprendizaxe sobre códigos QR listos para imprimir para o marco de decisión SVG e PNG e as prácticas recomendadas de transferencia.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografía do evento que mostra aos asistentes escaneando con éxito códigos QR a varios tamaños e distancias por todo o recinto',
          caption: 'Éxito do día da conferencia: dixitalización fiable en todos os formatos, desde primeiros planos de insignias ata planos de banner de escenario',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Explorar artigos para aprender',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Caso práctico: visualización dixital do salón do aeroporto',
      paragraphs: ['Este exemplo segue a un salón de compañías aéreas que estivera usando códigos QR estáticos nas súas pantallas dixitais de benvida. As pantallas mostraban contido promocional rotativo, pero o código QR para o check-in da sala estaba sentado nun recuncho, estático e facilmente pasado por alto. Analytics mostrou que só o 15 % dos hóspedes elixibles utilizaron o rexistro de QR a pesar de ser máis rápido que a cola da mesa. A maioría dos hóspedes simplemente non se decataron.', 'A hipótese era sinxela: nun ambiente visualmente ocupado con contido en movemento, un QR estático faise invisible. A solución precisaba facer notar o QR sen comprometer a fiabilidade necesaria para un fluxo de facturación onde o fallo suporía aos viaxeiros frustrados e colas máis longas na mesa.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Unha pantalla dixital nun salón de aeroporto que mostra contido promocional cun pequeno código QR estático na esquina',
          caption: 'A configuración orixinal: un QR estático perdido nun mar de contido promocional dinámico, conseguindo só un 15 % de adopción',
        },
      ],
    },
    {
      heading: 'Deseño de animación segura',
      paragraphs: ['A sinalización dixital do salón utilizaba grandes paneis LED, un ambiente desafiante onde unha animación agresiva podía crear problemas de dixitalización. O equipo de deseño comezou de forma conservadora: un efecto de pulso suave que expandiu e contraeu sutilmente a presenza visual do QR sen modificar a estrutura do código real. O tempo de fotogramas estableceuse lento (250 ms) para evitar problemas de parpadeo coa frecuencia de actualización do LED.', 'A validación do modo de seguridade confirmou que cada fotograma seguía sendo escaneable. Probas adicionais nos paneis LED reais revelaron que o pulso debía ser aínda máis sutil do que suxerían as vistas previas do escritorio: o brillo do LED e os ángulos de visión afectaban o contraste percibido máis do esperado.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'O panel de configuración de animación ANQR mostra a configuración do pulso: tempo lento, intensidade sutil, modo de seguranza activado',
          caption: 'Configuración de animación: parámetros axustados para a visualización do panel LED mantendo a fiabilidade da exploración en cada cadro',
        },
      ],
    },
    {
      heading: 'Integración con contido de sinalización',
      paragraphs: ['O QR animado situouse nunha "zona estable" dedicada á disposición da pantalla, unha área que se mantivo constante mentres o contido promocional rotaba na área de visualización principal. Esta separación foi crucial: o QR necesitaba estabilidade visual para escanear mesmo mentres atraía a atención a través da súa sutil animación.', 'Engadiuse unha chamada á acción clara xunto ao QR: "Omitir a cola - escanear para rexistrarse". O texto permaneceu estático mentres o QR pulsaba, creando unha xerarquía visual que chamou a atención sobre a oportunidade de dixitalización sen esmagar o contido promocional.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Un diagrama de deseño de pantalla que mostra o QR animado nunha zona estable mentres o contido promocional xira na área principal',
          caption: 'Pantalla de asignación de inmobles: o QR animado ocupa unha zona estable separada do contido promocional rotativo',
        },
      ],
    },
    {
      heading: 'Implantación técnica',
      paragraphs: ['O QR animado exportouse como GIF cunha configuración optimizada para o CMS de sinalización. As consideracións sobre o tamaño dos ficheiros importaban: o sistema de xestión de contidos da sala tiña límites de carga e os ficheiros demasiado grandes provocaban un tartamudeo na reprodución. A exportación final equilibrou a calidade visual co tamaño do ficheiro limitando a paleta de cores e optimizando o número de cadros.', 'A implantación incluíu unha alternativa: se o GIF non se reproducía por calquera motivo, o sistema de sinalización mostraría unha copia de seguridade de PNG estática. Esta redundancia garantiu que a capacidade de rexistro nunca se perdese debido a problemas técnicos coa animación.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Unha interface CMS que mostra a carga QR animada cunha imaxe estática alternativa configurada',
          caption: 'Configuración do CMS de sinalización: animación principal con alternativa estática que garante que a capacidade de rexistro nunca se interrompa',
        },
      ],
    },
    {
      heading: 'Impacto medido',
      paragraphs: ['Despois dun mes de funcionamento, a adopción do check-in QR aumentou do 15% ao 24%, unha mellora relativa do 60%. As enquisas de comentarios dos convidados indicaron que o QR animado era "máis fácil de notar" e "se sentía máis moderno". Os tempos de cola da mesa diminuíron considerablemente durante os períodos pico a medida que máis hóspedes se autoserviron a través do QR.', 'É importante destacar que se informou de cero fallos de dixitalización a pesar de miles de exploracións diarias. O enfoque de animación conservador acadara o obxectivo de atención sen sacrificar a fiabilidade que esixía un fluxo de rexistro. Posteriormente, o salón lanzou QR animados similares ás súas outras localizacións.', 'Consulta a guía de aprendizaxe sobre códigos QR animados para a sinalización dixital para coñecer os principios técnicos do deseño seguro de animación.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Un panel que mostra o aumento da taxa de adopción, a redución do tempo de cola e a fiabilidade da exploración sen fallos durante o período de implantación',
          caption: 'Un mes de datos: aumento da adopción do 60 %, tempos de filas reducidos e mantívose a fiabilidade da exploración perfecta',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Explorar artigos para aprender',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Estudo de caso: Campaña QR de lanzamento global de produtos',
      paragraphs: ['Este exemplo segue a unha empresa de produtos electrónicos de consumo que lanza un novo produto simultaneamente en 12 mercados en 8 idiomas. Cada equipo de mercadotecnia rexional necesitaba producir envases, exhibicións de venda polo miúdo e materiais promocionais con códigos QR enlazados a páxinas de produtos localizadas. Os lanzamentos anteriores provocaran un estilo QR inconsistente, erros ocasionais de dixitalización e un "xogo telefónico" de deriva de configuración mentres cada equipo recreaba códigos a partir de capturas de pantalla.', 'A solución aproveitou as ligazóns de configuración compartibles de ANQR para establecer unha única fonte de verdade á que todos os equipos rexionais podían acceder, independentemente do idioma da súa interface. A carga útil QR utilizaba unha redirección intelixente que detectaba o idioma do usuario, polo que un código funcionaba a nivel mundial mentres ofrecía experiencias localizadas.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Un mapa do mundo que mostra 12 mercados con códigos QR, algúns visualmente incoherentes entre si',
          caption: 'O reto: 12 mercados, 8 idiomas e un historial de implementacións de QR inconsistentes en todas as rexións',
        },
      ],
    },
    {
      heading: 'Establecemento da configuración mestra',
      paragraphs: ['O equipo de marca global creou a configuración QR autorizada en ANQR: cores de marca que coincidan coa identidade visual da liña de produtos, Corrección de erros H para fiabilidade en todas as aplicacións impresas e dixitais e estilo que se reproduciría de forma consistente independentemente dos métodos de produción locais. Bloqueouse a configuración e documentouse a ligazón para compartir no informe global da campaña.', 'O URL codificado utilizaba un servizo de redirección de detección de idiomas. Ao escanear, os usuarios foron encamiñados automaticamente á páxina do produto na súa lingua local. Isto significaba que os 12 mercados podían usar códigos QR idénticos, sen variacións de carga útil por mercado que puidesen introducir erros.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'A interface ANQR que mostra a configuración mestra coas cores da marca, ECC H e o URL de redirección intelixente',
          caption: 'A configuración mestra: estándares globais de marca codificados nunha única fonte de verdade compartible',
        },
      ],
    },
    {
      heading: 'Fluxo de traballo do equipo rexional',
      paragraphs: ['Cada equipo de marketing rexional recibiu a ligazón de configuración con instrucións sinxelas: abra a ligazón, verifique que a vista previa coincide coas directrices da marca, exporte no formato necesario para a súa aplicación. A interface ANQR mostrouse no idioma preferido de cada equipo, pero a configuración QR subxacente permaneceu idéntica independentemente do idioma da interface.', 'Cando o equipo xaponés necesitaba SVG para exhibicións de venda polo miúdo de gama alta e o equipo brasileiro necesitaba PNG para as redes sociais, ambos exportáronse desde a mesma configuración. Cando o vendedor de impresión do equipo alemán solicitaba valores de cor específicos, podían facer referencia á configuración directamente en lugar de adiviñar a partir dunha captura de pantalla.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Capturas de pantalla que mostran a mesma ligazón de configuración aberta nas interfaces xaponesa, portuguesa e alemá',
          caption: 'Mesma configuración, interfaces diferentes: os equipos rexionais traballan no seu idioma preferido mantendo a coherencia global',
        },
      ],
    },
    {
      heading: 'Manexo de variacións rexionais',
      paragraphs: ['Algúns mercados requiriron pequenas adaptacións. O equipo chinés necesitaba unha versión cun marco optimizado para WeChat para compartir en redes sociais. En lugar de modificar o mestre, crearon unha variante documentada coa súa propia ligazón de configuración, claramente etiquetada como "variante CN-WeChat" na biblioteca de recursos da campaña. Isto mantivo a trazabilidade mentres permitía a localización necesaria.', 'O equipo da marca estableceu unha regra sinxela: calquera variación do mestre requiría unha nova ligazón de configuración documentada. Sen modificacións nos ficheiros exportados, sen "correccións rápidas" no software de deseño. Isto evitou a deriva de configuración que afectara a lanzamentos anteriores.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Unha interface de biblioteca de recursos que mostra a configuración mestra e as variantes rexionais aprobadas, cada unha coa súa propia ligazón',
          caption: 'Gobernanza dos activos da campaña: configuración mestra máis variantes documentadas, todas rastrexables mediante ligazóns de configuración',
        },
      ],
    },
    {
      heading: 'Resultados de lanzamento',
      paragraphs: ['O día do lanzamento do produto, os códigos QR foron implementados en embalaxes, exhibicións de venda polo miúdo, materiais de eventos e campañas dixitais nos 12 mercados ao mesmo tempo. As auditorías de calidade confirmaron a coherencia visual entre as rexións: o QR das exhibicións de venda polo miúdo de Toquio coincidía co QR dos envases de São Paulo coincidía co QR dos banners de eventos de Berlín.', 'Non se informou de fallos de dixitalización en todos os mercados. Cando se precisaba un cambio de URL da páxina do produto posterior ao lanzamento, o servizo de redirección tratouno de forma invisible, sen necesidade de reimpresión. O equipo global estimou que o enfoque da ligazón de configuración aforrou máis de 40 horas de tempo de coordinación en comparación coa súa metodoloxía de lanzamento anterior.', 'Consulta a guía de aprendizaxe sobre a colaboración QR multilingüe para coñecer os principios do fluxo de traballo detrás da coherencia global das campañas.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Unha cuadrícula de fotografías que mostra a implantación coherente de QR en diferentes mercados: venda polo miúdo de Tokio, envases de São Paulo, eventos de Berlín',
          caption: 'Coherencia global conseguida: presentación QR idéntica en 12 mercados a pesar de diferentes idiomas, provedores e formatos',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Abre o xerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Explorar artigos para aprender',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Explorar artigos para aprender', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra a Guía de usuario completa', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abre a galería', type: 'gallery' },
  ],
};
