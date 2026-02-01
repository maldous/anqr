import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Kuhusu ANQR',
  description: 'ANQR ni jenereta isiyolipishwa ya msimbo wa QR yenye mbinu ya mteja-kwanza - tengeneza misimbo ya QR ndani ya nchi au tumia API yetu kupachika.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Fungua jenereta', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Vinjari Makala ya Jifunze', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Sera ya Faragha', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Masharti ya Huduma', type: 'external' },
  ],
  sections: [
    {
      heading: 'ANQR ni nini?',
      paragraphs: ['ANQR (inayotamkwa "nanga") ni jenereta isiyolipishwa ya msimbo wa QR ambayo huunda misimbo inayoweza kuchanganuliwa kwa URL, maandishi, vitambulisho vya Wi-Fi, kadi za mawasiliano, matukio ya kalenda na zaidi.', 'Imeundwa kwa ajili ya watu binafsi, biashara ndogo ndogo, wauzaji soko na wasanidi programu ambao wanataka zana zenye nguvu za QR bila kujisajili. Muundo wa mteja wa kwanza unamaanisha misimbo ya QR inazalishwa ndani ya kivinjari chako kwa chaguo-msingi, na API ya seva ya hiari ya kupachikwa na kuunganishwa kwa kitaalamu.'],
    },
    {
      heading: 'Vipengele muhimu',
      bullets: ['Tengeneza misimbo ya QR papo hapo kwenye kivinjari chako - hakuna akaunti inayohitajika.', 'Geuza rangi kukufaa, mitindo ya moduli, ruwaza za vipataji, na uongeze viwekeleo vya picha.', 'Hamisha katika miundo mingi: PNG, SVG, WebP, na GIF iliyohuishwa.', 'Vidhibiti vya hali ya juu vya kiwango cha kurekebisha makosa, toleo la QR, hali ya usimbaji na uteuzi wa barakoa.', 'Mwongozo wa usalama wa kuchanganua na onyesho la kukagua moja kwa moja ili kusaidia kuweka misimbo isomeke katika magazeti na skrini.', 'API ya upande wa seva ya upachikaji wa kitaalamu kwa usaidizi kamili wa vigezo.', 'Inafanya kazi nje ya mtandao mara tu inapopakiwa - ni programu tuli ya wavuti ambayo unaweza kuendesha popote.'],
    },
    {
      heading: 'Jinsi ANQR inavyofanya kazi',
      paragraphs: ['ANQR hutumika katika kivinjari chako na kusimba ingizo lako katika mkusanyiko wa kawaida wa QR na urekebishaji wa hitilafu ya Reed–Solomon, kisha kuuwasilisha kwa umbizo ulilochagua.', 'Kwa chaguo-msingi, uzalishaji hutokea ndani ya kivinjari chako. Kwa matumizi ya kitaaluma, unaweza pia kutumia API ya upande wa seva kutengeneza misimbo ya QR kupitia vigezo vya URL - bora zaidi kwa kupachika kwenye tovuti, barua pepe, au utiririshaji kazi otomatiki.', 'Unapoongeza viwekeleo au uhuishaji, ANQR husawazisha mtindo na utegemezi wa kuchanganua ili matokeo yaendelee kuchanganuliwa.', 'ANQR inaangazia misimbo tuli (data iko ndani ya QR). Iwapo unahitaji msimbo unaobadilika (mahali panapoweza kuhaririwa), unaweza kusimba URL yako ya kuelekeza kwingine au kiungo kifupi.'],
    },
    {
      heading: 'Nani anaendesha ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Utangazaji na jinsi tunavyokaa bila malipo',
      paragraphs: ['ANQR ni bure kutumia na inaauniwa na utangazaji. Tunaweza kuonyesha matangazo kupitia Google Adsense na/au washirika wengine wa utangazaji.', 'Watoa huduma za matangazo wanaweza kutumia vidakuzi au teknolojia kama hiyo kubinafsisha matangazo kulingana na mambo yanayokuvutia na shughuli za kuvinjari. Unaweza kudhibiti mapendeleo ya matangazo katika mipangilio ya kifaa chako na kupitia mipangilio ya matangazo ya Google, na upate maelezo zaidi katika Sera yetu ya Faragha.', 'Hatuuzi maudhui unayosimba kwenye misimbo ya QR. Matangazo husaidia kulipia gharama ya kuendesha na kuboresha mradi.'],
    },
    {
      heading: 'Viwango vya wazi',
      paragraphs: ['ANQR hutengeneza misimbo ya QR kulingana na kiwango cha ISO/IEC 18004 na inalenga upatanifu mpana kwenye vichanganuzi, kamera, na uchapaji kazi wa kuchapisha.'],
    },
    {
      heading: 'Notisi ya alama ya biashara',
      paragraphs: ['QR Code® ni chapa ya biashara iliyosajiliwa ya DENSO WAVE INCORPORATED. ANQR haihusiani na, kuidhinishwa na, au kufadhiliwa na DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Maoni na michango',
      paragraphs: ['Tunakaribisha maoni, ripoti za hitilafu na mapendekezo ya vipengele. Tafadhali wasiliana kupitia barua pepe au ukurasa wa mawasiliano - tunasoma kila ujumbe, ingawa nyakati za majibu zinaweza kutofautiana.'],
    },
  ],
};

export default about;
