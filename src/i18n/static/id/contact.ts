import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Hubungi Kami',
  description: 'Kami menyambut umpan balik, laporan bug, permintaan fitur, dan pertanyaan umum.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Bagaimana mencapai kita',
      paragraphs: ['Kami menawarkan beberapa cara untuk menghubungi kami tergantung pada kebutuhan Anda. Kami membaca setiap pesan, meskipun waktu respon mungkin bervariasi berdasarkan volume dan jenis pertanyaan.'],
    },
    {
      heading: 'Surel',
      paragraphs: ['Untuk semua pertanyaan: $_ _ ANQR _ PH _ 0 _ _', 'Ini adalah cara yang paling dapat diandalkan untuk menghubungi kita dan disarankan untuk pertanyaan rinci, pertanyaan bisnis, atau pertanyaan lainnya.'],
    },
    {
      heading: 'Jenis pertanyaan',
      bullets: ['Pertanyaan umum: Pertanyaan tentang bagaimana menggunakan ANQR, fitur penjelasan, atau umpan balik umum.', 'Laporan bug: Silakan masukkan peramban, sistem operasi Anda, langkah untuk mereproduksi, dan pesan kesalahan apapun yang Anda lihat.', 'Permintaan fitur: Saran untuk fitur atau perbaikan baru. Kami mempertimbangkan semua permintaan meskipun kita tidak bisa menjanjikan implementasi.', 'Pertanyaan bisnis: Kesempatan kemitraan, pertanyaan lisensi, atau pertanyaan penggunaan komersial.', 'Permintaan privasi: Permintaan untuk menjalankan hak privasi Anda di bawah GDPR, CCPA, atau hukum privasi lainnya (lihat Kebijakan Privasi).', 'DMCA / Hak Cipta: Lihat bagian DMCA di bawah ini untuk permintaan pemberitahuan takedown.'],
    },
    {
      heading: 'Waktu respon',
      paragraphs: ['Kami bertujuan untuk menanggapi pertanyaan dalam 5-7 hari bisnis. Permintaan Privacy-terkait akan ditangani dalam waktu 30 hari seperti yang diperlukan oleh hukum.', 'Selama periode sibuk, respon mungkin lebih lama. Untuk hal-hal yang mendesak, silakan indikasikan "PENERJEMAH" dalam baris subjek Anda.'],
    },
    {
      heading: 'Sebelum menghubungi kami',
      paragraphs: ['Silakan periksa halaman Dokumentasi kami untuk jawaban atas pertanyaan umum tentang bagaimana menggunakan fitur ANQR. Banyak pertanyaan tentang pembuatan kode QR, styling, dan opsi ekspor dibahas di sana.'],
    },
    {
      heading: 'DMCA Pemberitahuan Hak Cipta',
      paragraphs: ['Jika Anda percaya bahwa konten yang tersedia pada ANQR melanggar hak cipta Anda, Anda dapat mengirimkan Digital Millennium Copyright Act (DMCA) pemberitahuan pengambilalihan. Agar valid, pemberitahuan Anda harus termasuk:'],
      bullets: ['Tanda tangan fisik atau elektronik dari pemilik hak cipta atau agen yang berwenang.', 'Identifikasi pekerjaan berhak cipta mengklaim telah dilanggar.', 'Identifikasi bahan yang dinyatakan melanggar, dengan informasi yang cukup untuk menemukannya.', 'Informasi kontak Anda (alamat, nomor telepon, dan alamat email).', 'Sebuah pernyataan bahwa Anda memiliki keyakinan yang baik bahwa penggunaan materi tidak diizinkan oleh pemilik hak cipta.', 'Sebuah pernyataan, di bawah hukuman sumpah palsu, bahwa informasi dalam pemberitahuan Anda akurat dan bahwa Anda adalah pemilik hak cipta atau berwenang untuk bertindak atas nama mereka.'],
    },
    {
      heading: 'Kontak DMCA',
      paragraphs: ['Kirim pemberitahuan DMCA ke: $_ ANQR _ PH _ 0 _ _', 'Silakan masukkan "DMCA Notice" di baris subjek. Kami akan menanggapi pemberitahuan yang valid sesuai dengan hukum yang berlaku. Perhatikan bahwa ANQR menghasilkan kode QR lokal pada perangkat pengguna dan tidak host konten yang dihasilkan.'],
    },
    {
      heading: 'Komunitas Reddit',
      paragraphs: ['Bergabunglah dengan komunitas Reddit kami di r/ANQR untuk membagikan kreasi QR Anda, mengajukan pertanyaan, mendapatkan bantuan, dan terhubung dengan pengguna ANQR lainnya.'],
    },
  ],
};

export default contact;
