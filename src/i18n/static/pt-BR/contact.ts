import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contate-nos',
  description: 'Agradecemos comentários, relatórios de bugs, solicitações de recursos e dúvidas gerais.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Como chegar até nós',
      paragraphs: ['Oferecemos diversas maneiras de entrar em contato conosco dependendo de suas necessidades. Lemos todas as mensagens, embora os tempos de resposta possam variar de acordo com o volume e o tipo de consulta.'],
    },
    {
      heading: 'E-mail',
      paragraphs: ['Para todas as dúvidas: email@anqr.link', 'Esta é a maneira mais confiável de entrar em contato conosco e é recomendada para perguntas detalhadas, consultas comerciais ou quaisquer outras dúvidas.'],
    },
    {
      heading: 'Tipos de consultas',
      bullets: ['Perguntas gerais: perguntas sobre como usar ANQR, explicações de recursos ou feedback geral.', 'Relatórios de bugs: inclua seu navegador, sistema operacional, etapas de reprodução e quaisquer mensagens de erro que você vir.', 'Solicitações de recursos: sugestões de novos recursos ou melhorias. Consideramos todas as solicitações, embora não possamos prometer a implementação.', 'Consultas comerciais: oportunidades de parceria, questões de licenciamento ou consultas de uso comercial.', 'Solicitações de privacidade: solicitações para exercer seus direitos de privacidade de acordo com GDPR, CCPA ou outras leis de privacidade (consulte a Política de Privacidade).', 'DMCA/Direitos autorais: consulte a seção DMCA abaixo para saber os requisitos de aviso de remoção.'],
    },
    {
      heading: 'Tempos de resposta',
      paragraphs: ['Nosso objetivo é responder às perguntas dentro de 5 a 7 dias úteis. As solicitações relacionadas à privacidade serão atendidas dentro de 30 dias, conforme exigido por lei.', 'Durante períodos de maior movimento, os tempos de resposta podem ser mais longos. Para assuntos urgentes, indique URGENTE no assunto.'],
    },
    {
      heading: 'Antes de entrar em contato conosco',
      paragraphs: ['Verifique nossa página de documentação para obter respostas a perguntas comuns sobre como usar os recursos ANQR. Muitas questões sobre geração de código QR, estilo e opções de exportação são abordadas lá.'],
    },
    {
      heading: 'Avisos de direitos autorais DMCA',
      paragraphs: ['Se você acredita que o conteúdo disponível no ANQR viola seus direitos autorais, você pode enviar um aviso de remoção da Lei de Direitos Autorais do Milênio Digital (DMCA). Para ser válido, seu aviso deve incluir:'],
      bullets: ['Uma assinatura física ou eletrônica do proprietário dos direitos autorais ou agente autorizado.', 'Identificação do trabalho protegido por direitos autorais alegadamente violado.', 'Identificação do material supostamente infrator, com informações suficientes para localizá-lo.', 'Suas informações de contato (endereço, número de telefone e endereço de e-mail).', 'Uma declaração de que você acredita de boa fé que o uso do material não foi autorizado pelo proprietário dos direitos autorais.', 'Uma declaração, sob pena de perjúrio, de que as informações em seu aviso são precisas e de que você é o proprietário dos direitos autorais ou está autorizado a agir em nome deles.'],
    },
    {
      heading: 'Contato DMCA',
      paragraphs: ['Envie avisos DMCA para: email@anqr.link', 'Inclua "Aviso DMCA" na linha de assunto. Responderemos a avisos válidos de acordo com a lei aplicável. Observe que o ANQR gera códigos QR localmente nos dispositivos dos usuários e não hospeda conteúdo gerado pelo usuário.'],
    },
    {
      heading: 'Comunidade Reddit',
      paragraphs: ['Junte-se à nossa comunidade Reddit em r/ANQR para compartilhar suas criações QR, fazer perguntas, obter ajuda e conectar-se com outros usuários ANQR.'],
    },
  ],
};

export default contact;
