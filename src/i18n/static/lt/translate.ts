import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Padėkite išversti ANQR',
  description: 'Prisijunkite prie mūsų vertėjų bendruomenės, padedančios padaryti ANQR prieinamą vartotojams visame pasaulyje. Nereikia jokios kodavimo patirties – prisidėkite tiesiai iš savo naršyklės.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Atidarykite vertimų saugyklą', type: 'external' },
    { href: '/?lang=${lang}', label: 'Atidarykite generatorių', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Apie ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Susisiekite su mumis', type: 'external' },
  ],
  sections: [
    {
      heading: 'Kodėl prisidėti?',
      paragraphs: ['ANQR naudoja žmonės visame pasaulyje kurdami QR kodus įmonėms, renginiams, mokėjimams ir asmeniniams projektams. Prisidėdami prie vertimų padedate padaryti šį galingą įrankį prieinamą naudotojams, kurie teikia pirmenybę savo gimtajai kalbai.', 'Kiekvienas vertimo indėlis – ar tai būtų rašybos klaida, ar verčiama visa kalba – yra tikras skirtumas jūsų bendruomenės naudotojams.'],
    },
    {
      heading: 'Ką galite išversti?',
      paragraphs: ['ANQR yra dviejų tipų verčiamas turinys:'],
      bullets: ['UI eilutės: mygtukų etiketės, meniu elementai, patarimai ir sąsajos tekstas, rodomas visoje programoje.', 'Statinis turinys: dokumentacijos puslapiai, įskaitant vadovus, pavyzdžius, privatumo politiką ir pagalbos straipsnius.', 'Abu tipai saugomi kaip paprasti tekstiniai failai, kuriuos galite redaguoti tiesiogiai savo naršyklėje – nereikia specialios programinės įrangos.', 'Vertimai peržiūrimi prieš sujungiant, siekiant užtikrinti kokybę ir nuoseklumą.'],
    },
    {
      heading: 'Kaip prisidėti',
      paragraphs: ['Prisidėti paprasta ir nereikia jokių Git žinių:'],
      bullets: ['Apsilankykite mūsų viešoje vertimų saugykloje „GitHub".', 'Raskite savo kalbos failą (arba sukurkite naują, jei jūsų kalba dar nepalaikoma).', 'Spustelėkite pieštuko piktogramą, kad galėtumėte redaguoti tiesiogiai naršyklėje.', 'Atlikite pakeitimus ir spustelėkite „Siūlyti pakeitimus" – „GitHub" automatiškai sukurs ištraukimo užklausą.', 'Jūsų indėlis bus peržiūrėtas ir sujungtas, paprastai per kelias dienas.'],
    },
    {
      heading: 'Vertimo gairės',
      paragraphs: ['Versdami nepakeiskite vietos rezervavimo ženklų, pvz., {name}, {count} ir {{variable}} – vykdymo metu jie pakeičiami dinaminėmis reikšmėmis. Taip pat išsaugokite bet kokią į HTML panašią sintaksę, pvz., nuorodas formatu [[/path|Label]].', 'Jei nesate tikri dėl vertimo, geriau palikti jį anglų kalba, nei pateikti neteisingą vertimą. Taip pat galite atidaryti problemą „GitHub", kad paprašytumėte paaiškinimo.'],
    },
    {
      heading: 'Šiuo metu palaikomos kalbos',
      paragraphs: ['ANQR šiuo metu palaiko daugiau nei 40 kalbų, įskaitant:'],
      bullets: ['Pagrindinės pasaulio kalbos: anglų, kinų, ispanų, arabų, hindi, portugalų, japonų, korėjiečių, prancūzų, vokiečių, rusų ir kt.', 'Pietryčių Azijos kalbos: tajų, vietnamiečių, indoneziečių, filipiniečių, malajų, khmerų, laosiečių, birmiečių.', 'Pietų Azijos kalbos: hindi, tamilų, telugų, bengalų, maratų, gudžaratų, kanadų, malajalių, pandžabų, nepaliečių.'],
    },
    {
      heading: 'Pripažinimas',
      paragraphs: ['Visi bendradarbiai yra įtraukti į mūsų saugyklą. Jūsų darbas padeda tūkstančiams vartotojų pasiekti ANQR norima kalba.', 'Dėkojame visiems mūsų vertimo pagalbininkams, padedantiems padaryti ANQR prieinamą visame pasaulyje!'],
    },
    {
      heading: 'Klausimai?',
      paragraphs: ['Jei turite klausimų apie vertimus, atidarykite problemą mūsų „GitHub" saugykloje arba susisiekite su mumis el. paštu. Džiaugiamės galėdami padėti jums pradėti.'],
    },
  ],
};

export default translate;
