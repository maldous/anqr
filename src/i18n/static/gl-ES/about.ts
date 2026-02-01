import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Acerca de ANQR',
  description: 'ANQR é un xerador de códigos QR gratuíto cun enfoque centrado no cliente: xera códigos QR localmente ou utiliza a nosa API para incrustar.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Abre o xerador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explorar artigos para aprender', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Política de privacidade', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Condicións de servizo', type: 'external' },
  ],
  sections: [
    {
      heading: 'Que é ANQR?',
      paragraphs: ['ANQR (pronunciado "áncora") é un xerador de códigos QR gratuíto que crea códigos escaneables para URL, texto, credenciais wifi, tarxetas de contacto, eventos do calendario e moito máis.', 'Está construído para individuos, pequenas empresas, comerciantes e desenvolvedores que queren ferramentas QR potentes sen rexistrarse. O deseño de cliente primeiro significa que os códigos QR se xeran localmente no teu navegador de forma predeterminada, cunha API de servidor opcional para a integración e a integración profesional.'],
    },
    {
      heading: 'Características clave',
      bullets: ['Xera códigos QR ao instante no teu navegador, sen necesidade de conta.', 'Personaliza as cores, os estilos de módulos, os patróns do buscador e engade superposicións de imaxes.', 'Exporta en varios formatos: PNG, SVG, WebP e GIF animados.', 'Controis avanzados para o nivel de corrección de erros, a versión QR, o modo de codificación e a selección de máscara.', 'Guía de seguridade de dixitalización e vista previa en directo para manter os códigos lexibles na impresión e nas pantallas.', 'API do servidor para incorporación profesional con soporte completo de parámetros.', 'Funciona sen conexión unha vez cargado: é unha aplicación web estática que podes executar en calquera lugar.'],
    },
    {
      heading: 'Como funciona ANQR',
      paragraphs: ['ANQR execútase no teu navegador e codifica a túa entrada nunha matriz QR estándar con corrección de erros de Reed-Solomon e, a continuación, representa o formato que escollas.', 'Por defecto, a xeración ocorre localmente no teu navegador. Para uso profesional, tamén podes usar a API do servidor para xerar códigos QR mediante parámetros URL, perfecto para inserir en sitios web, correos electrónicos ou fluxos de traballo automatizados.', 'Cando engades superposicións ou animacións, ANQR equilibra o estilo coa fiabilidade da dixitalización para que o resultado siga sendo escaneable.', 'ANQR céntrase en códigos estáticos (os datos están dentro do QR). Se precisas un código dinámico (destino editable), podes codificar o teu propio URL de redirección ou ligazón curta.'],
    },
    {
      heading: 'Quen opera ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'A publicidade e como quedamos libres',
      paragraphs: ['ANQR é gratuíto e está apoiado pola publicidade. Podemos mostrar anuncios a través de Google AdSense e/ou outros socios publicitarios.', 'Os provedores de anuncios poden usar cookies ou tecnoloxías similares para personalizar os anuncios en función dos seus intereses e da súa actividade de navegación. Podes xestionar as preferencias de anuncios na configuración do teu dispositivo e a través da configuración de anuncios de Google, e obter máis información na nosa Política de privacidade.', 'Non vendemos o contido que codificas en códigos QR. Os anuncios axudan a cubrir o custo de execución e mellora do proxecto.'],
    },
    {
      heading: 'Estándares abertos',
      paragraphs: ['ANQR xera códigos QR baseados no estándar ISO/IEC 18004 e ten como obxectivo unha ampla compatibilidade entre escáneres, cámaras e fluxos de traballo de impresión.'],
    },
    {
      heading: 'Aviso de marca comercial',
      paragraphs: ['QR Code® é unha marca rexistrada de DENSO WAVE INCORPORATED. ANQR non está afiliada, avalada ou patrocinada por DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Comentarios e contribucións',
      paragraphs: ['Agradecemos comentarios, informes de erros e suxestións de funcións. Póñase en contacto por correo electrónico ou na páxina de contacto: lemos todas as mensaxes, aínda que os tempos de resposta poden variar.'],
    },
  ],
};

export default about;
