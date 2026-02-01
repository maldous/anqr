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
  description: 'Cinco exemplos reais de estilo de produção que mostram onde os códigos QR criam valor mensurável: elevação de um código de contador de varejo legado, pagamentos de varejo de marca e ações de "digitalização para", dimensionamento de impressão de folhetos a outdoors, QR animado para sinalização digital e colaboração multilíngue usando links Anchor compartilháveis. Cada exemplo inclui imagens, restrições práticas e um link de remix para o gerador.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra o gerador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Procure artigos do Aprenda', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra o Guia do usuário completo', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Estudo de caso: elevação do QR do balcão de varejo',
      paragraphs: ['Este exemplo do mundo real segue um pequeno café que usa o mesmo código QR em seu balcão há três anos. O código original foi gerado rapidamente durante a corrida pandêmica, impresso em papel padrão e colocado em um suporte de plástico. Ainda funcionava - tecnicamente - mas os clientes muitas vezes precisavam de várias tentativas para digitalizá-lo, e isso não fazia nada para reforçar a identidade da marca cuidadosamente elaborada do café.', 'A transformação começou com uma auditoria simples: o código existente codificava o URL do menu online do café, que eles queriam manter. O desafio era fazer com que o QR parecesse parte da experiência do café, em vez de um utilitário posterior de 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Um código QR desgastado em um suporte de plástico mostrando desgaste visível, impressões digitais e impressão desbotada',
          caption: 'O ponto de partida: três anos de atendimento no balcão deixaram o QR original quase funcional',
        },
      ],
    },
    {
      heading: 'Diagnosticando os problemas do código original',
      paragraphs: ['Os testes revelaram vários problemas: o código original usava Correção de Erros L (redundância mínima), tinha uma zona silenciosa de apenas 2 módulos e foi impresso em baixa resolução. Sob a iluminação quente de tungstênio do café, os módulos pretos já desbotados mal contrastavam com o papel amarelado. Os telefones mais antigos apresentavam dificuldades; os telefones mais novos tiveram sucesso, mas com um atraso notável.', 'Além de questões técnicas, o quadrado preto e branco genérico não comunicava nada sobre a marca. Os clientes hesitaram antes de digitalizar – uma barreira de confiança subtil que reduziu o envolvimento com o menu digital cuidadosamente concebido do café.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Uma sobreposição de diagnóstico mostrando as deficiências técnicas do QR original: ECC baixo, zona silenciosa mínima, contraste ruim',
          caption: 'Análise técnica revelando por que o código legado teve desempenho inferior em condições do mundo real',
        },
      ],
    },
    {
      heading: 'O Processo de Elevação',
      paragraphs: ['Usando ANQR, o proprietário do café recriou o código com o URL de menu idêntico, mas melhorou drasticamente as configurações: Correção de Erros H para máxima resiliência, uma zona silenciosa de 6 módulos para detecção confiável de limites e cores da marca (módulos bordô profundo em fundo creme) que combinavam com a paleta interior do café.', 'Uma pequena sobreposição central com o logotipo do café foi adicionada - mantida deliberadamente sutil para manter a capacidade de leitura e, ao mesmo tempo, fornecer reconhecimento instantâneo da marca. O Modo de Segurança confirmou que o novo design foi digitalizado de forma confiável em dispositivos de teste antes de qualquer impressão.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'A interface ANQR mostrando a configuração: cores da marca, ECC apropriado, zona silenciosa generosa, sobreposição sutil do logotipo',
          caption: 'Construindo a configuração atualizada: cada configuração escolhida para equilibrar a expressão da marca com a confiabilidade da digitalização',
        },
      ],
    },
    {
      heading: 'Resultados mensuráveis',
      paragraphs: ['Depois de implantar o novo QR em cartões profissionais laminados foscos, a cafeteria acompanhou os resultados durante quatro semanas. A taxa de sucesso da digitalização melhorou de cerca de 70% para quase 100%. O tempo médio de varredura caiu de 3-4 segundos para menos de 1 segundo. Mais significativamente, o envolvimento do menu aumentou 40% – os clientes que antes olhavam para o QR e desistiam agora estavam lendo com confiança.', 'A equipe relatou menos perguntas dos clientes sobre como usar o QR e não houve mais ocorrências de digitação manual da URL para clientes frustrados. A aparência da marca também gerou conversas, com os clientes comentando positivamente sobre o design coeso.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Uma comparação antes/depois com métricas: taxa de sucesso da verificação, tempo médio de verificação e melhorias semanais na contagem de verificações',
          caption: 'Quatro semanas de dados mostrando o impacto mensurável de uma melhoria cuidadosa do QR',
        },
      ],
    },
    {
      heading: 'Recrie esta configuração',
      paragraphs: ['A configuração do café demonstra uma marca conservadora, mas eficaz: Correção de Erros H, zona silenciosa de 6 módulos, cores de marca de alto contraste e uma sobreposição central mínima. Este equilíbrio funciona para a maioria das aplicações de balcões de varejo onde a confiabilidade deve estar em primeiro lugar, mas a presença da marca ainda é importante.', 'Abra o gerador com essas configurações pré-carregadas e adapte as cores e sobreposições à sua marca. O principal insight: as melhorias na confiabilidade por si só podem aumentar drasticamente o envolvimento, mesmo antes de adicionar qualquer estilo visual.', 'Veja o guia de aprendizagem relacionado sobre como melhorar as campanhas QR existentes para conhecer a metodologia completa por trás dessa abordagem.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link para o gerador pré-configurado com as configurações do café para personalização imediata',
          caption: 'Comece com uma configuração comprovada e personalize para sua marca',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Procure artigos do Aprenda',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Estudo de caso: Exibição do contador de pagamentos múltiplos',
      paragraphs: ['Este exemplo segue uma boutique de roupas que acumulou cinco códigos QR diferentes em seu caixa: pagamento bancário, gorjetas, Instagram, avaliações do Google e um link de contratação. Cada um foi gerado a partir de uma fonte diferente, impresso em momentos diferentes e exibido em estandes incompatíveis. O caos visual estava minando a estética cuidadosamente selecionada da loja, e a equipe lidava regularmente com os clientes que digitalizavam o código errado.', 'A solução exigia a separação de preocupações: os códigos de pagamento precisavam de máxima confiabilidade com estilo conservador, enquanto os códigos de marketing poderiam ser mais expressivos. O sistema de exibição unificado que surgiu demonstra como equilibrar a presença da marca com as demandas funcionais de diferentes casos de uso de QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Uma área de registro desordenada mostrando cinco códigos QR incompatíveis em vários estandes e materiais impressos',
          caption: 'O ponto de partida caótico: cinco códigos QR desconectados competindo por atenção e causando confusão ao cliente',
        },
      ],
    },
    {
      heading: 'Priorizando a experiência de pagamento',
      paragraphs: ['O principal método de pagamento da loja usava um padrão regional que exigia conformidade rigorosa com a carga útil. Os testes revelaram que mesmo pequenos estilos afetavam a velocidade de verificação em determinados aplicativos bancários. A decisão: manter o QR de pagamento completamente inalterado, exceto para otimização de tamanho e impressão profissional em cartão fosco.', 'Esta abordagem conservadora fez com que o código de pagamento parecesse menos de marca do que o ideal, mas as taxas de conclusão de transações melhoraram dramaticamente. O insight: momentos de pagamento não são oportunidades de branding – são momentos de confiabilidade. Os clientes apreciam a velocidade e a segurança em vez da estética quando há dinheiro envolvido.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Um código QR de pagamento grande e limpo em cartão fosco profissional, posicionado com destaque na caixa registradora',
          caption: 'O QR de pagamento: dimensionado generosamente, impresso profissionalmente, com estilo conservador para reconhecimento instantâneo por aplicativos bancários',
        },
      ],
    },
    {
      heading: 'Criando a exibição da ação secundária',
      paragraphs: ['Para dicas, avaliações, redes sociais e contratações, a loja poderia ser mais expressiva. Esses códigos foram regenerados em ANQR com um estilo de marca consistente: o verde oliva sobre creme característico da loja, estilo de módulo arredondado e uma sutil sobreposição central com o ícone da loja. A Correção de Erros H garantiu confiabilidade mesmo com o estilo.', 'Esses quatro códigos foram organizados em um painel da marca posicionado ao lado (não concorrente) do código de pagamento. Etiquetas claras na tipografia da loja explicavam a finalidade de cada código. A hierarquia visual foi intencional: o pagamento era isolado e proeminente; ações secundárias agrupadas como opções.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Um painel da marca mostrando quatro códigos QR estilizados para dicas, avaliações, redes sociais e contratações, com rótulos claros',
          caption: 'O painel de ação secundário: marca consistente, rotulagem clara, posicionada como opções em vez de distrações',
        },
      ],
    },
    {
      heading: 'Design do sistema de exibição',
      paragraphs: ['A exibição física resolveu vários problemas simultaneamente. Tanto o suporte de pagamento quanto o painel secundário utilizaram materiais foscos para eliminar o brilho da iluminação superior. As alturas foram otimizadas para clientes de estatura variada. Ângulos direcionados para a fila do cliente, em vez de planos no balcão.', 'Criticamente, a loja criou impressões sobressalentes a partir de links de configuração ANQR bloqueados. Quando o código das dicas acabou sendo borrifado, a equipe o substituiu em minutos usando a configuração armazenada - sem capturas de tela, sem adivinhar as configurações, sem degradação da qualidade.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Um diagrama que mostra o layout do display físico: alturas, ângulos, materiais e a relação entre pagamento e displays secundários',
          caption: 'Projeto do sistema de exibição: ergonomia física otimizada para digitalização confiável em alturas de clientes e condições de iluminação',
        },
      ],
    },
    {
      heading: 'Melhorias Operacionais',
      paragraphs: ['Seis semanas após a implantação, a loja documentou melhorias significativas: zero reclamações de clientes sobre confusão de código errado, tempos de transação mais rápidos e um aumento de três vezes no envio de gorjetas (os clientes agora podiam encontrar e escanear o código da gorjeta sem perguntar desajeitadamente à equipe). As avaliações do Google também aumentaram à medida que o QR dedicado e bem rotulado eliminou o atrito.', 'O treinamento da equipe ficou mais simples: \'o código de pagamento é o grande, todo o resto está no painel\'. Quando os aplicativos de pagamento foram atualizados e um deles mostrou brevemente uma digitalização mais lenta, o design conservador do código de pagamento significava que ele ainda funcionava – apenas um pouco mais lento, em vez de falhar totalmente.', 'Consulte o guia de aprendizagem sobre códigos QR para pagamentos de varejo para conhecer os princípios por trás do design deste sistema de exibição.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Um painel de métricas mostrando comparações antes/depois: incidentes de confusão, tempo de transação, frequência de gorjetas, envios de avaliações',
          caption: 'Seis semanas de dados operacionais demonstrando o impacto nos negócios de um sistema de exibição multi-QR bem pensado',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Procure artigos do Aprenda',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Estudo de caso: do cartão de visita ao outdoor',
      paragraphs: ['Este exemplo segue uma empresa de produção de eventos que se prepara para uma grande conferência. Eles precisavam do mesmo código QR - vinculado ao aplicativo do evento - implantado em formatos radicalmente diferentes: inserções de crachás dos participantes (3 cm), cartões de tenda de mesa (8 cm), sinalização no balcão de registro (30 cm), cartazes de orientação (60 cm) e um enorme banner de fundo do palco (4 metros). Cada formato tinha diferentes distâncias de visualização, condições de iluminação e fluxos de trabalho de produção.', 'O desafio não era apenas técnico – era operacional. Vários fornecedores lidavam com diferentes trabalhos de impressão e a empresa precisava garantir resultados consistentes e digitalizáveis, independentemente de quem produzisse o quê. A solução deles centrou-se na exportação SVG e na rigorosa documentação de transferência.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Uma colagem mostrando o mesmo código QR implantado em cinco tamanhos diferentes, do crachá ao banner',
          caption: 'Um código QR, cinco tamanhos de implantação: o desafio de manter a capacidade de leitura de centímetros a metros',
        },
      ],
    },
    {
      heading: 'Por que os eventos anteriores tiveram problemas',
      paragraphs: ['Na última conferência, a empresa passou por fracassos embaraçosos. O QR do banner do palco foi gerado como um pequeno PNG e ampliado em software de design - o resultado parecia aceitável à distância, mas não foi digitalizado de forma confiável pelo público. Os QRs dos crachás eram superdimensionados e muito pequenos, frustrando os participantes que tentavam adicionar contatos. Configurações inconsistentes entre formatos significavam que o mesmo QR parecia diferente em cada peça.', 'A análise pós-evento revelou a causa raiz: nenhuma fonte única de verdade. Cada designer recriou o QR com configurações ligeiramente diferentes e cada fornecedor de impressão processou os arquivos de maneira diferente. Qualidade degradada pelo jogo telefônico de transferência de arquivos.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografias em close mostrando falhas de digitalização: módulos de banner pixelados, códigos de crachás subdimensionados, estilo inconsistente entre formatos',
          caption: 'Análise forense de falhas de eventos anteriores: cada formato introduziu diferentes problemas de qualidade',
        },
      ],
    },
    {
      heading: 'O fluxo de trabalho SVG-First',
      paragraphs: ['Para este evento, a empresa estabeleceu um protocolo rigoroso: um QR mestre gerado em ANQR com configurações ideais (correção de erros H, zona silenciosa generosa, estilo limpo), exportado como SVG e armazenado como fonte única confiável. O link de configuração ANQR foi documentado junto com o arquivo SVG para que o código pudesse ser regenerado, se necessário.', 'Cada designer e fornecedor recebeu o mesmo mestre SVG com instruções explícitas: coloque no tamanho necessário, não modifique, mantenha a folga da zona silenciosa. Para fornecedores que exigem formatos raster, a empresa forneceu PNGs pré-renderizados em tamanhos específicos com convenções de nomenclatura claras indicando o uso pretendido.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Um pacote de arquivos mostrando o mestre SVG, PNGs específicos de tamanho, documento de especificação e link de configuração',
          caption: 'O pacote de transferência: tudo o que os fornecedores precisavam para produzir resultados consistentes sem adivinhações',
        },
      ],
    },
    {
      heading: 'Considerações específicas de tamanho',
      paragraphs: ['Cada formato exigia atenção específica. As inserções de crachás de 3 cm precisavam que o QR ocupasse o espaço máximo disponível - a distância de digitalização seria o comprimento do braço. As tendas de mesa de 8 cm podem incluir molduras decorativas fora da zona tranquila. O banner de 4 metros exigia cálculos: a partir da distância típica do público (15-20 metros), os módulos precisavam ser claramente distinguíveis pelas câmeras dos telefones, o que significava que o QR precisava estar pelo menos 80 cm dentro do design do banner.', 'A empresa criou um guia de dimensionamento documentando as dimensões mínimas do QR para cada distância de digitalização esperada. Isso se tornou um recurso reutilizável para eventos futuros, eliminando suposições do processo de design.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Um gráfico que mostra a relação entre a distância de digitalização, o tamanho mínimo do QR e as dimensões do módulo para cada formato de evento',
          caption: 'A matriz de dimensionamento: dimensões calculadas que garantem uma digitalização confiável na distância de visualização esperada de cada formato',
        },
      ],
    },
    {
      heading: 'Resultados de produção',
      paragraphs: ['A validação do dia da conferência foi sistemática: a equipe testou cada QR implantado antes da abertura das portas. As inserções do crachá são digitalizadas instantaneamente com o braço estendido. As tendas de mesa funcionavam de maneira confiável na iluminação variável das salas de descanso. O banner do palco – a vergonha do evento anterior – foi escaneado com sucesso no meio da área de audiência.', 'Nenhuma reclamação de digitalização foi registrada em mais de 2.000 participantes. A vitória operacional foi igualmente significativa: quando uma adição de patrocinador de última hora exigia nova sinalização, a equipe de produção a gerava a partir do SVG mestre em minutos, confiante de que combinaria com todo o resto.', 'Consulte o guia de aprendizagem sobre códigos QR prontos para impressão para a estrutura de decisão SVG vs PNG e práticas recomendadas de transferência.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografia do evento mostrando os participantes escaneando códigos QR com sucesso em vários tamanhos e distâncias em todo o local',
          caption: 'Sucesso no dia da conferência: digitalização confiável em todos os formatos, desde close-ups de crachás até fotos à distância de banners de palco',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Procure artigos do Aprenda',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Estudo de caso: display digital do saguão do aeroporto',
      paragraphs: ['Este exemplo segue uma sala VIP de uma companhia aérea que usava códigos QR estáticos em suas telas digitais de boas-vindas. As telas exibiam conteúdo promocional rotativo, mas o código QR para check-in na sala VIP ficava em um canto, estático e facilmente esquecido. A análise mostrou que apenas 15% dos hóspedes elegíveis usaram o check-in QR, apesar de ser mais rápido do que a fila do balcão. A maioria dos convidados simplesmente não percebeu.', 'A hipótese era simples: em um ambiente visualmente movimentado com conteúdo em movimento, um QR estático torna-se invisível. A solução precisava tornar o QR perceptível sem comprometer a confiabilidade necessária para um fluxo de check-in onde falhas significariam viajantes frustrados e filas mais longas no balcão.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Um display digital no saguão de um aeroporto exibindo conteúdo promocional com um pequeno código QR estático no canto',
          caption: 'A configuração original: um QR estático perdido em um mar de conteúdo promocional dinâmico, alcançando apenas 15% de adoção',
        },
      ],
    },
    {
      heading: 'Projetando Animação Segura',
      paragraphs: ['A sinalização digital do lounge usava grandes painéis de LED – um ambiente desafiador onde animações agressivas poderiam criar problemas de digitalização. A equipe de design começou de forma conservadora: um efeito de pulso suave que expandiu e contraiu sutilmente a presença visual do QR sem modificar a estrutura real do código. O tempo de quadro foi definido como lento (250 ms) para evitar problemas de oscilação na taxa de atualização do LED.', 'A validação do Modo de Segurança confirmou que cada quadro permaneceu escaneável. Testes adicionais nos painéis LED reais revelaram que o pulso precisava ser ainda mais sutil do que as visualizações de desktop sugeriam - o brilho do LED e os ângulos de visão afetaram o contraste percebido mais do que o esperado.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'O painel de configurações de animação ANQR mostrando a configuração do pulso: tempo lento, intensidade sutil, modo de segurança ativado',
          caption: 'Configuração de animação: parâmetros ajustados para exibição do painel de LED, mantendo a confiabilidade da digitalização em cada quadro',
        },
      ],
    },
    {
      heading: 'Integração com conteúdo de sinalização',
      paragraphs: ['O QR animado foi posicionado em uma zona estável dedicada do layout da tela – uma área que permaneceu constante enquanto o conteúdo promocional girava na área de exibição principal. Esta separação foi crucial: o QR precisava de estabilidade visual para a digitalização, ao mesmo tempo que atraia a atenção através da sua animação subtil.', 'Uma frase de chamariz clara foi adicionada ao lado do QR: \'Ignore a fila - escaneie para fazer check-in.\' O texto permaneceu estático enquanto o QR pulsava, criando uma hierarquia visual que chamava a atenção para a oportunidade de digitalização sem sobrecarregar o conteúdo promocional.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Um diagrama de layout de tela mostrando o QR animado em uma zona estável enquanto o conteúdo promocional gira na área principal',
          caption: 'Alocação de espaço na tela: o QR animado ocupa uma zona estável separada do conteúdo promocional rotativo',
        },
      ],
    },
    {
      heading: 'Implantação Técnica',
      paragraphs: ['O QR animado foi exportado como GIF com configurações otimizadas para o CMS de sinalização. As considerações sobre o tamanho do arquivo eram importantes - o sistema de gerenciamento de conteúdo da sala tinha limites de upload e arquivos muito grandes causavam interrupções na reprodução. A exportação final equilibrou a qualidade visual em relação ao tamanho do arquivo, limitando a paleta de cores e otimizando a contagem de quadros.', 'A implantação incluía um substituto: se o GIF não fosse reproduzido por qualquer motivo, o sistema de sinalização exibiria um backup PNG estático. Essa redundância garantiu que a capacidade de check-in nunca fosse perdida devido a problemas técnicos com a animação.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Uma interface CMS mostrando o upload de QR animado com imagem estática substituta configurada',
          caption: 'Configuração do Signage CMS: primário animado com fallback estático garantindo que a capacidade de check-in nunca seja interrompida',
        },
      ],
    },
    {
      heading: 'Impacto medido',
      paragraphs: ['Após um mês de operação, a adoção do check-in QR aumentou de 15% para 24% – uma melhoria relativa de 60%. Pesquisas de feedback dos hóspedes indicaram que o QR animado era mais fácil de notar e parecia mais moderno. Os tempos de fila no balcão diminuíram de forma mensurável durante os períodos de pico, à medida que mais hóspedes se autoatendiam por meio do QR.', 'É importante ressaltar que foram relatadas zero falhas de verificação, apesar de milhares de verificações diárias. A abordagem conservadora da animação atingiu o objetivo de atenção sem sacrificar a confiabilidade exigida pelo fluxo de check-in. Posteriormente, o lounge lançou QRs animados semelhantes em outros locais.', 'Consulte o guia de aprendizagem sobre códigos QR animados para sinalização digital para conhecer os princípios técnicos por trás do design seguro de animação.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Um painel que mostra o aumento da taxa de adoção, a redução do tempo de fila e a confiabilidade da verificação sem falhas durante o período de implantação',
          caption: 'Um mês de dados: aumento de 60% na adoção, tempos de fila reduzidos e manutenção de confiabilidade de verificação perfeita',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Procure artigos do Aprenda',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Estudo de caso: Campanha QR de lançamento global de produto',
      paragraphs: ['Este exemplo segue uma empresa de produtos eletrônicos de consumo que lança um novo produto simultaneamente em 12 mercados em 8 idiomas. Cada equipe de marketing regional precisava produzir embalagens, displays de varejo e materiais promocionais com códigos QR vinculados a páginas de produtos localizadas. Os lançamentos anteriores resultaram em estilos QR inconsistentes, falhas ocasionais de digitalização e um jogo telefônico de desvio de configuração à medida que cada equipe recriava códigos a partir de capturas de tela.', 'A solução aproveitou os links de configuração compartilháveis do ANQR para estabelecer uma única fonte de verdade que cada equipe regional pudesse acessar, independentemente do idioma da interface. A carga QR usava um redirecionamento inteligente que detectava o idioma do usuário, de modo que um código funcionava globalmente enquanto proporcionava experiências localizadas.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Um mapa mundial mostrando 12 locais de mercado com códigos QR, alguns visualmente inconsistentes entre si',
          caption: 'O desafio: 12 mercados, 8 idiomas e um histórico de implementações de QR inconsistentes entre regiões',
        },
      ],
    },
    {
      heading: 'Estabelecendo a configuração mestre',
      paragraphs: ['A equipe global da marca criou a configuração QR confiável no ANQR: cores da marca combinando com a identidade visual da linha de produtos, correção de erros H para confiabilidade em todas as aplicações impressas e digitais e estilo que seria reproduzido de forma consistente, independentemente dos métodos de produção locais. A configuração foi bloqueada e o link de compartilhamento documentado no resumo da campanha global.', 'Criticamente, o URL codificado usava um serviço de redirecionamento com detecção de idioma. Quando verificados, os usuários foram automaticamente direcionados para a página do produto no idioma local. Isso significava que todos os 12 mercados poderiam usar códigos QR idênticos – sem variações de carga útil por mercado que pudessem introduzir erros.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'A interface ANQR mostrando a configuração mestre com as cores da marca, ECC H e o URL de redirecionamento inteligente',
          caption: 'A configuração mestre: padrões de marca globais codificados em uma fonte de verdade única e compartilhável',
        },
      ],
    },
    {
      heading: 'Fluxo de trabalho da equipe regional',
      paragraphs: ['Cada equipe regional de marketing recebeu o link de configuração com instruções simples: abrir o link, verificar se a visualização corresponde às diretrizes da marca, exportar no formato necessário para sua aplicação. A interface ANQR era exibida no idioma preferido de cada equipe, mas as configurações QR subjacentes permaneciam idênticas, independentemente do idioma da interface.', 'Quando a equipe japonesa precisou de SVG para displays de varejo de alto padrão e a equipe brasileira precisou de PNG para mídias sociais, ambos exportaram a partir da mesma configuração. Quando o fornecedor de impressão da equipe alemã solicitava valores de cores específicos, eles podiam consultar a configuração diretamente, em vez de adivinhar por meio de uma captura de tela.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Capturas de tela mostrando o mesmo link de configuração aberto nas interfaces em japonês, português e alemão',
          caption: 'Mesma configuração, interfaces diferentes: as equipes regionais trabalham no idioma de sua preferência, mantendo a consistência global',
        },
      ],
    },
    {
      heading: 'Lidando com variações regionais',
      paragraphs: ['Alguns mercados necessitaram de pequenas adaptações. A equipe chinesa precisava de uma versão com estrutura otimizada para WeChat para compartilhamento social. Em vez de modificar o mestre, eles criaram uma variante documentada com seu próprio link de configuração, claramente rotulada como variante CN-WeChat na biblioteca de ativos da campanha. Isto manteve a rastreabilidade, ao mesmo tempo que permitiu a localização necessária.', 'A equipe da marca estabeleceu uma regra simples: qualquer variação do master exigia um novo link de configuração documentado. Nenhuma modificação nos arquivos exportados, nenhuma solução rápida no software de design. Isso evitou o desvio de configuração que afetou os lançamentos anteriores.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Uma interface de biblioteca de ativos mostrando a configuração mestre e as variantes regionais aprovadas, cada uma com seu próprio link',
          caption: 'Governança de ativos de campanha: configuração mestre e variantes documentadas, todas rastreáveis por meio de links de configuração',
        },
      ],
    },
    {
      heading: 'Resultados do lançamento',
      paragraphs: ['O dia do lançamento do produto viu códigos QR implantados em embalagens, displays de varejo, materiais de eventos e campanhas digitais em todos os 12 mercados simultaneamente. As auditorias de qualidade confirmaram a consistência visual entre regiões - o QR nas vitrines de varejo de Tóquio correspondia ao QR nas embalagens de São Paulo e ao QR nos banners dos eventos em Berlim.', 'Nenhuma falha de digitalização foi relatada em todos os mercados. Quando era necessária uma alteração no URL da página do produto pós-lançamento, o serviço de redirecionamento tratava disso de forma invisível - sem necessidade de reimpressão. A equipe global estimou que a abordagem do link de configuração economizou mais de 40 horas de tempo de coordenação em comparação com a metodologia de lançamento anterior.', 'Consulte o guia de aprendizagem sobre colaboração QR multilíngue para conhecer os princípios de fluxo de trabalho por trás da consistência da campanha global.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Uma grade de fotografias mostrando a implantação consistente de QR em diferentes mercados: varejo em Tóquio, embalagens em São Paulo, eventos em Berlim',
          caption: 'Consistência global alcançada: apresentação QR idêntica em 12 mercados, apesar de diferentes idiomas, fornecedores e formatos',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Procure artigos do Aprenda',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Procure artigos do Aprenda', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Abra o Guia do usuário completo', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abra a galeria', type: 'gallery' },
  ],
};
