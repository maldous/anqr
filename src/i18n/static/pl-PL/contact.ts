import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Skontaktuj się z nami',
  description: 'Z zadowoleniem przyjmujemy informacje zwrotne, raporty o błędach, żądania dotyczące funkcji i ogólne zapytania.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Jak do nas dotrzeć',
      paragraphs: ['Oferujemy kilka sposobów, aby skontaktować się z nami w zależności od potrzeb. Czytamy każdą wiadomość, choć czas odpowiedzi może się różnić w zależności od głośności i typu zapytań.'],
    },
    {
      heading: 'E-mail',
      paragraphs: ['Dla wszystkich zapytań: $_ _ ANQR _ PH _ 0 _ _', 'Jest to najbardziej niezawodny sposób skontaktowania się z nami i jest zalecany w przypadku szczegółowych pytań, zapytań biznesowych lub innych zapytań.'],
    },
    {
      heading: 'Rodzaje zapytań',
      bullets: ['Pytania ogólne: Pytania dotyczące stosowania ANQR, wyjaśnień dotyczących funkcji lub ogólnych informacji zwrotnych.', 'Raporty o błędzie: Proszę włączyć przeglądarkę, system operacyjny, kroki do powielania i wszelkie komunikaty błędów, które widzisz.', 'Żądania: sugestie dotyczące nowych funkcji lub ulepszeń. Rozważamy wszystkie wnioski, choć nie możemy obiecać wdrożenia.', 'Zapytania biznesowe: Możliwości partnerstwa, pytania licencyjne lub zapytania o wykorzystanie handlowe.', 'Prośby o prywatność: Wnioski o korzystanie z praw do prywatności na mocy GDPR, CCPA lub innych przepisów o prywatności (patrz Polityka prywatności).', 'DMCA / Copyright: Zob. sekcja DMCA poniżej w celu uzyskania powiadomienia o przejęciu.'],
    },
    {
      heading: 'Czas odpowiedzi',
      paragraphs: ['Chcemy odpowiedzieć na zapytania w ciągu 5-7 dni roboczych. Wnioski związane z pierwszeństwem zostaną rozpatrzone w terminie 30 dni zgodnie z wymogami prawa.', 'W okresach pracy czas reakcji może być dłuższy. W pilnych sprawach proszę podać "PILNE" w swojej linii tematycznej.'],
    },
    {
      heading: 'Przed skontaktowaniem się z nami',
      paragraphs: ['Proszę sprawdzić na naszej stronie Dokumentacja odpowiedzi na wspólne pytania dotyczące korzystania z funkcji ANQR. Wiele pytań dotyczących generowania kodu QR, stylizacji i opcji eksportu jest tam poruszonych.'],
    },
    {
      heading: 'DMCA Ogłoszenia o prawach autorskich',
      paragraphs: ['Jeśli uważasz, że zawartość dostępna na ANQR narusza Twoje prawa autorskie, możesz złożyć Digital Millennium Copyright Act (DMCA) takedown notice. Aby powiadomienie było ważne, musi zawierać:'],
      bullets: ['Podpis fizyczny lub elektroniczny właściciela praw autorskich lub upoważnionego agenta.', 'Identyfikacja prac objętych prawami autorskimi, które rzekomo zostały naruszone.', 'Identyfikacja materiału, który rzekomo narusza przepisy, wraz z informacjami wystarczającymi do jego zlokalizowania.', 'Dane kontaktowe (adres, numer telefonu i adres e-mail).', 'Oświadczenie o dobrej wierze, że korzystanie z materiału nie jest dozwolone przez właściciela praw autorskich.', 'Oświadczenie, pod karą krzywoprzysięstwa, że informacje zawarte w ogłoszeniu są dokładne i że jesteś właścicielem praw autorskich lub upoważnionym do działania w ich imieniu.'],
    },
    {
      heading: 'Kontakt DMCA',
      paragraphs: ['Wyślij powiadomienia DMCA do: $_ _ ANQR _ PH _ 0 _ _', 'Proszę włączyć "DMCA Notice" do tematu. Odpowiemy na ważne zawiadomienia zgodnie z obowiązującym prawem. Należy zauważyć, że ANQR generuje kody QR lokalnie na urządzeniach użytkowników i nie posiada treści generowanej przez użytkownika.'],
    },
    {
      heading: 'Społeczność Reddita',
      paragraphs: ['Dołącz do naszej społeczności Reddit w r/ANQR, aby dzielić się swoimi dziełami QR, zadawać pytania, uzyskiwać pomoc i łączyć się z innymi użytkownikami ANQR.'],
    },
  ],
};

export default contact;
