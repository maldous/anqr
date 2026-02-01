import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const privacy: PageDefinition = {
  title: 'Ochrana osobních údajů',
  description: 'Informace ANQR shromažďují, jak se používá, a vaše práva podle platných zákonů o ochraně soukromí.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Podmínky služby', type: 'external' }],
  sections: [
    {
      heading: 'Shrnutí',
      paragraphs: ['ANQR je QR kód generátor s klient- první přístup. Nechceme, abyste si vytvářeli účet. Ve výchozím nastavení, QR kódy jsou generovány lokálně ve vašem prohlížeči - nemáme přístup k obsahu, který enkódujete.', 'Pro profesionální použití ANQR poskytuje serverside API, který generuje QR kódy z URL parametrů. Pokud používáte API, váš QR obsah se zpracovává na našich serverech k vykreslení obrazu, ale není uložen ani zaznamenán.', 'Používáme Google AdSense pro reklamu a mohou využívat analytické služby. Tyto služby shromažďují informace prostřednictvím cookies a podobných technologií. Tato politika vysvětluje, jaké údaje jsou shromažďovány, jak se používají, a vaše práva.'],
    },
    {
      heading: 'Informace shromažďujeme',
      bullets: ['Informace, které poskytnete: Pokud nás kontaktujete prostřednictvím e-mailu nebo našeho kontaktního formuláře, shromáždíme Vaše jméno, e-mailovou adresu a obsah zprávy.', 'Automaticky shromažďované informace: Náš poskytovatel hostingu (Netlify), reklamní partneři a analytické služby mohou shromažďovat: IP adresu, typ prohlížeče a verzi, operační systém, typ zařízení, odkazující na URL, navštívené stránky, čas na místě a přibližné zeměpisné umístění.', 'Sušenky na párty: Naši reklamní partneři (Google AdSense) používají cookies a podobné technologie k obsluze a měření reklam. Sám ANQR nenastavuje žádné první-party cookies.'],
    },
    {
      heading: 'Cookies a technologie třetích stran',
      paragraphs: ['ANQR nenastavuje žádné první-party cookies. Vaše preference (např. tmavý režim) jsou uloženy lokálně na vašem zařízení, které není přenášeno na žádný server.', 'Naši reklamní partneři (Google AdSense) a poskytovatel hostingu však mohou používat cookies a podobné sledovací technologie:'],
      bullets: ['Reklamní cookies (třetí strana): Nastavit AdSense Google a reklamní partneři sloužit relevantní reklamy, měřit ad výkon, a pochopit zájmy uživatelů. Tyto cookies mohou sledovat vaši aktivitu na různých webových stránkách.', 'Analytické cookies (třetí strana): Může být používán naším poskytovatelem hostingu nebo analytickými službami pro sběr anonymizovaných údajů o používání.'],
    },
    {
      heading: 'Google AdSense a reklama',
      paragraphs: ['Zobrazujeme reklamy prostřednictvím Google AdSense. Google a jeho partneři používají cookies k obsluhování reklam na základě vaší historie procházení na těchto stránkách a dalších webových stránkách (zajímavé reklamy).', 'Přečtěte si, jak Google využívá vaše informace: https: / / policies.google.com / technologies / partner- sites', 'Komise, T-413 / 03, Sb. rozh', 'Vyloučeno prostřednictvím Network Advertising Initiative: https: / / optout.networkinzering.org', 'Vyloučeno prostřednictvím Digital Advertising Alliance: https: / / optout.abouts.info'],
    },
    {
      heading: 'Jak používáme informace',
      bullets: ['Reagovat na vaše dotazy a poskytovat podporu.', 'Zobrazovat příslušné reklamy prostřednictvím našich reklamních partnerů.', 'Chcete-li analyzovat používání webových stránek a zlepšit naše služby.', 'Zjišťovat, předcházet a řešit podvody, zneužívání a bezpečnostní otázky.', 'Splnění právních povinností.'],
    },
    {
      heading: 'Služby třetích stran',
      bullets: ['Google AdSense: Přijímá data pro obsluhu a měření reklam.', 'Poskytovatelé analýz: Příjem anonymizovaných údajů o používání.', 'Netlify (hosting): Zpracovává žádosti a může přihlásit IP adresy.', 'Vaše osobní údaje neprodáváme. Sdílení údajů s reklamními partnery však lze považovat za "prodej" v rámci CCPA (viz níže).'],
    },
    {
      heading: 'Uchovávání údajů',
      bullets: ['Kontaktní údaje: Až 2 roky.', 'Záznamy serveru: Do 30 dnů (poskytovatel hostingu).', 'Analytická data: Do 26 měsíců (anonymizován).', 'Reklamní cookies: Typicky 13 měsíců (liší se podle partnera).'],
    },
    {
      heading: 'Vaše práva podle GDPR (uživatelé EHP)',
      paragraphs: ['Pokud jste v Evropském hospodářském prostoru, máte podle obecného nařízení o ochraně údajů tato práva:'],
      bullets: ['Právo na přístup: Vyžádejte si kopii osobních údajů, které o vás máme.', 'Právo na opravu: Žádost o opravu nepřesných údajů.', 'Právo na vymazání: Žádost o vymazání Vašich dat ("právo na zapomenutí").', 'Právo omezit zpracování: Požadavek omezení, jak používat vaše data.', 'Právo na přenositelnost dat: Vyžádejte si data v přenosném formátu.', 'Právo na námitku: Předmět zpracování, včetně přímého uvádění na trh.', 'Právo odejmout souhlas: Odeberte souhlas kdykoliv, kdy je zpracování založeno na souhlasu.', 'Právo podat stížnost: Podejte stížnost u svého orgánu pro ochranu údajů.'],
    },
    {
      heading: 'Právní základ GDPR',
      paragraphs: ['Zpracováváme údaje na těchto základech: a) Souhlas - pro personalizovanou reklamu (řízenou našimi reklamními partnery); b) Legitimní zájmy - pro analytiku, bezpečnost a zlepšení; c) Smlouva - reagovat na dotazy.', 'Pro uplatnění svých práv kontaktujte $_ _ ANQR _ PH _ 0 _ _. Reagujeme do 30 dnů.'],
    },
    {
      heading: 'Vaše práva podle CCPA (uživatelé Kalifornie)',
      bullets: ['Právo vědět: Vyžádat si informace o shromážděných údajích, zdrojích, cílech a třetích stranách.', 'Právo na vymazání: Žádám o vymazání vašich osobních údajů.', 'Právo opt- out: Vyloučení z "prodeje" osobních údajů (sdílení s reklamními partnery může být způsobilé).', 'Právo na nediskriminaci: Nebudeme diskriminovat za výkon vašich práv.'],
    },
    {
      heading: 'Sebrané kategorie CCPA',
      paragraphs: ['Kategorie: Identifikátory (IP adresa, ID zařízení), internetová aktivita (prohlížení, reklamní interakce), Geolokace (přibližné), Inference (zájmy z prohlížení).', 'Chcete-li uplatnit práva nebo vynechat: $_ _ ANQR _ PH _ 0 _ _ nebo upravit nastavení cookie.'],
    },
    {
      heading: 'Mezinárodní převody',
      paragraphs: ['Vaše informace mohou být předány do zemí s různými zákony o ochraně údajů, včetně Spojených států. Používáme vhodné záruky, jako jsou standardní smluvní ustanovení.'],
    },
    {
      heading: 'Soukromí dětí',
      paragraphs: ['ANQR není určen pro děti mladší 13 let (nebo 16 let v EHP). Neshromažďujeme vědomě data od dětí. Kontaktujte $_ _ ANQR _ PH _ 0 _ _ pokud se domníváte, že vám dítě poskytlo informace.'],
    },
    {
      heading: 'Bezpečnost',
      paragraphs: ['Používáme vhodná technická a organizační opatření k ochraně dat, včetně HTTPS šifrování. Žádný přenos přes internet však není 100% bezpečný.'],
    },
    {
      heading: 'Nesledovat',
      paragraphs: ['Pokud je to možné, respektujeme signály prohlížeče Do Not Track, ačkoli reklamní partneři nemusí na DNT reagovat.'],
    },
    {
      heading: 'Změny této politiky',
      paragraphs: ['Tuto politiku můžeme pravidelně aktualizovat. Datum "Poslední aktualizace" označuje poslední revizi. Významné změny mohou být sděleny prostřednictvím banneru.'],
    },
    {
      heading: 'Kontaktujte nás',
      paragraphs: ['Pro otázky soukromí nebo k výkonu svých práv: $_ _ ANQR _ PH _ 0 _ _ nebo použijte naši Kontaktní stránku. Na žádosti o soukromí odpovídáme do 30 dnů.'],
    },
    {
      heading: 'Úplné zásady ochrany osobních údajů',
      paragraphs: ['Tato stránka poskytuje souhrn našich zásad ochrany osobních údajů. Úplné, právně závazné zásady ochrany osobních údajů s úplnými podrobnostmi o zpracování údajů, vašich právech a našich povinnostech podle GDPR, CCPA a dalších zákonů na ochranu soukromí naleznete v našich úplných zásadách hostovaných společností iubenda.'],
      links: [{ href: 'https://www.iubenda.com/privacy-policy/70266922', label: 'Zobrazit úplné zásady ochrany osobních údajů na iubenda', type: 'external' }],
    },
  ],
};

export default privacy;
