import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Učite se z ANQR',
  description: 'Praktični, poslovni priročniki za spreminjanje kod QR v resnična tržna sredstva - ne le v funkcionalne kvadratke. Naučite se nadgraditi podedovane kode prodajnih mest, ustvariti združljive QR znake za plačila, pripraviti izvoze, pripravljene za tiskanje, varno uporabljati animacijo na digitalnih zaslonih in deliti zaklenjene konfiguracije med večjezičnimi ekipami z uporabo povezav ANQR (»sidrnih«).',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Odprite generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Oglejte si primere QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Odprite celoten uporabniški priročnik', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Izboljšanje obstoječih kampanj QR',
      paragraphs: ['Večina podjetij ima kode QR razpršene po svojih dejavnostih – na menijih, stojalih, embalaži in promocijskih materialih. Mnoge od teh kod so bile ustvarjene pred leti z osnovnimi generatorji, rezultat pa so generični črno-beli kvadratki, ki ne vzbujajo zaupanja ali se ujemajo z identiteto vaše blagovne znamke. Ta izčrpen vodnik vas vodi skozi sistematičen pristop k reviziji, nadgradnji in optimizaciji vaše obstoječe infrastrukture QR, ne da bi motili poti strank, ki ste jih že vzpostavili.', 'Strateška prednost nadgradnje namesto zamenjave vaših kod QR je v ohranjanju kontinuitete. Vaše stranke so se že naučile pričakovati določene destinacije, ko skenirajo vaše kode. Z ohranjanjem enakih kodiranih URL-jev, hkrati pa dramatično izboljšate vizualno predstavitev, zanesljivost skeniranja in usklajenost z blagovno znamko, ustvarite brezhiben prehod, ki poveča zaupanje, ne da bi morali spreminjati svojo digitalno infrastrukturo ali analitično sledenje.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Vzporedna primerjava, ki prikazuje obledelo, generično kodo QR poleg sodobne različice blagovne znamke, ki kodira isti URL',
          caption: 'Prej in potem: Isti ciljni URL, preoblikovan iz zastarele generične kode v sredstvo profesionalne blagovne znamke',
        },
      ],
    },
    {
      heading: 'Zakaj stare kode QR delujejo premalo',
      paragraphs: ['Kode QR, ustvarjene v zgodnji fazi uvajanja – zlasti v letih 2020–2021, ko so podjetja hitela z uvedbo brezstičnih rešitev – pogosto trpijo zaradi številnih kritičnih težav. Nizke nastavitve popravljanja napak jih naredijo krhke pri tiskanju na teksturirane površine ali gledanju pod zahtevno svetlobo. Nezadostna tiha območja povzročajo napake pri skeniranju, ko so kode nameščene blizu drugih vizualnih elementov. Generično oblikovanje ne sporoča legitimnosti blagovne znamke, kar vodi v obotavljanje in zmanjšano število pregledov.', 'Poleg tehničnih omejitev podedovane kode pogosto predstavljajo zamujene priložnosti za blagovno znamko. Vsaka koda QR je stična točka z vašo stranko – trenutek, ko je aktivno vključena in pripravljena ukrepati. Profesionalno oblikovana koda, ki se ujema z barvami vaše blagovne znamke, vključuje ustrezne varnostne rezerve in vsebuje neobvezne elemente blagovne znamke, spremeni ta pripomoček v marketinško sredstvo, ki krepi vašo identiteto pri vsaki interakciji.'],
    },
    {
      heading: 'Izvajanje revizije kode QR',
      paragraphs: ['Začnite projekt nadgradnje z ustvarjanjem celovitega popisa vsake kode QR, ki je trenutno nameščena v vašem podjetju. Dokumentirajte fizično lokacijo, kodirano destinacijo, trenutno stanje natisnjenega materiala in tipično okolje skeniranja, vključno s svetlobnimi pogoji in koti gledanja. Preizkusite vsako kodo z več napravami – starejši pametni telefoni in nizkocenovne naprave pogosto razkrijejo težave z zanesljivostjo, ki jih vrhunski telefoni prikrivajo.', 'Posebej bodite pozorni na kode na lokacijah z visokimi vložki: plačilna mesta, območja za prijavo in promocijski zasloni, kjer napaka skeniranja neposredno vpliva na prihodke ali izkušnjo strank. Tem je treba dati prednost za takojšnjo nadgradnjo. Upoštevajte tudi kode, ki se pojavljajo v fotografski ali video vsebini, saj bodo te zahtevale usklajevanje z vašo marketinško ekipo za posodobitev vizualnih sredstev.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Vmesnik kontrolnega seznama, ki prikazuje kategorije revizije QR: lokacija, stanje, zanesljivost skeniranja in prednostna ocena',
          caption: 'Predloga za sistematično revizijo QR za dokumentiranje in določanje prednosti vaših kandidatov za nadgradnjo',
        },
      ],
    },
    {
      heading: 'Strategija varne nadgradnje',
      paragraphs: ['Glavno pravilo nadgradenj QR je ohranjanje cilja. Izvlecite natančen URL iz vsake obstoječe kode in ga enako kodirajte v svoji novi različici. To zagotavlja, da vsa obstoječa analitika, logika preusmeritve in pričakovanja strank ostanejo nedotaknjeni. Če potrebujete prilagodljivost cilja za prihodnje posodobitve, je to idealen čas za uvedbo kratkega URL-ja z blagovno znamko ali storitve preusmeritve – vendar to implementirajte kot ločen projekt, da se izognete sestavljenim spremembam.', 'Za vizualno nadgradnjo uporabite izboljšave v plasteh: najprej zagotovite tehnično zanesljivost (ustrezen popravek napak in tiho območje), nato dodajte slog blagovne znamke (barve, oblike modulov) in na koncu razmislite o opcijskih izboljšavah (sredinske prekrivke, okvirji). Vsako plast je treba pred nadaljevanjem potrditi s testiranjem. Varnostni način ANQR pomaga uveljavljati te prednostne naloge tako, da opozori, ko bi lahko izbire stilov ogrozile preglednost.'],
    },
    {
      heading: 'Dodajanje identitete blagovne znamke brez ogrožanja zanesljivosti',
      paragraphs: ['Učinkovita blagovna znamka QR uravnoteži vizualni učinek in zanesljivost skeniranja. Začnite z barvo: zamenjajte privzeto črno ospredje s svojo primarno barvo blagovne znamke in tako zagotovite zadosten kontrast glede na ozadje. Pri večini blagovnih znamk se najbolje obnesejo temne barve na svetlem ozadju. Izogibajte se kombinacijam z nizkim kontrastom, prelivom, ki zmanjša jasnost robov, ali barvam, ki so videti podobne v običajnih svetlobnih pogojih.', 'Prilagoditev oblike modula ponuja še eno priložnost za blagovno znamko z minimalnim vplivom na zanesljivost. Zaobljeni moduli ustvarjajo mehkejši, bolj dostopen videz, hkrati pa ohranjajo odlično možnost skeniranja. Moduli v obliki pik so primerni za sodobne, tehnološko napredne znamke. Povezani moduli ustrezajo industrijskim ali korporativnim identitetam. Ne glede na slog, ki ga izberete, ohranite doslednost v vseh svojih uvedbah QR za takojšnjo prepoznavnost blagovne znamke.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Diagram barvnega kolesa, ki prikazuje optimalne barvne kombinacije QR z indikatorji kontrastnega razmerja',
          caption: 'Vodnik za izbiro barv blagovne znamke, ki prikazuje visokokontrastne kombinacije, ki ohranjajo zanesljivost skeniranja',
        },
      ],
    },
    {
      heading: 'Protokol testiranja in validacije',
      paragraphs: ['Nikoli ne uvajajte nadgrajenih kod QR brez strogega testiranja. Natisnite fizični poskus v natančni velikosti in na istem materialu kot vaša končna uvedba. Preizkusite na dejanski lokaciji, kjer bo koda živela, ob različnih urah dneva, da upoštevate razlike v osvetlitvi. Uporabite vsaj tri različne naprave: trenutno vodilni telefon, napravo srednjega razreda in starejši ali poceni pametni telefon.', 'Zabeležite čas skeniranja in stopnjo uspešnosti za vsak test. Dobro optimizirana koda bi morala skenirati v 1-2 sekundah na kateri koli razumno sodobni napravi. Če opažate dosledne zamude ali napake, zmanjšajte intenzivnost oblikovanja – odstranite ali skrčite prekrivke, povečajte velikost tihega območja ali preklopite na višjo raven odpravljanja napak. Zanesljivost ima vedno prednost pred vizualno prefinjenostjo.'],
    },
    {
      heading: 'Zaklepanje vaše konfiguracije za doslednost',
      paragraphs: ['Ko potrdite optimalno konfiguracijo, jo ohranite s povezavami ANQR za skupno rabo. To ustvari trajen zapis vseh nastavitev, uporabljenih za ustvarjanje vaše odobrene kode – barv, sloga modula, popravka napak, velikosti in morebitnih prekrivanj. Dajte to povezavo v skupno rabo s svojo oblikovalsko skupino, prodajalci tiskanja in vsemi, ki bodo morda morali reproducirati kodo v prihodnosti.', 'To zaklepanje konfiguracije preprečuje postopno degradacijo, ki pesti številne uvedbe QR. Brez tega uslužbenci poustvarijo kode iz posnetkov zaslona, ​​oblikovalci obnovijo nastavitve iz pomnilnika, prodajalci tiskalnikov pa naredijo "koristne" prilagoditve. Vsaka različica predstavlja morebitne težave. Z zaklenjeno konfiguracijsko povezavo je vsaka reprodukcija enaka vašemu testiranemu, odobrenemu izvirniku.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Diagram, ki prikazuje premik konfiguracije: posnetki zaslona, ki vodijo do rekreacij, ki vodijo do različic, v primerjavi z eno samo povezavo vira resnice',
          caption: 'Preprečite zamik konfiguracije z vzpostavitvijo enega verodostojnega vira za vse reprodukcije QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Oglejte si primere QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR kode za maloprodajna plačila',
      paragraphs: ['Plačilne QR kode delujejo v najzahtevnejšem okolju v maloprodaji: v trenutku transakcije. Stranke so pripravljene plačati, pogosto se za njimi oblikuje vrsta, vsaka sekunda zamude pa povzroča trenja. Vendar je ta trenutek visokega pritiska tudi glavna nepremičnina za okrepitev blagovne znamke. V tem priročniku je razloženo, kako ustvariti plačilne kode QR, ki se takoj optično preberejo v bančnih aplikacijah, hkrati pa predstavljajo profesionalen videz z blagovno znamko, ki gradi zaupanje strank.', 'Temeljno načelo plačilnih QR kod je zanesljivost pred estetiko. Lepo oblikovana koda, ki je ne uspe optično prebrati v bančni aplikaciji ene stranke, vas bo zaradi opuščenih transakcij in razočaranih strank stala veliko več, kot bi lahko kadar koli konzervativna zasnova. Začnite s skladnostjo, dodajte zanesljivost, nato skrbno vnesite blagovno znamko le tam, kjer ne ogroža primarne funkcije.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Zaslon maloprodajnega pulta, ki prikazuje plačilno kodo QR, ki jo skenira pametni telefon z bančno aplikacijo',
          caption: 'Plačilne kode QR morajo takoj delovati z aplikacijami za bančništvo in denarnico v realnih pogojih števca',
        },
      ],
    },
    {
      heading: 'Razumevanje plačilnih standardov QR',
      paragraphs: ['Kode QR za plačilo običajno sledijo regionalnim standardom, ki narekujejo obliko tovora. V Singapurju PayNow QR uporablja posebno oblikovanje. V Indiji kode UPI sledijo standardom povezav v globino BharatQR ali UPI. Evropska plačila SEPA uporabljajo kode EPC QR. Vsak standard obstaja, da zagotovi, da lahko bančne aplikacije takoj prepoznajo in obdelajo podatke o plačilu. Odstopanje od teh standardov – celo rahlo – lahko povzroči, da aplikacije za plačevanje zavrnejo kode, ki jih generični optični bralniki kamer brez težav preberejo.', 'ANQR vključuje predloge za glavne plačilne standarde, ki samodejno oblikujejo vaše podatke o trgovcu v skladne tovore. Vedno uporabite te predloge, namesto da bi ročno sestavljali plačilne nize, saj lahko celo manjše napake pri oblikovanju povzročijo neuspešne transakcije. Če plačilni standard vaše regije ni na voljo kot predloga, glejte tehnično dokumentacijo ponudnika plačil za natančne zahteve glede oblikovanja.'],
    },
    {
      heading: 'Dimenzioniranje in postavitev za pultne zaslone',
      paragraphs: ['Kode QR na pultu se soočajo z edinstvenimi fizičnimi izzivi. Stranke skenirajo na dosegu roke, pogosto pod kotom, včasih skozi zaščito proti kihanju ali vitrine. Zgornja razsvetljava ustvarja bleščave lise. Koda tekmuje z drugimi neredi za pozornost in jasne vidne linije. Velikodušno določite velikost QR-ja za plačilo – za večino aplikacij števcev je priporočljivo najmanj 4–5 cm, povečajte pa ga, če je koda za steklom ali v slabo osvetljenem prostoru.', 'Položaj je pomemben prav tako kot velikost. Postavite kodo na mesto, kjer lahko stranke udobno držijo svoj telefon, ne da bi blokirale čakalno vrsto ali nerodno dosegle roko. Zaslon nagnite proti stranki, namesto da ga položite ravno. Če je mogoče, uporabite mat laminacijo ali neodsevne zaslonske materiale, da čim bolj zmanjšate bleščanje od zgornje razsvetljave. Preizkusite končno postavitev ob različnih urah dneva, da ujamete težave z osvetlitvijo.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Diagram, ki prikazuje optimalne višine in kote postavitve QR za različne konfiguracije števcev',
          caption: 'Vodnik za postavitev pulta: optimalne višine, koti in razdalje za zanesljivo skeniranje plačil',
        },
      ],
    },
    {
      heading: 'Konzervativno blagovno znamko za plačilne kode',
      paragraphs: ['Plačilne aplikacije so manj prizanesljive kot generični skenerji kamer. Številne bančne aplikacije uporabljajo starejše, preprostejše algoritme za branje QR, optimizirane za hitrost in ne za prilagodljivost. To pomeni, da slog, ki popolnoma deluje s kamero telefona, morda ne uspe z določenimi aplikacijami za plačevanje. Blagovna znamka naj bo konzervativna: za ospredje uporabite barvo vaše blagovne znamke, če ohranja močan kontrast, vendar se izogibajte prelivom, močnim prekrivanjem ali okrasnim elementom, ki bi lahko motili prepoznavnost.', 'Če želite osrednji logotip ali prekrivanje, naj bo izredno majhen – ne več kot 10–15 % območja QR – in obsežno testirajte z vsako plačilno aplikacijo, ki jo vaše stranke morda uporabljajo. Številna podjetja se odločijo, da na kodah za plačila ne bodo prekrili posebej, pri čemer ta slog rezervirajo za trženje kod QR, kjer so zahteve glede zanesljivosti manj stroge. Naloga plačilne kode je obdelava transakcij, ne vizualni vtis.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Primerjava, ki prikazuje sprejemljive in tvegane ravni blagovne znamke za plačilne kode QR',
          caption: 'Plačilni spekter blagovne znamke QR: od varnega konzervativnega stila do tveganih dekorativnih pristopov',
        },
      ],
    },
    {
      heading: 'Premisleki o materialu in tisku',
      paragraphs: ['Fizični zaslonski material bistveno vpliva na zanesljivost skeniranja. Sijajna laminacija odbija stropne luči neposredno v kamero stranke. Teksturirani materiali lahko popačijo robove modulov. Poceni tisk lahko zamegli drobne podrobnosti. Za plačilne kode QR investirajte v kakovost: uporabite mat ali satenasto laminacijo, zagotovite tiskanje v visoki ločljivosti in zamenjajte zaslone, preden se pokažejo obrabljeni. Popraskana ali zbledela plačilna koda vas stane transakcije.', 'Upoštevajte vzdržljivost in možnost zamenjave zaslona. Zasloni se dotikajo, premikajo, škropijo in občasno prevrnejo. Oblikujte svoj zaslonski sistem tako, da je QR vložek mogoče preprosto zamenjati, ne da bi morali zamenjati celotno stojalo. Imejte pripravljene rezervne izpise, ustvarjene iz vaše zaklenjene konfiguracijske povezave, tako da lahko obrabljene kode takoj zamenjate.'],
    },
    {
      heading: 'Testiranje z aplikacijami za resnično plačevanje',
      paragraphs: ['Generični optični bralniki kamer bodo dekodirali skoraj vsako razumno oblikovano kodo QR. Plačilne aplikacije so bolj izbirčne. Preden uvedete katero koli plačilno kodo QR, jo preizkusite z vsako plačilno aplikacijo, ki jo morda uporabljajo vaše stranke. V okoljih z več plačili to lahko pomeni testiranje z več bančnimi aplikacijami, digitalnimi denarnicami in plačilnimi platformami. Dokumentirajte, katere aplikacije ste preizkusili, in njihove različice – plačilne aplikacije se pogosto posodabljajo in posodobitev lahko spremeni vedenje skeniranja.', 'Preizkusite v realnih pogojih: dejanski zaslon, dejanska osvetlitev, dejanska razdalja skeniranja. Koda, ki se nemudoma skenira na vaši mizi, se lahko ob 17. uri ob 17. uri, ko popoldansko sonce ustvari bleščanje, obremenjuje. Preizkusite z najstarejšim, najcenejšim pametnim telefonom, ki ga najdete – če zanesljivo deluje na nizkocenovni napravi, bo deloval na vsem. Označite kateri koli čas skeniranja, daljši od 2 sekund, za preiskavo in morebitno preoblikovanje.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Kontrolni seznam za testiranje, ki prikazuje različne plačilne aplikacije, vrste naprav in okoljske pogoje, ki jih je treba preveriti',
          caption: 'Celovita matrika za testiranje QR plačil, ki zajema aplikacije, naprave in okoljske dejavnike',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Oglejte si primere QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Kode QR, pripravljene za tiskanje: SVG proti PNG',
      paragraphs: ['Razlika med kodo QR, ki se odlično optično prebere, in tisto, ki ne uspe, se pogosto zmanjša na to, kako je bila izvožena in obravnavana v delovnem procesu tiskanja. V tem priročniku so razložene ključne razlike med vektorskimi (SVG) in rastrskimi (PNG) formati, kdaj jih uporabiti in kako umetnine QR predati oblikovalcem in prodajalcem tiskanja na načine, ki ohranjajo zanesljivost skeniranja od vizitk do napisov v velikosti panojev.', 'Tiskarska produkcija uvaja spremenljivke, ki ne obstajajo na zaslonu: širjenje črnila, tekstura substrata, postopki končne obdelave in kumulativni učinek večkratnih pretvorb datotek. Koda QR, ki je v vaši programski opremi za oblikovanje videti popolna, se lahko pojavi iz tiskalnika z zmehčanimi robovi, zmanjšanim kontrastom ali subtilno popačenimi moduli. Razumevanje izbire oblike in najboljših praks delovnega toka preprečuje te tihe napake.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Povečan pogled, ki primerja vektorske module QR z ostrimi robovi v primerjavi z rastrskimi moduli, ki prikazujejo artefakte slikovnih pik',
          caption: 'Vektor proti rastru v merilu tiskanja: razlika v natančnosti, ki določa zanesljivost skeniranja',
        },
      ],
    },
    {
      heading: 'Zakaj je vektorski (SVG) prednostni za tiskanje',
      paragraphs: ['Datoteke SVG opisujejo kode QR kot matematične oblike in ne mreže slikovnih pik. To pomeni, da je kodo mogoče prilagoditi poljubni velikosti – od 1 cm nalepke do 10-metrske pasice – brez izgube ostrine robov. Tiskalnikov RIP (Raster Image Processor) upodablja vektorje v izvirni ločljivosti izhodne naprave in zagotavlja, da je vsak rob modula tako oster, kot to omogoča strojna oprema. Ni interpolacije, ni artefaktov za izravnavo, ni nakopičene zamegljenosti zaradi več operacij spreminjanja velikosti.', 'Poleg razširljivosti so datoteke SVG bolj robustne v profesionalnih potekih dela. Preživijo povratna potovanja prek programske opreme za načrtovanje brez degradacije. Barvno jih je mogoče popraviti brez ponovnega vzorčenja. Čisto jih vdelajo v datoteke PDF za izpis, pripravljen za tisk. Za katero koli aplikacijo za tiskanje, kjer je kakovost pomembna, mora biti SVG vaš privzeti izvozni format.'],
    },
    {
      heading: 'Ko je PNG sprejemljiv',
      paragraphs: ['PNG postane potreben, ko vaš potek dela ali ciljna platforma ne podpira vektorskih formatov. Nekatere spletne platforme, sistemi CMS za označevanje in podedovani delovni tokovi tiskanja zahtevajo rastrske slike. V teh primerih lahko PNG dobro deluje – vendar le, če upoštevate stroga pravila: izvoz v končni fizični velikosti in ločljivosti, po izvozu nikoli ne povečujte velikosti in se izogibajte stiskanju z izgubo ali pretvorbi formata.', 'Ključno pravilo za PNG je, da pred izvozom izračunate zahtevane dimenzije slikovnih pik. Če bo vaš QR natisnil pri 5 cm in vaš tiskalnik deluje pri 300 DPI, potrebujete približno 590 slikovnih pik. Izvozite v tej ali večji velikosti, nato po potrebi zmanjšajte – nikoli več. Te informacije vključite v ime datoteke ali metapodatke, da bodoči uporabniki ne bodo pomotoma zlorabili izvoza glede na velikost.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Vmesnik kalkulatorja, ki prikazuje razmerje med fizično velikostjo, DPI in zahtevanimi dimenzijami slikovnih pik',
          caption: 'Kalkulator ločljivosti tiskanja: določanje najmanjših dimenzij slikovnih pik za vašo ciljno izhodno velikost',
        },
      ],
    },
    {
      heading: 'Razložene možnosti izvoza ANQR',
      paragraphs: ['ANQR ponuja več načinov izvoza SVG, ki ustrezajo različnim potekom dela. Način True Vector ustvari čisti izpis na podlagi poti, idealen za tiskanje in profesionalna oblikovalska orodja. Ko ste dodali rastrske prekrivke ali določene učinke, jih lahko ANQR vdela, medtem ko ohrani vektorske module, ali pa lahko izvozite popolnoma rastrizirano različico pri določeni ločljivosti. Razumevanje teh možnosti vam pomaga izbrati pravi izvoz za vsak primer uporabe.', 'Za izvoz PNG vam ANQR omogoča, da določite točne dimenzije in vključuje možnosti za prosojna ozadja. Nastavitev DPI vam pomaga izračunati ustrezne velikosti za tiskanje, vendar ne pozabite, da je DPI metapodatek – za tiskanje je pomembno, da imate dovolj slikovnih pik za vašo fizično velikost. Če ste v dvomih, izvozite več, kot mislite, da potrebujete; zmanjševanje ohranja kakovost, povečevanje pa jo uničuje.'],
    },
    {
      heading: 'Priprava datotek za predajo',
      paragraphs: ['Ko umetnine QR posredujete oblikovalcem ali prodajalcem tiskanja, vključite jasne specifikacije: predvideno fizično velikost, minimalne zahteve za tiho cono in vse pomisleke glede barvnega prostora. Za kritične aplikacije zagotovite glavno datoteko SVG in varnostno kopijo PNG z visoko ločljivostjo, ki sta jasno označeni s predvideno uporabo. Vključite svojo povezavo za konfiguracijo ANQR, da se lahko koda po potrebi znova ustvari.', 'Predvidite pogoste napake v procesu predaje. Izrecno navedite, da QR-ja ne smete spreminjati, obračati, nagibati ali uporabljati učinkov. Določite, da mora tiho območje ostati prosto – brez oznak za obrezovanje, registrskih oznak ali elementov oblikovanja, ki vstopajo. Če bo QR nameščen na barvnem ali fotografskem ozadju, zagotovite različico z neprozorno podlago, da zagotovite ustrezen kontrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Diagram paketa datotek, ki prikazuje glavno datoteko SVG, varnostno kopijo PNG, dokument s specifikacijami in konfiguracijsko povezavo',
          caption: 'Profesionalni QR predajni paket: vse, kar oblikovalec ali prodajalec tiska potrebuje za natančno reprodukcijo',
        },
      ],
    },
    {
      heading: 'Preverjanje odtisov',
      paragraphs: ['Nikoli ne odobrite naklade, ne da bi skenirali fizični dokaz. Zahtevajte poskusni odtis, natisnjen na dejanskem mediju z dejansko končno obdelavo, ki bo uporabljena v proizvodnji. Optično preberite dokaz pri svetlobnih pogojih, podobnih tistim, kjer bo prikazan končni del. Preizkusite z več napravami, vključno s starejšimi pametnimi telefoni, ki bi lahko imeli težave z mejno kakovostjo.', 'Če se dokazilo skenira počasi ali nedosledno, raziščite, preden ga odobrite. Pogoste težave vključujejo nezadosten kontrast na barvnih podlagah, kršitve tihega območja zaradi obrezovanja, mehčanje robov modula za širjenje črnila ali laminacijo, ki povzroča bleščanje. Vsako od teh je mogoče obravnavati, preden se posvetite tiskanju celotne naklade - vendar le, če jih ujamete na stopnji poskusnega odtisa.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Kontrolni seznam za pregled dokazov z rezultati testov skeniranja, meritvami kontrasta in podpisi odobritev',
          caption: 'Delovni tok preverjanja preizkusa tiskanja: sistematično testiranje pred prevzemom proizvodnih količin',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Oglejte si primere QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Ustvarjanje animiranih QR kod',
      paragraphs: ['Animirane kode QR združujejo funkcionalnost standardnih kod QR s privlačnim gibanjem, ki dramatično poveča stopnjo angažiranosti. V digitalnem označevanju, družbenih medijih in interaktivnih zaslonih animacija spremeni statično korist v privlačen vizualni element, ki pritegne poglede in vabi k interakciji. Ta priročnik pokriva načela, tehnike in praktične omejitve ustvarjanja animiranih kod QR, ki se zanesljivo skenirajo in hkrati zagotavljajo vizualni učinek.', 'Temeljni izziv animiranih kod QR je ravnotežje med vizualnim zanimanjem in zanesljivostjo skeniranja. Vsak okvir mora biti ločeno skeniran - skener lahko zajame kodo na kateri koli točki cikla animacije. Ta omejitev oblikuje vsako oblikovalsko odločitev: kateri elementi se lahko premikajo, koliko se lahko spremenijo in kaj mora ostati stabilno skozi celotno animacijo.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Zaslon za digitalne napise, ki prikazuje animirano kodo QR, ki pritegne pozornost gledalca v javnem prostoru',
          caption: 'Animirane kode QR v digitalnem označevanju: gibanje, ki pritegne pozornost in spodbuja skeniranje',
        },
      ],
    },
    {
      heading: 'Kako animacija vpliva na možnost skeniranja',
      paragraphs: ['QR skenerji delujejo tako, da zajamejo en okvir in analizirajo vzorec svetlih in temnih modulov. Da animirana koda deluje, mora vsak okvir vsebovati popoln, veljaven vzorec QR. To izključuje animacije, ki spreminjajo strukturo kode, raztapljajo module ali bistveno spreminjajo kontrastni vzorec. Moduli za prenos podatkov – navidezno naključni vzorec v sredini – morajo ostati vizualno ves čas stabilni.', 'Pristopi varne animacije spreminjajo elemente, ki ne prenašajo podatkov: ozadja, barve, okrasne okvirje in prekrivne elemente. Strukturne komponente – iskalni vzorci (veliki kotni kvadrati), časovni vzorci (izmenične črte) in poravnalni vzorci (manjši kvadrati v večjih kodah) – morajo ohraniti svoje položaje in razmerja. Delo znotraj teh omejitev še vedno omogoča presenetljivo dinamične in privlačne animacije.'],
    },
    {
      heading: 'Tehnike animacije, ki delujejo',
      paragraphs: ['Barvno kroženje animira barve ospredja in ozadja skozi paleto, hkrati pa ohranja zadosten kontrast na vsakem koraku. To ustvari živahen učinek, ki pritegne pozornost, z minimalnim tveganjem skeniranja – dokler kontrast nikoli ne pade pod berljivo raven. Prednastavitve barvnega cikla ANQR so zasnovane tako, da ohranjajo možnost skeniranja v celotnem ciklu.', 'Animirani prekrivni elementi postavijo premikajoče se slike za polprosojen vzorec QR. Koda ostane stabilna, medtem ko se ozadje animira – morda ponavljajoč se videoposnetek, animirani elementi blagovne znamke ali abstraktna grafika gibanja. Ta tehnika zahteva skrbno upravljanje intenzivnosti, da se prepreči, da bi ozadje preglasilo vzorec QR, vendar ustvarja najbolj vizualno osupljive rezultate.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Diagram, ki prikazuje večplastno strukturo animiranega sloja QR: stabilna koda nad slojem animiranega ozadja',
          caption: 'Načelo plastenja animacije: vzorec QR ostane nespremenjen, medtem ko se elementi ozadja animirajo pod njim',
        },
      ],
    },
    {
      heading: 'Konfiguracija parametrov animacije',
      paragraphs: ['Hitrost sličic vpliva na vizualno gladkost in velikost datoteke. Za večino aplikacij 10–15 sličic na sekundo zagotavlja gladko gibanje brez pretiranih velikosti datotek. Višja hitrost sličic ponuja manjše vizualne rezultate, hkrati pa znatno poveča velikost datoteke. Upoštevajte kontekst dostave – velik digitalni znak lahko obravnava večje datoteke kot umestitev mobilnega oglasa.', 'Vedenje zanke določa, kako animacija kroži. Brezšivne zanke ustvarjajo neprekinjeno gibanje, idealno za napise in ambientalne zaslone. Ping-pong (naprej-potem-nazaj) zanke dobro delujejo pri preprostih animacijah. Za utripe, ki pritegnejo pozornost, razmislite o animacijah z zadržki – obdobjih mirovanja, prekinjena z gibanjem, ki pritegne pogled brez nenehne utrujenosti zaradi gibanja.'],
    },
    {
      heading: 'Ustvarjanje animiranih prekrivk',
      paragraphs: ['Pri uporabi animiranih slik (GIF-ov, animiranih WebP-jev ali videa) kot prekrivnih elementov ANQR izvleče okvirje in jih sestavi z vašo kodo QR. Nastavitev intenzivnosti prekrivanja nadzira, koliko animacije je prikazano skozi - nižje vrednosti dajejo prednost preglednosti, medtem ko višje vrednosti dajejo prednost vizualnemu učinku. Preizkusite izbrano intenzivnost v več sličicah, da zagotovite dosledno preglednost.', 'Kakovost izvornega materiala pomembno vpliva na rezultate. Uporabite prekrivanja z jasnimi predmeti in dobrim kontrastom. Izogibajte se izvornim animacijam s hitrim utripanjem ali ekstremnimi spremembami svetlosti, ki bi lahko ustvarile občasne sličice z nizkim kontrastom. Pred izvozom si oglejte predogled celotnega cikla animacije, da ujamete morebitne problematične okvirje, ki jih morda ne bo mogoče skenirati.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Pogled okvir za okvirjem animiranega prekrivanja, ki prikazuje ravni kontrasta, ki se ohranjajo v celotnem zaporedju',
          caption: 'Analiza okvirjev: preverjanje dosledne možnosti skeniranja v celotnem ciklu animacije',
        },
      ],
    },
    {
      heading: 'Premisleki glede izvoza in dostave',
      paragraphs: ['GIF ostaja najpogosteje podprt animirani format, ki se samodejno predvaja v večini kontekstov, ne da bi potreboval podporo za video predvajalnik. Vendar 256-barvna paleta GIF omejuje barvno natančnost. Za barvno kritične animacije razmislite o animiranem WebP, kjer je podprt, ali pa se vrnite k video formatom za najvišjo kakovost. Izvoz GIF ANQR vključuje možnosti drgnjenja za povečanje kakovosti znotraj omejitev palete.', 'Velikost datoteke je pomembna za dostavo. Sistemi digitalnega označevanja, e-poštni odjemalci in družabne platforme pogosto določajo omejitve velikosti. Če vaša animacija presega te omejitve, zmanjšajte število sličic, dimenzije ali barvno globino. Včasih delitev zapletene animacije na krajšo zanko doseže boljše rezultate kot agresivno stiskanje, ki poslabša vsak okvir.'],
    },
    {
      heading: 'Testiranje animiranih QR kod',
      paragraphs: ['Testiranje animiranih kod zahteva skeniranje na več točkah v ciklu animacije. Ne skenirajte samo enkrat in domnevajte, da je uspelo – skenirajte večkrat, v različnih trenutkih, da preverite, ali je vsak okvir berljiv. Bodite posebno pozorni na okvirje na skrajnih točkah barvnega cikla ali na vrhovih intenzivnosti prekrivanja, kjer je lahko kontrast najnižji.', 'Če je mogoče, preizkusite na dejanski strojni opremi zaslona. Umerjanje barv monitorja, vidni kot in ambientalna osvetlitev vplivajo na to, kako se animacija prikaže in skenira. Svetla animacija, ki se odlično prikaže na vašem monitorju, lahko zbledi na zunanjem zaslonu ali postane neberljiva pri poševnih kotih gledanja.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Testna matrika, ki prikazuje stopnje uspešnosti skeniranja v različnih okvirih, napravah in pogojih prikaza',
          caption: 'Protokol testiranja animiranega QR: sistematično preverjanje med okvirji, napravami in pogoji gledanja',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Oglejte si primere QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Najboljše prakse QR varnosti in skladnosti',
      paragraphs: ['Lepo oblikovana koda QR, ki je ne uspe optično prebrati, je hujša kot neuporabna – frustrira stranke, škodi dojemanju blagovne znamke in zapravi vsak vir, vložen v njeno ustvarjanje in distribucijo. Ta priročnik pokriva tehnične in praktične dejavnike, ki določajo, ali bo koda QR zanesljivo skenirana, in kako uporabiti varnostne funkcije ANQR za odkrivanje morebitnih težav, preden pridejo v proizvodnjo.', 'Zanesljivost kode QR ni binarna. Koda se lahko popolnoma skenira na vodilnih telefonih, vendar ne uspe na poceni napravah. Morda deluje pri idealni osvetlitvi, vendar se muči v zatemnjenih restavracijah ali močni sončni svetlobi. Razumevanje dejavnikov, ki vplivajo na zmožnost pregledovanja, vam pomaga sklepati kompromise med vizualnim slogom in zanesljivostjo v resničnem svetu.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Spekter zanesljivosti, ki prikazuje kode QR v razponu od visoko čitljivih do mejno berljivih',
          caption: 'Spekter možnosti pregledovanja: od neprebojnih kod do oblikovanja, ki premika meje zanesljivosti',
        },
      ],
    },
    {
      heading: 'Razumevanje ravni odpravljanja napak',
      paragraphs: ['Kode QR vključujejo vgrajeno redundanco, ki omogoča njihovo branje, tudi če so delno poškodovane ali zakrite. Raven odpravljanja napak - L (7 %), M (15 %), Q (25 %) ali H (30 %) - določa, koliko kode lahko manjka, medtem ko še vedno pravilno dekodira. Večje popravljanje napak ustvari večje kode, vendar zagotavlja varnostno rezervo za prekrivanja, tiskarske nepopolnosti in okoljsko škodo.', 'Za kode s prekrivnimi slikami je bistvenega pomena raven popravka napak H – prekrivna plast fizično zakrije del kode in potrebujete 30-odstotno redundanco, da ohranite zanesljivost. Za čiste kode brez stila v nadzorovanih okoljih pogosto zadostuje raven M. Raven L mora biti rezervirana za situacije, ko je velikost kode kritično omejena in lahko zagotovite prvotne pogoje.'],
    },
    {
      heading: 'Kritično tiho območje',
      paragraphs: ['Tiho območje je prazen rob, ki obdaja vsako kodo QR. Skenerji uporabljajo to mejo, da ugotovijo, kje se koda začne in konča. Standard ISO določa minimalno tiho območje štirih modulov (štirikratna širina najmanjšega kvadrata v kodi). Kršitev tega prostora – z elementi oblikovanja, obrezanimi robovi ali sosednjo vsebino – je eden najpogostejših vzrokov za neuspešno skeniranje.', 'Uveljavljanje tihega območja ANQR pomaga vzdrževati ta kritični razmik, vendar morate tudi zagotoviti, da se ohrani v vaših končnih načrtih. Ko predajate umetniško delo QR, izrecno navedite zahteve za tiho območje. Ko postavljate kode v postavitve, preverite, da noben element ne vdre v ta prostor. Nekaj ​​milimetrov praznega prostora lahko pomeni razliko med zanesljivim skeniranjem in razočaranimi strankami.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Diagram, ki prikazuje pravilen razmik tihih območij v primerjavi s pogostimi kršitvami, ki povzročajo napake skeniranja',
          caption: 'Zahteve za tiho območje: nevidni rob, ki določa uspeh skeniranja',
        },
      ],
    },
    {
      heading: 'Varnost kontrasta in barv',
      paragraphs: ['QR skenerji zaznajo vzorec svetlih in temnih modulov. Kakršen koli slog, ki zmanjša ta kontrast – svetlo ospredje, temno ozadje, učinki preliva ali prekrivni elementi z nizko motnostjo – oteži branje kode. ANQR izračuna kontrastna razmerja in opozori, ko se vaše izbire barv približajo nevarnim nivojem, vendar je končni razsodnik vedno testiranje v resničnem svetu.', 'Zaznavanje barv se spreminja glede na svetlobne pogoje. Barvno kombinacijo, ki je na vašem monitorju videti visokokontrastna, bo morda težko razločiti pod toplo žarnico ali hladnimi fluorescenčnimi cevmi. Če bo vaša koda uporabljena v različnih svetlobnih pogojih, preizkusite pri več svetlobnih virih in upoštevajte bolj konzervativna kontrastna razmerja kot varnostno mejo.'],
    },
    {
      heading: 'Velikost modula in razdalja gledanja',
      paragraphs: ['Fizična velikost posameznih modulov določa največjo razdaljo, s katere je mogoče skenirati kodo. Manjši moduli pomenijo manjše kode, vendar zahtevajo manjše razdalje skeniranja. Splošno pravilo je, da mora biti vsak modul vsaj 0,5 mm na predvideni razdalji skeniranja, s sorazmernim povečanjem za večje razdalje. Koda na panoju potrebuje veliko večje module kot koda na vizitki.', 'Pri izračunu velikosti modula upoštevajte najslabši možni scenarij: stranka s starejšim telefonom, pri nepopolni osvetlitvi, skenira na največji možni razdalji. Oblikujte za tega uporabnika, vsi ostali pa bodo imeli še boljšo izkušnjo. Priporočila glede velikosti ANQR upoštevajo te dejanske spremenljivke, da predlagajo ustrezne mere za vašo nameravano uporabo.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Tabela, ki opisuje velikost modula, dimenzije tiskanja in največjo učinkovito razdaljo skeniranja',
          caption: 'Vodnik po razdalji skeniranja: ujemanje velikosti modula z vašimi zahtevami po uvajanju',
        },
      ],
    },
    {
      heading: 'Uporaba varnostnega načina ANQR',
      paragraphs: ['Varnostni način ANQR zagotavlja povratne informacije o zanesljivosti skeniranja v realnem času. Spremlja kontrastna razmerja, skladnost tihega območja, intenzivnost prekrivanja in druge dejavnike, ki vplivajo na možnost skeniranja. Ko se kateri koli parameter približa tveganim ravnem, boste videli opozorila s posebnimi navodili, kako izboljšati zanesljivost. Za profesionalne uvedbe, pri katerih je napaka draga, naj bo varnostni način aktiven ves čas načrtovanja.', 'Varni način vključuje tudi funkcijo preverjanja skeniranja, ki poskuša dekodirati vašo ustvarjeno kodo in poroča o uspehu ali neuspehu. Čeprav to preverjanje v aplikaciji ne more ponoviti vseh dejanskih pogojev, ujame številne pogoste težave, preden investirate v tiskanje ali distribucijo. Uspešno preverjanje obravnavajte kot minimalno merilo in ne kot jamstvo – testiranje v resničnem svetu ostaja bistveno.'],
    },
    {
      heading: 'Protokoli testiranja v resničnem svetu',
      paragraphs: ['Nobeno preverjanje programske opreme ne nadomesti fizičnega testiranja. Natisnite svojo kodo v predvideni velikosti na reprezentativnem materialu. Preizkusite ga v dejanskem okolju namestitve s svetlobnimi pogoji, ki ustrezajo dejanski uporabi. Skenirajte z več napravami – ne le z vašim vodilnim telefonom, temveč z nizkocenovnimi napravami Android, starejšimi iPhoni in vsemi posebnimi napravami, ki jih vaše občinstvo običajno uporablja.', 'Sistematično dokumentirajte svoje testiranje. Zapišite, katere naprave so bile testirane, pod kakšnimi pogoji in s kakšnimi rezultati. Če kode uvajate v velikem obsegu, določite merila sprejemljivosti: morda 95-odstotna stopnja uspešnosti v celotnem testnem naboru naprav ali uspešni pregledi v 2 sekundah na vseh testiranih napravah. Ti standardi pripomorejo k temu, da so odločitve o iti/ne iti objektivne, namesto da bi upali na najboljše.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Obsežen kontrolni seznam za testiranje, ki zajema naprave, pogoje in merila sprejemljivosti',
          caption: 'Protokol testiranja uvajanja QR: sistematično preverjanje pred prevzemom proizvodnje',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Oglejte si primere QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Oglejte si primere QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Odprite celoten uporabniški priročnik', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Odprite galerijo', type: 'gallery' },
  ],
};
