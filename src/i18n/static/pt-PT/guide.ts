import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Guia do usuário ANQR',
  description: 'Guia completo para usar ANQR para criar códigos QR.',
  lastUpdated: '1º de fevereiro de 2026',
  breadcrumb: ['Guia'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra o gerador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Procure artigos do Aprenda', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Veja exemplos de QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Primeiros passos',
      paragraphs: ['ANQR é um gerador de código QR com abordagem que prioriza o cliente. Por padrão, os códigos QR são gerados localmente no seu navegador - não é necessária uma conta e seus dados permanecem privados. Para incorporação profissional, você também pode usar a API do lado do servidor.', 'A interface possui três níveis de interface: Básico, Avançado e Profissional. Selecione seu nível usando as guias no cabeçalho. Cada nível desbloqueia recursos adicionais enquanto mantém a interface focada no que você precisa.'],
      bullets: ['Básico: Criação simples de código QR com conteúdo de texto/URL simples e sobreposição de imagem.', 'Avançado: opções de codificação QR, estilos de renderização, animação, formatos de saída, tipos de conteúdo estendidos e personalização de sobreposição.', 'Profissional: marcas d\'água, metadados, compartilhamento, análise de segurança, códigos QR de pagamento e recursos empresariais.'],
      links: [{ href: '/?lang=${lang}', label: 'Abra o gerador', type: 'generator' }],
    },
    {
      heading: 'Início rápido',
      paragraphs: ['Para criar seu primeiro código QR:'],
      bullets: ['1. Selecione um tipo de conteúdo (URL, texto, WiFi, etc.) no menu suspenso Tipo de conteúdo.', '2. Insira seus dados nos campos fornecidos.', '3. Opcionalmente, personalize cores, estilos e adicione uma imagem de sobreposição.', '4. Clique em Exportar para baixar seu código QR como PNG, GIF, WebP ou SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Recursos básicos',
      paragraphs: ['O nível Básico fornece uma interface simplificada para a criação de códigos QR com conteúdo de carga útil e sobreposições de imagens. Esta é a maneira mais simples de começar.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Tipos de conteúdo (básico)',
      paragraphs: ['Texto Simples: Codifique qualquer texto até o limite de capacidade do código QR. Ideal para mensagens curtas, códigos ou identificadores.', 'URL: codifica endereços da web. O código QR abrirá o URL quando digitalizado. Suporta protocolos http:// e https://.'],
    },
    {
      heading: 'Sobreposição de imagem (básico)',
      paragraphs: ['Carregue uma imagem (JPG, PNG, GIF, WebP) para combinar com seu código QR. Os recursos básicos de sobreposição incluem:'],
      bullets: ['Carregar do arquivo: selecione uma imagem do seu dispositivo.', 'Carregar do URL: insira um URL de imagem (deve permitir CORS).', 'Logotipo central: posiciona a imagem no centro, contando com a correção de erros.', 'Mistura: Mistura alfa simples de imagem com padrão QR.', 'Intensidade: controla a intensidade com que a sobreposição afeta o código QR (0-100%).', 'Modo de cor: colorido, escala de cinza ou preto e branco.', 'Preservar padrões do Finder: mantém os padrões dos cantos inalterados para uma digitalização confiável.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Veja guias e exemplos relacionados', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Recursos avançados',
      paragraphs: ['O nível Avançado desbloqueia opções de codificação QR, estilos de renderização, animação, formatos de saída, tipos de conteúdo estendidos e personalização avançada de sobreposição.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Configurações de codificação QR',
      paragraphs: ['Versão: Os códigos QR vêm nas versões 1 a 40, com versões superiores contendo mais dados, mas sendo maiores. Defina como 0 (Automático) para permitir que o ANQR escolha a menor versão adequada ao seu conteúdo.', 'Correção de erros: determina quanto dano um código QR pode suportar enquanto permanece legível.'],
      bullets: ['L (Baixo): 7% de correção de erros – menor tamanho, menor redundância.', 'M (Médio): 15% de correção de erros – opção balanceada.', 'Q (quartil): 25% de correção de erros – bom para códigos impressos.', 'H (Alto): 30% de correção de erros – melhor para códigos com sobreposições ou em condições adversas.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Zona Silenciosa (Margem)',
      paragraphs: ['A zona silenciosa é o espaço em branco ao redor do código QR. Os scanners precisam dessa margem para detectar onde o código começa. A norma recomenda pelo menos 4 módulos. Reduzir abaixo de 4 pode causar problemas de digitalização.'],
    },
    {
      heading: 'Estilo do Módulo',
      paragraphs: ['Módulos são os quadrados individuais que constituem um código QR. ANQR oferece cinco estilos:'],
      bullets: ['Quadrado: Aparência QR clássica com cantos afiados.', 'Arredondado: cantos suavizados para uma aparência mais amigável.', 'Pontos: Módulos circulares para uma estética moderna.', 'Diamante: quadrados girados em 45° para um padrão distinto.', 'Conectado: os módulos se fundem quando adjacentes, criando formas orgânicas.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Estilo de padrão do Finder',
      paragraphs: ['Os padrões do Finder são os três grandes quadrados nos cantos QR que ajudam os scanners a orientar o código. Estilos disponíveis:'],
      bullets: ['Quadrado: Cantos quadrados padrão.', 'Arredondado: Cantos suavizados combinando com o estilo do módulo arredondado.', 'Círculo: padrões de localização circular para códigos de estilo de ponto.'],
    },
    {
      heading: 'Padrões de alinhamento e tempo',
      paragraphs: ['Os padrões de alinhamento aparecem em códigos QR maiores (versão 2+) para ajudar a corrigir a distorção. Os padrões de tempo são as linhas alternadas que conectam os padrões do localizador.'],
      bullets: ['Estilo de alinhamento: Match Finder, Quadrado, Arredondado ou Círculo.', 'Estilo de tempo: Módulo de correspondência, sólido ou tracejado.'],
    },
    {
      heading: 'Cores',
      paragraphs: ['Primeiro plano: A cor dos módulos QR. Preto (#000000) é padrão, mas qualquer cor escura funciona.', 'Plano de fundo: a cor de fundo. Branco (#ffffff) é padrão. Garanta contraste suficiente com o primeiro plano.', 'Fundo Transparente: Remova totalmente o fundo para uso em superfícies coloridas. Certifique-se de que a superfície forneça contraste adequado.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Tamanho e lacuna do módulo',
      paragraphs: ['Tamanho do módulo: controla o tamanho de cada módulo em pixels. Valores maiores criam códigos maiores e mais fáceis de ler.', 'Espaço entre módulos: adiciona espaço entre os módulos como uma porcentagem. Pequenas lacunas (5-15%) podem melhorar a capacidade de digitalização em algumas condições, mas lacunas excessivas reduzem a confiabilidade.'],
    },
    {
      heading: 'Configurações de saída',
      paragraphs: ['Formato: Escolha seu formato de exportação com base no caso de uso.'],
      bullets: ['PNG: Formato raster sem perdas, ideal para a maioria dos usos. Melhor para impressão e digital.', 'WebP: Formato moderno com tamanhos de arquivo menores. Bom para uso na web.', 'GIF: obrigatório para códigos QR animados. Suporta transparência.', 'SVG: formato vetorial que pode ser dimensionado infinitamente. Melhor para letras grandes ou quando você precisa editar o código.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Veja guias e exemplos relacionados', type: 'learn' },
      ],
    },
    {
      heading: 'Dimensões de saída',
      paragraphs: ['Largura/Altura: Defina o tamanho de saída em pixels. Para impressão, calcule com base no DPI (por exemplo, 300 DPI a 1 polegada = 300px). Tamanhos maiores digitalizam de forma mais confiável à distância.'],
    },
    {
      heading: 'Configurações de animação (avançado)',
      paragraphs: ['Controle o comportamento do código QR animado:'],
      bullets: ['Velocidade: taxa de quadros da animação em milissegundos.', 'Loop: Animação contínua ou única.', 'Bounce: Direção de animação de pingue-pongue.', 'Quadro inicial: inicia a animação a partir de um quadro específico.', 'Max Frames: Limite o total de frames na animação.', 'Etapa de quadro: pule quadros para uma animação mais rápida.', 'Interpolação: Nenhum, Crossfade ou Morph entre quadros.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Veja guias e exemplos relacionados', type: 'learn' },
      ],
    },
    {
      heading: 'Tipos de conteúdo (avançado)',
      paragraphs: ['O nível avançado desbloqueia formatos de carga adicionais:'],
      bullets: [
        'Número de telefone (tel:): Cria um link telefônico que pode ser chamado.',
        'Email (mailto:): Abre o cliente de email com assunto e corpo opcionais.',
        'SMS: mensagem de texto pré-preenchida para um número de telefone.',
        'vCard: Cartão de contato completo com nome, organização, telefone, email, endereço.',
        'MeCard: Formato de contato compacto popular no Japão.',
        'BizCard: Formato legado de cartão de visita.',
        'Localização geográfica: coordenadas GPS que abrem em mapas.',
        'WiFi: Credenciais de rede para conexão automática (SSID, senha, tipo de segurança).',
        'Evento de calendário: formato iCalendar com título, local, data/hora.',
        'RSVP do evento: Link para a página de inscrição do evento.',
        'Assinatura de calendário: Assine um feed ICS/WebCal.',
        'URL do arquivo/documento: link direto para arquivos para download.',
        'Link de armazenamento em nuvem: links para Google Drive, Dropbox, OneDrive, etc.',
        'Perfil social: links para LinkedIn, Twitter, Instagram, etc.',
        'Link de mensagens: WhatsApp, Telegram, links diretos de sinal.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Recursos avançados de sobreposição',
      paragraphs: ['Recursos adicionais de sobreposição:'],
      bullets: ['Cortar: Ative o corte para selecionar uma região quadrada da sua imagem.', 'Meio-tom: padrão de pontos de estilo de impressão clássico baseado no brilho da imagem.', 'Dithered: pontilhamento por difusão de erros para reprodução detalhada.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Modos de mesclagem de sobreposição (avançado)',
      paragraphs: ['Modos de mesclagem adicionais no nível Avançado:'],
      bullets: ['Subpixel: Divide cada módulo em subpixels para maior detalhe.', 'Ruído azul: usa pontilhamento de ruído azul para padrões livres de artefatos.', 'Mosaico: efeito baseado em ladrilho que preserva a estrutura da imagem.', 'Preenchimento de lacunas: coloca a imagem em lacunas entre os módulos.', 'Brilho: Varia o tamanho do módulo com base no brilho da imagem.', 'Duotone: mapeia a imagem para duas cores para um contraste impressionante.'],
    },
    {
      heading: 'Intensidade de sobreposição',
      paragraphs: ['Controla a intensidade com que a sobreposição afeta o código QR (0-100%). Valores mais altos mostram mais detalhes da imagem, mas podem reduzir a capacidade de digitalização. Comece em torno de 70% e ajuste com base nos testes.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Veja guias e exemplos relacionados', type: 'learn' }],
    },
    {
      heading: 'Modo de cor',
      paragraphs: ['Como a imagem de sobreposição é processada:'],
      bullets: ['Full Color: Preserva as cores originais da imagem.', 'Tons de cinza: converte em tons de preto e branco.', 'Preto e Branco: Conversão binária de alto contraste.'],
    },
    {
      heading: 'Preservar padrões do Finder',
      paragraphs: ['Quando ativado, mantém os padrões do localizador de três cantos inalterados pela sobreposição. Altamente recomendado para uma digitalização confiável.'],
    },
    {
      heading: 'Pré-processamento de imagem',
      paragraphs: ['Aplique filtros à sua imagem de sobreposição antes de mesclar. Esses ajustes podem melhorar a forma como a imagem aparece no código QR final.'],
      bullets: ['Brilho (-100 a +100): Clareia ou escurece a imagem.', 'Contraste (-100 a +100): Aumenta ou diminui a faixa tonal.', 'Gama (0,2 a 3,0): Ajuste de brilho não linear. Valores abaixo de 1 clareiam os tons médios, acima de 1 escurecem.', 'Saturação (-100 a +100): Intensidade da cor. -100 é escala de cinza, +100 é supersaturado.', 'Rotação de matiz (0-360°): Desloca todas as cores ao redor da roda de cores.', 'Desfoque (0-20px): suaviza os detalhes da imagem.', 'Nitidez (0-100%): Aprimore bordas e detalhes.', 'Posterizar (0-16 níveis): Reduza os níveis de cor para obter um efeito de pôster.', 'Limite (0-255): Converta para preto/branco binário no ponto de corte.', 'Detecção de bordas: algoritmos Sobel ou Canny para mostrar apenas bordas.', 'Inverter: inverte todas as cores.'],
    },
    {
      heading: 'Modo de ajuste',
      paragraphs: ['Como a imagem de sobreposição se ajusta à área do código QR:'],
      bullets: ['Capa: A imagem preenche toda a área, cortando se necessário.', 'Conter: Imagem inteira visível, pode ter margens.', 'Esticar: a imagem é distorcida para preencher com exatidão.'],
    },
    {
      heading: 'Opções de transformação',
      paragraphs: ['Rotação: gire a sobreposição em incrementos de 90°.', 'Virar X/Y: espelha a imagem horizontalmente ou verticalmente.'],
    },
    {
      heading: 'Algoritmos de pontilhamento',
      paragraphs: ['O pontilhamento converte imagens de tons contínuos em padrões que os códigos QR podem representar. Disponível ao usar os modos de mesclagem Dithered, Blue Noise ou True Dither.'],
      bullets: [
        'Difusão de erro: estilo clássico de Floyd-Steinberg. Espalha o erro de quantização para pixels vizinhos.',
        'Ordenado (Bayer): usa uma matriz de limite para padrões regulares.',
        'Ponto agrupado: Simula impressão em meio-tom.',
        'Void & Cluster: pontilhamento ordenado otimizado.',
        'Ruído Azul: Padrão de aparência aleatória visualmente agradável.',
        'Limite de ruído azul: pontilhamento de limite com textura de ruído azul.',
        'Ruído branco: pontilhamento de limite aleatório.',
        'Ruído Gaussiano/Triangular: Ruído com diferentes distribuições.',
        'Blue Noise + Error Diffusion: Híbrido combinando as duas técnicas.',
        'Ruído azul exibido: padrão de ruído azul semelhante a uma tela.',
        'Perceptivo: ponderado por luminância para melhores resultados visuais.',
        'Edge-Aware: Preserva as bordas da imagem durante o pontilhamento.',
        'Limite Adaptativo: Limite adaptável localmente.',
        'Ruído Azul Temporal: Para GIFs animados, varia o padrão por quadro.',
      ],
    },
    {
      heading: 'Núcleos de Difusão',
      paragraphs: ['Ao usar o pontilhamento por difusão de erros, escolha como o erro será distribuído:'],
      bullets: ['Floyd-Steinberg: difusão clássica de 4 vizinhos. Boa escolha geral.', 'Jarvis-Judice-Ninke: 12 vizinhos, mais suave, mas mais lento.', 'Stucki: Semelhante ao JJN com pesos diferentes.', 'Burkes: JJN simplificado, mais rápido.', 'Sierra: Família de kernels que equilibram qualidade e velocidade.', 'Atkinson: Difusão de luz, preserva detalhes, mas pode ser granulado.'],
    },
    {
      heading: 'Força de pontilhamento',
      paragraphs: ['Controla a quantidade de pontilhamento aplicado (0-100%). Valores mais baixos preservam mais o padrão original, valores mais altos mostram mais detalhes da imagem.'],
    },
    {
      heading: 'Configurações de subpixel',
      paragraphs: ['Ao usar o modo de mesclagem Subpixel:'],
      bullets: ['Tamanho da grade: 2×2, 3×3 ou 4×4 subpixels por módulo. Maior = mais detalhes.', 'Regra Central: Estrita requer que o subpixel central corresponda ao módulo. Centro de meio-tom permite variação.', 'Cor Neutra: Cor usada para subpixels indeterminados.', 'Substituição do Finder: como os padrões do Finder são renderizados (Sólido ou Estilizado).'],
    },
    {
      heading: 'Configurações de meio-tom',
      paragraphs: ['Ao usar o modo de mesclagem Meio-tom:'],
      bullets: ['Tamanho da célula: por módulo ou grade N×N.', 'Formato de ponto: círculo, quadrado ou linha.', 'Curva de brilho: Linear, Curva S ou Gama.'],
    },
    {
      heading: 'Cores Duotônicas',
      paragraphs: ['Ao usar o modo de mesclagem Duotone, defina a cor da sombra (áreas escuras) e a cor do destaque (áreas claras).'],
    },
    {
      heading: 'Configurações de animação GIF',
      paragraphs: ['Ao usar sobreposições de GIF animado:'],
      bullets: ['Use atrasos de quadros: respeite o tempo original do GIF.', 'Max FPS: limite a taxa de quadros (1-60 fps).', 'Manuseio de descarte: Respeite ou simplifique os métodos de descarte de estruturas.'],
    },
    {
      heading: 'Opções avançadas de renderização',
      paragraphs: ['Controles de renderização adicionais:'],
      bullets: ['Modo Gap: estilo de intervalo Nenhum, Inserção, Traçado ou Espaço Negativo.', 'Raio do Canto: Porcentagem de cantos arredondados para módulos.', 'Gradiente: Gradiente Nenhum, Linear, Radial ou Cônico nos módulos.', 'Estilo externo/interno do olho: estilo independente para anéis de padrão localizador.', 'Rotação de pontos: gire módulos de diamante/ponto.', 'Escala ocular: ajuste de tamanho para padrões de localização.', 'Estilo da moldura: adicione molduras decorativas (moldura arredondada, adesivo, etiqueta).', 'Texto do quadro: adicione texto como "Scan Me!" aos quadros.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Codificação QR avançada',
      paragraphs: ['Codificação QR de ajuste fino:'],
      bullets: ['Modo de codificação: Automático, Numérico, Alfanumérico, Byte/UTF-8 ou Kanji.', 'Aplicar zona silenciosa mínima: garanta pelo menos 4 módulos de margem.', 'Padrão de máscara: Automático (ideal) ou selecione manualmente os padrões 0 a 7 para controlar a distribuição do módulo. Padrões diferentes criam aparências visuais diferentes enquanto codificam os mesmos dados.', 'Codificação de caracteres: ISO-8859-1 (padrão Latin-1), UTF-8 (Unicode completo incluindo emoji) ou Shift-JIS (japonês). Escolha com base nos requisitos de caráter do seu conteúdo.'],
    },
    {
      heading: 'Opções de saída avançadas',
      paragraphs: ['Configurações adicionais de exportação:'],
      bullets: ['Nome do arquivo: nome de arquivo personalizado para downloads.', 'Tamanho da paleta GIF: 2-256 cores na saída GIF.', 'Quantizador GIF: redução de cor Median Cut, NeuQuant ou Octree.', 'Pontilhamento de GIF: desativado, Floyd-Steinberg ou solicitado.', 'Cor transparente do GIF: Defina uma cor para ser transparente.', 'SVG True Vector: use caminhos em vez de raster incorporado.', 'Precisão de forma SVG: renderização de pixel ou caminho preciso.', 'Sobreposição raster incorporada SVG: inclui sobreposição como imagem incorporada.', 'Substituição de plano de fundo: força uma cor de fundo específica na saída.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opções de validação',
      paragraphs: ['Configurações de processamento de entrada:'],
      bullets: ['Validar entrada: verifique o formato do conteúdo antes da codificação.', 'Aparar espaços em branco: remova espaços iniciais/finais.', 'Normalizar novas linhas: Converta todos os finais de linha em LF.', 'Proteção de comprimento máximo: avisa se o conteúdo exceder a capacidade do QR.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Recursos profissionais',
      paragraphs: ['O nível Profissional adiciona marcas d\'água, metadados, opções de compartilhamento, análise de segurança, códigos QR de pagamento e recursos empresariais.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Marca d\'água',
      paragraphs: ['Adicione marcas d\'água aos seus códigos QR:'],
      bullets: ['Tipo: Marca d\'água de texto, imagem ou padrão.', 'Posição: Centro, Cantos, Bordas, Atrás ou Zona Silenciosa.', 'Opacidade: Transparência da marca d\'água (0-100%).', 'Modo de mesclagem: mesclagem normal, multiplicação, tela ou sobreposição.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadados',
      paragraphs: ['Incorpore metadados em arquivos exportados:'],
      bullets: ['Campos Título, Autor, Direitos Autorais, Licença, Descrição.', 'Hora de criação: carimbo de data e hora de geração incorporado.', 'Valor-chave personalizado: adicione pares de metadados arbitrários.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Compartilhando',
      paragraphs: ['Compartilhe suas configurações de código QR:'],
      bullets: ['Link direto: gere um URL compartilhável com suas configurações atuais.', 'Incorporar HTML: obtenha código incorporado para sites.', 'Parâmetros de codificação: inclua todas as configurações no URL de compartilhamento.', 'Nota: Imagens de sobreposição de arquivos locais não podem ser compartilhadas via URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Veja guias e exemplos relacionados', type: 'learn' },
      ],
    },
    {
      heading: 'Análise de Segurança',
      paragraphs: ['Certifique-se de que os códigos QR permaneçam legíveis:'],
      bullets: ['Modo de segurança: Requisitos de digitalização desligado, balanceado ou estrito.', 'Tamanho mínimo do módulo: tamanho mínimo de pixel por módulo.', 'Zona Mínima de Silêncio: Módulos de margem mínima.', 'Bloquear localizadores/temporização/alinhamento/formato/versão: proteja elementos específicos.', 'Intensidade máxima de sobreposição por ECC: Limites de intensidade automáticos com base no nível de correção de erros.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Veja guias e exemplos relacionados', type: 'learn' },
      ],
    },
    {
      heading: 'Tipos de conteúdo (profissional)',
      paragraphs: ['O nível profissional adiciona tipos de conteúdo pago e empresarial:'],
      bullets: ['EPC/SEPA (UE): códigos QR de transferência bancária europeia com IBAN, BIC, valor, referência.', 'UPI (Índia): Interface unificada de pagamentos com VPA, nome do beneficiário, valor.', 'PayNow (Cingapura): Pagamento rápido em Cingapura com UEN ou número de celular.', 'PromptPay (Tailândia): sistema de pagamento nacional tailandês.', 'PIX (Brasil): pagamento instantâneo brasileiro com chave PIX.', 'Cripto: Endereços de pagamento Bitcoin, Ethereum, Litecoin com valor opcional.', 'Link da campanha de marketing: URLs com rastreamento completo de parâmetros UTM (Marketing Tags).', 'Link curto: para uso com encurtadores de URL para códigos QR dinâmicos/rastreáveis.', 'Link Digital GS1: Identificação do produto com GTIN, série, lote, validade.', 'Link direto do aplicativo: links diretos do aplicativo iOS/Android com esquemas personalizados.', 'Formato personalizado: dados brutos sem formatação ou validação.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Veja guias e exemplos relacionados', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Pagamentos relevantes ao idioma no modo avançado',
      paragraphs: ['Ao usar o modo Avançado, o ANQR mostra automaticamente os métodos de pagamento relevantes para o idioma selecionado. Por exemplo, os usuários vietnamitas veem o VietQR, os usuários tailandeses veem o PromptPay e os usuários do idioma indiano veem UPI e BharatQR. Os métodos de pagamento globais (criptomoeda, PayPal, Cash App) estão disponíveis para todos os idiomas. O modo profissional desbloqueia todos os padrões de pagamento, independentemente do idioma.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Padrões de Pagamento Europeus',
      bullets: ['EPC/SEPA (UE): códigos QR de transferência bancária europeia seguindo o padrão de código QR EPC. Suporta IBAN, BIC (opcional para uso doméstico), valor em EUR e referências de pagamento estruturadas ou não estruturadas. Usado em toda a zona SEPA, incluindo países da UE, além de Suíça, Noruega, Islândia, Liechtenstein, Mônaco e São Marino.', 'QR-bill suíça: padrão de pagamento suíço seguindo SEIS Diretrizes de Implementação. Suporta CHF e EUR, referência QR (QRR), referência de credor (ISO 11649), endereços estruturados de credores/devedores e informações de faturas. Obrigatório para faturas suíças desde 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Padrões de pagamento indianos',
      bullets: ['UPI (Índia): Interface unificada de pagamentos seguindo a especificação NPCI Deep Linking. Suporta VPA (endereço de pagamento virtual), nome do beneficiário, valor em INR, nota de transação, ID de referência, código de categoria do comerciante e modo de transação.', 'BharatQR (Índia): padrão QR unificado que suporta pagamentos UPI e baseados em cartão. Combina UPI VPA com cartão PAN para máxima compatibilidade. Inclui nome do comerciante, cidade, MCC, detalhes de GST e números de fatura/referência.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Padrões de Pagamento do Sudeste Asiático',
      bullets: ['PayNow (Cingapura): Sistema de pagamento rápido de Cingapura usando especificação EMVCo QR com perfil SGQR. Suporta UEN (registro comercial), número de celular ou NRIC como identificadores de proxy. Inclui sinalizador de editabilidade do valor e data de validade.', 'PromptPay (Tailândia): sistema de pagamento nacional tailandês seguindo o perfil EMV do Banco da Tailândia. Suporta número de celular, identificação nacional, identificação fiscal, identificação de carteira eletrônica e pagamento de contas com vários campos de referência.', 'QRIS (Indonésia): Código de Resposta Rápida Padrão Indonésio. Padrão de pagamento nacional baseado em EMV que suporta ID de comerciante, NMID (ID de comerciante nacional), classificação de critérios de comerciante e taxas de conveniência (fixas ou percentuais).', 'DuitNow (Malásia): sistema de pagamento instantâneo da Malásia. Suporta vários tipos de proxy, incluindo NRIC, celular, passaporte, identificação militar e números de registro comercial.', 'VietQR (Vietnã): padrão de transferência interbancária vietnamita. Requer BIN do banco (identificação NAPAS) e número de conta. Suporta vários códigos de serviço para diferentes tipos de transferência (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filipinas): padrão de pagamento QR filipino para InstaPay e PESONet. Usa números de conta com identificação do comerciante para transações P2M (pessoa para comerciante).'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Padrões de Pagamento do Leste Asiático',
      bullets: ['TWQR (Taiwan): padrão de pagamento QR taiwanês. Suporta ID de comerciante, ID fiscal e valores de TWD.', 'HKQR/FPS (Hong Kong): códigos QR do sistema de pagamento mais rápido de Hong Kong. Suporta FPS ID, número de celular ou e-mail como identificadores de pagamento. Valores em HKD.', 'JPQR (Japão): Padrão de pagamento com código QR unificado japonês. Usa o ID da loja para identificação do comerciante com valores em JPY.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Outros padrões de pagamento regionais',
      bullets: ['PIX (Brasil): Sistema de pagamento instantâneo do Banco Central do Brasil seguindo especificação do Código BR. Suporta chaves PIX (CPF, CNPJ, e-mail, telefone ou chave aleatória), nome/cidade do estabelecimento comercial, ID da transação e valores em reais.', 'AusPayNet/NPP PayID (Austrália): Novo sistema australiano PayID da plataforma de pagamentos. Suporta tipos PayID (e-mail, celular, ABN, ID da organização) ou número de conta tradicional BSB +. O nome do comerciante é opcional, pois os pagadores veem o nome registrado na pesquisa do NPP.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pagamentos em criptomoeda',
      bullets: ['Bitcoin/Litecoin (BIP-21): URIs de pagamento de criptomoeda padrão com endereço de carteira, valor opcional e etiqueta. Compatível com todas as principais carteiras Bitcoin e Litecoin.', 'Lightning Network (BOLT11): faturas de pagamento da Lightning Network. Cole uma string de fatura codificada em BOLT11 para pagamentos instantâneos de Bitcoin com taxas mínimas.', 'Ethereum (EIP-681): URIs de solicitação de transação Ethereum que suportam transferências nativas de ETH e transferências de token ERC-20. Inclui ID de cadeia para suporte multi-rede (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parâmetros de gás e chamadas de função de contrato.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Serviços de link de pagamento',
      bullets: ['PayPal.Me: links de pagamento do PayPal com nome de usuário e valor pré-preenchido opcional. Os destinatários podem pagar via saldo do PayPal, cartões ou contas bancárias.', 'Cash App: links de pagamento do Cash App usando $ cashtag com valor opcional. Popular nos Estados Unidos para pagamentos ponto a ponto.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'QR EMV genérico',
      bullets: ['EMV genérico: crie códigos QR personalizados do modo EMV apresentado pelo comerciante para esquemas de pagamento não listados especificamente. Configure o nome do comerciante, cidade, código do país (ISO 3166-1), código da moeda (numérico ISO 4217), MCC, opções de gorjeta/taxa de conveniência e campos de dados adicionais. Útil para testes ou integrações personalizadas.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Modos de mesclagem de sobreposição (Profissional)',
      paragraphs: ['Modos de mesclagem adicionais no nível Profissional:'],
      bullets: ['Pixelate: efeito de sobreposição pixelizada.', 'Contorno: Sobreposição de detecção de borda mostrando apenas contornos.', 'Onda: Efeito de distorção ondulada.', 'Tamanho do subpixel: dimensionamento variável do subpixel com base na imagem.', 'True Dither: Dithering avançado com seleção de matriz ordenada.', 'Extremo: Visibilidade máxima da imagem, pode afetar a capacidade de digitalização.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Configurações de proteção',
      paragraphs: ['Controle refinado sobre quais elementos QR são protegidos contra modificação de sobreposição:'],
      bullets: ['Preservar o tempo: mantenha os padrões de tempo inalterados.', 'Preservar alinhamento: mantenha os padrões de alinhamento inalterados.', 'Proteger informações de formato: Módulos de informações de formato de proteção.', 'Proteger informações da versão: protege os módulos de informações da versão.'],
    },
    {
      heading: 'Modo compatível com ECC',
      paragraphs: ['Distribui de forma inteligente a intensidade da sobreposição com base na capacidade de correção de erros. O sistema analisa quais módulos podem ser modificados, mantendo a capacidade de digitalização.'],
      bullets: ['Orçamento de Risco: Porcentagem de capacidade de correção de erros a ser utilizada (0-100%).', 'Orçamento mais alto = sobreposição mais visível, mas capacidade de digitalização mais arriscada.', 'Orçamento mais baixo = digitalização mais segura, mas sobreposição menos visível.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opções de renderização profissional',
      paragraphs: ['Controles avançados de renderização:'],
      bullets: ['Bordas nítidas: use renderização de imagem pixelada para bordas nítidas do módulo.', 'Pixel Snap: alinhamento de pixels do piso, redondo ou teto.', 'Modo de cor por módulo: sólido, por brilho, por posição, por sobreposição, por cluster.', 'Paleta de cores: defina uma paleta de cores personalizada para coloração por módulo.', 'Contrast Guard: Garanta uma taxa mínima de contraste entre as cores.', 'Relação mínima de contraste: requisito de contraste estilo WCAG (1:1 a 21:1).', 'Módulos de Fronteira Extra: Fronteira adicional além da zona tranquila.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opções de saída profissional',
      paragraphs: ['Configurações de exportação empresarial:'],
      bullets: ['DPI: Defina a resolução de impressão (72-600 DPI). 300 DPI recomendado para impressão.', 'Incluir zona silenciosa: alterna a zona silenciosa nas dimensões de saída.', 'Exportar como adicional: Gere PDF junto com o formato principal.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Configurações de animação (Profissional)',
      paragraphs: ['Recursos adicionais de animação profissional:'],
      bullets: ['Pontilhamento temporal: desligado, ruído azul ou oscilação segura por quadro.', 'Padrão: Efeitos Nenhum, Pulso, Onda, Scanline, Shimmer ou Drift.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Veja guias e exemplos relacionados', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Referência de API',
      paragraphs: ['ANQR fornece uma API do lado do servidor para gerar códigos QR por meio de parâmetros de URL. Isso é ideal para incorporar códigos QR em sites, e-mails, documentos ou fluxos de trabalho automatizados sem JavaScript do lado do cliente.', 'URL base: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Veja exemplos de QR', type: 'example' }],
    },
    {
      heading: 'Parâmetros Básicos',
      paragraphs: ['Parâmetros obrigatórios e comuns (os nomes dos parâmetros não são traduzidos):'],
      bullets: ['dados (obrigatório): o conteúdo a ser codificado no código QR. Caracteres especiais codificados em URL.', 'size: Tamanho da imagem em pixels (padrão: 400, máx.: 2.000). Usado se w/h não for especificado.', 'w, h: Largura e altura de saída em pixels. Substitui o parâmetro de tamanho.', 'format: Formato de saída - png, webp ou gif (padrão: png).', 'ec: Nível de correção de erros - L, M, Q ou H (padrão: H).', 'fg: Cor de primeiro plano em hexadecimal sem # (padrão: 000000).', 'bg: Cor de fundo em hexadecimal sem # (padrão: ffffff).', 'transparente: Defina como 1 para fundo transparente.', 'margem: Zona silenciosa em módulos (padrão: 4).'],
    },
    {
      heading: 'Parâmetros de estilo',
      paragraphs: ['Estilo de módulo e padrão:'],
      bullets: ['estilo: Estilo do módulo - quadrado, arredondado, pontos, diamante, conectado.', 'localizador: estilo de padrão do localizador - quadrado, arredondado, círculo.', 'alinhar: Estilo de padrão de alinhamento - match_finder, quadrado, arredondado, círculo.', 'tempo: estilo do padrão de tempo - match_module, sólido, tracejado.', 'raio: porcentagem do raio do canto 0-100.', 'lacuna: Porcentagem de lacuna do módulo 0-50.', 'gapMode: modo Gap - nenhum, inserção, traço, espaço_negativo.', 'eyeOuter, eyeInner: estilos de olhos - quadrado, arredondado, círculo.', 'eyeScale: Porcentagem da escala ocular (padrão: 100).', 'grad: Tipo de gradiente - nenhum, linear, radial, cônico.', 'gradAngle: Ângulo gradiente para gradientes lineares.', 'gradStops: O gradiente para como color1,pos1,color2,pos2,... (por exemplo, ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Parâmetros de sobreposição',
      paragraphs: ['Opções de sobreposição de imagem (a imagem de sobreposição é obtida no lado do servidor):'],
      bullets: ['img: URL para imagem de sobreposição (deve ser acessível publicamente).', 'modo: Modo de sobreposição - centro, meio-tom, mistura, brilho, mosaico, pontilhado, ruído azul, subpixel.', 'intensidade: Intensidade de sobreposição 0-100 (padrão: 100).', 'colorMode: Modo de cor de sobreposição - colorido, escala de cinza, preto.', 'ajuste: como a sobreposição se ajusta – cobrir, conter, esticar.', 'podridão: rotação da sobreposição em graus.', 'flipX, flipY: Defina como 1 para inverter a sobreposição.', 'keepFinders: preserva os padrões do localizador (padrão: 1).', 'keepTiming, keepAlign: Defina como 1 para preservar os padrões de tempo/alinhamento.'],
    },
    {
      heading: 'Parâmetros de pré-processamento',
      paragraphs: ['Pré-processamento de imagem aplicado à sobreposição:'],
      bullets: ['brilho: Ajuste -100 a 100 (padrão: 0).', 'contraste: Ajuste -100 a 100 (padrão: 0).', 'gama: Valor 0,1 a 3 (padrão: 1).', 'saturação: Ajuste -100 a 100 (padrão: 0).', 'matiz: rotação de matiz em graus.', 'desfoque: Desfoque em pixels.', 'afiar: Valor de nitidez de 0 a 100.', 'posterizar: Posterizar níveis.', 'limite: limite binário 0-255.', 'borda: Detecção de borda - desligada, sobel, sagaz.', 'inverter: Defina como 1 para inverter as cores.'],
    },
    {
      heading: 'Parâmetros de marca d\'água',
      paragraphs: ['Adicione marcas d\'água aos códigos QR gerados:'],
      bullets: ['wmEn: Defina como 1 para ativar a marca d\'água.', 'wmKind: Tipo de marca d\'água - texto, imagem, padrão.', 'wmText: texto de marca d\'água (codificado em URL).', 'wmImg: URL para marca d\'água da imagem.', 'wmPos: Posição - centro, cantos, bordas, atrás, zona silenciosa.', 'wmOpacity: Opacidade 0-100 (padrão: 50).', 'wmBlend: Modo de mesclagem - normal, multiplicação, tela, sobreposição.'],
    },
    {
      heading: 'Parâmetros de animação',
      paragraphs: ['Para saída de GIF animado (requer format=gif):'],
      bullets: ['animPattern: Padrão de animação - nenhum, pulso, onda, linha de varredura, brilho, deriva, ciclo de cor.', 'animFrames: Número de quadros de 1 a 60 (padrão: 24).', 'animSpeed: Atraso de quadro em milissegundos de 10 a 1000 (padrão: 100).', 'animSeed: Semente aleatória para animação.', 'atenuação: atenuação da animação - linear, facilidade_in, facilidade_out, facilidade_in_out, salto.'],
    },
    {
      heading: 'Parâmetros de saída',
      paragraphs: ['Opções de formato de saída:'],
      bullets: ['qualidade: qualidade WebP 0-1 (padrão: 0,9).', 'webpQ: qualidade WebP 0-100 (padrão: 90).', 'gifColors: tamanho da paleta GIF 2-256 (padrão: 256).', 'dpi: DPI de saída para PNG (padrão: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: campos de metadados PNG.'],
    },
    // Crop Parameters
    {
      heading: 'Parâmetros de corte',
      paragraphs: ['Opções de corte de imagem de sobreposição:'],
      bullets: ['cropEn: Ativa o corte de sobreposição 0/1 (padrão: 0).', 'cropX: Corte o centro X como fração 0-1 (padrão: 0,5).', 'cropY: Corte o centro Y como fração 0-1 (padrão: 0,5).', 'cropSize: Tamanho do corte como fração da imagem 0-1 (padrão: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Parâmetros de bloqueio de segurança',
      paragraphs: ['Controle quais elementos QR estão protegidos contra modificação de sobreposição:'],
      bullets: ['lockF: Padrões de localização de bloqueio 0/1 (padrão: 1).', 'lockT: Bloqueia padrões de temporização 0/1 (padrão: 1).', 'lockA: Bloqueia padrões de alinhamento 0/1 (padrão: 1).', 'lockFmt: Bloqueia informações de formato 0/1 (padrão: 1).', 'lockV: Bloqueia informações da versão 0/1 (padrão: 1).', 'safeMode: Modo de segurança - desligado, balanceado, estrito (padrão: desligado).', 'safeMinPx: Tamanho mínimo do módulo em pixels (padrão: 2).', 'safeMinQz: Módulos mínimos de zona silenciosa (padrão: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parâmetros de autoajuste',
      paragraphs: ['Configurações de otimização automática:'],
      bullets: ['autoVer: seleção automática do QR versão 0/1 (padrão: 1).', 'autoEcc: seleção automática de ECC nível 0/1 (padrão: 0) - apenas dica do lado do servidor.', 'autoReduce: [SOMENTE CLIENTE] Reduz automaticamente a intensidade até que possa ser escaneada - requer loop de validação de varredura.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Parâmetros Adicionais de Animação',
      paragraphs: ['Controles de animação estendidos para saída GIF:'],
      bullets: ['loop: a animação faz um loop contínuo de 0/1 (padrão: 1).', 'salto: direção da animação de pingue-pongue 0/1 (padrão: 0).', 'reverso: reproduz animação em reverso 0/1 (padrão: 0).', 'colorCycle: Habilita o efeito de ciclo de cores 0/1 (padrão: 0).', 'interp: Interpolação de quadros - nenhum, crossfade, morph (padrão: nenhum).', 'tempDither: Pontilhamento temporal - desligado, blue_noise, flicker_safe (padrão: desligado).', 'startF: Quadro inicial da animação (padrão: 0).', 'maxF: Máximo de quadros a serem renderizados (padrão: 0 = automático).', 'stepF: Intervalo de passo do quadro (padrão: 1).', 'jitter: [SOMENTE CLIENTE] Jitter do módulo em pixels - requer regeneração QR por quadro.'],
    },
    // Dithering Parameters
    {
      heading: 'Parâmetros de pontilhamento',
      paragraphs: ['Controle algoritmos de pontilhamento para processamento de sobreposição:'],
      bullets: ['ditherKind: Algoritmo de pontilhamento - error_diffusion, ordenado_bayer, blue_noise, etc (padrão: ordenado_bayer).', 'diffusionKernel: Erro no kernel de difusão - floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (padrão: floyd_steinberg).', 'ditherStrength: Intensidade de pontilhamento 0-100 (padrão: 50).', 'serpentina: pontilhamento serpentino 0/1 (padrão: 0).', 'matriz: Matriz de pontilhamento ordenada - bayer2, bayer4, bayer8 (padrão: bayer4).', 'bnTile: Tamanho do bloco de ruído azul (padrão: 64).', 'bnSeed: Semente aleatória de ruído azul (padrão: 0).', 'colorDither: pontilhamento de cores - nenhum, por canal, perceptivo (padrão: nenhum).'],
    },
    // Subpixel Parameters
    {
      heading: 'Parâmetros de subpixel',
      paragraphs: ['Configurações para modo de mesclagem de subpixel:'],
      bullets: ['spGrid: Tamanho da grade de subpixel - 2x2, 3x3, 4x4 (padrão: 3x3).', 'spCenter: Regra central - estrito, halftone_center (padrão: estrito).', 'spNeutral: hexadecimal de cor neutra sem # (padrão: 808080).', 'spFinder: Substituição do Finder - sólido, estilizado (padrão: sólido).'],
    },
    // Halftone Parameters
    {
      heading: 'Parâmetros de meio-tom',
      paragraphs: ['Configurações para modo de mesclagem de meio-tom:'],
      bullets: ['htCell: tamanho da célula de meio-tom - grade per_module ou nxn (padrão: per_module).', 'htDot: Forma de ponto - círculo, quadrado, linha (padrão: círculo).', 'htCurve: Curva de brilho - linear, curva S, gama (padrão: linear).', 'duo1: cor de sombra duotônica hexadecimal sem # (padrão: 000000).', 'duo2: cor de destaque Duotone hexadecimal sem # (padrão: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parâmetros do modo ECC-Aware',
      paragraphs: ['Distribuição inteligente de sobreposição baseada na capacidade de correção de erros:'],
      bullets: ['eccAware: Ativa o modo compatível com ECC 0/1 (padrão: 0).', 'eccRisk: Porcentagem do orçamento de risco 0-100 (padrão: 50).', 'eccMap: Mapa de pesos - distance_to_finders, block_heatmap, empiric_scan_heatmap (padrão: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Parâmetros de quadro',
      paragraphs: ['Configurações de moldura decorativa:'],
      bullets: ['frame: Estilo do quadro - nenhum, quadro_arredondado, adesivo, tag (padrão: nenhum).', 'frameText: Texto a ser exibido no quadro (URL codificado).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parâmetros de cores por módulo',
      paragraphs: ['Opções de coloração de módulos individuais:'],
      bullets: ['modColor: Modo de cor - sólido, by_brightness, by_position, by_overlay, by_cluster (padrão: sólido).', 'cGuard: Proteção de contraste 0/1 (padrão: 0).', 'minContrast: Taxa de contraste mínima 1-21 (padrão: 4,5).', 'paleta: Cores hexadecimais separadas por vírgula para o modo paleta.', 'paletaMode: Distribuição da paleta - posição, brilho, diagonal, radial, aleatório, linha, coluna (padrão: posição).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parâmetros de sobreposição de GIF',
      paragraphs: ['Configurações para imagens de sobreposição de GIF animado:'],
      bullets: ['ovType: Tipo de sobreposição - estático, gif, apng, webp_anim, vídeo (padrão: estático).', 'ovFramePick: Seleção de quadros - todos, todos_n, max_frames, duração_limit (padrão: todos).', 'gifDelays: Use atrasos de quadro GIF originais 0/1 (padrão: 1).', 'gifDispH: Tratamento de descarte de GIF - respeite, simplifique (padrão: respeito).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Limites de intensidade por ECC',
      paragraphs: ['Intensidade máxima de sobreposição por nível de correção de erros:'],
      bullets: ['maxIntL: Intensidade máxima para ECC L 0-100 (padrão: 100).', 'maxIntM: Intensidade máxima para ECC M 0-100 (padrão: 100).', 'maxIntQ: Intensidade máxima para ECC Q 0-100 (padrão: 100).', 'maxIntH: Intensidade máxima para ECC H 0-100 (padrão: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parâmetros de simulação de controle de qualidade (somente cliente)',
      paragraphs: ['Esses parâmetros são analisados quanto à compatibilidade de URL, mas funcionam apenas no navegador:'],
      bullets: ['qaContrast: Habilitar verificação de contraste 0/1 - requer validação interativa.', 'qaBlur: Simula desfoque em pixels - apenas para testes interativos.', 'qaNoise: Simula o nível de ruído - apenas para testes interativos.', 'qaHeatmap: Mostrar mapa de calor de legibilidade 0/1 - requer UI de sobreposição de tela.'],
    },
    // Client-Only Parameters
    {
      heading: 'Parâmetros somente cliente',
      paragraphs: ['A maioria dos parâmetros da API tem suporte total no servidor. Os parâmetros marcados como [SOMENTE CLIENTE] são analisados quanto à compatibilidade de URL, mas exigem recursos do navegador:'],
      bullets: ['jitter: O jitter do módulo requer regeneração QR por quadro com aleatoriedade.', 'autoReduce: a intensidade de redução automática requer testes de varredura iterativos.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: a simulação de controle de qualidade requer validação de tela interativa.'],
    },
    // Additional Output Parameters
    {
      heading: 'Parâmetros de saída adicionais',
      paragraphs: ['Configurações estendidas de saída e exportação:'],
      bullets: ['fname: nome de arquivo personalizado para downloads (padrão: anqr-qrcode).', 'inclQz: Inclui zona silenciosa nas dimensões de saída 0/1 (padrão: 1).', 'bgOver: substituição da cor de fundo hexadecimal sem # (substitui o parâmetro bg).', 'fmtExtra: Formato de saída adicional - nenhum, eps, animado_webp (padrão: nenhum). Nota: eps é [PARCIAL].', 'svgPrec: precisão da forma SVG - pixel, preciso (padrão: pixel). [PARCIAL] Saída SVG limitada no lado do servidor.', 'svgEmbed: Incorpora sobreposição raster em SVG 0/1 (padrão: 1). [PARCIAL] Saída SVG limitada no lado do servidor.', 'modulePx: Tamanho do pixel do módulo (padrão: calculado automaticamente a partir do tamanho).', 'border: Módulos de borda extras além da zona tranquila (padrão: 0).', 'nítido: Ativa a renderização de imagem nítida/pixelada 0/1 (padrão: 1).', 'snap: Modo de snap de pixel - piso, redondo, teto (padrão: piso).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parâmetros de preservação de padrão',
      paragraphs: ['Controle quais elementos estruturais estão protegidos contra sobreposição:'],
      bullets: ['keepFinders: preserva os padrões do localizador 0/1 (padrão: 1).', 'keepTiming: preserva os padrões de tempo 0/1 (padrão: 0).', 'keepAlign: Preserva padrões de alinhamento 0/1 (padrão: 0).', 'ProtectFmt: Protege módulos de informações de formato 0/1 (padrão: 0).', 'ProtectVer: Protege os módulos de informações da versão 0/1 (padrão: 0).'],
    },
    {
      heading: 'Exemplo de uso',
      paragraphs: ['Código QR básico:', 'https://anqr.link/api/qr?data=https://example.com', 'Código QR estilizado com cores personalizadas:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'Código QR com imagem sobreposta:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'GIF animado:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Veja exemplos de QR', type: 'example' }],
    },
    {
      heading: 'Incorporando códigos QR',
      paragraphs: ['No modo Profissional, o recurso Compartilhar gera HTML e URLs incorporáveis. Veja como funciona a incorporação:'],
      bullets: ['Compartilhar link: cria um URL para o aplicativo ANQR com todas as suas configurações codificadas como parâmetros de URL. Os destinatários podem visualizar e modificar o código QR.', 'Incorporar imagem: gera uma tag <img> apontando para a API do servidor. O código QR é renderizado no lado do servidor e servido como uma imagem.', 'Incorporar Markdown: Cria sintaxe de imagem Markdown para documentação e arquivos README.', 'URL direto da API: o URL bruto da API para uso em aplicativos, scripts ou outras integrações.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Exemplo HTML',
      paragraphs: ['Para incorporar um código QR em seu site:', '<img src="https://anqr.link/api/qr?data=https://seusite.com&size=200" alt="Código QR" />', 'Para dimensionamento responsivo:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />', 'O servidor armazena em cache as respostas com cabeçalhos de cache longos, portanto, solicitações repetidas para o mesmo URL são rápidas.'],
    },
    {
      heading: 'Compartilhar formato de URL',
      paragraphs: ['Quando você clica em Compartilhar no modo Profissional, o ANQR codifica suas configurações atuais em parâmetros de URL. O formato é:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Esses parâmetros refletem os parâmetros da API, para que você possa converter um URL de compartilhamento em um URL de API alterando o caminho base de / para /api/qr e ajustando os parâmetros w/h conforme necessário.', 'Observação: imagens de sobreposição carregadas de arquivos locais não podem ser compartilhadas via URL. Somente sobreposições baseadas em URL (parâmetro img) funcionam em links compartilhados e chamadas de API.'],
    },
    {
      heading: 'Limites de taxa e uso',
      paragraphs: ['A API é gratuita para volumes razoáveis. Para uso em alto volume ou aplicações comerciais que exigem tempo de atividade garantido, entre em contato conosco.', 'As respostas da API incluem cabeçalhos de cache agressivos. Para obter melhor desempenho, armazene em cache as respostas ou use o mesmo URL de forma consistente para códigos QR idênticos.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Melhores práticas',
      paragraphs: ['Siga estas diretrizes para códigos QR confiáveis:'],
      bullets: ['Sempre teste seus códigos QR com vários aplicativos de scanner antes de imprimir.', 'Use a correção de erros H (alta) ao adicionar sobreposições.', 'Mantenha pelo menos 4 módulos de zona sossegada (margem).', 'Garanta alto contraste entre o primeiro plano e o fundo.', 'Para impressão, use pelo menos 300 DPI e teste no tamanho real da impressão.', 'Ative Preservar padrões do Finder ao usar sobreposições.', 'Comece com menor intensidade de sobreposição e aumente gradualmente.', 'Para uso externo, considere módulos maiores e maior correção de erros.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Procure artigos do Aprenda', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Veja exemplos de QR', type: 'example' },
      ],
    },
    {
      heading: 'Solução de problemas',
      paragraphs: ['Problemas e soluções comuns:'],
      bullets: ['QR não digitaliza: reduza a intensidade da sobreposição, aumente a correção de erros, verifique o contraste.', 'Código muito grande: reduza o comprimento do conteúdo, use encurtador de URL, versão inferior.', 'Saída desfocada: aumente o tamanho do módulo, use PNG em vez de formatos compactados.', 'As cores parecem erradas: verifique o contraste das cores, experimente o modo de sobreposição de escala de cinza.', 'GIF não animado: certifique-se de usar a saída no formato GIF, verifique a contagem de quadros.', 'A sobreposição de imagem não carrega: verifique as permissões CORS em imagens remotas.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Veja guias e exemplos relacionados', type: 'learn' }],
    },
    {
      heading: 'Atalhos de teclado',
      paragraphs: ['ANQR oferece suporte a atalhos de teclado padrão. Use Ctrl/Cmd+S para acionar a exportação (quando focado na visualização).'],
    },
    {
      heading: 'Compartilhamento e incorporação',
      paragraphs: ['No modo Profissional, clique no botão Compartilhar para copiar um URL com suas configurações atuais. Os destinatários podem abrir este URL para ver sua configuração exata. Nota: Imagens de sobreposição de arquivos locais não podem ser compartilhadas via URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Experimente esta configuração diretamente no gerador ANQR.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Procure artigos do Aprenda', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Veja exemplos de QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Veja exemplos de QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Abra o gerador', type: 'generator' },
  ],
};

export default guide;
