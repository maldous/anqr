import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Masharti ya Huduma',
  description: 'Kwa kufikia au kutumia tovuti, unakubali kufungwa na masharti haya.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Sera ya Faragha', type: 'external' }],
  sections: [
    {
      heading: 'Kukubalika kwa masharti',
      paragraphs: ['Kwa kufikia au kutumia ANQR (anqr.link), unakubali kuwa chini ya Sheria na Masharti haya na Sera yetu ya Faragha. Ikiwa hukubaliani na masharti haya, usitumie tovuti.', 'Tunaweza kusasisha Sheria na Masharti haya mara kwa mara. Kuendelea kwa matumizi ya tovuti baada ya mabadiliko kunajumuisha ukubali wa masharti mapya.'],
    },
    {
      heading: 'Kustahiki',
      paragraphs: ['Lazima uwe na angalau umri wa miaka 13 ili kutumia ANQR. Kwa kutumia tovuti, unawakilisha kwamba unakidhi mahitaji haya ya umri. Ikiwa una umri wa chini ya miaka 18, unawakilisha kwamba una ruhusa ya mzazi au mlezi wako kutumia tovuti.'],
    },
    {
      heading: 'Utumizi unaoruhusiwa',
      paragraphs: ['Unaweza kutumia ANQR kwa madhumuni halali pekee. Unawajibika kikamilifu kwa maudhui unayosimba kwenye misimbo ya QR na jinsi unavyotumia misimbo yoyote ya QR unayozalisha.'],
    },
    {
      heading: 'Tabia iliyopigwa marufuku',
      paragraphs: ['Unakubali kutofanya:'],
      bullets: ['Tumia ANQR kuunda misimbo ya QR inayowezesha hadaa, usambazaji wa programu hasidi, ulaghai, ulaghai, unyanyasaji, kashfa au shughuli zozote zisizo halali.', 'Weka msimbo maudhui ambayo yanakiuka haki miliki, inakiuka faragha, au yana nyenzo zisizo halali.', 'Jaribio la kuvuruga, kupakia kupita kiasi, au kuingilia uendeshaji au usalama wa tovuti.', 'Badilisha mhandisi, tenganisha, au jaribu kutoa msimbo wa chanzo kutoka kwa tovuti.', 'Tumia zana za kiotomatiki (bots, scrapers) kufikia tovuti kwa namna ambayo inadhalilisha utendakazi kwa watumiaji wengine.', 'Zungusha au uzime vipengele vyovyote vya usalama au udhibiti wa ufikiaji.', 'Iga mtu au huluki yoyote au wakilisha vibaya ushirika wako.'],
    },
    {
      heading: 'Mali ya kiakili',
      paragraphs: ['Unahifadhi umiliki wa maudhui unayosimba kwenye misimbo ya QR. ANQR haidai umiliki wa data yako.', 'Jina la ANQR, nembo, muundo wa kiolesura, na msimbo msingi zinalindwa na hakimiliki, chapa ya biashara na sheria zingine za uvumbuzi. Huruhusiwi kunakili, kurekebisha, kusambaza, au kuunda kazi nyinginezo bila idhini yetu.', 'QR Code® ni chapa ya biashara iliyosajiliwa ya DENSO WAVE INCORPORATED. ANQR haihusiani na DENSO WAVE.'],
    },
    {
      heading: 'Leseni ya maudhui ya mtumiaji',
      paragraphs: ['Kwa kutumia ANQR, hutupi haki kwa maudhui yako. Unapotumia kizazi cha ndani (chaguo-msingi), utengenezaji wote wa msimbo wa QR hufanyika kwenye kivinjari chako na hatufikii, hatuhifadhi, au kusambaza data yako iliyosimbwa.', 'Unapotumia API ya upande wa seva, maudhui yako yanachakatwa ili kutoa picha ya QR lakini hayahifadhiwi, kurekodiwa, au kutumika kwa madhumuni mengine yoyote zaidi ya kutoa picha iliyoombwa.'],
    },
    {
      heading: 'Huduma za mtu wa tatu na matangazo',
      paragraphs: ['Tovuti inaonyesha matangazo kupitia Google Adsense na inaweza kujumuisha viungo vya tovuti za watu wengine. Hatuwajibiki kwa maudhui ya wahusika wengine, huduma au desturi za faragha.', 'Mwingiliano wako na watangazaji na washirika wengine ni kati yako na wao pekee. Tazama Sera yetu ya Faragha kwa maelezo kuhusu mbinu za data ya utangazaji.'],
    },
    {
      heading: 'Kanusho la dhamana',
      paragraphs: ['ANQR IMETOLEWA KWA MSINGI WA "KAMA ILIVYO" NA "INAVYOPATIKANA" BILA DHAMANA YA AINA YOYOTE, WAZI AU INAYODHANISHWA, IKIWEMO LAKINI SIO KIKOMO KWA DHAMANA ILIYOHUSISHWA YA UUZAJI, KUFAA KWA DHIMA FULANI, NA MAADILI MAALUM.', 'Hatutoi uthibitisho kwamba: (a) tovuti haitakatizwa, salama, au bila hitilafu; (b) Misimbo ya QR itachanganua katika mazingira yote, kwenye vifaa vyote, au kwa programu zote za kichanganuzi; (c) tovuti itatimiza mahitaji yako.', 'Unapaswa kujaribu misimbo ya QR kila wakati katika hali ambayo itatumika (ukubwa wa kuchapisha, mwangaza, aina ya skrini, umbali, ubora wa kamera).'],
    },
    {
      heading: 'Ukomo wa dhima',
      paragraphs: ['KWA KIWANGO CHA JUU INAYORUHUSIWA NA SHERIA, ANQR NA WAENDESHAJI WAKE, WASHIRIKA, NA WAPE LESENI HAWATAWAJIBIKA KWA DHIMA YOYOTE YA MOJA KWA MOJA, YA MOJA KWA MOJA, MAALUM, YA MATOKEO, ADHABU, AU MIFANO, DHAMANA YOYOTE. HASARA YA FAIDA, MAPATO, DATA, NIA, MATUMIZI, AU HASARA NYINGINE AMBAYO INAYOTOKANA NA AU INAYOHUSIANA NA UPATIKANAJI WAKO WA AU MATUMIZI YA (AU KUTOWEZA KUPATA AU KUTUMIA) HUDUMA.', 'UNAELEWA NA KUKUBALI KWA HASARA KWAMBA MATUMIZI YAKO YA HUDUMA YAKO KATIKA HATARI YAKO PEKEE. HUDUMA HIYO HUTOLEWA BILA MALIPO, NA KWA MUJIBU WAKE, UNAKUBALI KWAMBA ANQR NA WAENDESHAJI WAKE HAWATAWAJIBIKA KWAKO YOYOTE KWA UHARIBIFU AU HASARA YOYOTE. HAKUNA TUKIO HATA DHIMA YETU YOTE YA JUMLA HAITAZIDI DOLA SIFURI ($0 AUD).', 'UNAKUBALI KUACHILIA, KUACHA, NA KUTOA MADAI, MADAI, NA SABABU ZA HATUA DHIDI YA ANQR NA WAENDESHAJI WAKE ZINAZOTOKANA NA MATUMIZI YAKO YA HUDUMA.', 'BAADHI YA MAMLAKA HAYARUHUSU KUTOTOLEWA KWA DHAMANA FULANI AU MIPAKA YA DHIMA. KATIKA MAMLAKA HIZO, DHIMA YETU ITAKUWA NI KIASI CHA KIASI INACHORUHUSIWA NA SHERIA INAYOTUMIKA.'],
    },
    {
      heading: 'Kufidia',
      paragraphs: ['Unakubali kufidia, kutetea na kushikilia ANQR isiyo na madhara, waendeshaji wake, washirika wake, na maafisa wao, wakurugenzi, wafanyakazi na mawakala kutokana na madai, uharibifu, hasara, dhima, gharama na gharama zozote (pamoja na ada za kisheria) zinazotokana na: (a) matumizi yako ya tovuti; (b) ukiukaji wako wa Masharti haya; (c) ukiukaji wako wa haki zozote za watu wengine; (d) maudhui yoyote unayosimba kwenye misimbo ya QR.'],
    },
    {
      heading: 'Utatuzi wa mzozo',
      paragraphs: ['Mzozo wowote unaotokana na Masharti haya au matumizi yako ya ANQR kwanza yatajaribu kusuluhishwa kupitia mazungumzo yasiyo rasmi kwa kuwasiliana na barua pepe@anqr.link.', 'Usuluhishi usio rasmi ukishindikana, mizozo itasuluhishwa kupitia usuluhishi unaoshurutisha huko Victoria, Australia, isipokuwa kwamba upande wowote unaweza kutafuta afueni ya amri mahakamani kwa ukiukaji wa mali miliki.'],
    },
    {
      heading: 'Kuondolewa kwa hatua ya darasa',
      paragraphs: ['KWA KIWANGO INACHORUHUSIWA NA SHERIA, UNAKUBALI KWAMBA HATUA ZOZOTE ZA KUTATUA MIGOGORO ITAFANYIKA KWA MSINGI WA MTU BINAFSI NA SI KWA DARAJA, KUUNGANISHWA, AU HATUA YA UWAKILISHAJI.'],
    },
    {
      heading: 'Sheria inayoongoza',
      paragraphs: ['Masharti haya yanasimamiwa na sheria za Victoria, Australia, bila kuzingatia kanuni za mgongano wa sheria. Unakubali mamlaka ya kipekee ya mahakama iliyoko Victoria, Australia.'],
    },
    {
      heading: 'Mabadiliko na upatikanaji',
      paragraphs: ['Tunaweza kurekebisha, kusimamisha, au kusimamisha tovuti (au sehemu yake yoyote) wakati wowote bila taarifa au dhima.', 'Tunaweza kusasisha Sheria na Masharti haya wakati wowote. Tarehe ya "Kusasishwa mara ya mwisho" inaonyesha wakati yalisahihishwa hivi majuzi. Kuendelea kutumia baada ya mabadiliko kunajumuisha kukubalika.'],
    },
    {
      heading: 'Upungufu',
      paragraphs: ['Iwapo kifungu chochote cha Sheria na Masharti haya kinashikiliwa kuwa batili au hakitekelezeki, utoaji huo utatekelezwa kwa kiwango cha juu zaidi kinachoruhusiwa, na masharti yaliyosalia yatabaki kuwa na nguvu na athari.'],
    },
    {
      heading: 'Msamaha',
      paragraphs: ['Kushindwa kwetu kutekeleza haki yoyote au utoaji wa Sheria na Masharti haya haitachukuliwa kuwa ni kuondolewa kwa haki au utoaji kama huo.'],
    },
    {
      heading: 'Mkataba mzima',
      paragraphs: ['Masharti haya, pamoja na Sera yetu ya Faragha, yanajumuisha makubaliano yote kati yako na ANQR kuhusu matumizi yako ya tovuti na kuchukua nafasi ya makubaliano yoyote ya awali.'],
    },
    {
      heading: 'Nguvu kuu',
      paragraphs: ['Hatutawajibika kwa kushindwa au kucheleweshwa kwa utendakazi kutokana na hali zilizo nje ya uwezo wetu, ikiwa ni pamoja na majanga ya asili, vita, ugaidi, ghasia, hatua za serikali au kushindwa kwa mtandao/miundombinu.'],
    },
    {
      heading: 'Wasiliana',
      paragraphs: ['Maswali kuhusu Masharti haya yanaweza kutumwa kwa: email@anqr.link'],
    },
  ],
};

export default terms;
