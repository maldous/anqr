import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Ajude a traduzir ANQR',
  description: 'Junte-se à nossa comunidade de tradutores que ajudam a tornar o ANQR acessível a usuários em todo o mundo. Não é necessária experiência em codificação - contribua diretamente do seu navegador.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Repositório de Tradução Aberto', type: 'external' },
    { href: '/?lang=${lang}', label: 'Abra o Gerador', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Sobre ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contate-nos', type: 'external' },
  ],
  sections: [
    {
      heading: 'Por que contribuir?',
      paragraphs: ['ANQR é usado por pessoas de todo o mundo para criar códigos QR para empresas, eventos, pagamentos e projetos pessoais. Ao contribuir com traduções, você ajuda a tornar esta ferramenta poderosa acessível a usuários que preferem seu idioma nativo.', 'Cada contribuição de tradução - seja corrigindo um erro de digitação ou traduzindo um idioma inteiro - faz uma diferença real para os usuários da sua comunidade.'],
    },
    {
      heading: 'O que você pode traduzir?',
      paragraphs: ['ANQR possui dois tipos de conteúdo traduzível:'],
      bullets: ['Strings de UI: rótulos de botões, itens de menu, dicas de ferramentas e texto de interface que aparecem em todo o aplicativo.', 'Conteúdo estático: páginas de documentação incluindo guias, exemplos, política de privacidade e artigos de ajuda.', 'Ambos os tipos são armazenados como arquivos de texto simples que você pode editar diretamente no seu navegador - sem necessidade de software especial.', 'As traduções são revisadas antes de serem mescladas para garantir qualidade e consistência.'],
    },
    {
      heading: 'Como contribuir',
      paragraphs: ['Contribuir é fácil e não requer conhecimento de Git:'],
      bullets: ['Visite nosso repositório público de tradução no GitHub.', 'Encontre o seu arquivo de idioma (ou crie um novo se o seu idioma ainda não for compatível).', 'Clique no ícone de lápis para editar diretamente no seu navegador.', 'Faça suas alterações e clique em "Propor alterações" - o GitHub criará automaticamente uma solicitação pull.', 'Sua contribuição será revisada e mesclada, normalmente dentro de alguns dias.'],
    },
    {
      heading: 'Diretrizes de Tradução',
      paragraphs: ['Ao traduzir, mantenha espaços reservados como {name}, {count} e {{variable}} inalterados - eles são substituídos por valores dinâmicos em tempo de execução. Preserve também qualquer sintaxe semelhante a HTML, como links no formato [[/path|Label]].', 'Se você não tiver certeza sobre uma tradução, é melhor deixá-la em inglês do que fornecer uma tradução incorreta. Você também pode abrir um problema no GitHub para pedir esclarecimentos.'],
    },
    {
      heading: 'Idiomas atualmente suportados',
      paragraphs: ['ANQR atualmente oferece suporte a mais de 40 idiomas, incluindo:'],
      bullets: ['Principais idiomas mundiais: inglês, chinês, espanhol, árabe, hindi, português, japonês, coreano, francês, alemão, russo e muito mais.', 'Idiomas do sudeste asiático: tailandês, vietnamita, indonésio, filipino, malaio, khmer, laosiano, birmanês.', 'Línguas do sul da Ásia: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Reconhecimento',
      paragraphs: ['Todos os contribuidores são creditados em nosso repositório. Seu trabalho ajuda milhares de usuários a acessar o ANQR no idioma de sua preferência.', 'Obrigado a todos os nossos colaboradores de tradução por ajudarem a tornar o ANQR acessível em todo o mundo!'],
    },
    {
      heading: 'Perguntas?',
      paragraphs: ['Se você tiver dúvidas sobre como contribuir com traduções, abra um problema em nosso repositório GitHub ou entre em contato conosco por e-mail. Estamos felizes em ajudá-lo a começar.'],
    },
  ],
};

export default translate;
