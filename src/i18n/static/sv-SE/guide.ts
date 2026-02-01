import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Användarhandbok för ANQR',
  description: 'Komplett guide för att använda ANQR för att skapa QR-koder.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Öppna generatorn', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Bläddra Lär artiklar', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Se QR-exempel', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Komma igång',
      paragraphs: ['ANQR är en QR-kodgenerator med ett klient-första tillvägagångssätt. Som standard genereras QR-koder lokalt i din webbläsare - inget konto krävs och din data förblir privat. För professionell inbäddning kan du också använda API:et på serversidan.', 'Gränssnittet har tre gränssnittsnivåer: Basic, Advanced och Professional. Välj din nivå med hjälp av flikarna i rubriken. Varje nivå låser upp ytterligare funktioner samtidigt som gränssnittet fokuseras på vad du behöver.'],
      bullets: ['Grundläggande: Enkelt skapande av QR-koder med vanlig text/URL-innehåll och bildöverlägg.', 'Avancerat: QR-kodningsalternativ, renderingsstilar, animationer, utdataformat, utökade innehållstyper och anpassning av överlägg.', 'Professionell: Vattenstämplar, metadata, delning, säkerhetsanalys, betalnings-QR-koder och företagsfunktioner.'],
      links: [{ href: '/?lang=${lang}', label: 'Öppna generatorn', type: 'generator' }],
    },
    {
      heading: 'Snabbstart',
      paragraphs: ['Så här skapar du din första QR-kod:'],
      bullets: ['1. Välj en innehållstyp (URL, text, WiFi, etc.) från rullgardinsmenyn Innehållstyp.', '2. Ange dina uppgifter i de angivna fälten.', '3. Alternativt kan du anpassa färger, stilar och lägga till en överläggsbild.', '4. Klicka på Exportera för att ladda ner din QR-kod som PNG, GIF, WebP eller SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Grundläggande funktioner',
      paragraphs: ['Grundnivån ger ett strömlinjeformat gränssnitt för att skapa QR-koder med nyttolastinnehåll och bildöverlägg. Detta är det enklaste sättet att komma igång.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Innehållstyper (grundläggande)',
      paragraphs: ['Oformaterad text: Koda vilken text som helst upp till QR-kodens kapacitetsgräns. Idealisk för korta meddelanden, koder eller identifierare.', 'URL: Koda webbadresser. QR-koden öppnar URL:en när den skannas. Stöder http://- och https://-protokollen.'],
    },
    {
      heading: 'Bildöverlägg (grundläggande)',
      paragraphs: ['Ladda upp en bild (JPG, PNG, GIF, WebP) för att blandas med din QR-kod. Grundläggande överläggsfunktioner inkluderar:'],
      bullets: ['Ladda upp från fil: Välj en bild från din enhet.', 'Ladda från URL: Ange en bild-URL (måste tillåta CORS).', 'Mittlogotyp: Placerar bilden i mitten, beroende på felkorrigering.', 'Blandning: Enkel alfablandning av bild med QR-mönster.', 'Intensitet: Styr hur starkt överlägget påverkar QR-koden (0-100%).', 'Färgläge: Fullfärg, Gråskala eller Svartvitt.', 'Bevara Finder-mönster: Håller hörnmönster oförändrade för tillförlitlig skanning.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Se relaterade guider och exempel', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Avancerade funktioner',
      paragraphs: ['Den avancerade nivån låser upp alternativ för QR-kodning, renderingsstilar, animationer, utdataformat, utökade innehållstyper och avancerad överlagringsanpassning.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'QR-kodningsinställningar',
      paragraphs: ['Version: QR-koder finns i version 1-40, med högre versioner som innehåller mer data men är större. Ställ in på 0 (Auto) för att låta ANQR välja den minsta versionen som passar ditt innehåll.', 'Felkorrigering: Bestämmer hur mycket skada en QR-kod kan få medan den förblir skanningsbar.'],
      bullets: ['L (låg): 7% felkorrigering - minsta storlek, minst redundans.', 'M (Medium): 15 % felkorrigering - balanserat alternativ.', 'Q (Kvartil): 25 % felkorrigering - bra för utskrivna koder.', 'H (Hög): 30 % felkorrigering - bäst för koder med överlägg eller under svåra förhållanden.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Tyst zon (marginal)',
      paragraphs: ['Den tysta zonen är det vita utrymmet runt QR-koden. Skanners behöver denna marginal för att upptäcka var koden börjar. Standarden rekommenderar minst 4 moduler. Att minska under 4 kan orsaka skanningsproblem.'],
    },
    {
      heading: 'Modulstil',
      paragraphs: ['Moduler är de enskilda rutor som utgör en QR-kod. ANQR erbjuder fem stilar:'],
      bullets: ['Fyrkantig: Klassiskt QR-utseende med skarpa hörn.', 'Rundade: Mjukade hörn för en vänligare look.', 'Prickar: Cirkulära moduler för en modern estetik.', 'Diamant: 45° roterade rutor för ett distinkt mönster.', 'Ansluten: Moduler smälter samman när de är intill varandra och skapar organiska former.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Finder mönsterstil',
      paragraphs: ['Finder-mönster är de tre stora rutorna i QR-hörnen som hjälper skannrar att orientera koden. Tillgängliga stilar:'],
      bullets: ['Fyrkant: Standard fyrkantiga hörn.', 'Rundade: Mjukade hörn som matchar rundad modulstil.', 'Cirkel: Cirkulära sökmönster för koder i prickstil.'],
    },
    {
      heading: 'Uppriktnings- och tidsmönster',
      paragraphs: ['Justeringsmönster visas i större QR-koder (version 2+) för att hjälpa till att korrigera distorsion. Tidsmönster är de alternerande linjerna som förbinder sökmönster.'],
      bullets: ['Justeringsstil: Matcha Finder, Square, Rounded eller Circle.', 'Timing Style: Match Module, Solid eller Streckad.'],
    },
    {
      heading: 'Färger',
      paragraphs: ['Förgrund: Färgen på QR-modulerna. Svart (#000000) är standard men alla mörka färger fungerar.', 'Bakgrund: Bakgrundsfärgen. Vit (#ffffff) är standard. Säkerställ tillräcklig kontrast mot förgrunden.', 'Transparent bakgrund: Ta bort bakgrunden helt för användning på färgade ytor. Se till att ytan ger tillräcklig kontrast.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Modulstorlek och mellanrum',
      paragraphs: ['Modulstorlek: Styr hur stor varje modul renderas i pixlar. Större värden skapar större koder som är lättare att skanna.', 'Modulgap: Lägger till mellanrum mellan moduler i procent. Små luckor (5-15 %) kan förbättra skanningsbarheten under vissa förhållanden, men alltför stora luckor minskar tillförlitligheten.'],
    },
    {
      heading: 'Utgångsinställningar',
      paragraphs: ['Format: Välj ditt exportformat baserat på användningsfall.'],
      bullets: ['PNG: Förlustfritt rasterformat, perfekt för de flesta användningsområden. Bäst för tryckt och digitalt.', 'WebP: Modernt format med mindre filstorlekar. Bra för webbanvändning.', 'GIF: Krävs för animerade QR-koder. Stöder transparens.', 'SVG: Vektorformat som skalas oändligt. Bäst för storskrift eller när du behöver redigera koden.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Se relaterade guider och exempel', type: 'learn' },
      ],
    },
    {
      heading: 'Utgångsmått',
      paragraphs: ['Bredd/höjd: Ställ in utdatastorleken i pixlar. För utskrift, beräkna baserat på DPI (t.ex. 300 DPI vid 1 tum = 300px). Större storlekar skannar mer tillförlitligt på avstånd.'],
    },
    {
      heading: 'Animationsinställningar (avancerat)',
      paragraphs: ['Styr animerad QR-kods beteende:'],
      bullets: ['Hastighet: Animeringsbildhastighet i millisekunder.', 'Slinga: Kontinuerlig eller enspelsanimering.', 'Bounce: Ping-pong animationsriktning.', 'Startbild: Börja animering från en specifik bildruta.', 'Max Frames: Begränsa det totala antalet bilder i animering.', 'Ramsteg: Hoppa över bildrutor för snabbare animering.', 'Interpolation: Ingen, Crossfade eller Morph mellan bildrutor.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Se relaterade guider och exempel', type: 'learn' },
      ],
    },
    {
      heading: 'Innehållstyper (avancerat)',
      paragraphs: ['Avancerad nivå låser upp ytterligare nyttolastformat:'],
      bullets: [
        'Telefonnummer (tel:): Skapar en uppringningsbar telefonlänk.',
        'E-post (mailto:): Öppnar e-postklient med valfritt ämne och brödtext.',
        'SMS: Förifyllt textmeddelande till ett telefonnummer.',
        'vCard: Fullständigt kontaktkort med namn, organisation, telefon, e-post, adress.',
        'MeCard: Kompakt kontaktformat populärt i Japan.',
        'BizCard: Äldre visitkortsformat.',
        'Geografisk plats: GPS-koordinater som öppnas i kartor.',
        'WiFi: Nätverksuppgifter för automatisk anslutning (SSID, lösenord, säkerhetstyp).',
        'Kalenderhändelse: iCalendar-format med titel, plats, datum/tid.',
        'Event OSA: Länk till sidan för eventregistrering.',
        'Kalenderprenumerera: Prenumerera på ett ICS/WebCal-flöde.',
        'Fil/dokument URL: Direktlänk till nedladdningsbara filer.',
        'Cloud Storage Link: Länkar till Google Drive, Dropbox, OneDrive, etc.',
        'Social profil: Länkar till LinkedIn, Twitter, Instagram, etc.',
        'Meddelandelänk: WhatsApp, Telegram, Signal djuplänkar.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Avancerade överläggsfunktioner',
      paragraphs: ['Ytterligare överläggsfunktioner:'],
      bullets: ['Beskär: Aktivera beskärning för att välja en kvadratisk del av bilden.', 'Halvton: Klassiskt prickmönster baserat på bildens ljusstyrka.', 'Dithered: Fel-diffusionsdithering för detaljerad återgivning.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Överläggsblandningslägen (avancerat)',
      paragraphs: ['Ytterligare blandningslägen på avancerad nivå:'],
      bullets: ['Subpixel: Delar in varje modul i subpixlar för högre detaljer.', 'Blue Noise: Använder blått brusdithering för artefaktfria mönster.', 'Mosaik: Kakelbaserad effekt som bevarar bildstrukturen.', 'Gap Fill: Placerar bilden i luckor mellan moduler.', 'Ljusstyrka: Varierar modulstorlek baserat på bildens ljusstyrka.', 'Duotone: Mappar bilden till två färger för slående kontrast.'],
    },
    {
      heading: 'Överlagringsintensitet',
      paragraphs: ['Styr hur starkt överlägget påverkar QR-koden (0-100%). Högre värden visar mer bilddetaljer men kan minska skanningsbarheten. Börja runt 70 % och justera baserat på testning.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Se relaterade guider och exempel', type: 'learn' }],
    },
    {
      heading: 'Färgläge',
      paragraphs: ['Hur överläggsbilden bearbetas:'],
      bullets: ['Fullfärg: Bevarar originalbildens färger.', 'Gråskala: Konverterar till svarta och vita toner.', 'Svartvitt: Binär konvertering med hög kontrast.'],
    },
    {
      heading: 'Bevara Finder-mönster',
      paragraphs: ['När det är aktiverat behåller de tre hörnsökarmönstren oförändrade av överlägget. Rekommenderas starkt för pålitlig skanning.'],
    },
    {
      heading: 'Bildförbehandling',
      paragraphs: ['Använd filter på din överläggsbild innan du blandar. Dessa justeringar kan förbättra hur bilden visas i den slutliga QR-koden.'],
      bullets: ['Ljusstyrka (-100 till +100): Gör bilden ljusare eller mörkare.', 'Kontrast (-100 till +100): Öka eller minska tonomfånget.', 'Gamma (0,2 till 3,0): Icke-linjär justering av ljusstyrkan. Värden under 1 gör mellantoner ljusare, över 1 gör dem mörkare.', 'Mättnad (-100 till +100): Färgintensitet. -100 är gråskala, +100 är övermättad.', 'Nyansrotera (0-360°): Flytta alla färger runt färghjulet.', 'Oskärpa (0-20px): Mjuka upp bilddetaljer.', 'Skärpa (0-100%): Förbättra kanter och detaljer.', 'Posterize (0-16 nivåer): Minska färgnivåerna för en affischeffekt.', 'Tröskelvärde (0-255): Konvertera till binärt svart/vitt vid brytpunkten.', 'Kantdetektering: Sobel- eller Canny-algoritmer för att endast visa kanter.', 'Invertera: Vänd alla färger.'],
    },
    {
      heading: 'Anpassningsläge',
      paragraphs: ['Hur överläggsbilden passar QR-kodområdet:'],
      bullets: ['Omslag: Bilden fyller hela området, beskär vid behov.', 'Innehåller: Hela bilden synlig, kan ha marginaler.', 'Stretch: Bilden förvrängs för att fylla exakt.'],
    },
    {
      heading: 'Transformeringsalternativ',
      paragraphs: ['Rotation: Rotera överlägget i steg om 90°.', 'Vänd X/Y: Spegla bilden horisontellt eller vertikalt.'],
    },
    {
      heading: 'Dithering-algoritmer',
      paragraphs: ['Dithering konverterar bilder med kontinuerliga toner till mönster som QR-koder kan representera. Tillgängligt när du använder blandningslägena Dithered, Blue Noise eller True Dither.'],
      bullets: [
        'Felspridning: Klassisk Floyd-Steinberg-stil. Sprider kvantiseringsfel till angränsande pixlar.',
        'Beställt (Bayer): Använder en tröskelmatris för vanliga mönster.',
        'Clustered Dot: Simulerar halvtonsutskrift.',
        'Void & Cluster: Optimerad ordnad dithering.',
        'Blue Noise: Visuellt behagligt slumpmässigt mönster.',
        'Blue Noise Threshold: Tröskelvibrering med blå brusstruktur.',
        'Vitt brus: Slumpmässig tröskelvibrering.',
        'Gaussiskt/triangulärt brus: Brus med olika distributioner.',
        'Blue Noise + Error Diffusion: Hybrid som kombinerar båda teknikerna.',
        'Screened Blue Noise: Skärmliknande blått brusmönster.',
        'Perceptuell: Luminansviktad för bättre visuella resultat.',
        'Kantmedveten: Bevarar bildkanterna under rastrering.',
        'Adaptiv tröskel: Lokalt anpassad tröskel.',
        'Temporal Blue Noise: För animerade GIF-bilder varierar mönster per bildruta.',
      ],
    },
    {
      heading: 'Diffusionskärnor',
      paragraphs: ['När du använder Error Diffusion dithering, välj hur felet fördelas:'],
      bullets: ['Floyd-Steinberg: Klassisk 4-grannspridning. Bra allmänt val.', 'Jarvis-Judice-Ninke: 12-granne, jämnare men långsammare.', 'Stucki: Liknar JJN med olika vikter.', 'Burkes: Förenklat JJN, snabbare.', 'Sierra: Familj av kärnor som balanserar kvalitet och hastighet.', 'Atkinson: Ljusdiffusion, bevarar detaljer men kan vara kornig.'],
    },
    {
      heading: 'Dither Styrka',
      paragraphs: ['Styr hur mycket vibrering som tillämpas (0-100%). Lägre värden bevarar mer av originalmönstret, högre värden visar mer bilddetaljer.'],
    },
    {
      heading: 'Subpixelinställningar',
      paragraphs: ['När du använder subpixelblandningsläge:'],
      bullets: ['Rutnätsstorlek: 2×2, 3×3 eller 4×4 underpixlar per modul. Högre = mer detaljer.', 'Mittregel: Strikt kräver mittunderpixel för att matcha modulen. Halvtonscenter tillåter variation.', 'Neutral färg: Färg som används för obestämda subpixlar.', 'Finder Override: Hur sökmönster återges (Solid eller Stylized).'],
    },
    {
      heading: 'Halvtonsinställningar',
      paragraphs: ['När du använder halvtonsblandningsläge:'],
      bullets: ['Cellstorlek: Per modul eller N×N-rutnät.', 'Punktform: cirkel, fyrkant eller linje.', 'Ljusstyrkekurva: Linjär, S-kurva eller Gamma.'],
    },
    {
      heading: 'Duotone färger',
      paragraphs: ['När du använder Duotone-blandningsläge, ställ in Skuggfärg (mörka områden) och Highlight-färg (ljusa områden).'],
    },
    {
      heading: 'GIF-animationsinställningar',
      paragraphs: ['När du använder animerade GIF-överlägg:'],
      bullets: ['Använd bildfördröjningar: Respektera den ursprungliga GIF-timingen.', 'Max FPS: Begränsa bildfrekvens (1-60 fps).', 'Avfallshantering: Respektera eller förenkla metoderna för kassering av ramar.'],
    },
    {
      heading: 'Avancerade renderingsalternativ',
      paragraphs: ['Ytterligare renderingskontroller:'],
      bullets: ['Gap Mode: None, Inset, Stroke eller Negative Space gap styling.', 'Hörnradie: Antal avrundade hörn för moduler.', 'Gradient: Ingen, linjär, radiell eller konisk gradient på moduler.', 'Ögon yttre/inre stil: Oberoende styling för ringar med hittamönster.', 'Punktrotation: Rotera diamant/punktmoduler.', 'Ögonskala: Storleksjustering för sökmönster.', 'Ramstil: Lägg till dekorativa ramar (rundad ram, klistermärke, tagg).', 'Ramtext: Lägg till text som "Skanna mig!" till ramar.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Avancerad QR-kodning',
      paragraphs: ['Finjustera QR-kodning:'],
      bullets: ['Kodningsläge: Auto, Numeriskt, Alfanumeriskt, Byte/UTF-8 eller Kanji.', 'Framtvinga min tysta zon: Se till att minst 4 modulers marginal är.', 'Maskmönster: Auto (optimal), eller manuellt välja mönster 0-7 för att styra moduldistribution. Olika mönster skapar olika visuella utseende samtidigt som man kodar samma data.', 'Karaktärskodning: ISO-8859-1 (latin-1 standard), UTF-8 (full Unicode inklusive emoji), eller Shift-JIS (japansk). Välj baserat på ditt innehålls karaktärskrav.'],
    },
    {
      heading: 'Avancerade utdataalternativ',
      paragraphs: ['Ytterligare exportinställningar:'],
      bullets: ['Filnamn: Anpassat filnamn för nedladdningar.', 'GIF-palettstorlek: 2-256 färger i GIF-utdata.', 'GIF Quantizer: Median Cut, NeuQuant eller Octree färgreduktion.', 'GIF-dithering: Av, Floyd-Steinberg eller beställd.', 'GIF Transparent Color: Ställ in en färg som ska vara transparent.', 'SVG True Vector: Använd sökvägar istället för inbäddat raster.', 'SVG Shape Precision: Pixel- eller Precise path-rendering.', 'SVG Embed Raster Overlay: Inkludera överlagring som inbäddad bild.', 'Background Override: Tvinga fram en specifik bakgrundsfärg i utdata.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Valideringsalternativ',
      paragraphs: ['Inställningar för indatabearbetning:'],
      bullets: ['Validera inmatning: Kontrollera innehållsformatet innan du kodar.', 'Trimma blanksteg: Ta bort inledande/efterföljande mellanslag.', 'Normalisera nyrader: Konvertera alla radslut till LF.', 'Max Length Guard: Varna om innehållet överskrider QR-kapaciteten.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Professionella funktioner',
      paragraphs: ['Professionell nivå lägger till vattenstämplar, metadata, delningsalternativ, säkerhetsanalys, betalnings-QR-koder och företagsfunktioner.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Vattenstämpel',
      paragraphs: ['Lägg till vattenstämplar i dina QR-koder:'],
      bullets: ['Typ: Text, Bild eller Mönster vattenstämpel.', 'Position: Mitt, hörn, kanter, bakom eller tyst zon.', 'Opacitet: Vattenstämpelgenomskinlighet (0-100%).', 'Blandningsläge: Normal, Multiplicera, Skärm eller Överläggsblandning.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Bädda in metadata i exporterade filer:'],
      bullets: ['Fälten Titel, Författare, Upphovsrätt, Licens, Beskrivning.', 'Skapandetid: Bädda in generations tidsstämpel.', 'Anpassat nyckel-värde: Lägg till godtyckliga metadatapar.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
      ],
    },
    {
      heading: 'Dela',
      paragraphs: ['Dela dina QR-kodkonfigurationer:'],
      bullets: ['Direktlänk: Generera en delbar URL med dina nuvarande inställningar.', 'Bädda in HTML: Få inbäddningskod för webbplatser.', 'Koda parametrar: Inkludera alla inställningar i den delade URL:en.', 'Obs! Överläggsbilder från lokala filer kan inte delas via URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Se relaterade guider och exempel', type: 'learn' },
      ],
    },
    {
      heading: 'Säkerhetsanalys',
      paragraphs: ['Se till att QR-koder förblir skanningsbara:'],
      bullets: ['Säkerhetsläge: Av, Balanserad eller Strikt skanningskrav.', 'Min modulstorlek: Minsta pixelstorlek per modul.', 'Min tysta zon: Minsta marginalmoduler.', 'Lock Finders/Timing/Align/Format/Version: Skydda specifika element.', 'Max Overlay Intensity by ECC: Automatiska intensitetsgränser baserat på felkorrigeringsnivå.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Se relaterade guider och exempel', type: 'learn' },
      ],
    },
    {
      heading: 'Innehållstyper (Professionell)',
      paragraphs: ['Professionell nivå lägger till betalnings- och företagsinnehållstyper:'],
      bullets: ['EPC/SEPA (EU): Europeisk banköverföring QR-koder med IBAN, BIC, belopp, referens.', 'UPI (Indien): Unified Payments Interface med VPA, betalningsmottagarens namn, belopp.', 'PayNow (Singapore): Singapore snabb betalning med UEN eller mobilnummer.', 'PromptPay (Thailand): Thailändska nationella betalningssystem.', 'PIX (Brasilien): Brasiliansk omedelbar betalning med PIX-nyckel.', 'Krypto: Bitcoin, Ethereum, Litecoin betalningsadresser med valfritt belopp.', 'Marknadskampanjlänk: URL:er med fullständig spårning av UTM-parameter (Marketing Tags).', 'Kort länk: För användning med URL-förkortare för dynamiska/spårbara QR-koder.', 'GS1 Digital Link: Produktidentifiering med GTIN, seriell, batch, utgångsdatum.', 'App Deep Link: iOS/Android app djuplänkar med anpassade scheman.', 'Anpassat format: rådata utan formatering eller validering.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Se relaterade guider och exempel', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Språkrelevanta betalningar i avancerat läge',
      paragraphs: ['När du använder Avancerat läge visar ANQR automatiskt betalningsmetoder som är relevanta för ditt valda språk. Till exempel ser vietnamesiska användare VietQR, thailändska användare ser PromptPay och indiska användare ser UPI och BharatQR. Globala betalningsmetoder (cryptocurrency, PayPal, Cash App) är tillgängliga för alla språk. Professionellt läge låser upp alla betalningsstandarder oavsett språk.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Europeiska betalningsstandarder',
      bullets: ['EPC/SEPA (EU): Europeiska QR-koder för banköverföringar enligt EPC QR Code Standard. Stöder IBAN, BIC (valfritt för inrikes), belopp i EUR och strukturerade eller ostrukturerade betalningsreferenser. Används i hela SEPA-zonen inklusive EU-länder plus Schweiz, Norge, Island, Liechtenstein, Monaco och San Marino.', 'Swiss QR-bill: schweizisk betalningsstandard enligt SIX Implementation Guidelines. Stöder CHF och EUR, QR-referens (QRR), kreditorreferens (ISO 11649), strukturerade borgenärs-/gäldenärsadresser och fakturainformation. Krävs för schweiziska fakturor sedan 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Indiska betalningsstandarder',
      bullets: ['UPI (Indien): Unified Payments Interface enligt NPCI Deep Linking Specification. Stöder VPA (Virtual Payment Address), betalningsmottagarens namn, belopp i INR, transaktionsnota, referens-ID, säljarkategorikod och transaktionsläge.', 'BharatQR (Indien): Unified QR-standard som stöder både UPI och kortbaserade betalningar. Kombinerar UPI VPA med kort PAN för maximal kompatibilitet. Inkluderar säljarens namn, stad, MCC, GST-information och faktura-/referensnummer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Sydostasiatiska betalningsstandarder',
      bullets: ['PayNow (Singapore): Singapores snabbbetalningssystem som använder EMVCo QR-specifikation med SGQR-profil. Stöder UEN (företagsregistrering), mobilnummer eller NRIC som proxyidentifierare. Inkluderar flagga för beloppsredigerbarhet och utgångsdatum.', 'PromptPay (Thailand): Thailändska nationella betalningssystem som följer Bank of Thailand EMV-profil. Stöder mobilnummer, nationellt ID, skatte-ID, e-plånboks-ID och fakturabetalning med flera referensfält.', 'QRIS (Indonesien): Snabbsvarskod Indonesisk standard. EMV-baserad nationell betalningsstandard som stöder säljar-ID, NMID (nationellt säljar-ID), klassificering av säljarkriterier och bekvämlighetsavgifter (fasta eller procentuella).', 'DuitNow (Malaysia): Malaysiskt system för omedelbar betalning. Stöder flera proxytyper inklusive NRIC, mobil, pass, armé-ID och företagsregistreringsnummer.', 'VietQR (Vietnam): Vietnamesisk standard för interbanköverföring. Kräver bank BIN (NAPAS-identifikation) och kontonummer. Stöder flera tjänstekoder för olika överföringstyper (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filippinerna): Filippinsk QR-betalningsstandard för InstaPay och PESONet. Använder kontonummer med säljaridentifikation för P2M-transaktioner (person-till-handlare).'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Östasiatiska betalningsstandarder',
      bullets: ['TWQR (Taiwan): Taiwanesisk QR-betalningsstandard. Stöder säljar-ID, skatte-ID och TWD-belopp.', 'HKQR/FPS (Hong Kong): QR-koder för Hong Kong Faster Payment System. Stöder FPS ID, mobilnummer eller e-post som betalningsidentifierare. Belopp i HKD.', 'JPQR (Japan): Japansk enhetlig betalningsstandard för QR-koder. Använder butiks-ID för säljaridentifiering med JPY-belopp.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Andra regionala betalningsstandarder',
      bullets: ['PIX (Brasilien): Brasilianska centralbankens omedelbara betalningssystem enligt BR-koden. Stöder PIX-nycklar (CPF, CNPJ, e-post, telefon eller slumpmässig nyckel), säljarens namn/ort, transaktions-ID och BRL-belopp.', 'AusPayNet/NPP PayID (Australien): Australian New Payments Platform PayID-system. Stöder PayID-typer (e-post, mobil, ABN, organisations-ID) eller traditionellt BSB + kontonummer. Säljarens namn är valfritt eftersom betalare ser det registrerade namnet från NPP-sökning.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Betalningar i kryptovaluta',
      bullets: ['Bitcoin/Litecoin (BIP-21): Standard betalnings-URI för kryptovaluta med plånboksadress, valfritt belopp och etikett. Kompatibel med alla större Bitcoin- och Litecoin-plånböcker.', 'Lightning Network (BOLT11): Lightning Network betalningsfakturor. Klistra in en BOLT11-kodad fakturasträng för omedelbara Bitcoin-betalningar med minimala avgifter.', 'Ethereum (EIP-681): Ethereum transaktionsbegäran URI:er som stöder infödda ETH-överföringar och ERC-20-tokenöverföringar. Inkluderar kedje-ID för stöd för flera nätverk (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gasparametrar och kontraktsfunktionsanrop.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Betalningslänktjänster',
      bullets: ['PayPal.Me: PayPal-betalningslänkar med användarnamn och valfritt ifyllt belopp. Mottagare kan betala via PayPal-saldo, kort eller bankkonton.', 'Cash App: Cash App betalningslänkar med $cashtag med valfritt belopp. Populärt i USA för peer-to-peer-betalningar.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Generisk EMV QR',
      bullets: ['EMV Generic: Skapa anpassade QR-koder för EMV Merchant-Presented Mode för betalningssystem som inte är specifikt listade. Konfigurera säljarens namn, stad, landskod (ISO 3166-1), valutakod (ISO 4217 numerisk), MCC, alternativ för tips/bekvämlighetsavgifter och ytterligare datafält. Användbar för testning eller anpassade integrationer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Överläggsblandningslägen (Professionell)',
      paragraphs: ['Ytterligare blandningslägen på professionell nivå:'],
      bullets: ['Pixelate: Pixelerad överlagringseffekt.', 'Kontur: Kantdetekteringsöverlägg som endast visar konturer.', 'Våg: Vågig distorsionseffekt.', 'Subpixelstorlek: Variabel subpixelstorlek baserat på bild.', 'True Dither: Avancerad dithering med ordnat matrisval.', 'Extrem: Maximal bildsynlighet, kan påverka skanningsbarheten.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Skyddsinställningar',
      paragraphs: ['Finkornig kontroll över vilka QR-element som är skyddade från överlagringsmodifiering:'],
      bullets: ['Bevara timing: Behåll timingmönster oförändrade.', 'Bevara justering: Behåll anpassningsmönster oförändrade.', 'Skydda formatinfo: Informationsmoduler för sköldformat.', 'Skydda versionsinformation: Shield versionsinformationsmoduler.'],
    },
    {
      heading: 'ECC-medvetet läge',
      paragraphs: ['Fördelar intelligent överlagringsintensitet baserat på felkorrigeringskapacitet. Systemet analyserar vilka moduler som kan modifieras med bibehållen skanningsbarhet.'],
      bullets: ['Riskbudget: Andel av felkorrigeringskapaciteten att använda (0-100%).', 'Högre budget = mer synlig överlagring men mer riskfylld genomsökning.', 'Lägre budget = säkrare skanning men mindre synlig överlagring.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Professionella renderingsalternativ',
      paragraphs: ['Avancerade renderingskontroller:'],
      bullets: ['Skarpa kanter: Använd pixlad bildåtergivning för skarpa modulkanter.', 'Pixel Snap: Golv-, Round- eller Ceil-pixeljustering.', 'Färgläge per modul: Solid, Efter Ljusstyrka, Efter Position, Efter Överlagring, Efter Kluster.', 'Färgpalett: Definiera anpassad färgpalett för färgsättning per modul.', 'Kontrastskydd: Säkerställ minsta kontrastförhållande mellan färgerna.', 'Min kontrastförhållande: WCAG-liknande kontrastkrav (1:1 till 21:1).', 'Extra kantmoduler: Ytterligare kant utanför tyst zon.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Professionella utdataalternativ',
      paragraphs: ['Exportinställningar för företag:'],
      bullets: ['DPI: Ställ in utskriftsupplösning (72-600 DPI). 300 DPI rekommenderas för utskrift.', 'Inkludera tyst zon: Växla tyst zon i utmatningsmått.', 'Exportera som ytterligare: Generera PDF tillsammans med primärt format.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'Animationsinställningar (Professionell)',
      paragraphs: ['Ytterligare professionella animationsfunktioner:'],
      bullets: ['Temporal Dither: Av, Blue Noise eller Flicker Säker vibrering per bildruta.', 'Mönster: Inga, Puls, Wave, Scanline, Shimmer eller Drift-effekter.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Se relaterade guider och exempel', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API-referens',
      paragraphs: ['ANQR tillhandahåller ett API på serversidan för att generera QR-koder via URL-parametrar. Detta är idealiskt för att bädda in QR-koder i webbplatser, e-postmeddelanden, dokument eller automatiserade arbetsflöden utan JavaScript på klientsidan.', 'Bas-URL: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Se QR-exempel', type: 'example' }],
    },
    {
      heading: 'Grundläggande parametrar',
      paragraphs: ['Obligatoriska och vanliga parametrar (parameternamn översätts inte):'],
      bullets: ['data (obligatoriskt): Innehållet som ska kodas i QR-koden. URL-koda specialtecken.', 'storlek: Bildstorlek i pixlar (standard: 400, max: 2000). Används om w/h inte anges.', 'w, h: Utdatabredd och höjd i pixlar. Åsidosätter storleksparameter.', 'format: Utdataformat - png, webp eller gif (standard: png).', 'ec: Felkorrigeringsnivå - L, M, Q eller H (standard: H).', 'fg: Förgrundsfärg som hex utan # (standard: 000000).', 'bg: Bakgrundsfärg som hex utan # (standard: ffffff).', 'transparent: Ställ in på 1 för transparent bakgrund.', 'marginal: Tyst zon i moduler (standard: 4).'],
    },
    {
      heading: 'Stylingparametrar',
      paragraphs: ['Modul- och mönsterstyling:'],
      bullets: ['stil: Modulstil - fyrkantig, rundad, prickar, diamant, ansluten.', 'Finder: Finder mönsterstil - fyrkantig, rundad, cirkel.', 'align: Alignment pattern style - match_finder, square, rounded, circle.', 'timing: Tidsmönsterstil - match_module, solid, streckad.', 'radie: Hörnradie procent 0-100.', 'gap: Modul gap procent 0-50.', 'gapMode: Gap-läge - ingen, infälld, stroke, negativ_mellanslag.', 'EyeOuter, eyeInner: Ögonstilar - fyrkantiga, rundade, cirklar.', 'eyeScale: Ögonskala i procent (standard: 100).', 'grad: Gradienttyp - ingen, linjär, radiell, konisk.', 'gradAngle: Gradientvinkel för linjära gradienter.', 'gradStops: Gradienten stannar som färg1,pos1,färg2,pos2,... (t.ex. ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Överlagringsparametrar',
      paragraphs: ['Alternativ för bildöverlagring (överlagringsbild hämtas på serversidan):'],
      bullets: ['img: URL till överlagringsbild (måste vara allmänt tillgänglig).', 'läge: Överlagringsläge - mitt, halvton, blandning, ljusstyrka, mosaik, vibrerat, blått brus, subpixel.', 'intensitet: Överlagringsintensitet 0-100 (standard: 100).', 'colorMode: Överlagringsfärgläge - färg, gråskala, bw.', 'passform: Hur överlägget passar - täcka, innehålla, sträcka.', 'röta: Överläggsrotation i grader.', 'flipX, flipY: Ställ in på 1 för att vända överlägg.', 'keepFinders: Bevara sökmönster (standard: 1).', 'keepTiming, keepAlign: Ställ in på 1 för att bevara timing/justeringsmönster.'],
    },
    {
      heading: 'Förbearbetningsparametrar',
      paragraphs: ['Bildförbehandling tillämpas på överlagring:'],
      bullets: ['ljusstyrka: Justering -100 till 100 (standard: 0).', 'kontrast: Justering -100 till 100 (standard: 0).', 'gamma: Värde 0,1 till 3 (standard: 1).', 'mättnad: Justering -100 till 100 (standard: 0).', 'nyans: Nyansrotation i grader.', 'oskärpa: Oskärpa i pixlar.', 'skärpa: skärpa mängd 0-100.', 'posterize: Posterize nivåer.', 'tröskel: Binär tröskel 0-255.', 'kant: Kantdetektering - off, sobel, canny.', 'invertera: Ställ in på 1 för att invertera färger.'],
    },
    {
      heading: 'Vattenstämpelparametrar',
      paragraphs: ['Lägg till vattenstämplar till genererade QR-koder:'],
      bullets: ['wmEn: Ställ in på 1 för att aktivera vattenstämpel.', 'wmKind: Typ av vattenstämpel - text, bild, mönster.', 'wmText: Vattenstämpeltext (URL-kodad).', 'wmImg: URL till vattenstämpelbild.', 'wmPos: Position - mitt, hörn, kanter, bakom, tyst_zon.', 'wmOpacitet: Opacitet 0-100 (standard: 50).', 'wmBlend: Blandningsläge - normal, multiplicera, skärm, överlägg.'],
    },
    {
      heading: 'Animationsparametrar',
      paragraphs: ['För animerad GIF-utdata (kräver format=gif):'],
      bullets: ['animPattern: Animationsmönster - ingen, puls, våg, skanningslinje, skimmer, drift, färgcykel.', 'animFrames: Antal bildrutor 1-60 (standard: 24).', 'animSpeed: Bildrutefördröjning i millisekunder 10-1000 (standard: 100).', 'animSeed: Slumpmässigt frö för animering.', 'easing: Animation easing - linjär, ease_in, ease_out, ease_in_out, studs.'],
    },
    {
      heading: 'Utgångsparametrar',
      paragraphs: ['Alternativ för utdataformat:'],
      bullets: ['kvalitet: WebP-kvalitet 0-1 (standard: 0,9).', 'webpQ: WebP-kvalitet 0-100 (standard: 90).', 'gifFärger: GIF-palettstorlek 2-256 (standard: 256).', 'dpi: Output DPI för PNG (standard: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: PNG-metadatafält.'],
    },
    // Crop Parameters
    {
      heading: 'Beskärningsparametrar',
      paragraphs: ['Alternativ för beskärning av överläggsbild:'],
      bullets: ['cropEn: Aktivera överläggsbeskärning 0/1 (standard: 0).', 'cropX: Crop center X som bråkdel 0-1 (standard: 0,5).', 'cropY: Beskärningscentrum Y som bråkdel 0-1 (standard: 0,5).', 'cropSize: Beskärningsstorlek som bråkdel av bilden 0-1 (standard: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Säkerhetslåsparametrar',
      paragraphs: ['Styr vilka QR-element som skyddas från överlagringsändringar:'],
      bullets: ['lockF: Låssökarmönster 0/1 (standard: 1).', 'lockT: Lås timingmönster 0/1 (standard: 1).', 'lockA: Lås inriktningsmönster 0/1 (standard: 1).', 'lockFmt: Låsformat info 0/1 (standard: 1).', 'lockV: Låsversionsinformation 0/1 (standard: 1).', 'safeMode: Säkert läge - av, balanserat, strikt (standard: av).', 'safeMinPx: Minsta modulstorlek i pixlar (standard: 2).', 'safeMinQz: Minimum tysta zonmoduler (standard: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Auto-tuning parametrar',
      paragraphs: ['Inställningar för automatisk optimering:'],
      bullets: ['autoVer: Välj QR-version 0/1 automatiskt (standard: 1).', 'autoEcc: Autovälj ECC-nivå 0/1 (standard: 0) - endast tips på serversidan.', 'autoReduce: [KLIENT-ENDAST] Minska automatiskt intensiteten tills det går att skanna - kräver skanningsvalideringsslinga.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Ytterligare animationsparametrar',
      paragraphs: ['Utökade animeringskontroller för GIF-utdata:'],
      bullets: ['loop: Animationsloopar kontinuerligt 0/1 (standard: 1).', 'bounce: Ping-pong animationsriktning 0/1 (standard: 0).', 'omvänd: Spela upp animation omvänt 0/1 (standard: 0).', 'colorCycle: Aktivera färgcykeleffekt 0/1 (standard: 0).', 'interp: Raminterpolation - ingen, övertoning, morph (standard: ingen).', 'tempDither: Temporal dithering - off, blue_noise, flicker_safe (standard: off).', 'startF: Startbild för animering (standard: 0).', 'maxF: Maximalt antal bilder att rendera (standard: 0 = auto).', 'stepF: Ramstegsintervall (standard: 1).', 'jitter: [KUNDEN ENDAST] Moduljitter i pixlar - kräver QR-regenerering per bildruta.'],
    },
    // Dithering Parameters
    {
      heading: 'Vibrerande parametrar',
      paragraphs: ['Styr dithering-algoritmer för överlagringsbehandling:'],
      bullets: ['ditherKind: Dither-algoritm - error_diffusion, ordered_bayer, blue_noise, etc (standard: ordered_bayer).', 'diffusionKernel: Error diffusion kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (standard: floyd_steinberg).', 'ditherStrength: Dither-intensitet 0-100 (standard: 50).', 'serpentine: Serpentine vibrering 0/1 (standard: 0).', 'matris: Ordnad slingringsmatris - bayer2, bayer4, bayer8 (standard: bayer4).', 'bnTile: Kakelstorlek med blått brus (standard: 64).', 'bnSeed: Slumpmässigt utsäde med blått brus (standard: 0).', 'colorDither: Färgdithering - ingen, per_kanal, perceptuell (standard: ingen).'],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixelparametrar',
      paragraphs: ['Inställningar för blandningsläge för underpixlar:'],
      bullets: ['spGrid: Subpixel rutnätsstorlek - 2x2, 3x3, 4x4 (standard: 3x3).', 'spCenter: Mittregel - strikt, halvtonscentrum (standard: strikt).', 'spNeutral: Neutral färg hex utan # (standard: 808080).', 'spFinder: Finder åsidosätta - solid, stiliserad (standard: solid).'],
    },
    // Halftone Parameters
    {
      heading: 'Halvtonsparametrar',
      paragraphs: ['Inställningar för halvtonsblandningsläge:'],
      bullets: ['htCell: Halvtonscellstorlek - per_modul eller nxn-rutnät (standard: per_modul).', 'htDot: Punktform - cirkel, kvadrat, linje (standard: cirkel).', 'htCurve: Ljusstyrkekurva - linjär, s-kurva, gamma (standard: linjär).', 'duo1: Duotone shadow color hex utan # (standard: 000000).', 'duo2: Duotone highlight color hex utan # (standard: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-medvetna lägesparametrar',
      paragraphs: ['Intelligent överlagringsfördelning baserad på felkorrigeringskapacitet:'],
      bullets: ['eccAware: Aktivera ECC-medvetet läge 0/1 (standard: 0).', 'eccRisk: Riskbudgetprocent 0-100 (standard: 50).', 'eccMap: Viktkarta - distance_to_finders, block_heatmap, empirical_scan_heatmap (standard: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Ramparametrar',
      paragraphs: ['Inställningar för dekorativa ramar:'],
      bullets: ['frame: Frame style - none, rounded_frame, sticker, tag (standard: none).', 'frameText: Text som ska visas i ram (URL-kodad).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Färgparametrar per modul',
      paragraphs: ['Individuella modulfärgningsalternativ:'],
      bullets: ['modColor: Färgläge - solid, by_brightness, by_position, by_overlay, by_cluster (standard: solid).', 'cGuard: Kontrastskydd 0/1 (standard: 0).', 'minContrast: Minsta kontrastförhållande 1-21 (standard: 4,5).', 'palett: Kommaseparerade hex-färger för palettläge.', 'paletteMode: Palettfördelning - position, ljusstyrka, diagonal, radiell, slumpmässig, rad, kolumn (standard: position).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF-överlagringsparametrar',
      paragraphs: ['Inställningar för animerade GIF-överlagringsbilder:'],
      bullets: ['ovType: Överläggstyp - statisk, gif, apng, webp_anim, video (standard: statisk).', 'ovFramePick: Val av ram - alla, varje_n, max_ramar, varaktighetsgräns (standard: alla).', 'gifDelays: Använd ursprungliga GIF-ramfördröjningar 0/1 (standard: 1).', 'gifDispH: GIF-avfallshantering - respektera, förenkla (standard: respekt).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Intensitetsgränser per ECC',
      paragraphs: ['Maximal överlagringsintensitet per felkorrigeringsnivå:'],
      bullets: ['maxIntL: Max intensitet för ECC L 0-100 (standard: 100).', 'maxIntM: Max intensitet för ECC M 0-100 (standard: 100).', 'maxIntQ: Max intensitet för ECC Q 0-100 (standard: 100).', 'maxIntH: Max intensitet för ECC H 0-100 (standard: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA-simuleringsparametrar (endast klient)',
      paragraphs: ['Dessa parametrar analyseras för URL-kompatibilitet men fungerar bara i webbläsaren:'],
      bullets: ['qaContrast: Aktivera kontrastkontroll 0/1 - kräver interaktiv validering.', 'qaBlur: Simulera oskärpa i pixlar - endast för interaktiva tester.', 'qaNoise: Simulera brusnivå - endast för interaktiva tester.', 'qaHeatmap: Visa värmekarta för läsbarhet 0/1 - kräver gränssnitt för canvas-överlagring.'],
    },
    // Client-Only Parameters
    {
      heading: 'Parametrar endast för klient',
      paragraphs: ['De flesta API-parametrar stöds fullt ut på serversidan. Parametrar märkta [KLIENT-ONLY] analyseras för URL-kompatibilitet men kräver webbläsarfunktioner:'],
      bullets: ['jitter: Moduljitter kräver QR-regenerering per bildruta med slumpmässighet.', 'autoReduce: Automatisk reducering av intensitet kräver iterativ skanningstestning.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: QA-simulering kräver interaktiv dukvalidering.'],
    },
    // Additional Output Parameters
    {
      heading: 'Ytterligare utgångsparametrar',
      paragraphs: ['Utökade utdata- och exportinställningar:'],
      bullets: ['fname: Anpassat filnamn för nedladdningar (standard: anqr-qrcode).', 'inclQz: Inkludera tyst zon i utgångsmått 0/1 (standard: 1).', 'bgOver: Bakgrundsfärg åsidosätter hex utan # (åsidosätter bg-parameter).', 'fmtExtra: Ytterligare formatutdata - ingen, eps, animated_webp (standard: ingen). Obs: eps är [DELVIS].', 'svgPrec: SVG-formprecision - pixel, precis (standard: pixel). [DELVIS] SVG-utdata begränsad server-sida.', 'svgBädda in: Bädda in rasteröverlägg i SVG 0/1 (standard: 1). [DELVIS] SVG-utdata begränsad server-sida.', 'modulePx: Modulens pixelstorlek (standard: automatiskt beräknad från storlek).', 'border: Extra kantmoduler bortom tyst zon (standard: 0).', 'crisp: Aktivera skarp/pixelerad bildåtergivning 0/1 (standard: 1).', 'snap: Pixel snap mode - golv, rund, tak (standard: golv).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parametrar för mönsterbevarande',
      paragraphs: ['Kontrollera vilka strukturella element som skyddas från överlagring:'],
      bullets: ['keepFinders: Bevara sökmönster 0/1 (standard: 1).', 'keepTiming: Bevara timingmönster 0/1 (standard: 0).', 'keepAlign: Bevara justeringsmönster 0/1 (standard: 0).', 'protectFmt: Skydda formatinformationsmoduler 0/1 (standard: 0).', 'protectVer: Skydda versionsinformationsmoduler 0/1 (standard: 0).'],
    },
    {
      heading: 'Exempel på användning',
      paragraphs: ['Grundläggande QR-kod:', 'https://anqr.link/api/qr?data=https://example.com', 'Styled QR-kod med anpassade färger:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'QR-kod med överläggsbild:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'Animerad GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Se QR-exempel', type: 'example' }],
    },
    {
      heading: 'Bädda in QR-koder',
      paragraphs: ['I professionellt läge genererar Share-funktionen inbäddningsbara HTML och URL:er. Så här fungerar inbäddning:'],
      bullets: ['Dela länk: Skapar en URL till ANQR-appen med alla dina inställningar kodade som URL-parametrar. Mottagare kan visa och ändra QR-koden.', 'Bädda in bild: Genererar en <img>-tagg som pekar på serverns API. QR-koden renderas på serversidan och tjänade som en bild.', 'Bädda in Markdown: Skapar Markdown-bildsyntax för dokumentation och README-filer.', 'Direkt API URL: Den råa API URL för användning i applikationer, skript eller andra integrationer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
    {
      heading: 'HTML-exempel',
      paragraphs: ['Så här bäddar du in en QR-kod på din webbplats:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR-kod" />', 'För responsiv storlek:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR-kod" style="max-width: 100%; height: auto;" />', 'Servern cachar svar med långa cachehuvud, så upprepade förfrågningar om samma URL går snabbt.'],
    },
    {
      heading: 'Dela URL-format',
      paragraphs: ['När du klickar på Dela i professionellt läge kodar ANQR dina nuvarande inställningar till URL-parametrar. Formatet är:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Dessa parametrar speglar API-parametrarna, så du kan konvertera en delad URL till en API URL genom att ändra bassökvägen från / till /api/qr och justera w/h parametrar efter behov.', 'Obs! Överlagringsbilder som laddats upp från lokala filer kan inte delas via URL - endast URL-baserade överlagringar (img-parameter) fungerar i delade länkar och API-anrop.'],
    },
    {
      heading: 'Prisgränser och användning',
      paragraphs: ['API:et är gratis att använda för rimliga volymer. För användning i hög volym eller kommersiella applikationer som kräver garanterad drifttid, vänligen kontakta oss.', 'API-svar inkluderar aggressiva cachningsrubriker. För bästa prestanda, cachelagra svar på din sida eller använd samma URL konsekvent för identiska QR-koder.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Bästa metoder',
      paragraphs: ['Följ dessa riktlinjer för tillförlitliga QR-koder:'],
      bullets: ['Testa alltid dina QR-koder med flera skannerappar innan du skriver ut.', 'Använd felkorrigering H (hög) när du lägger till överlägg.', 'Behåll minst 4 moduler tyst zon (marginal).', 'Säkerställ hög kontrast mellan förgrund och bakgrund.', 'För utskrift, använd minst 300 DPI och testa med verklig utskriftsstorlek.', 'Aktivera Bevara Finder Patterns när du använder överlägg.', 'Börja med lägre överlagringsintensitet och öka gradvis.', 'För utomhusbruk, överväg större modulstorlekar och högre felkorrigering.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Bläddra Lär artiklar', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Se QR-exempel', type: 'example' },
      ],
    },
    {
      heading: 'Felsökning',
      paragraphs: ['Vanliga problem och lösningar:'],
      bullets: ['QR kommer inte att skanna: Minska överlagringsintensiteten, öka felkorrigeringen, kontrollera kontrasten.', 'Koden är för stor: Minska innehållslängden, använd URL-förkortare, lägre version.', 'Suddig utdata: Öka modulstorleken, använd PNG istället för komprimerade format.', 'Färgerna ser fel ut: Kontrollera färgkontrasten, prova gråskaleöverlagringsläget.', 'GIF animerar inte: Se till att använda utdata i GIF-format, kontrollera antalet bildrutor.', 'Bildöverlägg laddas inte: Kontrollera CORS-behörigheter på fjärrbilder.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Se relaterade guider och exempel', type: 'learn' }],
    },
    {
      heading: 'Kortkommandon',
      paragraphs: ['ANQR stöder vanliga kortkommandon. Använd Ctrl/Cmd+S för att utlösa export (när du fokuserar på förhandsgranskningen).'],
    },
    {
      heading: 'Delning & inbäddning',
      paragraphs: ['I professionellt läge klickar du på knappen Dela för att kopiera en URL med dina nuvarande inställningar. Mottagarna kan öppna den här webbadressen för att se din exakta konfiguration. Obs! Överläggsbilder från lokala filer kan inte delas via URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Prova denna konfiguration direkt i ANQR-generatorn.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Bläddra Lär artiklar', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Se QR-exempel', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Se QR-exempel', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Öppna generatorn', type: 'generator' },
  ],
};

export default guide;
