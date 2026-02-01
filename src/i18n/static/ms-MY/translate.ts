import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Bantu Terjemah ANQR',
  description: 'Sertai komuniti penterjemah kami yang membantu menjadikan ANQR boleh diakses oleh pengguna di seluruh dunia. Tiada pengalaman pengekodan diperlukan - menyumbang terus daripada penyemak imbas anda.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Buka Repositori Terjemahan', type: 'external' },
    { href: '/?lang=${lang}', label: 'Buka Penjana', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Mengenai ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Hubungi Kami', type: 'external' },
  ],
  sections: [
    {
      heading: 'Mengapa Menyumbang?',
      paragraphs: ['ANQR digunakan oleh orang di seluruh dunia untuk membuat kod QR untuk perniagaan, acara, pembayaran dan projek peribadi. Dengan menyumbang terjemahan, anda membantu menjadikan alat berkuasa ini boleh diakses oleh pengguna yang lebih suka bahasa ibunda mereka.', 'Setiap sumbangan terjemahan - sama ada membetulkan kesilapan menaip atau menterjemah keseluruhan bahasa - membuat perbezaan yang nyata untuk pengguna dalam komuniti anda.'],
    },
    {
      heading: 'Apa yang Boleh Anda Terjemahkan?',
      paragraphs: ['ANQR mempunyai dua jenis kandungan yang boleh diterjemahkan:'],
      bullets: ['Rentetan UI: Label butang, item menu, petua alat dan teks antara muka yang muncul di seluruh apl.', 'Kandungan Statik: Halaman dokumentasi termasuk panduan, contoh, dasar privasi dan artikel bantuan.', 'Kedua-dua jenis disimpan sebagai fail teks ringkas yang boleh anda edit terus dalam penyemak imbas anda - tiada perisian khas diperlukan.', 'Terjemahan disemak sebelum digabungkan untuk memastikan kualiti dan konsistensi.'],
    },
    {
      heading: 'Cara Menyumbang',
      paragraphs: ['Menyumbang adalah mudah dan tidak memerlukan pengetahuan Git:'],
      bullets: ['Lawati repositori terjemahan awam kami di GitHub.', 'Cari fail bahasa anda (atau buat fail baharu jika bahasa anda belum disokong).', 'Klik ikon pensel untuk mengedit terus dalam penyemak imbas anda.', 'Buat perubahan anda dan klik "Cadangkan perubahan" - GitHub akan membuat permintaan tarik secara automatik.', 'Sumbangan anda akan disemak dan digabungkan, biasanya dalam masa beberapa hari.'],
    },
    {
      heading: 'Garis Panduan Terjemahan',
      paragraphs: ['Semasa menterjemah, sila pastikan ruang letak seperti {name}, {count} dan {{variable}} tidak berubah - ini digantikan dengan nilai dinamik semasa masa jalan. Juga kekalkan sebarang sintaks seperti HTML seperti pautan dalam format [[/path|Label]].', 'Jika anda tidak pasti tentang terjemahan, adalah lebih baik untuk meninggalkannya dalam bahasa Inggeris daripada memberikan terjemahan yang salah. Anda juga boleh membuka isu di GitHub untuk meminta penjelasan.'],
    },
    {
      heading: 'Bahasa yang Disokong Pada Masa Ini',
      paragraphs: ['ANQR kini menyokong lebih 40 bahasa, termasuk:'],
      bullets: ['Bahasa utama dunia: Inggeris, Cina, Sepanyol, Arab, Hindi, Portugis, Jepun, Korea, Perancis, Jerman, Rusia dan banyak lagi.', 'Bahasa Asia Tenggara: Thai, Vietnam, Indonesia, Filipina, Melayu, Khmer, Lao, Burma.', 'Bahasa Asia Selatan: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepal.'],
    },
    {
      heading: 'Pengiktirafan',
      paragraphs: ['Semua penyumbang dikreditkan dalam repositori kami. Kerja anda membantu beribu-ribu pengguna mengakses ANQR dalam bahasa pilihan mereka.', 'Terima kasih kepada semua penyumbang terjemahan kami kerana membantu menjadikan ANQR boleh diakses di seluruh dunia!'],
    },
    {
      heading: 'Soalan?',
      paragraphs: ['Jika anda mempunyai soalan tentang menyumbang terjemahan, sila buka isu pada repositori GitHub kami atau hubungi kami melalui e-mel. Kami gembira dapat membantu anda bermula.'],
    },
  ],
};

export default translate;
