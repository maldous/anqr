import type { PageDefinition } from '../types';

export const translate: PageDefinition = {
  title: 'Ajută la traducerea ANQR',
  description: 'Alăturați-vă comunității noastre de traducători pentru a face ANQR accesibil utilizatorilor din întreaga lume. Nu este necesară experiența de codare - contribuiți direct din browser.',
  lastUpdated: '1 februarie 2026',
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Deschideți depozitul de traduceri', type: 'external' },
    { href: '/?lang=${lang}', label: 'Deschideți generatorul', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Despre ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contactaţi-ne', type: 'external' },
  ],
  sections: [
    {
      heading: 'De ce să contribui?',
      paragraphs: ['ANQR este folosit de oameni din întreaga lume pentru a crea coduri QR pentru afaceri, evenimente, plăți și proiecte personale. Contribuind la traduceri, contribuiți la accesibilitatea acestui instrument puternic pentru utilizatorii care preferă limba lor maternă.', 'Fiecare contribuție la traducere - fie că remediați o greșeală de tipar sau traduceți o limbă întreagă - face o diferență reală pentru utilizatorii din comunitatea dvs.'],
    },
    {
      heading: 'Ce poți traduce?',
      paragraphs: ['ANQR are două tipuri de conținut traducabil:'],
      bullets: ['Șiruri de interfață: etichete pentru butoane, elemente de meniu, sfaturi cu instrumente și text de interfață care apare în aplicație.', 'Conținut static: pagini de documentație, inclusiv ghiduri, exemple, politica de confidențialitate și articole de ajutor.', 'Ambele tipuri sunt stocate ca simple fișiere text pe care le puteți edita direct în browser - nu este nevoie de software special.', 'Traducerile sunt revizuite înainte de a fi fuzionate pentru a asigura calitatea și consecvența.'],
    },
    {
      heading: 'Cum să contribui',
      paragraphs: ['Contribuția este ușoară și nu necesită cunoștințe Git:'],
      bullets: ['Vizitați depozitul nostru public de traduceri pe GitHub.', 'Găsiți fișierul de limbă (sau creați unul nou dacă limba dvs. nu este încă acceptată).', 'Faceți clic pe pictograma creion pentru a edita direct în browser.', 'Faceți modificările și faceți clic pe „Propuneți modificări" - GitHub va crea automat o solicitare de extragere.', 'Contribuția dvs. va fi revizuită și îmbinată, de obicei în câteva zile.'],
    },
    {
      heading: 'Ghid de traducere',
      paragraphs: ['Când traduceți, păstrați substituenți precum {name}, {count} și {{variable}} neschimbați - aceștia sunt înlocuiți cu valori dinamice în timpul execuției. De asemenea, păstrați orice sintaxă asemănătoare HTML, cum ar fi link-urile în formatul [[/path|Label]].', 'Dacă nu sunteți sigur despre o traducere, este mai bine să o lăsați în limba engleză decât să furnizați o traducere incorectă. De asemenea, puteți deschide o problemă pe GitHub pentru a cere clarificări.'],
    },
    {
      heading: 'Limbi acceptate în prezent',
      paragraphs: ['ANQR acceptă în prezent peste 40 de limbi, inclusiv:'],
      bullets: ['Limbi majore ale lumii: engleză, chineză, spaniolă, arabă, hindi, portugheză, japoneză, coreeană, franceză, germană, rusă și multe altele.', 'Limbi din Asia de Sud-Est: thailandeză, vietnameză, indoneziană, filipineză, malaeză, khmeră, laosă, birmană.', 'Limbi din Asia de Sud: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepalez.'],
    },
    {
      heading: 'Recunoaştere',
      paragraphs: ['Toți contribuitorii sunt creditați în depozitul nostru. Munca dvs. ajută mii de utilizatori să acceseze ANQR în limba lor preferată.', 'Mulțumim tuturor colaboratorilor noștri de traducere pentru că ne-au ajutat ca ANQR să fie accesibil în întreaga lume!'],
    },
    {
      heading: 'Întrebări?',
      paragraphs: ['Dacă aveți întrebări despre contribuția la traduceri, deschideți o problemă în depozitul nostru GitHub sau contactați-ne prin e-mail. Suntem bucuroși să vă ajutăm să începeți.'],
    },
  ],
};

export default translate;
