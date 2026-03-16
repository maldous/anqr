import type { PageDefinition } from "../types";

export const guide: PageDefinition = {
  title: "Przewodnik użytkownika ANQR",
  description: "Kompletny przewodnik po użyciu ANQR do tworzenia kodów QR.",
  lastUpdated: "1 lutego 2026 r",
  breadcrumb: ["Przewodnik"],
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Otwórz generator", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Przeglądaj Nauka artykułów", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Zobacz przykłady QR", type: "example" },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: "Rozpoczęcie",
      paragraphs: [
        "ANQR jest generatorem kodu QR z podejściem klient- pierwszego podejścia. Domyślnie kody QR są generowane lokalnie w przeglądarce - nie jest wymagane konto, a dane pozostają prywatne. Dla profesjonalnego osadzania, można również korzystać z server- side API.",
        "Interfejs posiada trzy poziomy interfejsu: Basic, Advanced i Professional. Wybierz poziom używając zakładek w nagłówku. Każdy poziom odblokowuje dodatkowe funkcje podczas utrzymywania interfejsu skupionego na tym, czego potrzebujesz.",
      ],
      bullets: [
        "Basic: Proste tworzenie kodu QR z prostym tekstem / URL zawartości i narzutu obrazu.",
        "Zaawansowane: opcje kodowania QR, style renderowania, animacja, formaty wyjściowe, rozszerzone typy treści i narzucenie dostosowania.",
        "Profesjonalne: znaki wodne, metadane, udostępnianie, analiza bezpieczeństwa, kody QR płatności i cechy przedsiębiorstwa.",
      ],
      links: [{ href: "/?lang=${lang}", label: "Otwórz generator", type: "generator" }],
    },
    {
      heading: "Szybki start",
      paragraphs: ["Aby utworzyć swój pierwszy kod QR:"],
      bullets: [
        "1. Wybierz typ zawartości (URL, tekst, WiFi itp.) z rozwijanego typu zawartości.",
        "2. Wprowadź swoje dane w dostarczonych polach.",
        "3. Opcjonalnie dostosować kolory, style i dodać obraz nakładki.",
        "4. Kliknij przycisk Export, aby pobrać kod QR jako PNG, GIF, WebP lub SVG.",
      ],
      links: [
        {
          href: "/?lang=${lang}",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: "Podstawowe cechy",
      paragraphs: [
        "Poziom podstawowy zapewnia usprawniony interfejs do tworzenia kodów QR z zawartością ładunku i nakładkami obrazu. To najprostszy sposób na rozpoczęcie.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Rodzaje zawartości (podstawowe)",
      paragraphs: [
        "Tekst prosty: kodowanie tekstu do limitu pojemności kodu QR. Idealny do krótkich wiadomości, kodów lub identyfikatorów.",
        "URL: Kodowanie adresów internetowych. Kod QR otworzy adres URL po zeskanowaniu. Wspiera http: / / i https: / / protokoły.",
      ],
    },
    {
      heading: "Image Overlay (Podstawowe)",
      paragraphs: [
        "Wyślij zdjęcie (JPG, PNG, GIF, WebP), aby połączyć je z kodem QR. Podstawowe funkcje nakładania obejmują:",
      ],
      bullets: [
        "Wysyłanie z pliku: Wybierz obrazek z urządzenia.",
        "Wczytaj z URL: Wprowadź URL obrazka (musi umożliwiać CORS).",
        "Logo Centrum: Umieszcza obraz w środku, w oparciu o korektę błędów.",
        "Mieszanie: Proste mieszanie obrazu alfa ze wzorem QR.",
        "Intensywność: Kontroluje, jak silne nakładanie wpływa na kod QR (0- 100%).",
        "Tryb koloru: Full Color, Grayscale lub Black & White.",
        "Zachować wzory Finder: Utrzymuje wzory narożne niezmienione dla niezawodnego skanowania.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic#overlay",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: "Zaawansowane funkcje",
      paragraphs: [
        "Zaawansowany poziom odblokowuje opcje kodowania QR, renderowania stylów, animacji, formatów wyjściowych, rozszerzonych typów treści oraz zaawansowanej konfigurowania nakładek.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Ustawienia kodowania QR",
      paragraphs: [
        "Wersja: Kody QR są w wersjach 1- 40, wyższe wersje posiadają więcej danych, ale są większe. Ustaw na 0 (Auto), aby pozwolić ANQR wybrać najmniejszą wersję, która pasuje do zawartości.",
        "Korekta błędu: Określa, jak duże szkody może wytrzymać kod QR, pozostając skanowalny.",
      ],
      bullets: [
        "L (niski): 7% korekta błędu - najmniejszy rozmiar, najmniejsza redundancja.",
        "M (Medium): Korekta błędu o 15% - wariant zrównoważony.",
        "Q (Quartile): Korekta błędu o 25% - dobra dla kodów drukowanych.",
        "H (wysoki): 30% korekta błędów - najlepsza dla kodów z nakładkami lub w trudnych warunkach.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#qr-encoding",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Strefa ciszy (Margines)",
      paragraphs: [
        "Cicha strefa to biała przestrzeń wokół kodu QR. Skanery potrzebują tego marginesu, aby wykryć, gdzie zaczyna się kod. Norma zaleca co najmniej 4 moduły. Zmniejszenie poniżej 4 może powodować problemy ze skanowaniem.",
      ],
    },
    {
      heading: "Styl modułu",
      paragraphs: ["Moduły to pojedyncze kwadraty tworzące kod QR. ANQR oferuje pięć stylów:"],
      bullets: [
        "Plac: Klasyczny wygląd QR z ostrymi narożnikami.",
        "Zaokrąglone: Zmiękczone narożniki dla bardziej przyjaznego wyglądu.",
        "Kropki: Moduły okrągłe dla nowoczesnej estetyki.",
        "Diament: 45 ° rotacyjne kwadraty dla charakterystycznego wzoru.",
        "Połączone: Moduły łączą się, gdy są sąsiadujące, tworząc organiczne kształty.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Styl wzoru wyszukiwania",
      paragraphs: [
        "Wzory Findera to trzy duże kwadraty w rogach QR, które pomagają skanerom zorientować się w kodzie. Dostępne style:",
      ],
      bullets: [
        "Kwadrat: Standardowe narożniki kwadratowe.",
        "Zaokrąglone: Zmiękczone narożniki pasujące do zaokrąglonego stylu modułu.",
        "Krąg: Okrągłe wzory dla kodów dot- style.",
      ],
    },
    {
      heading: "Wzorce ustawiania czasu",
      paragraphs: [
        "Wzorce wyrównania pojawiają się w większych kodach QR (wersja 2 +), aby pomóc poprawić zniekształcenia. Wzory czasowe są zmiennymi liniami łączącymi wzory detektorów.",
      ],
      bullets: [
        "Styl wyrównania: dopasowanie Finder, Square, Zaokrąglony, lub Circle.",
        "Styl pomiaru czasu: Moduł dopasowania, Solid, lub Reshed.",
      ],
    },
    {
      heading: "Kolory",
      paragraphs: [
        "Pierwsza runda: Kolor modułów QR. Czarny (# 000000) jest standardem, ale każdy kolor ciemny działa.",
        "Kontekst: Kolor tła. Biały (# ffffff) jest standardem. Należy zapewnić wystarczający kontrast z pierwszeństwem.",
        "Przezroczyste tło: Usuń tło całkowicie do użycia na kolorowych powierzchniach. Upewnić się, że powierzchnia zapewnia odpowiedni kontrast.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Rozmiar modułu i gap",
      paragraphs: [
        "Rozmiar modułu: kontroluje jak duży jest każdy moduł w pikselach. Większe wartości tworzą większe, łatwe do skanowania kody.",
        "Moduł Gap: Dodaje przestrzeń między modułami jako procent. Niewielkie luki (5- 15%) mogą w niektórych warunkach poprawić zdolność do przepłukiwania, ale nadmierne luki zmniejszają niezawodność.",
      ],
    },
    {
      heading: "Ustawienia wyjścia",
      paragraphs: ["Format: Wybierz format eksportu na podstawie przypadku użycia."],
      bullets: [
        "PNG: Format rastrowy bezlosny, idealny do większości zastosowań. Najlepsze dla druku i cyfrowego.",
        "WebP: Nowoczesny format o mniejszych rozmiarach plików. Dobre do korzystania z sieci.",
        "GIF: Wymagany dla animowanych kodów QR. Wspiera przejrzystość.",
        "SVG: Format wektorowy, który skaluje nieskończenie. Najlepiej dla dużych druku lub gdy trzeba edytować kod.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-3",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Wymiary wyjściowe",
      paragraphs: [
        "Szerokość / Wysokość: Ustaw rozmiar wyjścia w pikselach. Do druku należy obliczyć na podstawie DPI (np. 300 DPI przy 1 calu = 300px). Większe rozmiary skanują na odległość.",
      ],
    },
    {
      heading: "Ustawienia animacji (Zaawansowane)",
      paragraphs: ["Sterowanie animowane zachowanie kodu QR:"],
      bullets: [
        "Prędkość: Wskaźnik animacji w milisekundach.",
        "Pętla: Animacja ciągła lub pojedyncza.",
        "Bounce: kierunek animacji Ping- pong.",
        "Ramka startowa: Rozpocznij animację z określonej ramki.",
        "Max Frames: Limit wszystkich klatek w animacji.",
        "Krok ramki: Pomiń ramki dla szybszej animacji.",
        "Interpolacja: Brak, Crossfade lub Morph między ramami.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Rodzaje zawartości (zaawansowane)",
      paragraphs: ["Zaawansowany poziom odblokowuje dodatkowe formaty obciążenia:"],
      bullets: [
        "Numer telefonu (tel.:): Tworzy połączenie telefoniczne.",
        "E-mail (mailto:): Otwiera klienta e-mail z opcjonalnym tematem i ciałem.",
        "SMS: wypełniona wiadomość tekstowa na numer telefonu.",
        "vCard: Pełna karta kontaktowa z nazwą, organizacją, telefonem, e-mailem, adresem.",
        "MeCard: Kompaktowy format kontaktu popularny w Japonii.",
        "BizCard: Legacy format wizytówki.",
        "Lokalizacja Geo: Współrzędne GPS otwarte na mapach.",
        "WiFi: Kwalifikacje sieciowe dla automatycznego połączenia (SSID, hasło, typ bezpieczeństwa).",
        "Event kalendarza: format iCalendar z tytułem, lokalizacją, datą / czasem.",
        "RSVP zdarzenia: Link do strony rejestracji zdarzenia.",
        "Subskrypcja kalendarza: subskrybować do ICS / WebCal.",
        "Plik / URL dokumentu: Bezpośredni link do plików do pobrania.",
        "Cloud Storage Link: odnośniki do dysku Google, Dropbox, OneDrive itp.",
        "Profil społeczny: Linki do LinkedIn, Twitter, Instagram, itp.",
        "Link do wiadomości: WhatsApp, Telegram, Głębokie łącza sygnałowe.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Zaawansowane funkcje nakładania",
      paragraphs: ["Dodatkowe możliwości nakładania:"],
      bullets: [
        "Uprawy: Umożliwia ucinanie, aby wybrać kwadratowy region obrazu.",
        "Halftone: Klasyczny wzór kropkowy w stylu druku oparty na jasności obrazu.",
        "Wyczerpane: Rozcieńczanie dyfuzyjne w celu szczegółowego rozmnażania.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#overlay",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Tryby narzutu mieszanego (zaawansowane)",
      paragraphs: ["Dodatkowe tryby mieszania na poziomie zaawansowanym:"],
      bullets: [
        "Subpixel: Dzieli każdy moduł na podpiksele dla wyższego szczegółu.",
        "Hałas niebieski: Używa niebieskiego szumu rozpraszającego dla wzorów wolnych od artefaktów.",
        "Mozaika: Efekt graficzny zachowujący strukturę obrazu.",
        "Wypełnienie luki: Umieszcza obraz w lukach między modułami.",
        "Jasność: Rozmiar modułu Varies w oparciu o jasność obrazu.",
        "Duotone: Obraz mapy do dwóch kolorów dla uderzającego kontrastu.",
      ],
    },
    {
      heading: "Intensywność narzutu",
      paragraphs: [
        "Kontroluje, jak silne nakładanie wpływa na kod QR (0- 100%). Wyższe wartości pokazują więcej szczegółów obrazu, ale mogą zmniejszyć scannability. Rozpocząć około 70% i dostosować na podstawie badań.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Tryb koloru",
      paragraphs: ["Sposób przetwarzania obrazu nakładki:"],
      bullets: [
        "Full Color: Zachowanie oryginalnych kolorów obrazu.",
        "Szarość: Konwertuje na czarno-białe tony.",
        "Czarny i biały: Wysoka konwersja binarna kontrastu.",
      ],
    },
    {
      heading: "Zachować wzory Finder",
      paragraphs: [
        "Gdy jest włączona, trzynarożnik nie jest modyfikowany przez nakładkę. Mocno zalecane do niezawodnego skanowania.",
      ],
    },
    {
      heading: "Wstępne przetwarzanie obrazów",
      paragraphs: [
        "Zastosuj filtry do obrazu nakładanego przed mieszaniem. Dostosowania te mogą poprawić wygląd obrazu w kodzie QR.",
      ],
      bullets: [
        "Jasność (-100 do + 100): Rozjaśnić lub przyciemnić obraz.",
        "Kontrast (-100 do + 100): Zwiększyć lub zmniejszyć zakres tonalny.",
        "Gamma (0,2 do 3,0): Nieliniowa regulacja jasności. Wartości poniżej 1 rozjaśniają midtony, powyżej 1 przyciemniają je.",
        "Nasycenie (-100 do + 100): intensywność koloru. -100 jest w skali szarości, + 100 jest przenasycone.",
        "Odcień rotacyjny (0- 360 °): Przesuń wszystkie kolory wokół koła kolorów.",
        "Smuga (0- 20px): Zmiękczyć szczegóły obrazu.",
        "Sharpen (0- 100%): Wzmocnić krawędzie i szczegóły.",
        "Posterize (0- 16 poziomów): Zmniejsz poziom kolorów dla efektu plakatu.",
        "Próg (0- 255): Konwersja na czarno-biały w punkcie odcięcia.",
        "Detekcja krawędzi: Algorytmy Sobel lub Canny wyświetlają tylko krawędzie.",
        "Odwróć: Odwróć wszystkie kolory.",
      ],
    },
    {
      heading: "Tryb dopasowania",
      paragraphs: ["Jak obraz pokrywa pasuje do obszaru kodu QR:"],
      bullets: [
        "Pokrywa: Obraz wypełnia cały obszar, w razie potrzeby przycinanie.",
        "Zawiera: Cały obraz widoczny, może mieć marginesy.",
        "Stretch: Obrazek zniekształca, aby wypełnić dokładnie.",
      ],
    },
    {
      heading: "Opcje transformacji",
      paragraphs: [
        "Obrót: Obrócić nakładkę w odstępach 90 °.",
        "Flip X / Y: Mirror obrazu poziomo lub pionowo.",
      ],
    },
    {
      heading: "Rozpraszające algorytmy",
      paragraphs: [
        "Rozcieńczanie konwertuje obrazy continuous- tone do wzorców, które kody QR mogą reprezentować. Dostępne przy użyciu trybów mieszania Difined, Blue Noise lub True Dither.",
      ],
      bullets: [
        "Błąd Diffusion: Klasyczny styl Floyd- Steinberg. Rozprzestrzenia błąd kwantyzacji do sąsiednich pikseli.",
        "Zamówione (Bayer): Używa matrycy progowej dla regularnych wzorców.",
        "Zaciśnięty Dot: symuluje drukowanie półtonowe.",
        "Puste & klaster: Zoptymalizowane rozpraszanie.",
        "Błękitny hałas: Przyjemny wizualnie, losowy wzór.",
        "Hałas niebieski Próg: Próg rozpraszający z niebieską teksturą hałasu.",
        "Biały hałas: Losowy próg rozpraszający.",
        "Gaussian / Triangangle Hałas: Hałas z różnymi dystrybucjami.",
        "Błękitny hałas + dyfuzja błędów: hybryda łącząca obie techniki.",
        "Błękitny hałas: wzór niebieskiego szumu.",
        "Percepcyjne: Luminance- ważone dla lepszych wyników wizualnych.",
        "Edge- Aware: Zachowanie krawędzi obrazu podczas rozpraszania.",
        "Próg adaptacyjny: Lokalnie adaptacyjne rusztowanie.",
        "Temporal Blue Hałas: Dla animowanych GIF, zmienia wzór na ramie.",
      ],
    },
    {
      heading: "Kernele dyfuzyjne",
      paragraphs: [
        "Podczas korzystania z Diffusion diffusion difhering, wybierz sposób dystrybucji błędu:",
      ],
      bullets: [
        "Floyd- Steinberg: Classic 4-sąsiedzi dyfuzja. Dobry wybór.",
        "Jarvis- Judice-Ninke: 12-sąsiad, gładszy, ale wolniejszy.",
        "Stucki: Podobne do JJN o różnych wagach.",
        "Burkes: Uproszczone JJN, szybciej.",
        "Sierra: Rodzina jąder równoważących jakość i szybkość.",
        "Atkinson: Dyfuzja światła, zachowuje szczegóły, ale może być ziarnisty.",
      ],
    },
    {
      heading: "Moc dither",
      paragraphs: [
        "Kontroluje, ile stosuje się dithering (0- 100%). Niższe wartości zachowują więcej oryginalnego wzoru, wyższe wartości pokazują więcej szczegółów obrazu.",
      ],
    },
    {
      heading: "Ustawienia subpixel",
      paragraphs: ["Podczas korzystania z trybu mieszania Subpixel:"],
      bullets: [
        "Rozmiar siatki: 2 × 2, 3 × 3 lub 4 × 4 podpiksele na moduł. Wyższy = więcej szczegółów.",
        "Zasada środka: Strict wymaga subpixel centrum do dopasowania modułu. Halftone Center pozwala na zmianę.",
        "Kolor neutralny: Kolor używany dla nieokreślonych podpikseli.",
        "Override Finder: W jaki sposób renderowane są wzorce znajdowania (stałe lub stylizowane).",
      ],
    },
    {
      heading: "Ustawienia halftone",
      paragraphs: ["Podczas korzystania z trybu mieszania Halftone:"],
      bullets: [
        "Rozmiar komórki: dla każdego modułu lub siatki N × N.",
        "Kształt kropki: okrąg, kwadrat lub linia.",
        "Krzywa jasności: Liniowa, S- Curve lub Gamma.",
      ],
    },
    {
      heading: "Kolory Duotone",
      paragraphs: [
        "Podczas korzystania z trybu mieszania Duotone, ustawić kolor Cieni (ciemne obszary) i podświetlić kolor (jasne obszary).",
      ],
    },
    {
      heading: "Ustawienia animacji GIF",
      paragraphs: ["Przy użyciu animowanych nakładek GIF:"],
      bullets: [
        "Użyj Opóźnienia ramki: Szanuj oryginalny czas GIF.",
        "Max FPS: Graniczna szybkość ramek (1- 60 fps).",
        "Postępowanie z usuwaniem: Należy przestrzegać lub uprościć metody usuwania ramki.",
      ],
    },
    {
      heading: "Zaawansowane opcje renderowania",
      paragraphs: ["Dodatkowe sterowanie renderowaniem:"],
      bullets: [
        "Tryb gap: Brak, Inset, Stroke, lub Negative Space luka styling.",
        "Promień rogu: Zaokrąglony procent rogów dla modułów.",
        "Gradient: Brak, Liniowy, Radiowy lub Stożkowy gradient na modułach.",
        "Eye Outter / Inner Style: Niezależna stylizacja pierścieni kreślarskich.",
        "Rotacja kropki: Obróć moduły diamentowo-kropkowe.",
        "Skala oczu: Dostosowanie rozmiaru dla wzorców znajdowania.",
        "Styl ramki: Dodaj ramy dekoracyjne (Zaokrąglona ramka, Naklejka, Znacznik).",
        'Tekst ramki: Dodaj tekst jak \\"Scan Me!\\" do ramek.',
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Zaawansowane kodowanie QR",
      paragraphs: ["Kodowanie QR Fine- tune:"],
      bullets: [
        "Tryb kodowania: Auto, Numeryczne, Alfanumeryczne, Byte / UTF- 8 lub Kanji.",
        "Enforce Min Quiet Zone: Upewnij się co najmniej 4 marża modułu.",
        "Wzór maski: Automatyczny (optymalny) lub ręcznie wybierz wzory 0–7, aby kontrolować dystrybucję modułu. Różne wzorce tworzą różne wyglądy wizualne podczas kodowania tych samych danych.",
        "Kodowanie znaków: ISO-8859-1 (domyślnie Latin-1), UTF-8 (pełny Unicode, w tym emoji) lub Shift-JIS (japoński). Wybierz na podstawie wymagań dotyczących znaków w treści.",
      ],
    },
    {
      heading: "Zaawansowane opcje wyjściowe",
      paragraphs: ["Dodatkowe ustawienia eksportu:"],
      bullets: [
        "Nazwa pliku: Nazwa pliku użytkownika do pobrania.",
        "GIF Rozmiar palety: 2- 256 kolorów w wyjściu GIF.",
        "GIF Ilościzer: Median Cut, NeuQuant, lub Octree redukcji kolorów.",
        "GIF Rozprzestrzenianie: Off, Floyd- Steinberg, lub Zamówienie.",
        "GIF Przezroczysty kolor: Ustaw kolor, aby był przejrzysty.",
        "SVG True Vector: Użyj ścieżek zamiast wbudowanego rastera.",
        "SVG Kształt Precyzja: Piksel lub Precyzyjne renderowanie ścieżki.",
        "SVG Zamieść Raster Overlay: Włączyć nakładkę jako wbudowany obraz.",
        "Kontekst Override: Wymuś określony kolor tła w wyjściu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Opcje walidacji",
      paragraphs: ["Ustawienia przetwarzania wejścia:"],
      bullets: [
        "Potwierdź wejście: Sprawdź format zawartości przed kodowaniem.",
        "Tim Whitespace: Usuń miejsca prowadzące / śledzące.",
        "Normalizacja nowych linii: Konwertuj wszystkie zakończenia linii na LF.",
        "Max LengGuard: Ostrzeż, jeśli zawartość przekracza pojemność QR.",
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: "Profesjonalne funkcje",
      paragraphs: [
        "Poziom Professional dodaje znaki wodne, metadane, opcje udostępniania, analizę bezpieczeństwa, kody QR płatności i cechy przedsiębiorstwa.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Znak wodny",
      paragraphs: ["Dodaj znaki wodne do kodów QR:"],
      bullets: [
        "Rodzaj: Tekst, obrazek lub znak wodny wzorca.",
        "Pozycja: Centrum, Kąty, Krawędzie, Za, lub Strefa Cicha.",
        "Nieprzezroczystość: przejrzystość znaku wodnego (0- 100%).",
        "Tryb mieszania: Normalny, wielokrotny, ekran lub mieszanka nakładana.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#watermark",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Metadane",
      paragraphs: ["Zamieść metadane w eksportowanych plikach:"],
      bullets: [
        "Tytuł, Autor, Prawa autorskie, Licencja, Pola Opis.",
        "Czas tworzenia: Zamieść znacznik czasu generacji.",
        "Własny Key- Value: Dodaj dowolne pary metadanych.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#metadata",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Udostępnianie",
      paragraphs: ["Podziel się konfiguracją kodu QR:"],
      bullets: [
        "Bezpośredni link: Generuj wspólny adres URL z aktualnymi ustawieniami.",
        "Zamieść HTML: Pobierz kod embed dla stron internetowych.",
        "Parametry kodowe: Dołącz wszystkie ustawienia w URL akcji.",
        "Uwaga: Nie można udostępniać obrazów z lokalnych plików za pośrednictwem URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-7",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Analiza bezpieczeństwa",
      paragraphs: ["Upewnij się, że kody QR pozostają dostępne:"],
      bullets: [
        "Tryb bezpieczeństwa: Wyłączony, zbalansowany lub ściśle skanowany.",
        "Moduł Min Rozmiar: minimalny rozmiar piksela na moduł.",
        "Min Cisza Obszar: Moduły minimalnego marginesu.",
        "Lock Finders / Timing / Align / Format / Wersja: Chronić specyficzne elementy.",
        "Max Nakładanie Intensywność wg ECC: Automatyczne ograniczenia intensywności oparte na poziomie korekty błędów.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#safety",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Rodzaje zawartości (Professional)",
      paragraphs: ["Poziom profesjonalny dodaje rodzaje płatności i treści dla przedsiębiorstw:"],
      bullets: [
        "EPC / SEPA (UE): europejskie kody QR przelewu bankowego z IBAN, BIC, kwota referencyjna.",
        "UPI (Indie): Ujednolicony interfejs płatności z VPA, nazwą odbiorcy płatności i kwotą.",
        "PayNow (Singapur): Singapur szybkie płatności z UEN lub numer telefonu komórkowego.",
        "PromptPay (Tajlandia): Tajski krajowy system płatności.",
        "PIX (Brazylia): Brazylijska płatność natychmiastowa kluczem PIX.",
        "Krypto: Bitcoin, Ethereum, Adresy płatności Litecoin z opcjonalną kwotą.",
        "Kampania marketingowa Link: URL z pełnym parametrem UTM (Marketing Tags) śledzenie.",
        "Krótki odnośnik: Do stosowania z skrótami URL dla dynamicznych / nadających się do śledzenia kodów QR.",
        "GS1 Digital Link: Identyfikacja produktu z GTIN, seria, partia, wygaśnięcie.",
        "App Deep Link: iOS / Android aplikacja głębokie linki z niestandardowych schematów.",
        "Format użytkownika: dane surowe bez formatowania lub walidacji.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-2",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: "Odpowiednie płatności w trybie zaawansowanym",
      paragraphs: [
        "Podczas korzystania z trybu zaawansowanego ANQR automatycznie pokazuje metody płatności odnoszące się do wybranego języka. Na przykład użytkownicy wietnamscy widzą VietQR, użytkownicy tajlandzcy PromptPay, a użytkownicy języka indyjskiego UPI i BharatQR. Globalne metody płatności (kryptocurrency, PayPal, Cash App) są dostępne dla wszystkich języków. Tryb profesjonalny otwiera wszystkie standardy płatności niezależnie od języka.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Europejskie standardy płatności",
      bullets: [
        "EPC / SEPA (UE): europejskie kody QR przelewu bankowego zgodnie ze standardem EPC QR. Wspiera IBAN, BIC (nieobowiązkowo w przypadku płatności krajowych), kwotę w EUR oraz ustrukturyzowane lub nieuporządkowane odniesienia do płatności. Używane w całej strefie SEPA, w tym w krajach UE oraz w Szwajcarii, Norwegii, Islandii, Liechtensteinie, Monako i San Marino.",
        "Swiss QR- bill: Swiss payment standard following SIX Implementation Guidelines. Wspiera CHF i EUR, QR- Reference (QRR), Creditor Reference (ISO 11649), ustrukturyzowane adresy wierzyciela / dłużnika oraz informacje o rachunku. Wymagane dla szwajcarskich faktur od 2022 r.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Indyjskie standardy płatności",
      bullets: [
        "UPI (Indie): Unified Payments Interface following NPCI Deep Linking Specification. Obsługuje VPA (Wirtualny adres płatności), nazwę odbiorcy, kwotę w INR, notkę transakcyjną, identyfikator referencyjny, kod kategorii handlowej i tryb transakcji.",
        "BharatQR (Indie): Jednolity standard QR wspierający zarówno płatności UPI, jak i płatności oparte na karcie. Łączy UPI VPA z kartą PAN dla maksymalnej zgodności. Obejmuje nazwę handlową, miasto, MCC, dane GST oraz numery faktur / referencyjne.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Normy płatności dla Azji Południowo-Wschodniej",
      bullets: [
        "PayNow (Singapur): Singapur szybki system płatności przy użyciu specyfikacji EMVCo QR z profilu SGQR. Obsługuje UEN (rejestracja działalności gospodarczej), numer telefonu komórkowego lub NRIC jako identyfikatory zastępcze. W tym znacznik wypłacalności kwoty i data wygaśnięcia.",
        "PromptPay (Tajlandia): Tajski krajowy system płatności zgodnie z profilem Banku Tajlandii EMV. Obsługuje numer telefonu komórkowego, krajowy identyfikator, identyfikator podatkowy, identyfikator e-portfela oraz płatność rachunków z wieloma polami referencyjnymi.",
        "QRIS (Indonezja): Quick Response Code indonezyjski standard. Krajowy standard płatności oparty na EMV, wspierający ID kupca, NID (National Merchant ID), klasyfikację kryteriów handlowych oraz opłaty za wygody (stałe lub procentowe).",
        "DuitNow (Malezja): Malezyjski system płatności natychmiastowych. Obsługuje wiele typów proxy, w tym NRIC, telefon komórkowy, paszport, legitymacja wojskowa i numery rejestracyjne.",
        "VietQR (Wietnam): wietnamski standard transferu międzybankowego. Wymaga BIN banku (identyfikacja NAPAS) i numer konta. Obsługuje wiele kodów usług dla różnych rodzajów transferu (QRPUSH, QRIBFTTA, QRIBFTTC).",
        "QR Ph (Filipiny): Filipiński standard płatności QR dla InstaPay i PESONet. Używa numerów kont z identyfikacją sprzedawcy w transakcjach P2M (od osoby do sprzedawcy).",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Wschodnioazjatyckie standardy płatności",
      bullets: [
        "TWQR (Tajwan): Taiwański standard płatności QR. Obsługuje identyfikatory handlowe, podatkowe i TWD.",
        "HKQR / FPS (Hong Kong): Hong Kong Faster Payment System QR codes. Obsługuje identyfikator FPS, numer telefonu komórkowego lub e-mail jako identyfikatory płatności. Kwoty w HKD.",
        "JPQR (Japonia): Japoński jednolity standard płatności kodu QR. Używa identyfikatora sklepu do identyfikacji handlowej z kwotami JPY.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Inne regionalne standardy płatności",
      bullets: [
        "PIX (Brazylia): Brazylijski Bank Centralny system płatności natychmiastowych zgodnie ze specyfikacją BR Code. Obsługuje klucze PIX (CPF, CNPJ, e-mail, telefon lub klucz losowy), nazwę handlową / miasto, identyfikator transakcji i kwoty BRL.",
        "AusPayNet / NPP PayID (Australia): Australian New PayID Platform PayID. Obsługa Wypłata Typy identyfikatorów (e-mail, telefon komórkowy, ABN, identyfikator organizacji) lub tradycyjny numer konta BSB +. Nazwa handlowa jest opcjonalna, ponieważ płatnicy widzą zarejestrowaną nazwę z przeszukiwania NPP.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Płatności kryptoburtowe",
      bullets: [
        "Bitcoin / Litecoin (BIP- 21): Standard płatności kryptoburtowe URI z adresem portfela, kwota opcjonalna i etykieta. Kompatybilny ze wszystkimi ważnymi portfelami Bitcoin i Litecoin.",
        "Sieć pioruna (BOLT11): Faktury płatności w sieci błyskawicznej. Wklej zakodowany ciąg faktur BOLT11 dla natychmiastowych płatności Bitcoin z minimalnymi opłatami.",
        "Ethereum (EIP-681): Prośba o transakcję Ethereum URI wspierająca rodzime transfery ETH i transfery symboli ERC-20. Zawiera identyfikator łańcucha dla wielosieciowego wsparcia (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parametry gazu i połączenia funkcji kontraktowych.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Usługi łącza płatności",
      bullets: [
        "PayPal.Me: Linki płatnicze PayPal z nazwą użytkownika i opcjonalną wcześniej wypełnioną kwotą. Klienci mogą płacić za pośrednictwem salda PayPal, kart lub kont bankowych.",
        "Aplikacja gotówkowa: linki do płatności w aplikacji gotówkowej przy użyciu tagu $cashtag z opcjonalną kwotą. Popularny w Stanach Zjednoczonych w przypadku płatności peer-to-peer.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Generalne EMV QR",
      bullets: [
        "EMV Generic: Utwórz własny tryb Merchant- Prezented EMV Kody QR dla systemów płatności niewymienionych szczegółowo. Skonfiguruj nazwę handlową, miasto, kod kraju (ISO 3166-1), kod waluty (ISO 4217 numeryczny), MCC, opcje opłat napiwkowych / wygodnych oraz dodatkowe pola danych. Przydatne do testowania lub niestandardowych integracji.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: "Tryby narzutu mieszanego (Professional)",
      paragraphs: ["Dodatkowe tryby mieszania na poziomie zawodowym:"],
      bullets: [
        "Pixelate: Pixelated overlay effect.",
        "Uwaga: Nakładka wykrywająca krawędź pokazuje tylko kontury.",
        "Wave: Wavy efekt zniekształceń.",
        "Rozmiar subpixel: Zmienna wielkość subpixel na podstawie obrazu.",
        "True Dither: Zaawansowane dithering z uporządkowanym wyborem matrycy.",
        "Ekstremalne: Maksymalna widoczność obrazu, może wpływać na scannability.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Ustawienia zabezpieczeń",
      paragraphs: [
        "Kontrola fineziarnista, nad którą elementy QR są chronione przed modyfikacją nakładki:",
      ],
      bullets: [
        "Zachowaj czas: Nie modyfikuj wzorców czasowych.",
        "Zachować dopasowanie: Zachować wzorce osiowania niezmienione.",
        "Chroń format Informacja: Moduły informacyjne formatu tarcz.",
        "Chronić wersję Info: Moduły informacyjne wersji ekranowej.",
      ],
    },
    {
      heading: "Tryb ECC- Aware",
      paragraphs: [
        "Inteligentnie rozdziela intensywność nakładania w oparciu o wydajność korekcji błędów. System analizuje, które moduły mogą być modyfikowane przy jednoczesnym zachowaniu możliwości skanowania.",
      ],
      bullets: [
        "Budżet na ryzyko: Procent zdolności do korekty błędów (0- 100%).",
        "Wyższy budżet = bardziej widoczne nakładanie, ale bardziej ryzykowne skanowalność.",
        "Niższy budżet = bezpieczniejsze skanowanie, ale mniej widoczne nakładanie.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesjonalne opcje renderowania",
      paragraphs: ["Zaawansowane sterowanie renderowaniem:"],
      bullets: [
        "Szlifowane krawędzie: Użyj pikselowanego renderowania obrazu dla ostrych krawędzi modułu.",
        "Pixel Snap: Pixel Fixel, Okrągłe lub Ceil.",
        "Tryb barwny Per- Module: Solid, By Brighty, By position, By Overlay, By Cluster.",
        "Paleta kolorów: Zdefiniuj własną paletę kolorów dla per- module barwiących.",
        "Straż kontrastowa: Zapewnienie minimalnego stosunku kontrastu między kolorami.",
        "Min współczynnik kontrastu: wymóg kontrastu w stylu WCAG (1: 1 do 21: 1).",
        "Poza granicami Moduły: Dodatkowa granica poza strefą ciszy.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#render",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesjonalne opcje wyjściowe",
      paragraphs: ["Ustawienia eksportu przedsiębiorstw:"],
      bullets: [
        "DPI: Ustaw rozdzielczość druku (72- 600 DPI). 300 DPI zalecane do druku.",
        "Włączaj strefę ciszy: Włączenie / wyłączenie strefy ciszy w wymiarach wyjściowych.",
        "Eksportuj jako dodatkowe: Generuj PDF obok formatu pierwotnego.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#output",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Ustawienia animacji (Professional)",
      paragraphs: ["Dodatkowe profesjonalne funkcje animacji:"],
      bullets: [
        "Dither temporal: Off, Błękitny hałas, lub Flicker Safe per- frame dithering.",
        "Wzór: Brak, Puls, Wave, Scanline, Shimmer lub Drift efekty.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#animation",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: "API Odniesienie",
      paragraphs: [
        "ANQR zapewnia interfejs API po stronie serwera do generowania kodów QR za pomocą parametrów adresu URL. Jest to idealne rozwiązanie do osadzania kodów QR w witrynach internetowych, wiadomościach e-mail, dokumentach lub zautomatyzowanych przepływach pracy bez JavaScript po stronie klienta.",
        "Base URL: https: / / anqr.link / api / qr",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Zobacz przykłady QR", type: "example" }],
    },
    {
      heading: "Parametry podstawowe",
      paragraphs: ["Wymagane i wspólne parametry (nazwy parametrów nie są tłumaczone):"],
      bullets: [
        "dane (wymagane): Zawartość kodowania w kodzie QR. URL-encode znaków specjalnych.",
        "rozmiar: rozmiar obrazu w pikselach (domyślnie 400, max: 2000). Używane, jeżeli w / h nie podano.",
        "w, h: Szerokość wyjściowa i wysokość w pikselach. Przewyższa parametr wielkości.",
        "format: Format wyjściowy - png, webp lub gif (domyślnie: png).",
        "ec: Poziom korekty błędu - L, M, Q lub H (domyślnie: H).",
        "fg: Kolor początkowy jako hex bez # (domyślnie: 000000).",
        "bg: Kolor tła jako hex bez # (domyślnie: ffffff).",
        "przezroczyste: Ustaw na 1 dla przezroczystego tła.",
        "marża: Strefa ciszy w modułach (domyślnie: 4).",
      ],
    },
    {
      heading: "Parametry stylizacji",
      paragraphs: ["Moduł i stylizacja wzorca:"],
      bullets: [
        "styl: Moduł styl - kwadratowy, zaokrąglony, kropki, diament, połączone.",
        "finder: Styl wzoru Finder - kwadratowy, zaokrąglony, okrąg.",
        "wyrównanie: styl wzorca wyrównania - match _ finder, kwadrat, zaokrąglony, okrąg.",
        "timing: Styl wzorca czasu - match _ module, solidny, przerywany.",
        "promień: Promień rogówki procent 0- 100.",
        "luka: Luka modułowa procentowa 0- 50.",
        "gapMode: Tryb gap - brak, inset, suw, minus _ space.",
        "oko Zewnętrzny, naoczny: style oczu - kwadratowy, zaokrąglony, okrąg.",
        "skala wzroku: Procent skali oka (domyślnie: 100).",
        "grad: Gradient type - none, linear, radial, conic.",
        "gradAngle: kąt gradientu dla gradientów liniowych.",
        "gradStops: Gradient zatrzymuje się jako color1, pos1, color2, pos2,... (np. ff0000,0,0000ff, 1).",
      ],
    },
    {
      heading: "Parametry narzutu",
      paragraphs: ["Opcje narzutu obrazu (narzucenie obrazu jest pobrane po stronie serwera):"],
      bullets: [
        "img: URL do nakładania obrazu (musi być publicznie dostępny).",
        "tryb: tryb zatapiania - środek, półton, mieszanka, jasność, mozaika, dished, blue- hałas, subpixel.",
        "natężenie: Nakładanie natężenia 0- 100 (domyślnie: 100).",
        "kolor Tryb: Overlay tryb koloru - kolor, szarość, bw.",
        "dopasowanie: Jak dopasować nakładanie - przykryć, przechowywać, rozciągać.",
        "rotacja w stopniach.",
        "flipX, flipY: Ustaw na 1, aby odwrócić narzut.",
        "zachować Znalezione: Zachować wzorce wyszukiwania (domyślnie: 1).",
        "zachować Czas, KeepAlign: Ustaw na 1, aby zachować wzorce czasu / ustawienia.",
      ],
    },
    {
      heading: "Parametry wstępnego przetwarzania",
      paragraphs: ["Wstępne przetwarzanie obrazu stosowane do nakładania:"],
      bullets: [
        "jasność: Regulacja -100 do 100 (domyślnie: 0).",
        "kontrast: Regulacja -100 do 100 (domyślnie: 0).",
        "gamma: Wartość 0,1 do 3 (domyślnie: 1).",
        "nasycenie: Regulacja -100 do 100 (domyślnie: 0).",
        "odcień: obrót barwy w stopniach.",
        "rozmycie: rozmycie w pikselach.",
        "temper: dawka 0 - 100.",
        "posterize: Posterize poziomów.",
        "próg: Progi binarne 0- 255.",
        "krawędzi: Detekcja krawędzi - off, sobel, canny.",
        "invert: Ustaw na 1, aby odwrócić kolory.",
      ],
    },
    {
      heading: "Parametry znaku wodnego",
      paragraphs: ["Dodaj znaki wodne do wygenerowanych kodów QR:"],
      bullets: [
        "wmEn: Ustaw na 1, aby włączyć znak wodny.",
        "wm Rodzaj: Typ znaku wodnego - tekst, obraz, wzór.",
        "wmText: tekst znaku wodnego (zakodowany w URL).",
        "wmImg: URL do znaku wodnego.",
        "wmPos: Pozycja - środek, narożniki, krawędzie, z tyłu, cicha _ strefa.",
        "wmOpacity: Nieprzezroczystość 0- 100 (domyślnie: 50).",
        "wmBlend: Tryb mieszania - normalny, mnożenie, ekran, nakładanie.",
      ],
    },
    {
      heading: "Parametry animacji",
      paragraphs: ["Dla animowanego wyjścia GIF (wymaga formatu = gif):"],
      bullets: [
        "anim Wzór: Wzór animacji - brak, puls, fala, scanline, shimmer, dryf, color _ cycle.",
        "anim Ramki: Liczba klatek 1- 60 (domyślnie: 24).",
        "anim Prędkość: Opóźnienie ramki w milisekundach 10- 1000 (domyślnie: 100).",
        "anim Nasiona: Losowe nasiona do animacji.",
        "leasing: Animation leasing - linear, easy _ in, easy _ out, easy _ in _ out, bounce.",
      ],
    },
    {
      heading: "Parametry wyjściowe",
      paragraphs: ["Opcje formatu wyjścia:"],
      bullets: [
        "jakość: jakość WebP 0-1 (domyślnie: 0.9).",
        "webpQ: Jakość webP 0- 100 (domyślnie: 90).",
        "gifColors: paleta GIF rozmiar 2- 256 (domyślnie 256).",
        "dpi: Wyjście DPI dla PNG (domyślnie: 72).",
        "metaTitle, metaAutor, metaCopy, meta Desc: pola metadanych PNG.",
      ],
    },
    // Crop Parameters
    {
      heading: "Parametry upraw",
      paragraphs: ["Opcje przycinania obrazu nakładki:"],
      bullets: [
        "uprawEn: Włącz przycinanie nakładki 0/1 (domyślnie: 0).",
        "uprawX: Środek kadrowania X jako ułamek 0-1 (domyślnie: 0,5).",
        "uprawY: Środek kadrowania Y jako ułamek 0-1 (domyślnie: 0,5).",
        "CropSize: Rozmiar przycięcia jako ułamek obrazu 0-1 (domyślnie: 1).",
      ],
    },
    // Safety Lock Parameters
    {
      heading: "Parametry blokady bezpieczeństwa",
      paragraphs: ["Kontroluj, które elementy QR są chronione przed modyfikacją nakładek:"],
      bullets: [
        "lockF: Wzory wyszukiwania blokad 0/1 (domyślnie: 1).",
        "lockT: Zablokuj wzorce synchronizacji 0/1 (domyślnie: 1).",
        "lockA: Zablokuj wzory wyrównania 0/1 (domyślnie: 1).",
        "lockFmt: Informacje o formacie blokady 0/1 (domyślnie: 1).",
        "lockV: Zablokuj informacje o wersji 0/1 (domyślnie: 1).",
        "SafeMode: Tryb bezpieczeństwa - wyłączony, zrównoważony, rygorystyczny (domyślnie: wyłączony).",
        "SafeMinPx: Minimalny rozmiar modułu w pikselach (domyślnie: 2).",
        "SafeMinQz: Minimalna liczba modułów cichej strefy (domyślnie: 4).",
      ],
    },
    // Auto-tuning Parameters
    {
      heading: "Parametry automatycznego dostrajania",
      paragraphs: ["Ustawienia automatycznej optymalizacji:"],
      bullets: [
        "autoVer: Automatyczny wybór wersji QR 0/1 (domyślnie: 1).",
        "autoEcc: Automatyczny wybór poziomu ECC 0/1 (domyślnie: 0) - tylko wskazówka po stronie serwera.",
        "autoReduce: [TYLKO KLIENT] Automatycznie zmniejsz intensywność do momentu, aż będzie można ją zeskanować — wymaga pętli sprawdzania poprawności skanowania.",
      ],
    },
    // Additional Animation Parameters
    {
      heading: "Dodatkowe parametry animacji",
      paragraphs: ["Rozszerzone sterowanie animacją dla wyjścia GIF:"],
      bullets: [
        "pętla: Animacja zapętla się w sposób ciągły 0/1 (domyślnie: 1).",
        "odbicie: kierunek animacji ping-ponga 0/1 (domyślnie: 0).",
        "wstecz: Odtwórz animację do tyłu 0/1 (domyślnie: 0).",
        "colorCycle: Włącz efekt cykliczności kolorów 0/1 (domyślnie: 0).",
        "interp: Interpolacja klatek - brak, przenikanie, zmiana (domyślnie: brak).",
        "tempDither: Dithering czasowy - wyłączony, blue_noise, flicker_safe (domyślnie: wyłączony).",
        "startF: Klatka początkowa animacji (domyślnie: 0).",
        "maxF: Maksymalna liczba klatek do renderowania (domyślnie: 0 = auto).",
        "stepF: Interwał kroku ramki (domyślnie: 1).",
        "Jitter: [TYLKO KLIENT] Jitter modułu w pikselach - wymaga regeneracji QR na klatkę.",
      ],
    },
    // Dithering Parameters
    {
      heading: "Parametry ditheringu",
      paragraphs: ["Kontroluj algorytmy ditheringu dla przetwarzania nakładek:"],
      bullets: [
        "ditherKind: Algorytm roztrząsania - error_diffusion, uporządkowany_bayer, blue_noise itp. (domyślnie: zamówiony_bayer).",
        "diffusionKernel: Błąd dyfuzji jądra - floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (domyślnie: floyd_steinberg).",
        "ditherStrength: Intensywność ditheringu 0-100 (domyślnie: 50).",
        "serpentyn: Roztrząsanie serpentynu 0/1 (domyślnie: 0).",
        "matrix: Uporządkowana macierz ditherowania - bayer2, bayer4, bayer8 (domyślnie: bayer4).",
        "bnTile: Rozmiar kafelka niebieskiego szumu (domyślnie: 64).",
        "bnSeed: losowe ziarno niebieskiego szumu (domyślnie: 0).",
        "colorDither: Roztrząsanie kolorów - brak, na kanał, percepcyjne (domyślnie: brak).",
      ],
    },
    // Subpixel Parameters
    {
      heading: "Parametry subpikseli",
      paragraphs: ["Ustawienia trybu mieszania subpikseli:"],
      bullets: [
        "spGrid: Rozmiar siatki subpikseli - 2x2, 3x3, 4x4 (domyślnie: 3x3).",
        "spCenter: Reguła centrum - ścisła, halftone_center (domyślnie: ścisła).",
        "spNeutral: Heks koloru neutralnego bez # (domyślnie: 808080).",
        "spFinder: Nadpisanie Findera - pełne, stylizowane (domyślnie: pełne).",
      ],
    },
    // Halftone Parameters
    {
      heading: "Parametry półtonów",
      paragraphs: ["Ustawienia trybu mieszania półtonów:"],
      bullets: [
        "htCell: Rozmiar komórki rastra - na moduł lub siatkę nxn (domyślnie: na moduł).",
        "htDot: Kształt kropki - okrąg, kwadrat, linia (domyślnie: okrąg).",
        "htCurve: Krzywa jasności - liniowa, s-curve, gamma (domyślnie: liniowa).",
        "duo1: Heks koloru cienia duotone bez # (domyślnie: 000000).",
        "duo2: Hex koloru podświetlenia Duotone bez # (domyślnie: ffffff).",
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: "Parametry trybu uwzględniającego ECC",
      paragraphs: ["Inteligentna dystrybucja nakładek oparta na możliwościach korekcji błędów:"],
      bullets: [
        "eccAware: Włącz tryb obsługujący ECC 0/1 (domyślnie: 0).",
        "eccRisk: Procent budżetu ryzyka 0-100 (domyślnie: 50).",
        "eccMap: Mapa wag - Distance_to_finders, block_heatmap, empirical_scan_heatmap (domyślnie: Distance_to_finders).",
      ],
    },
    // Frame Parameters
    {
      heading: "Parametry ramy",
      paragraphs: ["Ustawienia ramki dekoracyjnej:"],
      bullets: [
        "ramka: Styl ramki - brak, zaokrąglona_ramka, naklejka, znacznik (domyślnie: brak).",
        "FrameText: Tekst wyświetlany w ramce (zakodowany adres URL).",
      ],
    },
    // Per-Module Color Parameters
    {
      heading: "Parametry koloru na moduł",
      paragraphs: ["Indywidualne możliwości kolorowania modułu:"],
      bullets: [
        "modColor: Tryb koloru - solid, by_jasność, by_position, by_overlay, by_cluster (domyślnie: solidny).",
        "cGuard: Strażnik kontrastu 0/1 (domyślnie: 0).",
        "minContrast: Minimalny współczynnik kontrastu 1-21 (domyślnie: 4,5).",
        "paleta: kolory szesnastkowe oddzielone przecinkami dla trybu palety.",
        "paletaMode: Rozkład palety - pozycja, jasność, przekątna, promieniowa, losowa, wiersz, kolumna (domyślnie: pozycja).",
      ],
    },
    // GIF Overlay Parameters
    {
      heading: "Parametry nakładki GIF",
      paragraphs: ["Ustawienia animowanych obrazów nakładek GIF:"],
      bullets: [
        "ovType: Typ nakładki - statyczny, gif, apng, webp_anim, wideo (domyślnie: statyczny).",
        "ovFramePick: Wybór klatki - wszystkie, co_n, max_frames, limit_czasu (domyślnie: wszystkie).",
        "gifDelays: Użyj oryginalnych opóźnień klatek GIF 0/1 (domyślnie: 1).",
        "gifDispH: Obsługa usuwania GIF - szanuj, upraszczaj (domyślnie: szanuj).",
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: "Limity intensywności według ECC",
      paragraphs: ["Maksymalna intensywność nakładki na poziom korekcji błędów:"],
      bullets: [
        "maxIntL: Maksymalna intensywność dla ECC L 0-100 (domyślnie: 100).",
        "maxIntM: Maksymalna intensywność dla ECC M 0-100 (domyślnie: 100).",
        "maxIntQ: Maksymalna intensywność dla ECC Q 0-100 (domyślnie: 100).",
        "maxIntH: Maksymalna intensywność dla ECC H 0-100 (domyślnie: 100).",
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: "Parametry symulacji kontroli jakości (tylko klient)",
      paragraphs: [
        "Te parametry są analizowane pod kątem zgodności z adresami URL, ale działają tylko w przeglądarce:",
      ],
      bullets: [
        "qaContrast: Włącz kontrolę kontrastu 0/1 — wymaga interaktywnej weryfikacji.",
        "qaBlur: Symuluj rozmycie w pikselach - tylko do testów interaktywnych.",
        "qaNoise: Symuluj poziom hałasu - tylko do testów interaktywnych.",
        "qaHeatmap: Pokaż mapę cieplną czytelności 0/1 - wymaga interfejsu użytkownika nakładki płótna.",
      ],
    },
    // Client-Only Parameters
    {
      heading: "Parametry tylko dla klienta",
      paragraphs: [
        "Większość parametrów API jest w pełni obsługiwana po stronie serwera. Parametry oznaczone jako [CLIENT-ONLY] są analizowane pod kątem zgodności z adresami URL, ale wymagają funkcji przeglądarki:",
      ],
      bullets: [
        "Jitter: Jitter modułu wymaga losowej regeneracji QR na klatkę.",
        "autoReduce: Intensywność automatycznego zmniejszania wymaga iteracyjnego testowania skanowania.",
        "qaContrast, qaBlur, qaNoise, qaHeatmap: Symulacja kontroli jakości wymaga interaktywnej weryfikacji płótna.",
      ],
    },
    // Additional Output Parameters
    {
      heading: "Dodatkowe parametry wyjściowe",
      paragraphs: ["Rozszerzone ustawienia wyjściowe i eksportowe:"],
      bullets: [
        "fname: Niestandardowa nazwa pliku do pobrania (domyślnie: anqr-qrcode).",
        "inclQz: Uwzględnij cichą strefę w wymiarach wyjściowych 0/1 (domyślnie: 1).",
        "bgOver: Zastąpienie koloru tła w formacie szesnastkowym bez # (zastąpienie parametru bg).",
        "fmtExtra: Dodatkowy format wyjściowy - brak, eps, animowany_webp (domyślnie: brak). Uwaga: eps to [CZĘŚCIOWE].",
        "svgPrec: Precyzja kształtu SVG - piksel, precyzyjny (domyślnie: piksel). [CZĘŚCIOWE] Ograniczone wyjście SVG po stronie serwera.",
        "svgEmbed: Osadź nakładkę rastrową w SVG 0/1 (domyślnie: 1). [CZĘŚCIOWE] Ograniczone wyjście SVG po stronie serwera.",
        "modulePx: Rozmiar modułu w pikselach (domyślnie: obliczany automatycznie na podstawie rozmiaru).",
        "obramowanie: Dodatkowe moduły obramowania poza cichą strefą (domyślnie: 0).",
        "wyraźny: Włącz ostre/pikselowane renderowanie obrazu 0/1 (domyślnie: 1).",
        "przyciąganie: tryb przyciągania pikseli - podłoga, okrągła, sufit (domyślnie: podłoga).",
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: "Parametry zachowania wzoru",
      paragraphs: ["Kontroluj, które elementy konstrukcyjne są chronione przed nałożeniem:"],
      bullets: [
        "keepFinders: Zachowaj wzorce wyszukiwania 0/1 (domyślnie: 1).",
        "keepTiming: Zachowaj wzorce synchronizacji 0/1 (domyślnie: 0).",
        "keepAlign: Zachowaj wzorce wyrównania 0/1 (domyślnie: 0).",
        "ProtectFmt: Chroń moduły informacyjne w formacie 0/1 (domyślnie: 0).",
        "ProtectVer: Chroń moduły informacji o wersji 0/1 (domyślnie: 0).",
      ],
    },
    {
      heading: "Przykład użycia",
      paragraphs: [
        "Podstawowy kod QR:",
        "https: / / anqr.link / api / qr? data = https: / / example.com",
        "Stylizowany kod QR z niestandardowych kolorach:",
        "https: / / anqr.link / api / qr? data = Hello & size = 300 & fg = 1e40af & bg = ffffff & style = round & radius = 30",
        "Kod QR z obrazem nakładki:",
        "https: / / anqr.link / api / qr? data = https: / / example.com & ec = H & img = https: / / example.com / logo.png & mode = halftone & intensity = 70",
        "Animowane GIF:",
        "https: / / anqr.link / api / qr? data = Hello & format = gif & animPattern = pulse & animFrames = 24 & leasing = lease _ in _ out",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Zobacz przykłady QR", type: "example" }],
    },
    {
      heading: "Osadzanie kodów QR",
      paragraphs: [
        "W trybie profesjonalnym funkcja Share generuje osadzone HTML i adresy URL. Oto jak działa osadzanie:",
      ],
      bullets: [
        "Share Link: Tworzy URL do aplikacji ANQR ze wszystkimi ustawieniami zakodowanymi jako parametry URL. Odbiorcy mogą przeglądać i modyfikować kod QR.",
        "Zamieść obrazek: generuje znacznik < img > wskazujący na API serwera. Kod QR jest renderowany po stronie serwera i służy jako obraz.",
        "Zamieść Markdown: Tworzy składnię obrazu Markdown dla dokumentacji i plików README.",
        "Bezpośredni adres API: Surowy URL API do zastosowania w aplikacjach, skryptach lub innych integracjach.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Przykład HTML",
      paragraphs: [
        "Aby umieścić kod QR na swojej stronie internetowej:",
        '< img src = \\"https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 200\\" alt = \\"QR Code\\" / >',
        "Do pomiaru reakcji:",
        '< img src = \\"https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 400\\" alt = \\"QR Code\\" style = \\"max- width: 100%; height: auto;\\" / >',
        "Serwer zapisuje odpowiedzi z długim nagłówkiem pamięci podręcznej, więc powtarzane żądania dla tego samego adresu URL są szybkie.",
      ],
    },
    {
      heading: "Udostępnij format URL",
      paragraphs: [
        "Po kliknięciu Udostępnij w trybie profesjonalnym ANQR koduje aktualne ustawienia do parametrów URL. Format:",
        "https: / / anqr.link /? data =... & ec = H & style = round &....",
        "Parametry te odzwierciedlają parametry API, dzięki czemu można przekonwertować URL akcji do URL API poprzez zmianę ścieżki bazowej z / na / / api / qr i dostosowanie parametrów w / h w razie potrzeby.",
        "Uwaga: Nie można udostępniać zdjęć z lokalnych plików za pośrednictwem URL - tylko nakładki oparte na URL (parametr img) działają w współdzielonych linkach i wywołaniach API.",
      ],
    },
    {
      heading: "Wartości graniczne i zastosowanie",
      paragraphs: [
        "API jest wolny do użycia w rozsądnych ilościach. W celu zapewnienia wysokiej głośności lub zastosowań komercyjnych wymagających gwarantowanego czasu pracy, prosimy o kontakt.",
        "Reakcje API obejmują agresywne nagłówki buforujące. Dla najlepszej wydajności, odpowiedzi cache na koniec lub używać tego samego URL konsekwentnie dla identycznych kodów QR.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: "Najlepsze praktyki",
      paragraphs: [
        "Należy przestrzegać niniejszych wytycznych w odniesieniu do wiarygodnych kodów QR:",
      ],
      bullets: [
        "Przed drukowaniem należy zawsze testować kody QR za pomocą wielu aplikacji skanujących.",
        "Przy dodawaniu nakładek użyj korekty błędów H (High).",
        "Zachować co najmniej 4 moduły strefy ciszy (margines).",
        "Zapewnić wysoki kontrast między pierwszoplanem a tłem.",
        "W przypadku druku należy użyć co najmniej 300 DPI i sprawdzić rzeczywisty rozmiar druku.",
        "Włącz wzorce Finder w przypadku stosowania nakładek.",
        "Należy rozpocząć od mniejszej intensywności nakładania i stopniowo zwiększać dawkę.",
        "Do użytku na zewnątrz, rozważyć większe rozmiary modułów i wyższa korekta błędów.",
      ],
      links: [
        { href: "/learn?lang=${lang}", label: "Przeglądaj Nauka artykułów", type: "learn" },
        { href: "/examples?lang=${lang}", label: "Zobacz przykłady QR", type: "example" },
      ],
    },
    {
      heading: "Rozwiązywanie problemów",
      paragraphs: ["Wspólne kwestie i rozwiązania:"],
      bullets: [
        "QR nie skanuje: Zmniejszyć intensywność nakładania, zwiększyć korektę błędów, sprawdzić kontrast.",
        "Kod zbyt duży: Zmniejsz długość zawartości, użyj skrótu URL, dolna wersja.",
        "Niewyraźne wyjście: Zwiększ rozmiar modułu, użyj PNG zamiast skompresowanych formatów.",
        "Kolory wyglądają źle: Sprawdź kontrast kolorów, spróbuj w trybie szarości.",
        "GIF nieanimujący: Upewnij się, że korzystasz z wyjścia formatu GIF, sprawdź liczbę klatek.",
        "Obrazek nie jest wczytywany: Sprawdź uprawnienia CORS na zdalnych zdjęciach.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Zob. powiązane wytyczne i przykłady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Skróty klawiszowe",
      paragraphs: [
        "ANQR obsługuje standardowe skróty klawiszowe. Użyj Ctrl / Cmd + S, aby uruchomić eksport (gdy jest skupiony na podglądzie).",
      ],
    },
    {
      heading: "Udostępnianie i osadzanie",
      paragraphs: [
        "W trybie Professional, kliknij przycisk Udostępnij, aby skopiować URL z aktualnych ustawień. Odbiorcy mogą otworzyć ten adres, aby zobaczyć dokładną konfigurację. Uwaga: Nie można udostępniać obrazów z lokalnych plików za pośrednictwem URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Spróbuj tej konfiguracji bezpośrednio w generatorze ANQR.",
          type: "generator",
        },
      ],
    },
  ],
  relatedLinks: [
    { href: "/learn?lang=${lang}", label: "Przeglądaj Nauka artykułów", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Zobacz przykłady QR", type: "example" },
    { href: "/gallery?lang=${lang}", label: "Zobacz przykłady QR", type: "gallery" },
    { href: "/?lang=${lang}", label: "Otwórz generator", type: "generator" },
  ],
};

export default guide;
