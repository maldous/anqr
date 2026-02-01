import type { PageDefinition } from '../types';

export const terms: PageDefinition = {
  title: 'Zmluvné podmienky',
  description:
    'Vstupom na stránku alebo jej používaním súhlasíte s tým, že budete viazaní týmito podmienkami.',
  lastUpdated: '1. februára 2026',
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Zásady ochrany osobných údajov', type: 'external' },
  ],
  sections: [
    {
      heading: 'Prijatie podmienok',
      paragraphs: [
        'Prístupom alebo používaním ANQR (anqr.link) súhlasíte s tým, že budete viazaní týmito Zmluvnými podmienkami a našimi Zásadami ochrany osobných údajov. Ak s týmito podmienkami nesúhlasíte, stránku nepoužívajte.',
        'Tieto Podmienky môžeme z času na čas aktualizovať. Pokračovanie v používaní stránky po zmenách predstavuje prijatie nových podmienok.',
      ],
    },
    {
      heading: 'Spôsobilosť',
      paragraphs: [
        'Ak chcete používať ANQR, musíte mať aspoň 13 rokov. Používaním stránky vyhlasujete, že spĺňate túto vekovú požiadavku. Ak máte menej ako 18 rokov, vyhlasujete, že máte povolenie svojho rodiča alebo zákonného zástupcu používať túto stránku.',
      ],
    },
    {
      heading: 'Povolené použitie',
      paragraphs: [
        'ANQR môžete používať iba na zákonné účely. Ste výhradne zodpovední za obsah, ktorý kódujete do QR kódov, a za to, ako používate akékoľvek QR kódy, ktoré vygenerujete.',
      ],
    },
    {
      heading: 'Zakázané správanie',
      paragraphs: ['Súhlasíte, že nebudete:'],
      bullets: [
        'Pomocou ANQR vytvorte QR kódy, ktoré uľahčujú phishing, distribúciu škodlivého softvéru, podvody, podvody, obťažovanie, ohováranie alebo akúkoľvek nezákonnú činnosť.',
        'Kódujte obsah, ktorý porušuje práva duševného vlastníctva, porušuje súkromie alebo obsahuje nezákonný materiál.',
        'Pokus o narušenie, preťaženie alebo zásah do prevádzky alebo bezpečnosti stránky.',
        'Spätne analyzujte, dekompilujte alebo sa pokúste extrahovať zdrojový kód z lokality.',
        'Použite automatizované nástroje (boty, škrabky) na prístup na stránku spôsobom, ktorý znižuje výkon pre ostatných používateľov.',
        'Obíďte alebo zakážte akékoľvek funkcie zabezpečenia alebo kontroly prístupu.',
        'Vydávať sa za akúkoľvek osobu alebo subjekt alebo skresľovať svoju príslušnosť.',
      ],
    },
    {
      heading: 'Duševné vlastníctvo',
      paragraphs: [
        'Vlastníctvo obsahu, ktorý zakódujete do QR kódov, si ponechávate. ANQR si nenárokuje vlastníctvo vašich údajov.',
        'Názov ANQR, logo, dizajn rozhrania a základný kód sú chránené autorským právom, ochrannou známkou a inými zákonmi o duševnom vlastníctve. Bez nášho povolenia nesmiete kopírovať, upravovať, distribuovať alebo vytvárať odvodené diela.',
        'QR Code® je registrovaná ochranná známka spoločnosti DENSO WAVE INCORPORATED. ANQR nie je pridružená k DENSO WAVE.',
      ],
    },
    {
      heading: 'Licencia používateľského obsahu',
      paragraphs: [
        'Používaním ANQR nám neudeľujete žiadne práva na váš obsah. Pri použití lokálneho generovania (predvolené nastavenie) sa všetko generovanie QR kódu deje vo vašom prehliadači a my nepristupujeme, neukladáme ani neprenášame vaše zakódované údaje.',
        'Pri použití servera API sa váš obsah spracuje na vygenerovanie obrázka QR, ale neuloží sa, nezaprotokoluje ani sa nepoužíva na žiadny iný účel okrem vykreslenia požadovaného obrázka.',
      ],
    },
    {
      heading: 'Služby a reklama tretích strán',
      paragraphs: [
        'Stránka zobrazuje reklamy prostredníctvom Google AdSense a môže obsahovať odkazy na webové stránky tretích strán. Nezodpovedáme za obsah, služby ani postupy ochrany osobných údajov tretích strán.',
        'Vaše interakcie s inzerentmi a tretími stranami sú výlučne medzi vami a nimi. Informácie o postupoch reklamných údajov nájdete v našich Zásadách ochrany osobných údajov.',
      ],
    },
    {
      heading: 'Vylúčenie záruk',
      paragraphs: [
        'ANQR SA POSKYTUJE NA ZÁKLADE „TAK, AKO JE" A „AKO JE K DISPOZÍCII", BEZ ZÁRUK AKÉHOKOĽVEK DRUHU, VÝSLOVNÝCH ALEBO IMPLICITNÝCH, VRÁTANE, ALE NIE LEN NA IMPLICITNÉ ZÁRUKY PREDAJNOSTI, VHODNOSTI NA KONKRÉTNY ÚČEL N.',
        'Nezaručujeme, že: (a) stránka bude neprerušovaná, bezpečná alebo bezchybná; (b) QR kódy budú skenované vo všetkých prostrediach, na všetkých zariadeniach alebo so všetkými aplikáciami skenera; (c) stránka bude spĺňať vaše požiadavky.',
        'QR kódy by ste mali vždy testovať v podmienkach, v ktorých sa budú používať (veľkosť tlače, osvetlenie, typ obrazovky, vzdialenosť, kvalita fotoaparátu).',
      ],
    },
    {
      heading: 'Obmedzenie zodpovednosti',
      paragraphs: [
        'V MAXIMÁLNOM ROZSAHU POVOLENOM ZÁKONOM, ANQR A JEHO PREVÁDZKOVATELIA, PRIDRUŽENÉ SPOLOČNOSTI A POSKYTOVATELIA LICENCIÍ NEBUDÚ ZODPOVEDNÍ ZA ŽIADNE PRIAMY, NEPRIAME, NÁHODNÉ, ZVLÁŠTNE, NÁSLEDNÉ, TRESTNÉ ALEBO EXEMPLÁRNE NÁHRADY ŠKODY, VRÁTANE NÁHRADY ŠKODY ZISK, VÝNOSY, ÚDAJE, DOBRÉ VIELO, POUŽÍVANIE ALEBO INÉ NEHMOTNÉ STRATY, VYPLÝVAJÚCE Z VÁŠHO PRÍSTUPU ALEBO SÚVISIACE S VÁM ALEBO POUŽÍVANÍM (ALEBO NEMOŽNOSŤOU PRÍSTUPU ALEBO POUŽÍVANIA) SLUŽBY.',
        'VÝSLOVNE ROZUMIETE A SÚHLASÍTE S TÝM, ŽE POUŽÍVANIE SLUŽBY JE NA VLASTNÉ RIZIKO. SLUŽBA JE POSKYTOVANÁ BEZPLATNE A V SÚLADE S TÝM SÚHLASÍTE S TÝM, ŽE ANQR A JEJ PREVÁDZKOVATELIA NENESIE VOČI VÁM ŽIADNU ZODPOVEDNOSŤ ZA AKÉKOĽVEK ŠKODY ALEBO STRATY. NAŠA CELKOVÁ SÚHRNNÁ ZODPOVEDNOSŤ V ŽIADNOM PRÍPADE NEPREKÁŽE NULU DOLÁROV (0 AUD USD).',
        'SÚHLASÍTE S TÝM, ŽE SA UVOĽNÍTE, VZDÁTE SA A UVOĽNÍTE AKÉKOĽVEK NÁROKY, POŽIADAVKY A PRÍČINY AKCIE VOČI ANQR A JEJ PREVÁDZKOVATEĽOM, VZNIKNUTÉ Z VAŠHO POUŽÍVANIA SLUŽBY.',
        'NIEKTORÉ JURISDIKCIE NEPOVOĽUJÚ VYLÚČENIE URČITÝCH ZÁRUK ALEBO OBMEDZENÍ ZODPOVEDNOSTI. V TAKÝCHTO JURISDIKCIÁCH BUDE NAŠA ZODPOVEDNOSŤ OBMEDZENÁ NA MAXIMÁLNY ROZSAH POVOLENÝ PLATNÝM ZÁKONOM.',
      ],
    },
    {
      heading: 'Odškodnenie',
      paragraphs: [
        'Súhlasíte s tým, že odškodníte, budete brániť a chrániť spoločnosť ANQR, jej prevádzkovateľov, pridružené spoločnosti a ich príslušných úradníkov, riaditeľov, zamestnancov a zástupcov pred akýmikoľvek nárokmi, škodami, stratami, záväzkami, nákladmi a výdavkami (vrátane poplatkov za právne služby) vyplývajúcich z: (a) vášho používania stránky; (b) vaše porušenie týchto Podmienok; (c) vaše porušenie práv tretích strán; (d) akýkoľvek obsah, ktorý zakódujete do QR kódov.',
      ],
    },
    {
      heading: 'Riešenie sporov',
      paragraphs: [
        'Akýkoľvek spor vyplývajúci z týchto podmienok alebo z vášho používania ANQR sa najskôr pokúsi vyriešiť neformálnym rokovaním kontaktovaním email@anqr.link.',
        'Ak neformálne riešenie zlyhá, spory sa budú riešiť prostredníctvom záväzného arbitrážneho konania vo Victorii v Austrálii, s výnimkou toho, že ktorákoľvek zo strán môže požiadať súd o prikázanie za porušenie duševného vlastníctva.',
      ],
    },
    {
      heading: 'Vzdanie sa hromadnej žaloby',
      paragraphs: [
        'V ROZSAHU POVOLENOM ZÁKONOM SÚHLASÍTE S TÝM, ŽE AKÉKOĽVEK KONANIE RIEŠENIA SPOROV BUDÚ VEDIEŤ LEN NA INDIVIDUÁLNOM ZÁKLADE A NIE V TRIEDNEJ, KONSOLIDOVANEJ ALEBO ZASTUPITEĽSKEJ AKCIÍ.',
      ],
    },
    {
      heading: 'Rozhodujúce právo',
      paragraphs: [
        'Tieto Podmienky sa riadia zákonmi štátu Victoria, Austrália, bez ohľadu na konflikt zákonov. Súhlasíte s výhradnou jurisdikciou súdov vo Victorii v Austrálii.',
      ],
    },
    {
      heading: 'Zmeny a dostupnosť',
      paragraphs: [
        'Stránku (alebo akúkoľvek jej časť) môžeme kedykoľvek upraviť, pozastaviť alebo prerušiť bez upozornenia alebo zodpovednosti.',
        'Tieto Podmienky môžeme kedykoľvek aktualizovať. Dátum „Posledná aktualizácia" označuje, kedy boli naposledy revidované. Pokračovanie v používaní po zmenách predstavuje prijatie.',
      ],
    },
    {
      heading: 'Oddeliteľnosť',
      paragraphs: [
        'Ak sa niektoré ustanovenie týchto podmienok stane neplatným alebo nevymáhateľným, toto ustanovenie sa bude uplatňovať v maximálnom prípustnom rozsahu a ostatné ustanovenia zostanú v plnej platnosti a účinnosti.',
      ],
    },
    {
      heading: 'Vzdanie sa práva',
      paragraphs: [
        'Naše zlyhanie pri presadzovaní akéhokoľvek práva alebo ustanovenia týchto Podmienok sa nebude považovať za vzdanie sa takéhoto práva alebo ustanovenia.',
      ],
    },
    {
      heading: 'Celá dohoda',
      paragraphs: [
        'Tieto podmienky spolu s našimi zásadami ochrany osobných údajov tvoria úplnú dohodu medzi vami a spoločnosťou ANQR týkajúcu sa vášho používania stránky a nahrádzajú všetky predchádzajúce dohody.',
      ],
    },
    {
      heading: 'vyššej moci',
      paragraphs: [
        'Nenesieme zodpovednosť za žiadne zlyhanie alebo oneskorenie výkonu spôsobené okolnosťami, ktoré nemôžeme primerane ovplyvniť, vrátane prírodných katastrof, vojny, terorizmu, nepokojov, vládnych opatrení alebo zlyhania internetu/infraštruktúry.',
      ],
    },
    {
      heading: 'Kontaktovať',
      paragraphs: ['Otázky týkajúce sa týchto podmienok môžete zaslať na adresu: email@anqr.link'],
    },
  ],
};

export default terms;
