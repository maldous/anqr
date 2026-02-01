import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Leer met ANQR',
  description: 'Praktiese, besigheids-eerste gidse om QR-kodes in regte bemarkingsbates te omskep - nie net funksionele vierkante nie. Leer hoe om verouderde verkoopspuntkodes op te gradeer, voldoenende betalings-QR-tekens te skep, drukgereed uitvoere voor te berei, animasie veilig op digitale skerms te gebruik, en toegesluite konfigurasies oor veeltalige spanne te deel deur ANQR ("anker")-skakels te gebruik.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Maak die kragopwekker oop', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Maak die volledige gebruikersgids oop', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Verbetering van bestaande QR-veldtogte',
      paragraphs: ['Die meeste besighede het QR-kodes wat oor hul bedrywighede versprei is - op spyskaarte, toonbanke, verpakking en promosiemateriaal. Baie van hierdie kodes is jare gelede geskep met basiese kragopwekkers, wat gelei het tot generiese swart-en-wit blokkies wat nie vertroue inboesem of by jou handelsmerkidentiteit pas nie. Hierdie omvattende gids lei jou deur \'n sistematiese benadering tot ouditering, opgradering en optimalisering van jou bestaande QR-infrastruktuur sonder om die klantreise wat jy reeds gevestig het, te ontwrig.', 'Die strategiese voordeel van opgradering eerder as om jou QR-kodes te vervang, lê in die behoud van kontinuïteit. Jou klante het reeds geleer om sekere bestemmings te verwag wanneer hulle jou kodes skandeer. Deur die geënkodeerde URL\'s identies te hou terwyl die visuele aanbieding, skanderingsbetroubaarheid en handelsmerkbelyning dramaties verbeter word, skep jy \'n naatlose oorgang wat vertroue verbeter sonder dat enige veranderinge aan jou digitale infrastruktuur of ontledingsnasporing nodig is.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: '\'n Sy-aan-sy-vergelyking wat \'n vervaagde, generiese QR-kode langs \'n moderne handelsmerkweergawe wys wat dieselfde URL enkodeer',
          caption: 'Voor en na: Dieselfde bestemmings-URL is van \'n gedateerde generiese kode na \'n professionele handelsmerkbate verander',
        },
      ],
    },
    {
      heading: 'Waarom verouderde QR-kodes onderpresteer',
      paragraphs: ['QR-kodes wat tydens die vroeë aanvaardingsfase geskep is - veral gedurende 2020-2021 toe besighede gehaas het om kontaklose oplossings te implementeer - ly dikwels aan verskeie kritieke probleme. Lae foutkorreksie-instellings maak hulle broos wanneer dit op tekstuuroppervlakke gedruk word of onder uitdagende beligting bekyk word. Onvoldoende stil sones veroorsaak skanderingsfoute wanneer kodes naby ander visuele elemente geplaas word. Generiese stilering kommunikeer nie handelsmerk-legitimiteit nie, wat lei tot huiwering en verminderde skanderingsyfers.', 'Behalwe vir tegniese beperkings, verteenwoordig erfeniskodes dikwels gemiste handelsmerkgeleenthede. Elke QR-kode is \'n raakpunt met jou kliënt - \'n oomblik waar hulle aktief betrokke is en bereid is om op te tree. \'n Professioneel-gestileerde kode wat by jou handelsmerkkleure pas, toepaslike veiligheidsmarges insluit, en opsionele handelsmerkelemente bevat, verander hierdie nutsding in \'n bemarkingsbate wat jou identiteit by elke interaksie versterk.'],
    },
    {
      heading: 'Voer \'n QR-kode-oudit uit',
      paragraphs: ['Begin jou opgraderingsprojek deur \'n omvattende inventaris te skep van elke QR-kode wat tans in jou besigheid ontplooi word. Dokumenteer die fisiese ligging, die geënkodeerde bestemming, die huidige toestand van die gedrukte materiaal, en die tipiese skandering-omgewing insluitend beligtingstoestande en kykhoeke. Toets elke kode met veelvuldige toestelle – ouer slimfone en begrotingstoestelle openbaar dikwels betroubaarheidskwessies wat premiumfone verberg.', 'Gee veral aandag aan kodes in hoë-insette-liggings: betaalpunte, aanmeldareas en promosie-uitstallings waar skanderingsmislukking direk inkomste of klantervaring beïnvloed. Dit moet geprioritiseer word vir onmiddellike opgradering. Let ook op kodes wat in fotografie- of video-inhoud verskyn, aangesien dit koördinering met jou bemarkingspan sal vereis om visuele bates op te dateer.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: '\'n Kontrolelys-koppelvlak wat QR-ouditkategorieë wys: ligging, toestand, skanderingsbetroubaarheid en prioriteitgradering',
          caption: 'Sistematiese QR-ouditsjabloon vir die dokumentasie en prioritisering van u opgraderingskandidate',
        },
      ],
    },
    {
      heading: 'Die veilige opgraderingstrategie',
      paragraphs: ['Die kardinale reël van QR-opgraderings is bestemmingsbewaring. Onttrek die presiese URL uit elke bestaande kode en enkodeer dit identies in jou nuwe weergawe. Dit verseker dat alle bestaande ontledings, herleidingslogika en kliëntverwagtinge ongeskonde bly. As jy bestemmingsbuigsaamheid vir toekomstige opdaterings benodig, is dit die ideale tyd om \'n handelsmerk-kort URL of herleidingdiens bekend te stel - maar implementeer dit as \'n aparte projek om saamgestelde veranderinge te vermy.', 'Pas verbeterings in lae toe vir die visuele opgradering: verseker eers tegniese betroubaarheid (toepaslike foutkorreksie en stil sone), voeg dan handelsmerkstilering (kleure, modulevorms) by en oorweeg laastens opsionele verbeterings (middeloorlegsels, rame). Elke laag moet deur toetsing bekragtig word voordat u voortgaan. ANQR se Veiligheidsmodus help om hierdie prioriteite af te dwing deur te waarsku wanneer stileringkeuses skandeerbaarheid kan benadeel.'],
    },
    {
      heading: 'Voeg handelsmerkidentiteit by sonder om betroubaarheid in te boet',
      paragraphs: ['Effektiewe QR-handelsmerk balanseer visuele impak teen skanderingsbetroubaarheid. Begin met kleur: vervang die verstek swart voorgrond met jou primêre handelsmerkkleur, om genoeg kontras teen jou agtergrond te verseker. Vir die meeste handelsmerke werk donker kleure op ligte agtergronde die beste. Vermy lae-kontras kombinasies, gradiënte wat randhelderheid verminder, of kleure wat soortgelyk lyk onder algemene beligtingstoestande.', 'Modulevormaanpassing bied nog \'n handelsmerkgeleentheid met minimale betroubaarheidsimpak. Afgeronde modules skep \'n sagter, meer toeganklike voorkoms terwyl dit uitstekende skandeerbaarheid behou. Dot-styl modules werk goed vir moderne, tegnologie-voorwaartse handelsmerke. Gekoppelde modules pas by industriële of korporatiewe identiteite. Watter styl jy ook al kies, handhaaf konsekwentheid oor al jou QR-ontplooiings vir onmiddellike handelsmerkherkenning.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: '\'n Kleurwieldiagram wat optimale QR-kleurkombinasies met kontrasverhouding-aanwysers toon',
          caption: 'Handelsmerkkleurkeusegids wat hoëkontraskombinasies toon wat skanderingsbetroubaarheid handhaaf',
        },
      ],
    },
    {
      heading: 'Toets en Validasie Protokol',
      paragraphs: ['Moet nooit opgegradeerde QR-kodes ontplooi sonder streng toetsing nie. Druk \'n fisiese bewys op die presiese grootte en op dieselfde materiaal as jou finale ontplooiing. Toets op die werklike plek waar die kode sal woon, op verskillende tye van die dag om rekening te hou met beligtingsvariasies. Gebruik ten minste drie verskillende toestelle: \'n huidige vlagskipfoon, \'n middelslagtoestel en \'n ouer of begrotingslimfoon.', 'Teken skanderingtye en sukseskoerse vir elke toets aan. \'n Goed geoptimaliseerde kode behoort binne 1-2 sekondes op enige redelik moderne toestel te skandeer. As jy konsekwente vertragings of mislukkings sien, verminder stileringsintensiteit - verwyder of krimp oorlegsels, vergroot die stiltesonegrootte, of skakel oor na \'n hoër foutkorreksievlak. Betroubaarheid geniet altyd voorrang bo visuele sofistikasie.'],
    },
    {
      heading: 'Sluit jou konfigurasie vir konsekwentheid',
      paragraphs: ['Sodra jy \'n optimale konfigurasie bekragtig het, bewaar dit met ANQR se deelbare skakels. Dit skep \'n permanente rekord van elke instelling wat gebruik word om jou goedgekeurde kode te genereer - kleure, modulestyl, foutkorreksie, grootte en enige oorlegsels. Deel hierdie skakel met jou ontwerpspan, drukverkopers en enigiemand wat dalk die kode in die toekoms moet reproduseer.', 'Hierdie konfigurasie-slot voorkom die geleidelike agteruitgang wat baie QR-ontplooiings teister. Daarsonder herskep personeellede kodes vanaf skermkiekies, ontwerpers herbou instellings uit die geheue, en drukverkopers maak \'nuttige\' aanpassings. Elke variasie stel potensiële probleme bekend. Met \'n geslote konfigurasieskakel is elke reproduksie identies aan jou getoetste, goedgekeurde oorspronklike.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: '\'n Diagram wat konfigurasieverdryf toon: skermkiekies wat lei tot ontspannings wat tot variante lei, teenoor \'n enkele bron-van-waarheid-skakel',
          caption: 'Voorkom konfigurasieverskuiwing deur \'n enkele gesaghebbende bron vir alle QR-reproduksies te vestig',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Kyk na QR-voorbeelde',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR-kodes vir kleinhandelbetalings',
      paragraphs: ['QR-kodes vir betaling werk in die mees veeleisende omgewing in die kleinhandel: die oomblik van transaksie. Kliënte is gereed om te betaal, dikwels met \'n tou wat agter hulle vorm, en elke sekonde van vertraging skep wrywing. Tog is hierdie hoëdruk-oomblik ook uitstekende eiendom vir handelsmerkversterking. Hierdie gids verduidelik hoe om QR-kodes vir betaling te skep wat onmiddellik op banktoepassings skandeer, terwyl dit steeds \'n professionele handelsmerkvoorkoms bied wat klantvertroue bou.', 'Die fundamentele beginsel vir betaling QR-kodes is betroubaarheid bo estetika. \'n Pragtig ontwerpte kode wat nie op een kliënt se banktoepassing skandeer nie, sal jou baie meer kos in verlate transaksies en gefrustreerde kliënte as wat \'n konserwatiewe ontwerp ooit kon doen. Begin met voldoening, voeg betroubaarheid by en plaas dan die handelsmerk versigtig in net waar dit nie die primêre funksie in die gedrang bring nie.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: '\'n Kleinhandeltoonbankskerm wat \'n QR-kode vir betaling wys wat deur \'n slimfoon met \'n banktoepassing geskandeer word',
          caption: 'QR-kodes vir betaling moet onmiddellik met bank- en beursie-toepassings werk onder werklike toonbanktoestande',
        },
      ],
    },
    {
      heading: 'Verstaan betalings QR-standaarde',
      paragraphs: ['Betaling QR-kodes volg tipies streekstandaarde wat die loonvragformaat dikteer. In Singapoer gebruik PayNow QR spesifieke formatering. In Indië volg UPI-kodes BharatQR- of UPI-diepskakelstandaarde. Europese SEPA-betalings gebruik EPC QR-kodes. Elke standaard bestaan ​​om te verseker dat banktoepassings die betalinginligting onmiddellik kan herken en verwerk. Om van hierdie standaarde af te wyk - selfs effens - kan veroorsaak dat betaalprogramme kodes wat generiese kameraskandeerders lees sonder probleme verwerp.', 'ANQR bevat sjablone vir belangrike betalingstandaarde wat jou handelaarbesonderhede outomaties formateer in voldoenende loonvragte. Gebruik altyd hierdie sjablone eerder as om betalingstringe met die hand te konstrueer, aangesien selfs geringe formateringsfoute transaksiemislukkings kan veroorsaak. As jou streek se betalingstandaard nie as \'n sjabloon beskikbaar is nie, raadpleeg jou betalingsverskaffer se tegniese dokumentasie vir presiese formateringvereistes.'],
    },
    {
      heading: 'Grootte en plasing vir toonbankskerms',
      paragraphs: ['Counter-top QR-kodes staar unieke fisieke uitdagings in die gesig. Kliënte skandeer op armlengte, dikwels teen \'n hoek, soms deur niesskerms of vertoonkaste. Oorhoofse beligting skep glanskolle. Die kode ding mee met ander toonbankrommel vir aandag en duidelike siglyne. Grootte jou betaling QR mildelik - \'n minimum van 4-5cm word aanbeveel vir die meeste toonbanktoepassings, opskaal as die kode agter glas of in \'n dowwe verligte area sit.', 'Posisie maak soveel saak as grootte. Plaas die kode waar kliënte gemaklik hul foon kan vashou sonder om die tou te blokkeer of ongemaklik te reik. Kantel die skerm na die kliënt eerder as om dit plat te lê. Indien moontlik, gebruik mat laminering of nie-reflektiewe vertoonmateriaal om glans van oorhoofse beligting te verminder. Toets die finale plasing op verskillende tye van die dag om beligtingsprobleme op te spoor.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: '\'n Diagram wat optimale QR-plasingshoogtes en -hoeke vir verskillende toonbankkonfigurasies toon',
          caption: 'Toonbankplasingsgids: optimale hoogtes, hoeke en afstande vir betroubare betalingskandering',
        },
      ],
    },
    {
      heading: 'Konserwatiewe handelsmerk vir betalingskodes',
      paragraphs: ['Betaalprogramme is minder vergewensgesind as generiese kameraskandeerders. Baie banktoepassings gebruik ouer, eenvoudiger QR-leesalgoritmes wat geoptimaliseer is vir spoed eerder as buigsaamheid. Dit beteken stilering wat perfek met \'n foonkamera werk, kan misluk met spesifieke betaaltoepassings. Hou handelsmerk konserwatief: gebruik jou handelsmerkkleur vir die voorgrond as dit sterk kontras behou, maar vermy gradiënte, swaar oorlegsels of dekoratiewe elemente wat met herkenning kan inmeng.', 'As jy \'n sentrumlogo of oorleg wil hê, hou dit uiters klein - nie meer as 10-15% van die QR-area nie - en toets breedvoerig met elke betaaltoepassing wat jou kliënte dalk gebruik. Baie besighede kies vir geen oorlegging op betalingskodes spesifiek nie, en behou daardie stilering vir bemarking van QR-kodes waar betroubaarheidsvereistes minder streng is. Die betalingskode se taak is om transaksies te verwerk, nie om visueel te beïndruk nie.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: '\'n Vergelyking wat aanvaarbare teenoor riskante handelsmerkvlakke vir betalings QR-kodes toon',
          caption: 'Betaling QR-handelsmerkspektrum: van veilige konserwatiewe stilering tot riskante dekoratiewe benaderings',
        },
      ],
    },
    {
      heading: 'Materiaal- en drukoorwegings',
      paragraphs: ['Die fisiese vertoonmateriaal beïnvloed skanderingsbetroubaarheid aansienlik. Glanslaminering reflekteer oorhoofse ligte direk in die kliënt se kamera. Gestruktureerde materiale kan modulerande vervorm. Goedkoop drukwerk kan fyn besonderhede vervaag. Vir betaling QR-kodes, belê in kwaliteit: gebruik mat- of satynlaminering, verseker hoë-resolusie-drukwerk en vervang skerms voordat dit slytasie toon. \'n Gekrapte of verbleikte betaalkode kos jou transaksies.', 'Oorweeg die vertoning se duursaamheid en vervangbaarheid. Toonbankskerms word aangeraak, geskuif, gespat en soms omgestamp. Ontwerp jou vertoonstelsel sodat die QR-insetsel maklik vervang kan word sonder om die hele staander te vervang. Hou spaarafdrukke gereed, gegenereer vanaf jou geslote konfigurasieskakel, sodat verslete kodes onmiddellik omgeruil kan word.'],
    },
    {
      heading: 'Toets met regte betaaltoepassings',
      paragraphs: ['Generiese kameraskandeerders sal byna enige redelik geformateerde QR-kode dekodeer. Betaalprogramme is kieskeuriger. Voordat u enige QR-kode vir betaling ontplooi, toets dit met elke betaaltoepassing wat u kliënte mag gebruik. In multi-betaling omgewings, kan dit beteken toetsing met verskeie bank programme, digitale beursies, en betaal platforms. Dokumenteer watter programme jy getoets het en hul weergawes - betaalprogramme werk gereeld op, en \'n opdatering kan skanderinggedrag verander.', 'Toets onder realistiese toestande: die werklike vertoning, werklike beligting, werklike skanderingsafstand. \'n Kode wat onmiddellik op jou lessenaar skandeer, kan dalk om 17:00 op die toonbank sukkel wanneer die middagson glans skep. Toets met die oudste, goedkoopste slimfoon wat jy kan kry – as dit betroubaar op \'n begrotingstoestel werk, sal dit op alles werk. Vlag enige skanderingstyd oor 2 sekondes vir ondersoek en moontlike herontwerp.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: '\'n Toetskontrolelys wat verskeie betaaltoepassings, toesteltipes en omgewingstoestande wys om te verifieer',
          caption: 'Omvattende betalings QR-toetsmatriks wat toepassings, toestelle en omgewingsfaktore dek',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Kyk na QR-voorbeelde',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Drukgereed QR-kodes: SVG vs PNG',
      paragraphs: ['Die verskil tussen \'n QR-kode wat perfek skandeer en een wat misluk, kom dikwels neer op hoe dit in die drukwerkvloei uitgevoer en hanteer is. Hierdie gids verduidelik die kritieke onderskeid tussen vektor- (SVG) en raster- (PNG)-formate, wanneer om elkeen te gebruik, en hoe om QR-kunswerk aan ontwerpers en drukverkopers te oorhandig op maniere wat skanderingsbetroubaarheid van besigheidskaartjies tot advertensiebord-grootte naamborde behou.', 'Drukproduksie stel veranderlikes bekend wat nie op die skerm bestaan nie: inkverspreiding, substraattekstuur, afwerkingsprosesse en die kumulatiewe effek van veelvuldige lêeromskakelings. \'n QR-kode wat perfek lyk in jou ontwerpsagteware kan uit die drukker verskyn met sagte rande, verminderde kontras of subtiel verwronge modules. Om die beste praktyke van formaatkeuse en werkvloei te verstaan, voorkom hierdie stille mislukkings.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: '\'n Vergrote aansig wat vektor QR-modules met skerp kante vergelyk teenoor rastermodules wat pixel-artefakte toon',
          caption: 'Vektor vs raster op drukskaal: die presisieverskil wat skanderingsbetroubaarheid bepaal',
        },
      ],
    },
    {
      heading: 'Waarom Vector (SVG) verkies word vir druk',
      paragraphs: ['SVG-lêers beskryf QR-kodes as wiskundige vorms eerder as roosters van pixels. Dit beteken die kode kan na enige grootte geskaal word - van \'n 1 cm-etiket tot \'n 10-meter-banier - sonder enige verlies aan randskerpte. Die drukker se RIP (Raster Image Processor) gee die vektore teen die uitsettoestel se oorspronklike resolusie weer, om te verseker dat elke modulerand so skerp is as wat die hardeware dit toelaat. Daar is geen interpolasie, geen anti-aliasing artefakte, geen opgehoopte vervaag van veelvuldige grootte bewerkings nie.', 'Behalwe vir skaalbaarheid, is SVG-lêers meer robuust in professionele werkvloeie. Hulle oorleef heen- en terugreise deur ontwerpsagteware sonder agteruitgang. Hulle kan kleurgekorrigeer word sonder om te hermonster. Hulle sluit skoon in PDF-lêers in vir drukgereed-uitvoer. Vir enige druktoepassing waar kwaliteit belangrik is, moet SVG jou verstek uitvoerformaat wees.'],
    },
    {
      heading: 'Wanneer PNG aanvaarbaar is',
      paragraphs: ['PNG word nodig wanneer jou werkvloei of bestemmingsplatform nie vektorformate ondersteun nie. Sommige webplatforms, CMS-stelsels vir naamborde en verouderde drukwerkvloeie vereis rasterbeelde. In hierdie gevalle kan PNG goed werk - maar slegs as jy streng reëls volg: voer uit teen die finale fisiese grootte en resolusie, skaal nooit op na uitvoer nie, en vermy enige kompressie of formaatomskakeling met verlies.', 'Die kritieke reël vir PNG is om jou vereiste pixel afmetings te bereken voor uitvoer. As jou QR teen 5 cm sal druk en jou drukker werk teen 300 DPI, benodig jy ongeveer 590 pieksels. Voer uit teen hierdie grootte of groter uit, skaal dan af indien nodig - nooit op nie. Sluit hierdie inligting by jou lêernaam of metadata in sodat toekomstige gebruikers nie per ongeluk \'n grootte-spesifieke uitvoer misbruik nie.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: '\'n Sakrekenaar-koppelvlak wat die verwantskap tussen fisiese grootte, DPI en vereiste pixelafmetings toon',
          caption: 'Druk resolusie sakrekenaar: die bepaling van die minimum pixel afmetings vir jou teiken uitset grootte',
        },
      ],
    },
    {
      heading: 'ANQR-uitvoeropsies verduidelik',
      paragraphs: ['ANQR bied verskeie SVG-uitvoermodusse om by verskillende werkstrome te pas. True Vector-modus produseer suiwer padgebaseerde uitset wat ideaal is vir druk- en professionele ontwerpgereedskap. Wanneer jy raster-oorlegsels of sekere effekte bygevoeg het, kan ANQR dit insluit terwyl jy vektormodules behou, of jy kan \'n volledig gerasterde weergawe uitvoer teen jou gespesifiseerde resolusie. Om hierdie opsies te verstaan, help jou om die regte uitvoer vir elke gebruiksgeval te kies.', 'Vir PNG-uitvoere, laat ANQR jou presiese afmetings spesifiseer en sluit opsies vir deursigtige agtergronde in. Die DPI-instelling help jou om gepaste groottes vir drukwerk te bereken, maar onthou dat DPI metadata is - wat saak maak vir druk, is om genoeg pixels vir jou fisiese grootte te hê. As jy twyfel, voer groter uit as wat jy dink jy nodig het; afskaling behou kwaliteit terwyl opskaling dit vernietig.'],
    },
    {
      heading: 'Berei lêers voor vir oorhandiging',
      paragraphs: ['Wanneer QR-kunswerk aan ontwerpers of drukverkopers deurgegee word, sluit duidelike spesifikasies in: die beoogde fisiese grootte, minimum stilsonevereistes en enige kleurruimte-oorwegings. Vir kritieke toepassings, verskaf beide \'n SVG-meester en \'n hoë-resolusie PNG-rugsteun, duidelik gemerk met hul beoogde gebruike. Sluit jou ANQR-konfigurasieskakel in sodat die kode hergenereer kan word indien nodig.', 'Verwag algemene foute in die oorhandigingsproses. Sê uitdruklik dat die QR nie geskaal, geroteer, skeefgetrek of effekte toegepas moet word nie. Spesifiseer dat die stil sone duidelik moet bly - geen snymerke, registrasiemerke of ontwerpelemente wat indring nie. As die QR op \'n gekleurde of fotografiese agtergrond geplaas sal word, verskaf \'n weergawe met \'n ondeursigtige rugvorm om voldoende kontras te verseker.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: '\'n Lêerpakketdiagram wat SVG-meester, PNG-rugsteun, spesifikasiedokument en konfigurasieskakel toon',
          caption: 'Professionele QR-oorhandigingspakket: alles wat \'n ontwerper of drukverkoper nodig het vir akkurate reproduksie',
        },
      ],
    },
    {
      heading: 'Verifieer drukbewyse',
      paragraphs: ['Moet nooit \'n oplaag goedkeur sonder om \'n fisiese bewys te skandeer nie. Versoek \'n bewys gedruk op die werklike substraat met die werklike afwerking wat in produksie gebruik sal word. Skandeer die bewys onder ligtoestande soortgelyk aan waar die finale stuk vertoon sal word. Toets met verskeie toestelle, insluitend ouer slimfone wat dalk met marginale kwaliteit sukkel.', 'As die bewys stadig of teenstrydig skandeer, ondersoek dit voordat dit goedgekeur word. Algemene kwessies sluit in onvoldoende kontras op gekleurde substrate, stilsone-oortredings deur snoei, inkverspreiding wat modulerande versag, of laminering wat glans skep. Enige van hierdie kan aangespreek word voordat u tot \'n volledige drukoplaag verbind word - maar slegs as u dit op die proefstadium vang.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: '\'n Kontrolelys vir bewyshersiening met skanderingstoetsresultate, kontrasmetings en goedkeuringshandtekeninge',
          caption: 'Drukbewysverifikasiewerkvloei: sistematiese toetsing voor produksiehoeveelhede',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Kyk na QR-voorbeelde',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Skep geanimeerde QR-kodes',
      paragraphs: ['Geanimeerde QR-kodes kombineer die funksionaliteit van standaard QR-kodes met opvallende beweging wat die betrokkenheidsyfers dramaties verhoog. In digitale naamborde, sosiale media en interaktiewe uitstallings verander animasie \'n statiese nut in \'n dwingende visuele element wat die oog trek en interaksie uitnooi. Hierdie gids dek die beginsels, tegnieke en praktiese beperkings van die skep van geanimeerde QR-kodes wat betroubaar skandeer terwyl dit visuele impak lewer.', 'Die fundamentele uitdaging van geanimeerde QR-kodes is om visuele belangstelling te balanseer teen skanderingsbetroubaarheid. Elke raam moet individueel skandeerbaar wees - \'n skandeerder kan die kode op enige punt in die animasie-siklus vasvang. Hierdie beperking vorm elke ontwerpbesluit: watter elemente kan beweeg, hoeveel hulle kan verander en wat moet stabiel bly regdeur die animasie.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: '\'n Digitale naambordvertoning wat \'n geanimeerde QR-kode wys wat kyker se aandag in \'n openbare ruimte vasvang',
          caption: 'Geanimeerde QR-kodes in digitale naamborde: beweging wat aandag trek en skandering aanmoedig',
        },
      ],
    },
    {
      heading: 'Hoe animasie skandeerbaarheid beïnvloed',
      paragraphs: ['QR-skandeerders werk deur \'n enkele raam vas te vang en die patroon van lig en donker modules te ontleed. Vir \'n geanimeerde kode om te werk, moet elke raam die volledige, geldige QR-patroon bevat. Dit sluit animasies uit wat die kodestruktuur verander, modules oplos of die kontraspatroon aansienlik verander. Die datadraende modules - die skynbaar ewekansige patroon in die middel - moet deurgaans visueel stabiel bly.', 'Veilige animasiebenaderings verander elemente wat nie data dra nie: agtergronde, kleure, dekoratiewe rame en oorlegelemente. Die strukturele komponente - vindpatrone (die groot hoekblokkies), tydsberekeningpatrone (die afwisselende lyne) en belyningspatrone (kleiner blokkies in groter kodes) - moet hul posisies en proporsies behou. Om binne hierdie beperkings te werk, maak steeds verbasend dinamiese en boeiende animasies moontlik.'],
    },
    {
      heading: 'Animasietegnieke wat werk',
      paragraphs: ['Kleurfietsry animeer die voorgrond- en agtergrondkleure deur \'n palet terwyl voldoende kontras by elke stap behou word. Dit skep \'n lewendige, aandagtrekkende effek met minimale skanderingsrisiko - solank kontras nooit onder leesbare vlakke daal nie. ANQR se kleursiklusvoorafinstellings is ontwerp om skandeerbaarheid regdeur die siklus te handhaaf.', 'Geanimeerde oorlegsels plaas bewegende beelde agter \'n semi-deursigtige QR-patroon. Die kode bly stabiel terwyl die agtergrond animeer - miskien \'n lusvideo, geanimeerde handelsmerkelemente of abstrakte bewegingsgrafika. Hierdie tegniek vereis noukeurige intensiteitbestuur om te verhoed dat die agtergrond die QR-patroon oorweldig, maar skep die mees visueel treffende resultate.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: '\'n Diagram wat die gelaagde struktuur van \'n geanimeerde QR toon: stabiele kodelaag oor geanimeerde agtergrondlaag',
          caption: 'Animasie-laagbeginsel: die QR-patroon bly konstant terwyl agtergrondelemente daaronder animeer',
        },
      ],
    },
    {
      heading: 'Konfigureer animasieparameters',
      paragraphs: ['Raamtempo beïnvloed beide visuele gladheid en lêergrootte. Vir die meeste toepassings bied 10-15 rame per sekonde gladde beweging sonder buitensporige lêergroottes. Hoër raamkoerse bied dalende visuele opbrengste terwyl lêergroottes aansienlik vergroot word. Oorweeg jou afleweringskonteks – \'n groot digitale bord kan groter lêers hanteer as \'n mobiele advertensieplasing.', 'Lusgedrag bepaal hoe die animasie siklusse. Naatlose lusse skep deurlopende beweging wat ideaal is vir naamborde en omgewingsvertonings. Tafeltennis (vorentoe-dan-agtertoe)-lusse werk goed vir eenvoudige animasies. Vir pulse wat aandag trek, oorweeg animasies met houe – periodes van stilte wat deur beweging onderbreek word wat die oog trek sonder konstante bewegingsmoegheid.'],
    },
    {
      heading: 'Skep geanimeerde oorlegsels',
      paragraphs: ['Wanneer geanimeerde prente (GIF\'s, geanimeerde WebP\'s of video) as oorleggings gebruik word, onttrek ANQR rame en stel dit saam met jou QR-kode. Die oorleg-intensiteitinstelling beheer hoeveel van die animasie deurgaan - laer waardes prioritiseer skandeerbaarheid terwyl hoër waardes visuele impak bevoordeel. Toets jou gekose intensiteit oor verskeie rame om konsekwente skandeerbaarheid te verseker.', 'Bronmateriaalkwaliteit het \'n aansienlike impak op resultate. Gebruik oorlegsels met duidelike onderwerpe en goeie kontras. Vermy bronanimasies met vinnige flikkering of uiterste helderheidsveranderinge wat af en toe rame met lae kontras kan skep. Voorbeskou die volledige animasie-siklus voor uitvoer om enige problematiese rame op te vang wat dalk nie kan skandeer nie.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: '\'n Raam-vir-raam-aansig van \'n geanimeerde oorleg wat kontrasvlakke wys wat oor die reeks gehandhaaf word',
          caption: 'Raamontleding: verifieer konsekwente skandeerbaarheid oor die hele animasie-siklus',
        },
      ],
    },
    {
      heading: 'Uitvoer- en afleweringsoorwegings',
      paragraphs: ['GIF bly die mees ondersteunde geanimeerde formaat en speel outomaties in die meeste kontekste sonder dat videospelerondersteuning nodig is. GIF se palet van 256 kleure beperk egter kleurgetrouheid. Vir kleurkritieke animasies, oorweeg geanimeerde WebP waar dit ondersteun word, of val terug na videoformate vir die hoogste gehalte. ANQR se GIF-uitvoer bevat dithering-opsies om kwaliteit binne paletbeperkings te maksimeer.', 'Lêergrootte maak saak vir aflewering. Digitale naambordstelsels, e-poskliënte en sosiale platforms stel dikwels groottebeperkings op. As jou animasie hierdie limiete oorskry, verminder raamtelling, afmetings of kleurdiepte. Soms behaal die verdeling van \'n komplekse animasie in \'n korter lus beter resultate as aggressiewe kompressie wat elke raam degradeer.'],
    },
    {
      heading: 'Toets geanimeerde QR-kodes',
      paragraphs: ['Om geanimeerde kodes te toets, vereis skandering op verskeie punte in die animasie-siklus. Moenie net een keer skandeer en sukses aanvaar nie – skandeer herhaaldelik, op verskillende oomblikke, om te verifieer dat elke raam leesbaar is. Gee veral aandag aan rame by kleursiklus uiterstes of oorleg intensiteit pieke waar kontras die laagste kan wees.', 'Toets op die werklike skerm hardeware waar moontlik. Monitor kleurkalibrasie, kykhoek en omgewingsbeligting beïnvloed alles hoe die animasie verskyn en skanderings. \'n Helder animasie wat perfek op jou monitor skandeer, kan dalk op \'n buiteskerm uitspoel of by skuins kykhoeke onleesbaar word.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: '\'n Toetsmatriks wat skanderingsukseskoerse oor verskillende rame, toestelle en vertoontoestande toon',
          caption: 'Geanimeerde QR-toetsprotokol: sistematiese verifikasie oor rame, toestelle en kyktoestande',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Kyk na QR-voorbeelde',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR-veiligheid en nakoming beste praktyke',
      paragraphs: ['\'n Pragtig ontwerpte QR-kode wat nie kan skandeer nie, is erger as nutteloos - dit frustreer kliënte, beskadig handelsmerkpersepsie en mors elke hulpbron wat in die skepping en verspreiding daarvan belê word. Hierdie gids dek die tegniese en praktiese faktore wat bepaal of \'n QR-kode betroubaar sal skandeer, en hoe om ANQR se veiligheidskenmerke te gebruik om potensiële probleme op te spoor voordat dit produksie bereik.', 'QR-kode betroubaarheid is nie binêr nie. \'n Kode kan perfek op vlagskipfone skandeer, maar misluk op begrotingstoestelle. Dit werk dalk in ideale beligting, maar sukkel in dowwe restaurante of helder sonlig. Om die faktore te verstaan ​​wat skandeerbaarheid beïnvloed, help jou om ingeligte afwegings te maak tussen visuele stilering en werklike betroubaarheid.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: '\'n Betroubaarheidspektrum wat QR-kodes toon wat wissel van hoogs skandeerbaar tot marginaal leesbaar',
          caption: 'Die skandeerbaarheidspektrum: van koeëlvaste kodes tot stilering wat betroubaarheidsperke verskuif',
        },
      ],
    },
    {
      heading: 'Verstaan foutkorreksievlakke',
      paragraphs: ['QR-kodes bevat ingeboude oortolligheid wat dit moontlik maak om dit te lees, selfs wanneer dit gedeeltelik beskadig of verduister word. Die foutkorreksievlak - L (7%), M (15%), Q (25%) of H (30%) - bepaal hoeveel van die kode kan ontbreek terwyl dit steeds korrek dekodeer. Hoër foutkorreksie skep groter kodes, maar bied \'n veiligheidsmarge vir oorlegsels, drukonvolmaakthede en omgewingskade.', 'Vir kodes met beeldoorleggings is foutkorreksievlak H noodsaaklik - die oorleg verberg \'n deel van die kode fisies, en jy het daardie 30% oortolligheid nodig om betroubaarheid te handhaaf. Vir skoon, ongestileerde kodes in beheerde omgewings is vlak M dikwels voldoende. Vlak L moet gereserveer word vir situasies waar kodegrootte krities beperk is en jy ongerepte toestande kan waarborg.'],
    },
    {
      heading: 'Die kritieke stil sone',
      paragraphs: ['Die stil sone is die leë kantlyn rondom elke QR-kode. Skandeerders gebruik hierdie grens om te identifiseer waar die kode begin en eindig. Die ISO-standaard spesifiseer \'n minimum stil sone van vier modules (vier keer die breedte van die kleinste vierkant in die kode). Om hierdie spasie te oortree - met ontwerpelemente, afsnyrande of aangrensende inhoud - is een van die mees algemene oorsake van skanderingsfoute.', 'ANQR se stiltesone-afdwinging help om hierdie kritieke spasiëring te handhaaf, maar jy moet ook verseker dat dit in jou finale ontwerpe bewaar word. Wanneer u QR-kunswerk oorhandig, spesifiseer die stilsonevereistes uitdruklik. Wanneer kodes in uitlegte geplaas word, verifieer dat geen elemente hierdie spasie binnedring nie. \'n Paar millimeter skoon spasie kan die verskil beteken tussen betroubare skandering en gefrustreerde kliënte.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: '\'n Diagram wat die korrekte stiltesonespasiëring teenoor algemene oortredings toon wat skanderingsfoute veroorsaak',
          caption: 'Stille sone vereistes: die onsigbare marge wat skanderingsukses bepaal',
        },
      ],
    },
    {
      heading: 'Kontras en kleurveiligheid',
      paragraphs: ['QR-skandeerders bespeur die patroon van lig en donker modules. Enige stilering wat hierdie kontras verminder - ligte voorgronde, donker agtergronde, gradiënt-effekte of lae-deursigtigheid-oorlegsels - maak die kode moeiliker om te lees. ANQR bereken kontrasverhoudings en waarsku wanneer jou kleurkeuses gevaarlike vlakke nader, maar die finale arbiter is altyd werklike toetsing.', 'Kleurpersepsie wissel met beligtingstoestande. \'n Kleurkombinasie wat \'n hoë kontras op jou monitor vertoon, kan moeilik wees om te onderskei onder warm gloeilampbeligting of koel fluoresserende buise. As jou kode in verskillende beligtingstoestande ontplooi sal word, toets onder verskeie ligbronne en oorweeg meer konserwatiewe kontrasverhoudings as \'n veiligheidsmarge.'],
    },
    {
      heading: 'Modulegrootte en kykafstand',
      paragraphs: ['Die fisiese grootte van individuele modules bepaal die maksimum afstand waaruit \'n kode geskandeer kan word. Kleiner modules beteken kleiner kodes, maar vereis nouer skanderingsafstande. Die algemene reël is dat elke module ten minste 0,5 mm moet wees op die beoogde skandeerafstand, en proporsioneel opskaal vir groter afstande. \'n Kode op \'n advertensiebord benodig veel groter modules as \'n kode op \'n besigheidskaartjie.', 'Wanneer die modulegrootte bereken word, oorweeg die ergste scenario: die kliënt met \'n ouer foon, in onvolmaakte beligting, skandeer op die maksimum waarskynlike afstand. Ontwerp vir hierdie gebruiker, en almal anders sal \'n selfs beter ervaring hê. ANQR se grootte-aanbevelings faktor in hierdie werklike veranderlikes om toepaslike afmetings vir jou beoogde gebruik voor te stel.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: '\'n Grafiek wat modulegrootte, drukafmetings en maksimum effektiewe skandeerafstand in verband bring',
          caption: 'Skandeerafstandgids: pas modulegrootte by jou ontplooiingsvereistes',
        },
      ],
    },
    {
      heading: 'Gebruik ANQR Veiligheidsmodus',
      paragraphs: ['ANQR se Veiligheidsmodus bied intydse terugvoer oor skanderingsbetroubaarheid. Dit monitor kontrasverhoudings, stiltesonevoldoening, oorlegintensiteit en ander faktore wat skandeerbaarheid beïnvloed. Wanneer enige parameter riskante vlakke nader, sal jy waarskuwings sien met spesifieke leiding oor hoe om betroubaarheid te verbeter. Vir professionele ontplooiings waar mislukking duur is, hou Veiligheidsmodus aktief regdeur die ontwerpproses.', 'Veiligheidsmodus bevat ook \'n skanderingverifikasiefunksie wat probeer om jou gegenereerde kode te dekodeer en sukses of mislukking rapporteer. Alhoewel hierdie inprogram-verifikasie nie elke werklike toestand kan herhaal nie, vind dit baie algemene probleme op voordat jy in drukwerk of verspreiding belê. Behandel suksesvolle verifikasie as \'n minimum balk, nie \'n waarborg nie - werklike toetsing bly noodsaaklik.'],
    },
    {
      heading: 'Regte-wêreld toetsprotokolle',
      paragraphs: ['Geen hoeveelheid sagtewareverifikasie vervang fisiese toetsing nie. Druk jou kode op die beoogde grootte op verteenwoordigende materiaal. Toets dit in die werklike ontplooiingsomgewing met beligtingstoestande wat ooreenstem met werklike gebruik. Skandeer met verskeie toestelle – nie net jou vlagskipfoon nie, maar begroting Android-toestelle, ouer iPhones en enige spesifieke toestelle wat jou gehoor algemeen gebruik.', 'Dokumenteer jou toetsing sistematies. Teken aan watter toestelle getoets is, onder watter omstandighede, met watter resultate. As jy kodes op skaal ontplooi, stel aanvaardingskriteria vas: miskien 95% sukseskoers oor jou toesteltoetspoel, of suksesvolle skanderings binne 2 sekondes op alle getoetsde toestelle. Hierdie standaarde help om go/no-go-besluite objektief te maak eerder as om op die beste te hoop.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: '\'n Omvattende toetslys wat toestelle, voorwaardes en aanvaardingskriteria dek',
          caption: 'QR-ontplooiingstoetsprotokol: sistematiese verifikasie voor produksieverbintenis',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Maak die kragopwekker oop',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Kyk na QR-voorbeelde',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Kyk na QR-voorbeelde', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Maak die volledige gebruikersgids oop', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Maak die galery oop', type: 'gallery' },
  ],
};
