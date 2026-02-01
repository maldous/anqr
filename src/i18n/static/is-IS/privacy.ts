import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Persónuverndarstefna',
  description:
    'Upplýsingar sem ANQR safnar, hvernig þær eru notaðar og réttindi þín samkvæmt gildandi persónuverndarlögum.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Þjónustuskilmálar', type: 'external' }],
  sections: [
    {
      heading: 'Samantekt',
      paragraphs: [
        'ANQR er QR kóða rafall með viðskiptavinur-fyrsta nálgun. Við þurfum ekki að búa til reikning. Sjálfgefið er að QR kóðar eru búnir til á staðnum í vafranum þínum - við höfum ekki aðgang að efninu sem þú kóðar.',
        'Fyrir faglega notkun, ANQR býður upp á API á netþjóni sem býr til QR kóða úr vefslóð breytum. Þegar API er notað er QR-efnið þitt unnið á netþjónum okkar til að birta myndina, en það er ekki vistað eða skráð.',
        'Við notum Google AdSense til auglýsinga og gætum notað greiningarþjónustur. Þessi þjónusta safnar upplýsingum með vafrakökum og svipaðri tækni. Þessi stefna útskýrir hvaða gögnum er safnað, hvernig þau eru notuð og réttindi þín.',
      ],
    },
    {
      heading: 'Upplýsingar sem við söfnum',
      bullets: [
        'Upplýsingar sem þú gefur upp: Ef þú hefur samband við okkur með tölvupósti eða snertingareyðublaði okkar, söfnum við nafni þínu, netfangi og innihaldi skilaboða.',
        'Sjálfkrafa safnað upplýsingum: Hýsingaraðili okkar (Netlify), auglýsingaaðilar og greiningarþjónusta kunna að safna: IP tölu, gerð vafra og útgáfu, stýrikerfi, gerð tækis, tilvísunarslóð, heimsóttar síður, tími á staðnum og áætlaða landfræðilega staðsetningu.',
        'Vafrakökur þriðju aðila: Auglýsingasamstarfsaðilar okkar (Google AdSense) nota vafrakökur og svipaða tækni til að þjóna og mæla auglýsingar. ANQR sjálft setur engar vefkökur frá fyrsta aðila.',
      ],
    },
    {
      heading: 'Vafrakökur og tækni frá þriðja aðila',
      paragraphs: [
        'ANQR setur engar vefkökur frá fyrsta aðila. Kjörstillingar þínar (eins og dökk stilling) eru geymdar á staðnum á tækinu þínu, sem er ekki sent til neins netþjóns.',
        'Hins vegar gætu auglýsingasamstarfsaðilar okkar (Google AdSense) og hýsingaraðili notað vafrakökur og svipaða rakningartækni:',
      ],
      bullets: [
        'Auglýsingakökur (þriðji aðili): Settar af Google AdSense og auglýsingaaðilum til að birta viðeigandi auglýsingar, mæla árangur auglýsinga og skilja hagsmuni notenda. Þessar vafrakökur gætu fylgst með virkni þinni á mismunandi vefsíðum.',
        'Greiningarkökur (þriðji aðili): Getur verið notað af hýsingaraðila okkar eða greiningarþjónustu til að safna nafnlausum notkunargögnum.',
      ],
    },
    {
      heading: 'Google AdSense og auglýsingar',
      paragraphs: [
        'Við birtum auglýsingar í gegnum Google AdSense. Google og samstarfsaðilar þess nota vafrakökur til að birta auglýsingar byggðar á vafraferli þínum á þessari síðu og öðrum vefsíðum (áhugamiðaðar auglýsingar).',
        'Lærðu hvernig Google notar upplýsingarnar þínar: https://policies.google.com/technologies/partner-sites',
        'Hafa umsjón með sérsniðnum auglýsingum: https://adssettings.google.com',
        'Afþakkaðu í gegnum Network Advertising Initiative: https://optout.networkadvertising.org',
        'Afþakkaðu í gegnum Digital Advertising Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Hvernig við notum upplýsingar',
      bullets: [
        'Til að svara fyrirspurnum þínum og veita stuðning.',
        'Til að birta viðeigandi auglýsingar í gegnum auglýsingafélaga okkar.',
        'Til að greina notkun vefsvæðisins og bæta þjónustu okkar.',
        'Til að greina, koma í veg fyrir og taka á svikum, misnotkun og öryggisvandamálum.',
        'Til að uppfylla lagalegar skyldur.',
      ],
    },
    {
      heading: 'Þjónusta þriðja aðila',
      bullets: [
        'Google AdSense: Tekur við gögnum til að birta og mæla auglýsingar.',
        'Greiningarveitendur: Fáðu nafnlaus notkunargögn.',
        'Netlify (hýsing): Vinnur úr beiðnum og gæti skráð IP-tölur.',
        'Við seljum ekki persónulegar upplýsingar þínar. Hins vegar getur verið litið á það sem "sala" að deila gögnum með auglýsingaaðilum samkvæmt CCPA (sjá hér að neðan).',
      ],
    },
    {
      heading: 'Varðveisla gagna',
      bullets: [
        'Sendingar um tengiliði: Allt að 2 ár.',
        'Server logs: Allt að 30 dagar (hýsingaraðili).',
        'Greiningargögn: Allt að 26 mánuðir (nafnlaus).',
        'Auglýsingakökur: Venjulega 13 mánuðir (breytilegt eftir samstarfsaðilum).',
      ],
    },
    {
      heading: 'Réttindi þín samkvæmt GDPR (EES notendur)',
      paragraphs: [
        'Ef þú ert á Evrópska efnahagssvæðinu hefur þú eftirfarandi réttindi samkvæmt almennu persónuverndarreglugerðinni:',
      ],
      bullets: [
        'Réttur til aðgangs: Biddu um afrit af persónuupplýsingum sem við höfum um þig.',
        'Réttur til leiðréttingar: Óska eftir leiðréttingu á ónákvæmum gögnum.',
        'Réttur til eyðingar: Biddu um eyðingu gagna þinna ("réttur til að gleymast").',
        'Réttur til að takmarka vinnslu: Biðja um takmarkanir á því hvernig við notum gögnin þín.',
        'Réttur til gagnaflutnings: Biddu um gögnin þín á færanlegu sniði.',
        'Andmælaréttur: Andmæla vinnslu, þar með talið vegna beinnar markaðssetningar.',
        'Réttur til að afturkalla samþykki: Dragðu til baka samþykki hvenær sem er þar sem vinnslan er byggð á samþykki.',
        'Réttur til að leggja fram kvörtun: Sendu kvörtun til gagnaverndaryfirvalda.',
      ],
    },
    {
      heading: 'GDPR lagagrundvöllur',
      paragraphs: [
        'Við vinnum úr gögnum á þessum grunni: (a) Samþykki - fyrir sérsniðnar auglýsingar (stýrt af auglýsingaaðilum okkar); (b) Lögmætir hagsmunir - fyrir greiningar, öryggi og umbætur; (c) Samningur - til að svara fyrirspurnum.',
        'Til að nýta réttindi þín, hafðu samband við email@anqr.link. Við svörum innan 30 daga.',
      ],
    },
    {
      heading: 'Réttindi þín samkvæmt CCPA (Kaliforníunotendur)',
      bullets: [
        'Réttur til að vita: Biðja um upplýsingar um gögn sem safnað er, heimildir, tilgang og þriðja aðila.',
        'Réttur til eyðingar: Biddu um eyðingu persónuupplýsinga þinna.',
        'Réttur til að afþakka: Afþakkaðu „sölu" á persónuupplýsingum (deiling með auglýsingaaðilum gæti átt rétt á sér).',
        'Réttur til jafnræðis: Við munum ekki mismuna fyrir að nýta réttindi þín.',
      ],
    },
    {
      heading: 'CCPA flokkum safnað',
      paragraphs: [
        'Flokkar: Auðkenni (IP-tala, auðkenni tækis), Internetvirkni (vef, auglýsingasamskipti), Landfræðileg staðsetning (áætlað), Ályktanir (áhugi vegna vafra).',
        'Til að nýta réttindi eða afþakka: email@anqr.link eða stilla vafrakökurstillingar.',
      ],
    },
    {
      heading: 'Alþjóðleg millifærslur',
      paragraphs: [
        'Upplýsingarnar þínar gætu verið fluttar til landa með mismunandi gagnaverndarlög, þar á meðal Bandaríkjanna. Við notum viðeigandi öryggisráðstafanir eins og staðlaða samningsákvæði.',
      ],
    },
    {
      heading: 'Friðhelgi barna',
      paragraphs: [
        'ANQR er ekki beint að börnum yngri en 13 (eða 16 ára innan EES). Við söfnum ekki gögnum frá börnum meðvitað. Hafðu samband við email@anqr.link ef þú telur að barn hafi gefið upplýsingar.',
      ],
    },
    {
      heading: 'Öryggi',
      paragraphs: [
        'Við notum viðeigandi tæknilegar og skipulagslegar ráðstafanir til að vernda gögn, þar á meðal HTTPS dulkóðun. Hins vegar er engin netsending 100% örugg.',
      ],
    },
    {
      heading: 'Ekki rekja',
      paragraphs: [
        'Við virðum ekki fylgjast með vaframerkjum þar sem það er mögulegt, þó að auglýsingaaðilar kunni ekki að svara DNT.',
      ],
    },
    {
      heading: 'Breytingar á þessari stefnu',
      paragraphs: [
        'Við gætum uppfært þessa stefnu reglulega. Dagsetningin „Síðast uppfærð" gefur til kynna nýjustu endurskoðunina. Verulegar breytingar kunna að vera tilkynntar með vefborða.',
      ],
    },
    {
      heading: 'Hafðu samband við okkur',
      paragraphs: [
        'Fyrir spurningar um persónuvernd eða til að nýta réttindi þín: email@anqr.link eða notaðu tengiliðasíðuna okkar. Við svörum beiðnum um persónuvernd innan 30 daga.',
      ],
    },
    {
      heading: 'Full persónuverndarstefna',
      paragraphs: [
        'Þessi síða veitir yfirlit yfir persónuverndarvenjur okkar. Fyrir heildar, lagalega bindandi persónuverndarstefnu með öllum upplýsingum um gagnavinnslu, réttindi þín og skyldur okkar samkvæmt GDPR, CCPA og öðrum persónuverndarlögum, vinsamlegast skoðaðu stefnu okkar í heild sinni sem hýst er af iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Skoðaðu alla persónuverndarstefnu á iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
