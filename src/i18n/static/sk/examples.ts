import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Príklady ANQR',
  description: 'Päť skutočných príkladov v produkčnom štýle, ktoré ukazujú, kde QR kódy vytvárajú merateľnú hodnotu: pozdvihnutie staršieho maloobchodného pultového kódu, značkové maloobchodné platby a akcie „scan-to", škálovanie tlače od letákov po billboardy, animované QR pre digital signage a medzijazyčná spolupráca pomocou zdieľateľných odkazov Anchor. Každý príklad obsahuje obrázky, praktické obmedzenia a odkaz na remix späť do generátora.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otvorte generátor', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Prechádzať Učiť sa články', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otvorte celú používateľskú príručku', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Prípadová štúdia: Nárast QR v maloobchode',
      paragraphs: ['Tento príklad z reálneho sveta sleduje malú kaviareň, ktorá tri roky používala na pulte rovnaký QR kód. Pôvodný kód bol vygenerovaný rýchlo počas pandémie, vytlačený na štandardný papier a vložený do plastového stojana. Stále to fungovalo - technicky -, ale zákazníci často potrebovali viac pokusov o skenovanie a nepomohlo to nijako posilniť starostlivo vytvorenú identitu značky kaviarne.', 'Transformácia sa začala jednoduchým auditom: existujúci kód zakódoval adresu URL online menu kaviarne, ktorú chceli zachovať. Výzvou bolo, aby sa QR cítil ako súčasť zážitku z kaviarne a nie ako dodatočný nástroj od roku 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Zvetraný QR kód v plastovom stojane s viditeľným opotrebovaním, odtlačkami prstov a vyblednutou potlačou',
          caption: 'Východiskový bod: tri roky prepážky spôsobili, že pôvodný QR bol sotva funkčný',
        },
      ],
    },
    {
      heading: 'Diagnostika problémov pôvodného kódu',
      paragraphs: ['Testovanie odhalilo viacero problémov: pôvodný kód používal opravu chýb L (minimálna redundancia), mal tichú zónu len 2 moduly a bol vytlačený v nízkom rozlíšení. Pod teplým volfrámovým osvetlením kaviarne už vyblednuté čierne moduly sotva kontrastovali so zažltnutým papierom. Staršie telefóny bojovali; novšie telefóny uspeli, ale s výrazným oneskorením.', 'Okrem technických problémov všeobecný čierno-biely štvorec nehovoril nič o značke. Zákazníci váhali pred skenovaním – jemná bariéra dôvery, ktorá obmedzovala interakciu so starostlivo navrhnutým digitálnym menu kaviarne.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnostické prekrytie zobrazujúce technické nedostatky pôvodného QR: nízke ECC, minimálna tichá zóna, slabý kontrast',
          caption: 'Technická analýza odhaľujúca, prečo starý kód nefungoval v reálnych podmienkach',
        },
      ],
    },
    {
      heading: 'Proces pozdvihnutia',
      paragraphs: ['Pomocou ANQR majiteľ kaviarne znovu vytvoril kód s identickou adresou URL menu, ale výrazne zlepšil nastavenia: korekcia chýb H pre maximálnu odolnosť, 6-modulová tichá zóna pre spoľahlivú detekciu hraníc a farby značky (sýto bordové moduly na krémovom pozadí), ktoré ladili s interiérovou paletou kaviarne.', 'Bola pridaná malá stredová vrstva s logom kaviarne – zámerne nenápadná, aby sa zachovala skenovateľnosť a zároveň poskytovalo okamžité rozpoznanie značky. Bezpečný režim potvrdil, že nový dizajn bol pred akoukoľvek tlačou spoľahlivo naskenovaný naprieč testovacími zariadeniami.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Rozhranie ANQR zobrazujúce konfiguráciu: farby značky, vhodné ECC, veľkorysá tichá zóna, jemné prekrytie loga',
          caption: 'Vytvorenie vylepšenej konfigurácie: každé nastavenie je zvolené tak, aby vyvážilo výraz značky a spoľahlivosť skenovania',
        },
      ],
    },
    {
      heading: 'Merateľné výsledky',
      paragraphs: ['Po nasadení nového QR na profesionálne matne laminované karty kaviareň sledovala výsledky počas štyroch týždňov. Úspešnosť skenovania sa zlepšila z odhadovaných 70 % na takmer 100 %. Priemerný čas skenovania klesol z 3-4 sekúnd na menej ako 1 sekundu. Najvýraznejšie je, že zapojenie ponuky sa zvýšilo o 40 % – zákazníci, ktorí sa predtým pozreli na QR a vzdali to, teraz skenovali s istotou.', 'Zamestnanci hlásili menej otázok zákazníkov o tom, „ako používať QR" a žiadne ďalšie prípady manuálneho zadávania adresy URL pre frustrovaných zákazníkov. Značkový vzhľad tiež rozprúdil rozhovory, pričom zákazníci pozitívne komentovali ucelený dizajn.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Porovnanie pred/po s metrikami: úspešnosť skenovania, priemerný čas skenovania a týždenné vylepšenia počtu skenov',
          caption: 'Štyri týždne údajov ukazujúcich merateľný vplyv premysleného zvýšenia QR',
        },
      ],
    },
    {
      heading: 'Znova vytvorte túto konfiguráciu',
      paragraphs: ['Konfigurácia kaviarne demonštruje konzervatívny, ale efektívny branding: Error Correction H, 6-modulová tichá zóna, vysoko kontrastné farby značky a minimálne prekrytie stredu. Táto rovnováha funguje pre väčšinu aplikácií maloobchodných pultov, kde spoľahlivosť musí byť na prvom mieste, ale stále záleží na prítomnosti značky.', 'Otvorte generátor s týmito predinštalovanými nastaveniami a prispôsobte farby a prekrytie svojej vlastnej značke. Kľúčový poznatok: samotné vylepšenia spoľahlivosti môžu dramaticky zvýšiť zapojenie, dokonca aj pred pridaním akéhokoľvek vizuálneho štýlu.', 'Úplnú metodológiu tohto prístupu nájdete v súvisiacej príručke Naučte sa zlepšovať existujúce QR kampane.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Odkaz na generátor vopred nakonfigurovaný s nastaveniami kaviarne pre okamžité prispôsobenie',
          caption: 'Začnite s osvedčenou konfiguráciou a prispôsobte ju svojej značke',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Prechádzať Učiť sa články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Prípadová štúdia: Zobrazenie počítadla viacerých platieb',
      paragraphs: ['Tento príklad sleduje butikový obchod s oblečením, ktorý vo svojom registri nazhromaždil päť rôznych QR kódov: banková platba, tipy, Instagram, recenzie Google a odkaz na prenájom. Každý bol vygenerovaný z iného zdroja, vytlačený v inom čase a vystavený v nezhodných stojanoch. Vizuálny chaos podkopával starostlivo upravenú estetiku obchodu a zamestnanci pravidelne riešili zákazníkov, ktorí naskenovali nesprávny kód.', 'Riešenie si vyžadovalo oddelenie obáv: platobné kódy vyžadovali maximálnu spoľahlivosť s konzervatívnym štýlom, zatiaľ čo marketingové kódy mohli byť výraznejšie. Jednotný zobrazovací systém, ktorý sa objavil, ukazuje, ako vyvážiť prítomnosť značky s funkčnými požiadavkami rôznych prípadov použitia QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Neprehľadná oblasť registra zobrazujúca päť nezhodných QR kódov v rôznych stojanoch a tlačených materiáloch',
          caption: 'Chaotický východiskový bod: päť odpojených QR kódov súťaží o pozornosť a spôsobuje zmätok zákazníkov',
        },
      ],
    },
    {
      heading: 'Uprednostňovanie skúseností s platbami',
      paragraphs: ['Primárny spôsob platby v obchode využíval regionálny štandard, ktorý vyžadoval prísne dodržiavanie užitočného zaťaženia. Testovanie odhalilo, že aj malé úpravy ovplyvnili rýchlosť skenovania pri určitých bankových aplikáciách. Rozhodnutie: ponechať platobný QR úplne nezmenený s výnimkou optimalizácie veľkosti a profesionálnej tlače na matný kartón.', 'Tento konzervatívny prístup znamenal, že kód platby vyzeral menej „značkový" ako ideálny, ale miera dokončenia transakcií sa dramaticky zlepšila. Pohľad: platobné momenty nie sú príležitosťami na budovanie značky, ale momentami spoľahlivosti. Zákazníci oceňujú rýchlosť a istotu pred estetikou, keď ide o peniaze.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Čistý, veľký platobný QR kód na profesionálnom matnom kartóne, ktorý je viditeľne umiestnený na registračnej pokladni',
          caption: 'Platobný QR: veľkorysý, vytlačený profesionálne, konzervatívny štýl pre okamžité rozpoznanie bankovými aplikáciami',
        },
      ],
    },
    {
      heading: 'Vytvorenie zobrazenia sekundárnej akcie',
      paragraphs: ['Čo sa týka tipov, recenzií, sociálnych sietí a náboru, obchod by mohol byť výraznejší. Tieto kódy boli regenerované v ANQR s konzistentným štýlom značky: charakteristická olivovo zelená na kréme, zaoblený štýl modulu a jemné prekrytie stredu s ikonou obchodu. Error Correction H zaistila spoľahlivosť aj so stylingom.', 'Tieto štyri kódy boli usporiadané na značkovom paneli umiestnenom vedľa (nekonkurujúceho) kódu platby. Jasné štítky v typografii obchodu vysvetľujú účel každého kódu. Vizuálna hierarchia bola zámerná: platba bola samostatná a výrazná; sekundárne akcie zoskupené ako možnosti.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Značkový panel zobrazujúci štyri štýlové QR kódy pre tipy, recenzie, sociálne siete a nábor s jasnými štítkami',
          caption: 'Sekundárny akčný panel: konzistentné označovanie, jasné označovanie, umiestnené skôr ako možnosti ako rušivé prvky',
        },
      ],
    },
    {
      heading: 'Dizajn zobrazovacieho systému',
      paragraphs: ['Fyzický displej vyriešil niekoľko problémov súčasne. Platobný stojan aj sekundárny panel používali matné materiály na elimináciu oslnenia horného osvetlenia. Výšky boli optimalizované pre zákazníkov rôznej postavy. Uhly smerujú skôr k frontu zákazníkov ako naplocho na pult.', 'Najdôležitejšie je, že obchod vytvoril náhradné výtlačky z uzamknutých konfiguračných odkazov ANQR. Keď kód s prepitným nakoniec postriekal kávou, personál ho v priebehu niekoľkých minút vymenil pomocou uloženej konfigurácie – žiadne snímky obrazovky, žiadne hádanie nastavení, žiadne zníženie kvality.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Diagram zobrazujúci fyzické rozloženie displeja: výšky, uhly, materiály a vzťah medzi platbami a sekundárnymi displejmi',
          caption: 'Návrh zobrazovacieho systému: fyzická ergonómia optimalizovaná pre spoľahlivé skenovanie v rôznych výškach zákazníkov a svetelných podmienkach',
        },
      ],
    },
    {
      heading: 'Prevádzkové vylepšenia',
      paragraphs: ['Šesť týždňov po nasadení obchod zdokumentoval významné vylepšenia: nula sťažností zákazníkov na zmätok s „nesprávnym kódom", rýchlejšie transakčné časy a trojnásobný nárast odoslaných tipov (zákazníci teraz mohli nájsť a naskenovať kód tipu bez toho, aby sa nešikovne pýtali personálu). Recenzie Google sa tiež zvýšili, pretože vyhradený, dobre označený QR kód odstránil trenie.', 'Školenie zamestnancov sa zjednodušilo: „platobný kód je veľký, všetko ostatné je na paneli". Keď sa platobné aplikácie aktualizovali a jedna nakrátko vykazovala pomalšie skenovanie, konzervatívny dizajn platobného kódu znamenal, že stále funguje – len o niečo pomalšie, než aby úplne zlyhal.', 'Princípy tohto dizajnu zobrazovacieho systému nájdete v príručke Naučte sa o QR kódoch pre maloobchodné platby.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Panel metrík zobrazujúci porovnania pred/po: prípady zámeny, čas transakcie, frekvencia tipov, odoslania kontroly',
          caption: 'Šesť týždňov prevádzkových údajov demonštrujúcich podnikateľský vplyv premysleného multi-QR zobrazovacieho systému',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Prechádzať Učiť sa články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Prípadová štúdia: Od vizitky po billboard',
      paragraphs: ['Tento príklad sleduje produkčnú spoločnosť, ktorá sa pripravuje na veľkú konferenciu. Potrebovali rovnaký QR kód – prepojený s aplikáciou udalosti – nasadený v radikálne odlišných formátoch: vložky s odznakmi pre účastníkov (3 cm), karty stanu (8 cm), označenie registračného stola (30 cm), plagáty na nájdenie cesty (60 cm) a masívny banner na javisku (4 metre). Každý formát mal iné pozorovacie vzdialenosti, svetelné podmienky a výrobné pracovné postupy.', 'Výzva nebola len technická, ale aj prevádzková. Viacerí dodávatelia spracovávali rôzne tlačové úlohy a spoločnosť potrebovala zabezpečiť konzistentné, skenovateľné výsledky bez ohľadu na to, kto čo vyrobil. Ich riešenie sa sústredilo na export SVG a prísnu dokumentáciu odovzdania.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Koláž zobrazujúca rovnaký QR kód nasadený v piatich rôznych veľkostiach, od odznaku po banner',
          caption: 'Jeden QR kód, päť veľkostí nasadenia: výzva udržať skenovateľnosť od centimetrov po metre',
        },
      ],
    },
    {
      heading: 'Prečo mali predchádzajúce udalosti problémy',
      paragraphs: ['Na poslednej konferencii spoločnosť zažila trápne zlyhania. QR banner na pódiu bol vygenerovaný ako malý PNG a zväčšený v dizajnovom softvéri – výsledok vyzeral prijateľne z diaľky, ale nedokázal ho spoľahlivo naskenovať z publika. QR kódy odznakov boli príliš štýlové a príliš malé, čo frustrovalo účastníkov, ktorí sa pokúšali pridať kontakty. Nekonzistentné nastavenia medzi formátmi znamenali, že „rovnaký" QR skutočne vyzeral na každom kuse inak.', 'Analýza po udalostiach odhalila hlavnú príčinu: žiadny jediný zdroj pravdy. Každý dizajnér znovu vytvoril QR s mierne odlišnými nastaveniami a každý dodávateľ tlače spracoval súbory inak. Kvalita sa zhoršila v dôsledku telefonickej hry odovzdávania súborov.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Detailné fotografie zobrazujúce zlyhania skenovania: pixelové bannerové moduly, poddimenzované kódy odznakov, nekonzistentný štýl medzi formátmi',
          caption: 'Forenzná analýza zlyhaní predchádzajúcich udalostí: každý formát priniesol iné problémy s kvalitou',
        },
      ],
    },
    {
      heading: 'Prvý pracovný postup SVG',
      paragraphs: ['Pre túto udalosť spoločnosť zaviedla prísny protokol: jeden hlavný QR generovaný v ANQR s optimálnymi nastaveniami (korekcia chýb H, veľkorysá tichá zóna, čistý štýl), exportovaný ako SVG a uložený ako jediný autoritatívny zdroj. Odkaz na konfiguráciu ANQR bol zdokumentovaný spolu so súborom SVG, aby bolo možné kód v prípade potreby znova vygenerovať.', 'Každý dizajnér a predajca dostali rovnakú predlohu SVG s jasnými pokynmi: umiestnite v požadovanej veľkosti, neupravujte, udržujte voľný priestor v tichej zóne. Pre predajcov vyžadujúcich rastrové formáty spoločnosť poskytla vopred vykreslené PNG v špecifických veľkostiach s jasnými konvenciami pomenovania, ktoré označujú zamýšľané použitie.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Balík súborov zobrazujúci hlavný súbor SVG, súbory PNG špecifické pre veľkosť, dokument so špecifikáciami a odkaz na konfiguráciu',
          caption: 'Odovzdávací balík: všetko, čo predajcovia potrebovali na dosiahnutie konzistentných výsledkov bez hádania',
        },
      ],
    },
    {
      heading: 'Úvahy špecifické pre veľkosť',
      paragraphs: ['Každý formát si vyžadoval osobitnú pozornosť. Odznakové vložky s veľkosťou 3 cm potrebovali QR na zaberanie maximálneho dostupného priestoru - skenovacia vzdialenosť by bola dĺžka paže. Stolové stany s šírkou 8 cm môžu mať dekoratívne rámovanie mimo pokojovej zóny. 4-metrový banner vyžadoval výpočet: z typickej vzdialenosti publika (15-20 metrov), moduly museli byť jasne rozlíšiteľné kamerami telefónu, čo znamenalo, že QR musel byť aspoň 80 cm v rámci dizajnu bannera.', 'Spoločnosť vytvorila sprievodcu veľkostí, ktorý dokumentuje minimálne rozmery QR pre každú očakávanú vzdialenosť skenovania. Toto sa stalo opätovne použiteľným aktívom pre budúce udalosti, čím sa odstránili dohady z procesu návrhu.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Graf zobrazujúci vzťah medzi vzdialenosťou skenovania, minimálnou veľkosťou QR kódu a rozmermi modulu pre každý formát udalosti',
          caption: 'Matica veľkostí: vypočítané rozmery zaisťujúce spoľahlivé skenovanie pri očakávanej pozorovacej vzdialenosti každého formátu',
        },
      ],
    },
    {
      heading: 'Výrobné výsledky',
      paragraphs: ['Validácia dňa konferencie bola systematická: zamestnanci testovali každý nasadený QR pred otvorením dverí. Vložky odznakov sa okamžite naskenovali na dĺžku paže. Stolové stany fungovali spoľahlivo pri variabilnom osvetlení oddychových miestností. Pódiový pútač – blamáž predchádzajúceho podujatia – úspešne naskenovaný zo stredu hľadiska.', 'U viac ako 2 000 účastníkov boli zaznamenané nulové sťažnosti na skenovanie. Prevádzková výhra bola rovnako významná: keď si pridanie sponzora na poslednú chvíľu vyžadovalo nový nápis, produkčný tím ho vygeneroval z hlavného SVG v priebehu niekoľkých minút a bol si istý, že sa bude zhodovať so všetkým ostatným.', 'Pozrite si príručku Naučte sa o QR kódoch pripravených na tlač pre rozhodovací rámec SVG vs PNG a osvedčené postupy odovzdávania.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografia udalosti zobrazujúca účastníkov úspešného skenovania QR kódov v rôznych veľkostiach a vzdialenostiach v celom mieste konania',
          caption: 'Úspech v deň konferencie: spoľahlivé skenovanie naprieč všetkými formátmi, od detailných záberov odznakov až po zábery na diaľku na javisku',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Prechádzať Učiť sa články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Prípadová štúdia: Digitálny displej letiskového salónika',
      paragraphs: ['Tento príklad sleduje salónik leteckej spoločnosti, ktorý na svojich digitálnych uvítacích obrazovkách používal statické QR kódy. Na obrazovkách sa zobrazoval rotujúci propagačný obsah, ale QR kód na registráciu v salóniku bol v rohu, statický a ľahko prehliadnuteľný. Analýza ukázala, že iba 15 % oprávnených hostí použilo QR check-in napriek tomu, že bol rýchlejší ako front na stole. Väčšina hostí si to jednoducho nevšimla.', 'Hypotéza bola jednoduchá: vo vizuálne rušnom prostredí s pohyblivým obsahom sa statický QR kód stáva neviditeľným. Riešenie potrebné na to, aby bol QR viditeľný bez ohrozenia spoľahlivosti vyžadovanej pre tok odbavenia, kde by zlyhanie znamenalo frustrovaných cestujúcich a dlhšie fronty pri stole.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Digitálny displej v letiskovej hale zobrazujúci propagačný obsah s malým statickým QR kódom v rohu',
          caption: 'Pôvodné nastavenie: statický QR kód stratený v mori dynamického propagačného obsahu, ktorý dosiahol iba 15% prijatie',
        },
      ],
    },
    {
      heading: 'Navrhovanie bezpečnej animácie',
      paragraphs: ['Digitálne značenie salónika využívalo veľké LED panely – náročné prostredie, kde by agresívna animácia mohla spôsobiť problémy so skenovaním. Dizajnérsky tím začal konzervatívne: jemný pulzný efekt, ktorý jemne rozširoval a zmenšoval vizuálnu prítomnosť QR bez úpravy skutočnej štruktúry kódu. Časovanie snímok bolo nastavené pomaly (250 ms), aby sa predišlo problémom s blikaním pri obnovovacej frekvencii LED.', 'Overenie bezpečného režimu potvrdilo, že každý snímok zostal skenovateľný. Dodatočné testovanie na skutočných paneloch LED odhalilo, že pulz musí byť ešte jemnejší, ako navrhovali náhľady na pracovnej ploche – jas LED a pozorovacie uhly ovplyvnili vnímaný kontrast viac, ako sa očakávalo.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Panel nastavení animácie ANQR zobrazujúci konfiguráciu pulzu: pomalé načasovanie, jemná intenzita, povolený bezpečnostný režim',
          caption: 'Konfigurácia animácie: parametre vyladené pre displej LED panela pri zachovaní spoľahlivosti skenovania v každom zábere',
        },
      ],
    },
    {
      heading: 'Integrácia s obsahom nápisov',
      paragraphs: ['Animovaný QR kód bol umiestnený vo vyhradenej „stabilnej zóne" rozloženia obrazovky – oblasť, ktorá zostala konštantná, kým sa propagačný obsah otáčal na hlavnej ploche displeja. Toto oddelenie bolo kľúčové: QR potreboval vizuálnu stabilitu na skenovanie, aj keď priťahoval pozornosť jemnou animáciou.', 'Vedľa QR bola pridaná jasná výzva na akciu: „Preskočte front – naskenujte sa a prihláste sa." Text zostal statický, kým QR pulzoval, čím sa vytvorila vizuálna hierarchia, ktorá upriamila pozornosť na možnosť skenovania bez toho, aby zahltila propagačný obsah.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Schéma rozloženia obrazovky zobrazujúca animovaný QR kód v stabilnej zóne, zatiaľ čo propagačný obsah rotuje v hlavnej oblasti',
          caption: 'Pridelenie nehnuteľností na obrazovke: animovaný QR zaberá stabilnú zónu oddelenú od rotujúceho propagačného obsahu',
        },
      ],
    },
    {
      heading: 'Technické nasadenie',
      paragraphs: ['Animovaný QR kód bol exportovaný ako GIF s optimalizovanými nastaveniami pre signage CMS. Dôležité boli úvahy o veľkosti súboru – systém správy obsahu salónika mal limity nahrávania a príliš veľké súbory spôsobovali zasekávanie prehrávania. Konečný export vyvážil vizuálnu kvalitu s veľkosťou súboru obmedzením farebnej palety a optimalizáciou počtu snímok.', 'Nasadenie zahŕňalo rezervu: ak sa GIF z akéhokoľvek dôvodu nepodarilo prehrať, systém značenia zobrazí statickú zálohu PNG. Táto redundancia zaistila, že sa nikdy nestratila schopnosť registrácie v dôsledku technických problémov s animáciou.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Rozhranie CMS zobrazujúce nahranie animovaného QR kódu s nakonfigurovaným záložným statickým obrázkom',
          caption: 'Konfigurácia Signage CMS: animovaná primárna so statickou núdzovou rezervou, ktorá zaisťuje, že funkcia registrácie nebude nikdy prerušená',
        },
      ],
    },
    {
      heading: 'Meraný vplyv',
      paragraphs: ['Po jednom mesiaci prevádzky sa prijatie QR check-in zvýšilo z 15 % na 24 % – relatívne zlepšenie o 60 %. Prieskumy spätnej väzby od hostí naznačovali, že animovaný QR kód bol „ľahšie si všimnúť" a „pripadalo mu „modernejšie". Časy vo fronte pri stole sa počas špičiek merateľne znížili, pretože viac hostí sa samoobsluhovalo prostredníctvom QR.', 'Dôležité je, že napriek tisíckam denných skenov boli hlásené nulové zlyhania skenovania. Konzervatívny animačný prístup dosiahol cieľ pozornosti bez obetovania spoľahlivosti, ktorú si tok odbavenia vyžadoval. Salónik následne spustil podobné animované QR kódy na svoje ďalšie miesta.', 'Technické princípy bezpečného dizajnu animácií nájdete v príručke Naučte sa o animovaných QR kódoch pre digital signage.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Informačný panel zobrazujúci zvýšenie miery prijatia, skrátenie času vo fronte a spoľahlivosť skenovania s nulovým zlyhaním počas obdobia nasadenia',
          caption: 'Jeden mesiac údajov: 60% nárast prijatia, skrátenie času vo fronte a zachovanie perfektnej spoľahlivosti skenovania',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Prechádzať Učiť sa články',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Prípadová štúdia: Global Product Launch QR Campaign',
      paragraphs: ['Tento príklad sleduje spoločnosť zaoberajúcu sa spotrebnou elektronikou, ktorá uvádza na trh nový produkt súčasne na 12 trhoch v 8 jazykoch. Každý regionálny marketingový tím potreboval vyrobiť obaly, maloobchodné displeje a propagačné materiály obsahujúce QR kódy odkazujúce na lokalizované produktové stránky. Predchádzajúce uvedenia na trh mali za následok nekonzistentný QR štýl, občasné zlyhania skenovania a „telefónnu hru" s posunom konfigurácie, keď každý tím znovu vytvoril kódy zo snímok obrazovky.', 'Riešenie využívalo zdieľateľné konfiguračné prepojenia ANQR na vytvorenie jediného zdroja pravdy, ku ktorému má prístup každý regionálny tím bez ohľadu na jazyk rozhrania. Užitočné zaťaženie QR používalo inteligentné presmerovanie, ktoré rozpoznalo jazyk používateľa, takže jeden kód fungoval globálne a zároveň poskytoval lokalizované skúsenosti.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Mapa sveta zobrazujúca 12 trhových miest s QR kódmi, pričom niektoré sú navzájom vizuálne nekonzistentné',
          caption: 'Výzva: 12 trhov, 8 jazykov a história nekonzistentných implementácií QR v rôznych regiónoch',
        },
      ],
    },
    {
      heading: 'Vytvorenie hlavnej konfigurácie',
      paragraphs: ['Globálny tím značky vytvoril autoritatívnu konfiguráciu QR v ANQR: farby značky zodpovedajúce vizuálnej identite produktového radu, korekcia chýb H pre spoľahlivosť vo všetkých tlačových a digitálnych aplikáciách a štýl, ktorý by sa reprodukoval konzistentne bez ohľadu na miestne výrobné metódy. Konfigurácia bola uzamknutá a odkaz na zdieľanie bol zdokumentovaný v prehľade globálnej kampane.', 'Je dôležité, aby kódovaná adresa URL používala službu presmerovania na zisťovanie jazyka. Po naskenovaní boli používatelia automaticky presmerovaní na stránku produktu v miestnom jazyku. To znamenalo, že všetkých 12 trhov mohlo používať identické QR kódy – žiadne variácie užitočného zaťaženia na jednotlivých trhoch, ktoré by mohli spôsobiť chyby.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Rozhranie ANQR zobrazujúce hlavnú konfiguráciu s farbami značky, ECC H a inteligentné presmerovanie URL',
          caption: 'Hlavná konfigurácia: globálne štandardy značky zakódované do jediného zdroja pravdy, ktorý možno zdieľať',
        },
      ],
    },
    {
      heading: 'Pracovný postup regionálneho tímu',
      paragraphs: ['Každý regionálny marketingový tím dostal konfiguračný odkaz s jednoduchými pokynmi: otvorte odkaz, overte, či náhľad zodpovedá pokynom pre značku, exportujte ho do formátu požadovaného pre vašu aplikáciu. Rozhranie ANQR sa zobrazuje v preferovanom jazyku každého tímu, ale základné nastavenia QR zostali identické bez ohľadu na jazyk rozhrania.', 'Keď japonský tím potreboval SVG pre špičkové maloobchodné displeje a brazílsky tím potreboval PNG pre sociálne médiá, obe boli exportované z rovnakej konfigurácie. Keď si dodávateľ tlače nemeckého tímu vyžiadal konkrétne hodnoty farieb, mohli priamo odkazovať na konfiguráciu a nemuseli hádať zo snímky obrazovky.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Snímky obrazovky zobrazujúce rovnaký konfiguračný odkaz otvorený v japonských, portugalských a nemeckých rozhraniach',
          caption: 'Rovnaká konfigurácia, rôzne rozhrania: regionálne tímy pracujú vo svojom preferovanom jazyku pri zachovaní globálnej konzistencie',
        },
      ],
    },
    {
      heading: 'Spracovanie regionálnych variácií',
      paragraphs: ['Niektoré trhy si vyžadovali menšie úpravy. Čínsky tím potreboval verziu s rámom optimalizovaným pre WeChat na sociálne zdieľanie. Namiesto úpravy predlohy vytvorili zdokumentovaný variant s vlastným konfiguračným odkazom, ktorý je v knižnici podkladov kampane jasne označený ako „variant CN-WeChat". Tým sa zachovala sledovateľnosť a zároveň umožnila potrebná lokalizácia.', 'Tím značky stanovil jednoduché pravidlo: každá odchýlka od hlavnej verzie si vyžadovala nový, zdokumentovaný konfiguračný odkaz. Žiadne úpravy exportovaných súborov, žiadne „rýchle opravy" v dizajnovom softvéri. To zabránilo posunu konfigurácie, ktorý sužoval predchádzajúce štarty.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Rozhranie knižnice aktív zobrazujúce hlavnú konfiguráciu a schválené regionálne varianty, každý s vlastným odkazom',
          caption: 'Správa aktív kampane: hlavná konfigurácia plus zdokumentované varianty, všetko sledovateľné prostredníctvom konfiguračných odkazov',
        },
      ],
    },
    {
      heading: 'Spustiť výsledky',
      paragraphs: ['V deň uvedenia produktu na trh boli QR kódy nasadené na obaloch, maloobchodných displejoch, materiáloch na podujatia a digitálnych kampaniach súčasne na všetkých 12 trhoch. Audity kvality potvrdili vizuálnu konzistentnosť naprieč regiónmi – QR na maloobchodných displejoch v Tokiu sa zhodovalo s QR na obaloch v São Paule sa zhodovalo s QR na banneroch podujatí v Berlíne.', 'Naprieč trhmi boli hlásené nulové zlyhania skenovania. Keď bola potrebná zmena adresy URL stránky produktu po uvedení na trh, služba presmerovania to zvládla neviditeľne – nie je potrebná opätovná tlač. Globálny tím odhadol, že prístup konfiguračného prepojenia ušetril viac ako 40 hodín koordinačného času v porovnaní s ich predchádzajúcou metodikou spustenia.', 'Zásady pracovného toku, ktoré stoja za globálnou konzistentnosťou kampaní, nájdete v príručke Naučte sa o spolupráci medzi jazykmi QR.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Mriežka fotografií zobrazujúca konzistentné nasadenie QR na rôznych trhoch: maloobchod v Tokiu, balenie v São Paule, udalosti v Berlíne',
          caption: 'Dosiahnutá globálna konzistentnosť: identická prezentácia QR na 12 trhoch napriek rôznym jazykom, predajcom a formátom',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Otvorte generátor',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Prechádzať Učiť sa články',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Prechádzať Učiť sa články', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otvorte celú používateľskú príručku', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otvorte galériu', type: 'gallery' },
  ],
};
