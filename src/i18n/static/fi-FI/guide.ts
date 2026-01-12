import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR-käyttäjäopas',
  description: 'Täydellinen opas ANQR:n käyttöön QR-koodien luomisessa.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avaa generaattori', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Selaa Opi artikkeleita', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Aloittaminen',
      paragraphs: [
        'ANQR on QR-koodigeneraattori, jolla on asiakkaan ensimmäinen lähestymistapa. Oletuksena QR-koodit luodaan paikallisesti selaimessasi - tiliä ei tarvita ja tietosi pysyvät yksityisinä. Ammattikäyttöön voit käyttää myös palvelinpuoli API.',
        'Käyttöliittymässä on kolme rajapintatasoa: Basic, Advanced ja Professional. Valitse tasosi otsikon välilehtien avulla. Jokainen taso avaa lisäominaisuuksia ja pitää käyttöliittymän keskittynyt mitä tarvitset.',
      ],
      bullets: [
        'Perus: Yksinkertainen QR-koodin luominen yksinkertaisella tekstillä/URL-sisällöllä ja kuvalla.',
        'Advanced: QR-koodausvalinnat, renderointityylit, animaatio, tulostusmuodot, laajennettu sisältötyypit ja overlay räätälöinti.',
        'Ammattilainen: Watermarks, metadata, jakaminen, turvallisuusanalyysi, maksu QR-koodit, ja yrityksen ominaisuudet.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Avaa generaattori', type: 'generator' }],
    },
    {
      heading: 'Nopea aloitus',
      paragraphs: ['Luo ensimmäinen QR-koodi:'],
      bullets: [
        '1. Valitse sisältötyyppi (URL, teksti, WiFi jne.) sisältötyypin pudotuspisteestä.',
        '2. Syötä tietosi annettuihin kenttiin.',
        '3. Valinnaisesti muokata värejä, tyylejä, ja lisätä overlay kuva.',
        '4. Napsauta Vie ladataksesi QR-koodin PNG, GIF, WebP tai SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Perusominaisuudet',
      paragraphs: [
        'Perustaso tarjoaa virtaviivaistetun käyttöliittymän luotaessa QR-koodeja hyötykuormasisällöllä ja kuvapäällysteillä. Tämä on yksinkertaisin tapa aloittaa.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Sisältötyypit (perustyypit)',
      paragraphs: [
        'Tavallinen teksti: Koodaa kaikki tekstit QR-koodin kapasiteettirajaan asti. Ihanteellinen lyhyille viesteille, koodeille tai tunnisteille.',
        'URL: Koodaa web-osoitteet. QR-koodi avaa URL-osoitteen skannattaessa. Tukee http:// ja https://protokollia.',
      ],
    },
    {
      heading: 'Kuvan päällystys (perus)',
      paragraphs: [
        'Lataa kuva (JPG, PNG, GIF, WebP) sekoittaaksesi QR-koodisi. Peruskatteen ominaisuuksia ovat:',
      ],
      bullets: [
        'Lataa tiedostosta: Valitse kuva laitteestasi.',
        'Lataa URL: Anna kuvan URL (on sallittava CORS).',
        'Keskuslogo: Asettaa kuvan keskelle tukeutuen virhekorjaukseen.',
        'Blend: Yksinkertainen alfa sekoitus kuvan QR malli.',
        'Intensiteetti: Valvoo, kuinka voimakkaasti overlay vaikuttaa QR-koodiin (0-100%).',
        'Väritila: Täysi väri, harmaasävy tai musta ja valkoinen.',
        'Säilytä kansiokaaviot: Pitää kulmakuvioita muuttamattomina luotettavaa skannausta varten.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Lisäominaisuudet',
      paragraphs: [
        'Advanced taso avaa QR koodaus vaihtoehtoja, renderointi tyylit, animaatio, tulostusmuodot, laajennettu sisältötyypit, ja kehittynyt overlay räätälöinti.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR- koodausasetukset',
      paragraphs: [
        'Versio: QR-koodit tulevat versioissa 1-40, jossa suuremmat versiot pitävät enemmän tietoa, mutta ovat suurempia. Aseta 0:een (Auto), jotta ANQR voi valita pienimmän version, joka sopii sisältöön.',
        'Virhekorjaus: Määrittää, kuinka paljon vahinkoa QR-koodi voi kestää ollessaan skannattavissa.',
      ],
      bullets: [
        'L (Low): 7% virhekorjaus - pienin koko, vähiten irtisanomisia.',
        'M (Medium): 15% virhekorjaus - tasapainoinen vaihtoehto.',
        'Q (kvartiili): 25% virhekorjaus - hyvä painettujen koodien osalta.',
        'H (High): 30% virhekorjaus - paras koodien osalta, joissa on päällysteitä tai ankarissa olosuhteissa.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Hiljainen alue (marginaali)',
      paragraphs: [
        'Hiljainen alue on valkoinen tila QR-koodin ympärillä. Skannerit tarvitsevat tätä marginaalia huomatakseen mistä koodi alkaa. Standardissa suositellaan vähintään neljää moduulia. Alle neljän vähentäminen voi aiheuttaa skannausongelmia.',
      ],
    },
    {
      heading: 'Moduulityyli',
      paragraphs: [
        'Moduulit ovat yksittäisiä neliöitä, jotka muodostavat QR-koodin. ANQR tarjoaa viisi tyylejä:',
      ],
      bullets: [
        'Neliö: Classic QR ulkonäkö terävät kulmat.',
        'pyöristetty: Pehmennetty kulmat ystävällisempi ilme.',
        'Pisteet: Kiertomoduulit modernin esteettisyyden.',
        'Diamond: 45° pyöritetyt neliöt erottuva kuvio.',
        'Yhdistetty: Moduulit yhdistyvät vieressä luoden orgaanisia muotoja.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Finder Pattern Style',
      paragraphs: [
        'Finder kuviot ovat kolme suurta neliöt QR kulmat, jotka auttavat skannereita suuntaamaan koodin. Käytettävissä olevat tyylit:',
      ],
      bullets: [
        'Neliö: Standard neliön kulmat.',
        'pyöristetty: Pehmennetty kulmat vastaavat pyöreä moduuli tyyli.',
        'Ympyrä: Ympyrä löytökuvioita piste-tyylisiä koodeja.',
      ],
    },
    {
      heading: 'Tasaus & Ajoituskaaviot',
      paragraphs: [
        'Kohdistuskuviot näkyvät suuremmissa QR-koodeissa (versio 2+) vääristymän korjaamiseksi. Ajoitusmallit ovat vuorottelevia linjoja, jotka yhdistävät etsijän kuvioita.',
      ],
      bullets: [
        'Tasaustyyli: Match Finder, Square, Pyöreä, tai Circle.',
        'Ajoitustyyli: Match Module, Solid, tai Dashed.',
      ],
    },
    {
      heading: 'Värit',
      paragraphs: [
        'Tulosaineisto QR-moduulien väri. Musta (#00000) on vakio, mutta mikä tahansa tumma väri toimii.',
        'Tausta: Taustaväri. Valkoinen (#ffffff) on standardi. Varmistetaan riittävä kontrasti tulosaineistoon.',
        'Läpinäkyvä tausta: Poista tausta kokonaan käytettäväksi värillisillä pinnoilla. Varmista, että pinta muodostaa riittävän kontrastin.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Moduulin koko ja vika',
      paragraphs: [
        'Moduuli Koko: Valvoo, kuinka suuri kukin moduuli on renderöity pikseleinä. Suuremmat arvot luovat isompia, helpommin skannattavia koodeja.',
        'Moduuli Gap: Lisää tilaa moduulien välillä prosentteina. Pienet aukot (5-15%) voivat parantaa skannattavuutta joissakin olosuhteissa, mutta liialliset puutteet heikentävät luotettavuutta.',
      ],
    },
    {
      heading: 'Tulostusasetukset',
      paragraphs: ['Muoto: Valitse vientimuoto käyttötapauksen perusteella.'],
      bullets: [
        'PNG: Lossless raster-muodossa, ihanteellinen useimpiin käyttötarkoituksiin. Paras tulostus ja digitaalinen.',
        'WebP: Moderni muoto pienempien tiedostojen kokoja. Hyvä verkkokäyttöön.',
        'GIF: Vaaditaan animoituja QR-koodeja. Tukee avoimuutta.',
        'SVG: Vektorimuoto, että asteikot äärettömän. Paras suuri tulostus tai kun sinun täytyy muokata koodia.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tulosten mitat',
      paragraphs: [
        'Leveys/paino: Aseta tulosteen koko pikseleinä. Tulosta varten lasketaan DPI:n perusteella (esim. 300 DPI 1 tuuman kohdalla = 300px). Suuremmat koot skannaavat luotettavammin kaukaa.',
      ],
    },
    {
      heading: 'Animaatioasetukset',
      paragraphs: ['Ohjaus animoitu QR-koodi käyttäytyminen:'],
      bullets: [
        'Nopeus: Animaatiokuvanopeus millisekunnissa.',
        'Loop: Jatkuva tai yhden pelaamisen animaatio.',
        'Pomppu: Ping-pong animaatio suuntaan.',
        'Käynnistä kehys: Aloita animaatio tietystä kehyksestä.',
        'Max Frams: Rajoita kokonaiskehykset animaatiossa.',
        'Kehysvaihe: Ohita kehykset nopeampaan animaatioon.',
        'Interpolointi: Ei mitään, ristiviittaus tai Morph kehysten välissä.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Sisältötyypit',
      paragraphs: ['Advanced taso avaa ylimääräisiä hyötykuorma muotoja:'],
      bullets: [
        'Puhelinnumero (puh:): Luo soittavan puhelinlinkin.',
        'Sähköposti (posti:): Avaa sähköpostiohjelman valinnainen aihe ja elin.',
        'SMS: Esitäytetty tekstiviesti puhelinnumeroon.',
        'vCard: Täysi yhteyskortti nimi, organisaatio, puhelin, sähköposti, osoite.',
        'MeCard: Kompakti kontaktimuoto suosittu Japanissa.',
        'BizCard: Perintö käyntikortti muodossa.',
        'Geo Sijainti: GPS-koordinaatit ovat kartoissa.',
        'WiFi: Verkkotunnukset automaattisen yhteyden (SSID, salasana, tietoturvatyyppi).',
        'Kalenteri Tapahtuma: iCalendar muodossa otsikko, sijainti, päivämäärä / aika.',
        'Event RAVP: Linkki tapahtumarekisteröinti sivulle.',
        'Kalenteri Tilaa: Tilaa ICS/WebCal-syöte.',
        'Tiedoston/asiakirjan URL: Suora linkki ladattaviin tiedostoihin.',
        'Pilvivarastolinkki: Linkit Google Driveen, Dropboxiin, OneDriveen jne.',
        'Sosiaalinen profiili: Linkit LinkedIn, Twitter, Instagram, jne.',
        'Viestinvälityslinkki: WhatsApp, Sähke, Signal syvä linkit.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Advanced Overlay ominaisuudet',
      paragraphs: ['Muut päällystysominaisuudet:'],
      bullets: [
        'Crop: Käytä sadonkorjuu valita neliön alueen kuvan.',
        'Halftone: Klassinen tulostus-tyylinen pistekuvio perustuu kuvan kirkkauteen.',
        'Kuollut: Virhe-diffuusio dithering yksityiskohtaisen jäljentämisen.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overlay Blend -tilat (jatkuva)',
      paragraphs: ['Lisäsekoitustilat kehittyneellä tasolla:'],
      bullets: [
        'Subpixel: Jaa kunkin moduulin alapikseleihin tarkempia yksityiskohtia varten.',
        'Sininen melu: Käyttää sinistä melua dithering artefaktittomia kuvioita.',
        'Mosaiikki: Tiilipohjainen vaikutus säilyttää kuvan rakenne.',
        'Gap Fill: Asettaa kuvan aukkoihin moduulien välillä.',
        'Kirkkaus: Varies moduulin koko perustuu kuvan kirkkautta.',
        'Duotone: Kartta kuva kaksi väriä silmiinpistävä kontrasti.',
      ],
    },
    {
      heading: 'Ohitusteho',
      paragraphs: [
        'Kontrolloi, kuinka voimakkaasti overlay vaikuttaa QR-koodiin (0-100%). Suuremmat arvot osoittavat enemmän kuvan yksityiskohtia, mutta voivat vähentää skannattavuutta. Aloita noin 70% ja säädä perustuu testaukseen.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Väritila',
      paragraphs: ['Miten päällyskuvaa käsitellään:'],
      bullets: [
        'Full Color: Säilyttää alkuperäiset kuvan värit.',
        'Harmaasävy: Muuntaa mustavalkoisiksi sävyiksi.',
        'Musta ja valkoinen: Suuri kontrasti binääri muuntaminen.',
      ],
    },
    {
      heading: 'Säilytä hakumallit',
      paragraphs: [
        'Kun käytössä, pitää kolmen kulman löytäjä kuvioita muuttamatta overlay. Vahvasti suositellaan luotettavaa skannausta.',
      ],
    },
    {
      heading: 'Kuvan esikäsittely',
      paragraphs: [
        'Käytä suodattimia overlay-kuvaasi ennen sekoittamista. Nämä muutokset voivat parantaa kuvan näkyvyyttä lopullisessa QR-koodissa.',
      ],
      bullets: [
        'Kirkkaus (-100 - +100): Kevynnä tai tummenna kuva.',
        'Kontrasti (-100 - +100): Lisää tai pienennä tonaalista aluetta.',
        'Gamma (0,2-3,0): Ei-lineaarinen kirkkauden säätö. Arvot alle 1 vaalean midtoneja, yli 1 tummenna niitä.',
        'Kylläisyys (-100 - +100): Värin voimakkuus. -100 on harmaasävyinen, +100 ylikyllästetty.',
        'Värisävy (0-360 °): Vaihda kaikki värit ympäri väripyörä.',
        'Suhahdus (0- 20 px): Pehmennä kuvan yksityiskohdat.',
        'TerÃ¤vÃ¤ (0-100%): Paranna reunoja ja yksityiskohtia.',
        'Julista (0- 16 tasoa): Vähennä väritasoja julisteen vaikutuksen.',
        'Kynnysarvo (0-255): Muunna binäärimustaksi/valkoiseksi valorajan kohdalla.',
        'Edge Detection: Sobel tai Canny algoritmit näyttää vain reunat.',
        'Käännä kaikki värit.',
      ],
    },
    {
      heading: 'Sovitustila',
      paragraphs: ['Miten overlay-kuva sopii QR-koodin alueelle:'],
      bullets: [
        'Kansi: Kuva täyttää koko alueen, rajaus tarvittaessa.',
        'Sisältää: Koko kuva näkyvissä, voi olla reunat.',
        'Stretch: Kuva vääristää täyttää täsmälleen.',
      ],
    },
    {
      heading: 'Muunna asetukset',
      paragraphs: [
        'Pyöritys: Pyöritetään 90 asteen välein.',
        'Käännä X/Y: Peilaa kuva vaaka- tai pystysuunnassa.',
      ],
    },
    {
      heading: 'Algoritmit',
      paragraphs: [
        'Dithering muuntaa jatkuvaääniset kuvat kuvioiksi, joita QR-koodit voivat edustaa. Saatavana käytettäessä Dithered, Blue Noise tai True Dither sekoitustilat.',
      ],
      bullets: [
        'Virhe Diffuusio: Classic Floyd-Steinberg tyyli. Levittää kvantitaation virhe naapurin pikseleitä.',
        'Tilattu (Bayer): Käyttää kynnysmatriisia säännöllisiin kuvioihin.',
        'Clustered Dot: Simuloi puoliäänitulostuksen.',
        'Tyhjä & klusteri: - Optimoitu dithering.',
        'Blue Noise: Visually miellyttävä satunnaisen näköinen kuvio.',
        'Sininen melu Kynnys: Kynnyshäviö sinisellä melulla.',
        'Valkoinen melu: Satunnainen kynnys dithering.',
        'Gaussian/triangular Melu: Melu eri jakeluilla.',
        'Blue Noise + Error Diffuusio: Hybridi yhdistää molemmat tekniikat.',
        'Screened Blue Noise: Näytön kaltainen sininen äänikuvio.',
        'Havainto: Luminance-painotettu parempi visuaalinen tuloksia.',
        'Edge-Aware: Säilyttää kuvan reunat dithering.',
        'Mukautuva kynnysarvo: Paikallisesti sopeutuva kynnys.',
        'Ajallinen sininen Noise: Animoituja GIF:itä varten vaihtelee kuvio per kehys.',
      ],
    },
    {
      heading: 'Diffuusioytimet',
      paragraphs: ['Kun käytät Virhe Diffuusio dithering, valitse, miten virhe jaetaan:'],
      bullets: [
        'Floyd-Steinberg: Classic 4-naapurin diffuusio. Hyvä yleinen valinta.',
        'Jarvis-Judice-Ninke: 12-naapuri, pehmeämpi mutta hitaampi.',
        'Stucki: Samanlainen kuin JJN eri painoilla.',
        'Burkes: Yksinkertaistettu JJN, nopeammin.',
        'Sierra: Perhe ytimien tasapainottaa laatua ja nopeutta.',
        'Atkinson: Kevyt diffuusio, säilyttää yksityiskohtia, mutta voi olla rakeinen.',
      ],
    },
    {
      heading: 'Dither Strength',
      paragraphs: [
        'Valvoo, kuinka paljon dithering sovelletaan (0-100%). Pienemmät arvot säilyttävät enemmän alkuperäistä mallia, korkeammat arvot näyttävät enemmän kuvan yksityiskohtia.',
      ],
    },
    {
      heading: 'Alapikselin asetukset',
      paragraphs: ['Subpixel-sekoitustilaa käytettäessä:'],
      bullets: [
        'Ruuduston koko: 2×2, 3×3, tai 4×4 alapikseleitä per moduuli. Ylempi = tarkempi.',
        'Center sääntö: Strict edellyttää keskus alipikselin vastaamaan moduuli. Halftone Center sallii vaihtelun.',
        'Neutraali väri: Väri käytetään määrittelemättömiin alapikseleihin.',
        'Finder Override: Miten löytäjä kuvioita renderoidaan (Solid tai tyylikäs).',
      ],
    },
    {
      heading: 'Halftone- asetukset',
      paragraphs: ['Kun käytät Halftone-sekoitustilaa:'],
      bullets: [
        'Solun koko: Moduuli tai N×N ruudukko.',
        'Dot Shape: Circle, Square tai Line.',
        'Kirkkauskäyrä: Lineaarinen, S-Curve, tai Gamma.',
      ],
    },
    {
      heading: 'Duotonen värit',
      paragraphs: [
        'Kun käytät Duotone sekoitustilaa, aseta varjon väri (tummat alueet) ja Highlight väri (kirkkaat alueet).',
      ],
    },
    {
      heading: 'GIF-animaatioasetukset',
      paragraphs: ['Kun käytät animoituja GIF-verhouksia:'],
      bullets: [
        'Käytä Frame Viiveitä: Noudata alkuperäistä GIF ajoitusta.',
        'Max FPS: Raja kuvanopeus (1-60 fps).',
        'Hävityksen käsittely: Noudata tai yksinkertaista runkojen hävittämismenetelmiä.',
      ],
    },
    {
      heading: 'Lisäasetukset',
      paragraphs: ['Renderöintiä koskevat lisävaatimukset:'],
      bullets: [
        'Gap Mode: Ei mitään, Inset, Stroke, tai Negative Space rako muotoilu.',
        'Kulmaradius: Moduulien pyöristetyt kulmat prosentteina.',
        'Gradient: Ei mitään, Lineaarinen, radiaalinen tai kartiomainen kaltevuus moduuleissa.',
        'Eye Ulko- / Sisä Tyyli: Riippumaton muotoilu löytökuvio renkaat.',
        'Pisteen pyöriminen: Kierrä timantti/pistemoduulit.',
        'Eye Scale: Size säätö löytökuvioita.',
        'Runkotyyli: Lisää koristekehys (Rounded Frame, Tarra, Tag).',
        'Kehyksen teksti: Lisää kehyksiin teksti kuten "Skannaa minut!"',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Edistynyt QR-koodaus',
      paragraphs: ['Hieno QR-koodaus:'],
      bullets: [
        'Koodaustila: Automaattinen, Numeerinen, Aakkosnumeerinen, Byte/UTF-8 tai Kanji.',
        'Enforce Min hiljainen alue: Varmista vähintään 4 moduulin marginaali.',
        'Mask Kuvio: Auto (optimaalinen), tai manuaalisesti valitse kuvioita 0-7 ohjata moduulin jakelua. Eri kuviot luovat erilaisia visuaalisia ulkoasuja koodatessaan samaa dataa.',
        'Merkkikoodaus: ISO-8859-1 (Latin-1 oletus), UTF-8 (täydellinen Unicode mukaan lukien emoji), tai Shift-JIS (Japani). Valitse sisältösi luonteen perusteella.',
      ],
    },
    {
      heading: 'Kehittyneet tulostusvalinnat',
      paragraphs: ['Lisävientiasetukset:'],
      bullets: [
        'Tiedostonimi: Oma tiedostonimi ladattavaksi.',
        'GIF Paletti Koko: 2-256 väriä GIF ulostulo.',
        'GIF Quantizer: Mediaani Leikkaa, NeuQuant, tai Octree värin vähentäminen.',
        'GIF Dithering: Off, Floyd-Steinberg, tai Tilattu.',
        'GIF Läpinäkyvä väri: Aseta väri läpinäkyväksi.',
        'SVG Todellinen vektori: Käytä polkuja upotetun rasteri.',
        'SVG Muodon tarkkuus: Pixel tai tarkka polku renderöinti.',
        'SVG Upota Raster Overlay: Sisällytä päällekkäin upotettu kuva.',
        'Tausta Ohita: Pakota tietty taustaväri ulostulossa.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Validointivalinnat',
      paragraphs: ['Syöttöjen käsittelyasetukset:'],
      bullets: [
        'Validoidaan syöte: Tarkista sisältömuoto ennen koodausta.',
        'Trim Whitespace: Poista johto-/katkaisutilat.',
        'Normalisoi uudet rivit: Muuta kaikki rivipäätteet LF:ksi.',
        'Max pituus Guard: Varo, jos sisältö ylittää QR kapasiteetti.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Ammatilliset ominaisuudet',
      paragraphs: [
        'Professional tasolla lisätään vesimerkit, metatiedot, jakaminen vaihtoehtoja, turvallisuusanalyysi, maksu QR-koodit, ja yrityksen ominaisuuksia.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vesileima',
      paragraphs: ['Lisää vesimerkit QR-koodeihisi:'],
      bullets: [
        'Tyyppi: Teksti, kuva tai kuvio vesileima.',
        'Asema: Keski, Kulmat, Edget, Takana, tai hiljainen alue.',
        'Opasiteetti: Vesileiman läpinäkyvyys (0-100%).',
        'Blend Mode: Normaali, Kertoa, Screen tai Overlay sekoitus.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metatiedot',
      paragraphs: ['Upota metatiedot vietyihin tiedostoihin:'],
      bullets: [
        'Nimi, Tekijä, Tekijänoikeus, Lisenssi, Kuvauskentät.',
        'Luomisaika: Upota sukupolven aikaleima.',
        'Oma avain- arvo: Lisää mielivaltaiset metadataparit.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Jakaminen',
      paragraphs: ['Jaa QR-koodin asetukset:'],
      bullets: [
        'Suora Link: Luo jaettavissa oleva URL nykyisten asetusten kanssa.',
        'Upotettu HTML: Hanki upotettu koodi sivustoja.',
        'Koodaa muuttujat: Sisällytä kaikki asetukset jaetun URL-osoitteeseen.',
        'Huomautus: Overlay-kuvia paikallisista tiedostoista ei voi jakaa URL-osoitteen kautta.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Turvallisuusanalyysi',
      paragraphs: ['Varmista, että QR-koodit pysyvät skannattavissa:'],
      bullets: [
        'Turvatila: pois päältä, tasapainotettu tai tiukat skannausvaatimukset.',
        'Minimimoduuli Koko: Pienin pikselikoko moduulia kohti.',
        'Hiljaa! Alue: Vähimmäismarginaalimoduulit.',
        'Lock Finders/Tilling/Align/Format/Version: Suojaa tietyt elementit.',
        'Max Overlay Intensity ECC:llä: Automaattiset tehorajat, jotka perustuvat virhekorjaustasoon.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Sisältötyypit (ammattimaiset)',
      paragraphs: ['Ammatillinen taso lisää maksu- ja yrityssisältötyyppejä:'],
      bullets: [
        'EPC/SEPA (EU): Eurooppalaiset pankkisiirtojen QR-koodit, joissa on IBAN, BIC, määrä, viite.',
        'UPI (Intia): Yhdistetty maksuliittymä VPA:n kanssa, maksunsaajan nimi, määrä.',
        'PayNow: Singapore nopea maksu UEN tai matkapuhelinnumero.',
        'PromptPay (Thaimaa): Thaimaan kansallinen maksujärjestelmä.',
        'PIX (Brasilia): Brasilian pikamaksu PIX-avaimella.',
        'Crypto: Bitcoin, Ethereum, Litecoin maksuosoitteita valinnainen määrä.',
        'Markkinointi Kampanjalinkki: URL-osoitteet, joissa on täydellinen UTM-parametri (Markkinointi Tunnisteet) seuranta.',
        'Lyhyt linkki: Dynaamisten/jäljittävien QR-koodien URL-lyhentimien kanssa käytettäväksi.',
        'GS1 Digital Link: Tuotteen tunniste GTIN, sarja, erä, voimassaolon päättyminen.',
        'App Deep Link: iOS/Android app syvät yhteydet mukautettuihin järjestelmiin.',
        'Mukautettu muoto: Raakadata ilman muotoilua tai validointia.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Kieliin liittyvät maksut edistyneessä tilassa',
      paragraphs: [
        'Kun käytät Advanced-tilaa, ANQR näyttää automaattisesti maksutavat, jotka liittyvät valitsemaasi kieleen. Esimerkiksi vietnamilaiset käyttäjät näkevät VietQR:n, thaimaalaiset käyttäjät PromptPayn ja intialaiset kielikäyttäjät UPI:n ja BharatQR:n. Maailmanlaajuiset maksutavat (cryptocurrency, PayPal, Cash App) ovat käytettävissä kaikilla kielillä. Ammattimainen tila avaa kaikki maksustandardit kielestä riippumatta.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Eurooppalaiset maksustandardit',
      bullets: [
        'EPC/SEPA (EU): Eurooppalaiset pankkisiirtojen QR-koodit EPC:n QR-koodistandardin mukaisesti. Tukee IBANia, BIC-koodia (vapaaehtoinen kotimaan osalta), euroa ja jäsenneltyjä tai jäsentymättömiä maksuviittauksia. Käytetään kaikkialla SEPA-alueella, mukaan lukien EU-maat sekä Sveitsi, Norja, Islanti, Liechtenstein, Monaco ja San Marino.',
        'Sveitsin QR-bill: Sveitsin maksustandardi SIX:n täytäntöönpano-ohjeiden mukaisesti. Tukee CHF- ja EUR-, QR-Reference (QRR), Creditor Reference (ISO 11649), strukturoitu velkojan/velallisen osoitteet ja laskun tiedot. Vaaditaan Sveitsin laskuihin vuodesta 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Intian maksustandardit',
      bullets: [
        'UPI (Intia): Yhdistetty maksuliittymä NPCI Deep Linking Specificationin jälkeen. Tukee VPA (Virtual Payment Address), maksunsaajan nimi, määrä INR, tapahtuma note, viite ID, kauppias luokan koodi, ja tapahtumatilassa.',
        'BharatQR (Intia): Yhdistetty QR-standardi, joka tukee sekä UPI- että korttipohjaisia maksuja. Yhdistää UPI VPA kortti PAN maksimaalisen yhteensopivuuden. Sisältää kauppanimi, kaupunki, MCC, GST tiedot, ja laskun / viitenumerot.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kaakkois-Aasian maksustandardit',
      bullets: [
        'PayNow: Singaporen nopea maksujärjestelmä käyttäen EMVCo QR erittely SGQR profiili. Tukee UEN (yritysrekisteri), mobiilinumero, tai NRIC välitystunnusten. Sisältää määrä muokattavissa lippu ja viimeinen käyttöpäivämäärä.',
        'PromptPay (Thaimaa): Thaimaan kansallinen maksujärjestelmä, joka seuraa Bank of Thailand EMV -profiilia. Tukee matkapuhelinnumeroa, henkilötunnusta, verotunnusta, e-lompakkotunnusta ja laskun maksua useilla viitekentillä.',
        'QRIS (Indonesia): Nopea vastekoodi Indonesian standardi. EMV-pohjainen kansallinen maksustandardi, joka tukee kauppiastunnusta, NMID:ää (National Merchant ID), kauppiaskriteereiden luokittelua ja mukavuusmaksuja (kiinteä tai prosenttiosuus).',
        'DuitNow (Malaysia): Malesian pikamaksujärjestelmä. Tukee useita välityspalkkiotyyppejä kuten NRIC, mobiili, passi, armeijan ID, ja liiketoiminnan rekisterinumerot.',
        'VietQR (Vietnam): Vietnamin pankkien välinen siirto standardi. Vaaditaan pankki BIN (NAPAS-tunnus) ja tilinumero. Tukee useita palvelukoodeja eri siirtotyypeille (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filippiinejä): Philippine QR maksustandardi InstaPay ja PESONet. Käyttää tilinumeroita, joissa on kauppiastunnus (P2M) -tapahtumissa.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Itä-Aasian maksustandardit',
      bullets: [
        'TWQR (Taiwan): Taiwanin QR-maksustandardi. Tukee kauppiastunnusta, verotunnistetta ja TWD-määriä.',
        'HKQR/FPS Hong Kong Faster Payment System QR-koodit. Tukee FPS-tunnusta, mobiilinumeroa tai sähköpostia maksutunnisteina. Määrät HKD:nä.',
        'JPQR (Japani): Japanin yhtenäinen QR-koodi maksustandardi. Käyttää varaston tunnistetta kauppiastunnistukseen JPY-määrillä.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Muut alueelliset maksuvaatimukset',
      bullets: [
        'PIX (Brasilia): Brasilian keskuspankin pikamaksujärjestelmä BR-koodin mukaisesti. Tukee PIX-näppäimiä (CPF, CNPJ, sähköposti, puhelin tai satunnaisavain), kauppanimi / kaupunki, tapahtumatunnus ja BRL määrät.',
        'AusPayNet/NPP PayID (Australia): Australian uusi maksualusta PayID-järjestelmä. Tukea maksaa Henkilötunnukset (sähköposti, matkapuhelin, ABN, organisaatiotunnus) tai perinteinen BSB + tilinumero. Kauppiaan nimi on valinnainen, koska maksajat näkevät rekisteröidyn nimen NPP:stä.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cryptocurrency Maksut',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): Standard cryptocurrency payment URIs lompakon osoite, valinnainen määrä, ja etiketti. Yhteensopiva kaikkien suurten Bitcoin ja Litecoin lompakot.',
        'Lightning Network (BOLT11): Lightning Network -maksulaskut. Liitä BOLT11 koodattu lasku merkkijono instant Bitcoin maksuja minimaalinen maksut.',
        'Ethereum (EIP-681): Ethereum Transaction request URIs, joka tukee alkuperäisiä ETH-siirtoja ja ERC-20:tä. Sisältää ketjun ID moniverkon tukea (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), kaasuparametreja, ja sopimus toimintopuhelut.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Maksulinkkipalvelut',
      bullets: [
        'PayPal.Me: PayPal-maksuyhteydet käyttäjätunnuksella ja vapaaehtoisella esitäytetyllä määrällä. Vastaanottajat voivat maksaa PayPal saldo, kortit, tai pankkitilit.',
        'Cash App: Cash App maksu linkit käyttäen $ cashtag valinnainen määrä. Suosittu Yhdysvalloissa vertaismaksujen.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tavallinen EMV QR',
      bullets: [
        'EMV Tavallinen: Luo mukautettu EMV Merchant-Esitetty tila Maksujärjestelmien QR-koodit, joita ei ole erikseen lueteltu. Määritä kauppanimi, kaupunki, maakoodi (ISO 3166-1), valuuttakoodi (ISO 4217 -numero), MCC, vinkki/kompensointimaksuvaihtoehdot ja lisätietokentät. Hyödyllinen testauksessa tai mukautetun integraation.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blend Modes (ammattimainen)',
      paragraphs: ['Lisäsekoitustilat ammattilaistasolla:'],
      bullets: [
        'Pixelate: Pixelated overlay effect.',
        'Outline: Edge detecting overlay näyttää vain ääriviivat.',
        'Aalto: Wavy vääristymä vaikutus.',
        'Alipikselin koko: Muuttuja alapikselin koon perusteella kuva.',
        'True Dither: Advanced dithering tilattu matriisi valinta.',
        'Äärimmäinen: Maksimikuvan näkyvyys, voi vaikuttaa skannattavuuteen.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Suojaasetukset',
      paragraphs: ['Hienopiirretty valvonta, johon QR-elementit on suojattu peiton muuntamiselta:'],
      bullets: [
        'Säilytä ajoitus: Pidä ajoituskuviot ennallaan.',
        'Säilytä linjaus: Pidä linjauskuvioita muuttamattomana.',
        'Suojaa muoto Info: Shield-formaatin tietomoduulit.',
        'Suojaa versio Tiedot: Shield-version tietomoduulit.',
      ],
    },
    {
      heading: 'ECC-tietotila',
      paragraphs: [
        'Älykkäästi jakaa overlay-intensiteetti perustuu virhekorjaus kapasiteetti. Järjestelmä analysoi, mitä moduuleja voidaan muuttaa samalla kun ylläpidetään skannattavuutta.',
      ],
      bullets: [
        'Riskibudjetti: Käytettyjen virheiden korjauskapasiteetin prosenttiosuus (0-100%).',
        'Korkeampi budjetti = näkyvämpi overlay mutta riskialttiimpi skannattavuus.',
        'Alempi budjetti = turvallisempi skannaus, mutta vähemmän näkyviä päällystys.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professional Rendering asetukset',
      paragraphs: ['Kehittyneet renderointikontrollit:'],
      bullets: [
        'Crisp Edges: Käytä pikseliä kuvan renderöinti teräviä moduulin reunoja.',
        'Pixel Snap: Lattia, Pyöreä tai Ceil pikselin linjaus.',
        'Per-Module väritila: kiinteä, Brightness, Position, Overlay, by Cluster.',
        'Väripaletti: Määrittele mukautetun väripaletti per-moduuli väritys.',
        'Contrast Guard: Varmista pienin kontrastisuhde värejä.',
        'Min Contrast ratio: WCAG-tyylinen kontrastivaatimus (1:1-21:1).',
        'Ulkoraja Moduulit Lisärajaa rauhallisen alueen ulkopuolelle.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ammattimainen tulostusvalinnat',
      paragraphs: ['Yrityksen vientiasetukset:'],
      bullets: [
        'DPI: Aseta tulostusresoluutio (72-600 DPI). 300 DPI suositellaan tulostukseen.',
        'Sisällytä hiljainen alue: Vaihda hiljainen alue ulostulon mittoihin.',
        'Vie lisänä: Luo PDF yhdessä ensisijainen muoto.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Animaatioasetukset (ammattimainen)',
      paragraphs: ['Muut ammatilliset animaatioominaisuudet:'],
      bullets: [
        'Aikaväli: Off, Blue Noise, tai Flicker Safe per-frame dithering.',
        'Kuvio: Ei pulssia, aaltoa, skannausta, Shimmeriä tai Drift-efektejä.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Viite',
      paragraphs: [
        'ANQR tarjoaa palvelimen puolella olevan API:n QR-koodien tuottamiseen URL-parametrien avulla. Tämä on ihanteellinen QR-koodien liittämiseen sivustoihin, sähköposteihin, asiakirjoihin tai automatisoituun työnkulkuun ilman JavaScript-sovellusta.',
        'Base URL: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'example' }],
    },
    {
      heading: 'Perusparametrit',
      paragraphs: ['Vaaditut ja yhteiset parametrit (parametrinimiä ei käännetä):'],
      bullets: [
        'Tiedot (pakollinen): QR-koodiin koodattava sisältö. URL-encode erikoismerkit.',
        'koko: Kuvan koko pikseleinä (oletus: 400, max: 2000). Käytetään, jos w/h ei ole määritelty.',
        'w, h: lähtöleveys ja korkeus pikseleinä. Ohittaa kokoparametrin.',
        'muoto: Tulostusmuoto - png, webp tai gif (oletus: png).',
        'ek: Virheen korjaustaso - L, M, Q tai H (oletus: H).',
        'fg: Lähtöväri kuin hex ilman # (oletus: 000000).',
        'bg: Taustaväri kuin hex ilman # (oletus: ffffff).',
        'läpinäkyvä: Aseta 1 läpinäkyvä tausta.',
        'marginaali: Hiljainen alue moduuleissa (oletus: 4).',
      ],
    },
    {
      heading: 'Tyyliparametrit',
      paragraphs: ['Moduuli ja kuvion muotoilu:'],
      bullets: [
        'tyyli: Moduuli tyyli - neliö, pyöristetty, pisteitä, timantti, kytketty.',
        'löytäjä: Finder kuvio tyyli - neliö, pyöristetty, ympyrä.',
        'linjaus: Tasaus kuvio tyyli - match_finder, neliö, pyöristetty, ympyrä.',
        'ajoitus: Ajoitus kuvio tyyli - match_moduuli, kiinteä, katkottu.',
        'säde: Kulman sädeprosentti 0-100.',
        'ero: Moduulin eroprosentti 0-50.',
        'väliMode: Gap-tila - ei mitään, sisäänpano, isku, negatiivinen_avaruus.',
        'silmä Ulko-, eyeSisä: Silmä tyylit - neliö, pyöristetty, ympyrä.',
        'Silmäskaala: Silmä-asteikon prosenttiosuus (oletus: 100).',
        'gradienttityyppi - ei mitään, lineaarinen, säteittäinen, kartiomainen.',
        'gradienttikulma lineaarisille kaltevuuksille.',
        'gradStops: Gradient pysähtyy kuin väri1,pos1,color2,pos2,... (esim., ff0000,0000,000ff,1).',
      ],
    },
    {
      heading: 'Täyttöparametrit',
      paragraphs: ['Kuvan päällystysvalinnat (overlay-kuva on noudettu palvelimen puolelle):'],
      bullets: [
        'igg: URL päällekkäin kuva (on oltava julkisesti saatavilla).',
        'tila: Overlay tila - keskus, puoliääni, sekoitus, kirkkaus, mosaiikki, dithered, sininen-melu, alipikseli.',
        'intensiteetti: päällystysintensiteetti 0-100 (oletus: 100).',
        'väri Tila: Overlay väritila - väri, harmaasävy, bw.',
        'istuvuus: Kuinka päällystys sopii - kansi, sisältää, venyttää.',
        'mätä: Overlay pyörii asteissa.',
        'flipX, flipY: Aseta 1 kääntää overlay.',
        'säilytä Löytäjät: Säilytä etsijän kuviot (oletus: 1).',
        'säilytä Ajoitus, keepAlign: Aseta 1 säilyttää ajoitus-/linjauskuvioita.',
      ],
    },
    {
      heading: 'Esikäsittelyparametrit',
      paragraphs: ['Kuvan esikäsittely päällekkäin:'],
      bullets: [
        'Kirkkaus: säätö -100 - 100 (oletus: 0).',
        'kontrasti: säätö -100 - 100 (oletus: 0).',
        'gamma: arvo 0,1-3 (oletusarvo: 1).',
        'saturaatio: Säätäminen -100 - 100 (oletus: 0).',
        'Värisävy: Värisävy pyörii asteissa.',
        'Suhahdus pikseleinä.',
        'teroitus: Terävä määrä 0-100.',
        'juliste: Juliste tasot.',
        'kynnysarvo: Binäärikynnys 0-255.',
        'reuna: Edge havaitseminen - pois, Sobel, Canny.',
        'invertti: Aseta 1 invertti värit.',
      ],
    },
    {
      heading: 'Vesileiman parametrit',
      paragraphs: ['Lisää vesimerkit luotuihin QR-koodeihin:'],
      bullets: [
        'wmEn: Aseta 1 jotta vesileima.',
        'wm Vesileiman tyyppi - teksti, kuva, kuvio.',
        'wmText: Vesileiman teksti (URL-koodattu).',
        'wmImg: URL vesileimakuvaan.',
        'wmPos: Sijainti - keskusta, kulmat, reunat, takana, hiljainen_zone.',
        'WmOpacity: Opacity 0-100 (oletus: 50).',
        'wmBlend: Blend-tila - normaali, moninkertaistaa, näyttö, overlay.',
      ],
    },
    {
      heading: 'Animaatioparametrit',
      paragraphs: ['Animoitu GIF-ulostulo (vaatii muotoa=gif):'],
      bullets: [
        'animi Kuvio: Animaatiokuvio - ei pulssia, aaltoa, skannauslinjaa, kiiltoa, ajelehtimista, väri_sykliä.',
        'animi Kehykset: Kehyksiä 1-60 (oletus: 24).',
        'animi Nopeus: Kehys viive millisekunneissa 10-1000 (oletus: 100).',
        'animi Siemen: Satunnainen siemen animaatio.',
        'Helpotus: Animaatio helpotus - lineaarinen, easy_in, easy_out, easy_in_out, bounce.',
      ],
    },
    {
      heading: 'Tulosparametrit',
      paragraphs: ['Tulostusmuodon asetukset:'],
      bullets: [
        'laatu: WebP laatu 0-1 (oletus: 0,9).',
        'webpQ: WebP laatu 0-100 (oletus: 90).',
        'gifColors: GIF-palettikoko 2-256 (oletus: 256).',
        'dpi: Lähtö DPI PNG:lle (oletus: 72).',
        'MetaTime, metaAuthor, metaCopy, meta Desc: PNG-metatietokentät.',
      ],
    },
    {
      heading: 'Esimerkki Usage',
      paragraphs: [
        'QR- peruskoodi:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Tyylikäs QR-koodi mukautettuja värejä:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffff&style=rounded&radius=30',
        'QR-koodi overlay-kuvalla:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=puolity&intensity=70',
        'Animoitu GIF:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easeing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'example' }],
    },
    {
      heading: 'QR-koodien lähettäminen',
      paragraphs: [
        'Professional tilassa, Jaa ominaisuus luo upotettava HTML ja URL. Näin upottaminen toimii:',
      ],
      bullets: [
        'Jaa linkki: Luo URL-osoitteen ANQR-sovellukseen kaikki asetukset koodattu URL-parametreiksi. Vastaanottajat voivat tarkastella ja muokata QR-koodia.',
        'Upota kuva: Luo <img> tag osoittaa palvelimen API. QR-koodi on renderoitu palvelimen puolella ja toimii kuvana.',
        'Upota Markdown: Luo Markdown kuva syntaksin dokumentaatiota ja README-tiedostoja varten.',
        'Suora API- osoite: Raaka API URL käytettäväksi sovelluksissa, skriptit, tai muut integraatiot.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML- esimerkki',
      paragraphs: [
        'Upottaaksesi QR-koodin sivustoosi:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        'Responsiivinen mitoitus:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" tyyli="max-leveys: 100%; korkeus: auto;" />',
        'Palvelinvälimuisti vastaa pitkillä välimuistin otsikoilla, joten toistuvat pyynnöt samasta URL-osoitteesta ovat nopeita.',
      ],
    },
    {
      heading: 'Jaa verkko- osoitteen muoto',
      paragraphs: [
        'Kun napsautat Jaa Professional-tilassa, ANQR koodaa nykyiset asetukset URL-parametreihin. Muoto:',
        'https://anqr.link/?data=...&ec=H&style= pyöristetty&...',
        'Nämä parametrit heijastavat API parametreja, joten voit muuntaa jako-osoite API URL muuttamalla peruspolku / /api/qr ja säätämällä w/h parametreja tarpeen mukaan.',
        'Huomaa: Paikallisista tiedostoista ladattuja Overlay-kuvia ei voi jakaa URL-osoitteen kautta - vain URL-pohjaiset versaalit (img-parametri) toimivat jaettuihin linkkeihin ja API-puheluihin.',
      ],
    },
    {
      heading: 'Luokitusrajat ja käyttö',
      paragraphs: [
        'API on vapaa käyttämään kohtuullisia määriä. Suuri määrä käyttöä tai kaupallisia sovelluksia, jotka vaativat taattua ajan, ota meihin yhteyttä.',
        'API-vastauksia ovat aggressiiviset välimuistin otsikot. Paras suorituskyky, välimuisti vastaukset päässä tai käyttää samaa URL johdonmukaisesti identtinen QR-koodit.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Parhaat käytännöt',
      paragraphs: ['Noudata näitä ohjeita luotettavien QR-koodien osalta:'],
      bullets: [
        'Testaa aina QR-koodisi useilla skannerisovelluksilla ennen tulostamista.',
        'Käytä virhekorjausta H (korkea) lisättäessä overlays.',
        'Säilytä vähintään 4 moduulia hiljaista vyöhykettä (marginaali).',
        'Varmista korkea kontrasti tulosaineiston ja taustan välillä.',
        'Painettaessa käytetään vähintään 300 DPI:tä ja testataan todellinen tulostuskoko.',
        'Käytä Säilöntäpiirroksia, kun käytät päällyskuvia.',
        'Aloita pienemmällä päällystysvoimakkuudella ja lisää vähitellen.',
        'Ulkokäyttöön, harkita suurempi moduulin kokoa ja suurempi virhekorjaus.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Selaa Opi artikkeleita', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'example' },
      ],
    },
    {
      heading: 'Vianmääritys',
      paragraphs: ['Yhteiset kysymykset ja ratkaisut:'],
      bullets: [
        'QR ei skannaa: Vähennä overlay-voimakkuutta, lisää virhekorjausta, tarkista kontrasti.',
        'Liian suuri koodi: Pienennä sisällön pituus, käytä URL lyhennystä, alempi versio.',
        'Suhahduksen tulos: Lisää moduulin kokoa, käytä PNG sijaan pakattu formaatteja.',
        'Värit näyttävät vääriltä: Tarkista väri kontrasti, kokeile harmaasävyinen overlay-tila.',
        'GIF ei animoi: Varmista GIF-muodossa tulostus, tarkista kehysmäärä.',
        'Kuvan päällystys ei ladata: Tarkista etäkuvien CORS-oikeudet.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Katso asiaan liittyviä oppaita ja esimerkkejä',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Näppäimistön pikanäppäimet',
      paragraphs: [
        'ANQR tukee tavallisia näppäimistön pikanäppäimiä. Käytä Ctrl/Cmd+S:ää viennin käynnistämiseen (kun keskityt esikatseluun).',
      ],
    },
    {
      heading: 'Jaetaan & upotus',
      paragraphs: [
        'Professional tilassa, klikkaa Jaa-painiketta kopioida URL nykyisillä asetuksilla. Vastaanottajat voivat avata tämän URL-osoitteen nähdäkseen tarkat asetukset. Huomautus: Overlay-kuvia paikallisista tiedostoista ei voi jakaa URL-osoitteen kautta.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Kokeile tätä konfiguraatiota suoraan ANQR-generaattorista.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Selaa Opi artikkeleita', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Näytä QR-esimerkkejä', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Avaa generaattori', type: 'generator' },
  ],
};

export default guide;
