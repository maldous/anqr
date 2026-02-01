import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Politika zasebnosti',
  description:
    'Podatki, ki jih zbira ANQR, kako se uporabljajo in vaše pravice v skladu z veljavno zakonodajo o zasebnosti.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Pogoji storitve', type: 'external' }],
  sections: [
    {
      heading: 'Povzetek',
      paragraphs: [
        'ANQR je generator kode QR s pristopom, ki je na prvem mestu odjemalec. Ne zahtevamo, da ustvarite račun. Kode QR se privzeto ustvarijo lokalno v vašem brskalniku – nimamo dostopa do vsebine, ki jo kodirate.',
        'Za profesionalno uporabo ANQR ponuja API na strani strežnika, ki generira kode QR iz parametrov URL. Ko uporabljate API, se vaša vsebina QR obdela na naših strežnikih za upodobitev slike, vendar se ne shrani ali zabeleži.',
        'Google AdSense uporabljamo za oglaševanje in lahko uporabljamo analitične storitve. Te storitve zbirajo informacije prek piškotkov in podobnih tehnologij. Ta politika pojasnjuje, kateri podatki se zbirajo, kako se uporabljajo in vaše pravice.',
      ],
    },
    {
      heading: 'Podatki, ki jih zbiramo',
      bullets: [
        'Podatki, ki jih posredujete: če nas kontaktirate prek e-pošte ali našega kontaktnega obrazca, zbiramo vaše ime, e-poštni naslov in vsebino sporočila.',
        'Samodejno zbrani podatki: Naš ponudnik gostovanja (Netlify), oglaševalski partnerji in analitične storitve lahko zbirajo: naslov IP, vrsto in različico brskalnika, operacijski sistem, vrsto naprave, napotitveni URL, obiskane strani, čas na spletnem mestu in približno geografsko lokacijo.',
        'Piškotki tretjih oseb: naši oglaševalski partnerji (Google AdSense) uporabljajo piškotke in podobne tehnologije za prikazovanje in merjenje oglasov. ANQR sam ne nastavi lastnih piškotkov.',
      ],
    },
    {
      heading: 'Piškotki in tehnologije tretjih oseb',
      paragraphs: [
        'ANQR ne nastavi lastnih piškotkov. Vaše nastavitve (kot je temni način) so shranjene lokalno v vaši napravi, ki se ne prenaša na noben strežnik.',
        'Vendar pa lahko naši oglaševalski partnerji (Google AdSense) in ponudnik gostovanja uporabljajo piškotke in podobne tehnologije sledenja:',
      ],
      bullets: [
        'Oglaševalski piškotki (tretja oseba): nastavijo Google AdSense in oglaševalski partnerji za prikazovanje ustreznih oglasov, merjenje učinkovitosti oglasov in razumevanje interesov uporabnikov. Ti piškotki lahko sledijo vaši dejavnosti na različnih spletnih mestih.',
        'Piškotki analitike (tretja oseba): lahko jih uporablja naš ponudnik gostovanja ali storitve analitike za zbiranje anonimiziranih podatkov o uporabi.',
      ],
    },
    {
      heading: 'Google AdSense in oglaševanje',
      paragraphs: [
        'Oglase prikazujemo prek Google AdSense. Google in njegovi partnerji uporabljajo piškotke za prikazovanje oglasov na podlagi vaše zgodovine brskanja na tem spletnem mestu in drugih spletnih mestih (oglaševanje na podlagi zanimanja).',
        'Več o tem, kako Google uporablja vaše podatke: https://policies.google.com/technologies/partner-sites',
        'Upravljajte prilagajanje oglasov: https://adssettings.google.com',
        'Odjavite se prek Network Advertising Initiative: https://optout.networkadvertising.org',
        'Odjava prek Digital Advertising Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Kako uporabljamo informacije',
      bullets: [
        'Za odgovor na vaša vprašanja in zagotavljanje podpore.',
        'Za prikaz ustreznih oglasov prek naših oglaševalskih partnerjev.',
        'Za analizo uporabe spletnega mesta in izboljšanje naših storitev.',
        'Za odkrivanje, preprečevanje in reševanje goljufij, zlorab in varnostnih težav.',
        'Za izpolnjevanje zakonskih obveznosti.',
      ],
    },
    {
      heading: 'Storitve tretjih oseb',
      bullets: [
        'Google AdSense: prejema podatke za prikazovanje in merjenje oglasov.',
        'Ponudniki analitike: prejemajte anonimizirane podatke o uporabi.',
        'Netlify (gostovanje): Obdeluje zahteve in lahko beleži naslove IP.',
        'Vaših osebnih podatkov ne prodajamo. Vendar se lahko deljenje podatkov z oglaševalskimi partnerji šteje za "prodajo" v skladu z CCPA (glejte spodaj).',
      ],
    },
    {
      heading: 'Hranjenje podatkov',
      bullets: [
        'Kontaktne prijave: do 2 leti.',
        'Dnevniki strežnika: do 30 dni (ponudnik gostovanja).',
        'Analitični podatki: do 26 mesecev (anonimizirani).',
        'Oglaševalski piškotki: običajno 13 mesecev (odvisno od partnerja).',
      ],
    },
    {
      heading: 'Vaše pravice v skladu z GDPR (uporabniki EGP)',
      paragraphs: [
        'Če ste v Evropskem gospodarskem prostoru, imate v skladu s Splošno uredbo o varstvu podatkov naslednje pravice:',
      ],
      bullets: [
        'Pravica do dostopa: zahtevajte kopijo osebnih podatkov, ki jih imamo o vas.',
        'Pravica do popravka: Zahtevajte popravek netočnih podatkov.',
        'Pravica do izbrisa: Zahtevajte izbris svojih podatkov (»pravica do pozabe«).',
        'Pravica do omejitve obdelave: zahtevajte omejitve glede tega, kako uporabljamo vaše podatke.',
        'Pravica do prenosljivosti podatkov: zahtevajte svoje podatke v prenosljivi obliki.',
        'Pravica do ugovora: ugovor obdelavi, tudi za neposredno trženje.',
        'Pravica do preklica soglasja: kadar koli prekličete soglasje, če obdelava temelji na soglasju.',
        'Pravica do vložitve pritožbe: Vložite pritožbo pri svojem organu za varstvo podatkov.',
      ],
    },
    {
      heading: 'GDPR pravna podlaga',
      paragraphs: [
        'Podatke obdelujemo na teh osnovah: (a) Soglasje – za prilagojeno oglaševanje (ki ga upravljajo naši oglaševalski partnerji); (b) Zakoniti interesi – za analitiko, varnost in izboljšave; (c) Pogodba – za odgovarjanje na poizvedbe.',
        'Za uveljavljanje svojih pravic se obrnite na email@anqr.link. Odgovorimo v 30 dneh.',
      ],
    },
    {
      heading: 'Vaše pravice po CCPA (uporabniki iz Kalifornije)',
      bullets: [
        'Pravica do obveščenosti: zahtevajte informacije o zbranih podatkih, virih, namenih in tretjih osebah.',
        'Pravica do izbrisa: Zahtevajte izbris svojih osebnih podatkov.',
        'Pravica do zavrnitve: zavrnitev "prodaje" osebnih podatkov (deljenje z oglaševalskimi partnerji je lahko upravičeno).',
        'Pravica do nediskriminacije: pri uveljavljanju vaših pravic ne bomo diskriminirali.',
      ],
    },
    {
      heading: 'Zbrane kategorije CCPA',
      paragraphs: [
        'Kategorije: Identifikatorji (naslov IP, ID naprave), internetna dejavnost (brskanje, interakcije z oglasi), geolokacija (približna), sklepanje (interesi iz brskanja).',
        'Za uveljavljanje pravic ali zavrnitev: email@anqr.link ali prilagodite nastavitve piškotkov.',
      ],
    },
    {
      heading: 'Mednarodni transferji',
      paragraphs: [
        'Vaši podatki se lahko prenesejo v države z drugačno zakonodajo o varstvu podatkov, vključno z Združenimi državami. Uporabljamo ustrezne zaščitne ukrepe, kot so standardne pogodbene klavzule.',
      ],
    },
    {
      heading: 'Zasebnost otrok',
      paragraphs: [
        'ANQR ni namenjen otrokom, mlajšim od 13 let (ali 16 let v EGP). Ne zbiramo zavestno podatkov od otrok. Pišite na email@anqr.link, če menite, da je otrok posredoval podatke.',
      ],
    },
    {
      heading: 'Varnost',
      paragraphs: [
        'Uporabljamo ustrezne tehnične in organizacijske ukrepe za zaščito podatkov, vključno s šifriranjem HTTPS. Vendar pa noben internetni prenos ni 100 % varen.',
      ],
    },
    {
      heading: 'Ne sledi',
      paragraphs: [
        'Spoštujemo signale brskalnika Ne sledi, kjer je to izvedljivo, čeprav se oglaševalski partnerji morda ne bodo odzvali na DNT.',
      ],
    },
    {
      heading: 'Spremembe tega pravilnika',
      paragraphs: [
        'To politiko lahko občasno posodobimo. Datum »Nazadnje posodobljen« označuje zadnjo revizijo. Pomembne spremembe se lahko sporočijo prek pasice spletnega mesta.',
      ],
    },
    {
      heading: 'Kontaktirajte nas',
      paragraphs: [
        'Za vprašanja glede zasebnosti ali za uveljavljanje svojih pravic: email@anqr.link ali uporabite našo kontaktno stran. Na zahteve glede zasebnosti odgovorimo v 30 dneh.',
      ],
    },
    {
      heading: 'Celoten pravilnik o zasebnosti',
      paragraphs: [
        'Na tej strani je povzetek naših praks glede zasebnosti. Za popolno, pravno zavezujočo politiko zasebnosti s podrobnostmi o obdelavi podatkov, vaših pravicah in naših obveznostih v skladu z GDPR, CCPA in drugimi zakoni o zasebnosti si oglejte našo celotno politiko, ki jo gosti iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Oglejte si celotno politiko zasebnosti na iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
