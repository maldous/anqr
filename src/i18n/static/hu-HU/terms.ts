import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const terms: PageDefinition = {
  title: 'Szolgáltatási feltételek',
  description: 'Az oldal elérésével vagy használatával Ön beleegyezik, hogy ezek a feltételek kötelezőek.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Adatvédelmi irányelvek', type: 'external' }],
  sections: [
    {
      heading: 'A feltételek elfogadása',
      paragraphs: ['Az ANQR (anqr.link) elérésével vagy használatával Ön beleegyezik abba, hogy a jelen Szolgáltatási Feltételek és Adatvédelmi irányelveink kötelezik Önt. Ha nem ért egyet ezekkel a feltételekkel, ne használja az oldalt.', 'Időnként frissíthetjük ezeket a feltételeket. A webhely változtatásokat követő folyamatos használata az új feltételek elfogadását jelenti.'],
    },
    {
      heading: 'Támogathatóság',
      paragraphs: ['Az ANQR használatához legalább 13 évesnek kell lennie. Az oldal használatával azt jelképezi, hogy megfelel ennek a kornak. Ha 18 évesnél fiatalabb, azt képviseli, hogy a szülője vagy a gyámja engedélyével használja az oldalt.'],
    },
    {
      heading: 'Engedélyezett alkalmazás',
      paragraphs: ['Az ANQR-t kizárólag törvényes célokra használhatja. Ön kizárólag a QR-kódokba kódolt tartalmakért felelős, valamint a generált QR-kódok használatáért.'],
    },
    {
      heading: 'Tiltott magatartás',
      paragraphs: ['Beleegyezel, hogy nem:'],
      bullets: ['Használja az ANQR-t olyan QR-kódok létrehozására, amelyek megkönnyítik a frázist, rosszindulatú terjesztést, csalást, csalást, zaklatást, rágalmazást vagy bármilyen illegális tevékenységet.', 'A szellemi tulajdonjogokat sértő, a magánélet védelmét sértő vagy illegális anyagokat tartalmazó tartalom kódolása.', 'Próbálja megzavarni, túlterhelni, vagy megzavarni a működését vagy biztonságát a helyszínen.', 'Fordított mérnök, bomlás, vagy megpróbálja kivonni forráskódot a helyszínen.', 'Használjon automatizált eszközöket (botok, kaparók), hogy hozzáférjen a webhely oly módon, hogy csökkenti a teljesítményt más felhasználók számára.', 'A biztonsági vagy hozzáférési funkciók körkörös vagy letiltása.', 'Személybe ejteni bármely személyt vagy entitást, vagy félrevezetni a kötődését.'],
    },
    {
      heading: 'Szellemi tulajdon',
      paragraphs: ['Megtartja a tulajdonjogát a tartalomnak, amit QR kódokba kódol. Az ANQR nem követeli az Ön adatainak tulajdonjogát.', 'Az ANQR név, logó, interfész tervezés és a mögöttes kód szerzői jog, védjegy és egyéb szellemi tulajdonjogi törvények által védett. A mi engedélyünk nélkül nem másolhat, módosíthat, forgalmazhat, illetve nem hozhat létre származékos műveket.', 'A QR Code ® a DENSO WAVE INCORPORATED bejegyzett védjegye. Az ANQR nem kapcsolódik DENSO WAVE-hez.'],
    },
    {
      heading: 'Felhasználói tartalom-engedély',
      paragraphs: ['Az ANQR használatával Ön nem biztosít nekünk jogokat a tartalmához. A helyi generáció (az alapértelmezés) használatakor minden QR kódgeneráció a böngésződben történik, és nem férünk hozzá, tároljuk vagy továbbítjuk a kódolt adatokat.', 'Amikor a szerver- side API-t használja, a tartalmát a QR kép generálásához dolgozza fel, de nem tárolja, nem naplózza, vagy más célra használja a kívánt kép elkészítésén túl.'],
    },
    {
      heading: 'Harmadik fél szolgáltatásai és reklámszolgáltatások',
      paragraphs: ['A webhely hirdetéseket jelenít meg a Google AdSense-en keresztül, és tartalmazhat hivatkozásokat harmadik felek webhelyeire. Nem vállalunk felelősséget harmadik felek tartalmaiért, szolgáltatásaiért vagy adatvédelmi gyakorlataiért.', 'A hirdetőkkel és harmadik felekkel való kapcsolatai kizárólag maguk és ők között állnak fenn. Lásd adatvédelmi irányelveinket a hirdetési adatkezelési gyakorlatokról.'],
    },
    {
      heading: 'A biztosítékokról szóló nyilatkozat',
      paragraphs: ['AZ ANQR OLYAN "MINT" ÉS "AMENNYIRE LEHETSÉGES" ALAPRA VONATKOZIK, AMELY NEM TARTALMAZ SEMMILYEN FAJTA, EXPRESSZ VAGY IMPLICIT KOCKÁZATOT, BELEÉRTVE, DE NEM KORLÁTOZÓDIK A KERESKEDELMI FORGALOMBAN VALÓ RÉSZVÉTEL, A MEGBÍZHATÓSÁG KONKRÉT CÉLJÁNAK ELÉRÉSE ÉRDEKÉBEN, ÉS NEM VONATKOZIK A ZAVARGÁSOKRA.', 'Nem indokoljuk, hogy: a) az oldal zavartalan, biztonságos vagy hibamentes; b) QR-kódok minden környezetben, minden eszközön vagy minden szkenneralkalmazáson; c) az oldal megfelel a követelményeknek.', 'A QR-kódokat mindig a használat körülményei között kell tesztelni (nyomtatási méret, világítás, képernyőtípus, távolság, kamera minőség).'],
    },
    {
      heading: 'A felelősség korlátozása',
      paragraphs: ['A JOG, AZ ANQR ÉS ANNAK ÜZEMELTETŐI, AZ EXPORTTEVÉKENYSÉGEK ÉS A JOGI SZEMÉLYEK ÁLTAL ENGEDÉLYEZETT LEGNAGYOBB MEGENGEDETT MAXIMÁLIS MENNYISÉG NEM VONATKOZHAT A KÖZVETLEN, KÖZVETLEN, INCIDENTALIS, KÜLÖNLEGES, CONSEQUENTIAL, PUNICIPAL, OR EXEMPTIONAL DAMPES, BELEÉRTVE, DE NEM KORLÁTOZVA A BEVÉTELEK, ILLETÉKEK, ADATOK, ÁRUK, FELHASZNÁLÁS, VAGY EGYÉB, AZ ÖN HASZNÁLATÁBÓL VAGY HASZNÁLATÁBÓL SZÁRMAZÓ VAGY AZOK HASZNÁLATÁBÓL SZÁRMAZÓ KÖZVETLEN, KÖZVETETT, INCIDENTAL, INCIDENTAL, CONCENTRAL, CONCENTIONAL, CONCENTRAL VAGY EXEMPTIONAL DAMAGES, BELEÉRTVE, BELEÉRTVE, DE NEM KORLÁTOZVA A BEVÉTELEK, ILLETÉKEK, ADATOK, ÁRUK, FELHASZNÁLÁS, VAGY EGYÉB TARTOZÉKOK ELVESZTÉSÉRE.', 'REMÉLEM MEGÉRTI, HOGY A SZOLGÁLTATÁS HASZNÁLATA A MAGA KOCKÁZATÁVAL JÁR. A SZOLGÁLTATÁS DÍJMENTES, ÉS EGYETÉRT AZZAL, HOGY AZ AQR ÉS ANNAK ÜZEMELTETŐI SEMMILYEN MINŐSÉGBEN VAGY VESZTESÉGBEN NEM KÖTELEZHETŐK ÖNRE. AZ EGYEDI KÖTELEZETTSÉGVÁLLALÁS ÖSSZES ÖSSZESEN.', 'BELEEGYEZEL, HOGY FELSZABADÍTASZ, VÁRSZ ÉS FELOSZLATSZ MINDEN ÉS MINDEN KÖVETELÉST, ROMLÁST, ÉS AZ ANQR-REL ÉS ANNAK ÜZEMELTETŐIVEL SZEMBENI FELLÉPÉSEDET, A SZOLGÁLAT HASZNÁLATÁBÓL EREDŐEN.', 'EGYES BÍRÁLATOK NEM TESZIK LEHETŐVÉ BIZONYOS FELELŐSSÉGI KÖRÖK VAGY FELELŐSSÉGI KORLÁTOK KIZÁRÁSÁT. AZ ILYEN BÍRÁSKODÁSOK ESETÉN A MI FELELŐSSÉGÜNK AZ ALKALMAZANDÓ JOG ÁLTAL BIZTOSÍTOTT MAXIMÁLIS IDŐTARTAMRA KORLÁTOZÓDIK.'],
    },
    {
      heading: 'Megsemmisítés',
      paragraphs: ['Ön vállalja, hogy kártalanítja, védi és tartja ártalmatlan ANQR, üzemeltetői, leányvállalatai, és a megfelelő tisztek, igazgatók, alkalmazottak, és ügynökök bármilyen követelések, károk, veszteségek, kötelezettségek, költségek, és a költségek (beleértve a jogi díjak) származó: a) a webhely használata; b) megsérti ezeket a feltételeket; c) megsérti a harmadik fél jogait; d) bármely tartalom kódolt QR kódok.'],
    },
    {
      heading: 'Vitarendezés',
      paragraphs: ['A jelen Feltételekből vagy az ANQR használatából eredő vitákat először informális tárgyalások útján kell megoldani a $_ _ _ ANQR _ PH _ 0 _ _ címen.', 'Ha az informális megoldás nem sikerül, a vitákat kötelező erejű választottbírósági eljárás útján kell rendezni az ausztráliai Victoriában, azzal a kivétellel, hogy bármelyik fél kérhet indító intézkedést a szellemi tulajdon megsértéséért.'],
    },
    {
      heading: 'A csoportos fellépés alóli mentesség',
      paragraphs: ['A TÖRVÉNY ÁLTAL MEGHATÁROZOTT HATÁRIG, ÖN EGYETÉRT AZZAL, HOGY BÁRMELY NYILVÁNOSSÁGRA HOZOTT FELFÜGGESZTÉSI ELJÁRÁST CSAK VÉGLEGESÍTETT ALAPON LEHET VÉGREHAJTANI, ÉS NEM EGY CSOPORTOS, KONSZOLIDÁLT VAGY REPREZENTATÍV CSELEKVÉS KERETÉBEN.'],
    },
    {
      heading: 'Irányadó jog',
      paragraphs: ['E Feltételeket az ausztráliai Victoria törvényei szabályozzák, a kollíziós elvek figyelembevétele nélkül. Beleegyezel az ausztráliai Victoriában található bíróságok kizárólagos joghatóságába.'],
    },
    {
      heading: 'Változások és rendelkezésre állás',
      paragraphs: ['Bármikor módosíthatjuk, felfüggeszthetjük vagy megszüntethetjük a weboldalt (vagy annak bármely részét) értesítés vagy felelősség nélkül.', 'Ezeket a feltételeket bármikor frissíthetjük. Az "Utolsó frissítés" dátum azt jelzi, hogy mikor került sor a legutóbbi felülvizsgálatra. A változtatásokat követő folyamatos használat elfogadottságnak minősül.'],
    },
    {
      heading: 'Severability',
      paragraphs: ['Ha a jelen Feltételek bármely rendelkezését érvénytelennek vagy végrehajthatatlannak nyilvánítják, azt a lehető legnagyobb mértékben érvényesítik, és a fennmaradó rendelkezések teljes mértékben hatályban maradnak.'],
    },
    {
      heading: 'Mentesség',
      paragraphs: ['A jelen Feltételek bármely jogának vagy rendelkezésének érvényesítésének elmulasztása nem tekinthető az ilyen jog vagy rendelkezés alóli mentességnek.'],
    },
    {
      heading: 'Teljes megállapodás',
      paragraphs: ['Ezek a Feltételek, az Adatvédelmi irányelveinkkel együtt, alkotják az Ön és az ANQR közötti, az oldal használatára vonatkozó teljes megállapodást, és felülírják az előzetes megállapodásokat.'],
    },
    {
      heading: 'Vis maior',
      paragraphs: ['Nem leszünk felelősek az ésszerű ellenőrzésünkön kívül álló körülmények - köztük természeti katasztrófák, háború, terrorizmus, zavargások, kormányzati intézkedések, vagy internet / infrastruktúra meghibásodások - miatt bekövetkező sikertelenségekért vagy késedelmekért.'],
    },
    {
      heading: 'Kapcsolat',
      paragraphs: ['Kérdéseket lehet küldeni: $_ _ _ ANQR _ PH _ 0 _ _'],
    },
  ],
};

export default terms;
