import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Saidia Kutafsiri ANQR',
  description: 'Jiunge na jumuiya yetu ya watafsiri wanaosaidia kufanya ANQR kupatikana kwa watumiaji duniani kote. Hakuna matumizi ya usimbaji yanayohitajika - toa moja kwa moja kutoka kwa kivinjari chako.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Fungua Hifadhi ya Tafsiri', type: 'external' },
    { href: '/?lang=${lang}', label: 'Fungua Jenereta', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Kuhusu ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Wasiliana Nasi', type: 'external' },
  ],
  sections: [
    {
      heading: 'Kwa Nini Uchangie?',
      paragraphs: ['ANQR hutumiwa na watu duniani kote kuunda misimbo ya QR ya biashara, matukio, malipo na miradi ya kibinafsi. Kwa kuchangia tafsiri, unasaidia kufanya zana hii thabiti ipatikane na watumiaji wanaopendelea lugha yao ya asili.', 'Kila mchango wa tafsiri - iwe kurekebisha makosa ya kuandika au kutafsiri lugha nzima - huleta mabadiliko ya kweli kwa watumiaji katika jumuiya yako.'],
    },
    {
      heading: 'Unaweza Kutafsiri Nini?',
      paragraphs: ['ANQR ina aina mbili za maudhui yanayoweza kutafsiriwa:'],
      bullets: ['Mifuatano ya UI: Lebo za vitufe, vipengee vya menyu, vidokezo vya zana na maandishi ya kiolesura yanayoonekana kote kwenye programu.', 'Maudhui Tuli: Kurasa za hati ikiwa ni pamoja na miongozo, mifano, sera ya faragha na makala ya usaidizi.', 'Aina zote mbili zimehifadhiwa kama faili rahisi za maandishi ambazo unaweza kuhariri moja kwa moja kwenye kivinjari chako - hakuna programu maalum inahitajika.', 'Tafsiri hukaguliwa kabla ya kuunganishwa ili kuhakikisha ubora na uthabiti.'],
    },
    {
      heading: 'Jinsi ya Kuchangia',
      paragraphs: ['Kuchangia ni rahisi na hauhitaji maarifa ya Git:'],
      bullets: ['Tembelea hazina yetu ya tafsiri ya umma kwenye GitHub.', 'Tafuta faili yako ya lugha (au unda mpya ikiwa lugha yako bado haijaauniwa).', 'Bofya ikoni ya penseli ili kuhariri moja kwa moja kwenye kivinjari chako.', 'Fanya mabadiliko yako na ubofye "Pendekeza mabadiliko" - GitHub itaunda ombi la kuvuta kiotomatiki.', 'Mchango wako utakaguliwa na kuunganishwa, kwa kawaida ndani ya siku chache.'],
    },
    {
      heading: 'Miongozo ya Tafsiri',
      paragraphs: ['Wakati wa kutafsiri, tafadhali weka vishikilia nafasi kama vile {name}, {count}, na {{variable}} bila kubadilishwa - hizi hubadilishwa na thamani zinazobadilika wakati wa utekelezaji. Pia hifadhi sintaksia yoyote inayofanana na HTML kama vile viungo katika umbizo [[/path|Label]].', 'Ikiwa huna uhakika kuhusu tafsiri, ni bora kuiacha katika Kiingereza kuliko kutoa tafsiri isiyo sahihi. Unaweza pia kufungua suala kwenye GitHub ili kuuliza ufafanuzi.'],
    },
    {
      heading: 'Lugha Zinazotumika Kwa Sasa',
      paragraphs: ['ANQR kwa sasa inaauni zaidi ya lugha 40, ikijumuisha:'],
      bullets: ['Lugha kuu za ulimwengu: Kiingereza, Kichina, Kihispania, Kiarabu, Kihindi, Kireno, Kijapani, Kikorea, Kifaransa, Kijerumani, Kirusi, na zaidi.', 'Lugha za Asia ya Kusini-mashariki: Thai, Kivietinamu, Kiindonesia, Kifilipino, Kimalei, Khmer, Lao, Kiburma.', 'Lugha za Asia ya Kusini: Kihindi, Kitamil, Kitelugu, Kibengali, Kimarathi, Kigujarati, Kikannada, Kimalayalam, Kipunjabi, Kinepali.'],
    },
    {
      heading: 'Utambuzi',
      paragraphs: ['Wachangiaji wote wametolewa kwenye hazina yetu. Kazi yako husaidia maelfu ya watumiaji kufikia ANQR katika lugha wanayopendelea.', 'Asante kwa wachangiaji wetu wote wa tafsiri kwa kusaidia kufanya ANQR kupatikana duniani kote!'],
    },
    {
      heading: 'Maswali?',
      paragraphs: ['Ikiwa una maswali kuhusu kuchangia tafsiri, tafadhali fungua suala kwenye hazina yetu ya GitHub au wasiliana nasi kupitia barua pepe. Tunafurahi kukusaidia kuanza.'],
    },
  ],
};

export default translate;
