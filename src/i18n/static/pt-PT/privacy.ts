import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: 'Política de Privacidade',
  description: 'Informações que a ANQR coleta, como são usadas e seus direitos sob as leis de privacidade aplicáveis.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Termos de Serviço', type: 'external' }],
  sections: [
    {
      heading: 'Resumo',
      paragraphs: ['ANQR é um gerador de código QR com abordagem que prioriza o cliente. Não exigimos que você crie uma conta. Por padrão, os códigos QR são gerados localmente no seu navegador – não temos acesso ao conteúdo que você codifica.', 'Para uso profissional, ANQR fornece uma API do lado do servidor que gera códigos QR a partir de parâmetros de URL. Ao usar a API, seu conteúdo QR é processado em nossos servidores para renderizar a imagem, mas não é armazenado ou registrado.', 'Usamos o Google AdSense para publicidade e podemos usar serviços de análise. Estes serviços recolhem informações através de cookies e tecnologias semelhantes. Esta política explica quais dados são coletados, como são usados ​​​​e seus direitos.'],
    },
    {
      heading: 'Informações que coletamos',
      bullets: ['Informações que você fornece: Se você entrar em contato conosco por e-mail ou formulário de contato, coletaremos seu nome, endereço de e-mail e conteúdo da mensagem.', 'Informações coletadas automaticamente: Nosso provedor de hospedagem (Netlify), parceiros de publicidade e serviços de análise podem coletar: endereço IP, tipo e versão do navegador, sistema operacional, tipo de dispositivo, URL de referência, páginas visitadas, tempo no site e localização geográfica aproximada.', 'Cookies de terceiros: Nossos parceiros publicitários (Google AdSense) utilizam cookies e tecnologias semelhantes para veicular e medir anúncios. A própria ANQR não define nenhum cookie primário.'],
    },
    {
      heading: 'Cookies e tecnologias de terceiros',
      paragraphs: ['ANQR não define cookies primários. Suas preferências (como o modo escuro) são armazenadas localmente no seu dispositivo, que não são transmitidas para nenhum servidor.', 'No entanto, os nossos parceiros de publicidade (Google AdSense) e o fornecedor de alojamento podem utilizar cookies e tecnologias de rastreamento semelhantes:'],
      bullets: ['Cookies de publicidade (de terceiros): definidos pelo Google AdSense e parceiros de publicidade para veicular anúncios relevantes, medir o desempenho dos anúncios e compreender os interesses do usuário. Esses cookies podem rastrear sua atividade em diferentes sites.', 'Cookies analíticos (de terceiros): podem ser usados pelo nosso provedor de hospedagem ou serviços analíticos para coletar dados de uso anonimizados.'],
    },
    {
      heading: 'Google AdSense e publicidade',
      paragraphs: ['Exibimos anúncios através do Google AdSense. O Google e seus parceiros usam cookies para veicular anúncios com base no seu histórico de navegação neste site e em outros sites (publicidade baseada em interesses).', 'Saiba como o Google usa suas informações: https://policies.google.com/technologies/partner-sites', 'Gerencie a personalização de anúncios: https://adssettings.google.com', 'Desative por meio da Network Advertising Initiative: https://optout.networkadvertising.org', 'Desative por meio da Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Como usamos as informações',
      bullets: ['Para responder às suas perguntas e fornecer suporte.', 'Para exibir anúncios relevantes através dos nossos parceiros publicitários.', 'Para analisar o uso do site e melhorar nossos serviços.', 'Para detectar, prevenir e resolver problemas de fraude, abuso e segurança.', 'Para cumprir obrigações legais.'],
    },
    {
      heading: 'Serviços de terceiros',
      bullets: ['Google AdSense: Recebe dados para veicular e medir anúncios.', 'Provedores de análise: recebam dados de uso anonimizados.', 'Netlify (hospedagem): Processa solicitações e pode registrar endereços IP.', 'Não vendemos suas informações pessoais. No entanto, a partilha de dados com parceiros publicitários pode ser considerada uma "venda" ao abrigo da CCPA (ver abaixo).'],
    },
    {
      heading: 'Retenção de dados',
      bullets: ['Envios de contato: Até 2 anos.', 'Logs do servidor: Até 30 dias (provedor de hospedagem).', 'Dados analíticos: Até 26 meses (anonimizados).', 'Cookies publicitários: Normalmente 13 meses (varia de acordo com o parceiro).'],
    },
    {
      heading: 'Seus direitos sob o GDPR (usuários do EEE)',
      paragraphs: ['Se estiver no Espaço Económico Europeu, tem os seguintes direitos ao abrigo do Regulamento Geral de Proteção de Dados:'],
      bullets: ['Direito de acesso: Solicitar uma cópia dos dados pessoais que mantemos sobre você.', 'Direito à retificação: Solicitar a correção de dados inexatos.', 'Direito ao apagamento: Solicitar a eliminação dos seus dados ("direito ao esquecimento").', 'Direito de restringir o processamento: Solicitar limites sobre como usamos seus dados.', 'Direito à portabilidade dos dados: Solicite os seus dados em formato portátil.', 'Direito de oposição: Opor-se ao processamento, inclusive para marketing direto.', 'Direito de retirar o consentimento: Retirar o consentimento a qualquer momento quando o processamento for baseado no consentimento.', 'Direito de apresentar uma reclamação: apresente uma reclamação junto da sua autoridade de proteção de dados.'],
    },
    {
      heading: 'Base jurídica do GDPR',
      paragraphs: ['Processamos dados nestas bases: (a) Consentimento – para publicidade personalizada (gerida pelos nossos parceiros publicitários); (b) Interesses legítimos – para análise, segurança e melhoria; (c) Contrato - para atendimento de dúvidas.', 'Para exercer os seus direitos, contacte email@anqr.link. Respondemos em até 30 dias.'],
    },
    {
      heading: 'Seus direitos sob CCPA (usuários da Califórnia)',
      bullets: ['Direito de saber: Solicitar informações sobre os dados coletados, fontes, finalidades e terceiros.', 'Direito de exclusão: Solicitar a exclusão de suas informações pessoais.', 'Direito de cancelar: cancelar a "venda" de informações pessoais (o compartilhamento com parceiros de publicidade pode ser qualificado).', 'Direito à não discriminação: Não discriminaremos o exercício dos seus direitos.'],
    },
    {
      heading: 'Categorias CCPA coletadas',
      paragraphs: ['Categorias: Identificadores (endereço IP, ID do dispositivo), Atividade na Internet (navegação, interações com anúncios), Geolocalização (aproximada), Inferências (interesses de navegação).', 'Para exercer direitos ou cancelar: email@anqr.link ou ajustar as configurações de cookies.'],
    },
    {
      heading: 'Transferências internacionais',
      paragraphs: ['Suas informações podem ser transferidas para países com diferentes leis de proteção de dados, incluindo os Estados Unidos. Usamos salvaguardas apropriadas, como Cláusulas Contratuais Padrão.'],
    },
    {
      heading: 'Privacidade das crianças',
      paragraphs: ['A ANQR não se destina a crianças menores de 13 anos (ou 16 anos no EEE). Não coletamos intencionalmente dados de crianças. Contate email@anqr.link se você acredita que uma criança forneceu informações.'],
    },
    {
      heading: 'Segurança',
      paragraphs: ['Utilizamos medidas técnicas e organizacionais adequadas para proteger os dados, incluindo criptografia HTTPS. No entanto, nenhuma transmissão pela Internet é 100% segura.'],
    },
    {
      heading: 'Não rastrear',
      paragraphs: ['Respeitamos os sinais do navegador Do Not Track sempre que possível, embora os parceiros de publicidade possam não responder ao DNT.'],
    },
    {
      heading: 'Alterações nesta política',
      paragraphs: ['Poderemos atualizar esta política periodicamente. A data da "Última atualização" indica a revisão mais recente. Mudanças significativas podem ser comunicadas através de um banner no site.'],
    },
    {
      heading: 'Contate-nos',
      paragraphs: ['Para questões de privacidade ou para exercer os seus direitos: email@anqr.link ou utilize a nossa página de contacto. Respondemos às solicitações de privacidade dentro de 30 dias.'],
    },
    {
      heading: 'Política de Privacidade Completa',
      paragraphs: ['Esta página fornece um resumo de nossas práticas de privacidade. Para obter a política de privacidade completa e juridicamente vinculativa, com detalhes completos sobre o processamento de dados, seus direitos e nossas obrigações sob o GDPR, CCPA e outras leis de privacidade, consulte nossa política completa hospedada pela iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Veja a Política de Privacidade Completa na iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
