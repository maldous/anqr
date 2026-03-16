import type { PageDefinition } from "../types";

export const translate: PageDefinition = {
  title: "Aidake ANQR-i tõlkida",
  description:
    "Liituge meie tõlkijate kogukonnaga, aidates muuta ANQR-i kasutajatele kättesaadavaks kogu maailmas. Kodeerimiskogemust pole vaja – panustage otse oma brauserist.",
  lastUpdated: "1. veebruar 2026",
  primaryLinks: [
    { href: "https://github.com/maldous/anqr-i18n", label: "Avage tõlkehoidla", type: "external" },
    { href: "/?lang=${lang}", label: "Avage generaator", type: "generator" },
  ],
  relatedLinks: [
    { href: "/about?lang=${lang}", label: "ANQR-i kohta", type: "external" },
    { href: "/contact?lang=${lang}", label: "Võtke meiega ühendust", type: "external" },
  ],
  sections: [
    {
      heading: "Miks panustada?",
      paragraphs: [
        "ANQR-i kasutavad inimesed üle maailma QR-koodide loomiseks ettevõtete, sündmuste, maksete ja isiklike projektide jaoks. Tõlgete panustamisega aitate muuta selle võimsa tööriista juurdepääsetavaks kasutajatele, kes eelistavad oma emakeelt.",
        "Iga tõlkepanus – olgu siis kirjavea parandamine või terve keele tõlkimine – muudab teie kogukonna kasutajaid tõeliseks.",
      ],
    },
    {
      heading: "Mida saate tõlkida?",
      paragraphs: ["ANQR-il on kahte tüüpi tõlgitavat sisu:"],
      bullets: [
        "Kasutajaliidese stringid: nuppude sildid, menüüelemendid, vihjed ja liidese tekst, mis kuvatakse kogu rakenduses.",
        "Staatiline sisu: dokumentatsioonilehed, sealhulgas juhendid, näited, privaatsuspoliitika ja abiartiklid.",
        "Mõlemat tüüpi salvestatakse lihtsate tekstifailidena, mida saate otse brauseris redigeerida – selleks pole vaja spetsiaalset tarkvara.",
        "Tõlked vaadatakse enne ühendamist üle, et tagada kvaliteet ja järjepidevus.",
      ],
    },
    {
      heading: "Kuidas panustada",
      paragraphs: ["Panustamine on lihtne ega nõua Giti teadmisi:"],
      bullets: [
        "Külastage meie avalikku tõlkehoidlat GitHubis.",
        "Otsige üles oma keelefail (või looge uus fail, kui teie keelt veel ei toetata).",
        "Otse brauseris muutmiseks klõpsake pliiatsiikoonil.",
        'Tehke oma muudatused ja klõpsake \\"Paku muudatusi\\" – GitHub loob automaatselt tõmbetaotluse.',
        "Teie panus vaadatakse üle ja liidetakse, tavaliselt mõne päeva jooksul.",
      ],
    },
    {
      heading: "Tõlkejuhised",
      paragraphs: [
        "Tõlkimisel jätke kohatäited nagu {name}, {count} ja {{variable}} muutmata – need asendatakse käitusajal dünaamiliste väärtustega. Säilitage ka igasugune HTML-i sarnane süntaks, näiteks lingid vormingus [[/path|Label]].",
        "Kui te pole tõlkes kindel, on parem jätta see inglise keelde kui esitada vale tõlge. Probleemi saate avada ka GitHubis ja küsida selgitust.",
      ],
    },
    {
      heading: "Praegu toetatud keeled",
      paragraphs: ["ANQR toetab praegu üle 40 keele, sealhulgas:"],
      bullets: [
        "Peamised maailma keeled: inglise, hiina, hispaania, araabia, hindi, portugali, jaapani, korea, prantsuse, saksa, vene ja palju muud.",
        "Kagu-Aasia keeled: tai, vietnami, indoneesia, filipino, malai, khmeeri, lao, birma.",
        "Lõuna-Aasia keeled: hindi, tamili, telugu, bengali, marati, gudžarati, kannada, malajalami, pandžabi, nepali.",
      ],
    },
    {
      heading: "Tunnustamine",
      paragraphs: [
        "Kõik kaastöölised on meie hoidlas krediteeritud. Teie töö aitab tuhandetel kasutajatel juurdepääsu ANQR-ile nende eelistatud keeles.",
        "Täname kõiki meie tõlkijaid, kes aitasid ANQR-i ülemaailmselt kättesaadavaks teha!",
      ],
    },
    {
      heading: "Küsimused?",
      paragraphs: [
        "Kui teil on tõlgete panuse kohta küsimusi, avage probleem meie GitHubi hoidlas või võtke meiega ühendust e-posti teel. Aitame teil hea meelega alustada.",
      ],
    },
  ],
};

export default translate;
