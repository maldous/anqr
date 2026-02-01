import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Naucz się z ANQR',
  description: 'Praktyczne, nowatorskie w biznesie przewodniki umożliwiające zamianę kodów QR w prawdziwe aktywa marketingowe – a nie tylko funkcjonalne kwadraty. Dowiedz się, jak aktualizować starsze kody w punktach sprzedaży, tworzyć zgodne oznakowania QR dotyczące płatności, przygotowywać eksporty gotowe do druku, bezpiecznie używać animacji na wyświetlaczach cyfrowych i udostępniać zablokowane konfiguracje wielojęzycznym zespołom za pomocą łączy ANQR ("kotwicowych").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otwórz generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Zobacz przykłady QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otwórz pełny przewodnik użytkownika', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Poprawa istniejących kampanii QR',
      paragraphs: ['Większość firm posiada kody QR rozproszone po swoich operacjach - na menu, stoiskach, opakowaniach i materiałach promocyjnych. Wiele z tych kodów stworzono lata temu z podstawowymi generatorami, co doprowadziło do powstania ogólnych czarnych i białych kwadratów, które nie wzbudzają zaufania lub nie pasują do tożsamości marki. Ten kompleksowy przewodnik prowadzi Cię przez systematyczne podejście do audytu, modernizacji i optymalizacji istniejącej infrastruktury QR bez zakłócania podróży klientów już ustalone.', 'Strategiczną zaletą modernizacji zamiast zastępowania kodów QR jest zachowanie ciągłości. Twoi klienci nauczyli się już oczekiwać pewnych miejsc docelowych, kiedy skanują kody. Utrzymanie kodowanych adresów URL identycznych przy jednoczesnej znaczącej poprawie prezentacji wizualnej, niezawodności skanowania i dopasowania marki powoduje bezproblemowe przejście, które zwiększa zaufanie bez konieczności wprowadzania jakichkolwiek zmian do infrastruktury cyfrowej lub śledzenia analityki.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Porównania boczne ukazujące wyblakły, ogólny kod QR obok nowoczesnej markowej wersji kodującej ten sam adres URL',
          caption: 'Przed i po: Ten sam adres docelowy przekształcony z datowanego kodu rodzajowego w profesjonalny składnik aktywów markowych',
        },
      ],
    },
    {
      heading: 'Why Legacy QR Codes Underperformance',
      paragraphs: ['W kodach QR tworzonych na wczesnym etapie wdrażania – szczególnie w latach 2020–2021, kiedy firmy spieszyły się z wdrażaniem rozwiązań zbliżeniowych – często występuje kilka krytycznych problemów. Niskie ustawienia korekcji błędów sprawiają, że są one delikatne podczas drukowania na teksturowanych powierzchniach lub oglądania w trudnym oświetleniu. Niewystarczające ciche strefy powodują awarie skanowania, gdy kody są umieszczone w pobliżu innych elementów wizualnych. Ogólny styl nie przekazuje wiarygodności marki, co prowadzi do wahań i zmniejszenia częstotliwości skanowania.', 'Poza ograniczeniami technicznymi istniejące kodeksy często stanowią niewykorzystane możliwości marki. Każdy kod QR jest punktem dotykowym dla klienta - moment, w którym są aktywnie zaangażowani i gotowi podjąć działania. Profesjonalny kod, który pasuje do kolorów marki, zawiera odpowiednie marginesy bezpieczeństwa i oferuje opcjonalne markowe elementy przekształcają tę użyteczność w składnik marketingowy, który wzmacnia Twoją tożsamość przy każdej interakcji.'],
    },
    {
      heading: 'Prowadzenie audytu kodu QR',
      paragraphs: ['Rozpocznij swój projekt aktualizacji poprzez stworzenie kompleksowego spisu każdego kodu QR obecnie stosowane w całej Twojej firmie. Dokumentuj położenie fizyczne, zakodowane miejsce przeznaczenia, aktualny stan materiału drukowanego oraz typowe środowisko skanujące, w tym warunki oświetlenia i kąty widzenia. Sprawdź każdy kod z wielu urządzeń - starszych smartfonów i urządzeń budżetowych często ujawniają problemy niezawodności, że maski telefonów premium.', 'Należy zwrócić szczególną uwagę na kody w lokalizacjach o wysokich stawkach: punkty płatności, check- in obszarów i wyświetlacze promocyjne, gdzie skanowanie niepowodzenia bezpośrednio wpływa na przychody lub doświadczenie klienta. Należy je traktować priorytetowo w odniesieniu do natychmiastowej aktualizacji. Również kody nut, które pojawiają się w treści fotografii lub wideo, ponieważ będą one wymagać koordynacji z zespołem marketingowym w celu aktualizacji wizualnych aktywów.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Interfejs listy kontrolnej pokazujący kategorie audytu QR: położenie, stan, niezawodność skanowania i ocenę priorytetową',
          caption: 'Systematyczny szablon audytu QR do dokumentowania i priorytetowania kandydatów do aktualizacji',
        },
      ],
    },
    {
      heading: 'Bezpieczna strategia modernizacji',
      paragraphs: ['Podstawową zasadą aktualizacji QR jest zachowanie miejsca docelowego. Wyodrębnij dokładny adres URL z każdego istniejącego kodu i zakoduj go identycznie w nowej wersji. Dzięki temu wszystkie istniejące analizy, logika przekierowań i oczekiwania klientów pozostaną nienaruszone. Jeśli potrzebujesz elastyczności miejsca docelowego dla przyszłych aktualizacji, jest to idealny moment na wprowadzenie markowego krótkiego adresu URL lub usługi przekierowania – ale zaimplementuj to jako osobny projekt, aby uniknąć łączenia zmian.', 'Dla wizualnej aktualizacji, zastosować ulepszenia warstw: najpierw zapewnić niezawodność techniczną (odpowiednia korekcja błędów i strefa ciszy), a następnie dodać markę stylizacji (kolory, kształty modułów), a wreszcie rozważyć opcjonalne ulepszenia (nakłady środkowe, ramki). Przed rozpoczęciem badania każda warstwa powinna być potwierdzona. Tryb bezpieczeństwa ANQR pomaga w egzekwowaniu tych priorytetów poprzez ostrzeżenie, kiedy stylizacja wyborów może narazić na szwank.'],
    },
    {
      heading: 'Dodawanie tożsamości marki bez kompromisowej wiarygodności',
      paragraphs: ['Efektywna marka QR równoważy wizualny wpływ na niezawodność skanowania. Zacznij od koloru: zastąpić domyślny czarny pierwszorzędny kolor, zapewniając wystarczający kontrast w tle. Dla większości marek, ciemne kolory na tle światła działają najlepiej. Unikać niskokontrastowych kombinacji, gradientów, które zmniejszają jasność krawędzi, lub kolorów, które wydają się podobne w zwykłych warunkach oświetlenia.', 'Dostosowywanie kształtu modułu oferuje kolejną możliwość markowania o minimalnym wpływie na niezawodność. Zaokrąglone moduły tworzą łagodniejszy, bardziej przystępny wygląd przy jednoczesnym zachowaniu doskonałej możliwości skanowania. Moduły Dot- style działają dobrze dla nowoczesnych, technologicznych marek. Połączone moduły odpowiadają tożsamości przemysłowej lub korporacyjnej. Jakikolwiek styl wybierzesz, zachowaj spójność we wszystkich swoich wdrożeniach QR do natychmiastowego rozpoznawania marki.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Diagram koła barwnego przedstawiający optymalne kombinacje kolorów QR ze wskaźnikami kontrastu',
          caption: 'Przewodnik wyboru kolorów pokazujący kombinacje kontrastu, które utrzymują niezawodność skanowania',
        },
      ],
    },
    {
      heading: 'Protokół badania i walidacji',
      paragraphs: ['Nigdy nie wprowadzaj uaktualnionych kodów QR bez rygorystycznych testów. Wydrukuj fizyczny dowód w tym samym rozmiarze i na tym samym materiale, co ostateczne rozmieszczenie. Badanie w rzeczywistym miejscu, w którym kod będzie żył, o różnych porach dnia w celu uwzględnienia zmian oświetlenia. Użyj co najmniej trzech różnych urządzeń: obecnego telefonu flagowego, urządzenia średniego zasięgu i starszego lub budżetu smartfona.', 'Czas skanowania i wskaźniki sukcesu dla każdego testu. Dobrze zoptymalizowany kod powinien skanować w ciągu 1-2 sekund na każdym stosunkowo nowoczesnym urządzeniu. Jeśli widzisz stałe opóźnienia lub awarie, zmniejszyć intensywność stylizacji - usunąć lub zmniejszyć nakłady, zwiększyć cichy rozmiar strefy, lub przejść do wyższego poziomu korekty błędów. Wiarygodność zawsze ma pierwszeństwo przed wizualną wyrafinowaniem.'],
    },
    {
      heading: 'Blokowanie konfiguracji dla spójności',
      paragraphs: ['Po sprawdzeniu optymalnej konfiguracji zapisz ją, korzystając z łączy ANQR, które można udostępniać. Tworzy to trwały zapis wszystkich ustawień użytych do wygenerowania zatwierdzonego kodu – kolorów, stylu modułu, korekcji błędów, rozmiaru i wszelkich nakładek. Udostępnij ten link swojemu zespołowi projektowemu, dostawcom usług druku i każdemu, kto w przyszłości może potrzebować odtworzyć kod.', 'Ta blokada konfiguracji zapobiega stopniowej degradacji, która plaga wiele wdrożeń QR. Bez niego pracownicy odtwarzają kody ze zrzutów ekranu, projektanci odbudowują ustawienia z pamięci, a sprzedawcy druku dokonują "pomocnych" poprawek. Każda zmiana wprowadza potencjalne problemy. Z zablokowanym linkiem konfiguracyjnym, każda reprodukcja jest identyczna z testowanym, zatwierdzonym oryginałem.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Schemat pokazujący dryf konfiguracyjny: zrzuty ekranu prowadzące do odtworzenia prowadzącej do wariantów, w porównaniu z pojedynczym połączeniem źródła-prawdy',
          caption: 'Zapobieganie dryfowaniu konfiguracji poprzez ustanowienie jednego źródła autorytatywnego dla wszystkich reprodukcji QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Zobacz przykłady QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Kody QR dla płatności detalicznych',
      paragraphs: ['Kody płatności QR działają w najbardziej wymagającym środowisku w handlu detalicznym: momencie transakcji. Klienci są gotowi zapłacić, często z kolejką formującą się za nimi, a każda sekunda opóźnienia powoduje tarcie. Jednak ten moment wysokiego ciśnienia jest również głównym nieruchomości dla wzmocnienia marki. Ten przewodnik wyjaśnia, jak stworzyć kody QR płatności, które skanują natychmiast na aplikacje bankowe, a jednocześnie prezentują profesjonalny, markowy wygląd, który buduje zaufanie klientów.', 'Podstawową zasadą dotyczącą kodów QR do płatności jest niezawodność ponad estetykę. Pięknie zaprojektowany kod, którego nie można zeskanować w aplikacji bankowej jednego klienta, będzie Cię kosztować znacznie więcej w przypadku porzuconych transakcji i sfrustrowanych klientów, niż byłby to kiedykolwiek możliwe w przypadku konserwatywnego projektu. Zacznij od zgodności, dodaj niezawodność, a następnie ostrożnie dodawaj branding tylko tam, gdzie nie zagraża to podstawowej funkcji.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Wyświetlacz licznika detalicznego pokazujący kod QR płatności skanowany przez smartfon z aplikacją bankową',
          caption: 'Kody QR płatności muszą działać natychmiast z aplikacjami bankowymi i portfelowymi w real- world counter warunkach',
        },
      ],
    },
    {
      heading: 'Zrozumienie standardów QR płatności',
      paragraphs: ['Kody QR płatności zazwyczaj są zgodne z normami regionalnymi, które dyktują format ładunku. W Singapurze PayNow QR używa określonego formatowania. W Indiach kody UPI są zgodne ze standardami BharatQR lub UPI. Europejskie płatności SEPA stosują kody QR EPC. Każdy standard istnieje, aby zapewnić aplikacje bankowe mogą natychmiast rozpoznać i przetwarzać informacje o płatnościach. Oddalanie się od tych standardów - nawet nieznacznie - może spowodować odrzucenie przez aplikacje płatnicze kodów, które ogólne skanery kamer odczytują bez problemu.', 'ANQR zawiera szablony dla głównych standardów płatności, które automatycznie formatują dane kupca do zgodnych ładunków. Zawsze używaj tych szablonów zamiast ręcznie konstruować łańcuchy płatności, ponieważ nawet drobne błędy formatowania mogą powodować błędy transakcji. Jeżeli standard płatności w danym regionie nie jest dostępny jako szablon, należy zapoznać się z dokumentacją techniczną dostawcy płatności w celu uzyskania dokładnych wymogów formatowania.'],
    },
    {
      heading: 'Położenie i umiejscowienie do wyświetlania liczników',
      paragraphs: ['Przeciwko-top kody QR stoją przed unikalnymi wyzwaniami fizycznymi. Klienci skanują na długości ramienia, często pod kątem, czasami przez kichnięcie lub gabloty. Oświetlenie na głowie tworzy plamy blasku. Kod konkuruje z innymi kontratakami o uwagę i jasne linie widzenia. Rozmiar płatności QR hojnie - co najmniej 4- 5cm jest zalecane dla większości aplikacji licznika, skalowanie się, jeśli kod siedzi za szkłem lub w słabo oświetlonym obszarze.', 'Position matters as much as size. Umieść kod w miejscu, w którym klienci będą mogli wygodnie trzymać telefon, nie blokując kolejki ani niezręcznie sięgając. Ustaw wyświetlacz pod kątem w stronę klienta, zamiast kłaść go płasko. Jeśli to możliwe, użyj matowego laminowania lub nieodblaskowych materiałów ekspozycyjnych, aby zminimalizować odblaski od oświetlenia górnego. Przetestuj ostateczne umiejscowienie o różnych porach dnia, aby wykryć problemy z oświetleniem.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Schemat pokazujący optymalne wysokości i kąty położenia QR dla różnych konfiguracji licznika',
          caption: 'Przewodnik dla liczników: optymalne wysokości, kąty i odległości dla niezawodnego skanowania płatności',
        },
      ],
    },
    {
      heading: 'Konserwatywna marka dla kodów płatności',
      paragraphs: ['Aplikacje płatnicze są mniej wyrozumiałe niż standardowe skanery aparatów. Wiele aplikacji bankowych korzysta ze starszych, prostszych algorytmów odczytu kodów QR zoptymalizowanych pod kątem szybkości, a nie elastyczności. Oznacza to, że stylizacja, która idealnie współpracuje z aparatem w telefonie, może nie działać w przypadku niektórych aplikacji płatniczych. Zachowaj konserwatywny branding: użyj koloru swojej marki na pierwszym planie, jeśli utrzymuje on silny kontrast, ale unikaj gradientów, ciężkich nakładek lub elementów dekoracyjnych, które mogłyby zakłócać rozpoznawalność.', 'Jeśli chcesz centrum logo lub nakładka, zachować go bardzo małe - nie więcej niż 10- 15% obszaru QR - i przetestować szeroko z każdej aplikacji płatniczej, z której klienci mogą korzystać. Wiele przedsiębiorstw opowiada się za nienakładaniem na poszczególne kody płatności, zastrzegając sobie, że styl wprowadzania do obrotu kodów QR jest mniej rygorystyczny. Zadaniem kodu płatności jest przetwarzanie transakcji, a nie imponowanie wizualnie.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Porównanie wykazujące akceptowalne i ryzykowne poziomy markowe dla kodów QR płatności',
          caption: 'Payment QR branding spectrum: od bezpiecznego stylu konserwatywnego do ryzykownego podejścia dekoracyjnego',
        },
      ],
    },
    {
      heading: 'Materiały i uwagi drukujące',
      paragraphs: ['Fizyczny wyświetlacz ma znaczący wpływ na niezawodność skanowania. Lśniące laminacje odbijają się bezpośrednio w kamerze klienta. Materiały teksturowane mogą zakłócać krawędzie modułów. Tanie drukowanie może zacierać drobne szczegóły. Dla płatności kody QR, inwestować w jakości: użyć matowego lub satynowego laminatu, zapewnić wysokiej rozdzielczości drukowania, i zastąpić wyświetlacze przed pokazaniem zużycia. Podrapany lub wyblakły kod płatniczy kosztuje transakcje.', 'Rozważ trwałość i możliwość wymiany wyświetlacza. Liczne wyświetlacze są dotykane, przenoszone, rozpryskiwane, i okazjonalnie przewracane. Zaprojektuj system wyświetlania tak, aby można było łatwo wymienić wkładkę QR bez wymiany całego stoiska. Utrzymuj zapasowe odciski w gotowości, generowane z zablokowanego łącza konfiguracyjnego, więc zużyte kody mogą być natychmiast zamienione.'],
    },
    {
      heading: 'Testowanie z płatnością realną Aplikacje',
      paragraphs: ['Ogólne skanery aparatów dekodują prawie każdy rozsądnie sformatowany kod QR. Payment apps are pickier. Przed wdrożeniem dowolnego kodu QR płatności przetestuj go w każdej aplikacji płatniczej, z której mogą korzystać Twoi klienci. W środowiskach obsługujących wiele płatności może to oznaczać testowanie z wieloma aplikacjami bankowymi, portfelami cyfrowymi i platformami płatniczymi. Udokumentuj, które aplikacje przetestowałeś i ich wersje — aplikacje płatnicze często się aktualizują, a aktualizacja może zmienić zachowanie skanowania.', 'Badanie w realistycznych warunkach: rzeczywisty wyświetlacz, rzeczywiste oświetlenie, rzeczywista odległość skanowania. Kod, który skanuje natychmiast na biurku może walczyć na liczniku o 17, kiedy popołudniowe słońce tworzy blask. Test z najstarszym, najtańszym smartphone można znaleźć - jeśli działa niezawodnie na urządzeniu budżetowym, będzie działać na wszystko. Zaznacz dowolny czas skanowania w ciągu 2 sekund na badanie i potencjalne przeprojektowanie.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Lista kontrolna pokazująca różne aplikacje do płatności, typy urządzeń i warunki środowiskowe do weryfikacji',
          caption: 'Kompleksowa matryca do testowania QR płatności obejmująca aplikacje, urządzenia i czynniki środowiskowe',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Zobacz przykłady QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Kody QR: SVG vs PNG',
      paragraphs: ['Różnica pomiędzy kodem QR, który skanuje doskonale a kodem, który zawodzi, często sprowadza się do tego, jak został on wywieziony i obsługiwany w procesie druku. Niniejszy przewodnik wyjaśnia krytyczne rozróżnienie między formatami wektorowymi (SVG) i rastrowymi (PNG), kiedy używać każdego z nich oraz jak przekazać grafikę QR projektantom i drukować sprzedawcom w sposób, który zachowuje niezawodność skanowania od kart biznesowych do oznaczeń wielkości billboard.', 'Produkcja druku wprowadza zmienne, które nie istnieją na ekranie: rozprzestrzenianie atramentu, tekstura podłoża, procesy wykończeniowe oraz skumulowany efekt wielu konwersji plików. Kod QR, który wygląda idealnie w Twoim oprogramowaniu projektowym może wyłonić się z drukarki z miękkimi krawędziami, zmniejszonym kontrastem lub subtelnie zniekształconymi modułami. Zrozumienie wyboru formatu i najlepszych praktyk w zakresie przepływu pracy zapobiega tym cichym niepowodzeniom.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Widok powiększony porównujący moduły QR wektorowe z krawędziami chrupiącymi a moduły rastrowe przedstawiające artefakty pikseli',
          caption: 'Vector vs raster w skali druku: różnica precyzji, która określa niezawodność skanowania',
        },
      ],
    },
    {
      heading: 'Dlaczego Vector (SVG) jest preferowany dla drukowania',
      paragraphs: ['Pliki SVG opisują kody QR jako kształty matematyczne, a nie siatki pikseli. Oznacza to, że kod można skalować do dowolnego rozmiaru – od 1 cm etykiety po 10-metrowy baner – bez utraty ostrości krawędzi. Procesor RIP (Raster Image Processor) drukarki renderuje wektory w natywnej rozdzielczości urządzenia wyjściowego, zapewniając, że każda krawędź modułu jest tak wyraźna, jak pozwala na to sprzęt. Nie ma interpolacji, artefaktów antyaliasingu ani nagromadzonego rozmycia spowodowanego wielokrotnymi operacjami zmiany rozmiaru.', 'Oprócz skalowalności pliki SVG są bardziej solidne w profesjonalnym przepływie pracy. Przetrwają okrągłe wycieczki przez oprogramowanie projektowe bez degradacji. Można je skorygować kolorami bez ponownego łączenia. Umieścili je w plikach PDF, aby uzyskać wynik gotowy do użycia. Dla każdej aplikacji drukowanej, w której ma znaczenie jakość, SVG powinien być Twoim domyślnym formatem eksportu.'],
    },
    {
      heading: 'Kiedy PNG jest akceptowalne',
      paragraphs: ['PNG staje się konieczne, gdy Twój przepływ pracy lub platforma docelowa nie obsługuje formatów wektorowych. Niektóre platformy internetowe, systemy sygnalizacji CMS oraz dotychczasowe procesy drukowania wymagają obrazów rastrowych. W takich przypadkach PNG może działać dobrze - ale tylko wtedy, gdy przestrzegasz ścisłych zasad: eksportować w ostatecznym rozmiarze fizycznym i rozdzielczości, nigdy nie skalować po eksporcie, i uniknąć utraty kompresji lub konwersji formatu.', 'Zasadą kluczową dla PNG jest obliczenie wymaganych wymiarów pikseli przed wywozem. Jeśli Twój QR wydrukuje na 5cm, a drukarka działa na 300 DPI, potrzebujesz około 590 pikseli. Eksport w tym rozmiarze lub większym, a następnie skalować w dół w razie potrzeby - nigdy w górę. Dołącz te informacje do nazwy pliku lub metadanych, tak aby przyszli użytkownicy nie przypadkowo nadużywali określonego wielkości eksportu.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Interfejs kalkulatora pokazujący związek między rozmiarem fizycznym, DPI i wymaganymi wymiarami pikseli',
          caption: 'Kalkulator rozdzielczości drukowania: określenie minimalnych wymiarów pikseli dla Twojego docelowego rozmiaru wyjściowego',
        },
      ],
    },
    {
      heading: 'Opcje eksportu ANQR',
      paragraphs: ['ANQR oferuje kilka trybów eksportu SVG do różnych przepływów pracy. Tryb True Vector produkuje czyste, oparte na path wyjście idealne do druku i profesjonalnych narzędzi projektowych. Po dodaniu nakładek rastrowych lub pewnych efektów ANQR może je osadzić przy zachowaniu modułów wektorowych, lub można eksportować w pełni rasteryzowaną wersję w określonej rozdzielczości. Zrozumienie tych opcji pomaga wybrać odpowiedni eksport dla każdego przypadku użycia.', 'Dla eksportu PNG, ANQR pozwala określić dokładne wymiary i zawiera opcje dla przejrzystych środowisk. Ustawienie DPI pomaga obliczyć odpowiednie rozmiary druku, chociaż pamiętaj, że DPI jest metadane - co ważne dla druku jest posiadanie wystarczającej ilości pikseli do fizycznego rozmiaru. Gdy masz wątpliwości, eksportuj większy niż myślisz, że potrzebujesz; skalowanie zachowuje jakość podczas skalowania niszczy go.'],
    },
    {
      heading: 'Przygotowanie plików dla Handoff',
      paragraphs: ['Przy przekazywaniu prac graficznych QR projektantom lub dostawcom druku, zawierają jasne specyfikacje: zamierzony rozmiar fizyczny, minimalne wymagania strefy ciszy oraz wszelkie kwestie dotyczące przestrzeni kolorów. W przypadku zastosowań krytycznych należy podać zarówno master SVG, jak i wysokiej rozdzielczości kopię zapasową PNG, wyraźnie oznaczoną ich przeznaczeniem. Włączyć link konfiguracyjny ANQR, aby kod mógł zostać zregenerowany w razie potrzeby.', 'Przewidywać częste błędy w procesie przekazania. Wyraźnie stwierdza się, że QR nie powinien być skalowany, obracany, przekrzywiany ani wywierać skutków. Określić, że strefa ciszy musi pozostać czysta - brak znaków uprawnych, znaków rejestracyjnych lub elementów konstrukcyjnych, które mogą przeszkadzać. Jeżeli QR zostanie umieszczony na kolorowym lub fotograficznym tle, należy podać wersję o nieprzejrzystym kształcie oparcia, aby zapewnić odpowiedni kontrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Schemat pakietu plików pokazujący master SVG, kopię zapasową PNG, dokument specyfikacji i link konfiguracyjny',
          caption: 'Profesjonalny pakiet przekazania QR: wszystko, czego projektant lub sprzedawca druku potrzebuje do dokładnej reprodukcji',
        },
      ],
    },
    {
      heading: 'Sprawdzanie proofów wydruku',
      paragraphs: ['Nigdy nie zatwierdzaj wydruku bez skanowania fizycznego dowodu. Poprosić o dowód wydrukowany na rzeczywistym podłożu z faktycznym wykończeniem, które będzie stosowane w produkcji. Przeskanuj dowód w warunkach oświetlenia podobnych do tego, gdzie zostanie wyświetlony ostatni element. Test z wielu urządzeń, w tym starszych smartfonów, które mogą zmagać się z marginalną jakością.', 'Jeśli dowód skanuje powoli lub niekonsekwentnie, zbadać przed zatwierdzeniem. Powszechne problemy obejmują niewystarczający kontrast na barwnych podłożach, naruszenie strefy cichej od przycinania, rozmiękczanie atramentu krawędzie modułów, lub laminowanie tworząc blask. Każdy z nich może być adresowany przed zobowiązaniem się do pełnego wydruku - ale tylko wtedy, gdy złapiesz je na etapie dowodowym.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Lista kontrolna przeglądu dowodów z wynikami testów skanowania, pomiarami kontrastu i podpisem zatwierdzenia',
          caption: 'Weryfikacja procesu drukowania: systematyczne badania przed zobowiązaniem się do produkcji',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Zobacz przykłady QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Tworzenie animowanych kodów QR',
      paragraphs: ['Animowane kody QR łączą funkcjonalność standardowych kodów QR z ruchem naocznym, który dramatycznie zwiększa współczynnik zaangażowania. W cyfrowym sygnale, mediach społecznościowych i interaktywnych wyświetlaczach animacja przekształca statyczne narzędzie w przekonujący element wizualny, który przyciągnie wzrok i zachęca do interakcji. Przewodnik ten obejmuje zasady, techniki i praktyczne ograniczenia tworzenia animowanych kodów QR, które skanują niezawodnie przy jednoczesnym wywieraniu wpływu wizualnego.', 'Podstawowym wyzwaniem animowanych kodów QR jest zrównoważenie zainteresowania wizualnego z niezawodnością skanowania. Każda rama musi być indywidualnie skanowana - skaner może uchwycić kod w dowolnym momencie cyklu animacji. To ograniczenie kształtuje każdą decyzję projektową: które elementy mogą się poruszać, jak bardzo mogą się zmieniać i co musi pozostać stabilne w trakcie animacji.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Cyfrowy wyświetlacz sygnalizacji pokazujący animowany kod QR przyciągający uwagę przeglądarki w przestrzeni publicznej',
          caption: 'Animowane kody QR w sygnalizacji cyfrowej: ruch, który przyciąga uwagę i zachęca do skanowania',
        },
      ],
    },
    {
      heading: 'Jak animacja wpływa na skanowalność',
      paragraphs: ['Skanery QR działają na zasadzie przechwytywania pojedynczej klatki i analizowania układu jasnych i ciemnych modułów. Aby animowany kod działał, każda klatka musi zawierać kompletny, prawidłowy wzór QR. Wyklucza to animacje zmieniające strukturę kodu, rozpuszczające moduły lub znacząco zmieniające wzór kontrastu. Moduły przenoszące dane – pozornie losowy wzór pośrodku – muszą przez cały czas zachować stabilność wizualną.', 'Bezpieczne podejście do animacji modyfikuje elementy, które nie posiadają danych: tła, kolory, ramy dekoracyjne i elementy nakładające. Składniki konstrukcyjne - wzory znajdowania (duże kwadraty narożnikowe), wzory rozrządu (linie przemienne) i wzorce osiowania (mniejsze kwadraty w większych kodach) - muszą zachować swoje pozycje i proporcje. Praca w ramach tych ograniczeń nadal pozwala na zaskakująco dynamiczne i angażujące animacje.'],
    },
    {
      heading: 'Techniki animacji Ta praca',
      paragraphs: ['Cykl kolorów animuje kolory pierwszego planu i tła za pomocą palety, zachowując jednocześnie wystarczający kontrast na każdym kroku. Tworzy to żywy, przyciągający uwagę efekt przy minimalnym ryzyku skanowania – pod warunkiem, że kontrast nigdy nie spadnie poniżej czytelnego poziomu. Wstępne ustawienia cyklu kolorów ANQR zostały zaprojektowane tak, aby zachować możliwość skanowania przez cały cykl.', 'Animowane nakładki umieszczają ruchome obrazy za półprzezroczystym wzorem QR. Kod pozostaje stabilny, podczas gdy tło animuje - być może pętla wideo, animowane elementy marki lub abstrakcyjne grafiki ruchu. Technika ta wymaga ostrożnego zarządzania intensywnością, aby zapobiec przytłaczaniu tła wzorca QR, ale tworzy najbardziej wizualnie uderzające wyniki.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Schemat przedstawiający strukturę warstwową animowanego QR: stabilna warstwa kodu nad animowaną warstwą tła',
          caption: 'Zasada warstwowania animacji: wzór QR pozostaje stały, podczas gdy elementy tła animowane poniżej',
        },
      ],
    },
    {
      heading: 'Konfiguracja parametrów animacji',
      paragraphs: ['Szybkość ramki wpływa zarówno na gładkość obrazu, jak i rozmiar pliku. Dla większości zastosowań, 10- 15 klatek na sekundę zapewnia ruch smooth- looking bez nadmiernych rozmiarów plików. Wyższe stawki frame oferują malejące zwroty wizualne przy jednoczesnym znacznym zwiększeniu rozmiarów plików. Rozważ kontekst dostawy - duży cyfrowy znak może obsługiwać większe pliki niż mobilne umieszczenie reklamy.', 'Zachowanie pętli decyduje o cyklu animacji. Bezszwowe pętle tworzą ciągły ruch idealny do sygnalizacji i wyświetlaczy otoczenia. Ping- pong (forward- then- reverse) pętle działają dobrze dla prostych animacji. Dla uwagi-chwytanie impulsów, rozważyć animacje z uchwytami - okresy bezruchu przebite przez ruch, który ciągnie oko bez stałego zmęczenia ruchem.'],
    },
    {
      heading: 'Tworzenie animowanych nakładek',
      paragraphs: ['Używając animowanych obrazów (GIF, animowane WebPs lub wideo) jako nakładek, ANQR pobiera ramki i komponuje je z kodem QR. Nakładanie natężenia kontroluje, jak duża część animacji pokazuje - niższe wartości traktują priorytetowo scannability, podczas gdy wyższe wartości sprzyjają efektowi wizualnemu. Przetestuj swoją wybraną intensywność w wielu klatkach, aby zapewnić stałą scannability.', 'Jakość materiału źródłowego ma znaczący wpływ na wyniki. Używać nakładek z wyraźnymi przedmiotami i dobrym kontrastem. Unikać animacji źródłowych z szybkim migotaniem lub ekstremalnych zmian jasności, które mogą tworzyć okazjonalne ramy o niskim kontraście. Podgląd pełnego cyklu animacji przed wywozem, aby złapać wszelkie problematyczne ramy, które mogą nie skanować.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Widok frame- by- frame animowanego nakładki pokazujący poziomy kontrastu utrzymywane w ciągu sekwencji',
          caption: 'Analiza ram: sprawdzanie stałej możliwości skanowania w całym cyklu animacji',
        },
      ],
    },
    {
      heading: 'Rozważania dotyczące wywozu i dostawy',
      paragraphs: ['GIF pozostaje najczęściej obsługiwanym animowanym formatem, grając automatycznie w większości kontekstów bez konieczności wsparcia odtwarzacza wideo. Jednak paleta kolorów GIF ogranicza wierność kolorów. Dla animacji color- krytycznych, rozważyć animowane WebP gdzie wspierane, lub wrócić do formatów wideo dla najwyższej jakości. Wywóz GIF przez ANQR obejmuje opcje rozpraszania w celu maksymalizacji jakości w granicach palety.', 'Rozmiar pliku ma znaczenie dla dostawy. Systemy Digital Signage, klienci poczty e-mail i platformy społecznościowe często nakładają ograniczenia dotyczące rozmiaru. Jeśli animacja przekracza te limity, zmniejsz liczbę klatek, wymiary lub głębię kolorów. Czasami podzielenie złożonej animacji na krótszą pętlę pozwala uzyskać lepsze rezultaty niż agresywna kompresja, która pogarsza każdą klatkę.'],
    },
    {
      heading: 'Testowanie animowanych kodów QR',
      paragraphs: ['Testowanie animowanych kodów wymaga skanowania w wielu punktach cyklu animacji. Nie skanuj raz i zakładaj sukces - skanuj wielokrotnie, w różnych momentach, aby sprawdzić, czy każda klatka jest czytelna. Należy zwrócić szczególną uwagę na ramy w skrajnych cyklach kolorystycznych lub szczyty intensywności nawierzchni, gdzie kontrast może być najniższy.', 'W miarę możliwości należy sprawdzić sprzęt do wyświetlania. Monitorować kalibrację kolorów, kąt widzenia i oświetlenie otoczenia wszystko wpływa na sposób, w jaki animacja pojawia się i skanuje. Jasna animacja, która doskonale skanuje na monitorze może zmyć się na ekranie zewnętrznym lub stać się nieczytelna w skośnych kątach widzenia.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Matryca testowa pokazująca wyniki skanowania w różnych klatkach, urządzeniach i warunkach wyświetlania',
          caption: 'Animowany protokół badań QR: systematyczne weryfikowanie ram, urządzeń i warunków przeglądania',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Zobacz przykłady QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Najlepsze praktyki QR w zakresie bezpieczeństwa i zgodności',
      paragraphs: ['Pięknie zaprojektowany kod QR, który nie potrafi skanować jest gorszy niż bezużyteczny - frustruje klientów, niszczy postrzeganie marki i marnuje wszystkie zasoby zainwestowane w jej tworzenie i dystrybucję. Niniejszy przewodnik obejmuje techniczne i praktyczne czynniki, które decydują, czy kod QR będzie skanować wiarygodnie, oraz jak korzystać z zabezpieczeń ANQR, aby złapać potencjalne problemy przed osiągnięciem produkcji.', 'Niezawodność kodu QR nie jest binarna. Kod może skanować idealnie na telefonach flagowych, ale nie na urządzeniach budżetowych. Może działać w idealnym oświetleniu, ale walka w ciemnych restauracjach lub jasne światło słoneczne. Zrozumienie czynników, które wpływają na scannability pomaga dokonać świadomych kompromisów między stylizacji wizualnej i real- world niezawodności.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Widmo niezawodności pokazujące kody QR, począwszy od bardzo skalowalnych do marginalnie czytelnych',
          caption: 'Widmo scannability: od kuloodpornych kodów do stylizacji, która pcha granice niezawodności',
        },
      ],
    },
    {
      heading: 'Zrozumienie poziomów korygowania błędów',
      paragraphs: ['Kody QR zawierają nadmiarowość wbudowaną, która pozwala na odczytywanie nawet jeśli są częściowo uszkodzone lub zasłonięte. Poziom korekty błędu - L (7%), M (15%), Q (25%) lub H (30%) - określa, ile kodu może brakować podczas prawidłowego dekodowania. Wyższa korekta błędów tworzy większe kody, ale zapewnia margines bezpieczeństwa dla nakładek, niedoskonałości druku i szkód środowiskowych.', 'Dla kodów z nakładkami na obrazy, poziom korekty błędów H jest niezbędne - nakładka fizycznie zasłania część kodu i potrzebujesz 30% redundancji, aby utrzymać niezawodność. Dla czystych, niestylizowanych kodów w kontrolowanych środowiskach poziom M często wystarcza. Poziom L powinno być zarezerwowane dla sytuacji, w których rozmiar kodu jest krytycznie ograniczony i można zagwarantować nieskazitelne warunki.'],
    },
    {
      heading: 'Krytyczna strefa ciszy',
      paragraphs: ['Strefa ciszy jest pustym marginesem wokół każdego kodu QR. Skanery używają tej granicy do identyfikacji miejsca rozpoczęcia i zakończenia kodu. Norma ISO określa minimalną cichą strefę czterech modułów (czterokrotność szerokości najmniejszego kwadratu w kodzie). Naruszenie tej przestrzeni - z elementami konstrukcyjnymi, krawędziami wykończeniowymi lub przylegającą zawartością - jest jedną z najczęstszych przyczyn awarii skanowania.', 'Ciche egzekwowanie strefy ANQR pomaga utrzymać ten krytyczny odstęp, ale musisz również upewnić się, że jest zachowany w swoich ostatecznych projektach. Podczas rozdawania grafiki QR, wyraźnie określić wymagania strefy ciszy. Przy umieszczaniu kodów w układach należy sprawdzić, czy żadne elementy nie naruszają tej przestrzeni. Kilka milimetrów czystej przestrzeni może oznaczać różnicę między niezawodnym skanowaniem i sfrustrowanych klientów.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Schemat pokazujący prawidłowe odstępy między strefami ciszy a powszechnymi naruszeniami, które powodują awarie skanowania',
          caption: 'Wymagania dotyczące strefy spokojnej: niewidzialny margines, który określa sukces skanowania',
        },
      ],
    },
    {
      heading: 'Bezpieczeństwo kontrastu i koloru',
      paragraphs: ['Skanery QR wykrywają wzór modułów światła i ciemności. Każda stylizacja, która zmniejsza ten kontrast - świetlne pierwszoplanowe, ciemne tło, efekt gradientu lub niskie zmętnienie - sprawia, że kod trudniej odczytać. ANQR oblicza współczynniki kontrastu i ostrzega, gdy wybory kolorów zbliżają się do niebezpiecznych poziomów, ale ostateczny arbiter jest zawsze realistyczne testy.', 'Percepcja kolorów różni się od warunków oświetlenia. Kombinacja kolorów, która pojawia się wysoki kontrast na monitorze może stać się trudne do odróżnienia pod ciepłym żarówki lub chłodne lampy fluorescencyjne. Jeśli kod zostanie zastosowany w różnych warunkach oświetlenia, przetestować w wielu źródłach światła i rozważyć bardziej konserwatywne kontrast jako margines bezpieczeństwa.'],
    },
    {
      heading: 'Rozmiar modułu i odległość wyświetlania',
      paragraphs: ['Fizyczny rozmiar poszczególnych modułów określa maksymalną odległość, z jakiej można zeskanować kod. Mniejsze moduły oznaczają mniejsze kody, ale wymagają mniejszych odległości skanowania. Ogólna zasada jest taka, że ​​każdy moduł powinien mieć co najmniej 0,5 mm odległości skanowania przy zamierzonej odległości skanowania, zwiększając ją proporcjonalnie w przypadku większych odległości. Kod na billboardzie wymaga znacznie większych modułów niż kod na wizytówce.', 'Przy obliczaniu wielkości modułu, należy wziąć pod uwagę najgorszy scenariusz: klient ze starszym telefonem, w niedoskonałym oświetleniu, skanowanie w maksymalnej prawdopodobnej odległości. Projekt dla tego użytkownika, a wszyscy inni będą mieli jeszcze lepsze doświadczenie. Czynnik rekomendacji wielkości ANQR w tych zmiennych real- world sugerujący odpowiednie wymiary do zamierzonego zastosowania.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Schemat dotyczący wielkości modułu, wymiarów druku i maksymalnej efektywnej odległości skanowania',
          caption: 'Skanowanie prowadnicy odległości: dopasowanie rozmiaru modułu do wymagań dotyczących rozmieszczenia',
        },
      ],
    },
    {
      heading: 'Korzystanie z trybu bezpieczeństwa ANQR',
      paragraphs: ['Tryb bezpieczeństwa ANQR zapewnia w czasie rzeczywistym informacje zwrotne na temat niezawodności skanowania. Monitoruje współczynniki kontrastowe, zgodność strefy spokojnej, intensywność nakładania oraz inne czynniki wpływające na zdolność do skanowania. Kiedy jakikolwiek parametr zbliża się do poziomu ryzyka, zobaczysz ostrzeżenia ze szczegółowymi wskazówkami jak poprawić niezawodność. W przypadku profesjonalnych wdrożeń, w przypadku których awaria jest kosztowna, należy utrzymywać aktywny tryb bezpieczeństwa w całym procesie projektowania.', 'Tryb bezpieczeństwa zawiera również funkcję weryfikacji skanowania, która próbuje odszyfrować wygenerowany kod i zgłasza sukces lub awarię. Weryfikacja in- app nie może powielać każdego stanu real- world, ale łapie wiele wspólnych problemów, zanim zainwestujesz w drukowanie lub dystrybucję. Traktuj udaną weryfikację jako minimalny pasek, a nie gwarancję - testowanie w świecie rzeczywistym pozostaje niezbędne.'],
    },
    {
      heading: 'Real- World Testing Protocols',
      paragraphs: ['Żadna ilość weryfikacji oprogramowania nie zastępuje testów fizycznych. Wydrukuj swój kod w zamierzonym rozmiarze na reprezentatywnym materiale. Przetestuj go w rzeczywistym środowisku rozmieszczania z warunkami oświetlenia, które pasują do rzeczywistego użycia. Skanuj z wieloma urządzeniami - nie tylko flagowym telefonem, ale również z urządzeniami z Androidem, starszymi iPhone \'ami i wszelkimi konkretnymi urządzeniami, z których korzysta publiczność.', 'Dokumentuj swoje testy systematycznie. Zapis, które urządzenia zostały przetestowane, w jakich warunkach, z jakich wyników. Jeśli stosujesz kody w skali, ustal kryteria akceptacji: być może 95% wskaźnik sukcesu w puli testowej urządzenia, lub pomyślne skany w ciągu 2 sekund na wszystkich badanych urządzeniach. Normy te przyczyniają się do tego, by decyzje podejmowane na zasadzie "go / no-go" były obiektywne, a nie miały nadzieję na najlepsze.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Kompleksowa lista kontrolna badań obejmująca urządzenia, warunki i kryteria akceptacji',
          caption: 'Protokół testów wdrożeniowych QR: systematyczna weryfikacja przed zobowiązaniem do produkcji',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Otwórz generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Zobacz przykłady QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Zobacz przykłady QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otwórz pełny przewodnik użytkownika', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otwórz galerię', type: 'gallery' },
  ],
};
