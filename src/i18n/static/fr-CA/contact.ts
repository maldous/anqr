import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contactez-nous',
  description: 'Nous apprécions les commentaires, les rapports de bogues, les demandes de fonctionnalités et les demandes générales.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Comment nous joindre',
      paragraphs: ['Nous vous proposons plusieurs façons de nous contacter en fonction de vos besoins. Nous lisons chaque message, bien que les délais de réponse puissent varier en fonction du volume et du type de demande.'],
    },
    {
      heading: 'Courriel',
      paragraphs: ['Pour toutes demandes : email@anqr.link', 'Il s\'agit du moyen le plus fiable pour nous joindre et il est recommandé pour des questions détaillées, des demandes commerciales ou toute autre demande.'],
    },
    {
      heading: 'Types de demandes',
      bullets: ['Questions générales : questions sur l\'utilisation de l\'ANQR, explications des fonctionnalités ou commentaires généraux.', 'Rapports de bogues : veuillez inclure votre navigateur, votre système d\'exploitation, les étapes à reproduire et tout message d\'erreur que vous voyez.', 'Demandes de fonctionnalités : suggestions de nouvelles fonctionnalités ou d\'améliorations. Nous étudions toutes les demandes mais nous ne pouvons promettre leur mise en œuvre.', 'Demandes commerciales : opportunités de partenariat, questions de licence ou demandes d\'utilisation commerciale.', 'Demandes de confidentialité : demandes d\'exercice de vos droits en matière de confidentialité en vertu du RGPD, du CCPA ou d\'autres lois sur la confidentialité (voir Politique de confidentialité).', 'DMCA/Copyright : consultez la section DMCA ci-dessous pour connaître les exigences en matière d\'avis de retrait.'],
    },
    {
      heading: 'Délais de réponse',
      paragraphs: ['Notre objectif est de répondre aux demandes dans un délai de 5 à 7 jours ouvrables. Les demandes liées à la confidentialité seront traitées dans les 30 jours, comme l\'exige la loi.', 'Durant les périodes d\'affluence, les délais de réponse peuvent être plus longs. Pour les questions urgentes, veuillez indiquer « URGENT » dans votre ligne d\'objet.'],
    },
    {
      heading: 'Avant de nous contacter',
      paragraphs: ['Veuillez consulter notre page de documentation pour obtenir des réponses aux questions courantes sur l\'utilisation des fonctionnalités ANQR. De nombreuses questions sur la génération, le style et les options d\'exportation de codes QR y sont abordées.'],
    },
    {
      heading: 'Avis de droits d\'auteur DMCA',
      paragraphs: ['Si vous pensez que le contenu disponible sur ANQR porte atteinte à vos droits d\'auteur, vous pouvez soumettre un avis de retrait du Digital Millennium Copyright Act (DMCA). Pour être valide, votre avis doit comprendre :'],
      bullets: ['Une signature physique ou électronique du titulaire du droit d\'auteur ou de l\'agent autorisé.', 'Identification de l\'œuvre protégée par le droit d\'auteur qui aurait été violée.', 'Identification du matériel prétendument en infraction, avec des informations suffisantes pour le localiser.', 'Vos coordonnées (adresse, numéro de téléphone et adresse e-mail).', 'Une déclaration selon laquelle vous pensez de bonne foi que l\'utilisation du matériel n\'est pas autorisée par le propriétaire des droits d\'auteur.', 'Une déclaration, sous peine de parjure, selon laquelle les informations contenues dans votre avis sont exactes et que vous êtes le propriétaire des droits d\'auteur ou autorisé à agir en leur nom.'],
    },
    {
      heading: 'Contact DMCA',
      paragraphs: ['Envoyez les notifications DMCA à : email@anqr.link', 'Veuillez inclure « Avis DMCA » dans la ligne d\'objet. Nous répondrons aux avis valides conformément à la loi applicable. Notez qu\'ANQR génère des codes QR localement sur les appareils des utilisateurs et n\'héberge pas de contenu généré par l\'utilisateur.'],
    },
    {
      heading: 'Communauté Reddit',
      paragraphs: ['Rejoignez notre communauté Reddit sur r/ANQR pour partager vos créations QR, poser des questions, obtenir de l\'aide et vous connecter avec d\'autres utilisateurs d\'ANQR.'],
    },
  ],
};

export default contact;
