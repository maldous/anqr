import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Politique de confidentialité',
  description: 'Information L\'ANQR recueille, comment elle est utilisée et vos droits en vertu des lois applicables sur la protection des renseignements personnels.',
  lastUpdated: '1 février 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Conditions d\'utilisation', type: 'external' }],
  sections: [
    {
      heading: 'Résumé',
      paragraphs: ['ANQR est un générateur de code QR avec une première approche client. Nous n\'exigeons pas que vous créiez un compte. Par défaut, les codes QR sont générés localement dans votre navigateur - nous n\'avons pas accès au contenu que vous encodez.', 'Pour une utilisation professionnelle, ANQR fournit une API côté serveur qui génère des codes QR à partir de paramètres URL. Lors de l\'utilisation de l\'API, votre contenu QR est traité sur nos serveurs pour rendre l\'image, mais n\'est ni stocké ni enregistré.', 'Nous utilisons Google AdSense pour la publicité et pouvons utiliser des services d\'analyse. Ces services collectent des informations par l\'intermédiaire de cookies et de technologies similaires. Cette politique explique quelles données sont collectées, comment elles sont utilisées et vos droits.'],
    },
    {
      heading: 'Informations que nous recueillons',
      bullets: ['Renseignements que vous fournissez : Si vous nous contactez par e-mail ou par notre formulaire de contact, nous recueillons votre nom, votre adresse e-mail et le contenu du message.', 'Informations collectées automatiquement: Notre fournisseur d\'hébergement (Netlify), nos partenaires publicitaires et nos services d\'analyse peuvent collecter : adresse IP, type et version du navigateur, système d\'exploitation, type d\'appareil, URL de référence, pages visitées, heure sur le site et emplacement géographique approximatif.', 'Cookies tiers: Nos partenaires publicitaires (Google AdSense) utilisent des cookies et des technologies similaires pour servir et mesurer les publicités. ANQR lui-même ne définit pas de cookies de première partie.'],
    },
    {
      heading: 'Cookies et technologies tierces',
      paragraphs: ['ANQR ne définit pas de cookies de première partie. Vos préférences (comme le mode sombre) sont stockées localement sur votre appareil, qui n\'est transmis à aucun serveur.', 'Cependant, nos partenaires publicitaires (Google AdSense) et nos fournisseurs d\'hébergement peuvent utiliser des cookies et des technologies de suivi similaires:'],
      bullets: ['Cookies publicitaires (tiers): Set by Google AdSense et partenaires publicitaires pour servir des publicités pertinentes, mesurer les performances publicitaires, et comprendre les intérêts des utilisateurs. Ces cookies peuvent suivre votre activité sur différents sites Web.', 'Cookies analytiques (tiers): Peut être utilisé par notre fournisseur d\'hébergement ou nos services d\'analyse pour collecter des données d\'utilisation anonymes.'],
    },
    {
      heading: 'Google AdSense et la publicité',
      paragraphs: ['Nous affichons des publicités via Google AdSense. Google et ses partenaires utilisent des cookies pour servir des annonces basées sur votre historique de navigation sur ce site et d\'autres sites Web (publicité axée sur les intérêts).', 'Découvrez comment Google utilise vos informations: https://policies.google.com/technologies/partner-sites', 'Gérer la personnalisation publicitaire : https://adssettings.google.com', 'Optez pour la publicité en réseau: https://optout.networkadvertising.org', 'Opt out via Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Comment nous utilisons l\'information',
      bullets: ['Pour répondre à vos demandes et fournir un soutien.', 'Pour afficher les publicités pertinentes par l\'intermédiaire de nos partenaires publicitaires.', 'Analyser l\'utilisation du site et améliorer nos services.', 'Détecter, prévenir et régler les problèmes de fraude, d\'abus et de sécurité.', 'Respecter les obligations légales.'],
    },
    {
      heading: 'Services de tiers',
      bullets: ['Google AdSense: reçoit des données pour servir et mesurer des publicités.', 'Fournisseurs d\'analyse: Recevez des données d\'utilisation anonymisées.', 'Netlify (hébergement): Traite les requêtes et peut enregistrer les adresses IP.', 'Nous ne vendons pas vos renseignements personnels. Cependant, le partage de données avec des partenaires publicitaires peut être considéré comme une « vente » en vertu de la LCPAC (voir ci-dessous).'],
    },
    {
      heading: 'Conservation des données',
      bullets: ['Demandes de contact: Jusqu\'à 2 ans.', 'Registres du serveur & #160;: Jusqu\'à 30 jours (fournisseur d\'hébergement).', 'Données analytiques: Jusqu\'à 26 mois (anonymisé).', 'Cookies publicitaires: Typiquement 13 mois (varie par partenaire).'],
    },
    {
      heading: 'Vos droits au titre du RGPD (utilisateurs de l\'EEE)',
      paragraphs: ['Si vous êtes dans l\'Espace économique européen, vous disposez des droits suivants en vertu du règlement général sur la protection des données:'],
      bullets: ['Droit d\'accès: Demander une copie des données personnelles que nous détenons à votre sujet.', 'Droit de rectification: Demander la correction de données inexactes.', 'Droit à l\'effacement : Demandez la suppression de vos données (« droit à l\'oubli »).', 'Droit de restreindre le traitement: Demandez des limites sur la façon dont nous utilisons vos données.', 'Droit à la portabilité des données: Demandez vos données en format portable.', 'Droit d\'opposition : Objet à la transformation, y compris pour la commercialisation directe.', 'Droit de retirer son consentement: Retirez le consentement à tout moment où le traitement est fondé sur le consentement.', 'Droit de porter plainte: Déposez une plainte auprès de votre autorité de protection des données.'],
    },
    {
      heading: 'Base juridique du RGPD',
      paragraphs: ['Nous traitons les données sur ces bases : a) Consentement - pour la publicité personnalisée (géré par nos partenaires publicitaires); b) Intérêts légitimes - pour l\'analyse, la sécurité et l\'amélioration; c) Contrat - pour répondre aux demandes de renseignements.', 'Pour exercer vos droits, contactez email@anqr.link__. Nous répondons dans les 30 jours.'],
    },
    {
      heading: 'Vos droits en vertu de la CCPA (utilisateurs de Californie)',
      bullets: ['Droit de savoir : Demander des renseignements sur les données recueillies, les sources, les fins et les tiers.', 'Droit de supprimer: Demandez la suppression de vos renseignements personnels.', 'Droit de refuser : Optez pour la « vente » de renseignements personnels (le partage avec les partenaires publicitaires peut être admissible).', 'Droit à la non-discrimination: Nous ne ferons pas de discrimination pour avoir exercé vos droits.'],
    },
    {
      heading: 'Catégories de PCCA collectées',
      paragraphs: ['Catégories : Identification (adresse IP, identifiant du périphérique), activité Internet (navigation, interactions publicitaires), géolocalisation (approximation), Inférences (intérêts de navigation).', 'Pour exercer des droits ou refuser : email@anqr.link_ ou ajuster les paramètres des cookies.'],
    },
    {
      heading: 'Transferts internationaux',
      paragraphs: ['Vos informations peuvent être transférées à des pays ayant des lois différentes en matière de protection des données, y compris aux États-Unis. Nous utilisons des mesures de protection appropriées comme les clauses contractuelles types.'],
    },
    {
      heading: 'Vie privée des enfants',
      paragraphs: ['ANQR n\'est pas destiné aux enfants de moins de 13 ans (ou 16 ans dans l\'EEE). Nous ne recueillons pas sciemment les données des enfants. Communiquez avec email@anqr.link si vous croyez qu\'un enfant a fourni des renseignements.'],
    },
    {
      heading: 'Sécurité',
      paragraphs: ['Nous utilisons des mesures techniques et organisationnelles appropriées pour protéger les données, y compris le chiffrement HTTPS. Cependant, aucune transmission Internet n\'est 100% sécurisée.'],
    },
    {
      heading: 'Ne pas suivre',
      paragraphs: ['Nous honorons ne pas suivre les signaux du navigateur lorsque cela est possible, bien que les partenaires publicitaires ne répondent pas à la VNT.'],
    },
    {
      heading: 'Changements apportés à cette politique',
      paragraphs: ['Nous pouvons mettre cette politique à jour périodiquement. La date de la dernière mise à jour indique la dernière révision. Des changements importants peuvent être communiqués via une bannière de site.'],
    },
    {
      heading: 'Contactez-nous',
      paragraphs: ['Pour des questions de confidentialité ou pour exercer vos droits : email@anqr.link ou utilisez notre page de contact. Nous répondons aux demandes de confidentialité dans les 30 jours.'],
    },
    {
      heading: 'Politique de confidentialité complète',
      paragraphs: ['Cette page fournit un résumé de nos pratiques en matière de confidentialité. Pour obtenir la politique de confidentialité complète et juridiquement contraignante avec tous les détails sur le traitement des données, vos droits et nos obligations en vertu du RGPD, du CCPA et d\'autres lois sur la confidentialité, veuillez consulter notre politique complète hébergée par iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Voir la politique de confidentialité complète sur iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
