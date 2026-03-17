import type { PageDefinition } from "../types";

export const guide: PageDefinition = {
  title: "Mwongozo wa Mtumiaji wa ANQR",
  description: "Mwongozo kamili wa kutumia ANQR kuunda misimbo ya QR.",
  lastUpdated: "1 Februari 2026",
  breadcrumb: ["Mwongozo"],
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Fungua jenereta", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Vinjari Makala ya Jifunze", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Tazama mifano ya QR", type: "example" },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: "Kuanza",
      paragraphs: [
        "ANQR ni jenereta ya msimbo wa QR yenye mbinu ya mteja-kwanza. Kwa chaguo-msingi, misimbo ya QR huzalishwa ndani ya kivinjari chako - hakuna akaunti inayohitajika na data yako husalia ya faragha. Kwa upachikaji wa kitaalamu, unaweza pia kutumia API ya upande wa seva.",
        "Interface ina ngazi tatu za interface: Msingi, Advanced, na Professional. Chagua kiwango chako kwa kutumia vichupo kwenye kichwa. Kila kiwango hufungua vipengele vya ziada huku kiolesura kikilenga kile unachohitaji.",
      ],
      bullets: [
        "Msingi: Uundaji rahisi wa msimbo wa QR na maandishi wazi/maudhui ya URL na uwekeleaji wa picha.",
        "Kina: Chaguo za usimbaji wa QR, mitindo ya uwasilishaji, uhuishaji, umbizo la towe, aina za maudhui zilizopanuliwa, na uwekaji mapendeleo wa kuwekelea.",
        "Mtaalamu: Alama za maji, metadata, kushiriki, uchambuzi wa usalama, misimbo ya malipo ya QR na vipengele vya biashara.",
      ],
      links: [{ href: "/?lang=${lang}", label: "Fungua jenereta", type: "generator" }],
    },
    {
      heading: "Anza Haraka",
      paragraphs: ["Ili kuunda msimbo wako wa kwanza wa QR:"],
      bullets: [
        "1. Chagua aina ya maudhui (URL, maandishi, WiFi, n.k.) kutoka kwenye menyu kunjuzi ya Aina ya Maudhui.",
        "2. Ingiza data yako katika sehemu zinazotolewa.",
        "3. Badilisha rangi, mitindo upendavyo, na uongeze picha inayowekelea.",
        "4. Bofya Hamisha ili kupakua msimbo wako wa QR kama PNG, GIF, WebP, au SVG.",
      ],
      links: [
        {
          href: "/?lang=${lang}",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: "Vipengele vya Msingi",
      paragraphs: [
        "Kiwango cha Msingi hutoa kiolesura kilichorahisishwa cha kuunda misimbo ya QR yenye maudhui ya upakiaji na picha zinazowekelewa. Hii ndiyo njia rahisi zaidi ya kuanza.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Aina za Maudhui (Msingi)",
      paragraphs: [
        "Maandishi Matupu: Weka msimbo maandishi yoyote hadi kikomo cha uwezo wa msimbo wa QR. Inafaa kwa ujumbe mfupi, misimbo au vitambulisho.",
        "URL: Encode anwani za wavuti. Msimbo wa QR utafungua URL utakapochanganuliwa. Inaauni http:// na https:// itifaki.",
      ],
    },
    {
      heading: "Uwekeleaji wa Picha (Msingi)",
      paragraphs: [
        "Pakia picha (JPG, PNG, GIF, WebP) ili kuchanganya na msimbo wako wa QR. Vipengele vya msingi vya uwekaji ni pamoja na:",
      ],
      bullets: [
        "Pakia kutoka kwa faili: Chagua picha kutoka kwa kifaa chako.",
        "Pakia kutoka kwa URL: Weka URL ya picha (lazima iruhusu CORS).",
        "Nembo ya Kituo: Huweka picha katikati, ikitegemea urekebishaji wa makosa.",
        "Mchanganyiko: Mchanganyiko rahisi wa alfa wa picha na muundo wa QR.",
        "Kiwango: Hudhibiti jinsi wekeleaji unavyoathiri kwa nguvu msimbo wa QR (0-100%).",
        "Hali ya Rangi: Rangi Kamili, Kijivu, au Nyeusi na Nyeupe.",
        "Hifadhi Miundo ya Kitafutaji: Huweka ruwaza za pembeni bila kubadilishwa kwa uchanganuzi unaotegemewa.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic#overlay",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: "Vipengele vya Juu",
      paragraphs: [
        "Kiwango cha Juu hufungua chaguo za usimbaji wa QR, mitindo ya uwasilishaji, uhuishaji, umbizo la towe, aina za maudhui zilizopanuliwa na uwekaji mapendeleo wa juu zaidi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Mipangilio ya Usimbaji wa QR",
      paragraphs: [
        "Toleo: Misimbo ya QR huja katika matoleo ya 1-40, na matoleo ya juu yanashikilia data zaidi lakini kuwa kubwa zaidi. Weka 0 (Otomatiki) ili kuruhusu ANQR kuchagua toleo dogo zaidi linalolingana na maudhui yako.",
        "Marekebisho ya Hitilafu: Huamua ni uharibifu kiasi gani wa msimbo wa QR unaweza kuendeleza huku ukiendelea kuchanganuliwa.",
      ],
      bullets: [
        "L (Chini): 7% ya marekebisho ya makosa - ukubwa mdogo, upungufu mdogo.",
        "M (Kati): 15% ya kurekebisha makosa - chaguo la usawa.",
        "Q (Quartile): 25% ya kusahihisha makosa - nzuri kwa misimbo iliyochapishwa.",
        "H (Juu): 30% ya urekebishaji makosa - bora zaidi kwa misimbo iliyo na viwekeleo au katika hali ngumu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#qr-encoding",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Eneo tulivu (Pembezoni)",
      paragraphs: [
        "Eneo tulivu ni nafasi nyeupe karibu na msimbo wa QR. Vichanganuzi vinahitaji ukingo huu ili kutambua mahali msimbo unapoanzia. Kiwango kinapendekeza angalau moduli 4. Kupunguza chini ya 4 kunaweza kusababisha matatizo ya kuchanganua.",
      ],
    },
    {
      heading: "Mtindo wa Moduli",
      paragraphs: ["Moduli ni miraba mahususi inayounda msimbo wa QR. ANQR inatoa mitindo mitano:"],
      bullets: [
        "Mraba: Mwonekano wa classic wa QR na pembe kali.",
        "Mviringo: Kona zilizolainishwa kwa mwonekano mzuri zaidi.",
        "Dots: moduli za mviringo za urembo wa kisasa.",
        "Almasi: miraba iliyozungushwa 45° kwa muundo tofauti.",
        "Imeunganishwa: Moduli huunganishwa zikiwa karibu, na kuunda maumbo ya kikaboni.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Mtindo wa Muundo wa Mpataji",
      paragraphs: [
        "Miundo ya kitafutaji ni miraba mitatu mikubwa katika pembe za QR inayosaidia vichanganuzi kuelekeza msimbo. Mitindo inayopatikana:",
      ],
      bullets: [
        "Mraba: Pembe za mraba za kawaida.",
        "Mviringo: Pembe laini zinazolingana na mtindo wa moduli ya mviringo.",
        "Mduara: Miundo ya kitafutaji cha duara ya misimbo ya mtindo wa nukta.",
      ],
    },
    {
      heading: "Mipangilio ya Mipangilio na Muda",
      paragraphs: [
        "Mipangilio ya upangaji huonekana katika misimbo mikubwa ya QR (toleo la 2+) ili kusaidia kurekebisha upotoshaji. Mipangilio ya saa ni mistari inayopishana inayounganisha mifumo ya kitafutaji.",
      ],
      bullets: [
        "Mtindo wa Kulinganisha: Kitafuta Mechi, Mraba, Mviringo, au Mduara.",
        "Mtindo wa Muda: Moduli ya Mechi, Imara, au Iliyoshuka.",
      ],
    },
    {
      heading: "Rangi",
      paragraphs: [
        "Mandhari ya mbele: Rangi ya moduli za QR. Nyeusi (#000000) ni ya kawaida lakini rangi yoyote nyeusi inafanya kazi.",
        "Mandharinyuma: Rangi ya usuli. Nyeupe (#ffffff) ni ya kawaida. Hakikisha utofautishaji wa kutosha na mandhari ya mbele.",
        "Mandharinyuma yenye Uwazi: Ondoa mandharinyuma kabisa kwa matumizi kwenye nyuso zenye rangi. Hakikisha uso unatoa utofautishaji wa kutosha.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Ukubwa wa Moduli & Pengo",
      paragraphs: [
        "Ukubwa wa Moduli: Hudhibiti ukubwa wa kila sehemu inayotolewa kwa saizi. Thamani kubwa huunda misimbo mikubwa na rahisi kuchanganua.",
        "Pengo la Moduli: Huongeza nafasi kati ya moduli kama asilimia. Mapengo madogo (5-15%) yanaweza kuboresha uwezo wa kuchanganua katika hali fulani lakini mapengo mengi yanapunguza kutegemewa.",
      ],
    },
    {
      heading: "Mipangilio ya Pato",
      paragraphs: ["Umbizo: Chagua umbizo lako la kuhamisha kulingana na hali ya utumiaji."],
      bullets: [
        "PNG: Umbizo la raster isiyo na hasara, bora kwa matumizi mengi. Bora kwa kuchapishwa na dijitali.",
        "WebP: Umbizo la kisasa na saizi ndogo za faili. Nzuri kwa matumizi ya wavuti.",
        "GIF: Inahitajika kwa misimbo ya QR iliyohuishwa. Inasaidia uwazi.",
        "SVG: Umbizo la Vekta ambalo hupimwa bila kikomo. Bora kwa chapa kubwa au unapohitaji kuhariri msimbo.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-3",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    {
      heading: "Vipimo vya Pato",
      paragraphs: [
        "Upana/Urefu: Weka saizi ya towe katika pikseli. Kwa uchapishaji, hesabu kulingana na DPI (k.m., DPI 300 katika inchi 1 = 300px). Saizi kubwa huchanganua kwa uhakika zaidi kwa umbali.",
      ],
    },
    {
      heading: "Mipangilio ya Uhuishaji (Ya Juu)",
      paragraphs: ["Dhibiti tabia iliyohuishwa ya msimbo wa QR:"],
      bullets: [
        "Kasi: Kasi ya picha ya uhuishaji katika milisekunde.",
        "Kitanzi: Uhuishaji unaoendelea au wa kucheza mchezo mmoja.",
        "Bounce: Mwelekeo wa uhuishaji wa Ping-pong.",
        "Anza Fremu: Anza uhuishaji kutoka kwa fremu mahususi.",
        "Upeo wa Fremu: Weka kikomo jumla ya fremu katika uhuishaji.",
        "Hatua ya Fremu: Ruka viunzi kwa uhuishaji wa haraka zaidi.",
        "Ufafanuzi: Hakuna, Crossfade, au Morph kati ya fremu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    {
      heading: "Aina za Maudhui (Ya Juu)",
      paragraphs: ["Kiwango cha juu hufungua fomati za ziada za upakiaji:"],
      bullets: [
        "Nambari ya Simu (tel:): Hutengeneza kiungo cha simu kinachoweza kupigiwa simu.",
        "Barua pepe (mailto:): Hufungua kiteja cha barua pepe chenye mada na mwili wa hiari.",
        "SMS: Ujumbe wa maandishi uliojazwa awali kwa nambari ya simu.",
        "vCard: Kadi kamili ya mawasiliano yenye jina, shirika, simu, barua pepe, anwani.",
        "MeCard: Umbizo la mwasiliani Shikamana maarufu nchini Japani.",
        "BizCard: Umbizo la urithi wa kadi ya biashara.",
        "Mahali pa Geo: Viwianishi vya GPS vinavyofunguliwa kwenye ramani.",
        "WiFi: Vitambulisho vya mtandao kwa muunganisho otomatiki (SSID, nenosiri, aina ya usalama).",
        "Tukio la Kalenda: Umbizo la iCalendar na kichwa, eneo, tarehe/saa.",
        "RSVP ya Tukio: Unganisha kwa ukurasa wa usajili wa tukio.",
        "Jisajili kwenye Kalenda: Jiandikishe kwa mpasho wa ICS/WebCal.",
        "URL ya Faili/Hati: Kiungo cha moja kwa moja cha faili zinazoweza kupakuliwa.",
        "Kiungo cha Hifadhi ya Wingu: Viungo vya Hifadhi ya Google, Dropbox, OneDrive, nk.",
        "Wasifu wa Kijamii: Viungo vya LinkedIn, Twitter, Instagram, n.k.",
        "Kiungo cha Kutuma Ujumbe: WhatsApp, Telegramu, Viungo vya kina vya Mawimbi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Vipengele vya Juu vya Uwekeleaji",
      paragraphs: ["Uwezo wa ziada wa kuwekelea:"],
      bullets: [
        "Punguza: Washa upunguzaji ili kuchagua eneo la mraba la picha yako.",
        "Nusu: Mchoro wa nukta wa mtindo wa kawaida wa kuchapisha kulingana na mwangaza wa picha.",
        "Dithered: Usambazaji wa hitilafu kwa ajili ya uzazi wa kina.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#overlay",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Njia za Mchanganyiko wa Uwekeleaji (Wa Juu)",
      paragraphs: ["Njia za ziada za mchanganyiko katika Kiwango cha Juu:"],
      bullets: [
        "Pikseli ndogo: Inagawanya kila sehemu katika pikseli ndogo kwa maelezo ya juu zaidi.",
        "Kelele ya Bluu: Hutumia upunguzaji wa kelele ya samawati kwa mifumo isiyo na vizalia vya programu.",
        "Musa: Athari ya vigae inayohifadhi muundo wa picha.",
        "Jaza Pengo: Huweka picha katika mapengo kati ya moduli.",
        "Mwangaza: Hubadilisha ukubwa wa moduli kulingana na mwangaza wa picha.",
        "Duotone: Picha ya Ramani ya rangi mbili kwa utofautishaji wa kuvutia.",
      ],
    },
    {
      heading: "Ukali wa Kufunika",
      paragraphs: [
        "Hudhibiti jinsi uwekeleaji unavyoathiri kwa nguvu msimbo wa QR (0-100%). Thamani za juu zinaonyesha maelezo zaidi ya picha lakini zinaweza kupunguza uchanganuzi. Anza karibu 70% na urekebishe kulingana na majaribio.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    {
      heading: "Hali ya Rangi",
      paragraphs: ["Jinsi picha inayowekelea inachakatwa:"],
      bullets: [
        "Rangi Kamili: Huhifadhi rangi asili za picha.",
        "Kijivu: Hubadilika kuwa tani nyeusi na nyeupe.",
        "Nyeusi na Nyeupe: Ubadilishaji wa binary wa utofautishaji wa juu.",
      ],
    },
    {
      heading: "Hifadhi Miundo ya Kitafuta",
      paragraphs: [
        "Inapowashwa, huweka ruwaza tatu za kitafuta pembe bila kurekebishwa na wekeleo. Inapendekezwa sana kwa skanning ya kuaminika.",
      ],
    },
    {
      heading: "Uchakataji wa Picha",
      paragraphs: [
        "Tumia vichujio kwenye picha yako iliyowekelewa kabla ya kuichanganya. Marekebisho haya yanaweza kuboresha jinsi picha inavyoonekana katika msimbo wa mwisho wa QR.",
      ],
      bullets: [
        "Mwangaza (-100 hadi +100): Ing'arisha au fanya picha iwe nyeusi.",
        "Tofauti (-100 hadi +100): Ongeza au punguza masafa ya toni.",
        "Gamma (0.2 hadi 3.0): Marekebisho ya mwangaza yasiyo ya mstari. Thamani zilizo chini ya 1 hupunguza toni za kati, zaidi ya 1 huzifanya kuwa nyeusi.",
        "Kueneza (-100 hadi +100): Nguvu ya rangi. -100 ni rangi ya kijivu, +100 imejaa kupita kiasi.",
        "Zungusha Hue (0-360°): Hamisha rangi zote kwenye gurudumu la rangi.",
        "Ukungu (0-20px): Lainisha maelezo ya picha.",
        "Piga makali (0-100%): Boresha kingo na maelezo.",
        "Posterize (viwango 0-16): Punguza viwango vya rangi kwa athari ya bango.",
        "Kizingiti (0-255): Badilisha hadi nyeusi/nyeupe jozi katika sehemu ya kukata.",
        "Utambuzi wa Kingo: Algoriti za Sobel au Canny ili kuonyesha kingo pekee.",
        "Geuza: Badilisha rangi zote.",
      ],
    },
    {
      heading: "Hali ya Fit",
      paragraphs: ["Jinsi picha inayowekelea inavyolingana na eneo la msimbo wa QR:"],
      bullets: [
        "Jalada: Picha hujaza eneo lote, ikipunguza ikiwa inahitajika.",
        "Inayo: Picha nzima inaonekana, inaweza kuwa na pambizo.",
        "Nyosha: Picha inapotosha ili kujaza haswa.",
      ],
    },
    {
      heading: "Chaguzi za Kubadilisha",
      paragraphs: [
        "Mzunguko: Zungusha kuwekelea katika nyongeza za 90°.",
        "Geuza X/Y: Onyesha picha kwa mlalo au wima.",
      ],
    },
    {
      heading: "Dithering algorithms",
      paragraphs: [
        "Dithering hubadilisha picha za sauti-mwezi hadi ruwaza ambazo misimbo ya QR inaweza kuwakilisha. Inapatikana unapotumia njia za mchanganyiko za Dithered, Blue Noise, au True Dither.",
      ],
      bullets: [
        "Usambazaji wa Hitilafu: Mtindo wa Kawaida wa Floyd-Steinberg. Hueneza hitilafu ya quantization kwa pikseli jirani.",
        "Iliyoagizwa (Bayer): Hutumia matrix ya kizingiti kwa mifumo ya kawaida.",
        "Kitone Kilichounganishwa: Huiga uchapishaji wa halftone.",
        "Utupu & Nguzo: Uboreshaji ulioagizwa wa kugawanya.",
        "Kelele ya Bluu: Mchoro unaoonekana bila mpangilio unaoonekana.",
        "Kizingiti cha Kelele ya Bluu: Kupunguza kizingiti kwa muundo wa kelele ya bluu.",
        "Kelele Nyeupe: Kupunguza kizingiti bila mpangilio.",
        "Kelele ya Gaussian/Triangular: Kelele zenye migawanyo tofauti.",
        "Kelele ya Bluu + Usambazaji wa Hitilafu: Mseto unaochanganya mbinu zote mbili.",
        "Kelele ya Bluu Iliyochunguzwa: Mchoro wa kelele wa buluu unaofanana na skrini.",
        "Mtazamo: Mwangaza-uzani kwa matokeo bora ya kuona.",
        "Edge-Aware: Huhifadhi kingo za picha wakati wa kugawanyika.",
        "Kizingiti Kinachobadilika: Kizingiti kinachobadilika ndani ya nchi.",
        "Kelele ya Muda ya Bluu: Kwa GIF zilizohuishwa, muundo hutofautiana kwa kila fremu.",
      ],
    },
    {
      heading: "Kernels za Usambazaji",
      paragraphs: ["Unapotumia Usambazaji wa Kosa, chagua jinsi kosa linasambazwa:"],
      bullets: [
        "Floyd-Steinberg: Usambazaji wa majirani 4 wa kawaida. Chaguo nzuri kwa ujumla.",
        "Jarvis-Judice-Ninke: 12-jirani, laini lakini polepole.",
        "Stucki: Sawa na JJN yenye uzani tofauti.",
        "Burkes: JJN iliyorahisishwa, haraka zaidi.",
        "Sierra: Familia ya punje kusawazisha ubora na kasi.",
        "Atkinson: Usambazaji mwepesi, huhifadhi maelezo lakini inaweza kuwa na chembechembe.",
      ],
    },
    {
      heading: "Nguvu ya Dither",
      paragraphs: [
        "Hudhibiti ni kiasi gani cha dithering kinatumika (0-100%). Thamani za chini huhifadhi zaidi muundo asilia, zile za juu zinaonyesha maelezo zaidi ya picha.",
      ],
    },
    {
      heading: "Mipangilio ya Pikseli ndogo",
      paragraphs: ["Unapotumia modi ya mchanganyiko wa Subpixel:"],
      bullets: [
        "Ukubwa wa Gridi: 2×2, 3×3, au pikseli ndogo 4×4 kwa kila moduli. Juu = maelezo zaidi.",
        "Sheria ya Kati: Madhubuti inahitaji pikseli ndogo ya katikati ili kuendana na sehemu. Kituo cha Halftone kinaruhusu utofauti.",
        "Rangi Isiyofungamana: Rangi inayotumika kwa pikseli ndogo ambazo hazijabainishwa.",
        "Ubatilishaji wa Kitafutaji: Jinsi miundo ya vipataji inavyotolewa (Imara au Mitindo).",
      ],
    },
    {
      heading: "Mipangilio ya Nusu",
      paragraphs: ["Unapotumia hali ya mchanganyiko wa Halftone:"],
      bullets: [
        "Ukubwa wa Kiini: Kwa Kila Moduli au gridi ya N×N.",
        "Umbo la Nukta: Mduara, Mraba, au Mstari.",
        "Mviringo wa Mwangaza: Linear, S-Curve, au Gamma.",
      ],
    },
    {
      heading: "Rangi za Duotone",
      paragraphs: [
        "Unapotumia hali ya kuchanganya ya Duotone, weka rangi ya Kivuli (maeneo meusi) na Angazia (maeneo angavu).",
      ],
    },
    {
      heading: "Mipangilio ya Uhuishaji wa GIF",
      paragraphs: ["Unapotumia viwekeleo vya GIF vilivyohuishwa:"],
      bullets: [
        "Tumia Ucheleweshaji wa Fremu: Heshimu muda asilia wa GIF.",
        "Upeo wa FPS: Punguza kasi ya fremu (ramprogrammen 1-60).",
        "Ushughulikiaji wa Utupaji: Heshimu au Rahisisha njia za utupaji wa fremu.",
      ],
    },
    {
      heading: "Chaguzi za Utoaji wa hali ya juu",
      paragraphs: ["Vidhibiti vya ziada vya uwasilishaji:"],
      bullets: [
        "Hali ya Pengo: Hakuna, Kilichowekwa, Kiharusi, au Mtindo wa nafasi hasi.",
        "Upenyo wa Pembe: Asilimia ya pembe za mviringo kwa moduli.",
        "Gradient: Hakuna, Linear, Radial, au Conic gradient kwenye moduli.",
        "Mtindo wa Macho ya Nje/Ndani: Mitindo ya kujitegemea ya pete za muundo wa kitafutaji.",
        "Mzunguko wa nukta: Zungusha moduli za almasi/nukta.",
        "Kiwango cha Macho: Marekebisho ya saizi kwa mifumo ya kipataji.",
        "Mtindo wa Fremu: Ongeza viunzi vya mapambo (Fremu Iliyozunguka, Kibandiko, Lebo).",
        'Maandishi ya Fremu: Ongeza maandishi kama "Scan Me!" kwa muafaka.',
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Usimbaji wa Kina wa QR",
      paragraphs: ["Rekebisha usimbaji wa QR:"],
      bullets: [
        "Hali ya Usimbaji: Otomatiki, Nambari, Alphanumeric, Byte/UTF-8, au Kanji.",
        "Tekeleza eneo la Min Quiet: Hakikisha angalau ukingo wa moduli 4.",
        "Mchoro wa Mask: Otomatiki (bora zaidi), au chagua mwenyewe ruwaza 0-7 ili kudhibiti usambazaji wa moduli. Miundo tofauti huunda mwonekano tofauti huku ikisimba data sawa.",
        "Usimbaji wa Herufi: ISO-8859-1 (chaguo-msingi ya Kilatini-1), UTF-8 (Aunicode kamili ikijumuisha emoji), au Shift-JIS (Kijapani). Chagua kulingana na mahitaji ya tabia ya maudhui yako.",
      ],
    },
    {
      heading: "Chaguzi za Pato za Juu",
      paragraphs: ["Mipangilio ya ziada ya kuhamisha:"],
      bullets: [
        "Jina la faili: Jina la faili maalum kwa vipakuliwa.",
        "Ukubwa wa Paleti ya GIF: rangi 2-256 katika pato la GIF.",
        "Kikadiriaji cha GIF: Kata ya Wastani, NeuQuant, au kupunguza rangi ya Octree.",
        "GIF Dithering: Imezimwa, Floyd-Steinberg, au Imeagizwa.",
        "Rangi ya Uwazi ya GIF: Weka rangi iwe wazi.",
        "Vekta ya Kweli ya SVG: Tumia njia badala ya raster iliyopachikwa.",
        "Usahihi wa Umbo la SVG: Uonyeshaji wa Pixel au Njia Sahihi.",
        "SVG Pachika Uwekeleaji wa Raster: Jumuisha uwekeleaji kama picha iliyopachikwa.",
        "Ubatilishaji wa Mandharinyuma: Lazimisha rangi mahususi ya usuli katika pato.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Chaguzi za Uthibitishaji",
      paragraphs: ["Mipangilio ya usindikaji wa ingizo:"],
      bullets: [
        "Thibitisha Ingizo: Angalia umbizo la maudhui kabla ya kusimba.",
        "Punguza Nafasi Nyeupe: Ondoa nafasi zinazoongoza/zinazofuata.",
        "Rekebisha Mistari Mpya: Badilisha miisho yote ya laini kuwa LF.",
        "Kilinda Urefu wa Juu: Onya ikiwa maudhui yanazidi uwezo wa QR.",
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: "Sifa za Kitaalamu",
      paragraphs: [
        "Kiwango cha Utaalam huongeza alama za maji, metadata, chaguo za kushiriki, uchambuzi wa usalama, misimbo ya malipo ya QR na vipengele vya biashara.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Alama ya maji",
      paragraphs: ["Ongeza alama kwenye misimbo yako ya QR:"],
      bullets: [
        "Aina: Maandishi, Picha, au Alama ya muundo.",
        "Nafasi: Katikati, Pembe, Kingo, Nyuma, au Eneo tulivu.",
        "Opacity: Uwazi wa Watermark (0-100%).",
        "Hali ya Mchanganyiko: Kawaida, Kuzidisha, Skrini, au Mchanganyiko wa Uwekeleaji.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#watermark",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Metadata",
      paragraphs: ["Pachika metadata katika faili zilizosafirishwa:"],
      bullets: [
        "Kichwa, Mwandishi, Hakimiliki, Leseni, Sehemu za Maelezo.",
        "Wakati wa Uundaji: Pachika muhuri wa wakati wa kizazi.",
        "Thamani Maalum ya Ufunguo: Ongeza jozi za metadata kiholela.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#metadata",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Kushiriki",
      paragraphs: ["Shiriki usanidi wako wa msimbo wa QR:"],
      bullets: [
        "Kiungo cha Moja kwa Moja: Tengeneza URL inayoweza kushirikiwa na mipangilio yako ya sasa.",
        "Pachika HTML: Pata msimbo wa kupachika wa tovuti.",
        "Sanidi Vigezo: Jumuisha mipangilio yote kwenye URL ya kushiriki.",
        "Kumbuka: Picha zinazowekelewa kutoka kwa faili za karibu haziwezi kushirikiwa kupitia URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-7",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    {
      heading: "Uchambuzi wa Usalama",
      paragraphs: ["Hakikisha misimbo ya QR inasalia kuchanganuliwa:"],
      bullets: [
        "Hali ya Usalama: Mahitaji ya Kimezimwa, Yaliyosawazishwa au Madhubuti ya kuchanganua.",
        "Ukubwa wa Moduli ya Chini: Kiwango cha chini cha saizi ya pikseli kwa kila moduli.",
        "Eneo tulivu la Kidogo: Kima cha chini cha moduli za ukingo.",
        "Vipataji vya Kufungia/Muda/Pangilia/Muundo/Toleo: Linda vipengele mahususi.",
        "Kiwango cha Juu cha Uwekeleaji kulingana na ECC: Vikomo vya ukubwa wa kiotomatiki kulingana na kiwango cha kurekebisha makosa.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#safety",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    {
      heading: "Aina za Maudhui (Mtaalamu)",
      paragraphs: ["Kiwango cha kitaaluma huongeza malipo na aina za maudhui ya biashara:"],
      bullets: [
        "EPC/SEPA (EU): Misimbo ya QR ya uhamisho wa benki ya Ulaya yenye IBAN, BIC, kiasi, marejeleo.",
        "UPI (India): Kiolesura cha Pamoja cha Malipo na VPA, jina la mlipwaji, kiasi.",
        "PayNow (Singapore): Malipo ya haraka ya Singapore kwa kutumia UEN au nambari ya simu.",
        "PromptPay (Thailand): Mfumo wa malipo wa kitaifa wa Thai.",
        "PIX (Brazili): Malipo ya papo hapo ya Brazili kwa kutumia ufunguo wa PIX.",
        "Crypto: Bitcoin, Ethereum, Litecoin anwani za malipo na kiasi cha hiari.",
        "Kiungo cha Kampeni ya Uuzaji: URL zilizo na kigezo kamili cha UTM (Lebo za Uuzaji) ufuatiliaji.",
        "Kiungo Kifupi: Kwa matumizi na vifupisho vya URL kwa misimbo ya QR inayobadilika/inayoweza kufuatiliwa.",
        "Kiungo Dijitali cha GS1: Kitambulisho cha bidhaa na GTIN, mfululizo, kundi, kuisha muda wake.",
        "Kiungo cha Kina cha Programu: Viungo vya kina vya programu ya iOS/Android na mipango maalum.",
        "Umbizo Maalum: Data ghafi isiyo na umbizo au uthibitishaji.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-2",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: "Malipo Yanayohusiana na Lugha katika Hali ya Kina",
      paragraphs: [
        "Unapotumia Hali ya Kina, ANQR huonyesha kiotomatiki mbinu za malipo zinazohusiana na lugha uliyochagua. Kwa mfano, watumiaji wa Kivietinamu huona VietQR, watumiaji wa Thai wanaona PromptPay, na watumiaji wa lugha ya Kihindi wanaona UPI na BharatQR. Mbinu za malipo za kimataifa (cryptocurrency, PayPal, Cash App) zinapatikana kwa lugha zote. Hali ya kitaaluma hufungua viwango vyote vya malipo bila kujali lugha.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Viwango vya Malipo vya Ulaya",
      bullets: [
        "EPC/SEPA (EU): Misimbo ya QR ya uhamisho wa benki ya Ulaya kwa kufuata Kiwango cha EPC QR Code. Inaauni IBAN, BIC (si lazima iwe ya ndani), kiasi katika EUR, na marejeleo ya malipo yaliyopangwa au yasiyo na muundo. Inatumika kote katika ukanda wa SEPA ikijumuisha nchi za EU pamoja na Uswizi, Norwei, Aisilandi, Liechtenstein, Monaco na San Marino.",
        "Bili ya QR ya Uswizi: Kiwango cha malipo cha Uswizi kinachofuata Miongozo SITA ya Utekelezaji. Inaauni CHF na EUR, QR-Reference (QRR), Rejea ya Mdai (ISO 11649), anwani za mdai/mdaiwa na maelezo ya bili. Inahitajika kwa ankara za Uswizi tangu 2022.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Viwango vya Malipo vya India",
      bullets: [
        "UPI (India): Kiolesura cha Pamoja cha Malipo kinachofuata Viainisho vya Kiunga cha NPCI. Inaauni VPA (Anwani ya Malipo Halisi), jina la mlipwaji, kiasi katika INR, noti ya miamala, kitambulisho cha marejeleo, msimbo wa aina ya muuzaji na hali ya muamala.",
        "BharatQR (India): Kiwango kilichounganishwa cha QR kinachosaidia malipo ya UPI na kadi. Inachanganya UPI VPA na PAN ya kadi kwa utangamano wa juu zaidi. Inajumuisha jina la mfanyabiashara, jiji, MCC, maelezo ya GST na nambari za ankara/marejeleo.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Viwango vya Malipo vya Kusini Mashariki mwa Asia",
      bullets: [
        "PayNow (Singapore): Mfumo wa malipo wa haraka wa Singapore kwa kutumia vipimo vya EMVCo QR na wasifu wa SGQR. Inaauni UEN (usajili wa biashara), nambari ya simu, au NRIC kama vitambulishi vya seva mbadala. Inajumuisha bendera ya kiasi cha uhariri na tarehe ya mwisho wa matumizi.",
        "PromptPay (Thailand): Mfumo wa malipo wa kitaifa wa Thailand unaofuata wasifu wa EMV wa Benki Kuu ya Thailand. Inaauni nambari ya simu, kitambulisho cha kitaifa, kitambulisho cha ushuru, kitambulisho cha pochi ya kielektroniki na malipo ya bili yenye sehemu nyingi za marejeleo.",
        "QRIS (Indonesia): Msimbo wa Majibu ya Haraka Kiwango cha Kiindonesia. Kiwango cha kitaifa cha malipo cha EMV kinachosaidia kitambulisho cha mfanyabiashara, NMID (Kitambulisho cha Kitaifa cha Muuzaji), uainishaji wa vigezo vya mfanyabiashara na ada za urahisishaji (zilizowekwa au asilimia).",
        "DuitNow (Malaysia): Mfumo wa malipo wa papo hapo wa Malaysia. Inaauni aina nyingi za seva mbadala ikijumuisha NRIC, rununu, pasipoti, kitambulisho cha jeshi na nambari za usajili wa biashara.",
        "VietQR (Vietnam): Kiwango cha uhamisho wa benki kati ya Kivietinamu. Inahitaji BIN ya benki (kitambulisho cha NAPAS) na nambari ya akaunti. Inaauni misimbo ya huduma nyingi kwa aina tofauti za uhamishaji (QRPUSH, QRIBFTTA, QRIBFTTC).",
        "QR Ph (Ufilipino): Kiwango cha malipo cha QR cha Ufilipino kwa InstaPay na PESONet. Hutumia nambari za akaunti zilizo na kitambulisho cha mfanyabiashara kwa miamala ya P2M (mtu-kwa-muuzaji).",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Viwango vya Malipo vya Asia Mashariki",
      bullets: [
        "TWQR (Taiwan): Kiwango cha malipo cha QR ya Taiwan. Inaauni kitambulisho cha mfanyabiashara, kitambulisho cha kodi, na kiasi cha TWD.",
        "HKQR/FPS (Hong Kong): Misimbo ya QR ya Mfumo wa Malipo ya Haraka wa Hong Kong. Inaauni kitambulisho cha FPS, nambari ya simu ya mkononi, au barua pepe kama vitambulisho vya malipo. Kiasi katika HKD.",
        "JPQR (Japani): Kiwango cha malipo cha msimbo wa QR uliounganishwa wa Japani. Hutumia kitambulisho cha duka kwa utambulisho wa mfanyabiashara wenye kiasi cha JPY.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Viwango Vingine vya Malipo vya Kanda",
      bullets: [
        "PIX (Brazili): Mfumo wa malipo wa papo hapo wa Benki Kuu ya Brazili unaofuata vipimo vya Msimbo wa BR. Inaauni vitufe vya PIX (CPF, CNPJ, barua pepe, simu, au ufunguo wa nasibu), jina/mji wa mfanyabiashara, kitambulisho cha muamala na kiasi cha BRL.",
        "AusPayNet/NPP PayID (Australia): Mfumo wa PayID wa Mfumo wa Malipo Mpya wa Australia. Inaauni aina za PayID (barua pepe, simu ya mkononi, ABN, kitambulisho cha shirika) au nambari ya kawaida ya akaunti ya BSB +. Jina la muuzaji ni la hiari kwani walipaji wanaona jina lililosajiliwa kutoka kwa ukaguzi wa NPP.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Malipo ya Cryptocurrency",
      bullets: [
        "Bitcoin/Litecoin (BIP-21): URI za kawaida za malipo ya cryptocurrency zenye anwani ya pochi, kiasi cha hiari na lebo. Inapatana na pochi zote kuu za Bitcoin na Litecoin.",
        "Mtandao wa Umeme (BOLT11): Ankara za malipo za Mtandao wa Umeme. Bandika mfuatano wa ankara uliosimbwa wa BOLT11 kwa malipo ya Bitcoin ya papo hapo na ada ndogo.",
        "Ethereum (EIP-681): URI za malipo ya Ethereum zinazotumia uhamisho wa asili wa ETH na uhamisho wa tokeni za ERC-20. Inajumuisha kitambulisho cha mnyororo kwa usaidizi wa mitandao mingi (Mainnet, Polygon, BSC, Arbitrum, Optimism, Banguko), vigezo vya gesi na simu za kazi za mikataba.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Huduma za Kiungo cha Malipo",
      bullets: [
        "PayPal.Me: Viungo vya malipo vya PayPal vilivyo na jina la mtumiaji na kiasi cha hiari kilichojazwa awali. Wapokeaji wanaweza kulipa kupitia salio la PayPal, kadi au akaunti za benki.",
        "Programu ya Pesa: Viungo vya malipo ya Programu ya Pesa kwa kutumia $cashtag na kiasi cha hiari. Maarufu nchini Marekani kwa malipo ya kati-kwa-rika.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Jenerali EMV QR",
      bullets: [
        "EMV Jenerali: Unda misimbo maalum ya Hali Iliyowasilishwa ya EMV ya Hali ya Wafanyabiashara kwa ajili ya mipango ya malipo ambayo haijaorodheshwa mahususi. Sanidi jina la muuzaji, jiji, msimbo wa nchi (ISO 3166-1), msimbo wa sarafu (ISO 4217 numeric), MCC, chaguo za ada ya kidokezo/urahisi na sehemu za ziada za data. Inafaa kwa majaribio au miunganisho maalum.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: "Njia za Mchanganyiko wa Uwekeleaji (Kitaalamu)",
      paragraphs: ["Njia za ziada za mchanganyiko katika kiwango cha Utaalam:"],
      bullets: [
        "Pixelate: Athari ya kuwekelea yenye pixel.",
        "Muhtasari: Uwekeleaji wa ugunduzi wa ukingo unaoonyesha mtaro pekee.",
        "Wimbi: Athari ya upotoshaji wa wavy.",
        "Ukubwa wa Pikseli ndogo: Saizi ya pikseli ndogo inayobadilika kulingana na picha.",
        "Dither ya Kweli: Utaftaji wa hali ya juu na uteuzi wa matrix ulioamuru.",
        "Uliokithiri: Upeo wa mwonekano wa picha, unaweza kuathiri uchanganuzi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Mipangilio ya Ulinzi",
      paragraphs: [
        "Udhibiti mzuri ambao vipengele vya QR vinalindwa dhidi ya urekebishaji wa kuwekelea:",
      ],
      bullets: [
        "Hifadhi Muda: Weka mifumo ya saa bila kubadilishwa.",
        "Hifadhi Mpangilio: Weka ruwaza za upatanishi bila kubadilishwa.",
        "Linda Maelezo ya Umbizo: Moduli za habari za umbizo la Shield.",
        "Linda Maelezo ya Toleo: Moduli za taarifa za toleo la Shield.",
      ],
    },
    {
      heading: "ECC-Aware Mode",
      paragraphs: [
        "Husambaza kwa akili ukubwa wa kiwekeleo kulingana na uwezo wa kurekebisha makosa. Mfumo huchanganua ni moduli zipi zinaweza kurekebishwa huku ukidumisha uchanganuzi.",
      ],
      bullets: [
        "Bajeti ya Hatari: Asilimia ya uwezo wa kurekebisha makosa ya kutumia (0-100%).",
        "Bajeti ya juu = wekeleaji unaoonekana zaidi lakini uchanganuzi hatari zaidi.",
        "Bajeti ya chini = utambazaji salama lakini uwekeleaji mdogo sana.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Chaguzi za Utoaji wa Kitaalamu",
      paragraphs: ["Udhibiti wa hali ya juu wa uwasilishaji:"],
      bullets: [
        "Kingo Nyepesi: Tumia uonyeshaji wa picha ya pixelated kwa kingo za moduli kali.",
        "Pixel Snap: Mpangilio wa Sakafu, Mviringo, au Saini.",
        "Hali ya Rangi kwa Kila-Moduli: Imara, Kwa Kung'aa, Kwa Msimamo, Kwa Kuwekelea, Kwa Kundi.",
        "Paleti ya Rangi: Bainisha palette ya rangi maalum kwa kila moduli kupaka rangi.",
        "Kilinzi cha Tofauti: Hakikisha uwiano wa chini kabisa wa utofautishaji kati ya rangi.",
        "Uwiano wa Kidogo wa Utofautishaji: Sharti la utofautishaji wa mtindo wa WCAG (1:1 hadi 21:1).",
        "Moduli za Ziada za Mpaka: Mpaka wa ziada zaidi ya eneo tulivu.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#render",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Chaguzi za Pato la Kitaalam",
      paragraphs: ["Mipangilio ya usafirishaji wa biashara:"],
      bullets: [
        "DPI: Weka azimio la uchapishaji (72-600 DPI). DPI 300 zinazopendekezwa kuchapishwa.",
        "Jumuisha Eneo tulivu: Geuza eneo tulivu katika vipimo vya matokeo.",
        "Hamisha Kama Ziada: Tengeneza PDF pamoja na umbizo msingi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#output",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Mipangilio ya Uhuishaji (Kitaalamu)",
      paragraphs: ["Vipengele vya ziada vya uhuishaji wa kitaalamu:"],
      bullets: [
        "Dither ya Muda: Imezimwa, Sauti ya Bluu, au Flicker Safe kwa kila fremu kugeuza.",
        "Mchoro: Hakuna, Pulse, Wimbi, Scanline, Shimmer, au athari za Drift.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#animation",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: "Rejea ya API",
      paragraphs: [
        "ANQR hutoa API ya upande wa seva kwa kutengeneza misimbo ya QR kupitia vigezo vya URL. Hii ni bora kwa kupachika misimbo ya QR katika tovuti, barua pepe, hati, au utiririshaji wa kiotomatiki bila JavaScript ya upande wa mteja.",
        "URL ya msingi: https://anqr.link/api/qr",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Tazama mifano ya QR", type: "example" }],
    },
    {
      heading: "Vigezo vya Msingi",
      paragraphs: ["Vigezo vinavyohitajika na vya kawaida (majina ya parameta hayajatafsiriwa):"],
      bullets: [
        "data (inahitajika): Maudhui ya kusimba katika msimbo wa QR. URL-simba herufi maalum.",
        "saizi: Ukubwa wa picha katika saizi (chaguo-msingi: 400, max: 2000). Inatumika ikiwa w/h haijabainishwa.",
        "w, h: Upana wa pato na urefu katika saizi. Inabatilisha kigezo cha ukubwa.",
        "umbizo: Umbizo la pato - png, webp, au gif (chaguo-msingi: png).",
        "ec: Kiwango cha kurekebisha hitilafu - L, M, Q, au H (chaguo-msingi: H).",
        "fg: Rangi ya mbele kama hex bila # (chaguo-msingi: 000000).",
        "bg: Rangi ya usuli kama hex bila # (chaguo-msingi: ffffff).",
        "uwazi: Weka kuwa 1 kwa mandharinyuma yenye uwazi.",
        "ukingo: Eneo tulivu katika moduli (chaguo-msingi: 4).",
      ],
    },
    {
      heading: "Vigezo vya Styling",
      paragraphs: ["Uundaji wa moduli na muundo:"],
      bullets: [
        "mtindo: Mtindo wa moduli - mraba, mviringo, dots, almasi, kushikamana.",
        "mpataji: Mtindo wa muundo wa Finder - mraba, mviringo, mduara.",
        "align: Mtindo wa muundo wa upatanishi - match_finder, mraba, mviringo, mduara.",
        "muda: Mtindo wa muundo wa muda - match_module, imara, iliyokatika.",
        "eneo: Asilimia ya kipenyo cha kona 0-100.",
        "pengo: Asilimia ya pengo la moduli 0-50.",
        "gapMode: Gap mode - hakuna, inset, stroke, negative_space.",
        "eyeOuter, eyeInner: Mitindo ya macho - mraba, mviringo, mduara.",
        "Kipimo cha macho: Asilimia ya kipimo cha macho (chaguo-msingi: 100).",
        "grad: Aina ya gradient - hakuna, linear, radial, conic.",
        "gradAngle: Pembe ya gradient kwa gradients ya mstari.",
        "gradStop: Gradient inasimama kama color1,pos1,color2,pos2,... (k.m., ff0000,0,0000ff,1).",
      ],
    },
    {
      heading: "Vigezo vya Kufunika",
      paragraphs: ["Chaguzi za uwekaji wa picha (picha inayowekelea inachukuliwa upande wa seva):"],
      bullets: [
        "img: URL ya kuweka picha (lazima ipatikane kwa umma).",
        "mode: Hali ya ufunikaji - katikati, halftone, mchanganyiko, mwangaza, mosaic, dithered, bluu-kelele, subpixel.",
        "ukali: Uzito wa safu 0-100 (chaguo-msingi: 100).",
        "colorMode: Hali ya rangi ya Kufunika - rangi, kijivu, bw.",
        "inafaa: Jinsi overlay inafaa - kufunika, vyenye, kunyoosha.",
        "kuoza: Mzunguko wa safu kwa digrii.",
        "flipX, flipY: Weka hadi 1 ili kugeuza kuwekelea.",
        "KeepFinders: Hifadhi mifumo ya kitafutaji (chaguo-msingi: 1).",
        "keepTiming, keepAlign: Weka hadi 1 ili kuhifadhi mifumo ya saa/mipangilio.",
      ],
    },
    {
      heading: "Kuchakata Vigezo",
      paragraphs: ["Uchakataji wa awali wa picha umetumika kwa wekeleo:"],
      bullets: [
        "mwangaza: Marekebisho -100 hadi 100 (chaguo-msingi: 0).",
        "tofauti: Marekebisho -100 hadi 100 (chaguo-msingi: 0).",
        "gamma: Thamani 0.1 hadi 3 (chaguo-msingi: 1).",
        "kueneza: Marekebisho -100 hadi 100 (chaguo-msingi: 0).",
        "hue: Hue mzunguko katika digrii.",
        "blur: Waa katika pikseli.",
        "noa: Piga kiasi 0-100.",
        "posterize: viwango vya posterize.",
        "kizingiti: Kizingiti cha binary 0-255.",
        "makali: Kugundua makali - kuzima, sobel, canny.",
        "Geuza: Weka 1 ili kugeuza rangi.",
      ],
    },
    {
      heading: "Vigezo vya Watermark",
      paragraphs: ["Ongeza alama za maji kwa misimbo ya QR iliyotolewa:"],
      bullets: [
        "wmEn: Weka 1 ili kuwezesha watermark.",
        "wmKind: Aina ya watermark - maandishi, picha, muundo.",
        "wmText: Maandishi ya watermark (URL-iliyosimbwa).",
        "wmImg: URL ya picha ya watermark.",
        "wmPos: Nafasi - kituo, pembe, kingo, nyuma, eneo la utulivu.",
        "wmOpacity: Opacity 0-100 (chaguo-msingi: 50).",
        "wmBlend: Hali ya mchanganyiko - kawaida, kuzidisha, skrini, funika.",
      ],
    },
    {
      heading: "Vigezo vya Uhuishaji",
      paragraphs: ["Kwa pato la GIF iliyohuishwa (inahitaji umbizo=gif):"],
      bullets: [
        "animPattern: muundo wa uhuishaji - hakuna, mapigo, wimbi, scanline, shimmer, drift, color_cycle.",
        "animFrames: Idadi ya fremu 1-60 (chaguo-msingi: 24).",
        "Kasi ya anim: Kucheleweshwa kwa fremu katika milisekunde 10-1000 (chaguo-msingi: 100).",
        "animSeed: Mbegu nasibu kwa uhuishaji.",
        "kurahisisha: Kurahisisha uhuishaji - mstari, urahisi_ndani, urahisi_kutoka, urahisi_kutoka, kuteleza.",
      ],
    },
    {
      heading: "Vigezo vya Pato",
      paragraphs: ["Chaguo za umbizo la pato:"],
      bullets: [
        "ubora: Ubora wa WebP 0-1 (chaguo-msingi: 0.9).",
        "webpQ: Ubora wa WebP 0-100 (chaguo-msingi: 90).",
        "gifColors: GIF palette ya ukubwa 2-256 (chaguo-msingi: 256).",
        "dpi: Pato la DPI la PNG (chaguo-msingi: 72).",
        "metaTitle, metaMwandishi, metaCopy, metaDesc: sehemu za metadata za PNG.",
      ],
    },
    // Crop Parameters
    {
      heading: "Vigezo vya Mazao",
      paragraphs: ["Chaguzi za upunguzaji wa picha zinazowekelea:"],
      bullets: [
        "cropEn: Washa upunguzaji wa kuwekelea 0/1 (chaguo-msingi: 0).",
        "cropX: Kituo cha mazao X kama sehemu 0-1 (chaguo-msingi: 0.5).",
        "cropY: Kituo cha mazao Y kama sehemu 0-1 (chaguo-msingi: 0.5).",
        "Ukubwa wa mazao: Ukubwa wa mazao kama sehemu ya picha 0-1 (chaguo-msingi: 1).",
      ],
    },
    // Safety Lock Parameters
    {
      heading: "Vigezo vya Kufuli Usalama",
      paragraphs: [
        "Dhibiti ni vipengele vipi vya QR vinavyolindwa dhidi ya urekebishaji wa kuwekelea:",
      ],
      bullets: [
        "lockF: Funga mifumo ya kitafutaji 0/1 (chaguo-msingi: 1).",
        "lockT: Funga mifumo ya muda 0/1 (chaguo-msingi: 1).",
        "lockA: Mifumo ya upangaji wa kufuli 0/1 (chaguo-msingi: 1).",
        "lockFmt: Funga maelezo ya umbizo 0/1 (chaguo-msingi: 1).",
        "lockV: Maelezo ya toleo la kufuli 0/1 (chaguo-msingi: 1).",
        "Modi salama: Hali ya usalama - imezimwa, uwiano, kali (chaguo-msingi: imezimwa).",
        "safeMinPx: Kiwango cha chini cha ukubwa wa moduli katika saizi (chaguo-msingi: 2).",
        "safeMinQz: Kiwango cha chini cha moduli za eneo tulivu (chaguo-msingi: 4).",
      ],
    },
    // Auto-tuning Parameters
    {
      heading: "Vigezo vya kurekebisha kiotomatiki",
      paragraphs: ["Mipangilio ya uboreshaji kiotomatiki:"],
      bullets: [
        "autoVer: Chagua kiotomatiki toleo la QR 0/1 (chaguo-msingi: 1).",
        "autoEcc: Chagua kiotomatiki kiwango cha ECC 0/1 (chaguo-msingi: 0) - kidokezo cha upande wa seva pekee.",
        "Punguza kiotomatiki: [MTEJA-PEKEE] Punguza kiwango kiotomatiki hadi uchanganue - inahitaji kitanzi cha uthibitishaji wa skanisho.",
      ],
    },
    // Additional Animation Parameters
    {
      heading: "Vigezo vya Ziada vya Uhuishaji",
      paragraphs: ["Vidhibiti vilivyopanuliwa vya uhuishaji vya pato la GIF:"],
      bullets: [
        "kitanzi: Mizunguko ya uhuishaji mfululizo 0/1 (chaguo-msingi: 1).",
        "bounce: Mwelekeo wa uhuishaji wa Ping-pong 0/1 (chaguo-msingi: 0).",
        "kinyume: Cheza uhuishaji kinyume 0/1 (chaguo-msingi: 0).",
        "colorCycle: Washa madoido ya rangi ya baiskeli 0/1 (chaguo-msingi: 0).",
        "interp: Ufafanuzi wa fremu - hakuna, kufifia, morph (chaguo-msingi: hakuna).",
        "tempDither: Utaftaji wa muda - umezimwa, sauti_ya_buluu, salama_salama (chaguo-msingi: imezimwa).",
        "startF: fremu ya kuanza kwa uhuishaji (chaguo-msingi: 0).",
        "maxF: Upeo wa juu wa fremu za kutoa (chaguo-msingi: 0 = otomatiki).",
        "stepF: Muda wa hatua ya fremu (chaguo-msingi: 1).",
        "jitter: [CLIENT-PEKEE] Kizunguzungu cha moduli katika pikseli - kinahitaji uundaji upya wa QR kwa kila fremu.",
      ],
    },
    // Dithering Parameters
    {
      heading: "Vigezo vya Dithering",
      paragraphs: ["Dhibiti algoriti za upunguzaji wa usindikaji wa uchakataji:"],
      bullets: [
        "ditherKind: Dither algorithm - error_diffusion, ordered_bayer, blue_noise, n.k (chaguo-msingi: ordered_bayer).",
        "diffusionKernel: Kosa la uenezaji wa hitilafu - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (chaguo-msingi: floyd_steinberg).",
        "ditherNguvu: Dither intensiteten 0-100 (chaguo-msingi: 50).",
        "serpentine: Serpentine dithering 0/1 (chaguo-msingi: 0).",
        "matrix: Matrix ya dither iliyoagizwa - bayer2, bayer4, bayer8 (chaguo-msingi: bayer4).",
        "bnTile: Saizi ya kigae cha kelele ya bluu (chaguo-msingi: 64).",
        "bnSeed: Sauti ya bluu mbegu nasibu (chaguo-msingi: 0).",
        "colorDither: Kubadilisha rangi - hakuna, per_channel, perceptual (chaguo-msingi: hakuna).",
      ],
    },
    // Subpixel Parameters
    {
      heading: "Vigezo vya Subpixel",
      paragraphs: ["Mipangilio ya hali ya mchanganyiko ya pikseli ndogo:"],
      bullets: [
        "spGrid: Ukubwa wa gridi ya pikseli ndogo - 2x2, 3x3, 4x4 (chaguo-msingi: 3x3).",
        "spCenter: Sheria ya kituo - kali, halftone_center (chaguo-msingi: kali).",
        "spNeutral: Neutral rangi hex bila # (chaguo-msingi: 808080).",
        "spFinder: Finder override - imara, stylized (default: imara).",
      ],
    },
    // Halftone Parameters
    {
      heading: "Vigezo vya Halftone",
      paragraphs: ["Mipangilio ya hali ya mchanganyiko wa halftone:"],
      bullets: [
        "htCell: Ukubwa wa nusu ya seli - per_module au gridi ya nxn (chaguo-msingi: per_module).",
        "htDot: Umbo la nukta - duara, mraba, mstari (chaguo-msingi: mduara).",
        "htCurve: Mviringo wa kung'aa - mstari, s-curve, gamma (chaguo-msingi: mstari).",
        "duo1: hex ya rangi ya kivuli cha Duotone bila # (chaguo-msingi: 000000).",
        "duo2: Duotone iangazie hex ya rangi bila # (chaguo-msingi: ffffff).",
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: "Vigezo vya Modi ya ECC-Aware",
      paragraphs: ["Usambazaji wa uwekaji wa akili kulingana na uwezo wa kurekebisha makosa:"],
      bullets: [
        "eccAware: Washa hali ya kufahamu ECC 0/1 (chaguo-msingi: 0).",
        "eccRisk: Asilimia ya bajeti ya hatari 0-100 (chaguo-msingi: 50).",
        "eccMap: Uzito ramani - distance_to_finders, block_heatmap, empirical_scan_heatmap (chaguo-msingi: distance_to_finders).",
      ],
    },
    // Frame Parameters
    {
      heading: "Vigezo vya Frame",
      paragraphs: ["Mipangilio ya fremu ya mapambo:"],
      bullets: [
        "fremu: Mtindo wa fremu - hakuna, sura_iliyozunguka, kibandiko, lebo (chaguo-msingi: hakuna).",
        "frameText: Nakala ya kuonyesha katika fremu (URL iliyosimbwa).",
      ],
    },
    // Per-Module Color Parameters
    {
      heading: "Vigezo vya Rangi kwa Kila-Moduli",
      paragraphs: ["Chaguzi za kuchorea za moduli za kibinafsi:"],
      bullets: [
        "modColor: Hali ya rangi - imara, kwa_mwangaza, kwa_nafasi, kwa_kuweka juu, kwa_cluster (chaguo-msingi: imara).",
        "cWalinzi: Kilinzi cha kulinganisha 0/1 (chaguo-msingi: 0).",
        "minContrast: Kiwango cha chini cha uwiano wa utofautishaji 1-21 (chaguo-msingi: 4.5).",
        "palette: rangi za heksi zilizotenganishwa kwa koma kwa modi ya palette.",
        "paletteMode: Usambazaji wa palette - nafasi, mwangaza, diagonal, radial, random, safu, safu (chaguo-msingi: nafasi).",
      ],
    },
    // GIF Overlay Parameters
    {
      heading: "Vigezo vya Kufunika kwa GIF",
      paragraphs: ["Mipangilio ya picha za uhuishaji za GIF zinazowekelea:"],
      bullets: [
        "ovAina: Aina ya ufunikaji - tuli, gif, apng, webp_anim, video (chaguo-msingi: tuli).",
        "ovFramePick: Uchaguzi wa fremu - yote, kila_n, max_frames, duration_limit (chaguo-msingi: zote).",
        "gifDelays: Tumia ucheleweshaji wa fremu asili ya GIF 0/1 (chaguo-msingi: 1).",
        "gifDispH: Ushughulikiaji wa utupaji wa GIF - heshima, kurahisisha (chaguo-msingi: heshima).",
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: "Vikomo vya Kiwango cha Per-ECC",
      paragraphs: [
        "Kiwango cha juu zaidi cha uwekaji kwa kila kiwango cha urekebishaji wa hitilafu:",
      ],
      bullets: [
        "maxIntL: Kiwango cha juu zaidi cha ECC L 0-100 (chaguo-msingi: 100).",
        "maxIntM: Kiwango cha juu cha nguvu kwa ECC M 0-100 (chaguo-msingi: 100).",
        "maxIntQ: Nguvu ya juu zaidi ya ECC Q 0-100 (chaguo-msingi: 100).",
        "maxIntH: Kiwango cha juu cha nguvu kwa ECC H 0-100 (chaguo-msingi: 100).",
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: "Vigezo vya Kuiga vya QA (Mteja Pekee)",
      paragraphs: [
        "Vigezo hivi vinachanganuliwa kwa uoanifu wa URL lakini hufanya kazi kwenye kivinjari pekee:",
      ],
      bullets: [
        "qaContrast: Washa ukaguzi wa utofautishaji 0/1 - inahitaji uthibitishaji mwingiliano.",
        "qaBlur: Iga ukungu katika pikseli - kwa majaribio ya mwingiliano pekee.",
        "qaNoise: Iga kiwango cha kelele - kwa majaribio ya mwingiliano pekee.",
        "qaHeatmap: Onyesha ramani ya joto inayoweza kusomeka 0/1 - inahitaji kiolesura cha turubai.",
      ],
    },
    // Client-Only Parameters
    {
      heading: "Vigezo vya Mteja Pekee",
      paragraphs: [
        "Vigezo vingi vya API vinatumika kikamilifu upande wa seva. Vigezo vilivyowekwa alama [CLIENT-TU] vinachanganuliwa ili uoanifu wa URL lakini vinahitaji vipengele vya kivinjari:",
      ],
      bullets: [
        "jitter: Moduli ya jita inahitaji uundaji upya wa QR kwa kila fremu bila mpangilio.",
        "Punguza kiotomatiki: Kiwango cha kupunguza kiotomatiki kinahitaji majaribio ya mara kwa mara ya uchanganuzi.",
        "qaContrast, qaBlur, qaNoise, qaHeatmap: Uigaji wa QA unahitaji uthibitishaji shirikishi wa turubai.",
      ],
    },
    // Additional Output Parameters
    {
      heading: "Vigezo vya ziada vya Pato",
      paragraphs: ["Mipangilio iliyopanuliwa ya pato na usafirishaji:"],
      bullets: [
        "fname: Jina la faili maalum la vipakuliwa (chaguo-msingi: anqr-qrcode).",
        "inclQz: Jumuisha eneo tulivu katika vipimo vya matokeo 0/1 (chaguo-msingi: 1).",
        "bgOver: Rangi ya usuli hubatilisha hex bila # (hubatilisha kigezo cha bg).",
        "fmtExtra: Towe la umbizo la ziada - hakuna, eps, animated_webp (chaguo-msingi: hakuna). Kumbuka: eps ni [SEHEMU].",
        "svgPrec: usahihi wa umbo la SVG - pixel, sahihi (chaguo-msingi: pixel). [SEHEMU] Pato la SVG lenye upande wa seva.",
        "svgEmbed: Pachika wekeleo la raster katika SVG 0/1 (chaguo-msingi: 1). [SEHEMU] Pato la SVG lenye upande wa seva.",
        "modulePx: Ukubwa wa saizi ya moduli (chaguo-msingi: inakokotolewa kiotomatiki kutoka kwa saizi).",
        "mpaka: Sehemu za ziada za mpaka zaidi ya eneo tulivu (chaguo-msingi: 0).",
        "crisp: Washa uwasilishaji wa picha crisp/pixelated 0/1 (chaguo-msingi: 1).",
        "snap: Pixel snap mode - sakafu, pande zote, dari (chaguo-msingi: sakafu).",
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: "Vigezo vya Uhifadhi wa Muundo",
      paragraphs: ["Dhibiti ni vipengele vipi vya kimuundo vinavyolindwa dhidi ya kuwekelea:"],
      bullets: [
        "keepFinders: Hifadhi ruwaza za kipataji 0/1 (chaguo-msingi: 1).",
        "keepTiming: Hifadhi ruwaza za muda 0/1 (chaguo-msingi: 0).",
        "keepAlign: Hifadhi ruwaza za upatanishi 0/1 (chaguo-msingi: 0).",
        "protectFmt: Linda moduli za maelezo ya umbizo 0/1 (chaguo-msingi: 0).",
        "protectVer: Linda moduli za maelezo ya toleo 0/1 (chaguo-msingi: 0).",
      ],
    },
    {
      heading: "Matumizi ya Mfano",
      paragraphs: [
        "Msimbo wa msingi wa QR:",
        "https://anqr.link/api/qr?data=https://example.com",
        "Msimbo wa QR wenye mtindo na rangi maalum:",
        "https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30",
        "Msimbo wa QR ulio na picha inayowekelewa:",
        "https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70",
        "GIF iliyohuishwa:",
        "https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out",
      ],
      links: [{ href: "/examples?lang=${lang}", label: "Tazama mifano ya QR", type: "example" }],
    },
    {
      heading: "Kupachika Misimbo ya QR",
      paragraphs: [
        "Katika hali ya Kitaalamu, kipengele cha Kushiriki hutengeneza HTML na URL zinazoweza kupachikwa. Hivi ndivyo upachikaji unavyofanya kazi:",
      ],
      bullets: [
        "Shiriki Kiungo: Huunda URL kwa programu ya ANQR na mipangilio yako yote ikiwa imesimbwa kama vigezo vya URL. Wapokeaji wanaweza kuangalia na kurekebisha msimbo wa QR.",
        "Pachika Picha: Huzalisha <img> lebo inayoelekeza kwenye API ya seva. Msimbo wa QR hutolewa kwa upande wa seva na kutumika kama picha.",
        "Pachika Alama: Huunda syntax ya picha ya Markdown kwa uhifadhi wa nyaraka na faili za README.",
        "Direct API URL: URL ghafi ya API kwa matumizi katika programu, hati, au miunganisho mingine.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Mfano wa HTML",
      paragraphs: [
        "Ili kupachika msimbo wa QR kwenye tovuti yako:",
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        "Kwa saizi inayojibu:",
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />',
        "Seva huhifadhi majibu kwa vichwa virefu vya akiba, kwa hivyo maombi yanayorudiwa ya URL sawa ni ya haraka.",
      ],
    },
    {
      heading: "Shiriki Umbizo la URL",
      paragraphs: [
        "Unapobofya Shiriki katika hali ya Kitaalamu, ANQR husimba mipangilio yako ya sasa katika vigezo vya URL. Muundo ni:",
        "https://anqr.link/?data=...&ec=H&style=rounded&....",
        "Vigezo hivi huakisi vigezo vya API, kwa hivyo unaweza kubadilisha URL ya kushiriki hadi URL ya API kwa kubadilisha njia ya msingi kutoka / hadi / api/qr na kurekebisha vigezo vya w/h inavyohitajika.",
        "Kumbuka: Picha zinazowekelewa zilizopakiwa kutoka kwa faili za karibu haziwezi kushirikiwa kupitia URL - ni viwekeleo vinavyotokana na URL pekee (img parameta) hufanya kazi katika viungo vilivyoshirikiwa na simu za API.",
      ],
    },
    {
      heading: "Vikomo vya Viwango na Matumizi",
      paragraphs: [
        "API ni bure kutumia kwa viwango vya kuridhisha. Kwa matumizi ya kiwango cha juu au programu za kibiashara zinazohitaji muda uliohakikishwa, tafadhali wasiliana nasi.",
        "Majibu ya API yanajumuisha vichwa vya kuakibisha vya fujo. Kwa utendakazi bora, majibu ya akiba upande wako au tumia URL ile ile mara kwa mara kwa misimbo inayofanana ya QR.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: "Mazoea Bora",
      paragraphs: ["Fuata miongozo hii kwa misimbo ya QR ya kuaminika:"],
      bullets: [
        "Jaribu misimbo yako ya QR kila wakati ukitumia programu nyingi za skana kabla ya kuchapisha.",
        "Tumia Marekebisho ya Hitilafu H (Juu) unapoongeza viwekeleo.",
        "Weka angalau moduli 4 za eneo tulivu (pembezoni).",
        "Hakikisha utofautishaji wa juu kati ya mandhari ya mbele na ya nyuma.",
        "Kwa uchapishaji, tumia angalau DPI 300 na ujaribu kwa ukubwa halisi wa chapa.",
        "Washa Miundo ya Hifadhi ya Kitafutaji unapotumia viwekeleo.",
        "Anza na kiwango cha chini cha kufunika na kuongeza hatua kwa hatua.",
        "Kwa matumizi ya nje, zingatia saizi kubwa za moduli na urekebishaji wa makosa ya juu.",
      ],
      links: [
        { href: "/learn?lang=${lang}", label: "Vinjari Makala ya Jifunze", type: "learn" },
        { href: "/examples?lang=${lang}", label: "Tazama mifano ya QR", type: "example" },
      ],
    },
    {
      heading: "Kutatua matatizo",
      paragraphs: ["Maswala ya kawaida na suluhisho:"],
      bullets: [
        "QR haitachanganua: Punguza ukubwa wa muunganisho, ongeza urekebishaji wa makosa, angalia utofautishaji.",
        "Msimbo ni mkubwa mno: Punguza urefu wa maudhui, tumia kifupisha URL, toleo la chini.",
        "Pato la ukungu: Ongeza ukubwa wa moduli, tumia PNG badala ya umbizo lililobanwa.",
        "Rangi inaonekana vibaya: Angalia utofautishaji wa rangi, jaribu hali ya kuwekelea kwa rangi ya kijivu.",
        "GIF haihuishi: Hakikisha unatumia towe la umbizo la GIF, angalia hesabu ya fremu.",
        "Uwekeleaji wa picha haupakii: Angalia ruhusa za CORS kwenye picha za mbali.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Tazama miongozo na mifano inayohusiana",
          type: "learn",
        },
      ],
    },
    {
      heading: "Njia za mkato za Kibodi",
      paragraphs: [
        "ANQR inaweza kutumia mikato ya kawaida ya kibodi. Tumia Ctrl/Cmd+S kuanzisha uhamishaji (unapolenga onyesho la kukagua).",
      ],
    },
    {
      heading: "Kushiriki na Kupachika",
      paragraphs: [
        "Katika hali ya Kitaalamu, bofya kitufe cha Shiriki ili kunakili URL iliyo na mipangilio yako ya sasa. Wapokeaji wanaweza kufungua URL hii ili kuona usanidi wako kamili. Kumbuka: Picha zinazowekelewa kutoka kwa faili za karibu haziwezi kushirikiwa kupitia URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Jaribu usanidi huu moja kwa moja kwenye jenereta ya ANQR.",
          type: "generator",
        },
      ],
    },
  ],
  relatedLinks: [
    { href: "/learn?lang=${lang}", label: "Vinjari Makala ya Jifunze", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Tazama mifano ya QR", type: "example" },
    { href: "/gallery?lang=${lang}", label: "Tazama mifano ya QR", type: "gallery" },
    { href: "/?lang=${lang}", label: "Fungua jenereta", type: "generator" },
  ],
};

export default guide;
