import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Politika privatnosti',
  description: 'Informacije koje ANQR prikuplja, kako se koriste i vaša prava prema primjenjivim zakonima o privatnosti.',
  lastUpdated: '1. veljače 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Uvjeti usluge', type: 'external' }],
  sections: [
    {
      heading: 'Sažetak',
      paragraphs: ['ANQR je generator QR koda s pristupom klijentu na prvom mjestu. Ne zahtijevamo da kreirate račun. Prema zadanim postavkama, QR kodovi se generiraju lokalno u vašem pregledniku - nemamo pristup sadržaju koji kodirate.', 'Za profesionalnu upotrebu ANQR pruža API na strani poslužitelja koji generira QR kodove iz URL parametara. Kada koristite API, vaš QR sadržaj se obrađuje na našim poslužiteljima za renderiranje slike, ali se ne pohranjuje niti bilježi.', 'Koristimo Google AdSense za oglašavanje i možemo koristiti analitičke usluge. Ove usluge prikupljaju informacije putem kolačića i sličnih tehnologija. Ova politika objašnjava koji se podaci prikupljaju, kako se koriste i vaša prava.'],
    },
    {
      heading: 'Podaci koje prikupljamo',
      bullets: ['Podaci koje dajete: Ako nas kontaktirate putem e-pošte ili našeg obrasca za kontakt, prikupljamo vaše ime, adresu e-pošte i sadržaj poruke.', 'Automatski prikupljene informacije: Naš pružatelj usluga hostinga (Netlify), partneri za oglašavanje i usluge analitike mogu prikupljati: IP adresu, vrstu i verziju preglednika, operativni sustav, vrstu uređaja, URL preporuke, posjećene stranice, vrijeme na web mjestu i približnu geografsku lokaciju.', 'Kolačići treće strane: Naši partneri za oglašavanje (Google AdSense) koriste kolačiće i slične tehnologije za posluživanje i mjerenje oglasa. Sam ANQR ne postavlja nikakve kolačiće prve strane.'],
    },
    {
      heading: 'Kolačići i tehnologije trećih strana',
      paragraphs: ['ANQR ne postavlja nikakve kolačiće prve strane. Vaše postavke (kao što je tamni način) pohranjuju se lokalno na vašem uređaju, što se ne prenosi ni na jedan poslužitelj.', 'Međutim, naši partneri za oglašavanje (Google AdSense) i pružatelj usluga hostinga mogu koristiti kolačiće i slične tehnologije praćenja:'],
      bullets: ['Oglašavački kolačići (treće strane): Google AdSense i partneri za oglašavanje postavili su za posluživanje relevantnih oglasa, mjerenje izvedbe oglasa i razumijevanje interesa korisnika. Ovi kolačići mogu pratiti vašu aktivnost na različitim web stranicama.', 'Analitički kolačići (treće strane): mogu ih koristiti naši pružatelji usluga hostinga ili analitičke usluge za prikupljanje anonimiziranih podataka o korištenju.'],
    },
    {
      heading: 'Google AdSense i oglašavanje',
      paragraphs: ['Oglase prikazujemo putem Google AdSensea. Google i njegovi partneri koriste kolačiće za posluživanje oglasa na temelju vaše povijesti pregledavanja na ovoj stranici i drugim web stranicama (oglašavanje na temelju interesa).', 'Saznajte kako Google koristi vaše podatke: https://policies.google.com/technologies/partner-sites', 'Upravljajte prilagodbom oglasa: https://adssettings.google.com', 'Isključite se putem Inicijative mrežnog oglašavanja: https://optout.networkadvertising.org', 'Isključite se putem Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Kako koristimo informacije',
      bullets: ['Da odgovorimo na vaše upite i pružimo podršku.', 'Za prikazivanje relevantnih oglasa putem naših partnera za oglašavanje.', 'Za analizu korištenja stranice i poboljšanje naših usluga.', 'Za otkrivanje, sprječavanje i rješavanje prijevara, zlouporabe i sigurnosnih problema.', 'Za poštivanje zakonskih obveza.'],
    },
    {
      heading: 'Usluge trećih strana',
      bullets: ['Google AdSense: prima podatke za posluživanje i mjerenje oglasa.', 'Pružatelji usluga analitike: primajte anonimizirane podatke o korištenju.', 'Netlify (hosting): Obrađuje zahtjeve i može zabilježiti IP adrese.', 'Ne prodajemo vaše osobne podatke. Međutim, dijeljenje podataka s partnerima za oglašavanje može se smatrati "prodajom" prema CCPA (vidi dolje).'],
    },
    {
      heading: 'Zadržavanje podataka',
      bullets: ['Podnesci za kontakt: do 2 godine.', 'Dnevnici poslužitelja: do 30 dana (hosting provider).', 'Analitički podaci: do 26 mjeseci (anonimizirano).', 'Oglašavački kolačići: obično 13 mjeseci (ovisi o partneru).'],
    },
    {
      heading: 'Vaša prava prema GDPR-u (EEA korisnici)',
      paragraphs: ['Ako se nalazite u Europskom gospodarskom prostoru, prema Općoj uredbi o zaštiti podataka imate sljedeća prava:'],
      bullets: ['Pravo pristupa: Zatražite kopiju osobnih podataka koje imamo o vama.', 'Pravo na ispravak: Zahtjev za ispravak netočnih podataka.', 'Pravo na brisanje: Zatražite brisanje svojih podataka (pravo na zaborav).', 'Pravo na ograničenje obrade: Zatražite ograničenja načina na koji koristimo vaše podatke.', 'Pravo na prenosivost podataka: Zatražite svoje podatke u prenosivom formatu.', 'Pravo na prigovor: Prigovor na obradu, uključujući za izravni marketing.', 'Pravo na povlačenje privole: Povucite privolu u bilo kojem trenutku ako se obrada temelji na privoli.', 'Pravo na podnošenje pritužbe: Podnesite pritužbu svom tijelu za zaštitu podataka.'],
    },
    {
      heading: 'GDPR pravna osnova',
      paragraphs: ['Podatke obrađujemo na ovim osnovama: (a) Privola - za personalizirano oglašavanje (kojima upravljaju naši partneri za oglašavanje); (b) Legitimni interesi - za analitiku, sigurnost i poboljšanje; (c) Ugovor - odgovoriti na upite.', 'Za ostvarivanje svojih prava kontaktirajte email@anqr.link. Odgovaramo u roku od 30 dana.'],
    },
    {
      heading: 'Vaša prava prema CCPA (korisnici iz Kalifornije)',
      bullets: ['Pravo na informaciju: Zatražite informacije o prikupljenim podacima, izvorima, svrhama i trećim stranama.', 'Pravo na brisanje: Zatražite brisanje svojih osobnih podataka.', 'Pravo na isključenje: Isključite se iz "prodaje" osobnih podataka (dijeljenje s oglasnim partnerima može ispunjavati uvjete).', 'Pravo na nediskriminaciju: Nećemo diskriminirati u ostvarivanju vaših prava.'],
    },
    {
      heading: 'Prikupljene kategorije CCPA',
      paragraphs: ['Kategorije: Identifikatori (IP adresa, ID uređaja), Internetska aktivnost (pregledavanje, interakcije s oglasima), Geolokacija (približna), Zaključci (interesi iz pregledavanja).', 'Za ostvarivanje prava ili isključivanje: email@anqr.link ili prilagodite postavke kolačića.'],
    },
    {
      heading: 'Međunarodni transferi',
      paragraphs: ['Vaši se podaci mogu prenijeti u zemlje s drugačijim zakonima o zaštiti podataka, uključujući Sjedinjene Države. Koristimo odgovarajuće zaštitne mjere kao što su standardne ugovorne klauzule.'],
    },
    {
      heading: 'Privatnost djece',
      paragraphs: ['ANQR nije usmjeren na djecu mlađu od 13 (ili 16 u EEA). Ne prikupljamo svjesno podatke od djece. Kontaktirajte email@anqr.link ako mislite da je dijete dalo informacije.'],
    },
    {
      heading: 'Sigurnost',
      paragraphs: ['Koristimo odgovarajuće tehničke i organizacijske mjere za zaštitu podataka, uključujući HTTPS enkripciju. Međutim, nijedan internetski prijenos nije 100% siguran.'],
    },
    {
      heading: 'Ne prati',
      paragraphs: ['Poštujemo signale preglednika Ne prati gdje je to moguće, iako oglašivački partneri možda neće odgovoriti na DNT.'],
    },
    {
      heading: 'Promjene ove politike',
      paragraphs: ['Ovu politiku možemo povremeno ažurirati. Datum "Zadnje ažuriranje" označava najnoviju reviziju. Značajne promjene mogu se priopćiti putem bannera stranice.'],
    },
    {
      heading: 'Kontaktirajte nas',
      paragraphs: ['Za pitanja o privatnosti ili ostvarivanje svojih prava: email@anqr.link ili upotrijebite našu stranicu za kontakt. Na zahtjeve o privatnosti odgovaramo u roku od 30 dana.'],
    },
    {
      heading: 'Potpuna pravila o privatnosti',
      paragraphs: ['Ova stranica pruža sažetak naših praksi glede privatnosti. Za cjelovita, pravno obvezujuća pravila o privatnosti s potpunim pojedinostima o obradi podataka, vašim pravima i našim obvezama prema GDPR-u, CCPA-u i drugim zakonima o privatnosti, pogledajte našu cjelovitu politiku koju hostira iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Pogledajte punu politiku privatnosti na iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
