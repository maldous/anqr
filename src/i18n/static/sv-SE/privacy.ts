import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Sekretesspolicy',
  description: 'Information som ANQR samlar in, hur den används och dina rättigheter enligt tillämpliga integritetslagar.',
  lastUpdated: '1 februari 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Användarvillkor', type: 'external' }],
  sections: [
    {
      heading: 'Sammanfattning',
      paragraphs: ['ANQR är en QR-kodgenerator med ett klient-första tillvägagångssätt. Vi kräver inte att du skapar ett konto. Som standard genereras QR-koder lokalt i din webbläsare – vi har inte tillgång till innehållet du kodar.', 'För professionellt bruk tillhandahåller ANQR ett API på serversidan som genererar QR-koder från URL-parametrar. När du använder API:t bearbetas ditt QR-innehåll på våra servrar för att rendera bilden, men det lagras eller loggas inte.', 'Vi använder Google AdSense för annonsering och kan använda analystjänster. Dessa tjänster samlar in information genom cookies och liknande tekniker. Denna policy förklarar vilken data som samlas in, hur den används och dina rättigheter.'],
    },
    {
      heading: 'Information vi samlar in',
      bullets: ['Information du tillhandahåller: Om du kontaktar oss via e-post eller vårt kontaktformulär, samlar vi in ditt namn, din e-postadress och ditt meddelandeinnehåll.', 'Automatiskt insamlad information: Vår värdleverantör (Netlify), annonspartners och analystjänster kan samla in: IP-adress, webbläsartyp och version, operativsystem, enhetstyp, hänvisnings-URL, besökta sidor, tid på plats och ungefärlig geografisk plats.', 'Tredjepartscookies: Våra annonspartners (Google AdSense) använder cookies och liknande tekniker för att visa och mäta annonser. ANQR själv ställer inte in några förstapartscookies.'],
    },
    {
      heading: 'Cookies och tredjepartsteknologier',
      paragraphs: ['ANQR sätter inga förstapartscookies. Dina inställningar (som mörkt läge) lagras lokalt på din enhet, som inte överförs till någon server.', 'Våra annonspartners (Google AdSense) och värdleverantör kan dock använda cookies och liknande spårningstekniker:'],
      bullets: ['Annonscookies (tredje part): Ställs in av Google AdSense och annonspartners för att visa relevanta annonser, mäta annonsresultat och förstå användarnas intressen. Dessa cookies kan spåra din aktivitet på olika webbplatser.', 'Analytics-cookies (tredje part): Kan användas av vår värdleverantör eller analystjänster för att samla in anonymiserad användningsdata.'],
    },
    {
      heading: 'Google AdSense och reklam',
      paragraphs: ['Vi visar annonser via Google AdSense. Google och dess partner använder cookies för att visa annonser baserade på din webbhistorik på denna webbplats och andra webbplatser (intressebaserad reklam).', 'Lär dig hur Google använder din information: https://policies.google.com/technologies/partner-sites', 'Hantera annonsanpassning: https://adssettings.google.com', 'Välj bort via Network Advertising Initiative: https://optout.networkadvertising.org', 'Välj bort via Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Hur vi använder information',
      bullets: ['För att svara på dina frågor och ge support.', 'För att visa relevanta annonser genom våra annonspartners.', 'För att analysera webbplatsanvändning och förbättra våra tjänster.', 'För att upptäcka, förhindra och åtgärda bedrägeri, missbruk och säkerhetsproblem.', 'För att följa rättsliga skyldigheter.'],
    },
    {
      heading: 'Tredjepartstjänster',
      bullets: ['Google AdSense: Tar emot data för att visa och mäta annonser.', 'Analytics-leverantörer: Ta emot anonymiserad användningsdata.', 'Netlify (hosting): Behandlar förfrågningar och kan logga IP-adresser.', 'Vi säljer inte dina personuppgifter. Men att dela data med annonspartners kan betraktas som en "försäljning" enligt CCPA (se nedan).'],
    },
    {
      heading: 'Datalagring',
      bullets: ['Kontaktuppgifter: Upp till 2 år.', 'Serverloggar: Upp till 30 dagar (värdleverantör).', 'Analysdata: Upp till 26 månader (anonymiserad).', 'Annonscookies: Normalt 13 månader (varierar beroende på partner).'],
    },
    {
      heading: 'Dina rättigheter enligt GDPR (EES-användare)',
      paragraphs: ['Om du befinner dig i Europeiska ekonomiska samarbetsområdet har du följande rättigheter enligt den allmänna dataskyddsförordningen:'],
      bullets: ['Rätt till åtkomst: Begär en kopia av personuppgifter vi har om dig.', 'Rätt till rättelse: Begär rättelse av felaktiga uppgifter.', 'Rätt till radering: Begär radering av dina uppgifter ("rätten att bli glömd").', 'Rätt att begränsa behandlingen: Begär begränsningar för hur vi använder dina uppgifter.', 'Rätt till dataportabilitet: Begär dina data i ett portabelt format.', 'Rätt till invändning: Invändning mot behandling, inklusive för direktmarknadsföring.', 'Rätt att återkalla samtycke: Återkalla samtycke när som helst där behandlingen är samtyckesbaserad.', 'Rätt att lämna in ett klagomål: Lämna in ett klagomål till din dataskyddsmyndighet.'],
    },
    {
      heading: 'GDPR rättslig grund',
      paragraphs: ['Vi behandlar data på dessa baser: (a) Samtycke - för personlig reklam (hanteras av våra reklampartner); (b) Legitima intressen - för analys, säkerhet och förbättring; (c) Kontrakt - för att svara på förfrågningar.', 'För att utöva dina rättigheter, kontakta email@anqr.link. Vi svarar inom 30 dagar.'],
    },
    {
      heading: 'Dina rättigheter enligt CCPA (Kalifornienanvändare)',
      bullets: ['Rätt att veta: Begär information om insamlade data, källor, syften och tredje part.', 'Rätt att radera: Begär radering av dina personuppgifter.', 'Rätt att välja bort: Välj bort "försäljning" av personlig information (delning med annonspartners kan kvalificera sig).', 'Rätt till icke-diskriminering: Vi kommer inte att diskriminera för att utöva dina rättigheter.'],
    },
    {
      heading: 'CCPA-kategorier insamlade',
      paragraphs: ['Kategorier: Identifierare (IP-adress, enhets-ID), Internetaktivitet (surfning, annonsinteraktioner), Geolokalisering (ungefärlig), slutsatser (intressen från surfning).', 'För att utöva rättigheter eller välja bort: email@anqr.link eller justera cookie-inställningar.'],
    },
    {
      heading: 'Internationella överföringar',
      paragraphs: ['Din information kan överföras till länder med olika dataskyddslagar, inklusive USA. Vi använder lämpliga skyddsåtgärder såsom standardavtalsklausuler.'],
    },
    {
      heading: 'Barns integritet',
      paragraphs: ['ANQR riktar sig inte till barn under 13 år (eller 16 år inom EES). Vi samlar inte medvetet in data från barn. Kontakta email@anqr.link om du tror att ett barn har lämnat information.'],
    },
    {
      heading: 'Säkerhet',
      paragraphs: ['Vi använder lämpliga tekniska och organisatoriska åtgärder för att skydda data, inklusive HTTPS-kryptering. Ingen internetöverföring är dock 100 % säker.'],
    },
    {
      heading: 'Spåra inte',
      paragraphs: ['Vi respekterar inte spåra webbläsarsignaler där det är möjligt, även om reklampartner kanske inte svarar på DNT.'],
    },
    {
      heading: 'Ändringar av denna policy',
      paragraphs: ['Vi kan uppdatera denna policy med jämna mellanrum. Datumet "Senast uppdaterad" anger den senaste versionen. Betydande förändringar kan kommuniceras via en webbplatsbanner.'],
    },
    {
      heading: 'Kontakta oss',
      paragraphs: ['För integritetsfrågor eller för att utöva dina rättigheter: email@anqr.link eller använd vår kontaktsida. Vi svarar på integritetsförfrågningar inom 30 dagar.'],
    },
    {
      heading: 'Fullständig sekretesspolicy',
      paragraphs: ['Den här sidan ger en sammanfattning av vår sekretesspraxis. För den fullständiga, juridiskt bindande integritetspolicyn med fullständig information om databehandling, dina rättigheter och våra skyldigheter enligt GDPR, CCPA och andra integritetslagar, vänligen se vår fullständiga policy som tillhandahålls av iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Se hela sekretesspolicyn på iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
