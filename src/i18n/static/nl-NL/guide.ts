import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Gebruikershandleiding ANQR',
  description: 'Volledige handleiding voor het gebruik van ANQR voor het maken van QR codes.',
  lastUpdated: '1 februari 2026',
  breadcrumb: ['Gids'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open de generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Blader door artikels', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Starten',
      paragraphs: [
        'ANQR is een QR-codegenerator met een klantgerichte aanpak. Standaard worden QR-codes lokaal in uw browser gegenereerd - er is geen account vereist en uw gegevens blijven privé. Voor professionele inbedding kunt u ook de server-side API gebruiken.',
        'De interface heeft drie interface niveaus: Basic, Advanced en Professional. Selecteer uw niveau met behulp van de tabbladen in de header. Elk niveau ontgrendelt extra functies terwijl het houden van de interface gericht op wat je nodig hebt.',
      ],
      bullets: [
        'Basis: Eenvoudige QR code creatie met platte tekst/URL inhoud en afbeelding overlay.',
        'Geavanceerd: QR codering opties, rendering stijlen, animatie, output formaten, uitgebreide content types, en overlay aanpassing.',
        'Professioneel: Watermerken, metadata, delen, veiligheidsanalyse, betaling QR codes, en zakelijke functies.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Open de generator', type: 'generator' }],
    },
    {
      heading: 'Snel starten',
      paragraphs: ['Om uw eerste QR-code te maken:'],
      bullets: [
        '1. Selecteer een inhoudstype (URL, tekst, WiFi, enz.) uit de dropdown van Content Type.',
        '2. Voer uw gegevens in in de opgegeven velden.',
        '3. Optioneel aanpassen van kleuren, stijlen, en voeg een overlay afbeelding.',
        '4. Klik op Exporteren om uw QR-code te downloaden als PNG, GIF, WebP of SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Basiskenmerken',
      paragraphs: [
        'Het basisniveau biedt een gestroomlijnde interface voor het maken van QR-codes met payload-inhoud en beeldoverlays. Dit is de eenvoudigste manier om aan de slag te gaan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Inhoudstypen (basic)',
      paragraphs: [
        'Platte tekst: Codeer elke tekst tot aan de capaciteitslimiet van de QR-code. Ideaal voor korte berichten, codes of identificatiegegevens.',
        'URL: Webadressen coderen. De QR-code zal de URL openen bij het scannen. Ondersteunt http:// en https://protocollen.',
      ],
    },
    {
      heading: 'Afbeeldingsoverlay (basic)',
      paragraphs: [
        'Upload een afbeelding (JPG, PNG, GIF, WebP) om te mengen met uw QR-code. Basis overlay functies omvatten:',
      ],
      bullets: [
        'Uploaden van bestand: Selecteer een afbeelding van uw apparaat.',
        'Laad vanaf URL: Voer een afbeeldingsURL in (moet CORS toestaan).',
        'Logo midden: Plaatst afbeelding in het centrum, afhankelijk van foutcorrectie.',
        'Mengen: Eenvoudig alpha mengen van afbeelding met QR patroon.',
        'Intensiteit: regelt hoe sterk de overlay de QR-code beïnvloedt (0-100%).',
        'Kleurmodus: volledige kleur, grijswaarden of zwart-wit.',
        'Zoekpatronen behouden: Houdt hoekpatronen ongewijzigd voor betrouwbaar scannen.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Geavanceerde functies',
      paragraphs: [
        'Het Advanced level ontgrendelt QR coderingsopties, rendering stijlen, animatie, output formaten, uitgebreide content types, en geavanceerde overlay aanpassing.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Instellingen voor QR-codering',
      paragraphs: [
        'Versie: QR codes komen in versies 1-40, met hogere versies met meer gegevens maar groter. Stel in op 0 (Auto) om ANQR de kleinste versie te laten kiezen die bij uw inhoud past.',
        'Foutcorrectie: Bepaalt hoeveel schade een QR-code kan oplopen terwijl het scannable blijft.',
      ],
      bullets: [
        'L (Laag): 7% foutcorrectie - kleinste grootte, minst redundantie.',
        'M (Medium): 15% foutcorrectie - evenwichtige optie.',
        'Q (Quartile): 25% foutcorrectie - goed voor gedrukte codes.',
        'H (Hoog): 30% foutcorrectie - het beste voor codes met overlays of onder zware omstandigheden.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Rustige zone (Margin)',
      paragraphs: [
        'De stille zone is de witte ruimte rond de QR-code. Scanners hebben deze marge nodig om te detecteren waar de code begint. De standaard beveelt minimaal 4 modules aan. Als u de waarde onder de 4 verlaagt, kunnen er scanproblemen optreden.',
      ],
    },
    {
      heading: 'Modulestijl',
      paragraphs: [
        'Modules zijn de afzonderlijke vierkanten die een QR code vormen. ANQR biedt vijf stijlen:',
      ],
      bullets: [
        'Vierkant: Klassieke QR verschijning met scherpe hoeken.',
        'Afgerond: Zachte hoeken voor een vriendelijkere look.',
        'Dots: Circulaire modules voor een moderne esthetiek.',
        'Diamant: 45° gedraaide vierkantjes voor een onderscheidend patroon.',
        'Verbonden: Modules samenvoegen bij aangrenzende, het creëren van organische vormen.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zoekpatroonstijl',
      paragraphs: [
        'Zoekpatronen zijn de drie grote vierkanten in QR hoeken die scanners helpen de code te sturen. Beschikbare stijlen:',
      ],
      bullets: [
        'Vierkant: Standaard vierkante hoeken.',
        'Afgerond: Zachte hoeken bij afgeronde modulestijl.',
        'Cirkel: Circulaire zoekpatronen voor dot-stijl codes.',
      ],
    },
    {
      heading: 'Uitlijnings- en tijdpatronen',
      paragraphs: [
        'Uitlijningspatronen verschijnen in grotere QR-codes (versie 2+) om vervorming te helpen corrigeren. Timing patronen zijn de afwisselende lijnen verbinden vinder patronen.',
      ],
      bullets: [
        'Uitlijningsstijl: Match Finder, Vierkant, Rond of Cirkel.',
        'Timingstijl: Match-module, Effen of Gestreept.',
      ],
    },
    {
      heading: 'Kleuren',
      paragraphs: [
        'Voorgrond: De kleur van de QR-modules. Zwart (#000000) is standaard, maar elke donkere kleur werkt.',
        'Achtergrond: de achtergrondkleur. Wit (#ffffff) is standaard. Zorg voor voldoende contrast met de voorgrond.',
        'Transparante achtergrond: Verwijder de achtergrond volledig voor gebruik op gekleurde oppervlakken. Zorg ervoor dat het oppervlak voldoende contrast biedt.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Modulegrootte & Gap',
      paragraphs: [
        'Modulegrootte: Bepaalt hoe groot elke module in pixels wordt weergegeven. Grotere waarden creëren grotere, gemakkelijker te scannen codes.',
        'Module Gap: Voegt ruimte toe tussen modules als percentage. Kleine hiaten (5-15%) kunnen de scannabiliteit onder bepaalde omstandigheden verbeteren, maar buitensporige hiaten verminderen de betrouwbaarheid.',
      ],
    },
    {
      heading: 'Uitvoerinstellingen',
      paragraphs: ['Formaat: Kies uw exportformaat op basis van use case.'],
      bullets: [
        'PNG: Verliesloos rasterformaat, ideaal voor de meeste toepassingen. Beste voor print en digitaal.',
        'WebP: Modern formaat met kleinere bestandsgroottes. Goed voor webgebruik.',
        'GIF: Vereist voor geanimeerde QR codes. Ondersteunt transparantie.',
        'SVG: Vectorformaat dat oneindig schaalt. Het beste voor grote letters of wanneer u de code moet bewerken.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Uitvoerafmetingen',
      paragraphs: [
        'Breedte/Hoogte: zet de uitvoergrootte in pixels. Voor afdrukken, berekend op basis van DPI (bv. 300 dpi bij 1 inch = 300 px). Grotere maten scannen betrouwbaarder op afstand.',
      ],
    },
    {
      heading: 'Animatieinstellingen (Geavanceerd)',
      paragraphs: ['Bedien geanimeerd QR-codegedrag:'],
      bullets: [
        'Snelheid: Animatie framesnelheid in milliseconden.',
        'Loop: continue of single-play animatie.',
        'Bounce: Ping-pong animatie richting.',
        'Start Frame: Begin met animatie vanuit specifiek frame.',
        'Max Frames: Beperk totale frames in animatie.',
        'Frame Stap: Skip frames voor snellere animatie.',
        'Interpolatie: Geen, Crossfade of Morphing tussen frames.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Inhoudstypen (Geavanceerd)',
      paragraphs: ['Geavanceerd niveau ontgrendelt extra laadvermogensformaten:'],
      bullets: [
        'Telefoonnummer (tel:): Maakt een oproepbare telefoonverbinding aan.',
        'E-mail: Opent e-mail client met optioneel onderwerp en lichaam.',
        'SMS: Voorgevulde sms naar een telefoonnummer.',
        'vCard: Volledige contactkaart met naam, organisatie, telefoon, e-mail, adres.',
        'MeCard: Compact contactformaat populair in Japan.',
        'BizCard: Legacy visitekaartje formaat.',
        'Geolocatie: GPS coördinaten die openen in kaarten.',
        'WiFi: netwerkgegevens voor automatische verbinding (SSID, wachtwoord, beveiligingstype).',
        'Agendanotitie: iCalendar formaat met titel, locatie, datum/tijd.',
        'Event RSVP: Link naar de registratiepagina van het evenement.',
        'Agenda Abonneren: Abonneer u op een ICS/WebCal-feed.',
        'Bestand/Document URL: Directe link naar downloadbare bestanden.',
        'Cloud Storage Link: Links naar Google Drive, Dropbox, OneDrive, enz.',
        'Sociaal profiel: Links naar LinkedIn, Twitter, Instagram, enz.',
        'Messaging Link: WhatsApp, Telegram, Signal diepe links.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Geavanceerde overlay functies',
      paragraphs: ['Extra overlaymogelijkheden:'],
      bullets: [
        'Bijsnijden: Schakel het oogsten in om een vierkant gebied van uw afbeelding te selecteren.',
        'Halftoon: Classic print-stijl stip patroon gebaseerd op de helderheid van de afbeelding.',
        'Dithered: Fout-diffusie dithering voor gedetailleerde reproductie.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overlay mengmodus (Geavanceerd)',
      paragraphs: ['Extra mengmodi in Geavanceerd niveau:'],
      bullets: [
        'Subpixel: Verdeelt elke module in subpixels voor meer detail.',
        'Blauwruis: Gebruikt blauwe ruis dithering voor artefact-vrije patronen.',
        'Mozaïek: Tegel-gebaseerd effect behoud van beeldstructuur.',
        'Gapvulling: Plaatst afbeelding in gaten tussen modules.',
        'Helderheid: Varieert module grootte op basis van afbeelding helderheid.',
        'Duotone: Maps afbeelding op twee kleuren voor opvallend contrast.',
      ],
    },
    {
      heading: 'Overlay intensiteit',
      paragraphs: [
        'Bepaalt hoe sterk de overlay de QR-code beïnvloedt (0-100%). Hogere waarden tonen meer beeld detail, maar kunnen de scannabiliteit verminderen. Start ongeveer 70% en pas aan op basis van testen.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Kleurmodus',
      paragraphs: ['Hoe de afbeelding wordt verwerkt:'],
      bullets: [
        'Volledige kleur: Bewaart originele afbeeldingskleuren.',
        'Grayscale: Converteert naar zwart-witte tonen.',
        'Zwart-wit: Binaire conversie met hoog contrast.',
      ],
    },
    {
      heading: 'Zoekpatronen behouden',
      paragraphs: [
        'Wanneer ingeschakeld, houdt de drie hoekzoeker patronen ongewijzigd door de overlay. Sterk aanbevolen voor betrouwbaar scannen.',
      ],
    },
    {
      heading: 'Beeld Voorbewerking',
      paragraphs: [
        'Filters toepassen op uw overlay-afbeelding alvorens te mengen. Deze aanpassingen kunnen verbeteren hoe de afbeelding verschijnt in de definitieve QR code.',
      ],
      bullets: [
        'Helderheid (-100 tot +100): Maak het beeld lichter of donkerder.',
        'Contrast (-100 tot +100): toonbereik vergroten of verkleinen.',
        'Gamma (0.2 tot 3.0) Niet-lineaire helderheidsaanpassing. Waarden lager dan 1 lichte middentonen, boven 1 donkerder ze.',
        'Verzadiging (-100 tot +100): Kleurintensiteit. -100 is grijswaarden, +100 is oververzadigd.',
        'Tintrotaat (0-360°): Verschuif alle kleuren rond het kleurenwiel.',
        'Vervaging (0-20px): Zachte afbeeldingsdetails.',
        'Verscherpen (0-100%): Verbeter de randen en details.',
        'Posteriseren (0-16 niveaus): Verminder kleurniveaus voor een postereffect.',
        'Drempel (0-255): Zet om naar binair zwart/wit op cutoff point.',
        'Randdetectie: Sobel- of Canny-algoritmen om alleen randen weer te geven.',
        'Omkeren: Alle kleuren omkeren.',
      ],
    },
    {
      heading: 'Passend',
      paragraphs: ['Hoe de overlay afbeelding past bij het QR code gebied:'],
      bullets: [
        'Omslag: afbeelding vult het gehele gebied, indien nodig afsnijden.',
        'Bevat: Volledige afbeelding zichtbaar, kan marges hebben.',
        'Stretch: afbeelding vervormt om precies te vullen.',
      ],
    },
    {
      heading: 'Transformeeropties',
      paragraphs: [
        'Rotatie: Roteer overlay in stappen van 90°.',
        'Flip X/Y: Spiegel de afbeelding horizontaal of verticaal.',
      ],
    },
    {
      heading: 'Ditheringalgoritmen',
      paragraphs: [
        'Dithering converteert afbeeldingen met continue tonen naar patronen die QR-codes kunnen vertegenwoordigen. Beschikbaar bij gebruik van de mengmodi Dithered, Blue Noise of True Dither.',
      ],
      bullets: [
        'Fout Diffusion: Classic Floyd-Steinberg stijl. Verspreidt quantisatiefout naar naburige pixels.',
        'Besteld (Bayer): Gebruikt een drempelmatrix voor reguliere patronen.',
        'Gesloten punt: Simuleert halftoon printen.',
        'Void & cluster: Geoptimaliseerd bestelde dithering.',
        'Blue Noise: Visueel aangenaam willekeurig uitziend patroon.',
        'Blauwruis Drempelwaarde: Drempel dithering met blauwe ruis textuur.',
        'White Noise: Willekeurige drempel dithering.',
        'Gaussiaans/driehoekig Geluid: Geluid met verschillende distributies.',
        'Blue Noise + Error Diffusion: Hybride die beide technieken combineert.',
        'Screened Blue Noise: schermachtig blauw ruispatroon.',
        'Perceptueel: Luminantiegewogen voor betere visuele resultaten.',
        'Rand-bewust: Bewaart afbeeldingsranden tijdens dithering.',
        'Adaptieve drempel: Lokaal adaptieve drempel.',
        "Temporal Blue Noise: Voor geanimeerde GIF's varieert het patroon per frame.",
      ],
    },
    {
      heading: 'Verspreidingskernels',
      paragraphs: ['Bij het gebruik van Error Diffusion dithering, kies hoe fout wordt verdeeld:'],
      bullets: [
        'Floyd-Steinberg: Classic 4-buur verspreiding. Goede algemene keuze.',
        'Jarvis-Judice-Ninke: 12-buur, gladder maar langzamer.',
        'Stucki: Vergelijkbaar met JJN met verschillende gewichten.',
        'Vereenvoudigde JJN, sneller.',
        'Sierra: Familie van kernels balanceren kwaliteit en snelheid.',
        'Atkinson: Lichtdiffusie, behoudt detail maar kan korrelig zijn.',
      ],
    },
    {
      heading: 'Dither Sterkte',
      paragraphs: [
        'Bepaalt hoeveel dithering wordt toegepast (0-100%). Lagere waarden behouden meer van het oorspronkelijke patroon, hogere waarden tonen meer beeld detail.',
      ],
    },
    {
      heading: 'Subpixelinstellingen',
      paragraphs: ['Bij gebruik van Subpixel-mixmodus:'],
      bullets: [
        'Rastergrootte: 2×2, 3×3 of 4×4 subpixels per module. Hoger = meer details.',
        'Middenregel: Strict vereist dat het midden-subpixel overeenkomt met de module. Halftone Center staat variatie toe.',
        'Neutrale kleur: Kleur gebruikt voor onbepaalde subpixels.',
        'Finder Override: hoe vinderpatronen worden weergegeven (effen of gestileerd).',
      ],
    },
    {
      heading: 'Halftooninstellingen',
      paragraphs: ['Bij gebruik van de Halftone mengmodus:'],
      bullets: [
        'Celgrootte: per module of N×N-raster.',
        'Puntvorm: cirkel, vierkant of lijn.',
        'Helderheidscurve: lineair, S-curve of gamma.',
      ],
    },
    {
      heading: 'Duotonekleuren',
      paragraphs: [
        'Bij gebruik van Duotone mengmodus, zet u de Schaduwkleur (donkere gebieden) en de Lichtkleur (heldere gebieden).',
      ],
    },
    {
      heading: 'Instellingen voor GIF-animatie',
      paragraphs: ['Bij gebruik van geanimeerde GIF-overlays:'],
      bullets: [
        'Framevertragingen gebruiken: Respecteer originele GIF timing.',
        'Max FPS: Beperk de framesnelheid (1-60 fps).',
        'Afvalverwerking: respecteer of vereenvoudig de afvoermethoden voor frames.',
      ],
    },
    {
      heading: 'Geavanceerde renderingsopties',
      paragraphs: ['Aanvullende destructiecontroles:'],
      bullets: [
        'Tussenruimtemodus: Geen, Inzet-, Lijn- of Negatieve spatie-tussenruimtestijl.',
        'Hoekstraal: Percentage afgeronde hoeken voor modules.',
        'Verloop: Geen, Lineair, Radiaal of Conisch verloop op modules.',
        'Eye Outer / Inner Stijl: Onafhankelijke styling voor zoekpatroon ringen.',
        'Puntrotatie: Roteer diamant/punt modules.',
        'Oogschaal: maataanpassing voor zoekpatronen.',
        'Framestijl: Voeg decoratieve frames (Rounded Frame, Sticker, Tag).',
        'Frametekst: Voeg tekst als "Scan Me!" toe aan frames.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Geavanceerde QR-codering',
      paragraphs: ['Fine-tune QR-codering:'],
      bullets: [
        'Coderingsmodus: automatisch, numeriek, alfanumeriek, byte/UTF-8 of Kanji.',
        'Enforce Min Quiet Zone: Zorg voor minimaal 4 module marge.',
        'Maskerpatroon: Automatisch (optimaal), of selecteer handmatig patronen 0-7 om de moduledistributie te regelen. Verschillende patronen creëren verschillende visuele verschijningen terwijl dezelfde gegevens worden gecodeerd.',
        'Tekencodering: ISO-8859-1 (standaard Latin-1), UTF-8 (volledige Unicode inclusief emoji) of Shift-JIS (Japans). Kies op basis van de karaktervereisten van uw inhoud.',
      ],
    },
    {
      heading: 'Geavanceerde uitvoeropties',
      paragraphs: ['Aanvullende exportinstellingen:'],
      bullets: [
        'Bestandsnaam: aangepaste bestandsnaam voor downloads.',
        'GIF Paletgrootte: 2-256 kleuren in GIF-uitvoer.',
        'GIF Quantizer: Median Cut, NeuQuant of Octree kleurreductie.',
        'GIF-dithering: Uit, Floyd-Steinberg of Besteld.',
        'GIF Transparante kleur: Stel een kleur in die transparant is.',
        'SVG Echte vector: Paden gebruiken in plaats van ingesloten raster.',
        'SVG-vormprecisie: Pixel- of nauwkeurige padweergave.',
        'SVG Rasteroverlay insluiten: Overlay opnemen als ingebedde afbeelding.',
        'Achtergrond Override: Dwing een specifieke achtergrondkleur in uitvoer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Validatieopties',
      paragraphs: ['Invoerverwerkingsinstellingen:'],
      bullets: [
        'Invoer valideren: inhoudsformaat controleren alvorens te coderen.',
        'Trim Whitespace: Verwijder voor-/spoorruimtes.',
        'Nieuwe regels normaliseren: Alle regeleinden omzetten naar LF.',
        'Max Lengte Bewaker: Waarschuwen als inhoud de QR capaciteit overschrijdt.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Professionele functies',
      paragraphs: [
        'Het professionele niveau voegt watermerken, metadata, het delen van opties, veiligheidsanalyse, betaling QR codes, en ondernemingsfuncties.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Watermerk',
      paragraphs: ['Voeg watermerken toe aan uw QR-codes:'],
      bullets: [
        'Soort: tekst-, afbeelding- of patroonwatermerk.',
        'Positie: Midden, Hoeken, Randen, Achter of Stille Zone.',
        'Doorzichtigheid: transparantie van het watermerk (0-100%).',
        'Mengmodus: Normaal, Vermenigvuldigen, Scherm of Overlay.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Metadata in geëxporteerde bestanden opnemen:'],
      bullets: [
        'Titel, Auteur, Copyright, Licentie, Omschrijving velden.',
        'Creatietijd: tijdstempel van de generatie insluiten.',
        'Aangepaste sleutelwaarde: Voeg willekeurige metadataparen toe.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Delen',
      paragraphs: ['Deel uw QR-codeconfiguraties:'],
      bullets: [
        'Directe koppeling: Genereer een gedeelde URL met uw huidige instellingen.',
        'HTML insluiten: inbedcode voor websites verkrijgen.',
        'Parameters coderen: Alle instellingen in de URL voor delen opnemen.',
        'Opmerking: Overlay afbeeldingen van lokale bestanden kunnen niet via URL worden gedeeld.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Veiligheidsanalyse',
      paragraphs: ['Zorg ervoor dat QR codes blijven scannable:'],
      bullets: [
        'Veiligheidsmodus: Uit, Gebalanceerd of Strenge scanvereisten.',
        'Min Module Grootte: Minimale pixelgrootte per module.',
        'Min Rustig Gebied: minimummargemodules.',
        'Vergrendel zoekers/Timing/Align/Format/Version: Bescherm specifieke elementen.',
        'Max Overlay Intensity by ECC: Automatische intensiteitslimieten op basis van foutcorrectieniveau.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Inhoudstypen (professioneel)',
      paragraphs: ['Professioneel niveau voegt betalings- en bedrijfsinhoud types:'],
      bullets: [
        'EPC/SEPA (EU): Europese bankoverschrijving QR codes met IBAN, BIC, bedrag, referentie.',
        'UPI (India): Unified Payments Interface met VPA, begunstigde naam, bedrag.',
        'PayNow (Singapore): Snelle betaling in Singapore met UEN of mobiel nummer.',
        'PromptPay (Thailand): Thais nationaal betalingssysteem.',
        'PIX (Brazilië): Braziliaanse onmiddellijke betaling met PIX-sleutel.',
        'Crypto: Bitcoin, Ethereum, Litecoin betalingsadressen met optioneel bedrag.',
        "Marketing Campaign Link: URL's met volledige UTM parameter (Marketing Tags) tracking.",
        'Korte koppeling: Voor gebruik met URL-verkorters voor dynamische/traceerbare QR codes.',
        'GS1 Digital Link: Productidentificatie met GTIN, serieel, batch, vervaldatum.',
        "App Deep Link: iOS/Android app diepe banden met aangepaste schema's.",
        'Aangepast formaat: onbewerkte gegevens zonder opmaak of validatie.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Taal-relevante betalingen in geavanceerde modus',
      paragraphs: [
        'Bij gebruik van Geavanceerde modus toont ANQR automatisch betaalmethoden die relevant zijn voor uw gekozen taal. Bijvoorbeeld, Vietnamese gebruikers zien VietQR, Thaise gebruikers zien PromptPay, en Indiase taal gebruikers zien UPI en BharatQR. Globale betaalmethoden (cryptogeld, PayPal, Cash App) zijn beschikbaar voor alle talen. Professionele modus ontgrendelt alle betaalstandaarden ongeacht taal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Europese betalingsstandaarden',
      bullets: [
        'EPC/SEPA (EU): QR-codes voor Europese bankoverschrijvingen volgens de EPC QR Code Standard. Ondersteunt IBAN, BIC (optioneel voor binnenlands), bedrag in EUR en gestructureerde of ongestructureerde betalingsreferenties. Gebruikt in de SEPA-zone, inclusief EU-landen plus Zwitserland, Noorwegen, IJsland, Liechtenstein, Monaco en San Marino.',
        'Zwitserse QR-factuur: Zwitserse betaalstandaard volgens SIX Implementation Guidelines. Ondersteunt CHF en EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), gestructureerde kredietgever/debetadressen, en factuurinformatie. Vereist voor Zwitserse facturen sinds 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indiase betaalnormen',
      bullets: [
        'UPI (India): Unified Payments Interface na NPCI Deep Linking Specification. Ondersteunt VPA (Virtueel Betalingsadres), naam van de begunstigde, bedrag in INR, transactienota, referentie-ID, handelscategorie code en transactiemodus.',
        'BharatQR (India): Unified QR-standaard die zowel UPI als kaartgebaseerde betalingen ondersteunt. Combineert UPI VPA met kaart PAN voor maximale compatibiliteit. Inclusief handelsnaam, stad, MCC, GST-gegevens en factuur/referentienummers.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zuidoost-Aziatische betalingsstandaarden',
      bullets: [
        "PayNow (Singapore): snel betalingssysteem in Singapore dat gebruik maakt van de EMVCo QR-specificatie met SGQR-profiel. Ondersteunt UEN (bedrijfsregistratie), mobiel nummer of NRIC als proxy-ID's. Inclusief bewerkbaarheidsvlag voor bedragen en vervaldatum.",
        'PromptPay (Thailand): Thais nationaal betalingssysteem volgens het EMV-profiel van de Bank of Thailand. Ondersteunt mobiel nummer, nationaal ID, belastingnummer, e-wallet-ID en factuurbetaling met meerdere referentievelden.',
        'QRIS (Indonesië): Quick Response Code Indonesische standaard. Op EMV gebaseerde nationale betalingsstandaard die verkopers-ID, NMID (National Merchant ID), classificatie van verkoperscriteria en gemakstoeslagen (vast of percentage) ondersteunt.',
        'DuitNow (Maleisië): Maleisisch systeem voor onmiddellijke betaling. Ondersteunt meerdere proxy types, waaronder NRIC, mobiele, paspoort, leger ID, en zakelijke registratienummers.',
        'VietQR (Vietnam): Vietnamese interbancaire transferstandaard. Vereist bank BIN (NAPAS identificatie) en rekeningnummer. Ondersteunt meerdere servicecodes voor verschillende transfertypes (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filippines): Filippijnse QR-betalingsnorm voor InstaPay en PESONet. Gebruikt rekeningnummers met handelsidentificatie voor P2M (persoon-tot-handelaar) transacties.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'East Asian Payment Standards',
      bullets: [
        'TWQR (Taiwan): Taiwanese QR-betalingsnorm. Ondersteunt merchant ID, fiscale ID, en TWD bedragen.',
        'HKQR/FPS (Hong Kong): QR-codes voor het snellere betalingssysteem van Hong Kong. Ondersteunt FPS-ID, mobiel nummer of e-mailadres als betalingsidentificatie. Bedragen in HKD.',
        'JPQR (Japan): Japanse uniforme QR code betaling standaard. Gebruikt opslag-ID voor handelsidentificatie met JPY-bedragen.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overige regionale betalingsnormen',
      bullets: [
        'PIX (Brazilië): Instant betalingssysteem van de Braziliaanse centrale bank volgens de BR-codespecificatie. Ondersteunt PIX-sleutels (CPF, CNPJ, e-mail, telefoon of willekeurige sleutel), naam/stad van de verkoper, transactie-ID en BRL-bedragen.',
        'AusPayNet/NPP PayID (Australië): PayID-systeem van het Australische nieuwe betalingsplatform. Ondersteunt PayID-typen (e-mail, mobiel, ABN, organisatie-ID) of traditioneel BSB + rekeningnummer. De naam van de handelaar is optioneel omdat betalers de geregistreerde naam zien via de NPP-zoekopdracht.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cryptocurrency Payments',
      bullets: [
        "Bitcoin/Litecoin (BIP-21): Standaard cryptogeld betaling URI's met portemonnee adres, optioneel bedrag, en label. Compatibel met alle grote Bitcoin en Litecoin portefeuilles.",
        'Bliksemnetwerk (BOLT11): Bliksemnetwerk betaling facturen. Plak een BOLT11 gecodeerde factuur string voor directe Bitcoin betalingen met minimale kosten.',
        "Ethereum (EIP-681): Ethereum transactie verzoek URI's ondersteunen inheemse ETH-transfers en ERC-20 token overdrachten. Inclusief chain ID voor multi-netwerk ondersteuning (Mainnet, Polygon, BSC, Arbitrum, Optimisme, Avalanche), gasparameters, en contract functie gesprekken.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Betalingslinkdiensten',
      bullets: [
        'PayPal.Me: PayPal-betaallinks met gebruikersnaam en optioneel vooraf ingevuld bedrag. Ontvangers kunnen betalen via PayPal-saldo, kaarten of bankrekeningen.',
        'Cash App: Cash App-betalingslinks met behulp van $cashtag met optioneel bedrag. Populair in de Verenigde Staten voor peer-to-peer-betalingen.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Algemeen EMV QR',
      bullets: [
        "EMV Generiek: Creëer aangepaste EMV Merchant-Presented Mode QR-codes voor betalingsschema's die niet specifiek worden vermeld. Configureer de naam van de verkoper, de stad, de landcode (ISO 3166-1), de valutacode (ISO 4217 numeriek), MCC, opties voor fooien/gemakskosten en aanvullende gegevensvelden. Handig voor testen of aangepaste integraties.",
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blend-modi (professioneel)',
      paragraphs: ['Extra mengmodi in professioneel niveau:'],
      bullets: [
        'Pixelate: Pixelated overlay effect.',
        'Omtrek: Randdetectie overlay met alleen contouren.',
        'Golf: golvend vervormingseffect.',
        'Subpixelgrootte: variabele subpixel grootte op basis van afbeelding.',
        'True Dither: Geavanceerde dithering met bestelde matrix selectie.',
        'Extreme: Maximale zichtbaarheid van het beeld, kan de scannabiliteit beïnvloeden.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Beschermingsinstellingen',
      paragraphs: [
        'Fijnkorrelige controle waarover QR-elementen zijn beschermd tegen overlay-modificatie:',
      ],
      bullets: [
        'Timing behouden: Houd timing patronen ongewijzigd.',
        'Uitlijning behouden: Uitlijningspatronen ongewijzigd houden.',
        'Formaat beschermen Info: Shield-format informatiemodules.',
        'Versie beschermen Info: Shield versie informatie modules.',
      ],
    },
    {
      heading: 'ECC-bewuste modus',
      paragraphs: [
        'Intelligent distribueert overlay intensiteit op basis van foutcorrectie capaciteit. Het systeem analyseert welke modules kunnen worden gewijzigd met behoud van scannability.',
      ],
      bullets: [
        'Risicobudget: percentage te gebruiken foutcorrectiecapaciteit (0-100%).',
        'Hoger budget = meer zichtbare overlay maar riskanter scannability.',
        'Lager budget = veiliger scannen maar minder zichtbaar overlay.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professionele renderingsopties',
      paragraphs: ['Geavanceerde rendering bedieningsorganen:'],
      bullets: [
        'Crisp Edges: Gebruik beeldweergave voor scherpe moduleranden.',
        'Pixel Snap: Pixeluitlijning op vloer, rond of plafond.',
        'Per-module kleurmodus: Solide, Door Helderheid, Door Positie, Door Overlay, Door Cluster.',
        'Kleurpalet: Definieer aangepaste kleurenpalet voor per-module kleuren.',
        'Contrastguard: Zorg voor een minimale contrastverhouding tussen kleuren.',
        'Min Contrast verhouding: WCAG-stijl contrast vereist (1:1 tot 21:1).',
        'Extra grensmodules: extra grens buiten de stille zone.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professionele uitvoeropties',
      paragraphs: ['Instellingen voor de uitvoer van ondernemingen:'],
      bullets: [
        'DPI: Afdrukresolutie instellen (72-600 dpi). 300 dpi aanbevolen voor afdrukken.',
        'Include Quiet Zone: Schakel stille zone in output afmetingen.',
        'Exporteren als aanvullend: PDF genereren naast het primaire formaat.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Animatie-instellingen (professioneel)',
      paragraphs: ['Extra professionele animatie functies:'],
      bullets: [
        'Tijdelijke dithering: Uit, blauwe ruis of flikkering Veilige dithering per frame.',
        'Patroon: Geen, Puls-, Golf-, Scanline-, Shimmer- of Drift-effecten.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Rubrieknummer',
      paragraphs: [
        'ANQR biedt een server-side API voor het genereren van QR-codes via URL-parameters. Dit is ideaal voor het insluiten van QR-codes in websites, e-mails, documenten of geautomatiseerde workflows zonder JavaScript aan de clientzijde.',
        'URL-basis: https://anqr.link/api/qr',
      ],
      links: [
        { href: '/examples?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'example' },
      ],
    },
    {
      heading: 'Basisparameters',
      paragraphs: ['Vereiste en gemeenschappelijke parameters (parameters worden niet vertaald):'],
      bullets: [
        'gegevens (nodig): De inhoud om te coderen in de QR code. URL-encode speciale tekens.',
        'Grootte: Afbeeldingsgrootte in pixels (standaard 400, max: 2000). Gebruikt indien w/h niet gespecificeerd.',
        'w, h: Uitvoerbreedte en -hoogte in pixels. Overschrijft grootte parameter.',
        'formaat: Uitvoerformaat - png, webp of gif (standaard: png).',
        'ec: Foutcorrectieniveau - L, M, Q of H (standaard: H).',
        'fg: Voorgrondkleur als hex zonder # (standaard: 000000).',
        'bg: achtergrondkleur als hex zonder # (standaard: ffffff).',
        'transparant: Zet op 1 voor transparante achtergrond.',
        'marge: Rustige zone in modules (standaard: 4).',
      ],
    },
    {
      heading: 'Stijlparameters',
      paragraphs: ['Module en patroon styling:'],
      bullets: [
        'stijl: Module stijl - vierkant, afgerond, punten, diamant, verbonden.',
        'vinder: Zoek patroon stijl - vierkant, afgerond, cirkel.',
        'uitlijning: Uitlijning patroon stijl - match_finder, vierkant, afgerond, cirkel.',
        'timing: Timing patroon stijl - match_module, solide, gestreept.',
        'radius: Hoekradius percentage 0-100.',
        'gap: module gap percentage 0-50.',
        'gapMode: Gap-modus - geen, inset, slag, negatieve_space.',
        'oog Buitenkant, eyeInner: Oogstijlen - vierkant, afgerond, cirkel.',
        'oogschaling: Oogaandoeningen (standaard: 100).',
        'grad: Kleurverloop type - geen, lineair, radiaal, kegelsnede.',
        'gradangle: verloophoek voor lineaire hellingen.',
        'gradStops: verloop stopt als kleur1,pos1,kleur2,pos2,... (bijv. ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Overlayparameters',
      paragraphs: [
        'Opties voor afbeeldingsoverlay (overlayafbeelding wordt op de server opgehaald):',
      ],
      bullets: [
        'img: URL naar overlay afbeelding (moet openbaar toegankelijk zijn).',
        'modus: Overlay mode - centrum, halve toon, blend, helderheid, mozaïek, dithered, blauw-ruis, subpixel.',
        'intensiteit: Overlay intensiteit 0-100 (standaard: 100).',
        'kleur Modus: Overlay kleurmodus - kleur, grijswaarden, lichaamsgewicht.',
        'fit: Hoe overlay past - cover, contain, stretch.',
        'rot: Overlay rotatie in graden.',
        'Zet je op 1 om overlay te draaien.',
        'bewaren Zoekers: Bewaar zoekpatronen (standaard: 1).',
        'bewaren Timing, keepAlign: ingesteld op 1 om timing/uitlijningspatronen te behouden.',
      ],
    },
    {
      heading: 'Parameters voor verwerking',
      paragraphs: ['Beeldvoorbewerking toegepast op overlay:'],
      bullets: [
        'helderheid: aanpassing -100 tot 100 (standaard: 0).',
        'contrast: Aanpassing -100 tot 100 (standaard: 0).',
        'gamma: waarde 0,1 tot 3 (standaard: 1).',
        'verzadiging: Aanpassing -100 tot 100 (standaard: 0).',
        'tint: Tint rotatie in graden.',
        'vervaging: vervaging in pixels.',
        'slijpen: verscherpen hoeveelheid 0-100.',
        'posterize: Posterize levels.',
        'drempel: Binaire drempel 0-255.',
        'rand: Rand detectie - off, sobel, canny.',
        'Omkeren: Zet 1 op kleuren omkeren.',
      ],
    },
    {
      heading: 'Watermerkparameters',
      paragraphs: ['Watermerken toevoegen aan gegenereerde QR-codes:'],
      bullets: [
        'wmEn: ingesteld op 1 om watermerk in te schakelen.',
        'wm Soort: Watermerk type - tekst, afbeelding, patroon.',
        'wmTekst: Watermerktekst (URL-gecodeerd).',
        'wmlmg: URL naar watermerk afbeelding.',
        'wmPos: Positie - midden, hoeken, randen, achter, rustig_zone.',
        'wmOpacity: dekking 0-100 (standaard: 50).',
        'wmBlend: Mengmodus - normaal, vermenigvuldigen, scherm, overlay.',
      ],
    },
    {
      heading: 'Animatieparameters',
      paragraphs: ['Voor geanimeerde GIF-uitvoer (vereist formaat=gif):'],
      bullets: [
        'anim Patroon: Animatiepatroon - geen, puls, golf, scanline, glinsterende, drift, kleur_cyclus.',
        'anim Frames: Aantal frames 1-60 (standaard: 24).',
        'anim Snelheid: Framevertraging in milliseconden 10-1000 (standaard: 100).',
        'anim Zaad: Willekeurig zaad voor animatie.',
        'ontspannen: Animatievergemakkelijking - lineair, eenvoudig_in, gemak_uit, gemak_in_out, bounce.',
      ],
    },
    {
      heading: 'Uitvoerparameters',
      paragraphs: ['Uitvoerformaatopties:'],
      bullets: [
        'kwaliteit: WebP kwaliteit 0-1 (standaard: 0,9).',
        'webpQ: WebP kwaliteit 0-100 (standaard: 90).',
        'gifKleuren: GIF palet grootte 2-256 (standaard: 256).',
        'dpi: uitvoerdpi voor PNG (standaard: 72).',
        'metaTitle, metaAuthor, metaCopy, meta Desc: PNG-metadatavelden.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Gewasparameters',
      paragraphs: ['Opties voor bijsnijden van overlay-afbeeldingen:'],
      bullets: [
        'cropEn: Overlay-bijsnijden inschakelen 0/1 (standaard: 0).',
        'cropX: Snijcentrum X als fractie 0-1 (standaard: 0,5).',
        'cropY: Gewascentrum Y als fractie 0-1 (standaard: 0,5).',
        'cropSize: Bijsnijdgrootte als fractie van afbeelding 0-1 (standaard: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Parameters veiligheidsslot',
      paragraphs: ['Bepaal welke QR-elementen worden beschermd tegen overlay-wijziging:'],
      bullets: [
        'lockF: Vergrendelzoekerpatronen 0/1 (standaard: 1).',
        'lockT: Vergrendel timingpatronen 0/1 (standaard: 1).',
        'lockA: Uitlijningspatronen vergrendelen 0/1 (standaard: 1).',
        'lockFmt: Formaat info 0/1 vergrendelen (standaard: 1).',
        'lockV: Info slotversie 0/1 (standaard: 1).',
        'safeMode: Veiligheidsmodus - uit, gebalanceerd, strikt (standaard: uit).',
        'safeMinPx: Minimale modulegrootte in pixels (standaard: 2).',
        'safeMinQz: Minimale stille zonemodules (standaard: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parameters voor automatisch afstemmen',
      paragraphs: ['Automatische optimalisatie-instellingen:'],
      bullets: [
        'autoVer: Auto-pick QR-versie 0/1 (standaard: 1).',
        'autoEcc: ECC-niveau automatisch kiezen 0/1 (standaard: 0) - alleen hint op de server.',
        'autoReduce: [ALLEEN CLIENT] Intensiteit automatisch verlagen tot scanbaar - vereist scanvalidatielus.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Aanvullende animatieparameters',
      paragraphs: ['Uitgebreide animatiebediening voor GIF-uitvoer:'],
      bullets: [
        'loop: Animatie loopt continu door 0/1 (standaard: 1).',
        'bounce: richting pingponganimatie 0/1 (standaard: 0).',
        'reverse: animatie achteruit afspelen 0/1 (standaard: 0).',
        'colorCycle: Kleurcycluseffect 0/1 inschakelen (standaard: 0).',
        'interp: Frame-interpolatie - geen, crossfade, morph (standaard: geen).',
        'tempDither: Tijdelijke dithering - uit, blue_noise, flicker_safe (standaard: uit).',
        'startF: startframe van animatie (standaard: 0).',
        'maxF: Maximaal aantal frames dat kan worden weergegeven (standaard: 0 = automatisch).',
        'stepF: Framestapinterval (standaard: 1).',
        'jitter: [ALLEEN CLIENT] Modulejitter in pixels - vereist QR-regeneratie per frame.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Dithering-parameters',
      paragraphs: ['Beheer dithering-algoritmen voor overlay-verwerking:'],
      bullets: [
        'ditherKind: Dither-algoritme - error_diffusion, orderd_bayer, blue_noise, enz. (standaard: orderd_bayer).',
        'diffusionKernel: Fout bij diffusiekernel - floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (standaard: floyd_steinberg).',
        'ditherStrength: Dither-intensiteit 0-100 (standaard: 50).',
        'serpentine: Serpentine dithering 0/1 (standaard: 0).',
        'matrix: Bestelde dither-matrix - bayer2, bayer4, bayer8 (standaard: bayer4).',
        'bnTile: tegelgrootte blauwe ruis (standaard: 64).',
        'bnSeed: Willekeurig zaad met blauwe ruis (standaard: 0).',
        'colorDither: Kleurdithering - geen, per_kanaal, perceptueel (standaard: geen).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixelparameters',
      paragraphs: ['Instellingen voor subpixel-overvloeimodus:'],
      bullets: [
        'spGrid: Subpixelrastergrootte - 2x2, 3x3, 4x4 (standaard: 3x3).',
        'spCenter: Middelste regel - strikt, halftone_center (standaard: strikt).',
        'spNeutral: Neutrale kleur hex zonder # (standaard: 808080).',
        'spFinder: Finder overschrijven - effen, gestileerd (standaard: effen).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Halftoonparameters',
      paragraphs: ['Instellingen voor halftoonovervloeimodus:'],
      bullets: [
        'htCell: Halftooncelgrootte - per_module of nxn-raster (standaard: per_module).',
        'htDot: Puntvorm - cirkel, vierkant, lijn (standaard: cirkel).',
        'htCurve: Helderheidscurve - lineair, s-curve, gamma (standaard: lineair).',
        'duo1: Duotone schaduwkleur hex zonder # (standaard: 000000).',
        'duo2: Duotoon-markeringskleur hex zonder # (standaard: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-bewuste modusparameters',
      paragraphs: ['Intelligente overlay-distributie op basis van foutcorrectiecapaciteit:'],
      bullets: [
        'eccAware: ECC-bewuste modus 0/1 inschakelen (standaard: 0).',
        'eccRisk: Risicobudgetpercentage 0-100 (standaard: 50).',
        'eccMap: Gewichtskaart - afstand_tot_vinders, blok_heatmap, empirische_scan_heatmap (standaard: afstand_tot_zoekers).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Frameparameters',
      paragraphs: ['Decoratieve frame-instellingen:'],
      bullets: [
        'frame: Framestijl - geen, afgerond_frame, sticker, tag (standaard: geen).',
        'frameText: tekst die in frame moet worden weergegeven (URL-gecodeerd).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Kleurparameters per module',
      paragraphs: ['Kleuropties voor individuele modules:'],
      bullets: [
        'modColor: Kleurmodus - effen, by_brightness, by_position, by_overlay, by_cluster (standaard: effen).',
        'cGuard: Contrastbewaking 0/1 (standaard: 0).',
        'minContrast: Minimale contrastverhouding 1-21 (standaard: 4,5).',
        "palet: Door komma's gescheiden hex-kleuren voor paletmodus.",
        'paletteMode: Paletverdeling - positie, helderheid, diagonaal, radiaal, willekeurig, rij, kolom (standaard: positie).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF-overlayparameters',
      paragraphs: ['Instellingen voor geanimeerde GIF-overlay-afbeeldingen:'],
      bullets: [
        'ovType: Overlay-type - statisch, gif, apng, webp_anim, video (standaard: statisch).',
        'ovFramePick: Frameselectie - alles, elke_n, max_frames, duur_limiet (standaard: alles).',
        'gifDelays: gebruik originele GIF-framevertragingen 0/1 (standaard: 1).',
        'gifDispH: afhandeling van GIF-verwijdering - respect, vereenvoudiging (standaard: respect).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Intensiteitslimieten per ECC',
      paragraphs: ['Maximale overlay-intensiteit per foutcorrectieniveau:'],
      bullets: [
        'maxIntL: Max. intensiteit voor ECC L 0-100 (standaard: 100).',
        'maxIntM: maximale intensiteit voor ECC M 0-100 (standaard: 100).',
        'maxIntQ: Max. intensiteit voor ECC Q 0-100 (standaard: 100).',
        'maxIntH: Max. intensiteit voor ECC H 0-100 (standaard: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA-simulatieparameters (alleen client)',
      paragraphs: [
        'Deze parameters worden geparseerd voor URL-compatibiliteit, maar werken alleen in de browser:',
      ],
      bullets: [
        'qaContrast: Schakel contrastcontrole 0/1 in - vereist interactieve validatie.',
        'qaBlur: Simuleer onscherpte in pixels - alleen voor interactief testen.',
        'qaNoise: Simuleer het geluidsniveau - alleen voor interactief testen.',
        'qaHeatmap: Toon leesbaarheid heatmap 0/1 - vereist canvas-overlay-UI.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Parameters voor alleen clienten',
      paragraphs: [
        'De meeste API-parameters worden volledig ondersteund aan de serverzijde. Parameters gemarkeerd als [CLIENT-ONLY] worden geparseerd op URL-compatibiliteit, maar vereisen browserfuncties:',
      ],
      bullets: [
        'jitter: Modulejitter vereist QR-regeneratie per frame met willekeur.',
        'autoReduce: Voor het automatisch verminderen van de intensiteit zijn iteratieve scantests vereist.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: QA-simulatie vereist interactieve canvasvalidatie.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Aanvullende uitvoerparameters',
      paragraphs: ['Uitgebreide uitvoer- en exportinstellingen:'],
      bullets: [
        'fname: Aangepaste bestandsnaam voor downloads (standaard: anqr-qrcode).',
        'inclQz: Stille zone opnemen in uitvoerafmetingen 0/1 (standaard: 1).',
        'bgOver: Achtergrondkleur overschrijft hex zonder # (overschrijft bg-parameter).',
        'fmtExtra: Extra formaatuitvoer - geen, eps, geanimeerde_webp (standaard: geen). Opmerking: eps is [GEDEELTELIJK].',
        'svgPrec: Precisie van de SVG-vorm - pixel, nauwkeurig (standaard: pixel). [GEDEELTELIJK] SVG-uitvoer beperkt op de server.',
        'svgEmbed: Rasteroverlay insluiten in SVG 0/1 (standaard: 1). [GEDEELTELIJK] SVG-uitvoer beperkt op de server.',
        'modulePx: Pixelgrootte van module (standaard: automatisch berekend op basis van grootte).',
        'grens: Extra grensmodules buiten de stille zone (standaard: 0).',
        'helder: Schakel scherpe/gepixelde afbeeldingsweergave in 0/1 (standaard: 1).',
        'snap: Pixel-snapmodus - vloer, rond, plafond (standaard: vloer).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Patroonbehoudparameters',
      paragraphs: ['Bepaal welke structurele elementen beschermd zijn tegen overlay:'],
      bullets: [
        'keepFinders: Behoud zoekerpatronen 0/1 (standaard: 1).',
        'keepTiming: Behoud timingpatronen 0/1 (standaard: 0).',
        'keepAlign: Behoud uitlijningspatronen 0/1 (standaard: 0).',
        'protectFmt: Bescherm formaat-infomodules 0/1 (standaard: 0).',
        'protectVer: Bescherm versie-infomodules 0/1 (standaard: 0).',
      ],
    },
    {
      heading: 'Voorbeeld Gebruik',
      paragraphs: [
        'Basis QR-code:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Gestileerde QR-code met aangepaste kleuren:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'QR-code met overlay afbeelding:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'Geanimeerde GIF:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [
        { href: '/examples?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'example' },
      ],
    },
    {
      heading: 'Inbedding van QR-codes',
      paragraphs: [
        "In de professionele modus genereert de Share-functie insluitbare HTML en URL's. Zo werkt het insluiten:",
      ],
      bullets: [
        'Delen Link: Maakt een URL aan de ANQR-app met al uw instellingen gecodeerd als URL-parameters. Ontvangers kunnen de QR-code bekijken en wijzigen.',
        'Afbeelding insluiten: Genereert een <img> tag die naar de server API wijst. De QR-code wordt aan de serverzijde weergegeven en dient als afbeelding.',
        'Opmaak insluiten: Maakt een afdruk van de afbeelding syntaxis voor documentatie en README-bestanden.',
        'Directe API-URL: De onbewerkte API-URL voor gebruik in applicaties, scripts of andere integraties.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML-voorbeeld',
      paragraphs: [
        'Een QR-code insluiten in uw website:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        'Voor responsieve grootte:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" stijl="max-width: 100%; hoogte: auto;" />',
        'De server caches antwoorden met lange cache headers, dus herhaalde verzoeken voor dezelfde URL zijn snel.',
      ],
    },
    {
      heading: 'URL-formaat delen',
      paragraphs: [
        'Wanneer u in de professionele modus op Delen klikt, codeert ANQR uw huidige instellingen in URL-parameters. Het formaat is:',
        'https://anqr.link/?data=...&ec=H&style=rounded&...',
        'Deze parameters spiegelen de API parameters, zodat u een gedeelde URL kunt converteren naar een API URL door het basispad te veranderen van / naar /api/qr en waar nodig de parameters w/h aan te passen.',
        'Opmerking: Overlay beelden geüpload van lokale bestanden kunnen niet gedeeld worden via URL - alleen URL-gebaseerde overlays (img parameter) werken in gedeelde links en API-oproepen.',
      ],
    },
    {
      heading: 'Percentage limieten en gebruik',
      paragraphs: [
        'De API is gratis te gebruiken voor redelijke volumes. Voor gebruik met grote volumes of commerciële toepassingen die een gegarandeerde uptime vereisen, kunt u contact met ons opnemen.',
        'API-reacties omvatten agressieve caching-headers. Voor de beste prestaties kunt u de antwoorden aan uw kant in de cache plaatsen of dezelfde URL consistent gebruiken voor identieke QR-codes.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Beste praktijken',
      paragraphs: ['Volg deze richtlijnen voor betrouwbare QR codes:'],
      bullets: [
        'Test uw QR-codes altijd met meerdere scanners voordat u afdrukt.',
        'Gebruik Foutcorrectie H (High) bij het toevoegen van overlays.',
        'Houd ten minste 4 modules rustige zone (margin).',
        'Zorg voor een hoog contrast tussen voorgrond en achtergrond.',
        'Voor afdrukken, gebruik ten minste 300 dpi en test op werkelijke afdrukgrootte.',
        'Behoud zoekerpatronen inschakelen bij het gebruik van overlays.',
        'Begin met een lagere overlay intensiteit en neem geleidelijk toe.',
        'Voor buitengebruik, overweeg grotere modulegroottes en hogere foutcorrecties.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Blader door artikels', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'example' },
      ],
    },
    {
      heading: 'Problemen oplossen',
      paragraphs: ['Gemeenschappelijke kwesties en oplossingen:'],
      bullets: [
        'QR zal niet scannen: Verminder overlay intensiteit, verhoog foutcorrectie, controleer contrast.',
        'Code te groot: Verminder de inhoud lengte, gebruik URL-verkorter, lagere versie.',
        'Blurry-uitvoer: Verhoog modulegrootte, gebruik PNG in plaats van gecomprimeerde formaten.',
        'Kleuren zien er verkeerd uit: Controleer kleurcontrast, probeer grijswaarden overlay-modus.',
        'GIF niet animeren: Zorg ervoor dat u GIF-formaatuitvoer gebruikt, controleer het aantal frames.',
        'Afbeelding overlay niet laden: Controleer CORS-rechten op afbeeldingen op afstand.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Zie bijbehorende gidsen en voorbeelden',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Sneltoetsen',
      paragraphs: [
        'ANQR ondersteunt standaard sneltoetsen. Gebruik Ctrl/Cmd+S om export te activeren (wanneer gericht op het voorbeeld).',
      ],
    },
    {
      heading: 'Inbedding delen',
      paragraphs: [
        'Klik in de professionele modus op de knop Delen om een URL te kopiëren met uw huidige instellingen. Ontvangers kunnen deze URL openen om uw exacte configuratie te zien. Opmerking: Overlay afbeeldingen van lokale bestanden kunnen niet via URL worden gedeeld.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Probeer deze configuratie direct in de ANQR generator.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Blader door artikels', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Open de generator', type: 'generator' },
  ],
};

export default guide;
