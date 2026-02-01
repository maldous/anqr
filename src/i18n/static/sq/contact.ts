import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Na kontaktoni',
  description: 'Ne mirëpresim komentet, raportet e gabimeve, kërkesat për veçori dhe pyetjet e përgjithshme.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Si të arrini tek ne',
      paragraphs: ['Ne ofrojmë disa mënyra për të na kontaktuar në varësi të nevojave tuaja. Ne lexojmë çdo mesazh, megjithëse kohët e përgjigjes mund të ndryshojnë në bazë të vëllimit dhe llojit të pyetjes.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Për të gjitha pyetjet: email@anqr.link', 'Kjo është mënyra më e besueshme për të na kontaktuar dhe rekomandohet për pyetje të hollësishme, pyetje biznesi ose çdo pyetje tjetër.'],
    },
    {
      heading: 'Llojet e pyetjeve',
      bullets: ['Pyetje të përgjithshme: Pyetje se si të përdoret ANQR, shpjegime të veçorive ose reagime të përgjithshme.', 'Raportet e gabimeve: Ju lutemi përfshini shfletuesin tuaj, sistemin operativ, hapat për të riprodhuar dhe çdo mesazh gabimi që shihni.', 'Kërkesat për veçori: Sugjerime për veçori ose përmirësime të reja. Ne i shqyrtojmë të gjitha kërkesat edhe pse nuk mund të premtojmë zbatim.', 'Kërkesat e biznesit: Mundësi partneriteti, pyetje licencimi ose kërkesa për përdorim komercial.', 'Kërkesat për privatësi: Kërkesa për të ushtruar të drejtat tuaja të privatësisë sipas GDPR, CCPA ose ligjeve të tjera të privatësisë (shih Politikën e privatësisë).', 'DMCA/E drejta e autorit: Shih seksionin DMCA më poshtë për kërkesat e njoftimit për heqje.'],
    },
    {
      heading: 'Kohët e përgjigjes',
      paragraphs: ['Ne synojmë t\'u përgjigjemi pyetjeve brenda 5-7 ditëve të punës. Kërkesat në lidhje me privatësinë do të adresohen brenda 30 ditëve siç kërkohet me ligj.', 'Gjatë periudhave të ngarkuara, koha e përgjigjes mund të jetë më e gjatë. Për çështje urgjente, ju lutemi shënoni "URGENT" në rreshtin e subjektit.'],
    },
    {
      heading: 'Përpara se të na kontaktoni',
      paragraphs: ['Ju lutemi kontrolloni faqen tonë të Dokumentacionit për përgjigjet e pyetjeve të zakonshme rreth përdorimit të veçorive ANQR. Shumë pyetje rreth gjenerimit, stilimit dhe opsioneve të eksportit të kodit QR mbulohen atje.'],
    },
    {
      heading: 'Njoftimet për të drejtat e autorit DMCA',
      paragraphs: ['Nëse besoni se përmbajtja e disponueshme në ANQR cenon të drejtat tuaja të autorit, mund të paraqisni një njoftim për heqjen e Aktit Dixhital të Mijëvjeçarit për të Drejtat e Autorit (DMCA). Për të qenë i vlefshëm, njoftimi juaj duhet të përfshijë:'],
      bullets: ['Një nënshkrim fizik ose elektronik i zotëruesit të së drejtës së autorit ose agjentit të autorizuar.', 'Identifikimi i veprës me të drejtë autori që pretendohet se është shkelur.', 'Identifikimi i materialit që pretendohet se është shkelje, me informacion të mjaftueshëm për ta lokalizuar atë.', 'Informacioni juaj i kontaktit (adresa, numri i telefonit dhe adresa e emailit).', 'Një deklaratë që ju keni besim të mirë se përdorimi i materialit nuk është i autorizuar nga zotëruesi i të drejtës së autorit.', 'Një deklaratë, nën dënimin e dëshmisë së rreme, se informacioni në njoftimin tuaj është i saktë dhe se ju jeni zotëruesi i së drejtës së autorit ose i autorizuar të veproni në emër të tyre.'],
    },
    {
      heading: 'Kontakt DMCA',
      paragraphs: ['Dërgoni njoftimet e DMCA në: email@anqr.link', 'Ju lutemi përfshini "Njoftimin DMCA" në rreshtin e temës. Ne do t\'u përgjigjemi njoftimeve të vlefshme në përputhje me ligjin në fuqi. Vini re se ANQR gjeneron kode QR në nivel lokal në pajisjet e përdoruesve dhe nuk pret përmbajtje të krijuar nga përdoruesit.'],
    },
    {
      heading: 'Komuniteti Reddit',
      paragraphs: ['Bashkohuni me komunitetin tonë Reddit në r/ANQR për të ndarë krijimet tuaja QR, për të bërë pyetje, për të marrë ndihmë dhe për t\'u lidhur me përdoruesit e tjerë të ANQR.'],
    },
  ],
};

export default contact;
