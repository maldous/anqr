import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR primjeri',
  description: 'Pet primjera iz stvarnog svijeta u produkcijskom stilu koji pokazuju gdje QR kodovi stvaraju mjerljivu vrijednost: podizanje starog koda maloprodajnog brojača, robna maloprodajna plaćanja i radnje "skeniranja", skaliranje ispisa od letaka do reklamnih panoa, animirani QR za digitalno označavanje i međujezična suradnja korištenjem sidrišnih veza koje se mogu dijeliti. Svaki primjer uključuje slike, praktična ograničenja i vezu remiksa natrag na generator.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otvorite generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Pregledajte članke Learna', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otvorite cijeli korisnički priručnik', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Studija slučaja: QR povećanje maloprodajnih pultova',
      paragraphs: ['Ovaj primjer iz stvarnog svijeta prati mali kafić koji je tri godine koristio isti QR kod na svom pultu. Izvorni kod brzo je generiran tijekom pandemije, ispisan na standardnom papiru i umetnut u plastični stalak. I dalje je radio - tehnički - ali klijentima je često bilo potrebno više pokušaja da ga skeniraju, a nije učinio ništa da ojača pažljivo osmišljen identitet marke kafića.', 'Transformacija je započela jednostavnom revizijom: postojeći kod kodirao je URL mrežnog jelovnika kafića koji su htjeli zadržati. Izazov je bio učiniti da se QR osjeća kao dio iskustva u kafiću, a ne naknadno smišljeni pomoćni program iz 2020. godine.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Istrošeni QR kod u plastičnom postolju koji pokazuje vidljivu istrošenost, otiske prstiju i izblijedjele ispise',
          caption: 'Polazna točka: tri godine službe na šalteru ostavile su izvorni QR jedva funkcionalnim',
        },
      ],
    },
    {
      heading: 'Dijagnosticiranje problema izvornog koda',
      paragraphs: ['Testiranje je otkrilo više problema: izvorni kod koristio je ispravljanje pogrešaka L (minimalna redundantnost), imao je mirnu zonu od samo 2 modula i bio je ispisan u niskoj razlučivosti. Pod toplim svjetlom od volframa u kafiću, već izblijedjeli crni moduli jedva su se razlikovali od požutjelog papira. Stariji telefoni su se mučili; noviji telefoni su uspjeli, ali s primjetnim kašnjenjem.', 'Osim tehničkih problema, generički crno-bijeli kvadrat nije komunicirao ništa o marki. Mušterije su oklijevale prije skeniranja - suptilna prepreka povjerenju koja je smanjila angažman s pažljivo dizajniranim digitalnim jelovnikom kafića.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Dijagnostički sloj koji prikazuje tehničke nedostatke izvornog QR-a: nizak ECC, minimalna tiha zona, loš kontrast',
          caption: 'Tehnička analiza koja otkriva zašto naslijeđeni kod nije imao dobre rezultate u stvarnim uvjetima',
        },
      ],
    },
    {
      heading: 'Proces podizanja',
      paragraphs: ['Koristeći ANQR, vlasnik kafića ponovno je stvorio kod s identičnim URL-om izbornika, ali dramatično poboljšanim postavkama: Ispravljanje pogrešaka H za maksimalnu otpornost, tiha zona od 6 modula za pouzdano otkrivanje granica i boje robne marke (duboki bordo moduli na krem pozadini) koje su odgovarale paleti interijera kafića.', 'Dodan je mali središnji sloj s logotipom kafića - koji je namjerno suptilan kako bi se održala mogućnost skeniranja, a istovremeno pružala trenutačno prepoznavanje robne marke. Sigurnosni način rada potvrdio je novi dizajn koji je pouzdano skeniran na testnim uređajima prije ispisa.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR sučelje koje prikazuje konfiguraciju: boje robne marke, odgovarajući ECC, izdašna tiha zona, suptilni sloj logotipa',
          caption: 'Izgradnja nadograđene konfiguracije: svaka postavka odabrana za ravnotežu između izražaja robne marke i pouzdanosti skeniranja',
        },
      ],
    },
    {
      heading: 'Mjerljivi rezultati',
      paragraphs: ['Nakon postavljanja novog QR-a na profesionalne mat-laminirane kartice, kafić je pratio rezultate tijekom četiri tjedna. Stopa uspješnosti skeniranja poboljšana je s procijenjenih 70% na gotovo 100%. Prosječno vrijeme skeniranja palo je s 3-4 sekunde na manje od 1 sekunde. Što je najvažnije, uključenost jelovnika povećala se za 40% - kupci koji su prethodno bacili pogled na QR i odustali sada su samouvjereno skenirali.', 'Osoblje je izvijestilo o manje pitanja kupaca o "kako koristiti QR" i nema više slučajeva ručnog upisivanja URL-a za frustrirane kupce. Brendirani izgled također je potaknuo razgovore, a kupci su pozitivno komentirali kohezivni dizajn.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Usporedba prije/poslije s mjernim podacima: stopa uspješnosti skeniranja, prosječno vrijeme skeniranja i poboljšanja tjednog broja skeniranja',
          caption: 'Četiri tjedna podataka koji pokazuju mjerljiv učinak promišljenog QR podizanja',
        },
      ],
    },
    {
      heading: 'Ponovno izradite ovu konfiguraciju',
      paragraphs: ['Konfiguracija kafića pokazuje konzervativno, ali učinkovito brendiranje: Error Correction H, tiha zona od 6 modula, boje brenda visokog kontrasta i minimalni središnji sloj. Ova ravnoteža funkcionira za većinu aplikacija maloprodajnih pultova gdje je pouzdanost na prvom mjestu, ali je prisutnost robne marke i dalje važna.', 'Otvorite generator s ovim unaprijed učitanim postavkama i prilagodite boje i sloj vašem vlastitom brendu. Ključni uvid: sama poboljšanja pouzdanosti mogu dramatično povećati angažman, čak i prije dodavanja bilo kakvog vizualnog stila.', 'Pogledajte povezani vodič za učenje o poboljšanju postojećih QR kampanja za cjelovitu metodologiju iza ovog pristupa.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Povežite se s generatorom unaprijed konfiguriranim s postavkama kafića za trenutnu prilagodbu',
          caption: 'Započnite s provjerenom konfiguracijom i prilagodite je za svoju marku',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Pregledajte članke Learna',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Studija slučaja: Prikaz brojača za više plaćanja',
      paragraphs: ['Ovaj primjer prati butik s odjećom koji je prikupio pet različitih QR kodova u svojoj blagajni: bankovno plaćanje, napojnice, Instagram, Google recenzije i poveznica za zapošljavanje. Svaki je generiran iz drugog izvora, tiskan u različito vrijeme i prikazan na neusklađenim stalcima. Vizualni kaos potkopavao je pažljivo odabranu estetiku trgovine, a osoblje se redovito suočavalo s kupcima koji su skenirali pogrešan kod.', 'Rješenje je zahtijevalo razdvajanje briga: kodovi plaćanja trebali su maksimalnu pouzdanost s konzervativnim stilom, dok su marketinški kodovi mogli biti izražajniji. Unificirani sustav prikaza koji se pojavio pokazuje kako uravnotežiti prisutnost robne marke u odnosu na funkcionalne zahtjeve različitih slučajeva upotrebe QR-a.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Neuredan registarski prostor koji prikazuje pet neusklađenih QR kodova na raznim stalcima i tiskanim materijalima',
          caption: 'Kaotična početna točka: pet nepovezanih QR kodova koji se natječu za pozornost i izazivaju zbunjenost kupaca',
        },
      ],
    },
    {
      heading: 'Davanje prioriteta iskustvu plaćanja',
      paragraphs: ['Primarni način plaćanja trgovine koristio je regionalni standard koji je zahtijevao strogu usklađenost s korisnim sadržajem. Testiranje je pokazalo da čak i manji stil utječe na brzinu skeniranja s određenim bankarskim aplikacijama. Odluka: ostavite QR za plaćanje potpuno nepromijenjenim osim optimizacije veličine i profesionalnog ispisa na mat kartonu.', 'Ovaj konzervativni pristup značio je da je kod za plaćanje izgledao manje "markirano" nego idealno, ali su se stope dovršetka transakcije dramatično poboljšale. Uvid: trenuci plaćanja nisu prilike za brendiranje - oni su trenuci pouzdanosti. Kupci cijene brzinu i sigurnost umjesto estetike kada je u pitanju novac.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Čisti, veliki QR kod za plaćanje na profesionalnoj mat kartici, istaknut na blagajni',
          caption: 'QR za plaćanje: izdašne veličine, profesionalno ispisan, konzervativno oblikovan za trenutačno prepoznavanje od strane bankarskih aplikacija',
        },
      ],
    },
    {
      heading: 'Stvaranje sekundarnog akcijskog zaslona',
      paragraphs: ['Za savjete, recenzije, društvene mreže i zapošljavanje, trgovina bi mogla biti izražajnija. Ovi su kodovi obnovljeni u ANQR-u s dosljednim stilom robne marke: maslinastozeleni potpis trgovine na krem ​​boji, stil zaobljenog modula i suptilan središnji sloj s ikonom trgovine. Error Correction H osigurao je pouzdanost čak i sa stilom.', 'Ova četiri koda bila su raspoređena u markiranu ploču postavljenu pored (ne natječući se s) kodom plaćanja. Jasne oznake u tipografiji trgovine objašnjavale su svrhu svakog koda. Vizualna hijerarhija bila je namjerna: plaćanje je stajalo zasebno i istaknuto; sekundarne radnje grupirane zajedno kao opcije.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Brendirana ploča koja prikazuje četiri stilizirana QR koda za savjete, recenzije, društvene mreže i zapošljavanje, s jasnim oznakama',
          caption: 'Sekundarna akcijska ploča: dosljedno brendiranje, jasno označavanje, postavljeno kao opcija, a ne kao smetnja',
        },
      ],
    },
    {
      heading: 'Dizajn sustava zaslona',
      paragraphs: ['Fizički zaslon riješio je nekoliko problema istovremeno. I stalak za plaćanje i sekundarna ploča koristili su mat materijale kako bi eliminirali odsjaj gornje rasvjete. Visine su optimizirane za kupce različitog rasta. Kutovi usmjereni prema redu kupca, a ne ravno na pultu.', 'Što je najvažnije, trgovina je stvorila rezervne ispise iz zaključanih ANQR konfiguracijskih veza. Kad je kod savjeta na kraju bio poprskan kavom, osoblje ga je zamijenilo u roku od nekoliko minuta koristeći pohranjenu konfiguraciju - bez snimki zaslona, ​​bez pogađanja postavki, bez degradacije kvalitete.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Dijagram koji prikazuje fizički izgled zaslona: visine, kutovi, materijali i odnos između plaćanja i sekundarnih zaslona',
          caption: 'Nacrt sustava za prikaz: fizička ergonomija optimizirana za pouzdano skeniranje preko visine korisnika i uvjeta osvjetljenja',
        },
      ],
    },
    {
      heading: 'Operativna poboljšanja',
      paragraphs: ['Šest tjedana nakon implementacije, trgovina je dokumentirala značajna poboljšanja: nula pritužbi kupaca na zabunu s \'pogrešnim kodom\', brže vrijeme transakcije i 3x povećanje podnošenja napojnica (kupci su sada mogli pronaći i skenirati kod napojnice bez nespretnog pitanja osoblja). Recenzije na Googleu također su se povećale jer je namjenski, dobro označen QR uklonio trenje.', 'Obuka osoblja postala je jednostavnija: \'kod plaćanja je veliki, sve ostalo je na ploči.\' Kada su se aplikacije za plaćanje ažurirale i jedna je nakratko pokazala sporije skeniranje, konzervativni dizajn koda za plaćanje značio je da je i dalje radila - samo neznatno sporije, umjesto da potpuno zakaže.', 'Pogledajte vodič za učenje o QR kodovima za maloprodajna plaćanja za principe koji stoje iza ovog dizajna sustava prikaza.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Nadzorna ploča s mjernim podacima koja prikazuje usporedbe prije/poslije: incidenti zabune, vrijeme transakcije, učestalost napojnica, slanja pregleda',
          caption: 'Šest tjedana operativnih podataka koji pokazuju poslovni utjecaj promišljenog multi-QR sustava prikaza',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Pregledajte članke Learna',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Studija slučaja: od posjetnice do bilborda',
      paragraphs: ['Ovaj primjer prati tvrtku za produkciju događaja koja se priprema za veliku konferenciju. Trebao im je isti QR kod - poveznica s aplikacijom za događaj - raspoređen u radikalno različitim formatima: umetci za bedž sudionika (3 cm), kartice za šator za stol (8 cm), natpisi na pultu za registraciju (30 cm), posteri za pronalaženje puta (60 cm) i masivni banner za pozadinu pozornice (4 metra). Svaki format imao je različite udaljenosti gledanja, uvjete osvjetljenja i proizvodne tijekove rada.', 'Izazov nije bio samo tehnički – bio je i operativni. Više dobavljača bavilo se različitim poslovima ispisa, a tvrtka je trebala osigurati dosljedne rezultate koji se mogu skenirati bez obzira na to tko je što proizveo. Njihovo rješenje usredotočeno je na SVG izvoz i rigoroznu dokumentaciju o prijenosu.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kolaž koji prikazuje isti QR kod raspoređen u pet različitih veličina, od značke do natpisa',
          caption: 'Jedan QR kod, pet veličina postavljanja: izazov održavanja mogućnosti skeniranja od centimetara do metara',
        },
      ],
    },
    {
      heading: 'Zašto su prethodni događaji imali problema',
      paragraphs: ['Na posljednjoj konferenciji tvrtka je doživjela neugodne neuspjehe. QR natpis na pozornici generiran je kao mali PNG i povećan u softveru za dizajn - rezultat je izgledao prihvatljivo iz daljine, ali nije uspio pouzdano skenirati iz publike. QR oznake značke bile su previše oblikovane i premale, što je frustriralo sudionike koji su pokušavali dodati kontakte. Nedosljedne postavke u različitim formatima značile su da je \'isti\' QR zapravo izgledao drugačije na svakom komadu.', 'Analiza nakon događaja otkrila je glavni uzrok: ne postoji jedinstveni izvor istine. Svaki je dizajner rekreirao QR s nešto drugačijim postavkama, a svaki je dobavljač ispisa drugačije obrađivao datoteke. Kvaliteta je degradirana kroz telefonsku igru ​​predaje datoteka.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografije izbliza koje pokazuju pogreške u skeniranju: pikselizirani banner moduli, premali kodovi bedževa, nedosljedan stil u svim formatima',
          caption: 'Forenzička analiza prethodnih neuspjeha događaja: svaki je format uveo različite probleme kvalitete',
        },
      ],
    },
    {
      heading: 'SVG-First Workflow',
      paragraphs: ['Za ovaj događaj tvrtka je uspostavila strogi protokol: jedan glavni QR generiran u ANQR-u s optimalnim postavkama (Ispravljanje pogrešaka H, velikodušna tiha zona, čist stil), izvezen kao SVG i pohranjen kao jedinstveni mjerodavni izvor. Veza za konfiguraciju ANQR-a dokumentirana je uz SVG datoteku kako bi se kôd mogao ponovno generirati ako je potrebno.', 'Svaki dizajner i dobavljač primili su isti SVG master s izričitim uputama: postavite na potrebnu veličinu, ne mijenjajte, održavajte mirnu zonu. Za dobavljače koji zahtijevaju rasterske formate, tvrtka je osigurala unaprijed generirane PNG-ove u određenim veličinama s jasnim konvencijama imenovanja koje pokazuju namjeravanu upotrebu.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Paket datoteka koji prikazuje SVG master, PNG-ove specifične za veličinu, specifikacijski dokument i vezu za konfiguraciju',
          caption: 'Paket primopredaje: sve što je dobavljačima bilo potrebno za postizanje dosljednih rezultata bez nagađanja',
        },
      ],
    },
    {
      heading: 'Razmatranja specifična za veličinu',
      paragraphs: ['Svaki je format zahtijevao posebnu pozornost. Umetci bedževa na 3 cm trebali su QR kako bi zauzeli maksimalan raspoloživi prostor - udaljenost skeniranja bila bi duljina ruke. Stolni šatori od 8 cm mogu uključivati ​​ukrasni okvir izvan mirne zone. Banner od 4 metra zahtijevao je izračun: s tipične udaljenosti publike (15-20 metara), moduli su morali biti jasno prepoznatljivi telefonskim kamerama, što je značilo da je QR trebao biti najmanje 80 cm unutar dizajna bannera.', 'Tvrtka je izradila vodič za određivanje veličine koji dokumentira minimalne QR dimenzije za svaku očekivanu udaljenost skeniranja. Ovo je postalo višekratno sredstvo za buduće događaje, uklanjajući nagađanja iz procesa dizajna.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Grafikon koji prikazuje odnos između udaljenosti skeniranja, minimalne veličine QR-a i dimenzija modula za svaki format događaja',
          caption: 'Matrica veličine: izračunate dimenzije koje osiguravaju pouzdano skeniranje na očekivanoj udaljenosti gledanja svakog formata',
        },
      ],
    },
    {
      heading: 'Rezultati proizvodnje',
      paragraphs: ['Provjera valjanosti dana konferencije bila je sustavna: osoblje je testiralo svaki postavljeni QR prije otvaranja vrata. Umetci značke odmah se skeniraju na udaljenosti ruke. Stolni šatori pouzdano su radili u promjenjivom osvjetljenju prostorija za odmor. Zastava na pozornici - sramota prethodnog događaja - uspješno je skenirana iz sredine prostora za publiku.', 'Zabilježeno je nula pritužbi skeniranja preko 2000+ sudionika. Operativna pobjeda bila je jednako značajna: kada je dodatak sponzora u posljednjem trenutku zahtijevao novi natpis, produkcijski tim ga je generirao iz glavnog SVG-a u nekoliko minuta, uvjeren da će odgovarati svemu ostalom.', 'Pogledajte vodič za učenje o QR kodovima spremnim za ispis za SVG naspram PNG okvira odlučivanja i najbolje prakse primopredaje.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografija događaja koja prikazuje sudionike kako uspješno skeniraju QR kodove različitih veličina i udaljenosti u cijelom prostoru',
          caption: 'Uspjeh dana konferencije: pouzdano skeniranje u svim formatima, od krupnih planova bedževa do snimaka udaljenih transparenta na pozornici',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Pregledajte članke Learna',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Studija slučaja: Digitalni zaslon u salonu zračne luke',
      paragraphs: ['Ovaj primjer prati salon zrakoplovne kompanije koji je koristio statične QR kodove na svojim digitalnim zaslonima dobrodošlice. Zasloni su prikazivali rotirajući promotivni sadržaj, ali QR kod za prijavu u salon bio je u kutu, statičan i lako ga se previdjelo. Analitika je pokazala da je samo 15% gostiju koji ispunjavaju uvjete koristilo QR prijavu unatoč tome što je bila brža od čekanja na stolu. Većina gostiju to jednostavno nije primijetila.', 'Hipoteza je bila jednostavna: u vizualno prometnom okruženju s pokretnim sadržajem, statični QR postaje nevidljiv. Rješenje je trebalo učiniti QR uočljivim bez ugrožavanja pouzdanosti potrebne za tijek prijave gdje bi neuspjeh značio frustrirane putnike i duže čekanje u redu.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Digitalni zaslon u čekaonici zračne luke koji prikazuje promotivni sadržaj s malim, statičnim QR kodom u kutu',
          caption: 'Izvorna postavka: statični QR izgubljen u moru dinamičnog promotivnog sadržaja, postižući samo 15% usvajanja',
        },
      ],
    },
    {
      heading: 'Dizajniranje sigurne animacije',
      paragraphs: ['Digitalno oglašavanje u salonu koristilo je velike LED ploče - izazovno okruženje u kojem bi agresivna animacija mogla stvoriti probleme pri skeniranju. Dizajnerski tim počeo je konzervativno: blagi pulsni efekt koji je suptilno proširio i suzio vizualnu prisutnost QR-a bez izmjene stvarne strukture koda. Vrijeme okvira postavljeno je sporo (250 ms) kako bi se izbjegli problemi s titranjem LED stope osvježavanja.', 'Provjera sigurnosnog načina rada potvrdila je da se svaki okvir može skenirati. Dodatno testiranje na stvarnim LED panelima otkrilo je da je puls trebao biti još suptilniji nego što je sugerirao pregled na radnoj površini - LED svjetlina i kutovi gledanja utjecali su na percipirani kontrast više od očekivanog.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Ploča s postavkama ANQR animacije koja prikazuje konfiguraciju pulsa: usporeno mjerenje vremena, suptilan intenzitet, omogućen Sigurni način',
          caption: 'Konfiguracija animacije: parametri podešeni za zaslon LED ploče uz održavanje pouzdanosti skeniranja u svakom okviru',
        },
      ],
    },
    {
      heading: 'Integracija sa sadržajem signalizacije',
      paragraphs: ['Animirani QR postavljen je u namjensku \'stabilnu zonu\' rasporeda zaslona - područje koje je ostalo konstantno dok se promotivni sadržaj okretao u glavnom području prikaza. Ovo odvajanje bilo je ključno: QR-u je bila potrebna vizualna stabilnost za skeniranje čak i dok je privlačio pozornost svojom suptilnom animacijom.', 'Pored QR-a dodan je jasan poziv na radnju: \'Preskočite red čekanja - skenirajte da biste se prijavili.\' Tekst je ostao statičan dok je QR pulsirao, stvarajući vizualnu hijerarhiju koja je privukla pogled na mogućnost skeniranja bez preopterećenja promotivnog sadržaja.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Dijagram izgleda zaslona koji prikazuje animirani QR u stabilnoj zoni dok se promotivni sadržaj rotira u glavnom području',
          caption: 'Raspodjela prostora na zaslonu: animirani QR zauzima stabilnu zonu odvojenu od rotirajućeg promotivnog sadržaja',
        },
      ],
    },
    {
      heading: 'Tehnička implementacija',
      paragraphs: ['Animirani QR je izvezen kao GIF s optimiziranim postavkama za CMS za označavanje. Razmatranje veličine datoteke bilo je važno - sustav upravljanja sadržajem u salonu imao je ograničenja za učitavanje, a prevelike datoteke uzrokovale su zastajkivanje reprodukcije. Konačni izvoz uravnotežio je vizualnu kvalitetu u odnosu na veličinu datoteke ograničavanjem palete boja i optimiziranjem broja okvira.', 'Implementacija je uključivala zamjenu: ako se GIF ne uspije reproducirati iz bilo kojeg razloga, sustav za označavanje prikazat će statičku sigurnosnu kopiju PNG-a. Ova zalihost osigurala je da mogućnost prijave nikada nije izgubljena zbog tehničkih problema s animacijom.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'CMS sučelje koje prikazuje animirani QR prijenos s konfiguriranom zamjenskom statičkom slikom',
          caption: 'Konfiguracija Signage CMS-a: animirani primarni sa statičkim rezervnim sustavom koji osigurava da se mogućnost prijave nikada ne prekida',
        },
      ],
    },
    {
      heading: 'Izmjereni utjecaj',
      paragraphs: ['Nakon mjesec dana rada, prihvaćanje QR prijave poraslo je s 15% na 24% - relativno poboljšanje od 60%. Ankete o povratnim informacijama gostiju pokazale su da je animirani QR \'lakše uočljiv\' i \'djelovao je modernije\'. Vrijeme čekanja u redu čekanja mjerljivo se smanjilo tijekom razdoblja najvećeg opterećenja jer se više gostiju samostalno posluživalo putem QR-a.', 'Važno je da nije zabilježen nijedan neuspjeh skeniranja unatoč tisućama dnevnih skeniranja. Konzervativni pristup animaciji postigao je cilj privlačenja pažnje bez žrtvovanja pouzdanosti koju je zahtijevao tijek prijave. Lounge je kasnije postavio slične animirane QR-ove na svoje druge lokacije.', 'Pogledajte vodič za učenje o animiranim QR kodovima za digitalno oglašavanje za tehnička načela koja stoje iza sigurnog dizajna animacije.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Nadzorna ploča koja prikazuje povećanje stope usvajanja, smanjenje vremena čekanja i pouzdanost skeniranja bez kvarova tijekom razdoblja implementacije',
          caption: 'Jedan mjesec podataka: povećanje usvajanja od 60%, smanjeno vrijeme čekanja i očuvana savršena pouzdanost skeniranja',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Pregledajte članke Learna',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Studija slučaja: QR kampanja za globalno lansiranje proizvoda',
      paragraphs: ['Ovaj primjer prati tvrtku potrošačke elektronike koja lansira novi proizvod istovremeno na 12 tržišta na 8 jezika. Svaki regionalni marketinški tim trebao je proizvesti ambalažu, maloprodajne izloške i promotivne materijale s QR kodovima koji povezuju na stranice lokaliziranih proizvoda. Prethodno lansiranje rezultiralo je nedosljednim QR stilom, povremenim neuspjesima skeniranja i \'telefonskom igrom\' promjene konfiguracije dok je svaki tim ponovno stvarao kodove iz snimaka zaslona.', 'Rješenje je iskoristilo ANQR-ove poveznice konfiguracije koje se mogu dijeliti kako bi se uspostavio jedinstveni izvor istine kojem je svaki regionalni tim mogao pristupiti, bez obzira na jezik sučelja. QR korisni teret koristio je pametno preusmjeravanje koje je detektiralo korisnički jezik, tako da je jedan kod radio globalno dok je pružao lokalizirana iskustva.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Karta svijeta koja prikazuje 12 tržnica s QR kodovima, od kojih su neke međusobno vizualno nedosljedne',
          caption: 'Izazov: 12 tržišta, 8 jezika i povijest nedosljednih QR implementacija u regijama',
        },
      ],
    },
    {
      heading: 'Uspostavljanje glavne konfiguracije',
      paragraphs: ['Tim za globalnu marku stvorio je mjerodavnu QR konfiguraciju u ANQR-u: boje robne marke koje odgovaraju vizualnom identitetu proizvodne linije, ispravljanje pogrešaka H za pouzdanost u svim ispisnim i digitalnim aplikacijama i stil koji bi se reproducirao dosljedno bez obzira na lokalne metode proizvodnje. Konfiguracija je zaključana, a veza za dijeljenje dokumentirana u sažetku globalne kampanje.', 'Kritično, kodirani URL koristio je uslugu preusmjeravanja koja otkriva jezik. Prilikom skeniranja korisnici su automatski preusmjereni na stranicu proizvoda na lokalnom jeziku. To je značilo da svih 12 tržišta može koristiti identične QR kodove - bez varijacija nosivosti po tržištu koje bi mogle dovesti do pogrešaka.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR sučelje koje prikazuje glavnu konfiguraciju s bojama marke, ECC H i pametnim URL-om za preusmjeravanje',
          caption: 'Glavna konfiguracija: globalni standardi robne marke kodirani u jedan izvor istine koji se može dijeliti',
        },
      ],
    },
    {
      heading: 'Tijek rada regionalnog tima',
      paragraphs: ['Svaki regionalni marketinški tim primio je poveznicu za konfiguraciju s jednostavnim uputama: otvorite vezu, provjerite odgovara li pregled smjernicama marke, izvezite u potreban format za svoju aplikaciju. ANQR sučelje prikazano je na preferiranom jeziku svakog tima, ali temeljne QR postavke ostale su identične bez obzira na jezik sučelja.', 'Kad je japanski tim trebao SVG za vrhunske maloprodajne zaslone, a brazilski PNG za društvene medije, oba su bila izvezena iz iste konfiguracije. Kada je dobavljač ispisa njemačkog tima zatražio određene vrijednosti boja, mogli su izravno referencirati konfiguraciju umjesto da pogađaju iz snimke zaslona.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Snimke zaslona koje prikazuju istu konfiguracijsku vezu otvorenu u japanskom, portugalskom i njemačkom sučelju',
          caption: 'Ista konfiguracija, različita sučelja: regionalni timovi rade na željenom jeziku dok održavaju globalnu dosljednost',
        },
      ],
    },
    {
      heading: 'Rukovanje regionalnim varijacijama',
      paragraphs: ['Neka su tržišta zahtijevala manje prilagodbe. Kineskom timu bila je potrebna verzija s okvirom optimiziranim za WeChat za društveno dijeljenje. Umjesto da modificiraju master, stvorili su dokumentiranu varijantu s vlastitom konfiguracijskom vezom, jasno označenu kao \'CN-WeChat varijanta\' u biblioteci sredstava kampanje. To je zadržalo sljedivost, a omogućilo potrebnu lokalizaciju.', 'Tim marke uspostavio je jednostavno pravilo: svaka varijacija u odnosu na master zahtijevala je novu, dokumentiranu konfiguracijsku vezu. Nema modifikacija izvezenih datoteka, nema \'brzih popravaka\' u softveru za dizajn. Time je spriječeno pomicanje konfiguracije koje je mučilo prethodna lansiranja.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Sučelje knjižnice imovine koje prikazuje glavnu konfiguraciju i odobrene regionalne varijante, svaka sa svojom vezom',
          caption: 'Upravljanje imovinom kampanje: glavna konfiguracija plus dokumentirane varijante, sve se može pratiti putem poveznica za konfiguraciju',
        },
      ],
    },
    {
      heading: 'Rezultati pokretanja',
      paragraphs: ['Na dan lansiranja proizvoda QR kodovi su postavljeni na pakiranjima, maloprodajnim izlozima, materijalima za događaje i digitalnim kampanjama na svih 12 tržišta istovremeno. Provjere kvalitete potvrdile su vizualnu dosljednost u svim regijama - QR na maloprodajnim zaslonima u Tokiju odgovarao je QR-u na pakiranju u São Paulu i QR-u na bannerima događaja u Berlinu.', 'Na svim tržištima nije zabilježen nijedan neuspjeh skeniranja. Kada je bila potrebna promjena URL-a stranice proizvoda nakon lansiranja, usluga preusmjeravanja to je učinila nevidljivo - nije bilo potrebno ponovno ispisivanje. Globalni tim procijenio je da je pristup konfiguracijskoj vezi uštedio 40+ sati vremena koordinacije u usporedbi s njihovom prethodnom metodologijom pokretanja.', 'Pogledajte vodič za učenje o međujezičnoj QR suradnji za načela tijeka rada koja stoje iza dosljednosti globalne kampanje.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Mreža fotografija koje pokazuju dosljednu implementaciju QR-a na različitim tržištima: maloprodaja u Tokiju, ambalaža u São Paulu, događaji u Berlinu',
          caption: 'Postignuta globalna dosljednost: identična QR prezentacija na 12 tržišta unatoč različitim jezicima, dobavljačima i formatima',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Pregledajte članke Learna',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Pregledajte članke Learna', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Otvorite cijeli korisnički priručnik', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otvorite galeriju', type: 'gallery' },
  ],
};
