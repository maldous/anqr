import type { PageDefinition } from "../types";

export const guide: PageDefinition = {
  title: "Uživatelská příručka ANQR",
  description: "Kompletní návod k použití ANQR pro vytváření QR kódů.",
  lastUpdated: "1. února 2026",
  breadcrumb: ["Průvodce"],
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Otevři generátor", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Procházení Učit články", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Zobrazit příklady QR", type: "example" },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: "Začínáme",
      paragraphs: [
        "ANQR je QR kód generátor s klient- první přístup. Ve výchozím nastavení jsou QR kódy generovány lokálně ve vašem prohlížeči - není potřeba žádný účet a vaše data zůstávají soukromá. Pro profesionální vkládání, můžete také použít serverboard API.",
        "Rozhraní má tři úrovně rozhraní: Basic, Advanced a Professional. Vyberte svou úroveň pomocí karet v záhlaví. Každá úroveň odemyká další funkce a zároveň udržuje rozhraní zaměřené na to, co potřebujete.",
      ],
      bullets: [
        "Základní: Jednoduchá tvorba QR kódu s prostým textovým / URL obsahem a překryvem obrazu.",
        "Advanced: QR možnosti kódování, vykreslování stylů, animace, výstupní formáty, rozšířené typy obsahu, a překrývání přizpůsobení.",
        "Profesionální: Vodoznaky, metadata, sdílení, analýza bezpečnosti, platební QR kódy a vlastnosti podniku.",
      ],
      links: [{ href: "/?lang=${lang}", label: "Otevři generátor", type: "generator" }],
    },
    {
      heading: "Rychlý start",
      paragraphs: ["Pro vytvoření prvního QR kódu:"],
      bullets: [
        "1. Vyberte typ obsahu (URL, text, WiFi, atd.) z poklesu obsahu typu.",
        "2. Zadejte svá data do poskytnutých polí.",
        "3. Volitelně přizpůsobit barvy, styly, a přidat překryv obrázek.",
        "4. Kliknutím na Export si stáhnete svůj QR kód jako PNG, GIF, WebP nebo SVG.",
      ],
      links: [
        {
          href: "/?lang=${lang}",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: "Základní funkce",
      paragraphs: [
        "Základní úroveň poskytuje zefektivněné rozhraní pro vytváření QR kódů s obsahem užitečného zatížení a překryvy obrazu. Tohle je nejjednodušší způsob, jak začít.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Typy obsahu (základní)",
      paragraphs: [
        "Plain Text: Encode libovolný text až do limitu kapacity QR kódu. Ideální pro krátké zprávy, kódy nebo identifikátory.",
        "URL: Encode webové adresy. QR kód otevře URL při skenování. Podpora http: / / a https: / / protokoles.",
      ],
    },
    {
      heading: "Překrytí obrazu (základní)",
      paragraphs: [
        "Nahrajte obrázek (JPG, PNG, GIF, WebP) pro kombinaci s QR kódem. Základní vlastnosti překrytí zahrnují:",
      ],
      bullets: [
        "Nahrávání ze souboru: zvolte obrázek ze zařízení.",
        "Načíst z URL: Zadejte URL obrázku (musí povolit CORS).",
        "Centrum Logo: Umístí obrázek do centra, spoléhá na opravu chyb.",
        "Směs: Jednoduché alfa míchání obrazu s QR vzorem.",
        "Intenzita: Kontroluje, jak silně překrytí ovlivňuje QR kód (0- 100%).",
        "Barevný režim: plná barva, stupnice šedi nebo černá a bílá.",
        "Vzorce pro uložení: Udržuje rohové vzory nemodifikované pro spolehlivé skenování.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic#overlay",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: "Pokročilé funkce",
      paragraphs: [
        "Advanced level odemyká možnosti kódování QR, vykreslování stylů, animace, výstupní formáty, rozšířené typy obsahu a pokročilé překrytí přizpůsobení.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Nastavení kódování QR",
      paragraphs: [
        "Verze: QR kódy přicházejí ve verzích 1-40, s vyšší verze držící více dat, ale jsou větší. Nastavte na 0 (Auto), aby ANQR zvolila nejmenší verzi, která vyhovuje Vašemu obsahu.",
        "Oprava chyby: Určuje, kolik škody může QR kód udržet, zatímco zůstane scannable.",
      ],
      bullets: [
        "L (nízká): 7% korekce chyb - nejmenší velikost, nejmenší redundance.",
        "M (Medium): 15% oprava chyb - vyvážená volba.",
        "Q (Quartile): 25% korekce chyb - dobrá pro tištěné kódy.",
        "H (High): 30% korekce chyb - nejlepší pro kódy s překryvy nebo v náročných podmínkách.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#qr-encoding",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Tichá zóna (margin)",
      paragraphs: [
        "Tichá zóna je bílý prostor kolem QR kódu. Skenery potřebují tuto hranici, aby zjistily, kde ten kód začíná. Norma doporučuje nejméně 4 moduly. Snížení pod 4 může způsobit problémy se skenováním.",
      ],
    },
    {
      heading: "Styl modulu",
      paragraphs: ["Moduly jsou jednotlivé čtverce, které tvoří QR kód. ANQR nabízí pět stylů:"],
      bullets: [
        "Náměstí: Classic QR vzhled s ostrými rohy.",
        "Zaokrouhleno: Měkčené rohy pro přátelštější vzhled.",
        "Dots: Kruhové moduly pro moderní estetiku.",
        "Diamond: 45 ° otočené čtverce pro výrazný vzor.",
        "Připojeno: Moduly se slučují, když jsou přilehlé, vytvářejí organické tvary.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Styl nálezce",
      paragraphs: [
        "Nálezce vzory jsou tři velké čtverce v QR rohy, které pomáhají skenery orientovat kód. Dostupné styly:",
      ],
      bullets: [
        "Náměstí: Standardní hranaté rohy.",
        "Zaokrouhleno: Měkčené rohy odpovídající zaoblenému stylu modulu.",
        "Kruh: Kruhové nálezné vzory pro dotykové kódy.",
      ],
    },
    {
      heading: "Vyrovnávací & časové vzory",
      paragraphs: [
        "Ve větších kódech QR (verze 2 +) se objevují vzorce zarovnání, které pomáhají napravit zkreslení. Časové vzory jsou střídavé linky spojující nálezné vzory.",
      ],
      bullets: [
        "Styl zarovnání: Match Finder, Square, Rounded, nebo Circle.",
        "Styl načasování: Match Module, Solid, nebo Dashed.",
      ],
    },
    {
      heading: "Barvy",
      paragraphs: [
        "Proground: Barva QR modulů. Černá (# 000000) je standardní, ale každá tmavá barva funguje.",
        "Východiska: Barva pozadí. Bílá (# ffffff) je standardní. Zajistit dostatečný kontrast s popředím.",
        "Transparentní pozadí: Odstraňte pozadí zcela pro použití na barevné povrchy. Zajistit, aby povrch poskytoval dostatečný kontrast.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Velikost modulu & Gap",
      paragraphs: [
        "Velikost modulu: Kontroluje, jak velký je každý modul v pixelech. Větší hodnoty vytvářejí větší, snadnější skenovací kódy.",
        "Modul Gap: Přidává prostor mezi moduly jako procento. Malé mezery (5-15%) mohou za určitých podmínek zlepšit scannability, ale nadměrné mezery snižují spolehlivost.",
      ],
    },
    {
      heading: "Nastavení výstupů",
      paragraphs: ["Formát: Vyberte si svůj formát pro export na základě případu použití."],
      bullets: [
        "PNG: Bezztrátový rastrový formát, ideální pro většinu použití. Nejlepší pro tisk a digitální.",
        "WebP: Moderní formát s menšími rozměry souborů. Dobré pro použití na webu.",
        "GIF: Požadováno pro animované QR kódy. Podporuje transparentnost.",
        "SVG: Vektorový formát, který měří nekonečně. Nejlepší pro velký tisk nebo když potřebujete upravit kód.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-3",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Rozměry výstupů",
      paragraphs: [
        "Šířka / výška: Nastavte velikost výstupu v pixelech. Pro tisk počítejte na základě DPI (např. 300 DPI při 1 palci = 300px). Větší velikost je spolehlivější na dálku.",
      ],
    },
    {
      heading: "Nastavení animace (Advanced)",
      paragraphs: ["Ovládání animovaného QR kódu chování:"],
      bullets: [
        "Rychlost: Rychlost animace v milisekundách.",
        "Loop: Kontinuální nebo single-play animace.",
        "Bounce: Ping-pong animace směrem.",
        "Start Frame: Zahajte animaci z konkrétního rámce.",
        "Max rámce: Omezení celkových rámců v animaci.",
        "Frame Step: Přeskočit rámce pro rychlejší animaci.",
        "Interpolace: Žádný, Crossfade, nebo Morph mezi rámy.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Typy obsahu (Advanced)",
      paragraphs: ["Pokročilá úroveň otevírá další formáty užitečného zatížení:"],
      bullets: [
        "Telefonní číslo (tel:): Vytvoří volatelný telefonní odkaz.",
        "E-mail (mail:): Otevře e-mailový klient s volitelným předmětem a tělem.",
        "SMS: Předvyplněná SMS na telefonní číslo.",
        "vCard: Plná kontaktní karta se jménem, organizací, telefonem, e-mailem, adresou.",
        "MeCard: Kompaktní kontaktní formát populární v Japonsku.",
        "BizCard: Formát obchodní karty Legacy.",
        "Umístění Geo: GPS souřadnice, které se otevírají v mapách.",
        "WiFi: Síťové pověření pro automatické připojení (SSID, heslo, bezpečnostní typ).",
        "Kalendář Událost: iKalendář formát s názvem, umístění, datum / čas.",
        "Event RSVP: Odkaz na stránku pro registraci událostí.",
        "Kalendář Přihlásit: Přihlásit se na ICS / WebCal feed.",
        "URL souboru / dokumentu: Přímý odkaz na stažitelné soubory.",
        "Cloud Storage Link: Odkazy na Google Drive, Dropbox, OneDrive, atd.",
        "Sociální profil: Odkazy na LinkedIn, Twitter, Instagram, atd.",
        "Odkaz na zprávy: WhatsApp, Telegram, Hluboké odkazy signálu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Pokročilé funkce překrytí",
      paragraphs: ["Další možnosti překrytí:"],
      bullets: [
        "Croph: Povolit cropping vybrat čtvereční oblast vašeho obrazu.",
        "Halftone: Classic print- style tečka vzor založený na jasu obrazu.",
        "Dithered: Chybové difúzní dithering pro detailní reprodukci.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#overlay",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Režim překrytí směsí (Advanced)",
      paragraphs: ["Další směsné režimy v pokročilé úrovni:"],
      bullets: [
        "Subpixel: Rozdělí každý modul do subpixelů pro větší detail.",
        "Modrý hluk: Používá modré hluk dithering pro artefakt- free vzory.",
        "Mozaika: Tilový efekt pro zachování obrazové struktury.",
        "Výplň otvoru: Umístí obrázek do mezer mezi moduly.",
        "Jasnost: velikost modulu Varies na základě jasu obrazu.",
        "Duotone: Mapuje obrázek do dvou barev pro výrazný kontrast.",
      ],
    },
    {
      heading: "Intenzita překrytí",
      paragraphs: [
        "Kontroluje, jak silně překrytí ovlivňuje QR kód (0- 100%). Vyšší hodnoty ukazují více detailů obrazu, ale mohou snížit scannability. Začněte kolem 70% a přizpůsobte se na základě testování.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Režim barev",
      paragraphs: ["Způsob zpracování překryvu:"],
      bullets: [
        "Full Color: Zachovat originální barvy obrázku.",
        "Stupnice šedi: Převádí se na černobílé tóny.",
        "Černá a bílá: Vysoce kontrastní binární konverze.",
      ],
    },
    {
      heading: "Zachovat nálezné vzory",
      paragraphs: [
        "Pokud je povoleno, udržuje tři nálezné vzory v zatáčce nemodifikované překryvem. Důrazně doporučeno pro spolehlivé skenování.",
      ],
    },
    {
      heading: "Přepracování obrazu",
      paragraphs: [
        "Aplikujte filtry na překryv obrázku před smícháním. Tyto úpravy mohou zlepšit způsob, jakým se obraz objeví v konečném QR kódu.",
      ],
      bullets: [
        "Jasnost (-100 až + 100): rozjasní nebo ztmaví obrázek.",
        "Kontrast (-100 až + 100): Zvýšení nebo snížení tonálního rozsahu.",
        "Gama (0.2 až 3.0): Nelineární nastavení jasu. Hodnoty pod 1 odlehčit midtons, nad 1 tmavý je.",
        "Saturace (-100 až + 100): Intenzita barev. -100 je šedá stupnice, + 100 je přesycené.",
        "Otočný odstín (0- 360 °): Přesuňte všechny barvy kolem barevného kola.",
        "Rozmazané (0- 20px): Měkké detaily obrazu.",
        "Sharpen (0-100%): Zvětšit okraje a detaily.",
        "Posterizovat (0-16 úrovní): Snížit úroveň barev pro efekt plakátu.",
        "Prahová hodnota (0-255): Převést na binární černá / bílá v odstupném bodu.",
        "Detekce hran: Sobel nebo Canny algoritmy ukázat pouze hrany.",
        "Invert: Obrátit všechny barvy.",
      ],
    },
    {
      heading: "Režim montáže",
      paragraphs: ["Jak překryv odpovídá oblasti QR kódu:"],
      bullets: [
        "Obálka: Obrázek vyplní celou plochu, v případě potřeby oříznutí.",
        "Obsahuje: celý obraz viditelný, může mít okraje.",
        "Stretch: Obrázek zkreslí vyplnit přesně.",
      ],
    },
    {
      heading: "Možnosti transformace",
      paragraphs: [
        "Rotace: Rotační překrytí v přírůstcích 90 °.",
        "Flip X / Y: Zrcadlo obrázku vodorovně nebo svisle.",
      ],
    },
    {
      heading: "Rozlišující algoritmy",
      paragraphs: [
        "Dithering konvertuje kontinuální-tón obrázky na vzory, které QR kódy mohou reprezentovat. K dispozici při použití režimů Dithered, Blue Noise nebo True Dither.",
      ],
      bullets: [
        "Chyba difuze: Classic Floyd-Steinberg styl. Rozšiřuje kvantifikační chybu na sousední pixely.",
        "Objednané (Bayer): Používá prahovou matici pro pravidelné vzory.",
        "Clustered Dot: Simuluje potisk polotónu.",
        "Prázdnota: Optimalizovaná objednávka.",
        "Modrý hluk: Vizuálně příjemný, náhodně vypadající vzor.",
        "Modrý hluk Prahová hodnota: Prahová hodnota s modrou zvukovou texturou.",
        "Bílý hluk: Náhodné prahové vázání.",
        "Gaussian / Triangular Hluk: Hluk s různými distribucemi.",
        "Blue Noise + Error Difusion: Hybrid kombinující obě techniky.",
        "Screened Blue Noise: Screen- jako modrý šum vzor.",
        "Perceptual: Luminance- vážená pro lepší vizuální výsledky.",
        "Edge- Aware: Zachovává okraje obrazu během roztáčení.",
        "Adaptivní práh: Lokálně adaptivní mlácení.",
        "Časový modrý hluk: U animovaných GIF se mění vzor na rámeček.",
      ],
    },
    {
      heading: "Difuzní Kernely",
      paragraphs: [
        "Při použití chybového difúzního difúzního difuzního difuzování zvolte, jak bude chyba distribuována:",
      ],
      bullets: [
        "Floyd- Steinberg: Classic 4- sousední difuze. Dobrá volba.",
        "Jarvis- Judice- Ninke: 12- soused, hladší, ale pomalejší.",
        "Stucki: Podobně jako JJN s různými závažemi.",
        "Zjednodušený JJN, rychleji.",
        "Sierra: Rodina jader vyvážení kvality a rychlosti.",
        "Atkinson: Light difusion, zachovává detail, ale může být zrnitý.",
      ],
    },
    {
      heading: "Dither síla",
      paragraphs: [
        "Kontroluje, jak velké množství se používá (0-100%). Nižší hodnoty zachovávají více původního vzoru, vyšší hodnoty ukazují více detailů obrazu.",
      ],
    },
    {
      heading: "Nastavení podpixelů",
      paragraphs: ["Při použití režimu směsi Subpixel:"],
      bullets: [
        "Velikost mřížky: 2 × 2, 3 × 3 nebo 4 × 4 subpixelů na modul. Vyšší = více detailů.",
        "Pravidlo centra: Strikt vyžaduje, aby centrum subpixel odpovídalo modulu. Halftone Center umožňuje variaci.",
        "Neutrální barva: Barva použitá pro neurčené podpixely.",
        "Nálezce Override: Jak se vytváří nálezné vzory (Solid nebo Stylized).",
      ],
    },
    {
      heading: "Nastavení polotónu",
      paragraphs: ["Při použití režimu Halftone mix:"],
      bullets: [
        "Velikost buňky: jeden modul nebo N × N mřížka.",
        "Bodový tvar: Kruh, Čtverec nebo čára.",
        "Křivka jasu: lineární, S- křivka nebo Gamma.",
      ],
    },
    {
      heading: "Duotone Barvy",
      paragraphs: [
        "Při použití režimu Duotone mix nastavte barvu stínu (tmavé oblasti) a zvýrazněte barvu (světlé oblasti).",
      ],
    },
    {
      heading: "Nastavení animace GIF",
      paragraphs: ["Při použití animovaných překryvů GIF:"],
      bullets: [
        "Použít Frame zpoždění: Respektovat původní GIF načasování.",
        "Maximální FPS: Mezní rychlost snímku (1-60 fps).",
        "Manipulace s likvidací: Respektovat nebo zjednodušit metody odstraňování rámů.",
      ],
    },
    {
      heading: "Pokročilé možnosti přehodnocení",
      paragraphs: ["Doplňkové koncovky:"],
      bullets: [
        "Gap Mode: Žádný, Inset, Stroke, nebo negativní mezera styl.",
        "Rohový poloměr: Procento zaoblených rohů pro moduly.",
        "Gradient: Žádný, lineární, radiální nebo kuželový gradient na modulech.",
        "Styl vnějšího/vnitřního oka: Nezávislý styl prstenů se vzorem hledáčku.",
        "Rotace tečky: Otočit moduly diamant / tečka.",
        "Oční měřítko: Nastavení velikosti pro nálezné vzory.",
        "Styl rámu: Přidat dekorativní rámy (kulatý rám, nálepka, štítek).",
        'Text rámu: Přidat text jako \\"Scan Me!\\" do rámů.',
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Pokročilé kódování QR",
      paragraphs: ["Kódování QR finetune:"],
      bullets: [
        "Režim kódování: Auto, Numeric, Alfanumeric, Byte / UTF-8 nebo Kanji.",
        "Enforce Min Tiché Zone: Zajistit alespoň 4 rozsahy modulu.",
        "Maska vzor: Auto (optimální), nebo ručně vybrat vzory 0-7 pro ovládání distribuce modulu. Různé vzory vytvářejí různé vizuální zdání při kódování stejných dat.",
        "Kódování znaků: ISO-8859-1 (výchozí hodnota latin-1), UTF-8 (plná Unicode včetně emocji), nebo Shift-JIS (japonský). Vyberte si podle požadavků vašeho obsahu.",
      ],
    },
    {
      heading: "Pokročilé možnosti výstupu",
      paragraphs: ["Další nastavení exportu:"],
      bullets: [
        "Název souboru: Vlastní název souboru pro stahování.",
        "GIF Velikost palety: 2-256 barev ve výstupu GIF.",
        "GIF Kvantizátor: Median Cut, NeuQuant, nebo Octree snížení barvy.",
        "GIF Vypnout, Floyd- Steinberg, nebo objednat.",
        "GIF Průhledná barva: Nastavte barvu, aby byla transparentní.",
        "SVG True Vector: Používejte cesty místo zabudovaného rastru.",
        "SVG Tvar Precision: Pixel nebo Precizní ztvárnění cesty.",
        "SVG Embed Raster Overlay: Zahrnout překryv jako vložený obrázek.",
        "Pozadí Override: Force konkrétní barvu pozadí ve výstupu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Možnosti validace",
      paragraphs: ["Nastavení vstupního zpracování:"],
      bullets: [
        "Potvrdit vstup: Před enkódováním zkontrolujte formát obsahu.",
        "Trim Whitespace: Odstranit přední / vlečné prostory.",
        "Normalizace novinek: Převést všechny konce na LF.",
        "Maximální délka stráží: varujte, pokud obsah překročí QR kapacitu.",
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: "Profesionální funkce",
      paragraphs: [
        "Odborná úroveň přidává vodoznaky, metadata, možnosti sdílení, analýzu bezpečnosti, platební QR kódy a funkce podniku.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Vodoznak",
      paragraphs: ["Přidat vodoznaky do QR kódů:"],
      bullets: [
        "Druh: Text, obrázek, nebo vzor vodoznak.",
        "Pozice: Střed, rohy, hrany, za, nebo Tichá zóna.",
        "Neprůhlednost: transparentnost vodoznaku (0-100%).",
        "Směsný režim: normální, vícevrstvý, obrazovkový nebo překrývající.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#watermark",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Metadata",
      paragraphs: ["Vložená metadata ve vyvážených souborech:"],
      bullets: [
        "Titul, Autor, Copyright, Licence, Popis pole.",
        "Čas vytvoření: Vložené časové razítko generace.",
        "Vlastní klíčová hodnota: Přidat svévolné dvojice metadat.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#metadata",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Sdílení",
      paragraphs: ["Sdílejte konfigurace QR kódů:"],
      bullets: [
        "Přímý odkaz: Vytvořte sdílené URL s aktuálním nastavením.",
        "Embed HTML: Získejte vložený kód pro webové stránky.",
        "Parametry kódu: Zahrnout všechna nastavení do URL sdílení.",
        "Poznámka: Obrázky z místních souborů nelze sdílet přes URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-7",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Bezpečnostní analýza",
      paragraphs: ["Zajistit, aby kódy QR zůstaly scanneable:"],
      bullets: [
        "Bezpečnostní režim: Vypnuté, vyrovnané nebo přísně čitelné požadavky.",
        "Min modul Velikost: Minimální velikost pixelů na modul.",
        "Min Tichý Oblast: Moduly minimálního rozpětí.",
        "Lock Finders / Časování / Zarovnat / Format / Verze: Chraňte specifické prvky.",
        "Maximální intenzita překrytí podle ECC: Automatické limity intenzity založené na úrovni opravy chyb.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#safety",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Obsah Typy (profesionální)",
      paragraphs: ["Profesionální úroveň přidává typy plateb a obsahu podniku:"],
      bullets: [
        "EPC / SEPA (EU): evropské kódy QR pro bankovní převod s IBAN, BIC, částka, odkaz.",
        "UPI (Indie): Jednotné platební rozhraní s VPA, jméno příjemce, částka.",
        "PayNow (Singapur): Singapur rychlé platby s UEN nebo mobilní číslo.",
        "PromptPay (Thajsko): Thajský národní platební systém.",
        "PIX (Brazílie): Brazilská instantní platba s PIX klíčem.",
        "Krypto: Bitcoin, Ethereum, Litecoin platební adresy s volitelnou částkou.",
        "Marketingová kampaň Odkaz: URL s plným UTM parametrem (Marketing Tags) sledování.",
        "Krátký odkaz: Pro použití s URL zkratkami pro dynamické / trackable QR kódy.",
        "Digitální odkaz GS1: Identifikace produktu s GTIN, sériová, várka, konec platnosti.",
        "App Deep Link: iOS / Android aplikace hluboké odkazy s vlastní systémy.",
        "Vlastní formát: Syrová data bez formátování nebo validace.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-2",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: "Jazykové-relevantní platby v pokročilém režimu",
      paragraphs: [
        "Při použití režimu Advanced ANQR automaticky zobrazí platební metody relevantní pro zvolený jazyk. Například vietnamští uživatelé vidí VietQR, thajští uživatelé vidí PromptPay a indičtí uživatelé jazyka vidí UPI a BharatQR. Globální platební metody (kryptoměna, PayPal, Cash App) jsou k dispozici ve všech jazycích. Profesionální režim odemyká všechny platební standardy bez ohledu na jazyk.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Evropské platební standardy",
      bullets: [
        "EPC / SEPA (EU): Kódy QR evropského bankovního převodu podle normy QR EPC. Podporuje IBAN, BIC (nepovinné pro vnitrostátní), částku v EUR a strukturované nebo nestrukturované odkazy na platby. Používá se v celé oblasti SEPA včetně zemí EU plus Švýcarsko, Norsko, Island, Lichtenštejnsko, Monako a San Marino.",
        "Swiss QR-bill: Švýcarská platební norma podle pokynů SIX k provádění. Podporuje CHF a EUR, QR- Reference (QRR), Creditor Reference (ISO11649), strukturované adresy věřitele / dlužníka a informace o účtu. Vyžaduje se pro švýcarské faktury od roku2022.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Indické platební standardy",
      bullets: [
        "UPI (Indie): Unified Payments Interface following NPCI Deep Linking Specification. Podporuje VPA (Virtual Payment Address), jméno příjemce, částka v INR, transakční list, referenční ID, kód obchodní kategorie a transakční režim.",
        "BharatQR (Indie): Jednotný QR standard podporující UPI i platby kartou. Kombinuje UPI VPA s kartou PAN pro maximální kompatibilitu. Zahrnuje jméno obchodníka, město, MCC, podrobnosti GST a fakturační/referenční čísla.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Jihovýchodní asijské platební standardy",
      bullets: [
        "PayNow (Singapur): Singapur rychlý platební systém pomocí EMVCo QR specifikace s profilem SGQR. Podporuje UEN (obchodní registraci), mobilní číslo nebo NRIC jako proxy identifikátory. Zahrnuje emisní příznak a datum ukončení platnosti.",
        "PromptPay (Thajsko): Thajský národní platební systém podle profilu banky Thajsko EMV. Podporuje mobilní číslo, národní ID, daňové ID, e- peněženka ID, a účet platby s více referenčních polí.",
        "QRIS (Indonésie): Kód rychlé reakce indonéský standard. Národní platební standard založený na EMV podporující obchodní ID, NMID (National Merchant ID), klasifikace obchodních kritérií a komfortní poplatky (pevné nebo procentní).",
        "DuitNow (Malajsie): Malajský okamžitý platební systém. Podporuje několik typů proxy, včetně NRIC, mobilní, pas, armádní průkaz a registrační čísla.",
        "VietQR (Vietnam): Vietnamský standard mezibankovního převodu. Vyžaduje bankovní BIN (identifikace NAPAS) a číslo účtu. Podporuje několik servisních kódů pro různé typy přenosu (QRPUSH, QRIBFTTA, QRIBFTTC).",
        "QR Ph (Filipíny): Filipínský QR platební standard pro InstaPay a PESONet. Používá čísla účtů s identifikací obchodníka pro transakce P2M (person-to-merchant).",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Východoasijské platební standardy",
      bullets: [
        "TWQR (Tchaj-wan): tchajwanský standard platby QR. Podporuje obchodní ID, daňové ID a částky TWD.",
        "HKQR / FPS (Hong Kong): Hong Kong Faster Payment System QR kódy. Podporuje ID FPS, mobilní číslo nebo e-mail jako identifikátory plateb. Částky v HKD.",
        "JPQR (Japonsko): japonský jednotný standard pro platby kódů QR. Používá ID skladu pro identifikaci obchodníka s JPY částkami.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Ostatní regionální platební standardy",
      bullets: [
        "PIX (Brazílie): Brazilský systém okamžité platby centrální banky podle specifikace BR Code. Podporuje PIX klíče (CPF, CNPJ, e-mail, telefon, nebo náhodný klíč), obchodní jméno / město, ID transakce, a BRL částky.",
        "AusPayNet / NPP PayID (Austrálie): Australian New Payments Platform PayID system. Podporuje výplatu Typy ID (e-mail, mobil, ABN, ID organizace) nebo tradiční číslo účtu BSB +. Obchodní název je volitelný, protože payers viz registrovaný název z NPP vyhledávání.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Platby kryptoměny",
      bullets: [
        "Bitcoin / Litecoin (BIP-21): Standardní šifrovací platební URI s adresou peněženky, volitelnou částkou a štítkem. Kompatibilní se všemi velkými Bitcoiny a Litecoin peněženky.",
        "Síť blesku (BOLT11): Platební faktury Lightning Network. Vložte BOLT11 kódovaný řetězec faktur pro okamžité platby Bitcoin s minimálními poplatky.",
        "Ethereum (EIP-681): Identifikátory URI požadavku transakce Ethereum podporující nativní přenosy ETH a přenosy tokenů ERC-20. Zahrnuje ID řetězce pro podporu více sítí (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parametry plynu a volání funkcí smlouvy.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Služby související s platebními odkazy",
      bullets: [
        "PayPal.Me: PayPal platební odkazy s uživatelským jménem a volitelnou předvyplněnou částkou. Příjemci mohou platit prostřednictvím PayPal zůstatku, karet nebo bankovních účtů.",
        "Hotovostní aplikace: Hotovostní platební odkazy pomocí aplikace $cashtag s volitelnou částkou. Populární ve Spojených státech pro platby peer-to-peer.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Obecné EMV QR",
      bullets: [
        "EMV Genericky: Vytvořit vlastní EMV Merchant- Prezentovaný režim Kódy QR pro platební systémy, které nejsou výslovně uvedeny. Konfigurujte obchodní název, město, kód země (ISO 3166-1), kód měny (číslo ISO 4217), MCC, možnosti tipu / pohodlí poplatků a další datová pole. Užitečné pro testování nebo vlastní integraci.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: "Režim překrytí směsí (profesionální)",
      paragraphs: ["Doplňkové směsné režimy na profesionální úrovni:"],
      bullets: [
        "Pixelát: účinek překrytí pixelem.",
        "Povrch: Detekce hran zobrazuje pouze obrysy.",
        "Vlna: Vlny zkreslení efekt.",
        "Velikost podpixelů: variabilní velikost podpixelů podle obrázku.",
        "True Dither: Advanced dithering s objednaným výběrem matice.",
        "Extrémní: Maximální viditelnost obrazu, může ovlivnit scannability.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Nastavení ochrany",
      paragraphs: [
        "Finegrainovaná kontrola, nad kterou jsou prvky QR chráněny před úpravou překrytí:",
      ],
      bullets: [
        "Zachování času: Udržujte časové vzory nezměněné.",
        "Zachování zarovnání: Udržujte seřizovací vzory nezměněné.",
        "Chraňte formát Informace: Informační moduly formátu štítu.",
        "Chraňte verzi Info: Štítové informační moduly verze.",
      ],
    },
    {
      heading: "Režim ECC- Aware",
      paragraphs: [
        "Inteligentní distribuce překrývá intenzitu založenou na kapacitě opravy chyb. Systém analyzuje, které moduly lze modifikovat při zachování scannability.",
      ],
      bullets: [
        "Rizikový rozpočet: procento využité kapacity opravy chyb (0-100%).",
        "Vyšší rozpočet = viditelnější překrytí, ale rizikovější skanovatelnost.",
        "Nižší rozpočet = bezpečnější skenování, ale méně viditelné překrytí.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Možnosti profesionálního pronájmu",
      paragraphs: ["Advanced rendering control:"],
      bullets: [
        "Crisp Edges: Pro ostré okraje modulu použijte pixelované vykreslování obrazu.",
        "Pixel Snap: Podlaha, kulaté, nebo Ceil pixelu zarovnání.",
        "Per- Modul Color Mode: Solid, By jasnost, Pozice, Překryv, Cluster.",
        "Barevná paleta: Definujte vlastní barvu palety pro per- modul zbarvení.",
        "Contrast Guard: Zajistit minimální kontrastní poměr mezi barvami.",
        "Min kontrast poměr: WCAG- styl kontrastní požadavek (1: 1 až 21: 1).",
        "Extra hranice Moduly: Další hranice za tichou zónou.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#render",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Možnosti profesionálního výstupu",
      paragraphs: ["Nastavení exportu podniku:"],
      bullets: [
        "DPI: Nastavit rozlišení tisku (72-600 DPI). 300 DPI doporučeno pro tisk.",
        "Zahrnout tichou zónu: Přepnout tichou zónu ve výstupních rozměrech.",
        "Export As Additional: Generovat PDF vedle primárního formátu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#output",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Nastavení animace (profesionální)",
      paragraphs: ["Další profesionální animace:"],
      bullets: [
        "Časový Dither: Off, Blue Noise, nebo Flicker Safe per- frame dithering.",
        "Vzor: Žádné, Pulse, Wave, Scanline, Shimmer, nebo Drift efekty.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#animation",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: "API Odkaz",
      paragraphs: [
        "ANQR poskytuje serverside API pro generování QR kódů pomocí URL parametrů. To je ideální pro vložení QR kódů do webových stránek, e-mailů, dokumentů nebo automatizovaných pracovních toků bez klient- side JavaScript.",
        "V souladu s čl",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Zobrazit příklady QR", type: "example" }],
    },
    {
      heading: "Základní parametry",
      paragraphs: ["Požadované a společné parametry (názvy parametrů nejsou přeloženy):"],
      bullets: [
        "údaje (požadované): Obsah k zakódování do QR kódu. URL-encode speciální znaky.",
        "velikost: Velikost obrázku v pixelech (přednastaveno: 400, max: 2000). Použije se, pokud w / h není specifikováno.",
        "w, h: Výstupní šířka a výška v pixelech. Parametr velikosti.",
        "formát: Výstupní formát - png, webp, nebo gif (výchozí: png).",
        "(přednastaveno: H).",
        "fg: Barva popředí jako hex bez # (výchozí: 000000).",
        "bg: Barva pozadí jako hex bez # (výchozí: ffffff).",
        "transparentní: Nastavit na 1 pro transparentní pozadí.",
        "marže: Tichá zóna v modulech (výchozí: 4).",
      ],
    },
    {
      heading: "Stylingové parametry",
      paragraphs: ["Modul a vzor styling:"],
      bullets: [
        "styl: Modul styl - čtvercový, zaoblený, tečky, diamant, připojen.",
        "nálezce: Nálezce vzor styl - čtvercový, zaoblený, kruh.",
        "zarovnání: Styl zarovnání - match _ finder, square, crowded, circle.",
        "načasování: načasovaný styl vzorů - match _ module, pevná, rozpůlená.",
        "poloměr: procento poloměru rohu 0-100.",
        "mezera: Procento mezery v modulu 0-50.",
        "gapMode: Gap režim - žádný, inset, tah, negativní _ space.",
        "oko Vnější, oční vnitřek: Oční styly - čtvercový, zaoblený, kruh.",
        "oční stupnice: Procento oční stupnice (výchozí hodnota: 100).",
        "grad: Gradient type - žádný, lineární, radiální, kuželovitý.",
        "gradient úhel pro lineární sklony.",
        "gradient Stops: Gradient stops as color1, pos1, color2, pos2,... (např. ff0000,0,00ff, 1).",
      ],
    },
    {
      heading: "Překrývající parametry",
      paragraphs: ["Možnosti překrytí obrázku (překryv obrázku je přitažený serverside):"],
      bullets: [
        "img: URL pro překrytí obrázku (musí být veřejně přístupné).",
        "režim: Režim překrytí - centrum, polotón, směs, jas, mozaika, dithered, blue- hluk, subpixel.",
        "intenzita: Překrytí intenzity 0-100 (výchozí hodnota: 100).",
        "barva Režim: Režim překrytí barev - barva, stupnice šedi, bw.",
        "fit: Jak překrytí sedí - kryt, obsahovat, protáhnout.",
        "hniloba: překrytí rotace ve stupních.",
        "nastavit na 1 pro překlopení.",
        "ponechat Pojistky: Vzorce pro vyhledávání záloh (výchozí hodnota: 1).",
        "ponechat Načasování, keepAlign: Nastavit na 1 pro zachování načasování / zarovnání vzorců.",
      ],
    },
    {
      heading: "Parametry předzpracování",
      paragraphs: ["Předzpracování obrazu aplikované na překrytí:"],
      bullets: [
        "jas: Nastavení -100 na 100 (přednastaveno: 0).",
        "kontrast: Úprava -100 na 100 (výchozí hodnota: 0).",
        "gama: Hodnota 0,1 až 3 (výchozí hodnota: 1).",
        "nasycení: Úprava -100 na 100 (výchozí hodnota: 0).",
        "odstín: otáčení ve stupních.",
        "rozmazané: rozmazané v pixelech.",
        "sharpen: množství Sharpen 0-100.",
        "posterizovat úrovně.",
        "prahová hodnota: Binární práh 0-255.",
        "hrana: Detekce hran - vypnuto, sobel, canny.",
        "invert: Nastavit na 1 invertovat barvy.",
      ],
    },
    {
      heading: "Parametry vodoznaku",
      paragraphs: ["Přidat vodoznaky k generovaným kódům QR:"],
      bullets: [
        "wmen: Nastavte na 1, aby bylo možné vodoznak.",
        "wm Druh: Watermark type - text, obrázek, vzor.",
        "wmText: Watermark text (URL- kódováno).",
        "wmImg: URL pro vodoznak.",
        "wmPos: Position - centre, rohy, hrany, behind, quick _ zone.",
        "wmOpacity: Opacity 0-100 (výchozí: 50).",
        "wmBlend: Směsný režim - normální, násobit, obrazovka, překrytí.",
      ],
    },
    {
      heading: "Parametry animace",
      paragraphs: ["Pro animovaný výstup GIF (vyžaduje formát = gif):"],
      bullets: [
        "anim Vzor: Animace - žádný, puls, vlna, scanline, třpyt, drift, color _ cycle.",
        "anim Rámy: Počet snímků 1-60 (přednastaveno: 24).",
        "anim Rychlost: Zpoždění snímků v milisekundách 10-1000 (přednastaveno: 100).",
        "anim Osivo: Náhodné osivo pro animaci.",
        "uvolňování: Animace uvolňování - lineární, easy _ in, easy _ out, easy _ in _ out, bounce.",
      ],
    },
    {
      heading: "Výstupní parametry",
      paragraphs: ["Možnosti výstupního formátu:"],
      bullets: [
        "kvalita: webP kvalita 0-1 (výchozí hodnota: 0.9).",
        "webpQ: WebP kvalita 0-100 (výchozí: 90).",
        "gifBarvy: velikost palety GIF 2-256 (přednastaveno: 256).",
        "dpi: Výstupní DPI pro PNG (výchozí: 72).",
        "metaTitle, metaAuthor, metaCopy, meta Desc: Pole metadat PNG.",
      ],
    },
    // Crop Parameters
    {
      heading: "Parametry oříznutí",
      paragraphs: ["Možnosti oříznutí překryvného obrázku:"],
      bullets: [
        "cropEn: Povolí oříznutí překrytí 0/1 (výchozí: 0).",
        "cropX: Střed oříznutí X jako zlomek 0-1 (výchozí: 0,5).",
        "cropY: Střed oříznutí Y jako zlomek 0-1 (výchozí: 0,5).",
        "cropSize: Velikost oříznutí jako zlomek obrázku 0-1 (výchozí: 1).",
      ],
    },
    // Safety Lock Parameters
    {
      heading: "Parametry bezpečnostního zámku",
      paragraphs: ["Určete, které QR prvky jsou chráněny před překryvnými úpravami:"],
      bullets: [
        "lockF: Uzamčení vyhledávacích vzorů 0/1 (výchozí: 1).",
        "lockT: Uzamčení vzorů časování 0/1 (výchozí: 1).",
        "lockA: Uzamknout vzory zarovnání 0/1 (výchozí: 1).",
        "lockFmt: Informace o formátu zámku 0/1 (výchozí: 1).",
        "lockV: Informace o verzi zámku 0/1 (výchozí: 1).",
        "safeMode: Bezpečný režim - vypnutý, vyvážený, přísný (výchozí: vypnuto).",
        "safeMinPx: Minimální velikost modulu v pixelech (výchozí: 2).",
        "safeMinQz: Minimální moduly tiché zóny (výchozí: 4).",
      ],
    },
    // Auto-tuning Parameters
    {
      heading: "Parametry automatického ladění",
      paragraphs: ["Nastavení automatické optimalizace:"],
      bullets: [
        "autoVer: Automatický výběr QR verze 0/1 (výchozí: 1).",
        "autoEcc: Automatický výběr ECC úroveň 0/1 (výchozí: 0) – pouze nápověda na straně serveru.",
        "autoReduce: [POUZE KLIENT] Automatické snížení intenzity, dokud nebude možné skenovat – vyžaduje smyčku ověření skenování.",
      ],
    },
    // Additional Animation Parameters
    {
      heading: "Další parametry animace",
      paragraphs: ["Rozšířené ovládací prvky animace pro výstup GIF:"],
      bullets: [
        "loop: Animační smyčky nepřetržitě 0/1 (výchozí: 1).",
        "bounce: Směr animace ping-pongu 0/1 (výchozí: 0).",
        "obráceně: Přehrát animaci pozpátku 0/1 (výchozí: 0).",
        "colorCycle: Povolí efekt cyklování barev 0/1 (výchozí: 0).",
        "interp: Interpolace snímků - žádná, prolínání, morph (výchozí: žádná).",
        "tempDither: Temporal dithering - off, blue_noise, flicker_safe (výchozí: vypnuto).",
        "startF: Počáteční snímek animace (výchozí: 0).",
        "maxF: Maximální počet snímků k vykreslení (výchozí: 0 = auto).",
        "stepF: Interval kroku snímku (výchozí: 1).",
        "jitter: [POUZE KLIENT] Jitter modulu v pixelech – vyžaduje regeneraci QR kódu na snímek.",
      ],
    },
    // Dithering Parameters
    {
      heading: "Parametry rozkladu",
      paragraphs: ["Řídit algoritmy rozkladu pro zpracování překryvů:"],
      bullets: [
        "ditherKind: Algoritmus rozkladu - error_diffusion, order_bayer, blue_noise atd. (výchozí: order_bayer).",
        "diffusionKernel: Error diffusion kernel - floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (výchozí: floyd_steinberg).",
        "ditherStrength: Intenzita ditheru 0-100 (výchozí: 50).",
        "serpentýn: Hadí dithering 0/1 (výchozí: 0).",
        "matice: Uspořádaná matice rozkladu - bayer2, bayer4, bayer8 (výchozí: bayer4).",
        "bnTile: Velikost dlaždice modrého šumu (výchozí: 64).",
        "bnSeed: Náhodný zdroj modrého šumu (výchozí: 0).",
        "colorDither: Rozklad barev - žádný, per_channel, percepční (výchozí: žádné).",
      ],
    },
    // Subpixel Parameters
    {
      heading: "Parametry subpixelů",
      paragraphs: ["Nastavení režimu prolnutí subpixelů:"],
      bullets: [
        "spGrid: Velikost mřížky subpixelů – 2x2, 3x3, 4x4 (výchozí: 3x3).",
        "spCenter: Center rule - strict, halftone_center (výchozí: strict).",
        "spNeutral: Neutrální šestihranná barva bez # (výchozí: 808080).",
        "spFinder: Přepsání Finderu – plné, stylizované (výchozí: plné).",
      ],
    },
    // Halftone Parameters
    {
      heading: "Parametry polotónů",
      paragraphs: ["Nastavení režimu prolnutí polotónů:"],
      bullets: [
        "htCell: Velikost půltónové buňky - per_module nebo nxn grid (výchozí: per_module).",
        "htDot: Tvar tečky - kruh, čtverec, čára (výchozí: kruh).",
        "htCurve: Křivka jasu - lineární, s-křivka, gama (výchozí: lineární).",
        "duo1: Šestnáctková barva stínu Duotone bez # (výchozí: 000000).",
        "duo2: Duotone zvýrazněná barva hex bez # (výchozí: ffffff).",
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: "Parametry režimu ECC",
      paragraphs: ["Inteligentní distribuce překrytí založená na kapacitě opravy chyb:"],
      bullets: [
        "eccAware: Povolí režim ECC 0/1 (výchozí: 0).",
        "eccRisk: Procento rizikového rozpočtu 0-100 (výchozí: 50).",
        "eccMap: Hmotnostní mapa - distance_to_finders, block_heatmap, empirical_scan_heatmap (výchozí: distance_to_finders).",
      ],
    },
    // Frame Parameters
    {
      heading: "Parametry rámu",
      paragraphs: ["Nastavení ozdobného rámu:"],
      bullets: [
        "rám: Styl rámečku – žádný, rounded_frame, nálepka, tag (výchozí: žádný).",
        "frameText: Text, který se má zobrazit v rámci (zakódováno URL).",
      ],
    },
    // Per-Module Color Parameters
    {
      heading: "Parametry barev podle modulu",
      paragraphs: ["Možnosti barevného provedení jednotlivých modulů:"],
      bullets: [
        "modColor: Barevný režim - plný, by_jas, by_position, by_overlay, by_cluster (výchozí: solid).",
        "cGuard: Ochrana kontrastu 0/1 (výchozí: 0).",
        "minContrast: Minimální kontrastní poměr 1-21 (výchozí: 4,5).",
        "paleta: Čárkami oddělené hexadecimální barvy pro režim palety.",
        "paletteMode: Rozložení palety - pozice, jas, úhlopříčka, radiální, náhodné, řádek, sloupec (výchozí: pozice).",
      ],
    },
    // GIF Overlay Parameters
    {
      heading: "Parametry překrytí GIF",
      paragraphs: ["Nastavení pro animované překryvné obrázky GIF:"],
      bullets: [
        "ovType: Typ překrytí - statický, gif, apng, webp_anim, video (výchozí: statický).",
        "ovFramePick: Výběr snímků - vše, každý_n, max_snímky, limit trvání (výchozí: vše).",
        "gifDelays: Použít původní zpoždění snímků GIF 0/1 (výchozí: 1).",
        "gifDispH: Manipulace s likvidací GIF - respektovat, zjednodušit (výchozí: respektovat).",
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: "Limity intenzity na ECC",
      paragraphs: ["Maximální intenzita překrytí na úroveň opravy chyb:"],
      bullets: [
        "maxIntL: Maximální intenzita pro ECC L 0-100 (výchozí: 100).",
        "maxIntM: Maximální intenzita pro ECC M 0-100 (výchozí: 100).",
        "maxIntQ: Maximální intenzita pro ECC Q 0-100 (výchozí: 100).",
        "maxIntH: Maximální intenzita pro ECC H 0-100 (výchozí: 100).",
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: "Parametry simulace kontroly kvality (pouze klient)",
      paragraphs: [
        "Tyto parametry jsou analyzovány kvůli kompatibilitě URL, ale fungují pouze v prohlížeči:",
      ],
      bullets: [
        "qaContrast: Povolit kontrolu kontrastu 0/1 – vyžaduje interaktivní ověření.",
        "qaBlur: Simulace rozostření v pixelech – pouze pro interaktivní testování.",
        "qaNoise: Simulace hladiny hluku – pouze pro interaktivní testování.",
        "qaHeatmap: Zobrazit teplotní mapu čitelnosti 0/1 – vyžaduje uživatelské rozhraní pro překrytí plátna.",
      ],
    },
    // Client-Only Parameters
    {
      heading: "Parametry pouze pro klienta",
      paragraphs: [
        "Většina parametrů API je plně podporována na straně serveru. Parametry označené [POUZE KLIENT] jsou analyzovány z důvodu kompatibility URL, ale vyžadují funkce prohlížeče:",
      ],
      bullets: [
        "Jitter: Jitter modulu vyžaduje regeneraci QR QR s náhodností.",
        "autoReduce: Automatické snížení intenzity vyžaduje opakované testování skenování.",
        "qaContrast, qaBlur, qaNoise, qaHeatmap: Simulace QA vyžaduje ověření interaktivního plátna.",
      ],
    },
    // Additional Output Parameters
    {
      heading: "Další výstupní parametry",
      paragraphs: ["Rozšířené nastavení výstupu a exportu:"],
      bullets: [
        "fname: Vlastní název souboru pro stahování (výchozí: anqr-qrcode).",
        "inclQz: Zahrnout tichou zónu do výstupních rozměrů 0/1 (výchozí: 1).",
        "bgOver: Přepíše barvu pozadí hex bez # (přepíše parametr bg).",
        "fmtExtra: Výstup dalšího formátu – žádný, eps, animovaný_webp (výchozí: žádný). Poznámka: eps je [PARTIAL].",
        "svgPrec: Přesnost tvaru SVG - pixel, přesný (výchozí: pixel). [ČÁSTEČNÝ] Omezený výstup SVG na straně serveru.",
        "svgEmbed: Vloží rastrové překrytí do SVG 0/1 (výchozí: 1). [ČÁSTEČNÝ] Omezený výstup SVG na straně serveru.",
        "modulePx: Velikost modulu v pixelech (výchozí: automaticky počítáno z velikosti).",
        "border: Extra hraniční moduly mimo klidovou zónu (výchozí: 0).",
        "crisp: Povolí vykreslování ostrého/pixelovaného obrazu 0/1 (výchozí: 1).",
        "snap: Režim Pixel snap - podlaha, kulatý, strop (výchozí: podlaha).",
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: "Parametry zachování vzoru",
      paragraphs: ["Určete, které konstrukční prvky jsou chráněny před překrytím:"],
      bullets: [
        "keepFinders: Zachovat vyhledávací vzory 0/1 (výchozí: 1).",
        "keepTiming: Zachová vzory časování 0/1 (výchozí: 0).",
        "keepAlign: Zachová vzory zarovnání 0/1 (výchozí: 0).",
        "protectFmt: Ochrana informačních modulů formátu 0/1 (výchozí: 0).",
        "protectVer: Ochrana informačních modulů verze 0/1 (výchozí: 0).",
      ],
    },
    {
      heading: "Příklad použití",
      paragraphs: [
        "Základní QR kód:",
        "e",
        "Stylovaný QR kód s vlastní barvou:",
        "http: / / anqr.link / api / qr? data = Hello & size = 300 & fg = 1e40af & bg = ffffff & style = rounded & radius = 30",
        "Kód QR s překryvem:",
        "viz poznámka pod čarou1",
        "Animovaný GIF:",
        "https: / / anqr.link / api / qr? data = Hello & format = gif & animPattern = impuls & animFrames = 24 & easing = easy _ in _ out",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Zobrazit příklady QR", type: "example" }],
    },
    {
      heading: "Vložení kódů QR",
      paragraphs: [
        "V režimu Professional, Funkce Share generuje vkládací HTML a URL. Zde je způsob, jak embedding funguje:",
      ],
      bullets: [
        "Sdílet Odkaz: Vytvoří URL pro aplikaci ANQR se všemi nastaveními kódovanými jako URL parametry. Příjemci mohou zobrazit a upravit QR kód.",
        "Embed Image: Vytváří < img > tag ukazující na server API. QR kód je zobrazen serverside a slouží jako obrázek.",
        "Embed Markdown: Vytvoří syntaxi Markdown pro dokumentaci a README soubory.",
        "Přímá URL API: Syrové URL API pro použití v aplikacích, skriptech nebo jiných integracích.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Příklad HTML",
      paragraphs: [
        "Chcete-li vložit QR kód do vašeho webu:",
        '< img src = \\"https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 200\\" alt = \\"QR Code\\" / >',
        "Reagující velikost:",
        '< img src = \\"https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 400\\" alt = \\"QR Code\\" style = \\"max- width: 100%; výška: auto;\\" / >',
        "Server uchovává odpovědi s dlouhými hlavičkami cache, takže opakované požadavky na stejné URL jsou rychlé.",
      ],
    },
    {
      heading: "Sdílet URL formát",
      paragraphs: [
        "Když kliknete na Sdílet v profesionálním režimu, ANQR zakóduje vaše aktuální nastavení do URL parametrů. Formát je:",
        "https: / / anqr.link /? data =... & ec = H & style = round &....",
        "Tyto parametry odrážejí parametry API, takže můžete převést URL sdílení na URL API změnou základní cesty z / do / api / qr a podle potřeby upravit parametry w / h.",
        "Poznámka: Překrývání obrázků nahraných z lokálních souborů nelze sdílet přes URL - pouze překryvy založené na URL (img parametr) pracují ve sdílených odkazech a volání API.",
      ],
    },
    {
      heading: "Mezní hodnoty a použití",
      paragraphs: [
        "API je volně použitelný pro rozumné objemy. Pro vysokoobjemové použití nebo komerční aplikace vyžadující zaručený čas, nás prosím kontaktujte.",
        "API reakce zahrnují agresivní caching hlavičky. Pro nejlepší výkon, cache odpovědi na vašem konci nebo používat stejné URL konzistentně pro identické QR kódy.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: "Nejlepší postupy",
      paragraphs: ["Dodržujte tyto pokyny pro spolehlivé QR kódy:"],
      bullets: [
        "Před vytištěním vždy otestujte QR kódy pomocí více scannerových aplikací.",
        "Při přidávání překryvů použijte opravu chyby H (vysoká).",
        "Udržujte alespoň 4 moduly tiché zóny (marže).",
        "Zajistit vysoký kontrast mezi popředím a pozadím.",
        "Pro tisk použijte nejméně 300 DPI a otestujte při skutečné velikosti tisku.",
        "Povolit nálezné vzory pro uložení při použití překryvů.",
        "Začněte s nižší intenzitou překrytí a postupně zvyšujte.",
        "Pro venkovní použití zvažte větší velikost modulu a vyšší opravu chyb.",
      ],
      links: [
        { href: "/learn?lang=${lang}", label: "Procházení Učit články", type: "learn" },
        { href: "/examples?lang=${lang}", label: "Zobrazit příklady QR", type: "example" },
      ],
    },
    {
      heading: "Řešení problémů",
      paragraphs: ["Společné otázky a řešení:"],
      bullets: [
        "QR nebude skenovat: Snížit intenzitu překrytí, zvýšit opravu chyb, zkontrolovat kontrast.",
        "Kód příliš velký: Snižte délku obsahu, použijte zkratku URL, nižší verzi.",
        "Rozmazaný výstup: Zvyšte velikost modulu, použijte PNG místo komprimovaných formátů.",
        "Barvy vypadají špatně: Zkontrolujte kontrast barev, zkuste šedý režim překrytí.",
        "GIF neživé: Zajistit výstup formátu GIF, zkontrolovat počet snímků.",
        "Obrázek se nenačítá: Zkontrolujte oprávnění CORS na vzdálených snímcích.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Viz související pokyny a příklady",
          type: "learn",
        },
      ],
    },
    {
      heading: "Klávesové zkratky",
      paragraphs: [
        "ANQR podporuje standardní klávesové zkratky. Pomocí Ctrl / Cmd + S spustíte export (když se zaměříte na náhled).",
      ],
    },
    {
      heading: "Sdílení & vkládání",
      paragraphs: [
        "V profesionálním režimu klepněte na tlačítko Share a zkopírujte URL s aktuálním nastavením. Příjemci mohou otevřít toto URL pro vaši přesnou konfiguraci. Poznámka: Obrázky z místních souborů nelze sdílet přes URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Zkuste tuto konfiguraci přímo v ANQR generátoru.",
          type: "generator",
        },
      ],
    },
  ],
  relatedLinks: [
    { href: "/learn?lang=${lang}", label: "Procházení Učit články", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Zobrazit příklady QR", type: "example" },
    { href: "/gallery?lang=${lang}", label: "Zobrazit příklady QR", type: "gallery" },
    { href: "/?lang=${lang}", label: "Otevři generátor", type: "generator" },
  ],
};

export default guide;
