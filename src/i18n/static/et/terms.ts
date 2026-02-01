import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Kasutustingimused',
  description: 'Saidile sisenedes või seda kasutades nõustute järgima neid tingimusi.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Privaatsuspoliitika', type: 'external' }],
  sections: [
    {
      heading: 'Tingimustega nõustumine',
      paragraphs: ['ANQR-i (anqr.link) juurde pääsedes või seda kasutades nõustute järgima neid teenusetingimusi ja meie privaatsuspoliitikat. Kui te nende tingimustega ei nõustu, ärge kasutage saiti.', 'Võime neid tingimusi aeg-ajalt värskendada. Saidi jätkuv kasutamine pärast muudatusi tähendab uute tingimustega nõustumist.'],
    },
    {
      heading: 'Abikõlblikkus',
      paragraphs: ['ANQR-i kasutamiseks peate olema vähemalt 13-aastane. Saiti kasutades kinnitate, et vastate sellele vanusenõudele. Kui olete alla 18-aastane, kinnitate, et teil on saidi kasutamiseks oma vanema või eestkostja luba.'],
    },
    {
      heading: 'Lubatud kasutamine',
      paragraphs: ['Võite ANQR-i kasutada ainult seaduslikel eesmärkidel. Vastutate ainuisikuliselt QR-koodideks kodeeritud sisu ja selle eest, kuidas te oma loodud QR-koode kasutate.'],
    },
    {
      heading: 'Keelatud käitumine',
      paragraphs: ['Nõustute mitte:'],
      bullets: ['Kasutage ANQR-i QR-koodide loomiseks, mis hõlbustavad andmepüüki, pahavara levitamist, pettusi, pettusi, ahistamist, laimamist või mis tahes ebaseaduslikku tegevust.', 'Kodeerige sisu, mis rikub intellektuaalomandi õigusi, rikub privaatsust või sisaldab ebaseaduslikku materjali.', 'Proovige saidi tööd või turvalisust häirida, üle koormata või segada.', 'Pöördprojekteerige, dekompileerige või proovige saidilt lähtekoodi eraldada.', 'Kasutage saidile juurdepääsuks automaatseid tööriistu (roboteid, kaabitsaid) viisil, mis halvendab teiste kasutajate jõudlust.', 'Vältige või keelake mis tahes turva- või juurdepääsukontrolli funktsioonid.', 'Esinege mis tahes isiku või üksusena või esitage valeandmeid oma seotusest.'],
    },
    {
      heading: 'Intellektuaalomand',
      paragraphs: ['QR-koodidesse kodeeritud sisu omandiõigus jääb teile alles. ANQR ei nõua teie andmete omandiõigust.', 'ANQR-i nimi, logo, liidese kujundus ja aluseks olev kood on kaitstud autoriõiguse, kaubamärgi ja muude intellektuaalomandi seadustega. Te ei tohi kopeerida, muuta, levitada ega luua tuletatud teoseid ilma meie loata.', 'QR Code® on ettevõtte DENSO WAVE INCORPORATED registreeritud kaubamärk. ANQR ei ole DENSO WAVE\'iga seotud.'],
    },
    {
      heading: 'Kasutaja sisu litsents',
      paragraphs: ['ANQR-i kasutades ei anna te meile oma sisule õigusi. Kohaliku genereerimise (vaikeseade) kasutamisel toimub kogu QR-koodi genereerimine teie brauseris ja me ei pääse teie kodeeritud andmetele juurde, ei salvesta ega edasta neid.', 'Serveripoolse API kasutamisel töödeldakse teie sisu QR-kujutise loomiseks, kuid seda ei salvestata, ei logita ega kasutata muuks otstarbeks peale soovitud pildi renderdamise.'],
    },
    {
      heading: 'Kolmandate osapoolte teenused ja reklaam',
      paragraphs: ['Saidil kuvatakse reklaame Google AdSense\'i kaudu ja see võib sisaldada linke kolmandate osapoolte veebisaitidele. Me ei vastuta kolmandate osapoolte sisu, teenuste ega privaatsustavade eest.', 'Teie suhtlus reklaamijate ja kolmandate osapooltega toimub ainult teie ja nende vahel. Reklaamiandmete tavade kohta teabe saamiseks vaadake meie privaatsuspoliitikat.'],
    },
    {
      heading: 'Garantiidest loobumine',
      paragraphs: ['ANQR PAKUTAKSE "NAGU ON" JA "NAGU SAADAVAL" PÕHISEL ILMA MINGI LIIGI OTSESELT VÕI KAUDSETE GARANTIIDETA, KAASA arvatud, KUID MITTE PIIRATUD, KAUDSED GARANTIID KAUBANDUSLIKU VÕIME, NING PARTNERI PARTNERI TASUTAMISEKS SOOVITUSE KOHTA.', 'Me ei garanteeri, et: (a) sait on katkematu, turvaline või vigadeta; (b) QR-koode skannitakse kõigis keskkondades, kõigis seadmetes või kõigi skannerirakendustega; (c) sait vastab teie nõuetele.', 'QR-koode tuleks alati testida tingimustes, kus neid kasutatakse (trüki suurus, valgustus, ekraani tüüp, kaugus, kaamera kvaliteet).'],
    },
    {
      heading: 'Vastutuse piirang',
      paragraphs: ['SEADUSEGA LUBATUD MAKSIMAALSES MÄÄRAS EI VASTUTA ANQR NING SELLE OPERATORID, SIDUSLIKUD JA LITSENTSIANDJAD ÜHTEGI OTSETE, KAUDSE, JUHUSLIKU, ERI-, JÄRGMISE, KARISTUSLIKU VÕI PIIRATAMATU EEST. KAHJUDE KOHTA, ET TEIE JUURDEPÄÄSEST TEENUSELE VÕI KASUTAMISEKS (VÕI SUUTMISES JUURDEPÄÄSU VÕI KASUTAMISEKS) TULENEVAD VÕI SEEGA SEOTUD KASUMI, TULU, ANDMETE, MAJAVÄÄRTUSE, KASUTAMISE VÕI MUUD MITTEMATERJALSETE KAHJUD.', 'TE SAATE SELGELSELT MÕISTMA JA NÕUSTUTE, ET TEENUST KASUTATE AINULT TEIE RISKITUL. TEENUST PAKUTAKSE TASUTA NING VASTU VÕTTE NÕUSTUD, ET ANQR JA SELLE OPERATORID EI VASTUTA TEIE EES MISGIGI KAHJUDE EEST. MINGIL JUHUL EI TOHI MEIE KOGUVASTUTUS ÜLETA NULL DOLLARI (0 AUD $).', 'NÕUSTUTE VABASTAMA, LOOBUMINE JA VÄLJASTAMA KÕIKI NÕUDED, NÕUDED NING ANQR-I JA SELLE OPERAATORI VASTU TEENUSTE KASUTAMIST TULENEVAD MEETMETE PÕHJUSED.', 'MÕNED JURISDIKTSIOONID EI LUBAL TEATUD GARANTIIDE VÕI VASTUTUSE PIIRANGUTE VÄLISTAMIST. SELLISTES JURISDIKTSIOONIDES ON MEIE VASTUTUS PIIRATUD KOHALDATAVA SEADUSEGA LUBATUD MAKSIMAALSE MÄÄRAGA.'],
    },
    {
      heading: 'Hüvitis',
      paragraphs: ['Nõustute hüvitama, kaitsma ja kaitsma ANQR-i, selle operaatoreid, sidusettevõtteid ja nende vastavaid ametnikke, direktoreid, töötajaid ja agente mis tahes nõuete, kahjude, kaotuste, kohustuste, kulude ja kulude (sealhulgas juriidiliste tasude) eest, mis tulenevad: (a) saidi kasutamisest teie poolt; (b) rikute neid tingimusi; (c) kolmandate isikute õiguste rikkumine; (d) mis tahes sisu, mille kodeerite QR-koodidesse.'],
    },
    {
      heading: 'Vaidluste lahendamine',
      paragraphs: ['Kõik nendest tingimustest või ANQR-i kasutamisest tulenevad vaidlused püütakse esmalt lahendada mitteametlike läbirääkimiste teel, võttes ühendust aadressil email@anqr.link.', 'Kui mitteametlik lahendamine ebaõnnestub, lahendatakse vaidlused siduva vahekohtu kaudu Austraalias Victoria osariigis, välja arvatud juhul, kui kumbki pool võib intellektuaalomandi rikkumiste korral taotleda kohtus ettekirjutust.'],
    },
    {
      heading: 'Grupihagist loobumine',
      paragraphs: ['SEADUSEGA LUBATUD MÄÄRAS NÕUSTUTE, ET MÕISTLIK VAIDLUSTE LAHENDAMINE LÄBITAKSE AINULT ÜKSIKUD ALUSEL, MITTE KLASSI, KONSOLIDEERITUD VÕI ESINDUSMEETMED.'],
    },
    {
      heading: 'Kehtiv seadus',
      paragraphs: ['Neid tingimusi reguleerivad Austraalia Victoria osariigi seadused, arvestamata kollisioonipõhimõtteid. Nõustute Austraalias Victoria osariigis asuvate kohtute ainujurisdiktsiooniga.'],
    },
    {
      heading: 'Muudatused ja saadavus',
      paragraphs: ['Võime saiti (või selle mis tahes osa) igal ajal muuta, peatada või katkestada ilma ette teatamata või vastutuseta.', 'Võime neid tingimusi igal ajal värskendada. "Viimati värskendatud" kuupäev näitab, millal neid viimati muudeti. Jätkuv kasutamine pärast muudatusi loeb heakskiidu.'],
    },
    {
      heading: 'Eraldatavus',
      paragraphs: ['Kui mõni nende tingimuste säte tunnistatakse kehtetuks või jõustamatuks, jõustatakse seda sätet maksimaalselt lubatud ulatuses ning ülejäänud sätted jäävad täies mahus jõusse.'],
    },
    {
      heading: 'Loobumine',
      paragraphs: ['Meie suutmatust jõustada käesolevate tingimuste mis tahes õigust või sätet ei loeta sellisest õigusest või sättest loobumiseks.'],
    },
    {
      heading: 'Kogu leping',
      paragraphs: ['Need tingimused koos meie privaatsuspoliitikaga moodustavad kogu lepingu teie ja ANQR-i vahel seoses saidi kasutamisega ning asendavad kõik varasemad lepingud.'],
    },
    {
      heading: 'Vääramatu jõud',
      paragraphs: ['Me ei vastuta tõrgete või viivituste eest, mis on põhjustatud meie mõistlikust kontrollist sõltumatutest asjaoludest, sealhulgas loodusõnnetused, sõda, terrorism, rahutused, valitsuse tegevused või Interneti-/infrastruktuuririkked.'],
    },
    {
      heading: 'Võtke ühendust',
      paragraphs: ['Küsimusi nende tingimuste kohta saab saata aadressil: email@anqr.link'],
    },
  ],
};

export default terms;
