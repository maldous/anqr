import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Auta kääntämään ANQR',
  description: 'Liity kääntäjäyhteisöömme ja auta tekemään ANQR:stä käyttäjien saatavilla kaikkialla maailmassa. Koodauskokemusta ei vaadita - osallistu suoraan selaimestasi.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Avaa käännösvarasto', type: 'external' },
    { href: '/?lang=${lang}', label: 'Avaa generaattori', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Tietoja ANQR:stä', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Ota yhteyttä', type: 'external' },
  ],
  sections: [
    {
      heading: 'Miksi osallistua?',
      paragraphs: ['Ihmiset ympäri maailmaa käyttävät ANQR:ää QR-koodien luomiseen yrityksille, tapahtumille, maksuille ja henkilökohtaisille projekteille. Osallistumalla käännöksiin autat tekemään tämän tehokkaan työkalun käyttäjien saataville, jotka haluavat äidinkieltään.', 'Jokainen käännöspanos – olipa kyseessä kirjoitusvirheen korjaaminen tai kokonaisen kielen kääntäminen – on todellinen merkitys yhteisösi käyttäjille.'],
    },
    {
      heading: 'Mitä voit kääntää?',
      paragraphs: ['ANQR:ssä on kahden tyyppistä käännettävää sisältöä:'],
      bullets: ['Käyttöliittymän merkkijonot: Painikkeiden otsikot, valikkokohdat, työkaluvihjeet ja käyttöliittymäteksti, joka näkyy kaikkialla sovelluksessa.', 'Staattinen sisältö: Dokumentaatiosivut, jotka sisältävät oppaita, esimerkkejä, tietosuojakäytäntöjä ja ohjeartikkeleita.', 'Molemmat tyypit tallennetaan yksinkertaisina tekstitiedostoina, joita voit muokata suoraan selaimessasi – erityisiä ohjelmistoja ei tarvita.', 'Käännökset tarkistetaan ennen yhdistämistä laadun ja johdonmukaisuuden varmistamiseksi.'],
    },
    {
      heading: 'Kuinka osallistua',
      paragraphs: ['Osallistuminen on helppoa eikä vaadi Git-tietoa:'],
      bullets: ['Vieraile julkisessa käännösvarastossamme GitHubissa.', 'Etsi kielitiedostosi (tai luo uusi, jos kieltäsi ei vielä tueta).', 'Napsauta kynäkuvaketta muokataksesi suoraan selaimessasi.', 'Tee muutokset ja napsauta "Ehdota muutoksia" - GitHub luo automaattisesti vetopyynnön.', 'Lahjoituksesi tarkistetaan ja yhdistetään, yleensä muutaman päivän kuluessa.'],
    },
    {
      heading: 'Käännösohjeet',
      paragraphs: ['Kun käännät, säilytä paikkamerkit, kuten {name}, {count} ja {{variable}}, muuttumattomina - ne korvataan dynaamisilla arvoilla suorituksen aikana. Säilytä myös kaikki HTML:n kaltaiset syntaksit, kuten linkit muodossa [[/path|Label]].', 'Jos olet epävarma käännöksestä, on parempi jättää se englanniksi kuin antaa väärä käännös. Voit myös avata ongelman GitHubissa ja pyytää selvennystä.'],
    },
    {
      heading: 'Tällä hetkellä tuetut kielet',
      paragraphs: ['ANQR tukee tällä hetkellä yli 40 kieltä, mukaan lukien:'],
      bullets: ['Tärkeimmät maailmankielet: englanti, kiina, espanja, arabia, hindi, portugali, japani, korea, ranska, saksa, venäjä ja paljon muuta.', 'Kaakkois-Aasian kielet: thai, vietnami, indonesia, filippiiniläinen, malaiji, khmeri, lao, burma.', 'Etelä-Aasian kielet: hindi, tamili, telugu, bengali, marathi, gudžarati, kannada, malajalam, panjabi, nepali.'],
    },
    {
      heading: 'Tunnustus',
      paragraphs: ['Kaikki kirjoittajat hyvitetään arkistoon. Työsi auttaa tuhansia käyttäjiä käyttämään ANQR:ää haluamallaan kielellä.', 'Kiitos kaikille käännösavustajillemme, jotka olette auttaneet tekemään ANQR:n saatavuuden maailmanlaajuisesti!'],
    },
    {
      heading: 'Kysymyksiä?',
      paragraphs: ['Jos sinulla on kysyttävää käännösten lisäämisestä, avaa ongelma GitHub-arkistossamme tai ota meihin yhteyttä sähköpostitse. Autamme mielellämme pääsemään alkuun.'],
    },
  ],
};

export default translate;
