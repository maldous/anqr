import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Kushtet e Shërbimit',
  description: 'Duke hyrë ose duke përdorur faqen, ju pranoni të jeni të detyruar nga këto kushte.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Politika e privatësisë', type: 'external' }],
  sections: [
    {
      heading: 'Pranimi i kushteve',
      paragraphs: ['Duke hyrë ose duke përdorur ANQR (anqr.link), ju pranoni të jeni të detyruar nga këto Kushte të Shërbimit dhe Politika jonë e Privatësisë. Nëse nuk jeni dakord me këto kushte, mos e përdorni faqen.', 'Ne mund t\'i përditësojmë këto Kushte herë pas here. Përdorimi i vazhdueshëm i faqes pas ndryshimeve përbën pranim të kushteve të reja.'],
    },
    {
      heading: 'Përshtatshmëria',
      paragraphs: ['Duhet të jeni të paktën 13 vjeç për të përdorur ANQR. Duke përdorur faqen, ju tregoni se e përmbushni këtë kërkesë moshe. Nëse jeni nën 18 vjeç, ju tregoni se keni lejen e prindit ose kujdestarit tuaj për të përdorur faqen.'],
    },
    {
      heading: 'Përdorimi i lejuar',
      paragraphs: ['Ju mund të përdorni ANQR vetëm për qëllime të ligjshme. Ju jeni vetëm përgjegjës për përmbajtjen që kodoni në kode QR dhe për mënyrën se si përdorni çdo kod QR që krijoni.'],
    },
    {
      heading: 'Sjellje e ndaluar',
      paragraphs: ['Ju pranoni të mos:'],
      bullets: ['Përdorni ANQR për të krijuar kode QR që lehtësojnë phishing, shpërndarjen e malware, mashtrimin, mashtrimet, ngacmimet, shpifjet ose ndonjë aktivitet të paligjshëm.', 'Kodoni përmbajtjen që cenon të drejtat e pronësisë intelektuale, cenon privatësinë ose përmban materiale të paligjshme.', 'Përpjekje për të ndërprerë, mbingarkuar ose ndërhyrë në funksionimin ose sigurinë e sajtit.', 'Inxhinieri i kundërt, dekompiloje ose përpiqu të nxjerrësh kodin burim nga faqja.', 'Përdorni mjete të automatizuara (bots, scrapers) për të hyrë në faqe në një mënyrë që degradon performancën për përdoruesit e tjerë.', 'Anashkaloni ose çaktivizoni çdo veçori të sigurisë ose të kontrollit të aksesit.', 'Imitoni ndonjë person ose ent ose shtrembëroni përkatësinë tuaj.'],
    },
    {
      heading: 'Pronësia intelektuale',
      paragraphs: ['Ju ruani pronësinë e përmbajtjes që kodoni në kode QR. ANQR nuk pretendon pronësinë e të dhënave tuaja.', 'Emri ANQR, logoja, dizajni i ndërfaqes dhe kodi themelor mbrohen nga të drejtat e autorit, markat tregtare dhe ligje të tjera të pronësisë intelektuale. Ju nuk mund të kopjoni, modifikoni, shpërndani ose krijoni vepra të prejardhura pa lejen tonë.', 'QR Code® është një markë tregtare e regjistruar e DENSO WAVE INCORPORATED. ANQR nuk është i lidhur me DENSO WAVE.'],
    },
    {
      heading: 'Licenca e përmbajtjes së përdoruesit',
      paragraphs: ['Duke përdorur ANQR, ju nuk na jepni asnjë të drejtë për përmbajtjen tuaj. Kur përdorni gjenerimin lokal (parazgjedhja), i gjithë gjenerimi i kodit QR ndodh në shfletuesin tuaj dhe ne nuk aksesojmë, ruajmë ose transmetojmë të dhënat tuaja të koduara.', 'Kur përdorni API-në nga ana e serverit, përmbajtja juaj përpunohet për të gjeneruar imazhin QR, por nuk ruhet, regjistrohet ose përdoret për ndonjë qëllim tjetër përtej paraqitjes së imazhit të kërkuar.'],
    },
    {
      heading: 'Shërbime dhe reklama të palëve të treta',
      paragraphs: ['Faqja shfaq reklama përmes Google AdSense dhe mund të përfshijë lidhje me faqet e internetit të palëve të treta. Ne nuk jemi përgjegjës për përmbajtjen, shërbimet ose praktikat e privatësisë së palëve të treta.', 'Ndërveprimet tuaja me reklamuesit dhe palët e treta janë vetëm mes jush dhe atyre. Shikoni Politikën tonë të Privatësisë për informacion në lidhje me praktikat e të dhënave të reklamave.'],
    },
    {
      heading: 'Mohimi i garancive',
      paragraphs: ['ANQR SIPAS NJË BAZË "SIÇ ËSHTË" DHE "SAS ËSHTË E DISPOZIME" PA GARANCI TË NDONJË LLOJI, TË SHPREHUR APO TË LËNDISHME, PËRFSHIRË POR JO KUFIZUAR NË GARANCI TË NËNKUPTUARA TË FURNIZIMIT TË TREGTUESHMËRISË, DHE FURNIZUESHMËRISË, MOS SHKELJE.', 'Ne nuk garantojmë që: (a) faqja do të jetë e pandërprerë, e sigurt ose pa gabime; (b) Kodet QR do të skanohen në të gjitha mjediset, në të gjitha pajisjet ose me të gjitha aplikacionet e skanerit; (c) faqja do të plotësojë kërkesat tuaja.', 'Gjithmonë duhet të testoni kodet QR në kushtet ku do të përdoren (madhësia e printimit, ndriçimi, lloji i ekranit, distanca, cilësia e kamerës).'],
    },
    {
      heading: 'Kufizimi i përgjegjësisë',
      paragraphs: ['DERI NE SHTESIN MAKSIMAL TË LEJUAR NGA LIGJI, ANQR DHE OPERATORËT, FILIATET DHE LICENSORËT E SAJ NUK DO TË JETË PËRGJEGJËS PËR ASNJË RREGULL TË DIREKT, INDIREKT, INCIDENTALE, TË VEÇANTË, PAJISË, PAJISJE, PUNËSORE PËRFSHIRË POR JO KUFIZUAR ME DËMET PËR HUMBJEN E FITIMIT, TË ARDHURAT, TË DHËNAT, EMRI I MIRË, PËRDORIMI OSE HUMBJET TJERA TË PAPRERSHME, QË RIDHEN NGA APO JO LIDHUR ME QASJEN E TUAJ NË APO PËRDORIMIN E AKSIONIT TË USHQYRËS (OSE PËRDORIMIN E INFORMACIONIT).', 'JU SHPREHIM KUPTON DHE PARKONI QË PËRDORIMI JUAJ I SHËRBIMIT ËSHTË NË RREZIKUN TUAJ VETËM. SHËRBIMI OFROHET FALAS, DHE RASTËSISHME JU PAKONIN QË ANQR DHE OPERATORËT E TIJ NUK DO TË KANË ASNJË PËRGJEGJËSI KUNDËR JU PËR NDONJË DËME APO HUMBJE. NE ASNJË RAST DETYRIMI I TOTALI I AGREGATET DO TË KALIKOJË ZERO DOLLARË ($0 AUD).', 'JU PRANONI TË LIRONI, HEQESH DHE SHKARKONI ÇDO DHE TË GJITHA KËRKESAT, KËRKESAT DHE SHKAQET E VEPRIMIT KUNDËR ANQR-së DHE OPERATORËVE TË TIJ QË RIDHEN NGA PËRDORIMI JUAJ I SHËRBIMIT.', 'DISA JURISDIKSIONE NUK LEJOJNË PËRJASHTIM TË GARANCIVE OSE KUFIZIME TË DISA TË PËRGJEGJËSISË. NË JURISDIKSIONET E TIJ, PËRGJEGJËSIA JONË DO TË KUFIZOHET NË SHPËNDAJEN MAKSIMUM TË LEJUAR NGA LIGJI NE FUQI.'],
    },
    {
      heading: 'Dëmshpërblimi',
      paragraphs: ['Ju pranoni të dëmshpërbleni, mbroni dhe mbani të padëmshme ANQR, operatorët, filialet e saj dhe oficerët, drejtorët, punonjësit dhe agjentët e tyre përkatës nga çdo pretendim, dëm, humbje, detyrim, kosto dhe shpenzim (përfshirë tarifat ligjore) që rrjedhin nga: (a) përdorimi i faqes nga ana juaj; (b) shkeljen tuaj të këtyre Kushteve; (c) shkeljen tuaj të çdo të drejte të palës së tretë; (d) çdo përmbajtje që e kodoni në kode QR.'],
    },
    {
      heading: 'Zgjidhja e mosmarrëveshjeve',
      paragraphs: ['Çdo mosmarrëveshje që lind nga këto Kushte ose përdorimi nga ana juaj i ANQR fillimisht do të tentohet të zgjidhet nëpërmjet negociatave joformale duke kontaktuar email@anqr.link.', 'Nëse zgjidhja jozyrtare dështon, mosmarrëveshjet do të zgjidhen përmes arbitrazhit detyrues në Victoria, Australi, me përjashtim të rastit që secila palë mund të kërkojë lehtësim gjyqësor në gjykatë për shkeljet e pronësisë intelektuale.'],
    },
    {
      heading: 'Heqja dorë nga veprimet e klasës',
      paragraphs: ['DERI NE MASA TE LEJUAR NGA LIGJI, JU PRANONI QE CDO PROCEDURE PER ZGJEDHJEN E MOSMARRËVESHJEVE DO TË KRYET VETËM NË BAZË INDIVIDUALE DHE JO NË KLASË, TË KONSOLIDUARA APO VEPRIM PËRFAQËSUES.'],
    },
    {
      heading: 'Ligji qeverisës',
      paragraphs: ['Këto Kushte rregullohen nga ligjet e Victoria, Australi, pa marrë parasysh parimet e konfliktit të ligjeve. Ju pranoni juridiksionin ekskluziv të gjykatave të vendosura në Victoria, Australi.'],
    },
    {
      heading: 'Ndryshimet dhe disponueshmëria',
      paragraphs: ['Ne mund të modifikojmë, pezullojmë ose ndërpresim sitin (ose ndonjë pjesë të tij) në çdo kohë pa njoftim ose përgjegjësi.', 'Ne mund t\'i përditësojmë këto Kushte në çdo kohë. Data "Përditësimi i fundit" tregon se kur janë rishikuar më së fundi. Përdorimi i vazhdueshëm pas ndryshimeve përbën pranim.'],
    },
    {
      heading: 'Ndarshmëria',
      paragraphs: ['Nëse ndonjë dispozitë e këtyre Kushteve konsiderohet e pavlefshme ose e pazbatueshme, ajo dispozitë do të zbatohet në masën maksimale të lejueshme dhe dispozitat e mbetura do të mbeten në fuqi dhe efekt të plotë.'],
    },
    {
      heading: 'Heqja dorë',
      paragraphs: ['Dështimi ynë për të zbatuar ndonjë të drejtë ose dispozitë të këtyre Kushteve nuk do të konsiderohet si heqje dorë nga kjo e drejtë ose dispozitë.'],
    },
    {
      heading: 'Marrëveshja e plotë',
      paragraphs: ['Këto Kushte, së bashku me Politikën tonë të Privatësisë, përbëjnë të gjithë marrëveshjen midis jush dhe ANQR në lidhje me përdorimin tuaj të faqes dhe zëvendësojnë çdo marrëveshje të mëparshme.'],
    },
    {
      heading: 'Forca madhore',
      paragraphs: ['Ne nuk do të jemi përgjegjës për asnjë dështim ose vonesë në performancë për shkak të rrethanave jashtë kontrollit tonë të arsyeshëm, duke përfshirë fatkeqësitë natyrore, luftën, terrorizmin, trazirat, veprimet e qeverisë ose dështimet e internetit/infrastrukturës.'],
    },
    {
      heading: 'Kontaktoni',
      paragraphs: ['Pyetjet në lidhje me këto Kushte mund të dërgohen në: email@anqr.link'],
    },
  ],
};

export default terms;
