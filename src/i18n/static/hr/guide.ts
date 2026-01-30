import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR korisnički priručnik',
  description: 'Potpuni vodič za korištenje ANQR-a za stvaranje QR kodova.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otvorite generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Pregledajte članke Learna', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Pogledajte QR primjere', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Početak rada',
      paragraphs: [
        'ANQR je generator QR koda s pristupom klijentu na prvom mjestu. Prema zadanim postavkama, QR kodovi se generiraju lokalno u vašem pregledniku - račun nije potreban i vaši podaci ostaju privatni. Za profesionalno ugrađivanje također možete koristiti API na strani poslužitelja.',
        'Sučelje ima tri razine sučelja: Basic, Advanced i Professional. Odaberite svoju razinu pomoću kartica u zaglavlju. Svaka razina otključava dodatne značajke dok sučelje ostaje fokusirano na ono što vam je potrebno.',
      ],
      bullets: [
        'Osnovno: jednostavno stvaranje QR koda s običnim tekstom/URL sadržajem i preklapanjem slike.',
        'Napredno: opcije QR kodiranja, stilovi prikazivanja, animacija, izlazni formati, proširene vrste sadržaja i prilagodba preklapanja.',
        'Profesionalno: vodeni žigovi, metapodaci, dijeljenje, sigurnosna analiza, QR kodovi plaćanja i poslovne značajke.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Otvorite generator', type: 'generator' }],
    },
    {
      heading: 'Brzi početak',
      paragraphs: ['Da biste izradili svoj prvi QR kod:'],
      bullets: [
        '1. Odaberite vrstu sadržaja (URL, tekst, WiFi itd.) s padajućeg izbornika Vrsta sadržaja.',
        '2. Unesite svoje podatke u predviđena polja.',
        '3. Po želji prilagodite boje, stilove i dodajte sliku preklapanja.',
        '4. Kliknite Izvezi da preuzmete svoj QR kod kao PNG, GIF, WebP ili SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Osnovne značajke',
      paragraphs: [
        'Osnovna razina pruža pojednostavljeno sučelje za kreiranje QR kodova sa korisnim sadržajem i slojevima slika. Ovo je najjednostavniji način za početak.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vrste sadržaja (osnovno)',
      paragraphs: [
        'Običan tekst: Kodirajte bilo koji tekst do ograničenja kapaciteta QR koda. Idealno za kratke poruke, kodove ili identifikatore.',
        'URL: Kodirajte web adrese. QR kod će otvoriti URL kada se skenira. Podržava http:// i https:// protokole.',
      ],
    },
    {
      heading: 'Preklapanje slike (osnovno)',
      paragraphs: [
        'Učitajte sliku (JPG, PNG, GIF, WebP) koja će se stopiti s vašim QR kodom. Osnovne značajke preklapanja uključuju:',
      ],
      bullets: [
        'Prijenos iz datoteke: odaberite sliku sa svog uređaja.',
        'Učitaj s URL-a: Unesite URL slike (mora omogućiti CORS).',
        'Središnji logotip: postavlja sliku u središte, oslanjajući se na ispravljanje pogrešaka.',
        'Blend: Jednostavno alfa miješanje slike s QR uzorkom.',
        'Intenzitet: kontrolira koliko snažno preklapanje utječe na QR kod (0-100%).',
        'Način rada u boji: u boji, u sivim tonovima ili crno-bijelo.',
        'Preserve Finder Patterns: Održava kutne uzorke nepromijenjenima za pouzdano skeniranje.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Napredne značajke',
      paragraphs: [
        'Napredna razina otključava opcije QR kodiranja, stilove prikazivanja, animacije, izlazne formate, proširene vrste sadržaja i naprednu prilagodbu preklapanja.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Postavke QR kodiranja',
      paragraphs: [
        'Verzija: QR kodovi dolaze u verzijama 1-40, s višim verzijama koje sadrže više podataka, ali su veće. Postavite na 0 (automatski) kako biste ANQR-u odabrali najmanju verziju koja odgovara vašem sadržaju.',
        'Ispravak pogrešaka: Određuje koliku štetu QR kod može pretrpjeti dok se može skenirati.',
      ],
      bullets: [
        'L (nisko): 7% ispravak pogreške - najmanja veličina, najmanja redundancija.',
        'M (srednji): 15% ispravak pogreške - uravnotežena opcija.',
        'Q (Kvartil): 25% ispravak pogreške - dobro za tiskane kodove.',
        'H (Visoka): 30% ispravak pogreške - najbolje za kodove s preklapanjem ili u teškim uvjetima.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mirna zona (margina)',
      paragraphs: [
        'Tiha zona je bijeli prostor oko QR koda. Skenerima je potrebna ova margina kako bi otkrili gdje kod počinje. Standard preporuča najmanje 4 modula. Smanjenje ispod 4 može uzrokovati probleme sa skeniranjem.',
      ],
    },
    {
      heading: 'Stil modula',
      paragraphs: ['Moduli su pojedinačni kvadrati koji čine QR kod. ANQR nudi pet stilova:'],
      bullets: [
        'Kvadrat: klasični QR izgled s oštrim kutovima.',
        'Zaobljeno: omekšani kutovi za prijateljskiji izgled.',
        'Točkice: Kružni moduli za modernu estetiku.',
        'Romb: kvadrati zakrenuti za 45° za prepoznatljiv uzorak.',
        'Povezani: Moduli se spajaju kada su susjedni, stvarajući organske oblike.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Stil uzorka tražila',
      paragraphs: [
        'Uzorci tražila tri su velika kvadrata u QR kutovima koji pomažu skenerima da orijentiraju kod. Dostupni stilovi:',
      ],
      bullets: [
        'Kvadrat: standardni kvadratni kutovi.',
        'Zaobljeno: omekšani kutovi koji odgovaraju stilu zaobljenog modula.',
        'Krug: Kružni obrasci tražila za kodove točkastog stila.',
      ],
    },
    {
      heading: 'Usklađivanje i obrasci vremena',
      paragraphs: [
        'Uzorci poravnanja pojavljuju se u većim QR kodovima (verzija 2+) radi ispravljanja iskrivljenja. Vremenski obrasci su izmjenične linije koje povezuju uzorke tražila.',
      ],
      bullets: [
        'Stil poravnanja: Traženje podudaranja, Kvadrat, Zaobljeno ili Krug.',
        'Stil mjerenja vremena: modul podudaranja, jednobojno ili isprekidano.',
      ],
    },
    {
      heading: 'Boje',
      paragraphs: [
        'Prednji plan: Boja QR modula. Crna (#000000) je standardna, ali svaka tamna boja radi.',
        'Pozadina: Boja pozadine. Bijela (#ffffff) je standardna. Osigurajte dovoljan kontrast s prednjim planom.',
        'Prozirna pozadina: potpuno uklonite pozadinu za korištenje na obojenim površinama. Osigurajte da površina pruža odgovarajući kontrast.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Veličina i razmak modula',
      paragraphs: [
        'Veličina modula: kontrolira veličinu svakog modula u pikselima. Veće vrijednosti stvaraju veće kodove koje je lakše skenirati.',
        'Razmak između modula: dodaje razmak između modula kao postotak. Mali razmaci (5-15%) mogu poboljšati mogućnost skeniranja u nekim uvjetima, ali preveliki razmaci smanjuju pouzdanost.',
      ],
    },
    {
      heading: 'Postavke izlaza',
      paragraphs: ['Format: odaberite format izvoza na temelju slučaja upotrebe.'],
      bullets: [
        'PNG: Rasterski format bez gubitaka, idealan za većinu namjena. Najbolje za ispis i digitalno.',
        'WebP: moderan format s manjim veličinama datoteka. Dobro za web korištenje.',
        'GIF: potrebno za animirane QR kodove. Podržava transparentnost.',
        'SVG: vektorski format koji se beskonačno skalira. Najbolje za velika tiskana slova ili kada trebate urediti kôd.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Izlazne dimenzije',
      paragraphs: [
        'Širina/visina: Postavite veličinu izlaza u pikselima. Za ispis izračunajte na temelju DPI (npr. 300 DPI na 1 inču = 300 px). Veće veličine skeniraju pouzdanije na daljinu.',
      ],
    },
    {
      heading: 'Postavke animacije (napredno)',
      paragraphs: ['Kontrolirajte ponašanje animiranog QR koda:'],
      bullets: [
        'Brzina: broj sličica u sekundi animacije u milisekundama.',
        'Petlja: Kontinuirana ili jednokratna animacija.',
        'Bounce: Ping-pong smjer animacije.',
        'Start Frame: Započnite animaciju od određenog okvira.',
        'Max Frames: Ograničite ukupan broj okvira u animaciji.',
        'Frame Step: Preskočite okvire za bržu animaciju.',
        'Interpolacija: Ništa, prijelaz ili preoblikovanje između okvira.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Vrste sadržaja (napredno)',
      paragraphs: ['Napredna razina otključava dodatne formate sadržaja:'],
      bullets: [
        'Telefonski broj (tel:): Stvara pozivnu telefonsku vezu.',
        'E-pošta (mailto:): Otvara klijent e-pošte s izbornim predmetom i tijelom.',
        'SMS: Unaprijed ispunjena tekstualna poruka na telefonski broj.',
        'vCard: puna kontakt kartica s imenom, organizacijom, telefonom, e-poštom, adresom.',
        'MeCard: Kompaktni format kontakta popularan u Japanu.',
        'BizCard: naslijeđeni format posjetnice.',
        'Geografska lokacija: GPS koordinate koje se otvaraju na kartama.',
        'WiFi: mrežne vjerodajnice za automatsko povezivanje (SSID, lozinka, vrsta sigurnosti).',
        'Kalendarski događaj: iCalendar format s naslovom, lokacijom, datumom/vremenom.',
        'Odgovor na poziv za događaj: Veza na stranicu za registraciju događaja.',
        'Pretplata na kalendar: pretplatite se na ICS/WebCal feed.',
        'URL datoteke/dokumenta: Izravna poveznica na datoteke za preuzimanje.',
        'Veza za pohranu u oblaku: Veze na Google Drive, Dropbox, OneDrive itd.',
        'Društveni profil: Veze na LinkedIn, Twitter, Instagram itd.',
        'Veza za slanje poruka: dubinske veze WhatsApp, Telegram, Signal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Napredne značajke prekrivanja',
      paragraphs: ['Dodatne mogućnosti prekrivanja:'],
      bullets: [
        'Obrezivanje: Omogućite obrezivanje kako biste odabrali četvrtasto područje svoje slike.',
        'Poluton: Klasični ispisni uzorak točkica na temelju svjetline slike.',
        'Dithered: Dithering difuzije pogreške za detaljnu reprodukciju.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Načini stapanja preklapanja (napredno)',
      paragraphs: ['Dodatni načini stapanja na naprednoj razini:'],
      bullets: [
        'Subpiksel: dijeli svaki modul na subpiksele za više detalja.',
        'Plavi šum: koristi zatamnjenje plavog šuma za uzorke bez artefakata.',
        'Mozaik: efekt temeljen na pločicama koji čuva strukturu slike.',
        'Gap Fill: postavlja sliku u praznine između modula.',
        'Svjetlina: Mijenja veličinu modula na temelju svjetline slike.',
        'Duotone: Preslikava sliku u dvije boje za upečatljiv kontrast.',
      ],
    },
    {
      heading: 'Intenzitet sloja',
      paragraphs: [
        'Kontrolira koliko snažno preklapanje utječe na QR kod (0-100%). Više vrijednosti pokazuju više detalja slike, ali mogu smanjiti mogućnost skeniranja. Počnite s oko 70% i prilagodite na temelju testiranja.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Način boja',
      paragraphs: ['Kako se obrađuje slika sloja:'],
      bullets: [
        'Puna boja: Čuva izvorne boje slike.',
        'Sivi tonovi: Pretvara u crno-bijele tonove.',
        'Crno-bijelo: binarna konverzija visokog kontrasta.',
      ],
    },
    {
      heading: 'Sačuvajte uzorke tražila',
      paragraphs: [
        'Kada je omogućeno, sloj tražila tri uzorka kutova ne mijenja. Toplo se preporučuje za pouzdano skeniranje.',
      ],
    },
    {
      heading: 'Predobrada slike',
      paragraphs: [
        'Primijenite filtre na sliku preklapanja prije stapanja. Ove prilagodbe mogu poboljšati izgled slike u konačnom QR kodu.',
      ],
      bullets: [
        'Svjetlina (-100 do +100): Posvijetlite ili potamnite sliku.',
        'Kontrast (-100 do +100): Povećajte ili smanjite raspon tonova.',
        'Gama (0,2 do 3,0): Nelinearna prilagodba svjetline. Vrijednosti ispod 1 posvijetljuju srednje tonove, iznad 1 potamnjuju ih.',
        'Zasićenost (-100 do +100): Intenzitet boje. -100 su sive nijanse, +100 je prezasićeno.',
        'Hue Rotate (0-360°): Pomaknite sve boje oko kotača boja.',
        'Zamućenje (0-20px): Omekšajte detalje slike.',
        'Izoštravanje (0-100%): Poboljšajte rubove i detalje.',
        'Posterizacija (0-16 razina): Smanjite razine boja za efekt postera.',
        'Prag (0-255): Pretvori u binarno crno/bijelo na graničnoj točki.',
        'Detekcija rubova: Sobel ili Canny algoritmi za prikaz samo rubova.',
        'Invert: Obrnuti sve boje.',
      ],
    },
    {
      heading: 'Fit Mode',
      paragraphs: ['Kako preklapajuća slika odgovara području QR koda:'],
      bullets: [
        'Naslovnica: Slika ispunjava cijelo područje, izrezuje se ako je potrebno.',
        'Sadrži: cijela slika vidljiva, može imati margine.',
        'Rastezanje: Slika se iskrivljuje kako bi se točno ispunila.',
      ],
    },
    {
      heading: 'Mogućnosti transformacije',
      paragraphs: [
        'Rotacija: Rotirajte sloj u koracima od 90°.',
        'Flip X/Y: Zrcaljenje slike vodoravno ili okomito.',
      ],
    },
    {
      heading: 'Algoritmi ditheringa',
      paragraphs: [
        'Dithering pretvara slike kontinuiranog tona u uzorke koje mogu predstavljati QR kodovi. Dostupno kada se koriste načini miješanja Dithered, Blue Noise ili True Dither.',
      ],
      bullets: [
        'Error Diffusion: Klasični Floyd-Steinberg stil. Širi pogrešku kvantizacije na susjedne piksele.',
        'Uređeno (Bayer): koristi matricu praga za pravilne uzorke.',
        'Grupirana točka: Simulira ispis u polutonovima.',
        'Void & Cluster: Optimizirano uređeno titranje.',
        'Plavi šum: Vizualno ugodan uzorak nasumičnog izgleda.',
        'Prag plavog šuma: Prag titranja s teksturom plavog šuma.',
        'Bijeli šum: nasumično titranje praga.',
        'Gaussov/trokutasti šum: šum s različitim distribucijama.',
        'Plavi šum + difuzija pogreške: hibrid koji kombinira obje tehnike.',
        'Screened Blue Noise: Uzorak plave buke poput zaslona.',
        'Perceptualno: ponderirano svjetlošću za bolje vizualne rezultate.',
        'Edge-Aware: Čuva rubove slike tijekom ditheringa.',
        'Adaptivni prag: lokalno-adaptivni prag.',
        'Vremenski plavi šum: Za animirane GIF-ove, uzorak se mijenja po okviru.',
      ],
    },
    {
      heading: 'Difuzijske jezgre',
      paragraphs: [
        'Kada koristite dithering difuzije pogreške, odaberite kako se pogreška distribuira:',
      ],
      bullets: [
        'Floyd-Steinberg: Klasična difuzija 4 susjeda. Dobar opći izbor.',
        'Jarvis-Judice-Ninke: 12-susjed, glatkije, ali sporije.',
        'Stucki: Slično JJN-u s različitim težinama.',
        'Burkes: Pojednostavljeni JJN, brže.',
        'Sierra: obitelj kernela koja balansira kvalitetu i brzinu.',
        'Atkinson: Difuzija svjetla, čuva detalje, ali može biti zrnata.',
      ],
    },
    {
      heading: 'Dither Snaga',
      paragraphs: [
        'Kontrolira koliko se primjenjuje podrhtavanje (0-100%). Niže vrijednosti zadržavaju više izvornog uzorka, više vrijednosti prikazuju više detalja slike.',
      ],
    },
    {
      heading: 'Postavke subpiksela',
      paragraphs: ['Kada koristite način stapanja subpiksela:'],
      bullets: [
        'Veličina mreže: 2×2, 3×3 ili 4×4 podpiksela po modulu. Više = više detalja.',
        'Središnje pravilo: Strogo zahtijeva središnji subpiksel da odgovara modulu. Središte polutonova dopušta varijacije.',
        'Neutralna boja: Boja koja se koristi za neodređene subpiksele.',
        'Nadjačavanje tražila: Kako se obrasci tražila prikazuju (puno ili stilizirano).',
      ],
    },
    {
      heading: 'Postavke polutonova',
      paragraphs: ['Kada koristite način miješanja polutonova:'],
      bullets: [
        'Veličina ćelije: po modulu ili N×N mreža.',
        'Oblik točke: krug, kvadrat ili linija.',
        'Krivulja svjetline: linearna, S-krivulja ili gama.',
      ],
    },
    {
      heading: 'Dvobojne boje',
      paragraphs: [
        'Kada koristite Duotone način stapanja, postavite boju sjene (tamna područja) i boju isticanja (svijetla područja).',
      ],
    },
    {
      heading: 'Postavke GIF animacije',
      paragraphs: ['Kada koristite animirane GIF slojeve:'],
      bullets: [
        'Koristite odgode okvira: poštujte izvorno vrijeme GIF-a.',
        'Max FPS: Ograničite broj sličica u sekundi (1-60 fps).',
        'Rukovanje odlaganjem: Poštujte ili pojednostavite metode odlaganja okvira.',
      ],
    },
    {
      heading: 'Napredne opcije renderiranja',
      paragraphs: ['Dodatne kontrole prikazivanja:'],
      bullets: [
        'Način razmaka: Nema, stil umetnutog, poteza ili negativnog razmaka.',
        'Polumjer kuta: postotak zaobljenih kutova za module.',
        'Gradijent: nijedan, linearni, radijalni ili konusni gradijent na modulima.',
        'Vanjski/unutarnji stil oka: Neovisni stil za prstenove s uzorkom tražila.',
        'Rotacija točkica: Rotirajte dijamantne/točkaste module.',
        'Eye Scale: Prilagodba veličine za uzorke tražila.',
        'Stil okvira: dodajte ukrasne okvire (zaobljeni okvir, naljepnica, oznaka).',
        'Tekst okvira: Dodajte tekst poput "Skeniraj me!" na okvire.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Napredno QR kodiranje',
      paragraphs: ['Fino podešavanje QR kodiranja:'],
      bullets: [
        'Način kodiranja: Automatski, Numerički, Alfanumerički, Byte/UTF-8 ili Kanji.',
        'Nametnite minimalnu tihu zonu: osigurajte marginu od najmanje 4 modula.',
        'Uzorak maske: Automatski (optimalno) ili ručno odaberite uzorke 0-7 za kontrolu distribucije modula. Različiti obrasci stvaraju različite vizualne izglede tijekom kodiranja istih podataka.',
        'Kodiranje znakova: ISO-8859-1 (Latin-1 zadano), UTF-8 (puni Unicode uključujući emoji) ili Shift-JIS (japanski). Odaberite na temelju zahtjeva karaktera vašeg sadržaja.',
      ],
    },
    {
      heading: 'Napredne mogućnosti ispisa',
      paragraphs: ['Dodatne postavke izvoza:'],
      bullets: [
        'Naziv datoteke: prilagođeni naziv datoteke za preuzimanja.',
        'Veličina GIF palete: 2-256 boja u GIF izlazu.',
        'GIF Quantizer: Median Cut, NeuQuant ili Octree smanjenje boje.',
        'GIF Dithering: isključeno, Floyd-Steinberg ili uređeno.',
        'GIF Prozirna boja: Postavite boju da bude prozirna.',
        'SVG True Vector: Koristite staze umjesto ugrađenog rastera.',
        'SVG Shape Precision: prikaz piksela ili preciznog puta.',
        'SVG Embed Raster Overlay: Uključi preklapanje kao ugrađenu sliku.',
        'Nadjačavanje pozadine: Forsirajte određenu boju pozadine u izlazu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Opcije provjere valjanosti',
      paragraphs: ['Postavke obrade unosa:'],
      bullets: [
        'Provjerite unos: provjerite format sadržaja prije kodiranja.',
        'Trim Whitespace: Uklonite početne/završne razmake.',
        'Normaliziraj nove retke: Pretvori sve završetke redaka u LF.',
        'Čuvar maksimalne duljine: Upozorenje ako sadržaj premašuje kapacitet QR-a.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Profesionalne značajke',
      paragraphs: [
        'Profesionalna razina dodaje vodene žigove, metapodatke, opcije dijeljenja, sigurnosnu analizu, QR kodove plaćanja i poslovne značajke.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vodeni žig',
      paragraphs: ['Dodajte vodene žigove svojim QR kodovima:'],
      bullets: [
        'Vrsta: Tekst, slika ili uzorak vodenog žiga.',
        'Položaj: centar, uglovi, rubovi, iza ili tiha zona.',
        'Neprozirnost: prozirnost vodenog žiga (0-100%).',
        'Način miješanja: Normalno, Množenje, Zaslon ili Preklapanje.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metapodaci',
      paragraphs: ['Ugradite metapodatke u izvezene datoteke:'],
      bullets: [
        'Polja Naslov, Autor, Autorsko pravo, Licenca, Opis.',
        'Vrijeme izrade: Ugradite vremensku oznaku generacije.',
        'Prilagođeni ključ-vrijednost: dodajte proizvoljne parove metapodataka.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Dijeljenje',
      paragraphs: ['Podijelite svoje konfiguracije QR koda:'],
      bullets: [
        'Izravna veza: Generirajte URL koji se može dijeliti s vašim trenutnim postavkama.',
        'Ugradite HTML: Nabavite kod za ugradnju za web stranice.',
        'Encode Parameters: Uključite sve postavke u dijeljeni URL.',
        'Napomena: Prekrivajuće slike iz lokalnih datoteka ne mogu se dijeliti putem URL-a.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Sigurnosna analiza',
      paragraphs: ['Osigurajte da se QR kodovi mogu skenirati:'],
      bullets: [
        'Sigurnosni način rada: zahtjevi za skeniranje isključeno, uravnoteženo ili strogi.',
        'Minimalna veličina modula: Minimalna veličina piksela po modulu.',
        'Min Quiet Zone: Minimalni moduli marže.',
        'Lock Finders/Timing/Align/Format/Version: Zaštitite određene elemente.',
        'Max Overlay Intensity by ECC: Automatska ograničenja intenziteta na temelju razine ispravljanja pogrešaka.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Vrste sadržaja (profesionalno)',
      paragraphs: ['Profesionalna razina dodaje vrste sadržaja plaćanja i poduzeća:'],
      bullets: [
        'EPC/SEPA (EU): QR kodovi europskog bankovnog prijenosa s IBAN-om, BIC-om, iznosom, referencom.',
        'UPI (Indija): Objedinjeno sučelje plaćanja s VPA-om, ime primatelja uplate, iznos.',
        'PayNow (Singapur): Singapursko brzo plaćanje s UEN ili brojem mobilnog telefona.',
        'PromptPay (Tajland): tajlandski nacionalni sustav plaćanja.',
        'PIX (Brazil): Brazilsko trenutačno plaćanje s PIX ključem.',
        'Kripto: Bitcoin, Ethereum, Litecoin adrese za plaćanje s izbornim iznosom.',
        'Link marketinške kampanje: URL-ovi s punim praćenjem UTM parametara (Marketinške oznake).',
        'Kratka poveznica: Za korištenje s skraćivačima URL-ova za dinamičke QR kodove/kodove koji se mogu pratiti.',
        'GS1 Digital Link: Identifikacija proizvoda s GTIN-om, serijskim brojem, serijom, istekom roka trajanja.',
        'Dubinska veza aplikacije: dubinske veze aplikacije za iOS/Android s prilagođenim shemama.',
        'Prilagođeni format: neobrađeni podaci bez oblikovanja ili provjere.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Plaćanja relevantna za jezik u naprednom načinu rada',
      paragraphs: [
        'Kada koristite napredni način rada, ANQR automatski prikazuje načine plaćanja relevantne za vaš odabrani jezik. Na primjer, vijetnamski korisnici vide VietQR, tajlandski korisnici vide PromptPay, a korisnici indijskog jezika vide UPI i BharatQR. Globalni načini plaćanja (kriptovaluta, PayPal, Cash App) dostupni su na svim jezicima. Profesionalni način otključava sve standarde plaćanja bez obzira na jezik.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Europski standardi plaćanja',
      bullets: [
        'EPC/SEPA (EU): QR kodovi za europski bankovni prijenos prema standardu EPC QR kodova. Podržava IBAN, BIC (izborno za domaće), iznos u eurima i strukturirane ili nestrukturirane reference plaćanja. Koristi se u cijeloj SEPA zoni uključujući zemlje EU plus Švicarsku, Norvešku, Island, Lihtenštajn, Monako i San Marino.',
        'Švicarski QR-račun: švicarski standard plaćanja prema SIX smjernicama za provedbu. Podržava CHF i EUR, QR-referencu (QRR), referencu vjerovnika (ISO 11649), strukturirane adrese vjerovnika/dužnika i podatke o računu. Obavezno za švicarske fakture od 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indijski standardi plaćanja',
      bullets: [
        'UPI (Indija): Objedinjeno sučelje za plaćanje prema specifikaciji dubinskog povezivanja NPCI. Podržava VPA (virtualnu adresu za plaćanje), ime primatelja, iznos u INR, bilješku o transakciji, referentni ID, šifru kategorije trgovca i način transakcije.',
        'BharatQR (Indija): Jedinstveni QR standard koji podržava UPI i plaćanja putem kartice. Kombinira UPI VPA s PAN kartice za maksimalnu kompatibilnost. Uključuje ime trgovca, grad, MCC, pojedinosti o GST-u i fakture/poziv na brojeve.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standardi plaćanja jugoistočne Azije',
      bullets: [
        'PayNow (Singapur): singapurski sustav brzog plaćanja koji koristi EMVCo QR specifikaciju sa SGQR profilom. Podržava UEN (registraciju poduzeća), broj mobilnog telefona ili NRIC kao proxy identifikator. Uključuje oznaku za uređivanje količine i datum isteka.',
        'PromptPay (Tajland): Tajlandski nacionalni sustav plaćanja koji slijedi EMV profil Banke Tajlanda. Podržava broj mobilnog telefona, osobnu iskaznicu, porezni broj, ID e-novčanika i plaćanje računa s više referentnih polja.',
        'QRIS (Indonezija): indonezijski standard koda za brzi odgovor. Nacionalni standard plaćanja temeljen na EMV-u koji podržava ID trgovca, NMID (National Merchant ID), klasifikaciju kriterija trgovca i naknade za pogodnosti (fiksne ili postotne).',
        'DuitNow (Malezija): malezijski sustav trenutnog plaćanja. Podržava više vrsta proxyja uključujući NRIC, brojeve mobitela, putovnice, vojne iskaznice i registracijske brojeve poduzeća.',
        'VietQR (Vijetnam): Vijetnamski međubankarski standard prijenosa. Zahtijeva bankovni BIN (NAPAS identifikacija) i broj računa. Podržava više servisnih kodova za različite vrste prijenosa (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipini): filipinski QR standard plaćanja za InstaPay i PESONet. Koristi brojeve računa s identifikacijom trgovca za P2M transakcije (od osobe do trgovca).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Istočnoazijski standardi plaćanja',
      bullets: [
        'TWQR (Tajvan): tajvanski QR standard plaćanja. Podržava ID trgovca, PDV ID i iznose u TWD.',
        'HKQR/FPS (Hong Kong): QR kodovi sustava bržeg plaćanja Hong Konga. Podržava FPS ID, broj mobitela ili e-poštu kao identifikator plaćanja. Iznosi u HKD.',
        'JPQR (Japan): japanski jedinstveni standard plaćanja QR kodom. Koristi ID trgovine za identifikaciju trgovca s iznosima u JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ostali regionalni standardi plaćanja',
      bullets: [
        'PIX (Brazil): sustav trenutnog plaćanja Brazilske središnje banke prema specifikaciji BR koda. Podržava PIX ključeve (CPF, CNPJ, e-poštu, telefon ili slučajni ključ), ime/grad trgovca, ID transakcije i iznose BRL-a.',
        'AusPayNet/NPP PayID (Australija): PayID sustav nove australske platforme za plaćanje. Podržava PayID vrste (e-pošta, mobitel, ABN, ID organizacije) ili tradicionalni BSB + broj računa. Naziv trgovca nije obavezan jer platitelji vide registrirani naziv iz pretraživanja NPP-a.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Plaćanja kriptovalutom',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): standardni URI-ji plaćanja kriptovalutom s adresom novčanika, opcijskim iznosom i oznakom. Kompatibilan sa svim glavnim Bitcoin i Litecoin novčanicima.',
        'Lightning Network (BOLT11): Fakture za plaćanje Lightning Network. Zalijepite BOLT11 kodirani niz fakture za trenutna Bitcoin plaćanja uz minimalne naknade.',
        'Ethereum (EIP-681): URI-ji zahtjeva za Ethereum transakciju koji podržavaju izvorne ETH prijenose i prijenose tokena ERC-20. Uključuje ID lanca za višemrežnu podršku (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), parametre plina i pozive funkcija ugovora.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Usluge veza za plaćanje',
      bullets: [
        'PayPal.Me: PayPal veze za plaćanje s korisničkim imenom i izbornim unaprijed ispunjenim iznosom. Primatelji mogu platiti putem PayPal stanja, kartica ili bankovnih računa.',
        'Aplikacija za gotovinu: veze za plaćanje aplikacije za gotovinu pomoću oznake $cashtag s izbornim iznosom. Popularno u Sjedinjenim Državama za peer-to-peer plaćanja.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Generički EMV QR',
      bullets: [
        'EMV Generic: Stvorite prilagođene EMV Merchant-Presented Mode QR kodove za sheme plaćanja koje nisu posebno navedene. Konfigurirajte ime trgovca, grad, šifru zemlje (ISO 3166-1), šifru valute (ISO 4217 brojčano), MCC, opcije napojnice/naknade i dodatna podatkovna polja. Korisno za testiranje ili prilagođene integracije.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Prekrivajući načini miješanja (profesionalno)',
      paragraphs: ['Dodatni načini stapanja na profesionalnoj razini:'],
      bullets: [
        'Pixelate: pikselizirani učinak preklapanja.',
        'Obris: sloj za otkrivanje rubova koji prikazuje samo konture.',
        'Val: efekt valovitog izobličenja.',
        'Veličina subpiksela: Promjenjiva veličina subpiksela na temelju slike.',
        'True Dither: napredni dithering s uređenim odabirom matrice.',
        'Ekstremno: Maksimalna vidljivost slike, može utjecati na mogućnost skeniranja.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Postavke zaštite',
      paragraphs: [
        'Precizna kontrola nad time koji su QR elementi zaštićeni od izmjene preklapanja:',
      ],
      bullets: [
        'Očuvanje vremena: Zadržite vremenske uzorke nepromijenjenima.',
        'Sačuvaj poravnanje: Zadrži uzorke poravnanja nepromijenjenima.',
        'Zaštitite informacije o formatu: Zaštitite module informacija o formatu.',
        'Zaštitite informacije o verziji: Zaštitite module informacija o verziji.',
      ],
    },
    {
      heading: 'ECC-Aware Mode',
      paragraphs: [
        'Inteligentno raspoređuje intenzitet preklapanja na temelju kapaciteta ispravljanja pogrešaka. Sustav analizira koji se moduli mogu mijenjati uz zadržavanje mogućnosti skeniranja.',
      ],
      bullets: [
        'Proračun rizika: Postotak kapaciteta ispravljanja pogrešaka za korištenje (0-100%).',
        'Veći proračun = vidljiviji sloj, ali riskantnija mogućnost skeniranja.',
        'Niži proračun = sigurnije skeniranje, ali manje vidljiv sloj.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mogućnosti profesionalnog iscrtavanja',
      paragraphs: ['Napredne kontrole renderiranja:'],
      bullets: [
        'Oštri rubovi: Koristite pikselizirano renderiranje slike za oštre rubove modula.',
        'Snimanje piksela: poravnanje piksela na podu, okruglom ili stropu.',
        'Način boje po modulu: jednobojno, prema svjetlini, prema položaju, prema preklapanju, prema klasteru.',
        'Paleta boja: definirajte prilagođenu paletu boja za bojanje po modulu.',
        'Zaštita kontrasta: Osigurajte minimalni omjer kontrasta između boja.',
        'Min. omjer kontrasta: zahtjev za kontrastom u WCAG stilu (1:1 do 21:1).',
        'Dodatni rubni moduli: Dodatni rub izvan mirne zone.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mogućnosti profesionalnog ispisa',
      paragraphs: ['Postavke izvoza poduzeća:'],
      bullets: [
        'DPI: Postavite rezoluciju ispisa (72-600 DPI). 300 DPI preporučeno za ispis.',
        'Uključi tihu zonu: Uključi/isključi tihu zonu u izlaznim dimenzijama.',
        'Izvezi kao dodatni: Generirajte PDF uz primarni format.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Postavke animacije (Profesionalno)',
      paragraphs: ['Dodatne značajke profesionalne animacije:'],
      bullets: [
        'Vremensko podrhtavanje: isključeno, plavi šum ili titranje sigurno po kadru.',
        'Uzorak: Ništa, efekti pulsa, valova, skeniranja, svjetlucanja ili lelujanja.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Referenca',
      paragraphs: [
        'ANQR pruža API na strani poslužitelja za generiranje QR kodova putem URL parametara. Ovo je idealno za ugrađivanje QR kodova u web stranice, e-poštu, dokumente ili automatizirane tijekove rada bez JavaScripta na strani klijenta.',
        'Osnovni URL: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Pogledajte QR primjere', type: 'example' }],
    },
    {
      heading: 'Osnovni parametri',
      paragraphs: ['Obavezni i uobičajeni parametri (nazivi parametara nisu prevedeni):'],
      bullets: [
        'podaci (obavezno): sadržaj za kodiranje u QR kodu. URL kodiranje posebnih znakova.',
        'veličina: Veličina slike u pikselima (zadano: 400, maks.: 2000). Koristi se ako w/h nije navedeno.',
        'w, h: širina i visina izlaza u pikselima. Nadjačava parametar veličine.',
        'format: Izlazni format - png, webp ili gif (zadano: png).',
        'ec: Razina ispravljanja pogreške - L, M, Q ili H (zadano: H).',
        'fg: Boja prednjeg plana kao hex bez # (zadano: 000000).',
        'bg: Boja pozadine kao hex bez # (zadano: ffffff).',
        'prozirno: Postavite na 1 za prozirnu pozadinu.',
        'margina: Tiha zona u modulima (zadano: 4).',
      ],
    },
    {
      heading: 'Parametri stiliziranja',
      paragraphs: ['Oblikovanje modula i uzorka:'],
      bullets: [
        'stil: Stil modula - kvadratni, zaobljeni, točkice, romb, spojeni.',
        'tražilo: stil uzorka tražila - kvadrat, zaobljeno, krug.',
        'align: Stil uzorka poravnanja - match_finder, kvadrat, zaobljeno, krug.',
        'mjerenje vremena: Stil uzorka vremenskog usklađivanja - match_module, puno, isprekidano.',
        'polumjer: postotak radijusa kuta 0-100.',
        'razmak: postotak razmaka modula 0-50.',
        'gapMode: način razmaka - ništa, umetnuti, potez, negativni_razmak.',
        'eyeOuter, eyeInner: Stilovi očiju - kvadratni, zaobljeni, kružni.',
        'eyeScale: Postotak očne ljestvice (zadano: 100).',
        'grad: Vrsta gradijenta - nema, linearni, radijalni, konusni.',
        'gradAngle: kut gradijenta za linearne gradijente.',
        'gradStops: gradijent zaustavlja kao color1,pos1,color2,pos2,... (npr. ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Parametri preklapanja',
      paragraphs: [
        'Opcije preklapanja slike (slika preklapanja se dohvaća sa strane poslužitelja):',
      ],
      bullets: [
        'img: URL do slike preklapanja (mora biti javno dostupan).',
        'način rada: način preklapanja - centar, poluton, miješanje, svjetlina, mozaik, dithered, plavi šum, subpiksel.',
        'intenzitet: intenzitet preklapanja 0-100 (zadano: 100).',
        'colorMode: Prekrivajući način boja - boja, sivi tonovi, bw.',
        'fit: Kako preklapanje pristaje - pokriva, sadrži, rasteže.',
        'rot: Prekrivajuća rotacija u stupnjevima.',
        'flipX, flipY: Postavite na 1 za okretanje sloja.',
        'keepFinders: Sačuvaj uzorke tražila (zadano: 1).',
        'keepTiming, keepAlign: Postavite na 1 za očuvanje uzoraka vremena/usklađivanja.',
      ],
    },
    {
      heading: 'Parametri pretprocesiranja',
      paragraphs: ['Predobrada slike primijenjena na sloj:'],
      bullets: [
        'svjetlina: podešavanje -100 do 100 (zadano: 0).',
        'kontrast: Podešavanje -100 do 100 (zadano: 0).',
        'gama: vrijednost 0,1 do 3 (zadano: 1).',
        'zasićenje: podešavanje -100 do 100 (zadano: 0).',
        'nijansa: rotacija nijanse u stupnjevima.',
        'zamućenje: Zamućenje u pikselima.',
        'izoštriti: Količina izoštravanja 0-100.',
        'posterize: Posterizirajte razine.',
        'prag: Binarni prag 0-255.',
        'rub: otkrivanje rubova - isključeno, sobel, canny.',
        'invert: Postavite na 1 za invertiranje boja.',
      ],
    },
    {
      heading: 'Parametri vodenog žiga',
      paragraphs: ['Dodajte vodene žigove generiranim QR kodovima:'],
      bullets: [
        'wmEn: Postavite na 1 da omogućite vodeni žig.',
        'wmKind: Vrsta vodenog žiga - tekst, slika, uzorak.',
        'wmText: Tekst vodenog žiga (URL-kodiran).',
        'wmImg: URL do slike vodenog žiga.',
        'wmPos: Položaj - centar, kutovi, rubovi, iza, tiha_zona.',
        'wmOpacity: neprozirnost 0-100 (zadano: 50).',
        'wmBlend: način miješanja - normalan, multiply, screen, overlay.',
      ],
    },
    {
      heading: 'Parametri animacije',
      paragraphs: ['Za animirani GIF izlaz (zahtijeva format=gif):'],
      bullets: [
        'animPattern: uzorak animacije - ništa, puls, val, scanline, svjetlucanje, drift, color_cycle.',
        'animFrames: Broj okvira 1-60 (zadano: 24).',
        'animSpeed: Kašnjenje okvira u milisekundama 10-1000 (zadano: 100).',
        'animSeed: Nasumično sjeme za animaciju.',
        'easing: Ublažavanje animacije - linearno, ease_in, ease_out, ease_in_out, odskakanje.',
      ],
    },
    {
      heading: 'Izlazni parametri',
      paragraphs: ['Opcije izlaznog formata:'],
      bullets: [
        'kvaliteta: WebP kvaliteta 0-1 (zadano: 0,9).',
        'webpQ: WebP kvaliteta 0-100 (zadano: 90).',
        'gifBoje: GIF paleta veličine 2-256 (zadano: 256).',
        'dpi: Izlazni DPI za PNG (zadano: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: PNG polja metapodataka.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Parametri usjeva',
      paragraphs: ['Mogućnosti obrezivanja preklapajuće slike:'],
      bullets: [
        'cropEn: Omogući obrezivanje preklapanja 0/1 (zadano: 0).',
        'cropX: Središte usjeva X kao razlomak 0-1 (zadano: 0,5).',
        'CROPY: Centar usjeva Y kao frakcija 0-1 (zadano: 0,5).',
        'cropSize: Veličina izrezivanja kao dio slike 0-1 (zadano: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Parametri sigurnosne brave',
      paragraphs: ['Kontrolirajte koji su QR elementi zaštićeni od izmjene preklapanja:'],
      bullets: [
        'lockF: Zaključaj uzorke tražila 0/1 (zadano: 1).',
        'lockT: Zaključavanje vremenskih uzoraka 0/1 (zadano: 1).',
        'lockA: Zaključaj uzorke poravnanja 0/1 (zadano: 1).',
        'lockFmt: Zaključaj informacije o formatu 0/1 (zadano: 1).',
        'lockV: Zaključaj informacije o verziji 0/1 (zadano: 1).',
        'safeMode: Sigurnosni način rada - isključen, uravnotežen, strog (zadano: isključeno).',
        'safeMinPx: Minimalna veličina modula u pikselima (zadano: 2).',
        'safeMinQz: Minimalni moduli tihe zone (zadano: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parametri automatskog podešavanja',
      paragraphs: ['Postavke automatske optimizacije:'],
      bullets: [
        'autoVer: Automatski odabir QR verzije 0/1 (zadano: 1).',
        'autoEcc: Automatski odabir ECC razine 0/1 (zadano: 0) - samo savjet na strani poslužitelja.',
        'autoReduce: [SAMO ZA KLIJENT] Automatsko smanjivanje intenziteta dok se ne može skenirati - zahtijeva petlju provjere valjanosti skeniranja.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Dodatni parametri animacije',
      paragraphs: ['Proširene kontrole animacije za GIF izlaz:'],
      bullets: [
        'petlja: animacija se neprekidno ponavlja 0/1 (zadano: 1).',
        'odskakanje: smjer ping-pong animacije 0/1 (zadano: 0).',
        'unazad: Reprodukcija animacije unazad 0/1 (zadano: 0).',
        'colorCycle: Omogući efekt izmjene boja 0/1 (zadano: 0).',
        'interp: Interpolacija okvira - ništa, prijelaz, preoblikovanje (zadano: ništa).',
        'tempDither: Vremensko podrhtavanje - isključeno, blue_noise, flicker_safe (zadano: isključeno).',
        'startF: početni okvir animacije (zadano: 0).',
        'maxF: Maksimalan broj okvira za renderiranje (zadano: 0 = automatski).',
        'stepF: interval koraka okvira (zadano: 1).',
        'podrhtavanje: [SAMO ZA KLIJENT] podrhtavanje modula u pikselima - zahtijeva QR regeneraciju po okviru.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Parametri ditheringa',
      paragraphs: ['Upravljajte algoritmima ditheringa za obradu preklapanja:'],
      bullets: [
        'ditherKind: Dither algoritam - error_diffusion, ordered_bayer, blue_noise, itd. (zadano: ordered_bayer).',
        'diffusionKernel: Jezgra difuzije pogreške - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (zadano: floyd_steinberg).',
        'ditherStrength: Intenzitet dithera 0-100 (zadano: 50).',
        'serpentine: zmijoliki dithering 0/1 (zadano: 0).',
        'matrica: Matrica uređenog dithera - bayer2, bayer4, bayer8 (zadano: bayer4).',
        'bnTile: Veličina pločice s plavim šumom (zadano: 64).',
        'bnSeed: slučajno sjeme plave buke (zadano: 0).',
        'colorDither: Promjenljivost boja - ništa, po_kanalu, perceptualno (zadano: ništa).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Parametri subpiksela',
      paragraphs: ['Postavke za način stapanja subpiksela:'],
      bullets: [
        'spGrid: Veličina mreže subpiksela - 2x2, 3x3, 4x4 (zadano: 3x3).',
        'spCenter: pravilo centra - strogo, halftone_center (zadano: strogo).',
        'spNeutral: heksadecimalna neutralna boja bez # (zadano: 808080).',
        'spFinder: nadjačavanje Findera - jednobojno, stilizirano (zadano: jednobojno).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Parametri polutonova',
      paragraphs: ['Postavke za način miješanja polutonova:'],
      bullets: [
        'htCell: Veličina ćelije polutona - per_module ili nxn mreža (zadano: per_module).',
        'htDot: Oblik točke - krug, kvadrat, linija (zadano: krug).',
        'htCurve: Krivulja svjetline - linearna, s-krivulja, gama (zadano: linearno).',
        'duo1: heksadecimalna boja dvotonske sjene bez # (zadano: 000000).',
        'duo2: heksadecimalna boja dvotonskog isticanja bez # (zadano: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parametri načina rada s ECC-om',
      paragraphs: [
        'Inteligentna raspodjela preklapanja temeljena na kapacitetu ispravljanja pogrešaka:',
      ],
      bullets: [
        'eccAware: Omogući ECC-svjestan način rada 0/1 (zadano: 0).',
        'eccRisk: postotak proračuna rizika 0-100 (zadano: 50).',
        'eccMap: Karta težine - distance_to_finders, block_heatmap, empirical_scan_heatmap (zadano: distance_to_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Parametri okvira',
      paragraphs: ['Postavke ukrasnog okvira:'],
      bullets: [
        'okvir: stil okvira - ništa, zaobljeni_okvir, naljepnica, oznaka (zadano: ništa).',
        'frameText: Tekst za prikaz u okviru (URL kodiran).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parametri boja po modulu',
      paragraphs: ['Mogućnosti bojanja pojedinačnih modula:'],
      bullets: [
        'modColor: Način boje - solid, by_brightness, by_position, by_overlay, by_cluster (zadano: solid).',
        'cGuard: Zaštita kontrasta 0/1 (zadano: 0).',
        'minContrast: Minimalni omjer kontrasta 1-21 (zadano: 4,5).',
        'paleta: heksadecimalne boje odvojene zarezima za način rada palete.',
        'paletteMode: Distribucija palete - položaj, svjetlina, dijagonala, radijalno, nasumično, red, stupac (zadano: položaj).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parametri GIF sloja',
      paragraphs: ['Postavke za animirane GIF preklapajuće slike:'],
      bullets: [
        'ovType: Vrsta sloja - statički, gif, apng, webp_anim, video (zadano: statički).',
        'ovFramePick: Odabir okvira - sve, svaki_n, max_frames, duration_limit (zadano: sve).',
        'gifDelays: Koristi originalne GIF okvire kašnjenja 0/1 (zadano: 1).',
        'gifDispH: rukovanje GIF raspolaganjem - poštivanje, pojednostavljenje (zadano: poštivanje).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Ograničenja intenziteta po ECC-u',
      paragraphs: ['Maksimalni intenzitet preklapanja po razini ispravljanja pogrešaka:'],
      bullets: [
        'maxIntL: Maksimalni intenzitet za ECC L 0-100 (zadano: 100).',
        'maxIntM: maksimalni intenzitet za ECC M 0-100 (zadano: 100).',
        'maxIntQ: maksimalni intenzitet za ECC Q 0-100 (zadano: 100).',
        'maxIntH: maksimalni intenzitet za ECC H 0-100 (zadano: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parametri QA simulacije (samo za klijenta)',
      paragraphs: [
        'Ovi se parametri analiziraju radi kompatibilnosti URL-a, ali rade samo u pregledniku:',
      ],
      bullets: [
        'qaContrast: Omogući provjeru kontrasta 0/1 - zahtijeva interaktivnu provjeru valjanosti.',
        'qaBlur: Simulirajte zamućenje u pikselima - samo za interaktivno testiranje.',
        'qaNoise: Simulacija razine buke - samo za interaktivno testiranje.',
        'qaHeatmap: Prikaži toplinsku kartu čitljivosti 0/1 - zahtijeva korisničko sučelje preklapanja platna.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Parametri samo za klijenta',
      paragraphs: [
        'Većina API parametara u potpunosti je podržana na strani poslužitelja. Parametri označeni [SAMO ZA KLIJENT] analiziraju se radi kompatibilnosti s URL-om, ali zahtijevaju značajke preglednika:',
      ],
      bullets: [
        'podrhtavanje: podrhtavanje modula zahtijeva QR regeneraciju po okviru s nasumičnim odabirom.',
        'autoReduce: Auto-reduce intenzitet zahtijeva iterativno testiranje skeniranja.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: QA simulacija zahtijeva interaktivnu validaciju platna.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Dodatni izlazni parametri',
      paragraphs: ['Postavke proširenog izlaza i izvoza:'],
      bullets: [
        'fname: Prilagođeni naziv datoteke za preuzimanja (zadano: anqr-qrcode).',
        'inclQz: Uključi mirnu zonu u izlazne dimenzije 0/1 (zadano: 1).',
        'bgOver: heksadecimalna zamjena boje pozadine bez # (nadjačava bg parametar).',
        'fmtExtra: Dodatni izlazni format - ništa, eps, animated_webp (zadano: ništa). Napomena: EPS je [DJELOMIČNO].',
        'svgPrec: preciznost SVG oblika - piksel, precizno (zadano: piksel). [DJELOMIČNO] SVG izlaz ograničen na strani poslužitelja.',
        'svgEmbed: Ugradi rasterski sloj u SVG 0/1 (zadano: 1). [DJELOMIČNO] SVG izlaz ograničen na strani poslužitelja.',
        'modulePx: veličina piksela modula (zadano: automatski izračunato iz veličine).',
        'granica: dodatni granični moduli izvan tihe zone (zadano: 0).',
        'oštar: Omogući renderiranje oštre/pikselizirane slike 0/1 (zadano: 1).',
        'snap: Pixel snap način - pod, okruglo, strop (zadano: pod).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parametri očuvanja uzorka',
      paragraphs: ['Kontrolirajte koji su strukturni elementi zaštićeni od preklapanja:'],
      bullets: [
        'keepFinders: Sačuvaj uzorke tražila 0/1 (zadano: 1).',
        'keepTiming: Sačuvaj vremenske obrasce 0/1 (zadano: 0).',
        'keepAlign: Sačuvaj uzorke poravnanja 0/1 (zadano: 0).',
        'protectFmt: Zaštiti format info modula 0/1 (zadano: 0).',
        'protectVer: Zaštitite info module verzije 0/1 (zadano: 0).',
      ],
    },
    {
      heading: 'Primjer upotrebe',
      paragraphs: [
        'Osnovni QR kod:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Stilizirani QR kod s prilagođenim bojama:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'QR kod sa slikom preklapanja:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'Animirani GIF:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Pogledajte QR primjere', type: 'example' }],
    },
    {
      heading: 'Ugradnja QR kodova',
      paragraphs: [
        'U profesionalnom načinu rada značajka Dijeli generira HTML i URL-ove koji se mogu ugraditi. Evo kako funkcionira ugradnja:',
      ],
      bullets: [
        'Podijeli vezu: stvara URL za ANQR aplikaciju sa svim vašim postavkama kodiranim kao URL parametri. Primatelji mogu vidjeti i izmijeniti QR kod.',
        'Ugradite sliku: Generira oznaku <img> koja upućuje na API poslužitelja. QR kod se prikazuje na strani poslužitelja i služi kao slika.',
        'Embed Markdown: Stvara sintaksu Markdown slike za dokumentaciju i README datoteke.',
        'Direct API URL: sirovi API URL za upotrebu u aplikacijama, skriptama ili drugim integracijama.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML primjer',
      paragraphs: [
        'Da biste ugradili QR kod na svoju web stranicu:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR kod" />',
        'Za odgovarajuće veličine:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />',
        'Poslužitelj sprema odgovore s dugim zaglavljima predmemorije, tako da su ponovljeni zahtjevi za isti URL brzi.',
      ],
    },
    {
      heading: 'Podijelite URL format',
      paragraphs: [
        'Kada kliknete Dijeli u profesionalnom načinu rada, ANQR kodira vaše trenutne postavke u URL parametre. Format je:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Ovi parametri odražavaju parametre API-ja, tako da URL za dijeljenje možete pretvoriti u URL API-ja promjenom osnovnog puta iz / u /api/qr i podešavanjem w/h parametara po potrebi.',
        'Napomena: Prekrivajuće slike učitane iz lokalnih datoteka ne mogu se dijeliti putem URL-a - samo preklapanja temeljena na URL-u (img parametar) rade u dijeljenim vezama i API pozivima.',
      ],
    },
    {
      heading: 'Ograničenja brzine i korištenja',
      paragraphs: [
        'API je besplatan za korištenje u razumnim količinama. Kontaktirajte nas za velike količine korištenja ili komercijalne aplikacije koje zahtijevaju zajamčeno vrijeme neprekidnog rada.',
        'Odgovori API-ja uključuju zaglavlja agresivnog predmemoriranja. Za najbolju izvedbu, predmemorirajte odgovore sa svoje strane ili dosljedno koristite isti URL za identične QR kodove.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Najbolji primjeri iz prakse',
      paragraphs: ['Slijedite ove smjernice za pouzdane QR kodove:'],
      bullets: [
        'Uvijek testirajte svoje QR kodove s više aplikacija za skeniranje prije ispisa.',
        'Koristite Ispravljanje pogrešaka H (Visoko) kada dodajete slojeve.',
        'Zadržite najmanje 4 modula tihe zone (margina).',
        'Osigurajte visok kontrast između prednjeg plana i pozadine.',
        'Za ispis koristite najmanje 300 DPI i testirajte na stvarnoj veličini ispisa.',
        'Omogući Preserve Finder Patterns kada koristiš slojeve.',
        'Počnite s nižim intenzitetom sloja i postupno povećavajte.',
        'Za vanjsku upotrebu razmislite o većim veličinama modula i većem ispravljanju pogrešaka.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Pregledajte članke Learna', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Pogledajte QR primjere', type: 'example' },
      ],
    },
    {
      heading: 'Rješavanje problema',
      paragraphs: ['Uobičajeni problemi i rješenja:'],
      bullets: [
        'QR neće skenirati: Smanjite intenzitet sloja, povećajte ispravljanje pogrešaka, provjerite kontrast.',
        'Kod je prevelik: Smanjite duljinu sadržaja, upotrijebite skraćivač URL-a, nižu verziju.',
        'Mutni izlaz: Povećajte veličinu modula, koristite PNG umjesto komprimiranih formata.',
        'Boje izgledaju krivo: Provjerite kontrast boja, isprobajte način preklapanja u sivim tonovima.',
        'GIF se ne animira: Provjerite korištenje izlaza GIF formata, provjerite broj okvira.',
        'Preklapanje slike se ne učitava: Provjerite dopuštenja CORS-a na udaljenim slikama.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Pogledajte povezane vodiče i primjere',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tipkovnički prečaci',
      paragraphs: [
        'ANQR podržava standardne tipkovničke prečace. Koristite Ctrl/Cmd+S za pokretanje izvoza (kada je fokus na pregledu).',
      ],
    },
    {
      heading: 'Dijeljenje i ugradnja',
      paragraphs: [
        'U profesionalnom načinu rada kliknite gumb Dijeli kako biste kopirali URL s vašim trenutnim postavkama. Primatelji mogu otvoriti ovaj URL da vide vašu točnu konfiguraciju. Napomena: Prekrivajuće slike iz lokalnih datoteka ne mogu se dijeliti putem URL-a.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Isprobajte ovu konfiguraciju izravno u ANQR generatoru.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Pregledajte članke Learna', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Pogledajte QR primjere', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Pogledajte QR primjere', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Otvorite generator', type: 'generator' },
  ],
};

export default guide;
