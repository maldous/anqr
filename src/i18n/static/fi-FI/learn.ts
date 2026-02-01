import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Opi ANQR:llä',
  description: 'Käytännön oppaita, joilla QR-koodit muutetaan todellisiksi markkinointivaroiksi - ei vain toiminnallisiksi neliöiksi. Opi päivittämään perinteisiä myyntipistekoodeja, luomaan vaatimustenmukaisia maksumerkkejä QR-kylttejä, valmistelemaan tulostusvalmiita vientiä, käyttämään animaatiota turvallisesti digitaalisissa näytöissä ja jakamaan lukittuja konfiguraatioita monikielisissä ryhmissä ANQR-linkeillä.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avaa generaattori', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Avaa koko käyttöopas', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Nykyisten QR-kampanjoiden parantaminen',
      paragraphs: ['Useimmat yritykset ovat QR koodit hajallaan niiden toimintaa - valikot, laskurit, pakkaukset, ja mainosmateriaalia. Monet näistä koodeista luotiin vuosia sitten perusgeneraattoreilla, mikä johti yleisiin mustavalkoisiin neliöihin, jotka eivät herätä luottamusta tai vastaa brändin identiteettiä. Tämä kattava opas opas opastaa sinua systemaattisen lähestymistavan tilintarkastukseen, päivittämiseen ja nykyisen QR-infrastruktuurin optimointiin häiritsemättä jo luomiasi asiakasmatkoja.', 'Parantamisen strateginen etu QR-koodien korvaamisen sijasta on jatkuvuuden säilyttäminen. Asiakkaasi ovat jo oppineet odottamaan tiettyjä kohteita, kun he skannaavat koodisi. Pitämällä koodatut URL-osoitteet identtisinä ja parantaen dramaattisesti visuaalista esitystapaa, skannaa luotettavuutta ja brändin linjausta, luot saumattoman siirtymän, joka lisää luottamusta ilman muutoksia digitaaliseen infrastruktuuriisi tai analytiikkaan.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Side-by-side vertailu näyttää haalistunut, yleinen QR-koodi vieressä moderni brändiversio koodataan sama URL',
          caption: 'Ennen ja jälkeen: Sama kohde URL muunnettiin päivätystä yleiskoodista ammattimaiseksi merkkitavaraksi',
        },
      ],
    },
    {
      heading: 'Miksi Legacy QR koodit underperform',
      paragraphs: ['Varhaisen hyväksymisvaiheen aikana luodut QR-koodit - erityisesti vuosina 2020-2021, jolloin yritykset kiirehtivät toteuttamaan kontaktittomia ratkaisuja - kärsivät usein useista kriittisistä kysymyksistä. Matalan virheen korjausasetukset tekevät niistä hauraita, kun ne painetaan teksturoiduille pinnoille tai katsotaan haastavaan valaistukseen. Riittämättömät hiljaiset vyöhykkeet aiheuttavat skannausvirheitä, kun koodit sijoitetaan muiden visuaalisten elementtien lähelle. Tavallinen muotoilu ei kommunikoi brändin legitimiteettiä, mikä johtaa epäröintiin ja pienempään skannausnopeuteen.', 'Teknisten rajoitusten lisäksi perinteiset säännöt edustavat usein menetettyjä tuotemerkkimahdollisuuksia. Jokainen QR-koodi on kosketuspiste asiakkaan kanssa - hetki, jolloin he ovat aktiivisesti mukana ja halukkaita toimimaan. Ammattimaisesti tyylikäs koodi, joka vastaa brändisi värejä, sisältää asianmukaiset turvallisuusmarginaalit, ja ominaisuudet valinnaiset merkkituotteet muuntavat tämän apuohjelman markkinointihyödykkeeksi, joka vahvistaa identiteettiäsi jokaisessa vuorovaikutuksessa.'],
    },
    {
      heading: 'QR-koodintarkastuksen suorittaminen',
      paragraphs: ['Aloita päivitysprojektisi luomalla kattava luettelo jokaisesta QR-koodista, jota tällä hetkellä käytetään koko yrityksesi alueella. Dokumentoi fyysinen sijainti, koodattu kohde, painetun materiaalin nykyinen kunto ja tyypillinen skannausympäristö, mukaan lukien valaistusolosuhteet ja katselukulmat. Testaa kunkin koodin useita laitteita - vanhemmat älypuhelimet ja budjetti laitteet usein paljastaa luotettavuus kysymyksiä, että premium puhelimet maski.', 'Kiinnitä erityistä huomiota korkean tuoton paikoissa oleviin koodeihin: maksupisteet, lähtöselvitysalueet ja mainosnäytöt, joissa vika vaikuttaa suoraan tuloihin tai asiakaskokemukseen. Ne olisi asetettava etusijalle välitöntä parantamista varten. Huomaa myös koodit, jotka näkyvät valokuvaus tai video sisältö, koska ne vaativat koordinointia markkinointitiimin päivittää visuaalisia resursseja.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Tarkistuslistan käyttöliittymä, jossa on QR-auditointiluokat: sijainti, kunto, skannausvarmuus ja prioriteettiluokitus',
          caption: 'Järjestelmällinen QR-auditointimalli päivitysehdokkaiden dokumentointia ja priorisointia varten',
        },
      ],
    },
    {
      heading: 'Turvallinen päivitysstrategia',
      paragraphs: ['QR-päivitysten pääsääntö on määränpään säilyttäminen. Poista tarkka URL jokaisesta olemassa olevasta koodista ja koodaa se identtisesti uudessa versiossasi. Tämä varmistaa, että kaikki olemassa olevat analytiikka, ohjata logiikkaa, ja asiakkaan odotukset pysyvät ennallaan. Jos tarvitset matkakohteen joustavuutta tulevia päivityksiä varten, tämä on ihanteellinen aika ottaa käyttöön brändillinen lyhyt URL-osoite tai uudelleenohjauspalvelu - mutta toteuttaa tämä erillisenä projektina, jotta muutoksia ei yhdistetä.', 'Visuaaliseen parannukseen sovelletaan parannuksia kerroksiin: ensin varmistetaan tekninen luotettavuus (asianmukainen virhekorjaus ja hiljainen vyöhyke), lisätään brändin muotoilu (värit, moduulin muodot), ja lopuksi harkitaan valinnaisia parannuksia (kesken päällysteet, kehykset). Kukin kerros olisi validoitava testauksella ennen käsittelyä. ANQR:n turvallisuustila auttaa valvomaan näitä painopisteitä varoittamalla, kun muotoiluvalinnat saattavat vaarantaa skannattavuuden.'],
    },
    {
      heading: 'Brändi-identiteetin lisääminen vaarantamatta luotettavuutta',
      paragraphs: ['Tehokas QR-merkki tasapainottaa visuaalisen vaikutuksen skannauksen luotettavuuteen. Aloita värillä: korvaa oletusmusta etualalla ensisijainen brändi väri, varmistaa riittävä kontrasti taustaan. Useimmissa tuotemerkeissä valotaustan tummat värit toimivat parhaiten. Vältä pieni kontrastisia yhdistelmiä, reunan kirkkautta vähentäviä kaltevuuksia tai samoja värejä yleisissä valaistusolosuhteissa.', 'Moduulin muoto räätälöinti tarjoaa toisen brändäysmahdollisuuden, jolla on mahdollisimman vähän luotettavuutta. Pyöristetyt moduulit luovat pehmeämmän, helpommin lähestyttävän ulkoasun säilyttäen erinomaisen skannattavuuden. Dot-tyyliset moduulit toimivat hyvin moderneissa, tekniikkatermiinibrändeissä. Yhdistetyt moduulit sopivat teollisuuden tai yritysten identiteetteihin. Mitä tahansa tyyliä valitsetkin, pidä yllä johdonmukaisuutta kaikissa QR-käyttökohteissasi instant bränditunnistusta varten.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Pyöräkaavio, jossa on optimaaliset QR-väriyhdistelmät kontrastisuhteen osoittimilla',
          caption: 'Brändin värivalintaopas, jossa on paljon ristiriitaisia yhdistelmiä, jotka säilyttävät skannauksen luotettavuuden',
        },
      ],
    },
    {
      heading: 'Testaus- ja validointiprotokolla',
      paragraphs: ['Älä koskaan käytä päivitettyjä QR-koodeja ilman tarkkoja testejä. Tulosta fyysinen todiste tarkan koon ja saman materiaalin kuin lopullinen käyttöönotto. Testi todellisessa paikassa, jossa koodi elää, eri vuorokaudenaikoina valovariaatioiden huomioon ottamiseksi. Käytä ainakin kolmea eri laitetta: nykyinen lippulaivapuhelin, keskietäisyydellä toimiva laite ja vanhempi tai edullinen älypuhelin.', 'Tallenna skannausajat ja onnistumisasteet kullekin testille. Hyvin optimoidun koodin on skannattava 1-2 sekunnin kuluessa kohtuullisesti nykyaikaisesta laitteesta. Jos näet johdonmukaisia viiveitä tai vikoja, vähennä muotoilun voimakkuutta - poista tai kutista päällystyksiä, lisää hiljaisen alueen kokoa tai vaihda suurempaan virhekorjaustasoon. Luotettavuus on aina tärkeämpää kuin visuaalinen hienostuneisuus.'],
    },
    {
      heading: 'Lukitse asetukset johdonmukaisuuden vuoksi',
      paragraphs: ['Kun olet validoinut optimaalisen konfiguraation, säilytä se ANQR:n jaettavien linkkien avulla. Tämä luo pysyvän tietueen jokaisesta asetuksesta, jota käytetään hyväksytyn koodin tuottamiseen - värejä, moduulityyliä, virhekorjausta, kokosimulaatiota ja mahdollisia päällystelmiä. Jaa tämä linkki suunnittelutiimisi, tulostusmyyjien ja kaikkien niiden kanssa, jotka saattavat tarvita kopioida koodin tulevaisuudessa.', 'Tämä kokoonpanolukko estää asteittaisen hajoamisen, joka vaivaa monia QR-käyttöjä. Ilman sitä henkilökunta luo uudelleen koodeja kuvakaappauksista, suunnittelijat uudelleen asetukset muistista, ja tulostus myyjät tekevät "auttaa" säätöjä. Jokainen muutos tuo mukanaan mahdollisia kysymyksiä. Lukitulla konfiguraatiolinkillä jokainen kopio on samanlainen kuin testattu, hyväksytty alkuperäinen.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Kaavio konfiguraatiosta: kuvakaappaukset, jotka johtavat muunnelmiin, vs.',
          caption: 'Ennaltaehkäise konfigurointia perustamalla yksi ainoa arvovaltainen lähde kaikille QR-kopioille',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Näytä QR-esimerkkejä',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Vähittäismaksujen QR-koodit',
      paragraphs: ['Maksujen QR-koodit toimivat vaativimmassa ympäristössä vähittäiskaupassa: liiketoimen ajankohta. Asiakkaat ovat valmiita maksamaan, usein jonossa muodostaen takanaan, ja jokainen sekunti viive aiheuttaa kitkaa. Silti tämä korkeapaine hetki on myös ensisijainen kiinteistö merkki vahvistuksen. Tässä oppaassa selitetään, miten luodaan maksulliset QR-koodit, jotka skannaavat välittömästi pankkisovelluksiin ja esittävät silti ammattimaisen, brändillisen ulkoasun, joka luo asiakkaiden luottamusta.', 'Maksujen QR-koodien perusperiaate on luotettavuus estetiikan yläpuolella. Kauniisti suunniteltu koodi, joka ei skannaa yhden asiakkaan pankkisovellusta, maksaa sinulle paljon enemmän hylätyissä liiketoimissa ja turhautuneissa asiakkaissa kuin konservatiivinen muotoilu koskaan voisi. Aloita vaatimustenmukaisuudesta, lisää luotettavuutta, sitten huolellisesti kerros merkkien vain, jos se ei vaaranna ensisijainen toiminto.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Vähittäiskaupan laskurinäyttö, jossa maksullisen QR-koodin skannataan pankkisovelluksella varustetulla älypuhelimella',
          caption: 'Maksu QR-koodien on toimittava välittömästi pankki- ja lompakkosovellusten kanssa reaalimaailman vastaolosuhteissa',
        },
      ],
    },
    {
      heading: 'Maksujen QR-standardien ymmärtäminen',
      paragraphs: ['Maksujen QR-koodit noudattavat yleensä alueellisia standardeja, jotka määräävät hyötykuorman muodon. Singaporessa PayNow QR käyttää tiettyä muotoilua. Intiassa UPI-koodit noudattavat BharatQR tai UPI syvä linkki standardeja. Eurooppalaiset SEPA-maksut käyttävät EPC:n QR-koodeja. Jokainen standardi on olemassa sen varmistamiseksi, että pankkisovellukset voivat tunnistaa ja käsitellä maksutiedot välittömästi. Näistä standardeista poikkeaminen - jopa hieman - voi saada maksusovellukset hylkäämään koodit, joita yleiset kameraskannerit lukevat ilman ongelmia.', 'ANQR sisältää malleja suuria maksustandardeja, jotka automaattisesti muokkaavat kauppatietosi vaatimustenmukaisiksi hyötykuormaksi. Käytä aina näitä malleja mieluummin kuin käsin rakentamalla maksujonoja, koska pienetkin muotoiluvirheet voivat aiheuttaa tapahtumavirheitä. Jos alueesi maksustandardia ei ole saatavilla mallina, tutustu maksupalveluntarjoajasi teknisiin asiakirjoihin tarkkoja muotoiluvaatimuksia varten.'],
    },
    {
      heading: 'Koko ja sijainti vastanäytöille',
      paragraphs: ['QR-koodeilla on ainutlaatuisia fyysisiä haasteita. Asiakkaat skannaavat käsivarren pituutta, usein kulmassa, joskus aivastussuojien tai näyttökoteloiden kautta. Valaistus luo häikäisypisteitä. Koodi kilpailee muiden vasta sotkua huomiota ja selkeitä näkölinjoja. Kokoa maksu QR avokätisesti - vähintään 4-5cm on suositeltavaa useimmissa laskurisovelluksissa, skaalautuu, jos koodi istuu takana lasin tai hämärä valaistu alue.', 'Asema on yhtä tärkeä kuin koko. Aseta koodi, jossa asiakkaat voivat mukavasti pitää puhelimensa ilman jonoa tai päästä hankalasti. Kulma näytä asiakasta kohti sen sijaan, että laittaisit sen tasaiseksi. Jos mahdollista, käytä mattalaminointia tai heijastamattomia näyttömateriaaleja, jotta voidaan minimoida ylivalon häikäisy. Testaa lopullinen sijoittaminen eri vuorokaudenaikoina valaistusongelmien havaitsemiseksi.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Kaavio, jossa esitetään eri laskurikokoonpanojen optimaaliset QR-sijoittelukorkeudet ja -kulmat',
          caption: 'Vastasijoitteluopas: optimaaliset korkeudet, kulmat ja etäisyydet luotettavaan maksuskannaukseen',
        },
      ],
    },
    {
      heading: 'Konservatiivinen tuotemerkki maksukoodeja varten',
      paragraphs: ['Maksusovellukset ovat vähemmän anteeksiantavia kuin tavalliset kameraskannerit. Monet pankkisovellukset käyttävät vanhempia, yksinkertaisempia QR-lukualgoritmeja, jotka on optimoitu nopeutta eikä joustavuutta varten. Tämä tarkoittaa muotoilua, joka toimii täydellisesti puhelinkameran kanssa voi epäonnistua tiettyjen maksusovellusten kanssa. Pidä merkkien konservatiivisuus: käytä brändin väriä etualalla, jos se säilyttää vahvan kontrastin, mutta välttää kaltevuuksia, raskaita päällysteitä tai koriste-elementtejä, jotka voivat häiritä tunnistamista.', 'Jos haluat keskuslogon tai päällystyksen, pidä se erittäin pienenä - enintään 10-15% QR-alueesta - ja testaa laajasti jokaisella asiakkaan käyttämällä maksusovelluksella. Monet yritykset valitsevat, ettei maksukoodeja ole päällekkäin erityisesti, varaamalla tämän tyylin markkinointi QR-koodeja, joissa luotettavuusvaatimukset ovat lievempiä. Maksukoodin tehtävänä on käsitellä liiketoimia, ei tehdä visuaalisesti vaikutusta.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Vertailu, josta käyvät ilmi hyväksyttävät vs riski bränditasot maksuissa QR-koodeja varten',
          caption: 'Maksu QR-brändispektri: turvallisesta konservatiivisesta muotoilusta riskialttiisiin koristeisiin',
        },
      ],
    },
    {
      heading: 'Materiaali- ja tulostusnäkökohdat',
      paragraphs: ['Fyysinen näyttömateriaali vaikuttaa merkittävästi skannaukseen. Kiiltävä laminointi heijastuu suoraan asiakkaan kameraan. Teksturoidut materiaalit voivat vääristää moduulin reunoja. Halpa tulostus voi hämärtää yksityiskohtia. Payment QR-koodit, investoida laatuun: käytä matta tai satiini laminointi, varmistaa korkean resoluution tulostus, ja korvata näyttöjä ennen kuin ne näyttävät kulumista. Naarmuuntunut tai haalistunut maksukoodi maksaa sinulle liiketoimet.', 'Harkitse näytön kestävyyttä ja vaihdettavuutta. Vastanäytöt koskettavat, liikkuvat, roiskuvat ja toisinaan kaatuvat. Suunnittele näyttöjärjestelmäsi siten, että QR-lisäosa voidaan helposti vaihtaa korvaamatta koko osastoa. Pidä varajäljet valmiina, luotu lukittu asetuslinkki, joten kuluneet koodit voidaan vaihtaa välittömästi.'],
    },
    {
      heading: 'Testaus reaalimaksulla Sovellukset',
      paragraphs: ['Geneeriset kameraskannerit purkavat lähes minkä tahansa kohtuullisen muotoisen QR-koodin. Maksusovellukset ovat nirsompia. Ennen kuin käytät mitään maksu QR-koodia, testaa se jokaisella asiakkaan käyttämällä maksusovelluksella. Monimaksuympäristössä tämä saattaa tarkoittaa testausta useilla pankkisovelluksilla, digitaalisilla lompakoilla ja maksualustoilla. Dokumentti, jonka testasit, ja niiden versiot - maksusovellukset päivitetään usein ja päivitys voi muuttaa skannauskäyttäytymistä.', 'Testi realistisissa olosuhteissa: todellinen näyttö, todellinen valaistus, todellinen skannausetäisyys. Koodi, joka skannaa välittömästi pöydälläsi, saattaa taistella tiskillä klo 17 iltapäivän auringon loistaessa häikäisyä. Testaa vanhimmalla ja halvimmalla älypuhelimella - jos se toimii luotettavasti budjettilaitteella, se toimii kaikessa. Skannaa 2 sekunnin ajalta tutkimus ja mahdollinen uudelleensuunnittelu.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Testauksen tarkistuslista, josta käyvät ilmi maksusovellukset, laitetyypit ja ympäristöolosuhteet',
          caption: 'Kattava maksu QR-testausmatriisi kattaa sovellukset, laitteet ja ympäristötekijät',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Näytä QR-esimerkkejä',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Tulosta-valmis QR-koodit: SVG vs PNG',
      paragraphs: ['Täydellisesti skannaavan ja epäonnistuneen QR-koodin välinen ero riippuu usein siitä, miten se vietiin ja käsiteltiin tulostustyössä. Tässä oppaassa selvitetään vektori- (SVG) ja raster (PNG) -formaatteja koskevia kriittisiä eroja sekä sitä, milloin niitä käytetään, ja sitä, miten QR-taidetta luovutetaan suunnittelijoille ja tulosttajille tavalla, joka säilyttää skannauksen luotettavuuden käyntikorteista mainoskylttiin.', 'Tulosta tuotanto esittelee muuttujia, joita ei ole näytöllä: musteen leviäminen, substraatin rakenne, viimeistelyprosessit ja useiden tiedostojen konversioiden kumulatiivinen vaikutus. QR-koodi, joka näyttää täydelliseltä suunnitteluohjelmistossasi, voi tulla tulostimesta pehmennetyllä reunalla, pienemmällä kontrastilla tai hienovaraisesti vääristyneillä moduuleilla. Formaatin valinnan ymmärtäminen ja työnkulun parhaat käytännöt estävät näitä hiljaisia epäonnistumisia.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Suurennettu näkymä, jossa verrataan vektori QR-moduuleja teräviin reunoihin vastaan rasterimodulit, joissa on pikseliesineitä',
          caption: 'Vector vs raster tulostusasteikolla: tarkkuusero, joka määrittää skannauksen luotettavuuden',
        },
      ],
    },
    {
      heading: 'Miksi vektori (SVG) on ensisijainen tulostukseen',
      paragraphs: ['SVG-tiedostot kuvaavat QR-koodeja matemaattisina muotoina pikselien sijaan. Tämä tarkoittaa, että koodi voidaan skaalata mihin tahansa kokoon - 1 cm:n tarrasta 10 metrin banneriin - ilman että reunan terävyys häviää. Tulostajan RIP (Raster Image Processor) tekee vektorit lähtölaitteen alkuperäisresoluutiolla varmistaen, että jokainen moduulin reuna on niin terävä kuin laitteisto sallii. Ei ole interpolointia, ei anti-aliasointi esineitä, ei kertynyt sumeutta useista uudelleenkokoisista toiminnoista.', 'Skaalauskyvyn lisäksi SVG-tiedostot ovat vahvempia ammattimaisissa työnkuluissa. He selviävät retkistä suunnitteluohjelmiston kautta ilman hajoamista. Ne voidaan korjata ilman uusintanäytteenottoa. Ne upotetaan siististi PDF-tiedostoihin painatusta varten. Mille tahansa tulostussovellukselle, jossa laadulla on merkitystä, SVG:n pitäisi olla oletusvientimuotosi.'],
    },
    {
      heading: 'Kun PNG on hyväksyttävä',
      paragraphs: ['PNG tulee tarpeelliseksi, kun työnkulku- tai kohdealusta ei tue vektoriformaatteja. Jotkut web-alustat, merkki CMS-järjestelmät ja vanha tulostus työnkulku vaativat rasterikuvia. Näissä tapauksissa, PNG voi toimia hyvin - mutta vain jos noudatat tiukkoja sääntöjä: vienti lopulliseen fyysiseen kokoon ja resoluutioon, koskaan mittakaavassa viennin jälkeen, ja välttää häviöllinen pakkaus tai muodon muuntaminen.', 'PNG:n keskeinen sääntö on laskea vaaditut pikselimitat ennen vientiä. Jos QR tulostaa 5cm ja tulostin toimii 300 DPI, tarvitset noin 590 pikseliä. Vie tätä kokoa tai suurempi, sitten pienentää tarvittaessa - koskaan ylös. Sisällytä nämä tiedot tiedostonimeesi tai metatietoosi, jotta tulevat käyttäjät eivät vahingossa väärinkäytä kokokohtaista vientiä.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Laskinliitäntä, joka osoittaa fyysisen koon, DPI:n ja vaadittujen pikselimittojen välisen suhteen',
          caption: 'Tulosta resoluutiolaskin: minimipikselin mittojen määrittäminen tavoitelähtökoon osalta',
        },
      ],
    },
    {
      heading: 'ANQR- vientiasetukset',
      paragraphs: ['ANQR tarjoaa useita SVG-vientitiloja eri työnkulkuihin. Todellinen Vector-tila tuottaa puhdasta polkupohjaista ulostuloa, joka sopii erinomaisesti tulostus- ja ammattikäyttöön. Kun olet lisännyt raster overlays tai tiettyjä vaikutuksia, ANQR voi upottaa nämä säilyttäen vektori moduleja, tai voit viedä täysin rasterized versio on määritelty resoluutio. Näiden vaihtoehtojen ymmärtäminen auttaa valitsemaan oikean viennin jokaiselle käyttötapaukselle.', 'PNG vienti, ANQR avulla voit määrittää tarkat mitat ja sisältää vaihtoehtoja läpinäkyvä tausta. DPI-asetus auttaa laskemaan sopivat koot tulostamiseen, mutta muista, että DPI on metatieto - mikä merkitsee tulostamiseen on tarpeeksi pikseleitä fyysiseen kokoon. Kun epäilyt, vienti suurempi kuin luulet tarvitsevasi; skaalaus säilyttää laadun samalla skaalaus tuhoaa sen.'],
    },
    {
      heading: 'Valmistellaan tiedostoja luovutukseen',
      paragraphs: ['Kun QR-taidetta toimitetaan suunnittelijoille tai tulostustoimittajille, on esitettävä selkeät tiedot: suunniteltu fyysinen koko, hiljaisen alueen vähimmäisvaatimukset ja mahdolliset väritilan näkökohdat. Kriittisissä sovelluksissa on annettava sekä SVG-master että korkean resoluution PNG-varmistus, joka on selvästi merkitty käyttötarkoituksin. Sisällytä ANQR-asetuslinkki, jotta koodi voidaan tarvittaessa regeneroida.', 'Ennakoi yhteisiä virheitä luovutusprosessissa. Täsmennettävä nimenomaisesti, että QR:ää ei saa skaalata, kääntää, vääntää tai käyttää. Täsmentäkää, että hiljaisen vyöhykkeen on pysyttävä selvänä - ei viljelymerkkejä, rekisteröintimerkkejä tai suunnitteluelementtejä. Jos QR asetetaan värilliselle tai valokuvalliselle taustalle, on toimitettava versio, jossa on läpinäkymätön taustamuoto riittävän kontrastin varmistamiseksi.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Tiedostopakettikaavio, jossa näkyy SVG master, PNG varmuuskopio, tekniset asiakirjat ja asetuslinkki',
          caption: 'Professional QR luovutus paketti: kaikki suunnittelija tai tulostus myyjä tarvitsee tarkka kopiointi',
        },
      ],
    },
    {
      heading: 'Tulosta todisteita',
      paragraphs: ['Älä hyväksy tulostusta ilman fyysisiä todisteita. Pyydä todisteita, jotka on painettu todelliselle alustalle ja jotka on viimeistelty tuotannossa. Skannaa todisteet samanlaisissa valaistusolosuhteissa kuin missä lopullinen pala näytetään. Testaa useilla laitteilla, kuten vanhemmilla älypuhelimilla, jotka saattavat kamppailla heikon laadun kanssa.', 'Jos todiste skannaa hitaasti tai epäjohdonmukaisesti, tutki ennen hyväksymistä. Yleisiä kysymyksiä ovat riittämätön kontrasti värjätyille alustoille, hiljaisen vyöhykkeen loukkaukset trimmaamisesta, musteen leviäminen pehmentäen moduulin reunoja tai laminointi, joka luo häikäisyä. Mitä tahansa näistä voidaan käsitellä ennen täyttä tulostusta - mutta vain jos ne saadaan kiinni todistevaiheessa.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Todisteen tarkistuslista, jossa on skannaustestitulokset, kontrastimittaukset ja hyväksyntä allekirjoitukset',
          caption: 'Tulosta todennuksen työnkulku: järjestelmällinen testaus ennen tuotantomääriin sitoutumista',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Näytä QR-esimerkkejä',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Luodaan animoituja QR-koodeja',
      paragraphs: ['Animoidut QR-koodit yhdistävät normaalien QR-koodien toiminnallisuuden silmäänpistävään liikehdintään, joka lisää merkittävästi sitoutumista. Digitaalisissa signaaleissa, sosiaalisessa mediassa ja interaktiivisissa näytöissä animaatio muuttaa staattisen apuvälineen pakottavaksi visuaaliseksi elementiksi, joka vetää silmää ja kutsuu vuorovaikutukseen. Tämä opas sisältää periaatteet, tekniikat ja käytännön rajoitteet luoda animoituja QR-koodeja, jotka skannaavat luotettavasti samalla visuaalisen vaikutuksen.', 'Animoitujen QR-koodien perushaasteena on visuaalisen kiinnostuksen tasapainottaminen skannauksen luotettavuuden kanssa. Jokaisen kehyksen on oltava yksilöllisesti skannattavissa - skanneri voi tallentaa koodin missä tahansa animaatiosyklin vaiheessa. Tämä rajoite muovaa jokaisen suunnittelupäätöksen: mitkä elementit voivat liikkua, kuinka paljon ne voivat muuttua, ja minkä on pysyttävä vakaana koko animaatio.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Digitaalinen merkkinäyttö, jossa animoitu QR-koodi vangitsee katsojan huomion julkisessa tilassa',
          caption: 'Animoidut QR-koodit digitaalisessa merkinnässä: liike, joka herättää huomiota ja kannustaa skannaukseen',
        },
      ],
    },
    {
      heading: 'Miten animaatio vaikuttaa skannattavuuden',
      paragraphs: ['QR-skannerit toimivat kuvaamalla yhden ruudun ja analysoimalla valo- ja tummamoduulien kuvioita. Jotta animoitu koodi toimisi, jokaisen kehyksen on sisällettävä täydellinen, kelvollinen QR-kuvio. Tämä sulkee pois animaatiot, jotka muuttavat koodin rakennetta, hajottavat moduulit tai muuttavat merkittävästi kontrastikuviota. Tiedonsiirtomoduulien - näennäisesti satunnaisen kuvion keskustassa - on pysyttävä visuaalisesti vakaina koko ajan.', 'Turvalliset animaatiotavat muokkaavat elementtejä, jotka eivät kulje dataa: taustat, värit, koristekehykset ja päällystyselementit. Rakenteelliset komponentit - löytökuviot (suuret kulmaruudut), ajoitusmallit (vaihtelevat viivat) ja linjausmallit (pienempien koodien neliöt) - on säilytettävä sijaintinsa ja mittasuhteet. Näiden rajoitteiden puitteissa työskentely mahdollistaa yllättävän dynaamiset ja kannustavat animaatiot.'],
    },
    {
      heading: 'Animointitekniikat Että työ',
      paragraphs: ['Väripyöräily animoi etu- ja taustavärit paletin kautta säilyttäen kuitenkin riittävän kontrastin jokaisessa vaiheessa. Tämä luo elinvoimaisen, huomiota tarttuvan vaikutuksen, jossa on minimaalinen skannausriski - kunhan kontrasti ei koskaan putoa alle lukevien tasojen. ANQR:n esiasetukset on suunniteltu ylläpitämään skannattavuutta koko syklin ajan.', 'Animoitu overlays paikka siirtää kuvia takana puoliksi läpinäkyvä QR malli. Koodi pysyy vakaana, kun tausta-animaatiot - ehkä silmukkavideo, animoidut brändielementit tai abstrakti liikegrafiikka. Tämä tekniikka vaatii huolellista voimakkuuden hallintaa, jotta tausta ei ylittäisi QR-kuviota, mutta luo visuaalisesti silmiinpistäviä tuloksia.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Kaavio, jossa esitetään animoidun QR:n kerrosrakenne: vakaa koodikerros animoidun taustakerroksen päällä',
          caption: 'Animaatiokerrosperiaate: QR-kuvio pysyy vakiona, kun taas taustaelementit animoituvat alla',
        },
      ],
    },
    {
      heading: 'Määritetään animaatioparametrit',
      paragraphs: ['Runkonopeus vaikuttaa sekä visuaaliseen sileyteen että tiedoston kokoon. Useimmissa sovelluksissa 10-15 ruutua sekunnissa tarjoaa sujuvan näköisen liikkeen ilman liian suuria tiedostokokoja. Suuremmat kehykset tarjoavat visuaalisen tuoton pienenemisen ja lisäävät huomattavasti tiedostokokoja. Harkitse toimituskontekstiasi - suuri digitaalinen merkki voi käsitellä suurempia tiedostoja kuin mobiilimainossijoittelu.', 'Loop käyttäytyminen määrittää miten animaatio syklit. Saumattomat silmukat luovat jatkuvan liikkeen ihanteellisen opasteen ja ympäristön näyttöihin. Ping-pong (terward-then-reverse) silmukat toimivat hyvin yksinkertaisiin animaatioihin. Huomion tarttuminen pulssit, harkita animaatioita, joissa on ruuvit - kausia hiljaisuus punktuated liikkeen, joka vetää silmän ilman jatkuvaa liikettä väsymys.'],
    },
    {
      heading: 'Luodaan Animated Overlays',
      paragraphs: ['Kun ANQR käyttää animoituja kuvia (GIF-kuvia, animoituja WebP-levyjä tai videoita) overlaysteinä, se poistaa kehykset ja yhdistää ne QR-koodillasi. Overlay-voimakkuuden asetus säätelee sitä, kuinka paljon animaatio osoittaa läpi - alemmat arvot priorisoivat skannattavuuden ja korkeammat arvot edistävät visuaalista vaikutusta. Testaa valittu voimakkuus läpi useita kehyksiä varmistaa johdonmukainen skannattavuuden.', 'Lähde: Materiaalin laatu vaikuttaa merkittävästi tuloksiin. Käytä päällysteitä selkeillä aineilla ja hyvä kontrasti. Vältä lähde animaatioita nopea vilkkuminen tai äärimmäisen kirkkaus muutoksia, jotka voivat luoda satunnaisia pieni kontrasti kehykset. Esikatsele koko animaatiosykliä ennen vientiä saalista ongelmallisia kehyksiä, jotka eivät ehkä skannata.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Näkymä animoidusta päällysteestä, jossa on kontrastitasot koko sarjassa',
          caption: 'Kehysanalyysi: koko animaatiosyklin johdonmukaisen skannattavuuden todentaminen',
        },
      ],
    },
    {
      heading: 'Vienti- ja toimitusnäkökohdat',
      paragraphs: ['GIF on edelleen eniten tuettu animoitu muoto, pelaa automaattisesti useimmissa yhteyksissä ilman videosoitin tukea. GIF:n 256-värinen paletti rajoittaa kuitenkin väriuskollisuutta. Värikriittisiä animaatioita varten kannattaa harkita animoitua WebP:tä, jos sitä tuetaan, tai palata videoformaateille korkealaatuisimpaan. ANQR:n GIF-vienti sisältää dithering-valinnat, joilla pyritään maksimoimaan laatu palettirajoitusten sisällä.', 'Tiedoston koko on toimitettava. Digitaaliset merkkijärjestelmät, sähköpostiohjelmat ja sosiaaliset alustat asettavat usein kokorajoituksia. Jos animaatiosi ylittää nämä raja-arvot, vähennä kehysten määrää, mittoja tai värisyvyyttä. Joskus jakamalla monimutkainen animaatio lyhyemmäksi silmukka saavuttaa parempia tuloksia kuin aggressiivinen pakkaus, joka hajottaa jokaisen kehyksen.'],
    },
    {
      heading: 'Animoitujen QR-koodien testaus',
      paragraphs: ['Animoitujen koodien testaus edellyttää skannausta useista animaatiosyklin kohdista. Älä vain skannaa kerran ja oleta menestystä - skannaa toistuvasti, eri hetkillä, varmistaa, että jokainen kehys on luettavissa. Kiinnittäkää erityistä huomiota värisyklien ääri- tai overlay-intensiteettihuippuihin, joissa kontrasti saattaa olla pienin.', 'Varsinaisen näyttölaitteiston testaus mahdollisuuksien mukaan. Seuratkaa värikalibrointia, katselukulmaa ja ympäristövalaistusta. Kirkas animaatio, joka skannaa täydellisesti monitorin voi huuhtoutua ulos ulkonäytöllä tai tulla lukukelvottomaksi vinossa katselukulmassa.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Testausmatriisi, joka näyttää skannausmenestysprosentit eri kehyksissä, laitteissa ja näyttöolosuhteissa',
          caption: 'Animoitu QR-testausprotokolla: järjestelmällinen todentaminen kehyksissä, laitteissa ja katseluolosuhteissa',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Näytä QR-esimerkkejä',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR Turvallisuus ja säännösten noudattaminen Parhaat käytännöt',
      paragraphs: ['Kauniisti suunniteltu QR-koodi, joka ei skannaa, on huonompi kuin hyödytön - se turhauttaa asiakkaita, vahingoittaa brändien käsityksiä ja tuhlaa kaikki sen luomiseen ja jakeluun investoidut resurssit. Tässä oppaassa käsitellään teknisiä ja käytännön tekijöitä, jotka määräävät, skannataanko QR-koodi luotettavasti ja miten ANQR:n turvaominaisuuksia käytetään mahdollisten ongelmien kiinnisaamiseen ennen niiden tuotantoa.', 'QR-koodin luotettavuus ei ole binääristä. Koodi voi skannata lippulaivan puhelimet, mutta epäonnistuu budjettilaitteiden. Se voi toimia ihanteellisessa valaistuksessa, mutta kamppailee hämärissä ravintoloissa tai kirkkaassa auringonvalossa. Skannattavuuteen vaikuttavien tekijöiden ymmärtäminen auttaa tekemään tietoon perustuvia kompromisseja visuaalisen muotoilun ja reaalimaailman luotettavuuden välillä.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Luotettavuusspektri, joka näyttää QR-koodit, jotka vaihtelevat erittäin skannattavista raja-arvoihin',
          caption: 'Skannattavuuden spektri: luodinkestävistä koodeista muotoiluun, joka työntää luotettavuusrajat',
        },
      ],
    },
    {
      heading: 'Virheen korjaustasojen ymmärtäminen',
      paragraphs: ['QR-koodit sisältävät sisäänrakennetun irtisanomisen, joka mahdollistaa niiden lukemisen myös silloin, kun ne ovat osittain vahingoittuneet tai hämärtyneet. Virheiden korjaustaso - L (7%), M (15%), Q (25%) tai H (30%) - määrittää, kuinka paljon koodista voi puuttua, kun se vielä dekoodataan oikein. Suurempi virhekorjaus luo suurempia koodeja, mutta antaa varmuusmarginaalin päällystyksille, tulostuksille ja ympäristövahingoille.', 'Koodit, joissa on kuvan päällysteet, virheenkorjaustaso H on välttämätön - overlay fyysisesti hämärtää osan koodia, ja tarvitset, että 30% irtisanomisen ylläpitää luotettavuutta. Puhtaisiin, tyylittömiin koodeihin valvotuissa ympäristöissä, taso M usein riittää. Taso L tulisi varata tilanteisiin, joissa koodikoko on kriittinen ja voit taata koskemattomat ehdot.'],
    },
    {
      heading: 'Kriittinen hiljainen alue',
      paragraphs: ['Hiljainen alue on tyhjä marginaali jokaisesta QR-koodista. Skannerit käyttävät tätä rajaa tunnistaakseen missä koodi alkaa ja päättyy. ISO-standardissa määritellään vähintään hiljainen alue neljä moduulia (neljä kertaa leveys pienin neliön koodi). Tämän tilan rikkominen - design-elementeillä, trimmireunalla tai viereisellä sisällöllä - on yksi yleisimmistä syistä skannausvirheisiin.', 'ANQR:n hiljainen aluevalvonta auttaa säilyttämään tämän kriittisen välin, mutta sinun on myös varmistettava, että se säilyy lopullisissa malleissasi. Kun luovutat QR-taideteokset, määrittele selkeästi hiljaisen vyöhykkeen vaatimukset. Kun asetat koodit asetteluihin, varmista, että mitään elementtejä tunkeutuu tähän tilaan. Muutama millimetri kirkasta tilaa voi tarkoittaa eroa luotettava skannaus ja turhautuneiden asiakkaiden.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Kaavio, jossa näkyy oikea hiljainen vyöhykeväli verrattuna tavallisiin rikkomuksiin, jotka aiheuttavat skannausvirheitä',
          caption: 'Hiljaisen alueen vaatimukset: näkymätön marginaali, joka määrittää skannauksen onnistumisen',
        },
      ],
    },
    {
      heading: 'Kontrasti- ja väriturvallisuus',
      paragraphs: ['QR-skannerit havaitsevat valon ja tumman modulin kuvion. Mikä tahansa tätä kontrastia vähentävä muotoilu - valoesiintymät, tummat taustat, kaltevuusefektit tai vähäopacity-päällysteet - vaikeuttaa koodin lukemista. ANQR laskee kontrastisuhteet ja varoittaa, kun värivalinnat lähestyvät vaarallisia tasoja, mutta lopullinen sovittelija on aina tosimaailman testaus.', 'Värinäkö vaihtelee valaistusolosuhteissa. Väriyhdistelmä, joka näyttää kovalta kontrastilta monitorissasi, voi olla vaikea erottaa lämpimän hehkuvalon tai viileän loisteputken alla. Jos koodia käytetään erilaisissa valaistusolosuhteissa, testaa useilla valonlähteillä ja pidä varovaisempia kontrastisuhteita turvamarginaalina.'],
    },
    {
      heading: 'Moduulin koko ja katseluetäisyys',
      paragraphs: ['Yksittäisten moduulien fyysinen koko määrittää enimmäisetäisyyden, josta koodi voidaan skannata. Pienemmät moduulit tarkoittavat pienempiä koodeja, mutta vaativat lähempää skannausetäisyyttä. Pääsääntönä on, että kunkin moduulin on oltava vähintään 0,5 mm suunnitellulla skannausetäisyydellä ja skaalautuva suhteessa suurempiin etäisyyksiin. Mainostaulun koodi tarvitsee paljon suurempia moduuleita kuin käyntikortin koodi.', 'Laskettaessa moduulin kokoa, harkitse pahin mahdollinen skenaario: asiakas vanhempi puhelin, epätäydellisen valaistuksen, skannaus suurin todennäköinen etäisyys. Suunnittelu tälle käyttäjälle, ja kaikilla muilla on vielä parempi kokemus. ANQR:n kokosuositukset vaikuttavat näihin reaalimaailman muuttujiin siten, että ne antavat tarkoituksenmukaiset mitat käyttötarkoituksellesi.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Kaavio, joka liittyy moduulin kokoon, tulostusmittoihin ja maksimitehokkaaseen skannausmatkaan',
          caption: 'Skannataan etäisyysopas: moduulin koko vastaa käyttövaatimuksia',
        },
      ],
    },
    {
      heading: 'ANQR-turvatilan käyttö',
      paragraphs: ['ANQR:n turvallisuustila antaa reaaliaikaista palautetta skannauksen luotettavuudesta. Se seuraa kontrastisuhteita, hiljaisen vyöhykkeen vaatimustenmukaisuutta, overlay-voimakkuutta ja muita skannattavuuteen vaikuttavia tekijöitä. Kun jokin parametri lähestyy riskitasoja, näet varoituksia, joissa on erityisiä ohjeita siitä, miten parantaa luotettavuutta. Ammattikäyttöönotoissa, joissa viat ovat kalliita, turvallisuustila on pidettävä aktiivisena koko suunnitteluprosessin ajan.', 'Turvatilaan kuuluu myös skannausvarmennustoiminto, joka yrittää purkaa luodun koodin koodin ja ilmoittaa menestyksen tai epäonnistumisen. Vaikka tämä in-app todentaminen ei voi toistaa jokaista reaalimaailman kunnossa, se saalis monia yleisiä kysymyksiä ennen kuin investoit tulostukseen tai jakeluun. Onnistunut todentaminen on vähimmäispalkki eikä takuu - tosielämän testaus on edelleen välttämätöntä.'],
    },
    {
      heading: 'Reaalimaailman testausprotokollat',
      paragraphs: ['Mikään ohjelmiston todentamisen määrä ei korvaa fyysistä testausta. Tulosta haluamasi kokoinen koodi edustavasta materiaalista. Testaa sitä varsinaisessa käyttöympäristössä todelliseen käyttöön sopivilla valaistusolosuhteilla. Skannaa useilla laitteilla - ei vain lippulaivapuhelimellasi, vaan myös budjetilla Android-laitteilla, vanhoilla iPhoneilla ja kaikilla erityislaitteilla, joita yleisö yleensä käyttää.', 'Dokumentoi testit järjestelmällisesti. Tallenna mitä laitteita testattiin, missä olosuhteissa, millä tuloksilla. Jos käytät koodeja mittakaavassa, määritä hyväksymiskriteerit: ehkä 95 prosentin onnistumisaste laitteen testialtaassa tai onnistuneita skannauksia 2 sekunnissa kaikissa testatuissa laitteissa. Nämä standardit auttavat tekemään päätöksistä objektiivisia eivätkä toivomaan parasta.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Kattava testauslista, joka kattaa laitteet, edellytykset ja hyväksymiskriteerit',
          caption: 'QR-käyttötestausprotokolla: järjestelmällinen todentaminen ennen tuotantositoumusta',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Näytä QR-esimerkkejä',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Avaa koko käyttöopas', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Avaa galleria', type: 'gallery' },
  ],
};
