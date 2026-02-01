import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contactez-nous',
  description: 'Nous accueillons les commentaires, les rapports de bogues, les demandes de fonctionnalités et les demandes générales.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Comment nous joindre',
      paragraphs: ['Nous offrons plusieurs façons de nous contacter en fonction de vos besoins. Nous lisons chaque message, bien que les temps de réponse puissent varier en fonction du volume et du type de demande.'],
    },
    {
      heading: 'Courriel',
      paragraphs: ['Pour toute demande : email@anqr.link', 'C\'est la façon la plus fiable de nous joindre et est recommandé pour des questions détaillées, des demandes de renseignements d\'affaires, ou toute autre demande.'],
    },
    {
      heading: 'Types de demandes',
      bullets: ['Questions générales Questions sur la façon d\'utiliser ANQR, des explications de fonctionnalités, ou des commentaires généraux.', 'Rapports de bogue : Veuillez inclure votre navigateur, votre système d\'exploitation, les étapes de reproduction et tout message d\'erreur que vous voyez.', 'Demandes de fonctionnalités : Suggestions pour de nouvelles fonctionnalités ou améliorations. Nous examinons toutes les demandes bien que nous ne puissions pas promettre leur mise en œuvre.', 'Demandes de renseignements : Possibilités de partenariat, questions de licence ou demandes d\'utilisation commerciale.', 'Demandes de protection de la vie privée : Demandes d\'exercice de vos droits à la vie privée en vertu du RGPD, de l\'ACCP ou d\'autres lois sur la protection de la vie privée (voir Politique de protection de la vie privée).', 'DMCA/Droit d\'auteur: Voir la section DMCA ci-dessous pour les exigences relatives aux avis de retrait.'],
    },
    {
      heading: 'Temps de réponse',
      paragraphs: ['Nous visons à répondre aux demandes de renseignements dans les 5-7 jours ouvrables. Les demandes liées à la protection de la vie privée seront traitées dans les 30 jours, comme l\'exige la loi.', 'Pendant les périodes de travail, les temps de réponse peuvent être plus longs. Pour les questions urgentes, veuillez indiquer « OURGENT » dans votre rubrique.'],
    },
    {
      heading: 'Avant de nous contacter',
      paragraphs: ['Veuillez consulter notre page Documentation pour obtenir des réponses aux questions courantes sur la façon d\'utiliser les fonctionnalités ANQR. De nombreuses questions sur la génération de code QR, le style et les options d\'exportation y sont abordées.'],
    },
    {
      heading: 'DMCA Avis de droit d\'auteur',
      paragraphs: ['Si vous pensez que le contenu disponible sur ANQR enfreint votre droit d\'auteur, vous pouvez soumettre un avis de retrait de Digital Millennium Copyright Act (DMCA). Pour être valide, votre avis doit comprendre :'],
      bullets: ['Signature physique ou électronique du titulaire du droit d\'auteur ou de l\'agent autorisé.', 'L\'identification de l\'oeuvre protégée par le droit d\'auteur aurait été violée.', 'Identification du matériel dont on prétend qu\'il porte atteinte, avec des renseignements suffisants pour le localiser.', 'Vos coordonnées (adresse, numéro de téléphone et adresse électronique).', 'Une déclaration selon laquelle vous êtes convaincu de bonne foi que l\'utilisation du matériel n\'est pas autorisée par le titulaire du droit d\'auteur.', 'Une déclaration, sous peine de parjure, selon laquelle les informations contenues dans votre avis sont exactes et que vous êtes le titulaire du droit d\'auteur ou autorisé à agir en leur nom.'],
    },
    {
      heading: 'Contact DMCA',
      paragraphs: ['Envoyez les avis de DMCA à : ', 'Veuillez inclure « Avis d\'ACSM » dans la ligne d\'objet. Nous répondrons aux avis valides conformément à la loi applicable. Notez qu\'ANQR génère des codes QR localement sur les périphériques utilisateurs et n\'héberge pas de contenu généré par l\'utilisateur.'],
    },
    {
      heading: 'Communauté Reddit',
      paragraphs: ['Rejoignez notre communauté Reddit sur r/ANQR pour partager vos créations QR, poser des questions, obtenir de l\'aide et vous connecter avec d\'autres utilisateurs d\'ANQR.'],
    },
  ],
};

export default contact;
