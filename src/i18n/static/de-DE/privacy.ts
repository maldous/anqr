import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Datenschutz',
  description:
    'Informationen ANQR sammelt, wie es verwendet wird, und Ihre Rechte nach den geltenden Datenschutzgesetzen.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Geschäftsbedingungen', type: 'external' }],
  sections: [
    {
      heading: 'Zusammenfassung',
      paragraphs: [
        'ANQR ist ein QR-Codegenerator mit einem Client-First-Ansatz. Wir verlangen nicht, dass Sie ein Konto erstellen. Standardmäßig werden QR-Codes lokal in Ihrem Browser generiert - wir haben keinen Zugriff auf die Inhalte, die Sie codieren.',
        'Für den professionellen Einsatz bietet ANQR eine serverseitige API, die QR-Codes aus URL-Parametern generiert. Bei der Verwendung der API werden Ihre QR-Inhalte auf unseren Servern verarbeitet, um das Bild zu machen, aber nicht gespeichert oder eingeloggt.',
        'Wir verwenden Google AdSense für Werbung und können Analysedienste verwenden. Diese Dienste sammeln Informationen über Cookies und ähnliche Technologien. Diese Politik erklärt, welche Daten erhoben werden, wie sie verwendet wird, und Ihre Rechte.',
      ],
    },
    {
      heading: 'Informationen, die wir sammeln',
      bullets: [
        'Informationen, die Sie bereitstellen: Wenn Sie uns per E-Mail oder unserem Kontaktformular kontaktieren, erfassen wir Ihren Namen, Ihre E-Mail-Adresse und Ihre Nachrichteninhalte.',
        'Automatisch gesammelte Informationen: Unser Hosting-Provider (Netlify), Werbepartner und Analytik-Dienste können sammeln: IP-Adresse, Browsertyp und Version, Betriebssystem, Gerätetyp, referenzieren URL, besuchte Seiten, Zeit vor Ort und ungefähr geographische Lage.',
        'Cookies Dritter: Unsere Werbepartner (Google AdSense) verwenden Cookies und ähnliche Technologien, um Werbung zu bedienen und zu messen. ANQR selbst setzt keine First-Party-Cookies.',
      ],
    },
    {
      heading: 'Cookies und Drittanbietertechnologien',
      paragraphs: [
        'ANQR setzt keine First-Party-Cookies. Ihre Präferenzen (z.B. Dunkelmodus) werden lokal auf Ihrem Gerät gespeichert, das nicht an einen Server übertragen wird.',
        'Unsere Werbepartner (Google AdSense) und Hosting Provider können jedoch Cookies und ähnliche Tracking-Technologien verwenden:',
      ],
      bullets: [
        'Werbe-Cookies (Drittanbieter): Setzen Sie von Google AdSense und Werbepartnern, um relevante Anzeigen zu bedienen, Anzeigenleistung zu messen und Nutzerinteressen zu verstehen. Diese Cookies können Ihre Aktivitäten auf verschiedenen Websites verfolgen.',
        'Analytics-Cookies (Drittanbieter): Kann von unserem Hosting-Anbieter oder Analysediensten genutzt werden, um anonymisierte Nutzungsdaten zu erheben.',
      ],
    },
    {
      heading: 'Google AdSense und Werbung',
      paragraphs: [
        'Wir zeigen Anzeigen durch Google AdSense. Google und seine Partner verwenden Cookies, um Anzeigen basierend auf Ihrer Browser-Geschichte auf dieser Website und anderen Websites (interessierte Werbung) zu bedienen.',
        'Erfahren Sie, wie Google Ihre Informationen nutzt: https://policies.google.com/technologies/partner-sites',
        'Personalisierung verwalten: https://adssettings.google.com',
        'Über Network Advertising Initiative: https://optout.networkadvertising.org',
        'Über die Digital Advertising Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Wie wir Informationen verwenden',
      bullets: [
        'Antworten Sie auf Ihre Anfragen und unterstützen Sie.',
        'Um relevante Werbung über unsere Werbepartner anzuzeigen.',
        'Um die Nutzung der Website zu analysieren und unsere Dienstleistungen zu verbessern.',
        'Um Betrug, Missbrauch und Sicherheitsprobleme zu erkennen, zu verhindern und anzusprechen.',
        'Erfüllung gesetzlicher Verpflichtungen.',
      ],
    },
    {
      heading: 'Dienstleistungen Dritter',
      bullets: [
        'Google AdSense: Erhält Daten, um Anzeigen zu bedienen und zu messen.',
        'Analyseanbieter: Erhalten Sie anonymisierte Nutzungsdaten.',
        'Netlify (hosting): Verarbeitet Anfragen und kann IP-Adressen anmelden.',
        'Wir verkaufen Ihre persönlichen Daten nicht. Die Weitergabe von Daten mit Werbepartnern kann jedoch als "Vertrieb" unter CCPA betrachtet werden (siehe unten).',
      ],
    },
    {
      heading: 'Aufbewahrung von Daten',
      bullets: [
        'Ansprechpartner: Bis zu 2 Jahre.',
        'Serverprotokolle: Bis zu 30 Tage (Host Provider).',
        'Analysedaten: Bis zu 26 Monate (anonymisiert).',
        'Werbung Cookies: Typischerweise 13 Monate (Varien nach Partner).',
      ],
    },
    {
      heading: 'Ihre Rechte unter DSGVO (EEA-Nutzer)',
      paragraphs: [
        'Sind Sie im Europäischen Wirtschaftsraum, haben Sie folgende Rechte gemäß der Datenschutz-Grundverordnung:',
      ],
      bullets: [
        'Zugangsrecht: Fordern Sie eine Kopie personenbezogener Daten an, die wir über Sie halten.',
        'Recht auf Berichtigung: Beantragen Sie die Berichtigung ungenauer Daten.',
        'Recht auf Löschung: Löschen Ihrer Daten anfordern ("Recht auf Vergessenwerden").',
        'Recht auf Einschränkung der Verarbeitung: Grenzen anfordern, wie wir Ihre Daten verwenden.',
        'Recht auf Datenübertragbarkeit: Fordern Sie Ihre Daten in einem tragbaren Format an.',
        'Widerspruchsrecht: Gegenstand der Verarbeitung, auch für die Direktwerbung.',
        'Recht auf Widerruf der Einwilligung: Einwilligung jederzeit widerrufen, wenn die Verarbeitung einwilligt ist.',
        'Recht auf Beschwerde: Beantragen Sie eine Beschwerde bei Ihrer Datenschutzbehörde.',
      ],
    },
    {
      heading: 'Rechtsgrundlage',
      paragraphs: [
        'Wir verarbeiten Daten auf diesen Basisn: (a) Zustimmung - für personalisierte Werbung (verwaltet von unseren Werbepartnern); (b) Legitimierte Interessen - für Analytik, Sicherheit und Verbesserung; (c) Vertrag - auf Anfragen reagieren.',
        'Um Ihre Rechte auszuüben, kontaktieren Sie email@anqr.link. Wir reagieren innerhalb von 30 Tagen.',
      ],
    },
    {
      heading: 'Ihre Rechte unter CCPA (Kalifornien Nutzer)',
      bullets: [
        'Recht zu wissen: Fordern Sie Informationen über erhobene Daten, Quellen, Zwecke und Dritte an.',
        'Recht auf Löschung: Bitte um Löschung Ihrer personenbezogenen Daten.',
        'Recht auf Widerruf: Entscheiden Sie sich aus der "Veräußerung" personenbezogener Daten (Mitteilung mit Ad-Partnern kann qualifizieren).',
        'Recht auf Nichtdiskriminierung: Wir werden nicht für die Ausübung Ihrer Rechte diskriminieren.',
      ],
    },
    {
      heading: 'CCPA-Kategorien',
      paragraphs: [
        'Kategorien: Identifier (IP-Adresse, Geräte-ID), Internet-Aktivität (Browsing, Anzeigen-Interaktionen), Geolokation (ungefähr), Inferenzen (Interessierte aus dem Surfen).',
        'Um Rechte auszuüben oder auszuschalten:  oder Cookie-Einstellungen anpassen.',
      ],
    },
    {
      heading: 'Internationale Transfers',
      paragraphs: [
        'Ihre Informationen können in Länder mit unterschiedlichen Datenschutzgesetzen, einschließlich der Vereinigten Staaten, übertragen werden. Wir verwenden geeignete Schutzmaßnahmen wie Standardvertragsklauseln.',
      ],
    },
    {
      heading: 'Privatsphäre der Kinder',
      paragraphs: [
        'ANQR richtet sich nicht an Kinder unter 13 (oder 16 im EWR). Wir erheben keine Daten von Kindern. Kontaktieren Sie , wenn Sie glauben, dass ein Kind Informationen geliefert hat.',
      ],
    },
    {
      heading: 'Sicherheit',
      paragraphs: [
        'Wir verwenden geeignete technische und organisatorische Maßnahmen zum Schutz von Daten, einschließlich der HTTPS-Verschlüsselung. Allerdings ist keine Internetübertragung 100% sicher.',
      ],
    },
    {
      heading: 'Nicht verfolgen',
      paragraphs: [
        'Wir ehren Do Not Track Browser-Signale, wenn möglich, obwohl Werbepartner nicht auf DNT reagieren.',
      ],
    },
    {
      heading: 'Änderungen an dieser Politik',
      paragraphs: [
        'Wir können diese Politik regelmäßig aktualisieren. Das Datum "Letzte Aktualisierung" zeigt die jüngste Revision an. Wichtige Änderungen können über ein Seitenbanner mitgeteilt werden.',
      ],
    },
    {
      heading: 'Kontaktieren Sie uns',
      paragraphs: [
        'Für Datenschutzfragen oder um Ihre Rechte auszuüben:  oder nutzen Sie unsere Kontaktseite. Wir reagieren auf Datenschutzanfragen innerhalb von 30 Tagen.',
      ],
    },
    {
      heading: 'Vollständige Datenschutzrichtlinie',
      paragraphs: [
        'Auf dieser Seite finden Sie eine Zusammenfassung unserer Datenschutzpraktiken. Die vollständige, rechtsverbindliche Datenschutzrichtlinie mit allen Einzelheiten zur Datenverarbeitung, Ihren Rechten und unseren Pflichten gemäß DSGVO, CCPA und anderen Datenschutzgesetzen finden Sie in unserer vollständigen Richtlinie, die von iubenda gehostet wird.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Die vollständige Datenschutzrichtlinie finden Sie auf iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
