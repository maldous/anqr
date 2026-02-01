import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR Benutzerhandbuch',
  description: 'Kompletter Leitfaden zur Verwendung von ANQR zur Erstellung von QR-Codes.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Öffnen Sie den Generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Mehr erfahren', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR-Beispiele', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Erste Schritte',
      paragraphs: ['ANQR ist ein QR-Codegenerator mit einem Client-First-Ansatz. Standardmäßig werden QR-Codes lokal in Ihrem Browser generiert - kein Konto erforderlich und Ihre Daten bleiben privat. Zur professionellen Einbettung können Sie auch die serverseitige API verwenden.', 'Die Schnittstelle verfügt über drei Schnittstellenebenen: Basic, Advanced und Professional. Wählen Sie Ihr Level mithilfe der Registerkarten in der Kopfzeile aus. Mit jedem Level werden zusätzliche Funktionen freigeschaltet, während sich die Benutzeroberfläche auf das konzentriert, was Sie brauchen.'],
      bullets: ['Basic: Einfache QR-Code-Erstellung mit Klartext/URL Inhalt und Bildüberlagerung.', 'Fortgeschritten: QR-Kodierungsoptionen, Rendering-Stile, Animation, Ausgabeformate, erweiterte Content-Typen und Overlay-Anpassung.', 'Professional: Wasserzeichen, Metadaten, Teilen, Sicherheitsanalyse, Zahlung QR-Codes und Unternehmensfunktionen.'],
      links: [{ href: '/?lang=${lang}', label: 'Öffnen Sie den Generator', type: 'generator' }],
    },
    {
      heading: 'Schneller Start',
      paragraphs: ['Um Ihren ersten QR-Code zu erstellen:'],
      bullets: ['ANHANG Wählen Sie einen Inhaltstyp (URL, Text, WLAN, etc.) aus dem Content Type Dropdown.', '2. Geben Sie Ihre Daten in die angegebenen Felder ein.', '3. Optional Farben, Stile anpassen und ein Overlay-Bild hinzufügen.', '4. Klicken Sie auf Export, um Ihren QR-Code als PNG, GIF, WebP oder SVG herunterzuladen.'],
      links: [{ href: '/?lang=${lang}', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Grundlegende Eigenschaften',
      paragraphs: ['Das Basic Level bietet eine optimierte Schnittstelle zum Erstellen von QR-Codes mit Payload-Inhalte und Bildüberlagerungen. Dies ist der einfachste Weg, um loszulegen.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Inhaltstypen (Basic)',
      paragraphs: ['Plain Text: Kode jeden Text bis zur QR-Code-Kapazitätsgrenze. Ideal für kurze Nachrichten, Codes oder Kennungen.', 'URL: Webadressen kodieren. Der QR-Code öffnet die URL beim Scannen. Unterstützt http:// und https:// Protokolle.'],
    },
    {
      heading: 'Image Overlay (Basic)',
      paragraphs: ['Laden Sie ein Bild (JPG, PNG, GIF, WebP) hoch, um sich mit Ihrem QR-Code zu verbinden. Grundlegende Overlay-Funktionen umfassen:'],
      bullets: ['Hochladen von Datei: Wählen Sie ein Bild aus Ihrem Gerät.', 'Von URL laden: Geben Sie eine Bild-URL ein (muss CORS zulassen).', 'Center Logo: Platziert Bild in der Mitte, basierend auf Fehlerkorrektur.', 'Blend: Einfache Alpha-Mischung von Bild mit QR-Muster.', 'Intensität: Kontrolliert, wie stark die Overlay den QR-Code (0-100%) beeinflusst.', 'Farbmodus: Volle Farbe, Grayscale, oder Schwarz & Weiß.', 'Preserve Finder Patterns: Halten Sie Eckmuster für zuverlässiges Scannen unmodifiziert.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Erweiterte Funktionen',
      paragraphs: ['Die Advanced Level entsperrt QR-Kodierungsoptionen, Stile, Animation, Ausgabeformate, erweiterte Content-Typen und erweiterte Overlay-Anpassung.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'QR Encoding Einstellungen',
      paragraphs: ['Ausführung: QR-Codes kommen in Versionen 1-40, mit höheren Versionen mit mehr Daten, aber größer. Setzen Sie auf 0 (Auto) um ANQR die kleinste Version auszuwählen, die Ihren Inhalt passt.', 'Fehlerkorrektur: Bestimmt, wie viel Schaden ein QR-Code erhalten kann, während noch scannbar.'],
      bullets: ['L (Low): 7% Fehlerkorrektur - kleinste Größe, geringste Redundanz.', 'M (Medium): 15% Fehlerkorrektur - ausgeglichene Option.', 'Q (Quartile): 25% Fehlerkorrektur - gut für gedruckte Codes.', 'H (High): 30% Fehlerkorrektur - am besten für Codes mit Overlays oder unter harten Bedingungen.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Quiet Zone (Margin)',
      paragraphs: ['Die ruhige Zone ist der weiße Raum um den QR-Code. Scanner brauchen diese Marge, um festzustellen, wo der Code beginnt. Der Standard empfiehlt mindestens 4 Module. Unter 4 reduzieren kann Scanprobleme verursachen.'],
    },
    {
      heading: 'Modul Stil',
      paragraphs: ['Module sind die einzelnen Quadrate, die einen QR-Code bilden. ANQR bietet fünf Stile:'],
      bullets: ['Platz: Klassisches QR-Auftritt mit scharfen Ecken.', 'Rund: Weiche Ecken für einen freundlichen Look.', 'Punkte: Rundmodule für eine moderne Ästhetik.', 'Diamant: 45° gedrehte Quadrate für ein unverwechselbares Muster.', 'Vernetzt: Module verschmelzen, wenn benachbart, schaffen organische Formen.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Finder Muster Stil',
      paragraphs: ['Finder-Muster sind die drei großen Quadrate in QR-Ecken, die Scanner helfen, den Code zu orientieren. Verfügbare Stile:'],
      bullets: ['Platz: Standard quadratische Ecken.', 'Rund: Weiche Ecken passend zum abgerundeten Modulstil.', 'Kreis: Kreisfindermuster für Punkt-Stil Codes.'],
    },
    {
      heading: 'Alignment & Timing Muster',
      paragraphs: ['Ausrichtungsmuster erscheinen in größeren QR-Codes (Version 2+), um Verzerrungen zu korrigieren. Timing-Muster sind die Wechsellinien, die Finder-Muster verbinden.'],
      bullets: ['Ausrichtungsstil: Match Finder, Square, Rounded, oder Circle.', 'Timing Style: Match Module, Solid oder Dashed.'],
    },
    {
      heading: 'Farben',
      paragraphs: ['Vordergrund: Die Farbe der QR-Module. Schwarz (#000000) ist Standard, aber jede dunkle Farbe funktioniert.', 'Hintergrund: Die Hintergrundfarbe. Weiß (#ffffffff) ist Standard. Gewährleistung eines ausreichenden Kontrasts zum Vordergrund.', 'Transparenter Hintergrund: Entfernen Sie den Hintergrund vollständig für den Einsatz auf farbigen Oberflächen. Die Oberfläche sorgt für einen ausreichenden Kontrast.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Modulgröße & Gap',
      paragraphs: ['Modulgröße: Regelt, wie groß jedes Modul in Pixeln dargestellt wird. Größere Werte schaffen größere, einfacher zu scannende Codes.', 'Modul Gap: Füget Raum zwischen Modulen als Prozentsatz hinzu. Kleine Lücken (5-15%) können die Scannbarkeit bei einigen Bedingungen verbessern, aber übermäßige Lücken reduzieren die Zuverlässigkeit.'],
    },
    {
      heading: 'Ausgabeeinstellungen',
      paragraphs: ['Format: Wählen Sie Ihr Exportformat basierend auf Use Case.'],
      bullets: ['PNG: Lossless Rasterformat, ideal für die meisten Anwendungen. Best für Print und Digital.', 'WebP: Modernes Format mit kleineren Dateigrößen. Gut für Web-Nutzung.', 'GIF: Erforderlich für animierte QR-Codes. Unterstützt Transparenz.', 'SVG: Vektorformat, das unendlich skaliert. Best für großen Druck oder wenn Sie den Code bearbeiten müssen.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' },
      ],
    },
    {
      heading: 'Ausgangsgrößen',
      paragraphs: ['Breite/Höhe: Legen Sie die Ausgabegröße in Pixel. Für den Druck berechnen Sie basierend auf DPI (z.B. 300 DPI bei 1 Zoll = 300px). Größere Größen scannen zuverlässiger im Abstand.'],
    },
    {
      heading: 'Animationseinstellungen (erweitert)',
      paragraphs: ['Control animated QR Code Verhalten:'],
      bullets: ['Geschwindigkeit: Animation Frame Rate in Millisekunden.', 'Schleife: Kontinuierliche oder einspielige Animation.', 'Bounce: Ping-pong Animationsrichtung.', 'Start Frame: Beginnen Sie die Animation von einem bestimmten Rahmen.', 'Max Frames: Limit Gesamtrahmen in Animation.', 'Frame Step: Wechseln Sie Frames für schnellere Animation.', 'Interpolation: Keine, Crossfade oder Morph zwischen Rahmen.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' },
      ],
    },
    {
      heading: 'Inhaltstypen (erweitert)',
      paragraphs: ['Erweiterte Ebene entsperrt zusätzliche Payload-Formate:'],
      bullets: [
        'Telefonnummer (tel:): Erstellt eine rufbare Telefonverbindung.',
        'Email (mailto:): Öffnet E-Mail-Client mit optionalem Subjekt und Körper.',
        'SMS: Vorgefüllte Textnachricht an eine Telefonnummer.',
        'vCard: Vollständige Kontaktkarte mit Namen, Organisation, Telefon, E-Mail, Adresse.',
        'MeCard: Kompaktes Kontaktformat beliebt in Japan.',
        'BizCard: Legacy Visitenkartenformat.',
        'Standort: GPS Koordinaten, die in Karten öffnen.',
        'WiFi: Netzwerk-Anmeldeinformationen für automatische Verbindung (SSID, Passwort, Sicherheitstyp).',
        'Kalenderveranstaltung: iCalendar Format mit Titel, Ort, Datum/Zeit.',
        'Veranstaltung RSVP: Link zur Anmeldeseite.',
        'Kalender Abonnieren: Abonnieren Sie einen ICS/WebCal Feed.',
        'Datei/Dokument-URL: Direkter Link zu herunterladbaren Dateien.',
        'Cloud Storage Link: Links zu Google Drive, Dropbox, OneDrive, etc.',
        'Soziales Profil: Links zu LinkedIn, Twitter, Instagram, etc.',
        'Messaging Link: WhatsApp, Telegram, Signal tiefe Links.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Erweiterte Overlay-Funktionen',
      paragraphs: ['Zusätzliche Overlay-Funktionen:'],
      bullets: ['Crop: Aktivieren Sie das Ernten, um eine quadratische Region Ihres Bildes auszuwählen.', 'Halftone: Klassisches Druckmuster basierend auf Bildhelligkeit.', 'Dithered: Fehler-Diffusion Dithering für detaillierte Reproduktion.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Overlay Blend Modes (erweitert)',
      paragraphs: ['Zusätzliche Mischmodi in Advanced Level:'],
      bullets: ['Subpixel: Verteilt jedes Modul in Subpixel für höhere Details.', 'Blue Noise: Verwendet blaue Geräusche, die für artifact-freie Muster dithering.', 'Mosaic: Fliesen-basierte Wirkung Erhaltung der Bildstruktur.', 'Gap Fill: Platziert Bild in Lücken zwischen Modulen.', 'Helligkeit: Variiert Modulgröße basierend auf Bildhelligkeit.', 'Duotone: Kartenbild zu zwei Farben für markante Kontraste.'],
    },
    {
      heading: 'Overlay Intensität',
      paragraphs: ['Kontrolliert, wie stark die Overlay den QR-Code (0-100%) beeinflusst. Höhere Werte zeigen mehr Bilddetail, können aber die Scannbarkeit reduzieren. Starten Sie rund 70% und passen Sie sich auf der Grundlage der Tests an.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' }],
    },
    {
      heading: 'Farbmodus',
      paragraphs: ['Wie das Overlay-Bild verarbeitet wird:'],
      bullets: ['Volle Farbe: Reserviert Original-Bildfarben.', 'Grayscale: Konvertiert in schwarze und weiße Töne.', 'Schwarz & Weiß: Hohe Kontrast binäre Umwandlung.'],
    },
    {
      heading: 'Preserve Finder Patterns',
      paragraphs: ['Wenn aktiviert, hält die drei Eckfindermuster durch die Overlay unmodifiziert. Stark empfohlen für eine zuverlässige Abtastung.'],
    },
    {
      heading: 'Image Preprocessing',
      paragraphs: ['Bewerben Sie Filter auf Ihr Overlay-Bild vor dem Mischen. Diese Einstellungen können verbessern, wie das Bild im letzten QR-Code erscheint.'],
      bullets: ['Helligkeit (-100 bis +100): Beleuchten oder verdunkeln Sie das Bild.', 'Kontrast (-100 bis +100): Erhöhen oder verringern Tonbereich.', 'Gamma (0,2 bis 3,0): Nichtlineare Helligkeitseinstellung. Werte unter 1 hellen Midtonen, über 1 verdunkeln sie.', 'Sättigung (-100 bis +100): Farbintensität. -100 ist grau, +100 ist übersättigt.', 'Hue Rotate (0-360°): Schalten Sie alle Farben um das Farbrad.', 'Blur (0-20px): Erweichen Sie Bilddetails.', 'Sharpen (0-100%): Kanten und Details verbessern.', 'Posterize (0-16 Levels): Reduzieren Sie Farbwerte für einen Poster-Effekt.', 'Schwelle (0-255): Konvertiert in binäre Schwarz/Weiß am Cutoff-Punkt.', 'Kantenerkennung: Sobel oder Canny Algorithmen nur Kanten zeigen.', 'Invert: Reverse alle Farben.'],
    },
    {
      heading: 'Auf dem Weg',
      paragraphs: ['Wie das Overlay-Bild auf den QR-Code-Bereich passt:'],
      bullets: ['Cover: Bild füllt den gesamten Bereich, wenn nötig.', 'Enthalten: Gesamtes Bild sichtbar, kann Margen haben.', 'Stretch: Bild verzerrt genau zu füllen.'],
    },
    {
      heading: 'Transformieren von Optionen',
      paragraphs: ['Rotation: Drehen Sie Overlay in 90° Schritten.', 'Flip X/Y: Spiegeln Sie das Bild horizontal oder vertikal.'],
    },
    {
      heading: 'Dithering Algorithmen',
      paragraphs: ['Dithering konvertiert fortlaufende Bilder zu Mustern, die QR-Codes darstellen können. Erhältlich bei Verwendung von Dithered, Blue Noise oder True Dither Blend Modi.'],
      bullets: [
        'Fehler Diffusion: Classic Floyd-Steinberg Stil. Spreads Quantisierungsfehler zu benachbarten Pixeln.',
        'Bestellung (Bayer): Benutzt eine Schwellwertmatrix für regelmäßige Muster.',
        'Clustered Dot: Simuliert Rasterdruck.',
        'Void & Cluster: Optimierte bestellte Dithering.',
        'Blue Noise: Visuell angenehmes zufällig aussehendes Muster.',
        'Blauer Lärm Schwelle: Schwellendithering mit blauer Rauschtextur.',
        'White Noise: Random Schwelle dithering.',
        'Gaussian/Triangular Lärm: Lärm mit unterschiedlichen Verteilungen.',
        'Blue Noise + Fehler Diffusion: Hybrid kombiniert beide Techniken.',
        'Screened Blue Noise: Screenähnliches blaues Rauschmuster.',
        'Wahrnehmung: Leuchtkraftgewichtet für bessere visuelle Ergebnisse.',
        'Edge-Aware: Reserviert Bildkanten beim Dithering.',
        'Anpassungsschwelle: Lokal-adaptive Schwellung.',
        'Temporal Blue Noise: Für animierte GIFs variiert Muster pro Rahmen.',
      ],
    },
    {
      heading: 'Verbreitung von Kernen',
      paragraphs: ['Wählen Sie bei der Verwendung von Error Diffusion aus, wie Fehler verteilt wird:'],
      bullets: ['Floyd-Steinberg: Klassische 4-Nachbar-Diffusion. Gute allgemeine Wahl.', 'Jarvis-Judice-Ninke: 12-Nachbar, glatter, aber langsamer.', 'Stucki: Ähnlich wie JJN mit verschiedenen Gewichten.', 'Burkes: Vereinfachte JJN, schneller.', 'Sierra: Familie der Kerne Balance Qualität und Geschwindigkeit.', 'Atkinson: Lichtdiffusion, bewahrt Detail, kann aber körnig sein.'],
    },
    {
      heading: 'Dither Stärke',
      paragraphs: ['Kontrolliert, wie viel Dithering angewendet wird (0-100%). Untere Werte erhalten mehr des Originalmusters, höhere Werte zeigen mehr Bilddetails.'],
    },
    {
      heading: 'Subpixel Einstellungen',
      paragraphs: ['Bei Verwendung des Subpixel-Mix-Modus:'],
      bullets: ['Grid Größe: 2×2, 3×3, oder 4×4 Subpixel pro Modul. Höher = genauer.', 'Mittelregel: Strict benötigt mittleres Subpixel zum Match-Modul. Halftone Center ermöglicht Variation.', 'Neutrale Farbe: Farbe verwendet für unbestimmte Subpixel.', 'Sucher Override: Wie Findermuster (Solid oder Stylized) dargestellt werden.'],
    },
    {
      heading: 'Halbtoneinstellungen',
      paragraphs: ['Bei Verwendung von Halftone Blend Modus:'],
      bullets: ['Zellgröße: Pro Modul oder N×N-Gitter.', 'Punktform: Kreis, Quadrat oder Linie.', 'Helligkeitskurve: Linear, S-Curve oder Gamma.'],
    },
    {
      heading: 'Duotone Farben',
      paragraphs: ['Wenn Duotone-Mix-Modus verwendet wird, setzen Sie die Schattenfarbe (dunkle Bereiche) und Highlight-Farbe (helle Bereiche).'],
    },
    {
      heading: 'GIF Animationseinstellungen',
      paragraphs: ['Bei Verwendung von animierten GIF-Überlagerungen:'],
      bullets: ['Verwenden Sie Frame Delays: Respect original GIF Timing.', 'Max FPS: Limit Frame Rate (1-60 fps).', 'Disposal Handling: Respektieren oder vereinfachen Sie die Rahmenentsorgungsmethoden.'],
    },
    {
      heading: 'Erweiterte Rendering Optionen',
      paragraphs: ['Zusätzliche Rendersteuerungen:'],
      bullets: ['Gap-Modus: Keine, Inset, Stroke oder Negative Space Lücke Styling.', 'Corner Radius: Runde Ecken prozentual für Module.', 'Gradient: None, Linear, Radial oder Conic Gradient auf Modulen.', 'Eye Outer/Inner Style: Unabhängiges Styling für Finder Musterringe.', 'Drehpunkt: Diamant/dot-Module drehen.', 'Augenwaage: Größenanpassung für Suchermuster.', 'Frame Style: Hinzufügen von dekorativen Rahmen (Rounded Frame, Aufkleber, Tag).', 'Frame Text: Fügen Sie Text wie "Scan Me!" zu Frames hinzu.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Advanced QR Encoding',
      paragraphs: ['Feinabstimmung QR Kodierung:'],
      bullets: ['Kodierungsmodus: Auto, Numerisch, Alphanumerisch, Byte/UTF-8 oder Kanji.', 'Min Quiet Zone: Mindestens 4 Modul Marge sichern.', 'Mask Pattern: Auto (optimal), oder manuell wählen Sie Muster 0-7, um die Modulverteilung zu steuern. Verschiedene Muster schaffen unterschiedliche visuelle Erscheinungen während der Kodierung der gleichen Daten.', 'Zeichencodierung: ISO-8859-1 (Standardeinstellung), UTF-8 (Voll-Unicode einschließlich Emoji), oder Shift-JIS (Japanisch). Wählen Sie basierend auf den Charakteranforderungen Ihrer Inhalte.'],
    },
    {
      heading: 'Erweiterte Ausgabeoptionen',
      paragraphs: ['Zusätzliche Exporteinstellungen:'],
      bullets: ['Dateiname: Benutzerdefinierte Dateinamen für Downloads.', 'GIF Palette Größe: 2-256 Farben in GIF-Ausgang.', 'GIF Quantizer: Median Cut, NeuQuant, oder Octree Farbe Reduktion.', 'GIF Dithering: Off, Floyd-Steinberg oder bestellt.', 'GIF Transparente Farbe: Legen Sie eine Farbe, um transparent zu sein.', 'SVG True Vector: Verwenden Sie Pfade anstelle von eingebettetem Raster.', 'SVG Shape Precision: Pixel oder Precise path Rendering.', 'SVG Embed Raster Overlay: Include Overlay als eingebettetes Bild.', 'Hintergrund Override: Erzwingen Sie eine bestimmte Hintergrundfarbe im Ausgang.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Validierungsoptionen',
      paragraphs: ['Eingabeeinstellungen:'],
      bullets: ['Validate Input: Überprüfen Sie das Inhaltsformat vor der Kodierung.', 'Trim Whitespace: Entfernen Sie führende/trailing Leerzeichen.', 'Normalisieren Sie Newlines: Alle Zeilenenden in LF umrechnen.', 'Max Länge Guard: Warnen, wenn der Inhalt QR-Kapazität überschreitet.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Professionelle Eigenschaften',
      paragraphs: ['Der professionelle Level fügt Wasserzeichen, Metadaten, Freigabeoptionen, Sicherheitsanalyse, Zahlung QR-Codes und Unternehmensfunktionen hinzu.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Wasserzeichen',
      paragraphs: ['Fügen Sie Wasserzeichen zu Ihren QR-Codes hinzu:'],
      bullets: ['Art: Text, Bild oder Muster Wasserzeichen.', 'Position: Zentrum, Ecken, Kanten, Hintern, oder ruhige Zone.', 'Opazity: Wasserzeichentransparenz (0-100%).', 'Mischmodus: Normal, Multiplikation, Bildschirm oder Overlay Mischung.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadaten',
      paragraphs: ['Metadaten in exportierte Dateien einbetten:'],
      bullets: ['Titel, Autor, Copyright, Lizenz, Beschreibung Felder.', 'Erstellungszeit: Zeitstempel der Generation einbetten.', 'Benutzerdefinierte Schlüssel-Value: Fügen Sie beliebige Metadatenpaare hinzu.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
      ],
    },
    {
      heading: 'Teilen',
      paragraphs: ['Teilen Sie Ihre QR-Code-Konfigurationen:'],
      bullets: ['Direct Link: Erstellen Sie eine aktifähige URL mit Ihren aktuellen Einstellungen.', 'HTML einbetten: Holen Sie sich Einbettungscode für Websites.', 'Parameter kodieren: Alle Einstellungen in der Share-URL enthalten.', 'Hinweis: Overlay-Bilder aus lokalen Dateien können nicht über URL geteilt werden.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' },
      ],
    },
    {
      heading: 'Sicherheitsanalyse',
      paragraphs: ['Stellen Sie sicher, dass QR-Codes scannbar bleiben:'],
      bullets: ['Sicherheitsmodus: Off, Balanced oder Strict Scananforderungen.', 'Minus Modul Größe: Minimale Pixelgröße pro Modul.', 'Min Quiet Zone: Mindestmargemodule.', 'Lock Finders/Timing/Align/Format/Version: Spezielle Elemente schützen.', 'Max Overlay Intensity by ECC: Automatische Intensitätsgrenzwerte basierend auf Fehlerkorrekturniveau.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' },
      ],
    },
    {
      heading: 'Inhaltstypen (Professional)',
      paragraphs: ['Professional Level fügt Zahlungs- und Unternehmensinhaltstypen hinzu:'],
      bullets: ['EPC/SEPA (EU): Europäische Banküberweisung QR-Codes mit IBAN, BIC, Betrag, Referenz.', 'UPI (Indien): Unified Payments Interface mit VPA, Payee Name, Betrag.', 'PayNow (Singapur): Singapur schnelle Zahlung mit UEN oder mobile Nummer.', 'PromptPay (Thailand): Thailändisches nationales Zahlungssystem.', 'PIX (Brasilien): Brasilianische sofortige Zahlung mit PIX Schlüssel.', 'Crypto: Bitcoin, Ethereum, Litecoin-Zahlungsadressen mit optionalem Betrag.', 'Marketing Campaign Link: URLs mit vollem UTM-Parameter (Marketing Tags) Tracking.', 'Short Link: Zur Verwendung mit URL-Kürzern für dynamische/trackable QR-Codes.', 'GS1 Digital Link: Produktidentifikation mit GTIN, Seriell, Charge, Auslauf.', 'App Deep Link: iOS/Android-App tiefe Links mit benutzerdefinierten Systemen.', 'Custom Format: Rohdaten ohne Formatierung oder Validierung.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Sprach-Relevante Zahlungen im fortgeschrittenen Modus',
      paragraphs: ['Bei Verwendung des Advanced-Modus zeigt ANQR automatisch Zahlungsmethoden, die für Ihre gewählte Sprache relevant sind. Zum Beispiel, Vietnamesische Benutzer sehen VietQR, thailändische Benutzer sehen PromptPay, und indische Sprachbenutzer sehen UPI und BharatQR. Globale Zahlungsmethoden (Kryptowährung, PayPal, Cash App) sind für alle Sprachen verfügbar. Professional Modus entsperrt alle Zahlungsstandards unabhängig von der Sprache.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Europäische Zahlungsstandards',
      bullets: ['EPC/SEPA (EU): Europäische Banküberweisung QR Codes nach dem EPC QR Code Standard. Unterstützt IBAN, BIC (optional für Inland), Betrag in EUR und strukturierte oder unstrukturierte Zahlungsverweise. Verwendet in der SEPA-Zone einschließlich EU-Ländern sowie Schweiz, Norwegen, Island, Liechtenstein, Monaco und San Marino.', 'Swiss QR-bill: Schweizer Zahlungsstandard nach SIX Implementation Guidelines. Unterstützt CHF und EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), strukturierte Creditor/Debtor-Adressen und Rechnungsinformationen. Erforderlich für Schweizer Rechnungen seit 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Indian Payment Standards',
      bullets: ['UPI (Indien): Unified Payments Interface nach NPCI Deep Linking Spezifikation. Unterstützt VPA (Virtual Payment Address), Payee Name, Betrag in INR, Transaktionshinweis, Referenz ID, Handelskategoriencode und Transaktionsmodus.', 'BharatQR (Indien): Unified QR-Standard unterstützt sowohl UPI als auch kartenbasierte Zahlungen. Kombiniert UPI VPA mit Karte PAN für maximale Kompatibilität. Enthält Handelsnamen, Stadt, MCC, GST-Details und Rechnungs-/Referenznummern.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Südostasiatischen Zahlungsstandards',
      bullets: ['PayNow (Singapur): Singapur schnelles Zahlungssystem mit EMVCo QR Spezifikation mit SGQR Profil. Unterstützt UEN (Business Registration), mobile Nummer oder NRIC als Proxy-Kennzeichen. Inklusive Anzahl Editability Flag und Ablaufdatum.', 'PromptPay (Thailand): Thailändisches nationales Zahlungssystem gemäß EMV-Profil der Bank of Thailand. Unterstützt Mobiltelefonnummer, nationale ID, Steuer-ID, E-Wallet-ID und Rechnungszahlung mit mehreren Referenzfeldern.', 'QRIS (Indonesien): Quick Response Code Indonesian Standard. EMV-basierte nationale Zahlungsstandard zur Unterstützung von Handels-ID, NMID (National Merchant ID), Handelskriterien Klassifizierung und Bequemlichkeitsgebühren (fest oder Prozentsatz).', 'DuitNow (Malaysia): Malaysian Instant Payment System. Unterstützt mehrere Proxy-Typen, einschließlich NRIC, Mobil, Reisepass, Armee-ID und Geschäftsregistrierungsnummern.', 'VietQR (Vietnam): Vietnamesischer Interbank-Transferstandard. Erfordert Bank BIN (NAPAS-Identifizierung) und Kontonummer. Unterstützt mehrere Servicecodes für verschiedene Transfertypen (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Philippines): Philippine QR Zahlungsstandard für InstaPay und PESONet. Verwendet Kontonummern mit Handelskennung für P2M-Transaktionen.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Ostasien Zahlungsstandards',
      bullets: ['TWQR (Taiwan): Taiwanesischer QR Zahlungsstandard. Unterstützt Handels-ID, Steuer-ID und TWD-Beträge.', 'HKQR/FPS (Hong Kong): Hong Kong Schnelleres Zahlungssystem QR Codes. Unterstützt FPS-ID, mobile Nummer oder E-Mail als Zahlungskennzeichen. Beträge in HKD.', 'JPQR (Japan): Japanischer einheitlicher QR-Code-Zahlungsstandard. Verwendet Speicher ID für die Handelsidentifikation mit JPY-Beträgen.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Sonstige regionale Zahlungsstandards',
      bullets: ['PIX (Brasilien): Instant-Zahlungssystem der brasilianischen Zentralbank nach BR-Code Spezifikation. Unterstützt PIX-Schlüssel (CPF, CNPJ, E-Mail, Telefon oder zufälliger Schlüssel), Handelsname/Stadt, Transaktions-ID und BRL-Beträge.', 'AusPayNet/NPP Zahl (Australien): Australian New Payments Platform PayID System. Unterstützt Pay ID-Typen (E-Mail, Mobil, ABN, Organisations-ID) oder traditionelle BSB + Kontonummer. Der Handelsname ist optional, da die Zahler den eingetragenen Namen von NPP-Lookup sehen.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Cryptocurrency Zahlungen',
      bullets: ['Bitcoin/Litecoin (BIP-21): Standard-Cryptocurrency-Zahlung URIs mit Geldbörse-Adresse, optionaler Betrag und Label. Kompatibel mit allen großen Bitcoin und Litecoin Geldbörsen.', 'Blitznetz (BOLT11): Lightning Network Zahlungsrechnungen. Fügen Sie eine BOLT11 kodierte Rechnungszeichenfolge für Instant Bitcoin Zahlungen mit minimalen Gebühren.', 'Ethereum (EIP-681): Ethereum Transaktionsanfrage URIs unterstützt native ETH Transfers und ERC-20 Token Transfers. Inklusive Ketten-ID für Multi-Netzwerk-Unterstützung (Mainnet, Polygon, BSC, Arbitrum, Optimismus, Avalanche), Gasparameter und Vertragsfunktion Anrufe.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Dienstleistungen für den Kunden',
      bullets: ['PayPal.Me: PayPal-Zahlungslinks mit Benutzername und optionalem vorgefüllten Betrag. Empfänger können über PayPal-Bilanz, Karten oder Bankkonten bezahlen.', 'Cash App: Cash App-Zahlungslinks mit $cashtag und optionalem Betrag. In den USA beliebt für Peer-to-Peer-Zahlungen.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Generisches EMV QR',
      bullets: ['EMV Generic: Erstellen Sie benutzerdefinierte EMV Merchant-Presented Mode QR-Codes für nicht ausdrücklich aufgeführte Zahlungssysteme. Konfigurieren Sie Handelsnamen, Stadt, Ländercode (ISO 3166-1), Währungscode (ISO 4217 numerisch), MCC, Tip/convenience Gebührenoptionen und zusätzliche Datenfelder. Nützlich für Tests oder benutzerdefinierte Integrationen.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blend Modes (Professional)',
      paragraphs: ['Zusätzliche Mischmodi in professioneller Ebene:'],
      bullets: ['Pixelate: Pixelierter Overlay-Effekt.', 'Outline: Kantenerkennung Overlay zeigt nur Konturen.', 'Welle: Wavy Verzerrung Effekt.', 'Subpixel Größe: Variable Subpixel Größe basierend auf Bild.', 'True Dither: Advanced Dithering mit geordneter Matrixauswahl.', 'Extreme: Maximale Bildsicht, kann die Scannbarkeit beeinflussen.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Schutzeinstellungen',
      paragraphs: ['Feinkörnige Kontrolle, über die QR-Elemente vor Überlagerungsmodifikation geschützt sind:'],
      bullets: ['Preserve Timing: Halten Sie Zeitmuster unmodifiziert.', 'Erhaltung Ausrichtung: Nicht modifizierte Ausrichtungsmuster beibehalten.', 'Schutzformat Info: Shield Format Information Module.', 'Schutzart Info: Shield-Versionsinformationsmodule.'],
    },
    {
      heading: 'ECC-Aware Modus',
      paragraphs: ['Intelligent verteilt Überlagerungsintensität auf Basis von Fehlerkorrekturkapazität. Das System analysiert, welche Module unter Beibehaltung der Scannbarkeit modifiziert werden können.'],
      bullets: ['Risikobudget: Prozentsatz der Fehlerkorrekturkapazität (0-100%).', 'Höheres Budget = sichtbarer Overlay, aber riskantere Scannbarkeit.', 'Niedrigeres Budget = sichereres Scannen, aber weniger sichtbares Overlay.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Professionelle Rendering Optionen',
      paragraphs: ['Erweiterte Rendersteuerungen:'],
      bullets: ['Crisp Edges: Verwenden Sie pixelierte Bildwiedergabe für scharfe Modulkanten.', 'Pixel Snap: Boden, Runde oder Ceil Pixel Ausrichtung.', 'Per-Modul Farbmodus: Solid, By Brightness, By Position, By Overlay, By Cluster.', 'Farbpalette: Definieren Sie benutzerdefinierte Farbpalette für per-Modul Färbung.', 'Kontrastschutz: Mindestkontrastverhältnis zwischen Farben gewährleisten.', 'Min Contrast Ratio: WCAG-Stil Kontrastbedarf (1:1 bis 21:1).', 'Extra Border Module: Zusätzliche Grenze jenseits der ruhigen Zone.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Professionelle Ausgangsoptionen',
      paragraphs: ['Enterprise Exporteinstellungen:'],
      bullets: ['DPI: Druckauflösung einstellen (72-600 DPI). 300 DPI für Druck empfohlen.', 'Include Quiet Zone: Toggle ruhige Zone in Ausgabeabmessungen.', 'Export als Zusatz: Erstellen Sie PDF neben Primärformat.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'Animationseinstellungen (Professional)',
      paragraphs: ['Zusätzliche professionelle Animationsmerkmale:'],
      bullets: ['Temporal Dither: Off, Blue Noise oder Flicker Safe per-frame dithering.', 'Muster: Keine, Puls, Welle, Scanline, Shimmer oder Drift Effekte.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Sachgebiet',
      paragraphs: ['ANQR bietet eine serverseitige API zur Generierung von QR-Codes über URL-Parameter. Dies ist ideal für die Einbettung von QR-Codes in Websites, E-Mails, Dokumente oder automatisierte Workflows ohne clientseitige JavaScript.', 'Basis URL: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'QR-Beispiele', type: 'example' }],
    },
    {
      heading: 'Grundparameter',
      paragraphs: ['Erforderliche und gemeinsame Parameter (Parameternamen werden nicht übersetzt):'],
      bullets: ['daten (erforderlich): Der Inhalt, der im QR-Code kodiert. URL-encode Sonderzeichen.', 'größe: Bildgröße in Pixeln (Standard: 400, max. 2000). Wird verwendet, wenn w/h nicht angegeben ist.', 'w, h: Ausgangsbreite und Höhe in Pixeln. Overrides Größe Parameter.', 'format: Ausgabeformat - png, webp oder gif (Standard: png).', 'ec: Fehlerkorrekturebene - L, M, Q oder H (Standard: H).', 'fg: Vordergrundfarbe als Hexe ohne # (Standard: 000000).', 'bg: Hintergrundfarbe als Hexe ohne # (Standard: ffffffffffff).', 'transparent: Auf 1 für transparenten Hintergrund.', 'marge: Ruhezone in Modulen (Standard: 4).'],
    },
    {
      heading: 'Styling Parameter',
      paragraphs: ['Modul und Muster-Styling:'],
      bullets: ['stil: Modul-Stil - quadratisch, abgerundet, Punkte, Diamant, verbunden.', 'sucher: Finder Muster Stil - quadratisch, abgerundet, Kreis.', 'align: Ausrichtung Musterstil - match_finder, quadratisch, abgerundet, Kreis.', 'timing-Muster-Stil - match_module, solide, gestrichelt.', 'radius: Eckradius prozentual 0-100.', 'lücke: Modulspaltanteil 0-50.', 'gapMode: Gap-Modus - keine, inset, Schlaganfall, negativ_space.', 'auge Outer, eyeInner: Eye Styles - quadratisch, abgerundet, Kreis.', 'augenmuschel: Augenmaß prozentual (Standard: 100).', 'grad: Gradiententyp - keine, linear, radial, conic.', 'gradAngle: Gradientenwinkel für lineare Gradienten.', 'gradStops: Gradient stoppt als Farbe 1,pos1,color2,pos2,... (z.B. ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Überlagerungsparameter',
      paragraphs: ['Bild-Überlagerungsoptionen (Überlagerungsbild wird serverseitig abgerufen):'],
      bullets: ['img: URL zum Überlagern von Bild (muss öffentlich zugänglich sein).', 'modus: Overlay-Modus - Mitte, Halbton, Blend, Helligkeit, Mosaik, dithered, blau- Lärm, Subpixel.', 'intensität: Overlay Intensität 0-100 (Standard: 100).', 'farbe Modus: Overlay-Farbmodus - Farbe, Graustufen, bw.', 'fit: Wie Overlay passt - Abdeckung, enthalten, Stretch.', 'rot: Overlay Rotation in Grad.', 'flipX, flipY: Legen Sie auf 1 um das Overlay zu drehen.', 'halten. Sucher: Preservefindermuster (Standard: 1).', 'halten. Timing, keepAlign: Auf 1 gesetzt, um Timing/Ausrichtungsmuster zu erhalten.'],
    },
    {
      heading: 'Vorverarbeitungsparameter',
      paragraphs: ['Bildvorbereitung auf Overlay angewendet:'],
      bullets: ['helligkeit: Einstellung -100 bis 100 (Standard: 0).', 'kontrast: Einstellung -100 bis 100 (Standard: 0).', 'gamma: Wert 0,1 bis 3 (Standard: 1).', 'sättigung: Anpassung -100 bis 100 (Standard: 0).', 'hue: Hue Rotation in Grad.', 'blur: Blur in Pixeln.', 'schärfe: Schärfe Menge 0-100.', 'posterize: Posterize Ebenen.', 'schwelle: Binäre Schwelle 0-255.', 'rand: Kantenerkennung - off, sobel, canny.', 'invert: Setzen Sie auf 1 Farben invertieren.'],
    },
    {
      heading: 'Wasserzeichenparameter',
      paragraphs: ['Hinzufügen von Wasserzeichen zu generierten QR-Codes:'],
      bullets: ['wmEn: Auf 1 gesetzt, um Wasserzeichen zu aktivieren.', 'wm Art: Wasserzeichentyp - Text, Bild, Muster.', 'wmText: Wasserzeichentext (URL-codiert).', 'wmImg: URL zum Wasserzeichenbild.', 'wmPos: Position - Mitte, Ecken, Kanten, hinter, ruhig_zone.', 'wmOpacity: Opacity 0-100 (Standard: 50).', 'wmBlend: Mischmodus - normal, multipliziert, Bildschirm, Overlay.'],
    },
    {
      heading: 'Animationsparameter',
      paragraphs: ['Für den animierten GIF-Ausgang (erfordert format=gif):'],
      bullets: ['anim Muster: Animationsmuster - keine, Puls, Welle, Scanline, schimmern, Drift, color_cycle.', 'anim Rahmen: Anzahl der Rahmen 1-60 (Standard: 24).', 'anim Geschwindigkeit: Rahmenverzögerung in Millisekunden 10-1000 (Standard: 100).', 'anim Seed: Random Samen für Animation.', 'easing: Animation easing - linear, easy_in, easy_out, easy_in_out, bounce.'],
    },
    {
      heading: 'Ausgangsparameter',
      paragraphs: ['Ausgabeformatoptionen:'],
      bullets: ['qualität: WebP Qualität 0-1 (Standard: 0.9).', 'webpQ: WebP Qualität 0-100 (Standard: 90).', 'gifColors: GIF Palette Größe 2-256 (Standard: 256).', 'dpi: Ausgabe DPI für PNG (Standard: 72).', 'metaTitel, metaAuthor, metaCopy, meta Desc: PNG Metadatenfelder.'],
    },
    // Crop Parameters
    {
      heading: 'Zuschneideparameter',
      paragraphs: ['Optionen zum Zuschneiden von Overlay-Bildern:'],
      bullets: ['cropEn: Overlay-Zuschneiden 0/1 aktivieren (Standard: 0).', 'CropX: Mitte X als Bruch 0-1 zuschneiden (Standard: 0,5).', 'CropY: Schnittmitte Y als Bruch 0-1 (Standard: 0,5).', 'CropSize: Zuschnittgröße als Bruchteil des Bildes 0-1 (Standard: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Parameter der Sicherheitsverriegelung',
      paragraphs: ['Steuern Sie, welche QR-Elemente vor Overlay-Änderungen geschützt sind:'],
      bullets: ['lockF: Lock-Finder-Muster 0/1 (Standard: 1).', 'lockT: Zeitmuster 0/1 sperren (Standard: 1).', 'lockA: Ausrichtungsmuster 0/1 sperren (Standard: 1).', 'lockFmt: Formatinfo 0/1 sperren (Standard: 1).', 'lockV: Versionsinfo 0/1 sperren (Standard: 1).', 'safeMode: Sicherheitsmodus – aus, ausgeglichen, streng (Standard: aus).', 'safeMinPx: Minimale Modulgröße in Pixel (Standard: 2).', 'safeMinQz: Mindestanzahl an Ruhezonenmodulen (Standard: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Autotuning-Parameter',
      paragraphs: ['Automatische Optimierungseinstellungen:'],
      bullets: ['autoVer: QR-Version 0/1 automatisch auswählen (Standard: 1).', 'autoEcc: ECC-Level 0/1 automatisch auswählen (Standard: 0) – nur serverseitiger Hinweis.', 'autoReduce: [NUR FÜR KUNDEN] Reduziert die Intensität automatisch, bis sie scanbar ist – erfordert eine Scan-Validierungsschleife.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Zusätzliche Animationsparameter',
      paragraphs: ['Erweiterte Animationssteuerung für die GIF-Ausgabe:'],
      bullets: ['Schleife: Animationsschleifen kontinuierlich 0/1 (Standard: 1).', 'Bounce: Ping-Pong-Animationsrichtung 0/1 (Standard: 0).', 'Reverse: Animation in umgekehrter Reihenfolge 0/1 abspielen (Standard: 0).', 'colorCycle: Farbwechseleffekt 0/1 aktivieren (Standard: 0).', 'interp: Frame-Interpolation – keine, Crossfade, Morph (Standard: keine).', 'tempDither: Zeitliches Dithering – aus, blue_noise, flicker_safe (Standard: aus).', 'startF: Startbild der Animation (Standard: 0).', 'maxF: Maximal zu rendernde Frames (Standard: 0 = automatisch).', 'stepF: Frame-Schrittintervall (Standard: 1).', 'Jitter: [NUR FÜR CLIENT] Modul-Jitter in Pixel – erfordert eine QR-Regeneration pro Frame.'],
    },
    // Dithering Parameters
    {
      heading: 'Dithering-Parameter',
      paragraphs: ['Steuern Sie Dithering-Algorithmen für die Overlay-Verarbeitung:'],
      bullets: ['ditherKind: Dither-Algorithmus – error_diffusion, ordered_bayer, blue_noise usw. (Standard: ordered_bayer).', 'diffusionKernel: Fehler beim Diffusionskernel – floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (Standard: floyd_steinberg).', 'ditherStrength: Dither-Intensität 0–100 (Standard: 50).', 'Serpentine: Serpentinen-Dithering 0/1 (Standard: 0).', 'Matrix: Geordnete Dither-Matrix – Bayer2, Bayer4, Bayer8 (Standard: Bayer4).', 'bnTile: Kachelgröße für blaues Rauschen (Standard: 64).', 'bnSeed: Zufälliger Startwert für blaues Rauschen (Standard: 0).', 'colorDither: Farbdithering – keine, per_channel, perceptual (Standard: keine).'],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixel-Parameter',
      paragraphs: ['Einstellungen für den Subpixel-Mischmodus:'],
      bullets: ['spGrid: Subpixel-Rastergröße – 2x2, 3x3, 4x4 (Standard: 3x3).', 'spCenter: Mittenregel – streng, halftone_center (Standard: streng).', 'spNeutral: Neutrales Farbhex ohne # (Standard: 808080).', 'spFinder: Finder-Überschreibung – einfarbig, stilisiert (Standard: einfarbig).'],
    },
    // Halftone Parameters
    {
      heading: 'Halbtonparameter',
      paragraphs: ['Einstellungen für den Halbton-Mischmodus:'],
      bullets: ['htCell: Halbtonzellengröße – per_module oder nxn-Raster (Standard: per_module).', 'htDot: Punktform – Kreis, Quadrat, Linie (Standard: Kreis).', 'htCurve: Helligkeitskurve – linear, S-Kurve, Gamma (Standard: linear).', 'duo1: Duotone-Schattenfarbe hex ohne # (Standard: 000000).', 'duo2: Duotone-Hervorhebungsfarbe hex ohne # (Standard: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parameter des ECC-fähigen Modus',
      paragraphs: ['Intelligente Overlay-Verteilung basierend auf der Fehlerkorrekturkapazität:'],
      bullets: ['eccAware: ECC-fähigen Modus 0/1 aktivieren (Standard: 0).', 'eccRisk: Risikobudget-Prozentsatz 0–100 (Standard: 50).', 'eccMap: Gewichtskarte – distance_to_finders, block_heatmap, empirical_scan_heatmap (Standard: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Rahmenparameter',
      paragraphs: ['Dekorrahmenfassungen:'],
      bullets: ['Rahmen: Rahmenstil – keiner, abgerundeter_Rahmen, Aufkleber, Tag (Standard: keiner).', 'FrameText: Text, der im Frame angezeigt werden soll (URL-codiert).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Farbparameter pro Modul',
      paragraphs: ['Farboptionen für einzelne Module:'],
      bullets: ['modColor: Farbmodus – solid, by_brightness, by_position, by_overlay, by_cluster (Standard: solid).', 'cGuard: Kontrastschutz 0/1 (Standard: 0).', 'minContrast: Minimales Kontrastverhältnis 1-21 (Standard: 4,5).', 'palette: Durch Kommas getrennte Hex-Farben für den Palettenmodus.', 'paletteMode: Palettenverteilung – Position, Helligkeit, diagonal, radial, zufällig, Zeile, Spalte (Standard: Position).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF-Overlay-Parameter',
      paragraphs: ['Einstellungen für animierte GIF-Overlay-Bilder:'],
      bullets: ['ovType: Overlay-Typ – statisch, gif, apng, webp_anim, video (Standard: statisch).', 'ovFramePick: Frame-Auswahl – alle, every_n, max_frames, duration_limit (Standard: alle).', 'gifDelays: Original-GIF-Frameverzögerungen 0/1 verwenden (Standard: 1).', 'gifDispH: Handhabung der GIF-Entsorgung – respektieren, vereinfachen (Standard: respektieren).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Intensitätsgrenzen pro ECC',
      paragraphs: ['Maximale Overlay-Intensität pro Fehlerkorrekturstufe:'],
      bullets: ['maxIntL: Maximale Intensität für ECC L 0–100 (Standard: 100).', 'maxIntM: Maximale Intensität für ECC M 0-100 (Standard: 100).', 'maxIntQ: Maximale Intensität für ECC Q 0-100 (Standard: 100).', 'maxIntH: Maximale Intensität für ECC H 0-100 (Standard: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA-Simulationsparameter (nur Client)',
      paragraphs: ['Diese Parameter werden aus Gründen der URL-Kompatibilität analysiert, funktionieren aber nur im Browser:'],
      bullets: ['qaContrast: Kontrastprüfung 0/1 aktivieren – erfordert interaktive Validierung.', 'qaBlur: Unschärfe in Pixeln simulieren – nur für interaktive Tests.', 'qaNoise: Geräuschpegel simulieren – nur für interaktive Tests.', 'qaHeatmap: Lesbarkeits-Heatmap 0/1 anzeigen – erfordert Canvas-Overlay-Benutzeroberfläche.'],
    },
    // Client-Only Parameters
    {
      heading: 'Nur-Client-Parameter',
      paragraphs: ['Die meisten API-Parameter werden serverseitig vollständig unterstützt. Mit [CLIENT-ONLY] gekennzeichnete Parameter werden auf URL-Kompatibilität analysiert, erfordern jedoch Browserfunktionen:'],
      bullets: ['Jitter: Modul-Jitter erfordert eine QR-Regeneration pro Frame mit Zufälligkeit.', 'autoReduce: Die automatische Reduzierung der Intensität erfordert iterative Scantests.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: Die QA-Simulation erfordert eine interaktive Canvas-Validierung.'],
    },
    // Additional Output Parameters
    {
      heading: 'Zusätzliche Ausgabeparameter',
      paragraphs: ['Erweiterte Ausgabe- und Exporteinstellungen:'],
      bullets: ['fname: Benutzerdefinierter Dateiname für Downloads (Standard: anqr-qrcode).', 'inclQz: Ruhezone in Ausgabedimensionen 0/1 einbeziehen (Standard: 1).', 'bgOver: Hintergrundfarbe hexadezimal ohne # überschreiben (überschreibt den bg-Parameter).', 'fmtExtra: Zusätzliche Formatausgabe – keine, eps, animierte_webp (Standard: keine). Hinweis: eps ist [TEILWEISE].', 'svgPrec: SVG-Formpräzision – Pixel, präzise (Standard: Pixel). [TEILWEISE] Die SVG-Ausgabe ist serverseitig eingeschränkt.', 'svgEmbed: Raster-Overlay in SVG 0/1 einbetten (Standard: 1). [TEILWEISE] Die SVG-Ausgabe ist serverseitig eingeschränkt.', 'modulePx: Modulpixelgröße (Standard: automatisch aus der Größe berechnet).', 'Grenze: Zusätzliche Grenzmodule außerhalb der Ruhezone (Standard: 0).', 'gestochen scharf: Aktivieren Sie die gestochen scharfe/pixelige Bildwiedergabe 0/1 (Standard: 1).', 'snap: Pixel-Snap-Modus – Boden, rund, Decke (Standard: Boden).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Mustererhaltungsparameter',
      paragraphs: ['Steuern Sie, welche Strukturelemente vor Überlagerung geschützt sind:'],
      bullets: ['keepFinders: Finder-Muster 0/1 beibehalten (Standard: 1).', 'keepTiming: Zeitmuster 0/1 beibehalten (Standard: 0).', 'keepAlign: Ausrichtungsmuster 0/1 beibehalten (Standard: 0).', 'protectedFmt: Formatinfomodule 0/1 schützen (Standard: 0).', 'ProtectVer: Versionsinformationsmodule 0/1 schützen (Standard: 0).'],
    },
    {
      heading: 'Beispiel Verwendung',
      paragraphs: ['QR Code:', 'https://anqr.link/api/qr?data=https://example.com', 'Styled QR Code mit benutzerdefinierten Farben:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffffff&style=rounded&radius=30', 'QR Code mit Overlay-Bild:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'Animierter GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'QR-Beispiele', type: 'example' }],
    },
    {
      heading: 'QR Codes einbetten',
      paragraphs: ['Im Professional-Modus erzeugt das Share-Feature einbettbare HTML und URLs. So funktioniert die Einbettung:'],
      bullets: ['Link teilen: Erstellt eine URL zur ANQR App mit allen Einstellungen, die als URL-Parameter codiert sind. Empfänger können den QR-Code anzeigen und ändern.', 'Embed Image: Erzeugt ein <img>-Tag, das auf die Server-API zeigt. Der QR-Code wird serverseitig wiedergegeben und als Bild dient.', 'Markdown: Erstellt Markdown-Bildsyntax für Dokumentationen und README-Dateien.', 'Direkte API URL: Die rohe API-URL für Anwendungen, Skripte oder andere Integrationen.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
    {
      heading: 'HTML-Beispiel',
      paragraphs: ['Um einen QR-Code in Ihrer Website einzubetten:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR-Code" />', 'Für ansprechende Dimensionierung:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-breite: 100%; Höhe: auto;" />', 'Die Server-Cache-Antworten mit langen Cache-Headern, so wiederholte Anfragen für die gleiche URL sind schnell.'],
    },
    {
      heading: 'Teilen URL Format',
      paragraphs: ['Wenn Sie im Professional Modus teilen klicken, kodiert ANQR Ihre aktuellen Einstellungen in URL-Parameter. Das Format ist:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Diese Parameter spiegeln die API-Parameter wider, so dass Sie eine Share-URL in eine API-URL konvertieren können, indem Sie den Basispfad von / zu /api/qr ändern und w/h-Parameter nach Bedarf anpassen.', 'Hinweis: Die von lokalen Dateien hochgeladenen Overlay-Bilder können nicht über URL geteilt werden - nur URL-basierte Overlays (img-Parameter) arbeiten in gemeinsamen Links und API-Anrufen.'],
    },
    {
      heading: 'Grenzwerte und Nutzung',
      paragraphs: ['Die API ist kostenlos für vernünftige Volumes zu verwenden. Für hochvolumige Nutzung oder kommerzielle Anwendungen, die eine garantierte Verfügbarkeit erfordern, kontaktieren Sie uns bitte.', 'API-Antworten beinhalten aggressive Caching-Header. Für beste Leistung, Cache-Antworten am Ende oder verwenden Sie die gleiche URL konsequent für identische QR-Codes.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Best Practices',
      paragraphs: ['Folgen Sie diesen Richtlinien für zuverlässige QR-Codes:'],
      bullets: ['Testen Sie Ihre QR-Codes immer mit mehreren Scanner-Apps vor dem Drucken.', 'Verwenden Sie Fehlerkorrektur H (High) beim Hinzufügen von Overlays.', 'Halten Sie mindestens 4 Module der ruhigen Zone (margin).', 'Stellen Sie einen hohen Kontrast zwischen Vordergrund und Hintergrund sicher.', 'Verwenden Sie zum Drucken mindestens 300 DPI und testen Sie die aktuelle Druckgröße.', 'Aktivieren Sie Preserve Finder Patterns bei der Verwendung von Overlays.', 'Beginnen Sie mit niedrigerer Überlagerungsintensität und erhöhen Sie allmählich.', 'Für den Außeneinsatz gelten größere Modulgrößen und eine höhere Fehlerkorrektur.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Mehr erfahren', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'QR-Beispiele', type: 'example' },
      ],
    },
    {
      heading: 'Fehlerbehebung',
      paragraphs: ['Gemeinsame Fragen und Lösungen:'],
      bullets: ['QR scannt nicht: Reduzieren Sie die Überlagerungsintensität, erhöhen Sie die Fehlerkorrektur, überprüfen Sie den Kontrast.', 'Code zu groß: Verringern Sie die Inhaltslänge, verwenden Sie URL-Verkürzung, untere Version.', 'Blurry Ausgabe: Modulgröße erhöhen, PNG anstelle von komprimierten Formaten verwenden.', 'Farben sehen falsch aus: Überprüfen Sie den Farbkontrast, versuchen Sie den grauen Overlay-Modus.', 'GIF nicht animieren: Stellen Sie sicher, dass GIF-Format ausgegeben wird, überprüfen Sie Frame Count.', 'Image Overlay nicht geladen: Überprüfen Sie die CORS-Berechtigungen auf entfernten Bildern.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Siehe verwandte Anleitungen und Beispiele', type: 'learn' }],
    },
    {
      heading: 'Keyboard Shortcuts',
      paragraphs: ['ANQR unterstützt Standard-Tastaturabkürzungen. Verwenden Sie Ctrl/Cmd+S, um Export auszulösen (wenn es auf die Vorschau konzentriert ist).'],
    },
    {
      heading: 'Teilen und Einbetten',
      paragraphs: ['Klicken Sie im Professional-Modus auf die Schaltfläche Teilen, um eine URL mit Ihren aktuellen Einstellungen zu kopieren. Empfänger können diese URL öffnen, um Ihre genaue Konfiguration zu sehen. Hinweis: Overlay-Bilder aus lokalen Dateien können nicht über URL geteilt werden.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Versuchen Sie diese Konfiguration direkt im ANQR Generator.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Mehr erfahren', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR-Beispiele', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'QR-Beispiele', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Öffnen Sie den Generator', type: 'generator' },
  ],
};

export default guide;
