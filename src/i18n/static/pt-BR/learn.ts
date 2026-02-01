import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Aprenda com ANQR',
  description: 'Guias práticos e inovadores para transformar códigos QR em verdadeiros ativos de marketing - não apenas em quadrados funcionais. Aprenda como atualizar códigos de ponto de venda legados, criar sinalização QR de pagamento compatível, preparar exportações prontas para impressão, usar animações com segurança em displays digitais e compartilhar configurações bloqueadas entre equipes multilíngues usando links ANQR ("âncora").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra o gerador', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Veja exemplos de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Abra o Guia do usuário completo', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Melhorando campanhas QR existentes',
      paragraphs: ['A maioria das empresas possui códigos QR espalhados por suas operações – em cardápios, balcões, embalagens e materiais promocionais. Muitos desses códigos foram criados anos atrás com geradores básicos, resultando em quadrados genéricos em preto e branco que não inspiram confiança ou não combinam com a identidade de sua marca. Este guia abrangente orienta você em uma abordagem sistemática para auditar, atualizar e otimizar sua infraestrutura de QR existente sem interromper as jornadas do cliente que você já estabeleceu.', 'A vantagem estratégica de atualizar em vez de substituir os seus códigos QR reside na preservação da continuidade. Seus clientes já aprenderam a esperar determinados destinos ao ler seus códigos. Ao manter os URLs codificados idênticos e ao mesmo tempo melhorar drasticamente a apresentação visual, a confiabilidade da digitalização e o alinhamento da marca, você cria uma transição perfeita que aumenta a confiança sem exigir quaisquer alterações em sua infraestrutura digital ou rastreamento analítico.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Uma comparação lado a lado mostrando um código QR genérico desbotado ao lado de uma versão moderna de marca que codifica o mesmo URL',
          caption: 'Antes e depois: o mesmo URL de destino transformado de um código genérico desatualizado em um ativo de marca profissional',
        },
      ],
    },
    {
      heading: 'Por que os códigos QR legados apresentam baixo desempenho',
      paragraphs: ['Os códigos QR criados durante a fase de adoção inicial - especialmente durante 2020-2021, quando as empresas se apressaram a implementar soluções sem contacto - sofrem frequentemente de vários problemas críticos. Configurações baixas de correção de erros os tornam frágeis quando impressos em superfícies texturizadas ou visualizados sob iluminação desafiadora. Zonas silenciosas insuficientes causam falhas na leitura quando os códigos são colocados perto de outros elementos visuais. O estilo genérico não comunica a legitimidade da marca, levando à hesitação e à redução das taxas de digitalização.', 'Além das limitações técnicas, os códigos legados muitas vezes representam oportunidades perdidas de branding. Cada código QR é um ponto de contato com seu cliente – um momento em que ele está ativamente engajado e disposto a agir. Um código com estilo profissional que corresponda às cores da sua marca, inclua margens de segurança adequadas e apresente elementos opcionais da marca transforma esse utilitário em um ativo de marketing que reforça sua identidade em cada interação.'],
    },
    {
      heading: 'Conduzindo uma auditoria de código QR',
      paragraphs: ['Comece seu projeto de atualização criando um inventário abrangente de cada código QR atualmente implantado em sua empresa. Documente a localização física, o destino codificado, a condição atual do material impresso e o ambiente típico de digitalização, incluindo condições de iluminação e ângulos de visão. Teste cada código com vários dispositivos – smartphones mais antigos e dispositivos econômicos geralmente revelam problemas de confiabilidade que os telefones premium mascaram.', 'Preste atenção especial aos códigos em locais de alto risco: pontos de pagamento, áreas de check-in e displays promocionais onde falhas na leitura impactam diretamente a receita ou a experiência do cliente. Estes devem ser priorizados para atualização imediata. Observe também os códigos que aparecem no conteúdo de fotografia ou vídeo, pois eles exigirão coordenação com sua equipe de marketing para atualizar os recursos visuais.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Uma interface de lista de verificação mostrando categorias de auditoria QR: localização, condição, confiabilidade da verificação e classificação de prioridade',
          caption: 'Modelo de auditoria QR sistemática para documentar e priorizar seus candidatos a atualização',
        },
      ],
    },
    {
      heading: 'A estratégia de atualização segura',
      paragraphs: ['A regra fundamental das atualizações de QR é a preservação do destino. Extraia o URL exato de cada código existente e codifique-o de forma idêntica em sua nova versão. Isso garante que todas as análises existentes, lógica de redirecionamento e expectativas do cliente permaneçam intactas. Se você precisar de flexibilidade de destino para atualizações futuras, este é o momento ideal para introduzir um URL curto de marca ou serviço de redirecionamento - mas implemente isso como um projeto separado para evitar alterações complicadas.', 'Para a atualização visual, aplique melhorias nas camadas: primeiro garanta a confiabilidade técnica (correção de erros apropriada e zona silenciosa), depois adicione estilo de marca (cores, formatos de módulo) e, finalmente, considere melhorias opcionais (sobreposições centrais, molduras). Cada camada deve ser validada por meio de testes antes de prosseguir. O Modo de Segurança do ANQR ajuda a reforçar essas prioridades, alertando quando as escolhas de estilo podem comprometer a capacidade de leitura.'],
    },
    {
      heading: 'Adicionando identidade de marca sem comprometer a confiabilidade',
      paragraphs: ['A marca QR eficaz equilibra o impacto visual com a confiabilidade da leitura. Comece com a cor: substitua o primeiro plano preto padrão pela cor primária da sua marca, garantindo contraste suficiente em relação ao fundo. Para a maioria das marcas, cores escuras em fundos claros funcionam melhor. Evite combinações de baixo contraste, gradientes que reduzam a clareza das bordas ou cores que pareçam semelhantes em condições comuns de iluminação.', 'A personalização do formato do módulo oferece outra oportunidade de marca com impacto mínimo na confiabilidade. Módulos arredondados criam uma aparência mais suave e acessível, mantendo excelente capacidade de leitura. Módulos estilo ponto funcionam bem para marcas modernas e avançadas em tecnologia. Módulos conectados atendem a identidades industriais ou corporativas. Seja qual for o estilo que você escolher, mantenha a consistência em todas as suas implantações de QR para reconhecimento instantâneo da marca.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Um diagrama de roda de cores mostrando combinações ideais de cores QR com indicadores de taxa de contraste',
          caption: 'Guia de seleção de cores da marca mostrando combinações de alto contraste que mantêm a confiabilidade da digitalização',
        },
      ],
    },
    {
      heading: 'Protocolo de Teste e Validação',
      paragraphs: ['Nunca implante códigos QR atualizados sem testes rigorosos. Imprima uma prova física no tamanho exato e no mesmo material da sua implantação final. Teste no local real onde o código ficará, em diferentes horários do dia para levar em conta as variações de iluminação. Use pelo menos três dispositivos diferentes: um telefone principal atual, um dispositivo intermediário e um smartphone mais antigo ou econômico.', 'Registre os tempos de varredura e as taxas de sucesso para cada teste. Um código bem otimizado deve ser verificado em 1 a 2 segundos em qualquer dispositivo razoavelmente moderno. Se você estiver vendo atrasos ou falhas consistentes, reduza a intensidade do estilo - remova ou reduza as sobreposições, aumente o tamanho da zona silenciosa ou mude para um nível de correção de erros mais alto. A confiabilidade sempre tem precedência sobre a sofisticação visual.'],
    },
    {
      heading: 'Bloqueando sua configuração para consistência',
      paragraphs: ['Depois de validar uma configuração ideal, preserve-a usando os links compartilháveis do ANQR. Isso cria um registro permanente de todas as configurações usadas para gerar seu código aprovado – cores, estilo de módulo, correção de erros, dimensionamento e quaisquer sobreposições. Compartilhe este link com sua equipe de design, fornecedores de impressão e qualquer pessoa que possa precisar reproduzir o código no futuro.', 'Esse bloqueio de configuração evita a degradação gradual que afeta muitas implantações de QR. Sem ele, os membros da equipe recriam códigos a partir de capturas de tela, os designers reconstroem as configurações da memória e os fornecedores de impressão fazem ajustes úteis. Cada variação apresenta problemas potenciais. Com um link de configuração bloqueado, cada reprodução é idêntica ao original testado e aprovado.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Um diagrama mostrando desvios de configuração: capturas de tela que levam a recriações que levam a variantes, versus um único link de fonte da verdade',
          caption: 'Evite desvios de configuração estabelecendo uma única fonte autorizada para todas as reproduções de QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Veja exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Códigos QR para pagamentos de varejo',
      paragraphs: ['Os códigos QR de pagamento operam no ambiente mais exigente do varejo: o momento da transação. Os clientes estão prontos para pagar, muitas vezes com uma fila se formando atrás deles, e cada segundo de atraso cria atrito. No entanto, este momento de alta pressão também é um terreno privilegiado para o reforço da marca. Este guia explica como criar códigos QR de pagamento que podem ser lidos instantaneamente em aplicativos bancários e, ao mesmo tempo, apresentar uma aparência profissional de marca que constrói a confiança do cliente.', 'O princípio fundamental para códigos QR de pagamento é a confiabilidade acima da estética. Um código lindamente projetado que não consegue ser lido no aplicativo bancário de um cliente custará muito mais em transações abandonadas e clientes frustrados do que um design conservador jamais custaria. Comece com conformidade, adicione confiabilidade e, em seguida, aplique cuidadosamente a marca apenas onde ela não comprometer a função principal.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Um display de balcão de varejo mostrando um código QR de pagamento sendo lido por um smartphone com um aplicativo bancário',
          caption: 'Os códigos QR de pagamento devem funcionar instantaneamente com aplicativos bancários e de carteira sob condições contrárias do mundo real',
        },
      ],
    },
    {
      heading: 'Compreendendo os padrões QR de pagamento',
      paragraphs: ['Os códigos QR de pagamento normalmente seguem padrões regionais que determinam o formato da carga útil. Em Cingapura, PayNow QR usa formatação específica. Na Índia, os códigos UPI seguem os padrões BharatQR ou UPI deep link. Os pagamentos SEPA europeus utilizam códigos QR EPC. Cada padrão existe para garantir que os aplicativos bancários possam reconhecer e processar instantaneamente as informações de pagamento. Desviar-se desses padrões - mesmo que ligeiramente - pode fazer com que os aplicativos de pagamento rejeitem códigos que os scanners genéricos de câmeras leem sem problemas.', 'ANQR inclui modelos para os principais padrões de pagamento que formatam automaticamente os detalhes do seu comerciante em cargas compatíveis. Sempre use esses modelos em vez de construir manualmente sequências de pagamento, pois mesmo pequenos erros de formatação podem causar falhas nas transações. Se o padrão de pagamento da sua região não estiver disponível como modelo, consulte a documentação técnica do seu provedor de pagamento para obter os requisitos exatos de formatação.'],
    },
    {
      heading: 'Dimensionamento e posicionamento para displays de balcão',
      paragraphs: ['Os códigos QR de bancada enfrentam desafios físicos únicos. Os clientes examinam com o braço estendido, muitas vezes em ângulo, às vezes através de protetores contra espirros ou vitrines. A iluminação suspensa cria pontos ofuscantes. O código compete com outras contra-organizações por atenção e linhas de visão claras. Dimensione seu QR de pagamento generosamente - um mínimo de 4-5 cm é recomendado para a maioria das aplicações de balcão, aumentando se o código estiver atrás de um vidro ou em uma área pouco iluminada.', 'A posição é tão importante quanto o tamanho. Coloque o código onde os clientes possam segurar confortavelmente o telefone, sem bloquear a fila ou alcançá-lo de maneira inadequada. Incline a tela em direção ao cliente, em vez de colocá-la na horizontal. Se possível, use laminação fosca ou materiais de exibição não refletivos para minimizar o brilho da iluminação superior. Teste o posicionamento final em diferentes horários do dia para detectar problemas de iluminação.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Um diagrama mostrando alturas e ângulos ideais de posicionamento de QR para diferentes configurações de contador',
          caption: 'Guia de posicionamento do balcão: alturas, ângulos e distâncias ideais para uma digitalização confiável de pagamentos',
        },
      ],
    },
    {
      heading: 'Marca conservadora para códigos de pagamento',
      paragraphs: ['Os aplicativos de pagamento são menos tolerantes do que os scanners de câmera genéricos. Muitos aplicativos bancários usam algoritmos de leitura QR mais antigos e simples, otimizados para velocidade em vez de flexibilidade. Isso significa que o estilo que funciona perfeitamente com a câmera do telefone pode falhar em aplicativos de pagamento específicos. Mantenha a marca conservadora: use a cor da sua marca em primeiro plano se ela mantiver forte contraste, mas evite gradientes, sobreposições pesadas ou elementos decorativos que possam interferir no reconhecimento.', 'Se você quiser um logotipo central ou sobreposição, mantenha-o extremamente pequeno - não mais do que 10-15% da área QR - e teste extensivamente com todos os aplicativos de pagamento que seus clientes possam usar. Muitas empresas optam especificamente por não sobrepor códigos de pagamento, reservando esse estilo para códigos QR de marketing, onde os requisitos de confiabilidade são menos rigorosos. A função do código de pagamento é processar transações, não impressionar visualmente.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Uma comparação mostrando níveis de marca aceitáveis e arriscados para códigos QR de pagamento',
          caption: 'Espectro da marca QR de pagamento: do estilo conservador seguro às abordagens decorativas arriscadas',
        },
      ],
    },
    {
      heading: 'Considerações sobre materiais e impressão',
      paragraphs: ['O material físico de exibição impacta significativamente a confiabilidade da digitalização. A laminação brilhante reflete as luzes do teto diretamente na câmera do cliente. Materiais texturizados podem distorcer as bordas do módulo. A impressão barata pode desfocar detalhes finos. Para códigos QR de pagamento, invista em qualidade: use laminação fosca ou acetinada, garanta impressão em alta resolução e substitua os displays antes que apresentem desgaste. Um código de pagamento riscado ou desbotado custa transações.', 'Considere a durabilidade e a capacidade de substituição da tela. Os displays dos contadores são tocados, movidos, respingados e ocasionalmente derrubados. Projete seu sistema de exibição de forma que o inserto QR possa ser facilmente substituído sem substituir todo o suporte. Mantenha as impressões sobressalentes prontas, geradas a partir do seu link de configuração bloqueado, para que os códigos usados ​​possam ser trocados imediatamente.'],
    },
    {
      heading: 'Testando com aplicativos de pagamento reais',
      paragraphs: ['Os scanners de câmera genéricos decodificarão quase qualquer código QR razoavelmente formatado. Os aplicativos de pagamento são mais exigentes. Antes de implantar qualquer código QR de pagamento, teste-o com todos os aplicativos de pagamento que seus clientes possam usar. Em ambientes de múltiplos pagamentos, isso pode significar testes com vários aplicativos bancários, carteiras digitais e plataformas de pagamento. Documente quais aplicativos você testou e suas versões: os aplicativos de pagamento são atualizados com frequência e uma atualização pode alterar o comportamento de verificação.', 'Teste em condições realistas: a exibição real, a iluminação real, a distância real de digitalização. Um código que é lido instantaneamente em sua mesa pode ter problemas no balcão às 17h, quando o sol da tarde cria brilho. Teste com o smartphone mais antigo e mais barato que puder encontrar - se funcionar de maneira confiável em um dispositivo econômico, funcionará em tudo. Sinalize qualquer tempo de verificação superior a 2 segundos para investigação e possível redesenho.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Uma lista de verificação de testes mostrando vários aplicativos de pagamento, tipos de dispositivos e condições ambientais a serem verificadas',
          caption: 'Matriz abrangente de testes QR de pagamento, abrangendo aplicativos, dispositivos e fatores ambientais',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Veja exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Códigos QR prontos para impressão: SVG vs PNG',
      paragraphs: ['A diferença entre um código QR que é lido perfeitamente e outro que falha geralmente se resume à forma como ele foi exportado e tratado no fluxo de trabalho de impressão. Este guia explica as distinções críticas entre os formatos vetorial (SVG) e raster (PNG), quando usar cada um e como entregar arte QR a designers e fornecedores de impressão de maneira a preservar a confiabilidade da digitalização, desde cartões de visita até sinalização do tamanho de outdoors.', 'A produção de impressão introduz variáveis que não existem na tela: dispersão da tinta, textura do substrato, processos de acabamento e o efeito cumulativo de múltiplas conversões de arquivos. Um código QR que parece perfeito em seu software de design pode sair da impressora com bordas suavizadas, contraste reduzido ou módulos sutilmente distorcidos. Compreender a seleção de formatos e as melhores práticas de fluxo de trabalho evita essas falhas silenciosas.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Uma visualização ampliada comparando módulos QR vetoriais com bordas nítidas versus módulos raster mostrando artefatos de pixel',
          caption: 'Vetor versus raster em escala de impressão: a diferença de precisão que determina a confiabilidade da digitalização',
        },
      ],
    },
    {
      heading: 'Por que o vetor (SVG) é preferido para impressão',
      paragraphs: ['Os arquivos SVG descrevem os códigos QR como formas matemáticas, em vez de grades de pixels. Isto significa que o código pode ser dimensionado para qualquer tamanho - desde uma etiqueta de 1 cm até um banner de 10 metros - sem qualquer perda de nitidez das bordas. O RIP (Raster Image Processor) da impressora renderiza os vetores na resolução nativa do dispositivo de saída, garantindo que cada borda do módulo seja tão nítida quanto o hardware permitir. Não há interpolação, nem artefatos de anti-aliasing, nem desfoque acumulado devido a múltiplas operações de redimensionamento.', 'Além da escalabilidade, os arquivos SVG são mais robustos em fluxos de trabalho profissionais. Eles sobrevivem às viagens de ida e volta através do software de design sem degradação. Eles podem ser corrigidos por cores sem nova amostragem. Eles são incorporados de forma limpa em arquivos PDF para saída pronta para impressão. Para qualquer aplicação de impressão onde a qualidade é importante, o SVG deve ser o formato de exportação padrão.'],
    },
    {
      heading: 'Quando PNG é aceitável',
      paragraphs: ['PNG se torna necessário quando seu fluxo de trabalho ou plataforma de destino não suporta formatos vetoriais. Algumas plataformas web, sistemas CMS de sinalização e fluxos de trabalho de impressão legados exigem imagens rasterizadas. Nesses casos, o PNG pode funcionar bem - mas apenas se você seguir regras rígidas: exportar no tamanho e resolução físicos finais, nunca aumentar a escala após a exportação e evitar qualquer compactação com perdas ou conversão de formato.', 'A regra crítica para PNG é calcular as dimensões de pixel necessárias antes de exportar. Se o seu QR imprimir a 5 cm e a sua impressora operar a 300 DPI, você precisará de aproximadamente 590 pixels. Exporte neste tamanho ou maior e, em seguida, reduza se necessário - nunca aumente. Inclua essas informações no nome do arquivo ou nos metadados para que futuros usuários não utilizem indevidamente uma exportação de tamanho específico.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Uma interface de calculadora mostrando a relação entre tamanho físico, DPI e dimensões de pixel necessárias',
          caption: 'Calculadora de resolução de impressão: determinando as dimensões mínimas em pixels para o tamanho de saída desejado',
        },
      ],
    },
    {
      heading: 'Opções de exportação ANQR explicadas',
      paragraphs: ['ANQR oferece vários modos de exportação SVG para atender a diferentes fluxos de trabalho. O modo True Vector produz saída pura baseada em caminho, ideal para ferramentas de impressão e design profissional. Quando você adiciona sobreposições rasterizadas ou determinados efeitos, o ANQR pode incorporá-los enquanto mantém módulos vetoriais, ou você pode exportar uma versão totalmente rasterizada na resolução especificada. Compreender essas opções ajuda você a escolher a exportação certa para cada caso de uso.', 'Para exportações PNG, ANQR permite especificar dimensões exatas e inclui opções para fundos transparentes. A configuração de DPI ajuda a calcular os tamanhos apropriados para impressão, mas lembre-se de que DPI são metadados - o que importa para a impressão é ter pixels suficientes para o seu tamanho físico. Na dúvida, exporte mais do que você acha que precisa; reduzir preserva a qualidade, enquanto aumentar a destrói.'],
    },
    {
      heading: 'Preparando arquivos para transferência',
      paragraphs: ['Ao passar arte QR para designers ou fornecedores de impressão, inclua especificações claras: o tamanho físico pretendido, requisitos mínimos de zona silenciosa e quaisquer considerações sobre espaço de cores. Para aplicativos críticos, forneça um mestre SVG e um backup PNG de alta resolução, claramente identificados com os usos pretendidos. Inclua seu link de configuração ANQR para que o código possa ser regenerado, se necessário.', 'Antecipe erros comuns no processo de transferência. Declare explicitamente que o QR não deve ser dimensionado, girado, distorcido ou ter efeitos aplicados. Especifique que a zona silenciosa deve permanecer limpa - sem marcas de corte, marcas de registro ou elementos de design intrusivos. Se o QR for colocado sobre fundo colorido ou fotográfico, forneça uma versão com formato de fundo opaco para garantir contraste adequado.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Um diagrama de pacote de arquivos mostrando SVG mestre, backup PNG, documento de especificações e link de configuração',
          caption: 'Pacote profissional de transferência de QR: tudo o que um designer ou fornecedor de impressão precisa para uma reprodução precisa',
        },
      ],
    },
    {
      heading: 'Verificando provas de impressão',
      paragraphs: ['Nunca aprove uma tiragem sem digitalizar uma prova física. Solicite uma prova impressa no próprio substrato com o próprio acabamento que será utilizado na produção. Digitalize a prova sob condições de iluminação semelhantes às de onde a peça final será exibida. Teste com vários dispositivos, incluindo smartphones mais antigos que podem apresentar problemas de qualidade marginal.', 'Se a prova for digitalizada de forma lenta ou inconsistente, investigue antes de aprovar. Problemas comuns incluem contraste insuficiente em substratos coloridos, violações da zona silenciosa devido ao corte, espalhamento de tinta, suavizando as bordas do módulo ou laminação criando brilho. Qualquer um deles pode ser resolvido antes de iniciar uma tiragem completa - mas somente se você os detectar na fase de prova.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Uma lista de verificação de revisão de provas com resultados de testes de digitalização, medições de contraste e assinaturas de aprovação',
          caption: 'Fluxo de trabalho de verificação de provas de impressão: testes sistemáticos antes de comprometer-se com as quantidades de produção',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Veja exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Criação de códigos QR animados',
      paragraphs: ['Os códigos QR animados combinam a funcionalidade dos códigos QR padrão com movimentos atraentes que aumentam drasticamente as taxas de engajamento. Em sinalização digital, mídias sociais e exibições interativas, a animação transforma uma utilidade estática em um elemento visual atraente que atrai a atenção e convida à interação. Este guia aborda os princípios, técnicas e restrições práticas da criação de códigos QR animados que podem ser lidos de maneira confiável e, ao mesmo tempo, causar impacto visual.', 'O desafio fundamental dos códigos QR animados é equilibrar o interesse visual e a confiabilidade da leitura. Cada quadro deve ser escaneável individualmente - um scanner pode capturar o código em qualquer ponto do ciclo de animação. Essa restrição molda todas as decisões de design: quais elementos podem se mover, o quanto podem mudar e o que deve permanecer estável durante toda a animação.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Um display de sinalização digital mostrando um código QR animado que captura a atenção do espectador em um espaço público',
          caption: 'Códigos QR animados em sinalização digital: movimento que atrai a atenção e incentiva a digitalização',
        },
      ],
    },
    {
      heading: 'Como a animação afeta a capacidade de digitalização',
      paragraphs: ['Os scanners QR funcionam capturando um único quadro e analisando o padrão dos módulos claros e escuros. Para que um código animado funcione, cada quadro deve conter o padrão QR completo e válido. Isso exclui animações que transformam a estrutura do código, dissolvem módulos ou alteram significativamente o padrão de contraste. Os módulos de transporte de dados – o padrão aparentemente aleatório no centro – devem permanecer visualmente estáveis ​​o tempo todo.', 'As abordagens de animação segura modificam elementos que não carregam dados: planos de fundo, cores, molduras decorativas e elementos de sobreposição. Os componentes estruturais – padrões de localização (os quadrados de canto grandes), padrões de temporização (as linhas alternadas) e padrões de alinhamento (quadrados menores em códigos maiores) – devem manter suas posições e proporções. Trabalhar dentro dessas restrições ainda permite animações surpreendentemente dinâmicas e envolventes.'],
    },
    {
      heading: 'Técnicas de animação que funcionam',
      paragraphs: ['O ciclo de cores anima as cores de primeiro plano e de fundo através de uma paleta, mantendo contraste suficiente em cada etapa. Isto cria um efeito vibrante e chamativo com risco mínimo de digitalização - desde que o contraste nunca caia abaixo dos níveis legíveis. As predefinições do ciclo de cores do ANQR são projetadas para manter a capacidade de digitalização durante todo o ciclo.', 'As sobreposições animadas colocam imagens em movimento atrás de um padrão QR semitransparente. O código permanece estável enquanto o plano de fundo é animado - talvez um vídeo em loop, elementos de marca animados ou gráficos em movimento abstratos. Esta técnica requer um gerenciamento cuidadoso da intensidade para evitar que o fundo sobrecarregue o padrão QR, mas cria resultados visualmente mais impressionantes.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Um diagrama mostrando a estrutura em camadas de um QR animado: camada de código estável sobre camada de fundo animada',
          caption: 'Princípio de camadas de animação: o padrão QR permanece constante enquanto os elementos de fundo são animados abaixo',
        },
      ],
    },
    {
      heading: 'Configurando parâmetros de animação',
      paragraphs: ['A taxa de quadros afeta a suavidade visual e o tamanho do arquivo. Para a maioria das aplicações, 10 a 15 quadros por segundo proporcionam um movimento suave sem tamanhos de arquivo excessivos. Taxas de quadros mais altas oferecem retornos visuais decrescentes e aumentam significativamente o tamanho dos arquivos. Considere o seu contexto de entrega: um grande sinal digital pode lidar com arquivos maiores do que um posicionamento de anúncio para celular.', 'O comportamento do loop determina como a animação circula. Loops contínuos criam movimento contínuo, ideal para sinalização e exibições ambientais. Loops de pingue-pongue (avançar e retroceder) funcionam bem para animações simples. Para pulsos que chamam a atenção, considere animações com retenções - períodos de quietude pontuados por movimentos que chamam a atenção sem fadiga constante.'],
    },
    {
      heading: 'Criando sobreposições animadas',
      paragraphs: ['Ao usar imagens animadas (GIFs, WebPs animados ou vídeo) como sobreposições, o ANQR extrai quadros e os compõe com seu código QR. A configuração de intensidade de sobreposição controla quanto da animação é exibida - valores mais baixos priorizam a capacidade de digitalização, enquanto valores mais altos favorecem o impacto visual. Teste a intensidade escolhida em vários quadros para garantir uma leitura consistente.', 'A qualidade do material de origem impacta significativamente os resultados. Use sobreposições com assuntos claros e bom contraste. Evite animações de origem com intermitência rápida ou alterações extremas de brilho que possam criar quadros ocasionais de baixo contraste. Visualize o ciclo completo da animação antes de exportar para capturar quaisquer quadros problemáticos que possam falhar na digitalização.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Uma visualização quadro a quadro de uma sobreposição animada mostrando os níveis de contraste mantidos em toda a sequência',
          caption: 'Análise de quadros: verificando a escaneabilidade consistente em todo o ciclo de animação',
        },
      ],
    },
    {
      heading: 'Considerações sobre exportação e entrega',
      paragraphs: ['GIF continua sendo o formato animado mais amplamente suportado, sendo reproduzido automaticamente na maioria dos contextos sem exigir suporte de player de vídeo. No entanto, a paleta de 256 cores do GIF limita a fidelidade das cores. Para animações com cores críticas, considere WebP animado quando houver suporte ou recorra a formatos de vídeo para obter a mais alta qualidade. A exportação GIF do ANQR inclui opções de pontilhamento para maximizar a qualidade dentro das limitações da paleta.', 'O tamanho do arquivo é importante para a entrega. Sistemas de sinalização digital, clientes de e-mail e plataformas sociais muitas vezes impõem limites de tamanho. Se sua animação exceder esses limites, reduza a contagem de quadros, as dimensões ou a profundidade de cores. Às vezes, dividir uma animação complexa em um loop mais curto obtém melhores resultados do que a compactação agressiva que degrada cada quadro.'],
    },
    {
      heading: 'Testando códigos QR animados',
      paragraphs: ['Testar códigos animados requer digitalização em vários pontos do ciclo de animação. Não faça a varredura apenas uma vez e presuma que foi bem-sucedido - faça a varredura repetidamente, em momentos diferentes, para verificar se cada quadro é legível. Preste atenção especial aos quadros nos extremos do ciclo de cores ou aos picos de intensidade de sobreposição onde o contraste pode ser mais baixo.', 'Teste no hardware de exibição real sempre que possível. A calibração de cores do monitor, o ângulo de visão e a iluminação ambiente afetam a forma como a animação aparece e é digitalizada. Uma animação brilhante que seja digitalizada perfeitamente em seu monitor pode desaparecer em uma tela externa ou tornar-se ilegível em ângulos de visão oblíquos.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Uma matriz de testes que mostra taxas de sucesso de varredura em diferentes frames, dispositivos e condições de exibição',
          caption: 'Protocolo de teste QR animado: verificação sistemática em frames, dispositivos e condições de visualização',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Veja exemplos de QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Práticas recomendadas de segurança e conformidade de QR',
      paragraphs: ['Um código QR lindamente projetado que não consegue ser lido é pior do que inútil – ele frustra os clientes, prejudica a percepção da marca e desperdiça todos os recursos investidos em sua criação e distribuição. Este guia aborda os fatores técnicos e práticos que determinam se um código QR será lido de forma confiável e como usar os recursos de segurança do ANQR para detectar possíveis problemas antes que eles cheguem à produção.', 'A confiabilidade do código QR não é binária. Um código pode ser lido perfeitamente em telefones principais, mas falhar em dispositivos econômicos. Pode funcionar com iluminação ideal, mas ter problemas em restaurantes escuros ou sob luz solar intensa. Compreender os fatores que afetam a capacidade de digitalização ajuda você a fazer escolhas informadas entre o estilo visual e a confiabilidade no mundo real.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Um espectro de confiabilidade mostrando códigos QR que variam de altamente digitalizáveis a marginalmente legíveis',
          caption: 'O espectro da capacidade de leitura: de códigos à prova de balas a estilos que ultrapassam os limites de confiabilidade',
        },
      ],
    },
    {
      heading: 'Compreendendo os níveis de correção de erros',
      paragraphs: ['Os códigos QR incluem redundância integrada que permite que sejam lidos mesmo quando parcialmente danificados ou obscurecidos. O nível de correção de erros - L (7%), M (15%), Q (25%) ou H (30%) - determina quanto do código pode estar faltando enquanto ainda é decodificado corretamente. Uma maior correção de erros cria códigos maiores, mas fornece uma margem de segurança para sobreposições, imperfeições de impressão e danos ambientais.', 'Para códigos com sobreposições de imagens, o nível de correção de erros H é essencial - a sobreposição obscurece fisicamente parte do código e você precisa dessa redundância de 30% para manter a confiabilidade. Para códigos limpos e sem estilo em ambientes controlados, o nível M geralmente é suficiente. O nível L deve ser reservado para situações em que o tamanho do código é criticamente restrito e você pode garantir condições perfeitas.'],
    },
    {
      heading: 'A zona crítica de silêncio',
      paragraphs: ['A zona silenciosa é a margem em branco ao redor de cada código QR. Os scanners usam esse limite para identificar onde o código começa e termina. O padrão ISO especifica uma zona silenciosa mínima de quatro módulos (quatro vezes a largura do menor quadrado do código). A violação desse espaço – com elementos de design, bordas cortadas ou conteúdo adjacente – é uma das causas mais comuns de falhas de digitalização.', 'A aplicação da zona silenciosa do ANQR ajuda a manter esse espaçamento crítico, mas você também deve garantir que ele seja preservado em seus projetos finais. Ao entregar a arte do QR, especifique explicitamente os requisitos da zona silenciosa. Ao colocar códigos em layouts, verifique se nenhum elemento invade esse espaço. Alguns milímetros de espaço livre podem significar a diferença entre uma digitalização confiável e clientes frustrados.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Um diagrama mostrando o espaçamento correto da zona silenciosa versus violações comuns que causam falhas na verificação',
          caption: 'Requisitos de zona silenciosa: a margem invisível que determina o sucesso da verificação',
        },
      ],
    },
    {
      heading: 'Contraste e segurança de cores',
      paragraphs: ['Os scanners QR detectam o padrão de módulos claros e escuros. Qualquer estilo que reduza esse contraste (primeiros planos claros, fundos escuros, efeitos de gradiente ou sobreposições de baixa opacidade) dificulta a leitura do código. ANQR calcula taxas de contraste e avisa quando suas escolhas de cores se aproximam de níveis perigosos, mas o árbitro final é sempre o teste do mundo real.', 'A percepção das cores varia com as condições de iluminação. Uma combinação de cores que pareça de alto contraste no monitor pode ser difícil de distinguir sob iluminação incandescente quente ou lâmpadas fluorescentes frias. Se o seu código for implantado em condições de iluminação variadas, teste sob diversas fontes de luz e considere taxas de contraste mais conservadoras como margem de segurança.'],
    },
    {
      heading: 'Tamanho do módulo e distância de visualização',
      paragraphs: ['O tamanho físico dos módulos individuais determina a distância máxima a partir da qual um código pode ser lido. Módulos menores significam códigos menores, mas exigem distâncias de digitalização mais próximas. A regra geral é que cada módulo deve ter pelo menos 0,5 mm na distância de varredura pretendida, aumentando proporcionalmente para distâncias maiores. Um código em um outdoor precisa de módulos muito maiores do que um código em um cartão de visita.', 'Ao calcular o tamanho do módulo, considere o pior cenário: o cliente com um telefone antigo, com iluminação imperfeita, digitalizando na distância máxima provável. Projete para este usuário e todos os demais terão uma experiência ainda melhor. As recomendações de tamanho da ANQR levam em consideração essas variáveis ​​do mundo real para sugerir dimensões apropriadas para o uso pretendido.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Um gráfico relacionando o tamanho do módulo, as dimensões de impressão e a distância máxima efetiva de digitalização',
          caption: 'Guia de distância de digitalização: combinando o tamanho do módulo com seus requisitos de implantação',
        },
      ],
    },
    {
      heading: 'Usando o modo de segurança ANQR',
      paragraphs: ['O Modo de Segurança do ANQR fornece feedback em tempo real sobre a confiabilidade da varredura. Ele monitora as taxas de contraste, a conformidade da zona silenciosa, a intensidade da sobreposição e outros fatores que afetam a capacidade de digitalização. Quando qualquer parâmetro se aproximar de níveis de risco, você verá avisos com orientações específicas sobre como melhorar a confiabilidade. Para implantações profissionais onde a falha custa caro, mantenha o Modo de segurança ativo durante todo o processo de design.', 'O Modo de segurança também inclui um recurso de verificação de varredura que tenta decodificar o código gerado e relata sucesso ou falha. Embora essa verificação no aplicativo não consiga replicar todas as condições do mundo real, ela detecta muitos problemas comuns antes de você investir em impressão ou distribuição. Trate a verificação bem-sucedida como um padrão mínimo, não como uma garantia – os testes no mundo real continuam sendo essenciais.'],
    },
    {
      heading: 'Protocolos de teste do mundo real',
      paragraphs: ['Nenhuma quantidade de verificação de software substitui os testes físicos. Imprima seu código no tamanho pretendido em material representativo. Teste-o no ambiente de implantação real com condições de iluminação que correspondam ao uso real. Digitalize com vários dispositivos - não apenas com seu telefone principal, mas também com dispositivos Android econômicos, iPhones mais antigos e quaisquer dispositivos específicos que seu público costuma usar.', 'Documente seus testes sistematicamente. Registre quais dispositivos foram testados, sob quais condições e com quais resultados. Se você estiver implantando códigos em escala, estabeleça critérios de aceitação: talvez uma taxa de sucesso de 95% em todo o conjunto de testes de dispositivos ou verificações bem-sucedidas em 2 segundos em todos os dispositivos testados. Esses padrões ajudam a tomar decisões objetivas, em vez de esperar o melhor.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Uma lista de verificação de testes abrangente que abrange dispositivos, condições e critérios de aceitação',
          caption: 'Protocolo de teste de implantação QR: verificação sistemática antes do compromisso de produção',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Abra o gerador',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Veja exemplos de QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Veja exemplos de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Abra o Guia do usuário completo', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Abra a galeria', type: 'gallery' },
  ],
};
