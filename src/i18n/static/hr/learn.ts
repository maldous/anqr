import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Učite uz ANQR',
  description: 'Praktični, poslovni vodiči za pretvaranje QR kodova u stvarna marketinška sredstva - ne samo u funkcionalne kvadrate. Naučite kako nadograditi naslijeđene kodove prodajnih mjesta, izraditi usklađene QR natpise za plaćanje, pripremiti izvoze spremne za ispis, sigurno koristiti animaciju na digitalnim zaslonima i dijeliti zaključane konfiguracije među višejezičnim timovima koristeći ANQR ("sidro") veze.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Otvorite generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Pogledajte QR primjere', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otvorite cijeli korisnički priručnik', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Poboljšanje postojećih QR kampanja',
      paragraphs: ['Većina tvrtki ima QR kodove razasute po svojim poslovima - na jelovnicima, stalcima, pakiranjima i promotivnim materijalima. Mnogi od ovih kodova stvoreni su prije mnogo godina s osnovnim generatorima, što je rezultiralo generičkim crno-bijelim kvadratima koji ne ulijevaju povjerenje niti odgovaraju identitetu vaše marke. Ovaj sveobuhvatni vodič vodi vas kroz sustavan pristup reviziji, nadogradnji i optimizaciji vaše postojeće QR infrastrukture bez ometanja korisničkih putovanja koja ste već uspostavili.', 'Strateška prednost nadogradnje umjesto zamjene vaših QR kodova leži u očuvanju kontinuiteta. Vaši klijenti već su naučili očekivati ​​određena odredišta kada skeniraju vaše kodove. Održavanjem kodiranih URL-ova identičnim uz dramatično poboljšanje vizualne prezentacije, pouzdanosti skeniranja i usklađenosti robne marke, stvarate neprimjetan prijelaz koji povećava povjerenje bez potrebe za bilo kakvim promjenama vaše digitalne infrastrukture ili analitičkog praćenja.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Usporedna usporedba koja prikazuje izblijedjeli, generički QR kod pored moderne brendirane verzije koja kodira isti URL',
          caption: 'Prije i poslije: Isti odredišni URL transformiran iz zastarjelog generičkog koda u sredstvo profesionalne marke',
        },
      ],
    },
    {
      heading: 'Zašto naslijeđeni QR kodovi nisu uspješni',
      paragraphs: ['QR kodovi stvoreni tijekom rane faze usvajanja - osobito tijekom 2020.-2021. kada su tvrtke požurile implementirati beskontaktna rješenja - često pate od nekoliko kritičnih problema. Niske postavke ispravljanja pogrešaka čine ih lomljivima kada se ispisuju na teksturirane površine ili gledaju pod izazovnim osvjetljenjem. Nedovoljno tihe zone uzrokuju neuspjehe skeniranja kada su kodovi postavljeni blizu drugih vizualnih elemenata. Generički stil ne uspijeva komunicirati legitimitet marke, što dovodi do oklijevanja i smanjene stope skeniranja.', 'Osim tehničkih ograničenja, naslijeđeni kodovi često predstavljaju propuštene prilike za brendiranje. Svaki QR kod dodirna je točka s vašim korisnikom – trenutak u kojem su oni aktivno uključeni i voljni poduzeti radnju. Profesionalno oblikovan kod koji odgovara bojama vaše robne marke, uključuje odgovarajuće sigurnosne margine i sadrži izborne elemente robne marke pretvara ovaj uslužni program u marketinško sredstvo koje osnažuje vaš identitet pri svakoj interakciji.'],
    },
    {
      heading: 'Provođenje revizije QR koda',
      paragraphs: ['Započnite svoj projekt nadogradnje stvaranjem sveobuhvatnog popisa svakog QR koda koji je trenutno raspoređen u vašoj tvrtki. Dokumentirajte fizičku lokaciju, kodirano odredište, trenutno stanje ispisanog materijala i tipično okruženje za skeniranje uključujući uvjete osvjetljenja i kutove gledanja. Testirajte svaki kod s više uređaja - stariji pametni telefoni i jeftini uređaji često otkrivaju probleme s pouzdanošću koje premium telefoni maskiraju.', 'Obratite posebnu pozornost na kodove na mjestima s visokim ulozima: mjesta za plaćanje, područja za prijavu i promotivni zasloni gdje neuspjeh skeniranja izravno utječe na prihod ili korisničko iskustvo. Njima treba dati prioritet za trenutnu nadogradnju. Također imajte na umu kodove koji se pojavljuju na fotografijama ili videosadržajima jer će oni zahtijevati koordinaciju s vašim marketinškim timom za ažuriranje vizualnih sredstava.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Sučelje kontrolnog popisa koje prikazuje kategorije QR revizije: lokaciju, stanje, pouzdanost skeniranja i ocjenu prioriteta',
          caption: 'Predložak sustavne QR revizije za dokumentiranje i određivanje prioriteta vaših kandidata za nadogradnju',
        },
      ],
    },
    {
      heading: 'Strategija sigurne nadogradnje',
      paragraphs: ['Glavno pravilo QR nadogradnji je očuvanje odredišta. Izdvojite točan URL iz svakog postojećeg koda i kodirajte ga na identičan način u svojoj novoj verziji. To osigurava da sva postojeća analitika, logika preusmjeravanja i očekivanja korisnika ostaju netaknuti. Ako vam je potrebna fleksibilnost odredišta za buduća ažuriranja, ovo je idealno vrijeme za uvođenje brendiranog kratkog URL-a ili usluge preusmjeravanja - ali implementirajte ovo kao zaseban projekt kako biste izbjegli složene promjene.', 'Za vizualnu nadogradnju primijenite poboljšanja u slojevima: prvo osigurajte tehničku pouzdanost (odgovarajuće ispravljanje pogrešaka i tiha zona), zatim dodajte stil marke (boje, oblici modula) i na kraju razmislite o izbornim poboljšanjima (središnji slojevi, okviri). Svaki sloj treba potvrditi testiranjem prije nastavka. ANQR-ov Safety Mode pomaže u provedbi ovih prioriteta upozoravajući kada odabir stila može ugroziti mogućnost skeniranja.'],
    },
    {
      heading: 'Dodavanje identiteta marke bez ugrožavanja pouzdanosti',
      paragraphs: ['Učinkovito QR brendiranje uravnotežuje vizualni učinak i pouzdanost skeniranja. Započnite s bojom: zamijenite zadani crni prednji plan primarnom bojom robne marke, osiguravajući dovoljan kontrast u odnosu na pozadinu. Za većinu robnih marki najbolje funkcioniraju tamne boje na svijetlim podlogama. Izbjegavajte kombinacije niskog kontrasta, gradijente koji smanjuju jasnoću rubova ili boje koje izgledaju slično u uobičajenim uvjetima osvjetljenja.', 'Prilagodba oblika modula nudi još jednu mogućnost brendiranja s minimalnim utjecajem na pouzdanost. Zaobljeni moduli stvaraju mekši, pristupačniji izgled dok zadržavaju izvrsnu mogućnost skeniranja. Moduli u stilu točkica dobro funkcioniraju za moderne, tehnološki napredne marke. Povezani moduli odgovaraju industrijskim ili korporativnim identitetima. Koji god stil odabrali, održavajte dosljednost u svim svojim QR primjenama za trenutno prepoznavanje robne marke.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Dijagram kotača boja koji prikazuje optimalne QR kombinacije boja s indikatorima omjera kontrasta',
          caption: 'Vodič za odabir boja marke koji prikazuje kombinacije visokog kontrasta koje održavaju pouzdanost skeniranja',
        },
      ],
    },
    {
      heading: 'Protokol testiranja i provjere valjanosti',
      paragraphs: ['Nikada ne postavljajte nadograđene QR kodove bez rigoroznog testiranja. Ispišite fizički dokaz u točnoj veličini i na istom materijalu kao i vaša konačna implementacija. Testirajte na stvarnoj lokaciji gdje će se kod nalaziti, u različito doba dana kako biste uzeli u obzir varijacije osvjetljenja. Koristite najmanje tri različita uređaja: trenutni vodeći telefon, uređaj srednje klase i stariji ili jeftini pametni telefon.', 'Zabilježite vrijeme skeniranja i stopu uspješnosti za svaki test. Dobro optimiziran kod trebao bi se skenirati unutar 1-2 sekunde na bilo kojem razumno modernom uređaju. Ako vidite dosljedna kašnjenja ili kvarove, smanjite intenzitet stiliziranja - uklonite ili smanjite slojeve, povećajte veličinu tihe zone ili prebacite na višu razinu ispravljanja pogrešaka. Pouzdanost uvijek ima prednost pred vizualnom sofisticiranošću.'],
    },
    {
      heading: 'Zaključavanje vaše konfiguracije radi dosljednosti',
      paragraphs: ['Nakon što potvrdite optimalnu konfiguraciju, sačuvajte je pomoću ANQR poveznica koje se mogu dijeliti. Ovo stvara trajni zapis svake postavke korištene za generiranje vašeg odobrenog koda - boja, stila modula, ispravljanja pogrešaka, veličine i svih slojeva. Podijelite ovu vezu sa svojim dizajnerskim timom, dobavljačima ispisa i svima koji bi u budućnosti mogli reproducirati kod.', 'Ovo zaključavanje konfiguracije sprječava postupnu degradaciju koja muči mnoge QR implementacije. Bez toga, članovi osoblja ponovno stvaraju kodove iz snimaka zaslona, ​​dizajneri obnavljaju postavke iz memorije, a dobavljači ispisa rade \'korisne\' prilagodbe. Svaka varijacija predstavlja potencijalne probleme. Sa zaključanom konfiguracijskom vezom, svaka reprodukcija je identična vašem testiranom, odobrenom izvorniku.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Dijagram koji prikazuje pomak konfiguracije: snimke zaslona koje vode do rekreacija koje vode do varijanti, u odnosu na jednu vezu izvora istine',
          caption: 'Spriječite pomicanje konfiguracije uspostavljanjem jednog mjerodavnog izvora za sve QR reprodukcije',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Pogledajte QR primjere',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR kodovi za maloprodajna plaćanja',
      paragraphs: ['QR kodovi za plaćanje djeluju u najzahtjevnijem okruženju u maloprodaji: trenutku transakcije. Kupci su spremni platiti, često se iza njih formira red, a svaka sekunda kašnjenja stvara trvenje. Ipak, ovaj trenutak visokog pritiska također je glavna nekretnina za jačanje marke. Ovaj vodič objašnjava kako izraditi QR kodove za plaćanje koji se trenutačno skeniraju u bankarskim aplikacijama, a istovremeno predstavljaju profesionalan, brendirani izgled koji gradi povjerenje kupaca.', 'Temeljno načelo QR kodova za plaćanje je pouzdanost ispred estetike. Prekrasno dizajniran kod koji ne uspije skenirati bankovnu aplikaciju jednog klijenta koštat će vas mnogo više u napuštenim transakcijama i frustriranim klijentima nego što bi ikada mogao konzervativan dizajn. Započnite s usklađenošću, dodajte pouzdanost, a zatim pažljivo slojite markiranje samo tamo gdje to ne ugrožava primarnu funkciju.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Zaslon maloprodajnog pulta koji prikazuje QR kod plaćanja koji skenira pametni telefon s bankovnom aplikacijom',
          caption: 'QR kodovi za plaćanje moraju odmah funkcionirati s aplikacijama za bankarstvo i novčanik pod uvjetima šaltera u stvarnom svijetu',
        },
      ],
    },
    {
      heading: 'Razumijevanje QR standarda plaćanja',
      paragraphs: ['QR kodovi za plaćanje obično slijede regionalne standarde koji određuju format nosivosti. U Singapuru PayNow QR koristi specifično oblikovanje. U Indiji, UPI kodovi slijede BharatQR ili UPI standarde dubokih veza. Europska SEPA plaćanja koriste EPC QR kodove. Svaki standard postoji kako bi se osiguralo da bankarske aplikacije mogu odmah prepoznati i obraditi podatke o plaćanju. Odstupanje od ovih standarda - čak i malo - može uzrokovati da aplikacije za plaćanje odbiju kodove koje generički skeneri kamera čitaju bez problema.', 'ANQR uključuje predloške za glavne standarde plaćanja koji automatski formatiraju vaše podatke o trgovcu u usklađene sadržaje. Uvijek koristite ove predloške umjesto da ručno konstruirate nizove plaćanja, jer čak i manje pogreške u formatiranju mogu uzrokovati neuspjeh transakcija. Ako standard plaćanja u vašoj regiji nije dostupan kao predložak, potražite točne zahtjeve za formatiranje u tehničkoj dokumentaciji vašeg pružatelja usluga plaćanja.'],
    },
    {
      heading: 'Dimenzioniranje i postavljanje za pultove',
      paragraphs: ['QR kodovi na pultu suočavaju se s jedinstvenim fizičkim izazovima. Kupci skeniraju na udaljenosti ruke, često pod kutom, ponekad kroz zaštitu od kihanja ili vitrine. Gornja rasvjeta stvara blještave mrlje. Šifra se natječe s drugim neredom za pozornost i jasne vidike. Velikodušno odredite veličinu QR-a za plaćanje - preporučuje se najmanje 4-5 cm za većinu aplikacija na šalteru, povećavajući ga ako se kod nalazi iza stakla ili u slabo osvijetljenom prostoru.', 'Položaj je važan jednako kao i veličina. Postavite kôd na mjesto gdje korisnici mogu udobno držati svoj telefon bez blokiranja reda čekanja ili nespretnog pružanja ruke. Nagnite zaslon prema kupcu umjesto da ga položite ravno. Ako je moguće, upotrijebite mat laminaciju ili nereflektirajuće materijale za prikaz kako biste smanjili odsjaj od rasvjete iznad glave. Testirajte konačni položaj u različita doba dana kako biste uočili probleme s rasvjetom.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Dijagram koji prikazuje optimalne visine i kutove postavljanja QR-a za različite konfiguracije brojača',
          caption: 'Vodič za postavljanje pulta: optimalne visine, kutovi i udaljenosti za pouzdano skeniranje plaćanja',
        },
      ],
    },
    {
      heading: 'Konzervativno brendiranje za kodove plaćanja',
      paragraphs: ['Aplikacije za plaćanje manje opraštaju od generičkih skenera kamera. Mnoge bankarske aplikacije koriste starije, jednostavnije algoritme za čitanje QR-a optimizirane za brzinu, a ne za fleksibilnost. To znači da stil koji savršeno funkcionira s kamerom telefona možda neće uspjeti s određenim aplikacijama za plaćanje. Držite brendiranje konzervativnim: koristite boju svoje robne marke za prvi plan ako održava jak kontrast, ali izbjegavajte gradijente, teške preklapanja ili ukrasne elemente koji bi mogli ometati prepoznavanje.', 'Ako želite središnji logotip ili sloj, neka bude iznimno mali - ne više od 10-15% QR područja - i opsežno testirajte svaku aplikaciju za plaćanje koju bi vaši klijenti mogli koristiti. Mnoge tvrtke odlučuju se bez preklapanja posebno na kodovima plaćanja, rezervirajući taj stil za marketinške QR kodove gdje su zahtjevi pouzdanosti manje strogi. Posao koda za plaćanje je obrada transakcija, a ne vizualni dojam.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Usporedba koja pokazuje prihvatljive naspram rizičnih razina brendiranja za QR kodove plaćanja',
          caption: 'Spektar QR brendiranja plaćanja: od sigurnog konzervativnog stila do rizičnih dekorativnih pristupa',
        },
      ],
    },
    {
      heading: 'Razmatranja materijala i tiska',
      paragraphs: ['Fizički materijal za prikaz značajno utječe na pouzdanost skeniranja. Sjajna laminacija reflektira stropna svjetla izravno u kameru kupca. Materijali s teksturom mogu iskriviti rubove modula. Jeftin ispis može zamutiti sitne detalje. Za QR kodove plaćanja uložite u kvalitetu: koristite mat ili satensku laminaciju, osigurajte ispis visoke razlučivosti i zamijenite zaslone prije nego što pokažu da su istrošeni. Izgreban ili izblijedjeli kod plaćanja košta vas transakcija.', 'Uzmite u obzir trajnost i zamjenjivost zaslona. Zasloni se mogu dodirivati, pomicati, prskati i povremeno prevrnuti. Dizajnirajte svoj zaslonski sustav tako da se QR umetak može jednostavno zamijeniti bez zamjene cijelog stalka. Držite rezervne ispise spremnima, generirane iz vaše zaključane konfiguracijske veze, tako da se istrošeni kodovi mogu odmah zamijeniti.'],
    },
    {
      heading: 'Testiranje s aplikacijama za stvarno plaćanje',
      paragraphs: ['Generički skeneri kamera će dekodirati gotovo svaki razumno formatiran QR kod. Aplikacije za plaćanje su izbirljivije. Prije postavljanja QR koda za plaćanje, testirajte ga sa svakom aplikacijom za plaćanje koju bi vaši klijenti mogli koristiti. U okruženjima s više plaćanja to može značiti testiranje s više bankovnih aplikacija, digitalnih novčanika i platformi za plaćanje. Dokumentirajte koje ste aplikacije testirali i njihove verzije - aplikacije za plaćanje često se ažuriraju, a ažuriranje bi moglo promijeniti ponašanje skeniranja.', 'Testirajte u realnim uvjetima: stvarni zaslon, stvarno osvjetljenje, stvarna udaljenost skeniranja. Kod koji se trenutno skenira na vašem stolu mogao bi se boriti na pultu u 17 sati kada popodnevno sunce stvara blještavilo. Testirajte s najstarijim, najjeftinijim pametnim telefonom koji možete pronaći - ako pouzdano radi na jeftinom uređaju, radit će na svemu. Označite svako vrijeme skeniranja dulje od 2 sekunde za istraživanje i potencijalni redizajn.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Popis za provjeru testiranja koji prikazuje različite aplikacije za plaćanje, vrste uređaja i uvjete okruženja za provjeru',
          caption: 'Sveobuhvatna matrica QR testiranja plaćanja koja pokriva aplikacije, uređaje i čimbenike okoliša',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Pogledajte QR primjere',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'QR kodovi spremni za ispis: SVG naspram PNG',
      paragraphs: ['Razlika između QR koda koji se savršeno skenira i onog koji ne uspijeva često se svodi na to kako je izvezen i kako se njime rukovalo u tijeku rada ispisa. Ovaj vodič objašnjava kritične razlike između vektorskih (SVG) i rasterskih (PNG) formata, kada koristiti svaki od njih i kako predati QR umjetnička djela dizajnerima i dobavljačima ispisa na načine koji čuvaju pouzdanost skeniranja od posjetnica do reklamnih natpisa veličine panoa.', 'Proizvodnja ispisa uvodi varijable koje ne postoje na ekranu: nanošenje boje, teksturu supstrata, procese dorade i kumulativni učinak konverzije više datoteka. QR kod koji izgleda savršeno u vašem softveru za dizajn može izaći iz pisača s omekšanim rubovima, smanjenim kontrastom ili suptilno iskrivljenim modulima. Razumijevanje odabira formata i najbolje prakse tijeka rada sprječava ove tihe greške.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Uvećani prikaz koji uspoređuje vektorske QR module s oštrim rubovima u odnosu na rasterske module koji pokazuju artefakte piksela',
          caption: 'Vektor naspram rastera u mjerilu ispisa: razlika u preciznosti koja određuje pouzdanost skeniranja',
        },
      ],
    },
    {
      heading: 'Zašto je Vector (SVG) poželjan za ispis',
      paragraphs: ['SVG datoteke opisuju QR kodove kao matematičke oblike, a ne kao rešetke piksela. To znači da se kôd može skalirati na bilo koju veličinu - od naljepnice od 1 cm do natpisa od 10 metara - bez gubitka oštrine rubova. RIP (Raster Image Processor) pisača renderira vektore u prirodnoj razlučivosti izlaznog uređaja, osiguravajući da je svaki rub modula oštar koliko to hardver dopušta. Nema interpolacije, artefakata uklanjanja alijasa, nema akumuliranog zamućenja uslijed višestrukih operacija promjene veličine.', 'Osim skalabilnosti, SVG datoteke su robusnije u profesionalnim tijekovima rada. Oni preživljavaju povratna putovanja kroz softver za dizajn bez degradacije. Mogu se ispraviti boje bez ponovnog uzorkovanja. Čisto se ugrađuju u PDF datoteke za ispis spreman za tisak. Za sve aplikacije ispisa gdje je kvaliteta bitna, SVG bi trebao biti vaš zadani izvozni format.'],
    },
    {
      heading: 'Kada je PNG prihvatljiv',
      paragraphs: ['PNG postaje neophodan kada vaš tijek rada ili odredišna platforma ne podržava vektorske formate. Neke web platforme, CMS sustavi za označavanje i naslijeđeni tijek rada za ispis zahtijevaju rasterske slike. U tim slučajevima PNG može dobro funkcionirati - ali samo ako slijedite stroga pravila: izvozite u konačnoj fizičkoj veličini i razlučivosti, nikada ne povećavajte veličinu nakon izvoza i izbjegavajte kompresiju s gubitkom ili pretvorbu formata.', 'Kritično pravilo za PNG je izračunavanje potrebnih dimenzija piksela prije izvoza. Ako se vaš QR ispisuje na 5 cm i vaš pisač radi na 300 DPI, potrebno vam je približno 590 piksela. Izvezite u ovoj veličini ili većoj, a zatim smanjite ako je potrebno - nikada ne povećajte. Uključite ove informacije u svoj naziv datoteke ili metapodatke kako budući korisnici ne bi slučajno zloupotrijebili izvoz specifičan za veličinu.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Sučelje kalkulatora koje prikazuje odnos između fizičke veličine, DPI i potrebnih dimenzija piksela',
          caption: 'Kalkulator razlučivosti ispisa: određivanje minimalnih dimenzija u pikselima za vašu ciljanu veličinu ispisa',
        },
      ],
    },
    {
      heading: 'Objašnjene opcije ANQR izvoza',
      paragraphs: ['ANQR nudi nekoliko načina izvoza SVG koji odgovaraju različitim radnim procesima. Pravi vektorski način rada proizvodi čisti ispis temeljen na putanji, idealan za alate za ispis i profesionalni dizajn. Kada ste dodali rasterske preklapanja ili određene efekte, ANQR ih može ugraditi uz zadržavanje vektorskih modula ili možete izvesti potpuno rasteriziranu verziju u svojoj navedenoj razlučivosti. Razumijevanje ovih opcija pomaže vam odabrati pravi izvoz za svaki slučaj upotrebe.', 'Za PNG izvoze, ANQR vam omogućuje da odredite točne dimenzije i uključuje opcije za prozirne pozadine. Postavka DPI pomaže vam izračunati odgovarajuće veličine za ispis, ali zapamtite da je DPI metapodatak - ono što je važno za ispis je imati dovoljno piksela za vašu fizičku veličinu. Ako ste u nedoumici, izvozite više nego što mislite da vam je potrebno; smanjivanje čuva kvalitetu dok ga povećavanje uništava.'],
    },
    {
      heading: 'Priprema datoteka za Handoff',
      paragraphs: ['Prilikom prosljeđivanja QR umjetničkih djela dizajnerima ili dobavljačima ispisa, uključite jasne specifikacije: predviđenu fizičku veličinu, minimalne zahtjeve za tihu zonu i sva razmatranja prostora boja. Za kritične aplikacije osigurajte SVG glavnu i PNG sigurnosnu kopiju visoke razlučivosti, jasno označene njihovom namjenom. Uključite vezu za konfiguraciju ANQR-a kako bi se kôd mogao ponovno generirati ako je potrebno.', 'Predvidite uobičajene pogreške u procesu primopredaje. Izričito navedite da se QR ne smije skalirati, rotirati, iskrivljavati niti primjenjivati ​​efekte. Navedite da tiha zona mora ostati čista - bez zadiranja oznaka izrezivanja, registracijskih oznaka ili elemenata dizajna. Ako će QR biti postavljen na pozadinu u boji ili fotografiju, osigurajte verziju s neprozirnom podlogom kako biste osigurali odgovarajući kontrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Dijagram paketa datoteka koji prikazuje SVG master, PNG sigurnosnu kopiju, dokument sa specifikacijama i vezu za konfiguraciju',
          caption: 'Profesionalni QR handoff paket: sve što dizajneru ili prodavaču ispisa treba za točnu reprodukciju',
        },
      ],
    },
    {
      heading: 'Provjera probnih ispisa',
      paragraphs: ['Nikada nemojte odobriti nakladu bez skeniranja fizičkog otiska. Zatražite otisak otisnut na stvarnoj podlozi sa stvarnom završnom obradom koja će se koristiti u proizvodnji. Skenirajte otisak pod uvjetima osvjetljenja sličnim onima gdje će biti prikazan konačni komad. Testirajte s više uređaja, uključujući starije pametne telefone koji bi mogli imati problema s marginalnom kvalitetom.', 'Ako se dokaz skenira sporo ili nedosljedno, istražite prije odobravanja. Uobičajeni problemi uključuju nedovoljan kontrast na podlogama u boji, kršenje tihe zone zbog podrezivanja, rubove modula za omekšavanje širenja tinte ili laminaciju koja stvara odsjaj. Bilo koji od njih može se riješiti prije nego što se posveti punoj nakladi - ali samo ako ih uhvatite u fazi probnog ispisa.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Kontrolni popis za pregled dokaza s rezultatima testiranja skeniranja, mjerenjima kontrasta i potpisima odobrenja',
          caption: 'Radni tijek provjere probnog ispisa: sustavno testiranje prije nego što se posveti proizvodnim količinama',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Pogledajte QR primjere',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Stvaranje animiranih QR kodova',
      paragraphs: ['Animirani QR kodovi kombiniraju funkcionalnost standardnih QR kodova s privlačnim pokretima koji dramatično povećavaju stope angažmana. U digitalnom natpisu, društvenim medijima i interaktivnim zaslonima, animacija pretvara statičnu uslužnost u uvjerljiv vizualni element koji privlači poglede i poziva na interakciju. Ovaj vodič pokriva načela, tehnike i praktična ograničenja stvaranja animiranih QR kodova koji se pouzdano skeniraju, a istovremeno stvaraju vizualni učinak.', 'Temeljni izazov animiranih QR kodova je balansiranje između vizualnog interesa i pouzdanosti skeniranja. Svaki okvir mora se pojedinačno skenirati - skener može uhvatiti kod u bilo kojem trenutku u ciklusu animacije. Ovo ograničenje oblikuje svaku dizajnersku odluku: koji se elementi mogu kretati, koliko se mogu mijenjati i što mora ostati stabilno tijekom cijele animacije.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Zaslon za digitalno oglašavanje koji prikazuje animirani QR kod koji privlači pozornost gledatelja u javnom prostoru',
          caption: 'Animirani QR kodovi u digitalnom natpisu: pokret koji privlači pozornost i potiče na skeniranje',
        },
      ],
    },
    {
      heading: 'Kako animacija utječe na mogućnost skeniranja',
      paragraphs: ['QR skeneri rade tako da hvataju jedan kadar i analiziraju uzorak svijetlih i tamnih modula. Da bi animirani kod funkcionirao, svaki okvir mora sadržavati potpuni, valjani QR uzorak. Ovo isključuje animacije koje mijenjaju strukturu koda, rastvaraju module ili značajno mijenjaju uzorak kontrasta. Moduli za prijenos podataka - naizgled nasumični uzorak u središtu - moraju ostati vizualno stabilni tijekom cijele.', 'Sigurni pristupi animaciji mijenjaju elemente koji ne nose podatke: pozadine, boje, ukrasne okvire i elemente preklapanja. Strukturne komponente - obrasci tražila (veliki kutni kvadrati), vremenski obrasci (izmjenične linije) i obrasci poravnanja (manji kvadrati u većim kodovima) - moraju zadržati svoje položaje i proporcije. Rad unutar ovih ograničenja još uvijek omogućuje iznenađujuće dinamične i zanimljive animacije.'],
    },
    {
      heading: 'Tehnike animacije koje funkcioniraju',
      paragraphs: ['Izmjena boja animira boje prednjeg i pozadinskog plana kroz paletu uz održavanje dovoljnog kontrasta u svakom koraku. Ovo stvara živopisan efekt koji privlači pažnju uz minimalan rizik skeniranja - sve dok kontrast nikada ne padne ispod čitljivih razina. ANQR-ove unaprijed postavljene postavke ciklusa boja dizajnirane su za održavanje mogućnosti skeniranja tijekom ciklusa.', 'Animirani slojevi postavljaju pokretne slike iza poluprozirnog QR uzorka. Kod ostaje stabilan dok se pozadina animira - možda video koji se ponavlja, animirani elementi robne marke ili apstraktna pokretna grafika. Ova tehnika zahtijeva pažljivo upravljanje intenzitetom kako bi se spriječilo da pozadina preplavi QR uzorak, ali stvara vizualno najupečatljivije rezultate.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Dijagram koji prikazuje slojevitu strukturu animiranog QR: sloja stabilnog koda preko animiranog pozadinskog sloja',
          caption: 'Načelo slojevitosti animacije: QR uzorak ostaje konstantan dok se pozadinski elementi animiraju ispod',
        },
      ],
    },
    {
      heading: 'Konfiguriranje parametara animacije',
      paragraphs: ['Broj sličica u sekundi utječe i na vizualnu glatkoću i na veličinu datoteke. Za većinu aplikacija, 10-15 sličica u sekundi omogućuje glatko kretanje bez prevelike veličine datoteke. Veći broj sličica u sekundi nudi smanjeni vizualni povrat uz značajno povećanje veličine datoteke. Razmotrite kontekst isporuke - veliki digitalni natpis može obraditi veće datoteke od položaja mobilnog oglasa.', 'Ponašanje petlje određuje ciklus animacije. Bešavne petlje stvaraju kontinuirano kretanje idealno za natpise i ambijentalne zaslone. Ping-pong petlje (naprijed-zatim-natrag) dobro funkcioniraju za jednostavne animacije. Za pulseve koji privlače pažnju, razmislite o animacijama sa zadržavanjem - razdobljima mirovanja isprekidanim pokretom koji privlači poglede bez stalnog umora od kretanja.'],
    },
    {
      heading: 'Stvaranje animiranih slojeva',
      paragraphs: ['Kada koristite animirane slike (GIF-ove, animirane WebP-ove ili video) kao slojeve, ANQR izdvaja okvire i spaja ih s vašim QR kodom. Postavka intenziteta preklapanja kontrolira koliko se animacija prikazuje - niže vrijednosti daju prednost preglednosti, dok više vrijednosti favoriziraju vizualni dojam. Testirajte svoj odabrani intenzitet u više okvira kako biste osigurali dosljednu mogućnost skeniranja.', 'Kvaliteta izvornog materijala značajno utječe na rezultate. Koristite slojeve s jasnim subjektima i dobrim kontrastom. Izbjegavajte izvorne animacije s brzim bljeskanjem ili ekstremnim promjenama svjetline koje bi mogle stvoriti povremene okvire niskog kontrasta. Pregledajte cijeli ciklus animacije prije izvoza kako biste uhvatili sve problematične okvire koji možda neće uspjeti skenirati.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Prikaz kadar po kadar animiranog preklapanja koji prikazuje razine kontrasta održane u nizu',
          caption: 'Analiza okvira: provjera dosljedne mogućnosti skeniranja kroz cijeli ciklus animacije',
        },
      ],
    },
    {
      heading: 'Razmatranja izvoza i isporuke',
      paragraphs: ['GIF ostaje najšire podržani animirani format, koji se automatski reproducira u većini konteksta bez potrebe za podrškom za video player. Međutim, GIF-ova paleta od 256 boja ograničava vjernost boja. Za animacije koje su važne za boje, razmislite o animiranom WebP-u ako je podržan ili se vratite na video formate za najvišu kvalitetu. ANQR-ov izvoz GIF-ova uključuje opcije ditheringa za maksimiziranje kvalitete unutar ograničenja palete.', 'Veličina datoteke bitna je za isporuku. Sustavi digitalnog označavanja, klijenti e-pošte i društvene platforme često nameću ograničenja veličine. Ako vaša animacija premašuje ta ograničenja, smanjite broj okvira, dimenzije ili dubinu boje. Ponekad se dijeljenjem složene animacije u kraću petlju postižu bolji rezultati od agresivne kompresije koja degradira svaki kadar.'],
    },
    {
      heading: 'Testiranje animiranih QR kodova',
      paragraphs: ['Testiranje animiranih kodova zahtijeva skeniranje u više točaka u ciklusu animacije. Nemojte skenirati samo jednom i pretpostaviti uspjeh - skenirajte više puta, u različitim trenucima, kako biste provjerili je li svaki okvir čitljiv. Obratite posebnu pozornost na okvire na ekstremima ciklusa boja ili vrhove intenziteta preklapanja gdje bi kontrast mogao biti najniži.', 'Testirajte na stvarnom hardveru zaslona gdje je to moguće. Kalibracija boje monitora, kut gledanja i ambijentalno osvjetljenje utječu na to kako se animacija pojavljuje i skenira. Svijetla animacija koja se savršeno skenira na vašem monitoru može izblijediti na vanjskom zaslonu ili postati nečitljiva pod kosim kutovima gledanja.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Matrica testiranja koja prikazuje stope uspješnosti skeniranja u različitim okvirima, uređajima i uvjetima prikaza',
          caption: 'Protokol testiranja animiranog QR-a: sustavna provjera preko okvira, uređaja i uvjeta gledanja',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Pogledajte QR primjere',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Najbolje prakse QR sigurnosti i usklađenosti',
      paragraphs: ['Lijepo dizajniran QR kod koji se ne uspije skenirati gori je od beskorisnog - frustrira kupce, šteti percepciji robne marke i uzalud troši svaki resurs uložen u njegovu izradu i distribuciju. Ovaj vodič pokriva tehničke i praktične čimbenike koji određuju hoće li se QR kod pouzdano skenirati i kako koristiti sigurnosne značajke ANQR-a za otkrivanje potencijalnih problema prije nego što dođu do proizvodnje.', 'Pouzdanost QR koda nije binarna. Kod bi mogao savršeno skenirati na vodećim telefonima, ali ne bi uspio na jeftinim uređajima. Može raditi pri idealnom osvjetljenju, ali se muči u prigušenim restoranima ili jakom sunčevom svjetlu. Razumijevanje čimbenika koji utječu na mogućnost skeniranja pomaže vam da napravite informirane kompromise između vizualnog stila i pouzdanosti u stvarnom svijetu.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Spektar pouzdanosti koji prikazuje QR kodove u rasponu od visoko čitljivih do rubno čitljivih',
          caption: 'Spektar mogućnosti skeniranja: od neprobojnih kodova do stila koji pomiče granice pouzdanosti',
        },
      ],
    },
    {
      heading: 'Razumijevanje razina ispravljanja pogrešaka',
      paragraphs: ['QR kodovi uključuju ugrađenu redundantnost koja im omogućuje čitanje čak i kad su djelomično oštećeni ili zaklonjeni. Razina ispravljanja pogreške - L (7%), M (15%), Q (25%) ili H (30%) - određuje koliko koda može nedostajati dok se i dalje ispravno dekodira. Veća korekcija pogrešaka stvara veće kodove, ali pruža sigurnosnu granicu za slojeve, nesavršenosti ispisa i štetu okolišu.', 'Za kodove sa slikovnim preklapanjem, bitna je razina ispravljanja pogrešaka H - preklapanje fizički zaklanja dio koda, a potrebno vam je tih 30% redundantnosti za održavanje pouzdanosti. Za čiste kodove bez stila u kontroliranim okruženjima često je dovoljna razina M. Razina L trebala bi biti rezervirana za situacije u kojima je veličina koda kritično ograničena i možete jamčiti netaknute uvjete.'],
    },
    {
      heading: 'Kritična tiha zona',
      paragraphs: ['Tiha zona je prazna margina koja okružuje svaki QR kod. Skeneri koriste ovu granicu kako bi identificirali gdje kod počinje i završava. ISO standard navodi minimalnu tihu zonu od četiri modula (četiri puta širine najmanjeg kvadrata u kodu). Narušavanje ovog prostora - elementima dizajna, skraćivanjem rubova ili susjednim sadržajem - jedan je od najčešćih uzroka neuspjeha skeniranja.', 'Provedba tihe zone ANQR-a pomaže u održavanju ovog kritičnog razmaka, ali također morate osigurati da bude sačuvan u vašim konačnim dizajnima. Prilikom predaje QR umjetničkih djela, izričito navedite zahtjeve za tihu zonu. Prilikom postavljanja kodova u rasporede, provjerite da nijedan element ne ulazi u ovaj prostor. Nekoliko milimetara slobodnog prostora može značiti razliku između pouzdanog skeniranja i frustriranih kupaca.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Dijagram koji prikazuje točan razmak tihe zone u odnosu na uobičajene prekršaje koji uzrokuju neuspjehe skeniranja',
          caption: 'Zahtjevi za tihu zonu: nevidljiva margina koja određuje uspjeh skeniranja',
        },
      ],
    },
    {
      heading: 'Kontrast i sigurnost boja',
      paragraphs: ['QR skeneri otkrivaju uzorak svijetlih i tamnih modula. Svaki stil koji smanjuje ovaj kontrast - svijetli prednji plan, tamna pozadina, efekti gradijenta ili slojevi niske neprozirnosti - čini kôd težim za čitanje. ANQR izračunava omjere kontrasta i upozorava kada se vaš izbor boja približi opasnim razinama, ali konačni je arbitar uvijek testiranje u stvarnom svijetu.', 'Percepcija boja ovisi o uvjetima osvjetljenja. Kombinaciju boja koja se na vašem monitoru čini visokokontrastnom može postati teško razlikovati pod toplim svjetlom sa žarnom niti ili hladnim fluorescentnim cijevima. Ako će se vaš kôd primijeniti u različitim uvjetima osvjetljenja, testirajte pod višestrukim izvorima svjetla i uzmite u obzir konzervativnije omjere kontrasta kao sigurnosnu marginu.'],
    },
    {
      heading: 'Veličina modula i udaljenost gledanja',
      paragraphs: ['Fizička veličina pojedinačnih modula određuje najveću udaljenost s koje se kod može skenirati. Manji moduli znače manje kodove, ali zahtijevaju manje udaljenosti skeniranja. Opće pravilo je da svaki modul treba biti najmanje 0,5 mm na predviđenoj udaljenosti skeniranja, proporcionalno povećavajući za veće udaljenosti. Kod na jumbo plakatu zahtijeva puno veće module od koda na posjetnici.', 'Kada izračunavate veličinu modula, uzmite u obzir najgori mogući scenarij: kupac sa starijim telefonom, pri nesavršenom osvjetljenju, skenira na najvećoj vjerojatnoj udaljenosti. Dizajnirajte za ovog korisnika, a svi ostali će imati još bolje iskustvo. ANQR-ove preporuke za veličinu uzimaju u obzir te varijable iz stvarnog svijeta kako bi predložile odgovarajuće dimenzije za vašu namjeravanu upotrebu.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Tablica koja se odnosi na veličinu modula, dimenzije ispisa i najveću efektivnu udaljenost skeniranja',
          caption: 'Vodič za udaljenost skeniranja: usklađivanje veličine modula s vašim zahtjevima za postavljanje',
        },
      ],
    },
    {
      heading: 'Korištenje ANQR sigurnosnog načina rada',
      paragraphs: ['ANQR-ov Safety Mode pruža povratne informacije o pouzdanosti skeniranja u stvarnom vremenu. Prati omjere kontrasta, usklađenost tihe zone, intenzitet preklapanja i druge čimbenike koji utječu na mogućnost skeniranja. Kada se bilo koji parametar približi rizičnim razinama, vidjet ćete upozorenja s posebnim uputama o tome kako poboljšati pouzdanost. Za profesionalne implementacije gdje je neuspjeh skup, držite Safety Mode aktivnim tijekom cijelog procesa dizajna.', 'Safety Mode također uključuje značajku provjere skeniranja koja pokušava dekodirati vaš generirani kod i izvještava o uspjehu ili neuspjehu. Iako ova provjera unutar aplikacije ne može replicirati sve uvjete u stvarnom svijetu, ona otkriva mnoge uobičajene probleme prije nego što uložite u ispis ili distribuciju. Tretirajte uspješnu verifikaciju kao minimalnu granicu, a ne jamstvo - testiranje u stvarnom svijetu ostaje ključno.'],
    },
    {
      heading: 'Protokoli testiranja u stvarnom svijetu',
      paragraphs: ['Nikakva provjera softvera ne zamjenjuje fizičko testiranje. Ispišite svoj kod u željenoj veličini na reprezentativnom materijalu. Testirajte ga u stvarnom okruženju primjene s uvjetima osvjetljenja koji odgovaraju stvarnoj uporabi. Skenirajte s više uređaja - ne samo s vašim vodećim telefonom, već i s jeftinim Android uređajima, starijim iPhoneima i svim specifičnim uređajima koje vaša publika obično koristi.', 'Sustavno dokumentirajte svoje testiranje. Zabilježite koji su uređaji testirani, pod kojim uvjetima, s kojim rezultatima. Ako implementirate kodove u većem broju, uspostavite kriterije prihvatljivosti: možda 95% uspješnosti u testnom skupu uređaja ili uspješna skeniranja unutar 2 sekunde na svim testiranim uređajima. Ovi standardi pomažu da odluke o ići/ne idi budu objektivne, a ne da se nadamo najboljem.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Sveobuhvatan kontrolni popis za testiranje koji pokriva uređaje, uvjete i kriterije prihvaćanja',
          caption: 'Protokol testiranja postavljanja QR-a: sustavna provjera prije predaje proizvodnje',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Otvorite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Pogledajte QR primjere',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Pogledajte QR primjere', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Otvorite cijeli korisnički priručnik', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Otvorite galeriju', type: 'gallery' },
  ],
};
