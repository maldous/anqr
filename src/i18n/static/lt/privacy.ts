import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: 'Privatumo politika',
  description: 'Informacija, kurią ANQR renka, kaip ji naudojama, ir jūsų teisės pagal galiojančius privatumo įstatymus.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Paslaugų teikimo sąlygos', type: 'external' }],
  sections: [
    {
      heading: 'Santrauka',
      paragraphs: ['ANQR yra QR kodo generatorius, orientuotas į klientą. Mes nereikalaujame susikurti paskyros. Pagal numatytuosius nustatymus QR kodai generuojami lokaliai jūsų naršyklėje – mes neturime prieigos prie jūsų užkoduoto turinio.', 'Profesionaliam naudojimui ANQR teikia serverio API, kuri generuoja QR kodus iš URL parametrų. Kai naudojate API, jūsų QR turinys apdorojamas mūsų serveriuose, kad būtų pateiktas vaizdas, bet nėra saugomas ar registruojamas.', 'Mes naudojame Google AdSense reklamai ir galime naudoti analizės paslaugas. Šios paslaugos renka informaciją naudodamos slapukus ir panašias technologijas. Šioje politikoje paaiškinama, kokie duomenys renkami, kaip jie naudojami ir jūsų teisės.'],
    },
    {
      heading: 'Informacija, kurią renkame',
      bullets: ['Informacija, kurią pateikiate: Jei susisiekiate su mumis el. paštu arba mūsų kontaktų forma, renkame jūsų vardą, el. pašto adresą ir pranešimo turinį.', 'Automatiškai renkama informacija: mūsų prieglobos paslaugų teikėjas („Netlify"), reklamos partneriai ir analizės paslaugos gali rinkti: IP adresą, naršyklės tipą ir versiją, operacinę sistemą, įrenginio tipą, nukreipimo URL, aplankytus puslapius, laiką svetainėje ir apytikslę geografinę vietą.', 'Trečiųjų šalių slapukai: mūsų reklamos partneriai („Google AdSense") naudoja slapukus ir panašias technologijas reklamai teikti ir matuoti. Pats ANQR nenustato jokių pirmosios šalies slapukų.'],
    },
    {
      heading: 'Slapukai ir trečiųjų šalių technologijos',
      paragraphs: ['ANQR nenustato jokių pirmosios šalies slapukų. Jūsų nuostatos (pvz., tamsusis režimas) išsaugomos lokaliai jūsų įrenginyje, kuris neperduodamas į jokį serverį.', 'Tačiau mūsų reklamos partneriai („Google AdSense") ir prieglobos paslaugų teikėjas gali naudoti slapukus ir panašias stebėjimo technologijas:'],
      bullets: ['Reklaminiai slapukai (trečiųjų šalių): nustatyti „Google AdSense" ir reklamos partnerių, kad jie teiktų atitinkamus skelbimus, įvertintų skelbimų našumą ir suprastų naudotojų interesus. Šie slapukai gali stebėti jūsų veiklą įvairiose svetainėse.', '„Analytics" slapukai (trečiųjų šalių): juos gali naudoti mūsų prieglobos paslaugų teikėjas arba analizės paslaugos, kad rinktų anoniminius naudojimo duomenis.'],
    },
    {
      heading: 'Google AdSense ir reklama',
      paragraphs: ['Skelbimus rodome per Google AdSense. „Google" ir jos partneriai naudoja slapukus, kad pateiktų skelbimus pagal jūsų naršymo istoriją šioje svetainėje ir kitose svetainėse (reklamavimas pagal interesus).', 'Sužinokite, kaip „Google" naudoja jūsų informaciją: https://policies.google.com/technologies/partner-sites', 'Tvarkykite skelbimų suasmeninimą: https://adssettings.google.com', 'Atsisakykite per tinklo reklamavimo iniciatyvą: https://optout.networkadvertising.org', 'Atsisakykite per Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Kaip mes naudojame informaciją',
      bullets: ['Atsakyti į jūsų užklausas ir suteikti pagalbą.', 'Rodyti atitinkamus skelbimus per mūsų reklamos partnerius.', 'Norėdami analizuoti svetainės naudojimą ir tobulinti mūsų paslaugas.', 'Aptikti, užkirsti kelią sukčiavimui, piktnaudžiavimui ir saugos problemoms spręsti ir spręsti.', 'Vykdyti teisinius įsipareigojimus.'],
    },
    {
      heading: 'Trečiųjų šalių paslaugos',
      bullets: ['Google AdSense: gauna duomenis, kad būtų galima teikti ir matuoti reklamas.', '„Analytics" teikėjai: gaukite anoniminius naudojimo duomenis.', 'Netlify (priegloba): apdoroja užklausas ir gali registruoti IP adresus.', 'Mes neparduodame jūsų asmeninės informacijos. Tačiau dalijimasis duomenimis su reklamos partneriais gali būti laikomas „pardavimu" pagal CCPA (žr. toliau).'],
    },
    {
      heading: 'Duomenų saugojimas',
      bullets: ['Kontaktų pateikimas: iki 2 metų.', 'Serverio žurnalai: iki 30 dienų (prieglobos teikėjas).', '„Analytics" duomenys: iki 26 mėnesių (anoniminiai).', 'Reklaminiai slapukai: paprastai 13 mėnesių (kinta priklausomai nuo partnerio).'],
    },
    {
      heading: 'Jūsų teisės pagal BDAR (EEE naudotojai)',
      paragraphs: ['Jei esate Europos ekonominėje erdvėje, pagal Bendrąjį duomenų apsaugos reglamentą turite šias teises:'],
      bullets: ['Prieigos teisė: paprašyti mūsų turimų apie jus asmens duomenų kopijos.', 'Teisė ištaisyti: reikalauti ištaisyti netikslius duomenis.', 'Teisė ištrinti duomenis: prašyti ištrinti savo duomenis („teisė būti pamirštam").', 'Teisė apriboti tvarkymą: prašyti apribojimų, kaip mes naudojame jūsų duomenis.', 'Teisė į duomenų perkeliamumą: prašykite savo duomenų nešiojamu formatu.', 'Teisė prieštarauti: prieštarauti duomenų tvarkymui, įskaitant tiesioginę rinkodarą.', 'Teisė atšaukti sutikimą: atšaukti sutikimą bet kuriuo metu, jei tvarkymas pagrįstas sutikimu.', 'Teisė pateikti skundą: pateikite skundą savo duomenų apsaugos institucijai.'],
    },
    {
      heading: 'GDPR teisinis pagrindas',
      paragraphs: ['Duomenis tvarkome šiais pagrindais: (a) Sutikimas – personalizuotai reklamai (tvarkoma mūsų reklamos partnerių); (b) teisėti interesai – dėl analizės, saugumo ir tobulinimo; (c) Sutartis – atsakyti į užklausas.', 'Norėdami pasinaudoti savo teisėmis, susisiekite el.paštu@anqr.link. Atsakome per 30 dienų.'],
    },
    {
      heading: 'Jūsų teisės pagal CCPA (Kalifornijos naudotojai)',
      bullets: ['Teisė žinoti: prašyti informacijos apie surinktus duomenis, šaltinius, tikslus ir trečiąsias šalis.', 'Teisė ištrinti: prašyti ištrinti savo asmeninę informaciją.', 'Teisė atsisakyti: atsisakykite asmeninės informacijos „pardavimo" (gali būti naudinga dalintis su skelbimų partneriais).', 'Teisė į nediskriminavimą: mes nediskriminuosime dėl jūsų teisių įgyvendinimo.'],
    },
    {
      heading: 'Surinktos CCPA kategorijos',
      paragraphs: ['Kategorijos: Identifikatoriai (IP adresas, įrenginio ID), veikla internete (naršymas, sąveikos su skelbimais), geografinė padėtis (apytikslė), išvados (pomėgiai iš naršymo).', 'Norėdami pasinaudoti teisėmis arba atsisakyti: email@anqr.link arba pakoreguokite slapukų nustatymus.'],
    },
    {
      heading: 'Tarptautiniai pervedimai',
      paragraphs: ['Jūsų informacija gali būti perduota į šalis, kuriose taikomi skirtingi duomenų apsaugos įstatymai, įskaitant JAV. Mes naudojame tinkamas apsaugos priemones, pvz., standartines sutarties sąlygas.'],
    },
    {
      heading: 'Vaikų privatumas',
      paragraphs: ['ANQR nėra skirtas vaikams iki 13 metų (arba 16 metų EEE). Mes sąmoningai nerenkame duomenų iš vaikų. Kreipkitės į email@anqr.link, jei manote, kad vaikas pateikė informaciją.'],
    },
    {
      heading: 'Saugumas',
      paragraphs: ['Duomenims apsaugoti naudojame tinkamas technines ir organizacines priemones, įskaitant HTTPS šifravimą. Tačiau joks perdavimas internetu nėra 100% saugus.'],
    },
    {
      heading: 'Nesekti',
      paragraphs: ['Mes gerbiame „Do Not Track" naršyklės signalus, jei įmanoma, nors reklamos partneriai gali nereaguoti į DNT.'],
    },
    {
      heading: 'Šios politikos pakeitimai',
      paragraphs: ['Galime periodiškai atnaujinti šią politiką. Data „Paskutinį kartą atnaujinta" nurodo naujausią peržiūrą. Apie reikšmingus pakeitimus galima pranešti per svetainės reklamjuostę.'],
    },
    {
      heading: 'Susisiekite su mumis',
      paragraphs: ['Jei turite klausimų dėl privatumo arba norite pasinaudoti savo teisėmis, rašykite el. paštu@anqr.link arba naudokite mūsų Kontaktų puslapį. Į privatumo užklausas atsakome per 30 dienų.'],
    },
    {
      heading: 'Visa privatumo politika',
      paragraphs: ['Šiame puslapyje pateikiama mūsų privatumo praktikos santrauka. Norėdami gauti išsamią, teisiškai įpareigojančią privatumo politiką su visa informacija apie duomenų tvarkymą, jūsų teises ir mūsų įsipareigojimus pagal GDPR, CCPA ir kitus privatumo įstatymus, peržiūrėkite visą mūsų politiką, kurią talpina iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Peržiūrėkite visą „iubenda" privatumo politiką',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
