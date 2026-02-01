import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Termos de Serviço',
  description: 'Ao acessar ou usar o site, você concorda em ficar vinculado a estes termos.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Política de Privacidade', type: 'external' }],
  sections: [
    {
      heading: 'Aceitação dos termos',
      paragraphs: ['Ao acessar ou usar o ANQR (anqr.link), você concorda em obedecer a estes Termos de Serviço e à nossa Política de Privacidade. Se você não concorda com estes termos, não utilize o site.', 'Poderemos atualizar estes Termos de tempos em tempos. O uso continuado do site após as alterações constitui aceitação dos novos termos.'],
    },
    {
      heading: 'Elegibilidade',
      paragraphs: ['Você deve ter pelo menos 13 anos de idade para usar o ANQR. Ao usar o site, você declara que atende a esse requisito de idade. Se você tem menos de 18 anos, você declara que tem permissão de seus pais ou responsáveis ​​para usar o site.'],
    },
    {
      heading: 'Uso permitido',
      paragraphs: ['Você pode usar o ANQR apenas para fins legais. Você é o único responsável pelo conteúdo que codifica em códigos QR e pela forma como usa quaisquer códigos QR gerados.'],
    },
    {
      heading: 'Conduta proibida',
      paragraphs: ['Você concorda em não:'],
      bullets: ['Use ANQR para criar códigos QR que facilitam phishing, distribuição de malware, fraude, golpes, assédio, difamação ou qualquer atividade ilegal.', 'Codifique conteúdo que infrinja direitos de propriedade intelectual, viole a privacidade ou contenha material ilegal.', 'Tentar interromper, sobrecarregar ou interferir na operação ou segurança do site.', 'Faça engenharia reversa, descompile ou tente extrair o código-fonte do site.', 'Use ferramentas automatizadas (bots, scrapers) para acessar o site de uma maneira que prejudique o desempenho de outros usuários.', 'Contorne ou desative quaisquer recursos de segurança ou controle de acesso.', 'Personificar qualquer pessoa ou entidade ou deturpar sua afiliação.'],
    },
    {
      heading: 'Propriedade intelectual',
      paragraphs: ['Você mantém a propriedade do conteúdo codificado em códigos QR. A ANQR não reivindica a propriedade dos seus dados.', 'O nome ANQR, logotipo, design de interface e código subjacente são protegidos por direitos autorais, marcas registradas e outras leis de propriedade intelectual. Você não pode copiar, modificar, distribuir ou criar trabalhos derivados sem nossa permissão.', 'QR Code® é uma marca registrada da DENSO WAVE INCORPORATED. ANQR não é afiliado à DENSO WAVE.'],
    },
    {
      heading: 'Licença de conteúdo do usuário',
      paragraphs: ['Ao usar o ANQR, você não nos concede direitos sobre o seu conteúdo. Ao usar a geração local (o padrão), toda a geração do código QR acontece no seu navegador e não acessamos, armazenamos ou transmitimos seus dados codificados.', 'Ao usar a API do lado do servidor, seu conteúdo é processado para gerar a imagem QR, mas não é armazenado, registrado ou usado para qualquer outra finalidade além de renderizar a imagem solicitada.'],
    },
    {
      heading: 'Serviços e publicidade de terceiros',
      paragraphs: ['O site exibe anúncios através do Google AdSense e pode incluir links para sites de terceiros. Não somos responsáveis ​​por conteúdo, serviços ou práticas de privacidade de terceiros.', 'Suas interações com anunciantes e terceiros ocorrem exclusivamente entre você e eles. Consulte nossa Política de Privacidade para obter informações sobre práticas de dados publicitários.'],
    },
    {
      heading: 'Isenção de garantias',
      paragraphs: ['ANQR É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL", SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO SE LIMITANDO A GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM DETERMINADO FIM E NÃO VIOLAÇÃO.', 'Não garantimos que: (a) o site será ininterrupto, seguro ou livre de erros; (b) Os códigos QR serão lidos em todos os ambientes, em todos os dispositivos ou com todos os aplicativos de scanner; (c) o site atenderá às suas necessidades.', 'Você deve sempre testar os códigos QR nas condições onde serão utilizados (tamanho da impressão, iluminação, tipo de tela, distância, qualidade da câmera).'],
    },
    {
      heading: 'Limitação de responsabilidade',
      paragraphs: ['NA EXTENSÃO MÁXIMA PERMITIDA POR LEI, A ANQR E SEUS OPERADORES, AFILIADOS E LICENCIADORES NÃO SERÃO RESPONSÁVEIS POR QUAISQUER DANOS DIRETOS, INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS, PUNITIVOS OU EXEMPLARES, INCLUINDO, MAS NÃO SE LIMITANDO A DANOS POR PERDA DE LUCROS, RECEITAS, DADOS, BOA VONTADE, USO OU OUTRAS PERDAS INTANGÍVEIS, DECORRENTES DE OU RELACIONADAS AO SEU ACESSO OU USO (OU INCAPACIDADE DE ACESSO OU USO) DO SERVIÇO.', 'VOCÊ ENTENDE E CONCORDA EXPRESSAMENTE QUE O USO DO SERVIÇO É POR SUA CONTA E RISCO. O SERVIÇO É FORNECIDO GRATUITAMENTE E, ASSIM, VOCÊ CONCORDA QUE A ANQR E SEUS OPERADORES NÃO TERÁ QUALQUER RESPONSABILIDADE PERANTE VOCÊ POR QUAISQUER DANOS OU PERDAS. EM HIPÓTESE ALGUMA NOSSA RESPONSABILIDADE AGREGADA TOTAL EXCEDERÁ ZERO DÓLARES (US$ 0 AUD).', 'VOCÊ CONCORDA EM LIBERAR, RENUNCIAR E DESCARTAR TODAS E QUAISQUER RECLAMAÇÕES, EXIGÊNCIAS E CAUSAS DE AÇÃO CONTRA A ANQR E SEUS OPERADORES DECORRENTES DO USO DO SERVIÇO.', 'ALGUMAS JURISDIÇÕES NÃO PERMITEM A EXCLUSÃO DE CERTAS GARANTIAS OU LIMITAÇÕES DE RESPONSABILIDADE. NESTAS JURISDIÇÕES, NOSSA RESPONSABILIDADE SERÁ LIMITADA À EXTENSÃO MÁXIMA PERMITIDA PELA LEI APLICÁVEL.'],
    },
    {
      heading: 'Indenização',
      paragraphs: ['Você concorda em indenizar, defender e isentar a ANQR, seus operadores, afiliados e seus respectivos executivos, diretores, funcionários e agentes de quaisquer reivindicações, danos, perdas, responsabilidades, custos e despesas (incluindo honorários advocatícios) decorrentes de: (a) seu uso do site; (b) sua violação destes Termos; (c) sua violação de quaisquer direitos de terceiros; (d) qualquer conteúdo que você codifique em códigos QR.'],
    },
    {
      heading: 'Resolução de disputas',
      paragraphs: ['Qualquer disputa decorrente destes Termos ou do uso do ANQR deverá primeiro ser resolvida por meio de negociação informal, entrando em contato com email@anqr.link.', 'Se a resolução informal falhar, as disputas serão resolvidas através de arbitragem vinculativa em Victoria, Austrália, exceto que qualquer uma das partes poderá buscar medida cautelar em tribunal por violações de propriedade intelectual.'],
    },
    {
      heading: 'Isenção de ação coletiva',
      paragraphs: ['NA MEDIDA PERMITIDA POR LEI, VOCÊ CONCORDA QUE QUALQUER PROCEDIMENTO DE RESOLUÇÃO DE LITÍGIOS SERÁ CONDUZIDO SOMENTE EM BASE INDIVIDUAL E NÃO EM UMA AÇÃO COLETIVA, CONSOLIDADA OU REPRESENTATIVA.'],
    },
    {
      heading: 'Lei aplicável',
      paragraphs: ['Estes Termos são regidos pelas leis de Victoria, Austrália, sem considerar conflitos de princípios legais. Você concorda com a jurisdição exclusiva dos tribunais localizados em Victoria, Austrália.'],
    },
    {
      heading: 'Mudanças e disponibilidade',
      paragraphs: ['Podemos modificar, suspender ou descontinuar o site (ou qualquer parte dele) a qualquer momento, sem aviso prévio ou responsabilidade.', 'Podemos atualizar estes Termos a qualquer momento. A data da "Última atualização" indica quando foram revisadas mais recentemente. O uso continuado após as alterações constitui aceitação.'],
    },
    {
      heading: 'Divisibilidade',
      paragraphs: ['Se qualquer disposição destes Termos for considerada inválida ou inexequível, essa disposição será aplicada na extensão máxima permitida e as disposições restantes permanecerão em pleno vigor e efeito.'],
    },
    {
      heading: 'Renúncia',
      paragraphs: ['Nossa falha em fazer cumprir qualquer direito ou disposição destes Termos não será considerada uma renúncia a tal direito ou disposição.'],
    },
    {
      heading: 'Acordo integral',
      paragraphs: ['Estes Termos, juntamente com a nossa Política de Privacidade, constituem o acordo integral entre você e a ANQR em relação ao uso do site e substituem quaisquer acordos anteriores.'],
    },
    {
      heading: 'Força maior',
      paragraphs: ['Não seremos responsáveis por qualquer falha ou atraso no desempenho devido a circunstâncias fora do nosso controle razoável, incluindo desastres naturais, guerra, terrorismo, tumultos, ações governamentais ou falhas na Internet/infraestrutura.'],
    },
    {
      heading: 'Contato',
      paragraphs: ['Perguntas sobre estes Termos podem ser enviadas para: email@anqr.link'],
    },
  ],
};

export default terms;
