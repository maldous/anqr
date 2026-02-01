import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Membantu Menerjemahkan ANQR',
  description: 'Bergabunglah dengan komunitas penerjemah kami yang membantu menjadikan ANQR dapat diakses oleh pengguna di seluruh dunia. Tidak diperlukan pengalaman coding - berkontribusi langsung dari browser Anda.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Buka Repositori Terjemahan', type: 'external' },
    { href: '/?lang=${lang}', label: 'Buka Generatornya', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Tentang ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Hubungi Kami', type: 'external' },
  ],
  sections: [
    {
      heading: 'Mengapa Berkontribusi?',
      paragraphs: ['ANQR digunakan oleh orang-orang di seluruh dunia untuk membuat kode QR untuk bisnis, acara, pembayaran, dan proyek pribadi. Dengan menyumbangkan terjemahan, Anda membantu membuat alat canggih ini dapat diakses oleh pengguna yang lebih menyukai bahasa ibu mereka.', 'Setiap kontribusi terjemahan - baik memperbaiki kesalahan ketik atau menerjemahkan seluruh bahasa - memberikan perbedaan nyata bagi pengguna di komunitas Anda.'],
    },
    {
      heading: 'Apa yang Dapat Anda Terjemahkan?',
      paragraphs: ['ANQR memiliki dua jenis konten yang dapat diterjemahkan:'],
      bullets: ['String UI: Label tombol, item menu, keterangan alat, dan teks antarmuka yang muncul di seluruh aplikasi.', 'Konten Statis: Halaman dokumentasi termasuk panduan, contoh, kebijakan privasi, dan artikel bantuan.', 'Kedua jenis ini disimpan sebagai file teks sederhana yang dapat Anda edit langsung di browser Anda - tidak diperlukan perangkat lunak khusus.', 'Terjemahan ditinjau sebelum digabungkan untuk memastikan kualitas dan konsistensi.'],
    },
    {
      heading: 'Bagaimana Berkontribusi',
      paragraphs: ['Berkontribusi itu mudah dan tidak memerlukan pengetahuan Git:'],
      bullets: ['Kunjungi repositori terjemahan publik kami di GitHub.', 'Temukan file bahasa Anda (atau buat file baru jika bahasa Anda belum didukung).', 'Klik ikon pensil untuk mengedit langsung di browser Anda.', 'Buat perubahan Anda dan klik "Usulkan perubahan" - GitHub akan secara otomatis membuat permintaan tarik.', 'Kontribusi Anda akan ditinjau dan digabungkan, biasanya dalam beberapa hari.'],
    },
    {
      heading: 'Pedoman Penerjemahan',
      paragraphs: ['Saat menerjemahkan, harap pertahankan placeholder seperti {name}, {count}, dan {{variable}} tidak berubah - ini diganti dengan nilai dinamis saat runtime. Pertahankan juga sintaksis mirip HTML seperti tautan dalam format [[/path|Label]].', 'Jika Anda tidak yakin dengan terjemahannya, lebih baik membiarkannya dalam bahasa Inggris daripada memberikan terjemahan yang salah. Anda juga dapat membuka masalah di GitHub untuk meminta klarifikasi.'],
    },
    {
      heading: 'Bahasa yang Didukung Saat Ini',
      paragraphs: ['ANQR saat ini mendukung lebih dari 40 bahasa, termasuk:'],
      bullets: ['Bahasa utama dunia: Inggris, Cina, Spanyol, Arab, Hindi, Portugis, Jepang, Korea, Prancis, Jerman, Rusia, dan banyak lagi.', 'Bahasa Asia Tenggara: Thailand, Vietnam, Indonesia, Filipina, Melayu, Khmer, Lao, Burma.', 'Bahasa Asia Selatan: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Pengakuan',
      paragraphs: ['Semua kontributor dikreditkan dalam repositori kami. Pekerjaan Anda membantu ribuan pengguna mengakses ANQR dalam bahasa pilihan mereka.', 'Terima kasih kepada semua kontributor terjemahan kami yang membantu membuat ANQR dapat diakses di seluruh dunia!'],
    },
    {
      heading: 'Pertanyaan?',
      paragraphs: ['Jika Anda memiliki pertanyaan tentang kontribusi terjemahan, silakan buka terbitan di repositori GitHub kami atau hubungi kami melalui email. Kami dengan senang hati membantu Anda memulai.'],
    },
  ],
};

export default translate;
