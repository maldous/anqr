import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'MGA Halimbawa ng ANQR',
  description: 'Limang real-world, production-style na mga halimbawa na nagpapakita kung saan ang mga QR code ay lumilikha ng masusukat na halaga: pagtaas ng isang legacy na retail counter code, branded retail na mga pagbabayad at "scan-to" na mga aksyon, print scaling mula sa mga flyer hanggang sa mga billboard, animated na QR para sa digital signage, at cross-lingual na pakikipagtulungan gamit ang mga naibabahaging Anchor link. Kasama sa bawat halimbawa ang mga larawan, praktikal na mga hadlang, at isang link ng remix pabalik sa generator.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buksan ang generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Browse Matuto ng mga artikulo', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Buksan ang Buong Gaser Guide', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Pag - aaral ng Kaso: Retail Counter QR Uplift',
      paragraphs: ['Ang reality-world na halimbawang ito ay sumusunod sa isang maliit na café na gumagamit ng parehong QR code sa kanilang counter sa loob ng tatlong taon. Ang orihinal na kodigo ay mabilis na ginawa noong panahon ng mabilis na pagdami ng mga epidemya, nakalimbag sa karaniwang papel, at nahulog sa isang plastik na patungan. Ito\'y nagtatrabaho pa rin sa teknikal na paraan subalit ang mga parokyano ay kadalasang nangangailangan ng maraming pagsisikap upang suriin ito, at wala itong ginawa upang pagtibayin ang maingat ang pagkakagawang pagkakakilanlan ng karinderya.', 'Nagsimula ang pagbabago sa pamamagitan ng isang payak na audit: ang umiiral na code na nag-i-install ng online menu ng café na URL, na nais nilang itago. Ang hamon ay ang ipadama sa QR na bahagi ito ng karanasan sa café sa halip na pagkatapos isipin ang gamit nito mula 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Isang weated QR code sa isang plastic stand na nagpapakita ng nakikitang suot, tatak ng daliri, at kupas na paglilimbag',
          caption: 'Ang pasimula: Tatlong taon ng counter service ay nag - iwan sa orihinal na QR na hindi gaanong gumagana',
        },
      ],
    },
    {
      heading: 'Pagsusuri sa mga Problema ng Orihinal na Kodigo',
      paragraphs: ['Isiniwalat ng pagsubok ang maraming isyu: ang orihinal na kodigong ginamit na Error Corrector L (minimum redundancy), ay may tahimik na sona na 2 module lamang, at inilimbag sa mababang resolusyon. Sa ilalim ng mainit na tungsten light ng café, ang mga itim na module ay halos walang pagkakaiba sa dilaw na papel. Ang mas matatandang telepono ay nakipagpunyagi; ang mas bagong mga telepono ay nagtagumpay subalit taglay ang kapansin - pansing pagkaantala.', 'Higit pa sa mga teknikal na isyu, ang generic na black-and-white square ay walang nakipag-ugnayan sa brand. Nag-alinlangan ang mga customer bago mag-scan - isang banayad na hadlang sa pagtitiwala na nagbawas ng pakikipag-ugnayan sa maingat na idinisenyong digital na menu ng cafe.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Isang sapin ng diyagnosis na nagpapakita ng orihinal na teknikal na mga kakulangan ng QR: mababang ECC, kaunting tahimik na sona, hindi mabuting pagkakaiba',
          caption: 'Isinisiwalat ng teknikal na pagsusuri kung bakit ang kodigo ng pamana na isinasagawa sa tunay na mga kalagayan sa daigdig',
        },
      ],
    },
    {
      heading: 'Ang Pag - unlad',
      paragraphs: ['Sa paggamit ng ANQR, muling binago ng may - ari ng café ang kodigo sa pamamagitan ng magkatulad na menu na URL subalit lubhang bumuti ang kalagayan: Error sa pagtutuwid H para sa sukdulang pagiging matatag, isang 6-module na tahimik na sona para sa maaasahang direksyon ng hangganan, at mga kulay ng tatak (malalalim na burgundy module na nasa likuran ng krema) na nagtutugma sa panloob na lebel ng café.', 'Isang maliit na gitnang damuhan na nagtatampok ng logo ng café ay idinagdag na sadyang pinananatiling tuso upang mapanatili ang pagiging madaling suriin samantalang nagbibigay ng kagyat na pagkilala sa tatak. Tiniyak ni Safety Mode na ang bagong disenyo ay tiyak na makikita sa mga kagamitan sa pagsusulit bago ang anumang paglilimbag.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Ang ANQR interface na nagpapakita ng configuration: mga kulay ng brand, angkop na ECC, malawak na tahimik na sona, spectible logo clude',
          caption: 'Pagtatayo ng upgraded configuration: bawat setting na pinili upang balansehin ang brand expression ng scan pagkamaaasahan',
        },
      ],
    },
    {
      heading: 'Masusukat na mga Resulta',
      paragraphs: ['Matapos ilagay ang bagong QR sa propesyonal na mate-lainated card stock, ang café tracked ay nagbunga ng mahigit apat na linggo. Ang bilis ng tagumpay ng Scan ay sumulong mula tinatayang 70% hanggang sa halos-100%. Ang average na oras ng scan ay bumaba mula 3-4 segundo hanggang sa wala pang 1 segundo. Kapansin - pansin, ang tipanan sa menu ay dumami ng 40% - mga parokyano na dati\'y sumulyap sa QR at sumuko na ay may pagtitiwalang nagsusuri ngayon.', 'Si Staff ay nag-ulat ng mas kaunting mga tanong ng parokyano tungkol sa \'how upang gamitin ang QR\' at wala nang mga pagkakataon ng manufacturing ang URL para sa mga bigong parokyano. Ang may markang hitsura ay pumukaw rin ng mga pag - uusap, na ang mga parokyano ay positibong nagkokomento tungkol sa disenyo ng cohesive.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Isang bago/pagkatapos ihambing sa mga metriko: scan rate ng tagumpay, average scan time, at lingguhang scan county',
          caption: 'Apat na linggong datos na nagpapakita ng di - mabilang na epekto ng maingat na pagdami ng QR',
        },
      ],
    },
    {
      heading: 'Muling Pag - unlad na Ito',
      paragraphs: ['Ang pagsasaayos ng karinderya ay nagpapakita ng konserbatibo ngunit epektibong pag-uuri: Error sa pagtutuwid H, 6-module tahimik zone, high-contrast brand colors, at isang maliit na gitnang balot. Ang pagkakatimbang na ito ay mabisa para sa karamihan ng mga kontraksiyon sa tingi kung saan ang pagkamaaasahan ay dapat na mauna subalit ang pagkakaroon ng tatak ay mahalaga pa rin.', 'Buksan ang generator ng mga setting na ito nang pre-based at i-akma ang mga kulay at claim sa iyong sariling brand. Ang susing pang - unawa: Ang maaasahang mga pagsulong lamang ay maaaring lubhang makaragdag sa tipanan, bago pa man magdagdag ng anumang nakikitang pagbabago.', 'Tingnan ang kaugnay na gabay ng Learn tungkol sa pagpapabuti ng mga umiiral na kampanya ng QR para sa buong metolohiya sa likod ng pamamaraang ito.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Kaugnay ng generator pre-iayos sa mga setting ng café para sa agarang pag-iskedyul',
          caption: 'Magsimula sa isang napatunayang pagsasaayos at pag - aayos ng iyong tatak',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Browse Matuto ng mga artikulo',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Pag - aaral ng Kaso: Displeksiyon ng Multi-Payment',
      paragraphs: ['Ang halimbawang ito ay sumusunod sa isang tindahan ng damit na boutique na nakapagtipon ng limang iba\'t ibang code ng QR sa kanilang rehistro: pagbabayad sa bangko, mga tip, Instagram, mga review ng Google, at isang pag-arkila ng link. Ang bawat isa ay ginawa mula sa iba\'t ibang pinagmulan, inilimbag sa iba\'t ibang panahon, at nakadispley sa mga puwestong may sira. Ang kaguluhan sa paningin ay nagpapahina sa maingat na kulot na kagandahan ng tindahan, at ang mga kawani ay regular na nakikitungo sa mga parokyano na sinusuri ang maling kodigo.', 'Ang lunas ay nangangailangan ng paghihiwalay ng mga pagkabahala: ang mga kodigo sa pagbabayad ay nangangailangan ng sukdulang pagkamaaasahan sa konserbatibong pagtitipid, samantalang ang mga kodigo sa pagbebenta ay maaaring maging mas maliwanag. Ang nagkakaisang sistemang display na lumitaw ay nagpapakita kung paano balansehin ang presensiya ng brand laban sa mga functional na mga kahilingan ng iba\'t ibang QR na gumagamit ng mga kaso.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Isang makalat na rehistrong lugar na nagpapakita ng limang kodigo ng QR na di-match sa iba\'t ibang stand at inilimbag na materyales',
          caption: 'Ang magulong panimulang punto: limang hindi kilalang kodigo ng QR na nakikipagpaligsahan para sa atensiyon at nagiging sanhi ng kalituhan ng parokyano',
        },
      ],
    },
    {
      heading: 'Paglalagay sa Gantimpalang Karanasan',
      paragraphs: ['Ang pangunahing paraan ng pagbabayad ng tindahan ay gumamit ng pamantayang panrehiyon na humihiling ng mahigpit na pagsunod sa mga sahod. Isiniwalat ng pagsusuri na naapektuhan kahit na ng bahagyang pag - i - styling ang bilis ng scan sa pamamagitan ng ilang mga app sa pagbabangko. Ang desisyon: panatilihing ganap na hindi natukoy ang bayad na QR maliban sa sukat na optimisyon at propesyonal na paglilimbag sa matte card stock.', 'Ang konserbatibong pamamaraang ito ay nangahulugang ang kodigo ng pagbabayad ay mukhang hindi gaanong \'branded\' kaysa huwaran, ngunit malaki ang isinulong ng halaga ng transaksyon. Ang matalinong unawa: Ang mga sandali ng pagbabayad ay hindi nagbibigay ng tatak sa mga pagkakataon - sila\'y maaasahang mga sandali. Pinahahalagahan ng mga parokyano ang bilis at katiyakan sa kagandahan kapag salapi ang nasasangkot.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Isang malinis, malaking bayad na QR code sa propesyonal na matte card stock, na nakaposisyon sa rehistro',
          caption: 'Ang bayad na QR: malaki, inilimbag nang propesyonal, konserbatibo para sa kagyat na pagkilala sa pamamagitan ng mga app sa bangko',
        },
      ],
    },
    {
      heading: 'Paglikha ng Ikalawang Pagtatanghal ng Pagkilos',
      paragraphs: ['Para sa mga tip, repaso, sosyal, at pag - upa, ang tindahan ay maaaring maging higit na makuwento. Ang mga kodigong ito ay muling binago sa ANQR na may hindi nagbabagong tatak na styling: ang lagda ng tindahan na berdeng olibo sa krema, bilog na istilong module, at isang hindi halatang gitnang balot ng larawan ng tindahan. Error sa pagtutuwid Ang H ay nakatitiyak ng pagkamaaasahan kahit na sa pamamagitan ng styling.', 'Ang apat na kodigong ito ay inayos sa isang may markang panel na nakapuwesto sa tabi (hindi nakikipagkompetensiya) ng kodigo ng pagbabayad. Ipinaliwanag ng malinaw na mga etiketa sa typography ng tindahan ang layunin ng bawat kodigo. Ang herarkiya sa paningin ay sinasadya: Ang kabayaran ay nag - iisa at prominente; ang pangalawahing mga pagkilos ay pinagsama - sama bilang mga mapagpipilian.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Isang kilalang panel na nagpapakita ng apat na kilalang kodigo ng QR para sa mga tip, review, social, at pag - upa, na may malinaw na mga etiketa',
          caption: 'Ang secondary action panel: hindi nagbabagong branding, malinaw na labelling, na nakapuwesto bilang mga pagpipilian sa halip na mga pang - abala',
        },
      ],
    },
    {
      heading: 'Disenyo ng Sistema ng Pagtatanghal',
      paragraphs: ['Ang pisikal na pagtatanghal ay sabay - sabay na lumutas ng ilang problema. Kapuwa ang patungan ng kabayaran at ang secondary panel ay gumamit ng mga materyales na matte upang alisin ang nakasisilaw na liwanag mula sa liwanag sa itaas. Ang Heights ay tamang - tama para sa mga parokyano na iba - iba ang taas. Ang singles ay nakatuon sa customer queue sa halip na patag sa counter.', 'Sa kritikal na paraan, ang tindahan ay lumikha ng mga ekstrang letra mula sa nakakandadong mga kawing ng ANQR configuration. Nang sa wakas ay makuha ng tip code ang kape-splashed, pinalitan ito ng mga tauhan sa loob ng ilang minuto gamit ang nakaimbak na configuration - no screenshots, walang paghula sa mga setting, walang quality defect.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Isang larawan na nagpapakita ng pisikal na ayos ng pagtatanghal: ang taas, anggulo, materyales, at ang kaugnayan sa pagitan ng pagbabayad at secondary display',
          caption: 'Programa ng sistema ng pagtatanghal: Ang pisikal na mga ergonomics ay tamang - tama para sa maaasahang pagsusuri sa itaas ng parokyano at sa mga kalagayan ng ilaw',
        },
      ],
    },
    {
      heading: 'Mga Pagsulong sa Operasyon',
      paragraphs: ['Anim na linggo pagkatapos ng pagpopondo, dokumentado ng tindahan ang mahalagang mga pagsulong: mga reklamo ng mga parokyanong sero tungkol sa kalituhan ng kodigo, mas mabilis na mga panahon ng transaksiyon, at isang 3x na pagtaas ng mga pagsumite ng tip (mahahanap ngayon ng mga parokyano at sinusuri ang kodigo ng tip nang hindi naaasiwang nagtatanong ng mga tauhan). Ang mga review ng Google ay dumami rin habang ang dedikado at mahusay na-labeled QR ay nag-aalis ng pagkikiskisan.', 'Naging mas simple ang pagsasanay sa Staff: Ang \'payment code ay ang malaki, lahat ng iba pa ay nasa panel.\' Kapag ang mga app sa pagbabayad ay binago at ang isa ay sandaling nagpakita ng mas mabagal na pagsusuri, ang konserbatibong disenyo ng kodigo ng pagbabayad ay nangangahulugan pa rin na ito ay bahagyang mas mabagal sa halip na lubusang bumagsak.', 'Tingnan ang Learn guide sa QR codes para sa mga retail na pagbabayad para sa mga prinsipyo sa likod ng display system design na ito.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Isang metrics dashboard na nagpapakita bago/pagkatapos ng paghahambing: mga pangyayaring pagkalito, oras ng transaksiyon, tip frequency, review suppliations',
          caption: 'Anim na linggo ng operating data na nagpapakita ng epekto sa negosyo ng isang maalalahaning multi-QR display system',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Browse Matuto ng mga artikulo',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Pag - aaral ng Kaso: Mula sa Business Card Tungo sa Billboard',
      paragraphs: ['Sinusunod ng halimbawang ito ang isang kompanya ng produksiyon na naghahanda para sa isang malaking komperensiya. Kailangan nila ang parehong QR code - linking sa pangyayaring ito na naka-pped sa kabila ng lubhang iba\'t-ibang format: staine badge inscriptions (3cm), table tent cards (8cm), register desk signage (30cm), standing posters (60cm), at isang malaking stage band (4 metres). Ang bawat format ay may iba\'t ibang distansiya sa pagmamasid, mga kalagayan sa ilaw, at mga workflow sa produksiyon.', 'Ang hamon ay hindi lamang sa teknikal na paraan. Maraming nagtitinda ang humahawak ng iba\'t ibang trabahong pang - imprenta, at kailangang tiyakin ng kompanya ang di - nagbabago at madaling suriing mga resulta anuman ang gawin. Ang kanilang solusyon ay nakasentro sa pagluluwas ng SVG at mahigpit na mga dokumentasyon sa pamamagitan ng handoff.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Isang collage na nagpapakita ng iisang kodigo ng QR na may limang iba\'t ibang laki, mula sa badge hanggang sa baner',
          caption: 'Isang kodigong QR, limang sukat ng estimulasyon: ang hamon ng pagpapanatili ng scannity mula sa centimetres hanggang sa metres',
        },
      ],
    },
    {
      heading: 'Kung Bakit May mga Problema ang Naunang mga Pangyayari',
      paragraphs: ['Sa kanilang huling komperensiya, ang kompanya ay nakaranas ng nakahihiyang kabiguan. Ang baner sa entablado na QR ay nilikha bilang isang maliit na PNG at nag-ebolb sa disenyo software - ang resulta ay mukhang katanggap-tanggap mula sa malayo ngunit nabigong mag-secure mula sa mga manonood. Kasamaan Ang mga QR ay sobrang-styled at masyadong maliit, nakasisiphayong mga dumalo na sinusubukang magdagdag ng mga contact. Ang mga inkonsistenteng setting sa ibayo ng format ay nangangahulugang ang \'same\' QR ay aktuwal na nagmukhang iba sa bawat piraso.', 'Ang post-event analysis ay nagsiwalat ng ugat na sanhi: walang kahit isang pinagmulan ng katotohanan. Ginawang muli ng bawat disenyador ang QR sa pamamagitan ng bahagyang iba\'t ibang setting, at iba - iba ang pagkakaproseso sa mga file ng bawat tindahan. Ang kalidad ay nasira sa pamamagitan ng laro sa telepono na file handoffs.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Mga larawan sa close-up na nagpapakita ng mga kabiguan sa scanning: mga pixelated band module, mga undersized badge code, hindi pare-parehong pag-ikot sa mga format',
          caption: 'Ang forensic analysis ng nakaraang mga kabiguan sa pangyayari: ang bawat format ay nagpakilala ng iba\'t ibang mga problema sa kalidad',
        },
      ],
    },
    {
      heading: 'Ang SVG-Unang Patak ng Trabaho',
      paragraphs: ['Para sa kaganapang ito, nagtatag ang kumpanya ng mahigpit na protocol: isang master QR na nabuo sa ANQR na may pinakamainam na mga setting (Error Correction H, generous quiet zone, malinis na styling), na-export bilang SVG, at naka-store bilang nag-iisang authoritative source. Ang link ng pagsasaayos ng ANQR ay naidokumento sa tabi ng SVG file upang ang code ay muling mabuo kung kinakailangan.', 'Ang bawat disenyador at tindero ay tumanggap ng iisang SVG master na may maliwanag na mga tagubilin: ilagay sa kinakailangang laki, huwag baguhin, panatilihin ang tahimik na sona. Para sa mga tindero na nangangailangan ng mga radyo format, ang kompanya ay nagbigay ng mga pre-rendered PNG sa mga espesipikong sukat na may malinaw na pagpapangalan sa mga kombensiyon na nagpapahiwatig ng nilalayong paggamit.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Isang pakete ng talaksan na nagpapakita ng SVG master, mga sukat-specific PNG, dokumentong pang-espasyo, at kawing pang-ayos',
          caption: 'Ang package: lahat ng bagay na kailangan ng mga nagtitinda upang magkaroon ng di - nagbabagong resulta nang hindi humuhula',
        },
      ],
    },
    {
      heading: 'Mga Pagsaalang - alang sa Size-Specific',
      paragraphs: ['Ang bawat format ay nangangailangan ng espesipikong atensiyon. Ang mga ipinasok ni Badge sa 3cm ay nangangailangan ng QR upang umokupa ng sukdulang magagamit na distansiya sa pagitan ng space scanning ay ang haba ng braso. Kasama sa mga toldang may tig - 8cm ang mapalamuting pamumumuti sa labas ng tahimik na sona. Ang 4-metre baner ay nangangailangan ng kalkulasyon: mula sa karaniwang layo ng manonood (15-20 metres), ang mga module ay kailangang malinaw na makilala sa pamamagitan ng mga kamera ng telepono, na nangangahulugang ang QR ay kailangan upang maging hindi bababa sa 80cm sa loob ng disenyo ng baner.', 'Ang kompanya ay lumikha ng isang senizing guide documenting minimum QR dimensiyons para sa bawat inaasahang scanning distance. Ito ay naging isang magagamit na muli para sa mga pangyayari sa hinaharap, inaalis ang panghuhula mula sa proseso ng disenyo.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Isang tsart na nagpapakita ng kaugnayan sa pagitan ng scanning distance, minimum na sukat ng QR, at mga dimensiyong module para sa bawat format ng pangyayari',
          caption: 'Ang pagpepetsa ng matrix: pagtatantiya ng mga dimensiyon upang matiyak ang maaasahang pagsusuri sa bawat inaasahang distansiya ng bawat format',
        },
      ],
    },
    {
      heading: 'Mga Resulta ng Produksiyon',
      paragraphs: ['Sistematiko ang pagpapatunay sa araw ng kumperensya: sinubukan ng mga kawani ang bawat naka-deploy na QR bago magbukas ng mga pinto. Agad na na-scan ang mga pagsingit ng badge sa haba ng braso. Ang mga table tent ay gumagana nang mapagkakatiwalaan sa variable na pag-iilaw ng mga breakout room. Ang banner ng entablado - ang kahihiyan ng nakaraang kaganapan - ay matagumpay na na-scan mula sa gitna ng audience area.', 'Ang Zero scanning na mga reklamo ay itinala sa 2,000+ na mga dumalo. Ang panalo ng operasyon ay parehong mahalaga: kapag ang isang huling-minutong sponsor ay nangangailangan ng bagong signage, ang pangkat ng produksiyon ay lumilikha nito mula sa master SVG sa mga minuto, nagtitiwala na ito ay magtutugma sa lahat ng iba pang bagay.', 'Tingnan ang Learn guide sa mga print-ready QR code para sa SVG vs na desisyon balangkas at handoff pinakamahusay na mga gawain.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Pangyayari ang potograpiya na nagpapakita ng mga dumalo na matagumpay na sinuri ang mga code ng QR sa iba\'t ibang laki at distansiya sa buong lugar',
          caption: 'Tagumpay sa araw ng Conference: maaasahang scanning sa bawat format, mula sa badge close-ups hanggang sa mga band distance shot',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Browse Matuto ng mga artikulo',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Pag - aaral ng Kaso: Digital na Pagtatanghal ng Paliparan',
      paragraphs: ['Ang halimbawang ito ay sumusunod sa isang airline lounge na gumagamit ng static QR code sa kanilang digital reassignment screens. Ang mga screen ay nagpamalas ng umiikot na promotional content, ngunit ang QR code para sa rehabilitation check-in ay umupo sa isang sulok, statistic at madaling kaligtaan. Ang analytics ay nagpakita lamang ng 15% ng mga karapat-dapat na bisita ay gumamit ng QR check-in sa kabila na ito ay mas mabilis kaysa sa desk queue. Hindi ito napansin ng karamihan sa mga panauhin.', 'Ang teoriya ay simple: sa isang kapaligirang abala sa paningin na may gumagalaw na nilalaman, ang isang static QR ay nagiging hindi nakikita. Ang solusyon na kinakailangan upang maging kapansin-pansin ang QR nang hindi ikinokompromiso ang pagkamaaasahan na kinakailangan para sa isang pagsusuri-in stream kung saan ang pagkabigo ay mangangahulugan ng bigong mga manlalakbay at mas mahabang desk queues.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Isang digital display sa isang airport lounge na nagpapakita ng promosyonal na nilalaman na may maliit, static QR code sa sulok',
          caption: 'Ang orihinal na setup: isang static QR na nawala sa isang dagat ng dinamikong promosyonal na nilalaman, na nakakamit lamang ang 15% pag-aampon',
        },
      ],
    },
    {
      heading: 'Pagdidisenyo ng Ligtas na Anisyon',
      paragraphs: ['Ang digital signage ng pahingahan ay gumamit ng malalaking LED panel - isang mahirap na kapaligiran kung saan ang agresibong animasyon ay maaaring lumikha ng mga problema sa pagsusuri. Ang pangkat ng disenyo ay nagsimula nang konserbatibo: isang banayad na pulse effect na palihim na pinalawak at nakuha ang visual na presensiya ng QR nang hindi binabago ang aktuwal na istraktura ng code. Ang Frame time ay itinakda dahan-dahan (250ms) upang maiwasan ang anumang aandap-kislap na isyu na may LED respiration rate.', 'Natiyak ng safety Mode ang bawat balangkas nito na maaaring suriin. Ang karagdagang pagsubok sa aktuwal na mga panel ng LED ay nagsisiwalat na ang pulso ay kailangan pang maging mas tuso kaysa mga preview sa desktop na iminungkahing - LED thight at ang mga anggulo sa panonood ay nakaapekto sa nakikitang pagkakaiba nang higit kaysa inaasahan.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Ang ANQR animation setting panel na nagpapakita ng pagsasaayos ng pulso: mabagal na tiyempo, bahagyang katindihan, ang Safety Mode ay nakatulong',
          caption: 'Animation configuration: Ang mga parameter ay nag - aayos ng LED panel habang pinananatili ang pagiging maaasahan ng scan sa bawat balangkas',
        },
      ],
    },
    {
      heading: 'Pagkahibang na May Nasisiyahan sa Pagsesenyas',
      paragraphs: ['Ang masiglang QR ay nakaposisyon sa isang dedikadong \'stable zone\' ng screen na maayos - isang lugar na nanatiling hindi nagbabago habang ang promotional content ay umiikot sa pangunahing display area. Ang paghihiwalay na ito ay mahalaga: Ang QR ay nangangailangan ng katatagan sa paningin para sa pagninilay-nilay habang umaakit ng pansin sa pamamagitan ng tusong animasyon nito.', 'Isang malinaw na call-to-action ang idinagdag sa tabi ng QR: \'Laktawan ang pila - i-scan upang mag-check in.\' Ang teksto ay nanatiling static habang ang QR pulsed, na lumilikha ng isang visual na hierarchy na iginuhit ang mata sa pag-scan ng pagkakataon nang hindi labis ang pampromosyong nilalaman.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Isang screen na pagkakaayos na larawan na nagpapakita ng masiglang QR sa isang matatag na sona samantalang ang nilalamang promosyonal ay umiikot sa pangunahing lugar',
          caption: 'Pagbuo ng lupa at lupa: Ang aktibong QR ay sumasakop sa isang matatag na sona na hiwalay sa umiikot na nilalamang promosyonal',
        },
      ],
    },
    {
      heading: 'Technical Deployment',
      paragraphs: ['Ang animated na QR ay na-export bilang GIF na may mga naka-optimize na setting para sa signage CMS. Ang mga pagsasaalang-alang sa laki ng file ay mahalaga - ang sistema ng pamamahala ng nilalaman ng lounge ay may mga limitasyon sa pag-upload, at ang sobrang malalaking file ay nagdulot ng pagkautal sa pag-playback. Ang huling pag-export ay balanseng visual na kalidad laban sa laki ng file sa pamamagitan ng paglilimita sa color palette at pag-optimize ng bilang ng frame.', 'Ang Deployment ay kinabibilangan ng isang fallback: kung ang GIF ay hindi makapaglaro sa anumang kadahilanan, ang sistema ng signage ay magpapakita ng static PNG backup. Ang redundancy na ito ay natiyak na kakayahan ng tseke-in ay hindi kailanman nawala dahil sa teknikal na mga isyu sa animation.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Isang CMS interface na nagpapakita ng masiglang QR up na may fallback static na larawan na nakaayos',
          caption: 'Signage CMS configuration: Ang masiglang panimula na may static fallback na tumitiyak sa kakayahan ng check-in ay hindi kailanman naaabala',
        },
      ],
    },
    {
      heading: 'Nasukat na Epekto',
      paragraphs: ['Pagkatapos ng isang buwang operasyon, ang QR check-in ampon ay tumaas mula 15% tungo sa 24% - isang 60% relatibong pagpapabuti. Ang mga surbey ng Guest feedback ay nagpapahiwatig na ang masiglang QR ay \'easier upang mapansin\' at \'nadamang mas moderno.\' Desk queue times measurely nabawasan sa mga peak period habang mas maraming mga bisita self-served sa pamamagitan ng QR.', 'Mahalaga, ang sero scanning ay iniulat sa kabila ng libu - libong mga scan. Ang konserbatibong animasyong pamamaraan ay nakamit ang tunguhing pansin nang hindi isinasakripisyo ang pagiging maaasahan na hinihingi ng isang pagsusuri-in stream. Pagkatapos, ang pahingahang - dako ay naglabas ng katulad na masiglang mga QR sa kanilang iba pang mga lokasyon.', 'Tingnan ang Learn guide sa masiglang QR codes para sa digital signage para sa teknikal na mga simulain sa likod ng ligtas na disenyo ng animation.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Isang dashboard na nagpapakita ng bilis ng pag-aampon, queue na pagbawas ng oras, at sero-failure scan pagkamaaasahan sa yugto ng pag-aampon',
          caption: 'Isang buwan ng datos: 60% pag - aampon, nabawasang oras ng pag - aampon, at napananatili ang ganap na pagkamaaasahan ng scan',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Browse Matuto ng mga artikulo',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Pag - aaral ng Kaso: Pangglobong Produksyon Launch QR Kampanya',
      paragraphs: ['Ang halimbawang ito ay sumusunod sa isang kompanya ng konsumer electronics na sabay-sabay na naglulunsad ng isang bagong produkto sa 12 pamilihan sa ibayo ng 8 wika. Ang bawat pangkat ng panrehiyong marketing ay kinakailangan upang makagawa ng mga package, mga retail display, at mga materyal na promosyonal na nagtatampok ng QR code na nag-uugnay sa mga lokal na pahina ng produkto. Ang naunang mga paglulunsad ay nagbunga ng pabagu - bagong QR styling, paminsan - minsang mga kabiguan sa scanning, at isang \'telephone game\' ng configuration drift habang muling binabago ng bawat pangkat ang mga code mula sa screenshot.', 'Ginamit ng solusyon ang naibabahaging mga link ng configuration ng ANQR upang magtatag ng isang pinagmumulan ng katotohanan na maaaring ma-access ng bawat pangkat ng rehiyon, anuman ang kanilang wika sa interface. Gumamit ang QR payload ng matalinong pag-redirect na naka-detect ng wika ng user, kaya gumagana ang isang code sa buong mundo habang naghahatid ng mga naka-localize na karanasan.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Isang mapa ng daigdig na nagpapakita ng 12 dako ng pamilihan na may QR codes, ang ilan ay hindi magkasundo sa isa\'t isa',
          caption: 'Ang hamon: 12 pamilihan, 8 wika, at isang kasaysayan ng pabagu - bagong pagpapatupad ng QR sa mga rehiyon',
        },
      ],
    },
    {
      heading: 'Pagtatatag ng Dalubhasang Kondisyon',
      paragraphs: ['Ang global brand team ay lumikha ng autorital na QR configuration sa ANQR: ang mga kulay ng tatak ay tumutugma sa visual identity ng produkto, ang Error recision H para sa pagkamaaasahan sa lahat ng print at digital application, at styling na walang pagbabagong mag-ebolb anuman ang mga lokal na paraan ng produksiyon. Ang kaayusan ay naikandado at ang kawing ng bahagi na dokumentado sa pangglobong kampanya ay maikli.', 'Kritikal, ang naka-encode na URL ay gumamit ng serbisyo sa pag-redirect sa pagtukoy ng wika. Kapag na-scan, ang mga user ay awtomatikong nai-ruta sa kanilang pahina ng produkto ng lokal na wika. Nangangahulugan ito na ang lahat ng 12 market ay maaaring gumamit ng magkatulad na QR code - walang per-market payload variation na maaaring magpakilala ng mga error.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Ang ANQR interface na nagpapakita ng master configuration na may mga tatak na kulay, ECC H, at ang smart redirect URL',
          caption: 'Ang master configuration: Ang mga pamantayan ng mga tatak sa buong daigdig na inilakip sa iisang pinagmumulan ng katotohanan',
        },
      ],
    },
    {
      heading: 'Pag - agos ng Pandaigdig na Team',
      paragraphs: ['Natanggap ng bawat regional marketing team ang configuration link na may mga simpleng tagubilin: buksan ang link, i-verify na tumutugma ang preview sa mga alituntunin ng brand, i-export sa kinakailangang format para sa iyong aplikasyon. Ang interface ng ANQR ay ipinapakita sa ginustong wika ng bawat koponan, ngunit ang pinagbabatayan na mga setting ng QR ay nanatiling magkapareho anuman ang wika ng interface.', 'Kapag ang koponang Hapones ay nangangailangan ng SVG para sa mga high-end retail display at ang koponan ng Brazil ay nangangailangan ng PNG para sa social media, pareho silang nagluwas mula sa parehong configuration. Nang humiling ng espesipikong halaga ng kulay ang tindahan ng Alemang pangkat, maaari nilang tuwirang banggitin ang kaayusan sa halip na hulaan ito mula sa screenshot.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Mga Screenshot na nagpapakita ng iisang kawing ng pagsasaayos na binuksan sa mga interface ng Hapon, Portuges, at Aleman',
          caption: 'Magkaparehong pagsasaayos, iba\'t ibang interface: Ang mga pangkat na pangrehiyon ay nagtatrabaho sa kanilang mas gustong wika samantalang pinananatili ang pangglobong pagkakasuwato',
        },
      ],
    },
    {
      heading: 'Pagharap sa mga Pagbabago sa Rehiyon',
      paragraphs: ['Ang ilang pamilihan ay nangangailangan ng bahagyang pakikibagay. Kailangan ng pangkat ng mga Tsino ang isang bersyon na may isang WChat-optimed frame para sa social share. Sa halip na baguhin ang master, lumikha sila ng isang dokumentadong variety na may sariling configuration link, na malinaw na pinangalanan bilang \'CN-WeChat variant\' sa kampanya asset library. Ito ay nagpanatili ng bakas habang pumapayag sa kinakailangang lokalasyon.', 'Ang koponan ng brand ay nagtatag ng isang payak na tuntunin: anumang pagkakaiba mula sa maestro ay nangangailangan ng isang bago, dokumentadong kawing ng kaayusan. Walang mga modipikasyon upang iluwas ang mga files, walang \'mabilis na fixes\' sa design software. Nahadlangan nito ang pagkaanod na sumalot sa dating mga lantsa.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Isang mahalagang silid - aklatan na may interface na nagpapakita ng dalubhasang kaayusan at sinang - ayunang mga pagkakaiba sa rehiyon, bawat isa\'y may kani - kaniyang kawing',
          caption: 'Kampanya asset governrance: master configuration at dokumentadong mga variant, na pawang matutunton sa pamamagitan ng mga kawing ng pagsasaayos',
        },
      ],
    },
    {
      heading: 'Mga Resulta ng Pandarambong',
      paragraphs: ['Nakita ng mga product launch day ang mga code ng QR na nakalagay sa mga pakete, mga retail display, mga materyales para sa okasyon, at mga digital na kampanya sa lahat ng 12 pamilihan nang sabay-sabay. Ang mahusay na mga audit ay nagpatunay ng nakikitang pagkakasuwato sa ibayo ng mga rehiyon - ang QR sa mga retail display sa Tokyo ay nagtugma sa QR sa São Paulo package ay nagtugma sa QR sa mga band ng laro sa Berlin.', 'Ang mga kabiguan ng Zero scanning ay iniulat sa ibayo ng mga pamilihan. Nang kailanganin ang isang post-launch product page URL change, ang redirect service ay humawak dito nang hindi nakikita - walang muling paglilimbag na kinakailangan. Tinataya ng pangglobong pangkat na ang paraan ng pag - uugnay ay nakatipid ng 40+ oras ng koordinasyon ng panahon kung ihahambing sa kanilang dating paraan ng paglulunsad.', 'Tingnan ang Learn guide tungkol sa cross-lingual QR cooperation para sa gumaganang mga prinsipyo sa likod ng global campaign.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Isang grid ng mga larawan na nagpapakita ng hindi nagbabagong QR na paglalagay ng larawan sa iba\'t ibang pamilihan: Tokyo retail, São Paulo package, mga kaganapan sa Berlin',
          caption: 'Nakamit ang pangglobong pagbabago: ang magkatulad na presentasyon ng QR sa 12 pamilihan sa kabila ng iba\'t ibang wika, tindero, at format',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Browse Matuto ng mga artikulo',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Browse Matuto ng mga artikulo', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Buksan ang Buong Gaser Guide', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Buksan ang galerya', type: 'gallery' },
  ],
};
