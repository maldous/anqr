import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontaktirajte nas',
  description: 'Pozdravljamo povratne informacije, poročila o napakah, zahteve po funkcijah in splošna vprašanja.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Kako do nas',
      paragraphs: ['Glede na vaše potrebe ponujamo več načinov za stik z nami. Preberemo vsako sporočilo, čeprav se odzivni časi lahko razlikujejo glede na obseg in vrsto poizvedbe.'],
    },
    {
      heading: 'E-pošta',
      paragraphs: ['Za vsa vprašanja: email@anqr.link', 'To je najbolj zanesljiv način, da pridete do nas in ga priporočamo za podrobna vprašanja, poslovna ali druga vprašanja.'],
    },
    {
      heading: 'Vrste povpraševanj',
      bullets: ['Splošna vprašanja: vprašanja o uporabi ANQR, razlage funkcij ali splošne povratne informacije.', 'Poročila o napakah: vključite svoj brskalnik, operacijski sistem, korake za reprodukcijo in vsa sporočila o napakah, ki jih vidite.', 'Zahteve po funkcijah: predlogi za nove funkcije ali izboljšave. Upoštevamo vse zahteve, vendar ne moremo obljubiti izvedbe.', 'Poslovne poizvedbe: priložnosti za partnerstvo, vprašanja o licenciranju ali poizvedbe o komercialni uporabi.', 'Zahteve glede zasebnosti: Zahteve za uveljavljanje vaših pravic do zasebnosti v skladu z GDPR, CCPA ali drugimi zakoni o zasebnosti (glejte Politiko zasebnosti).', 'DMCA/Avtorske pravice: Glejte spodnji razdelek DMCA za zahteve glede obvestila o odstranitvi.'],
    },
    {
      heading: 'Odzivni časi',
      paragraphs: ['Na povpraševanje želimo odgovoriti v 5-7 delovnih dneh. Zahteve v zvezi z zasebnostjo bomo obravnavali v 30 dneh, kot to zahteva zakon.', 'V obdobjih zasedenosti so lahko odzivni časi daljši. Za nujne zadeve v zadevi označite »NUJNO«.'],
    },
    {
      heading: 'Preden stopite v stik z nami',
      paragraphs: ['Preverite našo stran z dokumentacijo za odgovore na pogosta vprašanja o uporabi funkcij ANQR. Tam je zajetih veliko vprašanj o ustvarjanju kode QR, oblikovanju in možnostih izvoza.'],
    },
    {
      heading: 'Obvestila o avtorskih pravicah DMCA',
      paragraphs: ['Če menite, da vsebina, ki je na voljo na ANQR, krši vaše avtorske pravice, lahko pošljete obvestilo o odstranitvi v skladu z Zakonom o elektronskih avtorskih pravicah (DMCA). Da bi bilo vaše obvestilo veljavno, mora vsebovati:'],
      bullets: ['Fizični ali elektronski podpis lastnika avtorskih pravic ali pooblaščenega zastopnika.', 'Identifikacija avtorsko zaščitenega dela, za katerega trdijo, da so bile kršene.', 'Identifikacija materiala, za katerega se trdi, da krši avtorske pravice, z zadostnimi informacijami za njegovo lociranje.', 'Vaši kontaktni podatki (naslov, telefonska številka in elektronski naslov).', 'Izjava, da v dobri veri verjamete, da uporaba materiala ni dovoljena s strani lastnika avtorskih pravic.', 'Izjava, pod kaznijo za krivo prisego, da so informacije v vašem obvestilu točne in da ste lastnik avtorskih pravic ali pooblaščeni za delovanje v njihovem imenu.'],
    },
    {
      heading: 'Kontakt DMCA',
      paragraphs: ['Obvestila DMCA pošljite na: email@anqr.link', 'V vrstico z zadevo vključite »Obvestilo DMCA«. Na veljavna obvestila se bomo odzvali v skladu z veljavno zakonodajo. Upoštevajte, da ANQR ustvari kode QR lokalno na uporabniških napravah in ne gosti vsebine, ki jo ustvarijo uporabniki.'],
    },
    {
      heading: 'Skupnost Reddit',
      paragraphs: ['Pridružite se naši skupnosti Reddit na r/ANQR, da delite svoje stvaritve QR, postavljate vprašanja, dobite pomoč in se povežete z drugimi uporabniki ANQR.'],
    },
  ],
};

export default contact;
