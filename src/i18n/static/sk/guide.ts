import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Používateľská príručka ANQR',
  description: 'Kompletný návod na používanie ANQR na vytváranie QR kódov.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otvorte generátor', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Prechádzať Učiť sa články', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Začíname',
      paragraphs: ['ANQR je generátor QR kódu s prístupom na prvom mieste klienta. V predvolenom nastavení sa QR kódy generujú lokálne vo vašom prehliadači – nie je potrebný žiadny účet a vaše údaje zostanú súkromné. Na profesionálne vkladanie môžete použiť aj rozhranie API na strane servera.', 'Rozhranie má tri úrovne rozhrania: Basic, Advanced a Professional. Vyberte svoju úroveň pomocou kariet v hlavičke. Každá úroveň odomkne ďalšie funkcie, pričom sa rozhranie zameria na to, čo potrebujete.'],
      bullets: ['Základné: Jednoduché vytváranie QR kódu s obsahom obyčajného textu/URL a prekrytím obrázka.', 'Pokročilé: Možnosti kódovania QR, štýly vykresľovania, animácie, výstupné formáty, rozšírené typy obsahu a prispôsobenie prekrytia.', 'Profesionál: Vodoznaky, metadáta, zdieľanie, analýza bezpečnosti, platobné QR kódy a podnikové funkcie.'],
      links: [{ href: '/?lang=${lang}', label: 'Otvorte generátor', type: 'generator' }],
    },
    {
      heading: 'Rýchly štart',
      paragraphs: ['Ak chcete vytvoriť svoj prvý QR kód:'],
      bullets: ['1. Vyberte typ obsahu (URL, text, WiFi atď.) z rozbaľovacej ponuky Typ obsahu.', '2. Zadajte svoje údaje do poskytnutých polí.', '3. Voliteľne prispôsobte farby, štýly a pridajte prekryvný obrázok.', '4. Kliknutím na Exportovať stiahnete svoj QR kód ako PNG, GIF, WebP alebo SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Základné vlastnosti',
      paragraphs: ['Základná úroveň poskytuje zjednodušené rozhranie na vytváranie QR kódov s obsahom užitočného obsahu a prekrytím obrázkov. Toto je najjednoduchší spôsob, ako začať.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Typy obsahu (základné)',
      paragraphs: ['Čistý text: Kódujte akýkoľvek text až do limitu kapacity QR kódu. Ideálne pre krátke správy, kódy alebo identifikátory.', 'URL: Kódovanie webových adries. QR kód po naskenovaní otvorí adresu URL. Podporuje protokoly http:// a https://.'],
    },
    {
      heading: 'Prekryvný obrázok (základné)',
      paragraphs: ['Nahrajte obrázok (JPG, PNG, GIF, WebP), ktorý sa zmieša s vaším QR kódom. Medzi základné funkcie prekrytia patria:'],
      bullets: ['Nahrať zo súboru: Vyberte obrázok zo svojho zariadenia.', 'Načítať z adresy URL: Zadajte adresu URL obrázka (musí povoliť CORS).', 'Stredové logo: Umiestňuje obrázok do stredu, pričom sa spolieha na opravu chýb.', 'Blend: Jednoduché alfa prelínanie obrazu s QR vzorom.', 'Intenzita: Ovláda, ako silne prekrytie ovplyvňuje kód QR (0 – 100 %).', 'Farebný režim: Plnofarebný, Odtiene šedej alebo Čiernobiely.', 'Zachovať vzory vyhľadávača: Zachováva rohové vzory nezmenené pre spoľahlivé skenovanie.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Pokročilé funkcie',
      paragraphs: ['Pokročilá úroveň odomyká možnosti kódovania QR, štýly vykresľovania, animácie, výstupné formáty, rozšírené typy obsahu a pokročilé prispôsobenie prekrývania.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Nastavenia kódovania QR',
      paragraphs: ['Verzia: QR kódy sa dodávajú vo verziách 1-40, pričom vyššie verzie obsahujú viac údajov, ale sú väčšie. Nastavte na 0 (Auto), aby ANQR vybral najmenšiu verziu, ktorá vyhovuje vášmu obsahu.', 'Oprava chýb: Určuje, aké veľké poškodenie môže QR kód utrpieť, kým zostane skenovateľný.'],
      bullets: ['L (Low): 7% korekcia chýb – najmenšia veľkosť, najmenšia redundancia.', 'M (stredná): 15% oprava chýb – vyvážená možnosť.', 'Q (Quartile): 25% oprava chýb – dobré pre tlačené kódy.', 'H (Vysoká): 30% oprava chýb – najlepšie pre kódy s prekryvmi alebo v drsných podmienkach.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Tichá zóna (okraj)',
      paragraphs: ['Tichá zóna je biele miesto okolo QR kódu. Skenery potrebujú túto rezervu na zistenie, kde začína kód. Norma odporúča minimálne 4 moduly. Zníženie pod 4 môže spôsobiť problémy so skenovaním.'],
    },
    {
      heading: 'Štýl modulu',
      paragraphs: ['Moduly sú jednotlivé štvorce, ktoré tvoria QR kód. ANQR ponúka päť štýlov:'],
      bullets: ['Štvorec: Klasický vzhľad QR s ostrými rohmi.', 'Zaoblené: Zmäkčené rohy pre priateľskejší vzhľad.', 'Bodky: Kruhové moduly pre modernú estetiku.', 'Diamant: 45° otočené štvorce pre výrazný vzor.', 'Prepojené: Moduly sa spájajú, keď sú pri sebe a vytvárajú organické tvary.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Štýl vzoru vyhľadávača',
      paragraphs: ['Vzory vyhľadávača sú tri veľké štvorce v rohoch QR, ktoré pomáhajú skenerom orientovať kód. Dostupné štýly:'],
      bullets: ['Štvorec: Štandardné štvorcové rohy.', 'Zaoblené: Zmäkčené rohy zodpovedajúce štýlu zaobleného modulu.', 'Kruh: Kruhové vzory vyhľadávača pre kódy v štýle bodky.'],
    },
    {
      heading: 'Vzory zarovnania a časovania',
      paragraphs: ['Vzory zarovnania sa zobrazujú vo väčších QR kódoch (verzia 2+), aby pomohli opraviť skreslenie. Vzory časovania sú striedavé čiary spájajúce vzory vyhľadávača.'],
      bullets: ['Štýl zarovnania: Vyhľadávač zhody, Štvorec, Zaoblený alebo Kruh.', 'Štýl časovania: Zhoda s modulom, Plná alebo Prerušovaná.'],
    },
    {
      heading: 'Farby',
      paragraphs: ['Popredie: Farba modulov QR. Čierna (#000000) je štandardná, ale funguje každá tmavá farba.', 'Pozadie: Farba pozadia. Biela (#ffffff) je štandardná. Zabezpečte dostatočný kontrast s popredím.', 'Priehľadné pozadie: Pri použití na farebných povrchoch úplne odstráňte pozadie. Uistite sa, že povrch poskytuje dostatočný kontrast.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Veľkosť a medzera modulu',
      paragraphs: ['Veľkosť modulu: Ovláda, ako veľký je každý modul vykreslený v pixeloch. Väčšie hodnoty vytvárajú väčšie a ľahšie skenovateľné kódy.', 'Modul Gap: Pridáva priestor medzi modulmi v percentách. Malé medzery (5 – 15 %) môžu za určitých podmienok zlepšiť skenovateľnosť, ale príliš veľké medzery znižujú spoľahlivosť.'],
    },
    {
      heading: 'Nastavenia výstupu',
      paragraphs: ['Formát: Vyberte formát exportu na základe prípadu použitia.'],
      bullets: ['PNG: Bezstratový rastrový formát, ideálny pre väčšinu použití. Najlepšie pre tlač a digitál.', 'WebP: Moderný formát s menšou veľkosťou súborov. Dobré na použitie na webe.', 'GIF: Vyžaduje sa pre animované QR kódy. Podporuje transparentnosť.', 'SVG: Vektorový formát s nekonečnou mierkou. Najlepšie pre veľký výtlačok alebo keď potrebujete upraviť kód.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' },
      ],
    },
    {
      heading: 'Výstupné rozmery',
      paragraphs: ['Width/Height: Nastavte výstupnú veľkosť v pixeloch. V prípade tlače počítajte na základe DPI (napr. 300 DPI na 1 palec = 300 pixelov). Väčšie veľkosti skenujú spoľahlivejšie na diaľku.'],
    },
    {
      heading: 'Nastavenia animácie (rozšírené)',
      paragraphs: ['Ovládanie správania animovaného QR kódu:'],
      bullets: ['Rýchlosť: Snímková frekvencia animácie v milisekundách.', 'Slučka: Nepretržitá animácia alebo animácia s jedným prehrávaním.', 'Bounce: Smer animácie ping-pongu.', 'Spustiť snímku: Spustenie animácie od konkrétnej snímky.', 'Maximálny počet snímok: Obmedzte celkový počet snímok v animácii.', 'Krok snímky: Preskakovanie snímok pre rýchlejšiu animáciu.', 'Interpolácia: Žiadne, Crossfade alebo Morph medzi snímkami.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' },
      ],
    },
    {
      heading: 'Typy obsahu (pokročilé)',
      paragraphs: ['Pokročilá úroveň odomkne ďalšie formáty užitočného zaťaženia:'],
      bullets: [
        'Telefónne číslo (tel:): Vytvorí volateľné telefónne spojenie.',
        'Email (mailto:): Otvorí e-mailového klienta s voliteľným predmetom a telom.',
        'SMS: Vopred vyplnená textová správa na telefónne číslo.',
        'vCard: Úplná karta kontaktu s menom, organizáciou, telefónom, e-mailom, adresou.',
        'MeCard: Kompaktný formát kontaktu populárny v Japonsku.',
        'BizCard: Starší formát vizitky.',
        'Geo Location: GPS súradnice, ktoré sa otvárajú v mapách.',
        'WiFi: Sieťové poverenia pre automatické pripojenie (SSID, heslo, typ zabezpečenia).',
        'Udalosť kalendára: Formát iCalendar s názvom, miestom, dátumom/časom.',
        'RSVP udalosti: Odkaz na stránku registrácie udalosti.',
        'Prihlásenie na odber kalendára: Prihlásenie na odber informačného kanála ICS/WebCal.',
        'URL súboru/dokumentu: Priamy odkaz na súbory na stiahnutie.',
        'Odkaz na cloudové úložisko: Odkazy na Disk Google, Dropbox, OneDrive atď.',
        'Sociálny profil: Odkazy na LinkedIn, Twitter, Instagram atď.',
        'Odkaz na správy: WhatsApp, Telegram, priame odkazy na signál.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pokročilé funkcie prekrývania',
      paragraphs: ['Ďalšie možnosti prekrytia:'],
      bullets: ['Orezať: Povoľte orezanie na výber štvorcovej oblasti obrázka.', 'Poltón: Klasický bodový vzor v štýle tlače založený na jase obrazu.', 'Dithered: Chybové difúzne dithering pre detailnú reprodukciu.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Režimy prelínania prekrytia (pokročilé)',
      paragraphs: ['Ďalšie režimy prelínania v pokročilej úrovni:'],
      bullets: ['Subpixel: Rozdeľuje každý modul na subpixely pre lepšie detaily.', 'Modrý šum: Používa rozloženie modrého šumu pre vzory bez artefaktov.', 'Mozaika: Efekt založený na dlaždiciach, ktorý zachováva štruktúru obrazu.', 'Výplň medzier: Umiestňuje obrázok do medzier medzi modulmi.', 'Jas: Mení veľkosť modulu v závislosti od jasu obrazu.', 'Duotone: Mapuje obraz do dvoch farieb pre výrazný kontrast.'],
    },
    {
      heading: 'Intenzita prekrytia',
      paragraphs: ['Ovláda, ako silne prekrytie ovplyvňuje kód QR (0 – 100 %). Vyššie hodnoty zobrazujú viac detailov obrázka, ale môžu znížiť skenovateľnosť. Začnite okolo 70 % a upravte na základe testovania.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' }],
    },
    {
      heading: 'Farebný režim',
      paragraphs: ['Ako sa spracováva prekryvný obrázok:'],
      bullets: ['Plná farba: Zachová pôvodné farby obrazu.', 'Grayscale: Converts to black and white tones.', 'Black & White: High contrast binary conversion.'],
    },
    {
      heading: 'Zachovať vzory vyhľadávača',
      paragraphs: ['Keď je táto možnosť povolená, zachová tri vzory vyhľadávača rohov nezmenené prekrytím. Strongly recommended for reliable scanning.'],
    },
    {
      heading: 'Predspracovanie obrazu',
      paragraphs: ['Pred zmiešaním použite na prekryvný obrázok filtre. Tieto úpravy môžu zlepšiť vzhľad obrázka v konečnom QR kóde.'],
      bullets: ['Jas (-100 až +100): Zosvetlenie alebo stmavenie obrazu.', 'Kontrast (-100 až +100): Zvýšenie alebo zníženie tónového rozsahu.', 'Gamma (0,2 až 3,0): Nelineárne nastavenie jasu. Hodnoty pod 1 zosvetlia stredné tóny, nad 1 ich stmavia.', 'Saturation (-100 to +100): Color intensity. -100 is grayscale, +100 is oversaturated.', 'Hue Rotate (0-360°): Posun všetkých farieb okolo farebného kolieska.', 'Blur (0-20px): Soften image details.', 'Sharpen (0-100%): Enhance edges and details.', 'Posterizácia (0-16 úrovní): Znížte úrovne farieb pre efekt plagátu.', 'Prahová hodnota (0-255): Prevod na binárnu čiernu/bielu v hraničnom bode.', 'Detekcia hrán: Algoritmy Sobel alebo Canny na zobrazenie iba hrán.', 'Invert: Reverse all colors.'],
    },
    {
      heading: 'Režim Fit',
      paragraphs: ['How the overlay image fits the QR code area:'],
      bullets: ['Obálka: Obrázok vyplní celú oblasť av prípade potreby sa orezá.', 'Contain: Entire image visible, may have margins.', 'Stretch: Image distorts to fill exactly.'],
    },
    {
      heading: 'Možnosti transformácie',
      paragraphs: ['Rotation: Rotate overlay in 90° increments.', 'Flip X/Y: Zrkadlenie obrazu horizontálne alebo vertikálne.'],
    },
    {
      heading: 'Ditheringové algoritmy',
      paragraphs: ['Dithering konvertuje obrázky so súvislými tónmi na vzory, ktoré môžu reprezentovať QR kódy. Dostupné pri použití režimov prelínania Dithered, Blue Noise alebo True Dither.'],
      bullets: [
        'Difúzia chýb: Klasický štýl Floyd-Steinberg. Rozšíri kvantizačnú chybu na susedné pixely.',
        'Usporiadané (Bayer): Používa prahovú maticu pre pravidelné vzory.',
        'Clustered Dot: Simuluje poltónovú tlač.',
        'Void & Cluster: Optimalizované usporiadané dithering.',
        'Modrý šum: Vizuálne príjemný náhodne vyzerajúci vzor.',
        'Blue Noise Threshold: Prahové dithering s textúrou modrého šumu.',
        'White Noise: Náhodné prahové dithering.',
        'Gaussov/trojuholníkový šum: Hluk s rôznym rozdelením.',
        'Blue Noise + Error Diffusion: Hybrid kombinujúci obe techniky.',
        'Tienený modrý šum: Vzor modrého šumu podobný obrazovke.',
        'Percepčné: Vyvážené jasom pre lepšie vizuálne výsledky.',
        'Edge-Aware: Zachová okraje obrazu počas rozkladu.',
        'Adaptívny prah: lokálne adaptívne prahovanie.',
        'Temporal Blue Noise: V prípade animovaných obrázkov GIF sa vzor mení na snímku.',
      ],
    },
    {
      heading: 'Difúzne jadrá',
      paragraphs: ['Pri použití ditheringu chýb vyberte spôsob distribúcie chýb:'],
      bullets: ['Floyd-Steinberg: Klasická 4-susedská difúzia. Dobrý všeobecný výber.', 'Jarvis-Judice-Ninke: 12-sused, plynulejší, ale pomalší.', 'Stucki: Podobne ako JJN s rôznymi hmotnosťami.', 'Burkes: Zjednodušené JJN, rýchlejšie.', 'Sierra: Rodina jadier, ktoré vyvažujú kvalitu a rýchlosť.', 'Atkinson: Rozptyl svetla, zachováva detaily, ale môže byť zrnitý.'],
    },
    {
      heading: 'Dither Strength',
      paragraphs: ['Určuje, do akej miery sa použije rozklad (0 – 100 %). Nižšie hodnoty zachovávajú viac pôvodného vzoru, vyššie hodnoty zobrazujú viac detailov obrazu.'],
    },
    {
      heading: 'Nastavenia subpixelov',
      paragraphs: ['Pri použití režimu prelínania Subpixel:'],
      bullets: ['Veľkosť mriežky: 2×2, 3×3 alebo 4×4 subpixely na modul. Vyššie = viac detailov.', 'Stredové pravidlo: Striktné vyžaduje, aby stredový subpixel zodpovedal modulu. Stred poltónu umožňuje variácie.', 'Neutrálna farba: Farba použitá pre neurčené subpixely.', 'Prepísanie vyhľadávača: Ako sa vykresľujú vzory vyhľadávača (plné alebo štylizované).'],
    },
    {
      heading: 'Nastavenia poltónov',
      paragraphs: ['Pri použití režimu prelínania Poltón:'],
      bullets: ['Veľkosť bunky: na modul alebo mriežka N×N.', 'Bodový tvar: kruh, štvorec alebo čiara.', 'Krivka jasu: Lineárna, S-krivka alebo Gamma.'],
    },
    {
      heading: 'Duotónové farby',
      paragraphs: ['Keď používate režim prelínania Duotone, nastavte farbu tieňa (tmavé oblasti) a farbu zvýraznenia (svetlé oblasti).'],
    },
    {
      heading: 'Nastavenia animácie GIF',
      paragraphs: ['Pri použití animovaných prekryvných obrázkov GIF:'],
      bullets: ['Použiť oneskorenia snímok: Rešpektujte pôvodné načasovanie GIF.', 'Max FPS: Obmedzte snímkovú frekvenciu (1-60 fps).', 'Manipulácia s likvidáciou: Rešpektujte alebo zjednodušte metódy likvidácie rámu.'],
    },
    {
      heading: 'Rozšírené možnosti vykresľovania',
      paragraphs: ['Ďalšie ovládacie prvky vykresľovania:'],
      bullets: ['Režim medzery: Žiadny, Vložka, Ťah alebo štýl medzery so záporným priestorom.', 'Polomer rohu: Percento zaoblených rohov pre moduly.', 'Gradient: Žiadny, lineárny, radiálny alebo kužeľový gradient na moduloch.', 'Vonkajší/vnútorný štýl oka: Nezávislý štýl pre prstene so vzorom hľadáčika.', 'Otáčanie bodov: Otáčanie diamantových/bodových modulov.', 'Mierka očí: Úprava veľkosti vzorov vyhľadávača.', 'Štýl rámu: Pridajte ozdobné rámy (zaoblený rám, nálepka, štítok).', 'Frame Text: Pridajte text ako "Scan Me!" do rámov.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pokročilé kódovanie QR',
      paragraphs: ['Dolaďte kódovanie QR:'],
      bullets: ['Režim kódovania: Auto, Numerický, Alfanumerický, Byte/UTF-8 alebo Kanji.', 'Vynútiť minimálnu tichú zónu: Zabezpečte aspoň 4 okraj modulu.', 'Mask Pattern: Auto (optimálne) alebo manuálne vyberte vzory 0-7 na ovládanie distribúcie modulu. Rôzne vzory vytvárajú rôzne vizuálne vzhľady pri kódovaní rovnakých údajov.', 'Kódovanie znakov: ISO-8859-1 (predvolená latinka-1), UTF-8 (úplné Unicode vrátane emoji) alebo Shift-JIS (japončina). Vyberte si na základe požiadaviek na charakter vášho obsahu.'],
    },
    {
      heading: 'Rozšírené možnosti výstupu',
      paragraphs: ['Ďalšie nastavenia exportu:'],
      bullets: ['Názov súboru: Vlastný názov súboru na sťahovanie.', 'Veľkosť palety GIF: 2 – 256 farieb vo výstupe GIF.', 'Kvantizér GIF: Redukcia farieb Medián Cut, NeuQuant alebo Octree.', 'GIF Dithering: Off, Floyd-Steinberg alebo Ordered.', 'GIF Transparent Color: Nastavte farbu tak, aby bola priehľadná.', 'SVG True Vector: Namiesto vloženého rastra použite cesty.', 'SVG Shape Precision: Pixelové alebo presné vykresľovanie cesty.', 'SVG Embed Raster Overlay: Zahrňte prekrytie ako vložený obrázok.', 'Potlačenie pozadia: Vynúti špecifickú farbu pozadia vo výstupe.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Možnosti overenia',
      paragraphs: ['Nastavenia spracovania vstupu:'],
      bullets: ['Overiť vstup: Pred kódovaním skontrolujte formát obsahu.', 'Trim Whitespace: Odstráňte medzery na začiatku/na konci.', 'Normalizovať nové riadky: Previesť všetky konce riadkov na LF.', 'Max Length Guard: Upozornenie, ak obsah prekročí kapacitu QR.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Profesionálne funkcie',
      paragraphs: ['Profesionálna úroveň pridáva vodoznaky, metadáta, možnosti zdieľania, analýzu bezpečnosti, platobné QR kódy a podnikové funkcie.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Vodoznak',
      paragraphs: ['Pridajte vodoznaky do svojich QR kódov:'],
      bullets: ['Druh: Text, Obrázok alebo Vodoznak so vzorom.', 'Poloha: Stred, Rohy, Hrany, Za alebo Tichá zóna.', 'Nepriehľadnosť: Priehľadnosť vodoznaku (0-100%).', 'Režim prelínania: Normálne, Multiply, Screen alebo Overlay blending.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadáta',
      paragraphs: ['Vložiť metadáta do exportovaných súborov:'],
      bullets: ['Polia Názov, Autor, Autorské práva, Licencia, Popis.', 'Čas vytvorenia: Časová pečiatka generovania vloženia.', 'Vlastný kľúč – hodnota: Pridajte ľubovoľné páry metadát.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Zdieľanie',
      paragraphs: ['Zdieľajte svoje konfigurácie QR kódu:'],
      bullets: ['Priamy odkaz: Vygenerujte adresu URL na zdieľanie s vašimi aktuálnymi nastaveniami.', 'Vložiť HTML: Získajte kód na vloženie pre webové stránky.', 'Parametre kódovania: Zahrňte všetky nastavenia do adresy URL zdieľania.', 'Poznámka: Prekryvné obrázky z miestnych súborov nie je možné zdieľať prostredníctvom adresy URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' },
      ],
    },
    {
      heading: 'Analýza bezpečnosti',
      paragraphs: ['Zabezpečte, aby sa QR kódy dali naskenovať:'],
      bullets: ['Bezpečný režim: Vypnuté, Vyvážené alebo Prísne požiadavky na skenovanie.', 'Minimálna veľkosť modulu: Minimálna veľkosť pixelov na modul.', 'Minimálna tichá zóna: Moduly s minimálnou rezervou.', 'Lock Finders/Timeing/Align/Format/Version: Chráňte špecifické prvky.', 'Max Overlay Intensity by ECC: Automatické limity intenzity založené na úrovni korekcie chýb.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' },
      ],
    },
    {
      heading: 'Typy obsahu (profesionálne)',
      paragraphs: ['Profesionálna úroveň pridáva typy platieb a podnikového obsahu:'],
      bullets: ['EPC/SEPA (EÚ): Európsky bankový prevod QR kódy s IBAN, BIC, čiastka, referencia.', 'UPI (India): Zjednotené platobné rozhranie s VPA, meno príjemcu platby, suma.', 'PayNow (Singapur): Rýchla platba v Singapure pomocou čísla UEN alebo mobilného telefónu.', 'PromptPay (Thajsko): Thajský národný platobný systém.', 'PIX (Brazília): Brazílska okamžitá platba pomocou kľúča PIX.', 'Krypto: Bitcoin, Ethereum, Platobné adresy Litecoin s voliteľnou sumou.', 'Odkaz na marketingovú kampaň: adresy URL s úplným sledovaním parametrov UTM (marketingové značky).', 'Krátky odkaz: Na použitie so skracovačmi adries URL pre dynamické/sledovateľné QR kódy.', 'GS1 Digital Link: Identifikácia produktu s GTIN, sériová, šarža, expirácia.', 'Priamy odkaz na aplikáciu: Priame odkazy na aplikácie pre iOS/Android s vlastnými schémami.', 'Vlastný formát: Nespracované údaje bez formátovania alebo overovania.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Jazykovo relevantné platby v rozšírenom režime',
      paragraphs: ['Pri použití rozšíreného režimu ANQR automaticky zobrazuje spôsoby platby relevantné pre váš vybraný jazyk. Vietnamským používateľom sa napríklad zobrazí VietQR, thajským používateľom sa zobrazí PromptPay a používateľom indického jazyka sa zobrazí UPI a BharatQR. Globálne spôsoby platby (kryptomena, PayPal, Cash App) sú dostupné vo všetkých jazykoch. Profesionálny režim odomkne všetky platobné štandardy bez ohľadu na jazyk.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Európske platobné štandardy',
      bullets: ['EPC/SEPA (EÚ): Európsky bankový prevod QR kódov podľa normy EPC QR Code Standard. Podporuje IBAN, BIC (voliteľné pre domáce), sumu v EUR a štruktúrované alebo neštruktúrované platobné referencie. Používa sa v rámci SEPA zóny vrátane krajín EÚ a Švajčiarska, Nórska, Islandu, Lichtenštajnska, Monaka a San Marína.', 'Švajčiarsky QR-bill: Švajčiarsky platobný štandard podľa SIX implementačných pokynov. Podporuje CHF a EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), štruktúrované adresy veriteľa/dlžníka a informácie o faktúre. Vyžaduje sa pre švajčiarske faktúry od roku 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'indické platobné štandardy',
      bullets: ['UPI (India): Unified Payments Interface podľa špecifikácie NPCI Deep Linking. Podporuje VPA (virtuálnu platobnú adresu), meno príjemcu platby, sumu v INR, poznámku o transakcii, referenčné ID, kód kategórie obchodníka a režim transakcie.', 'BharatQR (India): Jednotný štandard QR podporujúci UPI aj platby kartou. Kombinuje UPI VPA s kartou PAN pre maximálnu kompatibilitu. Zahŕňa meno obchodníka, mesto, účet MKC, podrobnosti GST a čísla faktúr/referenčných čísel.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Platobné štandardy v juhovýchodnej Ázii',
      bullets: ['PayNow (Singapur): Singapurský rýchly platobný systém využívajúci špecifikáciu EMVCo QR s profilom SGQR. Podporuje UEN (obchodná registrácia), mobilné číslo alebo NRIC ako proxy identifikátory. Zahŕňa príznak upraviteľnosti sumy a dátum vypršania platnosti.', 'PromptPay (Thajsko): Thajský národný platobný systém podľa profilu EMV Bank of Thailand. Podporuje mobilné číslo, národné ID, daňové identifikačné číslo, ID elektronickej peňaženky a platbu faktúr s viacerými referenčnými poľami.', 'QRIS (Indonézia): Indonézsky štandard rýchlej odozvy. Národný platobný štandard založený na EMV podporujúci ID obchodníka, NMID (National Merchant ID), klasifikáciu kritérií obchodníka a poplatky za pohodlie (pevné alebo percentuálne).', 'DuitNow (Malajzia): Malajský okamžitý platobný systém. Podporuje viacero typov proxy vrátane NRIC, mobilu, pasu, armádneho preukazu a registračných čísel firiem.', 'VietQR (Vietnam): štandard vietnamského medzibankového prevodu. Vyžaduje bankový BIN (identifikácia NAPAS) a číslo účtu. Podporuje viacero servisných kódov pre rôzne typy prenosov (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filipíny): Filipínsky štandard platieb QR pre InstaPay a PESONet. Používa čísla účtov s identifikáciou obchodníka pre transakcie P2M (person-to-merchant).'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Východoázijské platobné štandardy',
      bullets: ['TWQR (Taiwan): Taiwanský štandard platieb QR. Podporuje ID obchodníka, daňové identifikačné číslo a sumy TWD.', 'HKQR/FPS (Hong Kong): QR kódy rýchlejšieho platobného systému v Hongkongu. Podporuje FPS ID, mobilné číslo alebo e-mail ako identifikátory platby. Sumy v HKD.', 'JPQR (Japonsko): japonský jednotný platobný štandard QR kódov. Používa ID obchodu na identifikáciu obchodníka s čiastkami v JPY.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Iné regionálne platobné štandardy',
      bullets: ['PIX (Brazília): Systém okamžitých platieb Brazílskej centrálnej banky podľa špecifikácie BR Code. Podporuje kľúče PIX (CPF, CNPJ, e-mail, telefón alebo náhodný kľúč), meno/mesto obchodníka, ID transakcie a sumy BRL.', 'AusPayNet/NPP PayID (Austrália): Austrálska nová platobná platforma PayID systém. Podporuje typy PayID (e-mail, mobil, ABN, ID organizácie) alebo tradičné BSB + číslo účtu. Názov obchodníka je voliteľný, pretože platitelia vidia registrované meno z vyhľadávania JE.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Platby v kryptomenách',
      bullets: ['Bitcoin/Litecoin (BIP-21): Štandardné URI platby kryptomeny s adresou peňaženky, voliteľnou sumou a štítkom. Kompatibilné so všetkými hlavnými bitcoinovými a litecoinovými peňaženkami.', 'Lightning Network (BOLT11): Platobné faktúry Lightning Network. Prilepte reťazec faktúry kódovaný BOLT11 pre okamžité platby v bitcoinoch s minimálnymi poplatkami.', 'Ethereum (EIP-681): URI požiadavky na transakciu Ethereum podporujúce natívne prenosy ETH a prenosy tokenov ERC-20. Zahŕňa ID reťazca pre podporu viacerých sietí (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parametre plynu a volania funkcií kontraktov.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Služby platobného prepojenia',
      bullets: ['PayPal.Me: Odkazy na platbu PayPal s používateľským menom a voliteľnou predvyplnenou sumou. Príjemcovia môžu platiť cez PayPal zostatok, karty alebo bankové účty.', 'Hotovostná aplikácia: Hotovostné platobné odkazy pomocou $cashtag s voliteľnou sumou. Populárne v Spojených štátoch pre platby typu peer-to-peer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Generické EMV QR',
      bullets: ['EMV Generic: Vytvorte si vlastné QR kódy EMV pre režim prezentovaný obchodníkom pre platobné schémy, ktoré nie sú špecificky uvedené. Nakonfigurujte názov obchodníka, mesto, kód krajiny (ISO 3166-1), kód meny (číselný ISO 4217), MKC, možnosti poplatku za prepitné a ďalšie dátové polia. Užitočné pre testovanie alebo vlastnú integráciu.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Režimy prelínania prekrytia (profesionálne)',
      paragraphs: ['Ďalšie režimy prelínania na profesionálnej úrovni:'],
      bullets: ['Pixelate: Pixelovaný efekt prekrytia.', 'Obrys: Prekrytie detekcie hrán zobrazuje iba obrysy.', 'Vlna: Efekt vlnitého skreslenia.', 'Veľkosť subpixelov: Variabilná veľkosť subpixelov na základe obrázka.', 'True Dither: Pokročilý rozklad s usporiadaným výberom matice.', 'Extrémne: Maximálna viditeľnosť obrázka, môže ovplyvniť skenovateľnosť.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Nastavenia ochrany',
      paragraphs: ['Jemná kontrola nad tým, ktoré QR prvky sú chránené pred úpravou prekrytia:'],
      bullets: ['Zachovať načasovanie: Ponechajte vzory načasovania nezmenené.', 'Zachovať zarovnanie: Ponechajte vzory zarovnania nezmenené.', 'Protect Format Info: Ochrana informačných modulov formátu.', 'Ochrana informácií o verzii: Ochrana modulov informácií o verzii.'],
    },
    {
      heading: 'Režim ECC-Aware',
      paragraphs: ['Inteligentne rozdeľuje intenzitu prekrytia na základe kapacity korekcie chýb. Systém analyzuje, ktoré moduly je možné modifikovať pri zachovaní skenovateľnosti.'],
      bullets: ['Rizikový rozpočet: Percento kapacity na opravu chýb, ktorá sa má použiť (0 – 100 %).', 'Vyšší rozpočet = viditeľnejšie prekrytie, ale riskantnejšia skenovateľnosť.', 'Nižší rozpočet = bezpečnejšie skenovanie, ale menej viditeľné prekrytie.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Profesionálne možnosti vykresľovania',
      paragraphs: ['Pokročilé ovládacie prvky vykresľovania:'],
      bullets: ['Ostré okraje: Použite pixelové vykresľovanie obrázkov pre ostré hrany modulov.', 'Pixel Snap: Zarovnanie pixelov na podlahu, na okrúhle alebo na strop.', 'Farebný režim podľa modulu: Plný, Podľa jasu, podľa polohy, podľa prekrytia, podľa klastra.', 'Farebná paleta: Definujte vlastnú farebnú paletu pre sfarbenie jednotlivých modulov.', 'Contrast Guard: Zabezpečte minimálny kontrastný pomer medzi farbami.', 'Minimálny kontrastný pomer: Požiadavka na kontrast v štýle WCAG (1:1 až 21:1).', 'Extra hraničné moduly: Dodatočné ohraničenie za pokojnou zónou.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Profesionálne možnosti výstupu',
      paragraphs: ['Nastavenia podnikového exportu:'],
      bullets: ['DPI: Nastavte rozlíšenie tlače (72-600 DPI). Pre tlač sa odporúča 300 DPI.', 'Zahrnúť tichú zónu: Prepína tichú zónu vo výstupných rozmeroch.', 'Exportovať ako ďalšie: Generovanie PDF spolu s primárnym formátom.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Nastavenia animácie (profesionálne)',
      paragraphs: ['Ďalšie funkcie profesionálnej animácie:'],
      bullets: ['Temporal Dither: Off, Blue Noise alebo Flicker Safe pre jednotlivé snímky.', 'Pattern: Žiadny, Pulz, Vlna, Scanline, Shimmer alebo Drift efekty.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Referencia API',
      paragraphs: ['ANQR poskytuje API na strane servera na generovanie QR kódov prostredníctvom parametrov URL. Toto je ideálne na vkladanie QR kódov do webových stránok, e-mailov, dokumentov alebo automatizovaných pracovných postupov bez JavaScriptu na strane klienta.', 'Základná adresa URL: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'example' }],
    },
    {
      heading: 'Základné parametre',
      paragraphs: ['Povinné a bežné parametre (názvy parametrov sa neprekladajú):'],
      bullets: ['údaje (povinné): Obsah, ktorý sa má zakódovať do QR kódu. Špeciálne znaky na kódovanie URL.', 'veľkosť: Veľkosť obrázka v pixeloch (predvolená: 400, max: 2000). Používa sa, ak nie je špecifikované.', 'w, v: Výstupná šírka a výška v pixeloch. Prepíše parameter veľkosti.', 'formát: Výstupný formát - png, webp alebo gif (predvolené: png).', 'ec: Úroveň korekcie chýb - L, M, Q alebo H (predvolené: H).', 'fg: Farba popredia ako hex bez # (predvolené: 000000).', 'bg: Farba pozadia ako hex bez # (predvolené: ffffff).', 'transparent: Nastavte na 1 pre priehľadné pozadie.', 'okraj: Tichá zóna v moduloch (predvolené: 4).'],
    },
    {
      heading: 'Parametre štýlu',
      paragraphs: ['Štýl modulov a vzorov:'],
      bullets: ['štýl: Modulový štýl - štvorcový, zaoblený, bodky, kosoštvorec, spojený.', 'vyhľadávač: Štýl vzoru Finder - štvorcový, zaoblený, kruh.', 'zarovnanie: Štýl vzoru zarovnania – vyhľadávač zhody, štvorcový, zaoblený, kruh.', 'časovanie: Štýl vzoru časovania - modul match_module, plné, čiarkované.', 'polomer: Percento polomeru rohu 0-100.', 'medzera: Percento medzery modulu 0-50.', 'gapMode: Režim medzery – žiadny, vložka, ťah, negatívna_medzera.', 'okoVonkajšie, okoVnútorné: Štýly očí – štvorcové, zaoblené, kruhové.', 'eyeScale: Percento mierky očí (predvolené: 100).', 'grad: Typ gradientu - žiadny, lineárny, radiálny, kužeľový.', 'gradAngle: Uhol gradientu pre lineárne gradienty.', 'gradStops: Zastavenie prechodu ako farba1, poz1, farba2, poz2,... (napr. ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Parametre prekrytia',
      paragraphs: ['Možnosti prekrytia obrázka (prekryvný obrázok sa načíta zo strany servera):'],
      bullets: ['img: URL na prekryvný obrázok (musí byť verejne prístupný).', 'režim: Režim prekrytia – stred, poltón, prelínanie, jas, mozaika, rozklad, modrý šum, subpixel.', 'intenzita: Intenzita prekrytia 0-100 (predvolená hodnota: 100).', 'colorMode: Režim farieb prekrytia – farba, odtiene šedej, čb.', 'fit: Ako sa hodí prekrytie - zakryť, obsahovať, natiahnuť.', 'rot: Otočenie prekrytia v stupňoch.', 'flipX, flipY: Nastavte na 1, ak chcete preklopiť prekrytie.', 'keepFinders: Zachovať vzory vyhľadávača (predvolená hodnota: 1).', 'keepTiming, keepAlign: Nastavte na 1, ak chcete zachovať vzory načasovania/zarovnania.'],
    },
    {
      heading: 'Parametre predbežného spracovania',
      paragraphs: ['Predspracovanie obrázka použité na prekrytie:'],
      bullets: ['jas: Úprava -100 až 100 (predvolené: 0).', 'kontrast: Úprava -100 až 100 (predvolené: 0).', 'gama: Hodnota 0,1 až 3 (predvolená hodnota: 1).', 'sýtosť: Úprava -100 až 100 (predvolené: 0).', 'odtieň: Rotácia odtieňa v stupňoch.', 'rozostrenie: Rozmazanie v pixeloch.', 'ostrenie: Množstvo ostrosti 0-100.', 'posterizovať: Posterizovať úrovne.', 'prah: Binárny prah 0-255.', 'edge: Detekcia hrán - vypnutá, sobel, canny.', 'invertovať: Nastavte na 1, ak chcete invertovať farby.'],
    },
    {
      heading: 'Parametre vodoznaku',
      paragraphs: ['Pridajte vodoznaky do vygenerovaných QR kódov:'],
      bullets: ['wmEn: Ak chcete povoliť vodoznak, nastavte na 1.', 'wmKind: Typ vodoznaku - text, obrázok, vzor.', 'wmText: Text vodoznaku (kódovaný URL).', 'wmImg: URL na obrázok vodoznaku.', 'wmPos: Pozícia - stred, rohy, okraje, za, tichá_zóna.', 'wmOpacity: Nepriehľadnosť 0-100 (predvolená hodnota: 50).', 'wmBlend: Režim prelínania – normálny, násobenie, obrazovka, prekrytie.'],
    },
    {
      heading: 'Parametre animácie',
      paragraphs: ['Pre animovaný výstup GIF (vyžaduje formát=gif):'],
      bullets: ['animPattern: Vzor animácie – žiadny, pulz, vlna, skenovacia čiara, trblietanie, drift, farebný_cyklus.', 'animFrames: Počet snímok 1-60 (predvolené: 24).', 'animSpeed: Oneskorenie snímky v milisekundách 10-1000 (predvolené: 100).', 'animSeed: Náhodné semeno pre animáciu.', 'easing: Uvoľňovanie animácie – lineárne, easy_in, easy_out, easy_in_out, bounce.'],
    },
    {
      heading: 'Výstupné parametre',
      paragraphs: ['Možnosti výstupného formátu:'],
      bullets: ['kvalita: WebP kvalita 0-1 (predvolená: 0,9).', 'webpQ: Kvalita WebP 0-100 (predvolená: 90).', 'gifColors: Veľkosť palety GIF 2-256 (predvolená: 256).', 'dpi: Výstupné DPI pre PNG (predvolené: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: polia metadát PNG.'],
    },
    // Crop Parameters
    {
      heading: 'Parametre orezania',
      paragraphs: ['Možnosti orezania prekryvného obrázka:'],
      bullets: ['cropEn: Povolí orezanie prekrytia 0/1 (predvolené: 0).', 'cropX: Stred orezu X ako zlomok 0-1 (predvolené: 0,5).', 'cropY: Stred orezania Y ako zlomok 0-1 (predvolené: 0,5).', 'cropSize: Veľkosť orezania ako zlomok obrázka 0-1 (predvolené: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Parametre bezpečnostného zámku',
      paragraphs: ['Ovládajte, ktoré QR prvky sú chránené pred úpravou prekrytia:'],
      bullets: ['lockF: Uzamknutie vzorov vyhľadávača 0/1 (predvolené: 1).', 'lockT: Zamknutie vzorov časovania 0/1 (predvolené: 1).', 'lockA: Uzamknutie vzorov zarovnania 0/1 (predvolené: 1).', 'lockFmt: Informácie o formáte zámku 0/1 (predvolené: 1).', 'lockV: Informácie o verzii zámku 0/1 (predvolené: 1).', 'safeMode: Bezpečný režim - vypnutý, vyvážený, prísny (predvolené: vypnuté).', 'safeMinPx: Minimálna veľkosť modulu v pixeloch (predvolené: 2).', 'safeMinQz: Minimálne moduly tichej zóny (predvolené: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parametre automatického ladenia',
      paragraphs: ['Nastavenia automatickej optimalizácie:'],
      bullets: ['autoVer: Automatický výber QR verzie 0/1 (predvolená hodnota: 1).', 'autoEcc: Automatický výber ECC úroveň 0/1 (predvolená hodnota: 0) – len nápoveda na strane servera.', 'autoReduce: [IBA KLIENT] Automatické zníženie intenzity, kým nebude možné skenovať – vyžaduje slučku overenia skenovania.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Ďalšie parametre animácie',
      paragraphs: ['Rozšírené ovládacie prvky animácie pre výstup GIF:'],
      bullets: ['loop: Animácia sa neustále cyklicky 0/1 (predvolená: 1).', 'odraz: smer animácie ping-pongu 0/1 (predvolené: 0).', 'dozadu: Prehrať animáciu v opačnom smere 0/1 (predvolené: 0).', 'colorCycle: Povolí efekt cyklovania farieb 0/1 (predvolená hodnota: 0).', 'interp: Interpolácia rámca - žiadna, crossfade, morph (predvolené: žiadne).', 'tempDither: Temporal dithering - off, blue_noise, flicker_safe (predvolené: vypnuté).', 'startF: Úvodný rámec animácie (predvolená hodnota: 0).', 'maxF: Maximálny počet snímok na vykreslenie (predvolené: 0 = auto).', 'stepF: Interval krokov snímok (predvolené: 1).', 'Jitter: [IBA KLIENT] Jitter modulu v pixeloch – vyžaduje regeneráciu QR kódu na snímku.'],
    },
    // Dithering Parameters
    {
      heading: 'Parametre rozkladu',
      paragraphs: ['Riadenie algoritmov rozkladu pre spracovanie prekrytia:'],
      bullets: ['ditherKind: Algoritmus rozkladu - error_diffusion, order_bayer, blue_noise, atď (predvolené: order_bayer).', 'diffusionKernel: Error diffusion kernel - floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (predvolené: floyd_steinberg).', 'DitherStrength: Intenzita ditheru 0-100 (predvolená hodnota: 50).', 'serpentín: serpentínové dithering 0/1 (predvolené: 0).', 'matica: Usporiadaná matica rozkladu - bayer2, bayer4, bayer8 (predvolené: bayer4).', 'bnTile: Veľkosť dlaždice modrého šumu (predvolená: 64).', 'bnSeed: Náhodný zdroj modrého šumu (predvolené: 0).', 'colorDither: Rozklad farieb - žiadne, per_channel, perceptual (predvolené: žiadne).'],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixelové parametre',
      paragraphs: ['Nastavenia pre režim prelínania subpixelov:'],
      bullets: ['spGrid: Veľkosť mriežky subpixelov – 2x2, 3x3, 4x4 (predvolené: 3x3).', 'spCenter: Center rule - strict, halftone_center (predvolené: strict).', 'spNeutral: Neutrálny farebný hex bez # (predvolené: 808080).', 'spFinder: Prepísanie Finder – plné, štylizované (predvolené: plné).'],
    },
    // Halftone Parameters
    {
      heading: 'Poltónové parametre',
      paragraphs: ['Nastavenia pre režim prelínania poltónov:'],
      bullets: ['htCell: Veľkosť poltónovej bunky - na_modul alebo mriežku nxn (predvolené: na_modul).', 'htDot: Tvar bodky – kruh, štvorec, čiara (predvolené: kruh).', 'htCurve: Krivka jasu - lineárna, s-krivka, gama (predvolené: lineárne).', 'duo1: Šestnástková farba tieňa Duotone bez # (predvolené: 000000).', 'duo2: Duotónová farba zvýraznenia hex bez # (predvolené: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parametre režimu ECC',
      paragraphs: ['Inteligentná distribúcia prekrytia založená na kapacite opravy chýb:'],
      bullets: ['eccAware: Povolí režim ECC 0/1 (predvolené: 0).', 'eccRisk: Percento rizikového rozpočtu 0-100 (predvolené: 50).', 'eccMap: Hmotnostná mapa - distance_to_finders, block_heatmap, empirical_scan_heatmap (predvolené: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Parametre rámu',
      paragraphs: ['Nastavenia ozdobného rámu:'],
      bullets: ['rám: Štýl rámu – žiadny, zaoblený_rám, nálepka, značka (predvolené: žiadne).', 'frameText: Text, ktorý sa má zobraziť v rámci (kódované URL).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parametre farieb podľa modulu',
      paragraphs: ['Možnosti farbenia jednotlivých modulov:'],
      bullets: ['modColor: Farebný režim – plný, podľa_jasu, podľa_pozície, podľa_prekrytia, podľa_klastra (predvolené: plné).', 'cGuard: Ochrana kontrastu 0/1 (predvolená hodnota: 0).', 'minContrast: Minimálny kontrastný pomer 1-21 (predvolené: 4,5).', 'paleta: Šestnástkové farby oddelené čiarkou pre režim palety.', 'paletteMode: Distribúcia palety - poloha, jas, uhlopriečka, radiálna, náhodná, riadok, stĺpec (predvolené: poloha).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parametre prekrytia GIF',
      paragraphs: ['Nastavenia pre animované prekryvné obrázky GIF:'],
      bullets: ['ovType: Typ prekrytia - statický, gif, apng, webp_anim, video (predvolené: statické).', 'ovFramePick: Výber snímok - všetky, každý_n, maximálny_počet snímok, dĺžka_limitu (predvolené: všetky).', 'gifDelays: Použiť pôvodné oneskorenia snímok GIF 0/1 (predvolené: 1).', 'gifDispH: Nakladanie s GIF - rešpektovať, zjednodušiť (predvolené: rešpektovať).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Limity intenzity na ECC',
      paragraphs: ['Maximálna intenzita prekrytia na úroveň opravy chýb:'],
      bullets: ['maxIntL: Maximálna intenzita pre ECC L 0-100 (predvolené: 100).', 'maxIntM: Maximálna intenzita pre ECC M 0-100 (predvolené: 100).', 'maxIntQ: Maximálna intenzita pre ECC Q 0-100 (predvolená hodnota: 100).', 'maxIntH: Maximálna intenzita pre ECC H 0-100 (predvolené: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parametre simulácie kontroly kvality (iba klient)',
      paragraphs: ['Tieto parametre sú analyzované kvôli kompatibilite URL, ale fungujú iba v prehliadači:'],
      bullets: ['qaContrast: Povoliť kontrolu kontrastu 0/1 – vyžaduje interaktívne overenie.', 'qaBlur: Simulácia rozmazania v pixeloch – len na interaktívne testovanie.', 'qaNoise: Simulácia hladiny hluku – len na interaktívne testovanie.', 'qaHeatmap: Zobraziť teplotnú mapu čitateľnosti 0/1 – vyžaduje používateľské rozhranie prekrytia plátna.'],
    },
    // Client-Only Parameters
    {
      heading: 'Parametre iba pre klienta',
      paragraphs: ['Väčšina parametrov API je plne podporovaná na strane servera. Parametre označené [KLIENT-IBA] sú analyzované z hľadiska kompatibility s webovou adresou, ale vyžadujú funkcie prehliadača:'],
      bullets: ['Jitter: Jitter modulu vyžaduje regeneráciu QR kódov s náhodnosťou.', 'autoReduce: Automatické zníženie intenzity vyžaduje opakované testovanie skenovania.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: Simulácia kvality vyžaduje interaktívne overenie plátna.'],
    },
    // Additional Output Parameters
    {
      heading: 'Dodatočné výstupné parametre',
      paragraphs: ['Rozšírené nastavenia výstupu a exportu:'],
      bullets: ['fname: Vlastný názov súboru pre sťahovanie (predvolené: anqr-qrcode).', 'inclQz: Zahrnúť tichú zónu do výstupných rozmerov 0/1 (predvolené: 1).', 'bgOver: Farba pozadia prepíše hex bez # (prepíše parameter bg).', 'fmtExtra: Ďalší formát výstupu - žiadny, eps, animovaný_webp (predvolené: žiadne). Poznámka: eps je [PARTIAL].', 'svgPrec: presnosť tvaru SVG – pixel, presná (predvolené: pixel). [ČIASTOČNÉ] Obmedzený výstup SVG na strane servera.', 'svgEmbed: Vložiť rastrové prekrytie do SVG 0/1 (predvolené: 1). [ČIASTOČNÉ] Obmedzený výstup SVG na strane servera.', 'modulePx: Veľkosť modulu v pixeloch (predvolená hodnota: automaticky vypočítaná z veľkosti).', 'border: Extra hraničné moduly za pokojnou zónou (predvolené: 0).', 'crisp: Povolí vykresľovanie ostrého/pixelovaného obrazu 0/1 (predvolené: 1).', 'snap: Režim Pixel snap - podlaha, okrúhly, strop (predvolené: podlaha).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parametre zachovania vzoru',
      paragraphs: ['Ovládajte, ktoré konštrukčné prvky sú chránené pred prekrytím:'],
      bullets: ['keepFinders: Zachovať vyhľadávacie vzory 0/1 (predvolené: 1).', 'keepTiming: Zachová vzory časovania 0/1 (predvolené: 0).', 'keepAlign: Zachovať vzory zarovnania 0/1 (predvolené: 0).', 'protectFmt: Ochrana informačných modulov formátu 0/1 (predvolené: 0).', 'protectVer: Ochrana informačných modulov verzie 0/1 (predvolené: 0).'],
    },
    {
      heading: 'Príklad použitia',
      paragraphs: ['Základný QR kód:', 'https://anqr.link/api/qr?data=https://example.com', 'Štylizovaný QR kód s vlastnými farbami:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'QR kód s prekryvným obrázkom:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=poltón&intenzita=70', 'Animovaný GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'example' }],
    },
    {
      heading: 'Vkladanie QR kódov',
      paragraphs: ['V profesionálnom režime funkcia Zdieľať generuje vložiteľné HTML a adresy URL. Takto funguje vkladanie:'],
      bullets: ['Zdieľať odkaz: Vytvorí adresu URL aplikácie ANQR so všetkými vašimi nastaveniami zakódovanými ako parametre adresy URL. Príjemcovia môžu QR kód zobraziť a upraviť.', 'Vložiť obrázok: Vygeneruje značku <img> smerujúcu na serverové API. QR kód sa vykreslí na strane servera a slúži ako obrázok.', 'Embed Markdown: Vytvorí syntax obrazu Markdown pre dokumentáciu a súbory README.', 'Priama adresa URL rozhrania API: Neupravená adresa URL rozhrania API na použitie v aplikáciách, skriptoch alebo iných integráciách.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
    {
      heading: 'Príklad HTML',
      paragraphs: ['Ak chcete vložiť QR kód na svoj web:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="kód QR" />', 'Pre responzívne dimenzovanie:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="kód QR" style="max-width: 100%; height: auto;" />', 'Server ukladá odpovede do vyrovnávacej pamäte s dlhými hlavičkami vyrovnávacej pamäte, takže opakované požiadavky na rovnakú adresu URL sú rýchle.'],
    },
    {
      heading: 'Zdieľať formát adresy URL',
      paragraphs: ['Keď kliknete na Zdieľať v profesionálnom režime, ANQR zakóduje vaše aktuálne nastavenia do parametrov URL. Formát je:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Tieto parametre odzrkadľujú parametre API, takže zdieľanú adresu URL môžete previesť na adresu URL API zmenou základnej cesty z / na /api/qr a úpravou parametrov w/h podľa potreby.', 'Poznámka: Prekryvné obrázky nahrané z lokálnych súborov nemožno zdieľať prostredníctvom adresy URL – v zdieľaných odkazoch a volaniach rozhrania API fungujú iba prekryvné vrstvy založené na adrese URL (parameter img).'],
    },
    {
      heading: 'Obmedzenia a využitie sadzieb',
      paragraphs: ['Rozhranie API je zadarmo na použitie pre primerané objemy. Pre veľkoobjemové použitie alebo komerčné aplikácie vyžadujúce garantovanú dobu prevádzky nás prosím kontaktujte.', 'Odpovede API zahŕňajú agresívne hlavičky ukladania do vyrovnávacej pamäte. Ak chcete dosiahnuť najlepší výkon, uložte odpovede do vyrovnávacej pamäte na svojom konci alebo použite rovnakú adresu URL pre rovnaké QR kódy.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'osvedčené postupy',
      paragraphs: ['Pre spoľahlivé QR kódy postupujte podľa týchto pokynov:'],
      bullets: ['Pred tlačou vždy otestujte svoje QR kódy pomocou viacerých aplikácií skenera.', 'Pri pridávaní prekrytí použite korekciu chýb H (vysoká).', 'Ponechajte aspoň 4 moduly pokojovej zóny (okraj).', 'Zabezpečte vysoký kontrast medzi popredím a pozadím.', 'Na tlač použite aspoň 300 DPI a vyskúšajte pri skutočnej veľkosti tlače.', 'Povoľte možnosť Zachovať vzory vyhľadávača pri používaní prekrytí.', 'Začnite s nižšou intenzitou prekrytia a postupne zvyšujte.', 'Pre vonkajšie použitie zvážte väčšie veľkosti modulov a vyššiu korekciu chýb.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Prechádzať Učiť sa články', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'example' },
      ],
    },
    {
      heading: 'Riešenie problémov',
      paragraphs: ['Bežné problémy a riešenia:'],
      bullets: ['QR nebude skenovať: Znížte intenzitu prekrytia, zvýšte korekciu chýb, skontrolujte kontrast.', 'Kód je príliš veľký: Znížte dĺžku obsahu, použite skracovač adries URL, znížte verziu.', 'Rozmazaný výstup: Zväčšite veľkosť modulu, namiesto komprimovaných formátov použite PNG.', 'Farby vyzerajú nesprávne: Skontrolujte farebný kontrast, skúste režim prekrytia v odtieňoch sivej.', 'GIF sa neanimuje: Uistite sa, že používate výstup vo formáte GIF, skontrolujte počet snímok.', 'Prekrytie obrázka sa nenačítava: Skontrolujte povolenia CORS na vzdialených obrázkoch.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Pozrite si súvisiace príručky a príklady', type: 'learn' }],
    },
    {
      heading: 'Klávesové skratky',
      paragraphs: ['ANQR podporuje štandardné klávesové skratky. Použite Ctrl/Cmd+S na spustenie exportu (pri zameraní na náhľad).'],
    },
    {
      heading: 'Zdieľanie a vkladanie',
      paragraphs: ['V profesionálnom režime kliknite na tlačidlo Zdieľať a skopírujte adresu URL s aktuálnymi nastaveniami. Príjemcovia môžu otvoriť túto webovú adresu, aby videli vašu presnú konfiguráciu. Poznámka: Prekryvné obrázky z miestnych súborov nie je možné zdieľať prostredníctvom adresy URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Vyskúšajte túto konfiguráciu priamo v generátore ANQR.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Prechádzať Učiť sa články', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Otvorte generátor', type: 'generator' },
  ],
};

export default guide;
