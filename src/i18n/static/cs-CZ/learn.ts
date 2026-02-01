import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Naučte se s ANQR',
  description: 'Praktické průvodce pro přeměnu QR kódů na skutečná marketingová aktiva – nejen na funkční čtverce. Naučte se upgradovat starší kódy prodejních míst, vytvořit vyhovující platební QR značení, připravit exporty připravené pro tisk, bezpečně používat animace na digitálních displejích a sdílet uzamčené konfigurace mezi vícejazyčnými týmy pomocí odkazů ANQR ("kotva").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otevři generátor', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Zobrazit příklady QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otevřít plnou uživatelskou příručku', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Zlepšování stávajících QR kampaní',
      paragraphs: ['Většina podniků má QR kódy roztroušené po celé své činnosti - na menu, pultech, obalech a propagačních materiálech. Mnoho z těchto kódů bylo vytvořeno před lety se základními generátory, což vedlo k generickým černo-a-bílým čtvercům, které nevzbuzují důvěru nebo odpovídají vaší identitě. Tento komplexní průvodce vás provede systematickým přístupem k auditu, modernizaci a optimalizaci stávající QR infrastruktury, aniž byste narušili cesty zákazníků, které jste již vytvořili.', 'Strategická výhoda modernizace spíše než nahrazení QR kódů spočívá v zachování kontinuity. Vaši zákazníci se již naučili očekávat určité destinace, když skenují vaše kódy. Tím, že udržíte kódované URL identické a zároveň dramaticky zlepšíte vizuální prezentaci, skenování spolehlivosti a zarovnání značky, vytvoříte bezešvý přechod, který zvýší důvěru, aniž by bylo nutné změnit vaši digitální infrastrukturu nebo sledování analytiky.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Porovnání stran-by-side ukazuje vybledlý, obecný QR kód vedle moderní značkové verze kódování stejné URL',
          caption: 'Před a po: Stejná adresa URL transformovaná z datovaného generického kódu na profesionální značené aktivum',
        },
      ],
    },
    {
      heading: 'Proč Legacy QR kódy Underdect',
      paragraphs: ['Kodex QR vytvořený během fáze předčasného přijetí - zejména v období 2020- 2021, kdy podniky spěchají k zavádění bezkontaktních řešení - často trpí několika kritickými otázkami. Nízká nastavení pro opravu chyb je činí křehkými při tisku na tvarované povrchy nebo při prohlížení pod náročným osvětlením. Nedostatečné tiché zóny způsobují selhání skenování, když jsou kódy umístěny v blízkosti jiných vizuálních prvků. Generický styl nekomunikuje s legitimitou značky, což vede k váhání a snížení rychlosti skenování.', 'Kromě technických omezení, staré kódy často představují chybějící značkové příležitosti. Každý QR kód je touchpoint s vaším zákazníkem - moment, kdy jsou aktivně zapojeni a ochotni jednat. Profesionální stylový kód, který odpovídá barvám vaší značky, obsahuje odpovídající bezpečnostní okraje a obsahuje volitelné značkové prvky, které přemění tuto službu na marketingové aktivum, které posiluje vaši identitu při každé interakci.'],
    },
    {
      heading: 'Provádění auditu kodexu QR',
      paragraphs: ['Začněte svůj upgrade projekt vytvořením komplexního soupisu každého QR kódu v současné době nasazený ve vašem podnikání. Dokumentovat fyzické umístění, kódované místo určení, aktuální stav tištěného materiálu a typické skenovací prostředí včetně světelných podmínek a úhlů pohledu. Otestujte každý kód s více zařízeními - starší smartphony a rozpočet zařízení často odhalí problémy spolehlivosti, které prémiové telefony maska.', 'Věnujte zvláštní pozornost kódům v lokalitách s vysokými sázkami: platební body, check-in areas a propagační displeje, kde chyba skenování přímo ovlivňuje příjmy nebo zkušenosti zákazníků. Tyto by měly být upřednostněny pro okamžité vylepšení. Také zaznamenejte kódy, které se objevují ve fotografickém nebo video obsahu, protože tyto budou vyžadovat koordinaci s vaším marketingovým týmem aktualizovat vizuální aktiva.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Kontrolní seznam rozhraní zobrazující kategorie auditu QR: umístění, stav, spolehlivost skenování a prioritní hodnocení',
          caption: 'Systematická šablona QR auditu pro dokumentování a upřednostňování kandidátů na upgrade',
        },
      ],
    },
    {
      heading: 'Strategie bezpečné aktualizace',
      paragraphs: ['Základním pravidlem upgradů QR je zachování cíle. Extrahujte přesnou adresu URL z každého existujícího kódu a zakódujte ji identicky ve své nové verzi. To zajišťuje, že všechny stávající analýzy, logika přesměrování a očekávání zákazníků zůstanou nedotčeny. Pokud potřebujete flexibilitu cíle pro budoucí aktualizace, je ideální čas zavést značkovou krátkou adresu URL nebo službu přesměrování – implementujte to však jako samostatný projekt, abyste se vyhnuli složeným změnám.', 'Pro vizuální upgrade použijte vylepšení vrstev: nejprve zajistěte technickou spolehlivost (vhodnou opravu chyb a klidovou zónu), poté přidejte styl značky (barvy, tvary modulu) a nakonec zvažte volitelná vylepšení (centrální překryvy, rámy). Každá vrstva by měla být validována testováním před pokračováním. Bezpečnostní režim ANQR pomáhá tyto priority prosazovat varováním, kdy styling může ohrozit skranovatelnost.'],
    },
    {
      heading: 'Přidání identity značky bez kompromisní spolehlivosti',
      paragraphs: ['Efektivní značení QR vyrovnává vizuální dopad proti spolehlivosti skenování. Začněte barvou: nahraďte výchozí černé popředí svou primární značkou, čímž zajistíte dostatečný kontrast s vaším pozadím. Pro většinu značek, tmavé barvy na světle pozadí fungují nejlépe. Vyhněte se nízkokontrastním kombinacím, sklonům, které snižují jasnost hran, nebo barvám, které se za běžných světelných podmínek objevují podobné.', 'Přizpůsobení tvaru modulu nabízí další možnost značkování s minimálním dopadem spolehlivosti. Zaokrouhlené moduly vytvářejí měkčí, přístupnější vzhled při zachování vynikající škálovatelnosti. Moduly Dot- style fungují dobře pro moderní, tech- forward značky. Připojené moduly vyhovují průmyslovým nebo podnikovým identitám. Ať už zvolíte jakýkoliv styl, udržujte konzistenci ve všech vašich QR nasazení pro okamžité rozpoznání značky.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Graf barevného kola ukazující optimální kombinace barev QR s ukazateli kontrastního poměru',
          caption: 'Průvodce výběrem barvy značky ukazující vysoce kontrastní kombinace, které udržují spolehlivost skenování',
        },
      ],
    },
    {
      heading: 'Zkušební a validační protokol',
      paragraphs: ['Nikdy nepoužívejte aktualizované QR kódy bez přísného testování. Vytisknout fyzický důkaz v přesné velikosti a na stejném materiálu jako vaše konečné nasazení. Zkouška na skutečném místě, kde bude kód žít, v různých dnech dne, aby se zohlednily změny osvětlení. Použijte alespoň tři různá zařízení: aktuální vlajkový telefon, zařízení středního doletu a starší nebo rozpočet smartphone.', 'Zaznamenejte dobu skenování a úspěšnost každého testu. Dobře optimalizovaný kód by měl do 1-2 sekund skenovat jakékoli rozumně moderní zařízení. Pokud vidíte konzistentní zpoždění nebo selhání, snížit intenzitu styling - odstranit nebo zmenšit překryvy, zvýšit tichou zónu, nebo přejít na vyšší úroveň opravy chyb. Spolehlivost má vždy přednost před vizuální sofistikovaností.'],
    },
    {
      heading: 'Uzamčení konfigurace pro konzistentnost',
      paragraphs: ['Jakmile ověříte optimální konfiguraci, uchovejte ji pomocí sdílených odkazů ANQR. To vytváří trvalý záznam o každém nastavení používaném pro generování schváleného kódu - barvy, styl modulu, opravu chyb, velikost a případné překryvy. Sdílejte tento odkaz se svým designovým týmem, tiskem prodejců, a každého, kdo by mohl v budoucnu potřebovat reprodukovat kód.', 'Tento konfigurační zámek zabraňuje postupnému degradaci, která postihuje mnoho QR nasazení. Bez něj si zaměstnanci vytvoří kódy z screenshotů, designéři obnoví nastavení z paměti a prodejci tisku provedou "užitečné" úpravy. Každá varianta představuje potenciální problémy. S uzamčeným konfiguračním linkem je každá reprodukce identická s testovaným, schváleným originálem.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Diagram ukazující posun konfigurace: snímky obrazovky vedoucí k rekreaci vedoucí k variantám oproti jedinému odkazu na zdroj pravdy',
          caption: 'Zabránit nastavení driftu vytvořením jediného autoritativního zdroje pro všechny reprodukce QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Zobrazit příklady QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Kódy QR pro maloobchodní platby',
      paragraphs: ['Platební QR kódy fungují v nejnáročnějším prostředí v maloobchodě: okamžik transakce. Zákazníci jsou připraveni zaplatit, často s frontou tvoří za nimi, a každou vteřinu zpoždění vytváří tření. Přesto je tento vysokotlaký moment také prvořadou realitou pro posílení značky. Tato příručka vysvětluje, jak vytvářet platební QR kódy, které skenují okamžitě na bankovních aplikacích a zároveň stále prezentují profesionální, značkový vzhled, který buduje důvěru zákazníků.', 'Základním principem pro platební QR kódy je spolehlivost před estetikou. Krásně navržený kód, který se nepodaří naskenovat v bankovní aplikaci jednoho zákazníka, vás bude stát mnohem víc v opuštěných transakcích a frustrovaných zákaznících, než by kdy mohl konzervativní design. Začněte s dodržováním předpisů, přidejte spolehlivost a poté pečlivě vrstvěte branding pouze tam, kde to neohrožuje primární funkci.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Prodejní pult zobrazující platební QR kód skenovaný smartphonem s bankovní aplikací',
          caption: 'Platební QR kódy musí okamžitě pracovat s bankovními a úschovnými aplikacemi za reálných podmínek',
        },
      ],
    },
    {
      heading: 'Pochopení standardů QR pro platby',
      paragraphs: ['Platební QR kódy obvykle dodržovat regionální normy, které diktují formát užitečného zatížení. V Singapuru, PayNow QR používá specifické formátování. V Indii se kódy UPI řídí normami BharatQR nebo UPI. Evropské platby SEPA používají kódy QR EPC. Každý standard existuje, aby bankovní aplikace mohly okamžitě rozpoznat a zpracovat platební informace. Odchýlení se od těchto norem - i mírně - může způsobit, že platební aplikace odmítnou kódy, které generické kamerové skenery čtou bez problému.', 'ANQR obsahuje šablony pro hlavní platební standardy, které automaticky formátují vaše obchodní údaje do odpovídající užitečné zátěže. Vždy používejte tyto šablony spíše než manuálně konstruovat platební řetězce, protože i menší formátovací chyby mohou způsobit selhání transakce. Pokud platební standard vašeho regionu není k dispozici jako šablona, poraďte se s technickou dokumentací vašeho poskytovatele plateb pro přesné formátování požadavků.'],
    },
    {
      heading: 'Nastavení a umístění počítadel',
      paragraphs: ['Protišpičkové QR kódy čelí jedinečným fyzickým výzvám. Zákazníci skenují na délku paže, často pod úhlem, někdy pomocí kýchnutí nebo vitríny. Osvětlení nad hlavou vytváří zářící skvrny. Kód soutěží s ostatními counter nepořádek o pozornost a jasné viditelnosti. Velikost vaší platby QR velkoryse - pro většinu counter aplikací se doporučuje minimálně 4-5cm, zvětšení, pokud kód sedí za sklem nebo v temně osvětlené oblasti.', 'Na poloze záleží stejně jako na velikosti. Umístěte kód tam, kde mohou zákazníci pohodlně držet svůj telefon, aniž by blokovali frontu nebo nešikovně sahali. Natočte displej směrem k zákazníkovi a nepokládejte jej naplocho. Pokud je to možné, použijte matnou laminaci nebo nereflexní zobrazovací materiály, abyste minimalizovali odlesky od stropního osvětlení. Vyzkoušejte konečné umístění v různých denních dobách, abyste zachytili problémy s osvětlením.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Schéma ukazující optimální výšky a úhly QR umístění pro různé konfigurace počítadel',
          caption: 'Průvodce umístění počítačů: optimální výšky, úhly a vzdálenosti pro spolehlivé skenování plateb',
        },
      ],
    },
    {
      heading: 'Konzervativní značení pro platební kódy',
      paragraphs: ['Platební aplikace jsou méně shovívavé než obecné kamery. Mnoho bankovních aplikací používá starší, jednodušší algoritmy QR čtení optimalizované pro rychlost, spíše než flexibilitu. To znamená, že styling, který dokonale funguje s telefonním fotoaparátem, může selhat se specifickými platebními aplikacemi. Udržet značku konzervativní: použijte barvu značky pro popředí, pokud udržuje silný kontrast, ale vyhnout se sklony, těžké překryvy, nebo dekorativní prvky, které by mohly narušit rozpoznání.', 'Chcete-li logo centra nebo překrytí, nechte si ho extrémně malé - ne více než 10-15% oblasti QR - a důkladně otestujte každou platební aplikaci, kterou mohou vaši zákazníci použít. Mnohé podniky se rozhodnou pro žádné překrývání platebních kódů konkrétně tím, že vyhradí tento styl marketingových kódů QR, kde jsou požadavky na spolehlivost méně přísné. Úkolem platebního kódu je zpracovávat transakce, ne zapůsobit vizuálně.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Srovnání ukazující přijatelné vs rizikové úrovně značky pro platební QR kódy',
          caption: 'Platební QR branding spektrum: od bezpečné konzervativní styling po riskantní dekorativní přístupy',
        },
      ],
    },
    {
      heading: 'Zvažování materiálu a tisku',
      paragraphs: ['Fyzický zobrazovací materiál významně ovlivňuje spolehlivost skenování. Zářivé laminace odráží horní světla přímo do kamery zákazníka. Tvarované materiály mohou narušit okraje modulu. Levný tisk může rozmazané jemné detaily. Pro platební QR kódy investujte do kvality: použijte matnou nebo saténovou laminaci, zajistěte tisk s vysokým rozlišením a nahraďte displeje, než se objeví opotřebení. Poškrábaný nebo vybledlý platební kód vás stojí transakce.', 'Zvažte trvanlivost a nahraditelnost displeje. Counter displeje se dotknou, pohnou, postříkají, a příležitostně převrhne. Navrhněte svůj zobrazovací systém tak, aby vložka QR mohla být snadno nahrazena bez nahrazení celého stojanu. Udržujte náhradní otisky připravené, generované ze zamčeného konfiguračního odkazu, takže opotřebované kódy lze okamžitě vyměnit.'],
    },
    {
      heading: 'Testování s reálnými platbami Aplikace',
      paragraphs: ['Obecné kamerové skenery dekódují téměř jakýkoli rozumně naformátovaný QR kód. Platební aplikace jsou vybíravější. Před nasazením jakéhokoli platebního QR kódu jej otestujte s každou platební aplikací, kterou vaši zákazníci mohou používat. V prostředí s více platbami to může znamenat testování s více bankovními aplikacemi, digitálními peněženkami a platebními platformami. Zdokumentujte, které aplikace jste testovali a jejich verze – platební aplikace se často aktualizují a aktualizace by mohla změnit chování při skenování.', 'Test za reálných podmínek: skutečný displej, skutečné osvětlení, skutečná snímací vzdálenost. Kód, který okamžitě naskenuje na vašem stole, může mít problémy na pultu v 17 hodin, když odpolední slunce vytváří odlesky. Otestujte si s nejstarším a nejlevnějším chytrým telefonem, který můžete najít – pokud spolehlivě funguje na levném zařízení, bude fungovat na všem. Označte jakoukoli dobu skenování delší než 2 sekundy pro vyšetřování a potenciální přepracování.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Testovací kontrolní seznam zobrazující různé platební aplikace, typy zařízení a environmentální podmínky pro ověření',
          caption: 'Komplexní platební QR testovací matice pokrývající aplikace, zařízení a faktory životního prostředí',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Zobrazit příklady QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Print- Ready QR kódy: SVG vs PNG',
      paragraphs: ['Rozdíl mezi QR kódem, který dokonale skenuje a ten, který selže, často závisí na tom, jak byl vyvážen a jak s ním zachází při tisku. Tato příručka vysvětluje kritické rozdíly mezi vektorovými (SVG) a rastrovými (PNG) formáty, kdy používat každý, a jak předat QR umělecká díla návrhářům a tiskovým prodejcům způsoby, které zachovávají spolehlivost skenování od vizitek k billboard- velikost značení.', 'Produkce tisku představuje proměnné, které na obrazovce neexistují: rozptyl inkoustu, textura substrátu, dokončovací procesy a kumulativní účinek více konverzí souborů. QR kód, který ve Vašem designovém softwaru vypadá dokonale, může vycházet z tiskárny s měkkými hranami, sníženým kontrastem nebo mírně zkreslenými moduly. Pochopení výběru formátů a osvědčených postupů při práci brání těmto tichým poruchám.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Zvětšený pohled srovnávající vektorové QR moduly s ostrými hranami versus rastrovými moduly zobrazujícími pixelové artefakty',
          caption: 'Vektor vs raster na stupnici tisku: přesný rozdíl, který určuje spolehlivost skenování',
        },
      ],
    },
    {
      heading: 'Proč je Vector (SVG) upřednostňován pro tisk',
      paragraphs: ['SVG soubory popisují QR kódy jako matematické tvary spíše než mřížky pixelů. To znamená, že kód lze zmenšit na libovolnou velikost - od 1cm štítku po 10m banner - bez ztráty ostrosti hrany. Tiskárna RIP (Raster Image Processor) vydává vektory ve výstupním rozlišení zařízení, které zajišťuje, že každý modul hrana je stejně ostrý, jak hardware umožňuje. Není tu žádná interpolace, žádné antialiasující artefakty, žádné nahromaděné rozmazání z více operací.', 'Kromě škálovatelnosti jsou soubory SVG v profesionálních pracovních tocích robustnější. Přežijí kruhové výlety přes software bez degradace. Mohou být zbarveny, aniž by se opakovaly. Vložili čistě do PDF souborů pro press- ready výstup. Pro každou tiskovou aplikaci, kde záleží na kvalitě, by SVG měl být váš výchozí vývozní formát.'],
    },
    {
      heading: 'Pokud je PNG přijatelný',
      paragraphs: ['PNG se stává nezbytným, pokud váš pracovní tok nebo cílová platforma nepodporuje vektorové formáty. Některé webové platformy, signage CMS systémy, a odkaz tiskových pracovních toků vyžadují rastrové snímky. V těchto případech může PNG dobře fungovat - ale pouze tehdy, pokud se budete řídit přísnými pravidly: export v konečné fyzické velikosti a rozlišení, nikdy se stupňovat po vývozu, a vyhnout se žádné ztrátové komprese nebo formátové konverze.', 'Rozhodujícím pravidlem pro PNG je vypočítat požadované rozměry pixelů před vývozem. Pokud bude QR tisknout na 5cm a tiskárna pracuje na 300 DPI, potřebujete přibližně 590 pixelů. Exportovat v této velikosti nebo větší, pak zmenšit v případě potřeby - nikdy nahoru. Zahrňte tyto informace do svého názvu souboru nebo metadat, aby budoucí uživatelé nechtěně neužívali podstatný export.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Kalkulačka rozhraní ukazující vztah mezi fyzikální velikosti, DPI, a požadované rozměry pixelů',
          caption: 'Kalkulačka rozlišení tisku: určení minimálních rozměrů pixelů pro velikost cílového výstupu',
        },
      ],
    },
    {
      heading: 'Vysvětlené možnosti exportu ANQR',
      paragraphs: ['ANQR nabízí několik režimů vývozu SVG, které vyhovují různým pracovním tokům. Režim True Vector vytváří čistý výstup na bázi path ideální pro tiskové a profesionální designové nástroje. Když přidáte překryvy rastru nebo určité efekty, ANQR je může vložit při zachování vektorových modulů, nebo můžete exportovat plně rasterizovanou verzi ve vašem určeném rozlišení. Pochopení těchto možností vám pomůže vybrat správný export pro každý případ použití.', 'Pro vývoz PNG, ANQR umožňuje určit přesné rozměry a obsahuje možnosti pro transparentní pozadí. Nastavení DPI vám pomůže vypočítat vhodné velikosti pro tisk, ale pamatujte, že DPI je metadata - pro tisk je důležité mít dostatek pixelů pro vaši fyzickou velikost. Když je na pochybách, export větší, než si myslíte, že potřebujete; zmenšení zachovává kvalitu, zatímco škálování ji ničí.'],
    },
    {
      heading: 'Příprava souborů pro Handoff',
      paragraphs: ['Při předávání uměleckých děl QR návrhářům nebo prodejcům tisku zahrnují jasné specifikace: zamýšlenou fyzickou velikost, minimální požadavky na klidovou zónu a jakékoli barevné aspekty. Pro kritické aplikace, poskytnout jak SVG master a vysoce rozlišené PNG zálohy, jasně označeny s jejich zamýšleným použitím. Zahrňte váš konfigurační odkaz ANQR, aby kód mohl být v případě potřeby regenerován.', 'Očekávat běžné chyby v procesu předání. Výslovně uveďte, že QR by neměl být škálován, rotován, postříkán nebo mít účinky. Upřesněte, že tichá zóna musí zůstat čistá - žádné známky obilí, registrační značky nebo konstrukční prvky nesmí narušovat. Pokud bude QR umístěno na barevném nebo fotografickém pozadí, poskytněte verzi s neprůhledným tvarem podložky, aby byl zajištěn odpovídající kontrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Schéma balíku souborů zobrazující SVG master, zálohování PNG, specifikace dokumentu a konfigurační odkaz',
          caption: 'Profesionální QR předání balíček: vše, co designer nebo tisk prodejce potřebuje pro přesnou reprodukci',
        },
      ],
    },
    {
      heading: 'Ověřování tiskových dokladů',
      paragraphs: ['Nikdy neschvalujte tisk bez skenování fyzického důkazu. Vyžádat si doklad vytištěný na skutečném substrátu se skutečnou úpravou, která bude použita při výrobě. Prohlédněte si důkaz za podmínek osvětlení podobných tomu, kde se zobrazí poslední kus. Test s více zařízeními, včetně starších chytrých telefonů, které by mohly bojovat s mezní kvalitou.', 'Pokud důkaz skenuje pomalu nebo nekonzistentně, vyšetřit před schválením. Mezi běžné problémy patří nedostatečný kontrast na barevných substrátech, porušení tiché zóny od ořezávání, inkoustové roztahovací okraje modulu, nebo laminace vytváří lesk. Kterýkoliv z nich může být adresován před závazkem k úplnému tisku - ale pouze pokud je chytíte ve fázi prokázání.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Prokazující kontrolní seznam s výsledky skenování, měření kontrastu a podpisy schválení',
          caption: 'Průtok ověření tisku: systematické testování před závazkem k výrobním množstvím',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Zobrazit příklady QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Vytváření animovaných QR kódů',
      paragraphs: ['Animované QR kódy kombinují funkčnost standardních QR kódů s očitým chytáním pohybu, který dramaticky zvyšuje míru zapojení. V digitálním značení, sociálních médiích a interaktivních displejích, animace transformuje statickou utilitu v přesvědčivý vizuální prvek, který přitahuje pozornost a vyzývá k interakci. Tato příručka zahrnuje zásady, techniky a praktická omezení vytváření animovaných QR kódů, které spolehlivě skenují při zajištění vizuálního dopadu.', 'Základním úkolem animovaných QR kódů je vyvažování vizuální zájem proti spolehlivosti skenování. Každý rám musí být individuálně skener - skener může zachytit kód v libovolném bodě animovaného cyklu. Toto omezení utváří každé konstrukční rozhodnutí: které prvky se mohou pohybovat, jak moc se mohou změnit a co musí zůstat stabilní v celé animaci.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Digitální indikační displej zobrazující animovaný QR kód zachycující pozornost diváka ve veřejném prostoru',
          caption: 'Animované QR kódy v digitálním značení: pohyb, který přitahuje pozornost a podporuje skenování',
        },
      ],
    },
    {
      heading: 'Jak animace ovlivňuje skenovatelnost',
      paragraphs: ['QR skenery pracují tak, že zachycují jediný rám a analyzují vzor světelných a tmavých modulů. Aby animovaný kód fungoval, musí každý rámec obsahovat kompletní, platný QR vzor. To vylučuje animace, které morfují strukturu kódu, rozpustí moduly nebo významně změní kontrastní vzorec. Moduly přenášející data - zdánlivě náhodný vzor ve středu - musí zůstat po celou dobu vizuálně stabilní.', 'Bezpečné přístupy k animaci modifikují prvky, které nepřenášejí data: pozadí, barvy, dekorativní rámy a překrývající prvky. Strukturální komponenty - nálezné vzory (velké rohové čtverce), časové vzory (střídavé čáry) a seřizovací vzory (menší čtverce ve větších kódech) - musí udržovat své pozice a proporce. Práce v rámci těchto omezení stále umožňuje překvapivě dynamické a poutavé animace.'],
    },
    {
      heading: 'Animační techniky That work',
      paragraphs: ['Barevné cykloturistika oživuje popředí a pozadí barvami palety a udržuje dostatečný kontrast na každém kroku. To vytváří pulzující, pozorný efekt s minimálním rizikem skenování - pokud kontrast nikdy neklesne pod čitelnou úroveň. Předvolby pro barevný cyklus ANQR jsou navrženy tak, aby udržovaly skluzavku po celý cyklus.', 'Animované překryvy umístí pohyblivé obrázky za polotransparentní QR vzor. Kód zůstává stabilní, zatímco pozadí animuje - možná smyčkové video, animované prvky značky nebo abstraktní pohybová grafika. Tato technika vyžaduje pečlivé řízení intenzity, aby se zabránilo pozadí z přemostění QR vzor, ale vytváří nejvíce vizuálně pozoruhodné výsledky.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Schéma znázorňující vrstvenou strukturu animovaného QR: stabilní kódová vrstva na animované pozadí',
          caption: 'Princip vrstvení animace: QR vzor zůstává konstantní, zatímco pozadí prvky animovat pod',
        },
      ],
    },
    {
      heading: 'Nastavení parametrů animace',
      paragraphs: ['Rychlost snímku ovlivňuje jak vizuální hladkost, tak velikost souboru. Pro většinu aplikací poskytuje 10-15 snímků za sekundu hladký pohyb bez nadměrných velikostí souborů. Vyšší počet snímků nabízí zmenšující se vizuální výnosy, zatímco výrazně zvyšuje velikost souborů. Vezměme si váš kontext pro doručování - velké digitální znamení dokáže zvládnout větší soubory než umístění mobilní reklamy.', 'Lop chování určuje, jak se animace cykly. Bezproblémové smyčky vytvářejí nepřetržitý pohyb ideální pro signage a okolní displeje. Ping- pong (forward- then- reverse) smyčky dobře fungují pro jednoduché animace. Pro pozornost - chytání pulsů, zvažte animace s držadly - doby ticha tečkované pohybem, který přitahuje oko bez konstantní únavy pohybu.'],
    },
    {
      heading: 'Vytváření animovaných překryvů',
      paragraphs: ['Při použití animovaných obrázků (GIFs, animované webové stránky nebo video) jako překryv, ANQR extrahuje rámy a komprimuje je s QR kódem. Nastavení intenzity překrytí kontroluje, kolik animace ukazuje skrze - nižší hodnoty upřednostňují skanovatelnost, zatímco vyšší hodnoty podporují vizuální dopad. Otestujte si zvolenou intenzitu na více snímků, aby byla zajištěna konzistentní škálovatelnost.', 'Kvalita zdroje materiálu má významný dopad na výsledky. Používejte překryvy s jasnými předměty a dobrým kontrastem. Vyhněte se zdrojovým animacím s rychlým blikáním nebo extrémními změnami jasu, které by mohly vytvářet příležitostné nízkokontrastní rámy. Prohlédněte si celý cyklus animace před vývozem, abyste zachytili jakékoliv problematické rámy, které by mohly selhat při skenování.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Name',
          caption: 'Analýza rámu: ověření konzistentní škálovatelnosti v celém animačním cyklu',
        },
      ],
    },
    {
      heading: 'Vývoz a dodání',
      paragraphs: ['GIF zůstává nejvíce podporovaný animovaný formát, automaticky hraje ve většině kontextů bez nutnosti podpory video přehrávače. Barevná paleta GIF však omezuje barevnost věrnosti. Pro barevné-kritické animace, zvažte animovaný WebP, kde podporované, nebo spadají zpět do video formáty pro nejvyšší kvalitu. Vývoz GIF společnosti ANQR zahrnuje možnosti rozkladu pro maximalizaci kvality v rámci omezení palety.', 'Velikost souboru je důležitá pro doručení. Digitální signage systémy, e-mailové klienty a sociální platformy často stanoví omezení velikosti. Pokud vaše animace překročí tyto limity, snižte počet snímků, rozměry nebo barevnou hloubku. Někdy rozdělení složité animace do kratší smyčky dosahuje lepších výsledků než agresivní komprese, která degraduje každý snímek.'],
    },
    {
      heading: 'Testování animovaných QR kódů',
      paragraphs: ['Testování animovaných kódů vyžaduje skenování v několika bodech animovaného cyklu. Neskenujte jen jednou a předpokládejte úspěch - skenujte opakovaně, v různých okamžicích, k ověření, že každý rám je čitelný. Zvláštní pozornost věnujte rámům při extrémech barevného cyklu nebo vrcholům intenzity překrytí, kde kontrast může být nejnižší.', 'Pokud je to možné, vyzkoušejte na skutečném hardwaru displeje. Kalibrace barev monitoru, pozorovací úhel a okolní osvětlení ovlivňují to, jak se animace zobrazí a naskenuje. Jasná animace, která perfektně skenuje na vašem monitoru, se může na venkovní obrazovce vyblednout nebo se při šikmých pozorovacích úhlech stát nečitelná.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Zkušební matrice ukazující úspěšnost skenování napříč různými rámy, zařízeními a podmínkami zobrazení',
          caption: 'Animovaný QR testovací protokol: systematické ověřování napříč rámy, zařízeními a podmínkami prohlížení',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Zobrazit příklady QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR Bezpečnost a dodržování nejlepších postupů',
      paragraphs: ['Krásně navržený QR kód, který nedokáže skenovat, je horší než zbytečný - frustruje zákazníky, poškozuje vnímání značky a plýtvá všemi zdroji investovanými do jeho tvorby a distribuce. Tato příručka zahrnuje technické a praktické faktory, které určují, zda bude QR kód spolehlivě skenovat a jak používat bezpečnostní prvky ANQR k chycení možných problémů před dosažením výroby.', 'Spolehlivost QR kódu není binární. Kód může perfektně skenovat vlajkové telefony, ale selže na rozpočtových zařízeních. To může fungovat v ideálním osvětlení, ale boj v tmavých restauracích nebo jasné sluneční světlo. Pochopení faktorů, které ovlivňují scannability vám pomůže vytvořit informovaný obchod mezi vizuálním stylem a reálným světem spolehlivosti.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Spolehlivé spektrum zobrazující kódy QR od vysoce stínitelných až po okrajově čitelné',
          caption: 'Spektrum scannability: od neprůstřelných kódů až po styl, který posouvá meze spolehlivosti',
        },
      ],
    },
    {
      heading: 'Úrovně pro korekci chyb v porozumění',
      paragraphs: ['QR kódy zahrnují built- in redundancy, které umožňují, aby byly čteny, i když částečně poškozeny nebo zastřené. Úroveň opravy chyb - L (7%), M (15%), Q (25%), nebo H (30%) - určuje, kolik kódu může chybět, zatímco ještě dekódování správně. Vyšší korekce chyb vytváří větší kódy, ale poskytuje bezpečnostní rezervu pro překryvy, tisk nedokonalostí a poškození životního prostředí.', 'Pro kódy s překryvy obrazu, úroveň opravy chyb H je zásadní - překrytí fyzicky zakrývá část kódu, a potřebujete, aby 30% redundance udržet spolehlivost. Pro čisté, nestylové kódy v řízeném prostředí, úroveň M často stačí. Úroveň L by měl být vyhrazen pro situace, kdy velikost kódu je kriticky omezena a můžete zaručit nedotčené podmínky.'],
    },
    {
      heading: 'Kritická tichá zóna',
      paragraphs: ['Tichá zóna je prázdná oblast kolem každého QR kódu. Skenery používají tuto hranici k určení, kde začíná a končí kód. Norma ISO specifikuje minimální tichou zónu čtyř modulů (čtyřnásobek šířky nejmenšího čtverce kódu). Porušování tohoto prostoru - s konstrukčními prvky, hranami střihu nebo přilehlým obsahem - je jednou z nejčastějších příčin selhání skenování.', 'ANQR je klidné zóny prosazování pomáhá udržovat tuto kritickou mezeru, ale musíte také zajistit, že je zachován ve svých posledních návrzích. Při předávání uměleckých děl QR výslovně uveďte požadavky tiché zóny. Při umísťování kódů do rozložení, ověřte, že žádné prvky zasahovat do tohoto prostoru. Pár milimetrů jasného prostoru může znamenat rozdíl mezi spolehlivým skenováním a frustrovanými zákazníky.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Schéma ukazující správné tiché rozestupy zóny proti běžným poruchám, které způsobují selhání skenování',
          caption: 'Požadavky tiché zóny: neviditelný okraj, který určuje úspěch skenování',
        },
      ],
    },
    {
      heading: 'Bezpečnost kontrastu a barvy',
      paragraphs: ['QR skenery detekují vzor světelných a tmavých modulů. Jakýkoliv styl, který snižuje tento kontrast - lehké popředí, tmavé pozadí, gradient efekty, nebo low-opacity překryvy - dělá kód těžší číst. ANQR počítá kontrastní poměr a varuje, když vaše barevné volby se blíží nebezpečné úrovně, ale konečný rozhodčí je vždy reálný svět testování.', 'Barevné vnímání se liší světelnými podmínkami. Barevná kombinace, která se na monitoru objeví s vysokým kontrastem, může být obtížně rozlišitelná za teplého žáruvzdorného osvětlení nebo chladných zářivek. Pokud bude váš kód použit v různých světelných podmínkách, otestujte pod více světelnými zdroji a považujte konzervativnější kontrastní poměr za bezpečnostní rezervu.'],
    },
    {
      heading: 'Velikost modulu a sledovací vzdálenost',
      paragraphs: ['Fyzická velikost jednotlivých modulů určuje maximální vzdálenost, od které lze kód naskenovat. Menší moduly znamenají menší kódy, ale vyžadují bližší vzdálenosti. Obecným pravidlem je, že každý modul by měl být v zamýšlené vzdálenosti snímání nejméně 0,5 mm, a měl by být rovnoměrně zmenšen pro větší vzdálenosti. Kód na billboardu potřebuje mnohem větší moduly než kód na vizitce.', 'Při výpočtu velikosti modulu zvažte scénář pro nejhorší případ: zákazník se starším telefonem, v nedokonalém osvětlení, skenuje v maximální možné vzdálenosti. Design pro tohoto uživatele, a všichni ostatní budou mít ještě lepší zkušenosti. Doporučení ANQR v těchto reálných proměnných naznačují vhodné rozměry pro zamýšlené použití.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Graf týkající se velikosti modulu, rozměrů tisku a maximální efektivní vzdálenosti skenování',
          caption: 'Průvodce vzdáleností: odpovídající velikost modulu dle vašich požadavků na nasazení',
        },
      ],
    },
    {
      heading: 'Použití ANQR bezpečnostního režimu',
      paragraphs: ['Bezpečnostní režim ANQR poskytuje zpětnou vazbu o spolehlivosti skenování v reálném čase. Monitoruje kontrastní poměry, dodržování klidných zón, intenzitu překrytí a další faktory, které ovlivňují scannability. Když se nějaký parametr blíží k rizikové úrovni, uvidíte varování se specifickými pokyny, jak zlepšit spolehlivost. Pro profesionální nasazení, kde je selhání nákladné, udržujte bezpečnostní režim aktivní během celého procesu návrhu.', 'Safety Mode také obsahuje funkci kontroly skenování, která se snaží dekódovat váš generovaný kód a hlásí úspěch nebo selhání. Zatímco toto ověření v aplikacích nemůže replikovat všechny podmínky reálného světa, zachycuje mnoho běžných problémů, než investujete do tisku nebo distribuce. Zacházet s úspěšným ověřováním jako s minimálním měřítkem, nikoli se zárukou - testování reálného světa zůstává nezbytné.'],
    },
    {
      heading: 'Real- World Testing protokoly',
      paragraphs: ['Žádné množství ověření softwaru nenahrazuje fyzické testování. Vytiskněte svůj kód v určené velikosti na reprezentativní materiál. Otestujte jej v aktuálním prostředí nasazení s světelnými podmínkami, které odpovídají skutečnému použití. Skenujte s více zařízeními - nejen váš vlajkový telefon, ale rozpočet Android zařízení, starší iPhony, a jakékoli konkrétní zařízení, které vaše publikum běžně používá.', 'Systematicky dokumentovat vaše testování. Zaznamenejte, která zařízení byla testována, za jakých podmínek, s jakými výsledky. Pokud zadáte kódy ve stupnici, určete kritéria přijatelnosti: možná 95% úspěšnost ve vašem testovacím bazénu zařízení nebo úspěšné skenování do 2 sekund na všech testovaných zařízeních. Tyto normy pomáhají dělat go / no- go rozhodnutí objektivní spíše než doufat v nejlepší.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Komplexní kontrolní seznam zkoušek zahrnující zařízení, podmínky a kritéria přijatelnosti',
          caption: 'Zkušební protokol QR pro nasazení: systematické ověření před závazkem výroby',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Otevři generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Zobrazit příklady QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Zobrazit příklady QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otevřít plnou uživatelskou příručku', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otevři galerii', type: 'gallery' },
  ],
};
