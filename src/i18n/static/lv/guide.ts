import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR lietotāja rokasgrāmata',
  description: 'Pilnīga rokasgrāmata par ANQR izmantošanu QR kodu izveidošanai.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Atveriet ģeneratoru', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Pārlūkot Uzziniet rakstus', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Skatiet QR piemērus', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Darba sākšana',
      paragraphs: [
        'ANQR ir QR koda ģenerators ar pieeju klientam. Pēc noklusējuma QR kodi tiek ģenerēti lokāli jūsu pārlūkprogrammā — konts nav nepieciešams, un jūsu dati paliek privāti. Profesionālai iegulšanai varat izmantot arī servera puses API.',
        'Interfeisam ir trīs saskarnes līmeņi: pamata, uzlabotais un profesionālais. Atlasiet savu līmeni, izmantojot galvenē esošās cilnes. Katrs līmenis atbloķē papildu funkcijas, vienlaikus saglabājot saskarni koncentrētu uz to, kas jums nepieciešams.',
      ],
      bullets: [
        'Pamata: vienkārša QR koda izveide ar vienkāršu tekstu/URL saturu un attēla pārklājumu.',
        'Papildu: QR kodēšanas opcijas, renderēšanas stili, animācija, izvades formāti, paplašināti satura veidi un pārklājuma pielāgošana.',
        'Profesionāli: ūdenszīmes, metadati, koplietošana, drošības analīze, maksājumu QR kodi un uzņēmuma funkcijas.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Atveriet ģeneratoru', type: 'generator' }],
    },
    {
      heading: 'Ātrais sākums',
      paragraphs: ['Lai izveidotu savu pirmo QR kodu:'],
      bullets: [
        '1. Nolaižamajā izvēlnē Satura veids atlasiet satura veidu (URL, teksts, WiFi utt.).',
        '2. Ievadiet savus datus norādītajos laukos.',
        '3. Pēc izvēles pielāgojiet krāsas, stilus un pievienojiet pārklājuma attēlu.',
        '4. Noklikšķiniet uz Eksportēt, lai lejupielādētu QR kodu kā PNG, GIF, WebP vai SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Pamatfunkcijas',
      paragraphs: [
        'Pamata līmenis nodrošina racionalizētu saskarni QR kodu izveidei ar lietderīgās slodzes saturu un attēlu pārklājumiem. Tas ir vienkāršākais veids, kā sākt.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Satura veidi (pamata)',
      paragraphs: [
        'Vienkāršs teksts: kodējiet jebkuru tekstu līdz QR koda ietilpības ierobežojumam. Ideāli piemērots īsziņām, kodiem vai identifikatoriem.',
        'URL: kodējiet tīmekļa adreses. Pēc skenēšanas QR kods atvērs URL. Atbalsta http:// un https:// protokolus.',
      ],
    },
    {
      heading: 'Attēla pārklājums (pamata)',
      paragraphs: [
        'Augšupielādējiet attēlu (JPG, PNG, GIF, WebP), lai tas apvienotos ar jūsu QR kodu. Pārklājuma pamatfunkcijās ietilpst:',
      ],
      bullets: [
        'Augšupielādēt no faila: atlasiet attēlu no savas ierīces.',
        'Ielādēt no URL: ievadiet attēla URL (jāatļauj CORS).',
        'Centra logotips: novieto attēlu centrā, paļaujoties uz kļūdu labošanu.',
        'Sajaukšana: vienkārša attēla alfa sajaukšana ar QR rakstu.',
        'Intensitāte: kontrolē, cik spēcīgi pārklājums ietekmē QR kodu (0–100%).',
        'Krāsu režīms: pilnkrāsu, pelēktoņu vai melnbalts.',
        'Saglabāt Finder Patterns: saglabā stūru rakstus nemodificētus, lai nodrošinātu uzticamu skenēšanu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Papildu funkcijas',
      paragraphs: [
        'Papildu līmenis atbloķē QR kodēšanas opcijas, renderēšanas stilus, animāciju, izvades formātus, paplašinātus satura veidus un papildu pārklājuma pielāgošanu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR kodēšanas iestatījumi',
      paragraphs: [
        'Versija: QR kodi ir pieejami versijās 1–40, un augstākās versijās ir vairāk datu, taču tās ir lielākas. Iestatiet uz 0 (Automātiski), lai ļautu ANQR izvēlēties mazāko versiju, kas atbilst jūsu saturam.',
        'Kļūdu labošana: nosaka, cik lielu bojājumu QR kods var ciest, vienlaikus saglabājot skenēšanu.',
      ],
      bullets: [
        'L (zems): 7% kļūdu labojums - mazākais izmērs, vismazākā dublēšanās.',
        'M (vidējs): 15% kļūdu labojums - līdzsvarota opcija.',
        'Q (Kvartile): 25% kļūdu labošana - piemērota drukātiem kodiem.',
        'H (Augsta): 30% kļūdu labošana — vislabāk piemērota kodiem ar pārklājumiem vai skarbos apstākļos.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Klusā zona (robeža)',
      paragraphs: [
        'Klusā zona ir balta vieta ap QR kodu. Skeneriem šī rezerve ir nepieciešama, lai noteiktu, kur sākas kods. Standarts iesaka vismaz 4 moduļus. Samazinot zem 4, var rasties skenēšanas problēmas.',
      ],
    },
    {
      heading: 'Moduļa stils',
      paragraphs: ['Moduļi ir atsevišķi kvadrāti, kas veido QR kodu. ANQR piedāvā piecus stilus:'],
      bullets: [
        'Kvadrāts: klasisks QR izskats ar asiem stūriem.',
        'Noapaļoti: mīkstināti stūri draudzīgākam izskatam.',
        'Punkti: Apļveida moduļi modernai estētikai.',
        'Dimants: par 45° pagriezti kvadrāti izteiktam rakstam.',
        'Savienots: moduļi saplūst blakus, veidojot organiskas formas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Finder Pattern Style',
      paragraphs: [
        'Finder raksti ir trīs lieli kvadrāti QR stūros, kas palīdz skeneriem orientēt kodu. Pieejamie stili:',
      ],
      bullets: [
        'Kvadrāts: standarta kvadrātveida stūri.',
        'Noapaļoti: mīkstināti stūri, kas atbilst noapaļota moduļa stilam.',
        'Aplis: apļveida meklētāja raksti punktu stila kodiem.',
      ],
    },
    {
      heading: 'Izlīdzināšanas un laika modeļi',
      paragraphs: [
        'Izlīdzināšanas raksti tiek parādīti lielākos QR kodos (versija 2+), lai palīdzētu novērst kropļojumus. Laika shēmas ir mainīgas līnijas, kas savieno meklētāja modeļus.',
      ],
      bullets: [
        'Izlīdzināšanas stils: atbilstības meklētājs, kvadrāts, noapaļots vai aplis.',
        'Laika stils: atbilstības modulis, viengabalains vai svītrots.',
      ],
    },
    {
      heading: 'Krāsas',
      paragraphs: [
        'Priekšplānā: QR moduļu krāsa. Melns (#000000) ir standarta, taču der jebkura tumša krāsa.',
        'Fons: fona krāsa. Baltā krāsa (#ffffff) ir standarta. Nodrošiniet pietiekamu kontrastu ar priekšplānu.',
        'Caurspīdīgs fons: pilnībā noņemiet fonu, lai to izmantotu uz krāsainām virsmām. Pārliecinieties, ka virsma nodrošina atbilstošu kontrastu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Moduļa izmērs un atstarpe',
      paragraphs: [
        'Moduļa izmērs: kontrolē, cik liels katrs modulis tiek atveidots pikseļos. Lielākas vērtības rada lielākus, vieglāk skenējamus kodus.',
        'Moduļu atstarpe: pievieno atstarpi starp moduļiem procentos. Nelielas atstarpes (5–15%) dažos apstākļos var uzlabot skenējamību, bet pārmērīgas atstarpes samazina uzticamību.',
      ],
    },
    {
      heading: 'Izvades iestatījumi',
      paragraphs: [
        'Formāts: izvēlieties eksportēšanas formātu, pamatojoties uz lietošanas gadījumu.',
      ],
      bullets: [
        'PNG: bezzudumu rastra formāts, ideāli piemērots lielākajai daļai lietojumu. Vislabāk drukātai un digitālai lietošanai.',
        'WebP: moderns formāts ar mazākiem failu izmēriem. Piemērots lietošanai tīmeklī.',
        'GIF: nepieciešams animētiem QR kodiem. Atbalsta caurspīdīgumu.',
        'SVG: vektora formāts, kas tiek mērogots bezgalīgi. Vispiemērotākais lielam drukāšanai vai gadījumos, kad nepieciešams rediģēt kodu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Izvades izmēri',
      paragraphs: [
        'Platums/augstums: iestatiet izvades izmēru pikseļos. Drukāšanai aprēķiniet, pamatojoties uz DPI (piemēram, 300 DPI pie 1 collas = 300 pikseļi). Lielāki izmēri skenē uzticamāk no attāluma.',
      ],
    },
    {
      heading: 'Animācijas iestatījumi (papildu)',
      paragraphs: ['Kontrolējiet animētā QR koda darbību:'],
      bullets: [
        'Ātrums: animācijas kadru ātrums milisekundēs.',
        'Cikla: nepārtraukta vai vienas atskaņošanas animācija.',
        'Atlēciens: galda tenisa animācijas virziens.',
        'Sākt kadru: sāciet animāciju no konkrēta kadra.',
        'Maksimālais kadru skaits: ierobežojiet kopējo kadru skaitu animācijā.',
        'Kadra darbība: izlaidiet kadrus ātrākai animācijai.',
        'Interpolācija: Nav, Crossfade vai Morph starp kadriem.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Satura veidi (papildu)',
      paragraphs: ['Uzlabots līmenis atbloķē papildu lietderīgās slodzes formātus:'],
      bullets: [
        'Tālruņa numurs (tel:): izveido zvanāmu tālruņa saiti.',
        'E-pasts (mailto:): atver e-pasta klientu ar izvēles tēmu un pamattekstu.',
        'SMS: iepriekš aizpildīta īsziņa uz tālruņa numuru.',
        'vCard: pilna kontakta kartīte ar vārdu, organizāciju, tālruni, e-pastu, adresi.',
        'MeCard: Japānā populārs kompaktais kontaktu formāts.',
        'BizCard: mantotais vizītkaršu formāts.',
        'Ģeogrāfiskā atrašanās vieta: GPS koordinātas, kas tiek atvērtas kartēs.',
        'WiFi: tīkla akreditācijas dati automātiskam savienojumam (SSID, parole, drošības veids).',
        'Kalendāra notikums: iCalendar formāts ar nosaukumu, atrašanās vietu, datumu/laiku.',
        'Pasākuma atbilde: saite uz pasākuma reģistrācijas lapu.',
        'Kalendāra abonēšana: abonējiet ICS/WebCal plūsmu.',
        'Faila/dokumenta URL: tieša saite uz lejupielādējamiem failiem.',
        'Mākoņa krātuves saite: saites uz Google disku, Dropbox, OneDrive utt.',
        'Sociālais profils: saites uz LinkedIn, Twitter, Instagram utt.',
        'Ziņapmaiņas saite: WhatsApp, Telegram, Signal dziļās saites.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Papildu pārklājuma funkcijas',
      paragraphs: ['Papildu pārklājuma iespējas:'],
      bullets: [
        'Apgriezt: iespējojiet apgriešanu, lai atlasītu attēla kvadrātveida apgabalu.',
        'Pustonis: klasisks drukas stila punktu raksts, kas balstīts uz attēla spilgtumu.',
        'Izkliedēts: kļūdu izkliedes izkliedēšana detalizētai reproducēšanai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pārklājuma sajaukšanas režīmi (papildu)',
      paragraphs: ['Papildu sajaukšanas režīmi uzlabotajā līmenī:'],
      bullets: [
        'Apakšpikselis: sadala katru moduli apakšpikseļos, lai iegūtu detalizētāku informāciju.',
        'Blue Noise: izmanto zilo trokšņu atdalīšanu modeļiem bez artefaktiem.',
        'Mozaīka: uz flīzēm balstīts efekts, kas saglabā attēla struktūru.',
        'Gap Fill: ievieto attēlu spraugās starp moduļiem.',
        'Spilgtums: maina moduļa izmēru atkarībā no attēla spilgtuma.',
        'Duotone: attēlo attēlu divās krāsās, lai radītu pārsteidzošu kontrastu.',
      ],
    },
    {
      heading: 'Pārklājuma intensitāte',
      paragraphs: [
        'Kontrolē, cik spēcīgi pārklājums ietekmē QR kodu (0–100%). Augstākas vērtības parāda vairāk attēla detaļu, bet var samazināt skenējamību. Sāciet aptuveni 70% un pielāgojiet, pamatojoties uz testēšanu.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Krāsu režīms',
      paragraphs: ['Kā tiek apstrādāts pārklājuma attēls:'],
      bullets: [
        'Pilna krāsa: saglabā sākotnējās attēla krāsas.',
        'Pelēktoņi: pārvērš melnbaltos toņos.',
        'Melnbalts: augsta kontrasta binārā konvertēšana.',
      ],
    },
    {
      heading: 'Saglabājiet meklētāja modeļus',
      paragraphs: [
        'Kad tas ir iespējots, pārklājums negroza trīs stūra meklētāja modeļus. Stingri ieteicams uzticamai skenēšanai.',
      ],
    },
    {
      heading: 'Attēla pirmapstrāde',
      paragraphs: [
        'Pirms sapludināšanas izmantojiet pārklājuma attēlam filtrus. Šīs korekcijas var uzlabot attēla izskatu gala QR kodā.',
      ],
      bullets: [
        'Spilgtums (-100 līdz +100): padariet attēlu gaišāku vai tumšāku.',
        'Kontrasts (-100 līdz +100): palielināt vai samazināt toņu diapazonu.',
        'Gamma (0,2 līdz 3,0): nelineāra spilgtuma regulēšana. Vērtības, kas ir zemākas par 1, padara vidējos toņus gaišākus, bet virs 1 tos padara tumšākus.',
        'Piesātinājums (no -100 līdz +100): krāsas intensitāte. -100 ir pelēktoņu, +100 ir pārsātināts.',
        'Nokrāsu pagriešana (0–360°): pārbīdiet visas krāsas ap krāsu apli.',
        'Aizmiglojums (0–20 pikseļi): mīkstina attēla detaļas.',
        'Asināt (0–100%): uzlabojiet malas un detaļas.',
        'Posterize (0–16 līmeņi): samaziniet krāsu līmeņus, lai iegūtu plakāta efektu.',
        'Slieksnis (0–255): pārveido par bināru melnu/baltu robežpunktā.',
        'Malu noteikšana: Sobel vai Canny algoritmi, lai parādītu tikai malas.',
        'Invertēt: apgriezt visas krāsas.',
      ],
    },
    {
      heading: 'Fit Mode',
      paragraphs: ['Kā pārklājuma attēls atbilst QR koda apgabalam:'],
      bullets: [
        'Vāks: attēls aizpilda visu laukumu, apgriežot, ja nepieciešams.',
        'Satur: redzams viss attēls, var būt piemales.',
        'Izstiept: attēls tiek kropļots, lai to aizpildītu precīzi.',
      ],
    },
    {
      heading: 'Pārveidošanas opcijas',
      paragraphs: [
        'Pagriešana: pagrieziet pārklājumu ar soli 90°.',
        'Apvērst X/Y: spoguļojiet attēlu horizontāli vai vertikāli.',
      ],
    },
    {
      heading: 'Atdalīšanas algoritmi',
      paragraphs: [
        'Atdalīšana pārvērš nepārtrauktu toņu attēlus modeļos, ko var attēlot QR kodi. Pieejams, ja tiek izmantots sajaukšanas režīms, Blue Noise vai True Dither.',
      ],
      bullets: [
        'Kļūdu izplatība: klasisks Floida-Šteinberga stils. Izplata kvantēšanas kļūdu blakus esošajiem pikseļiem.',
        'Pasūtīts (Bayer): izmanto sliekšņa matricu parastajiem modeļiem.',
        'Sagrupēts punkts: simulē pustoņu drukāšanu.',
        'Tukšums un klasteris: optimizēta pasūtīta dīrāšana.',
        'Zils troksnis: vizuāli patīkams nejauša izskata raksts.',
        'Blue Noise Threshold: sliekšņa slieksnis ar zilu trokšņu tekstūru.',
        'Baltais troksnis: nejauša sliekšņa izkliedēšana.',
        'Gausa/trīsstūrveida troksnis: troksnis ar dažādu sadalījumu.',
        'Blue Noise + Error Diffusion: hibrīds, kas apvieno abas metodes.',
        'Ekrāns zils troksnis: ekrānam līdzīgs zils troksnis.',
        'Uztveres: Spožums svērts labākiem vizuāliem rezultātiem.',
        'Edge-Aware: saglabā attēla malas šķelšanās laikā.',
        'Adaptīvais slieksnis: lokāli adaptīvs slieksnis.',
        'Īslaicīgs zils troksnis: animētiem GIF attēli katram kadram atšķiras.',
      ],
    },
    {
      heading: 'Difūzijas kodoli',
      paragraphs: ['Izmantojot kļūdu izkliedes izkliedēšanu, izvēlieties kļūdu sadales veidu:'],
      bullets: [
        'Floids-Šteinbergs: klasiska 4 kaimiņu difūzija. Laba vispārējā izvēle.',
        'Jarvis-Judice-Ninke: 12-kaimiņš, gludāks, bet lēnāks.',
        'Stucki: Līdzīgi kā JJN ar dažādu svaru.',
        'Bērkss: vienkāršots JJN, ātrāk.',
        'Sierra: kodolu saime, kas līdzsvaro kvalitāti un ātrumu.',
        'Atkinsons: Gaismas difūzija, saglabā detaļas, bet var būt graudaina.',
      ],
    },
    {
      heading: 'Dither Strength',
      paragraphs: [
        'Kontrolē, cik daudz tiek pielietota izspiešana (0–100%). Zemākas vērtības saglabā vairāk sākotnējā raksta, augstākas vērtības parāda vairāk attēla detaļu.',
      ],
    },
    {
      heading: 'Apakšpikseļu iestatījumi',
      paragraphs: ['Izmantojot apakšpikseļu sajaukšanas režīmu:'],
      bullets: [
        'Režģa izmērs: 2 × 2, 3 × 3 vai 4 × 4 apakšpikseļi vienam modulim. Augstāks = sīkāka informācija.',
        'Centra noteikums: Stingrajam modulim ir nepieciešams centrālais apakšpikselis. Pustoņu centrs pieļauj variācijas.',
        'Neitrāla krāsa: krāsa, ko izmanto nenoteiktiem apakšpikseļiem.',
        'Finder ignorēšana: kā tiek renderēti meklētāja raksti (vienmērīgi vai stilizēti).',
      ],
    },
    {
      heading: 'Pustoņu iestatījumi',
      paragraphs: ['Izmantojot pustoņu sajaukšanas režīmu:'],
      bullets: [
        'Šūnas lielums: katram modulim vai N × N režģim.',
        'Punkta forma: aplis, kvadrāts vai līnija.',
        'Spilgtuma līkne: lineāra, S-līkne vai gamma.',
      ],
    },
    {
      heading: 'Duotone krāsas',
      paragraphs: [
        'Izmantojot Duotone sajaukšanas režīmu, iestatiet Shadow color (tumšie apgabali) un Highlight color (spilgti apgabali).',
      ],
    },
    {
      heading: 'GIF animācijas iestatījumi',
      paragraphs: ['Izmantojot animētus GIF pārklājumus:'],
      bullets: [
        'Izmantojiet kadru aizkavi: ievērojiet sākotnējo GIF laiku.',
        'Max FPS: ierobežojiet kadru ātrumu (1–60 kadri sekundē).',
        'Apstrāde ar utilizāciju: ievērojiet vai vienkāršojiet rāmja likvidēšanas metodes.',
      ],
    },
    {
      heading: 'Papildu renderēšanas opcijas',
      paragraphs: ['Papildu renderēšanas vadīklas:'],
      bullets: [
        'Atstarpes režīms: Nav, Inset, Stroke vai Negative space Gap stils.',
        'Stūra rādiuss: noapaļoto stūru procentuālā daļa moduļiem.',
        'Gradients: nav, lineārs, radiāls vai konisks gradients moduļos.',
        'Acu ārējais/iekšējais stils: neatkarīgs stils meklētāja raksta gredzeniem.',
        'Punktu pagriešana: pagrieziet dimanta/punktu moduļus.',
        'Eye Scale: izmēra pielāgošana meklētāja modeļiem.',
        'Rāmja stils: pievienojiet dekoratīvos rāmjus (noapaļots rāmis, uzlīme, etiķete).',
        'Rāmja teksts: pievienojiet tekstu, piemēram, "Skenēt mani!" uz rāmjiem.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Uzlabots QR kodējums',
      paragraphs: ['Precizējiet QR kodējumu:'],
      bullets: [
        'Kodēšanas režīms: automātisks, ciparu, burtciparu, baitu/UTF-8 vai kanji.',
        'Ieviest minimālo kluso zonu: nodrošiniet vismaz 4 moduļu rezervi.',
        'Maskas modelis: automātiski (optimāls) vai manuāli atlasiet modeļus 0-7, lai kontrolētu moduļa sadalījumu. Dažādi modeļi rada atšķirīgu vizuālo izskatu, vienlaikus kodējot vienus un tos pašus datus.',
        'Rakstzīmju kodējums: ISO-8859-1 (noklusējums latīņu 1), UTF-8 (pilns Unicode, ieskaitot emocijzīmes) vai Shift-JIS (japāņu valodā). Izvēlieties, pamatojoties uz satura rakstura prasībām.',
      ],
    },
    {
      heading: 'Papildu izvades opcijas',
      paragraphs: ['Papildu eksportēšanas iestatījumi:'],
      bullets: [
        'Faila nosaukums: pielāgots faila nosaukums lejupielādēm.',
        'GIF paletes izmērs: 2–256 krāsas GIF izvadē.',
        'GIF kvantētājs: vidējais griezums, NeuQuant vai Octree krāsu samazināšana.',
        'GIF izkliedēšana: izslēgts, Floyd-Steinberg vai pasūtīts.',
        'GIF caurspīdīga krāsa: iestatiet caurspīdīgu krāsu.',
        'SVG True Vector: izmantojiet ceļus, nevis iegulto rastru.',
        'SVG formas precizitāte: pikseļu vai precīza ceļa renderēšana.',
        'SVG iegulšanas rastra pārklājums: iekļaujiet pārklājumu kā iegulto attēlu.',
        'Fona ignorēšana: piespiediet izvadē noteiktu fona krāsu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Validācijas opcijas',
      paragraphs: ['Ievades apstrādes iestatījumi:'],
      bullets: [
        'Apstiprināt ievadi: pirms kodēšanas pārbaudiet satura formātu.',
        'Apgriezt atstarpi: noņemiet sākuma/beigu atstarpes.',
        'Normalizēt rindiņas: pārveidojiet visas rindu beigas par LF.',
        'Max Length Guard: brīdināt, ja saturs pārsniedz QR ietilpību.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Profesionālās īpašības',
      paragraphs: [
        'Profesionālajā līmenī tiek pievienotas ūdenszīmes, metadati, koplietošanas iespējas, drošības analīze, maksājumu QR kodi un uzņēmuma funkcijas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ūdenszīme',
      paragraphs: ['Pievienojiet ūdenszīmes saviem QR kodiem:'],
      bullets: [
        'Veids: teksts, attēls vai raksta ūdenszīme.',
        'Pozīcija: centrs, stūri, malas, aizmugure vai klusā zona.',
        'Necaurredzamība: ūdenszīmes caurspīdīgums (0-100%).',
        'Sajaukšanas režīms: parastā, reizināšanas, ekrāna vai pārklājuma sajaukšana.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadati',
      paragraphs: ['Iegult metadatus eksportētajos failos:'],
      bullets: [
        'Lauki Nosaukums, Autors, Autortiesības, Licence, Apraksts.',
        'Izveidošanas laiks: iegult ģenerēšanas laikspiedolu.',
        'Pielāgota atslēgas vērtība: pievienojiet patvaļīgus metadatu pārus.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kopīgošana',
      paragraphs: ['Kopīgojiet savas QR koda konfigurācijas:'],
      bullets: [
        'Tiešā saite: ģenerējiet kopīgojamu URL, izmantojot pašreizējos iestatījumus.',
        'Iegult HTML: iegūstiet vietņu iegulšanas kodu.',
        'Kodēt parametrus: iekļaujiet visus iestatījumus kopīgošanas URL.',
        'Piezīme. Pārklājuma attēlus no vietējiem failiem nevar kopīgot, izmantojot URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Drošības analīze',
      paragraphs: ['Pārliecinieties, vai QR kodi joprojām ir skenējami:'],
      bullets: [
        'Drošais režīms: Izslēgts, Līdzsvarots vai Stingras skenēšanas prasības.',
        'Minimālais moduļa izmērs: minimālais pikseļu izmērs vienam modulim.',
        'Minimālā klusā zona: minimālās piemales moduļi.',
        'Bloķēšanas meklētāji/Laiks/Līdzināšana/Formāts/Versija: aizsargājiet konkrētus elementus.',
        'Maksimālā pārklājuma intensitāte, izmantojot ECC: automātiskie intensitātes ierobežojumi, pamatojoties uz kļūdu labošanas līmeni.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Satura veidi (profesionāls)',
      paragraphs: ['Profesionālā līmenī tiek pievienoti maksājumu un uzņēmuma satura veidi:'],
      bullets: [
        'EPC/SEPA (ES): Eiropas bankas pārskaitījuma QR kodi ar IBAN, BIC, summu, atsauci.',
        'UPI (Indija): vienota maksājumu saskarne ar VPA, maksājuma saņēmēja vārds, summa.',
        'PayNow (Singapūra): Singapūras ātrs maksājums ar UEN vai mobilā tālruņa numuru.',
        'PromptPay (Taizeme): Taizemes valsts maksājumu sistēma.',
        'PIX (Brazīlija): Brazīlijas tūlītējais maksājums ar PIX atslēgu.',
        'Kripto: Bitcoin, Ethereum, Litecoin maksājumu adreses ar neobligātu summu.',
        'Mārketinga kampaņas saite: URL ar pilnu UTM parametru (mārketinga tagu) izsekošanu.',
        'Īsā saite: izmantošanai ar URL saīsinātājiem dinamiskiem/izsekojamiem QR kodiem.',
        'GS1 digitālā saite: produkta identifikācija ar GTVN, sērija, partija, derīguma termiņš.',
        'Lietotnes dziļā saite: iOS/Android lietotņu dziļās saites ar pielāgotām shēmām.',
        'Pielāgots formāts: neapstrādāti dati bez formatējuma vai validācijas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Valodai atbilstoši maksājumi uzlabotajā režīmā',
      paragraphs: [
        'Izmantojot uzlaboto režīmu, ANQR automātiski parāda jūsu izvēlētajai valodai atbilstošās maksājuma metodes. Piemēram, Vjetnamas lietotāji redz VietQR, taju lietotāji redz PromptPay, savukārt Indijas valodas lietotāji redz UPI un BharatQR. Globālās maksājumu metodes (kriptovalūta, PayPal, Cash App) ir pieejamas visās valodās. Profesionālais režīms atbloķē visus maksājumu standartus neatkarīgi no valodas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Eiropas maksājumu standarti',
      bullets: [
        'EPC/SEPA (ES): Eiropas bankas pārveduma QR kodi, kas atbilst EPC QR Code standartam. Atbalsta IBAN, BIC (pēc izvēles iekšzemes), summu EUR un strukturētu vai nestrukturētu maksājumu atsauces. Izmanto visā SEPA zonā, tostarp ES valstīs, kā arī Šveicē, Norvēģijā, Islandē, Lihtenšteinā, Monako un Sanmarīno.',
        'Šveices QR-rēķins: Šveices maksājumu standarts, kas atbilst SIX ieviešanas vadlīnijām. Atbalsta CHF un EUR, QR atsauci (QRR), kreditora atsauci (ISO 11649), strukturētas kreditoru/debitoru adreses un rēķina informāciju. Nepieciešams Šveices rēķiniem kopš 2022. gada.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indijas maksājumu standarti',
      bullets: [
        'UPI (Indija): vienotā maksājumu saskarne, kas atbilst NPCI dziļās saites specifikācijai. Atbalsta VPA (virtuālo maksājumu adresi), maksājuma saņēmēja vārdu, summu INR, darījuma piezīmi, atsauces ID, tirgotāja kategorijas kodu un darījuma režīmu.',
        'BharatQR (Indija): vienots QR standarts, kas atbalsta gan UPI, gan karšu maksājumus. Apvieno UPI VPA ar kartes PAN, lai nodrošinātu maksimālu saderību. Ietver tirgotāja nosaukumu, pilsētu, KC, GST informāciju un rēķinu/atsauces numurus.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Dienvidaustrumāzijas maksājumu standarti',
      bullets: [
        'PayNow (Singapūra): Singapūras ātro maksājumu sistēma, izmantojot EMVCo QR specifikāciju ar SGQR profilu. Atbalsta UEN (uzņēmuma reģistrāciju), mobilā tālruņa numuru vai NRIC kā starpniekservera identifikatorus. Ietver summas rediģējamības karogu un derīguma termiņu.',
        'PromptPay (Taizeme): Taizemes valsts maksājumu sistēma, kas atbilst Bank of Thailand EMV profilam. Atbalsta mobilā tālruņa numuru, valsts ID, nodokļu ID, e-maka ID un rēķinu apmaksu ar vairākiem atsauces laukiem.',
        'QRIS (Indonēzija): ātrās atbildes kods Indonēzijas standarts. Uz EMV balstīts valsts maksājumu standarts atbalsta tirgotāja ID, NMID (National Merchant ID), tirgotāja kritēriju klasifikāciju un ērtību maksas (fiksētas vai procentuālas).',
        'DuitNow (Malaizija): Malaizijas tūlītējo maksājumu sistēma. Atbalsta vairākus starpniekservera veidus, tostarp NRIC, mobilo sakaru, pases, armijas ID un uzņēmuma reģistrācijas numurus.',
        'VietQR (Vjetnama): Vjetnamas starpbanku pārskaitījumu standarts. Nepieciešams bankas BIN (NAPAS identifikācija) un konta numurs. Atbalsta vairākus pakalpojumu kodus dažādiem pārsūtīšanas veidiem (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipīnas): Filipīnu QR maksājumu standarts InstaPay un PESONet. Izmanto kontu numurus ar tirgotāja identifikāciju P2M (personas–tirgotāja) darījumiem.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Austrumāzijas maksājumu standarti',
      bullets: [
        'TWQR (Taivāna): Taivānas QR maksājumu standarts. Atbalsta tirgotāja ID, nodokļu ID un TWD summas.',
        'HKQR/FPS (Honkonga): Honkongas ātrāko maksājumu sistēmas QR kodi. Atbalsta FPS ID, mobilā tālruņa numuru vai e-pastu kā maksājumu identifikatorus. Summas HKD.',
        'JPQR (Japāna): Japānas vienotais QR koda maksājumu standarts. Tirgotāja identifikācijai ar JPY summām tiek izmantots veikala ID.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Citi reģionālie maksājumu standarti',
      bullets: [
        'PIX (Brazīlija): Brazīlijas Centrālās bankas tūlītējo maksājumu sistēma saskaņā ar BR koda specifikāciju. Atbalsta PIX atslēgas (CPF, CNPJ, e-pasta, tālruņa vai izlases atslēgas), tirgotāja nosaukumu/pilsētu, darījuma ID un BRL summas.',
        'AusPayNet/NPP PayID (Austrālija): Austrālijas jaunās maksājumu platformas PayID sistēma. Atbalsta PayID veidus (e-pasts, mobilais, ABN, organizācijas ID) vai tradicionālo BSB + konta numuru. Tirgotāja nosaukums nav obligāts, jo maksātāji redz reģistrēto nosaukumu no AES uzmeklēšanas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kriptovalūtas maksājumi',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): standarta kriptovalūtas maksājumu URI ar maka adresi, neobligātu summu un etiķeti. Savietojams ar visiem lielākajiem Bitcoin un Litecoin makiem.',
        'Lightning Network (BOLT11): Lightning Network maksājumu rēķini. Ielīmējiet BOLT11 kodētu rēķinu virkni tūlītējiem Bitcoin maksājumiem ar minimālu maksu.',
        'Ethereum (EIP-681): Ethereum darījumu pieprasījuma URI, kas atbalsta vietējos ETH pārsūtīšanu un ERC-20 marķiera pārsūtīšanu. Ietver ķēdes ID vairāku tīklu atbalstam (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gāzes parametriem un līguma funkciju izsaukumiem.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Maksājumu saišu pakalpojumi',
      bullets: [
        'PayPal.Me: PayPal maksājumu saites ar lietotājvārdu un pēc izvēles iepriekš aizpildītu summu. Saņēmēji var maksāt, izmantojot PayPal bilanci, kartes vai bankas kontus.',
        'Cash App: Cash App maksājumu saites, izmantojot $cashtag ar neobligātu summu. Savienotajās Valstīs populāri vienādranga maksājumi.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vispārējs EMV QR',
      bullets: [
        'EMV Generic: izveidojiet pielāgotus EMV tirgotāja piedāvātā režīma QR kodus maksājumu shēmām, kas nav īpaši norādītas. Konfigurējiet tirgotāja nosaukumu, pilsētu, valsts kodu (ISO 3166-1), valūtas kodu (ISO 4217 ciparu), KC, dzeramnaudas/ērtību maksas iespējas un papildu datu laukus. Noderīga testēšanai vai pielāgotai integrācijai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Pārklājuma sajaukšanas režīmi (profesionāli)',
      paragraphs: ['Papildu sajaukšanas režīmi profesionālajā līmenī:'],
      bullets: [
        'Pixelate: pikseļu pārklājuma efekts.',
        'Kontūra: malu noteikšanas pārklājums, kas parāda tikai kontūras.',
        'Vilnis: Viļņveida kropļojuma efekts.',
        'Apakšpikseļu lielums: mainīgs apakšpikseļu lielums, pamatojoties uz attēlu.',
        'True Dither: uzlabota dithering ar sakārtotu matricas izvēli.',
        'Ekstrēmi: maksimāla attēla redzamība, var ietekmēt skenējamību.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Aizsardzības iestatījumi',
      paragraphs: [
        'Precīza kontrole pār to, kuri QR elementi ir aizsargāti pret pārklājuma izmaiņām:',
      ],
      bullets: [
        'Saglabāt laiku: saglabājiet laika noteikšanas modeļus nemainīgus.',
        'Saglabāt līdzinājumu: saglabājiet izlīdzināšanas modeļus nemainīgus.',
        'Aizsargāt formāta informāciju: vairoga formāta informācijas moduļi.',
        'Protect Version Info: Aizsargājiet versijas informācijas moduļus.',
      ],
    },
    {
      heading: 'ECC apzinās režīms',
      paragraphs: [
        'Gudri sadala pārklājuma intensitāti, pamatojoties uz kļūdu labošanas spēju. Sistēma analizē, kurus moduļus var modificēt, vienlaikus saglabājot skenējamību.',
      ],
      bullets: [
        'Riska budžets: izmantotās kļūdu labošanas jaudas procentuālā daļa (0–100%).',
        'Lielāks budžets = redzamāks pārklājums, bet riskantāka skenējamība.',
        'Mazāks budžets = drošāka skenēšana, bet mazāk redzams pārklājums.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Profesionālas renderēšanas iespējas',
      paragraphs: ['Papildu renderēšanas vadīklas:'],
      bullets: [
        'Krasas malas: izmantojiet pikseļu attēlu renderēšanu, lai moduļa malas būtu asas.',
        'Pixel Snap: grīdas, apaļas vai griestu pikseļu izlīdzināšana.',
        'Krāsu režīms katram modulim: vienkrāsains, pēc spilgtuma, pēc pozīcijas, pēc pārklājuma, pēc kopas.',
        'Krāsu palete: definējiet pielāgotu krāsu paleti katra moduļa krāsošanai.',
        'Kontrasta aizsardzība: nodrošiniet minimālu kontrasta attiecību starp krāsām.',
        'Minimālais kontrasta koeficients: WCAG stila kontrasta prasība (1:1 līdz 21:1).',
        'Papildu robežas moduļi: papildu robeža ārpus klusās zonas.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Profesionālās izvades opcijas',
      paragraphs: ['Uzņēmuma eksporta iestatījumi:'],
      bullets: [
        'DPI: iestatiet drukas izšķirtspēju (72–600 DPI). Drukāšanai ieteicams 300 DPI.',
        'Iekļaut kluso zonu: pārslēgt kluso zonu izvades izmēros.',
        'Eksportēt kā papildu: ģenerējiet PDF kopā ar primāro formātu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Animācijas iestatījumi (profesionāli)',
      paragraphs: ['Papildu profesionālās animācijas funkcijas:'],
      bullets: [
        'Temporal Dither: Izslēgts, Blue Noise vai Mirgošanās drošs kadram.',
        'Raksts: nav, pulsa, viļņa, skenēšanas, mirdzuma vai novirzes efekti.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API atsauce',
      paragraphs: [
        'ANQR nodrošina servera puses API QR kodu ģenerēšanai, izmantojot URL parametrus. Tas ir ideāli piemērots QR kodu iegulšanai vietnēs, e-pastos, dokumentos vai automatizētās darbplūsmās bez klienta puses JavaScript.',
        'Pamata URL: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Skatiet QR piemērus', type: 'example' }],
    },
    {
      heading: 'Pamatparametri',
      paragraphs: ['Nepieciešamie un izplatītie parametri (parametru nosaukumi netiek tulkoti):'],
      bullets: [
        'dati (obligāti): saturs, ko iekodēt QR kodā. URL kodēt speciālās rakstzīmes.',
        'izmērs: attēla izmērs pikseļos (noklusējums: 400, maks.: 2000). Izmanto, ja w/h nav norādīts.',
        'w, h: izvades platums un augstums pikseļos. Ignorē izmēra parametru.',
        'formāts: izvades formāts — png, webp vai gif (noklusējums: png).',
        'ec: kļūdu labošanas līmenis — L, M, Q vai H (noklusējums: H).',
        'fg: priekšplāna krāsa kā hex bez # (noklusējums: 000000).',
        'bg: fona krāsa kā hex bez # (noklusējums: ffffff).',
        'caurspīdīgs: iestatiet uz 1 caurspīdīgam fonam.',
        'margin: Klusā zona moduļos (noklusējums: 4).',
      ],
    },
    {
      heading: 'Stila parametri',
      paragraphs: ['Moduļa un modeļa stils:'],
      bullets: [
        'stils: moduļa stils - kvadrātveida, noapaļots, punktiņi, rombs, savienots.',
        'Finder: Finder raksta stils - kvadrāts, noapaļots, aplis.',
        'līdzināšana: līdzinājuma raksta stils — match_finder, kvadrāts, noapaļots, aplis.',
        'laiks: laika shēmas stils — match_module, vienkrāsains, pārtraukts.',
        'rādiuss: Stūra rādiusa procenti 0-100.',
        'sprauga: moduļa atstarpes procents 0–50.',
        'gapMode: atstarpes režīms — nav, ielaidums, gājiens, negatīvā_atstarpe.',
        'eyeOuter, eyeInner: Acu stili – kvadrātveida, noapaļotas, aplis.',
        'eyeScale: acu skalas procentuālais daudzums (noklusējums: 100).',
        'grad: Gradienta veids - nav, lineārs, radiāls, konisks.',
        'gradAngle: gradienta leņķis lineāriem gradientiem.',
        'gradStops: gradienta apstājas kā color1,pos1,color2,pos2,... (piemēram, ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Pārklājuma parametri',
      paragraphs: ['Attēla pārklājuma opcijas (pārklājuma attēls tiek ielādēts servera pusē):'],
      bullets: [
        'img: URL pārklājuma attēlam (jābūt publiski pieejamam).',
        'režīms: pārklājuma režīms - centrs, pustoņi, sajaukums, spilgtums, mozaīka, krāsots, zils troksnis, apakšpikseļi.',
        'intensitāte: pārklājuma intensitāte 0–100 (noklusējums: 100).',
        'colorMode: pārklājuma krāsu režīms - krāsa, pelēktoņu, bw.',
        'Fiksēt: Kā pārklājums der — pārklāj, satur, izstiep.',
        'puve: pārklājuma rotācija grādos.',
        'flipX, flipY: iestatiet uz 1, lai apvērstu pārklājumu.',
        'keepFinders: saglabā meklētāja modeļus (noklusējums: 1).',
        'KeepTiming, keepAlign: iestatiet uz 1, lai saglabātu laika/līdzināšanas modeļus.',
      ],
    },
    {
      heading: 'Priekšapstrādes parametri',
      paragraphs: ['Pārklājumam lietota attēla priekšapstrāde:'],
      bullets: [
        'spilgtums: pielāgošana no -100 līdz 100 (noklusējums: 0).',
        'kontrasts: pielāgošana no -100 līdz 100 (noklusējums: 0).',
        'gamma: vērtība no 0,1 līdz 3 (noklusējums: 1).',
        'piesātinājums: pielāgošana no -100 līdz 100 (noklusējums: 0).',
        'nokrāsa: nokrāsas rotācija grādos.',
        'izplūšana: izplūšana pikseļos.',
        'asināt: asināšanas apjoms 0-100.',
        'plakāts: plakātu līmeņi.',
        'slieksnis: binārais slieksnis 0-255.',
        'mala: malu noteikšana - izslēgta, sobel, gudrs.',
        'invert: iestatiet uz 1, lai apgrieztu krāsas.',
      ],
    },
    {
      heading: 'Ūdenszīmes parametri',
      paragraphs: ['Pievienojiet ģenerētajiem QR kodiem ūdenszīmes:'],
      bullets: [
        'wmEn: iestatiet uz 1, lai iespējotu ūdenszīmi.',
        'wmKind: Ūdenszīmes veids - teksts, attēls, raksts.',
        'wmText: ūdenszīmes teksts (kodēts URL).',
        'wmImg: URL uz ūdenszīmes attēlu.',
        'wmPos: pozīcija - centrs, stūri, malas, aizmugure, klusā zona.',
        'wmNecaurredzamība: necaurredzamība 0–100 (noklusējums: 50).',
        'wmBlend: Sajaukšanas režīms - normāls, reizināšana, ekrāns, pārklājums.',
      ],
    },
    {
      heading: 'Animācijas parametri',
      paragraphs: ['Animētai GIF izvadei (nepieciešams format=gif):'],
      bullets: [
        'animPattern: animācijas raksts — nav, pulss, vilnis, skenēšanas līnija, mirgošana, novirze, krāsu_cikls.',
        'animFrames: kadru skaits 1–60 (noklusējums: 24).',
        'animSpeed: kadra aizkave milisekundēs 10–1000 (noklusējums: 100).',
        'animSeed: izlases sēkla animācijai.',
        'atvieglošana: Animācijas atvieglošana — lineāra, viegla_ieeja, viegla_izeja, viegla_ieeja, atlēciens.',
      ],
    },
    {
      heading: 'Izvades parametri',
      paragraphs: ['Izvades formāta opcijas:'],
      bullets: [
        'kvalitāte: WebP kvalitāte 0-1 (noklusējums: 0,9).',
        'webpQ: WebP kvalitāte 0–100 (noklusējums: 90).',
        'gifColors: GIF paletes izmērs 2–256 (noklusējums: 256).',
        'dpi: izvades DPI PNG (noklusējums: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: PNG metadatu lauki.',
      ],
    },
    {
      heading: 'Lietošanas piemērs',
      paragraphs: [
        'Pamata QR kods:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Stilizēts QR kods ar pielāgotām krāsām:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'QR kods ar pārklājuma attēlu:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'Animēts GIF:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Skatiet QR piemērus', type: 'example' }],
    },
    {
      heading: 'QR kodu iegulšana',
      paragraphs: [
        'Profesionālajā režīmā koplietošanas funkcija ģenerē iegulto HTML un URL. Lūk, kā darbojas iegulšana:',
      ],
      bullets: [
        'Kopīgot saiti: izveido vietrādi URL uz ANQR lietotni ar visiem jūsu iestatījumiem, kas tiek kodēti kā URL parametri. Adresāti var apskatīt un modificēt QR kodu.',
        'Iegult attēlu: ģenerē tagu <img>, kas norāda uz servera API. QR kods tiek renderēts servera pusē un tiek pasniegts kā attēls.',
        'Iegult Markdown: izveido Markdown attēla sintakse dokumentācijai un README failiem.',
        'Tiešais API URL: neapstrādāts API URL izmantošanai lietojumprogrammās, skriptos vai citās integrācijās.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML piemērs',
      paragraphs: [
        'Lai savā vietnē iegultu QR kodu:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR kods" />',
        'Adaptīvai izmēra noteikšanai:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR kods" style="maksimālais platums: 100%; augstums: auto;" />',
        'Serveris kešatmiņā saglabā atbildes ar garām kešatmiņas galvenēm, tāpēc atkārtoti pieprasījumi par vienu un to pašu URL ir ātri.',
      ],
    },
    {
      heading: 'Kopīgot URL formātu',
      paragraphs: [
        'Noklikšķinot uz Kopīgot profesionālajā režīmā, ANQR kodē jūsu pašreizējos iestatījumus URL parametros. Formāts ir:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Šie parametri atspoguļo API parametrus, lai jūs varētu pārvērst koplietošanas URL par API URL, mainot bāzes ceļu no / uz /api/qr un pielāgojot w/h parametrus pēc vajadzības.',
        'Piezīme. Pārklājuma attēlus, kas augšupielādēti no vietējiem failiem, nevar kopīgot, izmantojot URL — tikai uz URL balstīti pārklājumi (img parametrs) darbojas koplietotajās saitēs un API izsaukumos.',
      ],
    },
    {
      heading: 'Likmes ierobežojumi un lietojums',
      paragraphs: [
        'API var bez maksas izmantot saprātīgiem apjomiem. Liela apjoma lietošanai vai komerciālām lietojumprogrammām, kurām nepieciešams garantēts darbības laiks, lūdzu, sazinieties ar mums.',
        'API atbildes ietver agresīvas kešatmiņas galvenes. Lai nodrošinātu vislabāko veiktspēju, saglabājiet atbildes kešatmiņā vai konsekventi izmantojiet vienu un to pašu URL identiskiem QR kodiem.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Labākā prakse',
      paragraphs: ['Follow these guidelines for reliable QR codes:'],
      bullets: [
        'Pirms drukāšanas vienmēr pārbaudiet QR kodus, izmantojot vairākas skenera lietotnes.',
        'Pievienojot pārklājumus, izmantojiet kļūdu labojumu H (augsta).',
        'Keep at least 4 modules of quiet zone (margin).',
        'Nodrošiniet augstu kontrastu starp priekšplānu un fonu.',
        'Drukāšanai izmantojiet vismaz 300 DPI un pārbaudiet faktisko drukas izmēru.',
        'Iespējot Preserve Finder Patterns, kad izmantojat pārklājumus.',
        'Sāciet ar zemāku pārklājuma intensitāti un pakāpeniski palieliniet.',
        'Lietojot ārpus telpām, apsveriet lielākus moduļu izmērus un lielāku kļūdu labošanu.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Pārlūkot Uzziniet rakstus', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Skatiet QR piemērus', type: 'example' },
      ],
    },
    {
      heading: 'Problēmu novēršana',
      paragraphs: ['Biežākās problēmas un risinājumi:'],
      bullets: [
        'QR neskenēs: samaziniet pārklājuma intensitāti, palieliniet kļūdu labošanu, pārbaudiet kontrastu.',
        'Kods ir pārāk liels: samaziniet satura garumu, izmantojiet URL saīsinātāju, zemāku versiju.',
        'Neskaidra izvade: palieliniet moduļa izmēru, izmantojiet PNG, nevis saspiestus formātus.',
        'Krāsas izskatās nepareizi: pārbaudiet krāsu kontrastu, izmēģiniet pelēktoņu pārklājuma režīmu.',
        'GIF nav animēts: izmantojiet GIF formāta izvadi, pārbaudiet kadru skaitu.',
        'Attēla pārklājums netiek ielādēts: pārbaudiet CORS atļaujas attāliem attēliem.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Skatiet saistītās rokasgrāmatas un piemērus',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Tastatūras īsinājumtaustiņi',
      paragraphs: [
        'ANQR atbalsta standarta īsinājumtaustiņus. Izmantojiet taustiņu kombināciju Ctrl/Cmd+S, lai aktivizētu eksportēšanu (kad fokusēts uz priekšskatījumu).',
      ],
    },
    {
      heading: 'Kopīgošana un iegulšana',
      paragraphs: [
        'Profesionālajā režīmā noklikšķiniet uz pogas Kopīgot, lai kopētu URL ar pašreizējiem iestatījumiem. Adresāti var atvērt šo URL, lai redzētu precīzu jūsu konfigurāciju. Piezīme. Pārklājuma attēlus no vietējiem failiem nevar kopīgot, izmantojot URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Izmēģiniet šo konfigurāciju tieši ANQR ģeneratorā.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Pārlūkot Uzziniet rakstus', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Skatiet QR piemērus', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Skatiet QR piemērus', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Atveriet ģeneratoru', type: 'generator' },
  ],
};

export default guide;
