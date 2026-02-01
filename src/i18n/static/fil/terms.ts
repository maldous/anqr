import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Mga Termino ng Paglilingkod',
  description: 'Sa pamamagitan ng pag - access o paggamit sa site, sasang - ayon kang sundin ang mga terminong ito.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Pribadong Patakaran', type: 'external' }],
  sections: [
    {
      heading: 'Pagtanggap ng mga termino',
      paragraphs: ['Sa pamamagitan ng pag-access o paggamit ng ANQR (anqr.link), sumasang-ayon ka na mabuklod ng mga Terminong Ito ng Paglilingkod at ng ating Patakarang Pribado. Kung hindi ka sang - ayon sa mga terminong ito, huwag mong gamitin ang site.', 'Maaari naming i-update ang Mga Tuntuning ito paminsan-minsan. Ang patuloy na paggamit ng site pagkatapos ng mga pagbabago ay bumubuo ng pagtanggap sa mga bagong tuntunin.'],
    },
    {
      heading: 'Pagiging kaayaaya',
      paragraphs: ['Dapat ay hindi bababa sa 13 taong gulang ka upang gumamit ng ANQR. Sa paggamit sa site na ito, ipinakikita mong kaya mo na ang edad mo. Kung ikaw ay wala pang 18, kinakatawan mo na ikaw ay may pahintulot ng iyong magulang o tagapag - alaga na gamitin ang site.'],
    },
    {
      heading: 'Pinahihintulutang gamitin',
      paragraphs: ['Maaaring gumamit ka ng ANQR para sa legal na mga layunin lamang. Ikaw lamang ang may pananagutan sa nilalamang ini-record mo sa QR codes at kung paano mo ginagamit ang anumang QR code na nililikha mo.'],
    },
    {
      heading: 'Pilipit na paggawi',
      paragraphs: ['Sumasang - ayon ka na hindi:'],
      bullets: ['Gumamit ng ANQR upang lumikha ng mga QR code na magpapadali sa phishing, distribusyon ng malware, pandaraya, pandaraya, panliligalig, paninirang-puri, o anumang ilegal na gawain.', 'Ilagay ang nilalaman na nagpapawalang - bisa sa intelektuwal na mga karapatan sa pag - aari, lumalabag sa pribadong buhay, o naglalaman ng ilegal na materyal.', 'Pagtatangkang guluhin, labis na magsolo, o makialam sa operasyon o seguridad ng lugar.', 'Reverse engineer, decompile, o subukang kumuha ng source code mula sa site.', 'Gumamit ng awtomatikong mga kasangkapan (bots, scrapers) upang makapasok sa site sa paraang magpapahina sa kakayahan ng ibang gumagamit.', 'Ipunin o sirain ang anumang bahagi ng seguridad o kontrol.', 'Itakwil ang sinumang tao o bagay o siraan ang iyong pakikisama.'],
    },
    {
      heading: 'Intelektuwal na pag - aari',
      paragraphs: ['Napanatili mo pa rin ang pagmamay-ari ng nilalamang ini-record mo sa QR codes. HINDI inaangkin ng ANQR ang pagmamay-ari ng iyong datos.', 'Ang pangalan ng ANQR, logo, disenyong interface, at kodigong nasa ilalim ay protektado ng copyright, tatak, at iba pang mga batas sa pag-aaring intelektuwal. Hindi mo maaaring kopyahin, baguhin, ipamahagi, o lumikha ng mga gawang galing nang walang pahintulot.', 'Ang QR Code Alonso ay isang rehistradong tatak ng DENSO WAVE INCORPORATED. ANG pornograpya ay hindi iniuugnay sa DENSO WAVE.'],
    },
    {
      heading: 'Gumamit ng lisensiya sa nilalaman',
      paragraphs: ['Sa paggamit ng ANQR, wala kang karapatan sa nilalaman mo. Kapag ginagamit ang lokal na henerasyon (ang default), ang lahat ng QR code gener ay nangyayari sa inyong browser at hindi kami nag-access, nag-iimbak, o naghahatid ng inyong naka-install na datos.', 'Kapag ginagamit ang server-side API, ang iyong nilalaman ay pinoproseso upang lumikha ng larawan ng QR ngunit ito ay hindi nakaimbak, logged, o ginagamit para sa anumang ibang layunin na higit pa sa pagsasalin ng hiniling na imahen.'],
    },
    {
      heading: 'Ikatlong-bahaging mga serbisyo at advertising',
      paragraphs: ['Ang site ay nagtatanghal ng mga anunsiyo sa pamamagitan ng Google AdSense at maaaring isama ang mga link sa ikatlong-party websites. Hindi tayo ang may pananagutan sa third-party content, serbisyo, o mga gawaing pribado.', 'Ang iyong mga kaugnayan sa mga tagapag - anunsiyo at sa ikatlong panig ay sa pagitan mo at nila lamang. Tingnan ang ating Pribadong Patakaran para sa impormasyon tungkol sa mga kaugalian sa pag - aanunsiyo ng impormasyon.'],
    },
    {
      heading: 'Hindi pag - aangkin ng mga warranty',
      paragraphs: ['ANG ANQR AY NATATANDAAN SA ISANG "AS IS" AT "AS AVAILLE" BASAN MAY WALANG MGA KARUNUNGAN SA WALANG KASAMAAN, EKSPRILES O IMPLIED, INCLUDING PENTURISTA SA IMPLENYANG MGA KARUNUNGAN NG MERCHANTABILON, PAGTAPATAN PARA SA ISANG PROKUWERTO, AT NON-INFREMENTO.', 'Hindi natin ipinag-uutos na: (a) ang site ay hindi i-interrupted, secure, o error-free; (b) Ang mga QR code ay mag-eeksperimento sa lahat ng mga kapaligiran, sa lahat ng mga aparato, o sa lahat ng mga aplikasyon ng scanner; (c) ang site ay makatutugon sa iyong mga kahilingan.', 'Dapat mong laging subukin ang QR codes sa mga kondisyon kung saan ito gagamitin (print sukat, lighting, screen type, distance, kalidad ng kamera).'],
    },
    {
      heading: 'Hangganan ng Pananagutan',
      paragraphs: ['PARA SA MGA MAXIMUKONG MAHUMUHAY NA MAHAL SA KASALAN, ANQR AT ITS OPERATORE, INCIDENTAL, POPEKTIL, KALIHILHATIL, ONSENTORS, PROPESOR SA ORSIYENTIL, O EXEMPLERA, INCIST, INCIDUMO SA SOKSION NG SO, SA ORYONG ORSIYENTENYO, SA ORYONG ESPERSIYONG ORYO, PO SA ESPERSIYONENYA.', 'IKAW AY NAG - AABULOG AT NAG - AABULOG NA ANG IYONG UUSAP SA PAGLILINGKOD AY SA IYONG SOBLE. ANG SERVICE AY WALANG SANG - AYON SA CHARGE, AT AYON SA SANG - AYON, IKAW AY NAG - AABI NA ANG ANQR AT MGA ITS OPERATOR AY WALANG SANG - AYON SA YO SA KUNG ANO ANG MAG - AABIGO PARA SA MGA PAG - AABULOY O LAPS. WALANG HALAGA SA AGGREGREA NG LIBILES NA MGA SERO DOLARS ($0 AUD).', 'IKAW AY NAG - AABULOY, NAG - ASAK, AT NAG - DISCHARGE SA LAHAT AT SA LAHAT NG MGA KLAIM, DEMAND, AT MGA SANULOG NG AKSIYON SA ANQR AT SA MGA IS OPERATOR AY NAG - AABURE SA IYONG USE NG PAGLILINGKOD.', 'ANG ILANG HURISIKSIYON AY HINDI NAG - AABULOY SA KARUNUNGAN O MGA LIMITATION NG LIBILY. SA MGA HURISIDIKSIYON, ANG ATING LIBIYON AY MALUMILI SA MAXIMUM EXUM NA MAHAL SA PAGTULONG NG APPLIKBLE.'],
    },
    {
      heading: 'Pag - aalinlangan',
      paragraphs: ['Sumasang-ayon ka sa hindi nakapipinsalang ANQR, sa mga nagpapatakbo nito, sa kani-kanilang mga opisyal, direktor, empleyado, at ahente mula sa anumang mga pag-aangkin, bayad-pinsala, pagkalugi, gastos, at gastos (kasama ang mga legal na bayad) na nagmumula sa: (a) ang paggamit mo ng site; (b) ang iyong paglabag sa mga Terminong ito; (c) ang iyong paglabag sa anumang ikatlong-party na karapatan; (d) anumang nilalaman na ini-re-record mo sa QR codes.'],
    },
    {
      heading: 'Resolution ng Pagtatalo',
      paragraphs: ['Anumang pagtatalo na bumangon mula sa mga Terme na ito o sa paggamit mo ng ANQR ay sisikapin munang lutasin sa pamamagitan ng impormal na negosasyon sa pamamagitan ng pakikipag - ugnayan sa .', 'Kung mabigo ang impormal na resolusyon, ang mga pagtatalo ay malulutas sa pamamagitan ng pagtatali sa mga kasunduan sa Victoria, Australia, maliban na lamang na ang alinmang partido ay maaaring humingi ng lunas sa hukuman para sa intelektuwal na mga paglabag sa ari - arian.'],
    },
    {
      heading: 'Hindi na kailangan ang class aksyon',
      paragraphs: ['PARA SA MAHABANG PAG - AABULOY SA KASALAN, IKAW\'Y NAG - AABULOG NA ANG MGA PAG - AABULOG AY HAHALAGANG MAHIRAP SA ISANG INDIVIDUAL NA KASALANAN AT HINDI SA ISANG KLAS, SA CONSOLIDE, O REPESENTONG PAG - ASA.'],
    },
    {
      heading: 'Batas Lupo',
      paragraphs: ['Ang mga Terminong ito ay pinamamahalaan ng mga batas ng Victoria, Australia, nang walang alitan sa mga prinsipyo ng batas. Pumayag ka sa eksklusibong hurisdiksiyon ng mga hukuman na nasa Victoria, Australia.'],
    },
    {
      heading: 'Mga Pagbabago at madaling makuha',
      paragraphs: ['Maaaring baguhin, itigil, o ihinto natin ang site (o anumang bahagi nito) sa anumang panahon nang walang abiso o pananagutan.', 'Maaari naming i-update ang Mga Tuntuning ito anumang oras. Ang petsa ng "Huling na-update" ay nagpapahiwatig kung kailan sila pinakahuling binago. Ang patuloy na paggamit pagkatapos ng mga pagbabago ay bumubuo ng pagtanggap.'],
    },
    {
      heading: 'Napakarami',
      paragraphs: ['Kung ang anumang probisyon ng mga Terme na ito ay gagamitin nang walang bisa o walang bisa, ang paglalaang iyan ay ipatutupad sa sukdulang antas na ipinahihintulot, at ang natitirang mga paglalaan ay mananatiling lubusan at mabisa.'],
    },
    {
      heading: 'Waiver',
      paragraphs: ['Ang hindi natin pagpapatupad ng anumang karapatan o paglalaan ng mga Terminong ito ay hindi masasabing isang tagapaglihis ng gayong karapatan o probisyon.'],
    },
    {
      heading: 'Buong kasunduan',
      paragraphs: ['Ang mga Terme na ito, pati na ang ating Pribadong Patakaran, ang bumubuo sa buong kasunduan sa pagitan mo at ng ANQR tungkol sa paggamit mo ng lugar at pinalitan ang anumang naunang mga kasunduan.'],
    },
    {
      heading: 'Pagkahiya sa Puwersa',
      paragraphs: ['Hindi tayo mananagot sa anumang pagkabigo o pagkaantala sa paggawa dahil sa mga kalagayang wala tayong makatuwirang kontrol, kabilang na ang likas na mga sakuna, digmaan, terorismo, kaguluhan, pagkilos ng pamahalaan, o mga kabiguan sa internet/infrastructure.'],
    },
    {
      heading: 'Makipag - ugnayan',
      paragraphs: ['Ang mga tanong tungkol sa mga Terme na ito ay maaaring ipadala sa: '],
    },
  ],
};

export default terms;
