import type { PageDefinition } from "../types";

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: "Mokykitės naudodami ANQR",
  description:
    'Praktiški, pirmiausia verslui skirti vadovai, kaip QR kodus paversti tikru rinkodaros turtu – ne tik funkciniais kvadratais. Sužinokite, kaip atnaujinti senus pardavimo vietos kodus, sukurti suderinamus mokėjimo QR ženklus, paruošti spausdinimui paruoštus eksportus, saugiai naudoti animaciją skaitmeniniuose ekranuose ir bendrinti užrakintas konfigūracijas tarp daugiakalbių komandų naudojant ANQR („inchor") nuorodas.',
  lastUpdated: "2026 m. vasario 1 d",

  primaryLinks: [
    { href: "/?lang=${lang}", label: "Atidarykite generatorių", type: "generator" },
    { href: "/examples?lang=${lang}", label: "Peržiūrėkite QR pavyzdžius", type: "example" },
    { href: "/guide?lang=${lang}", label: "Atidarykite visą vartotojo vadovą", type: "guide" },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: "Esamų QR kampanijų tobulinimas",
      paragraphs: [
        "Daugelis įmonių turi QR kodus, išsklaidytus visoje savo veikloje – ant meniu, prekystalių stendų, pakuočių ir reklaminės medžiagos. Daugelis šių kodų buvo sukurti prieš daugelį metų naudojant pagrindinius generatorius, todėl atsirado bendri juodai balti kvadratai, kurie nesukelia pasitikėjimo ar neatitinka jūsų prekės ženklo tapatybės. Šiame išsamiame vadove pateikiamas sistemingas požiūris į esamos QR infrastruktūros auditą, atnaujinimą ir optimizavimą, netrikdant jau sukurtų klientų kelionių.",
        "Strateginis QR kodų atnaujinimo, o ne keitimo pranašumas yra tęstinumo išsaugojimas. Jūsų klientai jau išmoko tikėtis tam tikrų kelionių vietų, kai nuskaito jūsų kodus. Išlaikydami užkoduotus URL identiškus ir žymiai pagerindami vaizdinį pateikimą, nuskaitymo patikimumą ir prekės ženklo derinimą, sukuriate sklandų perėjimą, kuris padidina pasitikėjimą nereikalaujant jokių skaitmeninės infrastruktūros ar analizės stebėjimo pakeitimų.",
      ],
      images: [
        {
          src: "/images/learn/improve-existing-overview.png",
          alt: "Greta esantis palyginimas, kuriame rodomas išblukęs bendras QR kodas šalia modernios prekės ženklo versijos, koduojančios tą patį URL",
          caption:
            "Prieš ir po: tas pats paskirties URL pakeistas iš bendro kodo, kurio data yra nurodyta, į profesionalų prekės ženklo turtą",
        },
      ],
    },
    {
      heading: "Kodėl senieji QR kodai neveikia",
      paragraphs: [
        "QR kodai, sukurti ankstyvuoju priėmimo etapu, ypač 2020–2021 m., kai įmonės suskubo diegti bekontakčius sprendimus, dažnai kenčia nuo kelių svarbių problemų. Maži klaidų taisymo nustatymai daro juos trapius spausdinant ant tekstūruotų paviršių arba žiūrint esant sudėtingam apšvietimui. Nepakankamas tylių zonų skaičius sukelia nuskaitymo gedimus, kai kodai dedami šalia kitų vaizdo elementų. Bendrasis stilius nesugeba perduoti prekės ženklo teisėtumo, todėl kyla dvejonių ir sumažėja nuskaitymo dažnis.",
        "Be techninių apribojimų, senieji kodai dažnai rodo praleistas prekės ženklo kūrimo galimybes. Kiekvienas QR kodas yra kontaktinis taškas su jūsų klientu – momentas, kai jis aktyviai dalyvauja ir nori imtis veiksmų. Profesionalaus stiliaus kodas, atitinkantis jūsų prekės ženklo spalvas, apimantis atitinkamas saugos ribas ir pasirenkamus prekės ženklo elementus, paverčia šią priemonę rinkodaros priemone, kuri sustiprina jūsų tapatybę kiekvienos sąveikos metu.",
      ],
    },
    {
      heading: "QR kodo audito atlikimas",
      paragraphs: [
        "Pradėkite naujovinimo projektą sukurdami išsamią kiekvieno QR kodo, šiuo metu įdiegto jūsų įmonėje, sąrašą. Įrašykite fizinę vietą, užkoduotą paskirties vietą, dabartinę spausdintos medžiagos būklę ir tipišką nuskaitymo aplinką, įskaitant apšvietimo sąlygas ir žiūrėjimo kampus. Išbandykite kiekvieną kodą su keliais įrenginiais – senesni išmanieji telefonai ir nebrangūs įrenginiai dažnai atskleidžia patikimumo problemas, kurias užmaskuoja aukščiausios kokybės telefonai.",
        "Ypatingą dėmesį atkreipkite į kodus, kuriuose yra daug pinigų: mokėjimo taškuose, registracijos vietose ir reklaminiuose ekranuose, kur nuskaitymo gedimas tiesiogiai veikia pajamas arba klientų patirtį. Jiems turėtų būti teikiama pirmenybė nedelsiant atnaujinant. Taip pat atkreipkite dėmesį į kodus, kurie rodomi fotografijos ar vaizdo įrašų turinyje, nes norint atnaujinti vaizdinius išteklius reikės derinti su rinkodaros komanda.",
      ],
      images: [
        {
          src: "/images/learn/improve-existing-audit.png",
          alt: "Kontrolinio sąrašo sąsaja, rodanti QR audito kategorijas: vietą, būklę, nuskaitymo patikimumą ir prioriteto įvertinimą",
          caption:
            "Sistemingas QR audito šablonas, skirtas dokumentuoti ir nustatyti jūsų kandidatų prioritetus",
        },
      ],
    },
    {
      heading: "Saugaus atnaujinimo strategija",
      paragraphs: [
        "Pagrindinė QR atnaujinimo taisyklė yra paskirties vietos išsaugojimas. Iš kiekvieno esamo kodo ištraukite tikslų URL ir užkoduokite jį identiškai naujoje versijoje. Tai užtikrina, kad visa esama analizė, peradresavimo logika ir klientų lūkesčiai išliks nepakitę. Jei jums reikia lankstumo būsimiems naujinimams, tai idealus laikas pristatyti trumpąjį URL arba peradresavimo paslaugą, tačiau įgyvendinkite tai kaip atskirą projektą, kad išvengtumėte sudėtingų pakeitimų.",
        "Norėdami vizualiai atnaujinti, pritaikykite sluoksnių patobulinimus: pirmiausia užtikrinkite techninį patikimumą (atitinkamą klaidų taisymą ir tylią zoną), tada pridėkite prekės ženklo stilių (spalvas, modulių formas) ir galiausiai apsvarstykite pasirenkamus patobulinimus (centrines perdangas, rėmelius). Kiekvienas sluoksnis turi būti patikrintas prieš tęsiant. ANQR saugos režimas padeda įgyvendinti šiuos prioritetus, įspėdamas, kai stiliaus pasirinkimai gali pakenkti nuskaitomumui.",
      ],
    },
    {
      heading: "Pridėkite prekės ženklo tapatybę nepakenkiant patikimumui",
      paragraphs: [
        "Veiksmingas QR prekės ženklas subalansuoja vizualinį poveikį ir nuskaitymo patikimumą. Pradėkite nuo spalvos: pakeiskite numatytąjį juodą priekinį planą pagrindine prekės ženklo spalva, užtikrindami pakankamą kontrastą fone. Daugeliui prekių ženklų geriausiai tinka tamsios spalvos šviesiame fone. Venkite mažo kontrasto derinių, gradientų, kurie sumažina kraštų aiškumą, arba spalvų, kurios atrodo panašios įprastomis apšvietimo sąlygomis.",
        "Modulio formos pritaikymas suteikia dar vieną prekės ženklo kūrimo galimybę su minimaliu poveikiu patikimumui. Suapvalinti moduliai sukuria švelnesnę, lengviau pasiekiamą išvaizdą, išlaikant puikų nuskaitomumą. Taškinio stiliaus moduliai puikiai tinka šiuolaikiniams, technologiškai pažangiems prekių ženklams. Sujungti moduliai tinka pramoniniam ar verslo identitetui. Kad ir kokį stilių pasirinktumėte, išlaikykite nuoseklumą visose QR sistemose, kad prekės ženklas būtų nedelsiant atpažįstamas.",
      ],
      images: [
        {
          src: "/images/learn/improve-existing-branding.png",
          alt: "Spalvų rato diagrama, rodanti optimalius QR spalvų derinius su kontrasto santykio indikatoriais",
          caption:
            "Prekės ženklo spalvų pasirinkimo vadovas, kuriame rodomi didelio kontrasto deriniai, išlaikantys nuskaitymo patikimumą",
        },
      ],
    },
    {
      heading: "Testavimo ir patvirtinimo protokolas",
      paragraphs: [
        "Niekada nediekite atnaujintų QR kodų be griežto testavimo. Išspausdinkite tikslaus dydžio ir tos pačios medžiagos fizinį įrodymą, kaip ir galutinis diegimas. Išbandykite tikroje vietoje, kurioje kodas bus, skirtingu paros metu, kad atsižvelgtumėte į apšvietimo pokyčius. Naudokite bent tris skirtingus įrenginius: dabartinį pavyzdinį telefoną, vidutinės klasės įrenginį ir senesnį arba nebrangų išmanųjį telefoną.",
        "Įrašykite kiekvieno testo nuskaitymo laiką ir sėkmės rodiklius. Gerai optimizuotas kodas turi būti nuskaitytas per 1–2 sekundes bet kuriame pakankamai moderniame įrenginyje. Jei matote nuolatinius vėlavimus ar gedimus, sumažinkite stiliaus intensyvumą – pašalinkite arba sumažinkite perdangas, padidinkite tylios zonos dydį arba perjunkite į aukštesnį klaidų taisymo lygį. Patikimumas visada yra svarbesnis už vizualinį rafinuotumą.",
      ],
    },
    {
      heading: "Konfigūracijos užrakinimas siekiant nuoseklumo",
      paragraphs: [
        "Patvirtinę optimalią konfigūraciją, išsaugokite ją naudodami ANQR bendrinamas nuorodas. Taip sukuriamas nuolatinis kiekvieno nustatymo, naudojamo patvirtintam kodui generuoti, įrašas – spalvos, modulio stilius, klaidų taisymas, dydis ir bet kokios perdangos. Pasidalykite šia nuoroda su savo projektavimo komanda, spaudinių pardavėjais ir visais, kuriems ateityje gali prireikti atgaminti kodą.",
        'Šis konfigūracijos užraktas apsaugo nuo laipsniško pablogėjimo, kuris kenkia daugeliui QR diegimų. Be jo darbuotojai atkuria kodus iš ekrano kopijų, dizaineriai atkuria nustatymus iš atminties, o spausdinimo pardavėjai atlieka „naudingus" pakeitimus. Kiekvienas variantas sukelia galimų problemų. Naudojant užrakintą konfigūracijos nuorodą, kiekviena kopija yra identiška jūsų patikrintam, patvirtintam originalui.',
      ],
      images: [
        {
          src: "/images/learn/improve-existing-lock.png",
          alt: "Diagrama, rodanti konfigūracijos nukrypimą: ekrano kopijos, vedančios į pramogas, vedančias į variantus, palyginti su vienu tiesos šaltinio nuoroda",
          caption:
            "Užkirskite kelią konfigūracijos nukrypimui, sukurdami vieną patikimą visų QR reprodukcijų šaltinį",
        },
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced&ec=H#overlay",
          label: "Atidarykite generatorių",
          type: "generator",
        },
        {
          href: "/examples?lang=${lang}#section-0",
          label: "Peržiūrėkite QR pavyzdžius",
          type: "example",
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: "QR kodai mažmeniniams mokėjimams",
      paragraphs: [
        "Mokėjimo QR kodai veikia reikliausioje mažmeninės prekybos aplinkoje: operacijos momentu. Klientai yra pasirengę mokėti, dažnai už jų susidaro eilė, o kiekviena vėlavimo sekundė sukelia trintį. Tačiau šis aukšto slėgio momentas taip pat yra pagrindinis nekilnojamasis turtas prekės ženklo stiprinimui. Šiame vadove paaiškinama, kaip sukurti mokėjimų QR kodus, kurie akimirksniu nuskaitomi banko programose, o jų išvaizda yra profesionali, su prekės ženklu ir kuria klientų pasitikėjimą.",
        "Pagrindinis mokėjimo QR kodų principas yra patikimumas, o ne estetika. Gražiai sukurtas kodas, kurio nepavyksta nuskaityti vieno kliento banko programoje, atsisakius sandorių ir nusivylusių klientų kainuos daug daugiau, nei bet kada galėjo konservatyvus dizainas. Pradėkite nuo atitikties, padidinkite patikimumą, tada atsargiai įtraukite prekės ženklą tik ten, kur tai nepakenkia pagrindinei funkcijai.",
      ],
      images: [
        {
          src: "/images/learn/retail-payments-overview.png",
          alt: "Mažmeninės prekybos skaitiklio ekranas, kuriame rodomas mokėjimo QR kodas, nuskaitomas išmaniuoju telefonu su banko programa",
          caption:
            "Mokėjimo QR kodai turi iš karto veikti su banko ir piniginės programomis realiomis sąlygomis",
        },
      ],
    },
    {
      heading: "Mokėjimo QR standartų supratimas",
      paragraphs: [
        "Mokėjimo QR kodai paprastai atitinka regioninius standartus, kurie diktuoja naudingos apkrovos formatą. Singapūre PayNow QR naudoja specifinį formatavimą. Indijoje UPI kodai atitinka BharatQR arba UPI giliųjų nuorodų standartus. Europos SEPA mokėjimams naudojami EPC QR kodai. Kiekvienas standartas yra skirtas užtikrinti, kad banko programos galėtų akimirksniu atpažinti ir apdoroti mokėjimo informaciją. Nukrypstant nuo šių standartų – net ir šiek tiek – mokėjimo programos gali atmesti kodus, kuriuos bendrieji fotoaparatų skaitytuvai nuskaito be problemų.",
        "ANQR apima pagrindinių mokėjimo standartų šablonus, kurie automatiškai formatuoja jūsų prekybininko informaciją į reikalavimus atitinkančius naudingus krovinius. Visada naudokite šiuos šablonus, o ne rankiniu būdu kurdami mokėjimo eilutes, nes net ir nedidelės formatavimo klaidos gali sukelti operacijos nesėkmes. Jei jūsų regiono mokėjimo standartas nepasiekiamas kaip šablonas, tikslių formatavimo reikalavimų ieškokite mokėjimo paslaugų teikėjo techninėje dokumentacijoje.",
      ],
    },
    {
      heading: "Stalviršių dydžiai ir išdėstymas",
      paragraphs: [
        "Stalviršyje esantys QR kodai susiduria su unikaliais fiziniais iššūkiais. Klientai nuskaito ištiestos rankos atstumu, dažnai kampu, kartais per apsaugas nuo čiaudulio ar vitrinas. Viršutinis apšvietimas sukuria akinimo dėmes. Kodas konkuruoja su kitu netvarka dėl dėmesio ir aiškių vaizdo linijų. Dosniai nustatykite mokėjimo QR dydį – daugeliui skaitiklio programų rekomenduojamas mažiausiai 4–5 cm, padidinant, jei kodas yra už stiklo arba silpnai apšviestoje vietoje.",
        "Pozicija svarbi tiek pat, kiek dydis. Įdėkite kodą ten, kur klientai galėtų patogiai laikyti telefoną neužblokuodami eilės ar nepatogiai nepasiekdami. Nukreipkite ekraną į klientą, o ne padėkite jį lygiai. Jei įmanoma, naudokite matinį laminavimą arba neatspindinčias medžiagas, kad sumažintumėte viršutinio apšvietimo akinimą. Išbandykite galutinę vietą skirtingu paros metu, kad pastebėtumėte apšvietimo problemas.",
      ],
      images: [
        {
          src: "/images/learn/retail-payments-placement.png",
          alt: "Diagrama, rodanti optimalius QR išdėstymo aukščius ir kampus skirtingoms skaitiklio konfigūracijoms",
          caption:
            "Skaitiklio išdėstymo vadovas: optimalūs aukščiai, kampai ir atstumai patikimam mokėjimų nuskaitymui",
        },
      ],
    },
    {
      heading: "Konservatyvus mokėjimo kodų prekės ženklas",
      paragraphs: [
        "Mokėjimo programos yra mažiau atlaidžios nei bendrieji fotoaparatų skaitytuvai. Daugelis bankininkystės programų naudoja senesnius, paprastesnius QR skaitymo algoritmus, optimizuotus greičiui, o ne lankstumui. Tai reiškia, kad stilius, kuris puikiai veikia su telefono kamera, gali nepavykti naudojant tam tikras mokėjimo programas. Išlaikykite konservatyvų prekės ženklą: naudokite savo prekės ženklo spalvą pirmame plane, jei jis išlaiko stiprų kontrastą, bet venkite gradientų, sunkių perdangų ar dekoratyvinių elementų, kurie gali trukdyti atpažinti.",
        "Jei norite centrinio logotipo ar perdangos, laikykite jį labai mažą – ne daugiau kaip 10–15 % QR srities – ir nuodugniai išbandykite kiekvieną mokėjimo programą, kurią gali naudoti jūsų klientai. Daugelis įmonių pasirenka neperdengti mokėjimo kodų, pasilikdamos šį stilių QR kodų rinkodarai, kai patikimumo reikalavimai yra ne tokie griežti. Mokėjimo kodo užduotis yra apdoroti operacijas, o ne padaryti įspūdį vizualiai.",
      ],
      images: [
        {
          src: "/images/learn/retail-payments-branding.png",
          alt: "Palyginimas, rodantis priimtinus ir rizikingus mokėjimo QR kodų prekės ženklo lygius",
          caption:
            "Mokėjimo QR prekės ženklo spektras: nuo saugaus konservatyvaus stiliaus iki rizikingų dekoravimo būdų",
        },
      ],
    },
    {
      heading: "Pastabos apie medžiagą ir spaudą",
      paragraphs: [
        "Fizinė ekrano medžiaga daro didelę įtaką nuskaitymo patikimumui. Blizgus laminavimas atspindi viršutinius žibintus tiesiai į kliento kamerą. Tekstūruotos medžiagos gali iškraipyti modulio kraštus. Pigus spausdinimas gali sulieti smulkias detales. Norėdami gauti mokėjimų QR kodus, investuokite į kokybę: naudokite matinį arba satininį laminavimą, užtikrinkite didelės raiškos spausdinimą ir pakeiskite ekranus, kol jie nesusidėvėjo. Subraižytas arba išblukęs mokėjimo kodas kainuoja jums operacijas.",
        "Atsižvelkite į ekrano patvarumą ir pakeičiamumą. Skaitiklio ekranai liečiami, judinami, aptaškomi ir retkarčiais apverčiami. Suprojektuokite savo ekrano sistemą taip, kad QR įdėklą būtų galima lengvai pakeisti nekeičiant viso stovo. Paruoškite atsarginius spaudinius, sugeneruotus iš užrakintos konfigūracijos nuorodos, kad susidėvėjusius kodus būtų galima nedelsiant pakeisti.",
      ],
    },
    {
      heading: "Testavimas naudojant Real Payment Apps",
      paragraphs: [
        "Bendrieji fotoaparatų skaitytuvai iššifruos beveik bet kokį protingai suformatuotą QR kodą. Mokėjimo programos yra išrankesnės. Prieš įdiegdami bet kokį mokėjimo QR kodą, išbandykite jį su kiekviena mokėjimo programa, kurią gali naudoti jūsų klientai. Kelių mokėjimų aplinkoje tai gali reikšti bandymus su keliomis banko programomis, skaitmeninėmis piniginėmis ir mokėjimo platformomis. Dokumentuokite, kurias programas išbandėte ir jų versijas – mokėjimo programos dažnai atnaujinamos, o atnaujinimas gali pakeisti nuskaitymo elgseną.",
        "Bandymas tikroviškomis sąlygomis: tikrasis ekranas, tikrasis apšvietimas, tikrasis nuskaitymo atstumas. Kodas, kuris akimirksniu nuskaitomas ant jūsų stalo, gali būti sunkiai pasiekiamas ant prekystalio 17 val., kai popietės saulė sukuria akinimą. Išbandykite seniausią, pigiausią išmanųjį telefoną, kokį tik galite rasti – jei jis patikimai veiks biudžetiniame įrenginyje, veiks su viskuo. Pažymėkite bet kokį nuskaitymo laiką, ilgesnį nei 2 sekundes, kad būtų galima ištirti ir galimai pertvarkyti.",
      ],
      images: [
        {
          src: "/images/learn/retail-payments-testing.png",
          alt: "Testavimo kontrolinis sąrašas, kuriame rodomos įvairios mokėjimo programos, įrenginių tipai ir aplinkos sąlygos, kurias reikia patikrinti",
          caption:
            "Išsami mokėjimo QR testavimo matrica, apimanti programas, įrenginius ir aplinkos veiksnius",
        },
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Atidarykite generatorių",
          type: "generator",
        },
        {
          href: "/examples?lang=${lang}#section-5",
          label: "Peržiūrėkite QR pavyzdžius",
          type: "example",
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: "Spausdinti paruošti QR kodai: SVG vs PNG",
      paragraphs: [
        "Skirtumas tarp QR kodo, kuris puikiai nuskaito, ir to, kuris nepavyksta, dažnai priklauso nuo to, kaip jis buvo eksportuotas ir tvarkomas spausdinimo darbo eigoje. Šiame vadove paaiškinami esminiai vektorinių (SVG) ir rastrinių (PNG) formatų skirtumai, kada juos naudoti ir kaip perduoti QR kūrinius dizaineriams ir spaudinių pardavėjams taip, kad būtų išsaugotas nuskaitymo patikimumas nuo vizitinių kortelių iki reklaminio skydo dydžio ženklų.",
        "Spausdinimo gamyboje pateikiami kintamieji, kurių ekrane nėra: rašalo sklaida, substrato tekstūra, apdailos procesai ir kelių failų konvertavimo suminis poveikis. QR kodas, kuris puikiai atrodo jūsų projektavimo programinėje įrangoje, gali atsirasti iš spausdintuvo su sušvelnintais kraštais, sumažintu kontrastu arba subtiliai iškraipytais moduliais. Formatavimo pasirinkimo ir darbo eigos geriausios praktikos supratimas apsaugo nuo šių tylių gedimų.",
      ],
      images: [
        {
          src: "/images/learn/print-ready-overview.png",
          alt: "Padidintas vaizdas, kuriame lyginami vektoriniai QR moduliai su aiškiais kraštais su rastriniais moduliais, kuriuose rodomi pikselių artefaktai",
          caption:
            "Vektorius ir rastras spausdinimo masteliu: tikslumo skirtumas, lemiantis nuskaitymo patikimumą",
        },
      ],
    },
    {
      heading: "Kodėl spausdinimui pirmenybė teikiama vektoriui (SVG).",
      paragraphs: [
        "SVG failai QR kodus apibūdina kaip matematines figūras, o ne kaip pikselių tinklelius. Tai reiškia, kad kodą galima padidinti iki bet kokio dydžio – nuo ​​1 cm etiketės iki 10 metrų reklamjuostės – neprarandant krašto ryškumo. Spausdintuvo RIP (rastrinio vaizdo procesorius) vektorius atvaizduoja natūralia išvesties įrenginio skiriamąja geba, užtikrinant, kad kiekvienas modulio kraštas būtų toks ryškus, kiek leidžia aparatinė įranga. Nėra jokios interpoliacijos, anti-aliasing artefaktų, nėra susikaupusio suliejimo dėl kelių dydžio keitimo operacijų.",
        "Be mastelio, SVG failai yra patikimesni profesionaliose darbo eigose. Jie išgyvena keliones pirmyn ir atgal naudodami projektavimo programinę įrangą be degradacijos. Jų spalvą galima pakoreguoti neatimant iš naujo. Jie aiškiai įterpiami į PDF failus, kad būtų paruošti spaudai. Bet kuriai spausdinimo programai, kuriai svarbi kokybė, SVG turėtų būti numatytasis eksportavimo formatas.",
      ],
    },
    {
      heading: "Kai PNG yra priimtinas",
      paragraphs: [
        "PNG tampa būtinas, kai jūsų darbo eiga arba paskirties platforma nepalaiko vektorinių formatų. Kai kurioms žiniatinklio platformoms, ženklų TVS sistemoms ir senoms spausdinimo darbo eigoms reikalingi rastriniai vaizdai. Tokiais atvejais PNG gali veikti gerai, bet tik tuo atveju, jei laikotės griežtų taisyklių: eksportuokite galutiniu fiziniu dydžiu ir skiriamąja geba, niekada nedidinkite masto po eksportavimo ir išvengsite nuostolingo glaudinimo ar formato konvertavimo.",
        "Svarbiausia PNG taisyklė – prieš eksportuojant apskaičiuoti reikiamus pikselių matmenis. Jei jūsų QR spausdins 5 cm, o spausdintuvas veiks 300 DPI, jums reikia maždaug 590 pikselių. Eksportuokite tokio ar didesnio dydžio, tada sumažinkite mastelį, jei reikia – niekada nedidinkite. Įtraukite šią informaciją į failo pavadinimą arba metaduomenis, kad būsimi naudotojai netyčia nenaudotų konkretaus dydžio eksportavimo.",
      ],
      images: [
        {
          src: "/images/learn/print-ready-resolution.png",
          alt: "Skaičiuotuvo sąsaja, rodanti ryšį tarp fizinio dydžio, DPI ir reikalingų pikselių matmenų",
          caption:
            "Spausdinimo raiškos skaičiuoklė: nustato minimalius pikselių matmenis pagal tikslinį išvesties dydį",
        },
      ],
    },
    {
      heading: "Paaiškintos ANQR eksporto parinktys",
      paragraphs: [
        'ANQR siūlo kelis SVG eksportavimo režimus, kad tiktų įvairioms darbo eigoms. „True Vector" režimas sukuria gryną kelią pagrįstą išvestį, idealiai tinkančią spausdinimui ir profesionaliems projektavimo įrankiams. Kai pridėjote rastrinių perdangų ar tam tikrų efektų, ANQR gali juos įterpti, išlaikydamas vektorinius modulius, arba galite eksportuoti visiškai rastruotą versiją jūsų nurodyta raiška. Suprasdami šias parinktis galėsite pasirinkti tinkamą eksportavimą kiekvienam naudojimo atvejui.',
        "Eksportuojant PNG, ANQR leidžia nurodyti tikslius matmenis ir apima skaidraus fono parinktis. DPI nustatymas padeda apskaičiuoti tinkamus spausdinimo dydžius, tačiau atminkite, kad DPI yra metaduomenys – spausdinimui svarbu turėti pakankamai pikselių jūsų fiziniam dydžiui. Jei abejojate, eksportuokite didesnę sumą, nei manote, kad jums reikia; sumažinus kokybę išsaugoma, o padidinus ją sunaikinama.",
      ],
    },
    {
      heading: "Failų paruošimas perdavimui",
      paragraphs: [
        "Perduodami QR kūrinius dizaineriams ar spaudinių pardavėjams, įtraukite aiškias specifikacijas: numatomą fizinį dydį, minimalius tylios zonos reikalavimus ir visas spalvų erdvės aplinkybes. Svarbiausioms programoms pateikite ir SVG pagrindinį, ir didelės raiškos PNG atsarginę kopiją, aiškiai pažymėtą jų paskirtimi. Įtraukite ANQR konfigūracijos nuorodą, kad prireikus būtų galima atkurti kodą.",
        "Numatykite įprastas perdavimo proceso klaidas. Aiškiai nurodykite, kad QR neturėtų būti keičiamas, pasukamas, iškreiptas ar taikomi efektai. Nurodykite, kad tylioji zona turi likti laisva – jokių apkarpymo žymių, registracijos ženklų ar dizaino elementų. Jei QR bus dedamas ant spalvoto ar fotografinio fono, pateikite versiją su nepermatoma pagrindo forma, kad užtikrintumėte tinkamą kontrastą.",
      ],
      images: [
        {
          src: "/images/learn/print-ready-handoff.png",
          alt: "Failų paketo diagrama, rodanti SVG pagrindinį failą, PNG atsarginę kopiją, specifikacijų dokumentą ir konfigūracijos nuorodą",
          caption:
            "Profesionalus QR perdavimo paketas: viskas, ko reikia dizaineriui ar spaudinių pardavėjui, kad būtų galima tiksliai atkurti",
        },
      ],
    },
    {
      heading: "Spausdinimo dokumentų tikrinimas",
      paragraphs: [
        "Niekada netvirtinkite tiražo nenuskaitę fizinio pavyzdžio. Paprašykite ant faktinio pagrindo atspausdinto pavyzdžio su faktine apdaila, kuri bus naudojama gamyboje. Nuskaitykite įrodymą apšvietimo sąlygomis, panašiomis į ten, kur bus rodomas galutinis kūrinys. Išbandykite su keliais įrenginiais, įskaitant senesnius išmaniuosius telefonus, kurių kokybė gali trūkti.",
        "Jei įrodymas nuskaitomas lėtai arba nenuosekliai, prieš patvirtindami ištirkite. Dažnos problemos yra nepakankamas kontrastas ant spalvotų pagrindų, tylios zonos pažeidimai dėl apipjaustymo, rašalo pasklidimo minkštinimo modulio kraštai arba laminavimas, sukeliantis blizgesį. Bet kuris iš jų gali būti išspręstas prieš pradedant tiražą, bet tik tuo atveju, jei juos pastebėsite bandomajame etape.",
      ],
      images: [
        {
          src: "/images/learn/print-ready-proof.png",
          alt: "Įrodymų peržiūros kontrolinis sąrašas su nuskaitymo testo rezultatais, kontrasto matavimais ir patvirtinimo parašais",
          caption:
            "Spausdinimo įrodymo tikrinimo darbo eiga: sistemingas bandymas prieš įsipareigojant gamybos kiekius",
        },
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Atidarykite generatorių",
          type: "generator",
        },
        {
          href: "/examples?lang=${lang}#section-11",
          label: "Peržiūrėkite QR pavyzdžius",
          type: "example",
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: "Animuotų QR kodų kūrimas",
      paragraphs: [
        "Animuoti QR kodai sujungia standartinių QR kodų funkcionalumą su akį traukiančiu judesiu, kuris žymiai padidina įsitraukimo rodiklius. Skaitmeniniuose iškabose, socialinėje žiniasklaidoje ir interaktyviuose ekranuose animacija statinį naudingumą paverčia patraukliu vaizdiniu elementu, kuris traukia akį ir kviečia bendrauti. Šiame vadove aprašomi animuotų QR kodų kūrimo principai, metodai ir praktiniai apribojimai, kurie patikimai nuskaito ir sukuria vizualinį poveikį.",
        "Pagrindinis animuotų QR kodų iššūkis yra suderinti vizualinį susidomėjimą ir nuskaitymo patikimumą. Kiekvienas kadras turi būti nuskaitomas atskirai – skaitytuvas gali užfiksuoti kodą bet kuriuo animacijos ciklo momentu. Šis apribojimas formuoja kiekvieną dizaino sprendimą: kurie elementai gali judėti, kiek jie gali keistis ir kas turi išlikti stabilus visos animacijos metu.",
      ],
      images: [
        {
          src: "/images/learn/animated-overview.png",
          alt: "Skaitmeninių ženklų ekranas, kuriame rodomas animuotas QR kodas, pritraukiantis žiūrovo dėmesį viešoje erdvėje",
          caption:
            "Animuoti QR kodai skaitmeniniuose ženkluose: judesys, patraukiantis dėmesį ir skatinantis nuskaityti",
        },
      ],
    },
    {
      heading: "Kaip animacija veikia nuskaitomumą",
      paragraphs: [
        "QR skaitytuvai veikia fiksuodami vieną kadrą ir analizuodami šviesių ir tamsių modulių modelį. Kad animuotas kodas veiktų, kiekviename kadre turi būti pilnas galiojantis QR šablonas. Tai pašalina animacijas, kurios keičia kodo struktūrą, ištirpdo modulius arba žymiai pakeičia kontrasto modelį. Duomenis pernešantys moduliai – iš pažiūros atsitiktinis modelis centre – turi išlikti vizualiai stabilūs.",
        "Saugūs animacijos metodai modifikuoja elementus, kuriuose nėra duomenų: fonus, spalvas, dekoratyvinius rėmelius ir perdangos elementus. Struktūriniai komponentai – ieškiklio raštai (didieji kampiniai kvadratai), laiko modeliai (kintamos linijos) ir lygiavimo modeliai (mažesni kvadratai didesniuose koduose) – turi išlaikyti savo pozicijas ir proporcijas. Darbas laikantis šių apribojimų vis dar leidžia sukurti stebėtinai dinamiškas ir patrauklias animacijas.",
      ],
    },
    {
      heading: "Veikiantys animacijos metodai",
      paragraphs: [
        "Spalvų ciklas suaktyvina priekinio plano ir fono spalvas per paletę, išlaikant pakankamą kontrastą kiekviename žingsnyje. Taip sukuriamas ryškus, dėmesį patraukiantis efektas su minimalia nuskaitymo rizika – tol, kol kontrastas niekada nenukrenta žemiau įskaitomo lygio. Išankstiniai ANQR spalvų ciklo nustatymai sukurti taip, kad būtų galima nuskaityti visą ciklą.",
        "Animuotos perdangos pateikia judančius vaizdus už pusiau permatomo QR modelio. Kodas išlieka stabilus, o fonas animuoja – galbūt rodomas kilpinis vaizdo įrašas, animuoti prekės ženklo elementai arba abstrakti judesio grafika. Šis metodas reikalauja kruopštaus intensyvumo valdymo, kad fonas neužgožtų QR modelio, tačiau sukuriami vizualiai įspūdingiausi rezultatai.",
      ],
      images: [
        {
          src: "/images/learn/animated-layers.png",
          alt: "Diagrama, rodanti daugiasluoksnę animuoto QR struktūrą: stabilus kodo sluoksnis virš animuoto fono sluoksnio",
          caption:
            "Animacijos sluoksniavimo principas: QR raštas išlieka pastovus, o fono elementai animuoja apačioje",
        },
      ],
    },
    {
      heading: "Animacijos parametrų konfigūravimas",
      paragraphs: [
        "Kadrų dažnis turi įtakos ir vaizdo sklandumui, ir failo dydžiui. Daugumoje programų 10–15 kadrų per sekundę užtikrina sklandų judesį be pernelyg didelių failų dydžių. Didesnis kadrų dažnis sumažina vaizdinę grąžą ir žymiai padidina failų dydį. Apsvarstykite pristatymo kontekstą – didelis skaitmeninis ženklas gali apdoroti didesnius failus nei skelbimo vieta mobiliesiems.",
        "Ciklo elgsena lemia animacijos ciklą. Besiūlės kilpos sukuria nuolatinį judesį, idealiai tinkantį ženklams ir aplinkos ekranams. Ping-pong (pirmyn, tada atgal) kilpos puikiai tinka paprastoms animacijoms. Norėdami atkreipti dėmesį į impulsus, apsvarstykite animaciją su sulaikymu – ramybės periodus, kuriuos pertraukia judesiai, traukiantys akį be nuolatinio judesio nuovargio.",
      ],
    },
    {
      heading: "Animuotų perdangų kūrimas",
      paragraphs: [
        "Naudojant animuotus vaizdus (GIF, animuotus WebP ar vaizdo įrašus) kaip perdangas, ANQR ištraukia kadrus ir sujungia juos su jūsų QR kodu. Perdangos intensyvumo nustatymas valdo, kiek animacijos rodoma – mažesnėms reikšmėms teikiama pirmenybė nuskaitomumui, o didesnėms vertėms suteikiamas vizualinis poveikis. Išbandykite pasirinktą intensyvumą keliuose kadruose, kad užtikrintumėte nuoseklų nuskaitymą.",
        "Medžiagos kokybė daro didelę įtaką rezultatams. Naudokite perdangas su aiškiais objektais ir geru kontrastu. Venkite šaltinio animacijos su greitai mirksinčia arba itin dideliu ryškumo pasikeitimu, dėl kurio retkarčiais gali atsirasti mažo kontrasto kadrų. Prieš eksportuodami peržiūrėkite visą animacijos ciklą, kad užfiksuotumėte probleminius kadrus, kurių gali nepavykti nuskaityti.",
      ],
      images: [
        {
          src: "/images/learn/animated-frames.png",
          alt: "Animuotos perdangos vaizdas kadras po kadro, rodantis sekoje išlaikytą kontrasto lygį",
          caption: "Kadrų analizė: nuoseklaus nuskaitymo per visą animacijos ciklą patikrinimas",
        },
      ],
    },
    {
      heading: "Eksporto ir pristatymo svarstymai",
      paragraphs: [
        "GIF išlieka plačiausiai palaikomas animacinis formatas, leidžiantis automatiškai daugelyje kontekstų, nereikalaujant vaizdo grotuvo palaikymo. Tačiau GIF 256 spalvų paletė riboja spalvų tikslumą. Jei norite sukurti svarbią spalvą animaciją, naudokite animuotą WebP, jei ji palaikoma, arba grįžkite į vaizdo įrašų formatus, kad gautumėte aukščiausią kokybę. ANQR GIF eksportavimas apima skirstymo parinktis, kad būtų maksimaliai padidinta kokybė atsižvelgiant į paletės apribojimus.",
        "Pristatymui svarbus failo dydis. Skaitmeninių ženklų sistemos, el. pašto klientai ir socialinės platformos dažnai nustato dydžio apribojimus. Jei jūsų animacija viršija šias ribas, sumažinkite kadrų skaičių, matmenis arba spalvų gylį. Kartais suskaidžius sudėtingą animaciją į trumpesnę kilpą pasiekiami geresni rezultatai nei naudojant agresyvų glaudinimą, kuris pablogina kiekvieną kadrą.",
      ],
    },
    {
      heading: "Animuotų QR kodų testavimas",
      paragraphs: [
        "Norint išbandyti animuotus kodus, reikia nuskaityti keliuose animacijos ciklo taškuose. Nenuskaitykite tik vieną kartą ir manykite, kad pavyks – nuskaitykite pakartotinai, skirtingu momentu, kad patikrintumėte, ar kiekvienas kadras yra skaitomas. Ypatingą dėmesį atkreipkite į kadrus, esančius kraštutiniuose spalvų ciklo kampuose arba persidengimo intensyvumo viršūnėse, kur kontrastas gali būti mažiausias.",
        "Jei įmanoma, išbandykite tikrąją ekrano aparatinę įrangą. Monitoriaus spalvų kalibravimas, žiūrėjimo kampas ir aplinkos apšvietimas turi įtakos animacijos išvaizdai ir nuskaitymui. Ryški animacija, kuri puikiai nuskaitoma monitoriuje, gali išnykti lauko ekrane arba tapti neįskaitoma esant įstrižais žiūrėjimo kampais.",
      ],
      images: [
        {
          src: "/images/learn/animated-testing.png",
          alt: "Testavimo matrica, rodanti nuskaitymo sėkmės rodiklius įvairiuose kadruose, įrenginiuose ir rodymo sąlygomis",
          caption:
            "Animuotas QR testavimo protokolas: sistemingas kadrų, įrenginių ir žiūrėjimo sąlygų tikrinimas",
        },
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Atidarykite generatorių",
          type: "generator",
        },
        {
          href: "/examples?lang=${lang}#section-17",
          label: "Peržiūrėkite QR pavyzdžius",
          type: "example",
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: "QR saugos ir atitikties geriausia praktika",
      paragraphs: [
        "Gražiai sukurtas QR kodas, kurio nepavyksta nuskaityti, yra blogiau nei nenaudingas – jis žlugdo klientus, kenkia prekės ženklo suvokimui ir eikvoja visus į jo kūrimą ir platinimą investuotus išteklius. Šiame vadove aprašomi techniniai ir praktiniai veiksniai, lemiantys, ar QR kodas bus nuskaitomas patikimai, ir kaip naudoti ANQR saugos funkcijas, kad būtų galima nustatyti galimas problemas prieš joms pasiekiant gamybą.",
        "QR kodo patikimumas nėra dvejetainis. Kodas gali puikiai nuskaityti pavyzdiniuose telefonuose, bet nepavykti biudžetiniuose įrenginiuose. Jis gali veikti esant idealiam apšvietimui, bet sunkiai dirbti blankiuose restoranuose arba ryškioje saulės šviesoje. Suprasdami veiksnius, turinčius įtakos nuskaitomumui, galite padaryti pagrįstus kompromisus tarp vizualinio stiliaus ir realaus patikimumo.",
      ],
      images: [
        {
          src: "/images/learn/safety-overview.png",
          alt: "Patikimumo spektras, kuriame rodomi QR kodai nuo labai nuskaitomo iki mažai įskaitomo",
          caption:
            "Nuskaitomumo spektras: nuo neperšaunamų kodų iki patikimumo ribas peržengiančio stiliaus",
        },
      ],
    },
    {
      heading: "Klaidų taisymo lygių supratimas",
      paragraphs: [
        "QR kodai apima įtaisytą dubliavimą, kuris leidžia juos nuskaityti net iš dalies pažeistus arba uždengtus. Klaidų taisymo lygis – L (7 %), M (15 %), Q (25 %) arba H (30 %) – nustato, kiek kodo gali trūkti teisingai dekoduojant. Didesnis klaidų taisymas sukuria didesnius kodus, tačiau suteikia saugos ribą perdangoms, spausdinimo trūkumams ir žalai aplinkai.",
        "Kodams su vaizdų perdangomis būtinas klaidų taisymo lygis H – perdanga fiziškai užstoja dalį kodo, o norint išlaikyti patikimumą, reikia to 30 % pertekliaus. Jei norite švarių, nestilių kodų valdomoje aplinkoje, dažnai pakanka M lygio. L lygis turėtų būti skirtas situacijoms, kai kodo dydis yra labai apribotas ir galite garantuoti nesugadintas sąlygas.",
      ],
    },
    {
      heading: "The Critical Quiet Zone",
      paragraphs: [
        "Ramioji zona yra tuščia paraštė aplink kiekvieną QR kodą. Skaitytuvai naudoja šią ribą norėdami nustatyti, kur prasideda ir baigiasi kodas. ISO standartas nurodo minimalią keturių modulių tyliąją zoną (keturis kartus didesnė už mažiausio kodo kvadrato plotį). Šios vietos pažeidimas – naudojant dizaino elementus, apdailos kraštus ar gretimą turinį – yra viena dažniausių nuskaitymo gedimų priežasčių.",
        "ANQR tyliosios zonos užtikrinimas padeda išlaikyti šį kritinį atstumą, tačiau taip pat turite užtikrinti, kad jis būtų išsaugotas galutiniuose projektuose. Perduodant QR kūrinius, aiškiai nurodykite tyliosios zonos reikalavimus. Dėdami kodus maketuose patikrinkite, ar į šią erdvę neįsiveržia jokie elementai. Keli milimetrai laisvos erdvės gali reikšti skirtumą tarp patikimo nuskaitymo ir nusivylusių klientų.",
      ],
      images: [
        {
          src: "/images/learn/safety-quietzone.png",
          alt: "Diagrama, kurioje rodomas teisingas tyliųjų zonų atstumas, palyginti su įprastais pažeidimais, dėl kurių nuskaitymo gedimai",
          caption: "Ramios zonos reikalavimai: nematoma paraštė, kuri lemia nuskaitymo sėkmę",
        },
      ],
    },
    {
      heading: "Kontrastas ir spalvų sauga",
      paragraphs: [
        "QR skaitytuvai aptinka šviesių ir tamsių modulių raštą. Bet koks stilius, kuris sumažina šį kontrastą – šviesūs priekiniai planai, tamsūs fonai, gradiento efektai arba mažo neskaidrumo perdangos – apsunkina kodo skaitymą. ANQR apskaičiuoja kontrasto santykį ir įspėja, kai spalvų pasirinkimas artėja prie pavojingo lygio, tačiau galutinis arbitras visada yra išbandymas realiame pasaulyje.",
        "Spalvų suvokimas skiriasi priklausomai nuo apšvietimo sąlygų. Spalvų derinį, kuris monitoriuje atrodo labai kontrastingas, gali būti sunku atskirti esant šiltai kaitinamajai lempai arba šaltiems fluorescenciniams vamzdžiams. Jei jūsų kodas bus naudojamas skirtingomis apšvietimo sąlygomis, išbandykite kelis šviesos šaltinius ir kaip saugos ribą apsvarstykite konservatyvesnius kontrasto santykius.",
      ],
    },
    {
      heading: "Modulio dydis ir žiūrėjimo atstumas",
      paragraphs: [
        "Fizinis atskirų modulių dydis lemia didžiausią atstumą, nuo kurio galima nuskaityti kodą. Mažesni moduliai reiškia mažesnius kodus, bet reikalauja didesnio nuskaitymo atstumo. Bendra taisyklė yra ta, kad kiekvienas modulis turi būti bent 0,5 mm numatytu nuskaitymo atstumu, proporcingai didinant didesnį atstumą. Kodui reklaminiame skydelyje reikia daug didesnių modulių nei kodui vizitinėje kortelėje.",
        "Skaičiuodami modulio dydį, atsižvelkite į blogiausią scenarijų: klientas su senesniu telefonu, esant netobulam apšvietimui, nuskaito didžiausiu tikėtinu atstumu. Sukurkite šiam vartotojui, o visi kiti turės dar geresnę patirtį. ANQR dydžio rekomendacijos atsižvelgia į šiuos realaus pasaulio kintamuosius, kad būtų pasiūlyti tinkami matmenys jūsų numatytam naudojimui.",
      ],
      images: [
        {
          src: "/images/learn/safety-distance.png",
          alt: "Diagrama, susijusi su modulio dydžiu, spausdinimo matmenimis ir didžiausiu efektyviu nuskaitymo atstumu",
          caption:
            "Nuskaitymo atstumo vadovas: suderinkite modulio dydį pagal diegimo reikalavimus",
        },
      ],
    },
    {
      heading: "ANQR saugos režimo naudojimas",
      paragraphs: [
        "ANQR saugos režimas pateikia realiojo laiko grįžtamąjį ryšį apie nuskaitymo patikimumą. Jis stebi kontrasto santykį, tylios zonos atitikimą, perdangos intensyvumą ir kitus veiksnius, turinčius įtakos nuskaitomumui. Kai kuris nors parametras artėja prie rizikingo lygio, matysite įspėjimus su konkrečiomis gairėmis, kaip padidinti patikimumą. Profesionaliam diegimui, kai gedimas kainuoja brangiai, saugos režimas turi būti aktyvus viso projektavimo proceso metu.",
        "Saugos režimas taip pat apima nuskaitymo patvirtinimo funkciją, kuri bando iššifruoti sugeneruotą kodą ir praneša apie sėkmę arba nesėkmę. Nors šis patvirtinimas programoje negali atkartoti visų realių sąlygų, prieš investuojant į spausdinimą ar platinimą jis nustato daug bendrų problemų. Sėkmingą patvirtinimą traktuokite kaip minimalią ribą, o ne garantiją – bandymai realiame pasaulyje išlieka būtini.",
      ],
    },
    {
      heading: "Realaus pasaulio testavimo protokolai",
      paragraphs: [
        'Joks programinės įrangos patikrinimas nepakeičia fizinio testavimo. Atspausdinkite savo kodą numatyto dydžio ant reprezentacinės medžiagos. Išbandykite jį tikroje diegimo aplinkoje su realiu naudojimu atitinkančiomis apšvietimo sąlygomis. Nuskaitykite naudodami kelis įrenginius – ne tik pavyzdinį telefoną, bet ir nebrangius „Android" įrenginius, senesnius „iPhone" įrenginius ir bet kokius konkrečius įrenginius, kuriuos dažniausiai naudoja jūsų auditorija.',
        "Sistemingai dokumentuokite savo testavimą. Įrašykite, kurie įrenginiai buvo išbandyti, kokiomis sąlygomis, kokiais rezultatais. Jei diegiate kodus dideliu mastu, nustatykite priėmimo kriterijus: galbūt 95 % sėkmės rodiklis visame įrenginio bandomajame fonde arba sėkmingas nuskaitymas per 2 sekundes visuose išbandytuose įrenginiuose. Šie standartai padeda priimti objektyvius sprendimus, o ne tikėtis geriausio.",
      ],
      images: [
        {
          src: "/images/learn/safety-testing.png",
          alt: "Išsamus testavimo kontrolinis sąrašas, apimantis įrenginius, sąlygas ir priėmimo kriterijus",
          caption:
            "QR diegimo testavimo protokolas: sistemingas patikrinimas prieš įsipareigojant gaminti",
        },
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#safety",
          label: "Atidarykite generatorių",
          type: "generator",
        },
        {
          href: "/examples?lang=${lang}#section-0",
          label: "Peržiūrėkite QR pavyzdžius",
          type: "example",
        },
      ],
    },
  ],

  relatedLinks: [
    { href: "/examples?lang=${lang}", label: "Peržiūrėkite QR pavyzdžius", type: "example" },
    { href: "/guide?lang=${lang}", label: "Atidarykite visą vartotojo vadovą", type: "guide" },
    { href: "/gallery?lang=${lang}", label: "Atidarykite galeriją", type: "gallery" },
  ],
};
