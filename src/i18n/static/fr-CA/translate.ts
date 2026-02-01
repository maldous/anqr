import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Aidez à traduire ANQR',
  description: 'Rejoignez notre communauté de traducteurs qui contribuent à rendre ANQR accessible aux utilisateurs du monde entier. Aucune expérience en codage requise - contribuez directement depuis votre navigateur.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Référentiel de traduction ouvert', type: 'external' },
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'À propos de l\'ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contactez-nous', type: 'external' },
  ],
  sections: [
    {
      heading: 'Pourquoi contribuer ?',
      paragraphs: ['ANQR est utilisé par des personnes du monde entier pour créer des codes QR pour les entreprises, les événements, les paiements et les projets personnels. En contribuant aux traductions, vous contribuez à rendre cet outil puissant accessible aux utilisateurs qui préfèrent leur langue maternelle.', 'Chaque contribution à la traduction, qu\'il s\'agisse de corriger une faute de frappe ou de traduire une langue entière, fait une réelle différence pour les utilisateurs de votre communauté.'],
    },
    {
      heading: 'Que pouvez-vous traduire ?',
      paragraphs: ['ANQR propose deux types de contenu traduisible :'],
      bullets: ['Chaînes d\'interface utilisateur : étiquettes de boutons, éléments de menu, info-bulles et texte d\'interface qui apparaissent dans l\'application.', 'Contenu statique : pages de documentation comprenant des guides, des exemples, une politique de confidentialité et des articles d\'aide.', 'Les deux types sont stockés sous forme de simples fichiers texte que vous pouvez modifier directement dans votre navigateur – aucun logiciel spécial n\'est nécessaire.', 'Les traductions sont révisées avant d\'être fusionnées pour garantir la qualité et la cohérence.'],
    },
    {
      heading: 'Comment contribuer',
      paragraphs: ['Contribuer est simple et ne nécessite aucune connaissance de Git :'],
      bullets: ['Visitez notre référentiel de traduction public sur GitHub.', 'Recherchez votre fichier de langue (ou créez-en un nouveau si votre langue n\'est pas encore prise en charge).', 'Cliquez sur l\'icône en forme de crayon pour modifier directement dans votre navigateur.', 'Apportez vos modifications et cliquez sur « Proposer des modifications » – GitHub créera automatiquement une pull request.', 'Votre contribution sera examinée et fusionnée, généralement dans quelques jours.'],
    },
    {
      heading: 'Directives de traduction',
      paragraphs: ['Lors de la traduction, veuillez conserver les espaces réservés tels que {name}, {count} et {{variable}} inchangés : ils sont remplacés par des valeurs dynamiques au moment de l\'exécution. Conservez également toute syntaxe de type HTML telle que les liens au format [[/path|Label]].', 'Si vous n\'êtes pas sûr d\'une traduction, il est préférable de la laisser en anglais plutôt que de fournir une traduction incorrecte. Vous pouvez également ouvrir un ticket sur GitHub pour demander des éclaircissements.'],
    },
    {
      heading: 'Langues actuellement prises en charge',
      paragraphs: ['ANQR prend actuellement en charge plus de 40 langues, notamment :'],
      bullets: ['Principales langues du monde : anglais, chinois, espagnol, arabe, hindi, portugais, japonais, coréen, français, allemand, russe et plus encore.', 'Langues d\'Asie du Sud-Est : thaï, vietnamien, indonésien, philippin, malais, khmer, laotien, birman.', 'Langues sud-asiatiques : hindi, tamoul, telugu, bengali, marathi, gujarati, kannada, malayalam, punjabi, népalais.'],
    },
    {
      heading: 'Reconnaissance',
      paragraphs: ['Tous les contributeurs sont crédités dans notre référentiel. Votre travail aide des milliers d\'utilisateurs à accéder à l\'ANQR dans leur langue préférée.', 'Merci à tous nos contributeurs à la traduction pour avoir contribué à rendre l\'ANQR accessible dans le monde entier !'],
    },
    {
      heading: 'Des questions ?',
      paragraphs: ['Si vous avez des questions sur la contribution aux traductions, veuillez ouvrir un ticket sur notre référentiel GitHub ou nous contacter par e-mail. Nous sommes heureux de vous aider à démarrer.'],
    },
  ],
};

export default translate;
