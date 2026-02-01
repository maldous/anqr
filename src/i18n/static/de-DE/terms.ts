import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Geschäftsbedingungen',
  description: 'Durch den Zugriff oder die Nutzung der Website erklären Sie sich damit einverstanden, an diese Bedingungen gebunden zu sein.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Datenschutz', type: 'external' }],
  sections: [
    {
      heading: 'Annahme von Begriffen',
      paragraphs: ['Durch den Zugriff auf oder die Nutzung von ANQR (anqr.link) erklären Sie sich damit einverstanden, dass diese Nutzungsbedingungen und unsere Datenschutzerklärung gebunden sind. Wenn Sie diesen Bedingungen nicht zustimmen, verwenden Sie die Website nicht.', 'Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Die weitere Nutzung der Website nach Änderungen stellt die Annahme der neuen Bedingungen dar.'],
    },
    {
      heading: 'Förderfähigkeit',
      paragraphs: ['Sie müssen mindestens 13 Jahre alt sein, um ANQR zu verwenden. Durch die Nutzung der Website stellen Sie dar, dass Sie diese Altersvoraussetzung erfüllen. Wenn Sie unter 18 sind, stellen Sie dar, dass Sie Ihre Eltern oder Vormund die Erlaubnis haben, die Website zu benutzen.'],
    },
    {
      heading: 'Zulässige Verwendung',
      paragraphs: ['Sie können ANQR nur für rechtmäßige Zwecke verwenden. Sie sind allein verantwortlich für die Inhalte, die Sie in QR-Codes kodieren und wie Sie QR-Codes verwenden, die Sie generieren.'],
    },
    {
      heading: 'Prohibited Verhalten',
      paragraphs: ['Sie stimmen nicht zu:'],
      bullets: ['Verwenden Sie ANQR, um QR-Codes zu erstellen, die Phishing, Malware-Verteilung, Betrug, Betrug, Betrug, Belästigung, Betrug oder irgendeine illegale Aktivität erleichtern.', 'Verschlüsseln Sie Inhalte, die geistige Eigentumsrechte verletzen, Datenschutz verletzen oder illegales Material enthalten.', 'Versuchen Sie, den Betrieb oder die Sicherheit der Anlage zu stören, zu überlasten oder zu stören.', 'Reverse Engineer, decompile, oder versuchen, Quellcode aus der Website zu extrahieren.', 'Verwenden Sie automatisierte Werkzeuge (Bots, Schaber), um auf die Website in einer Weise zuzugreifen, die die Leistung für andere Benutzer abbaut.', 'Umfassen oder deaktivieren Sie alle Sicherheits- oder Zugangskontrollfunktionen.', 'Verkörpern Sie jede Person oder Einheit oder missvertreten Sie Ihre Zugehörigkeit.'],
    },
    {
      heading: 'Geistiges Eigentum',
      paragraphs: ['Sie behalten das Eigentum an den Inhalten, die Sie in QR-Codes kodieren. ANQR behauptet kein Eigentum an Ihren Daten.', 'Der ANQR-Name, das Logo, das Interface Design und der zugrunde liegende Code sind durch Urheberrechte, Markenzeichen und andere geistige Eigentumsgesetze geschützt. Sie dürfen ohne unsere Erlaubnis keine Derivatwerke kopieren, modifizieren, verteilen oder erstellen.', 'QR Code® ist eine eingetragene Marke von DENSO WAVE INCORPORATED. ANQR ist nicht mit DENSO WAVE verbunden.'],
    },
    {
      heading: 'Benutzer-Inhaltelizenz',
      paragraphs: ['Mit der Nutzung von ANQR gewähren Sie uns keine Rechte auf Ihre Inhalte. Bei Verwendung der lokalen Generation (die Standardeinstellung) erfolgt die QR-Code-Generierung in Ihrem Browser und wir greifen nicht auf, speichern oder übermitteln Ihre codierten Daten.', 'Bei der Verwendung der serverseitigen API wird Ihr Inhalt zur Erzeugung des QR-Bildes verarbeitet, wird aber nicht gespeichert, eingeloggt oder für einen anderen Zweck verwendet, der das angeforderte Bild übertrifft.'],
    },
    {
      heading: 'Dienstleistungen Dritter und Werbung',
      paragraphs: ['Die Website zeigt Werbung durch Google AdSense und kann Links zu Drittanbieter-Websites enthalten. Wir sind nicht verantwortlich für Inhalte Dritter, Dienstleistungen oder Datenschutzpraktiken.', 'Ihre Interaktionen mit Werbetreibenden und Dritten sind ausschließlich zwischen Ihnen und ihnen. Siehe unsere Datenschutzerklärung für Informationen über Werbedatenpraktiken.'],
    },
    {
      heading: 'Haftungsausschluss',
      paragraphs: ['ANQR WIRD AUF EINEN "AS IS" UND "AS AVAILABLE" BASIS OHNE WARRANTIES VON EINEM ANDEREN KIND, EXPRESS ODER IMPLIED, INKLUSING BUT NICHT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.', 'Wir garantieren nicht, dass: (a) die Website unterbrechungsfrei, sicher oder fehlerfrei ist; (b) QR-Codes werden in allen Umgebungen, auf allen Geräten oder mit allen Scanner-Anwendungen scannen; (c) die Website wird Ihre Anforderungen erfüllen.', 'Sie sollten immer QR-Codes unter den Bedingungen testen, in denen sie verwendet werden (Druckgröße, Beleuchtung, Bildschirmtyp, Entfernung, Kameraqualität).'],
    },
    {
      heading: 'Haftungsbegrenzung',
      paragraphs: ['ANWENDUNGSBEREICH, ANQR UND ITS OPERATOREN, AFFILIEN, UND LICENSOREN NICHT VERBINDIGKEITEN FÜR DIE INDIREKTE INDIREKT, INCIDENTAL, SPEZIALIEN, VERBRAUCHER, VERÖFFENTLICHKEIT, ODER EXEMPLAREN.', 'SIE HABEN ES NICHT GESCHAFFT, DASS SIE DEN DIENSTLEISTUNGSHANDELN HABEN. DIENSTLEISTUNG IST KOSTENLOS VON CHARGE, UND ZUGANG, SIE HABEN DAS ANQR UND DIE OPERATOREN HABEN KEINE LIABILITY ZU IHNEN, WAS FÜR EINE ANDERE DAMAGES ODER LOSSES. IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY EXCEED ZERO DOLLARS ($0 AUD).', 'SIE SIND BEREIT, SICH ZU ENTZIEHEN, ZU WARTEN, UND ZU VERSCHLEIERN, UND ALLE CLAIMS, DEMANDS, UND CAUSES VON ACTION GEGEN ANQR UND ITS OPERATOREN, DIE VON IHRE DER DIENSTLEISTUNG ABHÄNGEN.', 'BESCHÄFTIGUNGSMASSNAHMEN NICHT DIE ENTWICKLUNG DER BESTIMMUNGEN ODER LIMITATIONEN DER LIABILITÄT. IN SUCH JURISDICTIONEN, UNSERE LIABILITÄT, AUF DIE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.'],
    },
    {
      heading: 'Indem',
      paragraphs: ['Sie erklären sich damit einverstanden, ANQR, seine Betreiber, Tochtergesellschaften und ihre jeweiligen Offiziere, Direktoren, Mitarbeiter und Agenten aus allen Ansprüchen, Schäden, Verluste, Verbindlichkeiten, Kosten und Aufwendungen (einschließlich gesetzlicher Gebühren) zu entschädigen, zu verteidigen, zu verteidigen; (b) Ihre Verletzung dieser Geschäftsbedingungen; (c) Ihre Verletzung der Rechte Dritter; (d) alle Inhalte, die Sie in QR-Codes codieren.'],
    },
    {
      heading: 'Streitbeilegung',
      paragraphs: ['Jeder Streit, der sich aus diesen Bedingungen oder Ihrer Nutzung von ANQR ergibt, wird zunächst versucht, durch informelle Verhandlungen behoben zu werden, indem er email@anqr.link kontaktiert.', 'Wenn informelle Entschließung scheitert, werden Streitigkeiten durch verbindliche Schiedsverfahren in Victoria, Australien, außer, dass jede Partei kann einstweilige Entlastung vor Gericht für geistige Eigentum Verletzungen suchen.'],
    },
    {
      heading: 'Nichtzutreffendes streichen',
      paragraphs: ['SIE HABEN DAS GEFÜHL, DASS ES SICH UM EINE ANDERE LÖSUNG HANDELT, DIE SICH NUR AUF EINEN UNDIVIDUALEN BASIS UND NICHT IN EINER KLASSE, KONSTITUIERT, ODER UM EINE REPRESENTATIVE AKTION.'],
    },
    {
      heading: 'Rechtliches Handeln',
      paragraphs: ['Diese Bedingungen unterliegen den Gesetzen von Victoria, Australien, ohne in Bezug auf Konflikte der Gesetze Prinzipien. Sie stimmen der ausschließlichen Gerichtsbarkeit der in Victoria, Australien gelegenen Gerichte zu.'],
    },
    {
      heading: 'Änderungen und Verfügbarkeit',
      paragraphs: ['Wir können die Website jederzeit ohne Ankündigung oder Haftung ändern, aussetzen oder einstellen.', 'Wir können diese Bedingungen jederzeit aktualisieren. Das Datum "Letzte Aktualisierung" zeigt an, wann sie zuletzt überarbeitet wurden. Die fortgesetzte Nutzung nach Änderungen stellt Akzeptanz dar.'],
    },
    {
      heading: 'Schwere',
      paragraphs: ['Wird eine Bestimmung dieser Bedingungen unwirksam oder nicht durchsetzbar gehalten, so wird diese Bestimmung maximal zulässig durchgesetzt, und die übrigen Bestimmungen bleiben in vollem Umfang und Wirkung.'],
    },
    {
      heading: 'Empfänger',
      paragraphs: ['Unser Versagen, ein Recht oder eine Bestimmung dieser Bedingungen durchzusetzen, gilt nicht als Verzicht auf dieses Recht oder die Bestimmung.'],
    },
    {
      heading: 'Gesamtvereinbarung',
      paragraphs: ['Diese Bedingungen bilden zusammen mit unserer Datenschutzerklärung die gesamte Vereinbarung zwischen Ihnen und ANQR über Ihre Nutzung der Website und übertrifft alle vorherigen Vereinbarungen.'],
    },
    {
      heading: 'Macht Majestät',
      paragraphs: ['Wir haften nicht für Versagen oder Verzögerungen in der Leistung aufgrund von Umständen, die über unsere vernünftige Kontrolle hinausgehen, einschließlich Naturkatastrophen, Krieg, Terrorismus, Ritus, Regierungsaktionen oder Internet/Infrastrukturversagen.'],
    },
    {
      heading: 'Kontakt',
      paragraphs: ['Fragen zu diesen Bedingungen können an: email@anqr.link_'],
    },
  ],
};

export default terms;
