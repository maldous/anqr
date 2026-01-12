import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: "Guide de l'utilisateur ANQR",
  description: "Guide complet d'utilisation de l'ANQR pour créer des codes QR.",
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Voir des exemples de QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Commencer',
      paragraphs: [
        "ANQR est un générateur de code QR avec une approche axée sur le client. Par défaut, les codes QR sont générés localement dans votre navigateur – aucun compte requis et vos données restent privées. Pour une intégration professionnelle, vous pouvez également utiliser l'API côté serveur.",
        "L'interface comporte trois niveaux d'interface : Basique, Avancé et Professionnel. Sélectionnez votre niveau à l'aide des onglets dans l'en-tête. Chaque niveau débloque des fonctionnalités supplémentaires tout en gardant l'interface concentrée sur ce dont vous avez besoin.",
      ],
      bullets: [
        "Basique : création simple de code QR avec contenu texte/URL brut et superposition d'images.",
        "Avancé : options d'encodage QR, styles de rendu, animation, formats de sortie, types de contenu étendus et personnalisation de la superposition.",
        "Professionnel : filigranes, métadonnées, partage, analyse de sécurité, codes QR de paiement et fonctionnalités d'entreprise.",
      ],
      links: [{ href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' }],
    },
    {
      heading: 'Démarrage rapide',
      paragraphs: ['Pour créer votre premier code QR :'],
      bullets: [
        '1. Sélectionnez un type de contenu (URL, texte, WiFi, etc.) dans la liste déroulante Type de contenu.',
        '2. Entrez vos données dans les champs fournis.',
        '3. Personnalisez éventuellement les couleurs, les styles et ajoutez une image de superposition.',
        '4. Cliquez sur Exporter pour télécharger votre code QR au format PNG, GIF, WebP ou SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Fonctionnalités de base',
      paragraphs: [
        "Le niveau Basic fournit une interface simplifiée pour créer des codes QR avec du contenu de charge utile et des superpositions d'images. C'est la façon la plus simple de commencer.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Types de contenu (de base)',
      paragraphs: [
        "Texte brut : encodez n'importe quel texte jusqu'à la limite de capacité du code QR. Idéal pour les messages courts, les codes ou les identifiants.",
        "URL : codez les adresses Web. Le code QR ouvrira l'URL une fois numérisé. Prend en charge les protocoles http:// et https://.",
      ],
    },
    {
      heading: "Superposition d'images (de base)",
      paragraphs: [
        'Téléchargez une image (JPG, PNG, GIF, WebP) à mélanger avec votre code QR. Les fonctionnalités de superposition de base incluent :',
      ],
      bullets: [
        "Télécharger à partir d'un fichier : sélectionnez une image depuis votre appareil.",
        "Charger à partir de l'URL : saisissez une URL d'image (doit autoriser CORS).",
        "Logo central : place l'image au centre, en fonction de la correction des erreurs.",
        "Mélange : mélange alpha simple d'une image avec un motif QR.",
        "Intensité : contrôle l'impact de la superposition sur le code QR (0 à 100 %).",
        'Mode couleur : Couleur, Niveaux de gris ou Noir et blanc.',
        'Préserver les motifs du Finder : conserve les motifs de coin inchangés pour une numérisation fiable.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Fonctionnalités avancées',
      paragraphs: [
        "Le niveau Avancé débloque les options d'encodage QR, les styles de rendu, l'animation, les formats de sortie, les types de contenu étendus et la personnalisation avancée de la superposition.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: "Paramètres d'encodage QR",
      paragraphs: [
        'Version : les codes QR sont disponibles dans les versions 1 à 40, les versions supérieures contenant plus de données mais étant plus volumineuses. Réglez sur 0 (Auto) pour laisser ANQR choisir la plus petite version qui correspond à votre contenu.',
        "Correction d'erreur : détermine l'ampleur des dommages qu'un code QR peut subir tout en restant numérisable.",
      ],
      bullets: [
        "L (faible) : correction d'erreur de 7 % - plus petite taille, moins de redondance.",
        "M (Moyen) : correction d'erreur de 15 % - option équilibrée.",
        "Q (Quartile) : correction d'erreur de 25 % - bon pour les codes imprimés.",
        "H (Élevé) : correction d'erreur de 30 % - idéal pour les codes avec superpositions ou dans des conditions difficiles.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zone tranquille (marge)',
      paragraphs: [
        "La zone calme est l'espace blanc autour du code QR. Les scanners ont besoin de cette marge pour détecter où commence le code. La norme recommande au moins 4 modules. Une réduction en dessous de 4 peut entraîner des problèmes de numérisation.",
      ],
    },
    {
      heading: 'Style de module',
      paragraphs: [
        'Les modules sont les carrés individuels qui composent un code QR. ANQR propose cinq styles :',
      ],
      bullets: [
        'Carré : aspect QR classique avec des angles vifs.',
        'Arrondi : coins adoucis pour un look plus convivial.',
        'Dots : modules circulaires pour une esthétique moderne.',
        'Diamant : carrés tournés à 45° pour un motif distinctif.',
        "Connecté : les modules fusionnent lorsqu'ils sont adjacents, créant des formes organiques.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Style de motif du chercheur',
      paragraphs: [
        'Les modèles de recherche sont les trois grands carrés dans les coins QR qui aident les scanners à orienter le code. Styles disponibles :',
      ],
      bullets: [
        'Carré : coins carrés standards.',
        'Arrondi : coins adoucis correspondant au style de module arrondi.',
        'Cercle : modèles de recherche circulaires pour les codes de type point.',
      ],
    },
    {
      heading: "Modèles d'alignement et de synchronisation",
      paragraphs: [
        "Les motifs d'alignement apparaissent dans des codes QR plus grands (version 2+) pour aider à corriger la distorsion. Les modèles de synchronisation sont les lignes alternées reliant les modèles de recherche.",
      ],
      bullets: [
        "Style d'alignement : Recherche de correspondance, Carré, Arrondi ou Cercle.",
        'Style de timing : module de correspondance, solide ou pointillé.',
      ],
    },
    {
      heading: 'Couleurs',
      paragraphs: [
        "Premier plan : La couleur des modules QR. Le noir (#000000) est standard mais n'importe quelle couleur foncée fonctionne.",
        "Arrière-plan : La couleur d'arrière-plan. Le blanc (#ffffff) est standard. Assurez-vous d'un contraste suffisant avec le premier plan.",
        "Fond transparent : supprimez entièrement l'arrière-plan pour l'utiliser sur des surfaces colorées. Assurez-vous que la surface offre un contraste adéquat.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Taille et espace du module',
      paragraphs: [
        'Taille du module : contrôle la taille du rendu de chaque module en pixels. Des valeurs plus élevées créent des codes plus gros et plus faciles à scanner.',
        "Espacement des modules : ajoute de l'espace entre les modules sous forme de pourcentage. De petits écarts (5 à 15 %) peuvent améliorer la capacité de numérisation dans certaines conditions, mais des écarts excessifs réduisent la fiabilité.",
      ],
    },
    {
      heading: 'Paramètres de sortie',
      paragraphs: [
        "Format : choisissez votre format d'exportation en fonction du cas d'utilisation.",
      ],
      bullets: [
        "PNG : Format raster sans perte, idéal pour la plupart des utilisations. Idéal pour l'impression et le numérique.",
        'WebP : format moderne avec des tailles de fichiers plus petites. Idéal pour une utilisation sur le Web.',
        'GIF : obligatoire pour les codes QR animés. Prend en charge la transparence.',
        "SVG : format vectoriel évolutif à l'infini. Idéal pour les gros caractères ou lorsque vous devez modifier le code.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Dimensions de sortie',
      paragraphs: [
        "Largeur/Hauteur : définissez la taille de sortie en pixels. Pour l'impression, calculez en fonction du DPI (par exemple, 300 DPI à 1 pouce = 300 px). Les plus grandes tailles numérisent de manière plus fiable à distance.",
      ],
    },
    {
      heading: "Paramètres d'animation (avancés)",
      paragraphs: ['Contrôlez le comportement du code QR animé :'],
      bullets: [
        "Vitesse : fréquence d'images de l'animation en millisecondes.",
        'Boucle : animation continue ou en une seule lecture.',
        "Bounce : direction d'animation de ping-pong.",
        "Démarrer l'image : Commencer l'animation à partir d'une image spécifique.",
        "Max Frames : limite le nombre total d'images dans l'animation.",
        "Étape d'image : sautez des images pour une animation plus rapide.",
        'Interpolation : Aucun, Crossfade ou Morph entre les images.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Types de contenu (avancé)',
      paragraphs: ['Le niveau avancé débloque des formats de charge utile supplémentaires :'],
      bullets: [
        'Numéro de téléphone (tél :) : crée un lien téléphonique appelable.',
        'E-mail (mailto :) : ouvre le client de messagerie avec un objet et un corps facultatifs.',
        'SMS : message texte pré-rempli vers un numéro de téléphone.',
        'vCard : fiche de contact complète avec nom, organisation, téléphone, e-mail, adresse.',
        'MeCard : format de contact compact populaire au Japon.',
        'BizCard : ancien format de carte de visite.',
        "Géolocalisation : coordonnées GPS qui s'ouvrent sur les cartes.",
        'WiFi : identifiants réseau pour une connexion automatique (SSID, mot de passe, type de sécurité).',
        'Événement du calendrier : format iCalendar avec titre, lieu, date/heure.',
        "RSVP à l'événement : lien vers la page d'inscription à l'événement.",
        'Abonnez-vous au calendrier : Abonnez-vous à un flux ICS/WebCal.',
        'URL du fichier/document : lien direct vers les fichiers téléchargeables.',
        'Lien de stockage cloud : liens vers Google Drive, Dropbox, OneDrive, etc.',
        'Profil social : liens vers LinkedIn, Twitter, Instagram, etc.',
        'Lien de messagerie : WhatsApp, Telegram, liens profonds Signal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Fonctionnalités de superposition avancées',
      paragraphs: ['Capacités de superposition supplémentaires :'],
      bullets: [
        'Recadrer : activez le recadrage pour sélectionner une région carrée de votre image.',
        "Demi-teinte : motif de points de style imprimé classique basé sur la luminosité de l'image.",
        "Dithered : tramage par diffusion d'erreurs pour une reproduction détaillée.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Modes de fusion de superposition (avancés)',
      paragraphs: ['Modes de fusion supplémentaires au niveau Avancé :'],
      bullets: [
        'Sous-pixel : divise chaque module en sous-pixels pour plus de détails.',
        'Blue Noise : utilise le tramage du bruit bleu pour des modèles sans artefacts.',
        "Mosaïque : effet basé sur des tuiles préservant la structure de l'image.",
        "Gap Fill : place l'image dans les espaces entre les modules.",
        "Luminosité : varie la taille du module en fonction de la luminosité de l'image.",
        "Duotone : mappe l'image en deux couleurs pour un contraste saisissant.",
      ],
    },
    {
      heading: 'Intensité de superposition',
      paragraphs: [
        "Contrôle la force avec laquelle la superposition affecte le code QR (0-100 %). Des valeurs plus élevées affichent plus de détails sur l'image mais peuvent réduire la capacité de numérisation. Commencez à environ 70 % et ajustez en fonction des tests.",
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Mode couleur',
      paragraphs: ["Comment l'image de superposition est traitée :"],
      bullets: [
        "Pleine couleur : préserve les couleurs de l'image d'origine.",
        'Niveaux de gris : convertit en tons noir et blanc.',
        'Noir et blanc : conversion binaire à contraste élevé.',
      ],
    },
    {
      heading: 'Préserver les modèles de recherche',
      paragraphs: [
        "Lorsqu'il est activé, les trois modèles de recherche de coin ne sont pas modifiés par la superposition. Fortement recommandé pour une numérisation fiable.",
      ],
    },
    {
      heading: 'Prétraitement des images',
      paragraphs: [
        "Appliquez des filtres à votre image de superposition avant de la mélanger. Ces ajustements peuvent améliorer la façon dont l'image apparaît dans le code QR final.",
      ],
      bullets: [
        "Luminosité (-100 à +100) : éclaircir ou assombrir l'image.",
        'Contraste (-100 à +100) : Augmente ou diminue la plage tonale.',
        'Gamma (0,2 à 3,0) : réglage non linéaire de la luminosité. Les valeurs inférieures à 1 éclaircissent les tons moyens, celles supérieures à 1 les assombrissent.',
        'Saturation (-100 à +100) : Intensité de la couleur. -100 correspond à une échelle de gris, +100 à une sursaturation.',
        'Rotation de la teinte (0-360°) : décalez toutes les couleurs autour de la roue chromatique.',
        "Flou (0-20px) : adoucit les détails de l'image.",
        'Aiguiser (0-100 %) : Améliorez les bords et les détails.',
        "Postériser (niveaux 0-16) : Réduisez les niveaux de couleur pour un effet d'affiche.",
        'Seuil (0-255) : Convertir en binaire noir/blanc au point de coupure.',
        'Détection des bords : algorithmes Sobel ou Canny pour afficher uniquement les bords.',
        'Inverser : inversez toutes les couleurs.',
      ],
    },
    {
      heading: "Mode d'ajustement",
      paragraphs: ["Comment l'image superposée s'adapte à la zone du code QR :"],
      bullets: [
        "Couverture : l'image remplit toute la zone et est recadrée si nécessaire.",
        'Contenir : Image entière visible, peut avoir des marges.',
        "Étirer : l'image se déforme pour se remplir exactement.",
      ],
    },
    {
      heading: 'Options de transformation',
      paragraphs: [
        'Rotation : faites pivoter la superposition par incréments de 90 °.',
        "Retourner X/Y : refléter l'image horizontalement ou verticalement.",
      ],
    },
    {
      heading: 'Algorithmes de tramage',
      paragraphs: [
        "Le tramage convertit les images à tons continus en motifs que les codes QR peuvent représenter. Disponible lors de l'utilisation des modes de fusion Dithered, Blue Noise ou True Dither.",
      ],
      bullets: [
        "Diffusion d'erreurs : style classique Floyd-Steinberg. Répartit l'erreur de quantification aux pixels voisins.",
        'Ordonné (Bayer) : utilise une matrice de seuil pour les modèles réguliers.',
        "Point groupé : simule l'impression en demi-teintes.",
        'Void & Cluster : tramage ordonné optimisé.',
        'Blue Noise : motif aléatoire visuellement agréable.',
        'Seuil de bruit bleu : tramage de seuil avec texture de bruit bleu.',
        'Bruit blanc : tramage de seuil aléatoire.',
        'Bruit gaussien/triangulaire : Bruit avec différentes distributions.',
        'Blue Noise + Error Diffusion : Hybride combinant les deux techniques.',
        "Bruit bleu filtré : motif de bruit bleu semblable à celui d'un écran.",
        'Perceptuel : pondéré en luminance pour de meilleurs résultats visuels.',
        "Edge-Aware : préserve les bords de l'image pendant le tramage.",
        'Seuil adaptatif : seuillage adaptatif localement.',
        'Bruit bleu temporel : pour les GIF animés, le motif varie par image.',
      ],
    },
    {
      heading: 'Noyaux de diffusion',
      paragraphs: [
        "Lorsque vous utilisez le tramage par diffusion d'erreur, choisissez le mode de répartition des erreurs :",
      ],
      bullets: [
        'Floyd-Steinberg : diffusion classique à 4 voisins. Bon choix général.',
        'Jarvis-Judice-Ninke : voisin 12, plus fluide mais plus lent.',
        'Stucki : Semblable à JJN avec des poids différents.',
        'Burkes : JJN simplifié, plus rapide.',
        'Sierra : famille de noyaux équilibrant qualité et vitesse.',
        'Atkinson : Diffusion de la lumière, préserve les détails mais peut être granuleuse.',
      ],
    },
    {
      heading: 'Force de tramage',
      paragraphs: [
        "Contrôle le degré de tramage appliqué (0 à 100 %). Les valeurs plus faibles préservent davantage le motif d'origine, les valeurs plus élevées affichent plus de détails dans l'image.",
      ],
    },
    {
      heading: 'Paramètres des sous-pixels',
      paragraphs: ['Lorsque vous utilisez le mode de fusion sous-pixels :'],
      bullets: [
        'Taille de la grille : 2 × 2, 3 × 3 ou 4 × 4 sous-pixels par module. Plus haut = plus de détails.',
        'Règle centrale : stricte, le sous-pixel central doit correspondre au module. Le centre de demi-teintes permet la variation.',
        'Couleur neutre : couleur utilisée pour les sous-pixels indéterminés.',
        'Remplacement du Finder : comment les motifs du Finder sont rendus (solides ou stylisés).',
      ],
    },
    {
      heading: 'Paramètres de demi-teintes',
      paragraphs: ['Lorsque vous utilisez le mode de fusion Demi-teintes :'],
      bullets: [
        'Taille de cellule : par module ou grille N×N.',
        'Forme du point : cercle, carré ou ligne.',
        'Courbe de luminosité : Linéaire, Courbe en S ou Gamma.',
      ],
    },
    {
      heading: 'Couleurs bicolores',
      paragraphs: [
        "Lorsque vous utilisez le mode de fusion Duotone, définissez la couleur de l'ombre (zones sombres) et la couleur de surbrillance (zones claires).",
      ],
    },
    {
      heading: "Paramètres d'animation GIF",
      paragraphs: ["Lors de l'utilisation de superpositions GIF animées :"],
      bullets: [
        "Utiliser les délais d'image : respectez le timing GIF d'origine.",
        "FPS maximum : limite la fréquence d'images (1 à 60 ips).",
        "Manipulation d'élimination : Respecter ou simplifier les méthodes d'élimination du cadre.",
      ],
    },
    {
      heading: 'Options de rendu avancées',
      paragraphs: ['Contrôles de rendu supplémentaires :'],
      bullets: [
        "Mode Espacement : Style d'espacement Aucun, Incrustation, Contour ou Espace négatif.",
        'Rayon de coin : pourcentage de coins arrondis pour les modules.',
        'Dégradé : Dégradé Aucun, Linéaire, Radial ou Conique sur les modules.',
        'Style extérieur/intérieur des yeux : style indépendant pour les bagues à motif de recherche.',
        'Rotation des points : faites pivoter les modules diamant/point.',
        'Échelle oculaire : ajustement de la taille pour les modèles de recherche.',
        'Style de cadre : ajoutez des cadres décoratifs (cadre arrondi, autocollant, étiquette).',
        'Texte du cadre : ajoutez un texte comme « Scannez-moi ! » aux cadres.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Encodage QR avancé',
      paragraphs: ["Affiner l'encodage QR :"],
      bullets: [
        "Mode d'encodage : Automatique, Numérique, Alphanumérique, Octet/UTF-8 ou Kanji.",
        "Appliquer une zone de silence minimale : garantir une marge d'au moins 4 modules.",
        'Motif de masque : Auto (optimal), ou sélectionnez manuellement les motifs 0-7 pour contrôler la distribution des modules. Différents modèles créent des apparences visuelles différentes tout en codant les mêmes données.',
        'Encodage des caractères : ISO-8859-1 (par défaut Latin-1), UTF-8 (Unicode complet incluant emoji) ou Shift-JIS (Japonais). Choisissez en fonction des exigences de caractère de votre contenu.',
      ],
    },
    {
      heading: 'Options de sortie avancées',
      paragraphs: ["Paramètres d'exportation supplémentaires :"],
      bullets: [
        'Nom de fichier : nom de fichier personnalisé pour les téléchargements.',
        'Taille de la palette GIF : 2 à 256 couleurs en sortie GIF.',
        'Quantificateur GIF : réduction des couleurs Median Cut, NeuQuant ou Octree.',
        'Tramage GIF : Désactivé, Floyd-Steinberg ou Ordonné.',
        'Couleur transparente GIF : définissez une couleur transparente.',
        'SVG True Vector : utilisez des chemins au lieu du raster intégré.',
        'Précision de forme SVG : rendu de pixels ou de chemin précis.',
        "SVG Embed Raster Overlay : Inclut la superposition en tant qu'image intégrée.",
        "Remplacement de l'arrière-plan : forcez une couleur d'arrière-plan spécifique dans la sortie.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Options de validation',
      paragraphs: ['Paramètres de traitement des entrées :'],
      bullets: [
        "Valider l'entrée : vérifiez le format du contenu avant l'encodage.",
        'Couper les espaces : supprimez les espaces de début et de fin.',
        'Normaliser les nouvelles lignes : convertissez toutes les fins de ligne en LF.',
        'Garde de longueur maximale : avertir si le contenu dépasse la capacité QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Fonctionnalités professionnelles',
      paragraphs: [
        "Le niveau Professionnel ajoute des filigranes, des métadonnées, des options de partage, une analyse de sécurité, des codes QR de paiement et des fonctionnalités d'entreprise.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Filigrane',
      paragraphs: ['Ajoutez des filigranes à vos codes QR :'],
      bullets: [
        "Genre : filigrane de texte, d'image ou de motif.",
        'Position : Centre, Coins, Bords, Derrière ou Zone silencieuse.',
        'Opacité : transparence du filigrane (0-100 %).',
        'Mode de fusion : mélange Normal, Multiplier, Écran ou Superposition.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Métadonnées',
      paragraphs: ['Intégrez les métadonnées dans les fichiers exportés :'],
      bullets: [
        'Champs Titre, Auteur, Copyright, Licence, Description.',
        "Heure de création : intégrer l'horodatage de génération.",
        'Valeur-clé personnalisée : ajoutez des paires de métadonnées arbitraires.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Partage',
      paragraphs: ['Partagez vos configurations de code QR :'],
      bullets: [
        'Lien direct : générez une URL partageable avec vos paramètres actuels.',
        "Intégrer du HTML : obtenez le code d'intégration pour les sites Web.",
        "Paramètres d'encodage : incluez tous les paramètres dans l'URL de partage.",
        'Remarque : Les images superposées provenant de fichiers locaux ne peuvent pas être partagées via une URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Analyse de sécurité',
      paragraphs: ['Assurez-vous que les codes QR restent scannables :'],
      bullets: [
        'Mode de sécurité : Exigences de numérisation désactivées, équilibrées ou strictes.',
        'Taille minimale du module : taille minimale des pixels par module.',
        'Min Quiet Zone : modules de marge minimale.',
        'Verrouiller les Finders/Timing/Align/Format/Version : Protégez des éléments spécifiques.',
        "Intensité de superposition maximale par ECC : limites d'intensité automatiques basées sur le niveau de correction d'erreur.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Types de contenu (professionnel)',
      paragraphs: [
        "Le niveau professionnel ajoute des types de contenu de paiement et d'entreprise :",
      ],
      bullets: [
        'EPC/SEPA (UE) : QR codes de virement bancaire européen avec IBAN, BIC, montant, référence.',
        'UPI (Inde) : interface de paiement unifiée avec VPA, nom du bénéficiaire, montant.',
        'PayNow (Singapour) : paiement rapide à Singapour avec UEN ou numéro de mobile.',
        'PromptPay (Thaïlande) : système de paiement national thaïlandais.',
        'PIX (Brésil) : paiement instantané brésilien avec clé PIX.',
        'Crypto : adresses de paiement Bitcoin, Ethereum, Litecoin avec montant optionnel.',
        'Lien de campagne marketing : URL avec suivi complet des paramètres UTM (balises marketing).',
        "Lien court : à utiliser avec les raccourcisseurs d'URL pour les codes QR dynamiques/traçables.",
        "GS1 Digital Link : Identification du produit avec GTIN, série, lot, date d'expiration.",
        "App Deep Link : liens profonds d'application iOS/Android avec des schémas personnalisés.",
        'Format personnalisé : données brutes sans formatage ni validation.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Paiements linguistiques en mode avancé',
      paragraphs: [
        'Lorsque vous utilisez le mode avancé, ANQR affiche automatiquement les méthodes de paiement pertinentes pour la langue sélectionnée. Par exemple, les utilisateurs vietnamiens voient VietQR, les utilisateurs thaïlandais voient PromptPay et les utilisateurs de langue indienne voient UPI et BharatQR. Les méthodes de paiement globales (crypto-monnaie, PayPal, Cash App) sont disponibles dans toutes les langues. Le mode professionnel débloque tous les standards de paiement, quelle que soit la langue.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Normes de paiement européennes',
      bullets: [
        "EPC/SEPA (UE) : codes QR de virement bancaire européen suivant la norme EPC QR Code. Prend en charge les références IBAN, BIC (facultatif pour les paiements nationaux), le montant en EUR et les paiements structurés ou non structurés. Utilisé dans toute la zone SEPA, y compris les pays de l'UE ainsi que la Suisse, la Norvège, l'Islande, le Liechtenstein, Monaco et Saint-Marin.",
        'QR-facture suisse : norme de paiement suisse selon SIX Implementation Guidelines. Prend en charge CHF et EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), les adresses structurées des créanciers/débiteurs et les informations sur la facture. Obligatoire pour les factures suisses depuis 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Normes de paiement indiennes',
      bullets: [
        "UPI (Inde) : interface de paiement unifiée conforme à la spécification NPCI Deep Linking. Prend en charge le VPA (adresse virtuelle de paiement), le nom du bénéficiaire, le montant en INR, la note de transaction, l'ID de référence, le code de catégorie de commerçant et le mode de transaction.",
        'BharatQR (Inde) : norme QR unifiée prenant en charge à la fois les paiements UPI et par carte. Combine UPI VPA avec la carte PAN pour une compatibilité maximale. Inclut le nom du commerçant, la ville, le MCC, les détails de la TPS et les numéros de facture/référence.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Normes de paiement en Asie du Sud-Est',
      bullets: [
        "PayNow (Singapour) : système de paiement rapide de Singapour utilisant la spécification EMVCo QR avec le profil SGQR. Prend en charge l'UEN (enregistrement d'entreprise), le numéro de mobile ou le NRIC comme identifiants proxy. Comprend un indicateur de modification du montant et une date d'expiration.",
        "PromptPay (Thaïlande) : système de paiement national thaïlandais suivant le profil EMV de la Banque de Thaïlande. Prend en charge le numéro de mobile, l'identifiant national, l'identifiant fiscal, l'identifiant de portefeuille électronique et le paiement de factures avec plusieurs champs de référence.",
        "QRIS (Indonésie) : norme indonésienne de code de réponse rapide. Norme de paiement nationale basée sur EMV prenant en charge l'ID du commerçant, le NMID (National Merchant ID), la classification des critères du commerçant et les frais de commodité (fixes ou en pourcentage).",
        "DuitNow (Malaisie) : système de paiement instantané malaisien. Prend en charge plusieurs types de proxy, notamment les numéros NRIC, mobiles, de passeport, d'identité militaire et d'enregistrement d'entreprise.",
        'VietQR (Vietnam) : norme de transfert interbancaire vietnamienne. Nécessite un BIN bancaire (identification NAPAS) et un numéro de compte. Prend en charge plusieurs codes de service pour différents types de transfert (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Philippines) : norme de paiement QR philippine pour InstaPay et PESONet. Utilise des numéros de compte avec identification du commerçant pour les transactions P2M (de personne à commerçant).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: "Normes de paiement en Asie de l'Est",
      bullets: [
        "TWQR (Taiwan) : norme de paiement QR taïwanaise. Prend en charge l'identifiant du commerçant, l'identifiant fiscal et les montants TWD.",
        "HKQR/FPS (Hong Kong) : codes QR du système de paiement plus rapide de Hong Kong. Prend en charge l'ID FPS, le numéro de mobile ou l'e-mail comme identifiants de paiement. Montants en HKD.",
        "JPQR (Japon) : norme japonaise unifiée de paiement par code QR. Utilise l'ID du magasin pour l'identification du commerçant avec les montants en JPY.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Autres normes de paiement régionales',
      bullets: [
        "PIX (Brésil) : système de paiement instantané de la Banque centrale brésilienne conforme aux spécifications du code BR. Prend en charge les clés PIX (CPF, CNPJ, e-mail, téléphone ou clé aléatoire), le nom/ville du commerçant, l'ID de transaction et les montants BRL.",
        "AusPayNet/NPP PayID (Australie) : système PayID de la nouvelle plateforme de paiement australienne. Prend en charge les types PayID (e-mail, mobile, ABN, identifiant d'organisation) ou le numéro de compte BSB + traditionnel. Le nom du commerçant est facultatif, car les payeurs voient le nom enregistré lors de la recherche NPP.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Paiements en crypto-monnaie',
      bullets: [
        'Bitcoin/Litecoin (BIP-21) : URI de paiement en crypto-monnaie standard avec adresse de portefeuille, montant facultatif et étiquette. Compatible avec tous les principaux portefeuilles Bitcoin et Litecoin.',
        'Lightning Network (BOLT11) : factures de paiement Lightning Network. Collez une chaîne de facture codée BOLT11 pour des paiements Bitcoin instantanés avec des frais minimes.',
        "Ethereum (EIP-681) : URI de demande de transaction Ethereum prenant en charge les transferts ETH natifs et les transferts de jetons ERC-20. Inclut l'ID de chaîne pour la prise en charge multi-réseaux (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), les paramètres de gaz et les appels de fonctions contractuelles.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Services de lien de paiement',
      bullets: [
        "PayPal.Me : liens de paiement PayPal avec nom d'utilisateur et montant pré-rempli facultatif. Les destinataires peuvent payer via le solde PayPal, les cartes ou les comptes bancaires.",
        'Cash App : liens de paiement Cash App utilisant $cashtag avec un montant facultatif. Populaire aux États-Unis pour les paiements peer-to-peer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR EMV générique',
      bullets: [
        'EMV générique : créez des codes QR EMV personnalisés en mode présenté par le marchand pour les modes de paiement non spécifiquement répertoriés. Configurez le nom du commerçant, la ville, le code du pays (ISO 3166-1), le code de la devise (numérique ISO 4217), le MCC, les options de pourboires/frais de commodité et les champs de données supplémentaires. Utile pour les tests ou les intégrations personnalisées.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Modes de fusion de superposition (professionnel)',
      paragraphs: ['Modes de fusion supplémentaires au niveau Professionnel :'],
      bullets: [
        'Pixelate : effet de superposition pixélisé.',
        'Contour : superposition de détection de contour affichant uniquement les contours.',
        'Wave : effet de distorsion ondulée.',
        "Taille des sous-pixels : dimensionnement variable des sous-pixels en fonction de l'image.",
        'True Dither : dithering avancé avec sélection matricielle ordonnée.',
        "Extrême : visibilité maximale de l'image, peut affecter la capacité de numérisation.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Paramètres de protection',
      paragraphs: [
        'Contrôle précis des éléments QR protégés contre les modifications de superposition :',
      ],
      bullets: [
        'Préserver le timing : conservez les modèles de timing inchangés.',
        "Préserver l'alignement : conservez les modèles d'alignement inchangés.",
        "Protéger les informations sur le format : modules d'informations sur le format de protection.",
        "Protéger les informations de version : modules d'informations sur la version du bouclier.",
      ],
    },
    {
      heading: 'Mode compatible ECC',
      paragraphs: [
        "Distribue intelligemment l'intensité de superposition en fonction de la capacité de correction d'erreurs. Le système analyse quels modules peuvent être modifiés tout en conservant la capacité de numérisation.",
      ],
      bullets: [
        "Budget de risque : pourcentage de capacité de correction d'erreurs à utiliser (0-100 %).",
        'Budget plus élevé = superposition plus visible mais numérisation plus risquée.',
        'Budget inférieur = numérisation plus sûre mais superposition moins visible.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Options de rendu professionnel',
      paragraphs: ['Contrôles de rendu avancés :'],
      bullets: [
        "Bords nets : utilisez le rendu d'image pixélisé pour des bords de module nets.",
        'Pixel Snap : alignement des pixels au sol, rond ou plafond.',
        'Mode couleur par module : solide, par luminosité, par position, par superposition, par cluster.',
        'Palette de couleurs : définissez une palette de couleurs personnalisée pour la coloration par module.',
        'Contrast Guard : assure un rapport de contraste minimum entre les couleurs.',
        'Rapport de contraste minimum : exigence de contraste de style WCAG (1:1 à 21:1).',
        'Modules extra-frontaliers : frontière supplémentaire au-delà de la zone calme.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Options de sortie professionnelle',
      paragraphs: ["Paramètres d'exportation d'entreprise :"],
      bullets: [
        "DPI : définissez la résolution d'impression (72-600 DPI). 300 DPI recommandé pour l'impression.",
        'Inclure la zone silencieuse : activez la zone silencieuse dans les dimensions de sortie.',
        'Exporter en tant que supplémentaire : générez un PDF parallèlement au format principal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: "Paramètres d'animation (professionnel)",
      paragraphs: ["Fonctionnalités d'animation professionnelles supplémentaires :"],
      bullets: [
        'Tramage temporel : Désactivé, Bruit bleu ou Tramage par image sans scintillement.',
        "Modèle : Aucun, effets d'impulsion, d'onde, de ligne de balayage, de miroitement ou de dérive.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Référence API',
      paragraphs: [
        "ANQR fournit une API côté serveur pour générer des codes QR via des paramètres d'URL. Ceci est idéal pour intégrer des codes QR dans des sites Web, des e-mails, des documents ou des flux de travail automatisés sans JavaScript côté client.",
        'URL de base : https://anqr.link/api/qr',
      ],
      links: [
        { href: '/examples?lang=${lang}', label: 'Voir des exemples de QR', type: 'example' },
      ],
    },
    {
      heading: 'Paramètres de base',
      paragraphs: [
        'Paramètres obligatoires et communs (les noms des paramètres ne sont pas traduits) :',
      ],
      bullets: [
        "data (obligatoire) : Le contenu à encoder dans le code QR. Caractères spéciaux d'encodage d'URL.",
        "size : Taille de l'image en pixels (par défaut : 400, max : 2000). Utilisé si w/h n'est pas spécifié.",
        'w, h : largeur et hauteur de sortie en pixels. Remplace le paramètre de taille.',
        'format : Format de sortie - png, webp ou gif (par défaut : png).',
        "ec : niveau de correction d'erreur - L, M, Q ou H (par défaut : H).",
        'fg : couleur de premier plan en hexadécimal sans # (par défaut : 000000).',
        "bg : couleur d'arrière-plan au format hexadécimal sans # (par défaut : ffffff).",
        'transparent : défini sur 1 pour un arrière-plan transparent.',
        'margin : Zone calme en modules (par défaut : 4).',
      ],
    },
    {
      heading: 'Paramètres de style',
      paragraphs: ['Style de module et de motif :'],
      bullets: [
        'style : Style de module - carré, arrondi, points, losange, connecté.',
        'chercheur : style de motif du chercheur : carré, arrondi, cercle.',
        "align : style de motif d'alignement - match_finder, carré, arrondi, cercle.",
        'timing : style de modèle de timing - match_module, solide, pointillé.',
        'rayon : pourcentage de rayon de coin 0-100.',
        "écart : pourcentage d'écart de module 0-50.",
        'gapMode : mode Gap - aucun, encart, trait, espace_négatif.',
        "eyeOuter, eyeInner : styles d'yeux : carré, arrondi, cercle.",
        "eyeScale : pourcentage de l'échelle oculaire (par défaut : 100).",
        'grad : Type de dégradé - aucun, linéaire, radial, conique.',
        'gradAngle : angle de dégradé pour les dégradés linéaires.',
        "gradStops : le dégradé s'arrête comme color1,pos1,color2,pos2,... (par exemple, ff0000,0,0000ff,1).",
      ],
    },
    {
      heading: 'Paramètres de superposition',
      paragraphs: [
        "Options de superposition d'image (l'image de superposition est récupérée côté serveur) :",
      ],
      bullets: [
        "img : URL pour superposer l'image (doit être accessible au public).",
        'mode : mode superposition - centre, demi-teinte, mélange, luminosité, mosaïque, tramage, bruit bleu, sous-pixel.',
        'intensité : intensité de superposition 0-100 (par défaut : 100).',
        'colorMode : mode de couleur de superposition - couleur, niveaux de gris, bw.',
        "ajustement : comment la superposition s'ajuste - couvrir, contenir, étirer.",
        'rot : rotation de superposition en degrés.',
        'flipX, flipY : réglé sur 1 pour retourner la superposition.',
        'keepFinders : préserve les modèles de recherche (par défaut : 1).',
        'keepTiming, keepAlign : défini sur 1 pour préserver les modèles de synchronisation/alignement.',
      ],
    },
    {
      heading: 'Paramètres de prétraitement',
      paragraphs: ["Prétraitement d'image appliqué à la superposition :"],
      bullets: [
        'luminosité : Réglage -100 à 100 (par défaut : 0).',
        'contraste : Réglage -100 à 100 (par défaut : 0).',
        'gamma : Valeur 0,1 à 3 (par défaut : 1).',
        'saturation : Réglage -100 à 100 (par défaut : 0).',
        'teinte : rotation de la teinte en degrés.',
        'flou : Flou en pixels.',
        "aiguiser : montant d'affûtage 0-100.",
        'posterize : Postériser les niveaux.',
        'seuil : seuil binaire 0-255.',
        'edge : Détection de bord - désactivé, sobel, astucieux.',
        'invert : réglé sur 1 pour inverser les couleurs.',
      ],
    },
    {
      heading: 'Paramètres du filigrane',
      paragraphs: ['Ajoutez des filigranes aux codes QR générés :'],
      bullets: [
        'wmEn : défini sur 1 pour activer le filigrane.',
        'wmKind : Type de filigrane - texte, image, motif.',
        'wmText : texte en filigrane (codé en URL).',
        "wmImg : URL pour filigraner l'image.",
        'wmPos : Position - centre, coins, bords, derrière, quiet_zone.',
        'wmOpacity : Opacité 0-100 (par défaut : 50).',
        'wmBlend : mode de fusion - normal, multiplication, écran, superposition.',
      ],
    },
    {
      heading: "Paramètres d'animation",
      paragraphs: ['Pour une sortie GIF animée (nécessite format=gif) :'],
      bullets: [
        "animPattern : motif d'animation - aucun, impulsion, vague, ligne de balayage, miroitement, dérive, color_cycle.",
        "animFrames : nombre d'images 1 à 60 (par défaut : 24).",
        "animSpeed : délai d'image en millisecondes 10-1000 (par défaut : 100).",
        "animSeed : graine aléatoire pour l'animation.",
        "easing : assouplissement d'animation - linéaire, easy_in, easy_out, easy_in_out, rebond.",
      ],
    },
    {
      heading: 'Paramètres de sortie',
      paragraphs: ['Options de format de sortie :'],
      bullets: [
        'qualité : qualité WebP 0-1 (par défaut : 0,9).',
        'webpQ : qualité WebP 0-100 (par défaut : 90).',
        'gifColors : taille de la palette GIF 2-256 (par défaut : 256).',
        'dpi : sortie DPI pour PNG (par défaut : 72).',
        'MetaTitle, MetaAuthor, MetaCopy, MetaDesc : champs de métadonnées PNG.',
      ],
    },
    {
      heading: "Exemple d'utilisation",
      paragraphs: [
        'Code QR de base :',
        'https://anqr.link/api/qr?data=https://example.com',
        'Code QR stylisé avec des couleurs personnalisées :',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'Code QR avec image superposée :',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF animé :',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [
        { href: '/examples?lang=${lang}', label: 'Voir des exemples de QR', type: 'example' },
      ],
    },
    {
      heading: 'Intégration de codes QR',
      paragraphs: [
        "En mode Professionnel, la fonctionnalité Partager génère du HTML et des URL intégrables. Voici comment fonctionne l'intégration :",
      ],
      bullets: [
        "Lien de partage : crée une URL vers l'application ANQR avec tous vos paramètres codés en tant que paramètres d'URL. Les destinataires peuvent consulter et modifier le code QR.",
        "Intégrer l'image : génère une balise <img> pointant vers l'API du serveur. Le code QR est rendu côté serveur et sert d'image.",
        "Intégrer Markdown : crée une syntaxe d'image Markdown pour la documentation et les fichiers README.",
        "URL d'API directe : l'URL d'API brute à utiliser dans les applications, les scripts ou d'autres intégrations.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Exemple HTML',
      paragraphs: [
        'Pour intégrer un code QR dans votre site Web :',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        'Pour un dimensionnement réactif :',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="largeur maximale : 100 % ; hauteur : auto ;" />',
        'Le serveur met en cache les réponses avec de longs en-têtes de cache, de sorte que les requêtes répétées pour la même URL sont rapides.',
      ],
    },
    {
      heading: "Partager le format de l'URL",
      paragraphs: [
        "Lorsque vous cliquez sur Partager en mode Professionnel, ANQR encode vos paramètres actuels en paramètres d'URL. Le format est :",
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        "Ces paramètres reflètent les paramètres de l'API, vous pouvez donc convertir une URL de partage en URL d'API en modifiant le chemin de base de / vers /api/qr et en ajustant les paramètres w/h si nécessaire.",
        "Remarque : Les images de superposition téléchargées à partir de fichiers locaux ne peuvent pas être partagées via une URL. Seules les superpositions basées sur une URL (paramètre img) fonctionnent dans les liens partagés et les appels d'API.",
      ],
    },
    {
      heading: 'Limites de débit et utilisation',
      paragraphs: [
        "L'utilisation de l'API est gratuite pour des volumes raisonnables. Pour une utilisation à volume élevé ou des applications commerciales nécessitant une disponibilité garantie, veuillez nous contacter.",
        "Les réponses de l'API incluent des en-têtes de mise en cache agressifs. Pour de meilleures performances, mettez en cache les réponses de votre côté ou utilisez systématiquement la même URL pour des codes QR identiques.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Meilleures pratiques',
      paragraphs: ['Suivez ces directives pour obtenir des codes QR fiables :'],
      bullets: [
        'Testez toujours vos codes QR avec plusieurs applications de scanner avant de les imprimer.',
        "Utilisez la correction d'erreur H (élevée) lors de l'ajout de superpositions.",
        'Conservez au moins 4 modules de zone calme (marge).',
        "Assurez un contraste élevé entre le premier plan et l'arrière-plan.",
        "Pour l'impression, utilisez au moins 300 DPI et testez à la taille d'impression réelle.",
        "Activez Conserver les modèles du Finder lors de l'utilisation de superpositions.",
        'Commencez avec une intensité de superposition plus faible et augmentez progressivement.',
        "Pour une utilisation en extérieur, envisagez des tailles de modules plus grandes et une correction d'erreur plus élevée.",
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Voir des exemples de QR', type: 'example' },
      ],
    },
    {
      heading: 'Dépannage',
      paragraphs: ['Problèmes courants et solutions :'],
      bullets: [
        "Le QR ne scanne pas : réduisez l'intensité de la superposition, augmentez la correction des erreurs, vérifiez le contraste.",
        "Code trop volumineux : réduisez la longueur du contenu, utilisez un raccourcisseur d'URL, version inférieure.",
        'Sortie floue : augmentez la taille du module, utilisez PNG au lieu des formats compressés.',
        'Les couleurs ne semblent pas correctes : vérifiez le contraste des couleurs, essayez le mode de superposition en niveaux de gris.',
        "GIF ne s'animant pas : assurez-vous d'utiliser la sortie au format GIF, vérifiez le nombre d'images.",
        "La superposition d'images ne se charge pas : vérifiez les autorisations CORS sur les images distantes.",
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Voir les guides et exemples associés',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Raccourcis clavier',
      paragraphs: [
        "ANQR prend en charge les raccourcis clavier standard. Utilisez Ctrl/Cmd+S pour déclencher l'exportation (lorsque vous êtes concentré sur l'aperçu).",
      ],
    },
    {
      heading: 'Partage et intégration',
      paragraphs: [
        'En mode Professionnel, cliquez sur le bouton Partager pour copier une URL avec vos paramètres actuels. Les destinataires peuvent ouvrir cette URL pour voir votre configuration exacte. Remarque : Les images superposées provenant de fichiers locaux ne peuvent pas être partagées via une URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Essayez cette configuration directement dans le générateur ANQR.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Voir des exemples de QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Voir des exemples de QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
  ],
};

export default guide;
