import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Jifunze na ANQR',
  description: 'Miongozo inayofaa, ya kwanza ya biashara ya kubadilisha misimbo ya QR kuwa mali halisi ya uuzaji - sio tu miraba inayofanya kazi. Jifunze jinsi ya kuboresha misimbo ya urithi ya mauzo, kuunda alama za QR zinazotii, kuandaa bidhaa ambazo tayari zimechapishwa, kutumia uhuishaji kwa usalama kwenye maonyesho ya dijitali, na kushiriki usanidi uliofungiwa ndani kwa timu zinazozungumza lugha nyingi kwa kutumia viungo vya ANQR ("nanga").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Fungua jenereta', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Tazama mifano ya QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Fungua Mwongozo kamili wa Mtumiaji', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Kuboresha Kampeni Zilizopo za QR',
      paragraphs: ['Biashara nyingi zina misimbo ya QR iliyotawanyika katika shughuli zao zote - kwenye menyu, stendi za kaunta, vifungashio na nyenzo za matangazo. Nyingi za misimbo hii ziliundwa miaka iliyopita kwa jenereta za kimsingi, hivyo kusababisha miraba ya jumla nyeusi-na-nyeupe ambayo inashindwa kuhamasisha imani au kufanana na utambulisho wa chapa yako. Mwongozo huu wa kina hukupitisha mkabala wa kimfumo wa ukaguzi, uboreshaji, na uboreshaji wa miundombinu yako ya QR iliyopo bila kutatiza safari za wateja ambazo tayari umeanzisha.', 'Faida ya kimkakati ya kupata toleo jipya badala ya kubadilisha misimbo yako ya QR iko katika kuhifadhi mwendelezo. Wateja wako tayari wamejifunza kutarajia maeneo fulani wanapochanganua misimbo yako. Kwa kuweka URL zilizosimbwa zifanane huku ukiboresha kwa kiasi kikubwa uwasilishaji unaoonekana, utegemezi wa kuchanganua, na mpangilio wa chapa, unaunda mpito usio na mshono ambao huongeza uaminifu bila kuhitaji mabadiliko yoyote kwenye miundombinu yako ya kidijitali au ufuatiliaji wa uchanganuzi.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Ulinganisho wa ubavu kwa upande unaoonyesha msimbo wa QR uliofifia, wa kawaida karibu na toleo la kisasa lenye chapa inayosimba URL sawa.',
          caption: 'Kabla na baada ya: URL ile ile lengwa ilibadilishwa kutoka msimbo wa tarehe hadi mali yenye chapa kitaalamu',
        },
      ],
    },
    {
      heading: 'Kwa nini Misimbo ya Urithi ya QR Ina Utendaji wa Chini',
      paragraphs: ['Misimbo ya QR iliyoundwa wakati wa awamu ya kupitishwa mapema - haswa wakati wa 2020-2021 wakati biashara ziliharakisha kutekeleza suluhisho za bila mawasiliano - mara nyingi hukabiliwa na masuala kadhaa muhimu. Mipangilio ya urekebishaji wa makosa ya chini huwafanya kuwa tete inapochapishwa kwenye nyuso zenye maandishi au kutazamwa chini ya taa ngumu. Upungufu wa maeneo tulivu husababisha kushindwa kuchanganua misimbo inapowekwa karibu na vipengee vingine vya kuona. Mitindo ya kawaida imeshindwa kuwasilisha uhalali wa chapa, na hivyo kusababisha kusitasita na kupunguza viwango vya uchanganuzi.', 'Zaidi ya vikwazo vya kiufundi, misimbo ya urithi mara nyingi huwakilisha fursa za chapa zilizokosa. Kila msimbo wa QR ni mahali pa kuguswa na mteja wako - wakati ambapo wanashiriki kikamilifu na wako tayari kuchukua hatua. Msimbo uliowekwa mtindo wa kitaalamu unaolingana na rangi za chapa yako, unajumuisha ukingo ufaao wa usalama, na huangazia vipengele vya hiari vya chapa hubadilisha matumizi haya kuwa kipengee cha uuzaji ambacho huimarisha utambulisho wako katika kila mwingiliano.'],
    },
    {
      heading: 'Kufanya Ukaguzi wa Msimbo wa QR',
      paragraphs: ['Anzisha mradi wako wa uboreshaji kwa kuunda orodha ya kina ya kila msimbo wa QR unaotumwa kwenye biashara yako yote. Andika eneo halisi, mahali paliposimbwa, hali ya sasa ya nyenzo zilizochapishwa, na mazingira ya kawaida ya utambazaji ikijumuisha hali ya mwanga na pembe za kutazama. Jaribu kila msimbo ukitumia vifaa vingi - simu mahiri za zamani na vifaa vya bajeti mara nyingi hufichua masuala ya kutegemewa ambayo simu za malipo hufunika.', 'Zingatia sana misimbo katika maeneo yenye dau kubwa: sehemu za malipo, maeneo ya kuingia, na maonyesho ya matangazo ambapo kushindwa kuchanganua huathiri moja kwa moja mapato au uzoefu wa wateja. Hizi zinapaswa kupewa kipaumbele kwa uboreshaji wa haraka. Pia kumbuka misimbo inayoonekana katika upigaji picha au maudhui ya video, kwani haya yatahitaji uratibu na timu yako ya uuzaji kusasisha vipengee vinavyoonekana.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Kiolesura cha orodha inayoonyesha kategoria za ukaguzi wa QR: eneo, hali, kutegemewa kwa skanisho na ukadiriaji wa kipaumbele',
          caption: 'Kiolezo cha ukaguzi wa QR kwa ajili ya kuweka kumbukumbu na kuwapa kipaumbele watahiniwa wako wa kuboresha',
        },
      ],
    },
    {
      heading: 'Mkakati wa Kuboresha Usalama',
      paragraphs: ['Kanuni kuu ya uboreshaji wa QR ni uhifadhi wa marudio. Chambua URL halisi kutoka kwa kila msimbo uliopo na uisimbate sawa katika toleo lako jipya. Hii inahakikisha uchanganuzi wote uliopo, mantiki ya kuelekeza kwingine, na matarajio ya wateja kubaki sawa. Iwapo unahitaji unyumbulifu wa lengwa kwa masasisho yajayo, huu ndio wakati mwafaka wa kutambulisha URL fupi yenye chapa au kuelekeza huduma upya - lakini tekeleza hili kama mradi tofauti ili kuepuka kuchanganya mabadiliko.', 'Kwa uboreshaji wa taswira, weka maboresho katika tabaka: kwanza hakikisha kutegemewa kwa kiufundi (marekebisho yanayofaa ya makosa na eneo tulivu), kisha uongeze mtindo wa chapa (rangi, maumbo ya moduli), na hatimaye uzingatie nyongeza za hiari (wekeleo katikati, fremu). Kila safu inapaswa kuthibitishwa kupitia majaribio kabla ya kuendelea. Hali ya Usalama ya ANQR husaidia kutekeleza vipaumbele hivi kwa kuonya wakati uchaguzi wa mitindo unaweza kuhatarisha uchanganuzi.'],
    },
    {
      heading: 'Kuongeza Utambulisho wa Biashara Bila Kuhatarisha Kuegemea',
      paragraphs: ['Uwekaji chapa bora wa QR husawazisha athari ya kuona dhidi ya utegemezi wa skanisho. Anza na rangi: badilisha mandharinyuma nyeusi na kuweka rangi yako msingi ya chapa, hakikisha utofautishaji wa kutosha dhidi ya mandharinyuma yako. Kwa chapa nyingi, rangi nyeusi kwenye mandharinyuma hufanya kazi vyema zaidi. Epuka michanganyiko ya utofautishaji wa chini, gradient ambazo hupunguza uwazi, au rangi zinazofanana katika hali ya kawaida ya mwanga.', 'Urekebishaji wa umbo la moduli hutoa fursa nyingine ya chapa yenye athari ndogo ya kutegemewa. Moduli za mviringo huunda mwonekano laini, unaofikika zaidi huku zikidumisha uchanganuzi bora. Moduli za mtindo wa nukta hufanya kazi vyema kwa chapa za kisasa, zinazoendeleza teknolojia. Moduli zilizounganishwa zinafaa vitambulisho vya viwanda au ushirika. Kwa mtindo wowote utakaochagua, dumisha uthabiti katika matumizi yako yote ya QR kwa utambuzi wa chapa papo hapo.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Mchoro wa gurudumu la rangi unaoonyesha michanganyiko bora ya rangi ya QR na viashirio vya uwiano wa utofautishaji',
          caption: 'Mwongozo wa uteuzi wa rangi ya chapa inayoonyesha michanganyiko ya utofautishaji wa juu ambayo hudumisha uaminifu wa skanisho',
        },
      ],
    },
    {
      heading: 'Itifaki ya Upimaji na Uthibitishaji',
      paragraphs: ['Usiwahi kutumia misimbo iliyoboreshwa ya QR bila majaribio makali. Chapisha uthibitisho halisi kwa ukubwa kamili na nyenzo sawa na utumaji wako wa mwisho. Jaribu katika eneo halisi ambapo msimbo utaishi, kwa nyakati tofauti za siku ili kuhesabu tofauti za mwanga. Tumia angalau vifaa vitatu tofauti: simu kuu ya sasa, kifaa cha kati na simu mahiri ya zamani au ya bajeti.', 'Rekodi nyakati za kuchanganua na viwango vya kufaulu kwa kila jaribio. Msimbo ulioboreshwa vizuri unapaswa kuchanganua ndani ya sekunde 1-2 kwenye kifaa chochote cha kisasa. Iwapo unaona ucheleweshaji au kushindwa mara kwa mara, punguza kasi ya mtindo - ondoa au punguza viwekeleo, ongeza ukubwa wa eneo tulivu, au ubadilishe hadi kiwango cha juu zaidi cha kurekebisha hitilafu. Kuegemea daima huchukua nafasi ya kwanza juu ya kisasa cha kuona.'],
    },
    {
      heading: 'Kufunga Usanidi Wako kwa Uthabiti',
      paragraphs: ['Ukishaidhinisha usanidi bora zaidi, uihifadhi kwa kutumia viungo vinavyoweza kushirikiwa vya ANQR. Hii hutengeneza rekodi ya kudumu ya kila mpangilio unaotumiwa kutengeneza msimbo ulioidhinishwa - rangi, mtindo wa moduli, urekebishaji wa hitilafu, ukubwa na viwekeleo vyovyote. Shiriki kiungo hiki na timu yako ya kubuni, wachuuzi wa magazeti, na mtu yeyote ambaye anaweza kuhitaji kuzalisha tena msimbo katika siku zijazo.', 'Kufuli hii ya usanidi huzuia uharibifu wa taratibu ambao unakumba uwekaji mwingi wa QR. Bila hivyo, wafanyikazi huunda tena misimbo kutoka kwa picha za skrini, wabunifu huunda mipangilio kutoka kwa kumbukumbu, na wachuuzi wa kuchapisha hufanya marekebisho \'yafaayo\'. Kila tofauti huleta masuala yanayoweza kutokea. Ukiwa na kiungo cha usanidi kilichofungwa, kila nakala inafanana na asili yako iliyojaribiwa, iliyoidhinishwa.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Mchoro unaoonyesha mteremko wa usanidi: picha za skrini zinazoongoza kwa uboreshaji unaoongoza kwa anuwai, dhidi ya kiungo cha chanzo kimoja cha ukweli.',
          caption: 'Zuia kuteleza kwa usanidi kwa kuanzisha chanzo kimoja kinachoidhinishwa kwa matoleo yote ya QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Tazama mifano ya QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Misimbo ya QR ya Malipo ya Rejareja',
      paragraphs: ['Nambari za malipo za QR hufanya kazi katika mazingira yanayohitajika sana katika rejareja: wakati wa ununuzi. Wateja wako tayari kulipa, mara nyingi huwa na foleni nyuma yao, na kila sekunde ya kuchelewa huleta msuguano. Bado wakati huu wa shinikizo kubwa pia ni mali isiyohamishika ya uimarishaji wa chapa. Mwongozo huu unaeleza jinsi ya kuunda misimbo ya QR ya malipo ambayo huchanganua papo hapo kwenye programu za benki huku bado ikiwasilisha mwonekano wa kitaalamu, wenye chapa ambayo hujenga imani kwa wateja.', 'Kanuni ya msingi ya malipo ya misimbo ya QR ni kuegemea juu ya urembo. Nambari ya kuthibitisha iliyoundwa kwa umaridadi ambayo inashindwa kuchanganua kwenye programu ya benki ya mteja mmoja itakugharimu zaidi katika miamala iliyoachwa na wateja waliokatishwa tamaa kuliko muundo wa kihafidhina ungeweza kamwe. Anza kwa kufuata, ongeza kutegemewa, kisha uweke kwa uangalifu katika uwekaji chapa pale tu ambapo haiathiri utendaji msingi.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Onyesho la kaunta ya rejareja inayoonyesha msimbo wa QR wa malipo ukichanganuliwa na simu mahiri kwa kutumia programu ya benki',
          caption: 'Nambari za QR za malipo lazima zifanye kazi papo hapo na programu za benki na wallet chini ya hali halisi ya kaunta',
        },
      ],
    },
    {
      heading: 'Kuelewa Viwango vya QR vya Malipo',
      paragraphs: ['Nambari za QR za malipo kwa kawaida hufuata viwango vya kikanda ambavyo huamuru umbizo la upakiaji. Nchini Singapore, PayNow QR hutumia umbizo mahususi. Nchini India, misimbo ya UPI hufuata viwango vya kiungo vya kina vya BharatQR au UPI. Malipo ya SEPA ya Ulaya hutumia misimbo ya EPC QR. Kila kiwango kipo ili kuhakikisha programu za benki zinaweza kutambua na kuchakata maelezo ya malipo papo hapo. Kukiuka viwango hivi - hata kidogo - kunaweza kusababisha programu za malipo kukataa misimbo ambayo vichanganuzi vya kamera za kawaida husoma bila tatizo.', 'ANQR inajumuisha violezo vya viwango vikuu vya malipo ambavyo vinapanga kiotomatiki maelezo yako ya muuzaji kuwa mizigo inayotii. Tumia violezo hivi kila wakati badala ya kujitengenezea masharti ya malipo, kwani hata hitilafu ndogo za uumbizaji zinaweza kusababisha kushindwa kwa shughuli za malipo. Ikiwa kiwango cha malipo cha eneo lako hakipatikani kama kiolezo, wasiliana na hati za kiufundi za mtoa huduma wako wa malipo ili upate mahitaji kamili ya umbizo.'],
    },
    {
      heading: 'Ukubwa na Uwekaji wa Maonyesho ya Kaunta',
      paragraphs: ['Nambari za Counter-top QR hukabiliana na changamoto za kipekee za kimwili. Wateja huchanganua kwa urefu wa mkono, mara nyingi kwa pembe, wakati mwingine kupitia walinzi wa kupiga chafya au visanduku vya kuonyesha. Mwangaza wa juu hutengeneza matangazo ya kung\'aa. Msimbo huu hushindana na vituko vingine vya kukabiliana ili kuzingatiwa na kuona wazi. Saizi ya malipo yako ya QR kwa ukarimu - kiwango cha chini cha 4-5cm kinapendekezwa kwa programu nyingi za kaunta, kuongeza ikiwa msimbo umewekwa nyuma ya glasi au katika eneo lenye mwanga hafifu.', 'Nafasi ni muhimu kama vile ukubwa. Weka msimbo ambapo wateja wanaweza kushikilia simu zao kwa raha bila kuzuia foleni au kufikia kwa shida. Pendeza onyesho kuelekea kwa mteja badala ya kuiweka sawa. Ikiwezekana, tumia lamination ya matte au vifaa vya kuonyesha visivyoakisi ili kupunguza mwangaza kutoka kwa mwanga wa juu. Jaribu mahali pa mwisho kwa nyakati tofauti za siku ili kupata matatizo ya mwanga.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Mchoro unaoonyesha urefu na pembe bora za uwekaji wa QR kwa usanidi tofauti wa kaunta',
          caption: 'Mwongozo wa uwekaji wa kaunta: urefu bora zaidi, pembe na umbali wa kuchanganua malipo yanayotegemewa',
        },
      ],
    },
    {
      heading: 'Uwekaji Chapa Kihafidhina kwa Misimbo ya Malipo',
      paragraphs: ['Programu za malipo hazisameheki kuliko vichanganuzi vya kawaida vya kamera. Programu nyingi za benki hutumia algoriti za zamani na rahisi zaidi za kusoma QR zilizoboreshwa kwa kasi badala ya kubadilika. Hii inamaanisha kuwa mtindo unaofanya kazi kikamilifu na kamera ya simu unaweza kushindwa na programu mahususi za malipo. Weka chapa kihafidhina: tumia rangi ya chapa yako kwa mandhari ya mbele ikiwa inadumisha utofautishaji thabiti, lakini epuka miinuko, uletaji mzito, au vipengee vya mapambo ambavyo vinaweza kutatiza utambuzi.', 'Ikiwa unataka nembo ya kituo au wekeleo, ifanye iwe ndogo sana - isizidi 10-15% ya eneo la QR - na ujaribu kwa kina ukitumia kila programu ya malipo ambayo wateja wako wanaweza kutumia. Biashara nyingi huchagua kutowekelea kwenye misimbo ya malipo haswa, ikihifadhi mtindo huo kwa misimbo ya QR ya uuzaji ambapo mahitaji ya kutegemewa si magumu sana. Kazi ya msimbo wa malipo ni kuchakata miamala, sio kuvutia macho.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Ulinganisho unaoonyesha viwango vinavyokubalika dhidi ya hatari vya chapa kwa misimbo ya malipo ya QR',
          caption: 'Wigo wa chapa ya QR ya malipo: kutoka kwa mtindo salama wa kihafidhina hadi mbinu hatari za mapambo',
        },
      ],
    },
    {
      heading: 'Mazingatio ya Nyenzo na Machapisho',
      paragraphs: ['Nyenzo halisi ya onyesho huathiri pakubwa uaminifu wa skanisho. Mwangaza unaometa huakisi taa za juu moja kwa moja kwenye kamera ya mteja. Nyenzo za maandishi zinaweza kupotosha kingo za moduli. Uchapishaji wa bei nafuu unaweza kufuta maelezo mazuri. Kwa misimbo ya QR ya malipo, wekeza katika ubora: tumia lamination ya matte au satin, hakikisha uchapishaji wa ubora wa juu, na ubadilishe skrini kabla ya kuonyesha uchakavu. Msimbo wa malipo uliochanika au uliofifia unakugharimu miamala.', 'Zingatia uimara na ubadilisho wa onyesho. Maonyesho ya kaunta huguswa, kusogezwa, kurushwa, na kuangusha mara kwa mara. Tengeneza mfumo wako wa kuonyesha ili kichocheo cha QR kiweze kubadilishwa kwa urahisi bila kubadilisha stendi nzima. Weka vichapisho vya ziada vikiwa tayari, vinavyotokana na kiungo chako cha usanidi kilichofungwa, ili misimbo iliyochakaa iweze kubadilishwa mara moja.'],
    },
    {
      heading: 'Kujaribu kwa Programu za Malipo Halisi',
      paragraphs: ['Vichanganuzi vya kawaida vya kamera vitasimbua karibu msimbo wowote wa QR ulioumbizwa ipasavyo. Programu za malipo ni bora zaidi. Kabla ya kutuma msimbo wowote wa QR wa malipo, ijaribu kwa kila programu ya malipo ambayo wateja wako wanaweza kutumia. Katika mazingira ya malipo mengi, hii inaweza kumaanisha kufanya majaribio kwa kutumia programu nyingi za benki, pochi za kidijitali na mifumo ya malipo. Hati ni programu gani umejaribu na matoleo yake - programu za malipo husasishwa mara kwa mara, na sasisho linaweza kubadilisha tabia ya kuchanganua.', 'Jaribu chini ya hali halisi: onyesho halisi, taa halisi, umbali halisi wa skanning. Nambari ya kuthibitisha inayochanganua papo hapo kwenye meza yako inaweza kutatizika kwenye kaunta saa kumi na moja jioni jua la alasiri linapoleta mwangaza. Jaribu na smartphone ya zamani zaidi, ya bei nafuu unaweza kupata - ikiwa inafanya kazi kwa uhakika kwenye kifaa cha bajeti, itafanya kazi kwa kila kitu. Ripoti wakati wowote wa kuchanganua kwa zaidi ya sekunde 2 kwa uchunguzi na uwezekano wa kuunda upya.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Orodha ya majaribio inayoonyesha programu mbalimbali za malipo, aina za vifaa na hali ya mazingira ili kuthibitisha',
          caption: 'Matrix ya majaribio ya QR ya malipo ya kina inayofunika programu, vifaa na vipengele vya mazingira',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Tazama mifano ya QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Misimbo ya QR Iliyotayari Kuchapishwa: SVG dhidi ya PNG',
      paragraphs: ['Tofauti kati ya msimbo wa QR unaochanganua kikamilifu na ule ambao haufaulu mara nyingi hutokana na jinsi ulivyosafirishwa na kushughulikiwa katika uchapaji kazi. Mwongozo huu unafafanua tofauti muhimu kati ya fomati za vekta (SVG) na rasta (PNG), wakati wa kutumia kila moja, na jinsi ya kuwapa wabunifu na wachuuzi wa kuchapisha kazi ya sanaa ya QR kwa njia zinazohifadhi uaminifu wa kuchanganua kutoka kwa kadi za biashara hadi alama za ukubwa wa mabango.', 'Uzalishaji wa uchapishaji huanzisha vigeuzo ambavyo havipo kwenye skrini: kuenea kwa wino, umbile la sehemu ndogo, michakato ya kukamilisha, na athari limbikizi ya ugeuzaji wa faili nyingi. Msimbo wa QR unaoonekana vizuri katika programu yako ya usanifu unaweza kujitokeza kutoka kwa kichapishi ikiwa na kingo laini, utofautishaji uliopunguzwa, au moduli zilizopotoshwa kwa njia ndogo. Kuelewa uteuzi wa umbizo na utendakazi bora huzuia hitilafu hizi za kimya kimya.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Mwonekano uliokuzwa ukilinganisha moduli za QR za vekta na kingo nyororo dhidi ya moduli mbaya zinazoonyesha vizalia vya pixel',
          caption: 'Vekta dhidi ya raster kwa kiwango cha uchapishaji: tofauti ya usahihi ambayo huamua kuegemea kwa skanisho',
        },
      ],
    },
    {
      heading: 'Kwa nini Vekta (SVG) Inapendelewa kwa Kuchapishwa',
      paragraphs: ['Faili za SVG hufafanua misimbo ya QR kama maumbo ya hisabati badala ya gridi za saizi. Hii inamaanisha kuwa msimbo unaweza kuongezwa kwa ukubwa wowote - kutoka kwa lebo ya 1cm hadi bango la mita 10 - bila kupoteza ukali wowote. RIP ya kichapishi (Kichakataji cha Picha Raster) hutoa vekta katika ubora asilia wa kifaa cha kutoa, kuhakikisha kila ukingo wa sehemu ni safi kadri maunzi inavyoruhusu. Hakuna tafsiri, hakuna vizalia vya programu vya kuzuia kutengwa, hakuna ukungu uliokusanywa kutoka kwa shughuli nyingi za kubadilisha ukubwa.', 'Zaidi ya uboreshaji, faili za SVG ni thabiti zaidi katika utiririshaji wa kazi wa kitaalamu. Wanaishi safari za kwenda na kurudi kupitia programu ya muundo bila uharibifu. Wanaweza kusahihishwa kwa rangi bila sampuli tena. Zinapachika kwa usafi kwenye faili za PDF kwa towe lililo tayari kwa vyombo vya habari. Kwa programu yoyote ya kuchapisha ambayo ubora ni muhimu, SVG inapaswa kuwa umbizo lako chaguo-msingi la kuhamisha.'],
    },
    {
      heading: 'Wakati PNG Inakubalika',
      paragraphs: ['PNG inakuwa muhimu wakati utendakazi au jukwaa lengwa halitumii fomati za vekta. Baadhi ya majukwaa ya wavuti, mifumo ya alama za CMS, na utiririshaji wa kazi wa kuchapisha urithi huhitaji picha chafu. Katika hali hizi, PNG inaweza kufanya kazi vizuri - lakini ikiwa tu utafuata sheria kali: usafirishaji katika saizi ya mwisho na azimio, usiwahi kupanda baada ya usafirishaji, na epuka mbano wowote wa hasara au ubadilishaji wa umbizo.', 'Kanuni muhimu ya PNG ni kukokotoa vipimo vyako vya pikseli vinavyohitajika kabla ya kusafirisha. Ikiwa QR yako itachapisha kwa 5cm na printa yako inafanya kazi kwa 300 DPI, unahitaji takriban pikseli 590. Hamisha kwa ukubwa huu au kubwa zaidi, kisha upunguze ikiwa inahitajika - usiwahi juu. Jumuisha maelezo haya katika jina la faili au metadata yako ili watumiaji wa siku zijazo wasitumie vibaya uhamishaji wa ukubwa mahususi kimakosa.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Kiolesura cha kikokotoo kinachoonyesha uhusiano kati ya ukubwa halisi, DPI, na vipimo vya pikseli vinavyohitajika',
          caption: 'Kikokotoo cha ubora wa uchapishaji: kubainisha vipimo vya chini zaidi vya pikseli kwa saizi ya matokeo unayolenga',
        },
      ],
    },
    {
      heading: 'Chaguzi za Usafirishaji za ANQR Zimefafanuliwa',
      paragraphs: ['ANQR inatoa njia kadhaa za kuhamisha SVG ili kuendana na utiririshaji tofauti wa kazi. Hali ya Vekta ya Kweli hutoa pato safi linalotegemea njia bora kwa zana za uchapishaji na za kitaalamu za kubuni. Unapoongeza viwekeleo vikali au athari fulani, ANQR inaweza kupachika hizi huku ikidumisha moduli za vekta, au unaweza kuhamisha toleo lililo na rangi kamili katika msongo wako uliobainishwa. Kuelewa chaguo hizi hukusaidia kuchagua uhamishaji sahihi kwa kila kesi ya utumiaji.', 'Kwa uhamishaji wa PNG, ANQR hukuruhusu kubainisha vipimo kamili na inajumuisha chaguo za mandharinyuma zinazoonekana. Mpangilio wa DPI hukusaidia kukokotoa saizi zinazofaa kwa uchapishaji, ingawa kumbuka kuwa DPI ni metadata - kinachofaa kwa uchapishaji ni kuwa na saizi za kutosha kwa saizi yako halisi. Ukiwa na shaka, safirisha nje kubwa kuliko unavyofikiri unahitaji; kuongeza chini huhifadhi ubora wakati kuongeza juu kunaharibu.'],
    },
    {
      heading: 'Kuandaa Faili za Handoff',
      paragraphs: ['Unapopitisha mchoro wa QR kwa wabunifu au wachuuzi wa kuchapisha, jumuisha vipimo vilivyo wazi: ukubwa wa kimwili unaokusudiwa, mahitaji ya chini ya eneo tulivu, na masuala yoyote ya nafasi ya rangi. Kwa programu muhimu, toa programu kuu ya SVG na hifadhi rudufu ya PNG yenye msongo wa juu, iliyo na lebo ya matumizi yaliyokusudiwa. Jumuisha kiungo chako cha usanidi cha ANQR ili msimbo uweze kuundwa upya ikihitajika.', 'Tarajia makosa ya kawaida katika mchakato wa kukabidhi. Tamka kwa uwazi kwamba QR haipaswi kuongezwa, kuzungushwa, kupindishwa, au kuwa na athari kutumika. Bainisha kuwa eneo tulivu lazima lisalie wazi - hakuna alama za kupunguza, alama za usajili, au vipengele vya muundo vinavyoingilia. Ikiwa QR itawekwa kwenye mandharinyuma yenye rangi au picha, toa toleo lenye umbo lisilo wazi ili kuhakikisha utofautishaji wa kutosha.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Mchoro wa kifurushi cha faili unaoonyesha bwana wa SVG, hifadhi rudufu ya PNG, hati ya vipimo, na kiungo cha usanidi',
          caption: 'Kifurushi cha kitaalam cha QR: kila kitu ambacho mbuni au mchuuzi wa magazeti anahitaji kwa ajili ya kuzaliana kwa usahihi',
        },
      ],
    },
    {
      heading: 'Inathibitisha Uthibitisho wa Kuchapisha',
      paragraphs: ['Usiwahi kuidhinisha uchapishaji bila kuchanganua uthibitisho halisi. Omba uthibitisho uliochapishwa kwenye substrate halisi na kumaliza halisi ambayo itatumika katika uzalishaji. Changanua uthibitisho chini ya hali ya taa sawa na mahali kipande cha mwisho kitaonyeshwa. Jaribu kwa vifaa vingi, ikiwa ni pamoja na simu mahiri za zamani ambazo zinaweza kutatizika na ubora wa chini.', 'Iwapo uthibitisho utachanganua polepole au bila kufuatana, chunguza kabla ya kuidhinisha. Matatizo ya kawaida ni pamoja na utofautishaji usiotosheleza kwenye substrates za rangi, ukiukaji wa eneo tulivu kutokana na upunguzaji, kingo za moduli za kulainisha wino, au lamination kuunda mwako. Yoyote kati ya haya yanaweza kushughulikiwa kabla ya kujitolea kwa uchapishaji kamili - lakini tu ikiwa utaipata katika hatua ya uthibitisho.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Orodha ya ukaguzi wa uthibitisho yenye matokeo ya majaribio ya kuchanganua, vipimo vya utofautishaji na sahihi za uidhinishaji',
          caption: 'Mtiririko wa kazi wa uthibitishaji wa uthibitisho: majaribio ya kimfumo kabla ya kujitolea kwa idadi ya uzalishaji',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Tazama mifano ya QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Kuunda Misimbo ya Uhuishaji ya QR',
      paragraphs: ['Misimbo ya QR iliyohuishwa inachanganya utendakazi wa misimbo ya kawaida ya QR na mwendo unaovutia ambao huongeza sana viwango vya ushiriki. Katika alama za kidijitali, mitandao jamii, na maonyesho shirikishi, uhuishaji hubadilisha matumizi tuli kuwa kipengele cha kuona kinachovutia ambacho huvutia macho na kualika mwingiliano. Mwongozo huu unashughulikia kanuni, mbinu na vikwazo vya kiutendaji vya kuunda misimbo ya QR iliyohuishwa ambayo huchanganua kwa uhakika huku ikitoa athari ya kuona.', 'Changamoto kuu ya misimbo ya QR iliyohuishwa ni kusawazisha maslahi ya taswira dhidi ya utegemezi wa skanisho. Kila fremu lazima iweze kuchanganuliwa kibinafsi - kichanganuzi kinaweza kunasa msimbo wakati wowote katika mzunguko wa uhuishaji. Kizuizi hiki kinaunda kila uamuzi wa muundo: ni vipengele vipi vinaweza kusogezwa, ni kiasi gani vinaweza kubadilika, na ni nini kinachopaswa kusalia thabiti katika uhuishaji wote.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Onyesho la alama za kidijitali linaloonyesha msimbo wa QR uliohuishwa unaovutia watazamaji katika nafasi ya umma',
          caption: 'Misimbo ya QR iliyohuishwa katika alama za kidijitali: mwendo unaovutia watu na kuhimiza uchanganuzi',
        },
      ],
    },
    {
      heading: 'Jinsi Uhuishaji Unavyoathiri Uchanganuzi',
      paragraphs: ['Vichanganuzi vya QR hufanya kazi kwa kunasa fremu moja na kuchanganua muundo wa moduli nyepesi na nyeusi. Ili msimbo uliohuishwa ufanye kazi, kila fremu lazima iwe na mchoro kamili na sahihi wa QR. Hii inakataza uhuishaji ambao hubadilisha muundo wa msimbo, moduli za kuyeyusha, au kubadilisha kwa kiasi kikubwa muundo wa utofautishaji. Moduli za kubeba data - muundo unaoonekana kuwa nasibu katikati - lazima zisalie kuwa dhabiti kote.', 'Mbinu salama za uhuishaji hurekebisha vipengele ambavyo havibeba data: mandharinyuma, rangi, fremu za mapambo na vipengee vya kuwekelea. Vipengele vya miundo - mifumo ya kitafutaji (miraba mikubwa ya kona), mifumo ya muda (mistari inayopishana), na mifumo ya upatanishi (miraba midogo katika misimbo mikubwa) - lazima idumishe nafasi na uwiano wao. Kufanya kazi ndani ya vizuizi hivi bado huruhusu uhuishaji wenye nguvu na wa kuvutia.'],
    },
    {
      heading: 'Mbinu za Uhuishaji Zinazofanya Kazi',
      paragraphs: ['Uendeshaji baisikeli wa rangi huhuisha rangi ya mandhari ya mbele na ya mandharinyuma kupitia ubao huku kikidumisha utofautishaji wa kutosha katika kila hatua. Hii inaleta athari chanya, ya kuvutia umakini na hatari ndogo ya skanisho - mradi utofauti haushuki chini ya viwango vinavyoweza kusomeka. Mipangilio ya awali ya mzunguko wa rangi ya ANQR imeundwa ili kudumisha uchanganuzi katika kipindi chote cha mzunguko.', 'Uwekeleaji uliohuishwa huweka taswira inayosonga nyuma ya muundo wa QR usio na uwazi. Msimbo unasalia thabiti huku usuli unapohuishwa - labda video inayozunguka, vipengee vya chapa iliyohuishwa, au michoro dhahania ya mwendo. Mbinu hii inahitaji udhibiti wa kiwango cha juu ili kuzuia usuli dhidi ya kupita muundo wa QR, lakini huunda matokeo ya kuvutia zaidi.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Mchoro unaoonyesha muundo wa tabaka wa QR iliyohuishwa: safu thabiti ya msimbo juu ya safu ya usuli iliyohuishwa.',
          caption: 'Kanuni ya kuweka tabaka kwa uhuishaji: mchoro wa QR husalia thabiti huku vipengele vya usuli huhuishwa chini',
        },
      ],
    },
    {
      heading: 'Inasanidi Vigezo vya Uhuishaji',
      paragraphs: ['Kasi ya fremu huathiri ulaini wa kuona na saizi ya faili. Kwa programu nyingi, fremu 10-15 kwa sekunde hutoa mwendo mzuri bila saizi nyingi za faili. Viwango vya juu vya fremu vinapunguza mapato ya kuona huku wakiongeza saizi za faili kwa kiasi kikubwa. Zingatia muktadha wako wa uwasilishaji - ishara kubwa ya dijitali inaweza kushughulikia faili kubwa kuliko uwekaji wa tangazo kwenye simu ya mkononi.', 'Tabia ya kitanzi huamua jinsi mizunguko ya uhuishaji inavyozunguka. Mizunguko isiyo na mshono huunda mwendo unaoendelea kuwa bora kwa alama na maonyesho tulivu. Vitanzi vya Ping-pong (mbele-kisha-reverse) hufanya kazi vizuri kwa uhuishaji rahisi. Kwa mapigo ya kuvutia, zingatia uhuishaji wenye kushikilia - vipindi vya utulivu vilivyoangaziwa na harakati inayovutia jicho bila uchovu wa kila wakati.'],
    },
    {
      heading: 'Kuunda Uwekeleaji Uliohuishwa',
      paragraphs: ['Unapotumia picha zilizohuishwa (GIF, WebPs zilizohuishwa, au video) kama viwekeleo, ANQR huchota fremu na kuzichanganya pamoja na msimbo wako wa QR. Mpangilio wa kiwango cha kuwekelea hudhibiti ni kiasi gani cha uhuishaji huonyeshwa kupitia - thamani za chini hutanguliza utambazaji ilhali viwango vya juu vinapendelea athari ya kuona. Jaribu kiwango ulichochagua kwenye fremu nyingi ili kuhakikisha utambazaji thabiti.', 'Ubora wa nyenzo za chanzo huathiri sana matokeo. Tumia viwekeleo vyenye mada wazi na utofautishaji mzuri. Epuka uhuishaji wa vyanzo kwa kuwaka kwa haraka au mabadiliko ya mwangaza kupita kiasi ambayo yanaweza kuunda fremu zenye utofautishaji wa chini mara kwa mara. Hakiki mzunguko kamili wa uhuishaji kabla ya kusafirisha ili kupata fremu zozote zenye matatizo ambazo zinaweza kushindwa kuchanganua.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Mwonekano wa fremu kwa fremu ya kuwekelea kwa uhuishaji inayoonyesha viwango vya utofautishaji vilivyodumishwa katika mfuatano',
          caption: 'Uchanganuzi wa fremu: kuthibitisha uchanganuzi thabiti katika mzunguko mzima wa uhuishaji',
        },
      ],
    },
    {
      heading: 'Mazingatio ya Usafirishaji na Uwasilishaji',
      paragraphs: ['GIF inasalia kuwa umbizo la uhuishaji linalotumika zaidi, ikicheza kiotomatiki katika miktadha mingi bila kuhitaji usaidizi wa kicheza video. Hata hivyo, paleti ya GIF ya rangi 256 inazuia uaminifu wa rangi. Kwa uhuishaji muhimu wa rangi, zingatia WebP iliyohuishwa inapotumika, au rudi kwenye fomati za video kwa ubora wa juu zaidi. Uhamishaji wa GIF wa ANQR unajumuisha chaguo za kugawanya ili kuongeza ubora ndani ya vikwazo vya palette.', 'Saizi ya faili ni muhimu kwa utoaji. Mifumo ya alama za kidijitali, wateja wa barua pepe, na majukwaa ya kijamii mara nyingi huweka kikomo cha ukubwa. Ikiwa uhuishaji wako unazidi mipaka hii, punguza hesabu ya fremu, vipimo au kina cha rangi. Wakati mwingine kugawanya uhuishaji changamano katika kitanzi kifupi kunafanikisha matokeo bora kuliko mgandamizo mkali unaoshusha hadhi ya kila fremu.'],
    },
    {
      heading: 'Inajaribu Misimbo ya QR Uhuishaji',
      paragraphs: ['Kujaribu misimbo iliyohuishwa kunahitaji kuchanganua katika sehemu nyingi katika mzunguko wa uhuishaji. Usichanganue mara moja tu na kudhani kuwa umefaulu - soma mara kwa mara, kwa nyakati tofauti, ili kuthibitisha kwamba kila fremu inaweza kusomeka. Zingatia sana fremu katika viwango vya juu vya mzunguko wa rangi au kilele cha kiwango cha juu ambapo utofauti unaweza kuwa wa chini zaidi.', 'Jaribu kwenye maunzi halisi ya kuonyesha inapowezekana. Fuatilia urekebishaji wa rangi, pembe ya kutazama, na mwangaza wote huathiri jinsi uhuishaji unavyoonekana na kuchanganua. Uhuishaji unaong\'aa unaochanganua kikamilifu kwenye kichunguzi chako unaweza kuosha kwenye skrini ya nje au usisomeke kwa pembe za kutazama za oblique.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Mchanganyiko wa majaribio unaoonyesha viwango vya mafanikio vya kuchanganua katika fremu, vifaa na hali tofauti za kuonyesha',
          caption: 'Itifaki ya majaribio ya QR iliyohuishwa: uthibitishaji wa kimfumo kwenye fremu, vifaa na hali ya kutazama',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Tazama mifano ya QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Usalama wa QR na Mbinu Bora za Uzingatiaji',
      paragraphs: ['Msimbo wa QR ulioundwa kwa umaridadi ambao unashindwa kuchanganua ni mbaya zaidi kuliko haufai - huwafadhaisha wateja, huharibu mtazamo wa chapa, na kupoteza kila rasilimali iliyowekezwa katika uundaji na usambazaji wake. Mwongozo huu unashughulikia vipengele vya kiufundi na vitendo vinavyobainisha kama msimbo wa QR utachanganua kwa njia ya kuaminika, na jinsi ya kutumia vipengele vya usalama vya ANQR ili kupata matatizo yanayoweza kutokea kabla ya kufikia uzalishaji.', 'Kuegemea kwa msimbo wa QR sio jozi. Msimbo unaweza kuchanganua kikamilifu kwenye simu maarufu lakini usifaulu kwenye vifaa vya bajeti. Inaweza kufanya kazi katika mwangaza mzuri lakini itasumbua katika mikahawa hafifu au mwangaza wa jua. Kuelewa mambo yanayoathiri uchanganuzi hukusaidia kufanya biashara kati ya mtindo wa kuona na kutegemewa katika ulimwengu halisi.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Wigo wa kutegemewa unaoonyesha misimbo ya QR kuanzia inayoweza kuchanganuliwa sana hadi inayoweza kusomeka kidogo',
          caption: 'Wigo wa kuchanganua: kutoka kwa misimbo isiyoweza kupenya risasi hadi mtindo unaosukuma viwango vya kutegemewa',
        },
      ],
    },
    {
      heading: 'Kuelewa Viwango vya Kurekebisha Hitilafu',
      paragraphs: ['Misimbo ya QR inajumuisha upunguzaji wa ziada uliojumuishwa ndani ambayo huruhusu kusomwa hata wakati imeharibiwa kidogo au kufichwa. Kiwango cha kusahihisha hitilafu - L (7%), M (15%), Q (25%), au H (30%) - huamua ni kiasi gani cha msimbo kinaweza kukosekana ukiendelea kusimbua ipasavyo. Urekebishaji wa makosa ya juu zaidi huunda misimbo kubwa zaidi lakini hutoa ukingo wa usalama kwa viwekeleo, dosari za uchapishaji na uharibifu wa mazingira.', 'Kwa misimbo iliyo na viwekeleo vya picha, kiwango cha kusahihisha makosa H ni muhimu - kuwekelea huficha sehemu ya msimbo, na unahitaji upungufu huo wa 30% ili kudumisha kutegemewa. Kwa misimbo safi, isiyo na mtindo katika mazingira yanayodhibitiwa, kiwango cha M mara nyingi kinatosha. Kiwango cha L kinapaswa kuhifadhiwa kwa hali ambapo ukubwa wa msimbo umebanwa sana na unaweza kuhakikisha hali safi.'],
    },
    {
      heading: 'Eneo la Utulivu Muhimu',
      paragraphs: ['Eneo tulivu ni ukingo tupu unaozunguka kila msimbo wa QR. Vichanganuzi hutumia mpaka huu kutambua mahali ambapo msimbo unaanzia na kuishia. Kiwango cha ISO kinabainisha eneo la chini kabisa la utulivu la moduli nne (mara nne ya upana wa mraba mdogo zaidi katika msimbo). Ukiukaji wa nafasi hii - na vipengee vya muundo, kingo za trim, au yaliyomo karibu - ni moja ya sababu za kawaida za kushindwa kwa skanisho.', 'Utekelezaji wa eneo tulivu la ANQR husaidia kudumisha nafasi hii muhimu, lakini lazima pia uhakikishe kuwa imehifadhiwa katika miundo yako ya mwisho. Unapokabidhi mchoro wa QR, taja kwa uwazi mahitaji ya eneo tulivu. Unapoweka misimbo katika mipangilio, thibitisha kuwa hakuna vipengele vinavyoingilia nafasi hii. Milimita chache za nafasi wazi zinaweza kumaanisha tofauti kati ya skanning ya kuaminika na wateja waliofadhaika.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Mchoro unaoonyesha nafasi sahihi ya eneo tulivu dhidi ya ukiukaji wa kawaida unaosababisha matatizo ya kuchanganua',
          caption: 'Mahitaji ya eneo tulivu: ukingo usioonekana ambao huamua mafanikio ya skanning',
        },
      ],
    },
    {
      heading: 'Tofauti na Usalama wa Rangi',
      paragraphs: ['Vichanganuzi vya QR hutambua muundo wa moduli nyepesi na nyeusi. Mtindo wowote unaopunguza utofautishaji huu - mandharinyuma mepesi, mandharinyuma meusi, madoido ya upinde rangi, au viwekeleo visivyo na uwazi - hufanya msimbo kuwa mgumu kusoma. ANQR hukokotoa uwiano wa utofautishaji na kuonya uchaguzi wako wa rangi unapokaribia viwango hatari, lakini kisuluhishi cha mwisho huwa ni majaribio ya ulimwengu halisi.', 'Mtazamo wa rangi hutofautiana na hali ya taa. Mchanganyiko wa rangi unaoonekana wenye utofautishaji wa juu kwenye kidhibiti chako unaweza kuwa vigumu kutofautisha chini ya mwangaza wa mwanga wa incandescent au mirija baridi ya fluorescent. Ikiwa msimbo wako utatumwa katika hali tofauti za mwanga, jaribu chini ya vyanzo vingi vya mwanga, na uzingatie uwiano wa utofautishaji wa kihafidhina kama ukingo wa usalama.'],
    },
    {
      heading: 'Ukubwa wa Moduli na Umbali wa Kutazama',
      paragraphs: ['Ukubwa wa kimwili wa moduli za kibinafsi huamua umbali wa juu zaidi ambao msimbo unaweza kuchanganuliwa. Moduli ndogo humaanisha misimbo midogo lakini zinahitaji umbali wa karibu wa kuchanganua. Kanuni ya jumla ni kwamba kila moduli inapaswa kuwa angalau 0.5mm katika umbali uliokusudiwa wa skanning, ikiongeza kwa uwiano kwa umbali mkubwa zaidi. Msimbo kwenye ubao unahitaji moduli kubwa zaidi kuliko msimbo kwenye kadi ya biashara.', 'Wakati wa kuhesabu ukubwa wa moduli, zingatia hali mbaya zaidi: mteja aliye na simu ya zamani, akiwa na mwanga usio kamili, anachanganua kwa umbali unaowezekana. Muundo wa mtumiaji huyu, na kila mtu mwingine atakuwa na matumizi bora zaidi. Mapendekezo ya ukubwa wa ANQR huchangia katika anuwai hizi za ulimwengu halisi ili kupendekeza vipimo vinavyofaa kwa matumizi unayokusudia.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Chati inayohusiana na ukubwa wa moduli, vipimo vya uchapishaji, na umbali wa juu zaidi wa ufanisi wa kuchanganua',
          caption: 'Mwongozo wa umbali wa kuchanganua: kulinganisha saizi ya moduli na mahitaji yako ya utumaji',
        },
      ],
    },
    {
      heading: 'Kwa kutumia Hali ya Usalama ya ANQR',
      paragraphs: ['Hali ya Usalama ya ANQR hutoa maoni ya wakati halisi kuhusu kutegemewa kwa skanisho. Hufuatilia uwiano wa utofautishaji, utiifu wa eneo tulivu, ukubwa wa muunganisho, na vipengele vingine vinavyoathiri uchanganuzi. Wakati kigezo chochote kinapokaribia viwango vya hatari, utaona maonyo yenye mwongozo mahususi wa jinsi ya kuboresha kutegemewa. Kwa uwekaji wa kitaalamu ambapo kushindwa ni ghali, weka Hali ya Usalama amilifu katika mchakato wa kubuni.', 'Hali ya Usalama pia inajumuisha kipengele cha uthibitishaji cha kuchanganua ambacho hujaribu kusimbua msimbo wako uliozalishwa na kuripoti mafanikio au kutofaulu. Ingawa uthibitishaji huu wa ndani ya programu hauwezi kuiga kila hali ya ulimwengu halisi, unakumbana na masuala mengi ya kawaida kabla ya kuwekeza katika uchapishaji au usambazaji. Chukulia uthibitishaji uliofaulu kama kiwango cha chini zaidi, si hakikisho - majaribio ya ulimwengu halisi bado ni muhimu.'],
    },
    {
      heading: 'Itifaki za Majaribio ya Ulimwengu Halisi',
      paragraphs: ['Hakuna kiasi cha uthibitishaji wa programu kinachochukua nafasi ya majaribio ya kimwili. Chapisha msimbo wako kwa ukubwa unaotarajiwa kwenye nyenzo wakilishi. Ijaribu katika mazingira halisi ya kupelekwa kwa hali ya mwanga inayolingana na matumizi halisi. Changanua ukitumia vifaa vingi - sio tu simu yako kuu, lakini vifaa vya Android vya bajeti, iPhone za zamani, na vifaa vyovyote mahususi ambavyo hadhira yako hutumia kwa kawaida.', 'Andika majaribio yako kwa utaratibu. Rekodi ni vifaa gani vilijaribiwa, chini ya hali gani, na matokeo gani. Iwapo unatumia misimbo kwa kiwango kikubwa, weka vigezo vya kukubalika: labda 95% ya kiwango cha mafanikio kwenye jaribio la kifaa chako, au uchanganuzi uliofaulu ndani ya sekunde 2 kwenye vifaa vyote vilivyojaribiwa. Viwango hivi husaidia kufanya maamuzi ya kutokwenda/ya kutokwenda kuwa lengo badala ya kutumainia yaliyo bora zaidi.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Orodha ya kina ya majaribio inayojumuisha vifaa, masharti na vigezo vya kukubalika',
          caption: 'Itifaki ya majaribio ya uwekaji wa QR: uthibitishaji wa kimfumo kabla ya kujitolea kwa uzalishaji',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Fungua jenereta',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Tazama mifano ya QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Tazama mifano ya QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Fungua Mwongozo kamili wa Mtumiaji', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Fungua ghala', type: 'gallery' },
  ],
};
