import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Tulong sa Pagsasalin ng ANQR',
  description: 'Sumali sa aming komunidad ng mga tagasalin na tumutulong na gawing accessible ang ANQR sa mga user sa buong mundo. Walang kinakailangang karanasan sa coding - direktang mag-ambag mula sa iyong browser.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Buksan ang Translation Repository', type: 'external' },
    { href: '/?lang=${lang}', label: 'Buksan ang Generator', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Tungkol sa ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Makipag-ugnayan sa Amin', type: 'external' },
  ],
  sections: [
    {
      heading: 'Bakit Mag-aambag?',
      paragraphs: ['Ang ANQR ay ginagamit ng mga tao sa buong mundo upang lumikha ng mga QR code para sa mga negosyo, kaganapan, pagbabayad, at personal na proyekto. Sa pamamagitan ng pag-aambag ng mga pagsasalin, nakakatulong kang gawing naa-access ang makapangyarihang tool na ito ng mga user na mas gusto ang kanilang katutubong wika.', 'Ang bawat kontribusyon sa pagsasalin - pag-aayos man ng typo o pagsasalin ng buong wika - ay gumagawa ng tunay na pagkakaiba para sa mga user sa iyong komunidad.'],
    },
    {
      heading: 'Ano ang Maaari Mong Isalin?',
      paragraphs: ['Ang ANQR ay may dalawang uri ng naisasalin na nilalaman:'],
      bullets: ['Mga String ng UI: Mga label ng button, mga item sa menu, tooltip, at text ng interface na lumalabas sa buong app.', 'Static Content: Mga pahina ng dokumentasyon kasama ang mga gabay, halimbawa, patakaran sa privacy, at mga artikulo ng tulong.', 'Ang parehong mga uri ay naka-imbak bilang simpleng mga text file na maaari mong i-edit nang direkta sa iyong browser - walang espesyal na software na kailangan.', 'Sinusuri ang mga pagsasalin bago pagsamahin upang matiyak ang kalidad at pagkakapare-pareho.'],
    },
    {
      heading: 'Paano Mag-ambag',
      paragraphs: ['Ang pag-aambag ay madali at hindi nangangailangan ng kaalaman sa Git:'],
      bullets: ['Bisitahin ang aming pampublikong imbakan ng pagsasalin sa GitHub.', 'Hanapin ang iyong language file (o gumawa ng bago kung hindi pa sinusuportahan ang iyong wika).', 'I-click ang icon na lapis upang direktang mag-edit sa iyong browser.', 'Gawin ang iyong mga pagbabago at i-click ang "Magmungkahi ng mga pagbabago" - Awtomatikong gagawa ng pull request ang GitHub.', 'Susuriin at isasama ang iyong kontribusyon, karaniwan sa loob ng ilang araw.'],
    },
    {
      heading: 'Mga Alituntunin sa Pagsasalin',
      paragraphs: ['Kapag nagsasalin, mangyaring panatilihing hindi nagbabago ang mga placeholder tulad ng {name}, {count}, at {{variable}} - ang mga ito ay pinapalitan ng mga dynamic na halaga sa runtime. Panatilihin din ang anumang HTML-like syntax gaya ng mga link sa format na [[/path|Label]].', 'Kung hindi ka sigurado tungkol sa isang pagsasalin, mas mabuting iwanan ito sa Ingles kaysa magbigay ng maling pagsasalin. Maaari ka ring magbukas ng isyu sa GitHub para humingi ng paglilinaw.'],
    },
    {
      heading: 'Kasalukuyang Sinusuportahang Wika',
      paragraphs: ['Kasalukuyang sinusuportahan ng ANQR ang mahigit 40 wika, kabilang ang:'],
      bullets: ['Mga pangunahing wika sa mundo: English, Chinese, Spanish, Arabic, Hindi, Portuguese, Japanese, Korean, French, German, Russian, at higit pa.', 'Mga wika sa Southeast Asia: Thai, Vietnamese, Indonesian, Filipino, Malay, Khmer, Lao, Burmese.', 'Mga wika sa Timog Asya: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Pagkilala',
      paragraphs: ['Ang lahat ng nag-aambag ay kredito sa aming repositoryo. Nakakatulong ang iyong trabaho sa libu-libong user na ma-access ang ANQR sa kanilang gustong wika.', 'Salamat sa lahat ng aming tagapag-ambag ng pagsasalin sa pagtulong na gawing accessible ang ANQR sa buong mundo!'],
    },
    {
      heading: 'Mga tanong?',
      paragraphs: ['Kung mayroon kang mga tanong tungkol sa pag-aambag ng mga pagsasalin, mangyaring magbukas ng isyu sa aming GitHub repository o makipag-ugnayan sa amin sa pamamagitan ng email. Ikinagagalak naming tulungan kang makapagsimula.'],
    },
  ],
};

export default translate;
