import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Wasiliana Nasi',
  description: 'Tunakaribisha maoni, ripoti za hitilafu, maombi ya vipengele na maswali ya jumla.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Jinsi ya kutufikia',
      paragraphs: ['Tunatoa njia kadhaa za kuwasiliana nasi kulingana na mahitaji yako. Tunasoma kila ujumbe, ingawa nyakati za majibu zinaweza kutofautiana kulingana na sauti na aina ya maswali.'],
    },
    {
      heading: 'Barua pepe',
      paragraphs: ['Kwa maswali yote: email@anqr.link', 'Hii ndiyo njia ya kuaminika zaidi ya kutufikia na inapendekezwa kwa maswali ya kina, maswali ya biashara, au maswali mengine yoyote.'],
    },
    {
      heading: 'Aina za maswali',
      bullets: ['Maswali ya jumla: Maswali kuhusu jinsi ya kutumia ANQR, maelezo ya vipengele, au maoni ya jumla.', 'Ripoti za hitilafu: Tafadhali jumuisha kivinjari chako, mfumo wa uendeshaji, hatua za kutoa tena, na ujumbe wowote wa hitilafu unaoona.', 'Maombi ya kipengele: Mapendekezo ya vipengele vipya au maboresho. Tunazingatia maombi yote ingawa hatuwezi kuahidi utekelezaji.', 'Maswali ya biashara: Fursa za ushirikiano, maswali ya leseni, au maswali ya matumizi ya kibiashara.', 'Maombi ya faragha: Maombi ya kutumia haki zako za faragha chini ya GDPR, CCPA, au sheria zingine za faragha (angalia Sera ya Faragha).', 'DMCA/Hakimiliki: Tazama sehemu ya DMCA hapa chini kwa mahitaji ya notisi ya kuondoa.'],
    },
    {
      heading: 'Nyakati za majibu',
      paragraphs: ['Tunalenga kujibu maswali ndani ya siku 5-7 za kazi. Maombi yanayohusiana na faragha yatashughulikiwa ndani ya siku 30 kama inavyotakiwa na sheria.', 'Wakati wa shughuli nyingi, nyakati za majibu zinaweza kuwa ndefu. Kwa masuala ya dharura, tafadhali onyesha "URGENT" katika mada yako.'],
    },
    {
      heading: 'Kabla ya kuwasiliana nasi',
      paragraphs: ['Tafadhali angalia ukurasa wetu wa Hati kwa majibu kwa maswali ya kawaida kuhusu jinsi ya kutumia vipengele vya ANQR. Maswali mengi kuhusu utengenezaji wa msimbo wa QR, uundaji wa mitindo, na chaguo za kuuza nje yanashughulikiwa hapo.'],
    },
    {
      heading: 'Notisi za Hakimiliki za DMCA',
      paragraphs: ['Iwapo unaamini kuwa maudhui yanayopatikana kwenye ANQR yanakiuka hakimiliki yako, unaweza kuwasilisha notisi ya kuondoa Sheria ya Milenia ya Hakimiliki Dijiti (DMCA). Ili kuwa halali, notisi yako lazima ijumuishe:'],
      bullets: ['Sahihi halisi au ya kielektroniki ya mwenye hakimiliki au wakala aliyeidhinishwa.', 'Utambulisho wa kazi iliyo na hakimiliki inayodaiwa kukiukwa.', 'Utambulisho wa nyenzo ambayo inadaiwa kukiuka, na maelezo ya kutosha kuipata.', 'Maelezo yako ya mawasiliano (anwani, nambari ya simu, na barua pepe).', 'Taarifa kwamba una imani ya nia njema kwamba matumizi ya nyenzo hayajaidhinishwa na mwenye hakimiliki.', 'Taarifa, chini ya adhabu ya ushahidi wa uwongo, kwamba maelezo katika notisi yako ni sahihi na kwamba wewe ndiye mwenye hakimiliki au umeidhinishwa kuchukua hatua kwa niaba yao.'],
    },
    {
      heading: 'Mawasiliano ya DMCA',
      paragraphs: ['Tuma arifa za DMCA kwa: email@anqr.link', 'Tafadhali jumuisha "Ilani ya DMCA" kwenye mstari wa mada. Tutajibu arifa halali kwa mujibu wa sheria inayotumika. Kumbuka kuwa ANQR hutengeneza misimbo ya QR ndani ya kifaa kwenye vifaa vya watumiaji na haipangishi maudhui yanayozalishwa na mtumiaji.'],
    },
    {
      heading: 'Jumuiya ya Reddit',
      paragraphs: ['Jiunge na jumuiya yetu ya Reddit katika r/ANQR ili kushiriki kazi zako za QR, kuuliza maswali, kupata usaidizi na kuungana na watumiaji wengine wa ANQR.'],
    },
  ],
};

export default contact;
