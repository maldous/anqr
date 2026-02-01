import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Makipag - ugnayan sa Atin',
  description: 'Malugod naming tinatanggap ang impormasyon, mga ulat ng insekto, mga kahilingan sa tampok na bahagi, at pangkalahatang mga enquiry.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Kung paano tayo maaabot',
      paragraphs: ['Nag - aalok kami ng ilang paraan upang makausap kami depende sa inyong mga pangangailangan. Binabasa natin ang bawat mensahe, bagaman ang oras ng pagtugon ay maaaring iba - iba batay sa dami at tipo ng pasasalamat.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Sa lahat ng mga tanong: ', 'Ito ang pinakamapagkakatiwalaang paraan upang marating tayo at iminumungkahi para sa detalyadong mga tanong, mga enquiry sa negosyo, o iba pang mga enquiry.'],
    },
    {
      heading: 'Mga uri ng enquiry',
      bullets: ['Karaniwang mga tanong: Mga tanong kung paano gagamitin ang ANQR, tampok na mga paliwanag, o pangkalahatang impormasyon.', 'Nag - uulat ang Bug: Pakisuyong isama ang iyong browser, operating system, mga hakbang upang magparami, at anumang maling mensahe na nakikita mo.', 'Mga kahilingan sa pag - aanak: Mga mungkahi para sa bagong mga katangian o mga pagsulong. Isinasaalang - alang natin ang lahat ng kahilingan bagaman hindi tayo maaaring mangako ng pagpapatupad.', 'Mga tanong tungkol sa negosyo: Ang mga pagkakataon para maging kapareha, mga tanong na nagbibigay ng lisensiya, o komersiyal na paggamit ng mga enquiry.', 'Mga kahilingan sa pribadong buhay: Mga kahilingan upang isagawa ang iyong karapatan sa pribadong buhay sa ilalim ng GDPR, CCPA, o iba pang mga batas tungkol sa pribadong buhay (tingnan ang Pribadong Patakaran).', 'DMCA/Copyright: Tingnan ang bahaging DMCA sa ibaba para sa mga kahilingan para sa pagkuha ngdown notice.'],
    },
    {
      heading: 'Mga Panahon ng Pagtugon',
      paragraphs: ['Layunin naming tumugon sa mga enquiry sa loob ng 5-7 na araw ng negosyo. Pribadong-relatibong mga kahilingan ay sasagutin sa loob ng 30 araw gaya ng hinihiling ng batas.', 'Sa abalang mga panahon, ang panahon ng pagtugon ay maaaring mas mahaba. Para sa mga bagay na apurahan, pakisuyong ipahiwatig ang "URGENT" sa iyong paksa.'],
    },
    {
      heading: 'Bago makipag - ugnayan sa amin',
      paragraphs: ['Pakisuyong tingnan ang aming Documentation page para sa mga sagot sa karaniwang mga tanong kung paano gagamitin ang ANQR features. Maraming mga tanong tungkol sa QR code generation, styling, at mga pagpipilian sa pagluluwas ay saklaw doon.'],
    },
    {
      heading: 'DMCA Tumpak na mga Nota',
      paragraphs: ['Kung ikaw ay naniniwala na ang nilalaman na makukuha sa ANQR infryed ang iyong copyright, maaari kang magsumite ng isang Digital Millennium Copyright Act (DMCA) na patalastas. Upang maging totoo, dapat na kasali sa iyong notisya ang:'],
      bullets: ['Isang pisikal o elektronikong lagda ng may-akda ng copyright o ahenteng may-akda.', 'Ang pagkilala sa akda na may karapatan sa copyright ay sinasabing nabigo.', 'Ang pagkilala sa materyal na sinasabing nag - uumpukan, na may sapat na impormasyon upang makita ito.', 'Ang iyong contact information (address, numero ng telepono, at adres ng email).', 'Isang pangungusap na may mabuting pananampalataya ang naniniwala na ang paggamit ng materyal ay hindi galing sa may - ari ng copyright.', 'Isang pangungusap, sa ilalim ng parusa ng perjury, na ang impormasyon sa iyong patalastas ay tama at na ikaw ang may - ari ng copyright o may - akda na inatasang kumilos alang - alang sa kanila.'],
    },
    {
      heading: 'Pakikipag - ugnayan sa DMCA',
      paragraphs: ['Magpadala ng mga patalastas sa DMCA: ', 'Pakisuyong isama ang "DMCA Note" sa linyang pantelebisyon. Tayo\'y tutugon sa makatuwirang mga babala ayon sa kapit na batas. Pansinin na ang ANQR ay lumilikha ng QR code sa mga user device at hindi naglalaman ng user-generated nilalaman.'],
    },
    {
      heading: 'Reddit Community',
      paragraphs: ['Sumali sa aming komunidad ng Reddit sa r/ANQR upang ibahagi ang iyong mga nilikhang QR, magtanong, humingi ng tulong, at kumonekta sa iba pang mga user ng ANQR.'],
    },
  ],
};

export default contact;
