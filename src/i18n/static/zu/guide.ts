import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const guide: PageDefinition = {
  title: 'Umhlahlandlela Womsebenzisi we-ANQR',
  description: 'Umhlahlandlela ophelele wokusebenzisa i-ANQR ekudaleni amakhodi e-QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Vula ijenereyitha', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Dlulisa amehlo Funda izihloko', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Ukuqala',
      paragraphs: ['I-ANQR iyi-generator yekhodi ye-QR enendlela yoku-client-first. Ngokuzenzakalelayo, amakhodi e-QR akhiqizwa endaweni yakini kusiphequluli sakho - akukho akhawunti edingekayo futhi idatha yakho ihlala iyimfihlo. Ukuze ushumeke ngobungcweti, ungasebenzisa futhi i-API eseceleni kweseva.', 'I-interface inamazinga amathathu e-interface: Eyisisekelo, Ethuthukisiwe, kanye Neyobungcweti. Khetha izinga lakho usebenzisa amathebhu asekhanda. Izinga ngalinye livula izici ezengeziwe ngenkathi ligcina i-interface igxile kulokho okudingayo.'],
      bullets: ['Eyisisekelo: Ukudalwa kwekhodi ye-QR elula ngokuqukethwe kombhalo/i-URL okucacile kanye nokumbozwa kwesithombe.', 'Ethuthukisiwe: Izinketho zokufaka ikhodi ye-QR, izitayela zokubonisa, izithombe ezinyakazayo, amafomethi okukhipha, izinhlobo zokuqukethwe ezinwetshiwe, kanye nokwenza ngokwezifiso ukumbozwa.', 'Ochwepheshe: Ama-watermark, imethadatha, ukwabelana, ukuhlaziywa kokuphepha, amakhodi e-QR okukhokha, kanye nezici zebhizinisi.'],
      links: [{ href: '/?lang=${lang}', label: 'Vula ijenereyitha', type: 'generator' }],
    },
    {
      heading: 'Ukuqala Okusheshayo',
      paragraphs: ['Ukudala ikhodi yakho yokuqala ye-QR:'],
      bullets: ['1. Khetha uhlobo lokuqukethwe (i-URL, umbhalo, i-WiFi, njll.) kusuka ku-dropdown yohlobo lokuqukethwe.', '2. Faka idatha yakho ezinkambeni ezinikeziwe.', '3. Yenza ngokwezifiso imibala, izitayela, bese wengeza isithombe sokumbozwa." 75 ', '4. Chofoza okuthi Thumela ukuze ulande ikhodi yakho ye-QR njenge-PNG, i-GIF, i-WebP, noma i-SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Izici Eziyisisekelo',
      paragraphs: ['Izinga Eliyisisekelo linikeza isikhombikubona esilula sokudala amakhodi e-QR anokuqukethwe komthwalo kanye nokumbozwa kwezithombe. Lena yindlela elula yokuqala.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izinhlobo Zokuqukethwe (Eziyisisekelo)',
      paragraphs: ['Umbhalo Ocacile: Faka ikhodi noma yimuphi umbhalo kuze kufike emkhawulweni womthamo wekhodi ye-QR. Ilungele imiyalezo emifushane, amakhodi, noma izihlonzi.', 'I-URL: Faka ikhodi yamakheli ewebhu. Ikhodi ye-QR izovula i-URL uma iskenwa. Isekela amaphrothokholi e-http:// kanye ne-https://.'],
    },
    {
      heading: 'Ukumbozwa Kwesithombe (Esiyisisekelo)',
      paragraphs: ['Layisha isithombe (JPG, PNG, GIF, WebP) ukuze sihlangane nekhodi yakho ye-QR. Izici eziyisisekelo zokumbozwa zifaka:'],
      bullets: ['Layisha kusuka kufayela: Khetha isithombe kusuka kudivayisi yakho.', 'Layisha kusuka ku-URL: Faka i-URL yesithombe (kumele ivumele ama-CORS).', 'Ilogo Ephakathi: Ibeka isithombe phakathi, incike ekulungisweni kwamaphutha.', 'Ukuhlanganisa: Ukuhlanganisa okulula kwe-alpha yesithombe nephethini ye-QR.', 'Ukuqina: Kulawula ukuthi ukunqwabelanisa kuyithinta kangakanani ikhodi ye-QR (0-100%).', 'Imodi Yombala: Umbala Ogcwele, Isikali Esimpunga, noma Omnyama Nomhlophe.', 'Amaphethini Okugcina I-Finder: Igcina amaphethini ekhoneni engashintshiwe ukuze kuskenwe okuthembekile.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Izici Ezithuthukisiwe',
      paragraphs: ['Izinga Elithuthukisiwe livula izinketho zokufaka ikhodi ye-QR, izitayela zokubonisa, izithombe ezinyakazayo, amafomethi okukhipha, izinhlobo zokuqukethwe ezinwetshiwe, kanye nokwenza ngokwezifiso ukunqwabelanisa okuthuthukisiwe.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izilungiselelo Zokufaka Ikhodi ye-QR',
      paragraphs: ['Inguqulo: Amakhodi e-QR afika ezinguqulweni 1-40, ngezinguqulo eziphakeme eziphethe idatha eningi kodwa ezinkulu. Setha ku-0 (Okuzenzakalelayo) ukuze uvumele i-ANQR ikhethe inguqulo encane kakhulu efanelana nokuqukethwe kwakho.', 'Ukulungiswa Kwephutha: Kunquma ukuthi ikhodi ye-QR ingalimala kangakanani ngenkathi ihlala iskenwa.'],
      bullets: ['L (Ephansi): ukulungiswa kwephutha okungu-7% - usayizi omncane kakhulu, ukuphindaphinda okuncane kakhulu.', 'M (Ephakathi): ukulungiswa kwephutha okungu-15% - inketho elinganisiwe.', 'Q (Quartile): Ukulungiswa kwamaphutha angu-25% - kuhle kumakhodi aphrintiwe.', 'H (Phezulu): Ukulungiswa kwamaphutha angu-30% - kungcono kakhulu kumakhodi anezimbobo noma ezimweni ezinzima.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Indawo Ethule (Umkhawulo)',
      paragraphs: ['Indawo ethule yindawo emhlophe ezungeze ikhodi ye-QR. Izikena zidinga lo mkhawulo ukuze zithole ukuthi ikhodi iqala kuphi. Indinganiso itusa okungenani amamojula angu-4. Ukunciphisa ngaphansi kuka-4 kungabangela izinkinga zokuskena.'],
    },
    {
      heading: 'Isitayela Semojuli',
      paragraphs: ['Amamojula ayizikwele ngazinye ezakha ikhodi ye-QR. I-ANQR inikeza izitayela ezinhlanu:'],
      bullets: ['Isikwele: Ukubukeka kwe-QR yakudala okunamakhona abukhali.', 'Okuyindilinga: Amakhona athambile ukuze kubukeke kahle.', 'Amachashazi: Amamojula ayindilinga ukuze kubukeke kahle kwesimanje.', 'Idayimane: Izikwele ezijikelezwe ngu-45° ukuze kube nephethini ehlukile.', 'Kuxhunyiwe: Amamojula ayahlangana lapho eseduze, edala izimo eziphilayo.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Isitayela Sephethini Yokuthola',
      paragraphs: ['Amaphethini Okuthola ayizikwele ezintathu ezinkulu emakhoneni e-QR ezisiza ama-scanner ukuthi aqondise ikhodi. Izitayela ezitholakalayo:'],
      bullets: ['Isikwele: Amakhona ajwayelekile esikwele.', 'Okuyindilinga: Amakhona athambile ahambisana nesitayela semojuli eyindilinga.', 'Isiyingi: Amaphethini okuthola ayindilinga amakhodi esitayela samachashazi.'],
    },
    {
      heading: 'Amaphethini Okuqondanisa Nokuhlela Isikhathi',
      paragraphs: ['Amaphethini okuqondanisa avela kumakhodi amakhulu e-QR (inguqulo 2+) ukusiza ukulungisa ukuphambuka. Amaphethini okuqondanisa ayimigqa eshintshanayo exhumanisa amaphethini okuthola.'],
      bullets: ['Isitayela Sokuqondanisa: Isitholi Sokufana, Isikwele, Esiyindilinga, noma Isiyingi.', 'Isitayela Sesikhathi: Imojuli Yokuqondanisa, Eqinile, noma Enezingqimba.'],
    },
    {
      heading: 'Imibala',
      paragraphs: ['Ingaphambili: Umbala wamamojula e-QR. Umnyama (#000000) ujwayelekile kodwa noma yimuphi umbala omnyama uyasebenza.', 'Ingemuva: Umbala wangemuva. Okumhlophe (#ffffff) kuyinto ejwayelekile. Qinisekisa ukuthi umehluko owanele nengaphambili.', 'Ingemuva Elicacile: Susa ingemuva ngokuphelele ukuze lisetshenziswe ezindaweni ezinemibala. Qinisekisa ukuthi ubuso bunikeza umehluko owanele.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Usayizi Wemodyuli kanye Nesikhala',
      paragraphs: ['Usayizi Wemodyuli: Ilawula ukuthi imodyuli ngayinye iboniswa kangakanani ngamaphikseli. Amanani amakhulu adala amakhodi amakhulu, okulula ukuwaskena.', 'Isikhala Semodyuli: Ingeza isikhala phakathi kwamamojula njengephesenti. Izikhala ezincane (5-15%) zingathuthukisa ukuskenwa kwezinye izimo kodwa izikhala eziningi zinciphisa ukuthembeka.'],
    },
    {
      heading: 'Izilungiselelo Zokukhipha',
      paragraphs: ['Ifomethi: Khetha ifomethi yakho yokuthumela ngaphandle ngokusekelwe esimweni sokusetshenziswa.'],
      bullets: ['I-PNG: Ifomethi ye-raster engenakulahlekelwa, ilungele ukusetshenziswa okuningi. Ilungele ukuphrinta kanye nedijithali.', 'I-WebP: Ifomethi yesimanje enosayizi abancane bamafayela. Ilungele ukusetshenziswa kwewebhu.', 'I-GIF: Iyadingeka kumakhodi e-QR agqwayiziwe. Isekela ukucaca.', 'I-SVG: Ifomethi yevektha ekala ngokungenamkhawulo. Kuhle kakhulu ekuphrinteni okukhulu noma lapho udinga ukuhlela ikhodi.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' },
      ],
    },
    {
      heading: 'Ubukhulu Bokukhipha',
      paragraphs: ['Ububanzi/Ukuphakama: Setha usayizi wokukhipha ngamaphikseli. Ukuze uphrinte, bala ngokusekelwe ku-DPI (isb., i-300 DPI ku-1 intshi = 300px). Osayizi abakhulu baskena ngokuthembekile kakhulu ebangeni.'],
    },
    {
      heading: 'Izilungiselelo Zezithombe (Ezithuthukisiwe)',
      paragraphs: ['Lawula ukuziphatha kwekhodi ye-QR egqwayizayo:'],
      bullets: ['Isivinini: Izinga lohlaka lwezithombe ngama-millisecond.', 'I-Loop: Izithombe eziqhubekayo noma ezidlalwa kanye kuphela.', 'Ukugxuma: Isiqondiso sezithombe ze-Ping-pong.', 'Qala Uhlaka: Qala izithombe kusuka kuhlaka oluthile.', 'Amafreyimu aphezulu: Nciphisa izinhlaka eziphelele kuzithombe.', 'Isinyathelo Sefreyimu: Yeqa ozimele ukuze uthole izithombe ezisheshayo.', 'Ukuhlanganiswa: Akukho, Ukufiphaza, noma i-Morph phakathi kozimele.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' },
      ],
    },
    {
      heading: 'Izinhlobo Zokuqukethwe (Ezithuthukisiwe)',
      paragraphs: ['Izinga elithuthukisiwe livula amafomethi engeziwe okulayisha:'],
      bullets: [
        'Inombolo Yocingo (ucingo:): Idala isixhumanisi sefoni esingashayelwa.',
        'I-imeyili (i-mailto:): Ivula iklayenti le-imeyili ngesihloko nomzimba ongakukhetha.',
        'I-SMS: Umlayezo wombhalo ogcwaliswe kusengaphambili enombolweni yocingo.',
        'i-vCard: Ikhadi lokuxhumana eligcwele elinegama, inhlangano, ifoni, i-imeyili, ikheli.',
        'I-MeCard: Ifomethi yokuxhumana ehlanganisiwe ethandwa eJapane.',
        'I-BizCard: Ifomethi yekhadi lebhizinisi eliyifa.',
        'Indawo ye-Geo: Izixhumanisi ze-GPS ezivuleka kumamephu.',
        'I-WiFi: Iziqinisekiso zenethiwekhi zokuxhumeka okuzenzakalelayo (i-SSID, iphasiwedi, uhlobo lokuphepha).',
        'Umcimbi Wekhalenda: Ifomethi ye-iCalendar enesihloko, indawo, usuku/isikhathi.',
        'I-RSVP Yomcimbi: Isixhumanisi ekhasini lokubhalisa umcimbi.',
        'Ukubhalisela Ikhalenda: Bhalisela okuphakelayo kwe-ICS/WebCal.',
        'I-URL Yefayela/Idokhumenti: Isixhumanisi esiqondile kumafayela angalandwa.',
        'Isixhumanisi Sesitoreji Samafu: Izixhumanisi ku-Google Drayivu, i-Dropbox, i-OneDrive, njll.',
        'Iphrofayela Yomphakathi: Izixhumanisi ku-LinkedIn, i-Twitter, i-Instagram, njll.',
        'Isixhumanisi Sokuthumela Imiyalezo: I-WhatsApp, i-Telegram, izixhumanisi ezijulile zesignali.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izici Ezithuthukisiwe Zokumboza',
      paragraphs: ['Amakhono engeziwe okumboza:'],
      bullets: ['Ukunqampuna: Nika amandla ukunqampuna ukuze ukhethe isifunda sesikwele sesithombe sakho.', 'I-Halftone: Iphethini yamachashazi esitayela sokuphrinta esijwayelekile esekelwe ekukhanyeni kwesithombe.', 'I-Dithered: Ukuphambuka kokusabalalisa amaphutha ukuze kukhiqizwe kabusha okuningiliziwe.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Amamodi Okuhlanganisa Okumboza (Okuthuthukisiwe)',
      paragraphs: ['Amamodi engeziwe okuhlanganisa ezingeni Elithuthukisiwe:'],
      bullets: ['I-Subpixel: Ihlukanisa imojula ngayinye ibe ama-subpixel ukuze ithole imininingwane ephezulu.', 'Umsindo Oluhlaza okwesibhakabhaka: Isebenzisa ukuphambuka komsindo oluhlaza okwesibhakabhaka kumaphethini angenazo izinto.', 'I-Mosaic: Umphumela osekelwe kuthayela ugcina isakhiwo sesithombe.', 'Ukugcwalisa Igebe: Ibeka isithombe ezikhaleni phakathi kwamamojula.', 'Ukukhanya: Kushintsha usayizi wemojula ngokusekelwe ekukhanyeni kwesithombe.', 'I-Duotone: Imaya isithombe ngemibala emibili ukuze kuqhathaniswe kahle.'],
    },
    {
      heading: 'Ukuqina Kokumboza',
      paragraphs: ['Ilawula ukuthi ukumboza kuyithinta kangakanani ikhodi ye-QR (0-100%). Amanani aphezulu abonisa imininingwane eminingi yesithombe kodwa anganciphisa ukuskenwa. Qala cishe ngo-70% bese ulungisa ngokusekelwe ekuhlolweni.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' }],
    },
    {
      heading: 'Imodi Yombala',
      paragraphs: ['Indlela isithombe sokumboza esicutshungulwa ngayo:'],
      bullets: ['Umbala Ogcwele: Kugcina imibala yesithombe sokuqala.', 'I-Grayscale: Iguqula ibe amathoni amnyama namhlophe.', 'Okumnyama Nomhlophe: Ukuguqulwa kwe-binary okuphambene kakhulu.'],
    },
    {
      heading: 'Amaphethini Okugcina I-Finder',
      paragraphs: ['Uma kuvuliwe, kugcina amaphethini okuthola amakhona amathathu engaguquki ngokumboza. Kunconywa kakhulu ukuskena okuthembekile.'],
    },
    {
      heading: 'Ukucubungula Isithombe Ngaphambi Kokumboza',
      paragraphs: ['Faka izihlungi esithombeni sakho sokumboza ngaphambi kokuhlanganisa. Lokhu kulungiswa kungathuthukisa indlela isithombe esibonakala ngayo kukhodi yokugcina ye-QR.'],
      bullets: ['Ukukhanya (-100 kuya ku-+100): Khanyisa noma wenze isithombe sibe mnyama.', 'Ukuqhathanisa (-100 kuya ku-+100): Khulisa noma wehlise ububanzi bethoni.', 'I-Gamma (0.2 kuya ku-3.0): Ukulungiswa kokukhanya okungekho emgqeni. Amanani angaphansi kuka-1 akhanyisa amathoni aphakathi, ngaphezu kuka-1 awenza abe mnyama.', 'Ukugcwala (-100 kuya ku-+100): Ukuqina kombala. -100 ku-grayscale, +100 kugcwele ngokweqile.', 'Ukushintshashintsha kombala (0-360°): Shintsha yonke imibala uzungeze isondo lombala.', 'Ukufiphaza (0-20px): Nciphisa imininingwane yesithombe.', 'Lola (0-100%): Thuthukisa imiphetho nemininingwane.', 'Ukwenza i-Posterize (amazinga angu-0-16): Nciphisa amazinga ombala ukuze uthole umphumela wephosta.', 'Umphetho (0-255): Guqula ube mnyama/mhlophe ophindwe kabili endaweni yokusika.', 'Ukutholwa Komphetho: Ama-algorithms e-Sobel noma e-Canny ukuze abonise imiphetho kuphela.', 'Guqula: Buyisela emuva yonke imibala.'],
    },
    {
      heading: 'Imodi Yokulingana',
      paragraphs: ['Indlela isithombe esimboziwe esifanelana ngayo nendawo yekhodi ye-QR:'],
      bullets: ['Isembozo: Isithombe sigcwalisa yonke indawo, sinqampuna uma kudingeka.', 'Siqukethe: Isithombe sonke siyabonakala, singase sibe nemingcele.', 'Ukwelula: Isithombe siyaphambuka ukuze sigcwalise kahle.'],
    },
    {
      heading: 'Izinketho Zokuguqula',
      paragraphs: ['Ukujikeleza: Phendula imbozwe ngo-90° increments.', 'Flip X/Y: Faka isibuko esithombeni ngokuvundlile noma ngokuvundlile.'],
    },
    {
      heading: 'Ama-Algorithm Okushintsha',
      paragraphs: ['Ukushintsha kuguqula izithombe zethoni eqhubekayo zibe amaphethini amakhodi e-QR angawamela. Kuyatholakala uma kusetshenziswa izindlela zokuxuba ze-Dithered, Blue Noise, noma i-True Dither.'],
      bullets: [
        'Ukusabalalisa Amaphutha: Isitayela se-Classic Floyd-Steinberg. Kusakaza iphutha le-quantization kumaphikseli angomakhelwane.',
        'Ku-oda (Bayer): Kusebenzisa i-threshold matrix yamaphethini ajwayelekile.',
        'Ichashazi Elihlanganisiwe: Lingisa ukuphrinta kwe-halftone.',
        'I-Void & Cluster: Ukucwilisa okuhleliwe kahle.',
        'Umsindo Oluhlaza okwesibhakabhaka: Iphethini ebukeka ingahleliwe ebukeka kahle.',
        'Umphetho Womsindo Oluhlaza okwesibhakabhaka: Ukucwilisa umphetho ngomsindo oluhlaza okwesibhakabhaka.',
        'Umsindo Omhlophe: Ukucwilisa umphetho ongahleliwe.',
        'Umsindo we-Gaussian/Triangular: Umsindo onezinhlukaniso ezahlukene.',
        'Umsindo Oluhlaza okwesibhakabhaka + Ukusabalalisa Amaphutha: I-Hybrid ehlanganisa zombili izindlela.',
        'Umsindo Oluhlaza okwesibhakabhaka Osesikrinini: Iphethini yomsindo oluhlaza okwesibhakabhaka ofana nesikrini.',
        'Ukubona: Kulinganiswe ukukhanya ukuze kube nemiphumela emihle yokubuka.',
        'Ukuqonda Umphetho: Kugcina imiphetho yesithombe ngesikhathi sokucwilisa umphetho.',
        'Umphetho Oguquguqukayo: Ukucwilisa umphetho ovumelana nendawo.',
        'Umsindo Oluhlaza okwesibhakabhaka Wesikhashana: Kuma-GIF animated, kuyahlukahluka iphethini ngohlaka ngalunye.',
      ],
    },
    {
      heading: 'Ama-Diffusion Kernels',
      paragraphs: ['Uma usebenzisa i-Error Diffusion dithering, khetha ukuthi iphutha lisatshalaliswa kanjani:'],
      bullets: ['Floyd-Steinberg: Ukusabalalisa okuvamile okungu-4-omakhelwane. Ukukhetha okuhle okujwayelekile.', 'Jarvis-Judice-Ninke: 12-omakhelwane, obushelelezi kodwa ohamba kancane.', 'Stucki: Kufana ne-JJN enezisindo ezahlukene.', 'Burkes: I-Simplified JJN, esheshayo.', 'Sierra: Umndeni wama-kernel okulinganisela ikhwalithi nesivinini.', 'Atkinson: Ukusabalalisa okulula, kugcina imininingwane kodwa kungaba yizinhlayiya.'],
    },
    {
      heading: 'Amandla e-Dither',
      paragraphs: ['Ilawula ukuthi kusetshenziswa ukucwilisa okungakanani (0-100%). Amanani aphansi agcina iphethini yokuqala, amanani aphezulu abonisa imininingwane eminingi yesithombe.'],
    },
    {
      heading: 'Izilungiselelo ze-Subpixel',
      paragraphs: ['Uma usebenzisa imodi yokuxuba ye-Subpixel:'],
      bullets: ['Usayizi weGridi: 2×2, 3×3, noma 4×4 ama-subpixel ngemojuli ngayinye. Okuphakeme = imininingwane eyengeziwe.', 'Umthetho Wesikhungo: Okuqinile kudinga i-subpixel ephakathi ukuze ifane nemojuli. Isikhungo se-Halftone sivumela ukuhlukahluka.', 'Umbala Ongathathi hlangothi: Umbala osetshenziselwa ama-subpixel anganqunywanga.', 'Ukweqiwa kwe-Finder: Indlela amaphethini e-finder ahunyushwa ngayo (Aqinile noma Ahlelwe Ngesitayela).'],
    },
    {
      heading: 'Izilungiselelo ze-Halftone',
      paragraphs: ['Uma usebenzisa imodi yokuxuba ye-Halftone:'],
      bullets: ['Usayizi Weseli: Ngemojuli ngayinye noma igridi ye-N×N.', 'Ukuma Kwechashazi: Indilinga, Isikwele, noma Umugqa.', 'Ijika Lokukhanya: Eliqondile, Ijika Eli-S, noma i-Gamma.'],
    },
    {
      heading: 'Imibala ye-Duotone',
      paragraphs: ['Uma usebenzisa imodi yokuxuba ye-Duotone, setha umbala we-Shadow (izindawo ezimnyama) kanye nombala we-Gqamisa (izindawo ezikhanyayo).'],
    },
    {
      heading: 'Izilungiselelo ze-GIF Animation',
      paragraphs: ['Uma usebenzisa ama-GIF overlays agqwayizayo:'],
      bullets: ['Sebenzisa Ukulibaziseka Kwefreyimu: Hlonipha isikhathi sokuqala se-GIF.', 'I-FPS Ephezulu: Nciphisa izinga lohlaka (1-60 fps).', 'Ukuphathwa Kokulahlwa: Hlonipha noma Lula izindlela zokulahla uhlaka.'],
    },
    {
      heading: 'Izinketho Zokunikeza Ezithuthukisiwe',
      paragraphs: ['Izilawuli ezengeziwe zokunikeza:'],
      bullets: ['Imodi Yesikhala: Akukho, Isethi Engaphakathi, I-Stroke, noma Isitayela Sesikhala Esingalungile.', 'I-Corner Radius: Amaphesenti amakhona ajikelezayo amamojula.', 'I-Gradient: Akukho, I-Linear, I-Radial, noma i-Conic gradient kumamojula.', 'Isitayela Sangaphandle/Sangaphakathi Seso: Isitayela esizimele samasongo ephethini ye-finder.', 'Ukujikeleza Kwedothi: Phendukisa amamojula edayimane/amadothi.', 'Isikali Samehlo: Ukulungiswa kosayizi wamaphethini esitholi.', 'Isitayela Sohlaka: Engeza ozimele bokuhlobisa (Uhlaka Oluyindilinga, Isitika, Ithegi).', 'Umbhalo Wohlaka: Engeza umbhalo ofana nokuthi "Scan Me!" kumafreyimu.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Ukufaka ikhodi kwe-QR Okuthuthukisiwe',
      paragraphs: ['Hlela kahle ikhodi ye-QR:'],
      bullets: ['Imodi Yokufaka ikhodi: Okuzenzakalelayo, Izinombolo, I-Alphanumeric, I-Byte/UTF-8, noma i-Kanji.', 'Gcina Indawo Ethule Encane: Qinisekisa okungenani imajini yemojula engu-4.', 'Iphethini Yemaski: Okuzenzakalelayo (okulungile), noma khetha ngokwakho amaphethini 0-7 ukuze ulawule ukusatshalaliswa kwemojuli. Amaphethini ahlukene adala ukubonakala okuhlukile okubonakalayo ngenkathi ebhala ngekhodi idatha efanayo.', 'Ukubhala Izinhlamvu Zezinhlamvu: ISO-8859-1 (okuzenzakalelayo kwe-Latin-1), UTF-8 (i-Unicode egcwele efaka i-emoji), noma i-Shift-JIS (isi-Japanese). Khetha ngokusekelwe ezimfuneko zezinhlamvu zokuqukethwe kwakho.'],
    },
    {
      heading: 'Izinketho Zokukhipha Okuthuthukisiwe',
      paragraphs: ['Izilungiselelo ezengeziwe zokuthumela:'],
      bullets: ['Igama Lefayela: Igama lefayela elenziwe ngokwezifiso lokulanda.', 'Usayizi Wephalethi Ye-GIF: Imibala engu-2-256 ekukhishweni kwe-GIF.', 'I-GIF Quantizer: Ukunciphisa umbala okuphakathi, i-NeuQuant, noma i-Octree.', 'Ukuncipha kwe-GIF: Kuvaliwe, i-Floyd-Steinberg, noma Ku-oda.', 'Umbala Ocacile We-GIF: Setha umbala ukuze ubonakale.', 'I-SVG True Vector: Sebenzisa izindlela esikhundleni se-raster efakiwe.', 'Ukunemba Komumo We-SVG: Ukunikeza indlela ye-Pixel noma Eqondile.', 'I-SVG Embed Raster Overlay: Faka i-overlay njengesithombe esifakiwe.', 'I-Background Override: Phoqelela umbala wangemuva othize ekuphumeni.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izinketho Zokuqinisekisa',
      paragraphs: ['Izilungiselelo zokucubungula kokufaka:'],
      bullets: ['Qinisekisa Okungenayo: Hlola ifomethi yokuqukethwe ngaphambi kokufaka ikhodi.', 'Sika isikhala esimhlophe: Susa izikhala eziholayo/ezilandelanayo.', 'Yenza imigqa emisha ibe yi-Normalise: Guqula zonke iziphetho zomugqa zibe yi-LF.', 'Isivikelo Sobude Obuphezulu: Xwayisa uma okuqukethwe kudlula umthamo we-QR.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Izici Zobungcweti',
      paragraphs: ['Izinga Lobungcweti linezela ama-watermark, imethadatha, izinketho zokwabelana, ukuhlaziywa kokuphepha, amakhodi e-QR okukhokha, kanye nezici zebhizinisi.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'I-Watermark',
      paragraphs: ['Engeza ama-watermark kumakhodi akho e-QR:'],
      bullets: ['Uhlobo: Umbhalo, Isithombe, noma i-Pattern watermark.', 'Isikhundla: Isikhungo, Amakhona, Imiphetho, Ngemuva, noma Indawo Ethule.', 'Ukuvuleka: Ukucaca kwe-Watermark (0-100%).', 'Imodi Yokuhlanganisa: Okuvamile, Ukuphindaphinda, Isikrini, noma Ukuhlanganisa i-Overlay.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'I-Metadata',
      paragraphs: ['Shumeka i-metadata kumafayela athunyelwe:'],
      bullets: ['Isihloko, Umbhali, Ilungelo Lokushicilela, Ilayisensi, Izinkambu Zencazelo.', 'Isikhathi Sokudala: Shumeka isitembu sesikhathi sokukhiqiza.', 'Inani Lokhiye Owenziwe Ngokwezifiso: Engeza amabhangqa e-metadata angahleliwe.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Ukwabelana',
      paragraphs: ['Yabelana ngokulungiselelwa kwekhodi yakho ye-QR:'],
      bullets: ['Isixhumanisi Esiqondile: Dala i-URL engabiwayo ngezilungiselelo zakho zamanje.', 'Shumeka i-HTML: Thola ikhodi yokushumeka yamawebhusayithi.', 'Amapharamitha Okufaka Ikhodi: Faka zonke izilungiselelo ku-URL yokwabelana.', 'Qaphela: Izithombe ezimboziwe ezivela kumafayela endawo azikwazi ukwabiwa nge-URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' },
      ],
    },
    {
      heading: 'Ukuhlaziywa Kokuphepha',
      paragraphs: ['Qinisekisa ukuthi amakhodi e-QR ahlala eskenwa:'],
      bullets: ['Imodi Yokuphepha: Ivaliwe, Ilinganiselwe, noma Izidingo zokuskena Eziqinile.', 'Usayizi Wemojula Omncane: Usayizi wephikseli omncane ngemojula ngayinye.', 'Indawo Ethule Encane: Amamojula amancane we-margin.', 'Izitholi Zokukhiya/Isikhathi/Ukuqondanisa/Ifomethi/Inguqulo: Vikela izakhi ezithile.', 'Ukuqina Okuphezulu Kokunqwabelanisa yi-ECC: Imikhawulo yokuqina okuzenzakalelayo ngokusekelwe ezingeni lokulungisa amaphutha.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' },
      ],
    },
    {
      heading: 'Izinhlobo Zokuqukethwe (Ochwepheshe)',
      paragraphs: ['Izinga lochwepheshe lengeza izinhlobo zokukhokha kanye nokuqukethwe kwebhizinisi:'],
      bullets: ['I-EPC/SEPA (EU): Amakhodi e-QR okudluliselwa ebhange laseYurophu ane-IBAN, i-BIC, inani, ireferensi.', 'I-UPI (India): Isixhumanisi Sezinkokhelo Ezihlanganisiwe ne-VPA, igama lomuntu okhokhelwayo, inani.', 'I-PayNow (Singapore): Inkokhelo esheshayo yaseSingapore ene-UEN noma inombolo yeselula.', 'I-PromptPay (Thailand): Uhlelo lokukhokha lukazwelonke lwaseThailand.', 'PIX (eBrazil): Inkokhelo esheshayo yaseBrazil ngokhiye we-PIX.', 'Amakheli okukhokha e-Crypto: Bitcoin, Ethereum, Litecoin anenani lokuzikhethela.', 'Isixhumanisi Somkhankaso Wokumaketha: Ama-URL anokulandelela okugcwele kwe-UTM (Amathegi Okumaketha).', 'Isixhumanisi Esifushane: Sokusetshenziswa nama-shortener e-URL kumakhodi e-QR aguquguqukayo/angalandelelekayo.', 'Isixhumanisi Sedijithali se-GS1: Ukuhlonza umkhiqizo nge-GTIN, i-serial, i-batch, ukuphelelwa yisikhathi.', 'Isixhumanisi Esijulile Sohlelo Lokusebenza: Izixhumanisi ezijulile zohlelo lokusebenza lwe-iOS/Android ezinezinhlelo ezenziwe ngokwezifiso.', 'Ifomethi Engokwezifiso: Idatha eluhlaza engenakho ukufometha noma ukuqinisekiswa.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Izinkokhelo Ezihlobene Nolimi Kumodi Ethuthukisiwe',
      paragraphs: ['Uma usebenzisa imodi Ethuthukisiwe, i-ANQR ibonisa ngokuzenzakalelayo izindlela zokukhokha ezifanele ulimi lwakho olukhethile. Isibonelo, abasebenzisi baseVietnam babona i-VietQR, abasebenzisi baseThailand babona i-PromptPay, kanti abasebenzisi bolimi lwesiNdiya babona i-UPI ne-BharatQR. Izindlela zokukhokha zomhlaba wonke (i-cryptocurrency, i-PayPal, i-Cash App) ziyatholakala kuzo zonke izilimi. Imodi yobungcweti ivula zonke izindinganiso zokukhokha kungakhathalekile ukuthi ulimi luthini.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izindinganiso Zokukhokha zaseYurophu',
      bullets: ['I-EPC/SEPA (EU): Amakhodi e-QR okudluliselwa ebhange laseYurophu alandela i-EPC QR Code Standard. Isekela i-IBAN, i-BIC (ongakukhetha kwezasekhaya), inani nge-EUR, kanye nezinkomba zokukhokha ezihlelekile noma ezingahlelekile. Isetshenziswa kulo lonke indawo ye-SEPA kufaka phakathi amazwe e-EU kanye neSwitzerland, iNorway, i-Iceland, iLiechtenstein, iMonaco, neSan Marino.', 'I-Swiss QR-bill: Izinga lokukhokha laseSwitzerland lilandela izinkombandlela zokusetshenziswa ze-SIX. Isekela i-CHF ne-EUR, i-QR-Reference (QRR), i-Creditor Reference (ISO 11649), amakheli ahlelekile omkweletisi/okweletayo, kanye nolwazi lwebhili. Kuyadingeka kuma-invoyisi aseSwitzerland kusukela ngo-2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izindinganiso Zokukhokha ZaseNdiya',
      bullets: ['I-UPI (India): Isixhumanisi Sezinkokhelo Ezihlanganisiwe silandela Ukucaciswa Okujulile kwe-NPCI. Sisekela i-VPA (Ikheli Lokukhokha Elibonakalayo), igama lomuntu okhokhelwayo, inani ku-INR, inothi lokuthengiselana, i-ID yokubhekisela, ikhodi yesigaba somthengisi, kanye nemodi yokuthengiselana.', 'I-BharatQR (India): Izindinganiso ze-QR Ezihlanganisiwe ezisekela kokubili izinkokhelo ze-UPI kanye nekhadi. Sihlanganisa i-UPI VPA ne-PAN yekhadi ukuze kuhambisane kahle. Sifaka igama lomthengisi, idolobha, i-MCC, imininingwane ye-GST, kanye nezinombolo ze-invoyisi/izinkomba.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izindinganiso Zokukhokha ZaseNingizimu-mpumalanga ye-Asia',
      bullets: ['I-PayNow (Singapore): Uhlelo lokukhokha okusheshayo lwaseSingapore olusebenzisa ukucaciswa kwe-EMVCo QR nephrofayela ye-SGQR. Sisekela i-UEN (ukubhaliswa kwebhizinisi), inombolo yeselula, noma i-NRIC njengezihlonzi ze-proxy. Sifaka ifulegi lokuhlela inani kanye nosuku lokuphelelwa yisikhathi.', 'I-PromptPay (Thailand): Uhlelo lokukhokha lukazwelonke lwaseThailand lulandela iphrofayela ye-EMV yaseBhange laseThailand. Sisekela inombolo yeselula, i-ID kazwelonke, i-ID yentela, i-ID ye-e-wallet, kanye nenkokhelo yebhili ngezinkambu eziningi zokubhekisela.', 'I-QRIS (Indonesia): Ikhodi Yokuphendula Okusheshayo I-Indonesian Standard. Isilinganiso sokukhokha sikazwelonke esisekelwe ku-EMV esisekela i-ID yomthengisi, i-NMID (i-ID Yomthengisi Kazwelonke), ukuhlukaniswa kwemigomo yomthengisi, kanye nemali yokunethezeka (engaguquki noma iphesenti).', 'I-DuitNow (Malaysia): Uhlelo lokukhokha okusheshayo lwaseMalaysia. Lusekela izinhlobo eziningi ze-proxy ezifaka i-NRIC, iselula, ipasipoti, i-ID yezempi, kanye nezinombolo zokubhalisa kwebhizinisi.', 'I-VietQR (Vietnam): Isilinganiso sokudlulisa phakathi kwamabhange aseVietnam. Kudinga i-BIN yasebhange (ukuhlonza i-NAPAS) kanye nenombolo ye-akhawunti. Lusekela amakhodi amaningi esevisi ezinhlobo ezahlukene zokudlulisa (i-QRPUSH, i-QRIBFTTA, i-QRIBFTTC).', 'I-QR Ph (Philippines): Isilinganiso sokukhokha se-Philippine QR se-InstaPay kanye ne-PESONet. Isebenzisa izinombolo ze-akhawunti ezinokuhlonza komthengisi kwezentengiselwano ze-P2M (umuntu-kuya-kumthengisi).'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izindinganiso Zokukhokha zaseMpumalanga Asia',
      bullets: ['I-TWQR (Taiwan): Isilinganiso sokukhokha se-QR saseTaiwan. Lusekela i-ID yomthengisi, i-ID yentela, kanye namanani e-TWD.', 'HKQR/FPS (Hong Kong): Uhlelo Lokukhokha Olusheshayo lwaseHong Kong Amakhodi e-QR. Isekela i-FPS ID, inombolo yeselula, noma i-imeyili njengezikhombisi zokukhokha. Amanani ku-HKD.', 'JPQR (Japan): Indinganiso yokukhokha yekhodi ye-QR ehlanganisiwe yaseJapan. Isebenzisa i-ID yesitolo ukuhlonza umthengisi ngamanani e-JPY.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Ezinye Izindinganiso Zokukhokha Zesifunda',
      bullets: ['PIX (Brazil): Uhlelo lokukhokha okusheshayo lweBhange Eliphakathi laseBrazil olulandela ukucaciswa kwekhodi ye-BR. Isekela okhiye be-PIX (CPF, CNPJ, i-imeyili, ifoni, noma ukhiye ongahleliwe), igama lomthengisi/idolobha, i-ID yokuthengiselana, kanye namanani e-BRL.', 'I-AusPayNet/NPP PayID (Australia): Uhlelo lwe-PayID Yeplatifomu Yezinkokhelo Ezintsha zase-Australia. Isekela izinhlobo ze-PayID (i-imeyili, iselula, i-ABN, i-ID yenhlangano) noma inombolo ye-akhawunti yendabuko ye-BSB +. Igama lomthengisi liyazikhethela njengoba abakhokhi bebona igama elibhalisiwe ekufuneni kwe-NPP.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izinkokhelo Zemali Yedijithali',
      bullets: ['I-Bitcoin/I-Litecoin (BIP-21): Ama-URI okukhokha e-cryptocurrency ajwayelekile anekheli lesikhwama, inani lokuzikhethela, kanye nelebula. Ahambisana nazo zonke izikhwama ezinkulu ze-Bitcoin ne-Litecoin.', 'I-Lightning Network (BOLT11): Ama-invoyisi okukhokha e-Lightning Network. Namathisela uchungechunge lwe-invoyisi olufakwe ikhodi ye-BOLT11 ukuze kukhokhwe i-Bitcoin esheshayo enezindleko ezincane.', 'I-Ethereum (EIP-681): Ama-URI esicelo sokuthengiselana se-Ethereum asekela ukudluliselwa kwe-ETH kwasendaweni kanye nokudluliselwa kwamathokheni e-ERC-20. Kufaka phakathi i-ID yochungechunge lokusekelwa kwenethiwekhi eminingi (i-Mainnet, i-Polygon, i-BSC, i-Arbitrum, i-Optimism, i-Avalanche), amapharamitha egesi, kanye nezingcingo zomsebenzi wenkontileka.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izinsizakalo Zesixhumanisi Sokukhokha',
      bullets: ['I-PayPal.Me: Izixhumanisi zokukhokha ze-PayPal ezinegama lomsebenzisi kanye nenani eligcwaliswe kusengaphambili elizikhethela. Abamukeli bangakhokha ngebhalansi ye-PayPal, amakhadi, noma ama-akhawunti asebhange.', 'I-Cash App: Izixhumanisi zokukhokha ze-Cash App zisebenzisa i-$cashtag enenani lokuzikhethela. Idumile e-United States ngezinkokhelo zontanga.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'I-EMV QR Ejwayelekile',
      bullets: ['I-EMV Ejwayelekile: Dala amakhodi e-QR e-EMV Merchant-Presented Mode ngokwezifiso zezinhlelo zokukhokha ezingafakwanga ohlwini oluqondile. Lungiselela igama lomthengisi, idolobha, ikhodi yezwe (ISO 3166-1), ikhodi yemali (inombolo ye-ISO 4217), i-MCC, izinketho zemali yethiphu/yokulula, kanye nezinkambu zedatha ezengeziwe. Iwusizo ekuhlolweni noma ekuhlanganisweni ngokwezifiso.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Amamodi Okuhlanganisa Okumbozayo (Ochwepheshe)',
      paragraphs: ['Amamodi okuhlanganisa engeziwe ezingeni Lobungcweti:'],
      bullets: ['I-Pixelate: Umphumela wokumboza we-Pixelated.', 'Uhlaka: Ukumboza kokuthola umphetho okubonisa ama-contour kuphela.', 'I-Wave: Umphumela wokuhlanekezela we-Wavy.', 'Usayizi we-Subpixel: Usayizi we-subpixel oguquguqukayo osuselwa esithombeni.', 'I-True Dither: Ukucwilisa okuthuthukisiwe ngokukhetha okuhleliwe kwe-matrix.', 'Okudlulele: Ukubonakala okuphezulu kwesithombe, kungathinta ukuskena.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izilungiselelo Zokuvikela',
      paragraphs: ['Ukulawula okunezinhlayiya ezincane lapho izakhi ze-QR zivikelekile ekuguqulweni kokumbozwa:'],
      bullets: ['Isikhathi Sokulondoloza: Gcina amaphethini esikhathi engashintshiwe.', 'Ukuqondanisa Kokulondoloza: Gcina amaphethini okuqondanisa engashintshiwe.', 'Ulwazi Lwefomethi Yokuvikela: Amamojula wolwazi lwefomethi Yokuvikela.', 'Ulwazi Lwenguqulo Yokuvikela: Amamojula wolwazi lwenguqulo Yokuvikela.'],
    },
    {
      heading: 'Imodi Yokuqaphela I-ECC',
      paragraphs: ['Isabalalisa ngobuhlakani ukuqina kokumbozwa ngokusekelwe kumthamo wokulungisa amaphutha. Uhlelo luhlaziya ukuthi yimaphi amamojula angashintshwa ngenkathi kugcinwa ukuskena.'],
      bullets: ['Isabelomali Sengozi: Amaphesenti omthamo wokulungisa amaphutha okufanele usetshenziswe (0-100%).', 'Isabelomali esiphezulu = ukumbozwa okubonakalayo kodwa ukuskena okuyingozi.', 'Isabelomali esiphansi = ukuskena okuphephile kodwa ukumbozwa okungabonakali kangako.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izinketho Zokwenza Umdwebo Wobungcweti',
      paragraphs: ['Izilawuli Zokwenza Umdwebo Ezithuthukisiwe:'],
      bullets: ['Izingqimba Ezicwebezelayo: Sebenzisa umdwebo wesithombe onamaphikseli emaphethelweni abukhali emojuli.', 'I-Pixel Snap: Ukulungiswa kwephikseli Yephansi, Eyindilinga, noma Eyesilingi.', 'Imodi Yombala Ngemojuli: Iqinile, Ngokukhanya, Ngesikhundla, Ngokumboza, Ngeqembu.', 'Iphalethi Yombala: Chaza iphalethi yombala ngokwezifiso zokufaka umbala ngemojuli.', 'Isivikelo Sokuqhathanisa: Qinisekisa isilinganiso esincane sokungafani phakathi kwemibala.', 'Isilinganiso Esincane Sokungafani: Imfuneko yokungafani kwesitayela se-WCAG (1:1 kuya ku-21:1).', 'Amamojula Emingcele Engeziwe: Umngcele owengeziwe ngale kwendawo ethule.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izinketho Zokukhipha Zobungcweti',
      paragraphs: ['Izilungiselelo zokuthumela ngaphandle kwebhizinisi:'],
      bullets: ['I-DPI: Setha isinqumo sokuphrinta (72-600 DPI). I-300 DPI enconyelwe ukuphrinta.', 'Faka Indawo Ethule: Shintsha indawo ethule ngobukhulu bokukhipha.', 'Thumela Njengokwengeziwe: Khiqiza i-PDF kanye nefomethi eyinhloko.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Izilungiselelo Zopopayi (Ochwepheshe)',
      paragraphs: ['Izici ezengeziwe zopopayi zobungcweti:'],
      bullets: ['Ukuphuma Kwesikhashana: Kuvaliwe, Umsindo Oluhlaza okwesibhakabhaka, noma Ukufiphaza Okuphephile ngohlaka ngalunye.', 'Iphethini: Akukho, Ukushaya, Amagagasi, Ukuskena, Ukushibilika, noma Imiphumela Yokukhukhuleka.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Ireferensi ye-API',
      paragraphs: ['I-ANQR inikeza i-API eseceleni kweseva yokukhiqiza amakhodi e-QR ngamapharamitha e-URL. Lokhu kulungele ukufaka amakhodi e-QR kumawebhusayithi, ama-imeyili, amadokhumenti, noma imisebenzi ezenzakalelayo ngaphandle kwe-JavaScript eseceleni kweklayenti.', 'I-URL Eyisisekelo: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'example' }],
    },
    {
      heading: 'Amapharamitha Ayisisekelo',
      paragraphs: ['Amapharamitha adingekayo navamile (amagama epharamitha awahunyushwa):'],
      bullets: ['idatha (iyadingeka): Okuqukethwe okufanele kufakwe ikhodi kukhodi ye-QR. I-URL-encode izinhlamvu ezikhethekile.', 'usayizi: Usayizi wesithombe ngama-pixel (okuzenzakalelayo: 400, ubuningi: 2000). Kusetshenziswa uma kungacacisiwe.', 'w, h: Ububanzi bokukhipha kanye nokuphakama ngama-pixel. Idlula ipharamitha yosayizi.', 'ifomethi: Ifomethi yokuphuma - png, webp, noma gif (okuzenzakalelayo: png).', 'ec: Izinga lokulungisa amaphutha - L, M, Q, noma H (okuzenzakalelayo: H).', 'fg: Umbala wangaphambili njenge-hex ngaphandle kwe-# (okuzenzakalelayo: 000000).', 'bg: Umbala wangemuva njenge-hex ngaphandle kwe-# (okuzenzakalelayo: ffffff).', 'okusobala: Setha ku-1 ukuze uthole ingemuva elibonakalayo.', 'umkhawulo: Indawo ethule kumamojula (okuzenzakalelayo: 4).'],
    },
    {
      heading: 'Amapharamitha Okulungisa',
      paragraphs: ['Imodeli kanye nesitayela sephethini:'],
      bullets: ['isitayela: Isitayela semojula - isikwele, esiyindilinga, amachashazi, idayimane, exhunyiwe.', 'isitholi: Isitayela sephethini se-Finder - isikwele, esiyindilinga, indilinga.', 'ukuqondanisa: Isitayela sephethini yokuvumelanisa - isitholi_sokulinganisa, isikwele, esiyindilinga, indilinga.', 'isikhathi: Isitayela sephethini yesikhathi - imojuli_ehambisanayo, eqinile, efinyeziwe.', 'irediyasi: Iphesenti lerediyasi yekona 0-100.', 'isikhala: Iphesenti lesikhala semojuli 0-50.', 'iMode yesikhala: Imodi yesikhala - akukho, isethi engaphakathi, ukushaya, isikhala_esibi.', 'i-eyeOuter, i-eyeInner: Izitayela zamehlo - isikwele, isiyingi, indilinga.', 'i-eyeScale: Iphesenti lesikali samehlo (okuzenzakalelayo: 100).', 'i-gradient: Uhlobo lwe-gradient - akukho, oluqondile, oluqondile, oluyi-conic.', 'i-gradientAngle: I-Gradient angle yama-gradient aqondile.', 'i-gradientStops: I-Gradient iyama njengombala1,pos1,umbala2,pos2,... (isb., ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Amapharamitha Okumboza',
      paragraphs: ['Izinketho zokumboza isithombe (isithombe sokumboza sithathwe ohlangothini lweseva):'],
      bullets: ['img: I-URL yesithombe sokumboza (kumele ifinyeleleke emphakathini).', 'imodi: Imodi yokumboza - isikhungo, i-halftone, i-blend, ukukhanya, i-mosaic, i-dithered, umsindo oluhlaza okwesibhakabhaka, i-subpixel.', 'ukuqina: Ukuqina kokumboza 0-100 (okuzenzakalelayo: 100).', 'i-colorMode: Imodi yombala wokumboza - umbala, i-grayscale, bw.', 'ukulingana: Indlela ukumboza okulingana ngayo - ukumboza, ukuhlanganisa, ukwelula.', 'ukubola: Ukujikeleza kokumboza ngamadigri.', 'flipX, flipY: Setha ku-1 ukuze uphendule ukumboza.', 'keepFinders: Gcina amaphethini okuthola (okuzenzakalelayo: 1).', 'keepTiming, keepAlign: Setha ku-1 ukuze ulondoloze amaphethini okuqondanisa.'],
    },
    {
      heading: 'Amapharamitha Okucubungula Ngaphambili',
      paragraphs: ['Ukucubungula isithombe kusengaphambili kusetshenziswe ku-overlay:'],
      bullets: ['ukukhanya: Ukulungiswa -100 kuya ku-100 (okuzenzakalelayo: 0).', 'umehluko: Ukulungiswa -100 kuya ku-100 (okuzenzakalelayo: 0).', 'i-gamma: Inani 0.1 kuya ku-3 (okuzenzakalelayo: 1).', 'ukugcwala: Ukulungiswa -100 kuya ku-100 (okuzenzakalelayo: 0).', 'umbala: Ukujikeleza kombala ngamadigri.', 'ukufiphaza: Ukufiphaza kumaphikseli.', 'ukucija: Cija inani 0-100.', 'ukucija: Amazinga e-Posterize.', 'umbundu: Umbundu we-Binary 0-255.', 'unqenqema: Ukutholwa komngcele - kuvaliwe, kuthambile, kunamandla.', 'ukuguqula: Setha ku-1 ukuze uguqule imibala.'],
    },
    {
      heading: 'Amapharamitha e-Watermark',
      paragraphs: ['Engeza ama-watermark kumakhodi e-QR akhiqizwe:'],
      bullets: ['wmEn: Setha ku-1 ukuze unike amandla i-watermark.', 'wmKind: Uhlobo lwe-Watermark - umbhalo, isithombe, iphethini.', 'wmText: Umbhalo we-Watermark (ufakwe ikhodi ye-URL).', 'wmImg: I-URL esithombeni se-watermark.', 'wmPos: Isikhundla - isikhungo, amakhona, imiphetho, ngemuva, indawo_ethule.', 'wmOpacity: Opacity 0-100 (okuzenzakalelayo: 50).', 'wmBlend: Imodi yokuhlanganisa - evamile, ukuphindaphinda, isikrini, ukumboza.'],
    },
    {
      heading: 'Amapharamitha e-Animation',
      paragraphs: ['Kokukhipha kwe-GIF egqwayizayo (kudinga ifomethi=i-gif):'],
      bullets: ['i-animPattern: Iphethini ye-Animation - akukho, i-pulse, igagasi, i-scanline, i-shimmer, i-drift, umjikelezo_wombala.', 'Amafreyimu e-anim: Inani lamafreyimu 1-60 (okuzenzakalelayo: 24).', 'i-animSpeed: Ukubambezeleka kwefreyimu kuma-milliseconds 10-1000 (okuzenzakalelayo: 100).', 'i-animSeed: Imbewu engahleliwe ye-animation.', 'ukulula: Ukululaza kwe-animation - okuqondile, ukulula_ngaphakathi, ukulula_ngaphakathi, ukulula_ngaphakathi, ukugxuma.'],
    },
    {
      heading: 'Amapharamitha Okukhipha',
      paragraphs: ['Izinketho zefomethi yokukhipha:'],
      bullets: ['ikhwalithi: Ikhwalithi ye-WebP 0-1 (okuzenzakalelayo: 0.9).', 'i-webpQ: Ikhwalithi ye-WebP 0-100 (okuzenzakalelayo: 90).', 'i-gifImibala: usayizi wephalethi ye-GIF 2-256 (okuzenzakalelayo: 256).', 'i-dpi: I-DPI Yokukhipha ye-PNG (okuzenzakalelayo: 72).', 'i-metaTitle, i-metaAuthor, i-metaCopy, i-metaDesc: Izinkambu ze-metadata ze-PNG.'],
    },
    // Crop Parameters
    {
      heading: 'Nqampuna Amapharamitha',
      paragraphs: ['Izinketho zokunqampuna imbondela yesithombe:'],
      bullets: ['CropEn: Nika amandla ukunqampuna kwembondela 0/1 (okuzenzakalelayo: 0).', 'CropX: Isikhungo sokusika X njengengxenye 0-1 (okuzenzakalelayo: 0.5).', 'CropY: Isikhungo sokusika Y njengengxenye 0-1 (okuzenzakalelayo: 0.5).', 'CropSize: Usayizi wenqampuna njengengxenye yesithombe 0-1 (okuzenzakalelayo: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Amapharamitha wokukhiya ukuphepha',
      paragraphs: ['Lawula ukuthi yiziphi izici ze-QR ezivikelekile ekulungisweni kwembondela:'],
      bullets: ['lockF: Khiya amaphethini esitholi 0/1 (okuzenzakalelayo: 1).', 'lockT: Khiya amaphethini wesikhathi 0/1 (okuzenzakalelayo: 1).', 'lockA: Amaphethini okuqondanisa nokukhiya 0/1 (okuzenzakalelayo: 1).', 'I-lockFmt: Ulwazi lwefomethi yokukhiya 0/1 (okuzenzakalelayo: 1).', 'I-lockV: Ulwazi lwenguqulo yokukhiya 0/1 (okuzenzakalelayo: 1).', 'Imodi ephephile: Imodi yokuphepha - icishiwe, ibhalansile, iqinile (okuzenzakalelayo: kuvaliwe).', 'I-safeMinPx: Ubuncane bosayizi wemojuli ngamaphikseli (okuzenzakalelayo: 2).', 'I-safeMinQz: Amamojula amancane wendawo ethulile (okuzenzakalelayo: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Ukushuna Okuzenzakalelayo Amapharamitha',
      paragraphs: ['Izilungiselelo zokuthuthukisa okuzenzakalelayo:'],
      bullets: ['I-autoVer: Khetha ngokuzenzakalelayo inguqulo ye-QR engu-0/1 (okuzenzakalelayo: 1).', 'i-autoEcc: Khetha ngokuzenzakalelayo izinga le-ECC 0/1 (okuzenzakalelayo: 0) - iseluleko sohlangothi lweseva kuphela.', 'Nciphisa ngokuzenzakalelayo: [CLIENT-KUPHELA] Nciphisa ngokuzenzakalelayo ukuqina uze uskeneke - kudinga iluphu yokuqinisekisa yokuskena.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Amapharamitha Opopayi Engeziwe',
      paragraphs: ['Izilawuli ezinwetshiwe zokugqwayiza zokukhishwa kwe-GIF:'],
      bullets: ['iluphu: Amalophu opopayi ngokuqhubekayo 0/1 (okuzenzakalelayo: 1).', 'bounce: isiqondiso sopopayi se-Ping-pong 0/1 (okuzenzakalelayo: 0).', 'hlehla: Dlala opopayi ngokuhlehla 0/1 (okuzenzakalelayo: 0).', 'colorCycle: Nika amandla umphumela wamabhayisikili wombala 0/1 (okuzenzakalelayo: 0).', 'interp: Ukuhumusha kohlaka - none, crossfade, morph (okuzenzakalelayo: akukho).', 'i-tempDither: I-dithering yesikhashana - icishiwe, umsindo_oluhlaza okwesibhakabhaka, i-flicker_safe (okuzenzakalelayo: kuvaliwe).', 'startF: Uhlaka lokuqalisa lokugqwayiza (okuzenzakalelayo: 0).', 'maxF: Ubuningi bozimele okufanele bunikezwe (okuzenzakalelayo: 0 = okuzenzakalelayo).', 'stepF: Isikhawu sesinyathelo sohlaka (okuzenzakalelayo: 1).', 'i-jitter: [CLIENT-ONLY] I-jitter yemojuli ngamaphikseli - idinga ukuvuselelwa kwe-QR yozimele ngamunye.'],
    },
    // Dithering Parameters
    {
      heading: 'I-Dithering Parameters',
      paragraphs: ['Lawula ama-algorithms e-dithering okucubungula imbondela:'],
      bullets: ['ditherKind: Dither algorithm - error_diffusion, ordered_bayer, blue_noise, njll (okuzenzakalelayo: ordered_bayer).', 'diffusionKernel: Iphutha lokusabalalisa i-kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (okuzenzakalelayo: floyd_steinberg).', 'I-ditherAmandla: I-Dither intensity 0-100 (okuzenzakalelayo: 50).', 'inyoka: I-Serpentine dithering 0/1 (okuzenzakalelayo: 0).', 'i-matrix: I-oda le-matrix ye-dither - i-bayer2, i-bayer4, i-bayer8 (okuzenzakalelayo: i-bayer4).', 'bnTile: Usayizi wethayela eliluhlaza okwesibhakabhaka (okuzenzakalelayo: 64).', 'I-bnSeed: Imbewu engahleliwe yomsindo oluhlaza okwesibhakabhaka (okuzenzakalelayo: 0).', 'colorDither: Color Dithering - akukho, per_channel, perceptual (okuzenzakalelayo: akukho).'],
    },
    // Subpixel Parameters
    {
      heading: 'Amapharamitha e-Subpixel',
      paragraphs: ['Izilungiselelo zemodi yokuhlanganisa i-subpixel:'],
      bullets: ['I-spGrid: Usayizi wegridi ye-Subpixel - 2x2, 3x3, 4x4 (okuzenzakalelayo: 3x3).', 'I-spCenter: Umthetho wesikhungo - uqinile, i-halftone_center (okuzenzakalelayo: okuqinile).', 'spOkumaphakathi: I-hex yombala omaphakathi ngaphandle kwe-# (okuzenzakalelayo: 808080).', 'spFinder: Finder override - okuqinile, isitayela (okuzenzakalelayo: okuqinile).'],
    },
    // Halftone Parameters
    {
      heading: 'Amapharamitha we-Halftone',
      paragraphs: ['Izilungiselelo zemodi ye-halftone blend:'],
      bullets: ['I-htCell: Usayizi weseli ye-Halftone - per_module noma igridi ye-nxn (okuzenzakalelayo: imojula ngayinye).', 'I-htDot: Isimo sechashazi - indilinga, isikwele, umugqa (okuzenzakalelayo: indilinga).', 'I-htCurve: Ijika lokukhanya - linear, s-curve, gamma (okuzenzakalelayo: umugqa).', 'i-duo1: i-hex yombala wesithunzi se-Duotone ngaphandle kwe-# (okuzenzakalelayo: 000000).', 'I-duo2: I-Duotone igqamisa i-hex yombala ngaphandle kwe-# (okuzenzakalelayo: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'I-ECC-Aware Mode Parameters',
      paragraphs: ['Ukusabalalisa imbondela ehlakaniphile ngokusekelwe kumthamo wokulungisa iphutha:'],
      bullets: ['I-eccAware: Nika amandla imodi ye-ECC-aware 0/1 (okuzenzakalelayo: 0).', 'I-eccRisk: Iphesenti lesabelomali sobungozi 0-100 (okuzenzakalelayo: 50).', 'I-eccMap: Imephu yesisindo - ibanga_to_finders, i-block_heatmap, i-empirical_scan_heatmap (okuzenzakalelayo: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Amapharamitha ozimele',
      paragraphs: ['Izilungiselelo zozimele zokuhlobisa:'],
      bullets: ['ifreyimu: Isitayela sozimele - akukho, uzimele_oyindilinga, isitika, ithegi (okuzenzakalelayo: akukho).', 'frameText: Umbhalo ozoboniswa kuhlaka (URL ifakwe ikhodi).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Amapharamitha Wombala Wemojuli ngayinye',
      paragraphs: ['Izinketho zokufaka umbala zemojuli ngayinye:'],
      bullets: ['I-modColor: Imodi yombala - okuqinile, ngoku_brightness, by_position, by_overlay, by_cluster (okuzenzakalelayo: okuqinile).', 'cGada: Qhathanisa unogada 0/1 (okuzenzakalelayo: 0).', 'minUkugqama: Isilinganiso esincane sokungafani 1-21 (okuzenzakalelayo: 4.5).', 'iphalethi: Imibala ye-hex ehlukaniswe ngokhefana yemodi yephalethi.', 'I-paletteMode: Ukusabalalisa kwephalethi - indawo, ukukhanya, i-diagonal, i-radial, okungahleliwe, umugqa, ikholomu (okuzenzakalelayo: isikhundla).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'Amapharamitha wokumbondela we-GIF',
      paragraphs: ['Izilungiselelo zezithombe ezimboziwe ze-GIF:'],
      bullets: ['I-ovType: Uhlobo lwembondela - static, gif, apng, webp_anim, ividiyo (okuzenzakalelayo: static).', 'I-ovFramePick: Ukukhetha kozimele - konke, konke, konke_kozimele, umkhawulo_wesikhathi (okuzenzakalelayo: konke).', 'Ukubambezeleka kwe-gif: Sebenzisa ukubambezeleka kozimele we-GIF yasekuqaleni 0/1 (okuzenzakalelayo: 1).', 'I-gifDispH: Ukuphathwa kokulahlwa kwe-GIF - inhlonipho, yenza lula (okuzenzakalelayo: inhlonipho).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Imikhawulo ye-Per-ECC Intensity',
      paragraphs: ['Ubukhulu bembondela yezinga ngalinye lokulungiswa kwephutha:'],
      bullets: ['maxIntL: Ukuqina okukhulu kwe-ECC L 0-100 (okuzenzakalelayo: 100).', 'maxIntM: Ukuqina okukhulu kwe-ECC M 0-100 (okuzenzakalelayo: 100).', 'maxIntQ: Ukuqina okukhulu kwe-ECC Q 0-100 (okuzenzakalelayo: 100).', 'maxIntH: Ukuqina okukhulu kwe-ECC H 0-100 (okuzenzakalelayo: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'I-QA Simulation Parameters (Iklayenti-kuphela)',
      paragraphs: ['Lawa mapharamitha acutshungulwa ukuhambisana kwe-URL kodwa asebenza kuphela kusiphequluli:'],
      bullets: ['qaContrast: Nika amandla ukuhlola kokugqama 0/1 - kudinga ukuqinisekiswa okusebenzisanayo.', 'qaBlur: Lingisa ukufiphala ngamaphikseli - ngokuhlolwa okusebenzisanayo kuphela.', 'qaNoise: Lingisa izinga lomsindo - ukuhlola okusebenzisanayo kuphela.', 'qaHeatmap: Bonisa imephu yokushisa efundekayo 0/1 - idinga i-UI yembondela yekhanvasi.'],
    },
    // Client-Only Parameters
    {
      heading: 'Amapharamitha eklayenti kuphela',
      paragraphs: ['Iningi lamapharamitha e-API asekelwa ngokugcwele ohlangothini lweseva. Amapharamitha amakwe [CLIENT-ONLY] acutshungulwa ukuhambisana kwe-URL kodwa adinga izici zesiphequluli:'],
      bullets: ['i-jitter: I-jitter yemojuli idinga ukuvuselelwa kwe-QR yozimele ngamunye ngokungahleliwe.', 'Nciphisa ngokuzenzakalelayo: Ukunciphisa ngokuzenzakalela ukuqina kudinga ukuhlolwa okuphindaphindayo kokuskena.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: Ukulingiswa kwe-QA kudinga ukuqinisekiswa okusebenzisanayo kwekhanvasi.'],
    },
    // Additional Output Parameters
    {
      heading: 'Amapharamitha Wokukhipha Engeziwe',
      paragraphs: ['Izilungiselelo ezinwetshiwe zokukhiphayo nezokuthumela:'],
      bullets: ['fname: Igama lefayela langokwezifiso lokulanda (okuzenzakalelayo: anqr-qrcode).', 'inclQz: Faka indawo ethule kubukhulu bokuphumayo 0/1 (okuzenzakalelayo: 1).', 'bgOver: Umbala wangemuva ubhala ngaphezulu i-hex ngaphandle kwe-# (ikhipha ipharamitha ye-bg).', 'fmtExtra: Okukhiphayo kwefomethi eyengeziwe - akukho, eps, animated_webp (okuzenzakalelayo: akukho). Qaphela: i-eps ithi [INGXENYE].', 'svgPrec: Ukunemba komumo we-SVG - pixel, enembile (okuzenzakalelayo: pixel). [INGXENYE] Uhlangothi lweseva olukhawulelwe okukhiphayo kwe-SVG.', 'svgShumeka: Shumeka imbondela ye-raster ku-SVG 0/1 (okuzenzakalelayo: 1). [INGXENYE] Uhlangothi lweseva olukhawulelwe okukhiphayo kwe-SVG.', 'I-modulePx: Usayizi we-pixel yemojuli (okuzenzakalelayo: kubalwa ngokuzenzakalelayo ukusuka kusayizi).', 'umngcele: Amamojula emingcele engeziwe ngale kwendawo ethulile (okuzenzakalelayo: 0).', 'crisp: Nika amandla ukunikezwa kwesithombe esicacile/esinephikiseli 0/1 (okuzenzakalelayo: 1).', 'i-snap: Imodi ye-Pixel snap - phansi, nxazonke, isilingi (okuzenzakalelayo: phansi).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Amapharamitha Wokulondoloza Iphethini',
      paragraphs: ['Lawula ukuthi yiziphi izici zesakhiwo ezivikelekile ekumbondeleni:'],
      bullets: ['KeepFinders: Gcina amaphethini okuthola 0/1 (okuzenzakalelayo: 1).', 'GcinaIsikhathi: Londoloza amaphethini wesikhathi 0/1 (okuzenzakalelayo: 0).', 'keepAlign: Londoloza amaphethini okuqondanisa 0/1 (okuzenzakalelayo: 0).', 'protectFmt: Vikela ifomethi yolwazi lwamamojula 0/1 (okuzenzakalelayo: 0).', 'protectVer: Vikela inguqulo yolwazi lwamamojula 0/1 (okuzenzakalelayo: 0).'],
    },
    {
      heading: 'Ukusetshenziswa Kwesibonelo',
      paragraphs: ['Ikhodi ye-QR eyisisekelo:', 'https://anqr.link/api/qr?data=https://example.com', 'Ikhodi ye-QR enesitayela enemibala yangokwezifiso:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'Ikhodi ye-QR enesithombe esimboziwe:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'I-GIF Egqwayizayo:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'example' }],
    },
    {
      heading: 'Ukushumeka Amakhodi e-QR',
      paragraphs: ['Kumodi yobungcweti, isici sokwabelana sikhiqiza i-HTML nama-URL ashumekayo. Nansi indlela ukushumeka okusebenza ngayo:'],
      bullets: ['Isixhumanisi sokwabelana: Sidala i-URL kuhlelo lokusebenza lwe-ANQR nazo zonke izilungiselelo zakho ezifakwe njengemingcele ye-URL. Abamukeli bangabuka futhi bashintshe ikhodi ye-QR.', 'Ukushumeka Isithombe: Sidala ithegi ekhomba ku-API yeseva. Ikhodi ye-QR ihunyushwe njengeseva futhi isetshenziswa njengesithombe.', 'Ukushumeka Ukushumeka: Kudala i-syntax yesithombe se-Markdown yamadokhumenti namafayela e-README.', 'I-URL ye-API eqondile: I-URL ye-API eluhlaza yokusetshenziswa kuzinhlelo zokusebenza, izikripthi, noma okunye ukuhlanganiswa.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
    {
      heading: 'Isibonelo se-HTML',
      paragraphs: ['Ukushumeka ikhodi ye-QR kuwebhusayithi yakho:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" ; alt="QR Code" />', 'Ukuze uthole usayizi ophendulayo:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" ; alt="QR Code" style="max-width: 100%; height: auto;" />', 'Iseva igcina izimpendulo ngama-header e-cache amade, ngakho-ke izicelo eziphindaphindwayo ze-URL efanayo ziyashesha.'],
    },
    {
      heading: 'Yabelana ngefomethi ye-URL',
      paragraphs: ['Uma uchofoza ukuthi Yabelana ngemodi yobungcweti, i-ANQR ifaka amasethingi akho amanje kumapharamitha e-URL. Ifomethi ithi:', 'https://anqr.link/?data=...&ec=H&style=rounded& ;....', 'Lezi pharamitha ziveza ipharamitha ye-API, ngakho-ke ungaguqula i-URL yokwabelana ibe yi-URL ye-API ngokushintsha indlela eyisisekelo kusuka ku-/ kuya ku-/api/qr bese ulungisa ipharamitha ye-w/h njengoba kudingeka.', 'Qaphela: Izithombe ezimboziwe ezilayishwe kumafayela endawo azikwazi ukwabiwa nge-URL - kuphela ukumbozwa okusekelwe ku-URL (ipharamitha ye-img) okusebenza kuzixhumanisi ezabiwe kanye nezingcingo ze-API.'],
    },
    {
      heading: 'Imikhawulo Yezinga Nokusetshenziswa',
      paragraphs: ['I-API imahhala ukuyisebenzisa ukuze kube namavolumu afanele. Ukuze kusetshenziswe kakhulu noma kuzinhlelo zokusebenza zezentengiselwano ezidinga isikhathi esiqinisekisiwe sokusebenza, sicela usithinte.', 'Izimpendulo ze-API zifaka phakathi ama-header e-caching anolaka. Ukuze uthole ukusebenza okuhle kakhulu, izimpendulo ze-cache ohlangothini lwakho noma usebenzise i-URL efanayo njalo kumakhodi e-QR afanayo.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Imikhuba Emihle Kakhulu',
      paragraphs: ['Landela lezi ziqondiso zamakhodi e-QR athembekile:'],
      bullets: ['Hlola njalo amakhodi akho e-QR ngezinhlelo zokusebenza eziningi zokuskena ngaphambi kokuphrinta.', 'Sebenzisa Ukulungiswa Kwephutha H (Okuphezulu) lapho ungeza ukunqwabelanisa.', 'Gcina okungenani amamojula angu-4 endawo ethule (umkhawulo).', 'Qinisekisa umehluko omkhulu phakathi kwendawo engaphambili nengemuva.', 'Ukuphrinta, sebenzisa okungenani i-300 DPI bese uhlola ngosayizi wokuphrinta wangempela.', 'Nika amandla i-Preserve Finder Patterns uma usebenzisa ukunqwabelanisa.', 'Qala ngamandla okunqwabelanisa aphansi bese wanda kancane kancane.', 'Ukusetshenziswa kwangaphandle, cabanga ngosayizi omkhulu wemojula kanye nokulungiswa kwamaphutha okuphezulu.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Dlulisa amehlo Funda izihloko', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'example' },
      ],
    },
    {
      heading: 'Ukuxazulula izinkinga',
      paragraphs: ['Izinkinga ezivamile kanye nezixazululo:'],
      bullets: ['I-QR ngeke iskene: Nciphisa ubukhulu be-overlay, khulisa ukulungiswa kwamaphutha, hlola ukuqhathanisa.', 'Ikhodi inkulu kakhulu: Nciphisa ubude bokuqukethwe, sebenzisa isifinyezo se-URL, inguqulo ephansi.', 'Ukuphuma okufiphele: Khulisa usayizi wemojula, sebenzisa i-PNG esikhundleni samafomethi acindezelwe.', 'Imibala ayibonakali kahle: Hlola ukuqhathanisa kombala, zama imodi ye-grayscale overlay.', 'I-GIF ayigqwayizi: Qinisekisa ukuthi usebenzisa ukukhiqizwa kwefomethi ye-GIF, hlola inani lozimele.', 'Ukumbozwa kwesithombe akulayishi: Hlola izimvume ze-CORS ezithombeni ezikude.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Bona iziqondiso nezibonelo ezihlobene', type: 'learn' }],
    },
    {
      heading: 'Izinqamuleli zekhibhodi',
      paragraphs: ['I-ANQR isekela izinqamuleli zekhibhodi ezijwayelekile. Sebenzisa i-Ctrl/Cmd+S ukuze uqale ukuthumela ngaphandle (uma kugxilwe ekubukeni kuqala).'],
    },
    {
      heading: 'Ukwabelana Nokushumeka',
      paragraphs: ['Kumodi yobungcweti, chofoza inkinobho ethi Yabelana ukuze ukopishe i-URL ngezilungiselelo zakho zamanje. Abamukeli bangavula le URL ukuze babone ukucushwa kwakho okuqondile. Qaphela: Izithombe ezimboziwe ezivela kumafayela endawo azikwazi ukwabiwa nge-URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Zama lokhu kulungiselelwa ngqo kujeneretha ye-ANQR.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Dlulisa amehlo Funda izihloko', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Buka izibonelo ze-QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Vula ijenereyitha', type: 'generator' },
  ],
};

export default guide;
