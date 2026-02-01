import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Warunki świadczenia usług',
  description: 'Poprzez dostęp lub korzystanie z witryny, zgadzasz się być związany tymi warunkami.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Polityka prywatności', type: 'external' }],
  sections: [
    {
      heading: 'Przyjęcie warunków',
      paragraphs: ['Poprzez dostęp lub korzystanie z ANQR (anqr.link) Użytkownik wyraża zgodę na związanie się niniejszymi Warunkami Usług i naszą Polityką Prywatności. Jeśli nie zgadzasz się na te warunki, nie korzystaj z witryny.', 'Od czasu do czasu możemy aktualizować niniejsze Warunki. Kontynuacja korzystania z witryny po zmianach stanowi przyjęcie nowych warunków.'],
    },
    {
      heading: 'Kwalifikacja',
      paragraphs: ['Pacjent musi mieć co najmniej 13 lat, aby stosować ANQR. Korzystając z witryny, reprezentujesz, że spełnia ten wymóg wieku. Jeśli masz poniżej 18 lat, reprezentujesz, że masz pozwolenie rodzica lub opiekuna na korzystanie z witryny.'],
    },
    {
      heading: 'Dozwolone stosowanie',
      paragraphs: ['Możesz używać ANQR wyłącznie do celów zgodnych z prawem. Ponosisz wyłączną odpowiedzialność za treści, które kodujesz w kodach QR i za sposób, w jaki wykorzystujesz wygenerowane przez siebie kody QR.'],
    },
    {
      heading: 'Zakazane zachowanie',
      paragraphs: ['Zgadzasz się nie:'],
      bullets: ['Użyj ANQR do tworzenia kodów QR, które ułatwiają phishing, dystrybucji złośliwego oprogramowania, oszustw, oszustw, nękania, zniesławienia lub wszelkiej nielegalnej działalności.', 'Zakodowanie treści naruszających prawa własności intelektualnej, naruszających prywatność lub zawierających nielegalne materiały.', 'Próba zakłócenia, przeciążenia lub zakłócenia działania lub bezpieczeństwa strony.', 'Inżynier wsteczny, dekompilacja lub próba wydobycia kodu źródłowego ze strony.', 'Użyj automatycznych narzędzi (botów, scraperów), aby uzyskać dostęp do witryny w sposób, który obniża wydajność innych użytkowników.', 'Obwód lub wyłączyć wszelkie funkcje kontroli bezpieczeństwa lub dostępu.', 'Podszywać się pod każdą osobę lub podmiot lub błędnie przedstawić swoje powiązanie.'],
    },
    {
      heading: 'Własność intelektualna',
      paragraphs: ['Zachowujesz własność treści kodowanej do kodów QR. ANQR nie rości sobie prawa do Państwa danych.', 'Nazwa ANQR, logo, projekt interfejsu i kod bazowy są chronione prawem autorskim, znakiem towarowym i innymi prawami własności intelektualnej. Nie można kopiować, modyfikować, rozpowszechniać lub tworzyć pochodnych prac bez naszej zgody.', 'QR Code ® jest zarejestrowanym znakiem towarowym DENSO WAVE INCORPOROWANY. ANQR nie jest powiązany z DENSO WAVE.'],
    },
    {
      heading: 'Licencja na zawartość użytkownika',
      paragraphs: ['Korzystając z ANQR, nie przyznajesz nam żadnych praw do treści. Podczas korzystania z lokalnej generacji (domyślnie), cała generacja kodu QR dzieje się w przeglądarce i nie mamy dostępu, przechowywania lub przekazywania zakodowanych danych.', 'Podczas korzystania z API po stronie serwera, Twoja zawartość jest przetwarzana do generowania obrazu QR, ale nie jest przechowywana, rejestrowana lub używana do innych celów poza renderowaniem żądanego obrazu.'],
    },
    {
      heading: 'Usługi i reklama stron trzecich',
      paragraphs: ['Strona wyświetla reklamy za pośrednictwem Google AdSense i może zawierać linki do stron trzecich. Nie jesteśmy odpowiedzialni za treści, usługi lub praktyki prywatności osób trzecich.', 'Twoje relacje z reklamodawcami i osobami trzecimi są tylko między tobą a nimi. Zobacz naszą politykę prywatności w celu uzyskania informacji o praktykach reklamowych.'],
    },
    {
      heading: 'Zwolnienie gwarancji',
      paragraphs: ['ANQR JEST ZAPEWNIANY NA PODSTAWIE "AS IS" I "AS AVAILABLE", BEZ ZASTRZEŻEŃ JAKIEGOKOLWIEK RODZAJU, EKSPRESS LUB IMPLIFIED, W TYM, ALE NIE OGRANICZONY DO POPRAWY ALARMÓW DOTYCZĄCYCH MOŻLIWOŚCI WYMIANY HANDLOWEJ, ADEKWATNOŚCI DO KONKRETNEGO CELU, ORAZ NIESTOSOWANIA.', 'Nie gwarantujemy, że: a) strona będzie niezakłócona, bezpieczna lub wolna od błędów; b) kody QR będą skanować we wszystkich środowiskach, na wszystkich urządzeniach lub we wszystkich zastosowaniach skanerów; c) strona będzie spełniać Twoje wymagania.', 'Należy zawsze testować kody QR w warunkach, w których będą one stosowane (rozmiar druku, oświetlenie, typ ekranu, odległość, jakość kamery).'],
    },
    {
      heading: 'Ograniczenie odpowiedzialności',
      paragraphs: ['W ODNIESIENIU DO WSZELKICH BEZPOŚREDNICH, BEZPOŚREDNICH, POŚREDNICH, SZCZEGÓLNYCH, KONEKSJONOWANYCH, ZAPOBIEGAWCZYCH LUB NADZWYCZAJNYCH, W TYM, ALE NIEOGRANICZONYCH DO UTRATY ZYSKÓW, DOCHODU, DANYCH, TOWARÓW, WYKORZYSTANIA LUB INNYCH NIEMATERIALNYCH STRAT, POCHODZĄCYCH Z LUB ZWIĄZANYCH Z WYKONYWANIEM CZYNNOŚCI LUB Z ICH WYKORZYSTANIEM.', 'Z CAŁĄ PEWNOŚCIĄ ROZUMIESZ I ZGADZASZ SIĘ, ŻE KORZYSTANIE ZE SŁUŻBY JEST DLA CIEBIE ZAGROŻENIEM. SŁUŻBA JEST BEZPŁATNA, A TY ZGADZASZ SIĘ, ŻE ANQR I JEGO AGENCI NIE BĘDĄ CI WINNI ZA JAKIEKOLWIEK STRATY. W ŻADNYM WYPADKU NASZA ŁĄCZNA ROLNA ODPOWIEDZIALNOŚĆ NIE MOŻE PRZEKROCZYĆ ZERO DOLLARS (0 USD AUD).', 'UZGODNIŁEŚ O ZWOLNIENIU, WAIVE, I ZNISZCZASZ WSZYSTKIE KLASYFIKACJE, DEMANDY I PRZYCZYNY DZIAŁANIA W ODNIESIENIU DO ANQR I ICH OPERATORÓW WYWOŁUJĄCYCH Z WYKORZYSTANIA SŁUŻBY.', 'NIEKTÓRE ORZECZENIA SĄDOWE NIE ZEZWALAJĄ NA WYŁĄCZENIE NIEKTÓRYCH RODZAJÓW POSTĘPOWAŃ WOJENNYCH LUB SĄDOWYCH. W TAKICH PRZYPADKACH NASZA ODPOWIEDZIALNOŚĆ JEST OGRANICZONA DO MAKSYMALNEJ ROZSZERZONEJ PODSTAWY PRAWNEJ.'],
    },
    {
      heading: 'Ukaranie',
      paragraphs: ['Użytkownik zgadza się na odszkodowanie, obronę i utrzymanie nieszkodliwego ANQR, jego operatorów, spółek zależnych oraz ich odpowiednich urzędników, dyrektorów, pracowników i agentów od wszelkich roszczeń, szkód, strat, zobowiązań, kosztów i wydatków (w tym opłat prawnych) wynikających z: a) korzystania z witryny; b) naruszenia niniejszych Warunków; c) naruszenia praw osób trzecich; d) wszelkich treści kodowania do kodów QR.'],
    },
    {
      heading: 'Rozstrzyganie sporów',
      paragraphs: ['Wszelkie spory wynikające z niniejszych Warunków lub korzystania z ANQR należy najpierw spróbować rozwiązać w drodze nieformalnych negocjacji, kontaktując się z $_ _ ANQR _ PH _ 0 _ _.', 'Jeżeli nieformalne rozstrzygnięcie nie powiedzie się, spory rozstrzyga się w drodze wiążącego arbitrażu w Wiktorii w Australii, z wyjątkiem sytuacji, w której każda ze stron może ubiegać się o pomoc sądową w przypadku naruszenia własności intelektualnej.'],
    },
    {
      heading: 'Odstąpienie od działań klasowych',
      paragraphs: ['W ODNIESIENIU DO ROZSZERZONEJ PODSTAWY PRAWNEJ, ZGADZASZ SIĘ, ŻE WSZELKIE PROCEDURY RESOCJALIZACYJNE BĘDĄ PROWADZONE WYŁĄCZNIE NA ZASADZIE INDYWIDUALNEJ, A NIE W KLASACH, SKONSOLIDOWANYCH LUB REPREZENTACYJNYCH.'],
    },
    {
      heading: 'Prawo właściwe',
      paragraphs: ['Warunki te są regulowane przez prawa Wiktorii, Australii, bez względu na zasady kolizyjne prawa. Zgadzasz się na wyłączną jurysdykcję sądów znajdujących się w Victoria w Australii.'],
    },
    {
      heading: 'Zmiany i dostępność',
      paragraphs: ['Możemy modyfikować, zawiesić lub przerwać stronę (lub jej część) w dowolnym momencie bez wypowiedzenia lub odpowiedzialności.', 'W każdej chwili możemy zaktualizować niniejsze Warunki. Data "Last updated" wskazuje, kiedy zostały one ostatnio zmienione. Kontynuacja stosowania po zmianach oznacza akceptację.'],
    },
    {
      heading: 'Przedłużenie',
      paragraphs: ['Jeżeli jakiekolwiek postanowienie niniejszych Warunków zostanie uznane za nieważne lub niewykonalne, przepis ten będzie egzekwowany w maksymalnym dopuszczalnym zakresie, a pozostałe postanowienia pozostaną w mocy i w mocy.'],
    },
    {
      heading: 'Wycofanie',
      paragraphs: ['Nasze niewykonanie jakiegokolwiek prawa lub postanowienia niniejszych Warunków nie jest uważane za zrzeczenie się takiego prawa lub postanowienia.'],
    },
    {
      heading: 'Całość umowy',
      paragraphs: ['Niniejsze Warunki, wraz z naszą Polityką Prywatności, stanowią całą umowę pomiędzy Tobą a ANQR dotyczącą korzystania z witryny i zastępują wszelkie wcześniejsze umowy.'],
    },
    {
      heading: 'Siła wyższa',
      paragraphs: ['Nie ponosimy odpowiedzialności za jakiekolwiek niepowodzenie lub opóźnienia w wykonaniu z powodu okoliczności pozostających poza naszą rozsądną kontrolą, w tym klęsk żywiołowych, wojen, terroryzmu, zamieszek, działań rządowych lub awarii internetu / infrastruktury.'],
    },
    {
      heading: 'Kontakt',
      paragraphs: ['Pytania dotyczące niniejszych Warunków można wysyłać na adres: $_ _ ANQR _ PH _ 0 _ _'],
    },
  ],
};

export default terms;
