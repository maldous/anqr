import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Conditions d\'utilisation',
  description: 'En accédant ou en utilisant le site, vous acceptez d\'être lié par ces conditions.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Politique de confidentialité', type: 'external' }],
  sections: [
    {
      heading: 'Acceptation des conditions',
      paragraphs: ['En accédant ou en utilisant ANQR (anqr.link), vous acceptez d\'être lié par ces conditions d\'utilisation et notre politique de confidentialité. Si vous n\'acceptez pas ces conditions, n\'utilisez pas le site.', 'Nous pouvons mettre à jour ces conditions de temps à autre. La poursuite de l\'utilisation du site après des modifications constitue l\'acceptation des nouvelles conditions.'],
    },
    {
      heading: 'Admissibilité',
      paragraphs: ['Vous devez avoir au moins 13 ans pour utiliser l\'ANQR. En utilisant le site, vous déclarez que vous remplissez cette condition d\'âge. Si vous avez moins de 18 ans, vous déclarez que vous avez l\'autorisation de votre parent ou tuteur pour utiliser le site.'],
    },
    {
      heading: 'Utilisation autorisée',
      paragraphs: ['Vous pouvez utiliser ANQR uniquement à des fins licites. Vous êtes seul responsable du contenu que vous encodez dans les codes QR et de la manière dont vous utilisez les codes QR que vous générez.'],
    },
    {
      heading: 'Comportement interdit',
      paragraphs: ['Vous vous engagez à ne pas :'],
      bullets: ['Utilisez ANQR pour créer des codes QR qui facilitent le phishing, la distribution de logiciels malveillants, la fraude, les escroqueries, le harcèlement, la diffamation ou toute activité illégale.', 'Encodez du contenu qui enfreint les droits de propriété intellectuelle, viole la vie privée ou contient du matériel illégal.', 'Tenter de perturber, de surcharger ou d\'interférer avec le fonctionnement ou la sécurité du site.', 'Faites de l\'ingénierie inverse, décompilez ou tentez d\'extraire le code source du site.', 'Utilisez des outils automatisés (bots, scrapers) pour accéder au site d\'une manière qui dégrade les performances des autres utilisateurs.', 'Contourner ou désactiver toute fonctionnalité de sécurité ou de contrôle d\'accès.', 'Usurer l\'identité d\'une personne ou d\'une entité ou déformer votre affiliation.'],
    },
    {
      heading: 'Propriété intellectuelle',
      paragraphs: ['Vous conservez la propriété du contenu que vous encodez dans les codes QR. ANQR ne revendique pas la propriété de vos données.', 'Le nom, le logo, la conception de l\'interface et le code sous-jacent de l\'ANQR sont protégés par les lois sur le droit d\'auteur, les marques commerciales et d\'autres lois sur la propriété intellectuelle. Vous ne pouvez pas copier, modifier, distribuer ou créer des œuvres dérivées sans notre autorisation.', 'QR Code® est une marque déposée de DENSO WAVE INCORPORATED. ANQR n\'est pas affilié à DENSO WAVE.'],
    },
    {
      heading: 'Licence de contenu utilisateur',
      paragraphs: ['En utilisant ANQR, vous ne nous accordez aucun droit sur votre contenu. Lorsque vous utilisez la génération locale (par défaut), toute la génération de code QR se produit dans votre navigateur et nous n\'accédons pas, ne stockons pas et ne transmettons pas vos données codées.', 'Lorsque vous utilisez l\'API côté serveur, votre contenu est traité pour générer l\'image QR mais n\'est pas stocké, enregistré ou utilisé à d\'autres fins que le rendu de l\'image demandée.'],
    },
    {
      heading: 'Services tiers et publicité',
      paragraphs: ['Le site affiche des publicités via Google AdSense et peut inclure des liens vers des sites Web tiers. Nous ne sommes pas responsables du contenu, des services ou des pratiques de confidentialité de tiers.', 'Vos interactions avec les annonceurs et les tiers se font uniquement entre vous et eux. Consultez notre Politique de confidentialité pour plus d\'informations sur les pratiques en matière de données publicitaires.'],
    },
    {
      heading: 'Exclusion de garanties',
      paragraphs: ['ANQR EST FOURNI « TEL QUEL » ET « SELON LA DISPONIBILITÉ » SANS GARANTIE D\'AUCUNE SORTE, EXPRESSE OU IMPLICITE, Y COMPRIS MAIS SANS LIMITATION LES GARANTIES IMPLICITES DE QUALITÉ MARCHANDE, D\'ADAPTATION À UN USAGE PARTICULIER ET DE NON-VIOLATION.', 'Nous ne garantissons pas que : (a) le site sera ininterrompu, sécurisé ou sans erreur ; (b) Les codes QR seront scannés dans tous les environnements, sur tous les appareils ou avec toutes les applications de numérisation ; (c) le site répondra à vos exigences.', 'Vous devez toujours tester les codes QR dans les conditions dans lesquelles ils seront utilisés (taille d\'impression, éclairage, type d\'écran, distance, qualité de la caméra).'],
    },
    {
      heading: 'Limitation de responsabilité',
      paragraphs: ['DANS TOUTE LA MESURE PERMISE PAR LA LOI, ANQR ET SES OPÉRATEURS, SOCIÉTÉS AFFILIÉES ET CONCÉDANTS DE LICENCE NE SERONT PAS TENUS RESPONSABLES DE TOUT DOMMAGE DIRECT, INDIRECT, ACCESSOIRE, SPÉCIAL, CONSÉCUTIF, PUNITIF OU EXEMPLAIRE, Y COMPRIS, MAIS SANS LIMITATION, LES DOMMAGES POUR PERTE DE PROFITS, DE REVENUS, DE DONNÉES, DE GOODWILL, D\'UTILISATION OU AUTRES. PERTES INCORPORELLES, DÉCOULANT DE OU LIÉES À VOTRE ACCÈS OU À VOTRE UTILISATION (OU À VOTRE INCAPACITÉ D\'ACCÉDER OU D\'UTILISER) LE SERVICE.', 'VOUS COMPRENEZ ET ACCEPTEZ EXPRESSÉMENT QUE VOTRE UTILISATION DU SERVICE EST À VOS PROPRES RISQUES. LE SERVICE EST FOURNI GRATUITEMENT ET, PAR CONSÉQUENT, VOUS ACCEPTEZ QUE ANQR ET SES OPÉRATEURS NE SERONT AUCUNE RESPONSABILITÉ ENVERS VOUS POUR TOUT DOMMAGE OU PERTE. EN AUCUN CAS NOTRE RESPONSABILITÉ GLOBALE TOTALE NE DEPASSERA ZÉRO DOLLARS (0 AUD).', 'VOUS ACCEPTEZ DE LIBÉRER, RENONCER ET DÉCHARGER TOUTES LES RÉCLAMATIONS, DEMANDES ET CAUSES D\'ACTION CONTRE ANQR ET SES OPÉRATEURS DÉCOULANT DE VOTRE UTILISATION DU SERVICE.', 'CERTAINES JURIDICTIONS N\'AUTORISENT PAS L\'EXCLUSION DE CERTAINES GARANTIES OU LIMITATIONS DE RESPONSABILITÉ. DANS DE TELLES JURIDICTIONS, NOTRE RESPONSABILITÉ SERA LIMITÉE DANS LA MESURE MAXIMALE AUTORISÉE PAR LA LOI APPLICABLE.'],
    },
    {
      heading: 'Indemnisation',
      paragraphs: ['Vous acceptez d\'indemniser, de défendre et de dégager de toute responsabilité ANQR, ses opérateurs, ses sociétés affiliées et leurs dirigeants, administrateurs, employés et agents respectifs de toute réclamation, dommage, perte, responsabilité, coût et dépense (y compris les frais juridiques) découlant de : (a) votre utilisation du site ; (b) votre violation des présentes Conditions ; (c) votre violation de tout droit de tiers ; (d) tout contenu que vous encodez dans des codes QR.'],
    },
    {
      heading: 'Résolution des litiges',
      paragraphs: ['Tout litige découlant des présentes Conditions ou de votre utilisation d\'ANQR doit d\'abord être résolu par une négociation informelle en contactant email@anqr.link.', 'Si une résolution informelle échoue, les litiges seront résolus par arbitrage exécutoire à Victoria, en Australie, sauf que l\'une ou l\'autre des parties pourra demander une injonction au tribunal pour violation de la propriété intellectuelle.'],
    },
    {
      heading: 'Renonciation au recours collectif',
      paragraphs: ['DANS LA MESURE AUTORISÉE PAR LA LOI, VOUS ACCEPTEZ QUE TOUTE PROCÉDURE DE RÈGLEMENT DES DIFFÉRENDS SERA CONDUITE UNIQUEMENT SUR UNE BASE INDIVIDUELLE ET NON DANS LE CADRE D\'UNE ACTION COLLECTIVE, CONSOLIDÉE OU REPRÉSENTATIVE.'],
    },
    {
      heading: 'Loi applicable',
      paragraphs: ['Ces conditions sont régies par les lois de Victoria, en Australie, sans égard aux principes de conflit de lois. Vous consentez à la compétence exclusive des tribunaux situés à Victoria, en Australie.'],
    },
    {
      heading: 'Changements et disponibilité',
      paragraphs: ['Nous pouvons modifier, suspendre ou interrompre le site (ou toute partie de celui-ci) à tout moment sans préavis ni responsabilité.', 'Nous pouvons mettre à jour ces Conditions à tout moment. La date « Dernière mise à jour » indique la date de leur dernière révision. L\'utilisation continue après les modifications constitue une acceptation.'],
    },
    {
      heading: 'Divisibilité',
      paragraphs: ['Si une disposition des présentes Conditions est jugée invalide ou inapplicable, cette disposition sera appliquée dans toute la mesure permise, et les dispositions restantes resteront pleinement en vigueur.'],
    },
    {
      heading: 'Renonciation',
      paragraphs: ['Notre incapacité à faire respecter un droit ou une disposition des présentes Conditions ne sera pas considérée comme une renonciation à ce droit ou à cette disposition.'],
    },
    {
      heading: 'Intégralité de l\'accord',
      paragraphs: ['Ces conditions, ainsi que notre politique de confidentialité, constituent l\'intégralité de l\'accord entre vous et ANQR concernant votre utilisation du site et remplacent tout accord antérieur.'],
    },
    {
      heading: 'Force majeure',
      paragraphs: ['Nous ne serons pas responsables de tout échec ou retard d\'exécution dû à des circonstances indépendantes de notre volonté, notamment les catastrophes naturelles, la guerre, le terrorisme, les émeutes, les actions gouvernementales ou les pannes d\'Internet/de l\'infrastructure.'],
    },
    {
      heading: 'Contacter',
      paragraphs: ['Les questions concernant ces Conditions peuvent être envoyées à : email@anqr.link'],
    },
  ],
};

export default terms;
