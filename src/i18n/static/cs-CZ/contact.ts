import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontaktujte nás',
  description: 'Vítáme zpětnou vazbu, zprávy o chybách, žádosti o funkce a obecné dotazy.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Jak se k nám dostat',
      paragraphs: ['Nabízíme několik způsobů, jak nás kontaktovat v závislosti na vašich potřebách. Čteme každou zprávu, i když doba odezvy se může lišit podle objemu a typu dotazu.'],
    },
    {
      heading: 'E-mail',
      paragraphs: ['Pro všechny dotazy: $_ _ ANQR _ PH _ 0 _ _', 'To je nejspolehlivější způsob, jak se k nám dostat a je doporučeno pro podrobné dotazy, obchodní dotazy, nebo jakékoli jiné dotazy.'],
    },
    {
      heading: 'Typy šetření',
      bullets: ['Obecné otázky: Otázky týkající se používání ANQR, vysvětlení funkcí nebo obecné zpětné vazby.', 'Hlášení chyb: Prosím, uveďte svůj prohlížeč, operační systém, kroky k reprodukci a jakékoli chybové zprávy, které uvidíte.', 'Žádosti o funkce: Návrhy na nové funkce nebo vylepšení. Zvažujeme všechny požadavky, i když nemůžeme slíbit realizaci.', 'Obchodní dotazy: Partnerské příležitosti, licenční otázky nebo šetření obchodního využití.', 'Žádosti o soukromí: Žádosti o uplatnění svých práv na soukromí podle GDPR, CCPA nebo jiných zákonů o ochraně soukromí (viz Zásady ochrany soukromí).', 'DMCA / Copyright: Viz níže oddíl DMCA pro požadavky na oznámení o převzetí.'],
    },
    {
      heading: 'Doba odezvy',
      paragraphs: ['Naším cílem je reagovat na dotazy během 5-7 pracovních dnů. Žádosti týkající se priorit budou projednány do 30 dnů, jak vyžaduje zákon.', 'Během pracovní doby může být doba odezvy delší. Pokud jde o naléhavé záležitosti, uveďte prosím "URGENT" ve vašem předmětu.'],
    },
    {
      heading: 'Než nás kontaktujete',
      paragraphs: ['Prosím, podívejte se na naši stránku Dokumentace pro odpovědi na běžné otázky o tom, jak používat funkce ANQR. Je zde zahrnuto mnoho otázek týkajících se tvorby kódů QR, stylu a možností exportu.'],
    },
    {
      heading: 'DMCA Oznámení o autorském právu',
      paragraphs: ['Pokud se domníváte, že obsah dostupný na ANQR porušuje vaše autorská práva, můžete předložit digitální zákon o autorském právu (DMCA), kterým se odkládá oznámení. Aby bylo Vaše oznámení platné, musí obsahovat:'],
      bullets: ['Fyzický nebo elektronický podpis vlastníka autorského práva nebo zmocněného zástupce.', 'Identifikace díla chráněného autorským právem, o němž se tvrdí, že bylo porušeno.', 'Identifikace materiálu, který je údajně porušován, s informacemi dostatečnými k jeho nalezení.', 'Vaše kontaktní údaje (adresa, telefonní číslo a e-mailová adresa).', 'Prohlášení, že máte dobrou víru, že použití materiálu není povoleno vlastníkem autorských práv.', 'Prohlášení, pod pokutou křivé přísahy, že informace ve vašem oznámení je přesné a že jste vlastníkem autorských práv nebo oprávněný jednat jejich jménem.'],
    },
    {
      heading: 'DMCA kontakt',
      paragraphs: ['Poslat oznámení DMCA na: $_ _ ANQR _ PH _ 0 _ _', 'Do položky uveďte "DMCA Notice". Na platná oznámení budeme reagovat v souladu s platnými právními předpisy. Všimněte si, že ANQR generuje QR kódy lokálně na uživatelských zařízeních a neorganizuje uživatelsky vytvořený obsah.'],
    },
    {
      heading: 'komunita Reddit',
      paragraphs: ['Připojte se k naší komunitě Reddit na r/ANQR a sdílejte své QR výtvory, ptejte se, získejte pomoc a spojte se s ostatními uživateli ANQR.'],
    },
  ],
};

export default contact;
