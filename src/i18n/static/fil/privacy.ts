import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Pribadong Patakaran',
  description:
    'Ang Information ANQR ay nagtitipon, kung paano ito ginagamit, at ang iyong mga karapatan sa ilalim ng kapit na mga batas sa pribadong buhay.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [
    { href: '/terms?lang=${lang}', label: 'Mga Termino ng Paglilingkod', type: 'external' },
  ],
  sections: [
    {
      heading: 'Sumaryo',
      paragraphs: [
        'Ang ANQR ay isang QR code generator na may kliyente-unang paglapit. Hindi namin hinihiling sa inyo na lumikha ng isang salaysay. Sa pamamagitan ng default, ang mga QR code ay nalilikha sa inyong browser - wala ang nilalaman na iyong ina-ayos.',
        'Para sa propesyonal na gamit, ang ANQR ay nagbibigay ng server-side API na gumagawa ng mga QR code mula sa mga parameter ng URL. Kapag ginagamit ang API, ang nilalaman mong QR ay pinoproseso sa ating mga server upang isalin ang imahen, ngunit hindi iniimbak o naitatala.',
        'Ginagamit natin ang Google AdSense para sa pag-aanunsiyo at maaaring gumamit ng mga serbisyong analytics. Ang mga serbisyong ito ay nagtitipon ng impormasyon sa pamamagitan ng mga anime at katulad na teknolohiya. Ipinaliliwanag ng patakarang ito kung anong impormasyon ang tinitipon, kung paano ito ginagamit, at ang iyong mga karapatan.',
      ],
    },
    {
      heading: 'Mga impormasyong nakukuha natin',
      bullets: [
        'Impormasyon na inilalaan mo: Kung makikipag - ugnayan ka sa amin sa pamamagitan ng email o ng aming contact form, tinitipon namin ang iyong pangalan, adres ng email, at nilalamang mensahe.',
        'Awtomatikong nagtipon ng impormasyon: Ang ating hosting provider (Netlify), mga kasosyo sa pag - aanunsiyo, at mga serbisyo ng anestics ay maaaring magtipon: IP address, browser type at bersyon, operating system, tipo ng aparato, tinutukoy ang URL, mga pahinang dinadalaw, oras sa lugar, at tinatayang heograpikong lokasyon.',
        'Ikatlong-bahaging mga anime: Ang ating mga kasosyo sa pag - aanunsiyo (Gogle AdSense) ay gumagamit ng mga cookies at katulad na mga teknolohiya upang maglingkod at sukatin ang mga anunsiyo. Ang ANQR mismo ay hindi nagtatakda ng anumang first-party cookies.',
      ],
    },
    {
      heading: 'Mga cookies at ikatlong-partidong teknolohiya',
      paragraphs: [
        'Ang ANQR ay hindi nagtatakda ng anumang first-party cookies. Ang iyong mga kagustuhan (gaya ng dark mode) ay iniimbak sa iyong aparato sa inyong lugar, na hindi naililipat sa anumang server.',
        'Gayunman, ang ating mga kasosyo sa pag - aanunsiyo (Google AdSense) at ang hosting provider ay maaaring gumamit ng mga cookies at katulad na mga teknolohiya sa pagsubaybay:',
      ],
      bullets: [
        "Mga anime sa pag - aanunsiyo (ikatlong-bahagi): Itinakda ng Google AdSense at ng mga kasosyo sa pag - aanunsiyo na magsilbi sa nauugnay na mga anunsiyo, sukatin ang pagtatanghal, at unawain ang mga interes ng gumagamit. Maaaring subaybayan ng mga cookies na ito ang iyong gawain sa iba't ibang website.",
        'Analytics cookies (ikatlong-bahagi): Maaaring gamitin ng aming hosting provider o anestics services upang tipunin ang mga impormasyong ginagamit sa pag - aanonymised.',
      ],
    },
    {
      heading: 'Google Adsenense at pag - aanunsiyo',
      paragraphs: [
        'Ipinakikita namin ang mga anunsiyo sa pamamagitan ng Google AdSense. Ang Google at ang mga kapareha nito ay gumagamit ng mga cookies upang magsilbi sa mga anunsiyo batay sa iyong kasaysayan ng pag-aalsa sa site na ito at sa iba pang mga website (interest-based advertising).',
        'Alamin kung paano ginagamit ng Google ang iyong impormasyon: https://policies.google.com/technologies/partner-sites',
        'Paghawak ng adpersonalisyon: https://adssettings.google.com',
        'Opt out via Network Advertising Initiative: https://optout.networkadvertising.org',
        'Palabas sa pamamagitan ng Digital Advertising Alliance: https://optout.aboutads.infoinfo',
      ],
    },
    {
      heading: 'Kung paano natin ginagamit ang impormasyon',
      bullets: [
        'Upang tumugon sa iyong mga pagtatanong at maglaan ng suporta.',
        'Upang ipakita ang nauugnay na mga anunsiyo sa pamamagitan ng ating mga kasosyo sa pag - aanunsiyo.',
        'Sa analyse site gamitin at pagbutihin ang ating mga serbisyo.',
        'Upang matuklasan, maiwasan, at masagot ang mga isyu tungkol sa pandaraya, pang - aabuso, at seguridad.',
        'Upang makasunod sa legal na mga obligasyon.',
      ],
    },
    {
      heading: 'Ikatlong-bahaging serbisyo',
      bullets: [
        'Google AdSense: Tumatanggap ng datos upang magsilbi at sukatin ang mga anunsiyo.',
        'Mga tagapaglaan ng Anatomys: Tumanggap ng mga impormasyon tungkol sa paggamit ng ayonymised.',
        'Netlify (pagbabaybay): Proseso mga kahilingan at maaaring mag - log IP address.',
        'Hindi namin ipinagbibili ang inyong personal na impormasyon. Gayunman, ang pagbabahagi ng datos sa mga kasosyo sa pag-aanunsiyo ay maaaring ituring na isang "sale" sa ilalim ng CCPA (tingnan sa ibaba).',
      ],
    },
    {
      heading: 'Pag - aaral ng Data',
      bullets: [
        'Mga Pagpapasakop: Hanggang 2 taon.',
        'Mga trosong server: Hanggang 30 araw (hosting provider).',
        'Mga impormasyong anatomiko: Hanggang 26 na buwan (tinutukoy).',
        'Mga pagluluto sa pag - aanunsiyo: Karaniwan nang 13 buwan (sa pamamagitan ng kapareha).',
      ],
    },
    {
      heading: 'Ang inyong mga karapatan sa ilalim ng GDPR (mga gumagamit ng EEA)',
      paragraphs: [
        'Kung ikaw ay nasa European Economic Area, taglay mo ang sumusunod na mga karapatan sa ilalim ng General Data Protection Regulation:',
      ],
      bullets: [
        'Kanang daanan: Humiling ng isang kopya ng personal na impormasyon na dala namin tungkol sa iyo.',
        'Karapatan sa muling pagpapatibay: Humingi ng pagtutuwid sa maling impormasyon.',
        'Karapatan sa panahon: Humingi ng deleksiyon ng iyong datos ("tamang makalimutan").',
        'Karapatang limitahan ang pagproseso: Humingi ng limitasyon kung paano namin gagamitin ang inyong datos.',
        'Karapatan sa portable ng datos: Hilingin ang iyong impormasyon sa isang nabibitbit na format.',
        'Karapatang tumutol: Mahilig sa pagpoproseso, pati na sa tuwirang pagbebenta.',
        'Karapatang tumanggi: Ini-draw ang pahintulot sa anumang oras kung saan ang pagpoproseso ay consent-based.',
        'Karapatang magsampa ng reklamo: Sabihin ang reklamo sa iyong data protektibong awtoridad.',
      ],
    },
    {
      heading: 'Ang legal na saligan ng GDPR',
      paragraphs: [
        'Pinoproseso namin ang data sa mga base na ito: (a) Pahintulot - para sa personalized na advertising (pinamamahalaan ng aming mga kasosyo sa advertising); (b) Mga lehitimong interes - para sa analytics, seguridad, at pagpapabuti; (c) Kontrata - upang tumugon sa mga katanungan.',
        "Upang isagawa ang iyong mga karapatan, makipag - ugnayan sa . Kami'y tumugon sa loob ng 30 araw.",
      ],
    },
    {
      heading: 'Ang inyong mga karapatan sa ilalim ng CCPA (mga gumagamit ng California)',
      bullets: [
        'Kanang malaman: Humingi ng impormasyon tungkol sa natipong impormasyon, mga pinagkunan, mga layunin, at ikatlong partido.',
        'Karapatang magtanggal: Humiling ng pagtanggal ng iyong personal na impormasyon.',
        'Karapatang pumili-out: Op mula sa "sale" ng personal na impormasyon (maaring maging kuwalipikado ang pakikipag-alyansa sa mga ad partner).',
        "Karapatan sa hindi-diskriba: Tayo'y walang pagtatangi sa paggamit ng iyong mga karapatan.",
      ],
    },
    {
      heading: 'Nakolekta ang mga kategorya ng CCPA',
      paragraphs: [
        'Categories: Identifiers (IP address, device ID), aktibidad sa Internet (browsing, ad interactions), Geolocation (approximate), Inferences (interes mula sa browsing).',
        'Upang mag - ehersisyo ng mga karapatan o piliin:  o baguhin ang mga setting ng cookie.',
      ],
    },
    {
      heading: 'Internasyonal na mga Paglipat',
      paragraphs: [
        "Ang iyong impormasyon ay maaaring ilipat sa mga bansa na may iba't ibang batas sa pag - iingat ng impormasyon, pati na sa Estados Unidos. Gumagamit tayo ng angkop na mga pananggalang gaya ng Standard Contractual Clauses.",
      ],
    },
    {
      heading: 'Pribadong Buhay ng mga Bata',
      paragraphs: [
        'ANG pornograpya ay hindi itinuturo sa mga batang wala pang 13 (o 16 sa EEA). Hindi natin namamalayang nakakakuha tayo ng impormasyon mula sa mga bata. Makipag - ugnayan sa  kung sa palagay mo ay naglaan ng impormasyon ang isang bata.',
      ],
    },
    {
      heading: 'Katiwasayan',
      paragraphs: [
        'Gumagamit tayo ng angkop na teknikal at organisadong mga hakbang upang maingatan ang impormasyon, pati na ang encryption ng HTTPS. Gayunman, walang transaksyon sa internet ang 100% secure.',
      ],
    },
    {
      heading: 'Huwag Magmaneho',
      paragraphs: [
        'Ating pinararangalan ang mga hudyat ng "Deaster browser " kung saan maaari, bagaman ang mga kasosyo sa pag - aanunsiyo ay maaaring hindi tumugon sa DNT.',
      ],
    },
    {
      heading: 'Mga pagbabago sa patakarang ito',
      paragraphs: [
        'Maaari nating baguhin sa pana - panahon ang patakarang ito. Ang petsang "Huling panahon" ay nagpapahiwatig ng pinakabagong rebisyon. Mahahalagang pagbabago ang maaaring ipakipag - usap sa pamamagitan ng isang bandila sa site.',
      ],
    },
    {
      heading: 'Makipag - ugnayan sa amin',
      paragraphs: [
        'Para sa personal na mga katanungan o upang isagawa ang iyong mga karapatan:  o gamitin ang ating contact page. Tinutugon natin ang personal na mga kahilingan sa loob ng 30 araw.',
      ],
    },
    {
      heading: 'Buong Patakaran sa Privacy',
      paragraphs: [
        'Nagbibigay ang page na ito ng buod ng aming mga kasanayan sa privacy. Para sa kumpleto, legal na may-bisang patakaran sa privacy na may kumpletong detalye sa pagpoproseso ng data, iyong mga karapatan, at aming mga obligasyon sa ilalim ng GDPR, CCPA, at iba pang mga batas sa privacy, pakitingnan ang aming buong patakarang hino-host ng iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Tingnan ang Buong Patakaran sa Privacy sa iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
