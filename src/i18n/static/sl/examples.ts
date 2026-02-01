import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Primeri ANQR',
  description: 'Pet primerov iz resničnega sveta v produkcijskem slogu, ki prikazujejo, kje kode QR ustvarjajo merljivo vrednost: dvig podedovane kode maloprodajnega števca, maloprodajna plačila z blagovno znamko in dejanja »skeniranja«, spreminjanje velikosti tiska od letakov do panojev, animirani QR za digitalno označevanje in medjezikovno sodelovanje z uporabo sidrnih povezav, ki jih je mogoče deliti. Vsak primer vključuje slike, praktične omejitve in povezavo remiksa nazaj do generatorja.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Odprite generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Brskajte po člankih Learn', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Odprite celoten uporabniški priročnik', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Študija primera: dvig maloprodajnih pultov QR',
      paragraphs: ['Ta primer iz resničnega sveta sledi majhni kavarni, ki je tri leta uporabljala isto kodo QR na svojem pultu. Izvirna koda je bila hitro ustvarjena med navalom pandemije, natisnjena na standardni papir in vstavljena v plastično stojalo. Še vedno je deloval – tehnično – vendar so stranke pogosto potrebovale več poskusov, da bi ga optično prebrali, nič pa ni okrepilo skrbno oblikovane identitete blagovne znamke kavarne.', 'Preoblikovanje se je začelo s preprosto revizijo: obstoječa koda je kodirala URL spletnega menija kavarne, ki so ga želeli obdržati. Izziv je bil ustvariti občutek, da je QR del izkušnje v kavarni in ne naknadno premišljen pripomoček iz leta 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Preperela koda QR v plastičnem stojalu, na kateri so vidni obraba, prstni odtisi in obledel tisk',
          caption: 'Izhodišče: tri leta okenske storitve so pustila prvotni QR komajda funkcionalen',
        },
      ],
    },
    {
      heading: 'Diagnosticiranje težav izvirne kode',
      paragraphs: ['Testiranje je razkrilo več težav: prvotna koda je uporabljala popravek napak L (minimalna redundanca), imela je tiho območje samo 2 modulov in je bila natisnjena v nizki ločljivosti. Pod toplo volframovo razsvetljavo v kavarni so že obledeli črni moduli komaj kontrastirali porumenelemu papirju. Starejši telefoni so imeli težave; novejšim telefonom je uspelo, vendar z opazno zamudo.', 'Poleg tehničnih vprašanj generični črno-beli kvadrat ni sporočal ničesar o znamki. Stranke so oklevale pred skeniranjem – subtilna ovira zaupanja, ki je zmanjšala sodelovanje s skrbno oblikovanim digitalnim menijem v kavarni.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnostična prosojnica, ki prikazuje tehnične pomanjkljivosti prvotnega QR-ja: nizek ECC, minimalno tiho območje, slab kontrast',
          caption: 'Tehnična analiza, ki razkriva, zakaj podedovana koda ni delovala v realnih razmerah',
        },
      ],
    },
    {
      heading: 'Proces dviga',
      paragraphs: ['Z uporabo ANQR je lastnik kavarne poustvaril kodo z enakim URL-jem menija, vendar dramatično izboljšal nastavitve: popravek napak H za največjo odpornost, tiho območje s 6 moduli za zanesljivo zaznavanje meja in barve blagovne znamke (moduli globoko bordo na krem ozadju), ki so se ujemale z notranjo paleto kavarne.', 'Dodana je bila majhna sredinska prekrivka z logotipom kavarne – namerno subtilna, da se ohrani preglednost, hkrati pa zagotavlja takojšnja prepoznavnost blagovne znamke. Varni način je potrdil, da je nova zasnova zanesljivo optično prebrana na testnih napravah pred kakršnim koli tiskanjem.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Vmesnik ANQR, ki prikazuje konfiguracijo: barve blagovne znamke, ustrezen ECC, velikodušno tiho območje, subtilen prekrivni logotip',
          caption: 'Gradnja nadgrajene konfiguracije: vsaka nastavitev, izbrana za uravnoteženje izražanja blagovne znamke z zanesljivostjo skeniranja',
        },
      ],
    },
    {
      heading: 'Merljivi rezultati',
      paragraphs: ['Po uvedbi novega QR na profesionalne mat laminirane kartice je kavarna rezultate spremljala štiri tedne. Stopnja uspešnosti skeniranja se je izboljšala z ocenjenih 70 % na skoraj 100 %. Povprečni čas skeniranja se je zmanjšal s 3-4 sekund na manj kot 1 sekundo. Najpomembneje je, da se je sodelovanje v meniju povečalo za 40 % – stranke, ki so prej pogledale QR in obupale, so zdaj samozavestno skenirale.', 'Osebje je poročalo o manj vprašanjih strank o tem, "kako uporabljati QR" in nič več primerov ročnega vnašanja URL-ja za razočarane stranke. Blagovna znamka je prav tako sprožila pogovore, pri čemer so kupci pozitivno komentirali kohezivno zasnovo.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Primerjava pred/potem z meritvami: stopnja uspešnosti skeniranja, povprečni čas skeniranja in tedensko število izboljšav skeniranja',
          caption: 'Štirje tedni podatkov, ki kažejo merljiv učinek premišljenega dviga QR',
        },
      ],
    },
    {
      heading: 'Ponovno ustvarite to konfiguracijo',
      paragraphs: ['Konfiguracija kavarne prikazuje konzervativno, a učinkovito blagovno znamko: popravek napak H, 6-modulno tiho območje, barve blagovne znamke z visokim kontrastom in minimalno sredinsko prekrivanje. To ravnotežje deluje pri večini maloprodajnih pultov, kjer mora biti zanesljivost na prvem mestu, vendar je prisotnost blagovne znamke še vedno pomembna.', 'Odprite generator s temi vnaprej naloženimi nastavitvami in prilagodite barve in prekrivanje svoji znamki. Ključni vpogled: samo izboljšave zanesljivosti lahko dramatično povečajo sodelovanje, še preden dodamo kakršen koli vizualni stil.', 'Za celotno metodologijo tega pristopa si oglejte povezani vodnik za učenje o izboljšanju obstoječih kampanj QR.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Povezava do generatorja, ki je vnaprej konfiguriran z nastavitvami kavarne za takojšnjo prilagoditev',
          caption: 'Začnite s preverjeno konfiguracijo in jo prilagodite svoji blagovni znamki',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Brskajte po člankih Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Študija primera: Prikaz števca več plačil',
      paragraphs: ['Ta primer sledi butični trgovini z oblačili, ki je v svojem registru zbrala pet različnih kod QR: bančno plačilo, nasvete, Instagram, Googlove ocene in povezavo za zaposlitev. Vsak je bil ustvarjen iz drugega vira, natisnjen ob različnih časih in prikazan na neusklajenih stojalih. Vizualni kaos je spodkopaval skrbno urejeno estetiko trgovine in osebje se je redno ukvarjalo s kupci, ki so skenirali napačno kodo.', 'Rešitev je zahtevala ločevanje pomislekov: plačilne kode so potrebovale največjo možno zanesljivost s konzervativnim slogom, medtem ko so lahko tržne kode bolj izrazite. Enotni sistem prikaza, ki se je pojavil, prikazuje, kako uravnotežiti prisotnost blagovne znamke s funkcionalnimi zahtevami različnih primerov uporabe QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Natrpan register, ki prikazuje pet neujemajočih se kod QR na različnih stojalih in tiskanih materialih',
          caption: 'Kaotično izhodišče: pet nepovezanih QR kod, ki tekmujejo za pozornost in povzročajo zmedo pri strankah',
        },
      ],
    },
    {
      heading: 'Dajanje prednosti plačilni izkušnji',
      paragraphs: ['Primarno plačilno sredstvo trgovine je uporabljalo regionalni standard, ki je zahteval strogo skladnost tovora. Testiranje je razkrilo, da je tudi manjše oblikovanje vplivalo na hitrost skeniranja z nekaterimi bančnimi aplikacijami. Odločitev: QR za plačilo ostane popolnoma nespremenjen, razen optimizacije velikosti in profesionalnega tiskanja na mat karton.', 'Ta konzervativen pristop je pomenil, da je bila plačilna koda videti manj "znamčena" kot idealna, vendar so se stopnje dokončanja transakcij dramatično izboljšale. Vpogled: plačilni trenutki niso priložnosti za blagovno znamko – so trenutki zanesljivosti. Stranke cenijo hitrost in gotovost namesto estetike, ko gre za denar.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Čista, velika plačilna koda QR na profesionalni matirani kartici, vidno nameščena na registru',
          caption: 'Plačilni QR: velike velikosti, profesionalno natisnjen, konzervativno oblikovan za takojšnje prepoznavanje v bančnih aplikacijah',
        },
      ],
    },
    {
      heading: 'Ustvarjanje sekundarnega zaslona dejanj',
      paragraphs: ['Za nasvete, ocene, socialne stike in zaposlovanje bi lahko bila trgovina bolj izrazita. Te kode so bile ponovno ustvarjene v ANQR z doslednim slogom blagovne znamke: značilno olivno zeleno na kremni barvi trgovine, zaokrožen slog modula in subtilna prekrivna sredina z ikono trgovine. Popravek napak H je zagotovil zanesljivost tudi pri oblikovanju.', 'Te štiri kode so bile razvrščene v ploščo z blagovno znamko, ki je bila postavljena poleg kode plačila (ne tekmuje z njo). Jasne oznake v tipografiji trgovine so pojasnile namen vsake kode. Vizualna hierarhija je bila namerna: plačilo je bilo samostojno in vidno; sekundarna dejanja, združena kot možnosti.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Plošča z blagovno znamko, ki prikazuje štiri oblikovane kode QR za nasvete, ocene, družabna omrežja in zaposlovanje, z jasnimi oznakami',
          caption: 'Sekundarna akcijska plošča: dosledna blagovna znamka, jasno označevanje, postavljeno kot možnosti in ne kot motnje',
        },
      ],
    },
    {
      heading: 'Oblikovanje prikazovalnega sistema',
      paragraphs: ['Fizični zaslon je rešil več težav hkrati. Tako stojalo za plačilo kot sekundarna plošča sta uporabila mat materiale za odpravo bleščanja stropne razsvetljave. Višine so bile optimizirane za stranke različnih postav. Koti usmerjeni proti čakalni vrsti strank in ne ravno na pultu.', 'Zelo pomembno je, da je trgovina ustvarila rezervne natise iz zaklenjenih konfiguracijskih povezav ANQR. Ko je bila koda nasvetov na koncu poškropljena s kavo, jo je osebje zamenjalo v nekaj minutah z uporabo shranjene konfiguracije – brez posnetkov zaslona, ​​brez ugibanja o nastavitvah, brez poslabšanja kakovosti.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Diagram, ki prikazuje fizično postavitev zaslona: višine, koti, materiali in razmerje med plačilom in sekundarnimi zasloni',
          caption: 'Načrt prikazovalnega sistema: fizična ergonomija, optimizirana za zanesljivo skeniranje po višini strank in svetlobnih pogojih',
        },
      ],
    },
    {
      heading: 'Operativne izboljšave',
      paragraphs: ['Šest tednov po uvedbi je trgovina dokumentirala pomembne izboljšave: nič pritožb strank glede zmede z \'napačno kodo\', hitrejši časi transakcij in 3-kratno povečanje oddaje napitnine (stranke so lahko zdaj poiskale in skenirale kodo napitnine, ne da bi nerodno spraševale osebje). Povečalo se je tudi število ocen v Googlu, saj je namenski, dobro označen QR odstranil trenje.', 'Usposabljanje osebja je postalo preprostejše: \'plačilna koda je glavna, vse ostalo je na plošči.\' Ko so se plačilne aplikacije posodobile in je ena za kratek čas pokazala počasnejše skeniranje, je konzervativna zasnova plačilne kode pomenila, da je še vedno delovala – le nekoliko počasneje, namesto da bi popolnoma odpovedala.', 'Oglejte si vodnik za učenje o kodah QR za maloprodajna plačila za načela, ki stojijo za zasnovo tega prikazovalnega sistema.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Nadzorna plošča meritev, ki prikazuje primerjave pred/potem: primeri zmede, čas transakcije, pogostost nasvetov, oddaje pregledov',
          caption: 'Šest tednov operativnih podatkov, ki prikazujejo poslovni vpliv premišljenega sistema prikazovanja več QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Brskajte po člankih Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Študija primera: Od vizitke do reklamnega panoja',
      paragraphs: ['Ta primer sledi podjetju za produkcijo dogodkov, ki se pripravlja na veliko konferenco. Potrebovali so isto kodo QR – povezavo do aplikacije dogodka – nameščeno v radikalno različnih formatih: vložki za značke udeležencev (3 cm), kartice za namizne šotore (8 cm), znaki na mizi za registracijo (30 cm), plakati za iskanje poti (60 cm) in ogromen transparent za ozadje odra (4 metre). Vsak format je imel različne razdalje gledanja, svetlobne pogoje in proizvodne delovne tokove.', 'Izziv ni bil samo tehnični – bil je operativni. Več prodajalcev je opravljalo različne tiskalne posle in podjetje je moralo zagotoviti dosledne rezultate, ki jih je bilo mogoče optično prebrati, ne glede na to, kdo je kaj izdelal. Njihova rešitev je bila osredotočena na izvoz SVG in strogo dokumentacijo predaje.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kolaž, ki prikazuje isto kodo QR, razporejeno v petih različnih velikostih, od značke do pasice',
          caption: 'Ena koda QR, pet velikosti namestitve: izziv ohranjanja možnosti skeniranja od centimetrov do metrov',
        },
      ],
    },
    {
      heading: 'Zakaj so imeli prejšnji dogodki težave',
      paragraphs: ['Na njihovi zadnji konferenci je podjetje doživelo neprijetne neuspehe. Odrska pasica QR je bila ustvarjena kot majhen PNG in povečana v programski opremi za oblikovanje – rezultat je bil videti sprejemljiv od daleč, vendar ni uspel zanesljivo skenirati iz občinstva. QR-ji značk so bili preveč oblikovani in premajhni, kar je motilo udeležence, ki so poskušali dodati stike. Zaradi nedoslednih nastavitev v formatih je bil \'isti\' QR dejansko videti drugače na vsakem kosu.', 'Analiza po dogodku je razkrila glavni vzrok: ni enega vira resnice. Vsak oblikovalec je poustvaril QR z nekoliko drugačnimi nastavitvami in vsak prodajalec tiska je drugače obdelal datoteke. Kakovost se je poslabšala zaradi telefonske igre predaje datotek.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotografije od blizu, ki prikazujejo napake pri skeniranju: pikselizirani moduli pasic, premajhne kode značk, nedosleden slog med formati',
          caption: 'Forenzična analiza prejšnjih neuspešnih dogodkov: vsak format je povzročil različne težave s kakovostjo',
        },
      ],
    },
    {
      heading: 'Potek dela SVG-First',
      paragraphs: ['Za ta dogodek je podjetje vzpostavilo strog protokol: en glavni QR, ustvarjen v ANQR z optimalnimi nastavitvami (popravek napak H, velikodušno tiho območje, čist slog), izvožen kot SVG in shranjen kot edini verodostojni vir. Konfiguracijska povezava ANQR je bila dokumentirana poleg datoteke SVG, tako da je bilo mogoče kodo po potrebi ponovno generirati.', 'Vsak oblikovalec in prodajalec sta prejela isti glavni SVG z izrecnimi navodili: postavite na zahtevano velikost, ne spreminjajte, ohranite prostor za tiho območje. Za prodajalce, ki potrebujejo rastrske formate, je podjetje zagotovilo vnaprej upodobljene PNG-je v določenih velikostih z jasnimi poimenovanji, ki označujejo predvideno uporabo.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Paket datotek, ki prikazuje glavni SVG, PNG-je, specifične za velikost, specifikacijski dokument in konfiguracijsko povezavo',
          caption: 'Paket predaje: vse, kar so prodajalci potrebovali za ustvarjanje doslednih rezultatov brez ugibanja',
        },
      ],
    },
    {
      heading: 'Premisleki glede velikosti',
      paragraphs: ['Vsak format je zahteval posebno pozornost. Vložki značk na 3 cm so potrebovali QR, da so zasedli največji razpoložljivi prostor – razdalja skeniranja bi bila dolžina roke. Namizni šotori na 8 cm bi lahko vključevali okrasne okvirje zunaj mirnega območja. Za 4-metrsko pasico je bil potreben izračun: z običajne razdalje občinstva (15–20 metrov) so morali biti moduli jasno razločljivi s telefonskimi kamerami, kar je pomenilo, da mora biti QR znotraj zasnove pasice vsaj 80 cm.', 'Podjetje je ustvarilo vodnik za določanje velikosti, ki dokumentira najmanjše dimenzije QR za vsako pričakovano razdaljo skeniranja. To je postalo sredstvo za večkratno uporabo za prihodnje dogodke, s čimer je bilo odstranjeno ugibanje iz procesa načrtovanja.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Grafikon, ki prikazuje razmerje med razdaljo skeniranja, najmanjšo velikostjo QR in dimenzijami modula za vsak format dogodka',
          caption: 'Matrika velikosti: izračunane mere, ki zagotavljajo zanesljivo skeniranje na pričakovani razdalji gledanja vsakega formata',
        },
      ],
    },
    {
      heading: 'Rezultati proizvodnje',
      paragraphs: ['Preverjanje na dan konference je bilo sistematično: osebje je preizkusilo vsak nameščen QR, preden so se vrata odprla. Vložki značke so takoj skenirani na dosegu roke. Namizni šotori so delovali zanesljivo pri spremenljivi osvetlitvi sob za počitek. Odrski transparent - sramota prejšnjega dogodka - je uspešno skeniral s sredine prostora za občinstvo.', 'Več kot 2000 udeležencev ni zabeležilo nobenih pritožb glede skeniranja. Operativna zmaga je bila enako pomembna: ko je dodatek sponzorja v zadnjem trenutku zahteval nove oznake, jih je produkcijska ekipa v nekaj minutah ustvarila iz glavnega SVG, prepričana, da se bo ujemala z vsem ostalim.', 'Oglejte si vodnik za učenje o kodah QR, pripravljenih za tiskanje, za ogrodje odločanja SVG proti PNG in najboljše prakse predaje.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografija dogodka, ki prikazuje udeležence, kako uspešno skenirajo kode QR različnih velikosti in razdalj po celotnem prizorišču',
          caption: 'Uspeh konferenčnega dneva: zanesljivo skeniranje v vseh formatih, od bližinskih posnetkov značk do posnetkov pasic na odru',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Brskajte po člankih Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Študija primera: digitalni zaslon letališkega salona',
      paragraphs: ['Ta primer sledi letalskemu salonu, ki je na svojih digitalnih pozdravnih zaslonih uporabljal statične kode QR. Zasloni so prikazovali vrtečo se promocijsko vsebino, toda koda QR za prijavo v salon je ležala v kotu, statična in zlahka spregledana. Analitika je pokazala, da je samo 15 % upravičenih gostov uporabilo prijavo QR, čeprav je bila hitrejša od čakalne vrste na mizi. Večina gostov tega enostavno ni opazila.', 'Hipoteza je bila preprosta: v vizualno zasedenem okolju z premikajočo se vsebino postane statični QR neviden. Rešitev je bila potrebna, da bi bil QR opazen, ne da bi pri tem ogrozili zanesljivost, potrebno za potek prijave, kjer bi napaka pomenila razočarane potnike in daljše čakalne vrste na mizi.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Digitalni zaslon v letališkem salonu, ki prikazuje promocijsko vsebino z majhno, statično kodo QR v kotu',
          caption: 'Izvirna nastavitev: statični QR, izgubljen v morju dinamične promocijske vsebine, ki dosega le 15-odstotno sprejetje',
        },
      ],
    },
    {
      heading: 'Oblikovanje varne animacije',
      paragraphs: ['Digitalni napisi v salonu so uporabljali velike LED plošče – zahtevno okolje, kjer bi lahko agresivna animacija povzročila težave pri skeniranju. Oblikovalska ekipa je začela konzervativno: učinek nežnega pulza, ki je subtilno razširil in skrčil vizualno prisotnost QR-ja, ne da bi spremenil dejansko strukturo kode. Čas okvirja je bil nastavljen počasi (250 ms), da bi se izognili težavam z utripanjem pri hitrosti osveževanja LED.', 'Preverjanje varnostnega načina je potrdilo, da je vsak okvir še vedno mogoč za pregledovanje. Dodatno testiranje na dejanskih ploščah LED je razkrilo, da mora biti impulz še bolj subtilen, kot so predlagali predogledi na namizju - svetlost LED in vidni koti so vplivali na zaznani kontrast bolj, kot je bilo pričakovano.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Plošča z nastavitvami animacije ANQR, ki prikazuje konfiguracijo impulza: počasen čas, subtilna intenzivnost, omogočen varnostni način',
          caption: 'Konfiguracija animacije: parametri, nastavljeni za zaslon LED plošče, hkrati pa ohranjajo zanesljivost skeniranja v vsakem okvirju',
        },
      ],
    },
    {
      heading: 'Integracija z vsebino signalizacije',
      paragraphs: ['Animirani QR je bil postavljen v namensko \'stabilno cono\' postavitve zaslona – območje, ki je ostalo nespremenjeno, medtem ko se je promocijska vsebina vrtela v glavnem območju prikaza. Ta ločitev je bila ključnega pomena: QR je potreboval vizualno stabilnost za skeniranje, čeprav je pritegnil pozornost s svojo subtilno animacijo.', 'Poleg QR-ja je bil dodan jasen poziv k dejanju: \'Preskočite čakalno vrsto – skenirajte za prijavo.\' Besedilo je ostalo statično, medtem ko je QR utripal, kar je ustvarilo vizualno hierarhijo, ki je pritegnila pozornost k možnosti skeniranja, ne da bi preobremenila promocijsko vsebino.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Diagram postavitve zaslona, ki prikazuje animirani QR v stabilnem območju, medtem ko se promocijska vsebina vrti v glavnem območju',
          caption: 'Dodelitev prostora na zaslonu: animirani QR zavzema stabilno območje, ločeno od vrteče se promocijske vsebine',
        },
      ],
    },
    {
      heading: 'Tehnična uvedba',
      paragraphs: ['Animirani QR je bil izvožen kot GIF z optimiziranimi nastavitvami za signalni CMS. Velikost datoteke je bila pomembna – sistem za upravljanje vsebin v salonu je imel omejitve nalaganja, prevelike datoteke pa so povzročale zatikanje pri predvajanju. Končni izvoz je uravnotežil vizualno kakovost glede na velikost datoteke z omejitvijo barvne palete in optimizacijo števila sličic.', 'Uvedba je vključevala nadomestno možnost: če se GIF iz kakršnega koli razloga ne bi predvajal, bi sistem za označevanje prikazal statično varnostno kopijo PNG. Ta redundanca je zagotovila, da zmožnost prijave ni bila nikoli izgubljena zaradi tehničnih težav z animacijo.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Vmesnik CMS, ki prikazuje nalaganje animiranega QR s konfigurirano nadomestno statično sliko',
          caption: 'Konfiguracija Signage CMS: animirani primarni s statično rezervo, ki zagotavlja, da zmožnost prijave ni nikoli prekinjena',
        },
      ],
    },
    {
      heading: 'Izmerjeni vpliv',
      paragraphs: ['Po enem mesecu delovanja se je uporaba QR prijave povečala s 15 % na 24 % – kar je 60 % relativno izboljšanje. Ankete povratnih informacij gostov so pokazale, da je bil animirani QR "lažje opazen" in "deloval je bolj sodobno". Čakalne vrste na mizi so se v obdobjih največje obremenitve merljivo zmanjšale, saj si je več gostov samopostrežno služilo prek QR-ja.', 'Pomembno je, da so poročali o ničelnih napakah pri skeniranju kljub več tisoč dnevnim pregledom. Konzervativni pristop animacije je dosegel cilj pozornosti, ne da bi žrtvoval zanesljivost, ki jo je zahteval tok prijave. Lounge je nato podobne animirane QR-je objavil na svojih drugih lokacijah.', 'Oglejte si vodnik za učenje o animiranih kodah QR za digitalne napise za tehnična načela v ozadju oblikovanja varne animacije.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Nadzorna plošča, ki prikazuje povečanje stopnje sprejemanja, skrajšanje časa v čakalni vrsti in zanesljivost skeniranja brez napak v obdobju uvajanja',
          caption: 'En mesec podatkov: 60-odstotno povečanje uporabe, skrajšane čakalne vrste in ohranjena popolna zanesljivost skeniranja',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Brskajte po člankih Learn',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Študija primera: Globalna uvedba QR kampanje',
      paragraphs: ['Ta primer sledi podjetju zabavne elektronike, ki lansira nov izdelek hkrati na 12 trgih v 8 jezikih. Vsaka regionalna marketinška ekipa je morala izdelati embalažo, maloprodajne zaslone in promocijska gradiva s kodami QR, ki povezujejo na lokalizirane strani izdelkov. Prejšnje izdaje so povzročile nedosleden stil QR, občasne napake pri skeniranju in \'telefonsko igro\' spreminjanja konfiguracije, ko je vsaka ekipa poustvarila kode iz posnetkov zaslona.', 'Rešitev je izkoristila konfiguracijske povezave ANQR za vzpostavitev enotnega vira resnice, do katerega je lahko dostopala vsaka regionalna ekipa, ne glede na jezik vmesnika. Koristni tovor QR je uporabil pametno preusmeritev, ki je zaznala jezik uporabnika, tako da je ena koda delovala globalno, medtem ko je zagotavljala lokalizirane izkušnje.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Zemljevid sveta, ki prikazuje 12 tržnih lokacij s kodami QR, nekatere med seboj vizualno niso skladne',
          caption: 'Izziv: 12 trgov, 8 jezikov in zgodovina nedoslednih implementacij QR v regijah',
        },
      ],
    },
    {
      heading: 'Vzpostavitev glavne konfiguracije',
      paragraphs: ['Skupina za globalno blagovno znamko je ustvarila avtoritativno konfiguracijo QR v ANQR: barve blagovne znamke, ki se ujemajo z vizualno identiteto proizvodne linije, popravek napak H za zanesljivost v vseh tiskarskih in digitalnih aplikacijah ter slog, ki bi se dosledno ponavljal ne glede na lokalne proizvodne metode. Konfiguracija je bila zaklenjena in povezava za skupno rabo dokumentirana v povzetku globalne kampanje.', 'Kritično je, da je kodirani URL uporabil storitev preusmeritve, ki zaznava jezik. Pri skeniranju so bili uporabniki samodejno preusmerjeni na stran izdelka v lokalnem jeziku. To je pomenilo, da lahko vseh 12 trgov uporablja enake kode QR – brez variacij tovora za posamezen trg, ki bi lahko povzročile napake.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Vmesnik ANQR, ki prikazuje glavno konfiguracijo z barvami blagovne znamke, ECC H in URL-jem pametne preusmeritve',
          caption: 'Glavna konfiguracija: globalni standardi blagovne znamke, kodirani v en sam vir resnice, ki ga je mogoče deliti',
        },
      ],
    },
    {
      heading: 'Potek dela regionalne ekipe',
      paragraphs: ['Vsaka regionalna marketinška ekipa je prejela konfiguracijsko povezavo s preprostimi navodili: odprite povezavo, preverite, ali se predogled ujema s smernicami blagovne znamke, izvozite v zahtevani obliki za vašo aplikacijo. Vmesnik ANQR je prikazan v želenem jeziku vsake ekipe, vendar so osnovne nastavitve QR ostale enake ne glede na jezik vmesnika.', 'Ko je japonska ekipa potrebovala SVG za vrhunske maloprodajne zaslone in brazilska ekipa PNG za družbene medije, sta bila oba izvožena iz iste konfiguracije. Ko je prodajalec tiska nemške ekipe zahteval določene barvne vrednosti, se je lahko neposredno skliceval na konfiguracijo, namesto da bi ugibal iz posnetka zaslona.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Posnetki zaslona, ki prikazujejo isto konfiguracijsko povezavo, odprto v japonskem, portugalskem in nemškem vmesniku',
          caption: 'Ista konfiguracija, različni vmesniki: regionalne ekipe delajo v svojem želenem jeziku, hkrati pa ohranjajo globalno doslednost',
        },
      ],
    },
    {
      heading: 'Ravnanje z regionalnimi različicami',
      paragraphs: ['Nekateri trgi so zahtevali manjše prilagoditve. Kitajska ekipa je potrebovala različico z okvirjem, optimiziranim za WeChat, za skupno rabo v družabnih omrežjih. Namesto da bi spremenili master, so ustvarili dokumentirano različico z lastno konfiguracijsko povezavo, ki je v knjižnici sredstev kampanje jasno označena kot \'različica CN-WeChat\'. To je ohranilo sledljivost in hkrati omogočilo potrebno lokalizacijo.', 'Ekipa blagovne znamke je vzpostavila preprosto pravilo: vsaka sprememba glavnega zahteva novo, dokumentirano konfiguracijsko povezavo. Brez sprememb izvoženih datotek, brez \'hitrih popravkov\' v programski opremi za načrtovanje. To je preprečilo zamik konfiguracije, ki je pestil prejšnje zagone.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Vmesnik knjižnice sredstev, ki prikazuje glavno konfiguracijo in odobrene regionalne različice, vsaka s svojo povezavo',
          caption: 'Upravljanje sredstev oglaševalske akcije: glavna konfiguracija in dokumentirane različice, vse sledljive prek konfiguracijskih povezav',
        },
      ],
    },
    {
      heading: 'Zaženite rezultate',
      paragraphs: ['Na dan lansiranja izdelka so bile kode QR uporabljene na embalaži, maloprodajnih zaslonih, materialih za dogodke in digitalnih kampanjah na vseh 12 trgih hkrati. Revizije kakovosti so potrdile vizualno doslednost po regijah – QR na maloprodajnih zaslonih v Tokiu se je ujemal s QR na embalaži v São Paulu in QR na pasicah dogodkov v Berlinu.', 'Po trgih niso poročali o ničelnih napakah skeniranja. Ko je bila potrebna sprememba URL-ja strani izdelka po lansiranju, je storitev za preusmeritev to obravnavala nevidno – ponovno tiskanje ni bilo potrebno. Globalna ekipa je ocenila, da je pristop konfiguracijske povezave prihranil več kot 40 ur časa koordinacije v primerjavi z njihovo prejšnjo metodologijo zagona.', 'Oglejte si vodnik za učenje o medjezičnem sodelovanju QR za načela poteka dela, ki stojijo za doslednostjo globalne kampanje.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Mreža fotografij, ki prikazuje dosledno uporabo QR na različnih trgih: maloprodaja v Tokiu, embalaža v São Paulu, dogodki v Berlinu',
          caption: 'Dosežena globalna doslednost: enaka predstavitev QR na 12 trgih kljub različnim jezikom, prodajalcem in formatom',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Odprite generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Brskajte po člankih Learn',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Brskajte po člankih Learn', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Odprite celoten uporabniški priročnik', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Odprite galerijo', type: 'gallery' },
  ],
};
