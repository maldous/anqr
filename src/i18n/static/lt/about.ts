import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Apie ANQR',
  description: 'ANQR yra nemokamas QR kodų generatorius, skirtas pirmiausia klientui – generuokite QR kodus vietoje arba naudokite mūsų API įterpimui.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Atidarykite generatorių', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Naršyti Sužinokite straipsnius', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Privatumo politika', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Paslaugų teikimo sąlygos', type: 'external' },
  ],
  sections: [
    {
      heading: 'Kas yra ANQR?',
      paragraphs: ['ANQR (tariama „inkaras") yra nemokamas QR kodų generatorius, sukuriantis nuskaitomus URL, teksto, „Wi-Fi" kredencialų, kontaktų kortelių, kalendoriaus įvykių ir kt. kodus.', 'Jis sukurtas asmenims, mažoms įmonėms, rinkodaros specialistams ir kūrėjams, kurie nori galingų QR įrankių neprisiregistravę. Pirmojo kliento dizainas reiškia, kad QR kodai pagal numatytuosius nustatymus generuojami vietoje jūsų naršyklėje su pasirenkama serverio API profesionaliam įterpimui ir integravimui.'],
    },
    {
      heading: 'Pagrindinės savybės',
      bullets: ['Greitai generuokite QR kodus savo naršyklėje – nereikia jokios paskyros.', 'Tinkinkite spalvas, modulių stilius, ieškiklio raštus ir pridėkite vaizdo perdangų.', 'Eksportuokite keliais formatais: PNG, SVG, WebP ir animuotu GIF.', 'Išplėstiniai klaidų taisymo lygio, QR versijos, kodavimo režimo ir kaukės pasirinkimo valdikliai.', 'Saugos nuskaitymo gairės ir tiesioginė peržiūra, kad kodai būtų įskaitomi spausdinant ir ekrane.', 'Serverio API profesionaliam įterpimui su visu parametrų palaikymu.', 'Įkėlus veikia neprisijungus – tai statinė žiniatinklio programa, kurią galite paleisti bet kur.'],
    },
    {
      heading: 'Kaip veikia ANQR',
      paragraphs: ['ANQR veikia jūsų naršyklėje ir užkoduoja jūsų įvestį į standartinę QR matricą su Reed-Solomon klaidų taisymu, tada pateikia ją jūsų pasirinktu formatu.', 'Pagal numatytuosius nustatymus generavimas vyksta lokaliai jūsų naršyklėje. Profesionaliam naudojimui taip pat galite naudoti serverio API, kad generuotumėte QR kodus naudodami URL parametrus – puikiai tinka įterpti į svetaines, el. laiškus ar automatines darbo eigas.', 'Kai pridedate perdangų ar animacijų, ANQR suderina stilių ir nuskaitymo patikimumą, kad rezultatas liktų nuskaitomas.', 'ANQR daugiausia dėmesio skiria statiniams kodams (duomenys yra QR viduje). Jei jums reikia dinaminio kodo (redaguojama paskirties vieta), galite užkoduoti savo peradresavimo URL arba trumpą nuorodą.'],
    },
    {
      heading: 'Kas valdo ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklama ir kaip išlikti nemokami',
      paragraphs: ['ANQR yra nemokamas ir palaikomas reklamuojant. Galime rodyti skelbimus per Google AdSense ir (arba) kitus reklamos partnerius.', 'Skelbimų teikėjai gali naudoti slapukus ar panašias technologijas, kad suasmenintų skelbimus pagal jūsų pomėgius ir naršymo veiklą. Skelbimų nuostatas galite tvarkyti įrenginio nustatymuose ir „Google" skelbimų nustatymuose, o daugiau sužinoti galite mūsų privatumo politikoje.', 'Mes neparduodame turinio, kurį užkoduojate į QR kodus. Skelbimai padeda padengti projekto vykdymo ir tobulinimo išlaidas.'],
    },
    {
      heading: 'Atviri standartai',
      paragraphs: ['ANQR generuoja QR kodus pagal ISO/IEC 18004 standartą ir siekia plataus suderinamumo tarp skaitytuvų, fotoaparatų ir spausdinimo darbo eigos.'],
    },
    {
      heading: 'Prekės ženklo pranešimas',
      paragraphs: ['QR Code® yra registruotasis DENSO WAVE INCORPORATED prekės ženklas. ANQR nėra susijęs su DENSO WAVE INCORPORATED, jo nepatvirtina ir neremia.'],
    },
    {
      heading: 'Atsiliepimai ir įnašai',
      paragraphs: ['Laukiame atsiliepimų, klaidų pranešimų ir funkcijų pasiūlymų. Prašome susisiekti el. paštu arba kontaktų puslapyje – skaitome kiekvieną pranešimą, nors atsakymo laikas gali skirtis.'],
    },
  ],
};

export default about;
