import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Pomagajte prevesti ANQR',
  description: 'Pridružite se naši skupnosti prevajalcev, ki pomagajo narediti ANQR dostopen uporabnikom po vsem svetu. Izkušnje s kodiranjem niso potrebne – prispevajte neposredno iz brskalnika.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Odprite repozitorij prevodov', type: 'external' },
    { href: '/?lang=${lang}', label: 'Odprite Generator', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'O ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Kontaktirajte nas', type: 'external' },
  ],
  sections: [
    {
      heading: 'Zakaj prispevati?',
      paragraphs: ['ANQR uporabljajo ljudje po vsem svetu za ustvarjanje kod QR za podjetja, dogodke, plačila in osebne projekte. S prispevanjem prevodov pomagate narediti to zmogljivo orodje dostopno uporabnikom, ki imajo raje svoj materni jezik.', 'Vsak prevajalski prispevek – ne glede na to, ali popravlja tipkarsko napako ali prevaja celoten jezik – pomeni resnično razliko za uporabnike v vaši skupnosti.'],
    },
    {
      heading: 'Kaj lahko prevedete?',
      paragraphs: ['ANQR ima dve vrsti prevedljive vsebine:'],
      bullets: ['Nizi uporabniškega vmesnika: oznake gumbov, menijski elementi, opisi orodij in besedilo vmesnika, ki se pojavlja v celotni aplikaciji.', 'Statična vsebina: strani z dokumentacijo, vključno z vodniki, primeri, pravilnikom o zasebnosti in članki s pomočjo.', 'Obe vrsti sta shranjeni kot preprosti besedilni datoteki, ki ju lahko urejate neposredno v brskalniku – posebna programska oprema ni potrebna.', 'Prevodi se pred združitvijo pregledajo, da se zagotovi kakovost in doslednost.'],
    },
    {
      heading: 'Kako prispevati',
      paragraphs: ['Prispevanje je enostavno in ne zahteva znanja o Gitu:'],
      bullets: ['Obiščite naše javno skladišče prevodov na GitHubu.', 'Poiščite svojo jezikovno datoteko (ali ustvarite novo, če vaš jezik še ni podprt).', 'Kliknite ikono svinčnika za urejanje neposredno v brskalniku.', 'Izvedite spremembe in kliknite »Predlagaj spremembe« – GitHub bo samodejno ustvaril zahtevo za vleko.', 'Vaš prispevek bo pregledan in združen, običajno v nekaj dneh.'],
    },
    {
      heading: 'Smernice za prevajanje',
      paragraphs: ['Pri prevajanju pustite ogradne oznake, kot so {name}, {count} in {{variable}}, nespremenjene – med izvajanjem se zamenjajo z dinamičnimi vrednostmi. Ohranite tudi vso sintakso, podobno HTML, kot so povezave v obliki [[/path|Oznaka]].', 'Če niste prepričani o prevodu, je bolje, da ga pustite v angleščini, kot da zagotovite napačen prevod. Prav tako lahko odprete vprašanje na GitHubu in zahtevate pojasnilo.'],
    },
    {
      heading: 'Trenutno podprti jeziki',
      paragraphs: ['ANQR trenutno podpira več kot 40 jezikov, vključno z:'],
      bullets: ['Glavni svetovni jeziki: angleščina, kitajščina, španščina, arabščina, hindijščina, portugalščina, japonščina, korejščina, francoščina, nemščina, ruščina in drugi.', 'Jeziki jugovzhodne Azije: tajščina, vietnamščina, indonezijščina, filipinski, malajski, kmerski, laoški, burmanski.', 'Južnoazijski jeziki: hindijščina, tamilščina, telugu, bengalščina, maratščina, gujarati, kanada, malajalamščina, pandžabi, nepalščina.'],
    },
    {
      heading: 'Priznanje',
      paragraphs: ['Vsi sodelujoči so pripisani v našem skladišču. Vaše delo pomaga tisočim uporabnikom dostopati do ANQR v njihovem želenem jeziku.', 'Hvala vsem našim prevajalcem, ki prispevajo k temu, da je ANQR dostopen po vsem svetu!'],
    },
    {
      heading: 'Vprašanja?',
      paragraphs: ['Če imate vprašanja o prispevanju prevodov, odprite vprašanje v našem repozitoriju GitHub ali nas kontaktirajte po e-pošti. Z veseljem vam pomagamo začeti.'],
    },
  ],
};

export default translate;
