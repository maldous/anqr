import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontaktirajte nas',
  description: 'Pozdravljamo povratne informacije, izvješća o greškama, zahtjeve za značajkama i općenite upite.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Kako doći do nas',
      paragraphs: ['Nudimo nekoliko načina da nas kontaktirate ovisno o Vašim potrebama. Čitamo svaku poruku, iako vrijeme odgovora može varirati ovisno o količini i vrsti upita.'],
    },
    {
      heading: 'E-mail',
      paragraphs: ['Za sve upite: email@anqr.link', 'Ovo je najpouzdaniji način da dođete do nas i preporučujemo ga za detaljna pitanja, poslovne upite ili bilo koje druge upite.'],
    },
    {
      heading: 'Vrste upita',
      bullets: ['Opća pitanja: Pitanja o tome kako koristiti ANQR, objašnjenja značajki ili općenite povratne informacije.', 'Izvješća o pogreškama: uključite svoj preglednik, operativni sustav, korake za reprodukciju i sve poruke o pogreškama koje vidite.', 'Zahtjevi za značajke: Prijedlozi za nove značajke ili poboljšanja. Razmatramo sve zahtjeve, ali ne možemo obećati provedbu.', 'Poslovni upiti: mogućnosti partnerstva, pitanja o licenciranju ili upiti o komercijalnoj upotrebi.', 'Zahtjevi za privatnost: Zahtjevi za ostvarivanje vaših prava na privatnost prema GDPR-u, CCPA-u ili drugim zakonima o privatnosti (pogledajte Pravila o privatnosti).', 'DMCA/Autorska prava: Za zahtjeve obavijesti o uklanjanju pogledajte odjeljak DMCA u nastavku.'],
    },
    {
      heading: 'Vremena odgovora',
      paragraphs: ['Cilj nam je odgovoriti na upite u roku od 5-7 radnih dana. Zahtjevi koji se odnose na privatnost bit će obrađeni u roku od 30 dana u skladu sa zakonom.', 'Tijekom razdoblja gužve, vrijeme odgovora može biti duže. Za hitne stvari, molimo naznačite "HITNO" u predmetu.'],
    },
    {
      heading: 'Prije nego što nas kontaktirate',
      paragraphs: ['Provjerite našu stranicu s dokumentacijom za odgovore na uobičajena pitanja o tome kako koristiti ANQR značajke. Tamo su pokrivena mnoga pitanja o stvaranju QR koda, stiliziranju i opcijama izvoza.'],
    },
    {
      heading: 'DMCA obavijesti o autorskim pravima',
      paragraphs: ['Ako smatrate da sadržaj dostupan na ANQR-u krši vaša autorska prava, možete poslati obavijest o uklanjanju Zakona o autorskim pravima u digitalnom tisućljeću (DMCA). Da bi bila važeća, vaša obavijest mora sadržavati:'],
      bullets: ['Fizički ili elektronički potpis vlasnika autorskih prava ili ovlaštenog predstavnika.', 'Identifikacija djela zaštićenog autorskim pravima za koje se tvrdi da su prekršena.', 'Identifikacija materijala za koji se tvrdi da krši autorska prava, s podacima dovoljnim za njegovo lociranje.', 'Vaši kontakt podaci (adresa, broj telefona i adresa e-pošte).', 'Izjava da u dobroj vjeri vjerujete da korištenje materijala nije dopušteno od strane vlasnika autorskih prava.', 'Izjava, pod kaznenom kaznom za krivokletstvo, da su informacije u vašoj obavijesti točne i da ste vi vlasnik autorskih prava ili ovlašteni djelovati u njihovo ime.'],
    },
    {
      heading: 'DMCA kontakt',
      paragraphs: ['Pošaljite DMCA obavijesti na: email@anqr.link', 'Uključite "DMCA obavijest" u predmet. Odgovorit ćemo na važeće obavijesti u skladu s važećim zakonom. Imajte na umu da ANQR generira QR kodove lokalno na korisničkim uređajima i ne hostira sadržaj koji generiraju korisnici.'],
    },
    {
      heading: 'Reddit zajednica',
      paragraphs: ['Pridružite se našoj Reddit zajednici na r/ANQR kako biste podijelili svoje QR kreacije, postavljali pitanja, dobili pomoć i povezali se s drugim korisnicima ANQR-a.'],
    },
  ],
};

export default contact;
