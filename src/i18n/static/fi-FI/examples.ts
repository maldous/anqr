import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Esimerkkejä',
  description: 'Viisi todellista, tuotantotyylistä esimerkkiä, jotka osoittavat, missä QR-koodit luovat mitattavaa arvoa: vanhan vähittäiskaupan laskurikoodin kohottaminen, merkkivähittäismaksut ja skannaustoiminnot, tulosteiden skaalaus lentolehtisistä mainostauluihin, animoitu QR digitaalisiin kylteihin ja monikielinen yhteistyö jaettavien ankkurilinkkien avulla. Jokainen esimerkki sisältää kuvia, käytännön rajoituksia ja remix-linkin takaisin generaattoriin.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avaa generaattori', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Selaa Opi artikkeleita', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Avaa koko käyttöopas', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Case Study: Retail Counter QR Uplift',
      paragraphs: ['Tämä tosimaailman esimerkki seuraa pientä kahvilaa, joka oli käyttänyt samaa QR-koodia laskurissaan kolme vuotta. Alkuperäinen koodi syntyi nopeasti pandemian aikana, painettiin vakiopaperille ja liukastui muovitelineeseen. Se toimi edelleen - teknisesti - mutta asiakkaat tarvitsivat usein useita yrityksiä sen skannaamiseen, eikä se vahvistanut kahvilan huolellisesti keksittyä brändi-identiteettiä.', 'Muutos alkoi yksinkertaisella auditilla: nykyinen koodi koodasi kahvilan verkkovalikosta URL, jonka he halusivat säilyttää. Haasteena oli saada QR tuntumaan osaksi kahvilakokemusta sen sijaan, että se olisi jälki-idea vuonna 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Sääntynyt QR-koodi muovitelineessä, jossa on näkyvä kuluminen, sormenjäljet ja haalistunut tulostus',
          caption: 'Lähtökohta: kolmen vuoden laskuripalvelu oli jättänyt alkuperäisen QR tuskin toimiva',
        },
      ],
    },
    {
      heading: 'Alkuperäisen koodin ongelmien diagnosointi',
      paragraphs: ['Testi paljasti useita kysymyksiä: alkuperäinen koodi käyttää Virhekorjaus L (vähimmäisvähennys), oli hiljainen vyöhyke vain 2 moduulia, ja tulostettiin alhainen resoluutio. Kahvilan lämpimän volframivalaistuksen alla jo valmiiksi hakatut mustat moduulit tuskin erottuivat keltaisesta paperista. Vanhemmat puhelimet kamppailivat; uudemmat puhelimet onnistuivat mutta huomattava viive.', 'Teknisten kysymysten lisäksi yleinen mustavalkoinen neliö ei välittänyt brändistä mitään. Asiakkaat epäröivät ennen skannausta - pieni luottamuseste, joka vähensi sitoutumista kahvilan huolellisesti suunniteltuun digitaaliseen valikkoon.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnostinen peitto, joka osoittaa alkuperäisen QR:n tekniset puutteet: alhainen ECC, hiljainen alue, heikko kontrasti',
          caption: 'Tekninen analyysi paljastaa, miksi vanha koodi alikehittynyt reaalimaailman olosuhteissa',
        },
      ],
    },
    {
      heading: 'Nostamisprosessi',
      paragraphs: ['Käyttämällä ANQR, kahvilan omistaja luo koodin uudelleen identtinen valikko URL mutta dramaattisesti parannettu asetukset: Virhekorjaus H maksimaalisen häiriönsietokyvyn, 6 moduulin hiljaisen alueen luotettavan rajatunnistuksen ja brändin värit (syvän viininpunaiset moduulit kermataustalla), jotka sopivat kahvilan sisustuspalettiin.', 'Kahvilan logolla varustettu pieni keskusverhous säilytettiin tarkoituksellisesti hienovaraisesti skannattavuuden säilyttämiseksi samalla kun tuotemerkki tunnistettiin välittömästi. Turvatila vahvisti, että uusi suunnittelu skannattiin luotettavasti testilaitteiden läpi ennen tulostusta.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR-liitäntä, jossa näkyy konfiguraatio: merkkivärit, sopiva ECC, antelias hiljainen alue, hienovarainen logo päällystys',
          caption: 'Päivitetyn konfiguroinnin rakentaminen: jokainen asetus, joka on valittu tasapainottamaan brändin ilmentymistä skannausluotettavuudella',
        },
      ],
    },
    {
      heading: 'Mitattavat tulokset',
      paragraphs: ['Kun uusi QR oli otettu käyttöön ammattilaismatte-laminoidussa korttivarastossa, kahvila seurasi tuloksia neljän viikon ajan. Skannauksen onnistumisaste parani arvioidusta 70 prosentista lähes 100 prosenttiin. Keskimääräinen skannausaika laski 3-4 sekunnista alle 1 sekunnien. Merkittävintä oli, että menusitoumus kasvoi 40% - aiemmin QR:ään vilkaisseet asiakkaat skannasivat nyt luottavaisesti.', 'Henkilökunta ilmoitti vähemmän asiakkaiden kysymyksiä "miten käyttää QR" eikä enää tapauksia käsin kirjoittamalla URL turhautuneille asiakkaille. Myös brändin ulkonäkö herätti keskustelua, jossa asiakkaat kommentoivat positiivisesti yhtenäistä muotoilua.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A ennen / jälkeen vertailun metrit: skannaus onnistumisnopeus, keskimääräinen skannausaika, ja viikoittainen skannauslaskenta parannuksia',
          caption: 'Neljän viikon tiedot, joista käy ilmi ajattelevan QR-nousun mitattavissa oleva vaikutus',
        },
      ],
    },
    {
      heading: 'Luo tämä asetus uudelleen',
      paragraphs: ['Kahvilan kokoonpano osoittaa konservatiivista mutta tehokasta brändäystä: Virhekorjaus H, 6-moduulin hiljainen vyöhyke, korkean kontrastin brändivärit, ja minimaalinen keskustan päällystys. Tämä tasapaino toimii useimmissa vähittäislaskurisovelluksissa, joissa luotettavuuden on oltava etusijalla, mutta brändin läsnäololla on edelleen merkitystä.', 'Avaa generaattori näillä asetuksilla valmiiksi ladattuna ja sovita värit ja päällystys omaan brändiisi. Keskeinen oivallus: pelkät luotettavuuden parannukset voivat lisätä merkittävästi sitoutumista, jopa ennen visuaalista muotoilua.', 'Tarkastele asiaa koskevaa Opi opas nykyisten QR-kampanjoiden parantamisesta tämän lähestymistavan taustalla olevien menetelmien osalta.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Linkki generaattoriin, joka on esiasetettu kahvilan asetuksissa välitöntä räätälöimistä varten',
          caption: 'Aloita testatulla konfiguraatiolla ja muokkaa brändiäsi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Selaa Opi artikkeleita',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Tapaustutkimus: Multi-payment Counter Display',
      paragraphs: ['Tämä esimerkki seuraa boutique-vaatekauppa, joka oli kerännyt viisi erilaista QR-koodia rekisteriinsä: pankkimaksut, vinkit, Instagram, Googlen arvostelut ja vuokrauslinkki. Jokainen tuotettiin eri lähteestä, painettiin eri aikaan, ja näytettiin yhteensopimattomissa metsissä. Visuaalinen kaaos oli heikentämässä kaupan huolellisesti kuratoitua estetiikkaa, ja henkilökunta käsitteli säännöllisesti asiakkaita skannaamassa väärää koodia.', 'Ratkaisu tarvitaan erottamalla huolet: maksukoodit tarvitsivat maksimaalisen luotettavuuden konservatiivinen muotoilu, kun taas markkinointi koodit voisivat olla ilmeisempiä. Yhdistetty näyttöjärjestelmä osoittaa, miten brändin läsnäolo voidaan tasapainottaa eri QR-käyttötapausten toiminnallisiin vaatimuksiin.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Tyhmä rekisterialue, jossa on viisi erilaista QR-koodia erilaisissa metsissä ja painetuissa materiaaleissa',
          caption: 'Kaoottinen lähtökohta: viisi katkaistua QR-koodia kilpailevat huomiosta ja aiheuttavat sekaannusta asiakkaille',
        },
      ],
    },
    {
      heading: 'Maksukokemuksen priorisointi',
      paragraphs: ['Kaupan perusmaksumenetelmässä käytettiin alueellista standardia, joka vaati tiukkaa hyötykuorman noudattamista. Testi osoitti, että pienikin muotoilu vaikutti skannausnopeuteen tietyillä pankkisovelluksilla. Päätös: Pidä maksu QR täysin muuntamaton paitsi koko optimointi ja ammatillinen tulostus matta korttivarastoon.', 'Tämä konservatiivinen lähestymistapa tarkoitti sitä, että maksukoodi näytti vähemmän "brändätyltä" kuin ihanteellinen, mutta transaktioiden toteutumisaste parani huomattavasti. Oivallus: maksuhetket eivät ole brändäysmahdollisuuksia - ne ovat luotettavuushetkiä. Asiakkaat arvostavat nopeutta ja varmuutta esteettisyyden kustannuksella, kun rahaa on mukana.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Puhdas, suuri maksu QR koodi ammatillinen matta korttia varastossa, sijoitettu näkyvästi rekisteriin',
          caption: 'Maksu QR: kooltaan antelias, painettu ammattimaisesti, tyyliin konservatiivisesti välitöntä tunnustamista pankkisovellukset',
        },
      ],
    },
    {
      heading: 'Toissijaisen toimintanäytön luominen',
      paragraphs: ['Vinkkejä, arvosteluja, sosiaalisia, ja vuokraus, kauppa voisi olla ilmaisukykyisempi. Nämä koodit regeneroitu ANQR johdonmukaisella brändityylillä: kaupan allekirjoitus oliivinvihreä kerma, pyöristetty moduuli tyyli, ja hienovarainen keskus päällystetään kaupan kuvake. Virhekorjaus H varmisti luotettavuuden myös muotoilu.', 'Nämä neljä koodia oli järjestetty brändätty paneelin vieressä (ei kilpaileva) maksukoodi. Selkeät tarrat kaupan typografiassa selittivät jokaisen koodin tarkoituksen. Visuaalinen hierarkia oli tahallinen: maksu seisoi yksin ja näkyvästi; toissijaiset toimet ryhmiteltiin vaihtoehdoiksi.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Merkkipaneeli, jossa on neljä tyylikästä QR-koodia vinkeille, arvosteluille, sosiaaliselle ja palkkaamiselle, selkeillä tarroilla',
          caption: 'Sekundääritoimintapaneeli: johdonmukainen brändäys, selkeä merkintä, sijoitettu vaihtoehtoina eikä häiriötekijöitä',
        },
      ],
    },
    {
      heading: 'Näytä järjestelmän suunnittelu',
      paragraphs: ['Fyysinen näyttö ratkaisi useita ongelmia samanaikaisesti. Sekä maksutelineessä että varapaneelissa käytettiin mattamateriaaleja häikäisyn poistamiseksi ylävalaistuksesta. Korkeuksia optimoitiin erilaisille asiakkaille. Kulmat suunnattu asiakkaan jonossa eikä litteä pöydällä.', 'Kriittisesti kauppa loi varajälkiä lukituista ANQR-asetuslinkeistä. Kun vinkit koodi lopulta sai kahvin lävistettyä, henkilökunta korvasi sen muutamassa minuutissa tallennetun kokoonpanon avulla - ei kuvakaappauksia, ei arvailua asetuksista, ei laadun heikkenemistä.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Kaavio, jossa esitetään fyysisen näytön ulkoasu: korkeudet, kulmat, materiaalit sekä maksun ja toissijaisen näytön välinen suhde',
          caption: 'Näyttöjärjestelmän suunnittelu: fyysinen ergonomia optimoitu luotettavan skannauksen kautta asiakkaan korkeuksiin ja valaistusolosuhteisiin',
        },
      ],
    },
    {
      heading: 'Toiminnan parantaminen',
      paragraphs: ['Kuusi viikkoa käyttöönoton jälkeen kauppa dokumentoi merkittäviä parannuksia: nolla asiakas valituksia "vääri koodi" sekaannusta, nopeampi tapahtuma-ajat, ja 3x lisäys vihjeilmoituksia (asiakkaat voisivat nyt löytää ja skannata vihjekoodia ilman kiusallisesti kysymällä henkilökuntaa). Googlen arvostelut lisääntyivät myös, kun omistettu, hyvin merkitty QR poisti kitkaa.', 'Henkilöstökoulutus yksinkertaistui: Maksukoodi on iso, kaikki muu on paneelissa. Kun maksusovellukset päivitettiin ja yksi osoitti lyhyesti hitaampaa skannausta, konservatiivinen maksukoodin suunnittelu tarkoitti, että se toimi edelleen - vain hieman hitaammin kuin epäonnistui kokonaan.', 'Katso Opi oppaasta vähittäismaksujen QR-koodit tämän näyttöjärjestelmän suunnittelun taustalla olevia periaatteita varten.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Mittareiden kojelauta, joka näyttää ennen tai jälkeen vertailut: sekaannukset, tapahtuma-aika, vinkkitiheys, uudelleentarkastelua koskevat huomautukset',
          caption: 'Kuuden viikon operatiiviset tiedot, jotka osoittavat harkitun moniQR-näyttöjärjestelmän liiketoiminnan vaikutuksen',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Selaa Opi artikkeleita',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Tapaustutkimus: Business Card Billboard',
      paragraphs: ['Tämä esimerkki seuraa tapahtumatuotantoyhtiö valmistautuu suuri konferenssi. He tarvitsivat saman QR-koodin - joka linkitettiin tapahtumasovellukseen - joka oli otettu käyttöön radikaalisti eri muodoissa: osallistujakortin lisäosat (3cm), pöytätelttakortit (8cm), ilmoittautumispöytäkyltit (30cm), ajojulisteet (60cm) ja massiivinen näyttämön taustamainos (4 m). Kaikissa muodoissa oli erilaisia katseluetäisyyksiä, valaistusolosuhteita ja tuotannon työnkulkuja.', 'Haaste ei ollut vain tekninen - se oli toiminnassa. Useat myyjät käsittelivät erilaisia tulostustöitä, ja yrityksen tarvitsi varmistaa johdonmukaisia, skannattavia tuloksia riippumatta siitä, kuka tuotti mitä. Ratkaisussa keskityttiin SVG:n vientiin ja tiukkaan luovutusdokumentaatioon.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kollaasi, jossa on sama QR-koodi, joka on käytössä viidessä eri koossa.',
          caption: 'Yksi QR-koodi, viisi käyttöönottokokoa: skannattavuuden säilyttäminen sentistä metriin',
        },
      ],
    },
    {
      heading: 'Miksi edellisillä tapahtumilla oli ongelmia',
      paragraphs: ['Viime konferenssissa yhtiö oli kokenut noloja epäonnistumisia. Näyttämömerkki QR syntyi pienenä PNG:nä ja skaalattiin suunnitteluohjelmistoon - tulos näytti hyväksyttävältä etäältä, mutta ei pystynyt skannaamaan luotettavasti yleisöltä. Virkamerkki QR:t olivat ylityylisiä ja liian pieniä, turhauttavia osallistujia, jotka yrittivät lisätä yhteystietoja. Epäjohdonmukaiset asetukset eri muodoissa merkitsivät, että "sama" QR näytti itse asiassa erilaiselta jokaisella palalla.', 'Tapahtuman jälkeinen analyysi paljasti perimmäisen syyn: ei yhtäkään totuuden lähdettä. Jokainen suunnittelija oli luonut QR:n uudelleen hieman eri asetuksilla, ja jokainen tulostustoimittaja oli käsitellyt tiedostoja eri tavalla. Laatu heikkeni tiedostojen luovutusten puhelinpelin kautta.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Lähikuvat skannausvirheistä: pikselimuotoiset bannerimoduulit, alakokoiset merkkikoodit, epäjohdonmukainen muotoilu eri muodoissa',
          caption: 'Rikostekninen analyysi aiemmista epäonnistumisista: kussakin muodossa oli ilmennyt erilaisia laatuongelmia',
        },
      ],
    },
    {
      heading: 'SVG-ensimmäinen työnkulku',
      paragraphs: ['Tätä tapahtumaa varten yritys loi tiukan protokollan: yksi master-QR luotiin ANQR:ssä optimaalisilla asetuksilla (virheenkorjaus H, runsas hiljainen vyöhyke, puhdas tyyli), vietiin SVG-muodossa ja tallennetaan yhtenä virallisena lähteenä. ANQR-määrityslinkki dokumentoitiin SVG-tiedoston rinnalle, jotta koodi voidaan tarvittaessa luoda uudelleen.', 'Jokainen suunnittelija ja myyjä sai saman SVG master kanssa selkeät ohjeet: paikka vaaditussa koossa, älä muuta, säilyttää hiljainen alueselvitys. Rasteriformaatteja tarvitseville myyjille yritys toimitti ennalta muokattuja PNG-kooltaan erityisiä PNG-kooltaan selkeitä nimeämiskäytäntöjä, jotka osoittavat käyttötarkoituksen.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Tiedostopaketti, jossa näkyy SVG-master, kokokohtaiset PNG:t, eritelmäasiakirja ja asetuslinkki',
          caption: 'Luovutuspaketti: kaikki myyjät tarvitaan tuottaa johdonmukaisia tuloksia arvaamatta',
        },
      ],
    },
    {
      heading: 'Kokoon liittyvät näkökohdat',
      paragraphs: ['Jokainen muoto vaati erityistä huomiota. Virkamerkin lisäosat 3cm tarvitaan QR miehittää suurin käytettävissä oleva tila - skannaus etäisyys olisi käsivarren pituus. 8cm:n pöytätelttoihin voisi kuulua koristeellinen kehystys rauhallisen vyöhykkeen ulkopuolella. 4-metrinen banneri vaati laskentaa: tyypilliseltä yleisöetäisyydeltä (15-20 metriä), moduulit oli voitava erottaa selkeästi puhelinkameroilla, minkä vuoksi QR:n oli oltava vähintään 80cm bannerin suunnittelussa.', 'Yritys loi kokoamisoppaan, joka dokumentoi QR-mitat kullekin odotetulle skannausmatkalle. Tästä tuli tulevien tapahtumien uudelleenkäytettävä voimavara, joka poisti arvaustyön suunnitteluprosessista.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Kaavio, josta käy ilmi skannausmatkan, QR:n vähimmäiskoon ja moduulin mittojen välinen suhde kunkin tapahtumamuodon osalta',
          caption: 'Kokomatriisi: lasketut mitat, jotka takaavat luotettavan skannauksen kunkin muodon odotetulla katselumatkalla',
        },
      ],
    },
    {
      heading: 'Tuotantotulokset',
      paragraphs: ['Konferenssipäivän validointi oli systemaattista: henkilökunta testasi jokaisen käytössä olevan QR:n ennen ovien avaamista. Virkamerkki skannattiin heti käsivarren pituudelta. Pöytäteltat toimivat luotettavasti huoneiden muuttuvassa valaistuksessa. Edellisen tapahtuman nolouslava skannattiin onnistuneesti yleisöalueen keskeltä.', 'Nolla skannausvalitusta kirjattiin yli 2000 osallistujalle. Operatiivinen voitto oli yhtä merkittävä: kun viime hetken sponsorilisäys vaati uutta opastusta, tuotantotiimi tuotti sen SVG-maisterilta minuuteissa, varmisti sen vastaavan kaikkea muuta.', 'Ks. SVG:n ja PNG:n päätöskehyksen ja parhaiden käytäntöjen julkaisuohjeet.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Tapahtumakuvaus, jossa osallistujat ovat onnistuneesti skannanneet QR-koodeja eri kokoja ja etäisyyksiä koko tapahtumapaikan',
          caption: 'Konferenssipäivän menestys: luotettava skannaus kaikissa muodoissa, lätkä lähikuvat vaiheessa banner etäisyys laukausta',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Selaa Opi artikkeleita',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Tapaustutkimus: Airport Lounge Digital Display',
      paragraphs: ['Tämä esimerkki seuraa lentoyhtiön lounge, joka oli käyttänyt staattisia QR-koodeja digitaalisilla tervetuliaisnäytöillään. Näytöillä on pyörivää mainossisältöä, mutta lounge-kirjautumisen QR-koodi istui nurkassa, staattinen ja helposti unohdettu. Analytiikka osoitti vain 15% vaatimukset täyttävistä vieraista käyttivät QR-selvitystä, vaikka se oli nopeampi kuin pöytäjono. Useimmat vieraat eivät huomanneet sitä.', 'Hypoteesi oli yksinkertainen: visuaalisesti kiireisessä ympäristössä, jossa on liikkuvaa sisältöä, staattinen QR tulee näkymätön. Ratkaisu, jota tarvitaan QR:n merkitsemiseen vaarantamatta sisäänkirjautumisen edellyttämää luotettavuutta, kun vika tarkoittaisi turhautuneita matkustajia ja pidempiä pöytäjonoja.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Digitaalinen näyttö lentoaseman lounge osoittaa mainossisältöä pieni, staattinen QR-koodi kulmassa',
          caption: 'Alkuperäinen järjestely: staattinen QR hävisi dynaamisen myynninedistämissisällön meressä, jolloin vain 15 prosenttia hyväksyttiin',
        },
      ],
    },
    {
      heading: 'Turvallisen animoinnin suunnittelu',
      paragraphs: ['Loungen digitaalisessa kyltissä käytettiin suuria LED-paneeleja - haastava ympäristö, jossa aggressiivinen animaatio voi aiheuttaa skannausongelmia. Suunnittelutiimi aloitti konservatiivisesti: hellävarainen pulssiefekti, joka hienovaraisesti laajensi ja sai QR:n visuaalisen läsnäolon muuttamatta koodirakennetta. Runko ajoitus oli hidas (250ms) välttää välkkymisen ongelmia LED-virkistysnopeus.', 'Turvatilan validointi vahvisti jokaisen kehyksen olevan skannattavissa. Lisätestaus todellisilla LED-paneeleilla osoitti, että pulssin piti olla vielä hienovaraisempi kuin työpöydän esikatselut ehdottivat - LED-valo ja katselukulmat vaikuttivat havaittuun kontrastiin odotettua enemmän.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR-animaatiopaneeli, jossa näkyy pulssin konfiguraatio: hidas ajoitus, hienovarainen intensiteetti, turvallisuustila käytössä',
          caption: 'Animaatioasetukset: LED-paneelin näyttöön viritetyt parametrit säilyttäen skannauksen luotettavuuden jokaisessa kehyksessä',
        },
      ],
    },
    {
      heading: 'Integrointi merkkisisältöön',
      paragraphs: ['Animoitu QR oli sijoitettu oma "stabiili vyöhyke" näytön ulkoasu - alue, joka pysyi vakio samalla mainossisältö pyörii päänäytön alueella. Eriyttäminen oli ratkaisevan tärkeää: QR tarvitsi visuaalista vakautta skannaukseen, vaikka se herättikin huomiota hienovaraisen animaationsa kautta.', 'QR:n viereen lisättiin selkeä kehotus toimia: Ohita jono - skannaa tarkistaaksesi. Teksti pysyi staattisena, kun QR pulssi, luoda visuaalinen hierarkia, joka veti silmän skannaus mahdollisuus ilman ylivoimainen edistäminen sisältöä.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Näytön ulkoasukaavio, josta näkyy animoitu QR vakaalla alueella, kun taas mainossisältö pyörii pääalueella',
          caption: 'Näytön kiinteistöjen jako: animoidulla QR:llä on vakaa alue, joka on erillään pyörivästä mainossisällöstä',
        },
      ],
    },
    {
      heading: 'Tekninen käyttöönotto',
      paragraphs: ['Animoitu QR vietiin GIF optimoiduin asetuksin merkki CMS:ää varten. Tiedostokoon huomioinnilla oli merkitystä - loungen sisällönhallintajärjestelmässä oli latausrajat, ja liian suuret tiedostot aiheuttivat toiston änkyttämistä. Lopullinen vienti tasapainotti visuaalisen laadun tiedoston kokoon nähden rajoittamalla väripalettia ja optimoimalla kehysten määrää.', 'Käyttöönotto sisälsi varajärjestelmän: jos GIF ei jostain syystä pelaa, merkkijärjestelmä näyttää staattisen PNG varmuuskopion. Tämä irtisanominen varmisti, ettei lähtöselvityskapasiteettia koskaan menetetty animaatioon liittyvien teknisten ongelmien vuoksi.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'CMS-liitäntä, joka näyttää animoidun QR-latauksen ja staattisen varakuvan',
          caption: 'Merkinnän CMS-konfiguraatio: animoitu ensisijainen staattisella varalla varmistaen, ettei lähtöselvitystä koskaan keskeytetä',
        },
      ],
    },
    {
      heading: 'Mitattu vaikutus',
      paragraphs: ['Yhden kuukauden toiminnan jälkeen QR:n sisäänkirjautuminen kasvoi 15 prosentista 24 prosenttiin - suhteellinen parannus oli 60 prosenttia. Vieraiden palautekyselyt osoittivat, että animoitu QR oli "helpompi huomata" ja "nykyaikaisempi." Työvuorojen jonotusajat lyhenivät mitattavasti ruuhka-aikoina, kun QR:n kautta tarjoiltiin enemmän vieraita.', 'Tärkeää on, että tuhansista päivittäisistä skannauksista huolimatta skannaus epäonnistui. Konservatiivinen animaatio oli saavuttanut huomiota tavoite uhraamatta luotettavuutta lähtöselvitys virtaus vaati. Lounge levitti myöhemmin samanlaisia animoituja QRs kuin muissa paikoissa.', 'Katso animoitujen QR-koodien oppaasta digitaalisen merkin tekniset periaatteet turvallisen animaatiosuunnittelun takana.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Kojelauta, josta käy ilmi adoptionopeuden nousu, jonotusajan lyhentäminen ja nollavirheen skannauksen luotettavuus käyttöönottojakson aikana',
          caption: 'Kuukauden tiedot: adoption lisäys 60%, jonotusaikojen lyhentäminen ja täydellinen skannausvarmuus säilyivät',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Selaa Opi artikkeleita',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Tapaustutkimus: Maailmanlaajuinen tuotelanseeraus QR-kampanja',
      paragraphs: ['Tämä esimerkki seuraa kuluttajaelektroniikka-alan yritystä, joka käynnistää samanaikaisesti uuden tuotteen 12:lla eri kielellä. Kunkin alueellisen markkinointiryhmän on tuotettava pakkaus-, vähittäismyyntinäytöt- ja mainosmateriaalia, jossa on paikallisia tuotesivuja yhdistävät QR-koodit. Aiemmin lanseeraukset olivat johtaneet epäjohdonmukaiseen QR-tyyliin, satunnaisiin skannausvirheisiin ja "puhelinpeliin" konfiguraation liukuessa, kun jokainen tiimi loi uudelleen koodeja kuvakaappauksista.', 'Ratkaisu käytti ANQR:n jaettavissa olevia konfiguraatiolinkkejä luodakseen yhden totuuden lähteen, johon jokainen alueellinen tiimi voi käyttää käyttöliittymäkielestään riippumatta. QR hyötykuorma käytti älykästä uudelleenohjausta, joka havaitsi käyttäjäkielen, joten yksi koodi toimi maailmanlaajuisesti ja toimitti paikallisia kokemuksia.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Maailman kartta, jossa on 12 markkinapaikkaa QR-koodeilla, jotkut visuaalisesti ristiriidassa keskenään',
          caption: 'Haaste: 12 markkina-aluetta, 8 kieltä ja epäjohdonmukaisen QR-toteutuksen historia eri alueilla',
        },
      ],
    },
    {
      heading: 'Pääasetusten laatiminen',
      paragraphs: ['Maailmanlaajuinen bränditiimi loi arvovaltaisen QR-konfiguraation ANQR:ssa: tuotelinjan visuaalista identiteettiä vastaavat brändivärit, virhekorjaus H:n luotettavuuden varmistamiseksi kaikissa tulostus- ja digitaalisovelluksissa sekä muotoilun, joka toistuisi johdonmukaisesti paikallisista tuotantomenetelmistä riippumatta. Konfigurointi lukittiin ja osakelinkki dokumentoitiin globaalin kampanjan lyhyesti.', 'Kriittisesti koodattu URL käytti kielitunnistusta. Kun skannattiin, käyttäjät ohjattiin automaattisesti paikalliselle kielituotesivulle. Tämä tarkoitti sitä, että kaikki 12 markkinaa voisivat käyttää samanlaisia QR-koodeja - ei markkinoiden hyötykuorman vaihteluja, jotka voisivat aiheuttaa virheitä.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR-liitäntä, joka näyttää pääkonfiguraation brändiväreillä, ECC H:lla ja älykkäällä URL:llä',
          caption: 'Pääkonfiguraatio: maailmanlaajuiset brändistandardit koodattu yhdeksi, jaettavaksi totuuden lähteeksi',
        },
      ],
    },
    {
      heading: 'Alueellinen ryhmä Workflow',
      paragraphs: ['Jokainen alueellinen markkinointitiimi sai konfigurointilinkin yksinkertaisiin ohjeisiin: avaa linkki, varmista esikatselu vastaa tuotemerkin ohjeita, vie tarvittavassa muodossa hakemuksesi. ANQR-liitäntä näkyy kunkin joukkueen haluamalla kielellä, mutta taustalla olevat QR-asetukset pysyivät identtisinä riippumatta käyttöliittymän kielestä.', 'Kun japanilainen tiimi tarvitsi SVG:tä huippuluokan vähittäismyyntinäytöille ja brasilialainen tiimi tarvitsi PNG:tä sosiaaliseen mediaan, molemmat vietiin samasta kokoonpanosta. Kun saksalaisen tiimin tulostustoimittaja pyysi tiettyjä väriarvoja, he voisivat viitata konfiguraatioon suoraan eikä arvata kuvakaappauksesta.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Kuvakaappaukset, joissa sama konfiguraatiolinkki on avattu japaniksi, portugaliksi ja saksaksi',
          caption: 'Sama konfiguraatio, eri rajapinnat: alueelliset tiimit toimivat haluamallaan kielellä säilyttäen samalla globaalin johdonmukaisuuden',
        },
      ],
    },
    {
      heading: 'Alueellisten muutosten käsittely',
      paragraphs: ['Jotkin markkinat vaativat vähäisiä mukautuksia. Kiinalainen tiimi tarvitsi version WeChat-optimoitu kehys sosiaalisen jakamisen. Sen sijaan, että he muokkaisivat päällikköä, he loivat dokumentoidun variantin, jolla on oma konfiguraatiolinkki, joka on selvästi merkitty kampanjan omaisuuskirjastoon \'CN-WeChat-variantti\'. Tämä säilytti jäljitettävyyden ja mahdollisti tarvittavan lokalisoinnin.', 'Bränditiimi laati yksinkertaisen säännön: kaikki master-vaihtoehdot vaativat uuden, dokumentoidun konfiguraatiolinkin. Ei muutoksia vietyihin tiedostoihin, ei "pikakorjauksia" suunnitteluohjelmistossa. Tämä esti konfiguraation ajelehtimisen, joka oli häirinnyt aiempia laukaisuja.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Hyödykekirjaston käyttöliittymä, josta käyvät ilmi pääkokoonpano ja hyväksytyt alueelliset vaihtoehdot, joilla kullakin on oma linkki',
          caption: 'Kampanjan omaisuuden hallinta: pääkonfiguraatio ja dokumentoidut vaihtoehdot, kaikki jäljitettävät konfiguraatiolinkkien kautta',
        },
      ],
    },
    {
      heading: 'Käynnistä tulokset',
      paragraphs: ['Tuotteen lanseerauspäivä näki QR-koodeja, joita käytettiin samanaikaisesti kaikilla 12 markkinoilla. Laatuauditoinnit vahvistivat visuaalista johdonmukaisuutta eri alueilla - Tokion vähittäismyyntinäytön QR vastasi São Paulon pakkausten QR:ää ja Berliinin tapahtumamainoksia.', 'Kaikkialla markkinoilla ei raportoitu yhtään skannausvirhettä. Kun tuotesivun URL-osoitteen muutos oli tarpeen, uudelleenohjauspalvelu käsitteli sitä näkymättömästi - uusintapainosta ei tarvita. Maailmanlaajuinen työryhmä arvioi, että konfigurointilinkkiin perustuva lähestymistapa säästi 40 tuntia koordinointiaikaa verrattuna aiempaan laukaisumenetelmään.', 'Katso oppaasta monikielinen QR-yhteistyö globaalin kampanjan johdonmukaisuuden taustalla olevien työnkulkuperiaatteiden parissa.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Valokuvien ruudukko, joka osoittaa QR:n jatkuvan käyttöönoton eri markkinoilla: Tokio vähittäiskauppa, São Paulo pakkaus, Berliinin tapahtumat',
          caption: 'Saavutettu maailmanlaajuinen johdonmukaisuus: sama QR-esittely 12 markkinoilla eri kielistä, myyjistä ja formaateista huolimatta',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Avaa generaattori',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Selaa Opi artikkeleita',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Selaa Opi artikkeleita', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Avaa koko käyttöopas', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Avaa galleria', type: 'gallery' },
  ],
};
