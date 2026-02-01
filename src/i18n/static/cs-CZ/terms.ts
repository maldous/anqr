import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Podmínky služby',
  description: 'Tím, že přístup nebo používání webu, souhlasíte být vázán těmito podmínkami.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Ochrana osobních údajů', type: 'external' }],
  sections: [
    {
      heading: 'Přijetí podmínek',
      paragraphs: ['Přístupem nebo použitím ANQR (anqr.link) souhlasíte s tím, že budete vázáni těmito Podmínkami služby a našimi Zásadami ochrany soukromí. Pokud s těmito podmínkami nesouhlasíte, nepoužívejte stránku.', 'Tyto podmínky můžeme čas od času aktualizovat. Pokračování používání webu po změnách představuje přijetí nových podmínek.'],
    },
    {
      heading: 'Způsobilost',
      paragraphs: ['K použití ANQR vám musí být nejméně 13 let. Používáním webu reprezentujete, že tento věkový požadavek splníte. Pokud je vám méně než 18 let, představujete, že máte svolení rodiče nebo opatrovníka k používání webu.'],
    },
    {
      heading: 'Povolené použití',
      paragraphs: ['ANQR můžete používat pouze pro zákonné účely. Jste výhradně odpovědní za obsah, který kódujete do QR kódů, a za to, jak používáte jakékoli QR kódy, které vygenerujete.'],
    },
    {
      heading: 'Zakázané jednání',
      paragraphs: ['Souhlasíte, že ne:'],
      bullets: ['Použijte ANQR k vytvoření QR kódů, které usnadňují phishing, malware distribuce, podvod, podvody, obtěžování, pomluvy, nebo jakékoli nezákonné činnosti.', 'Obsah kódu, který porušuje práva duševního vlastnictví, porušuje soukromí nebo obsahuje nelegální materiál.', 'Pokuste se narušit, přetížit, nebo narušit provoz nebo bezpečnost webu.', 'Reverse inženýr, rozklad, nebo pokus o získání zdrojového kódu ze stránky.', 'Pomocí automatických nástrojů (roboty, škrabače) přístup k webu způsobem, který degraduje výkon pro ostatní uživatele.', 'Obcházet nebo zakázat jakékoli bezpečnostní nebo přístupové prvky.', 'Vydejte se za jakoukoli osobu nebo subjekt nebo zkreslte svou příslušnost.'],
    },
    {
      heading: 'Duševní vlastnictví',
      paragraphs: ['Držíte si vlastnictví obsahu, který kódujete do QR kódů. ANQR nepožaduje vlastnictví vašich dat.', 'Název ANQR, logo, návrh rozhraní a základní kód jsou chráněny autorskými právy, ochrannou známkou a dalšími zákony duševního vlastnictví. Nesmíte kopírovat, upravovat, distribuovat nebo vytvářet odvozená díla bez našeho svolení.', 'QR Code ® je registrovaná ochranná známka DENSO WAVE INCORPORATED. ANQR není přidružen k DENSO WAVE.'],
    },
    {
      heading: 'Licence na obsah uživatele',
      paragraphs: ['Používáním ANQR nám nedáváte žádná práva na váš obsah. Při použití lokální generace (výchozí) se ve vašem prohlížeči odehrává veškerá generace QR kódů a my nepřistupujeme, neukládáme ani nepředáváme kódovaná data.', 'Při použití serverside API je Váš obsah zpracováván pro generování QR obrazu, ale není uložen, zaznamenán nebo používán pro jakýkoli jiný účel, než je vykreslování požadovaného obrazu.'],
    },
    {
      heading: 'Služby a reklama ve třetích zemích',
      paragraphs: ['Stránky zobrazují reklamy prostřednictvím Google AdSense a mohou obsahovat odkazy na webové stránky třetích stran. Nejsme zodpovědní za třetí strany obsahu, služeb, nebo soukromí praxi.', 'Vaše interakce s inzerenty a třetími stranami jsou pouze mezi vámi a nimi. Viz naše Zásady ochrany soukromí pro informace o reklamních datových praktikách.'],
    },
    {
      heading: 'Vyloučení záruk',
      paragraphs: ['ANQR JE POSKYTOVÁN NA "TAK, JAK JE" A "JAK JE K DISPOZICI" BÁZE BEZ VAD JAKÉHOKOLI DRUHU, EXPRESE NEBO IMPLIKOVANÉ, VČETNĚ, ALE NENÍ OMEZEN NA IMPLIKOVANÉ VAROVNOSTI MERCHANTABILITY, ZDATNOSTI PRO ZVLÁŠTNÍ ÚČELY, A NON- PORUŠENÍ.', 'Nezaručujeme, že: a) místo bude nepřerušené, bezpečné, nebo error-free; b) QR kódy budou skenovat ve všech prostředích, na všech zařízeních, nebo se všemi scannery aplikací; c) místo bude splňovat vaše požadavky.', 'Vždy byste měli testovat QR kódy v podmínkách, kde budou použity (velikost tisku, osvětlení, typ obrazovky, vzdálenost, kvalita kamery).'],
    },
    {
      heading: 'Omezení odpovědnosti',
      paragraphs: ['K MAXIMÁLNÍMU ROZSAHU POVOLENÉMU PRÁVNÍMI PŘEDPISY, ANQR A JEHO OPERATORY, ZÁVAZKY A LICHVY SE NEVZTAHUJÍ NA ŽÁDNÉ PŘÍMÉ, NEPŘÍMÉ, NEPŘÍMÉ, NECIDENTNÍ, ZVLÁŠTNÍ, KONSOLIDOVANÉ, UNIJNÍ NEBO EXTRAPOLAČNÍ ÚDAJE, KTERÉ ZAHRNUJÍ, ALE NEOMEZUJÍ SE NA ÚDAJE O ZTRÁTĚ PROFESE, PŘÍJMECH, DATECH, GOODWILLU, POUŽITÍ NEBO JINÝCH INSTANČNÍCH ZTRÁTÁCH, KTERÉ POCHÁZEJÍ Z VAŠEHO PŘÍJMU NEBO Z NĚJ PLYNOU.', 'EXPERTNĚ ROZUMÍTE A SOUHLASÍTE S TÍM, ŽE VAŠE VYUŽITÍ SLUŽBY JE NA VAŠEM RIZIKU. SLUŽBA JE POSKYTOVÁNA ZDARMA A VY SE SHODNETE NA TOM, ŽE ANQR A JEHO OPERÁTOŘI PRO VÁS NEBUDOU MÍT ŽÁDNOU VÝHODU. V ŽÁDNÉM PŘÍPADĚ NESMÍ NAŠE CELKOVÁ AGREGÁTOVÁ KOMPATIBILITA MIMO ZERO DOLLARS (0 AUD).', 'SOUHLASÍTE S PROPUŠTĚNÍM, ČEKÁNÍM A ZPROŠTĚNÍM VŠECH PŘÍKAZŮ, DÉMANTŮ A PŘÍČIN AKCE PROTI ANQROVI A JEHO OPERATÉRŮM, KTEŘÍ PŘIŠLI Z VAŠÍ SLUŽBY.', 'NĚKTERÁ JURIZACE NEUMOŽŇUJÍ VYLOUČENÍ URČITÝCH VAROVNOSTÍ NEBO OMEZENÍ ODPOVĚDNOSTI. V TĚCHTO PŘÍPADECH JE NAŠE ODPOVĚDNOST OMEZENA NA MAXIMÁLNÍ ROZSAH POVOLENÝ PLATNÝM PRÁVEM.'],
    },
    {
      heading: 'Odškodnění',
      paragraphs: ['Souhlasíte s odškodněním, obhajobou a zachováním neškodného ANQR, jejích operátorů, přidružených společností a jejich příslušných důstojníků, ředitelů, zaměstnanců a agentů za případné nároky, škody, ztráty, závazky, náklady a výdaje (včetně právních poplatků) vyplývající z: a) vašeho používání webu; b) vašeho porušení těchto podmínek; c) vašeho porušení práv třetích stran; d) jakéhokoli obsahu, který zadáte do kódů QR.'],
    },
    {
      heading: 'Řešení sporů',
      paragraphs: ['Jakýkoli spor vyplývající z těchto Podmínek nebo vaše používání ANQR se nejprve pokusí vyřešit prostřednictvím neformálního jednání kontaktováním $_ _ ANQR _ PH _ 0 _ _.', 'Nedojde-li k neformálnímu vyřešení sporu, řeší se spory prostřednictvím závazného rozhodčího řízení ve Victorii v Austrálii, s výjimkou případu, kdy kterákoli strana může požádat soud o soudní úlevu za porušování duševního vlastnictví.'],
    },
    {
      heading: 'Odchylka od třídní akce',
      paragraphs: ['PRO ROZSAH POVOLENÝ ZÁKONEM, SOUHLASÍTE S TÍM, ŽE JAKÁKOLI RESOLUČNÍ OPATŘENÍ BUDOU PROVÁDĚNA POUZE NA INDIVIDUÁLNÍM ZÁKLADĚ A NIKOLI VE TŘÍDĚ, KONSOLIDOVANÉ NEBO REPREZENTAČNÍ ČINNOSTI.'],
    },
    {
      heading: 'Správní právo',
      paragraphs: ['Tyto podmínky se řídí zákony Victoria, Austrálie, bez ohledu na kolizní zákony zásady. Souhlasíte s výlučnou jurisdikcí soudů ve Victorii v Austrálii.'],
    },
    {
      heading: 'Změny a dostupnost',
      paragraphs: ['Můžeme změnit, pozastavit nebo přerušit místo (nebo jakoukoli jeho část) kdykoliv bez upozornění nebo odpovědnosti.', 'Tyto podmínky můžeme kdykoli aktualizovat. Datum "Poslední aktualizace" naznačuje, kdy byly naposledy revidovány. Pokračování používání po změnách představuje přijetí.'],
    },
    {
      heading: 'Oddělitelnost',
      paragraphs: ['Je-li jakékoliv ustanovení těchto Podmínek považováno za neplatné nebo nevymahatelné, bude toto ustanovení vymáháno v maximální možné míře a zbývající ustanovení zůstanou v plném platnosti a budou účinná.'],
    },
    {
      heading: 'Odchod',
      paragraphs: ['Naše neschopnost vymáhat jakékoli právo nebo poskytnutí těchto Podmínek se nepovažuje za zbavení tohoto práva nebo poskytnutí.'],
    },
    {
      heading: 'Celá dohoda',
      paragraphs: ['Tyto Podmínky, spolu s našimi Zásadami ochrany osobních údajů, představují celou dohodu mezi vámi a ANQR, pokud jde o vaše používání webu a nahradit všechny předchozí dohody.'],
    },
    {
      heading: 'Vyšší moc',
      paragraphs: ['Nebudeme zodpovědní za žádné selhání nebo zpoždění ve výkonu kvůli okolnostem, které jsou mimo naši rozumnou kontrolu, včetně přírodních katastrof, války, terorismu, nepokojů, vládních akcí nebo selhání internetu / infrastruktury.'],
    },
    {
      heading: 'Kontakt',
      paragraphs: ['Otázky týkající se těchto Podmínek lze zaslat na adresu: $_ _ ANQR _ PH _ 0 _ _'],
    },
  ],
};

export default terms;
