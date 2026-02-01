import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Hubungi Kami',
  description: 'Kami mengalu-alukan maklum balas, laporan pepijat, permintaan ciri dan pertanyaan umum.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Bagaimana untuk menghubungi kami',
      paragraphs: ['Kami menawarkan beberapa cara untuk menghubungi kami bergantung pada keperluan anda. Kami membaca setiap mesej, walaupun masa respons mungkin berbeza-beza berdasarkan kelantangan dan jenis pertanyaan.'],
    },
    {
      heading: 'E-mel',
      paragraphs: ['Untuk semua pertanyaan: email@anqr.link', 'Ini ialah cara yang paling boleh dipercayai untuk menghubungi kami dan disyorkan untuk soalan terperinci, pertanyaan perniagaan atau sebarang pertanyaan lain.'],
    },
    {
      heading: 'Jenis-jenis pertanyaan',
      bullets: ['Soalan am: Soalan tentang cara menggunakan ANQR, penjelasan ciri atau maklum balas umum.', 'Laporan pepijat: Sila sertakan penyemak imbas anda, sistem pengendalian, langkah untuk menghasilkan semula dan sebarang mesej ralat yang anda lihat.', 'Permintaan ciri: Cadangan untuk ciri baharu atau penambahbaikan. Kami mempertimbangkan semua permintaan walaupun kami tidak boleh menjanjikan pelaksanaan.', 'Pertanyaan perniagaan: Peluang perkongsian, soalan pelesenan atau pertanyaan penggunaan komersial.', 'Permintaan privasi: Permintaan untuk menggunakan hak privasi anda di bawah GDPR, CCPA atau undang-undang privasi lain (lihat Dasar Privasi).', 'DMCA/Hak Cipta: Lihat bahagian DMCA di bawah untuk keperluan notis alih keluar.'],
    },
    {
      heading: 'Masa tindak balas',
      paragraphs: ['Kami menyasarkan untuk menjawab pertanyaan dalam masa 5-7 hari bekerja. Permintaan berkaitan privasi akan ditangani dalam masa 30 hari seperti yang dikehendaki oleh undang-undang.', 'Semasa tempoh sibuk, masa respons mungkin lebih lama. Untuk perkara yang mendesak, sila nyatakan "URGENT" dalam baris subjek anda.'],
    },
    {
      heading: 'Sebelum menghubungi kami',
      paragraphs: ['Sila semak halaman Dokumentasi kami untuk jawapan kepada soalan lazim tentang cara menggunakan ciri ANQR. Banyak soalan tentang penjanaan kod QR, penggayaan dan pilihan eksport dibincangkan di sana.'],
    },
    {
      heading: 'Notis Hak Cipta DMCA',
      paragraphs: ['Jika anda percaya bahawa kandungan yang tersedia di ANQR melanggar hak cipta anda, anda boleh menyerahkan notis alih keluar Akta Hak Cipta Milenium Digital (DMCA). Untuk menjadi sah, notis anda mesti mengandungi:'],
      bullets: ['Tandatangan fizikal atau elektronik pemilik hak cipta atau ejen yang diberi kuasa.', 'Pengenalpastian karya berhak cipta yang didakwa telah dilanggar.', 'Pengenalpastian bahan yang didakwa melanggar, dengan maklumat yang mencukupi untuk mengesannya.', 'Maklumat hubungan anda (alamat, nombor telefon dan alamat e-mel).', 'Kenyataan bahawa anda mempunyai kepercayaan yang baik bahawa penggunaan bahan tersebut tidak dibenarkan oleh pemilik hak cipta.', 'Kenyataan, di bawah penalti sumpah bohong, bahawa maklumat dalam notis anda adalah tepat dan bahawa anda adalah pemilik hak cipta atau diberi kuasa untuk bertindak bagi pihak mereka.'],
    },
    {
      heading: 'Kenalan DMCA',
      paragraphs: ['Hantar notis DMCA ke: email@anqr.link', 'Sila sertakan "Notis DMCA" dalam baris subjek. Kami akan membalas notis yang sah mengikut undang-undang yang terpakai. Ambil perhatian bahawa ANQR menjana kod QR secara setempat pada peranti pengguna dan tidak mengehoskan kandungan yang dijana pengguna.'],
    },
    {
      heading: 'Komuniti Reddit',
      paragraphs: ['Sertai komuniti Reddit kami di r/ANQR untuk berkongsi ciptaan QR anda, bertanya soalan, mendapatkan bantuan dan berhubung dengan pengguna ANQR yang lain.'],
    },
  ],
};

export default contact;
