import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'O ANQR',
  description: 'ANQR je brezplačen generator kode QR s pristopom, ki je na prvem mestu odjemalec - ustvarite kode QR lokalno ali uporabite naš API za vdelavo.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Odprite generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Brskajte po člankih Learn', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Politika zasebnosti', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Pogoji storitve', type: 'external' },
  ],
  sections: [
    {
      heading: 'Kaj je ANQR?',
      paragraphs: ['ANQR (izgovarja se kot "sidro") je brezplačen generator kode QR, ki ustvarja kode, ki jih je mogoče optično prebrati za URL-je, besedilo, poverilnice za Wi-Fi, kartice stikov, dogodke v koledarju in drugo.', 'Zasnovan je za posameznike, mala podjetja, tržnike in razvijalce, ki želijo zmogljiva orodja QR brez prijave. Zasnova, ki je na prvem mestu odjemalec, pomeni, da se kode QR privzeto ustvarijo lokalno v vašem brskalniku, z izbirnim strežniškim API-jem za profesionalno vdelavo in integracijo.'],
    },
    {
      heading: 'Ključne značilnosti',
      bullets: ['V brskalniku takoj ustvarite kode QR – račun ni potreben.', 'Prilagodite barve, sloge modulov, vzorce iskalnika in dodajte prekrivne slike.', 'Izvoz v več formatih: PNG, SVG, WebP in animirani GIF.', 'Napredne kontrole za raven odpravljanja napak, različico QR, način kodiranja in izbiro maske.', 'Navodila za varnost skeniranja in predogled v živo, ki pomagata ohranjati kode berljive v tisku in na zaslonih.', 'API na strani strežnika za profesionalno vdelavo s polno podporo za parametre.', 'Po nalaganju deluje brez povezave - je statična spletna aplikacija, ki jo lahko izvajate kjer koli.'],
    },
    {
      heading: 'Kako deluje ANQR',
      paragraphs: ['ANQR deluje v vašem brskalniku in kodira vaš vnos v standardno matriko QR s popravkom napak Reed–Solomon, nato pa ga upodobi v obliki, ki jo izberete.', 'Generiranje se privzeto zgodi lokalno v vašem brskalniku. Za profesionalno uporabo lahko uporabite tudi strežniški API za ustvarjanje kod QR prek parametrov URL – kot nalašč za vdelavo v spletna mesta, e-pošto ali avtomatizirane poteke dela.', 'Ko dodate prekrivke ali animacije, ANQR uravnoteži slog z zanesljivostjo skeniranja, tako da ostane rezultat optičen.', 'ANQR se osredotoča na statične kode (podatki so znotraj QR). Če potrebujete dinamično kodo (destinacija, ki jo je mogoče urejati), lahko kodirate svoj preusmeritveni URL ali kratko povezavo.'],
    },
    {
      heading: 'Kdo upravlja ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Oglaševanje in kako ostanemo brezplačni',
      paragraphs: ['ANQR je brezplačen za uporabo in je podprt z oglaševanjem. Oglase lahko prikazujemo prek Google AdSense in/ali drugih oglaševalskih partnerjev.', 'Ponudniki oglasov lahko uporabljajo piškotke ali podobne tehnologije za prilagajanje oglasov na podlagi vaših zanimanj in dejavnosti brskanja. Nastavitve oglasov lahko upravljate v nastavitvah naprave in prek Googlovih nastavitev oglasov, o tem pa preberite več v našem pravilniku o zasebnosti.', 'Vsebine, ki jo kodirate v QR kode, ne prodajamo. Oglasi pomagajo pokriti stroške vodenja in izboljšanja projekta.'],
    },
    {
      heading: 'Odprti standardi',
      paragraphs: ['ANQR ustvarja kode QR na podlagi standarda ISO/IEC 18004 in si prizadeva za široko združljivost med optičnimi bralniki, kamerami in poteki dela za tiskanje.'],
    },
    {
      heading: 'Obvestilo o blagovni znamki',
      paragraphs: ['QR Code® je registrirana blagovna znamka družbe DENSO WAVE INCORPORATED. ANQR ni povezan z DENSO WAVE INCORPORATED, ga ne podpira ali sponzorira.'],
    },
    {
      heading: 'Povratne informacije in prispevki',
      paragraphs: ['Pozdravljamo povratne informacije, poročila o napakah in predloge funkcij. Stopite v stik preko e-pošte ali kontaktne strani - preberemo vsako sporočilo, čeprav se odzivni časi lahko razlikujejo.'],
    },
  ],
};

export default about;
