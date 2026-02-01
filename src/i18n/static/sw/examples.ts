import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Mifano ya ANQR',
  description: 'Mifano mitano ya ulimwengu halisi, ya mtindo wa uzalishaji inayoonyesha mahali ambapo misimbo ya QR huunda thamani inayoweza kupimika: kuinua nambari ya kaunta iliyopitwa na wakati, malipo ya rejareja yenye chapa na vitendo vya "kuchanganua", kuongeza viwango vya kuchapisha kutoka kwa vipeperushi hadi kwenye mabango, QR iliyohuishwa kwa alama za kidijitali, na ushirikiano wa lugha mbalimbali kwa kutumia viungo vinavyoweza kushirikiwa. Kila mfano unajumuisha picha, vikwazo vya vitendo, na kiungo cha remix kurudi kwa jenereta.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Fungua jenereta', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Vinjari Makala ya Jifunze', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Fungua Mwongozo kamili wa Mtumiaji', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Uchunguzi kifani: Rejareja Counter QR Uplift',
      paragraphs: ['Mfano huu wa ulimwengu halisi unafuata mkahawa mdogo ambao ulikuwa ukitumia msimbo sawa wa QR kwenye kaunta yao kwa miaka mitatu. Nambari asilia ilitolewa haraka wakati wa kukimbilia kwa janga, kuchapishwa kwenye karatasi ya kawaida, na kuteleza kwenye kisima cha plastiki. Bado ilifanya kazi - kiufundi - lakini mara nyingi wateja walihitaji majaribio mengi ya kuichanganua, na haikufanya lolote kuimarisha utambulisho wa chapa ya mkahawa huo ulioundwa kwa uangalifu kwa uangalifu.', 'Mabadiliko yalianza kwa ukaguzi rahisi: msimbo uliopo ulisimba URL ya menyu ya mtandaoni ya mkahawa, ambayo walitaka kuhifadhi. Changamoto ilikuwa kuifanya QR kuhisi kama sehemu ya matumizi ya mkahawa badala ya matumizi ya mawazo ya baadaye kutoka 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Nambari ya kuthibitisha ya QR katika stendi ya plastiki inayoonyesha uchakavu unaoonekana, alama za vidole na uchapishaji uliofifia',
          caption: 'Mahali pa kuanzia: miaka mitatu ya huduma ya kaunta iliacha QR asili kufanya kazi kwa shida',
        },
      ],
    },
    {
      heading: 'Utambuzi wa Matatizo ya Kanuni ya Asili',
      paragraphs: ['Jaribio lilifunua masuala mengi: msimbo asili uliotumika Kurekebisha Hitilafu L (kiwango cha chini kabisa cha upungufu), ulikuwa na eneo tulivu la moduli 2 pekee, na ulichapishwa kwa ubora wa chini. Chini ya mwangaza wa joto wa tungsten ya mgahawa, moduli nyeusi ambazo tayari zimefifia hazikutofautishwa na karatasi ya manjano. Simu za zamani zilijitahidi; simu mpya zimefaulu lakini kwa kuchelewa sana.', 'Zaidi ya masuala ya kiufundi, mraba wa rangi nyeusi-na-nyeupe haukuwasiliana chochote kuhusu chapa. Wateja walisita kabla ya kuchanganua - kizuizi hila cha kuaminiana ambacho kilipunguza utumiaji wa menyu ya kidijitali ya mkahawa iliyoundwa kwa uangalifu.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Uwekeleaji wa uchunguzi unaoonyesha mapungufu ya kiufundi ya QR asili: ECC ya chini, eneo tulivu kidogo, utofautishaji hafifu.',
          caption: 'Uchambuzi wa kiufundi unaoonyesha ni kwa nini msimbo wa urithi ulifanya kazi chini ya hali halisi',
        },
      ],
    },
    {
      heading: 'Mchakato wa Kuinua',
      paragraphs: ['Kwa kutumia ANQR, mmiliki wa mkahawa aliunda upya msimbo huo kwa URL ya menyu inayofanana lakini mipangilio iliyoboreshwa sana: Marekebisho ya Hitilafu H kwa uthabiti wa hali ya juu, eneo tulivu la moduli 6 la utambuzi wa mipaka unaotegemeka, na rangi za chapa (moduli za burgundy kali kwenye mandharinyuma ya krimu) zinazolingana na ubao wa ndani wa mkahawa.', 'Uwekeleaji mdogo wa katikati unaoangazia nembo ya mkahawa uliongezwa - umewekwa kwa hila kimakusudi ili kudumisha uchanganuzi huku ukitoa utambuzi wa chapa papo hapo. Hali ya Usalama ilithibitisha muundo mpya uliochanganuliwa kwa uaminifu kwenye vifaa vya majaribio kabla ya uchapishaji wowote.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Kiolesura cha ANQR kinachoonyesha usanidi: rangi za chapa, ECC inayofaa, eneo tulivu la ukarimu, uwekaji wa nembo fiche.',
          caption: 'Kuunda usanidi ulioboreshwa: kila mpangilio uliochaguliwa kusawazisha mwonekano wa chapa na uaminifu wa skanisho',
        },
      ],
    },
    {
      heading: 'Matokeo Yanayopimika',
      paragraphs: ['Baada ya kupeleka QR mpya kwenye hisa za kitaalamu za matte-laminated card, café ilifuatilia matokeo kwa muda wa wiki nne. Kiwango cha mafanikio ya utafutaji kimeimarika kutoka wastani wa 70% hadi karibu 100%. Muda wa wastani wa kuchanganua umepungua kutoka sekunde 3-4 hadi chini ya sekunde 1. La muhimu zaidi, matumizi ya menyu yaliongezeka kwa 40% - wateja ambao hapo awali waliangalia QR na kukata tamaa walikuwa wanachanganua kwa ujasiri.', 'Wafanyakazi waliripoti maswali machache ya wateja kuhusu \'jinsi ya kutumia QR\' na hakuna matukio zaidi ya kuandika URL kwa wateja waliochanganyikiwa. Mwonekano wenye chapa pia ulizua mazungumzo, huku wateja wakitoa maoni chanya juu ya muundo wa kushikamana.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Ulinganisho wa kabla/baada ya vipimo: kasi ya mafanikio ya kuchanganua, wastani wa muda wa kuchanganua, na maboresho ya hesabu ya kila wiki ya skanisho',
          caption: 'Wiki nne za data inayoonyesha athari inayoweza kupimika ya uinuaji makini wa QR',
        },
      ],
    },
    {
      heading: 'Unda Upya Usanidi Huu',
      paragraphs: ['Usanidi wa mkahawa unaonyesha chapa ya kihafidhina lakini yenye ufanisi: Marekebisho ya Hitilafu H, eneo tulivu lenye moduli 6, rangi za chapa zenye utofauti wa juu, na uwekeleaji mdogo wa katikati. Salio hili hufanya kazi kwa programu nyingi za kaunta za rejareja ambapo kutegemewa lazima kutangulie lakini uwepo wa chapa bado ni muhimu.', 'Fungua jenereta ukiwa na mipangilio hii iliyopakiwa awali na ubadilishe rangi na uwekeleaji kwa chapa yako mwenyewe. Maarifa muhimu: uboreshaji wa kutegemewa pekee unaweza kuongeza ushiriki kwa kiasi kikubwa, hata kabla ya kuongeza mtindo wowote wa kuona.', 'Tazama mwongozo unaohusiana wa Kujifunza kuhusu kuboresha kampeni zilizopo za QR kwa mbinu kamili ya mbinu hii.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Unganisha kwa jenereta iliyosanidiwa awali na mipangilio ya mkahawa kwa ajili ya kubinafsisha mara moja',
          caption: 'Anza na usanidi uliothibitishwa na ubinafsishe kwa chapa yako',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Vinjari Makala ya Jifunze',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Kifani: Onyesho la Kaunta ya Malipo Mengi',
      paragraphs: ['Mfano huu unafuatia duka la nguo la boutique ambalo lilikuwa limekusanya misimbo mitano tofauti ya QR kwenye rejista yao: malipo ya benki, vidokezo, Instagram, ukaguzi wa Google na kiungo cha kukodisha. Kila moja ilitolewa kutoka chanzo tofauti, ikachapishwa kwa nyakati tofauti, na kuonyeshwa katika stendi zisizolingana. Fujo ya kuona ilikuwa ikidhoofisha urembo ulioratibiwa kwa uangalifu wa duka, na wafanyikazi walishughulika mara kwa mara na wateja wa kuchanganua msimbo usio sahihi.', 'Suluhisho lilihitaji masuala ya kutenganisha: misimbo ya malipo ilihitaji kutegemewa kwa kiwango cha juu kwa kutumia mitindo ya kihafidhina, huku misimbo ya uuzaji inaweza kuwa wazi zaidi. Mfumo uliounganishwa wa kuonyesha uliojitokeza unaonyesha jinsi ya kusawazisha uwepo wa chapa dhidi ya matakwa ya utendaji ya matukio tofauti ya utumiaji wa QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Eneo lililojaa daftari linaloonyesha misimbo mitano ya QR isiyolingana katika stendi na nyenzo zilizochapishwa',
          caption: 'Mahali pa kuanzia kwa fujo: misimbo mitano ya QR iliyokatishwa muunganisho ikishindana kwa umakini na kusababisha mkanganyiko wa wateja',
        },
      ],
    },
    {
      heading: 'Kuweka Kipaumbele Uzoefu wa Malipo',
      paragraphs: ['Njia ya msingi ya malipo ya duka ilitumia kiwango cha kikanda ambacho kilihitaji uzingatiaji madhubuti wa upakiaji. Uchunguzi ulibaini kuwa hata mtindo mdogo uliathiri kasi ya kuchanganua na programu fulani za benki. Uamuzi: weka malipo ya QR bila kubadilishwa kabisa isipokuwa kwa uboreshaji wa ukubwa na uchapishaji wa kitaalamu kwenye hisa ya kadi ya matte.', 'Mbinu hii ya kihafidhina ilimaanisha kuwa msimbo wa malipo ulionekana kuwa mdogo \'wenye chapa\' kuliko inavyofaa, lakini viwango vya kukamilisha ununuzi viliboreshwa sana. Maarifa: muda wa malipo sio fursa za chapa - ni nyakati za kutegemewa. Wateja wanathamini kasi na uhakika juu ya urembo wakati pesa zinahusika.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Nambari safi na kubwa ya malipo ya QR kwenye hisa ya kitaalamu ya matte, iliyowekwa kwenye rejista',
          caption: 'QR ya malipo: iliyo na ukubwa wa ukarimu, imechapishwa kitaalamu, imetengenezwa kwa mtindo wa kihafidhina ili kutambuliwa papo hapo na programu za benki.',
        },
      ],
    },
    {
      heading: 'Kuunda Onyesho la Kitendo la Sekondari',
      paragraphs: ['Kwa vidokezo, hakiki, kijamii, na kukodisha, duka linaweza kuwa wazi zaidi. Nambari hizi ziliundwa upya katika ANQR kwa mtindo thabiti wa chapa: saini ya duka ya kijani kibichi kwenye krimu, mtindo wa sehemu ya mviringo, na mwekeleo mdogo wa katikati wenye aikoni ya duka. Urekebishaji wa Hitilafu H ulihakikisha kutegemewa hata kwa mtindo.', 'Kuponi hizi nne zilipangwa katika paneli yenye chapa iliyowekwa kando (isiyoshindanishwa) na msimbo wa malipo. Ondoa lebo katika uchapaji wa duka zilielezea madhumuni ya kila msimbo. Uongozi wa kuona ulikuwa wa makusudi: malipo yalisimama peke yake na maarufu; vitendo vya pili vilivyowekwa pamoja kama chaguo.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Kidirisha chenye chapa kinachoonyesha misimbo minne ya QR yenye vidokezo, hakiki, kijamii na uajiri, yenye lebo wazi.',
          caption: 'Paneli ya pili ya kitendo: uwekaji chapa thabiti, uwekaji lebo wazi, umewekwa kama chaguo badala ya visumbufu',
        },
      ],
    },
    {
      heading: 'Muundo wa Mfumo wa Kuonyesha',
      paragraphs: ['Onyesho la kimwili lilitatua matatizo kadhaa kwa wakati mmoja. Stendi ya malipo na paneli ya pili ilitumia nyenzo za matte ili kuondoa mng\'ao kutoka kwa mwangaza wa juu. Urefu uliboreshwa kwa wateja wa kimo tofauti. Pembe zinazoelekezwa kwenye foleni ya mteja badala ya kuwa bapa kwenye kaunta.', 'Kimsingi, duka liliunda nakala za vipuri kutoka kwa viungo vya usanidi vilivyofungwa vya ANQR. Wakati msimbo wa vidokezo ulipomwagika kahawa, wafanyikazi waliibadilisha ndani ya dakika chache kwa kutumia usanidi uliohifadhiwa - hakuna picha za skrini, hakuna kubahatisha kwenye mipangilio, hakuna uharibifu wa ubora.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Mchoro unaoonyesha mpangilio halisi wa onyesho: urefu, pembe, nyenzo na uhusiano kati ya malipo na maonyesho mengine',
          caption: 'Mchoro wa mfumo wa onyesho: ergonomics halisi iliyoboreshwa kwa uchanganuzi unaotegemewa katika urefu wa mteja na hali ya mwanga',
        },
      ],
    },
    {
      heading: 'Maboresho ya Uendeshaji',
      paragraphs: ['Wiki sita baada ya kutumwa, duka liliandika uboreshaji mkubwa: malalamiko ya wateja bila malipo kuhusu mkanganyiko wa \'msimbo mbaya\', muda wa haraka wa kufanya miamala, na ongezeko la mara 3 la uwasilishaji wa vidokezo (wateja sasa wanaweza kupata na kuchanganua msimbo wa kidokezo bila kuuliza wafanyikazi bila shida). Maoni kwenye Google pia yaliongezeka kadiri msuguano wa QR uliojitolea, ulio na lebo nzuri ukiondoa.', 'Mafunzo ya wafanyikazi yakawa rahisi: \'nambari ya malipo ndiyo kubwa, kila kitu kingine kiko kwenye paneli.\' Programu za malipo ziliposasishwa na moja ikaonyesha uchanganuzi wa polepole, muundo wa kihafidhina wa msimbo wa malipo ulimaanisha kuwa bado ulifanya kazi - polepole kidogo badala ya kufeli kabisa.', 'Tazama mwongozo wa Jifunze kuhusu misimbo ya QR kwa malipo ya rejareja kwa kanuni za muundo huu wa mfumo wa kuonyesha.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Dashibodi ya vipimo inayoonyesha kabla/baada ya ulinganisho: matukio ya mkanganyiko, muda wa muamala, marudio ya vidokezo, kagua mawasilisho.',
          caption: 'Wiki sita za data ya utendakazi inayoonyesha athari ya biashara ya mfumo wa kuonyesha wa QR nyingi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Vinjari Makala ya Jifunze',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Uchunguzi kifani: Kutoka Kadi ya Biashara hadi Billboard',
      paragraphs: ['Mfano huu unafuata kampuni ya utengenezaji wa hafla inayojiandaa kwa mkutano mkuu. Walihitaji msimbo sawa wa QR - unaounganishwa na programu ya tukio - uliowekwa katika miundo tofauti kabisa: ingizo la beji za mhudhuriaji (3cm), kadi za hema la meza (8cm), alama za meza ya usajili (cm 30), mabango ya kutafuta njia (cm 60), na bango kubwa la mandharinyuma (mita 4). Kila fomati ilikuwa na umbali tofauti wa kutazama, hali ya taa, na mtiririko wa kazi wa uzalishaji.', 'Changamoto haikuwa ya kiufundi tu - ilifanya kazi. Wachuuzi wengi walishughulikia kazi tofauti za uchapishaji, na kampuni ilihitaji kuhakikisha matokeo thabiti, yanayochanganuliwa bila kujali ni nani alitoa nini. Suluhisho lao lilijikita kwenye usafirishaji wa SVG na hati dhabiti za hati.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kolagi inayoonyesha msimbo sawa wa QR uliowekwa katika saizi tano tofauti, kutoka beji hadi bango',
          caption: 'Msimbo mmoja wa QR, saizi tano za kupelekwa: changamoto ya kudumisha uwezo wa kuchambua kutoka sentimita hadi mita.',
        },
      ],
    },
    {
      heading: 'Kwa Nini Matukio ya Awali yalikuwa na Matatizo',
      paragraphs: ['Katika mkutano wao uliopita, kampuni ilipata kushindwa kwa aibu. Bango la jukwaa la QR lilitolewa kama PNG ndogo na kukuzwa katika programu ya muundo - tokeo lilionekana kukubalika kutoka mbali lakini lilishindwa kuchanganua kwa uhakika kutoka kwa hadhira. Beji za QR zilichorwa kupita kiasi na ni ndogo sana, na kuwafadhaisha waliohudhuria wakijaribu kuongeza anwani. Mipangilio isiyolingana katika miundo yote ilimaanisha kwamba QR \'sawa\' kweli ilionekana tofauti kwenye kila kipande.', 'Uchambuzi wa baada ya tukio ulifichua sababu kuu: hakuna chanzo kimoja cha ukweli. Kila mbuni alikuwa ameunda upya QR kwa mipangilio tofauti kidogo, na kila mchuuzi wa kuchapisha alikuwa amechakata faili tofauti. Ubora umeshuka kupitia mchezo wa simu wa kukabidhi faili.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Picha za karibu zinazoonyesha hitilafu za kuchanganua: moduli za mabango yenye pikseli, misimbo ya beji yenye ukubwa wa chini, mitindo isiyolingana katika miundo yote.',
          caption: 'Uchambuzi wa kimahakama wa kushindwa kwa matukio ya awali: kila fomati ilileta matatizo tofauti ya ubora',
        },
      ],
    },
    {
      heading: 'Mtiririko wa kazi wa SVG-Kwanza',
      paragraphs: ['Kwa tukio hili, kampuni ilianzisha itifaki madhubuti: QR moja kuu iliyotengenezwa katika ANQR yenye mipangilio bora (Marekebisho ya Hitilafu H, eneo la utulivu la ukarimu, mtindo safi), iliyosafirishwa kama SVG, na kuhifadhiwa kama chanzo kimoja kinachoidhinishwa. Kiungo cha usanidi cha ANQR kilinakiliwa pamoja na faili ya SVG ili msimbo uweze kuundwa upya ikihitajika.', 'Kila mbunifu na muuzaji alipokea bwana sawa wa SVG na maagizo wazi: weka kwa ukubwa unaohitajika, usirekebishe, tunza kibali cha eneo tulivu. Kwa wachuuzi wanaohitaji fomati mbaya, kampuni ilitoa PNG zilizotolewa mapema katika saizi mahususi zilizo na kanuni wazi za kutaja zinazoonyesha matumizi yaliyokusudiwa.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Kifurushi cha faili kinachoonyesha mkuu wa SVG, PNG za ukubwa mahususi, hati ya ubainifu, na kiungo cha usanidi.',
          caption: 'Kifurushi cha handoff: kila kitu ambacho wachuuzi walihitaji kutoa matokeo thabiti bila kubahatisha',
        },
      ],
    },
    {
      heading: 'Mazingatio Mahususi ya Ukubwa',
      paragraphs: ['Kila muundo ulihitaji umakini maalum. Uwekaji beji wa sentimita 3 ulihitaji QR ili kuchukua nafasi ya juu zaidi inayopatikana - umbali wa kuchanganua ungekuwa urefu wa mkono. Mahema ya meza ya 8cm yanaweza kujumuisha uundaji wa mapambo nje ya eneo tulivu. Bango la mita 4 lilihitaji hesabu: kutoka umbali wa kawaida wa hadhira (mita 15-20), moduli zilihitajika kutofautishwa kwa uwazi na kamera za simu, ambayo ilimaanisha kwamba QR ilihitajika kuwa angalau 80cm ndani ya muundo wa bango.', 'Kampuni iliunda mwongozo wa ukubwa unaoandika vipimo vya chini vya QR kwa kila umbali unaotarajiwa wa kuchanganua. Hii ikawa nyenzo inayoweza kutumika tena kwa matukio yajayo, ikiondoa ubashiri kutoka kwa mchakato wa kubuni.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Chati inayoonyesha uhusiano kati ya umbali wa kuchanganua, ukubwa wa chini wa QR na vipimo vya moduli kwa kila umbizo la tukio',
          caption: 'Matrix ya ukubwa: vipimo vilivyokokotwa vinavyohakikisha utambazaji unaotegemewa katika umbali wa kutazamwa wa kila umbizo',
        },
      ],
    },
    {
      heading: 'Matokeo ya Uzalishaji',
      paragraphs: ['Uthibitishaji wa siku ya mkutano ulikuwa wa utaratibu: wafanyikazi walijaribu kila QR iliyotumwa kabla ya milango kufunguliwa. Vipengee vya beji vilichanganuliwa papo hapo kwa urefu wa mkono. Mahema ya meza yalifanya kazi kwa uhakika katika taa tofauti za vyumba vya kuzuka. Bango la jukwaa - aibu ya tukio la awali - lilichanganuliwa kwa mafanikio kutoka katikati ya eneo la hadhira.', 'Malalamiko ya kutochanganua sifuri yalirekodiwa kwa waliohudhuria zaidi ya 2,000. Ushindi wa utendakazi ulikuwa muhimu vile vile: wakati nyongeza ya mfadhili wa dakika ya mwisho ilipohitaji ishara mpya, timu ya uzalishaji iliiunda kutoka kwa SVG kuu kwa dakika, ikiwa na uhakika kwamba ingelingana na kila kitu kingine.', 'Tazama mwongozo wa Jifunze kuhusu misimbo ya QR iliyo tayari kuchapishwa kwa mfumo wa uamuzi wa SVG dhidi ya PNG na mbinu bora za kupeana.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Upigaji picha wa tukio unaoonyesha waliohudhuria wakichanganua misimbo ya QR kwa ukubwa na umbali mbalimbali katika ukumbi wote',
          caption: 'Mafanikio ya siku ya kongamano: uchanganuzi unaotegemewa katika kila umbizo, kutoka kwa beji karibu-ups hadi picha za masafa za jukwaa',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Vinjari Makala ya Jifunze',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Mfano: Onyesho la Dijitali la Sebule ya Uwanja wa Ndege',
      paragraphs: ['Mfano huu unafuata sebule ya ndege ambayo imekuwa ikitumia misimbo tuli ya QR kwenye skrini zao za kidijitali za makaribisho. Skrini zilionyesha maudhui ya matangazo yanayozunguka, lakini msimbo wa QR wa kuingia kwenye chumba cha mapumziko ulikaa kwenye kona, tuli na kupuuzwa kwa urahisi. Uchanganuzi ulionyesha ni 15% tu ya wageni wanaostahiki walitumia kuingia kwa QR licha ya kuwa ilikuwa haraka kuliko foleni ya mezani. Wageni wengi hawakugundua.', 'Dhana ilikuwa rahisi: katika mazingira yanayoonekana yenye shughuli nyingi na maudhui yanayosonga, QR tuli inakuwa isiyoonekana. Suluhisho linalohitajika ili kufanya QR ionekane bila kuathiri uaminifu unaohitajika kwa mtiririko wa kuingia ambapo kutofaulu kunaweza kumaanisha wasafiri waliochanganyikiwa na foleni ndefu za mezani.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Onyesho la kidijitali katika sebule ya uwanja wa ndege inayoonyesha maudhui ya matangazo yenye msimbo mdogo wa QR kwenye kona',
          caption: 'Mpangilio asili: QR tuli iliyopotea katika bahari ya maudhui ya utangazaji yenye nguvu, na kufikia kupitishwa kwa 15% pekee.',
        },
      ],
    },
    {
      heading: 'Kubuni Uhuishaji Salama',
      paragraphs: ['Alama za dijiti za sebule hiyo zilitumia paneli kubwa za LED - mazingira yenye changamoto ambapo uhuishaji fujo unaweza kusababisha matatizo ya kuchanganua. Timu ya kubuni ilianza kihafidhina: athari ya mapigo ya upole ambayo ilipanua kwa hila na kupunguza uonekanaji wa QR bila kurekebisha muundo halisi wa msimbo. Muda wa fremu umewekwa polepole (milisekunde 250) ili kuepusha matatizo yoyote ya kufifia kwa kasi ya kuonyesha upya kwa LED.', 'Uthibitishaji wa Hali ya Usalama ulithibitisha kila fremu ilisalia kuchanganuliwa. Majaribio ya ziada kwenye vidirisha halisi vya LED yalibaini kuwa mapigo ya moyo yanahitajika kuwa ya hila zaidi kuliko uhakiki wa eneo-kazi uliopendekezwa - mwangaza wa LED na pembe za kutazama ziliathiri utofautishaji unaotambulika zaidi ya ilivyotarajiwa.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Paneli ya mipangilio ya uhuishaji ya ANQR inayoonyesha usanidi wa mapigo ya moyo: muda wa polepole, kiwango kidogo, Hali ya Usalama imewashwa.',
          caption: 'Usanidi wa uhuishaji: vigezo vilivyowekwa kwa ajili ya onyesho la kidirisha cha LED huku kikidumisha uaminifu wa skanisho katika kila fremu',
        },
      ],
    },
    {
      heading: 'Kuunganishwa na Maudhui ya Ishara',
      paragraphs: ['QR iliyohuishwa iliwekwa katika \'eneo thabiti\' maalum la mpangilio wa skrini - eneo ambalo lilibaki bila kubadilika huku maudhui ya utangazaji yakizungushwa katika eneo kuu la kuonyesha. Utengano huu ulikuwa muhimu: QR ilihitaji uthabiti wa kuona kwa ajili ya kuchanganua hata wakati wa kuvutia usikivu kupitia uhuishaji wake wa hila.', 'Mwito wa wazi wa kuchukua hatua uliongezwa karibu na QR: \'Ruka foleni - changanua ili uingie.\' Maandishi yalisalia tuli huku QR ikisonga, na hivyo kuunda safu ya taswira ambayo ilivutia fursa ya kuchanganua bila kuzidisha maudhui ya ofa.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Mchoro wa mpangilio wa skrini unaoonyesha QR iliyohuishwa katika eneo thabiti huku maudhui ya utangazaji yakizungushwa katika eneo kuu.',
          caption: 'Ugawaji wa mali isiyohamishika kwenye skrini: QR iliyohuishwa inachukua eneo dhabiti tofauti na maudhui ya utangazaji yanayozunguka.',
        },
      ],
    },
    {
      heading: 'Usambazaji wa Kiufundi',
      paragraphs: ['QR iliyohuishwa ilisafirishwa kama GIF iliyo na mipangilio iliyoboreshwa ya ishara za CMS. Mazingatio ya ukubwa wa faili yalikuwa muhimu - mfumo wa usimamizi wa maudhui ya chumba cha mapumziko ulikuwa na vikomo vya kupakia, na faili kubwa kupita kiasi zilisababisha uchezaji kukwama. Ubora wa mwisho wa mwonekano uliosawazishwa dhidi ya saizi ya faili kwa kupunguza ubao wa rangi na kuongeza idadi ya fremu.', 'Usambazaji ulijumuisha njia mbadala: ikiwa GIF ilishindwa kucheza kwa sababu yoyote, mfumo wa alama ungeonyesha chelezo tuli ya PNG. Upungufu huu ulihakikisha uwezo wa kuingia haupotei kamwe kutokana na matatizo ya kiufundi na uhuishaji.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Kiolesura cha CMS kinachoonyesha upakiaji wa QR uliohuishwa na picha mbadala tuli imesanidiwa',
          caption: 'Usanidi wa CMS wa ishara: msingi uliohuishwa na urejeshaji tuli unaohakikisha uwezo wa kuingia haukatizwi kamwe.',
        },
      ],
    },
    {
      heading: 'Athari Iliyopimwa',
      paragraphs: ['Baada ya mwezi mmoja wa operesheni, upitishaji wa ukaguzi wa QR uliongezeka kutoka 15% hadi 24% - uboreshaji wa jamaa wa 60%. Uchunguzi wa maoni ya wageni ulionyesha kuwa QR iliyohuishwa ilikuwa \'rahisi kutambulika\' na \'ilionekana kuwa ya kisasa zaidi.\' Muda wa foleni ya mezani ulipungua kwa kipimo wakati wa vipindi vya kilele kwani wageni wengi walijihudumia wenyewe kupitia QR.', 'Muhimu, hitilafu sifuri za kuchanganua ziliripotiwa licha ya maelfu ya uchunguzi wa kila siku. Mbinu ya uhuishaji ya kihafidhina ilikuwa imefikia lengo la umakinifu bila kuacha kuegemea kwa mtiririko uliodai. Baadaye sebule ilizindua QR zilizohuishwa sawa kwenye maeneo yao mengine.', 'Tazama mwongozo wa Jifunze kuhusu misimbo ya QR iliyohuishwa ili kupata alama za kidijitali kwa kanuni za kiufundi za muundo salama wa uhuishaji.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Dashibodi inayoonyesha ongezeko la kiwango cha kupitishwa, kupunguza muda wa foleni na uaminifu wa kuchanganua kutofaulu sifuri katika kipindi cha utumaji.',
          caption: 'Mwezi mmoja wa data: ongezeko la 60% la kupitishwa, kupunguzwa kwa muda wa foleni, na kudumisha uaminifu kamili wa skanning',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Vinjari Makala ya Jifunze',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Uchunguzi kifani: Kampeni ya Uzinduzi wa Bidhaa ya Kimataifa ya QR',
      paragraphs: ['Mfano huu unafuatia kampuni ya kielektroniki ya watumiaji kuzindua bidhaa mpya kwa wakati mmoja katika masoko 12 katika lugha 8. Kila timu ya masoko ya eneo ilihitaji kuzalisha vifungashio, maonyesho ya reja reja na nyenzo za utangazaji zinazoangazia misimbo ya QR inayounganishwa na kurasa za bidhaa zilizojanibishwa. Uzinduzi wa awali ulisababisha mtindo wa QR kutofautiana, hitilafu za kuchanganua mara kwa mara, na \'mchezo wa simu\' wa usanidi huku kila timu ikiunda upya misimbo kutoka kwa picha za skrini.', 'Suluhisho lilisaidia viungo vya usanidi vinavyoweza kushirikiwa vya ANQR ili kuanzisha chanzo kimoja cha ukweli ambacho kila timu ya eneo inaweza kufikia, bila kujali lugha yao ya kiolesura. Upakiaji wa QR ulitumia uelekezaji upya mahiri ambao uligundua lugha ya mtumiaji, kwa hivyo msimbo mmoja ulifanya kazi duniani kote huku ukitoa matumizi yaliyojanibishwa.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Ramani ya dunia inayoonyesha maeneo 12 ya soko yenye misimbo ya QR, baadhi yao hayaendani',
          caption: 'Changamoto: masoko 12, lugha 8, na historia ya utekelezaji wa QR usiolingana katika maeneo yote.',
        },
      ],
    },
    {
      heading: 'Kuanzisha Usanidi Mkuu',
      paragraphs: ['Timu ya kimataifa ya chapa iliunda usanidi unaoidhinishwa wa QR katika ANQR: rangi za chapa zinazolingana na utambulisho unaoonekana wa laini ya bidhaa, Marekebisho ya Hitilafu H kwa kutegemewa kwa programu zote za kuchapisha na dijitali, na mtindo ambao ungezalishwa mara kwa mara bila kujali mbinu za uzalishaji wa ndani. Mipangilio ilifungwa na kiungo cha kushiriki kimeandikwa katika muhtasari wa kampeni ya kimataifa.', 'Kimsingi, URL iliyosimbwa ilitumia huduma ya kuelekeza kwingine ya kutambua lugha. Ilipochanganuliwa, watumiaji walielekezwa kiotomatiki hadi kwenye ukurasa wa bidhaa wa lugha ya ndani. Hii ilimaanisha kuwa masoko yote 12 yanaweza kutumia misimbo ya QR inayofanana - hakuna tofauti za upakiaji wa kila soko ambazo zinaweza kusababisha makosa.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Kiolesura cha ANQR kinachoonyesha usanidi mkuu na rangi za chapa, ECC H, na URL mahiri ya kuelekeza kwingine.',
          caption: 'Usanidi mkuu: viwango vya kimataifa vya chapa vilivyosimbwa katika chanzo kimoja, kinachoweza kushirikiwa cha ukweli',
        },
      ],
    },
    {
      heading: 'Mtiririko wa Timu ya Mkoa',
      paragraphs: ['Kila timu ya masoko ya eneo ilipokea kiungo cha usanidi kilicho na maagizo rahisi: fungua kiungo, thibitisha onyesho la kukagua linalingana na miongozo ya chapa, usafirishaji katika umbizo linalohitajika kwa programu yako. Kiolesura cha ANQR kinachoonyeshwa katika lugha inayopendekezwa na kila timu, lakini mipangilio ya msingi ya QR ilisalia sawa bila kujali lugha ya kiolesura.', 'Wakati timu ya Japani ilihitaji SVG kwa maonyesho ya rejareja ya hali ya juu na timu ya Brazili ilihitaji PNG kwa mitandao ya kijamii, zote zilihamishwa kutoka kwa usanidi sawa. Wakati muuzaji wa magazeti wa timu ya Ujerumani alipoomba thamani mahususi za rangi, wanaweza kurejelea usanidi moja kwa moja badala ya kubahatisha kutoka kwa picha ya skrini.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Picha za skrini zinazoonyesha kiungo sawa cha usanidi zimefunguliwa katika violesura vya Kijapani, Kireno na Kijerumani',
          caption: 'Usanidi sawa, violesura tofauti: timu za kanda hufanya kazi katika lugha wanayopendelea huku zikidumisha uthabiti wa kimataifa',
        },
      ],
    },
    {
      heading: 'Kushughulikia Tofauti za Kikanda',
      paragraphs: ['Baadhi ya masoko yalihitaji marekebisho madogo. Timu ya Uchina ilihitaji toleo lenye fremu iliyoboreshwa ya WeChat kwa ajili ya kushiriki kijamii. Badala ya kurekebisha kanuni kuu, waliunda lahaja iliyorekodiwa na kiungo chake cha usanidi, kilichoandikwa kwa uwazi kama \'lahaja ya CN-WeChat\' katika maktaba ya kipengee cha kampeni. Hii ilidumisha ufuatiliaji huku ikiruhusu ujanibishaji unaohitajika.', 'Timu ya chapa ilianzisha sheria rahisi: tofauti yoyote kutoka kwa bwana ilihitaji kiungo kipya cha usanidi, kilichoandikwa. Hakuna marekebisho kwa faili zilizosafirishwa, hakuna \'marekebisho ya haraka\' katika programu ya muundo. Hii ilizuia kuteleza kwa usanidi ambayo ilikuwa imekumba uzinduzi uliopita.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Kiolesura cha maktaba ya kipengee kinachoonyesha usanidi mkuu na vibadala vya kikanda vilivyoidhinishwa, kila kimoja kikiwa na kiungo chake',
          caption: 'Utawala wa mali ya kampeni: usanidi mkuu pamoja na vibadala vilivyoandikwa, vyote vinaweza kufuatiliwa kupitia viungo vya usanidi.',
        },
      ],
    },
    {
      heading: 'Zindua Matokeo',
      paragraphs: ['Siku ya uzinduzi wa bidhaa iliona misimbo ya QR ikitumwa kwenye vifungashio, maonyesho ya reja reja, nyenzo za matukio na kampeni za kidijitali katika masoko yote 12 kwa wakati mmoja. Ukaguzi wa ubora ulithibitisha uthabiti wa macho katika maeneo yote - QR kwenye maonyesho ya reja reja ya Tokyo ililingana na QR kwenye kifurushi cha São Paulo ililingana na QR kwenye mabango ya matukio ya Berlin.', 'Hitilafu sifuri za kuchanganua ziliripotiwa kote katika masoko. Wakati mabadiliko ya URL ya ukurasa wa bidhaa baada ya uzinduzi yalipohitajika, huduma ya kuelekeza kwingine iliishughulikia bila kuonekana - hakuna uchapishaji upya unaohitajika. Timu ya kimataifa ilikadiria mbinu ya kuunganisha usanidi iliokoa saa 40+ za muda wa kuratibu ikilinganishwa na mbinu yao ya awali ya uzinduzi.', 'Tazama mwongozo wa Jifunze kuhusu ushirikiano wa QR wa lugha tofauti kwa kanuni za mtiririko wa kazi nyuma ya uthabiti wa kampeni ya kimataifa.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Gridi ya picha zinazoonyesha usambazaji thabiti wa QR katika masoko tofauti: rejareja la Tokyo, vifungashio vya São Paulo, matukio ya Berlin',
          caption: 'Uthabiti wa kimataifa umefikiwa: uwasilishaji sawa wa QR katika masoko 12 licha ya lugha tofauti, wachuuzi na miundo.',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Vinjari Makala ya Jifunze',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Vinjari Makala ya Jifunze', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Fungua Mwongozo kamili wa Mtumiaji', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Fungua ghala', type: 'gallery' },
  ],
};
