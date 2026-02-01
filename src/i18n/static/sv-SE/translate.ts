import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Hjälp till att översätta ANQR',
  description: 'Gå med i vår gemenskap av översättare som hjälper till att göra ANQR tillgängligt för användare över hela världen. Ingen erfarenhet av kodning krävs - bidra direkt från din webbläsare.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Öppna översättningsarkivet', type: 'external' },
    { href: '/?lang=${lang}', label: 'Öppna generatorn', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Om ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontakta oss', type: 'external' },
  ],
  sections: [
    {
      heading: 'Varför bidra?',
      paragraphs: ['ANQR används av människor runt om i världen för att skapa QR-koder för företag, evenemang, betalningar och personliga projekt. Genom att bidra med översättningar hjälper du till att göra detta kraftfulla verktyg tillgängligt för användare som föredrar sitt modersmål.', 'Varje översättningsbidrag - oavsett om du åtgärdar ett stavfel eller översätter ett helt språk - gör en verklig skillnad för användarna i din community.'],
    },
    {
      heading: 'Vad kan du översätta?',
      paragraphs: ['ANQR har två typer av översättbart innehåll:'],
      bullets: ['UI-strängar: Knappetiketter, menyalternativ, verktygstips och gränssnittstext som visas i hela appen.', 'Statiskt innehåll: Dokumentationssidor inklusive guider, exempel, sekretesspolicy och hjälpartiklar.', 'Båda typerna lagras som enkla textfiler som du kan redigera direkt i din webbläsare - ingen speciell programvara behövs.', 'Översättningar granskas innan de slås samman för att säkerställa kvalitet och konsekvens.'],
    },
    {
      heading: 'Hur man bidrar',
      paragraphs: ['Att bidra är enkelt och kräver inga Git-kunskaper:'],
      bullets: ['Besök vårt offentliga översättningsarkiv på GitHub.', 'Hitta din språkfil (eller skapa en ny om ditt språk ännu inte stöds).', 'Klicka på pennikonen för att redigera direkt i din webbläsare.', 'Gör dina ändringar och klicka på "Föreslå ändringar" - GitHub kommer automatiskt att skapa en pull-begäran.', 'Ditt bidrag kommer att granskas och slås samman, vanligtvis inom några dagar.'],
    },
    {
      heading: 'Översättningsriktlinjer',
      paragraphs: ['När du översätter, håll platshållare som {name}, {count} och {{variable}} oförändrade - dessa ersätts med dynamiska värden vid körning. Bevara även all HTML-liknande syntax som länkar i formatet [[/path|Etikett]].', 'Om du är osäker på en översättning är det bättre att lämna den på engelska än att tillhandahålla en felaktig översättning. Du kan också öppna ett problem på GitHub för att be om förtydligande.'],
    },
    {
      heading: 'Språk som stöds för närvarande',
      paragraphs: ['ANQR stöder för närvarande över 40 språk, inklusive:'],
      bullets: ['Viktiga världsspråk: engelska, kinesiska, spanska, arabiska, hindi, portugisiska, japanska, koreanska, franska, tyska, ryska och mer.', 'Sydostasien: thailändska, vietnamesiska, indonesiska, filippinska, malajiska, khmerer, lao, burmesiska.', 'Sydasiatiska språk: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Erkännande',
      paragraphs: ['Alla bidragsgivare krediteras i vårt arkiv. Ditt arbete hjälper tusentals användare att få tillgång till ANQR på deras föredragna språk.', 'Tack till alla våra översättningsbidragsgivare för att ni hjälper till att göra ANQR tillgängligt över hela världen!'],
    },
    {
      heading: 'Frågor?',
      paragraphs: ['Om du har frågor om att bidra med översättningar, vänligen öppna ett problem på vårt GitHub-förråd eller kontakta oss via e-post. Vi hjälper dig gärna att komma igång.'],
    },
  ],
};

export default translate;
