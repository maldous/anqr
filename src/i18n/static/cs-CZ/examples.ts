import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Příklady ANQR',
  description: 'Pět reálných příkladů produkčního stylu, které ukazují, kde QR kódy vytvářejí měřitelnou hodnotu: pozvednutí staršího maloobchodního pultového kódu, značkové maloobchodní platby a akce "scan-to", škálování tisku od letáků po billboardy, animované QR pro digitální značení a spolupráce mezi jazyky pomocí sdílených odkazů Anchor. Každý příklad obsahuje obrázky, praktická omezení a odkaz na remix zpět do generátoru.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otevři generátor', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Procházení Učit články', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otevřít plnou uživatelskou příručku', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Případová studie: Retail Counter QR Uplift',
      paragraphs: ['Tento reálný příklad následuje po malé kavárně, která používala stejný QR kód na jejich pultu po tři roky. Původní kód byl rychle generován během pandemické horečky, vytištěn na standardním papíře a vklouzl do plastového stojanu. Stále fungovala - technicky vzato - ale zákazníci často potřebovali několik pokusů, aby ji oskenovali, a nijak neposílila pečlivě vytvořenou značku kavárny.', 'Transformace začala jednoduchým auditem: existující kód kódoval URL online menu kavárny, které si chtěli ponechat. Výzvou bylo, aby se QR cítil jako součást zkušeností z kavárny spíše než jako následný nástroj z roku2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Zrněný QR kód v plastovém stojanu s viditelným opotřebením, otisky prstů a vybledlým tiskem',
          caption: 'Výchozí bod: tři roky protislužby ponechaly původní QR sotva funkční',
        },
      ],
    },
    {
      heading: 'Diagnóza problémů původního kódu',
      paragraphs: ['Testování odhalilo několik problémů: původní kód použitý Error Correction L (minimální redundance), měl tichou zónu pouze 2 modulů a byl vytištěn v nízkém rozlišení. Pod teplým wolframovým osvětlením kavárny vybledly černé moduly sotva kontrastovaly se zažloutlým papírem. Starší telefony bojovaly; novější telefony uspěly, ale se znatelným zpožděním.', 'Kromě technických problémů, generické černé a bílé náměstí nic o značku. Zákazníci váhali před skenováním - jemná bariéra důvěry, která snížila zapojení do pečlivě navrženého digitálního menu kavárny.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnostický překryv, který ukazuje technické nedostatky původního QR: nízká ECC, minimální klidná zóna, špatný kontrast',
          caption: 'Technická analýza odhalující, proč se odkaz kódu v reálných podmínkách nedosahoval',
        },
      ],
    },
    {
      heading: 'Proces zvedání',
      paragraphs: ['Pomocí ANQR, majitel kavárny vytvořil kód se stejným URL menu, ale dramaticky vylepšil nastavení: Oprava chyb H pro maximální odolnost, 6- modul tichá zóna pro spolehlivou detekci hranic, a značky barvy (hluboké vínové moduly na smetanovém pozadí), které odpovídají interiérové paletě kavárny.', 'Byla přidána malá centrální překrytí s logem kavárny - udržována záměrně nenápadně, aby byla zachována scannability a zároveň byla zajištěna okamžitá identifikace značky. Bezpečnostní režim potvrdil nový design, který byl před každým tiskem spolehlivě naskenován přes zkušební zařízení.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Rozhraní ANQR zobrazující konfiguraci: barvy značky, odpovídající ECC, štědrá tichá zóna, jemné logo',
          caption: 'Vybudování vylepšené konfigurace: každé nastavení zvolené k vyvážení výrazu značky se scanovou spolehlivostí',
        },
      ],
    },
    {
      heading: 'Měřitelné výsledky',
      paragraphs: ['Po nasazení nového QR na profesionální mattelaminované kartě, kavárna sledoval výsledky v průběhu čtyř týdnů. Míra úspěšnosti skenování se zlepšila z odhadovaných 70% na téměř 100%. Průměrná doba skenování klesla z 3-4 sekund na méně než 1 sekundu. Nejvýznamnější je, že zapojení do menu vzrostlo o 40% - zákazníci, kteří se již předtím podívali na QR a vzdali se, nyní důvěrně skenovali.', 'Zaměstnanci hlásili méně zákaznických otázek o "jak používat QR" a žádné další případy manuálního psaní URL pro frustrované zákazníky. Značkovaný vzhled také rozdmýchával rozhovory, přičemž zákazníci pozitivně komentovali soudržný design.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A před / po porovnání s metrikou: úspěšnost skenování, průměrná doba skenování a týdenní zlepšení počtu skenů',
          caption: 'Čtyři týdny dat ukazujících měřitelný dopad přemýšlivého QR zvednutí',
        },
      ],
    },
    {
      heading: 'Znovu nastavte tuto konfiguraci',
      paragraphs: ['Konfigurace kavárny ukazuje konzervativní, ale efektivní značku: Oprava chyb H, 6- modul tiché zóny, vysoce kontrastní barvy značky a minimální centrální překrytí. Tento zůstatek funguje pro většinu maloobchodních počitadel aplikací, kde spolehlivost musí být na prvním místě, ale přítomnost značky stále záleží.', 'Otevřete generátor s tímto nastavením přednastaveným a přizpůsobte barvy a překryjte vlastní značku. Klíčový pohled: samotná spolehlivost může dramaticky zvýšit zapojení, dokonce i před přidáním jakéhokoliv vizuálního stylu.', 'Zobrazit související průvodce pro zlepšení stávajících QR kampaní pro plnou metodiku za tímto přístupem.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Odkaz na generátor přednastavený s nastavením kavárny pro okamžité přizpůsobení',
          caption: 'Začněte s osvědčenou konfigurací a přizpůsobením značky',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Procházení Učit články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Case Study: Multi- Payment Counter Display',
      paragraphs: ['Tento příklad následuje boutique oblečení obchod, který nashromáždil pět různých QR kódů v jejich registru: bankovní platby, tipy, Instagram, Google recenze a pronájem odkaz. Každý byl generován z jiného zdroje, vytištěn v různých časech, a zobrazen v neodpovídajících stojany. Vizuální chaos podkopával pečlivě vyšívanou estetiku obchodu a zaměstnanci se pravidelně zabývali zákazníky skenováním nesprávného kódu.', 'Řešení vyžadovalo oddělení obav: platební kódy potřebovaly maximální spolehlivost s konzervativním stylem, zatímco marketingové kódy mohly být výraznější. Jednotný zobrazovací systém, který se objevil, ukazuje, jak vyvážit přítomnost značky s funkčními požadavky různých případů použití QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Splněná registrová oblast s pěti neodpovídajícími kódy QR v různých stojanech a tištěných materiálech',
          caption: 'Chaotický výchozí bod: pět odpojených QR kódů konkurujících o pozornost a způsobujících zmatek zákazníků',
        },
      ],
    },
    {
      heading: 'Priorizace zkušeností s platbou',
      paragraphs: ['Metoda primární platby v obchodě použila regionální standard, který vyžadoval přísnou shodu s užitečným zatížením. Testování ukázalo, že i menší styl ovlivňuje rychlost skenování s určitými bankovními aplikacemi. Rozhodnutí: udržujte platební QR zcela nezměněné s výjimkou optimalizace velikosti a profesionálního tisku na matném kartě.', 'Tento konzervativní přístup znamenal, že platební kód vypadal méně "značkově" než ideálně, ale míra dokončení transakcí se dramaticky zlepšila. Poznatek: platební momenty nejsou příležitostí k budování značky, ale momenty spolehlivosti. Zákazníci oceňují rychlost a jistotu nad estetikou, když jde o peníze.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Čistý, velký platební QR kód na profesionální matte kartě, umístěný nápadně v registru',
          caption: 'Platební QR: štědře, profesionálně tištěné, stylově konzervativně pro okamžité uznání bankovními aplikacemi',
        },
      ],
    },
    {
      heading: 'Vytvoření displeje sekundární akce',
      paragraphs: ['Pro tipy, recenze, sociální, a najímání, obchod by mohl být výraznější. Tyto kódy byly regenerovány v ANQR s konzistentním značkovým stylem: podpis obchodu olivový green na smetaně, zaoblený styl modulu a jemné středové překrytí s ikonou obchodu. Oprava chyb H zajistil spolehlivost i s styling.', 'Tyto čtyři kódy byly uspořádány do znakového panelu umístěného vedle (nekonkurujícího) platebního kódu. Jasné štítky v typografii obchodu vysvětlují účel každého kódu. Vizuální hierarchie byla úmyslná: platba stála sama a prominentní; sekundární akce seskupeny jako možnosti.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Značka panel zobrazující čtyři stylové QR kódy pro tipy, recenze, sociální, a pronájem, s jasnými štítky',
          caption: 'Sekundární akční panel: konzistentní značkování, jasné označení, umístěné jako možnosti spíše než rozptylování',
        },
      ],
    },
    {
      heading: 'Návrh zobrazovacího systému',
      paragraphs: ['Fyzický displej vyřešil několik problémů současně. Jak platební stojan, tak sekundární panel využívaly matné materiály k odstranění oslnění z podsvícení. Výšky byly optimalizovány pro zákazníky různého postavení. Úhly směřují spíše k zákaznické frontě než k plochému pultu.', 'Kriticky, obchod vytvořil náhradní otisky z uzamčených ANQR konfiguračních odkazů. Když se nakonec kód tipů dostal kávově-rozstříknutý, personál jej během několika minut nahradil uloženou konfigurací - žádné snímky obrazovky, žádné hádání při nastavení, žádné zhoršení kvality.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Schéma znázorňující fyzikální rozložení zobrazení: výšky, úhly, materiály a vztah mezi platbou a sekundárním zobrazením',
          caption: 'Nákres zobrazovacího systému: fyzická ergonomie optimalizovaná pro spolehlivé skenování přes výšky a světelné podmínky zákazníků',
        },
      ],
    },
    {
      heading: 'Provozní zlepšení',
      paragraphs: ['Šest týdnů po nasazení obchod dokumentoval významná zlepšení: nulové stížnosti zákazníků na zmatek "chybného kódu", rychlejší časy transakcí a 3x zvýšení tipu podání (zákazníci mohli nyní najít a skenovat tip kód bez rozpačitě požádat zaměstnance). Recenze Google se také zvýšily, protože vyhrazené, dobře označené QR odstranil tření.', 'Školení zaměstnanců se zjednodušilo: Platební kód je velký, všechno ostatní je na panelu. Když byly aktualizovány platební aplikace a jeden krátce ukázal pomalejší skenování, konzervativní návrh platebního kódu znamenal, že stále funguje - jen okrajově pomalejší spíše než selhává úplně.', 'Viz Příručka pro výuku QR kódů pro maloobchodní platby pro principy za tímto zobrazovacím systémem.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Metrická přístrojová deska zobrazující před / po porovnání: zmatené události, čas transakce, frekvence tipů, podání přezkumu',
          caption: 'Šest týdnů provozních údajů prokazujících obchodní dopad promyšleného multi- QR zobrazovacího systému',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Procházení Učit články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Case Study: Od obchodní karty k Billboard',
      paragraphs: ['Tento příklad následuje po výrobní společnosti připravující se na velkou konferenci. Potřebovali stejný QR kód - spojení s aplikací event - rozmístěný napříč radikálně odlišnými formáty: destičky vstupenek (3cm), karty stolního stanu (8cm), cedule registračního stolu (30cm), plakáty (60cm) a masivní plakát na jevišti (4 metry). Každý formát měl různé vzdálenosti pohledu, světelné podmínky a výrobní pracovní toky.', 'Výzva nebyla jen technická – byla provozní. Více dodavatelů zpracovávalo různé tiskové úlohy a společnost potřebovala zajistit konzistentní, skenovatelné výsledky bez ohledu na to, kdo co vyrobil. Jejich řešení se soustředilo na export SVG a přísnou předávací dokumentaci.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Koláž zobrazující stejný QR kód nasazený v pěti různých velikostech, od odznaku po banner',
          caption: 'Jeden QR kód, pět velikostí nasazení: výzva zachování skanovatelnosti od centimetrů do metrů',
        },
      ],
    },
    {
      heading: 'Proč měly předchozí události problémy',
      paragraphs: ['Na poslední konferenci zažila společnost trapné chyby. Scénář QR byl generován jako malý PNG a zvětšen v designovém softwaru - výsledek vypadal přijatelně z dálky, ale nepodařilo se skenovat spolehlivě z publika. Odznak QR byly příliš stylové a příliš malé, frustrující účastníci se snažili přidat kontakty. Nekonzistentní nastavení ve formátech znamenalo, že QR vypadalo na každém kusu jinak.', 'Analýza událostí odhalila příčinu: žádný jediný zdroj pravdy. Každý designér obnovil QR s mírně odlišným nastavením a každý prodejce tisku zpracovával soubory jinak. Kvalita degradována prostřednictvím telefonní hry souborů.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Uzavřít fotografie zobrazující poruchy skenování: pixelované bannerové moduly, podřadné kódy odznaku, nekonzistentní styl ve formátech',
          caption: 'Forenzní analýza předchozích selhání událostí: každý formát zavedl různé problémy kvality',
        },
      ],
    },
    {
      heading: 'SVG- První workflow',
      paragraphs: ['Pro tuto událost společnost zavedla striktní protokol: jeden hlavní QR generovaný v ANQR s optimálním nastavením (Error CorreCH, Error Correction H, štědrá tichá zóna, čisté styling), vyvážený jako SVG, a uložený jako jediný autoritativní zdroj. Konfigurační odkaz ANQR byl zdokumentován vedle souboru SVG, takže kód může být v případě potřeby regenerován.', 'Každý designér a prodejce obdržel stejný SVG master s výslovnými pokyny: umístit na požadovanou velikost, neměnit, udržovat klidovou zónu clearance. U prodejců vyžadujících rastrové formáty společnost poskytovala přednastavené PNG ve specifických velikostech s jasnými pojmy označujícími zamýšlené použití.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Balíček souborů zobrazující SVG master, size- specifické PNG, dokument specifikace a konfigurační odkaz',
          caption: 'Balíček předání: vše, co prodejci potřebovali k dosažení konzistentních výsledků bez hádání',
        },
      ],
    },
    {
      heading: 'Specifické úvahy',
      paragraphs: ['Každý formát vyžadoval zvláštní pozornost. Odznakové vložky na 3 cm potřebovaly QR k obsazení maximálního dostupného prostoru - vzdálenost skenování by byla délka ramene. Stolní stany 8 cm mohou zahrnovat dekorativní rámy mimo klidovou zónu. Čtyřmetrový banner vyžadoval výpočet: z typické vzdálenosti od publika (15-20 metrů) musely být moduly jasně rozlišitelné telefonními kamerami, což znamenalo, že QR musí být uvnitř bannerového designu alespoň 80cm.', 'Společnost vytvořila příručku pro velikost dokumentující minimální QR rozměry pro každou očekávanou vzdálenost skenování. To se stalo znovu použitelným aktivem pro budoucí události, odstranění dohadů z procesu návrhu.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Graf znázorňující vztah mezi vzdáleností snímání, minimální velikostí QR a rozměry modulu pro každý formát události',
          caption: 'Matrice velikosti: vypočtené rozměry zajišťující spolehlivé skenování v očekávané vzdálenosti pohledu každého formátu',
        },
      ],
    },
    {
      heading: 'Výsledky výroby',
      paragraphs: ['Potvrzení dne konference bylo systematické: personál testoval každý nasazený QR před otevřením dveří. Odznaky jsou okamžitě naskenovány na délku paže. Stolní stany pracovaly spolehlivě při variabilním osvětlení únikových místností. Portál jeviště - ostuda předchozí události - úspěšně skenoval z poloviny obecenstva.', 'Žádné stížnosti na skenování nebyly zaznamenány přes 2 000 účastníků. Operační výhra byla stejně významná: když přidávání sponzorů na poslední chvíli vyžadovalo nové znamení, výrobní tým ji generoval z Master SVG v minutách, a byl přesvědčen, že se bude shodovat se vším ostatním.', 'Viz Příručka pro výuku tiskových-ready QR kódů pro rámec rozhodnutí SVG vs PNG a předávání osvědčených postupů.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografování událostí zobrazující účastníky úspěšně skenovat QR kódy na různých velikostech a vzdálenostech v celém místě konání',
          caption: 'Konferenční den úspěch: spolehlivé skenování v každém formátu, od odznaku close- ups po jeviště banner distanční snímky',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Procházení Učit články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Case Study: Airport Lounge Digital Display',
      paragraphs: ['Tento příklad sleduje salonek letecké společnosti, který na svých digitálních uvítacích obrazovkách používal statické QR kódy. Na obrazovkách se zobrazoval rotující propagační obsah, ale QR kód pro odbavení v salonku zůstal stát v rohu, statický a snadno přehlédnutelný. Analýza ukázala, že pouze 15 % způsobilých hostů využilo QR check-in, přestože byl rychlejší než fronta na stole. Většina hostů si toho prostě nevšimla.', 'Hypotéza byla jednoduchá: ve vizuálně nabitém prostředí s pohyblivým obsahem se statický QR stává neviditelným. Řešení potřebné k tomu, aby QR bylo patrné, aniž by byla ohrožena spolehlivost potřebná pro check-in tok, kde by selhání znamenalo frustrované cestovatele a delší fronty.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Digitální displej v letištní hale s propagačním obsahem s malým statickým QR kódem v rohu',
          caption: 'Původní nastavení: statická QR ztracená v moři dynamického propagačního obsahu, dosahující pouze 15% přijetí',
        },
      ],
    },
    {
      heading: 'Navrhnout bezpečnou animaci',
      paragraphs: ['Digitální značení salónku používalo velké LED panely - náročné prostředí, kde agresivní animace může způsobit problémy se skenováním. Konstrukční tým začal konzervativně: jemný pulzní efekt, který jemně rozšířil a napojil vizuální přítomnost QR bez změny struktury kódu. Načasování rámu bylo nastaveno pomalu (250ms), aby se zabránilo jakékoli blikající problémy s LED obnovovací frekvence.', 'Ověření bezpečnostního režimu potvrdilo, že každý snímek zůstal scanneable. Dodatečné testování na skutečných LED panelech odhalilo, že pulz musí být ještě jemnější než náhledy na plochu navrhl - LED jas a úhel pohledu ovlivněn vnímaný kontrast více, než se očekávalo.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Animace ANQR panel zobrazující konfiguraci pulsu: pomalé načasování, jemná intenzita, bezpečnostní režim povolen',
          caption: 'Animace konfigurace: parametry vyladěné pro displej LED obrazu při zachování spolehlivosti skenování v každém snímku',
        },
      ],
    },
    {
      heading: 'Integrace se signálním obsahem',
      paragraphs: ['Animovaný QR byl umístěn v dedikované \'stabilní zóně\' rozvržení obrazovky - oblasti, která zůstala konstantní, zatímco propagační obsah rotoval v hlavní oblasti displeje. Toto oddělení bylo zásadní: QR potřeboval vizuální stabilitu pro skenování i když přitahoval pozornost prostřednictvím své jemné animace.', 'K QR byla přidána jasná volací akce: Přeskočte frontu - skenujte pro kontrolu. Text zůstal statický, zatímco QR pulzuje, vytváří vizuální hierarchii, která upoutala pozornost k možnosti skenování, aniž by překonala propagační obsah.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Screening diagram zobrazující animovaný QR ve stabilní zóně, zatímco propagační obsah otáčí v hlavní oblasti',
          caption: 'Rozdělení nemovitostí na obrazovce: animovaný QR zaujímá stabilní zónu oddělenou od rotujícího propagačního obsahu',
        },
      ],
    },
    {
      heading: 'Technické nasazení',
      paragraphs: ['Animovaný QR byl vyvážen jako GIF s optimalizovaným nastavením pro signage CMS. Na velikosti souborů záleželo - systém správy obsahu salónku měl limity nahrávání a příliš velké soubory způsobily koktání přehrávání. Konečný export vyvážil vizuální kvalitu oproti velikosti souboru omezením barevné palety a optimalizací počtu snímků.', 'Odeslání zahrnovalo zálohu: pokud GIF z jakéhokoliv důvodu nezahraje, systém signalizace zobrazí statickou zálohu PNG. Tato redundance zajistila, že schopnost kontroly nebyla kvůli technickým problémům s animací nikdy ztracena.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Name',
          caption: 'Konfigurace signage CMS: animovaný primární se statickým zálohováním zajišťující schopnost kontroly-in není nikdy přerušena',
        },
      ],
    },
    {
      heading: 'Měřený dopad',
      paragraphs: ['Po jednom měsíci provozu se kontrola QR zvýšila z 15% na 24% - což je 60% relativní zlepšení. Zpravodajské průzkumy ukazují, že animovaný QR byl \'snadnější si všimnout\' a \'cítil modernější.\' Doba fronty stolu se v době špičky snižovala měřitelně, protože více hostů samo obsluhuje přes QR.', 'Důležité je, že navzdory tisícům denních skenů nebyly zaznamenány žádné poruchy skenování. Konzervativní přístup k animaci dosáhl cíle pozornosti, aniž by obětoval spolehlivost, kterou vyžaduje kontrola v toku. V salónku se následně vyhrnula podobná animovaná QR jako v ostatních lokalitách.', 'Viz návod k učení o animovaných kódech QR pro digitální značení pro technické principy bezpečného designu animace.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Přístrojová deska ukazující zvýšení rychlosti adopce, zkrácení doby fronty a spolehlivost skenování nulového selhání během období nasazení',
          caption: 'Jeden měsíc dat: 60% zvýšení adopce, zkrácené časy fronty, a udržovat perfektní scan spolehlivost',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Procházení Učit články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Case Study: Global Product Start QR kampaň',
      paragraphs: ['Tento příklad následuje po spotřebitelské elektronické společnosti, která současně spouští nový výrobek na 12 trzích v 8 jazycích. Každý regionální marketingový tým potřeboval k výrobě obalů, maloobchodních displejů a propagačních materiálů obsahujících QR kódy spojující lokalizované stránky výrobků. Předchozí starty měly za následek nekonzistentní QR styl, příležitostné skenování selhání, a \'telefonní hra\' konfigurační drift, jak každý tým vytvořil kódy ze screenshotů.', 'Řešení využilo sdílené konfigurační odkazy ANQR k vytvoření jediného zdroje pravdy, ke kterému by se každý regionální tým mohl dostat, bez ohledu na jazyk jejich rozhraní. Uživatelské zatížení QR použilo inteligentní přesměrování, které odhalilo uživatelský jazyk, takže jeden kód fungoval globálně při poskytování lokálních zkušeností.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Světová mapa ukazující 12 tržních míst s QR kódy, některé vizuálně neslučitelné s ostatními',
          caption: 'Výzva: 12 trhů, 8 jazyků a historie nekonzistentních implementací QR napříč regiony',
        },
      ],
    },
    {
      heading: 'Zřízení Master konfigurace',
      paragraphs: ['Globální tým značky vytvořil autoritativní konfiguraci QR v ANQR: barvy značky odpovídající vizuální identitě produktové řady, Chyba korekce pro spolehlivost ve všech tiskových a digitálních aplikacích a styl, který by se neustále rozmnožoval bez ohledu na místní výrobní metody. Konfigurace byla uzamčena a odkaz na sdílení je zdokumentován v globálním kampani.', 'Kriticky, kódované URL používalo jazykovou detekci přesměrování služby. Při skenování byli uživatelé automaticky přesměrováni na stránku produktů místního jazyka. To znamenalo, že všech 12 trhů by mohlo používat stejné kódy QR - žádné změny na trhu, které by mohly zavádět chyby.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Rozhraní ANQR zobrazující master konfiguraci s barvami značky, ECC H a chytré přesměrování URL',
          caption: 'Hlavní konfigurace: globální normy značky zakódované do jediného, sdíleného zdroje pravdy',
        },
      ],
    },
    {
      heading: 'Regionální team Workflow',
      paragraphs: ['Každý regionální marketingový tým obdržel konfigurační odkaz s jednoduchým návodem: otevřete odkaz, ověřte náhled odpovídá značkovým pokynům, exportujte v požadovaném formátu pro vaši aplikaci. Rozhraní ANQR zobrazené v preferovaném jazyce každého týmu, ale základní nastavení QR zůstalo identické bez ohledu na jazyk rozhraní.', 'Když japonský tým potřeboval SVG pro high- end maloobchodní displeje a brazilský tým potřeboval PNG pro sociální média, oba vyvážel ze stejné konfigurace. Když německý prodejce tisku požadoval specifické hodnoty barev, mohli nasměrovat konfiguraci přímo než hádat z obrazovky.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Snímky obrazovky zobrazující stejný konfigurační odkaz otevřený v japonských, portugalských a německých rozhraních',
          caption: 'Stejná konfigurace, různá rozhraní: regionální týmy pracují ve svém preferovaném jazyce při zachování globální konzistence',
        },
      ],
    },
    {
      heading: 'Řešení regionálních rozdílů',
      paragraphs: ['Některé trhy vyžadovaly menší úpravy. Čínský tým potřeboval verzi s WeChat- optimalizovaným rámcem pro společenské sdílení. Spíše než modifikaci master, oni vytvořili dokumentovanou variantu s vlastním konfiguračním linkem, jasně označený jako \'CN-WeChat varianta\' v knihovně majetku kampaně. To udrželo sledovatelnost a zároveň umožnilo nezbytnou lokalizaci.', 'Značkový tým vytvořil jednoduché pravidlo: každá změna od mistra vyžadovala nový dokumentovaný konfigurační odkaz. Žádné úpravy exportovaných souborů, žádné "rychlé opravy" v designovém softwaru. To zabránilo konfigurační drift, který sužoval předchozí starty.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Rozhraní knihovny aktiv zobrazující hlavní konfiguraci a schválené regionální varianty, každá s vlastním spojením',
          caption: 'Správa aktiv kampaně: master konfigurace plus zdokumentované varianty, všechny vystopovatelné přes konfigurační odkazy',
        },
      ],
    },
    {
      heading: 'Výsledky spuštění',
      paragraphs: ['Spouštěcí den výrobku viděl QR kódy rozmístěné přes obaly, maloobchodní displeje, materiály událostí a digitální kampaně na všech 12 trzích současně. Kvalitní audity potvrdily vizuální konzistenci napříč regiony - QR na tokijských maloobchodních displejích odpovídalo QR na São Paulo balení odpovídalo QR na berlínských bannerech událostí.', 'Po celém trhu byly hlášeny žádné poruchy skenování. Když byla potřeba změna URL stránky po uvedení produktu na trh, přesměrovaná služba se s ní vypořádala neviditelně - nebylo nutné přetisknout. Globální tým odhadl, že přístup konfiguračního spoje ušetřil 40 + hodin koordinačního času ve srovnání s jejich předchozí spouštěcí metodikou.', 'Viz průvodce pro výuku mezijazyčné spolupráce QR pro zásady pracovního toku, které stojí za konzistencí globální kampaně.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Součet fotografií, které ukazují konzistentní nasazení QR na různých trzích: Tokio maloobchod, São Paulo balení, Berlin akce',
          caption: 'Dosažené globální konzistence: identická prezentace QR na 12 trzích navzdory různým jazykům, prodejcům a formátům',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Procházení Učit články',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Procházení Učit články', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otevřít plnou uživatelskou příručku', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otevři galerii', type: 'gallery' },
  ],
};
