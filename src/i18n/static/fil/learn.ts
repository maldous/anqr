import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Matuto sa ANQR',
  description: 'Praktikal, pang-negosyo na mga gabay para sa paggawa ng mga QR code sa totoong marketing asset - hindi lamang functional na mga parisukat. Matutunan kung paano mag-upgrade ng mga legacy na point-of-sale code, gumawa ng compliant na pagbabayad na QR signage, maghanda ng mga print-ready na pag-export, ligtas na gumamit ng animation sa mga digital na display, at magbahagi ng mga naka-lock na configuration sa mga multilingual na team gamit ang ANQR ("anchor") na mga link.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buksan ang generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Tingnan ang mga halimbawa ng QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Buksan ang Buong Gaser Guide', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Pagpapasulong sa mga Kampanya ng QR',
      paragraphs: ['Karamihan sa mga negosyo ay may mga QR code na nakakalat sa kanilang mga operasyon - sa mga menu, counter stand, packaging, at mga materyal na pang-promosyon. Marami sa mga code na ito ay nilikha taon na ang nakakaraan gamit ang mga pangunahing generator, na nagreresulta sa mga generic na black-and-white na parisukat na nabigong magbigay ng inspirasyon sa kumpiyansa o tumugma sa pagkakakilanlan ng iyong brand. Ang komprehensibong gabay na ito ay nagtuturo sa iyo sa isang sistematikong diskarte sa pag-audit, pag-upgrade, at pag-optimize ng iyong umiiral na imprastraktura ng QR nang hindi nakakaabala sa mga paglalakbay ng customer na naitatag mo na.', 'Ang estratehikong bentaha ng pag - aalsa sa halip na palitan ang iyong mga kodigo ng QR ay nakasalalay sa pagpapanatiling patuluyan. Natutuhan na ng iyong mga parokyano na umasa sa tiyak na mga patutunguhan kapag sinusuri nila ang iyong mga kodigo. Sa pamamagitan ng pagpapanatiling magkatulad ng kodigong mga URL samantalang lubhang pinabubuti ang visual na presentasyon, ang pagiging maaasahan, at ang pagkakahanay ng mga marka, lumilikha ka ng isang di - mababagong pagbabago na nagpapatindi sa pagtitiwala nang hindi na nangangailangan ng anumang pagbabago sa iyong digital na imprastraktura o pagsusuri ng mga anestics.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Isang side-by-side na paghahambing na nagpapakita ng isang kupas, generic QR code na katabi ng isang modernong naka-market na bersyon na nagreresulta sa parehong URL',
          caption: 'Bago at pagkatapos: Ang destinasyon ding iyon na URL ay nagbago mula sa isang pinetsahang kodigong generic tungo sa isang propesyonal na kilalang asset',
        },
      ],
    },
    {
      heading: 'Kung Bakit Gumagana ang mga Kodigong Legacy QR',
      paragraphs: ['QR codes na nilikha sa panahon ng maagang yugto ng pag-aampon - partikular na sa panahon ng 2020-2021 nang ang mga negosyo ay sumugod upang ipatupad ang mga walang pakikipag-ugnayang solusyon - kadalasang dumaranas ng ilang mga kritikal na isyu. Nagiging marupok ang mga ito kapag nakalimbag sa mga ibabaw na may kinis o nakikita sa ilalim ng humahamong liwanag dahil sa mababang pagtutuwid. Ang di - sapat na tahimik na mga sona ay nagiging sanhi ng mga kabiguan sa scanning kapag ang mga kodigo ay inilagay malapit sa iba pang nakikitang elemento. Hindi naipapahayag ng pagme - Generic styling ang pagiging lehitimo ng tatak, na humahantong sa pag - aatubili at pagbabawas ng bilang ng scan.', 'Bukod sa teknikal na mga limitasyon, ang mga kodigong pamana ay kadalasang kumakatawan sa nawawalang mga pagkakataon sa paghehero. Ang bawat QR code ay isang touchpoint sa iyong parokyano - isang sandali kung saan sila ay aktibong gumagawa at handang kumilos. Isang propesyonal na kodigo na katumbas ng mga kulay ng iyong tatak, pati na ang angkop na mga mardyin na pangkaligtasan, at nagtatampok ng di - opsyonal na markang mga elemento na gumagawa sa kagamitang ito na maging isang bagay na ginagamit sa pagbebenta na nagpapatibay sa iyong pagkakakilanlan sa bawat interaksiyon.'],
    },
    {
      heading: 'Pagdaraos ng Isang QR Code Audit',
      paragraphs: ['Magsimula ka sa iyong upgrade project sa pamamagitan ng paggawa ng isang komprehensibong imbentaryo ng bawat QR code na kasalukuyang inilalagay sa ibayo ng iyong negosyo. Itala ang lokasyon ng katawan, ang naka - rehistrong destinasyon, ang kasalukuyang kalagayan ng nakalimbag na materyal, at ang karaniwang lugar na pinag - aaralang mabuti kabilang na ang mga kalagayan ng ilaw at ang mga anggulo ng tanawin. Subukin ang bawat kodigo sa pamamagitan ng multiple device - mas lumang mga smartphone at mga aparato sa badyet na kadalasang nagsisiwalat ng maaasahang mga isyu na ginagawa ng maskara ng mga teleponong premium.', 'Bigyang-pansin ang mga code sa mga lokasyong may mataas na stake: mga payment point, check-in area, at promotional display kung saan ang pagkabigo sa pag-scan ay direktang nakakaapekto sa kita o karanasan ng customer. Dapat unahin ang mga ito para sa agarang pag-upgrade. Tandaan din ang mga code na lumalabas sa content ng photography o video, dahil mangangailangan ito ng pakikipag-ugnayan sa iyong marketing team para i-update ang mga visual asset.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Isang talaan ng mga impormasyon na nagpapakita ng mga kategoryang QR audit: lokasyon, kondisyon, scan pagkamaaasahan, at priyoridad',
          caption: 'Systematic QR audit template para sa pagtatala at pag-uuna sa iyong mga kandidato sa upgrade',
        },
      ],
    },
    {
      heading: 'Ang Ligtas na Estratehiya sa Upgrade',
      paragraphs: ['Ang pangunahing panuntunan ng mga pag-upgrade ng QR ay pagpapanatili ng destinasyon. I-extract ang eksaktong URL mula sa bawat umiiral na code at i-encode ito nang magkapareho sa iyong bagong bersyon. Tinitiyak nito na mananatiling buo ang lahat ng umiiral na analytics, redirect logic, at inaasahan ng customer. Kung kailangan mo ng flexibility ng patutunguhan para sa mga update sa hinaharap, ito ang mainam na oras para magpakilala ng isang branded na maikling URL o serbisyo sa pag-redirect - ngunit ipatupad ito bilang isang hiwalay na proyekto upang maiwasan ang pagsasama-sama ng mga pagbabago.', 'Para sa visual upgrade, maglagay ng mga pagpapabuti sa mga layer: una muna\'y tiyakin ang teknikal na pagkamaaasahan (appropriate error reflection at tahimik na sona), pagkatapos ay idagdag ang brand styling (colours, module na hugis), at sa wakas ay isaalang - alang ang opsyonal na mga pagpapainam (gitnang mga balot, balangkas). Ang bawat suson ay dapat na tiyakin sa pamamagitan ng pagsubok bago magpatuloy. Ang ANQR\'s Safety Mode ay tumutulong sa pagpapatupad ng mga prayoridad na ito sa pamamagitan ng pagbababala kapag ang mga pagpipiliang pampagtatalik ay maaaring magkompromiso ng pagiging scannabilidad.'],
    },
    {
      heading: 'Idagdag ang Brand Identity Nang Walang Kabatiran',
      paragraphs: ['Ang epektibong QR branding balance ay nagreresulta sa visual effect laban sa scan pagkamaaasahan. Magsimula sa kulay: palitan ang default black concept ng iyong pangunahing kulay, tinitiyak ang sapat na pagkakaiba sa iyong pinagmulan. Para sa karamihan ng mga brand, ang maiitim na kulay tungkol sa mga bagong pinagmulan ang pinakamabisa. Iwasan ang mababang-contrast na mga kombinasyon, mga scapile na nagpapagaan sa gilid, o mga kulay na lumilitaw na kahawig sa ilalim ng karaniwang mga kondisyon ng ilaw.', 'Ang module hugis custisation ay nag-aalok ng isa pang pagkakataon ng pag-uuri na may kaunting pagkamaaasahan. Ang mga carded module ay lumilikha ng mas malambot, mas madaling lapitang hitsura samantalang pinananatili ang mahusay na pagka - scannity. Ang mga dot-style module ay gumaganang mahusay para sa makabago, tech-forward brands. Ang magkakaugnay na mga module ay angkop sa pagkakakilanlan ng industriya o korporasyon. Anumang istilo ang piliin mo, panatilihin ang pagiging hindi pabagu - bago sa lahat ng iyong paggamit ng QR para sa kagyat na pagkilala sa tatak.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Isang larawan ng color wheel na nagpapakita ng napakahusay na kombinasyon ng kulay QR na may paghahambing na mga pahiwatig',
          caption: 'Brand color selection guide na nagpapakita ng high-contrast na mga kombinasyon na nagpapanatili sa pagiging maaasahan ng scan',
        },
      ],
    },
    {
      heading: 'Pagsusuri at Protocol ng Eleksiyon',
      paragraphs: ['Huwag kailanman mag-upgrade ng mga code ng QR nang walang mahigpit na pagsubok. Mag - imprenta ng isang pisikal na patotoo sa eksaktong laki at gayunding materyal na gaya ng iyong pangwakas na gamit. Subukin sa aktuwal na lugar kung saan titira ang kodigo, sa iba\'t ibang panahon sa araw - araw upang isaalang - alang ang pagkakaiba - iba ng ilaw. Gumamit ng hindi bababa sa tatlong iba\'t ibang aparato: isang kasalukuyang flagship phone, isang mid-range device, at isang mas matanda o badyet na smartphone.', 'Mag - scan ng oras at bilis ng tagumpay sa bawat pagsusulit. Ang isang mahusay-optimed code ay dapat mag-scream sa loob ng 1-2 segundo sa anumang makatuwirang modernong aparato. Kung nakikita mo ang patuloy na pagkaantala o mga kabiguan, bawasan ang matinding pag - aalis o pagliit ng mga balot, dagdagan ang sukat ng tahimik na sona, o lumipat sa mas mataas na antas ng pagtutuwid. Laging nauuna ang pagiging palakaibigan kaysa sa pagiging masalimuot ng paningin.'],
    },
    {
      heading: 'Pagharang sa Iyong Konstansiya',
      paragraphs: ['Minsang mapatunayan mo ang isang napakahusay na kaayusan, ingatan ito na ginagamit ang mga kawing na maaaring pagsaluhan ng ANQR. Ito\'y lumilikha ng permanenteng rekord ng bawat setting na ginagamit upang lumikha ng iyong sinang - ayunang mga kulay ng kodigo, istilong module, maling pagtutuwid, pag - aayos, at anumang balot. Ibahagi ang kaugnayang ito sa iyong pangkat ng disenyo, mag - imprenta ng mga tindero, at sa sinuman na baka kailangang gumawa ng kodigo sa hinaharap.', 'Pinipigilan ng configuration lock na ito ang unti-unting pagkasira na sumasalot sa maraming QR deployment. Kung wala ito, muling likhain ng mga miyembro ng kawani ang mga code mula sa mga screenshot, muling ibubuo ng mga taga-disenyo ang mga setting mula sa memorya, at ang mga vendor ng pag-print ay gumagawa ng \'kapaki-pakinabang\' na mga pagsasaayos. Ang bawat variation ay nagpapakilala ng mga potensyal na isyu. Sa isang naka-lock na link ng configuration, ang bawat reproduction ay kapareho ng iyong nasubok, naaprubahang orihinal.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Isang diagram na nagpapakita ng configuration drift: mga screenshot na humahantong sa mga libangan na humahantong sa mga variant, kumpara sa isang link ng source-of-truth',
          caption: 'Iwasan ang pag - anod sa pamamagitan ng pagtatatag ng isang may awtoridad na pinagmumulan para sa lahat ng pag - aanak ng QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Mga QR Code para sa Mga Retail Payment',
      paragraphs: ['Ang mga code ng Payment QR ay gumagana sa pinaka-kinakailangang kapaligiran sa retail: ang sandali ng transaksiyon. Ang mga parokyano ay handang magbayad, kadalasan nang may queue na nabubuo sa likuran nila, at ang bawat segundo ng pagkaantala ay lumilikha ng pagkiskis. Gayunman ang high-pressure na sandaling ito ay pangunahing real estate din para sa brand refide. Ipinaliliwanag ng giyang ito kung paano lilikha ng mga kodigo ng bayad na QR na agad na nagsusuri sa mga ap ng bangko samantalang naghaharap pa rin ng isang propesyonal, may tatak na hitsura na gumagawa sa pagtitiwala ng parokyano.', 'Ang saligang prinsipyo para sa pagbabayad ng QR codes ay ang pagkamaaasahan sa mga aesthetics. Ang isang maganda ang pagkakadisenyong kodigo na hindi nag - scan sa isang stage app ng isang parokyano ay magkakahalaga sa iyo nang higit sa pinabayaang mga transaksiyon at bigong mga parokyano kaysa sa magagawa ng isang konserbatibong disenyo. Magsimula sa pagsunod, magdagdag ng pagkamaaasahan, pagkatapos ay maingat na igisa lamang kung saan hindi nito ikinokompromiso ang pangunahing gawain.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Isang retail counter na nagpapakita ng isang kodigo ng bayad na QR na sinusuri ng isang smartphone na may isang ap ng bangko',
          caption: 'Ang Payment QR code ay dapat gumana agad sa banking at wallet apps sa ilalim ng real-world counter na kondisyon',
        },
      ],
    },
    {
      heading: 'Pag - unawa sa mga Pamantayan ng Pagbabayad QR',
      paragraphs: ['Karaniwang sinusunod ng mga kodigo ng Payment QR ang mga pamantayang pangrehiyon na nagdidikta sa format ng payload. Sa Singapore, ang Pay Now QR ay gumagamit ng espesipikong formatting. Sa India, sinusunod ng mga kodigo ng UPI ang mga pamantayang BharatQR o UPI na malalim na nag-uugnay. Ang mga kabayarang European SEPA ay gumagamit ng mga kodigong EPC QR. Ang bawat pamantayan ay umiiral upang tiyakin ang mga app sa pagbabangko ay maaaring agad makilala at iproseso ang impormasyon tungkol sa pagbabayad. Ang pag - aalis mula sa mga pamantayang ito - kahit na bahagya - ang - halaga ay magpapangyari sa mga app sa pagbabayad na tanggihan ang mga kodigo na binabasa ng mga generic camera scanner nang walang isyu.', 'Ang ANQR ay naglalakip ng mga template para sa pangunahing mga pamantayan sa pagbabayad na kusang nag - aayos sa iyong mga detalyeng pangkalakal upang maging pare - parehong mga sahod. Laging gamitin ang mga template na ito sa halip na manu - manong gumawa ng mga kuwerdas na pambayad, yamang kahit ang maliliit na pagkakamali sa pagbuo ay maaaring maging sanhi ng mga kabiguan sa transaksiyon. Kung ang pamantayan sa pagbabayad ng iyong rehiyon ay hindi makukuha bilang template, sumangguni sa teknikal na dokumentasyon ng iyong tagapaglaan para sa eksaktong mga kahilingan sa pagbuo.'],
    },
    {
      heading: 'Pag - aayos at Pamamahagi ng Kontrang mga Pagtatanghal',
      paragraphs: ['Ang mga Count-top QR code ay napapaharap sa mga kakaibang pisikal na hamon. Ang mga parokyano ay tumitingin sa kahabaan ng braso, kadalasan sa isang anggulo, kung minsan sa pamamagitan ng mga guwardiya sa pagbahin o mga kaha ng displey. Ang matinding liwanag ay lumilikha ng nakasisilaw na mga batik. Ang kodigo ay nakikipagkumpitensya sa iba pang mga kontra kalat para sa atensiyon at malinaw na mga viewline. Prituhin ang iyong bayad QR nang sagana - isang minimum na 4-5cm ang inirerekomenda para sa karamihan ng mga kontrang aplikasyon, na tumataas kung ang kodigo ay nakaupo sa likod ng salamin o sa isang madilim na lugar.', 'Ipuwesto ang mga bagay na kasinlaki nito. Ilagay ang code kung saan maaaring maginhawang hawakan ng mga parokyano ang kanilang telepono nang hindi hinahadlangan ang queue o umaabot nang asiwa. Pakuluin ang pagtatanghal sa parokyano sa halip na patagin ito. Hangga\'t maaari, gumamit ng matte lamination o di-malinaw na display na mga materyal upang mabawasan ang liwanag mula sa ilaw sa itaas. Subukin ang pangwakas na paglalagay sa iba\'t ibang panahon sa araw upang magsindi ng ilaw.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Isang dayagram na nagpapakita ng napakahusay na taas at anggulo ng QR para sa iba\'t ibang kontra - ayos',
          caption: 'Reuntment guide: Napakagandang taas, anggulo, at distansiya para sa mapananaligang pagsusuri sa pagbabayad',
        },
      ],
    },
    {
      heading: 'Conservative Branding para sa Mga Code ng Pagbabayad',
      paragraphs: ['Ang pagbabayad ng mga app ay hindi gaanong mapagpatawad kaysa sa mga generic camera scanner. Maraming mga app sa pagbabangko ang gumagamit ng mas matanda, mas simpleng QR na nagbabasa ng algorithms na tamang - tama para sa bilis sa halip na pag-aangkop. Nangangahulugan ito ng pag - iistrikto na ang isang kamera ng telepono ay maaaring hindi gumana sa pamamagitan ng espesipikong mga app na bayad. Manatiling konserbatibo: gamitin ang kulay ng iyong tatak para sa pang - ibabaw na kulay kung ito\'y may malaking pagkakaiba, subalit iwasan ang mga pahiyas, mabibigat na balot, o palamuti na maaaring makahadlang sa pagkilala.', 'Kung nais mo ng isang logo ng sentro o cluster, panatilihin itong lubhang maliit - hindi hihigit sa 10-15% ng lugar ng QR - at subukin nang malawakan sa bawat bayad app ang iyong mga parokyano ay maaaring gamitin. Pinipili ng maraming negosyo ang walang tapal sa mga kodigo ng pagbabayad, iniingatan na ang pag - iingat para sa pagbibili ng mga kodigo ng QR kung saan ang mga kahilingan ng pagkamaaasahan ay hindi gaanong mahigpit. Ang trabaho ng kodigo ng pagbabayad ay gumawa ng mga transaksiyon, hindi upang pahangain ang paningin.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Isang paghahambing na nagpapakita ng katanggap-tanggap na mga vs mapanganib branding level para sa bayad QR codes',
          caption: 'Payment QR branding spectrum: mula sa ligtas na konserbatibong styling hanggang sa mapanganib na mga paraan ng pagdekorasyon',
        },
      ],
    },
    {
      heading: 'Materyal at Palimbagang mga Pagpapakundangan',
      paragraphs: ['Ang materyal na pisikal na displey ay lubhang nakaaapekto sa pagkamaaasahan ng scan. Kitang - kita sa glossy lamination ang mga ilaw sa itaas na tuwirang pumapasok sa kamera ng kostumer. Maaaring pilipitin ng mga materyales na tinured ang mga gilid ng module. Ang di - gaanong malaking paglilimbag ay maaaring magpalabo sa maiinam na detalye. Para sa pagbabayad QR codes, mamuhunan sa kalidad: gumamit ng matte o satin lamination, tiyakin ang high-resolution printing, at palitan ang mga display bago ito ipakita. Ang isang nakalmot o kupas na kodigo ng kabayaran ay magastos sa iyo.', 'Isaalang - alang ang tibay at pagiging matatag ng displey. Ang mga pagtatanghal ng mga bahay - kalakal ay naaantig, naantig, sumaboy, at paminsan - minsan ay natutumba. I-sign ang iyong display system para madaling mapalitan ang QR ink nang hindi napapalitan ang buong stand. Panatilihing handa ang mga ekstrang letra, na gawa mula sa iyong nakakandadong kawing, kaya ang lumang mga kodigo ay maaaring palitan kaagad.'],
    },
    {
      heading: 'Pagsubok na May Tunay na Gantimpala Mga App',
      paragraphs: ['Ang mga generic na scanner ng camera ay magde-decode ng halos anumang makatwirang na-format na QR code. Mas pinipili ang mga app sa pagbabayad. Bago mag-deploy ng anumang QR code ng pagbabayad, subukan ito sa bawat app sa pagbabayad na maaaring gamitin ng iyong mga customer. Sa mga multi-payment environment, maaaring mangahulugan ito ng pagsubok gamit ang maraming banking app, digital wallet, at mga platform ng pagbabayad. Idokumento kung aling mga app ang nasubukan mo at ang kanilang mga bersyon - ang mga app sa pagbabayad ay madalas na nag-a-update, at maaaring baguhin ng isang update ang gawi sa pag-scan.', 'Subukin sa ilalim ng makatotohanang mga kalagayan: ang aktuwal na pagtatanghal, ang aktuwal na liwanag, ang aktuwal na scanning distance. Ang isang kodigo na agad na tumitingin sa iyong mesa ay maaaring makipagpunyagi sa counter sa 5pm kapag ang araw sa hapon ay lumilikha ng liwanag. Subukin mo ang pinakamatanda, pinakamurang smartphone na masusumpungan mo - kung ito\'y gumagana sa isang aparato sa badyet, ito\'y gagana sa lahat ng bagay. Bandila ang anumang scan time sa mahigit na 2 segundo para sa imbestigasyon at potensiyal na reproduksiyon.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Isang talaan ng mga pagsubok na nagpapakita ng iba\'t ibang mga app, mga uri ng aparato, at mga kalagayan sa kapaligiran upang tiyakin',
          caption: 'Komprehensibong bayad QR na sumusubok sa matrix na tumatakip sa mga app, device, at mga salik na pangkapaligiran',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Palimbagang QR Code: SVG vs PNG',
      paragraphs: ['Ang pagkakaiba sa pagitan ng isang QR code na perpektong nagsusuri at isa na nabigo ay kadalasang bumababa sa kung paano ito iluluwas at hawakan sa print workflow. Ipinaliliwanag ng gabay na ito ang mga kritikal na pagkakaiba sa pagitan ng vector (SVG) at raster (PNG) na format, kung kailan gagamitin ang bawat isa, at kung paano iaabot ang QR na gawang sining sa mga tagapagdisenyo at maglilimbag ng mga nagtitinda sa mga paraan na nag-iingat ng pagiging maaasahan ng scan mula sa mga business card hanggang sa billboard-sized signage.', 'Ang produksiyon ng print ay nagpapakilala ng mga variable na hindi umiiral sa screen: ang tinta ay kumalat, substrate striktura, mga proseso ng pagtatapos, at ang pinagsamang epekto ng maraming mga transbersiyon ng file. Ang isang QR code na mukhang napakahusay sa iyong computer ay maaaring lumabas sa printer na may malambot na mga gilid, nabawasang pagkakaiba, o may - katusuhang pinilipit na mga module. Ang pag - unawa sa pagpili ng format at ang pag - agos ng trabaho ang humahadlang sa tahimik na mga kabiguang ito.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Isang malaking tanawin na inihahambing ang vector QR module sa malutong na mga gilid laban sa mga raster module na nagpapakita ng mga artifact na pixel',
          caption: 'Vector vs raster sa print scale: ang eksaktong pagkakaiba na tumitiyak ng pagkamaaasahan ng scan',
        },
      ],
    },
    {
      heading: 'Kung Bakit Mas Gusto ng Vector (SVG) ang Palimbagan',
      paragraphs: ['Ang mga file ng SVG ay naglalarawan sa mga QR code bilang mga hugis matematikal sa halip na mga grid ng mga pixel. Ito ay nangangahulugang ang kodigo ay maaaring sukatin sa anumang sukat - mula sa isang 1cm label hanggang sa isang 10-metre banner - nang walang anumang pagkawala ng gilid na matalas. Isinalin ng RIP (Raster Image Processor) ng tagapaglimbag ang mga vector sa katutubong resolusyon ng aparatong output, tinitiyak na ang bawat gilid ng module ay kasinsimple ng hardware. Walang interpolasyon, walang anti-access artifacts, walang natipong malabo mula sa maramihang mga restitusyong operasyon.', 'Di - hamak na mas matibay ang SVG files kaysa sa trabaho. Nakabatay ang mga ito sa mga round-trip sa pamamagitan ng design software nang walang pagkasira. Ang mga ito ay maaaring kulay-tuwid nang walang resumpling. Nilagyan nila ng malinis sa PDF files para sa press-handang output. Para sa anumang print application kung saan ang kalidad ay mahalaga, ang SVG ay dapat na ang iyong default export format.'],
    },
    {
      heading: 'Kapag Kalugud - lugod ang PNG',
      paragraphs: ['Ang PNG ay nagiging kinakailangan kapag ang iyong workflow o destinasyon platform ay hindi sumusuporta sa mga vector format. Ang ilang web platform, sistema ng pagsesenyas ng CMS, at legacy print workflows ay nangangailangan ng mga larawang raster. Sa mga kasong ito, ang PNG ay maaaring gumana ng mahusay ngunit tangi lamang kung ikaw ay sumusunod sa mahigpit na mga tuntunin: pagluluwas sa panghuling pisikal na sukat at resolusyon, hindi kailanman nasusukat pagkatapos iluwas, at iwasan ang anumang dispensasyon o transpormasyon.', 'Ang kritikal na tuntunin para sa PNG ay kalkulahin ang iyong kinakailangang mga sukat ng pixel bago iluwas. Kung ang iyong QR ay maglilimbag sa 5cm at ang iyong tagapaglimbag ay tatakbo sa 300 DPI, kailangan mo ng humigit - kumulang 590 pixels. Itapon sa ganitong laki o laki, kung gayon ay bawasan kung kinakailangan. Isama ang impormasyong ito sa inyong file o metadata kaya ang mga gumagamit sa hinaharap ay hindi nagkataong maling ginagamit ang isang sukat-specific na pagluluwas.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Ipinakikita ng isang internet interface ang kaugnayan sa pagitan ng pisikal na sukat, ng DPI, at ng kinakailangang mga sukat ng pixel',
          caption: 'Palimbagan ang resolusyon: pagtiyak sa minimum na sukat ng pixel para sa iyong target na laki ng output',
        },
      ],
    },
    {
      heading: 'Ipinaliwanag ang Options ng ANQR Export',
      paragraphs: ['ANG ANQR ay nag-aalok ng ilang mga SVG export mode upang umangkop sa iba\'t ibang workflows. Ang reality Vector mode ay gumagawa ng purong path-based output ideal para sa print at propesyonal na mga gamit sa pagdidisenyo. Kapag nadagdag mo na ang mga radyo o ilang mga epekto, maaaring i-embrate ng ANQR ang mga ito habang pinananatili ang mga ventor module, o maaari kang magluwas ng isang ganap na radyo na bersyon sa iyong tiyak na resolusyon. Ang pag - unawa sa mga mapagpipiliang ito ay tutulong sa iyo na piliin ang tamang pagluluwas para sa bawat gamit na kaso.', 'Para sa mga iniluluwas ng PNG, hinahayaan ng ANQR na magtakda ka ng eksaktong mga sukat at isama ang mga mapagpipilian para sa naaaninag na mga pinagmulan. Ang pagtatakda ng DPI ay tumutulong sa iyo na kalkulahin ang angkop na mga sukat para sa pagkalimbag, bagaman tandaan na ang DPI ay metadata - kung ano ang mga bagay na maaaring ilimbag ay may sapat na pixels para sa iyong pisikal na laki. Kapag nag - aalinlangan, ang pagluluwas na mas malaki kaysa inaakala mong kailangan mo; ang pag - ahon sa mga reserba ay sumisira sa kalidad samantalang ang pag - ahon ay sumisira rito.'],
    },
    {
      heading: 'Paghahanda ng mga Boses Para sa Sulat - Kamay',
      paragraphs: ['Kapag ipinapasa ang QR gawang sining sa mga tagapagdisenyo o naglilimbag ng mga nagtitinda, isama ang malinaw na mga detalye: ang nilalayong pisikal na sukat, minimum na mga kahilingan ng tahimik na sona, at anumang bagay na may kulay. Para sa mga kritikal na aplikasyon, magbigay ng parehong isang SVG master at isang high-resolution PNG backup, na maliwanag na may tatak ng kanilang mga nilalayong gamit. Isama ang ANQR configuration link para muling mabuo ang code kung kinakailangan.', 'Asahan ang karaniwang mga pagkakamali sa manu - manong proseso. Idineklarang nagsasaad na ang QR ay hindi dapat sukatin, iikot, skeckwed, o magkaroon ng mga epekto. Ipakita na ang tahimik na sona ay dapat na manatiling malinaw na walang mga marka ng ani, mga marka sa pagpaparehistro, o mga elemento sa pagdidisenyo. Kung ilalagay ang QR sa isang kulay-kulay o potograpikong background, magbigay ng bersyon na may hugis na opaque na pansuporta upang matiyak ang sapat na pagkakaiba.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Isang file pakete diagram na nagpapakita ng SVG master, PNG backup, dokumento ng mga detalye, at configuration link',
          caption: 'Professional QR\'off package: lahat ng kailangan ng isang designer o print marketer para sa tumpak na reproduksiyon',
        },
      ],
    },
    {
      heading: 'Nagkakasalungatang mga Patotoo',
      paragraphs: ['Huwag kailanman sang - ayunan ang isang print run nang hindi sinusuri ang isang pisikal na patotoo. Humiling ng isang katibayan na nilimbag sa aktuwal na substrate na may aktuwal na pagtatapos na gagamitin sa paggawa. Scan ang patunay sa ilalim ng mga kondisyon ng liwanag katulad ng kung saan ididispley ang huling piraso. Subukin sa pamamagitan ng maramihang aparato, pati na ang mas matatandang smartphone na maaaring makipagpunyagi sa katangiang marginal.', 'Kung ang patotoo ay mabagal o pabagu - bago ng pagsusuri, magsuri bago sumang - ayon. Kabilang sa karaniwang mga isyu ang di - sapat na pagkakaiba sa may kulay na mga substates, tahimik na mga paglabag sa sona mula sa pagtabas, tintang nagpapalambot sa mga gilid ng module, o laminasyon na lumilikha ng nakasisilaw na liwanag. Ang alinman sa mga ito ay maaaring tawagin bago ipagkatiwala sa isang buong limbag na run - ngunit tangi lamang kung mahuhuli mo ito sa proof stage.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Isang talaan ng mga proof review na may mga resulta ng scan test, magkakaibang sukat, at mga lagda ng pagsang - ayon',
          caption: 'Nag - iimprentang patotoo: sistematikong pagsubok bago gumawa ng maraming produksiyon',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Paglikha ng Animated QR Codes',
      paragraphs: ['Ang mga kodigong Aniated QR ay nagsasama ng functionality ng mga pamantayang QR code sa eye-catching motion na lubhang nagpapataas ng mga rate ng tipanan. Sa digital signage, social media, at interactive display, binabago ng animation ang isang static universe tungo sa isang kahanga - hangang nakikitang elemento na umaakit sa mata at nag - aanyaya ng interaksiyon. Sinasaklaw ng giyang ito ang mga simulain, pamamaraan, at praktikal na mga pagbabawal sa paglikha ng masiglang mga kodigo ng QR na tiyak na nagsusuri habang naghahatid ng nakikitang epekto.', 'Ang pangunahing hamon ng masiglang QR code ay ang pagtitimbang ng interes sa paningin laban sa pagiging maaasahan sa scan. Ang bawat balangkas ay dapat na isahang scanning - a scanner ay maaaring umakit sa kodigo sa anumang punto sa siklo ng relikasyon. Ito ang pumipigil sa bawat pasiya ng disenyo: aling elemento ang maaaring kumilos, kung gaano karami ang mababago nito, at kung ano ang dapat manatiling matatag sa buong panahon ng pagbabago.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Isang digital signage display na nagpapakita ng isang masiglang QR code na kumukuha ng pansin sa isang pampublikong espasyo',
          caption: 'Inanunsyo ang mga code ng QR sa digital signage: mosyon na umaakit ng atensiyon at nagpapasigla sa scanning',
        },
      ],
    },
    {
      heading: 'Kung Paano Nakaaapekto ang Pagiging Makatuwiran',
      paragraphs: ['Ang mga QR scanner ay gumagana sa pamamagitan ng pagbihag ng isang balangkas at pag - aanalisa sa disenyo ng liwanag at madilim na mga module. Upang gumana ang isang masiglang kodigo, ang bawat balangkas ay dapat na naglalaman ng kompleto, mabisang huwaran ng QR. Ito\'y nagbabawal sa paggawa ng mga bagay - bagay na nagpapaikut - ikot sa kayarian ng kodigo, tumutunaw sa mga module, o lubhang binabago ang pagkakaiba. Ang data-pagdadala ng mga module - ang tila pasumalang pattern sa gitna - ay dapat manatiling matatag ang paningin sa kabuuan.', 'Ang ligtas na mga pamamaraan ng animation ay nagpapabago sa mga elemento na hindi nagdadala ng impormasyon: mga pinagmulan, kulay, pandekorasyong balangkas, at mga elemento. Ang mga istraktural na mga seleksiyong panghanap (ang malalaking mga parisukat na sulok), mga padrong pang-oras (ang mga linyang pang-ayos), at mga dibuhong pang-hanay (mas maliliit na mga liwasan sa mas malalaking mga kodigo) - ay dapat panatilihin ang kanilang mga posisyon at mga proporsiyon. Ang pagtatrabaho sa loob ng mga pagbabawal na ito ay nagpapahintulot pa rin ng nakapagtatakang dinamiko at aktibong mga pangganyak.'],
    },
    {
      heading: 'Mga Pamamaraan sa Pag - iisip Iyan ay Mabisa',
      paragraphs: ['Ang pagbibisikleta sa Colour ay nagbibigay - buhay sa mga kulay sa harapan at likuran sa pamamagitan ng paleta samantalang pinananatili ang sapat na pagkakaiba sa bawat hakbang. Ito ay lumilikha ng masigla at nagbibigay pansin na epekto na may kaunting scan na panganib - habang ang pagkakaiba ay hindi kailanman bumababa sa mga antas na mababasa. ANG mga preset ng siklo ng kulay ng ANQR ay dinisenyo upang mapanatili ang pagiging scannity sa buong siklo.', 'Ang mga naka-anamated na balot ay naglalagay ng gumagalaw na imahe sa likod ng isang semi-transparent na QR pattern. Nananatiling matatag ang kodigo samantalang ang background na may-akda - marahil ay isang looping video, masiglang brand na elemento, o abstraktong mosyong graphics. Ang pamamaraang ito ay nangangailangan ng maingat na pagkontrol ng intensity upang maiwasan ang pagsiksik ng pinagmulan sa QR na pattern, ngunit lumilikha ng pinaka kapansin-pansing mga resulta.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Isang larawan na nagpapakita sa suson ng isang masiglang QR: matatag na kodigong suson sa ibabaw ng masiglang sapin sa likuran',
          caption: 'Animation layering prinsipyo: ang QR pattern ay nananatiling hindi nagbabago habang ang mga background na elemento na may buhay sa ilalim',
        },
      ],
    },
    {
      heading: 'Pag - iisip sa mga Parametro ng Pag - iisip',
      paragraphs: ['Ang antas ng Frame ay nakaaapekto kapuwa sa pagiging makinis ng paningin at laki ng salansan. Para sa karamihan ng mga aplikasyon, ang 10-15 frames kada segundo ay nagbibigay ng makinis na-look na mosyon nang walang labis na laki ng talaksan. Ang mas mataas na halaga ng frame ay nag - aalok ng bumababang nakikitang mga pagbabalik samantalang lubhang tumataas ang mga sukat ng talaksan. Isaalang - alang ang iyong inihahatid na konteksto - isang malaking digital sign ang maaaring humawak ng mas malalaking file kaysa isang mobile ad placement.', 'Ang paggawing batay sa loop ang tumitiyak kung paano kumikilos ang mga siklong ito. Ang walang - kawad na mga silo ay lumilikha ng patuloy na pagkilos na tamang - tama para sa pagsenyas at mga pagtatanghal sa paligid. Ang mga prepektura ng Ping-pong (forward-then-reverse) ay mahusay na gumagana para sa mga simpleng animation. Para sa mga pagtutuon ng pansin-grading pulses, isaalang-alang ang mga animasyon na may mga yugto ng pigil na direksyon na sinasaliwan ng galaw na nagdurulot sa mata nang hindi palagiang pagod sa paggalaw.'],
    },
    {
      heading: 'Paglikha ng Labis - labis na Pag - aaksaya',
      paragraphs: ['Kapag gumagamit ng buháy na buháy na mga larawan (GIFs, masiglang mga WebP, o video) bilang mga balot, kinukuha ng ANQR ang mga balangkas at elemento nito sa pamamagitan ng iyong QR code. Ang masidhing paglubog ng sapin ang kumukontrol kung gaano karami sa reflection ang nagpapakita sa pamamagitan ng mas mababang halaga bago ang pagsusuri samantalang ang mas mataas na halaga ay pabor sa nakikitang epekto. Subukin ang iyong napiling tindi sa multiple frames upang matiyak ang patuloy na pagka - scan.', 'Malaki ang epekto ng materyal na katangian. Gumamit ng mga pambalot na may malinaw na mga paksa at mabuting pagkakaiba. Iwasan ang mga source animation na may mabilis na pagkislap o labis na pagkinang ng liwanag na maaaring lumikha ng paminsan-minsang low-contrast frames. Patiunang masdan ang buong siklo ng animasyon bago iluwas sa ibang bansa upang hulihin ang anumang problematikong frame na maaaring hindi ma - scan.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Isang balangkas-by-frame na tanawin ng isang masiglang balot na nagpapakita ng mga antas ng pagkakaiba na pinananatili sa ibayo ng pagkakasunud-sunod',
          caption: 'Frame analysis: Nagpapatunay sa di - nagbabagong kakayahan na suriin ang buong siklo ng animation',
        },
      ],
    },
    {
      heading: 'Mga Konsiderasyon sa Pag - aangkat at Paghahatid',
      paragraphs: ['Ang GIF ay nananatiling ang pinakamalawak na suportadong format, na awtomatikong naglalaro sa karamihan ng konteksto nang hindi nangangailangan ng suporta ng video player. Gayunman, nililimitahan ng 256-colour paleta ng GIF ang pagiging tapat sa kulay. Para sa mga color-pritical animation, isaalang-alang ang freshed WebP kung saan suportado, o mahulog pabalik sa mga video format para sa pinakamataas na kalidad. Kabilang sa pagluluwas ng ANQR sa GAF ang mga pagpipilian sa pagdidistrito ng kalidad sa loob ng mga limitasyon ng paleta.', 'Malalaking bagay para sa paghahatid. Ang mga digital signage system, mga customer ng email, at mga social platform ay kadalasang nagtatakda ng mga limitasyon sa sukat. Kung ang iyong animation ay lumampas sa mga limitasyong ito, bawasan ang pagbilang sa balangkas, laki, o lalim ng kulay. Kung minsan ang paghahati ng isang masalimuot na pangganyak sa isang mas maikling silo ay nakagagawa ng mas mabuting mga resulta kaysa agresibong pagsisiksik na nagpapahina sa bawat balangkas.'],
    },
    {
      heading: 'Pagsusuri sa mga Kodigo ng QR',
      paragraphs: ['Ang pagsubok sa masiglang mga kodigo ay nangangailangan ng pagsusuri sa maraming punto sa siklo ng animasyon. Huwag basta mag - scan nang minsan at paulit - ulit na mag - scan nang matagumpay, sa iba\'t ibang sandali, upang matiyak na mababasa ang bawat balangkas. Bigyan ng partikular na pansin ang mga frame sa color cycle o mga shrour peak kung saan maaaring mababa ang pagkakaiba.', 'Subukin ang aktuwal na pagtatanghal ng hardware kung maaari. Ang pagbabagu - bago ng kulay, pagtanaw ng anggulo, at ilaw sa paligid ay pawang nakaaapekto sa kung paano lumitaw at scan ang animation. Ang isang maliwanag na pangganyak na lubusang sumusuri sa iyong monitor ay maaaring mag - alis sa iskrin sa labas ng bahay o hindi na mabasa sa mga anggulo sa pagtingin.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Isang pagsubok na nagpapakita ng tagumpay sa scan sa iba\'t ibang balangkas, aparato, at kalagayan ng pagtatanghal',
          caption: 'Asimated QR testing protocol: sistematikong beripikasyon sa ibayo ng mga balangkas, aparato, at kalagayan sa panonood',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Ang Kaligtasan ng QR at ang Pinakamahuhusay na Gawain',
      paragraphs: ['Ang isang kodigo ng QR na maganda ang pagkakadisenyo at hindi nag - scan ay mas masahol pa sa walang - silbing mga bagay na nakasisira ng loob ng mga parokyano, nakasisira ng marka, at nag - aaksaya ng lahat ng likas na yaman na ipinuhunan sa paglalang at pamamahagi nito. Sinasaklaw ng giyang ito ang teknikal at praktikal na mga salik na tumitiyak kung baga ang isang kodigo ng QR ay tiyak na mag - scan, at kung paano gagamitin ang mga katangiang pangkaligtasan ng ANQR upang makahabol ng potensiyal na mga problema bago ito makarating sa produksiyon.', 'Ang QR code pagkamaaasahan ay hindi binary. Ang isang kodigo ay maaaring lubusang mag - scan sa mga flagship phone subalit hindi ito makikita sa mga kagamitan sa badyet. Maaaring ito\'y nagtatrabaho sa tamang liwanag subalit nakikipagpunyagi sa madidilim na restawran o maliwanag na sikat ng araw. Ang pag-unawa sa mga salik na nakakaapekto sa scannability ay tumutulong sa iyo na gumawa ng may kabatirang tradeoffs sa pagitan ng visual styling at real-world pagkamaaasahan.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Isang maaasahang ispektrum na nagpapakita ng mga kodigong QR mula sa madaling mabasa hanggang sa limitadong mababasa',
          caption: 'Ang scannity spectrum: mula sa mga kodigong hindi tinatablan ng bala hanggang sa pagsisiksik na nagtutulak sa pagkamaaasahan na mga hangganan',
        },
      ],
    },
    {
      heading: 'Pag - unawa sa Pagkakamali sa Pagtutuwid',
      paragraphs: ['Kabilang sa mga kodigo ng QR ang itinayong-in redundancy na nagpapahintulot sa mga ito na mabasa kahit na bahagyang napinsala o nakubli. Ang error reflection level - L (7%), M (15%), Q (25%), o H (30%) - ang nagtatakda kung gaano karami sa kodigo ang maaaring mawala habang tama pa ring nagkokodigo. Ang mas mataas na pagtutuwid sa pagkakamali ay lumilikha ng mas malalaking kodigo subalit naglalaan ng isang ligtas na palugit para sa mga balot, mga depekto sa paglilimbag, at pinsala sa kapaligiran.', 'Para sa mga kodigo na may takip na larawan, maling antas ng pagtutuwid Ang H ay mahalaga - ang balot sa katawan ay nagpapalabo sa bahagi ng kodigo, at kailangan mo ang 30% na redundancy upang mapanatili ang pagkamaaasahan. Para sa mga malinis at di-nagbabagong kodigo sa mga kontroladong kapaligiran, ang antas M ay kadalasang sapat na. Level Ang L ay dapat na ireserba sa mga kalagayan kung saan ang laki ng kodigo ay lubhang nalilimitahan at matitiyak mo ang malinis na mga kalagayan.'],
    },
    {
      heading: 'Ang Mapanganib na Dakong Tahimik',
      paragraphs: ['Ang tahimik na sona ay ang blankong gilid na nakapaligid sa bawat QR code. Ginagamit ng mga Scanner ang hangganang ito upang malaman kung saan nagsisimula at nagtatapos ang kodigo. Binabanggit ng pamantayan ng ISO ang hindi gaanong tahimik na sona na may apat na module (apat na ulit ng lapad ng pinakamaliit na liwasan sa kodigo). Ang pag - aalis sa espasyong ito sa pamamagitan ng mga elemento ng disenyo, maliliit na gilid, o katabing nilalaman - ang isa sa pinakakaraniwang sanhi ng paghina ng scan.', 'Ang tahimik na pagpapatupad ng sona ng ANQR ay tumutulong upang mapanatili ang kritikal na agwat na ito, subalit dapat mo ring tiyakin na ito\'y nasa iyong pangwakas na mga disenyo. Kapag ipinamimigay ang QR na gawang - sining, tiyaking mabuti ang mga kahilingan ng tahimik na sona. Kapag naglalagay ng mga kodigo sa mga plano, tiyakin na walang elemento ang nanghihimasok sa kalawakang ito. Ang ilang millimetre ng malinaw na espasyo ay maaaring mangahulugan ng pagkakaiba sa pagitan ng maaasahang scanning at bigong mga parokyano.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Isang larawan na nagpapakita ng tamang distinksiyon ng tahimik na sona laban sa karaniwang mga paglabag na nagiging sanhi ng pagkabigo ng scan',
          caption: 'Mga kahilingan ng tahimik na sona: ang di - nakikitang gilid na tumitiyak ng tagumpay sa scan',
        },
      ],
    },
    {
      heading: 'Pagkakaiba at Kaligtasan ng Colour',
      paragraphs: ['Napapansin ng mga QR scanner ang disenyo ng mga light at dark module. Anumang pag - iisngit na nakababawas sa pagkakaibang - liwanag na ito, maiitim na pinagmulan, mga epektong frayf, o mababang -opacity na balot - ay gumagawa sa kodigo na mas mahirap basahin. Kinakalkula ng ANQR ang mga ratio ng pagkakaiba at nagbababala kapag ang iyong mga pagpipiliang kulay ay lumalapit sa mapanganib na antas, ngunit ang panghuling arbiter ay palaging real-world testing.', 'Iba - iba ang posisyon ng kulay at ng liwanag. Ang kombinasyon ng kulay na lumilitaw na high-contrast sa iyong monitor ay maaaring mahirap makilala sa ilalim ng mainit na incandescent light o malamig na fluorescent tubes. Kung ang iyong kodigo ay ilalagay sa iba\'t ibang kalagayan ng liwanag, subukin sa ilalim ng maraming pinagmumulan ng liwanag, at isaalang - alang ang mas konserbatibong pagkakaiba bilang isang hangganang pangkaligtasan.'],
    },
    {
      heading: 'Pagliit at Pagtanaw sa Distansiya ng Module',
      paragraphs: ['Ang pisikal na laki ng indibiduwal na mga module ang tumitiyak sa pinakamalayong distansiya kung saan maaaring suriin ang isang kodigo. Ang mas maliliit na module ay nangangahulugan ng mas maliliit na kodigo subalit nangangailangan ng mas malapit na mga distansiyang scanning. Ang pangkalahatang tuntunin ay na ang bawat module ay dapat na di - kukulangin sa 0.5m sa nilalayong scanning distance, bumabagtas nang proporsiyon sa mas malalayong distansiya. Ang isang kodigo sa isang billboard ay nangangailangan ng mas malalaking module kaysa isang kodigo sa isang business card.', 'Kapag kinakalkula ang sukat ng module, isaalang - alang ang pinakamasamang eksena: ang parokyano na may mas lumang telepono, sa di - sakdal na liwanag, ay tumitingin sa pinakamalayong distansiya. Disenyo para sa gumagamit na ito, at lahat ay magkakaroon ng mas mabuting karanasan. Ang laki ng ANQR ay nagrerekomenda ng factor sa mga real-world variable na ito upang imungkahi ang mga angkop na dimensiyon para sa iyong nilalayong gamit.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Isang tsart na may kaugnayan sa sukat ng module, nag - iimprentang mga sukat, at pinakamahusay na scanning distance',
          caption: 'Paglalagay ng giya sa distansiya: katugmang laki ng module sa iyong mga kahilingan sa paglalagay',
        },
      ],
    },
    {
      heading: 'Paggamit ng Modeng Pangkaligtasan ngQR',
      paragraphs: ['Ang ANQR\'s Safety Mode ay nagbibigay ng reality-time feedback sa scan pagkamaaasahan. Sinusubaybayan nito ang magkakaibang proporsiyon, pagsunod sa tahimik na sona, tindi ng balot, at iba pang salik na nakaaapekto sa pagka - scannity. Kapag ang sinumang parameter ay lumalapit sa mapanganib na antas, makikita mo ang mga babala na may espesipikong patnubay kung paano mapasusulong ang pagkamaaasahan. Para sa propesyonal na mga programa kung saan magastos ang kabiguan, panatilihing aktibo ang Safety Mode sa buong proseso ng pagdidisenyo.', 'Kabilang din sa Safety Mode ang isang scan verification feature na nagtatangkang i - decode ang iyong nalikhang code at nag - uulat ng tagumpay o kabiguan. Bagaman ang in-app veripikasyon na ito ay hindi makapagparami sa bawat real-world na kondisyon, ito ay sumisimbolo sa maraming karaniwang isyu bago ka mamuhunan sa paglilimbag o pamamahagi. Ituring na ang matagumpay na beripikasyon bilang isang minimum na bar, hindi ang isang garantiya - reality-world test ay nananatiling mahalaga.'],
    },
    {
      heading: 'Mga Protocol ng Real-World Testing',
      paragraphs: ['Hindi pinapalitan ng dami ng software beripikasyon ang pisikal na pagsusuri. Ilimbag ang iyong kodigo sa talagang laki sa kumakatawang materyal. Subukin ito sa aktuwal na kapaligiran ng paglalagay ng ilaw na katugma ng tunay na gamit. Scan na may maraming aparato - hindi lamang ang iyong flagship phone, kundi ang badyet Android na mga aparato, mas lumang mga iPhone, at anumang espesipikong mga aparato na karaniwang ginagamit ng iyong tagapakinig.', 'Itala sa sistematikong paraan ang iyong pagsubok. Itala kung aling mga aparato ang sinubok, sa ilalim ng anong mga kalagayan, taglay ang mga resulta. Kung ikaw ay naglalagay ng mga code sa sukatan, tiyakin ang mga batayan sa pagtanggap: marahil ay 95% tagumpay sa ibayo ng iyong device test pool, o matagumpay na mga scan sa loob ng 2 segundo sa lahat ng pagsubok na mga aparato. Ang mga pamantayang ito ay tumutulong sa paggawa ng mga desisyon na go/no-go na may layunin sa halip na umasa sa pinakamabuti.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Isang komprehensibong talaan ng mga pagsubok na sumasaklaw sa mga kagamitan, kalagayan, at pamantayan ng pagtanggap',
          caption: 'TR depostment test protocol: sistematikong beripikasyon bago ang pangako sa produksiyon',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Buksan ang generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Tingnan ang mga halimbawa ng QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Tingnan ang mga halimbawa ng QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Buksan ang Buong Gaser Guide', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Buksan ang galerya', type: 'gallery' },
  ],
};
