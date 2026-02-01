import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Termes del servei',
  description: 'Per accedir o usar el lloc web, esteu d\'acord amb aquests termes.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Política de privadesa', type: 'external' }],
  sections: [
    {
      heading: 'Acceptació de termes',
      paragraphs: ['Per accedir o usar ANQR (anqr.link), esteu d\'acord en estar vinculats a aquests termes de serveis i política de privadesa. Si no esteu d\'acord amb aquests termes, no utilitzeu el lloc web.', 'Podem actualitzar aquests termes de tant en tant. Amb l\'ús del lloc web després dels canvis constitueix l\'acceptació dels nous termes.'],
    },
    {
      heading: 'Eligibilitat',
      paragraphs: ['Deus ser com a mínim 13 anys d\'edat per fer servir AAAQR. Utilitzant el lloc web, representes que coneixes aquest requisit d\'edat. Si tens 18 anys, representes que tens el teu pare o el permís de tutor per usar el lloc web.'],
    },
    {
      heading: 'Ús autoritzat',
      paragraphs: ['Només es pot utilitzar ANP per a propòsits legals. Ets només responsable del contingut que codificar en codis de QR i de com utilitzes els codis QR que genereu.'],
    },
    {
      heading: 'Conducta prohibida',
      paragraphs: ['Esteu d\'acord a no:'],
      bullets: ['Useu ANQR per crear codis QR que facilitaran la distribució de danys, frau, trams, assetjament, difamació o activitat il·legal.', 'Codifica el contingut que provoca els drets de propietat intel·lectual, viola la privacitat, o conté material il·legal.', 'Intenta interrompre, sobrecàrrega, o interferir en l\'operació o seguretat del lloc web.', 'Un enginyer invertit, descompile, o intent d\'extreure codi font des del lloc web.', 'Usa eines automàtiques (bots, restes) per accedir al lloc d\' una manera que degraci el rendiment per als altres usuaris.', 'Circumvent o desactiva qualsevol característiques de control de seguretat o accés.', 'Suposaré qualsevol persona o entitat o mal representant la seva afiliació.'],
    },
    {
      heading: 'Propietat intel· lectual',
      paragraphs: ['Mantenim la propietat del contingut que codificar en codis QR. ANQR no reclama propietat de les seves dades.', 'El nom ANQR, logo, disseny de la interfície, i el codi subjacent està protegit per copyright, marca registrada i altres lleis de propietat intel·lectual. No pots copiar, modificar, distribuir, o crear derivats funciona sense el nostre permís.', 'El codi QR® és una marca registrada per l\'INCORORE. L\'ANQR no té cap relació amb el DENSO WAVE.'],
    },
    {
      heading: 'Llicència de contingut de l\' usuari',
      paragraphs: ['Utilitzant ANQR, no ens doneu drets al vostre contingut. Quan s\' usa la generació local (per omissió), tota la generació de codi QR passa al vostre navegador i no tenim accés, emmagatzemar o transmetre les vostres dades codificades.', 'Quan s\' usa l\' API del servidor, el vostre contingut es processa per generar la imatge QR però no està desat, registrat o usat per a qualsevol altre propòsit més enllà de renderitzar la imatge sol· licitada.'],
    },
    {
      heading: 'Serveis de tercers i publicitat',
      paragraphs: ['La pàgina mostra anuncis a través de Google AdSenses i pot incloure enllaços a pàgines web de tercers. No som responsables del contingut de tercers, serveis o pràctiques de privacitat.', 'Les vostres interaccions amb anunciants i tercers partits només estan entre vosaltres i ells. Mireu la nostra política de privadesa per obtenir informació sobre pràctiques de dades de publicitat.'],
    },
    {
      heading: 'Disclaimer de les ordres',
      paragraphs: ['S\'OFEREIX "ASS ÉS" I "ASVATIABLE" LA COMECCIÓ DE LES PARTICCIÓ, NI IMGINALES, AIXÒ INCLOU, PERÒ NO INCLOENTS DE COMERCIALITZABLE, SIGUI ADEQUAT PER A CAP PARTICCIÓ, I NON- INFRECCIÓ.', 'No garanteixem que: (a) el lloc serà ininterromput, segur o sense errors; (b) els codis QR exploraran en tots els entorns, en tots els dispositius, o amb totes les aplicacions escàner; (c) el lloc es reuniran els vostres requeriments.', 'Sempre hauríeu de posar a prova els codis QR en les condicions en què s\' usaran (mida de la impressió, llum, tipus de pantalla, distància, qualitat de càmera).'],
    },
    {
      heading: 'Limitació de responsabilitat',
      paragraphs: ['A LA MAXMUM PER A LA MERRIT PER A LA LLAR, AQR ITS IPERANS, AFFILLISS, I LICENS MECT NOBLEBLE PER A CAP DIRECTE, INDIRECT, AJECUL, L\'AUTOR, RELAR, LA CONSECUUTE, O EXEMRITERIUBU, NO CONS MODIFICADA PER A LA CONS MODIFICADA DEL PRESPONS, RELAT, REUDAIU, L\'HADU, L\'AUTOR O LA INTERT, L\'ESCRIPTOR O CONSULTIONAT O CONSEVOL ALTECTE, O CONSEVOL A LA PART DE LA PART DE LA PART ESTE O CORRECCIÓ O CONSECT ALTECTE.', 'T\'HE ENTÈS MOLT BÉ QUE LA SEVA USECIÓ ÉS LA TEVA RISC. LA INFRAESTRUCTURA S\'OFEREIX, I, DE FET, ÉS A DIR, UN GRAN NOMBRE I ELS LEGISLADORS NO TENEN CAPACITAT D\'IMMOÞI PER EVITAR QUE NINGÚ S\'OBSESSIONI. A NO EVENT LEGECCIÓ LEGECCIÓ EXCEDA DOLLAR (0 UAD).', 'VOSTÈ TÉ L\'OPORTUNITAT DE VENJAR-SE I ESCOLTAR QUALSEVOL ACCIÓ I TOTS ELS CONSUMIDORS, DEMANDES I LA CAPACITAT D\'APLICAR-SE, L\'ACORD DE L\'ORGANITZACIÓ, L\'EQUIP D\'ACORD AMB L\'AQR I JO ...', 'ALGUNES PERSONES ES FAN RESSÒ DE LES BATERIES O DE L\'AVALUACIÓ. A TRAVÉS DE LES FÀBRIQUES, LA NOSTRA OPINIÓ POT SER LA PRODUCCIÓ D\'ELECTRICITAT PER AL MAXMUM ELS RIVIES PER LA LLAR DE LLANABABABLE.'],
    },
    {
      heading: 'Indemnificació',
      paragraphs: ['Esteu d\'acord amb la indemnització, defensar i mantenir inofensiva AQR, els seus operadors, filimes, i els seus respectius oficials, directors, empleats i agents de qualsevol declaració, danys, pèrdues, liabilitats, costos i despeses legals (incloent els seus operadors) des de: (a) el vostre ús de la pàgina; (b) la vostra violació d\'aquests termes; (c) la violació de qualsevol altre drets de tercers partits; (d) qualsevol contingut que incriqueu en codis QR.'],
    },
    {
      heading: 'Resolució Disputada',
      paragraphs: ['Qualsevol disputa arisant-se d\'aquests termes o el seu ús de l\'ANQR serà intentat resoldre-ho mitjançant la negociació informal per contactar amb el correu electrònic@anqr. link.', 'Si la resolució informal falla, els conflictes es resoldrean mitjançant la unió a la Victoria, Austràlia, excepte que qualsevol partit pot cercar un alleujament injuntiva en el tribunal per les violacions de la propietat intel·lectual.'],
    },
    {
      heading: 'Acció per a la classe',
      paragraphs: ['PER A L\'OFERTA DE LA RESIÞIIII, VOSTÈ GARANTEIX QUE QUALSEVOL ACCIÓ POT FER QUE LA PROTESTA I LA PROTESTA SERÀ LA POSSIBILITAT D\'ACONSEGUIR UN CANVI D\'INSPECCIÓ INDI I NO A UNA CLASS, O CONTINICCIÓ.'],
    },
    {
      heading: 'Comment',
      paragraphs: ['Aquests termes estan governats per les lleis de la Victoria, Austràlia, sense cap mena de conflicte de lleis. Vas consentir a la jurisdicció exclusiva dels tribunals localitzats a la Victoria, Austràlia.'],
    },
    {
      heading: 'Canvis i disponibilitat',
      paragraphs: ['Podem modificar, suspendre, o suspendre el lloc (o qualsevol part d\'això) en qualsevol moment sense adonar-nos ni responsabilitats.', 'Podem actualitzar aquests termes en qualsevol moment. La data "última actualització" indica quan han estat revisades recentment. S\' usa després dels canvis constitueix l\' acceptació.'],
    },
    {
      heading: 'Usabilitat',
      paragraphs: ['Si qualsevol disposició d\'aquestes condicions és no vàlida o no forçable, aquesta disposició es forçarà a la màxima mesura permissible, i les disposicions restants romandran en plena força i efecte.'],
    },
    {
      heading: 'Waiverrepublic_ of_ ireland. kgm',
      paragraphs: ['El nostre fracàs per complir qualsevol dret o disposició d\'aquests termes no se\'ls pot considerar un enfrontament d\'aquesta dreta o disposició.'],
    },
    {
      heading: 'Acord complet',
      paragraphs: ['Aquests termes, juntament amb la nostra política de privadesa, constitueixen tot l\'acord entre vosaltres i ANQR sobre el vostre ús del lloc web i reemplaça qualsevol acord previ.'],
    },
    {
      heading: 'Força majeure',
      paragraphs: ['No serem responsables de cap fracàs o retards en l\'actuació degut a circumstàncies més enllà del nostre control raonable, incloent desastres naturals, guerra, terrorisme, disturbis, accions del govern, o errors d\'estructura d\'Internet/nogra.'],
    },
    {
      heading: 'Contacte',
      paragraphs: ['Preguntes sobre aquestes Els termes es poden enviar a: mail@ anqr.link'],
    },
  ],
};

export default terms;
