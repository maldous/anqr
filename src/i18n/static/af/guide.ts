import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR Gebruikersgids',
  description: 'Volledige gids vir die gebruik van ANQR vir die skep van QR-kodes.',
  lastUpdated: '1 Februarie 2026',
  breadcrumb: ['Gids'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Maak die kragopwekker oop', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Blaai deur Leer artikels', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Aan die gang',
      paragraphs: ['ANQR is \'n QR-kode-opwekker met \'n kliënt-eerste benadering. QR-kodes word by verstek plaaslik in jou blaaier gegenereer - geen rekening benodig nie en jou data bly privaat. Vir professionele inbedding, kan jy ook die bediener-kant API gebruik.', 'Die koppelvlak het drie koppelvlakvlakke: Basies, Gevorderd en Professioneel. Kies jou vlak deur die oortjies in die kopskrif te gebruik. Elke vlak ontsluit bykomende kenmerke terwyl die koppelvlak gefokus word op wat jy nodig het.'],
      bullets: ['Basies: Eenvoudige QR-kode-skepping met gewone teks/URL-inhoud en beeldoorleg.', 'Gevorderd: QR-enkodering opsies, weergawe style, animasie, uitvoer formate, uitgebreide inhoud tipes, en oorleg aanpassing.', 'Professioneel: Watermerke, metadata, deel, veiligheidsanalise, betalings-QR-kodes en ondernemingskenmerke.'],
      links: [{ href: '/?lang=${lang}', label: 'Maak die kragopwekker oop', type: 'generator' }],
    },
    {
      heading: 'Vinnige Begin',
      paragraphs: ['Om jou eerste QR-kode te skep:'],
      bullets: ['1. Kies \'n inhoudtipe (URL, teks, WiFi, ens.) uit die Inhoudtipe aftreklys.', '2. Voer jou data in die verskafde velde in.', '3. Pas opsioneel kleure, style aan en voeg \'n oorlegprent by.', '4. Klik Uitvoer om jou QR-kode as PNG, GIF, WebP of SVG af te laai.'],
      links: [{ href: '/?lang=${lang}', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Basiese kenmerke',
      paragraphs: ['Die Basiese vlak bied \'n vaartbelynde koppelvlak vir die skep van QR-kodes met loonvrag-inhoud en beeldoorlegsels. Dit is die eenvoudigste manier om te begin.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Inhoudtipes (Basies)',
      paragraphs: ['Gewone teks: Enkodeer enige teks tot die QR-kode kapasiteit limiet. Ideaal vir kort boodskappe, kodes of identifiseerders.', 'URL: Enkodeer webadresse. Die QR-kode sal die URL oopmaak wanneer dit geskandeer word. Ondersteun http://- en https://-protokolle.'],
    },
    {
      heading: 'Prentoorleg (Basies)',
      paragraphs: ['Laai \'n prent op (JPG, PNG, GIF, WebP) om met jou QR-kode te meng. Basiese oorlegkenmerke sluit in:'],
      bullets: ['Laai op vanaf lêer: Kies \'n prent vanaf jou toestel.', 'Laai vanaf URL: Voer \'n prent-URL in (moet CORS toelaat).', 'Sentrumlogo: Plaas prent in die middel, vertrou op foutkorreksie.', 'Versnit: Eenvoudige alfa-vermenging van beeld met QR-patroon.', 'Intensiteit: Beheer hoe sterk die oorleg die QR-kode beïnvloed (0-100%).', 'Kleurmodus: Volkleur, Grysskaal of Swart en Wit.', 'Bewaar Finder-patrone: hou hoekpatrone onveranderd vir betroubare skandering.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Sien verwante gidse en voorbeelde', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Gevorderde kenmerke',
      paragraphs: ['Die Gevorderde vlak ontsluit QR-enkoderingsopsies, weergawestyle, animasie, uitvoerformate, uitgebreide inhoudtipes en gevorderde oorleg-aanpassing.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'QR-enkodering-instellings',
      paragraphs: ['Weergawe: QR-kodes kom in weergawes 1-40 voor, met hoër weergawes wat meer data bevat, maar groter is. Stel op 0 (Outo) om ANQR die kleinste weergawe te laat kies wat by jou inhoud pas.', 'Foutkorreksie: Bepaal hoeveel skade \'n QR-kode kan opdoen terwyl dit skandeerbaar bly.'],
      bullets: ['L (Laag): 7% foutkorreksie - kleinste grootte, minste oortolligheid.', 'M (Medium): 15% foutkorreksie - gebalanseerde opsie.', 'Q (Kwartiel): 25% foutkorreksie - goed vir gedrukte kodes.', 'H (Hoog): 30% foutkorreksie - die beste vir kodes met oorlegsels of in moeilike toestande.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Stil sone (marge)',
      paragraphs: ['Die stil sone is die wit spasie rondom die QR-kode. Skandeerders het hierdie kantlyn nodig om vas te stel waar die kode begin. Die standaard beveel ten minste 4 modules aan. Vermindering tot onder 4 kan skanderingsprobleme veroorsaak.'],
    },
    {
      heading: 'Module Styl',
      paragraphs: ['Modules is die individuele blokkies waaruit \'n QR-kode bestaan. ANQR bied vyf style:'],
      bullets: ['Vierkant: Klassieke QR-voorkoms met skerp hoeke.', 'Gerond: Versagde hoeke vir \'n vriendeliker voorkoms.', 'Punte: Omsendbrief modules vir \'n moderne estetiese.', 'Diamant: 45° gedraaide vierkante vir \'n kenmerkende patroon.', 'Gekoppel: Modules smelt saam wanneer dit aangrensend is, wat organiese vorms skep.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Finder Patroon Styl',
      paragraphs: ['Vinderpatrone is die drie groot blokkies in QR-hoeke wat skandeerders help om die kode te oriënteer. Beskikbare style:'],
      bullets: ['Vierkant: Standaard vierkantige hoeke.', 'Gerond: Versagde hoeke wat ooreenstem met afgeronde modulestyl.', 'Sirkel: Sirkelvormige vindpatrone vir kolletjie-styl kodes.'],
    },
    {
      heading: 'Belyning en tydsberekeningpatrone',
      paragraphs: ['Belyningspatrone verskyn in groter QR-kodes (weergawe 2+) om vervorming te help regstel. Tydpatrone is die afwisselende lyne wat vindpatrone verbind.'],
      bullets: ['Belyningstyl: Pas Finder, Vierkant, Gerond of Sirkel.', 'Tydsberekeningstyl: Pasmodule, solied of stippellyn.'],
    },
    {
      heading: 'Kleure',
      paragraphs: ['Voorgrond: Die kleur van die QR-modules. Swart (#000000) is standaard maar enige donker kleur werk.', 'Agtergrond: Die agtergrondkleur. Wit (#ffffff) is standaard. Verseker voldoende kontras met die voorgrond.', 'Deursigtige agtergrond: Verwyder die agtergrond heeltemal vir gebruik op gekleurde oppervlaktes. Maak seker dat die oppervlak voldoende kontras bied.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Modulegrootte en gaping',
      paragraphs: ['Modulegrootte: Beheer hoe groot elke module in pixels gelewer word. Groter waardes skep groter kodes wat makliker is om te skandeer.', 'Modulegaping: Voeg spasie tussen modules as \'n persentasie by. Klein gapings (5-15%) kan skandeerbaarheid in sommige toestande verbeter, maar oormatige gapings verminder betroubaarheid.'],
    },
    {
      heading: 'Uitset instellings',
      paragraphs: ['Formaat: Kies jou uitvoerformaat gebaseer op gebruiksgeval.'],
      bullets: ['PNG: Verlieslose rasterformaat, ideaal vir die meeste gebruike. Beste vir druk en digitaal.', 'WebP: Moderne formaat met kleiner lêergroottes. Goed vir webgebruik.', 'GIF: Vereis vir geanimeerde QR-kodes. Ondersteun deursigtigheid.', 'SVG: Vektorformaat wat oneindig skaal. Beste vir grootdruk of wanneer jy die kode moet wysig.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Sien verwante gidse en voorbeelde', type: 'learn' },
      ],
    },
    {
      heading: 'Uitset afmetings',
      paragraphs: ['Breedte/Hoogte: Stel die uitvoergrootte in pieksels. Vir drukwerk, bereken op grond van DPI (bv. 300 DPI by 1 duim = 300px). Groter groottes skandeer meer betroubaar op afstand.'],
    },
    {
      heading: 'Animasie-instellings (gevorderd)',
      paragraphs: ['Beheer geanimeerde QR-kode gedrag:'],
      bullets: ['Spoed: Animasie raamtempo in millisekondes.', 'Loop: Deurlopende of enkelspeel-animasie.', 'Weering: Tafeltennis-animasierigting.', 'Begin raam: Begin animasie vanaf spesifieke raam.', 'Max Frames: Beperk totale rame in animasie.', 'Raamstap: Slaan rame oor vir vinniger animasie.', 'Interpolasie: Geen, Crossfade, of Morph tussen rame.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Sien verwante gidse en voorbeelde', type: 'learn' },
      ],
    },
    {
      heading: 'Inhoudtipes (Gevorderd)',
      paragraphs: ['Gevorderde vlak ontsluit bykomende loonvragformate:'],
      bullets: [
        'Telefoonnommer (tel:): Skep \'n oproepbare telefoonskakel.',
        'E-pos (mailto:): Maak e-poskliënt oop met opsionele onderwerp en liggaam.',
        'SMS: Vooraf ingevulde teksboodskap na \'n telefoonnommer.',
        'vCard: Volledige kontakkaart met naam, organisasie, telefoon, e-pos, adres.',
        'MeCard: Kompakte kontakformaat wat gewild is in Japan.',
        'BizCard: Legacy besigheidskaartjie-formaat.',
        'Geo-ligging: GPS-koördinate wat in kaarte oopmaak.',
        'WiFi: Netwerkbewyse vir outomatiese verbinding (SSID, wagwoord, tipe sekuriteit).',
        'Kalendergebeurtenis: iCalendar-formaat met titel, ligging, datum/tyd.',
        'Geleentheid RSVP: Skakel na gebeurtenis registrasie bladsy.',
        'Kalender Teken in: Teken in op \'n ICS/WebCal voer.',
        'Lêer/dokument URL: Direkte skakel na aflaaibare lêers.',
        'Wolkbergingskakel: skakels na Google Drive, Dropbox, OneDrive, ens.',
        'Sosiale profiel: Skakels na LinkedIn, Twitter, Instagram, ens.',
        'Boodskapskakel: WhatsApp, Telegram, Sein diep skakels.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Gevorderde oorleg-kenmerke',
      paragraphs: ['Bykomende oorlegvermoëns:'],
      bullets: ['Sny: Aktiveer snoei om \'n vierkantige streek van jou prent te kies.', 'Halftoon: Klassieke drukstyl-puntpatroon gebaseer op beeldhelderheid.', 'Dithered: Fout-diffusie-dithering vir gedetailleerde reproduksie.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Oorlegmengselmodusse (gevorderd)',
      paragraphs: ['Bykomende versnitmodusse op Gevorderde vlak:'],
      bullets: ['Subpixel: Verdeel elke module in subpixels vir hoër detail.', 'Blue Noise: Gebruik blou geraas-dithering vir artefakvrye patrone.', 'Mosaïek: Teëlgebaseerde effek wat beeldstruktuur behou.', 'Gap Fill: Plaas beeld in gapings tussen modules.', 'Helderheid: wissel modulegrootte gebaseer op beeldhelderheid.', 'Duotoon: karteer beeld na twee kleure vir treffende kontras.'],
    },
    {
      heading: 'Overlay-intensiteit',
      paragraphs: ['Beheer hoe sterk die oorleg die QR-kode beïnvloed (0-100%). Hoër waardes wys meer beelddetail, maar kan skandeerbaarheid verminder. Begin ongeveer 70% en pas aan op grond van toetsing.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Sien verwante gidse en voorbeelde', type: 'learn' }],
    },
    {
      heading: 'Kleurmodus',
      paragraphs: ['Hoe die oorlegprent verwerk word:'],
      bullets: ['Volkleur: Behou oorspronklike beeldkleure.', 'Grysskaal: Skakel oor na swart en wit kleure.', 'Swart en Wit: Binêre omskakeling met hoë kontras.'],
    },
    {
      heading: 'Bewaar Finder-patrone',
      paragraphs: ['Wanneer dit geaktiveer is, hou die drie hoekvindpatrone ongewysig deur die oorleg. Sterk aanbeveel vir betroubare skandering.'],
    },
    {
      heading: 'Beeldvoorverwerking',
      paragraphs: ['Pas filters op jou oorlegprent toe voordat jy dit meng. Hierdie aanpassings kan verbeter hoe die beeld in die finale QR-kode verskyn.'],
      bullets: ['Helderheid (-100 tot +100): Maak die prent ligter of donkerder.', 'Kontras (-100 tot +100): Verhoog of verminder toonreeks.', 'Gamma (0.2 tot 3.0): Nie-lineêre helderheidsaanpassing. Waardes onder 1 maak middeltone ligter, bo 1 verdonker hulle.', 'Versadiging (-100 tot +100): Kleurintensiteit. -100 is grysskaal, +100 is oorversadig.', 'Hue Rotate (0-360°): Verskuif alle kleure om die kleurwiel.', 'Vervaag (0-20px): Versag prentbesonderhede.', 'Verskerp (0-100%): Verbeter rande en besonderhede.', 'Plakkaat (0-16 vlakke): Verminder kleurvlakke vir \'n plakkaat-effek.', 'Drempel (0-255): Skakel om na binêre swart/wit by afsnypunt.', 'Randopsporing: Sobel- of Canny-algoritmes om slegs rande te wys.', 'Keer om: Keer alle kleure om.'],
    },
    {
      heading: 'Pasmodus',
      paragraphs: ['Hoe die oorlegprent by die QR-kode-area pas:'],
      bullets: ['Omslag: Beeld vul die hele area, sny indien nodig.', 'Bevat: Hele prent sigbaar, kan kantlyne hê.', 'Strek: Beeld vervorm om presies te vul.'],
    },
    {
      heading: 'Transformasie opsies',
      paragraphs: ['Rotasie: Draai oorleg in 90° inkremente.', 'Flip X/Y: Spieël die prent horisontaal of vertikaal.'],
    },
    {
      heading: 'Dithering Algoritmes',
      paragraphs: ['Dithering skakel deurlopende toonbeelde om na patrone wat QR-kodes kan verteenwoordig. Beskikbaar wanneer dithered, Blue Noise, of True Dither-versnitmodusse gebruik word.'],
      bullets: [
        'Foutverspreiding: Klassieke Floyd-Steinberg-styl. Versprei kwantiseringsfout na naburige pixels.',
        'Bestel (Bayer): Gebruik \'n drempelmatriks vir gereelde patrone.',
        'Gegroepeerde kolletjie: Simuleer halftoondrukwerk.',
        'Void & Cluster: Geoptimaliseerde geordende dithering.',
        'Blou Geraas: Visueel aangename ewekansige patroon.',
        'Blou Geraas Drempel: Drempel-dithering met blou geraas tekstuur.',
        'Wit Geraas: Willekeurige drumpelwisseling.',
        'Gaussiese/Driehoekige Geraas: Geraas met verskillende verspreidings.',
        'Blou geraas + foutverspreiding: hibriede wat beide tegnieke kombineer.',
        'Geskermde blou geraas: Skermagtige blou geraaspatroon.',
        'Perseptueel: Luminansie-geweeg vir beter visuele resultate.',
        'Randbewus: Behou beeldrande tydens dithering.',
        'Aanpasbare drempel: Plaaslik-aanpasbare drempel.',
        'Temporele Blou Geraas: Vir geanimeerde GIF\'s, wissel patroon per raam.',
      ],
    },
    {
      heading: 'Diffusiepitte',
      paragraphs: ['Kies hoe fout versprei word wanneer u Foutdiffusie-dithering gebruik:'],
      bullets: ['Floyd-Steinberg: Klassieke 4-buurdiffusie. Goeie algemene keuse.', 'Jarvis-Judice-Ninke: 12-buurman, gladder maar stadiger.', 'Stucki: Soortgelyk aan JJN met verskillende gewigte.', 'Burkes: Vereenvoudigde JJN, vinniger.', 'Sierra: Familie van pitte wat kwaliteit en spoed balanseer.', 'Atkinson: Ligte verspreiding, bewaar detail maar kan korrelrig wees.'],
    },
    {
      heading: 'Dither Sterkte',
      paragraphs: ['Beheer hoeveel dithering toegepas word (0-100%). Laer waardes behou meer van die oorspronklike patroon, hoër waardes wys meer beelddetail.'],
    },
    {
      heading: 'Subpixel-instellings',
      paragraphs: ['Wanneer u Subpixel-versnitmodus gebruik:'],
      bullets: ['Roostergrootte: 2×2, 3×3 of 4×4 subpixels per module. Hoër = meer detail.', 'Middelreël: Streng vereis middelste subpixel om by module te pas. Halftoonsentrum laat variasie toe.', 'Neutrale kleur: Kleur wat gebruik word vir onbepaalde subpixels.', 'Finder Override: Hoe vinderpatrone weergegee word (Solied of Gestileerd).'],
    },
    {
      heading: 'Halftooninstellings',
      paragraphs: ['Wanneer Halftoon-versnitmodus gebruik word:'],
      bullets: ['Selgrootte: Per Module of N×N-rooster.', 'Puntvorm: sirkel, vierkant of lyn.', 'Helderheidskromme: Lineêr, S-kromme of Gamma.'],
    },
    {
      heading: 'Duotoon kleure',
      paragraphs: ['Wanneer jy Duotoon-versnitmodus gebruik, stel die Skadukleur (donker areas) en Hoogtepuntkleur (helder areas) in.'],
    },
    {
      heading: 'GIF-animasie-instellings',
      paragraphs: ['Wanneer geanimeerde GIF-oorlegsels gebruik word:'],
      bullets: ['Gebruik raamvertragings: Respekteer oorspronklike GIF-tydsberekening.', 'Maksimum FPS: Beperk raamtempo (1-60 fps).', 'Hantering van wegdoening: Respekteer of vereenvoudig raamwegdoeningsmetodes.'],
    },
    {
      heading: 'Gevorderde weergawe-opsies',
      paragraphs: ['Bykomende weergawekontroles:'],
      bullets: ['Gapingmodus: Geen, Insetsel, Beroerte of Negatiewe Spasiegapingstilering.', 'Hoek Radius: Afgeronde hoeke persentasie vir modules.', 'Gradiënt: Geen, Lineêre, Radiale of Koniese gradiënt op modules.', 'Oog buitenste/binne styl: onafhanklike stilering vir vindpatroonringe.', 'Puntrotasie: Draai diamant-/kolmodules.', 'Oogskaal: Grootteaanpassing vir vindpatrone.', 'Raamstyl: Voeg dekoratiewe rame by (geronde raam, plakker, etiket).', 'Raamteks: Voeg teks by soos "Scan Me!" aan rame.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Gevorderde QR-kodering',
      paragraphs: ['Verfyn QR-kodering:'],
      bullets: ['Enkoderingsmodus: Outo, Numeries, Alfanumeries, Byte/UTF-8 of Kanji.', 'Dwing Min Stilte Sone af: Verseker ten minste 4 module-marge.', 'Maskerpatroon: Outo (optimaal), of kies handmatig patrone 0-7 om moduleverspreiding te beheer. Verskillende patrone skep verskillende visuele voorkoms terwyl hulle dieselfde data enkodeer.', 'Karakterkodering: ISO-8859-1 (Latyn-1 verstek), UTF-8 (volledige Unicode insluitend emoji), of Shift-JIS (Japannees). Kies op grond van jou inhoud se karaktervereistes.'],
    },
    {
      heading: 'Gevorderde uitvoeropsies',
      paragraphs: ['Bykomende uitvoerinstellings:'],
      bullets: ['Lêernaam: Pasgemaakte lêernaam vir aflaaie.', 'GIF-paletgrootte: 2-256 kleure in GIF-uitvoer.', 'GIF Quantizer: Mediaan Cut, NeuQuant of Octree-kleurvermindering.', 'GIF-dithering: Af, Floyd-Steinberg, of bestel.', 'GIF Deursigtige Kleur: Stel \'n kleur om deursigtig te wees.', 'SVG True Vector: Gebruik paaie in plaas van ingebedde raster.', 'SVG-vormpresisie: Pixel- of Presiese padweergawe.', 'SVG Embed Raster Overlay: Sluit oorleg in as ingebedde prent.', 'Agtergrond ignoreer: Dwing \'n spesifieke agtergrondkleur in afvoer.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Validasie-opsies',
      paragraphs: ['Invoerverwerkingsinstellings:'],
      bullets: ['Bevestig invoer: Kontroleer inhoudformaat voor enkodering.', 'Sny witspasie: Verwyder voorste/agterste spasies.', 'Normaliseer nuwe lyne: Skakel alle lyne om na LF.', 'Max Length Guard: Waarsku as inhoud QR-kapasiteit oorskry.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Professionele kenmerke',
      paragraphs: ['Die professionele vlak voeg watermerke, metadata, deelopsies, veiligheidsanalise, betalings-QR-kodes en ondernemingskenmerke by.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Watermerk',
      paragraphs: ['Voeg watermerke by jou QR-kodes:'],
      bullets: ['Soort: teks-, prent- of patroonwatermerk.', 'Posisie: Sentrum, Hoeke, Rande, Agter of Stil Sone.', 'Deursigtigheid: Watermerk deursigtigheid (0-100%).', 'Versnitmodus: Normaal-, Vermenigvuldig-, Skerm- of Overlay-vermenging.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Bed metadata in uitgevoer lêers:'],
      bullets: ['Titel, outeur, kopiereg, lisensie, beskrywing velde.', 'Skeppingstyd: Sluit generasie tydstempel in.', 'Gepasmaakte sleutelwaarde: Voeg arbitrêre metadatapare by.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
      ],
    },
    {
      heading: 'Deel',
      paragraphs: ['Deel jou QR-kode-konfigurasies:'],
      bullets: ['Direkte skakel: Genereer \'n deelbare URL met jou huidige instellings.', 'Embed HTML: Kry inbedkode vir webwerwe.', 'Enkodeer parameters: Sluit alle instellings in die deel-URL in.', 'Let wel: Oorlegbeelde van plaaslike lêers kan nie via URL gedeel word nie.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Sien verwante gidse en voorbeelde', type: 'learn' },
      ],
    },
    {
      heading: 'Veiligheidsanalise',
      paragraphs: ['Maak seker dat QR-kodes skandeerbaar bly:'],
      bullets: ['Veiligheidsmodus: Af, Gebalanseerd of Streng skanderingsvereistes.', 'Minimum Module Grootte: Minimum pixel grootte per module.', 'Min Stilte Sone: Minimum marge modules.', 'Sluit Finders/Tydsberekening/Belyning/Formaat/Weergawe: Beskerm spesifieke elemente.', 'Max Overlay Intensity by ECC: Outomatiese intensiteitsbeperkings gebaseer op foutkorreksievlak.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Sien verwante gidse en voorbeelde', type: 'learn' },
      ],
    },
    {
      heading: 'Inhoudtipes (professioneel)',
      paragraphs: ['Professionele vlak voeg betalings- en ondernemingsinhoudtipes by:'],
      bullets: ['EPC/SEPA (EU): Europese bankoordrag QR-kodes met IBAN, BIC, bedrag, verwysing.', 'UPI (Indië): verenigde betalingskoppelvlak met VPA, naam van die begunstigde, bedrag.', 'PayNow (Singapoer): Singapoer vinnige betaling met UEN of selfoonnommer.', 'PromptPay (Thailand): Thai nasionale betalingstelsel.', 'PIX (Brasilië): Brasiliaanse kitsbetaling met PIX-sleutel.', 'Crypto: Bitcoin, Ethereum, Litecoin betalingsadresse met opsionele bedrag.', 'Bemarkingsveldtogskakel: URL\'s met volledige UTM-parameter (Bemarkingsmerkers) dop.', 'Kort skakel: Vir gebruik met URL-verkorters vir dinamiese/naspoorbare QR-kodes.', 'GS1 Digital Link: Produk-identifikasie met GTIN, reeks, bondel, verstryking.', 'App Deep Link: iOS/Android app diep skakels met pasgemaakte skemas.', 'Pasgemaakte formaat: Rou data sonder formatering of validering.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Sien verwante gidse en voorbeelde', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Taalrelevante betalings in gevorderde modus',
      paragraphs: ['Wanneer jy Gevorderde modus gebruik, wys ANQR outomaties betaalmetodes wat relevant is vir jou geselekteerde taal. Byvoorbeeld, Viëtnamese gebruikers sien VietQR, Thai-gebruikers sien PromptPay, en Indiese taalgebruikers sien UPI en BharatQR. Globale betaalmetodes (cryptocurrency, PayPal, Cash App) is beskikbaar vir alle tale. Professionele modus ontsluit alle betalingstandaarde, ongeag die taal.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Europese Betalingstandaarde',
      bullets: ['EPC/SEPA (EU): Europese bankoorplasings QR-kodes wat die EPC QR-kodestandaard volg. Ondersteun IBAN, BIC (opsioneel vir huishoudelike), bedrag in EUR, en gestruktureerde of ongestruktureerde betalingsverwysings. Word oor die SEPA-sone gebruik, insluitend EU-lande plus Switserland, Noorweë, Ysland, Liechtenstein, Monaco en San Marino.', 'Switserse QR-rekening: Switserse betalingstandaard volgens SES Implementeringsriglyne. Ondersteun CHF en EUR, QR-verwysing (QRR), krediteurverwysing (ISO 11649), gestruktureerde krediteure-/debiteureadresse en rekeninginligting. Vereis vir Switserse fakture sedert 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Indiese betalingstandaarde',
      bullets: ['UPI (Indië): Unified Payments Interface volgens NPCI Deep Link Spesifikasie. Ondersteun VPA (Virtuele Betalingsadres), naam van die begunstigde, bedrag in INR, transaksienota, verwysings-ID, handelaarkategoriekode en transaksiemodus.', 'BharatQR (Indië): verenigde QR-standaard wat beide UPI- en kaartgebaseerde betalings ondersteun. Kombineer UPI VPA met kaart PAN vir maksimum verenigbaarheid. Sluit handelaarnaam, stad, MCC, GST-besonderhede en faktuur-/verwysingsnommers in.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Suidoos-Asiatiese betalingstandaarde',
      bullets: ['PayNow (Singapoer): Singapoer vinnige betaling stelsel met behulp van EMVCo QR spesifikasie met SGQR profiel. Ondersteun UEN (besigheidsregistrasie), selfoonnommer of NRIC as proxy-identifiseerders. Sluit bedrag redigeerbaarheid vlag en vervaldatum in.', 'PromptPay (Thailand): Thai nasionale betalingstelsel volgens Bank of Thailand EMV-profiel. Ondersteun selfoonnommer, nasionale ID, belasting-ID, e-beursie-ID en rekeningbetaling met verskeie verwysingsvelde.', 'QRIS (Indonesië): Vinnige reaksie-kode Indonesiese Standaard. EMV-gebaseerde nasionale betalingstandaard wat handelaar-ID, NMID (Nasionale Handelaar-ID), handelaarkriteriaklassifikasie en geriefsfooie (vas of persentasie) ondersteun.', 'DuitNow (Maleisië): Maleisiese kitsbetalingstelsel. Ondersteun verskeie volmagtipes, insluitend NRIC-, selfoon-, paspoort-, weermag-ID en besigheidsregistrasienommers.', 'VietQR (Viëtnam): Viëtnamese interbankoorplasingstandaard. Vereis bank BIN (NAPAS-identifikasie) en rekeningnommer. Ondersteun verskeie dienskodes vir verskillende oordragtipes (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filippyne): Filippynse QR-betalingstandaard vir InstaPay en PESONet. Gebruik rekeningnommers met handelaar-identifikasie vir P2M (persoon-tot-handelaar) transaksies.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Oos-Asiatiese betalingstandaarde',
      bullets: ['TWQR (Taiwan): Taiwanese QR-betalingstandaard. Ondersteun handelaar-ID, belasting-ID en TWD-bedrae.', 'HKQR/FPS (Hong Kong): QR-kodes vir die vinniger betalingstelsel van Hong Kong. Ondersteun FPS ID, selfoonnommer of e-pos as betaling identifiseerders. Bedrae in HKD.', 'JPQR (Japan): Japannese verenigde QR-kode-betalingstandaard. Gebruik winkel-ID vir handelaaridentifikasie met JPY-bedrae.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Ander streeksbetalingstandaarde',
      bullets: ['PIX (Brasilië): Brasiliaanse Sentrale Bank se kitsbetalingstelsel volgens BR-kode-spesifikasie. Ondersteun PIX-sleutels (CPF, CNPJ, e-pos, telefoon of ewekansige sleutel), handelaarnaam/stad, transaksie-ID en BRL-bedrae.', 'AusPayNet/NPP PayID (Australië): Australiese New Payments Platform PayID-stelsel. Ondersteun PayID-tipes (e-pos, selfoon, ABN, organisasie-ID) of tradisionele BSB + rekeningnommer. Handelaarnaam is opsioneel aangesien betalers die geregistreerde naam van NPP-opsoek sien.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Cryptocurrency betalings',
      bullets: ['Bitcoin/Litecoin (BIP-21): Standaard cryptocurrency betalings-URI\'s met beursie-adres, opsionele bedrag en etiket. Versoenbaar met alle groot Bitcoin- en Litecoin-beursies.', 'Lightning Network (BOLT11): Lightning Network-betalingsfakture. Plak \'n BOLT11-gekodeerde faktuurstring vir onmiddellike Bitcoin-betalings met minimale fooie.', 'Ethereum (EIP-681): Ethereum-transaksieversoek-URI\'s wat inheemse ETH-oordragte en ERC-20-tokenoordragte ondersteun. Sluit ketting-ID in vir multi-netwerk ondersteuning (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gas parameters, en kontrak funksie oproepe.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Betaalskakeldienste',
      bullets: ['PayPal.Me: PayPal-betalingskakels met gebruikersnaam en opsionele vooraf ingevulde bedrag. Ontvangers kan via PayPal-saldo, kaarte of bankrekeninge betaal.', 'Kontant-toepassing: Kontant-toepassing-betalingskakels met $cashtag met opsionele bedrag. Gewild in die Verenigde State vir eweknie-betalings.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Generiese EMV QR',
      bullets: ['EMV Generic: Skep pasgemaakte EMV Merchant-aangebied-modus QR-kodes vir betalingskemas wat nie spesifiek gelys is nie. Stel handelaarnaam, stad, landkode (ISO 3166-1), geldeenheidkode (ISO 4217 numeries), MCC, wenk-/geriefsfooi-opsies en bykomende datavelde op. Nuttig vir toetsing of pasgemaakte integrasies.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Oorlegmengselmodusse (professioneel)',
      paragraphs: ['Bykomende versnitmodusse op professionele vlak:'],
      bullets: ['Pixelate: Pixelated overlay-effek.', 'Omlyn: Randbespeuring-oorleg wat slegs kontoere wys.', 'Golf: Golwende vervorming effek.', 'Subpixelgrootte: Veranderlike subpixelgrootte gebaseer op beeld.', 'True Dither: Gevorderde dithering met geordende matrikskeuse.', 'Uiterste: Maksimum beeldsigbaarheid, kan skandeerbaarheid beïnvloed.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Beskerming instellings',
      paragraphs: ['Fynkorrelige beheer oor watter QR-elemente teen oorlegmodifikasie beskerm word:'],
      bullets: ['Behou tydsberekening: Hou tydsberekeningpatrone ongewysig.', 'Behou belyning: Hou belyningspatrone ongewysig.', 'Beskerm formaatinligting: Shield-formaat inligtingsmodules.', 'Beskerm weergawe-inligting: Shield weergawe inligting modules.'],
    },
    {
      heading: 'ECC-bewuste modus',
      paragraphs: ['Versprei oorlegintensiteit op \'n intelligente wyse gebaseer op foutkorreksiekapasiteit. Die stelsel ontleed watter modules gewysig kan word terwyl skandeerbaarheid gehandhaaf word.'],
      bullets: ['Risikobegroting: Persentasie van foutkorreksievermoë om te gebruik (0-100%).', 'Hoër begroting = meer sigbare oorleg, maar meer riskante skandeerbaarheid.', 'Laer begroting = veiliger skandering maar minder sigbare oorleg.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Professionele weergawe-opsies',
      paragraphs: ['Gevorderde weergawekontroles:'],
      bullets: ['Skerp rande: Gebruik gepixeleerde beeldweergawe vir skerp modulerande.', 'Pixel Snap: Piekselbelyning op die vloer, ronde of plafon.', 'Per-module kleurmodus: solied, volgens helderheid, volgens posisie, volgens oorleg, volgens groep.', 'Kleurpalet: Definieer pasgemaakte kleurpalet vir kleur per module.', 'Kontrasbeskerming: Verseker minimum kontrasverhouding tussen kleure.', 'Minimum kontrasverhouding: WCAG-styl kontrasvereiste (1:1 tot 21:1).', 'Ekstra grensmodules: Bykomende grens buite stil sone.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Professionele uitvoeropsies',
      paragraphs: ['Ondernemingsuitvoerinstellings:'],
      bullets: ['DPI: Stel drukresolusie (72-600 DPI). 300 DPI aanbeveel vir druk.', 'Sluit stil sone in: Wissel stil sone in uitsetafmetings.', 'Voer uit as bykomende: Genereer PDF saam met primêre formaat.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'Animasie-instellings (Professioneel)',
      paragraphs: ['Bykomende professionele animasie kenmerke:'],
      bullets: ['Tydelike dithering: Af, Blou Geraas of Flikker Veilige per-raam-dithering.', 'Patroon: Geen-, Pols-, Golf-, Skandeerlyn-, Shimmer- of Drift-effekte.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Sien verwante gidse en voorbeelde', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API-verwysing',
      paragraphs: ['ANQR bied \'n bediener-kant API vir die generering van QR-kodes via URL-parameters. Dit is ideaal om QR-kodes in webwerwe, e-posse, dokumente of outomatiese werkvloeie in te sluit sonder JavaScript aan die kliëntkant.', 'Basis-URL: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'example' }],
    },
    {
      heading: 'Basiese parameters',
      paragraphs: ['Vereiste en algemene parameters (parametername word nie vertaal nie):'],
      bullets: ['data (vereis): Die inhoud wat in die QR-kode gekodeer moet word. URL-enkodeer spesiale karakters.', 'grootte: Beeldgrootte in pixels (verstek: 400, maksimum: 2000). Word gebruik as w/h nie gespesifiseer is nie.', 'w, h: Uitset breedte en hoogte in pixels. Ignoreer grootte parameter.', 'formaat: Uitvoerformaat - png, webp of gif (verstek: png).', 'ec: Foutkorreksievlak - L, M, Q of H (verstek: H).', 'fg: Voorgrondkleur as hex sonder # (verstek: 000000).', 'bg: Agtergrondkleur as hex sonder # (verstek: ffffff).', 'deursigtig: Stel op 1 vir deursigtige agtergrond.', 'marge: Stil sone in modules (verstek: 4).'],
    },
    {
      heading: 'Stileerparameters',
      paragraphs: ['Module en patroonstilering:'],
      bullets: ['styl: Modulestyl - vierkantig, gerond, kolletjies, diamant, verbind.', 'finder: Finder-patroonstyl - vierkantig, gerond, sirkel.', 'belyn: Belyningspatroonstyl - pasmaatvinder, vierkantig, gerond, sirkel.', 'tydsberekening: Tydpatroonstyl - match_module, solied, stippellyn.', 'radius: Hoek radius persentasie 0-100.', 'gaping: Module gaping persentasie 0-50.', 'gapMode: Gapingmodus - geen, inlas, beroerte, negatiewe_spasie.', 'oogbuite, oogBinne: Oogstyle - vierkantig, gerond, sirkel.', 'oogskaal: Oogskaalpersentasie (verstek: 100).', 'grad: Gradiënttipe - geen, lineêr, radiaal, kegelvormig.', 'gradAngle: Gradiënthoek vir lineêre gradiënte.', 'gradStops: Gradiënt stop as kleur1,pos1,kleur2,pos2,... (bv. ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Oorlegparameters',
      paragraphs: ['Prentoorlegopsies (oorlegprent word bedienerkant gehaal):'],
      bullets: ['img: URL om prent oor te lê (moet publiek toeganklik wees).', 'modus: oorlegmodus - middelpunt, halftoon, versnit, helderheid, mosaïek, gedruis, blougeraas, subpixel.', 'intensiteit: Oorlegintensiteit 0-100 (verstek: 100).', 'kleurmodus: oorlegkleurmodus - kleur, grysskaal, bw.', 'pas: Hoe oortreksel pas - bedek, bevat, rek.', 'vrot: Oorlegrotasie in grade.', 'flipX, flipY: Stel op 1 om oorleg om te draai.', 'keepFinders: Behou vinderpatrone (verstek: 1).', 'keepTiming, keepAlign: Stel op 1 om tydsberekening/belyningspatrone te bewaar.'],
    },
    {
      heading: 'Voorverwerkingsparameters',
      paragraphs: ['Prentvoorverwerking toegepas op oorleg:'],
      bullets: ['helderheid: Aanpassing -100 tot 100 (verstek: 0).', 'kontras: Aanpassing -100 tot 100 (verstek: 0).', 'gamma: Waarde 0,1 tot 3 (verstek: 1).', 'versadiging: Aanpassing -100 tot 100 (verstek: 0).', 'tint: Tintrotasie in grade.', 'vervaag: vervaag in pixels.', 'skerp: Verskerp hoeveelheid 0-100.', 'posterize: Plakkaat vlakke.', 'drempel: Binêre drempel 0-255.', 'rand: Randopsporing - af, sobel, slim.', 'omkeer: Stel op 1 om kleure om te keer.'],
    },
    {
      heading: 'Watermerkparameters',
      paragraphs: ['Voeg watermerke by gegenereerde QR-kodes:'],
      bullets: ['wmEn: Stel op 1 om watermerk te aktiveer.', 'wmKind: Watermerk tipe - teks, beeld, patroon.', 'wmText: Watermerk teks (URL-geënkodeer).', 'wmImg: URL na watermerkprent.', 'wmPos: Posisie - middel, hoeke, kante, agter, stil_sone.', 'wmDeursigtigheid: Deursigtigheid 0-100 (verstek: 50).', 'wmBlend: Mengmodus - normaal, vermenigvuldig, skerm, oorleg.'],
    },
    {
      heading: 'Animasie parameters',
      paragraphs: ['Vir geanimeerde GIF-uitvoer (vereis format=gif):'],
      bullets: ['animPattern: Animasiepatroon - geen, pols, golf, skandeerlyn, glinster, drift, kleur_siklus.', 'animFrames: Aantal rame 1-60 (verstek: 24).', 'animSpeed: Raamvertraging in millisekondes 10-1000 (verstek: 100).', 'animSeed: Willekeurige saad vir animasie.', 'easing: Animasie easing - lineêr, ease_in, ease_out, ease_in_out, weiering.'],
    },
    {
      heading: 'Uitset parameters',
      paragraphs: ['Uitset formaat opsies:'],
      bullets: ['kwaliteit: WebP kwaliteit 0-1 (verstek: 0,9).', 'webpQ: WebP kwaliteit 0-100 (verstek: 90).', 'gifkleure: GIF-paletgrootte 2-256 (verstek: 256).', 'dpi: Uitvoer DPI vir PNG (verstek: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: PNG-metadatavelde.'],
    },
    // Crop Parameters
    {
      heading: 'Gewasparameters',
      paragraphs: ['Opsies vir oorlegbeeldsnoei:'],
      bullets: ['cropEn: Aktiveer oorlegbesnoeiing 0/1 (verstek: 0).', 'cropX: Gewasmiddel X as breuk 0-1 (verstek: 0,5).', 'cropY: Gewasmiddelpunt Y as breuk 0-1 (verstek: 0.5).', 'cropSize: Snygrootte as fraksie van beeld 0-1 (verstek: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Veiligheidslotparameters',
      paragraphs: ['Beheer watter QR-elemente teen oorlegwysiging beskerm word:'],
      bullets: ['lockF: Slotvinderpatrone 0/1 (verstek: 1).', 'lockT: Sluit tydsberekening patrone 0/1 (verstek: 1).', 'lockA: Sluit belyningspatrone 0/1 (verstek: 1).', 'lockFmt: Slotformaatinligting 0/1 (verstek: 1).', 'lockV: Slot weergawe inligting 0/1 (verstek: 1).', 'veilige modus: Veiligheidsmodus - af, gebalanseerd, streng (verstek: af).', 'safeMinPx: Minimum module grootte in pixels (verstek: 2).', 'safeMinQz: Minimum stil sone modules (verstek: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Outo-instelparameters',
      paragraphs: ['Outomatiese optimalisering instellings:'],
      bullets: ['autoVer: Kies outomaties QR-weergawe 0/1 (verstek: 1).', 'autoEcc: Outo-kies ECC-vlak 0/1 (verstek: 0) - slegs wenk aan die bedienerkant.', 'outoVerminder: [SLEGS KLIËNT] Verminder intensiteit outomaties totdat dit skandeerbaar is - vereis skanderingbekragtigingslus.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Bykomende animasieparameters',
      paragraphs: ['Uitgebreide animasiekontroles vir GIF-uitvoer:'],
      bullets: ['lus: Animasie loop voortdurend 0/1 (verstek: 1).', 'weiering: Tafeltennis animasie rigting 0/1 (verstek: 0).', 'omgekeerd: Speel animasie in omgekeerde 0/1 (verstek: 0).', 'colorCycle: Aktiveer kleurfietsry-effek 0/1 (verstek: 0).', 'interp: Raaminterpolasie - geen, kruisvervaag, morf (verstek: geen).', 'tempDither: Temporele wankeling - af, blou_geraas, flikker_veilig (verstek: af).', 'startF: Animasie-beginraam (verstek: 0).', 'maxF: Maksimum rame om weer te gee (verstek: 0 = outo).', 'stapF: Raamstap-interval (verstek: 1).', 'jitter: [SLEGS KLIËNT] Module jitter in pieksels - vereis per-raam QR-regenerasie.'],
    },
    // Dithering Parameters
    {
      heading: 'Dithering-parameters',
      paragraphs: ['Beheer dithering-algoritmes vir oorlegverwerking:'],
      bullets: ['ditherKind: Dither-algoritme - error_diffusion, ordered_bayer, blue_noise, ens (verstek: ordered_bayer).', 'diffusionKernel: Fout diffusion kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (verstek: floyd_steinberg).', 'ditherStrength: Dither-intensiteit 0-100 (verstek: 50).', 'serpentyn: Serpentyn-dithering 0/1 (verstek: 0).', 'matriks: Geordende dither-matriks - bayer2, bayer4, bayer8 (verstek: bayer4).', 'bnTeël: Blou geraas-teëlgrootte (verstek: 64).', 'bnSaad: Blou geraas ewekansige saad (verstek: 0).', 'colorDither: Kleur-dithering - geen, per_kanaal, perseptueel (verstek: geen).'],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixel-parameters',
      paragraphs: ['Instellings vir subpixel-versnitmodus:'],
      bullets: ['spGrid: Subpixel-roostergrootte - 2x2, 3x3, 4x4 (verstek: 3x3).', 'spCenter: Sentrumreël - streng, halftoonsentrum (verstek: streng).', 'spNeutral: Neutrale kleur hex sonder # (verstek: 808080).', 'spFinder: Finder override - solied, gestileer (verstek: solied).'],
    },
    // Halftone Parameters
    {
      heading: 'Halftoonparameters',
      paragraphs: ['Instellings vir halftoonversnitmodus:'],
      bullets: ['htCell: Halftoonselgrootte - per_module of nxn-rooster (verstek: per_module).', 'htDot: Puntvorm - sirkel, vierkant, lyn (verstek: sirkel).', 'htCurve: Helderheidskromme - lineêr, s-kromme, gamma (verstek: lineêr).', 'duo1: Duotoon skadu kleur hekshoek sonder # (verstek: 000000).', 'duo2: Duotoon hoogtepunt kleur hekshoek sonder # (verstek: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-bewuste modusparameters',
      paragraphs: ['Intelligente oorlegverspreiding gebaseer op foutkorreksiekapasiteit:'],
      bullets: ['eccAware: Aktiveer ECC-bewuste modus 0/1 (verstek: 0).', 'eccRisk: Risikobegrotingspersentasie 0-100 (verstek: 50).', 'eccMap: Gewigkaart - afstand_na_vinders, blok_hittekaart, empiriese_skandering_hittekaart (verstek: afstand_na_vinders).'],
    },
    // Frame Parameters
    {
      heading: 'Raamparameters',
      paragraphs: ['Dekoratiewe raam instellings:'],
      bullets: ['raam: Raamstyl - geen, afgeronde raam, plakker, merker (verstek: geen).', 'raamTeks: Teks om in raam te vertoon (URL-gekodeerde).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Per-Module Kleur Parameters',
      paragraphs: ['Individuele module kleur opsies:'],
      bullets: ['modColor: Kleurmodus - solied, by_helderheid, by_posisie, by_overlay, by_cluster (verstek: solied).', 'cGuard: Kontraswag 0/1 (verstek: 0).', 'minContrast: Minimum kontrasverhouding 1-21 (verstek: 4,5).', 'palet: Komma-geskeide hekskleure vir paletmodus.', 'paletmodus: paletverspreiding - posisie, helderheid, diagonaal, radiaal, ewekansig, ry, kolom (verstek: posisie).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF-oorlegparameters',
      paragraphs: ['Instellings vir geanimeerde GIF-oorlegbeelde:'],
      bullets: ['ovType: Oorlegtipe - staties, gif, apng, webp_anim, video (verstek: staties).', 'ovFramePick: Raamkeuse - almal, elke_n, maksimum_rame, duur_limiet (verstek: almal).', 'gifVertragings: Gebruik oorspronklike GIF-raamvertragings 0/1 (verstek: 1).', 'gifDispH: GIF wegdoening hantering - respekteer, vereenvoudig (verstek: respek).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Per-ECC intensiteitsbeperkings',
      paragraphs: ['Maksimum oorlegintensiteit per foutkorreksievlak:'],
      bullets: ['maxIntL: Maksimum intensiteit vir ECC L 0-100 (verstek: 100).', 'maxIntM: Maksimum intensiteit vir ECC M 0-100 (verstek: 100).', 'maxIntQ: Maksimum intensiteit vir ECC Q 0-100 (verstek: 100).', 'maxIntH: Maksimum intensiteit vir ECC H 0-100 (verstek: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA-simulasieparameters (slegs kliënt)',
      paragraphs: ['Hierdie parameters word ontleed vir URL-versoenbaarheid, maar werk net in die blaaier:'],
      bullets: ['qaContrast: Aktiveer kontraskontrole 0/1 - vereis interaktiewe validering.', 'qaBlur: Simuleer vervaging in pixels - slegs vir interaktiewe toetsing.', 'qaNoise: Simuleer geraasvlak - slegs vir interaktiewe toetsing.', 'qaHeatmap: Wys leesbaarheid-hittekaart 0/1 - vereis doekoorleg-UI.'],
    },
    // Client-Only Parameters
    {
      heading: 'Net-kliënt-parameters',
      paragraphs: ['Die meeste API-parameters word ten volle ondersteun aan die bedienerkant. Parameters gemerk [KLIËNT-SLEGS] word ontleed vir URL-versoenbaarheid, maar vereis blaaierkenmerke:'],
      bullets: ['jitter: Module jitter vereis per-raam QR-regenerasie met willekeurigheid.', 'outoVerminder: Outo-verminder intensiteit vereis iteratiewe skanderingstoetsing.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: QA-simulasie vereis interaktiewe doek-validering.'],
    },
    // Additional Output Parameters
    {
      heading: 'Bykomende uitsetparameters',
      paragraphs: ['Uitgebreide uitvoer- en uitvoerinstellings:'],
      bullets: ['fname: Pasgemaakte lêernaam vir aflaaie (verstek: anqr-qrcode).', 'inclQz: Sluit stil sone in by uitsetafmetings 0/1 (verstek: 1).', 'bgOver: Agtergrondkleur ignoreer heksasie sonder # (vernietig bg-parameter).', 'fmtExtra: Bykomende formaat afvoer - geen, eps, animated_webp (verstek: geen). Let wel: eps is [GEDEELTELIK].', 'svgPrec: SVG-vormpresisie - pixel, presies (verstek: pixel). [GEDEELTELIK] SVG-uitset beperkte bedienerkant.', 'svgInsluit: Sluit raster-oorleg in SVG 0/1 in (verstek: 1). [GEDEELTELIK] SVG-uitset beperkte bedienerkant.', 'modulePx: Module pixel grootte (verstek: outomaties bereken vanaf grootte).', 'grens: Ekstra grensmodules buite stil sone (verstek: 0).', 'skerp: Aktiveer skerp/gepixeleerde beeldweergawe 0/1 (verstek: 1).', 'snap: Pixel snap-modus - vloer, rond, plafon (verstek: vloer).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Patroonbehoudparameters',
      paragraphs: ['Beheer watter strukturele elemente teen oorleg beskerm word:'],
      bullets: ['keepFinders: Behou vinderpatrone 0/1 (verstek: 1).', 'keepTiming: Behou tydsberekeningpatrone 0/1 (verstek: 0).', 'keepAlign: Behou belyningspatrone 0/1 (verstek: 0).', 'protectFmt: Beskerm formaat inligting modules 0/1 (verstek: 0).', 'protectVer: Beskerm weergawe-inligtingmodules 0/1 (verstek: 0).'],
    },
    {
      heading: 'Voorbeeld Gebruik',
      paragraphs: ['Basiese QR-kode:', 'https://anqr.link/api/qr?data=https://example.com', 'Gestileerde QR-kode met pasgemaakte kleure:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'QR-kode met oorlegbeeld:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'Geanimeerde GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'example' }],
    },
    {
      heading: 'Inbedding van QR-kodes',
      paragraphs: ['In Professionele modus genereer die Deel-funksie inbedbare HTML en URL\'s. Hier is hoe inbedding werk:'],
      bullets: ['Deel skakel: Skep \'n URL na die ANQR-toepassing met al jou instellings geënkodeer as URL-parameters. Ontvangers kan die QR-kode bekyk en wysig.', 'Embed Image: Genereer \'n <img>-merker wat na die bediener-API wys. Die QR-kode word aan die bedienerkant gelewer en as \'n beeld gedien.', 'Embed Markdown: Skep Markdown-beeldsintaksis vir dokumentasie en README-lêers.', 'Direkte API-URL: Die rou API-URL vir gebruik in toepassings, skrifte of ander integrasies.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
    {
      heading: 'HTML voorbeeld',
      paragraphs: ['Om \'n QR-kode in jou webwerf in te sluit:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR-kode" />', 'Vir responsiewe grootte:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR-kode" style="max-width: 100%; height: auto;" />', 'Die bediener kas antwoorde met lang kasopskrifte, so herhaalde versoeke vir dieselfde URL is vinnig.'],
    },
    {
      heading: 'Deel URL-formaat',
      paragraphs: ['Wanneer jy Deel in Professionele modus klik, kodeer ANQR jou huidige instellings in URL-parameters. Die formaat is:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Hierdie parameters weerspieël die API-parameters, sodat jy \'n deel-URL na \'n API-URL kan omskakel deur die basispad van / na /api/qr te verander en w/h-parameters aan te pas soos nodig.', 'Let wel: Oorlegprente wat vanaf plaaslike lêers opgelaai is, kan nie via URL gedeel word nie - slegs URL-gebaseerde oorlegsels (img-parameter) werk in gedeelde skakels en API-oproepe.'],
    },
    {
      heading: 'Tarieflimiete en gebruik',
      paragraphs: ['Die API is gratis om te gebruik vir redelike volumes. Kontak ons ​​asseblief vir hoëvolume-gebruik of kommersiële toepassings wat gewaarborgde optyd vereis.', 'API-reaksies sluit aggressiewe kasopskrifte in. Vir die beste prestasie, kas antwoorde aan jou kant of gebruik dieselfde URL konsekwent vir identiese QR-kodes.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Beste praktyke',
      paragraphs: ['Volg hierdie riglyne vir betroubare QR-kodes:'],
      bullets: ['Toets altyd jou QR-kodes met veelvuldige skandeerdertoepassings voordat dit druk.', 'Gebruik Foutkorreksie H (Hoog) wanneer jy oorlegsels byvoeg.', 'Hou ten minste 4 modules stil sone (marge).', 'Verseker hoë kontras tussen voorgrond en agtergrond.', 'Vir druk, gebruik ten minste 300 DPI en toets op werklike drukgrootte.', 'Aktiveer Bewaar Finder-patrone wanneer oorlegsels gebruik word.', 'Begin met laer oorlegintensiteit en verhoog geleidelik.', 'Vir buitegebruik, oorweeg groter modulegroottes en hoër foutkorreksie.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Blaai deur Leer artikels', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'example' },
      ],
    },
    {
      heading: 'Probleemoplossing',
      paragraphs: ['Algemene kwessies en oplossings:'],
      bullets: ['QR sal nie skandeer nie: Verminder oorlegintensiteit, verhoog foutkorreksie, kontroleer kontras.', 'Kode te groot: Verminder inhoudslengte, gebruik URL-verkorter, laer weergawe.', 'Wasige uitset: Vergroot modulegrootte, gebruik PNG in plaas van saamgeperste formate.', 'Kleure lyk verkeerd: Kontroleer kleurkontras, probeer grysskaal-oorlegmodus.', 'GIF nie animeer nie: Maak seker dat jy GIF-formaat afvoer gebruik, kontroleer raamtelling.', 'Prentoorleg laai nie: Gaan CORS-toestemmings op afgeleë prente na.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Sien verwante gidse en voorbeelde', type: 'learn' }],
    },
    {
      heading: 'Sleutelbordkortpaaie',
      paragraphs: ['ANQR ondersteun standaard sleutelbordkortpaaie. Gebruik Ctrl/Cmd+S om uitvoer te aktiveer (wanneer op die voorskou gefokus is).'],
    },
    {
      heading: 'Deel en inbedding',
      paragraphs: ['In Professionele modus, klik die Deel-knoppie om \'n URL met jou huidige instellings te kopieer. Ontvangers kan hierdie URL oopmaak om jou presiese opstelling te sien. Let wel: Oorlegbeelde van plaaslike lêers kan nie via URL gedeel word nie.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Probeer hierdie konfigurasie direk in die ANQR-generator.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Blaai deur Leer artikels', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Maak die kragopwekker oop', type: 'generator' },
  ],
};

export default guide;
