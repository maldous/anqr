import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Polityka prywatności',
  description: 'Informacje ANQR zbiera, jak jest używany, i swoje prawa zgodnie z obowiązującymi przepisami prywatności.',
  lastUpdated: '1 lutego 2026 r',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Warunki świadczenia usług', type: 'external' }],
  sections: [
    {
      heading: 'Streszczenie',
      paragraphs: ['ANQR to generator kodów QR, który koncentruje się na kliencie. Nie wymagamy od Ciebie zakładania konta. Domyślnie kody QR generowane są lokalnie w Twojej przeglądarce – nie mamy dostępu do treści, które kodujesz.', 'Do użytku profesjonalnego, ANQR zapewnia server- side API, który generuje kody QR z parametrów URL. Podczas korzystania z API zawartość QR jest przetwarzana na naszych serwerach w celu renderowania obrazu, ale nie jest przechowywana ani zalogowana.', 'Używamy Google AdSense do reklamy i możemy korzystać z usług analitycznych. Usługi te gromadzą informacje za pośrednictwem plików cookie i podobnych technologii. Polityka ta wyjaśnia, jakie dane są gromadzone, jak są wykorzystywane i jakie są Twoje prawa.'],
    },
    {
      heading: 'Informacje, które zbieramy',
      bullets: ['Informacje, które Państwo dostarczają: Jeśli skontaktujesz się z nami przez e-mail lub nasz formularz kontaktowy, zbieramy Twoje imię i nazwisko, adres e-mail oraz zawartość wiadomości.', 'Automatycznie zbierane informacje: Nasz dostawca usług hostingowych (Netlify), partnerzy reklamowi i usługi analityczne mogą zbierać: adres IP, typ przeglądarki i wersja, system operacyjny, typ urządzenia, adres referencyjny URL, odwiedzane strony, czas na miejscu i przybliżone położenie geograficzne.', 'Pliki cookie z trzeciej partii: Nasi partnerzy reklamowi (Google AdSense) używają plików cookie i podobnych technologii do obsługi i pomiaru reklam. ANQR nie ustawia plików cookie pierwszej partii.'],
    },
    {
      heading: 'Cookies i technologie stron trzecich',
      paragraphs: ['ANQR nie ustawia plików cookie pierwszej partii. Twoje preferencje (takie jak tryb ciemności) są przechowywane lokalnie na urządzeniu, które nie jest przekazywane do żadnego serwera.', 'Jednakże nasi partnerzy reklamowi (Google AdSense) i hosting provider mogą korzystać z plików cookie i podobnych technologii śledzenia:'],
      bullets: ['Pliki cookie reklamowe (strona trzecia): Ustawienie przez Google AdSense i partnerów reklamowych do obsługi odpowiednich reklam, pomiaru wydajności reklamy i zrozumienia interesów użytkowników. Te pliki cookie mogą śledzić Twoją aktywność na różnych stronach internetowych.', 'Pliki cookie analityczne (strona trzecia): Może być wykorzystywany przez naszego operatora hostingowego lub usługi analityczne do gromadzenia anonimowych danych dotyczących wykorzystania.'],
    },
    {
      heading: 'Google AdSense i reklama',
      paragraphs: ['Wyświetlamy reklamy poprzez Google AdSense. Google i jego partnerzy używają plików cookie do obsługi reklam opartych na historii przeglądania na tej stronie i innych stronach internetowych (reklama oparta na zainteresowaniach).', 'Dowiedz się, jak Google wykorzystuje Twoje informacje: https: / / policies.google.com / technologies / partner- sites', 'Zarządzanie reklamą personalizacji: https: / / adssettings.google.com', 'W związku z tym Komisja uważa, że nie można uznać, że środki te są zgodne z rynkiem wewnętrznym', 'Informacje na temat reklamy cyfrowej: https: / / optout.abouds.info'],
    },
    {
      heading: 'Jak używamy informacji',
      bullets: ['Aby odpowiedzieć na pytania i zapewnić wsparcie.', 'Aby wyświetlić odpowiednie reklamy za pośrednictwem naszych partnerów reklamowych.', 'Aby przeanalizować wykorzystanie witryny i poprawić nasze usługi.', 'Wykrywanie, zapobieganie i rozwiązywanie kwestii oszustw, nadużyć i bezpieczeństwa.', 'Wypełnienie obowiązków prawnych.'],
    },
    {
      heading: 'Usługi dla stron trzecich',
      bullets: ['Google AdSense: Odbiera dane do obsługi i pomiaru reklam.', 'Dostawcy analityków: Otrzymuj dane dotyczące anonimowego wykorzystania.', 'Netalify (hosting): Przetwarza wnioski i może logować adresy IP.', 'Nie sprzedajemy twoich danych osobowych. Jednak wymiana danych z partnerami reklamowymi może być uznana za "sprzedaż" w ramach CCPA (zob. poniżej).'],
    },
    {
      heading: 'Zatrzymanie danych',
      bullets: ['Informacje kontaktowe: Do 2 lat.', 'Logi serwerów: Do 30 dni (dostawca usług hostingowych).', 'Dane analityczne: Do 26 miesięcy (anonimowo).', 'Pliki cookie reklamowe: Zazwyczaj 13 miesięcy (w zależności od partnera).'],
    },
    {
      heading: 'Twoje prawa wynikające z GDPR (użytkownicy EEA)',
      paragraphs: ['Jeśli jesteś w Europejskim Obszarze Gospodarczym, masz następujące prawa na mocy ogólnego rozporządzenia o ochronie danych:'],
      bullets: ['Prawo dostępu: Proszę o kopię danych osobowych, które o panu mamy.', 'Prawo do sprostowania: Proszę o skorygowanie nieprawidłowych danych.', 'Prawo do usunięcia: Żądaj usunięcia danych ("prawo do bycia zapomnianym").', 'Prawo do ograniczenia przetwarzania: Prośba o ograniczenie korzystania z Państwa danych.', 'Prawo do przenoszenia danych: Poproś o dane w przenośnym formacie.', 'Prawo do sprzeciwu: Przedmiot przetwarzania, w tym do marketingu bezpośredniego.', 'Prawo do wycofania zgody: Wycofaj zgodę w każdym momencie, gdy przetwarzanie odbywa się na podstawie zgody.', 'Prawo do złożenia skargi: Złóż skargę do swojego organu ochrony danych.'],
    },
    {
      heading: 'Podstawa prawna GDPR',
      paragraphs: ['Przetwarzamy dane na tych podstawach: a) zgoda - dla spersonalizowanych reklam (zarządzanych przez naszych partnerów reklamowych); b) uzasadnione interesy - dla analizy, bezpieczeństwa i poprawy; c) umowa - odpowiedź na zapytania.', 'Aby skorzystać z praw, skontaktuj się z $_ _ ANQR _ PH _ 0 _ _. Odpowiadamy w ciągu 30 dni.'],
    },
    {
      heading: 'Twoje prawa w ramach CCPA (użytkownicy Kalifornii)',
      bullets: ['Prawo wiedzieć: Proszę o informacje dotyczące zgromadzonych danych, źródeł, celów i stron trzecich.', 'Prawo do usunięcia: Proszę o usunięcie danych osobowych.', 'Prawo do opt- out: Wyłączenie z "sprzedaży" danych osobowych (wymiana z partnerami reklamowymi może się kwalifikować).', 'Prawo do niedyskryminacji: Nie będziemy dyskryminować państwa praw.'],
    },
    {
      heading: 'Zgromadzone kategorie CCPA',
      paragraphs: ['Kategorie: Identyfikatory (adres IP, ID urządzenia), Aktywność Internetu (przeglądanie, interakcje reklamowe), Geolokalizacja (przybliżone), Wnioski (zainteresowania z przeglądania).', 'Aby korzystać z praw lub zrezygnować: $_ _ ANQR _ PH _ 0 _ _ lub dostosować ustawienia plików cookie.'],
    },
    {
      heading: 'Transfery międzynarodowe',
      paragraphs: ['Informacje mogą być przekazywane do krajów o różnych przepisach dotyczących ochrony danych, w tym do Stanów Zjednoczonych. Stosujemy odpowiednie zabezpieczenia, takie jak standardowe klauzule umowne.'],
    },
    {
      heading: 'Prywatność dzieci',
      paragraphs: ['ANQR nie jest przeznaczony dla dzieci poniżej 13 lat (lub 16 lat w EOG). Nie zbieramy świadomie danych od dzieci. Skontaktuj się z $_ _ ANQR _ PH _ 0 _ _ jeśli uważasz, że dziecko dostarczyło informacji.'],
    },
    {
      heading: 'Bezpieczeństwo',
      paragraphs: ['Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony danych, w tym szyfrowanie HTTPS. Jednakże żadna transmisja internetowa nie jest w 100% bezpieczna.'],
    },
    {
      heading: 'Nie śledź',
      paragraphs: ['Jeśli to możliwe, honorujemy sygnały przeglądarki "Nie śledź", chociaż partnerzy reklamowi mogą nie odpowiadać na DNT.'],
    },
    {
      heading: 'Zmiany w tej polityce',
      paragraphs: ['Możemy okresowo aktualizować tę politykę. Data "Last updated" wskazuje najnowszą wersję. Znaczące zmiany mogą być przekazywane za pośrednictwem banera witryny.'],
    },
    {
      heading: 'Skontaktuj się z nami',
      paragraphs: ['Pytania o prywatność lub korzystanie z praw: $_ _ ANQR _ PH _ 0 _ _ lub skorzystaj z naszej strony kontaktowej. Odpowiadamy na prośby o prywatność w ciągu 30 dni.'],
    },
    {
      heading: 'Pełna polityka prywatności',
      paragraphs: ['Na tej stronie znajduje się podsumowanie naszych praktyk dotyczących prywatności. Aby zapoznać się z pełną, prawnie wiążącą polityką prywatności ze wszystkimi szczegółami dotyczącymi przetwarzania danych, Twoich praw i naszych obowiązków wynikających z RODO, CCPA i innych przepisów dotyczących prywatności, zapoznaj się z naszą pełną polityką prowadzoną przez iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Zobacz pełną Politykę prywatności na iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
