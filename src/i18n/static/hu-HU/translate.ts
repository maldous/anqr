import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Segítség az ANQR lefordításában',
  description: 'Csatlakozzon fordítói közösségünkhöz, és segítsen az ANQR-t elérhetővé tenni a felhasználók számára világszerte. Nincs szükség kódolási tapasztalatra – közvetlenül a böngészőből adjon hozzá segítséget.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Nyissa meg a Fordítástárat', type: 'external' },
    { href: '/?lang=${lang}', label: 'Nyissa meg a Generátort', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Az ANQR-ről', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Lépjen kapcsolatba velünk', type: 'external' },
  ],
  sections: [
    {
      heading: 'Miért járuljunk hozzá?',
      paragraphs: ['Az ANQR-t az emberek világszerte használják QR-kódok létrehozására vállalkozások, események, fizetések és személyes projektek számára. A fordítások közreműködésével hozzájárul ahhoz, hogy ez a hatékony eszköz elérhetővé váljon az anyanyelvüket előnyben részesítő felhasználók számára.', 'Minden fordítási hozzájárulás – akár egy elírási hiba kijavításáról, akár egy teljes nyelv fordításáról van szó – valódi változást jelent a közösség felhasználói számára.'],
    },
    {
      heading: 'Mit tudsz lefordítani?',
      paragraphs: ['Az ANQR kétféle lefordítható tartalommal rendelkezik:'],
      bullets: ['UI karakterláncok: Gombcímkék, menüelemek, eszköztippek és az alkalmazásban megjelenő felületszöveg.', 'Statikus tartalom: Dokumentációs oldalak, beleértve az útmutatókat, példákat, adatvédelmi szabályzatot és súgócikkeket.', 'Mindkét típus egyszerű szöveges fájlként tárolódik, amelyeket közvetlenül a böngészőben szerkeszthet – nincs szükség speciális szoftverre.', 'A fordításokat az összevonás előtt felülvizsgáljuk a minőség és a következetesség biztosítása érdekében.'],
    },
    {
      heading: 'Hogyan járuljunk hozzá',
      paragraphs: ['A hozzájárulás egyszerű, és nem igényel Git ismereteket:'],
      bullets: ['Látogassa meg nyilvános fordítási tárházunkat a GitHubon.', 'Keresse meg a nyelvi fájlt (vagy hozzon létre egy újat, ha a nyelve még nem támogatott).', 'Kattintson a ceruza ikonra a szerkesztéshez közvetlenül a böngészőben.', 'Hajtsa végre a módosításokat, és kattintson a „Módosítások javaslata" gombra – a GitHub automatikusan létrehoz egy lekérési kérelmet.', 'Hozzájárulását általában néhány napon belül felülvizsgáljuk és egyesítjük.'],
    },
    {
      heading: 'Fordítási irányelvek',
      paragraphs: ['Fordításkor ne változtassa meg az olyan helyőrzőket, mint a {name}, {count} és {{variable}} – ezeket a rendszer futás közben dinamikus értékekkel helyettesíti. Ezenkívül őrizzen meg minden HTML-szerű szintaxist, például a [[/path|Label]] formátumú hivatkozásokat.', 'Ha nem biztos a fordításban, jobb, ha angolul hagyja, mintsem hibás fordítást adjon meg. A GitHubon is megnyithat egy problémát, hogy felvilágosítást kérjen.'],
    },
    {
      heading: 'Jelenleg támogatott nyelvek',
      paragraphs: ['Az ANQR jelenleg több mint 40 nyelvet támogat, köztük:'],
      bullets: ['Főbb világnyelvek: angol, kínai, spanyol, arab, hindi, portugál, japán, koreai, francia, német, orosz stb.', 'Délkelet-ázsiai nyelvek: thai, vietnami, indonéz, filippínó, maláj, khmer, laoszi, burmai.', 'Dél-ázsiai nyelvek: hindi, tamil, telugu, bengáli, marathi, gudzsaráti, kannada, malajálam, pandzsábi, nepáli.'],
    },
    {
      heading: 'Elismerés',
      paragraphs: ['Minden közreműködőt jóváírunk tárhelyünkben. Munkájával több ezer felhasználó hozzáférhet az ANQR-hez az általuk választott nyelven.', 'Köszönjük minden fordítási közreműködőnknek, hogy segítettek az ANQR világszerte elérhetővé tételében!'],
    },
    {
      heading: 'Kérdések?',
      paragraphs: ['Ha kérdése van a fordítások közreműködésével kapcsolatban, kérjük, nyisson meg egy problémát a GitHub-tárhelyünkön, vagy lépjen kapcsolatba velünk e-mailben. Örömmel segítünk az indulásban.'],
    },
  ],
};

export default translate;
