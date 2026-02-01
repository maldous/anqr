import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Sobre ANQR',
  description: 'ANQR é um gerador de código QR gratuito com uma abordagem que prioriza o cliente - gere códigos QR localmente ou use nossa API para incorporação.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abra o gerador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Procure artigos do Aprenda', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Política de Privacidade', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Termos de Serviço', type: 'external' },
  ],
  sections: [
    {
      heading: 'O que é ANQR?',
      paragraphs: ['ANQR (pronuncia-se "âncora") é um gerador de código QR gratuito que cria códigos escaneáveis para URLs, texto, credenciais de Wi-Fi, cartões de contato, eventos de calendário e muito mais.', 'Ele foi desenvolvido para indivíduos, pequenas empresas, profissionais de marketing e desenvolvedores que desejam ferramentas QR poderosas sem se inscrever. O design que prioriza o cliente significa que os códigos QR são gerados localmente em seu navegador por padrão, com uma API de servidor opcional para incorporação e integração profissional.'],
    },
    {
      heading: 'Principais recursos',
      bullets: ['Gere códigos QR instantaneamente em seu navegador - sem necessidade de conta.', 'Personalize cores, estilos de módulos, padrões de localização e adicione sobreposições de imagens.', 'Exporte em vários formatos: PNG, SVG, WebP e GIF animado.', 'Controles avançados para nível de correção de erros, versão QR, modo de codificação e seleção de máscara.', 'Orientações sobre segurança de digitalização e visualização ao vivo para ajudar a manter os códigos legíveis impressos e nas telas.', 'API do lado do servidor para incorporação profissional com suporte completo a parâmetros.', 'Funciona offline depois de carregado - é um aplicativo da web estático que você pode executar em qualquer lugar.'],
    },
    {
      heading: 'Como funciona o ANQR',
      paragraphs: ['ANQR é executado em seu navegador e codifica sua entrada em uma matriz QR padrão com correção de erros Reed-Solomon e, em seguida, renderiza-a no formato que você escolher.', 'Por padrão, a geração acontece localmente no seu navegador. Para uso profissional, você também pode usar a API do lado do servidor para gerar códigos QR por meio de parâmetros de URL – perfeito para incorporar em sites, e-mails ou fluxos de trabalho automatizados.', 'Quando você adiciona sobreposições ou animações, o ANQR equilibra o estilo com a confiabilidade da digitalização para que o resultado permaneça digitalizável.', 'ANQR concentra-se em códigos estáticos (os dados estão dentro do QR). Se precisar de um código dinâmico (destino editável), você pode codificar seu próprio URL de redirecionamento ou link curto.'],
    },
    {
      heading: 'Quem opera a ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Publicidade e como permanecemos livres',
      paragraphs: ['ANQR é de uso gratuito e é apoiado por publicidade. Poderemos exibir anúncios por meio do Google AdSense e/ou de outros parceiros de publicidade.', 'Os provedores de anúncios podem usar cookies ou tecnologias semelhantes para personalizar anúncios com base em seus interesses e atividade de navegação. Você pode gerenciar as preferências de anúncios nas configurações do seu dispositivo e nas configurações de anúncios do Google e saber mais em nossa Política de Privacidade.', 'Não vendemos o conteúdo que você codifica em códigos QR. Os anúncios ajudam a cobrir os custos de execução e melhoria do projeto.'],
    },
    {
      heading: 'Padrões abertos',
      paragraphs: ['ANQR gera códigos QR com base no padrão ISO/IEC 18004 e visa ampla compatibilidade entre scanners, câmeras e fluxos de trabalho de impressão.'],
    },
    {
      heading: 'Aviso de marca registrada',
      paragraphs: ['QR Code® é uma marca registrada da DENSO WAVE INCORPORATED. ANQR não é afiliado, endossado ou patrocinado pela DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Feedback e contribuições',
      paragraphs: ['Agradecemos comentários, relatórios de bugs e sugestões de recursos. Entre em contato por e-mail ou pela página de contato - lemos todas as mensagens, embora o tempo de resposta possa variar.'],
    },
  ],
};

export default about;
