import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Käyttöehdot',
  description: 'Käyttämällä sivustoa hyväksyt näiden ehtojen sitomisen.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Yksityisyyden suoja', type: 'external' }],
  sections: [
    {
      heading: 'Ehdot',
      paragraphs: ['Käyttämällä tai käyttämällä ANQR (anqr.linkkiä) hyväksyt, että nämä käyttöehdot ja tietosuojakäytäntö sitovat sinua. Jos et hyväksy näitä ehtoja, älä käytä sivustoa.', 'Voimme päivittää näitä ehtoja ajoittain. Sivuston käytön jatkaminen muutosten jälkeen merkitsee uusien ehtojen hyväksymistä.'],
    },
    {
      heading: 'Tukikelpoisuus',
      paragraphs: ['Sinun täytyy olla vähintään 13-vuotias käyttääksesi ANQR:ää. Käyttämällä sivustoa, edustat, että täytät tämän ikävaatimuksen. Jos olet alle 18-vuotias, edustat sitä, että sinulla on vanhemman tai huoltajan lupa käyttää sivustoa.'],
    },
    {
      heading: 'Sallittu käyttö',
      paragraphs: ['Voit käyttää ANQR:ää vain laillisiin tarkoituksiin. Olet yksin vastuussa koodaamastasi sisällöstä QR-koodeihin ja siitä, miten käytät luomiasi QR-koodeja.'],
    },
    {
      heading: 'Kielletty toiminta',
      paragraphs: ['Hyväksytte, että ette'],
      bullets: ['Käytä ANQR luoda QR koodit, jotka helpottavat phishing, haittaohjelmien jakelu, petos, huijaukset, häirintä, kunnianloukkaus, tai mitään laitonta toimintaa.', 'Koodaa sisältöä, joka loukkaa teollis- ja tekijänoikeuksia, rikkoo yksityisyyttä tai sisältää laitonta materiaalia.', 'Yritä häiritä, ylikuormittaa tai häiritä laitoksen toimintaa tai turvallisuutta.', 'Käänteinen insinööri, hajota, tai yrittää poimia lähdekoodia sivustosta.', 'Käytä automaattisia työkaluja (botteja, kaavintoja) päästäksesi sivustolle tavalla, joka heikentää suorituskykyä muille käyttäjille.', 'Ympäri tai pois käytöstä kaikki turva- tai kulunvalvontaominaisuudet.', 'Esitä henkilö tai yhteisö tai vääristele yhteyksiäsi.'],
    },
    {
      heading: 'Henkinen omaisuus',
      paragraphs: ['Omistat sisällön, jonka koodaat QR-koodeiksi. ANQR ei väitä omistavansa tietojasi.', 'ANQR nimi, logo, käyttöliittymä suunnittelu, ja taustalla koodi on suojattu tekijänoikeuden, tavaramerkki, ja muut teollis- ja tekijänoikeudet. Et saa kopioida, muokata, jakaa tai luoda johdannaisteoksia ilman lupaamme.', 'QR Code® on DENSO WAVE INCORPOREDin rekisteröity tavaramerkki. ANQR ei liity DENSO WAVE:hen.'],
    },
    {
      heading: 'Käyttäjän sisältölisenssi',
      paragraphs: ['Käyttämällä ANQR, et anna meille oikeuksia sisältöä. Kun käytät paikallista sukupolvea (oletus), kaikki QR-koodin sukupolvi tapahtuu selaimessasi emmekä käytä, tallenna tai lähetä koodattuja tietojasi.', 'Kun käytät palvelinpuolen sovellusrajapintaa, sisältöäsi käsitellään QR-kuvan tuottamiseksi, mutta sitä ei tallenneta, kirjauduta tai käytetä muuhun tarkoitukseen kuin haluamasi kuvan renderointiin.'],
    },
    {
      heading: 'Kolmansien osapuolten palvelut ja mainonta',
      paragraphs: ['Sivusto näyttää mainoksia Google AdSensen kautta ja voi sisältää linkkejä kolmansien osapuolten verkkosivustoille. Emme ole vastuussa kolmannen osapuolen sisällöstä, palveluista tai tietosuojakäytännöistä.', 'Yhteydet mainostajien ja kolmansien osapuolten kanssa ovat vain sinun ja heidän välillään. Katso tietosuojakäytännöstämme tietoa mainostietokäytännöistä.'],
    },
    {
      heading: 'Takuulauseke',
      paragraphs: ['ANQR:N TOIMITTAMINEN "AS IS"- JA "käytettävissä" -PERUSTAAN, jossa ei ole minkäänlaisia, räjähtäviä tai vaikuttavia kohteita, mukaan lukien muun muassa sellaiset, jotka eivät ole rajoittuneet jäljitettävyyteen, tiettyyn tarkoitukseen soveltumattomuuteen eikä sitoutumiseen.', 'Emme takaa, että a) sivusto on keskeytymätön, turvallinen tai virheetön; b) QR-koodit skannataan kaikissa ympäristöissä, kaikissa laitteissa tai kaikissa skannerisovelluksissa; c) sivusto täyttää vaatimuksesi.', 'QR-koodeja on aina testattava niissä olosuhteissa, joissa niitä käytetään (tulostuskoko, valaistus, näyttötyyppi, etäisyys, kameran laatu).'],
    },
    {
      heading: 'Vastuun rajoittaminen',
      paragraphs: ['OIKEUDELLISESTI, KYSYMYKSEN JA SEN TOIMIJIEN, AFFILIATES:IN JA LISENSSIEN MAXIMIIN, EI SAA VÄHENTÄÄ SUORIA, HYÖDYTTÄVIÄ, HYÖDYLLISIÄ, ERIKOISIA, SÄHKÖISIÄ, YKSINKERTOISIÄ TAI ENNAKKOTUOTTEITA, MUKAAN MUKAAN LUOVUTETTAVAT MAKSUT, TULOT, TIEDOT, HYÖDYKSET, KÄYTÖT TAI MUUT TEKTÄVÄT HYÖDYTYKSET, PALVELUJEN SAANTI- TAI KÄYTTÖTARVIKKEET.', 'Ymmärrät ja olet samaa mieltä, että palvelusi on vaarassa. Palvelu on maksutonta ja sen mukaan - olet samaa mieltä siitä, että ANQR: llä ja sen toimijoilla ei ole mitään vastuuta sinulle. Ei TAPAHTUNUT MEIDÄN KOKONAISVELVOLLISUUDEN OTETUT Zero Dollarit (0 AUD).', 'Suostutte vapauttamaan, odottamaan ja valehtelemaan - kaikki syytteet ja syytteet, - jotka liittyvät toimintaan ANQR:ää ja sen toiminnanharjoittajia vastaan.', 'Jotkut valamiehistöt eivät estä tiettyjen sakoista luopumista. Näinä valamiehinä meidän uskottavuutemme rajoitetaan - sovellettavaan lakiin.'],
    },
    {
      heading: 'Korvaus',
      paragraphs: ['Sitoudut korvaamaan, puolustamaan ja pitämään yllä vaaratonta ANQR:ää, sen operaattoreita, tytäryhtiöitä ja niiden upseereita, johtajia, työntekijöitä ja edustajia kaikista vaatimuksista, vahingoista, menetyksistä, veloista, kustannuksista ja kuluista (mukaan lukien oikeudenkäyntikulut), jotka johtuvat a) sivuston käytöstäsi; b) näiden ehtojen rikkomisesta; c) kolmansien osapuolten oikeuksien rikkomisesta; d) kaikesta sisällöstä, jonka koodaat QR-koodeiksi.'],
    },
    {
      heading: 'Riitojen ratkaiseminen',
      paragraphs: ['Kaikki näistä ehdoista johtuvat riidat tai ANQR:n käyttö yritetään ensin ratkaista epävirallisilla neuvotteluilla ottamalla yhteyttä .', 'Jos epävirallinen ratkaisu epäonnistuu, riidat ratkaistaan sitovalla välimiesmenettelyllä Victoriassa Australiassa, paitsi että jompikumpi osapuoli voi hakea kieltotuomiota teollis- ja tekijänoikeuksien loukkauksista.'],
    },
    {
      heading: 'Luokkapoikkeus',
      paragraphs: ['Lain sallimalle expotentille olette samaa mieltä siitä, että kaikki RIKOLLISET PÄÄTÖSMENETTELYT toteutetaan vain henkilökohtaisesti eikä luokassa, konsolidoidussa tai edustuksellisessa toiminnassa.'],
    },
    {
      heading: 'Lainsäädäntö',
      paragraphs: ['Näihin ehtoihin sovelletaan Australian Victorian lakeja ilman lainvalintaperiaatteita. Suostutte Australian Victoriassa sijaitsevien tuomioistuinten yksinomaiseen toimivaltaan.'],
    },
    {
      heading: 'Muutokset ja saatavuus',
      paragraphs: ['Voimme muuttaa, keskeyttää tai keskeyttää sivuston (tai sen osan) milloin tahansa ilman ilmoitusta tai vastuuta.', 'Voimme päivittää näitä ehtoja milloin tahansa. "Viimeinen päivitetty" päivämäärä ilmoittaa, milloin niitä viimeksi tarkistettiin. Käytön jatkaminen muutosten jälkeen merkitsee hyväksymistä.'],
    },
    {
      heading: 'Erot',
      paragraphs: ['Jos jokin näiden Ehtojen määräys on pätemätön tai täytäntöönpanokelvoton, kyseinen määräys pannaan täytäntöön mahdollisimman suuressa määrin ja loput määräykset pysyvät täysin voimassa ja voimassa.'],
    },
    {
      heading: 'Vapautus',
      paragraphs: ['Jos emme toteuta mitään näiden ehtojen mukaista oikeutta tai säännöstä, emme katso luopumista tällaisesta oikeudesta tai säännöksestä.'],
    },
    {
      heading: 'Koko sopimus',
      paragraphs: ['Nämä ehdot yhdessä tietosuojakäytäntömme kanssa muodostavat koko sopimuksen sinun ja ANQR:n välillä sivuston käytöstä ja korvaavat kaikki aiemmat sopimukset.'],
    },
    {
      heading: 'Ylivoimainen este',
      paragraphs: ['Emme ole vastuussa epäonnistumisesta tai viivästymisestä, joka johtuu olosuhteista, joihin emme voi kohtuudella vaikuttaa, kuten luonnonkatastrofeista, sodasta, terrorismista, mellakoista, hallituksen toimista tai internetistä/infrastruktuurista.'],
    },
    {
      heading: 'Yhteystiedot',
      paragraphs: ['Kysymyksiä näistä ehdoista voi lähettää osoitteeseen: email@anqr.link'],
    },
  ],
};

export default terms;
