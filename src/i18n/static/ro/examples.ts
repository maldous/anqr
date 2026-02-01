import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Exemple ANQR',
  description: 'Cinci exemple din lumea reală, în stil de producție, care arată unde codurile QR creează valoare măsurabilă: îmbunătățirea unui cod de contor de vânzare cu amănuntul vechi, plăți de vânzare cu amănuntul de marcă și acțiuni "scanare către", scalarea imprimării de la pliante la panouri publicitare, cod QR animat pentru semnalizare digitală și colaborare interlingvistică folosind linkuri Anchor partajabile. Fiecare exemplu include imagini, constrângeri practice și un link remix înapoi la generator.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Deschideți generatorul', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Răsfoiți articolele Learn', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Deschideți Ghidul utilizatorului complet', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Studiu de caz: Creșterea numărului de coduri QR la tejgheaua din magazine',
      paragraphs: ['Acest exemplu din lumea reală urmărește o mică cafenea care folosea același cod QR pe tejghea timp de trei ani. Codul original a fost generat rapid în timpul aglomerației pandemice, imprimat pe hârtie standard și introdus într-un suport de plastic. Încă funcționa - din punct de vedere tehnic - dar clienții aveau nevoie adesea de mai multe încercări pentru a-l scana și nu a făcut nimic pentru a consolida identitatea de brand atent elaborată a cafenelei.', 'Transformarea a început cu un audit simplu: codul existent a codificat adresa URL a meniului online al cafenelei, pe care doreau să o păstreze. Provocarea a fost să facă codul QR să pară parte a experienței cafenelei, mai degrabă decât o utilitate ulterioară din 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Un cod QR uzat într-un suport de plastic, care prezintă uzură vizibilă, amprente și imprimare decolorată',
          caption: 'Punctul de plecare: trei ani de servicii la tejghea au lăsat codul QR original abia funcțional',
        },
      ],
    },
    {
      heading: 'Diagnosticarea problemelor codului original',
      paragraphs: ['Testarea a relevat mai multe probleme: codul original folosea Corecția de Erori L (redundanță minimă), avea o zonă silențioasă de doar 2 module și era imprimat la rezoluție scăzută. Sub iluminarea caldă cu tungsten a cafenelei, modulele negre deja decolorate abia contrastau cu hârtia îngălbenită. Telefoanele mai vechi au avut dificultăți; telefoanele mai noi au avut succes, dar cu o întârziere vizibilă.', 'Dincolo de problemele tehnice, pătratul generic alb-negru nu comunica nimic despre brand." "Clienții au ezitat înainte de a scana - o barieră subtilă de încredere care a redus interacțiunea cu meniul digital atent conceput al cafenelei.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'O suprapunere de diagnosticare care arată deficiențele tehnice ale codului QR original: ECC scăzut, zonă silențioasă minimă, contrast slab',
          caption: 'Analiza tehnică dezvăluie de ce codul vechi a avut performanțe sub așteptări în condiții reale',
        },
      ],
    },
    {
      heading: 'Procesul de îmbunătățire',
      paragraphs: ['Folosind ANQR, proprietarul cafenelei a recreat codul cu adresa URL identică a meniului, dar a îmbunătățit dramatic setările: Corecție de eroare H pentru rezistență maximă, o zonă silențioasă cu 6 module pentru detectarea fiabilă a limitelor și culori ale mărcii (module vișiniu intens pe fundal crem) care se potriveau cu paleta de culori interioară a cafenelei.', 'A fost adăugată o mică suprapunere centrală cu sigla cafenelei - menținută în mod deliberat subtilă pentru a menține scanabilitatea, oferind în același timp recunoașterea instantanee a mărcii. Modul de siguranță a confirmat că noul design a fost scanat în mod fiabil pe dispozitivele de testare înainte de orice imprimare.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Interfața ANQR care prezintă configurația: culorile mărcii, ECC adecvat, zonă de liniște generoasă, suprapunere subtilă a logo-ului',
          caption: 'Construirea configurației actualizate: fiecare setare aleasă pentru a echilibra expresia mărcii cu fiabilitatea scanării',
        },
      ],
    },
    {
      heading: 'Rezultate măsurabile',
      paragraphs: ['După implementarea noului cod QR pe carton profesional laminat mat, cafeneaua a urmărit rezultatele pe parcursul a patru săptămâni. Rata de succes a scanării s-a îmbunătățit de la aproximativ 70% la aproape 100%. Timpul mediu de scanare a scăzut de la 3-4 secunde la sub 1 secundă. Cel mai semnificativ, implicarea în meniu a crescut cu 40% - clienții care anterior se uitau la codul QR și renunțau, scanau acum cu încredere.', 'Personalul a raportat mai puține întrebări din partea clienților despre «cum se utilizează codul QR» și că nu au mai fost nevoie de tastare manuală a adresei URL pentru clienții frustrați. Aspectul personalizat a stârnit, de asemenea, conversații, clienții comentând pozitiv designul coerent.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'O comparație înainte/după cu indicatori: rata de succes a scanării, timpul mediu de scanare și îmbunătățirile săptămânale ale numărului de scanări',
          caption: 'Patru săptămâni de date care arată impactul măsurabil al unei îmbunătățiri atentă a codurilor QR',
        },
      ],
    },
    {
      heading: 'Recreați această configurație',
      paragraphs: ['Configurația cafenelei demonstrează un branding conservator, dar eficient: Corecție de erori H, zonă silențioasă cu 6 module, culori ale mărcii cu contrast ridicat și o suprapunere centrală minimă. Acest echilibru funcționează pentru majoritatea aplicațiilor de vânzare cu amănuntul, unde fiabilitatea trebuie să fie pe primul loc, dar prezența mărcii contează în continuare.', 'Deschideți generatorul cu aceste setări preîncărcate și adaptați culorile și suprapunerea la propria marcă. Informația cheie: îmbunătățirile fiabilității pot crește dramatic implicarea, chiar înainte de a adăuga orice stil vizual.', 'Consultați ghidul de învățare aferent despre îmbunătățirea campaniilor QR existente pentru metodologia completă din spatele acestei abordări.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Legătură către generatorul preconfigurat cu setările cafenelei pentru personalizare imediată',
          caption: 'Începeți cu o configurație dovedită și personalizați-o pentru marca dvs.',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Răsfoiți articolele Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Studiu de caz: Afișaj la ghișeu pentru plăți multiple',
      paragraphs: ['Acest exemplu urmărește un magazin de îmbrăcăminte de tip boutique care acumulase cinci coduri QR diferite la casa de marcat: plată bancară, bacșișuri, Instagram, recenzii Google și un link de angajare. Fiecare a fost generat dintr-o sursă diferită, imprimat la momente diferite și afișat în standuri nepotrivite. Haosul vizual submina estetica atent selectată a magazinului, iar personalul se ocupa în mod regulat de clienți care scanau codul greșit.', 'Soluția necesita separarea preocupărilor: codurile de plată aveau nevoie de fiabilitate maximă, cu un stil conservator, în timp ce codurile de marketing puteau fi mai expresive. Sistemul de afișare unificat care a apărut demonstrează cum să se echilibreze prezența mărcii cu cerințele funcționale ale diferitelor cazuri de utilizare a codurilor QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'O zonă aglomerată a casei de marcat care afișa cinci coduri QR nepotrivite pe diverse standuri și materiale tipărite',
          caption: 'Punctul de plecare haotic: cinci coduri QR deconectate care concurează pentru atenție și cauzează confuzie în rândul clienților',
        },
      ],
    },
    {
      heading: 'Prioritizarea experienței de plată',
      paragraphs: ['Metoda principală de plată a magazinului a folosit un standard regional care impunea respectarea strictă a sarcinii utile. Testele au arătat că până și o ușoară modificare a stilizării a afectat viteza de scanare cu anumite aplicații bancare. Decizia: păstrarea codului QR de plată complet nemodificat, cu excepția optimizării dimensiunii și a imprimării profesionale pe carton mat.', 'Această abordare conservatoare a însemnat că codul de plată arăta mai puțin «branding» decât era ideal, dar ratele de finalizare a tranzacțiilor s-au îmbunătățit dramatic. Perspectiva: momentele de plată nu sunt oportunități de branding - sunt momente de fiabilitate. Clienții apreciază viteza și certitudinea mai mult decât estetica atunci când sunt implicați bani.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Un cod QR de plată curat, mare, pe carton mat profesional, poziționat proeminent la casă',
          caption: 'Codul QR de plată: dimensionat generos, imprimat profesional, stilizat conservator pentru recunoaștere instantanee de către aplicațiile bancare',
        },
      ],
    },
    {
      heading: 'Crearea afișajului secundar de acțiune',
      paragraphs: ['Pentru sfaturi, recenzii, rețele sociale și angajări, magazinul ar putea fi mai expresiv. Aceste coduri au fost regenerate în ANQR cu un stil de brand consistent: verde măsliniu caracteristic magazinului pe crem, stil de modul rotunjit și o suprapunere centrală subtilă cu pictograma magazinului. Corecția erorilor H a asigurat fiabilitatea chiar și cu stilizarea.', 'Aceste patru coduri au fost aranjate într-un panou de brand poziționat lângă (fără a concura cu) codul de plată. Etichete clare în tipografia magazinului explicau scopul fiecărui cod." "Ierarhia vizuală a fost intenționată: plata era independentă și proeminentă; acțiunile secundare grupate ca opțiuni.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Un panou de branding care prezintă patru coduri QR stilizate pentru sfaturi, recenzii, rețele sociale și angajare, cu etichete clare',
          caption: 'Panoul de acțiuni secundare: branding consistent, etichetare clară, poziționate ca opțiuni, mai degrabă decât ca distrageri',
        },
      ],
    },
    {
      heading: 'Designul sistemului de afișare',
      paragraphs: ['Afișajul fizic a rezolvat simultan mai multe probleme. Atât standul de plată, cât și panoul secundar au folosit materiale mate pentru a elimina strălucirea luminii de plafon. Înălțimile au fost optimizate pentru clienții de diferite staturi. Unghiurile au fost îndreptate spre coada de așteptare a clienților, mai degrabă decât plat pe tejghea.', 'În mod critic, magazinul a creat printuri de rezervă din linkurile de configurare ANQR blocate. Când codul pentru sfaturi a fost în cele din urmă stropit cu cafea, personalul l-a înlocuit în câteva minute folosind configurația stocată - fără capturi de ecran, fără ghicire a setărilor, fără degradare a calității.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'O diagramă care prezintă aspectul afișajului fizic: înălțimi, unghiuri, materiale și relația dintre plată și afișajele secundare',
          caption: 'Planul sistemului de afișare: ergonomie fizică optimizată pentru scanare fiabilă în funcție de înălțimea clienților și de condițiile de iluminare',
        },
      ],
    },
    {
      heading: 'Îmbunătățiri operaționale',
      paragraphs: ['La șase săptămâni de la implementare, magazinul a documentat îmbunătățiri semnificative: zero reclamații ale clienților cu privire la confuzia legată de «codul greșit», timpi de tranzacție mai rapizi și o creștere de 3 ori a numărului de bacșișuri trimise (clienții puteau acum să găsească și să scaneze codul bacșișului fără a întreba în mod stângaci personalul). Recenziile de pe Google au crescut, de asemenea, deoarece codul QR dedicat, bine etichetat, a eliminat dificultățile.', 'Instruirea personalului a devenit mai simplă: «codul de plată este cel important, totul este pe panou». Când aplicațiile de plată s-au actualizat și una a afișat pentru scurt timp o scanare mai lentă, designul conservator al codului de plată a însemnat că acesta a funcționat în continuare - doar puțin mai lent, în loc să eșueze complet.', 'Consultați ghidul de învățare despre codurile QR pentru plățile cu amănuntul pentru principiile din spatele acestui design al sistemului de afișare.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Un tablou de bord cu indicatori care prezintă comparații înainte/după: incidente de confuzie, timpul tranzacțiilor, frecvența bacșișurilor, trimiterea de recenzii',
          caption: 'Șase săptămâni de date operaționale care demonstrează impactul asupra afacerii al unui sistem de afișare multi-QR atent conceput',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Răsfoiți articolele Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Studiu de caz: De la carte de vizită la panou publicitar',
      paragraphs: ['Acest exemplu urmărește o companie de producție de evenimente care se pregătea pentru o conferință majoră. Aveau nevoie de același cod QR - care să facă legătura cu aplicația evenimentului - implementat în formate radical diferite: inserții pentru ecusoane de participanți (3 cm), cartonașe pentru corturi la masă (8 cm), semnalizare pentru biroul de înregistrare (30 cm), postere de orientare (60 cm) și un banner masiv pentru fundalul scenei (4 metri). Fiecare format avea distanțe de vizualizare, condiții de iluminare și fluxuri de lucru de producție diferite.', 'Provocarea nu a fost doar tehnică - a fost operațională." "Mai mulți furnizori gestionau diferite lucrări de imprimare, iar compania trebuia să asigure rezultate consecvente și scanabile, indiferent cine producea ce. Soluția lor s-a concentrat pe exportul SVG și documentația riguroasă a predării.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Un colaj care prezintă același cod QR implementat în cinci dimensiuni diferite, de la insignă la banner',
          caption: 'Un cod QR, cinci dimensiuni de implementare: provocarea menținerii scanabilității de la centimetri la metri',
        },
      ],
    },
    {
      heading: 'De ce evenimentele anterioare au avut probleme',
      paragraphs: ['La ultima lor conferință, compania a întâmpinat eșecuri jenante. Codul QR al bannerului scenei a fost generat ca un fișier PNG mic și scalat în software-ul de design - rezultatul părea acceptabil de la distanță, dar nu a reușit să fie scanat în mod fiabil din partea publicului. Codurile QR ale insignelor erau supradimensionate și prea mici, frustrând participanții care încercau să adauge contacte. Setările inconsistente în diferite formate însemnau că "același" cod QR arăta de fapt diferit pe fiecare piesă.', 'Analiza post-eveniment a dezvăluit cauza principală: nicio sursă unică de adevăr. Fiecare designer recrease codul QR cu setări ușor diferite, iar fiecare furnizor de servicii de imprimare procesase fișierele diferit. Calitatea s-a degradat din cauza jocului telefonic al predărilor de fișiere.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografii de prim-plan care prezintă erori de scanare: module de banner pixelate, coduri de insignă subdimensionate, stilizare inconsistentă între formate',
          caption: 'Analiza criminalistică a erorilor evenimentelor anterioare: fiecare format a introdus probleme de calitate diferite',
        },
      ],
    },
    {
      heading: 'Fluxul de lucru SVG-First',
      paragraphs: ['Pentru acest eveniment, compania a stabilit un protocol strict: un cod QR master generat în ANQR cu setări optime (Corecție erori H, zonă liniștită generoasă, stilizare curată), exportat ca SVG și stocat ca sursă unică autorizată. Linkul de configurare ANQR a fost documentat alături de fișierul SVG, astfel încât codul să poată fi regenerat dacă este necesar.', 'Fiecare designer și furnizor a primit același fișier master SVG cu instrucțiuni explicite: plasarea la dimensiunea necesară, nu modificarea, menținerea spațiului liber din zona liniștită. Pentru furnizorii care necesită formate raster, compania a furnizat fișiere PNG pre-randate la dimensiuni specifice, cu convenții de denumire clare care indică utilizarea preconizată.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Un pachet de fișiere care prezintă fișierul master SVG, fișierele PNG specifice dimensiunii, documentul cu specificații și linkul de configurare',
          caption: 'Pachetul de predare: tot ce aveau nevoie furnizorii pentru a produce rezultate consecvente fără a ghici',
        },
      ],
    },
    {
      heading: 'Considerații specifice dimensiunii',
      paragraphs: ['Fiecare format necesita o atenție specifică. Inserțiile de insignă la 3 cm necesitau ca codul QR să ocupe spațiul maxim disponibil - distanța de scanare ar fi la lungimea unui braț. Corturile de masă la 8 cm puteau include înrămare decorativă în afara zonei de liniște. Bannerul de 4 metri necesita un calcul: de la distanța tipică față de public (15-20 de metri), modulele trebuiau să fie clar distincte de camerele telefoanelor, ceea ce însemna că codul QR trebuia să fie la cel puțin 80 cm în interiorul designului bannerului.', 'Compania a creat un ghid de dimensionare care documentează dimensiunile minime ale codului QR pentru fiecare distanță de scanare așteptată. Acesta a devenit un element reutilizabil pentru evenimente viitoare, eliminând presupunerile din procesul de proiectare.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'O diagramă care arată relația dintre distanța de scanare, dimensiunea minimă a codului QR și dimensiunile modulului pentru fiecare format de eveniment',
          caption: 'Matricea de dimensionare: dimensiuni calculate care asigură o scanare fiabilă la distanța de vizualizare așteptată pentru fiecare format',
        },
      ],
    },
    {
      heading: 'Rezultatele producției',
      paragraphs: ['Validarea din ziua conferinței a fost sistematică: personalul a testat fiecare cod QR implementat înainte de deschiderea ușilor. Inserțiile pentru insignă au scanat instantaneu la o distanță de un braț. Corturile de masă au funcționat fiabil în iluminatul variabil al sălilor de conferințe. Bannerul scenei - jena evenimentului anterior - a fost scanat cu succes din mijlocul zonei publicului.', 'Nu au fost înregistrate reclamații privind scanarea pentru peste 2.000 de participanți. Câștigul operațional a fost la fel de semnificativ: când adăugarea unui sponsor în ultimul moment a necesitat o nouă semnalizare, echipa de producție a generat-o din SVG-ul principal în câteva minute, încrezătoare că se va potrivi cu tot restul.', 'Consultați ghidul de învățare despre coduri QR gata de imprimare pentru cadrul decizional SVG vs PNG și cele mai bune practici de predare.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografie de eveniment care arată participanții scanând cu succes coduri QR la diferite dimensiuni și distanțe în întreaga locație',
          caption: 'Succesul din ziua conferinței: scanare fiabilă în fiecare format, de la prim-planuri ale insignelor la fotografii de la distanță ale bannerului scenei',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Răsfoiți articolele Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Studiu de caz: Afișaj digital în salonul aeroportului',
      paragraphs: ['Acest exemplu urmărește un salon al unei companii aeriene care folosea coduri QR statice pe ecranele sale digitale de bun venit. Ecranele afișau conținut promoțional rotativ, dar codul QR pentru check-in în salon stătea într-un colț, static și ușor de trecut cu vederea. Analizele au arătat că doar 15% dintre oaspeții eligibili au folosit check-in-ul cu codul QR, în ciuda faptului că era mai rapid decât coada de la recepție. Majoritatea oaspeților pur și simplu nu l-au observat.', 'Ipoteza era simplă: într-un mediu aglomerat vizual, cu conținut în mișcare, un cod QR static devine invizibil." "Soluția trebuia să facă codul QR vizibil fără a compromite fiabilitatea necesară pentru un flux de check-in unde eșecul ar însemna călători frustrați și cozi mai lungi la ghișeu.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Un afișaj digital într-un salon de aeroport care afișează conținut promoțional cu un cod QR mic, static, în colț',
          caption: 'Configurația inițială: un cod QR static pierdut într-o mare de conținut promoțional dinamic, atingând o rată de adoptare de doar 15%',
        },
      ],
    },
    {
      heading: 'Proiectarea unei animații sigure',
      paragraphs: ['Semnalizarea digitală a salonului folosea panouri LED mari - un mediu provocator în care animația agresivă putea crea probleme de scanare. Echipa de design a început conservator: un efect de impuls ușor care a extins și contractat subtil prezența vizuală a codului QR fără a modifica structura reală a codului. Temporizarea cadrelor a fost setată lent (250 ms) pentru a evita orice probleme de pâlpâire cu rata de reîmprospătare a LED-urilor.', 'Validarea modului de siguranță a confirmat că fiecare cadru a rămas scanabil. Testele suplimentare pe panourile LED reale au arătat că impulsul trebuia să fie și mai subtil decât sugerau previzualizările desktopului - luminozitatea și unghiurile de vizualizare ale LED-urilor au afectat contrastul perceput mai mult decât se aștepta.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Panoul de setări ale animației ANQR afișează configurația pulsului: temporizare lentă, intensitate subtilă, Mod de siguranță activat',
          caption: 'Configurarea animației: parametri reglați pentru afișarea panoului LED, menținând în același timp fiabilitatea scanării în fiecare cadru',
        },
      ],
    },
    {
      heading: 'Integrarea cu conținutul de semnalizare',
      paragraphs: ['Codul QR animat a fost poziționat într-o «zonă stabilă» dedicată a aspectului ecranului - o zonă care a rămas constantă în timp ce conținutul promoțional se rotea în zona principală de afișare. Această separare a fost crucială: codul QR avea nevoie de stabilitate vizuală pentru scanare, chiar și în timp ce atrăgea atenția prin animația sa subtilă.', 'Un îndemn clar la acțiune a fost adăugat lângă codul QR: «Săriți peste coadă - scanați pentru a vă înregistra». Textul a rămas static în timp ce codul QR pulsa, creând o ierarhie vizuală care a atras atenția către oportunitatea de scanare fără a copleși conținutul promoțional.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'O diagramă de aspect al ecranului care prezintă codul QR animat într-o zonă stabilă în timp ce conținutul promoțional se rotește în zona principală',
          caption: 'Alocarea spațiului pe ecran: codul QR animat ocupă o zonă stabilă separată de conținutul promoțional care se rotește',
        },
      ],
    },
    {
      heading: 'Implementare tehnică',
      paragraphs: ['Codul QR animat a fost exportat ca GIF cu setări optimizate pentru CMS-ul de semnalizare. Considerațiile privind dimensiunea fișierului au contat - sistemul de gestionare a conținutului din lounge avea limite de încărcare, iar fișierele prea mari cauzau sacadarea redării. Exportul final a echilibrat calitatea vizuală în raport cu dimensiunea fișierului prin limitarea paletei de culori și optimizarea numărului de cadre.', 'Implementarea a inclus o soluție de rezervă: dacă GIF-ul nu se redau din orice motiv, sistemul de semnalizare afișa o copie de rezervă PNG statică. Această redundanță a asigurat că capacitatea de check-in nu se pierdea niciodată din cauza problemelor tehnice cu animația.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'O interfață CMS care prezintă încărcarea codului QR animat cu o imagine statică de rezervă configurată',
          caption: 'Configurație CMS Signage: cod principal animat cu cod de rezervă static, asigurând că funcția de check-in nu este niciodată întreruptă',
        },
      ],
    },
    {
      heading: 'Impact măsurat',
      paragraphs: ['După o lună de funcționare, adoptarea sistemului de check-in cu cod QR a crescut de la 15% la 24% - o îmbunătățire relativă de 60%. Sondajele de feedback în rândul oaspeților au indicat că codul QR animat era "mai ușor de observat" și "părea mai modern". Timpii de așteptare la recepție au scăzut considerabil în perioadele de vârf, deoarece tot mai mulți oaspeți s-au autoservit prin intermediul codului QR.', 'Important este faptul că nu au fost raportate erori de scanare, în ciuda miilor de scanări zilnice. Abordarea conservatoare a animației a atins obiectivul de atenție fără a sacrifica fiabilitatea necesară unui flux de check-in. Ulterior, lounge-ul a implementat coduri QR animate similare în celelalte locații ale sale.', 'Consultați ghidul de învățare despre codurile QR animate pentru semnalizare digitală pentru principiile tehnice din spatele designului de animație sigur.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Un tablou de bord care arată creșterea ratei de adopție, reducerea timpului de așteptare și fiabilitatea scanării fără erori pe parcursul perioadei de implementare',
          caption: 'Date pe o lună: creștere cu 60% a adopției, timpi de așteptare reduși și menținerea unei fiabilități perfecte a scanării',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Răsfoiți articolele Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Studiu de caz: Campanie globală de lansare a unui produs QR',
      paragraphs: ['Acest exemplu urmărește o companie de electronice de larg consum care lansează simultan un produs nou pe 12 piețe în 8 limbi. Fiecare echipă regională de marketing a trebuit să producă ambalaje, afișaje pentru retail și materiale promoționale care conțineau coduri QR care trimiteau la pagini de produse localizate. Lansările anterioare au dus la un stil QR inconsistent, erori ocazionale de scanare și un "joc telefonic" de deviere a configurației, deoarece fiecare echipă recrea codurile din capturi de ecran.', 'Soluția a valorificat linkurile de configurare partajabile ale ANQR pentru a stabili o sursă unică de adevăr la care fiecare echipă regională putea avea acces, indiferent de limba interfeței lor. Sarcina utilă QR a folosit o redirecționare inteligentă care detecta limba utilizatorului, astfel încât un cod a funcționat global, oferind în același timp experiențe localizate.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'O hartă a lumii care arată 12 locații de piață cu coduri QR, unele inconsistente vizual între ele',
          caption: 'Provocarea: 12 piețe, 8 limbi și un istoric al implementărilor QR inconsistente în diferite regiuni',
        },
      ],
    },
    {
      heading: 'Stabilirea configurației principale',
      paragraphs: ['Echipa globală a mărcii a creat configurația QR autorizată în ANQR: culorile mărcii se potrivesc cu identitatea vizuală a liniei de produse, corectarea erorilor H pentru fiabilitate în toate aplicațiile tipărite și digitale și un stil care s-ar reproduce în mod constant, indiferent de metodele de producție locale. Configurația a fost blocată, iar linkul de partajare a fost documentat în brief-ul campaniei globale.', 'În mod critic, adresa URL codificată a folosit un serviciu de redirecționare pentru detectarea limbii. La scanare, utilizatorii au fost direcționați automat către pagina produsului în limba lor locală." "Aceasta însemna că toate cele 12 piețe puteau utiliza coduri QR identice - fără variații ale sarcinii utile per piață care ar putea introduce erori.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Interfața ANQR care afișează configurația principală cu culorile mărcii, ECC H și URL-ul de redirecționare inteligent',
          caption: 'Configurația principală: standarde globale ale mărcii codificate într-o singură sursă de adevăr, partajabilă',
        },
      ],
    },
    {
      heading: 'Fluxul de lucru al echipei regionale',
      paragraphs: ['Fiecare echipă regională de marketing a primit linkul de configurare cu instrucțiuni simple: deschideți linkul, verificați dacă previzualizarea corespunde cu ghidurile mărcii, exportați în formatul necesar pentru aplicația dvs. Interfața ANQR s-a afișat în limba preferată a fiecărei echipe, dar setările QR subiacente au rămas identice, indiferent de limba interfeței.', 'Când echipa japoneză a avut nevoie de SVG pentru afișaje de retail de înaltă calitate, iar echipa braziliană a avut nevoie de PNG pentru rețelele sociale, ambele au fost exportate din aceeași configurație. Când furnizorul de imprimare al echipei germane a solicitat valori specifice de culoare, aceștia au putut face referire directă la configurație, în loc să ghicească dintr-o captură de ecran.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Capturi de ecran care arată același link de configurare deschise în interfețele japoneză, portugheză și germană',
          caption: 'Aceeași configurație, interfețe diferite: echipele regionale lucrează în limba lor preferată, menținând în același timp consecvența globală',
        },
      ],
    },
    {
      heading: 'Gestionarea variațiilor regionale',
      paragraphs: ['Unele piețe au necesitat adaptări minore. Echipa chineză avea nevoie de o versiune cu un cadru optimizat pentru WeChat pentru partajarea socială. În loc să modifice versiunea master, au creat o variantă documentată cu propriul link de configurare, etichetat clar ca "Varianta CN-WeChat" în biblioteca de resurse a campaniei. Acest lucru a menținut trasabilitatea, permițând în același timp localizarea necesară.', 'Echipa de brand a stabilit o regulă simplă: orice variație față de versiunea master necesita un link de configurare nou, documentat. Fără modificări la fișierele exportate, fără «remedieri rapide» în software-ul de design. Acest lucru a prevenit deviația configurației care afectase lansările anterioare.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'O interfață pentru biblioteca de active care prezintă configurația principală și variantele regionale aprobate, fiecare cu propriul link',
          caption: 'Guvernanța activelor campaniei: configurația principală plus variantele documentate, toate trasabile prin linkuri de configurare',
        },
      ],
    },
    {
      heading: 'Rezultatele lansării',
      paragraphs: ['În ziua lansării produsului, coduri QR au fost implementate simultan pe ambalaje, afișaje de retail, materiale de evenimente și campanii digitale pe toate cele 12 piețe. Auditurile de calitate au confirmat consecvența vizuală în toate regiunile - codul QR de pe afișajele de retail din Tokyo se potrivea cu codul QR de pe ambalajele din São Paulo se potrivea cu codul QR de pe bannerele evenimentelor din Berlin.', 'Nu au fost raportate erori de scanare pe toate piețele. Când a fost necesară o modificare a adresei URL a paginii produsului după lansare, serviciul de redirecționare a gestionat-o invizibil - nu a fost necesară retipărirea. Echipa globală a estimat că abordarea linkului de configurare a economisit peste 40 de ore de timp de coordonare în comparație cu metodologia lor anterioară de lansare.', 'Consultați ghidul Learn despre colaborarea QR interlingvistică pentru principiile fluxului de lucru din spatele consecvenței campaniilor globale.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'O grilă de fotografii care arată implementarea consistentă a codurilor QR pe diferite piețe: comerțul cu amănuntul la Tokyo, ambalaje la São Paulo, evenimente la Berlin',
          caption: 'Consecvență globală atinsă: prezentare QR identică pe 12 piețe, în ciuda diferitelor limbi, furnizori și formate',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Răsfoiți articolele Learn',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Răsfoiți articolele Learn', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Deschideți Ghidul utilizatorului complet', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Deschideți galeria', type: 'gallery' },
  ],
};
