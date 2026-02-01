import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contacte amb nosaltres',
  description: 'Nosaltres donem la benvinguda, informes d\'errors, peticions de característiques i investigacions generals.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Com arribar a nosaltres',
      paragraphs: ['Us oferim moltes maneres de contactar-nos depenent de les vostres necessitats. Vam llegir cada missatge, encara que les vegades de resposta poden variar basant-se en el volum i en el tipus d\'investigació.'],
    },
    {
      heading: 'Correu electrònic',
      paragraphs: ['Per a totes les investigacions: mail@ sanqr.link', 'Aquesta és la manera més fiable d\'arribar a nosaltres i és recomanable per a preguntes detallades, investigacions empresarials, o altres investigacions.'],
    },
    {
      heading: 'Tipus d\' investigacions',
      bullets: ['Preguntes generals: Preguntes sobre com utilitzar XLIFF mark type.', 'Informes d\' error: Si us plau, inclou el vostre navegador, sistema operatiu, passos per a reproduir- lo i qualsevol missatge d\' error que vegeu.', 'Sol· licituds de característiques: suggeriments per noves funcionalitats o millores. Considerem totes les peticions encara que no podem prometre la implementació.', 'Treballs de negoci: Les oportunitats d\'accés, les preguntes de llicència, o les investigacions comercials.', 'Peticions de privadesa: sol· licituds d\' exercitar els vostres drets de privacitat sota el PIBR, CCPA, o altres lleis de privacitat (vegeu Política de privadesa).', 'DMCON/Copyright: Mireu la secció DMCA de sota per prendre requeriments.'],
    },
    {
      heading: 'Temps de resposta',
      paragraphs: ['Podem respondre a les investigacions en 5-7 dies de negoci. Les peticions relacionades amb la privadesa seran dirigides en 30 dies com a necessàries per llei.', 'Durant els períodes ocupats, els temps de resposta poden ser més llargs. Per temes urgents, si us plau, escriviu "URGENT" en la vostra línia d\'assumpte.'],
    },
    {
      heading: 'Abans de contactar amb nosaltres',
      paragraphs: ['Si us plau, comproveu la nostra pàgina de documentació per respostes a qüestions comunes sobre com usar característiques ANQR. Moltes preguntes sobre la generació de codi QR, l\'Styling i les opcions d\' exportació estan cobertes.'],
    },
    {
      heading: 'DMCA Anotacions del copyright',
      paragraphs: ['Si creieu que el contingut està disponible a l\'ANQR infrint el vostre drets d\'autor, podeu enviar una Llei de drets de Mil·lenni digital (DMC). Per ser vàlid, la vostra nota ha d\' incloure:'],
      bullets: ['Una signatura física o electrònica del propietari del copyright o agent autoritzat.', 'La identificació de la feina amb drets d\'autor s\'ha declarat que s\'ha inframat.', 'La identificació del material que s\'ha declarat que està en fallida, amb informació suficient per localitzar-lo.', 'La vostra informació de contacte (adreça, número de telèfon i adreça de correu electrònic).', 'Una declaració que tens una bona fe creient que l\'ús del material no està autoritzada pel propietari del copyright.', 'Una declaració, sota pena de perjuri, que la informació en la teva nota sigui precisa i que ets l\'amo del drets d\'autor o autoritzat per actuar en nom seu.'],
    },
    {
      heading: 'Contacte DMCA',
      paragraphs: ['Envia notes DMCA a: mail@ anqr.link', 'Si us plau, incloeu la "No difusió DMCA" en la línia de subjecte. Respondrem a les notes vàlides d\'acord amb la llei aplicable. Tingueu en compte que ANQR genera codis QR localment en els dispositius d\' usuaris i no disposa del contingut de l\' usuari generat.'],
    },
    {
      heading: 'Comunitat Reddit',
      paragraphs: ['Uneix-te a la nostra comunitat de Reddit a r/ANQR per compartir les teves creacions QR, fer preguntes, obtenir ajuda i connectar amb altres usuaris d\'ANQR.'],
    },
  ],
};

export default contact;
