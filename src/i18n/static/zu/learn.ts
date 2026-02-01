import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Funda nge-ANQR',
  description: 'Imihlahlandlela esebenzayo, yokuqala yebhizinisi yokuguqula amakhodi e-QR abe izimpahla zokuthengisa zangempela - hhayi nje izikwele ezisebenzayo. Funda indlela yokuthuthukisa amakhodi ezindawo zokuthengisa zefa, dala izimpawu ze-QR zokukhokha ezivumelanayo, ulungiselele ukuthunyelwa okulungele ukuphrinta, sebenzisa ukugqwayiza ngokuphephile kuzibonisi zedijithali, futhi wabelane ngokulungiselelwa okukhiyiwe kuwo wonke amaqembu ezilimi eziningi usebenzisa izixhumanisi ze-ANQR ("ihange").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Vula ijenereyitha', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Vula Umhlahlandlela Womsebenzisi Ogcwele', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Ukuthuthukisa Imikhankaso Ye-QR Ekhona',
      paragraphs: ['Amabhizinisi amaningi anamakhodi e-QR asakazeke emisebenzini yawo - kumamenyu, kuma-counter stand, ekupakisheni, nasezintweni zokukhangisa. Amaningi ala makhodi adalwe eminyakeni edlule ngama-generator ayisisekelo, okuholela ezikweleni ezijwayelekile ezimnyama nezimhlophe ezihluleka ukukhuthaza ukuzethemba noma ukufanisa ubunikazi bomkhiqizo wakho. Lo mhlahlandlela ophelele ukuqondisa ngendlela ehlelekile yokuhlola, ukuthuthukisa, kanye nokwenza ngcono ingqalasizinda yakho ye-QR ekhona ngaphandle kokuphazamisa uhambo lwamakhasimende osuvele ulusungulile.', 'Inzuzo yamasu okuthuthukisa esikhundleni sokushintsha amakhodi akho e-QR itholakala ekugcineni ukuqhubeka. Amakhasimende akho asevele afunde ukulindela izindawo ezithile lapho eskena amakhodi akho. Ngokugcina ama-URL afakwe ikhodi afana ngenkathi ethuthukisa kakhulu isethulo esibonakalayo, ukuthembeka kokuskena, kanye nokuqondaniswa komkhiqizo, udala ushintsho olungenamthungo oluthuthukisa ukwethenjwa ngaphandle kokudinga noma yiziphi izinguquko engqalasizinda yakho yedijithali noma ekulandeleni ukuhlaziya.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Ukuqhathanisa okuseceleni okubonisa ikhodi ye-QR ejwayelekile, efiphele eduze kwenguqulo yesimanje enophawu olufaka ikhodi ye-URL efanayo',
          caption: 'Ngaphambi nangemva kwalokho: I-URL yendawo efanayo eguqulwe kusukela kukhodi ejwayelekile ephelelwe yisikhathi yaba yimpahla enophawu lochwepheshe',
        },
      ],
    },
    {
      heading: 'Kungani Amakhodi E-QR Eyifa Engasebenzi Kahle',
      paragraphs: ['Amakhodi e-QR adalwe ngesikhathi sokuqala kokwamukelwa - ikakhulukazi phakathi kuka-2020-2021 lapho amabhizinisi eshesha ukusebenzisa izixazululo ezingenakuthintana - avame ukubhekana nezinkinga eziningana ezibalulekile. Izilungiselelo zokulungisa amaphutha aphansi ziwenza abe buthaka uma ephrintwa ezindaweni ezithambile noma ebukwa ngaphansi kokukhanya okunzima. Izindawo ezithule ezinganele zibangela ukwehluleka kokuskena lapho amakhodi ebekwa eduze kwezinye izinto ezibonakalayo. Isitayela esijwayelekile asikwazi ukuveza ubuqiniso bomkhiqizo, okuholela ekungabazeni kanye namazinga okuskena ancishisiwe.', 'Ngaphandle kwemikhawulo yobuchwepheshe, amakhodi endabuko avame ukumelela amathuba okuthengisa uphawu aphuthelwe. Yonke ikhodi ye-QR iyindawo yokuxhumana nekhasimende lakho - isikhathi lapho lihlanganyela khona ngenkuthalo futhi lizimisele ukuthatha isinyathelo. Ikhodi ebhalwe ngobungcweti ehambisana nemibala yomkhiqizo wakho, ifaka phakathi imingcele efanele yokuphepha, futhi inezici zomkhiqizo ozikhethela zona ziguqula lo mkhiqizo ube yimpahla yokumaketha eqinisa ubuwena bakho kukho konke ukuxhumana.'],
    },
    {
      heading: 'Ukwenza Ukuhlolwa Kwekhodi Ye-QR',
      paragraphs: ['Qala iphrojekthi yakho yokuthuthukisa ngokudala uhlu oluphelele lwawo wonke amakhodi e-QR asetshenziswa njengamanje ebhizinisini lakho. Bhala phansi indawo yangempela, indawo ebhalwe ikhodi, isimo samanje sezinto eziphrintiwe, kanye nendawo evamile yokuskena kufaka phakathi izimo zokukhanya nama-engeli okubuka. Hlola ikhodi ngayinye ngamadivayisi amaningi - ama-smartphone amadala namadivayisi ashibhile avame ukwembula izinkinga zokuthembeka ezifihlwa amafoni aphezulu.', 'Naka kakhulu amakhodi ezindaweni ezibaluleke kakhulu: izindawo zokukhokha, izindawo zokungena, kanye nezibonisi zokuphromotha lapho ukwehluleka kokuskena kuthinta ngqo imali engenayo noma ulwazi lwamakhasimende. Lokhu kufanele kubekwe phambili ukuze kuthuthukiswe ngokushesha. Qaphela futhi amakhodi avela ezithombeni noma kokuqukethwe kwevidiyo, njengoba lokhu kuzodinga ukubambisana nethimba lakho lokumaketha ukuze ubuyekeze izimpahla ezibonakalayo.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Isixhumi sokuhlola esibonisa izigaba zokuhlola ze-QR: indawo, isimo, ukuthembeka kokuskena, kanye nesilinganiso sokubaluleka',
          caption: 'Ithempulethi lokuhlola le-QR elihlelekile lokubhala phansi nokubeka phambili abantu obazothuthukisa',
        },
      ],
    },
    {
      heading: 'Isu Lokuthuthukisa Okuphephile',
      paragraphs: ['Umthetho oyinhloko wokuthuthukiswa kwe-QR ukulondolozwa kwendawo oya kuyo. Khipha i-URL eqondile kukhodi ngayinye ekhona bese uyifaka ikhodi ngendlela efanayo enguqulweni yakho entsha. Lokhu kuqinisekisa ukuthi zonke izibalo ezikhona, ukuqonda okuqondisiwe kabusha, kanye nokulindelwe ngamakhasimende kuhlala kuphelele. Uma udinga ukuguquguquka kwendawo oya kuyo ukuze uthole izibuyekezo zesikhathi esizayo, lesi yisikhathi esifanele sokwethula i-URL emfushane enophawu noma isevisi yokuqondisa kabusha - kodwa sebenzisa lokhu njengephrojekthi ehlukile ukuze ugweme izinguquko eziyinkimbinkimbi.', 'Ukuze uthole ukuthuthukiswa okubonakalayo, sebenzisa ukuthuthukiswa kwezendlalelo: okokuqala qinisekisa ukuthembeka kobuchwepheshe (ukulungiswa kwamaphutha okufanele kanye nendawo ethule), bese ufaka isitayela somkhiqizo (imibala, ukuma kwemojuli), bese ekugcineni ucabangele ukuthuthukiswa okukhethwa kukho (ukumbozwa okuphakathi, ozimele). Isendlalelo ngasinye kufanele siqinisekiswe ngokuhlola ngaphambi kokuqhubeka. Imodi Yokuphepha ye-ANQR isiza ukuphoqelela lezi zinto ezibalulekile ngokuxwayisa lapho ukukhetha isitayela kungase kube sengozini yokuskena.'],
    },
    {
      heading: 'Ukwengeza Ubuwena Bomkhiqizo Ngaphandle Kokwehlisa Ukuthembeka',
      paragraphs: ['Ukufakwa komkhiqizo we-QR okusebenzayo kulinganisela umthelela obonakalayo ngokumelene nokuthembeka kokuskena. Qala ngombala: shintsha umbala omnyama ozenzakalelayo ongaphambili ngombala wakho oyinhloko womkhiqizo, uqinisekise ukungafani okwanele ngokumelene nesizinda sakho. Kumabhrendi amaningi, imibala emnyama ezizindeni ezikhanyayo isebenza kahle kakhulu. Gwema ukuhlanganiswa kokungafani okuphansi, ama-gradients anciphisa ukucaca komphetho, noma imibala ebonakala ifana ngaphansi kwezimo zokukhanya ezivamile.', 'Ukwenziwa ngokwezifiso kwesimo semojuli kunikeza elinye ithuba lokufaka uphawu ngomthelela omncane wokuthembeka. Amamojula ayindilinga adala ukubukeka okuthambile, okufinyeleleka kalula ngenkathi egcina ukuskena okuhle kakhulu. Amamojula wesitayela samachashazi asebenza kahle kumabhrendi anamuhla, ahamba phambili kwezobuchwepheshe. Amamojula axhunyiwe afanelana nobunikazi bezimboni noma bezinkampani. Noma ngabe yisiphi isitayela osikhethayo, gcina ukuhambisana kuzo zonke izinhlelo zakho ze-QR ukuze kuqashelwe ngokushesha uphawu.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Umdwebo wesondo lombala obonisa ukuhlanganiswa kombala we-QR okuhle kakhulu ngezinkomba zesilinganiso sokungafani',
          caption: 'Umhlahlandlela wokukhetha umbala womkhiqizo obonisa ukuhlanganiswa kokungafani okuphezulu okugcina ukuthembeka kokuskena',
        },
      ],
    },
    {
      heading: 'Iphrothokholi Yokuhlola Nokuqinisekisa',
      paragraphs: ['Ungalokothi usebenzise amakhodi e-QR athuthukisiwe ngaphandle kokuhlola okuqinile. Phrinta ubufakazi obuphathekayo ngobukhulu obuqondile kanye nezinto ezifanayo nokusetshenziswa kwakho kokugcina. Hlola endaweni yangempela lapho ikhodi izohlala khona, ngezikhathi ezahlukene zosuku ukuze ubheke ukushintsha kokukhanya. Sebenzisa okungenani amadivayisi amathathu ahlukene: ifoni yamanje eyinhloko, idivayisi ephakathi nendawo, kanye ne-smartphone endala noma engabizi kakhulu.', 'Qopha izikhathi zokuskena kanye namazinga empumelelo okuhlolwa ngakunye. Ikhodi elungiselelwe kahle kufanele iskenwe phakathi kwemizuzwana eyi-1-2 kunoma iyiphi idivayisi yesimanje. Uma ubona ukubambezeleka noma ukwehluleka okuqhubekayo, yehlisa ukuqina kwesitayela - susa noma unciphise ukunqwabelanisa, wandise usayizi wendawo ethule, noma ushintshele ezingeni eliphezulu lokulungisa amaphutha. Ukuthembeka kuhlala kuqala kunobuchwepheshe obubonakalayo.'],
    },
    {
      heading: 'Ukuvala Ukucushwa Kwakho Ukuze Kuvumelane',
      paragraphs: ['Uma usuqinisekisile ukucushwa okuhle kakhulu, kulondoloze usebenzisa izixhumanisi ze-ANQR ezingabiwa. Lokhu kudala irekhodi elihlala njalo lazo zonke izilungiselelo ezisetshenziselwa ukukhiqiza ikhodi yakho evunyiwe - imibala, isitayela semojuli, ukulungiswa kwamaphutha, usayizi, nanoma yiziphi izinqwabelaniso. Yabelana ngalesi sixhumanisi nethimba lakho lokuklama, abathengisi bokuphrinta, nanoma ubani ongase adinge ukuphinda ikhodi esikhathini esizayo.', 'Lokhu kukhiya kokucushwa kuvimbela ukuwohloka kancane kancane okuhlupha ukuthunyelwa okuningi kwe-QR. Ngaphandle kwakho, amalungu abasebenzi aphinda amakhodi avela kuzithombe-skrini, abaklami bakha kabusha izilungiselelo kusukela kwimemori, futhi abathengisi bokuphrinta benza izinguquko \'eziwusizo\'. Uhlobo ngalunye luveza izinkinga ezingaba khona. Ngesixhumanisi sokucushwa esikhiyiwe, konke ukukopisha kufana nokwakho okuvivinyiwe, okuvunyiwe.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Umdwebo obonisa ukuzulazula kokucushwa: izithombe-skrini eziholela ekuphindeni kabusha okuholela ekuguqukeni, ngokumelene nesixhumanisi esisodwa somthombo weqiniso',
          caption: 'Vimbela ukuzulazula kokucushwa ngokusungula umthombo owodwa onegunya wawo wonke amakhophi e-QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Buka izibonelo ze-QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Amakhodi e-QR Okukhokha Okuthengisayo',
      paragraphs: ['Amakhodi e-QR okukhokha asebenza endaweni edinga kakhulu ekuthengiseni: isikhathi sokuthengiselana. Amakhasimende akulungele ukukhokha, ngokuvamile ngomugqa owakheka ngemuva kwawo, futhi umzuzwana ngamunye wokulibaziseka udala ukungqubuzana. Kodwa-ke lesi sikhathi sokucindezeleka okuphezulu siyindawo eyinhloko yokuqinisa umkhiqizo. Lo mhlahlandlela uchaza ukuthi ungawakha kanjani amakhodi e-QR okukhokha askena ngokushesha kuzinhlelo zokusebenza zasebhange ngenkathi esaveza ukubukeka kobungcweti, okunophawu okwakha ukwethenjwa kwamakhasimende.', 'Isimiso esiyisisekelo sokukhokha amakhodi e-QR ukuthembeka ngaphezu kobuhle. Ikhodi eklanywe kahle ehluleka ukuskena kuhlelo lokusebenza lwebhange lekhasimende elilodwa izokubiza kakhulu ekuthengiselaneni okushiywe ngaphandle kanye namakhasimende akhungathekile kunokuba umklamo ogcinayo ungakubiza kakhulu. Qala ngokuhambisana nomthetho, engeza ukuthembeka, bese ubeka uphawu ngokucophelela kuphela lapho kungaphazamisi umsebenzi oyinhloko.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Isibonisi sekhawunta yokuthengisa esibonisa ikhodi ye-QR yokukhokha iskenwa yi-smartphone enohlelo lokusebenza lwebhange',
          caption: 'Amakhodi e-QR yokukhokha kumele asebenze ngokushesha nezinhlelo zokusebenza zebhange nezesikhwama ngaphansi kwezimo zekhawunta zangempela',
        },
      ],
    },
    {
      heading: 'Ukuqonda Izindinganiso ze-QR Yokukhokha',
      paragraphs: ['Amakhodi e-QR yokukhokha ngokuvamile alandela amazinga esifunda alawula ifomethi yokulayisha. ESingapore, i-PayNow QR isebenzisa ukufometha okuthile. ENdiya, amakhodi e-UPI alandela amazinga e-BharatQR noma e-UPI deep link. Izinkokhelo ze-SEPA zaseYurophu zisebenzisa amakhodi e-EPC QR. Izinga ngalinye likhona ukuqinisekisa ukuthi izinhlelo zokusebenza zebhange zingabona futhi zicubungule ulwazi lokukhokha ngokushesha. Ukuphambuka kulezi zindinganiso - ngisho noma kancane - kungabangela izinhlelo zokusebenza zokukhokha ukuthi zenqabe amakhodi afundwa yizikena zekhamera ezijwayelekile ngaphandle kwenkinga.', 'I-ANQR ifaka amathempulethi ezindinganiso ezinkulu zokukhokha ezihlela ngokuzenzakalelayo imininingwane yomthengisi wakho ibe yimithwalo ekhokhelwayo ehambisanayo. Sebenzisa njalo la mathempulethi kunokwakha izintambo zokukhokha ngesandla, njengoba ngisho namaphutha amancane okufometha angabangela ukwehluleka kokuthengiselana. Uma izinga lokukhokha lesifunda sakho lingatholakali njengethempulethi, thintana nemibhalo yobuchwepheshe yomhlinzeki wakho wokukhokha ukuze uthole izidingo eziqondile zokufometha.'],
    },
    {
      heading: 'Usayizi Nokubekwa Kwezibonisi Zekhawuntara',
      paragraphs: ['Amakhodi e-QR abekwe phezulu abhekene nezinselele zomzimba ezihlukile. Amakhasimende askena ngobude bengalo, ngokuvamile nge-engeli, ngezinye izikhathi ngokusebenzisa izivikelo zokuthimula noma izikhwama zokubonisa. Ukukhanya okuphezulu kudala izindawo ezikhanyayo. Ikhodi incintisana nezinye izinto ezididayo zekhawuntara ukuze ibone futhi icace imigqa yokubona. Sabalalisa i-QR yakho yokukhokha kakhulu - okungenani u-4-5cm uyanconywa ezinhlelweni eziningi zekhawuntara, ukwandisa uma ikhodi ihlezi ngemuva kwengilazi noma endaweni ekhanyayo kancane.', 'Isikhundla sibaluleke kakhulu njengosayizi. Beka ikhodi lapho amakhasimende angabamba khona ifoni yawo ngokukhululeka ngaphandle kokuvimba umugqa noma ukufinyelela ngokungafanele. Faka i-engeli yesibonisi kumakhasimende kunokuyibeka phansi. Uma kungenzeka, sebenzisa i-matte lamination noma izinto zokubonisa ezingabonisi ukukhanya ukuze unciphise ukukhanya okuvela ekukhanyeni okuphezulu. Hlola indawo yokugcina ngezikhathi ezahlukene zosuku ukuze ubambe izinkinga zokukhanya.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Umdwebo obonisa ukuphakama nokubekwa kwe-QR okuhle kakhulu kokucushwa okuhlukile kwe-counter',
          caption: 'Umhlahlandlela wokubekwa kwe-counter: ukuphakama, ama-engeli, namabanga amahle kakhulu okuskena inkokhelo okuthembekile',
        },
      ],
    },
    {
      heading: 'Uphawu Olulondolozayo Lwamakhodi Okukhokha',
      paragraphs: ['Izinhlelo zokusebenza zokukhokha azithetheleli kangako kuneziskena zekhamera ezijwayelekile. Izinhlelo zokusebenza eziningi zasebhange zisebenzisa ama-algorithms okufunda i-QR amadala, alula alungiselelwe isivinini kunokuguquguquka. Lokhu kusho ukuthi isitayela esisebenza kahle nekhamera yefoni singase sihluleke ngezinhlelo zokusebenza ezithile zokukhokha. Gcina uphawu lulondoloza: sebenzisa umbala wophawu lwakho ngaphambili uma lugcina umehluko omkhulu, kodwa gwema ama-gradients, ama-overlays asindayo, noma izinto zokuhlobisa ezingaphazamisa ukuqashelwa.', 'Uma ufuna ilogo ephakathi noma i-overlay, yigcine incane kakhulu - kungabi ngaphezu kuka-10-15% wendawo ye-QR - futhi uvivinye kabanzi ngohlelo lokusebenza ngalunye lokukhokha amakhasimende akho angase alusebenzise. Amabhizinisi amaningi akhetha ukungambozwa kwamakhodi okukhokha, egcina leso sitayela sokumaketha amakhodi e-QR lapho izidingo zokuthembeka zingaqinile khona. Umsebenzi wekhodi yokukhokha ukucubungula ukuthengiselana, hhayi ukuhlaba umxhwele ngokubonakalayo.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Ukuqhathanisa okubonisa amazinga okuthengisa amukelekayo vs ayingozi kumakhodi e-QR okukhokha',
          caption: 'Ububanzi bokuthengisa uphawu lwe-QR yokukhokha: kusukela esitayeleni esiphephile esilondolozayo kuya ezindleleni zokuhlobisa eziyingozi',
        },
      ],
    },
    {
      heading: 'Izinto Ezicatshangelwayo Nezokuphrinta',
      paragraphs: ['Izinto ezibonakalayo zokubonisa zithinta kakhulu ukuthembeka kokuskena. I-lamination ekhazimulayo ibonisa izibani eziphezulu ngqo kukhamera yekhasimende. Izinto ezithambile zingaphambukisa imiphetho yemojula. Ukuphrinta okushibhile kungafiphaza imininingwane emincane. Ukuze ukhokhe amakhodi e-QR, tshala imali ekhwalithini: sebenzisa i-lamination ye-matte noma ye-satin, qinisekisa ukuphrinta okunesinqumo esiphezulu, bese ushintsha izibonisi ngaphambi kokuba zibonise ukuguguleka. Ikhodi yokukhokha eklwebhekile noma efiphele ibiza ukuthengiselana.', 'Cabanga ngokuqina kanye nokushintshwa kwesibonisi. Izibonisi zekhawuntara ziyathintwa, zithuthwe, zifafazwe, futhi ngezinye izikhathi zigoqwe. Yakha uhlelo lwakho lokubonisa ukuze i-QR ifakiwe ishintshwe kalula ngaphandle kokushintsha yonke indawo. Gcina iziprinti ezisele zilungile, ezikhiqizwe kusixhumanisi sakho sokucushwa esikhiyiwe, ukuze amakhodi agugile ashintshwe ngokushesha.'],
    },
    {
      heading: 'Ukuhlola Ngezinhlelo Zokusebenza Zokukhokha Zangempela',
      paragraphs: ['Izikena zekhamera ezijwayelekile zizonquma cishe noma iyiphi ikhodi ye-QR efomethiwe kahle. Izinhlelo zokusebenza zokukhokha zikhetha kakhulu. Ngaphambi kokusebenzisa noma iyiphi ikhodi ye-QR yokukhokha, yihlole ngazo zonke izinhlelo zokusebenza zokukhokha amakhasimende akho angase azisebenzise. Ezindaweni zokukhokha okuningi, lokhu kungasho ukuhlola ngezinhlelo zokusebenza eziningi zasebhange, ama-wallet edijithali, kanye namapulatifomu okukhokha. Bhala phansi ukuthi yiziphi izinhlelo zokusebenza ozihlolile kanye nezinguqulo zazo - izinhlelo zokusebenza zokukhokha zibuyekezwa njalo, futhi isibuyekezo singashintsha indlela yokuskena.', 'Hlola ngaphansi kwezimo ezingokoqobo: isibonisi sangempela, ukukhanya kwangempela, ibanga langempela lokuskena. Ikhodi eskena ngokushesha edeskini lakho ingase ibe nenkinga ekhawunteni ngo-5pm lapho ilanga lantambama lidala ukukhanya. Hlola nge-smartphone endala kakhulu, eshibhile ongayithola - uma isebenza ngokwethembeka kudivayisi engabizi kakhulu, izosebenza kukho konke. Maka noma yisiphi isikhathi sokuskena ngaphezu kwemizuzwana emi-2 ukuze kuphenywe futhi kuklanywe kabusha okungenzeka.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Uhlu lokuhlola olubonisa izinhlelo zokusebenza zokukhokha ezahlukahlukene, izinhlobo zamadivayisi, kanye nezimo zemvelo ukuqinisekisa',
          caption: 'I-matrix yokuhlola i-QR yokukhokha ephelele ehlanganisa izinhlelo zokusebenza, amadivayisi, kanye nezici zemvelo',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Buka izibonelo ze-QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Amakhodi e-QR Alungele Ukuphrinta: I-SVG vs I-PNG',
      paragraphs: ['Umehluko phakathi kwekhodi ye-QR eskena kahle kanye neyokwehluleka uvame ukwehlela ekutheni ithunyelwe kanjani futhi yaphathwa kanjani emsebenzini wokuphrinta. Lo mhlahlandlela uchaza umehluko obalulekile phakathi kwamafomethi e-vector (SVG) kanye ne-raster (PNG), ukuthi kufanele isetshenziswe nini ngayinye, nokuthi ungayidlulisela kanjani imisebenzi yobuciko ye-QR kubaklami kanye nabathengisi bokuphrinta ngezindlela ezigcina ukuthembeka kokuskena kusuka kumakhadi ebhizinisi kuya ezimpawini ezinobukhulu bebhodi.', 'Ukukhiqizwa kokuphrinta kwethula iziguquguquko ezingekho esikrinini: ukusabalala kweyinki, ukuthungwa kwe-substrate, izinqubo zokuqeda, kanye nomphumela ohlanganisiwe wokuguqulwa kwamafayela amaningi. Ikhodi ye-QR ebukeka iphelele kusofthiwe yakho yokuklama ingavela kuphrinta ngemiphetho ethambile, umehluko oncishisiwe, noma amamojula asontekile kancane. Ukuqonda ukukhetha ifomethi kanye nemikhuba emihle yokusebenza kuvimbela lokhu kwehluleka okuthule.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Umbono okhulisiwe oqhathanisa amamojula we-vector QR anemiphetho ecacile uma kuqhathaniswa namamojula we-raster abonisa izinto zobuciko ze-pixel',
          caption: 'I-Vector vs i-raster esikalini sokuphrinta: umehluko wokunemba onquma ukuthembeka kokuskena',
        },
      ],
    },
    {
      heading: 'Kungani I-Vector (SVG) Ikhethwa Ngokuphrinta',
      paragraphs: ['Amafayela e-SVG achaza amakhodi e-QR njengezimo zezibalo kunokuba abe amagridi amaphikseli. Lokhu kusho ukuthi ikhodi ingalinganiswa kunoma yimuphi usayizi - kusukela kulebula engu-1cm kuya kubhena elingamamitha ayi-10 - ngaphandle kokulahlekelwa ukucija komkhawulo. I-RIP (Iprosesa Yesithombe se-Raster) yephrinta iveza ama-vectors esinqumweni sendabuko sedivayisi yokukhipha, iqinisekisa ukuthi umkhawulo ngamunye wemojula uqinile njengoba ihadiwe ivumela. Akukho ukuxutshwa, akukho zinto zobuciko ezilwa nokuhlukaniswa, akukho ukufiphala okuqongelelwe okuvela ekusebenzeni okuningi kokushintsha usayizi.', 'Ngaphandle kokukhuliswa, amafayela e-SVG aqinile kakhulu emisebenzini yobungcweti. Asinda ohambweni olujikelezayo ngesofthiwe yokuklama ngaphandle kokuwohloka. Angalungiswa ngombala ngaphandle kokuphinda ahlolwe. Afakwa kahle kumafayela e-PDF ukuze kukhishwe okulungiselelwe ukucindezelwa. Kunoma yiluphi uhlelo lokusebenza lokuphrinta lapho ikhwalithi ibalulekile, i-SVG kufanele ibe yifomethi yakho yokuthumela ezenzakalelayo.'],
    },
    {
      heading: 'Uma i-PNG Yamukeleka',
      paragraphs: ['I-PNG iba yinto edingekayo lapho umsebenzi wakho noma ipulatifomu yakho yendawo ingasekeli amafomethi e-vector. Amanye amapulatifomu ewebhu, izinhlelo ze-CMS zesignali, kanye nemisebenzi yokuphrinta yefa elidinga izithombe ze-raster. Kulezi zimo, i-PNG ingasebenza kahle - kodwa kuphela uma ulandela imithetho eqinile: thumela ngosayizi wokugcina ongokoqobo kanye nesisombululo, ungalokothi ukhuphule izinga ngemva kokuthumela, futhi ugweme noma yikuphi ukucindezela okulahlekile noma ukuguqulwa kwefomethi.', 'Umthetho obalulekile we-PNG ukubala ubukhulu bakho bephikseli obudingekayo ngaphambi kokuthumela ngaphandle. Uma i-QR yakho izophrinta ku-5cm futhi iphrinta yakho isebenza ku-300 DPI, udinga cishe amaphikseli angu-590. Thumela ngosayizi noma ngaphezulu, bese ukhuphula izinga uma kudingeka - ungalokothi ukhuphule izinga. Faka lolu lwazi egameni lakho lefayela noma imethadatha ukuze abasebenzisi besikhathi esizayo bangasebenzisi kabi ngengozi ukuthekelisa okuqondene nosayizi.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Isixhumi sokubala esibonisa ubudlelwano phakathi kosayizi ongokoqobo, i-DPI, kanye nobukhulu bephikseli obudingekayo',
          caption: 'Isibali sokucacisa ukuphrinta: ukunquma ubukhulu bephikseli obuncane bosayizi wokukhipha okuqondiwe',
        },
      ],
    },
    {
      heading: 'Izinketho Zokuthumela ze-ANQR Zichaziwe',
      paragraphs: ['I-ANQR inikeza izindlela eziningana zokuthumela ze-SVG ukuze zivumelane nemisebenzi ehlukene yokusebenza. Imodi ye-True Vector ikhiqiza umphumela ohlanzekile osekelwe endleleni ofanele amathuluzi okuphrinta nawokuklama ochwepheshe. Uma wengeze ukunqwabelanisa kwe-raster noma imiphumela ethile, i-ANQR ingazifaka lokhu ngenkathi igcina amamojula e-vector, noma ungathumela inguqulo egcwele i-raster kusisombululo sakho esibekiwe. Ukuqonda lezi zinketho kukusiza ukuthi ukhethe ukuthumela okulungile kwesimo ngasinye sokusetshenziswa.', 'Kokuthunyelwa kwe-PNG, i-ANQR ikuvumela ukuthi ucacise ubukhulu obuqondile futhi ifaka izinketho zezizinda ezisobala. Isethingi ye-DPI ikusiza ukuthi ubale osayizi abafanele bokuphrinta, noma khumbula ukuthi i-DPI iyi-metadata - okubalulekile ekuphrinteni ukuba namaphikseli anele osayizi wakho ongokoqobo. Uma ungabaza, ukuthumela okukhudlwana kunalokho ocabanga ukuthi ukudinga; ukukala phansi kulondoloza ikhwalithi ngenkathi ukukala kuyayibhubhisa.'],
    },
    {
      heading: 'Ukulungiselela Amafayela Okudluliselwa',
      paragraphs: ['Uma udlulisela umsebenzi wobuciko be-QR kubaklami noma kubathengisi bokuphrinta, faka imininingwane ecacile: usayizi ohlosiwe womzimba, izidingo zendawo ethule okungenani, kanye nanoma yiziphi izinto ezicatshangelwayo zesikhala sombala. Ngezinhlelo zokusebenza ezibalulekile, nikeza kokubili i-SVG master kanye ne-PNG backup enesinqumo esiphezulu, ebhalwe ngokucacile ngokusetshenziswa kwayo okuhlosiwe. Faka isixhumanisi sakho sokucushwa kwe-ANQR ukuze ikhodi ikwazi ukuvuselelwa uma kudingeka.', 'Lindela amaphutha avamile enkambisweni yokudluliselwa. Sho ngokusobala ukuthi i-QR akufanele ilinganiswe, ijikeleziswe, igobe, noma ibe nemiphumela esetshenziswayo. Cacisa ukuthi indawo ethule kumele ihlale icacile - akukho zimpawu zokunqampuna, izimpawu zokubhalisa, noma izakhi zomklamo eziphazamisayo. Uma i-QR izobekwa ngemuva okunombala noma okunezithombe, nikeza inguqulo enesimo esingemuva esingacacile ukuqinisekisa umehluko ofanele.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Umdwebo wephakheji yefayela obonisa i-SVG master, isipele se-PNG, idokhumenti yemininingwane, kanye nesixhumanisi sokucushwa',
          caption: 'Iphakheji yokunikezwa kwe-QR yobungcweti: konke okudingwa ngumklami noma umthengisi wokuphrinta ukuze kukhiqizwe kabusha okunembile',
        },
      ],
    },
    {
      heading: 'Ukuqinisekisa Ubufakazi Bokuphrinta',
      paragraphs: ['Ungalokothi uvume ukuphrinta ngaphandle kokuskena ubufakazi obuphathekayo. Cela ubufakazi obuphrintiwe ku-substrate yangempela kanye nokuqedwa kwangempela okuzosetshenziswa ekukhiqizeni. Skena ubufakazi ngaphansi kwezimo zokukhanya ezifana nalapho ingxenye yokugcina izoboniswa khona. Hlola ngamadivayisi amaningi, kufaka phakathi ama-smartphone amadala angase abe nenkinga ngekhwalithi engaphansi.', 'Uma ubufakazi buskena kancane noma ngokungahambisani, phenya ngaphambi kokuvuma. Izinkinga ezivamile zifaka phakathi ukungafani okunganele kuma-substrate anemibala, ukwephulwa kwendawo ethule kusukela ekusikeni, imiphetho yemojula yokuthambisa i-inki spread, noma i-lamination edala ukukhanya. Noma yikuphi kwalokhu kungaxazululwa ngaphambi kokuzibophezela ekuphrinteni okugcwele - kodwa kuphela uma ubabamba esigabeni sobufakazi.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Uhlu lokuhlola ubufakazi olunemiphumela yokuhlolwa kokuskena, izilinganiso zokuqhathanisa, kanye namasignesha okuvunyelwa',
          caption: 'Umsebenzi wokuqinisekisa ubufakazi bokuphrinta: ukuhlolwa okuhlelekile ngaphambi kokuzibophezela enanini lokukhiqiza',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Buka izibonelo ze-QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Ukudala Amakhodi e-QR Anezithombe',
      paragraphs: ['Amakhodi e-QR anezithombe ahlanganisa ukusebenza kwamakhodi e-QR ajwayelekile nokunyakaza okubamba amehlo okwandisa kakhulu amazinga okuzibandakanya. Ezimpawini zedijithali, ezinkundleni zokuxhumana, kanye nezibonisi ezisebenzisanayo, ukugqwayiza kuguqula ukusetshenziswa okungaguquki kube yinto ebonakalayo eheha iso futhi imeme ukusebenzisana. Lo mhlahlandlela uhlanganisa izimiso, amasu, kanye nemikhawulo esebenzayo yokudala amakhodi e-QR anezithombe askena ngokwethembeka ngenkathi eletha umthelela obonakalayo.', 'Inselele eyisisekelo yamakhodi e-QR anezithombe ukulinganisela intshisekelo yokubuka ngokumelene nokuthembeka kokuskena. Uhlaka ngalunye kumele luskenwe ngokwalo - iskena singase sibambe ikhodi nganoma yisiphi isikhathi emjikelezweni wokugqwayiza. Lo mkhawulo ubumba zonke izinqumo zokuklama: ukuthi yiziphi izinto ezingahamba, ukuthi zingashintsha kangakanani, nokuthi yini okumele ihlale izinzile kulo lonke ukugqwayiza.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Isibonisi sezimpawu zedijithali esibonisa ikhodi ye-QR enyakazayo edonsa ukunaka kwababukeli endaweni yomphakathi',
          caption: 'Amakhodi e-QR anyakazayo ezimpawini zedijithali: ukunyakaza okudonsela ukunaka futhi okukhuthaza ukuskena',
        },
      ],
    },
    {
      heading: 'Indlela Ukuskena Okuthinta Ngayo Ukuskena',
      paragraphs: ['Amaskena e-QR asebenza ngokuthwebula uhlaka olulodwa futhi ahlaziye iphethini yamamojula okukhanya nomnyama. Ukuze ikhodi enyakazayo isebenze, uhlaka ngalunye kumele luqukathe iphethini ye-QR ephelele, esebenzayo. Lokhu kuvimbela ukuskena okuguqula isakhiwo sekhodi, kuchithe amamojula, noma kushintshe kakhulu iphethini yokuqhathanisa. Amamojula athwala idatha - iphethini ebonakala ingahleliwe phakathi nendawo - kumele ahlale eqinile ngokubonakalayo kuyo yonke indawo.', 'Izindlela zokuskena eziphephile ziguqula izinto ezingathwali idatha: izizinda, imibala, ozimele bokuhlobisa, kanye nezinto ezimboziwe. Izingxenye zesakhiwo - amaphethini okuthola (izikwele ezinkulu zasekhoneni), amaphethini esikhathi (imigqa eshintshanayo), kanye namaphethini okuqondanisa (izikwele ezincane kumakhodi amakhulu) - kumele zigcine izikhundla zazo kanye nobukhulu bazo. Ukusebenza ngaphakathi kwalezi zithiyo kusavumela ukuskena okunamandla nokuhehayo ngokumangalisayo.'],
    },
    {
      heading: 'Amasu Okugqwayiza Asebenzayo',
      paragraphs: ['Ukujikeleza kombala kuvuselela imibala yangaphambili neyangemuva ngephalethi ngenkathi kugcinwa ukungafani okwanele kuzo zonke izinyathelo. Lokhu kudala umphumela ogqamile, obamba ukunaka onengozi encane yokuskena - uma nje ukungafani kungalokothi kwehle ngaphansi kwamazinga afundekayo. Amasethingi omjikelezo wombala we-ANQR aklanyelwe ukugcina ukuskenwa kulo lonke umjikelezo.', 'Ukugqagqana kwezithombe ezigqwayizayo kubeka izithombe ezihambayo ngemuva kwephethini ye-QR esobala kancane. Ikhodi ihlala izinzile ngenkathi ingemuva livuselela - mhlawumbe ividiyo ejikelezayo, izakhi zomkhiqizo ezigqwayizayo, noma ihluzo zokunyakaza ezingabonakali. Le ndlela idinga ukuphathwa kokuqina okucophelelayo ukuvimbela ingemuva ukuthi lingagcini iphethini ye-QR, kodwa kudala imiphumela ehlaba umxhwele kakhulu.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Umdwebo obonisa isakhiwo esinezingqimba ze-QR egqwayizayo: ungqimba lwekhodi oluzinzile phezu kwengqimba yangemuva egqwayizayo',
          caption: 'Isimiso sokubeka izithombe ezigqwayizayo: iphethini ye-QR ihlala ingaguquki ngenkathi izakhi zangemuva zivuselela ngaphansi',
        },
      ],
    },
    {
      heading: 'Ukulungiselela Amapharamitha Ezithombe Ezigqwayizayo',
      paragraphs: ['Izinga lohlaka lithinta kokubili ukushelela kokubona kanye nosayizi wefayela. Eziningi zezinhlelo zokusebenza, ozimele abayi-10-15 ngomzuzwana banikeza ukunyakaza okubushelelezi ngaphandle kosayizi wamafayela oweqile. Amanani aphezulu ozimele anikeza ukubuyiselwa okubonakalayo okunciphayo ngenkathi kukhulisa kakhulu osayizi bamafayela. Cabanga ngomongo wakho wokulethwa - uphawu olukhulu lwedijithali lungaphatha amafayela amakhulu kunokubekwa kwesikhangiso seselula.', 'Ukuziphatha kwe-Loop kunquma ukuthi izithombe zihamba kanjani. Ama-loop angenamthungo adala ukunyakaza okuqhubekayo okulungele izimpawu kanye nokuboniswa kwe-ambient. Ama-loop e-Ping-pong (phambili-bese-ngemuva) asebenza kahle kuma-animation alula. Ukuze uthole ama-pulse adonsa ukunaka, cabanga ngama-animation anezibambo - izikhathi zokuthula eziphazanyiswa ukunyakaza okudonsa iso ngaphandle kokukhathala okuqhubekayo kokunyakaza.'],
    },
    {
      heading: 'Ukudala Ama-Animated Overlays',
      paragraphs: ['Uma usebenzisa izithombe ezi-animated (ama-GIF, ama-WebP a-animated, noma ividiyo) njengezithombe ezimboziwe, i-ANQR ikhipha ozimele bese iwahlanganisa ngekhodi yakho ye-QR. Ukusethwa kokuqina kwe-overlay kulawula ukuthi ingakanani i-animation ekhombisa - amanani aphansi abeka phambili ukuskena ngenkathi amanani aphezulu ethanda umthelela wokubona. Hlola ukuqina kwakho okukhethiwe kumafreyimu amaningi ukuqinisekisa ukuskena okuhambisanayo.', 'Ikhwalithi yezinto zomthombo ithinta kakhulu imiphumela. Sebenzisa ama-overlay anezihloko ezicacile kanye nokugqama okuhle. Gwema ama-animation avela emthonjeni anokukhanya okusheshayo noma izinguquko zokukhanya okukhulu ezingadala ozimele abancane ngezikhathi ezithile. Buka kuqala umjikelezo ogcwele we-animation ngaphambi kokuthumela ukuze ubambe noma yimaphi amafreyimu anenkinga angase ahluleke ukuskena.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Umbono wohlaka ngohlaka we-overlay ye-animation ekhombisa amazinga okugqama agcinwe kulo lonke ukulandelana',
          caption: 'Ukuhlaziywa kohlaka: ukuqinisekisa ukuskenwa okuhambisanayo kulo lonke umjikelezo we-animation',
        },
      ],
    },
    {
      heading: 'Izinto Okucatshangelwayo Zokuthumela Nokulethwa',
      paragraphs: ['I-GIF isalokhu iyifomethi ye-animation esekelwa kakhulu, idlala ngokuzenzakalelayo ezimweni eziningi ngaphandle kokudinga ukwesekwa kwesidlali sevidiyo. Kodwa-ke, i-palette yemibala engu-256 ye-GIF ikhawulela ukuthembeka kombala. Kuma-animation abucayi ngombala, cabanga nge-WebP ye-animation lapho isekelwa khona, noma ubuyele kumafomethi evidiyo ukuze uthole ikhwalithi ephezulu kakhulu. Ukuthunyelwa kwe-GIF ye-ANQR kufaka phakathi izinketho zokushintsha ukuze kukhuliswe ikhwalithi ngaphakathi kwemikhawulo ye-palette.', 'Usayizi wefayela ubalulekile ekulethweni. Izinhlelo zezimpawu zedijithali, amaklayenti e-imeyili, kanye namapulatifomu omphakathi avame ukubeka imikhawulo yosayizi. Uma ama-animation akho edlula le mikhawulo, nciphisa inani lohlaka, ubukhulu, noma ukujula kombala. Ngezinye izikhathi ukuhlukanisa izithombe eziyinkimbinkimbi zibe yi-loop emfushane kufeza imiphumela engcono kunokucindezela okunamandla okonakalisa yonke ifreyimu.'],
    },
    {
      heading: 'Ukuhlola Amakhodi E-QR Anezithombe',
      paragraphs: ['Ukuhlola amakhodi ezithombe kudinga ukuskena ezindaweni eziningi emjikelezweni wezithombe. Ungaskena kanye nje bese ucabanga ukuthi uphumelele - skena ngokuphindaphindiwe, ngezikhathi ezahlukene, ukuqinisekisa ukuthi yonke ifreyimu iyafundeka. Naka kakhulu ozimele ezimweni zomjikelezo wombala noma eziqongweni zokuqina kwe-overlay lapho umehluko ungaba phansi kakhulu.', 'Hlola ihadiwe yangempela yokubonisa lapho kungenzeka khona. Qapha ukulinganiswa kombala, i-engeli yokubuka, kanye nokukhanya kwe-ambient konke kuthinta indlela izithombe ezibonakala ngayo kanye nokuskena. I-animation ekhanyayo eskena kahle esikrinini sakho ingase igezeke esikrinini sangaphandle noma ingafundeki ngama-engeli okubuka aqondile.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'I-matrix yokuhlola ekhombisa amazinga empumelelo yokuskena kuwo wonke amafreyimu, amadivayisi, kanye nezimo zokubonisa',
          caption: 'Iphrothokholi yokuhlola i-QR egqwayizayo: ukuqinisekiswa okuhlelekile kuwo wonke amafreyimu, amadivayisi, kanye nezimo zokubukela',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Buka izibonelo ze-QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Imikhuba Emihle Yokuphepha Nokuthobela I-QR',
      paragraphs: ['Ikhodi ye-QR eklanywe kahle ehluleka ukuskena imbi kakhulu kunokuba ingasebenzi - iyacasula amakhasimende, yonakalise umbono womkhiqizo, futhi ichitha yonke imithombo etshalwe ekudalweni nasekusatshalalisweni kwayo. Lo mhlahlandlela uhlanganisa izici zobuchwepheshe nezisebenzayo ezinquma ukuthi ikhodi ye-QR izoskena ngokwethembeka yini, nokuthi ungayisebenzisa kanjani izici zokuphepha ze-ANQR ukuze ubambe izinkinga ezingaba khona ngaphambi kokuba zifinyelele ekukhiqizweni.', 'Ukuthembeka kwekhodi ye-QR akukhona kanambambili. Ikhodi ingase iskene kahle emafonini aphambili kodwa yehluleke kumadivayisi ebhajethi. Ingase isebenze ekukhanyeni okuhle kodwa izabalaze ezindaweni zokudlela ezifiphele noma ukukhanya kwelanga. Ukuqonda izinto ezithinta ukuskena kukusiza ukuthi wenze ukuhwebelana phakathi kwesitayela esibonakalayo nokwethembeka komhlaba wangempela.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'I-spectrum yokuthembeka ekhombisa amakhodi e-QR asukela kokuskenwa kakhulu kuya kokungafundeki kahle',
          caption: 'I-spectrum yokuskenwa: kusukela kumakhodi angangenisi izinhlamvu kuya ekusikweni okucindezela imikhawulo yokuthembeka',
        },
      ],
    },
    {
      heading: 'Ukuqonda Amazinga Okulungisa Amaphutha',
      paragraphs: ['Amakhodi e-QR afaka phakathi ukuphindaphindwa okwakhelwe ngaphakathi okuvumela ukuthi kufundwe ngisho noma konakele kancane noma kufihliwe. Izinga lokulungisa amaphutha - L (7%), M (15%), Q (25%), noma H (30%) - kunquma ukuthi ingakanani ikhodi engalahleka ngenkathi isabhala kahle. Ukulungiswa kwamaphutha okuphezulu kudala amakhodi amakhulu kodwa kunikeza umkhawulo wokuphepha wokumbozwa, ukungapheleli kokuphrinta, kanye nomonakalo wemvelo.', 'Kumakhodi anezimbozwa zesithombe, izinga lokulungisa amaphutha H libalulekile - ukumbozwa kufihla ingxenye yekhodi, futhi udinga lokho kuphindaphindwa okungu-30% ukuze ugcine ukuthembeka. Kumakhodi ahlanzekile, angaklanywanga ezindaweni ezilawulwayo, izinga M livame ukwanele. Izinga L kufanele ligcinelwe izimo lapho usayizi wekhodi ulinganiselwe kakhulu futhi ungaqinisekisa izimo ezihlanzekile.'],
    },
    {
      heading: 'Indawo Ethule Ebucayi',
      paragraphs: ['Indawo ethule ingumkhawulo ongenalutho ozungeze ikhodi ngayinye ye-QR. Izikena zisebenzisa lo mngcele ukukhomba lapho ikhodi iqala futhi iphela khona. Izinga le-ISO licacisa indawo ethule okungenani yamamojula amane (ububanzi obuphindwe kane besikwele esincane kunazo zonke kukhodi). Ukwephula lesi sikhala - ngezinto zokuklama, imiphetho yokunquma, noma okuqukethwe okuseduze - kungenye yezimbangela ezivame kakhulu zokwehluleka kokuskena.', 'Ukuphoqelelwa kwendawo ethule ye-ANQR kusiza ukugcina lesi sikhala esibucayi, kodwa kufanele futhi uqinisekise ukuthi sigcinwa emiklamo yakho yokugcina. Lapho uhambisa umsebenzi wobuciko we-QR, cacisa ngokucacile izidingo zendawo ethule. Lapho ubeka amakhodi kuzakhiwo, qinisekisa ukuthi azikho izinto ezingena kulesi sikhala. Amamilimitha ambalwa esikhala esicacile angasho umehluko phakathi kokuskena okuthembekile namakhasimende akhungathekile.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Umdwebo obonisa isikhala sendawo ethule esifanele uma kuqhathaniswa nokwephulwa okuvamile okubangela ukwehluleka kokuskena',
          caption: 'Izidingo zendawo ethule: umkhawulo ongabonakali onquma impumelelo yokuskena',
        },
      ],
    },
    {
      heading: 'Ukuqhathanisa Nokuphepha Kombala',
      paragraphs: ['Amaskena e-QR abona iphethini yamamojula okukhanya nomnyama. Noma yisiphi isitayela esinciphisa lokhu kuqhathanisa - izibani zangaphambili ezikhanyayo, izizinda ezimnyama, imiphumela ye-gradient, noma ukunqwabelana okungabonakali kahle - kwenza ikhodi ibe nzima ukuyifunda. I-ANQR ibala izilinganiso zokuqhathanisa futhi ixwayisa lapho ukukhetha kwakho kombala kusondela emazingeni ayingozi, kodwa i-arbiter yokugcina ihlala iwukuhlola kwangempela.', 'Ukubona umbala kuyahlukahluka ngezimo zokukhanya. Inhlanganisela yombala ebonakala ihluke kakhulu kusikrini sakho ingaba nzima ukuyihlukanisa ngaphansi kokukhanya okufudumele kwe-incandescent noma amashubhu apholile e-fluorescent. Uma ikhodi yakho izosetshenziswa ezimweni zokukhanya ezahlukahlukene, hlola ngaphansi kwemithombo eminingi yokukhanya, bese ucabangela izilinganiso zokuqhathanisa ezilondolozayo njengomkhawulo wokuphepha.'],
    },
    {
      heading: 'Usayizi Wemojula Nebanga Lokubuka',
      paragraphs: ['Usayizi ongokoqobo wamamojula ngamanye unquma ibanga eliphakeme lapho ikhodi ingaskenwa khona. Amamojula amancane asho amakhodi amancane kodwa adinga amabanga okuskena aseduze. Umthetho ojwayelekile uwukuthi imojula ngayinye kufanele okungenani ibe ngu-0.5mm ebangeni lokuskena elihlosiwe, ikhuphuke ngokulinganayo ukuze ifinyelele amabanga amakhulu. Ikhodi ebhodini lokubhengeza idinga amamojula amakhulu kakhulu kunekhodi ekhadini lebhizinisi.', 'Uma ubala usayizi wemojula, cabanga ngesimo esibi kakhulu: ikhasimende elinefoni endala, ekukhanyeni okungaphelele, eliskena ebangeni elingase libe khona. Idizayini yalo msebenzisi, futhi wonke umuntu uzoba nesipiliyoni esingcono kakhulu. Izincomo zosayizi we-ANQR zigxila kulezi ziguquguquko zomhlaba wangempela ukuze ziphakamise ubukhulu obufanele bokusetshenziswa kwakho okuhlosiwe.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Ishadi elihlobene nosayizi wemojula, ubukhulu bokuphrinta, kanye nebanga lokuskena eliphumelelayo kakhulu',
          caption: 'Umhlahlandlela webanga lokuskena: ukufanisa usayizi wemojula nezidingo zakho zokuthunyelwa',
        },
      ],
    },
    {
      heading: 'Ukusebenzisa Imodi Yokuphepha ye-ANQR',
      paragraphs: ['Imodi Yokuphepha ye-ANQR inikeza impendulo yesikhathi sangempela ngokuthembeka kokuskena. Iqapha izilinganiso zokungafani, ukuhambisana nendawo ethule, ukuqina kwe-overlay, nezinye izinto ezithinta ukuskena. Uma noma iyiphi ipharamitha isondela emazingeni ayingozi, uzobona izixwayiso ezinesiqondiso esithile sendlela yokuthuthukisa ukuthembeka. Kokusetshenziswa kochwepheshe lapho ukwehluleka kubiza khona, gcina iModi Yokuphepha isebenza kuyo yonke inqubo yokuklama.', 'IModi Yokuphepha ifaka phakathi isici sokuqinisekisa ukuskena esizama ukunquma ikhodi yakho ekhiqiziwe futhi ibike impumelelo noma ukwehluleka. Ngenkathi lokhu kuqinisekiswa kwangaphakathi nohlelo lokusebenza kungenakukwazi ukuphinda zonke izimo zangempela, kubamba izinkinga eziningi ezivamile ngaphambi kokuthi utshale imali ekuphrinteni noma ekusabalaliseni. Phatha ukuqinisekiswa okuphumelelayo njengebha encane, hhayi isiqinisekiso - ukuhlolwa kwangempela kusabalulekile.'],
    },
    {
      heading: 'Izinqubo Zokuhlola Zangempela',
      paragraphs: ['Akukho silinganiso sokuqinisekiswa kwesofthiwe esithatha indawo yokuhlola ngokomzimba. Phrinta ikhodi yakho ngosayizi ohlosiwe ezintweni ezimele. Yivivinye endaweni yangempela yokusetshenziswa ngezimo zokukhanya ezihambisana nokusetshenziswa kwangempela. Skena ngamadivayisi amaningi - hhayi ifoni yakho eyinhloko kuphela, kodwa namadivayisi e-Android angabizi kakhulu, ama-iPhone amadala, nanoma yimaphi amadivayisi athile izithameli zakho eziwasebenzisa njalo.', 'Bhala phansi ukuhlolwa kwakho ngendlela ehlelekile. Qopha ukuthi yimaphi amadivayisi ahlolwe, ngaphansi kwaziphi izimo, ngemiphumela. Uma usebenzisa amakhodi ngezinga, sungula izindlela zokwamukela: mhlawumbe izinga lempumelelo elingu-95% kulo lonke ichibi lakho lokuhlola idivayisi, noma ukuskena okuphumelelayo kungakapheli imizuzwana emi-2 kuwo wonke amadivayisi avivinyiwe. Lezi zindinganiso zisiza ekwenzeni izinqumo zokungaphumi/ukungaphumi zibe nenjongo kunokuba zithembe okungcono kakhulu.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Uhlu lokuhlola oluphelele oluhlanganisa amadivayisi, izimo, kanye nezindlela zokwamukela',
          caption: 'Iphrothokholi yokuhlola ukufakwa kwe-QR: ukuqinisekiswa okuhlelekile ngaphambi kokuzibophezela ekukhiqizeni',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Vula ijenereyitha',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Buka izibonelo ze-QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Vula Umhlahlandlela Womsebenzisi Ogcwele', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Vula igalari', type: 'gallery' },
  ],
};
