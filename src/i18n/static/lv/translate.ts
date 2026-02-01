import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Palīdziet iztulkot ANQR',
  description: 'Pievienojieties mūsu tulkotāju kopienai, palīdzot padarīt ANQR pieejamu lietotājiem visā pasaulē. Nav nepieciešama kodēšanas pieredze — sniedziet ieguldījumu tieši no savas pārlūkprogrammas.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Atveriet tulkošanas repozitoriju', type: 'external' },
    { href: '/?lang=${lang}', label: 'Atveriet ģeneratoru', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Par ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Sazinieties ar mums', type: 'external' },
  ],
  sections: [
    {
      heading: 'Kāpēc dot ieguldījumu?',
      paragraphs: ['ANQR izmanto cilvēki visā pasaulē, lai izveidotu QR kodus uzņēmumiem, pasākumiem, maksājumiem un personīgiem projektiem. Veicot tulkojumus, jūs palīdzat padarīt šo jaudīgo rīku pieejamu lietotājiem, kuri dod priekšroku savai dzimtajai valodai.', 'Katrs tulkojuma ieguldījums — neatkarīgi no tā, vai tiek labota drukas kļūda vai tulkota vesela valoda — rada patiesas atšķirības jūsu kopienas lietotājiem.'],
    },
    {
      heading: 'Ko jūs varat iztulkot?',
      paragraphs: ['ANQR ir divu veidu tulkojams saturs:'],
      bullets: ['UI virknes: pogu etiķetes, izvēlnes vienumi, rīka padomi un saskarnes teksts, kas tiek rādīts visā lietotnē.', 'Statiskais saturs: dokumentācijas lapas, tostarp ceļveži, piemēri, konfidencialitātes politika un palīdzības raksti.', 'Abi veidi tiek saglabāti kā vienkārši teksta faili, kurus varat rediģēt tieši savā pārlūkprogrammā — nav nepieciešama īpaša programmatūra.', 'Tulkojumi tiek pārskatīti pirms to apvienošanas, lai nodrošinātu kvalitāti un konsekvenci.'],
    },
    {
      heading: 'Kā dot ieguldījumu',
      paragraphs: ['Līdzdalība ir vienkārša, un tai nav nepieciešamas Git zināšanas:'],
      bullets: ['Apmeklējiet mūsu publisko tulkojumu krātuvi vietnē GitHub.', 'Atrodiet savu valodas failu (vai izveidojiet jaunu, ja jūsu valoda vēl netiek atbalstīta).', 'Noklikšķiniet uz zīmuļa ikonas, lai rediģētu tieši savā pārlūkprogrammā.', 'Veiciet izmaiņas un noklikšķiniet uz Ierosināt izmaiņas — GitHub automātiski izveidos izvilkšanas pieprasījumu.', 'Jūsu ieguldījums tiks pārskatīts un apvienots, parasti dažu dienu laikā.'],
    },
    {
      heading: 'Tulkošanas vadlīnijas',
      paragraphs: ['Tulkošanas laikā, lūdzu, nemainīt vietturi, piemēram, {name}, {count} un {{variable}} — izpildlaikā tās tiek aizstātas ar dinamiskām vērtībām. Saglabājiet arī jebkuru HTML līdzīgu sintaksi, piemēram, saites formātā [[/path|Label]].', 'Ja neesat pārliecināts par tulkojumu, labāk atstāt to angļu valodā, nevis nodrošināt nepareizu tulkojumu. Varat arī atvērt problēmu vietnē GitHub, lai lūgtu paskaidrojumus.'],
    },
    {
      heading: 'Pašlaik atbalstītās valodas',
      paragraphs: ['ANQR pašlaik atbalsta vairāk nekā 40 valodas, tostarp:'],
      bullets: ['Galvenās pasaules valodas: angļu, ķīniešu, spāņu, arābu, hindi, portugāļu, japāņu, korejiešu, franču, vācu, krievu un citas.', 'Dienvidaustrumāzijas valodas: taju, vjetnamiešu, indonēziešu, filipīniešu, malajiešu, khmeru, laosiešu, birmiešu.', 'Dienvidāzijas valodas: hindi, tamilu, telugu, bengāļu, maratu, gudžaratu, kannadu, malajalu, pandžabu, nepāliešu.'],
    },
    {
      heading: 'Atzinība',
      paragraphs: ['Visi atbalstītāji ir iekļauti mūsu repozitorijā. Jūsu darbs palīdz tūkstošiem lietotāju piekļūt ANQR viņu vēlamajā valodā.', 'Paldies visiem mūsu tulkošanas līdzstrādniekiem, kas palīdzēja ANQR padarīt pieejamu visā pasaulē!'],
    },
    {
      heading: 'Jautājumi?',
      paragraphs: ['Ja jums ir jautājumi par tulkojumu sniegšanu, lūdzu, atveriet problēmu mūsu GitHub krātuvē vai sazinieties ar mums pa e-pastu. Mēs esam priecīgi palīdzēt jums sākt darbu.'],
    },
  ],
};

export default translate;
