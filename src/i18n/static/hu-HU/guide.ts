import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR felhasználói útmutató',
  description: 'Teljes útmutató az ANQR-hez QR kódok létrehozásához.',
  lastUpdated: '2026. február 1',
  breadcrumb: ['Útmutató'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Nyisd ki a generátort', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Böngészés Tanulj cikkeket', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR példák megtekintése', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Kezdődik',
      paragraphs: [
        'Az ANQR egy QR-kód generátor, ügyfél-első megközelítéssel. Alapértelmezés szerint a QR-kódok helyileg generálódnak a böngészőben – nincs szükség fiókra, és adatai privátak maradnak. Professzionális beágyazáshoz használhatja a szerveroldali API-t is.',
        'Az interfész három interfész szinten: Basic, Advanced, és Professional. Válassza ki a szintet a fülek a fejléc. Minden szint további funkciókat nyit meg, miközben az interfész arra összpontosít, amire szüksége van.',
      ],
      bullets: [
        'Alap: Egyszerű QR-kód létrehozása egyszerű szöveges / URL tartalommal és képátlóval.',
        'Advanced: QR kódolási opciók, rendering stílusok, animáció, kimeneti formátumok, kiterjesztett tartalomtípusok, és overlay testreszabás.',
        'Professzionális: Vízjelek, metaadatok, megosztás, biztonsági elemzés, fizetési QR-kódok és vállalati funkciók.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Nyisd ki a generátort', type: 'generator' }],
    },
    {
      heading: 'Gyors indítás',
      paragraphs: ['Az első QR kód létrehozásához:'],
      bullets: [
        '1. Válasszon ki egy tartalomtípust (URL, szöveg, WiFi stb.) a Content Type dropdown-ból.',
        '2. Adja meg adatait a megadott mezőkben.',
        '3. Opcionálisan testreszabható színek, stílusok, és adjunk hozzá egy overlay képet.',
        '4. Kattintson Export letöltéséhez QR kód PNG, GIF, WebP, vagy SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Alapvető jellemzők',
      paragraphs: [
        'Az alapszint egyszerűsített interfészt biztosít QR-kódok létrehozásához a hasznos teher tartalmával és a képfelülettel. Ez a legegyszerűbb módja a kezdésnek.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tartalomtípusok (alapvető)',
      paragraphs: [
        'Sima szöveg: bármilyen szöveget kódol a QR-kód kapacitáshatáráig. Ideális rövid üzenetek, kódok vagy azonosítók.',
        'URL: Webcímek kódolása. A QR-kód beolvasáskor megnyitja az URL-t. Támogatja a http:// és https:// protokollokat.',
      ],
    },
    {
      heading: 'Image Overlay (Alap)',
      paragraphs: [
        'Töltsön fel egy képet (JPG, PNG, GIF, WebP) QR kódjával. Alapvető átfedési jellemzők:',
      ],
      bullets: [
        'Feltöltés fájlból: Válasszon ki egy képet eszközéről.',
        'URL-ből betöltve: Adja meg a kép URL-jét (lehetővé kell tennie a CORS használatát).',
        'Center Logo: Helyek kép a központban, a hiba korrekcióra támaszkodva.',
        'Keverés: Egyszerű alfa keverése kép QR minta.',
        'Intenzitás: Ellenőrzi, hogy az átfedés milyen erősen befolyásolja a QR-kódot (0- 100%).',
        'Színmód: teljes szín, szürkeárnyalat vagy fekete és fehér.',
        'A keresési minták megőrzése: Változatlanul tartja a sarkakat a megbízható szkenneléshez.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Speciális jellemzők',
      paragraphs: [
        'A fejlett szintű QR kódolási opciók, megjelenítési stílusok, animáció, kimeneti formátumok, bővített tartalomtípusok és fejlett overlay testreszabás.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR kódolási beállítások',
      paragraphs: [
        'Verzió: QR kódok jönnek verziók 1-40, magasabb verziók több adatot, de nagyobb. Állítsa be 0-ra (Auto), hogy az ANQR válassza ki a legkisebb verziót, amely megfelel a tartalomnak.',
        'Hiba korrekciója: Meghatározza, hogy egy QR-kód mennyi kárt képes fenntartani, miközben a kibontható.',
      ],
      bullets: [
        'L (alacsony): 7% -os hiba korrekció - legkisebb méret, legkisebb redundancia.',
        'M (Közepes): 15% -os hibajavítás - kiegyensúlyozott opció.',
        'Q (Quartile): 25% -os hibajavítás - jó a nyomtatott kódokhoz.',
        'H (Magas): 30% -os hibajavítás - a legjobb az overset vagy durva körülmények között.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Csendes övezet (Margin)',
      paragraphs: [
        'A csendes zóna a fehér tér a QR kód körül. A szkennereknek szükségük van erre a sávra, hogy megállapítsák, hol kezdődik a kód. A szabvány legalább 4 modult javasol. Csökkentése 4 okozhat szkennelési problémák.',
      ],
    },
    {
      heading: 'Modulstílus',
      paragraphs: [
        'Modulok az egyes négyzetek, amelyek alkotják a QR kódot. Az ANQR öt stílust kínál:',
      ],
      bullets: [
        'Négyzet: Klasszikus QR megjelenés éles sarkokkal.',
        'Kerekített: Puha sarkok egy barátságosabb megjelenéshez.',
        'Dots: körkörös modulok egy modern esztétikai.',
        'Diamond: 45 ° forgatott négyzetek egy jellegzetes minta.',
        'Csatlakozott: A modulok összeolvadnak, amikor egymás mellett vannak, és szerves formákat alkotnak.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kereső minta stílus',
      paragraphs: [
        'A keresési minták a három nagy négyzetek QR sarkokban, amelyek segítenek a szkennereknek tájékozódni a kódról. Elérhető stílusok:',
      ],
      bullets: [
        'Négyzet: Standard szögletes sarkok.',
        'Kerekített: Puha sarkok egyező lekerekített modul stílus.',
        'Kör: Kerekes kereső minták dot- style kódok.',
      ],
    },
    {
      heading: 'Beigazítási és időzítési minták',
      paragraphs: [
        'Igazítási minták jelennek meg nagyobb QR kódok (verzió 2 +), hogy segítsen korrigálni torzulás. Az időzítési minták azok a váltakozó vonalak, amelyek a keresési mintákat kötik össze.',
      ],
      bullets: [
        'Aligment stílus: Match Finder, Square, Rounded, vagy Circle.',
        'Időzítő stílus: Match Modul, Solid, vagy Dashed.',
      ],
    },
    {
      heading: 'Színek',
      paragraphs: [
        'Előrejelzés: A QR modulok színe. Fekete (# 000000) szabványos, de minden sötét szín működik.',
        'Háttér: A háttérszín. A fehér (# ffffff) standard. Megfelelő kontraszt biztosítása az előtérrel.',
        'Átlátható háttér: Távolítsa el a háttér teljesen a színes felületek. Győződjön meg róla, hogy a felület megfelelő kontraszt.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'A modul mérete és Gap',
      paragraphs: [
        'Modul mérete: Azt szabályozza, hogy az egyes modulok milyen nagyságúak legyenek pixelben. A nagyobb értékek nagyobb, könnyebben beolvasható kódokat hoznak létre.',
        'Gap modul: A modulok közötti tér növelése százalékban. A kis hiányosságok (5-15%) bizonyos körülmények között javíthatják a szóródást, de a túlzott hiányosságok csökkentik a megbízhatóságot.',
      ],
    },
    {
      heading: 'Kimeneti beállítások',
      paragraphs: ['Formátum: Válassza ki az export formátumát a használati eset alapján.'],
      bullets: [
        'PNG: Lossless raster formátum, ideális a legtöbb használatra. A legjobb nyomtatás és digitális.',
        'WebP: Modern formátum kisebb fájlmérettel. Jó webes használatra.',
        'GIF: A QR animációs kódokhoz szükséges. Támogatja az átláthatóságot.',
        'SVG: Vector formátum, hogy pikkelyesen. A legjobb nagy nyomtatás, vagy amikor meg kell szerkeszteni a kódot.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Kimeneti méretek',
      paragraphs: [
        'Szélesség / magasság: Állítsa be a kimeneti méretet pixelben. A nyomtatáshoz a DPI alapján kell kiszámítani (pl. 300 dpi 1 hüvelyk = 300px). A nagyobb méretek megbízhatóbb távolságban.',
      ],
    },
    {
      heading: 'Animációs beállítások (Speciális)',
      paragraphs: ['Kontroll animációs QR kód viselkedés:'],
      bullets: [
        'Sebesség: Animációs keret sebessége milliszekundumban.',
        'Loop: Folyamatos vagy egyetlen-play animáció.',
        'Ugrás: Ping- pong animációs irány.',
        'Frame indítása: Az animáció megkezdése meghatározott keretből.',
        'Max Frames: Az összes képkockát az animációban korlátozza.',
        'Frame Step: A gyorsabb animáció kimaradása.',
        'Interpoláció: Nincs, Crossfade, vagy Morph a keretek között.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tartalomtípusok (Speciális)',
      paragraphs: ['A fejlett szint további hasznos teher formátumokat szabadít fel:'],
      bullets: [
        'Telefonszám (tel:): Hívható telefonkapcsolatot hoz létre.',
        'E-mail (mailto:): Megnyitja az e-mail kliens opcionális téma és test.',
        'SMS: Előre töltött SMS egy telefonszámra.',
        'vCard: Teljes név-, szervezési, telefon-, e-mail, cím.',
        'MeCard: Kompakt kapcsolat formátum népszerű Japánban.',
        'BizCard: Legacy névjegykártya formátum.',
        'Geo Location: GPS koordináták, amik a térképen nyílnak.',
        'WiFi: Hálózati adatok automatikus kapcsolathoz (SSID, jelszó, biztonsági típus).',
        'Naptáresemény: iCalendar formátum cím, hely, dátum / idő.',
        'Esemény RSVP: Link az esemény regisztráció oldalon.',
        'Naptárfeliratkozás: Előiratkozás egy ICS / WebCal feed.',
        'Fájl / dokumentum URL: Közvetlen link letölthető fájlokhoz.',
        'Cloud Storage Link: A Google Drive, Dropbox, OneDrive stb. linkjei.',
        'Szociális profil: Linkek linkedIn, Twitter, Instagram, stb.',
        'Messaging Link: WhatsApp, Telegram, Signal mély linkek.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Speciális átfedési jellemzők',
      paragraphs: ['További átfedési képességek:'],
      bullets: [
        'Crop: A vetés engedélyezése a kép egy négyzetének kiválasztásához.',
        'Halftone: Classic print- style pont minta alapján kép fényerő.',
        'Deved: Error- diffúzió diverging részletes reprodukció.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overlay Blend Modes (Speciális)',
      paragraphs: ['Kiegészítő keverési módok fejlett szinten:'],
      bullets: [
        'Subpixel: Minden modult szubpixelekre osztja nagyobb részletességgel.',
        'Kék zaj: Használja a kék zaj mélyedés művészi-mentes minták.',
        'Mozaik: Tile- alapú hatás a képszerkezet megőrzése.',
        'Gap kitöltése: Képek elhelyezése a modulok közötti hézagokban.',
        'Fényerő: A kép fényességén alapuló variációs modul mérete.',
        'Duotone: Feltérképezi a képet két színre a kontraszthoz.',
      ],
    },
    {
      heading: 'Overlay intenzitás',
      paragraphs: [
        'Ellenőrzi, hogy az átfedés milyen erősen befolyásolja a QR-kódot (0- 100%). A magasabb értékek több képrészletet mutatnak, de csökkenthetik a scannabilitást. Kezdje körülbelül 70%, és kiigazítani alapján vizsgálatok.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Színmód',
      paragraphs: ['Az átfedési kép feldolgozása:'],
      bullets: [
        'Teljes szín: Eredeti képszínekkel rendelkezik.',
        'Grayscale: Átalakítja a fekete-fehér tónusok.',
        'Fekete és fehér: Nagy kontraszt bináris konverzió.',
      ],
    },
    {
      heading: 'A keresési minták megőrzése',
      paragraphs: [
        'Ha be van jelölve, a három sarokkereső mintázatot a borítás nem módosítja. Szigorúan ajánlott a megbízható szkenneléshez.',
      ],
    },
    {
      heading: 'Képelőfeldolgozás',
      paragraphs: [
        'Az elegyítés előtt használja a szűrőket az overlay képre. Ezek a módosítások javíthatják a kép megjelenését a végleges QR-kódban.',
      ],
      bullets: [
        'Fényerő (-100 - + 100): Világítsa meg vagy sötétítse el a képet.',
        'Kontraszt (-100 - + 100): Tonális tartomány növelése vagy csökkentése.',
        'Gamma (0,2-3,0): Nem lineáris fényerő beállítás. Az értékek 1-nél könnyebbek, a középhangok 1-nél sötétebbek.',
        'Telítettség (-100 - + 100): Színintenzitás. - 100 a szürkeárnyalat, + 100 a telített.',
        'Hue rotate (0- 360 °): Mozgassa az összes színt a színes kerék körül.',
        'Homály (0- 20px): Puhítsd le a kép részleteit.',
        'Éles (0- 100%): Fokozza szélek és részletek.',
        'Posterize (0- 16 szint): Csökkentse a színszint egy plakát hatás.',
        'Küszöbérték (0- 255): Átalakítás bináris fekete / fehér pontokra.',
        'Edge Detection: Sobel vagy Canny algoritmusok csak a széleket.',
        'Fordítás: fordított minden szín.',
      ],
    },
    {
      heading: 'Fit mód',
      paragraphs: ['Hogyan illeszkedik az overlay kép a QR kódterület:'],
      bullets: [
        'Fedél: A kép kitölti az egész területet, ha szükséges.',
        'Tartály: Az egész kép látható, lehetnek szélei.',
        'Stretch: A kép torzítja, hogy töltse ki pontosan.',
      ],
    },
    {
      heading: 'Átalakítási beállítások',
      paragraphs: [
        'Forgatás: Forgatási átfedés 90 ° -os lépésekben.',
        'Flip X / Y: Tükrözés a kép vízszintesen vagy függőlegesen.',
      ],
    },
    {
      heading: 'Algoritmusok',
      paragraphs: [
        'Dishering átalakítja a folyamatos hang képek minták QR kódok képviseli. Elérhető, ha Devered, Blue Noise, vagy True Dither keverési módok.',
      ],
      bullets: [
        'Hiba diffúzió: Classic Floyd- Steinberg stílus. Terjesztési hiba a szomszédos pixelekben.',
        'Rendelése (Bayer): Egy küszöbmátrixot használ a szabályos mintákhoz.',
        'Clustered Dot: Szimulálja a féltonnás nyomtatást.',
        'Void & Cluster: Optimalizált sorrend.',
        'Kék zaj: Visually kellemes véletlenszerűen kinéző minta.',
        'Kék zaj Küszöbérték: Küszöbmélység kék zaj textúrával.',
        'White Noise: Random küszöb mélyedés.',
        'Gaussian / háromszög Zaj: Különböző eloszlású zaj.',
        'Blue Noise + Error Diffusion: Hibrid kombinálja mindkét technikát.',
        'Szűrt kék zaj: képernyőszerű kék zaj minta.',
        'Perceptual: Luminance-súlyozott jobb vizuális eredmények.',
        'Edge- Aware: Megőrzi a képéleket a mélyedéskor.',
        'Adaptív küszöbérték: Helyi adaptív cséplés.',
        'Időszakos kék zaj: Az animációs GIF-ek esetében a minta képenként változik.',
      ],
    },
    {
      heading: 'Diffusio kernels',
      paragraphs: ['Hiba eltérítésekor válassza ki a hiba eloszlásának módját:'],
      bullets: [
        'Floyd- Steinberg: klasszikus 4-szomszéd diffúzió. Jó választás.',
        'Jarvis- Judge - Ninke: 12-szomszéd, simábban, de lassabban.',
        'Stucki: Hasonló a JJN különböző súlyok.',
        'Burkes: Egyszerűsített JJN, gyorsabb.',
        'Sierra: A magok családja kiegyensúlyozza a minőséget és a sebességet.',
        'Atkinson: Fény diffúzió, megőrzi a részleteket, de lehet szemcsés.',
      ],
    },
    {
      heading: 'Dither Strength',
      paragraphs: [
        'Ellenőrzi, hogy mennyi merülést (0- 100%) alkalmaznak. Az alacsonyabb értékek az eredeti minta nagyobb részét őrzik meg, a magasabb értékek több képrészletet mutatnak.',
      ],
    },
    {
      heading: 'Subpixel beállítások',
      paragraphs: ['Subpixel keverési mód használata esetén:'],
      bullets: [
        'Rács mérete: 2 × 2, 3 × 3 vagy 4 × 4 alpixel modulonként. Magasabb = részletesebb.',
        'Középső szabály: Strict igényel center subpixel illeszkedni modul. A Halftone Center lehetővé teszi a variációt.',
        'Semleges szín: meghatározatlan részpixeleknél használt szín.',
        'Finder Override: A keresési minták megjelenésének módja (Szilárd vagy Stilizált).',
      ],
    },
    {
      heading: 'Halfton- beállítások',
      paragraphs: ['Halftone keverési mód használata esetén:'],
      bullets: [
        'A cella mérete: modulonként vagy N × N rácsonként.',
        'Dot Shape: kör, négyzet, vagy vonal.',
        'Fényerő görbe: lineáris, S- görbület, vagy Gamma.',
      ],
    },
    {
      heading: 'Duotone színek',
      paragraphs: [
        'A Duotone keverési mód használatakor állítsa be az árnyék színét (sötét területek) és a megvilágított színt (világos területek).',
      ],
    },
    {
      heading: 'GIF animációs beállítások',
      paragraphs: ['Az animált GIF overlays használata esetén:'],
      bullets: [
        'Használja a Frame Delays: tiszteletben tartása eredeti GIF időzítés.',
        'Max. FPS: A keret határértéke (1-60 fps).',
        'Ártalmatlanítás kezelése: A keret ártalmatlanítási módszereinek betartása vagy egyszerűsítése.',
      ],
    },
    {
      heading: 'Speciális Renderelési beállítások',
      paragraphs: ['További leeresztő kezelőszervek:'],
      bullets: [
        'Gap Mode: Nincs, Inset, Stroke, vagy negatív űrrés stílus.',
        'Corner Radius: Kerekített sarkok százalék modulok.',
        'Gradiens: Nincs, Linear, Radial, vagy kúpos gradiens modulokon.',
        'Eye Outer / Belső stílus: Független stílus a kereső minta gyűrűk.',
        'Dot Rotation: Forgatás gyémánt / pont modulok.',
        'Szemméret: Méretbeállítás a keresési mintákhoz.',
        'Keret stílus: Dekorációs keretek hozzáadása (Kerekített keret, Sticker, Tag).',
        'Szöveg: Szöveg hozzáadása, mint a "Scan Me!" keretekhez.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Speciális QR kódolás',
      paragraphs: ['Fine- tun QR kódolás:'],
      bullets: [
        'Kódolási mód: Auto, Numerikus, Alfanumerikus, Byte / UTF- 8 vagy Kanji.',
        'Enforce Min Csendes Zóna: Biztosítani legalább 4 modulárrés.',
        'Maszk minta: Auto (optimális), vagy kézzel válassza ki a mintákat 0-7 a vezérlő modul eloszlás. A különböző minták különböző vizuális megjelenéseket eredményeznek, miközben ugyanazokat az adatokat kódolják.',
        'Karakter kódolás: ISO- 8859-1 (latin- alapértelmezés), UTF- 8 (teljes Unicode, emoji is) vagy Shift- JIS (japán). Válasszon a tartalom karakterigénye alapján.',
      ],
    },
    {
      heading: 'Speciális kimeneti beállítások',
      paragraphs: ['További exportbeállítások:'],
      bullets: [
        'Fájlnév: Letöltések egyedi fájlneve.',
        'GIF Palette mérete: 2-256 színek GIF kimenetben.',
        'GIF Mennyiség: Medián vágás, NeuQuant, vagy Octree színcsökkenés.',
        'GIF Dithering: Off, Floyd- Steinberg, or Ordered.',
        'GIF Átlátszó szín: Állítson be egy színt, hogy átlátszó legyen.',
        'SVG Igaz vektor: Útvonalakat használj a beágyazott raszter helyett.',
        'SVG Shape Precision: Pixel vagy Precise path rendering.',
        'SVG Raster Overlay beágyazva: Az overlay beágyazva.',
        'Háttér Felülírás: A kimenet egy adott háttérszínét kell beállítani.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Hitelesítési lehetőségek',
      paragraphs: ['Bemeneti feldolgozási beállítások:'],
      bullets: [
        'A bemenet validálása: A kódolás előtt ellenőrizze a tartalom formátumát.',
        'Vágás Whitespace: Távolítsa el a vezető / záró terek.',
        'A Newlines normalizálása: Átalakít minden sor végén LF.',
        'Max. hossz Guard: Figyelmeztetés, ha a tartalom meghaladja a QR kapacitást.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Szakmai jellemzők',
      paragraphs: [
        'A szakmai szint hozzáad vízjeleket, metaadatokat, megosztási lehetőségek, biztonsági elemzés, fizetési QR kódok, és a vállalati funkciók.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vízjel',
      paragraphs: ['Vízjelek hozzáadása a QR kódokhoz:'],
      bullets: [
        'Szöveg, kép vagy minta vízjel.',
        'Beosztás: Középső, Sarkok, Edges, Mögötte, vagy Csendes Zóna.',
        'Átláthatóság: A vízjel átláthatósága (0- 100%).',
        'Keverési mód: normál, többrétegű, képernyős vagy overlay keverés.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metaadatok',
      paragraphs: ['A metaadatok beágyazása az exportált fájlokba:'],
      bullets: [
        'Cím, Szerző, Szerzői jog, licenc, Leírás mezők.',
        'Létrehozási idő: beágyazott generáció időbélyegző.',
        'Egyéni Key- érték: Önkényes metaadatpárok hozzáadása.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Megosztás',
      paragraphs: ['A QR-kód konfigurációinak megosztása:'],
      bullets: [
        'Közvetlen kapcsolat: egy megosztható URL létrehozása az aktuális beállításokkal.',
        'Beágyazott HTML: Beágyazott kód weboldalak.',
        'A paraméterek kódolása: A megosztási URL összes beállítását tartalmazza.',
        'Megjegyzés: A helyi fájlokból származó képek nem oszthatók meg URL-en keresztül.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Biztonsági elemzés',
      paragraphs: ['Győződjön meg arról, hogy a QR-kódok továbbra is beolvashatók maradnak:'],
      bullets: [
        'Biztonsági mód: kikapcsolt, kiegyenlített vagy szigorú letapogatási követelmények.',
        'Min modul Méret: Minimális pixel méret modulonként.',
        'Min Csendes Övezet: Minimális letéti modulok.',
        'Lock Finders / Timing / Align / Format / Version: Protect specific elems.',
        'Max. átfedési intenzitás ECC-vel: hibajavítási szinten alapuló automatikus intenzitási határértékek.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tartalomtípusok (professzionális)',
      paragraphs: ['Professzionális szinten hozzáad fizetési és vállalati tartalomtípusok:'],
      bullets: [
        'EPC / SEPA (EU): európai banki átutalási QR-kódok IBAN, BIC, összeg, hivatkozás.',
        'UPI (India): Egységes fizetési interfész VPA-val, a kedvezményezett neve, összege.',
        'PayNow (Szingapúr): Szingapúr gyors fizetés UEN vagy mobilszám.',
        'PromptPay (Thaiföld): Thai nemzeti fizetési rendszer.',
        'PIX (Brazília): Brazil azonnali fizetés PIX kulccsal.',
        'Crypto: Bitcoin, Ethereum, Litecoin fizetési címek opcionális összeg.',
        'Marketing kampány link: URLs teljes UTM paraméter (Marketing Címkék) követés.',
        'Rövid link: A dinamikus / követhető QR-kódokhoz URL rövidítővel használható.',
        'GS1 Digitális Link: Termék azonosító GTIN, sorozat, tétel, lejárat.',
        'App Deep Link: iOS / Android app mély kapcsolatok egyedi rendszerek.',
        'Egyedi formátum: nyers adatok formázás vagy validálás nélkül.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Language- vonatkozó kifizetések fejlett módban',
      paragraphs: [
        'Advanced mode használatakor az ANQR automatikusan megmutatja a kiválasztott nyelvre vonatkozó fizetési módszereket. A vietnami felhasználók például a VietQR-t, a thaiföldi felhasználók a PromptPay-t, az indiai nyelvhasználók pedig a UPI-t és a BharatQR-t látják. Globális fizetési módszerek (cryptocurrency, PayPal, Cash App) állnak rendelkezésre minden nyelven. Professional mode nyitja meg az összes fizetési előírásokat, függetlenül a nyelv.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Európai fizetési szabványok',
      bullets: [
        'EPC / SEPA (EU): Európai banki átutalási QR-kódok az EPC QR-szabályzat szerint. Támogatja az IBAN-t, a BIC-t (nem kötelező belföldi), az összeget EUR-ban, valamint a strukturált vagy strukturálatlan fizetési hivatkozásokat. A SEPA-övezetben, beleértve az uniós országokat, valamint Svájcot, Norvégiát, Izlandot, Liechtensteint, Monacót és San Marinót.',
        'Svájci QR-számla: svájci fizetési szabvány a SIX végrehajtási iránymutatásait követve. Támogatja a CHF-et és az EUR, QR- Reference (QRR), a Creditor Reference (ISO 11649), a strukturált hitelező / adós címeket és a számlainformációkat. A svájci számlákhoz 2022 óta szükséges.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indiai fizetési előírások',
      bullets: [
        'UPI (India): Egyesített fizetési interfész az NPCI mély kapcsolódási specifikációját követően. Támogatja a VPA-t (Virtuális fizetési cím), a kedvezményezett nevét, az INR-ben szereplő összeget, a tranzakciós jegyzetet, a referencia-azonosítót, a kereskedelmi kategória kódját és a tranzakciós módot.',
        'BharatQR (India): Egységes QR-szabvány az UPI és a kártyaalapú kifizetések támogatására. A maximális kompatibilitás érdekében az UPI VPA-t kártya PAN-nal kombinálja. Tartalmazza a kereskedő nevét, város, MCC, GST részleteket, és a számla / hivatkozási számokat.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Délkelet-ázsiai fizetési előírások',
      bullets: [
        'PayNow (Szingapúr): Szingapúr gyors fizetési rendszer EMVCo QR specifikációval SGQR profillal. Támogatja az UEN-t (cégbejegyzés), a mobilszámot vagy az NRIC-t mint proxyazonosítót. Tartalmazza az esedékesség összegét és a lejárati dátumot.',
        'PromptPay (Thaiföld): Thaiföldi nemzeti fizetési rendszer, amely a Bank of Thailand EMV profilját követi. Támogatja a mobilszámot, nemzeti azonosítót, adóazonosítót, e-pénztárca azonosítót és számlafizetést több hivatkozási mezővel.',
        'QRIS (Indonézia): Quick Response Code Indonéz szabvány. EMV-alapú nemzeti fizetési szabvány a kereskedelmi azonosító, NMID (National Merchant ID), kereskedelmi kritériumok osztályozása és kényelmi díjak (rögzített vagy százalékos) támogatására.',
        'DuitNow (Malajzia): Malaysia instant payment system. Támogatja a több proxy típusok, beleértve az NRIC, mobil, útlevél, hadsereg azonosító, és cégnyilvántartási számok.',
        'VietQR (Vietnam): Vietnami bankközi átutalási szabvány. Banki BIN (NAPAS azonosító) és számlaszám szükséges. Támogatja a különböző átviteli típusok (QRPUSH, QRIBFTTA, QRIBFTTC) több szolgáltatási kódját.',
        'QR Ph (Fülöp-szigetek): Fülöp-szigeteki QR fizetési szabvány az InstaPay és a PESONet számára. Kereskedőazonosítóval ellátott számlaszámokat használ a P2M (személyek és kereskedők közötti) tranzakciókhoz.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kelet-ázsiai fizetési előírások',
      bullets: [
        'TWQR (Tajvan): tajvani QR fizetési szabvány. Támogatja a kereskedelmi azonosító, az adóazonosító és a TWD összegeket.',
        'HKQR / FPS (Hong Kong): Hong Kong gyorsabb fizetési rendszer QR kódok. Támogatja az FPS ID-t, a mobilszámot vagy az e-mailt fizetési azonosítóként. A HKD-ben lévő összegek.',
        'JPQR (Japán): Japán egységes QR-kód fizetési szabvány. Felhasználja a kereskedelmi azonosító JPY mennyiségben.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Egyéb regionális fizetési előírások',
      bullets: [
        'PIX (Brazília): Brazil Központi Bank azonnali fizetési rendszer a BR kódspecifikáció alapján. Támogatja a PIX billentyűket (CPF, CNPJ, e-mail, telefon vagy véletlenszerű kulcs), a kereskedelmi nevet / várost, a tranzakciós azonosítót és a BRL összegeket.',
        'AusPayNet / NPP Fizetésazonosító (Ausztrália): Australian New Pays Platform PayID rendszer. Támogatja a fizetést Személyazonosító típusok (e-mail, mobil, ABN, szervezet azonosító) vagy hagyományos BSB + számlaszám. A kereskedelmi név opcionális, mivel a fizetők az NPP által regisztrált nevet látják.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kriptovalutafizetés',
      bullets: [
        'Bitcoin / Litecoin (BIP-21): Standard cryptocurrency payment URI-k pénztárcacímmel, opcionális összeggel és címkével. Kompatibilis minden nagyobb Bitcoin és Litecoin pénztárcák.',
        'Villám Hálózat (BOLT11): Lightning Network fizetési számlák. A Bitcoin azonnali kifizetéseire vonatkozó, kódolt BOLT11-es számla-string beillesztése minimális díjakkal.',
        'Ethereum (EIP- 681): Ethereum tranzakció iránti kérelem URI-k támogatása anyanyelvi ETH transzferek és ERC- 20 zseton transzferek. Magában foglalja a többhálózati támogatás láncazonosítóját (Mainnet, Polygon, BSC, Arbitrum, Optimizmus, Avalanche), a gázparamétereket és a szerződéses funkciók hívásait.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Fizetési kapcsolati szolgáltatások',
      bullets: [
        'PayPal.Me: PayPal fizetési kapcsolatok felhasználónévvel és opcionális előre töltött összeggel. A kedvezményezettek PayPal egyenlegen, kártyán vagy bankszámlán keresztül fizethetnek.',
        'Cash App: Cash App fizetési linkek segítségével $cashtag opcionális összeget. Népszerű az Egyesült Államokban a peerto-peer kifizetések.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Általános EMV QR',
      bullets: [
        'EMV Generikus: Egyedi EMV kereskedelmi mód létrehozása A kifejezetten fel nem sorolt fizetési rendszerek QR-kódjai. A kereskedelmi név, a város, az országkód (ISO 3166-1), a pénznemkód (ISO 4217 numerikus), az MCC, a tipp / kényelmi díj opciók és a további adatmezők beállítása. Hasznos tesztelés vagy egyedi integrálás.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blend Modes (Professional)',
      paragraphs: ['További keverési módok szakmai szinten:'],
      bullets: [
        'Pixelate: Pixelated overlay effect.',
        'Sorvonal: A perem érzékelése csak kontúrokat mutat.',
        'Hullám: hullámos torzító hatás.',
        'Szubpixel mérete: A kép alapján változó alpixel méret.',
        'True Dither: Haladó ásatás a megrendelt mátrix kiválasztással.',
        'Extrém: A maximális képláthatóság befolyásolhatja a scannabilitást.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Védőbeállítások',
      paragraphs: ['Final-grained control which QR elemekkel védett overlay módosítás:'],
      bullets: [
        'Fenntartás Időzítés: Az időzítési minták változatlanok maradnak.',
        'Preserve Alignment: Tartsa összehangolási minták változatlan.',
        'A formátum védelme Info: Pajzsformátumú információs modulok.',
        'Verzió védelme Info: Pajzsi verzió információs modulok.',
      ],
    },
    {
      heading: 'ECC-Aware mód',
      paragraphs: [
        'A hibajavító kapacitáson alapuló átfedési intenzitást megfelelően elosztja. A rendszer elemzi, hogy mely modulokat lehet módosítani, miközben a scannability.',
      ],
      bullets: [
        'Kockázati költségvetés: a felhasználandó hibajavítási kapacitás százalékos aránya (0- 100%).',
        'Magasabb költségvetés = láthatóbb átfedés, de kockázatosabb scannability.',
        'Alsó költségvetés = biztonságosabb letapogatás, de kevésbé látható átfedés.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professzionális bérbeadás lehetőségei',
      paragraphs: ['Fejlett renderelésvezérlés:'],
      bullets: [
        'Crisp Edges: A pixelált képmegjelenítés használata éles modulszélekhez.',
        'Pixel Snap: Floor, Round, vagy Ceil pixel beállítás.',
        'Per- Module Color Mode: Solid, By fényerő, Beosztás, Overlay, By Cluster.',
        'Színpaletta: Definiálja az egyedi színpaletta per- modul színezés.',
        'Contrast Guard: A színek közötti legkisebb kontraszt arány biztosítása.',
        'Min kontraszt arány: WCAG- stílusú kontraszt követelmény (1: 1 - 21: 1).',
        'Külső határ Modulok: További határ a csendes zónán túl.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Szakmai kimeneti beállítások',
      paragraphs: ['Vállalati export beállításai:'],
      bullets: [
        'DPI: A nyomtatási felbontás beállítása (72- 600 dPI). 300 dpi ajánlott nyomtatásra.',
        'A csendes zóna bekapcsolása a kimenet méreteiben.',
        'Exportálás mint kiegészítő: PDF létrehozása az elsődleges formátum mellett.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Animációs beállítások (Professional)',
      paragraphs: ['További szakmai animációs jellemzők:'],
      bullets: [
        'Temporal Dither: Off, Blue Noise, vagy Flicker Safe perframe Dithering.',
        'Minta: Nincs, pulzus, hullám, Scanline, Shimmer, vagy Drift effektek.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Hivatkozás',
      paragraphs: [
        'Az ANQR egy szerveroldali API-t biztosít QR-kódok URL paramétereken keresztüli létrehozására. Ez ideális a QR-kódok beágyazásához weboldalakra, e-mailekre, dokumentumokra, vagy automatikus munkafolyamatokra kliensoldali JavaScript nélkül.',
        'Bázis URL: https: / / anqr.link / api / qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'QR példák megtekintése', type: 'example' }],
    },
    {
      heading: 'Alapparaméterek',
      paragraphs: ['Szükséges és közös paraméterek (paraméter nevek nem lefordítani):'],
      bullets: [
        'adat (szükséges): A QR kódba kódolandó tartalom. URL- kódolás speciális karakterek.',
        'méret: képméret pixelben (alapértelmezés: 400, max: 2000). Használt, ha w / h nincs megadva.',
        'w, h: a pixelek kimeneti szélessége és magassága. Felülírja a méret paraméterét.',
        'formátum: Kimenet formátum - png, webp, vagy gif (alapértelmezés: png).',
        'ec: Hibaszint - L, M, Q vagy H (alapértelmezés: H).',
        'fg: Előfordulási szín hex nélkül # (alapértelmezés: 000000).',
        'bg: Háttér színe hex nélkül # (alapértelmezett: ffffff).',
        'átlátszó: az átlátszó háttér 1-re van állítva.',
        'árrés: Csendes zóna modulokban (alapértelmezés: 4).',
      ],
    },
    {
      heading: 'Stiling paraméterek',
      paragraphs: ['Modul és minta stílus:'],
      bullets: [
        'stílus: Modul stílus - négyzet, kerek, pontok, gyémánt, csatlakoztatva.',
        'kereső: Kereső minta stílus - négyzet, kerek, kör.',
        'összehangolás: Igazítás minta stílus - match _ finder, négyzet, kerek, kör.',
        'időzítés: Timing sable style - match _ module, solid, dashed.',
        'sugara: Corner sugara százalék 0- 100.',
        'rés: Modulrés százalékos aránya 0- 50.',
        'gapMode: Gap mód - nincs, bemeneti, stroke, negatív _ space.',
        'szem Külső, szem Inner: Szemstílus - négyzet, kerek, kör.',
        'szemskála: Szemskála százalékos aránya (alapértelmezés: 100).',
        'gradiens típus - nincs, lineáris, radiál, kúp.',
        'gradAngle: Gradiens szög lineáris gradiensekhez.',
        'gradStops: Gradient stops as color 1, pos1, color 2, pos2,... (pl. ff0000,0,0000ff, 1).',
      ],
    },
    {
      heading: 'Átfedési paraméterek',
      paragraphs: ['Képfedvény-beállítások (a fedvényképet a szerver oldalon tölti le):'],
      bullets: [
        'img: A fedőkép URL-je (nyilvánosan elérhetőnek kell lennie).',
        'mód: Overlay mód - középen, félhang, keverék, fényerő, mozaik, eláztatott, blue- zaj, subpixel.',
        'intenzitás: Overlay intenzitás 0-100 (alapértelmezett: 100).',
        'szín Mode: Overlay szín mód - szín, szürkeárnyalat, bw.',
        'fit: Hogyan overlay illeszkedik - fedél, tank, nyújtózkodás.',
        'rothadás: Overlay rotáció fokban.',
        'flipX, flipY: Állítsa 1-re, hogy flip overlay.',
        'tartsa Faktorok: Tartózkodási kereső minták (alapértelmezés: 1).',
        'tartsa Időzítés, keepAlign: Állítsa 1-re, hogy megőrizze az időzítés / beállítás minták.',
      ],
    },
    {
      heading: 'Előfeldolgozási paraméterek',
      paragraphs: ['A borításhoz alkalmazott képelőfeldolgozás:'],
      bullets: [
        'fényerő: -100 és 100 közötti beállítás (alapértelmezés: 0).',
        'kontraszt: -100 - 100 (alapértelmezés: 0).',
        'gamma: 0,1-től 3-ig terjedő érték (alapértelmezés: 1).',
        'telítettség: Beállítás - 100 - 100 (alapértelmezés: 0).',
        'árnyalat: árnyalat forgása fokban.',
        'maszat pixelben.',
        'élező: Éles mennyiség 0- 100.',
        'posterize szint.',
        'küszöbérték: Bináris küszöb 0- 255.',
        'edge: Edge detection - off, sobel, canny.',
        'invert: Beállítva 1 invertálásra.',
      ],
    },
    {
      heading: 'Vízjelparaméterek',
      paragraphs: ['Vízjelek hozzáadása a generált QR-kódokhoz:'],
      bullets: [
        'wmEn: Állítsuk 1-re a vízjel engedélyezéséhez.',
        'm Kind: Vízjel típusa - szöveg, kép, minta.',
        'wmText: Watermark text (URL- kódolt).',
        'wmImg: URL vízjel képre.',
        'wmPos: Pozíció - center, sarkok, szélek, mögött, csendes _ zone.',
        'wmOpacity: Opacity 0-100 (alapértelmezett: 50).',
        'wmBlend: Keverési mód - normál, szorzás, képernyő, borítás.',
      ],
    },
    {
      heading: 'Animációs paraméterek',
      paragraphs: ['Az animált GIF-kimenethez (formátum = gif szükséges):'],
      bullets: [
        'anim Minta: Animációs minta - semmi, impulzus, hullám, scanline, csillogó, sodródás, szín _ ciklus.',
        'anim Keret: 1-60 képkockák száma (alapértelmezés: 24).',
        'anim Sebesség: Keretkésleltetés milliszekundumban 10- 1000 (alapértelmezés: 100).',
        'anim Vetőmag: Véletlenszerű vetőmag animációhoz.',
        'lazítás: Animáció lazítás - lineáris, könnyű _ in, könnyű _ out, könnyű _ in _ out, ugrál.',
      ],
    },
    {
      heading: 'Kimeneti paraméterek',
      paragraphs: ['Kimeneti formátum opciók:'],
      bullets: [
        'minőség: WebP minőség 0-1 (alapértelmezett: 0.9).',
        'webpQ: WebP minőség 0-100 (alapértelmezés: 90).',
        'gifColors: GIF paletta mérete 2-256 (alapértelmezés: 256).',
        'dpi: PNG kimeneti DPI (alapértelmezés: 72).',
        'metaTitle, metaAuthor, metaCopy, meta Táblázat: PNG metaadatmezők.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Vágási paraméterek',
      paragraphs: ['Fedvénykép kivágási beállításai:'],
      bullets: [
        'cropEn: Engedélyezze a fedvényvágást 0/1 (alapértelmezett: 0).',
        'cropX: Crop center X 0-1 törtként (alapértelmezett: 0,5).',
        'cropY: Vágás középpontja Y 0-1 törtként (alapértelmezett: 0,5).',
        'cropSize: Vágás mérete a 0-1 kép töredékeként (alapértelmezett: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Biztonsági zár paraméterei',
      paragraphs: ['Szabályozza, hogy mely QR-elemek legyenek védve a fedvénymódosítás ellen:'],
      bullets: [
        'lockF: Zárkereső minták 0/1 (alapértelmezett: 1).',
        'lockT: Zárolási időzítési minták 0/1 (alapértelmezett: 1).',
        'lockA: Zárolási igazítási minták 0/1 (alapértelmezett: 1).',
        'lockFmt: Zárolási formátum információ 0/1 (alapértelmezett: 1).',
        'lockV: Zárolási verzió információ 0/1 (alapértelmezett: 1).',
        'safeMode: Biztonsági mód - kikapcsolt, kiegyensúlyozott, szigorú (alapértelmezett: kikapcsolva).',
        'safeMinPx: A modul minimális mérete pixelben (alapértelmezett: 2).',
        'safeMinQz: Minimális csendes zóna modulok (alapértelmezett: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Paraméterek automatikus hangolása',
      paragraphs: ['Automatikus optimalizálási beállítások:'],
      bullets: [
        'autoVer: A QR-verzió automatikus kiválasztása 0/1 (alapértelmezett: 1).',
        'autoEcc: 0/1-es ECC szint automatikus kiválasztása (alapértelmezett: 0) - csak szerveroldali tipp.',
        'autoReduce: [CSAK KLIENS] Az intenzitás automatikus csökkentése a beolvasásig – szkennelési ellenőrzési ciklus szükséges.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'További animációs paraméterek',
      paragraphs: ['Bővített animációs vezérlők a GIF kimenethez:'],
      bullets: [
        'ciklus: Animációs ciklusok folyamatosan 0/1 (alapértelmezett: 1).',
        'ugrálás: Ping-pong animáció iránya 0/1 (alapértelmezett: 0).',
        'fordított: Animáció lejátszása fordítottan 0/1 (alapértelmezett: 0).',
        'colorCycle: 0/1 színciklus-effektus engedélyezése (alapértelmezett: 0).',
        'interp: Keret interpoláció - nincs, keresztfade, morph (alapértelmezett: nincs).',
        'tempDither: Időbeli dithering - off, blue_noise, flicker_safe (alapértelmezett: ki).',
        'startF: Animáció kezdő kerete (alapértelmezett: 0).',
        'maxF: A megjeleníthető képkockák maximális száma (alapértelmezett: 0 = automatikus).',
        'stepF: Képkocka lépésköze (alapértelmezett: 1).',
        'jitter: [CSAK CLIENT] Modul remegés képpontokban – képkockánkénti QR-regenerálást igényel.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Dithering paraméterek',
      paragraphs: ['Szabályozási algoritmusok átfedés feldolgozásához:'],
      bullets: [
        'ditherKind: Dither algoritmus - error_diffusion, ordered_bayer, blue_noise stb (alapértelmezett: ordered_bayer).',
        'diffusionKernel: Hiba diffúziós kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (alapértelmezett: floyd_steinberg).',
        'ditherStrength: Dither intenzitása 0-100 (alapértelmezett: 50).',
        'szerpentin: Szerpentin dithering 0/1 (alapértelmezett: 0).',
        'mátrix: Rendezett dither mátrix - bayer2, bayer4, bayer8 (alapértelmezett: bayer4).',
        'bnTile: Kék zajcsempék mérete (alapértelmezett: 64).',
        'bnSeed: Kék zaj véletlenszerű mag (alapértelmezett: 0).',
        'colorDither: Színdithering – nincs, csatornánként, észlelési (alapértelmezett: nincs).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixel paraméterek',
      paragraphs: ['Az alpixel keverési mód beállításai:'],
      bullets: [
        'spGrid: Subpixel rács mérete - 2x2, 3x3, 4x4 (alapértelmezett: 3x3).',
        'spCenter: Középső szabály – szigorú, halftone_center (alapértelmezett: szigorú).',
        'spNeutral: Semleges szín hatszög # nélkül (alapértelmezett: 808080).',
        'spFinder: Kereső felülírása - tömör, stilizált (alapértelmezett: szilárd).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Féltónus paraméterek',
      paragraphs: ['A féltónus keverési mód beállításai:'],
      bullets: [
        'htCell: Féltónus cellaméret - modulonként vagy nxn rácsonként (alapértelmezett: modulonként).',
        'htDot: Pont alakja - kör, négyzet, vonal (alapértelmezett: kör).',
        'htCurve: Fényerősségi görbe – lineáris, s-görbe, gamma (alapértelmezett: lineáris).',
        'duo1: Duotone shadow color hexa # nélkül (alapértelmezett: 000000).',
        'duo2: Duotone kiemelési szín hexa # nélkül (alapértelmezett: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-tudatos mód paraméterei',
      paragraphs: ['Intelligens fedvényelosztás a hibajavítási kapacitás alapján:'],
      bullets: [
        'eccAware: Engedélyezze az ECC-tudatos módot 0/1 (alapértelmezett: 0).',
        'eccRisk: A kockázati költségvetés százaléka 0-100 (alapértelmezett: 50).',
        'eccMap: Súlytérkép - távolság_találókig, blokk_hőtérkép, empirikus_scan_heatmap (alapértelmezett: távolság_keresőkig).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Keret paraméterei',
      paragraphs: ['Dekoratív keret beállításai:'],
      bullets: [
        'keret: Keretstílus – nincs, kerekített_keret, matrica, címke (alapértelmezett: nincs).',
        'frameText: A keretben megjelenítendő szöveg (URL kódolt).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Modulonkénti színparaméterek',
      paragraphs: ['Egyedi modul színezési lehetőségek:'],
      bullets: [
        'modColor: Színmód - szilárd, fényerő szerint, pozíció szerint, átfedés szerint, fürt szerint (alapértelmezett: szilárd).',
        'cGuard: Kontrasztőr 0/1 (alapértelmezett: 0).',
        'minContrast: Minimális kontrasztarány 1-21 (alapértelmezett: 4,5).',
        'paletta: vesszővel elválasztott hexadecimális színek paletta módhoz.',
        'palettaMode: Paletta eloszlás - pozíció, fényerő, átlós, radiális, véletlenszerű, sor, oszlop (alapértelmezett: pozíció).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF átfedési paraméterek',
      paragraphs: ['Az animált GIF fedvényképek beállításai:'],
      bullets: [
        'ovType: Fedvénytípus – statikus, gif, apng, webp_anim, videó (alapértelmezett: statikus).',
        'ovFramePick: Képkocka kiválasztása – mind, every_n, max_frames, duration_limit (alapértelmezett: minden).',
        'gifDelays: Használja az eredeti GIF-kockák késleltetését 0/1 (alapértelmezett: 1).',
        'gifDispH: GIF selejtezés kezelése – tisztelet, egyszerűsítés (alapértelmezett: tisztelet).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'ECC-nkénti intenzitáshatárok',
      paragraphs: ['Az átfedés maximális intenzitása hibajavítási szintenként:'],
      bullets: [
        'maxIntL: Maximális intenzitás az ECC L 0-100-hoz (alapértelmezett: 100).',
        'maxIntM: Maximális intenzitás az ECC M 0-100-hoz (alapértelmezett: 100).',
        'maxIntQ: Max. intenzitás az ECC Q 0-100-hoz (alapértelmezett: 100).',
        'maxIntH: Maximális intenzitás az ECC H 0-100-hoz (alapértelmezett: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Minőségbiztosítási szimulációs paraméterek (csak ügyfél számára)',
      paragraphs: [
        'Ezek a paraméterek elemzésre kerülnek az URL-kompatibilitás érdekében, de csak a böngészőben működnek:',
      ],
      bullets: [
        'qaContrast: Kontrasztellenőrzés engedélyezése 0/1 – interaktív érvényesítés szükséges.',
        'qaBlur: Az elmosódás szimulálása képpontokban – csak interaktív teszteléshez.',
        'qaNoise: Szimulálja a zajszintet – csak interaktív teszteléshez.',
        'qaHeatmap: 0/1 olvashatósági hőtérkép megjelenítése – vászonfedő felhasználói felület szükséges.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Csak kliens paraméterei',
      paragraphs: [
        'A legtöbb API-paraméter teljes mértékben támogatott szerveroldali. A [CLIENT-ONLY] megjelölésű paraméterek elemzése az URL-kompatibilitás érdekében történik, de böngészőfunkciókat igényelnek:',
      ],
      bullets: [
        'jitter: A modul jitterhez képkockánkénti QR-regenerálás szükséges, véletlenszerűséggel.',
        'autoReduce: Az automatikus csökkentés intenzitása iteratív szkennelési tesztet igényel.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: A minőségbiztosítási szimuláció interaktív vászonellenőrzést igényel.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'További kimeneti paraméterek',
      paragraphs: ['Kibővített kimeneti és exportálási beállítások:'],
      bullets: [
        'fname: Egyéni fájlnév a letöltésekhez (alapértelmezett: anqr-qrcode).',
        'inclQz: Csendes zóna belefoglalása a 0/1 kimeneti méretbe (alapértelmezett: 1).',
        'bgOver: A háttérszín felülírása hexadecimális szám nélkül # (felülbírálja a bg paramétert).',
        'fmtExtra: További formátumú kimenet – nincs, eps, animated_webp (alapértelmezett: nincs). Megjegyzés: az eps a [PARTIAL].',
        'svgPrec: SVG alakzat pontosság - pixel, precíz (alapértelmezett: pixel). [RÉSZLETES] Az SVG kimenet korlátozott szerveroldali.',
        'svgEmbed: Raszteres fedvény beágyazása az SVG 0/1-be (alapértelmezett: 1). [RÉSZLETES] Az SVG kimenet korlátozott szerveroldali.',
        'modulePx: Modul pixel mérete (alapértelmezett: automatikusan a méret alapján számítva).',
        'határ: Extra határmodulok a csendes zónán kívül (alapértelmezett: 0).',
        'crisp: Éles/pixeles képmegjelenítés engedélyezése 0/1 (alapértelmezett: 1).',
        'snap: Pixel snap mód – padló, kerek, mennyezet (alapértelmezett: padló).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Mintamegőrzési paraméterek',
      paragraphs: ['Szabályozza, hogy mely szerkezeti elemek legyenek védve az átfedéstől:'],
      bullets: [
        'keepFinders: A keresőminták megőrzése 0/1 (alapértelmezett: 1).',
        'keepTiming: Az időzítési minták megőrzése 0/1 (alapértelmezett: 0).',
        'keepAlign: Az igazítási minták megőrzése 0/1 (alapértelmezett: 0).',
        'ProtectFmt: Védi a formátuminformációs modulokat 0/1 (alapértelmezett: 0).',
        'ProtectVer: Verzióinformációs modulok védelme 0/1 (alapértelmezett: 0).',
      ],
    },
    {
      heading: 'Példa Használat',
      paragraphs: [
        'Alapvető QR kód:',
        'https: / / anqr.link / api / qr? data = https: / / example.com',
        'Egyedi színekkel ellátott QR-kód:',
        'https: / / anqr.link / api / qr? data = Hello & size = 300 & fg = 1e40af & bg = ffffff & style = kerekített & sugara = 30',
        'QR kód overlay képpel:',
        'https: / / anqr.link / api / qr? data = https: / / example.com & ec = H & img = https: / / example.com / logo.png & mode = half tone & intenzive = 70',
        'Animált GIF:',
        'https: / / anqr.link / api / qr? data = Hello & format = gif & animPattern = impulzus & animFrames = 24 & easy = easy _ in _ out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'QR példák megtekintése', type: 'example' }],
    },
    {
      heading: 'QR kódok beágyazása',
      paragraphs: [
        'Szakmai módban a Share funkció beágyazható HTML-t és URL-t generál. Így működik a beágyazás:',
      ],
      bullets: [
        'Share Link: URL létrehozása az ANQR alkalmazáshoz, az összes beállítás URL paraméterként kódolva. A kedvezményezett megtekintheti és módosíthatja a QR kódot.',
        'Beágyazott Image: < img > tag létrehozása, amely az API szerverre mutat. A QR kód szerveroldalas és képként szolgál.',
        'Markdown beágyazva: A Marklown kép szintaxisa dokumentációhoz és README fájlokhoz.',
        'Közvetlen API URL: A nyers API URL alkalmazásokhoz, szkriptekhez vagy más integrálásokhoz.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML példa',
      paragraphs: [
        'QR kód beágyazása honlapodra:',
        '< img src = "https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 200" alt = "QR Code" / >',
        'Reagáló méretre:',
        '< img src = "https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 400" alt = "QR Code" style = "max- width: 100%; height: auto;" / >',
        'A kiszolgáló a válaszokat hosszú gyorsítótárfejlécekkel tárolja, ezért az ugyanazon URL-re vonatkozó ismételt kérelmek gyorsak.',
      ],
    },
    {
      heading: 'URL formátum megosztása',
      paragraphs: [
        'Ha rákattint a Share in Professional mode gombra, az ANQR az aktuális beállításokat URL paraméterekre kódolja. A formátum:',
        'https: / / anqr.link /? data =... & ec = H & style = kerekített &...',
        'Ezek a paraméterek az API paramétereket tükrözik, így az alapútvonalat / / api / qr-ról / / api / qr-ra változtatva és a w / h paramétereket szükség szerint konvertálhatjuk APL-re.',
        'Megjegyzés: A helyi fájlokból feltöltött Overlay képek nem oszthatók meg URL-en keresztül - csak URL- alapú overlays (img paraméter) működik megosztott linkeken és API hívásokon.',
      ],
    },
    {
      heading: 'Áránykorlát és használat',
      paragraphs: [
        'Az API szabadon használható ésszerű mennyiségekhez. A nagy volumenű használat vagy kereskedelmi alkalmazások igénylő garantált üzemidő, kérjük, lépjen kapcsolatba velünk.',
        'Az API válaszok közé tartoznak az agresszív fejlécek. A legjobb teljesítmény, gyorsítótár válaszok a végén, vagy ugyanazt az URL következetesen azonos QR kódok.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Legjobb gyakorlatok',
      paragraphs: ['Kövesse ezeket az iránymutatásokat a megbízható QR-kódok tekintetében:'],
      bullets: [
        'A nyomtatás előtt mindig ellenőrizze a QR-kódjait több szkenneres alkalmazással.',
        'Hibajavítás H (Magas) használata overlays hozzáadásakor.',
        'Tartsuk meg legalább 4 modul csendes zóna (margin).',
        'Nagy kontraszt biztosítása az előtér és a háttér között.',
        'A nyomtatáshoz legalább 300 dpi-t kell használni, és tényleges nyomáson kell vizsgálni.',
        'A Preserve keresési minták engedélyezése overlays használatakor.',
        'Kezdje kisebb átfedési intenzitással, és fokozatosan növelje.',
        'Kültéri használatra nagyobb modulméret és nagyobb hibajavítás megfontolandó.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Böngészés Tanulj cikkeket', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'QR példák megtekintése', type: 'example' },
      ],
    },
    {
      heading: 'Hibaelhárítás',
      paragraphs: ['Közös kérdések és megoldások:'],
      bullets: [
        'A QR nem fogja letapogatni: Csökkentse az átfedési intenzitást, növelje a hibajavítást, ellenőrizze a kontrasztot.',
        'Túl nagy a kód: A tartalom hosszának csökkentése, URL rövidítő, alacsonyabb verzió használata.',
        'Homályos kimenet: Növelje a modul méretét, használja PNG helyett tömörített formátumok.',
        'A színek rosszul néznek ki: Nézd meg a színkontrasztot, próbáld a szürkeárnyalatú overlay módot.',
        'GIF nem animáló: Győződjön meg róla, hogy a GIF formátum kimenete, ellenőrizze képkocka szám.',
        'Nem betölthető képátló: Ellenőrizze a CORS jogosultságokat a távoli képeken.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lásd a kapcsolódó útmutatókat és példákat',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Billentyűzet billentyűparancsok',
      paragraphs: [
        'Az ANQR támogatja a szabványos billentyűparancsokat. Használja a Ctrl / Cmd + S-t az export kiváltásához (amikor az előnézetre koncentrál).',
      ],
    },
    {
      heading: 'Megosztás és beágyazás',
      paragraphs: [
        'Szakmai módban kattintson a Megosztás gombra, ha URL-t szeretne másolni az aktuális beállításaival. A kedvezményezett meg tudja nyitni ezt az URL-t, hogy lássa a pontos konfigurációját. Megjegyzés: A helyi fájlokból származó képek nem oszthatók meg URL-en keresztül.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Próbálja ezt a konfigurációt közvetlenül az ANQR generátorban.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Böngészés Tanulj cikkeket', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR példák megtekintése', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'QR példák megtekintése', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Nyisd ki a generátort', type: 'generator' },
  ],
};

export default guide;
