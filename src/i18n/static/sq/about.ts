import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Rreth ANQR',
  description: 'ANQR është një gjenerues falas i kodit QR me një qasje të parë të klientit - gjeneroni kode QR në nivel lokal ose përdorni API-në tonë për ngulitje.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Hapni gjeneratorin', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Shfletoni artikujt Mësoni', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Politika e privatësisë', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Kushtet e Shërbimit', type: 'external' },
  ],
  sections: [
    {
      heading: 'Çfarë është ANQR?',
      paragraphs: ['ANQR (shqiptohet "spirancë") është një gjenerues falas i kodeve QR që krijon kode të skanueshme për URL-të, tekstin, kredencialet Wi-Fi, kartat e kontaktit, ngjarjet e kalendarit dhe më shumë.', 'Është ndërtuar për individë, biznese të vogla, tregtarë dhe zhvillues që duan mjete të fuqishme QR pa u regjistruar. Dizajni i parë nga klienti do të thotë që kodet QR gjenerohen në nivel lokal në shfletuesin tuaj si parazgjedhje, me një API opsionale të serverit për futjen dhe integrimin profesional.'],
    },
    {
      heading: 'Karakteristikat kryesore',
      bullets: ['Gjeneroni kodet QR menjëherë në shfletuesin tuaj - nuk kërkohet llogari.', 'Personalizoni ngjyrat, stilet e moduleve, modelet e gjetësit dhe shtoni mbivendosje imazhesh.', 'Eksporto në formate të shumta: PNG, SVG, WebP dhe GIF i animuar.', 'Kontrolle të avancuara për nivelin e korrigjimit të gabimit, versionin QR, modalitetin e kodimit dhe zgjedhjen e maskës.', 'Udhëzime skanimi për sigurinë dhe pamje paraprake e drejtpërdrejtë për të ndihmuar në mbajtjen e kodeve të lexueshme në printim dhe në ekran.', 'API nga ana e serverit për futje profesionale me mbështetje të plotë të parametrave.', 'Punon jashtë linje sapo të ngarkohet - është një aplikacion statik në internet që mund ta ekzekutoni kudo.'],
    },
    {
      heading: 'Si funksionon ANQR',
      paragraphs: ['ANQR ekzekutohet në shfletuesin tuaj dhe kodon hyrjen tuaj në një matricë standarde QR me korrigjimin e gabimit Reed–Solomon, më pas e kthen atë në formatin që zgjidhni.', 'Si parazgjedhje, gjenerimi ndodh në nivel lokal në shfletuesin tuaj. Për përdorim profesional, mund të përdorni gjithashtu API-në nga ana e serverit për të gjeneruar kode QR nëpërmjet parametrave të URL-së - perfekte për t\'u futur në faqet e internetit, email-et ose rrjedhat e automatizuara të punës.', 'Kur shtoni mbivendosje ose animacione, ANQR balancon stilin me besueshmërinë e skanimit, në mënyrë që rezultati të mbetet i skanueshëm.', 'ANQR fokusohet në kodet statike (të dhënat janë brenda QR). Nëse keni nevojë për një kod dinamik (destinacion i modifikueshëm), mund të kodoni URL-në tuaj të ridrejtimit ose lidhjen e shkurtër.'],
    },
    {
      heading: 'Kush e operon ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklamimi dhe si qëndrojmë pa pagesë',
      paragraphs: ['ANQR është falas për t\'u përdorur dhe mbështetet nga reklamat. Ne mund të shfaqim reklama nëpërmjet Google AdSense dhe/ose partnerëve të tjerë reklamues.', 'Ofruesit e reklamave mund të përdorin kuki ose teknologji të ngjashme për të personalizuar reklamat bazuar në interesat dhe aktivitetin tuaj të shfletimit. Mund të menaxhoni preferencat e reklamave në cilësimet e pajisjes tuaj dhe nëpërmjet cilësimeve të reklamave të Google dhe të mësoni më shumë në Politikën tonë të privatësisë.', 'Ne nuk e shesim përmbajtjen që ju e kodoni në kode QR. Reklamat ndihmojnë në mbulimin e kostos së ekzekutimit dhe përmirësimit të projektit.'],
    },
    {
      heading: 'Standarde të hapura',
      paragraphs: ['ANQR gjeneron kode QR bazuar në standardin ISO/IEC 18004 dhe synon përputhshmëri të gjerë mes skanerëve, kamerave dhe rrjedhave të punës së printimit.'],
    },
    {
      heading: 'Njoftimi për markën tregtare',
      paragraphs: ['QR Code® është një markë tregtare e regjistruar e DENSO WAVE INCORPORATED. ANQR nuk është e lidhur, e miratuar ose e sponsorizuar nga DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Reagimet dhe kontributet',
      paragraphs: ['Ne mirëpresim komentet, raportet e gabimeve dhe sugjerimet e veçorive. Ju lutemi kontaktoni me email ose faqen e kontaktit - ne lexojmë çdo mesazh, megjithëse kohët e përgjigjes mund të ndryshojnë.'],
    },
  ],
};

export default about;
