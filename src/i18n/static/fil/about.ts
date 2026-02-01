import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Tungkol sa ANQR',
  description: 'Ang ANQR ay isang malayang QR code generator na may client-first approwed QR code lokal o gamitin ang ating API para sa embbeding.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buksan ang generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Browse Matuto ng mga artikulo', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Pribadong Patakaran', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Mga Termino ng Paglilingkod', type: 'external' },
  ],
  sections: [
    {
      heading: 'Ano ba ang ANQR?',
      paragraphs: ['Ang ANQR (binibigkas na "anchor") ay isang libreng QR code generator na lumilikha ng mga kodigong scannable para sa mga URL, teksto, mga kredensiyal ng Wi-Fi, mga contact card, mga kaganapan sa kalendaryo, at higit pa.', 'Ito ay itinatayo para sa mga indibiduwal, maliliit na negosyo, mga marketer, at mga developer na nagnanais ng malakas na mga kasangkapan ng QR nang hindi pumipirma. Ang client-first design ay nangangahulugang QR codes ay lokal na nalilikha sa inyong browser sa pamamagitan ng default, na may opsyonal na server API para sa propesyonal na embending at pagsasanib.'],
    },
    {
      heading: 'Mga pangunahing bahagi',
      bullets: ['Bumuo kaagad ng mga QR code sa iyong browser - walang kinakailangang account.', 'Ang tradisyonal na mga kulay, mga istilong module, mga disenyo sa paghanap, at ang mga balot ng larawan.', 'Export in multiple format: PNG, SVG, WebP, at freshed GIF.', 'Advanced controls para sa error reflection level, QR version, composition mode, at mask selection.', 'Ang Scan-ligtasty guide at live preview upang makatulong upang mapanatili ang mga code na mababasa sa mga print at screen.', 'Server-side API para sa propesyonal na embelding na may buong suportang parameter.', 'Ang paggawa ng mga static web app na dati - rati\'y kargado - nito ay maaari mong patakbuhin saanman.'],
    },
    {
      heading: 'Kung Paano Gumagana ang ANQR',
      paragraphs: ['ANG ANQR ay tumatakbo sa iyong browser at inihahanda ang iyong input sa isang pamantayang QR matrix sa pamamagitan ng Reed–Stank error reflection, pagkatapos ay isinasalin ito sa format na pinili mo.', 'Sa pamamagitan ng default, ang henerasyon ay nangyayari sa inyong browser. Para sa propesyonal na gamit, maaari mo ring gamitin ang server-side API upang lumikha ng mga QR code sa pamamagitan ng URL parameters - perpekto para sa embending sa mga website, emails, o automated workflows.', 'Kapag dinagdagan mo ng mga sapin o mga animation, tinitimbang ng ANQR ang pagiging maaasahan sa scan kaya ang resulta ay nananatiling scanning.', 'Ang ANQR ay nakatuon sa mga static code (ang datos ay nasa loob ng QR). Kung kailangan mo ng isang dinamikong kodigo (maihihiwalay na patutunguhan), maaari mong ayusin ang iyong sariling redirect na URL o maikling kawing.'],
    },
    {
      heading: 'Sino ang nagpapatakbo ng ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Pag - aanunsiyo at kung paano tayo nananatiling malaya',
      paragraphs: ['ANG ANQR ay malayang gamitin at sinusuportahan ng advertising. Maaari nating ipakita ang mga patalastas sa pamamagitan ng Google AdSense at/o iba pang mga kasosyo sa pag-aanunsiyo.', 'Maaaring gumamit ang mga provider ng ad ng cookies o mga katulad na teknolohiya para i-personalize ang mga ad batay sa iyong mga interes at aktibidad sa pagba-browse. Maaari mong pamahalaan ang mga kagustuhan sa ad sa mga setting ng iyong device at sa pamamagitan ng mga setting ng Google ad, at matuto nang higit pa sa aming Patakaran sa Privacy.', 'Hindi namin ipinagbibili ang nilalamang ini-record mo sa QR codes. Ang mga anunsiyo ay tumutulong upang mabayaran ang halaga ng pagtakbo at pagpapabuti ng proyekto.'],
    },
    {
      heading: 'Bukás na mga pamantayan',
      paragraphs: ['Ang ANQR ay gumagawa ng mga code ng QR na batay sa pamantayang ISO/IEC 18004 at naglalayon ng malawakang kombinatorika sa ibayo ng mga scanner, kamera, at print workflows.'],
    },
    {
      heading: 'Napapansing Kalakalan',
      paragraphs: ['Ang QR Code Alonso ay isang rehistradong tatak ng DENSO WAVE INCORPORATED. ANG pornograpya ay hindi iniuugnay, sinasang - ayunan, o itinataguyod ng DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Pagpapakain at mga kontribusyon',
      paragraphs: ['Malugod naming tinatanggap ang impormasyon, mga ulat ng insekto, at tampok na mga mungkahi. Pakisuyong makipag - ugnayan sa pamamagitan ng email o ng contact page - na binabasa natin ang bawat mensahe, bagaman maaaring iba - iba ang oras ng pagtugon.'],
    },
  ],
};

export default about;
