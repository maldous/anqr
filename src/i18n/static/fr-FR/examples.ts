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
    { href: '/guide?lang=${lang}', label: 'Ouvrir le guide complet de l\'utilisateur', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Étude de cas: Retail Counter QR Uplift',
      paragraphs: ['Cet exemple du monde réel suit un petit café qui utilisait le même code QR sur son comptoir depuis trois ans. Le code original a été généré rapidement pendant la ruée vers la pandémie, imprimé sur du papier standard, et glissé dans un support en plastique. Il fonctionnait encore - techniquement - mais les clients avaient souvent besoin de multiples tentatives pour le scanner, et il n\'a rien fait pour renforcer l\'identité de marque soigneusement conçue du café.', 'La transformation a commencé par un simple audit : le code existant encodé l\'URL du menu en ligne du café, qu\'ils voulaient conserver. Le défi était de faire en sorte que le QR se sente comme faisant partie de l\'expérience café plutôt qu\'une utilité après coup à partir de 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Un code QR dans un support en plastique montrant une usure visible, des empreintes digitales et une impression effacée',
          caption: 'Le point de départ : trois années de service de comptoir avaient laissé le QR original à peine fonctionnel',
        },
      ],
    },
    {
      heading: 'Diagnostic des problèmes du Code original',
      paragraphs: ['Les tests ont révélé de multiples problèmes : le code original utilisait la correction d\'erreur L (redondance minimale), avait une zone tranquille de seulement 2 modules et était imprimé à basse résolution. Sous l\'éclairage de tungstène chaud du café, les modules noirs déjà fendus contrastent à peine avec le papier jaune. Téléphones plus âgés lutté; les nouveaux téléphones ont réussi mais avec un retard notable.', 'Au-delà des questions techniques, le carré générique noir et blanc ne communiquait rien sur la marque. Les clients ont hésité avant de scanner - une barrière de confiance subtile qui a réduit l\'engagement avec le menu numérique soigneusement conçu du café.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Une superposition diagnostique montrant les lacunes techniques du QR d\'origine: faible CEC, zone minimale de calme, mauvais contraste',
          caption: 'Analyse technique révélant pourquoi le code hérité est sous-performé dans des conditions réelles',
        },
      ],
    },
    {
      heading: 'Le processus d\'élévation',
      paragraphs: ['En utilisant ANQR, le propriétaire du café a recréé le code avec l\'URL du menu identique, mais a considérablement amélioré les paramètres : Correction d\'erreur H pour une résilience maximale, une zone calme de 6 modules pour une détection fiable des frontières, et des couleurs de marque (modules bourgognes profondes sur fond crème) qui correspondent à la palette intérieure du café.', 'Une petite superposition centrale avec le logo du café a été ajoutée - gardée délibérément subtile pour maintenir la scannabilité tout en offrant une reconnaissance instantanée de la marque. Le mode de sécurité a confirmé la nouvelle conception scannée de façon fiable sur les appareils d\'essai avant toute impression.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'L\'interface ANQR montrant la configuration : couleurs de marque, ECC approprié, zone calme généreuse, superposition subtile du logo',
          caption: 'Construire la configuration améliorée : chaque réglage choisi pour équilibrer l\'expression de la marque avec la fiabilité de l\'analyse',
        },
      ],
    },
    {
      heading: 'Résultats mesurables',
      paragraphs: ['Après avoir déployé le nouveau QR sur des cartes mates, le café a suivi les résultats sur quatre semaines. Le taux de réussite de la numérisation est passé d\'environ 70 % à près de 100 %. Le temps moyen de balayage est passé de 3-4 secondes à moins de 1 seconde. Plus significativement, l\'engagement des menus a augmenté de 40 % - les clients qui avaient déjà regardé le QR et abandonné étaient maintenant en train de scanner avec confiance.', 'Le personnel a signalé moins de questions des clients sur « comment utiliser le QR » et plus de cas de saisie manuelle de l\'URL pour les clients frustrés. L\'apparence de marque a également suscité des conversations, avec des commentaires positifs sur le design cohésif.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A avant/après comparaison avec les mesures: taux de succès de l\'analyse, durée moyenne de l\'analyse et améliorations hebdomadaires du nombre d\'analyses',
          caption: 'Quatre semaines de données montrant l\'impact mesurable d\'une élévation réfléchie du QR',
        },
      ],
    },
    {
      heading: 'Recréer cette configuration',
      paragraphs: ['La configuration du café démontre une image de marque conservatrice mais efficace : Correction d\'erreur H, zone calme à 6 modules, couleurs de marque très contrastantes et superposition centrale minimale. Cet équilibre fonctionne pour la plupart des applications de comptoirs de détail où la fiabilité doit venir en premier mais la présence de la marque importe toujours.', 'Ouvrez le générateur avec ces paramètres préchargés et adaptez les couleurs et le recouvrement à votre propre marque. Le point de vue clé : l\'amélioration de la fiabilité seule peut augmenter considérablement l\'engagement, même avant d\'ajouter un style visuel.', 'Voir le guide d\'apprentissage connexe sur l\'amélioration des campagnes QR existantes pour la méthodologie complète derrière cette approche.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Lien vers le générateur préconfiguré avec les paramètres du café pour une personnalisation immédiate',
          caption: 'Commencez par une configuration éprouvée et personnalisez votre marque',
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
      heading: 'Étude de cas : affichage du compteur multi-paiements',
      paragraphs: ['Cet exemple suit un magasin de vêtements boutique qui avait accumulé cinq codes QR différents à leur registre: paiement bancaire, conseils, Instagram, Google avis, et un lien d\'embauche. Chacun a été généré à partir d\'une source différente, imprimé à différents moments, et affiché dans des stands mal appariés. Le chaos visuel sapait l\'esthétique soignée du magasin, et le personnel s\'occupait régulièrement des clients scrutant le mauvais code.', 'La solution a nécessité la séparation des préoccupations: les codes de paiement ont besoin d\'une fiabilité maximale avec un style prudent, tandis que les codes marketing pourraient être plus expressifs. Le système d\'affichage unifié qui a émergé montre comment équilibrer la présence de marque par rapport aux exigences fonctionnelles des différents cas d\'utilisation QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Une zone de registre encombrée montrant cinq codes QR mal appariés dans divers stands et documents imprimés',
          caption: 'Le point de départ chaotique : cinq codes QR déconnectés se disputent l\'attention et provoquent la confusion des clients',
        },
      ],
    },
    {
      heading: 'Priorité à l\'expérience de paiement',
      paragraphs: ['La principale méthode de paiement du magasin était une norme régionale exigeant une stricte conformité à la charge utile. Les tests ont révélé que même le style mineur a affecté la vitesse de balayage avec certaines applications bancaires. La décision: garder le paiement QR complètement non modifié, sauf pour l\'optimisation de la taille et l\'impression professionnelle sur le stock de carte matte.', 'Cette approche conservatrice signifiait que le code de paiement semblait moins «marqué» que l\'idéal, mais les taux d\'achèvement des transactions se sont considérablement améliorés. Le point de vue : les moments de paiement ne sont pas des opportunités de marque - ce sont des moments de fiabilité. Les clients apprécient la rapidité et la certitude sur l\'esthétique quand l\'argent est impliqué.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Un code QR propre et grand paiement sur les cartes mates professionnelles, positionné en bonne place au registre',
          caption: 'Le paiement QR: taille généreuse, imprimé professionnellement, style conservateur pour la reconnaissance instantanée par les applications bancaires',
        },
      ],
    },
    {
      heading: 'Création de l\'affichage d\'action secondaire',
      paragraphs: ['Pour les conseils, les évaluations, la socialité et l\'embauche, le magasin pourrait être plus expressif. Ces codes ont été régénérés en ANQR avec un style de marque cohérent : le vert olive sur crème, un style module arrondi, et une superposition centrale subtile avec l\'icône du magasin. Correction d\'erreur H assuré la fiabilité même avec le style.', 'Ces quatre codes étaient disposés dans un panneau de marque placé à côté (sans concurrence) du code de paiement. Des étiquettes claires dans la typographie du magasin expliquent le but de chaque code. La hiérarchie visuelle était intentionnelle: le paiement était seul et proéminent; les actions secondaires regroupées comme options.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Un panneau de marque montrant quatre codes QR de style pour les conseils, avis, social, et l\'embauche, avec des étiquettes claires',
          caption: 'Le panneau d\'action secondaire: marquage cohérent, étiquetage clair, positionné comme des options plutôt que des distractions',
        },
      ],
    },
    {
      heading: 'Conception du système d\'affichage',
      paragraphs: ['L\'affichage physique a résolu plusieurs problèmes simultanément. Le support de paiement et le panneau secondaire utilisaient des matériaux mats pour éliminer l\'éblouissement de l\'éclairage aérien. Les hauteurs ont été optimisées pour des clients de taille variable. Angles orientés vers la file d\'attente du client plutôt que plats sur le comptoir.', 'Critiquement, le magasin a créé des impressions de rechange à partir de liens de configuration ANQR verrouillés. Lorsque le code des conseils a fini par être éclaboussé de café, le personnel l\'a remplacé en quelques minutes en utilisant la configuration stockée - pas de captures d\'écran, pas de supposition aux paramètres, pas de dégradation de la qualité.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Un diagramme montrant la disposition de l\'affichage physique : hauteurs, angles, matériaux, et la relation entre le paiement et les affichages secondaires',
          caption: 'Plan du système d\'affichage : ergonomique physique optimisé pour un balayage fiable à travers les hauteurs et les conditions d\'éclairage du client',
        },
      ],
    },
    {
      heading: 'Améliorations opérationnelles',
      paragraphs: ['Six semaines après le déploiement, le magasin a documenté des améliorations significatives : zéro plainte des clients au sujet de la confusion du « mauvais code », des délais de transaction plus rapides et une augmentation de 3x des soumissions de bout (les clients pouvaient maintenant trouver et scanner le code de bout sans demander maladroitment au personnel). Les commentaires de Google ont également augmenté à mesure que le QR dédié, bien étiqueté a enlevé la friction.', 'La formation du personnel est devenue plus simple : Le code de paiement est le grand, tout le reste est sur le panneau. Lorsque les applications de paiement ont été mises à jour et que l\'une d\'elles a brièvement montré un balayage plus lent, la conception prudente du code de paiement a signifié qu\'il fonctionnait encore - légèrement plus lentement plutôt que d\'échouer entièrement.', 'Consultez le guide Learn sur les codes QR pour les paiements de détail pour connaître les principes qui sous-tendent cette conception du système d\'affichage.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Tableau de bord des mesures montrant avant/après les comparaisons : incidents de confusion, temps de transaction, fréquence de pointe, demandes d\'examen',
          caption: 'Six semaines de données opérationnelles démontrant l\'impact opérationnel d\'un système d\'affichage multi-QR réfléchi',
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
      heading: 'Étude de cas : de la carte d\'affaires au panneau d\'affichage',
      paragraphs: ['Cet exemple suit une entreprise de production d\'événements qui se prépare à une conférence importante. Ils avaient besoin du même code QR - lié à l\'application événement - déployé sur des formats radicalement différents : inserts de badges (3cm), cartes de tente de table (8cm), affiches de bureau d\'inscription (30cm), affiches de recherche de voies (60cm) et une bannière de fond de scène massive (4 mètres). Chaque format présentait des distances de visionnement, des conditions d\'éclairage et des flux de production différents.', 'Le défi n\'était pas seulement technique, mais opérationnel. Plusieurs fournisseurs ont géré différents travaux d\'impression, et l\'entreprise devait assurer des résultats cohérents et scannables, peu importe qui a produit quoi. Leur solution était centrée sur l\'exportation SVG et la documentation de remise rigoureuse.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Un collage montrant le même code QR déployé sur cinq tailles différentes, de l\'insigne à la bannière',
          caption: 'Un code QR, cinq tailles de déploiement : le défi de maintenir la scannabilité de centimètres à mètres',
        },
      ],
    },
    {
      heading: 'Pourquoi les événements précédents avaient des problèmes',
      paragraphs: ['Lors de leur dernière conférence, l\'entreprise avait connu des échecs embarrassants. La bannière de scène QR a été générée comme un petit PNG et mise à l\'échelle dans le logiciel de conception - le résultat a semblé acceptable à distance, mais n\'a pas réussi à scanner de façon fiable du public. Insigne Les QR étaient trop chics et trop petits, frustrants les participants essayant d\'ajouter des contacts. Les paramètres incohérents dans tous les formats signifient que le QR \'même\' était différent pour chaque pièce.', 'L\'analyse post-événement a révélé la cause profonde : aucune source unique de vérité. Chaque concepteur avait recréé le QR avec des paramètres légèrement différents, et chaque fournisseur d\'impression avait traité les fichiers différemment. La qualité s\'est dégradée à travers le jeu téléphonique des remises de fichiers.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Photos rapprochées montrant des échecs de numérisation: modules de bannière pixelisés, codes de badges sous-dimensionnés, coiffage incohérent entre les formats',
          caption: 'Analyse médico-légale des échecs d\'événements antérieurs: chaque format avait introduit différents problèmes de qualité',
        },
      ],
    },
    {
      heading: 'Le premier flux de travail SVG',
      paragraphs: ['Pour cet événement, la société a établi un protocole strict: un maître QR généré en ANQR avec des paramètres optimaux (Error Correction H, zone calme généreuse, style propre), exporté comme SVG, et stocké comme la seule source faisant autorité. Le lien de configuration ANQR a été documenté à côté du fichier SVG afin que le code puisse être régénéré si nécessaire.', 'Chaque concepteur et vendeur a reçu le même maître SVG avec des instructions explicites : placer à la taille requise, ne pas modifier, maintenir un espace calme. Pour les fournisseurs qui ont besoin de formats raster, la société a fourni des PNG pré-rendus à des tailles précises avec des conventions de nommage claires indiquant l\'utilisation prévue.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Un paquet de fichiers montrant le maître SVG, les PNG spécifiques à la taille, le document de spécification et le lien de configuration',
          caption: 'Le paquet de retrait : tout ce dont les fournisseurs ont besoin pour produire des résultats cohérents sans deviner',
        },
      ],
    },
    {
      heading: 'Considérations spécifiques à la taille',
      paragraphs: ['Chaque format nécessite une attention particulière. Les inserts d\'insigne à 3 cm avaient besoin du QR pour occuper le maximum d\'espace disponible - la distance de balayage serait de longueur de bras. Les tentes de table à 8cm peuvent comprendre un encadrement décoratif en dehors de la zone tranquille. La bannière de 4 mètres exigeait un calcul : à partir de la distance d\'audience typique (15-20 mètres), les modules devaient être clairement identifiables par des caméras téléphoniques, ce qui signifiait que le QR devait être d\'au moins 80 cm dans la conception de la bannière.', 'L\'entreprise a créé un guide de calibrage qui documente les dimensions minimales des QR pour chaque distance de balayage prévue. Cela est devenu un atout réutilisable pour les événements futurs, en supprimant le travail de conjecture du processus de conception.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Un graphique montrant la relation entre la distance de balayage, la taille minimale du QR et les dimensions du module pour chaque format d\'événement',
          caption: 'La matrice de calibrage : dimensions calculées assurant un balayage fiable à la distance de vision attendue de chaque format',
        },
      ],
    },
    {
      heading: 'Résultats de la production',
      paragraphs: ['La validation du jour de la conférence a été systématique : le personnel a testé chaque QR déployé avant l\'ouverture des portes. L\'insert est scanné instantanément à distance. Les tentes de table ont fonctionné de manière fiable dans l\'éclairage variable des salles de cassure. La bannière de scène - l\'embarras de l\'événement précédent - a été scannée avec succès depuis le milieu de la zone d\'audience.', 'Les plaintes de zéro balayage ont été enregistrées chez plus de 2 000 participants. La victoire opérationnelle a été tout aussi importante : lorsqu\'un ajout de dernière minute de sponsor a exigé une nouvelle signalisation, l\'équipe de production l\'a généré du master SVG en quelques minutes, confiant qu\'il correspondrait à tout le reste.', 'Consultez le guide d\'apprentissage sur les codes QR prêts à imprimer pour le cadre de décision SVG vs PNG et les meilleures pratiques.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Photographie de l\'événement montrant les participants avec succès balayage des codes QR à différentes tailles et distances à travers le lieu',
          caption: 'Succès du jour de la conférence : balayage fiable dans tous les formats, des gros plans des badges aux clichés de la bannière de la scène',
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
      heading: 'Étude de cas: Affichage numérique du salon aéroport',
      paragraphs: ['Cet exemple suit un salon aérien qui utilisait des codes QR statiques sur leurs écrans d\'accueil numériques. Les écrans affichaient un contenu promotionnel rotatif, mais le code QR pour l\'enregistrement des salons était assis dans un coin, statique et facilement négligé. L\'analyse a montré que seulement 15 % des clients admissibles ont utilisé l\'enregistrement QR bien qu\'il soit plus rapide que la file d\'attente de bureau. La plupart des invités ne l\'ont tout simplement pas remarqué.', 'L\'hypothèse était simple : dans un environnement visuellement occupé avec un contenu mobile, un QR statique devient invisible. La solution nécessaire pour rendre le QR visible sans compromettre la fiabilité requise pour un flux d\'enregistrement où la défaillance signifierait des voyageurs frustrés et des files d\'attente plus longues.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Un affichage numérique dans un salon d\'aéroport montrant du contenu promotionnel avec un petit code QR statique dans le coin',
          caption: 'La configuration originale : un QR statique perdu dans une mer de contenu promotionnel dynamique, avec seulement 15% d\'adoption',
        },
      ],
    },
    {
      heading: 'Conception d\'une animation sûre',
      paragraphs: ['La signalisation numérique du salon utilisait de grands panneaux LED - un environnement difficile où l\'animation agressive pourrait créer des problèmes de numérisation. L\'équipe de conception a commencé avec prudence : un effet d\'impulsion doux qui a subtilement élargi et contracté la présence visuelle du QR sans modifier la structure du code. Le timing du cadre a été réglé lentement (250ms) pour éviter tout problème de clignotement avec le taux de rafraîchissement LED.', 'La validation du mode de sécurité a confirmé que chaque cadre restait scannable. Des essais supplémentaires sur les panneaux LED réels ont révélé que l\'impulsion devait être encore plus subtile que les prévisualisations de bureau suggéré - luminosité LED et angles de vision a affecté le contraste perçu plus que prévu.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Le panneau de paramètres d\'animation ANQR montrant la configuration de l\'impulsion : timing lent, intensité subtile, mode de sécurité activé',
          caption: 'Configuration d\'animation : paramètres adaptés à l\'affichage des panneaux LED tout en maintenant la fiabilité de l\'analyse dans chaque cadre',
        },
      ],
    },
    {
      heading: 'Intégration au contenu de la signalisation',
      paragraphs: ['Le QR animé a été placé dans une « zone stable » dédiée à la mise en page de l\'écran - une zone qui est restée constante tandis que le contenu promotionnel tournait dans la zone d\'affichage principale. Cette séparation était cruciale : le QR avait besoin d\'une stabilité visuelle pour la numérisation, même en attirant l\'attention par son animation subtile.', 'Un appel à l\'action clair a été ajouté à côté du QR : "Passer la file d\'attente - scanner pour vérifier." Le texte est resté statique pendant que le QR pulsait, créant une hiérarchie visuelle qui a attiré l\'attention sur la possibilité de numérisation sans surcharger le contenu promotionnel.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Un diagramme d\'écran montrant le QR animé dans une zone stable tandis que le contenu promotionnel tourne dans la zone principale',
          caption: 'Allocation immobilière écran: le QR animé occupe une zone stable séparée du contenu promotionnel rotatif',
        },
      ],
    },
    {
      heading: 'Déploiement technique',
      paragraphs: ['Le QR animé a été exporté comme GIF avec des réglages optimisés pour la signalisation CMS. La taille du fichier est importante - le système de gestion de contenu du salon avait des limites de téléchargement, et les fichiers trop grands ont causé des bégaiements de lecture. La qualité visuelle de l\'exportation finale est équilibrée par rapport à la taille du fichier en limitant la palette de couleurs et en optimisant le nombre de cadres.', 'Le déploiement comprenait un repli : si le GIF ne jouait pas pour une raison quelconque, le système de signalisation afficherait une sauvegarde PNG statique. Cette redondance a assuré que la capacité d\'enregistrement n\'a jamais été perdue en raison de problèmes techniques avec l\'animation.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Une interface CMS montrant le téléchargement QR animé avec une image statique de repli configurée',
          caption: 'Configuration de la CMS: primaire animé avec chute statique assurant que la capacité d\'enregistrement n\'est jamais interrompue',
        },
      ],
    },
    {
      heading: 'Impact mesuré',
      paragraphs: ['Après un mois de fonctionnement, l\'adoption de l\'enregistrement QR est passée de 15 % à 24 % - une amélioration relative de 60 %. Les sondages auprès des clients ont indiqué que le QR animé était « plus facile à remarquer » et « plus moderne ». Les heures de file d\'attente des bureaux ont diminué de façon mesurable pendant les périodes de pointe, car de plus en plus d\'invités se sont rendus par le QR.', 'Fait important, aucun défaut de balayage n\'a été signalé malgré des milliers de balayages quotidiens. L\'approche d\'animation conservatrice avait atteint le but de l\'attention sans sacrifier la fiabilité d\'un flux d\'enregistrement exigé. Le salon a par la suite déployé des QR animés similaires à leurs autres emplacements.', 'Consultez le guide Learn sur les codes QR animés pour l\'affichage numérique pour connaître les principes techniques derrière la conception d\'animation sûre.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Un tableau de bord montrant l\'augmentation du taux d\'adoption, la réduction du temps de file d\'attente et la fiabilité de l\'analyse zéro défaut pendant la période de déploiement',
          caption: 'Un mois de données : augmentation de 60 % de l\'adoption, réduction des temps de queue et maintien d\'une fiabilité parfaite de l\'analyse',
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
      heading: 'Étude de cas : Campagne mondiale de lancement de produits QR',
      paragraphs: ['Cet exemple suit une entreprise d\'électronique grand public qui lance simultanément un nouveau produit sur 12 marchés dans 8 langues. Chaque équipe de marketing régionale devait produire des emballages, des présentoirs de vente au détail et du matériel promotionnel comportant des codes QR reliés à des pages de produits localisées. Les lancements précédents avaient donné lieu à des styles de QR incohérents, à des pannes occasionnelles de numérisation et à un « jeu téléphonique » de la dérive de configuration au fur et à mesure que chaque équipe recréait les codes des captures d\'écran.', 'La solution a tiré parti des liens de configuration partageables d\'ANQR pour établir une seule source de vérité que chaque équipe régionale pouvait accéder, quel que soit leur langage d\'interface. La charge utile QR a utilisé une redirection intelligente qui a détecté la langue utilisateur, de sorte qu\'un code a fonctionné à l\'échelle mondiale tout en fournissant des expériences localisées.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Une carte du monde montrant 12 emplacements de marché avec des codes QR, certains visuellement incompatibles avec les autres',
          caption: 'Le défi : 12 marchés, 8 langues et une histoire de mise en oeuvre incohérente des QR dans les régions',
        },
      ],
    },
    {
      heading: 'Établissement de la configuration principale',
      paragraphs: ['L\'équipe de la marque mondiale a créé la configuration QR autorisée en ANQR : couleurs de marque correspondant à l\'identité visuelle de la ligne de produits, correction d\'erreur H pour la fiabilité de toutes les applications imprimées et numériques, et style qui se reproduireait de façon cohérente, indépendamment des méthodes de production locales. La configuration était verrouillée et le lien de partage documenté dans le mémoire de campagne mondiale.', 'Critiquement, l\'URL encodée utilisait un service de redirection de détection de langue. Lors de la numérisation, les utilisateurs ont été automatiquement redirigés vers leur page de produit en langue locale. Cela signifie que les 12 marchés pourraient utiliser des codes QR identiques - aucune variation de charge utile par marché qui pourrait introduire des erreurs.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'L\'interface ANQR montrant la configuration maître avec les couleurs de marque, ECC H, et l\'URL de redirection intelligente',
          caption: 'La configuration principale : des normes de marque mondiales codées en une seule source de vérité partagée',
        },
      ],
    },
    {
      heading: 'Flux de travail des équipes régionales',
      paragraphs: ['Chaque équipe de marketing régional a reçu le lien de configuration avec des instructions simples: ouvrir le lien, vérifier l\'aperçu correspond aux lignes directrices de la marque, exporter dans le format requis pour votre application. L\'interface ANQR s\'est affichée dans la langue préférée de chaque équipe, mais les paramètres QR sous-jacents sont restés identiques quel que soit le langage d\'interface.', 'Lorsque l\'équipe japonaise avait besoin de SVG pour les affichages haut de gamme et que l\'équipe brésilienne avait besoin de PNG pour les médias sociaux, tous deux exportés de la même configuration. Lorsque le fournisseur d\'impression de l\'équipe allemande a demandé des valeurs de couleur spécifiques, il pouvait se référer directement à la configuration plutôt que de deviner d\'une capture d\'écran.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Captures d\'écran montrant le même lien de configuration ouvert dans les interfaces japonaise, portugaise et allemande',
          caption: 'Même configuration, différentes interfaces : les équipes régionales travaillent dans leur langue préférée tout en maintenant la cohérence mondiale',
        },
      ],
    },
    {
      heading: 'Traitement des variations régionales',
      paragraphs: ['Certains marchés nécessitent des adaptations mineures. L\'équipe chinoise avait besoin d\'une version avec un cadre optimisé WeChat pour le partage social. Plutôt que de modifier le maître, ils ont créé une variante documentée avec son propre lien de configuration, clairement étiquetée « variante CN-WeChat » dans la bibliothèque d\'actifs de campagne. Cela a maintenu la traçabilité tout en permettant la localisation nécessaire.', 'L\'équipe de la marque a établi une règle simple : toute variation par rapport au maître exigeait un nouveau lien de configuration documenté. Aucune modification aux fichiers exportés, aucune correction rapide dans le logiciel de conception. Cela a empêché la dérive de configuration qui avait frappé les lancements précédents.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Une interface de bibliothèque d\'actifs montrant la configuration principale et les variantes régionales approuvées, chacune avec son propre lien',
          caption: 'Gouvernance des actifs de campagne : configuration master plus variantes documentées, toutes traçables via des liens de configuration',
        },
      ],
    },
    {
      heading: 'Résultats du lancement',
      paragraphs: ['La journée de lancement du produit a vu des codes QR déployés simultanément sur les 12 marchés, les écrans de vente au détail, les matériels d\'événements et les campagnes numériques. Des audits de qualité ont confirmé la cohérence visuelle entre les régions - le QR sur le marché de détail de Tokyo correspondait au QR sur l\'emballage de São Paulo correspondant aux bannières de l\'événement de Berlin.', 'Aucun défaut de numérisation n\'a été signalé sur les marchés. Lorsqu\'un changement d\'URL de page de produit après le lancement était nécessaire, le service de redirection le traitait invisiblement - pas de réimpression requise. L\'équipe mondiale a estimé que l\'approche du lien de configuration avait permis d\'économiser plus de 40 heures de temps de coordination par rapport à la méthodologie de lancement précédente.', 'Consultez le guide Learn sur la collaboration interlingue des QR pour connaître les principes de flux de travail qui sous-tendent la cohérence de la campagne mondiale.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Une grille de photographies montrant un déploiement uniforme des QR sur différents marchés : Tokyo de détail, São Paulo packaging, Berlin événements',
          caption: 'Cohérence à l\'échelle mondiale : présentation identique des QR sur 12 marchés malgré les différentes langues, fournisseurs et formats',
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
    { href: '/guide?lang=${lang}', label: 'Ouvrir le guide complet de l\'utilisateur', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Ouvrir la galerie', type: 'gallery' },
  ],
};
