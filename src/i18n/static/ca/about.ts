import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Quant a ANQR',
  description: 'ANQR és un generador de codi lliure amb una aproximació al client - genera codis QR localment o useu la nostra API per a incrustar-se.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Obre el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explora els articles', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Política de privadesa', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Termes del servei', type: 'external' },
  ],
  sections: [
    {
      heading: 'Què és un QR?',
      paragraphs: ['ANQR (pronund "anchor") és un generador de codi lliure QR que crea codis escanejats per URL, text, credencials del Wi-Fi, targetes de contacte, esdeveniments de calendari i més.', 'Es construeix per als individus, petits negocis, mercats, i desenvolupadors que volen eines poderoses de QR sense signar. El primer disseny del client vol dir que els codis QR es generen localment al vostre navegador per omissió, amb una API opcional del servidor per a la integració professional i integració.'],
    },
    {
      heading: 'Funcionalitats de tecla',
      bullets: ['Genera codis QR instantàniament al vostre navegador - no cal cap compte.', 'Personalitza els colors, estils de mòdul, patrons de cerca i afegeix recobriment de la imatge.', 'Exporta en múltiples formats: PNG, SVG, WebP, i animat GIF.', 'Controls avançats per al nivell de correcció d\' errors, versió QR, mode de codificació i selecció de màscara.', 'Ajuda a la vista prèvia i en directe per ajudar a mantenir codis llegibles en la impressió i en pantalles.', 'API del servidor per a l\' encastat professional amb implementació de paràmetres complet.', 'Treballa fora de línia una vegada carregat - és una aplicació web estàtica que podeu executar a qualsevol lloc.'],
    },
    {
      heading: 'Com funciona XLIFF mark type',
      paragraphs: ['ANQR s\' executa en el vostre navegador i codifica la vostra entrada en una matriu estàndard QR amb la correcció d\' errors Reedprintomon, i aleshores la mostrarà al format que trieu.', 'Per omissió, la generació passa localment al vostre navegador. Per a ús professional, també podeu usar l\' API del servidor per generar codis QR a través dels paràmetres URL - perfecte per a incrustar- se en llocs web, correus electrònics o fluxs de treball automatitzats.', 'Quan afegiu recobriment o animacions, un equilibri deQR amb fiabilitat d\'escanejat per tal que el resultat continuï sent escanejat.', 'ANQR es centra en codis estàtics (la informació està dins de la QR). Si necessiteu un codi dinàmic (es pot codificar el vostre propi URL de redirecció o enllaç curt.'],
    },
    {
      heading: 'Qui opera antena?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Publicitzar i com ens quedem lliures',
      paragraphs: ['ANQR és lliure d\'utilitzar i està suportada per publicitat. Podem mostrar anuncis a través de Google AdSenses i/o altres socis de publicitat.', 'Els proveïdors d\'Adlectors poden utilitzar galetes o tecnologies similars per als anuncis personals basats en els vostres interessos i activitats de navegació. Podeu gestionar preferències adverses en els vostres arranjaments de dispositiu i a través de les opcions de Google ad, i aprendre més a la nostra política de privadesa.', 'No venem el contingut que codificar en codis de QR. Ajuda a cobrir el cost de l\'execució i millorar el projecte.'],
    },
    {
      heading: 'Obre els estàndards',
      paragraphs: ['ANQR genera codis QR basats en l\'estàndard ISO/IEC 18004 i pretén compatibilitat àmplia en els escàners, càmeres i fluxs de treball d\' impressió.'],
    },
    {
      heading: 'Nota de marques',
      paragraphs: ['QR Code® és una marca registrada per DENSO WAVE INCORORD. ANQR no té afiliació, per donar suport, o patrocinada per DENSO WAVE INCORE.'],
    },
    {
      heading: 'Comentaris i contribucions',
      paragraphs: ['Nosaltres donem la benvinguda, informes d\'errors i suggeriments de característiques. Si us plau, poseu-vos en contacte mitjançant correu electrònic o en la pàgina de contacte, llegiu cada missatge, encara que els temps de resposta poden variar.'],
    },
  ],
};

export default about;
