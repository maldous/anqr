import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'À propos de l\'ANQR',
  description: 'ANQR est un générateur de codes QR gratuit avec une approche axée sur le client : générez des codes QR localement ou utilisez notre API pour l\'intégration.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Politique de confidentialité', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Conditions d\'utilisation', type: 'external' },
  ],
  sections: [
    {
      heading: 'Qu\'est-ce que l\'ANQR ?',
      paragraphs: ['ANQR (prononcé « ancre ») est un générateur de code QR gratuit qui crée des codes scannables pour les URL, le texte, les informations d\'identification Wi-Fi, les cartes de contact, les événements du calendrier, etc.', 'Il est conçu pour les particuliers, les petites entreprises, les spécialistes du marketing et les développeurs qui souhaitent des outils QR puissants sans s\'inscrire. La conception axée sur le client signifie que les codes QR sont générés localement dans votre navigateur par défaut, avec une API de serveur en option pour l\'intégration et l\'intégration professionnelles.'],
    },
    {
      heading: 'Principales caractéristiques',
      bullets: ['Générez instantanément des codes QR dans votre navigateur – aucun compte requis.', 'Personnalisez les couleurs, les styles de modules, les modèles de recherche et ajoutez des superpositions d\'images.', 'Exportez dans plusieurs formats : PNG, SVG, WebP et GIF animé.', 'Contrôles avancés pour le niveau de correction des erreurs, la version QR, le mode d\'encodage et la sélection du masque.', 'Conseils de sécurité de numérisation et aperçu en direct pour aider à garder les codes lisibles sur papier et sur les écrans.', 'API côté serveur pour une intégration professionnelle avec prise en charge complète des paramètres.', 'Fonctionne hors ligne une fois chargée - il s\'agit d\'une application Web statique que vous pouvez exécuter n\'importe où.'],
    },
    {
      heading: 'Comment fonctionne l\'ANQR',
      paragraphs: ['ANQR s\'exécute dans votre navigateur et encode votre entrée dans une matrice QR standard avec correction d\'erreur Reed-Solomon, puis la restitue au format que vous choisissez.', 'Par défaut, la génération s\'effectue localement dans votre navigateur. Pour un usage professionnel, vous pouvez également utiliser l\'API côté serveur pour générer des codes QR via des paramètres d\'URL - idéal pour l\'intégration dans des sites Web, des e-mails ou des flux de travail automatisés.', 'Lorsque vous ajoutez des superpositions ou des animations, ANQR équilibre le style avec la fiabilité de l\'analyse afin que le résultat reste numérisable.', 'ANQR se concentre sur les codes statiques (les données se trouvent à l\'intérieur du QR). Si vous avez besoin d\'un code dynamique (destination modifiable), vous pouvez encoder votre propre URL de redirection ou lien court.'],
    },
    {
      heading: 'Qui exploite l\'ANQR ?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'La publicité et comment nous restons libres',
      paragraphs: ['ANQR est gratuit et financé par la publicité. Nous pouvons diffuser des annonces via Google AdSense et/ou d\'autres partenaires publicitaires.', 'Les fournisseurs de publicités peuvent utiliser des cookies ou des technologies similaires pour personnaliser les publicités en fonction de vos intérêts et de votre activité de navigation. Vous pouvez gérer les préférences publicitaires dans les paramètres de votre appareil et via les paramètres publicitaires de Google, et en savoir plus dans notre Politique de confidentialité.', 'Nous ne vendons pas le contenu que vous encodez dans les codes QR. Les publicités aident à couvrir les coûts de fonctionnement et d\'amélioration du projet.'],
    },
    {
      heading: 'Normes ouvertes',
      paragraphs: ['ANQR génère des codes QR basés sur la norme ISO/IEC 18004 et vise une large compatibilité entre les scanners, les appareils photo et les flux de travail d\'impression.'],
    },
    {
      heading: 'Avis de marque',
      paragraphs: ['QR Code® est une marque déposée de DENSO WAVE INCORPORATED. ANQR n\'est pas affilié, approuvé ou sponsorisé par DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Commentaires et contributions',
      paragraphs: ['Nous apprécions les commentaires, les rapports de bogues et les suggestions de fonctionnalités. Veuillez nous contacter par e-mail ou via la page de contact. Nous lisons chaque message, bien que les délais de réponse puissent varier.'],
    },
  ],
};

export default about;
