import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Exemples d\'ANQR',
  description: 'Cinq exemples concrets de style production qui montrent où les codes QR créent une valeur mesurable : amélioration d\'un ancien code de comptoir de vente au détail, paiements de vente au détail de marque et actions de « numérisation », mise à l\'échelle de l\'impression des dépliants aux panneaux d\'affichage, QR animé pour l\'affichage numérique et collaboration multilingue à l\'aide de liens d\'ancrage partageables. Chaque exemple comprend des images, des contraintes pratiques et un lien de remix vers le générateur.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Ouvrez le générateur', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Ouvrez le guide de l\'utilisateur complet', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Étude de cas : augmentation du QR des comptoirs de vente au détail',
      paragraphs: ['Cet exemple concret suit un petit café qui utilisait le même code QR sur son comptoir depuis trois ans. Le code original a été généré rapidement pendant la crise pandémique, imprimé sur du papier standard et glissé dans un support en plastique. Il fonctionnait toujours – techniquement – ​​​​mais les clients avaient souvent besoin de plusieurs tentatives pour le scanner, et cela ne renforçait en rien l\'identité de marque soigneusement conçue du café.', 'La transformation a commencé par un simple audit : le code existant codait l\'URL du menu en ligne du café, qu\'ils souhaitaient conserver. Le défi consistait à faire en sorte que le QR fasse partie de l\'expérience du café plutôt que d\'être un utilitaire réfléchi à partir de 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Un code QR patiné dans un support en plastique montrant une usure visible, des empreintes digitales et une impression décolorée',
          caption: 'Le point de départ : trois ans de service au comptoir avaient laissé le QR d\'origine à peine fonctionnel',
        },
      ],
    },
    {
      heading: 'Diagnostic des problèmes du code d\'origine',
      paragraphs: ['Les tests ont révélé plusieurs problèmes : le code d\'origine utilisait la correction d\'erreur L (redondance minimale), avait une zone silencieuse de seulement 2 modules et était imprimé en basse résolution. Sous l\'éclairage chaleureux au tungstène du café, les modules noirs déjà décolorés contrastaient à peine avec le papier jauni. Les téléphones plus anciens ont connu des difficultés ; les téléphones plus récents ont réussi mais avec un retard notable.', 'Au-delà des problèmes techniques, le carré générique en noir et blanc ne communique rien sur la marque. Les clients hésitaient avant de scanner - une subtile barrière de confiance qui réduisait l\'engagement avec le menu numérique soigneusement conçu du café.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Une superposition de diagnostic montrant les défauts techniques du QR d\'origine : faible ECC, zone de silence minimale, mauvais contraste',
          caption: 'Analyse technique révélant pourquoi le code existant était sous-performant dans des conditions réelles',
        },
      ],
    },
    {
      heading: 'Le processus d\'élévation',
      paragraphs: ['À l\'aide d\'ANQR, le propriétaire du café a recréé le code avec l\'URL de menu identique mais avec des paramètres considérablement améliorés : correction d\'erreur H pour une résilience maximale, une zone silencieuse à 6 modules pour une détection fiable des limites et des couleurs de marque (modules bordeaux foncé sur fond crème) qui correspondaient à la palette intérieure du café.', 'Une petite superposition centrale comportant le logo du café a été ajoutée – délibérément subtile pour maintenir la lisibilité tout en offrant une reconnaissance instantanée de la marque. Le mode sécurité a confirmé que la nouvelle conception était numérisée de manière fiable sur les appareils de test avant toute impression.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'L\'interface ANQR montrant la configuration : couleurs de la marque, ECC approprié, zone de silence généreuse, superposition subtile du logo',
          caption: 'Création de la configuration mise à niveau : chaque paramètre choisi pour équilibrer l\'expression de la marque et la fiabilité de la numérisation',
        },
      ],
    },
    {
      heading: 'Résultats mesurables',
      paragraphs: ['Après avoir déployé le nouveau QR sur du papier cartonné professionnel laminé mat, le café a suivi les résultats sur quatre semaines. Le taux de réussite de l\'analyse s\'est amélioré, passant d\'environ 70 % à près de 100 %. Le temps d\'analyse moyen est passé de 3 à 4 secondes à moins d\'une seconde. Plus important encore, l\'engagement dans le menu a augmenté de 40 % : les clients qui jetaient auparavant un coup d\'œil au QR et abandonnaient le scannaient désormais en toute confiance.', 'Le personnel a signalé moins de questions des clients sur « comment utiliser le QR » et plus de cas de saisie manuelle de l\'URL pour les clients frustrés. L\'apparence de la marque a également suscité des conversations, les clients commentant positivement le design cohérent.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Une comparaison avant/après avec des métriques : taux de réussite des analyses, temps d\'analyse moyen et améliorations du nombre d\'analyses hebdomadaires',
          caption: 'Quatre semaines de données montrant l\'impact mesurable d\'une amélioration réfléchie du QR',
        },
      ],
    },
    {
      heading: 'Recréer cette configuration',
      paragraphs: ['La configuration du café démontre une image de marque conservatrice mais efficace : correction d\'erreur H, zone de silence à 6 modules, couleurs de marque très contrastées et superposition centrale minimale. Cet équilibre fonctionne pour la plupart des applications de comptoir de vente au détail où la fiabilité doit primer mais où la présence de la marque compte toujours.', 'Ouvrez le générateur avec ces paramètres préchargés et adaptez les couleurs et la superposition à votre propre marque. L\'idée clé : les améliorations de la fiabilité à elles seules peuvent augmenter considérablement l\'engagement, avant même d\'ajouter un style visuel.', 'Consultez le guide d\'apprentissage associé sur l\'amélioration des campagnes QR existantes pour connaître la méthodologie complète derrière cette approche.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Lien vers le générateur préconfiguré avec les paramètres du café pour une personnalisation immédiate',
          caption: 'Commencez avec une configuration éprouvée et personnalisez-la pour votre marque',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Parcourir les articles Apprendre',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Étude de cas : affichage du compteur multi-paiements',
      paragraphs: ['Cet exemple suit une boutique de vêtements qui avait accumulé cinq codes QR différents dans sa caisse : paiement bancaire, pourboires, Instagram, avis Google et un lien d\'embauche. Chacun a été généré à partir d\'une source différente, imprimé à des moments différents et affiché sur des supports dépareillés. Le chaos visuel mettait à mal l\'esthétique soigneusement organisée du magasin, et le personnel avait régulièrement affaire à des clients qui scannaient le mauvais code.', 'La solution nécessitait de séparer les préoccupations : les codes de paiement devaient être d\'une fiabilité maximale avec un style conservateur, tandis que les codes marketing pouvaient être plus expressifs. Le système d\'affichage unifié qui a émergé montre comment équilibrer la présence de la marque avec les exigences fonctionnelles des différents cas d\'utilisation du QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Une zone de registre encombrée montrant cinq codes QR incompatibles dans divers stands et documents imprimés',
          caption: 'Le point de départ chaotique : cinq codes QR déconnectés rivalisant pour attirer l\'attention et semant la confusion chez les clients',
        },
      ],
    },
    {
      heading: 'Donner la priorité à l\'expérience de paiement',
      paragraphs: ['Le principal moyen de paiement du magasin utilisait une norme régionale qui exigeait une stricte conformité des charges utiles. Les tests ont révélé que même un style mineur affectait la vitesse d\'analyse avec certaines applications bancaires. La décision : conserver le QR de paiement totalement inchangé, à l\'exception de l\'optimisation de la taille et de l\'impression professionnelle sur du papier cartonné mat.', 'Cette approche conservatrice signifiait que le code de paiement semblait moins « de marque » qu\'idéal, mais les taux d\'achèvement des transactions s\'amélioraient considérablement. L\'idée : les moments de paiement ne sont pas des opportunités de marque, ce sont des moments de fiabilité. Les clients apprécient la rapidité et la certitude plutôt que l\'esthétique lorsqu\'il s\'agit d\'argent.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Un code QR de paiement clair et de grande taille sur du papier cartonné mat professionnel, placé bien en vue à la caisse',
          caption: 'Le QR de paiement : de taille généreuse, imprimé de manière professionnelle, style conservateur pour une reconnaissance instantanée par les applications bancaires',
        },
      ],
    },
    {
      heading: 'Création de l\'affichage des actions secondaires',
      paragraphs: ['Pour les conseils, les avis, les réseaux sociaux et l\'embauche, le magasin pourrait être plus expressif. Ces codes ont été régénérés dans ANQR avec un style de marque cohérent : le vert olive sur crème emblématique du magasin, un style de module arrondi et une subtile superposition centrale avec l\'icône du magasin. La correction d\'erreur H a assuré la fiabilité même avec le style.', 'Ces quatre codes étaient disposés dans un panneau de marque positionné à côté (sans concurrencer) le code de paiement. Des étiquettes claires dans la typographie du magasin expliquaient le but de chaque code. La hiérarchie visuelle était intentionnelle : le paiement était seul et proéminent ; actions secondaires regroupées en options.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Un panneau de marque affichant quatre codes QR stylisés pour les conseils, les avis, les réseaux sociaux et l\'embauche, avec des étiquettes claires',
          caption: 'Le panneau d\'action secondaire : une image de marque cohérente, un étiquetage clair, positionné comme des options plutôt que des distractions',
        },
      ],
    },
    {
      heading: 'Conception du système d\'affichage',
      paragraphs: ['L\'affichage physique a résolu plusieurs problèmes simultanément. Le stand de paiement et le panneau secondaire utilisaient des matériaux mats pour éliminer l\'éblouissement de l\'éclairage zénithal. Les hauteurs ont été optimisées pour les clients de différentes statures. Angles dirigés vers la file d\'attente des clients plutôt qu\'à plat sur le comptoir.', 'Surtout, le magasin a créé des impressions de rechange à partir de liens de configuration ANQR verrouillés. Lorsque le code des astuces a finalement été éclaboussé, le personnel l\'a remplacé en quelques minutes en utilisant la configuration stockée - pas de captures d\'écran, pas de devinettes sur les paramètres, pas de dégradation de la qualité.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Un diagramme montrant la disposition physique de l\'affichage : hauteurs, angles, matériaux et relation entre le paiement et les affichages secondaires',
          caption: 'Plan du système d\'affichage : ergonomie physique optimisée pour une numérisation fiable quelles que soient les hauteurs des clients et les conditions d\'éclairage',
        },
      ],
    },
    {
      heading: 'Améliorations opérationnelles',
      paragraphs: ['Six semaines après le déploiement, le magasin a enregistré des améliorations significatives : aucune plainte de client concernant la confusion du « mauvais code », des délais de transaction plus rapides et une multiplication par 3 des pourboires soumis (les clients pouvaient désormais trouver et scanner le code du pourboire sans demander maladroitement au personnel). Les avis Google ont également augmenté à mesure que le QR dédié et bien étiqueté supprimait les frictions.', 'La formation du personnel est devenue plus simple : « le code de paiement est le plus important, tout le reste est sur le panneau ». Lorsque les applications de paiement ont été mises à jour et que l\'une d\'elles a brièvement montré une analyse plus lente, la conception conservatrice du code de paiement signifiait qu\'elle fonctionnait toujours - juste légèrement plus lentement plutôt que d\'échouer complètement.', 'Consultez le guide d\'apprentissage sur les codes QR pour les paiements de détail pour connaître les principes qui sous-tendent la conception de ce système d\'affichage.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Un tableau de bord de métriques montrant des comparaisons avant/après : incidents de confusion, temps de transaction, fréquence des pourboires, soumissions d\'avis',
          caption: 'Six semaines de données opérationnelles démontrant l\'impact commercial d\'un système d\'affichage multi-QR bien pensé',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Parcourir les articles Apprendre',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Étude de cas : de la carte de visite au panneau d\'affichage',
      paragraphs: ['Cet exemple suit une société de production d\'événements se préparant pour une grande conférence. Ils avaient besoin du même code QR - lié à l\'application de l\'événement - déployé dans des formats radicalement différents : inserts de badge de participant (3 cm), cartes de tente de table (8 cm), signalisation du bureau d\'inscription (30 cm), affiches d\'orientation (60 cm) et une immense bannière de fond de scène (4 mètres). Chaque format avait des distances de visualisation, des conditions d\'éclairage et des flux de production différents.', 'Le défi n\'était pas seulement technique : il était opérationnel. Plusieurs fournisseurs géraient différents travaux d\'impression, et l\'entreprise devait garantir des résultats cohérents et numérisables, quel que soit celui qui produisait quoi. Leur solution était centrée sur l\'exportation SVG et une documentation de transfert rigoureuse.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Un collage montrant le même code QR déployé dans cinq tailles différentes, du badge à la bannière',
          caption: 'Un code QR, cinq tailles de déploiement : le défi de maintenir une lisibilité allant du centimètre au mètre',
        },
      ],
    },
    {
      heading: 'Pourquoi les événements précédents ont posé des problèmes',
      paragraphs: ['Lors de leur dernière conférence, l\'entreprise avait connu des échecs embarrassants. La bannière de scène QR a été générée sous la forme d\'un petit fichier PNG et mise à l\'échelle dans un logiciel de conception. Le résultat semblait acceptable de loin, mais n\'a pas pu être numérisé de manière fiable par le public. Les QR des badges étaient trop stylés et trop petits, ce qui frustrait les participants qui essayaient d\'ajouter des contacts. Des paramètres incohérents entre les formats signifiaient que le « même » QR était en fait différent sur chaque pièce.', 'L\'analyse post-événement a révélé la cause profonde : il n\'existe pas de source unique de vérité. Chaque concepteur avait recréé le QR avec des paramètres légèrement différents, et chaque fournisseur d\'impression avait traité les fichiers différemment. Qualité dégradée par le jeu téléphonique des transferts de fichiers.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Photographies en gros plan montrant des échecs de numérisation : modules de bannières pixélisés, codes de badge sous-dimensionnés, style incohérent selon les formats',
          caption: 'Analyse médico-légale des échecs d\'événements précédents : chaque format avait introduit des problèmes de qualité différents',
        },
      ],
    },
    {
      heading: 'Le flux de travail SVG-First',
      paragraphs: ['Pour cet événement, l\'entreprise a établi un protocole strict : un QR maître généré dans ANQR avec des paramètres optimaux (correction d\'erreur H, zone de silence généreuse, style épuré), exporté au format SVG et stocké en tant que source unique faisant autorité. Le lien de configuration ANQR a été documenté avec le fichier SVG afin que le code puisse être régénéré si nécessaire.', 'Chaque concepteur et fournisseur a reçu le même modèle SVG avec des instructions explicites : placer à la taille requise, ne pas modifier, maintenir l\'espace libre dans la zone silencieuse. Pour les fournisseurs nécessitant des formats raster, la société a fourni des fichiers PNG pré-rendus dans des tailles spécifiques avec des conventions de dénomination claires indiquant l\'utilisation prévue.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Un package de fichiers montrant le maître SVG, les PNG spécifiques à la taille, le document de spécification et le lien de configuration',
          caption: 'Le package de transfert : tout ce dont les fournisseurs avaient besoin pour produire des résultats cohérents sans deviner',
        },
      ],
    },
    {
      heading: 'Considérations spécifiques à la taille',
      paragraphs: ['Chaque format nécessitait une attention particulière. Les inserts de badge à 3 cm nécessitaient que le QR occupe le maximum d\'espace disponible - la distance de numérisation serait à bout de bras. Les tentes de table de 8 cm pourraient inclure un cadre décoratif en dehors de la zone calme. La bannière de 4 mètres nécessitait un calcul : à partir de la distance typique du public (15 à 20 mètres), les modules devaient être clairement distinguables par les caméras des téléphones, ce qui signifiait que le QR devait être d\'au moins 80 cm dans le design de la bannière.', 'L\'entreprise a créé un guide des tailles documentant les dimensions QR minimales pour chaque distance de numérisation prévue. C\'est devenu un atout réutilisable pour les événements futurs, éliminant les incertitudes du processus de conception.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Un graphique montrant la relation entre la distance de numérisation, la taille minimale du QR et les dimensions du module pour chaque format d\'événement',
          caption: 'La matrice de dimensionnement : des dimensions calculées garantissant une numérisation fiable à la distance de visualisation prévue pour chaque format',
        },
      ],
    },
    {
      heading: 'Résultats de production',
      paragraphs: ['La validation le jour de la conférence était systématique : le personnel testait chaque QR déployé avant l\'ouverture des portes. Les inserts de badge sont numérisés instantanément à bout de bras. Les tentes de table fonctionnaient de manière fiable dans l\'éclairage variable des salles de sous-commission. La bannière de la scène - la gêne de l\'événement précédent - a été balayée avec succès depuis le milieu de la zone du public.', 'Aucune plainte relative à l\'analyse n\'a été enregistrée auprès de plus de 2 000 participants. La victoire opérationnelle était tout aussi significative : lorsqu\'un ajout de sponsor de dernière minute nécessitait une nouvelle signalisation, l\'équipe de production la générait à partir du SVG principal en quelques minutes, sûre qu\'elle correspondrait à tout le reste.', 'Consultez le guide d\'apprentissage sur les codes QR prêts à imprimer pour le cadre de décision SVG vs PNG et les meilleures pratiques de transfert.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Photographie d\'événement montrant les participants en train de scanner avec succès des codes QR à différentes tailles et distances dans tout le lieu.',
          caption: 'Succès le jour de la conférence : numérisation fiable dans tous les formats, des gros plans de badges aux photos à distance des bannières de scène',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Parcourir les articles Apprendre',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Étude de cas : affichage numérique des salons d\'aéroport',
      paragraphs: ['Cet exemple suit le salon d\'une compagnie aérienne qui utilisait des codes QR statiques sur ses écrans d\'accueil numériques. Les écrans affichaient du contenu promotionnel en rotation, mais le code QR pour l\'enregistrement dans le salon se trouvait dans un coin, statique et facilement ignoré. Les analyses ont montré que seulement 15 % des clients éligibles utilisaient l\'enregistrement QR, bien qu\'il soit plus rapide que la file d\'attente au bureau. La plupart des invités ne l\'ont tout simplement pas remarqué.', 'L\'hypothèse était simple : dans un environnement visuellement chargé avec du contenu en mouvement, un QR statique devient invisible. La solution devait rendre le QR visible sans compromettre la fiabilité requise pour un flux d\'enregistrement où un échec entraînerait des voyageurs frustrés et des files d\'attente plus longues aux bureaux.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Un affichage numérique dans un salon d\'aéroport affichant du contenu promotionnel avec un petit code QR statique dans le coin',
          caption: 'La configuration originale : un QR statique perdu dans un océan de contenu promotionnel dynamique, avec seulement 15 % d\'adoption',
        },
      ],
    },
    {
      heading: 'Concevoir une animation sécurisée',
      paragraphs: ['L\'affichage numérique du salon utilisait de grands panneaux LED – un environnement difficile où une animation agressive pouvait créer des problèmes de numérisation. L\'équipe de conception a commencé de manière conservatrice : un léger effet d\'impulsion qui a subtilement élargi et contracté la présence visuelle du QR sans modifier la structure réelle du code. La synchronisation des images a été réglée lentement (250 ms) pour éviter tout problème de scintillement avec le taux de rafraîchissement des LED.', 'La validation du mode de sécurité a confirmé que chaque image restait numérisable. Des tests supplémentaires sur les panneaux LED réels ont révélé que l\'impulsion devait être encore plus subtile que ce que suggéraient les aperçus du bureau - la luminosité des LED et les angles de vision affectaient le contraste perçu plus que prévu.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Le panneau des paramètres d\'animation ANQR affichant la configuration des impulsions : synchronisation lente, intensité subtile, mode de sécurité activé',
          caption: 'Configuration de l\'animation : paramètres réglés pour l\'affichage sur panneau LED tout en maintenant la fiabilité de numérisation dans chaque image',
        },
      ],
    },
    {
      heading: 'Intégration avec le contenu de signalisation',
      paragraphs: ['Le QR animé était positionné dans une « zone stable » dédiée de la disposition de l\'écran – une zone qui restait constante pendant que le contenu promotionnel tournait dans la zone d\'affichage principale. Cette séparation était cruciale : le QR avait besoin d\'une stabilité visuelle pour être scanné tout en attirant l\'attention grâce à son animation subtile.', 'Un appel à l\'action clair a été ajouté à côté du QR : « Passer la file d\'attente - scannez pour vous enregistrer. » Le texte restait statique tandis que le QR pulsait, créant une hiérarchie visuelle qui attirait l\'œil sur l\'opportunité de numérisation sans surcharger le contenu promotionnel.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Un diagramme de disposition d\'écran montrant le QR animé dans une zone stable tandis que le contenu promotionnel tourne dans la zone principale',
          caption: 'Allocation d\'espace d\'écran : le QR animé occupe une zone stable distincte du contenu promotionnel en rotation',
        },
      ],
    },
    {
      heading: 'Déploiement technique',
      paragraphs: ['Le QR animé a été exporté au format GIF avec des paramètres optimisés pour le CMS de signalisation. Les considérations liées à la taille des fichiers étaient importantes : le système de gestion de contenu du salon avait des limites de téléchargement et les fichiers trop volumineux provoquaient des saccades de lecture. L\'exportation finale a équilibré la qualité visuelle par rapport à la taille du fichier en limitant la palette de couleurs et en optimisant le nombre d\'images.', 'Le déploiement comprenait une solution de secours : si la lecture du GIF échouait pour une raison quelconque, le système de signalisation affichait une sauvegarde PNG statique. Cette redondance garantissait que la capacité d\'enregistrement ne serait jamais perdue en raison de problèmes techniques liés à l\'animation.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Une interface CMS montrant le téléchargement QR animé avec une image statique de secours configurée',
          caption: 'Configuration du CMS de signalisation : primaire animé avec repli statique garantissant que la capacité d\'enregistrement n\'est jamais interrompue',
        },
      ],
    },
    {
      heading: 'Impact mesuré',
      paragraphs: ['Après un mois de fonctionnement, l\'adoption de l\'enregistrement QR est passée de 15 % à 24 %, soit une amélioration relative de 60 %. Les enquêtes auprès des clients ont indiqué que le QR animé était « plus facile à remarquer » et « semblait plus moderne ». Les temps d\'attente au bureau ont diminué de manière mesurable pendant les périodes de pointe, car davantage de clients se sont servis eux-mêmes via le QR.', 'Il est important de noter qu\'aucun échec d\'analyse n\'a été signalé malgré des milliers d\'analyses quotidiennes. L\'approche d\'animation conservatrice avait atteint l\'objectif d\'attention sans sacrifier la fiabilité exigée par le flux d\'enregistrement. Le salon a ensuite déployé des QR animés similaires sur ses autres emplacements.', 'Consultez le guide d\'apprentissage sur les codes QR animés pour l\'affichage numérique pour connaître les principes techniques derrière la conception d\'animations sécurisées.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Un tableau de bord montrant l\'augmentation du taux d\'adoption, la réduction du temps d\'attente et la fiabilité des analyses sans échec au cours de la période de déploiement.',
          caption: 'Un mois de données : augmentation de l\'adoption de 60 %, temps d\'attente réduits et fiabilité d\'analyse parfaite maintenue',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Parcourir les articles Apprendre',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Étude de cas : Campagne QR mondiale de lancement de produit',
      paragraphs: ['Cet exemple suit celui d\'une entreprise d\'électronique grand public qui lance un nouveau produit simultanément sur 12 marchés et 8 langues. Chaque équipe marketing régionale devait produire des emballages, des présentoirs de vente au détail et du matériel promotionnel comportant des codes QR renvoyant vers des pages de produits localisées. Les lancements précédents avaient entraîné un style QR incohérent, des échecs de numérisation occasionnels et un « jeu téléphonique » de dérive de configuration alors que chaque équipe recréait des codes à partir de captures d\'écran.', 'La solution a exploité les liens de configuration partageables de l\'ANQR pour établir une source unique de vérité à laquelle chaque équipe régionale pouvait accéder, quelle que soit la langue de son interface. La charge utile QR utilisait une redirection intelligente qui détectait la langue de l\'utilisateur, de sorte qu\'un code fonctionnait globalement tout en offrant des expériences localisées.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Une carte du monde montrant 12 emplacements de marché avec des codes QR, certains visuellement incompatibles les uns avec les autres',
          caption: 'Le défi : 12 marchés, 8 langues et un historique de mises en œuvre QR incohérentes dans les régions',
        },
      ],
    },
    {
      heading: 'Établir la configuration principale',
      paragraphs: ['L\'équipe mondiale de la marque a créé la configuration QR faisant autorité dans ANQR : des couleurs de marque correspondant à l\'identité visuelle de la gamme de produits, la correction d\'erreur H pour la fiabilité de toutes les applications imprimées et numériques, et un style qui serait reproduit de manière cohérente quelles que soient les méthodes de production locales. La configuration a été verrouillée et le lien de partage documenté dans le brief de campagne mondiale.', 'Surtout, l\'URL codée utilisait un service de redirection de détection de langue. Une fois numérisés, les utilisateurs étaient automatiquement redirigés vers la page produit de leur langue locale. Cela signifiait que les 12 marchés pouvaient utiliser des codes QR identiques – sans variations de charge utile par marché qui pourraient introduire des erreurs.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'L\'interface ANQR affichant la configuration principale avec les couleurs de la marque, ECC H et l\'URL de redirection intelligente',
          caption: 'La configuration principale : des normes de marque mondiales codées dans une source de vérité unique et partageable',
        },
      ],
    },
    {
      heading: 'Flux de travail de l\'équipe régionale',
      paragraphs: ['Chaque équipe marketing régionale a reçu le lien de configuration avec des instructions simples : ouvrez le lien, vérifiez que l\'aperçu correspond aux directives de la marque, exportez dans le format requis pour votre application. L\'interface ANQR s\'affichait dans la langue préférée de chaque équipe, mais les paramètres QR sous-jacents restaient identiques quelle que soit la langue de l\'interface.', 'Lorsque l\'équipe japonaise avait besoin de SVG pour les présentoirs de vente au détail haut de gamme et que l\'équipe brésilienne avait besoin de PNG pour les médias sociaux, les deux ont été exportés à partir de la même configuration. Lorsque le fournisseur d\'impression de l\'équipe allemande demandait des valeurs de couleur spécifiques, il pouvait référencer directement la configuration plutôt que de deviner à partir d\'une capture d\'écran.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Captures d\'écran montrant le même lien de configuration ouvert dans les interfaces japonaise, portugaise et allemande',
          caption: 'Même configuration, interfaces différentes : les équipes régionales travaillent dans leur langue préférée tout en conservant une cohérence globale',
        },
      ],
    },
    {
      heading: 'Gestion des variations régionales',
      paragraphs: ['Certains marchés ont nécessité des adaptations mineures. L\'équipe chinoise avait besoin d\'une version avec un cadre optimisé pour WeChat pour le partage social. Plutôt que de modifier le modèle principal, ils ont créé une variante documentée avec son propre lien de configuration, clairement étiquetée comme « variante CN-WeChat » dans la bibliothèque d\'actifs de la campagne. Cela permet de maintenir la traçabilité tout en permettant la localisation nécessaire.', 'L\'équipe de marque a établi une règle simple : toute variation par rapport au maître nécessitait un nouveau lien de configuration documenté. Aucune modification des fichiers exportés, aucune « solution rapide » dans le logiciel de conception. Cela a évité la dérive de configuration qui avait affecté les lancements précédents.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Une interface de bibliothèque d\'actifs affichant la configuration principale et les variantes régionales approuvées, chacune avec son propre lien',
          caption: 'Gouvernance des actifs de campagne : configuration principale et variantes documentées, toutes traçables via des liens de configuration',
        },
      ],
    },
    {
      heading: 'Résultats du lancement',
      paragraphs: ['Le jour du lancement du produit, les codes QR ont été déployés simultanément sur les emballages, les présentoirs de vente au détail, le matériel événementiel et les campagnes numériques sur les 12 marchés. Les audits de qualité ont confirmé la cohérence visuelle entre les régions : le QR sur les présentoirs des magasins de Tokyo correspondait au QR sur les emballages de São Paulo et au QR sur les bannières événementielles de Berlin.', 'Aucun échec de numérisation n\'a été signalé sur l\'ensemble des marchés. Lorsqu\'une modification de l\'URL de la page produit après le lancement était nécessaire, le service de redirection la traitait de manière invisible - aucune réimpression n\'était nécessaire. L\'équipe mondiale a estimé que l\'approche par lien de configuration a permis d\'économiser plus de 40 heures de temps de coordination par rapport à leur méthodologie de lancement précédente.', 'Consultez le guide d\'apprentissage sur la collaboration QR multilingue pour connaître les principes de flux de travail qui sous-tendent la cohérence des campagnes mondiales.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Une grille de photographies montrant un déploiement QR cohérent sur différents marchés : vente au détail à Tokyo, emballage à São Paulo, événements à Berlin',
          caption: 'Cohérence mondiale obtenue : présentation QR identique sur 12 marchés malgré des langues, des fournisseurs et des formats différents',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Ouvrez le générateur',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Parcourir les articles Apprendre',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Parcourir les articles Apprendre', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Ouvrez le guide de l\'utilisateur complet', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Ouvrir la galerie', type: 'gallery' },
  ],
};
