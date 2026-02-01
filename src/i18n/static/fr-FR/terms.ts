import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Conditions d\'utilisation',
  description: 'En accédant ou en utilisant le site, vous acceptez d\'être lié par ces conditions.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Politique de confidentialité', type: 'external' }],
  sections: [
    {
      heading: 'Acceptation des termes',
      paragraphs: ['En accédant ou en utilisant ANQR (anqr.link), vous acceptez d\'être lié par les présentes Conditions d\'utilisation et notre Politique de confidentialité. Si vous n\'acceptez pas ces conditions, n\'utilisez pas le site.', 'Nous pouvons mettre à jour ces Conditions de temps à autre. L\'utilisation continue du site après les changements constitue l\'acceptation des nouvelles conditions.'],
    },
    {
      heading: 'Éligibilité',
      paragraphs: ['Vous devez avoir au moins 13 ans pour utiliser ANQR. En utilisant le site, vous représentez que vous répondez à cette exigence d\'âge. Si vous avez moins de 18 ans, vous déclarez avoir la permission de votre parent ou tuteur d\'utiliser le site.'],
    },
    {
      heading: 'Utilisation autorisée',
      paragraphs: ['Vous pouvez utiliser ANQR à des fins licites seulement. Vous êtes uniquement responsable du contenu que vous codez dans les codes QR et de la façon dont vous utilisez les codes QR que vous générez.'],
    },
    {
      heading: 'Conduite interdite',
      paragraphs: ['Vous acceptez de ne pas :'],
      bullets: ['Utilisez ANQR pour créer des codes QR qui facilitent l\'hameçonnage, la distribution de logiciels malveillants, la fraude, les escroqueries, le harcèlement, la diffamation ou toute activité illégale.', 'Encoder le contenu qui porte atteinte aux droits de propriété intellectuelle, viole la vie privée ou contient du matériel illégal.', 'Tenter de perturber, de surcharger ou d\'entraver l\'exploitation ou la sécurité du site.', 'Ingénieur inverse, décompilez ou essayez d\'extraire le code source du site.', 'Utilisez des outils automatisés (bots, racleurs) pour accéder au site d\'une manière qui dégrade les performances pour les autres utilisateurs.', 'Contourner ou désactiver toute fonction de sécurité ou de contrôle d\'accès.', 'Imposer une personne ou une entité ou présenter faussement votre affiliation.'],
    },
    {
      heading: 'Propriété intellectuelle',
      paragraphs: ['Vous conservez la propriété du contenu que vous codez dans les codes QR. ANQR ne revendique pas la propriété de vos données.', 'Le nom, le logo, la conception de l\'interface et le code sous-jacent de l\'ANQR sont protégés par le droit d\'auteur, la marque de commerce et d\'autres lois sur la propriété intellectuelle. Vous ne pouvez pas copier, modifier, distribuer ou créer des oeuvres dérivées sans notre autorisation.', 'QR Code® est une marque déposée de DENSO WAVE INCORPORATED. ANQR n\'est pas affiliée à DENSO WAVE.'],
    },
    {
      heading: 'Licence de contenu utilisateur',
      paragraphs: ['En utilisant ANQR, vous ne nous accordez aucun droit sur votre contenu. Lorsque vous utilisez la génération locale (par défaut), toute la génération de code QR se produit dans votre navigateur et nous n\'avons pas accès, stocké ou transmis vos données encodées.', 'Lors de l\'utilisation de l\'API côté serveur, votre contenu est traité pour générer l\'image QR, mais n\'est pas stocké, enregistré ou utilisé à d\'autres fins que le rendu de l\'image demandée.'],
    },
    {
      heading: 'Services de tiers et publicité',
      paragraphs: ['Le site affiche des publicités via Google AdSense et peut inclure des liens vers des sites tiers. Nous ne sommes pas responsables du contenu, des services ou des pratiques de confidentialité de tiers.', 'Vos interactions avec les annonceurs et les tiers sont uniquement entre vous et eux. Consultez notre politique de confidentialité pour obtenir des renseignements sur les pratiques en matière de données publicitaires.'],
    },
    {
      heading: 'Avertissement des garanties',
      paragraphs: ['ANQR EST PREVUE SUR UNE BASE "AS IS" ET "AS DISPONIBLE" SANS GARANTIES D\'UNE FEUILLE, D\'EXPRESSION OU D\'IMPLIE, Y COMPRIS LES GARANTIES NON LIMITES AUX GARANTIES IMPLIÉES DE MERCHANTABILITÉ, D\'AIDE POUR UN OBJET PARTICULIER ET DE NON-INFRING.', 'Nous ne garantissons pas que : a) le site sera ininterrompu, sécurisé ou sans erreur; b) les codes QR seront analysés dans tous les environnements, sur tous les appareils ou avec toutes les applications de scanner; c) le site répondra à vos exigences.', 'Vous devriez toujours tester les codes QR dans les conditions où ils seront utilisés (taille d\'impression, éclairage, type d\'écran, distance, qualité de la caméra).'],
    },
    {
      heading: 'Limitation de la responsabilité',
      paragraphs: ['À L\'EXTENT MAXIMAL PERMIS PAR LA LOI, L\'ANQR ET SES OPÉRATEURS, LES AFFILIATES ET LES LICENSEURS NE SONT PAS LIABLES À DES DIRECTS, INDIRECTS, INCIDENTS, SPÉCIAUX, CONSÉQUENTIELS, PUNITIFS OU EXEMPLAIRES, NOTAMMENT PAS LIMITÉS AUX DOMMAGES POUR LORS DE PROFITS, REVENUS, DONNÉES, GOODWILL, UTILISATION OU AUTRES LISSES INTANGIBLES, SOUMISES OU CONNEXES À VOTRE ACCÈS AU SERVICE OU À VOTRE UTILISATION (OU À L\'INABILITÉ D\'ACCÈS OU À L\'UTILISATION).', 'VOUS COMPRENEZ TRÈS BIEN QUE VOTRE UTILISATION DU SERVICE EST À VOTRE PLACE. LE SERVICE EST GRATUIT, ET VOUS ÊTES D\'ACCORD POUR DIRE QU\'ANQR ET SES OPÉRATEURS N\'ONT AUCUNE RESPONSABILITÉ POUR VOUS, QUOI QU\'IL EN SOIT, POUR DES DAMAGES OU DES PERTES. AUCUN ÉVÉNEMENT N\'ARRÊT DE NOTRE RESPONSABILITÉ AGRÉGÉE TOTALE EXCEDE ZÉRO DOLLARS (0 AUD $).', 'VOUS ACCEPTEZ DE LIBÉRER, DE RECEVOIR ET DE DÉCHIFFRER TOUTES LES RÉCLAMATIONS, LES DEMANDES ET LES CAUSES D\'ACTION CONTRE ANQR ET SES OPÉRATEURS QUI DÉCOULENT DE VOTRE UTILISATION DU SERVICE.', 'QUELQUES JURIDICTIONS N\'ALLUMENT PAS L\'EXCLUSION DE CERTAINES GARANTIES OU LIMITES DE RESPONSABILITÉ. DANS CES JURIDICTIONS, NOTRE RESPONSABILITÉ EST LIMITÉE À L\'EXTENT MAXIMAL PERMIS PAR LE DROIT APPLICABLE.'],
    },
    {
      heading: 'Indemnisation',
      paragraphs: ['Vous acceptez d\'indemniser, de défendre et de tenir inoffensif ANQR, ses exploitants, ses affiliés et leurs dirigeants, administrateurs, employés et mandataires respectifs de toute réclamation, dommage, perte, responsabilité, coûts et dépenses (y compris les frais juridiques) découlant : a) de votre utilisation du site; b) de votre violation des présentes Conditions; c) de votre violation des droits de tiers; d) de tout contenu que vous codez dans les codes QR.'],
    },
    {
      heading: 'Règlement des différends',
      paragraphs: ['Tout différend découlant des présentes Conditions ou de votre utilisation de l\'ANQR doit d\'abord être résolu par une négociation informelle en communiquant avec email@anqr.link.', 'En cas d\'échec d\'un règlement informel, les différends seront réglés par voie d\'arbitrage obligatoire à Victoria (Australie), sauf que l\'une ou l\'autre des parties peut demander une mesure d\'injonction devant les tribunaux pour violation de la propriété intellectuelle.'],
    },
    {
      heading: 'Exemption pour actions collectives',
      paragraphs: ['À L\'EXTENT PERMIS PAR LA LOI, VOUS CONVIENTS QUE TOUTE PROCÉDURE DE RÉSOLUTION DIFFUSION NE SERA CONDUITEE QUE SUR UNE BASE INDIVIDUELLE ET NON DANS UNE CLASSE, CONSOLIDÉE, OU REPRESENTATIVE.'],
    },
    {
      heading: 'Droit applicable',
      paragraphs: ['Ces Conditions sont régies par les lois de Victoria, Australie, sans égard aux principes de conflit de lois. Vous consentez à la compétence exclusive des tribunaux de Victoria, en Australie.'],
    },
    {
      heading: 'Changements et disponibilité',
      paragraphs: ['Nous pouvons modifier, suspendre ou interrompre le site (ou une partie de celui-ci) à tout moment sans préavis ni responsabilité.', 'Nous pouvons mettre à jour ces Conditions à tout moment. La date de la dernière mise à jour indique le moment où elles ont été révisées. L\'utilisation continue après modification constitue une acceptation.'],
    },
    {
      heading: 'Séparabilité',
      paragraphs: ['Si une disposition des présentes Conditions est jugée invalide ou inapplicable, cette disposition sera appliquée dans toute la mesure permise, et les autres dispositions demeureront pleinement en vigueur.'],
    },
    {
      heading: 'Renonciation',
      paragraphs: ['Notre non-respect de tout droit ou disposition des présentes Conditions ne sera pas considéré comme une renonciation à ce droit ou disposition.'],
    },
    {
      heading: 'Accord complet',
      paragraphs: ['Ces Conditions, ainsi que notre Politique de confidentialité, constituent l\'ensemble de l\'accord entre vous et ANQR concernant votre utilisation du site et remplacent tout accord préalable.'],
    },
    {
      heading: 'Force majeure',
      paragraphs: ['Nous ne serons pas responsables de tout échec ou retard dans l\'exécution en raison de circonstances indépendantes de notre contrôle raisonnable, y compris les catastrophes naturelles, la guerre, le terrorisme, les émeutes, les actions gouvernementales ou les défaillances d\'Internet/infrastructure.'],
    },
    {
      heading: 'Personne à contacter',
      paragraphs: ['Les questions concernant ces Termes peuvent être envoyées à : '],
    },
  ],
};

export default terms;
