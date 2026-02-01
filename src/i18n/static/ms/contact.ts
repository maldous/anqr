import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kenalan Kita',
  description: 'Kami menyambut tanggapan, laporan bug, permintaan fitur, dan pertanyaan umum.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Bagaimana untuk mencapai kita',
      paragraphs: ['Kami menawarkan beberapa cara untuk menghubungi kami tergantung kebutuhanmu. Kami membaca setiap pesan, meskipun waktu respon mungkin bervariasi berdasarkan volume dan jenis pertanyaan.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Untuk semua pertanyaan: email@anqr.link', 'Inilah cara yang paling dapat diandalkan untuk menjangkau kita dan disarankan untuk pertanyaan terperinci, pertanyaan bisnis, atau pertanyaan lain.'],
    },
    {
      heading: 'Jenis pertanyaan',
      bullets: ['Pertanyaan umum: Pertanyaan tentang bagaimana menggunakan ANQR, penjelasan fitur, atau umpan balik umum.', 'Laporan bug: Tolong masukkan peramban, sistem operasi, langkah-langkah untuk berkembang biak, dan pesan kesalahan yang Anda lihat.', 'Permintaan fitur: Saran untuk fitur atau perbaikan baru. Kita mempertimbangkan semua permintaan meskipun kita tidak dapat menjanjikan implementasi.', 'Pertanyaan bisnis bisnis: Kemitraan kesempatan, pertanyaan lisensi, atau pertanyaan penggunaan komersial.', 'Permintaan Privasi: Permintaan untuk menjalankan hak privasi Anda di bawah GDPR, CCPA, atau hukum privasi lainnya (lihat Kebijakan Privasi).', 'Mac/Copyright: Lihat bagian DMCA di bawah untuk persyaratan pemberitahuan pengambilan.'],
    },
    {
      heading: 'Waktu tanggapan',
      paragraphs: ['Kami bertujuan untuk menanggapi pertanyaan dalam waktu 5-7 hari bisnis. Permintaan terkait privasi akan dialamatkan dalam waktu 30 hari seperti yang diperlukan oleh hukum.', 'Selama periode yang sibuk, masa respon mungkin lebih lama. Untuk hal-hal yang mendesak, tolong tunjukkan "URGENT" dalam baris subjek Anda.'],
    },
    {
      heading: 'Sebelum menghubungi kami',
      paragraphs: ['Silakan periksa halaman dokumentasi kami untuk menjawab pertanyaan umum tentang bagaimana menggunakan fitur ANQR. Ada banyak pertanyaan tentang QR code generation, styling, dan opsi ekspor yang dicakup di sana.'],
    },
    {
      heading: 'Andika Notis Hak Cipta Notis',
      paragraphs: ['Jika Anda percaya bahwa konten yang tersedia pada ANQR melanggar hak cipta Anda, Anda dapat mengajukan pemberitahuan hak cipta Digital Millennium (DMCA). Untuk menjadi valid, pemberitahuan Anda harus mencakup:'],
      bullets: ['Ahli fisika atau elektronik tanda tangan pemilik hak cipta atau agen yang berwenang.', 'Identifikasi karya hak cipta yang diklaim telah melanggar.', 'Identifikasi bahan yang diklaim melanggar, dengan informasi yang cukup untuk menemukannya.', 'Informasi kontak Anda (alamat, nomor telepon, dan alamat email).', 'Sebuah pernyataan yang menyatakan bahwa Anda memiliki keyakinan yang baik bahwa penggunaan bahan tidak diizinkan oleh pemilik hak cipta.', 'Sebuah pernyataan, di bawah hukuman sumpah palsu, bahwa informasi dalam pemberitahuan Anda akurat dan bahwa Anda adalah pemilik hak cipta atau berwenang untuk bertindak atas nama mereka.'],
    },
    {
      heading: 'Kontak DMCA',
      paragraphs: ['Kirim notis DMCA ke: email@anqr.link_', 'Silakan masukkan "DMCA Notice" dalam baris subjek. Kita akan menanggapi pemberitahuan yang sah sesuai dengan hukum yang berlaku. Khagne mencatat bahwa ANQR menghasilkan kode QR secara lokal pada perangkat pengguna dan tidak merumahkan konten yang dihasilkan pengguna.'],
    },
    {
      heading: 'Komuniti Reddit',
      paragraphs: ['Sertai komuniti Reddit kami di r/ANQR untuk berkongsi ciptaan QR anda, bertanya soalan, mendapatkan bantuan dan berhubung dengan pengguna ANQR yang lain.'],
    },
  ],
};

export default contact;
