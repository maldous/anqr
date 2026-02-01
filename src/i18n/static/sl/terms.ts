import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Pogoji storitve',
  description: 'Z dostopom ali uporabo spletnega mesta se strinjate, da vas zavezujejo ti pogoji.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Politika zasebnosti', type: 'external' }],
  sections: [
    {
      heading: 'Sprejem pogojev',
      paragraphs: ['Z dostopom ali uporabo ANQR (anqr.link) se strinjate, da vas zavezujejo ti pogoji storitve in naš pravilnik o zasebnosti. Če se ne strinjate s temi pogoji, ne uporabljajte spletnega mesta.', 'Te pogoje lahko občasno posodobimo. Nadaljnja uporaba spletnega mesta po spremembah pomeni sprejemanje novih pogojev.'],
    },
    {
      heading: 'Upravičenost',
      paragraphs: ['Za uporabo ANQR morate biti stari vsaj 13 let. Z uporabo spletnega mesta izjavljate, da izpolnjujete to starostno zahtevo. Če ste mlajši od 18 let, izjavljate, da imate dovoljenje staršev ali skrbnika za uporabo spletnega mesta.'],
    },
    {
      heading: 'Dovoljena uporaba',
      paragraphs: ['ANQR lahko uporabljate samo za zakonite namene. Sami ste odgovorni za vsebino, ki jo kodirate v kode QR, in za način uporabe morebitnih kod QR, ki jih ustvarite.'],
    },
    {
      heading: 'Prepovedano ravnanje',
      paragraphs: ['Strinjate se, da ne boste:'],
      bullets: ['Uporabite ANQR za ustvarjanje kod QR, ki olajšajo lažno predstavljanje, distribucijo zlonamerne programske opreme, goljufije, prevare, nadlegovanje, obrekovanje ali katero koli nezakonito dejavnost.', 'Kodirajte vsebino, ki krši pravice intelektualne lastnine, krši zasebnost ali vsebuje nezakonit material.', 'Poskus prekinitve, preobremenitve ali poseganja v delovanje ali varnost spletnega mesta.', 'Izvedite obratni inženiring, dekompilirajte ali poskusite ekstrahirati izvorno kodo s spletnega mesta.', 'Uporabite avtomatizirana orodja (bote, strgala) za dostop do spletnega mesta na način, ki poslabša delovanje drugih uporabnikov.', 'Zaobiti ali onemogočiti vse varnostne funkcije ali funkcije za nadzor dostopa.', 'Lažno predstavljate katero koli osebo ali subjekt ali lažno predstavljate svojo pripadnost.'],
    },
    {
      heading: 'Intelektualna lastnina',
      paragraphs: ['Obdržite lastništvo nad vsebino, ki jo kodirate v kode QR. ANQR ne zahteva lastništva vaših podatkov.', 'Ime, logotip, dizajn vmesnika in osnovna koda ANQR so zaščiteni z zakoni o avtorskih pravicah, blagovnih znamkah in drugih zakonih o intelektualni lastnini. Brez našega dovoljenja ne smete kopirati, spreminjati, distribuirati ali ustvarjati izpeljanih del.', 'QR Code® je registrirana blagovna znamka družbe DENSO WAVE INCORPORATED. ANQR ni povezan z DENSO WAVE.'],
    },
    {
      heading: 'Licenca uporabniške vsebine',
      paragraphs: ['Z uporabo ANQR nam ne podeljujete nobenih pravic do vaše vsebine. Pri uporabi lokalnega generiranja (privzeto) se vse generiranje QR kode zgodi v vašem brskalniku in ne dostopamo do vaših kodiranih podatkov, jih shranjujemo ali prenašamo.', 'Pri uporabi strežniškega API-ja se vaša vsebina obdela za ustvarjanje slike QR, vendar se ne shrani, zabeleži ali uporabi za druge namene, razen za upodabljanje zahtevane slike.'],
    },
    {
      heading: 'Storitve in oglaševanje tretjih oseb',
      paragraphs: ['Spletno mesto prikazuje oglase prek Google AdSense in lahko vključuje povezave do spletnih mest tretjih oseb. Nismo odgovorni za vsebino, storitve ali prakso zasebnosti tretjih oseb.', 'Vaše interakcije z oglaševalci in tretjimi osebami potekajo izključno med vami in njimi. Oglejte si naš pravilnik o zasebnosti za informacije o praksah oglaševanja podatkov.'],
    },
    {
      heading: 'Zavrnitev jamstev',
      paragraphs: ['ANQR JE NA ZAGOTAVLJANJE NA OSNOVI "TAKŠEN JE" IN "KAKRŠEN JE NA VOLJO" BREZ KAKRŠNIH KOLI JAMSTEV, IZRECNIH ALI NAZNAČENIH, VKLJUČNO, VENDAR NE OMEJENO NA NAZNAČANIH GARANCIJE GLEDE PRODAJE, PRIMERNOSTI ZA DOLOČEN NAMEN IN NEKRŠITEV.', 'Ne jamčimo, da: (a) bo spletno mesto neprekinjeno, varno ali brez napak; (b) kode QR bodo skenirane v vseh okoljih, na vseh napravah ali z vsemi aplikacijami za optično branje; (c) spletno mesto bo izpolnjevalo vaše zahteve.', 'Kode QR vedno preizkusite v pogojih, v katerih se bodo uporabljale (velikost tiska, osvetlitev, vrsta zaslona, razdalja, kakovost kamere).'],
    },
    {
      heading: 'Omejitev odgovornosti',
      paragraphs: ['DO NAJVEČJEGA MERA, KI GA DOVOLJUJE ZAKON, ANQR IN NJEGOVI OPERATERJI, PODRUŽNICE IN DAJALCI LICENC NISO ODGOVORNI ZA KAKRŠNO KOLI NEPOSREDNO, POSREDNO, NAKLJUČNO, POSEBNO, POSLEDIČNO, KAZENSKO ALI EKSEMPLARNO ŠKODO, VKLJUČNO VENDAR NI OMEJENO NA ODŠKODNINE ZARADI IZGUBE DOBIČKA, PRIHODKA, PODATKOV, DOBREGA IMENA, UPORABE ALI DRUGIH NEMATERILNIH IZGUB, KI IZHAJAJO ZARADI VAŠEGA DOSTOPA ALI UPORABE (ALI NEZMOŽNOSTI DOSTOPA ALI UPORABE) STORITVE.', 'IZRECNO RAZUMETE IN SE STRINJATE, DA UPORABLJATE STORITEV NA LASTNO ODGOVORNOST. STORITEV JE ZAGOTOVLJENA BREZPLAČNO IN SKLADNO SE STRINJATE, DA ANQR IN NJEGOVI OPERATERJI VAM NE ODGOVARJAJO ZA KAKRŠNO KOLI ŠKODO ALI IZGUBO. V NOBENEM PRIMERU NAŠA SKUPNA SKUPNA ODGOVORNOST NE BO PRESEGALA NIČ DOLARJEV (0 AUD).', 'STRINJATE SE, DA BOSTE ODPUSTILI, ODPOVEDALI IN ODPOVEDALI VSE ZAHTEVKE, ZAHTEVE IN VZROKE ZA UKREPANJE PROTI ANQR IN NJEGOVIM OPERATERJEM, KI IZHAJAJO IZ VAŠE UPORABE STORITVE.', 'NEKATERE JURISDIKCIJE NE DOVOLJUJEJO IZKLJUČITVE DOLOČENIH JAMSTEV ALI OMEJITEV ODGOVORNOSTI. V TAKIH JURISDIKCIJAH BO NAŠA ODGOVORNOST OMEJENA NA NAJVEČJO MERO, KI JO DOVOLJUJE VELJAVNA ZAKONODAJA.'],
    },
    {
      heading: 'Odškodnina',
      paragraphs: ['Strinjate se, da boste ANQR, njegove operaterje, podružnice in njihove uradnike, direktorje, zaposlene in zastopnike odškodovali, branili in varovali pred morebitnimi zahtevki, škodo, izgubami, obveznostmi, stroški in izdatki (vključno s pravnimi stroški), ki izhajajo iz: (a) vaše uporabe spletnega mesta; (b) vaša kršitev teh pogojev; (c) vaša kršitev pravic tretjih oseb; (d) vse vsebine, ki jih kodirate v kode QR.'],
    },
    {
      heading: 'Reševanje sporov',
      paragraphs: ['Morebitne spore, ki izhajajo iz teh pogojev ali vaše uporabe ANQR, bomo najprej poskušali rešiti z neformalnimi pogajanji, tako da se obrnete na email@anqr.link.', 'Če neformalna rešitev ne uspe, se spori rešujejo z zavezujočo arbitražo v Viktoriji, Avstralija, razen da lahko katera koli stranka na sodišču zahteva sodno prepoved zaradi kršitev intelektualne lastnine.'],
    },
    {
      heading: 'Opustitev skupinske tožbe',
      paragraphs: ['DO OBSEGA, KI GA DOVOLJUJE ZAKON, SE STRINJATE, DA BODO VSE POSTOPKI REŠEVANJA SPOROV IZVEDANI SAMO NA POSAMEZNI OSNOVI IN NE V SKUPINSKI, SKUPNI ALI ZASTOPNIŠKI TOŽBI.'],
    },
    {
      heading: 'Veljavno pravo',
      paragraphs: ['Te pogoje urejajo zakoni Viktorije, Avstralija, ne glede na načela kolizije zakonov. Strinjate se z izključno pristojnostjo sodišč v Viktoriji v Avstraliji.'],
    },
    {
      heading: 'Spremembe in razpoložljivost',
      paragraphs: ['Spletno mesto (ali katerega koli njegovega dela) lahko kadar koli spremenimo, začasno prekinemo ali ukinemo brez predhodnega obvestila ali odgovornosti.', 'Te pogoje lahko kadar koli posodobimo. Datum »Nazadnje posodobljen« označuje, kdaj so bili nazadnje revidirani. Nadaljnja uporaba po spremembah pomeni sprejem.'],
    },
    {
      heading: 'Ločljivost',
      paragraphs: ['Če je katera koli določba teh pogojev neveljavna ali neizvršljiva, bo ta določba uveljavljena v največjem dovoljenem obsegu, preostale določbe pa bodo ostale v polni veljavi in učinku.'],
    },
    {
      heading: 'Odpoved',
      paragraphs: ['Naše nezmožnost uveljavljanja katere koli pravice ali določbe teh pogojev se ne šteje za odpoved taki pravici ali določbi.'],
    },
    {
      heading: 'Celoten dogovor',
      paragraphs: ['Ti pogoji skupaj z našo politiko zasebnosti predstavljajo celotno pogodbo med vami in ANQR glede vaše uporabe spletnega mesta in nadomeščajo vse prejšnje pogodbe.'],
    },
    {
      heading: 'Višja sila',
      paragraphs: ['Ne prevzemamo odgovornosti za kakršne koli neuspehe ali zamude pri delovanju zaradi okoliščin, na katere razumno ne moremo vplivati, vključno z naravnimi nesrečami, vojno, terorizmom, nemiri, vladnimi ukrepi ali okvarami interneta/infrastrukture.'],
    },
    {
      heading: 'Kontakt',
      paragraphs: ['Vprašanja o teh pogojih lahko pošljete na: email@anqr.link'],
    },
  ],
};

export default terms;
