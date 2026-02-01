import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const privacy: PageDefinition = {
  title: 'Kebijakan Privasi',
  description: 'Informasi Informasi koleksi ANQR, bagaimana itu digunakan, dan hak-hak Anda di bawah hukum privasi yang berlaku.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Terminologi Layanan', type: 'external' }],
  sections: [
    {
      heading: 'Ringkasan',
      paragraphs: ['ANCAR adalah generator kode QR dengan pendekatan klien pertama. Kami tidak mewajibkan kepadamu membuat perhitungan. Secara default, kode QR dihasilkan secara lokal dalam peramban Anda - kami tidak memiliki akses ke konten yang Anda encode.', 'Untuk penggunaan profesional, ANQR menyediakan API sisi-server yang menghasilkan kode QR dari parameter URL. Bila menggunakan API, kandungan QR anda diproses dalam server kami untuk membuat gambar, tetapi tidak disimpan atau dilog.', 'Kami menggunakan Google AdSense untuk iklan dan dapat menggunakan layanan analitik. Layanan-layanan ini mengoleksi informasi melalui kuki dan teknologi serupa. Kebijakan ini menjelaskan data apa yang dikumpulkan, bagaimana itu digunakan, dan hak-hak Anda.'],
    },
    {
      heading: 'Informasi yang kita kumpulkan',
      bullets: ['Informasi yang Anda sediakan: Jika Anda menghubungi kami melalui email atau formulir kontak kami, kami mengumpulkan nama, alamat email, dan isi pesan.', 'Informasi yang dikumpulkan secara otomatis: Penyedia hosting kami (Netlify), mitra iklan, dan layanan analitik mungkin mengumpulkan: alamat IP, tipe peramban dan versi, sistem operasi, jenis perangkat, mengacu URL, halaman dikunjungi, waktu di situs, dan perkiraan lokasi geografis.', 'Kue pesta ketiga: Kolaborasi mitra iklan kami (Google AdSense) menggunakan cookie dan teknologi serupa untuk melayani dan mengukur iklan. Dari ANQR sendiri tidak menetapkan kue pihak pertama.'],
    },
    {
      heading: 'Cookies dan teknologi pihak ketiga',
      paragraphs: ['ANQR tidak menetapkan setiap kue pihak pertama. Keutamaan Anda (seperti mode gelap) disimpan secara lokal pada perangkat Anda, yang tidak dikirim ke server manapun.', 'Namun, mitra iklan kami (Google AdSense) dan penyedia hosting mungkin menggunakan cookie dan teknologi pelacakan serupa:'],
      bullets: ['Kue advertising kue (bagian ketiga): Diset oleh Google AdSense dan mitra periklanan untuk melayani iklan yang relevan, mengukur kinerja iklan, dan memahami kepentingan pengguna. Kue ini bisa melacak aktivitasmu di situs yang berbeda.', 'Aku tidak tahu. Mungkin digunakan oleh penyedia hosting atau layanan analitik kami untuk mengumpulkan data penggunaan anonim.'],
    },
    {
      heading: 'Google AdSense dan iklan',
      paragraphs: ['Kami menampilkan iklan melalui Google AdSense. Cucian Google dan mitranya menggunakan kuki untuk melayani iklan berdasarkan sejarah browsing Anda di situs ini dan situs web lainnya (interest-based advertising).', 'Ketahui bagaimana Google menggunakan informasi Anda: https://policies.google.com/technologies/partner-sites', 'Pengurusan kode iklan personalisasi: https://adssettings.google.com', 'Opt out via Network Advertising Inisiatif: https://optout.networkadvertising.org', 'Opt out via Digital Advertising Alliance: https://optout.aboutads.info'],
    },
    {
      heading: 'Bagaimana kita menggunakan informasi',
      bullets: ['Menyambut pertanyaanmu dan memberikan dukungan.', 'Untuk menampilkan iklan yang relevan melalui mitra iklan kami.', 'Untuk menganalisa penggunaan situs dan meningkatkan layanan kami.', 'Untuk mendeteksi, mencegah, dan mengatasi penipuan, penyalahgunaan, dan masalah keamanan.', 'Untuk mematuhi kewajiban hukum.'],
    },
    {
      heading: 'Layanan pihak ketiga',
      bullets: ['ADSense: Menerima data untuk melayani dan mengukur iklan.', 'Penyedia Analitik: Penerima data penggunaan anonim.', 'Kemandirian (hosting): Memproses permintaan dan mungkin log alamat IP.', 'Kami tidak menjual informasi pribadimu. Namun, berbagi data dengan mitra periklanan mungkin dianggap sebagai Øsale" di bawah CCPA (lihat di bawah).'],
    },
    {
      heading: 'Retensi Data',
      bullets: ['Pengiriman Kenalan: Sampai 2 tahun.', 'Log log log log log: Jeoza hingga 30 hari (pembawa tamu).', 'Data Analitik: \\"Overia\\" sampai 26 bulan (anonim).', 'Biskuit iklan: Biasanyak 13 bulan (varian oleh pasangan).'],
    },
    {
      heading: 'Hak anda di bawah GDPR (pengguna EEA)',
      paragraphs: ['Jika Anda berada di Kawasan Ekonomi Eropa, Anda memiliki hak-hak berikut di bawah Regulasi Perlindungan Data Umum:'],
      bullets: ['Hak akses: Meminta salinan data pribadi yang kami pegang tentang Anda.', 'Hak untuk memperbaiki: Permintaan pembetulan data yang tidak akurat.', 'Hak untuk menghapus: Permintaan penghapusan data Anda ("hak untuk dilupakan").', 'Hak untuk membatasi pemrosesan: Permintaan terbatas pada bagaimana kita menggunakan data Anda.', 'Hak untuk portabilitas data: Permintaan data Anda dalam format portabel.', 'Hak untuk objek: Objek untuk diproses, termasuk untuk pemasaran langsung.', 'Hak untuk menarik persetujuan: Persetujuan mundur setiap saat di mana pemrosesan berbasis persetujuan.', 'Hak untuk mengajukan keluhan: Berkas keluhan dengan otoritas perlindungan data Anda.'],
    },
    {
      heading: 'Dasar hukum GDPR',
      paragraphs: ['Kami memproses data tentang dasar-dasar ini: (a) Konsen - untuk iklan yang diperpersonalisasi (diurus oleh mitra iklan kami); (b) Kepentingan yang sah - untuk analitik, keamanan, dan perbaikan; (c) Kontrak - untuk menanggapi pertanyaan.', 'Untuk menjalankan hakmu, hubungi . Kita merespon dalam 30 hari.'],
    },
    {
      heading: 'Hak anda di bawah CCPA (pengguna California)',
      bullets: ['Hak untuk tahu: Meminta informasi mengenai data yang dikumpulkan, sumber, tujuan, dan pihak ketiga.', 'Hak untuk menghapus: Permintaan penghapusan informasi pribadi Anda.', 'Hak untuk opt-out: Oft opt dari Øsale" informasi pribadi (berbagi dengan mitra iklan mungkin memenuhi syarat).', 'Hak untuk non-diskriminasi: Kami tidak akan mendiskriminasikan untuk menjalankan hak-hak Anda.'],
    },
    {
      heading: 'Kategori CCPA yang dikumpulkan',
      paragraphs: ['Kategori: Pengidentifikasi (alamat IP, ID perangkat), aktivitas internet (browsing, interaksi ad), Geolocation (perkiraan), Inference (kepentingan dari browsing).', 'Untuk menjalankan hak atau opt out:  atau menyesuaikan pengaturan cookie.'],
    },
    {
      heading: 'Transfer internasional',
      paragraphs: ['Informasi Anda mungkin dipindahkan ke negara-negara dengan hukum perlindungan data yang berbeda, termasuk Amerika Serikat. Kita menggunakan perlindungan yang tepat seperti Sinus Kontraktual Standar.'],
    },
    {
      heading: 'Privasi anak-anak',
      paragraphs: ['ANCUR tidak diarahkan pada anak di bawah 13 (atau 16 di EEA). Kami tidak mengumpulkan data dari anak-anak. Kontak  jika Anda percaya anak telah memberikan informasi.'],
    },
    {
      heading: 'Keamanan',
      paragraphs: ['Kami menggunakan tindakan teknis dan organisasi yang sesuai untuk melindungi data, termasuk enkripsi HTTPS. Namun, tidak ada transmisi internet 100% aman.'],
    },
    {
      heading: 'Jangan Jejak',
      paragraphs: ['Kami menghormati Jangan melacak sinyal browser di mana layak, meskipun mitra iklan mungkin tidak menanggapi DNT.'],
    },
    {
      heading: 'Acosta diubah ke kebijakan ini',
      paragraphs: ['Kami dapat memperbarui kebijakan ini secara berkala. Revisi terbaru: Perubahan yang signifikan mungkin dapat dikomunikasikan melalui spanduk situs.'],
    },
    {
      heading: 'Hubungi kami',
      paragraphs: ['Untuk pertanyaan privasi atau untuk menjalankan hak Anda: _NAFR_PH_0__ atau gunakan halaman Kontak kami. Kami menanggapi permintaan privasi dalam waktu 30 hari.'],
    },
    {
      heading: 'Dasar Privasi Penuh',
      paragraphs: ['Halaman ini menyediakan ringkasan amalan privasi kami. Untuk mendapatkan dasar privasi yang lengkap dan mengikat secara sah dengan butiran lengkap tentang pemprosesan data, hak anda dan kewajipan kami di bawah GDPR, CCPA dan undang-undang privasi lain, sila lihat dasar penuh kami yang dihoskan oleh iubenda.'],
      links: [{ href: 'https://www.iubenda.com/privacy-policy/70266922', label: 'Lihat Dasar Privasi Penuh di iubenda', type: 'external' }],
    },
  ],
};

export default privacy;
