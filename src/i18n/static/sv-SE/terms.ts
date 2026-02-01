import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Användarvillkor',
  description: 'Genom att gå in på eller använda webbplatsen samtycker du till att vara bunden av dessa villkor.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Sekretesspolicy', type: 'external' }],
  sections: [
    {
      heading: 'Godkännande av villkor',
      paragraphs: ['Genom att komma åt eller använda ANQR (anqr.link) samtycker du till att vara bunden av dessa användarvillkor och vår integritetspolicy. Om du inte godkänner dessa villkor, använd inte webbplatsen.', 'Vi kan komma att uppdatera dessa villkor då och då. Fortsatt användning av webbplatsen efter ändringar utgör godkännande av de nya villkoren.'],
    },
    {
      heading: 'Behörighet',
      paragraphs: ['Du måste vara minst 13 år för att använda ANQR. Genom att använda webbplatsen intygar du att du uppfyller detta ålderskrav. Om du är under 18 år intygar du att du har din förälders eller vårdnadshavares tillstånd att använda webbplatsen.'],
    },
    {
      heading: 'Tillåten användning',
      paragraphs: ['Du får endast använda ANQR för lagliga ändamål. Du är ensam ansvarig för innehållet du kodar till QR-koder och för hur du använder eventuella QR-koder du genererar.'],
    },
    {
      heading: 'Förbjudet beteende',
      paragraphs: ['Du samtycker till att inte:'],
      bullets: ['Använd ANQR för att skapa QR-koder som underlättar nätfiske, spridning av skadlig programvara, bedrägerier, bedrägerier, trakasserier, ärekränkning eller annan olaglig aktivitet.', 'Koda innehåll som gör intrång i immateriella rättigheter, kränker integriteten eller innehåller olagligt material.', 'Försök att störa, överbelasta eller störa driften eller säkerheten på webbplatsen.', 'Reverse engineering, dekompilera eller försök att extrahera källkod från webbplatsen.', 'Använd automatiserade verktyg (bots, skrapor) för att komma åt webbplatsen på ett sätt som försämrar prestanda för andra användare.', 'Omgå eller inaktivera alla säkerhets- eller åtkomstkontrollfunktioner.', 'Utge sig för att vara någon person eller enhet eller ge en felaktig bild av din tillhörighet.'],
    },
    {
      heading: 'Immateriella rättigheter',
      paragraphs: ['Du behåller äganderätten till innehållet du kodar till QR-koder. ANQR gör inte anspråk på äganderätten till dina uppgifter.', 'ANQR-namnet, logotypen, gränssnittsdesignen och den underliggande koden skyddas av upphovsrätt, varumärken och andra immateriella lagar. Du får inte kopiera, modifiera, distribuera eller skapa härledda verk utan vårt tillstånd.', 'QR Code® är ett registrerat varumärke som tillhör DENSO WAVE INCORPORATED. ANQR är inte anslutet till DENSO WAVE.'],
    },
    {
      heading: 'Användarinnehållslicens',
      paragraphs: ['Genom att använda ANQR ger du oss inga rättigheter till ditt innehåll. När du använder lokal generering (standard), sker all QR-kodgenerering i din webbläsare och vi kommer inte åt, lagrar eller överför dina kodade data.', 'När du använder API:et på serversidan bearbetas ditt innehåll för att generera QR-bilden, men det lagras, loggas eller används inte för något annat ändamål än att rendera den begärda bilden.'],
    },
    {
      heading: 'Tredjepartstjänster och reklam',
      paragraphs: ['Webbplatsen visar annonser via Google AdSense och kan innehålla länkar till tredje parts webbplatser. Vi är inte ansvariga för tredjepartsinnehåll, tjänster eller sekretesspraxis.', 'Dina interaktioner med annonsörer och tredje parter är enbart mellan dig och dem. Se vår integritetspolicy för information om praxis för reklamdata.'],
    },
    {
      heading: 'Friskrivning från garantier',
      paragraphs: ['ANQR TILLHANDAHÅLLS PÅ EN "I BEFINTLIGT SKICK" OCH "SOM TILLGÄNGLIG" UTAN GARANTIER AV NÅGOT SLAG, UTTRYCKTA ELLER UNDERFÖRSTÅDDA, INKLUSIVE MEN INTE BEGRÄNSADE TILL UNDERFÖRSTÅDDA GARANTIER OM SÄLJBARHET, LÄMPLIGHET FÖR NÅGOT PARTIKEL.', 'Vi garanterar inte att: (a) webbplatsen kommer att vara oavbruten, säker eller felfri; (b) QR-koder skannar i alla miljöer, på alla enheter eller med alla skannerapplikationer; (c) webbplatsen uppfyller dina krav.', 'Du bör alltid testa QR-koder under de förhållanden där de kommer att användas (utskriftsstorlek, belysning, skärmtyp, avstånd, kamerakvalitet).'],
    },
    {
      heading: 'Ansvarsbegränsning',
      paragraphs: ['I DEN MAXIMALA OMFATTNING SOM TILLÅTS AV LAGEN, SKA ANQR OCH DESS operatörer, dotterbolag OCH LICENSGIVARE INTE VARA ANSVARIGA FÖR NÅGON DIREKTA, INDIREKTA, OAVSIKTLIGA, SÄRSKILDA, FÖLJDSKADA, STRAFFANDE ELLER EXEMPLARISKA SKADOR FÖR OKOMMANDE SKADOR. FÖRLUST AV VINST, INTÄKTER, DATA, GOODWILL, ANVÄNDNING ELLER ANDRA IMMATERIELLA FÖRLUSTER, SOM UTSÄTTS FRÅN ELLER RELATERADE TILL DIN ÅTKOMST TILL ELLER ANVÄNDNING AV (ELLER OFÖJLIGHET ATT ÅTKOMMA ELLER ANVÄNDA) TJÄNSTEN.', 'DU FÖRSTÅR OCH GODKÄNNER UTTRYCKLIGEN ATT DIN ANVÄNDNING AV TJÄNSTEN SKER PÅ EGEN RISK. TJÄNSTEN TILLHANDAHÅLLS GRATIS, OCH DÄRFÖR SAMTYCKER DU ATT ANQR OCH DESS operatörer INTE SKA HA INGEN ANSVAR MOT DIG FÖR NÅGRA SKADA ELLER FÖRLUST. UNDER INGA OMSTÄNDIGHETER SKA VÅRT TOTALA SAMLADE ANSVAR ÖVERSTIGA NOLL DOLLAR ($0 AUD).', 'DU GODKÄNNER ATT FRÄPLA, AVSÄKTA OCH AVKRYTA ALLA ANSVAR, KRAV OCH ÅTGÄRDER MOT ANQR OCH DESS OPERATÖRER SOM HELST VID DIN ANVÄNDNING AV TJÄNSTEN.', 'VISSA JURISDIKTIONER TILLÅTER INTE UNDANTAG AV VISSA GARANTIER ELLER ANSVARSBEGRÄNSNINGAR. I SÅDANA JURISDIKTIONER SKA VÅRT ANSVAR BEGRÄNSAS TILL DEN MAXIMALA OMFATTNING SOM TILLÅTS ENLIGT TILLÄMPLIG LAG.'],
    },
    {
      heading: 'Ersättning',
      paragraphs: ['Du samtycker till att gottgöra, försvara och hålla ANQR, dess operatörer, dotterbolag och deras respektive tjänstemän, direktörer, anställda och agenter skadeslösa från alla anspråk, skador, förluster, skulder, kostnader och utgifter (inklusive juridiska avgifter) som uppstår från: (a) din användning av webbplatsen; (b) ditt brott mot dessa villkor; (c) ditt brott mot tredje parts rättigheter; (d) allt innehåll som du kodar till QR-koder.'],
    },
    {
      heading: 'Tvistlösning',
      paragraphs: ['Varje tvist som uppstår från dessa villkor eller din användning av ANQR ska först försöka lösas genom informella förhandlingar genom att kontakta email@anqr.link.', 'Om den informella lösningen misslyckas, ska tvister lösas genom bindande skiljedomsförfarande i Victoria, Australien, förutom att endera parten kan begära föreläggande i domstol för kränkningar av immateriella rättigheter.'],
    },
    {
      heading: 'Avstående från grupptalan',
      paragraphs: ['I DEN UTSTRÄCKNING LAG TILLÅTER, GODKÄNNER DU ATT EVENTUELLA TvistLÖSNINGSFÖRFARANDEN ENDAST KOMMER ATT GÖRAS PÅ EN INDIVIDUELL BAS OCH INTE I EN KLASS, KONSOLIDERAD ELLER REPRESSENTIV ÅTGÄRD.'],
    },
    {
      heading: 'Gällande lag',
      paragraphs: ['Dessa villkor styrs av lagarna i Victoria, Australien, utan hänsyn till lagkonfliktprinciper. Du samtycker till den exklusiva jurisdiktionen för domstolarna i Victoria, Australien.'],
    },
    {
      heading: 'Förändringar och tillgänglighet',
      paragraphs: ['Vi kan ändra, stänga av eller avbryta webbplatsen (eller någon del av den) när som helst utan förvarning eller ansvar.', 'Vi kan uppdatera dessa villkor när som helst. Datumet "Senast uppdaterad" anger när de senast reviderades. Fortsatt användning efter ändringar utgör godkännande.'],
    },
    {
      heading: 'Avskiljbarhet',
      paragraphs: ['Om någon bestämmelse i dessa villkor anses ogiltig eller omöjlig att verkställa, kommer den bestämmelsen att upprätthållas i den maximala tillåtna omfattningen, och de återstående bestämmelserna kommer att förbli i full kraft och effekt.'],
    },
    {
      heading: 'Avstående',
      paragraphs: ['Vår underlåtenhet att upprätthålla någon rättighet eller bestämmelse i dessa villkor ska inte betraktas som ett avstående från sådan rättighet eller bestämmelse.'],
    },
    {
      heading: 'Hela avtalet',
      paragraphs: ['Dessa villkor, tillsammans med vår integritetspolicy, utgör hela avtalet mellan dig och ANQR angående din användning av webbplatsen och ersätter alla tidigare avtal.'],
    },
    {
      heading: 'Force majeure',
      paragraphs: ['Vi ska inte hållas ansvariga för eventuella misslyckanden eller förseningar i prestanda på grund av omständigheter utanför vår rimliga kontroll, inklusive naturkatastrofer, krig, terrorism, upplopp, statliga åtgärder eller fel på internet/infrastruktur.'],
    },
    {
      heading: 'Kontakta',
      paragraphs: ['Frågor om dessa villkor kan skickas till: email@anqr.link'],
    },
  ],
};

export default terms;
