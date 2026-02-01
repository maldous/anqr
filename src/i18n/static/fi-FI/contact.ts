import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Ota yhteyttä',
  description: 'Olemme tyytyväisiä palautteisiin, vikaraportteihin, ominaisuuspyyntöihin ja yleisiin tiedusteluihin.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Miten tavoittaa meidät?',
      paragraphs: ['Tarjoamme useita tapoja ottaa meihin yhteyttä tarpeistasi riippuen. Luemme jokaisen viestin, vaikka vastausajat voivat vaihdella määrän ja tiedustelun tyypin mukaan.'],
    },
    {
      heading: 'Sähköposti',
      paragraphs: ['Kaikki tutkimukset: ', 'Tämä on luotettavin tapa tavoittaa meidät ja sitä suositellaan yksityiskohtaisiin kysymyksiin, yritystiedusteluihin tai muihin tiedusteluihin.'],
    },
    {
      heading: 'Kyselytyypit',
      bullets: ['Yleiset kysymykset: Kysymyksiä siitä, miten käyttää ANQR, ominaisuus selityksiä tai yleistä palautetta.', 'Vikaraportit: Ota mukaan selaimesi, käyttöjärjestelmäsi, kopioinnin vaiheet ja mahdolliset virheviestit.', 'Ominaisuuspyynnöt: Ehdotuksia uusia ominaisuuksia tai parannuksia. Otamme huomioon kaikki pyynnöt, vaikka emme voi luvata täytäntöönpanoa.', 'Yrityskyselyt: Kumppanuusmahdollisuudet, lisenssikysymykset tai kaupallinen käyttö.', 'Yksityisyyspyynnöt: Pyyntö käyttää tietosuoja-asetuksen, keskusvastapuolen tai muiden tietosuojalakien mukaisia oikeuksia (ks. tietosuojakäytäntö).', 'DMCA/Tekijänoikeus: Ks. jäljempänä oleva DMCA:n kohta alasvetoa koskevien vaatimusten osalta.'],
    },
    {
      heading: 'Vasteajat',
      paragraphs: ['Pyrimme vastaamaan tiedusteluihin 5-7 arkipäivän kuluessa. Yksityisyyteen liittyvät pyynnöt käsitellään 30 päivän kuluessa lain edellyttämällä tavalla.', 'Kiireisinä aikoina vastausajat voivat olla pidempiä. Kiireellisissä asioissa on mainittava aihealueessanne "KIIRE" .'],
    },
    {
      heading: 'Ennen kuin otat meihin yhteyttä',
      paragraphs: ['Tutustu Dokumentaatio-sivuumme saadaksesi vastauksia yleisiin kysymyksiin ANQR-ominaisuuksien käytöstä. Siellä käsitellään monia kysymyksiä QR-koodin luomisesta, muotoilusta ja vientivaihtoehdoista.'],
    },
    {
      heading: 'DMCA Tekijänoikeusilmoitukset',
      paragraphs: ['Jos uskot, että ANQR:ssä saatavilla oleva sisältö rikkoo tekijänoikeuksiasi, voit lähettää Digital Millennium Copyright Act (DMCA) -lain. Jotta ilmoitus olisi voimassa, siihen on sisällyttävä:'],
      bullets: ['Tekijänoikeuden haltijan tai valtuutetun edustajan fyysinen tai sähköinen allekirjoitus.', 'Tekijänoikeudellista teosta, jota väitetään loukatuksi.', 'Sen aineiston tunnistaminen, jota väitetään loukkaavan, sekä tiedot, jotka riittävät sen paikantamiseen.', 'Yhteystiedot (osoite, puhelinnumero ja sähköpostiosoite).', 'Lausunto, että sinulla on hyvä usko siihen, että materiaalin käyttö ei ole tekijänoikeuden haltijan lupaa.', 'Lausunto, jonka mukaan ilmoituksenne tiedot ovat paikkansapitäviä ja olette tekijänoikeuden omistaja tai valtuutettu toimimaan heidän puolestaan.'],
    },
    {
      heading: 'DMCA-yhteystiedot',
      paragraphs: ['Lähetä DMCA-ilmoitukset osoitteeseen: ', 'Lisää "DMCA Notice" otsikoon. Vastaamme voimassa oleviin ilmoituksiin sovellettavan lain mukaisesti. Huomaa, että ANQR tuottaa käyttäjän laitteisiin QR-koodeja paikallisesti eikä isännöi käyttäjän luomaa sisältöä.'],
    },
    {
      heading: 'Reddit-yhteisö',
      paragraphs: ['Liity Reddit-yhteisöömme osoitteessa r/ANQR jakaaksesi QR-luomuksesi, kysyäksesi kysymyksiä, saadaksesi apua ja ollaksesi yhteydessä muihin ANQR-käyttäjiin.'],
    },
  ],
};

export default contact;
