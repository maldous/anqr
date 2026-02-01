import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Política de privadesa',
  description:
    "La informació ANQR recull, com s'utilitza, i els seus drets sota lleis de privacitat aplicables.",
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Termes del servei', type: 'external' }],
  sections: [
    {
      heading: 'Resum',
      paragraphs: [
        'ANQR és un generador de codi QR amb un primer enfocament del client. No et necessitem per crear un compte. Per omissió, els codis QR es generen localment al vostre navegador, no tenim accés al contingut que codificar.',
        "Per a l' ús professional, ANQR proporciona una API de l' altre servidor que genera codis QR dels paràmetres URL. Quan s' usa l' API, es processa el contingut QR en els nostres servidors per a renderitzar la imatge, però no està desat o connectat.",
        "Fem servir Google AdSense per publicitat i podrem utilitzar els serveis d'anàlisi. Aquests serveis recullen informació a través de les galetes i tecnologies similars. Aquesta política explica quines dades es recullen, com s'utilitza i els teus drets.",
      ],
    },
    {
      heading: 'Informació que recollim',
      bullets: [
        'Informació que doneu: Si ens poseu en contacte amb el correu electrònic o el nostre formulari de contacte, recullem el vostre nom, adreça de correu electrònic i contingut del missatge.',
        "Informació recollida automàticament: El proveïdor d'allotjament (Netlify), socis de publicitat i serveis anàlisi poden recollir: Adreça IP, tipus de navegador i versió, sistema operatiu, tipus de dispositiu, referir- se a URL, pàgines visitades, temps al lloc web, i aproximadament emplaçament geogràfic.",
        "Galetes de tercers: Els nostres socis de publicitat (Google AdSenses) utilitzen galetes i tecnologies similars a servir i mesurar anuncis. L'ANQR no estableix cap galetes de primera part.",
      ],
    },
    {
      heading: 'Galetes i tecnologies de tercers',
      paragraphs: [
        'ANQR no estableix cap galetes de primera part. Les vostres preferències (com el mode fosc) es desen localment en el dispositiu, que no es transmeten a cap servidor.',
        "Tanmateix, els nostres socis de publicitat (Google AdSense) i el proveïdor d'acollida poden utilitzar galetes i tecnologies de seguiment similars:",
      ],
      bullets: [
        "Advertificar galetes (de tercers): Indiqueu-vos pels socis de Google AdSenses i publicitat per tal de servir anuncis rellevants, mesurar l'actuació d'usuari i entendre interessos d'usuari. Aquestes galetes poden seguir la vostra activitat a través de diferents llocs web.",
        "Galetes agregades (de tercers països): Pot ser usat pel nostre proveïdor d'acollida o serveis d'anàlisis per recollir dades d'ús anonymats.",
      ],
    },
    {
      heading: 'Google AdSenses i publicitat',
      paragraphs: [
        "Mostram anuncis a través de Google AdSenses. Google i els seus socis fan servir galetes per servir anuncis basats en la vostra història de navegació en aquest lloc i altres llocs web (Publicitat basada en l'interès).",
        'Apreneu a Google a usar la vostra informació: https://ogle.com/technologies/partner- accounts',
        'Gestiona la personalització: https://adssettings.google.com',
        'Opta via xarxa Adverting Iniciativa: https://optout.networkadverting.org',
        "Opta mitjançant l'adquisició digital de l'Aliança: https://optout.abits.info",
      ],
    },
    {
      heading: 'Com utilitzem informació',
      bullets: [
        'Per respondre a les vostres investigacions i donar suport.',
        'Per mostrar anuncis rellevants a través dels nostres socis de publicitat.',
        "Per analitzar l'ús de llocs web i millorar els nostres serveis.",
        'Per detectar, prevenir, i frau adreça, abusos i temes de seguretat.',
        'Per complir amb les obligacions legals.',
      ],
    },
    {
      heading: 'Serveis de tercers',
      bullets: [
        'Google AdSense: Rep dades per servir i mesurar anuncis.',
        "Proveïdors antianàlisis: Rebeu dades d'ús anonymats.",
        'Netlify (hosting): El processos sol· licituds i poden accedir a adreces IP.',
        'No venem la teva informació personal. No obstant això, compartir dades amb socis de publicitat es pot considerar una "vena" sota CCPA (veure a sota).',
      ],
    },
    {
      heading: 'Retenció de dades',
      bullets: [
        'Submissió de contacte: Fins a dos anys.',
        'Registres del servidor: Fins a 30 dies ( proveïdor de màquina).',
        'Dades examinades: Fins a 26 mesos (sense pietat).',
        'Màxim de galetes: Normalment 13 mesos (vs per soci).',
      ],
    },
    {
      heading: 'Els vostres drets sota el PIBR ( Usuaris EA)',
      paragraphs: [
        "Si esteu a l'àrea Econòmica Europea, teniu els següents drets sota la Convenció de Protecció de dades General:",
      ],
      bullets: [
        "Dreta d' accés: Sol·licito una còpia de dades personals que tenim sobre tu.",
        'Dreta a recta: Sol· licitud de correcció de dades incorrectes.',
        'De dreta a l\' era: Demana supressió de les dades ("dreta per a ser oblidat").',
        'De dreta per a restringir el procés: Sol·lic·liceix els límits de com utilitzem les dades.',
        'Portabilitat de dades al dret: Sol· licita les vostres dades en un format portàtil.',
        'De dreta a objecte: Objecte a processar, incloent-hi per a màrqueting directe.',
        'No es pot retirar el consentiment dret: Retira el consentiment en qualsevol moment en què el procés és basat en el consentiment.',
        'De dret a presentar una queixa: Fitxer una queixa amb la seva autoritat de protecció de dades.',
      ],
    },
    {
      heading: 'Base legal PIBR',
      paragraphs: [
        "Nosaltres processem dades d'aquestes bases: (a) Consent - per a la publicitat personal (conutilitzada pels nostres socis de publicitat); (b) interessos de Legaiti (per a anàlisi, seguretat i millora; (c) Contract - per respondre a les investigacions.",
        'Per a exercitar els vostres drets, contacteu amb el correu electrònic@ anqr.link. Responem en 30 dies.',
      ],
    },
    {
      heading: 'Els seus drets sota CCPA (usuaris de fa referència)',
      bullets: [
        'Dreta a saber: Demana informació sobre les dades recollides, fonts, propòsits i tercers partits.',
        'De dreta a esborrar: Sol· licita supressió de la vostra informació personal.',
        'De dreta a opt- out: Opte fora de la "vena" d\'informació personal (com compartir amb els socis adgats poden satisfer).',
        'De dret a la no discriminació: No discriminarem per exercir els teus drets.',
      ],
    },
    {
      heading: "S' han recollit categories CCPA",
      paragraphs: [
        'Categories.',
        'Per a exercitar drets o optar: mail@ ianqr. link o ajustar les opcions de galetes.',
      ],
    },
    {
      heading: 'Transferències internacionals',
      paragraphs: [
        'La seva informació es pot transferir als països amb lleis de protecció de dades diferents, incloent els Estats Units. Usam salvaguardes apropiades com ara les Claus estàndard.',
      ],
    },
    {
      heading: 'La privacitat dels nens',
      paragraphs: [
        "ANQR no es dirigeix a nens menors de 13 (o 16 a l'EA). No sabem col·leccionar dades de nens. Correu electrònic del contacte@anqr. link si creieu que un nen ha proporcionat informació.",
      ],
    },
    {
      heading: 'Seguretat',
      paragraphs: [
        "Usam mesures tècniques i pràctiques adequades per a protegir dades, incloent l'encriptació HTTPS. Tanmateix, cap transmissió d'Internet està segura al 100%.",
      ],
    },
    {
      heading: 'No peça',
      paragraphs: [
        "L'honorem no seguir els senyals del navegador on es factibles, encara que els socis de publicitat poden no respondre a DNT.",
      ],
    },
    {
      heading: 'Canvia a aquesta política',
      paragraphs: [
        'Podem actualitzar aquesta política periòdicament. La data "última actualització" indica la revisió més recent. Els canvis importants es poden comunicar via un cartell de lloc.',
      ],
    },
    {
      heading: 'Contacte amb nosaltres',
      paragraphs: [
        'Per a preguntes de privacitat o per a exercitar els vostres drets: mail@ anqr. link o useu la nostra pàgina de contacte. Responem a peticions de privacitat en trenta dies.',
      ],
    },
    {
      heading: 'Política de privadesa completa',
      paragraphs: [
        'Aquesta pàgina ofereix un resum de les nostres pràctiques de privadesa. Per obtenir la política de privadesa completa i legalment vinculant amb tots els detalls sobre el processament de dades, els vostres drets i les nostres obligacions en virtut del GDPR, CCPA i altres lleis de privadesa, consulteu la nostra política completa allotjada per iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Consulta la Política de privadesa completa a iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
