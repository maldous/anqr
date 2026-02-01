import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Apprendre avec ANQR',
  description: 'Guides pratiques et pratiques pour transformer les codes QR en actifs marketing réels - pas seulement des carrés fonctionnels. Découvrez comment mettre à jour les anciens codes de points de vente, créer une signalisation QR de paiement conforme, préparer des exportations prêtes à imprimer, utiliser l\'animation en toute sécurité sur les écrans numériques et partager des configurations verrouillées entre les équipes multilingues en utilisant des liens ANQR (« ancre »).',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Voir les exemples QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Ouvrir le guide complet de l\'utilisateur', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Amélioration des campagnes existantes en matière de QR',
      paragraphs: ['La plupart des entreprises ont des codes QR dispersés dans leurs activités - sur les menus, les comptoirs, les emballages et le matériel promotionnel. Beaucoup de ces codes ont été créés il y a des années avec des générateurs de base, ce qui a donné lieu à des carrés génériques en noir et blanc qui n\'inspirent pas confiance ou correspondent à votre identité de marque. Ce guide complet vous accompagne dans une approche systématique de l\'audit, de la mise à niveau et de l\'optimisation de votre infrastructure QR existante sans perturber les parcours clients que vous avez déjà établis.', 'L\'avantage stratégique d\'améliorer vos codes QR plutôt que de les remplacer est de préserver la continuité. Vos clients ont déjà appris à s\'attendre à certaines destinations lorsqu\'ils scannent vos codes. En gardant les URLs encodées identiques tout en améliorant considérablement la présentation visuelle, la fiabilité de l\'analyse et l\'alignement de la marque, vous créez une transition transparente qui améliore la confiance sans nécessiter de modifications à votre infrastructure numérique ou de suivi analytique.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Une comparaison côte à côte montrant un code QR générique effacé à côté d\'une version de marque moderne encodant la même URL',
          caption: 'Avant et après: La même URL de destination est passée d\'un code générique daté à un actif de marque professionnelle',
        },
      ],
    },
    {
      heading: 'Pourquoi les codes QR existants sont-ils sous-performants',
      paragraphs: ['Les codes QR créés au cours de la phase d\'adoption précoce - particulièrement en 2020-2021 lorsque les entreprises se précipitent pour mettre en œuvre des solutions sans contact - souffrent souvent de plusieurs problèmes critiques. Les réglages de correction à faible erreur les rendent fragiles lorsqu\'ils sont imprimés sur des surfaces texturées ou vus sous un éclairage difficile. Des zones silencieuses insuffisantes causent des défaillances de numérisation lorsque les codes sont placés près d\'autres éléments visuels. Le style générique ne communique pas la légitimité de la marque, ce qui entraîne des hésitations et réduit les taux de numérisation.', 'Au-delà des limitations techniques, les codes existants représentent souvent des occasions manquées de marque. Chaque QR code est un point de contact avec votre client - un moment où ils sont activement engagés et prêts à agir. Un code de style professionnel qui correspond aux couleurs de votre marque, comprend des marges de sécurité appropriées, et dispose d\'éléments optionnels de marque transforme cet utilitaire en un atout marketing qui renforce votre identité à chaque interaction.'],
    },
    {
      heading: 'Vérification du code QR',
      paragraphs: ['Commencez votre projet de mise à niveau en créant un inventaire complet de chaque code QR actuellement déployé dans votre entreprise. Documenter l\'emplacement physique, la destination codée, l\'état actuel du matériel imprimé et l\'environnement de balayage typique, y compris les conditions d\'éclairage et les angles de vision. Testez chaque code avec plusieurs appareils - les anciens smartphones et les appareils de budget révèlent souvent des problèmes de fiabilité que les téléphones haut de gamme masquent.', 'Portez une attention particulière aux codes dans les endroits les plus fréquentés : points de paiement, zones d\'enregistrement et affichages promotionnels où l\'échec de l\'analyse a une incidence directe sur les revenus ou l\'expérience client. Ceux-ci devraient être prioritaires pour une mise à niveau immédiate. Notez également les codes qui apparaissent dans la photographie ou le contenu vidéo, car ceux-ci nécessiteront une coordination avec votre équipe de marketing pour mettre à jour les actifs visuels.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Une interface de vérification indiquant les catégories de vérification des QR : emplacement, état, fiabilité de l\'analyse et cote de priorité',
          caption: 'Modèle de vérification systématique des QR pour documenter et hiérarchiser vos candidats à la mise à niveau',
        },
      ],
    },
    {
      heading: 'Stratégie de modernisation sécuritaire',
      paragraphs: ['La règle cardinale des mises à niveau QR est la préservation de la destination. Extraire l\'URL exacte de chaque code existant et l\'encoder de façon identique dans votre nouvelle version. Cela garantit que toutes les analyses existantes, la logique de redirection et les attentes des clients restent intactes. Si vous avez besoin de flexibilité de destination pour les futures mises à jour, c\'est le moment idéal pour introduire une URL courte ou un service de redirection de marque - mais implémenter ceci comme un projet séparé pour éviter les changements composés.', 'Pour la mise à niveau visuelle, appliquer des améliorations dans les couches: d\'abord assurer la fiabilité technique (corrigation d\'erreur appropriée et zone tranquille), puis ajouter le style de marque (couleurs, formes de module), et enfin envisager des améliorations optionnelles (overlays centraux, cadres). Chaque couche doit être validée au moyen d\'essais avant de procéder. Le mode de sécurité d\'ANQR aide à faire respecter ces priorités en avertissant lorsque les choix de style peuvent compromettre la scannabilité.'],
    },
    {
      heading: 'Ajouter une identité de marque sans compromettre la fiabilité',
      paragraphs: ['Une marque QR efficace équilibre l\'impact visuel avec la fiabilité de l\'analyse. Commencez par la couleur : remplacez le premier plan noir par votre couleur de marque principale, en assurant un contraste suffisant avec votre arrière-plan. Pour la plupart des marques, les couleurs foncées sur fond clair fonctionnent mieux. Évitez les combinaisons à faible contraste, les gradients qui réduisent la clarté des bords ou les couleurs qui semblent semblables dans des conditions d\'éclairage communes.', 'La personnalisation de la forme du module offre une autre possibilité de marque avec un impact de fiabilité minimal. Les modules arrondis créent une apparence plus douce et plus accessible tout en maintenant une excellente scannabilité. Les modules de style point fonctionnent bien pour les marques modernes et avancées. Les modules connectés correspondent à des identités industrielles ou corporatives. Quel que soit le style que vous choisissez, maintenez la cohérence de tous vos déploiements QR pour une reconnaissance instantanée de la marque.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Diagramme de roue couleur montrant des combinaisons de couleurs QR optimales avec des indicateurs de rapport de contraste',
          caption: 'Guide de sélection des couleurs de marque montrant des combinaisons très contrastantes qui maintiennent la fiabilité de l\'analyse',
        },
      ],
    },
    {
      heading: 'Protocole d\'essai et de validation',
      paragraphs: ['Ne jamais déployer de codes QR améliorés sans essais rigoureux. Imprimez une preuve physique à la taille exacte et sur le même matériau que votre déploiement final. Tester à l\'endroit où le code vivra, à différents moments de la journée pour tenir compte des variations d\'éclairage. Utilisez au moins trois appareils différents : un téléphone phare actuel, un appareil de moyenne portée et un smartphone plus ancien ou plus économique.', 'Enregistrer les temps de balayage et les taux de succès pour chaque test. Un code bien optimisé devrait scanner en 1 à 2 secondes sur tout appareil raisonnablement moderne. Si vous observez des retards ou des échecs constants, réduisez l\'intensité de style - supprimez ou réduisez les recouvrements, augmentez la taille de la zone tranquille ou passez à un niveau de correction d\'erreur plus élevé. La fiabilité a toujours priorité sur la sophistication visuelle.'],
    },
    {
      heading: 'Verrouillage de votre configuration pour cohérence',
      paragraphs: ['Une fois que vous avez validé une configuration optimale, conservez-la en utilisant les liens partageables d\'ANQR. Cela crée un enregistrement permanent de chaque paramètre utilisé pour générer votre code approuvé - couleurs, style de module, correction d\'erreur, dimensionnement, et tout recouvrement. Partagez ce lien avec votre équipe de conception, les fournisseurs d\'impression et tous ceux qui pourraient avoir besoin de reproduire le code à l\'avenir.', 'Ce verrou de configuration empêche la dégradation progressive qui affecte de nombreux déploiements QR. Sans cela, les membres du personnel recréent des codes à partir de captures d\'écran, les concepteurs reconstruisent les paramètres à partir de la mémoire et les fournisseurs d\'impression font des ajustements « utiles ». Chaque variation introduit des problèmes potentiels. Avec un lien de configuration verrouillé, chaque reproduction est identique à votre original testé et approuvé.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Diagramme montrant la dérive de configuration : captures d\'écran menant à des loisirs conduisant à des variantes, versus un lien source de vérité unique',
          caption: 'Empêcher la dérive de configuration en établissant une source unique faisant autorité pour toutes les reproductions QR',
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
          label: 'Voir les exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Codes QR pour les paiements de détail',
      paragraphs: ['Les codes QR de paiement opèrent dans l\'environnement le plus exigeant du commerce de détail : le moment de la transaction. Les clients sont prêts à payer, souvent avec une file d\'attente se formant derrière eux, et chaque seconde de retard crée des frictions. Pourtant, ce moment de haute pression est également l\'immobilier de premier plan pour le renforcement de la marque. Ce guide explique comment créer des codes QR de paiement qui scannent instantanément sur les applications bancaires tout en présentant une apparence professionnelle de marque qui renforce la confiance des clients.', 'Le principe fondamental pour les codes QR de paiement est la fiabilité par rapport à l\'esthétique. Un code magnifiquement conçu qui ne permet pas de scanner sur l\'application bancaire d\'un client vous coûtera beaucoup plus dans les transactions abandonnées et les clients frustrés qu\'un design conservateur jamais pu. Commencez par la conformité, ajoutez la fiabilité, puis couchez soigneusement la marque seulement là où elle ne compromet pas la fonction principale.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Un comptoir de détail montrant un paiement QR code en cours de numérisation par un smartphone avec une application bancaire',
          caption: 'Paiement Les codes QR doivent fonctionner instantanément avec les applications bancaires et de portefeuille dans des conditions de compteur réel',
        },
      ],
    },
    {
      heading: 'Comprendre les normes de paiement QR',
      paragraphs: ['Les codes QR de paiement respectent généralement les normes régionales qui dictent le format de la charge utile. À Singapour, PayNow QR utilise un formatage spécifique. En Inde, les codes UPI suivent les normes BharatQR ou UPI. Les paiements SEPA européens utilisent les codes QR de la CBE. Chaque norme existe pour garantir que les applications bancaires peuvent reconnaître et traiter instantanément les informations de paiement. En s\'écartant de ces normes - même légèrement -, les applications de paiement peuvent rejeter les codes que les scanners de caméra génériques lisent sans problème.', 'ANQR comprend des modèles pour les principales normes de paiement qui formatent automatiquement vos détails marchands en charges utiles conformes. Utilisez toujours ces modèles plutôt que de construire manuellement des chaînes de paiement, car même des erreurs de formatage mineures peuvent causer des défaillances de transaction. Si la norme de paiement de votre région n\'est pas disponible en tant que modèle, consultez la documentation technique de votre fournisseur de paiement pour connaître les exigences précises de formatage.'],
    },
    {
      heading: 'Taille et positionnement pour les écrans de comptoir',
      paragraphs: ['Les codes QR de comptoir sont confrontés à des défis physiques uniques. Les clients scannent à longueur de bras, souvent à angle, parfois à travers des éternues ou des cas d\'affichage. L\'éclairage aérien crée des taches d\'éblouissement. Le code est en concurrence avec d\'autres contre-encombrements pour l\'attention et les lignes de visibilité claires. Tailler votre paiement QR généreusement - un minimum de 4-5cm est recommandé pour la plupart des applications de comptoir, à l\'échelle si le code se trouve derrière le verre ou dans une zone faiblement éclairée.', 'La position compte autant que la taille. Placez le code où les clients peuvent facilement tenir leur téléphone sans bloquer la file d\'attente ou atteindre maladroitement. Angle l\'affichage vers le client plutôt que de le poser à plat. Dans la mesure du possible, utiliser des matériaux de laminage mat ou d\'affichage non réfléchissants pour minimiser les éblouissements provenant de l\'éclairage aérien. Testez le placement final à différents moments de la journée pour attraper les problèmes d\'éclairage.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Diagramme montrant des hauteurs et des angles de positionnement QR optimaux pour différentes configurations de compteurs',
          caption: 'Guide de placement du comptoir : hauteurs, angles et distances optimaux pour un balayage de paiement fiable',
        },
      ],
    },
    {
      heading: 'Marque conservatrice pour les codes de paiement',
      paragraphs: ['Les applications de paiement sont moins indulgentes que les scanners génériques. De nombreuses applications bancaires utilisent des algorithmes de lecture QR plus anciens et plus simples optimisés pour la vitesse plutôt que la flexibilité. Cela signifie un style qui fonctionne parfaitement avec une caméra téléphonique peut échouer avec des applications de paiement spécifiques. Gardez votre marque prudente : utilisez la couleur de votre marque pour le premier plan si elle maintient un fort contraste, mais évitez les gradients, les superpositions lourdes ou les éléments décoratifs qui pourraient nuire à la reconnaissance.', 'Si vous voulez un logo central ou une superposition, gardez-le extrêmement petit - pas plus de 10-15% de la zone QR - et testez abondamment avec chaque application de paiement que vos clients pourraient utiliser. De nombreuses entreprises optent pour l\'absence de chevauchement sur les codes de paiement en particulier, en réservant ce style pour la commercialisation des codes QR où les exigences de fiabilité sont moins strictes. Le travail du code de paiement est de traiter les transactions, pas d\'impressionner visuellement.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Une comparaison montrant des niveaux de marque acceptables ou risqués pour le paiement des codes QR',
          caption: 'Paiement spectre de marque QR: du style prudent sûr aux approches décoratives risquées',
        },
      ],
    },
    {
      heading: 'Matériel et impression',
      paragraphs: ['Le matériel d\'affichage physique a un impact significatif sur la fiabilité de l\'analyse. La lamination brillante reflète les lumières aériennes directement dans la caméra du client. Les matériaux texturés peuvent déformer les bords du module. L\'impression bon marché peut brouiller les détails fins. Pour le paiement des codes QR, investissez dans la qualité : utilisez la lamination mate ou satinée, assurez l\'impression haute résolution et remplacez les écrans avant qu\'ils ne s\'usent. Un code de paiement rayé ou effacé vous coûte des transactions.', 'Considérez la durabilité et la remplaçabilité de l\'écran. Les écrans de comptoir sont touchés, déplacés, éclaboussés et parfois renversés. Concevoir votre système d\'affichage pour que l\'insert QR puisse être facilement remplacé sans remplacer l\'ensemble du support. Gardez les empreintes de rechange prêtes, générées à partir de votre lien de configuration verrouillé, de sorte que les codes usés peuvent être échangés immédiatement.'],
    },
    {
      heading: 'Tests avec paiement réel Applications',
      paragraphs: ['Les scanners de caméra génériques décoderont presque n\'importe quel code QR raisonnablement formaté. Les applications de paiement sont plus faciles. Avant de déployer tout paiement QR code, testez-le avec chaque application de paiement que vos clients pourraient utiliser. Dans les environnements multi-paiements, cela peut signifier tester avec plusieurs applications bancaires, portefeuilles numériques et plateformes de paiement. Documenter les applications que vous avez testées et leurs versions - les applications de paiement mettent à jour fréquemment, et une mise à jour pourrait changer le comportement de numérisation.', 'Essai dans des conditions réalistes : affichage réel, éclairage réel, distance de balayage réelle. Un code qui scanne instantanément sur votre bureau pourrait lutter sur le comptoir à 17h lorsque le soleil de l\'après-midi crée l\'éblouissement. Testez avec le smartphone le plus ancien et le moins cher que vous pouvez trouver - s\'il fonctionne de manière fiable sur un appareil budgétaire, il fonctionnera sur tout. Marquez tout temps d\'analyse sur 2 secondes pour l\'enquête et la refonte potentielle.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Une liste de vérification montrant diverses applications de paiement, types d\'appareils et conditions environnementales pour vérifier',
          caption: 'Paiement global matrice d\'essais QR couvrant les applications, les appareils et les facteurs environnementaux',
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
          label: 'Voir les exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Codes QR prêts à imprimer : SVG vs PNG',
      paragraphs: ['La différence entre un code QR qui scanne parfaitement et un qui échoue revient souvent à la façon dont il a été exporté et traité dans le flux de travail d\'impression. Ce guide explique les distinctions critiques entre les formats vectoriel (SVG) et raster (PNG), quand utiliser chacun, et comment distribuer les oeuvres d\'art QR aux concepteurs et aux vendeurs d\'impression de manière à préserver la fiabilité de l\'analyse, des cartes d\'affaires aux panneaux d\'affichage.', 'La production d\'impression introduit des variables qui n\'existent pas à l\'écran : propagation de l\'encre, texture du substrat, processus de finition et effet cumulatif de plusieurs conversions de fichiers. Un code QR qui semble parfait dans votre logiciel de conception peut émerger de l\'imprimante avec des bords adoucis, un contraste réduit ou des modules subtilement déformés. La compréhension de la sélection des formats et des meilleures pratiques de travail empêche ces échecs silencieux.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Une vue agrandie comparant les modules vecteurs QR avec des bords croustillants versus des modules raster montrant des artefacts de pixel',
          caption: 'Vecteur vs raster à l\'échelle d\'impression : la différence de précision qui détermine la fiabilité de l\'analyse',
        },
      ],
    },
    {
      heading: 'Pourquoi Vector (SVG) est préféré pour l\'impression',
      paragraphs: ['Les fichiers SVG décrivent les codes QR comme des formes mathématiques plutôt que des grilles de pixels. Cela signifie que le code peut être gradué à n\'importe quelle taille - d\'une étiquette de 1 cm à une bannière de 10 mètres - sans perte de netteté des bords. Le RIP (Raster Image Processor) de l\'imprimante rend les vecteurs à la résolution native du périphérique de sortie, garantissant que chaque bord du module est aussi net que le matériel le permet. Il n\'y a pas d\'interpolation, pas d\'artefacts anti-aliasants, pas de flou accumulé par de multiples opérations de redimensionnement.', 'Au-delà de l\'évolutivité, les fichiers SVG sont plus robustes dans les workflows professionnels. Ils survivent aux allers-retours grâce à un logiciel de conception sans dégradation. Elles peuvent être corrigées de la couleur sans rééchantillonnage. Ils s\'intègrent proprement dans des fichiers PDF pour la sortie prête à la presse. Pour toute application d\'impression où la qualité est importante, SVG doit être votre format d\'exportation par défaut.'],
    },
    {
      heading: 'Lorsque PNG est acceptable',
      paragraphs: ['PNG devient nécessaire lorsque votre workflow ou votre plateforme de destination ne supporte pas les formats vectoriels. Certaines plateformes Web, les systèmes de signalisation CMS et les flux d\'impression hérités nécessitent des images raster. Dans ces cas, PNG peut bien fonctionner - mais seulement si vous suivez des règles strictes: exporter à la taille physique finale et la résolution, jamais augmenter l\'échelle après l\'exportation, et éviter toute compression perdue ou conversion de format.', 'La règle critique pour PNG est de calculer les dimensions de pixel requises avant d\'exporter. Si votre QR est imprimé à 5 cm et que votre imprimante fonctionne à 300 DPI, vous avez besoin d\'environ 590 pixels. Exporter à cette taille ou plus, puis réduire au besoin - jamais. Inclure ces informations dans votre nom de fichier ou métadonnées afin que les futurs utilisateurs n\'abusent pas accidentellement d\'une exportation spécifique à la taille.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Une interface calculatrice montrant la relation entre la taille physique, le DPI et les dimensions requises des pixels',
          caption: 'Calculateur de résolution d\'impression: détermination des dimensions minimales de pixel pour votre taille de sortie cible',
        },
      ],
    },
    {
      heading: 'Options d\'exportation d\'ANQR expliquées',
      paragraphs: ['ANQR offre plusieurs modes d\'exportation SVG pour s\'adapter à différents flux de travail. True Vector mode produit pure sortie basée sur le chemin idéal pour l\'impression et les outils de conception professionnelle. Lorsque vous avez ajouté des superpositions raster ou certains effets, ANQR peut les intégrer tout en maintenant des modules vectoriels, ou vous pouvez exporter une version entièrement rastérisée à votre résolution spécifiée. Comprendre ces options vous aide à choisir la bonne exportation pour chaque cas d\'utilisation.', 'Pour les exportations de PNG, ANQR vous permet de spécifier des dimensions exactes et inclut des options pour des fonds transparents. Le paramètre DPI vous aide à calculer les tailles appropriées pour l\'impression, mais rappelez-vous que DPI est des métadonnées - ce qui compte pour l\'impression est d\'avoir suffisamment de pixels pour votre taille physique. En cas de doute, l\'exportation plus grande que vous pensez que vous avez besoin ; la réduction de l\'échelle préserve la qualité tout en augmentant l\'échelle détruit.'],
    },
    {
      heading: 'Préparation des fichiers pour le retrait',
      paragraphs: ['Lors de la transmission d\'œuvres d\'art QR à des concepteurs ou à des vendeurs d\'impression, inclure des spécifications claires : la taille physique prévue, les exigences minimales de zone tranquille et toute considération d\'espace de couleur. Pour les applications critiques, fournir à la fois un maître SVG et une sauvegarde PNG haute résolution, clairement étiqueté avec leurs utilisations prévues. Inclure votre lien de configuration ANQR afin que le code puisse être régénéré si nécessaire.', 'Anticiper les erreurs courantes dans le processus de remise. Préciser explicitement que le QR ne doit pas être étalonné, pivoté, biaisé ou avoir des effets appliqués. Précisez que la zone tranquille doit rester claire - aucune marque de culture, marque d\'enregistrement ou élément de conception n\'entre en ligne de compte. Si le QR est placé sur un fond coloré ou photographique, fournir une version avec une forme de support opaque pour assurer un contraste adéquat.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Un diagramme de paquet de fichiers montrant SVG master, la sauvegarde PNG, le document de spécifications et le lien de configuration',
          caption: 'Paquet professionnel QR handoff : tout ce dont un concepteur ou un fournisseur d\'impression a besoin pour une reproduction précise',
        },
      ],
    },
    {
      heading: 'Vérification des épreuves d\'impression',
      paragraphs: ['N\'approuvez jamais un tirage sans scanner une preuve physique. Demander une preuve imprimée sur le substrat réel avec la finition réelle qui sera utilisée dans la production. Scanner la preuve dans des conditions d\'éclairage semblables à celles où la pièce finale sera affichée. Tester avec plusieurs appareils, y compris les smartphones plus anciens qui pourraient avoir des problèmes avec la qualité marginale.', 'Si la preuve scanne lentement ou de façon incohérente, enquêter avant d\'approuver. Les problèmes courants comprennent un contraste insuffisant sur les substrats colorés, des violations de zone tranquille de parage, des bords de module adoucissants de l\'encre ou des éblouissements de lamination. N\'importe lequel d\'entre eux peut être adressé avant de s\'engager à un tirage complet - mais seulement si vous les attraper à l\'étape de la preuve.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Liste de contrôle de l\'examen des preuves avec résultats d\'analyse, mesures de contraste et signatures d\'approbation',
          caption: 'Déroulement de la vérification des épreuves d\'impression : essais systématiques avant de s\'engager sur les quantités de production',
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
          label: 'Voir les exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Création de codes QR animés',
      paragraphs: ['Les codes QR animés combinent la fonctionnalité des codes QR standard avec un mouvement captivant qui augmente considérablement les taux d\'engagement. Dans la signalisation numérique, les médias sociaux et les affichages interactifs, l\'animation transforme une utilité statique en un élément visuel convaincant qui attire l\'attention et invite à l\'interaction. Ce guide couvre les principes, les techniques et les contraintes pratiques de la création de codes QR animés qui scannent de façon fiable tout en produisant un impact visuel.', 'Le défi fondamental des codes QR animés est d\'équilibrer l\'intérêt visuel et la fiabilité de l\'analyse. Chaque cadre doit être scannable individuellement - un scanner peut capturer le code à n\'importe quel moment du cycle d\'animation. Cette contrainte façonne chaque décision de conception : quels éléments peuvent bouger, combien ils peuvent changer et ce qui doit rester stable tout au long de l\'animation.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Un affichage numérique montrant un code QR animé captant l\'attention du spectateur dans un espace public',
          caption: 'Codes QR animés dans l\'affichage numérique: mouvement qui attire l\'attention et encourage la numérisation',
        },
      ],
    },
    {
      heading: 'Comment l\'animation affecte la numérisation',
      paragraphs: ['Les scanners QR fonctionnent en capturant un seul cadre et en analysant le modèle des modules lumineux et sombres. Pour qu\'un code animé fonctionne, chaque cadre doit contenir le modèle QR complet et valide. Cela exclut les animations qui transforment la structure du code, dissolvent les modules ou modifient significativement le motif de contraste. Les modules porteurs de données - le profil apparemment aléatoire dans le centre - doivent rester visuellement stables.', 'Des approches d\'animation sûres modifient des éléments qui ne portent pas de données : fonds, couleurs, cadres décoratifs et éléments superposés. Les éléments structuraux - les motifs de recherche (les grands carrés d\'angle), les motifs de synchronisation (les lignes alternées) et les motifs d\'alignement (des carrés plus petits dans des codes plus grands) - doivent maintenir leur position et leurs proportions. Travailler dans ces contraintes permet toujours des animations étonnamment dynamiques et stimulantes.'],
    },
    {
      heading: 'Techniques d\'animation Ça marche',
      paragraphs: ['Le vélo couleur anime les couleurs de premier plan et de fond à travers une palette tout en conservant un contraste suffisant à chaque étape. Cela crée un effet vibrant et empreint d\'attention avec un risque de balayage minimal - tant que le contraste ne tombe jamais en dessous des niveaux lisibles. Les préréglages du cycle de couleurs d\'ANQR sont conçus pour maintenir la scannabilité tout au long du cycle.', 'Les superpositions animées placent l\'imagerie mobile derrière un modèle QR semi-transparent. Le code reste stable pendant que l\'arrière-plan anime - peut-être une vidéo en boucle, des éléments de marque animés, ou des graphiques abstraits de mouvement. Cette technique nécessite une gestion soigneuse de l\'intensité afin d\'empêcher le fond d\'écraser le modèle QR, mais crée les résultats les plus frappants visuellement.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Diagramme montrant la structure en couches d\'un QR animé: couche de code stable sur la couche de fond animée',
          caption: 'Principe de superposition d\'animation : le modèle QR reste constant tandis que les éléments de fond animent sous',
        },
      ],
    },
    {
      heading: 'Configuration des paramètres d\'animation',
      paragraphs: ['Le taux de trame affecte à la fois la douceur visuelle et la taille du fichier. Pour la plupart des applications, 10-15 images par seconde offre un mouvement lisses sans tailles de fichiers excessives. Des taux d\'images plus élevés permettent de diminuer les retours visuels tout en augmentant significativement la taille des fichiers. Considérez votre contexte de livraison - un grand signe numérique peut gérer des fichiers plus grands qu\'un placement publicitaire mobile.', 'Le comportement de boucle détermine comment les cycles d\'animation. Les boucles sans couture créent un mouvement continu idéal pour la signalisation et les affichages ambiants. Les boucles Ping-pong (forward-then-reverse) fonctionnent bien pour des animations simples. Pour les pulsations de l\'attention, considérez des animations avec cales - des périodes de calme ponctuées par un mouvement qui attire l\'œil sans fatigue constante du mouvement.'],
    },
    {
      heading: 'Création de superpositions animées',
      paragraphs: ['En utilisant des images animées (GIF, WebPs animés ou vidéo) comme superpositions, ANQR les extrait et les compose avec votre code QR. Le réglage de l\'intensité de la superposition contrôle combien de l\'animation montre à travers - des valeurs inférieures priorisent la scannabilité tandis que des valeurs plus élevées favorisent l\'impact visuel. Testez l\'intensité choisie sur plusieurs cadres afin d\'assurer une scannabilité constante.', 'La qualité des matériaux sources a des répercussions importantes sur les résultats. Utilisez des superpositions avec des sujets clairs et un bon contraste. Évitez les animations sources avec des flashs rapides ou des changements de luminosité extrêmes qui pourraient créer occasionnellement des cadres à faible contraste. Prévisualiser le cycle complet d\'animation avant d\'exporter pour attraper les images problématiques qui pourraient ne pas scanner.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Une vue image par image d\'une superposition animée montrant des niveaux de contraste maintenus dans la séquence',
          caption: 'Analyse des cadres : vérification de la scannabilité cohérente tout au long du cycle d\'animation',
        },
      ],
    },
    {
      heading: 'Exportation et livraison',
      paragraphs: ['GIF reste le format d\'animation le plus pris en charge, en jouant automatiquement dans la plupart des contextes sans nécessiter de prise en charge du lecteur vidéo. Cependant, la palette 256 couleurs de GIF limite la fidélité des couleurs. Pour les animations en couleurs critiques, considérez WebP animé où pris en charge, ou revenir aux formats vidéo pour la plus haute qualité. L\'exportation GIF d\'ANQR comprend des options de dithage pour maximiser la qualité dans les limites de la palette.', 'La taille du fichier est importante pour la livraison. Les systèmes d\'affichage numérique, les clients de courriel et les plateformes sociales imposent souvent des limites de taille. Si votre animation dépasse ces limites, réduisez le nombre de cadres, les dimensions ou la profondeur de couleur. Parfois, diviser une animation complexe en une boucle plus courte donne de meilleurs résultats que la compression agressive qui dégrade chaque cadre.'],
    },
    {
      heading: 'Essai des codes QR animés',
      paragraphs: ['Tester des codes animés nécessite de scanner plusieurs points dans le cycle d\'animation. Ne pas seulement scanner une fois et supposer le succès - scanner à plusieurs reprises, à différents moments, pour vérifier que chaque cadre est lisible. Portez une attention particulière aux cadres aux extrêmes du cycle de couleurs ou aux pics d\'intensité de recouvrement où le contraste pourrait être le plus faible.', 'Tester sur le matériel d\'affichage réel si possible. Surveiller l\'étalonnage des couleurs, l\'angle de visionnement et l\'éclairage ambiant influent tous sur la façon dont l\'animation apparaît et scanne. Une animation lumineuse qui scanne parfaitement sur votre moniteur peut se laver sur un écran extérieur ou devenir illisible sous des angles obliques.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Une matrice de test montrant les taux de succès de l\'analyse sur différents cadres, appareils et conditions d\'affichage',
          caption: 'Protocole d\'essai des QR animé : vérification systématique des cadres, des dispositifs et des conditions de visionnement',
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
          label: 'Voir les exemples QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Pratiques exemplaires en matière de sécurité et de conformité des QR',
      paragraphs: ['Un code QR magnifiquement conçu qui ne scanne pas est pire qu\'inutile - il frustre les clients, endommage la perception de la marque, et gaspille toutes les ressources investies dans sa création et sa distribution. Le présent guide porte sur les facteurs techniques et pratiques qui déterminent si un code QR sera analysé de façon fiable et comment utiliser les caractéristiques de sécurité d\'ANQR pour attraper des problèmes potentiels avant qu\'ils n\'atteignent la production.', 'La fiabilité du code QR n\'est pas binaire. Un code peut scanner parfaitement sur les téléphones phares mais échoue sur les appareils de budget. Il peut fonctionner dans l\'éclairage idéal, mais lutte dans les restaurants sombres ou soleil éclatant. Comprendre les facteurs qui affectent la scannabilité vous aide à faire des compromis éclairés entre le style visuel et la fiabilité du monde réel.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Un spectre de fiabilité montrant des codes QR allant de très scannable à peu lisible',
          caption: 'Le spectre de scannabilité : des codes pare-balles au style qui pousse les limites de fiabilité',
        },
      ],
    },
    {
      heading: 'Comprendre les niveaux de correction des erreurs',
      paragraphs: ['Les codes QR comprennent une redondance intégrée qui permet de les lire même en cas d\'endommagement partiel ou d\'obscurcissement. Le niveau de correction des erreurs - L (7 %), M (15 %), Q (25 %) ou H (30 %) - détermine la quantité de code manquante tout en décodant correctement. Une correction d\'erreur plus élevée crée des codes plus importants, mais offre une marge de sécurité pour les recouvrements, les imperfections d\'impression et les dommages environnementaux.', 'Pour les codes avec superposition d\'image, niveau de correction d\'erreur H est essentiel - la superposition masque physiquement une partie du code, et vous avez besoin de 30% de redondance pour maintenir la fiabilité. Pour des codes propres et sans style dans des environnements contrôlés, le niveau M suffit souvent. Niveau L doit être réservé aux situations où la taille du code est strictement limitée et vous pouvez garantir des conditions intactes.'],
    },
    {
      heading: 'La zone critique et tranquille',
      paragraphs: ['La zone tranquille est la marge blanche entourant chaque code QR. Les scanners utilisent cette limite pour identifier où le code commence et se termine. La norme ISO spécifie une zone de silence minimale de quatre modules (quatre fois la largeur du plus petit carré du code). La violation de cet espace - avec des éléments de conception, des bords de garniture ou du contenu adjacent - est l\'une des causes les plus courantes de pannes de balayage.', 'L\'application de zone tranquille d\'ANQR aide à maintenir cet espacement critique, mais vous devez également vous assurer qu\'il est préservé dans vos conceptions finales. Lors de la remise de l\'œuvre d\'art QR, spécifiez explicitement les exigences de zone tranquille. Lors de la mise en page des codes, vérifiez qu\'aucun élément ne pénètre dans cet espace. Quelques millimètres d\'espace libre peuvent signifier la différence entre le balayage fiable et les clients frustrés.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Un diagramme montrant l\'espacement correct des zones silencieuses par rapport aux violations courantes qui causent des pannes de balayage',
          caption: 'Besoins de zone tranquille : la marge invisible qui détermine le succès de l\'analyse',
        },
      ],
    },
    {
      heading: 'Sécurité des contrastes et des couleurs',
      paragraphs: ['Les scanners QR détectent le modèle des modules lumineux et sombres. Tout style qui réduit ce contraste - les premiers plans légers, les arrière-plans sombres, les effets de gradient ou les superpositions à faible opacité - rend le code plus difficile à lire. ANQR calcule les rapports de contraste et avertit lorsque vos choix de couleurs approchent des niveaux dangereux, mais le dernier arbitre est toujours des tests du monde réel.', 'La perception des couleurs varie selon les conditions d\'éclairage. Une combinaison de couleurs qui semble très contrastée sur votre moniteur pourrait devenir difficile à distinguer sous un éclairage incandescente chaud ou des tubes fluorescents frais. Si votre code est déployé dans des conditions d\'éclairage variables, testez sous plusieurs sources lumineuses, et considérez des rapports de contraste plus prudents comme une marge de sécurité.'],
    },
    {
      heading: 'Taille du module et distance de visionnement',
      paragraphs: ['La taille physique de chaque module détermine la distance maximale à partir de laquelle un code peut être scanné. Les petits modules signifient des codes plus petits mais nécessitent des distances de balayage plus étroites. La règle générale est que chaque module doit être d\'au moins 0,5 mm à la distance de balayage prévue, en augmentant proportionnellement pour les plus grandes distances. Un code sur un panneau d\'affichage nécessite des modules beaucoup plus grands qu\'un code sur une carte de visite.', 'Lors du calcul de la taille du module, considérez le pire scénario : le client avec un téléphone plus ancien, dans un éclairage imparfait, balayage à la distance maximale probable. Design pour cet utilisateur, et tout le monde aura une expérience encore meilleure. Les recommandations de taille d\'ANQR tiennent compte de ces variables du monde réel pour suggérer des dimensions appropriées à votre utilisation prévue.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Une carte relative à la taille du module, aux dimensions d\'impression et à la distance de numérisation maximale efficace',
          caption: 'Guide de distance de numérisation : la taille du module correspond à vos besoins de déploiement',
        },
      ],
    },
    {
      heading: 'Utilisation du mode de sécurité ANQR',
      paragraphs: ['Le mode de sécurité d\'ANQR fournit une rétroaction en temps réel sur la fiabilité de l\'analyse. Il surveille les rapports de contraste, la conformité des zones tranquilles, l\'intensité de recouvrement et d\'autres facteurs qui influent sur la scannabilité. Lorsque tout paramètre approche des niveaux risqués, vous verrez des avertissements avec des conseils spécifiques sur la façon d\'améliorer la fiabilité. Pour les déploiements professionnels où l\'échec est coûteux, maintenir le mode de sécurité actif tout au long du processus de conception.', 'Le mode de sécurité comprend également une fonction de vérification de l\'analyse qui tente de décoder votre code généré et signale le succès ou l\'échec. Bien que cette vérification in-app ne puisse pas reproduire toutes les conditions réelles, il saisit de nombreux problèmes communs avant d\'investir dans l\'impression ou la distribution. Traiter la vérification avec succès comme une barre minimale, et non comme une garantie - les essais dans le monde réel demeurent essentiels.'],
    },
    {
      heading: 'Protocoles d\'essais dans le monde réel',
      paragraphs: ['Aucune vérification logicielle ne remplace les tests physiques. Imprimez votre code à la taille prévue sur du matériel représentatif. Testez-le dans l\'environnement de déploiement réel avec des conditions d\'éclairage qui correspondent à une utilisation réelle. Scanner avec plusieurs appareils - pas seulement votre téléphone phare, mais les appareils Android budget, les anciens iPhones, et tous les appareils spécifiques que votre public utilise couramment.', 'Documentez systématiquement vos tests. Indiquer quels appareils ont été testés, dans quelles conditions, avec quels résultats. Si vous déployez des codes à l\'échelle, établissez des critères d\'acceptation : un taux de réussite de 95 % peut-être dans votre bassin de tests d\'appareil, ou des analyses réussies en 2 secondes sur tous les appareils testés. Ces normes aident à rendre les décisions aller/pas aller objectif plutôt que d\'espérer le meilleur.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Une liste de contrôle complète couvrant les dispositifs, les conditions et les critères d\'acceptation',
          caption: 'Protocole d\'essai de déploiement QR : vérification systématique avant l\'engagement de production',
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
          label: 'Voir les exemples QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Voir les exemples QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Ouvrir le guide complet de l\'utilisateur', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Ouvrir la galerie', type: 'gallery' },
  ],
};
