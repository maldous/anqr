import type { PageDefinition } from "../types";

export const about: PageDefinition = {
  title: "Par ANQR",
  description:
    "ANQR ir bezmaksas QR koda ģenerators ar pieeju vispirms klientam — ģenerējiet QR kodus lokāli vai izmantojiet mūsu API iegulšanai.",
  lastUpdated: "2026. gada 1. februāris",
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Atveriet ģeneratoru", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Pārlūkot Uzziniet rakstus", type: "learn" },
  ],
  relatedLinks: [
    { href: "/privacy?lang=${lang}", label: "Privātuma politika", type: "external" },
    { href: "/terms?lang=${lang}", label: "Pakalpojuma noteikumi", type: "external" },
  ],
  sections: [
    {
      heading: "Kas ir ANQR?",
      paragraphs: [
        'ANQR (izrunā \\"enkurs\\") ir bezmaksas QR koda ģenerators, kas izveido skenējamus kodus vietrāžiem URL, tekstam, Wi-Fi akreditācijas datiem, kontaktu kartēm, kalendāra pasākumiem un citam.',
        "Tas ir paredzēts privātpersonām, maziem uzņēmumiem, tirgotājiem un izstrādātājiem, kuri vēlas jaudīgus QR rīkus bez reģistrēšanās. Klientam pirmais dizains nozīmē, ka QR kodi pēc noklusējuma tiek ģenerēti lokāli jūsu pārlūkprogrammā ar papildu servera API profesionālai iegulšanai un integrācijai.",
      ],
    },
    {
      heading: "Galvenās iezīmes",
      bullets: [
        "Ātri ģenerējiet QR kodus savā pārlūkprogrammā — nav nepieciešams konts.",
        "Pielāgojiet krāsas, moduļu stilus, meklētāja modeļus un pievienojiet attēlu pārklājumus.",
        "Eksportējiet vairākos formātos: PNG, SVG, WebP un animētu GIF.",
        "Papildu vadīklas kļūdu labošanas līmenim, QR versijai, kodēšanas režīmam un masku izvēlei.",
        "Skenēšanas drošības norādījumi un tiešraides priekšskatījums, lai palīdzētu saglabāt kodus lasāmus drukātā veidā un ekrānā.",
        "Servera puses API profesionālai iegulšanai ar pilnu parametru atbalstu.",
        "Darbojas bezsaistē pēc ielādes — tā ir statiska tīmekļa lietotne, kuru varat palaist jebkur.",
      ],
    },
    {
      heading: "Kā darbojas ANQR",
      paragraphs: [
        "ANQR darbojas jūsu pārlūkprogrammā un kodē jūsu ievadi standarta QR matricā ar Rīda–Zālamana kļūdu labošanu, pēc tam atveido to jūsu izvēlētajā formātā.",
        "Pēc noklusējuma ģenerēšana notiek lokāli jūsu pārlūkprogrammā. Profesionālai lietošanai varat arī izmantot servera puses API, lai ģenerētu QR kodus, izmantojot URL parametrus — lieliski piemērots iegulšanai vietnēs, e-pastos vai automatizētās darbplūsmās.",
        "Kad pievienojat pārklājumus vai animācijas, ANQR līdzsvaro stilu ar skenēšanas uzticamību, lai rezultāts būtu skenējams.",
        "ANQR koncentrējas uz statiskiem kodiem (dati atrodas QR iekšpusē). Ja jums ir nepieciešams dinamisks kods (rediģējams galamērķis), varat iekodēt savu novirzīšanas URL vai īso saiti.",
      ],
    },
    {
      heading: "Kas pārvalda ANQR?",
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: "Reklāma un kā mēs paliekam brīvi",
      paragraphs: [
        "ANQR var izmantot bez maksas, un to atbalsta reklāma. Mēs varam rādīt reklāmas, izmantojot Google AdSense un/vai citus reklamēšanas partnerus.",
        "Reklāmu nodrošinātāji var izmantot sīkfailus vai līdzīgas tehnoloģijas, lai personalizētu reklāmas, pamatojoties uz jūsu interesēm un pārlūkošanas darbībām. Reklāmu preferences varat pārvaldīt ierīces iestatījumos un Google reklāmu iestatījumos, kā arī uzzināt vairāk mūsu konfidencialitātes politikā.",
        "Mēs nepārdodam saturu, ko iekodējat QR kodos. Reklāmas palīdz segt projekta darbības un uzlabošanas izmaksas.",
      ],
    },
    {
      heading: "Atvērtie standarti",
      paragraphs: [
        "ANQR ģenerē QR kodus, pamatojoties uz ISO/IEC 18004 standartu, un tā mērķis ir nodrošināt plašu skeneru, kameru un drukas darbplūsmu savietojamību.",
      ],
    },
    {
      heading: "Paziņojums par preču zīmi",
      paragraphs: [
        "QR Code® ir DENSO WAVE INCORPORATED reģistrēta preču zīme. ANQR nav saistīts ar DENSO WAVE INCORPORATED, to neapstiprina vai sponsorē.",
      ],
    },
    {
      heading: "Atsauksmes un ieguldījumi",
      paragraphs: [
        "Mēs atzinīgi vērtējam atsauksmes, kļūdu ziņojumus un funkciju ieteikumus. Lūdzu, sazinieties pa e-pastu vai kontaktu lapu — mēs izlasām katru ziņojumu, taču atbildes laiks var atšķirties.",
      ],
    },
  ],
};

export default about;
