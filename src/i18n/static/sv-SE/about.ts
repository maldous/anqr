import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Om ANQR',
  description: 'ANQR är en gratis QR-kodgenerator med ett klient-första tillvägagångssätt - generera QR-koder lokalt eller använd vårt API för inbäddning.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Öppna generatorn', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Bläddra Lär artiklar', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Sekretesspolicy', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Användarvillkor', type: 'external' },
  ],
  sections: [
    {
      heading: 'Vad är ANQR?',
      paragraphs: ['ANQR (uttalas "ankare") är en gratis QR-kodgenerator som skapar skanningsbara koder för webbadresser, text, Wi-Fi-uppgifter, kontaktkort, kalenderhändelser och mer.', 'Det är byggt för privatpersoner, småföretag, marknadsförare och utvecklare som vill ha kraftfulla QR-verktyg utan att registrera sig. Den klient-första designen innebär att QR-koder genereras lokalt i din webbläsare som standard, med ett valfritt server-API för professionell inbäddning och integration.'],
    },
    {
      heading: 'Nyckelfunktioner',
      bullets: ['Generera QR-koder direkt i din webbläsare - inget konto krävs.', 'Anpassa färger, modulstilar, sökmönster och lägg till bildöverlägg.', 'Exportera i flera format: PNG, SVG, WebP och animerad GIF.', 'Avancerade kontroller för felkorrigeringsnivå, QR-version, kodningsläge och maskval.', 'Skanningssäkerhetsvägledning och liveförhandsgranskning för att hjälpa till att hålla koder läsbara i tryck och på skärmar.', 'Server-side API för professionell inbäddning med fullt parameterstöd.', 'Fungerar offline när den väl laddats - det är en statisk webbapp som du kan köra var som helst.'],
    },
    {
      heading: 'Hur ANQR fungerar',
      paragraphs: ['ANQR körs i din webbläsare och kodar din inmatning till en standard QR-matris med Reed–Solomon-felkorrigering, och återger den sedan till det format du väljer.', 'Som standard sker generering lokalt i din webbläsare. För professionellt bruk kan du också använda API:et på serversidan för att generera QR-koder via URL-parametrar - perfekt för inbäddning i webbplatser, e-postmeddelanden eller automatiserade arbetsflöden.', 'När du lägger till överlägg eller animeringar balanserar ANQR styling med skanningstillförlitlighet så att resultatet förblir skanningsbart.', 'ANQR fokuserar på statiska koder (data finns inuti QR). Om du behöver en dynamisk kod (redigerbar destination) kan du koda din egen omdirigerings-URL eller kort länk.'],
    },
    {
      heading: 'Vem driver ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklam och hur vi håller oss fria',
      paragraphs: ['ANQR är gratis att använda och stöds av reklam. Vi kan visa annonser via Google AdSense och/eller andra annonspartners.', 'Annonsleverantörer kan använda cookies eller liknande tekniker för att anpassa annonser baserat på dina intressen och surfaktivitet. Du kan hantera annonspreferenser i dina enhetsinställningar och via Googles annonsinställningar, och läs mer i vår sekretesspolicy.', 'Vi säljer inte innehållet du kodar till QR-koder. Annonser hjälper till att täcka kostnaderna för att driva och förbättra projektet.'],
    },
    {
      heading: 'Öppna standarder',
      paragraphs: ['ANQR genererar QR-koder baserade på ISO/IEC 18004-standarden och syftar till bred kompatibilitet mellan skannrar, kameror och utskriftsarbetsflöden.'],
    },
    {
      heading: 'Varumärkesmeddelande',
      paragraphs: ['QR Code® är ett registrerat varumärke som tillhör DENSO WAVE INCORPORATED. ANQR är inte anslutet till, godkänt av eller sponsrat av DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Feedback och bidrag',
      paragraphs: ['Vi välkomnar feedback, buggrapporter och funktionsförslag. Vänligen kontakta oss via e-post eller kontaktsidan - vi läser alla meddelanden, även om svarstider kan variera.'],
    },
  ],
};

export default about;
