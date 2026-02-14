import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR notendahandbók',
  description: 'Heill leiðbeiningar um notkun ANQR til að búa til QR kóða.',
  lastUpdated: '1. febrúar 2026',
  breadcrumb: ['Leiðsögumaður'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Opnaðu rafalann', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Skoða Lærðu greinar', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Að byrja',
      paragraphs: ['ANQR er QR kóða rafall með viðskiptavinur-fyrsta nálgun. Sjálfgefið er að QR kóðar eru búnir til á staðnum í vafranum þínum - enginn reikningur er nauðsynlegur og gögnin þín haldast persónuleg. Fyrir faglega innfellingu geturðu líka notað API á netþjóni.', 'Viðmótið hefur þrjú viðmótsstig: Basic, Advanced og Professional. Veldu þitt stig með því að nota flipana í hausnum. Hvert stig opnar viðbótareiginleika á sama tíma og viðmótið er einbeitt að því sem þú þarft.'],
      bullets: ['Basic: Einföld QR-kóðagerð með látlausum texta/vefslóð og myndyfirlagi.', 'Ítarlegt: QR-kóðunvalkostir, flutningsstíll, hreyfimyndir, úttakssnið, auknar efnisgerðir og sérsniðin yfirborð.', 'Fagmaður: Vatnsmerki, lýsigögn, miðlun, öryggisgreining, QR-kóðar fyrir greiðslur og fyrirtækjaeiginleikar.'],
      links: [{ href: '/?lang=${lang}', label: 'Opnaðu rafalann', type: 'generator' }],
    },
    {
      heading: 'Fljótleg byrjun',
      paragraphs: ['Til að búa til fyrsta QR kóðann þinn:'],
      bullets: ['1. Veldu efnistegund (URL, texti, WiFi, o.s.frv.) í fellilistanum Efnistegund.', '2. Sláðu inn gögnin þín í uppgefnu reitunum.', '3. Valfrjálst aðlaga liti, stíla og bæta við yfirlagsmynd.', '4. Smelltu á Flytja út til að hlaða niður QR kóðanum þínum sem PNG, GIF, WebP eða SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Grunneiginleikar',
      paragraphs: ['Grunnstigið veitir straumlínulagað viðmót til að búa til QR kóða með hleðsluefni og myndayfirlögnum. Þetta er einfaldasta leiðin til að byrja.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Innihaldstegundir (undirstöðu)',
      paragraphs: ['Venjulegur texti: Kóðaðu hvaða texta sem er upp að hámarksfjölda QR kóða. Tilvalið fyrir stutt skilaboð, kóða eða auðkenni.', 'URL: Kóðaðu vefföng. QR kóðinn mun opna slóðina þegar hann er skannaður. Styður http:// og https:// samskiptareglur.'],
    },
    {
      heading: 'Myndyfirlag (einfalt)',
      paragraphs: ['Hladdu upp mynd (JPG, PNG, GIF, WebP) til að blanda saman við QR kóðann þinn. Grunnlögunareiginleikar eru:'],
      bullets: ['Hlaða upp úr skrá: Veldu mynd úr tækinu þínu.', 'Hlaða af vefslóð: Sláðu inn vefslóð myndar (verður að leyfa CORS).', 'Miðmerki: Setur mynd í miðjuna og treystir á villuleiðréttingu.', 'Blanda: Einföld alfablöndun myndar með QR mynstri.', 'Styrkur: Stjórnar hversu mikil áhrif yfirborðið hefur á QR kóða (0-100%).', 'Litastilling: Fullur litur, grátóna eða svarthvítur.', 'Varðveittu leitarmynstur: Heldur hornmynstri óbreyttu fyrir áreiðanlega skönnun.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Ítarlegir eiginleikar',
      paragraphs: ['Háþróað stig opnar QR-kóðunvalkosti, flutningsstíla, hreyfimyndir, úttakssnið, útvíkkaðar efnisgerðir og háþróaða aðlögun yfirborðs.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'QR kóðunarstillingar',
      paragraphs: ['Útgáfa: QR kóðar koma í útgáfum 1-40, með hærri útgáfum sem geyma meiri gögn en eru stærri. Stilltu á 0 (Sjálfvirkt) til að láta ANQR velja minnstu útgáfuna sem passar við efnið þitt.', 'Villuleiðrétting: Ákveður hversu mikið tjón QR-kóði getur orðið fyrir á meðan hann er skannlegur.'],
      bullets: ['L (Lágt): 7% villuleiðrétting - minnsta stærð, minnst offramboð.', 'M (miðlungs): 15% villuleiðrétting - jafnvægi valkostur.', 'Q (fjórðungur): 25% villuleiðrétting - gott fyrir prentaða kóða.', 'H (Hátt): 30% villuleiðrétting - best fyrir kóða með yfirlögn eða við erfiðar aðstæður.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Quiet Zone (Margin)',
      paragraphs: ['Hið hljóðláta svæði er hvíta rýmið í kringum QR kóðann. Skannar þurfa þessa spássíu til að greina hvar kóðinn byrjar. Staðallinn mælir með að minnsta kosti 4 einingum. Ef fækkað er niður fyrir 4 getur það valdið skönnunarvandamálum.'],
    },
    {
      heading: 'Module Style',
      paragraphs: ['Einingar eru einstakir reitir sem mynda QR kóða. ANQR býður upp á fimm stíla:'],
      bullets: ['Ferningur: Klassískt QR útlit með skörpum hornum.', 'Ávalar: Mýkt horn fyrir vinalegra útlit.', 'Punktar: Hringlaga einingar fyrir nútímalega fagurfræði.', 'Demantur: 45° snúnir ferningar fyrir sérstakt mynstur.', 'Tengdar: Einingar sameinast þegar þær eru aðliggjandi og mynda lífræn form.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Finder Pattern Style',
      paragraphs: ['Finnarmynstur eru þrír stóru ferningarnir í QR hornum sem hjálpa skanna að stilla kóðann. Stíll í boði:'],
      bullets: ['Ferningur: Venjuleg ferhyrnd horn.', 'Rúnnuð: Mýkuð horn sem passa við ávöl einingarstíl.', 'Hringur: Hringlaga leitarmynstur fyrir kóða í punktastíl.'],
    },
    {
      heading: 'Jöfnunar- og tímasetningarmynstur',
      paragraphs: ['Jöfnunarmynstur birtast í stærri QR kóða (útgáfa 2+) til að hjálpa til við að leiðrétta röskun. Tímamynstur eru til skiptis línurnar sem tengja saman leitarmynstur.'],
      bullets: ['Jöfnunarstíll: Samsvörunarleit, ferningur, ávölur eða hringur.', 'Tímasetningarstíll: Passa mát, solid eða strikað.'],
    },
    {
      heading: 'Litir',
      paragraphs: ['Forgrunnur: Litur QR eininganna. Svartur (#000000) er staðalbúnaður en allir dökkir litir virka.', 'Bakgrunnur: Bakgrunnsliturinn. Hvítt (#ffffff) er staðalbúnaður. Gakktu úr skugga um nægjanlega birtuskil við forgrunninn.', 'Gegnsætt bakgrunnur: Fjarlægðu bakgrunninn algjörlega til notkunar á lituðum flötum. Gakktu úr skugga um að yfirborðið gefi fullnægjandi birtuskil.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Einingastærð og bil',
      paragraphs: ['Einingastærð: Stjórnar hversu stór hver eining er sýnd í pixlum. Stærri gildi skapa stærri kóða sem auðveldara er að skanna.', 'Einingabil: Bætir bili á milli eininga sem prósentu. Lítil bil (5-15%) geta bætt skannanleika við sumar aðstæður en of mikið bil dregur úr áreiðanleika.'],
    },
    {
      heading: 'Úttaksstillingar',
      paragraphs: ['Snið: Veldu útflutningssniðið þitt byggt á notkunartilvikum.'],
      bullets: ['PNG: Taplaust rastersnið, tilvalið fyrir flesta notkun. Best fyrir prentað og stafrænt.', 'WebP: Nútímalegt snið með minni skráarstærðum. Gott til notkunar á vefnum.', 'GIF: Nauðsynlegt fyrir hreyfimyndaða QR kóða. Styður gagnsæi.', 'SVG: Vektorsnið sem stækkar óendanlega. Best fyrir stórt letur eða þegar þú þarft að breyta kóðanum.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' },
      ],
    },
    {
      heading: 'Úttaksstærðir',
      paragraphs: ['Breidd/hæð: Stilltu framleiðslustærðina í pixlum. Fyrir prentun, reiknaðu út frá DPI (t.d. 300 DPI við 1 tommu = 300px). Stærri stærðir skanna áreiðanlegri í fjarlægð.'],
    },
    {
      heading: 'Hreyfistillingar (Ítarlegar)',
      paragraphs: ['Stjórna hegðun QR kóða hreyfimynda:'],
      bullets: ['Hraði: Rammahraði hreyfimynda í millisekúndum.', 'Loop: Stöðugt hreyfimynd eða stakspilun.', 'Hopp: Ping-pong hreyfimyndastefna.', 'Start Frame: Byrjaðu hreyfimynd frá tilteknum ramma.', 'Hámarks rammar: Takmarka heildarramma í hreyfimyndum.', 'Rammaskref: Slepptu ramma fyrir hraðari hreyfimynd.', 'Interpolation: Engin, Crossfade eða Morph á milli ramma.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' },
      ],
    },
    {
      heading: 'Efnistegundir (háþróaður)',
      paragraphs: ['Háþróað stig opnar fleiri hleðslusnið:'],
      bullets: [
        'Símanúmer (sími:): Býr til símatengil sem hægt er að hringja í.',
        'Tölvupóstur (mailto:): Opnar tölvupóstforrit með valfrjálsu efni og meginmáli.',
        'SMS: Forútfyllt textaskilaboð í símanúmer.',
        'vCard: Fullt tengiliðakort með nafni, fyrirtæki, síma, netfangi, heimilisfangi.',
        'MeCard: Fyrirferðarlítið tengiliðasnið vinsælt í Japan.',
        'BizCard: Eldra nafnspjaldasnið.',
        'Landfræðileg staðsetning: GPS hnit sem opnast í kortum.',
        'WiFi: Netskilríki fyrir sjálfvirka tengingu (SSID, lykilorð, öryggistegund).',
        'Dagatalsviðburður: iCalendar snið með titli, staðsetningu, dagsetningu/tíma.',
        'Viðburður RSVP: Tengill á skráningarsíðu viðburðar.',
        'Dagatalsáskrift: Gerast áskrifandi að ICS/WebCal straumi.',
        'Slóð skráar/skjals: Beinn hlekkur á skrár sem hægt er að hlaða niður.',
        'Cloud Storage Link: Tenglar á Google Drive, Dropbox, OneDrive osfrv.',
        'Félagslegur prófíll: Tenglar á LinkedIn, Twitter, Instagram, osfrv.',
        'Skilaboðahlekkur: WhatsApp, Telegram, Signal djúptenglar.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Háþróaðir yfirlagareiginleikar',
      paragraphs: ['Viðbótarálagsmöguleikar:'],
      bullets: ['Skera: Virkjaðu klippingu til að velja ferningshluta á myndinni þinni.', 'Hálftónn: Klassískt punktamynstur í prentstíl byggt á birtustigi myndarinnar.', 'Dreifð: Dreifing með villudreifingu fyrir nákvæma endurgerð.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Yfirlagsblöndunarstillingar (háþróaður)',
      paragraphs: ['Viðbótarblöndunarstillingar í Advanced level:'],
      bullets: ['Undirpixla: Skiptir hverri einingu í undirpixla fyrir meiri smáatriði.', 'Blár hávaði: Notar bláa hávaðasveiflu fyrir munstur án gripa.', 'Mósaík: Áhrif sem byggjast á flísum sem varðveita myndbyggingu.', 'Gap Fill: Setur mynd í eyður á milli eininga.', 'Birtustig: Breytileg einingastærð miðað við birtustig myndarinnar.', 'Duotone: Kortar mynd í tvo liti fyrir sláandi birtuskil.'],
    },
    {
      heading: 'Yfirlagsstyrkur',
      paragraphs: ['Stjórnar hversu mikil áhrif yfirborðið hefur á QR kóða (0-100%). Hærri gildi sýna meiri myndupplýsingar en geta dregið úr skannanleika. Byrjaðu um 70% og stilltu þig út frá prófunum.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' }],
    },
    {
      heading: 'Litastilling',
      paragraphs: ['Hvernig yfirborðsmyndin er unnin:'],
      bullets: ['Fullur litur: Varðveitir upprunalega myndliti.', 'Grátónar: Breytir í svarta og hvíta tóna.', 'Svart og hvítt: Tvöfaldur umbreyting með miklum birtuskilum.'],
    },
    {
      heading: 'Varðveittu Finder Patterns',
      paragraphs: ['Þegar það er virkt, heldur þremur hornleitarmynstrum óbreyttum af yfirborðinu. Mælt er eindregið með fyrir áreiðanlega skönnun.'],
    },
    {
      heading: 'Myndaforvinnsla',
      paragraphs: ['Notaðu síur á yfirborðsmyndina þína áður en henni er blandað. Þessar breytingar geta bætt hvernig myndin birtist í endanlegum QR kóða.'],
      bullets: ['Birta (-100 til +100): Léttu eða dekktu myndina.', 'Andstæða (-100 til +100): Auka eða minnka tónsvið.', 'Gamma (0,2 til 3,0): Ólínuleg birtustilling. Gildi undir 1 lýsa miðtóna, yfir 1 dökkna þá.', 'Mettun (-100 til +100): Litastyrkur. -100 er grátóna, +100 er ofmettað.', 'Hue Rotate (0-360°): Breyttu öllum litum í kringum litahjólið.', 'Þoka (0-20px): Mýkja smáatriði myndarinnar.', 'Skerpa (0-100%): Bættu brúnir og smáatriði.', 'Posterize (0-16 stig): Dragðu úr litastigum fyrir veggspjaldáhrif.', 'Þröskuldur (0-255): Umbreyta í tvíundir svart/hvítt við skurðpunkt.', 'Edge Detection: Sobel eða Canny reiknirit til að sýna aðeins brúnir.', 'Snúa við: Snúa öllum litum við.'],
    },
    {
      heading: 'Fit Mode',
      paragraphs: ['Hvernig yfirborðsmyndin passar við QR kóða svæðið:'],
      bullets: ['Kápa: Mynd fyllir allt svæðið, skera ef þörf krefur.', 'Inniheldur: Öll myndin sýnileg, gæti haft spássíur.', 'Teygja: Mynd brenglast til að fylla nákvæmlega.'],
    },
    {
      heading: 'Umbreytingarvalkostir',
      paragraphs: ['Snúningur: Snúðu yfirlaginu í 90° þrepum.', 'Flip X/Y: Speglaðu myndinni lárétt eða lóðrétt.'],
    },
    {
      heading: 'Þurrkunaralgrím',
      paragraphs: ['Dithering breytir samfelldum tónum í mynstur sem QR kóðar geta táknað. Tiltækt þegar þú notar Dithered, Blue Noise, eða True Dither blöndunarstillingar.'],
      bullets: [
        'Villudreifing: Klassískur Floyd-Steinberg stíll. Dreifir magngreiningarvillu til nágrannapixla.',
        'Pantað (Bayer): Notar þröskuldsfylki fyrir venjuleg mynstur.',
        'Clustered Dot: Líkir eftir hálftónaprentun.',
        'Void & Cluster: Fínstillt pöntuð öflun.',
        'Blár hávaði: Sjónrænt skemmtilegt mynstur með handahófi.',
        'Blue Noise Threshold: Þröskuldsþröskuldur með blárri hávaða áferð.',
        'Hvítur hávaði: Tilviljunarkennd þröskuldur.',
        'Gaussískur/þríhyrningslaga hávaði: Hávaði með mismunandi dreifingu.',
        'Blue Noise + Error Diffusion: Hybrid sem sameinar báðar aðferðir.',
        'Skjár blár hávaði: Blár hávaði sem líkist skjá.',
        'Skynjun: Ljósstyrksvigt fyrir betri sjónrænan árangur.',
        'Edge-Aware: Varðveitir brúnir myndar meðan á snertingu stendur.',
        'Aðlagandi þröskuldur: Staðbundið aðlagandi þröskuldur.',
        'Tímabundinn blár hávaði: Fyrir GIF-myndir, breytilegt mynstur eftir ramma.',
      ],
    },
    {
      heading: 'Dreifingarkjarnar',
      paragraphs: ['Þegar þú notar Error Diffusion dithering skaltu velja hvernig villunni er dreift:'],
      bullets: ['Floyd-Steinberg: Klassísk 4 nágrannadreifing. Gott almennt val.', 'Jarvis-Judice-Ninke: 12-nágranni, sléttari en hægari.', 'Stucki: Svipað og JJN með mismunandi þyngd.', 'Burkes: Einfaldað JJN, hraðar.', 'Sierra: Fjölskylda kjarna sem jafnvægi gæði og hraða.', 'Atkinson: Ljósdreifing, varðveitir smáatriði en getur verið kornótt.'],
    },
    {
      heading: 'Þykktur styrkur',
      paragraphs: ['Stýrir því hversu mikilli duft er beitt (0-100%). Lægri gildi varðveita meira af upprunalega mynstrinu, hærri gildi sýna meiri smáatriði myndarinnar.'],
    },
    {
      heading: 'Stillingar undirpixla',
      paragraphs: ['Þegar þú notar Subpixel blend mode:'],
      bullets: ['Risastærð: 2×2, 3×3 eða 4×4 undirpixlar í hverri einingu. Hærra = meiri smáatriði.', 'Miðjuregla: Strangt krefst miðpunkts til að passa við einingu. Hálftónamiðstöð leyfir afbrigði.', 'Hlutlaus litur: Litur notaður fyrir óákveðna undirpixla.', 'Finder Override: Hvernig leitarmynstur eru birt (Solid eða Stylized).'],
    },
    {
      heading: 'Hálftónastillingar',
      paragraphs: ['Þegar hálftónablöndunarstilling er notuð:'],
      bullets: ['Hólfstærð: Per eining eða N×N rist.', 'Punktaform: Hringur, ferningur eða lína.', 'Birtuferill: Línuleg, S-ferill eða Gamma.'],
    },
    {
      heading: 'Duotone litir',
      paragraphs: ['Þegar þú notar Duotone blend mode skaltu stilla Shadow lit (dökk svæði) og Highlight lit (björt svæði).'],
    },
    {
      heading: 'GIF hreyfimyndastillingar',
      paragraphs: ['Þegar þú notar hreyfimyndaðar GIF yfirborð:'],
      bullets: ['Notaðu rammatafir: Virtu upprunalega GIF tímasetningu.', 'Hámark FPS: Takmarka rammahraða (1-60 fps).', 'Meðhöndlun förgunar: Virðið eða einfaldaðu förgunaraðferðir ramma.'],
    },
    {
      heading: 'Ítarlegir flutningsvalkostir',
      paragraphs: ['Viðbótaruppfærslustýringar:'],
      bullets: ['Gap Mode: None, Inset, Stroke, eða Negative Space gap stíl.', 'Hornradíus: Prósenta ávöl horna fyrir einingar.', 'Halli: Enginn, Línulegur, Radial eða Conic halli á einingum.', 'Ytri/innri augnstíll: Sjálfstæð stíll fyrir hringi með finnaarmynstur.', 'Punktasnúningur: Snúðu tígul/punktaeiningum.', 'Augnkvarði: Stærðarstilling fyrir finnaarmynstur.', 'Rammastíll: Bættu við skrautrömmum (ávalinn rammi, límmiði, merki).', 'Rammatexti: Bættu við texta eins og "Skannaðu mig!" til ramma.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Ítarleg QR kóðun',
      paragraphs: ['Fínstilla QR kóðun:'],
      bullets: ['Kóðunarhamur: Sjálfvirkt, Tölulegt, Alfatölulegt, Bæti/UTF-8 eða Kanji.', 'Framfylgja Min Quiet Zone: Gakktu úr skugga um að minnsta kosti 4 eininga framlegð.', 'Grímamynstur: Sjálfvirkt (ákjósanlegt), eða valið mynstur 0-7 handvirkt til að stjórna dreifingu eininga. Mismunandi mynstur skapa mismunandi sjónrænt útlit á meðan sömu gögn eru umrituð.', 'Stafakóðun: ISO-8859-1 (Latin-1 sjálfgefið), UTF-8 (fullur Unicode þar á meðal emoji) eða Shift-JIS (japanska). Veldu byggt á eðliskröfum efnisins þíns.'],
    },
    {
      heading: 'Ítarlegir úttaksvalkostir',
      paragraphs: ['Viðbótarútflutningsstillingar:'],
      bullets: ['Skráarnafn: Sérsniðið skráarheiti fyrir niðurhal.', 'GIF litatöflustærð: 2-256 litir í GIF úttak.', 'GIF Quantizer: Median Cut, NeuQuant eða Octree litaskerðing.', 'GIF-dreifing: Slökkt, Floyd-Steinberg eða pantað.', 'GIF gegnsær litur: Stilltu lit til að vera gegnsær.', 'SVG True Vector: Notaðu slóðir í stað innbyggðra rastera.', 'SVG Shape Precision: Pixel eða nákvæm slóðagerð.', 'SVG Embed Raster Overlay: Hafa yfirlag sem innfellda mynd.', 'Bakgrunnshnekning: Þvingaðu fram ákveðinn bakgrunnslit í úttakinu.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Staðfestingarvalkostir',
      paragraphs: ['Inntaksvinnsla stillingar:'],
      bullets: ['Staðfestu innslátt: Athugaðu efnissnið fyrir kóðun.', 'Klipptu hvítbil: Fjarlægðu fremstu/aftandi rými.', 'Samræma nýlínur: Umbreyttu öllum línuendingum í LF.', 'Max Length Guard: Varaðu þig við ef innihald fer yfir QR getu.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Faglegir eiginleikar',
      paragraphs: ['Professional stigið bætir við vatnsmerkjum, lýsigögnum, samnýtingarvalkostum, öryggisgreiningu, greiðslu QR kóða og fyrirtækjaeiginleikum.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Vatnsmerki',
      paragraphs: ['Bættu vatnsmerkjum við QR kóðana þína:'],
      bullets: ['Tegund: Texti, mynd eða mynstur vatnsmerki.', 'Staða: Miðja, horn, brúnir, aftan við eða rólegt svæði.', 'Ógagnsæi: Gagnsæi vatnsmerkis (0-100%).', 'Blöndunarstilling: Venjuleg, margfalda, skjár eða yfirlagsblöndun.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
      ],
    },
    {
      heading: 'Lýsigögn',
      paragraphs: ['Fella inn lýsigögn í útfluttar skrár:'],
      bullets: ['Titill, Höfundur, Höfundarréttur, Leyfi, Lýsing reitir.', 'Sköpunartími: Fella inn kynslóðartímastimpil.', 'Sérsniðið lykilgildi: Bættu við handahófskenndum lýsigagnapörum.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
      ],
    },
    {
      heading: 'Samnýting',
      paragraphs: ['Deildu QR kóða stillingum þínum:'],
      bullets: ['Beinn hlekkur: Búðu til vefslóð sem hægt er að deila með núverandi stillingum þínum.', 'Fella inn HTML: Fáðu innfellda kóða fyrir vefsíður.', 'Kóða færibreytur: Láttu allar stillingar fylgja með vefslóð samnýtingar.', 'Athugið: Yfirlagsmyndum úr staðbundnum skrám er ekki hægt að deila með vefslóð.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' },
      ],
    },
    {
      heading: 'Öryggisgreining',
      paragraphs: ['Gakktu úr skugga um að QR kóðar séu áfram skannaanlegir:'],
      bullets: ['Öryggisstilling: Slökkt, jafnvægi eða strangar kröfur um skönnun.', 'Lágmarksstærð eininga: Lágmarkspixlastærð á hverja einingu.', 'Min Quiet Zone: Lágmarks framlegðareiningar.', 'Læsa finnar/Tímasetning/Jöfnun/Format/Útgáfa: Verndaðu tiltekna þætti.', 'Max Overlay Intensity by ECC: Sjálfvirk styrkleikamörk byggð á villuleiðréttingarstigi.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' },
      ],
    },
    {
      heading: 'Efnistegundir (fagmenntaðar)',
      paragraphs: ['Fagmannastig bætir við gerðum greiðslu og fyrirtækjaefnis:'],
      bullets: ['EPC/SEPA (ESB): Evrópsk bankamillifærslu QR kóða með IBAN, BIC, upphæð, tilvísun.', 'UPI (Indland): Sameinað greiðsluviðmót með VPA, nafn viðtakanda, upphæð.', 'PayNow (Singapúr): Singapúr hröð greiðsla með UEN eða farsímanúmeri.', 'PromptPay (Taíland): Taílenskt innlent greiðslukerfi.', 'PIX (Brasilía): Brasilísk skyndigreiðsla með PIX lykli.', 'Crypto: Bitcoin, Ethereum, Litecoin greiðsluföng með valfrjálsu magni.', 'Marketing Campaign Link: Vefslóðir með fullri UTM færibreytu (Marketing Tags) rakningu.', 'Stuttur hlekkur: Til notkunar með vefslóðastyttingum fyrir kraftmikla/rekjanlega QR kóða.', 'GS1 Digital Link: Vöruauðkenni með GTIN, raðnúmeri, lotu, rennur út.', 'App Deep Link: iOS/Android app djúptenglar með sérsniðnum kerfum.', 'Sérsniðið snið: Hrá gögn án sniðs eða staðfestingar.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Tungumálaviðeigandi greiðslur í háþróaðri stillingu',
      paragraphs: ['Þegar þú notar háþróaða stillingu sýnir ANQR sjálfkrafa greiðslumáta sem skipta máli fyrir valið tungumál. Til dæmis sjá víetnamskir notendur VietQR, taílenskir ​​notendur PromptPay og indverskir notendur sjá UPI og BharatQR. Alþjóðlegar greiðslumátar (cryptocurrency, PayPal, Cash App) eru í boði á öllum tungumálum. Professional mode opnar alla greiðslustaðla óháð tungumáli.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'evrópskir greiðslustaðlar',
      bullets: ['EPC/SEPA (ESB): Evrópskur QR kóðar fyrir bankamillifærslu sem fylgja EPC QR Code Standard. Styður IBAN, BIC (valfrjálst fyrir innanlands), upphæð í evrum og skipulagðar eða ómótaðar greiðsluviðmiðanir. Notað á SEPA-svæðinu, þar með talið ESB lönd ásamt Sviss, Noregi, Íslandi, Liechtenstein, Mónakó og San Marínó.', 'Svissneskur QR-víxill: Svissneskur greiðslustaðall í samræmi við SIX framkvæmdaleiðbeiningar. Styður CHF og EUR, QR-tilvísun (QRR), kröfuhafaviðmiðun (ISO 11649), skipulögð heimilisföng kröfuhafa/skuldara og reikningsupplýsingar. Áskilið fyrir svissneska reikninga síðan 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Indverskir greiðslustaðlar',
      bullets: ['UPI (Indland): Unified Payments Interface eftir NPCI Deep Linking Specification. Styður VPA (Virtual Payment Address), nafn viðtakanda greiðslu, upphæð í INR, færslunótu, tilvísunarauðkenni, söluaðilaflokkskóða og viðskiptaham.', 'BharatQR (Indland): Sameinaður QR staðall sem styður bæði UPI og kortatengdar greiðslur. Sameinar UPI VPA með kort PAN fyrir hámarks eindrægni. Inniheldur nafn söluaðila, borg, MCC, GST upplýsingar og reiknings-/tilvísunarnúmer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Suðaustur-Asíu greiðslustaðlar',
      bullets: ['PayNow (Singapúr): Singapúr hraðgreiðslukerfi sem notar EMVCo QR forskrift með SGQR prófíl. Styður UEN (skráning fyrirtækja), farsímanúmer eða NRIC sem umboðsauðkenni. Inniheldur breytihæfni fjárhæðar og fyrningardagsetning.', 'PromptPay (Taíland): Taílenskt innlent greiðslukerfi eftir EMV-prófíl Taílands. Styður farsímanúmer, landsnúmer, skattauðkenni, rafveskis auðkenni og greiðslu reikninga með mörgum tilvísunarreitum.', 'QRIS (Indónesía): Indónesískur staðall fyrir hraðsvörun. EMV-byggður innlendur greiðslustaðall sem styður auðkenni söluaðila, NMID (National Merchant ID), flokkun viðmiðunaraðila og þægindagjöld (fast eða prósenta).', 'DuitNow (Malasía): Malasískt skyndigreiðslukerfi. Styður margar umboðsgerðir, þar á meðal NRIC, farsíma, vegabréf, auðkenni her og skráningarnúmer fyrirtækja.', 'VietQR (Víetnam): Víetnamskur millibankastaðall. Krefst banka BIN (NAPAS auðkenningar) og reikningsnúmer. Styður marga þjónustukóða fyrir mismunandi flutningsgerðir (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filippseyjar): Filippseyskur QR greiðslustaðall fyrir InstaPay og PESONet. Notar reikningsnúmer með auðkenni söluaðila fyrir P2M (mann-til-kaupmanns) viðskipti.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Austur-asískir greiðslustaðlar',
      bullets: ['TWQR (Taiwan): Taívanskur QR greiðslustaðall. Styður auðkenni söluaðila, skattaauðkenni og TWD upphæðir.', 'HKQR/FPS (Hong Kong): QR kóðar fyrir hraðari greiðslukerfi Hong Kong. Styður FPS auðkenni, farsímanúmer eða tölvupóst sem greiðsluauðkenni. Upphæðir í HKD.', 'JPQR (Japan): Japanskur sameinaður QR kóða greiðslustaðall. Notar auðkenni verslunar til að auðkenna söluaðila með JPY upphæðum.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Aðrir svæðisbundnir greiðslustaðlar',
      bullets: ['PIX (Brasilía): Skyndigreiðslukerfi brasilíska seðlabankans samkvæmt BR kóða forskrift. Styður PIX lykla (CPF, CNPJ, tölvupóstur, sími eða handahófslykill), nafn/borg söluaðila, færsluauðkenni og BRL upphæðir.', 'AusPayNet/NPP PayID (Ástralía): Nýtt ástralskt greiðslukerfi PayID kerfi. Styður PayID tegundir (tölvupóstur, farsími, ABN, fyrirtækis auðkenni) eða hefðbundið BSB + reikningsnúmer. Nafn söluaðila er valfrjálst þar sem greiðendur sjá skráð nafn frá NPP leit.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Cryptocurrency greiðslur',
      bullets: ['Bitcoin/Litecoin (BIP-21): Hefðbundin greiðslu-URI fyrir dulritunargjaldmiðil með heimilisfangi veskis, valfrjálsu magni og merkimiða. Samhæft við öll helstu Bitcoin og Litecoin veski.', 'Lightning Network (BOLT11): Lightning Network greiðslureikningar. Límdu BOLT11 kóðaðan reikningsstreng fyrir tafarlausar Bitcoin greiðslur með lágmarksgjöldum.', 'Ethereum (EIP-681): Ethereum viðskiptabeiðni URIs sem styðja innfæddar ETH millifærslur og ERC-20 táknaflutninga. Inniheldur keðjuauðkenni fyrir fjölnetastuðning (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gasbreytur og samningsaðgerðaköll.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Greiðslutengingarþjónusta',
      bullets: ['PayPal.Me: PayPal greiðslutenglar með notendanafni og valfrjálsu fyrirframútfylltri upphæð. Viðtakendur geta greitt með PayPal inneign, kortum eða bankareikningum.', 'Cash App: Cash App greiðslutenglar með $cashtag með valfrjálsu upphæð. Vinsælt í Bandaríkjunum fyrir jafningjagreiðslur.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Almennur EMV QR',
      bullets: ['EMV Generic: Búðu til sérsniðna EMV Merchant-Presented Mode QR kóða fyrir greiðslukerfi sem ekki eru sérstaklega skráð. Stilltu nafn söluaðila, borg, landskóða (ISO 3166-1), gjaldmiðilskóða (ISO 4217 tölustafur), MCC, valmöguleikar ábendinga/þægindagjalda og viðbótargagnasvið. Gagnlegt fyrir prófun eða sérsniðnar samþættingar.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Yfirlagsblöndunarstillingar (fagmenn)',
      paragraphs: ['Viðbótarblöndunarstillingar á fagstigi:'],
      bullets: ['Pixelate: Pixelated yfirborðsáhrif.', 'Útlínur: Kantskynjunaryfirlag sýnir aðeins útlínur.', 'Bylgja: Bylgjuáhrif.', 'Stærð undirpixla: Breytileg stærð undirpixla byggt á mynd.', 'True Dither: Háþróuð döftun með röðuðu fylkisvali.', 'Extreme: Hámarkssýnileiki myndar, getur haft áhrif á skannanleika.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Verndarstillingar',
      paragraphs: ['Fínn stjórn á því hvaða QR þættir eru varðir fyrir breytingum á yfirborði:'],
      bullets: ['Varðveittu tímasetningu: Haltu tímasetningarmynstri óbreyttu.', 'Varðveittu jöfnun: Haltu jöfnunarmynstri óbreyttu.', 'Verndaðu sniðupplýsingar: Upplýsingaeiningar skjaldsniðs.', 'Vernda útgáfuupplýsingar: Shield útgáfu upplýsingaeiningar.'],
    },
    {
      heading: 'ECC-meðvitaður hamur',
      paragraphs: ['Dreifir yfirlagsstyrk á skynsamlegan hátt miðað við getu villuleiðréttingar. Kerfið greinir hvaða einingar er hægt að breyta á meðan hægt er að skanna.'],
      bullets: ['Risk Budget: Hlutfall villuleiðréttingargetu til að nota (0-100%).', 'Hærra kostnaðarhámark = sýnilegri yfirborð en áhættusamari skannanleiki.', 'Lægra fjárhagsáætlun = öruggari skönnun en minna sýnileg yfirborð.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Fagleg flutningsvalkostir',
      paragraphs: ['Ítarlegar flutningsstýringar:'],
      bullets: ['Skarpar brúnir: Notaðu pixlaða myndbirtingu fyrir skarpar einingarbrúnir.', 'Pixel Snap: Gólf, kringlótt eða loft pixla jöfnun.', 'Litastilling fyrir hverja einingu: Föst, eftir birtustigi, eftir staðsetningu, eftir yfirborði, eftir klasa.', 'Litapalletta: Skilgreindu sérsniðna litatöflu fyrir litun á hverja einingu.', 'Andstæðavörn: Tryggðu lágmarks birtuhlutfall milli lita.', 'Lágmarksbirtuhlutfall: Krafa um birtuskil í WCAG-stíl (1:1 til 21:1).', 'Auka landamæraeiningar: Viðbótarmörk handan hljóðláts svæðis.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Professional Output Options',
      paragraphs: ['Útflutningsstillingar fyrirtækja:'],
      bullets: ['DPI: Stilltu prentupplausn (72-600 DPI). 300 DPI mælt með fyrir prentun.', 'Hafa kyrrlátt svæði: Skiptu um hljóðlát svæði í úttaksvíddum.', 'Flytja út sem viðbótar: Búðu til PDF samhliða aðalsniði.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'Hreyfistillingar (Professional)',
      paragraphs: ['Viðbótarupplýsingar um faglega hreyfimyndir:'],
      bullets: ['Temporal Dither: Slökkt, Blue Noise, eða Flicker Safe á hvern ramma.', 'Mynstur: None, Pulse, Wave, Scanline, Shimmer eða Drift áhrif.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API tilvísun',
      paragraphs: ['ANQR býður upp á API á miðlara til að búa til QR kóða með vefslóð breytum. Þetta er tilvalið til að fella QR kóða inn í vefsíður, tölvupósta, skjöl eða sjálfvirk vinnuflæði án JavaScript-hliðar viðskiptavinar.', 'Grunnslóð: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'example' }],
    },
    {
      heading: 'Grunnfæribreytur',
      paragraphs: ['Nauðsynlegar og algengar færibreytur (færibreytanöfn eru ekki þýdd):'],
      bullets: ['gögn (krafist): Innihaldið sem á að kóða í QR kóða. URL-kóða sérstafi.', 'stærð: Myndastærð í pixlum (sjálfgefið: 400, hámark: 2000). Notað ef m/klst er ekki tilgreint.', 'w, h: Úttaksbreidd og hæð í pixlum. Hnekkir stærðarfæribreytu.', 'snið: Úttakssnið - png, webp eða gif (sjálfgefið: png).', 'ec: Villuleiðréttingarstig - L, M, Q eða H (sjálfgefið: H).', 'fg: Forgrunnslitur sem hex án # (sjálfgefið: 000000).', 'bg: Bakgrunnslitur sem hex án # (sjálfgefið: ffffff).', 'gagnsæ: Stilltu á 1 fyrir gagnsæjan bakgrunn.', 'spássía: Rólegt svæði í einingum (sjálfgefið: 4).'],
    },
    {
      heading: 'Stílbreytur',
      paragraphs: ['Mát og mynstur stíl:'],
      bullets: ['stíll: Einingastíll - ferningur, ávölur, punktar, demantur, tengdur.', 'finnandi: Finnamynsturstíll - ferningur, ávölur, hringur.', 'align: Stíll jöfnunarmynsturs - match_finder, ferningur, ávöl, hringur.', 'tímasetning: Stíll tímasetningarmynsturs - match_module, solid, dashed.', 'radíus: Hornradíus prósenta 0-100.', 'bil: Einingabilshlutfall 0-50.', 'gapMode: Gap mode - ekkert, innfellt, högg, negative_space.', 'ytra auga, innra auga: Augnstíll - ferningur, ávöl, hringur.', 'eyeScale: Augnkvarðahlutfall (sjálfgefið: 100).', 'stig: Stigullgerð - engin, línuleg, geislamynduð, keilulaga.', 'gradAngle: Hallihorn fyrir línulega halla.', 'GradStops: Halli stoppar sem litur1,pos1,litur2,pos2,... (t.d. ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Yfirlagsfæribreytur',
      paragraphs: ['Myndyfirlagsvalkostir (yfirlagsmynd er sótt miðlarahlið):'],
      bullets: ['img: Slóð á yfirborðsmynd (verður að vera aðgengileg almenningi).', 'háttur: Yfirlagshamur - miðju, hálftónn, blanda, birta, mósaík, dæld, blár hávaði, undirpixla.', 'styrkleiki: Yfirlagsstyrkur 0-100 (sjálfgefið: 100).', 'colorMode: Yfirborðslitastilling - litur, grátóna, bw.', 'passa: Hvernig yfirlagið passar - hylja, innihalda, teygja.', 'rotnun: Yfirlagssnúningur í gráðum.', 'flipX, flipY: Stilltu á 1 til að snúa yfirlagi.', 'keepFinders: Varðveittu leitarmynstur (sjálfgefið: 1).', 'keepTiming, keepAlign: Stilltu á 1 til að varðveita tímasetningu/jöfnunarmynstur.'],
    },
    {
      heading: 'Forvinnslufæribreytur',
      paragraphs: ['Myndaforvinnsla beitt á yfirborð:'],
      bullets: ['birta: Stilling -100 til 100 (sjálfgefið: 0).', 'andstæða: Stilling -100 til 100 (sjálfgefið: 0).', 'gamma: Gildi 0,1 til 3 (sjálfgefið: 1).', 'mettun: Stilling -100 til 100 (sjálfgefið: 0).', 'litbrigði: Litbrigði í gráðum.', 'blur: Þoka í punktum.', 'skerpa: skerpa magn 0-100.', 'posterize: Posterize stig.', 'þröskuldur: Tvöfaldur þröskuldur 0-255.', 'brún: Kantskynjun - slökkt, sobel, hógvær.', 'invert: Stilltu á 1 til að snúa litum við.'],
    },
    {
      heading: 'Vatnsmerki færibreytur',
      paragraphs: ['Bættu vatnsmerkjum við myndaða QR kóða:'],
      bullets: ['wmEn: Stilltu á 1 til að virkja vatnsmerki.', 'wmKind: Tegund vatnsmerkis - texti, mynd, mynstur.', 'wmText: Vatnsmerkistexti (URL-kóðaður).', 'wmImg: Slóð á vatnsmerkismynd.', 'wmPos: Staða - miðju, horn, brúnir, aftan, rólegt_svæði.', 'wmOpacity: Ógagnsæi 0-100 (sjálfgefið: 50).', 'wmBlend: Blöndunarstilling - venjuleg, margfalda, skjár, yfirborð.'],
    },
    {
      heading: 'Hreyfibreytur',
      paragraphs: ['Fyrir hreyfimyndað GIF úttak (krefst snið=gif):'],
      bullets: ['animPattern: Hreyfimyndarmynstur - ekkert, púls, bylgja, skannalína, shimmer, svif, litahringur.', 'animFrames: Fjöldi ramma 1-60 (sjálfgefið: 24).', 'animSpeed: Ramma seinkun í millisekúndum 10-1000 (sjálfgefið: 100).', 'animSeed: Random fræ fyrir hreyfimyndir.', 'slökun: Slökun á hreyfimyndum - línuleg, ease_in, ease_out, ease_in_out, hopp.'],
    },
    {
      heading: 'Úttaksfæribreytur',
      paragraphs: ['Valkostir úttakssniðs:'],
      bullets: ['gæði: WebP gæði 0-1 (sjálfgefið: 0,9).', 'webpQ: WebP gæði 0-100 (sjálfgefið: 90).', 'gifLitir: GIF litatöflu stærð 2-256 (sjálfgefið: 256).', 'dpi: Output DPI fyrir PNG (sjálfgefið: 72).', 'metaTitle, metaAuthor, metaCopy, metaDesc: PNG lýsigagnareitir.'],
    },
    // Crop Parameters
    {
      heading: 'Uppskera færibreytur',
      paragraphs: ['Skurðvalkostir fyrir yfirlagsmynd:'],
      bullets: ['cropEn: Virkja yfirlagsskurð 0/1 (sjálfgefið: 0).', 'cropX: Crop Center X sem brot 0-1 (sjálfgefið: 0,5).', 'cropY: Uppskera miðja Y sem brot 0-1 (sjálfgefið: 0,5).', 'cropSize: Skera stærð sem brot af mynd 0-1 (sjálfgefið: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Öryggislásstillingar',
      paragraphs: ['Stjórnaðu hvaða QR þættir eru varðir fyrir breytingum á yfirborði:'],
      bullets: ['lockF: Mynstur fyrir lásleitara 0/1 (sjálfgefið: 1).', 'lockT: Læsa tímasetningarmynstur 0/1 (sjálfgefið: 1).', 'lockA: Læsa jöfnunarmynstur 0/1 (sjálfgefið: 1).', 'lockFmt: Upplýsingar um læsingarsnið 0/1 (sjálfgefið: 1).', 'lockV: Upplýsingar um læsa útgáfu 0/1 (sjálfgefið: 1).', 'safeMode: Öryggisstilling - slökkt, jafnvægi, strangt (sjálfgefið: slökkt).', 'safeMinPx: Lágmarkseiningsstærð í pixlum (sjálfgefið: 2).', 'safeMinQz: Lágmarkseining fyrir hljóðlát svæði (sjálfgefið: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Sjálfvirk stilling færibreytur',
      paragraphs: ['Sjálfvirkar fínstillingarstillingar:'],
      bullets: ['autoVer: Veldu QR útgáfu 0/1 sjálfkrafa (sjálfgefið: 1).', 'autoEcc: Sjálfvirk val ECC stig 0/1 (sjálfgefið: 0) - aðeins vísbending á þjóninum.', 'autoReduce: [AÐEINS BÚNAÐUR] Dragðu sjálfkrafa úr styrkleika þar til hægt er að skanna - krefst skannastaðfestingarlykkja.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Viðbótarbreytur hreyfimynda',
      paragraphs: ['Útvíkkuð hreyfimyndastýringar fyrir GIF úttak:'],
      bullets: ['lykkja: Hreyfilykkjur ganga stöðugt 0/1 (sjálfgefið: 1).', 'hopp: Ping-pong hreyfimyndastefna 0/1 (sjálfgefið: 0).', 'afturábak: Spila hreyfimynd afturábak 0/1 (sjálfgefið: 0).', 'colorCycle: Virkja lithjólaáhrif 0/1 (sjálfgefið: 0).', 'interp: Frame interpolation - engin, crossfade, morph (sjálfgefið: enginn).', 'tempDither: Temporal dithering - off, blue_noise, flicker_safe (sjálfgefið: slökkt).', 'startF: Upphafsrammi hreyfimynda (sjálfgefið: 0).', 'maxF: Hámarks rammar til að birta (sjálfgefið: 0 = sjálfvirkt).', 'stepF: Frame step interval (sjálfgefið: 1).', 'jitter: [AÐEINS BÚNAÐUR] Eining jitter í pixlum - krefst endurnýjunar á QR fyrir hvern ramma.'],
    },
    // Dithering Parameters
    {
      heading: 'Þurrunarfæribreytur',
      paragraphs: ['Stjórna töfrunaralgrím fyrir yfirlagsvinnslu:'],
      bullets: ['ditherKind: Dither reiknirit - error_diffusion, ordered_bayer, blue_noise, etc (sjálfgefið: ordered_bayer).', 'diffusionKernel: Error diffusion kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (sjálfgefið: floyd_steinberg).', 'ditherStrength: Dither styrkleiki 0-100 (sjálfgefið: 50).', 'Serpentine: Serpentine dithering 0/1 (sjálfgefið: 0).', 'fylki: Pöntuð töfrafylki - bayer2, bayer4, bayer8 (sjálfgefið: bayer4).', 'bnTile: Blue noise flísastærð (sjálfgefin: 64).', 'bnSeed: Blue noise random seed (sjálfgefið: 0).', 'colorDither: Litasvifing - enginn, á_rás, skynjun (sjálfgefið: enginn).'],
    },
    // Subpixel Parameters
    {
      heading: 'Undirpixla færibreytur',
      paragraphs: ['Stillingar fyrir blöndunarstillingu undirpixla:'],
      bullets: ['spGrid: Stærð undirpixla - 2x2, 3x3, 4x4 (sjálfgefið: 3x3).', 'spCenter: Miðjuregla - strangt, halftone_center (sjálfgefið: strangt).', 'spNeutral: Hlutlaus litur hex án # (sjálfgefið: 808080).', 'spFinder: Finder override - traustur, stílfærður (sjálfgefið: solid).'],
    },
    // Halftone Parameters
    {
      heading: 'Hálftónsfæribreytur',
      paragraphs: ['Stillingar fyrir hálftónablöndunarstillingu:'],
      bullets: ['htCell: Hálftónar frumustærð - per_module eða nxn grid (sjálfgefið: per_module).', 'htDot: Punktaform - hringur, ferningur, lína (sjálfgefið: hringur).', 'htCurve: Birtuferill - línuleg, s-ferill, gamma (sjálfgefið: línuleg).', 'duo1: Duotone shadow color hex án # (sjálfgefið: 000000).', 'duo2: Duotone highlight litur hex án # (sjálfgefið: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-Aware Mode færibreytur',
      paragraphs: ['Snjöll yfirborðsdreifing byggð á getu villuleiðréttingar:'],
      bullets: ['eccAware: Virkja ECC-meðvitaða stillingu 0/1 (sjálfgefið: 0).', 'eccRisk: Áhættuáætlunarprósenta 0-100 (sjálfgefið: 50).', 'eccMap: Þyngdarkort - fjarlægð_til_finna, blokk_hitakort, empirical_scan_hitakort (sjálfgefið: fjarlægð_til_finna).'],
    },
    // Frame Parameters
    {
      heading: 'Frame færibreytur',
      paragraphs: ['Stillingar fyrir skrautramma:'],
      bullets: ['frame: Frame style - none, rounded_frame, sticker, tag (sjálfgefið: enginn).', 'frameText: Texti sem á að birta í ramma (URL kóðaður).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Litabreytur fyrir hverja einingu',
      paragraphs: ['Einstakir mát litarvalkostir:'],
      bullets: ['modColor: Litastilling - solid, by_brightness, by_position, by_overlay, by_cluster (sjálfgefið: solid).', 'cGuard: Andstæðuvörn 0/1 (sjálfgefið: 0).', 'minContrast: Lágmarksbirtuhlutfall 1-21 (sjálfgefið: 4,5).', 'litatöflu: Kommaaðskildir sexkantslitir fyrir litatöflustillingu.', 'paletteMode: Litatöfludreifing - staðsetning, birta, ská, geislamynd, handahófi, röð, dálkur (sjálfgefin: staðsetning).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF yfirlagsfæribreytur',
      paragraphs: ['Stillingar fyrir hreyfimyndir af GIF yfirborðsmyndum:'],
      bullets: ['ovType: Yfirlagsgerð - static, gif, apng, webp_anim, video (sjálfgefið: static).', 'ovFramePick: Rammaval - allir, allir_n, hámarksrammar, lengd_takmark (sjálfgefið: allir).', 'gifDelays: Notaðu upprunalega GIF ramma tafir 0/1 (sjálfgefið: 1).', 'gifDispH: GIF förgun meðhöndlun - virða, einfalda (sjálfgefið: virðing).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Per-ECC styrkleikamörk',
      paragraphs: ['Hámarksálagsstyrkur fyrir hvert villuleiðréttingarstig:'],
      bullets: ['maxIntL: Hámarksstyrkur fyrir ECC L 0-100 (sjálfgefið: 100).', 'maxIntM: Hámarksstyrkur fyrir ECC M 0-100 (sjálfgefið: 100).', 'maxIntQ: Hámarksstyrkur fyrir ECC Q 0-100 (sjálfgefið: 100).', 'maxIntH: Hámarksstyrkur fyrir ECC H 0-100 (sjálfgefið: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA uppgerð færibreytur (aðeins viðskiptavinar)',
      paragraphs: ['Þessar færibreytur eru flokkaðar fyrir samhæfni vefslóða en virka aðeins í vafranum:'],
      bullets: ['qaContrast: Virkja birtuskilaskoðun 0/1 - krefst gagnvirkrar staðfestingar.', 'qaBlur: Líktu eftir óskýrleika í pixlum - eingöngu fyrir gagnvirkar prófanir.', 'qaNoise: Líkja eftir hávaðastigi - eingöngu fyrir gagnvirkar prófanir.', 'qaHeatmap: Sýna læsileika hitakort 0/1 - krefst striga yfirborðs UI.'],
    },
    // Client-Only Parameters
    {
      heading: 'Færibreytur eingöngu fyrir viðskiptavini',
      paragraphs: ['Flestar API breytur eru að fullu studdar miðlarahlið. Færibreytur merktar [BÚNAÐUR AÐEINS] eru flokkaðar fyrir samhæfni vefslóða en þurfa vafraeiginleika:'],
      bullets: ['jitter: Module jitter krefst endurnýjunar á QR fyrir hvern ramma með tilviljun.', 'autoReduce: Sjálfvirk minnkandi styrkleiki krefst ítrekaðrar skönnunarprófunar.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: QA uppgerð krefst gagnvirkrar sannprófunar á striga.'],
    },
    // Additional Output Parameters
    {
      heading: 'Viðbótarúttaksfæribreytur',
      paragraphs: ['Auknar úttaks- og útflutningsstillingar:'],
      bullets: ['fname: Sérsniðið skráarheiti fyrir niðurhal (sjálfgefið: anqr-qrcode).', 'inclQz: Hafa rólegt svæði í úttaksstærðum 0/1 (sjálfgefið: 1).', 'bgOver: Bakgrunnslitur hnekkir sexkanti án # (hnekkir bg færibreytu).', 'fmtExtra: Viðbótarsnið framleiðsla - enginn, eps, animated_webp (sjálfgefið: enginn). Athugið: eps er [PARTIAL].', 'svgPrec: SVG lögun nákvæmni - pixla, nákvæm (sjálfgefið: pixla). [HLUTA] SVG úttak takmörkuð miðlarahlið.', 'svgEmbed: Fella inn rasteryfirlag í SVG 0/1 (sjálfgefið: 1). [HLUTA] SVG úttak takmörkuð miðlarahlið.', 'modulePx: Mát pixlastærð (sjálfgefið: sjálfvirkt reiknað út frá stærð).', 'landamæri: Auka landamæraeiningar handan hljóðláts svæðis (sjálfgefið: 0).', 'crisp: Virkja crisp/pixelated image rendering 0/1 (sjálfgefið: 1).', 'snap: Pixel snap mode - gólf, kringlótt, loft (sjálfgefið: gólf).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Mynstur varðveislu færibreytur',
      paragraphs: ['Stjórnaðu hvaða burðarvirki eru varin fyrir yfirborði:'],
      bullets: ['keepFinders: Varðveittu leitarmynstur 0/1 (sjálfgefið: 1).', 'keepTiming: Varðveittu tímasetningarmynstur 0/1 (sjálfgefið: 0).', 'keepAlign: Varðveittu jöfnunarmynstur 0/1 (sjálfgefið: 0).', 'protectFmt: Vernda snið upplýsingaeiningar 0/1 (sjálfgefið: 0).', 'protectVer: Vernda útgáfuupplýsingaeiningar 0/1 (sjálfgefið: 0).'],
    },
    {
      heading: 'Dæmi um notkun',
      paragraphs: ['Grunn QR kóða:', 'https://anqr.link/api/qr?data=https://example.com', 'Stíll QR kóða með sérsniðnum litum:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', 'QR kóða með yfirlagsmynd:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', 'Hreyfimyndað GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'example' }],
    },
    {
      heading: 'Fella inn QR kóða',
      paragraphs: ['Í faglegri stillingu býr Share eiginleikinn til innfellanleg HTML og vefslóðir. Hér er hvernig innfelling virkar:'],
      bullets: ['Share Link: Býr til vefslóð að ANQR appinu með öllum stillingum þínum kóðaðar sem URL færibreytur. Viðtakendur geta skoðað og breytt QR kóðanum.', 'Fella inn mynd: Býr til <img> merki sem bendir á API þjónsins. QR kóðinn er sýndur á netþjóninum og þjónað sem mynd.', 'Embed Markdown: Býr til Markdown mynd setningafræði fyrir skjöl og README skrár.', 'Bein API vefslóð: Hrá API vefslóð til notkunar í forritum, forskriftum eða öðrum samþættingum.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
    {
      heading: 'HTML dæmi',
      paragraphs: ['Til að fella inn QR kóða á vefsíðuna þína:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />', 'Fyrir móttækilega stærð:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />', 'Miðlarinn vistar svör með löngum skyndiminnihausum, svo endurteknar beiðnir um sömu vefslóð eru fljótar.'],
    },
    {
      heading: 'Deildu vefslóðarsniði',
      paragraphs: ['Þegar þú smellir á Deila í faglegri stillingu, kóðar ANQR núverandi stillingar þínar í vefslóðarfæribreytur. Formið er:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', 'Þessar færibreytur endurspegla API færibreyturnar, þannig að þú getur umbreytt samnýtingarvefslóð í API vefslóð með því að breyta grunnslóðinni úr / í /api/qr og stilla m/h færibreytur eftir þörfum.', 'Athugið: Yfirlagsmyndum sem hlaðið er upp úr staðbundnum skrám er ekki hægt að deila í gegnum vefslóð - aðeins vefslóð byggðar yfirlög (img færibreyta) virka í sameiginlegum tenglum og API símtölum.'],
    },
    {
      heading: 'Verðtakmörk og notkun',
      paragraphs: ['API er ókeypis að nota fyrir hæfilegt magn. Vinsamlegast hafðu samband við okkur fyrir notkun í miklu magni eða viðskiptaforrit sem krefjast tryggðs spenntur.', 'API svör innihalda árásargjarna skyndiminnihausa. Til að ná sem bestum árangri skaltu vista svörin í skyndiminni eða nota sömu vefslóðina stöðugt fyrir eins QR kóða.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Bestu starfsvenjur',
      paragraphs: ['Fylgdu þessum leiðbeiningum fyrir áreiðanlega QR kóða:'],
      bullets: ['Prófaðu alltaf QR kóðana þína með mörgum skannaforritum áður en þú prentar út.', 'Notaðu villuleiðréttingu H (Hátt) þegar þú bætir við yfirborði.', 'Haltu að minnsta kosti 4 einingum af rólegu svæði (framlegð).', 'Tryggðu mikla birtuskil milli forgrunns og bakgrunns.', 'Fyrir prentun, notaðu að minnsta kosti 300 DPI og prófaðu í raunverulegri prentstærð.', 'Virkjaðu varðveita leitarmynstur þegar yfirlög eru notuð.', 'Byrjaðu með lægri yfirlagsstyrk og aukðu smám saman.', 'Til notkunar utanhúss skaltu íhuga stærri einingastærðir og meiri villuleiðréttingu.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Skoða Lærðu greinar', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'example' },
      ],
    },
    {
      heading: 'Úrræðaleit',
      paragraphs: ['Algeng vandamál og lausnir:'],
      bullets: ['QR skannar ekki: Draga úr yfirborðsstyrk, auka villuleiðréttingu, athuga birtuskil.', 'Kóði of stór: Minnka lengd efnis, nota vefslóð styttingu, lægri útgáfu.', 'Þoka úttak: Auka stærð einingarinnar, notaðu PNG í stað þjöppuð snið.', 'Litir líta rangt út: Athugaðu birtuskil lita, reyndu grátóna yfirlagsstillingu.', 'GIF hreyfingar ekki: Gakktu úr skugga um að nota GIF snið úttak, athugaðu fjölda ramma.', 'Myndyfirlag hleðst ekki: Athugaðu CORS heimildir á ytri myndum.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Sjá tengda leiðbeiningar og dæmi', type: 'learn' }],
    },
    {
      heading: 'Flýtivísar',
      paragraphs: ['ANQR styður venjulega flýtilykla. Notaðu Ctrl/Cmd+S til að koma af stað útflutningi (þegar fókus er á forskoðun).'],
    },
    {
      heading: 'Samnýting og innfelling',
      paragraphs: ['Í faglegri ham, smelltu á Share hnappinn til að afrita vefslóð með núverandi stillingum þínum. Viðtakendur geta opnað þessa vefslóð til að sjá nákvæma stillingu þína. Athugið: Yfirlagsmyndum úr staðbundnum skrám er ekki hægt að deila með vefslóð.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Prófaðu þessa stillingu beint í ANQR rafallnum.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Skoða Lærðu greinar', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Skoðaðu QR dæmi', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Opnaðu rafalann', type: 'generator' },
  ],
};

export default guide;
