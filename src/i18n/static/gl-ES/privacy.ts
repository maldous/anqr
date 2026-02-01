import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: 'Política de privacidade',
  description: 'A información que recolle ANQR, como se usa e os teus dereitos segundo as leis de privacidade aplicables.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Condicións de servizo', type: 'external' }],
  sections: [
    {
      heading: 'Resumo',
      paragraphs: ['ANQR é un xerador de códigos QR cun enfoque centrado no cliente. Non esiximos que crees unha conta. Por defecto, os códigos QR xéranse localmente no teu navegador; non temos acceso ao contido que codificas.', 'Para uso profesional, ANQR ofrece unha API do servidor que xera códigos QR a partir de parámetros URL. Ao usar a API, o teu contido QR procédese nos nosos servidores para renderizar a imaxe, pero non se almacena nin se rexistra.', 'Usamos Google AdSense para facer publicidade e podemos utilizar servizos de análise. Estes servizos recollen información a través de cookies e tecnoloxías similares. Esta política explica que datos se recollen, como se usan e os teus dereitos.'],
    },
    {
      heading: 'Información que recollemos',
      bullets: ['Información que proporcionas: se contactas connosco por correo electrónico ou polo noso formulario de contacto, recollemos o teu nome, enderezo de correo electrónico e contido da mensaxe.', 'Información recollida automaticamente: o noso provedor de hospedaxe (Netlify), os socios de publicidade e os servizos de análise poden recoller: enderezo IP, tipo e versión de navegador, sistema operativo, tipo de dispositivo, URL de referencia, páxinas visitadas, tempo no sitio e localización xeográfica aproximada.', 'Cookies de terceiros: os nosos socios publicitarios (Google AdSense) usan cookies e tecnoloxías similares para servir e medir anuncios. O propio ANQR non establece cookies propias.'],
    },
    {
      heading: 'Cookies e tecnoloxías de terceiros',
      paragraphs: ['ANQR non establece cookies propias. As túas preferencias (como o modo escuro) almacénanse localmente no teu dispositivo, que non se transmite a ningún servidor.', 'Non obstante, os nosos socios publicitarios (Google AdSense) e o provedor de hospedaxe poden utilizar cookies e tecnoloxías de seguimento similares:'],
      bullets: ['Cookies publicitarias (de terceiros): configuradas por Google AdSense e os socios publicitarios para publicar anuncios relevantes, medir o rendemento dos anuncios e comprender os intereses dos usuarios. Estas cookies poden rastrexar a súa actividade en diferentes sitios web.', 'Cookies de análise (de terceiros): poden ser utilizadas polo noso provedor de hospedaxe ou servizos de análise para recoller datos de uso anónimos.'],
    },
    {
      heading: 'Google AdSense e publicidade',
      paragraphs: ['Mostramos anuncios a través de Google AdSense. Google e os seus socios usan cookies para publicar anuncios baseados no seu historial de navegación neste sitio e noutros sitios web (publicidade baseada en intereses).', 'Obtén información sobre como usa Google a túa información: https://policies.google.com/technologies/partner-sites', 'Xestionar a personalización de anuncios: https://adssettings.google.com', 'Desactivar a través da Network Advertising Initiative: https://optout.networkadvertising.org', 'Desactivar a través de Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Como usamos a información',
      bullets: ['Para responder ás túas consultas e ofrecer apoio.', 'Para mostrar anuncios relevantes a través dos nosos socios publicitarios.', 'Para analizar o uso do sitio e mellorar os nosos servizos.', 'Para detectar, previr e abordar problemas de fraude, abuso e seguridade.', 'Para cumprir coas obrigas legais.'],
    },
    {
      heading: 'Servizos de terceiros',
      bullets: ['Google AdSense: recibe datos para servir e medir anuncios.', 'Provedores de analíticas: recibe datos de uso anónimos.', 'Netlify (aloxamento): procesa solicitudes e pode rexistrar enderezos IP.', 'Non vendemos a súa información persoal. Non obstante, compartir datos con socios publicitarios pode considerarse unha "venda" baixo a CCPA (consulta a continuación).'],
    },
    {
      heading: 'Retención de datos',
      bullets: ['Presentacións de contacto: ata 2 anos.', 'Rexistros do servidor: ata 30 días (proveedor de hospedaxe).', 'Datos analíticos: ata 26 meses (anónimos).', 'Cookies publicitarias: normalmente 13 meses (varía segundo o socio).'],
    },
    {
      heading: 'Os teus dereitos segundo o GDPR (usuarios do EEE)',
      paragraphs: ['Se estás no Espazo Económico Europeo, tes os seguintes dereitos segundo o Regulamento Xeral de Protección de Datos:'],
      bullets: ['Dereito de acceso: solicita unha copia dos datos persoais que temos sobre ti.', 'Dereito de rectificación: Solicitar a corrección dos datos inexactos.', 'Dereito de supresión: Solicita a eliminación dos teus datos ("dereito ao esquecemento").', 'Dereito a restrinxir o tratamento: Solicita límites sobre como usamos os teus datos.', 'Dereito á portabilidade dos datos: Solicite os seus datos nun formato portátil.', 'Dereito de oposición: oposición ao tratamento, incluso para marketing directo.', 'Dereito a retirar o consentimento: Retirar o consentimento en calquera momento cando o tratamento se basee no consentimento.', 'Dereito a presentar unha reclamación: presenta unha reclamación ante a túa autoridade de protección de datos.'],
    },
    {
      heading: 'Base legal do GDPR',
      paragraphs: ['Tratamos datos sobre estas bases: (a) Consentimento - para publicidade personalizada (xestionada polos nosos socios publicitarios); (b) Intereses lexítimos - para análise, seguridade e mellora; (c) Contrato: para responder a consultas.', 'Para exercer os seus dereitos, póñase en contacto con email@anqr.link. Respondemos nun prazo de 30 días.'],
    },
    {
      heading: 'Os teus dereitos baixo a CCPA (usuarios de California)',
      bullets: ['Dereito a coñecer: solicitar información sobre os datos recollidos, fontes, finalidades e terceiros.', 'Dereito a borrar: Solicita a eliminación da túa información persoal.', 'Dereito de exclusión: desactiva a "venda" de información persoal (pode ser apto para compartir con socios publicitarios).', 'Dereito á non discriminación: Non discriminaremos polo exercicio dos teus dereitos.'],
    },
    {
      heading: 'Categorías CCPA recollidas',
      paragraphs: ['Categorías: identificadores (enderezo IP, ID do dispositivo), actividade en Internet (navegación, interaccións con anuncios), xeolocalización (aproximado), inferencias (intereses da navegación).', 'Para exercer os dereitos ou cancelar a opción: email@anqr.link ou axustar a configuración das cookies.'],
    },
    {
      heading: 'Transferencias internacionais',
      paragraphs: ['A súa información pode ser transferida a países con diferentes leis de protección de datos, incluídos os Estados Unidos. Utilizamos as garantías adecuadas, como as cláusulas contractuais estándar.'],
    },
    {
      heading: 'Privacidade dos nenos',
      paragraphs: ['O ANQR non está dirixido a menores de 13 anos (ou 16 no EEE). Non recollemos deliberadamente datos dos nenos. Contacta con email@anqr.link se cres que un neno proporcionou información.'],
    },
    {
      heading: 'Seguridade',
      paragraphs: ['Utilizamos medidas técnicas e organizativas adecuadas para protexer os datos, incluído o cifrado HTTPS. Non obstante, ningunha transmisión por internet é 100% segura.'],
    },
    {
      heading: 'Non rastrexar',
      paragraphs: ['Respectamos os sinais do navegador Non rastrexar cando sexa posible, aínda que os socios publicitarios poden non responder a DNT.'],
    },
    {
      heading: 'Cambios nesta política',
      paragraphs: ['É posible que actualicemos esta política periodicamente. A data de "Última actualización" indica a revisión máis recente. Os cambios significativos pódense comunicar a través dun banner do sitio.'],
    },
    {
      heading: 'Contacta connosco',
      paragraphs: ['Para preguntas de privacidade ou para exercer os seus dereitos: email@anqr.link ou use a nosa páxina de contacto. Respondemos ás solicitudes de privacidade nun prazo de 30 días.'],
    },
    {
      heading: 'Política de privacidade completa',
      paragraphs: ['Esta páxina ofrece un resumo das nosas prácticas de privacidade. Para obter a política de privacidade completa e legalmente vinculante con todos os detalles sobre o procesamento de datos, os teus dereitos e as nosas obrigas en virtude do GDPR, CCPA e outras leis de privacidade, consulta a nosa política completa aloxada por iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Ver política de privacidade completa en iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
