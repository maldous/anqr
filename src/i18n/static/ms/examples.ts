import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Contoh ANQR',
  description: 'Lima contoh dunia sebenar, gaya pengeluaran yang menunjukkan tempat kod QR mencipta nilai yang boleh diukur: meningkatkan kod kaunter runcit lama, pembayaran runcit berjenama dan tindakan "imbas ke", pencetakan skala daripada risalah ke papan iklan, QR animasi untuk papan tanda digital dan kerjasama merentas bahasa menggunakan pautan Anchor boleh kongsi. Setiap contoh termasuk imej, kekangan praktikal dan pautan remix kembali ke penjana.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: '♪ Buka generatornya ♪', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Artikel - artikel yang telah diulas', type: 'learn' },
    { href: '/guide?lang=${lang}', label: '[ Gambar di hlm', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Studi Kasus Besar: Retail Counter QR Uplift',
      paragraphs: ['Contoh dunia nyata ini mengikuti sebuah kafe kecil yang telah menggunakan kode QR yang sama di meja mereka selama tiga tahun. Kode aslinya dihasilkan dengan cepat selama demam pandemi, dicetak di atas kertas standar, dan diselipkan ke dalam kios plastik. Ini masih bekerja - secara teknis - tapi pelanggan sering membutuhkan beberapa upaya untuk memindainya, dan itu tidak melakukan apa-apa untuk memperkuat identitas merek yang dibuat dengan hati-hati kafe.', 'Penjelmaan ini dimulai dengan audit sederhana: kode yang ada dikodekan URL menu online kafe, yang mereka ingin simpan. Tantangannya adalah membuat QR merasa seperti bagian dari pengalaman kafe ketimbang sebuah utilitas afterthought dari tahun 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'SEORANG kode QR cuaca dalam bentuk plastik yang menampilkan pakaian, sidik jari, dan cetakan pudar yang tampak',
          caption: 'Titik awal: tiga tahun layanan kontra telah meninggalkan QR asli hampir tidak fungsional',
        },
      ],
    },
    {
      heading: 'Diagnosis Masalah Kode Asli',
      paragraphs: ['Testing Veadon mengungkapkan isu multiple: kode asli yang digunakan Error Correction L (minimum redundancy), memiliki zona tenang hanya 2 modul, dan dicetak pada resolusi rendah. Di bawah pencahayaan tungsten hangat kafe, modul hitam yang sudah rusak hampir tidak kontras terhadap kertas kuning. Ponsel - ponsel yang lebih tua bergelut; ponsel - ponsel yang lebih baru berhasil tetapi dengan keterlambatan yang mencolok.', 'Di luar masalah teknis, persegi hitam-putih generik berkomunikasi apa-apa tentang merek. Para pelanggan ragu-ragu sebelum memindai - penghalang kepercayaan halus yang mengurangi keterlibatan dengan menu digital yang dirancang dengan cermat kafe.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Diagnosis overlay diagnostik menunjukkan kekurangan teknis QR asli: ECC rendah, zona tenang minimum, kontras buruk',
          caption: 'Analisis teknikal mengungkapkan mengapa kode warisan kurang sempurna dalam kondisi dunia nyata',
        },
      ],
    },
    {
      heading: 'Proses Pengangkatnya',
      paragraphs: ['Dengan menggunakan ANQR, pemilik kafe membuat ulang kode dengan URL menu yang identik tetapi secara dramatis meningkatkan pengaturan: Pembetulan Kesalahan H untuk ketahanan maksimum, zona tenang 6-module untuk deteksi batas yang dapat diandalkan, dan warna merek (deep burgundy module pada latar belakang krim) yang cocok dengan palet interior kafe.', 'Sebuah pusat kecil overlay yang menampilkan logo kafe ditambahkan - terus sengaja halus untuk menjaga scannabilitas sementara memberikan pengenalan merek instan. Mode Keselamatan Kemanduan dikonfirmasi desain baru dipindai secara reliably melintasi perangkat uji sebelum percetakan apapun.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Antarmuka ANQR menunjukkan konfigurasi: warna merek, ECC yang sesuai, zona tenang murah hati, overlay logo halus',
          caption: 'Membina konfigurasi yang ditingkatkan: setiap pengaturan dipilih untuk menyeimbangkan ekspresi merek dengan keandalan scan',
        },
      ],
    },
    {
      heading: 'Hasil yang Dapat Diukur',
      paragraphs: ['Setelah mengerahkan QR baru pada stok kartu profesional yang dilaminasi, kafe melacak hasil lebih dari empat minggu. Tingkat keberhasilan pemindaian anak-anak meningkat dari perkiraan 70% menjadi mendekati 100%. Waktu scan rata-rata menurun dari 3-4 detik hingga di bawah 1 detik. Secara signifikan, pertunangan menu meningkat 40% - pelanggan yang sebelumnya melirik QR dan menyerah sekarang memindai dengan yakin.', 'Staf Barcelona melaporkan lebih sedikit pertanyaan pelanggan tentang \'bagaimana menggunakan QR\' dan tidak ada lagi contoh mengetik secara manual URL untuk pelanggan yang frustrasi. Penampilan bermerek ini juga memicu percakapan, dengan pelanggan berkomentar positif pada desain kohesif.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A sebelum/setelah dibandingkan dengan metrik: tingkat keberhasilan pemindaian, waktu pemindaian rata-rata, dan penghitungan pemindaian mingguan',
          caption: 'Empat minggu data menunjukkan dampak yang terukur dari uplift QR yang bijaksana',
        },
      ],
    },
    {
      heading: 'Akan menciptakan kembali konfigurasi ini',
      paragraphs: ['Konfigurasi kafe menunjukkan merek dagang konservatif tapi efektif: Pembetulan Kesalahan , zona tenang 6-module, warna merek kontras tinggi, dan overlay pusat minimum. Keseimbangan ini bekerja untuk kebanyakan aplikasi counter ritel di mana keandalan harus diutamakan tetapi kehadiran merek masih penting.', 'Buka generator dengan pengaturan ini pra-muat dan adaptasi warna dan overlay ke merek Anda sendiri. Wawasan kunci: perbaikan keandalan saja dapat meningkatkan keterlibatan secara dramatis, bahkan sebelum menambahkan gaya visual apapun.', 'Lihat panduan Belajar terkait tentang meningkatkan kampanye QR yang sudah ada untuk metodologi penuh di balik pendekatan ini.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link ke generator pra-konfigur dengan pengaturan kafe untuk penyesuaian segera',
          caption: 'Mulailah dengan konfigurasi yang terbukti dan kustomisasi untuk merek Anda',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: '♪ Buka generatornya ♪',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Artikel - artikel yang telah diulas',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Studi Kasus Kedokteran Kasus: Multi-Payment Counter Display',
      paragraphs: ['Contoh ini mengikuti toko pakaian butik yang telah mengumpulkan lima kode QR yang berbeda di register mereka: pembayaran bank, tips, Instagram, ulasan Google, dan link lowongan. Masing-masing dihasilkan dari sumber yang berbeda, dicetak pada waktu yang berbeda, dan ditampilkan dalam berdiri yang tidak cocok. Kekacauan visual yang mendasari estetika yang dikurasi dengan hati-hati toko, dan staf secara teratur berurusan dengan pelanggan memindai kode yang salah.', 'Solusi yang diperlukan untuk memisahkan kekhawatiran: kode pembayaran memerlukan keandalan maksimum dengan styling konservatif, sementara kode pemasaran bisa lebih ekspresif. Sistem tampilan terpadu yang muncul menunjukkan bagaimana menyeimbangkan kehadiran merek terhadap tuntutan fungsional dari berbagai kasus penggunaan QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Area register berderit yang menunjukkan lima kode QR yang tidak cocok dalam berbagai material yang berdiri dan dicetak',
          caption: 'Titik awal kekacauan: lima memutuskan kode QR bersaing untuk perhatian dan menyebabkan kebingungan pelanggan',
        },
      ],
    },
    {
      heading: 'Menprioritaskan Pengalaman Pembayaran',
      paragraphs: ['Metode pembayaran primer toko ini menggunakan standar regional yang membutuhkan kepatuhan muatan yang ketat. Uji coba mengungkapkan bahwa bahkan styling kecil mempengaruhi kecepatan pemindaian dengan aplikasi perbankan tertentu. Keputusan woib: menjaga pembayaran QR sepenuhnya tidak dimodifikasi kecuali optimasi ukuran dan pencetakan profesional pada stok kartu matte.', 'Pendekatan konservatif ini berarti kode pembayaran tampak kurang \'dibranded\' daripada ideal, tetapi tingkat penyelesaian transaksi meningkat drastis. Wawasan: saat pembayaran tidak menandai kesempatan - mereka momen keandalan. Pelanggan menghargai kecepatan dan kepastian atas estetika ketika uang terlibat.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Kode QR pembayaran besar pada stok kartu matte profesional, diposisikan menonjol di register',
          caption: 'Pembayaran QR: dengan murah hati, dicetak secara profesional, bergaya konservatif untuk pengakuan instan oleh aplikasi perbankan',
        },
      ],
    },
    {
      heading: 'Mewujudkan Aksi Sekunder',
      paragraphs: ['Untuk tips, ulasan, sosial, dan perekrutan, toko bisa lebih ekspresif. Kode-kode ini diregenerasi di ANQR dengan merek styling yang konsisten: hijau zaitun khas toko pada krim, gaya modul bulat, dan overlay pusat halus dengan ikon toko. Pembetulan Kesalahan Dia memastikan keandalan bahkan dengan gaya.', 'Keempat kode ini disusun dalam sebuah panel bermerek yang diposisikan di samping (tidak bersaing dengan) kode pembayaran. Clear label dalam tipografi toko menjelaskan tujuan masing-masing kode. Hierarki visual itu disengaja: pembayaran berdiri sendiri dan menonjol; tindakan sekunder dikelompokkan bersama sebagai pilihan.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Sebuah panel bermerek menunjukkan empat kode QR bergaya untuk tips, ulasan, sosial, dan perekrutan, dengan label jelas',
          caption: 'Panel aksi sekunder: branding konsisten, labelling jelas, diposisikan sebagai pilihan daripada gangguan',
        },
      ],
    },
    {
      heading: 'Desain Sistem Perpaparan Bokep',
      paragraphs: ['Pertunjukkan fisik yang dilakukan telah memecahkan beberapa masalah secara bersamaan. Kedua-dua stand pembayaran dan panel sekunder menggunakan material matte untuk menghilangkan silau dari pencahayaan overhead. Tinggi badan dioptimalkan bagi pelanggan yang memiliki perawakan yang beragam. Sudut - sudut yang diarahkan menuju antrian pelanggan ketimbang rata di atas meja.', 'Secara kritis, toko menciptakan sidik jari cadangan dari link konfigurasi ANQR terkunci. Ketika kode tips akhirnya mendapat coffee-splashed, staf menggantinya dalam beberapa menit menggunakan konfigurasi tersimpan - tidak ada screenshot, tidak ada tebakan pada pengaturan, tidak ada degradasi kualitas.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Diagram diagram yang menunjukkan tata letak paparan fisik: tinggi, sudut, bahan, dan hubungan antara pembayaran dan paparan sekunder',
          caption: 'Tampilan sistem opacity blueprint: ergonomi fisik dioptimalkan untuk pemindaian andal melintasi ketinggian pelanggan dan kondisi pencahayaan',
        },
      ],
    },
    {
      heading: 'Peningkatan Operasional',
      paragraphs: ['Enam minggu setelah penyebaran, toko mendokumentasikan perbaikan yang signifikan: keluhan pelanggan nol tentang \'kode salah\' kebingungan, waktu transaksi lebih cepat, dan peningkatan 3x dalam penyerahan tip (kebiasaan sekarang bisa menemukan dan memindai kode tip tanpa bertanya secara canggung staf). Ulasan-tinjauan google juga meningkat seiring dengan gesekan QR yang didedikasikan dan diberi label dengan baik.', 'Pelatihan staf fredin menjadi lebih sederhana: Kode pembayaran adalah yang besar, yang lainnya ada di panel. Ketika aplikasi pembayaran diperbarui dan satu secara singkat menunjukkan pemindaian yang lebih lambat, desain kode pembayaran konservatif berarti masih bekerja - hanya secara marginal lebih lambat daripada gagal seluruhnya.', 'Lihat Panduan Belajar pada kode QR untuk pembayaran ritel untuk prinsip di balik desain sistem tampilan ini.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Sebuah papan dashboard metriks menunjukkan sebelum/setelah perbandingan: insiden kebingungan, waktu transaksi, frekuensi tip, penyerahan ulasan',
          caption: 'Enam minggu operasional data menunjukkan dampak bisnis dari sistem tampilan multi-QR yang bijaksana',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '♪ Buka generatornya ♪',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Artikel - artikel yang telah diulas',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Studi Kasus Sosis: Dari Kartu Bisnis ke Billboard',
      paragraphs: ['Contoh ini mengikuti sebuah perusahaan produksi acara mempersiapkan konferensi besar. Mereka membutuhkan kode QR yang sama - menghubungkan ke aplikasi acara - dikerahkan melintasi format yang berbeda secara radikal: penempatan lencana peserta (3cm), kartu tenda meja (8cm), penandatangan meja pendaftaran (30cm), pencarian poster (60cm), dan banner backdrop panggung besar (4 meter). Setiap format memiliki jarak pandang, kondisi pencahayaan, dan alur kerja produksi yang berbeda.', 'Tantangannya bukan hanya teknis, tapi operasional. Para vendor vendor vendor berpenjualan yang berbeda menangani pekerjaan cetak yang berbeda, dan perusahaan perlu memastikan hasil yang konsisten dan dapat dipindai tanpa memandang siapa yang menghasilkan apa. Solusi mereka berpusat pada ekspor SVG dan dokumentasi handoff yang ketat.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Sebuah kolase menunjukkan kode QR yang sama dikerahkan di lima ukuran yang berbeda, dari lencana ke spanduk',
          caption: 'Satu kode QR, lima ukuran penyebaran: tantangan untuk mempertahankan scannabilitas dari sentimeter ke meter',
        },
      ],
    },
    {
      heading: 'Mengapa Kejadian Sebelumnya Ada Masalah',
      paragraphs: ['Pada konferensi terakhir mereka, perusahaan telah mengalami kegagalan memalukan. Spanduk panggung QR dihasilkan sebagai PNG kecil dan diskalakan dalam perangkat lunak desain - hasilnya tampak dapat diterima dari kejauhan tetapi gagal untuk memindai kembali dari penonton. Lencana QRs terlalu bergaya dan terlalu kecil, peserta yang frustasi mencoba menambah kontak. Pengaturan tak konsisten di seluruh format berarti QR \'sama\' sebenarnya terlihat berbeda pada setiap bagian.', 'Analisis pasca-event mengungkapkan akar penyebab: tidak ada sumber tunggal kebenaran. Setiap desainer telah menciptakan ulang QR dengan pengaturan yang sedikit berbeda, dan setiap vendor cetak telah memproses file secara berbeda. Kualitas kualitas graded melalui permainan telepon handoff file.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Foto-foto Close-up yang menunjukkan kegagalan pemindaian: modul banner bergambar piksel, kode lencana berukuran kecil, styling tidak konsisten di seluruh format',
          caption: 'Analisis forensik forensik terhadap kegagalan acara sebelumnya: setiap format telah memperkenalkan masalah kualitas yang berbeda',
        },
      ],
    },
    {
      heading: 'Aliran Kerja SVG-Pertama',
      paragraphs: ['Untuk acara ini, perusahaan menetapkan protokol yang ketat: satu master QR yang dihasilkan dalam ANQR dengan pengaturan optimal (Error Correction H, zona diam murah hati, styling bersih), diekspor sebagai SVG, dan disimpan sebagai sumber otoritatif tunggal. Sambungan konfigurasi ANQR didokumentasikan di samping berkas SVG sehingga kode dapat diregenerasi jika diperlukan.', 'Setiap perancang dan vendor menerima master SVG yang sama dengan instruksi eksplisit: tempat pada ukuran yang diperlukan, tidak memodifikasi, menjaga zonder clearance yang tenang. Untuk vendor yang membutuhkan format raster, perusahaan menyediakan PNG pra-rendered pada ukuran spesifik dengan konvensi penamaan jelas yang mengindikasikan penggunaan yang dimaksudkan.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Sebuah paket berkas yang menampilkan master SVG, ukuran-spesifik PNG, dokumen spesifikasi, dan link konfigurasi',
          caption: 'Paket uluran tangan: semua vendor perlu menghasilkan hasil yang konsisten tanpa menebak',
        },
      ],
    },
    {
      heading: 'Pertimbangan Khusus Ukuran',
      paragraphs: ['Setiap format diperlukan perhatian spesifik. Lencana memasukkan pada 3cm membutuhkan QR untuk menempati ruang yang tersedia maksimum - jarak pemindaian akan panjang lengan. Tenda-tenda meja di 8cm bisa mencakup hiasan berjemaah di luar zona tenang. Spanduk 4-metre diperlukan perhitungan: dari jarak penonton biasa (15-20 meter), modul perlu dibedakan dengan jelas oleh kamera telepon, yang berarti QR perlu setidaknya 80cm dalam desain banner.', 'Perusahaan ini menciptakan panduan pengukur ukuran yang mendokumentasikan dimensi QR minimum untuk setiap jarak pemindaian yang diharapkan. Ini menjadi aset yang dapat digunakan kembali untuk peristiwa di masa depan, menghilangkan tebakan dari proses desain.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Bagan yang menunjukkan hubungan antara jarak pemindaian, ukuran minimum QR, dan dimensi modul untuk setiap format acara',
          caption: 'Sizing matriks: dimensi dihitung memastikan pemindaian andal pada setiap format yang diharapkan jarak pandang',
        },
      ],
    },
    {
      heading: 'Hasil Produksi Pabrik',
      paragraphs: ['Validasi hari konferensi untuk konferensi adalah sistematis: staf diuji setiap QR dikerahkan sebelum pintu dibuka. Lencana memasukkan dipindai seketika pada panjang lengan. Tenda - tenda meja dibuat dengan baik dalam pencahayaan kamar - kamar breakout yang bervariasi. Spanduk panggung - acara sebelumnya memalukan - Dipindai sukses dari tengah area penonton.', 'Pengaduan pemindaian yang dilakukan oleh para peserta 2.000+. Kemenangan operasional sama signifikannya: ketika penambahan sponsor menit-menit terakhir membutuhkan penandatangan baru, tim produksi menghasilkannya dari master SVG dalam menit, yakin akan cocok dengan yang lain.', 'Lihat panduan Belajar pada kode QR siap cetak untuk kerangka kerja keputusan SVG vs PNG dan praktik terbaik handoff.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografi peristiwa yang menampilkan peserta berhasil memindai kode QR dengan berbagai ukuran dan jarak di seluruh lokasi',
          caption: 'Sukses hari Konferensi: pemindaian yang dapat diandalkan di setiap format, dari lencana close-ups sampai tahap tembakan jarak banner',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: '♪ Buka generatornya ♪',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Artikel - artikel yang telah diulas',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Studi Kasus Spesiod: Airport Lounge Digital Display',
      paragraphs: ['Contoh ini berikut sebuah lounge maskapai penerbangan yang telah menggunakan kode QR statis pada layar menyambut digital mereka. Layar-layar yang ditampilkan memutar konten promosi, tetapi kode QR untuk lounge check-in duduk di sudut, statis dan mudah diabaikan. Para ahli analisis yang hanya menunjukkan 15% tamu yang memenuhi syarat menggunakan cek-in QR meskipun lebih cepat daripada antrian meja. Kebanyakan tamu tidak menyadarinya.', 'Hipotesis tersebut sederhana: dalam lingkungan yang sibuk secara visual dengan konten bergerak, sebuah QR statis menjadi tidak terlihat. Solusi yang dibutuhkan untuk membuat QR terlihat tanpa mengorbankan keandalan yang diperlukan untuk aliran check-in di mana kegagalan akan berarti wisatawan frustrasi dan antrian meja yang lebih panjang.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Sebuah tampilan digital dalam lounge bandara menunjukkan konten promosi dengan kode QR kecil statis di sudut',
          caption: 'Penyatuan asli: QR statis hilang dalam lautan konten promosi dinamis, mencapai hanya 15% adopsi',
        },
      ],
    },
    {
      heading: 'Animasi Aman Didesain oleh Reka Hiburan',
      paragraphs: ['Signage digital lounge menggunakan panel LED besar - lingkungan menantang di mana animasi agresif dapat menciptakan masalah pemindaian. Tim desain mulai konservatif: efek pulsa lembut yang subtly diperluas dan dikontrak kehadiran visual QR tanpa memodifikasi struktur kode sebenarnya. Penwaktuan frame wourne diset lambat (250ms) untuk menghindari masalah flicker apapun dengan tingkat penyegaran LED.', 'Validasi Mode Keselamatan Keselamatan memastikan setiap frame tetap dapat dipindai. Pengujian tambahan pada panel LED yang sebenarnya mengungkapkan bahwa pulsa perlu lebih halus daripada pratinjau desktop yang disarankan - kecerahan LED dan sudut pandang yang terpengaruh lebih kontras dari yang diharapkan.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Panel pengaturan animasi ANQR menampilkan konfigurasi pulsa: waktu lambat, intensitas halus, Mode Keselamatan diaktifkan',
          caption: 'Konfigurasi animasi: parameter disetel untuk tampilan panel LED sambil menjaga keandalan pemindaian dalam setiap bingkai',
        },
      ],
    },
    {
      heading: 'Penyepaduan dengan Kandungan Tanda Tangan',
      paragraphs: ['Dianimasikan QR diposisikan dalam \'stable zon\' terdedikasi dari tata letak layar - daerah yang tetap konstan sementara konten promosi diputar di area tampilan utama. Pemisahan ini sangat penting: QR membutuhkan stabilitas visual untuk memindai bahkan sambil menarik perhatian melalui animasi halusnya.', 'A jelas panggilan-ke-aksi ditambahkan bersebelahan ke QR: \'Langkau antrian - scan untuk check in.\' Teks itu tetap statis sementara QR berdenyut, menciptakan hierarki visual yang menarik mata untuk kesempatan pemindaian tanpa berlebihan konten promosi.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Diagram bentangan layar yang menampilkan QR animasi di zona stabil sementara konten promosi berputar di area utama',
          caption: 'Peruntukan real estate layar: QR animasi menempati zona stabil terpisah dari konten promosi berputar',
        },
      ],
    },
    {
      heading: 'Penguraian Teknis',
      paragraphs: ['Dianimasikan QR diekspor sebagai GIF dengan pengaturan teroptimasi untuk CMS signage. Pertimbangan ukuran berkas yang penting - sistem manajemen konten lounge memiliki batas muat naik, dan berkas yang terlalu besar menyebabkan gagap playback. Mutu visual ekspor terakhir yang seimbang terhadap ukuran berkas dengan membatasi palet warna dan mengoptimalkan jumlah frame.', 'Penguraian exployment termasuk fallback: jika GIF gagal bermain karena alasan apapun, sistem signage akan menampilkan backup PNG statis. Redundansi ini memastikan kemampuan check-in tidak pernah hilang karena masalah teknis dengan animasi.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Comment',
          caption: 'Konfigurasi CMS Signage: primer animasi dengan fallback statis memastikan kapabilitas check-in tidak pernah terganggu',
        },
      ],
    },
    {
      heading: 'Ukur Impact',
      paragraphs: ['Setelah satu bulan operasi, adopsi cek-in QR meningkat dari 15% menjadi 24% - peningkatan relatif 60%. Survei umpan balik para tamu mengatakan bahwa animasi QR adalah \'tampak untuk pemberitahuan\' dan \'merasa lebih modern.\' Kali antrian posisi roda roda menurun secara tak terkira selama periode puncak sebagai lebih banyak tamu yang dilayani sendiri melalui QR.', 'Yang penting, kegagalan pemindaian nol dilaporkan meskipun ribuan scan harian. Pendekatan animasi konservatif telah mencapai tujuan perhatian tanpa mengorbankan keandalan aliran check-in yang diminta. Setelah itu, lounge gulung QRs animasi serupa ke lokasi mereka yang lain.', 'Lihat panduan Belajar pada kode QR animasi untuk tanda digital untuk prinsip teknis di balik desain animasi yang aman.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Sebuah dashboard menunjukkan kenaikan tingkat adopsi, pengurangan waktu antrian, dan keandalan pemindaian nol-gagal selama periode penyebaran',
          caption: 'Satu bulan data: 60% peningkatan adopsi, pengurangan waktu antrian, dan mempertahankan keandalan pemindaian yang sempurna',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: '♪ Buka generatornya ♪',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Artikel - artikel yang telah diulas',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Studi Kasus Kedokteran Hewan: Kampanye Peluncuran Produk Global QR',
      paragraphs: ['Contoh ini mengikuti perusahaan elektronik konsumen meluncurkan produk baru secara bersamaan di 12 pasar di seluruh 8 bahasa. Setiap tim pemasaran regional yang dibutuhkan untuk memproduksi kemasan, tampilan ritel, dan bahan promosi menampilkan kode QR yang terhubung ke halaman produk lokalisasi. Peluncuran sebelumnya telah mengakibatkan tidak konsisten QR styling, kegagalan pemindaian sesekali, dan \'permainan telepon\' drift konfigurasi sebagai setiap tim membuat ulang kode dari screenshot.', 'Solusinya memanfaatkan koneksi konfigurasi ANQR yang dapat dibagikan untuk menetapkan satu sumber kebenaran bahwa setiap tim regional dapat mengakses, terlepas dari bahasa antarmuka mereka. Muatan QR menggunakan pengalihan pintar yang mendeteksi bahasa pengguna, sehingga satu kode bekerja secara global sambil menyampaikan pengalaman lokalisasi.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Peta dunia menunjukkan 12 lokasi pasar dengan kode QR, beberapa visual tidak konsisten satu sama lain',
          caption: 'Tantangannya: 12 pasar, 8 bahasa, dan sejarah implementasi QR yang tidak konsisten di seluruh wilayah',
        },
      ],
    },
    {
      heading: 'Mendirikan Konfigurasi Majikan',
      paragraphs: ['Tim merek global membuat konfigurasi QR berwithir di ANQR: warna merek sesuai dengan identitas visual lini produk, Error Correction H untuk keandalan di seluruh aplikasi cetak dan digital, dan styling yang akan bereproduksi secara konsisten terlepas dari metode produksi lokal. konfigurasi itu terkunci dan berbagi link yang didokumentasikan dalam singkat kampanye global.', 'Secara kritis, URL yang dikodekan menggunakan layanan pengalihan deteksi bahasa. Saat dipindai, pengguna otomatis dihalau ke halaman produk bahasa lokal mereka. Ini berarti semua 12 pasar bisa menggunakan kode QR identik - tidak ada variasi muatan per pasar yang dapat memperkenalkan kesalahan.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Antarmuka ANQR menampilkan konfigurasi master dengan warna merek, ECC H, dan URL pengalihan pintar',
          caption: 'Konfigurasi induk: standar merek global dikodekan ke dalam satu, berbagi sumber kebenaran',
        },
      ],
    },
    {
      heading: 'Aliran Kerja Tim Regional Armada',
      paragraphs: ['Setiap tim pemasaran regional yang menerima link konfigurasi dengan instruksi sederhana: membuka link, verifikasi preview sesuai dengan pedoman merek, ekspor dalam format yang diperlukan untuk aplikasi Anda. Antarmuka ANQR yang ditampilkan dalam bahasa pilihan masing-masing tim, tetapi pengaturan QR yang mendasarinya tetap identik terlepas dari bahasa antarmuka.', 'Saat tim Jepang membutuhkan SVG untuk tampilan ritel high-end dan tim Brasil membutuhkan PNG untuk media sosial, keduanya diekspor dari konfigurasi yang sama. Ketika vendor cetak tim Jerman meminta nilai warna spesifik, mereka dapat merujuk konfigurasi secara langsung daripada menebak dari cuplikan layar.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Cekupan layar yang menampilkan sambungan konfigurasi yang sama dibuka dalam antarmuka Jepang, Portugis, dan Jerman',
          caption: 'Konfigurasi yang sama, antarmuka yang berbeda: tim regional bekerja dalam bahasa pilihan mereka sambil mempertahankan konsistensi global',
        },
      ],
    },
    {
      heading: 'Variasi Wilayah yang Mengendalikan',
      paragraphs: ['Beberapa pasar di Amerika Serikat membutuhkan adaptasi kecil. Tim Cina yang dibutuhkan versi WeChat-optimasi untuk berbagi sosial. Alih-alih memodifikasi master, mereka menciptakan varian dokumentasi dengan link konfigurasi sendiri, jelas dilabel sebagai \'varian CN-WeChat\' di perpustakaan aset kampanye. Ini mempertahankan pelacakan sementara memungkinkan lokalisasi yang diperlukan.', 'Tim merek membentuk aturan sederhana: variasi apapun dari master membutuhkan link konfigurasi baru yang terdokumentasi. Tidak ada modifikasi terhadap berkas yang dieksport, tidak ada \'perbaikan cepat\' dalam perangkat lunak desain. Ini mencegah drift konfigurasi yang telah melanda peluncuran sebelumnya.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Sebuah antarmuka pustaka aset aset yang menampilkan konfigurasi master dan varian regional yang disetujui, masing-masing dengan link sendiri',
          caption: 'Perwalian aset campaign campaign formit: konfigurasi utama ditambah varian terdokumentasi, semua dapat dilacak melalui link konfigurasi',
        },
      ],
    },
    {
      heading: 'Hasil Peluncuran',
      paragraphs: ['Hari peluncuran produk product melihat kode QR dikerahkan melintasi kemasan, tampilan ritel, bahan acara, dan kampanye digital di semua 12 pasar secara bersamaan. Audit kualitas niaga dikonfirmasi konsistensi visual di seluruh wilayah - QR di Tokyo tampilan ritel sesuai QR di São Paulo kemasan cocok QR pada spanduk acara Berlin.', 'Kegagalan scanning Zero dilaporkan di seluruh pasar. Ketika perubahan URL halaman produk pasca-luncurkan diperlukan, layanan pengalihan menanganinya secara tidak kasatmata - tidak diperlukan pencetakan ulang. tim global coach memperkirakan pendekatan link konfigurasi menyelamatkan 40+ jam waktu koordinasi dibandingkan dengan metodologi peluncuran mereka sebelumnya.', 'Melihat panduan Belajar pada kolaborasi QR lintas-bahasa untuk prinsip alur kerja di balik konsistensi kampanye global.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Sebuah grid foto yang menunjukkan konsisten penyebaran QR di pasar yang berbeda: eceran Tokyo, pengemasan São Paulo, acara Berlin',
          caption: 'Ke konsistensi global yang dicapai: presentasi QR identik melintasi 12 pasar meskipun bahasa, vendor, dan format berbeda',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: '♪ Buka generatornya ♪',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Artikel - artikel yang telah diulas',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Artikel - artikel yang telah diulas', type: 'learn' },
    { href: '/guide?lang=${lang}', label: '[ Gambar di hlm', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Open galeri', type: 'gallery' },
  ],
};
