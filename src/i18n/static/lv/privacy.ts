import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Privātuma politika',
  description: 'Informācija, ko ANQR apkopo, kā tā tiek izmantota, un jūsu tiesības saskaņā ar piemērojamajiem privātuma likumiem.',
  lastUpdated: '2026. gada 1. februāris',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Pakalpojuma noteikumi', type: 'external' }],
  sections: [
    {
      heading: 'Kopsavilkums',
      paragraphs: ['ANQR ir QR koda ģenerators ar pieeju klientam. Mēs neprasām jums izveidot kontu. Pēc noklusējuma QR kodi tiek ģenerēti lokāli jūsu pārlūkprogrammā — mums nav piekļuves jūsu kodētajam saturam.', 'Profesionālai lietošanai ANQR nodrošina servera puses API, kas ģenerē QR kodus no URL parametriem. Izmantojot API, jūsu QR saturs tiek apstrādāts mūsu serveros, lai renderētu attēlu, taču tas netiek saglabāts vai reģistrēts.', 'Mēs izmantojam Google AdSense reklamēšanai un varam izmantot analītikas pakalpojumus. Šie pakalpojumi apkopo informāciju, izmantojot sīkfailus un līdzīgas tehnoloģijas. Šajā politikā ir paskaidrots, kādi dati tiek vākti, kā tie tiek izmantoti, un jūsu tiesības.'],
    },
    {
      heading: 'Informācija, ko mēs apkopojam',
      bullets: ['Jūsu sniegtā informācija: ja sazināties ar mums pa e-pastu vai mūsu saziņas veidlapu, mēs apkopojam jūsu vārdu, e-pasta adresi un ziņojuma saturu.', 'Automātiski apkopotā informācija: mūsu mitināšanas pakalpojumu sniedzējs (Netlify), reklāmas partneri un analītikas pakalpojumi var apkopot: IP adresi, pārlūkprogrammas veidu un versiju, operētājsistēmu, ierīces veidu, atsauces URL, apmeklētās lapas, vietnē pavadīto laiku un aptuveno ģeogrāfisko atrašanās vietu.', 'Trešās puses sīkfaili: mūsu reklamēšanas partneri (Google AdSense) izmanto sīkfailus un līdzīgas tehnoloģijas, lai rādītu un novērtētu reklāmas. ANQR pats par sevi neiestata pirmās puses sīkfailus.'],
    },
    {
      heading: 'Sīkdatnes un trešo pušu tehnoloģijas',
      paragraphs: ['ANQR neiestata pirmās puses sīkfailus. Jūsu preferences (piemēram, tumšais režīms) tiek saglabātas lokāli jūsu ierīcē, un tās netiek pārsūtītas uz nevienu serveri.', 'Tomēr mūsu reklamēšanas partneri (Google AdSense) un mitināšanas pakalpojumu sniedzējs var izmantot sīkfailus un līdzīgas izsekošanas tehnoloģijas:'],
      bullets: ['Reklāmas sīkfaili (trešās puses): tos iestatījuši Google AdSense un reklamēšanas partneri, lai rādītu atbilstošas reklāmas, novērtētu reklāmu veiktspēju un izprastu lietotāju intereses. Šīs sīkdatnes var izsekot jūsu darbībām dažādās vietnēs.', 'Analytics sīkfaili (trešās puses): var izmantot mūsu mitināšanas pakalpojumu sniedzējs vai analītikas pakalpojumi, lai vāktu anonimizētus lietošanas datus.'],
    },
    {
      heading: 'Google AdSense un reklāma',
      paragraphs: ['Mēs rādām reklāmas, izmantojot Google AdSense. Google un tā partneri izmanto sīkfailus, lai rādītu reklāmas, pamatojoties uz jūsu pārlūkošanas vēsturi šajā vietnē un citās vietnēs (ar interesēm saistīta reklāma).', 'Uzziniet, kā Google izmanto jūsu informāciju: https://policies.google.com/technologies/partner-sites', 'Pārvaldiet reklāmu personalizēšanu: https://adssettings.google.com', 'Atteikties, izmantojot tīkla reklamēšanas iniciatīvu: https://optout.networkadvertising.org', 'Atteikties, izmantojot Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Kā mēs izmantojam informāciju',
      bullets: ['Lai atbildētu uz jūsu jautājumiem un sniegtu atbalstu.', 'Lai rādītu atbilstošas reklāmas, izmantojot mūsu reklāmas partnerus.', 'Lai analizētu vietnes lietojumu un uzlabotu mūsu pakalpojumus.', 'Lai atklātu, novērstu un risinātu krāpšanu, ļaunprātīgu izmantošanu un drošības problēmas.', 'Lai izpildītu likumā noteiktās saistības.'],
    },
    {
      heading: 'Trešo pušu pakalpojumi',
      bullets: ['Google AdSense: saņem datus, lai rādītu un novērtētu reklāmas.', 'Analytics pakalpojumu sniedzēji: saņemiet anonimizētus lietošanas datus.', 'Netlify (hosting): apstrādā pieprasījumus un var reģistrēt IP adreses.', 'Mēs nepārdodam jūsu personisko informāciju. Tomēr datu kopīgošana ar reklamēšanas partneriem var tikt uzskatīta par "pārdošanu" saskaņā ar CCPA (skatiet tālāk).'],
    },
    {
      heading: 'Datu saglabāšana',
      bullets: ['Kontaktpersonu iesniegumi: līdz 2 gadiem.', 'Servera žurnāli: līdz 30 dienām (hostinga nodrošinātājs).', 'Analytics dati: līdz 26 mēnešiem (anonimizēti).', 'Reklāmas sīkfaili: parasti 13 mēneši (atšķiras atkarībā no partnera).'],
    },
    {
      heading: 'Jūsu tiesības saskaņā ar GDPR (EEZ lietotājiem)',
      paragraphs: ['Ja atrodaties Eiropas Ekonomikas zonā, saskaņā ar Vispārīgo datu aizsardzības regulu jums ir šādas tiesības:'],
      bullets: ['Piekļuves tiesības: pieprasīt mūsu rīcībā esošo personas datu kopiju par jums.', 'Tiesības uz labošanu: pieprasīt neprecīzu datu labošanu.', 'Tiesības uz dzēšanu: pieprasīt savu datu dzēšanu ("tiesības tikt aizmirstam").', 'Tiesības ierobežot apstrādi: pieprasīt ierobežojumus tam, kā mēs izmantojam jūsu datus.', 'Tiesības uz datu pārnesamību: pieprasiet savus datus pārnēsājamā formātā.', 'Tiesības iebilst: Iebilst pret apstrādi, tostarp attiecībā uz tiešo mārketingu.', 'Tiesības atsaukt piekrišanu: atsaukt piekrišanu jebkurā laikā, ja apstrāde ir balstīta uz piekrišanu.', 'Tiesības iesniegt sūdzību: iesniedziet sūdzību savai datu aizsardzības iestādei.'],
    },
    {
      heading: 'GDPR juridiskais pamats',
      paragraphs: ['Mēs apstrādājam datus, pamatojoties uz šādiem pamatiem: (a) Piekrišana – personalizētai reklāmai (pārvalda mūsu reklāmas partneri); (b) Leģitīmas intereses — analīzei, drošībai un uzlabošanai; (c) Līgums — atbildēt uz jautājumiem.', 'Lai īstenotu savas tiesības, rakstiet uz e-pastu@anqr.link. Mēs atbildam 30 dienu laikā.'],
    },
    {
      heading: 'Jūsu tiesības saskaņā ar CCPA (lietotāji Kalifornijā)',
      bullets: ['Tiesības zināt: pieprasīt informāciju par savāktajiem datiem, avotiem, mērķiem un trešajām pusēm.', 'Tiesības dzēst: pieprasīt dzēst savu personisko informāciju.', 'Tiesības atteikties: atteikties no personas informācijas "pārdošanas" (var tikt piemērota kopīgošana ar reklāmas partneriem).', 'Tiesības uz nediskrimināciju: mēs nediskriminēsim jūsu tiesību īstenošanas dēļ.'],
    },
    {
      heading: 'CCPA kategorijas apkopotas',
      paragraphs: ['Kategorijas: Identifikatori (IP adrese, ierīces ID), interneta aktivitātes (pārlūkošana, mijiedarbība ar reklāmām), ģeogrāfiskā atrašanās vieta (aptuvena), secinājumi (pārlūkošanas intereses).', 'Lai izmantotu tiesības vai atteikties: e-pasts@anqr.link vai pielāgojiet sīkfailu iestatījumus.'],
    },
    {
      heading: 'Starptautiskie pārskaitījumi',
      paragraphs: ['Jūsu informācija var tikt pārsūtīta uz valstīm, kurās ir atšķirīgi datu aizsardzības likumi, tostarp ASV. Mēs izmantojam atbilstošus drošības pasākumus, piemēram, līguma standartklauzulas.'],
    },
    {
      heading: 'Bērnu privātums',
      paragraphs: ['ANQR nav paredzēts bērniem, kas jaunāki par 13 gadiem (vai 16 gadiem EEZ). Mēs apzināti neievācam datus no bērniem. Ja uzskatāt, ka kāds bērns ir sniedzis informāciju, sazinieties ar e-pasta adresi email@anqr.link.'],
    },
    {
      heading: 'Drošība',
      paragraphs: ['Mēs izmantojam atbilstošus tehniskos un organizatoriskos pasākumus, lai aizsargātu datus, tostarp HTTPS šifrēšanu. Tomēr neviena interneta pārraide nav 100% droša.'],
    },
    {
      heading: 'Neizsekot',
      paragraphs: ['Ja iespējams, mēs cienām pārlūkprogrammas Do Not Track signālus, lai gan reklāmas partneri var nereaģēt uz DNT.'],
    },
    {
      heading: 'Izmaiņas šajā politikā',
      paragraphs: ['Mēs varam periodiski atjaunināt šo politiku. Datums "Pēdējā atjaunināšana" norāda jaunāko versiju. Par būtiskām izmaiņām var paziņot, izmantojot vietnes reklāmkarogu.'],
    },
    {
      heading: 'Sazinieties ar mums',
      paragraphs: ['Ja jums ir jautājumi par privātumu vai lai izmantotu savas tiesības, rakstiet uz e-pastu@anqr.link vai izmantojiet mūsu kontaktu lapu. Mēs atbildam uz privātuma pieprasījumiem 30 dienu laikā.'],
    },
    {
      heading: 'Pilna privātuma politika',
      paragraphs: ['Šajā lapā ir sniegts mūsu privātuma prakses kopsavilkums. Lai iegūtu pilnīgu, juridiski saistošu privātuma politiku ar pilnu informāciju par datu apstrādi, jūsu tiesībām un mūsu pienākumiem saskaņā ar GDPR, CCPA un citiem privātuma likumiem, lūdzu, skatiet mūsu pilno politiku, ko mitina iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Skatīt pilnu iubenda konfidencialitātes politiku',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
