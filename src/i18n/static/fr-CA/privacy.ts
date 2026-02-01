import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Politique de confidentialité',
  description:
    'Les informations recueillies par ANQR, la manière dont elles sont utilisées et vos droits en vertu des lois applicables en matière de confidentialité.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [
    { href: '/terms?lang=${lang}', label: "Conditions d'utilisation", type: 'external' },
  ],
  sections: [
    {
      heading: 'Résumé',
      paragraphs: [
        "ANQR est un générateur de code QR avec une approche axée sur le client. Nous ne vous demandons pas de créer un compte. Par défaut, les codes QR sont générés localement dans votre navigateur – nous n'avons pas accès au contenu que vous encodez.",
        "Pour un usage professionnel, ANQR fournit une API côté serveur qui génère des codes QR à partir des paramètres d'URL. Lorsque vous utilisez l'API, votre contenu QR est traité sur nos serveurs pour restituer l'image, mais n'est ni stocké ni enregistré.",
        "Nous utilisons Google AdSense à des fins publicitaires et pouvons utiliser des services d'analyse. Ces services collectent des informations via des cookies et des technologies similaires. Cette politique explique quelles données sont collectées, comment elles sont utilisées et vos droits.",
      ],
    },
    {
      heading: 'Informations que nous collectons',
      bullets: [
        'Informations que vous fournissez : Si vous nous contactez par e-mail ou via notre formulaire de contact, nous collectons votre nom, votre adresse e-mail et le contenu du message.',
        "Informations collectées automatiquement : notre fournisseur d'hébergement (Netlify), nos partenaires publicitaires et nos services d'analyse peuvent collecter : l'adresse IP, le type et la version du navigateur, le système d'exploitation, le type d'appareil, l'URL de référence, les pages visitées, le temps passé sur le site et l'emplacement géographique approximatif.",
        'Cookies tiers : nos partenaires publicitaires (Google AdSense) utilisent des cookies et des technologies similaires pour diffuser et mesurer les publicités. ANQR lui-même ne définit aucun cookie propriétaire.',
      ],
    },
    {
      heading: 'Cookies et technologies tierces',
      paragraphs: [
        "ANQR ne définit aucun cookie propriétaire. Vos préférences (telles que le mode sombre) sont stockées localement sur votre appareil, qui n'est transmises à aucun serveur.",
        "Cependant, nos partenaires publicitaires (Google AdSense) et notre fournisseur d'hébergement peuvent utiliser des cookies et des technologies de suivi similaires :",
      ],
      bullets: [
        'Cookies publicitaires (tiers) : définis par Google AdSense et les partenaires publicitaires pour diffuser des publicités pertinentes, mesurer les performances des publicités et comprendre les intérêts des utilisateurs. Ces cookies peuvent suivre votre activité sur différents sites Web.',
        "Cookies d'analyse (tiers) : peuvent être utilisés par notre fournisseur d'hébergement ou nos services d'analyse pour collecter des données d'utilisation anonymisées.",
      ],
    },
    {
      heading: 'Google AdSense et la publicité',
      paragraphs: [
        "Nous affichons des publicités via Google AdSense. Google et ses partenaires utilisent des cookies pour diffuser des annonces basées sur votre historique de navigation sur ce site et d'autres sites Web (publicité basée sur les centres d'intérêt).",
        'Découvrez comment Google utilise vos informations : https://policies.google.com/technologies/partner-sites',
        'Gérer la personnalisation des annonces : https://adssettings.google.com',
        'Désinscription via Network Advertising Initiative : https://optout.networkadvertising.org',
        'Désinscription via Digital Advertising Alliance : https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Comment nous utilisons les informations',
      bullets: [
        'Pour répondre à vos demandes et vous accompagner.',
        'Pour afficher des publicités pertinentes via nos partenaires publicitaires.',
        "Pour analyser l'utilisation du site et améliorer nos services.",
        "Détecter, prévenir et résoudre les problèmes de fraude, d'abus et de sécurité.",
        'Pour respecter les obligations légales.',
      ],
    },
    {
      heading: 'Services tiers',
      bullets: [
        'Google AdSense : reçoit des données pour diffuser et mesurer des publicités.',
        "Fournisseurs d'analyses : recevez des données d'utilisation anonymisées.",
        'Netlify (hébergement) : traite les demandes et peut enregistrer les adresses IP.',
        'Nous ne vendons pas vos informations personnelles. Cependant, le partage de données avec des partenaires publicitaires peut être considéré comme une « vente » en vertu du CCPA (voir ci-dessous).',
      ],
    },
    {
      heading: 'Conservation des données',
      bullets: [
        "Soumissions de contact : jusqu'à 2 ans.",
        "Journaux du serveur : jusqu'à 30 jours (hébergeur).",
        "Données analytiques : jusqu'à 26 mois (anonymisées).",
        'Cookies publicitaires : généralement 13 mois (varie selon le partenaire).',
      ],
    },
    {
      heading: "Vos droits en vertu du RGPD (utilisateurs de l'EEE)",
      paragraphs: [
        "Si vous résidez dans l'Espace économique européen, vous disposez des droits suivants en vertu du règlement général sur la protection des données :",
      ],
      bullets: [
        "Droit d'accès : demandez une copie des données personnelles que nous détenons à votre sujet.",
        'Droit de rectification : Demander la correction des données inexactes.',
        "Droit à l'effacement : demander la suppression de vos données (« droit à l'oubli »).",
        'Droit de restreindre le traitement : demandez des limites sur la manière dont nous utilisons vos données.',
        'Droit à la portabilité des données : Demandez vos données dans un format portable.',
        "Droit d'opposition : S'opposer au traitement, y compris à des fins de marketing direct.",
        'Droit de retirer le consentement : retirer le consentement à tout moment lorsque le traitement est basé sur le consentement.',
        'Droit de déposer une plainte : déposez une plainte auprès de votre autorité de protection des données.',
      ],
    },
    {
      heading: 'Base juridique du RGPD',
      paragraphs: [
        "Nous traitons les données sur ces bases : (a) Consentement - pour la publicité personnalisée (gérée par nos partenaires publicitaires) ; (b) Intérêts légitimes : pour l'analyse, la sécurité et l'amélioration ; (c) Contrat – pour répondre aux demandes de renseignements.",
        'Pour exercer vos droits, contactez email@anqr.link. Nous répondons dans les 30 jours.',
      ],
    },
    {
      heading: 'Vos droits en vertu du CCPA (utilisateurs californiens)',
      bullets: [
        'Droit de savoir : demander des informations sur les données collectées, les sources, les finalités et les tiers.',
        'Droit de suppression : Demander la suppression de vos informations personnelles.',
        "Droit de désinscription : désinscription de la « vente » d'informations personnelles (le partage avec des partenaires publicitaires peut être admissible).",
        "Droit à la non-discrimination : Nous ne ferons aucune discrimination dans l'exercice de vos droits.",
      ],
    },
    {
      heading: 'Catégories CCPA collectées',
      paragraphs: [
        "Catégories : Identifiants (adresse IP, identifiant de l'appareil), Activité Internet (navigation, interactions publicitaires), Géolocalisation (approximative), Inférences (intérêts de la navigation).",
        'Pour exercer vos droits ou vous désinscrire : email@anqr.link ou ajuster les paramètres des cookies.',
      ],
    },
    {
      heading: 'Virements internationaux',
      paragraphs: [
        'Vos informations peuvent être transférées vers des pays dotés de lois différentes sur la protection des données, notamment les États-Unis. Nous utilisons des garanties appropriées telles que des clauses contractuelles types.',
      ],
    },
    {
      heading: 'La vie privée des enfants',
      paragraphs: [
        "L'ANQR ne s'adresse pas aux enfants de moins de 13 ans (ou 16 ans dans l'EEE). Nous ne collectons pas sciemment de données auprès des enfants. Contactez email@anqr.link si vous pensez qu'un enfant a fourni des informations.",
      ],
    },
    {
      heading: 'Sécurité',
      paragraphs: [
        "Nous utilisons des mesures techniques et organisationnelles appropriées pour protéger les données, y compris le cryptage HTTPS. Cependant, aucune transmission Internet n'est sécurisée à 100 %.",
      ],
    },
    {
      heading: 'Ne pas suivre',
      paragraphs: [
        'Nous respectons les signaux du navigateur Do Not Track dans la mesure du possible, bien que les partenaires publicitaires puissent ne pas répondre au DNT.',
      ],
    },
    {
      heading: 'Modifications de cette politique',
      paragraphs: [
        'Nous pouvons mettre à jour cette politique périodiquement. La date « Dernière mise à jour » indique la révision la plus récente. Des changements importants peuvent être communiqués via une bannière du site.',
      ],
    },
    {
      heading: 'Contactez-nous',
      paragraphs: [
        'Pour des questions de confidentialité ou pour exercer vos droits : email@anqr.link ou utilisez notre page Contact. Nous répondons aux demandes de confidentialité dans les 30 jours.',
      ],
    },
    {
      heading: 'Politique de confidentialité complète',
      paragraphs: [
        "Cette page fournit un résumé de nos pratiques en matière de confidentialité. Pour obtenir la politique de confidentialité complète et juridiquement contraignante avec tous les détails sur le traitement des données, vos droits et nos obligations en vertu du RGPD, du CCPA et d'autres lois sur la confidentialité, veuillez consulter notre politique complète hébergée par iubenda.",
      ],
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
