import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const privacy: PageDefinition = {
  title: 'Yksityisyyden suoja',
  description: 'Tietoja ANQR kerää, miten sitä käytetään, ja oikeuksia sovellettavien tietosuojalakien mukaisesti.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Käyttöehdot', type: 'external' }],
  sections: [
    {
      heading: 'Yhteenveto',
      paragraphs: ['ANQR on QR-koodigeneraattori, jolla on asiakkaan ensimmäinen lähestymistapa. Emme vaadi sinua luomaan tiliä. Oletuksena QR-koodit luodaan paikallisesti selaimessasi - meillä ei ole pääsyä salaamaasi sisältöön.', 'Ammattikäyttöön, ANQR tarjoaa palvelimen puolella API, joka tuottaa QR-koodit URL-parametrit. Kun käytät API:tä, QR-sisältöäsi käsitellään palvelimillamme kuvan muokkaamiseksi, mutta sitä ei tallenneta tai kirjata.', 'Käytämme Google AdSense -sovellusta mainontaan ja voimme käyttää analytiikkapalveluita. Nämä palvelut keräävät tietoa evästeiden ja vastaavien teknologioiden avulla. Tämä politiikka selittää, mitä tietoja kerätään, miten sitä käytetään, ja oikeutesi.'],
    },
    {
      heading: 'Keräämme tietoja',
      bullets: ['Tiedot, jotka annat: Jos otat meihin yhteyttä sähköpostitse tai yhteydenottolomakkeellamme, keräämme nimesi, sähköpostiosoitteesi ja viestisi sisällön.', 'Automaattisesti kerätyt tiedot: Meidän hosting palveluntarjoaja (Netlify), mainoskumppanit, ja analytiikka palvelut voivat kerätä: IP-osoite, selaimen tyyppi ja versio, käyttöjärjestelmä, laitetyyppi, viittaavat URL, sivut vieraili, aika paikan päällä, ja likimääräinen maantieteellinen sijainti.', 'Kolmannen osapuolen evästeet: Mainoskumppanimme (Google AdSense) käyttävät evästeitä ja vastaavia tekniikoita mainosten palvelemiseen ja mittaamiseen. ANQR itse ei aseta mitään ensimmäisen osapuolen evästeitä.'],
    },
    {
      heading: 'Evästeet ja kolmannen osapuolen teknologiat',
      paragraphs: ['ANQR ei aseta mitään ensimmäisen osapuolen evästeitä. Asemasi (kuten pimeä tila) tallennetaan paikallisesti laitteeseesi, jota ei välitetä palvelimelle.', 'Mainoskumppanimme (Google AdSense) ja hosting-palveluntarjoajamme voivat kuitenkin käyttää evästeitä ja vastaavia seurantatekniikoita:'],
      bullets: ['Mainosevästeet (kolmas osapuoli): Google AdSensen ja mainoskumppaneiden asettamana palvelemaan mainoksia, mittaamaan mainosten suorituskykyä ja ymmärtämään käyttäjien etuja. Nämä evästeet voivat seurata toimintaasi eri verkkosivustoilla.', 'Analytiikan evästeet (kolmannen osapuolen evästeet): Voi käyttää meidän hosting palveluntarjoaja tai analytics palvelut kerätä anonymised käyttötiedot.'],
    },
    {
      heading: 'Google AdSense ja mainonta',
      paragraphs: ['Näytämme mainoksia Google AdSensen kautta. Google ja sen kumppanit käyttävät evästeitä tarjotakseen mainoksia, jotka perustuvat sivuston ja muiden verkkosivustojen selaushistoriaan (interest-based mainokset).', 'Opi, miten Google käyttää tietojasi: https://policies.google.com/technology/partners-sites', 'Ad personointi: https://adssettings.google.com', 'Opt out via Network Advertising Initiative: https://optout.networkmainonta.org', 'https://optout.aboutads.info'],
    },
    {
      heading: 'Tietojen käyttö',
      bullets: ['Vastataksesi tiedusteluihisi ja antaaksesi tukea.', 'Mainosten näyttäminen mainoskumppaneidemme kautta.', 'Analysoida sivuston käyttöä ja parantaa palveluitamme.', 'Petosten, väärinkäytösten ja turvallisuuskysymysten havaitseminen, ehkäiseminen ja niihin puuttuminen.', 'Oikeudellisten velvoitteiden noudattaminen.'],
    },
    {
      heading: 'Kolmansien osapuolten palvelut',
      bullets: ['Google AdSense: vastaanottaa tietoja palvella ja mitata mainoksia.', 'Analytiikan tarjoajat: Saada anonyymit käyttötiedot.', 'Netlify (isäntä): Käsittelee pyyntöjä ja voi kirjautua IP-osoitteita.', 'Emme myy henkilökohtaisia tietojasi. Tietojen jakamista mainoskumppaneiden kanssa voidaan kuitenkin pitää "myyntinä" keskusvastapuolessa (ks. jäljempänä).'],
    },
    {
      heading: 'Tietojen säilyttäminen',
      bullets: ['Yhteystiedot: Enintään 2 vuotta.', 'Palvelimen lokit: Enintään 30 päivää (vastaanotin).', 'Analytiikkatiedot: Enintään 26 kuukautta (nimettömänä).', 'Mainosevästeet: Tyypillisesti 13 kuukautta (kumppanin variaatioita).'],
    },
    {
      heading: 'GDPR:n mukaiset oikeudet (ETA:n käyttäjät)',
      paragraphs: ['Jos olet Euroopan talousalueella, sinulla on seuraavat tietosuoja-asetuksen mukaiset oikeudet:'],
      bullets: ['Pääsyoikeus: Pyydä kopio sinusta hallussamme olevista henkilötiedoista.', 'Oikeus oikaisuun: Pyydä virheellisten tietojen korjaamista.', 'Oikeus poistaa: Pyydä tietojen poistamista ("oikeus tulla unohdetuksi").', 'Oikeus rajoittaa käsittelyä: Pyydämme rajoja miten käytämme tietojasi.', 'Oikeus tietojen siirtämiseen: Pyydä tietojasi kannettavassa muodossa.', 'Oikeus vastustaa: Käsittelyn kohde, myös suoramarkkinointi.', 'Oikeus peruuttaa suostumus: Peru suostumus milloin tahansa, kun käsittely perustuu suostumukseen.', 'Oikeus tehdä valitus: Tee valitus tietosuojaviranomaisellesi.'],
    },
    {
      heading: 'GDPR:n oikeusperusta',
      paragraphs: ['Käsittelemme tietoja näistä lähtökohdista: (a) Suostumus - yksilölliseen mainontaan (joita hallinnoivat mainoskumppanimme); (b) Lailliset edut - analytiikan, turvallisuuden ja parantamisen kannalta; (c) Sopimus - vastaus tiedusteluihin.', 'Voit käyttää oikeuksiasi ottamalla yhteyttä . Vastaamme 30 päivän sisällä.'],
    },
    {
      heading: 'CPA:n (Kalifornian käyttäjät) oikeudet',
      bullets: ['Oikeus tietää: Pyydä tietoja kerätyistä tiedoista, lähteistä, tarkoituksista ja kolmansilta osapuolilta.', 'Poistamisoikeus: Pyydämme poistamaan henkilötietosi.', 'Opt-out-mahdollisuus: Opt ulos "myydä" henkilökohtaisia tietoja (jakaminen mainoskumppaneiden kanssa voidaan hyväksyä).', 'Oikeus syrjimättömyyteen: Emme syrji oikeuksianne.'],
    },
    {
      heading: 'Kerätyt keskusvastapuoliluokat',
      paragraphs: ['Kategoriat: Tunnisteet (IP-osoite, laitetunnus), Internet-toiminta (selaaminen, mainosvuorovaikutus), Geolocation (noin), Päätelmät (selaamisen edut).', 'Voit käyttää oikeuksia tai jättää pois:  tai säätää evästeasetuksia.'],
    },
    {
      heading: 'Kansainväliset siirrot',
      paragraphs: ['Tietosi voidaan siirtää maihin, joissa on erilaiset tietosuojalait, myös Yhdysvaltoihin. Käytämme asianmukaisia suojatoimia, kuten vakiosopimuslausekkeita.'],
    },
    {
      heading: 'Lasten yksityisyys',
      paragraphs: ['ANQR ei ole tarkoitettu alle 13-vuotiaille lapsille (tai 16-vuotiaille ETA:ssa). Emme tietoisesti kerää tietoja lapsista. Ota yhteyttä  jos uskot, että lapsi on antanut tietoja.'],
    },
    {
      heading: 'Turvallisuus',
      paragraphs: ['Käytämme asianmukaisia teknisiä ja organisatorisia toimenpiteitä tietojen, mukaan lukien HTTPS-salaus. Internet-lähetykset eivät kuitenkaan ole 100% turvallisia.'],
    },
    {
      heading: 'Älä seuraa',
      paragraphs: ['Kunnioitamme Do Not Track -selaimen signaaleja mahdollisuuksien mukaan, vaikka mainoskumppanit eivät ehkä vastaa DNT:hen.'],
    },
    {
      heading: 'Muutokset tähän politiikkaan',
      paragraphs: ['Voimme päivittää tätä käytäntöä säännöllisesti. "Viimeinen päivitys" tarkoittaa viimeisintä tarkistusta. Merkittävät muutokset voidaan ilmoittaa sivuston banneri.'],
    },
    {
      heading: 'Ota yhteyttä',
      paragraphs: ['Yksityisyyskysymyksiä tai käyttää oikeuksia:  tai käytä yhteystietosivuamme. Vastaamme yksityisyyttä koskeviin pyyntöihin 30 päivän kuluessa.'],
    },
    {
      heading: 'Täydellinen tietosuojakäytäntö',
      paragraphs: ['Tällä sivulla on yhteenveto tietosuojakäytännöistämme. Täydellisen, laillisesti sitovan tietosuojakäytännön, joka sisältää täydelliset tiedot tietojenkäsittelystä, oikeuksistasi ja GDPR-, CCPA- ja muiden tietosuojalakien mukaisista velvoitteistamme, katso iubendan isännöimä täydellinen käytäntömme.'],
      links: [{ href: 'https://www.iubenda.com/privacy-policy/70266922', label: 'Katso koko iubendan tietosuojakäytäntö', type: 'external' }],
    },
  ],
};

export default privacy;
