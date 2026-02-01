import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Siza Ukuhumusha i-ANQR',
  description: 'Joyina umphakathi wethu wabahumushi abasiza ukwenza i-ANQR ifinyeleleke kubasebenzisi emhlabeni wonke. Asikho ulwazi lokubhala ngekhodi oludingekayo - nikela ngokuqondile esipheqululini sakho.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Vula Inqolobane Yokuhumusha', type: 'external' },
    { href: '/?lang=${lang}', label: 'Vula iGeneretha', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Mayelana ne-ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Xhumana nathi', type: 'external' },
  ],
  sections: [
    {
      heading: 'Kungani Unikela?',
      paragraphs: ['I-ANQR isetshenziswa abantu emhlabeni wonke ukuze bakhe amakhodi e-QR amabhizinisi, imicimbi, izinkokhelo, namaphrojekthi omuntu siqu. Ngokunikela ngokuhumusha, usiza ukwenza leli thuluzi elinamandla lifinyeleleke kubasebenzisi abakhetha ulimi lwabo lwendabuko.', 'Yonke iminikelo yokuhumusha - noma ukulungisa iphutha noma ukuhumusha lonke ulimi - yenza umehluko wangempela kubasebenzisi emphakathini wakho.'],
    },
    {
      heading: 'Yini Ongayihumusha?',
      paragraphs: ['I-ANQR inezinhlobo ezimbili zokuqukethwe okuhumushekayo:'],
      bullets: ['Izintambo ze-UI: Amalebula ezinkinobho, izinto zemenyu, amathiphu, nombhalo wesixhumi esibonakalayo ovela kulo lonke uhlelo lokusebenza.', 'Okuqukethwe Okumile: Amakhasi amadokhumenti afaka imihlahlandlela, izibonelo, inqubomgomo yobumfihlo, nama-athikili osizo.', 'Zombili izinhlobo zigcinwa njengamafayela ombhalo alula ongakwazi ukuwahlela ngqo esipheqululini sakho - ayidingeki isofthiwe ekhethekile.', 'Ukuhumusha kuyabuyekezwa ngaphambi kokuthi kuhlanganiswe ukuze kuqinisekiswe ikhwalithi nokuvumelana.'],
    },
    {
      heading: 'Unganikela kanjani',
      paragraphs: ['Ukunikela kulula futhi akudingi ulwazi lwe-Git:'],
      bullets: ['Vakashela inqolobane yethu yokuhumusha esesidlangalaleni ku-GitHub.', 'Thola ifayela lakho lolimi (noma dala elisha uma ulimi lwakho lungakasekelwa).', 'Chofoza isithonjana sepensela ukuze uhlele ngqo esipheqululini sakho.', 'Yenza izinguquko zakho bese uchofoza okuthi "Phakamisa izinguquko" - I-GitHub izodala ngokuzenzakalelayo isicelo sokudonsa.', 'Umnikelo wakho uzobuyekezwa futhi uhlanganiswe, ngokuvamile phakathi nezinsuku ezimbalwa.'],
    },
    {
      heading: 'Izinkombandlela Zokuhumusha',
      paragraphs: ['Uma uhumusha, sicela ugcine izimeli ezifana ne-{name}, {count}, kanye ne-{{variable}} zingashintshiwe - lezi zithathelwa indawo amanani aguqukayo ngesikhathi sokusebenza. Futhi gcina noma iyiphi i-syntax efana ne-HTML njengezixhumanisi kufomethi [[/path|Label]].', 'Uma ungaqiniseki ngokuhumusha, kungcono ukukushiya ngesiNgisi kunokuhlinzeka ngokuhumusha okungalungile. Ungakwazi futhi ukuvula inkinga ku-GitHub ukuze ucele ukucaciselwa.'],
    },
    {
      heading: 'Izilimi Ezisekelwayo Okwamanje',
      paragraphs: ['I-ANQR okwamanje isekela izilimi ezingaphezu kuka-40, okuhlanganisa:'],
      bullets: ['Izilimi ezinkulu zomhlaba: isiNgisi, isiShayina, iSpanishi, isi-Arabhu, isiHindi, isiPutukezi, isiJapane, isiKorea, isiFulentshi, isiJalimane, isiRashiya, nokuningi.', 'Izilimi zaseNingizimu-mpumalanga ye-Asia: isiThai, isiVietnam, isi-Indonesian, isiFilipino, isiMalay, isiKhmer, isiLao, isiBurma.', 'Izilimi zase-South Asia: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Ukuqashelwa',
      paragraphs: ['Bonke abanikeli bafakwa kunqolobane yethu. Umsebenzi wakho usiza izinkulungwane zabasebenzisi ukufinyelela i-ANQR ngolimi abaluncamelayo.', 'Siyabonga kubo bonke abanikeli bethu bokuhumusha ngokusiza ukwenza i-ANQR ifinyeleleke emhlabeni wonke!'],
    },
    {
      heading: 'Imibuzo?',
      paragraphs: ['Uma unemibuzo mayelana nokunikela ngokuhunyushwa, sicela uvule inkinga endaweni yethu yokugcina ye-GitHub noma usithinte nge-imeyili. Siyajabula ukukusiza ukuthi uqalise.'],
    },
  ],
};

export default translate;
