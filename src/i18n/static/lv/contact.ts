import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const contact: PageDefinition = {
  title: 'Sazinieties ar mums',
  description: 'Mēs atzinīgi vērtējam atsauksmes, kļūdu ziņojumus, funkciju pieprasījumus un vispārīgus jautājumus.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Kā ar mums sazināties',
      paragraphs: ['Mēs piedāvājam vairākus veidus, kā sazināties ar mums atkarībā no jūsu vajadzībām. Mēs lasām katru ziņojumu, lai gan atbildes laiks var atšķirties atkarībā no apjoma un pieprasījuma veida.'],
    },
    {
      heading: 'E-pasts',
      paragraphs: ['Visiem jautājumiem: email@anqr.link', 'Šis ir visdrošākais veids, kā ar mums sazināties, un tas ir ieteicams detalizētu jautājumu, biznesa jautājumu vai citu jautājumu gadījumā.'],
    },
    {
      heading: 'Aptauju veidi',
      bullets: ['Vispārīgi jautājumi: jautājumi par ANQR lietošanu, funkciju skaidrojumi vai vispārīgas atsauksmes.', 'Kļūdu pārskati: lūdzu, iekļaujiet savu pārlūkprogrammu, operētājsistēmu, reproducēšanas darbības un visus redzamos kļūdu ziņojumus.', 'Funkciju pieprasījumi: ierosinājumi jaunām funkcijām vai uzlabojumiem. Mēs izskatām visus pieprasījumus, lai gan nevaram apsolīt īstenošanu.', 'Uzņēmējdarbības jautājumi: partnerības iespējas, jautājumi par licencēšanu vai komerciālas izmantošanas jautājumi.', 'Privātuma pieprasījumi: pieprasījumi izmantot jūsu tiesības uz privātumu saskaņā ar GDPR, CCPA vai citiem privātuma tiesību aktiem (skatiet Privātuma politiku).', 'Digitālās tūkstošgades autortiesības/autortiesības: par noņemšanas paziņojuma prasībām skatiet Digitālās tūkstošgades autortiesību likuma sadaļu tālāk.'],
    },
    {
      heading: 'Atbildes laiki',
      paragraphs: ['Mūsu mērķis ir atbildēt uz jautājumiem 5-7 darba dienu laikā. Ar privātumu saistītie pieprasījumi tiks izskatīti 30 dienu laikā, kā noteikts likumā.', 'Noslogotības periodos atbildes laiks var būt ilgāks. Steidzamos jautājumos, lūdzu, savā temata rindiņā norādiet "STEIDZAMI".'],
    },
    {
      heading: 'Pirms sazināties ar mums',
      paragraphs: ['Lūdzu, skatiet mūsu dokumentācijas lapu, lai iegūtu atbildes uz bieži uzdotajiem jautājumiem par ANQR funkciju izmantošanu. Tajā ir apskatīti daudzi jautājumi par QR koda ģenerēšanu, stilu un eksportēšanas iespējām.'],
    },
    {
      heading: 'DMCA autortiesību paziņojumi',
      paragraphs: ['Ja uzskatāt, ka ANQR pieejamais saturs pārkāpj jūsu autortiesības, varat iesniegt Digitālās tūkstošgades autortiesību likuma (DMCA) noņemšanas paziņojumu. Lai paziņojums būtu derīgs, tajā jāiekļauj:'],
      bullets: ['Autortiesību īpašnieka vai pilnvarotā pārstāvja fiziskais vai elektroniskais paraksts.', 'Ar autortiesībām aizsargātā darba identifikācija, par kuru tiek apgalvots, ka tas ir pārkāpts.', 'Tā materiāla identifikācija, ar kuru tiek apgalvots, ka tiek pārkāptas tiesības, un informācija, kas ir pietiekama, lai to atrastu.', 'Jūsu kontaktinformācija (adrese, tālruņa numurs un e-pasta adrese).', 'Paziņojums, ka jums ir labticīga pārliecība, ka materiāla izmantošanu nav atļāvis autortiesību īpašnieks.', 'Paziņojums par nepatiesas liecības sniegšanu, ka jūsu paziņojumā sniegtā informācija ir precīza un ka esat autortiesību īpašnieks vai pilnvarots rīkoties viņa vārdā.'],
    },
    {
      heading: 'DMCA kontaktpersona',
      paragraphs: ['Sūtiet DMCA paziņojumus uz: email@anqr.link', 'Lūdzu, temata rindiņā iekļaujiet "DMCA paziņojums". Mēs atbildēsim uz derīgiem paziņojumiem saskaņā ar piemērojamiem tiesību aktiem. Ņemiet vērā, ka ANQR ģenerē QR kodus lokāli lietotāju ierīcēs un nemitina lietotāju ģenerētu saturu.'],
    },
    {
      heading: 'Reddit kopiena',
      paragraphs: ['Pievienojieties mūsu Reddit kopienai vietnē r/ANQR, lai kopīgotu savus QR darbus, uzdotu jautājumus, saņemtu palīdzību un sazinātos ar citiem ANQR lietotājiem.'],
    },
  ],
};

export default contact;
