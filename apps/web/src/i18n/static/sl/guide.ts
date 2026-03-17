import type { PageDefinition } from "../types";

export const guide: PageDefinition = {
  title: "Uporabniški priročnik za ANQR",
  description: "Popoln vodnik za uporabo ANQR za ustvarjanje kod QR.",
  lastUpdated: "1. februar 2026",
  breadcrumb: ["Vodnik"],
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Odprite generator", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Brskajte po člankih Learn", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Oglejte si primere QR", type: "example" },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: "Kako začeti",
      paragraphs: [
        "ANQR je generator kode QR s pristopom, ki je na prvem mestu odjemalec. Kode QR se privzeto ustvarijo lokalno v vašem brskalniku – račun ni potreben in vaši podatki ostanejo zasebni. Za profesionalno vdelavo lahko uporabite tudi API na strani strežnika.",
        "Vmesnik ima tri ravni vmesnika: osnovno, napredno in profesionalno. Izberite svojo raven z zavihki v glavi. Vsaka raven odklene dodatne funkcije, hkrati pa ohranja vmesnik osredotočen na tisto, kar potrebujete.",
      ],
      bullets: [
        "Osnovno: Preprosto ustvarjanje kode QR z navadnim besedilom/vsebino URL in prekrivno sliko.",
        "Napredno: možnosti kodiranja QR, slogi upodabljanja, animacije, izhodni formati, razširjene vrste vsebine in prilagajanje prekrivanja.",
        "Profesionalno: vodni žigi, metapodatki, skupna raba, varnostna analiza, plačilne kode QR in poslovne funkcije.",
      ],
      links: [{ href: "/?lang=${lang}", label: "Odprite generator", type: "generator" }],
    },
    {
      heading: "Hitri začetek",
      paragraphs: ["Če želite ustvariti svojo prvo kodo QR:"],
      bullets: [
        "1. V spustnem meniju Vrsta vsebine izberite vrsto vsebine (URL, besedilo, WiFi itd.).",
        "2. Vnesite svoje podatke v predvidena polja.",
        "3. Po želji prilagodite barve, sloge in dodajte prekrivno sliko.",
        "4. Kliknite Izvozi, da prenesete kodo QR kot PNG, GIF, WebP ali SVG.",
      ],
      links: [
        {
          href: "/?lang=${lang}",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: "Osnovne lastnosti",
      paragraphs: [
        "Osnovna raven zagotavlja poenostavljen vmesnik za ustvarjanje kod QR z vsebino koristnega tovora in prekrivnimi slikami. To je najenostavnejši način za začetek.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Vrste vsebine (osnovne)",
      paragraphs: [
        "Navadno besedilo: kodirajte poljubno besedilo do omejitve zmogljivosti kode QR. Idealno za kratka sporočila, kode ali identifikatorje.",
        "URL: Kodirajte spletne naslove. Koda QR bo odprla URL, ko jo skenirate. Podpira protokola http:// in https://.",
      ],
    },
    {
      heading: "Prekrivanje slike (osnovno)",
      paragraphs: [
        "Naložite sliko (JPG, PNG, GIF, WebP), da se zlije z vašo kodo QR. Osnovne funkcije prekrivanja vključujejo:",
      ],
      bullets: [
        "Naloži iz datoteke: izberite sliko iz svoje naprave.",
        "Naloži iz URL-ja: Vnesite URL slike (omogočati mora CORS).",
        "Sredinski logotip: postavi sliko na sredino, pri čemer se zanaša na popravljanje napak.",
        "Mešanje: preprosto alfa mešanje slike z vzorcem QR.",
        "Intenzivnost: nadzoruje, kako močno prekrivanje vpliva na kodo QR (0–100 %).",
        "Barvni način: polna barva, sivine ali črno-belo.",
        "Preserve Finder Patterns: Ohranja vogalne vzorce nespremenjene za zanesljivo skeniranje.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic#overlay",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: "Napredne funkcije",
      paragraphs: [
        "Napredna raven odklene možnosti kodiranja QR, sloge upodabljanja, animacije, izhodne formate, razširjene vrste vsebine in napredno prilagajanje prekrivanja.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Nastavitve kodiranja QR",
      paragraphs: [
        "Različica: kode QR so na voljo v različicah 1-40, pri čemer višje različice vsebujejo več podatkov, vendar so večje. Nastavite na 0 (samodejno), da ANQR izbere najmanjšo različico, ki ustreza vaši vsebini.",
        "Popravek napake: Določa, koliko škode lahko utrpi koda QR, medtem ko jo je mogoče skenirati.",
      ],
      bullets: [
        "L (Low): 7 % popravek napake - najmanjša velikost, najmanjša redundanca.",
        "M (srednje): 15 % popravek napak – uravnotežena možnost.",
        "Q (Kvartil): 25 % popravek napake – dobro za natisnjene kode.",
        "H (visoko): 30-odstotno popravljanje napak – najboljše za kode s prekrivanjem ali v težkih pogojih.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#qr-encoding",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Tiho območje (rob)",
      paragraphs: [
        "Tiho območje je bel prostor okoli kode QR. Skenerji potrebujejo ta rob, da zaznajo, kje se začne koda. Standard priporoča vsaj 4 module. Zmanjšanje pod 4 lahko povzroči težave pri skeniranju.",
      ],
    },
    {
      heading: "Slog modula",
      paragraphs: [
        "Moduli so posamezni kvadratki, ki sestavljajo kodo QR. ANQR ponuja pet stilov:",
      ],
      bullets: [
        "Kvadrat: klasičen videz QR z ostrimi vogali.",
        "Zaobljeno: zmehčani vogali za prijaznejši videz.",
        "Pike: krožni moduli za sodobno estetiko.",
        "Diamant: 45° zasukani kvadrati za značilen vzorec.",
        "Povezani: moduli se združijo, ko so sosednji, in ustvarijo organske oblike.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Slog vzorca Finder",
      paragraphs: [
        "Vzorci iskalnika so trije veliki kvadrati v vogalih QR, ki pomagajo skenerjem pri orientaciji kode. Razpoložljivi slogi:",
      ],
      bullets: [
        "Kvadrat: standardni kvadratni vogali.",
        "Zaobljeno: zmehčani vogali, ki se ujemajo s slogom zaobljenega modula.",
        "Krog: Krožni iskalni vzorci za kode v slogu pik.",
      ],
    },
    {
      heading: "Poravnava in časovni vzorci",
      paragraphs: [
        "Vzorci poravnave se pojavijo v večjih kodah QR (različica 2+), da pomagajo popraviti popačenje. Časovni vzorci so izmenične črte, ki povezujejo vzorce iskalnika.",
      ],
      bullets: [
        "Slog poravnave: Iskalnik ujemanja, kvadrat, zaokroženo ali krog.",
        "Časovni slog: modul ujemanja, polno ali črtkano.",
      ],
    },
    {
      heading: "Barve",
      paragraphs: [
        "Ospredje: barva modulov QR. Črna (#000000) je standardna, vendar deluje katera koli temna barva.",
        "Ozadje: Barva ozadja. Bela (#ffffff) je standardna. Poskrbite za zadosten kontrast z ospredjem.",
        "Prozorno ozadje: V celoti odstranite ozadje za uporabo na barvnih površinah. Prepričajte se, da ima površina ustrezen kontrast.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Velikost in vrzel modula",
      paragraphs: [
        "Velikost modula: nadzira, kako velik je vsak modul upodobljen v slikovnih pikah. Večje vrednosti ustvarjajo večje kode, ki jih je lažje skenirati.",
        "Module Gap: doda prostor med moduli kot odstotek. Majhne vrzeli (5-15 %) lahko izboljšajo preglednost v nekaterih pogojih, vendar prevelike vrzeli zmanjšajo zanesljivost.",
      ],
    },
    {
      heading: "Izhodne nastavitve",
      paragraphs: ["Oblika: izberite obliko izvoza glede na primer uporabe."],
      bullets: [
        "PNG: rastrski format brez izgub, idealen za večino uporab. Najboljše za tisk in digitalno.",
        "WebP: Sodoben format z manjšimi velikostmi datotek. Dobro za spletno uporabo.",
        "GIF: Zahtevano za animirane kode QR. Podpira preglednost.",
        "SVG: Vektorski format, ki se neskončno spreminja. Najboljše za velik tisk ali ko morate urediti kodo.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-3",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    {
      heading: "Izhodne dimenzije",
      paragraphs: [
        "Širina/višina: nastavite velikost izpisa v slikovnih pikah. Za tiskanje izračunajte na podlagi DPI (npr. 300 DPI na 1 palec = 300 slikovnih pik). Večje velikosti skenirajo bolj zanesljivo na daljavo.",
      ],
    },
    {
      heading: "Nastavitve animacije (napredno)",
      paragraphs: ["Nadzor vedenja animirane kode QR:"],
      bullets: [
        "Hitrost: hitrost sličic animacije v milisekundah.",
        "Zanka: Neprekinjena ali enkratna animacija.",
        "Bounce: smer animacije ping-ponga.",
        "Začni okvir: Začnite animacijo od določenega okvira.",
        "Največje število sličic: Omejite skupno število sličic v animaciji.",
        "Korak okvirja: preskočite okvirje za hitrejšo animacijo.",
        "Interpolacija: None, Crossfade ali Morph med sličicami.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    {
      heading: "Vrste vsebine (napredno)",
      paragraphs: ["Napredna raven odklene dodatne formate koristnega tovora:"],
      bullets: [
        "Telefonska številka (tel:): Ustvari klicno telefonsko povezavo.",
        "E-pošta (mailto:): odpre e-poštnega odjemalca z neobvezno zadevo in telesom.",
        "SMS: vnaprej izpolnjeno besedilno sporočilo na telefonsko številko.",
        "vCard: polna kontaktna kartica z imenom, organizacijo, telefonom, e-pošto, naslovom.",
        "MeCard: kompaktna kontaktna oblika, priljubljena na Japonskem.",
        "BizCard: Podedovani format vizitke.",
        "Geografska lokacija: koordinate GPS, ki se odprejo v zemljevidih.",
        "WiFi: Omrežne poverilnice za samodejno povezavo (SSID, geslo, vrsta varnosti).",
        "Koledarski dogodek: oblika iCalendar z naslovom, lokacijo, datumom/časom.",
        "Odgovor na dogodek: povezava do strani za prijavo na dogodek.",
        "Naročite se na koledar: naročite se na vir ICS/WebCal.",
        "URL datoteke/dokumenta: Neposredna povezava do datotek, ki jih je mogoče prenesti.",
        "Povezava za shranjevanje v oblaku: povezave do Google Drive, Dropbox, OneDrive itd.",
        "Socialni profil: povezave do LinkedIna, Twitterja, Instagrama itd.",
        "Povezava za sporočanje: globoke povezave WhatsApp, Telegram, Signal.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Napredne funkcije prekrivanja",
      paragraphs: ["Dodatne zmožnosti prekrivanja:"],
      bullets: [
        "Obrezovanje: omogočite obrezovanje, da izberete kvadratno območje vaše slike.",
        "Polton: Klasičen vzorec pik v slogu tiskanja, ki temelji na svetlosti slike.",
        "Dithered: difuzijsko razprševanje napak za podrobno reprodukcijo.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#overlay",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Načini mešanja prekrivanja (napredno)",
      paragraphs: ["Dodatni načini mešanja na napredni ravni:"],
      bullets: [
        "Podpiksli: razdeli vsak modul na podpiksle za več podrobnosti.",
        "Modri šum: uporablja umirjanje modrega šuma za vzorce brez artefaktov.",
        "Mozaik: učinek ploščic, ki ohranja strukturo slike.",
        "Gap Fill: Postavi sliko v vrzeli med moduli.",
        "Svetlost: spreminja velikost modula glede na svetlost slike.",
        "Duotone: Preslika sliko v dve barvi za osupljiv kontrast.",
      ],
    },
    {
      heading: "Intenzivnost prekrivanja",
      paragraphs: [
        "Nadzoruje, kako močno prekrivanje vpliva na kodo QR (0–100 %). Višje vrednosti prikazujejo več podrobnosti slike, vendar lahko zmanjšajo možnost skeniranja. Začnite pri približno 70 % in prilagodite glede na testiranje.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    {
      heading: "Barvni način",
      paragraphs: ["Kako se obdela prekrivna slika:"],
      bullets: [
        "Polna barva: Ohrani izvirne barve slike.",
        "Sivine: Pretvori v črno-bele odtenke.",
        "Črno-belo: visokokontrastna binarna pretvorba.",
      ],
    },
    {
      heading: "Ohrani vzorce iskalnika",
      paragraphs: [
        "Ko je omogočeno, ohrani tri vzorce iskalnika vogalov nespremenjene s prekrivanjem. Močno priporočljivo za zanesljivo skeniranje.",
      ],
    },
    {
      heading: "Predhodna obdelava slike",
      paragraphs: [
        "Uporabite filtre za prekrivno sliko pred mešanjem. Te prilagoditve lahko izboljšajo videz slike v končni kodi QR.",
      ],
      bullets: [
        "Svetlost (-100 do +100): Posvetlite ali potemnite sliko.",
        "Kontrast (-100 do +100): Povečajte ali zmanjšajte tonski obseg.",
        "Gama (0,2 do 3,0): Nelinearna prilagoditev svetlosti. Vrednosti pod 1 osvetlijo srednje tone, nad 1 pa jih potemnijo.",
        "Nasičenost (-100 do +100): Intenzivnost barve. -100 je sivina, +100 je prenasičena.",
        "Hue Rotate (0-360°): premaknite vse barve okoli barvnega kolesa.",
        "Zameglitev (0–20 slikovnih pik): zmehčajte podrobnosti slike.",
        "Ostrina (0–100 %): izboljša robove in podrobnosti.",
        "Posterizacija (0–16 ravni): Zmanjšajte barvne ravni za učinek plakata.",
        "Prag (0–255): Pretvori v binarno črno/belo na mejni točki.",
        "Zaznavanje robov: algoritmi Sobel ali Canny za prikaz samo robov.",
        "Obrni: Obrnite vse barve.",
      ],
    },
    {
      heading: "Fit način",
      paragraphs: ["Kako se prekrivna slika prilega območju kode QR:"],
      bullets: [
        "Naslovnica: Slika zapolni celotno območje, po potrebi jo obrežemo.",
        "Vsebuje: vidna je celotna slika, lahko ima robove.",
        "Raztegni: Slika se popači, da se natančno zapolni.",
      ],
    },
    {
      heading: "Možnosti preoblikovanja",
      paragraphs: [
        "Vrtenje: zavrtite prekrivanje v korakih po 90°.",
        "Flip X/Y: Zrcaljenje slike vodoravno ali navpično.",
      ],
    },
    {
      heading: "Algoritmi ditheringa",
      paragraphs: [
        "Dithering pretvori slike neprekinjenega tona v vzorce, ki jih lahko predstavljajo kode QR. Na voljo pri uporabi načinov mešanja Dithered, Blue Noise ali True Dither.",
      ],
      bullets: [
        "Error Diffusion: klasičen Floyd-Steinbergov slog. Razširi napako kvantizacije na sosednje slikovne pike.",
        "Urejeno (Bayer): uporablja matriko praga za pravilne vzorce.",
        "Clustered Dot: Simulira poltonsko tiskanje.",
        "Void & Cluster: Optimizirano urejeno drgnjenje.",
        "Modri šum: vizualno prijeten naključni vzorec.",
        "Prag modrega šuma: mehčanje praga s teksturo modrega šuma.",
        "Beli šum: Naključno mehčanje praga.",
        "Gaussov/trikotni šum: šum z različnimi porazdelitvami.",
        "Blue Noise + Error Diffusion: Hibrid, ki združuje obe tehniki.",
        "Screened Blue Noise: vzorec modrega šuma, podoben zaslonu.",
        "Zaznavno: Uteženo glede na svetilnost za boljše vizualne rezultate.",
        "Edge-Aware: Ohranja robove slike med drsenjem.",
        "Prilagodljivi prag: lokalno prilagodljiv prag.",
        "Časovni modri šum: za animirane GIF-e se vzorec spreminja na okvir.",
      ],
    },
    {
      heading: "Difuzijska jedra",
      paragraphs: ["Ko uporabljate dithering Error Diffusion, izberite, kako se napaka porazdeli:"],
      bullets: [
        "Floyd-Steinberg: Klasična 4-sosednja difuzija. Dobra splošna izbira.",
        "Jarvis-Judice-Ninke: 12-sosed, bolj gladko, a počasneje.",
        "Stucki: Podobno kot JJN z različnimi utežmi.",
        "Burkes: Poenostavljeno JJN, hitreje.",
        "Sierra: družina jeder, ki uravnotežijo kakovost in hitrost.",
        "Atkinson: difuzija svetlobe, ohranja podrobnosti, vendar je lahko zrnat.",
      ],
    },
    {
      heading: "Dither Strength",
      paragraphs: [
        "Nadzira, kolikšna količina drhtenja je uporabljena (0–100 %). Nižje vrednosti ohranijo več prvotnega vzorca, višje vrednosti pa prikažejo več podrobnosti slike.",
      ],
    },
    {
      heading: "Nastavitve podpikslov",
      paragraphs: ["Pri uporabi načina mešanja podpikslov:"],
      bullets: [
        "Velikost mreže: 2×2, 3×3 ali 4×4 podpiksli na modul. Višje = več podrobnosti.",
        "Sredinsko pravilo: strogo zahteva, da se sredinska podpikselna točka ujema z modulom. Halftone Center omogoča variacije.",
        "Nevtralna barva: Barva, uporabljena za nedoločene podslikovne pike.",
        "Preglasitev iskalnika: kako so upodobljeni vzorci iskalnika (polno ali stilizirano).",
      ],
    },
    {
      heading: "Nastavitve poltonov",
      paragraphs: ["Pri uporabi načina mešanja poltonov:"],
      bullets: [
        "Velikost celice: na modul ali mrežo N×N.",
        "Oblika pike: krog, kvadrat ali črta.",
        "Krivulja svetlosti: linearna, S-krivulja ali gama.",
      ],
    },
    {
      heading: "Duotone barve",
      paragraphs: [
        "Ko uporabljate način mešanja Duotone, nastavite barvo sence (temna območja) in barvo osvetlitve (svetla območja).",
      ],
    },
    {
      heading: "Nastavitve animacije GIF",
      paragraphs: ["Pri uporabi animiranih prekrivnih datotek GIF:"],
      bullets: [
        "Uporabite zakasnitve sličic: upoštevajte izvirni čas GIF.",
        "Max FPS: Omejite hitrost sličic (1-60 fps).",
        "Ravnanje pri odstranjevanju: Spoštujte ali poenostavite metode odstranjevanja okvirjev.",
      ],
    },
    {
      heading: "Napredne možnosti upodabljanja",
      paragraphs: ["Dodatne kontrole upodabljanja:"],
      bullets: [
        "Način vrzeli: brez, slog vrzeli, črte ali negativnega prostora.",
        "Polmer vogalov: odstotek zaobljenih vogalov za module.",
        "Gradient: brez, linearni, radialni ali konični gradient na modulih.",
        "Zunanji/notranji slog očesa: neodvisen slog za prstane z vzorcem iskalnika.",
        "Vrtenje pike: vrtite diamantne/pikčaste module.",
        "Eye Scale: prilagoditev velikosti za vzorce iskalnika.",
        "Slog okvirja: dodajte okrasne okvirje (zaobljeni okvir, nalepka, oznaka).",
        'Besedilo okvirja: dodajte besedilo, kot je "Skeniraj me!" na okvirje.',
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Napredno QR kodiranje",
      paragraphs: ["Natančna nastavitev kodiranja QR:"],
      bullets: [
        "Način kodiranja: samodejni, številski, alfanumerični, bajt/UTF-8 ali kanji.",
        "Uveljavi minimalno tiho območje: Zagotovite vsaj 4 modulne rezerve.",
        "Vzorec maske: Samodejno (optimalno) ali ročno izberite vzorce 0-7 za nadzor porazdelitve modula. Različni vzorci med kodiranjem istih podatkov ustvarjajo različne vizualne videze.",
        "Kodiranje znakov: ISO-8859-1 (privzeta latinica-1), UTF-8 (poln Unicode, vključno z emoji) ali Shift-JIS (japonščina). Izberite glede na zahteve glede značaja vaše vsebine.",
      ],
    },
    {
      heading: "Napredne izhodne možnosti",
      paragraphs: ["Dodatne nastavitve izvoza:"],
      bullets: [
        "Ime datoteke: Ime datoteke po meri za prenose.",
        "Velikost palete GIF: 2–256 barv v izpisu GIF.",
        "GIF Quantizer: zmanjšanje barve Mediana Cut, NeuQuant ali Octree.",
        "GIF Dithering: izklopljeno, Floyd-Steinberg ali urejeno.",
        "GIF Transparent Color: nastavite barvo, da bo prozorna.",
        "SVG True Vector: uporabite poti namesto vdelanega rastra.",
        "Natančnost oblike SVG: upodabljanje pikslov ali natančne poti.",
        "SVG Embed Raster Overlay: Vključi prekrivanje kot vdelano sliko.",
        "Preglasitev ozadja: vsili določeno barvo ozadja v izpisu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Možnosti preverjanja",
      paragraphs: ["Nastavitve obdelave vnosa:"],
      bullets: [
        "Preveri vnos: Pred kodiranjem preverite obliko vsebine.",
        "Trim Whitespace: Odstranite presledke na začetku/zadnji strani.",
        "Normaliziraj nove vrstice: pretvori vse končnice vrstic v LF.",
        "Zaščita največje dolžine: opozori, če vsebina presega zmogljivost QR.",
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: "Profesionalne lastnosti",
      paragraphs: [
        "Raven Professional dodaja vodne žige, metapodatke, možnosti skupne rabe, varnostno analizo, plačilne kode QR in poslovne funkcije.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Vodni žig",
      paragraphs: ["Svojim QR kodam dodajte vodne žige:"],
      bullets: [
        "Vrsta: besedilo, slika ali vodni žig z vzorcem.",
        "Položaj: sredina, vogali, robovi, zadaj ali tiho območje.",
        "Motnost: prosojnost vodnega žiga (0–100 %).",
        "Način mešanja: običajno, pomnoženo, zaslonsko ali prekrivno mešanje.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#watermark",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Metapodatki",
      paragraphs: ["Vdelajte metapodatke v izvožene datoteke:"],
      bullets: [
        "Polja Naslov, Avtor, Avtorska pravica, Licenca, Opis.",
        "Čas ustvarjanja: Vdelajte časovni žig generacije.",
        "Ključna vrednost po meri: dodajte poljubne pare metapodatkov.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#metadata",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Skupna raba",
      paragraphs: ["Delite svoje konfiguracije kode QR:"],
      bullets: [
        "Neposredna povezava: ustvarite URL, ki ga je mogoče deliti s trenutnimi nastavitvami.",
        "Vdelaj HTML: pridobite vdelano kodo za spletna mesta.",
        "Kodiraj parametre: vključi vse nastavitve v URL za skupno rabo.",
        "Opomba: prekrivnih slik iz lokalnih datotek ni mogoče deliti prek URL-ja.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-7",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    {
      heading: "Varnostna analiza",
      paragraphs: ["Zagotovite, da bodo kode QR še vedno mogoče skenirati:"],
      bullets: [
        "Varnostni način: zahteve za izklop, uravnoteženo ali stroge preglede.",
        "Najmanjša velikost modula: najmanjša velikost slikovnih pik na modul.",
        "Najmanjša tiha cona: moduli z minimalno maržo.",
        "Lock Finders/Timing/Align/Format/Version: Zaščitite določene elemente.",
        "Največja intenzivnost prekrivanja po ECC: Samodejne omejitve intenzivnosti glede na stopnjo popravka napak.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#safety",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    {
      heading: "Vrste vsebine (profesionalno)",
      paragraphs: ["Profesionalna raven dodaja plačilne in poslovne vsebine:"],
      bullets: [
        "EPC/SEPA (EU): QR kode za evropska bančna nakazila z IBAN, BIC, zneskom, referenco.",
        "UPI (Indija): enotni vmesnik za plačila z VPA, ime prejemnika plačila, znesek.",
        "PayNow (Singapur): Singapursko hitro plačilo z UEN ali mobilno številko.",
        "PromptPay (Tajska): Tajski nacionalni plačilni sistem.",
        "PIX (Brazilija): Brazilsko takojšnje plačilo s ključem PIX.",
        "Kripto: Bitcoin, Ethereum, Litecoin plačilni naslovi z izbirnim zneskom.",
        "Povezava marketinške akcije: URL-ji s sledenjem celotnega parametra UTM (marketinške oznake).",
        "Kratka povezava: Za uporabo s skrajšalci URL-jev za dinamične/sledljive kode QR.",
        "Digitalna povezava GS1: Identifikacija izdelka z GTIN, serijo, serijo, potekom.",
        "Globoka povezava aplikacije: globinske povezave aplikacij za iOS/Android s shemami po meri.",
        "Oblika po meri: neobdelani podatki brez oblikovanja ali preverjanja.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-2",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: "Plačila v naprednem načinu glede na jezik",
      paragraphs: [
        "Ko uporabljate napredni način, ANQR samodejno prikaže načine plačila, ki ustrezajo vašemu izbranemu jeziku. Na primer, vietnamski uporabniki vidijo VietQR, tajski uporabniki vidijo PromptPay, uporabniki indijskega jezika pa vidijo UPI in BharatQR. Globalna plačilna sredstva (kriptovaluta, PayPal, Cash App) so na voljo v vseh jezikih. Profesionalni način odklene vse plačilne standarde ne glede na jezik.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Evropski plačilni standardi",
      bullets: [
        "EPC/SEPA (EU): kode QR za evropska bančna nakazila, ki sledijo standardu kod QR EPC. Podpira IBAN, BIC (izbirno za domače), znesek v EUR ter strukturirane ali nestrukturirane reference plačil. Uporablja se v območju SEPA, vključno z državami EU ter Švico, Norveško, Islandijo, Lihtenštajnom, Monakom in San Marinom.",
        "Švicarski QR-račun: švicarski plačilni standard po SIX smernicah za izvajanje. Podpira CHF in EUR, QR-referenco (QRR), referenco upnika (ISO 11649), strukturirane naslove upnikov/dolžnikov in informacije o računih. Zahtevano za račune v Švici od leta 2022.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Indijski plačilni standardi",
      bullets: [
        "UPI (Indija): vmesnik za poenotena plačila po specifikaciji globokega povezovanja NPCI. Podpira VPA (navidezni plačilni naslov), ime prejemnika plačila, znesek v INR, obvestilo o transakciji, referenčni ID, kodo kategorije trgovca in način transakcije.",
        "BharatQR (Indija): Enoten standard QR, ki podpira UPI in plačila s karticami. Združuje UPI VPA s kartico PAN za največjo združljivost. Vključuje ime trgovca, mesto, MCC, podatke o GST in račun/referenčno številko.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Plačilni standardi jugovzhodne Azije",
      bullets: [
        "PayNow (Singapur): singapurski hitri plačilni sistem, ki uporablja specifikacijo EMVCo QR s profilom SGQR. Podpira UEN (registracijo podjetja), mobilno številko ali NRIC kot proxy identifikatorje. Vključuje zastavico za urejanje količine in datum poteka.",
        "PromptPay (Tajska): tajski nacionalni plačilni sistem po profilu EMV Banke Tajske. Podpira številko mobilnega telefona, nacionalno identifikacijsko številko, davčno številko, ID e-denarnice in plačilo računov z več referenčnimi polji.",
        "QRIS (Indonezija): indonezijski standard kode za hitri odziv. Nacionalni plačilni standard, ki temelji na EMV in podpira ID trgovca, NMID (National Merchant ID), klasifikacijo meril trgovca in provizije (fiksne ali odstotne).",
        "DuitNow (Malezija): malezijski sistem takojšnjih plačil. Podpira več vrst posrednikov, vključno s številkami NRIC, mobilnimi telefoni, potnimi listi, vojaškimi osebnimi številkami in registracijskimi številkami podjetij.",
        "VietQR (Vietnam): vietnamski medbančni standard za prenos. Zahteva bančni BIN (ID NAPAS) in številko računa. Podpira več servisnih kod za različne vrste prenosov (QRPUSH, QRIBFTTA, QRIBFTTC).",
        "QR Ph (Filipini): filipinski QR plačilni standard za InstaPay in PESONet. Uporablja številke računov z identifikacijo trgovca za transakcije P2M (od osebe do trgovca).",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Vzhodnoazijski plačilni standardi",
      bullets: [
        "TWQR (Tajvan): Tajvanski standard plačil QR. Podpira ID trgovca, davčno številko in zneske v TWD.",
        "HKQR/FPS (Hong Kong): QR kode hitrejšega plačilnega sistema Hong Konga. Podpira FPS ID, mobilno številko ali e-pošto kot identifikatorje plačila. Zneski v HKD.",
        "JPQR (Japonska): japonski enoten plačilni standard s kodo QR. Uporablja ID trgovine za identifikacijo trgovca z zneski v JPY.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Drugi regionalni plačilni standardi",
      bullets: [
        "PIX (Brazilija): Sistem takojšnjih plačil Brazilske centralne banke po specifikaciji kode BR. Podpira ključe PIX (CPF, CNPJ, e-pošto, telefon ali naključni ključ), ime/mesto trgovca, ID transakcije in zneske BRL.",
        "AusPayNet/NPP PayID (Avstralija): sistem PayID za novo avstralsko plačilno platformo. Podpira vrste PayID (e-pošta, mobilni telefon, ABN, ID organizacije) ali tradicionalni BSB + številka računa. Ime trgovca ni obvezno, saj plačniki vidijo registrirano ime pri iskanju NPP.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Plačila s kriptovalutami",
      bullets: [
        "Bitcoin/Litecoin (BIP-21): URI standardnega plačila s kriptovaluto z naslovom denarnice, neobveznim zneskom in oznako. Združljivo z vsemi večjimi denarnicami Bitcoin in Litecoin.",
        "Lightning Network (BOLT11): računi za plačilo Lightning Network. Prilepite niz računa, kodiran z BOLT11, za takojšnja plačila z bitcoini z minimalnimi provizijami.",
        "Ethereum (EIP-681): URI-ji zahtev transakcije Ethereum, ki podpirajo izvorne prenose ETH in prenose žetonov ERC-20. Vključuje ID verige za podporo več omrežij (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), plinske parametre in klice pogodbenih funkcij.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Storitve plačilnih povezav",
      bullets: [
        "PayPal.Me: PayPal plačilne povezave z uporabniškim imenom in izbirnim vnaprej izpolnjenim zneskom. Prejemniki lahko plačajo prek dobroimetja PayPal, kartic ali bančnih računov.",
        "Cash App: Cash App plačilne povezave z $cashtag z neobveznim zneskom. Priljubljeno v Združenih državah za plačila enakovrednim.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Generični EMV QR",
      bullets: [
        "EMV Generic: Ustvarite kode QR po meri EMV Merchant-Presented Mode za plačilne sheme, ki niso posebej navedene. Konfigurirajte ime trgovca, mesto, kodo države (ISO 3166-1), kodo valute (številka ISO 4217), MCC, možnosti napitnine/napitnine in dodatna podatkovna polja. Uporabno za testiranje ali integracije po meri.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: "Načini mešanja prekrivanja (profesionalno)",
      paragraphs: ["Dodatni načini mešanja na profesionalni ravni:"],
      bullets: [
        "Pixelate: pikseliziran učinek prekrivanja.",
        "Oris: prekrivanje zaznavanja robov, ki prikazuje samo konture.",
        "Valovanje: učinek valovitega popačenja.",
        "Velikost podpikslov: spremenljiva velikost podpikslov glede na sliko.",
        "True Dither: napredno drhtanje z urejeno izbiro matrike.",
        "Ekstremno: največja vidnost slike, lahko vpliva na možnost skeniranja.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Nastavitve zaščite",
      paragraphs: [
        "Natančen nadzor nad tem, kateri elementi QR so zaščiteni pred spreminjanjem prekrivanja:",
      ],
      bullets: [
        "Ohranite časovno razporeditev: časovne vzorce ohranite nespremenjene.",
        "Ohranite poravnavo: ohranite vzorce poravnave nespremenjene.",
        "Zaščiti podatke o formatu: Zaščiti informacijske module o formatu.",
        "Zaščitite informacije o različici: Zaščitite module informacij o različici.",
      ],
    },
    {
      heading: "ECC-Aware način",
      paragraphs: [
        "Inteligentno porazdeli intenzivnost prekrivanja glede na zmogljivost popravljanja napak. Sistem analizira, katere module je mogoče spreminjati, pri tem pa ohranja možnost pregledovanja.",
      ],
      bullets: [
        "Proračun tveganja: Odstotek zmogljivosti za odpravo napak, ki jo je treba uporabiti (0–100 %).",
        "Višji proračun = bolj vidno prekrivanje, vendar bolj tvegano pregledovanje.",
        "Nižji proračun = varnejše skeniranje, vendar manj vidno prekrivanje.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesionalne možnosti upodabljanja",
      paragraphs: ["Napredne kontrole upodabljanja:"],
      bullets: [
        "Ostri robovi: za ostre robove modulov uporabite slikovno upodabljanje s piksli.",
        "Pixel Snap: poravnava slikovnih pik na tla, okroglo ali strop.",
        "Barvni način na modul: enobarvno, po svetlosti, po položaju, po prekrivanju, po gruči.",
        "Barvna paleta: Določite barvno paleto po meri za barvanje po modulu.",
        "Contrast Guard: Zagotovite minimalno kontrastno razmerje med barvami.",
        "Najmanjše kontrastno razmerje: zahteva po kontrastu v slogu WCAG (1:1 do 21:1).",
        "Dodatni mejni moduli: dodatna meja onkraj mirnega območja.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#render",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesionalne izhodne možnosti",
      paragraphs: ["Nastavitve izvoza podjetja:"],
      bullets: [
        "DPI: Nastavite ločljivost tiskanja (72–600 DPI). 300 DPI priporočeno za tiskanje.",
        "Vključi tiho območje: preklopi tiho območje v izhodnih dimenzijah.",
        "Izvozi kot dodatno: Ustvarite PDF skupaj s primarno obliko.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#output",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Nastavitve animacije (profesionalno)",
      paragraphs: ["Dodatne funkcije profesionalne animacije:"],
      bullets: [
        "Časovno drhtanje: izklopljeno, modri šum ali varno drhtanje na sličico.",
        "Vzorec: brez, učinki pulza, valovanja, skeniranja, lesketanja ali odmika.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#animation",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: "API Reference",
      paragraphs: [
        "ANQR ponuja API na strani strežnika za generiranje kod QR prek parametrov URL. To je idealno za vdelavo kod QR v spletna mesta, e-pošto, dokumente ali avtomatizirane poteke dela brez JavaScripta na strani odjemalca.",
        "Osnovni URL: https://anqr.link/api/qr",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Oglejte si primere QR", type: "example" }],
    },
    {
      heading: "Osnovni parametri",
      paragraphs: ["Zahtevani in pogosti parametri (imena parametrov niso prevedena):"],
      bullets: [
        "podatki (obvezno): Vsebina za kodiranje v kodo QR. kodiranje posebnih znakov URL.",
        "velikost: velikost slike v slikovnih pikah (privzeto: 400, največ: 2000). Uporablja se, če w/h ni navedeno.",
        "w, h: izhodna širina in višina v slikovnih pikah. Preglasi parameter velikosti.",
        "format: izhodni format - png, webp ali gif (privzeto: png).",
        "ec: raven popravka napak - L, M, Q ali H (privzeto: H).",
        "fg: barva ospredja kot šestnajstiška brez # (privzeto: 000000).",
        "bg: barva ozadja kot šestnajstiška brez # (privzeto: ffffff).",
        "prosojno: nastavite na 1 za prosojno ozadje.",
        "rob: tiho območje v modulih (privzeto: 4).",
      ],
    },
    {
      heading: "Parametri oblikovanja",
      paragraphs: ["Oblikovanje modula in vzorca:"],
      bullets: [
        "slog: slog modula - kvadrat, zaokrožen, pike, romb, povezan.",
        "finder: Slog vzorca Finderja - kvadrat, zaokrožen, krog.",
        "align: slog vzorca poravnave - match_finder, kvadrat, zaokroženo, krog.",
        "časovni razpored: slog časovnega vzorca - match_module, polno, črtkano.",
        "polmer: odstotek radija kota 0-100.",
        "vrzel: odstotek vrzeli modula 0-50.",
        "gapMode: način vrzeli - brez, vložek, poteza, negativni_presledek.",
        "eyeOuter, eyeInner: slogi oči - kvadratne, zaobljene, okrogle.",
        "eyeScale: Odstotek očesne lestvice (privzeto: 100).",
        "gradient: vrsta gradienta - brez, linearni, radialni, stožčasti.",
        "gradAngle: Gradientni kot za linearne gradiente.",
        "gradStops: Gradient se ustavi kot color1,pos1,color2,pos2,... (npr. ff0000,0,0000ff,1).",
      ],
    },
    {
      heading: "Parametri prekrivanja",
      paragraphs: ["Možnosti prekrivne slike (prekrivna slika se pridobi s strani strežnika):"],
      bullets: [
        "img: URL do prekrivne slike (mora biti javno dostopen).",
        "način: način prekrivanja - sredina, polton, mešanje, svetlost, mozaik, mešanje, modri šum, podpiksel.",
        "intenzivnost: intenzivnost prekrivanja 0-100 (privzeto: 100).",
        "colorMode: barvni način prekrivanja - barva, sivine, čb.",
        "prileganje: kako se prekrivanje prilega - pokriva, vsebuje, razteza.",
        "rot: Vrtenje prekrivanja v stopinjah.",
        "flipX, flipY: Nastavite na 1, če želite obrniti prekrivanje.",
        "keepFinders: Ohrani vzorce iskalnika (privzeto: 1).",
        "keepTiming, keepAlign: Nastavite na 1, da ohranite vzorce časovne/poravnave.",
      ],
    },
    {
      heading: "Parametri predhodne obdelave",
      paragraphs: ["Predhodna obdelava slike, uporabljena za prekrivanje:"],
      bullets: [
        "svetlost: Prilagoditev -100 do 100 (privzeto: 0).",
        "kontrast: Prilagoditev -100 do 100 (privzeto: 0).",
        "gama: vrednost od 0,1 do 3 (privzeto: 1).",
        "nasičenost: Prilagoditev -100 do 100 (privzeto: 0).",
        "odtenek: rotacija odtenka v stopinjah.",
        "zameglitev: zameglitev v slikovnih pikah.",
        "izostritev: Količina ostrine 0-100.",
        "posteriziraj: posterizirajte ravni.",
        "prag: Binarni prag 0-255.",
        "edge: zaznavanje robov - izklopljeno, sobel, canny.",
        "invert: Nastavite na 1, če želite obrniti barve.",
      ],
    },
    {
      heading: "Parametri vodnega žiga",
      paragraphs: ["Dodajte vodne žige ustvarjenim kodam QR:"],
      bullets: [
        "wmEn: Nastavite na 1, da omogočite vodni žig.",
        "wmKind: vrsta vodnega žiga - besedilo, slika, vzorec.",
        "wmText: Besedilo vodnega žiga (kodirano v URL-ju).",
        "wmImg: URL do slike vodnega žiga.",
        "wmPos: Položaj - sredina, vogali, robovi, zadaj, tiho_območje.",
        "wmOpacity: Motnost 0-100 (privzeto: 50).",
        "wmBlend: način mešanja - normalno, množenje, zaslon, prekrivanje.",
      ],
    },
    {
      heading: "Parametri animacije",
      paragraphs: ["Za izhod animiranega GIF (zahteva format=gif):"],
      bullets: [
        "animPattern: Vzorec animacije - brez, impulz, val, skeniranje, lesketanje, premikanje, barvni_cikel.",
        "animFrames: število sličic 1–60 (privzeto: 24).",
        "animSpeed: Zakasnitev okvirja v milisekundah 10–1000 (privzeto: 100).",
        "animSeed: Naključno seme za animacijo.",
        "easing: Umirjanje animacije - linearno, ease_in, ease_out, ease_in_out, odboj.",
      ],
    },
    {
      heading: "Izhodni parametri",
      paragraphs: ["Možnosti izhodnega formata:"],
      bullets: [
        "kakovost: kakovost WebP 0-1 (privzeto: 0,9).",
        "webpQ: kakovost WebP 0-100 (privzeto: 90).",
        "gifColors: GIF paleta velikosti 2-256 (privzeto: 256).",
        "dpi: Izhodni DPI za PNG (privzeto: 72).",
        "metaTitle, metaAuthor, metaCopy, metaDesc: metapodatkovna polja PNG.",
      ],
    },
    // Crop Parameters
    {
      heading: "Parametri obrezovanja",
      paragraphs: ["Možnosti obrezovanja prekrivne slike:"],
      bullets: [
        "cropEn: Omogoči obrezovanje prekrivanja 0/1 (privzeto: 0).",
        "cropX: središče obrezovanja X kot frakcija 0-1 (privzeto: 0,5).",
        "cropY: Center za pridelke Y kot frakcija 0-1 (privzeto: 0,5).",
        "cropSize: velikost obreza kot del slike 0-1 (privzeto: 1).",
      ],
    },
    // Safety Lock Parameters
    {
      heading: "Parametri varnostne ključavnice",
      paragraphs: ["Nadzirajte, kateri elementi QR so zaščiteni pred spreminjanjem prekrivanja:"],
      bullets: [
        "lockF: Zakleni vzorce iskalnika 0/1 (privzeto: 1).",
        "lockT: Zakleni časovne vzorce 0/1 (privzeto: 1).",
        "lockA: Zakleni vzorce poravnave 0/1 (privzeto: 1).",
        "lockFmt: Zakleni informacije o formatu 0/1 (privzeto: 1).",
        "lockV: Zakleni informacije o različici 0/1 (privzeto: 1).",
        "safeMode: Varnostni način - izklopljen, uravnotežen, strog (privzeto: izklopljen).",
        "safeMinPx: Najmanjša velikost modula v slikovnih pikah (privzeto: 2).",
        "safeMinQz: Najmanjši moduli tihega območja (privzeto: 4).",
      ],
    },
    // Auto-tuning Parameters
    {
      heading: "Parametri samodejnega prilagajanja",
      paragraphs: ["Nastavitve samodejne optimizacije:"],
      bullets: [
        "autoVer: Samodejni izbor različice QR 0/1 (privzeto: 1).",
        "autoEcc: Samodejna izbira ravni ECC 0/1 (privzeto: 0) – samo namig na strani strežnika.",
        "autoReduce: [SAMO ZA ODJEMALCA] Samodejno zmanjša intenzivnost, dokler ni mogoče optično prebrati – zahteva preverjanje skeniranja v zanki.",
      ],
    },
    // Additional Animation Parameters
    {
      heading: "Dodatni parametri animacije",
      paragraphs: ["Razširjeni kontrolniki animacije za izpis GIF:"],
      bullets: [
        "zanka: animacija se neprekinjeno ponavlja 0/1 (privzeto: 1).",
        "odboj: smer animacije ping-ponga 0/1 (privzeto: 0).",
        "vzvratno: predvajanje animacije vzvratno 0/1 (privzeto: 0).",
        "colorCycle: Omogoči učinek barvnega cikla 0/1 (privzeto: 0).",
        "interp: interpolacija okvirja - brez, navzkrižno pojemanje, preoblikovanje (privzeto: brez).",
        "tempDither: začasno drhtanje - izklopljeno, blue_noise, flicker_safe (privzeto: izklopljeno).",
        "startF: začetni okvir animacije (privzeto: 0).",
        "maxF: največje število sličic za upodabljanje (privzeto: 0 = samodejno).",
        "stepF: interval korakov okvirja (privzeto: 1).",
        "tresenje: [SAMO ZA ODJEMALCA] Trepetanje modula v slikovnih pikah - zahteva regeneracijo QR na okvir.",
      ],
    },
    // Dithering Parameters
    {
      heading: "Parametri ditheringa",
      paragraphs: ["Nadzirajte algoritme drhtenja za obdelavo prekrivanja:"],
      bullets: [
        "ditherKind: Algoritem ditherja - error_diffusion, ordered_bayer, blue_noise itd. (privzeto: ordered_bayer).",
        "diffusionKernel: Jedro razširjanja napak - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (privzeto: floyd_steinberg).",
        "ditherStrength: Intenzivnost ditherja 0-100 (privzeto: 50).",
        "serpentine: serpentinasto drhtanje 0/1 (privzeto: 0).",
        "matrika: urejena matrika drhtanja - bayer2, bayer4, bayer8 (privzeto: bayer4).",
        "bnTile: velikost ploščice z modrim šumom (privzeto: 64).",
        "bnSeed: naključno seme modrega šuma (privzeto: 0).",
        "colorDither: mehčanje barv – brez, na_kanal, zaznavno (privzeto: brez).",
      ],
    },
    // Subpixel Parameters
    {
      heading: "Parametri podpikslov",
      paragraphs: ["Nastavitve za način mešanja podpikslov:"],
      bullets: [
        "spGrid: Velikost mreže podpikslov - 2x2, 3x3, 4x4 (privzeto: 3x3).",
        "spCenter: sredinsko pravilo - strogo, halftone_center (privzeto: strogo).",
        "spNeutral: šestnajstiški nevtralni barvi brez # (privzeto: 808080).",
        "spFinder: preglasitev iskalnika - polno, stilizirano (privzeto: polno).",
      ],
    },
    // Halftone Parameters
    {
      heading: "Parametri poltonov",
      paragraphs: ["Nastavitve za način mešanja poltonov:"],
      bullets: [
        "htCell: velikost poltonske celice - mreža na_modul ali nxn (privzeto: na_modul).",
        "htDot: oblika pike - krog, kvadrat, črta (privzeto: krog).",
        "htCurve: Krivulja svetlosti - linearna, s-krivulja, gama (privzeto: linearna).",
        "duo1: šestnajstiška barva sence dvojne barve brez # (privzeto: 000000).",
        "duo2: šestnajstiška barva dvotonskega poudarka brez # (privzeto: ffffff).",
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: "Parametri načina z upoštevanjem ECC",
      paragraphs: [
        "Inteligentna porazdelitev prekrivanja na podlagi zmogljivosti odpravljanja napak:",
      ],
      bullets: [
        "eccAware: Omogoči način z zavedanjem o ECC 0/1 (privzeto: 0).",
        "eccRisk: Odstotek proračuna tveganja 0–100 (privzeto: 50).",
        "eccMap: Zemljevid teže - distance_to_finders, block_heatmap, empirical_scan_heatmap (privzeto: distance_to_finders).",
      ],
    },
    // Frame Parameters
    {
      heading: "Parametri okvirja",
      paragraphs: ["Nastavitve okrasnega okvirja:"],
      bullets: [
        "okvir: slog okvirja - brez, zaobljeni_okvir, nalepka, oznaka (privzeto: brez).",
        "frameText: Besedilo za prikaz v okvirju (URL kodirano).",
      ],
    },
    // Per-Module Color Parameters
    {
      heading: "Barvni parametri na modul",
      paragraphs: ["Možnosti barvanja posameznih modulov:"],
      bullets: [
        "modColor: barvni način - polno, by_brightness, by_position, by_overlay, by_cluster (privzeto: solid).",
        "cGuard: Zaščita kontrasta 0/1 (privzeto: 0).",
        "minContrast: Najmanjše kontrastno razmerje 1–21 (privzeto: 4,5).",
        "paleta: šestnajstiške barve, ločene z vejicami, za paletni način.",
        "paletteMode: Porazdelitev palete - položaj, svetlost, diagonala, radialno, naključno, vrstica, stolpec (privzeto: položaj).",
      ],
    },
    // GIF Overlay Parameters
    {
      heading: "Parametri prekrivanja GIF",
      paragraphs: ["Nastavitve za animirane prekrivne slike GIF:"],
      bullets: [
        "ovType: Vrsta prekrivanja - statična, gif, apng, webp_anim, video (privzeto: statična).",
        "ovFramePick: Izbira okvirja - vse, vsak_n, max_frames, duration_limit (privzeto: vse).",
        "gifDelays: Uporabi originalne zakasnitve okvirjev GIF 0/1 (privzeto: 1).",
        "gifDispH: obravnavanje odlaganja GIF-ov - spoštovanje, poenostavitev (privzeto: spoštovanje).",
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: "Meje intenzivnosti po ECC",
      paragraphs: ["Največja intenzivnost prekrivanja na raven popravka napak:"],
      bullets: [
        "maxIntL: največja intenzivnost za ECC L 0–100 (privzeto: 100).",
        "maxIntM: največja intenzivnost za ECC M 0–100 (privzeto: 100).",
        "maxIntQ: največja intenzivnost za ECC Q 0–100 (privzeto: 100).",
        "maxIntH: največja intenzivnost za ECC H 0–100 (privzeto: 100).",
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: "Parametri simulacije QA (samo za odjemalca)",
      paragraphs: [
        "Ti parametri so razčlenjeni za združljivost URL-jev, vendar delujejo samo v brskalniku:",
      ],
      bullets: [
        "qaContrast: Omogoči preverjanje kontrasta 0/1 – zahteva interaktivno preverjanje.",
        "qaBlur: Simulirajte zameglitev v slikovnih pikah – samo za interaktivno testiranje.",
        "qaNoise: Simulacija ravni hrupa – samo za interaktivno testiranje.",
        "qaHeatmap: Prikaži toplotni zemljevid berljivosti 0/1 – zahteva uporabniški vmesnik s prekrivanjem platna.",
      ],
    },
    // Client-Only Parameters
    {
      heading: "Parametri samo za odjemalca",
      paragraphs: [
        "Večina parametrov API je v celoti podprtih na strani strežnika. Parametri z oznako [SAMO ZA ODJEMALCA] so razčlenjeni glede združljivosti URL-jev, vendar zahtevajo funkcije brskalnika:",
      ],
      bullets: [
        "tresenje: tresenje modula zahteva regeneracijo QR na okvir z naključnostjo.",
        "autoReduce: intenzivnost samodejnega zmanjšanja zahteva iterativno testiranje skeniranja.",
        "qaContrast, qaBlur, qaNoise, qaHeatmap: QA simulacija zahteva interaktivno validacijo platna.",
      ],
    },
    // Additional Output Parameters
    {
      heading: "Dodatni izhodni parametri",
      paragraphs: ["Razširjene nastavitve izpisa in izvoza:"],
      bullets: [
        "fname: Ime datoteke po meri za prenose (privzeto: anqr-qrcode).",
        "inclQz: vključi tiho območje v izhodne dimenzije 0/1 (privzeto: 1).",
        "bgOver: heksadecimalna preglasitev barve ozadja brez # (preglasi parameter bg).",
        "fmtExtra: dodatni izhodni format - brez, eps, animated_webp (privzeto: brez). Opomba: eps je [DELNO].",
        "svgPrec: natančnost oblike SVG - piksel, natančno (privzeto: piksel). [DELNO] Izhod SVG je omejen na strani strežnika.",
        "svgEmbed: Vdelaj rastrsko prekrivanje v SVG 0/1 (privzeto: 1). [DELNO] Izhod SVG je omejen na strani strežnika.",
        "modulePx: velikost slikovnih pik modula (privzeto: samodejno izračunano iz velikosti).",
        "meja: dodatni mejni moduli onkraj tihega območja (privzeto: 0).",
        "crisp: Omogoči upodabljanje ostre/pikselizirane slike 0/1 (privzeto: 1).",
        "snap: način snap slikovnih pik - tla, okroglo, strop (privzeto: tla).",
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: "Parametri ohranjanja vzorca",
      paragraphs: ["Nadzirajte, kateri strukturni elementi so zaščiteni pred prekrivanjem:"],
      bullets: [
        "keepFinders: Ohrani vzorce iskalnika 0/1 (privzeto: 1).",
        "keepTiming: Ohrani časovne vzorce 0/1 (privzeto: 0).",
        "keepAlign: Ohrani vzorce poravnave 0/1 (privzeto: 0).",
        "protectFmt: Zaščiti informacijske module oblike 0/1 (privzeto: 0).",
        "protectVer: Zaščiti informacijske module različice 0/1 (privzeto: 0).",
      ],
    },
    {
      heading: "Primer uporabe",
      paragraphs: [
        "Osnovna koda QR:",
        "https://anqr.link/api/qr?data=https://example.com",
        "Oblikovana koda QR z barvami po meri:",
        "https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30",
        "Koda QR s prekrivno sliko:",
        "https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70",
        "Animirani GIF:",
        "https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Oglejte si primere QR", type: "example" }],
    },
    {
      heading: "Vdelava QR kod",
      paragraphs: [
        "V profesionalnem načinu funkcija Share ustvari HTML in URL-je, ki jih je mogoče vdelati. Evo, kako deluje vdelava:",
      ],
      bullets: [
        "Povezava za skupno rabo: ustvari URL do aplikacije ANQR z vsemi vašimi nastavitvami, kodiranimi kot parametri URL. Prejemniki si lahko ogledajo in spremenijo kodo QR.",
        "Vdelaj sliko: ustvari oznako <img>, ki kaže na API strežnika. Koda QR je upodobljena na strani strežnika in služi kot slika.",
        "Vdelaj Markdown: ustvari sintakso slike Markdown za dokumentacijo in datoteke README.",
        "Neposredni URL API-ja: neobdelani URL API-ja za uporabo v aplikacijah, skriptih ali drugih integracijah.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Primer HTML",
      paragraphs: [
        "Če želite na svoje spletno mesto vdelati kodo QR:",
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        "Za odzivno velikost:",
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />',
        "Strežnik predpomni odgovore z dolgimi glavami predpomnilnika, zato so ponavljajoče se zahteve za isti URL hitre.",
      ],
    },
    {
      heading: "Delite obliko URL-ja",
      paragraphs: [
        "Ko kliknete Skupna raba v profesionalnem načinu, ANQR kodira vaše trenutne nastavitve v parametre URL. Format je:",
        "https://anqr.link/?data=...&ec=H&style=rounded&....",
        "Ti parametri zrcalijo parametre API-ja, tako da lahko pretvorite URL skupne rabe v URL API-ja, tako da spremenite osnovno pot iz / v /api/qr in po potrebi prilagodite parametre w/h.",
        "Opomba: prekrivnih slik, naloženih iz lokalnih datotek, ni mogoče dati v skupno rabo prek URL-ja – v skupnih povezavah in klicih API-ja delujejo samo prekrivni elementi, ki temeljijo na URL-ju (parameter img).",
      ],
    },
    {
      heading: "Omejitve stopnje in uporaba",
      paragraphs: [
        "API je brezplačen za uporabo v razumnih količinah. Za obsežno uporabo ali komercialne aplikacije, ki zahtevajo zajamčeno delovanje, se obrnite na nas.",
        "Odzivi API-ja vključujejo agresivne glave predpomnjenja. Za najboljšo učinkovitost predpomnite odgovore na svoji strani ali dosledno uporabite isti URL za enake kode QR.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: "Najboljše prakse",
      paragraphs: ["Sledite tem navodilom za zanesljive kode QR:"],
      bullets: [
        "Pred tiskanjem vedno preizkusite kode QR z več aplikacijami za optično branje.",
        "Pri dodajanju prekrivk uporabite popravek napak H (visoko).",
        "Ohranite vsaj 4 module tihega območja (margina).",
        "Zagotovite visok kontrast med ospredjem in ozadjem.",
        "Za tiskanje uporabite vsaj 300 DPI in preizkusite dejansko velikost tiskanja.",
        "Omogoči ohranitev vzorcev iskalnika pri uporabi prekrivk.",
        "Začnite z nižjo intenzivnostjo prekrivanja in postopoma povečujte.",
        "Za zunanjo uporabo razmislite o večjih velikostih modulov in večjem popravku napak.",
      ],
      links: [
        { href: "/learn?lang=${lang}", label: "Brskajte po člankih Learn", type: "learn" },
        { href: "/examples?lang=${lang}", label: "Oglejte si primere QR", type: "example" },
      ],
    },
    {
      heading: "Odpravljanje težav",
      paragraphs: ["Pogoste težave in rešitve:"],
      bullets: [
        "QR ne skenira: Zmanjšajte intenzivnost prekrivanja, povečajte popravljanje napak, preverite kontrast.",
        "Koda je prevelika: skrajšajte dolžino vsebine, uporabite skrajšavo URL-jev, nižjo različico.",
        "Zamegljen izpis: povečajte velikost modula, uporabite PNG namesto stisnjenih formatov.",
        "Barve izgledajo napačno: preverite barvni kontrast, poskusite način prekrivanja v sivinah.",
        "GIF ni animiran: Zagotovite, da uporabljate izhodni format GIF, preverite število sličic.",
        "Prekrivna slika se ne nalaga: preverite dovoljenja CORS za oddaljene slike.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Oglejte si povezane vodnike in primere",
          type: "learn",
        },
      ],
    },
    {
      heading: "Bližnjice na tipkovnici",
      paragraphs: [
        "ANQR podpira standardne bližnjice na tipkovnici. Uporabite Ctrl/Cmd+S, da sprožite izvoz (ko je fokus na predogledu).",
      ],
    },
    {
      heading: "Skupna raba in vdelava",
      paragraphs: [
        "V profesionalnem načinu kliknite gumb Skupna raba, da kopirate URL s trenutnimi nastavitvami. Prejemniki lahko odprejo ta URL in si ogledajo vašo natančno konfiguracijo. Opomba: prekrivnih slik iz lokalnih datotek ni mogoče deliti prek URL-ja.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Poskusite to konfiguracijo neposredno v generatorju ANQR.",
          type: "generator",
        },
      ],
    },
  ],
  relatedLinks: [
    { href: "/learn?lang=${lang}", label: "Brskajte po člankih Learn", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Oglejte si primere QR", type: "example" },
    { href: "/gallery?lang=${lang}", label: "Oglejte si primere QR", type: "gallery" },
    { href: "/?lang=${lang}", label: "Odprite generator", type: "generator" },
  ],
};

export default guide;
