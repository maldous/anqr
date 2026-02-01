import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontaktieren Sie uns',
  description: 'Wir begrüßen Feedback, Bugberichte, Feature-Anfragen und allgemeine Anfragen.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Wie erreichen Sie uns',
      paragraphs: ['Wir bieten verschiedene Möglichkeiten, uns je nach Bedarf zu kontaktieren. Wir lesen jede Nachricht, obwohl Antwortzeiten können variieren basierend auf Volumen und Anfrage Typ.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Für alle Anfragen: ', 'Dies ist der zuverlässigste Weg, um uns zu erreichen und wird für detaillierte Fragen, geschäftliche Anfragen oder andere Anfragen empfohlen.'],
    },
    {
      heading: 'Arten von Anfragen',
      bullets: ['Allgemeine Fragen: Fragen zur Verwendung von ANQR, Feature-Erklärungen oder allgemeines Feedback.', 'Fehlerberichte: Bitte beinhalten Sie Ihren Browser, Ihr Betriebssystem, Schritte zur Wiedergabe und alle Fehlermeldungen, die Sie sehen.', 'Feature-Anfragen: Vorschläge für neue Features oder Verbesserungen. Wir betrachten alle Anträge, obwohl wir die Umsetzung nicht versprechen können.', 'Unternehmensanfragen: Partnerschaftsmöglichkeiten, Lizenzfragen oder kommerzielle Anfragen.', 'Datenschutzanfragen: Bitte um Ausübung Ihrer Datenschutzrechte unter DSGVO, CCPA oder anderen Datenschutzgesetzen (siehe Datenschutzrichtlinie).', 'DMCA/Copyright: Siehe unten die DMCA-Sektion für Takedown-Anforderungen.'],
    },
    {
      heading: 'Antwortzeiten',
      paragraphs: ['Wir wollen innerhalb von 5-7 Werktagen auf Anfragen antworten. Datenschutz-bezogene Anfragen werden innerhalb von 30 Tagen nach gesetzlicher Vorgaben bearbeitet.', 'Während der befahrenen Zeiten können Reaktionszeiten länger sein. Für dringende Angelegenheiten bitte "URGENT" in Ihrer Betreffzeile angeben.'],
    },
    {
      heading: 'Bevor Sie uns kontaktieren',
      paragraphs: ['Bitte überprüfen Sie unsere Dokumentationsseite für Antworten auf gemeinsame Fragen, wie Sie ANQR-Funktionen verwenden können. Viele Fragen zur QR-Code-Generierung, Styling und Exportoptionen werden dort abgedeckt.'],
    },
    {
      heading: 'DMC Urheberrechtshinweise',
      paragraphs: ['Wenn Sie glauben, dass Inhalte, die auf ANQR verfügbar sind, Ihr Urheberrecht verletzen, können Sie ein Digital Millennium Copyright Act (DMCA) Takedown-Mitteilung einreichen. Um gültig zu sein, muss Ihre Mitteilung enthalten:'],
      bullets: ['Eine physische oder elektronische Signatur des Urheberrechtsinhabers oder des Bevollmächtigten.', 'Identifizierung der urheberrechtlich geschützten Werke, die verletzt wurden.', 'Identifizierung des Materials, das behauptet wird, verletzt zu sein, mit Informationen ausreichend, um es zu lokalisieren.', 'Ihre Kontaktdaten (Adresse, Telefonnummer und E-Mail-Adresse).', 'Eine Erklärung, dass Sie einen guten Glauben haben, dass die Verwendung des Materials nicht vom Urheberrechtsinhaber genehmigt wird.', 'Eine Erklärung unter Strafe der Verurteilung, dass die Informationen in Ihrer Mitteilung genau sind und Sie der Urheberrechtsinhaber sind oder berechtigt sind, in ihrem Namen zu handeln.'],
    },
    {
      heading: 'Kontaktieren Sie uns',
      paragraphs: ['DMCA Mitteilungen senden an: email@anqr.link', 'Bitte beinhalten Sie "DMCA Hinweis" in der Betreffzeile. Wir werden nach geltendem Recht auf gültige Mitteilungen reagieren. Beachten Sie, dass ANQR QR-Codes lokal auf Benutzergeräten generiert und nicht benutzergenerierte Inhalte hostet.'],
    },
    {
      heading: 'Reddit-Community',
      paragraphs: ['Treten Sie unserer Reddit-Community unter r/ANQR bei, um Ihre QR-Kreationen zu teilen, Fragen zu stellen, Hilfe zu erhalten und mit anderen ANQR-Benutzern in Kontakt zu treten.'],
    },
  ],
};

export default contact;
