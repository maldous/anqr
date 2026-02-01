import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Lærðu með ANQR',
  description: 'Hagnýtar, fyrst og fremst leiðbeiningar um að breyta QR kóða í alvöru markaðseignir - ekki bara hagnýt ferninga. Lærðu hvernig á að uppfæra eldri sölustaðakóða, búa til samhæft QR-merki fyrir greiðslur, undirbúa útflutning tilbúinn til prentunar, nota hreyfimyndir á öruggan hátt á stafrænum skjám og deila læstum stillingum milli fjöltyngda teyma með því að nota ANQR ("akkeri") tengla.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Opnaðu rafalann', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Opnaðu alla notendahandbókina', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Að bæta núverandi QR herferðir',
      paragraphs: ['Flest fyrirtæki eru með QR kóða dreifða um starfsemi sína - á matseðlum, afgreiðsluborðum, umbúðum og kynningarefni. Margir af þessum kóða voru búnir til fyrir mörgum árum síðan með grunnröðlum, sem leiddi til almennra svart-hvíta ferninga sem ekki hvetja til trausts eða passa við vörumerki þitt. Þessi ítarlega handbók leiðir þig í gegnum kerfisbundna nálgun við endurskoðun, uppfærslu og fínstillingu núverandi QR innviða án þess að trufla ferðaferðir viðskiptavina sem þú hefur þegar komið á fót.', 'Stefnumótandi kosturinn við að uppfæra frekar en að skipta um QR kóða liggur í því að varðveita samfellu. Viðskiptavinir þínir hafa þegar lært að búast við ákveðnum áfangastöðum þegar þeir skanna kóðana þína. Með því að halda kóðuðu vefslóðunum eins á meðan þú bætir sjónræna framsetningu, skanna áreiðanleika og röðun vörumerkja til muna, býrðu til óaðfinnanleg umskipti sem eykur traust án þess að þurfa að breyta stafrænu innviðum þínum eða greiningarrakningu.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Samanburður hlið við hlið sem sýnir falinn, almennan QR kóða við hlið nútíma vörumerkisútgáfu sem kóðar sömu vefslóð',
          caption: 'Fyrir og eftir: Sama áfangaslóð breytt úr dagsettum almennum kóða í faglega vörumerkjaeign',
        },
      ],
    },
    {
      heading: 'Af hverju eldri QR kóðar ganga illa',
      paragraphs: ['QR kóðar sem voru búnir til á fyrstu ættleiðingarstiginu - sérstaklega á árunum 2020-2021 þegar fyrirtæki flýttu sér að innleiða snertilausar lausnir - þjást oft af nokkrum mikilvægum vandamálum. Lítil villuleiðréttingarstillingar gera þær viðkvæmar þegar þær eru prentaðar á áferðarflöt eða skoðaðar undir krefjandi lýsingu. Ófullnægjandi hljóðlát svæði valda bilun í skönnun þegar kóðar eru settir nálægt öðrum sjónrænum þáttum. Almenn stíll kemur ekki á framfæri lögmæti vörumerkisins, sem leiðir til hik og lækkandi skannatíðni.', 'Fyrir utan tæknilegar takmarkanir tákna eldri kóðar oft glötuð vörumerkistækifæri. Sérhver QR kóða er snertipunktur við viðskiptavininn þinn - augnablik þar sem þeir eru virkir þátttakendur og tilbúnir til að grípa til aðgerða. Faglega stílaður kóði sem passar við vörumerkjalitina þína, inniheldur viðeigandi öryggismörk og inniheldur valfrjálsa vörumerkjaþætti sem breytir þessu tóli í markaðseign sem styrkir sjálfsmynd þína í hverri samskiptum.'],
    },
    {
      heading: 'Framkvæma QR kóða endurskoðun',
      paragraphs: ['Byrjaðu uppfærsluverkefnið þitt með því að búa til yfirgripsmikla skrá yfir hvern QR kóða sem er notaður í fyrirtækinu þínu. Skráðu staðsetninguna, kóðaðan áfangastað, núverandi ástand prentaðs efnis og dæmigert skannaumhverfi, þar með talið birtuskilyrði og sjónarhorn. Prófaðu hvern kóða með mörgum tækjum - eldri snjallsímar og lággjaldatæki sýna oft áreiðanleikavandamál sem hágæða símar hylja.', 'Gefðu sérstaka gaum að kóða á stöðum þar sem mikið er lagt upp úr: greiðslustöðum, innritunarsvæðum og kynningarskjám þar sem bilun í skönnun hefur bein áhrif á tekjur eða upplifun viðskiptavina. Þetta ætti að vera forgangsraðað fyrir tafarlausa uppfærslu. Athugaðu einnig kóða sem birtast í ljósmynda- eða myndbandaefni, þar sem þeir munu krefjast samhæfingar við markaðsteymi þitt til að uppfæra sjónrænar eignir.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Gátlistaviðmót sem sýnir QR endurskoðunarflokka: staðsetningu, ástand, skannaáreiðanleika og forgangseinkunn',
          caption: 'Kerfisbundið QR endurskoðunarsniðmát til að skrásetja og forgangsraða umsækjendum um uppfærslu',
        },
      ],
    },
    {
      heading: 'Örugg uppfærsla stefnan',
      paragraphs: ['Aðalreglan um QR uppfærslur er varðveisla áfangastaðar. Dragðu út nákvæma vefslóð úr hverjum kóða sem fyrir er og kóðaðu hann á sama hátt í nýju útgáfunni þinni. Þetta tryggir að allar núverandi greiningar, tilvísunarrökfræði og væntingar viðskiptavina haldist óbreytt. Ef þú þarft sveigjanleika á áfangastað fyrir framtíðaruppfærslur, þá er þetta kjörinn tími til að kynna stutta vefslóð með vörumerki eða tilvísunarþjónustu - en útfærðu þetta sem sérstakt verkefni til að forðast flóknar breytingar.', 'Fyrir sjónræna uppfærsluna skaltu beita endurbótum á lögum: Tryggðu fyrst tæknilegan áreiðanleika (viðeigandi villuleiðréttingu og hljóðlát svæði), bættu síðan við vörumerkjastíl (litum, einingarformum) og íhugaðu að lokum valfrjálsar endurbætur (miðjuyfirlag, rammar). Hvert lag ætti að vera staðfest með prófun áður en haldið er áfram. Öryggisstilling ANQR hjálpar til við að framfylgja þessum forgangsröðun með því að vara við þegar stílval gæti dregið úr skannanum.'],
    },
    {
      heading: 'Bæta við vörumerki án þess að skerða áreiðanleika',
      paragraphs: ['Árangursrík QR vörumerki jafnvægir sjónræn áhrif á móti áreiðanleika skanna. Byrjaðu með lit: skiptu út sjálfgefnum svörtum forgrunni fyrir aðal vörumerkjalitinn þinn, tryggðu nægjanlega birtuskil gegn bakgrunninum þínum. Fyrir flest vörumerki virka dökkir litir á ljósum bakgrunni best. Forðastu samsetningar með litlum birtuskilum, halla sem draga úr skýrleika brúna eða liti sem virðast svipaðir við algengar birtuskilyrði.', 'Aðlögun einingarforms býður upp á annað vörumerkistækifæri með lágmarksáreiðanleikaáhrifum. Ávalar einingar skapa mýkra, aðgengilegra útlit en viðhalda framúrskarandi skannanleika. Eining í punktastíl virka vel fyrir nútíma vörumerki sem eru framsækin í tækni. Tengdar einingar henta iðnaðar- eða fyrirtækjaeinkennum. Hvaða stíl sem þú velur, haltu stöðugleika í öllum QR dreifingum þínum fyrir tafarlausa vörumerkjaþekkingu.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Litahjólaskýringarmynd sem sýnir bestu QR litasamsetningar með vísbendingum um birtuskil',
          caption: 'Leiðbeiningar um litaval vörumerkis sem sýnir samsetningar með mikilli birtuskilum sem viðhalda áreiðanleika skönnunar',
        },
      ],
    },
    {
      heading: 'Prófunar- og staðfestingarbókun',
      paragraphs: ['Notaðu aldrei uppfærða QR kóða án strangra prófa. Prentaðu efnissönnun í nákvæmri stærð og á sama efni og lokauppsetningin þín. Prófaðu á raunverulegum stað þar sem kóðinn mun búa, á mismunandi tímum dags til að taka tillit til birtubreytinga. Notaðu að minnsta kosti þrjú mismunandi tæki: núverandi flaggskipssíma, miðlungstæki og eldri eða ódýran snjallsíma.', 'Skráðu skannatíma og árangurshlutfall fyrir hvert próf. Vel fínstilltur kóða ætti að skanna innan 1-2 sekúndna á hvaða sæmilega nútímalegu tæki sem er. Ef þú sérð stöðugar tafir eða bilanir skaltu draga úr stílstyrk - fjarlægðu eða minnkaðu yfirborð, stækkaðu hljóðlát svæði eða skiptu yfir í hærra villuleiðréttingarstig. Áreiðanleiki er alltaf ofar sjónrænni fágun.'],
    },
    {
      heading: 'Læsir stillingum þínum til að tryggja samræmi',
      paragraphs: ['Þegar þú hefur staðfest ákjósanlega stillingu skaltu varðveita hana með því að nota deilanlega tengla ANQR. Þetta skapar varanlega skrá yfir allar stillingar sem notaðar eru til að búa til samþykkta kóðann þinn - liti, einingastíl, villuleiðréttingu, stærð og allar yfirlögn. Deildu þessum hlekk með hönnunarteymi þínu, prentsöluaðilum og öllum sem gætu þurft að endurskapa kóðann í framtíðinni.', 'Þessi stillingalás kemur í veg fyrir hægfara niðurbrot sem hrjáir marga QR dreifingu. Án þess endurskapa starfsmenn kóða úr skjámyndum, hönnuðir endurbyggja stillingar úr minni og prentsali gera „gagnlegar" breytingar. Hver afbrigði kynnir hugsanleg vandamál. Með læstum stillingartengli er sérhver endurgerð eins og prófuð, samþykkta frumritið þitt.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Skýringarmynd sem sýnir stillingarferli: skjámyndir sem leiða til afþreyingar sem leiða til afbrigða, á móti einum uppspretta sannleika',
          caption: 'Komdu í veg fyrir breyting á stillingum með því að koma á fót einni viðurkenndri heimild fyrir allar QR endurgerð',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Skoðaðu QR dæmi',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR kóðar fyrir smásölugreiðslur',
      paragraphs: ['QR kóðar fyrir greiðslur starfa í krefjandi umhverfi í smásölu: augnabliki viðskipta. Viðskiptavinir eru tilbúnir að borga, oft myndast biðröð fyrir aftan þá og hver sekúnda seinkun skapar núning. Samt er þetta háþrýstings augnablik líka aðalfasteignir til að styrkja vörumerki. Þessi handbók útskýrir hvernig á að búa til QR-kóða fyrir greiðslur sem skanna samstundis í bankaforritum á sama tíma og sýna fagmannlegt vörumerki sem byggir upp traust viðskiptavina.', 'Grundvallarreglan fyrir greiðslu QR kóða er áreiðanleiki fram yfir fagurfræði. Fallega hannaður kóða sem tekst ekki að skanna á bankaforrit eins viðskiptavinar mun kosta þig miklu meira í yfirgefnum viðskiptum og svekktum viðskiptavinum en íhaldssöm hönnun hefur nokkurn tíma getað gert. Byrjaðu á samræmi, bættu við áreiðanleika, settu síðan vandlega inn vörumerki aðeins þar sem það skerðir ekki aðalhlutverkið.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Smásöluskjár sem sýnir QR-kóða fyrir greiðslu sem er skannaður af snjallsíma með bankaappi',
          caption: 'QR-kóðar fyrir greiðslur verða að virka samstundis með banka- og veskisöppum við raunverulegar móttökuskilyrði',
        },
      ],
    },
    {
      heading: 'Skilningur á greiðslu QR staðla',
      paragraphs: ['Greiðslu QR kóðar fylgja venjulega svæðisbundnum stöðlum sem segja til um snið farmsins. Í Singapúr notar PayNow QR sérstakt snið. Á Indlandi fylgja UPI kóðar BharatQR eða UPI djúptenglastöðlum. Evrópskar SEPA greiðslur nota EPC QR kóða. Hver staðall er til til að tryggja að bankaforrit geti samstundis þekkt og unnið úr greiðsluupplýsingunum. Að víkja frá þessum stöðlum - jafnvel lítillega - getur valdið því að greiðsluforrit hafna kóða sem almennir myndavélaskannarar lesa án vandræða.', 'ANQR inniheldur sniðmát fyrir helstu greiðslustaðla sem sjálfkrafa forsníða upplýsingar um söluaðila þína í samhæfðar hleðslur. Notaðu alltaf þessi sniðmát frekar en að smíða greiðslustrengi handvirkt, þar sem jafnvel minniháttar sniðvillur geta valdið mistökum í viðskiptum. Ef greiðslustaðall svæðisins þíns er ekki tiltækur sem sniðmát skaltu skoða tækniskjöl greiðsluveitunnar til að fá nákvæmar kröfur um snið.'],
    },
    {
      heading: 'Stærð og staðsetning fyrir afgreiðsluskjái',
      paragraphs: ['QR kóðar á borði standa frammi fyrir einstökum líkamlegum áskorunum. Viðskiptavinir skanna á armslengd, oft í horn, stundum í gegnum hnerravörn eða sýningarskápa. Loftlýsing skapar glampa. Kóðinn keppir við annað gegn ringulreið um athygli og skýrar sjónlínur. Stærðu greiðsluna þína QR ríkulega - Mælt er með að minnsta kosti 4-5 cm fyrir flestar afgreiðsluforrit, stækkað ef kóðinn situr á bak við gler eða á daufu upplýstu svæði.', 'Staða skiptir jafn miklu máli og stærð. Settu kóðann þar sem viðskiptavinir geta haldið símanum sínum á þægilegan hátt án þess að loka fyrir biðröðina eða ná óþægilega. Beindu skjánum að viðskiptavininum frekar en að leggja hann flatan. Ef mögulegt er skaltu nota matt lagskipt eða endurskinslaus skjáefni til að lágmarka glampa frá loftlýsingu. Prófaðu endanlega staðsetninguna á mismunandi tímum dags til að finna ljósvandamál.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Skýringarmynd sem sýnir bestu hæðir og horn QR-staðsetningar fyrir mismunandi teljarastillingar',
          caption: 'Leiðbeiningar um staðsetningar teljara: bestu hæðir, horn og fjarlægðir fyrir áreiðanlega greiðsluskönnun',
        },
      ],
    },
    {
      heading: 'Íhaldssamt vörumerki fyrir greiðslukóða',
      paragraphs: ['Greiðsluforrit eru minna fyrirgefandi en almennir myndavélaskannarar. Mörg bankaforrit nota eldri, einfaldari QR lestraralgrím sem eru fínstillt fyrir hraða frekar en sveigjanleika. Þetta þýðir að stíll sem virkar fullkomlega með myndavél símans gæti mistekist með sérstökum greiðsluforritum. Haltu vörumerkjum íhaldssamt: notaðu vörumerkjalitinn þinn í forgrunni ef hann heldur sterkum birtuskilum, en forðastu halla, þungar yfirlögn eða skreytingar sem gætu truflað greiningu.', 'Ef þú vilt miðja lógó eða yfirborð, hafðu það mjög lítið - ekki meira en 10-15% af QR-svæðinu - og prófaðu mikið með hverju greiðsluforriti sem viðskiptavinir þínir gætu notað. Mörg fyrirtæki velja enga yfirlagningu á greiðslukóða sérstaklega, og taka þann stíl fyrir markaðssetningu QR kóða þar sem áreiðanleikakröfur eru minna strangar. Hlutverk greiðslukóðans er að vinna úr færslum, ekki að heilla sjónrænt.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Samanburður sem sýnir ásættanlegt og áhættusamt vörumerki fyrir greiðslu QR kóða',
          caption: 'Greiðslu QR vörumerki: allt frá öruggri íhaldssamri stíl til áhættusamra skreytingaraðferða',
        },
      ],
    },
    {
      heading: 'Athugasemdir um efni og prentun',
      paragraphs: ['Líkamlega skjáefnið hefur veruleg áhrif á áreiðanleika skanna. Glansandi lagskipt endurvarpar ljósum beint inn í myndavél viðskiptavinarins. Áferðarefni geta raskað brúnir eininga. Ódýr prentun getur þokað smáatriðum. Fyrir greiðslu QR kóða, fjárfestu í gæðum: notaðu matta eða satín lagskipt, tryggðu prentun í hárri upplausn og skiptu um skjái áður en þeir sýna slit. Risinn eða dofinn greiðslukóði kostar þig færslur.', 'Íhugaðu endingu og útskiptanleika skjásins. Afgreiðsluskjáir verða snertir, hreyfðir, skvettir og einstaka sinnum hnekkt. Hannaðu skjákerfið þitt þannig að auðvelt sé að skipta um QR innleggið án þess að skipta um allan standinn. Hafðu aukaprentanir tilbúnar, búnar til úr læsta stillingartenglinum þínum, svo hægt sé að skipta um slitna kóða strax.'],
    },
    {
      heading: 'Prófanir með alvöru greiðsluforritum',
      paragraphs: ['Almennir myndavélaskannarar munu afkóða nánast hvaða QR kóða sem er á sanngjarnan hátt. Greiðsluforrit eru valmeiri. Áður en þú setur upp QR kóða fyrir greiðslu skaltu prófa hann með hverju greiðsluforriti sem viðskiptavinir þínir gætu notað. Í fjölgreiðsluumhverfi gæti þetta þýtt að prófa með mörgum bankaforritum, stafrænum veski og greiðslukerfum. Skjalaðu hvaða forrit þú hefur prófað og útgáfur þeirra - greiðsluforrit uppfærast oft og uppfærsla gæti breytt skönnunarhegðun.', 'Prófaðu við raunhæfar aðstæður: raunverulegur skjár, raunveruleg lýsing, raunveruleg skönnunarfjarlægð. Kóði sem skannar samstundis á skrifborðið þitt gæti átt í erfiðleikum með borðið klukkan 17:00 þegar síðdegissólin skapar glampa. Prófaðu með elsta, ódýrasta snjallsímanum sem þú getur fundið - ef hann virkar á áreiðanlegan hátt á lággjaldatæki mun hann virka á öllu. Merktu hvaða skannatíma sem er yfir 2 sekúndur fyrir rannsókn og hugsanlega endurhönnun.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Gátlisti fyrir prófun sem sýnir ýmis greiðsluforrit, gerðir tækja og umhverfisaðstæður til að sannreyna',
          caption: 'Alhliða QR prófunarfylki fyrir greiðslur sem nær yfir forrit, tæki og umhverfisþætti',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Skoðaðu QR dæmi',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Prentaðbúnir QR kóðar: SVG vs PNG',
      paragraphs: ['Munurinn á QR kóða sem skannar fullkomlega og þeim sem mistekst kemur oft niður á því hvernig hann var fluttur út og meðhöndlaður í prentverkflæðinu. Þessi handbók útskýrir mikilvæga greinarmun á vektor (SVG) og raster (PNG) sniðum, hvenær á að nota hvert og hvernig á að afhenda QR listaverk til hönnuða og prentsöluaðila á þann hátt sem varðveitir skanna áreiðanleika frá nafnspjöldum til auglýsingaskilta á stærð við skilti.', 'Prentframleiðsla kynnir breytur sem eru ekki til á skjánum: blekútbreiðslu, áferð undirlags, frágangsferli og uppsöfnuð áhrif margra skráabreytinga. QR-kóði sem lítur fullkomlega út í hönnunarhugbúnaðinum þínum getur komið út úr prentaranum með mýkuðum brúnum, minni birtuskilum eða lúmsklega brengluðum einingum. Skilningur á sniðvali og bestu starfsvenjum vinnuflæðis kemur í veg fyrir þessar þöglu bilanir.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Stækkuð sýn sem ber saman vektor QR einingar með skörpum brúnum á móti raster einingar sem sýna pixla gripi',
          caption: 'Vigur vs raster á prentkvarða: nákvæmnismunurinn sem ákvarðar áreiðanleika skanna',
        },
      ],
    },
    {
      heading: 'Hvers vegna Vector (SVG) er valinn til prentunar',
      paragraphs: ['SVG skrár lýsa QR kóða sem stærðfræðilegum formum frekar en pixlanetum. Þetta þýðir að hægt er að stækka kóðann í hvaða stærð sem er - allt frá 1 cm merkimiða til 10 metra borða - án þess að skerða brúnina. RIP (Raster Image Processor) prentarans gerir vektorana í upprunalegri upplausn úttakstækisins, sem tryggir að hver einingabrún sé eins skörp og vélbúnaðurinn leyfir. Það er engin innskot, engir gripir til hliðstæðna, engin uppsöfnuð óskýrleiki frá mörgum stærðaraðgerðum.', 'Fyrir utan sveigjanleika eru SVG skrár öflugri í faglegum vinnuflæði. Þeir lifa af hringferðir í gegnum hönnunarhugbúnað án niðurbrots. Hægt er að leiðrétta þau á litinn án þess að endursýna. Þeir fella hreint inn í PDF skrár fyrir pressutilbúið úttak. Fyrir öll prentforrit þar sem gæði skipta máli ætti SVG að vera sjálfgefið útflutningssnið þitt.'],
    },
    {
      heading: 'Þegar PNG er ásættanlegt',
      paragraphs: ['PNG verður nauðsynlegt þegar vinnuflæðið þitt eða áfangastaðurinn þinn styður ekki vektorsnið. Sumir vefpallar, merki CMS kerfi og eldri prentverkflæði krefjast rastermynda. Í þessum tilfellum getur PNG virkað vel - en aðeins ef þú fylgir ströngum reglum: Flyttu út í endanlegri stærð og upplausn, stækkaðu aldrei eftir útflutning og forðastu tapsþjöppun eða sniðbreytingu.', 'Mikilvæga reglan fyrir PNG er að reikna út nauðsynlegar pixlamál áður en þú flytur út. Ef QR-númerið þitt mun prenta á 5 cm og prentarinn þinn virkar á 300 DPI þarftu um það bil 590 pixla. Flyttu út í þessari stærð eða stærri, minnkaðu síðan ef þörf krefur - aldrei upp. Láttu þessar upplýsingar fylgja með skráarnafninu þínu eða lýsigögnum svo framtíðarnotendur misnoti ekki óvart stærðarsértækan útflutning.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Viðmót reiknivélar sem sýnir sambandið milli líkamlegrar stærðar, DPI og nauðsynlegra pixlavídda',
          caption: 'Reiknivél fyrir prentupplausn: ákvarðar lágmarksdílastærð fyrir markúttaksstærð þína',
        },
      ],
    },
    {
      heading: 'ANQR útflutningsvalkostir útskýrðir',
      paragraphs: ['ANQR býður upp á nokkrar SVG útflutningsstillingar til að henta mismunandi verkflæði. True Vector hamur framleiðir hreint úttak sem byggir á slóðum sem er tilvalið fyrir prentunar- og fagleg hönnunarverkfæri. Þegar þú hefur bætt við rasteryfirlögnum eða ákveðnum áhrifum getur ANQR fellt þetta inn á meðan þú heldur vektoreiningum við, eða þú getur flutt út fullkomlega rasteraða útgáfu með tilgreindri upplausn. Að skilja þessa valkosti hjálpar þér að velja réttan útflutning fyrir hvert notkunartilvik.', 'Fyrir PNG útflutning gerir ANQR þér kleift að tilgreina nákvæmar stærðir og inniheldur valkosti fyrir gagnsæjan bakgrunn. DPI stillingin hjálpar þér að reikna út viðeigandi stærðir fyrir prentun, þó mundu að DPI eru lýsigögn - það sem skiptir máli fyrir prentun er að hafa næga pixla fyrir þína líkamlegu stærð. Ef þú ert í vafa skaltu flytja út stærri en þú heldur að þú þurfir; Minnkun varðveitir gæði á meðan uppstækkun eyðileggur þau.'],
    },
    {
      heading: 'Undirbúa skrár fyrir afhendingu',
      paragraphs: ['Þegar þú sendir QR-listaverk til hönnuða eða prentsala skaltu hafa skýrar forskriftir: fyrirhugaða líkamlega stærð, lágmarkskröfur um hljóðlát svæði og hvers kyns litarými. Fyrir mikilvæg forrit, gefðu bæði SVG master og PNG öryggisafrit í hárri upplausn, greinilega merkt með fyrirhugaðri notkun þeirra. Láttu ANQR stillingartengilinn þinn fylgja með svo hægt sé að endurskapa kóðann ef þörf krefur.', 'Gerðu ráð fyrir algengum mistökum í afhendingarferlinu. Taktu beinlínis fram að QR ætti ekki að kvarða, snúa, skakka eða láta beita áhrifum. Tilgreindu að kyrrðarsvæðið verði að vera hreint - engin skurðarmerki, skráningarmerki eða hönnunarþættir truflast. Ef QR-númerið verður sett á litaðan eða ljósmyndabakgrunn, gefðu upp útgáfu með ógegnsættu bakslagi til að tryggja fullnægjandi birtuskil.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Skýringarmynd skráarpakka sem sýnir SVG master, PNG öryggisafrit, forskriftarskjal og stillingartengil',
          caption: 'Faglegur QR afhendingarpakki: allt sem hönnuður eða prentsali þarf fyrir nákvæma endurgerð',
        },
      ],
    },
    {
      heading: 'Staðfesta prentprófanir',
      paragraphs: ['Samþykktu aldrei prentun án þess að skanna líkamlega sönnun. Biðjið um sönnun sem prentuð er á raunverulegt undirlag með raunverulegum frágangi sem verður notaður í framleiðslu. Skannaðu sönnunina við birtuskilyrði svipað og þar sem lokahluturinn verður sýndur. Prófaðu með mörgum tækjum, þar á meðal eldri snjallsímum sem gætu átt í erfiðleikum með léleg gæði.', 'Ef sönnunin skannar hægt eða ósamræmi skaltu rannsaka áður en þú samþykkir. Algeng vandamál eru ófullnægjandi birtuskil á lituðu undirlagi, brot á kyrrlátu svæði frá klippingu, blekdreifingu mýkjandi kanta eða lagskipt sem skapar glampa. Hægt er að taka á einhverju af þessu áður en þú skuldbindur þig til fullrar prentunar - en aðeins ef þú nærð þeim á prófunarstigi.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Gátlisti fyrir sönnunarskoðun með niðurstöðum skannaprófa, birtuskilamælingum og samþykkisundirskriftum',
          caption: 'Verkflæði fyrir sannprófun prentunar: kerfisbundin prófun áður en þú skuldbindur þig til framleiðslumagns',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Skoðaðu QR dæmi',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Að búa til hreyfimyndir QR kóða',
      paragraphs: ['Hreyfimyndir QR kóðar sameina virkni staðlaðra QR kóða með áberandi hreyfingu sem eykur þátttökuhlutfall verulega. Í stafrænum merkingum, samfélagsmiðlum og gagnvirkum skjáum, breytir hreyfimynd kyrrstæðu tóli í sannfærandi sjónrænan þátt sem dregur augað og býður upp á samskipti. Þessi handbók fjallar um meginreglur, tækni og hagnýtar takmarkanir við að búa til hreyfimyndir af QR kóða sem skanna á áreiðanlegan hátt á meðan þeir hafa sjónræn áhrif.', 'Grundvallaráskorun hreyfimyndaðra QR kóða er að jafna sjónrænan áhuga á móti áreiðanleika skanna. Sérhver rammi verður að vera skannanlegur fyrir sig - skanni gæti fanga kóðann hvenær sem er í hreyfimyndinni. Þessi þvingun mótar hverja hönnunarákvörðun: hvaða þættir geta hreyft sig, hversu mikið þeir geta breyst og hvað verður að vera stöðugt í gegnum hreyfimyndina.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Stafræn skiltaskjár sem sýnir hreyfimyndaðan QR kóða sem fangar athygli áhorfenda í almenningsrými',
          caption: 'Hreyfimyndir QR kóðar í stafrænum skiltum: hreyfing sem vekur athygli og hvetur til skönnunar',
        },
      ],
    },
    {
      heading: 'Hvernig hreyfimynd hefur áhrif á skannanleika',
      paragraphs: ['QR skannar vinna með því að fanga einn ramma og greina mynstur ljósra og dökkra eininga. Til að teiknimyndakóði virki verður hver rammi að innihalda fullkomið, gilt QR mynstur. Þetta útilokar hreyfimyndir sem breyta kóðabyggingunni, leysa upp einingar eða breyta skuggamynstrinu verulega. Gagnaflutningseiningarnar - að því er virðist tilviljanakennda mynstrið í miðjunni - verða að vera sjónrænt stöðugt í gegn.', 'Öruggar hreyfimyndaaðferðir breyta þáttum sem bera ekki gögn: bakgrunn, liti, skrautramma og yfirborðsþætti. Byggingarhlutirnir - finnaarmynstur (stóru hornferningarnir), tímasetningarmynstur (víxllínurnar) og jöfnunarmynstur (minni ferninga í stærri kóða) - verða að viðhalda stöðum sínum og hlutföllum. Að vinna innan þessara takmarkana gerir enn kleift að gera furðu kraftmikla og grípandi hreyfimyndir.'],
    },
    {
      heading: 'Hreyfimyndatækni sem virkar',
      paragraphs: ['Litahjólreiðar lífga forgrunns- og bakgrunnslitina í gegnum litatöflu en viðhalda nægilegri birtuskilum í hverju skrefi. Þetta skapar lifandi, athyglisvekjandi áhrif með lágmarksáhættu á skanna - svo framarlega sem birtuskil fara aldrei niður fyrir læsileg mörk. Forstillingar fyrir litahring ANQR eru hannaðar til að viðhalda skannanleika í gegnum lotuna.', 'Hreyfimyndir setja hreyfimyndir á bak við hálfgegnsætt QR mynstur. Kóðinn er stöðugur á meðan bakgrunnurinn hreyfir sig - kannski lykkjuvídeó, hreyfimyndaþættir eða óhlutbundin hreyfigrafík. Þessi tækni krefst nákvæmrar styrkleikastjórnunar til að koma í veg fyrir að bakgrunnurinn yfirgnæfi QR mynstrið, en skapar sjónrænt áberandi niðurstöður.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Skýringarmynd sem sýnir lagskipt uppbyggingu hreyfimyndaðs QR: stöðugt kóðalag yfir líflegt bakgrunnslag',
          caption: 'Hreyfilagsregla: QR-mynstrið helst stöðugt á meðan bakgrunnsþættir lífga undir',
        },
      ],
    },
    {
      heading: 'Stilla hreyfimyndabreytur',
      paragraphs: ['Rammahraði hefur áhrif á bæði sjónræna sléttleika og skráarstærð. Fyrir flest forrit veita 10-15 rammar á sekúndu slétta hreyfingu án óhóflegrar skráarstærðar. Hærri rammatíðni býður upp á minnkandi sjónræna ávöxtun en eykur skráarstærð verulega. Íhugaðu samhengi við afhendingu - stórt stafrænt skilti getur séð um stærri skrár en staðsetning farsímaauglýsinga.', 'Lykkjuhegðun ákvarðar hvernig hreyfimyndin fer í hringrás. Óaðfinnanlegar lykkjur skapa samfellda hreyfingu sem er tilvalin fyrir merkingar og umhverfisskjái. Ping-pong (áfram-síða-aftur) lykkjur virka vel fyrir einfaldar hreyfimyndir. Fyrir athyglisvekjandi púls skaltu íhuga hreyfimyndir með biðum - kyrrðartímabil sem einkennast af hreyfingu sem dregur augað án stöðugrar þreytu í hreyfingum.'],
    },
    {
      heading: 'Að búa til hreyfimyndir',
      paragraphs: ['Þegar hreyfimyndir (GIF, hreyfimyndir eða myndskeið) eru notaðar sem yfirlög, dregur ANQR út ramma og setur þá saman með QR kóðanum þínum. Yfirlagsstyrksstillingin stjórnar hversu mikið af hreyfimyndinni kemur í gegn - lægri gildi forgangsraða skönnun á meðan hærri gildi stuðla að sjónrænum áhrifum. Prófaðu valinn styrkleika yfir marga ramma til að tryggja stöðugan skannanleika.', 'Gæði upprunaefnis hafa veruleg áhrif á niðurstöður. Notaðu yfirlög með skýrum myndefni og góðri birtuskil. Forðastu frummyndir með hröðum blikkandi eða miklum birtubreytingum sem gætu skapað einstaka ramma með litlum birtuskilum. Forskoðaðu alla hreyfimyndalotuna áður en þú flytur út til að ná vandræðum ramma sem gætu mistekist að skanna.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Ramma-fyrir-ramma mynd af hreyfimyndaðri yfirlögn sem sýnir birtuskil sem haldið er yfir röðina',
          caption: 'Rammagreining: að sannreyna stöðugan skannanleika yfir alla hreyfimyndalotuna',
        },
      ],
    },
    {
      heading: 'Útflutnings- og afhendingarsjónarmið',
      paragraphs: ['GIF er áfram útbreiddasta hreyfimyndasniðið og spilar sjálfkrafa í flestum samhengi án þess að þurfa stuðning við myndbandsspilara. Hins vegar takmarkar 256 lita palletta GIF litatrú. Fyrir litagagnrýnar hreyfimyndir skaltu íhuga hreyfimyndað WebP þar sem það er stutt, eða farðu aftur í myndbandssnið fyrir hæstu gæði. GIF útflutningur ANQR inniheldur valmöguleika til að hámarka gæði innan litatöflutakmarkana.', 'Skráarstærð skiptir máli fyrir afhendingu. Stafræn skiltakerfi, tölvupóstforrit og félagslegir vettvangar setja oft stærðartakmarkanir. Ef hreyfimyndin þín fer yfir þessi mörk skaltu draga úr fjölda ramma, víddum eða litadýpt. Stundum næst betri árangur með því að skipta flóknu hreyfimynd í styttri lykkju en árásargjarn þjöppun sem rýrir hvern ramma.'],
    },
    {
      heading: 'Prófa hreyfimyndir QR kóða',
      paragraphs: ['Til að prófa hreyfimyndakóða þarf að skanna á mörgum stöðum í hreyfilotunni. Ekki bara skanna einu sinni og gera ráð fyrir árangri - skannaðu endurtekið, á mismunandi augnablikum, til að ganga úr skugga um að hver rammi sé læsilegur. Gefðu sérstaka athygli að römmum við öfgar litahringsins eða álagstoppum þar sem birtuskil gætu verið minnst.', 'Prófaðu á raunverulegum skjábúnaði þar sem hægt er. Fylgstu með litakvörðun, sjónarhorni og umhverfislýsingu allt hafa áhrif á hvernig hreyfimyndin birtist og skannar. Björt hreyfimynd sem skannar fullkomlega á skjánum þínum gæti skolast út á skjá utandyra eða orðið ólæsilegt við skáhallt sjónarhorn.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Prófunarfylki sem sýnir árangurshlutfall skanna yfir mismunandi ramma, tæki og skjáaðstæður',
          caption: 'Hreyfimyndað QR prófunarsamskiptareglur: kerfisbundin sannprófun á römmum, tækjum og áhorfsskilyrðum',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Skoðaðu QR dæmi',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Bestu starfshættir fyrir öryggi og fylgni QR',
      paragraphs: ['Fallega hannaður QR-kóði sem tekst ekki að skanna er verri en gagnslaus - hann pirrar viðskiptavini, skemmir vörumerkjaskynjun og sóar hverri auðlind sem fjárfest er í gerð hans og dreifingu. Þessi handbók fjallar um tæknilega og hagnýta þætti sem ákvarða hvort QR kóða skanni á áreiðanlegan hátt og hvernig á að nota öryggiseiginleika ANQR til að ná hugsanlegum vandamálum áður en þau koma í framleiðslu.', 'Áreiðanleiki QR kóða er ekki tvöfaldur. Kóði gæti skannað fullkomlega á flaggskipssímum en mistakast á lággjaldatækjum. Það gæti virkað í fullkominni lýsingu en baráttu á daufum veitingastöðum eða björtu sólarljósi. Að skilja þá þætti sem hafa áhrif á skannanleika hjálpar þér að gera upplýsta skiptingu á milli sjónræns stíls og raunverulegs áreiðanleika.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Áreiðanleikaróf sem sýnir QR kóða, allt frá mjög skannanlegum til lítillega læsilegra',
          caption: 'Skannanleikarófið: allt frá skotheldum kóða til stíls sem ýtir áreiðanleikamörkum',
        },
      ],
    },
    {
      heading: 'Að skilja stig villuleiðréttingar',
      paragraphs: ['QR kóðar innihalda innbyggða offramboð sem gerir kleift að lesa þá jafnvel þegar þeir eru skemmdir að hluta eða huldir. Villuleiðréttingarstigið - L (7%), M (15%), Q (25%) eða H (30%) - ákvarðar hversu mikið af kóðanum getur vantað á meðan hann er enn að afkóða rétt. Meiri villuleiðrétting skapar stærri kóða en veitir öryggismörk fyrir yfirlögn, prentgalla og umhverfisskemmdir.', 'Fyrir kóða með myndayfirlögnum er villuleiðréttingarstig H nauðsynlegt - yfirborðið skyggir líkamlega á hluta kóðans og þú þarft þessi 30% offramboð til að viðhalda áreiðanleika. Fyrir hreina, óstílaða kóða í stýrðu umhverfi dugar stig M oft. Stig L ætti að vera frátekið fyrir aðstæður þar sem kóðastærð er mjög takmörkuð og þú getur tryggt óspilltar aðstæður.'],
    },
    {
      heading: 'The Critical Quiet Zone',
      paragraphs: ['Hljóða svæðið er auða spássían í kringum hvern QR kóða. Skannar nota þessi mörk til að bera kennsl á hvar kóðinn byrjar og endar. ISO staðallinn tilgreinir lágmarks hljóðlát svæði fjögurra eininga (fjórfalt breidd minnsta ferningsins í kóðanum). Að brjóta í bága við þetta rými - með hönnunarþáttum, snyrtum brúnum eða aðliggjandi efni - er ein algengasta orsök skönnunarbilunar.', 'Framfylgd hljóðláts svæðis ANQR hjálpar til við að viðhalda þessu mikilvæga bili, en þú verður líka að tryggja að það sé varðveitt í lokahönnun þinni. Þegar þú afhendir QR-listaverk skaltu tilgreina sérstaklega kröfur um hljóðlát svæði. Þegar kóðar eru settir í útlit skaltu ganga úr skugga um að engir þættir komist inn í þetta rými. Nokkrir millimetrar af lausu plássi geta þýtt muninn á áreiðanlegri skönnun og svekktum viðskiptavinum.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Skýringarmynd sem sýnir rétt bil á rólegu svæði á móti algengum brotum sem valda skannarbilunum',
          caption: 'Kröfur um hljóðlátt svæði: ósýnilega spássían sem ákvarðar árangur skönnunar',
        },
      ],
    },
    {
      heading: 'Andstæða og litaöryggi',
      paragraphs: ['QR skannar greina mynstur ljósra og dökkra eininga. Sérhver stíll sem dregur úr þessari birtuskilum - ljósum forgrunni, dökkum bakgrunni, hallaáhrifum eða yfirborði með litlum ógagnsæi - gerir kóðann erfiðari að lesa. ANQR reiknar út birtuskil og varar við þegar litaval þitt nálgast hættulegt stig, en lokaúrskurðurinn er alltaf raunverulegur prófun.', 'Litaskynjun er mismunandi eftir birtuskilyrðum. Litasamsetning sem virðist vera með mikilli birtuskil á skjánum þínum gæti orðið erfitt að greina undir heitri glóperulýsingu eða köldum flúrrörum. Ef kóðinn þinn verður notaður við mismunandi birtuskilyrði skaltu prófa undir mörgum ljósgjöfum og íhuga íhaldssamari skuggahlutföll sem öryggismörk.'],
    },
    {
      heading: 'Stærð eininga og útsýnisfjarlægð',
      paragraphs: ['Líkamleg stærð einstakra eininga ákvarðar hámarksfjarlægð sem hægt er að skanna kóða úr. Minni einingar þýða smærri kóða en krefjast nánari skönnunarvegalengda. Almenna reglan er sú að hver eining ætti að vera að minnsta kosti 0,5 mm á fyrirhugaðri skönnunarfjarlægð, skala upp hlutfallslega fyrir lengri vegalengdir. Kóði á auglýsingaskilti þarf miklu stærri einingar en kóða á nafnspjaldi.', 'Þegar einingastærð er reiknuð út skaltu íhuga versta tilfelli: viðskiptavinurinn með eldri síma, í ófullkominni lýsingu, skannar í mestu líklegri fjarlægð. Hannaðu fyrir þennan notanda og allir aðrir munu fá enn betri upplifun. Stærðarráðleggingar ANQR taka þátt í þessum raunverulegu breytum til að stinga upp á viðeigandi stærðum fyrir fyrirhugaða notkun.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Myndrit sem tengir stærð eininga, prentstærð og hámarks skilvirka skannafjarlægð',
          caption: 'Leiðbeiningar um skannaðarfjarlægð: passa stærð eininga við uppsetningarkröfur þínar',
        },
      ],
    },
    {
      heading: 'Að nota ANQR öryggisstillingu',
      paragraphs: ['Öryggisstilling ANQR veitir rauntíma endurgjöf um áreiðanleika skanna. Það fylgist með birtuskilhlutföllum, samræmi við hljóðlát svæði, yfirlagsstyrk og aðra þætti sem hafa áhrif á skannanleika. Þegar einhver færibreyta nálgast áhættustig muntu sjá viðvaranir með sérstökum leiðbeiningum um hvernig á að bæta áreiðanleika. Fyrir faglega dreifingu þar sem bilun er dýr, haltu öryggisstillingu virkum í gegnum hönnunarferlið.', 'Öryggisstilling inniheldur einnig skannastaðfestingareiginleika sem reynir að afkóða kóðann þinn og tilkynnir um árangur eða mistök. Þó að þessi sannprófun í forriti geti ekki endurtekið hvert raunverulegt ástand, grípur hún mörg algeng vandamál áður en þú fjárfestir í prentun eða dreifingu. Líttu á árangursríka sannprófun sem lágmarksmörk, ekki trygging - raunveruleikapróf eru enn nauðsynleg.'],
    },
    {
      heading: 'Prófunarreglur í raunheimum',
      paragraphs: ['Ekkert magn af hugbúnaðarsannprófun kemur í stað líkamlegra prófana. Prentaðu kóðann þinn í fyrirhugaðri stærð á dæmigert efni. Prófaðu það í raunverulegu dreifingarumhverfi með birtuskilyrðum sem passa við raunverulega notkun. Skannaðu með mörgum tækjum - ekki bara flaggskipssímanum þínum, heldur ódýrum Android tækjum, eldri iPhone og sértækum tækjum sem áhorfendur þínir nota venjulega.', 'Skráðu prófin þín kerfisbundið. Skráðu hvaða tæki voru prófuð, við hvaða aðstæður, með hvaða árangri. Ef þú ert að nota kóða í mælikvarða skaltu setja samþykkisviðmið: kannski 95% árangur í prófunarhópnum þínum eða árangursríkar skannar innan 2 sekúndna á öllum prófuðum tækjum. Þessir staðlar hjálpa til við að gera ákvarðanir um að fara eða ekki fara hlutlægar frekar en að vona það besta.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Alhliða prófunargátlisti sem nær yfir tæki, skilyrði og viðurkenningarviðmið',
          caption: 'Prófunarreglur um dreifingu QR: kerfisbundin sannprófun fyrir framleiðsluskuldbindingu',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Opnaðu rafalann',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Skoðaðu QR dæmi',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Opnaðu alla notendahandbókina', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Opnaðu galleríið', type: 'gallery' },
  ],
};
