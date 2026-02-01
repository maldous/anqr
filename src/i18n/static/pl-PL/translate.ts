import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Pomóż w tłumaczeniu ANQR',
  description: 'Dołącz do naszej społeczności tłumaczy, którzy pomagają udostępnić ANQR użytkownikom na całym świecie. Nie jest wymagane żadne doświadczenie w kodowaniu — współpracuj bezpośrednio z przeglądarki.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Otwórz repozytorium tłumaczeń', type: 'external' },
    { href: '/?lang=${lang}', label: 'Otwórz generator', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'O ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Skontaktuj się z nami', type: 'external' },
  ],
  sections: [
    {
      heading: 'Dlaczego warto wnosić wkład?',
      paragraphs: ['ANQR jest używany przez ludzi na całym świecie do tworzenia kodów QR dla firm, wydarzeń, płatności i projektów osobistych. Dodając tłumaczenia, pomagasz udostępnić to potężne narzędzie użytkownikom, którzy preferują swój język ojczysty.', 'Każdy wkład w tłumaczenie – czy to naprawienie literówki, czy tłumaczenie całego języka – ma realne znaczenie dla użytkowników w Twojej społeczności.'],
    },
    {
      heading: 'Co możesz przetłumaczyć?',
      paragraphs: ['ANQR ma dwa typy treści do przetłumaczenia:'],
      bullets: ['Ciągi interfejsu użytkownika: etykiety przycisków, elementy menu, podpowiedzi i tekst interfejsu wyświetlany w całej aplikacji.', 'Treść statyczna: strony dokumentacji zawierające przewodniki, przykłady, politykę prywatności i artykuły pomocy.', 'Obydwa typy są przechowywane w postaci prostych plików tekstowych, które można edytować bezpośrednio w przeglądarce – nie jest potrzebne żadne specjalne oprogramowanie.', 'Tłumaczenia są sprawdzane przed połączeniem, aby zapewnić jakość i spójność.'],
    },
    {
      heading: 'Jak wnieść swój wkład',
      paragraphs: ['Wnoszenie wkładu jest łatwe i nie wymaga znajomości Git:'],
      bullets: ['Odwiedź nasze publiczne repozytorium tłumaczeń w serwisie GitHub.', 'Znajdź plik językowy (lub utwórz nowy, jeśli Twój język nie jest jeszcze obsługiwany).', 'Kliknij ikonę ołówka, aby edytować bezpośrednio w przeglądarce.', 'Wprowadź zmiany i kliknij „Zaproponuj zmiany" — GitHub automatycznie utworzy żądanie ściągnięcia.', 'Twój wkład zostanie sprawdzony i połączony, zazwyczaj w ciągu kilku dni.'],
    },
    {
      heading: 'Wytyczne dotyczące tłumaczeń',
      paragraphs: ['Podczas tłumaczenia nie zmieniaj symboli zastępczych, takich jak {name}, {count} i {{variable}} — są one zastępowane wartościami dynamicznymi w czasie wykonywania. Zachowaj także składnię przypominającą HTML, taką jak łącza, w formacie [[/ścieżka|Etykieta]].', 'Jeśli nie masz pewności co do tłumaczenia, lepiej zostawić je w języku angielskim, niż dostarczać błędne tłumaczenie. Możesz także otworzyć problem w GitHubie, aby poprosić o wyjaśnienia.'],
    },
    {
      heading: 'Obecnie obsługiwane języki',
      paragraphs: ['ANQR obsługuje obecnie ponad 40 języków, w tym:'],
      bullets: ['Główne języki świata: angielski, chiński, hiszpański, arabski, hindi, portugalski, japoński, koreański, francuski, niemiecki, rosyjski i inne.', 'Języki Azji Południowo-Wschodniej: tajski, wietnamski, indonezyjski, filipiński, malajski, khmerski, laotański, birmański.', 'Języki Azji Południowej: hindi, tamilski, telugu, bengalski, marathi, gudżarati, kannada, malajalam, pendżabski, nepalski.'],
    },
    {
      heading: 'Uznanie',
      paragraphs: ['Wszyscy współautorzy są przypisani do naszego repozytorium. Twoja praca pomaga tysiącom użytkowników uzyskać dostęp do ANQR w preferowanym przez nich języku.', 'Dziękujemy wszystkim naszym współtwórcom tłumaczeń za pomoc w udostępnieniu ANQR na całym świecie!'],
    },
    {
      heading: 'Pytania?',
      paragraphs: ['Jeśli masz pytania dotyczące współtworzenia tłumaczeń, otwórz problem w naszym repozytorium GitHub lub skontaktuj się z nami za pośrednictwem poczty elektronicznej. Chętnie pomożemy Ci zacząć.'],
    },
  ],
};

export default translate;
