import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Perihal ANQR',
  description: 'ANUQR adalah generator kode QR gratis dengan pendekatan pertama klien - menghasilkan kode QR secara lokal atau menggunakan API kami untuk pembenaman.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: '♪ Buka generatornya ♪', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Artikel - artikel yang telah diulas', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Kebijakan Privasi', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Terminologi Layanan', type: 'external' },
  ],
  sections: [
    {
      heading: 'Apa itu ANQR?',
      paragraphs: ['Woador ANQR (diucapkan  "anchor") adalah generator kode QR gratis yang menciptakan kode scannable untuk URL, teks, kredensial Wi-Fi, kartu kontak, acara kalender, dan masih banyak lagi.', 'Ini dibangun untuk individu, bisnis kecil, pemasar, dan pengembang yang menginginkan alat QR yang kuat tanpa mendaftar. Desain klien-pertama berarti kode QR dihasilkan secara lokal di peramban Anda secara default, dengan API server opsional untuk pembenaman dan integrasi profesional.'],
    },
    {
      heading: 'Fitur Kunci Microsoft',
      bullets: ['Hasilkan kode QR secara instan dalam peramban Anda - tidak diperlukan akun.', 'Kebiasaankan warna, gaya modul, pola pencari, dan tambahkan overlay gambar.', 'Ekspor evapor dalam berbagai format: PNG, SVG, WebP, dan GIF animasi.', 'Pengendalian lanjutan untuk tingkat pembetulan kesalahan, versi QR, mode pengkodean, dan pemilihan topeng.', 'Panduan scan-safety dan live preview untuk membantu menjaga kode dapat dibaca dalam cetak dan pada layar.', 'API sisi-server untuk pembenaman profesional dengan dukungan parameter penuh.', 'Ini aplikasi web statis yang bisa kau jalankan di mana saja.'],
    },
    {
      heading: 'Cara kerja ANQR',
      paragraphs: ['XAQR berjalan di peramban Anda dan mengkodekan masukan Anda ke dalam matriks QR standar dengan pembetulan kesalahan Reed–Solomon, lalu membuatnya ke format yang Anda pilih.', 'Secara baku, generasi terjadi secara lokal dalam peramban Anda. Untuk penggunaan profesional, Anda juga dapat menggunakan API sisi-server untuk menghasilkan kode QR melalui parameter URL - cocok untuk pembenaman dalam situs web, email, atau alur kerja otomatis.', 'Ketika Anda menambahkan overlay atau animasi, ANQR menyeimbangkan styling dengan keandalan pemindaian sehingga hasilnya tetap dapat dipindai.', 'Dominico ANQR berfokus pada kode statis (data berada di dalam QR). KATA jika Anda membutuhkan kode dinamis (disunting destinasi), Anda dapat mengenkode URL arahkan sendiri atau link pendek.'],
    },
    {
      heading: 'Siapa yang mengoperasikan ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Iklan dan bagaimana kita tetap bebas',
      paragraphs: ['MASYARAKAT bebas digunakan dan didukung oleh iklan. Kami mungkin menunjukkan iklan melalui Google AdSense dan/atau mitra iklan lainnya.', 'Provivider Ad display mungkin menggunakan kuki atau teknologi serupa untuk mempersonalisasi iklan berdasarkan kepentingan dan aktivitas browsing Anda. Anda dapat mengatur preferensi iklan dalam pengaturan perangkat Anda dan melalui pengaturan iklan Google, dan belajar lebih banyak dalam Kebijakan Privasi kami.', 'Kami tidak menjual konten yang Anda encode ke kode QR. Para Ads membantu menutupi biaya untuk menjalankan dan meningkatkan proyek.'],
    },
    {
      heading: 'Standar terbuka',
      paragraphs: ['Keserasian ANQR menghasilkan kode QR berdasarkan standar ISO/IEC 18004 dan bertujuan untuk keserasian luas melintasi scanner, kamera, dan print workflow.'],
    },
    {
      heading: 'Notice Trademark',
      paragraphs: ['Kode® QR adalah merek dagang terdaftar dari DENSO WAVE INCORPORATED. ANQR tidak berafiliasi dengan, didukung oleh, atau disponsori oleh DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Sumbangan dan sumbangan',
      paragraphs: ['Kami menyambut tanggapan, laporan bug, dan saran - saran berikut. Tolong hubungi melalui email atau halaman kontak - kita membaca setiap pesan, meskipun waktu respon mungkin bervariasi.'],
    },
  ],
};

export default about;
