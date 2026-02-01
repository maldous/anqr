import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Przykłady ANQR',
  description:
    'Pięć rzeczywistych przykładów w stylu produkcyjnym, które pokazują, gdzie kody QR tworzą wymierną wartość: ulepszenie starszego kodu licznika w handlu detalicznym, markowe płatności detaliczne i działania "skanuj do", skalowanie druku od ulotek do billboardów, animowany kod QR do oznakowania cyfrowego oraz współpraca międzyjęzykowa przy użyciu udostępnianych linków Anchor. Każdy przykład zawiera obrazy, ograniczenia praktyczne i link do remiksu prowadzący do generatora.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otwórz generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Przeglądaj Nauka artykułów', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otwórz pełny przewodnik użytkownika', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Badanie przypadku: Licznik sprzedaży detalicznej QR Upload',
      paragraphs: [
        'Ten przykład z życia wzięty dotyczy małej kawiarni, która od trzech lat używa na ladzie tego samego kodu QR. Oryginalny kod został wygenerowany szybko w czasie szczytu pandemii, wydrukowany na standardowym papierze i wsunięty do plastikowej podstawki. Nadal działał – technicznie – ale klienci często musieli wielokrotnie próbować go zeskanować, a to nie pomagało we wzmocnieniu starannie opracowanej tożsamości marki kawiarni.',
        'Transformacja rozpoczęła się od prostej kontroli: istniejący kod zakodował adres URL kawiarni, który chcieli zachować. Wyzwaniem było sprawienie, aby QR poczuł się raczej częścią doświadczenia w kawiarni, niż po przemyśleniu użyteczności od 2020 r.',
      ],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Wytrzymały kod QR w plastikowym stojaku z widocznym zużyciem, odciskami palców i wyblakłym nadrukiem',
          caption:
            'Punkt wyjścia: trzy lata kontrobsługi pozostawiły oryginalny QR ledwo funkcjonalny',
        },
      ],
    },
    {
      heading: 'Diagnozowanie problemów oryginalnego kodu',
      paragraphs: [
        'Badanie wykazało wiele problemów: użyto oryginalnego kodu korekty błędu L (minimum redundancy), miał cichą strefę tylko 2 moduły, i został wydrukowany w niskiej rozdzielczości. Pod ciepłym oświetleniem wolframu, już wyblakłe czarne moduły ledwo kontrastowały z żółtym papierze. Starsze telefony zmagały się; nowsze telefony odniosły sukces, ale z zauważalnym opóźnieniem.',
        'Oprócz problemów technicznych, ogólny czarny i biały kwadrat nie powiedział nic o marce. Klienci zawahali się przed skanowaniem - subtelna bariera zaufania, która zmniejszyła zaangażowanie w starannie zaprojektowane cyfrowe menu kawiarni.',
      ],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Nakładka diagnostyczna ukazująca wady techniczne pierwotnego QR: niska ECC, minimalna strefa ciszy, słaby kontrast',
          caption:
            'Analiza techniczna ukazująca, dlaczego dotychczasowy kod jest niedopracowany w warunkach realnych',
        },
      ],
    },
    {
      heading: 'Proces uaktualniania',
      paragraphs: [
        'Korzystając z ANQR, właściciel kawiarni odtworzył kod z identycznym adresem URL menu, ale znacznie poprawił ustawienia: Korekta błędu H dla maksymalnej odporności, 6-modułowa cicha strefa dla niezawodnego wykrywania granic, i kolory marki (głębokie burgundowe moduły na tle kremu), które pasują do palety wnętrza kawiarni.',
        'Dodano małe środkowe nakładki z logo kawiarni - celowo zachowane subtelnie w celu utrzymania możliwości skanowania przy jednoczesnym zapewnieniu natychmiastowego rozpoznawania marki. Tryb bezpieczeństwa potwierdził nową konstrukcję skanowaną niezawodnie na wszystkich urządzeniach testowych przed jakimkolwiek nadrukiem.',
      ],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Interfejs ANQR pokazujący konfigurację: kolory marki, odpowiednie ECC, hojna strefa ciszy, subtelne narzucenie logo',
          caption:
            'Budowa zmodernizowanej konfiguracji: każde ustawienie wybrane do zrównoważenia ekspresji marki z niezawodnością skanowania',
        },
      ],
    },
    {
      heading: 'Wymierne wyniki',
      paragraphs: [
        'Po wdrożeniu nowego modułu QR na profesjonalnym kartonie laminowanym matowo kawiarnia monitorowała wyniki przez cztery tygodnie. Wskaźnik powodzenia skanowania wzrósł z szacunkowych 70% do prawie 100%. Średni czas skanowania spadł z 3-4 sekund do poniżej 1 sekundy. Co najważniejsze, zaangażowanie menu wzrosło o 40% – klienci, którzy wcześniej spojrzeli na kod QR i poddali się, teraz skanowali pewnie.',
        'Pracownicy zgłosili mniej pytań o "jak korzystać z QR" i nie ma więcej przypadków ręcznego wpisywania URL dla sfrustrowanych klientów. Znakowy wygląd wywołał również rozmowy, z klientami komentując pozytywnie na spójny projekt.',
      ],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A przed / po porównaniu z miernikami: wskaźnik sukcesu skanowania, średni czas skanowania, i cotygodniowa liczba wyników skanowania',
          caption:
            'Cztery tygodnie danych pokazujących wymierny wpływ przemyślanego podniesienia QR',
        },
      ],
    },
    {
      heading: 'Powtórz tę konfigurację',
      paragraphs: [
        'Konfiguracja kawiarni pokazuje konserwatywną, ale skuteczną markę: Korekta błędu H, 6-moduł cicha strefa, wysokiej kontrastu kolorów marki i minimalne środkowe nakładki. Ten bilans działa dla większości zastosowań liczników detalicznych, gdzie niezawodność musi być na pierwszym miejscu, ale obecność marki nadal ma znaczenie.',
        'Otworzyć generator z tymi ustawieniami wstępnie załadowanymi i dostosować kolory i nakładać na własną markę. Kluczowy wgląd: sama poprawa niezawodności może znacznie zwiększyć zaangażowanie, nawet przed dodaniem wizualnej stylizacji.',
        'Należy zapoznać się z odnośnym przewodnikiem naukowym dotyczącym poprawy istniejących kampanii QR w celu uzyskania pełnej metodologii leżącej u podstaw tego podejścia.',
      ],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link do generatora wstępnie skonfigurowanego z ustawieniami kawiarni do natychmiastowego dostosowania',
          caption: 'Zacznij od sprawdzonej konfiguracji i dostosuj swoją markę',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Przeglądaj Nauka artykułów',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Badanie przypadku: wielopłatnościowy wyświetlacz licznika',
      paragraphs: [
        'Przykład ten następuje po butikowym sklepie odzieżowym, który zgromadził pięć różnych kodów QR w ich rejestrze: płatności bankowe, wskazówki, Instagram, Google recenzje i link do wynajmu. Każdy z nich został wygenerowany z innego źródła, wydrukowany w różnych czasach i wyświetlony na niepasujących stoiskach. Wizualny chaos podważał starannie leczoną estetykę sklepu, a personel regularnie zajmował się klientami skanującymi zły kod.',
        'Rozwiązanie wymagało oddzielenia obaw: kody płatności wymagały maksymalnej niezawodności z konserwatywnego stylizacji, podczas gdy kody marketingowe mogą być bardziej wyraziste. Jednolity system wyświetlania pokazuje, jak zrównoważyć obecność marki z wymogami funkcjonalnymi różnych przypadków zastosowania QR.',
      ],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Zatłoczony obszar ewidencyjny z pięciu niedopasowanych kodów QR na różnych stoiskach i materiałach drukowanych',
          caption:
            'Chaotyczny punkt wyjścia: pięć odłączonych kodów QR konkurujących o uwagę i powodujących dezorientację klientów',
        },
      ],
    },
    {
      heading: 'Priorytetowe traktowanie Doświadczenia Płatności',
      paragraphs: [
        'Metoda płatności podstawowej w sklepie zastosowała normę regionalną, która wymagała ścisłej zgodności z wymaganiami dotyczącymi ładunku użytecznego. Badania wykazały, że nawet niewielka stylizacja wpływa na szybkość skanowania z niektórych aplikacji bankowych. Decyzja: zachować płatności QR całkowicie niezmienione, z wyjątkiem optymalizacji wielkości i profesjonalnego drukowania na matowe karty.',
        'To konserwatywne podejście oznaczało, że kod płatności wyglądał mniej "markowy" niż idealny, ale wskaźniki realizacji transakcji dramatycznie się poprawiły. Zrozumienie: momenty płatności nie oznaczają możliwości - są momentami niezawodności. Klienci doceniają szybkość i pewność nad estetyką, gdy chodzi o pieniądze.',
      ],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Czysty, duży kod QR płatności na profesjonalnych matowe karty akcji, umieszczone wybitnie w rejestrze',
          caption:
            'Płatność QR: wielkość hojnie, drukowane profesjonalnie, stylizowane konserwatywnie do natychmiastowego rozpoznania przez aplikacje bankowe',
        },
      ],
    },
    {
      heading: 'Tworzenie wtórnego wyświetlacza akcji',
      paragraphs: [
        'Na porady, opinie, społeczne i zatrudnienie, sklep może być bardziej wyrazisty. Kody te zostały zregenerowane w ANQR ze spójną marką stylizacji: charakterystyka sklepu oliwkowego na kremie, zaokrąglony styl modułu i subtelne środkowe nakładki z ikoną sklepu. Korekta błędu H zapewnił niezawodność nawet przy stylizacji.',
        'Te cztery kody zostały ułożone w markowym panelu umieszczonym obok (nie konkurując z) kodu płatności. Czyste etykiety w typografii sklepu wyjaśniają cel każdego kodu. Hierarchia wizualna była celowa: płatności były samotne i widoczne; działania drugorzędne zgrupowane jako opcje.',
      ],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Panel markowy z czterema stylowanymi kodami QR na porady, opinie, społeczne i wynajem, z jasnymi etykietami',
          caption:
            'Drugi panel działania: konsekwentna marka, jasne oznakowanie, umieszczone jako opcje, a nie rozpraszania',
        },
      ],
    },
    {
      heading: 'Wyświetl projekt systemu',
      paragraphs: [
        'Fizyczny wyświetlacz rozwiązał jednocześnie kilka problemów. Zarówno stojak płatniczy, jak i panel wtórny wykorzystywały matowe materiały do eliminowania oślepiania z napowietrznych oświetlenia. Wzgórza zostały zoptymalizowane dla klientów o różnym statusie. Kąty skierowane w kierunku kolejki klienta, a nie płaskie na ladzie.',
        'Krytycznie, sklep stworzył zapasowe odciski z zablokowanych linków konfiguracyjnych ANQR. Kiedy kod napiwków ostatecznie dostał kawy-splashed, personel zastąpił go w ciągu kilku minut przy użyciu zapisanej konfiguracji - bez zrzutów ekranu, bez zgadywania w ustawieniach, bez degradacji jakości.',
      ],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Schemat pokazujący fizyczny układ wyświetlacza: wysokości, kąty, materiały oraz związek między płatnością a wyświetlaczami wtórnymi',
          caption:
            'Schemat systemu wyświetlacza: ergonomia fizyczna zoptymalizowana do niezawodnego skanowania wysokości klienta i warunków oświetlenia',
        },
      ],
    },
    {
      heading: 'Ulepszenia operacyjne',
      paragraphs: [
        'Sześć tygodni po wdrożeniu, sklep udokumentował znaczne ulepszenia: zero skarg klientów na "błędne kody" zamieszanie, szybszy czas transakcji, a 3x wzrost zgłoszeń napiwków (klienci mogli teraz znaleźć i skanować kod napiwków bez niezręcznego pytania personelu). Przeglądy Google również wzrosła jako dedykowany, dobrze oznaczone QR usunięte tarcie.',
        "Szkolenie personelu stało się prostsze: 'Kod płatności jest duży, wszystko inne jest na panelu.' Kiedy uaktualnione aplikacje płatnicze i jeden krótko pokazał wolniejsze skanowanie, konserwatywny projekt kodu płatności oznaczało, że nadal działa - tylko nieznacznie wolniej niż całkowicie.",
        'Patrz przewodnik Naucz się o kodach QR dla płatności detalicznych dla zasad związanych z tym systemem wyświetlania.',
      ],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Deska rozdzielcza miernicza pokazująca przed / po porównaniach: przypadki dezorientacji, czas transakcji, częstotliwość końcówek, wnioski z przeglądu',
          caption:
            'Sześć tygodni danych operacyjnych pokazujących wpływ biznesowy przemyślanego systemu wyświetlacza multiQR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Przeglądaj Nauka artykułów',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Badanie przypadku: Od wizytówki do Billboard',
      paragraphs: [
        'Przyk ³ ad ten nawiązuje do firmy produkującej imprezy przygotowującej siê do wielkiej konferencji. Potrzebowali tego samego kodu QR - łączącego się z aplikacją eventową - rozmieszczoną w radykalnie różnych formatach: wkładki z odznaką (3cm), kartki namiotowe (8cm), znak rejestracyjny (30cm), plakaty (60cm) oraz masywny baner sceny (4 metry). Każdy format miał różne odległości oglądania, warunki oświetleniowe i przepływy produkcyjne.',
        'Wyzwanie było nie tylko techniczne, ale i operacyjne. Wielu sprzedawców zajmowało się różnymi zadaniami drukarskimi, a firma musiała zapewnić spójne, skalowalne wyniki niezależnie od tego, kto co wyprodukował. Ich rozwiązanie koncentrowało się na eksporcie SVG i rygorystycznej dokumentacji przekazania.',
      ],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kolaż przedstawiający ten sam kod QR stosowany w pięciu różnych rozmiarach, od odznaki do banera',
          caption:
            'Jeden kod QR, pięć rozmiarach wdrożeniowych: wyzwanie utrzymania możliwości przewijania od centymetrów do metrów',
        },
      ],
    },
    {
      heading: 'Dlaczego poprzednie zdarzenia miały problemy',
      paragraphs: [
        'Na ostatniej konferencji firma doświadczyła żenujących porażek. Scena baner QR został wygenerowany jako mały PNG i skalowane w projektowym oprogramowania - wynik wyglądał akceptowalny z odległości, ale nie udało się wiarygodnie skanować z widowni. Odznaka QR były nadmiernie stylizowane i zbyt małe, frustrujące uczestników próbuje dodać kontakty. Niespójne ustawienia w różnych formatach oznaczały, że "ten sam" QR rzeczywiście wyglądał inaczej na każdym kawałku.',
        'Analiza post-event ujawniła przyczynę: brak jednego źródła prawdy. Każdy projektant odtworzył QR z nieco różnymi ustawieniami, a każdy sprzedawca druków inaczej przetwarzał pliki. Jakość zdegradowana przez telefoniczną grę przekazywania plików.',
      ],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Zbliżenie zdjęć pokazujących niepowodzenia skanowania: pikselowane moduły bannerów, niewymiarowe kody odznaki, niespójne stylizacja różnych formatów',
          caption:
            'Analiza sądowa poprzednich awarii: każdy format wprowadził różne problemy jakościowe',
        },
      ],
    },
    {
      heading: 'SVG- First Workflow',
      paragraphs: [
        'Dla tego wydarzenia firma ustanowiła rygorystyczny protokół: jeden mistrz QR generowany w ANQR z optymalnymi ustawieniami (Korekta błędów H, hojna strefa ciszy, czyste stylizacja), eksportowany jako SVG, i przechowywany jako jedno źródło autorytatywne. Link konfiguracyjny ANQR został udokumentowany obok pliku SVG, dzięki czemu kod mógł zostać zregenerowany w razie potrzeby.',
        'Każdy projektant i sprzedawca otrzymał tego samego mistrza SVG z wyraźnymi instrukcjami: umieścić w wymaganym rozmiarze, nie modyfikować, utrzymać cichy prześwit strefy. Dla sprzedawców wymagających formatów rastrowych firma dostarczyła wstępnie wykonane PNG w określonych rozmiarach z wyraźnymi konwencjami nazewnictwa wskazującymi zamierzone zastosowanie.',
      ],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Pakiet plików pokazujący master SVG, specyficzne dla danej wielkości PNG, dokument specyfikacji i link konfiguracyjny',
          caption:
            'Pakiet przekazania: wszystko, co sprzedawcy potrzebowali do uzyskania konsekwentnych wyników bez zgadywania',
        },
      ],
    },
    {
      heading: 'Uwagi szczegółowe',
      paragraphs: [
        'Każdy format wymaga szczególnej uwagi. Odznaki o wymiarach 3cm potrzebowały QR do zajmowania maksymalnej dostępnej przestrzeni - odległość skanowania byłaby długością ramienia. Namioty stołowe na 8cm mogą obejmować dekoracyjne ramy poza strefą ciszy. Czterometrowy baner wymagał obliczeń: z typowej odległości widowni (15- 20 metrów) moduły musiały być wyraźnie rozróżnialne za pomocą kamer telefonicznych, co oznaczało, że QR musi być co najmniej 80 cm w ramach projektu banera.',
        'Firma stworzyła przewodnik po rozmiarach dokumentujący minimalne wymiary QR dla każdej oczekiwanej odległości skanowania. Stało się to zasobem nadającym się do ponownego wykorzystania w przyszłych wydarzeniach, eliminując domysły z procesu projektowania.',
      ],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Schemat pokazujący zależność między odległością skanowania, minimalnym rozmiarem QR i wymiarami modułów dla każdego formatu zdarzenia',
          caption:
            'Matryca wielkości: obliczone wymiary zapewniające niezawodne skanowanie przy oczekiwanej odległości widzenia każdego formatu',
        },
      ],
    },
    {
      heading: 'Wyniki produkcji',
      paragraphs: [
        'Potwierdzenie dnia konferencji było systematyczne: personel testował każdy rozmieszczony QR przed otwarciem drzwi. Odznaki zeskanowane natychmiast na długości ramienia. Namioty stołowe działały niezawodnie w zmiennym oświetleniu pomieszczeń typu breakout. Baner sceniczny - zakłopotanie poprzedniego wydarzenia - został z powodzeniem zeskanowany ze środka widowni.',
        'Zero skarg na skanowanie zostało zalogowanych w 2000 + uczestników. Wygrana operacyjna była równie istotna: gdy ostatni sponsor wymagał nowego oznaczenia, zespół produkcyjny wygenerował go z mistrza SVG w minutach, pewny, że będzie pasował do wszystkiego innego.',
        'Zobacz przewodnik Naucz się na temat kodów QR gotowych do wydruku dla ram decyzji SVG vs PNG i przekazać najlepsze praktyki.',
      ],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografie pokazujące uczestników z powodzeniem skanowanie kodów QR w różnych rozmiarach i odległościach w całym obiekcie',
          caption:
            'Sukces dnia konferencji: niezawodne skanowanie w każdym formacie, od bliskości odznaki do sceny baner odległości zdjęć',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Przeglądaj Nauka artykułów',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Studium przypadku: Airport Lounge Digital Digital Digital Display',
      paragraphs: [
        'Przykład ten znajduje się w loży lotniczej, w której na swoich cyfrowych ekranach powitalnych stosowano statyczne kody QR. Ekrany wyświetlane rotacyjne treści promocyjne, ale kod QR dla zameldowania w salonie siedział w rogu, statyczne i łatwo przeoczone. Analiza wykazała, że tylko 15% kwalifikujących się gości korzystało z QR check- in pomimo, że jest ona szybsza niż kolejka biurkowa. Większość gości po prostu tego nie zauważyła.',
        'Hipoteza była prosta: w środowisku wizualnie zajętym z ruchomą zawartością statyczny QR staje się niewidzialny. Rozwiązanie potrzebne do uczynienia QR zauważalnym bez narażania niezawodności wymaganej dla kontroli przepływu, gdzie niepowodzenie oznaczałoby sfrustrowane podróżnych i dłuższe kolejki biurkowe.',
      ],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Cyfrowy wyświetlacz w salonie lotniska pokazujący treści promocyjne z małym, statycznym kodem QR w rogu',
          caption:
            'Oryginalny zestaw: statyczny QR zagubiony w morzu dynamicznych treści promocyjnych, osiągając tylko 15% adopcję',
        },
      ],
    },
    {
      heading: 'Projektowanie bezpiecznej animacji',
      paragraphs: [
        'Digital signage w salonie wykorzystał duże panele LED - trudne środowisko, w którym agresywna animacja może spowodować problemy ze skanowaniem. Zespół projektowy rozpoczął zachowawczo: delikatny efekt pulsu, który subtelnie rozszerzył i zakontraktował wizualną obecność QR bez modyfikacji rzeczywistej struktury kodu. Czas ramki został ustawiony powoli (250ms), aby uniknąć problemów migotania z szybkością odświeżania LED.',
        'Potwierdzenie trybu bezpieczeństwa potwierdziło, że każda rama pozostała nieusuwalna. Dodatkowe badania na rzeczywistych panelach LED wykazały, że impuls musi być jeszcze bardziej subtelny niż sugerowano na pulpicie - jasność LED i kąty widzenia wpłynęły postrzegane kontrast więcej niż oczekiwano.',
      ],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Panel ustawień animacji ANQR pokazujący konfigurację pulsu: powolny czas, subtelne natężenie, tryb bezpieczeństwa włączony',
          caption:
            'Konfiguracja animacji: parametry dostrojone do wyświetlacza panelu LED przy zachowaniu niezawodności skanowania w każdej ramie',
        },
      ],
    },
    {
      heading: 'Integracja z treścią sygnału',
      paragraphs: [
        'Animowany QR został umieszczony w specjalnej "stabilnej strefie" układu ekranu - obszarze, który pozostał stały, podczas gdy treści promocyjne obracały się w głównym obszarze wyświetlacza. Separacja ta miała kluczowe znaczenie: QR potrzebował stabilności wizualnej do skanowania nawet przy jednoczesnym przyciąganiu uwagi poprzez subtelną animację.',
        "W pobliżu QR dodano wyraźne wezwanie do działania: 'Pomiń kolejkę - skanuj, aby sprawdzić.' Tekst pozostał statyczny, podczas gdy QR pulsował, tworząc hierarchię wizualną, która przyciągnęła uwagę do możliwości skanowania bez przytłaczania treści promocyjnych.",
      ],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Schemat układu ekranu pokazujący animowany QR w stabilnej strefie, podczas gdy zawartość promocyjna obraca się w głównym obszarze',
          caption:
            'Alokacja nieruchomości ekranowych: animowane QR zajmuje stabilną strefę oddzielną od rotacyjnych treści promocyjnych',
        },
      ],
    },
    {
      heading: 'Wdrożenie techniczne',
      paragraphs: [
        'Animowany QR był eksportowany jako GIF z optymalnymi ustawieniami dla sygnalizacji CMS. Rozmiar pliku miał znaczenie - system zarządzania treścią w salonie miał limity wysyłania, a zbyt duże pliki powodowały jąkanie odtwarzania. Ostateczny eksport zbilansował jakość obrazu z wielkością pliku poprzez ograniczenie palety kolorów i optymalizację liczby ramek.',
        'Wdrożenie obejmowało awarię: jeśli GIF nie zagra z jakiegoś powodu, system sygnalizacji wyświetliłby statyczną kopię zapasową PNG. Ta redundancja zapewniła, że zdolność check- in nigdy nie została utracona z powodu problemów technicznych z animacją.',
      ],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Interfejs CMS pokazujący animowane przesyłanie QR z konfigurowanym statycznym obrazem',
          caption:
            'Konfiguracja sygnatur CMS: animowane podstawowe z statycznym zwrotem zapewniającym możliwość zameldowania nigdy nie jest przerywane',
        },
      ],
    },
    {
      heading: 'Zmierzone uderzenie',
      paragraphs: [
        'Po upływie jednego miesiąca od rozpoczęcia leczenia, kontrola QR w trakcie przyjmowania zwiększyła się z 15% do 24% - względna poprawa wynosiła 60%. Badania opinii gości wykazały, że animowany QR był "łatwiej zauważyć" i "czuł się bardziej nowoczesny". Czas w kolejce biurkowej uległ znacznemu zmniejszeniu w okresach szczytu, ponieważ więcej gości samodzielnie obsługiwało QR.',
        'Co ważne, pomimo tysięcy codziennych skanów nie zgłoszono żadnych awarii skanowania. Konserwatywne podejście animacji udało się osiągnąć cel uwagi bez poświęcania niezawodności check- in wymagane. Lounge następnie wywinął podobne animowane QR do innych miejsc.',
        'Zobacz Przewodnik Naucz się animowanych kodów QR dla cyfrowego oznakowania dla zasad technicznych za bezpiecznym projektowaniem animacji.',
      ],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Deska rozdzielcza pokazująca wzrost współczynnika adopcji, redukcję czasu kolejki i niezawodność skanowania zerowego w okresie wdrażania',
          caption:
            'Jeden miesiąc danych: 60% wzrost adopcji, skrócenie czasu trwania kolejki i utrzymanie doskonałej niezawodności skanowania',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Przeglądaj Nauka artykułów',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Badanie przypadku: Globalna kampania inauguracji produktu QR',
      paragraphs: [
        'Przykład ten jest następstwem wprowadzenia przez firmę zajmującą się elektroniką konsumencką nowego produktu na 12 rynkach w 8 językach. Każdy regionalny zespół marketingowy musiał produkować opakowania, wyświetlacze detaliczne i materiały promocyjne zawierające kody QR łączące się z lokalnymi stronami produktu. Poprzednie starty doprowadziły do niespójnego stylu QR, sporadycznych niepowodzeń skanowania, i "gra telefoniczna" dryfu konfiguracji, jak każdy zespół odtworzył kody z zrzutów ekranu.',
        'Rozwiązanie wykorzystało udostępniane łącza konfiguracyjne ANQR w celu ustanowienia jednego źródła prawdy, do którego miał dostęp każdy zespół regionalny, niezależnie od języka interfejsu. Ładunek QR wykorzystywał inteligentne przekierowanie, które wykrywało język użytkownika, więc jeden kod działał globalnie, dostarczając zlokalizowane doświadczenia.',
      ],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Mapa świata pokazująca 12 lokalizacji rynkowych z kodami QR, niektóre wizualnie niespójne ze sobą',
          caption:
            'Wyzwanie: 12 rynków, 8 języków oraz historia niespójnych wdrożeń QR w różnych regionach',
        },
      ],
    },
    {
      heading: 'Ustanowienie konfiguracji głównej',
      paragraphs: [
        'Globalny zespół marki stworzył autorytatywną konfigurację QR w ANQR: kolory marki pasujące do wizualnej tożsamości linii produktu, korekcja błędów H pod względem niezawodności we wszystkich zastosowaniach drukowanych i cyfrowych oraz stylizacja, która będzie się stale rozmnażać niezależnie od lokalnych metod produkcji. Konfiguracja została zablokowana i link do akcji udokumentowany w globalnej kampanii.',
        'Co najważniejsze, zakodowany adres URL korzystał z usługi przekierowania wykrywającej język. Po zeskanowaniu użytkownicy byli automatycznie kierowani na stronę produktu w języku lokalnym. Oznaczało to, że na wszystkich 12 rynkach można było używać identycznych kodów QR – bez różnic w ładunku w zależności od rynku, które mogłyby powodować błędy.',
      ],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Interfejs ANQR pokazujący główną konfigurację z kolorami markowymi, ECC H i inteligentnym przekierowaniem URL',
          caption:
            'Główna konfiguracja: globalne standardy marki zakodowane w jednym, wspólnym źródle prawdy',
        },
      ],
    },
    {
      heading: 'Regionalny przepływ pracy zespołu',
      paragraphs: [
        'Każdy zespół marketingu regionalnego otrzymał link konfiguracyjny z prostą instrukcją: otworzyć link, sprawdzić podgląd pasuje do wytycznych marki, eksportować w wymaganym formacie aplikacji. Interfejs ANQR wyświetlany w preferowanym języku każdego zespołu, ale podstawowe ustawienia QR pozostały identyczne niezależnie od języka interfejsu.',
        'Kiedy japoński zespół potrzebował SVG do wysokiej klasy wyświetlaczy detalicznych, a brazylijski zespół potrzebował PNG do mediów społecznościowych, oba eksportowane z tej samej konfiguracji. Kiedy niemiecki sprzedawca druków zażądał konkretnych wartości kolorów, mogli oni odnieść się do konfiguracji bezpośrednio zamiast zgadywać z zrzutu ekranu.',
      ],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Zrzut ekranu pokazujący ten sam link konfiguracyjny otwarty w japońskich, portugalskich i niemieckich interfejsach',
          caption:
            'Ta sama konfiguracja, różne interfejsy: zespoły regionalne pracują w preferowanym języku przy zachowaniu globalnej spójności',
        },
      ],
    },
    {
      heading: 'Obsługa zmian regionalnych',
      paragraphs: [
        'Niektóre rynki wymagały drobnych dostosowań. Chiński zespół potrzebował wersji z ramką zoptymalizowaną pod kątem WeChat do udostępniania w mediach społecznościowych. Zamiast modyfikować plik główny, utworzyli udokumentowany wariant z własnym łączem konfiguracyjnym, wyraźnie oznaczony jako "wariant CN-WeChat" w bibliotece zasobów kampanii. Pozwoliło to zachować identyfikowalność, a jednocześnie umożliwiło niezbędną lokalizację.',
        "Zespół marki ustanowił prostą zasadę: każda zmiana od master wymaga nowego, udokumentowanego łącza konfiguracyjnego. Żadnych modyfikacji w eksportowanych plikach, żadnych 'szybkich poprawek' w oprogramowaniu projektowym. To zapobiegło dryfowi konfiguracji, który nękał poprzednie starty.",
      ],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Interfejs biblioteki aktywów pokazujący konfigurację nadrzędną i zatwierdzone warianty regionalne, każdy z własnym linkiem',
          caption:
            'Zarządzanie aktywami w ramach kampanii: konfiguracja nadrzędna plus udokumentowane warianty, wszystkie możliwe do wyśledzenia za pomocą linków konfiguracyjnych',
        },
      ],
    },
    {
      heading: 'Wyniki uruchomienia',
      paragraphs: [
        'W dniu uruchomienia produktu kody QR stosowane na opakowaniach, wyświetlaczach detalicznych, materiałach imprezowych i kampaniach cyfrowych na wszystkich 12 rynkach jednocześnie. Audyty jakości potwierdziły spójność wizualną w różnych regionach - QR na wyświetlaczach detalicznych w Tokio odpowiadały QR na opakowaniu w São Paulo odpowiadającym QR na banerów wydarzeń w Berlinie.',
        'Na rynkach odnotowano zerową awarię skanowania. Gdy po uruchomieniu strony produktu była konieczna zmiana URL, usługa przekierowana obsługiwała ją niewidocznie - nie wymaga ponownego drukowania. Globalny zespół oszacował, że podejście łączące konfigurację zaoszczędziło 40 + godzin czasu koordynacji w porównaniu z poprzednią metodologią uruchomienia.',
        'Zobacz przewodnik Naucz się na temat współpracy międzyjęzycznej QR dla zasad przepływu pracy stojących za globalną konsekwencją kampanii.',
      ],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Sieć zdjęć pokazująca spójne wdrażanie QR na różnych rynkach: Tokyo retail, Sao Paulo pakowanie, Berlin imprezy',
          caption:
            'Osiągnięta globalna spójność: identyczna prezentacja QR na 12 rynkach pomimo różnych języków, dostawców i formatów',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Przeglądaj Nauka artykułów',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Przeglądaj Nauka artykułów', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otwórz pełny przewodnik użytkownika', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otwórz galerię', type: 'gallery' },
  ],
};
