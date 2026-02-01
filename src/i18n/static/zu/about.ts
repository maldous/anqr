import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Mayelana ne-ANQR',
  description: 'I-ANQR iyijeneretha yamakhodi e-QR yamahhala enendlela yokusebenzisa iklayenti kuqala - khiqiza amakhodi e-QR endaweni noma sebenzisa i-API yethu yokufaka.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Vula ijenereyitha', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Dlulisa amehlo Funda izihloko', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Inqubomgomo Yobumfihlo', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Imigomo Yesevisi', type: 'external' },
  ],
  sections: [
    {
      heading: 'Kuyini i-ANQR?',
      paragraphs: ['I-ANQR (ebizwa ngokuthi "i-anchor") iyijeneretha yamakhodi e-QR yamahhala edala amakhodi askeniwayo ama-URL, umbhalo, iziqinisekiso ze-Wi-Fi, amakhadi okuxhumana, imicimbi yekhalenda, nokuningi.', 'Yakhelwe abantu ngabanye, amabhizinisi amancane, abathengisi, kanye nabathuthukisi abafuna amathuluzi e-QR anamandla ngaphandle kokubhalisa. Umklamo weklayenti kuqala usho ukuthi amakhodi e-QR akhiqizwa endaweni kusiphequluli sakho ngokuzenzakalelayo, nge-API yeseva yokuzikhethela yokufaka nokuhlanganisa ngobungcweti.'],
    },
    {
      heading: 'Izici ezibalulekile',
      bullets: ['Khiqiza amakhodi e-QR ngokushesha kusiphequluli sakho - akudingeki i-akhawunti.', 'Yenza ngezifiso imibala, izitayela zamamojula, amaphethini okuthola, bese wengeza ukunqwabelanisa kwezithombe.', 'Thumela ngamafomethi amaningi: i-PNG, i-SVG, i-WebP, kanye ne-GIF egqwayiziwe.', 'Ukulawula okuthuthukisiwe kwezinga lokulungisa amaphutha, inguqulo ye-QR, imodi yokufaka ikhodi, kanye nokukhetha imaski.', 'Isiqondiso sokuphepha kokuskena kanye nokubuka kuqala bukhoma ukusiza ukugcina amakhodi efundeka ekuphrintiwe nasezikrinini.', 'I-API eseceleni kweseva yokushumeka kobungcweti ngokusekelwa okugcwele kwamapharamitha.', 'Isebenza ingaxhunyiwe ku-inthanethi uma isilayishiwe - uhlelo lokusebenza lwewebhu olungaguquki ongalusebenzisa noma kuphi.'],
    },
    {
      heading: 'Indlela i-ANQR esebenza ngayo',
      paragraphs: ['I-ANQR isebenza kusiphequluli sakho futhi ifaka ikhodi yokufaka kwakho ku-matrix ejwayelekile ye-QR ngokulungiswa kwamaphutha kaReed--Solomon, bese iyiguqulela kufomethi oyikhethayo.', 'Ngokuzenzakalelayo, ukwenziwa kwenzeka endaweni yakho kusiphequluli sakho. Ukuze kusetshenziswe ngobungcweti, ungasebenzisa futhi i-API eseceleni kweseva ukukhiqiza amakhodi e-QR ngamapharamitha e-URL - afanele ukushumeka kumawebhusayithi, ama-imeyili, noma imisebenzi ezenzakalelayo.', 'Uma ungeza ama-overlays noma ama-animation, i-ANQR ilinganisa isitayela nokuthembeka kokuskena ukuze umphumela uhlale uskenwa.', 'I-ANQR igxile kumakhodi angaguquki (idatha ingaphakathi kwe-QR). Uma udinga ikhodi enamandla (indawo ehlelekayo), ungafaka ikhodi ye-URL yakho yokuqondisa kabusha noma isixhumanisi esifushane.'],
    },
    {
      heading: 'Ubani osebenzisa i-ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Ukukhangisa nokuthi sihlala kanjani sikhululekile',
      paragraphs: ['I-ANQR imahhala ukuyisebenzisa futhi isekelwa ukukhangisa. Singabonisa izikhangiso nge-Google AdSense kanye/noma abanye ozakwethu bokukhangisa.', 'Abahlinzeki bezikhangiso bangasebenzisa amakhukhi noma ubuchwepheshe obufanayo ukwenza izikhangiso zibe ngezakho ngokusekelwe ezithakazelweni zakho kanye nomsebenzi wokuphequlula. Ungaphatha izintandokazi zezikhangiso kuzilungiselelo zakho zedivayisi kanye nezilungiselelo zezikhangiso ze-Google, futhi ufunde kabanzi kuNqubomgomo yethu Yobumfihlo.', 'Asithengisi okuqukethwe okufaka ikhodi kumakhodi e-QR. Izikhangiso zisiza ukumboza izindleko zokusebenzisa nokuthuthukisa iphrojekthi.'],
    },
    {
      heading: 'Izindinganiso ezivulekile',
      paragraphs: ['I-ANQR ikhiqiza amakhodi e-QR ngokusekelwe kuzinga le-ISO/IEC 18004 futhi ihlose ukuhambisana okubanzi kuzo zonke izikena, amakhamera, kanye nemisebenzi yokuphrinta.'],
    },
    {
      heading: 'Isaziso sophawu lokuhweba',
      paragraphs: ['I-QR Code® wuphawu lokuhweba olubhalisiwe lwe-DENSO WAVE INCORPORATED. I-ANQR ayixhunyanisiwe, ayivunyelwe, noma ayixhasiwe yi-DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Impendulo kanye neminikelo',
      paragraphs: ['Samukela impendulo, imibiko yeziphazamiso, kanye neziphakamiso zezici. Sicela uxhumane nathi nge-imeyili noma ikhasi lokuxhumana - sifunda yonke imilayezo, yize izikhathi zokuphendula zingahluka.'],
    },
  ],
};

export default about;
