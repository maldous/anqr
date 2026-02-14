import type { PageDefinition } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Dæmi um ANQR',
  description: 'Fimm raunveruleg dæmi í framleiðslustíl sem sýna hvar QR kóðar skapa mælanlegt verðmæti: upplyftingu eldri verslunarteljarakóða, vörumerki smásölugreiðslur og „skanna-til" aðgerðir, prentað stærð frá flugmiðum til auglýsingaskilta, hreyfimyndað QR fyrir stafræn skilti og þvermállegt samstarf með því að nota ankeratengla sem hægt er að deila. Hvert dæmi inniheldur myndir, hagnýtar takmarkanir og endurhljóðblöndun tengil aftur á rafallinn.',
  lastUpdated: '1. febrúar 2026',

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Opnaðu rafalann', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Skoða Lærðu greinar', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Opnaðu alla notendahandbókina', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Tilviksrannsókn: Retail Counter QR Uplift',
      paragraphs: ['Þetta raunverulega dæmi fylgir litlu kaffihúsi sem hafði notað sama QR kóða á borðinu sínu í þrjú ár. Upprunalega kóðinn var búinn til fljótt í heimsfaraldri, prentaður á venjulegan pappír og smeygði sér í plaststand. Það virkaði samt - tæknilega séð - en viðskiptavinir þurftu oft margar tilraunir til að skanna það og það gerði ekkert til að styrkja vandlega útbúið vörumerki kaffihússins.', 'Umbreytingin hófst með einfaldri úttekt: Kóðinn sem fyrir var umritaði vefslóð matseðils kaffihússins á netinu sem þeir vildu halda. Áskorunin var að láta QR-inn líða eins og hluta af kaffihúsaupplifuninni frekar en eftirhugsunartæki frá 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Veðraður QR-kóði í plaststandi sem sýnir sýnilegt slit, fingraför og dofna prentun',
          caption: 'Upphafspunkturinn: Þriggja ára afgreiðsluþjónusta hafði skilið upprunalega QR-búnaðinn varla við',
        },
      ],
    },
    {
      heading: 'Greining á vandamálum upprunalega kóðans',
      paragraphs: ['Prófun leiddi í ljós mörg vandamál: upprunalega kóðinn notaði Villuleiðréttingu L (lágmarks offramboð), hafði rólegt svæði með aðeins 2 einingum og var prentaður í lítilli upplausn. Undir heitri wolframlýsingu kaffihússins stóðu þegar fölnuðu svörtu einingarnar varla andstæður við gulnaðan pappírinn. Eldri símar áttu í erfiðleikum; nýrri símar náðu árangri en með áberandi seinkun.', 'Fyrir utan tæknileg atriði, sagði almenna svart-hvíta ferningurinn ekkert um vörumerkið. Viðskiptavinir hikuðu áður en þeir skannaðu - fíngerð traust hindrun sem dró úr þátttöku í vandlega hönnuðum stafrænum matseðli kaffihússins.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Greiningaryfirlag sem sýnir tæknilega annmarka upprunalega QR: lágt ECC, lágmarks hljóðlát svæði, léleg birtuskil',
          caption: 'Tæknileg greining sem leiðir í ljós hvers vegna eldri kóðinn stóð sig illa við raunverulegar aðstæður',
        },
      ],
    },
    {
      heading: 'Upplyftingarferlið',
      paragraphs: ['Með því að nota ANQR endurskapaði kaffihúseigandinn kóðann með sömu valmyndarvefslóðinni en verulega bættum stillingum: Villuleiðrétting H fyrir hámarks seiglu, 6 eininga hljóðlátt svæði fyrir áreiðanlega greiningu á mörkum og vörumerkislitir (djúpar vínrauðra einingar á krembakgrunni) sem passa við innri litatöflu kaffihússins.', 'Lítilli miðjuyfirlagi með lógói kaffihússins var bætt við - haldið vísvitandi fíngerðum til að viðhalda skannanleika en veita samstundis vörumerki. Öryggisstilling staðfesti nýja hönnunina skannað á áreiðanlegan hátt yfir prófunartæki fyrir prentun.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR viðmótið sem sýnir uppsetninguna: vörumerkisliti, viðeigandi ECC, rausnarlegt hljóðlát svæði, fíngerð lógóyfirlag',
          caption: 'Að byggja upp uppfærða uppsetningu: hverja stillingu sem valin er til að halda jafnvægi á vörumerkjatjáningu og áreiðanleika skanna',
        },
      ],
    },
    {
      heading: 'Mælanlegur árangur',
      paragraphs: ['Eftir að hafa sett nýja QR á faglega matt-lagskipt kort, fylgdist kaffihúsið með árangri í fjórar vikur. Árangurshlutfall skanna jókst úr áætlaðri 70% í næstum 100%. Meðalskannatími lækkaði úr 3-4 sekúndum í undir 1 sekúndu. Mikilvægast er að þátttaka í valmyndum jókst um 40% - viðskiptavinir sem áður litu á QR og gáfust upp voru nú að skanna af öryggi.', 'Starfsfólk tilkynnti færri spurningar viðskiptavina um „hvernig á að nota QR" og ekki fleiri tilvik um að slá inn vefslóðina handvirkt fyrir svekkta viðskiptavini. Vörumerkjaútlitið vakti einnig samræður þar sem viðskiptavinir tjáðu sig með jákvæðum hætti um heildstæða hönnunina.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Fyrir/eftir samanburður við mælikvarða: árangur skönnunar, meðaltal skannatíma og vikulegar endurbætur',
          caption: 'Fjögurra vikna gögn sem sýna mælanleg áhrif umhugsaðrar QR hækkunar',
        },
      ],
    },
    {
      heading: 'Endurskapa þessa stillingu',
      paragraphs: ['Uppsetning kaffihússins sýnir íhaldssamt en áhrifaríkt vörumerki: Villuleiðrétting H, 6 eininga hljóðlátt svæði, vörumerkislitir með mikilli birtuskil og lágmarks yfirborð á miðjunni. Þetta jafnvægi virkar fyrir flest smásöluborðaforrit þar sem áreiðanleiki verður að vera í fyrirrúmi en viðvera vörumerkis skiptir enn máli.', 'Opnaðu rafallinn með þessar stillingar forhlaðnar og aðlagaðu litina og yfirborðið að þínu eigin vörumerki. Lykilinnsýn: Áreiðanleikabætur einar og sér geta aukið þátttöku verulega, jafnvel áður en þú bætir við sjónrænum stíl.', 'Skoðaðu tengda Learn-handbók um að bæta núverandi QR-herferðir fyrir alla aðferðafræðina á bak við þessa nálgun.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Tengill á rafalinn sem er fyrirfram stilltur með stillingum kaffihússins til að sérsníða strax',
          caption: 'Byrjaðu með sannreyndri uppsetningu og aðlaga fyrir vörumerkið þitt',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Skoða Lærðu greinar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Dæmi: Sýni á marggreiðsluteljara',
      paragraphs: ['Þetta dæmi fylgir tískuverslun með fataverslun sem hafði safnað fimm mismunandi QR kóða í skránni sinni: bankagreiðslu, ábendingar, Instagram, Google umsagnir og ráðningartengil. Hvert þeirra var búið til úr mismunandi uppruna, prentað á mismunandi tímum og sýnt í ósamræmdum standum. Sjónræn ringulreið var að grafa undan vandlega úthugsaða fagurfræði verslunarinnar og starfsfólk tók reglulega á viðskiptavinum að skanna rangan kóða.', 'Lausnin krafðist aðskilnaðar áhyggjum: greiðslukóðar þurftu hámarks áreiðanleika með íhaldssömum stíl, á meðan markaðskóðar gætu verið svipmeiri. Sameinaða skjákerfið sem kom fram sýnir hvernig á að jafna viðveru vörumerkis á móti hagnýtum kröfum mismunandi QR notkunartilvika.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Ringulreið skráarsvæði sem sýnir fimm misjafna QR kóða í ýmsum standum og prentuðu efni',
          caption: 'Óskipulegur upphafspunktur: fimm ótengdir QR kóðar sem keppa um athygli og valda ruglingi viðskiptavina',
        },
      ],
    },
    {
      heading: 'Forgangsraða greiðsluupplifuninni',
      paragraphs: ['Aðalgreiðslumáti verslunarinnar notaði svæðisstaðal sem krafðist ströngs samræmis við farm. Prófun leiddi í ljós að jafnvel minniháttar stíll hafði áhrif á skannahraða með tilteknum bankaforritum. Ákvörðunin: Haltu greiðslu QR algjörlega óbreyttum nema fyrir stærðarbestun og faglega prentun á matt kort.', 'Þessi íhaldssöma nálgun þýddi að greiðslukóðinn leit út fyrir að vera minna „merktur" en tilvalinn, en færsluhlutfall batnaði verulega. Innsýn: greiðslustundir eru ekki vörumerkistækifæri - þau eru áreiðanleika augnablik. Viðskiptavinir kunna að meta hraða og vissu um fagurfræði þegar peningar eiga í hlut.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Hreinn, stór QR-kóði fyrir greiðslu á mattu atvinnukorti, staðsettur áberandi við skrána',
          caption: 'Greiðslu QR: ríkulega stór, prentuð fagmannlega, íhaldssöm stíll til að bankaforrit sjái strax',
        },
      ],
    },
    {
      heading: 'Að búa til aukaaðgerðaskjáinn',
      paragraphs: ['Fyrir ábendingar, umsagnir, félagsmál og ráðningar gæti verslunin verið svipmikill. Þessir kóðar voru endurnýjaðir í ANQR með samkvæmri vörumerkjastíl: einkennismynd verslunarinnar ólífu grænn á rjóma, ávöl einingarstíl og fíngerð miðjuyfirlag með tákni verslunarinnar. Villuleiðrétting H tryggði áreiðanleika jafnvel með stíl.', 'Þessum fjórum kóðum var raðað í vörumerki sem staðsettur var við hlið (ekki í samkeppni við) greiðslukóðann. Skýrir merkimiðar í leturgerð verslunarinnar útskýrðu tilgang hvers kóða. Sjónræna stigveldið var viljandi: greiðsla stóð ein og áberandi; aukaaðgerðir flokkaðar saman sem valkostir.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Vörumerkjaspjald sem sýnir fjóra stílaða QR kóða fyrir ábendingar, umsagnir, félagsmál og ráðningar, með skýrum merkingum',
          caption: 'Aukaaðgerðaspjaldið: samkvæm vörumerki, skýr merking, staðsett sem valmöguleikar frekar en truflanir',
        },
      ],
    },
    {
      heading: 'Sýnakerfishönnun',
      paragraphs: ['Líkamlegi skjárinn leysti nokkur vandamál samtímis. Bæði greiðslustandurinn og aukaborðið notuðu matt efni til að koma í veg fyrir glampa frá loftlýsingu. Hæðir voru fínstilltar fyrir viðskiptavini af mismunandi stærð. Horn beint að biðröð viðskiptavina frekar en flatt á borðið.', 'Mikilvægt er að verslunin bjó til varaprentanir úr læstum ANQR stillingatenglum. Þegar ábendingarkóðinn fékk loksins að skvetta í kaffi, skiptu starfsmenn um hann innan nokkurra mínútna með því að nota vistaðar stillingar - engar skjámyndir, engin giska á stillingar, engin gæðarýrnun.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Skýringarmynd sem sýnir líkamlega uppsetningu skjásins: hæð, horn, efni og tengsl milli greiðslu og aukaskjáa',
          caption: 'Skjákerfisteikning: líkamleg vinnuvistfræði fínstillt fyrir áreiðanlega skönnun á hæðum viðskiptavina og birtuskilyrðum',
        },
      ],
    },
    {
      heading: 'Rekstrarbætur',
      paragraphs: ['Sex vikum eftir uppsetningu, skjalfesti verslunin verulegar umbætur: engar kvartanir viðskiptavina um rugling „rangan kóða", hraðari viðskiptatíma og 3x aukning á ábendingum (viðskiptavinir gátu nú fundið og skannað ábendingarkóðann án þess að spyrja starfsfólkið óþægilega). Umsagnir Google jukust einnig eftir því sem hollur, vel merktur QR fjarlægði núning.', 'Þjálfun starfsfólks varð einfaldari: \'greiðslukóði er sá stóri, allt annað er á pallborðinu.\' Þegar greiðsluforrit uppfærðust og eitt sýndi í stutta stund hægari skönnun, þýddi íhaldssama greiðslukóðahönnunin að hann virkaði enn - bara örlítið hægar frekar en að mistakast algjörlega.', 'Sjá Lærðu handbókina um QR kóða fyrir smásölugreiðslur fyrir meginreglurnar á bak við þessa skjákerfishönnun.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Mælaborð sem sýnir fyrir/eftir samanburð: ruglingsatvik, viðskiptatíma, ábendingatíðni, endurskoðunarsendingar',
          caption: 'Sex vikur af rekstrargögnum sem sýna fram á viðskiptaáhrif yfirvegaðs multi-QR skjákerfis',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Skoða Lærðu greinar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Dæmi: Frá nafnspjaldi til auglýsingaskilti',
      paragraphs: ['Þetta dæmi fylgir viðburðaframleiðslufyrirtæki sem undirbýr sig fyrir stóra ráðstefnu. Þeir þurftu sama QR kóða - sem tengist viðburðarforritinu - notaður á róttækan mismunandi snið: þátttakendamerkjainnsetningar (3 cm), borðtjaldspjöld (8 cm), skráningarborðsskilti (30 cm), vegspjöld (60 cm) og risastóran sviðsborða (4 metrar). Hvert snið hafði mismunandi útsýnisfjarlægðir, birtuskilyrði og framleiðsluferli.', 'Áskorunin var ekki bara tæknileg - hún var rekstrarleg. Margir söluaðilar sáu um mismunandi prentverk og fyrirtækið þurfti að tryggja samræmdar, skannanlegar niðurstöður óháð því hver framleiddi hvað. Lausnin þeirra snérist um SVG útflutning og strangar sendingarskjöl.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Klippimynd sem sýnir sama QR kóða í fimm mismunandi stærðum, frá merki til borða',
          caption: 'Einn QR kóða, fimm dreifingarstærðir: áskorunin að viðhalda skannanleika frá sentimetrum til metra',
        },
      ],
    },
    {
      heading: 'Hvers vegna fyrri atburðir áttu í vandræðum',
      paragraphs: ['Á síðustu ráðstefnu þeirra hafði fyrirtækið orðið fyrir vandræðalegum mistökum. Sviðsborðinn QR var búinn til sem lítið PNG og stækkað í hönnunarhugbúnaði - útkoman leit viðunandi út úr fjarlægð en náði ekki að skanna áreiðanlega frá áhorfendum. QR-merki merkisins voru of stíluð og of lítil, pirrandi fundarmenn sem reyndu að bæta við tengiliðum. Ósamræmar stillingar á sniðum þýddu að „sami" QR leit í raun öðruvísi út á hverju stykki.', 'Greining eftir atburði leiddi í ljós undirrótina: engin ein uppspretta sannleika. Hver hönnuður hafði endurskapað QR með aðeins mismunandi stillingum og hver prentsali hafði unnið úr skrám á annan hátt. Gæði rýrnuðust í gegnum símaleik við afhendingu skráa.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Nærmyndir sem sýna bilanir í skönnun: pixlaðar borðaeiningar, undirstærð merkikóða, ósamræmi stíll á sniðum',
          caption: 'Réttarfræðileg greining á fyrri atburðabilunum: hvert snið hafði kynnt mismunandi gæðavandamál',
        },
      ],
    },
    {
      heading: 'SVG-First verkflæðið',
      paragraphs: ['Fyrir þennan atburð stofnaði fyrirtækið stranga siðareglur: einn aðal QR myndaður í ANQR með bestu stillingum (villuleiðrétting H, rausnarlegt rólegt svæði, hreint útlit), flutt út sem SVG og geymt sem eina opinbera uppspretta. ANQR stillingartengillinn var skjalfestur samhliða SVG skránni svo hægt væri að endurnýja kóðann ef þörf krefur.', 'Sérhver hönnuður og söluaðili fengu sama SVG meistara með skýrum leiðbeiningum: settu í nauðsynlega stærð, ekki breyta, viðhalda hljóðlátu svæði. Fyrir framleiðendur sem krefjast rastersniðs útvegaði fyrirtækið forútgefin PNG í ákveðnum stærðum með skýrum nafnavenjum sem gefa til kynna fyrirhugaða notkun.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Skráarpakki sem sýnir SVG master, stærðarsértæk PNG, forskriftarskjal og stillingartengil',
          caption: 'Handoff pakkinn: allt sem seljendur þurftu til að framleiða stöðugar niðurstöður án þess að giska',
        },
      ],
    },
    {
      heading: 'Stærðarsértæk atriði',
      paragraphs: ['Hvert snið krafðist sérstakrar athygli. Merkisinnsetningar á 3 cm þurftu QR til að taka hámarks pláss sem tiltækt er - skannafjarlægð væri armslengd. Borðtjöld á 8 cm gætu falið í sér skreytingarrömmun utan kyrrðarsvæðisins. 4 metra borðinn þurfti að reikna út: frá dæmigerðri áhorfendafjarlægð (15-20 metrar), einingar þurftu að vera greinilega aðgreindar með símamyndavélum, sem þýddi að QR-ið þyrfti að vera að minnsta kosti 80 cm innan borðarhönnunarinnar.', 'Fyrirtækið bjó til stærðarleiðbeiningar sem skjalfestir lágmarks QR stærðir fyrir hverja væntanlega skannafjarlægð. Þetta varð endurnýtanleg eign fyrir framtíðarviðburði og fjarlægði getgátur úr hönnunarferlinu.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Myndrit sem sýnir sambandið á milli skönnunarfjarlægðar, lágmarks QR-stærðar og stærð eininga fyrir hvert viðburðarsnið',
          caption: 'Stærðarfylki: útreiknuð stærð sem tryggir áreiðanlega skönnun við væntanlega sýnisfjarlægð hvers sniðs',
        },
      ],
    },
    {
      heading: 'Framleiðsluniðurstöður',
      paragraphs: ['Staðfesting ráðstefnudagsins var kerfisbundin: starfsfólk prófaði hvern uppsettan QR áður en hurðir opnuðust. Merkisinnskotin skannaðar samstundis í armslengd. Borðtjöld virkuðu á áreiðanlegan hátt í breytilegri lýsingu á herbergjum. Sviðsborðinn - vandræði fyrri viðburðarins - skannaði með góðum árangri frá miðju áhorfendasvæðinu.', 'Engar kvartanir um skönnun voru skráðar yfir 2.000+ fundarmenn. Rekstrarvinningurinn var ekki síður marktækur: þegar viðbót við styrktaraðila á síðustu stundu krafðist nýrrar merkingar, bjó framleiðsluteymið það frá meistara SVG á nokkrum mínútum, fullviss um að það myndi passa við allt annað.', 'Sjá Lærðu handbókina um prentaða QR kóða fyrir SVG vs PNG ákvörðunarrammann og bestu starfsvenjur.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Viðburðarmyndataka sem sýnir þátttakendum að skanna QR kóða í ýmsum stærðum og fjarlægðum um allan vettvang',
          caption: 'Árangur ráðstefnudagsins: áreiðanleg skönnun á hverju sniði, allt frá nærmyndum merkja til fjarlægðarmynda á borðum',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Skoða Lærðu greinar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Tilviksrannsókn: Stafrænn skjár á flugvellinum',
      paragraphs: ['Þetta dæmi fylgir setustofu flugfélags sem hafði notað kyrrstæða QR kóða á stafrænum móttökuskjám sínum. Skjáirnir sýndu snúnings kynningarefni, en QR kóðann fyrir innritun í setustofu sat í horni, kyrrstæður og auðvelt að gleymast. Greining sýndi að aðeins 15% gjaldgengra gesta notuðu QR-innritun þrátt fyrir að hún væri hraðari en skrifborðsröðin. Flestir gestir tóku einfaldlega ekki eftir því.', 'Tilgátan var einföld: í sjónrænu uppteknu umhverfi með efni á hreyfingu verður kyrrstæður QR ósýnilegur. Lausnin sem þarf til að gera QR áberandi án þess að skerða áreiðanleikann sem þarf til innritunarflæðis þar sem bilun myndi þýða svekkta ferðamenn og lengri biðraðir við skrifborð.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Stafræn skjár í setustofu á flugvelli sem sýnir kynningarefni með litlum, kyrrstæðum QR kóða í horninu',
          caption: 'Upprunalega uppsetningin: kyrrstæður QR týndur í hafsjó af kraftmiklu kynningarefni, sem nær aðeins 15% upptöku',
        },
      ],
    },
    {
      heading: 'Að hanna Safe Animation',
      paragraphs: ['Stafræn merki setustofunnar notuðu stór LED spjöld - krefjandi umhverfi þar sem árásargjarn hreyfimynd gæti skapað skannaðarvandamál. Hönnunarteymið byrjaði íhaldssamt: mild púlsáhrif sem stækkuðu lúmskur og drógu saman sjónræna nærveru QRsins án þess að breyta raunverulegri kóðabyggingu. Tímasetning ramma var stillt hægt (250 ms) til að forðast flöktvandamál með LED endurnýjunarhraða.', 'Staðfesting öryggisstillingar staðfesti að hver rammi var áfram skannalegur. Viðbótarprófanir á raunverulegum LED spjöldum leiddu í ljós að púlsinn þurfti að vera enn lúmskari en sýnishorn skjáborðs gaf til kynna - LED birta og sjónarhorn höfðu áhrif á skynjaða birtuskil meira en búist var við.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR hreyfimyndastillingarspjaldið sýnir púlsstillingar: hæg tímasetning, lúmskur styrkleiki, öryggisstilling virkjuð',
          caption: 'Hreyfimyndastillingar: færibreytur stilltar fyrir LED spjaldskjá og viðhalda áreiðanleika skönnunar í hverjum ramma',
        },
      ],
    },
    {
      heading: 'Samþætting við merkingarefni',
      paragraphs: ['Hreyfanlegur QR var staðsettur á sérstöku „stöðugleikasvæði" á skjáskipulaginu - svæði sem hélst stöðugt á meðan kynningarefni snérist á aðalskjásvæðinu. Þessi aðskilnaður skipti sköpum: QR-tækið þurfti sjónrænan stöðugleika til að skanna jafnvel á meðan það vakti athygli með fíngerðu hreyfimyndinni.', 'Skýrri ákalli til aðgerða var bætt við hliðina á QR: \'Sleppa biðröðinni - skannaðu til að innrita þig.\' Textinn hélst kyrrstæður á meðan QR púlsaði og skapaði sjónrænt stigveldi sem dró augun að skönnunartækifærinu án þess að yfirgnæfa kynningarefnið.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Skjáútlitsmynd sem sýnir hreyfimyndaðan QR á stöðugu svæði á meðan kynningarefni snýst á aðalsvæðinu',
          caption: 'Skjáfasteignaúthlutun: Hreyfimyndaður QR er á stöðugu svæði sem er aðskilið frá snúnings kynningarefni',
        },
      ],
    },
    {
      heading: 'Tæknileg uppsetning',
      paragraphs: ['Hreyfanlegur QR var fluttur út sem GIF með fínstilltum stillingum fyrir merki CMS. Skráarstærðarsjónarmið skiptu máli - vefumsjónarkerfi stofunnar hafði takmarkanir á upphleðslu og of stórar skrár ollu stami í spilun. Lokaútflutningurinn jafnaði sjónræn gæði á móti skráarstærð með því að takmarka litavali og fínstilla fjölda ramma.', 'Uppsetningin innihélt afturköllun: ef GIF myndi ekki spilast af einhverri ástæðu myndi merkjakerfið sýna kyrrstæða PNG öryggisafrit. Þessi offramboð tryggði að innritunargeta glataðist aldrei vegna tæknilegra vandamála við hreyfimyndina.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'CMS viðmót sem sýnir hreyfimyndaða QR upphleðslu með kyrrstöðumynd stillt',
          caption: 'Merki CMS stillingar: hreyfimyndað aðal með kyrrstöðu sem tryggir að innritunargeta sé aldrei trufluð',
        },
      ],
    },
    {
      heading: 'Mæld áhrif',
      paragraphs: ['Eftir einn mánuð í rekstri jókst innritun QR innritunar úr 15% í 24% - 60% hlutfallsleg framför. Kannanir gesta benda til þess að QR hreyfimyndin væri „auðveldara að taka eftir" og „finnst nútímalegri". Biðraðir skrifborðs lækkuðu mælanlega á álagstímum þar sem fleiri gestir þjónuðu sjálfum sér í gegnum QR.', 'Mikilvægt er að tilkynnt var um engar bilanir í skönnun þrátt fyrir þúsundir daglegra skanna. Íhaldssama hreyfimyndaaðferðin hafði náð athyglismarkmiðinu án þess að fórna þeim áreiðanleika sem innritunarflæði krafðist. Setustofan setti í kjölfarið út svipaðar líflegar QR-myndir á öðrum stöðum sínum.', 'Sjá Lærðu handbókina um hreyfimyndaða QR kóða fyrir stafræn skilti fyrir tæknilegar meginreglur á bak við örugga hreyfimyndahönnun.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Mælaborð sem sýnir aukningu á innleiðingartíðni, styttingu biðraðar og áreiðanleika skanna án bilunar yfir uppsetningartímabilið',
          caption: 'Einn mánuður af gögnum: 60% aukning á notkun, styttri biðröð og viðhaldið fullkomnum áreiðanleika skanna',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Skoða Lærðu greinar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Tilviksrannsókn: Global Product Launch QR Campaign',
      paragraphs: ['Þetta dæmi fylgir raftækjafyrirtæki sem setur nýja vöru á markað samtímis á 12 mörkuðum á 8 tungumálum. Hvert svæðisbundið markaðsteymi þurfti að framleiða umbúðir, smásöluskjái og kynningarefni með QR kóða sem tengja við staðbundnar vörusíður. Fyrri kynningar höfðu leitt til ósamkvæmrar QR-stíls, einstaka bilana í skönnun og „símaleiks" þar sem hvert lið endurskapaði kóða úr skjámyndum.', 'Lausnin nýtti ANQR deilanlega stillingartengla til að koma á einum sannleiksuppsprettu sem hvert svæðishópur gæti nálgast, óháð tungumáli viðmótsins. QR farmurinn notaði snjalla tilvísun sem greindi notendatungumál, svo einn kóði virkaði á heimsvísu á meðan hann skilaði staðbundinni upplifun.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Heimskort sem sýnir 12 markaðsstaði með QR kóða, sumir í sjónrænu ósamræmi hver við annan',
          caption: 'Áskorunin: 12 markaðir, 8 tungumál og saga um ósamkvæmar QR útfærslur á milli svæða',
        },
      ],
    },
    {
      heading: 'Koma á Master Configuration',
      paragraphs: ['Hið alþjóðlega vörumerkjateymi bjó til viðurkennda QR-stillingu í ANQR: vörumerkislitir sem passa við sjónræna auðkenni vörulínunnar, Villuleiðrétting H fyrir áreiðanleika í öllum prentuðum og stafrænum forritum og stíl sem myndi endurskapa stöðugt óháð staðbundnum framleiðsluaðferðum. Stillingunni var læst og deilingartengillinn skráður í alþjóðlegri herferðarskýrslu.', 'Mikilvægt er að kóðuð vefslóð notaði tungumálagreiningarþjónustu. Þegar þeir voru skanaðir var notendum sjálfkrafa vísað á vörusíðu þeirra á staðbundnu tungumáli. Þetta þýddi að allir 12 markaðir gætu notað eins QR kóða - engin afbrigði á hverja markaði sem gætu valdið villum.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR viðmótið sem sýnir aðalstillingu með vörumerkjalitum, ECC H og snjallviðvísunarslóðinni',
          caption: 'Aðaluppsetningin: alþjóðlegir vörumerkjastaðlar umritaðir í eina sannleiksuppsprettu sem hægt er að deila',
        },
      ],
    },
    {
      heading: 'Verkflæði svæðishóps',
      paragraphs: ['Hvert svæðisbundið markaðsteymi fékk stillingartengilinn með einföldum leiðbeiningum: opnaðu hlekkinn, staðfestu að forskoðunin passi við vörumerkjaleiðbeiningarnar, flyttu út á tilskilið snið fyrir umsókn þína. ANQR viðmótið birtist á valnu tungumáli hvers liðs, en undirliggjandi QR stillingar héldust eins óháð tungumáli viðmótsins.', 'Þegar japanska teymið þurfti SVG fyrir hágæða smásöluskjái og brasilíska liðið þurfti PNG fyrir samfélagsmiðla, bæði flutt út úr sömu uppsetningu. Þegar prentsali þýska liðsins óskaði eftir sérstökum litagildum, gátu þeir vísað beint í uppsetninguna frekar en að giska á skjámynd.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Skjámyndir sem sýna sama stillingartengil opnuðust í japönsku, portúgölsku og þýsku viðmóti',
          caption: 'Sama uppsetning, mismunandi viðmót: svæðishópar vinna á því tungumáli sem þeir velja á meðan þeir halda alþjóðlegu samræmi',
        },
      ],
    },
    {
      heading: 'Meðhöndlun svæðisbundinna afbrigða',
      paragraphs: ['Sumir markaðir þurftu minniháttar aðlögun. Kínverska teymið þurfti útgáfu með WeChat-bjartsýni ramma fyrir félagslega deilingu. Í stað þess að breyta masternum, bjuggu þeir til skjalfest afbrigði með eigin stillingartengli, greinilega merkt sem „CN-WeChat afbrigði" í eignasafni herferðarinnar. Þetta héldi rekjanleika en leyfði nauðsynlega staðfærslu.', 'Vörumerkjateymið setti einfalda reglu: öll afbrigði frá meistara kröfðust nýs, skjalfestrar stillingartengils. Engar breytingar á útfluttum skrám, engar „fljótar lagfæringar" í hönnunarhugbúnaði. Þetta kom í veg fyrir stillingardrifið sem hafði hrjáð fyrri sjósetningar.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Viðmót eignasafns sem sýnir aðalstillingu og samþykkt svæðisbundin afbrigði, hvert með sinn tengil',
          caption: 'Eignastjórnun herferðar: aðalstillingar auk skjalfestra afbrigða, allt rekjanlegt í gegnum stillingartengla',
        },
      ],
    },
    {
      heading: 'Ræstu niðurstöður',
      paragraphs: ['Opnunardagur vörunnar sá að QR kóðar voru notaðir yfir umbúðir, smásöluskjái, viðburðaefni og stafrænar herferðir á öllum 12 mörkuðum samtímis. Gæðaúttektir staðfestu sjónrænt samræmi milli svæða - QR á smásöluskjám í Tókýó passaði við QR á São Paulo umbúðum passaði við QR á viðburðaborðum í Berlín.', 'Tilkynnt var um engin bilun í skönnun á mörkuðum. Þegar þörf var á að breyta vefslóð vörusíðunnar eftir að hún var opnuð, höndlaði tilvísunarþjónustan það á ósýnilegan hátt - engin endurprentun krafist. Alþjóðlega teymið áætlaði að stillingartengill nálgun sparaði 40+ klukkustundir af samhæfingartíma miðað við fyrri ræsingaraðferð þeirra.', 'Sjá Learn guide on cross-tungual QR-samstarf fyrir verkflæðisreglurnar að baki alþjóðlegri samkvæmni herferða.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Rið af ljósmyndum sem sýnir samfellda QR dreifingu á mismunandi mörkuðum: Tókýó smásölu, São Paulo umbúðir, Berlínarviðburðir',
          caption: 'Alheimssamkvæmni náð: eins QR kynning á 12 mörkuðum þrátt fyrir mismunandi tungumál, söluaðila og snið',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Skoða Lærðu greinar',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Skoða Lærðu greinar', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Opnaðu alla notendahandbókina', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Opnaðu galleríið', type: 'gallery' },
  ],
};
