import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Apprenez avec ANQR',
  description: 'Des guides pratiques et axés sur les entreprises pour transformer les codes QR en véritables atouts marketing – et pas seulement en carrés fonctionnels. Découvrez comment mettre à niveau les anciens codes de point de vente, créer une signalisation QR de paiement conforme, préparer des exportations prêtes à imprimer, utiliser des animations en toute sécurité sur des écrans numériques et partager des configurations verrouillées entre des équipes multilingues à l\'aide de liens ANQR (« ancre »).',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Voir des exemples de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Ouvrez le guide de l\'utilisateur complet', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Améliorer les campagnes QR existantes',
      paragraphs: ['La plupart des entreprises ont des codes QR dispersés dans leurs opérations : sur les menus, les comptoirs, les emballages et le matériel promotionnel. Beaucoup de ces codes ont été créés il y a des années avec des générateurs de base, ce qui donne lieu à des carrés génériques en noir et blanc qui n\'inspirent pas confiance et ne correspondent pas à l\'identité de votre marque. Ce guide complet vous guide à travers une approche systématique d\'audit, de mise à niveau et d\'optimisation de votre infrastructure QR existante sans perturber les parcours clients que vous avez déjà établis.', 'L\'avantage stratégique de faire évoluer plutôt que de remplacer vos QR codes réside dans la préservation de la continuité. Vos clients ont déjà appris à s\'attendre à certaines destinations lorsqu\'ils scannent vos codes. En conservant les URL codées identiques tout en améliorant considérablement la présentation visuelle, la fiabilité de l\'analyse et l\'alignement de la marque, vous créez une transition transparente qui renforce la confiance sans nécessiter de modifications de votre infrastructure numérique ou de votre suivi analytique.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Une comparaison côte à côte montrant un code QR générique estompé à côté d\'une version de marque moderne codant la même URL',
          caption: 'Avant et après : la même URL de destination transformée d\'un code générique daté en un actif de marque professionnelle',
        },
      ],
    },
    {
      heading: 'Pourquoi les anciens codes QR sont sous-performants',
      paragraphs: ['Les codes QR créés au cours de la phase d\'adoption précoce – en particulier en 2020-2021, lorsque les entreprises se sont précipitées pour mettre en œuvre des solutions sans contact – souffrent souvent de plusieurs problèmes critiques. De faibles paramètres de correction d\'erreur les rendent fragiles lorsqu\'ils sont imprimés sur des surfaces texturées ou visualisés sous un éclairage difficile. Des zones de silence insuffisantes entraînent des échecs de numérisation lorsque les codes sont placés à proximité d\'autres éléments visuels. Le style générique ne parvient pas à communiquer la légitimité de la marque, ce qui entraîne des hésitations et une réduction des taux d\'analyse.', 'Au-delà des limitations techniques, les codes existants représentent souvent des opportunités manquées en matière de branding. Chaque code QR est un point de contact avec votre client : un moment où il est activement engagé et prêt à agir. Un code de style professionnel qui correspond aux couleurs de votre marque, inclut des marges de sécurité appropriées et comporte des éléments de marque facultatifs transforme cet utilitaire en un atout marketing qui renforce votre identité à chaque interaction.'],
    },
    {
      heading: 'Réaliser un audit de code QR',
      paragraphs: ['Commencez votre projet de mise à niveau en créant un inventaire complet de chaque code QR actuellement déployé dans votre entreprise. Documentez l\'emplacement physique, la destination codée, l\'état actuel du support imprimé et l\'environnement de numérisation typique, y compris les conditions d\'éclairage et les angles de vision. Testez chaque code avec plusieurs appareils : les anciens smartphones et les appareils économiques révèlent souvent des problèmes de fiabilité que masquent les téléphones haut de gamme.', 'Portez une attention particulière aux codes situés dans les emplacements à enjeux élevés : points de paiement, zones d\'enregistrement et affichages promotionnels où un échec de numérisation a un impact direct sur les revenus ou l\'expérience client. Ceux-ci doivent être prioritaires pour une mise à niveau immédiate. Notez également les codes qui apparaissent dans le contenu photographique ou vidéo, car ceux-ci nécessiteront une coordination avec votre équipe marketing pour mettre à jour les éléments visuels.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Une interface de liste de contrôle affichant les catégories d\'audit QR : emplacement, état, fiabilité de l\'analyse et classement de priorité',
          caption: 'Modèle d\'audit QR systématique pour documenter et prioriser vos candidats à la mise à niveau',
        },
      ],
    },
    {
      heading: 'La stratégie de mise à niveau sécurisée',
      paragraphs: ['La règle cardinale des mises à niveau QR est la préservation de la destination. Extrayez l\'URL exacte de chaque code existant et encodez-la à l\'identique dans votre nouvelle version. Cela garantit que toutes les analyses existantes, la logique de redirection et les attentes des clients restent intactes. Si vous avez besoin de flexibilité de destination pour les mises à jour futures, c\'est le moment idéal pour introduire une URL courte de marque ou un service de redirection - mais implémentez-le en tant que projet distinct pour éviter des changements aggravés.', 'Pour la mise à niveau visuelle, appliquez les améliorations par couches : assurez-vous d\'abord de la fiabilité technique (correction d\'erreurs appropriée et zone de silence), puis ajoutez le style de la marque (couleurs, formes des modules) et enfin envisagez des améliorations facultatives (superpositions centrales, cadres). Chaque couche doit être validée par des tests avant de continuer. Le mode de sécurité de l\'ANQR permet de faire respecter ces priorités en avertissant lorsque les choix de style pourraient compromettre la numérisation.'],
    },
    {
      heading: 'Ajouter une identité de marque sans compromettre la fiabilité',
      paragraphs: ['Une stratégie de marque QR efficace équilibre l\'impact visuel et la fiabilité de la numérisation. Commencez par la couleur : remplacez le premier plan noir par défaut par la couleur principale de votre marque, garantissant ainsi un contraste suffisant avec votre arrière-plan. Pour la plupart des marques, les couleurs sombres sur fond clair fonctionnent mieux. Évitez les combinaisons à faible contraste, les dégradés qui réduisent la clarté des bords ou les couleurs qui semblent similaires dans des conditions d\'éclairage courantes.', 'La personnalisation de la forme des modules offre une autre opportunité de marque avec un impact minimal sur la fiabilité. Les modules arrondis créent une apparence plus douce et plus accessible tout en conservant une excellente capacité de numérisation. Les modules de style point fonctionnent bien pour les marques modernes et avant-gardistes. Les modules connectés conviennent aux identités industrielles ou d\'entreprise. Quel que soit le style que vous choisissez, maintenez la cohérence dans tous vos déploiements QR pour une reconnaissance instantanée de votre marque.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Un diagramme de roue chromatique montrant les combinaisons de couleurs QR optimales avec des indicateurs de rapport de contraste',
          caption: 'Guide de sélection des couleurs de la marque montrant des combinaisons à contraste élevé qui maintiennent la fiabilité de la numérisation',
        },
      ],
    },
    {
      heading: 'Protocole de test et de validation',
      paragraphs: ['Ne déployez jamais de codes QR mis à niveau sans des tests rigoureux. Imprimez une épreuve physique à la taille exacte et sur le même matériau que votre déploiement final. Testez à l\'emplacement réel où le code se trouvera, à différents moments de la journée pour tenir compte des variations d\'éclairage. Utilisez au moins trois appareils différents : un téléphone phare actuel, un appareil de milieu de gamme et un smartphone plus ancien ou économique.', 'Enregistrez les temps d\'analyse et les taux de réussite pour chaque test. Un code bien optimisé devrait être analysé en 1 à 2 secondes sur tout appareil raisonnablement moderne. Si vous constatez des retards ou des échecs constants, réduisez l\'intensité du style : supprimez ou réduisez les superpositions, augmentez la taille de la zone silencieuse ou passez à un niveau de correction d\'erreur plus élevé. La fiabilité prime toujours sur la sophistication visuelle.'],
    },
    {
      heading: 'Verrouillage de votre configuration pour des raisons de cohérence',
      paragraphs: ['Une fois que vous avez validé une configuration optimale, conservez-la à l\'aide des liens partageables d\'ANQR. Cela crée un enregistrement permanent de chaque paramètre utilisé pour générer votre code approuvé : couleurs, style de module, correction d\'erreur, dimensionnement et toute superposition. Partagez ce lien avec votre équipe de conception, vos fournisseurs d\'impression et toute personne susceptible d\'avoir besoin de reproduire le code à l\'avenir.', 'Ce verrouillage de configuration empêche la dégradation progressive qui affecte de nombreux déploiements QR. Sans cela, les membres du personnel recréent les codes à partir de captures d\'écran, les concepteurs reconstruisent les paramètres à partir de la mémoire et les imprimeurs effectuent des ajustements « utiles ». Chaque variation introduit des problèmes potentiels. Avec un lien de configuration verrouillé, chaque reproduction est identique à votre original testé et approuvé.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Un diagramme montrant la dérive de la configuration : des captures d\'écran menant à des recréations menant à des variantes, par rapport à un lien source unique de vérité',
          caption: 'Empêchez la dérive de configuration en établissant une source unique faisant autorité pour toutes les reproductions QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Voir des exemples de QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Codes QR pour les paiements de détail',
      paragraphs: ['Les codes QR de paiement fonctionnent dans l\'environnement le plus exigeant du commerce de détail : le moment de la transaction. Les clients sont prêts à payer, souvent avec une file d\'attente derrière eux, et chaque seconde de retard crée des frictions. Pourtant, ce moment de haute pression constitue également un terrain privilégié pour le renforcement de la marque. Ce guide explique comment créer des codes QR de paiement qui s\'analysent instantanément sur les applications bancaires tout en présentant une apparence de marque professionnelle qui renforce la confiance des clients.', 'Le principe fondamental des codes QR de paiement est la fiabilité plutôt que l\'esthétique. Un code magnifiquement conçu qui ne parvient pas à être analysé sur l\'application bancaire d\'un client vous coûtera bien plus cher en transactions abandonnées et en clients frustrés qu\'une conception conservatrice ne le pourrait jamais. Commencez par la conformité, ajoutez de la fiabilité, puis appliquez soigneusement la stratégie de marque uniquement là où elle ne compromet pas la fonction principale.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Un comptoir de vente au détail montrant un code QR de paiement scanné par un smartphone avec une application bancaire',
          caption: 'Les codes QR de paiement doivent fonctionner instantanément avec les applications bancaires et de portefeuille dans des conditions réelles.',
        },
      ],
    },
    {
      heading: 'Comprendre les normes QR de paiement',
      paragraphs: ['Les codes QR de paiement suivent généralement les normes régionales qui dictent le format de la charge utile. À Singapour, PayNow QR utilise un formatage spécifique. En Inde, les codes UPI suivent les normes de liens profonds BharatQR ou UPI. Les paiements SEPA européens utilisent les codes QR EPC. Chaque norme existe pour garantir que les applications bancaires peuvent reconnaître et traiter instantanément les informations de paiement. S\'écarter de ces normes - même légèrement - peut amener les applications de paiement à rejeter les codes que les scanners d\'appareil photo génériques lisent sans problème.', 'ANQR comprend des modèles pour les principales normes de paiement qui formatent automatiquement les informations de votre commerçant en charges utiles conformes. Utilisez toujours ces modèles plutôt que de créer manuellement des chaînes de paiement, car même des erreurs de formatage mineures peuvent entraîner des échecs de transaction. Si la norme de paiement de votre région n\'est pas disponible comme modèle, consultez la documentation technique de votre fournisseur de paiement pour connaître les exigences de formatage exactes.'],
    },
    {
      heading: 'Dimensionnement et placement des présentoirs de comptoir',
      paragraphs: ['Les codes QR de comptoir sont confrontés à des défis physiques uniques. Les clients scannent à bout de bras, souvent sous un angle, parfois à travers des pare-haleine ou des vitrines. L\'éclairage zénithal crée des points d\'éblouissement. Le code rivalise avec d\'autres contre-encombrements pour attirer l\'attention et des lignes de visibilité claires. Dimensionnez généreusement votre QR de paiement : un minimum de 4 à 5 cm est recommandé pour la plupart des applications de comptoir, en augmentant si le code se trouve derrière une vitre ou dans une zone faiblement éclairée.', 'La position compte autant que la taille. Placez le code là où les clients peuvent confortablement tenir leur téléphone sans bloquer la file d\'attente ni atteindre le téléphone de manière gênante. Inclinez l\'écran vers le client plutôt que de le poser à plat. Si possible, utilisez un laminage mat ou des matériaux d\'affichage non réfléchissants pour minimiser l\'éblouissement dû à l\'éclairage zénithal. Testez le placement final à différents moments de la journée pour détecter les problèmes d\'éclairage.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Un diagramme montrant les hauteurs et angles de placement QR optimaux pour différentes configurations de comptoir',
          caption: 'Guide de placement au comptoir : hauteurs, angles et distances optimaux pour une numérisation fiable des paiements',
        },
      ],
    },
    {
      heading: 'Image de marque conservatrice pour les codes de paiement',
      paragraphs: ['Les applications de paiement sont moins indulgentes que les scanners photo génériques. De nombreuses applications bancaires utilisent des algorithmes de lecture QR plus anciens et plus simples, optimisés pour la rapidité plutôt que pour la flexibilité. Cela signifie qu\'un style qui fonctionne parfaitement avec l\'appareil photo d\'un téléphone peut échouer avec des applications de paiement spécifiques. Gardez une image de marque conservatrice : utilisez la couleur de votre marque pour le premier plan si elle maintient un contraste fort, mais évitez les dégradés, les superpositions lourdes ou les éléments décoratifs qui pourraient interférer avec la reconnaissance.', 'Si vous souhaitez un logo central ou une superposition, gardez-le extrêmement petit (pas plus de 10 à 15 % de la zone QR) et testez-le de manière approfondie avec chaque application de paiement que vos clients pourraient utiliser. De nombreuses entreprises optent spécifiquement pour l\'absence de superposition sur les codes de paiement, réservant ce style au marketing des codes QR où les exigences de fiabilité sont moins strictes. Le rôle du code de paiement est de traiter les transactions et non d\'impressionner visuellement.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Une comparaison montrant les niveaux de marque acceptables et risqués pour les codes QR de paiement',
          caption: 'Spectre de marque Payment QR : du style conservateur sûr aux approches décoratives risquées',
        },
      ],
    },
    {
      heading: 'Considérations relatives aux matériaux et à l\'impression',
      paragraphs: ['Le matériel d\'affichage physique a un impact significatif sur la fiabilité de la numérisation. La stratification brillante reflète les lumières du plafonnier directement dans la caméra du client. Les matériaux texturés peuvent déformer les bords des modules. Une impression bon marché peut brouiller les détails les plus fins. Pour les codes QR de paiement, investissez dans la qualité : utilisez un laminage mat ou satiné, assurez une impression haute résolution et remplacez les écrans avant qu\'ils ne présentent des signes d\'usure. Un code de paiement rayé ou effacé vous coûte des transactions.', 'Tenez compte de la durabilité et de la remplaçabilité de l\'écran. Les présentoirs sont touchés, déplacés, éclaboussés et parfois renversés. Concevez votre système d\'affichage de manière à ce que l\'insert QR puisse être facilement remplacé sans remplacer l\'ensemble du support. Gardez à portée de main des impressions de rechange, générées à partir de votre lien de configuration verrouillé, afin que les codes usés puissent être échangés immédiatement.'],
    },
    {
      heading: 'Test avec de vraies applications de paiement',
      paragraphs: ['Les scanners d\'appareil photo génériques décoderont presque tous les codes QR raisonnablement formatés. Les applications de paiement sont plus exigeantes. Avant de déployer un code QR de paiement, testez-le avec chaque application de paiement que vos clients pourraient utiliser. Dans les environnements multi-paiements, cela peut impliquer de tester plusieurs applications bancaires, portefeuilles numériques et plateformes de paiement. Documentez les applications que vous avez testées et leurs versions : les applications de paiement sont fréquemment mises à jour et une mise à jour pourrait modifier le comportement d\'analyse.', 'Testez dans des conditions réalistes : l\'affichage réel, l\'éclairage réel, la distance de balayage réelle. Un code qui est scanné instantanément sur votre bureau peut avoir du mal à s\'afficher sur le comptoir à 17 heures lorsque le soleil de l\'après-midi crée des reflets. Testez avec le smartphone le plus ancien et le moins cher que vous puissiez trouver : s\'il fonctionne de manière fiable sur un appareil économique, il fonctionnera sur tout. Signalez tout temps d\'analyse supérieur à 2 secondes pour enquête et refonte potentielle.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Une liste de contrôle de test montrant diverses applications de paiement, types d\'appareils et conditions environnementales à vérifier',
          caption: 'Matrice complète de tests QR de paiement couvrant les applications, les appareils et les facteurs environnementaux',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Voir des exemples de QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Codes QR prêts à imprimer : SVG vs PNG',
      paragraphs: ['La différence entre un code QR qui est parfaitement scanné et un code qui échoue réside souvent dans la manière dont il a été exporté et géré dans le flux de travail d\'impression. Ce guide explique les distinctions essentielles entre les formats vectoriels (SVG) et raster (PNG), quand les utiliser et comment transmettre les illustrations QR aux concepteurs et aux imprimeurs de manière à préserver la fiabilité de la numérisation, des cartes de visite aux panneaux d\'affichage.', 'La production d\'impression introduit des variables qui n\'existent pas à l\'écran : la répartition de l\'encre, la texture du substrat, les processus de finition et l\'effet cumulatif de plusieurs conversions de fichiers. Un code QR qui semble parfait dans votre logiciel de conception peut sortir de l\'imprimante avec des bords adoucis, un contraste réduit ou des modules subtilement déformés. Comprendre la sélection du format et les meilleures pratiques de flux de travail évite ces échecs silencieux.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Une vue agrandie comparant les modules QR vectoriels avec des bords nets aux modules raster montrant des artefacts de pixels',
          caption: 'Vecteur ou raster à l\'échelle d\'impression : la différence de précision qui détermine la fiabilité de la numérisation',
        },
      ],
    },
    {
      heading: 'Pourquoi le vecteur (SVG) est préféré pour l\'impression',
      paragraphs: ['Les fichiers SVG décrivent les codes QR comme des formes mathématiques plutôt que comme des grilles de pixels. Cela signifie que le code peut être adapté à n\'importe quelle taille - d\'une étiquette de 1 cm à une bannière de 10 mètres - sans aucune perte de netteté des bords. Le RIP (Raster Image Processor) de l\'imprimante restitue les vecteurs à la résolution native du périphérique de sortie, garantissant que chaque bord de module est aussi net que le matériel le permet. Il n\'y a pas d\'interpolation, pas d\'artefacts d\'anticrénelage, pas de flou accumulé dû à plusieurs opérations de redimensionnement.', 'Au-delà de l\'évolutivité, les fichiers SVG sont plus robustes dans les flux de travail professionnels. Ils survivent aux allers-retours via les logiciels de conception sans dégradation. Leurs couleurs peuvent être corrigées sans rééchantillonnage. Ils s\'intègrent proprement dans les fichiers PDF pour une sortie prête à l\'impression. Pour toute application d\'impression où la qualité est importante, SVG doit être votre format d\'exportation par défaut.'],
    },
    {
      heading: 'Quand le PNG est acceptable',
      paragraphs: ['PNG devient nécessaire lorsque votre flux de travail ou votre plateforme de destination ne prend pas en charge les formats vectoriels. Certaines plates-formes Web, systèmes CMS de signalisation et flux de travail d\'impression existants nécessitent des images raster. Dans ces cas, PNG peut bien fonctionner - mais seulement si vous suivez des règles strictes : exporter à la taille et à la résolution physiques finales, ne jamais augmenter après l\'exportation et éviter toute compression ou conversion de format avec perte.', 'La règle essentielle pour PNG est de calculer les dimensions en pixels requises avant l\'exportation. Si votre QR s\'imprime à 5 cm et que votre imprimante fonctionne à 300 DPI, vous avez besoin d\'environ 590 pixels. Exportez à cette taille ou plus, puis réduisez si nécessaire – jamais au-dessus. Incluez ces informations dans votre nom de fichier ou vos métadonnées afin que les futurs utilisateurs n\'utilisent pas accidentellement une exportation spécifique à une taille.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Une interface de calculatrice montrant la relation entre la taille physique, le DPI et les dimensions de pixels requises',
          caption: 'Calculateur de résolution d\'impression : déterminer les dimensions minimales en pixels pour votre taille de sortie cible',
        },
      ],
    },
    {
      heading: 'Options d\'exportation ANQR expliquées',
      paragraphs: ['ANQR propose plusieurs modes d\'exportation SVG pour s\'adapter à différents flux de travail. Le mode True Vector produit une sortie pure basée sur un chemin, idéale pour les outils d\'impression et de conception professionnels. Lorsque vous avez ajouté des superpositions raster ou certains effets, ANQR peut les intégrer tout en conservant les modules vectoriels, ou vous pouvez exporter une version entièrement rastérisée à la résolution spécifiée. Comprendre ces options vous aide à choisir la bonne exportation pour chaque cas d\'utilisation.', 'Pour les exportations PNG, ANQR vous permet de spécifier les dimensions exactes et inclut des options pour les arrière-plans transparents. Le paramètre DPI vous aide à calculer les tailles appropriées pour l\'impression, mais n\'oubliez pas que le DPI est une métadonnée : ce qui compte pour l\'impression, c\'est d\'avoir suffisamment de pixels pour votre taille physique. En cas de doute, exportez plus que ce dont vous pensez avoir besoin ; la réduction préserve la qualité tandis que l\'augmentation la détruit.'],
    },
    {
      heading: 'Préparation des fichiers pour le transfert',
      paragraphs: ['Lorsque vous transmettez des illustrations QR aux concepteurs ou aux fournisseurs d\'impression, incluez des spécifications claires : la taille physique prévue, les exigences minimales en matière de zone silencieuse et toute considération relative à l\'espace colorimétrique. Pour les applications critiques, fournissez à la fois un maître SVG et une sauvegarde PNG haute résolution, clairement étiquetée avec leurs utilisations prévues. Incluez votre lien de configuration ANQR afin que le code puisse être régénéré si nécessaire.', 'Anticipez les erreurs courantes dans le processus de transfert. Indiquez explicitement que le QR ne doit pas être mis à l\'échelle, pivoté, incliné ou avoir des effets appliqués. Spécifiez que la zone de silence doit rester dégagée : aucune marque de coupe, aucune marque d\'enregistrement ou aucun élément de conception ne s\'immisce. Si le QR doit être placé sur un fond coloré ou photographique, fournissez une version avec une forme de support opaque pour garantir un contraste adéquat.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Un diagramme de package de fichiers montrant le maître SVG, la sauvegarde PNG, le document de spécifications et le lien de configuration',
          caption: 'Package de transfert QR professionnel : tout ce dont un concepteur ou un fournisseur d\'impression a besoin pour une reproduction précise',
        },
      ],
    },
    {
      heading: 'Vérification des épreuves d\'impression',
      paragraphs: ['N\'approuvez jamais un tirage sans numériser une épreuve physique. Demandez une épreuve imprimée sur le substrat réel avec la finition réelle qui sera utilisée en production. Numérisez l\'épreuve dans des conditions d\'éclairage similaires à celles où la pièce finale sera affichée. Testez avec plusieurs appareils, y compris des smartphones plus anciens qui peuvent avoir des difficultés avec une qualité marginale.', 'Si l\'épreuve est numérisée lentement ou de manière incohérente, enquêtez avant d\'approuver. Les problèmes courants incluent un contraste insuffisant sur les substrats colorés, des violations de zones silencieuses dues au rognage, des bords du module d\'adoucissement de la propagation de l\'encre ou un laminage créant des reflets. Chacun de ces problèmes peut être résolu avant de s\'engager dans un tirage complet - mais seulement si vous les détectez au stade de l\'épreuve.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Une liste de contrôle de révision des épreuves avec les résultats des tests d\'analyse, les mesures de contraste et les signatures d\'approbation',
          caption: 'Flux de travail de vérification des épreuves à l\'impression : tests systématiques avant de s\'engager sur des quantités de production',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Voir des exemples de QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Création de codes QR animés',
      paragraphs: ['Les codes QR animés combinent les fonctionnalités des codes QR standards avec des mouvements accrocheurs qui augmentent considérablement les taux d\'engagement. Dans l\'affichage numérique, les médias sociaux et les affichages interactifs, l\'animation transforme un utilitaire statique en un élément visuel convaincant qui attire le regard et invite à l\'interaction. Ce guide couvre les principes, les techniques et les contraintes pratiques de la création de codes QR animés qui se scannent de manière fiable tout en offrant un impact visuel.', 'Le défi fondamental des codes QR animés consiste à trouver un équilibre entre l\'intérêt visuel et la fiabilité de la numérisation. Chaque image doit pouvoir être numérisée individuellement : un scanner peut capturer le code à tout moment du cycle d\'animation. Cette contrainte façonne chaque décision de conception : quels éléments peuvent bouger, dans quelle mesure ils peuvent changer et ce qui doit rester stable tout au long de l\'animation.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Un affichage d\'affichage numérique montrant un code QR animé capturant l\'attention du spectateur dans un espace public',
          caption: 'Codes QR animés dans l\'affichage numérique : un mouvement qui attire l\'attention et encourage la numérisation',
        },
      ],
    },
    {
      heading: 'Comment l\'animation affecte la numérisation',
      paragraphs: ['Les scanners QR fonctionnent en capturant une seule image et en analysant le motif des modules clairs et sombres. Pour qu\'un code animé fonctionne, chaque image doit contenir le modèle QR complet et valide. Cela exclut les animations qui transforment la structure du code, dissolvent les modules ou modifient considérablement le motif de contraste. Les modules porteurs de données - le motif apparemment aléatoire au centre - doivent rester visuellement stables partout.', 'Les approches d\'animation sécurisées modifient les éléments qui ne contiennent pas de données : arrière-plans, couleurs, cadres décoratifs et éléments de superposition. Les composants structurels - les modèles de recherche (les grands carrés d\'angle), les modèles de synchronisation (les lignes alternées) et les modèles d\'alignement (les petits carrés dans les codes plus grands) - doivent conserver leurs positions et leurs proportions. Travailler dans le cadre de ces contraintes permet toujours de créer des animations étonnamment dynamiques et engageantes.'],
    },
    {
      heading: 'Techniques d\'animation qui fonctionnent',
      paragraphs: ['Le cycle de couleurs anime les couleurs de premier plan et d\'arrière-plan à travers une palette tout en conservant un contraste suffisant à chaque étape. Cela crée un effet dynamique et accrocheur avec un risque de numérisation minimal, à condition que le contraste ne descende jamais en dessous des niveaux lisibles. Les préréglages du cycle de couleur d\'ANQR sont conçus pour maintenir la numérisation tout au long du cycle.', 'Les superpositions animées placent des images en mouvement derrière un motif QR semi-transparent. Le code reste stable tandis que l\'arrière-plan s\'anime - peut-être une vidéo en boucle, des éléments de marque animés ou des graphiques animés abstraits. Cette technique nécessite une gestion minutieuse de l\'intensité pour éviter que l\'arrière-plan ne submerge le motif QR, mais elle donne les résultats les plus frappants visuellement.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Un diagramme montrant la structure en couches d\'un QR animé : couche de code stable sur couche d\'arrière-plan animée',
          caption: 'Principe de superposition d\'animation : le motif QR reste constant tandis que les éléments d\'arrière-plan s\'animent en dessous',
        },
      ],
    },
    {
      heading: 'Configuration des paramètres d\'animation',
      paragraphs: ['La fréquence d\'images affecte à la fois la fluidité visuelle et la taille du fichier. Pour la plupart des applications, 10 à 15 images par seconde offrent un mouvement fluide sans tailles de fichiers excessives. Des fréquences d\'images plus élevées offrent des rendements visuels décroissants tout en augmentant considérablement la taille des fichiers. Tenez compte de votre contexte de diffusion : une grande enseigne numérique peut gérer des fichiers plus volumineux qu\'un emplacement publicitaire mobile.', 'Le comportement de la boucle détermine le cycle de l\'animation. Les boucles harmonieuses créent un mouvement continu idéal pour la signalisation et les affichages ambiants. Les boucles de ping-pong (avant puis arrière) fonctionnent bien pour les animations simples. Pour des impulsions qui attirent l\'attention, envisagez des animations avec prises - des périodes d\'immobilité ponctuées de mouvements qui attirent le regard sans fatigue constante du mouvement.'],
    },
    {
      heading: 'Création de superpositions animées',
      paragraphs: ['Lorsque vous utilisez des images animées (GIF, WebP animés ou vidéo) comme superpositions, ANQR extrait les images et les compose avec votre code QR. Le paramètre d\'intensité de superposition contrôle la quantité d\'animation qui apparaît : les valeurs les plus faibles donnent la priorité à la numérisation tandis que les valeurs plus élevées favorisent l\'impact visuel. Testez l\'intensité que vous avez choisie sur plusieurs images pour garantir une numérisation cohérente.', 'La qualité du matériel source a un impact significatif sur les résultats. Utilisez des superpositions avec des sujets clairs et un bon contraste. Évitez les animations sources avec un clignotement rapide ou des changements de luminosité extrêmes qui pourraient créer des images occasionnelles à faible contraste. Prévisualisez le cycle d\'animation complet avant de l\'exporter pour détecter les images problématiques qui pourraient échouer à numériser.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Vue image par image d\'une superposition animée montrant les niveaux de contraste maintenus tout au long de la séquence.',
          caption: 'Analyse d\'image : vérifier la cohérence de la numérisation tout au long du cycle d\'animation',
        },
      ],
    },
    {
      heading: 'Considérations relatives à l\'exportation et à la livraison',
      paragraphs: ['GIF reste le format d\'animation le plus largement pris en charge, lu automatiquement dans la plupart des contextes sans nécessiter la prise en charge d\'un lecteur vidéo. Cependant, la palette de 256 couleurs de GIF limite la fidélité des couleurs. Pour les animations dont la couleur est critique, envisagez WebP animé lorsqu\'il est pris en charge, ou optez pour les formats vidéo pour une qualité optimale. L\'exportation GIF d\'ANQR inclut des options de tramage pour maximiser la qualité dans les limites de la palette.', 'La taille du fichier est importante pour la livraison. Les systèmes d\'affichage numérique, les clients de messagerie et les plateformes sociales imposent souvent des limites de taille. Si votre animation dépasse ces limites, réduisez le nombre d\'images, les dimensions ou la profondeur des couleurs. Parfois, diviser une animation complexe en une boucle plus courte donne de meilleurs résultats qu\'une compression agressive qui dégrade chaque image.'],
    },
    {
      heading: 'Test des codes QR animés',
      paragraphs: ['Le test des codes animés nécessite une analyse à plusieurs points du cycle d\'animation. Ne vous contentez pas de numériser une seule fois et de supposer le succès - numérisez à plusieurs reprises, à différents moments, pour vérifier que chaque image est lisible. Portez une attention particulière aux images aux cycles de couleurs extrêmes ou aux pics d\'intensité de superposition où le contraste peut être le plus faible.', 'Testez sur le matériel d\'affichage réel lorsque cela est possible. L\'étalonnage des couleurs du moniteur, l\'angle de vision et l\'éclairage ambiant affectent tous la façon dont l\'animation apparaît et est numérisée. Une animation lumineuse qui s\'analyse parfaitement sur votre moniteur peut s\'effacer sur un écran extérieur ou devenir illisible sous des angles de vision obliques.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Une matrice de test montrant les taux de réussite de l\'analyse sur différents cadres, appareils et conditions d\'affichage',
          caption: 'Protocole de test QR animé : vérification systématique sur tous les cadres, appareils et conditions de visualisation',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Voir des exemples de QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Meilleures pratiques en matière de sécurité et de conformité QR',
      paragraphs: ['Un code QR magnifiquement conçu qui ne parvient pas à être scanné est pire qu\'inutile : il frustre les clients, nuit à la perception de la marque et gaspille toutes les ressources investies dans sa création et sa distribution. Ce guide couvre les facteurs techniques et pratiques qui déterminent si un code QR sera lu de manière fiable et comment utiliser les fonctions de sécurité de l\'ANQR pour détecter les problèmes potentiels avant qu\'ils n\'atteignent la production.', 'La fiabilité du code QR n\'est pas binaire. Un code peut être parfaitement scanné sur les téléphones phares mais échouer sur les appareils économiques. Il peut fonctionner dans un éclairage idéal, mais avoir des difficultés dans les restaurants sombres ou en plein soleil. Comprendre les facteurs qui affectent la numérisation vous aide à faire des compromis éclairés entre le style visuel et la fiabilité réelle.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Un spectre de fiabilité montrant des codes QR allant de hautement numérisables à marginalement lisibles',
          caption: 'Le spectre de la numérisation : des codes pare-balles au style qui repousse les limites de la fiabilité',
        },
      ],
    },
    {
      heading: 'Comprendre les niveaux de correction d\'erreur',
      paragraphs: ['Les codes QR incluent une redondance intégrée qui permet de les lire même lorsqu\'ils sont partiellement endommagés ou masqués. Le niveau de correction d\'erreur - L (7 %), M (15 %), Q (25 %) ou H (30 %) - détermine la quantité de code qui peut manquer tout en continuant à décoder correctement. Une correction d\'erreur plus élevée crée des codes plus grands mais offre une marge de sécurité pour les superpositions, les imperfections d\'impression et les dommages environnementaux.', 'Pour les codes avec superpositions d\'images, le niveau de correction d\'erreur H est essentiel : la superposition masque physiquement une partie du code et vous avez besoin de cette redondance de 30 % pour maintenir la fiabilité. Pour des codes propres et sans style dans des environnements contrôlés, le niveau M suffit souvent. Le niveau L doit être réservé aux situations dans lesquelles la taille du code est extrêmement limitée et vous pouvez garantir des conditions impeccables.'],
    },
    {
      heading: 'La zone de silence critique',
      paragraphs: ['La zone silencieuse est la marge vierge entourant chaque code QR. Les scanners utilisent cette limite pour identifier où commence et se termine le code. La norme ISO spécifie une zone de silence minimale de quatre modules (quatre fois la largeur du plus petit carré du code). La violation de cet espace - avec des éléments de conception, des bords coupés ou du contenu adjacent - est l\'une des causes les plus courantes d\'échec d\'analyse.', 'L\'application de zones silencieuses par l\'ANQR permet de maintenir cet espacement critique, mais vous devez également vous assurer qu\'il est préservé dans vos conceptions finales. Lors de la remise des illustrations QR, spécifiez explicitement les exigences de la zone silencieuse. Lorsque vous placez des codes dans des mises en page, vérifiez qu\'aucun élément ne s\'immisce dans cet espace. Quelques millimètres d\'espace libre peuvent faire la différence entre une numérisation fiable et des clients frustrés.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Un diagramme montrant l\'espacement correct des zones silencieuses par rapport aux violations courantes qui provoquent des échecs d\'analyse',
          caption: 'Exigences en matière de zone silencieuse : la marge invisible qui détermine le succès de l\'analyse',
        },
      ],
    },
    {
      heading: 'Contraste et sécurité des couleurs',
      paragraphs: ['Les scanners QR détectent le motif des modules clairs et sombres. Tout style réduisant ce contraste (premiers plans clairs, arrière-plans sombres, effets de dégradé ou superpositions à faible opacité) rend le code plus difficile à lire. ANQR calcule les rapports de contraste et vous avertit lorsque vos choix de couleurs approchent des niveaux dangereux, mais l\'arbitre final est toujours des tests dans le monde réel.', 'La perception des couleurs varie selon les conditions d\'éclairage. Une combinaison de couleurs qui apparaît très contrastée sur votre moniteur peut devenir difficile à distinguer sous un éclairage incandescent chaud ou des tubes fluorescents froids. Si votre code doit être déployé dans des conditions d\'éclairage variables, testez sous plusieurs sources lumineuses et envisagez des rapports de contraste plus conservateurs comme marge de sécurité.'],
    },
    {
      heading: 'Taille du module et distance de visualisation',
      paragraphs: ['La taille physique des modules individuels détermine la distance maximale à partir de laquelle un code peut être scanné. Des modules plus petits signifient des codes plus petits mais nécessitent des distances de numérisation plus proches. La règle générale est que chaque module doit mesurer au moins 0,5 mm à la distance de balayage prévue, en augmentant proportionnellement pour les distances plus grandes. Un code sur un panneau d\'affichage nécessite des modules beaucoup plus volumineux qu\'un code sur une carte de visite.', 'Lors du calcul de la taille du module, considérez le pire des cas : le client possédant un téléphone plus ancien, dans un éclairage imparfait, scannant à la distance maximale probable. Concevez pour cet utilisateur, et tous les autres bénéficieront d\'une expérience encore meilleure. Les recommandations de taille de l\'ANQR prennent en compte ces variables du monde réel pour suggérer des dimensions appropriées à votre utilisation prévue.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Un tableau indiquant la taille du module, les dimensions d\'impression et la distance de numérisation effective maximale',
          caption: 'Guide de distance de numérisation : adapter la taille du module à vos exigences de déploiement',
        },
      ],
    },
    {
      heading: 'Utilisation du mode de sécurité ANQR',
      paragraphs: ['Le mode de sécurité de l\'ANQR fournit des informations en temps réel sur la fiabilité de l\'analyse. Il surveille les taux de contraste, la conformité des zones silencieuses, l\'intensité de la superposition et d\'autres facteurs affectant la capacité de numérisation. Lorsqu\'un paramètre approche des niveaux de risque, vous verrez des avertissements avec des conseils spécifiques sur la façon d\'améliorer la fiabilité. Pour les déploiements professionnels où les pannes sont coûteuses, maintenez le mode sécurité actif tout au long du processus de conception.', 'Le mode de sécurité comprend également une fonction de vérification d\'analyse qui tente de décoder votre code généré et signale le succès ou l\'échec. Bien que cette vérification dans l\'application ne puisse pas reproduire toutes les conditions réelles, elle détecte de nombreux problèmes courants avant que vous n\'investissiez dans l\'impression ou la distribution. Considérez une vérification réussie comme une barre minimale et non comme une garantie : les tests en conditions réelles restent essentiels.'],
    },
    {
      heading: 'Protocoles de test du monde réel',
      paragraphs: ['Aucune vérification logicielle ne remplace les tests physiques. Imprimez votre code à la taille prévue sur du matériel représentatif. Testez-le dans l\'environnement de déploiement réel avec des conditions d\'éclairage qui correspondent à une utilisation réelle. Numérisez avec plusieurs appareils : pas seulement votre téléphone phare, mais également les appareils Android économiques, les anciens iPhones et tout appareil spécifique que votre public utilise couramment.', 'Documentez systématiquement vos tests. Enregistrez quels appareils ont été testés, dans quelles conditions et avec quels résultats. Si vous déployez des codes à grande échelle, établissez des critères d\'acceptation : peut-être un taux de réussite de 95 % sur l\'ensemble de votre pool de tests d\'appareils, ou des analyses réussies dans les 2 secondes sur tous les appareils testés. Ces normes aident à prendre des décisions objectives plutôt que d\'espérer le meilleur.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Une liste de contrôle de test complète couvrant les appareils, les conditions et les critères d\'acceptation',
          caption: 'Protocole de test de déploiement QR : vérification systématique avant engagement en production',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Voir des exemples de QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Voir des exemples de QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Ouvrez le guide de l\'utilisateur complet', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Ouvrir la galerie', type: 'gallery' },
  ],
};
