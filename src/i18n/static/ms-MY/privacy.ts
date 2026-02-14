import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Dasar Privasi',
  description: 'Maklumat ANQR kumpulkan, cara ia digunakan dan hak anda di bawah undang-undang privasi yang berkenaan.',
  lastUpdated: '1 Februari 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Syarat Perkhidmatan', type: 'external' }],
  sections: [
    {
      heading: 'Ringkasan',
      paragraphs: ['ANQR ialah penjana kod QR dengan pendekatan mengutamakan pelanggan. Kami tidak memerlukan anda membuat akaun. Secara lalai, kod QR dijana secara setempat dalam penyemak imbas anda - kami tidak mempunyai akses kepada kandungan yang anda kodkan.', 'Untuk kegunaan profesional, ANQR menyediakan API sisi pelayan yang menjana kod QR daripada parameter URL. Apabila menggunakan API, kandungan QR anda diproses pada pelayan kami untuk memaparkan imej, tetapi tidak disimpan atau dilog.', 'Kami menggunakan Google AdSense untuk pengiklanan dan mungkin menggunakan perkhidmatan analitik. Perkhidmatan ini mengumpul maklumat melalui kuki dan teknologi yang serupa. Dasar ini menerangkan data yang dikumpul, cara ia digunakan dan hak anda.'],
    },
    {
      heading: 'Maklumat yang kami kumpul',
      bullets: ['Maklumat yang anda berikan: Jika anda menghubungi kami melalui e-mel atau borang hubungan kami, kami mengumpul nama, alamat e-mel dan kandungan mesej anda.', 'Maklumat yang dikumpul secara automatik: Penyedia pengehosan kami (Netlify), rakan kongsi pengiklanan dan perkhidmatan analitik mungkin mengumpul: alamat IP, jenis dan versi penyemak imbas, sistem pengendalian, jenis peranti, URL rujukan, halaman yang dilawati, masa di tapak dan anggaran lokasi geografi.', 'Kuki pihak ketiga: Rakan kongsi pengiklanan kami (Google AdSense) menggunakan kuki dan teknologi serupa untuk menyiarkan dan mengukur iklan. ANQR sendiri tidak menetapkan sebarang kuki pihak pertama.'],
    },
    {
      heading: 'Kuki dan teknologi pihak ketiga',
      paragraphs: ['ANQR tidak menetapkan sebarang kuki pihak pertama. Pilihan anda (seperti mod gelap) disimpan secara setempat pada peranti anda, yang tidak dihantar ke mana-mana pelayan.', 'Walau bagaimanapun, rakan kongsi pengiklanan kami (Google AdSense) dan penyedia pengehosan mungkin menggunakan kuki dan teknologi penjejakan yang serupa:'],
      bullets: ['Kuki pengiklanan (pihak ketiga): Ditetapkan oleh Google AdSense dan rakan kongsi pengiklanan untuk menyiarkan iklan yang berkaitan, mengukur prestasi iklan dan memahami minat pengguna. Kuki ini mungkin menjejaki aktiviti anda merentas tapak web yang berbeza.', 'Kuki analitis (pihak ketiga): Boleh digunakan oleh penyedia pengehosan atau perkhidmatan analitik kami untuk mengumpul data penggunaan tanpa nama.'],
    },
    {
      heading: 'Google AdSense dan pengiklanan',
      paragraphs: ['Kami memaparkan iklan melalui Google AdSense. Google dan rakan kongsinya menggunakan kuki untuk menyiarkan iklan berdasarkan sejarah penyemakan imbas anda di tapak ini dan tapak web lain (pengiklanan berasaskan minat).', 'Ketahui cara Google menggunakan maklumat anda: https://policies.google.com/technologies/partner-sites', 'Urus pemperibadian iklan: https://adssettings.google.com', 'Tarik diri melalui Inisiatif Pengiklanan Rangkaian: https://optout.networkadvertising.org', 'Tarik diri melalui Perikatan Pengiklanan Digital: https://optout.aboutads.info'],
    },
    {
      heading: 'Bagaimana kita menggunakan maklumat',
      bullets: ['Untuk menjawab pertanyaan anda dan memberikan sokongan.', 'Untuk memaparkan iklan yang berkaitan melalui rakan kongsi pengiklanan kami.', 'Untuk menganalisis penggunaan tapak dan menambah baik perkhidmatan kami.', 'Untuk mengesan, mencegah dan menangani isu penipuan, penyalahgunaan dan keselamatan.', 'Untuk mematuhi kewajipan undang-undang.'],
    },
    {
      heading: 'Perkhidmatan pihak ketiga',
      bullets: ['Google AdSense: Menerima data untuk menyiarkan dan mengukur iklan.', 'Pembekal analitis: Terima data penggunaan tanpa nama.', 'Netlify (penghosan): Memproses permintaan dan boleh log alamat IP.', 'Kami tidak menjual maklumat peribadi anda. Walau bagaimanapun, perkongsian data dengan rakan kongsi pengiklanan boleh dianggap sebagai "jualan" di bawah CCPA (lihat di bawah).'],
    },
    {
      heading: 'Pengekalan data',
      bullets: ['Penyerahan hubungan: Sehingga 2 tahun.', 'Log pelayan: Sehingga 30 hari (penyedia pengehosan).', 'Data analitis: Sehingga 26 bulan (tanpa nama).', 'Kuki pengiklanan: Biasanya 13 bulan (berbeza mengikut pasangan).'],
    },
    {
      heading: 'Hak anda di bawah GDPR (pengguna EEA)',
      paragraphs: ['Jika anda berada di Kawasan Ekonomi Eropah, anda mempunyai hak berikut di bawah Peraturan Perlindungan Data Am:'],
      bullets: ['Hak akses: Minta salinan data peribadi yang kami pegang tentang anda.', 'Hak untuk pembetulan: Minta pembetulan data yang tidak tepat.', 'Hak untuk memadam: Minta pemadaman data anda ("hak untuk dilupakan").', 'Hak untuk menyekat pemprosesan: Minta had tentang cara kami menggunakan data anda.', 'Hak untuk mudah alih data: Minta data anda dalam format mudah alih.', 'Hak untuk membantah: Bantah pemprosesan, termasuk untuk pemasaran langsung.', 'Hak untuk menarik balik persetujuan: Menarik balik persetujuan pada bila-bila masa di mana pemprosesan adalah berasaskan persetujuan.', 'Hak untuk membuat aduan: Failkan aduan dengan pihak berkuasa perlindungan data anda.'],
    },
    {
      heading: 'Asas undang-undang GDPR',
      paragraphs: ['Kami memproses data berdasarkan asas ini: (a) Persetujuan - untuk pengiklanan diperibadikan (diuruskan oleh rakan kongsi pengiklanan kami); (b) Kepentingan yang sah - untuk analisis, keselamatan dan penambahbaikan; (c) Kontrak - untuk menjawab pertanyaan.', 'Untuk menggunakan hak anda, hubungi email@anqr.link. Kami bertindak balas dalam masa 30 hari.'],
    },
    {
      heading: 'Hak anda di bawah CCPA (pengguna California)',
      bullets: ['Hak untuk mengetahui: Minta maklumat tentang data yang dikumpul, sumber, tujuan dan pihak ketiga.', 'Hak untuk memadam: Minta pemadaman maklumat peribadi anda.', 'Hak untuk menarik diri: Tarik diri daripada "penjualan" maklumat peribadi (berkongsi dengan rakan kongsi iklan mungkin layak).', 'Hak untuk tanpa diskriminasi: Kami tidak akan mendiskriminasi untuk melaksanakan hak anda.'],
    },
    {
      heading: 'Kategori CCPA dikumpul',
      paragraphs: ['Kategori: Pengecam (alamat IP, ID peranti), aktiviti Internet (menyemak imbas, interaksi iklan), Geolokasi (anggaran), Inferens (minat daripada menyemak imbas).', 'Untuk menggunakan hak atau menarik diri: email@anqr.link atau laraskan tetapan kuki.'],
    },
    {
      heading: 'Pemindahan antarabangsa',
      paragraphs: ['Maklumat anda mungkin dipindahkan ke negara yang mempunyai undang-undang perlindungan data yang berbeza, termasuk Amerika Syarikat. Kami menggunakan perlindungan yang sesuai seperti Klausa Kontrak Standard.'],
    },
    {
      heading: 'Privasi kanak-kanak',
      paragraphs: ['ANQR tidak ditujukan kepada kanak-kanak di bawah 13 tahun (atau 16 tahun dalam EEA). Kami tidak mengumpul data daripada kanak-kanak secara sedar. Hubungi email@anqr.link jika anda percaya kanak-kanak telah memberikan maklumat.'],
    },
    {
      heading: 'Keselamatan',
      paragraphs: ['Kami menggunakan langkah teknikal dan organisasi yang sesuai untuk melindungi data, termasuk penyulitan HTTPS. Walau bagaimanapun, tiada penghantaran internet adalah 100% selamat.'],
    },
    {
      heading: 'Jangan Jejaki',
      paragraphs: ['Kami menghormati isyarat penyemak imbas Jangan Jejaki jika boleh, walaupun rakan kongsi pengiklanan mungkin tidak bertindak balas kepada DNT.'],
    },
    {
      heading: 'Perubahan kepada dasar ini',
      paragraphs: ['Kami mungkin mengemas kini dasar ini secara berkala. Tarikh "Terakhir dikemas kini" menunjukkan semakan terkini. Perubahan ketara boleh disampaikan melalui sepanduk tapak.'],
    },
    {
      heading: 'Hubungi kami',
      paragraphs: ['Untuk soalan privasi atau untuk menggunakan hak anda: email@anqr.link atau gunakan halaman Kenalan kami. Kami membalas permintaan privasi dalam masa 30 hari.'],
    },
    {
      heading: 'Dasar Privasi Penuh',
      paragraphs: ['Halaman ini menyediakan ringkasan amalan privasi kami. Untuk mendapatkan dasar privasi yang lengkap dan mengikat secara sah dengan butiran lengkap tentang pemprosesan data, hak anda dan kewajipan kami di bawah GDPR, CCPA dan undang-undang privasi lain, sila lihat dasar penuh kami yang dihoskan oleh iubenda.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Lihat Dasar Privasi Penuh di iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
