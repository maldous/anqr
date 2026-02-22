import type { PageDefinition } from '../types';

export const about: PageDefinition = {
  title: 'O ANQR',
  description:
    'ANQR jest darmowym generatorem kodu QR z podejściem klient-pierwszy - generować kody QR lokalnie lub używać naszych API do osadzania.',
  lastUpdated: '1 lutego 2026 r',
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otwórz generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Przeglądaj Nauka artykułów', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Polityka prywatności', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Warunki świadczenia usług', type: 'external' },
  ],
  sections: [
    {
      heading: 'Co to jest ANQR?',
      paragraphs: [
        'ANQR (wymawiana \\"kotwica\\") jest wolnym generatorem kodu QR, który tworzy skanowalne kody adresów URL, tekstowych, Wi- Fi, kart kontaktowych, zdarzeń kalendarzowych i wiele innych.',
        'Jest on zbudowany dla osób indywidualnych, małych firm, marketerów i deweloperów, którzy chcą potężnych narzędzi QR bez logowania się. Klient- pierwszy projekt oznacza kody QR są generowane lokalnie w przeglądarce domyślnie, z opcjonalnym serwerem API do profesjonalnego osadzania i integracji.',
      ],
    },
    {
      heading: 'Główne cechy',
      bullets: [
        'Generuj kody QR natychmiast w przeglądarce - konto nie jest wymagane.',
        'Dostosuj kolory, style modułów, wzorce wyszukiwania i dodaj nakładki obrazu.',
        'Eksport w wielu formatach: PNG, SVG, WebP i animowany GIF.',
        'Zaawansowane sterowanie poziomem korekty błędów, wersja QR, tryb kodowania i wybór maski.',
        'Scan- bezpieczeństwo i podgląd na żywo pomóc utrzymać kody czytelne w druku i na ekranach.',
        'Serwerowy API dla profesjonalnego osadzania z pełnym obsługą parametrów.',
        'Po załadowaniu działa w trybie offline — jest to statyczna aplikacja internetowa, którą można uruchomić w dowolnym miejscu.',
      ],
    },
    {
      heading: 'Jak działa ANQR',
      paragraphs: [
        'ANQR działa w przeglądarce i koduje dane wejściowe do standardowej matrycy QR z korektą błędu Reed- Solomon, a następnie przekształca je w wybrany format.',
        'Domyślnie generacja odbywa się lokalnie w przeglądarce. Do użytku profesjonalnego, można również użyć server- side API do generowania kodów QR poprzez parametry URL - idealne do umieszczania na stronach internetowych, e-maili lub zautomatyzowanych przepływów pracy.',
        'Po dodaniu narzutów lub animacji, ANQR równoważy stylizację z niezawodnością skanowania, więc wynik pozostaje do przewidzenia.',
        'ANQR koncentruje się na kodach statycznych (dane są wewnątrz QR). Jeśli potrzebujesz dynamicznego kodu (edytowalnego celu), możesz kodować swój własny przekierowany adres URL lub krótki link.',
      ],
    },
    {
      heading: 'Kto prowadzi ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklama i jak pozostajemy wolni',
      paragraphs: [
        'ANQR jest wolny w użyciu i jest wspierany przez reklamę. Możemy pokazywać reklamy za pośrednictwem Google AdSense i / lub innych partnerów reklamowych.',
        'Dostawcy reklam mogą korzystać z plików cookie lub podobnych technologii do personalizacji reklam w oparciu o Państwa interesy i działalność przeglądania. Możesz zarządzać preferencjami reklamowymi w ustawieniach urządzeń oraz za pośrednictwem ustawień reklamowych Google i dowiedzieć się więcej w naszej polityce prywatności.',
        'Nie sprzedajemy treści kodowanej do kodów QR. reklama pomaga pokryć koszty uruchomienia i poprawy projektu.',
      ],
    },
    {
      heading: 'Otwarte standardy',
      paragraphs: [
        'ANQR generuje kody QR oparte na normie ISO / IEC 18004 i ma na celu szeroką kompatybilność między skanerami, kamerami i przepływami druku.',
      ],
    },
    {
      heading: 'Ogłoszenie o znaku towarowym',
      paragraphs: [
        'QR Code ® jest zarejestrowanym znakiem towarowym DENSO WAVE INCORPOROWANY. ANQR nie jest stowarzyszony z DENSO WAVE INCORPOROWANY, przez nią zatwierdzony ani sponsorowany.',
      ],
    },
    {
      heading: 'Informacje zwrotne i wkłady',
      paragraphs: [
        'Przyjmujemy opinie zwrotne, raporty o błędach i sugestie. Prosimy o kontakt przez e-mail lub stronę kontaktową - czytamy każdą wiadomość, chociaż czas reakcji może się różnić.',
      ],
    },
  ],
};

export default about;
