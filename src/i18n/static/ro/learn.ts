import type { PageDefinition } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Învățați cu ANQR',
  description:
    'Ghiduri practice, dedicate afacerilor, pentru transformarea codurilor QR în active de marketing reale - nu doar pătrate funcționale." "Aflați cum să actualizați codurile POS vechi, să creați semnalizare QR conformă pentru plăți, să pregătiți exporturi gata de imprimare, să utilizați animația în siguranță pe afișaje digitale și să partajați configurații blocate între echipe multilingve folosind linkuri ANQR ("ancoră").',
  lastUpdated: '1 februarie 2026',

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Deschideți generatorul', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'example' },
    {
      href: '/guide?lang=${lang}',
      label: 'Deschideți Ghidul utilizatorului complet',
      type: 'guide',
    },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Îmbunătățirea campaniilor QR existente',
      paragraphs: [
        'Majoritatea companiilor au coduri QR împrăștiate în operațiunile lor - pe meniuri, standuri de tejghea, ambalaje și materiale promoționale. Multe dintre aceste coduri au fost create cu ani în urmă cu generatoare de bază, rezultând în pătrate generice alb-negru care nu reușesc să inspire încredere sau să se potrivească cu identitatea mărcii dvs. Acest ghid cuprinzător vă prezintă o abordare sistematică a auditării, modernizării și optimizării infrastructurii QR existente, fără a perturba călătoriile clienților pe care le-ați stabilit deja.',
        'Avantajul strategic al modernizării, mai degrabă decât al înlocuirii codurilor QR, constă în păstrarea continuității. Clienții dvs. au învățat deja să se aștepte la anumite destinații atunci când scanează codurile dvs. Prin păstrarea adreselor URL codificate identice, îmbunătățind în același timp dramatic prezentarea vizuală, fiabilitatea scanării și alinierea la mărci, creați o tranziție fără probleme care sporește încrederea, fără a fi necesare modificări ale infrastructurii dvs. digitale sau ale urmăririi analizelor.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'O comparație alăturată care prezintă un cod QR generic, estompat, lângă o versiune modernă de marcă care codifică aceeași adresă URL',
          caption:
            'Înainte și după: Aceeași adresă URL de destinație transformată dintr-un cod generic învechit într-un element de marcă profesional',
        },
      ],
    },
    {
      heading: 'De ce codurile QR vechi au performanțe slabe',
      paragraphs: [
        'Codurile QR create în faza de adoptare timpurie - în special în perioada 2020-2021, când companiile s-au grăbit să implementeze soluții contactless - suferă adesea de mai multe probleme critice. Setările scăzute de corecție a erorilor le fac fragile atunci când sunt imprimate pe suprafețe texturate sau vizualizate în condiții de iluminare dificilă. Zonele silențioase insuficiente cauzează erori de scanare atunci când codurile sunt plasate lângă alte elemente vizuale. Stilul generic nu reușește să comunice legitimitatea mărcii, ceea ce duce la ezitare și la rate de scanare reduse.',
        'Dincolo de limitările tehnice, codurile vechi reprezintă adesea oportunități de branding ratate. Fiecare cod QR este un punct de contact cu clientul dvs. - un moment în care acesta este implicat activ și dispus să acționeze. Un cod cu stil profesional care se potrivește cu culorile mărcii dvs., include marje de siguranță adecvate și prezintă elemente de marcă opționale transformă această utilitate într-un element de marketing care vă consolidează identitatea la fiecare interacțiune.',
      ],
    },
    {
      heading: 'Efectuarea unui audit al codurilor QR',
      paragraphs: [
        'Începeți proiectul de actualizare prin crearea unui inventar cuprinzător al fiecărui cod QR implementat în prezent în cadrul companiei dvs. Documentați locația fizică, destinația codificată, starea actuală a materialului tipărit și mediul tipic de scanare, inclusiv condițiile de iluminare și unghiurile de vizualizare. Testați fiecare cod cu mai multe dispozitive - smartphone-urile mai vechi și dispozitivele economice dezvăluie adesea probleme de fiabilitate pe care telefoanele premium le maschează.',
        'Acordați o atenție deosebită codurilor din locațiile cu miză mare: punctele de plată, zonele de check-in și afișajele promoționale în care eșecul scanării afectează direct veniturile sau experiența clienților. Acestea ar trebui să aibă prioritate pentru actualizarea imediată. Rețineți, de asemenea, codurile care apar în conținutul foto sau video, deoarece acestea vor necesita coordonarea cu echipa dvs. de marketing pentru a actualiza elementele vizuale.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'O interfață de listă de verificare care prezintă categoriile de audit QR: locație, stare, fiabilitate scanare și rating de prioritate',
          caption:
            'Șablon sistematic de audit QR pentru documentarea și prioritizarea candidaților dvs. la actualizare',
        },
      ],
    },
    {
      heading: 'Strategia de actualizare în siguranță',
      paragraphs: [
        'Regula cardinală a actualizărilor QR este păstrarea destinației." Extrageți adresa URL exactă din fiecare cod existent și codificați-o identic în noua versiune. Acest lucru asigură că toate analizele existente, logica de redirecționare și așteptările clienților rămân intacte. Dacă aveți nevoie de flexibilitate a destinației pentru actualizări viitoare, acesta este momentul ideal pentru a introduce o adresă URL scurtă de marcă sau un serviciu de redirecționare - dar implementați acest lucru ca un proiect separat pentru a evita modificările compuse.',
        'Pentru actualizarea vizuală, aplicați îmbunătățiri în straturi: asigurați mai întâi fiabilitatea tehnică (corecție adecvată a erorilor și zonă silențioasă), apoi adăugați stilul mărcii (culori, forme ale modulelor) și, în final, luați în considerare îmbunătățirile opționale (suprapuneri centrale, cadre). Fiecare strat trebuie validat prin testare înainte de a continua. Modul de siguranță al ANQR ajută la aplicarea acestor priorități, avertizând atunci când alegerile de stil ar putea compromite scanabilitatea.',
      ],
    },
    {
      heading: 'Adăugarea identității mărcii fără a compromite fiabilitatea',
      paragraphs: [
        'Brandingul QR eficient echilibrează impactul vizual cu fiabilitatea scanării. Începeți cu culoarea: înlocuiți prim-planul negru implicit cu culoarea principală a mărcii dvs., asigurând un contrast suficient față de fundal. Pentru majoritatea mărcilor, culorile închise pe fundaluri deschise funcționează cel mai bine." "Evitați combinațiile cu contrast scăzut, gradienții care reduc claritatea marginilor sau culorile care par similare în condiții de iluminare obișnuite.',
        'Personalizarea formei modulelor oferă o altă oportunitate de branding cu un impact minim asupra fiabilității. Modulele rotunjite creează un aspect mai blând și mai accesibil, menținând în același timp o scanabilitate excelentă. Modulele în stil punct funcționează bine pentru brandurile moderne, avansate tehnologic. Modulele conectate se potrivesc identităților industriale sau corporative. Indiferent de stilul pe care îl alegeți, mențineți consecvența în toate implementările QR pentru o recunoaștere instantanee a mărcii.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'O diagramă a roții de culori care arată combinațiile optime de culori QR cu indicatori ai raportului de contrast',
          caption:
            'Ghid de selecție a culorilor mărcii care arată combinații cu contrast ridicat care mențin fiabilitatea scanării',
        },
      ],
    },
    {
      heading: 'Protocol de testare și validare',
      paragraphs: [
        'Nu implementați niciodată coduri QR actualizate fără teste riguroase. Imprimați o dovadă fizică la dimensiunea exactă și pe același material ca implementarea finală. Testați în locația reală în care va exista codul, la diferite ore ale zilei, pentru a ține cont de variațiile de iluminare. Utilizați cel puțin trei dispozitive diferite: un telefon emblematic actual, un dispozitiv mid-range și un smartphone mai vechi sau cu buget redus.',
        'Înregistrați timpii de scanare și ratele de succes pentru fiecare test. Un cod bine optimizat ar trebui scanat în 1-2 secunde pe orice dispozitiv destul de modern. Dacă observați întârzieri sau eșecuri consecvente, reduceți intensitatea stilului - eliminați sau micșorați suprapunerile, măriți dimensiunea zonei de liniște sau comutați la un nivel mai ridicat de corecție a erorilor. Fiabilitatea are întotdeauna prioritate față de sofisticarea vizuală.',
      ],
    },
    {
      heading: 'Blocarea configurației pentru consecvență',
      paragraphs: [
        'După ce ați validat o configurație optimă, păstrați-o folosind linkurile partajabile ale ANQR. Aceasta creează o înregistrare permanentă a fiecărei setări utilizate pentru a genera codul aprobat - culori, stilul modulului, corecția erorilor, dimensionarea și orice suprapuneri. Partajați acest link cu echipa de design, furnizorii de print și cu oricine ar putea avea nevoie să reproducă codul în viitor.',
        'Această blocare a configurației previne degradarea treptată care afectează multe implementări QR. Fără ea, membrii personalului recreează coduri din capturi de ecran, designerii reconstruiesc setările din memorie, iar furnizorii de print fac ajustări "utile". Fiecare variație introduce probleme potențiale. Cu un link de configurare blocat, fiecare reproducere este identică cu originalul testat și aprobat.',
      ],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'O diagramă care arată deviația configurației: capturi de ecran care duc la recreări care duc la variante, versus o singură legătură cu o sursă reală',
          caption:
            'Preveniți deviația configurației prin stabilirea unei singure surse autorizate pentru toate reproducerile codurilor QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Vizualizați exemple de coduri QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Coduri QR pentru plățile cu amănuntul',
      paragraphs: [
        'Codurile QR pentru plăți funcționează în cel mai solicitant mediu din comerțul cu amănuntul: momentul tranzacției. Clienții sunt gata să plătească, adesea cu o coadă care se formează în spatele lor, iar fiecare secundă de întârziere creează fricțiuni. Totuși, acest moment de mare presiune este, de asemenea, un spațiu imobiliar primordial pentru consolidarea mărcii. Acest ghid explică cum să creați coduri QR pentru plăți care se scanează instantaneu în aplicațiile bancare, prezentând în același timp un aspect profesional, de marcă, care construiește încrederea clienților.',
        'Principiul fundamental pentru codurile QR pentru plăți este fiabilitatea mai presus de estetică. Un cod frumos conceput care nu reușește să fie scanat în aplicația bancară a unui client vă va costa mult mai mult în tranzacții abandonate și clienți frustrați decât ar putea vreodată un design conservator." "Începeți cu conformitatea, adăugați fiabilitate, apoi stratificați cu atenție brandingul doar acolo unde nu compromite funcția principală.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Un afișaj la tejgheaua de vânzare cu amănuntul care arată un cod QR de plată scanat de un smartphone cu o aplicație bancară',
          caption:
            'Codurile QR de plată trebuie să funcționeze instantaneu cu aplicațiile bancare și portofelul în condiții reale de ghișeu',
        },
      ],
    },
    {
      heading: 'Înțelegerea standardelor QR de plată',
      paragraphs: [
        'Codurile QR de plată respectă de obicei standardele regionale care dictează formatul sarcinii utile. În Singapore, PayNow QR utilizează un formatare specifică. În India, codurile UPI respectă standardele BharatQR sau UPI pentru linkuri profunde. Plățile europene SEPA utilizează coduri QR EPC. Fiecare standard există pentru a se asigura că aplicațiile bancare pot recunoaște și procesa instantaneu informațiile de plată. Abaterea de la aceste standarde - chiar și ușoară - poate determina aplicațiile de plată să respingă codurile pe care scanerele generice cu cameră le citesc fără probleme.',
        'ANQR include șabloane pentru principalele standarde de plată care formatează automat detaliile comerciantului dvs. în sarcini utile conforme. Utilizați întotdeauna aceste șabloane în loc să construiți manual șiruri de plată, deoarece chiar și erori minore de formatare pot cauza eșecuri ale tranzacțiilor." "Dacă standardul de plată din regiunea dvs. nu este disponibil ca șablon, consultați documentația tehnică a furnizorului dvs. de plăți pentru cerințele exacte de formatare.',
      ],
    },
    {
      heading: 'Dimensionarea și amplasarea afișajelor de la tejghea',
      paragraphs: [
        'Codurile QR de pe tejghea se confruntă cu provocări fizice unice. Clienții scanează la distanță de braț, adesea în unghi, uneori prin apărători anti-strănut sau vitrine. Iluminatul de deasupra capului creează zone de strălucire. Codul concurează cu alte aglomerații de la tejghea pentru atenție și vizibilitate clară. Dimensionați codul QR de plată cu generozitate - se recomandă un minim de 4-5 cm pentru majoritatea aplicațiilor de la tejghea, mărind dimensiunea dacă codul se află în spatele unui geam sau într-o zonă slab iluminată.',
        'Poziția contează la fel de mult ca dimensiunea. Plasați codul unde clienții își pot ține confortabil telefonul, fără a bloca coada sau a întinde mâna stângaci. Înclinați afișajul spre client, mai degrabă decât să îl așezați plat. Dacă este posibil, utilizați laminare mată sau materiale de afișare nereflectorizante pentru a minimiza strălucirea cauzată de iluminatul de deasupra capului. Testați amplasarea finală la diferite ore ale zilei pentru a identifica problemele de iluminare.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'O diagramă care prezintă înălțimile și unghiurile optime de plasare a codurilor QR pentru diferite configurații ale ghișeelor',
          caption:
            'Ghid de plasare a ghișeelor: înălțimi, unghiuri și distanțe optime pentru scanarea fiabilă a plăților',
        },
      ],
    },
    {
      heading: 'Branding conservator pentru codurile de plată',
      paragraphs: [
        'Aplicațiile de plată sunt mai puțin iertătoare decât scanerele generice cu cameră. Multe aplicații bancare utilizează algoritmi de citire QR mai vechi și mai simpli, optimizați pentru viteză, mai degrabă decât pentru flexibilitate. Aceasta înseamnă că un stil care funcționează perfect cu camera unui telefon poate eșua cu anumite aplicații de plată. Păstrați brandingul conservator: utilizați culoarea mărcii dvs. pentru prim-plan dacă aceasta menține un contrast puternic, dar evitați gradienții, suprapunerile grele sau elementele decorative care ar putea interfera cu recunoașterea.',
        'Dacă doriți un logo sau o suprapunere centrală, păstrați-o extrem de mică - nu mai mult de 10-15% din suprafața QR - și testați extensiv cu fiecare aplicație de plată pe care clienții dvs. ar putea-o utiliza. Multe companii optează pentru nicio suprapunere pe codurile de plată în mod specific, rezervând acest stil pentru marketingul codurilor QR unde cerințele de fiabilitate sunt mai puțin stricte." "Sarcina codului de plată este de a procesa tranzacțiile, nu de a impresiona vizual.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'O comparație care arată nivelurile de branding acceptabile față de cele riscante pentru codurile QR de plată',
          caption:
            'Spectrul de branding QR pentru plăți: de la un stil conservator sigur la abordări decorative riscante',
        },
      ],
    },
    {
      heading: 'Considerații privind materialele și imprimarea',
      paragraphs: [
        'Materialul de afișare fizică are un impact semnificativ asupra fiabilității scanării. Laminarea lucioasă reflectă luminile de deasupra capului direct în camera clientului. Materialele texturate pot distorsiona marginile modulului. Imprimarea ieftină poate estompa detaliile fine. Pentru codurile QR de plată, investiți în calitate: utilizați laminare mată sau satinată, asigurați imprimare de înaltă rezoluție și înlocuiți afișajele înainte ca acestea să se arate uzate. Un cod de plată zgâriat sau decolorat vă costă tranzacții.',
        'Luați în considerare durabilitatea și înlocuibilitatea afișajului. Afișajele de tejghea sunt atinse, mutate, stropite și ocazional răsturnate. Proiectați-vă sistemul de afișare astfel încât inserția QR să poată fi înlocuită cu ușurință fără a înlocui întregul suport. Păstrați la îndemână imprimeuri de rezervă, generate de linkul de configurare blocat, astfel încât codurile uzate să poată fi schimbate imediat.',
      ],
    },
    {
      heading: 'Testarea cu aplicații de plată reale',
      paragraphs: [
        'Scanerele generice cu cameră vor decoda aproape orice cod QR formatat în mod rezonabil. Aplicațiile de plată sunt mai selective. Înainte de a implementa orice cod QR pentru plăți, testați-l cu fiecare aplicație de plată pe care clienții dvs. ar putea-o utiliza. În mediile cu plăți multiple, acest lucru ar putea însemna testarea cu mai multe aplicații bancare, portofele digitale și platforme de plată. Documentați aplicațiile pe care le-ați testat și versiunile acestora - aplicațiile de plată se actualizează frecvent, iar o actualizare ar putea schimba comportamentul de scanare.',
        'Testați în condiții realiste: afișajul real, iluminarea reală, distanța reală de scanare. Un cod care se scanează instantaneu pe biroul dvs. s-ar putea să aibă dificultăți pe tejghea la ora 17:00, când soarele de după-amiază creează strălucire. Testați cu cel mai vechi și mai ieftin smartphone pe care îl puteți găsi - dacă funcționează fiabil pe un dispozitiv bugetar, va funcționa pe orice. Marcați orice timp de scanare peste 2 secunde pentru investigare și o posibilă reproiectare.',
      ],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'O listă de verificare a testării care prezintă diverse aplicații de plată, tipuri de dispozitive și condiții de mediu de verificat',
          caption:
            'Matrice cuprinzătoare de testare a codurilor QR pentru plăți care acoperă aplicații, dispozitive și factori de mediu',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Vizualizați exemple de coduri QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Coduri QR gata de imprimare: SVG vs PNG',
      paragraphs: [
        'Diferența dintre un cod QR care se scanează perfect și unul care eșuează se reduce adesea la modul în care a fost exportat și gestionat în fluxul de lucru de imprimare. Acest ghid explică distincțiile critice dintre formatele vectoriale (SVG) și raster (PNG), când se utilizează fiecare și cum se predau grafica QR designerilor și furnizorilor de materiale de imprimare în moduri care păstrează fiabilitatea scanării, de la cărți de vizită la semnalizare de dimensiunea unui panou publicitar.',
        'Producția de materiale de imprimare introduce variabile care nu există pe ecran: răspândirea cernelii, textura substratului, procesele de finisare și efectul cumulativ al conversiilor multiple de fișiere. Un cod QR care arată perfect în software-ul dvs. de design poate ieși din imprimantă cu margini atenuate, contrast redus sau module subtil distorsionate. Înțelegerea selecției formatului și a celor mai bune practici de flux de lucru previne aceste eșecuri silențioase.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'O vizualizare mărită care compară modulele QR vectoriale cu margini clare versus modulele raster care prezintă artefacte ale pixelilor',
          caption:
            'Vector vs. raster la scara de imprimare: diferența de precizie care determină fiabilitatea scanării',
        },
      ],
    },
    {
      heading: 'De ce este preferat codul vectorial (SVG) pentru imprimare',
      paragraphs: [
        'Fișierele SVG descriu codurile QR ca forme matematice, mai degrabă decât grile de pixeli. Aceasta înseamnă că codul poate fi scalat la orice dimensiune - de la o etichetă de 1 cm la un banner de 10 metri - fără nicio pierdere a clarității marginilor. RIP (Raster Image Processor) al imprimantei randează vectorii la rezoluția nativă a dispozitivului de ieșire, asigurându-se că fiecare margine a modulului este la fel de clară pe cât permite hardware-ul. Nu există interpolare, artefacte anti-aliasing, fără estompare acumulată din cauza mai multor operațiuni de redimensionare.',
        'Dincolo de scalabilitate, fișierele SVG sunt mai robuste în fluxurile de lucru profesionale. Acestea supraviețuiesc trecerilor dus-întors prin software-ul de design fără degradare. Pot fi corectate culorile fără reeșantionare. Se încorporează curat în fișierele PDF pentru o ieșire gata de imprimare." "Pentru orice aplicație de imprimare în care calitatea contează, SVG ar trebui să fie formatul de export implicit.',
      ],
    },
    {
      heading: 'Când PNG este acceptabil',
      paragraphs: [
        'PNG devine necesar atunci când fluxul de lucru sau platforma de destinație nu acceptă formate vectoriale. Unele platforme web, sisteme CMS de semnalizare și fluxuri de lucru de imprimare vechi necesită imagini raster. În aceste cazuri, PNG poate funcționa bine - dar numai dacă respectați reguli stricte: exportați la dimensiunea fizică și rezoluția finală, nu măriți niciodată scalarea după export și evitați orice compresie cu pierderi sau conversie de format.',
        'Regula critică pentru PNG este să calculați dimensiunile necesare în pixeli înainte de exportare. Dacă fișierul QR se va imprima la 5 cm și imprimanta funcționează la 300 DPI, aveți nevoie de aproximativ 590 de pixeli. Exportați la această dimensiune sau mai mare, apoi reduceți scalarea dacă este necesar - niciodată la dimensiunea superioară. Includeți aceste informații în numele fișierului sau în metadate, astfel încât viitorii utilizatori să nu utilizeze greșit accidental un export specific dimensiunii.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'O interfață de calculator care arată relația dintre dimensiunea fizică, DPI și dimensiunile pixelilor necesare',
          caption:
            'Calculator rezoluție de imprimare: determinarea dimensiunilor minime ale pixelilor pentru dimensiunea țintă de ieșire',
        },
      ],
    },
    {
      heading: 'Opțiuni de export ANQR explicate',
      paragraphs: [
        'ANQR oferă mai multe moduri de export SVG pentru a se potrivi diferitelor fluxuri de lucru. Modul True Vector produce o ieșire bazată pur pe traseu, ideală pentru instrumente de imprimare și design profesional. Când ați adăugat suprapuneri raster sau anumite efecte, ANQR le poate încorpora, menținând în același timp modulele vectoriale sau puteți exporta o versiune complet rasterizată la rezoluția specificată. Înțelegerea acestor opțiuni vă ajută să alegeți exportul potrivit pentru fiecare caz de utilizare.',
        'Pentru exporturile PNG, ANQR vă permite să specificați dimensiuni exacte și include opțiuni pentru fundaluri transparente. Setarea DPI vă ajută să calculați dimensiunile adecvate pentru imprimare, deși rețineți că DPI este metadata - ceea ce contează pentru imprimare este să aveți suficienți pixeli pentru dimensiunea fizică. Dacă aveți dubii, exportați mai mare decât credeți că aveți nevoie; reducerea păstrează calitatea, în timp ce creșterea o distruge.',
      ],
    },
    {
      heading: 'Pregătirea fișierelor pentru predare',
      paragraphs: [
        'Atunci când transmiteți grafica codului QR designerilor sau furnizorilor de servicii de tipărire, includeți specificații clare: dimensiunea fizică dorită, cerințele minime ale zonei liniștite și orice considerații privind spațiul de culoare. Pentru aplicațiile critice, furnizați atât un fișier master SVG, cât și o copie de rezervă PNG de înaltă rezoluție, etichetate clar cu utilizările preconizate. Includeți linkul de configurare ANQR, astfel încât codul să poată fi regenerat dacă este necesar.',
        'Anticipați greșelile comune în procesul de predare. Menționați în mod explicit că codul QR nu trebuie scalat, rotit, înclinat sau să nu i se aplice efecte. Specificați că zona liniștită trebuie să rămână clară - fără marcaje de decupare, marcaje de înregistrare sau elemente de design care să se intrudeze. Dacă codul QR va fi plasat pe un fundal colorat sau fotografic, furnizați o versiune cu o formă de suport opacă pentru a asigura un contrast adecvat.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'O diagramă a pachetului de fișiere care prezintă fișierul master SVG, copia de rezervă PNG, documentul cu specificații și linkul de configurare',
          caption:
            'Pachet de transfer QR profesional: tot ce are nevoie un designer sau un furnizor de tipărire pentru o reproducere exactă',
        },
      ],
    },
    {
      heading: 'Verificarea probelor de imprimare',
      paragraphs: [
        'Nu aprobați niciodată un tiraj de imprimare fără a scana o probă fizică. Solicitați o probă imprimată pe substratul real cu finisajul real care va fi utilizat în producție. Scanați proba în condiții de iluminare similare cu cele în care va fi afișată piesa finală. Testați cu mai multe dispozitive, inclusiv cu smartphone-uri mai vechi care ar putea avea probleme cu calitatea marginală.',
        'Dacă proba se scanează lent sau inconsistent, investigați înainte de aprobare. Problemele frecvente includ contrast insuficient pe substraturile colorate, încălcări ale zonei de liniște cauzate de tăiere, înmuierea marginilor modulului de răspândire a cernelii sau laminarea care creează strălucire. Oricare dintre acestea poate fi abordată înainte de a se angaja la un tiraj complet de imprimare - dar numai dacă le observați în etapa de probă.',
      ],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'O listă de verificare pentru verificarea dovezilor cu rezultatele testelor de scanare, măsurători de contrast și semnături de aprobare',
          caption:
            'Flux de lucru pentru verificarea dovezilor de imprimare: testare sistematică înainte de a se angaja în cantități de producție',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Vizualizați exemple de coduri QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Crearea de coduri QR animate',
      paragraphs: [
        'Codurile QR animate combină funcționalitatea codurilor QR standard cu mișcarea atrăgătoare, care crește dramatic ratele de implicare. În semnalizarea digitală, rețelele sociale și afișajele interactive, animația transformă o utilitate statică într-un element vizual convingător care atrage atenția și invită la interacțiune. Acest ghid acoperă principiile, tehnicile și constrângerile practice ale creării de coduri QR animate care scanează în mod fiabil, oferind în același timp un impact vizual.',
        'Provocarea fundamentală a codurilor QR animate este echilibrarea interesului vizual cu fiabilitatea scanării. Fiecare cadru trebuie să fie scanabil individual - un scaner poate captura codul în orice moment al ciclului de animație. Această constrângere modelează fiecare decizie de proiectare: ce elemente se pot mișca, cât de mult se pot schimba și ce trebuie să rămână stabil pe tot parcursul animației.',
      ],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Un afișaj de semnalizare digitală care prezintă un cod QR animat care captează atenția privitorului într-un spațiu public',
          caption:
            'Coduri QR animate în semnalizarea digitală: mișcare care atrage atenția și încurajează scanarea',
        },
      ],
    },
    {
      heading: 'Cum afectează animația scanabilitatea',
      paragraphs: [
        'Scanerele QR funcționează prin capturarea unui singur cadru și analizarea modelului modulelor luminoase și întunecate. Pentru ca un cod animat să funcționeze, fiecare cadru trebuie să conțină modelul QR complet și valid. Acest lucru exclude animațiile care transformă structura codului, dizolvă module sau modifică semnificativ modelul de contrast. Modulele care transportă date - modelul aparent aleatoriu din centru - trebuie să rămână stabile vizual pe tot parcursul.',
        'Abordările de animație sigură modifică elementele care nu transportă date: fundaluri, culori, rame decorative și elemente suprapuse. Componentele structurale - modelele de căutare (pătratele mari de colț), modelele de sincronizare (liniile alternante) și modelele de aliniere (pătratele mai mici în codurile mai mari) - trebuie să își mențină pozițiile și proporțiile. Lucrul în cadrul acestor constrângeri permite în continuare animații surprinzător de dinamice și captivante.',
      ],
    },
    {
      heading: 'Tehnici de animație care funcționează',
      paragraphs: [
        'Ciclul culorilor animă culorile prim-planului și fundalului printr-o paletă, menținând în același timp un contrast suficient la fiecare pas. Aceasta creează un efect vibrant, care atrage atenția, cu un risc minim de scanare - atâta timp cât contrastul nu scade niciodată sub niveluri lizibile. Presetările ciclului de culori ANQR sunt concepute pentru a menține scanabilitatea pe tot parcursul ciclului.',
        'Suprapunerile animate plasează imagini în mișcare în spatele unui model QR semitransparent. Codul rămâne stabil în timp ce fundalul se animă - poate un videoclip în buclă, elemente animate de brand sau grafică abstractă în mișcare. Această tehnică necesită o gestionare atentă a intensității pentru a preveni ca fundalul să copleșească modelul QR, dar creează cele mai izbitoare rezultate vizuale.',
      ],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'O diagramă care arată structura stratificată a unui QR animat: strat de cod stabil peste stratul de fundal animat',
          caption:
            'Principiul de stratificare a animației: modelul QR rămâne constant în timp ce elementele de fundal se animă dedesubt',
        },
      ],
    },
    {
      heading: 'Configurarea parametrilor de animație',
      paragraphs: [
        'Rată de cadre afectează atât netezimea vizuală, cât și dimensiunea fișierului." Pentru majoritatea aplicațiilor, 10-15 cadre pe secundă oferă o mișcare fluidă, fără dimensiuni excesive ale fișierelor. Ratele de cadre mai mari oferă randamente vizuale diminuate, crescând în același timp semnificativ dimensiunile fișierelor. Luați în considerare contextul de livrare - un panou digital mare poate gestiona fișiere mai mari decât o plasare publicitară mobilă.',
        'Comportamentul în buclă determină modul în care animația se repetă. Buclele fără întreruperi creează o mișcare continuă, ideală pentru semnalizare și afișaje ambientale. Buclele ping-pong (înainte-apoi-înapoi) funcționează bine pentru animații simple. Pentru impulsuri care atrag atenția, luați în considerare animații cu mențineri - perioade de nemișcare punctate de mișcare care atrage atenția fără oboseala constantă a mișcării.',
      ],
    },
    {
      heading: 'Crearea de suprapuneri animate',
      paragraphs: [
        'Atunci când utilizați imagini animate (GIF-uri, fișiere WebP animate sau videoclipuri) ca suprapuneri, ANQR extrage cadre și le combină cu codul QR. Setarea intensității suprapunerii controlează cât de mult din animație este vizibilă - valorile mai mici prioritizează scanabilitatea, în timp ce valorile mai mari favorizează impactul vizual. Testați intensitatea aleasă pe mai multe cadre pentru a asigura o scanabilitate consistentă.',
        'Calitatea materialului sursă are un impact semnificativ asupra rezultatelor. Utilizați suprapuneri cu subiecte clare și contrast bun. Evitați animațiile sursă cu clipire rapidă sau modificări extreme de luminozitate care ar putea crea ocazional cadre cu contrast redus. Previzualizează întregul ciclu de animație înainte de a exporta pentru a prinde orice cadre problematice care ar putea eșua scanarea.',
      ],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'O vizualizare cadru cu cadru a unei suprapuneri animate care arată nivelurile de contrast menținute pe parcursul secvenței',
          caption:
            'Analiza cadrelor: verificarea scanabilității consecvente pe întregul ciclu de animație',
        },
      ],
    },
    {
      heading: 'Considerații privind exportul și livrarea',
      paragraphs: [
        'GIF rămâne formatul animat cel mai larg acceptat, redându-se automat în majoritatea contextelor, fără a necesita suport pentru player video. Cu toate acestea, paleta de 256 de culori a GIF limitează fidelitatea culorilor. Pentru animațiile critice pentru culoare, luați în considerare WebP animat acolo unde este acceptat sau reveniți la formate video pentru cea mai înaltă calitate. Exportul GIF al ANQR include opțiuni de dithering pentru a maximiza calitatea în limitele paletei.',
        'Dimensiunea fișierului contează pentru livrare. Sistemele de semnalizare digitală, clienții de e-mail și platformele sociale impun adesea limite de dimensiune." Dacă animația depășește aceste limite, reduceți numărul de cadre, dimensiunile sau adâncimea culorii. Uneori, împărțirea unei animații complexe într-o buclă mai scurtă obține rezultate mai bune decât compresia agresivă care degradează fiecare cadru.',
      ],
    },
    {
      heading: 'Testarea codurilor QR animate',
      paragraphs: [
        'Testarea codurilor animate necesită scanarea în mai multe puncte ale ciclului de animație. Nu scanați o singură dată și presupuneți că ați reușit - scanați în mod repetat, în momente diferite, pentru a verifica dacă fiecare cadru este lizibil. Acordați o atenție deosebită cadrelor aflate la extremele ciclului de culoare sau la vârfurile de intensitate a suprapunerii, unde contrastul ar putea fi cel mai scăzut.',
        'Testați pe hardware-ul afișajului real, acolo unde este posibil. Calibrarea culorilor monitorului, unghiul de vizualizare și iluminarea ambientală afectează modul în care apare și scanează animația." "O animație luminoasă care se scanează perfect pe monitorul dvs. s-ar putea estompa pe un ecran exterior sau ar putea deveni ilizibilă la unghiuri de vizualizare oblice.',
      ],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'O matrice de testare care arată ratele de succes ale scanării pe diferite cadre, dispozitive și condiții de afișare',
          caption:
            'Protocol animat de testare QR: verificare sistematică pe cadre, dispozitive și condiții de vizualizare',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Vizualizați exemple de coduri QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Cele mai bune practici de siguranță și conformitate QR',
      paragraphs: [
        'Un cod QR frumos conceput care nu se scanează este mai rău decât inutil - frustrează clienții, afectează percepția mărcii și irosește fiecare resursă investită în crearea și distribuirea sa. Acest ghid acoperă factorii tehnici și practici care determină dacă un cod QR se va scana în mod fiabil și cum să utilizați caracteristicile de siguranță ale ANQR pentru a detecta potențialele probleme înainte ca acestea să ajungă în producție.',
        'Fiabilitatea codurilor QR nu este binară. Un cod s-ar putea scana perfect pe telefoanele emblematice, dar ar putea eșua pe dispozitivele economice. Ar putea funcționa în iluminare ideală, dar ar putea avea dificultăți în restaurante slabe sau în lumina puternică a soarelui." "Înțelegerea factorilor care afectează scanabilitatea vă ajută să faceți compromisuri informate între stilul vizual și fiabilitatea în lumea reală.',
      ],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Un spectru de fiabilitate care prezintă coduri QR variind de la foarte scanabile la marginal lizibile',
          caption:
            'Spectrul de scanabilitate: de la coduri rezistente la stiluri care împing limitele fiabilității',
        },
      ],
    },
    {
      heading: 'Înțelegerea nivelurilor de corecție a erorilor',
      paragraphs: [
        'Codurile QR includ redundanță încorporată care le permite să fie citite chiar și atunci când sunt parțial deteriorate sau ascunse. Nivelul de corecție a erorilor - L (7%), M (15%), Q (25%) sau H (30%) - determină cât de mult din cod poate lipsi în timp ce se decodează corect. O corecție a erorilor mai mare creează coduri mai mari, dar oferă o marjă de siguranță pentru suprapuneri, imperfecțiuni de imprimare și daune aduse mediului.',
        'Pentru codurile cu suprapuneri de imagini, nivelul de corecție a erorilor H este esențial - suprapunerea ascunde fizic o parte din cod și aveți nevoie de acea redundanță de 30% pentru a menține fiabilitatea. Pentru coduri curate, nestilizate, în medii controlate, nivelul M este adesea suficient." "Nivelul L ar trebui rezervat situațiilor în care dimensiunea codului este constrânsă critic și puteți garanta condiții impecabile.',
      ],
    },
    {
      heading: 'Zona critică de liniște',
      paragraphs: [
        'Zona de liniște este marginea goală care înconjoară fiecare cod QR. Scanerele folosesc această limită pentru a identifica unde începe și se termină codul. Standardul ISO specifică o zonă de liniște minimă de patru module (de patru ori lățimea celui mai mic pătrat din cod). Încălcarea acestui spațiu - cu elemente de design, margini de decupare sau conținut adiacent - este una dintre cele mai frecvente cauze ale eșecurilor de scanare.',
        'Impunerea zonei de liniște prin ANQR ajută la menținerea acestei spațieri critice, dar trebuie să vă asigurați și că este păstrată în proiectele finale. Atunci când predați grafica QR, specificați în mod explicit cerințele zonei de liniște. Atunci când plasați coduri în machete, verificați dacă niciun element nu pătrunde în acest spațiu. Câțiva milimetri de spațiu liber pot face diferența dintre o scanare fiabilă și clienții frustrați.',
      ],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'O diagramă care prezintă spațierea corectă a zonei liniștite versus încălcările comune care cauzează eșecuri de scanare',
          caption:
            'Cerințe pentru zona liniștită: marginea invizibilă care determină succesul scanării',
        },
      ],
    },
    {
      heading: 'Siguranța contrastului și a culorilor',
      paragraphs: [
        'Scanerele QR detectează modelul modulelor luminoase și întunecate. Orice stil care reduce acest contrast - prim-planuri luminoase, fundaluri întunecate, efecte de gradient sau suprapuneri cu opacitate redusă - face codul mai greu de citit. ANQR calculează rapoartele de contrast și avertizează atunci când alegerile dvs. de culori se apropie de niveluri periculoase, dar arbitrul final este întotdeauna testarea în lumea reală.',
        'Percepția culorilor variază în funcție de condițiile de iluminare. O combinație de culori care apare cu contrast ridicat pe monitor poate deveni dificil de distins în condiții de iluminare caldă incandescentă sau tuburi fluorescente reci. Dacă codul dvs. va fi implementat în condiții de iluminare variate, testați sub mai multe surse de lumină și luați în considerare rapoarte de contrast mai conservatoare ca marjă de siguranță.',
      ],
    },
    {
      heading: 'Dimensiunea modulului și distanța de vizualizare',
      paragraphs: [
        'Dimensiunea fizică a modulelor individuale determină distanța maximă de la care poate fi scanat un cod. Modulele mai mici înseamnă coduri mai mici, dar necesită distanțe de scanare mai apropiate. Regula generală este că fiecare modul ar trebui să aibă cel puțin 0,5 mm la distanța de scanare prevăzută, mărindu-se proporțional pentru distanțe mai mari. Un cod de pe un panou publicitar are nevoie de module mult mai mari decât un cod de pe o carte de vizită.',
        'Atunci când calculați dimensiunea modulului, luați în considerare cel mai rău scenariu: clientul cu un telefon mai vechi, în condiții de iluminare imperfectă, scanând la distanța maximă probabilă. Proiectați pentru acest utilizator și toți ceilalți vor avea o experiență și mai bună. Recomandările de dimensiune ANQR iau în considerare aceste variabile din lumea reală pentru a sugera dimensiuni adecvate pentru utilizarea dorită.',
      ],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'O diagramă privind dimensiunea modulului, dimensiunile de imprimare și distanța maximă efectivă de scanare',
          caption:
            'Ghid pentru distanța de scanare: potrivirea dimensiunii modulului cu cerințele de implementare',
        },
      ],
    },
    {
      heading: 'Utilizarea modului de siguranță ANQR',
      paragraphs: [
        'Modul de siguranță ANQR oferă feedback în timp real privind fiabilitatea scanării. Acesta monitorizează rapoartele de contrast, conformitatea zonei silențioase, intensitatea suprapunerii și alți factori care afectează scanabilitatea." Când orice parametru se apropie de niveluri riscante, veți vedea avertismente cu îndrumări specifice despre cum să îmbunătățiți fiabilitatea. Pentru implementările profesionale în care eșecul este costisitor, mențineți Modul de siguranță activ pe tot parcursul procesului de proiectare.',
        'Modul de siguranță include, de asemenea, o funcție de verificare prin scanare care încearcă să decodeze codul generat și raportează succesul sau eșecul. Deși această verificare în aplicație nu poate reproduce fiecare condiție din lumea reală, aceasta identifică multe probleme comune înainte de a investi în imprimare sau distribuție. Tratați verificarea cu succes ca pe o limită minimă, nu ca pe o garanție - testarea în lumea reală rămâne esențială.',
      ],
    },
    {
      heading: 'Protocoale de testare în lumea reală',
      paragraphs: [
        'Nicio verificare software nu înlocuiește testarea fizică. Imprimați codul la dimensiunea dorită pe material reprezentativ. Testați-l în mediul real de implementare, cu condiții de iluminare care corespund utilizării reale. Scanați cu mai multe dispozitive - nu doar cu telefonul dvs. emblematic, ci și cu dispozitive Android la buget redus, iPhone-uri mai vechi și orice dispozitive specifice pe care publicul dvs. le utilizează în mod obișnuit.',
        'Documentați-vă testarea sistematic. Înregistrați ce dispozitive au fost testate, în ce condiții, cu ce rezultate." "Dacă implementați coduri la scară largă, stabiliți criterii de acceptare: poate o rată de succes de 95% pe întregul grup de testare a dispozitivelor sau scanări reușite în decurs de 2 secunde pe toate dispozitivele testate. Aceste standarde ajută la obiectivizarea deciziilor de tip "acceptă/nu-acceptă", mai degrabă decât la speranța că totul va fi mai bun.',
      ],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'O listă de verificare cuprinzătoare a testării care acoperă dispozitivele, condițiile și criteriile de acceptare',
          caption:
            'Protocol de testare a implementării codurilor QR: verificare sistematică înainte de angajamentul de producție',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Deschideți generatorul',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Vizualizați exemple de coduri QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Vizualizați exemple de coduri QR', type: 'example' },
    {
      href: '/guide?lang=${lang}',
      label: 'Deschideți Ghidul utilizatorului complet',
      type: 'guide',
    },
    { href: '/gallery?lang=${lang}', label: 'Deschideți galeria', type: 'gallery' },
  ],
};
