import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Über ANQR',
  description: 'ANQR ist ein freier QR-Code-Generator mit einem Client-First-Ansatz - QR-Codes lokal generieren oder unsere API zur Einbettung verwenden.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Öffnen Sie den Generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Mehr erfahren', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Datenschutz', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Geschäftsbedingungen', type: 'external' },
  ],
  sections: [
    {
      heading: 'Was ist ANQR?',
      paragraphs: ['ANQR (ausgesprochen "anchor") ist ein kostenloser QR-Code-Generator, der scannbare Codes für URLs, Text, Wi-Fi-Berechtigungen, Kontaktkarten, Kalenderereignisse und mehr erstellt.', 'Es ist für Einzelpersonen, kleine Unternehmen, Vermarkter und Entwickler gebaut, die leistungsstarke QR-Tools ohne Anmeldung wollen. Das Client-First-Design bedeutet QR-Codes werden standardmäßig lokal in Ihrem Browser generiert, mit einer optionalen Server-API für professionelle Einbettung und Integration.'],
    },
    {
      heading: 'Schlüsselmerkmale',
      bullets: ['QR-Codes sofort in Ihrem Browser generieren - kein Konto erforderlich.', 'Passen Sie Farben, Modul-Stile, Finder-Muster, und fügen Sie Bild Overlays.', 'Export in mehrere Formate: PNG, SVG, WebP und animierte GIF.', 'Erweiterte Steuerungen für Fehlerkorrekturebene, QR-Version, Kodierungsmodus und Maskenauswahl.', 'Scan-Safety-Anleitung und Live-Vorschau, um Codes im Druck und auf Bildschirmen lesbar zu halten.', 'Serverseitige API zur professionellen Einbettung mit voller Parameterunterstützung.', 'Funktioniert offline einmal geladen - es ist eine statische Web-App, die Sie überall ausführen können.'],
    },
    {
      heading: 'Wie ANQR funktioniert',
      paragraphs: ['ANQR läuft in Ihrem Browser und kodiert Ihre Eingabe in eine Standard- QR-Matrix mit Reed-Solomon Fehlerkorrektur, macht sie dann auf das Format, das Sie wählen.', 'Standardmäßig geschieht die Erzeugung lokal in Ihrem Browser. Für den professionellen Einsatz können Sie auch die serverseitige API nutzen, um QR-Codes über URL-Parameter zu generieren - perfekt zum Einbetten in Websites, E-Mails oder automatisierte Workflows.', 'Wenn Sie Overlays oder Animationen hinzufügen, bilanziert ANQR das Styling mit Scan-Verlässlichkeit, so dass das Ergebnis scannbar bleibt.', 'ANQR konzentriert sich auf statische Codes (die Daten befinden sich im QR). Wenn Sie einen dynamischen Code benötigen (erweiterbares Ziel), können Sie Ihre eigene Umleitung URL oder Kurzlink codieren.'],
    },
    {
      heading: 'Wer betreibt ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Werbung und wie wir frei bleiben',
      paragraphs: ['ANQR ist frei zu bedienen und wird durch Werbung unterstützt. Wir können Anzeigen über Google AdSense und/oder andere Werbepartner anzeigen.', 'Ad-Provider können Cookies oder ähnliche Technologien verwenden, um Anzeigen basierend auf Ihren Interessen und Surfaktivitäten zu personalisieren. Sie können Anzeigeneinstellungen in Ihren Geräteeinstellungen und über Google-Anzeigeneinstellungen verwalten und mehr in unserer Datenschutzerklärung erfahren.', 'Wir verkaufen die Inhalte, die Sie codieren, nicht in QR-Codes. Anzeigen helfen dabei, die Kosten für den Betrieb und die Verbesserung des Projekts zu decken.'],
    },
    {
      heading: 'Offene Standards',
      paragraphs: ['ANQR generiert QR-Codes basierend auf dem ISO/IEC 18004 Standard und zielt auf eine breite Kompatibilität über Scanner, Kameras und Druck-Workflows.'],
    },
    {
      heading: 'Warenbezeichnung',
      paragraphs: ['QR Code® ist eine eingetragene Marke von DENSO WAVE INCORPORATED. ANQR ist nicht mit DENSO WAVE INCORPORATED verbunden, unterstützt oder gesponsert.'],
    },
    {
      heading: 'Feedback und Beiträge',
      paragraphs: ['Wir begrüßen Feedback, Bugberichte und Featurevorschläge. Bitte kontaktieren Sie uns per E-Mail oder der Kontaktseite - wir lesen jede Nachricht, obwohl Antwortzeiten variieren können.'],
    },
  ],
};

export default about;
