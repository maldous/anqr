import type { PageDefinition } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR pavyzdžiai',
  description:
    'Penki realūs gamybos stiliaus pavyzdžiai, parodantys, kur QR kodai sukuria išmatuojamą vertę: senojo mažmeninės prekybos skaitiklio kodo pakėlimas, firminiai mažmeniniai mokėjimai ir nuskaitymo veiksmai, spausdinimo mastelio keitimas nuo skrajučių iki reklaminių skydelių, animuotas QR skaitmeniniams ženklams ir bendradarbiavimas keliomis kalbomis naudojant bendrinamas Inkaro nuorodas. Kiekviename pavyzdyje yra vaizdai, praktiniai apribojimai ir remikso nuoroda į generatorių.',
  lastUpdated: '2026 m. vasario 1 d',

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Atidarykite generatorių', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Naršyti Sužinokite straipsnius', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Atidarykite visą vartotojo vadovą', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Atvejo analizė: mažmeninės prekybos skaitiklio QR padidėjimas',
      paragraphs: [
        'Šis realaus pasaulio pavyzdys seka nedidelę kavinę, kuri trejus metus savo prekystalyje naudojo tą patį QR kodą. Pradinis kodas buvo greitai sugeneruotas per pandemijos skubėjimą, atspausdintas ant standartinio popieriaus ir nuslystas į plastikinį stovą. Techniškai jis vis dar veikė, tačiau klientams dažnai prireikė kelis kartus jį nuskaityti, ir tai nepadėjo sustiprinti kruopščiai sukurtos kavinės prekės ženklo tapatybės.',
        'Transformacija prasidėjo nuo paprasto audito: esamas kodas užkodavo kavinės internetinio meniu URL, kurį norėjosi pasilikti. Iššūkis buvo priversti QR jaustis kaip kavinės patirties dalis, o ne kaip pasenusi priemonė nuo 2020 m.',
      ],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Atvėsintas QR kodas plastikiniame stove, kuriame matomas nusidėvėjimas, pirštų atspaudai ir išblukęs spaudinys',
          caption: 'Atspirties taškas: trejus metus tarnaujant skaitikliui pradinis QR vos neveikė',
        },
      ],
    },
    {
      heading: 'Pradinio kodo problemų diagnozavimas',
      paragraphs: [
        'Bandymas atskleidė keletą problemų: pradiniame kode buvo naudojamas klaidų taisymas L (minimalus perteklius), buvo tik 2 modulių tylioji zona ir spausdinamas maža skyra. Kavinės šiltame volframo apšvietime jau išblukę juodi moduliai vos kontrastavo su pageltusiu popieriumi. Senesni telefonai sunkiai; naujesni telefonai pavyko, bet su pastebimu vėlavimu.',
        'Be techninių problemų, bendras juodai baltas kvadratas nieko neinformavo apie prekės ženklą. Klientai dvejojo ​​prieš nuskaitydami – tai subtilus pasitikėjimo barjeras, sumažinęs susidomėjimą kruopščiai sukurtu kavinės skaitmeniniu meniu.',
      ],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnostinė perdanga, rodanti originalius QR techninius trūkumus: mažas ECC, minimali tyli zona, prastas kontrastas',
          caption:
            'Techninė analizė, atskleidžianti, kodėl senasis kodas veikė prasčiau realiomis sąlygomis',
        },
      ],
    },
    {
      heading: 'Pakėlimo procesas',
      paragraphs: [
        'Naudodamas ANQR, kavinės savininkas atkūrė kodą su identišku meniu URL, bet žymiai pagerino nustatymus: klaidų taisymas H maksimaliam atsparumui užtikrinti, 6 modulių tyli zona patikimam ribų aptikimui ir prekės ženklo spalvos (gili bordo spalvos moduliai kreminiame fone), atitinkančios kavinės interjero paletę.',
        'Pridėta nedidelė centrinė perdanga su kavinės logotipu – sąmoningai išliko subtili, kad būtų galima nuskaityti, tuo pačiu užtikrinant greitą prekės ženklo atpažinimą. Saugos režimas patvirtino, kad naujas dizainas buvo patikimai nuskaitytas visuose bandomuosiuose įrenginiuose prieš spausdinant.',
      ],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR sąsaja, rodanti konfigūraciją: prekės ženklo spalvos, tinkama ECC, erdvi tyli zona, subtili logotipo perdanga',
          caption:
            'Atnaujintos konfigūracijos kūrimas: kiekvienas nustatymas, pasirinktas siekiant suderinti prekės ženklo išraišką su nuskaitymo patikimumu',
        },
      ],
    },
    {
      heading: 'Išmatuojami rezultatai',
      paragraphs: [
        'Įdiegus naują QR ant profesionalių matinių laminuotų kortelių, kavinė rezultatus stebėjo per keturias savaites. Nuskaitymo sėkmės rodiklis pagerėjo nuo maždaug 70% iki beveik 100%. Vidutinis nuskaitymo laikas sumažėjo nuo 3–4 sekundžių iki mažiau nei 1 sekundės. Svarbiausia, kad meniu įtraukimas išaugo 40 % – klientai, kurie anksčiau žvilgtelėjo į QR kodą ir atsisakė, dabar skenavo užtikrintai.',
        'Darbuotojai pranešė apie mažiau klientų klausimų apie tai, kaip naudoti QR kodą, ir ne daugiau atvejų, kai nusivylę klientai neautomatiškai įveda URL. Prekės ženklo išvaizda taip pat sukėlė pokalbius, o klientai teigiamai atsiliepė apie darnų dizainą.',
      ],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Prieš ir po palyginimas su metrika: nuskaitymo sėkmės rodiklis, vidutinis nuskaitymo laikas ir savaitės nuskaitymo skaičiaus patobulinimai',
          caption: 'Keturių savaičių duomenys, rodantys išmatuojamą apgalvoto QR pakėlimo poveikį',
        },
      ],
    },
    {
      heading: 'Iš naujo sukurkite šią konfigūraciją',
      paragraphs: [
        'Kavinės konfigūracija demonstruoja konservatyvų, bet efektyvų prekės ženklą: klaidų taisymas H, 6 modulių tylioji zona, didelio kontrasto prekės ženklo spalvos ir minimali centrinė perdanga. Šis balansas tinka daugeliui mažmeninės prekybos programų, kur patikimumas turi būti pirmiausia, tačiau prekės ženklo buvimas vis tiek svarbus.',
        'Atidarykite generatorių su iš anksto įkeltais nustatymais ir pritaikykite spalvas bei perdangą pagal savo prekės ženklą. Pagrindinė įžvalga: vien tik patikimumo patobulinimai gali žymiai padidinti įsitraukimą, net prieš pridedant bet kokį vizualinį stilių.',
        'Peržiūrėkite susijusį mokymosi vadovą apie esamų QR kampanijų tobulinimą, kad sužinotumėte visą šio metodo metodą.',
      ],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Nuoroda į generatorių, iš anksto sukonfigūruotą su kavinės nustatymais, kad būtų galima nedelsiant tinkinti',
          caption: 'Pradėkite nuo patikrintos konfigūracijos ir pritaikykite savo prekės ženklui',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Atidarykite generatorių',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Naršyti Sužinokite straipsnius',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Atvejo analizė: kelių mokėjimų skaitiklio ekranas',
      paragraphs: [
        'Šiame pavyzdyje seka prabangi drabužių parduotuvė, kurios registre buvo sukaupti penki skirtingi QR kodai: banko mokėjimas, patarimai, „Instagram", „Google" apžvalgos ir nuomos nuoroda. Kiekvienas buvo sukurtas iš kito šaltinio, atspausdintas skirtingu laiku ir rodomas nesuderintuose stenduose. Vizualinis chaosas pakenkė kruopščiai kuruojamai parduotuvės estetikai, o darbuotojai nuolat susidurdavo su klientais, nuskaitančiais neteisingą kodą.',
        'Sprendimas reikalavo atskirti rūpesčius: mokėjimo kodams reikėjo maksimalaus patikimumo su konservatyviu stiliumi, o rinkodaros kodai galėtų būti išraiškingesni. Atsiradusi vieninga rodymo sistema parodo, kaip suderinti prekės ženklo buvimą su funkciniais skirtingų QR naudojimo atvejų poreikiais.',
      ],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Netvarkinga registro sritis, kurioje rodomi penki nesutampantys QR kodai įvairiuose stenduose ir spausdintinėje medžiagoje',
          caption:
            'Chaotiškas atskaitos taškas: penki atjungti QR kodai, konkuruojantys dėl dėmesio ir keliantys klientų painiavą',
        },
      ],
    },
    {
      heading: 'Pirmenybė teikiama mokėjimo patirčiai',
      paragraphs: [
        'Parduotuvės pagrindinis mokėjimo būdas naudojo regioninį standartą, pagal kurį buvo reikalaujama griežtai laikytis naudingos apkrovos. Bandymai atskleidė, kad net nedidelis stilius paveikė nuskaitymo greitį naudojant tam tikras banko programas. Sprendimas: palikti mokėjimo QR kodą visiškai nepakeistą, išskyrus dydžio optimizavimą ir profesionalų spausdinimą ant matinių kortelių.',
        'Šis konservatyvus požiūris reiškė, kad mokėjimo kodas atrodė ne toks „firminis" nei idealus, tačiau operacijų užbaigimo rodikliai labai pagerėjo. Įžvalga: mokėjimo momentai nėra prekės ženklo kūrimo galimybės – tai patikimumo momentai. Klientai vertina greitį ir tikrumą, o ne estetiką, kai kalbama apie pinigus.',
      ],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Švarus, didelis mokėjimo QR kodas ant profesionalių matinių kortelių, gerai matomoje registro vietoje',
          caption:
            'Mokėjimo QR kodas: dosnus dydis, profesionaliai atspausdintas, konservatyvus stilius, kad banko programos atpažintų iš karto',
        },
      ],
    },
    {
      heading: 'Antrinio veiksmo ekrano kūrimas',
      paragraphs: [
        'Jei norite gauti patarimų, atsiliepimų, socialinių tinklų ir samdyti, parduotuvė galėtų būti išraiškingesnė. Šie kodai buvo atkurti naudojant ANQR su nuosekliu prekės ženklo stiliumi: parduotuvei būdinga alyvuogių žalia spalva ant kremo, suapvalintas modulio stilius ir subtili centrinė perdanga su parduotuvės piktograma. Klaidų taisymas H užtikrino patikimumą net ir su stiliumi.',
        'Šie keturi kodai buvo išdėstyti firminiame skydelyje, esančiame šalia mokėjimo kodo (su nekonkuruojančiu). Aiškios etiketės parduotuvės tipografijoje paaiškino kiekvieno kodo paskirtį. Vizualinė hierarchija buvo apgalvota: mokėjimas buvo atskiras ir iškilus; antriniai veiksmai sugrupuoti kaip pasirinktys.',
      ],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Firminis skydelis su aiškiomis etiketėmis rodo keturis stiliaus QR kodus patarimams, apžvalgoms, socialiniams tinklams ir samdymui',
          caption:
            'Antrinis veiksmų skydelis: nuoseklus prekės ženklo kūrimas, aiškus ženklinimas, išdėstytas kaip parinktys, o ne kaip blaškymas',
        },
      ],
    },
    {
      heading: 'Ekrano sistemos dizainas',
      paragraphs: [
        'Fizinis ekranas vienu metu išsprendė kelias problemas. Tiek mokėjimo stende, tiek antriniame skydelyje buvo naudojamos matinės medžiagos, kad būtų išvengta viršutinio apšvietimo akinimo. Aukštis buvo optimizuotas įvairaus ūgio klientams. Kampai, nukreipti į klientų eilę, o ne ant prekystalio.',
        'Svarbiausia, kad parduotuvė sukūrė atsarginius spaudinius iš užrakintų ANQR konfigūracijos nuorodų. Kai patarimo kodas galiausiai buvo aptaškytas kava, darbuotojai jį pakeitė per kelias minutes, naudodami išsaugotą konfigūraciją – jokių ekrano kopijų, jokių nustatymų spėliojimo, kokybės pablogėjimo.',
      ],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Diagrama, kurioje parodytas fizinis ekrano išdėstymas: aukščiai, kampai, medžiagos ir ryšys tarp mokėjimo ir antrinių ekranų',
          caption:
            'Ekrano sistemos projektas: fizinė ergonomika, optimizuota patikimam nuskaitymui įvairiais klientų ūgiais ir apšvietimo sąlygomis',
        },
      ],
    },
    {
      heading: 'Veiklos patobulinimai',
      paragraphs: [
        'Praėjus šešioms savaitėms po įdiegimo, parduotuvėje užfiksuoti reikšmingi patobulinimai: nulis klientų skundų dėl „neteisingo kodo" painiavos, greitesnis operacijų laikas ir 3 kartus daugiau arbatpinigių (dabar klientai galėjo rasti ir nuskaityti arbatpinigių kodą nepatogiai neklausdami darbuotojų). „Google" apžvalgų taip pat padaugėjo, nes specialus, gerai pažymėtas QR pašalino trintį.',
        'Darbuotojų mokymas tapo paprastesnis: „mokėjimo kodas yra didžiausias, visa kita yra skydelyje". Kai mokėjimo programos buvo atnaujintos ir viena trumpam parodė lėtesnį nuskaitymą, konservatyvus mokėjimo kodo dizainas reiškė, kad jis vis tiek veikė – tik šiek tiek lėčiau, o ne visiškai sugedo.',
        'Žr. Sužinokite vadovą apie QR kodus mažmeniniams mokėjimams, kad sužinotumėte apie šios rodymo sistemos dizaino principus.',
      ],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Metrikos informacijos suvestinė, rodanti prieš ir po palyginimų: painiavos incidentai, operacijos laikas, patarimų dažnumas, peržiūros pateikimai',
          caption:
            'Šešių savaičių veiklos duomenys, parodantys apgalvotos kelių QR rodymo sistemos poveikį verslui',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Atidarykite generatorių',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Naršyti Sužinokite straipsnius',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Atvejo analizė: nuo vizitinės kortelės iki „Billboard".',
      paragraphs: [
        'Šis pavyzdys seka renginių gamybos įmonę, besiruošiančią svarbiai konferencijai. Jiems reikėjo to paties QR kodo – susiejimo su renginio programėle – įdiegto radikaliai skirtingais formatais: dalyvių ženklelių įdėklai (3 cm), stalo palapinės kortelės (8 cm), registracijos stalo iškabos (30 cm), kelio nustatymo plakatai (60 cm) ir didžiulė scenos fono reklamjuostė (4 metrai). Kiekvienas formatas turėjo skirtingus žiūrėjimo atstumus, apšvietimo sąlygas ir gamybos darbo eigą.',
        'Iššūkis buvo ne tik techninis – jis buvo operatyvus. Keli pardavėjai atliko skirtingas spausdinimo užduotis, o įmonė turėjo užtikrinti nuoseklius, nuskaitomus rezultatus, nepaisant to, kas ką pagamino. Jų sprendimas buvo sutelktas į SVG eksportą ir griežtą perdavimo dokumentaciją.',
      ],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Koliažas, kuriame rodomas tas pats QR kodas, pritaikytas penkių skirtingų dydžių, nuo ženklelio iki reklamjuostės',
          caption:
            'Vienas QR kodas, penki diegimo dydžiai: iššūkis išlaikyti nuskaitomumą nuo centimetrų iki metrų',
        },
      ],
    },
    {
      heading: 'Kodėl ankstesni įvykiai turėjo problemų',
      paragraphs: [
        'Paskutinėje konferencijoje bendrovė patyrė gėdingų nesėkmių. Sceninis baneris QR buvo sugeneruotas kaip mažas PNG ir padidintas projektavimo programinėje įrangoje – rezultatas atrodė priimtinas iš toli, tačiau nepavyko patikimai nuskaityti iš publikos. Ženklelių QR buvo per daug stilizuoti ir per maži, o tai erzino dalyvius, bandančius pridėti kontaktų. Nenuoseklūs skirtingų formatų nustatymai reiškė, kad „tas pats" QR iš tikrųjų atrodė skirtingai kiekvienoje dalyje.',
        'Analizė po įvykio atskleidė pagrindinę priežastį: nėra vieno tiesos šaltinio. Kiekvienas dizaineris atkūrė QR su šiek tiek skirtingais parametrais, o kiekvienas spausdinimo pardavėjas apdorojo failus skirtingai. Kokybė pablogėjo dėl failų perdavimo telefonu žaidimo.',
      ],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Iš arti padarytos nuotraukos, kuriose matomos nuskaitymo gedimai: reklamjuosčių moduliai su pikseliais, per mažo dydžio ženklelių kodai, nenuoseklus įvairių formatų stilius',
          caption:
            'Ankstesnių įvykių nesėkmių kriminalistinė analizė: kiekviename formate atsirado skirtingų kokybės problemų',
        },
      ],
    },
    {
      heading: 'SVG pirmoji darbo eiga',
      paragraphs: [
        'Šiam įvykiui įmonė nustatė griežtą protokolą: vienas pagrindinis QR sugeneruotas ANQR su optimaliais nustatymais (klaidos taisymas H, turtinga tyli zona, švarus stilius), eksportuojamas kaip SVG ir saugomas kaip vienintelis autoritetingas šaltinis. ANQR konfigūracijos nuoroda buvo užfiksuota kartu su SVG failu, kad prireikus būtų galima atkurti kodą.',
        'Kiekvienas dizaineris ir pardavėjas gavo tą patį SVG pagrindinį įrenginį su aiškiomis instrukcijomis: įdėkite reikiamo dydžio, nekeiskite, išlaikykite tylią zoną. Pardavėjams, kuriems reikalingi rastriniai formatai, bendrovė pateikė tam tikro dydžio iš anksto pateiktus PNG su aiškiomis pavadinimų sutartimis, nurodančiomis numatomą naudojimą.',
      ],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Failų paketas, kuriame rodomas pagrindinis SVG failas, konkretaus dydžio PNG, specifikacijos dokumentas ir konfigūracijos nuoroda',
          caption:
            'Perdavimo paketas: viskas, ko reikia pardavėjams, kad nenumatytų nuoseklių rezultatų',
        },
      ],
    },
    {
      heading: 'Dydžiui būdingi aspektai',
      paragraphs: [
        'Kiekvienas formatas reikalavo ypatingo dėmesio. Ženkliuko įdėklams 3 cm reikėjo QR, kad užimtų maksimalią laisvą vietą – nuskaitymo atstumas būtų ištiestos rankos atstumu. Stalinės palapinės 8 cm gali turėti dekoratyvinį rėmą už tylios zonos ribų. 4 metrų reklamjuostei reikėjo apskaičiuoti: nuo įprasto auditorijos atstumo (15-20 metrų) moduliai turėjo būti aiškiai atskirti telefono kameromis, o tai reiškia, kad QR turi būti bent 80 cm reklamjuostės konstrukcijoje.',
        'Bendrovė sukūrė dydžio vadovą, kuriame dokumentuojami minimalūs QR matmenys kiekvienam numatomam nuskaitymo atstumui. Tai tapo daugkartiniu turtu būsimiems įvykiams, pašalinant spėliones iš projektavimo proceso.',
      ],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Diagrama, rodanti kiekvieno įvykio formato nuskaitymo atstumo, minimalaus QR dydžio ir modulio matmenų ryšį',
          caption:
            'Dydžio matrica: apskaičiuoti matmenys, užtikrinantys patikimą nuskaitymą kiekvieno formato numatytu žiūrėjimo atstumu',
        },
      ],
    },
    {
      heading: 'Gamybos rezultatai',
      paragraphs: [
        'Konferencijos dienos patvirtinimas buvo sistemingas: darbuotojai išbandė kiekvieną įdiegtą QR prieš atidarant duris. Ženkliuko įdėklai buvo nuskaityti akimirksniu ištiestos rankos atstumu. Stalinės palapinės patikimai veikė esant kintamam poilsio patalpų apšvietimui. Scenos reklaminė juosta – ankstesnio renginio gėda – sėkmingai nuskaityta iš žiūrovų zonos vidurio.',
        'Daugiau nei 2 000 dalyvių užregistruota nulinių skundų. Operatyvinis laimėjimas buvo toks pat reikšmingas: kai paskutinę minutę rėmėjui prireikė naujų ženklų, gamybos komanda per kelias minutes sukūrė juos iš pagrindinio SVG, įsitikinusi, kad jis atitiks visus kitus.',
        'Žr. mokymosi vadovą apie spausdinimui paruoštus QR kodus, skirtus SVG ir PNG sprendimų sistemai, ir geriausios perdavimo praktikos.',
      ],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Renginio fotografija, kurioje dalyviai sėkmingai nuskaito QR kodus įvairiais dydžiais ir atstumais visoje renginio vietoje',
          caption:
            'Konferencijos dienos sėkmė: patikimas visų formatų nuskaitymas – nuo ženkliukų stambių planų iki scenos reklamjuostės nuotolinių kadrų',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Atidarykite generatorių',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Naršyti Sužinokite straipsnius',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Atvejo tyrimas: Airport Lounge skaitmeninis ekranas',
      paragraphs: [
        'Šis pavyzdys seka oro linijų saloną, kuris savo skaitmeniniuose pasveikinimo ekranuose naudojo statinius QR kodus. Ekranuose buvo rodomas besisukantis reklaminis turinys, tačiau QR kodas, skirtas registracijai poilsio kambaryje, stovėjo kampe, statiškas ir lengvai nepastebimas. „Analytics" parodė, kad tik 15 % tinkamų svečių naudojosi QR registracija, nors ji buvo greitesnė nei prie stalo eilės. Dauguma svečių to tiesiog nepastebėjo.',
        'Hipotezė buvo paprasta: vizualiai judrioje aplinkoje su judančiu turiniu statinis QR tampa nematomas. Sprendimas, reikalingas norint, kad QR būtų pastebimas, nepakenkiant patikimumui, reikalingam registracijos srautui, kai gedimas reikštų nusivylusius keliautojus ir ilgesnes eiles prie stalų.',
      ],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Skaitmeninis ekranas oro uosto hole, kuriame rodomas reklaminis turinys su mažu statiniu QR kodu kampe',
          caption:
            'Pradinė sąranka: dinamiško reklaminio turinio jūroje pasiklydęs statinis QR kodas, pasiekiamas tik 15 proc.',
        },
      ],
    },
    {
      heading: 'Saugios animacijos kūrimas',
      paragraphs: [
        'Salės skaitmeniniuose iškabose buvo naudojamos didelės LED plokštės – sudėtinga aplinka, kurioje agresyvi animacija gali sukelti nuskaitymo problemų. Projektavimo komanda pradėjo konservatyviai: švelnus pulso efektas, kuris subtiliai išplėtė ir sumažino QR vizualinį buvimą, nekeičiant tikrosios kodo struktūros. Kadrų laikas buvo nustatytas lėtas (250 ms), kad būtų išvengta mirgėjimo problemų dėl LED atnaujinimo dažnio.',
        'Saugos režimo patvirtinimas patvirtino, kad kiekvieną kadrą galima nuskaityti. Papildomi faktinių LED skydelių bandymai atskleidė, kad pulsas turi būti dar subtilesnis, nei siūlomos darbalaukio peržiūros – LED ryškumas ir žiūrėjimo kampai paveikė kontrastą labiau nei tikėtasi.',
      ],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR animacijos nustatymų skydelis, kuriame rodoma impulsų konfigūracija: lėtas laikas, subtilus intensyvumas, įjungtas saugos režimas',
          caption:
            'Animacijos konfigūracija: parametrai sureguliuoti LED skydelio ekranui, išlaikant nuskaitymo patikimumą kiekviename kadre',
        },
      ],
    },
    {
      heading: 'Integracija su ženklų turiniu',
      paragraphs: [
        'Animuotas QR buvo patalpintas tam skirtoje ekrano išdėstymo „stabilioje zonoje" – srityje, kuri išliko pastovi, o reklaminis turinys sukasi pagrindinėje rodymo srityje. Šis atskyrimas buvo labai svarbus: QR skenavimui reikėjo vizualinio stabilumo, net ir pritraukiant dėmesį per savo subtilią animaciją.',
        'Šalia QR buvo pridėtas aiškus raginimas veikti: „Praleisti eilę – nuskaityti, kad prisiregistruotumėte". Tekstas išliko statiškas, kol pulsavo QR, sukuriant vaizdinę hierarchiją, kuri atkreipė dėmesį į nuskaitymo galimybę, neužgožiant reklaminio turinio.',
      ],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Ekrano išdėstymo schema, rodanti animuotą QR stabilioje zonoje, o reklaminis turinys sukasi pagrindinėje srityje',
          caption:
            'Ekrano nekilnojamojo turto paskirstymas: animuotas QR užima stabilią zoną, atskirtą nuo besisukančio reklaminio turinio',
        },
      ],
    },
    {
      heading: 'Techninis diegimas',
      paragraphs: [
        'Animuotas QR buvo eksportuotas kaip GIF su optimizuotais ženklų TVS nustatymais. Svarbu buvo atsižvelgti į failo dydį – holo turinio valdymo sistema turėjo įkėlimo apribojimus, o per dideli failai sukėlė atkūrimo mikčiojimą. Galutinis eksportas subalansavo vaizdo kokybę ir failo dydį, ribojant spalvų paletę ir optimizuojant kadrų skaičių.',
        'Diegimas apima atsarginį variantą: jei GIF nepavyko paleisti dėl kokios nors priežasties, ženklų sistema parodys statinę PNG atsarginę kopiją. Šis perteklius užtikrino, kad registravimosi galimybė niekada nebuvo prarasta dėl techninių animacijos problemų.',
      ],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'TVS sąsaja, rodanti animuotą QR įkėlimą su sukonfigūruotu atsarginiu statiniu vaizdu',
          caption:
            'Signage TVS konfigūracija: animuota pirminė su statiniu atsarginiu režimu, užtikrinančiu registravimosi galimybę niekada nenutrūkti',
        },
      ],
    },
    {
      heading: 'Išmatuotas poveikis',
      paragraphs: [
        'Po vieno mėnesio operacijos QR registravimo priėmimas padidėjo nuo 15% iki 24% - santykinis pagerėjimas 60%. Svečių atsiliepimų apklausos parodė, kad animuotas QR buvo „lengviau pastebimas" ir „jaučiasi modernesnis". Darbo stalo eilių laikas pastebimai sumažėjo piko metu, nes daugiau svečių apsitarnavo per QR.',
        'Svarbu tai, kad nepaisant tūkstančių kasdienių nuskaitymų, nebuvo pranešta apie nulio nuskaitymo gedimus. Taikant konservatyvų animacijos metodą dėmesio tikslas buvo pasiektas neprarandant patikimumo, kurio reikalavo registracijos srautas. Vėliau poilsio erdvė išleido panašius animuotus QR į kitas vietas.',
        'Žr. mokomąjį vadovą apie animuotus QR kodus skaitmeniniams ženklams, kad sužinotumėte apie saugaus animacijos dizaino techninius principus.',
      ],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Prietaisų skydelis, kuriame rodomas priėmimo dažnio padidėjimas, eilės trukmės sutrumpėjimas ir nuskaitymo be gedimų patikimumas per diegimo laikotarpį',
          caption:
            'Vieno mėnesio duomenys: 60 % padidintas pritaikymas, sumažintas eilės laikas ir išlaikomas tobulas nuskaitymo patikimumas',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Atidarykite generatorių',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Naršyti Sužinokite straipsnius',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Atvejo tyrimas: pasaulinė produkto pristatymo QR kampanija',
      paragraphs: [
        'Šis pavyzdys seka plataus vartojimo elektronikos įmonės, kuri vienu metu pristato naują produktą 12 rinkų 8 kalbomis. Kiekviena regioninė rinkodaros komanda turėjo pagaminti pakuotes, mažmeninės prekybos vitrinas ir reklaminę medžiagą su QR kodais, nukreipiančiais į lokalizuotus produktų puslapius. Ankstesni paleidimai lėmė nenuoseklų QR stilių, retkarčiais nuskaitymo gedimus ir konfigūracijos „žaidimą telefonu", kai kiekviena komanda atkūrė kodus iš ekrano kopijų.',
        'Sprendimas panaudojo ANQR bendrinamas konfigūracijos nuorodas, kad būtų sukurtas vienas tiesos šaltinis, prie kurio galėtų prieiti kiekviena regioninė komanda, nepaisant sąsajos kalbos. QR naudingoji apkrova naudojo išmanųjį peradresavimą, kuris aptiko vartotojo kalbą, todėl vienas kodas veikė visame pasaulyje, teikiant lokalizuotas funkcijas.',
      ],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Pasaulio žemėlapis, kuriame pavaizduota 12 turgaus vietų su QR kodais, kai kurios vizualiai nesuderinamos viena su kita',
          caption: 'Iššūkis: 12 rinkų, 8 kalbos ir nenuoseklaus QR diegimo regionuose istorija',
        },
      ],
    },
    {
      heading: 'Pagrindinės konfigūracijos nustatymas',
      paragraphs: [
        'Pasaulinė prekės ženklo komanda sukūrė patikimą QR konfigūraciją ANQR: prekės ženklo spalvos, atitinkančios produkto linijos vizualinį tapatumą, klaidų taisymas H, užtikrinantis patikimumą visose spausdinimo ir skaitmeninėse programose, ir stilius, kuris nuosekliai atkurtų nepaisant vietinių gamybos metodų. Konfigūracija buvo užrakinta, o bendrinimo nuoroda dokumentuota pasaulinėje kampanijos santraukoje.',
        'Labai svarbu, kad užkoduotame URL buvo naudojama kalbos aptikimo peradresavimo paslauga. Nuskaitę vartotojai buvo automatiškai nukreipti į produkto puslapį vietine kalba. Tai reiškė, kad visos 12 rinkų galėjo naudoti identiškus QR kodus – jokių pagal rinką naudingų krovinių variantų, dėl kurių gali kilti klaidų.',
      ],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR sąsaja, rodanti pagrindinę konfigūraciją su prekės ženklo spalvomis, ECC H ir išmaniuoju peradresavimo URL',
          caption:
            'Pagrindinė konfigūracija: pasauliniai prekės ženklo standartai, užkoduoti į vieną bendrinamą tiesos šaltinį',
        },
      ],
    },
    {
      heading: 'Regioninės komandos darbo eiga',
      paragraphs: [
        'Kiekviena regioninė rinkodaros komanda gavo konfigūracijos nuorodą su paprastomis instrukcijomis: atidarykite nuorodą, patikrinkite, ar peržiūra atitinka prekės ženklo gaires, eksportuokite reikiamu jūsų programos formatu. ANQR sąsaja rodoma kiekvienos komandos pageidaujama kalba, tačiau pagrindiniai QR nustatymai išliko identiški, nepaisant sąsajos kalbos.',
        'Kai Japonijos komandai reikėjo SVG aukštos klasės mažmeninės prekybos ekranams, o Brazilijos komandai reikėjo PNG socialinei žiniasklaidai, abu buvo eksportuojami iš tos pačios konfigūracijos. Kai Vokietijos komandos spausdinimo pardavėjas paprašė konkrečių spalvų verčių, jie galėjo tiesiogiai nurodyti konfigūraciją, o ne spėlioti iš ekrano kopijos.',
      ],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Ekrano kopijos, kuriose rodoma ta pati konfigūracijos nuoroda, atidaryta japonų, portugalų ir vokiečių sąsajose',
          caption:
            'Ta pati konfigūracija, skirtingos sąsajos: regioninės komandos dirba norima kalba, išlaikant visuotinį nuoseklumą',
        },
      ],
    },
    {
      heading: 'Regioninių skirtumų valdymas',
      paragraphs: [
        'Kai kuriose rinkose reikėjo nedidelių pritaikymų. Kinijos komandai reikėjo versijos su „WeChat" optimizuotu rėmeliu, skirtu bendrinti socialiniuose tinkluose. Užuot pakeitę pagrindinį failą, jie sukūrė dokumentais pagrįstą variantą su savo konfigūracijos nuoroda, aiškiai pažymėtą kaip „CN-WeChat variantas" kampanijos išteklių bibliotekoje. Tai išlaikė atsekamumą ir leido atlikti būtiną lokalizaciją.',
        'Prekės ženklo komanda nustatė paprastą taisyklę: bet kokiam pagrindiniam variantui reikėjo naujos, dokumentais pagrįstos konfigūracijos nuorodos. Jokių eksportuotų failų modifikacijų, jokių „greitų pataisymų" projektavimo programinėje įrangoje. Tai užkirto kelią konfigūracijos dreifui, kuris kankino ankstesnius paleidimus.',
      ],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Išteklių bibliotekos sąsaja, rodanti pagrindinę konfigūraciją ir patvirtintus regioninius variantus, kurių kiekvienas turi savo nuorodą',
          caption:
            'Kampanijos išteklių valdymas: pagrindinė konfigūracija ir dokumentuoti variantai, kuriuos galima atsekti naudojant konfigūracijos nuorodas',
        },
      ],
    },
    {
      heading: 'Paleisti rezultatus',
      paragraphs: [
        'Produkto pristatymo dieną QR kodai buvo naudojami pakuotėse, mažmeninės prekybos ekranuose, renginių medžiagoje ir skaitmeninėse kampanijose visose 12 rinkų vienu metu. Kokybės auditas patvirtino vizualinį nuoseklumą įvairiuose regionuose – Tokijo mažmeninės prekybos ekranuose esantis QR sutapo su QR ant San Paulo pakuotės atitiko QR Berlyno renginių reklamjuostėse.',
        'Visose rinkose nebuvo pranešta apie nulinius nuskaitymo gedimus. Kai prireikė pakeisti produkto puslapio URL po pristatymo, peradresavimo paslauga tai tvarkė nematomai – pakartotinio spausdinimo nereikia. Pasaulinė komanda apskaičiavo, kad konfigūracijos susiejimo metodas sutaupė daugiau nei 40 valandų koordinavimo laiko, palyginti su ankstesne paleidimo metodika.',
        'Norėdami sužinoti darbo eigos principus, kuriais grindžiamas pasaulinės kampanijos nuoseklumas, žr. mokymosi vadovą apie kelių kalbų QR bendradarbiavimą.',
      ],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Nuotraukų tinklelis, rodantis nuoseklų QR diegimą įvairiose rinkose: Tokijo mažmeninėje prekyboje, San Paulo pakuotėse, Berlyno renginiuose',
          caption:
            'Pasiektas pasaulinis nuoseklumas: identiškas QR pateikimas 12 rinkų, nepaisant skirtingų kalbų, tiekėjų ir formatų',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Atidarykite generatorių',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Naršyti Sužinokite straipsnius',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Naršyti Sužinokite straipsnius', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Atidarykite visą vartotojo vadovą', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Atidarykite galeriją', type: 'gallery' },
  ],
};
