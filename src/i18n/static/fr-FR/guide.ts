import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const guide: PageDefinition = {
  title: 'Guide de l\'utilisateur ANQR',
  description: 'Guide complet d\'utilisation de l\'ANQR pour créer des codes QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Voir les exemples QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Commencer',
      paragraphs: ['ANQR est un générateur de code QR avec une première approche client. Par défaut, les codes QR sont générés localement dans votre navigateur - aucun compte requis et vos données restent privées. Pour l\'intégration professionnelle, vous pouvez également utiliser l\'API côté serveur.', 'L\'interface a trois niveaux d\'interface : Basic, Advanced et Professional. Sélectionnez votre niveau en utilisant les onglets de l\'en-tête. Chaque niveau débloque des fonctionnalités supplémentaires tout en gardant l\'interface centrée sur ce dont vous avez besoin.'],
      bullets: ['Base : Création simple de code QR avec contenu texte/URL et superposition d\'image.', 'Avancé : Options d\'encodage QR, styles de rendu, animation, formats de sortie, types de contenu étendus et personnalisation de superposition.', 'Professionnel : Filigranes, métadonnées, partage, analyse de sécurité, codes QR de paiement et fonctionnalités d\'entreprise.'],
      links: [{ href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' }],
    },
    {
      heading: 'Démarrer rapidement',
      paragraphs: ['Pour créer votre premier code QR :'],
      bullets: ['1. Sélectionnez un type de contenu (URL, texte, WiFi, etc.) dans le menu déroulant Type de contenu.', '2. Entrez vos données dans les champs fournis.', '3. Personnalisez en option les couleurs, les styles et ajoutez une image superposée.', '4. Cliquez sur Exporter pour télécharger votre code QR comme PNG, GIF, WebP ou SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Caractéristiques de base',
      paragraphs: ['Le niveau de base fournit une interface simplifiée pour créer des codes QR avec du contenu de charge utile et des superpositions d\'images. C\'est la façon la plus simple de commencer.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Types de contenu (base)',
      paragraphs: ['Texte simple : codez tout texte jusqu\'à la limite de capacité du code QR. Idéal pour les messages courts, les codes ou les identifiants.', 'URL: Encoder les adresses web. Le code QR ouvrira l\'URL lors de la numérisation. Soutiens http:// et https:// protocoles.'],
    },
    {
      heading: 'Superposition de l\'image (base)',
      paragraphs: ['Téléchargez une image (JPG, PNG, GIF, WebP) pour la fondre avec votre code QR. Les caractéristiques de base de superposition comprennent:'],
      bullets: ['Télécharger à partir du fichier : Sélectionnez une image de votre appareil.', 'Charger depuis l\'URL : Saisissez une URL image (doit autoriser CORS).', 'Logo du centre : Place l\'image au centre, en s\'appuyant sur la correction d\'erreur.', 'Mélange : Mélange alpha simple de l\'image avec le modèle QR.', 'Intensité : Contrôle la forte incidence de la superposition sur le code QR (0-100 %).', 'Mode couleur: Couleur pleine, gris ou noir et blanc.', 'Préserver les modèles de recherche : Garde les motifs d\'angle non modifiés pour un balayage fiable.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Voir guides et exemples connexes', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Caractéristiques avancées',
      paragraphs: ['Le niveau avancé débloque les options d\'encodage QR, les styles de rendu, l\'animation, les formats de sortie, les types de contenu étendus et la personnalisation avancée des superpositions.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Paramètres du codage QR',
      paragraphs: ['Version: Les codes QR sont disponibles dans les versions 1 à 40, avec des versions plus élevées contenant plus de données mais étant plus grandes. Définissez à 0 (Auto) pour laisser ANQR choisir la version la plus petite qui correspond à votre contenu.', 'Correction d\'erreur : Détermine combien de dommages un code QR peut supporter tout en restant scannable.'],
      bullets: ['L (faible): correction d\'erreur de 7% - plus petite taille, moindre redondance.', 'M (Moyen): correction d\'erreur de 15% - option équilibrée.', 'Q (Quartile): correction d\'erreur de 25% - bon pour les codes imprimés.', 'H (High): correction d\'erreur de 30% - le meilleur pour les codes avec superpositions ou dans des conditions difficiles.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Zone tranquille (Margin)',
      paragraphs: ['La zone tranquille est l\'espace blanc autour du code QR. Les scanners ont besoin de cette marge pour détecter où le code commence. La norme recommande au moins 4 modules. Réduire en dessous de 4 peut causer des problèmes de numérisation.'],
    },
    {
      heading: 'Style du module',
      paragraphs: ['Les modules sont les carrés individuels qui composent un code QR. ANQR offre cinq styles :'],
      bullets: ['Carré : Classic QR avec des coins pointus.', 'Arrondissement : Coins adoucis pour un look plus convivial.', 'Points: Modules circulaires pour une esthétique moderne.', 'Diamant : carré rotatif de 45° pour un motif distinctif.', 'Connecté : Les modules fusionnent lorsqu\'ils sont adjacents, créant des formes organiques.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Modèle de recherche',
      paragraphs: ['Les modèles de recherche sont les trois grands carrés dans les coins QR qui aident les scanners à orienter le code. Modèles disponibles :'],
      bullets: ['Carré : coins carrés standard.', 'Arrondissement : Coins adoucis avec style module arrondi.', 'Circle: Modèles de recherche circulaire pour les codes style point.'],
    },
    {
      heading: 'Patterns d\'alignement et de synchronisation',
      paragraphs: ['Les patrons d\'alignement apparaissent dans les grands codes QR (version 2+) pour aider à corriger la distorsion. Les modèles de temps sont les lignes alternées reliant les modèles de recherche.'],
      bullets: ['Style d\'alignement : rechercheur de correspondance, carré, arrondi ou cercle.', 'Style de chronométrage : Module de correspondance, Solide ou Dashed.'],
    },
    {
      heading: 'Couleurs',
      paragraphs: ['Avant-propos: La couleur des modules QR. Noir (#000000) est standard, mais toute couleur foncée fonctionne.', 'Rappel: La couleur de fond. Le blanc (#ffffff) est standard. Assurer un contraste suffisant avec le premier plan.', 'Contexte transparent : Enlever le fond entièrement pour utilisation sur des surfaces colorées. Assurez-vous que la surface offre un contraste adéquat.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Taille et écart du module',
      paragraphs: ['Taille du module : Contrôle la taille de chaque module en pixels. Des valeurs plus grandes créent des codes plus grands et plus faciles à analyser.', 'Écart entre les modules : Ajoute de l\'espace entre les modules en pourcentage. De petites lacunes (5-15 %) peuvent améliorer la scannabilité dans certaines conditions, mais des lacunes excessives réduisent la fiabilité.'],
    },
    {
      heading: 'Paramètres de sortie',
      paragraphs: ['Format: Choisissez votre format d\'exportation en fonction du cas d\'utilisation.'],
      bullets: ['PNG: Format raster sans perte, idéal pour la plupart des utilisations. Meilleur pour l\'impression et le numérique.', 'WebP: Format moderne avec de plus petites tailles de fichiers. Bon pour une utilisation web.', 'GIF: Requis pour les codes QR animés. Soutient la transparence.', 'SVG: Format vectoriel qui s\'échelle infiniment. Meilleur pour les gros caractères ou quand vous devez modifier le code.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Voir guides et exemples connexes', type: 'learn' },
      ],
    },
    {
      heading: 'Dimensions de sortie',
      paragraphs: ['Largeur/Hauteur : Réglez la taille de sortie en pixels. Pour l\'impression, calculer en fonction du DPI (p. ex. 300 DPI à 1 pouce = 300px). Les tailles plus grandes scanner plus fiable à distance.'],
    },
    {
      heading: 'Paramètres d\'animation (avancée)',
      paragraphs: ['Contrôler le comportement animé du code QR :'],
      bullets: ['Vitesse: Vitesse d\'animation en millisecondes.', 'Boucle : animation continue ou en un seul jeu.', 'Bounce : direction d\'animation Ping-pong.', 'Cadre de démarrage : Commencez l\'animation à partir d\'un cadre spécifique.', 'Cadres Max : Limitez le total des cadres dans l\'animation.', 'Étape du cadre : Passez les cadres pour une animation plus rapide.', 'Interpolation: Aucune, Crossfade, ou Morph entre les cadres.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Voir guides et exemples connexes', type: 'learn' },
      ],
    },
    {
      heading: 'Types de contenu (avancée)',
      paragraphs: ['Niveau avancé débloque des formats de charge utile supplémentaires:'],
      bullets: [
        'Numéro de téléphone (tel:): Crée un lien téléphonique.',
        'Courriel : Ouvre client e-mail avec sujet et corps optionnels.',
        'SMS: Message texte prérempli à un numéro de téléphone.',
        'vCard: Carte de contact complète avec nom, organisation, téléphone, courriel, adresse.',
        'MeCard: Format de contact compact populaire au Japon.',
        'BizCard: Legacy carte de visite format.',
        'Emplacement géographique : Coordonnées GPS qui s\'ouvrent dans les cartes.',
        'WiFi: identifiants réseau pour la connexion automatique (SSID, mot de passe, type de sécurité).',
        'Calendrier Event : format iCalendar avec titre, emplacement, date/heure.',
        'RSVP : Lien vers la page d\'inscription de l\'événement.',
        'Calendrier Inscrivez-vous : Inscrivez-vous à un flux ICS/WebCal.',
        'URL de fichier/document: Lien direct vers les fichiers téléchargeables.',
        'Cloud Storage Link: Liens vers Google Drive, Dropbox, OneDrive, etc.',
        'Profil social : Liens vers LinkedIn, Twitter, Instagram, etc.',
        'Messagerie: WhatsApp, Télégramme, Signal liens profonds.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Fonctions avancées de recouvrement',
      paragraphs: ['Capacités supplémentaires de recouvrement:'],
      bullets: ['Crop : Activez le cropping pour sélectionner une région carrée de votre image.', 'Halftone : motif à point imprimé classique basé sur la luminosité de l\'image.', 'Dithered: Diffusage d\'erreurs pour une reproduction détaillée.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Modes de mélange de recouvrement (avancées)',
      paragraphs: ['Modes de mélange supplémentaires au niveau avancé:'],
      bullets: ['Sous-pixel : Divise chaque module en sous-pixels pour plus de détails.', 'Bruit bleu: Utilise le bruit bleu pour les motifs sans artefacts.', 'Mosaic: Effet à base de carreaux préservant la structure de l\'image.', 'Remplissage des lacunes & #160;: Place l\'image dans les écarts entre les modules.', 'Luminosité: Varie la taille du module en fonction de la luminosité de l\'image.', 'Duotone: Cartes image à deux couleurs pour un contraste frappant.'],
    },
    {
      heading: 'Intensité de recouvrement',
      paragraphs: ['Contrôle à quel point la superposition affecte fortement le code QR (0-100%). Les valeurs plus élevées montrent plus de détails d\'image mais peuvent réduire la scannabilité. Commencez autour de 70 % et ajustez en fonction des tests.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Voir guides et exemples connexes', type: 'learn' }],
    },
    {
      heading: 'Mode couleur',
      paragraphs: ['Comment l\'image superposée est traitée :'],
      bullets: ['Couleur complète: Préserve les couleurs d\'image originales.', 'Grayscale: Convertit en tonalités noires et blanches.', 'Noir & blanc & #160;: Conversion binaire à haut contraste.'],
    },
    {
      heading: 'Préserver les modèles de recherche',
      paragraphs: ['Lorsqu\'il est activé, garde les trois motifs de recherche d\'angle non modifiés par la superposition. Fortement recommandé pour un balayage fiable.'],
    },
    {
      heading: 'Prétraitement de l\'image',
      paragraphs: ['Appliquer des filtres sur votre image de recouvrement avant de mélanger. Ces ajustements peuvent améliorer la façon dont l\'image apparaît dans le code QR final.'],
      bullets: ['Luminosité (-100 à +100): Éclaircir ou assombrir l\'image.', 'Contraste (-100 à +100): Augmenter ou diminuer la gamme tonale.', 'Gamma (0,2 à 3,0): Réglage de la luminosité non linéaire. Les valeurs inférieures à 1 mitons éclaircis, au-dessus de 1 les assombrit.', 'Saturation (-100 à +100): Intensité de couleur. -100 est gris, +100 est sursaturé.', 'Rotation de la tubulure (0-360°): Déplacez toutes les couleurs autour de la roue de couleur.', 'Flou (0-20px): Adoucir les détails de l\'image.', 'Aiguille (0-100%): Améliorer les bords et les détails.', 'Posterisation (0-16 niveaux) : Réduire les niveaux de couleur pour un effet affiche.', 'Seuil (0-255) : Convertir en noir/blanc binaire au point de coupure.', 'Détection des bords : algorithmes Sobel ou Canny pour ne montrer que les bords.', 'Inverser: Inverser toutes les couleurs.'],
    },
    {
      heading: 'Mode d\'ajustement',
      paragraphs: ['Comment l\'image de recouvrement correspond à la zone QR code:'],
      bullets: ['Couverture: L\'image remplit toute la zone, en arrachant si nécessaire.', 'Contient: Image entière visible, peut avoir des marges.', 'Stretch: Image déforme pour remplir exactement.'],
    },
    {
      heading: 'Transformer les options',
      paragraphs: ['Rotation: Rotation par paliers de 90°.', 'Flip X/Y: Miroir de l\'image horizontalement ou verticalement.'],
    },
    {
      heading: 'Algorithmes distants',
      paragraphs: ['Dithering convertit les images continues en motifs que les codes QR peuvent représenter. Disponible en mode mélange Dithered, Blue Noise ou True Dither.'],
      bullets: [
        'Erreur Diffusion : Style classique Floyd-Steinberg. Écarte l\'erreur de quantification aux pixels voisins.',
        'Commande : Utilise une matrice de seuil pour les modèles réguliers.',
        'Point groupé : Simule l\'impression à demi-ton.',
        'Void & Cluster & #160;: Optimisé commande dithering.',
        'Bruit bleu : Un motif visuel agréable et aléatoire.',
        'Bruit bleu Seuil: Seuil dithering avec texture de bruit bleu.',
        'Bruit blanc : Dithering aléatoire.',
        'Gaussienne/triangulaire Bruit: Bruit avec différentes distributions.',
        'Blue Bruit + Erreur Diffusion : Hybride combinant les deux techniques.',
        'Bruit bleu d\'écran: Modèle de bruit bleu d\'écran.',
        'Perceptuel: Luminance pondérée pour de meilleurs résultats visuels.',
        'Edge-Aware: Préserve les bords d\'image pendant le dithering.',
        'Seuil d\'adaptation : Seuil adapté au niveau local.',
        'Bruit bleu temporal : Pour les GIF animés, varie le motif par cadre.',
      ],
    },
    {
      heading: 'Amandes de diffusion',
      paragraphs: ['Lors de l\'utilisation de la diffusion d\'erreur, choisissez comment l\'erreur est distribuée :'],
      bullets: ['Floyd-Steinberg: Diffusion classique de 4 voisins. Bon choix général.', 'Jarvis-Judice-Ninke : 12 voisins, plus doux mais plus lent.', 'Stucki: Similaire à JJN avec différents poids.', 'Burkes: JJN simplifié, plus vite.', 'Sierra: Famille de noyaux équilibrant qualité et vitesse.', 'Atkinson : Diffusion de lumière, conserve les détails mais peut être granuleux.'],
    },
    {
      heading: 'La force des différences',
      paragraphs: ['Contrôle la quantité de dithering appliquée (0-100%). Les valeurs inférieures conservent plus du motif original, les valeurs plus élevées montrent plus de détails d\'image.'],
    },
    {
      heading: 'Paramètres de Subpixel',
      paragraphs: ['Lors de l\'utilisation du mode de mélange Subpixel:'],
      bullets: ['Taille de la grille: 2×2, 3×3, ou 4×4 sous-pixels par module. Plus haut = plus de détails.', 'Règle du centre : Strict exige que le sous-pixel du centre corresponde au module. Le centre demi-ton permet la variation.', 'Couleur neutre: Couleur utilisée pour les sous-pixels indéterminés.', 'Surchargeur : Comment les modèles de recherche sont rendus (Solid ou Stylized).'],
    },
    {
      heading: 'Paramètres de demi-ton',
      paragraphs: ['Lorsque vous utilisez le mode mélange Halftone:'],
      bullets: ['Taille de la cellule: Par module ou grille N×N.', 'Forme du point : Cercle, carré ou ligne.', 'Courbe de luminosité : linéaire, S-Curve ou Gamma.'],
    },
    {
      heading: 'Couleurs duotone',
      paragraphs: ['Lors de l\'utilisation du mode mélange Duotone, définissez la couleur Ombre (zones foncées) et Highlight (zones brillantes).'],
    },
    {
      heading: 'Paramètres d\'animation GIF',
      paragraphs: ['Lors de l\'utilisation de superpositions GIF animées:'],
      bullets: ['Utiliser les délais de cadre : Respectez le calendrier original du FPG.', 'Max FPS: Limiter le taux d\'image (1-60 fps).', 'Manipulation de l\'élimination : Respecter ou simplifier les méthodes d\'élimination des cadres.'],
    },
    {
      heading: 'Options avancées de rendu',
      paragraphs: ['Commandes de rendu supplémentaires:'],
      bullets: ['Mode Gap: Aucun, Inset, Stroke, ou Négatif Space gap style.', 'Rayon d\'angle : Pourcentage des coins arrondis pour les modules.', 'Gradient : Aucun gradient linéaire, radial ou conique sur les modules.', 'Eye Outer/Inner Style: Style indépendant pour les bagues de motif de trouver.', 'Rotation des points: Modules rotatifs diamant/point.', 'Echelle des yeux : Réglage de la taille pour les modèles de recherche.', 'Style de cadre : Ajouter des cadres décoratifs (cadre arrondi, autocollant, étiquette).', 'Texte du cadre : Ajouter du texte comme "Scan Me!" aux cadres.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Encodage QR avancé',
      paragraphs: ['Encodage QR fin :'],
      bullets: ['Mode d\'encodage : Auto, numérique, alphanumérique, Byte/UTF-8 ou Kanji.', 'Appliquer la zone de silence Min : assurer au moins 4 marges de module.', 'Motif de masque : Auto (optimal), ou sélectionnez manuellement les motifs 0-7 pour contrôler la distribution des modules. Différents modèles créent des apparences visuelles différentes tout en codant les mêmes données.', 'Encodage des caractères : ISO-8859-1 (par défaut Latin-1), UTF-8 (Unicode complet incluant emoji) ou Shift-JIS (Japonais). Choisissez en fonction des exigences de caractère de votre contenu.'],
    },
    {
      heading: 'Options de sortie avancées',
      paragraphs: ['Paramètres d\'exportation supplémentaires :'],
      bullets: ['Nom de fichier: Nom de fichier personnalisé pour les téléchargements.', 'GIF Palette Taille: 2-256 couleurs en sortie GIF.', 'GIF Quantité: Coupe médiane, NeuQuant, ou Octree réduction de couleur.', 'GIF Dithering: Off, Floyd-Steinberg, ou commandé.', 'GIF Couleur transparente: Définir une couleur pour être transparente.', 'SVG Vrai vecteur : Utilisez des chemins au lieu de raster intégré.', 'SVG Précision de forme : rendu de chemin Pixel ou précis.', 'SVG Revêtement de grille intégrée : Inclure la superposition comme image intégrée.', 'Historique Override: Force une couleur de fond spécifique dans la sortie.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Options de validation',
      paragraphs: ['Paramètres de traitement des entrées & #160;:'],
      bullets: ['Valider l\'entrée : Vérifiez le format du contenu avant d\'encoder.', 'Trim Whitespace: Enlever les espaces de guidage.', 'Normaliser les nouvelles lignes : Convertir toutes les terminaisons de ligne en LF.', 'Max Length Guard: Avertissement si le contenu dépasse la capacité QR.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Caractéristiques professionnelles',
      paragraphs: ['Le niveau professionnel ajoute des filigranes, des métadonnées, des options de partage, une analyse de sécurité, des codes QR de paiement et des fonctionnalités d\'entreprise.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Filigrane',
      paragraphs: ['Ajoutez des filigranes à vos codes QR :'],
      bullets: ['Genre : filigrane texte, image ou motif.', 'Position: Centre, Coins, Bords, Derrière, ou Zone tranquille.', 'Opacité : transparence du filigrane (0-100%).', 'Mode de mélange : mélange normal, multiple, écran ou superposition.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Métadonnées',
      paragraphs: ['Intégrer les métadonnées dans les fichiers exportés :'],
      bullets: ['Titre, Auteur, Droit d\'auteur, Licence, Champs Description.', 'Heure de création: Horodatage de génération embed.', 'Valeur personnalisée de la clé : Ajouter des paires de métadonnées arbitraires.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Partage',
      paragraphs: ['Partagez vos configurations de code QR:'],
      bullets: ['Lien direct : Générez une URL partagée avec vos paramètres actuels.', 'Intégré HTML: Obtenez le code d\'intégration pour les sites Web.', 'Paramètres de codage : Inclure tous les paramètres dans l\'URL de partage.', 'Remarque : les images superposées des fichiers locaux ne peuvent pas être partagées via URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Voir guides et exemples connexes', type: 'learn' },
      ],
    },
    {
      heading: 'Analyse de la sécurité',
      paragraphs: ['S\'assurer que les codes QR restent scannables :'],
      bullets: ['Mode de sécurité: Exigences de balayage hors tension, équilibrées ou strictes.', 'Module Min Taille: Taille minimale du pixel par module.', 'Min silence Zone: modules de marge minimale.', 'Verrouillages/Timing/Align/Format/Version: Protégez les éléments spécifiques.', 'Max Overlay Intensité par ECC : Limites d\'intensité automatiques basées sur le niveau de correction des erreurs.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Voir guides et exemples connexes', type: 'learn' },
      ],
    },
    {
      heading: 'Types de contenu (professionnels)',
      paragraphs: ['Le niveau professionnel ajoute les types de paiement et de contenu d\'entreprise :'],
      bullets: ['EPC/SEPA (UE): codes QR de virement bancaire européen avec IBAN, BIC, montant, référence.', 'UPI (Inde): Interface de paiement unifié avec VPA, nom du bénéficiaire, montant.', 'Payez maintenant (Singapour): Paiement rapide à Singapour avec numéro UEN ou mobile.', 'Paiement rapide (Thaïlande): Système de paiement national thaïlandais.', 'PIX (Brésil): Paiement instantané brésilien avec clé PIX.', 'Crypto: Bitcoin, Ethereum, Litecoin adresses de paiement avec le montant optionnel.', 'Lien de campagne marketing : URLs avec le suivi complet du paramètre UTM (Marketing Tags).', 'Lien court : Pour utilisation avec les raccourcisseurs d\'URL pour les codes QR dynamiques/trackables.', 'GS1 Digital Link: Identification du produit avec GTIN, série, lot, péremption.', 'App Deep Link: iOS/Android app des liens profonds avec des schémas personnalisés.', 'Format personnalisé : Données brutes sans formatage ni validation.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Voir guides et exemples connexes', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Paiements pertinents en mode avancé',
      paragraphs: ['Lors de l\'utilisation du mode avancé, ANQR affiche automatiquement les méthodes de paiement pertinentes pour votre langue sélectionnée. Par exemple, les utilisateurs vietnamiens voir VietQR, les utilisateurs thaïlandais voir PromptPay, et les utilisateurs indiens la langue voir UPI et BharatQR. Les méthodes de paiement globales (crypto-monnaie, PayPal, Cash App) sont disponibles dans toutes les langues. Le mode professionnel déverrouille toutes les normes de paiement indépendamment de la langue.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Normes européennes de paiement',
      bullets: ['EPC/SEPA (UE): codes QR de virement bancaire européen suivant la norme de code QR de la CBE. Soutient IBAN, BIC (facultatif domestique), montant en EUR et références de paiement structurées ou non structurées. Utilisé dans la zone SEPA, y compris les pays de l\'UE, ainsi que la Suisse, la Norvège, l\'Islande, le Liechtenstein, Monaco et Saint-Marin.', 'Swiss QR-Bill: norme suisse de paiement suivant les lignes directrices de mise en œuvre SIX. Prend en charge CHF et EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), les adresses structurées des créanciers/débiteurs et les informations sur les factures. Requis pour les factures suisses depuis 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Normes de paiement des Indiens',
      bullets: ['UPI (Inde): Interface de paiements unifiés suivant la spécification de liaison profonde du NPIC. Soutient la VPA (adresse de paiement virtuel), le nom du bénéficiaire, le montant en INR, la note de transaction, l\'ID de référence, le code de catégorie de commerçant et le mode transactionnel.', 'BharatQR (Inde): Norme QR unifiée pour les paiements UPI et par carte. Combine UPI VPA avec carte PAN pour une compatibilité maximale. Comprend le nom du marchand, la ville, le MCC, les détails sur la TPS et les numéros de facture/de référence.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Normes de paiement en Asie du Sud-Est',
      bullets: ['Payez maintenant (Singapour): Système de paiement rapide de Singapour en utilisant les spécifications EMVCo QR avec le profil SGQR. Prend en charge UEN (enregistrement d\'entreprise), numéro mobile, ou NRIC comme identifiants mandataires. Inclut l\'affichage du montant et la date d\'expiration.', 'Paiement rapide (Thaïlande): Système national de paiement thaïlandais suivant le profil EMV de la Banque de Thaïlande. Prend en charge le numéro mobile, l\'ID national, l\'ID fiscal, l\'ID du portefeuille électronique et le paiement de factures avec plusieurs champs de référence.', 'QRIS (Indonésie) : Code de réponse rapide Norme indonésienne. Norme nationale de paiement fondée sur l\'EMV pour l\'identification du commerçant, la NMID (National Merchant ID), la classification des critères du marchand et les frais de commodité (fixés ou en pourcentage).', 'DuitNow (Malaisie): système de paiement instantané malaisien. Prend en charge plusieurs types de proxy, y compris NRIC, mobile, passeport, carte d\'identité de l\'armée et numéros d\'enregistrement d\'entreprise.', 'VietQR (Vietnam): norme vietnamienne de transfert interbancaire. Nécessite un BIN bancaire (identification NAPAS) et un numéro de compte. Prend en charge plusieurs codes de service pour différents types de transfert (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Philippines): Norme de paiement QR pour InstaPay et PESONet. Utilise les numéros de compte avec identification de marchand pour les transactions P2M (de personne à marchand).'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Normes de paiement en Asie de l\'Est',
      bullets: ['TWQR (Taiwan): norme de paiement QR taïwanaise. Prend en charge les montants d\'identification du marchand, d\'identification fiscale et de MDT.', 'HKQR/FPS Système de paiement rapide de Hong Kong Codes QR. Prend en charge l\'ID FPS, le numéro mobile ou l\'e-mail comme identifiants de paiement. Montants en HKD.', 'JPQR (Japon): norme japonaise unifiée de paiement du code QR. Utilise l\'ID du magasin pour l\'identification du marchand avec les montants JPY.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Autres normes régionales de paiement',
      bullets: ['PIX (Brésil): Système de paiement instantané de la Banque centrale brésilienne suivant la spécification du code BR. Prend en charge les clés PIX (CPF, CNPJ, courriel, téléphone ou clé aléatoire), le nom/ville du marchand, l\'ID de transaction et les montants BRL.', 'AusPayNet/NPP ID payant (Australie) : Système australien de nouvelle plate-forme de paiement PayID. Paiements de soutien Types d\'identification (email, mobile, ABN, organisation ID) ou numéro de compte traditionnel BSB +. Le nom commercial est optionnel puisque les payeurs voient le nom enregistré de la recherche NPP.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Paiements de cryptomonnaie',
      bullets: ['Bitcoin/Litecoin (BIP-21): Paiement standard de cryptomonnaie URIs avec adresse de portefeuille, montant optionnel et étiquette. Compatible avec tous les principaux portefeuilles Bitcoin et Litecoin.', 'Réseau de foudre (BOLT11) : Factures de paiement du réseau Lightning. Coller une chaîne de facture encodée BOLT11 pour des paiements Bitcoin instantanés avec des frais minimes.', 'Ethereum (EIP-681): Demande de transaction d\'Ethereum URIs supportant les transferts d\'ETH natifs et les transferts de jeton ERC-20. Comprend l\'ID chaîne pour le support multi-réseau (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), les paramètres de gaz, et les appels de fonction de contrat.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Services de liaison de paiement',
      bullets: ['PayPal.Me: PayPal liens de paiement avec le nom d\'utilisateur et le montant optionnel prérempli. Les bénéficiaires peuvent payer par solde PayPal, cartes ou comptes bancaires.', 'Demande en espèces : espèces Liens de paiement app en utilisant $cashtag avec le montant optionnel. Populaire aux États-Unis pour les paiements entre pairs.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'EMV générique QR',
      bullets: ['EMV Générique: Créez un mode EMV personnalisé et présenté par le marchand Codes QR pour les systèmes de paiement non spécifiquement énumérés. Configurer le nom du marchand, la ville, le code de pays (ISO 3166-1), le code de devise (ISO 4217 numérique), le MCC, les options de frais de conseil/convenance et les champs de données supplémentaires. Utile pour les tests ou les intégrations personnalisées.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Modes de mélange de recouvrement (professionnels)',
      paragraphs: ['Modes de mélange supplémentaires au niveau des administrateurs :'],
      bullets: ['Pixélate : effet de recouvrement pixelisé.', 'Description: Superposition de détection des bords avec seulement des contours.', 'Vague : Effet de distorsion de l\'eau.', 'Taille du sous-pixel : Taille variable du sous-pixel basée sur l\'image.', 'True Dither: Dithering avancé avec sélection de matrice ordonnée.', 'Extrême : La visibilité maximale de l\'image peut affecter la scannabilité.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Paramètres de protection',
      paragraphs: ['Contrôle à grains fins sur lesquels les éléments QR sont protégés contre la modification de la superposition:'],
      bullets: ['Préserver le calendrier : Gardez les schémas de temps non modifiés.', 'Préserver l\'alignement : garder les modèles d\'alignement non modifiés.', 'Protéger le format Informations: modules d\'information au format Shield.', 'Protéger la version Info: Modules d\'information de version Shield.'],
    },
    {
      heading: 'Mode ECC-Aware',
      paragraphs: ['Distribue intelligemment l\'intensité de recouvrement en fonction de la capacité de correction des erreurs. Le système analyse quels modules peuvent être modifiés tout en maintenant la scannabilité.'],
      bullets: ['Budget des risques : Pourcentage de la capacité de correction des erreurs à utiliser (0-100 %).', 'Budget plus élevé = recouvrement plus visible mais plus risqué.', 'Budget inférieur = balayage plus sûr, mais recouvrement moins visible.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Options de rendu professionnel',
      paragraphs: ['Contrôles de rendu avancés :'],
      bullets: ['Bords de crise : Utilisez le rendu d\'images pixelisées pour les bords aigus des modules.', 'Pixel Snap: Alignement du pixel au sol, rond ou ceil.', 'Mode couleur par module: Solide, par luminosité, par position, par superposition, par grappe.', 'Palette de couleur : Définir la palette de couleurs personnalisée pour la coloration par module.', 'Garde contraste : assurer un rapport de contraste minimal entre les couleurs.', 'Ratio de contraste min : exigence de contraste de style WCAG (1:1 à 21:1).', 'Extra-frontière Modules : Frontière supplémentaire au-delà de la zone tranquille.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Options de sortie professionnelle',
      paragraphs: ['Paramètres d\'exportation des entreprises & #160;:'],
      bullets: ['DPI: Réglage de la résolution d\'impression (72-600 DPI). 300 DPI recommandé pour l\'impression.', 'Inclure la zone tranquille: Toggle zone calme dans les dimensions de sortie.', 'Exporter en tant qu\'extrant: Générer PDF en format primaire.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Paramètres d\'animation (professionnels)',
      paragraphs: ['Autres fonctions d\'animation professionnelle :'],
      bullets: ['Dither temporal: Off, Blue Bruit, ou Flicker Safe par cadre dithering.', 'Motif: Aucun, Pulse, Wave, Scanline, Shimmer, ou Drift effets.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Voir guides et exemples connexes', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Référence',
      paragraphs: ['ANQR fournit une API côté serveur pour générer des codes QR via des paramètres URL. Ceci est idéal pour intégrer des codes QR dans des sites Web, des courriels, des documents ou des workflows automatisés sans JavaScript côté client.', 'URL de base: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Voir les exemples QR', type: 'example' }],
    },
    {
      heading: 'Paramètres de base',
      paragraphs: ['Paramètres requis et communs (les noms des paramètres ne sont pas traduits):'],
      bullets: ['données (obligatoire): Le contenu à coder dans le code QR. Encoder des caractères spéciaux.', 'taille: Taille de l\'image en pixels (par défaut: 400, max: 2000). Utilisé si w/h n\'est pas spécifié.', 'w, h: Largeur et hauteur de sortie en pixels. Dépasse le paramètre de taille.', 'format: Format de sortie - png, webp ou gif (par défaut: png).', 'ec: Niveau de correction d\'erreur - L, M, Q ou H (par défaut: H).', 'fg: Couleur avant plan comme hexagone sans # (par défaut: 000000).', 'bg: Couleur de fond comme hexagone sans # (par défaut: ffffff).', 'transparent : défini sur 1 pour un arrière-plan transparent.', 'marge: Zone tranquille dans les modules (par défaut: 4).'],
    },
    {
      heading: 'Paramètres de stylage',
      paragraphs: ['Style du module et du modèle :'],
      bullets: ['style: Style de module - carré, arrondi, points, diamant, connecté.', 'trouver : Modèle de recherche - carré, arrondi, cercle.', 'aligne: Style de motif d\'alignement - match_finder, carré, arrondi, cercle.', 'timing: Style de motif de chronométrage - match_module, solide, pointillé.', 'rayon: Pourcentage de rayon d\'angle 0-100.', 'écart: pourcentage d\'écart de module 0-50.', 'gapMode: Mode Gap - aucun, inset, course, négatif_espace.', 'yeux Extérieur, oeil intérieur: Styles oculaires - carré, arrondi, cercle.', 'eyeScale: Pourcentage d\'échelle des yeux (par défaut: 100).', 'grad: Gradient type - aucun, linéaire, radial, conique.', 'gradAngle: Angle gradué pour les gradients linéaires.', 'gradStops: Gradient s\'arrête comme color1,pos1,color2,pos2,... (par exemple, ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Paramètres de recouvrement',
      paragraphs: ['Options de superposition d\'image (l\'image de superposition est récupérée côté serveur):'],
      bullets: ['img: URL pour superposer l\'image (doit être accessible au public).', 'mode: mode superposition - centre, demi-ton, mélange, luminosité, mosaïque, dithered, blue-bruit, subpixel.', 'intensité: intensité de recouvrement 0-100 (par défaut: 100).', 'couleur Mode: Mode de couleur Overlay - couleur, échelle de gris, bw.', 'fit: Comment la superposition s\'adapte - couvrir, contenir, stretch.', 'pourriture: rotation de recouvrement en degrés.', 'flipX, flipY : Réglez à 1 pour retourner la superposition.', 'garder Trouver : Préserver les modèles de recherche (par défaut : 1).', 'keepTiming, keepAlign : défini sur 1 pour préserver les modèles de synchronisation/alignement.'],
    },
    {
      heading: 'Paramètres de prétraitement',
      paragraphs: ['Prétraitement d\'image appliqué à la superposition :'],
      bullets: ['luminosité: Réglage -100 à 100 (par défaut: 0).', 'contraste: Réglage -100 à 100 (par défaut: 0).', 'gamma: valeur 0,1 à 3 (par défaut: 1).', 'saturation: Réglage -100 à 100 (par défaut : 0).', 'teinte: Rotation en degrés.', 'flou : Flou en pixels.', 'aiguiser : Aiguiser la quantité 0-100.', 'posterize: Affichez les niveaux.', 'seuil: Seuil binaire 0-255.', 'bord: détection des bords - hors, sobel, canny.', 'inverse: Réglez à 1 pour inverser les couleurs.'],
    },
    {
      heading: 'Paramètres du filigrane',
      paragraphs: ['Ajouter des filigranes aux codes QR générés :'],
      bullets: ['wmEn: Réglez à 1 pour activer le filigrane.', 'wm Genre : Type de filigrane - texte, image, motif.', 'wmText: Texte filigrane (encodé par URL).', 'wmImg: URL vers l\'image filigrane.', 'wmPos: Position - centre, coins, bords, derrière, tranquille_zone.', 'wmOpacité: Opacité 0-100 (par défaut: 50).', 'wmBlend: Mode mélange - normal, multiplier, écran, superposition.'],
    },
    {
      heading: 'Paramètres d\'animation',
      paragraphs: ['Pour la sortie GIF animée (exige format=gif):'],
      bullets: ['anim Motif: Motif d\'animation - aucun, impulsion, onde, scanline, miroitement, dérive, color_cycle.', 'anim Cadres: Nombre de cadres 1-60 (par défaut: 24).', 'anim Vitesse : Délai d\'image en millisecondes 10-1000 (par défaut : 100).', 'anim Semence : Semence aléatoire pour l\'animation.', 'assouplissement : assouplissement de l\'animation - linéaire, facile_in, facile_out, facile_in_out, rebond.'],
    },
    {
      heading: 'Paramètres de sortie',
      paragraphs: ['Options de format de sortie:'],
      bullets: ['qualité: Qualité WebP 0-1 (par défaut: 0,9).', 'webpQ: Qualité WebP 0-100 (par défaut: 90).', 'gifColors: GIF palette taille 2-256 (par défaut: 256).', 'dpi: sortie DPI pour PNG (par défaut: 72).', 'métaTitre, métaAuteur, métaCopie, méta Desc: champs de métadonnées PNG.'],
    },
    // Crop Parameters
    {
      heading: 'Paramètres de culture',
      paragraphs: ['Options de recadrage des images superposées :'],
      bullets: ['cropEn : Activer le recadrage par superposition 0/1 (par défaut : 0).', 'cropX : recadrer le centre X sous forme de fraction 0-1 (par défaut : 0,5).', 'cropY : recadrer le centre Y sous forme de fraction 0-1 (par défaut : 0,5).', 'cropSize : taille du recadrage en fraction de l\'image 0-1 (par défaut : 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Paramètres de verrouillage de sécurité',
      paragraphs: ['Contrôlez quels éléments QR sont protégés contre les modifications de superposition :'],
      bullets: ['lockF : Verrouiller les modèles de recherche 0/1 (par défaut : 1).', 'lockT : verrouille les modèles de synchronisation 0/1 (par défaut : 1).', 'lockA : verrouille les modèles d\'alignement 0/1 (par défaut : 1).', 'lockFmt : informations sur le format de verrouillage 0/1 (par défaut : 1).', 'lockV : Verrouiller les informations de version 0/1 (par défaut : 1).', 'safeMode : Mode de sécurité - désactivé, équilibré, strict (par défaut : désactivé).', 'safeMinPx : Taille minimale du module en pixels (par défaut : 2).', 'safeMinQz : modules de zone de silence minimum (par défaut : 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Paramètres de réglage automatique',
      paragraphs: ['Paramètres d\'optimisation automatique :'],
      bullets: ['autoVer : sélection automatique de la version 0/1 du QR (par défaut : 1).', 'autoEcc : sélection automatique du niveau ECC 0/1 (par défaut : 0) - indice côté serveur uniquement.', 'autoReduce : [CLIENT UNIQUEMENT] Réduire automatiquement l\'intensité jusqu\'à ce qu\'elle soit numérisable - nécessite une boucle de validation de numérisation.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Paramètres d\'animation supplémentaires',
      paragraphs: ['Commandes d\'animation étendues pour la sortie GIF :'],
      bullets: ['boucle : L\'animation boucle en continu 0/1 (par défaut : 1).', 'rebond : direction de l\'animation Ping-pong 0/1 (par défaut : 0).', 'reverse : lire l\'animation en reverse 0/1 (par défaut : 0).', 'colorCycle : active l\'effet de cycle de couleur 0/1 (par défaut : 0).', 'interp : interpolation d\'image - aucune, fondu enchaîné, morph (par défaut : aucune).', 'tempDither : tramage temporel - désactivé, blue_noise, flicker_safe (par défaut : désactivé).', 'startF : Image de début de l\'animation (par défaut : 0).', 'maxF : nombre maximal d\'images à restituer (par défaut : 0 = auto).', 'stepF : intervalle de pas de trame (par défaut : 1).', 'gigue : [CLIENT UNIQUEMENT] Gigue du module en pixels - nécessite une régénération QR par image.'],
    },
    // Dithering Parameters
    {
      heading: 'Paramètres de tramage',
      paragraphs: ['Contrôlez les algorithmes de tramage pour le traitement de superposition :'],
      bullets: ['ditherKind : algorithme de tramage - error_diffusion, ordonné_bayer, blue_noise, etc (par défaut : ordonné_bayer).', 'diffusionKernel : noyau de diffusion d\'erreurs - floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (par défaut : floyd_steinberg).', 'ditherStrength : intensité de tramage 0-100 (par défaut : 50).', 'serpentine : tramage serpentin 0/1 (par défaut : 0).', 'matrice : matrice de tramage ordonnée - bayer2, bayer4, bayer8 (par défaut : bayer4).', 'bnTile : taille de la tuile de bruit bleu (par défaut : 64).', 'bnSeed : graine aléatoire de bruit bleu (par défaut : 0).', 'colorDither : tramage des couleurs - aucun, par canal, perceptuel (par défaut : aucun).'],
    },
    // Subpixel Parameters
    {
      heading: 'Paramètres de sous-pixels',
      paragraphs: ['Paramètres du mode de fusion des sous-pixels :'],
      bullets: ['spGrid : taille de la grille de sous-pixels - 2x2, 3x3, 4x4 (par défaut : 3x3).', 'spCenter : règle centrale - stricte, halftone_center (par défaut : stricte).', 'spNeutral : hexadécimal de couleur neutre sans # (par défaut : 808080).', 'spFinder : remplacement du Finder - solide, stylisé (par défaut : solide).'],
    },
    // Halftone Parameters
    {
      heading: 'Paramètres de demi-teintes',
      paragraphs: ['Paramètres du mode de fusion des demi-teintes :'],
      bullets: ['htCell : taille de cellule en demi-teinte - par_module ou grille nxn (par défaut : par_module).', 'htDot : Forme du point - cercle, carré, ligne (par défaut : cercle).', 'htCurve : Courbe de luminosité - linéaire, courbe en S, gamma (par défaut : linéaire).', 'duo1 : couleur d\'ombre bicolore hexadécimale sans # (par défaut : 000000).', 'duo2 : couleur de surbrillance bicolore hexadécimale sans # (par défaut : ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Paramètres du mode compatible ECC',
      paragraphs: ['Distribution de superposition intelligente basée sur la capacité de correction d\'erreurs :'],
      bullets: ['eccAware : active le mode compatible ECC 0/1 (par défaut : 0).', 'eccRisk : pourcentage du budget de risque 0-100 (par défaut : 50).', 'eccMap : carte de poids - distance_to_finders, block_heatmap, empirical_scan_heatmap (par défaut : distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Paramètres du cadre',
      paragraphs: ['Paramètres du cadre décoratif :'],
      bullets: ['frame : style de cadre - aucun, round_frame, autocollant, balise (par défaut : aucun).', 'frameText : Texte à afficher dans le cadre (URL encodée).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Paramètres de couleur par module',
      paragraphs: ['Options de coloration des modules individuels :'],
      bullets: ['modColor : Mode couleur - solid, by_brightness, by_position, by_overlay, by_cluster (par défaut : solid).', 'cGuard : Protection de contraste 0/1 (par défaut : 0).', 'minContraste : rapport de contraste minimum 1-21 (par défaut : 4,5).', 'palette : couleurs hexadécimales séparées par des virgules pour le mode palette.', 'paletteMode : distribution de la palette - position, luminosité, diagonale, radiale, aléatoire, ligne, colonne (par défaut : position).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'Paramètres de superposition GIF',
      paragraphs: ['Paramètres pour les images de superposition GIF animées :'],
      bullets: ['ovType : Type de superposition - statique, gif, apng, webp_anim, vidéo (par défaut : statique).', 'ovFramePick : sélection de trames - all, each_n, max_frames, duration_limit (par défaut : all).', 'gifDelays : utilise les délais de trame GIF d\'origine 0/1 (par défaut : 1).', 'gifDispH : gestion de l\'élimination des GIF - respecter, simplifier (par défaut : respecter).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Limites d\'intensité par ECC',
      paragraphs: ['Intensité de superposition maximale par niveau de correction d\'erreur :'],
      bullets: ['maxIntL : intensité maximale pour ECC L 0-100 (par défaut : 100).', 'maxIntM : Intensité maximale pour ECC M 0-100 (par défaut : 100).', 'maxIntQ : intensité maximale pour ECC Q 0-100 (par défaut : 100).', 'maxIntH : intensité maximale pour ECC H 0-100 (par défaut : 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Paramètres de simulation d\'assurance qualité (client uniquement)',
      paragraphs: ['Ces paramètres sont analysés pour vérifier la compatibilité des URL mais ne fonctionnent que dans le navigateur :'],
      bullets: ['qaContrast : Activer la vérification du contraste 0/1 - nécessite une validation interactive.', 'qaBlur : simule le flou en pixels - pour les tests interactifs uniquement.', 'qaNoise : Simuler le niveau de bruit - pour les tests interactifs uniquement.', 'qaHeatmap : Afficher la carte thermique de lisibilité 0/1 - nécessite une interface utilisateur de superposition de canevas.'],
    },
    // Client-Only Parameters
    {
      heading: 'Paramètres client uniquement',
      paragraphs: ['La plupart des paramètres API sont entièrement pris en charge côté serveur. Les paramètres marqués [CLIENT-ONLY] sont analysés pour vérifier la compatibilité des URL mais nécessitent des fonctionnalités de navigateur :'],
      bullets: ['gigue : la gigue du module nécessite une régénération QR par image de manière aléatoire.', 'autoReduce : la réduction automatique de l\'intensité nécessite des tests d\'analyse itératifs.', 'qaContrast, qaBlur, qaNoise, qaHeatmap : la simulation QA nécessite une validation interactive du canevas.'],
    },
    // Additional Output Parameters
    {
      heading: 'Paramètres de sortie supplémentaires',
      paragraphs: ['Paramètres de sortie et d\'exportation étendus :'],
      bullets: ['fname : nom de fichier personnalisé pour les téléchargements (par défaut : anqr-qrcode).', 'inclQz : Inclut la zone silencieuse dans les dimensions de sortie 0/1 (par défaut : 1).', 'bgOver : remplacement de la couleur d\'arrière-plan hexadécimal sans # (remplace le paramètre bg).', 'fmtExtra : sortie au format supplémentaire - aucun, eps, animation_webp (par défaut : aucun). Remarque : eps est [PARTIEL].', 'svgPrec : précision de la forme SVG - pixel, précis (par défaut : pixel). [PARTIEL] Sortie SVG limitée côté serveur.', 'svgEmbed : incorporer la superposition raster dans SVG 0/1 (par défaut : 1). [PARTIEL] Sortie SVG limitée côté serveur.', 'modulePx : taille des pixels du module (par défaut : calculée automatiquement à partir de la taille).', 'border : modules de bordure supplémentaires au-delà de la zone calme (par défaut : 0).', 'crisp : Active le rendu d\'image net/pixélisé 0/1 (par défaut : 1).', 'snap : mode Pixel snap - sol, rond, plafond (par défaut : sol).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Paramètres de préservation des motifs',
      paragraphs: ['Contrôlez quels éléments structurels sont protégés contre la superposition :'],
      bullets: ['keepFinders : conserver les modèles de recherche 0/1 (par défaut : 1).', 'keepTiming : préserve les modèles de synchronisation 0/1 (par défaut : 0).', 'keepAlign : préserve les modèles d\'alignement 0/1 (par défaut : 0).', 'ProtectFmt : Protéger les modules d\'informations sur le format 0/1 (par défaut : 0).', 'ProtectVer : Protéger les modules d\'informations de version 0/1 (par défaut : 0).'],
    },
    {
      heading: 'Exemple d\'utilisation',
      paragraphs: ['Code QR de base :', 'https://anqr.link/api/qr?data=https://exemple.com', 'Code QR avec couleurs personnalisées:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1f40af&bg=ffff&style=rounded&radius=30', 'Code QR avec image superposée:', 'https://anqr.link/api/qr?data=https://exemple.com&ec=H&img=https://exemple.com/logo.png&mode=demitone&intensité=70', 'FPG animé :', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Voir les exemples QR', type: 'example' }],
    },
    {
      heading: 'Intégrer les codes QR',
      paragraphs: ['En mode professionnel, la fonction Share génère des URL et HTML intégrables. Voici comment l\'intégration fonctionne:'],
      bullets: ['Partager le lien : Crée une URL vers l\'application ANQR avec tous vos paramètres encodés comme paramètres d\'URL. Les destinataires peuvent consulter et modifier le code QR.', 'Image intégrée : Génère une balise <img> pointant vers l\'API du serveur. Le code QR est rendu côté serveur et a servi d\'image.', 'Embed Markdown : crée la syntaxe d\'image Markdown pour la documentation et les fichiers README.', 'URL directe de l\'API & #160;: URL de l\'API brute pour une utilisation dans des applications, des scripts ou d\'autres intégrations.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
    {
      heading: 'Exemple HTML',
      paragraphs: ['Pour intégrer un code QR dans votre site Web :', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />', 'Pour le calibrage réactif:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; hauteur: auto;" />', 'Le serveur cache les réponses avec de longs en-têtes de cache, de sorte que les requêtes répétées pour la même URL sont rapides.'],
    },
    {
      heading: 'Partager le format d\'URL',
      paragraphs: ['Lorsque vous cliquez sur Partager en mode professionnel, ANQR code vos paramètres actuels dans les paramètres URL. Le format est le suivant:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Ces paramètres reflètent les paramètres de l\'API, de sorte que vous pouvez convertir une URL de partage en une URL de l\'API en changeant le chemin de base de / à /api/qr et en adaptant les paramètres w/h au besoin.', 'Remarque : Les images de superposition téléchargées à partir de fichiers locaux ne peuvent pas être partagées via l\'URL - seules les superpositions basées sur l\'URL (paramètre img) fonctionnent dans les liens partagés et les appels API.'],
    },
    {
      heading: 'Limites de taux et utilisation',
      paragraphs: ['L\'API est libre d\'utiliser pour des volumes raisonnables. Pour une utilisation en grand volume ou des applications commerciales nécessitant une disponibilité garantie, veuillez nous contacter.', 'Les réponses API incluent des en-têtes de cache agressifs. Pour une meilleure performance, cachez les réponses à votre fin ou utilisez la même URL de façon constante pour des codes QR identiques.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Meilleures pratiques',
      paragraphs: ['Suivez ces lignes directrices pour des codes QR fiables :'],
      bullets: ['Testez toujours vos codes QR avec plusieurs applications scanner avant d\'imprimer.', 'Utilisez la correction d\'erreur H (High) lors de l\'ajout de superpositions.', 'Conservez au moins 4 modules de zone tranquille (margin).', 'Assurer un contraste élevé entre le premier plan et le second plan.', 'Pour l\'impression, utilisez au moins 300 DPI et testez à la taille réelle de l\'impression.', 'Activer Preserve Finder Patterns lors de l\'utilisation des superpositions.', 'Commencez par une intensité de recouvrement plus faible et augmentez progressivement.', 'Pour une utilisation à l\'extérieur, considérez les plus grandes tailles de module et la correction d\'erreur plus élevée.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Voir les exemples QR', type: 'example' },
      ],
    },
    {
      heading: 'Dépannage',
      paragraphs: ['Questions et solutions communes:'],
      bullets: ['QR ne scannera pas : Réduire l\'intensité de recouvrement, augmenter la correction des erreurs, vérifier le contraste.', 'Code trop grand: Réduire la longueur du contenu, utiliser un raccourcisseur d\'URL, version inférieure.', 'Sortie floue : Augmenter la taille du module, utiliser PNG au lieu des formats compressés.', 'Les couleurs sont fausses : Vérifiez le contraste de couleur, essayez le mode de superposition à échelle grise.', 'GIF n\'anime pas : Assurez-vous d\'utiliser la sortie au format GIF, vérifiez le nombre de cadres.', 'Superposition de l\'image sans chargement: Vérifiez les autorisations de CORS sur les images distantes.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Voir guides et exemples connexes', type: 'learn' }],
    },
    {
      heading: 'Raccourcis clavier',
      paragraphs: ['ANQR prend en charge les raccourcis clavier standard. Utilisez Ctrl/Cmd+S pour déclencher l\'exportation (lorsqu\'elle est centrée sur l\'aperçu).'],
    },
    {
      heading: 'Partage et intégration',
      paragraphs: ['En mode professionnel, cliquez sur le bouton Partager pour copier une URL avec vos paramètres actuels. Les destinataires peuvent ouvrir cette URL pour voir votre configuration exacte. Remarque : les images superposées des fichiers locaux ne peuvent pas être partagées via URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Essayez cette configuration directement dans le générateur ANQR.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Voir les exemples QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Voir les exemples QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
  ],
};

export default guide;
