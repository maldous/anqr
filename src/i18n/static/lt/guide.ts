import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR User Guide',
  description: 'Išsamus vadovas, kaip naudoti ANQR kuriant QR kodus.',
  lastUpdated: '2026 m. vasario 1 d',
  breadcrumb: ['Vadovas'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Atidarykite generatorių', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Naršyti Sužinokite straipsnius', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Peržiūrėkite QR pavyzdžius', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Darbo pradžia',
      paragraphs: [
        'ANQR yra QR kodo generatorius, orientuotas į klientą. Pagal numatytuosius nustatymus QR kodai generuojami vietoje jūsų naršyklėje – nereikia jokios paskyros, o jūsų duomenys lieka privatūs. Profesionaliam įterpimui taip pat galite naudoti serverio API.',
        'Sąsaja turi tris sąsajos lygius: Basic, Advanced ir Professional. Pasirinkite savo lygį naudodami antraštės skirtukus. Kiekvienas lygis atrakina papildomas funkcijas, tuo pačiu išlaikant sąsają sutelktą į tai, ko jums reikia.',
      ],
      bullets: [
        'Pagrindinis: paprastas QR kodo kūrimas naudojant paprastą tekstą / URL turinį ir vaizdo perdangą.',
        'Išplėstinė: QR kodavimo parinktys, atvaizdavimo stiliai, animacija, išvesties formatai, išplėstiniai turinio tipai ir perdangos tinkinimas.',
        'Profesionalus: vandens ženklai, metaduomenys, bendrinimas, saugos analizė, mokėjimo QR kodai ir įmonės funkcijos.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Atidarykite generatorių', type: 'generator' }],
    },
    {
      heading: 'Quick Start',
      paragraphs: ['Norėdami sukurti pirmąjį QR kodą:'],
      bullets: [
        '1. Išskleidžiamajame meniu Turinio tipas pasirinkite turinio tipą (URL, tekstas, WiFi ir kt.).',
        '2. Pateiktuose laukeliuose įveskite savo duomenis.',
        '3. Pasirinktinai tinkinkite spalvas, stilius ir pridėkite perdangos vaizdą.',
        '4. Spustelėkite Eksportuoti, kad atsisiųstumėte QR kodą kaip PNG, GIF, WebP arba SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Pagrindinės savybės',
      paragraphs: [
        'Pagrindinis lygis suteikia supaprastintą sąsają QR kodams su naudingu turiniu ir vaizdų perdangomis kurti. Tai paprasčiausias būdas pradėti.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Turinio tipai (pagrindinis)',
      paragraphs: [
        'Paprastas tekstas: užkoduokite bet kokį tekstą iki QR kodo talpos ribos. Idealiai tinka trumposioms žinutėms, kodams ar identifikatoriams.',
        'URL: užkoduokite žiniatinklio adresus. Nuskaitytas QR kodas atidarys URL. Palaiko http:// ir https:// protokolus.',
      ],
    },
    {
      heading: 'Vaizdo perdanga (pagrindinė)',
      paragraphs: [
        'Įkelkite vaizdą (JPG, PNG, GIF, WebP), kad susilietumėte su QR kodu. Pagrindinės perdangos funkcijos apima:',
      ],
      bullets: [
        'Įkelti iš failo: pasirinkite vaizdą iš savo įrenginio.',
        'Įkelti iš URL: įveskite vaizdo URL (turi leisti CORS).',
        'Centro logotipas: įdeda vaizdą centre, pasikliaujant klaidų taisymu.',
        'Sumaišymas: paprastas alfa sumaišymas su QR modeliu.',
        'Intensyvumas: kontroliuoja, kaip stipriai perdanga veikia QR kodą (0–100 %).',
        'Spalvų režimas: visos spalvos, pilkos spalvos arba juodai baltas.',
        'Išsaugoti ieškiklio raštus: išlaiko kampų raštus nepakeistus, kad būtų galima patikimai nuskaityti.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Išplėstinės funkcijos',
      paragraphs: [
        'Išplėstinis lygis atrakina QR kodavimo parinktis, atvaizdavimo stilius, animaciją, išvesties formatus, išplėstinius turinio tipus ir išplėstinį perdangos tinkinimą.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR kodavimo nustatymai',
      paragraphs: [
        'Versija: QR kodų versijos yra 1–40, aukštesnėse versijose yra daugiau duomenų, bet jos yra didesnės. Nustatykite 0 (Automatinis), kad ANQR galėtų pasirinkti mažiausią versiją, atitinkančią jūsų turinį.',
        'Klaidų taisymas: nustato, kiek žalos QR kodas gali patirti, kol jį galima nuskaityti.',
      ],
      bullets: [
        'L (Low): 7% klaidų taisymas – mažiausias dydis, mažiausiai perteklinis.',
        'M (Medium): 15% klaidų taisymas – subalansuotas variantas.',
        'Q (Quartile): 25% klaidų taisymas – tinka spausdintiems kodams.',
        'H (aukštas): 30 % klaidų taisymas – geriausiai tinka kodams su perdangomis arba atšiauriomis sąlygomis.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ramioji zona (marža)',
      paragraphs: [
        'Ramioji zona yra balta erdvė aplink QR kodą. Skaitytuvams reikia šios paraštės, kad nustatytų, kur prasideda kodas. Standartas rekomenduoja bent 4 modulius. Sumažinus iki 4, gali kilti nuskaitymo problemų.',
      ],
    },
    {
      heading: 'Modulio stilius',
      paragraphs: [
        'Moduliai yra atskiri kvadratai, sudarantys QR kodą. ANQR siūlo penkis stilius:',
      ],
      bullets: [
        'Kvadratas: klasikinė QR išvaizda su aštriais kampais.',
        'Suapvalinti: suminkštinti kampai, kad vaizdas būtų draugiškesnis.',
        'Taškai: Apvalūs moduliai moderniai estetikai.',
        'Deimantas: 45° pasukti kvadratai, skirti išskirtiniam raštui.',
        'Sujungti: moduliai susilieja, kai yra greta, sukurdami organines formas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Finder Pattern Style',
      paragraphs: [
        'Finder raštai yra trys dideli kvadratai QR kampuose, kurie padeda skaitytuvams orientuoti kodą. Galimi stiliai:',
      ],
      bullets: [
        'Kvadratas: standartiniai kvadratiniai kampai.',
        'Suapvalinti: suminkštinti kampai, atitinkantys suapvalinto modulio stilių.',
        'Apskritimas: taškinio stiliaus kodų apskritimo ieškiklio modeliai.',
      ],
    },
    {
      heading: 'Lygiavimo ir laiko modeliai',
      paragraphs: [
        'Lygiavimo raštai rodomi didesniuose QR koduose (2 ir naujesnė versija), kad būtų lengviau ištaisyti iškraipymus. Laiko šablonai yra kintamos linijos, jungiančios ieškiklio modelius.',
      ],
      bullets: [
        'Lygiavimo stilius: atitikmenų ieškiklis, kvadratas, suapvalintas arba apskritimas.',
        'Laiko nustatymo stilius: atitikties modulis, vientisas arba brūkšninis.',
      ],
    },
    {
      heading: 'Spalvos',
      paragraphs: [
        'Pirmas planas: QR modulių spalva. Juoda (#000000) yra standartinė, bet tinka bet kokia tamsi spalva.',
        'Fonas: fono spalva. Balta spalva (#ffffff) yra standartinė. Užtikrinkite pakankamą kontrastą su priekiniu planu.',
        'Skaidrus fonas: visiškai pašalinkite foną, kad galėtumėte naudoti ant spalvotų paviršių. Įsitikinkite, kad paviršius turi pakankamą kontrastą.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Modulio dydis ir tarpas',
      paragraphs: [
        'Modulio dydis: kontroliuoja, kokio dydžio kiekvienas modulis pateikiamas pikseliais. Didesnės reikšmės sukuria didesnius, lengviau nuskaitomus kodus.',
        'Modulio tarpas: prideda tarpą tarp modulių procentais. Maži tarpai (5–15 %) gali pagerinti nuskaitymą tam tikromis sąlygomis, tačiau per dideli tarpai sumažina patikimumą.',
      ],
    },
    {
      heading: 'Išvesties nustatymai',
      paragraphs: ['Formatas: pasirinkite eksportavimo formatą pagal naudojimo atvejį.'],
      bullets: [
        'PNG: be nuostolių rastro formatas, idealiai tinka daugeliui naudojimo atvejų. Geriausiai tinka spausdinti ir skaitmeniniu būdu.',
        'WebP: modernus formatas su mažesniais failų dydžiais. Tinka naudoti internete.',
        'GIF: reikalingas animuotiems QR kodams. Palaiko skaidrumą.',
        'SVG: vektorinis formatas, kurio mastelis keičiasi be galo. Geriausiai tinka dideliam šriftui arba kai reikia redaguoti kodą.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Išvesties matmenys',
      paragraphs: [
        'Plotis/aukštis: nustatykite išvesties dydį pikseliais. Jei norite spausdinti, apskaičiuokite pagal DPI (pvz., 300 DPI esant 1 coliui = 300 pikselių). Didesni dydžiai nuskaito patikimiau per atstumą.',
      ],
    },
    {
      heading: 'Animacijos nustatymai (išplėstiniai)',
      paragraphs: ['Valdykite animuoto QR kodo veikimą:'],
      bullets: [
        'Greitis: animacijos kadrų dažnis milisekundėmis.',
        'Ciklas: nuolatinė arba vieno paleidimo animacija.',
        'Bounce: stalo teniso animacijos kryptis.',
        'Pradėti kadrą: pradėkite animaciją nuo konkretaus kadro.',
        'Maksimalus kadrų skaičius: apribokite bendrą animacijos kadrų skaičių.',
        'Kadro veiksmas: praleiskite kadrus, kad animacija būtų greitesnė.',
        'Interpoliacija: Nėra, kryžminis išblukimas arba Morph tarp kadrų.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Turinio tipai (išplėstiniai)',
      paragraphs: ['Išplėstinis lygis atrakina papildomus naudingos apkrovos formatus:'],
      bullets: [
        'Telefono numeris (tel:): sukuria skambinamo telefono nuorodą.',
        'El. paštas (mailto:): atidaroma el. pašto programa su pasirenkama tema ir tekstu.',
        'SMS: iš anksto užpildyta tekstinė žinutė telefono numeriu.',
        'vCard: visa kontaktinė kortelė su vardu, organizacija, telefonu, el. paštu, adresu.',
        'MeCard: Japonijoje populiarus kompaktiškas kontaktų formatas.',
        'BizCard: senas vizitinės kortelės formatas.',
        'Geo Location: GPS koordinatės, kurios atsidaro žemėlapiuose.',
        'WiFi: Tinklo kredencialai automatiniam prisijungimui (SSID, slaptažodis, saugos tipas).',
        'Kalendoriaus įvykis: iCalendar formatas su pavadinimu, vieta, data/laiku.',
        'Renginio atsakymas: nuoroda į renginio registracijos puslapį.',
        'Kalendoriaus prenumerata: užsiprenumeruokite ICS / WebCal kanalą.',
        'Failo / dokumento URL: tiesioginė nuoroda į atsisiunčiamus failus.',
        'Saugyklos debesyje nuoroda: nuorodos į „Google" diską, „Dropbox", „OneDrive" ir kt.',
        'Socialinis profilis: nuorodos į LinkedIn, Twitter, Instagram ir kt.',
        'Susirašinėjimo nuoroda: WhatsApp, Telegram, Signal giliosios nuorodos.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Išplėstinės perdangos funkcijos',
      paragraphs: ['Papildomos perdangos galimybės:'],
      bullets: [
        'Apkarpyti: įgalinkite apkarpymą, kad pasirinktumėte kvadratinę vaizdo sritį.',
        'Pustonis: klasikinis spausdinimo stiliaus taškinis raštas, pagrįstas vaizdo ryškumu.',
        'Suskaidytas: klaidų išsklaidymas, skirtas detaliam atkūrimui.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Perdangos maišymo režimai (išplėstiniai)',
      paragraphs: ['Papildomi maišymo režimai išplėstiniame lygyje:'],
      bullets: [
        'Subpikselis: padalija kiekvieną modulį į subpikselius, kad būtų daugiau detalių.',
        'Mėlynas triukšmas: Naudoja mėlynojo triukšmo skirstymą, kad sukurtų raštus be artefaktų.',
        'Mozaika: plytelių pagrindu sukurtas efektas, išsaugantis vaizdo struktūrą.',
        'Spragų užpildymas: įdeda vaizdą į tarpus tarp modulių.',
        'Ryškumas: keičiasi modulio dydis pagal vaizdo ryškumą.',
        '„Duotone": priskiria vaizdą dviem spalvomis, kad būtų įspūdingas kontrastas.',
      ],
    },
    {
      heading: 'Perdangos intensyvumas',
      paragraphs: [
        'Valdo, kaip stipriai perdanga veikia QR kodą (0–100 %). Didesnės reikšmės rodo daugiau vaizdo detalių, bet gali sumažinti nuskaitomumą. Pradėkite maždaug 70% ir koreguokite pagal bandymus.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Spalvų režimas',
      paragraphs: ['Kaip apdorojamas perdangos vaizdas:'],
      bullets: [
        'Visos spalvos: išsaugo originalias vaizdo spalvas.',
        'Grayscale: Converts to black and white tones.',
        'Juoda ir balta: didelio kontrasto dvejetainis konvertavimas.',
      ],
    },
    {
      heading: 'Išsaugoti ieškiklio raštus',
      paragraphs: [
        'Kai įjungta, trys kampų ieškiklio šablonai paliekami nepakeisti perdangos. Strongly recommended for reliable scanning.',
      ],
    },
    {
      heading: 'Vaizdo išankstinis apdorojimas',
      paragraphs: [
        'Prieš maišydami perdengiamam vaizdui pritaikykite filtrus. Šie koregavimai gali pagerinti vaizdo pateikimą galutiniame QR kode.',
      ],
      bullets: [
        'Ryškumas (nuo -100 iki +100): pašviesinkite arba patamsinkite vaizdą.',
        'Kontrastas (nuo -100 iki +100): padidinkite arba sumažinkite tonų diapazoną.',
        'Gama (0,2–3,0): netiesinis ryškumo reguliavimas. Vertės, mažesnės nei 1, šviesina vidutinius tonus, o didesnės nei 1 - tamsina.',
        'Sodrumas (nuo -100 iki +100): spalvos intensyvumas. -100 is grayscale, +100 is oversaturated.',
        'Atspalvio pasukimas (0–360°): perkelkite visas spalvas aplink spalvų ratą.',
        'Suliejimas (0–20 piks.): sušvelninkite vaizdo detales.',
        'Paryškinti (0–100 %): paryškinkite kraštus ir detales.',
        'Plakatas (0–16 lygių): sumažinkite spalvų lygius, kad gautumėte plakato efektą.',
        'Slenkstis (0–255): ribiniame taške konvertuoti į dvejetainę juodą/baltą.',
        'Kraštų aptikimas: „Sobel" arba „Canny" algoritmai rodo tik kraštus.',
        'Invert: Reverse all colors.',
      ],
    },
    {
      heading: 'Tinkamo režimas',
      paragraphs: ['Kaip perdangos vaizdas atitinka QR kodo sritį:'],
      bullets: [
        'Viršelis: vaizdas užpildo visą plotą, jei reikia, apkarpomas.',
        'Sudėtyje: matomas visas vaizdas, gali būti paraščių.',
        'Ištempimas: vaizdas iškraipomas, kad būtų tiksliai užpildytas.',
      ],
    },
    {
      heading: 'Transformavimo parinktys',
      paragraphs: [
        'Sukimas: pasukite perdangą 90° žingsniais.',
        'Apversti X/Y: atspindi vaizdą horizontaliai arba vertikaliai.',
      ],
    },
    {
      heading: 'Skirstymo algoritmai',
      paragraphs: [
        'Skirstymas paverčia nepertraukiamo atspalvio vaizdus į modelius, kuriuos gali atvaizduoti QR kodai. Galima, kai naudojate „Dithered", „Blue Noise" arba „True Dither" maišymo režimus.',
      ],
      bullets: [
        'Klaidų difuzija: klasikinis Floydo-Steinbergo stilius. Išskleidžia kvantavimo klaidą į gretimus pikselius.',
        'Užsakyta (Bayer): naudoja įprastų raštų slenksčio matricą.',
        'Sugrupuotas taškas: imituoja pustonių spausdinimą.',
        'Tuščia ir klasteris: optimizuotas užsakytas diteravimas.',
        'Mėlynas triukšmas: vizualiai malonus atsitiktinai atrodantis raštas.',
        'Mėlynas triukšmo slenkstis: slenksčio triukšmas su mėlyna triukšmo tekstūra.',
        'Baltas triukšmas: Atsitiktinis slenksčio keitimas.',
        'Gauso / trikampis triukšmas: skirtingo pasiskirstymo triukšmas.',
        'Mėlynas triukšmas + klaidų sklaida: hibridas, derinantis abu būdus.',
        'Ekranuotas mėlynas triukšmas: ekrano tipo mėlyno triukšmo modelis.',
        'Suvokimas: šviesumo svertinis, kad būtų geresni vizualiniai rezultatai.',
        'Edge-Aware: išsaugo vaizdo briaunas kintant.',
        'Adaptive Threshold: lokaliai prisitaikantis slenkstis.',
        'Laikinas mėlynas triukšmas: animuotų GIF failų šablonas skiriasi kiekvienam kadrui.',
      ],
    },
    {
      heading: 'Difuzijos branduoliai',
      paragraphs: [
        'Kai naudojate Error Diffusion dithering, pasirinkite, kaip bus paskirstyta klaida:',
      ],
      bullets: [
        'Floydas-Steinbergas: Klasikinė 4 kaimynų difuzija. Geras bendras pasirinkimas.',
        'Jarvis-Judice-Ninke: 12 kaimynų, sklandesnis, bet lėtesnis.',
        'Stucki: panašus į JJN su skirtingais svoriais.',
        'Burkesas: supaprastintas JJN, greitesnis.',
        'Sierra: branduolių šeima, subalansuojanti kokybę ir greitį.',
        'Atkinsonas: šviesos sklaida, išsaugo detales, bet gali būti grūdėta.',
      ],
    },
    {
      heading: 'Dither Stiprumas',
      paragraphs: [
        'Kontroliuoja, kiek taikomas diteravimas (0–100 %). Mažesnės vertės išsaugo daugiau originalaus rašto, didesnės vertės parodo daugiau vaizdo detalių.',
      ],
    },
    {
      heading: 'Subpikselio nustatymai',
      paragraphs: ['Kai naudojate subpikselių maišymo režimą:'],
      bullets: [
        'Tinklelio dydis: 2 × 2, 3 × 3 arba 4 × 4 subpikseliai viename modulyje. Aukštesnis = daugiau detalių.',
        'Centro taisyklė: griežtai reikalaujama, kad centrinis subpikselis atitiktų modulį. Pustonių centras leidžia keisti.',
        'Neutrali spalva: spalva naudojama neapibrėžtiems subpikseliams.',
        'Finder Override: kaip atvaizduojami ieškiklio šablonai (vientisas arba stilizuotas).',
      ],
    },
    {
      heading: 'Pustonių nustatymai',
      paragraphs: ['Kai naudojate pustonių maišymo režimą:'],
      bullets: [
        'Langelių dydis: vienam moduliui arba N × N tinkleliui.',
        'Taško forma: apskritimas, kvadratas arba linija.',
        'Ryškumo kreivė: tiesinė, S kreivė arba gama.',
      ],
    },
    {
      heading: 'Duotone spalvos',
      paragraphs: [
        'Kai naudojate „Duotone" maišymo režimą, nustatykite šešėlių spalvą (tamsios sritys) ir paryškinimo spalvą (šviesios sritys).',
      ],
    },
    {
      heading: 'GIF animacijos nustatymai',
      paragraphs: ['Kai naudojate animuotas GIF perdangas:'],
      bullets: [
        'Naudokite kadrų delsas: laikykitės originalaus GIF laiko.',
        'Maksimalus FPS: ribojamas kadrų dažnis (1–60 kadrų per sekundę).',
        'Išmetimo tvarkymas: gerbkite arba supaprastinkite rėmo šalinimo būdus.',
      ],
    },
    {
      heading: 'Išplėstinės atvaizdavimo parinktys',
      paragraphs: ['Papildomi atvaizdavimo valdikliai:'],
      bullets: [
        'Tarpo režimas: nėra, įdėtas, brūkšniuotas arba neigiamas tarpo tarpo stilius.',
        'Kampo spindulys: suapvalintų kampų procentas moduliams.',
        'Gradientas: nėra, tiesinis, radialinis arba kūginis modulių gradientas.',
        'Akių išorinis/vidinis stilius: nepriklausomas ieškiklio raštų žiedų stilius.',
        'Taško sukimas: pasukite deimantinius / taškinius modulius.',
        'Akių skalė: dydžio reguliavimas ieškiklio modeliams.',
        'Rėmo stilius: pridėkite dekoratyvinius rėmelius (apvalintą rėmelį, lipduką, žymą).',
        'Rėmelio tekstas: pridėkite tekstą, pvz., \\"Nuskaityti mane!\\" į rėmus.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Išplėstinė QR koduotė',
      paragraphs: ['Tiksliai sureguliuokite QR kodavimą:'],
      bullets: [
        'Kodavimo režimas: automatinis, skaitmeninis, raidinis ir skaitmeninis, baitas / UTF-8 arba Kanji.',
        'Įgyvendinti minimalią tyliąją zoną: Užtikrinkite bent 4 modulių paraštę.',
        'Kaukės modelis: automatinis (optimalus) arba rankiniu būdu pasirinkite modelius 0–7, kad valdytumėte modulio paskirstymą. Skirtingi modeliai sukuria skirtingą vizualinį vaizdą, tuo pačiu užkoduodami tuos pačius duomenis.',
        'Simbolių kodavimas: ISO-8859-1 (numatytasis lotyniškas 1), UTF-8 (visas unikodas, įskaitant jaustukus) arba Shift-JIS (japonų k.). Pasirinkite pagal savo turinio charakterio reikalavimus.',
      ],
    },
    {
      heading: 'Išplėstinės išvesties parinktys',
      paragraphs: ['Papildomi eksporto nustatymai:'],
      bullets: [
        'Failo pavadinimas: pasirinktinis atsisiuntimo failo pavadinimas.',
        'GIF paletės dydis: 2–256 spalvos GIF išvestyje.',
        'GIF kvantavimo priemonė: „Median Cut", „NeuQuant" arba „Octree" spalvų mažinimas.',
        'GIF keitimas: išjungtas, „Floyd-Steinberg" arba užsakytas.',
        'GIF skaidri spalva: nustatykite skaidrią spalvą.',
        'SVG tikrasis vektorius: vietoj įterpto rastro naudokite kelius.',
        'SVG formos tikslumas: pikselių arba tikslaus kelio atvaizdavimas.',
        'SVG įterpimo rastro perdanga: įtraukite perdangą kaip įterptą vaizdą.',
        'Fono nepaisymas: priverstinai įvesti tam tikrą fono spalvą išvestyje.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Patvirtinimo parinktys',
      paragraphs: ['Įvesties apdorojimo nustatymai:'],
      bullets: [
        'Patvirtinkite įvestį: prieš koduodami patikrinkite turinio formatą.',
        'Apkarpyti tarpą: pašalinkite priekinius/galinius tarpus.',
        'Normalizuoti naujas eilutes: konvertuoti visas eilučių pabaigas į LF.',
        'Max Length Guard: perspėkite, jei turinys viršija QR talpą.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Profesionalios savybės',
      paragraphs: [
        'Profesionalus lygis prideda vandens ženklus, metaduomenis, bendrinimo parinktis, saugos analizę, mokėjimo QR kodus ir įmonės funkcijas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vandens ženklas',
      paragraphs: ['Pridėkite vandens ženklus prie savo QR kodų:'],
      bullets: [
        'Rūšis: tekstas, vaizdas arba šablono vandens ženklas.',
        'Padėtis: centras, kampai, kraštai, užpakalinė arba tyli zona.',
        'Nepermatomumas: vandens ženklo skaidrumas (0-100%).',
        'Maišymo režimas: įprastas, daugybos, ekrano arba perdangos maišymas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metaduomenys',
      paragraphs: ['Įterpti metaduomenis į eksportuotus failus:'],
      bullets: [
        'Laukai Pavadinimas, Autorius, Autorių teisės, Licencija, Aprašymas.',
        'Kūrimo laikas: įterpkite generavimo laiko žymą.',
        'Tinkintas rakto vertė: pridėkite savavališkas metaduomenų poras.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Dalijimasis',
      paragraphs: ['Bendrinkite savo QR kodo konfigūracijas:'],
      bullets: [
        'Tiesioginė nuoroda: sugeneruokite bendrinamą URL naudodami dabartinius nustatymus.',
        'Įterpti HTML: gaukite svetainių įterpimo kodą.',
        'Koduoti parametrus: įtraukite visus nustatymus į bendrinamą URL.',
        'Pastaba: Perdangos vaizdų iš vietinių failų negalima bendrinti naudojant URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Saugos analizė',
      paragraphs: ['Užtikrinkite, kad QR kodai būtų nuskaitomi:'],
      bullets: [
        'Saugos režimas: išjungtas, subalansuotas arba griežti nuskaitymo reikalavimai.',
        'Minimalus modulio dydis: mažiausias pikselių dydis viename modulyje.',
        'Minimali tyli zona: minimalios paraštės moduliai.',
        'Užrakinimo ieškikliai / laikas / lygiavimas / formatas / versija: apsaugokite konkrečius elementus.',
        'Maksimalus perdangos intensyvumas pagal ECC: automatinės intensyvumo ribos, pagrįstos klaidų taisymo lygiu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Turinio tipai (profesionalus)',
      paragraphs: ['Profesionalus lygis prideda mokėjimo ir įmonės turinio tipus:'],
      bullets: [
        'EPC/SEPA (ES): Europos banko pervedimo QR kodai su IBAN, BIC, suma, nuoroda.',
        'UPI (Indija): vieninga mokėjimų sąsaja su VPA, gavėjo pavadinimas, suma.',
        'PayNow (Singapūras): Singapūras greitas mokėjimas UEN arba mobiliojo telefono numeriu.',
        'PromptPay (Tailandas): Tailando nacionalinė mokėjimo sistema.',
        'PIX (Brazilija): Brazilijos momentinis mokėjimas naudojant PIX raktą.',
        'Kripto: Bitcoin, Ethereum, Litecoin mokėjimo adresai su pasirenkama suma.',
        'Rinkodaros kampanijos nuoroda: URL su visu UTM parametrų (rinkodaros žymų) stebėjimu.',
        'Santaa nuoroda: skirta naudoti su URL sutrumpintuvais, skirtais dinaminiams / sekamiems QR kodams.',
        'GS1 skaitmeninė nuoroda: produkto identifikavimas su GTIN, serija, partija, galiojimo laikas.',
        'Programos gilioji nuoroda: „iOS" / „Android" programų giliosios nuorodos su tinkintomis schemomis.',
        'Pasirinktinis formatas: neapdoroti duomenys be formatavimo ar patvirtinimo.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Su kalba susiję mokėjimai išplėstiniu režimu',
      paragraphs: [
        'Naudojant išplėstinį režimą, ANQR automatiškai rodo mokėjimo būdus, susijusius su pasirinkta kalba. Pavyzdžiui, Vietnamo naudotojai mato VietQR, Tailando naudotojai – PromptPay, o indų kalbos vartotojai – UPI ir BharatQR. Pasauliniai mokėjimo būdai (kriptovaliuta, PayPal, Cash App) galimi visomis kalbomis. Profesionalus režimas atrakina visus mokėjimo standartus, nepaisant kalbos.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Europos mokėjimo standartai',
      bullets: [
        'EPC/SEPA (ES): Europos banko pervedimo QR kodai pagal EPC QR kodo standartą. Palaiko IBAN, BIC (neprivaloma vietiniams), sumą eurais ir struktūrizuoto arba nestruktūrizuoto mokėjimo nuorodas. Naudojamas visoje SEPA zonoje, įskaitant ES šalis ir Šveicariją, Norvegiją, Islandiją, Lichtenšteiną, Monaką ir San Mariną.',
        'Šveicarijos QR sąskaita: Šveicarijos mokėjimo standartas pagal ŠEŠIAS įgyvendinimo gaires. Palaiko CHF ir EUR, QR nuorodą (QRR), kreditorių nuorodą (ISO 11649), struktūrinius kreditorių / skolininkų adresus ir sąskaitos informaciją. Reikalingas Šveicarijos sąskaitoms faktūroms nuo 2022 m.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indijos mokėjimo standartai',
      bullets: [
        'UPI (Indija): vieninga mokėjimų sąsaja pagal NPCI giliojo susiejimo specifikaciją. Palaiko VPA (virtualus mokėjimo adresas), gavėjo vardą, sumą INR, operacijos pastabą, nuorodos ID, prekybininko kategorijos kodą ir operacijos režimą.',
        'BharatQR (Indija): vieningas QR standartas, palaikantis tiek UPI, tiek mokėjimus kortele. Sujungia UPI VPA su kortelės PAN, kad būtų maksimalus suderinamumas. Apima prekybininko pavadinimą, miestą, MKC, GST informaciją ir sąskaitos faktūros / nuorodos numerius.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pietryčių Azijos mokėjimo standartai',
      bullets: [
        'PayNow (Singapūras): Singapūro greitųjų mokėjimų sistema naudojant EMVCo QR specifikaciją su SGQR profiliu. Palaiko UEN (verslo registraciją), mobiliojo telefono numerį arba NRIC kaip tarpinio serverio identifikatorius. Apima sumos redagavimo vėliavėlę ir galiojimo datą.',
        '„PromptPay" (Tailandas): Tailando nacionalinė mokėjimo sistema pagal Bank of Thailand EMV profilį. Palaiko mobiliojo telefono numerį, nacionalinį ID, mokesčių ID, el. piniginės ID ir sąskaitos apmokėjimą su keliais nuorodos laukais.',
        'QRIS (Indonezija): Indonezijos greitojo reagavimo kodas. EMV pagrįstas nacionalinis mokėjimo standartas, palaikantis prekybininko ID, NMID (nacionalinį prekybininko ID), prekybininko kriterijų klasifikaciją ir patogumo mokesčius (fiksuotus arba procentinius).',
        'DuitNow (Malaizija): Malaizijos momentinių mokėjimų sistema. Palaiko kelis tarpinio serverio tipus, įskaitant NRIC, mobilųjį telefoną, pasą, armijos ID ir verslo registracijos numerius.',
        'VietQR (Vietnamas): Vietnamo tarpbankinių pervedimų standartas. Reikalingas banko BIN (NAPAS identifikavimas) ir sąskaitos numeris. Palaiko kelis paslaugų kodus skirtingiems perdavimo tipams (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipinai): Filipinų QR mokėjimo standartas, skirtas InstaPay ir PESONet. Naudoja sąskaitų numerius su prekybininko identifikavimu P2M (asmens ir prekybininko) operacijoms.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Rytų Azijos mokėjimo standartai',
      bullets: [
        'TWQR (Taivanas): Taivano QR mokėjimo standartas. Palaiko prekybininko ID, mokesčių ID ir TWD sumas.',
        'HKQR/FPS (Honkongas): greitesnio Honkongo mokėjimo sistemos QR kodai. Palaiko FPS ID, mobiliojo telefono numerį arba el. paštą kaip mokėjimo identifikatorius. Sumos HKD.',
        'JPQR (Japonija): Japonijos vieningas QR kodo mokėjimo standartas. Prekybininko identifikavimui su JPY sumomis naudojamas parduotuvės ID.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kiti regioniniai mokėjimo standartai',
      bullets: [
        'PIX (Brazilija): Brazilijos centrinio banko momentinių mokėjimų sistema pagal BR kodo specifikaciją. Palaiko PIX raktus (CPF, CNPJ, el. paštą, telefoną arba atsitiktinį raktą), prekybininko pavadinimą / miestą, operacijos ID ir BRL sumas.',
        'AusPayNet/NPP PayID (Australija): Australijos naujoji mokėjimų platforma PayID sistema. Palaiko PayID tipus (el. paštas, mobilusis, ABN, organizacijos ID) arba tradicinį BSB + sąskaitos numerį. Prekybininko pavadinimas yra neprivalomas, nes mokėtojai mato registruotą pavadinimą iš AE paieškos.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mokėjimai kriptovaliuta',
      bullets: [
        'Bitcoin / Litecoin (BIP-21): standartiniai kriptovaliutų mokėjimo URI su piniginės adresu, pasirenkama suma ir etikete. Suderinamas su visomis pagrindinėmis Bitcoin ir Litecoin piniginėmis.',
        '„Lightning Network" (BOLT11): „Lightning Network" mokėjimo sąskaitos faktūros. Įklijuokite BOLT11 koduotą sąskaitos faktūros eilutę momentiniams Bitcoin mokėjimams su minimaliais mokesčiais.',
        'Ethereum (EIP-681): Ethereum operacijų užklausų URI, palaikantys vietinius ETH perkėlimus ir ERC-20 prieigos raktų perkėlimus. Apima grandinės ID kelių tinklų palaikymui (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), dujų parametrus ir sutarties funkcijų iškvietimus.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mokėjimo nuorodų paslaugos',
      bullets: [
        'PayPal.Me: PayPal mokėjimo nuorodos su vartotojo vardu ir pasirenkama iš anksto užpildyta suma. Gavėjai gali mokėti per PayPal balansą, korteles arba banko sąskaitas.',
        '„Cash App": „Cash App" mokėjimo nuorodos naudojant $cashtag su pasirenkama suma. Jungtinėse Amerikos Valstijose populiarūs mokėjimai tarp lygių.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Bendras EMV QR',
      bullets: [
        'EMV Generic: sukurkite pasirinktinius EMV prekybininko pateikto režimo QR kodus mokėjimo schemoms, kurios nėra konkrečiai nurodytos. Konfigūruokite prekybininko pavadinimą, miestą, šalies kodą (ISO 3166-1), valiutos kodą (ISO 4217 skaitmeninis), MKC, arbatpinigių / patogumo mokesčio parinktis ir papildomus duomenų laukus. Naudinga atliekant testavimą ar pritaikytą integravimą.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Perdangos maišymo režimai (profesionalūs)',
      paragraphs: ['Papildomi maišymo režimai profesionaliame lygyje:'],
      bullets: [
        'Pixelate: pikselių perdangos efektas.',
        'Kontūras: kraštų aptikimo perdanga, rodanti tik kontūrus.',
        'Banga: banguoto iškraipymo efektas.',
        'Subpikselio dydis: kintamas subpikselio dydis, pagrįstas vaizdu.',
        '„True Dither": pažangus purškimas su užsakyto matricos pasirinkimu.',
        'Ekstremalus: maksimalus vaizdo matomumas, gali turėti įtakos nuskaitomumui.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Apsaugos nustatymai',
      paragraphs: [
        'Tikslus valdymas, kurie QR elementai yra apsaugoti nuo perdangos modifikavimo:',
      ],
      bullets: [
        'Išsaugoti laiką: nepakeiskite laiko nustatymo modelių.',
        'Išsaugoti lygiavimą: laikykite lygiavimo modelius nepakeistus.',
        'Apsaugoti formato informaciją: ekrano formato informacijos moduliai.',
        'Apsaugokite informaciją apie versiją: apsaugokite versijos informacijos modulius.',
      ],
    },
    {
      heading: 'ECC žinantis režimas',
      paragraphs: [
        'Protingai paskirsto perdangos intensyvumą pagal klaidų taisymo galimybes. Sistema analizuoja, kuriuos modulius galima modifikuoti, išlaikant nuskaitomumą.',
      ],
      bullets: [
        'Rizikos biudžetas: naudojamų klaidų taisymo pajėgumų procentas (0–100 %).',
        'Didesnis biudžetas = labiau matoma perdanga, bet rizikingesnis nuskaitymas.',
        'Mažesnis biudžetas = saugesnis nuskaitymas, bet mažiau matoma perdanga.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Profesionalios atvaizdavimo parinktys',
      paragraphs: ['Išplėstiniai atvaizdavimo valdikliai:'],
      bullets: [
        'Aiškūs kraštai: naudokite pikselių vaizdo atvaizdavimą, kad modulio briaunos būtų ryškios.',
        'Pixel Snap: grindų, apvalių arba lubų taškų lygiavimas.',
        'Modulio spalvų režimas: vientisas, pagal ryškumą, pagal padėtį, pagal perdangą, pagal grupę.',
        'Spalvų paletė: nustatykite pasirinktinę spalvų paletę, skirtą spalvinti kiekvienam moduliui.',
        'Kontrasto apsauga: Užtikrinkite minimalų kontrasto santykį tarp spalvų.',
        'Minimalus kontrasto santykis: WCAG stiliaus kontrasto reikalavimas (nuo 1:1 iki 21:1).',
        'Papildomi pasienio moduliai: papildoma siena už ramios zonos.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Profesionalios išvesties parinktys',
      paragraphs: ['Įmonės eksporto nustatymai:'],
      bullets: [
        'DPI: nustatykite spausdinimo skiriamąją gebą (72–600 DPI). Spausdinti rekomenduojama 300 DPI.',
        'Įtraukti tyliąją zoną: perjungti tyliąją zoną į išvesties matmenis.',
        'Eksportuoti kaip papildomą: generuokite PDF kartu su pirminiu formatu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Animacijos nustatymai (profesionalūs)',
      paragraphs: ['Papildomos profesionalios animacijos funkcijos:'],
      bullets: [
        'Temporal Dither: išjungtas, mėlynas triukšmas arba mirgėjimo saugus keitimas kadrui.',
        'Šablonas: Nėra, Pulsas, Banga, Scanline, Shimmer arba Drift efektai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API nuoroda',
      paragraphs: [
        'ANQR teikia serverio API, skirtą QR kodams generuoti naudojant URL parametrus. Tai idealiai tinka QR kodams įterpti į svetaines, el. laiškus, dokumentus ar automatines darbo eigas be kliento pusės „JavaScript".',
        'Bazinis URL: https://anqr.link/api/qr',
      ],
      links: [
        { href: '/examples?lang=${lang}', label: 'Peržiūrėkite QR pavyzdžius', type: 'example' },
      ],
    },
    {
      heading: 'Pagrindiniai parametrai',
      paragraphs: ['Būtini ir bendrieji parametrai (parametrų pavadinimai neverčiami):'],
      bullets: [
        'duomenys (būtini): turinys, kurį reikia užkoduoti QR kodu. URL koduoja specialiuosius simbolius.',
        'dydis: vaizdo dydis pikseliais (numatytasis: 400, maks.: 2000). Naudojamas, jei nenurodyta.',
        'w, h: išvesties plotis ir aukštis pikseliais. Nepaiso dydžio parametro.',
        'formatas: išvesties formatas – png, webp arba gif (numatytasis: png).',
        'ec: klaidų taisymo lygis – L, M, Q arba H (numatytasis nustatymas: H).',
        'fg: priekinio plano spalva kaip šešioliktainė be # (numatytasis: 000000).',
        'bg: fono spalva kaip šešioliktainis be # (numatytasis: ffffff).',
        'skaidrus: nustatykite 1, kad fonas būtų skaidrus.',
        'paraštė: tylioji zona moduliuose (numatytasis: 4).',
      ],
    },
    {
      heading: 'Stiliaus parametrai',
      paragraphs: ['Modulio ir modelio stilius:'],
      bullets: [
        'stilius: Modulio stilius – kvadratinis, suapvalintas, taškinis, deimantinis, sujungtas.',
        'ieškiklis: ieškiklio modelio stilius - kvadratas, suapvalintas, apskritimas.',
        'lygiuoti: lygiavimo modelio stilius – match_finder, kvadratas, suapvalintas, apskritimas.',
        'laikas: laiko modelio stilius – match_module, vientisas, brūkšninis.',
        'spindulys: Kampo spindulio procentas 0-100.',
        'tarpas: modulio tarpo procentas 0-50.',
        'gapMode: tarpo režimas – nėra, įdėta, potėpis, neigiamas_tarpas.',
        'eyeOuter, eyeInner: Akių stiliai – kvadratiniai, suapvalinti, apskriti.',
        'eyeScale: akių skalės procentas (numatytasis: 100).',
        'grad: gradiento tipas - nėra, linijinis, radialinis, kūginis.',
        'gradAngle: tiesinių gradientų gradiento kampas.',
        'gradStops: gradientas sustoja kaip color1,pos1,color2,pos2,... (pvz., ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Perdangos parametrai',
      paragraphs: ['Vaizdo perdangos parinktys (perdangos vaizdas gaunamas iš serverio):'],
      bullets: [
        'img: URL į perdangos vaizdą (turi būti viešai prieinamas).',
        'režimas: perdangos režimas – centras, pustonis, maišymas, ryškumas, mozaika, suskaidytas, mėlynas triukšmas, subpikselis.',
        'intensyvumas: perdangos intensyvumas 0–100 (numatytasis: 100).',
        'colorMode: perdangos spalvų režimas – spalvotas, pilkos spalvos, bw.',
        'tinka: kaip tinka perdanga – uždenkite, sulaikykite, ištempkite.',
        'puvimas: perdangos pasukimas laipsniais.',
        'flipX, flipY: nustatykite į 1, jei norite apversti perdangą.',
        'keepFinders: Išsaugokite ieškiklio šablonus (numatytasis: 1).',
        'KeepTiming, keepAlign: nustatykite į 1, kad išsaugotumėte laiko nustatymo / lygiavimo modelius.',
      ],
    },
    {
      heading: 'Pirminio apdorojimo parametrai',
      paragraphs: ['Perdangai pritaikytas išankstinis vaizdo apdorojimas:'],
      bullets: [
        'ryškumas: reguliavimas nuo -100 iki 100 (numatytasis nustatymas: 0).',
        'kontrastas: reguliavimas nuo -100 iki 100 (numatytasis nustatymas: 0).',
        'gama: reikšmė nuo 0,1 iki 3 (numatytasis: 1).',
        'sodrumas: reguliavimas nuo -100 iki 100 (numatytasis nustatymas: 0).',
        'atspalvis: atspalvio pasukimas laipsniais.',
        'suliejimas: suliejimas pikseliais.',
        'pagaląsti: pagaląsti kiekis 0-100.',
        'plakatas: plakato lygiai.',
        'slenkstis: dvejetainis slenkstis 0-255.',
        'kraštas: krašto aptikimas – išjungtas, sobel, gudrus.',
        'apversti: nustatykite 1, kad pakeistumėte spalvas.',
      ],
    },
    {
      heading: 'Vandens ženklo parametrai',
      paragraphs: ['Pridėkite vandens ženklus prie sugeneruotų QR kodų:'],
      bullets: [
        'wmEn: nustatykite 1, kad įjungtumėte vandens ženklą.',
        'wmKind: vandens ženklo tipas – tekstas, vaizdas, raštas.',
        'wmText: vandens ženklo tekstas (užkoduotas URL).',
        'wmImg: URL į vandenženklio vaizdą.',
        'wmPos: padėtis – centras, kampai, kraštai, užpakalinė, tylioji zona.',
        'wmOpacity: neskaidrumas 0–100 (numatytasis: 50).',
        'wmBlend: maišymo režimas – įprastas, daugybos, ekrano, perdangos.',
      ],
    },
    {
      heading: 'Animacijos parametrai',
      paragraphs: ['Animuota GIF išvestis (reikia format=gif):'],
      bullets: [
        'animPattern: animacijos raštas – nėra, pulsas, banga, nuskaitymo linija, mirgėjimas, dreifas, spalvos_ciklas.',
        'animFrames: kadrų skaičius nuo 1 iki 60 (numatytasis: 24).',
        'animSpeed: kadro delsa milisekundėmis 10–1000 (numatytasis: 100).',
        'animSeed: atsitiktinė animacija.',
        'palengvėjimas: Animacijos lengvinimas – linijinis, lengvumas įvedimas, lengvumas_išėjimas, lengvumas_išėjimas, atšokimas.',
      ],
    },
    {
      heading: 'Išvesties parametrai',
      paragraphs: ['Išvesties formato parinktys:'],
      bullets: [
        'kokybė: WebP kokybė 0-1 (numatytasis: 0,9).',
        'webpQ: WebP kokybė 0–100 (numatytasis: 90).',
        'gifColors: GIF paletės dydis 2–256 (numatytasis dydis: 256).',
        'dpi: PNG išvesties DPI (numatytasis dydis: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: PNG metaduomenų laukai.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Apkarpymo parametrai',
      paragraphs: ['Perdangos vaizdo apkarpymo parinktys:'],
      bullets: [
        'cropEn: įgalinti perdangos apkarpymą 0/1 (numatytasis nustatymas: 0).',
        'cropX: apkarpyti centrą X kaip trupmeną 0–1 (numatytasis nustatymas: 0,5).',
        'cropY: apkarpymo centras Y kaip trupmena 0–1 (numatytasis nustatymas: 0,5).',
        'cropSize: apkarpymo dydis kaip 0–1 vaizdo dalis (numatytasis nustatymas: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Saugos užrakto parametrai',
      paragraphs: ['Valdykite, kurie QR elementai yra apsaugoti nuo perdangos modifikavimo:'],
      bullets: [
        'lockF: užrakto ieškiklio šablonai 0/1 (numatytasis nustatymas: 1).',
        'lockT: užrakinimo laiko šablonai 0/1 (numatytasis nustatymas: 1).',
        'lockA: užrakto lygiavimo šablonai 0/1 (numatytasis nustatymas: 1).',
        'lockFmt: užrakto formato informacija 0/1 (numatytasis nustatymas: 1).',
        'lockV: užrakto versijos informacija 0/1 (numatytasis: 1).',
        'safeMode: saugos režimas – išjungtas, subalansuotas, griežtas (numatytasis: išjungtas).',
        'safeMinPx: Minimalus modulio dydis pikseliais (numatytasis: 2).',
        'safeMinQz: Minimalus tylios zonos modulis (numatytasis: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Automatinis parametrų derinimas',
      paragraphs: ['Automatinio optimizavimo nustatymai:'],
      bullets: [
        'autoVer: automatiškai pasirinkite QR versiją 0/1 (numatytasis: 1).',
        'autoEcc: Automatinis ECC lygio pasirinkimas 0/1 (numatytasis: 0) – tik serverio užuomina.',
        'autoReduce: [TIK KLIENTUI] Automatiškai sumažinti intensyvumą, kol bus galima nuskaityti – reikalinga nuskaitymo patvirtinimo kilpa.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Papildomi animacijos parametrai',
      paragraphs: ['Išplėstiniai GIF išvesties animacijos valdikliai:'],
      bullets: [
        'ciklas: animacijos ciklai nenutrūkstamai 0/1 (numatytasis nustatymas: 1).',
        'atšokimas: stalo teniso animacijos kryptis 0/1 (numatytasis nustatymas: 0).',
        'Reverse: Leisti animaciją atvirkščiai 0/1 (numatytasis: 0).',
        'colorCycle: įgalinkite spalvų ciklo efektą 0/1 (numatytasis: 0).',
        'interp: kadro interpoliacija – nėra, kryžminis išblukimas, morph (numatytasis: nėra).',
        'tempDither: laikinas keitimas – išjungtas, mėlynas_triukšmas, mirgėjimo_saugus (numatytasis nustatymas: išjungtas).',
        'startF: animacijos pradžios kadras (numatytasis nustatymas: 0).',
        'maxF: maksimalus kadrų skaičius, kurį reikia pateikti (numatytasis nustatymas: 0 = automatinis).',
        'stepF: kadro žingsnio intervalas (numatytasis: 1).',
        'virpėjimas: [TIK KLIENTUI] Modulio virpėjimas pikseliais – reikalingas QR atkūrimas kiekvienam kadrui.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Skirstymo parametrai',
      paragraphs: ['Valdymo perdangos apdorojimo algoritmai:'],
      bullets: [
        'ditherKind: Dither algoritmas – error_diffusion, ordered_bayer, blue_noise ir tt (numatytasis: ordered_bayer).',
        'diffusionKernel: klaidos difuzijos branduolys – floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (numatytasis nustatymas: floyd_steinberg).',
        'ditherStrength: Dygimo intensyvumas 0–100 (numatytasis: 50).',
        'serpantinas: Serpantino dithering 0/1 (numatytasis: 0).',
        'matrica: užsakyta dither matrica - bayer2, bayer4, bayer8 (numatytasis: bayer4).',
        'bnTile: mėlynos triukšmo plytelės dydis (numatytasis: 64).',
        'bnSeed: Blue noise atsitiktinė sėkla (numatytasis nustatymas: 0).',
        'colorDither: spalvų skirstymas – nėra, per_kanalą, suvokiamas (numatytasis: nėra).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Subpikselio parametrai',
      paragraphs: ['Subpikselių maišymo režimo nustatymai:'],
      bullets: [
        '„spGrid": Subpikselių tinklelio dydis – 2x2, 3x3, 4x4 (numatytasis dydis: 3x3).',
        'spCenter: Centro taisyklė – griežta, pustonių_centras (numatytasis: griežtas).',
        'spNeutral: neutralios spalvos šešioliktainis be # (numatytasis: 808080).',
        'spFinder: ieškiklio nepaisymas – vientisas, stilizuotas (numatytasis: vientisas).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Pustonio parametrai',
      paragraphs: ['Pustonių maišymo režimo nustatymai:'],
      bullets: [
        'htCell: pustonio langelio dydis – per_module arba nxn tinklelis (numatytasis: per_module).',
        'htDot: taško forma – apskritimas, kvadratas, linija (numatytasis: apskritimas).',
        'htCurve: Ryškumo kreivė – tiesinė, s kreivė, gama (numatytasis: linijinis).',
        'duo1: dvispalvės šešėlių spalvos šešioliktainis be # (numatytasis nustatymas: 000000).',
        'duo2: Duotone paryškinimo šešioliktainė spalva be # (numatytasis nustatymas: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC žinomo režimo parametrai',
      paragraphs: ['Sumanus perdangos paskirstymas, pagrįstas klaidų taisymo pajėgumu:'],
      bullets: [
        'eccAware: įgalinkite ECC suvokimo režimą 0/1 (numatytasis nustatymas: 0).',
        'eccRisk: rizikos biudžeto procentas 0–100 (numatytasis dydis: 50).',
        'eccMap: svorio žemėlapis – atstumas iki ieškiklių, bloko_šilumos žemėlapis, empirinis_skanavimo_šilumos žemėlapis (numatytasis: atstumas iki ieškiklių).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Rėmelio parametrai',
      paragraphs: ['Dekoratyvinio rėmo nustatymai:'],
      bullets: [
        'rėmelis: rėmelio stilius – nėra, suapvalintas_rėmas, lipdukas, žyma (numatytasis: nėra).',
        'frameText: tekstas, kuris rodomas rėmelyje (užkoduotas URL).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Modulio spalvų parametrai',
      paragraphs: ['Atskirų modulių spalvinimo parinktys:'],
      bullets: [
        'modColor: spalvų režimas – vientisas, pagal_ryškumą, pagal_poziciją, pagal_perdangą, pagal_grupę (numatytasis nustatymas: vientisas).',
        'cGuard: Kontrasto apsauga 0/1 (numatytasis: 0).',
        'minContrast: Minimalus kontrasto santykis 1-21 (numatytasis: 4,5).',
        'paletė: kableliais atskirtos šešioliktainės spalvos paletės režimui.',
        'paletės režimas: paletės paskirstymas – padėtis, ryškumas, įstrižainė, radialinis, atsitiktinis, eilutė, stulpelis (numatytasis: padėtis).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF perdangos parametrai',
      paragraphs: ['Animuotų GIF perdangos vaizdų nustatymai:'],
      bullets: [
        'ovType: perdangos tipas – statinis, gif, apng, webp_anim, vaizdo įrašas (numatytasis: statinis).',
        'ovFramePick: kadrų pasirinkimas – visi, kas_n, maks. kadrai, trukmės_riba (numatytasis nustatymas: visi).',
        'gifDelays: naudokite originalų GIF kadrų delsą 0/1 (numatytasis: 1).',
        'gifDispH: GIF šalinimo tvarkymas – gerbk, supaprastink (numatytasis: pagarba).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Per-ECC intensyvumo ribos',
      paragraphs: ['Didžiausias perdangos intensyvumas klaidų taisymo lygiu:'],
      bullets: [
        'maxIntL: maksimalus intensyvumas ECC L 0-100 (numatytasis: 100).',
        'maxIntM: maksimalus intensyvumas ECC M 0-100 (numatytasis: 100).',
        'maxIntQ: maksimalus intensyvumas ECC Q 0-100 (numatytasis: 100).',
        'maxIntH: maksimalus intensyvumas ECC H 0-100 (numatytasis: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA modeliavimo parametrai (tik klientui)',
      paragraphs: [
        'Šie parametrai analizuojami siekiant suderinti URL, bet veikia tik naršyklėje:',
      ],
      bullets: [
        'qaContrast: įgalinti kontrasto patikrinimą 0/1 – reikalingas interaktyvus patvirtinimas.',
        'qaBlur: imituokite suliejimą pikseliais – tik interaktyviems bandymams.',
        'qaNoise: imituokite triukšmo lygį – tik interaktyviems bandymams.',
        'qaHeatmap: Rodyti skaitomumo šilumos žemėlapį 0/1 – reikalinga drobės perdangos vartotojo sąsaja.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Tik klientui skirti parametrai',
      paragraphs: [
        'Dauguma API parametrų yra visiškai palaikomi serverio pusėje. Parametrai, pažymėti [CLIENT-ONLY], yra analizuojami, kad būtų suderinami URL, tačiau jiems reikia naršyklės funkcijų:',
      ],
      bullets: [
        'virpėjimas: modulio virpėjimui reikalingas atsitiktinis QR regeneravimas kiekviename kadre.',
        '„autoReduce": norint automatiškai sumažinti intensyvumą, reikia atlikti kartotinį nuskaitymo testą.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: QA modeliavimui reikalingas interaktyvus drobės patvirtinimas.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Papildomi išvesties parametrai',
      paragraphs: ['Išplėstiniai išvesties ir eksporto nustatymai:'],
      bullets: [
        'fname: pasirinktinis atsisiuntimo failo pavadinimas (numatytasis: anqr-qrcode).',
        'inclQz: įtraukite tyliąją zoną į išvesties matmenis 0/1 (numatytasis nustatymas: 1).',
        'bgOver: fono spalvos nepaisymas šešioliktadienio be # (nepaiso bg parametro).',
        'fmtExtra: papildomo formato išvestis – nėra, eps, animated_webp (numatytasis: nėra). Pastaba: eps yra [DALINĖ].',
        'svgPrec: SVG formos tikslumas – pikselis, tikslus (numatytasis: pikselis). [DALINĖ] SVG išvestis apribota serverio pusėje.',
        'svgEmbed: įterpkite rastrinę perdangą į SVG 0/1 (numatytasis nustatymas: 1). [DALINĖ] SVG išvestis apribota serverio pusėje.',
        'modulePx: modulio pikselių dydis (numatytasis: automatiškai apskaičiuojamas pagal dydį).',
        'siena: papildomi kraštiniai moduliai už tyliosios zonos (numatytasis nustatymas: 0).',
        'crisp: įgalinkite ryškaus / pikselių vaizdo atvaizdavimą 0/1 (numatytasis: 1).',
        '„Snap": „Pixel Snap" režimas – grindys, apvalios, lubos (numatytasis nustatymas: grindys).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Rašto išsaugojimo parametrai',
      paragraphs: ['Valdykite, kurie konstrukciniai elementai yra apsaugoti nuo perdangos:'],
      bullets: [
        'keepFinders: Išsaugoti ieškiklio šablonus 0/1 (numatytasis nustatymas: 1).',
        'KeepTiming: Išsaugokite laiko šablonus 0/1 (numatytasis nustatymas: 0).',
        'KeepAlign: Išsaugokite lygiavimo šablonus 0/1 (numatytasis nustatymas: 0).',
        'ProtectFmt: Apsaugokite formato informacijos modulius 0/1 (numatytasis: 0).',
        'ProtectVer: Apsaugokite versijos informacijos modulius 0/1 (numatytasis: 0).',
      ],
    },
    {
      heading: 'Naudojimo pavyzdys',
      paragraphs: [
        'Pagrindinis QR kodas:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Stilizuotas QR kodas su pasirinktomis spalvomis:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'QR kodas su perdangos vaizdu:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'Animuotas GIF:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [
        { href: '/examples?lang=${lang}', label: 'Peržiūrėkite QR pavyzdžius', type: 'example' },
      ],
    },
    {
      heading: 'QR kodų įterpimas',
      paragraphs: [
        'Profesionaliu režimu bendrinimo funkcija generuoja įterpiamąjį HTML ir URL. Štai kaip veikia įterpimas:',
      ],
      bullets: [
        'Bendrinti saitą: sukuriamas ANQR programos URL su visais nustatymais, užkoduotais kaip URL parametrai. Gavėjai gali peržiūrėti ir keisti QR kodą.',
        'Įterpti vaizdą: sugeneruoja žymą <img>, nukreipiančią į serverio API. QR kodas pateikiamas serverio pusėje ir pateikiamas kaip vaizdas.',
        'Įterpti žymėjimą: sukuria Markdown vaizdo sintaksę dokumentams ir README failams.',
        'Tiesioginis API URL: neapdorotas API URL, skirtas naudoti programose, scenarijuose ar kitose integracijose.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML pavyzdys',
      paragraphs: [
        'Norėdami įterpti QR kodą į savo svetainę:',
        '<img src=\\"https://anqr.link/api/qr?data=https://yoursite.com&size=200\\" alt=\\"QR kodas\\" />',
        'Jei norite pasirinkti tinkamą dydį:',
        '<img src=\\"https://anqr.link/api/qr?data=https://yoursite.com&size=400\\" alt=\\"QR kodas\\" style=\\"maksimalus plotis: 100%; aukštis: automatinis;\\" />',
        'Serveris talpina atsakymus su ilgomis talpyklos antraštėmis, todėl pakartotinės užklausos dėl to paties URL yra greitos.',
      ],
    },
    {
      heading: 'Bendrinti URL formatą',
      paragraphs: [
        'Spustelėjus Bendrinti profesionaliu režimu, ANQR užkoduoja dabartinius nustatymus į URL parametrus. Formatas yra:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Šie parametrai atspindi API parametrus, todėl galite konvertuoti bendrinamą URL į API URL, pakeisdami pagrindinį kelią iš / į /api/qr ir prireikus koreguodami w/h parametrus.',
        'Pastaba: Perdangos vaizdai, įkelti iš vietinių failų, negali būti bendrinami naudojant URL – bendrinamose nuorodose ir API iškvietimuose veikia tik URL pagrįstos perdangos (img parametras).',
      ],
    },
    {
      heading: 'Kainos ribos ir naudojimas',
      paragraphs: [
        'API galima nemokamai naudoti esant pagrįstiems kiekiams. Jei norite naudoti didelius kiekius arba naudoti komercines programas, kurioms reikalingas garantuotas veikimo laikas, susisiekite su mumis.',
        'API atsakymai apima agresyvias talpyklos antraštes. Siekdami geriausio našumo, atsakykite atsakymus į talpyklą arba nuosekliai naudokite tą patį URL identiškiems QR kodams.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Geriausia praktika',
      paragraphs: ['Norėdami gauti patikimus QR kodus, vadovaukitės šiomis gairėmis:'],
      bullets: [
        'Prieš spausdindami visada išbandykite savo QR kodus naudodami kelias skaitytuvo programas.',
        'Pridėdami perdangas naudokite klaidų taisymą H (aukštas).',
        'Turėkite bent 4 tyliosios zonos modulius (kraštą).',
        'Užtikrinkite didelį kontrastą tarp priekinio plano ir fono.',
        'Norėdami spausdinti, naudokite bent 300 DPI ir išbandykite tikrąjį spausdinimo dydį.',
        'Įgalinkite Preserve Finder Patterns, kai naudojate perdangas.',
        'Pradėkite nuo mažesnio perdangos intensyvumo ir palaipsniui didinkite.',
        'Naudodami lauke, apsvarstykite didesnius modulių dydžius ir didesnį klaidų taisymą.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Naršyti Sužinokite straipsnius', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Peržiūrėkite QR pavyzdžius', type: 'example' },
      ],
    },
    {
      heading: 'Trikčių šalinimas',
      paragraphs: ['Dažnos problemos ir sprendimai:'],
      bullets: [
        'QR nenuskaitys: sumažinkite perdangos intensyvumą, padidinkite klaidų taisymą, patikrinkite kontrastą.',
        'Kodas per didelis: sumažinkite turinio ilgį, naudokite URL sutrumpinimą, sumažinkite versiją.',
        'Neryški išvestis: padidinkite modulio dydį, naudokite PNG vietoj suspaustų formatų.',
        'Spalvos atrodo neteisingai: patikrinkite spalvų kontrastą, išbandykite pilkos spalvos perdangos režimą.',
        'GIF nėra animacinis: įsitikinkite, kad naudojate GIF formato išvestį, patikrinkite kadrų skaičių.',
        'Vaizdo perdanga neįkeliama: patikrinkite CORS leidimus nuotoliniuose vaizduose.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Žr. susijusius vadovus ir pavyzdžius',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Spartieji klavišai',
      paragraphs: [
        'ANQR palaiko standartinius sparčiuosius klavišus. Naudokite Ctrl/Cmd+S, kad suaktyvintumėte eksportą (kai sufokusuota peržiūra).',
      ],
    },
    {
      heading: 'Bendrinimas ir įterpimas',
      paragraphs: [
        'Profesionaliu režimu spustelėkite mygtuką Bendrinti, kad nukopijuotumėte URL su dabartiniais nustatymais. Gavėjai gali atidaryti šį URL, kad pamatytų tikslią konfigūraciją. Pastaba: Perdangos vaizdų iš vietinių failų negalima bendrinti naudojant URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Išbandykite šią konfigūraciją tiesiogiai ANQR generatoriuje.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Naršyti Sužinokite straipsnius', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Peržiūrėkite QR pavyzdžius', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Peržiūrėkite QR pavyzdžius', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Atidarykite generatorių', type: 'generator' },
  ],
};

export default guide;
