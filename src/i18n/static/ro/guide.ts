import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Ghidul utilizatorului ANQR',
  description: 'Ghid complet pentru utilizarea ANQR pentru crearea de coduri QR.',
  lastUpdated: '1 februarie 2026',
  breadcrumb: ['Ghid'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Deschideți generatorul', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Răsfoiți articolele Learn', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Noțiuni introductive',
      paragraphs: ['ANQR este un generator de coduri QR cu o abordare axată pe client. În mod implicit, codurile QR sunt generate local în browserul dumneavoastră - nu este necesar un cont, iar datele dumneavoastră rămân private. Pentru încorporarea profesională, puteți utiliza și API-ul server-side.', 'Interfața are trei niveluri de interfață: Basic, Advanced și Professional. Selectați-vă nivelul folosind filele din antet. Fiecare nivel deblochează funcții suplimentare, menținând în același timp interfața concentrată pe ceea ce aveți nevoie.'],
      bullets: ['De bază: Creare simplă de coduri QR cu conținut text simplu/URL și suprapunere de imagini.', 'Avansat: Opțiuni de codare QR, stiluri de randare, animație, formate de ieșire, tipuri de conținut extinse și personalizare suprapunere.', 'Profesional: Filigrane, metadate, partajare, analiză de siguranță, coduri QR pentru plăți și funcții pentru întreprinderi.'],
      links: [{ href: '/?lang=${lang}', label: 'Deschideți generatorul', type: 'generator' }],
    },
    {
      heading: 'Pornire rapidă',
      paragraphs: ['Pentru a crea primul cod QR:'],
      bullets: ['1. Selectați un tip de conținut (URL, text, WiFi etc.) din meniul derulant Tip de conținut.', '2. Introduceți datele în câmpurile furnizate.', '3. Opțional, personalizați culorile, stilurile și adăugați o imagine suprapusă.', '4. Faceți clic pe Export pentru a descărca codul QR ca PNG, GIF, WebP sau SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Caracteristici de bază',
      paragraphs: ['Nivelul de bază oferă o interfață simplificată pentru crearea de coduri QR cu conținut util și suprapuneri de imagini. Aceasta este cea mai simplă modalitate de a începe.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Tipuri de conținut (de bază)',
      paragraphs: ['Text simplu: Codificați orice text până la limita de capacitate a codului QR. Ideal pentru mesaje scurte, coduri sau identificatori.', 'URL: Codificați adrese web. Codul QR va deschide adresa URL la scanare. Acceptă protocoalele http:// și https://.'],
    },
    {
      heading: 'Suprapunere imagine (de bază)',
      paragraphs: ['Încărcați o imagine (JPG, PNG, GIF, WebP) pentru a o combina cu codul QR. Caracteristicile de bază ale suprapunerii includ:'],
      bullets: ['Încărcați din fișier: Selectați o imagine de pe dispozitiv.', 'Încărcați din URL: Introduceți o adresă URL a imaginii (trebuie să permită CORS).', 'Sigla centrală: Plasează imaginea în centru, bazându-se pe corectarea erorilor.', 'Combinare: Combinare alfa simplă a imaginii cu modelul QR.', 'Intensitate: Controlează cât de puternic afectează suprapunerea codul QR (0-100%).', 'Mod culoare: Culoare completă, Tonuri de gri sau Alb-negru.', 'Păstrare modele Finder: Păstrează modelele de colțuri nemodificate pentru o scanare fiabilă.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Consultați ghiduri și exemple conexe', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Funcții avansate',
      paragraphs: ['Nivelul avansat deblochează opțiunile de codare QR, stilurile de randare, animația, formatele de ieșire, tipurile de conținut extinse și personalizarea avansată a suprapunerii.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Setări de codare QR',
      paragraphs: ['Versiune: Codurile QR sunt disponibile în versiunile 1-40, versiunile superioare conținând mai multe date, dar fiind mai mari. Setați la 0 (Auto) pentru a permite ANQR să aleagă cea mai mică versiune care se potrivește conținutului dvs..', 'Corecție erori: Determină cât de multe daune poate suferi un cod QR rămânând în același timp scanabil.'],
      bullets: ['L (Scăzut): Corecție erori 7% - cea mai mică dimensiune, cea mai mică redundanță.', 'M (Mediu): Corecție erori 15% - opțiune echilibrată.', 'Q (Quartile): Corecție eroare 25% - bună pentru codurile tipărite.', 'H (High): Corecție eroare 30% - cea mai bună pentru codurile cu suprapuneri sau în condiții dure.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Zonă liniștită (Margine)',
      paragraphs: ['Zona liniștită este spațiul alb din jurul codului QR. Scanerele au nevoie de această margine pentru a detecta unde începe codul. Standardul recomandă cel puțin 4 module. Reducerea sub 4 poate cauza probleme de scanare.'],
    },
    {
      heading: 'Stil modul',
      paragraphs: ['Modulele sunt pătratele individuale care alcătuiesc un cod QR. ANQR oferă cinci stiluri:'],
      bullets: ['Pătrat: Aspect clasic QR cu colțuri ascuțite.', 'Rotunjit: Colțuri înmuiate pentru un aspect mai prietenos.', 'Puncte: Module circulare pentru o estetică modernă.', 'Romb: Pătrate rotite la 45° pentru un model distinctiv.', 'Conectate: Modulele se îmbină atunci când sunt adiacente, creând forme organice.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Stil model Finder',
      paragraphs: ['Modelele Finder sunt cele trei pătrate mari din colțurile codurilor QR care ajută scanerele să orienteze codul. Stiluri disponibile:'],
      bullets: ['Pătrat: Colțuri pătrate standard.', 'Rotunjit: Colțuri înmuiate care se potrivesc cu stilul modulului rotunjit.', 'Cerc: Modele circulare de finder pentru coduri în stil punct.'],
    },
    {
      heading: 'Modele de aliniere și sincronizare',
      paragraphs: ['Modelele de aliniere apar în codurile QR mai mari (versiunea 2+) pentru a ajuta la corectarea distorsiunii. Modelele de sincronizare sunt liniile alternative care conectează modelele de finder.'],
      bullets: ['Stil de aliniere: Potrivire Finder, Pătrat, Rotunjit sau Cerc.', 'Stil de sincronizare: Potrivire Modul, Solid sau Punctat.'],
    },
    {
      heading: 'Culori',
      paragraphs: ['Prim-plan: Culoarea modulelor QR. Negrul (#000000) este standard, dar orice culoare închisă funcționează.', 'Fundal: Culoarea de fundal. Albul (#ffffff) este standard. Asigurați un contrast suficient cu prim-planul.', 'Fundal transparent: Eliminați complet fundalul pentru utilizare pe suprafețe colorate. Asigurați-vă că suprafața oferă un contrast adecvat.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Dimensiunea și spațiul dintre module',
      paragraphs: ['Dimensiunea modulului: Controlează dimensiunea fiecărui modul în pixeli. Valorile mai mari creează coduri mai mari și mai ușor de scanat.', 'Spațiul dintre module: Adaugă spațiu între module ca procent. Spațiile mici (5-15%) pot îmbunătăți scanabilitatea în anumite condiții, dar spațiile excesive reduc fiabilitatea.'],
    },
    {
      heading: 'Setări de ieșire',
      paragraphs: ['Format: Alegeți formatul de export în funcție de cazul de utilizare.'],
      bullets: ['PNG: Format raster fără pierderi, ideal pentru majoritatea utilizărilor. Cel mai bun pentru tipărire și digital.', 'WebP: Format modern cu fișiere de dimensiuni mai mici. Bun pentru utilizare web.', 'GIF: Necesar pentru codurile QR animate. Acceptă transparența.', 'SVG: Format vectorial care se scalează infinit. Ideal pentru imprimare mare sau când trebuie să editați codul.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Consultați ghiduri și exemple conexe', type: 'learn' },
      ],
    },
    {
      heading: 'Dimensiuni de ieșire',
      paragraphs: ['Lățime/Înălțime: Setați dimensiunea de ieșire în pixeli. Pentru imprimare, calculați pe baza DPI (de exemplu, 300 DPI la 1 inch = 300px)." "Dimensiunile mai mari scanează mai fiabil la distanță.'],
    },
    {
      heading: 'Setări de animație (avansate)',
      paragraphs: ['Controlează comportamentul codului QR animat:'],
      bullets: ['Viteză: Rata cadrelor animației în milisecunde.', 'Buclă: Animație continuă sau cu o singură redare.', 'Săritură: Direcția animației de ping-pong.', 'Începere cadru: Începe animația de la un cadru specific.', 'Cadre maxime: Limitează totalul de cadre din animație.', 'Pas cadru: Sari peste cadre pentru o animație mai rapidă.', 'Interpolare: Niciuna, Estompare încrucișată sau Morph între cadre.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Consultați ghiduri și exemple conexe', type: 'learn' },
      ],
    },
    {
      heading: 'Tipuri de conținut (avansate)',
      paragraphs: ['Nivelul avansat deblochează formate suplimentare de sarcină utilă:'],
      bullets: [
        'Număr de telefon (tel:): Creează o legătură telefonică apelabilă.',
        'E-mail (mailto:): Deschide clientul de e-mail cu subiect și corp opționale.',
        'SMS: Mesaj text precompletat către un număr de telefon.',
        'vCard: Fișă de contact completă cu nume, organizație, telefon, e-mail, adresă.',
        'MeCard: Format compact de contact, popular în Japonia.',
        'BizCard: Format vechi de carte de vizită.',
        'Locație geografică: Coordonate GPS care se deschid pe hărți.',
        'WiFi: Acreditări de rețea pentru conexiune automată (SSID, parolă, tip de securitate).',
        'Eveniment calendar: Format iCalendar cu titlu, locație, dată/oră.',
        'RSVP eveniment: Link către pagina de înregistrare la eveniment.',
        'Abonare calendar: Abonare la un flux ICS/WebCal.',
        'URL fișier/document: Link direct către fișiere descărcabile.',
        'Link stocare în cloud: Linkuri către Google Drive, Dropbox, OneDrive etc.',
        'Profil social: Linkuri către LinkedIn, Twitter, Instagram etc.',
        'Link mesagerie: Linkuri directe WhatsApp, Telegram, Signal.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Funcții avansate de suprapunere',
      paragraphs: ['Capacități suplimentare de suprapunere:'],
      bullets: ['Decupare: Activați decuparea pentru a selecta o regiune pătrată a imaginii.', 'Semiton: Model de puncte în stil clasic de imprimare bazat pe luminozitatea imaginii.', 'Dithering: Dithering cu difuzie de erori pentru reproducere detaliată.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Moduri de amestecare suprapunere (avansat)',
      paragraphs: ['Moduri de amestecare suplimentare la nivelul avansat:'],
      bullets: ['Subpixel: Împarte fiecare modul în subpixeli pentru detalii mai mari.', 'Zgomot albastru: Folosește dithering cu zgomot albastru pentru modele fără artefacte.', 'Mozaic: Efect bazat pe dale care păstrează structura imaginii.', 'Umplere gol: Plasează imaginea în golurile dintre module.', 'Luminozitate: Variază dimensiunea modulului în funcție de luminozitatea imaginii.', 'Duoton: Mapează imaginea la două culori pentru un contrast izbitor.'],
    },
    {
      heading: 'Intensitatea suprapunerii',
      paragraphs: ['Controlează cât de puternic afectează suprapunerea codul QR (0-100%). Valorile mai mari afișează mai multe detalii ale imaginii, dar pot reduce scanabilitatea. Începeți de la aproximativ 70% și ajustați în funcție de testare.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Consultați ghiduri și exemple conexe', type: 'learn' }],
    },
    {
      heading: 'Mod culoare',
      paragraphs: ['Cum este procesată imaginea suprapusă:'],
      bullets: ['Culoare completă: Păstrează culorile originale ale imaginii.', 'Nuanțe de gri: Convertește în tonuri de alb-negru.', 'Alb-negru: Conversie binară cu contrast ridicat.'],
    },
    {
      heading: 'Păstrează modelele căutării',
      paragraphs: ['Când este activată, păstrează modelele cele trei colțuri ale căutării nemodificate de suprapunere. Recomandat insistent pentru o scanare fiabilă.'],
    },
    {
      heading: 'Preprocesarea imaginii',
      paragraphs: ['Aplică filtre imaginii suprapuse înainte de amestecare. Aceste ajustări pot îmbunătăți modul în care apare imaginea în codul QR final.'],
      bullets: ['Luminozitate (-100 până la +100): Luminează sau întunecă imaginea.', 'Contrast (-100 până la +100): Măriți sau micșorați intervalul tonal.', 'Gamma (0,2 până la 3,0): Reglare neliniară a luminozității. Valorile sub 1 luminează tonurile medii, peste 1 le întunecă.', 'Saturație (-100 până la +100): Intensitatea culorii. -100 este scara de gri, +100 este suprasaturată.', 'Rotire nuanță (0-360°): Deplasați toate culorile în jurul roții de culori.', 'Estocare (0-20px): Atenuați detaliile imaginii.', 'Clarificare (0-100%): Îmbunătățiți marginile și detaliile.', 'Posterizare (0-16 niveluri): Reduceți nivelurile de culoare pentru un efect de poster.', 'Prag (0-255): Conversie în alb/negru binar la punctul de delimitare.', 'Detectare margini: Algoritmi Sobel sau Canny pentru a afișa doar marginile.', 'Inversare: Inversați toate culorile.'],
    },
    {
      heading: 'Mod potrivire',
      paragraphs: ['Cum se potrivește imaginea suprapusă în zona codului QR:'],
      bullets: ['Acoperire: Imaginea umple întreaga zonă, decupând dacă este necesar.', 'Conține: Întreaga imagine este vizibilă, poate avea margini.', 'Întindere: Imaginea se distorsionează pentru a umple exact.'],
    },
    {
      heading: 'Opțiuni de transformare',
      paragraphs: ['Rotire: Rotiți suprapunerea în trepte de 90°.', 'Întors X/Y: Oglindiți imaginea pe orizontală sau verticală.'],
    },
    {
      heading: 'Algoritmi de dithering',
      paragraphs: ['Ditheringul convertește imaginile cu ton continuu în modele pe care codurile QR le pot reprezenta. Disponibil atunci când se utilizează modurile de amestecare Dithered, Blue Noise sau True Dither.'],
      bullets: [
        'Difuzie eroare: Stil clasic Floyd-Steinberg. Răspândește eroarea de cuantizare la pixelii vecini.',
        'Ordonat (Bayer): Folosește o matrice de prag pentru modelele obișnuite.',
        'Punct grupat: Simulează imprimarea cu semitonuri.',
        'Vid și grup: Dithering ordonat optimizat.',
        'Zgomot albastru: Model aleatoriu, plăcut vizual.',
        'Prag zgomot albastru: Dithering de prag cu textură de zgomot albastru.',
        'Zgomot alb: Dithering de prag aleatoriu.',
        'Zgomot gaussian/triunghiular: Zgomot cu distribuții diferite.',
        'Zgomot albastru + difuzie eroare: Hibrid care combină ambele tehnici.',
        'Zgomot albastru ecranat: Model de zgomot albastru asemănător ecranului.',
        'Perceptual: Ponderat în funcție de luminanță pentru rezultate vizuale mai bune.',
        'Conștient de margini: Păstrează marginile imaginii în timpul dithering-ului.',
        'Prag adaptiv: Prag adaptiv local.',
        'Zgomot albastru temporal: Pentru GIF-uri animate, modelul variază per cadru.',
      ],
    },
    {
      heading: 'Nuclee de difuzie',
      paragraphs: ['Când utilizați dithering-ul prin difuzia erorilor, alegeți modul în care este distribuită eroarea:'],
      bullets: ['Floyd-Steinberg: Difuzie clasică cu 4 vecini. O alegere generală bună.', 'Jarvis-Judice-Ninke: cu 12 vecini, mai lin, dar mai lent.', 'Stucki: Similar cu JJN cu ponderi diferite.', 'Burkes: JJN simplificat, mai rapid.', 'Sierra: Familie de nuclee care echilibrează calitatea și viteza.', 'Atkinson: Difuzie a luminii, păstrează detaliile, dar poate fi granulată.'],
    },
    {
      heading: 'Intensitatea dithering-ului',
      paragraphs: ['Controlează cât de mult se aplică dithering-ul (0-100%). Valorile mai mici păstrează o mai mare parte din modelul original, valorile mai mari arată mai multe detalii ale imaginii.'],
    },
    {
      heading: 'Setări subpixel',
      paragraphs: ['Când se utilizează modul de amestecare subpixel:'],
      bullets: ['Dimensiunea grilei: 2×2, 3×3 sau 4×4 subpixeli per modul. Mai mare = mai multe detalii.', 'Regula centrului: Strict necesită ca subpixelul central să se potrivească cu modulul. Centrul semiton permite variații.', 'Culoare neutră: Culoarea utilizată pentru subpixeli nedeterminați.', 'Suprascriere căutător: Cum sunt redate modelele căutător (solid sau stilizat).'],
    },
    {
      heading: 'Setări semiton',
      paragraphs: ['Când se utilizează modul de amestecare semiton:'],
      bullets: ['Dimensiunea celulei: Per modul sau grilă N×N.', 'Forma punctului: Cerc, pătrat sau linie.', 'Curbă de luminozitate: Liniară, curbă S sau Gamma.'],
    },
    {
      heading: 'Culori duoton',
      paragraphs: ['Când se utilizează modul de amestecare duoton, setați culoarea Umbrei (zone întunecate) și culoarea Evidențiere (zone luminoase).'],
    },
    {
      heading: 'Setări animație GIF',
      paragraphs: ['Când se utilizează suprapuneri GIF animate:'],
      bullets: ['Utilizați întârzieri cadre: Respectați sincronizarea GIF originală.', 'FPS maxim: Limitați rata cadrelor (1-60 fps).', 'Gestionarea eliminării: Respectați sau simplificați metodele de eliminare a cadrelor.'],
    },
    {
      heading: 'Opțiuni avansate de randare',
      paragraphs: ['Controale suplimentare de randare:'],
      bullets: ['Mod spațiu: Niciunul, Inserție, Contur sau Spațiu negativ, stilizare spațiu.', 'Raza colțului: Procentaj de colțuri rotunjite pentru module.', 'Gradient: Niciunul, Gradient liniar, radial sau conic pe module.', 'Stil exterior/interior ochi: Stilizare independentă pentru inelele modelului de căutător.', 'Rotire puncte: Rotiți modulele diamant/punct.', 'Scală ochi: Ajustarea dimensiunii pentru modelele de căutător.', 'Stil cadru: Adăugați rame decorative (cadru rotunjit, autocolant, etichetă).', 'Text încadrat: Adăugați text precum "Scanează-mă!" "la cadre.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Codificare QR avansată',
      paragraphs: ['Reglare fină a codificării QR:'],
      bullets: ['Mod de codare: Automat, Numeric, Alfanumeric, Byte/UTF-8 sau Kanji.', 'Impunere zonă minimă de liniște: Asigurați o margine de cel puțin 4 module.', 'Masca model: Auto (optimală), sau selectați manual modele 0-7 pentru a controla distribuția modulului. Modele diferite creează diferite apariții vizuale în timp ce codează aceleași date.', 'Codarea caracterelor: ISO-8859-1 (latin-1 implicit), UTF-8 (unicode complet, inclusiv emoji) sau Shift-JIS (japoneză). Alege pe baza cerințelor de caracter ale conținutului.'],
    },
    {
      heading: 'Opțiuni avansate de ieșire',
      paragraphs: ['Setări suplimentare de export:'],
      bullets: ['Nume fișier: Nume fișier personalizat pentru descărcări.', 'Dimensiune paletă GIF: 2-256 culori în ieșirea GIF.', 'Cuantizator GIF: Reducere culoare mediană, NeuQuant sau Octree.', 'Dithering GIF: Dezactivat, Floyd-Steinberg sau Ordonat.', 'Culoare transparentă GIF: Setați o culoare transparentă.', 'SVG True Vector: Utilizați căi în loc de raster încorporat.', 'Precizie formă SVG: Redare pixel sau precisă a căii.', 'Suprapunere raster încorporată SVG: Includeți suprapunerea ca imagine încorporată.', 'Suprascriere fundal: Forțați o anumită culoare de fundal în ieșire.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opțiuni de validare',
      paragraphs: ['Setări de procesare a intrării:'],
      bullets: ['Validare intrare: Verificați formatul conținutului înainte de codificare.', 'Trim Whitespace: Eliminați spațiile de la început/sfârșit.', 'Normalizare linii noi: Convertiți toate sfârșitul de linie în LF.', 'Gardă lungime maximă: Avertizați dacă conținutul depășește capacitatea QR.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Funcții profesionale',
      paragraphs: ['Nivelul profesional adaugă filigrane, metadate, opțiuni de partajare, analiză de siguranță, coduri QR de plată și funcții pentru întreprinderi.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Filigran',
      paragraphs: ['Adăugați filigrane la codurile QR:'],
      bullets: ['Tip: Filigran text, imagine sau model.', 'Poziție: Centru, colțuri, margini, în spate sau zonă liniștită.', 'Opacitate: Transparență filigran (0-100%).', 'Mod de amestecare: Normal, Înmulțire, Ecran sau Suprapunere.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadate',
      paragraphs: ['Încorporați metadatele în fișierele exportate:'],
      bullets: ['Câmpuri Titlu, Autor, Drepturi de autor, Licență, Descriere.', 'Ora creării: Marcaj temporal de generare a încorporării.', 'Perechi cheie-valoare personalizate: Adăugați perechi de metadate arbitrare.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Partajare',
      paragraphs: ['Partajați configurațiile codului QR:'],
      bullets: ['Legătură directă: Generați o adresă URL partajabilă cu setările actuale.', 'Încorporați HTML: Obțineți cod de încorporare pentru site-uri web.', 'Codificați parametrii: Includeți toate setările în adresa URL de partajare.', 'Notă: Imaginile suprapuse din fișierele locale nu pot fi partajate prin URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Consultați ghiduri și exemple conexe', type: 'learn' },
      ],
    },
    {
      heading: 'Analiza de siguranță',
      paragraphs: ['Asigurați-vă că codurile QR rămân scanabile:'],
      bullets: ['Mod de siguranță: Dezactivat, Echilibrat sau Cerințe stricte de scanare.', 'Dimensiune minimă modul: Dimensiune minimă pixel per modul.', 'Zonă minimă quietă: Module cu margine minimă.', 'Blocare instrumente de căutare/Sincronizare/Aliniere/Format/Versiune: Protejare elemente specifice.', 'Intensitate maximă suprapunere prin ECC: Limite automate de intensitate bazate pe nivelul de corecție a erorilor.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Consultați ghiduri și exemple conexe', type: 'learn' },
      ],
    },
    {
      heading: 'Tipuri de conținut (Profesional)',
      paragraphs: ['Nivelul profesional adaugă tipuri de conținut pentru plăți și întreprinderi:'],
      bullets: ['EPC/SEPA (UE): Coduri QR pentru transferuri bancare europene cu IBAN, BIC, sumă, referință.', 'UPI (India): Interfață unificată de plăți cu VPA, numele beneficiarului, sumă.', 'PayNow (Singapore): Plată rapidă în Singapore cu UEN sau număr de telefon mobil.', 'PromptPay (Thailanda): Sistem național de plăți thailandez.', 'PIX (Brazilia): Plată instantanee braziliană cu cheie PIX.', 'Cripto: Adrese de plată Bitcoin, Ethereum, Litecoin cu sumă opțională.', 'Link campanie de marketing: URL-uri cu urmărire completă a parametrilor UTM (etichete de marketing).', 'Link scurt: Pentru utilizare cu scurtătoare de URL-uri pentru coduri QR dinamice/urmăribile.', 'Link digital GS1: Identificarea produsului cu GTIN, serie, lot, expirare.', 'Link profund aplicație: Link-uri profunde către aplicații iOS/Android cu scheme personalizate.', 'Format personalizat: Date brute fără formatare sau validare.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Consultați ghiduri și exemple conexe', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Plăți relevante pentru limbă în modul avansat',
      paragraphs: ['Când utilizați modul avansat, ANQR afișează automat metodele de plată relevante pentru limba selectată." De exemplu, utilizatorii vietnamezi văd VietQR, utilizatorii thailandezi văd PromptPay, iar utilizatorii de limbă indiană văd UPI și BharatQR. Metodele de plată globale (criptomonede, PayPal, Cash App) sunt disponibile pentru toate limbile. Modul profesional deblochează toate standardele de plată, indiferent de limbă.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standarde europene de plată',
      bullets: ['EPC/SEPA (UE): Coduri QR pentru transferuri bancare europene care respectă standardul EPC QR Code. Acceptă IBAN, BIC (opțional pentru valute interne), suma în EUR și referințe de plată structurate sau nestructurate. Utilizat în zona SEPA, inclusiv țările UE plus Elveția, Norvegia, Islanda, Liechtenstein, Monaco și San Marino.', 'Factură QR elvețiană: Standard de plată elvețian care respectă Ghidul de implementare SIX. Acceptă CHF și EUR, referință QR (QRR), referință creditor (ISO 11649), adrese structurate creditor/debitor și informații despre factură. Obligatoriu pentru facturile elvețiene din 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standarde de plată indiene',
      bullets: ['UPI (India): Interfață unificată de plăți care respectă specificația NPCI Deep Linking. Acceptă VPA (adresă de plată virtuală), numele beneficiarului, suma în INR, nota de tranzacție, ID-ul de referință, codul categoriei comerciantului și modul de tranzacție.', 'BharatQR (India): Standard QR unificat care acceptă atât plățile UPI, cât și cele bazate pe card. Combină UPI VPA cu PAN-ul cardului pentru compatibilitate maximă. Include numele comerciantului, orașul, MCC, detaliile GST și numerele de factură/referință.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standarde de plăți din Asia de Sud-Est',
      bullets: ['PayNow (Singapore): Sistem de plată rapidă din Singapore care utilizează specificația EMVCo QR cu profil SGQR. Acceptă UEN (înregistrarea comercială), numărul de telefon mobil sau NRIC ca identificatori proxy. Include indicatorul de editare a sumei și data de expirare.', 'PromptPay (Thailanda): Sistem național de plăți thailandez care respectă profilul EMV al Băncii Thailandei. Acceptă numărul de telefon mobil, actul de identitate național, actul de identitate fiscal, ID-ul portofelului electronic și plata facturilor cu câmpuri de referință multiple.', 'QRIS (Indonezia): Standard indonezian cu cod de răspuns rapid. Standard național de plată bazat pe EMV care acceptă ID-ul comerciantului, NMID (ID-ul național al comerciantului), clasificarea criteriilor comerciantului și comisioanele de confort (fixe sau procentuale).', 'DuitNow (Malaezia): Sistem de plată instantanee malaezian. Acceptă mai multe tipuri de proxy, inclusiv numere NRIC, mobile, pașaport, ID armată și numere de înregistrare comercială.', 'VietQR (Vietnam): Standard vietnamez de transfer interbancar. Necesită BIN bancar (identificare NAPAS) și număr de cont. Acceptă mai multe coduri de serviciu pentru diferite tipuri de transfer (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filipine): Standard de plată QR filipinez pentru InstaPay și PESONet. Utilizează numere de cont cu identificare a comerciantului pentru tranzacții P2M (persoană-comerciant).'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standarde de plată din Asia de Est',
      bullets: ['TWQR (Taiwan): Standard de plată QR taiwanez. Acceptă ID-ul comerciantului, ID-ul fiscal și sumele TWD.', 'HKQR/FPS (Hong Kong): Coduri QR ale sistemului de plăți mai rapide din Hong Kong. Acceptă ID-ul FPS, numărul de telefon mobil sau adresa de e-mail ca identificatori de plată. Sume în HKD.', 'JPQR (Japonia): Standard japonez unificat de plată cu cod QR. Folosește ID-ul magazinului pentru identificarea comerciantului cu sume în JPY.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Alte standarde regionale de plată',
      bullets: ['PIX (Brazilia): Sistem de plată instantanee al Băncii Centrale a Braziliei, care respectă specificațiile codului BR. Acceptă chei PIX (CPF, CNPJ, e-mail, telefon sau cheie aleatorie), numele/orașul comerciantului, ID-ul tranzacției și sumele BRL.', 'AusPayNet/NPP PayID (Australia): Sistem PayID al noii platforme australiene de plăți. Acceptă tipuri de PayID (e-mail, mobil, ABN, ID organizație) sau BSB tradițional + număr de cont. Numele comerciantului este opțional, deoarece plătitorii văd numele înregistrat din căutarea NPP.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Plăți cu criptomonede',
      bullets: ['Bitcoin/Litecoin (BIP-21): URI-uri standard pentru plăți cu criptomonede cu adresă de portofel, sumă opțională și etichetă. Compatibil cu toate portofelele majore Bitcoin și Litecoin.', 'Lightning Network (BOLT11): Facturi de plată Lightning Network. Lipiți un șir de factură codificat BOLT11 pentru plăți instantanee Bitcoin cu comisioane minime.', 'Ethereum (EIP-681): URI-uri de solicitare a tranzacțiilor Ethereum care acceptă transferuri native ETH și transferuri de token-uri ERC-20. Include ID-ul lanțului pentru suport multi-rețea (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parametri de gaz și apeluri de funcții contractuale.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Servicii de link-uri de plată',
      bullets: ['PayPal.Me: Link-uri de plată PayPal cu nume de utilizator și sumă precompletată opțională. Destinatarii pot plăti prin soldul PayPal, carduri sau conturi bancare.', 'Aplicația Cash: Legături de plată pentru aplicația Cash folosind $cashtag cu sumă opțională. Popular în Statele Unite pentru plățile peer-to-peer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Cod QR EMV generic',
      bullets: ['EMV generic: Creați coduri QR EMV personalizate în modul prezentat de comerciant pentru scheme de plată care nu sunt enumerate în mod specific. Configurați numele comerciantului, orașul, codul țării (ISO 3166-1), codul monedei (ISO 4217 numeric), MCC, opțiunile de bacșiș/comision și câmpuri de date suplimentare. Util pentru testare sau integrări personalizate.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Moduri de amestecare suprapuse (profesionale)',
      paragraphs: ['Moduri de amestecare suplimentare la nivel profesional:'],
      bullets: ['Pixelare: Efect de suprapunere pixelată.', 'Contur: Suprapunere de detectare a marginilor care afișează doar contururile.', 'Undă: Efect de distorsiune ondulată.', 'Dimensiune subpixel: Dimensiune variabilă a subpixelului în funcție de imagine.', 'True Dithering: Dithering avansat cu selecție ordonată a matricei.', 'Extrem: Vizibilitate maximă a imaginii, poate afecta scanabilitatea.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Setări de protecție',
      paragraphs: ['Control detaliat asupra elementelor QR care sunt protejate de modificarea suprapunerii:'],
      bullets: ['Păstrați sincronizarea: Păstrați modelele de sincronizare nemodificate.', 'Păstrați alinierea: Păstrați modelele de aliniere nemodificate.', 'Protejați informațiile despre format: Module de informații despre formatul ecranului.', 'Protejați informațiile despre versiune: Module de informații despre versiunea ecranului.'],
    },
    {
      heading: 'Mod ECC-Aware',
      paragraphs: ['Distribuie inteligent intensitatea suprapunerii pe baza capacității de corectare a erorilor. Sistemul analizează ce module pot fi modificate, menținând în același timp scanabilitatea.'],
      bullets: ['Buget de risc: Procentul de utilizare a capacității de corectare a erorilor (0-100%).', 'Buget mai mare = suprapunere mai vizibilă, dar scanabilitate mai riscantă.', 'Buget mai mic = scanare mai sigură, dar suprapunere mai puțin vizibilă.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opțiuni profesionale de randare',
      paragraphs: ['Controale avansate de randare:'],
      bullets: ['Margini clare: Utilizați randarea imaginii pixelate pentru margini clare ale modulelor.', 'Aliniere pixeli: Aliniere pixeli podea, rotundă sau tavan.', 'Mod culoare per modul: Solid, După luminozitate, După poziție, După suprapunere, După grup.', 'Paletă de culori: Definiți o paletă de culori personalizată pentru colorarea per modul.', 'Gardă de contrast: Asigurați un raport de contrast minim între culori.', 'Raport minim de contrast: Cerință de contrast în stil WCAG (1:1 până la 21:1).', 'Module de bordură suplimentare: Bordură suplimentară dincolo de zona liniștită.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opțiuni profesionale de ieșire',
      paragraphs: ['Setări de export pentru întreprindere:'],
      bullets: ['DPI: Setați rezoluția de imprimare (72-600 DPI). Se recomandă 300 DPI pentru imprimare.', 'Includeți Zona Liniștită: Comutați zona liniștită în dimensiunile de ieșire.', 'Exportați ca suplimentar: Generați PDF alături de formatul principal.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Setări de animație (Profesional)',
      paragraphs: ['Funcții suplimentare de animație profesională:'],
      bullets: ['Dithering temporal: Dezactivat, Zgomot albastru sau Pâlpâire Dithering per cadru sigur.', 'Model: Fără, Puls, Undă, Linie de scanare, Strălucire sau Efecte de derivă.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Consultați ghiduri și exemple conexe', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Referință API',
      paragraphs: ['ANQR oferă un API server-side pentru generarea de coduri QR prin parametri URL." "Este ideal pentru încorporarea codurilor QR în site-uri web, e-mailuri, documente sau fluxuri de lucru automatizate fără JavaScript pe partea de client.', 'URL de bază: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'example' }],
    },
    {
      heading: 'Parametri de bază',
      paragraphs: ['Parametri obligatorii și comuni (numele parametrilor nu sunt traduse):'],
      bullets: ['date (obligatoriu): Conținutul de codificat în codul QR. Caractere speciale codificate prin URL.', 'size: Dimensiunea imaginii în pixeli (implicit: 400, max: 2000). Se utilizează dacă nu sunt specificate lățimea/înălțimea.', 'w, h: Lățimea și înălțimea de ieșire în pixeli." "Suprascrie parametrul de dimensiune.', 'format: Format de ieșire - png, webp sau gif (implicit: png).', 'ec: Nivel de corecție a erorilor - L, M, Q sau H (implicit: H).', 'fg: Culoare prim-plan în hexadecimal fără # (implicit: 000000).', 'bg: Culoare fundal în hexadecimal fără # (implicit: ffffff).', 'transparent: Setați la 1 pentru fundal transparent.', 'margin: Zonă liniștită în module (implicit: 4).'],
    },
    {
      heading: 'Parametri de stilizare',
      paragraphs: ['Stilizare modul și model:'],
      bullets: ['stil: Stil modul - pătrat, rotunjit, puncte, diamant, conectat.', 'finder: Stil model Finder - pătrat, rotunjit, cerc.', 'align: Stil model aliniere - match_finder, pătrat, rotunjit, cerc.', 'timing: Stil model de sincronizare - match_module, solid, dashed.', 'radius: Procentaj rază colț 0-100.', 'gap: Procentaj spațiu modul 0-50.', 'gapMode: Mod spațiu - niciunul, inserție, contur, spațiu_negativ.', 'eyeOuter, eyeInner: Stiluri ochi - pătrat, rotunjit, cerc.', 'eyeScale: Procentaj scală ochi (implicit: 100).', 'grad: Tip gradient - niciunul, liniar, radial, conic.', 'gradAngle: Unghiul gradientului pentru gradienții liniari.', 'gradStops: Opriri gradient ca color1, pos1, color2, pos2,... (de exemplu, ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Parametri suprapunere',
      paragraphs: ['Opțiuni de suprapunere a imaginii (imaginea suprapusă este preluată de pe server):'],
      bullets: ['img: URL pentru imaginea suprapusă (trebuie să fie accesibilă publicului).', 'mode: Mod suprapunere - centru, semiton, amestec, luminozitate, mozaic, dithered, zgomot albastru, subpixel.', 'intensity: Intensitatea suprapunerii 0-100 (implicit: 100).', 'colorMode: Mod culoare suprapunere - culoare, tonuri de gri, bw.', 'fit: Cum se potrivește suprapunerea - acoperă, conține, întinde.', 'rot: Rotația suprapunerii în grade.', 'flipX, flipY: Setați la 1 pentru a inversa suprapunerea.', 'keepFinders: Păstrați modelele finder (implicit: 1).', 'keepTiming, keepAlign: Setați la 1 pentru a păstra modelele de sincronizare/aliniere.'],
    },
    {
      heading: 'Parametri de preprocesare',
      paragraphs: ['Preprocesare imagine aplicată suprapunerii:'],
      bullets: ['luminozitate: Ajustare -100 până la 100 (implicit: 0).', 'contrast: Ajustare -100 până la 100 (implicit: 0).', 'gamma: Valoare 0,1 până la 3 (implicit: 1).', 'saturație: Ajustare -100 până la 100 (implicit: 0).', 'nuanță: Rotația nuanței în grade.', 'estomac: Estompare în pixeli.', 'claritate: Cantitate de claritate 0-100.', 'posterizare: Niveluri de posterizare.', 'prag: Prag binar 0-255.', 'margine: Detectare margini - dezactivată, sobel, canny.', 'inversare: Setați la 1 pentru a inversa culorile.'],
    },
    {
      heading: 'Parametri filigran',
      paragraphs: ['Adăugați filigrane la codurile QR generate:'],
      bullets: ['wmEn: Setați la 1 pentru a activa filigranul.', 'wmKind: Tip filigran - text, imagine, model.', 'wmText: Text filigran (codificat URL).', 'wmImg: URL către imaginea filigranului.', 'wmPos: Poziție - centru, colțuri, margini, în spate, zonă_quiet.', 'wmOpacity: Opacitate 0-100 (implicit: 50).', 'wmBlend: Mod de amestecare - normal, multiplicare, ecran, suprapunere.'],
    },
    {
      heading: 'Parametri animație',
      paragraphs: ['Pentru ieșire GIF animată (necesită format=gif):'],
      bullets: ['animPattern: Model de animație - niciunul, puls, undă, linie de scanare, strălucire, derivă, ciclu_de_colorare.', 'animFrames: Număr de cadre 1-60 (implicit: 24).', 'animSpeed: Întârzierea cadrelor în milisecunde 10-1000 (implicit: 100).', 'animSeed: Sămânță aleatorie pentru animație.', 'easing: Easing animație - liniar, ease_in, ease_out, ease_in_out, bounce.'],
    },
    {
      heading: 'Parametri de ieșire',
      paragraphs: ['Opțiuni format ieșire:'],
      bullets: ['quality: Calitate WebP 0-1 (implicit: 0.9).', 'webpQ: Calitate WebP 0-100 (implicit: 90).', 'gifColors: Dimensiunea paletei GIF 2-256 (implicit: 256).', 'dpi: DPI ieșire pentru PNG (implicit: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: Câmpuri de metadate PNG.'],
    },
    // Crop Parameters
    {
      heading: 'Parametrii de decupare',
      paragraphs: ['Opțiuni de decupare a imaginii de suprapunere:'],
      bullets: ['cropEn: Activați tăierea suprapusă 0/1 (implicit: 0).', 'cropX: Decupați centrul X ca fracție 0-1 (implicit: 0,5).', 'cropY: Decupați centrul Y ca fracție 0-1 (implicit: 0,5).', 'cropSize: Decupați dimensiunea ca fracțiune a imaginii 0-1 (implicit: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Parametrii de blocare de siguranță',
      paragraphs: ['Controlați ce elemente QR sunt protejate de modificarea suprapunerii:'],
      bullets: ['lockF: Blocați modelele de căutare 0/1 (implicit: 1).', 'lockT: Blocare tipare de sincronizare 0/1 (implicit: 1).', 'lockA: Blocați modelele de aliniere 0/1 (implicit: 1).', 'lockFmt: Informații format blocare 0/1 (implicit: 1).', 'lockV: Blocare informații despre versiunea 0/1 (implicit: 1).', 'safeMode: Modul de siguranță - dezactivat, echilibrat, strict (implicit: dezactivat).', 'safeMinPx: Dimensiunea minimă a modulului în pixeli (implicit: 2).', 'safeMinQz: Module minime pentru zone silențioase (implicit: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parametrii de reglare automată',
      paragraphs: ['Setări de optimizare automată:'],
      bullets: ['autoVer: Alegeți automat versiunea QR 0/1 (implicit: 1).', 'autoEcc: Alegerea automată a nivelului ECC 0/1 (implicit: 0) - doar indiciu pe partea serverului.', 'autoReduce: [NUMAI CLIENT] Reducere automată a intensității până la scanare - necesită bucla de validare a scanării.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Parametri suplimentari de animație',
      paragraphs: ['Controale extinse pentru animație pentru ieșirea GIF:'],
      bullets: ['buclă: Bucle de animație continuu 0/1 (implicit: 1).', 'bounce: direcția de animație de ping-pong 0/1 (implicit: 0).', 'invers: Redați animația invers 0/1 (implicit: 0).', 'colorCycle: Activați efectul de ciclizare a culorilor 0/1 (implicit: 0).', 'interp: Interpolare cadru - niciunul, crossfade, morph (implicit: niciunul).', 'tempDither: Dithering temporal - off, blue_noise, flicker_safe (implicit: off).', 'startF: Cadrul de pornire al animației (implicit: 0).', 'maxF: Numărul maxim de cadre de randat (implicit: 0 = automat).', 'stepF: interval de pas de cadru (implicit: 1).', 'jitter: [NUMAI CLIENT] Trecerea modulului în pixeli - necesită regenerare QR per cadru.'],
    },
    // Dithering Parameters
    {
      heading: 'Parametrii de dithering',
      paragraphs: ['Algoritmi de dithering de control pentru procesarea suprapunerii:'],
      bullets: ['ditherKind: algoritmul Dither - error_diffusion, ordered_bayer, blue_noise, etc (implicit: ordered_bayer).', 'diffusionKernel: Eroare diffusion kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (implicit: floyd_steinberg).', 'ditherStrength: intensitate dither 0-100 (implicit: 50).', 'serpentine: Serpentine dithering 0/1 (implicit: 0).', 'matrice: Matrice dither ordonată - bayer2, bayer4, bayer8 (implicit: bayer4).', 'bnTile: Dimensiunea plăcii de zgomot albastru (implicit: 64).', 'bnSeed: semințe aleatoare de zgomot albastru (implicit: 0).', 'colorDither: Dithering de culoare - niciunul, per_canal, perceptiv (implicit: niciunul).'],
    },
    // Subpixel Parameters
    {
      heading: 'Parametrii subpixeli',
      paragraphs: ['Setări pentru modul de amestecare subpixeli:'],
      bullets: ['spGrid: dimensiunea grilei subpixeli - 2x2, 3x3, 4x4 (implicit: 3x3).', 'spCenter: Regula centrală - strict, halftone_center (implicit: strict).', 'spNeutral: Hex de culoare neutră fără # (implicit: 808080).', 'spFinder: Override Finder - solid, stilizat (implicit: solid).'],
    },
    // Halftone Parameters
    {
      heading: 'Parametrii de semiton',
      paragraphs: ['Setări pentru modul de amestecare semitonuri:'],
      bullets: ['htCell: dimensiunea celulei semiton - per_module sau grila nxn (implicit: per_module).', 'htDot: Forma punct - cerc, pătrat, linie (implicit: cerc).', 'htCurve: Curba de luminozitate - liniară, curbă s, gamma (implicit: liniar).', 'duo1: Duotone umbră hexagonală fără # (implicit: 000000).', 'duo2: hexadecimal de culoare de evidențiere biton fără # (implicit: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parametrii modului ECC-Aware',
      paragraphs: ['Distribuție inteligentă de suprapunere bazată pe capacitatea de corectare a erorilor:'],
      bullets: ['eccAware: Activați modul ECC-aware 0/1 (implicit: 0).', 'eccRisk: Procentaj buget de risc 0-100 (implicit: 50).', 'eccMap: Hartă de greutate - distance_to_finders, block_heatmap, empirical_scan_heatmap (implicit: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Parametrii cadru',
      paragraphs: ['Setări de cadru decorativ:'],
      bullets: ['cadru: Stil cadru - niciunul, cadru_rotunjit, autocolant, etichetă (implicit: niciunul).', 'frameText: text de afișat în cadru (URL codificat).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parametrii de culoare per modul',
      paragraphs: ['Opțiuni de colorare a modulelor individuale:'],
      bullets: ['modColor: Mod de culoare - solid, by_brightness, by_position, by_overlay, by_cluster (implicit: solid).', 'cGuard: Protecție de contrast 0/1 (implicit: 0).', 'minContrast: Raport minim de contrast 1-21 (implicit: 4,5).', 'paletă: culori hexagonale separate prin virgulă pentru modul paletă.', 'paletteMode: Distribuția paletei - poziție, luminozitate, diagonală, radială, aleatorie, rând, coloană (implicit: poziție).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parametrii de suprapunere GIF',
      paragraphs: ['Setări pentru imaginile animate GIF suprapuse:'],
      bullets: ['ovType: tip de suprapunere - static, gif, apng, webp_anim, video (implicit: static).', 'ovFramePick: Selectare cadre - all, every_n, max_frames, duration_limit (implicit: toate).', 'gifDelays: Folosiți întârzierile originale ale cadrelor GIF 0/1 (implicit: 1).', 'gifDispH: Manipularea eliminarea GIF - respect, simplifica (implicit: respect).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Limite de intensitate per-ECC',
      paragraphs: ['Intensitatea maximă de suprapunere pe nivel de corectare a erorilor:'],
      bullets: ['maxIntL: Intensitate maximă pentru ECC L 0-100 (implicit: 100).', 'maxIntM: Intensitate maximă pentru ECC M 0-100 (implicit: 100).', 'maxIntQ: Intensitate maximă pentru ECC Q 0-100 (implicit: 100).', 'maxIntH: Intensitate maximă pentru ECC H 0-100 (implicit: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parametri de simulare QA (doar pentru client)',
      paragraphs: ['Acești parametri sunt analizați pentru compatibilitatea URL-urilor, dar funcționează numai în browser:'],
      bullets: ['qaContrast: Activați verificarea contrastului 0/1 - necesită validare interactivă.', 'qaBlur: Simulați estomparea în pixeli - numai pentru testare interactivă.', 'qaNoise: Simulați nivelul de zgomot - numai pentru testare interactivă.', 'qaHeatmap: Afișați harta termică de lizibilitate 0/1 - necesită interfața de utilizare cu suprapunere canvas.'],
    },
    // Client-Only Parameters
    {
      heading: 'Parametri numai pentru client',
      paragraphs: ['Majoritatea parametrilor API sunt pe deplin acceptați pe partea serverului. Parametrii marcați [NUMAI CLIENT] sunt analizați pentru compatibilitatea cu adresele URL, dar necesită funcții de browser:'],
      bullets: ['jitter: fluctuația modulului necesită regenerarea QR pe ​​cadru cu caracter aleatoriu.', 'autoReduce: intensitatea de reducere automată necesită testare de scanare iterativă.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: simularea QA necesită validare interactivă a pânzei.'],
    },
    // Additional Output Parameters
    {
      heading: 'Parametri suplimentari de ieșire',
      paragraphs: ['Setări extinse de ieșire și export:'],
      bullets: ['fname: nume de fișier personalizat pentru descărcări (implicit: anqr-qrcode).', 'inclQz: Includeți zona de liniște în dimensiunile de ieșire 0/1 (implicit: 1).', 'bgOver: Culoarea de fundal înlocuiește hexadecimal fără # (înlocuiește parametrul bg).', 'fmtExtra: Format suplimentar de ieșire - none, eps, animated_webp (implicit: none). Notă: eps este [PARTIAL].', 'svgPrec: Precizia formei SVG - pixel, precis (implicit: pixel). [PARTIAL] Ieșire SVG limitată pe partea serverului.', 'svgEmbed: Încorporați suprapunerea raster în SVG 0/1 (implicit: 1). [PARTIAL] Ieșire SVG limitată pe partea serverului.', 'modulePx: dimensiunea pixelilor modulului (implicit: calculat automat din dimensiune).', 'border: module de margine suplimentare dincolo de zona liniştită (implicit: 0).', 'clar: Activați redarea imaginii clare/pixelate 0/1 (implicit: 1).', 'snap: modul Pixel snap - podea, rotund, tavan (implicit: podea).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parametrii de conservare a modelului',
      paragraphs: ['Controlați ce elemente structurale sunt protejate de suprapunere:'],
      bullets: ['keepFinders: Păstrați modelele de căutare 0/1 (implicit: 1).', 'keepTiming: Păstrați modelele de sincronizare 0/1 (implicit: 0).', 'keepAlign: Păstrați modelele de aliniere 0/1 (implicit: 0).', 'protectFmt: Protejați modulele de informații de format 0/1 (implicit: 0).', 'protectVer: Protejează modulele de informații despre versiunea 0/1 (implicit: 0).'],
    },
    {
      heading: 'Exemplu de utilizare',
      paragraphs: ['Cod QR de bază:', 'https://anqr.link/api/qr?data=https://example.com', 'Cod QR stilizat cu culori personalizate:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'Cod QR cu imagine suprapusă:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'GIF animat:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'example' }],
    },
    {
      heading: 'Încorporarea codurilor QR',
      paragraphs: ['În modul Profesional, funcția Partajare generează HTML și URL-uri încorporabile. Iată cum funcționează încorporarea:'],
      bullets: ['Partajare link: Creează un URL către aplicația ANQR cu toate setările codificate ca parametri URL. Destinatarii pot vizualiza și modifica codul QR.', 'Încorporare imagine: Generează o etichetă care indică API-ul serverului. Codul QR este redat pe server și servit ca imagine.', 'Încorporare Markdown: Creează sintaxa imaginii Markdown pentru documentație și fișiere README.', 'URL API direct: URL-ul API brut pentru utilizare în aplicații, scripturi sau alte integrări.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
    {
      heading: 'Exemplu HTML',
      paragraphs: ['Pentru a încorpora un cod QR în site-ul dvs. web:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" ; alt="QR Code" />', 'Pentru dimensionare responsivă:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" ; alt="QR Code" style="max-width: 100%; height: auto;" />', 'Serverul stochează în cache răspunsurile cu anteturi lungi în cache, astfel încât solicitările repetate pentru aceeași adresă URL sunt rapide.'],
    },
    {
      heading: 'Partajare format URL',
      paragraphs: ['Când faceți clic pe Partajare în modul Profesional, ANQR codifică setările curente în parametri URL." Formatul este:', 'https://anqr.link/?data=...&ec=H&style=rounded& ;....', 'Acești parametri oglindesc parametrii API, astfel încât puteți converti o adresă URL de partajare într-o adresă URL API modificând calea de bază de la / la /api/qr și ajustând parametrii w/h după cum este necesar.', 'Notă: Imaginile suprapuse încărcate din fișiere locale nu pot fi partajate prin URL - numai suprapunerile bazate pe URL (parametrul img) funcționează în linkurile partajate și apelurile API.'],
    },
    {
      heading: 'Limite de rată și utilizare',
      paragraphs: ['API-ul este gratuit pentru volume rezonabile. Pentru utilizare de volum mare sau aplicații comerciale care necesită disponibilitate garantată, vă rugăm să ne contactați.', 'Răspunsurile API includ anteturi de cache agresive. Pentru cele mai bune performanțe, memorați în cache răspunsurile la nivelul dvs. sau utilizați aceeași adresă URL în mod constant pentru coduri QR identice.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Cele mai bune practici',
      paragraphs: ['Urmați aceste instrucțiuni pentru coduri QR fiabile:'],
      bullets: ['Testați întotdeauna codurile QR cu mai multe aplicații de scanare înainte de imprimare.', 'Utilizați Corecția Erorilor H (Înaltă) atunci când adăugați suprapuneri.', 'Păstrați cel puțin 4 module de zonă liniștită (margine).', 'Asigurați un contrast ridicat între prim-plan și fundal.', 'Pentru imprimare, utilizați cel puțin 300 DPI și testați la dimensiunea reală a imprimării.', 'Activați opțiunea "Păstrați modelele Finder" atunci când utilizați suprapuneri.', 'Începeți cu o intensitate mai mică a suprapunerii și creșteți treptat.', 'Pentru utilizare în exterior, luați în considerare dimensiuni mai mari ale modulelor și o corecție a erorilor mai mare.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Răsfoiți articolele Learn', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'example' },
      ],
    },
    {
      heading: 'Depanare',
      paragraphs: ['Probleme și soluții frecvente:'],
      bullets: ['QR nu scanează: Reduceți intensitatea suprapunerii, creșteți corecția erorilor, verificați contrastul.', 'Cod prea mare: Reduceți lungimea conținutului, utilizați un instrument de scurtare a URL-urilor, o versiune mai mică.', 'Ieșire neclară: Măriți dimensiunea modulului, utilizați PNG în loc de formate comprimate.', 'Culorile arată greșit: Verificați contrastul culorilor, încercați modul de suprapunere în tonuri de gri.', 'GIF-ul nu se animă: Asigurați-vă că utilizați formatul de ieșire GIF, verificați numărul de cadre.', 'Suprapunerea imaginii nu se încarcă: Verificați permisiunile CORS pe imaginile la distanță.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Consultați ghiduri și exemple conexe', type: 'learn' }],
    },
    {
      heading: 'Comenzi rapide de la tastatură',
      paragraphs: ['ANQR acceptă comenzi rapide standard de la tastatură. Utilizați Ctrl/Cmd+S pentru a declanșa exportul (când este focalizat pe previzualizare).'],
    },
    {
      heading: 'Partajare și încorporare',
      paragraphs: ['În modul Profesional, faceți clic pe butonul Partajare pentru a copia o adresă URL cu setările dvs. actuale. Destinatarii pot deschide această adresă URL pentru a vedea configurația dvs. exactă. Notă: Imaginile suprapuse din fișierele locale nu pot fi partajate prin URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Încercați această configurație direct în generatorul ANQR.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Răsfoiți articolele Learn', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Deschideți generatorul', type: 'generator' },
  ],
};

export default guide;
