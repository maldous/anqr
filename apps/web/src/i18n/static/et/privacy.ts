import type { PageDefinition } from "../types";

export const privacy: PageDefinition = {
  title: "Privaatsuspoliitika",
  description:
    "Teave, mida ANQR kogub, kuidas seda kasutatakse, ja teie õigused vastavalt kohaldatavatele privaatsusseadustele.",
  lastUpdated: "1. veebruar 2026",
  relatedLinks: [{ href: "/terms?lang=${lang}", label: "Kasutustingimused", type: "external" }],
  sections: [
    {
      heading: "Kokkuvõte",
      paragraphs: [
        "ANQR on kliendikeskse lähenemisega QR-koodi generaator. Me ei nõua teilt konto loomist. Vaikimisi genereeritakse QR-koodid teie brauseris lokaalselt – meil pole juurdepääsu teie kodeeritud sisule.",
        "Professionaalseks kasutamiseks pakub ANQR serveripoolset API-d, mis genereerib URL-i parameetritest QR-koode. API kasutamisel töödeldakse teie QR-sisu meie serverites pildi renderdamiseks, kuid seda ei salvestata ega logita.",
        "Kasutame Google AdSense'i reklaamimiseks ja võime kasutada analüüsiteenuseid. Need teenused koguvad teavet küpsiste ja sarnaste tehnoloogiate kaudu. See poliitika selgitab, milliseid andmeid kogutakse, kuidas neid kasutatakse ja teie õigusi.",
      ],
    },
    {
      heading: "Teave, mida kogume",
      bullets: [
        "Teie edastatav teave: kui võtate meiega ühendust e-posti või meie kontaktvormi kaudu, kogume teie nime, e-posti aadressi ja sõnumi sisu.",
        "Automaatselt kogutud teave: meie hostiteenuse pakkuja (Netlify), reklaamipartnerid ja analüüsiteenused võivad koguda: IP-aadressi, brauseri tüüpi ja versiooni, operatsioonisüsteemi, seadme tüüpi, viitavat URL-i, külastatud lehti, kohapeal viibitud aega ja ligikaudset geograafilist asukohta.",
        "Kolmanda osapoole küpsised: meie reklaamipartnerid (Google AdSense) kasutavad küpsiseid ja sarnaseid tehnoloogiaid reklaamide esitamiseks ja mõõtmiseks. ANQR ise ei määra esimese osapoole küpsiseid.",
      ],
    },
    {
      heading: "Küpsised ja kolmandate osapoolte tehnoloogiad",
      paragraphs: [
        "ANQR ei määra esimese osapoole küpsiseid. Teie eelistused (nt tume režiim) salvestatakse teie seadmesse lokaalselt, mida ei edastata ühelegi serverile.",
        "Kuid meie reklaamipartnerid (Google AdSense) ja hostiteenuse pakkuja võivad kasutada küpsiseid ja sarnaseid jälgimistehnoloogiaid:",
      ],
      bullets: [
        "Reklaamiküpsised (kolmanda osapoole): Google AdSense'i ja reklaamipartnerite poolt seadistatud asjakohaste reklaamide esitamiseks, reklaamide toimivuse mõõtmiseks ja kasutajate huvide mõistmiseks. Need küpsised võivad jälgida teie tegevust erinevatel veebisaitidel.",
        "Analüütikaküpsised (kolmanda osapoole): meie hostiteenuse pakkuja või analüüsiteenused võivad neid kasutada anonüümseks muudetud kasutusandmete kogumiseks.",
      ],
    },
    {
      heading: "Google AdSense ja reklaam",
      paragraphs: [
        "Kuvame reklaame Google AdSense'i kaudu. Google ja tema partnerid kasutavad küpsiseid, et esitada reklaame, mis põhinevad teie sellel saidil ja muudel veebisaitidel sirvimisajaloos (huvipõhine reklaam).",
        "Vaadake, kuidas Google teie teavet kasutab: https://policies.google.com/technologies/partner-sites",
        "Hallake reklaamide isikupärastamist: https://adssettings.google.com",
        "Loobuge Network Advertising Initiative'i kaudu: https://optout.networkadvertising.org",
        "Loobuge Digital Advertising Alliance'i kaudu: https://optout.aboutads.info",
      ],
    },
    {
      heading: "Kuidas me teavet kasutame",
      bullets: [
        "Et vastata teie päringutele ja pakkuda tuge.",
        "Asjakohaste reklaamide kuvamiseks meie reklaamipartnerite kaudu.",
        "Saidikasutuse analüüsimiseks ja meie teenuste täiustamiseks.",
        "Pettuste, kuritarvitamise ja turvaprobleemide tuvastamiseks, ennetamiseks ja lahendamiseks.",
        "Seadusjärgsete kohustuste täitmiseks.",
      ],
    },
    {
      heading: "Kolmanda osapoole teenused",
      bullets: [
        "Google AdSense: saab andmeid reklaamide esitamiseks ja mõõtmiseks.",
        "Analyticsi pakkujad: saate anonüümseid kasutusandmeid.",
        "Netlify (hostimine): töötleb päringuid ja võib IP-aadresse logida.",
        'Me ei müü teie isikuandmeid. Andmete jagamist reklaamipartneritega võib aga CCPA alusel pidada \\"müügiks\\" (vt allpool).',
      ],
    },
    {
      heading: "Andmete säilitamine",
      bullets: [
        "Kontaktide esitamine: kuni 2 aastat.",
        "Serveri logid: kuni 30 päeva (hostipakkuja).",
        "Analüüsiandmed: kuni 26 kuud (anonüümseks muudetud).",
        "Reklaamiküpsised: tavaliselt 13 kuud (erineb partneriti).",
      ],
    },
    {
      heading: "Teie õigused GDPR-i alusel (EMP kasutajad)",
      paragraphs: [
        "Kui asute Euroopa Majanduspiirkonnas, on teil isikuandmete kaitse üldmääruse alusel järgmised õigused:",
      ],
      bullets: [
        "Juurdepääsuõigus: taotlege koopiat teie kohta säilitatavatest isikuandmetest.",
        "Õigus andmete parandamisele: taotleda ebatäpsete andmete parandamist.",
        'Õigus kustutada: taotleda oma andmete kustutamist (\\"õigus olla unustatud\\").',
        "Õigus piirata töötlemist: taotlege piiranguid teie andmete kasutamisele.",
        "Õigus andmete teisaldatavusele: taotlege oma andmeid kaasaskantavas vormingus.",
        "Vastuväite esitamise õigus: vaidlustada töötlemist, sealhulgas otseturunduse jaoks.",
        "Õigus nõusolek tagasi võtta: nõusolek tagasi võtta igal ajal, kui töötlemine toimub nõusolekul.",
        "Kaebuse esitamise õigus: esitage kaebus oma andmekaitseasutusele.",
      ],
    },
    {
      heading: "GDPR õiguslik alus",
      paragraphs: [
        "Töötleme andmeid järgmistel alustel: (a) Nõusolek – isikupärastatud reklaamimiseks (haldavad meie reklaamipartnerid); (b) Õigustatud huvid – analüütika, turvalisuse ja täiustamise jaoks; (c) Leping – päringutele vastamiseks.",
        "Oma õiguste kasutamiseks võtke ühendust email@anqr.link. Vastame 30 päeva jooksul.",
      ],
    },
    {
      heading: "Teie õigused CCPA alusel (California kasutajad)",
      bullets: [
        "Õigus teada: taotleda teavet kogutud andmete, allikate, eesmärkide ja kolmandate isikute kohta.",
        "Kustutamisõigus: taotlege oma isikuandmete kustutamist.",
        'Loobumisõigus: loobuge isikuandmete \\"müügist\\" (reklaamipartneritega jagamine võib kvalifitseeruda).',
        "Õigus mittediskrimineerimisele: me ei diskrimineeri teie õiguste teostamise pärast.",
      ],
    },
    {
      heading: "CCPA kategooriad kogutud",
      paragraphs: [
        "Kategooriad: Identifikaatorid (IP-aadress, seadme ID), Interneti-tegevused (sirvimine, reklaamide interaktsioonid), Geolokatsioon (ligikaudne), Järeldused (sirvimisest saadavad huvid).",
        "Õiguste kasutamiseks või loobumiseks: email@anqr.link või kohandage küpsiste seadeid.",
      ],
    },
    {
      heading: "Rahvusvahelised ülekanded",
      paragraphs: [
        "Teie teavet võidakse edastada riikidesse, kus kehtivad erinevad andmekaitseseadused, sealhulgas Ameerika Ühendriikidesse. Kasutame sobivaid kaitsemeetmeid, näiteks lepingu tüüptingimusi.",
      ],
    },
    {
      heading: "Laste privaatsus",
      paragraphs: [
        "ANQR ei ole suunatud alla 13-aastastele (või EMP-s 16-aastastele lastele). Me ei kogu teadlikult andmeid lastelt. Kui arvate, et laps on teavet andnud, võtke ühendust email@anqr.link.",
      ],
    },
    {
      heading: "Turvalisus",
      paragraphs: [
        "Kasutame andmete kaitsmiseks sobivaid tehnilisi ja organisatsioonilisi meetmeid, sealhulgas HTTPS-i krüptimist. Ükski Interneti-edastus pole aga 100% turvaline.",
      ],
    },
    {
      heading: "Ära jälgi",
      paragraphs: [
        "Kui võimalik, austame brauseri Ära jälgi signaale, kuigi reklaamipartnerid ei pruugi DNT-le vastata.",
      ],
    },
    {
      heading: "Selle poliitika muudatused",
      paragraphs: [
        'Võime seda poliitikat perioodiliselt värskendada. \\"Viimati värskendatud\\" kuupäev näitab viimast versiooni. Olulistest muudatustest võidakse teavitada saidi bänneri kaudu.',
      ],
    },
    {
      heading: "Võtke meiega ühendust",
      paragraphs: [
        "Privaatsusküsimuste korral või oma õiguste teostamiseks: email@anqr.link või kasutage meie kontaktilehte. Vastame privaatsustaotlustele 30 päeva jooksul.",
      ],
    },
    {
      heading: "Täielik privaatsuspoliitika",
      paragraphs: [
        "Sellel lehel on kokkuvõte meie privaatsuspõhimõtetest. Täieliku, juriidiliselt siduva privaatsuspoliitika täieliku üksikasjadega andmetöötluse, teie õiguste ja meie kohustuste kohta GDPR-i, CCPA ja muude privaatsusseaduste alusel vaadake meie täielikku poliitikat, mida hostib iubenda.",
      ],
      links: [
        {
          href: "https://www.iubenda.com/privacy-policy/70266922",
          label: "Vaadake iubenda täielikku privaatsuspoliitikat",
          type: "external",
        },
      ],
    },
  ],
};

export default privacy;
