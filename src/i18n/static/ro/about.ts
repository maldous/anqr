import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const about: PageDefinition = {
  title: 'Despre ANQR',
  description:
    'ANQR este un generator de coduri QR gratuit cu o abordare axată pe client - generați coduri QR local sau utilizați API-ul nostru pentru încorporare.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Deschideți generatorul', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Răsfoiți articolele Learn', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Politica de confidențialitate', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Termeni și condiții', type: 'external' },
  ],
  sections: [
    {
      heading: 'Ce este ANQR?',
      paragraphs: [
        'ANQR (pronunțat "ancoră") este un generator de coduri QR gratuit care creează coduri scanabile pentru URL-uri, text, acreditări Wi-Fi, cărți de contact, evenimente din calendar și multe altele.',
        'Este conceput pentru persoane fizice, întreprinderi mici, marketeri și dezvoltatori care doresc instrumente QR puternice fără a se înscrie. Designul axat pe client înseamnă că codurile QR sunt generate local în browser în mod implicit, cu o API de server opțională pentru încorporare și integrare profesională.',
      ],
    },
    {
      heading: 'Caracteristici cheie',
      bullets: [
        'Generați coduri QR instantaneu în browser - nu este necesar un cont.',
        'Personalizați culorile, stilurile modulelor, modelele de căutare și adăugați suprapuneri de imagini.',
        'Exportați în mai multe formate: PNG, SVG, WebP și GIF animat.',
        'Controale avansate pentru nivelul de corecție a erorilor, versiunea QR, modul de codificare și selectarea măștii.',
        'Îndrumări privind siguranța scanării și previzualizare live pentru a menține codurile lizibile în format tipărit și pe ecran.',
        'API pe server pentru încorporare profesională cu suport complet pentru parametri.',
        'Funcționează offline odată încărcat - este o aplicație web statică pe care o puteți rula oriunde.',
      ],
    },
    {
      heading: 'Cum funcționează ANQR',
      paragraphs: [
        'ANQR rulează în browser și codifică datele introduse într-o matrice QR standard cu corecție de erori Reed-Solomon, apoi o redă în formatul ales.',
        'În mod implicit, generarea se face local în browser. Pentru uz profesional, puteți utiliza și API-ul server-side pentru a genera coduri QR prin parametri URL - perfect pentru încorporarea în site-uri web, e-mailuri sau fluxuri de lucru automate.',
        'Când adăugați suprapuneri sau animații, ANQR echilibrează stilizarea cu fiabilitatea scanării, astfel încât rezultatul să rămână scanabil.',
        'ANQR se concentrează pe coduri statice (datele se află în interiorul codului QR). Dacă aveți nevoie de un cod dinamic (destinație editabilă), puteți codifica propria adresă URL de redirecționare sau un link scurt.',
      ],
    },
    {
      heading: 'Cine operează ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Publicitate și cum rămânem liberi',
      paragraphs: [
        'ANQR este gratuit și este susținut de publicitate. Este posibil să afișăm reclame prin Google AdSense și/sau alți parteneri de publicitate.',
        'Furnizorii de reclame pot utiliza cookie-uri sau tehnologii similare pentru a personaliza reclamele în funcție de interesele și activitatea dvs. de navigare. Puteți gestiona preferințele privind reclamele în setările dispozitivului și prin intermediul setărilor pentru reclame Google și puteți afla mai multe în Politica noastră de confidențialitate.',
        'Nu vindem conținutul pe care îl codificați în coduri QR. Reclamele ajută la acoperirea costurilor de derulare și îmbunătățire a proiectului.',
      ],
    },
    {
      heading: 'Standarde deschise',
      paragraphs: [
        'ANQR generează coduri QR pe baza standardului ISO/IEC 18004 și vizează o compatibilitate largă între scanere, camere și fluxuri de lucru pentru imprimare.',
      ],
    },
    {
      heading: 'Notificare privind mărcile comerciale',
      paragraphs: [
        'QR Code® este o marcă comercială înregistrată a DENSO WAVE INCORPORATED. ANQR nu este afiliat cu, aprobat de sau sponsorizat de DENSO WAVE INCORPORATED.',
      ],
    },
    {
      heading: 'Feedback și contribuții',
      paragraphs: [
        'Așteptăm cu nerăbdare feedback, raportări de erori și sugestii de funcții. Vă rugăm să ne contactați prin e-mail sau prin pagina de contact - citim fiecare mesaj, deși timpii de răspuns pot varia.',
      ],
    },
  ],
};

export default about;
