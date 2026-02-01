import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontak ons',
  description: 'Ons verwelkom terugvoer, foutverslae, kenmerkversoeke en algemene navrae.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Hoe om ons te bereik',
      paragraphs: ['Ons bied verskeie maniere om ons te kontak afhangende van jou behoeftes. Ons lees elke boodskap, alhoewel reaksietye kan verskil op grond van volume en navraagtipe.'],
    },
    {
      heading: 'E-pos',
      paragraphs: ['Vir alle navrae: email@anqr.link', 'Dit is die mees betroubare manier om ons te bereik en word aanbeveel vir gedetailleerde vrae, besigheidsnavrae of enige ander navrae.'],
    },
    {
      heading: 'Soorte navrae',
      bullets: ['Algemene vrae: Vrae oor hoe om ANQR te gebruik, kenmerkverduidelikings of algemene terugvoer.', 'Foutverslae: Sluit asseblief jou blaaier, bedryfstelsel, stappe om te reproduseer en enige foutboodskappe wat jy sien in.', 'Kenmerkversoeke: Voorstelle vir nuwe kenmerke of verbeterings. Ons oorweeg alle versoeke alhoewel ons nie implementering kan belowe nie.', 'Besigheidsnavrae: Vennootskapgeleenthede, lisensiëringsvrae of kommersiële gebruiknavrae.', 'Privaatheidsversoeke: Versoeke om jou privaatheidsregte onder GDPR, CCPA of ander privaatheidswette uit te oefen (sien Privaatheidsbeleid).', 'DMCA/Kopiereg: Sien die DMCA-afdeling hieronder vir vereistes vir verwyderingkennisgewing.'],
    },
    {
      heading: 'Reaksie tye',
      paragraphs: ['Ons streef daarna om binne 5-7 werksdae op navrae te reageer. Privaatheidsverwante versoeke sal binne 30 dae aangespreek word soos deur die wet vereis word.', 'Gedurende besige periodes kan reaksietye langer wees. Vir dringende sake, dui asseblief "DRINGEND" in jou onderwerpreël aan.'],
    },
    {
      heading: 'Voordat u ons kontak',
      paragraphs: ['Gaan asseblief ons Dokumentasie-bladsy na vir antwoorde op algemene vrae oor hoe om ANQR-kenmerke te gebruik. Baie vrae oor QR-kode generering, stilering en uitvoer opsies word daar gedek.'],
    },
    {
      heading: 'DMCA Kopiereg Kennisgewings',
      paragraphs: ['As jy glo dat inhoud wat op ANQR beskikbaar is, jou kopiereg skend, kan jy \'n Digital Millennium Copyright Act (DMCA) verwyderingskennisgewing indien. Om geldig te wees, moet jou kennisgewing die volgende insluit:'],
      bullets: ['\'n Fisiese of elektroniese handtekening van die kopieregeienaar of gemagtigde agent.', 'Identifikasie van die kopieregbeskermde werk wat beweer word dat dit geskend is.', 'Identifikasie van die materiaal wat beweer word dat dit inbreuk maak, met voldoende inligting om dit op te spoor.', 'Jou kontakinligting (adres, telefoonnommer en e-posadres).', '\'n Verklaring dat jy in goeie trou glo dat die gebruik van die materiaal nie deur die kopieregeienaar gemagtig is nie.', '\'n Verklaring, onder straf van meineed, dat die inligting in jou kennisgewing akkuraat is en dat jy die kopieregeienaar is of gemagtig is om namens hulle op te tree.'],
    },
    {
      heading: 'DMCA Kontak',
      paragraphs: ['Stuur DMCA-kennisgewings na: email@anqr.link', 'Sluit asseblief "DMCA Kennisgewing" in die onderwerplyn in. Ons sal reageer op geldige kennisgewings in ooreenstemming met toepaslike wetgewing. Let daarop dat ANQR QR-kodes plaaslik op gebruikerstoestelle genereer en nie gebruikergegenereerde inhoud huisves nie.'],
    },
    {
      heading: 'Reddit-gemeenskap',
      paragraphs: ['Sluit aan by ons Reddit-gemeenskap by r/ANQR om jou QR-skeppings te deel, vrae te vra, hulp te kry en met ander ANQR-gebruikers te skakel.'],
    },
  ],
};

export default contact;
