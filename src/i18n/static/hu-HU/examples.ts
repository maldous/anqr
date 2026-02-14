import type { PageDefinition } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR példák',
  description: 'Öt valós, gyártási stílusú példa, amely bemutatja, hogy a QR-kódok hol teremtenek mérhető értéket: egy régi kiskereskedelmi számlálókód felemelése, márkás kiskereskedelmi fizetések és "beolvasási" műveletek, nyomtatási méretezés a szórólapokról óriásplakátokra, animált QR digitális jelzésekhez és többnyelvű együttműködés megosztható horgonylinkekkel. Minden példa tartalmaz képeket, gyakorlati korlátokat, és egy remix hivatkozást, amely vissza a generátorhoz.',
  lastUpdated: '2026. február 1',

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Nyisd ki a generátort', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Böngészés Tanulj cikkeket', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'A teljes felhasználói útmutató megnyitása', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Case Study: Retail Counter QR Uplift',
      paragraphs: ['Ez a real-world példa egy kis kávézót követ, amely három éve ugyanazt a QR kódot használja a pultján. Az eredeti kódot gyorsan generálták a pandémiás rohanás során, szabványos papírra nyomtatva, és egy műanyag állványba csúszva. Működött - technikailag -, de a vásárlóknak gyakran több kísérletre volt szükségük, hogy letapogassák, és semmit sem tett a kávézó gondosan kialakított márkaazonosságának megerősítése érdekében.', 'Az átalakulás egy egyszerű könyvvizsgálattal kezdődött: a meglévő kód kódolta a kávézó online menüjét, az URL-t, amit meg akartak tartani. A kihívás az volt, hogy a QR inkább a kávézó élményének részévé váljon, mintsem egy 2020-as utólagos hasznosítássá.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'A látható kopást, ujjlenyomatokat és kopott nyomtatást ábrázoló műanyag állványon lévő, áthangolt QR-kód',
          caption: 'A kiindulópont: három évnyi ellenszolgáltatás miatt az eredeti QR alig működött',
        },
      ],
    },
    {
      heading: 'Az eredeti kód problémáinak diagnosztizálása',
      paragraphs: ['A tesztelés több problémát is feltárt: az eredeti kód L hibajavítást (minimális redundancia) használt, mindössze 2 modulból álló csendes zóna volt, és alacsony felbontással nyomtatták. A kávézó meleg wolframvilágítása alatt a már kifakult fekete modulok alig kontrasztosak a megsárgult papírral. A régebbi telefonok küszködtek; az újabb telefonok sikerültek, de észrevehető késéssel.', 'A technikai kérdéseken túl az általános fekete-fehér négyzet semmit sem közölt a márkáról. A vendégek hezitáltak a szkennelés előtt - egy finom bizalmi akadály, amely csökkentette az érintkezést a kávézó gondosan megtervezett digitális menüjével.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Az eredeti QR technikai hiányosságait bemutató diagnosztikai lefedettség: alacsony EKC, minimális csendes zóna, gyenge kontraszt',
          caption: 'Technikai elemzés annak feltárásáról, hogy az örökölt kód miért nem teljesült a valós körülmények között',
        },
      ],
    },
    {
      heading: 'A felemelő folyamat',
      paragraphs: ['Az ANQR használatával a kávézó tulajdonosa újraállította a kódot az azonos URL menüvel, de drámaian javította a beállításokat: Hiba korrekciója H a maximális ellenálló képesség, a 6- modulos csendes zóna megbízható határfelderítés, és a márka színek (mély burgundi modulok krém háttér), amelyek megfelelnek a kávézó belső paletta.', 'A kávézó logóját ábrázoló kis középsõ borítást adtak hozzá - szándékosan ügyesen ügyesen ügyesen ügyelve arra, hogy a márkát azonnal felismerjék. A biztonsági mód megerősítette, hogy a nyomtatás előtt az új tervet megbízhatóan letapogatták a vizsgálóberendezéseken.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'A konfigurációt bemutató ANQR felület: márka színek, megfelelő ECC, nagyvonalú csendes zóna, finom logó borítás',
          caption: 'A korszerűsített konfiguráció felépítése: minden beállítás, amelyet a márka kifejezésének és a scan megbízhatóságának kiegyensúlyozására választunk',
        },
      ],
    },
    {
      heading: 'Mérhető eredmények',
      paragraphs: ['Miután az új QR-t a professzionális matte- laminált kártyaállományba helyezte, a kávézó négy hét alatt nyomon követte az eredményeket. Becslések szerint 70% -ról közel 100% -ra javult a scan sikerességi aránya. Az átlagos letapogatási idő 34 másodpercről 1 másodperc alá csökkent. A legfontosabb, hogy a menü elkötelezettség nőtt 40% - ügyfelek, akik korábban nézett a QR és feladta most szkennelt magabiztosan.', 'A személyzet kevesebb kérdésről számolt be az ügyfeleknek a "QR használatával" kapcsolatban, és nincs több olyan eset, amikor manuálisan beírták az URL-t a csalódott ügyfelek számára. A márkás megjelenés beszélgetéseket is kiváltott, a vásárlók pozitívan nyilatkoztak az összefüggő dizájnról.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A a mérésekkel való összehasonlítás előtt / után: scan sikerességi arány, átlagos scan idő és heti scan szám javulás',
          caption: 'Négy hetes adatok arról, hogy milyen mérhető hatással jár egy megfontolt QR felemelkedés',
        },
      ],
    },
    {
      heading: 'A beállítás frissítése',
      paragraphs: ['A kávézó konfigurációja konzervatív, de hatékony márkát mutat: Hiba korrekciója H, 6- modulos csendes zóna, magas kontrasztú márka színek, és minimális középsõ borítás. Ez az egyensúly működik a legtöbb kiskereskedelmi számláló alkalmazások, ahol a megbízhatóság kell először, de a márka jelenléte még mindig számít.', 'Nyissa meg a generátort ezekkel a beállításokkal, és igazítsa a színeket a saját márkájához. A legfontosabb éleslátás: a megbízhatóság javítása önmagában drámaian növelheti az elkötelezettséget, még mielőtt bármilyen vizuális stílus.', 'Tekintse meg a kapcsolódó Learn útmutató a meglévő QR kampányok javítására a teljes módszertan mögött ezt a megközelítést.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link a generátor előre konfigurált a kávézó beállítások azonnali testreszabás',
          caption: 'Kezdje egy bizonyított konfiguráció és testreszabása a márka',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Nyisd ki a generátort',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Böngészés Tanulj cikkeket',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Esettanulmány: Multi- Payment Counter Display',
      paragraphs: ['Ez a példa egy butik ruhaboltot követ, amely öt különböző QR kódot halmozott fel a nyilvántartásukban: bankfizetés, tippek, Instagram, Google felülvizsgálatok és bérbeadás linket. Mindegyik generált egy másik forrásból, nyomtatott különböző időpontokban, és megjelenik a rosszul illeszkedő állványokon. A vizuális káosz aláásta a bolt gondosan ápolt esztétikáját, és a személyzet rendszeresen azzal foglalkozott, hogy az ügyfelek rossz kódot keressenek.', 'A szükséges választék: a fizetési kódok maximális megbízhatóságot igényelnek a konzervatív stílusban, míg a forgalmazási kódok kifejezőbbek lehetnek. Az egységes megjelenítő rendszer bemutatja, hogyan lehet egyensúlyt teremteni a márka jelenléte és a különböző QR-alkalmazások funkcionális igényei között.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Egy zsúfolt regiszterterület, amely öt eltérő QR-kódot tartalmaz különböző standokban és nyomtatott anyagokban',
          caption: 'A kaotikus kiindulópont: öt megszakított QR-kód versenyez a figyelemért és fogyasztói zavart okoz',
        },
      ],
    },
    {
      heading: 'A fizetési tapasztalat előtérbe helyezése',
      paragraphs: ['Az áruház elsődleges fizetési módja regionális szabványt használt, amely szigorú rakománymegfelelést írt elő. A tesztelés során kiderült, hogy bizonyos banki alkalmazásoknál még a kisebb stílus is befolyásolta a szkennelési sebességet. A döntés: a fizetési QR-kódot teljesen változatlanul hagyja, kivéve a méretoptimalizálást és a matt kartonra való professzionális nyomtatást.', 'Ez a konzervatív megközelítés azt jelentette, hogy a fizetési kód kevésbé tűnik "márkának", mint ideális, de a tranzakciós befejezési arány drámaian javult. A meglátás: a fizetési pillanatok nem a márkanév lehetőségei, hanem a megbízhatóság pillanatai. A vásárlók értékelik a gyorsaságot és a bizonyosságot az esztétika felett, amikor pénz van benne.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Egy tiszta, nagy fizetési QR kód a hivatásos matt kártya készlet, jól elhelyezve a nyilvántartásban',
          caption: 'A fizetés QR: nagyvonalúan, nyomtatott professzionális, stílusú konzervatív azonnali elismerés banki alkalmazások',
        },
      ],
    },
    {
      heading: 'A másodlagos tevékenység megjelenítése',
      paragraphs: ['A tippek, vélemények, társadalmi, és a munkaerő-felvétel, a bolt lehetne kifejezőbb. Ezeket a kódokat ANQR-ben regenerálták, következetes márkás stílusban: a bolt védjegye olivazöld tejszínen, lekerekített modulos stílusban, és egy finom középső borítás a bolt ikonjával. Hiba korrekciója H biztosította a megbízhatóságot még a stílus.', 'Ez a négy kód a fizetési kód mellett elhelyezett (nem versenyző) márkás panelben került elhelyezésre. A bolt tipográfiájának egyértelmű címkéi megmagyarázták minden kód célját. A vizuális hierarchia szándékos volt: a fizetés önmagában és prominens módon állt; a másodlagos tevékenységek opcióként csoportosultak.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Egy márkás panel, amely négy stílusú QR kódot tartalmaz tippek, vélemények, társadalmi, és bérbeadás, világos címkék',
          caption: 'A másodlagos akciócsoport: következetes márkajelzés, egyértelmű címkézés, opciók helyett',
        },
      ],
    },
    {
      heading: 'A rendszer kialakítása',
      paragraphs: ['A fizikai megjelenítés több problémát is megoldott egyszerre. A fizetőállvány és a másodlagos panel is matt anyagokat használt, hogy kiküszöbölje a felső világítás tükröződését. A magasságokat a változó termetű ügyfelek számára optimalizálták. Szögek a vásárlói sor felé irányulnak, nem pedig a pulton.', 'Kritikus módon, a bolt létrehozott tartalék ujjlenyomatokat a zárt ANQR konfigurációs linkekről. Amikor a tipp kódot végül kávéval fröccsent, a személyzet néhány percen belül kicserélte a tárolt konfigurációval - nincs screenshotok, nincs találgatás a beállításokban, nincs minőségi romlás.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'A fizikai megjelenítés elrendezését bemutató ábra: magasságok, szögek, anyagok, valamint a fizetés és a másodlagos megjelenítések közötti kapcsolat',
          caption: 'Kijelző rendszer tervrajza: fizikai ergonomikus optimalizálva az ügyfelek magasságainak és világítási körülményeinek megbízható letapogatására',
        },
      ],
    },
    {
      heading: 'Működési fejlesztések',
      paragraphs: ['Hat héttel az üzembe helyezés után az áruház jelentős fejlesztéseket dokumentált: nulla ügyfélpanasz a "hibás kód" összetévesztésével kapcsolatban, gyorsabb tranzakciós idő, és háromszorosára nőtt a borravalók beküldése (a vásárlók most már anélkül is megtalálhatják és beolvashatják a tippkódot, hogy kínos módon megkérdezték volna a személyzettől). A Google értékelései is növekedtek, mivel a dedikált, jól címkézett QR-kód megszüntette a súrlódást.', 'A személyzet képzése egyszerűbbé vált: A fizetési kód a nagy, minden más a panelen van. Amikor a fizetési alkalmazások frissültek, és egy rövid ideig lassabb letapogatást mutatott, a konzervatív fizetési kód kialakítása azt jelentette, hogy még mindig működött - csak egy kicsit lassabban, mint hogy teljesen kudarcot vallott volna.', 'Lásd a QR-kódokról szóló útmutatót a kijelző rendszer felépítésének alapelveiről.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'A metrics műszerfal mutatja előtt / után összehasonlítás: zavarodottság események, tranzakciós idő, tipp gyakorisága, felülvizsgálati beadványok',
          caption: 'Hat hetes működési adatok, amelyek igazolják egy átgondolt többQR kijelző rendszer üzleti hatását',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Nyisd ki a generátort',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Böngészés Tanulj cikkeket',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Esettanulmány: Üzleti kártyától Billboard-ig',
      paragraphs: ['Ez a példa egy nagyszabású konferenciára készülő rendezvénygyártó céget követ. Ugyanarra a QR-kódra volt szükségük - az eseményalkalmazáshoz kapcsolódva -, amelyeket radikálisan különböző formátumokban telepítettek: atentdee jelvény betétekre (3cm), asztali sátorkártyákra (8cm), regisztrációs asztali táblákra (30cm), útkereső plakátokra (60cm), és egy masszív színpadi háttérlobogóra (4 méter). Mindegyik formátum különböző távolságokat, világítási körülményeket és gyártási munkafolyamatokat mutatott.', 'A kihívás nem csak technikai volt, hanem működési is. Több szállító kezelte a különböző nyomtatási feladatokat, és a vállalatnak konzisztens, szkennelhető eredményeket kellett biztosítania, függetlenül attól, hogy ki mit készített. Megoldásuk középpontjában az SVG export és a szigorú átadási dokumentáció állt.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Egy kollázs, amely ugyanazt a QR kódot használja öt különböző méretben, jelvény és banner',
          caption: 'Egy QR-kód, öt telepítési méret: a centimétertől a méterig terjedő pontosság fenntartásának kihívása',
        },
      ],
    },
    {
      heading: 'Miért voltak a korábbi események problémák',
      paragraphs: ['Az utolsó konferenciájukon a cég kínos kudarcokat szenvedett. A QR színpadi transzparens kis PNG-ként jött létre, és bővült a tervezési szoftver - az eredmény tűnt elfogadhatónak távolról, de nem sikerült megbízható szkennelést a közönség. Jelvény A QR-ek túl sablonosak voltak, és túl kicsik, frusztráló résztvevők voltak, akik megpróbálták felvenni a kapcsolatot. Az inkonzisztens beállítások különböző formátumokban azt jelentették, hogy az \'azonos\' QR valójában minden darabon más volt.', 'Az esemény utáni elemzés feltárta a kiváltó okot: nincs egyetlen igazság forrása. Mindegyik tervező kissé eltérő beállításokkal újította meg a QR-t, és minden nyomtatási eladó másképp dolgozta fel a fájlokat. A minőség leromlott a telefonos játék során.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Közelkép képek szkennelési hibák: pixelált banner modulok, méreten aluli jelvény kódok, következetlen stílus különböző formátumok',
          caption: 'A korábbi események hibáinak törvényszéki elemzése: mindegyik formátum különböző minőségi problémákat vezetett be',
        },
      ],
    },
    {
      heading: 'Az SVG- Első munkafolyamat',
      paragraphs: ['Ehhez az eseményhez a cég szigorú protokollt hozott létre: egy QR-mester, amely az ANQR-ben készült, optimális beállításokkal (hibajavítás H, nagyvonalú csendes zóna, tiszta stílus), SVG-ként exportálva, és egyetlen hiteles forrásként tárolva. Az ANQR konfigurációs linket az SVG fájl mellett dokumentálták, így a kód szükség esetén regenerálható.', 'Minden tervező és eladó megkapta ugyanazt az SVG mester kifejezett utasításokat: a hely a kívánt méretű, nem módosítják, fenntartják a csendes zóna clearance. A raszterformátumot igénylő forgalmazók számára a vállalat meghatározott méretű, előre gyártott PNG-ket nyújtott be, a tervezett felhasználást jelölő egyértelmű megnevezési egyezményekkel.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Az SVG mesterét, nagyméretű PNG-ket, specifikációs dokumentumot és konfigurációs linket bemutató fájlcsomag',
          caption: 'Az átadási csomag: minden, ami az értékesítőknek szükséges, hogy következetes eredményeket találgatás nélkül',
        },
      ],
    },
    {
      heading: 'Size- specifikus szempontok',
      paragraphs: ['Mindegyik formátum különös figyelmet igényelt. A 3 cm-es jelvénybetétekhez szükség volt a QR-ra, hogy a lehető legtöbb helyet foglalják el – a szkennelési távolság karnyújtásnyira van. A 8 cm-es asztalsátrak a csendes zónán kívül dekoratív keretezést is tartalmazhatnak. A 4 méteres banner számítást igényelt: a tipikus közönségtávolságból (15-20 méter) a moduloknak jól megkülönböztethetőnek kellett lenniük a telefonkamerákkal, ami azt jelentette, hogy a QR-nak legalább 80 cm-re kellett lennie a banner kialakításán belül.', 'A cég készített egy méretezési útmutatót, amely dokumentálja a minimális QR méreteket minden várható letapogatási távolság. Ez a jövőbeli események számára újra felhasználható eszközzé vált, eltávolítva a találgatásokat a tervezési folyamatból.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'A szkennelési távolság, a minimális QR méret és az egyes eseményformátumok modulméretei közötti összefüggést bemutató ábra',
          caption: 'A méretmátrix: kiszámított méretek, amelyek biztosítják a megbízható letapogatást az egyes formátumok várható látótávolságán',
        },
      ],
    },
    {
      heading: 'Termelési eredmények',
      paragraphs: ['A konferencianap validálása szisztematikus volt: a személyzet minden alkalmazott QR-t megvizsgált az ajtók kinyitása előtt. A jelvény behelyezése azonnal letapogatta a karját. Az asztali sátrak megbízhatóan működtek a szünetmentes szobák változó világításában. A színpadi zászló - az előző esemény szégyene - sikeresen beszkennelt a közönség közepéről.', 'A szkennelési panaszokat nem regisztrálták 2.000 + résztvevőn. A működési nyeremény ugyanilyen jelentős volt: amikor egy last-minute szponzor hozzáadás új jelzéseket igényelt, a producer csapat percek alatt generálta a mester SVG, biztos benne, hogy ez megfelelne minden más.', 'Lásd az SVG vs PNG döntési keretéhez és a legjobb gyakorlatokhoz tartozó nyomtatási kész QR kódokról szóló tanulási útmutatót.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Eseményfényképezés a résztvevők sikeresen szkennelni QR kódok különböző méretek és távolságok az egész helyszínen',
          caption: 'Konferencia napi siker: megbízható szkennelés minden formában, a jelvény közelségétől a színpadi banner távolsági felvételek',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Nyisd ki a generátort',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Böngészés Tanulj cikkeket',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Esettanulmány: Airport Lounge Digital Display',
      paragraphs: ['Ez a példa egy olyan repülőteret követ, amely statikus QR-kódokat használt digitális üdvözlő képernyőiken. A képernyők forgó promóciós tartalmat mutattak, de a QR kód a lounge check-in ült egy sarokban, statikus és könnyen figyelmen kívül hagyta. Az elemzések szerint a jogosult vendégek mindössze 15% -a használta a QR-t annak ellenére, hogy gyorsabb, mint az íróasztal. A legtöbb vendég egyszerűen nem vette észre.', 'A feltevés egyszerű volt: egy vizuálisan elfoglalt környezetben mozgó tartalommal, egy statikus QR láthatatlanná válik. A megoldás szükséges ahhoz, hogy a QR észrevehető legyen anélkül, hogy veszélyeztetné a megbízhatóságot szükséges check-in flow, ahol a hiba azt jelentené, frusztrált utazók és hosszabb asztali sorok.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Digitális kijelző a reptéri társalgóban promóciós tartalommal, egy kis, statikus QR kóddal a sarokban',
          caption: 'Eredeti beállítás: egy statikus QR elveszve a dinamikus promóciós tartalmak tengerében, mindössze 15% -os elfogadás',
        },
      ],
    },
    {
      heading: 'Biztonságos animáció tervezése',
      paragraphs: ['A társalgó digitális jelzése nagy LED-paneleket használt - egy kihívást jelentő környezetet, ahol az agresszív animáció átvilágítási problémákat okozhat. A tervező csapat konzervatív módon kezdte: gyengéd impulzus hatás, amely finoman bővült, és szerződött a QR vizuális jelenléte anélkül, hogy módosítaná a tényleges kódszerkezetet. A keret időzítése lassú (250ms) volt, hogy elkerülje a flicker problémák a LED frissítési arány.', 'A biztonsági üzemmód hitelesítése megerősítette, hogy minden keret ellenőrizhető maradt. További vizsgálatok a tényleges LED-panelek kiderült, hogy az impulzus kellett, hogy még finomabb, mint az asztali nézeteket javasolt - LED fényerő és látószög befolyásolta érzékelt kontraszt nagyobb, mint várható.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Az ANQR animációs beállítások panel az impulzus konfigurációját mutatja: lassú időzítés, finom intenzitás, biztonsági mód engedélyezve',
          caption: 'Animációs konfiguráció: a LED panel megjelenítéséhez hangolt paraméterek, a szkennelések megbízhatóságának fenntartása mellett minden keretben',
        },
      ],
    },
    {
      heading: 'Integráció a jelzés tartalmával',
      paragraphs: ['Az animált QR-t a képernyő elrendezésének egy dedikált "stabil zónájában" helyezték el – ez a terület állandó maradt, miközben a promóciós tartalom forog a fő kijelzőterületen. Ez az elválasztás kulcsfontosságú volt: a QR-nak vizuális stabilitásra volt szüksége a szkenneléshez, még akkor is, ha finom animációjával felkelti a figyelmet.', 'Egy egyértelmű cselekvésre ösztönzés került a QR-kód mellé: "Kihagyja a sort – szkennelje be a bejelentkezéshez." A szöveg statikus maradt, miközben a QR pulzált, és olyan vizuális hierarchiát hozott létre, amely felhívta a figyelmet a szkennelési lehetőségre anélkül, hogy túlterhelné a promóciós tartalmat.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'A képernyő elrendezési diagramja mutatja az animált QR stabil zónában, míg promóciós tartalom forog a fő területen',
          caption: 'Képernyős ingatlanelosztás: az animált QR a forgó promóciós tartalomtól elkülönülő stabil zónát foglal magában',
        },
      ],
    },
    {
      heading: 'Technikai megvalósítás',
      paragraphs: ['Az animációs QR-t GIF-ként exportálták, a CMS jelzéshez optimalizált beállításokkal. Fájl méret megfontolások számított - a társalgó tartalomkezelő rendszere volt feltöltési határértékek, és túl nagy fájlokat okozott lejátszási dadogást. A végső export kiegyensúlyozta a vizuális minőséget a fájlmérettel szemben, korlátozva a színes palettát és optimalizálva a keretszámot.', 'A telepítés tartalmaz egy visszacsatolást: ha a GIF valamilyen oknál fogva nem játszott, a jelzésrendszer statikus PNG biztonsági mentést mutat. Ez a redundancia biztosította, hogy az animációval kapcsolatos technikai problémák miatt soha ne veszítsék el az ellenőrző képességet.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'CMS interfész, amely az animált QR feltöltést jeleníti meg, és a slubback statikus képet konfigurálja',
          caption: 'Jelzések CMS konfigurációja: animált primer statikus visszacsapással, amely biztosítja az ellenőrző képesség megszakítását',
        },
      ],
    },
    {
      heading: 'Mért hatás',
      paragraphs: ['Egy hónapos működés után az örökbefogadás során végzett QR ellenőrzés 15% -ról 24% -ra nőtt, ami 60% -os relatív javulást jelent. Vendég visszajelzések szerint az animációs QR "könnyebb észrevenni" és "úgy érezte, modernebb". Az asztali sorban töltött idő mérhetően csökkent a csúcsidőszakokban, mivel több vendég volt önkiszolgáló a QR-en keresztül.', 'Fontos, hogy nulla szkennelési hibát jelentettek annak ellenére, hogy több ezer napi letapogatás. A konzervatív animációs megközelítés elérte a figyelem célját anélkül, hogy feláldozta volna a megbízhatóságot a szükséges check-in áramlás. A társalgó ezután hasonló animációs QR-eket állított ki a többi helyszínre.', 'A biztonságos animációs tervezés technikai alapelveit illetően lásd a Digitális feliratok animációs QR kódjainak tanulását.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Egy műszerfal, amely mutatja az adoptálási arány növekedését, a sorban álló idő csökkentését, és nulla sikertelen szkennelési megbízhatóságot a kiépítési időszakban',
          caption: 'Egy hónapnyi adat: 60%-os bevezetési növekedés, csökkentett várakozási idők és fenntartott tökéletes szkennelési megbízhatóság',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Nyisd ki a generátort',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Böngészés Tanulj cikkeket',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Esettanulmány: Globális termék indítása QR kampány',
      paragraphs: ['Ez a példa követi a fogyasztói elektronikai cég elindítása egy új termék egyidejűleg 12 piacok 8 nyelven. Minden egyes regionális marketingcsoportnak csomagolást, kiskereskedelmi kijelzőket és promóciós anyagokat kellett előállítania, amelyek QR-kódokkal kapcsolódnak a helyi termékoldalakhoz. A korábbi kilövések következetlen QR stilinget, alkalmi letapogatási hibákat és a konfigurációs drift "telefonos játékát eredményeztek, ahogy minden csapat a screenshotok kódjait utánozta.', 'A megoldás kihasználta az ANQR megosztható konfigurációs linkjeit, hogy egyetlen igazságforrást hozzon létre, amelyhez minden regionális csapat hozzáférhet, tekintet nélkül az interfész nyelvére. A QR hasznos teher egy intelligens átirányítás, amely észlelte a felhasználói nyelv, így egy kód működött globálisan, miközben helyi tapasztalatok.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'A világtérkép 12 piaci helyszín QR kódokkal, néhány vizuálisan összeegyeztethetetlen egymással',
          caption: 'A kihívás: 12 piac, 8 nyelv, valamint a régiók közötti, egymással ellentmondó QR-megvalósítások története',
        },
      ],
    },
    {
      heading: 'A Master Configuration létrehozása',
      paragraphs: ['A globális márka csapat létrehozta az autoritatív QR konfigurációt az ANQR-ben: a márkaszínek megfelelnek a termékvonal vizuális identitásának, a hibajavítás H a megbízhatóság az összes nyomtatási és digitális alkalmazás, és a stílus, amely folyamatosan szaporodik függetlenül a helyi gyártási módszerek. A konfiguráció le volt zárva, és a megosztási link dokumentálva volt a globális kampányban.', 'Kritikus módon, a kódolt URL nyelvfelismerő szolgáltatást használt. A szkennelés során a felhasználókat automatikusan a helyi nyelvi termék oldalára irányították. Ez azt jelentette, hogy mind a 12 piac azonos QR-kódokat használhat - nincs olyan perpiaci hasznos teher-változás, amely hibákat vezethetne be.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Az ANQR felület, amely a master konfigurációját mutatja márkaszínekkel, ECC H-val és az intelligens átirányított URL-lel',
          caption: 'A master konfiguráció: globális márkaszabványok egyetlen, megosztható igazságforrásra kódolva',
        },
      ],
    },
    {
      heading: 'Regionális csapatmunka',
      paragraphs: ['Minden regionális marketing csapat megkapta a konfigurációs linket egyszerű utasításokkal: nyissa meg a linket, ellenőrizze az előnézet megfelel a márka iránymutatások, export a kívánt formátumban az alkalmazás. Az ANQR interfész minden csapat preferált nyelvén megjelenik, de a mögöttes QR beállítások az interfész nyelvétől függetlenül azonosak maradtak.', 'Amikor a japán csapatnak SVG-re volt szüksége a high-end kiskereskedelmi kijelzőkhöz, és a brazil csapatnak PNG-re a közösségi médiához, mindkettőt ugyanabból a konfigurációból exportálták. Amikor a német csapat nyomdája speciális színértékeket kért, közvetlenül hivatkozhatott a konfigurációra, ahelyett, hogy egy képernyőképből találgatna.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Képernyőképek ugyanazt a konfigurációs linket megnyitották japán, portugál és német interfészeken',
          caption: 'Ugyanaz a konfiguráció, különböző interfészek: a regionális csapatok az előnyben részesített nyelvükön dolgoznak, a globális következetesség fenntartása mellett',
        },
      ],
    },
    {
      heading: 'Regionális változatok kezelése',
      paragraphs: ['Egyes piacok kisebb kiigazításokat tettek szükségessé. A kínai csapatnak szüksége volt egy verzióra, egy WChat- optimalizált keret a társadalmi megosztás. Ahelyett, hogy módosítanák a mestert, létrehoztak egy dokumentált változatot saját konfigurációs kapcsolattal, amely egyértelműen "CN- WeChat variánsnak" van jelölve a kampány eszköztárában. Ez fenntartotta a nyomon követhetőséget, miközben lehetővé tette a szükséges lokalizációt.', 'A márka csapat felállított egy egyszerű szabályt: minden változás mestertől megkövetelte egy új, dokumentált konfigurációs link. Nincs módosítás az exportált fájlokban, nincs "gyors javítás" a tervezési szoftverben. Ez megakadályozta a konfigurálási eltolódást, ami a korábbi kilövéseket okozta.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Eszközkönyvtár-felület, amely a master konfigurációt és a jóváhagyott regionális változatokat mutatja, mindegyik saját kapcsolattal',
          caption: 'Kampány eszközirányítás: master konfiguráció plusz dokumentált változatok, minden lenyomozható keresztül konfigurációs linkek',
        },
      ],
    },
    {
      heading: 'Eredmények indítása',
      paragraphs: ['A termék elindításának napja a csomagoláson, a kiskereskedelmi kiállításon, az eseményanyagokon és a digitális kampányokon keresztül egyszerre alkalmazott QR-kódokat látta mind a 12 piacon. A minőségi ellenőrzések megerősítették a régiók közötti vizuális konzisztenciát - a tokiói kiskereskedelmi kijelzőkön a QR megegyezett a São Paulo csomagoláson a QR-rel a berlini eseménybannereken.', 'Zéró szkennelési hibáról számoltak be a piacokon. Amikor az URL-t az indítás után módosítani kellett, az átirányított szolgáltatás láthatatlanul kezelte - nincs szükség átnyomtatásra. A globális csapat becslései szerint a konfigurációs kapcsolat megközelítése 40 + óra koordinációs időt takarított meg korábbi indítási módszeréhez képest.', 'A globális kampányok következetessége mögött meghúzódó munkafolyamat elveit illetően lásd a "Tanulj meg a különböző nyelvű QR együttműködésről" című útmutatót.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'A különböző piacokon a QR következetes alkalmazását mutató fényképek hálózata: Tokió kiskereskedelem, São Paulo csomagolás, Berlin események',
          caption: 'Globális következetesség: azonos QR prezentáció 12 piacon a különböző nyelvek, kereskedők és formátumok ellenére',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Nyisd ki a generátort',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Böngészés Tanulj cikkeket',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Böngészés Tanulj cikkeket', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'A teljes felhasználói útmutató megnyitása', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'A galéria megnyitása', type: 'gallery' },
  ],
};
