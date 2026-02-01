import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Leren met ANQR',
  description: 'Praktische, zakelijke handleidingen voor het omzetten van QR-codes in echte marketingmiddelen - niet alleen in functionele vierkanten. Leer hoe u verouderde kassacodes kunt upgraden, QR-signage voor betalingen kunt maken die aan de regels voldoen, afdrukklare exports kunt voorbereiden, animaties veilig op digitale schermen kunt gebruiken en vergrendelde configuraties kunt delen met meertalige teams met behulp van ANQR-links ("anker").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open de generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'De volledige gebruikershandleiding openen', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'De bestaande QR-campagnes verbeteren',
      paragraphs: ['De meeste bedrijven hebben QR-codes verspreid over hun activiteiten: op menukaarten, toonbankstandaards, verpakkingen en promotiemateriaal. Veel van deze codes zijn jaren geleden gemaakt met basisgeneratoren, wat resulteerde in generieke zwart-witte vierkanten die geen vertrouwen wekken of passen bij uw merkidentiteit. Deze uitgebreide gids leidt u door een systematische aanpak voor het controleren, upgraden en optimaliseren van uw bestaande QR-infrastructuur zonder de klanttrajecten die u al heeft opgezet te verstoren.', 'Het strategische voordeel van het upgraden in plaats van het vervangen van uw QR-codes ligt in het behoud van de continuïteit. Uw klanten hebben al geleerd bepaalde bestemmingen te verwachten wanneer zij uw codes scannen. Door de gecodeerde URL\'s identiek te houden en tegelijkertijd de visuele presentatie, de scanbetrouwbaarheid en de merkuitlijning dramatisch te verbeteren, creëert u een naadloze overgang die het vertrouwen vergroot, zonder dat er wijzigingen aan uw digitale infrastructuur of analytische tracking nodig zijn.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Een side-by-side vergelijking met een vervaagde, generieke QR-code naast een moderne merkversie die dezelfde URL codeert',
          caption: 'Voor en na: Dezelfde bestemming URL getransformeerd van een gedateerde generieke code naar een professionele merkactiva',
        },
      ],
    },
    {
      heading: 'Waarom Legacy QR Codes Underperform',
      paragraphs: ['QR-codes die zijn gemaakt tijdens de vroege adoptiefase – vooral in de periode 2020-2021, toen bedrijven zich haastten om contactloze oplossingen te implementeren – kampen vaak met verschillende kritieke problemen. Lage foutcorrectie-instellingen maken ze kwetsbaar wanneer ze worden afgedrukt op gestructureerde oppervlakken of worden bekeken onder uitdagende verlichting. Onvoldoende stille zones veroorzaken scanfouten wanneer codes in de buurt van andere visuele elementen worden geplaatst. Generieke styling slaagt er niet in de legitimiteit van het merk over te brengen, wat leidt tot aarzeling en lagere scanpercentages.', 'Naast technische beperkingen vertegenwoordigen verouderde codes vaak gemiste merkkansen. Elke QR-code is een contactmoment met uw klant: een moment waarop deze actief betrokken is en bereid is actie te ondernemen. Een professioneel opgemaakte code die past bij uw merkkleuren, passende veiligheidsmarges bevat en optionele merkelementen bevat, transformeert dit hulpprogramma in een marketingmiddel dat uw identiteit bij elke interactie versterkt.'],
    },
    {
      heading: 'Een QR-codeaudit uitvoeren',
      paragraphs: ['Begin uw upgradeproject door het creëren van een uitgebreide inventaris van elke QR-code die momenteel in uw bedrijf wordt ingezet. Documenteer de fysieke locatie, de gecodeerde bestemming, de huidige staat van het bedrukte materiaal en de typische scanomgeving, inclusief lichtomstandigheden en kijkhoeken. Test elke code met meerdere apparaten - oudere smartphones en budget apparaten onthullen vaak betrouwbaarheidsproblemen die premium telefoons masker.', 'Besteed bijzondere aandacht aan codes op locaties waar veel op het spel staat: betaalpunten, incheckzones en promotiedisplays waar het mislukken van de scan rechtstreeks van invloed is op de omzet of de klantervaring. Deze moeten prioriteit krijgen voor onmiddellijke upgrade. Let ook op codes die voorkomen in fotografie- of video-inhoud, omdat hiervoor coördinatie met uw marketingteam nodig is om visuele middelen bij te werken.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Een checklist interface met QR audit categorieën: locatie, conditie, scan betrouwbaarheid en prioriteitsbeoordeling',
          caption: 'Systematische QR audit template voor het documenteren en prioriteren van uw upgrade kandidaten',
        },
      ],
    },
    {
      heading: 'De Safe Upgrade-strategie',
      paragraphs: ['De hoofdregel bij QR-upgrades is het behoud van de bestemming. Extraheer de exacte URL uit elke bestaande code en codeer deze op identieke wijze in uw nieuwe versie. Dit zorgt ervoor dat alle bestaande analyses, omleidingslogica en klantverwachtingen intact blijven. Als u bestemmingsflexibiliteit nodig heeft voor toekomstige updates, is dit het ideale moment om een ​​korte URL of omleidingsservice met een merknaam te introduceren, maar implementeer dit als een afzonderlijk project om samengestelde wijzigingen te voorkomen.', 'Voor de visuele upgrade, breng verbeteringen in lagen: eerst zorgen voor technische betrouwbaarheid (passende foutcorrectie en rustige zone), dan merk styling (kleuren, module vormen), en ten slotte overwegen optionele verbeteringen (centeroverlays, frames). Elke laag moet worden gevalideerd door middel van tests alvorens verder te gaan. De veiligheidsmodus van ANQR helpt deze prioriteiten af te dwingen door te waarschuwen wanneer styling keuzes de scannability in gevaar kunnen brengen.'],
    },
    {
      heading: 'Merkidentiteit toevoegen zonder Betrouwbaarheid te compromitteren',
      paragraphs: ['Effectieve QR-branding balanceert visuele impact en scanbetrouwbaarheid. Begin met kleur: vervang de standaard zwarte voorgrond door uw primaire merkkleur en zorg voor voldoende contrast met uw achtergrond. Voor de meeste merken werken donkere kleuren op een lichte achtergrond het beste. Vermijd combinaties met laag contrast, kleurverlopen die de helderheid van de randen verminderen, of kleuren die er onder normale lichtomstandigheden hetzelfde uitzien.', 'Het aanpassen van de modulevorm biedt nog een mogelijkheid voor branding met minimale impact op de betrouwbaarheid. Afgeronde modules zorgen voor een zachter, toegankelijker uiterlijk terwijl de uitstekende scanbaarheid behouden blijft. Modules in puntstijl werken goed voor moderne, technologisch vooruitstrevende merken. Verbonden modules passen bij industriële of bedrijfsidentiteiten. Welke stijl u ook kiest, zorg voor consistentie in al uw QR-implementaties voor onmiddellijke merkherkenning.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Een kleurenwieldiagram met optimale QR kleurencombinaties met contrastverhoudingsindicatoren',
          caption: 'Brand kleur selectie gids met een hoog contrast combinaties die de scan betrouwbaarheid te handhaven',
        },
      ],
    },
    {
      heading: 'Test- en valideringsprotocol',
      paragraphs: ['Implementeer nooit geüpgradede QR-codes zonder rigoureuze tests. Druk een fysieke proefdruk af op exact het formaat en op hetzelfde materiaal als uw uiteindelijke implementatie. Test op de daadwerkelijke locatie waar de code zal verschijnen, op verschillende tijdstippen van de dag, om rekening te houden met lichtvariaties. Gebruik ten minste drie verschillende apparaten: een huidige vlaggenschiptelefoon, een toestel uit het middensegment en een oudere of budgetsmartphone.', 'Registreer scantijden en succespercentages voor elke test. Een goed geoptimaliseerde code zou op elk redelijk modern apparaat binnen 1-2 seconden moeten worden gescand. Als u consistente vertragingen of mislukkingen constateert, verminder dan de stylingintensiteit - verwijder of verklein overlays, vergroot de grootte van de stille zone of schakel over naar een hoger foutcorrectieniveau. Betrouwbaarheid heeft altijd voorrang op visuele verfijning.'],
    },
    {
      heading: 'Uw configuratie vergrendelen voor consistentie',
      paragraphs: ['Zodra u een optimale configuratie hebt gevalideerd, behoudt u deze met behulp van de deelbare koppelingen van ANQR. Dit maakt een permanent record van elke instelling die wordt gebruikt om uw goedgekeurde code te genereren - kleuren, modulestijl, foutcorrectie, grootte, en eventuele overlays. Deel deze link met uw ontwerpteam, drukverkopers en iedereen die de code in de toekomst moet reproduceren.', 'Deze configuratievergrendeling voorkomt de geleidelijke degradatie waar veel QR-implementaties mee te maken hebben. Zonder dit kunnen medewerkers codes uit schermafbeeldingen opnieuw maken, ontwerpers instellingen opnieuw uit het geheugen bouwen en drukwerkleveranciers \'nuttige\' aanpassingen maken. Elke variatie introduceert potentiële problemen. Met een vergrendelde configuratielink is elke reproductie identiek aan uw geteste, goedgekeurde origineel.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Een diagram met configuratiedrift: screenshots die leiden tot recreaties die leiden tot varianten, versus een enkele bron van waarheid koppeling',
          caption: 'Configuratiedrift voorkomen door het instellen van één gezaghebbende bron voor alle QR reproducties',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR voorbeelden bekijken',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR-codes voor retailbetalingen',
      paragraphs: ['QR-codes voor betalingen werken in de meest veeleisende omgeving in de detailhandel: het moment van de transactie. Klanten staan ​​klaar om te betalen, vaak met een rij achter zich, en elke seconde vertraging zorgt voor wrijving. Toch is dit moment van hoge druk ook bij uitstek geschikt voor merkversterking. In deze handleiding wordt uitgelegd hoe u QR-codes voor betalingen kunt maken die direct in bank-apps kunnen worden gescand en toch een professionele, merkuitstraling hebben die het vertrouwen van de klant vergroot.', 'Het fundamentele principe voor QR-codes voor betalingen is betrouwbaarheid boven esthetiek. Een prachtig ontworpen code die de bankapp van een klant niet kan scannen, zal u veel meer kosten aan afgebroken transacties en gefrustreerde klanten dan een conservatief ontwerp ooit zou kunnen. Begin met compliance, voeg betrouwbaarheid toe en pas vervolgens zorgvuldig de branding toe op plekken waar dit de primaire functie niet in gevaar brengt.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Een retail teller display toont een betaling QR code wordt gescand door een smartphone met een banking app',
          caption: 'Betaling QR codes moeten direct werken met bank- en portemonnee apps onder real-world teller voorwaarden',
        },
      ],
    },
    {
      heading: 'Inzicht in betaal QR-normen',
      paragraphs: ['QR-codes voor betalingen volgen doorgaans regionale normen die het payload-formaat bepalen. In Singapore gebruikt PayNow QR een specifieke opmaak. In India volgen UPI-codes de BharatQR- of UPI-deeplinkstandaarden. Europese SEPA-betalingen maken gebruik van EPC QR-codes. Elke standaard bestaat om ervoor te zorgen dat bank-apps de betalingsinformatie onmiddellijk kunnen herkennen en verwerken. Als u – ook al is het maar een klein beetje – van deze normen afwijkt, kan dit ertoe leiden dat betaalapps codes weigeren die generieke camerascanners zonder problemen lezen.', 'ANQR bevat sjablonen voor de belangrijkste betalingsstandaarden waarmee uw verkopersgegevens automatisch worden opgemaakt in conforme payloads. Gebruik deze sjablonen altijd in plaats van handmatig betalingsreeksen samen te stellen, aangezien zelfs kleine opmaakfouten transactiefouten kunnen veroorzaken. Als de betalingsstandaard van uw regio niet beschikbaar is als sjabloon, raadpleeg dan de technische documentatie van uw betalingsprovider voor de exacte opmaakvereisten.'],
    },
    {
      heading: 'Maten en plaatsen voor tellerweergaven',
      paragraphs: ['Counter-top QR-codes worden geconfronteerd met unieke fysieke uitdagingen. Klanten scannen op armlengte, vaak vanuit een hoek, soms door hoestschermen of vitrines. Bovenverlichting creëert verblindende plekken. De code concurreert met andere tegenrommel om aandacht en duidelijke zichtlijnen. Formaat van uw betalings-QR ruimschoots - een minimum van 4-5 cm wordt aanbevolen voor de meeste toonbanktoepassingen, groter als de code achter glas of in een slecht verlichte ruimte staat.', 'Positie is net zo belangrijk als grootte. Plaats de code op een plek waar klanten hun telefoon comfortabel kunnen vasthouden zonder de wachtrij te blokkeren of onhandig te reiken. Draai het display naar de klant toe in plaats van het plat neer te leggen. Gebruik indien mogelijk matte laminering of niet-reflecterende displaymaterialen om schittering door overheadverlichting te minimaliseren. Test de uiteindelijke plaatsing op verschillende tijdstippen van de dag om verlichtingsproblemen op te sporen.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Een diagram met optimale QR plaatsingshoogtes en hoeken voor verschillende tellerconfiguraties',
          caption: 'Teller plaatsing gids: optimale hoogtes, hoeken en afstanden voor betrouwbare betaling scannen',
        },
      ],
    },
    {
      heading: 'Conservatieve branding voor betalingscodes',
      paragraphs: ['Betaalapps zijn minder vergevingsgezind dan generieke camerascanners. Veel bankapps gebruiken oudere, eenvoudigere QR-leesalgoritmen die zijn geoptimaliseerd voor snelheid in plaats van flexibiliteit. Dit betekent dat styling die perfect werkt met een telefooncamera mogelijk mislukt met specifieke betaalapps. Houd uw branding conservatief: gebruik uw merkkleur voor de voorgrond als deze een sterk contrast behoudt, maar vermijd kleurverlopen, zware overlays of decoratieve elementen die de herkenning kunnen verstoren.', 'Als u een centraal logo of overlay wilt, houd dit dan extreem klein (niet meer dan 10-15% van het QR-gebied) en test uitgebreid met elke betaalapp die uw klanten mogelijk gebruiken. Veel bedrijven kiezen ervoor om specifiek geen overlay op betalingscodes te gebruiken, en reserveren die stijl voor het op de markt brengen van QR-codes waar de betrouwbaarheidseisen minder streng zijn. De taak van de betalingscode is om transacties te verwerken, niet om visueel indruk te maken.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Een vergelijking die acceptabele versus riskante merkniveaus voor betaling QR codes toont',
          caption: 'Betaal QR branding spectrum: van veilige conservatieve styling tot riskante decoratieve benaderingen',
        },
      ],
    },
    {
      heading: 'Materiële en afdrukken overwegingen',
      paragraphs: ['Het fysieke weergavemateriaal heeft een aanzienlijke invloed op de scanbetrouwbaarheid. Glanzende laminering reflecteert bovenlichten rechtstreeks in de camera van de klant. Getextureerde materialen kunnen de randen van modules vervormen. Door goedkoop printen kunnen fijne details vervagen. Investeer voor QR-codes voor betalingen in kwaliteit: gebruik matte of satijnen laminering, zorg voor afdrukken met hoge resolutie en vervang displays voordat ze slijtage vertonen. Een bekraste of vervaagde betalingscode kost u transacties.', 'Overweeg de duurzaamheid van het display en de vervangbaarheid. Counter displays worden aangeraakt, verplaatst, opgeblazen, en soms omgestoten. Ontwerp uw displaysysteem zodat de QR-inzetstuk eenvoudig kan worden vervangen zonder de gehele stand te vervangen. Houd reserveprints klaar, gegenereerd door uw vergrendelde configuratielink, zodat versleten codes direct kunnen worden verwisseld.'],
    },
    {
      heading: 'Testen met Real Payment Apps',
      paragraphs: ['Generieke camerascanners kunnen vrijwel elke redelijk geformatteerde QR-code decoderen. Betaalapps zijn kieskeuriger. Voordat u een QR-code voor betalingen implementeert, moet u deze testen met elke betalingsapp die uw klanten mogelijk gebruiken. In omgevingen met meerdere betalingen kan dit betekenen dat u moet testen met meerdere bankapps, digitale portemonnees en betalingsplatforms. Documenteer welke apps u heeft getest en hun versies. Betaalapps worden regelmatig bijgewerkt en een update kan het scangedrag veranderen.', 'Test onder realistische omstandigheden: de werkelijke weergave, werkelijke verlichting, werkelijke scanafstand. Een code die direct scant op uw bureau kan worstelen op de toonbank om 5 uur \'s middags zon creëert schittering. Test met de oudste, goedkoopste smartphone die u kunt vinden - als het werkt betrouwbaar op een budget apparaat, het zal werken op alles. Vlag elke scantijd over 2 seconden voor onderzoek en mogelijke herontwerp.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Een testchecklist met verschillende betaalapps, apparaattypes en omgevingsomstandigheden om te controleren',
          caption: 'Uitgebreide betaling QR testmatrix voor apps, apparaten en omgevingsfactoren',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'QR voorbeelden bekijken',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Afdrukken-klaar QR-codes: SVG vs PNG',
      paragraphs: ['Het verschil tussen een QR-code die perfect scant en een code die faalt komt vaak neer op hoe het werd geëxporteerd en behandeld in de print workflow. Deze gids legt de kritische onderscheiding tussen vector (SVG) en raster (PNG) formaten uit, wanneer te gebruiken elk, en hoe om QR-kunstwerk over te dragen aan ontwerpers en print leveranciers op manieren die de scan betrouwbaarheid van visitekaartjes te behouden tot billboard-size signage.', 'Bij printproductie worden variabelen geïntroduceerd die op het scherm niet bestaan: inktspreiding, substraattextuur, afwerkingsprocessen en het cumulatieve effect van meerdere bestandsconversies. Een QR-code die er in uw ontwerpsoftware perfect uitziet, kan uit de printer komen met zachtere randen, verminderd contrast of subtiel vervormde modules. Door inzicht te krijgen in de indelingsselectie en best practices in de workflow worden deze stille fouten voorkomen.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Een vergroot beeld waarin vector QR modules worden vergeleken met scherpe randen versus rastermodules die pixel artefacten tonen',
          caption: 'Vector vs raster op printschaal: het precisieverschil dat de betrouwbaarheid van de scan bepaalt',
        },
      ],
    },
    {
      heading: 'Waarom Vector (SVG) voorkeur heeft voor afdrukken',
      paragraphs: ['SVG-bestanden beschrijven QR-codes als wiskundige vormen in plaats van rasters van pixels. Dit betekent dat de code kan worden geschaald naar elk formaat - van een label van 1 cm tot een banner van 10 meter - zonder verlies van randscherpte. De RIP (Raster Image Processor) van de printer geeft de vectoren weer met de eigen resolutie van het uitvoerapparaat, waardoor elke modulerand zo scherp is als de hardware toelaat. Er is geen interpolatie, geen anti-aliasing-artefacten, geen geaccumuleerde vervaging door meerdere bewerkingen voor het wijzigen van de grootte.', 'Naast schaalbaarheid zijn SVG-bestanden robuuster in professionele workflows. Ze overleven rondreizen door ontwerpsoftware zonder degradatie. Ze kunnen op kleur worden gecorrigeerd zonder opnieuw te samplen. Ze kunnen netjes in PDF-bestanden worden ingesloten voor drukklare uitvoer. Voor elke printtoepassing waarbij kwaliteit belangrijk is, zou SVG uw standaard exportformaat moeten zijn.'],
    },
    {
      heading: 'Wanneer PNG acceptabel is',
      paragraphs: ['PNG wordt noodzakelijk wanneer uw workflow of bestemmingsplatform geen vectorformaten ondersteunt. Sommige webplatforms, CMS-systemen voor bewegwijzering en oudere printworkflows vereisen rasterafbeeldingen. In deze gevallen kan PNG goed werken, maar alleen als u strikte regels volgt: exporteer met de uiteindelijke fysieke grootte en resolutie, schaal nooit op na het exporteren en vermijd verliesgevende compressie of formaatconversie.', 'De cruciale regel voor PNG is om de vereiste pixelafmetingen te berekenen voordat u exporteert. Als uw QR op 5 cm afdrukt en uw printer op 300 DPI werkt, heeft u ongeveer 590 pixels nodig. Exporteer op dit formaat of groter en schaal vervolgens indien nodig terug – nooit omhoog. Neem deze informatie op in uw bestandsnaam of metagegevens, zodat toekomstige gebruikers niet per ongeluk een formaatspecifieke export misbruiken.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Een calculator interface toont de relatie tussen fysieke grootte, DPI, en vereiste pixel afmetingen',
          caption: 'Resolutiecalculator afdrukken: het bepalen van de minimale pixelafmetingen voor uw uitvoergrootte',
        },
      ],
    },
    {
      heading: 'ANQR-exportopties uitgelegd',
      paragraphs: ['ANQR biedt verschillende SVG-exportmodi voor verschillende workflows. De True Vector-modus produceert pure, op paden gebaseerde uitvoer, ideaal voor print- en professionele ontwerptools. Wanneer u rasteroverlays of bepaalde effecten heeft toegevoegd, kan ANQR deze insluiten met behoud van vectormodules, of u kunt een volledig gerasterde versie exporteren met de door u opgegeven resolutie. Als u deze opties begrijpt, kunt u voor elke gebruikssituatie de juiste export kiezen.', 'Voor PNG-exports kunt u met ANQR exacte afmetingen opgeven en zijn er opties voor transparante achtergronden opgenomen. Met de DPI-instelling kunt u de juiste formaten voor afdrukken berekenen, maar onthoud dat DPI metadata is: wat voor afdrukken belangrijk is, is dat u voldoende pixels heeft voor uw fysieke grootte. Exporteer bij twijfel groter dan u denkt nodig te hebben; Schaalvergroting zorgt ervoor dat de kwaliteit behouden blijft, terwijl schaalvergroting deze vernietigt.'],
    },
    {
      heading: 'Bestanden voorbereiden voor overdracht',
      paragraphs: ['Wanneer u QR-illustraties doorgeeft aan ontwerpers of drukwerkleveranciers, geef dan duidelijke specificaties op: de beoogde fysieke grootte, minimale vereisten voor stille zones en eventuele overwegingen met betrekking tot de kleurruimte. Zorg voor kritieke toepassingen voor zowel een SVG-master als een PNG-back-up met hoge resolutie, duidelijk gelabeld met het beoogde gebruik. Voeg uw ANQR-configuratielink toe, zodat de code indien nodig opnieuw kan worden gegenereerd.', 'Anticipeer op veelvoorkomende fouten in het overdrachtsproces. Geef expliciet aan dat de QR niet mag worden geschaald, geroteerd, scheefgetrokken of dat er effecten op mogen worden toegepast. Specificeer dat de stille zone vrij moet blijven - er mogen geen snijtekens, registratietekens of ontwerpelementen indringen. Als de QR op een gekleurde of fotografische achtergrond wordt geplaatst, zorg dan voor een versie met een ondoorzichtige achterkant om voldoende contrast te garanderen.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Een bestandspakketdiagram met SVG master, PNG back-up, specificaties document en configuratie koppeling',
          caption: 'Professioneel QR-overdrachtspakket: alles wat een ontwerper of drukwerkleverancier nodig heeft voor nauwkeurige reproductie',
        },
      ],
    },
    {
      heading: 'Controleren van afdrukproeven',
      paragraphs: ['Nooit een afdruk goedkeuren zonder een fysiek bewijs te scannen. Vraag een bewijs afgedrukt op het werkelijke substraat met de werkelijke afwerking die zal worden gebruikt in de productie. Scan het bewijs onder lichtomstandigheden die vergelijkbaar zijn met waar het laatste stuk zal worden weergegeven. Test met meerdere apparaten, waaronder oudere smartphones die misschien worstelen met marginale kwaliteit.', 'Als het proefdrukproces langzaam of inconsistent wordt gescand, moet u dit onderzoeken voordat u het goedkeurt. Veelvoorkomende problemen zijn onder meer onvoldoende contrast op gekleurde substraten, schendingen van stille zones door bijsnijden, inktverspreiding die de randen van de module verzacht, of laminering die verblinding veroorzaakt. Al deze problemen kunnen worden aangepakt voordat u tot een volledige oplage overgaat, maar alleen als u ze in de proeffase ontdekt.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Een testchecklist met scanresultaten, contrastmetingen en goedkeuringshandtekeningen',
          caption: 'Print proof verificatie workflow: systematische testen alvorens zich te verbinden aan productiehoeveelheden',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'QR voorbeelden bekijken',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Geanimeerde QR-codes aanmaken',
      paragraphs: ['Geanimeerde QR-codes combineren de functionaliteit van standaard QR-codes met opvallende bewegingen die de inzetcijfers drastisch verhogen. In digitale bewegwijzering, sociale media en interactieve displays transformeert animatie een statisch nut in een meeslepend visueel element dat het oog trekt en interactie uitnodigt. Deze gids behandelt de principes, technieken en praktische beperkingen van het creëren van geanimeerde QR codes die betrouwbaar scannen terwijl het leveren van visuele impact.', 'De fundamentele uitdaging van geanimeerde QR-codes is het balanceren van visuele interesse en scanbetrouwbaarheid. Elk frame moet afzonderlijk kunnen worden gescand; een scanner kan de code op elk moment in de animatiecyclus vastleggen. Deze beperking bepaalt elke ontwerpbeslissing: welke elementen kunnen bewegen, hoeveel ze kunnen veranderen en wat tijdens de animatie stabiel moet blijven.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Een digitaal bewegwijzeringsscherm met een geanimeerde QR-code die de aandacht van de kijker in een openbare ruimte vastlegt',
          caption: 'Geanimeerde QR codes in digitale bewegwijzering: beweging die aandacht trekt en scanning stimuleert',
        },
      ],
    },
    {
      heading: 'Hoe Animatie invloed heeft op de uitstraling',
      paragraphs: ['QR-scanners werken door een enkel frame vast te leggen en het patroon van lichte en donkere modules te analyseren. Om een ​​geanimeerde code te laten werken, moet elk frame het volledige, geldige QR-patroon bevatten. Dit sluit animaties uit die de codestructuur veranderen, modules oplossen of het contrastpatroon aanzienlijk veranderen. De gegevensdragende modules – het schijnbaar willekeurige patroon in het midden – moeten overal visueel stabiel blijven.', 'Veilige animatiebenaderingen wijzigen elementen die geen gegevens bevatten: achtergronden, kleuren, decoratieve frames en overlay elementen. De structurele componenten - zoekpatronen (de grote hoekvierkanten), timingpatronen (de afwisselende lijnen) en uitlijningspatronen (kleinere vierkanten in grotere codes) - moeten hun posities en verhoudingen behouden. Werken binnen deze beperkingen zorgt nog steeds voor verrassend dynamische en boeiende animaties.'],
    },
    {
      heading: 'Animatietechnieken Dat werk',
      paragraphs: ['Kleur Fietsen animeert de voorgrond- en achtergrondkleuren door een palet met behoud van voldoende contrast bij elke stap. Dit zorgt voor een levendig, aandacht grijpend effect met een minimaal scanrisico - zolang contrast nooit onder leesbaar niveau daalt. De presets van de kleurcyclus van ANQR zijn ontworpen om de scannabiliteit gedurende de hele cyclus te behouden.', 'Geanimeerde overlays plaatsen bewegende beelden achter een semi-transparant QR-patroon. De code blijft stabiel terwijl de achtergrond animeert - misschien een looping-video, geanimeerde merkelementen of abstracte bewegende beelden. Deze techniek vereist zorgvuldig intensiteitsbeheer om te voorkomen dat de achtergrond het QR-patroon overheerst, maar levert de meest visueel opvallende resultaten op.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Een diagram dat de gelaagde structuur van een geanimeerde QR toont: stabiele codelaag over een geanimeerde achtergrondlaag',
          caption: 'Animatielaagprincipe: het QR-patroon blijft constant terwijl achtergrondelementen zich onderaan animeren',
        },
      ],
    },
    {
      heading: 'Animatieparameters instellen',
      paragraphs: ['Framesnelheid beïnvloedt zowel visuele gladheid als bestandsgrootte. Voor de meeste toepassingen biedt 10-15 frames per seconde een soepele beweging zonder buitensporige bestandsgrootte. Hogere frame rates bieden minder visueel rendement, terwijl aanzienlijk toenemende bestandsgroottes. Overweeg uw levering context - een groot digitaal teken kan grotere bestanden dan een mobiele advertentie plaatsing.', 'Loop gedrag bepaalt hoe de animatie cycli. Naadloze lussen creëren continue beweging ideaal voor bewegwijzering en ambient displays. Ping-pong (forward-then-reverse) loops werken goed voor eenvoudige animaties. Voor aandacht grijpende pulsen, overwegen animaties met holds - perioden van stilte doorgedrukt door beweging die trekt het oog zonder constante beweging vermoeidheid.'],
    },
    {
      heading: 'Geanimeerde overlays aanmaken',
      paragraphs: ['Wanneer u geanimeerde afbeeldingen (GIF\'s, geanimeerde WebP\'s of video) als overlays gebruikt, extraheert ANQR frames en voegt deze samen met uw QR-code. De instelling voor de overlay-intensiteit bepaalt hoeveel van de animatie zichtbaar is: lagere waarden geven prioriteit aan scanbaarheid, terwijl hogere waarden de visuele impact bevorderen. Test de door u gekozen intensiteit over meerdere frames om consistente scanbaarheid te garanderen.', 'De kwaliteit van het bronmateriaal heeft een aanzienlijke invloed op de resultaten. Gebruik overlays met duidelijke onderwerpen en goed contrast. Vermijd bronanimaties met snel knipperen of extreme helderheidsveranderingen die af en toe frames met laag contrast kunnen veroorzaken. Bekijk een voorbeeld van de volledige animatiecyclus voordat u deze exporteert om eventuele problematische frames op te sporen die mogelijk niet kunnen worden gescand.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Een frame-voor-frame weergave van een geanimeerde overlay met contrastniveaus die in de reeks worden gehandhaafd',
          caption: 'Frame analyse: het controleren van consistente scannabiliteit gedurende de gehele animatiecyclus',
        },
      ],
    },
    {
      heading: 'Uitvoer- en leveringsoverwegingen',
      paragraphs: ['GIF blijft het meest ondersteunde geanimeerde formaat en wordt in de meeste contexten automatisch afgespeeld zonder ondersteuning van een videospeler. Het 256-kleurenpalet van GIF beperkt echter de kleurgetrouwheid. Voor kleurkritische animaties kunt u geanimeerde WebP overwegen waar dit wordt ondersteund, of terugvallen op videoformaten voor de hoogste kwaliteit. De GIF-export van ANQR omvat dithering-opties om de kwaliteit binnen paletbeperkingen te maximaliseren.', 'Bestandsgrootte is van belang voor bezorging. Narrowcastingsystemen, e-mailclients en sociale platforms leggen vaak groottelimieten op. Als uw animatie deze limieten overschrijdt, verkleint u het aantal frames, de afmetingen of de kleurdiepte. Soms levert het opsplitsen van een complexe animatie in een kortere lus betere resultaten op dan agressieve compressie die elk frame verslechtert.'],
    },
    {
      heading: 'Geanimeerde QR-codes testen',
      paragraphs: ['Voor het testen van geanimeerde codes is scannen op meerdere punten in de animatiecyclus vereist. Scan niet slechts één keer en ga uit van succes; scan herhaaldelijk, op verschillende momenten, om te verifiëren dat elk frame leesbaar is. Besteed bijzondere aandacht aan frames met extreme kleurcycli of pieken in de overlay-intensiteit, waar het contrast het laagst kan zijn.', 'Test waar mogelijk op de daadwerkelijke weergavehardware. Monitorkleurkalibratie, kijkhoek en omgevingslicht hebben allemaal invloed op hoe de animatie verschijnt en scant. Een heldere animatie die perfect op uw monitor wordt gescand, kan op een buitenscherm wegvallen of onleesbaar worden bij schuine kijkhoeken.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Een testmatrix die de succespercentages van scans weergeeft voor verschillende frames, apparaten en weergaveomstandigheden',
          caption: 'Geanimeerd QR-testprotocol: systematische verificatie voor frames, apparaten en kijkomstandigheden',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'QR voorbeelden bekijken',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Veiligheid en naleving van QR Beste praktijken',
      paragraphs: ['Een prachtig ontworpen QR-code die niet kan worden gescand, is erger dan nutteloos: het frustreert klanten, schaadt de merkperceptie en verspilt alle middelen die zijn geïnvesteerd in de creatie en distributie ervan. Deze gids behandelt de technische en praktische factoren die bepalen of een QR-code betrouwbaar kan worden gescand, en hoe u de veiligheidsfuncties van ANQR kunt gebruiken om potentiële problemen op te sporen voordat deze in productie gaan.', 'De betrouwbaarheid van QR-codes is niet binair. Een code kan perfect scannen op vlaggenschiptelefoons, maar mislukt op budgetapparaten. Het werkt misschien bij ideale verlichting, maar heeft moeite in schemerige restaurants of fel zonlicht. Als u de factoren begrijpt die van invloed zijn op de scanbaarheid, kunt u weloverwogen afwegingen maken tussen visuele stijl en betrouwbaarheid in de echte wereld.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Een betrouwbaarheidsspectrum met QR codes variërend van zeer scannable tot marginaal leesbaar',
          caption: 'Het scannability spectrum: van kogelvrije codes tot styling die betrouwbaarheidsgrenzen verleggen',
        },
      ],
    },
    {
      heading: 'Inzicht in foutcorrectieniveaus',
      paragraphs: ['QR-codes bevatten ingebouwde redundantie waardoor ze kunnen worden gelezen, zelfs als ze gedeeltelijk beschadigd of onzichtbaar zijn. Het foutcorrectieniveau - L (7%), M (15%), Q (25%) of H (30%) - bepaalt hoeveel van de code mag ontbreken terwijl de code nog steeds correct wordt gedecodeerd. Een hogere foutcorrectie zorgt voor grotere codes, maar biedt een veiligheidsmarge voor overlays, drukonvolkomenheden en milieuschade.', 'Voor codes met beeldoverlays is foutcorrectieniveau H essentieel: de overlay verbergt fysiek een deel van de code, en je hebt die 30% redundantie nodig om de betrouwbaarheid te behouden. Voor schone, ongestylede codes in gecontroleerde omgevingen is niveau M vaak voldoende. Niveau L moet worden gereserveerd voor situaties waarin de codegrootte kritisch beperkt is en u onberispelijke omstandigheden kunt garanderen.'],
    },
    {
      heading: 'De kritieke stille zone',
      paragraphs: ['De stille zone is de lege marge rond elke QR-code. Scanners gebruiken deze grens om te identificeren waar de code begint en eindigt. De ISO-norm specificeert een minimale stille zone van vier modules (vier keer de breedte van het kleinste vierkant in de code). Het schenden van deze ruimte (door ontwerpelementen, bijsnijdranden of aangrenzende inhoud) is een van de meest voorkomende oorzaken van scanfouten.', 'De handhaving van de stille zones van ANQR helpt deze kritische afstand te behouden, maar u moet er ook voor zorgen dat deze in uw definitieve ontwerpen behouden blijft. Geef bij het uitreiken van QR-illustraties expliciet de vereisten voor de stille zone op. Controleer bij het plaatsen van codes in lay-outs of er geen elementen in deze ruimte binnendringen. Een paar millimeter vrije ruimte kan het verschil betekenen tussen betrouwbaar scannen en gefrustreerde klanten.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Een diagram met de juiste afstand tussen de stille zone en algemene schendingen die scanfouten veroorzaken',
          caption: 'Rustige zonevereisten: de onzichtbare marge die het succes van de scan bepaalt',
        },
      ],
    },
    {
      heading: 'Contrast en kleurveiligheid',
      paragraphs: ['QR-scanners detecteren het patroon van lichte en donkere modules. Elke stijl die dit contrast verkleint (lichte voorgronden, donkere achtergronden, verloopeffecten of overlays met een lage dekking) maakt de code moeilijker leesbaar. ANQR berekent de contrastverhoudingen en waarschuwt wanneer uw kleurkeuze een gevaarlijk niveau nadert, maar de uiteindelijke scheidsrechter is altijd een praktijktest.', 'De kleurperceptie varieert afhankelijk van de lichtomstandigheden. Een kleurencombinatie die op uw monitor een hoog contrast lijkt, kan moeilijk te onderscheiden zijn bij warm gloeilamplicht of koele tl-buizen. Als uw code onder wisselende lichtomstandigheden wordt ingezet, test dan onder meerdere lichtbronnen en overweeg conservatievere contrastverhoudingen als veiligheidsmarge.'],
    },
    {
      heading: 'Modulegrootte en weergaveafstand',
      paragraphs: ['De fysieke grootte van individuele modules bepaalt de maximale afstand waarop een code kan worden gescand. Kleinere modules betekenen kleinere codes, maar vereisen kleinere scanafstanden. De algemene regel is dat elke module minimaal 0,5 mm groot moet zijn op de beoogde scanafstand, en proportioneel moet worden opgeschaald voor grotere afstanden. Een code op een billboard heeft veel grotere modules nodig dan een code op een visitekaartje.', 'Bij het berekenen van modulegrootte, rekening houden met het worst-case scenario: de klant met een oudere telefoon, in onvolmaakte verlichting, scannen op de maximale waarschijnlijke afstand. Ontwerp voor deze gebruiker, en iedereen zal een nog betere ervaring hebben. ANQR\'s grootte aanbevelingen factor in deze reële variabelen om passende afmetingen voor uw beoogde gebruik te suggereren.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Een grafiek met betrekking tot modulegrootte, afdrukafmetingen en maximale effectieve scanafstand',
          caption: 'Scanning afstand gids: het aanpassen van module grootte aan uw implementatie eisen',
        },
      ],
    },
    {
      heading: 'Gebruik van ANQR-veiligheidsmodus',
      paragraphs: ['De veiligheidsmodus van ANQR biedt realtime feedback over de betrouwbaarheid van de scan. Het bewaakt de contrastverhoudingen, de naleving van stille zones, de intensiteit van de overlay en andere factoren die de scanbaarheid beïnvloeden. Wanneer een parameter een riskant niveau nadert, ziet u waarschuwingen met specifieke richtlijnen over hoe u de betrouwbaarheid kunt verbeteren. Voor professionele implementaties waarbij fouten kostbaar zijn, kunt u de Veiligheidsmodus gedurende het hele ontwerpproces actief houden.', 'De Veiligheidsmodus bevat ook een scanverificatiefunctie die probeert de door u gegenereerde code te decoderen en succes of mislukking rapporteert. Hoewel deze in-app-verificatie niet elke situatie in de praktijk kan repliceren, worden veel veelvoorkomende problemen opgespoord voordat u investeert in afdrukken of distributie. Beschouw succesvolle verificatie als een minimumnorm en niet als een garantie. Testen in de praktijk blijft essentieel.'],
    },
    {
      heading: 'Testprotocollen in de praktijk',
      paragraphs: ['Geen enkele hoeveelheid softwareverificatie vervangt fysieke tests. Print uw code op de gewenste grootte op representatief materiaal. Test het in de eigenlijke implementatieomgeving met lichtomstandigheden die overeenkomen met echt gebruik. Scannen met meerdere apparaten - niet alleen uw vlaggenschip telefoon, maar budget Android-apparaten, oudere iPhones, en alle specifieke apparaten die uw publiek vaak gebruikt.', 'Documenteer uw tests systematisch. Leg vast welke apparaten zijn getest, onder welke omstandigheden, met welke resultaten. Als u codes op grote schaal implementeert, stelt u acceptatiecriteria op: misschien een succespercentage van 95% voor uw apparaattestpool, of succesvolle scans binnen 2 seconden op alle geteste apparaten. Deze normen helpen go/no-go-beslissingen objectief te maken in plaats van op het beste te hopen.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Een uitgebreide testchecklist met betrekking tot apparaten, voorwaarden en acceptatiecriteria',
          caption: 'QR-implementatietestprotocol: systematische verificatie vóór productietoezegging',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Open de generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR voorbeelden bekijken',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'QR voorbeelden bekijken', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'De volledige gebruikershandleiding openen', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Galerie openen', type: 'gallery' },
  ],
};
