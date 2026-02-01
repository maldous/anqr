import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Ndihmoni për të përkthyer ANQR',
  description: 'Bashkohuni me komunitetin tonë të përkthyesve që ndihmojnë për ta bërë ANQR të aksesueshme për përdoruesit në mbarë botën. Nuk kërkohet përvojë kodimi - kontribuoni drejtpërdrejt nga shfletuesi juaj.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Hapni Depon e Përkthimit', type: 'external' },
    { href: '/?lang=${lang}', label: 'Hapni Gjeneratorin', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Rreth ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Na kontaktoni', type: 'external' },
  ],
  sections: [
    {
      heading: 'Pse Kontribuoni?',
      paragraphs: ['ANQR përdoret nga njerëz në mbarë botën për të krijuar kode QR për biznese, ngjarje, pagesa dhe projekte personale. Duke kontribuar në përkthime, ju ndihmoni që ky mjet i fuqishëm të jetë i arritshëm për përdoruesit që preferojnë gjuhën e tyre amtare.', 'Çdo kontribut përkthimi - qoftë korrigjimi i një gabimi shtypi apo përkthimi i një gjuhe të tërë - bën një ndryshim të vërtetë për përdoruesit në komunitetin tuaj.'],
    },
    {
      heading: 'Çfarë mund të përktheni?',
      paragraphs: ['ANQR ka dy lloje të përmbajtjes së përkthyeshme:'],
      bullets: ['Strings UI: Etiketat e butonave, artikujt e menysë, këshillat e veglave dhe teksti i ndërfaqes që shfaqet në të gjithë aplikacionin.', 'Përmbajtja statike: Faqet e dokumentacionit duke përfshirë udhëzues, shembuj, politikë të privatësisë dhe artikuj ndihmës.', 'Të dy llojet ruhen si skedarë të thjeshtë teksti që mund t\'i modifikoni drejtpërdrejt në shfletuesin tuaj - nuk nevojitet softuer special.', 'Përkthimet rishikohen përpara se të bashkohen për të siguruar cilësi dhe qëndrueshmëri.'],
    },
    {
      heading: 'Si të Kontribuoni',
      paragraphs: ['Kontributi është i lehtë dhe nuk kërkon njohuri të Git:'],
      bullets: ['Vizitoni depon tonë të përkthimit publik në GitHub.', 'Gjeni skedarin tuaj të gjuhës (ose krijoni një të ri nëse gjuha juaj nuk mbështetet ende).', 'Klikoni ikonën e lapsit për ta modifikuar drejtpërdrejt në shfletuesin tuaj.', 'Bëni ndryshimet tuaja dhe klikoni "Propozoni ndryshime" - GitHub do të krijojë automatikisht një kërkesë tërheqjeje.', 'Kontributi juaj do të shqyrtohet dhe shkrihet, zakonisht brenda pak ditësh.'],
    },
    {
      heading: 'Udhëzimet e përkthimit',
      paragraphs: ['Kur përktheni, mbajini të pandryshuar mbajtësit e vendeve si {name}, {count} dhe {{variable}} - këto zëvendësohen me vlera dinamike në kohën e ekzekutimit. Ruani gjithashtu çdo sintaksë të ngjashme me HTML, si lidhjet në formatin [[/path|Label]].', 'Nëse nuk jeni të sigurt për një përkthim, është më mirë ta lini atë në anglisht sesa të jepni një përkthim të pasaktë. Ju gjithashtu mund të hapni një problem në GitHub për të kërkuar sqarime.'],
    },
    {
      heading: 'Gjuhët e mbështetura aktualisht',
      paragraphs: ['ANQR aktualisht mbështet mbi 40 gjuhë, duke përfshirë:'],
      bullets: ['Gjuhët kryesore botërore: anglisht, kinezisht, spanjisht, arabisht, hindisht, portugalisht, japonisht, koreanisht, frëngjisht, gjermanisht, rusisht dhe më shumë.', 'Gjuhët e Azisë Juglindore: Tajlandisht, Vietnamisht, Indonezisht, Filipinase, Malajze, Kmere, Lao, Birmanisht.', 'Gjuhët e Azisë Jugore: Hindi, Tamile, Telugu, Bengalisht, Maratisht, Guxharatisht, Kanada, Malajalame, Punjabi, Nepalisht.'],
    },
    {
      heading: 'Njohja',
      paragraphs: ['Të gjithë kontribuesit janë kredituar në depon tonë. Puna juaj ndihmon mijëra përdorues të aksesojnë ANQR në gjuhën e tyre të preferuar.', 'Faleminderit të gjithë kontribuesve tanë të përkthimit që ndihmuan për ta bërë ANQR të aksesueshme në mbarë botën!'],
    },
    {
      heading: 'Pyetje?',
      paragraphs: ['Nëse keni pyetje në lidhje me kontributin e përkthimeve, ju lutemi hapni një problem në depon tonë të GitHub ose na kontaktoni me email. Ne jemi të lumtur t\'ju ndihmojmë të filloni.'],
    },
  ],
};

export default translate;
