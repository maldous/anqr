import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Privacybeleid',
  description:
    'Informatie ANQR verzamelt, hoe het wordt gebruikt, en uw rechten onder toepasselijke privacywetgeving.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Servicevoorwaarden', type: 'external' }],
  sections: [
    {
      heading: 'Samenvatting',
      paragraphs: [
        'ANQR is een QR-codegenerator met een klantgerichte aanpak. Wij vereisen niet dat u een account aanmaakt. Standaard worden QR-codes lokaal in uw browser gegenereerd. Wij hebben geen toegang tot de inhoud die u codeert.',
        'Voor professioneel gebruik biedt ANQR een server-side API die QR-codes genereert op basis van URL-parameters. Wanneer u de API gebruikt, wordt uw QR-inhoud op onze servers verwerkt om de afbeelding weer te geven, maar niet opgeslagen of gelogd.',
        'We gebruiken Google AdSense voor reclame en kunnen gebruik maken van analytische diensten. Deze diensten verzamelen informatie via cookies en soortgelijke technologieën. Dit beleid legt uit welke gegevens worden verzameld, hoe het wordt gebruikt, en uw rechten.',
      ],
    },
    {
      heading: 'Informatie die we verzamelen',
      bullets: [
        'Informatie die u verstrekt: Als u contact met ons opneemt via e-mail of ons contactformulier, verzamelen wij uw naam, e-mailadres en berichtinhoud.',
        "Automatisch verzamelde informatie: Onze hosting provider (Netlify), advertising partners, en analytics diensten kunnen verzamelen: IP-adres, browser type en versie, besturingssysteem, apparaattype, verwijzende URL, bezochte pagina's, tijd ter plaatse, en bij benadering geografische locatie.",
        'Cookies van derden: Onze reclamepartners (Google AdSense) gebruiken cookies en soortgelijke technologieën om advertenties te kunnen weergeven en meten. ANQR zelf stelt geen first-party cookies in.',
      ],
    },
    {
      heading: 'Cookies en technologieën van derden',
      paragraphs: [
        'ANQR stelt geen first-party cookies in. Uw voorkeuren (zoals donkere modus) worden lokaal opgeslagen op uw apparaat, dat niet wordt verzonden naar een server.',
        'Onze reclamepartners (Google AdSense) en hostingprovider kunnen echter cookies en soortgelijke trackingtechnologieën gebruiken:',
      ],
      bullets: [
        'Reclamecookies (derde partij): Set van Google AdSense en advertentiepartners om relevante advertenties te bedienen, advertentieprestaties te meten en gebruikersbelangen te begrijpen. Deze cookies kunnen uw activiteiten op verschillende websites bijhouden.',
        'Analysecookies (derden): Kunnen door onze hostingprovider of analysediensten worden gebruikt om geanonimiseerde gebruiksgegevens te verzamelen.',
      ],
    },
    {
      heading: 'Google AdSense en reclame',
      paragraphs: [
        'We tonen advertenties via Google AdSense. Google en haar partners gebruiken cookies om advertenties te tonen op basis van uw browsergeschiedenis op deze site en andere websites (op rente gebaseerde reclame).',
        'Leer hoe Google uw informatie gebruikt: https://policies.google.com/technologies/partner-sites',
        'Beheer ad-personalisatie: https://adsettings.google.com',
        'Opt out via Network Advertising Initiative: https://optout.networkadvertising.org',
        'Opt out via Digital Advertising Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Hoe we informatie gebruiken',
      bullets: [
        'Om te reageren op uw vragen en ondersteuning te bieden.',
        'Om relevante advertenties te tonen via onze reclamepartners.',
        'Om het gebruik van de site te analyseren en onze diensten te verbeteren.',
        'Het opsporen, voorkomen en aanpakken van fraude, misbruik en veiligheidskwesties.',
        'Om te voldoen aan wettelijke verplichtingen.',
      ],
    },
    {
      heading: 'Diensten van derden',
      bullets: [
        'Google AdSense: ontvangt gegevens om advertenties te dienen en te meten.',
        'Analyseleveranciers: Ontvang geanonimiseerde gebruiksgegevens.',
        'Netlify (hosting): Verhandelt verzoeken en kan IP-adressen loggen.',
        'Wij verkopen uw persoonlijke gegevens niet. Het delen van gegevens met reclamepartners kan echter worden beschouwd als een "verkoop" in het kader van CCPA (zie hieronder).',
      ],
    },
    {
      heading: 'Gegevensbewaring',
      bullets: [
        'Opmerkingen: Tot 2 jaar.',
        'Serverlogs: Tot 30 dagen (hosting provider).',
        'Analysegegevens: Tot 26 maanden (geanonimiseerd).',
        'Reclamecookies: Meestal 13 maanden (varieert per partner).',
      ],
    },
    {
      heading: 'Uw rechten onder AVG (EER-gebruikers)',
      paragraphs: [
        'Als u lid bent van de Europese Economische Ruimte, hebt u de volgende rechten krachtens de Algemene Verordening Gegevensbescherming:',
      ],
      bullets: [
        'Recht van toegang: Vraag een kopie aan van uw persoonlijke gegevens.',
        'Recht op rectificatie: Verzoek om correctie van onjuiste gegevens.',
        'Recht op wissing: Verzoek om verwijdering van uw gegevens ("recht om te worden vergeten").',
        'Recht om verwerking te beperken: Vraag limieten aan voor het gebruik van uw gegevens.',
        'Recht op gegevensportabiliteit: Vraag uw gegevens in een draagbaar formaat aan.',
        'Recht op bezwaar: Bezwaar tegen verwerking, ook voor direct marketing.',
        'Recht om toestemming in te trekken: Trek uw toestemming op elk moment in als de verwerking op toestemming is gebaseerd.',
        'Recht om een klacht in te dienen: Een klacht indienen bij uw autoriteit voor gegevensbescherming.',
      ],
    },
    {
      heading: 'Rechtsgrondslag van de AVG',
      paragraphs: [
        'We verwerken gegevens op deze basis: (a) Toestemming - voor gepersonaliseerde reclame (beheerd door onze reclamepartners); (b) Legitieme belangen - voor analyse, veiligheid en verbetering; (c) Contract - om te reageren op vragen.',
        'Neem contact op met email@anqr.link om uw rechten uit te oefenen. We reageren binnen 30 dagen.',
      ],
    },
    {
      heading: 'Uw rechten onder CCPA (Californië-gebruikers)',
      bullets: [
        'Recht om te weten: Vraag informatie over verzamelde gegevens, bronnen, doeleinden en derden.',
        'Recht om te verwijderen: Verzoek verwijdering van uw persoonlijke gegevens.',
        'Recht op op opt-out: Kies uit de "verkoop" van persoonlijke informatie (delen met advertentiepartners kan in aanmerking komen).',
        'Recht op non-discriminatie: We zullen niet discrimineren voor de uitoefening van uw rechten.',
      ],
    },
    {
      heading: 'CCPA-categorieën verzameld',
      paragraphs: [
        'Categorieën: Identifiers (IP-adres, apparaat-ID), Internetactiviteit (browsen, advertentie-interacties), Geolocatie (ca.',
        'Om rechten uit te oefenen of u af te melden: e-mail@anqr.link of pas de cookie-instellingen aan.',
      ],
    },
    {
      heading: 'Internationale overdrachten',
      paragraphs: [
        'Uw gegevens kunnen worden doorgegeven aan landen met verschillende wetgeving inzake gegevensbescherming, waaronder de Verenigde Staten. Wij maken gebruik van passende waarborgen zoals standaard contractuele clausules.',
      ],
    },
    {
      heading: 'Privacy van kinderen',
      paragraphs: [
        'ANQR is niet gericht op kinderen onder de 13 jaar (of 16 jaar in de EER). Wij verzamelen niet bewust gegevens van kinderen. Neem contact op met email@anqr.link als u denkt dat een kind informatie heeft verstrekt.',
      ],
    },
    {
      heading: 'Beveiliging',
      paragraphs: [
        'Wij gebruiken passende technische en organisatorische maatregelen om gegevens te beschermen, waaronder HTTPS-encryptie. Geen enkele internettransmissie is echter 100% veilig.',
      ],
    },
    {
      heading: 'Niet volgen',
      paragraphs: [
        'We eren Not Track browser signalen waar mogelijk, hoewel reclame partners misschien niet reageren op DNT.',
      ],
    },
    {
      heading: 'Wijzigingen in dit beleid',
      paragraphs: [
        'We kunnen dit beleid regelmatig bijwerken. De "Laatst bijgewerkt" datum geeft de meest recente herziening. Belangrijke wijzigingen kunnen via een site banner worden meegedeeld.',
      ],
    },
    {
      heading: 'Contacteer ons',
      paragraphs: [
        'Voor privacyvragen of om uw rechten uit te oefenen: email@anqr.link of gebruik onze Contactpagina. Wij reageren binnen 30 dagen op privacyverzoeken.',
      ],
    },
    {
      heading: 'Volledig privacybeleid',
      paragraphs: [
        'Deze pagina geeft een samenvatting van onze privacypraktijken. Voor het volledige, juridisch bindende privacybeleid met volledige details over gegevensverwerking, uw rechten en onze verplichtingen onder de AVG, CCPA en andere privacywetten, kunt u ons volledige beleid bekijken, gehost door iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Bekijk het volledige privacybeleid op iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
