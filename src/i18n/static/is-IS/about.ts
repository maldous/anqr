import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const about: PageDefinition = {
  title: 'Um ANQR',
  description: 'ANQR er ókeypis QR kóða rafall með viðskiptavinur-fyrsta nálgun - búðu til QR kóða á staðnum eða notaðu API okkar til að fella inn.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Opnaðu rafalann', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Skoða Lærðu greinar', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Persónuverndarstefna', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Þjónustuskilmálar', type: 'external' },
  ],
  sections: [
    {
      heading: 'Hvað er ANQR?',
      paragraphs: ['ANQR (borið fram „akkeri") er ókeypis QR kóða rafall sem býr til skannanlega kóða fyrir vefslóðir, texta, Wi-Fi skilríki, tengiliðaspjöld, dagatalsviðburði og fleira.', 'Það er smíðað fyrir einstaklinga, lítil fyrirtæki, markaðsmenn og forritara sem vilja öflug QR verkfæri án þess að skrá sig. Fyrsta viðskiptavinurinn þýðir að QR kóðar eru sjálfgefið búnir til staðbundið í vafranum þínum, með valfrjálsu netþjóns API fyrir faglega innfellingu og samþættingu.'],
    },
    {
      heading: 'Helstu eiginleikar',
      bullets: ['Búðu til QR kóða samstundis í vafranum þínum - engin reikningur krafist.', 'Sérsníddu liti, einingarstíla, leitarmynstur og bættu við myndayfirlögnum.', 'Flytja út á mörgum sniðum: PNG, SVG, WebP og hreyfimyndað GIF.', 'Ítarlegar stýringar fyrir villuleiðréttingarstig, QR útgáfu, kóðunarstillingu og grímuval.', 'Leiðbeiningar um skannaðaröryggi og sýnishorn í beinni til að halda kóðanum læsilegum á prenti og á skjám.', 'API á netþjóni fyrir faglega innfellingu með fullum breytustuðningi.', 'Virkar án nettengingar þegar það er hlaðið - það er kyrrstætt vefforrit sem þú getur keyrt hvar sem er.'],
    },
    {
      heading: 'Hvernig ANQR virkar',
      paragraphs: ['ANQR keyrir í vafranum þínum og umritar inntakið þitt í staðlað QR fylki með Reed–Solomon villuleiðréttingu og gerir það síðan á það snið sem þú velur.', 'Sjálfgefið er að myndun gerist á staðnum í vafranum þínum. Fyrir faglega notkun geturðu líka notað API á netþjóni til að búa til QR kóða með vefslóðabreytum - fullkomið til að fella inn í vefsíður, tölvupóst eða sjálfvirkt verkflæði.', 'Þegar þú bætir við yfirborði eða hreyfimyndum kemur ANQR jafnvægi á stíl við skannaáreiðanleika svo útkoman er áfram skannanleg.', 'ANQR einbeitir sér að kyrrstæðum kóða (gögnin eru inni í QR). Ef þig vantar kraftmikinn kóða (breytanlegan áfangastað) geturðu kóðað þína eigin tilvísunarslóð eða stuttan hlekk.'],
    },
    {
      heading: 'Hver rekur ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Auglýsingar og hvernig við höldum frjáls',
      paragraphs: ['ANQR er ókeypis í notkun og er stutt af auglýsingum. Við gætum sýnt auglýsingar í gegnum Google AdSense og/eða aðra auglýsingaaðila.', 'Auglýsingaveitendur kunna að nota vafrakökur eða svipaða tækni til að sérsníða auglýsingar út frá áhugamálum þínum og vafravirkni. Þú getur stjórnað kjörstillingum auglýsinga í stillingum tækisins þíns og í gegnum auglýsingastillingar Google og lært meira í persónuverndarstefnu okkar.', 'Við seljum ekki efnið sem þú kóðar í QR kóða. Auglýsingar hjálpa til við að standa straum af kostnaði við að keyra og bæta verkefnið.'],
    },
    {
      heading: 'Opnir staðlar',
      paragraphs: ['ANQR býr til QR kóða byggða á ISO/IEC 18004 staðlinum og miðar að víðtækri eindrægni milli skanna, myndavéla og prentverkflæðis.'],
    },
    {
      heading: 'Tilkynning um vörumerki',
      paragraphs: ['QR Code® er skráð vörumerki DENSO WAVE INCORPORATED. ANQR is not affiliated with, endorsed by, or sponsored by DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Endurgjöf og framlög',
      paragraphs: ['Við fögnum viðbrögðum, villutilkynningum og uppástungum um eiginleika. Vinsamlegast hafðu samband í gegnum tölvupóst eða tengiliðasíðuna - við lesum öll skilaboð, þó viðbragðstími geti verið mismunandi.'],
    },
  ],
};

export default about;
