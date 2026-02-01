import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Tentang ANQR',
  description: 'ANQR adalah generator kode QR bebas dengan pendekatan pertama - hasilkan kode QR lokal atau gunakan API kami untuk embedding.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buka generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Ramban artikel Pelajari', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Kebijakan Privasi', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Akhir Layanan', type: 'external' },
  ],
  sections: [
    {
      heading: 'Apa itu ANQR?',
      paragraphs: ['ANQR (diucapkan "anchor") adalah kode generator QR bebas yang menciptakan kode scannable untuk URL, teks, kredensial WiFi, kontak kartu, peristiwa kalender, dan banyak lagi.', 'Dibangun untuk individu, usaha kecil, pemasaran, dan pengembang yang menginginkan alat-alat QR yang kuat tanpa mendaftar. Desain klien- pertama berarti kode QR dihasilkan secara lokal dalam peramban Anda secara baku, dengan server opsional API untuk pengembangan profesional dan integrasi.'],
    },
    {
      heading: 'Fitur kunci',
      bullets: ['Hasilkan kode QR langsung dalam peramban Anda - tidak ada akun yang diperlukan.', 'Warna pelanggan, gaya modul, pola penemu, dan menambahkan gambar overlay.', 'Ekspor dalam beberapa format: PNG, SVG, WebP, dan animasi GIF.', 'Kontrol tingkat lanjut untuk tingkat koreksi kesalahan, QR versi, mode pengkodean, dan pilihan mask.', 'Pemindai-bimbingan keselamatan dan pratinjau langsung untuk membantu menjaga kode dapat dibaca dalam cetak dan pada layar.', 'API Server- sisi profesional embedding dengan dukungan parameter penuh.', 'Bekerja offline sekali dimuat - itu adalah aplikasi statis web Anda dapat berjalan di mana saja.'],
    },
    {
      heading: 'Bagaimana ANQR bekerja',
      paragraphs: ['ANQR berjalan dalam peramban Anda dan memasukkan masukan Anda ke dalam matriks standar QR dengan Reed- Solomon error koreksi, kemudian merender ke format yang Anda pilih.', 'Secara baku, generasi terjadi secara lokal di browser Anda. Untuk penggunaan profesional, Anda juga dapat menggunakan server-side API untuk menghasilkan kode QR melalui parameter URL - sempurna untuk embedding dalam website, email, atau otomatis mengalir kerja.', 'Ketika Anda menambahkan overlay atau animasi, gaya keseimbangan ANQR dengan kemampuan pemindaian sehingga hasil tetap dapat dipindai.', 'ANQR berfokus pada kode statis (data berada di dalam QR). Bila Anda memerlukan suatu kode dinamis (tujuan yang dapat disuntikkan), Anda dapat mengkodekan sendiri URL redirect atau link pendek.'],
    },
    {
      heading: 'Siapa yang mengoperasikan ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Iklan dan bagaimana kita tetap bebas',
      paragraphs: ['ANQR gratis untuk digunakan dan didukung oleh iklan. Kami mungkin menampilkan iklan melalui Google AdSense dan/atau mitra periklanan lainnya.', 'Penyedia iklan dapat menggunakan cookie atau teknologi serupa untuk mempersonalisasi iklan berdasarkan minat dan aktivitas penjelajahan Anda. Anda dapat mengelola preferensi iklan di pengaturan perangkat Anda dan melalui pengaturan iklan Google, dan mempelajari lebih lanjut di Kebijakan Privasi kami.', 'Kami tidak menjual isi yang Anda masukkan ke dalam kode QR. Iklan membantu menutupi biaya berjalan dan meningkatkan proyek.'],
    },
    {
      heading: 'Standar terbuka',
      paragraphs: ['ANQR menghasilkan kode QR berdasarkan standar ISO / IEC 18004 dan bertujuan untuk kompatibilitas luas di scanner, kamera, dan cetak arus kerja.'],
    },
    {
      heading: 'Pemberitahuan trademark',
      paragraphs: ['QR Code ® adalah merek dagang terdaftar DENSO WAVE INCORATED. ANQR tidak berafiliasi dengan, didukung oleh, atau disponsori oleh DENSO WAVE INCORATED.'],
    },
    {
      heading: 'Feedback dan kontribusi',
      paragraphs: ['Kami menyambut umpan balik, laporan bug, dan saran fitur. Harap hubungi via email atau halaman kontak - kami membaca setiap pesan, meskipun waktu respon mungkin bervariasi.'],
    },
  ],
};

export default about;
