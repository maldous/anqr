import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Izibonelo ze-ANQR',
  description: 'Izibonelo ezinhlanu zangempela, zesitayela sokukhiqiza ezibonisa lapho amakhodi e-QR adala khona inani elilinganisekayo: ukuphakamisa ikhodi yokuphikisana yokuthengisa endala, izinkokhelo zokuthengisa ezinophawu kanye nezenzo "zokuskena", ukukala kokuphrinta kusuka kumaflaya kuya kumabhodi okukhangisa, i-QR enyakazayo yezibonakaliso zedijithali, kanye nokubambisana kwezilimi ezahlukene usebenzisa izixhumanisi ze-Anchor ezabiwe. Isibonelo ngasinye sihlanganisa izithombe, imikhawulo esebenzayo, kanye nesixhumanisi sokuxuba kabusha esibuyela kujeneretha.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Vula ijenereyitha', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Dlulisa amehlo Funda izihloko', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Vula Umhlahlandlela Womsebenzisi Ogcwele', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Isifundo Secala: Ukuthuthukiswa Kwe-QR Yekhawuntara Yokuthengisa',
      paragraphs: ['Lesi sibonelo sangempela silandela ikhefi elincane elalisebenzisa ikhodi efanayo ye-QR kukhawunta yalo iminyaka emithathu. Ikhodi yokuqala yakhiqizwa ngokushesha ngesikhathi sokuqubuka kobhubhane, yanyatheliswa ephepheni elijwayelekile, futhi yafakwa esitobhini sepulasitiki. Yasebenza - ngobuchwepheshe - kodwa amakhasimende ayevame ukudinga imizamo eminingi yokuskena, futhi akwenzanga lutho ukuqinisa ubunikazi bomkhiqizo bekhefi obuklanywe ngokucophelela.', 'Ushintsho lwaqala ngokuhlola okulula: ikhodi ekhona yayibhala i-URL yemenyu yekhefi eku-inthanethi, ababefuna ukuyigcina. Inselele kwakuwukwenza i-QR izwakale njengengxenye yesipiliyoni sekhefi kunokuba ibe yinto ecatshangelwe kamuva kusukela ngo-2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Ikhodi ye-QR egugile esitobhini sepulasitiki esibonisa ukuguguleka okubonakalayo, izigxivizo zeminwe, kanye nokunyathelisa okufiphele',
          caption: 'Indawo yokuqala: iminyaka emithathu yenkonzo yekhawuntara yayishiye i-QR yokuqala ingasebenzi kahle',
        },
      ],
    },
    {
      heading: 'Ukuthola Izinkinga Zekhodi Yokuqala',
      paragraphs: ['Ukuhlola kwembule izinkinga eziningi: ikhodi yokuqala yasebenzisa Ukulungiswa Kwephutha L (ukuphindaphinda okuncane), yayinendawo ethule yamamojula ama-2 kuphela, futhi yanyatheliswa ngesisombululo esiphansi. Ngaphansi kokukhanya okufudumele kwekhefi, amamojula amnyama asevele efiphele awazange ahluke kakhulu ephepheni eliphuzi. Amafoni amadala ahluphekile; amafoni amasha aphumelele kodwa ngokubambezeleka okubonakalayo.', 'Ngaphandle kwezinkinga zobuchwepheshe, isikwele esijwayelekile esimnyama nomhlophe asizange sixhumane nomkhiqizo. Amakhasimende anqikaza ngaphambi kokuskena - isithiyo esicashile sokuthembana esanciphisa ukuzibandakanya nemenyu yedijithali yekhefi eklanywe ngokucophelela.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'I-overlay yokuxilonga ekhombisa ukushiyeka kobuchwepheshe be-QR yokuqala: i-ECC ephansi, indawo encane yokuthula, umehluko ompofu',
          caption: 'Ukuhlaziywa kobuchwepheshe okuveza ukuthi kungani ikhodi yakudala ingasebenzi kahle ezimweni zangempela',
        },
      ],
    },
    {
      heading: 'Inqubo Yokuphakamisa',
      paragraphs: ['Esebenzisa i-ANQR, umnikazi wekhefi wadala kabusha ikhodi ene-URL yemenyu efanayo kodwa wathuthukisa kakhulu izilungiselelo: Ukulungiswa Kwephutha H ukuze kube nokuqina okuphezulu, indawo ethule yamamojula ayi-6 yokutholakala komngcele okuthembekile, kanye nemibala yomkhiqizo (amamojula ajulile e-burgundy ngemuva kwekhrimu) afana nephalethi yangaphakathi yekhefi.', 'I-overlay encane ephakathi enelogo yekhefi yangezwa - yagcinwa iyimfihlo ngamabomu ukuze kugcinwe ukuskenwa ngenkathi inikeza ukuqashelwa komkhiqizo okusheshayo. Imodi Yokuphepha iqinisekisile ukuthi umklamo omusha uskenwe ngokuthembekile kuwo wonke amadivayisi okuhlola ngaphambi kokuphrinta.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Isixhumi esibonakalayo se-ANQR esibonisa ukucushwa: imibala yomkhiqizo, i-ECC efanele, indawo ethule kakhulu, ukunqwabelanisa kwelogo engabonakali',
          caption: 'Ukwakha ukucushwa okuthuthukisiwe: zonke izilungiselelo ezikhethiwe ukulinganisela ukubonakaliswa komkhiqizo nokuthembeka kokuskena',
        },
      ],
    },
    {
      heading: 'Imiphumela Elinganiswayo',
      paragraphs: ['Ngemuva kokusebenzisa i-QR entsha esitokweni samakhadi esinobungcweti esinama-matte, ikhefi lilandelele imiphumela emavikini amane. Izinga lempumelelo yokuskena lithuthuke lisuka ku-70% laya cishe ku-100%. Isikhathi esimaphakathi sokuskena sehle kusukela kumasekhondi angu-3-4 saya ngaphansi komzuzwana owodwa. Okubaluleke kakhulu, ukuzibandakanya kwemenyu kukhuphuke ngo-40% - amakhasimende ayebheke i-QR ngaphambilini futhi ayeka manje ayeskena ngokuzethemba.', 'Abasebenzi babike imibuzo embalwa yamakhasimende mayelana \'nendlela yokusebenzisa i-QR\' futhi akusekho izimo zokuthayipha ngesandla i-URL yamakhasimende akhungathekile. Ukubukeka komkhiqizo nakho kwavusa izingxoxo, namakhasimende ephawula kahle ngomklamo ohlangene.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Ukuqhathaniswa kwangaphambi/ngemuva nezilinganiso: izinga lempumelelo yokuskena, isikhathi esimaphakathi sokuskena, kanye nokuthuthukiswa kwenani lokuskena lamasonto onke',
          caption: 'Amasonto amane edatha ebonisa umthelela olinganisekayo wokuphakama kwe-QR okucatshangelwe kahle',
        },
      ],
    },
    {
      heading: 'Phinda Udale Lokhu Kulungiselelwa',
      paragraphs: ['Ukulungiselelwa kwekhefi kubonisa uphawu olugcinayo kodwa olusebenzayo: Ukulungiswa Kwephutha H, indawo ethule yamamojula ayi-6, imibala yomkhiqizo ehluke kakhulu, kanye nokumbozwa okuphakathi okuncane. Leli bhalansi lisebenza ezinhlelweni eziningi zokuthengisa lapho ukuthembeka kufanele kuze kuqala kodwa ukuba khona komkhiqizo kusabalulekile.', 'Vula ijenereyitha ngalezi zilungiselelo ezilayishwe kusengaphambili bese uvumelanisa imibala kanye nokumbozwa nomkhiqizo wakho. Ukuqonda okubalulekile: ukuthuthukiswa kokuthembeka kodwa kungakhulisa kakhulu ukuzibandakanya, ngisho nangaphambi kokwengeza noma yisiphi isitayela esibonakalayo.', 'Buka umhlahlandlela wokufunda ohlobene wokuthuthukisa imikhankaso ye-QR ekhona ukuze uthole indlela ephelele ngemuva kwale ndlela.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Isixhumanisi sejenereyitha esilungiselelwe kusengaphambili nezilungiselelo zekhefi ukuze kwenziwe ngokwezifiso ngokushesha',
          caption: 'Qala ngokulungiselelwa okuqinisekisiwe bese wenza ngokwezifiso umkhiqizo wakho',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Dlulisa amehlo Funda izihloko',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Isifundo Secala: Isibonisi Sekhawunta Yokukhokha Okuningi',
      paragraphs: ['Lesi sibonelo silandela isitolo sezingubo zezitolo ezinkulu esasiqoqe amakhodi e-QR amahlanu ahlukene kurejista yaso: ukukhokha ebhange, amathiphu, i-Instagram, ukubuyekezwa kwe-Google, kanye nesixhumanisi sokuqasha. Ngayinye yakhiqizwa emthonjeni ohlukile, yanyatheliswa ngezikhathi ezahlukene, futhi yaboniswa ezitendini ezingahambisani. Isiphithiphithi esibonakalayo sasiphazamisa ubuhle besitolo obuhlelwe ngokucophelela, futhi abasebenzi babevame ukubhekana namakhasimende askena ikhodi engalungile.', 'Isixazululo sasidinga ukukhathazeka okuhlukanisiwe: amakhodi okukhokha ayedinga ukuthembeka okuphezulu ngesitayela esilondolozayo, kuyilapho amakhodi okumaketha engaba sobala kakhulu. Uhlelo lokubonisa oluhlanganisiwe oluvele lubonisa indlela yokulinganisela ukuba khona komkhiqizo ngokumelene nezidingo zokusebenza zamacala ahlukene okusetshenziswa kwe-QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Indawo yokubhalisa ephithizelayo ekhombisa amakhodi e-QR amahlanu angahambisani ezindaweni ezahlukene kanye nezinto eziphrintiwe',
          caption: 'Indawo yokuqala ephithizelayo: amakhodi e-QR amahlanu angaxhunyiwe ancintisana ngokunaka futhi abangela ukudideka kwamakhasimende',
        },
      ],
    },
    {
      heading: 'Ukubeka Eqhulwini Ulwazi Lokukhokha',
      paragraphs: ['Indlela yokukhokha eyinhloko yesitolo isebenzise indinganiso yesifunda eyayidinga ukuthobela ngokuqinile umthwalo wokukhokha. Ukuhlola kwembule ukuthi ngisho nesitayela esincane sithinte isivinini sokuskena ngezinhlelo zokusebenza ezithile zasebhange. Isinqumo: ukugcina i-QR yokukhokha ingashintshiwe ngokuphelele ngaphandle kokulungiswa kosayizi kanye nokuphrinta kobungcweti esitokweni sekhadi le-matte.', 'Le ndlela yokugcina izinto isho ukuthi ikhodi yokukhokha ibukeka \'ingenalo uphawu\' olufanele, kodwa amazinga okuqedwa kokuthengiselana athuthuke kakhulu. Ukuqonda: izikhathi zokukhokha akuzona amathuba okufaka uphawu - ziyizikhathi zokuthembeka. Amakhasimende ayazisa isivinini nokuqiniseka ngaphezu kobuhle lapho kuhileleke imali.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Ikhodi ye-QR yokukhokha ehlanzekile, enkulu esitokisini sekhadi le-matte lochwepheshe, elibekwe ngokugqamile kurejista',
          caption: 'I-QR yokukhokha: ubukhulu bayo bube bukhulu kakhulu, iphrintiwe ngobungcweti, yenziwe ngendlela ehlelekile ukuze ibonwe ngokushesha yizinhlelo zokusebenza zasebhange',
        },
      ],
    },
    {
      heading: 'Ukudala Isibonisi Sesenzo Sesibili',
      paragraphs: ['Ukuze uthole amathiphu, ukubuyekezwa, ukuxhumana nabantu, kanye nokuqasha, isitolo singaba sobala kakhulu. Lawa makhodi avuselelwe ku-ANQR ngesitayela somkhiqizo esihambisanayo: uphawu lwesitolo oluluhlaza okotshani kukhilimu, isitayela semodyuli eyindilinga, kanye nesembozo esiphakathi esithambile esinesithonjana sesitolo. Ukulungiswa Kwephutha H kuqinisekisile ukuthembeka ngisho nangesitayela.', 'Lawa makhodi amane ahlelwe kuphaneli enophawu ebekwe eceleni (hhayi ukuncintisana) nekhodi yokukhokha. Amalebula acacile ku-typography yesitolo achaze inhloso yekhodi ngayinye. Ukuhlelwa okubonakalayo kwakuhlosiwe: inkokhelo yayimi yodwa futhi ivelele; izenzo zesibili zihlanganiswe ndawonye njengezinketho.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Iphaneli yomkhiqizo ebonisa amakhodi amane e-QR ahlotshisiwe amathiphu, ukubuyekezwa, ezokuxhumana nabantu, kanye nokuqasha, anamalebula acacile',
          caption: 'Iphaneli yesenzo sesibili: uphawu oluhambisanayo, ukulebula okucacile, okubekwe njengezinketho esikhundleni sokuphazamiseka',
        },
      ],
    },
    {
      heading: 'Umklamo Wesistimu Yokubonisa',
      paragraphs: ['Isibonisi esibonakalayo sixazulule izinkinga eziningana ngesikhathi esisodwa. Kokubili isitendi sokukhokha kanye nephaneli yesibili kusebenzise izinto ezi-matte ukususa ukukhanya okuvela ekukhanyeni okuphezulu. Ukuphakama kwalungiselelwa amakhasimende anobukhulu obuhlukahlukene. Ama-engeli aqondiswe emgqeni wamakhasimende kunokuba abe yisicaba ekhawunteni.', 'Ngokubalulekile, isitolo sadala amaphrinta asele avela ezixhumanisini zokucushwa kwe-ANQR ezikhiyiwe. Lapho ikhodi yamathiphu ekugcineni ichithelwa ikhofi, abasebenzi bayishintsha ngemizuzu embalwa besebenzisa ukucushwa okugciniwe - akukho zithombe-skrini, akukho ukuqagela kuzilungiselelo, akukho ukwehla kwekhwalithi.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Umdwebo obonisa ukwakheka kwesibonisi esibonakalayo: ukuphakama, ama-engeli, izinto zokwakha, kanye nobudlelwano phakathi kokukhokha kanye nezibonisi zesibili',
          caption: 'Uhlaka lwesistimu yokubonisa: i-ergonomics engokwenyama elungiselelwe ukuskena okuthembekile kuzo zonke izikhundla zamakhasimende kanye nezimo zokukhanya',
        },
      ],
    },
    {
      heading: 'Ukuthuthukiswa Kokusebenza',
      paragraphs: ['Emasontweni ayisithupha ngemuva kokufakwa, isitolo sabhala ngentuthuko ebalulekile: akukho zikhalazo zamakhasimende mayelana nokudideka \'kwekhodi engalungile\', izikhathi zokuthengiselana ezisheshayo, kanye nokwanda okuphindwe kathathu kokuthunyelwa kwamathiphu (amakhasimende manje ayesengathola futhi askena ikhodi yethiphu ngaphandle kokubuza abasebenzi ngokunganaki). Ukubuyekezwa kwe-Google nakho kwanda njengoba i-QR ezinikele, enelebula elihle isusa ukungezwani.', 'Ukuqeqeshwa kwabasebenzi kwaba lula: \'ikhodi yokukhokha yiyona enkulu, konke okunye kusephaneli.\' Lapho izinhlelo zokusebenza zokukhokha zibuyekezwa futhi enye ikhombisa ukuskena okuhamba kancane, ukwakheka kwekhodi yokukhokha elondolozayo kwakusho ukuthi isasebenza - ihamba kancane kunokuba yehluleke ngokuphelele.', 'Bheka umhlahlandlela Wokufunda kumakhodi e-QR ukuze uthole izinkokhelo zokuthengisa ngezimiso ezingemuva kwalolu hlelo lokubonisa.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Ideshibhodi yezilinganiso ekhombisa ukuqhathanisa ngaphambi/ngemuva: izehlakalo zokudideka, isikhathi sokuthengiselana, imvamisa yethiphu, ukuthunyelwa kokubuyekezwa',
          caption: 'Amasonto ayisithupha edatha yokusebenza ekhombisa umthelela webhizinisi wohlelo lokubonisa olune-QR eningi olucatshangelwe kahle',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Dlulisa amehlo Funda izihloko',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Isifundo Secala: Kusukela Ekhadini Lebhizinisi Kuya Kubhodi Lokukhangisa',
      paragraphs: ['Lesi sibonelo silandela inkampani yokukhiqiza umcimbi elungiselela ingqungquthela enkulu. Babedinga ikhodi efanayo ye-QR - exhumanisa nohlelo lokusebenza lomcimbi - esetshenziswe kumafomethi ahlukene kakhulu: ukufakwa kwamabheji ababekhona (3cm), amakhadi etende letafula (8cm), izimpawu zedeski lokubhalisa (30cm), amaphosta okuthola indlela (60cm), kanye nebhena elikhulu lesizinda sesiteji (4 metres). Ifomethi ngayinye yayinamabanga okubuka ahlukene, izimo zokukhanya, kanye nemisebenzi yokukhiqiza.', 'Inselele yayingeyona nje eyobuchwepheshe - yayisebenza. Abathengisi abaningi babephethe imisebenzi ehlukene yokuphrinta, futhi inkampani kwakudingeka iqinisekise imiphumela ehambisanayo, eskenwayo kungakhathaliseki ukuthi ubani okhiqize ini. Isixazululo sabo sasigxile ekuthunyelweni kwe-SVG kanye nemibhalo eqinile yokudlulisa.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'I-collage ebonisa ikhodi efanayo ye-QR esetshenziswe ngobukhulu obuhlanu obuhlukene, kusukela kubheji kuya kubhena',
          caption: 'Ikhodi eyodwa ye-QR, osayizi abahlanu bokuthunyelwa: inselele yokugcina ukuskenwa kusuka kumasentimitha kuya kumamitha',
        },
      ],
    },
    {
      heading: 'Kungani Imicimbi Yangaphambilini Yayinezinkinga',
      paragraphs: ['Engqungqutheleni yabo yokugcina, inkampani yayibhekane nokwehluleka okuhlazisayo. Ibhena lesiteji i-QR lakhiqizwa njenge-PNG encane futhi lakhuliswa kusofthiwe yokuklama - umphumela wawubukeka wamukelekile kude kodwa wehluleka ukuskena ngokuthembekile kusuka ezilalelini. Ama-QR ebheji ayenesitayela esidlulele futhi emancane kakhulu, ekhungathekisa ababekhona bezama ukwengeza oxhumana nabo. Izilungiselelo ezingahambisani kuzo zonke izinhlobo zasho ukuthi i-QR \'efanayo\' empeleni yayibukeka ihlukile engxenyeni ngayinye.', 'Ukuhlaziywa kwangemva komcimbi kwembule imbangela eyinhloko: akukho mthombo owodwa weqiniso. Umklami ngamunye wayedale kabusha i-QR ngezilungiselelo ezihlukile kancane, futhi umthengisi ngamunye wokuphrinta wayecubungule amafayela ngendlela ehlukile. Ikhwalithi yonakele ngomdlalo wocingo wokudluliselwa kwamafayela.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Izithombe eziseduze ezibonisa ukwehluleka kokuskena: amamojula ebhena afakwe amaphikseli, amakhodi ebheji angalingani, isitayela esingaguquki kuwo wonke amafomethi',
          caption: 'Ukuhlaziywa kwe-Forensic kokwehluleka kwemicimbi yangaphambilini: ifomethi ngayinye yayilethe izinkinga zekhwalithi ezahlukene',
        },
      ],
    },
    {
      heading: 'Ukuhamba Komsebenzi Kwe-SVG-Okokuqala',
      paragraphs: ['Kulo mcimbi, inkampani yasungula inqubo eqinile: i-master QR eyodwa eyenziwe ku-ANQR enezilungiselelo ezifanele (Ukulungiswa Kwephutha H, indawo ethule kakhulu, isitayela esihlanzekile), ithunyelwe njenge-SVG, futhi igcinwe njengomthombo owodwa onegunya. Isixhumanisi sokucushwa kwe-ANQR sibhalwe phansi eceleni kwefayela le-SVG ukuze ikhodi ikwazi ukuvuselelwa uma kudingeka.', 'Wonke umklami nomthengisi bathole i-master efanayo ye-SVG enemiyalelo ecacile: beka ngobukhulu obudingekayo, ungashintshi, gcina indawo ethule. Kubathengisi abadinga amafomethi e-raster, inkampani inikeze ama-PNG aboniswe ngaphambilini ngobukhulu obuthile ngemigomo ecacile yamagama ekhombisa ukusetshenziswa okuhlosiwe.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Iphakheji yefayela ebonisa i-SVG master, ama-PNG aqondene nosayizi, idokhumenti yokucacisa, kanye nesixhumanisi sokucushwa',
          caption: 'Iphakheji yokudlulisa: konke abathengisi abakudingayo ukuze bakhiqize imiphumela ehambisanayo ngaphandle kokuqagela',
        },
      ],
    },
    {
      heading: 'Okucatshangelwayo Ngokuqondene Nosayizi',
      paragraphs: ['Ifomethi ngayinye yayidinga ukunakwa okukhethekile. Ukufakwa kwamabheji ku-3cm kwakudinga i-QR ukuze ithathe isikhala esiphezulu esitholakalayo - ibanga lokuskena lalizoba ubude bengalo. Amatende etafula ku-8cm angafaka uhlaka lokuhlobisa ngaphandle kwendawo ethule. Ibhena elingamamitha angu-4 lalidinga ukubalwa: kusukela ebangeni elijwayelekile lezilaleli (amamitha angu-15-20), amamojula kwakudingeka ahlukaniswe ngokucacile ngamakhamera ocingo, okusho ukuthi i-QR kwakudingeka okungenani ibe ngu-80cm ngaphakathi komklamo webhena.', 'Inkampani yakha umhlahlandlela wosayizi oqopha ubukhulu be-QR obuncane bebanga ngalinye lokuskena elilindelekile. Lokhu kwaba yimpahla engasetshenziswa kabusha yemicimbi yesikhathi esizayo, isusa ukuqagela enkambisweni yokuklama.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Ishadi elibonisa ubudlelwano phakathi kwebanga lokuskena, usayizi we-QR omncane, kanye nobukhulu bemojuli yefomethi ngayinye yomcimbi',
          caption: 'I-matrix yosayizi: ubukhulu obubaliwe obuqinisekisa ukuskena okuthembekile ebangeni lokubuka elilindelekile lefomethi ngayinye',
        },
      ],
    },
    {
      heading: 'Imiphumela Yokukhiqiza',
      paragraphs: ['Ukuqinisekiswa kosuku lomhlangano kwakuhlelekile: abasebenzi bahlole yonke i-QR esetshenzisiwe ngaphambi kokuba iminyango ivuleke. Amabheji afakwa ngokushesha ngobude bengalo. Amatende etafula asebenza ngokuthembekile ekukhanyeni okuguquguqukayo kwamakamelo okuphuma. Ibhena lesiteji - ihlazo lomcimbi wangaphambilini - liskenwe ngempumelelo lisuka phakathi nendawo yezilaleli.', 'Izikhalazo zokuskena ezingenalutho zafakwa kubantu abangaphezu kuka-2,000. Ukunqoba kokusebenza kwakubaluleke ngokulinganayo: lapho ukwengezwa komxhasi ngomzuzu wokugcina kudinga izimpawu ezintsha, ithimba lokukhiqiza lakukhiqiza kusuka ku-master SVG ngemizuzu, liqiniseka ukuthi lizofanelana nakho konke okunye.', 'Bheka umhlahlandlela Wokufunda kumakhodi e-QR alungele ukuphrinta wohlaka lwesinqumo se-SVG vs PNG kanye nemikhuba emihle yokudlulisa.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Izithombe zomcimbi ezibonisa ababekhona beskena amakhodi e-QR ngempumelelo ngobukhulu obuhlukahlukene kanye namabanga kulo lonke indawo',
          caption: 'Impumelelo yosuku lwengqungquthela: ukuskena okuthembekile kuyo yonke ifomethi, kusukela kumabheji aseduze kuya ezithombeni zebanga lebhanela lesiteji',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Dlulisa amehlo Funda izihloko',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Isifundo Secala: Isibonisi Sedijithali Se-Airport Lounge',
      paragraphs: ['Lesi sibonelo silandela i-lounge yendiza ebilokhu isebenzisa amakhodi e-QR angaguquki kuzikrini zayo zokwamukela zedijithali. Izikrini zibonise okuqukethwe okukhushulwayo okukhushulwayo, kodwa ikhodi ye-QR yokubhalisa i-lounge yayihleli ekhoneni, ingaguquki futhi inganakwa kalula. I-Analytics ibonise ukuthi yi-15% kuphela yezivakashi ezifanelekile ezisebenzise ukuhlolwa kwe-QR naphezu kokuthi ishesha kakhulu kunomugqa wedeski. Izivakashi eziningi azizange ziyiqaphele.', 'Umbono wawulula: endaweni ematasa ebonakalayo enokuqukethwe okuhambayo, i-QR engaguquki ayibonakali. Isixazululo sasidingeka ukwenza i-QR ibonakale ngaphandle kokubeka engcupheni ukuthembeka okudingekayo ekungeneni kokungena lapho ukwehluleka kungasho abahambi abakhungathekile kanye nemigqa emide yedeski.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Isibonisi sedijithali esikhumulweni sezindiza esibonisa okuqukethwe kokukhushulwa okunekhodi encane ye-QR engaguquki ekhoneni',
          caption: 'Ukusetha kokuqala: i-QR engaguquki elahlekile olwandle lokuqukethwe kokukhushulwa okuguquguqukayo, okufinyelela ukwamukelwa okungu-15% kuphela',
        },
      ],
    },
    {
      heading: 'Ukuklama i-Animation Ephephile',
      paragraphs: ['Izimpawu zedijithali ze-lounge zisebenzise amaphaneli amakhulu e-LED - indawo eyinselele lapho i-animation enolaka ingadala izinkinga zokuskena. Ithimba lokuklama laqala ngokuqapha: umphumela wokushaya kwenhliziyo omnene owandisa kancane futhi wanciphisa ukuba khona kokubona kwe-QR ngaphandle kokushintsha isakhiwo sekhodi yangempela. Isikhathi sohlaka sibekwe kancane (250ms) ukugwema noma yiziphi izinkinga ezikhanyayo ngesilinganiso sokuvuselela se-LED.', 'Ukuqinisekiswa kweModi Yokuphepha kuqinisekisile ukuthi wonke amaphaneli e-LED angempela ahlala eskenwa. Ukuhlolwa okwengeziwe kumaphaneli e-LED angempela kwembule ukuthi ukushaya kwenhliziyo kwakudingeka kube mnene kakhulu kunokubuka kuqala kwedeskithophu okuphakanyisiwe - ukukhanya kwe-LED nama-engeli okubuka kuthinte ukuhluka okubonwayo ngaphezu kokulindelekile.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Iphaneli yezilungiselelo ze-animation ye-ANQR ekhombisa ukucushwa kwe-pulse: isikhathi esihamba kancane, ukuqina okucashile, imodi yokuphepha ivuliwe',
          caption: 'Ukucushwa kwe-animation: amapharamitha alungiselelwe ukubonisa kwephaneli ye-LED ngenkathi kugcinwa ukuthembeka kokuskena kufreyimu ngayinye',
        },
      ],
    },
    {
      heading: 'Ukuhlanganiswa Nokuqukethwe Kwezimpawu',
      paragraphs: ['I-QR e-animated yayibekwe \'endaweni ezinzile\' enikezelwe ekuhleleni kwesikrini - indawo ehlala ingaguquguquki ngenkathi okuqukethwe kokukhushulwa kuzungeza endaweni yokubonisa eyinhloko. Lokhu kuhlukaniswa kwakubalulekile: i-QR yayidinga ukuzinza okubonakalayo ukuze iskenwe ngisho noma idonsela ukunaka ngokusebenzisa ukukhushulwa kwayo okucashile.', 'Kwanezelwa ukubizelwa esenzweni okucacile eduze kwe-QR: \'Yeqa umugqa - skena ukuze ungene.\' Umbhalo wahlala ungaguquki ngenkathi i-QR ishaya, yakha uhlu olubonakalayo oludonsela iso ethubeni lokuskena ngaphandle kokucindezela okuqukethwe kokukhushulwa.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Umdwebo wokwakheka kwesikrini obonisa i-QR egqwayizayo endaweni ezinzile kuyilapho okuqukethwe okukhushulwayo kuzungeza endaweni eyinhloko',
          caption: 'Ukwabiwa kwezindlu kwesikrini: i-QR egqwayizayo ithatha indawo ezinzile ehlukile kokuqukethwe okukhushulwayo okuzungezayo',
        },
      ],
    },
    {
      heading: 'Ukusetshenziswa Kobuchwepheshe',
      paragraphs: ['I-QR egqwayizayo ithunyelwe njenge-GIF enezilungiselelo ezilungiselelwe ze-CMS yezimpawu. Ukucatshangelwa kosayizi wefayela kwakubalulekile - uhlelo lokuphatha okuqukethwe lwe-lounge lwalunemikhawulo yokulayisha, futhi amafayela amakhulu kakhulu abangela ukudlala okungathinti. Ukuthunyelwa kokugcina kulinganisela ikhwalithi yokubuka ngokumelene nosayizi wefayela ngokunciphisa iphalethi yombala kanye nokwenza ngcono inani lozimele.', 'Ukuthunyelwa kwakuhlanganisa ukubuyela emuva: uma i-GIF yehluleka ukudlala nganoma yisiphi isizathu, uhlelo lwezimpawu lwaluzobonisa isipele se-PNG esingaguquki. Lokhu kuphindaphinda kwaqinisekisa ukuthi ikhono lokungena alilahleki ngenxa yezinkinga zobuchwepheshe nge-animation.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Isixhumi esibonakalayo se-CMS esibonisa ukulayishwa kwe-QR egqwayizayo enesithombe esingaguquki esilungisiwe',
          caption: 'Ukulungiselelwa kwe-CMS yesignali: i-animated primary ene-static fallback eqinisekisa ukuthi ikhono lokungena aliphazanyiswa',
        },
      ],
    },
    {
      heading: 'Umthelela Olinganisiwe',
      paragraphs: ['Ngemuva kwenyanga eyodwa yokusebenza, ukwamukelwa kokungena kwe-QR kukhuphuke kusuka ku-15% kuya ku-24% - ukuthuthuka okuhlobene okungu-60%. Ucwaningo lwempendulo yezivakashi lubonise ukuthi i-QR egqwayizayo \'kwakulula ukuyibona\' futhi \'yayizwakala iyisimanje.\' Izikhathi zomugqa wedeski zehle ngokulinganiswa ngezikhathi ezimatasa njengoba izivakashi eziningi zazizikhonza nge-QR.', 'Okubalulekile, akubanga khona ukwehluleka kokuskena okubikiwe naphezu kwezinkulungwane zokuskena kwansuku zonke. Indlela ye-animation elondolozayo yayifinyelele umgomo wokunaka ngaphandle kokudela ukuthembeka okwakudingwa ukugeleza kokungena. I-lounge yabe isikhipha ama-QR agqwayizayo afanayo nakwezinye izindawo zayo.', 'Bheka umhlahlandlela Wokufunda kumakhodi e-QR agqwayizayo ukuze uthole izimpawu zedijithali zezimiso zobuchwepheshe ngemuva komklamo wezithombe eziphephile.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Ideshibhodi ekhombisa ukwanda kwezinga lokwamukelwa, ukunciphisa isikhathi somugqa, kanye nokuthembeka kokuskena okwehluleka nhlobo esikhathini sokusetshenziswa',
          caption: 'Inyanga eyodwa yedatha: ukwanda kokwamukelwa okungu-60%, izikhathi zomugqa ezincishisiwe, kanye nokugcina ukuthembeka kokuskena okuphelele',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Dlulisa amehlo Funda izihloko',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Isifundo Secala: Umkhankaso We-QR Wokwethulwa Komkhiqizo Womhlaba Wonke',
      paragraphs: ['Lesi sibonelo silandela inkampani ye-elekthronikhi yabathengi ethula umkhiqizo omusha ngesikhathi esisodwa ezimakethe ezingu-12 ngezilimi ezingu-8. Ithimba ngalinye lokumaketha lesifunda kwakudingeka likhiqize ukupakisha, ukubonisa okuthengiswayo, kanye nezinto zokuphromotha eziqukethe amakhodi e-QR axhumanisa namakhasi omkhiqizo wendawo. Ukuqaliswa kwangaphambilini kwakuholele ekuhleleni kwe-QR okungaguquki, ukwehluleka kokuskena ngezikhathi ezithile, kanye \'nomdlalo wocingo\' wokushintshashintsha kokucushwa njengoba ithimba ngalinye lidala amakhodi kusuka kuzithombe-skrini.', 'Isixazululo sisebenzise izixhumanisi zokucushwa ezingabiwa ze-ANQR ukuze kusungulwe umthombo owodwa weqiniso wonke amaqembu esifunda angawufinyelela, kungakhathaliseki ulimi lwabo lwesixhumi. Umthwalo we-QR usebenzise ukuqondisa kabusha okuhlakaniphile okuthole ulimi lomsebenzisi, ngakho ikhodi eyodwa yasebenza emhlabeni jikelele ngenkathi iletha okuhlangenwe nakho kwendawo.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Imephu yomhlaba ekhombisa izindawo zemakethe eziyi-12 ezinamakhodi e-QR, amanye angavumelani ngokubonakalayo',
          caption: 'Inselele: izimakethe eziyi-12, izilimi eziyi-8, kanye nomlando wokusetshenziswa kwe-QR okungavumelani kuzo zonke izifunda',
        },
      ],
    },
    {
      heading: 'Ukusungula Ukucushwa Okuyinhloko',
      paragraphs: ['Ithimba lomkhiqizo womhlaba wonke lidale ukucushwa kwe-QR okugunyaziwe ku-ANQR: imibala yomkhiqizo ehambisana nobunikazi bomugqa womkhiqizo obubonakalayo, Ukulungiswa Kwephutha H kokuthembeka kuzo zonke izinhlelo zokusebenza zokuphrinta nezedijithali, kanye nesitayela esizophinda sikhiqize njalo kungakhathaliseki izindlela zokukhiqiza zendawo. Ukucushwa kwakuvaliwe futhi isixhumanisi sokwabelana sibhalwe phansi ku-global campaign brief.', 'Ngokubalulekile, i-URL ebhalwe ikhodi isebenzise isevisi yokuqondisa kabusha yokuthola ulimi. Lapho iskenwa, abasebenzisi bathunyelwa ngokuzenzakalelayo ekhasini labo lomkhiqizo wolimi lwendawo. Lokhu kusho ukuthi zonke izimakethe ezingu-12 zingasebenzisa amakhodi e-QR afanayo - akukho ukuhlukahluka komthwalo wemakethe ngamunye okungaletha amaphutha.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Isixhumi esibonakalayo se-ANQR esibonisa ukucushwa okuyinhloko ngemibala yomkhiqizo, i-ECC H, kanye ne-URL yokuqondisa kabusha ehlakaniphile',
          caption: 'Ukucushwa okuyinhloko: amazinga omkhiqizo womhlaba wonke afakwe emthonjeni owodwa weqiniso, ongabiwa',
        },
      ],
    },
    {
      heading: 'Ukuhamba Komsebenzi Wethimba Lesifunda',
      paragraphs: ['Ithimba ngalinye lokumaketha lesifunda lithole isixhumanisi sokucushwa ngemiyalelo elula: vula isixhumanisi, qinisekisa ukuthi ukubuka kuqala kufana neziqondiso zomkhiqizo, thumela ngefomethi edingekayo yohlelo lwakho lokusebenza. Isixhumi esibonakalayo se-ANQR esiboniswe ngolimi olukhethwa yiqembu ngalinye, kodwa izilungiselelo ze-QR eziyisisekelo zahlala zifana kungakhathaliseki ulimi lwesixhumi esibonakalayo.', 'Lapho ithimba laseJapan lidinga i-SVG yezibonisi zokuthengisa eziphezulu kanye nethimba laseBrazil lidinga i-PNG yezokuxhumana, zombili zithunyelwe kusuka ekucushweni okufanayo. Lapho umthengisi wokuphrinta weqembu laseJalimane ecela amanani athile ombala, angabhekisela ekucushweni ngqo kunokuqagela kusuka esithombeni-skrini.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Izithombe-skrini ezibonisa isixhumanisi esifanayo sokucushwa zivuliwe ngezixhumi zesiJapane, isiPutukezi, nesiJalimane',
          caption: 'Ukucushwa okufanayo, izixhumi ezihlukene: amaqembu esifunda asebenza ngolimi aluthandayo ngenkathi egcina ukuvumelana komhlaba wonke',
        },
      ],
    },
    {
      heading: 'Ukuphatha Ukwehluka Kwesifunda',
      paragraphs: ['Ezinye izimakethe zazidinga ukulungiswa okuncane. Ithimba laseShayina lalidinga inguqulo enohlaka olulungiselelwe i-WeChat lokwabelana ngomphakathi. Esikhundleni sokushintsha i-master, badale uhlobo olubhaliwe olunesixhumanisi salo sokucushwa, olubhalwe ngokucacile ngokuthi \'uhlobo lwe-CN-WeChat\' kulabhulali yempahla yomkhankaso. Lokhu kwagcina ukulandeleka ngenkathi kuvumela ukwenziwa kwendawo okudingekayo.', 'Ithimba lomkhiqizo lasungula umthetho olula: noma yikuphi ukuhlukahluka okuvela ku-master kwakudinga isixhumanisi esisha sokucushwa esibhalwe phansi. Akukho ukuguqulwa kwamafayela athunyelwe kwamanye amazwe, akukho \'ukulungiswa okusheshayo\' kusofthiwe yokuklama. Lokhu kwavimbela ukuzulazula kokucushwa okwakuhluphe ukuqaliswa kwangaphambilini.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Isixhumi esibonakalayo somtapo wolwazi wempahla esibonisa ukucushwa okuyinhloko kanye nokuhlukahluka kwesifunda okuvunyiwe, ngayinye inesixhumanisi sayo',
          caption: 'Ukuphathwa kwempahla yomkhankaso: ukucushwa okuyinhloko kanye nokuhlukahluka okubhaliwe, konke kulandelelwa ngezixhumanisi zokucushwa',
        },
      ],
    },
    {
      heading: 'Imiphumela Yokuqalisa',
      paragraphs: ['Usuku lokwethulwa komkhiqizo lubone amakhodi e-QR esetshenziswa kuzo zonke iziphakeji, izibonisi zokuthengisa, izinto zomcimbi, kanye nemikhankaso yedijithali kuzo zonke izimakethe eziyi-12 ngesikhathi esisodwa. Ukuhlolwa kwekhwalithi kuqinisekisile ukuvumelana okubonakalayo kuzo zonke izifunda - izibonisi zokuthengisa ze-QR eTokyo zifane nephakheji ye-QR eSão Paulo zifane nebhanela lomcimbi we-QR eBerlin.', 'Akuzange kubikwe ukwehluleka kokuskena kuzo zonke izimakethe. Lapho kudingeka ushintsho lwe-URL yekhasi lomkhiqizo ngemuva kokwethulwa, insizakalo yokuqondisa kabusha yayisingathe ngokungabonakali - akukho ukuphrinta kabusha okudingekayo. Ithimba lomhlaba wonke lilinganisele ukuthi indlela yokuxhumanisa ukucushwa isindise amahora angaphezu kwangu-40 esikhathi sokuxhumanisa uma kuqhathaniswa nendlela yabo yokuqalisa yangaphambilini.', 'Bheka umhlahlandlela Wokufunda ngokubambisana kwe-QR ngezilimi ezahlukene ukuze uthole izimiso zomsebenzi ngemuva kokuvumelana komkhankaso womhlaba wonke.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Igridi yezithombe ezibonisa ukuthunyelwa kwe-QR okuqhubekayo ezimakethe ezahlukene: izitolo zaseTokyo, ukupakisha eSão Paulo, imicimbi yaseBerlin',
          caption: 'Ukuvumelana komhlaba wonke kufinyelelwe: isethulo se-QR esifanayo ezimakethe eziyi-12 naphezu kwezilimi ezahlukene, abathengisi, kanye namafomethi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Dlulisa amehlo Funda izihloko',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Dlulisa amehlo Funda izihloko', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Vula Umhlahlandlela Womsebenzisi Ogcwele', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Vula igalari', type: 'gallery' },
  ],
};
