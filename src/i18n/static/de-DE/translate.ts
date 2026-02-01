import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Hilfe Übersetzen ANQR',
  description: 'Begleiten Sie unsere Community von Übersetzern, die ANQR für Nutzer weltweit zugänglich machen. Keine Programmiererfahrung erforderlich - tragen Sie direkt von Ihrem Browser.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Open Translation Repository', type: 'external' },
    { href: '/?lang=${lang}', label: 'Generator öffnen', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Über ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontaktieren Sie uns', type: 'external' },
  ],
  sections: [
    {
      heading: 'Warum beitragen?',
      paragraphs: ['ANQR wird von Menschen auf der ganzen Welt verwendet, um QR-Codes für Unternehmen, Veranstaltungen, Zahlungen und persönliche Projekte zu erstellen. Durch den Beitrag von Übersetzungen helfen Sie, dieses leistungsstarke Werkzeug für Benutzer zugänglich zu machen, die ihre Muttersprache bevorzugen.', 'Jeder Übersetzungsbeitrag - ob die Festlegung eines Typs oder die Übersetzung einer ganzen Sprache - macht einen echten Unterschied für Nutzer in Ihrer Community.'],
    },
    {
      heading: 'Was können Sie übersetzen?',
      paragraphs: ['ANQR hat zwei Arten von übersetzbaren Inhalten:'],
      bullets: ['UI Strings: Knopfetiketten, Menüpunkte, Tooltips und Interface Text, der in der gesamten App erscheint.', 'Statische Inhalte: Dokumentationsseiten einschließlich Anleitungen, Beispiele, Datenschutzrichtlinien und Hilfeartikel.', 'Beide Typen werden als einfache Textdateien gespeichert, die Sie direkt in Ihrem Browser bearbeiten können - keine spezielle Software erforderlich.', 'Übersetzungen werden vor der Zusammenführung überprüft, um Qualität und Konsistenz zu gewährleisten.'],
    },
    {
      heading: 'Wie beitrage',
      paragraphs: ['Der Beitrag ist einfach und erfordert kein Git-Wissen:'],
      bullets: ['Besuchen Sie unser Public Translation Repository auf GitHub.', 'Finden Sie Ihre Sprachdatei (oder erstellen Sie eine neue, wenn Ihre Sprache noch nicht unterstützt wird).', 'Klicken Sie auf das Bleistiftsymbol, um direkt in Ihrem Browser zu bearbeiten.', 'Ändern Sie Ihre Änderungen und klicken Sie auf "Erstellen Sie Änderungen" - GitHub erstellt automatisch eine Zuganfrage.', 'Ihr Beitrag wird überprüft und zusammengefasst, typischerweise innerhalb weniger Tage.'],
    },
    {
      heading: 'Übersetzungsrichtlinien',
      paragraphs: ['Bei der Übersetzung halten Sie Platzhalter wie __ANQR_PH_0_, __ANQR_PH_1_ und {{variable}} unverändert - diese werden zu Laufzeit durch dynamische Werte ersetzt. Bewahren Sie auch jede HTML-ähnliche Syntax wie Links im Format [[/path|Label]].', 'Wenn Sie sich über eine Übersetzung unsicher sind, ist es besser, es auf Englisch zu lassen, als eine falsche Übersetzung zu bieten. Sie können auch ein Problem zu GitHub eröffnen, um eine Klärung zu fordern.'],
    },
    {
      heading: 'Derzeit unterstützte Sprachen',
      paragraphs: ['ANQR unterstützt derzeit mehr als 40 Sprachen, darunter:'],
      bullets: ['Große Weltsprachen: Englisch, Chinesisch, Spanisch, Arabisch, Hindi, Portugiesisch, Japanisch, Koreanisch, Französisch, Deutsch, Russisch und mehr.', 'Südostasiatische Sprachen: Thai, Vietnamesisch, Indonesisch, Filipino, Malay, Khmer, Lao, Burmese.', 'Südasiatische Sprachen: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Anerkennung',
      paragraphs: ['Alle Beiträge werden in unserem Repository gutgeschrieben. Ihre Arbeit hilft Tausenden von Benutzern auf ANQR in ihrer bevorzugten Sprache zugreifen.', 'Vielen Dank an alle unsere Übersetzungsmitarbeiter, die ANQR weltweit zugänglich machen!'],
    },
    {
      heading: 'Fragen?',
      paragraphs: ['Wenn Sie Fragen zum Beitrag von Übersetzungen haben, öffnen Sie bitte ein Problem in unserem GitHub-Repository oder kontaktieren Sie uns per E-Mail. Wir helfen Ihnen gerne beim Start.'],
    },
  ],
};

export default translate;
