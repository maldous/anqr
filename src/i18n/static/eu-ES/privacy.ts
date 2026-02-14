import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Pribatutasun politika',
  description: 'ANQR-k biltzen duen informazioa, nola erabiltzen den eta pribatutasun-lege aplikagarrien arabera zure eskubideak.',
  lastUpdated: '2026ko otsailaren 1a',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Zerbitzu-baldintzak', type: 'external' }],
  sections: [
    {
      heading: 'Laburpena',
      paragraphs: ['ANQR QR kode-sorgailu bat da, bezeroaren lehen ikuspegia duena. Ez dizugu eskatzen kontu bat sortzea. Lehenespenez, QR kodeak lokalean sortzen dira zure arakatzailean; ez dugu kodetzen duzun edukirako sarbiderik.', 'Erabilera profesionalerako, ANQR-k URL parametroetatik QR kodeak sortzen dituen zerbitzariaren aldeko API bat eskaintzen du. APIa erabiltzean, zure QR edukia gure zerbitzarietan prozesatzen da irudia errendatzeko, baina ez da gordetzen edo erregistratzen.', 'Google AdSense erabiltzen dugu iragarkietarako eta baliteke analitika zerbitzuak erabiltzea. Zerbitzu hauek cookieen eta antzeko teknologien bidez biltzen dute informazioa. Politika honek zer datu biltzen diren, nola erabiltzen diren eta zure eskubideak azaltzen ditu.'],
    },
    {
      heading: 'Guk biltzen dugun informazioa',
      bullets: ['Ematen duzun informazioa: gurekin harremanetan jartzen bazara posta elektroniko bidez edo gure harremanetarako formularioaren bidez, zure izena, helbide elektronikoa eta mezuen edukia biltzen dugu.', 'Automatikoki bildutako informazioa: Gure ostalaritza-hornitzaileak (Netlify), publizitate-bazkideek eta analisi-zerbitzuek bildu ditzakete: IP helbidea, arakatzaile mota eta bertsioa, sistema eragilea, gailu mota, erreferentzia-URLa, bisitatutako orriak, gunean egondako denbora eta gutxi gorabeherako kokapen geografikoa.', 'Hirugarrenen cookieak: gure publizitate-bazkideek (Google AdSense) cookieak eta antzeko teknologiak erabiltzen dituzte iragarkiak hornitzeko eta neurtzeko. ANQR-k berak ez du lehenen cookierik ezartzen.'],
    },
    {
      heading: 'Cookieak eta hirugarrenen teknologiak',
      paragraphs: ['ANQR-k ez du lehengoen cookierik ezartzen. Zure hobespenak (adibidez, modu iluna) lokalean gordetzen dira zure gailuan, eta hori ez da inongo zerbitzarira transmititzen.', 'Hala ere, gure publizitate-bazkideek (Google AdSense) eta ostalaritza-hornitzaileak cookieak eta antzeko jarraipen-teknologiak erabil ditzakete:'],
      bullets: ['Iragarki-cookieak (hirugarrenenak): Google AdSense-k eta publizitate-bazkideek ezartzen dituzte iragarki garrantzitsuak hornitzeko, iragarkien errendimendua neurtzeko eta erabiltzailearen interesak ulertzeko. Cookie hauek zure jardueraren jarraipena egin dezakete webgune desberdinetan.', 'Analytics cookieak (hirugarrenenak): gure ostalaritza-hornitzaileak edo analisi-zerbitzuek erabil ditzakete erabilera-datuak anonimizatuak biltzeko.'],
    },
    {
      heading: 'Google AdSense eta publizitatea',
      paragraphs: ['Google AdSense bidez iragarkiak erakusten ditugu. Google-k eta bere bazkideek cookieak erabiltzen dituzte webgune honetan eta beste webgune batzuetan zure nabigazio-historian oinarritutako iragarkiak hornitzeko (interesetan oinarritutako publizitatea).', 'Ikasi Google-k zure informazioa nola erabiltzen duen: https://policies.google.com/technologies/partner-sites', 'Kudeatu iragarkien pertsonalizazioa: https://adssettings.google.com', 'Aukeratu Network Advertising Initiative bidez: https://optout.networkadvertising.org', 'Aukeratu Digital Advertising Alliance bidez: https://optout.aboutads.info'],
    },
    {
      heading: 'Informazioa nola erabiltzen dugun',
      bullets: ['Zure galderei erantzuteko eta laguntza emateko.', 'Gure publizitate-bazkideen bidez iragarki garrantzitsuak erakusteko.', 'Gunearen erabilera aztertzeko eta gure zerbitzuak hobetzeko.', 'Iruzur, gehiegikeria eta segurtasun-arazoak detektatzeko, prebenitzeko eta konpontzeko.', 'Lege betebeharrak betetzeko.'],
    },
    {
      heading: 'Hirugarrenen zerbitzuak',
      bullets: ['Google AdSense: iragarkiak hornitzeko eta neurtzeko datuak jasotzen ditu.', 'Analitika-hornitzaileak: jaso anonimizatutako erabilera-datuak.', 'Netlify (hosting): eskaerak prozesatzen ditu eta IP helbideak erregistra ditzake.', 'Ez dugu zure informazio pertsonala saltzen. Hala ere, publizitate-bazkideekin datuak partekatzea "salmenta"tzat har daiteke CCPAren arabera (ikus behean).'],
    },
    {
      heading: 'Datuak gordetzea',
      bullets: ['Harremanetarako bidalketak: 2 urte arte.', 'Zerbitzariaren erregistroak: 30 egun arte (ostalari hornitzailea).', 'Datu analitikoak: 26 hilabetera arte (anonimizatuta).', 'Iragarki-cookieak: normalean 13 hilabetekoak (bikotearen arabera aldatzen dira).'],
    },
    {
      heading: 'Zure eskubideak GDPR (EEE erabiltzaileak)',
      paragraphs: ['Europako Esparru Ekonomikoan bazaude, honako eskubide hauek dituzu Datuak Babesteko Erregelamendu Orokorraren arabera:'],
      bullets: ['Sarbide-eskubidea: Eskatu zuri buruz ditugun datu pertsonalen kopia.', 'Zuzentzeko eskubidea: Datu okerrak zuzentzeko eskatzea.', 'Ezabatzeko eskubidea: Zure datuak ezabatzeko eskatzea ("ahazteko eskubidea").', 'Tratamendua mugatzeko eskubidea: Zure datuak erabiltzeko moduari buruzko mugak eskatzea.', 'Datuen eramangarritasun eskubidea: eskatu zure datuak formatu eramangarri batean.', 'Aurka egiteko eskubidea: tratamenduaren aurka egitea, marketin zuzena barne.', 'Adostasuna kentzeko eskubidea: tratamendua baimenean oinarritzen den edozein unetan ken ezazu baimena.', 'Kexa aurkezteko eskubidea: kexa bat aurkeztu zure datuak babesteko agintaritzan.'],
    },
    {
      heading: 'GDPR legezko oinarria',
      paragraphs: ['Oinarri hauetako datuak prozesatzen ditugu: (a) Adostasuna - publizitate pertsonalizaturako (gure publizitate-bazkideek kudeatzen dutena); (b) Interes legitimoak - analisirako, segurtasunerako eta hobekuntzarako; (c) Kontratua - galderei erantzuteko.', 'Zure eskubideak baliatzeko, jarri harremanetan email@anqr.link. 30 eguneko epean erantzuten dugu.'],
    },
    {
      heading: 'Zure eskubideak CCPAren arabera (Kaliforniako erabiltzaileak)',
      bullets: ['Jakiteko eskubidea: bildutako datuei, iturriei, helburuei eta hirugarrenei buruzko informazioa eskatzea.', 'Ezabatzeko eskubidea: zure informazio pertsonala ezabatzeko eskatzea.', 'Ez uzteko eskubidea: informazio pertsonalaren "salmenta" ez egitea aukeratzea (iragarki-bazkideekin partekatzeak izan dezake).', 'Diskriminaziorik ez izateko eskubidea: ez dugu diskriminatuko zure eskubideak erabiltzeagatik.'],
    },
    {
      heading: 'Bildutako CCPA kategoriak',
      paragraphs: ['Kategoriak: Identifikatzaileak (IP helbidea, gailuaren IDa), Interneteko jarduera (nabigazioa, iragarkien interakzioak), Geokokapena (gutxi gorabehera), Inferentziak (nabigazioaren interesak).', 'Eskubideak erabiltzeko edo uzteko: email@anqr.link edo egokitu cookieen ezarpenak.'],
    },
    {
      heading: 'Nazioarteko transferentziak',
      paragraphs: ['Baliteke zure informazioa datuak babesteko lege desberdinak dituzten herrialdeetara transferitzea, Estatu Batuetara barne. Berme egokiak erabiltzen ditugu, hala nola Kontratu Klausula Estandarra.'],
    },
    {
      heading: 'Haurren pribatutasuna',
      paragraphs: ['ANQR ez dago zuzenduta 13 urtetik beherakoei (edo 16 urte EEEn). Ez ditugu umeen datuak jakinda biltzen. Jarri harremanetan email@anqr.link haur batek informazioa eman duela uste baduzu.'],
    },
    {
      heading: 'Segurtasuna',
      paragraphs: ['Datuak babesteko neurri tekniko eta antolakuntza egokiak erabiltzen ditugu, HTTPS enkriptatzea barne. Hala ere, ez da internet bidezko transmisiorik %100 segurua.'],
    },
    {
      heading: 'Ez Jarraitu',
      paragraphs: ['Ez jarraitu arakatzailearen seinaleak errespetatzen ditugu bideragarria denean, baina publizitate-bazkideek DNTri erantzun ez dioten arren.'],
    },
    {
      heading: 'Politika honen aldaketak',
      paragraphs: ['Baliteke politika hau aldian-aldian eguneratzea. "Azken eguneratutako" datak azken berrikuspena adierazten du. Aldaketa esanguratsuak guneko banner baten bidez jakinarazi daitezke.'],
    },
    {
      heading: 'Jar zaitez gurekin harremanetan',
      paragraphs: ['Pribatutasun-galderetarako edo zure eskubideak erabiltzeko: email@anqr.link edo erabili gure Harremanetarako orria. Pribatutasun-eskaerei 30 eguneko epean erantzuten diegu.'],
    },
    {
      heading: 'Pribatutasun politika osoa',
      paragraphs: ['Orrialde honek gure pribatutasun praktiken laburpena eskaintzen du. Datuen tratamenduari, zure eskubideei eta GDPR, CCPA eta beste pribatutasun-lege batzuen arabera ditugun betebeharrei buruzko xehetasun osoak dituen pribatutasun-politika osoa eta legezko loteslea lortzeko, ikusi iubenda-k ostatatutako gure politika osoa.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Ikusi Pribatutasun-politika osoa iubenda-n',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
