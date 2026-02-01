import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Uvjeti usluge',
  description: 'Pristupom ili korištenjem stranice, suglasni ste s ovim uvjetima.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Politika privatnosti', type: 'external' }],
  sections: [
    {
      heading: 'Prihvaćanje uvjeta',
      paragraphs: ['Pristupanjem ili korištenjem ANQR-a (anqr.link), slažete se s ovim Uvjetima pružanja usluge i našom Politikom privatnosti. Ako se ne slažete s ovim uvjetima, nemojte koristiti stranicu.', 'S vremena na vrijeme možemo ažurirati ove Uvjete. Nastavak korištenja stranice nakon promjena predstavlja prihvaćanje novih uvjeta.'],
    },
    {
      heading: 'Podobnost',
      paragraphs: ['Morate imati najmanje 13 godina da biste koristili ANQR. Korištenjem stranice izjavljujete da ispunjavate ovaj dobni uvjet. Ako ste mlađi od 18 godina, izjavljujete da imate dopuštenje roditelja ili skrbnika za korištenje stranice.'],
    },
    {
      heading: 'Dopuštena uporaba',
      paragraphs: ['ANQR možete koristiti samo u zakonite svrhe. Isključivo ste vi odgovorni za sadržaj koji kodirate u QR kodove i za način na koji koristite QR kodove koje generirate.'],
    },
    {
      heading: 'Zabranjeno ponašanje',
      paragraphs: ['Slažete se da nećete:'],
      bullets: ['Upotrijebite ANQR za stvaranje QR kodova koji olakšavaju krađu identiteta, distribuciju zlonamjernog softvera, prijevare, prijevare, uznemiravanje, klevetu ili bilo koju nezakonitu aktivnost.', 'Kodirajte sadržaj koji krši prava intelektualnog vlasništva, narušava privatnost ili sadrži nezakonit materijal.', 'Pokušaj ometanja, preopterećenja ili ometanja rada ili sigurnosti stranice.', 'Obrnuti inženjering, dekompilacija ili pokušaj ekstrahiranja izvornog koda sa stranice.', 'Koristite automatizirane alate (botove, strugače) za pristup web mjestu na način koji degradira performanse za druge korisnike.', 'Zaobiđite ili onemogućite sve sigurnosne značajke ili značajke kontrole pristupa.', 'Lažno se predstavljati kao bilo koja osoba ili entitet ili lažno predstavljati svoju povezanost.'],
    },
    {
      heading: 'Intelektualno vlasništvo',
      paragraphs: ['Zadržavate vlasništvo nad sadržajem koji kodirate u QR kodove. ANQR ne polaže pravo vlasništva nad vašim podacima.', 'ANQR naziv, logotip, dizajn sučelja i temeljni kod zaštićeni su autorskim pravima, zaštitnim znakovima i drugim zakonima o intelektualnom vlasništvu. Ne smijete kopirati, mijenjati, distribuirati ili stvarati izvedena djela bez našeg dopuštenja.', 'QR Code® je registrirani zaštitni znak tvrtke DENSO WAVE INCORPORATED. ANQR nije povezan s DENSO WAVE.'],
    },
    {
      heading: 'Licenca korisničkog sadržaja',
      paragraphs: ['Korištenjem ANQR-a ne dajete nam nikakva prava na vaš sadržaj. Kada koristite lokalno generiranje (zadano), sve generiranje QR kodova događa se u vašem pregledniku i mi ne pristupamo, pohranjujemo niti prenosimo vaše kodirane podatke.', 'Kada koristite API na strani poslužitelja, vaš se sadržaj obrađuje za generiranje QR slike, ali se ne pohranjuje, ne bilježi niti koristi u bilo koju drugu svrhu osim za renderiranje tražene slike.'],
    },
    {
      heading: 'Usluge trećih strana i oglašavanje',
      paragraphs: ['Stranica prikazuje oglase putem Google AdSensea i može uključivati poveznice na web stranice trećih strana. Nismo odgovorni za sadržaje, usluge ili praksu privatnosti trećih strana.', 'Vaše interakcije s oglašivačima i trećim stranama odvijaju se isključivo između vas i njih. Pogledajte naša Pravila o privatnosti za informacije o praksi oglašavanja podataka.'],
    },
    {
      heading: 'Odricanje od jamstva',
      paragraphs: ['ANQR SE PRUŽA NA OSNOVI "KAKAV JEST" I "KAKO JE DOSTUPAN" BEZ JAMSTAVA BILO KAKVE VRSTE, IZRIČITIH ILI PODRAZUMEVANIH, UKLJUČUJUĆI, ALI NE OGRANIČENO NA, PODRAZUMEVANA JAMSTVA PRODAJE, PRIKLADNOSTI ZA ODREĐENU NAMJENU I NEKRŠENJE.', 'Ne jamčimo da će: (a) stranica biti neprekinuta, sigurna ili bez grešaka; (b) QR kodovi će se skenirati u svim okruženjima, na svim uređajima ili sa svim aplikacijama za skeniranje; (c) stranica će zadovoljiti vaše zahtjeve.', 'Uvijek biste trebali testirati QR kodove u uvjetima u kojima će se koristiti (veličina ispisa, osvjetljenje, vrsta zaslona, udaljenost, kvaliteta kamere).'],
    },
    {
      heading: 'Ograničenje odgovornosti',
      paragraphs: ['U MAKSIMALNOJ MJERI DOPUŠTENOJ ZAKONOM, ANQR I NJEGOVI OPERATERI, PODRUŽNICE I DAVATELJI LICENCE NEĆE BITI ODGOVORNI ZA BILO KAKVU IZRAVNU, NEIZRAVNU, SLUČAJNU, POSEBNU, POSLJEDIČNU, KAZNENU ILI EKZEMPLARNU ŠTETU, UKLJUČUJUĆI ALI NIJE OGRANIČENA NA ŠTETU ZBOG GUBITKA DOBITI, PRIHODA, PODATAKA, DOBRE VOLJE, KORIŠTENJA ILI DRUGIH NEMATERIJALNIH GUBITAKA, KOJI PROIZLAZE IZ ILI POVEZANI S VAŠIM PRISTUPOM ILI KORIŠTENJEM (ILI NEMOGUĆNOSTI PRISTUPANJA ILI KORIŠTENJA) USLUGE.', 'VI IZRIČITO RAZUMIJETE I SLAŽETE SE DA KORISTITE USLUGU NA VLASTITU ODGOVORNOST. USLUGA SE PRUŽA BESPLATNO, I PREMA TOME, SUGLASNI STE DA ANQR I NJEGOVI OPERATERI NEĆE IMATI NIKAKVU ODGOVORNOST PREMA VAMA ZA BILO KAKVU ŠTETU ILI GUBITAK. NI U KOJEM SLUČAJU NAŠA UKUPNA UKUPNA ODGOVORNOST NEĆE PREMAŠITI NULA DOLARA (0 AUD).', 'PRISTAJETE DA ĆETE OTPUŠTATI, ODREĆI SE I OTKRITI SVIH POTRAŽIVANJA, ZAHTJEVA I UZROKA POSTUPKA PROTIV ANQR-A I NJEGOVIH OPERATERA KOJI PROIZLAZE IZ VAŠEG KORIŠTENJA USLUGE.', 'NEKE JURISDIKCIJE NE DOPUŠTAJU ISKLJUČIVANJE ODREĐENIH JAMSTAVA ILI OGRANIČENJA ODGOVORNOSTI. U TAKVIM JURISDIKCIJAMA, NAŠA ODGOVORNOST ĆE BITI OGRANIČENA NA MAKSIMALNU MJERU DOPUŠTENU PRIMJENJIVIM ZAKONOM.'],
    },
    {
      heading: 'Obeštećenje',
      paragraphs: ['Slažete se da ćete obeštetiti, braniti i smatrati neodgovornim ANQR, njegove operatere, podružnice i njihove odgovarajuće službenike, direktore, zaposlenike i agente od bilo kakvih zahtjeva, šteta, gubitaka, odgovornosti, troškova i izdataka (uključujući pravne naknade) koji proizlaze iz: (a) vaše upotrebe stranice; (b) Vaše kršenje ovih Uvjeta; (c) vaše povrede prava trećih strana; (d) sav sadržaj koji kodirate u QR kodove.'],
    },
    {
      heading: 'Rješavanje sporova',
      paragraphs: ['Svaki spor koji proizlazi iz ovih Uvjeta ili vaše upotrebe ANQR-a prvo će se pokušati riješiti neformalnim pregovorima kontaktiranjem email@anqr.link.', 'Ako neformalno rješenje ne uspije, sporovi će se rješavati putem obvezujuće arbitraže u Victoriji, Australija, osim što bilo koja strana može zatražiti mjeru zabrane na sudu zbog kršenja intelektualnog vlasništva.'],
    },
    {
      heading: 'Odricanje od grupne tužbe',
      paragraphs: ['U MJERI DOPUŠTENOJ ZAKONOM, SLAŽETE SE DA ĆE SE SVAKI POSTUPAK RJEŠAVANJA SPOROVA VODITI SAMO NA INDIVIDUALNOJ OSNOVI, A NE U SKUPNOJ, OBJEDINJENOJ ILI ZASTUPNIČKOJ POSTUPCI.'],
    },
    {
      heading: 'Mjerodavno pravo',
      paragraphs: ['Ovi Uvjeti regulirani su zakonima Viktorije, Australija, bez obzira na načela sukoba zakona. Pristajete na isključivu nadležnost sudova koji se nalaze u Victoriji, Australija.'],
    },
    {
      heading: 'Promjene i dostupnost',
      paragraphs: ['Možemo izmijeniti, obustaviti ili prekinuti web mjesto (ili bilo koji njegov dio) u bilo koje vrijeme bez obavijesti ili odgovornosti.', 'Ove Uvjete možemo ažurirati u bilo kojem trenutku. Datum "Zadnje ažuriranje" označava kada su zadnji put revidirani. Nastavak korištenja nakon promjena predstavlja prihvaćanje.'],
    },
    {
      heading: 'Odvojivost',
      paragraphs: ['Ako se bilo koja odredba ovih Uvjeta smatra nevažećom ili neprovedivom, ta će se odredba provoditi u najvećoj dopuštenoj mjeri, a ostale odredbe ostat će na snazi i učinku.'],
    },
    {
      heading: 'Odricanje',
      paragraphs: ['Naš neuspjeh u provedbi bilo kojeg prava ili odredbe ovih Uvjeta neće se smatrati odricanjem od takvog prava ili odredbe.'],
    },
    {
      heading: 'Cijeli dogovor',
      paragraphs: ['Ovi Uvjeti, zajedno s našom Politikom privatnosti, čine cjelokupni ugovor između vas i ANQR-a u vezi s vašom upotrebom stranice i zamjenjuju sve prethodne ugovore.'],
    },
    {
      heading: 'Viša sila',
      paragraphs: ['Nećemo biti odgovorni za bilo kakav neuspjeh ili kašnjenje u izvedbi zbog okolnosti koje su izvan naše razumne kontrole, uključujući prirodne katastrofe, rat, terorizam, nerede, vladine radnje ili kvarove na internetu/infrastrukturi.'],
    },
    {
      heading: 'kontakt',
      paragraphs: ['Pitanja o ovim Uvjetima možete poslati na: email@anqr.link'],
    },
  ],
};

export default terms;
