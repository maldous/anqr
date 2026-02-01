import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Učte sa s ANQR',
  description: 'Praktické, obchodné príručky na premenu QR kódov na skutočné marketingové aktíva – nielen funkčné štvorce. Naučte sa, ako inovovať staršie kódy miesta predaja, vytvárať kompatibilné platobné QR označenia, pripravovať exporty pripravené na tlač, bezpečne používať animácie na digitálnych displejoch a zdieľať uzamknuté konfigurácie medzi viacjazyčnými tímami pomocou odkazov ANQR („kotvy").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otvorte generátor', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otvorte celú používateľskú príručku', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Zlepšenie existujúcich QR kampaní',
      paragraphs: ['Väčšina firiem má QR kódy roztrúsené po svojich prevádzkach – na jedálnych lístkoch, stojanoch na pulty, obaloch a propagačných materiáloch. Mnohé z týchto kódov boli vytvorené pred rokmi pomocou základných generátorov, výsledkom čoho sú všeobecné čiernobiele štvorce, ktoré nevzbudzujú dôveru ani nezodpovedajú identite vašej značky. Tento komplexný sprievodca vás prevedie systematickým prístupom k auditu, inovácii a optimalizácii vašej existujúcej infraštruktúry QR bez toho, aby ste narušili cesty zákazníkov, ktoré ste si už vytvorili.', 'Strategická výhoda inovácie namiesto výmeny QR kódov spočíva v zachovaní kontinuity. Vaši zákazníci sa už naučili očakávať určité destinácie, keď naskenujú vaše kódy. Zachovaním identických kódovaných adries URL a zároveň dramatickým zlepšením vizuálnej prezentácie, spoľahlivosti skenovania a zosúladenia značky vytvoríte bezproblémový prechod, ktorý zvýši dôveru bez toho, aby ste museli meniť vašu digitálnu infraštruktúru alebo analytické sledovanie.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Porovnanie vedľa seba zobrazujúce vyblednutý, všeobecný QR kód vedľa modernej značkovej verzie kódujúcej rovnakú adresu URL',
          caption: 'Pred a po: Rovnaká cieľová adresa URL transformovaná z datovaného všeobecného kódu na profesionálne značkové dielo',
        },
      ],
    },
    {
      heading: 'Prečo majú staré QR kódy nízku výkonnosť',
      paragraphs: ['QR kódy vytvorené počas počiatočnej fázy prijatia – najmä počas rokov 2020 – 2021, keď sa podniky ponáhľali s implementáciou bezkontaktných riešení – často trpia niekoľkými kritickými problémami. Nízke nastavenia korekcie chýb spôsobujú, že sú krehké pri tlači na textúrované povrchy alebo pri pohľade pri náročnom osvetlení. Nedostatočné tiché zóny spôsobujú zlyhanie skenovania, keď sú kódy umiestnené v blízkosti iných vizuálnych prvkov. Všeobecný štýl nedokáže komunikovať legitimitu značky, čo vedie k váhaniu a zníženiu miery skenovania.', 'Okrem technických obmedzení staré kódy často predstavujú premeškané príležitosti na budovanie značky. Každý QR kód je kontaktným bodom s vaším zákazníkom – okamihom, keď sú aktívne zapojení a ochotní konať. Profesionálne navrhnutý kód, ktorý ladí s farbami vašej značky, zahŕňa primerané bezpečnostné rozpätia a obsahuje voliteľné prvky značky, premieňa túto pomôcku na marketingové aktívum, ktoré posilňuje vašu identitu pri každej interakcii.'],
    },
    {
      heading: 'Vykonanie auditu QR kódu',
      paragraphs: ['Začnite svoj projekt inovácie vytvorením komplexného inventára každého QR kódu aktuálne nasadeného vo vašej firme. Zdokumentujte fyzické umiestnenie, zakódovaný cieľ, aktuálny stav tlačeného materiálu a typické prostredie skenovania vrátane svetelných podmienok a pozorovacích uhlov. Otestujte každý kód na viacerých zariadeniach – staršie smartfóny a lacné zariadenia často odhalia problémy so spoľahlivosťou, ktoré prémiové telefóny maskujú.', 'Venujte zvláštnu pozornosť kódom na miestach s vysokým podielom: platobné miesta, check-in oblasti a propagačné displeje, kde zlyhanie skenovania priamo ovplyvňuje výnosy alebo skúsenosti zákazníkov. Tie by mali byť uprednostňované pre okamžitú aktualizáciu. Všimnite si aj kódy, ktoré sa objavujú na fotografiách alebo videách, pretože si vyžadujú koordináciu s vaším marketingovým tímom na aktualizáciu vizuálnych aktív.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Rozhranie kontrolného zoznamu zobrazujúce kategórie QR auditu: umiestnenie, stav, spoľahlivosť skenovania a hodnotenie priority',
          caption: 'Šablóna systematického auditu QR na zdokumentovanie a stanovenie priorít vašich kandidátov na upgrade',
        },
      ],
    },
    {
      heading: 'Stratégia bezpečného upgradu',
      paragraphs: ['Základným pravidlom upgradov QR je zachovanie cieľa. Extrahujte presnú adresu URL z každého existujúceho kódu a zakódujte ju identicky vo svojej novej verzii. To zaisťuje, že všetky existujúce analýzy, logika presmerovania a očakávania zákazníkov zostanú nedotknuté. Ak potrebujete flexibilitu cieľa pre budúce aktualizácie, toto je ideálny čas na zavedenie značkovej krátkej adresy URL alebo služby presmerovania – implementujte to však ako samostatný projekt, aby ste sa vyhli zloženým zmenám.', 'Pri vizuálnej inovácii použite vylepšenia vo vrstvách: najskôr zaistite technickú spoľahlivosť (vhodná korekcia chýb a tichá zóna), potom pridajte štýl značky (farby, tvary modulov) a nakoniec zvážte voliteľné vylepšenia (stredové prekrytia, rámy). Každá vrstva by mala byť pred pokračovaním overená testovaním. Bezpečný režim ANQR pomáha presadzovať tieto priority varovaním, keď by výber štýlu mohol ohroziť skenovateľnosť.'],
    },
    {
      heading: 'Pridanie identity značky bez ohrozenia spoľahlivosti',
      paragraphs: ['Efektívna značka QR vyvažuje vizuálny vplyv a spoľahlivosť skenovania. Začnite farbou: nahraďte predvolené čierne popredie farbou svojej primárnej značky, čím sa zabezpečí dostatočný kontrast voči vášmu pozadiu. Pre väčšinu značiek najlepšie fungujú tmavé farby na svetlom pozadí. Vyhnite sa kombináciám s nízkym kontrastom, prechodom, ktoré znižujú čistotu okrajov, alebo farbám, ktoré vyzerajú podobne za bežných svetelných podmienok.', 'Prispôsobenie tvaru modulu ponúka ďalšiu príležitosť na budovanie značky s minimálnym vplyvom na spoľahlivosť. Zaoblené moduly vytvárajú jemnejší a prístupnejší vzhľad pri zachovaní vynikajúcej skenovateľnosti. Moduly v štýle bodky fungujú dobre pre moderné, technicky vyspelé značky. Prepojené moduly vyhovujú priemyselným alebo korporátnym identitám. Bez ohľadu na to, aký štýl si vyberiete, udržujte konzistentnosť vo všetkých nasadeniach QR, aby ste okamžite rozpoznali značku.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Diagram farebného kolieska zobrazujúci optimálne kombinácie farieb QR s indikátormi kontrastného pomeru',
          caption: 'Sprievodca výberom farieb značky zobrazujúci kombinácie s vysokým kontrastom, ktoré zachovávajú spoľahlivosť skenovania',
        },
      ],
    },
    {
      heading: 'Protokol testovania a overovania',
      paragraphs: ['Nikdy nenasadzujte inovované QR kódy bez prísneho testovania. Vytlačte fyzický dôkaz v presnej veľkosti a na rovnaký materiál ako vaše konečné nasadenie. Testujte na skutočnom mieste, kde bude kód žiť, v rôznych časoch dňa, aby ste zohľadnili zmeny osvetlenia. Používajte aspoň tri rôzne zariadenia: aktuálny vlajkový telefón, zariadenie strednej triedy a starší alebo lacný smartfón.', 'Zaznamenajte časy skenovania a úspešnosť každého testu. Dobre optimalizovaný kód by mal na akomkoľvek primerane modernom zariadení naskenovať do 1-2 sekúnd. Ak pozorujete konzistentné oneskorenia alebo zlyhania, znížte intenzitu úpravy – odstráňte alebo zmenšite prekrytia, zväčšite veľkosť tichej zóny alebo prepnite na vyššiu úroveň opravy chýb. Spoľahlivosť má vždy prednosť pred vizuálnou prepracovanosťou.'],
    },
    {
      heading: 'Uzamknutie konfigurácie pre konzistentnosť',
      paragraphs: ['Po overení optimálnej konfigurácie ju zachovajte pomocou odkazov ANQR na zdieľanie. Tým sa vytvorí trvalý záznam každého nastavenia použitého na generovanie vášho schváleného kódu – farby, štýl modulu, oprava chýb, veľkosť a akékoľvek prekrytia. Zdieľajte tento odkaz so svojím dizajnérskym tímom, dodávateľmi tlače a každým, kto by mohol v budúcnosti potrebovať reprodukovať kód.', 'Tento konfiguračný zámok zabraňuje postupnej degradácii, ktorá sužuje mnohé nasadenia QR. Bez toho môžu zamestnanci znova vytvárať kódy zo snímok obrazovky, dizajnéri prestavujú nastavenia z pamäte a dodávatelia tlače robia „užitočné" úpravy. Každá variácia prináša potenciálne problémy. S uzamknutým konfiguračným odkazom je každá reprodukcia identická s vaším testovaným, schváleným originálom.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Diagram znázorňujúci posun konfigurácie: snímky obrazovky vedúce k rekreáciám vedúcim k variantom oproti jedinému odkazu na zdroj pravdy',
          caption: 'Zabráňte posunu konfigurácie vytvorením jediného autoritatívneho zdroja pre všetky reprodukcie QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Pozrite si príklady QR kódu',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR kódy pre maloobchodné platby',
      paragraphs: ['Platobné QR kódy fungujú v najnáročnejšom prostredí maloobchodu: v momente transakcie. Zákazníci sú pripravení zaplatiť, často sa za nimi tvorí rad a každá sekunda meškania vytvára trenie. Napriek tomu je tento moment vysokého tlaku tiež hlavným priestorom pre posilnenie značky. Táto príručka vysvetľuje, ako vytvoriť platobné QR kódy, ktoré sa okamžite naskenujú v bankových aplikáciách a zároveň budú mať profesionálny vzhľad značky, ktorý buduje dôveru zákazníkov.', 'Základným princípom pre platobné QR kódy je spoľahlivosť pred estetikou. Krásne navrhnutý kód, ktorý sa nepodarí naskenovať v bankovej aplikácii jedného zákazníka, vás bude stáť oveľa viac pri opustených transakciách a frustrovaných zákazníkoch, než by kedy mohol konzervatívny dizajn. Začnite s dodržiavaním pravidiel, pridajte spoľahlivosť a potom opatrne vrstvite značku len tam, kde to neohrozuje primárnu funkciu.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Displej maloobchodného pultu zobrazujúci platobný QR kód snímaný smartfónom s bankovou aplikáciou',
          caption: 'Platobné QR kódy musia okamžite fungovať s aplikáciami pre bankovníctvo a peňaženku za podmienok v reálnom svete',
        },
      ],
    },
    {
      heading: 'Pochopenie štandardov QR platieb',
      paragraphs: ['Platobné QR kódy sa zvyčajne riadia regionálnymi štandardmi, ktoré určujú formát užitočného zaťaženia. V Singapure používa PayNow QR špecifické formátovanie. V Indii sa kódy UPI riadia štandardmi priamych odkazov BharatQR alebo UPI. Európske SEPA platby používajú EPC QR kódy. Každý štandard existuje, aby sa zabezpečilo, že bankové aplikácie dokážu okamžite rozpoznať a spracovať informácie o platbe. Odchýlenie sa od týchto štandardov – aj keď len nepatrné – môže spôsobiť, že platobné aplikácie odmietnu kódy, ktoré bez problémov čítajú všeobecné skenery kamier.', 'ANQR obsahuje šablóny pre hlavné platobné štandardy, ktoré automaticky naformátujú vaše obchodné údaje do kompatibilného užitočného zaťaženia. Vždy používajte tieto šablóny namiesto manuálneho vytvárania platobných reťazcov, pretože aj menšie chyby formátovania môžu spôsobiť zlyhanie transakcie. Ak štandard platieb vo vašom regióne nie je k dispozícii ako šablóna, presné požiadavky na formát nájdete v technickej dokumentácii poskytovateľa platieb.'],
    },
    {
      heading: 'Veľkosť a umiestnenie displejov počítadiel',
      paragraphs: ['Pultové QR kódy čelia jedinečným fyzickým výzvam. Zákazníci skenujú na dĺžku paže, často pod uhlom, niekedy cez kýchadlá alebo vitríny. Horné osvetlenie vytvára oslňujúce škvrny. Kód súťaží s iným neporiadkom na pultoch o pozornosť a jasné línie. Veľkoryso upravte veľkosť QR platby – pre väčšinu aplikácií na pultoch sa odporúča minimálne 4-5 cm, pričom ak je kód umiestnený za sklom alebo v slabo osvetlenom priestore, zväčšite ho.', 'Na polohe záleží rovnako ako na veľkosti. Umiestnite kód tam, kde môžu zákazníci pohodlne držať svoj telefón bez toho, aby blokovali rad alebo nemotorne siahali. Displej radšej nakloňte smerom k zákazníkovi, než ho položte naplocho. Ak je to možné, použite matnú lamináciu alebo nereflexné zobrazovacie materiály, aby ste minimalizovali odlesky z horného osvetlenia. Otestujte konečné umiestnenie v rôznych časoch dňa, aby ste zachytili problémy s osvetlením.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Diagram zobrazujúci optimálne výšky a uhly umiestnenia QR pre rôzne konfigurácie počítadiel',
          caption: 'Sprievodca umiestnením pultu: optimálne výšky, uhly a vzdialenosti pre spoľahlivé skenovanie platieb',
        },
      ],
    },
    {
      heading: 'Konzervatívny branding pre platobné kódy',
      paragraphs: ['Platobné aplikácie sú menej zhovievavé ako bežné kamerové skenery. Mnoho bankových aplikácií používa staršie a jednoduchšie algoritmy na čítanie QR kódov, ktoré sú optimalizované skôr na rýchlosť než na flexibilitu. To znamená, že štýl, ktorý dokonale funguje s fotoaparátom telefónu, môže zlyhať v konkrétnych platobných aplikáciách. Udržujte značku konzervatívnou: použite farbu značky pre popredie, ak si zachováva silný kontrast, ale vyhnite sa prechodom, silným prekrytiam alebo dekoratívnym prvkom, ktoré by mohli prekážať pri rozpoznávaní.', 'Ak chcete stredové logo alebo prekrytie, nechajte ho extrémne malé – nie viac ako 10 – 15 % plochy QR – a dôkladne ho otestujte s každou platobnou aplikáciou, ktorú môžu vaši zákazníci používať. Mnohé firmy sa rozhodnú, že konkrétne platobné kódy nebudú prekrývať a tento štýl si vyhradzujú na marketingové QR kódy, kde sú požiadavky na spoľahlivosť menej prísne. Úlohou platobného kódu je spracovávať transakcie, nie zapôsobiť vizuálne.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Porovnanie zobrazujúce prijateľné a rizikové úrovne značky pre platobné QR kódy',
          caption: 'Platobné QR branding spektrum: od bezpečného konzervatívneho štýlu až po riskantné dekoratívne prístupy',
        },
      ],
    },
    {
      heading: 'Úvahy o materiáli a tlači',
      paragraphs: ['Fyzický zobrazovací materiál výrazne ovplyvňuje spoľahlivosť skenovania. Lesklá laminácia odráža horné svetlá priamo do kamery zákazníka. Textúrované materiály môžu deformovať okraje modulu. Lacná tlač môže rozmazať jemné detaily. Pri platobných QR kódoch investujte do kvality: používajte matnú alebo saténovú lamináciu, zaistite tlač s vysokým rozlíšením a vymeňte displeje skôr, ako začnú vykazovať opotrebovanie. Poškriabaný alebo vyblednutý platobný kód vás stojí transakcie.', 'Zvážte odolnosť a vymeniteľnosť displeja. Displeje počítadla sa dotýkajú, posúvajú, striekajú a občas sa prevrátia. Navrhnite svoj zobrazovací systém tak, aby sa vložka QR dala jednoducho vymeniť bez výmeny celého stojana. Majte pripravené náhradné výtlačky generované z vášho uzamknutého konfiguračného odkazu, takže opotrebované kódy je možné okamžite vymeniť.'],
    },
    {
      heading: 'Testovanie s aplikáciami Real Payment Apps',
      paragraphs: ['Generické skenery fotoaparátov dekódujú takmer každý primerane naformátovaný QR kód. Platobné aplikácie sú vyberavejšie. Pred nasadením akéhokoľvek platobného QR kódu ho otestujte v každej platobnej aplikácii, ktorú môžu vaši zákazníci používať. V prostrediach s viacerými platbami to môže znamenať testovanie s viacerými bankovými aplikáciami, digitálnymi peňaženkami a platobnými platformami. Zdokumentujte, ktoré aplikácie ste testovali a ich verzie – platobné aplikácie sa často aktualizujú a aktualizácia môže zmeniť správanie pri skenovaní.', 'Test v reálnych podmienkach: skutočné zobrazenie, skutočné osvetlenie, skutočná vzdialenosť snímania. Kód, ktorý okamžite naskenuje na vašom stole, môže mať problémy na pulte o 17:00, keď popoludňajšie slnko vytvára odlesky. Otestujte sa s najstarším a najlacnejším smartfónom, aký nájdete – ak spoľahlivo funguje na lacnom zariadení, bude fungovať na všetkom. Označte akýkoľvek čas skenovania dlhší ako 2 sekundy na vyšetrenie a prípadnú zmenu dizajnu.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Kontrolný zoznam testovania zobrazujúci rôzne platobné aplikácie, typy zariadení a podmienky prostredia na overenie',
          caption: 'Komplexná platobná QR testovacia matica pokrývajúca aplikácie, zariadenia a faktory prostredia',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Pozrite si príklady QR kódu',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'QR kódy pripravené na tlač: SVG vs PNG',
      paragraphs: ['Rozdiel medzi QR kódom, ktorý sa perfektne naskenuje, a kódom, ktorý zlyhá, často spočíva v tom, ako bol exportovaný a ako sa s ním zaobchádzalo v rámci pracovného postupu tlače. Táto príručka vysvetľuje kritické rozdiely medzi vektorovými (SVG) a rastrovými (PNG) formátmi, kedy ich použiť a ako odovzdať kresby QR dizajnérom a predajcom tlače spôsobom, ktorý zachová spoľahlivosť skenovania od vizitiek až po nápisy vo veľkosti billboardov.', 'Produkcia tlače prináša premenné, ktoré na obrazovke neexistujú: rozloženie atramentu, textúra substrátu, dokončovacie procesy a kumulatívny efekt konverzií viacerých súborov. QR kód, ktorý vyzerá perfektne vo vašom dizajnovom softvéri, môže vyjsť z tlačiarne so zmäkčenými okrajmi, zníženým kontrastom alebo jemne zdeformovanými modulmi. Pochopenie výberu formátu a osvedčených postupov pracovného toku predchádza týmto tichým zlyhaniam.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Zväčšené zobrazenie porovnávajúce vektorové QR moduly s ostrými okrajmi oproti rastrovým modulom zobrazujúcim pixelové artefakty',
          caption: 'Vektor verzus raster v mierke tlače: rozdiel v presnosti, ktorý určuje spoľahlivosť skenovania',
        },
      ],
    },
    {
      heading: 'Prečo je pre tlač preferovaný vektor (SVG)',
      paragraphs: ['Súbory SVG popisujú kódy QR ako matematické tvary a nie ako mriežky pixelov. To znamená, že kód možno zmenšiť na akúkoľvek veľkosť – od 1 cm štítku až po 10-metrový banner – bez straty ostrosti hrán. RIP (Raster Image Processor) tlačiarne vykresľuje vektory v natívnom rozlíšení výstupného zariadenia, čím zabezpečuje, že každý okraj modulu je taký ostrý, ako to hardvér umožňuje. Neexistuje žiadna interpolácia, žiadne antialiasingové artefakty, žiadne nahromadené rozmazanie z viacerých operácií zmeny veľkosti.', 'Okrem škálovateľnosti sú súbory SVG robustnejšie v profesionálnych pracovných postupoch. Prežijú spiatočné cesty prostredníctvom návrhového softvéru bez degradácie. Môžu byť farebne korigované bez prevzorkovania. Čisto sa vkladajú do súborov PDF pre výstup pripravený na tlač. Pre každú tlačovú aplikáciu, kde záleží na kvalite, by mal byť SVG váš predvolený formát exportu.'],
    },
    {
      heading: 'Keď je PNG prijateľný',
      paragraphs: ['PNG sa stáva nevyhnutným, keď váš pracovný postup alebo cieľová platforma nepodporuje vektorové formáty. Niektoré webové platformy, signage CMS systémy a staré tlačové pracovné postupy vyžadujú rastrové obrázky. V týchto prípadoch môže PNG fungovať dobre – ale len za predpokladu, že dodržíte prísne pravidlá: exportujte v konečnej fyzickej veľkosti a rozlíšení, po exporte sa nikdy nezväčšujte a vyhýbajte sa akejkoľvek stratovej kompresii alebo konverzii formátu.', 'Kritickým pravidlom pre PNG je vypočítať požadované rozmery pixelov pred exportom. Ak sa váš QR kód vytlačí na 5 cm a vaša tlačiareň pracuje s rozlíšením 300 DPI, potrebujete približne 590 pixelov. Exportujte v tejto alebo väčšej veľkosti a potom v prípade potreby zmenšite – nikdy nezvyšujte. Zahrňte tieto informácie do svojho súboru alebo metadát, aby budúci používatelia náhodne nezneužili export špecifický pre veľkosť.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Rozhranie kalkulačky zobrazujúce vzťah medzi fyzickou veľkosťou, DPI a požadovanými rozmermi pixelov',
          caption: 'Kalkulačka rozlíšenia tlače: určenie minimálnych rozmerov v pixeloch pre vašu cieľovú výstupnú veľkosť',
        },
      ],
    },
    {
      heading: 'Vysvetlenie možností exportu ANQR',
      paragraphs: ['ANQR ponúka niekoľko režimov exportu SVG, ktoré vyhovujú rôznym pracovným tokom. Režim True Vector vytvára čistý výstup založený na dráhe, ktorý je ideálny pre tlač a profesionálne dizajnérske nástroje. Keď pridáte rastrové prekrytia alebo určité efekty, ANQR ich môže vložiť pri zachovaní vektorových modulov, alebo môžete exportovať plne rastrovanú verziu vo vami špecifikovanom rozlíšení. Pochopenie týchto možností vám pomôže vybrať správny export pre každý prípad použitia.', 'Pre exporty PNG vám ANQR umožňuje špecifikovať presné rozmery a obsahuje možnosti pre priehľadné pozadie. Nastavenie DPI vám pomôže vypočítať vhodné veľkosti pre tlač, nezabudnite však, že DPI sú metadáta – pre tlač je dôležité mať dostatok pixelov pre vašu fyzickú veľkosť. Ak máte pochybnosti, exportujte väčšie množstvo, ako si myslíte, že potrebujete; zmenšovanie zachováva kvalitu, zatiaľ čo škálovanie ju ničí.'],
    },
    {
      heading: 'Príprava súborov na odovzdanie',
      paragraphs: ['Pri odovzdávaní kresby QR dizajnérom alebo predajcom tlače uveďte jasné špecifikácie: zamýšľanú fyzickú veľkosť, minimálne požiadavky na tichú zónu a akékoľvek úvahy o farebnom priestore. Pre kritické aplikácie poskytnite hlavnú SVG aj zálohu PNG s vysokým rozlíšením, jasne označenú ich zamýšľaným použitím. Zahrňte svoj odkaz na konfiguráciu ANQR, aby bolo možné kód v prípade potreby znova vygenerovať.', 'Predvídajte bežné chyby v procese odovzdávania. Explicitne uveďte, že QR by sa nemalo zmenšovať, otáčať, skresľovať ani naň používať efekty. Špecifikujte, že tichá zóna musí zostať voľná – žiadne orezové značky, registračné značky alebo dizajnové prvky nezasahujú. Ak bude QR umiestnený na farebnom alebo fotografickom pozadí, poskytnite verziu s nepriehľadným tvarom podkladu, aby sa zabezpečil primeraný kontrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Diagram balíka súborov zobrazujúci hlavný súbor SVG, zálohu PNG, dokument so špecifikáciami a odkaz na konfiguráciu',
          caption: 'Profesionálny QR balík na odovzdanie: všetko, čo dizajnér alebo predajca tlače potrebuje na presnú reprodukciu',
        },
      ],
    },
    {
      heading: 'Overovanie nátlačkov',
      paragraphs: ['Nikdy neschvaľujte tlač bez naskenovania fyzického nátlačku. Vyžiadajte si nátlačok vytlačený na skutočnom substráte so skutočnou povrchovou úpravou, ktorá sa použije pri výrobe. Naskenujte nátlačok za svetelných podmienok podobných tým, kde bude zobrazený konečný kus. Testujte s viacerými zariadeniami vrátane starších smartfónov, ktoré môžu mať problémy s okrajovou kvalitou.', 'Ak sa dôkaz skenuje pomaly alebo nekonzistentne, pred schválením ho preskúmajte. Bežné problémy zahŕňajú nedostatočný kontrast na farebných substrátoch, narušenie tichej zóny orezaním, okraje modulu na zmäkčenie roztieraného atramentu alebo laminácia spôsobujúca odlesky. Ktorúkoľvek z nich je možné riešiť skôr, ako sa zaviažete k úplnému vytlačeniu – ale iba ak ich zachytíte vo fáze nátlačku.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Kontrolný zoznam kontroly s výsledkami skenovacieho testu, meraniami kontrastu a schvaľovacími podpismi',
          caption: 'Pracovný postup overovania tlače: systematické testovanie pred zaviazaním sa na výrobné množstvá',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Pozrite si príklady QR kódu',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Vytváranie animovaných QR kódov',
      paragraphs: ['Animované QR kódy kombinujú funkčnosť štandardných QR kódov s pútavým pohybom, ktorý dramaticky zvyšuje mieru zapojenia. V oblasti digital signage, sociálnych médií a interaktívnych displejov premieňa animácia statický nástroj na pôsobivý vizuálny prvok, ktorý priťahuje pozornosť a vyzýva k interakcii. Táto príručka obsahuje princípy, techniky a praktické obmedzenia vytvárania animovaných QR kódov, ktoré spoľahlivo skenujú a zároveň poskytujú vizuálny dojem.', 'Základnou výzvou animovaných QR kódov je vyváženie vizuálneho záujmu a spoľahlivosti skenovania. Každý snímok musí byť samostatne skenovateľný - skener môže zachytiť kód v ktoromkoľvek bode cyklu animácie. Toto obmedzenie ovplyvňuje každé rozhodnutie o dizajne: ktoré prvky sa môžu pohybovať, ako veľmi sa môžu meniť a čo musí zostať stabilné počas animácie.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Digital signage displej zobrazujúci animovaný QR kód, ktorý upúta pozornosť diváka vo verejnom priestore',
          caption: 'Animované QR kódy v digital signage: pohyb, ktorý priťahuje pozornosť a podporuje skenovanie',
        },
      ],
    },
    {
      heading: 'Ako animácia ovplyvňuje skenovateľnosť',
      paragraphs: ['QR skenery fungujú tak, že zachytia jeden snímok a analyzujú vzor svetlých a tmavých modulov. Aby animovaný kód fungoval, musí každý rámec obsahovať úplný a platný vzor QR. To vylučuje animácie, ktoré menia štruktúru kódu, rozpúšťajú moduly alebo výrazne menia kontrastný vzor. Moduly nesúce údaje - zdanlivo náhodný vzor v strede - musia zostať vizuálne stabilné.', 'Bezpečné animačné prístupy upravujú prvky, ktoré nenesú údaje: pozadia, farby, ozdobné rámy a prekrývajúce prvky. Štrukturálne komponenty - vyhľadávacie vzory (veľké rohové štvorce), časové vzory (striedajúce sa čiary) a zarovnávacie vzory (menšie štvorce vo väčších kódoch) - si musia zachovať svoju polohu a proporcie. Práca v rámci týchto obmedzení stále umožňuje prekvapivo dynamické a pútavé animácie.'],
    },
    {
      heading: 'Animačné techniky, ktoré fungujú',
      paragraphs: ['Cyklovanie farieb oživuje farby popredia a pozadia prostredníctvom palety pri zachovaní dostatočného kontrastu na každom kroku. To vytvára živý, pozornosť priťahujúci efekt s minimálnym rizikom skenovania – pokiaľ kontrast nikdy neklesne pod čitateľnú úroveň. Predvoľby farebného cyklu ANQR sú navrhnuté tak, aby zachovali skenovateľnosť počas celého cyklu.', 'Animované prekrytia umiestňujú pohyblivé snímky za polopriehľadný vzor QR. Kód zostáva stabilný, kým sa pozadie animuje – napríklad cyklické video, animované prvky značky alebo abstraktná pohyblivá grafika. Táto technika si vyžaduje starostlivé riadenie intenzity, aby sa zabránilo tomu, že pozadie prehluší vzor QR, ale vytvára vizuálne najvýraznejšie výsledky.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Diagram zobrazujúci vrstvenú štruktúru animovaného QR: vrstva stabilného kódu cez vrstvu animovaného pozadia',
          caption: 'Princíp vrstvenia animácie: vzor QR zostáva konštantný, zatiaľ čo prvky pozadia sa pod ním animujú',
        },
      ],
    },
    {
      heading: 'Konfigurácia parametrov animácie',
      paragraphs: ['Snímková frekvencia ovplyvňuje vizuálnu plynulosť aj veľkosť súboru. Vo väčšine aplikácií poskytuje 10-15 snímok za sekundu plynulý pohyb bez nadmernej veľkosti súborov. Vyššie obnovovacie frekvencie ponúkajú zníženú vizuálnu návratnosť a zároveň výrazne zvyšujú veľkosť súborov. Zvážte kontext doručovania – veľký digitálny znak dokáže spracovať väčšie súbory ako umiestnenie mobilnej reklamy.', 'Správanie slučky určuje, ako sa animácia cykluje. Bezšvové slučky vytvárajú nepretržitý pohyb ideálny pre značenie a okolité displeje. Ping-pongové slučky (dopredu a potom dozadu) fungujú dobre pre jednoduché animácie. Pre impulzy, ktoré upútajú pozornosť, zvážte animácie s držaním – obdobiami ticha prerušovanými pohybom, ktorý priťahuje oko bez neustálej únavy z pohybu.'],
    },
    {
      heading: 'Vytváranie animovaných prekrytí',
      paragraphs: ['Pri použití animovaných obrázkov (GIF, animovaných WebP alebo videa) ako prekrytia, ANQR extrahuje snímky a zloží ich s vaším QR kódom. Nastavenie intenzity prekrytia riadi, ako veľká časť animácie presvitá – nižšie hodnoty uprednostňujú skenovateľnosť, zatiaľ čo vyššie hodnoty uprednostňujú vizuálny dojem. Otestujte si zvolenú intenzitu vo viacerých snímkach, aby ste zaistili konzistentnú skenovateľnosť.', 'Kvalita zdrojového materiálu výrazne ovplyvňuje výsledky. Použite prekrytia s jasnými objektmi a dobrým kontrastom. Vyhnite sa zdrojovým animáciám s rýchlym blikaním alebo extrémnymi zmenami jasu, ktoré by mohli občas vytvárať snímky s nízkym kontrastom. Pred exportom si zobrazte celý cyklus animácie, aby ste zachytili všetky problematické snímky, ktoré by mohli zlyhať pri skenovaní.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Pohľad po jednotlivých snímkach na animované prekrytie zobrazujúce úrovne kontrastu udržiavané v celej sekvencii',
          caption: 'Analýza snímok: overenie konzistentnej skenovateľnosti počas celého cyklu animácie',
        },
      ],
    },
    {
      heading: 'Úvahy o exporte a doručení',
      paragraphs: ['GIF zostáva najrozšírenejším animovaným formátom, ktorý sa vo väčšine kontextov prehráva automaticky bez potreby podpory prehrávača videa. 256-farebná paleta GIF však obmedzuje vernosť farieb. V prípade animácií kritických pre farby zvážte animovaný WebP, ak je podporovaný, alebo sa vráťte k video formátom, aby ste dosiahli najvyššiu kvalitu. Export GIF ANQR zahŕňa možnosti rozkladu na maximalizáciu kvality v rámci obmedzení palety.', 'Veľkosť súboru je dôležitá pre doručenie. Systémy digitálneho značenia, e-mailoví klienti a sociálne platformy často ukladajú obmedzenia veľkosti. Ak vaša animácia prekračuje tieto limity, znížte počet snímok, rozmery alebo farebnú hĺbku. Rozdelenie komplexnej animácie na kratšiu slučku niekedy dosiahne lepšie výsledky ako agresívna kompresia, ktorá degraduje každý snímok.'],
    },
    {
      heading: 'Testovanie animovaných QR kódov',
      paragraphs: ['Testovanie animovaných kódov vyžaduje skenovanie vo viacerých bodoch animačného cyklu. Neskenujte len raz a predpokladajte úspech – skenujte opakovane, v rôznych okamihoch, aby ste si overili, či je každý snímok čitateľný. Venujte zvláštnu pozornosť rámom s extrémnym farebným cyklom alebo vrcholom intenzity prekrytia, kde môže byť kontrast najnižší.', 'Ak je to možné, otestujte na skutočnom hardvéri displeja. Kalibrácia farieb monitora, pozorovací uhol a okolité osvetlenie ovplyvňujú vzhľad a skenovanie animácie. Jasná animácia, ktorá dokonale skenuje váš monitor, sa môže na vonkajšej obrazovke vymazať alebo sa pri šikmých pozorovacích uhloch stane nečitateľnou.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Testovacia matica zobrazujúca mieru úspešnosti skenovania v rôznych snímkach, zariadeniach a podmienkach zobrazenia',
          caption: 'Animovaný testovací protokol QR: systematické overovanie naprieč snímkami, zariadeniami a podmienkami zobrazenia',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Pozrite si príklady QR kódu',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Osvedčené postupy pre bezpečnosť a súlad s QR',
      paragraphs: ['Krásne navrhnutý QR kód, ktorý nedokáže naskenovať, je horší ako zbytočný – frustruje zákazníkov, poškodzuje vnímanie značky a plytvá každým zdrojom investovaným do jeho tvorby a distribúcie. Táto príručka sa zaoberá technickými a praktickými faktormi, ktoré určujú, či sa QR kód spoľahlivo naskenuje, a ako používať bezpečnostné funkcie ANQR na zachytenie potenciálnych problémov skôr, ako sa dostanú do výroby.', 'Spoľahlivosť QR kódu nie je binárna. Kód môže byť dokonale naskenovaný na vlajkových telefónoch, ale zlyhá na lacných zariadeniach. Mohlo by to fungovať pri ideálnom osvetlení, ale bojovať v tmavých reštauráciách alebo jasnom slnečnom svetle. Pochopenie faktorov, ktoré ovplyvňujú skenovateľnosť, vám pomôže urobiť informované kompromisy medzi vizuálnym štýlom a spoľahlivosťou v reálnom svete.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Spektrum spoľahlivosti zobrazujúce QR kódy v rozsahu od vysoko skenovateľných až po okrajovo čitateľné',
          caption: 'Spektrum skenovateľnosti: od nepriestrelných kódov až po štýl, ktorý posúva hranice spoľahlivosti',
        },
      ],
    },
    {
      heading: 'Pochopenie úrovní opravy chýb',
      paragraphs: ['QR kódy obsahujú vstavanú redundanciu, ktorá umožňuje ich čítanie, aj keď sú čiastočne poškodené alebo zakryté. Úroveň korekcie chýb – L (7 %), M (15 %), Q (25 %) alebo H (30 %) – určuje, koľko kódu môže chýbať pri správnom dekódovaní. Vyššia korekcia chýb vytvára väčšie kódy, ale poskytuje bezpečnostnú rezervu pre prekrytia, nedokonalosti tlače a poškodenie životného prostredia.', 'Pre kódy s prekrytím obrázkov je nevyhnutná úroveň opravy chýb H – prekrytie fyzicky zakrýva časť kódu a na udržanie spoľahlivosti potrebujete túto 30 % redundanciu. Pre čisté, neštýlové kódy v kontrolovaných prostrediach často stačí úroveň M. Úroveň L by mala byť vyhradená pre situácie, keď je veľkosť kódu kriticky obmedzená a môžete zaručiť nedotknuté podmienky.'],
    },
    {
      heading: 'Kritická tichá zóna',
      paragraphs: ['Tichá zóna je prázdny okraj obklopujúci každý QR kód. Skenery používajú túto hranicu na identifikáciu, kde sa kód začína a končí. Norma ISO určuje minimálnu tichú zónu štyroch modulov (štyrinásobok šírky najmenšieho štvorca v kóde). Porušenie tohto priestoru – dizajnovými prvkami, okrajmi orezania alebo susedným obsahom – je jednou z najčastejších príčin zlyhania skenovania.', 'Presadzovanie tichej zóny ANQR pomáha udržiavať tento kritický odstup, ale musíte sa tiež uistiť, že je zachovaný vo vašich konečných návrhoch. Pri odovzdávaní umeleckých diel QR výslovne špecifikujte požiadavky na pokojnú zónu. Pri umiestňovaní kódov do rozložení skontrolujte, či do tohto priestoru nezasahujú žiadne prvky. Niekoľko milimetrov voľného priestoru môže znamenať rozdiel medzi spoľahlivým skenovaním a frustrovanými zákazníkmi.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Diagram znázorňujúci správne rozostupy tichých zón oproti bežným porušeniam, ktoré spôsobujú zlyhania skenovania',
          caption: 'Požiadavky na tichú zónu: neviditeľná rezerva, ktorá určuje úspešnosť skenovania',
        },
      ],
    },
    {
      heading: 'Bezpečnosť farieb a kontrastu',
      paragraphs: ['QR skenery detegujú vzor svetlých a tmavých modulov. Akýkoľvek štýl, ktorý znižuje tento kontrast – svetlé popredie, tmavé pozadie, efekty prechodu alebo prekrytia s nízkou nepriehľadnosťou – sťažuje čítanie kódu. ANQR vypočítava kontrastné pomery a varuje, keď sa váš výber farieb priblíži k nebezpečným úrovniam, ale konečným rozhodcom je vždy testovanie v reálnom svete.', 'Vnímanie farieb sa mení podľa svetelných podmienok. Farebnú kombináciu, ktorá sa na vašom monitore javí ako vysoko kontrastná, môže byť ťažké rozlíšiť pri teplom osvetlení žiarovkami alebo studenými žiarivkami. Ak bude váš kód nasadený v rôznych svetelných podmienkach, otestujte ho pod viacerými zdrojmi svetla a zvážte konzervatívnejšie kontrastné pomery ako bezpečnostnú rezervu.'],
    },
    {
      heading: 'Veľkosť modulu a pozorovacia vzdialenosť',
      paragraphs: ['Fyzická veľkosť jednotlivých modulov určuje maximálnu vzdialenosť, z ktorej je možné kód nasnímať. Menšie moduly znamenajú menšie kódy, ale vyžadujú menšiu vzdialenosť snímania. Všeobecným pravidlom je, že každý modul by mal byť aspoň 0,5 mm v zamýšľanej vzdialenosti snímania, pričom sa úmerne zväčšuje na väčšie vzdialenosti. Kód na billboarde potrebuje oveľa väčšie moduly ako kód na vizitke.', 'Pri výpočte veľkosti modulu zvážte najhorší možný scenár: zákazník so starším telefónom, pri nedokonalom osvetlení, skenovanie na maximálnu pravdepodobnú vzdialenosť. Dizajn pre tohto používateľa a všetci ostatní budú mať ešte lepší zážitok. Odporúčania veľkosti ANQR zohľadňujú tieto premenné v reálnom svete, aby navrhli vhodné rozmery pre zamýšľané použitie.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Tabuľka týkajúca sa veľkosti modulu, rozmerov tlače a maximálnej efektívnej vzdialenosti skenovania',
          caption: 'Sprievodca vzdialenosťou skenovania: prispôsobenie veľkosti modulu vašim požiadavkám na nasadenie',
        },
      ],
    },
    {
      heading: 'Používanie bezpečnostného režimu ANQR',
      paragraphs: ['Bezpečnostný režim ANQR poskytuje spätnú väzbu o spoľahlivosti skenovania v reálnom čase. Sleduje kontrastné pomery, súlad tichej zóny, intenzitu prekrytia a ďalšie faktory, ktoré ovplyvňujú skenovateľnosť. Keď sa niektorý parameter priblíži k rizikovým úrovniam, zobrazia sa upozornenia s konkrétnymi pokynmi, ako zlepšiť spoľahlivosť. Pre profesionálne nasadenia, kde je zlyhanie nákladné, nechajte bezpečnostný režim aktívny počas celého procesu návrhu.', 'Bezpečný režim zahŕňa aj funkciu overenia skenovania, ktorá sa pokúša dekódovať vygenerovaný kód a hlási úspech alebo zlyhanie. Aj keď toto overenie v aplikácii nedokáže replikovať všetky skutočné podmienky, zachytáva mnoho bežných problémov ešte predtým, ako investujete do tlače alebo distribúcie. Považujte úspešné overenie za minimálnu hranicu, nie za záruku – testovanie v reálnom svete zostáva nevyhnutné.'],
    },
    {
      heading: 'Testovacie protokoly v reálnom svete',
      paragraphs: ['Žiadne množstvo overovania softvéru nenahrádza fyzické testovanie. Vytlačte svoj kód v zamýšľanej veľkosti na reprezentatívny materiál. Otestujte ho v prostredí skutočného nasadenia so svetelnými podmienkami, ktoré zodpovedajú skutočnému použitiu. Skenujte pomocou viacerých zariadení – nielen vášho vlajkového telefónu, ale aj cenovo dostupných zariadení so systémom Android, starších telefónov iPhone a akýchkoľvek konkrétnych zariadení, ktoré vaše publikum bežne používa.', 'Zdokumentujte svoje testovanie systematicky. Zaznamenajte, ktoré zariadenia boli testované, za akých podmienok a s akými výsledkami. Ak nasadzujete kódy vo veľkom rozsahu, stanovte si kritériá prijatia: možno 95 % úspešnosť v celom testovacom fonde zariadení alebo úspešné skenovanie do 2 sekúnd na všetkých testovaných zariadeniach. Tieto štandardy pomáhajú robiť rozhodnutia typu go/no-go objektívnejšie, než dúfať v to najlepšie.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Komplexný kontrolný zoznam testovania zahŕňajúci zariadenia, podmienky a akceptačné kritériá',
          caption: 'Protokol testovania nasadenia QR: systematické overovanie pred výrobným záväzkom',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Pozrite si príklady QR kódu',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Pozrite si príklady QR kódu', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otvorte celú používateľskú príručku', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otvorte galériu', type: 'gallery' },
  ],
};
