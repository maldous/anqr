import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: 'Inqubomgomo Yobumfihlo',
  description: 'Ulwazi oluqoqwa yi-ANQR, ukuthi lusetshenziswa kanjani, kanye namalungelo akho ngaphansi kwemithetho yobumfihlo esebenzayo.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Imigomo Yesevisi', type: 'external' }],
  sections: [
    {
      heading: 'Isifinyezo',
      paragraphs: ['I-ANQR iyisikhiqizi sekhodi ye-QR esinendlela yokuqoka iklayenti kuqala. Asidingi ukuthi udale i-akhawunti. Ngokuzenzakalelayo, amakhodi e-QR akhiqizwa endaweni kusiphequluli sakho - asinakho ukufinyelela kokuqukethwe okubhalile.', 'Ukuze kusetshenziswe ngobungcweti, i-ANQR inikeza i-API eseceleni kweseva ekhiqiza amakhodi e-QR kusuka kumapharamitha e-URL. Uma usebenzisa i-API, okuqukethwe kwakho kwe-QR kuyacutshungulwa kumaseva ethu ukuze kuboniswe isithombe, kodwa akugciniwe noma kubhalwe phansi.', 'Sisebenzisa i-Google AdSense ekukhangiseni futhi singasebenzisa izinsizakalo zokuhlaziya. Lezi zinsizakalo ziqoqa ulwazi ngamakhukhi nobuchwepheshe obufanayo. Le nqubomgomo ichaza ukuthi iyiphi idatha eqoqwayo, ukuthi isetshenziswa kanjani, kanye namalungelo akho.'],
    },
    {
      heading: 'Ulwazi esiluqoqayo',
      bullets: ['Ulwazi olunikezayo: Uma usithinta nge-imeyili noma ifomu lethu lokuxhumana, siqoqa igama lakho, ikheli le-imeyili, kanye nokuqukethwe kwemiyalezo.', 'Ulwazi oluqoqwe ngokuzenzakalelayo: Umhlinzeki wethu wokusingatha (i-Netlify), ozakwethu bokukhangisa, kanye nezinsizakalo zokuhlaziya zingase ziqoqe: ikheli le-IP, uhlobo lwesiphequluli kanye nenguqulo, uhlelo lokusebenza, uhlobo lwedivayisi, i-URL yokubhekisela, amakhasi avakashelwe, isikhathi esizeni, kanye nendawo eseduze.', 'Amakhukhi eqembu lesithathu: Ozakwethu bokukhangisa (i-Google AdSense) basebenzisa amakhukhi kanye nobuchwepheshe obufanayo ukuze bakhonze futhi balinganise izikhangiso. I-ANQR ngokwayo ayibeki noma yimaphi amakhukhi eqembu lokuqala.'],
    },
    {
      heading: 'Amakhukhi kanye nobuchwepheshe beqembu lesithathu',
      paragraphs: ['I-ANQR ayibeki noma yimaphi amakhukhi eqembu lokuqala. Izintandokazi zakho (njengemodi emnyama) zigcinwa endaweni kudivayisi yakho, engadluliselwa kunoma iyiphi iseva.', 'Kodwa-ke, ozakwethu bokukhangisa (i-Google AdSense) kanye nomhlinzeki wokusingatha bangasebenzisa amakhukhi kanye nobuchwepheshe obufanayo bokulandelela:'],
      bullets: ['Amakhukhi okukhangisa (owesithathu): Asethwe yi-Google AdSense kanye nozakwethu bokukhangisa ukuze akhonze izikhangiso ezifanele, alinganise ukusebenza kwezikhangiso, futhi aqonde izintshisekelo zomsebenzisi. Lawa makhukhi angalandelela umsebenzi wakho kumawebhusayithi ahlukene.', 'Amakhukhi okuhlaziya (owesithathu): Angasetshenziswa umhlinzeki wethu wokusingatha noma izinsizakalo zokuhlaziya ukuqoqa idatha yokusetshenziswa engaziwa.'],
    },
    {
      heading: 'I-Google AdSense kanye nokukhangisa',
      paragraphs: ['Sibonisa izikhangiso nge-Google AdSense. I-Google kanye nozakwethu bayo basebenzisa amakhukhi ukuze bakhonze izikhangiso ngokusekelwe emlandweni wakho wokuphequlula kule sayithi nakwamanye amawebhusayithi (ukukhangisa okusekelwe ezithakazelweni).', 'Funda ukuthi i-Google isebenzisa kanjani ulwazi lwakho: https://policies.google.com/technologies/partner-sites', 'Phatha ukwenza ngezifiso izikhangiso: https://adssettings.google.com', 'Khetha ukuphuma nge-Network Advertising Initiative: https://optout.networkadvertising.org', 'Khetha ukuphuma nge-Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Indlela esisebenzisa ngayo ulwazi',
      bullets: ['Ukuphendula imibuzo yakho nokunikeza ukwesekwa.', 'Ukubonisa izikhangiso ezifanele ngabalingani bethu bokukhangisa. ', 'Ukuhlaziya ukusetshenziswa kwesayithi nokuthuthukisa izinsizakalo zethu.', 'Ukuthola, ukuvimbela, nokubhekana nokukhwabanisa, ukuxhashazwa, kanye nezinkinga zokuphepha.', 'Ukuhambisana nezibopho zomthetho.'],
    },
    {
      heading: 'Izinsizakalo zenkampani yangaphandle',
      bullets: ['I-Google AdSense: Ithola idatha yokukhonza nokulinganisa izikhangiso.', 'Abahlinzeki bezibalo: Thola idatha yokusetshenziswa engaziwa.', 'I-Netlify (ukusingatha): Icubungula izicelo futhi ingangena amakheli e-IP.', 'Asithengisi ulwazi lwakho lomuntu siqu. Kodwa-ke, ukwabelana ngedatha nabalingani bokukhangisa kungabhekwa "njengokuthengisa" ngaphansi kwe-CCPA (bheka ngezansi).'],
    },
    {
      heading: 'Ukugcinwa kwedatha',
      bullets: ['Ukuthunyelwa koxhumana nabo: Kuze kube yiminyaka emi-2.', 'Amalogi eseva: Kuze kube yizinsuku ezingama-30 (umhlinzeki wokusingatha).', 'Idatha yokuhlaziya: Kuze kube yizinyanga ezingama-26 (ayibonakali).', 'Amakhukhi okukhangisa: Ngokuvamile izinyanga eziyi-13 (ziyahlukahluka ngomlingani).'],
    },
    {
      heading: 'Amalungelo akho ngaphansi kwe-GDPR (abasebenzisi be-EEA)',
      paragraphs: ['Uma use-European Economic Area, unamalungelo alandelayo ngaphansi koMthethonqubo Ojwayelekile Wokuvikela Idatha:'],
      bullets: ['Ilungelo lokufinyelela: Cela ikhophi yedatha yomuntu siqu esinayo ngawe. ', 'Ilungelo lokulungisa: Cela ukulungiswa kwedatha engalungile.', 'Ilungelo lokususa: Cela ukususwa kwedatha yakho ("ilungelo lokukhohlwa").', 'Ilungelo lokukhawulela ukucubungula: Cela imikhawulo yokuthi siyisebenzisa kanjani idatha yakho.', 'Ilungelo lokuphatheka kwedatha: Cela idatha yakho ngefomethi ephathekayo.', 'Ilungelo lokuphikisa: Ukuphikisana nokucubungula, okuhlanganisa nokumaketha okuqondile.', 'Ilungelo lokuhoxisa imvume: Ukuhoxisa imvume nganoma yisiphi isikhathi lapho ukucubungula kusekelwe esivumelwaneni.', 'Ilungelo lokufaka isikhalazo: Faka isikhalazo egunyeni lakho lokuvikela idatha.'],
    },
    {
      heading: 'Isisekelo sezomthetho se-GDPR',
      paragraphs: ['Sicubungula idatha ngalezi zisekelo: (a) Imvume - yokukhangisa okwenziwe ngezifiso (okuphathwa ngabalingani bethu bokukhangisa); (b) Izintshisekelo ezisemthethweni - zokuhlaziya, ukuphepha, kanye nokuthuthukiswa; (c) Inkontileka - yokuphendula imibuzo.', 'Ukuze usebenzise amalungelo akho, xhumana no-email@anqr.link. Siphendula zingakapheli izinsuku ezingama-30.'],
    },
    {
      heading: 'Amalungelo akho ngaphansi kwe-CCPA (abasebenzisi baseCalifornia)',
      bullets: ['Ilungelo lokwazi: Cela ulwazi mayelana nedatha eqoqwe, imithombo, izinjongo, kanye nabantu besithathu.', 'Ilungelo lokususa: Cela ukususwa kolwazi lwakho lomuntu siqu.', 'Ilungelo lokukhetha ukuphuma: Khetha ukuphuma "ekuthengisweni" kolwazi lomuntu siqu (ukwabelana nabalingani bezikhangiso kungafaneleka).', 'Ilungelo lokungabandlululi: Ngeke sibandlulule ngokusebenzisa amalungelo akho.'],
    },
    {
      heading: 'Izigaba ze-CCPA eziqoqwe',
      paragraphs: ['Izigaba: Izikhombisi (ikheli le-IP, i-ID yedivayisi), umsebenzi we-inthanethi (ukuphequlula, ukusebenzisana kwezikhangiso), Indawo (cishe), Izincazelo (izintshisekelo ezivela ekuphequluleni).', 'Ukusebenzisa amalungelo noma ukukhetha ukuphuma: email@anqr.link noma ukulungisa izilungiselelo zamakhukhi.'],
    },
    {
      heading: 'Ukudluliselwa kwamanye amazwe',
      paragraphs: ['Ulwazi lwakho lungadluliselwa emazweni anemithetho ehlukene yokuvikela idatha, okuhlanganisa ne-United States. Sisebenzisa izindlela zokuvikela ezifanele njengeMigomo Yesivumelwano Ejwayelekile.'],
    },
    {
      heading: 'Ubumfihlo bezingane',
      paragraphs: ['I-ANQR ayiqondisiwe ezinganeni ezingaphansi kweminyaka engu-13 (noma engu-16 ku-EEA). Asiqoqi ngamabomu idatha evela ezinganeni. Xhumana no-email@anqr.link uma ukholelwa ukuthi ingane inikeze ulwazi.'],
    },
    {
      heading: 'Ukuphepha',
      paragraphs: ['Sisebenzisa izindlela zobuchwepheshe ezifanele kanye nezokuhlela ukuvikela idatha, okuhlanganisa nokubethela kwe-HTTPS. Kodwa-ke, akukho ukudluliswa kwe-inthanethi okuphephile ngo-100%.'],
    },
    {
      heading: 'Ungalandeli',
      paragraphs: ['Sihlonipha izimpawu zesiphequluli ze-Do Not Track lapho kungenzeka khona, yize ozakwethu bezokukhangisa bengase bangaphenduli ku-DNT.'],
    },
    {
      heading: 'Izinguquko kule nqubomgomo',
      paragraphs: ['Singabuyekeza le nqubomgomo njalo. Usuku "Lokugcina olubuyekeziwe" lubonisa ukubuyekezwa kwakamuva. Izinguquko ezibalulekile zingadluliselwa ngesibhengezo sesayithi.'],
    },
    {
      heading: 'Xhumana nathi',
      paragraphs: ['Ngemibuzo yobumfihlo noma ukusebenzisa amalungelo akho: email@anqr.link noma sebenzisa ikhasi lethu Lokuxhumana. Siphendula izicelo zobumfihlo zingakapheli izinsuku ezingama-30.'],
    },
    {
      heading: 'Inqubomgomo Yobumfihlo Egcwele',
      paragraphs: ['Leli khasi linikeza isifinyezo sezinqubo zethu zobumfihlo. Ukuze uthole inqubomgomo yobumfihlo ephelele, ebophezela ngokusemthethweni enemininingwane egcwele yokucutshungulwa kwedatha, amalungelo akho, nezibopho zethu ngaphansi kwe-GDPR, CCPA, neminye imithetho yobumfihlo, sicela ubheke inqubomgomo yethu egcwele ephethwe yi-iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Buka Inqubomgomo Yobumfihlo Egcwele ku-iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
