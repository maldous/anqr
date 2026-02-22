import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Patnubay ng ANQR User',
  description: 'Kumpletong gabay sa paggamit ng ANQR para sa paglikha ng mga QR code.',
  lastUpdated: '1 Pebrero 2026',
  breadcrumb: ['Patnubay'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buksan ang generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Browse Matuto ng mga artikulo', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Tingnan ang mga halimbawa ng QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Pagsisimula',
      paragraphs: [
        'Ang ANQR ay isang generator ng QR code na may diskarte na una sa kliyente. Bilang default, lokal na nabuo ang mga QR code sa iyong browser - walang kinakailangang account at mananatiling pribado ang iyong data. Para sa propesyonal na pag-embed, maaari mo ring gamitin ang server-side API.',
        'Ang interface ay may tatlong interface na antas: Basic, Advanced, at Professional. Pumili ng level gamit ang tabs sa header. Ang bawat antas ay nagbubukas ng karagdagang mga bahagi samantalang pinananatiling nakatuon ang anyo sa kung ano ang kailangan mo.',
      ],
      bullets: [
        'Pangunahin: Simpleng paglikha ng QR code na may payak na nilalamang teksto/URL at balot ng imahen.',
        'Patiuna: Mga opsyon ng QR, istilo ng pagsasalin, animation, output format, extended content type, at claim customization.',
        'Professional: Watermarks, metadata, pagbabahagi, pagsusuring pangkaligtasan, pagbabayad ng QR code, at mga katangiang pangnegosyo.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Buksan ang generator', type: 'generator' }],
    },
    {
      heading: 'Mabilis na Pasimula',
      paragraphs: ['Upang lumikha ng iyong unang QR code:'],
      bullets: [
        '1. Pumili ng isang nilalamang tipo (URL, teksto, WiFi, atbp.) mula sa Content Type dropdown.',
        '2. Ipasok ang iyong impormasyon sa inilaang mga field.',
        '3. Iangkop sa tamang paraan ang mga kulay, istilo, at kulay.',
        '4. I-click ang I-export upang i-download ang iyong QR code bilang PNG, GIF, WebP, o SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Pangunahing mga Katangian',
      paragraphs: [
        'Ang Basic level ay nagbibigay ng streamlined interface para sa paglikha ng mga QR code na may nilalamang payload at mga balot ng imahe. Ito ang pinakasimpleng paraan upang magsimula.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Nasisiyahang mga Uri (Basiko)',
      paragraphs: [
        'Plain Text: I - encode ang anumang teksto hanggang sa QR code capacity limit. Huwaran para sa maiikling mensahe, kodigo, o mga tagatukoy.',
        'URL: Encode web addresss. Ang QR code ay magbubukas ng URL kapag sinuri. Mga suporta http:// at https://protocols.',
      ],
    },
    {
      heading: 'Image Overlay (Basiko)',
      paragraphs: [
        'I-upload ang isang imahe (JPG, PNG, GIF, WebP) upang bumagay sa iyong QR code. Kabilang sa pangunahing mga bahagi nito ang:',
      ],
      bullets: [
        'Itaas mula sa talaksan: Pumili ng larawan mula sa iyong aparato.',
        'Pasan mula sa URL: Ipasok ang isang imaheng URL (kailangang payagan ang CORS).',
        'Gitnang Logo: Naglalagay ng larawan sa gitna, umaasa sa maling pagtutuwid.',
        'Bend: Simpleng alpha pagsanib ng imahe sa QR pattern.',
        'Intensidad: Kumokontrol kung gaano kahigpit naaapektuhan ng balot ang QR code (0-100%).',
        'Kulay Mode: Buong Kulay, Grayscale, o Black & White.',
        'Ingatan ang mga Paraan ng Paghahanap: Panatilihing di - masalimuot ang mga disenyo sa kanto para sa maaasahang pagsusuri.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Patiunang mga Katangian',
      paragraphs: [
        'Binubuksan ng Advanced level ang mga opsyon ng QR advancement, mga istilo ng pagsasalin, animation, output format, mga extended content type, at makabagong customization.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Pagsasaayos ng QR',
      paragraphs: [
        'Bersyon: QR Ang mga code ay dumarating sa mga bersyon 1-40, na may mas mataas na mga bersyon na humahawak ng mas maraming datos ngunit mas malaki. Itakda sa 0 (Auto) na hayaang piliin ng ANQR ang pinakamaliit na bersyon na angkop sa iyong nilalaman.',
        'Error habang nagco-convert: Tinitiyak kung gaano kalaking pinsala ang kayang tustusan ng QR code habang nananatiling scannoble.',
      ],
      bullets: [
        'L (Low): 7% error recruiting - pinakamaliit na sukat, hindi gaanong redundancy.',
        'M (Medium): 15% error recruiting - balanseng opsiyon.',
        'Q (Quartile): 25% error rerecruit - good para sa mga nakalimbag na code.',
        'H (High): 30% error recruit - pinakamahusay para sa mga code na may mga balot o sa mga mahihirap na kalagayan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tahimik na Zone (Margin)',
      paragraphs: [
        'Ang tahimik na sona ay ang puting espasyo sa paligid ng QR code. Kailangan ng mga cancanner ang palugit na ito upang malaman kung saan nagsisimula ang kodigo. Inirerekomenda ng pamantayan ang di - kukulangin sa 4 na module. Ang pagbabawas ng mababa sa 4 ay maaaring maging sanhi ng mga isyu sa scanning.',
      ],
    },
    {
      heading: 'Istilo ng Module',
      paragraphs: [
        'Ang mga module ang mga indibiduwal na liwasan na bumubuo sa isang kodigong QR. ANG anQR ay nagbibigay ng limang istilo:',
      ],
      bullets: [
        'Square: Ang klasikong anyo ng QR na may matatalim na sulok.',
        'Nakatalikod: Malambot na mga kanto para sa isang mas palakaibigang tingin.',
        'Dots: Circular modules para sa makabagong kagandahan.',
        'Brilyante: 45° umikot sa mga liwasan para sa isang natatanging disenyo.',
        'Nakakonekta: Nagsasama - sama ang mga module kapag katabi, anupat lumilikha ng organikong mga hugis.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mas Mabisang Istilo ng Uliran',
      paragraphs: [
        'Ang founder pattern ay ang tatlong malalaking parisukat sa mga kanto ng QR na tumutulong sa mga scanner oriente ng code. Makukuhang mga istilo:',
      ],
      bullets: [
        'Square: Mga karaniwang sulok ng liwasan.',
        'Nakatalikod: Pinalambot na mga sulok na katugma ng bilog na istilong module.',
        'Circle: Circular searchs para sa dot-style codes.',
      ],
    },
    {
      heading: 'Aaligntment & Timing Pattern',
      paragraphs: [
        'Ang mga dibuhong alignment ay lumilitaw sa mas malaking mga kodigong QR (bersion 2+) upang makatulong sa pag-tama ng lihis. Tamang - tama ang pagkakasunud - sunod ng mga linya na nag - uugnay ng mga disenyo sa paghanap.',
      ],
      bullets: [
        'Alignment Style: Match Finder, Square, Rounded, o Circle.',
        'Timing Style: Match Module, Solid, o Dashed.',
      ],
    },
    {
      heading: 'Kulay',
      paragraphs: [
        'Paunang dako: Ang kulay ng QR modules. Itim (#00000000) ay pamantayan ngunit anumang madilim na kulay ay gumagana.',
        'Larawan sa likuran: Ang kulay sa likuran. Ang puti (#ffff) ay pamantayan. Tiyakin ang sapat na pagkakaiba sa unahan.',
        'Naiibang Pinagmulan: Alisin ang background para lamang magamit sa mga kulay na ibabaw. Sapat ang pagkakaiba ng ibabaw.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pagdami ng Module at Gap',
      paragraphs: [
        'Laki ng Module: Kinokontrol kung gaano kalaki ang bawat module ay nai-render sa mga pixel. Ang mas malalaking halaga ay lumilikha ng mas malaki, mas madaling i-scan na mga code.',
        'Gulong ng Module: Idinaragdag ang puwang sa pagitan ng mga module bilang isang porsiyento. Ang mga maliliit na puwang (5-15%) ay maaaring mapahusay ang pagiging scannabilidad sa ilang mga kondisyon ngunit ang labis na mga puwang ay nakababawas ng pagkamaaasahan.',
      ],
    },
    {
      heading: 'Mga Pagtatakda ng output',
      paragraphs: ['Format: Pumili ng transport format batay sa case.'],
      bullets: [
        'PNG: Walang kahirap - hirap na format, tamang - tama para sa karamihan ng gamit. Pinakamahusay para sa print at digital.',
        'WebP: Makabagong format na may mas maliliit na sukat ng talaksan. Magaling sa paggamit ng web.',
        'GIF: Kailangan para sa masiglang QR code. Suportahan ang transparency.',
        'SVG: Ang Vector ay nag - aanyo ng mga kaliskis na walang takda. Pinakamabuti para sa malalaking letra o kung kailan kailangan mong baguhin ang kodigo.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Gumawa ng mga Dimensiyon',
      paragraphs: [
        'Width/Hight: Ilagay ang sukat ng output sa mga pixel. Para sa pagkalimbag, kalkulahin batay sa DPI (e.g., 300 DPI sa 1 pulgada = 300px). Ang mas malalaking sukat ay mas madaling makita sa malayo.',
      ],
    },
    {
      heading: 'Mga Pagsasaayos ng Animasyon (Isinilang)',
      paragraphs: ['Supilin ang masiglang pag - uugali ng QR code:'],
      bullets: [
        'Bilis: Asimation frame rate sa milliseconds.',
        'Loop: Continuous o single-play animation.',
        'Bounce: Pasig-pong animation direksiyon.',
        'Magsimula Frame: Magsimulang gumawa ng pagbabago mula sa espesipikong balangkas.',
        'Max Frames: Limitahan ang kabuuang mga frame sa animation.',
        'Frame Step: Ang mga balangkas ng Skip para sa mas mabilis na animation.',
        'Interpolasyon: Wala, Crossfade, o Morph sa pagitan ng mga balangkas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Mga Uri ng Nilalaman',
      paragraphs: ['Ang maunlad na antas ay nagbubukas ng karagdagang mga format ng sahod:'],
      bullets: [
        'Numero ng Telepono (tel:): Gumagawa ng isang tinatawag na link sa telepono.',
        'Email (mail:): Buksan ang kliyente ng email na may opsyonal na paksa at katawan.',
        'SMS: Paunang text message sa numero ng telepono.',
        'vCard: Buong contact card na may pangalan, organisasyon, telepono, email, adres.',
        'MeCard: Compact contact format na popular sa Hapon.',
        'BizCard: Legacy business card formation.',
        'Lokasyon ng Geo: Ang GPS ay nagtutugma na bukas sa mga mapa.',
        'WiFi: Mga kredensyal sa network para sa awtomatikong koneksyon (SSID, password, uri ng seguridad).',
        'Talaksan ng Kalendaryo: iCalendar format na may pamagat, lokasyon, petsa/panahon.',
        'Pangyayari RSVP: Kaugnay ng pahina ng rehistro.',
        'Calendar Subscribe: Mag-subscribe sa isang ICS/WebCal feed.',
        'URL ng File/Dokumento: Direktang link sa mga nada-download na file.',
        'Cloud Storage Link: Mga link sa Google Drive, Dropbox, One Drive, atbp.',
        'Social Profile: Mga link sa LinkedIn, Twitter, Instagram, atbp.',
        'Link sa Pagmemensahe: WhatsApp, Telegram, Mga malalim na link ng signal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Patiunang mga Katangian ng Labis na Pagpapakain',
      paragraphs: ['Karagdagang kakayahan sa pagbalot:'],
      bullets: [
        'Bunga: Mahilig mag - ani upang piliin ang isang parisukat na rehiyon na iyong larawan.',
        'Halftone: Classic print-style dot pattern batay sa imahe ningning.',
        'Hinango: Error-difision dithering para sa detalyadong reproduksiyon.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overlay Blund Modes (Isinilang)',
      paragraphs: ['Karagdagang mga paraan ng pagtutugma sa Advanced level:'],
      bullets: [
        'Subpixel: Hinati ang bawat module sa mga subpixel para sa mas mataas na detalye.',
        'Ingay: Ginagamit ang blue na ingay dithering para sa mga pattern-free.',
        'Mosaic: Tule-based effect na nag-iingat ng istraktura ng imahe.',
        'Gulong: Naglalagay ng mga puwang sa pagitan ng mga module.',
        'Kaliwanagan: Ang sukat ng Varies module batay sa liwanag ng larawan.',
        'Duotone: Ang mga mapa ay lumalarawan sa dalawang kulay para sa malaking pagkakaiba.',
      ],
    },
    {
      heading: 'Labis na Kasiyahan',
      paragraphs: [
        'Kumokontrol kung gaano kalakas ang epekto ng balot sa QR code (0-100%). Ang mas mataas na mga pamantayan ay nagpapakita ng mas maraming detalye ng larawan subalit maaaring bawasan nito ang pagiging madaling ma - scan. Magsimula sa paligid ng 70% at makibagay batay sa pagsubok.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Kulay na Mode',
      paragraphs: ['Kung paano pinoproseso ang larawan sa balot:'],
      bullets: [
        'Buong Kulay: Iniingatan ang orihinal na mga kulay ng larawan.',
        'Grayscale: Mga nakumberte sa itim at puting tono.',
        'Itim & Puti: Malaking pagkakaiba sa transbersiyong binary.',
      ],
    },
    {
      heading: 'Ingatan ang mga Paraan ng Paghahanap',
      paragraphs: [
        'Kapag nagawa ito, panatilihing di - nahuhubog ng balot ang tatlong disenyo sa kanto. Matinding inirekomenda para sa maaasahang pagsusuri.',
      ],
    },
    {
      heading: 'Pagproseso ng Larawan',
      paragraphs: [
        'Pahiran ng mga filter ang iyong larawan bago ihalo. Ang mga pagbabagong ito ay magpapabuti kung paano lumilitaw ang imahe sa huling QR code.',
      ],
      bullets: [
        'Kaliwanagan (-100 hanggang +100): Palawan o padilimin ang imahe.',
        'Kaibahan (-100 hanggang +100): Pagdami o pagbaba ng tono ng katawan.',
        'Gamma (0.2 hanggang 3.0): Di-linear threature adjustment. Mga pamantayang mababa sa 1 magaang na midtones, sa itaas ng 1 ay pinadilim ang mga ito.',
        'Saturasyon (-100 hanggang +100): Kulay intensidad. -100 ay grayscale, +100 ay labis sa saturated.',
        'Hue Rotate (0-360°): Pabagu - bago ang lahat ng kulay sa palibot ng color wheel.',
        'Blur (0-20px): Palambutin ang mga detalye ng larawan.',
        'Sharpen (0-100%): Mga gilid ng Enhance at detalye.',
        'Posterize (0-16 antas): Bawasan ang antas ng kulay para sa isang poster effect.',
        'Threshold (0-255): Komberte sa binaryong itim/puti sa cutoff point.',
        'Edge Diagnosis: Sobel o Canny algorithms upang ipakita lamang ang mga gilid.',
        'Invert: Baligtarin ang lahat ng kulay.',
      ],
    },
    {
      heading: 'Mabuting Mode',
      paragraphs: ['Kung paano angkop ang larawan sa balot ng QR code area:'],
      bullets: [
        'Pabalat: Ang larawan ay pumupuno sa buong lugar, pananim kung kinakailangan.',
        'Suot: Ang buong larawan ay nakikita, maaaring may mga gilid.',
        'Pang - ibabaw: Pinipilipit ng larawan na eksaktong punan.',
      ],
    },
    {
      heading: 'Option ng Pagbabago',
      paragraphs: [
        'Rotation: Palaputin sa 90° increments.',
        'Flip X/Y: Isalamin ang larawan nang pahalang o patayo.',
      ],
    },
    {
      heading: 'Paglubog ng Algorithms',
      paragraphs: [
        'Ang pagdididiverse ng mga kumplikado ay patuloy na nagreresulta ng mga imahe sa mga padron na maaaring katawanin ng QR code. Makukuha kapag gumagamit ng Dithered, Blue Noise, o True Dither blender modes.',
      ],
      bullets: [
        'Error sa pagbigkas: Klasikong Floryd-Steinberg style. Nagkakalat ng pagkakamaling quanization sa mga katabing pixel.',
        'Iniutos (Bayer): Gumamit ng panimulang silid para sa regular na mga huwaran.',
        'Clustered Dot: Simulates kalahatingtone printing.',
        'Void & Cluster: Inutos ni Optimized ang dithering.',
        'Asul Noise: Nakikitang kaaya-ayang pasumala-tanaw na padron.',
        'Ingay ng Blue Hawak: Hawak - hawak ang ingay na asul.',
        'White Noise: Ang Random ay nagsisimula sa pagbuka.',
        "Gaussian/Tagalog Ingay: Ingay na may iba't ibang pamamahagi.",
        'Blue Noise + Error Difision: Hybrid Pagsasama ng dalawang pamamaraan.',
        'Screened Blue Noise: Screen-tulad ng asul na ingay pattern.',
        'Perceptual: Luminance-weighted para sa mas mabuting mga resulta sa paningin.',
        'Edge-Aware: Pinananatili ang mga gilid ng imahe sa panahon ng dithering.',
        'Madaling Ibagay: Locally-adaptive starting.',
        'Temporal Blue Noise: Para sa masiglang GIFs, iba - iba ang disenyo ng bawat balangkas.',
      ],
    },
    {
      heading: 'Mga Kernel ng Difision',
      paragraphs: [
        'Kapag gumagamit ng Error Difision dithering, piliin kung paano ipinamamahagi ang error:',
      ],
      bullets: [
        'Floryd-Steinberg: Classic 4-food difusion. Mabuting pangkalahatang pagpili.',
        'Jarvis-Judice-Ninke: 12-kapuwa, mas mabagal ngunit mas mabagal.',
        "Stucki: Katulad ng JJN na may iba't ibang bigat.",
        'Burkes: Pinasimple ang JJN, mas mabilis.',
        'Sierra: Pamilya ng mga butil na bumabalanse sa kalidad at bilis.',
        'Atkinson: Liwanag na diperensiya, ingatan ang detalye subalit maaaring maging butil.',
      ],
    },
    {
      heading: 'Lakas Mula sa Araw',
      paragraphs: [
        'Kumokontrol kung gaano karaming dithering ang nilalapat (0-100%). Ang mas mababang mga halaga ay nag - iingat ng higit sa orihinal na huwaran, ipinakikita ng mas mataas na halaga ang mas maraming detalye ng larawan.',
      ],
    },
    {
      heading: 'Pagtatakda ng Subpixel',
      paragraphs: ['Kapag gumagamit ng Subpixel blead mode:'],
      bullets: [
        'Grid Size: 2×2, 3×3, o 4×4 mga subpixel sa bawat module. Mas mataas = mas detalyado.',
        'Pamamahala sa Gitna: Kailangan ng mahigpit na center subpixel upang pagtugmain ang module. Ang Halftone Center ay nagpapahintulot ng pagbabago.',
        'Neutral na Kulay: Kulay na ginagamit para sa di - tiyak na mga subpixel.',
        'Labis na Pagsusuri: Kung paano isinasalin (Solid o Stylized) ang mga parisang pangklase.',
      ],
    },
    {
      heading: 'Kalahating Pagtatakda',
      paragraphs: ['Kapag gumagamit ng mixone blead mode:'],
      bullets: [
        'Cell Size: Per Module o N×N grid.',
        'Dot Hugis: Circle, Square, o Line.',
        'Brightness Curve: Linear, S-Curve, o Gamma.',
      ],
    },
    {
      heading: 'Mga Kulay ng Duotone',
      paragraphs: [
        'Kapag ginagamit ang Duotone blead mode, magtakda ng kulay na Shadow (madidilim na bahagi) at itampok ang kulay (mga lugar na hindi mabuti).',
      ],
    },
    {
      heading: 'Mga Pagtatakda sa Pag - iisip ng GIF',
      paragraphs: ['Kapag gumagamit ng masiglang mga balot ng GIF:'],
      bullets: [
        'Gumamit ng Frame Reflections: Igalang ang orihinal na GIF TIME.',
        'Max FPS: Limit frame rate (1-60 fp).',
        'Pagtatapon ng dumi: Paggalang o simpleng paraan ng pagtatapon ng balangkas.',
      ],
    },
    {
      heading: 'Patiunang Pagbibigay ng mga Mapagpipilian',
      paragraphs: ['Karagdagang mga kontrol sa pagsasalin:'],
      bullets: [
        'Gap Mode: Wala, Inset, Stroke, o Negatibong puwang sa Kalawakan.',
        'Corner Radius: May mga sulok na persentahe para sa mga module.',
        'Nagtapos: Wala, Linear, Radial, o Conic role sa mga module.',
        'Eye Outer/Inner Style: Independent styling para sa mga sender pattern rings.',
        'Pag - aalis ng Dot: Rotate brilyante/dot modules.',
        'Pagkurap ng Mata: Gumawa ng pagbabago para sa mga disenyo sa paghanap.',
        'Istilo ng Frame: Idagdag ang mga pandekorasyong balangkas (Rounded Frme, Sticker, Tag).',
        'Tekstong Frame: Magdagdag ng teksto tulad ng \\"Scan Me!\\" sa mga frames.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Patiunang Pag - uugnay ng QR',
      paragraphs: ['Cine-tune QR PROPES:'],
      bullets: [
        'Encoding Mode: Auto, Numeric, Alphanumeric, Byte/UTF-8, o Kanji.',
        'Enforce Min Tahimik Zone: Tiyakin ang hindi kukulanging 4 module mardyin.',
        "Disenyo ng Maskara: Auto (optimal), o manu - manong pumili ng disenyo 0-7 upang kontrolin ang pamamahagi ng module. Ang iba't ibang disenyo ay lumilikha ng iba't ibang hitsura samantalang ini - scan ang iisang impormasyon.",
        'Character Encoding: ISO-8859-1 (Latin-1 default), UTF-8 (full Unicode kabilang ang emoji), o Oberde-JIS (Japanese). Pumili batay sa mga kahilingan ng iyong nilalaman.',
      ],
    },
    {
      heading: 'Patiunang mga Mapagpipilian',
      paragraphs: ['Karagdagang mga tagpo sa pagluluwas:'],
      bullets: [
        'Hostname: Listahan ng mga kaugalian para sa mga download.',
        'GIF Palette Size: 2-256 na kulay sa GIF output.',
        'GIF Quantizer: Median Cut, NeuQuant, o Octree na pagbabawas ng kulay.',
        'GIF Paglubog: Off, Floyd-Steinberg, o Ordend.',
        'GIF Kulay ng Transparent: Maglagay ng kulay na dapat na naaaninag.',
        'SVG Tunay na Vector: Gumamit ng mga landas sa halip ng nakabaong raster.',
        'SVG Hugis Precision: Pixel o regulatoryong salin ng landas.',
        'SVG Embed Raster Overlay: Isama ang balot bilang nakabaong larawan.',
        'Pinagmulan Override: Lagyan ng espisipikong kulay ang output.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Mapagpipilian sa Pagtatakda',
      paragraphs: ['Mga setting ng Input processing:'],
      bullets: [
        'Entegrate Input: Tingnan ang format ng nilalaman bago mag - adjust.',
        'Trim Whitespace: Alisin ang mga nangungunang/trailing puwang.',
        'Normal na Gawin ang Bagong mga Lugar: Ikumberte ang lahat ng linya na nagtatapos sa LF.',
        'Max Longth Guard: Warn kung ang nilalaman ay higit pa sa kapasidad ng QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Kapaki - pakinabang na mga Katangian',
      paragraphs: [
        'Ang professional level ay nagdaragdag ng watermark, metadata, pagbabahagi ng mga pagpipilian, pagsusuri sa kaligtasan, pagbabayad ng QR code, at mga katangiang pangnegosyo.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Bantay ng Tubig',
      paragraphs: ['Dagdagan ng watermark ang iyong QR code:'],
      bullets: [
        'Uri: Text, Image, o Magandang watermark.',
        'Posisyon: Center, Corners, Edges, Behind, o Tahimik Zone.',
        'Opacity: Watermark transparency (0-100%).',
        'Blund Mode: Normal, Maraming - gamit, Screen, o Labis - labis na paghahalo.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Embed metadata sa mga talaksang iniluluwas:'],
      bullets: [
        'Title, Awtor, Copyright, License, mga larangan ng paglalarawan.',
        'Panahon ng Paglalang: Panahon ng Pagpaparami.',
        'Kaugaliang Susi-Value: Idagdag ang mga di - makatuwirang pares ng metadata.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pagbabahagi',
      paragraphs: ['Ibahagi ang inyong QR code configurations:'],
      bullets: [
        'Direct Link: Mag - iwan ng isang parte na URL sa iyong kasalukuyang mga setting.',
        'Embed HTML: Mag-embed code para sa mga website.',
        'Mga Parameter ng Encode: Isama ang lahat ng setting sa parteng URL.',
        'Pansinin: Hindi maaaring ibahagi ang mga larawan mula sa lokal na mga file sa pamamagitan ng URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Pagsusuri sa Kaligtasan',
      paragraphs: ['Ang mga code ng Cenure QR ay nananatiling scannoble:'],
      bullets: [
        'Kaligtasan Mode: Ligtas, timbang, o mahigpit na mga kahilingan sa scanning.',
        'Min Module Laki: Minimum pixel na sukat sa bawat module.',
        'Tahimik na Pagmimina Zone: Mga minimum margin module.',
        'Lock Finders/Timing/Align/Format/Version: Ingatan ang mga espesipikong elemento.',
        'Max Overlay Intensity by ECC: Automatic intensity limits batay sa error recision level.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Mga Uri ng Nilalaman',
      paragraphs: [
        'Ang propesyonal na antas ay nagdaragdag ng mga uri ng sahod at mga nilalaman ng negosyo:',
      ],
      bullets: [
        'EPC/SEPA (EU): European bank transfer QR codes na may IBAN, BIC, halaga, reference.',
        'UPI (India): Unified Payments Interface na may VPA, fee na pangalan, halaga.',
        'Pay Ngayon (Singapore): Singapore mabilis na bayad sa UEN o mobile number.',
        'Lex Pay (Thailand): Thai pambansang sistema ng pagbabayad.',
        'PIX (BRE): PIX key ng Brazil.',
        'Crypto: Bitcoin, Ethereum, Litecoin pagbabayad addresss na may opsyonal na halaga.',
        'Marketing Campaign Link: URLs na may ganap na UTM parameter (Marketing Tags).',
        'Maikling Kaugnayan: Para sa paggamit gamit ng URL shorters para sa dynamic/trackable QR codes.',
        'GS1 Digital Link: Pagkakakilanlan ng produkto na may GTIN, serial, batch, expiry.',
        'Deep Link ng App: Mga deep link ng iOS/Android app na may mga custom na scheme.',
        'Kaugaliang Format: Raw data na walang format o bisa.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Wika-Relevant Payments in Advanced Mode',
      paragraphs: [
        'Kapag gumagamit ng Advanced mode, awtomatikong ipinakikita ng ANQR ang mga paraan ng pagbabayad na may kaugnayan sa iyong piniling wika. Halimbawa, ang mga gumagamit ng Vietnamese ay nakakakita ng VietQR, ang mga gumagamit ng Thai ay nakakakita ng Dead Pay, at ang mga gumagamit ng wikang Indian ay nakakakita ng UPI at BharatQR. Ang mga pamamaraan ng pangglobong pagbabayad (cryptocurrency, PayPal, Cash App) ay makukuha sa lahat ng mga wika. Ang propesyonal na paraan ay nagbubukas ng lahat ng pamantayan sa pagbabayad anuman ang wika.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Pamantayan ng Europeong Gantimpala',
      bullets: [
        'EPC/SEPA (EU): European bank transfer QR codes kasunod ng EPC QR Code Standard. Ang mga suportang IBAN, BIC (opsiyonal para sa domestic), ay umaabot sa EUR, at nakaayos o hindi naiayos na mga sangguniang pangbayad. Ginagamit sa ibayo ng sonang SEPA kabilang ang mga bansang EU pati na ang Switzerland, Norway, Iceland, Liechtenstein, Monaco, at San Marino.',
        'Swiss QR-bill: Swiss na pamantayan sa pagbabayad na sumusunod sa SIX Implementasyong mga panuntunan. Mga suporta CHF at EUR, QR-Reference (QRR), Credor Reference (ISO 11649), binuong creditor/debtor addresss, at impormasyong bayarin. Kailangan para sa Swiss invoices mula pa noong 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Pamantayang Pasuweldo ng mga Indian',
      bullets: [
        'UPI (India): Unified Payments Interface kasunod ng NPCI Deep linking speciation. Supports VPA (Virtual Payment Address), payee na pangalan, halaga sa INR, transaksyong tala, reference ID, merchant classification code, at transaksyon mode.',
        'BharatQR (India): Unified QR standard na sumusuporta kapuwa sa UPI at card-based na pagbabayad. Pinagsama ang UPI VPA at card PAN para sa maximum na komplibilidad. Isama ang pangalan ng mangangalakal, lungsod, MCC, mga detalye ng GST, at sa mga numero ng revoice/reference.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Pamantayan ng Pagpapabayad sa Timog - Silangang Asia',
      bullets: [
        'Pay Ngayon (Singapore): Singapore sistema ng mabilisang pagbabayad gamit ang EMVCo QR propesyunal na may SGQR profile. Suportahan ang UEN (pagrerehistro sa negosyo), mobile number, o NRIC bilang proxy identifiers. Isama ang halaga ng conformable flag at expiry date.',
        'PromptPay (Thailand): Thai national payment system kasunod ng Bank of Thailand EMV profile. Sinusuportahan ang mobile number, national ID, tax ID, e-wallet ID, at bill payment na may maraming reference field.',
        'QRIS (Indonesia): Quick Response Code Indonesian Standard. EMV-based pambansang pamantayan sa pagbabayad na sumusuporta sa mangangalakal na ID, NMID (National Merchant ID), pangkalakalang batayang klasipikasyon, at mga bayad sa kaginhawaan (fixed o persentahe).',
        'Duit Now (Malaysia): Sistema ng kagyat na pagbabayad sa Malaysia. Ang mga sumusuporta sa maramihang mga uri ng proxy kabilang ang NRIC, mobile, pasaporte, army ID, at business register numbers.',
        "VietQR (Vietnam): Vietnamese interbank transfer standard. Nangangailangan ng bank BIN (NAPAS identification) at account number. Sinusuportahan ang maramihang mga code ng serbisyo para sa iba't ibang uri ng paglilipat (QRPUSH, QRIBFTTA, QRIBFTTC).",
        'QR Ph (Philippines): Philippine QR payment standard para sa InstaPay at PESONet. Gumagamit ng mga account number na may merchant identification para sa P2M (person-to-merchant) na mga transaksyon.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Pamantayan sa Pagbabayad sa Silangang Asia',
      bullets: [
        'TWQR (Taiwan): Taiwanese QR na pamantayan ng pagbabayad. Ang supporter ID, tax ID, at TWD ay nagkakahalaga.',
        'HKQR/FPS (Hong Kong): Hong Kong Fasser Payment System QR codes. Sumusuporta ang FPS ID, mobile number, o email bilang mga tagabayad ng buwis. Halaga sa HKD.',
        'JPQR (Japan): Pinag-isa ng Hapon ang QR code na pamantayan ng pagbabayad. Ginagamit ang tindahan ng ID para sa pagkakakilanlang pangkalakalan na may halagang JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Iba Pang mga Pamantayan ng Pagbabayad sa Rehiyon',
      bullets: [
        'PIX (Brazil): Brazilian Central Bank instant passion system kasunod ng BR Code propetation. Mga suporta PIX key (CPF, CNPJ, email, telepono, o ala-suwerteng key), pangalang pangkalakal/city, transaksiyong ID, at mga halagang BRL.',
        'AusPayNet/NPP PayID (Australia): Australian New Payments Platform PayID system. Sinusuportahan ang mga uri ng PayID (email, mobile, ABN, organization ID) o tradisyonal na BSB + account number. Opsyonal ang pangalan ng merchant dahil nakikita ng mga nagbabayad ang nakarehistrong pangalan mula sa paghahanap ng NPP.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Gantimpala sa Pag - iyak',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): Pamantayang cryptocurrency na pagbabayad URIs na may direksiyon ng pitaka, opsyonal na halaga, at tatak. Makipag - ugnayan sa lahat ng pangunahing mga pitakang Bitcoin at Litecoin.',
        'Lightning Network (BOLT11): Ang bayad ng Lightning Network sa mga resibo. Paste isang BOLT11 na nakapaskil sa decore string para sa kagyat na pagbabayad ng Bitcoin na may kaunting bayad.',
        'Ethereum (EIP-681): Ethereum transaksyon request URIs sumusuporta sa mga katutubong ETH transfers at ERC-20 token transfers. Isama ang chain ID para sa multi-network support (Mainnet, Polygon, BSC, Arbitrum, optimista, Avalanche), mga gas parameter, at kontrata election call.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Serbisyo ng Pagpapabayad',
      bullets: [
        'PayPal.Me: PayPal bayad links sa username at opsyonal pre-fillet na halaga. Ang mga recipiente ay maaaring magbayad sa pamamagitan ng PayPal balance, cards, o mga deposito sa bangko.',
        'Cash App: Mga link sa pagbabayad ng Cash App gamit ang $cashtag na may opsyonal na halaga. Sikat sa United States para sa mga peer-to-peer na pagbabayad.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Generic EMV QR',
      bullets: [
        'EMV Generic: Lumikha ng kaugalian na EMV Merchant-Creaded Mode Ang mga QR code para sa mga panukalang pagbabayad ay hindi espesipikong nakatala. Configure merchant na pangalan, lungsod, country code (ISO 3166-1), code ng pera (ISO 4217 nummeric), MC, tip/convenence feeds, at karagdagang mga data field. Kapaki - pakinabang sa mga pagsasama - sama ng pagsubok o kaugalian.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blund Modes (Profesional)',
      paragraphs: ['Karagdagang mga paraan ng pagtutugma sa Professional level:'],
      bullets: [
        'Pixelate: Pinalamanang balot.',
        'Outline: Ang deck detective cast na nagpapakita lamang ng hugis.',
        'Wave: Epekto ng pagbabagu - bago ng panahon.',
        'Subpixel Size: Variable subpixel sushing batay sa imahe.',
        'Tunay na Dither: Sumulong sa pamamagitan ng pagpili ng matrix.',
        'Extreme: Maximum image, ay maaaring makaapekto sa scannabilidad.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Pagtatakda ng Proteksiyon',
      paragraphs: [
        'Ang Fine-guined control na kung saan ang mga elemento ng QR ay protektado mula sa modipikasyon ng balot:',
      ],
      bullets: [
        'Ingatan ang Timing: Panatilihing hindi maayos ang mga padron sa panahon.',
        'Ingatan ang Alignment: Panatilihing hindi maayos ang pagkakahanay.',
        'Ingatan ang Kamag - anak Info: Gabayin ang format ng mga information module.',
        'Ingatan ang Bersiyon Info: Shield version information modules.',
      ],
    },
    {
      heading: 'Mode ng ECC-Aware',
      paragraphs: [
        'May katalinuhang ipinamamahagi ang tindi batay sa maling kakayahang magtuwid. Sinusuri ng sistema kung aling mga module ang maaaring baguhin samantalang pinananatili ang scannity.',
      ],
      bullets: [
        'Badyet sa Panganib: Porsiyento ng kapasidad sa pagwawasto ng error na gagamitin (0-100%).',
        'Mas mataas na badyet = mas nakikitang balot ngunit mas mapanganib na scannabilidad.',
        'Ibabang badyet = mas ligtas na scanning ngunit hindi gaanong nakikita na balot.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ang mga Karapatang Gumawa ng mga Pasiya',
      paragraphs: ['Patiunang mga kontrol sa pagsasalin:'],
      bullets: [
        'Crisp Edges: Gumamit ng larawan na may pixelated para sa matutulis na gilid ng module.',
        'Pixel Snap: Floror, Round, o Ceil pixel na pagkakahanay.',
        'Per-Module Color Mode: Solidar, By Brightness, By Position, By Overlay, by Cluster.',
        'Kulay Paleta: Pakahulugang kulay na paleta para sa per-module color.',
        'Pagkakaiba ng Bantayog: Alamin ang pinakamababang pagkakaiba ng proporsiyon sa pagitan ng mga kulay.',
        'Min Ihambing ang Ratio: WCAG-style contrast request (1:1 hanggang 21:1).',
        'Karagdagang Hangganan Mga Module: Karagdagang hangganan sa labas ng tahimik na sona.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mga Mapagpipilian ng Professional Output',
      paragraphs: ['Mga setting para sa pagluluwas:'],
      bullets: [
        'DPI: Maglagay ng resolusyong print (72-600 DPI). 300 DPI ang nagrekomenda na maglimbag.',
        'Isama ang Silent Zone: Tagle tahimik zone sa dimensiyong output.',
        'Export Bilang Karagdagan: Generate PDF sa tabi ng primary format.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pagtatakda ng Anisyon (Profesional)',
      paragraphs: ['Karagdagang propesyonal na mga bahagi:'],
      bullets: [
        'Temporal Dither: Off, Blue Noise, o Fliker Safe per-frame dithering.',
        'Huwaran: Wala, Pulse, Wave, Scanline, Shimer, o mga epekto ng pag - urong.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Reference',
      paragraphs: [
        'Ang ANQR ay nagbibigay ng server-side API para sa paglikha ng mga code ng QR sa pamamagitan ng URL parameters. Ito ay angkop para sa mga empirikal na QR code sa mga website, email, dokumento, o automated workflows na walang client-side JavaScript.',
        'Base URL: https://anqr.link/api/qr',
      ],
      links: [
        {
          href: '/examples?lang=${lang}',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },
    {
      heading: 'Pangunahing mga Parametro',
      paragraphs: [
        'Kailangan at hindi isinasalin ang karaniwang mga parameter (parameter na mga pangalan):',
      ],
      bullets: [
        'data (kinakailangan): Ang nilalamang i-encode sa QR code. URL-encode na mga espesyal na character.',
        'sukat: Larawan sa pixels (default: 400, max: 2000). Ginagamit kung w/h hindi nakatakda.',
        'w, h: Ilabas ang lapad at taas sa mga pixel. Sobrang dami ng parameter.',
        'format: Output format - png, webp, o gif (default: pong).',
        'ec: Error sa pagtutuwid - L, M, Q, o H (default: H).',
        'fg: Areground color habang hex na walang # (default: 00000000).',
        'bg: Kulay sa likuran habang hex na walang # (default: ff).',
        'maaninag: Ilagay sa 1 para sa naaaninag na background.',
        'bILANG: Tahimik na sona sa mga module (pagguho: 4).',
      ],
    },
    {
      heading: 'Mga Parametro ng Pagtitipid',
      paragraphs: ['Module at pattern styling:'],
      bullets: [
        'estilo: Module estilo parisukat, bilog, tuldok, brilyante, konektado.',
        'nakakita: Maghanap ng parisang istilo - kuwadrado, pabilog, pabilog.',
        'kasuwato nito: Alignment pattern pattern - single_finder, square, round, bilog.',
        'oras: Ang pattern - pattern_module, solido, ay gumuho.',
        'obsesyon: Corner radiation percentage 0-100.',
        'puwang: Module gap persentahe 0-50.',
        'puwang: Gap mode - wala, inset, stroke, negative_space.',
        'mata Outer, eye Inner: Mga istilo ng mata - kuwadrado, bilog, bilog.',
        'talukap ng mata: Tala ng mata (default: 100).',
        'grad: Gradient type - walang, linear, radial, conic.',
        'graddangle: Kabihasnang anggulo para sa mga linyar na pag-ikot.',
        'mga grad Stop: Ang Gradient ay humihinto bilang color1,pos1,color2,pos2,... (e.g., ff00,0,0000ff,1).',
      ],
    },
    {
      heading: 'Napakaraming Parametro',
      paragraphs: [
        'Mga opsyon sa overlay ng larawan (kinukuha ang overlay na larawan sa gilid ng server):',
      ],
      bullets: [
        'img: URL Upang ibalot ang imahe (kailangang makuha sa publiko).',
        'mode: Overlay mode - center, halfutone, timplahan, ningning, mosaic, dithered, blue-noise, subpixel.',
        'matindi: Labis na tindi 0-100 (default: 100).',
        'kulay Mode: Sobrang kulay mode - color, grayscale, bw.',
        'sukat: Kung paano nababalutan, naglalaman, nabanat.',
        'nabubulok: Umiikot sa digri.',
        'flipX, flipY: Itakda sa 1 ang flip clade.',
        'mag - ingat Tagahanap: Ingatan ang mga disenyo sa paghanap (default: 1).',
        'mag - ingat Timing, serbisiyo: Itakda sa 1 upang maingatan ang mga padrong pang-oras/alignamento.',
      ],
    },
    {
      heading: 'Patiunang Pagproseso ng mga Parameter',
      paragraphs: ['Ang pagproseso ng larawan ay kapit sa balot:'],
      bullets: [
        'kaliwanagan: Pagbabago -100 sa 100 (default: 0).',
        'pagkakaiba: Pag-aangkop -100 hanggang 100 (default: 0).',
        'gamma: Halaga 0.1 hanggang 3 (default: 1).',
        'pagkaupo: Pag-aangkop -100 hanggang 100 (default: 0).',
        'kulay: Ang pag - ikot ng Hue sa mga digri.',
        'malabo: Blur sa pixels.',
        'pahasa: Matalas na halaga 0-100.',
        'posterize: Ilagay sa koreo ang mga antas.',
        'pasimula: Bunaryong pasukan 0-255.',
        'gilid: Edge detection - off, sobel, canny.',
        "invert: Ilagay sa 1 hanggang sa iba't ibang kulay.",
      ],
    },
    {
      heading: 'Mga Parametro ng Tatak ng Tubig',
      paragraphs: ['Dagdagan ng watermark ang QR codes:'],
      bullets: [
        'wmEn: Ilagay sa 1 upang maging palatandaan ng tubig.',
        'wm Uri: Watermark type - text, imahe, disenyo.',
        'wmText: tekstong Watermark (URL-encoded).',
        'wmImg: URL sa watermark na larawan.',
        'wmPos: Position - center, sulok, gilid, likod, tahimik_zone.',
        'wmopacity: Opacity 0-100 (default: 50).',
        'wmBlend: Bend mode - normal, dumami ka, iskrin, balot.',
      ],
    },
    {
      heading: 'Mga Parametro sa Pag - iisip',
      paragraphs: ['Para sa masiglang GIF output (requires format=gif):'],
      bullets: [
        'aim Halimbawa: Animation pattern - wala, pulse, wave, scanline, shimmer, drift, color_cycle.',
        'aim Frames: Bilang ng mga balangkas 1-60 (default: 24).',
        'aim Bilis: Frame pagkaantala sa milliseconds 10-1000 (default: 100).',
        'aim Binhi: Ang binhi ng Random para sa animation.',
        'pagluluwag: Animasyon revival - linear, maluwag_in, maluwag na_out, maluwag_in_out, bolt.',
      ],
    },
    {
      heading: 'Ilabas na mga Parameter',
      paragraphs: ['Mga opsyon ng output format:'],
      bullets: [
        'kalidad: WebP kalidad 0-1 (default: 0.9).',
        'webpQ: WebP kalidad 0-100 (default: 90).',
        'mga gifColors: GIF PACE sukat 2-256 (default: 256).',
        'dpi: Output DPI para sa PNG (default: 72).',
        'meta Tittle, metaAuthor, metaCopy, meta meta Desc: Mga bukirin ng metadata.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Mga Parameter ng I-crop',
      paragraphs: ['Mga opsyon sa pag-crop ng overlay na larawan:'],
      bullets: [
        'cropEn: I-enable ang overlay cropping 0/1 (default: 0).',
        'cropX: I-crop ang center X bilang fraction 0-1 (default: 0.5).',
        'cropY: I-crop ang center Y bilang fraction 0-1 (default: 0.5).',
        'cropSize: Laki ng crop bilang fraction ng larawan 0-1 (default: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Mga Parameter ng Safety Lock',
      paragraphs: [
        'Kontrolin kung aling mga elemento ng QR ang protektado mula sa pagbabago ng overlay:',
      ],
      bullets: [
        'lockF: Mga pattern ng lock finder 0/1 (default: 1).',
        'lockT: Mga pattern ng timing ng lock 0/1 (default: 1).',
        'lockA: Mga pattern ng alignment ng lock 0/1 (default: 1).',
        'lockFmt: Impormasyon sa format ng lock 0/1 (default: 1).',
        'lockV: I-lock ang impormasyon ng bersyon 0/1 (default: 1).',
        'safeMode: Safety mode - naka-off, balanse, mahigpit (default: naka-off).',
        'safeMinPx: Pinakamababang laki ng module sa mga pixel (default: 2).',
        'safeMinQz: Minimum quiet zone modules (default: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Mga Parameter ng Auto-tuning',
      paragraphs: ['Mga setting ng awtomatikong pag-optimize:'],
      bullets: [
        'autoVer: Auto-pick QR version 0/1 (default: 1).',
        'autoEcc: Auto-pick ECC level 0/1 (default: 0) - server-side na pahiwatig lang.',
        'autoReduce: [CLIENT-ONLY] Awtomatikong bawasan ang intensity hanggang sa ma-scan - nangangailangan ng scan validation loop.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Karagdagang Mga Parameter ng Animation',
      paragraphs: ['Pinalawak na mga kontrol sa animation para sa output ng GIF:'],
      bullets: [
        'loop: Patuloy na naglo-loop ang animation 0/1 (default: 1).',
        'bounce: Ping-pong animation direction 0/1 (default: 0).',
        'reverse: I-play ang animation sa reverse 0/1 (default: 0).',
        'colorCycle: I-enable ang color cycling effect 0/1 (default: 0).',
        'interp: Frame interpolation - wala, crossfade, morph (default: wala).',
        'tempDither: Temporal dithering - off, blue_noise, flicker_safe (default: off).',
        'startF: Animation start frame (default: 0).',
        'maxF: Maximum na mga frame na ire-render (default: 0 = auto).',
        'stepF: Frame step interval (default: 1).',
        'jitter: [CLIENT-ONLY] Jitter ng module sa mga pixel - nangangailangan ng per-frame QR regeneration.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Mga Parameter ng Dithering',
      paragraphs: ['Kontrolin ang mga algorithm ng dithering para sa pagproseso ng overlay:'],
      bullets: [
        'ditherKind: Dither algorithm - error_diffusion, ordered_bayer, blue_noise, atbp (default: ordered_bayer).',
        'diffusionKernel: Error diffusion kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (default: floyd_steinberg).',
        'ditherStrength: Dither intensity 0-100 (default: 50).',
        'serpentine: Serpentine dithering 0/1 (default: 0).',
        'matrix: Nag-order ng dither matrix - bayer2, bayer4, bayer8 (default: bayer4).',
        'bnTile: Laki ng asul na ingay na tile (default: 64).',
        'bnSeed: Asul na ingay na random na binhi (default: 0).',
        'colorDither: Color dithering - wala, per_channel, perceptual (default: wala).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Mga Parameter ng Subpixel',
      paragraphs: ['Mga setting para sa subpixel blend mode:'],
      bullets: [
        'spGrid: Laki ng grid ng subpixel - 2x2, 3x3, 4x4 (default: 3x3).',
        'spCenter: Center rule - mahigpit, halftone_center (default: mahigpit).',
        'spNeutral: Neutral na kulay hex na walang # (default: 808080).',
        'spFinder: Finder override - solid, stylized (default: solid).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Mga Parameter ng Halftone',
      paragraphs: ['Mga setting para sa halftone blend mode:'],
      bullets: [
        'htCell: Halftone cell size - per_module o nxn grid (default: per_module).',
        'htDot: Hugis na tuldok - bilog, parisukat, linya (default: bilog).',
        'htCurve: Brightness curve - linear, s-curve, gamma (default: linear).',
        'duo1: Duotone shadow color hex na walang # (default: 000000).',
        'duo2: Duotone highlight color hex na walang # (default: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Mga Parameter ng ECC-Aware Mode',
      paragraphs: ['Intelligent overlay distribution batay sa kapasidad sa pagwawasto ng error:'],
      bullets: [
        'eccAware: Paganahin ang ECC-aware mode 0/1 (default: 0).',
        'eccRisk: Porsyento ng badyet sa peligro 0-100 (default: 50).',
        'eccMap: Weight map - distance_to_finders, block_heatmap, empirical_scan_heatmap (default: distance_to_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Mga Parameter ng Frame',
      paragraphs: ['Mga setting ng pandekorasyon na frame:'],
      bullets: [
        'frame: Estilo ng frame - wala, rounded_frame, sticker, tag (default: wala).',
        'frameText: Text na ipapakita sa frame (URL encoded).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Mga Parameter ng Kulay ng Bawat Module',
      paragraphs: ['Mga pagpipilian sa pangkulay ng indibidwal na module:'],
      bullets: [
        'modColor: Color mode - solid, by_brightness, by_position, by_overlay, by_cluster (default: solid).',
        'cGuard: Contrast guard 0/1 (default: 0).',
        'minContrast: Minimum na contrast ratio 1-21 (default: 4.5).',
        'palette: Mga kulay na hex na pinaghihiwalay ng kuwit para sa palette mode.',
        'paletteMode: Pamamahagi ng palette - posisyon, liwanag, dayagonal, radial, random, row, column (default: posisyon).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF Overlay Parameter',
      paragraphs: ['Mga setting para sa mga animated na GIF overlay na larawan:'],
      bullets: [
        'ovType: Uri ng overlay - static, gif, apng, webp_anim, video (default: static).',
        'ovFramePick: Pagpili ng frame - lahat, every_n, max_frames, duration_limit (default: lahat).',
        'gifDelays: Gumamit ng orihinal na GIF frame delays 0/1 (default: 1).',
        'gifDispH: GIF disposal handling - paggalang, pasimplehin (default: paggalang).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Bawat-ECC Intensity Limits',
      paragraphs: ['Maximum na overlay intensity sa bawat antas ng pagwawasto ng error:'],
      bullets: [
        'maxIntL: Max intensity para sa ECC L 0-100 (default: 100).',
        'maxIntM: Max intensity para sa ECC M 0-100 (default: 100).',
        'maxIntQ: Max intensity para sa ECC Q 0-100 (default: 100).',
        'maxIntH: Max intensity para sa ECC H 0-100 (default: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Mga Parameter ng Simulation ng QA (Client-Only)',
      paragraphs: [
        'Ang mga parameter na ito ay na-parse para sa pagiging tugma ng URL ngunit gumagana lamang sa browser:',
      ],
      bullets: [
        'qaContrast: Paganahin ang contrast check 0/1 - nangangailangan ng interactive na pagpapatunay.',
        'qaBlur: Gayahin ang blur sa mga pixel - para sa interactive na pagsubok lamang.',
        'qaNoise: Gayahin ang antas ng ingay - para sa interactive na pagsubok lamang.',
        'qaHeatmap: Ipakita ang pagiging madaling mabasa ng heatmap 0/1 - nangangailangan ng canvas overlay na UI.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Client-Only Parameter',
      paragraphs: [
        'Karamihan sa mga parameter ng API ay ganap na sinusuportahan sa panig ng server. Ang mga parameter na may markang [CLIENT-ONLY] ay na-parse para sa pagiging tugma ng URL ngunit nangangailangan ng mga feature ng browser:',
      ],
      bullets: [
        'jitter: Ang module jitter ay nangangailangan ng per-frame QR regeneration na may randomness.',
        'autoReduce: Ang auto-reduce intensity ay nangangailangan ng iterative scan testing.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: Ang QA simulation ay nangangailangan ng interactive na canvas validation.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Karagdagang Mga Parameter ng Output',
      paragraphs: ['Mga setting ng pinalawak na output at pag-export:'],
      bullets: [
        'fname: Custom na filename para sa mga download (default: anqr-qrcode).',
        'inclQz: Isama ang quiet zone sa mga sukat ng output 0/1 (default: 1).',
        'bgOver: I-override ng kulay ng background ang hex na walang # (i-override ang bg parameter).',
        'fmtExtra: Karagdagang format na output - wala, eps, animated_webp (default: wala). Tandaan: ang eps ay [PARTIAL].',
        'svgPrec: Katumpakan ng hugis ng SVG - pixel, tumpak (default: pixel). [PARTIAL] Limitado ang output ng SVG sa server-side.',
        'svgEmbed: I-embed ang raster overlay sa SVG 0/1 (default: 1). [PARTIAL] Limitado ang output ng SVG sa server-side.',
        'modulePx: Laki ng pixel ng module (default: awtomatikong kinakalkula mula sa laki).',
        'hangganan: Mga karagdagang module ng hangganan na lampas sa tahimik na zone (default: 0).',
        'crisp: I-enable ang crisp/pixelated na pag-render ng larawan 0/1 (default: 1).',
        'snap: Pixel snap mode - floor, round, ceil (default: floor).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Mga Parameter ng Pagpapanatili ng Pattern',
      paragraphs: [
        'Kontrolin kung aling mga elemento ng istruktura ang protektado mula sa overlay:',
      ],
      bullets: [
        'keepFinders: Panatilihin ang mga pattern ng finder 0/1 (default: 1).',
        'keepTiming: Panatilihin ang mga pattern ng timing 0/1 (default: 0).',
        'keepAlign: Panatilihin ang mga pattern ng alignment 0/1 (default: 0).',
        'protectFmt: Protektahan ang mga module ng impormasyon ng format 0/1 (default: 0).',
        'protectVer: Protektahan ang mga module ng impormasyon ng bersyon 0/1 (default: 0).',
      ],
    },
    {
      heading: 'Halimbawa sa Paggamit',
      paragraphs: [
        'Pangunahing kodigo ng QR:',
        'mga https://anqr.link/api/qr?data=htps://example.com',
        'Hugis QR code na may mga nakaugaliang kulay:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ff&style=rounded&radius=30',
        'Code ng QR na may nakabalatang larawan:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode= halftone&tensidad=7070',
        'Animadong GIF:',
        'https://anqr.link/api/qr?data=Hello&format=gif&fiim=plse&animFrames=24&publish=ease_in_out',
      ],
      links: [
        {
          href: '/examples?lang=${lang}',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },
    {
      heading: 'Pagbuo ng mga Kodigong QR',
      paragraphs: [
        'Sa Professional mode, ang bahaging Share ay lumilikha ng mga endidable HTML at mga URL. Ganito gumagana ang paglustay:',
      ],
      bullets: [
        'Link: Gumawa ng URL sa ANQR app kasama ang lahat ng setting mo na naka-sign bilang URL parameters. Maaaring makita at baguhin ng mga recipient ang kodigong QR.',
        'Embed Image: Generates an <img> tag na nakaturo sa server API. Ang QR code ay isinasalin bilang server-side at nagsisilbing imahe.',
        'Embed Markdown: Gumagawa ng Markdown na mga larawan para sa mga dokumentasyon at mga talaksang CREME.',
        'Tuwirang API URL: Ang hilaw na API URL para gamitin sa mga aplikasyon, iskrip, o iba pang mga pagsasanib.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML na Halimbawa',
      paragraphs: [
        'Para mai - e - enjoy ang QR code sa inyong website:',
        '<img src=\\"htps://anqr.link/api/qr?data=htps://iyongsite.com&size=200\\" act=\\"QR Code\\" />',
        'Para sa pagtugon:',
        '<img src=\\"htps://anqr.link/api/qr?data=htps://iyongsite.com&size=400\\" act=\\"QR Code\\" estilo=\\"max-width: 100%; taas: auto;\\" />',
        'Ang mga cache ng server ay tumutugon sa pamamagitan ng mga mahahabang cache header, kaya ang paulit-ulit na mga kahilingan para sa parehong URL ay mabilis.',
      ],
    },
    {
      heading: 'Ibahagi ang URL Format',
      paragraphs: [
        'Kapag na-click mo ang Ibahagi sa Professional mode, ine-encode ng ANQR ang iyong kasalukuyang mga setting sa mga parameter ng URL. Ang format ay:',
        'https://anqr.link/?data=...&ec=H&style=rounded&e....',
        'Ang mga parameter na ito ay sumasalamin sa API parameters, kaya maaari mong i-publish ang isang parte ng URL sa isang API URL sa pamamagitan ng pagbabago ng base path path mula /api/qr at pag-aangkop ng w/h parameters kung kinakailangan.',
        'Pansinin: Ang mga imaheng labis-labis na naikarga mula sa mga lokal na file ay hindi maaaring ibahagi sa pamamagitan ng URL - tanging mga URL-based cains (img parameter) na gawain sa mga kabahaging link at mga tawag ng API.',
      ],
    },
    {
      heading: 'Mga Hangganan at Gamit',
      paragraphs: [
        'Ang API ay malayang magagamit para sa mga rason volume. Para sa mga high-volume na gamit o mga aplikasyong pangkomersiyal na nangangailangan ng ginagarantiyahang oras, pakisuyong makipag-ugnayan sa amin.',
        'Ang mga tugon ng API ay kinabibilangan ng agresibong caching headers. Para sa pinakamahusay na pagganap, ang mga tugon ng cache sa iyong dulo o gamitin ang parehong URL nang walang pagbabago para sa mga magkatulad na QR code.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Pinakamabuting Gawain',
      paragraphs: ['Sundin ang mga tuntuning ito para sa maaasahang mga kodigo ng QR:'],
      bullets: [
        'Laging subukin ang inyong QR codes na may multiple scanner apps bago ilimbag.',
        'Gamitin ang Error sa pagtutuwid ng H (High) kapag nagdaragdag ng mga balot.',
        'Mag - ingat ng di - kukulangin sa 4 na module ng tahimik na sona (margin).',
        'Tiyakin ang malaking pagkakaiba sa pagitan ng guhit sa likuran.',
        'Para sa pagkalimbag, gumamit ng hindi bababa sa 300 DPI at pagsubok sa aktuwal na laki ng limbag.',
        'Madaling Itagong mga Huwaran Kapag gumagamit ng mga pambalot.',
        'Magsimula sa mas mababang init ng balot at unti - unting dumami.',
        'Para sa panlabas na gamit, isaalang - alang ang mas malalaking sukat ng module at mas mataas na pagtutuwid ng pagkakamali.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Browse Matuto ng mga artikulo', type: 'learn' },
        {
          href: '/examples?lang=${lang}',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },
    {
      heading: 'Pagputok ng Problema',
      paragraphs: ['Karaniwang mga isyu at solusyon:'],
      bullets: [
        'Hindi mag-e - scan ang QR: Bawasan ang tindi ng balot, dagdagan ang maling pagtutuwid, suriin ang pagkakaiba.',
        'Malaki ang Kodigo: Bawasan ang nilalamang haba, gamitin ang URL shorter, mas mababang bersyon.',
        'Komentaryong output: Palakihin ang sukat ng module, gamitin ang PNG sa halip na siksik na format.',
        'Ang kulay ay mukhang mali: Tingnan ang pagkakaiba ng kulay, subukan ang grayscale clade mode.',
        'Huwag mag - isip: Ensure gamit ang GIF format output, tingnan ang frame count.',
        'Larawan na hindi nagkakarga: Tingnan ang pahintulot ng CORS sa mga remote image.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Tingnan ang kaugnay na mga giya at mga halimbawa',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Mga Maikling Pagputol sa Keyboard',
      paragraphs: [
        'Sinusuportahan ng ANQR ang pamantayang keyboard shortcut. Gamitin ang Ctrl/Cmd+S upang magbunsod ng pagluluwas (kapag nakatuon sa preview).',
      ],
    },
    {
      heading: 'Pagbabahagi at Paghihiwalay',
      paragraphs: [
        'Sa Professional mode, i-click ang button na Ibahagi upang kopyahin ang isang URL gamit ang iyong kasalukuyang mga setting. Maaaring buksan ng mga tatanggap ang URL na ito upang makita ang iyong eksaktong configuration. Tandaan: Ang mga overlay na larawan mula sa mga lokal na file ay hindi maibabahagi sa pamamagitan ng URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Subukin ito nang tuwiran sa ANQR generator.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Browse Matuto ng mga artikulo', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Tingnan ang mga halimbawa ng QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Tingnan ang mga halimbawa ng QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Buksan ang generator', type: 'generator' },
  ],
};

export default guide;
