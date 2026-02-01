import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const privacy: PageDefinition = {
  title: 'Politica de confidențialitate',
  description: 'Informațiile pe care le colectează ANQR, modul în care sunt utilizate și drepturile dvs. în conformitate cu legile aplicabile privind confidențialitatea.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Termeni și condiții', type: 'external' }],
  sections: [
    {
      heading: 'Rezumat',
      paragraphs: ['ANQR este un generator de coduri QR cu o abordare axată pe client. Nu vă solicităm să creați un cont. În mod implicit, codurile QR sunt generate local în browserul dvs. - nu avem acces la conținutul pe care îl codificați.', 'Pentru uz profesional, ANQR oferă un API server-side care generează coduri QR din parametri URL. Atunci când utilizați API-ul, conținutul dvs. QR este procesat pe serverele noastre pentru a reda imaginea, dar nu este stocat sau înregistrat.', 'Utilizăm Google AdSense pentru publicitate și este posibil să utilizăm servicii de analiză. Aceste servicii colectează informații prin cookie-uri și tehnologii similare. Această politică explică ce date sunt colectate, cum sunt utilizate și drepturile dvs..'],
    },
    {
      heading: 'Informații pe care le colectăm',
      bullets: ['Informații pe care le furnizați: Dacă ne contactați prin e-mail sau prin formularul nostru de contact, colectăm numele, adresa de e-mail și conținutul mesajului dumneavoastră.', 'Informații colectate automat: Furnizorul nostru de găzduire (Netlify), partenerii de publicitate și serviciile de analiză pot colecta: adresa IP, tipul și versiunea browserului, sistemul de operare, tipul dispozitivului, adresa URL de referință, paginile vizitate, timpul petrecut pe site și locația geografică aproximativă.', 'Cookie-uri terțe: Partenerii noștri de publicitate (Google AdSense) utilizează cookie-uri și tehnologii similare pentru a difuza și măsura reclame. ANQR în sine nu setează cookie-uri proprii.'],
    },
    {
      heading: 'Cookie-uri și tehnologii terțe',
      paragraphs: ['ANQR nu setează cookie-uri proprii. Preferințele dumneavoastră (cum ar fi modul întunecat) sunt stocate local pe dispozitivul dumneavoastră, care nu este transmis către niciun server.', 'Cu toate acestea, partenerii noștri de publicitate (Google AdSense) și furnizorul de găzduire pot utiliza cookie-uri și tehnologii de urmărire similare:'],
      bullets: ['Cookie-uri publicitare (terțe): Setate de Google AdSense și partenerii de publicitate pentru a difuza anunțuri relevante, a măsura performanța anunțurilor și a înțelege interesele utilizatorilor. Aceste cookie-uri pot urmări activitatea dvs. pe diferite site-uri web.', 'Cookie-uri analitice (terțe): Pot fi utilizate de furnizorul nostru de găzduire sau de serviciile de analiză pentru a colecta date de utilizare anonimizate.'],
    },
    {
      heading: 'Google AdSense și publicitate',
      paragraphs: ['Afișăm reclame prin Google AdSense. Google și partenerii săi utilizează cookie-uri pentru a difuza anunțuri pe baza istoricului dvs. de navigare pe acest site și pe alte site-uri web (publicitate bazată pe interese).', 'Aflați cum utilizează Google informațiile dvs.: https://policies.google.com/technologies/partner-sites', 'Gestionați personalizarea anunțurilor: https://adssettings.google.com', 'Renunțați prin intermediul Network Advertising Initiative: https://optout.networkadvertising.org', 'Renunțați prin intermediul Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Cum utilizăm informațiile',
      bullets: ['Pentru a răspunde la solicitările dvs. și a oferi asistență.', 'Pentru a afișa reclame relevante prin intermediul partenerilor noștri de publicitate.', 'Pentru a analiza utilizarea site-ului și a îmbunătăți serviciile noastre.', 'Pentru a detecta, preveni și aborda frauda, abuzul și problemele de securitate.', 'Pentru a respecta obligațiile legale.'],
    },
    {
      heading: 'Servicii terțe',
      bullets: ['Google AdSense: Primește date pentru a difuza și măsura reclame.', 'Furnizori de analiză: Primesc date de utilizare anonimizate.', 'Netlify (găzduire): Procesează cereri și poate înregistra adrese IP.', 'Nu vindem informațiile dumneavoastră personale. Cu toate acestea, partajarea datelor cu partenerii de publicitate poate fi considerată o «vânzare» în conformitate cu CCPA (vezi mai jos).'],
    },
    {
      heading: 'Păstrarea datelor',
      bullets: ['Trimiterea de contacte: Până la 2 ani.', 'Jurnale de server: Până la 30 de zile (furnizor de găzduire).', 'Date analitice: Până la 26 de luni (anonimizate).', 'Cookie-uri publicitare: De obicei 13 luni (variază în funcție de partener).'],
    },
    {
      heading: 'Drepturile dumneavoastră în temeiul GDPR (utilizatori SEE)',
      paragraphs: ['Dacă vă aflați în Spațiul Economic European, aveți următoarele drepturi în temeiul Regulamentului general privind protecția datelor:'],
      bullets: ['Dreptul de acces: Solicitați o copie a datelor cu caracter personal pe care le deținem despre dumneavoastră.', 'Dreptul la rectificare: Solicitați corectarea datelor inexacte.', 'Dreptul la ștergere: Solicitați ștergerea datelor dumneavoastră («dreptul de a fi uitat»).', 'Dreptul de a restricționa prelucrarea: Solicitați limite privind modul în care utilizăm datele dumneavoastră.', 'Dreptul la portabilitatea datelor: Solicitați datele dumneavoastră într-un format portabil.', 'Dreptul de a obiecta: Opuneți-vă prelucrării, inclusiv pentru marketing direct.', 'Dreptul de a retrage consimțământul: Retrageți consimțământul în orice moment în cazul în care prelucrarea se bazează pe consimțământ.', 'Dreptul de a depune o plângere: Depuneți o plângere la autoritatea dumneavoastră pentru protecția datelor.'],
    },
    {
      heading: 'Temeiul juridic GDPR',
      paragraphs: ['Prelucrăm datele pe următoarele temeiuri: (a) Consimțământ - pentru publicitate personalizată (gestionată de partenerii noștri de publicitate); (b) Interese legitime - pentru analiză, securitate și îmbunătățire; (c) Contract - pentru a răspunde la solicitări.', 'Pentru a vă exercita drepturile, contactați email@anqr.link." "Vă răspundem în termen de 30 de zile.'],
    },
    {
      heading: 'Drepturile dumneavoastră în temeiul CCPA (utilizatori din California)',
      bullets: ['Dreptul de a cunoaște: Solicitați informații despre datele colectate, surse, scopuri și terțe părți.', 'Dreptul de ștergere: Solicitați ștergerea informațiilor dumneavoastră personale.', 'Dreptul de a renunța: Renunțați la «vânzarea» informațiilor personale (partajarea cu partenerii publicitari poate fi eligibilă).', 'Dreptul la nediscriminare: Nu vom discrimina pentru exercitarea drepturilor dumneavoastră.'],
    },
    {
      heading: 'Categorii CCPA colectate',
      paragraphs: ['Categorii: Identificatori (adresă IP, ID dispozitiv), Activitate pe internet (navigare, interacțiuni cu reclame), Geolocație (aproximativă), Inferențe (interese din navigare).', 'Pentru a exercita drepturi sau a renunța: email@anqr.link sau ajustați setările cookie-urilor.'],
    },
    {
      heading: 'Transferuri internaționale',
      paragraphs: ['Informațiile dumneavoastră pot fi transferate către țări cu legi diferite privind protecția datelor, inclusiv Statele Unite. Folosim garanții adecvate, cum ar fi Clauzele Contractuale Standard.'],
    },
    {
      heading: 'Confidențialitatea copiilor',
      paragraphs: ['ANQR nu se adresează copiilor sub 13 ani (sau 16 ani în SEE). Nu colectăm în mod conștient date de la copii. Contactați email@anqr.link dacă credeți că un copil a furnizat informații.'],
    },
    {
      heading: 'Securitate',
      paragraphs: ['Utilizăm măsuri tehnice și organizatorice adecvate pentru a proteja datele, inclusiv criptarea HTTPS. Cu toate acestea, nicio transmisie pe internet nu este 100% sigură.'],
    },
    {
      heading: 'Nu urmăriți',
      paragraphs: ['Onorăm semnalele browserului "Nu urmăriți" acolo unde este posibil, deși partenerii de publicitate pot să nu răspundă la DNT.'],
    },
    {
      heading: 'Modificări ale acestei politici',
      paragraphs: ['Putem actualiza periodic această politică. Data "Ultima actualizare" indică cea mai recentă revizuire. Modificările semnificative pot fi comunicate prin intermediul unui banner al site-ului.'],
    },
    {
      heading: 'Contactați-ne',
      paragraphs: ['Pentru întrebări legate de confidențialitate sau pentru a vă exercita drepturile: email@anqr.link sau utilizați pagina noastră de Contact. Răspundem solicitărilor de confidențialitate în termen de 30 de zile.'],
    },
    {
      heading: 'Politica de confidențialitate completă',
      paragraphs: ['Această pagină oferă un rezumat al practicilor noastre de confidențialitate. Pentru politica de confidențialitate completă, obligatorie din punct de vedere juridic, cu detalii complete despre prelucrarea datelor, drepturile dumneavoastră și obligațiile noastre conform GDPR, CCPA și alte legi de confidențialitate, vă rugăm să consultați politica noastră completă găzduită de iubenda.'],
      links: [{ href: 'https://www.iubenda.com/privacy-policy/70266922', label: 'Vezi Politica de confidențialitate completă pe iubenda', type: 'external' }],
    },
  ],
};

export default privacy;
