import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Tietoja ANQR:stä',
  description: 'ANQR on ilmainen QR-koodigeneraattori asiakkaan ensimmäinen lähestymistapa - luoda QR-koodit paikallisesti tai käyttää API upottamalla.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Avaa generaattori', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Selaa Opi artikkeleita', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Yksityisyyden suoja', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Käyttöehdot', type: 'external' },
  ],
  sections: [
    {
      heading: 'Mitä ANQR on?',
      paragraphs: ['ANQR (ilmoitettu "ankkuri") on ilmainen QR koodigeneraattori, joka luo skannattavia koodeja URL, teksti, Wi-Fi-tunnukset, yhteystiedot, kalenteri tapahtumia, ja enemmän.', 'Se on rakennettu yksityishenkilöille, pienyrityksille, markkinoijille ja kehittäjille, jotka haluavat tehokkaita QR-työkaluja ilman rekisteröitymistä. Asiakas-ensimmäinen suunnittelu tarkoittaa QR-koodit luodaan paikallisesti selaimessa oletuksena, valinnainen palvelin API ammatillinen upottaminen ja integrointi.'],
    },
    {
      heading: 'Tärkeimmät ominaisuudet',
      bullets: ['Luo QR-koodit heti selaimessasi - tiliä ei tarvita.', 'Muokkaa värejä, moduuli tyylejä, etsijä kuvioita, ja lisää kuvan päällystykset.', 'Vie monissa muodoissa: PNG, SVG, WebP ja animoitu GIF.', 'Advanced ohjaimet virhekorjaustaso, QR-versio, koodaustila ja maskivalinta.', 'Skannaus-turvallisuusohjeistus ja live esikatselu auttaa pitämään koodit luettavissa tulostaa ja näytöillä.', 'Palvelin-puoli API ammatillinen upotus täydellä parametrin tuella.', 'Toimii offline kerran ladattu - se on staattinen web-sovellus voit ajaa missä tahansa.'],
    },
    {
      heading: 'Miten ANQR vaikuttaa',
      paragraphs: ['ANQR toimii selaimessasi ja koodaa syötteesi standardiin QR-matriisiin Reed.Solomonivirhekorjaus tekee sen valitsemaasi muotoon.', 'Oletuksena, sukupolvi tapahtuu paikallisesti selaimessa. Ammattikäyttöön, voit myös käyttää palvelimen puolella API luoda QR-koodeja kautta URL-parametreja - täydellinen upottamalla sivustot, sähköpostit, tai automatisoituja työnkulkuja.', 'Kun lisäät overlays- tai animaatioita, ANQR tasapainottaa muotoilun skannaus luotettavuudella, joten tulos pysyy skannattavana.', 'ANQR keskittyy staattisiin koodeihin (tiedot ovat QR:n sisällä). Jos tarvitset dynaamisen koodin (muokattavissa oleva kohde), voit koodata oman uudelleenohjaus URL tai lyhyt linkki.'],
    },
    {
      heading: 'Kuka käyttää ANQR:ää?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Mainonta ja miten pysymme vapaina',
      paragraphs: ['ANQR on vapaa käyttämään ja sitä tukee mainonta. Voimme näyttää mainoksia Google AdSensen ja/tai muiden mainoskumppaneiden kautta.', 'Mainostuottajat voivat käyttää evästeitä tai vastaavia tekniikoita mainosten personointiin omien etujesi ja selaamiseen. Voit hallita mainosasetuksia laiteasetuksissasi ja Googlen mainosasetusten kautta ja oppia lisää tietosuojakäytännöstämme.', 'Emme myy koodaamaasi sisältöä QR-koodeiksi. Mainokset auttavat kattamaan hankkeen toteuttamisen ja parantamisen kustannukset.'],
    },
    {
      heading: 'Avoimet standardit',
      paragraphs: ['ANQR tuottaa QR-koodeja ISO/IEC 18004 -standardin pohjalta ja pyrkii laajaan yhteensopivuuteen skannereiden, kameroiden ja työnkulkujen välillä.'],
    },
    {
      heading: 'Tavaramerkkiilmoitus',
      paragraphs: ['QR Code® on DENSO WAVE INCORPOREDin rekisteröity tavaramerkki. ANQR ei liity, vahvistaa, tai sponsoroi DENSO WAVE INCORPORED.'],
    },
    {
      heading: 'Palaute ja kannanotot',
      paragraphs: ['Olemme tyytyväisiä palautteeseen, vikaraportteihin ja ehdotuksiin. Ota yhteyttä sähköpostitse tai yhteystietosivulla - luemme jokaisen viestin, vaikka vastausajat voivat vaihdella.'],
    },
  ],
};

export default about;
