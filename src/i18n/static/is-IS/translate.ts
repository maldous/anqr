import type { PageDefinition } from '../types';

export const translate: PageDefinition = {
  title: 'Hjálpaðu til við að þýða ANQR',
  description:
    'Vertu með í samfélagi þýðenda okkar sem hjálpar til við að gera ANQR aðgengilegt notendum um allan heim. Engin kóðunarreynsla krafist - leggðu þitt af mörkum beint úr vafranum þínum.',
  lastUpdated: '1. febrúar 2026',
  primaryLinks: [
    {
      href: 'https://github.com/maldous/anqr-i18n',
      label: 'Opna þýðingargagnageymslu',
      type: 'external',
    },
    { href: '/?lang=${lang}', label: 'Opnaðu rafallinn', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Um ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Hafðu samband', type: 'external' },
  ],
  sections: [
    {
      heading: 'Hvers vegna leggja til?',
      paragraphs: [
        'ANQR er notað af fólki um allan heim til að búa til QR kóða fyrir fyrirtæki, viðburði, greiðslur og persónuleg verkefni. Með því að leggja til þýðingar hjálpar þú til við að gera þetta öfluga tól aðgengilegt notendum sem kjósa móðurmálið sitt.',
        'Sérhvert þýðingarframlag - hvort sem það er lagfæring á innsláttarvillu eða þýðingu á heilu tungumáli - skiptir raunverulegu máli fyrir notendur í samfélaginu þínu.',
      ],
    },
    {
      heading: 'Hvað getur þú þýtt?',
      paragraphs: ['ANQR hefur tvenns konar þýðanlegt efni:'],
      bullets: [
        'HÍ strengir: Hnappamerki, valmyndaratriði, verkfæraábendingar og viðmótstexti sem birtist í öllu forritinu.',
        'Statískt efni: Skjalasíður þar á meðal leiðbeiningar, dæmi, persónuverndarstefnu og hjálpargreinar.',
        'Báðar tegundirnar eru geymdar sem einfaldar textaskrár sem þú getur breytt beint í vafranum þínum - það þarf ekki sérstakan hugbúnað.',
        'Þýðingar eru yfirfarnar áður en þær eru sameinaðar til að tryggja gæði og samræmi.',
      ],
    },
    {
      heading: 'Hvernig á að leggja sitt af mörkum',
      paragraphs: ['Það er auðvelt að leggja sitt af mörkum og krefst engrar Git-þekkingar:'],
      bullets: [
        'Heimsæktu opinbera þýðingargagnageymsluna okkar á GitHub.',
        'Finndu tungumálaskrána þína (eða búðu til nýja ef tungumálið þitt er ekki enn stutt).',
        'Smelltu á blýantartáknið til að breyta beint í vafranum þínum.',
        'Gerðu breytingar þínar og smelltu á "Stinga til breytinga" - GitHub mun sjálfkrafa búa til dráttarbeiðni.',
        'Framlag þitt verður skoðað og sameinað, venjulega innan nokkurra daga.',
      ],
    },
    {
      heading: 'Þýðingarleiðbeiningar',
      paragraphs: [
        'Þegar þú þýðir skaltu halda staðgengjum eins og {name}, {count} og {{variable}} óbreyttum - þeim er skipt út fyrir kvik gildi á keyrslutíma. Geymdu líka HTML-líka setningafræði eins og tengla á sniðinu [[/path|Label]].',
        'Ef þú ert ekki viss um þýðingu er betra að skilja hana eftir á ensku en að gefa ranga þýðingu. Þú getur líka opnað mál á GitHub til að biðja um skýringar.',
      ],
    },
    {
      heading: 'Núverandi studd tungumál',
      paragraphs: ['ANQR styður nú yfir 40 tungumál, þar á meðal:'],
      bullets: [
        'Helstu tungumál heimsins: enska, kínverska, spænska, arabíska, hindí, portúgölska, japönsku, kóresku, frönsku, þýsku, rússnesku og fleira.',
        'Suðaustur-asísk tungumál: taílenska, víetnömska, indónesíska, filippseyska, malaíska, kmer, laó, burmneska.',
        'Suður-asísk tungumál: hindí, tamílska, telúgú, bengalska, maratí, gújaratí, kannada, malajalam, púndjabí, nepalska.',
      ],
    },
    {
      heading: 'Viðurkenning',
      paragraphs: [
        'Allir þátttakendur eru færðir inn í geymsluna okkar. Vinnan þín hjálpar þúsundum notenda að fá aðgang að ANQR á því tungumáli sem þeir vilja.',
        'Þakka þér fyrir alla þýðendur okkar fyrir að hjálpa til við að gera ANQR aðgengilegt um allan heim!',
      ],
    },
    {
      heading: 'Spurningar?',
      paragraphs: [
        'Ef þú hefur spurningar um að leggja fram þýðingar, vinsamlegast opnaðu mál á GitHub geymslunni okkar eða hafðu samband við okkur með tölvupósti. Við erum ánægð að hjálpa þér að byrja.',
      ],
    },
  ],
};

export default translate;
