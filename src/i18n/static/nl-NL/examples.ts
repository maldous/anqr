import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR Voorbeelden',
  description: 'Vijf praktijkvoorbeelden in productiestijl die laten zien waar QR-codes meetbare waarde creëren: het opwaarderen van een oude toonbankcode, merkgerelateerde retailbetalingen en \'scan-to\'-acties, printschaling van flyers naar billboards, geanimeerde QR voor digitale signage en grensoverschrijdende samenwerking met behulp van deelbare ankerlinks. Elk voorbeeld bevat afbeeldingen, praktische beperkingen en een remixlink terug naar de generator.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open de generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Blader door artikels', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'De volledige gebruikershandleiding openen', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Case Study: Retail Counter QR Uplift',
      paragraphs: ['Dit real-world voorbeeld volgt een klein café dat al drie jaar dezelfde QR code op hun toonbank gebruikt. De originele code werd snel gegenereerd tijdens de pandemie rush, gedrukt op standaard papier, en gleed uit in een plastic standaard. Het werkte - technisch gezien - maar klanten hadden vaak meerdere pogingen nodig om het te scannen, en het deed niets om de zorgvuldig gemaakte merkidentiteit van het café te versterken.', 'The transformation began with a simple audit: the existing code encoded the café\'s online menu URL, which they wanted to keep. The challenge was making the QR feel like part of the café experience rather than an afterthought utility from 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Een verweerde QR-code in een kunststof standaard met zichtbare slijtage, vingerafdrukken en vervaagde afdrukken',
          caption: 'Het uitgangspunt: na drie jaar balieservice was de originele QR nauwelijks meer functioneel',
        },
      ],
    },
    {
      heading: 'Diagnose van de problemen van de oorspronkelijke code',
      paragraphs: ['Het testen bracht meerdere problemen aan het licht: de originele code gebruikte Foutcorrectie L (minimum redundantie), had een rustige zone van slechts 2 modules, en werd afgedrukt bij lage resolutie. Onder de warme wolfraam verlichting van het café, de reeds gefade zwarte modules nauwelijks contrasteerde met het gele papier. Oudere telefoons worstelde; nieuwere telefoons slaagden maar met merkbare vertraging.', 'Naast technische kwesties, de generieke zwart-wit vierkant communiceerde niets over het merk. Klanten aarzelden alvorens te scannen - een subtiele vertrouwensbarrière die de betrokkenheid met het zorgvuldig ontworpen digitale menu van het café verminderde.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Een kenmerkende overlay die de technische tekortkomingen van de oorspronkelijke QR toont: lage ECC, minimale rustige zone, slecht contrast',
          caption: 'Technische analyse die onthult waarom de legacy code onderging in reële omstandigheden',
        },
      ],
    },
    {
      heading: 'Het upliftproces',
      paragraphs: ['Met behulp van ANQR heeft de café eigenaar de code opnieuw gecreëerd met de identieke menu-URL maar drastisch verbeterde instellingen: Foutcorrectie H voor maximale veerkracht, een 6-module rustige zone voor betrouwbare grensdetectie, en merkkleuren (diepe bordeaux modules op crème achtergrond) die overeenkomen met het interieurpalet van het café.', 'Er werd een kleine middenoverlay met het logo van het café toegevoegd, die bewust subtiel werd gehouden om de scanbaarheid te behouden en toch onmiddellijke merkherkenning te bieden. Safety Mode confirmed the new design scanned reliably across test devices before any printing.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'De ANQR interface toont de configuratie: merkkleuren, passende ECC, royale rustige zone, subtiele logo-overlay',
          caption: 'Bouwen van de verbeterde configuratie: elke instelling gekozen om merkexpressie in evenwicht te brengen met scan betrouwbaarheid',
        },
      ],
    },
    {
      heading: 'Meetbare resultaten',
      paragraphs: ['After deploying the new QR on professional matte-laminated card stock, the café tracked results over four weeks. Scan success rate improved from an estimated 70% to near-100%. Average scan time dropped from 3-4 seconds to under 1 second. Most significantly, menu engagement increased 40% - customers who previously glanced at the QR and gave up were now scanning confidently.', 'Het personeel meldde minder vragen van klanten over \'hoe de QR te gebruiken\' en geen gevallen meer van het handmatig typen van de URL voor gefrustreerde klanten. Het merkuiterlijk leidde ook tot gesprekken, waarbij klanten positief reageerden op het samenhangende ontwerp.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A voor/na vergelijking met metrics: scan succespercentage, gemiddelde scantijd, en wekelijkse scan aantal verbeteringen',
          caption: 'Vier weken aan gegevens die de meetbare impact van een attente QR uplift tonen',
        },
      ],
    },
    {
      heading: 'Deze configuratie opnieuw aanmaken',
      paragraphs: ['De configuratie van het café toont conservatief maar effectief brandmerken: Foutcorrectie H, 6-module rustige zone, high-contrast merk kleuren, en een minimale centrum overlay. Deze balans werkt voor de meeste retail counter toepassingen waar betrouwbaarheid eerst moet komen, maar de aanwezigheid van het merk nog steeds belangrijk.', 'Open de generator met deze instellingen voorgeladen en pas de kleuren en overlay aan uw eigen merk. Het belangrijkste inzicht: verbeteringen van de betrouwbaarheid alleen al kunnen de betrokkenheid drastisch verhogen, zelfs voordat u visuele styling toevoegt.', 'Bekijk de gerelateerde Leergids over het verbeteren van bestaande QR-campagnes voor de volledige methodologie achter deze aanpak.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link naar de generator voorgeconfigureerd met de instellingen van het café voor onmiddellijke aanpassing',
          caption: 'Begin met een bewezen configuratie en pas aan voor uw merk',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Blader door artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Case Study: Multi-Payment Counter Display',
      paragraphs: ['Dit voorbeeld volgt een boetiekkledingwinkel die vijf verschillende QR-codes bij de kassa had verzameld: bankbetalingen, fooien, Instagram, Google-recensies en een wervingslink. Elk werd gegenereerd vanuit een andere bron, op verschillende tijdstippen gedrukt en tentoongesteld in niet-overeenkomende stands. De visuele chaos ondermijnde de zorgvuldig samengestelde esthetiek van de winkel, en het personeel kreeg regelmatig te maken met klanten die de verkeerde code scanden.', 'De oplossing vereist het scheiden van zorgen: betaalcodes vereist maximale betrouwbaarheid met conservatieve styling, terwijl marketingcodes expressiever kunnen zijn. Het uniforme displaysysteem dat ontstond toont aan hoe de aanwezigheid van het merk in evenwicht te brengen met de functionele eisen van verschillende QR use cases.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Een rommelig registergebied met vijf niet-gematchte QR-codes in verschillende stands en drukwerk',
          caption: 'Het chaotische startpunt: vijf losgekoppelde QR codes concurreren om aandacht en veroorzaken klant verwarring',
        },
      ],
    },
    {
      heading: 'Prioritering van de betalingservaring',
      paragraphs: ['De primaire betalingsmethode van de winkel gebruikte een regionale standaard die strikte naleving van de lading vereiste. Test bleek dat zelfs kleine styling beïnvloed scan snelheid met bepaalde banking apps. De beslissing: houd de betaling QR volledig ongewijzigd, behalve voor maatoptimalisatie en professioneel printen op matte kaartvoorraad.', 'Deze conservatieve aanpak zorgde ervoor dat de betalingscode er minder \'merkgebonden\' uitzag dan ideaal, maar de voltooiingspercentages van transacties verbeterden dramatisch. Het inzicht: betaalmomenten zijn geen brandingmogelijkheden, het zijn betrouwbaarheidsmomenten. Klanten waarderen snelheid en zekerheid boven esthetiek als het om geld gaat.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Een schone, grote betaling QR code op professionele matte kaart voorraad, prominent geplaatst in het register',
          caption: 'De betaling QR: formaat royaal, professioneel gedrukt, conservatief vormgegeven voor onmiddellijke erkenning door banking apps',
        },
      ],
    },
    {
      heading: 'Secundaire actieweergave aanmaken',
      paragraphs: ['Voor tips, recensies, sociale, en het huren, de winkel kan meer expressief. Deze codes werden gerecupereerd in ANQR met consistente merkstijlen: de handtekening van de winkel olijfgroen op crème, ronde modulestijl, en een subtiele centrumoverlay met het pictogram van de winkel. Foutcorrectie H zorgde zelfs met de styling voor betrouwbaarheid.', 'Deze vier codes zijn gerangschikt in een merkpaneel naast de betaalcode (niet concurrerend met). Duidelijke labels in de typografie van de winkel legden het doel van elke code uit. De visuele hiërarchie was opzettelijk: de betaling stond op zichzelf en was prominent aanwezig; secundaire acties gegroepeerd als opties.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Een branded panel met vier QR codes voor tips, recensies, social, en verhuur, met duidelijke labels',
          caption: 'Het secundaire actiepaneel: consistente branding, duidelijke etikettering, geplaatst als opties in plaats van afleiding',
        },
      ],
    },
    {
      heading: 'Systeemontwerp weergeven',
      paragraphs: ['Het fysieke display loste meerdere problemen tegelijk op. Zowel de betaalstand als het secundaire paneel gebruikt matte materialen om verblinding van bovenverlichting te elimineren. De hoogtes zijn geoptimaliseerd voor klanten van verschillende grootte. Hoeken gericht op de klant wachtrij in plaats van plat op de teller.', 'Critically, de winkel gemaakt reserve afdrukken van vergrendelde ANQR configuratie links. Toen de tips code uiteindelijk kreeg koffie-splashed, personeel vervangen binnen enkele minuten met behulp van de opgeslagen configuratie - geen screenshots, geen gissen bij instellingen, geen kwaliteitsdegradatie.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Een diagram met de fysieke weergave-indeling: hoogtes, hoeken, materialen en het verband tussen betaling en secundaire displays',
          caption: 'Blauwdruk voor weergavesysteem: fysieke ergonomie geoptimaliseerd voor betrouwbaar scannen op klanthoogte en lichtomstandigheden',
        },
      ],
    },
    {
      heading: 'Operationele verbeteringen',
      paragraphs: ['Zes weken na de implementatie documenteerde de winkel aanzienlijke verbeteringen: nul klachten van klanten over verwarring met \'verkeerde codes\', snellere transactietijden en een drievoudige toename in het aantal ingezonden fooien (klanten konden nu de fooicode vinden en scannen zonder het personeel op onhandige wijze te vragen). Google-recensies namen ook toe naarmate de speciale, goed gelabelde QR de wrijving wegnam.', 'Het trainen van het personeel werd eenvoudiger: \'de betalingscode is de grote, al het andere staat op het paneel.\' Toen betalingsapps werden bijgewerkt en één ervan kortstondig trager scande, zorgde het conservatieve ontwerp van de betalingscode ervoor dat het nog steeds werkte - alleen iets langzamer in plaats van helemaal te falen.', 'Zie de Leergids over QR-codes voor retailbetalingen voor de principes achter dit displaysysteemontwerp.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Een metrics dashboard dat voor/na vergelijkingen toont: verwarringsincidenten, transactietijd, tipfrequentie, beoordelingsinzendingen',
          caption: 'Zes weken operationele gegevens die de bedrijfsimpact aantonen van een doordacht multi-QR-displaysysteem',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Blader door artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Case Study: Van Business Card tot Billboard',
      paragraphs: ['Dit voorbeeld volgt een productiebedrijf voor evenementen dat zich voorbereidt op een grote conferentie. Ze hadden dezelfde QR-code nodig - gekoppeld aan de evenement-app - die in radicaal verschillende formaten werd ingezet: insteekkaarten voor bezoekersbadges (3 cm), tafeltentkaarten (8 cm), bewegwijzering op de registratiebalie (30 cm), bewegwijzeringsposters (60 cm) en een enorme podiumachtergrondbanner (4 meter). Elk formaat had verschillende kijkafstanden, lichtomstandigheden en productieworkflows.', 'De uitdaging was niet alleen technisch, maar ook operationeel. Meerdere leveranciers verzorgden verschillende printopdrachten en het bedrijf moest consistente, scanbare resultaten garanderen, ongeacht wie wat produceerde. Hun oplossing was gericht op SVG-export en rigoureuze overdrachtsdocumentatie.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Een collage met dezelfde QR code in vijf verschillende maten, van badge tot banner',
          caption: 'Eén QR-code, vijf inzetgroottes: de uitdaging om de scannbaarheid van centimeter tot meter te behouden',
        },
      ],
    },
    {
      heading: 'Waarom vorige gebeurtenissen problemen hadden',
      paragraphs: ['Tijdens hun laatste conferentie had het bedrijf pijnlijke mislukkingen meegemaakt. De podiumbanner QR werd gegenereerd als een kleine PNG en opgeschaald in ontwerpsoftware. Het resultaat leek op afstand acceptabel, maar kon niet betrouwbaar worden gescand vanuit het publiek. Badge-QR\'s waren overdreven vormgegeven en te klein, wat bezoekers frustreerde die contacten probeerden toe te voegen. Inconsistente instellingen in verschillende formaten zorgden ervoor dat \'dezelfde\' QR er bij elk stuk anders uitzag.', 'Analyse na de gebeurtenis bracht de hoofdoorzaak aan het licht: er bestond geen enkele bron van waarheid. Elke ontwerper had de QR opnieuw gemaakt met iets andere instellingen, en elke drukwerkleverancier had de bestanden anders verwerkt. De kwaliteit ging achteruit door het telefoonspel van bestandsoverdrachten.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Close-up foto\'s met scanfouten: gepixelde bannermodules, ondermaatse badgecodes, inconsistente styling tussen formaten',
          caption: 'Forensische analyse van eerdere mislukkingen: elk formaat had verschillende kwaliteitsproblemen geïntroduceerd',
        },
      ],
    },
    {
      heading: 'De SVG-eerste workflow',
      paragraphs: ['Voor dit evenement heeft het bedrijf een strikt protocol opgesteld: één master QR gegenereerd in ANQR met optimale instellingen (Foutcorrectie H, royale rustige zone, schone styling), geëxporteerd als SVG, en opgeslagen als de enige gezaghebbende bron. De ANQR configuratie link werd gedocumenteerd naast het SVG bestand zodat de code kan worden geregenereerd indien nodig.', 'Elke ontwerper en leverancier kreeg dezelfde SVG master met expliciete instructies: plaats op de gewenste grootte, niet wijzigen, handhaven rustige zonevrijheid. Voor leveranciers die rasterformaten nodig hebben, verstrekte het bedrijf vooraf gerenderde PNG\'s op specifieke grootte met duidelijke naamgeving conventies die het beoogde gebruik aangeven.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Een bestandspakket met de SVG master, groottespecifieke PNG\'s, specificatiedocument en configuratielink',
          caption: 'Het handoff pakket: alles wat leveranciers nodig hebben om consistente resultaten te produceren zonder te raden',
        },
      ],
    },
    {
      heading: 'Groottespecifieke overwegingen',
      paragraphs: ['Elk formaat vereiste specifieke aandacht. Voor badge-inzetstukken van 3 cm was de QR nodig om de maximaal beschikbare ruimte in beslag te nemen - de scanafstand zou armlengte zijn. Tafeltenten van 8 cm kunnen een decoratieve omlijsting buiten de rustige zone bevatten. Voor de banner van 4 meter was een berekening nodig: vanaf een typische publieksafstand (15-20 meter) moesten de modules duidelijk te onderscheiden zijn door telefooncamera\'s, wat betekende dat de QR minimaal 80 cm binnen het bannerontwerp moest zijn.', 'Het bedrijf creëerde een Size Guide documenteren minimale QR afmetingen voor elke verwachte scanafstand. Dit werd een herbruikbare troef voor toekomstige gebeurtenissen, waardoor giswerk uit het ontwerpproces werd verwijderd.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Een grafiek met de relatie tussen scanafstand, minimale QR-grootte en moduleafmetingen voor elk evenementformaat',
          caption: 'De groottematrix: berekende afmetingen garanderen betrouwbaar scannen op de verwachte kijkafstand van elk formaat',
        },
      ],
    },
    {
      heading: 'Productieresultaten',
      paragraphs: ['De validatie op de conferentiedag was systematisch: het personeel testte elke ingezette QR voordat de deuren opengingen. De badge-inzetstukken worden direct op armlengte gescand. Tafeltenten werkten betrouwbaar in de variabele verlichting van breakout rooms. Het podiumbanner – de schaamte van het vorige evenement – ​​scande met succes vanuit het midden van het publieksgebied.', 'Er werden geen scanklachten geregistreerd bij meer dan 2.000 aanwezigen. De operationele overwinning was even belangrijk: toen voor een last-minute sponsortoevoeging nieuwe bewegwijzering nodig was, genereerde het productieteam deze binnen enkele minuten op basis van de master-SVG, in het vertrouwen dat deze met al het andere zou matchen.', 'Zie de Leergids over printklare QR-codes voor het SVG versus PNG-beslissingskader en best practices voor overdracht.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Evenement fotografie toont bezoekers succesvol scannen QR codes op verschillende groottes en afstanden door de hele locatie',
          caption: 'Succes van de conferentiedag: betrouwbaar scannen in elk formaat, van badge close-ups tot bannerafstandsfoto\'s',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Blader door artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Case Study: Airport Lounge Digital Display',
      paragraphs: ['Dit voorbeeld volgt een lounge van een luchtvaartmaatschappij die statische QR-codes gebruikte op hun digitale welkomstschermen. Op de schermen werd wisselende promotionele inhoud weergegeven, maar de QR-code voor het inchecken in de lounge stond in een hoek, statisch en gemakkelijk over het hoofd te zien. Uit analyses bleek dat slechts 15% van de in aanmerking komende gasten de QR-check-in gebruikte, ondanks dat deze sneller was dan de wachtrij bij de balie. De meeste gasten merkten het gewoon niet.', 'De hypothese was simpel: in een visueel drukke omgeving met bewegende inhoud wordt een statische QR onzichtbaar. De oplossing moest de QR zichtbaar maken zonder afbreuk te doen aan de betrouwbaarheid die nodig is voor een check-instroom waarbij falen gefrustreerde reizigers en langere wachtrijen bij de balie zou betekenen.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Een digitaal display in een luchthaven lounge met promotionele inhoud met een kleine, statische QR code in de hoek',
          caption: 'De oorspronkelijke opzet: een statische QR verloren in een zee van dynamische promotionele inhoud, het bereiken van slechts 15% adoptie',
        },
      ],
    },
    {
      heading: 'Het ontwerpen van veilige animatie',
      paragraphs: ['De digitale bewegwijzering van de lounge gebruikte grote LED-panelen - een uitdagende omgeving waar agressieve animatie scanproblemen kan veroorzaken. Het ontwerpteam begon conservatief: een zacht pulseffect dat subtiel uitbreidde en de visuele aanwezigheid van de QR samentrok zonder de eigenlijke codestructuur te wijzigen. Frame timing werd ingesteld langzaam (250m) om eventuele flikkerende problemen met de LED refresh rate te voorkomen.', 'Veiligheidsmodus validatie bevestigd elk frame bleef scannable. Aanvullende tests op de werkelijke LED-panelen toonden aan dat de puls nog subtieler dan desktop previews voorgesteld - LED helderheid en kijkhoeken beïnvloed waargenomen contrast meer dan verwacht.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Het ANQR animatie paneel met pulsconfiguratie: langzame timing, subtiele intensiteit, veiligheidsmodus ingeschakeld',
          caption: 'Animatieconfiguratie: parameters ingesteld voor LED-paneelweergave terwijl de scan betrouwbaarheid in elk frame behouden',
        },
      ],
    },
    {
      heading: 'Integratie met Signage Content',
      paragraphs: ['De geanimeerde QR werd in een speciale \'stabiele zone\' van de schermindeling geplaatst - een gebied dat constant bleef terwijl de promotionele inhoud in het hoofdweergavegebied roteerde. Deze scheiding was cruciaal: de QR had visuele stabiliteit nodig om te kunnen scannen, zelfs terwijl hij de aandacht trok door zijn subtiele animatie.', 'Naast de QR is een duidelijke call-to-action toegevoegd: \'Sla de wachtrij over - scan om in te checken.\' De tekst bleef statisch terwijl de QR pulseerde, waardoor een visuele hiërarchie ontstond die de aandacht naar de scanmogelijkheid trok zonder de promotionele inhoud te overweldigen.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Een schermindelingsdiagram met de geanimeerde QR in een stabiele zone terwijl promotionele inhoud draait in het hoofdgebied',
          caption: 'Screen vastgoed allocatie: de geanimeerde QR bezet een stabiele zone gescheiden van roterende promotionele inhoud',
        },
      ],
    },
    {
      heading: 'Technische invoering',
      paragraphs: ['De geanimeerde QR werd geëxporteerd als een GIF met geoptimaliseerde instellingen voor de signage CMS. File size overwegingen belangrijk - de lounge\'s content management systeem had upload limieten, en overdreven grote bestanden veroorzaakt afspelen stotteren. De uiteindelijke export van evenwichtige visuele kwaliteit tegen bestandsgrootte door het kleurenpalet te beperken en het aantal frames te optimaliseren.', 'Deployment omvatte een terugval: als de GIF niet om welke reden dan ook kon spelen, zou het bewegwijzeringssysteem een statische PNG-back-up weergeven. Deze redundantie zorgde ervoor dat check-in vermogen nooit verloren als gevolg van technische problemen met de animatie.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Een CMS-interface die de geanimeerde QR-upload met fallback statische afbeelding geconfigureerd toont',
          caption: 'Signage CMS configuratie: geanimeerde primaire met statische terugval ervoor zorgen dat check-in mogelijkheid nooit wordt onderbroken',
        },
      ],
    },
    {
      heading: 'Gemeten effect',
      paragraphs: ['Na een maand gebruik steeg de acceptatie van QR-check-in van 15% naar 24% - een relatieve verbetering van 60%. Uit gastfeedbackonderzoeken bleek dat de geanimeerde QR \'makkelijker op te merken was\' en \'moderner aanvoelde\'. De wachtrijtijden bij de balie namen tijdens piekperioden meetbaar af, omdat meer gasten zelfbediening via de QR verrichtten.', 'Belangrijk is dat er ondanks duizenden dagelijkse scans geen enkele scanfout werd gemeld. De conservatieve animatiebenadering had het aandachtsdoel bereikt zonder in te boeten aan de betrouwbaarheid die een check-in-stroom vereiste. De lounge rolde vervolgens soortgelijke geanimeerde QR\'s uit naar hun andere locaties.', 'Zie de Leergids over geanimeerde QR-codes voor digitale signage voor de technische principes achter veilig animatieontwerp.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Een dashboard met verhoging van de adoptiesnelheid, vermindering van de wachtrijtijd en betrouwbaarheid van de nulfaillissementsscan gedurende de inzetperiode',
          caption: 'Een maand van gegevens: 60% adoptie verhoging, verminderde wachtrij tijden, en gehandhaafd perfecte scan betrouwbaarheid',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Blader door artikels',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Case Study: Global Product Launch QR Campaign',
      paragraphs: ['Dit voorbeeld volgt een consumentenelektronicabedrijf dat tegelijkertijd een nieuw product lanceert in 12 markten in 8 talen. Elk regionaal marketingteam moest verpakkings-, winkel- en promotiemateriaal produceren met QR-codes die gekoppeld zijn aan gelokaliseerde productpagina\'s. Eerdere lanceringen hadden geresulteerd in inconsistente QR styling, af en toe scannen mislukkingen, en een \'telefoonspel\' van configuratie drift als elk team opnieuw codes gemaakt van screenshots.', 'De oplossing maakte gebruik van de gedeelde configuratielinks van ANQR om één enkele bron van waarheid te creëren die elk regionaal team kon benaderen, ongeacht hun interfacetaal. De QR payload gebruikte een slimme redirect die gebruikerstaal detecteren, dus een code werkte wereldwijd terwijl het leveren van lokale ervaringen.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Een wereldkaart met 12 marktlocaties met QR-codes, sommige visueel inconsistent met elkaar',
          caption: 'De uitdaging: 12 markten, 8 talen en een geschiedenis van inconsistente QR-implementaties in regio\'s',
        },
      ],
    },
    {
      heading: 'De masterconfiguratie instellen',
      paragraphs: ['Het wereldwijde merkteam creëerde de gezaghebbende QR-configuratie in ANQR: merkkleuren die overeenkomen met de visuele identiteit van de productlijn, Error Correction H voor betrouwbaarheid in alle gedrukte en digitale toepassingen, en een styling die consistent reproduceert, ongeacht de lokale productiemethoden. De configuratie was vergrendeld en de deellink werd gedocumenteerd in de algemene campagnebriefing.', 'Kritiek, de gecodeerde URL gebruikt een taal-detecting redirect service. Bij het scannen werden gebruikers automatisch doorgestuurd naar hun lokale taalproductpagina. Dit betekende dat alle 12 markten identieke QR-codes konden gebruiken - geen variaties per marktlading die fouten konden introduceren.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'De ANQR interface toont de master configuratie met merkkleuren, ECC H en de smart redirect URL',
          caption: 'De masterconfiguratie: wereldwijde merkstandaarden gecodeerd in één enkele, gedeelde bron van waarheid',
        },
      ],
    },
    {
      heading: 'Regionale teamworkflow',
      paragraphs: ['Elk regionaal marketingteam ontving de configuratielink met eenvoudige instructies: open de link, verifieer de preview overeenkomstig de merkrichtlijnen, exporteer in het gewenste formaat voor uw toepassing. De ANQR-interface die in de taal van elk team wordt weergegeven, maar de onderliggende QR-instellingen bleven identiek, ongeacht de interfacetaal.', 'Toen het Japanse team SVG nodig had voor high-end retail displays en het Braziliaanse team PNG nodig had voor social media, beide geëxporteerd vanuit dezelfde configuratie. Toen de printverkoper van het Duitse team om specifieke kleurwaarden vroeg, konden ze direct naar de configuratie verwijzen in plaats van te raden vanuit een screenshot.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Screenshots met dezelfde configuratieverbinding geopend in Japanse, Portugese en Duitse interfaces',
          caption: 'Zelfde configuratie, verschillende interfaces: regionale teams werken in hun voorkeurstaal met behoud van wereldwijde consistentie',
        },
      ],
    },
    {
      heading: 'Regionale verschillen aanpakken',
      paragraphs: ['Sommige markten vereisten kleine aanpassingen. Het Chinese team had een versie nodig met een WeChat-geoptimaliseerd frame voor sociaal delen. In plaats van de master te wijzigen, creëerden ze een gedocumenteerde variant met een eigen configuratielink, duidelijk aangeduid als \'CN-WeChat variant\' in de campagne activabibliotheek. Hierdoor bleef de traceerbaarheid gehandhaafd en werd de noodzakelijke lokalisatie mogelijk.', 'Het merkteam stelde een eenvoudige regel vast: elke variatie van master vereist een nieuwe, gedocumenteerde configuratielink. Geen wijzigingen aan geëxporteerde bestanden, geen \'quick fixes\' in ontwerpsoftware. Dit voorkwam de configuratie drift die had geplaagd vorige lanceringen.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Een interface van de activabibliotheek met de masterconfiguratie en goedgekeurde regionale varianten, elk met een eigen link',
          caption: 'Campaign asset governance: master configuratie plus gedocumenteerde varianten, allemaal traceerbaar via configuratie links',
        },
      ],
    },
    {
      heading: 'Startresultaten',
      paragraphs: ['Productlanceringsdag zag QR-codes die gelijktijdig op alle 12 markten werden ingezet voor verpakkingen, retaildisplays, eventmaterialen en digitale campagnes. Kwaliteitscontroles bevestigden visuele consistentie tussen regio\'s - de QR op Tokyo retail displays kwamen overeen met de QR op São Paulo verpakking overeen met de QR op Berlijn event banners.', 'Er werden in alle markten nul scanfouten gemeld. Wanneer na de lancering de URL van een productpagina moest worden gewijzigd, handelde de omleidingsservice dit onzichtbaar af - opnieuw afdrukken was niet nodig. Het wereldwijde team schatte dat de configuratielink-aanpak meer dan 40 uur aan coördinatietijd bespaarde in vergelijking met hun vorige lanceringsmethodologie.', 'Zie de Leergids over grensoverschrijdende QR-samenwerking voor de workflowprincipes achter de consistentie van wereldwijde campagnes.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Een raster van foto\'s met consistente QR-implementatie op verschillende markten: Tokyo retail, São Paulo verpakking, Berlijn evenementen',
          caption: 'Wereldwijde consistentie bereikt: identieke QR presentatie op 12 markten ondanks verschillende talen, leveranciers en formaten',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Blader door artikels',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Blader door artikels', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'De volledige gebruikershandleiding openen', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Galerie openen', type: 'gallery' },
  ],
};
