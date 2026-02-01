import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'À propos de l\'ANQR',
  description: 'ANQR est un générateur de code QR gratuit avec une première approche client - générer des codes QR localement ou utiliser notre API pour intégrer.',
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
      heading: 'Qu\'est-ce que l\'ANQR?',
      paragraphs: ['ANQR (prononcé « ancre ») est un générateur de code QR gratuit qui crée des codes scannables pour les URL, le texte, les identifiants Wi-Fi, les cartes de contact, les événements du calendrier, et plus encore.', 'Il est construit pour les particuliers, les petites entreprises, les marketeurs et les développeurs qui veulent des outils QR puissants sans s\'inscrire. La conception client-premier signifie que les codes QR sont générés localement dans votre navigateur par défaut, avec une API serveur optionnelle pour l\'intégration professionnelle et l\'intégration.'],
    },
    {
      heading: 'Principales caractéristiques',
      bullets: ['Générer des codes QR instantanément dans votre navigateur - aucun compte requis.', 'Personnalisez les couleurs, les styles de module, les modèles de recherche et ajoutez des superpositions d\'images.', 'Exporter en plusieurs formats : PNG, SVG, WebP et GIF animé.', 'Contrôles avancés pour le niveau de correction des erreurs, la version QR, le mode d\'encodage et la sélection du masque.', 'Conseils de sécurité de numérisation et aperçu en direct pour aider à garder les codes lisibles dans l\'impression et sur les écrans.', 'API côté serveur pour l\'intégration professionnelle avec support complet des paramètres.', 'Fonctionne hors ligne une fois chargé - c\'est une application web statique que vous pouvez exécuter n\'importe où.'],
    },
    {
      heading: 'Fonctionnement de l\'ANQR',
      paragraphs: ['ANQR fonctionne dans votre navigateur et encode votre entrée dans une matrice QR standard avec la correction d\'erreur Reed–Solomon, puis la rend dans le format que vous choisissez.', 'Par défaut, la génération se produit localement dans votre navigateur. Pour un usage professionnel, vous pouvez également utiliser l\'API côté serveur pour générer des codes QR via des paramètres URL - parfait pour intégrer dans des sites Web, des courriels ou des workflows automatisés.', 'Lorsque vous ajoutez des superpositions ou des animations, ANQR équilibre le style avec la fiabilité de l\'analyse afin que le résultat reste scannable.', 'ANQR se concentre sur les codes statiques (les données sont à l\'intérieur du QR). Si vous avez besoin d\'un code dynamique ( destination modifiable), vous pouvez coder votre propre URL de redirection ou un lien court.'],
    },
    {
      heading: 'Qui exploite l\'ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Publicité et comment nous restons libres',
      paragraphs: ['ANQR est libre d\'utilisation et est pris en charge par la publicité. Nous pouvons afficher des annonces via Google AdSense et/ou d\'autres partenaires publicitaires.', 'Les fournisseurs d\'annonces peuvent utiliser des cookies ou des technologies similaires pour personnaliser les annonces en fonction de vos intérêts et de votre activité de navigation. Vous pouvez gérer les préférences publicitaires dans les paramètres de votre appareil et via Google, et en savoir plus dans notre Politique de confidentialité.', 'Nous ne vendons pas le contenu que vous codez dans les codes QR. Les annonces aident à couvrir les coûts de fonctionnement et d\'amélioration du projet.'],
    },
    {
      heading: 'Normes ouvertes',
      paragraphs: ['ANQR génère des codes QR basés sur la norme ISO/IEC 18004 et vise une large compatibilité entre les scanners, les caméras et les flux d\'impression.'],
    },
    {
      heading: 'Avis de marque',
      paragraphs: ['QR Code® est une marque déposée de DENSO WAVE INCORPORATED. ANQR n\'est pas affiliée à DENSO WAVE INCORPORATED, n\'en est pas le promoteur.'],
    },
    {
      heading: 'Commentaires et contributions',
      paragraphs: ['Nous accueillons les commentaires, les rapports de bogues et les suggestions de fonctionnalités. Veuillez contacter par courriel ou par la page de contact - nous lisons chaque message, bien que les temps de réponse puissent varier.'],
    },
  ],
};

export default about;
