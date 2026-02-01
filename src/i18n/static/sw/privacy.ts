import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Sera ya Faragha',
  description:
    'Maelezo ambayo ANQR hukusanya, jinsi yanavyotumiwa na haki zako chini ya sheria zinazotumika za faragha.',
  lastUpdated: '1 Februari 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Masharti ya Huduma', type: 'external' }],
  sections: [
    {
      heading: 'Muhtasari',
      paragraphs: [
        'ANQR ni jenereta ya msimbo wa QR yenye mbinu ya mteja-kwanza. Hatuhitaji ufungue akaunti. Kwa chaguo-msingi, misimbo ya QR inazalishwa ndani ya nchi katika kivinjari chako - hatuna ufikiaji wa maudhui unayosimba.',
        'Kwa matumizi ya kitaalamu, ANQR hutoa API ya upande wa seva ambayo hutengeneza misimbo ya QR kutoka kwa vigezo vya URL. Unapotumia API, maudhui yako ya QR huchakatwa kwenye seva zetu ili kutoa picha, lakini hayahifadhiwi au kurekodiwa.',
        'Tunatumia Google Adsense kwa utangazaji na tunaweza kutumia huduma za uchanganuzi. Huduma hizi hukusanya taarifa kupitia vidakuzi na teknolojia zinazofanana. Sera hii inaeleza ni data gani inakusanywa, jinsi inavyotumiwa na haki zako.',
      ],
    },
    {
      heading: 'Habari tunazokusanya',
      bullets: [
        'Maelezo unayotoa: Ukiwasiliana nasi kupitia barua pepe au fomu yetu ya mawasiliano, tunakusanya jina lako, anwani ya barua pepe na maudhui ya ujumbe.',
        'Taarifa zilizokusanywa kiotomatiki: Mtoa huduma wetu wa upangishaji (Netlify), washirika wa utangazaji na huduma za uchanganuzi zinaweza kukusanya: Anwani ya IP, aina ya kivinjari na toleo, mfumo wa uendeshaji, aina ya kifaa, URL inayorejelea, kurasa zilizotembelewa, saa kwenye tovuti, na takriban eneo la kijiografia.',
        'Vidakuzi vya watu wengine: Washirika wetu wa utangazaji (Google AdSense) hutumia vidakuzi na teknolojia kama hiyo kutoa na kupima matangazo. ANQR yenyewe haiweki vidakuzi vyovyote vya mtu wa kwanza.',
      ],
    },
    {
      heading: 'Vidakuzi na teknolojia za wahusika wengine',
      paragraphs: [
        'ANQR haiweki vidakuzi vyovyote vya mtu wa kwanza. Mapendeleo yako (kama vile hali ya giza) huhifadhiwa ndani ya kifaa chako, ambayo haitumiwi kwa seva yoyote.',
        'Hata hivyo, washirika wetu wa utangazaji (Google AdSense) na mtoa huduma wa upangishaji wanaweza kutumia vidakuzi na teknolojia sawa za kufuatilia:',
      ],
      bullets: [
        'Vidakuzi vya utangazaji (wahusika wengine): Imewekwa na Google AdSense na washirika wa utangazaji ili kutoa matangazo yanayofaa, kupima utendaji wa tangazo na kuelewa maslahi ya watumiaji. Vidakuzi hivi vinaweza kufuatilia shughuli zako kwenye tovuti tofauti.',
        'Vidakuzi vya uchanganuzi (wahusika wengine): Inaweza kutumiwa na mtoa huduma wetu mwenyeji au huduma za uchanganuzi kukusanya data ya matumizi isiyojulikana.',
      ],
    },
    {
      heading: 'Google Adsense na utangazaji',
      paragraphs: [
        'Tunaonyesha matangazo kupitia Google Adsense. Google na washirika wake hutumia vidakuzi kutoa matangazo kulingana na historia yako ya kuvinjari kwenye tovuti hii na tovuti zingine (matangazo yanayotegemea maslahi).',
        'Jifunze jinsi Google hutumia maelezo yako: https://policies.google.com/technologies/partner-sites',
        'Dhibiti ubinafsishaji wa matangazo: https://adssettings.google.com',
        'Jiondoe kupitia Mpango wa Utangazaji wa Mtandao: https://optout.networkadvertising.org',
        'Jiondoe kupitia Muungano wa Utangazaji wa Dijiti: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Jinsi tunavyotumia habari',
      bullets: [
        'Ili kujibu maswali yako na kutoa usaidizi.',
        'Ili kuonyesha matangazo muhimu kupitia washirika wetu wa utangazaji.',
        'Ili kuchanganua matumizi ya tovuti na kuboresha huduma zetu.',
        'Ili kugundua, kuzuia na kushughulikia ulaghai, matumizi mabaya na masuala ya usalama.',
        'Kuzingatia majukumu ya kisheria.',
      ],
    },
    {
      heading: 'Huduma za mtu wa tatu',
      bullets: [
        'Google Adsense: Hupokea data ya kutoa na kupima matangazo.',
        'Watoa huduma za uchanganuzi: Pokea data ya matumizi isiyojulikana.',
        'Netlify (mwenyeji): Huchakata maombi na inaweza kuweka anwani za IP.',
        'Hatuuzi maelezo yako ya kibinafsi. Hata hivyo, kushiriki data na washirika wa utangazaji kunaweza kuchukuliwa kuwa "mauzo" chini ya CCPA (tazama hapa chini).',
      ],
    },
    {
      heading: 'Uhifadhi wa data',
      bullets: [
        'Mawasilisho ya mawasiliano: Hadi miaka 2.',
        'Kumbukumbu za seva: Hadi siku 30 (mtoa huduma mwenyeji).',
        'Data ya uchanganuzi: Hadi miezi 26 (bila jina).',
        'Vidakuzi vya utangazaji: Kwa kawaida miezi 13 (hutofautiana kulingana na mshirika).',
      ],
    },
    {
      heading: 'Haki zako chini ya GDPR (watumiaji wa EEA)',
      paragraphs: [
        'Ikiwa uko katika Eneo la Kiuchumi la Ulaya, una haki zifuatazo chini ya Kanuni ya Jumla ya Ulinzi wa Data:',
      ],
      bullets: [
        'Haki ya ufikiaji: Omba nakala ya data ya kibinafsi tuliyo nayo kukuhusu.',
        'Haki ya kurekebisha: Omba marekebisho ya data isiyo sahihi.',
        'Haki ya kufuta: Omba data yako ifutwe ("haki ya kusahaulika").',
        'Haki ya kuzuia uchakataji: Omba vikomo kuhusu jinsi tunavyotumia data yako.',
        'Haki ya kubebeka kwa data: Omba data yako katika umbizo linalobebeka.',
        'Haki ya kupinga: Inapinga usindikaji, ikijumuisha uuzaji wa moja kwa moja.',
        'Haki ya kuondoa kibali: Ondoa idhini wakati wowote ambapo usindikaji unategemea idhini.',
        'Haki ya kuwasilisha malalamiko: Tuma malalamiko kwa mamlaka yako ya ulinzi wa data.',
      ],
    },
    {
      heading: 'Msingi wa kisheria wa GDPR',
      paragraphs: [
        'Tunachakata data kwa misingi hii: (a) Idhini - kwa utangazaji wa kibinafsi (unaodhibitiwa na washirika wetu wa utangazaji); (b) Maslahi halali - kwa uchanganuzi, usalama na uboreshaji; (c) Mkataba - kujibu maswali.',
        'Ili kutekeleza haki zako, wasiliana na barua pepe@anqr.link. Tunajibu ndani ya siku 30.',
      ],
    },
    {
      heading: 'Haki zako chini ya CCPA (watumiaji wa California)',
      bullets: [
        'Haki ya kujua: Omba maelezo kuhusu data iliyokusanywa, vyanzo, madhumuni na wahusika wengine.',
        'Haki ya kufuta: Omba kufutwa kwa maelezo yako ya kibinafsi.',
        'Haki ya kujiondoa: Chagua kutoka kwa "uuzaji" wa maelezo ya kibinafsi (kushiriki na washirika wa tangazo kunaweza kufuzu).',
        'Haki ya kutobaguliwa: Hatutabagua kwa kutumia haki zako.',
      ],
    },
    {
      heading: 'Kategoria za CCPA zimekusanywa',
      paragraphs: [
        'Vitengo: Vitambulishi (Anwani ya IP, Kitambulisho cha kifaa), Shughuli ya Mtandao (kuvinjari, mwingiliano wa matangazo), Uwekaji eneo (kadirio), Maoni (mapendeleo kutoka kwa kuvinjari).',
        'Ili kutekeleza haki au kuchagua kutoka: email@anqr.link au kurekebisha mipangilio ya vidakuzi.',
      ],
    },
    {
      heading: 'Uhamisho wa kimataifa',
      paragraphs: [
        'Maelezo yako yanaweza kutumwa kwa nchi zilizo na sheria tofauti za ulinzi wa data, ikiwa ni pamoja na Marekani. Tunatumia ulinzi ufaao kama vile Vifungu vya Kawaida vya Mikataba.',
      ],
    },
    {
      heading: 'Faragha ya watoto',
      paragraphs: [
        'ANQR haijaelekezwa kwa watoto walio chini ya miaka 13 (au 16 katika EEA). Hatukusanyi data kutoka kwa watoto kwa kujua. Wasiliana na barua pepe@anqr.link ikiwa unaamini kuwa mtoto ametoa maelezo.',
      ],
    },
    {
      heading: 'Usalama',
      paragraphs: [
        'Tunatumia hatua zinazofaa za kiufundi na shirika ili kulinda data, ikiwa ni pamoja na usimbaji fiche wa HTTPS. Walakini, hakuna usambazaji wa mtandao ambao ni salama kwa 100%.',
      ],
    },
    {
      heading: 'Usifuatilie',
      paragraphs: [
        'Tunaheshimu Usifuatilie mawimbi ya kivinjari inapowezekana, ingawa washirika wa utangazaji wanaweza wasijibu DNT.',
      ],
    },
    {
      heading: 'Mabadiliko ya sera hii',
      paragraphs: [
        'Tunaweza kusasisha sera hii mara kwa mara. Tarehe ya "Kusasishwa mara ya mwisho" inaonyesha marekebisho ya hivi karibuni. Mabadiliko makubwa yanaweza kuwasilishwa kupitia bango la tovuti.',
      ],
    },
    {
      heading: 'Wasiliana nasi',
      paragraphs: [
        'Kwa maswali ya faragha au kutumia haki zako: email@anqr.link au tumia ukurasa wetu wa Mawasiliano. Tunajibu maombi ya faragha ndani ya siku 30.',
      ],
    },
    {
      heading: 'Sera Kamili ya Faragha',
      paragraphs: [
        'Ukurasa huu unatoa muhtasari wa desturi zetu za faragha. Kwa sera kamili ya faragha inayofunga kisheria yenye maelezo kamili kuhusu uchakataji wa data, haki zako, na wajibu wetu chini ya GDPR, CCPA, na sheria zingine za faragha, tafadhali tazama sera yetu kamili inayopangishwa na iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Tazama Sera Kamili ya Faragha kwenye iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
