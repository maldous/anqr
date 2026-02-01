import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Lernen mit ANQR',
  description: 'Praktische, geschäftsorientierte Leitfäden, um QR-Codes in echte Marketingressourcen zu verwandeln – nicht nur in funktionale Quadrate. Erfahren Sie, wie Sie ältere Point-of-Sale-Codes aktualisieren, konforme QR-Beschilderungen für Zahlungen erstellen, druckfertige Exporte vorbereiten, Animationen sicher auf digitalen Displays verwenden und festgelegte Konfigurationen mithilfe von ANQR-Links ("Anker") für mehrsprachige Teams freigeben.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Öffnen Sie den Generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'QR-Beispiele', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Vollständige Anleitung öffnen', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Verbesserung bestehender QR-Kampagnen',
      paragraphs: ['Die meisten Unternehmen haben QR-Codes in ihren Betrieben verteilt – auf Speisekarten, Thekenständern, Verpackungen und Werbematerialien. Viele dieser Codes wurden vor Jahren mit einfachen Generatoren erstellt, was zu generischen Schwarz-Weiß-Quadraten führte, die kein Vertrauen erwecken oder nicht zu Ihrer Markenidentität passen. Dieser umfassende Leitfaden führt Sie durch einen systematischen Ansatz zur Prüfung, Aktualisierung und Optimierung Ihrer vorhandenen QR-Infrastruktur, ohne die bereits eingerichteten Customer Journeys zu unterbrechen.', 'Der strategische Vorteil des Upgrades, anstatt Ihre QR-Codes zu ersetzen, liegt in der Erhaltung der Kontinuität. Ihre Kunden haben bereits gelernt, bestimmte Ziele zu erwarten, wenn sie Ihre Codes scannen. Dadurch, dass die codierten URLs identisch bleiben und gleichzeitig die visuelle Präsentation, die Scansicherheit und die Markenausrichtung drastisch verbessern, erstellen Sie einen nahtlosen Übergang, der das Vertrauen verbessert, ohne dass Änderungen an Ihrer digitalen Infrastruktur oder Analyseverfolgung erforderlich sind.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Ein Side-by-side-Vergleich, der einen verblassten, generischen QR-Code neben einer modernen Markenversion zeigt, die dieselbe URL kodiert',
          caption: 'Vor und nach: Die gleiche Ziel-URL, die von einem datierten generischen Code zu einem professionellen Markengut transformiert wird',
        },
      ],
    },
    {
      heading: 'Warum Legacy QR Codes Underperform',
      paragraphs: ['QR-Codes, die in der frühen Einführungsphase erstellt wurden – insbesondere in den Jahren 2020–2021, als Unternehmen sich beeilten, kontaktlose Lösungen einzuführen – weisen häufig mehrere kritische Probleme auf. Niedrige Fehlerkorrektureinstellungen machen sie anfällig, wenn sie auf strukturierten Oberflächen gedruckt oder unter schwierigen Lichtverhältnissen betrachtet werden. Unzureichende Ruhezonen führen zu Scanfehlern, wenn Codes in der Nähe anderer visueller Elemente platziert werden. Generisches Design vermittelt die Markenlegitimität nicht, was zu Zögern und geringeren Scanraten führt.', 'Neben technischen Einschränkungen stellen Legacy-Codes oft verpasste Branding-Möglichkeiten dar. Jeder QR-Code ist ein Touchpoint mit Ihrem Kunden - ein Moment, in dem sie aktiv engagiert sind und bereit sind, Maßnahmen zu ergreifen. Ein professionell gestalteter Code, der Ihren Markenfarben entspricht, beinhaltet angemessene Sicherheitsmargen und optionale Markenelemente verwandelt dieses Dienstprogramm in einen Marketing-Assistenten, der Ihre Identität bei jeder Interaktion verstärkt.'],
    },
    {
      heading: 'Durchführung einer QR Code Audit',
      paragraphs: ['Beginnen Sie Ihr Upgrade-Projekt, indem Sie eine umfassende Bestandsaufnahme jedes QR-Codes erstellen, der derzeit in Ihrem Unternehmen eingesetzt wird. Dokumentieren Sie den physikalischen Ort, das kodierte Ziel, den aktuellen Zustand des Druckmaterials und die typische Scanumgebung einschließlich Lichtverhältnisse und Blickwinkel. Testen Sie jeden Code mit mehreren Geräten - ältere Smartphones und Budget-Geräte zeigen oft Zuverlässigkeit Probleme, die Premium-Handys Maske.', 'Achten Sie besonders auf Codes in High-Stakes-Standorten: Zahlungspunkte, Check-in-Bereiche und Werbeanzeigen, bei denen Scan-Versagen direkt Auswirkungen auf Umsatz oder Kundenerlebnis haben. Diese sollten für ein sofortiges Upgrade priorisiert werden. Beachten Sie auch Codes, die in Fotografie oder Videoinhalt erscheinen, da diese eine Abstimmung mit Ihrem Marketing-Team erfordern, um visuelle Assets zu aktualisieren.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Eine Checkliste-Schnittstelle mit QR-Auditkategorien: Standort, Zustand, Scansicherheit und Prioritätsbewertung',
          caption: 'Systematische QR-Prüfvorlage zur Dokumentation und Priorisierung Ihrer Upgrade-Kandidaten',
        },
      ],
    },
    {
      heading: 'Die sichere Upgrade-Strategie',
      paragraphs: ['Die Kardinalregel der QR-Upgrades ist die Zielkonservierung. Extrahieren Sie die genaue URL aus jedem vorhandenen Code und kodieren Sie sie in Ihrer neuen Version identisch. Damit sind alle vorhandenen Analysen, Umleitungslogik und Kundenerwartungen intakt. Wenn Sie die Zielflexibilität für zukünftige Updates benötigen, ist dies die ideale Zeit, um eine branded Short URL oder einen Umleitungsservice einzuführen - aber dieses als separates Projekt umzusetzen, um Verschmelzungen zu vermeiden.', 'Für die visuelle Aufwertung gelten Verbesserungen in Schichten: zuerst stellen Sie technische Zuverlässigkeit (angemessene Fehlerkorrektur und ruhige Zone), dann fügen Sie Markenstilierung (Farben, Modulformen) hinzu und betrachten Sie schließlich optionale Erweiterungen (Mitte Overlays, Frames). Jede Schicht sollte vor dem Weiterfahren durch Tests validiert werden. Der Sicherheitsmodus von ANQR hilft, diese Prioritäten durch Warnung durchzusetzen, wenn Styling-Optionen die Scannbarkeit beeinträchtigen könnten.'],
    },
    {
      heading: 'Hinzufügen von Markenidentität ohne Kompromisse',
      paragraphs: ['Effektive QR Branding bilanziert visuellen Einfluss auf die Scansicherheit. Beginnen Sie mit der Farbe: ersetzen Sie den standardmäßigen schwarzen Vordergrund durch Ihre primäre Markenfarbe, um einen ausreichenden Kontrast vor Ihrem Hintergrund zu gewährleisten. Für die meisten Marken funktionieren dunkle Farben auf hellen Hintergründen am besten. Vermeiden Sie kontrastreiche Kombinationen, Gradienten, die die Kantenklarheit reduzieren, oder Farben, die unter gemeinsamen Beleuchtungsbedingungen ähnlich erscheinen.', 'Modulformanpassung bietet eine weitere Branding-Möglichkeit mit minimaler Zuverlässigkeitswirkung. Verrundete Module schaffen ein weicheres, näherungswürdigeres Aussehen bei gleichzeitiger exzellenter Scannbarkeit. Dot-Stil-Module funktionieren gut für moderne, tech-forward-Marken. Vernetzte Module passen zu industriellen oder Unternehmensidentitäten. Was auch immer Stil Sie wählen, halten Konsistenz über alle Ihre QR-Einsätze für sofortige Markenerkennung.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Ein Farbraddiagramm mit optimalen QR-Farbkombinationen mit Kontrastverhältnisanzeigen',
          caption: 'Brand Farbauswahlführer mit kontrastreichen Kombinationen, die Scansicherheit gewährleisten',
        },
      ],
    },
    {
      heading: 'Prüf- und Validierungsprotokoll',
      paragraphs: ['Stellen Sie niemals aktualisierte QR-Codes ohne strenge Tests zur Verfügung. Drucken Sie einen physischen Beweis auf die genaue Größe und auf das gleiche Material wie Ihre endgültige Bereitstellung. Testen Sie in der tatsächlichen Lage, wo der Code leben wird, zu verschiedenen Tageszeiten, um Lichtschwankungen zu berücksichtigen. Verwenden Sie mindestens drei verschiedene Geräte: ein aktuelles Flagship-Handy, ein Mid-Range-Gerät und ein älteres oder Budget-Smartphone.', 'Aufzeichnen von Scanzeiten und Erfolgsraten für jeden Test. Ein gut optimierter Code sollte innerhalb von 1-2 Sekunden auf jedem vernünftig modernen Gerät scannen. Wenn Sie konsistente Verzögerungen oder Fehler sehen, reduzieren Sie die Stylingintensität - entfernen oder schrumpfen Überlagerungen, erhöhen Sie die ruhige Zonengröße oder wechseln Sie auf eine höhere Fehlerkorrekturstufe. Die Zuverlässigkeit nimmt immer Vorrang vor der visuellen Raffinesse.'],
    },
    {
      heading: 'Sperrung Ihrer Konfiguration für Konsistenz',
      paragraphs: ['Sobald Sie eine optimale Konfiguration validiert haben, erhalten Sie diese mit den austauschbaren Links von ANQR. Dies erzeugt einen permanenten Rekord jeder Einstellung, die verwendet wird, um Ihren genehmigten Code zu erzeugen - Farben, Modulstil, Fehlerkorrektur, Größe und alle Overlays. Teilen Sie diesen Link mit Ihrem Design-Team, Print-Anbietern und jedem, der den Code in Zukunft reproduzieren muss.', 'Dieses Konfigurationsschloss verhindert den allmählichen Abbau, der viele QR-Einsätze plagt. Ohne es, Personalmitglieder wieder Codes aus Screenshots, Designer wieder aufbauen Einstellungen aus Speicher, und Print-Anbieter machen \'Hilfe\' Anpassungen. Jede Variation führt potentielle Probleme ein. Mit einem gesperrten Konfigurationslink ist jede Wiedergabe identisch mit Ihrem geprüften Original.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Ein Diagramm, das Konfigurationsdrift zeigt: Screenshots, die zu Nachbildungen führen, die zu Varianten führen, im Vergleich zu einem einzigen Link mit einer einzigen Quelle der Wahrheit',
          caption: 'Verhindern Sie die Konfigurationsdrift, indem Sie eine einzige maßgebliche Quelle für alle QR-Reproduktionen erstellen',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Öffnen Sie den Generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR-Beispiele',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR Codes für Einzelhandelszahlungen',
      paragraphs: ['Bezahlung QR-Codes arbeiten in der anspruchsvollsten Umgebung im Einzelhandel: der Zeitpunkt der Transaktion. Kunden sind bereit zu zahlen, oft mit einer Warteschlange, die sich hinter ihnen bildet, und jede Sekunde der Verzögerung schafft Reibung. Doch dieses Hochdruckmoment ist auch die beste Immobilien für Markenverstärkung. Dieser Leitfaden erklärt, wie man Zahlung QR-Codes erstellt, die sofort auf Banking-Apps scannen, während immer noch ein professionelles, branded Aussehen präsentiert, das Kundenvertrauen baut.', 'Das Grundprinzip für die Zahlung QR-Codes ist Zuverlässigkeit gegenüber Ästhetik. Ein wunderschön gestalteter Code, der nicht auf der Banking-App eines Kunden scannt, kostet Sie viel mehr in verlassenen Transaktionen und frustrierten Kunden als ein konservatives Design jemals konnte. Beginnen Sie mit der Compliance, fügen Sie die Zuverlässigkeit hinzu, dann sorgfältig Schicht in Branding nur, wo es die primäre Funktion nicht beeinträchtigt.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Ein Retail-Zähler-Display mit einem Zahlung QR-Code, der von einem Smartphone mit einer Banking-App gescannt wird',
          caption: 'Bezahlung QR-Codes müssen sofort mit Bank- und Geldbeutel-Apps unter realen Bedingungen arbeiten',
        },
      ],
    },
    {
      heading: 'Verstehen der Bezahlung QR-Standards',
      paragraphs: ['Bezahlung QR-Codes folgen in der Regel regionalen Standards, die das Payload-Format diktieren. In Singapur verwendet PayNow QR spezielle Formatierungen. In Indien folgen UPI-Codes BharatQR oder UPI-Standards. Europäische SEPA-Zahlungen verwenden EPC QR-Codes. Jeder Standard besteht, um sicherzustellen, dass Banking-Apps die Zahlungsinformationen sofort erkennen und verarbeiten können. Abweichend von diesen Standards - sogar leicht - können Zahlungsapps dazu führen, Codes abzulehnen, die generische Kameras ohne Probleme lesen.', 'ANQR enthält Vorlagen für große Zahlungsstandards, die Ihre Händlerdaten automatisch in konforme Nutzlasten formatieren. Verwenden Sie diese Vorlagen immer anstatt manuell Zahlungszeichenfolgen zu konstruieren, da selbst kleinere Formatierungsfehler zu Transaktionsfehlern führen können. Wenn der Zahlungsstandard Ihrer Region nicht als Vorlage verfügbar ist, konsultieren Sie die technischen Unterlagen Ihres Zahlungsanbieters für genaue Formatierungsanforderungen.'],
    },
    {
      heading: 'Größe und Platzierung für Zähleranzeigen',
      paragraphs: ['Counter-top QR Codes stellen einzigartige physische Herausforderungen. Kunden scannen in Armlänge, oft unter einem Winkel, manchmal durch Sneeze Guards oder Display-Fälle. Überkopfbeleuchtung schafft Blendpunkte. Der Code konkurriert mit anderen Gegenschneidern für Aufmerksamkeit und klare Sichtlinien. Größe Ihre Zahlung QR großzügig - ein Minimum von 4-5cm wird für die meisten Gegenanwendungen empfohlen, Skalierung nach oben, wenn der Code hinter Glas oder in einem dimly lit Bereich sitzt.', 'Position ist so viel wie Größe. Legen Sie den Code, wo Kunden bequem Ihr Telefon halten können, ohne die Warteschlange zu blockieren oder ungeschickt zu erreichen. Winkeln Sie das Display zum Kunden, anstatt es flach zu legen. Wenn möglich, verwenden Sie matte Laminierung oder nicht reflektierende Anzeigematerialien, um die Blendung von der Oberkopfbeleuchtung zu minimieren. Testen Sie die endgültige Platzierung zu verschiedenen Tageszeiten, um Beleuchtungsprobleme zu fangen.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Ein Diagramm, das optimale Platzierungshöhen und Winkel für verschiedene Zählerkonfigurationen zeigt',
          caption: 'Counter Placement Guide: optimale Höhen, Winkel und Distanzen für eine zuverlässige Zahlungsabtastung',
        },
      ],
    },
    {
      heading: 'Konservative Branding für Zahlungscodes',
      paragraphs: ['Zahlungsapps sind weniger vergeben als generische Kameras Scanner. Viele Banking-Apps verwenden ältere, einfachere QR-Lesealgorithmen, die für Geschwindigkeit und nicht Flexibilität optimiert sind. Dies bedeutet, dass Styling, die perfekt mit einer Telefonkamera funktioniert, mit bestimmten Zahlungsapps scheitern kann. Halten Sie Branding konservativ: Verwenden Sie Ihre Markenfarbe für den Vordergrund, wenn es starken Kontrast hält, aber vermeiden Sie Gradienten, schwere Overlays oder dekorative Elemente, die die Erkennung stören könnten.', 'Wenn Sie ein Center-Logo oder Overlay wollen, halten Sie es extrem klein - nicht mehr als 10-15% des QR-Bereichs - und testen Sie ausführlich mit jeder Zahlungsapp, die Ihre Kunden verwenden könnten. Viele Unternehmen entscheiden sich für keine Overlay-Zahlungscodes speziell, behalten, dass Styling für Marketing QR-Codes, wo Zuverlässigkeit Anforderungen weniger streng sind. Die Aufgabe des Zahlungscodes ist es, Transaktionen zu verarbeiten, nicht visuell zu beeindrucken.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Ein Vergleich mit akzeptablen vs riskanten Branding Levels für Zahlung QR Codes',
          caption: 'Bezahlung QR Branding Spektrum: von sicheren konservativen Styling bis zu riskanten dekorativen Ansätzen',
        },
      ],
    },
    {
      heading: 'Material und Druckbetrachtungen',
      paragraphs: ['Das physikalische Displaymaterial beeinflusst die Scansicherheit erheblich. Glossy lamination reflektiert Scheinwerfer direkt in die Kamera des Kunden. Strukturierte Materialien können Modulkanten verzerren. Günstiges Drucken kann feine Details verschärfen. Für die Zahlung QR-Codes, investieren in Qualität: verwenden Sie matt oder satin Laminierung, stellen Sie hochauflösenden Druck und ersetzen Displays, bevor sie Verschleiß zeigen. Ein verkratzter oder verblassener Zahlungscode kostet Sie Transaktionen.', 'Betrachten Sie die Haltbarkeit und Ersetzbarkeit des Displays. Counter Displays werden berührt, bewegt, spritzt und gelegentlich umgeschlagen. Gestalten Sie Ihr Displaysystem so, dass der QR-Einsatz problemlos ausgetauscht werden kann, ohne den gesamten Stand zu ersetzen. Halten Sie Ersatzdrucke bereit, generiert von Ihrem gesperrten Konfigurationslink, so dass abgenutzte Codes sofort vertauscht werden können.'],
    },
    {
      heading: 'Prüfung mit echter Bezahlung Apps',
      paragraphs: ['Generische Kameras dekodieren fast jeden vernünftig formatierten QR-Code. Zahlungs-Apps sind Pickier. Vor der Bereitstellung einer Zahlung QR-Code, testen Sie es mit jeder Zahlungs-App Ihre Kunden möglicherweise verwenden. In Multi-Payment-Umgebungen könnte dies bedeuten, mit mehreren Banking-Apps, digitalen Geldbörsen und Zahlungsplattformen zu testen. Dokumente, welche Apps Sie getestet haben und ihre Versionen - Zahlungsapps aktualisieren häufig, und ein Update könnte das Scanverhalten ändern.', 'Test unter realistischen Bedingungen: die tatsächliche Anzeige, die tatsächliche Beleuchtung, die tatsächliche Scandistanz. Ein Code, der sofort auf Ihrem Schreibtisch scannt, könnte auf der Theke um 17 Uhr kämpfen, wenn die Nachmittagssonne blendet. Testen Sie mit dem ältesten, billigsten Smartphone, das Sie finden können - wenn es zuverlässig auf einem Budgetgerät funktioniert, wird es an allem arbeiten. Fahne jede Scanzeit über 2 Sekunden für Untersuchung und mögliche Neugestaltung.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Eine Prüfliste mit verschiedenen Zahlungsapps, Gerätetypen und Umweltbedingungen, um zu überprüfen',
          caption: 'Umfassende Zahlung QR-Testmatrix für Apps, Geräte und Umweltfaktoren',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Öffnen Sie den Generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'QR-Beispiele',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'QR Codes: SVG vs PNG',
      paragraphs: ['Der Unterschied zwischen einem QR-Code, der perfekt scannt und einem, der scheitert, kommt oft nach unten, wie es im Print-Workflow exportiert und behandelt wurde. Diese Anleitung erklärt die kritischen Unterscheidungen zwischen Vektor (SVG) und Raster (PNG) Formaten, wenn sie jedes verwenden, und wie man QR-Artwork an Designer und Print-Anbieter aushändigt, die Scan-Verlässlichkeit von Visitenkarten zu Billboard-Größe bewahren.', 'Druckproduktion führt Variablen ein, die auf dem Bildschirm nicht existieren: Farbspreizung, Substrattextur, Finishing-Prozesse und die kumulative Wirkung mehrerer Dateikonvertierungen. Ein QR-Code, der in Ihrer Design-Software perfekt aussieht, kann aus dem Drucker mit erweichten Kanten, reduziertem Kontrast oder subtil verzerrten Modulen entstehen. Verstehen von Formatauswahl und Workflow Best Practices verhindert diese stillen Fehler.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Eine vergrößerte Ansicht Vergleichen Vektor QR-Module mit scharfen Kanten und Raster-Modulen mit Pixelartefakten',
          caption: 'Vector vs raster im Druckmaßstab: die Präzisionsdifferenz, die die Scansicherheit bestimmt',
        },
      ],
    },
    {
      heading: 'Warum Vector (SVG) für den Druck bevorzugt ist',
      paragraphs: ['SVG-Dateien beschreiben QR-Codes als mathematische Formen anstatt Raster von Pixeln. Das bedeutet, dass der Code auf jede Größe skaliert werden kann - von einem 1cm-Label bis zu einem 10-Meter-Banner - ohne Verlust von Kantenschärfe. Der RIP (Raster Image Processor) des Druckers stellt die Vektoren an der nativen Auflösung des Ausgabegerätes dar und gewährleistet, dass jeder Modulrand so scharf ist, wie die Hardware erlaubt. Es gibt keine Interpolation, keine anti-aliasing Artefakte, keine akkumulierten Blähungen aus mehreren Resize-Operationen.', 'Über die Skalierbarkeit hinaus sind SVG-Dateien in professionellen Workflows robuster. Sie überleben Rundtrips durch Design-Software ohne Abbau. Sie können ohne Resampling farbkorrigiert werden. Sie haben sich sauber in PDF-Dateien für die druckfertige Ausgabe eingebettet. Für jede Druckanwendung, bei der Qualität wichtig ist, sollte SVG Ihr Standard-Exportformat sein.'],
    },
    {
      heading: 'Wenn PNG akzeptiert wird',
      paragraphs: ['PNG wird notwendig, wenn Ihr Workflow oder Zielplattform keine Vektorformate unterstützt. Einige Web-Plattformen, Signage CMS-Systeme und ältere Print-Workflows erfordern Rasterbilder. In diesen Fällen kann PNG gut funktionieren - aber nur, wenn Sie strengen Regeln folgen: Export bei der endgültigen physikalischen Größe und Auflösung, nie nach Export zu skalieren und jede verlustreiche Kompression oder Formatumwandlung zu vermeiden.', 'Die kritische Regel für PNG ist die Berechnung Ihrer gewünschten Pixelabmessungen vor dem Export. Wenn Ihr QR bei 5cm druckt und Ihr Drucker bei 300 DPI arbeitet, benötigen Sie etwa 590 Pixel. Export bei dieser Größe oder größer, dann nach unten, wenn nötig - nie nach oben. Fügen Sie diese Informationen in Ihren Dateinamen oder Metadaten ein, so dass zukünftige Nutzer einen größenspezifischen Export nicht versehentlich missverwenden.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Eine Rechenschnittstelle, die die Beziehung zwischen physikalischer Größe, DPI und benötigten Pixelabmessungen zeigt',
          caption: 'Druckauflösungsrechner: Bestimmen der minimalen Pixelabmessungen für Ihre Zielausgabegröße',
        },
      ],
    },
    {
      heading: 'ANQR Exportoptionen erklärt',
      paragraphs: ['ANQR bietet mehrere SVG-Exportmodi für unterschiedliche Workflows. True Vector Mode produziert pure path-basierte Ausgabe ideal für Druck- und professionelle Design-Tools. Wenn Sie Raster-Overlays oder bestimmte Effekte hinzugefügt haben, kann ANQR diese unter Beibehaltung von Vektormodulen einbetten oder Sie können eine vollständig rasterisierte Version in Ihrer angegebenen Auflösung exportieren. Diese Optionen zu verstehen hilft Ihnen, den richtigen Export für jeden Anwendungsfall zu wählen.', 'Für PNG-Exporte können Sie mit ANQR genaue Abmessungen angeben und Optionen für transparente Hintergründe enthalten. Mithilfe der DPI-Einstellung können Sie geeignete Größen für den Druck berechnen. Denken Sie jedoch daran, dass es sich bei DPI um Metadaten handelt. Für den Druck kommt es darauf an, dass genügend Pixel für Ihre physische Größe vorhanden sind. Im Zweifelsfall exportieren Sie größere Mengen, als Sie für nötig halten. Eine Verkleinerung erhält die Qualität, während eine Vergrößerung sie zerstört.'],
    },
    {
      heading: 'Dateien für Handoff vorbereiten',
      paragraphs: ['Bei der Weitergabe von QR-Kunstwerken an Designer oder Print-Anbieter sind klare Vorgaben enthalten: die vorgesehene physikalische Größe, minimale Anforderungen an die ruhige Zone und alle Farbraumbetrachtungen. Für kritische Anwendungen bieten sowohl einen SVG-Master als auch ein hochauflösendes PNG-Backup, das eindeutig mit ihren Verwendungszwecken gekennzeichnet ist. Fügen Sie Ihren ANQR Konfigurationslink ein, damit der Code bei Bedarf regeneriert werden kann.', 'Erwarten Sie häufige Fehler im Handoff-Prozess. Erklären Sie einfach, dass der QR nicht skaliert, gedreht, gesäumt oder Effekte angewendet werden sollte. Geben Sie an, dass die ruhige Zone klar bleiben muss - keine Erntemarken, Registrierungsmarken oder Designelemente eindringen. Wenn der QR auf einem farbigen oder fotografischen Hintergrund platziert wird, stellen Sie eine Version mit einer opaken Trägerform zur Verfügung, um einen ausreichenden Kontrast zu gewährleisten.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Ein Dateipaketdiagramm, das SVG-Master, PNG-Backup, Spezifikationen Dokument und Konfigurationslink zeigt',
          caption: 'Professionelles QR-Übergabepaket: alles, was ein Designer oder Druckanbieter für eine genaue Reproduktion benötigt',
        },
      ],
    },
    {
      heading: 'Verifizieren von Drucknachweisen',
      paragraphs: ['Genehmigen Sie nie einen Drucklauf, ohne einen physikalischen Beweis zu scannen. Fordern Sie einen Nachweis auf dem eigentlichen Substrat mit der eigentlichen Ausrüstung, die in der Produktion verwendet wird. Scannen Sie den Nachweis unter Beleuchtungsbedingungen ähnlich, wo das Endstück angezeigt wird. Testen Sie mit mehreren Geräten, darunter ältere Smartphones, die mit Randqualität kämpfen könnten.', 'Wenn der Nachweis langsam oder unkonsistent scannt, untersuchen Sie vor der Genehmigung. Häufige Probleme sind unzureichende Kontraste auf farbigen Substraten, ruhige Zone Verletzungen von Trimmen, Farbspreizmodul Ränder, oder Laminierung schaffen Blende. Alle diese können angesprochen werden, bevor Sie sich an einen Volldrucklauf verpflichten - aber nur, wenn Sie sie in der Beweisphase fangen.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Eine Prüfliste mit Scantestergebnissen, Kontrastmessungen und Genehmigungszeichen',
          caption: 'Drucknachweis-Verifikations-Workflow: systematische Tests, bevor sie sich auf Produktionsmengen verpflichten',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Öffnen Sie den Generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'QR-Beispiele',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Animierte QR Codes erstellen',
      paragraphs: ['Animierte QR-Codes kombinieren die Funktionalität von Standard QR-Codes mit auffälliger Bewegung, die die Eingriffsraten drastisch erhöht. In digitalen Zeichen, sozialen Medien und interaktiven Displays verwandelt Animation ein statisches Dienstprogramm in ein überzeugendes visuelles Element, das das Auge zieht und Interaktion einlädt. Diese Anleitung deckt die Prinzipien, Techniken und praktischen Zwänge ab, animierte QR-Codes zu schaffen, die zuverlässig scannen und visuelle Auswirkungen erzielen.', 'Die grundlegende Herausforderung animierter QR-Codes besteht darin, visuelles Interesse und Scan-Zuverlässigkeit in Einklang zu bringen. Jeder Frame muss einzeln scannbar sein – ein Scanner kann den Code zu jedem Zeitpunkt im Animationszyklus erfassen. Diese Einschränkung prägt jede Designentscheidung: Welche Elemente können sich bewegen, wie stark können sie sich ändern und was muss während der gesamten Animation stabil bleiben.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Ein digitales Signage-Display, das eine animierte QR-Code Erfassung Zuschauer Aufmerksamkeit in einem öffentlichen Raum zeigt',
          caption: 'Animierte QR-Codes in digital signage: Bewegung, die Aufmerksamkeit anzieht und das Scannen fördert',
        },
      ],
    },
    {
      heading: 'Wie Animation die Scannbarkeit beeinflusst',
      paragraphs: ['QR-Scanner arbeiten, indem sie einen einzigen Rahmen erfassen und das Muster von hellen und dunklen Modulen analysieren. Für einen animierten Code zur Arbeit muss jeder Frame das komplette, gültige QR-Muster enthalten. Dies führt Animationen aus, die die Codestruktur verändern, Module auflösen oder das Kontrastmuster signifikant verändern. Die Datenträgermodule - das scheinbar zufällige Muster im Zentrum - müssen durchweg visuell stabil bleiben.', 'Sichere Animation Ansätze modifizieren Elemente, die keine Daten tragen: Hintergrund, Farben, dekorative Rahmen, und Overlay Elemente. Die Strukturkomponenten - Finder-Muster (die großen Eckquadrate), Timing-Muster (die Wechsellinien) und Ausrichtungsmuster (kleinere Quadrate in größeren Codes) müssen ihre Positionen und Anteile beibehalten. Die Arbeit innerhalb dieser Zwänge ermöglicht immer noch überraschend dynamische und ansprechende Animationen.'],
    },
    {
      heading: 'Animationstechniken Diese Arbeit',
      paragraphs: ['Farbradfahren stimuliert die Vordergrund- und Hintergrundfarben durch eine Palette und hält bei jedem Schritt ausreichend Kontrast. Dadurch entsteht ein lebendiger, aufmerksamkeitsstarker Effekt mit minimalem Scan-Risiko - solange der Kontrast nie unter lesbaren Levels fällt. Die Farbzyklusvoreinstellungen von ANQR sind so konzipiert, dass die Scannbarkeit während des gesamten Zyklus erhalten bleibt.', 'Animierte Overlays setzen bewegte Bilder hinter einem halbtransparenten QR-Muster. Der Code bleibt stabil, während der Hintergrund animiert - vielleicht ein Schleifvideo, animierte Markenelemente oder abstrakte Bewegungsgrafiken. Diese Technik erfordert ein sorgfältiges Intensitätsmanagement, um zu verhindern, dass der Hintergrund das QR-Muster überfordert, aber die visuell auffälligsten Ergebnisse erzeugt.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Ein Diagramm, das die Schichtstruktur eines animierten QR zeigt: stabile Codeschicht über animierte Hintergrundschicht',
          caption: 'Animationsschichtprinzip: Das QR-Muster bleibt konstant, während Hintergrundelemente unter',
        },
      ],
    },
    {
      heading: 'Konfiguration von Animationsparametern',
      paragraphs: ['Die Framerate beeinflusst sowohl die visuelle Glättung als auch die Dateigröße. Für die meisten Anwendungen bietet 10-15 Frames pro Sekunde glatt aussehende Bewegung ohne übermäßige Dateigrößen. Höhere Bildraten bieten abnehmende visuelle Renditen bei deutlich steigender Dateigröße. Betrachten Sie Ihren Lieferkontext - ein großes digitales Zeichen kann größere Dateien behandeln als eine mobile Anzeige Platzierung.', 'Loop-Verhalten bestimmt, wie die Animationszyklen. Nahtlose Schleifen schaffen kontinuierliche Bewegung ideal für Signage und Umgebungsanzeigen. Ping-pong (forward-then-reverse) Schleifen funktionieren gut für einfache Animationen. Für aufmerksamkeitsreibende Impulse, betrachten Animationen mit Halte - Zeiträume der Stille durch Bewegung, die das Auge ohne ständige Bewegungsermüdung zieht.'],
    },
    {
      heading: 'Animierte Overlays erstellen',
      paragraphs: ['Bei Verwendung von animierten Bildern (GIFs, animierten WebPs oder Video) als Overlays extrahiert ANQR Frames und verdichtet sie mit Ihrem QR-Code. Die Overlay-Intensity-Einstellung steuert, wie viel die Animation zeigt - niedrigere Werte priorisieren die Scannbarkeit, während höhere Werte die visuelle Wirkung begünstigen. Testen Sie Ihre gewählte Intensität über mehrere Frames, um eine einheitliche Scannbarkeit zu gewährleisten.', 'Quelle Materialqualität wirkt deutlich auf Ergebnisse. Verwenden Sie Overlays mit klaren Themen und guten Kontrast. Vermeiden Sie Quellanimationen mit schnellen Blitz- oder extremen Helligkeitsänderungen, die gelegentliche kontrastreiche Rahmen schaffen könnten. Zeigen Sie den gesamten Animationszyklus vor dem Export auf alle problematischen Frames, die möglicherweise nicht scannen.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Ein rahmenweiser Blick auf eine animierte Overlay mit über die Sequenz gehaltenen Kontrastpegeln',
          caption: 'Rahmenanalyse: Überprüfung der konsistenten Scannbarkeit über den gesamten Animationszyklus',
        },
      ],
    },
    {
      heading: 'Export und Lieferung Erwägungen',
      paragraphs: ['GIF bleibt das am weitesten unterstützte animierte Format, das in den meisten Kontexten automatisch gespielt wird, ohne Videoplayer-Unterstützung zu benötigen. Die 256-Farbpalette von GIF beschränkt jedoch die Farbtreue. Für farbkritische Animationen, betrachten Sie animierte WebP, wo unterstützt, oder fallen Sie zurück auf Videoformate für höchste Qualität. Der GIF-Export von ANQR beinhaltet verschiedene Optionen, um die Qualität innerhalb der Palettenbeschränkungen zu maximieren.', 'Dateigröße ist wichtig für die Lieferung. Digitale Signage-Systeme, E-Mail-Clients und soziale Plattformen verhängen oft Größenlimits. Wenn Ihre Animation diese Grenzen überschreitet, reduzieren Sie die Rahmenzahl, die Abmessungen oder die Farbtiefe. Manchmal erreicht die Aufteilung einer komplexen Animation in eine kürzere Schleife bessere Ergebnisse als aggressive Kompression, die jeden Rahmen abbaut.'],
    },
    {
      heading: 'Prüfung von animierten QR-Codes',
      paragraphs: ['Die Prüfung animierter Codes erfordert das Scannen an mehreren Punkten im Animationszyklus. Scannen Sie nicht einfach einmal und nehmen Sie Erfolg - Scannen Sie wiederholt, in verschiedenen Momenten, um zu überprüfen, ob jeder Frame lesbar ist. Achten Sie besonders auf Frames bei Farbzyklusextremen oder Overlay-Intensitätsspitzen, bei denen der Kontrast niedrig sein könnte.', 'Testen Sie auf der eigentlichen Display-Hardware, wo möglich. Überwachen Sie Farbkalibrierung, Blickwinkel und Umgebungsbeleuchtung, wie die Animation erscheint und scannt. Eine helle Animation, die perfekt auf Ihrem Monitor scannt, kann auf einem Außenbildschirm auswaschen oder bei schrägen Blickwinkeln unlesbar werden.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Eine Testmatrix mit Scan-Erfolgsraten über verschiedene Frames, Geräte und Anzeigebedingungen',
          caption: 'Animiertes QR-Testprotokoll: systematische Überprüfung über Frames, Geräte und Betrachtungsbedingungen',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Öffnen Sie den Generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'QR-Beispiele',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR Sicherheit und Compliance Best Practices',
      paragraphs: ['Ein wunderschön gestalteter QR-Code, der nicht scannen kann, ist schlechter als nutzlos - er frustriert Kunden, schädigt Markenwahrnehmung und verschwendet jede Ressource, die in ihre Kreation und Verteilung investiert wird. Diese Anleitung deckt die technischen und praktischen Faktoren ab, die bestimmen, ob ein QR-Code zuverlässig scannen wird, und wie man die Sicherheitsmerkmale von ANQR verwendet, um potenzielle Probleme zu erfassen, bevor sie die Produktion erreichen.', 'QR-Code Zuverlässigkeit ist nicht binär. Ein Code kann perfekt auf Flagship-Handys scannen, aber auf Budget-Geräten scheitern. Es könnte in idealer Beleuchtung arbeiten, aber in dim Restaurants oder hellem Sonnenlicht kämpfen. Das Verständnis der Faktoren, die die Scannbarkeit beeinflussen, hilft Ihnen, informierte Tradeoffs zwischen visuellem Styling und real-world Zuverlässigkeit zu machen.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Ein Zuverlässigkeitsspektrum, das QR-Codes zeigt, die von höchst abtastbar bis marginal lesbar sind',
          caption: 'Das Scannbarkeitsspektrum: von kugelsicheren Codes bis hin zum Styling, das die Zuverlässigkeitsgrenzen drängt',
        },
      ],
    },
    {
      heading: 'Fehlerkorrektur Levels verstehen',
      paragraphs: ['QR-Codes umfassen eingebaute Redundanz, die es ermöglicht, auch wenn teilweise beschädigt oder verdeckt gelesen werden. Die Fehlerkorrekturebene - L (7%), M (15%), Q (25%) oder H (30%) - bestimmt, wie viel der Code fehlt, während sie noch korrekt dekodiert. Höhere Fehlerkorrektur schafft größere Codes, bietet aber eine Sicherheitsmarge für Overlays, Druckfehler und Umweltschäden.', 'Für Codes mit Bildüberlagerungen, Fehlerkorrekturebene H ist essentiell - die Overlay physisch verdeckt einen Teil des Codes, und Sie brauchen, dass 30% Redundanz, um die Zuverlässigkeit zu erhalten. Für saubere, unmodifizierte Codes in kontrollierten Umgebungen genügt Level M oft. Ebene L sollte für Situationen reserviert werden, in denen die Codegröße kritisch eingeschränkt ist und Sie pristine Bedingungen garantieren können.'],
    },
    {
      heading: 'Die Critical Quiet Zone',
      paragraphs: ['Die ruhige Zone ist der leere Rand, der jeden QR-Code umgibt. Scanner verwenden diese Grenze, um festzustellen, wo der Code beginnt und endet. Die ISO-Norm gibt eine minimale Ruhezone von vier Modulen an (viermal die Breite des kleinsten Quadrats im Code). Verwechslung dieses Raumes - mit Designelementen, Trimmkanten oder angrenzenden Inhalten - ist eine der häufigsten Ursachen für Scanfehler.', 'Die leise Zonendurchführung von ANQR hilft dabei, diesen kritischen Abstand zu halten, aber Sie müssen auch sicherstellen, dass sie in Ihren endgültigen Designs erhalten bleibt. Wenn Sie QR-Artwork aushändigen, geben Sie ausdrücklich die Anforderungen der ruhigen Zone an. Wenn Codes in Layouts gesetzt werden, überprüfen Sie, dass keine Elemente in diesen Raum eindringen. Ein paar Millimeter klarer Raum kann den Unterschied zwischen zuverlässigen Scannen und frustrierten Kunden bedeuten.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Ein Diagramm mit korrektem Ruhezonenabstand gegen häufige Verletzungen, die Scan-Fehler verursachen',
          caption: 'Quiet zone Anforderungen: die unsichtbare Marge, die den Scanerfolg bestimmt',
        },
      ],
    },
    {
      heading: 'Kontrast- und Farbsicherheit',
      paragraphs: ['QR-Scanner erkennen das Muster von hellen und dunklen Modulen. Jedes Styling, das diesen Kontrast reduziert - helle Vordergrund, dunkle Hintergründe, Gradienteneffekte oder Low-opacity Overlays - macht den Code härter zu lesen. ANQR berechnet Kontrastverhältnisse und warnt, wenn Ihre Farbwahlen gefährliche Werte annähern, aber der endgültige Arbiter ist immer real-world-Test.', 'Farbwahrnehmung variiert mit Lichtverhältnissen. Eine Farbkombination, die hochkontrast auf Ihrem Monitor erscheint, könnte schwierig werden, unter warmen Glühlampen oder kühlen Leuchtstoffröhren zu unterscheiden. Wenn Ihr Code in unterschiedlichen Lichtverhältnissen eingesetzt wird, testen Sie unter mehreren Lichtquellen und betrachten Sie mehr konservative Kontrastverhältnisse als Sicherheitsmarge.'],
    },
    {
      heading: 'Modul Größe und Ansicht Distanz',
      paragraphs: ['Die physikalische Größe einzelner Module bestimmt den maximalen Abstand, von dem ein Code abgetastet werden kann. Kleinere Module bedeuten kleinere Codes, erfordern aber nähere Scandistanzen. Die allgemeine Regel ist, dass jedes Modul mindestens 0,5 mm in der vorgesehenen Abtaststrecke sein sollte, wobei das Skalieren für größere Entfernungen proportional ist. Ein Code auf einem Billboard benötigt viel größere Module als ein Code auf einer Visitenkarte.', 'Betrachten Sie bei der Berechnung der Modulgröße das schlimmste Szenario: der Kunde mit einem älteren Telefon, in unvollkommener Beleuchtung, Scannen in der höchstwahrscheinlichen Entfernung. Design für diesen Benutzer, und alle anderen haben eine noch bessere Erfahrung. ANQR\'s Größenempfehlungen Faktor in diesen realen Größen, um geeignete Dimensionen für Ihre beabsichtigte Verwendung vorzuschlagen.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Ein Diagramm über Modulgröße, Druckmaße und maximale effektive Scandistanz',
          caption: 'Entfernungsanleitung Scannen: Anpassung der Modulgröße an Ihre Einsatzanforderungen',
        },
      ],
    },
    {
      heading: 'Verwendung von ANQR Sicherheitsmodus',
      paragraphs: ['Der Sicherheitsmodus von ANQR liefert Echtzeit-Feedback zur Scansicherheit. Es überwacht Kontrastverhältnisse, die Einhaltung der Zonen, die Überlagerungsintensität und andere Faktoren, die die Scannbarkeit beeinflussen. Wenn sich ein Parameter auf riskante Levels nähert, sehen Sie Warnungen mit gezielter Anleitung, wie Sie die Zuverlässigkeit verbessern können. Für professionelle Bereitstellungen, bei denen der Ausfall kostspielig ist, halten Sie den Sicherheitsmodus während des gesamten Designprozesses aktiv.', 'Der Sicherheitsmodus beinhaltet auch eine Scan-Verifikationsfunktion, die versucht, Ihren generierten Code zu dekodieren und Erfolg oder Misserfolg meldet. Während diese In-App-Verifikation nicht jeden realen Zustand replizieren kann, fängt es viele häufige Probleme, bevor Sie in Druck oder Vertrieb investieren. Behandeln Sie eine erfolgreiche Überprüfung als Mindestriegel, keine Garantie - real-world-Tests bleibt unerlässlich.'],
    },
    {
      heading: 'Real-World Testing Protocols',
      paragraphs: ['Keine Menge Software-Verifikation ersetzt physikalische Tests. Drucken Sie Ihren Code in der vorgesehenen Größe auf repräsentativem Material. Testen Sie es in der realen Einsatzumgebung mit Lichtbedingungen, die der realen Nutzung entsprechen. Scannen mit mehreren Geräten - nicht nur Ihr Flaggschiff-Handy, sondern Budget Android-Geräte, ältere iPhones, und alle spezifischen Geräte, die Ihr Publikum häufig verwendet.', 'Dokumentieren Sie Ihre Tests systematisch. Aufzeichnen, welche Geräte unter welchen Bedingungen getestet wurden, mit welchen Ergebnissen. Wenn Sie Codes im Maßstab bereitstellen, stellen Sie Akzeptanzkriterien fest: vielleicht 95% Erfolgsquote über Ihren Gerätetestpool oder erfolgreiche Scans innerhalb von 2 Sekunden auf allen getesteten Geräten. Diese Standards helfen, Go/No-Go-Entscheidungen objektiv zu machen, anstatt auf das Beste zu hoffen.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Eine umfassende Prüfliste für Geräte, Bedingungen und Akzeptanzkriterien',
          caption: 'QR-Bereitstellungsprüfungsprotokoll: systematische Überprüfung vor Produktionsengagement',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Öffnen Sie den Generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR-Beispiele',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'QR-Beispiele', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Vollständige Anleitung öffnen', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Die Galerie öffnen', type: 'gallery' },
  ],
};
