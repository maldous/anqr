import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: 'Kebijakan Privasi',
  description: 'Informasi ANQR mengumpulkan, bagaimana digunakan, dan hak-hak Anda di bawah hukum privasi berlaku.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Akhir Layanan', type: 'external' }],
  sections: [
    {
      heading: 'Ringkasan',
      paragraphs: ['ANQR adalah generator kode QR dengan pendekatan pertama. Kami tidak memintamu untuk membuat akun. Secara baku, kode QR dihasilkan secara lokal dalam peramban Anda - kita tidak memiliki akses ke isi yang Anda enkripsi.', 'Untuk penggunaan profesional, ANQR menyediakan server-sisi API yang menghasilkan kode QR dari parameter URL. Ketika memakai API, isi QR Anda diproses pada server kami untuk membuat gambar, tetapi tidak disimpan atau log.', 'Kami menggunakan Google AdSense untuk iklan dan dapat menggunakan layanan analisis. Layanan ini mengumpulkan informasi melalui cookie dan teknologi yang sama. Kebijakan ini menjelaskan data apa yang dikumpulkan, bagaimana digunakan, dan hak-hak Anda.'],
    },
    {
      heading: 'Informasi yang kita kumpulkan',
      bullets: ['Informasi yang Anda berikan: Jika Anda menghubungi kami melalui email atau bentuk kontak kami, kami mengumpulkan nama Anda, alamat email, dan isi pesan.', 'Secara otomatis mengumpulkan informasi: Operator hosting kami (Netlify), mitra iklan, dan layanan analisis dapat mengumpulkan: alamat IP, tipe peramban dan versi, sistem operasi, tipe perangkat, merujuk URL, halaman mengunjungi, waktu di situs, dan perkiraan lokasi geografis.', 'Tiga puluh kue pesta: Mitra iklan kami (Google Adsense) menggunakan cookies dan teknologi serupa untuk melayani dan mengukur iklan. ANQR sendiri tidak mengatur kue pesta pertama.'],
    },
    {
      heading: 'Kue dan teknologi pihak ketiga',
      paragraphs: ['ANQR tidak mengatur kue pesta pertama. Pilihan Anda (seperti mode gelap) disimpan secara lokal pada perangkat Anda, yang tidak dikirim ke server manapun.', 'Namun, mitra iklan kami (Google Adsense) dan penyedia hosting dapat menggunakan cookie dan teknologi pelacakan serupa:'],
      bullets: ['Iklan cookies (third-party): Diatur oleh Google Adsense dan mitra iklan untuk melayani iklan yang relevan, mengukur kinerja iklan, dan memahami kepentingan pengguna. Kue ini mungkin melacak aktivitas Anda di situs yang berbeda.', 'Kue analisa (pihak ketiga): Mungkin digunakan oleh penyedia hosting kami atau layanan analisis untuk mengumpulkan data penggunaan anonimised.'],
    },
    {
      heading: 'Google Adsense dan iklan',
      paragraphs: ['Kami menampilkan iklan melalui Google Adsense. Google dan rekannya menggunakan kue untuk melayani iklan berdasarkan riwayat browsing Anda di situs ini dan situs lain (yang menarik - berbasis iklan).', 'Pelajari Google menggunakan informasi Anda: https: / / policies.google.com / teknologi / partner-situs', 'Kelola personalisasi ad: https: / / adssettings.google.com', 'Opt out via Network Advertising Initiative: https: / / optout.networkspading .org', 'Keluar melalui Digital Advertising Alliance: https: / / optout.aboutads.info'],
    },
    {
      heading: 'Bagaimana kita menggunakan informasi',
      bullets: ['Untuk menanggapi pertanyaan Anda dan memberikan dukungan.', 'Untuk menampilkan iklan yang relevan melalui mitra iklan kami.', 'Untuk menganalisis penggunaan situs dan meningkatkan layanan kami.', 'Untuk mendeteksi, mencegah, dan alamat penipuan, penyalahgunaan, dan masalah keamanan.', 'Untuk mematuhi kewajiban hukum.'],
    },
    {
      heading: 'Tiga puluh layanan partai',
      bullets: ['Google Adsense: Menerima data untuk melayani dan mengukur iklan.', 'Penyedia analisa: Menerima data penggunaan anonim.', 'Netlify (hosting): Permintaan proses dan mungkin log alamat IP.', 'Kami tidak menjual informasi pribadi Anda. Namun, berbagi data dengan mitra iklan dapat dianggap "penjualan" di bawah CCPA (lihat di bawah).'],
    },
    {
      heading: 'Retensi data',
      bullets: ['Pengiriman kontak: Sampai 2 tahun.', 'Log server: Sampai 30 hari (provider hosting).', 'Data analisis: Sampai 26 bulan (anonim).', 'Kue iklan: Biasanya 13 bulan (varies oleh mitra).'],
    },
    {
      heading: 'Hak anda dibawah GDPR (pengguna EEA)',
      paragraphs: ['Jika Anda berada di Wilayah Ekonomi Eropa, Anda memiliki hak-hak berikut di bawah Peraturan Perlindungan Data Umum:'],
      bullets: ['Hak akses: Meminta salinan data pribadi yang kami punya tentangmu.', 'Hak untuk perbaikan: Meminta koreksi data yang tidak akurat.', 'Hak untuk memberantas: Permintaan penghapusan data Anda ("hak untuk dilupakan").', 'Hak untuk membatasi pemrosesan: Permintaan batas pada bagaimana kita menggunakan data Anda.', 'Hak ke data portabilitas: Meminta data Anda dalam format portabel.', 'Hak untuk objek: Objek untuk diproses, termasuk pemasaran langsung.', 'Hak untuk menarik persetujuan: Tarik persetujuan kapan saja di mana pemrosesan dibatalkan.', 'Hak untuk mengajukan keluhan: File keluhan dengan otoritas perlindungan data Anda.'],
    },
    {
      heading: 'Dasar legal GDPR',
      paragraphs: ['Kami memproses data pada basis-basis ini: (a) Consent - untuk iklan personalised (dikelola oleh mitra iklan kami); (b) Kepentingan sah - untuk analisis, keamanan, dan perbaikan; (c) Kontrak - untuk menanggapi pertanyaan.', 'Untuk melatih hak-hak Anda, hubungi $_ ANQR _ PH _ 0 _. Kami merespon dalam waktu 30 hari.'],
    },
    {
      heading: 'Hak Anda di bawah CPA (pengguna California)',
      bullets: ['Benar untuk mengetahui: Meminta informasi tentang data yang dikumpulkan, sumber, tujuan, dan pihak ketiga.', 'Hak untuk menghapus: Permintaan penghapusan informasi pribadi Anda.', 'Hak untuk memilih-keluar: Keluar dari "penjualan" informasi pribadi (berbagi dengan mitra iklan mungkin memenuhi syarat).', 'Hak untuk non-diskriminasi: Kami tidak akan mendiskriminasi untuk melaksanakan hak-hak Anda.'],
    },
    {
      heading: 'Kategori CCPA dikumpulkan',
      paragraphs: ['Kategori: Identifikasi (alamat IP, ID perangkat), aktivitas Internet (browsing, interaksi ad), Geolocation (perkiraan), Insustries (kepentingan dari browsing).', 'Untuk hak latihan atau opt keluar: $_ ANQR _ PH _ 0 _ _ or atur pengaturan cookie.'],
    },
    {
      heading: 'Transfer internasional',
      paragraphs: ['Informasi Anda mungkin ditransfer ke negara-negara dengan hukum perlindungan data yang berbeda, termasuk Amerika Serikat. Kami menggunakan pengaman seperti Standard Contractual Clauses.'],
    },
    {
      heading: 'Privasi anak-anak',
      paragraphs: ['ANQR tidak diarahkan pada anak-anak di bawah 13 (atau 16 di EEA). Kami tidak sadar mengumpulkan data dari anak-anak. Kontak $_ _ ANQR _ PH _ 0 _ _ Jika Anda percaya seorang anak telah menyediakan informasi.'],
    },
    {
      heading: 'Keamanan',
      paragraphs: ['Kami menggunakan langkah teknis dan organisasi yang sesuai untuk melindungi data, termasuk enkripsi HTTPS. Namun, tidak ada transmisi internet 100% aman.'],
    },
    {
      heading: 'Jangan Trek',
      paragraphs: ['Kami menghormati Jangan Melacak sinyal peramban di mana layak, meskipun mitra iklan mungkin tidak menanggapi DNT.'],
    },
    {
      heading: 'Perubahan kebijakan ini',
      paragraphs: ['Kita dapat memperbarui kebijakan ini secara berkala. Tanggal "Terakhir diperbarui" mengindikasikan revisi terbaru. Perubahan besar dapat dikomunikasikan melalui spanduk situs.'],
    },
    {
      heading: 'Hubungi kami',
      paragraphs: ['Untuk pertanyaan privasi atau untuk melatih hak-hak Anda: $_ _ ANQR _ PH _ 0 _ _ atau gunakan halaman kontak kami. Kami menanggapi permintaan privasi dalam waktu 30 hari.'],
    },
    {
      heading: 'Kebijakan Privasi Penuh',
      paragraphs: ['Halaman ini memberikan ringkasan praktik privasi kami. Untuk kebijakan privasi yang lengkap dan mengikat secara hukum dengan perincian lengkap tentang pemrosesan data, hak Anda, dan kewajiban kami berdasarkan GDPR, CCPA, dan undang-undang privasi lainnya, silakan lihat kebijakan lengkap kami yang diselenggarakan oleh iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Lihat Kebijakan Privasi Lengkap di iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
