import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contacta connosco',
  description: 'Agradecemos comentarios, informes de erros, solicitudes de funcións e consultas xerais.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Como chegar a nós',
      paragraphs: ['Ofrecemos varias formas de contactar connosco dependendo das súas necesidades. Lemos todas as mensaxes, aínda que os tempos de resposta poden variar segundo o volume e o tipo de consulta.'],
    },
    {
      heading: 'Correo electrónico',
      paragraphs: ['Para todas as consultas: email@anqr.link', 'Esta é a forma máis fiable de contactar connosco e recoméndase para preguntas detalladas, consultas comerciais ou calquera outra consulta.'],
    },
    {
      heading: 'Tipos de consultas',
      bullets: ['Preguntas xerais: preguntas sobre como usar ANQR, explicacións de funcións ou comentarios xerais.', 'Informes de erros: inclúa o teu navegador, sistema operativo, pasos para reproducir e calquera mensaxe de erro que vexas.', 'Solicitudes de funcións: suxestións de novas funcións ou melloras. Consideramos todas as solicitudes aínda que non podemos prometer a súa implementación.', 'Consultas comerciais: oportunidades de asociación, preguntas sobre licenzas ou consultas de uso comercial.', 'Solicitudes de privacidade: solicitudes para exercer os teus dereitos de privacidade segundo o GDPR, CCPA ou outras leis de privacidade (consulta a Política de privacidade).', 'DMCA/Copyright: consulta a sección DMCA a continuación para coñecer os requisitos de notificación de retirada.'],
    },
    {
      heading: 'Tempos de resposta',
      paragraphs: ['Pretendemos responder ás consultas nun prazo de 5 a 7 días hábiles. As solicitudes relacionadas coa privacidade abordaranse nun prazo de 30 días, segundo o esixe a lei.', 'Durante os períodos de actividade, os tempos de resposta poden ser máis longos. Para asuntos urxentes, indique "URXENTE" no asunto.'],
    },
    {
      heading: 'Antes de contactar connosco',
      paragraphs: ['Consulte a nosa páxina de documentación para obter respostas ás preguntas comúns sobre como usar as funcións ANQR. Moitas preguntas sobre a xeración de código QR, o estilo e as opcións de exportación atópanse alí.'],
    },
    {
      heading: 'Avisos de copyright da DMCA',
      paragraphs: ['Se cres que o contido dispoñible en ANQR infrinxe os teus dereitos de autor, podes enviar un aviso de retirada da Digital Millennium Copyright Act (DMCA). Para ser válido, o seu aviso debe incluír:'],
      bullets: ['Unha sinatura física ou electrónica do propietario dos dereitos de autor ou axente autorizado.', 'Identificación da obra protexida por copyright que se afirma que se infrinxiu.', 'Identificación do material que se alega infractor, con información suficiente para localizalo.', 'A súa información de contacto (enderezo, número de teléfono e enderezo de correo electrónico).', 'Unha declaración de que cres de boa fe que o uso do material non está autorizado polo propietario do copyright.', 'Unha declaración, baixo pena de perxuro, de que a información do seu aviso é precisa e de que vostede é o propietario dos dereitos de autor ou está autorizado para actuar no seu nome.'],
    },
    {
      heading: 'Contacto DMCA',
      paragraphs: ['Envíe avisos DMCA a: email@anqr.link', 'Inclúe "Aviso DMCA" no asunto. Responderemos aos avisos válidos de acordo coa lexislación aplicable. Teña en conta que ANQR xera códigos QR localmente nos dispositivos dos usuarios e non aloxa contido xerado polos usuarios.'],
    },
    {
      heading: 'Comunidade Reddit',
      paragraphs: ['Únete á nosa comunidade de Reddit en r/ANQR para compartir as túas creacións de QR, facer preguntas, obter axuda e conectar con outros usuarios de ANQR.'],
    },
  ],
};

export default contact;
