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
  description: 'Lima contoh gaya produksi di dunia nyata yang menunjukkan di mana kode QR menciptakan nilai terukur: meningkatkan kode counter ritel lama, pembayaran ritel bermerek dan tindakan "scan-to", penskalaan pencetakan dari pamflet ke papan reklame, animasi QR untuk papan reklame digital, dan kolaborasi lintas bahasa menggunakan tautan Anchor yang dapat dibagikan. Setiap contoh menyertakan gambar, batasan praktis, dan tautan remix kembali ke generator.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buka generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Ramban artikel Pelajari', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Buka Panduan Pengguna penuh', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Studi Kasus: Retail Counter QR Uplift',
      paragraphs: ['Contoh dunia-ini mengikuti sebuah kafe kecil yang telah menggunakan kode QR yang sama di counter mereka selama tiga tahun. Kode asli dibuat dengan cepat selama pandemi, dicetak pada kertas standar, dan menyelinap ke dalam stand plastik. Ini masih bekerja - teknis - tapi pelanggan sering membutuhkan beberapa upaya untuk memindai itu, dan itu tidak melakukan apa-apa untuk memperkuat kafe apos; s identitas merek dibuat hati-hati.', 'Transformasi dimulai dengan audit sederhana: kode yang ada dikodekan URL menu online kafe, yang ingin mereka simpan. Tantangannya adalah membuat QR merasa seperti bagian dari pengalaman kafe daripada utilitas afterthought dari 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Sebuah kode QR yang basah dalam sebuah stand plastik menunjukkan pakaian terlihat, sidik jari, dan pencetakan memudar',
          caption: 'Titik awal: tiga tahun layanan counter telah meninggalkan asli QR hampir tidak fungsional',
        },
      ],
    },
    {
      heading: 'Mendiagnosis Masalah Kode Asli',
      paragraphs: ['Pengujian mengungkapkan beberapa masalah: kode asli yang digunakan Galat Koreksi L (redundansi minimum), memiliki zona tenang hanya 2 modul, dan dicetak pada resolusi rendah. Di bawah lampu tungsten hangat kafe, modul hitam yang sudah pudar hampir tidak bertentangan dengan kertas kuning. Telepon yang lebih tua berjuang; ponsel yang lebih baru berhasil tapi dengan keterlambatan yang terlihat.', 'Selain masalah teknis, hitam generik dan persegi putih tidak berkomunikasi tentang merek. Pelanggan ragu-ragu sebelum memindai - penghalang kepercayaan halus yang mengurangi keterlibatan dengan kafe dirancang hati-hati menu digital.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Overlay diagnostik menunjukkan kekurangan teknis asli QR: zona rendah ECC, minimal tenang, kontras buruk',
          caption: 'Analisis teknis mengungkapkan mengapa kode warisan dilakukan dalam kondisi real-world',
        },
      ],
    },
    {
      heading: 'Proses Peningkatan',
      paragraphs: ['Menggunakan ANQR, pemilik kafe menciptakan kode dengan URL menu identik tapi secara dramatis meningkatkan pengaturan: Koreksi Galat H untuk ketahanan maksimum, zona tenang 6-module untuk deteksi batas yang dapat diandalkan, dan warna merek (modul burkas dalam latar belakang krim) yang cocok dengan palet interior kafe.', 'Sebuah pusat kecil overlay menampilkan logo kafe ditambahkan - sengaja halus untuk mempertahankan scannability sementara menyediakan pengenalan merek instan. Mode Keselamatan dikonfirmasi desain baru dipindai diandalkan di seluruh perangkat tes sebelum mencetak apapun.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Antarmuka ANQR menampilkan konfigurasi: warna merek, ECC yang sesuai, zona tenang yang murah hati, logo halus overlay',
          caption: 'Membangun konfigurasi yang ditingkatkan: setiap konfigurasi yang dipilih untuk menyeimbangkan ekspresi merek dengan kemampuan pemindaian',
        },
      ],
    },
    {
      heading: 'Hasil yang terukur',
      paragraphs: ['Setelah menyebarkan baru QR pada pekerjaan profesional-laminasi kartu saham, kafe dilacak hasil selama empat minggu. Pindai tingkat keberhasilan meningkat dari diperkirakan 70% ke dekat- 100%. Rata-rata waktu pemindaian menurun dari 3-4 detik ke bawah 1 detik. Paling signifikan, keterlibatan menu meningkat 40% - pelanggan yang sebelumnya melirik ke QR dan menyerah sekarang memindai percaya diri.', 'Staf melaporkan lebih sedikit pertanyaan pelanggan tentang \'Bagaimana menggunakan QR\' dan tidak ada lagi contoh untuk mengetik secara manual URL untuk pelanggan frustrasi. Penampilan bermerek juga memicu percakapan, dengan pelanggan berkomentar positif pada desain kohesif.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A sebelum / setelah perbandingan dengan metrik: memindai tingkat keberhasilan, rata-rata waktu pemindaian, dan peningkatan jumlah pemindaian mingguan',
          caption: 'Empat minggu data menunjukkan dampak terukur dari mengangkat QR yang bijaksana',
        },
      ],
    },
    {
      heading: 'Buat ulang Konfigurasi Ini',
      paragraphs: ['Konfigurasi kafe menunjukkan merek konservatif tapi efektif: Koreksi Galat H, 6-module zona tenang, tinggi-kontras warna merek, dan pusat minimal overlay. Keseimbangan ini bekerja untuk sebagian besar aplikasi counter ritel di mana ketergantungan harus datang pertama tapi kehadiran merek masih penting.', 'Buka generator dengan pengaturan ini sebelumnya-dimuat dan menyesuaikan warna dan overlay untuk merek Anda sendiri. Wawasan kunci: peningkatan kepercayaan saja dapat secara dramatis meningkatkan keterlibatan, bahkan sebelum menambahkan setiap gaya visual.', 'Lihat panduan terkait Pelajari untuk meningkatkan kampanye QR yang ada untuk metodologi penuh di balik pendekatan ini.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Hubungkan ke generator pre- dikonfigurasi dengan pengaturan kafe untuk penyesuaian langsung',
          caption: 'Mulai dengan konfigurasi yang terbukti dan disesuaikan untuk merek Anda',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Ramban artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Studi Kasus: Multi- Pembayaran Tampilan',
      paragraphs: ['Contoh ini mengikuti toko pakaian butik yang telah mengumpulkan lima kode QR yang berbeda di daftar mereka: pembayaran bank, tips, Instagram, Google ulasan, dan link perekrutan. Masing-masing dihasilkan dari sumber yang berbeda, dicetak pada waktu yang berbeda, dan ditampilkan dalam tidak cocok berdiri. Kekacauan visual merusak toko dengan hati-hati kurated estetika, dan staf secara teratur ditangani dengan pelanggan memindai kode yang salah.', 'Solusinya perlu memisahkan kekhawatiran: kode pembayaran memerlukan keandalan maksimum dengan gaya konservatif, sementara kode pemasaran bisa lebih ekspresif. Sistem tampilan bersatu yang muncul menunjukkan bagaimana menyeimbangkan kehadiran merek terhadap tuntutan fungsional dari kasus yang menggunakan QR yang berbeda.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Area register yang berantakan menunjukkan lima kode QR yang tidak cocok dalam berbagai baris dan material yang dicetak',
          caption: 'Titik awal yang kacau: lima kode QR terputus bersaing untuk perhatian dan menyebabkan kebingungan pelanggan',
        },
      ],
    },
    {
      heading: 'Prioritising Pengalaman Pembayaran',
      paragraphs: ['Metode pembayaran utama toko ini menggunakan standar regional yang memerlukan kepatuhan muatan yang ketat. Tes menunjukkan bahwa gaya kecil mempengaruhi kecepatan pemindaian dengan aplikasi perbankan tertentu. Keputusan: menyimpan pembayaran QR benar-benar tidak termodifikasi kecuali untuk optimasi ukuran dan pencetakan profesional pada saham kartu matte.', 'Pendekatan konservatif ini berarti kode pembayaran tampak kurang \'bermerek\' daripada ideal, tetapi tingkat penyelesaian transaksi meningkat secara dramatis. Wawasan: saat pembayaran tidak branding kesempatan - mereka momen kepercayaan. Pelanggan menghargai kecepatan dan kepastian atas estetika ketika uang terlibat.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Pembayaran besar yang bersih pada saham kartu matte profesional, diposisikan di register',
          caption: 'Pembayaran QR: berukuran murah hati, dicetak secara profesional, bergaya konservatif untuk pengenalan instan oleh aplikasi perbankan',
        },
      ],
    },
    {
      heading: 'Membuat Aksi Kedua Tampilan',
      paragraphs: ['Untuk tips, ulasan, sosial, dan perekrutan, toko bisa lebih ekspresif. Kode-kode ini diregenerasi di ANQR dengan gaya merek yang konsisten: tanda tangan toko zaitun hijau pada krim, gaya modul bulat, dan pusat halus overlay dengan ikon toko. Koreksi Galat Bahkan dengan gaya.', 'Keempat kode ini diatur dalam panel bermerek di samping (tidak bersaing dengan) kode pembayaran. Hapus label dalam tipografi toko menjelaskan setiap tujuan kode. Hirarki visual disengaja: pembayaran berdiri sendiri dan menonjol; tindakan sekunder dikelompokkan bersama sebagai pilihan.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Panel bermerek menunjukkan empat kode QR yang ditata untuk tips, ulasan, sosial, dan perekrutan, dengan label yang jelas',
          caption: 'Panel aksi sekunder: branding konsisten, pelabelan jelas, diposisikan sebagai opsi daripada gangguan',
        },
      ],
    },
    {
      heading: 'Desain Sistem Tampilan',
      paragraphs: ['Tampilan fisik memecahkan beberapa masalah secara bersamaan. Baik stand pembayaran dan panel sekunder digunakan material matte untuk menghilangkan sire dari pencahayaan overhead. Tinggi dioptimalkan untuk pelanggan berbagai perawakannya. Sudut diarahkan menuju antrian pelanggan daripada rata pada counter.', 'Secara kritis, toko membuat cetakan cadangan dari link konfigurasi ANQR terkunci. Ketika kode tips akhirnya mendapat kopi - splashed, staf diganti dalam beberapa menit menggunakan konfigurasi yang tersimpan - tidak ada cuplikan layar, tidak ada menebak pengaturan, tidak ada degradasi kualitas.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Diagram yang menunjukkan tata letak fisik: ketinggian, sudut, materi, dan hubungan antara pembayaran dan tampilan sekunder',
          caption: 'Tampilan cetak biru sistem: fisik ergonomics dioptimasi untuk pemindaian dapat diandalkan di ketinggian pelanggan dan kondisi pencahayaan',
        },
      ],
    },
    {
      heading: 'Improvisasi Operasional',
      paragraphs: ['Enam minggu setelah penerapan, toko tersebut mendokumentasikan peningkatan yang signifikan: tidak ada keluhan pelanggan tentang kebingungan \'kode yang salah\', waktu transaksi yang lebih cepat, dan peningkatan pengiriman tip sebesar 3x (pelanggan kini dapat menemukan dan memindai kode tip tanpa harus bertanya kepada staf dengan canggung). Ulasan Google juga meningkat karena QR khusus dan berlabel baik menghilangkan gesekan.', 'Pelatihan staf menjadi lebih sederhana: \'Kode pembayaran adalah satu besar, segala sesuatu yang lain adalah pada panel. "Ketika aplikasi pembayaran diperbarui dan satu singkat menunjukkan lambat pemindaian, desain pembayaran kode konservatif berarti masih bekerja - hanya marginally lambat daripada gagal sepenuhnya.', 'Lihat panduan Belajar pada kode QR untuk pembayaran ritel untuk prinsip-prinsip di balik desain sistem tampilan ini.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Sebuah dashboard metrik menunjukkan sebelum / setelah perbandingan: kebingungan insiden, transaksi waktu, frekuensi tip, review submission',
          caption: 'Enam minggu operasi data menunjukkan dampak bisnis dari sistem tampilan multi- QR bijaksana',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Ramban artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Studi Kasus: Dari Kartu Bisnis ke Billboard',
      paragraphs: ['Contoh ini mengikuti perusahaan produksi acara mempersiapkan konferensi besar. Mereka membutuhkan kode QR yang sama - terhubung ke aplikasi peristiwa - menyebar melalui format yang berbeda secara radikal: badge peserta menyisipkan (3cm), kartu tent (8cm), tanda-tanda meja pendaftaran (30cm), menghasilkan poster (60cm), dan sebuah spanduk latar belakang panggung besar (4 meter). Setiap format memiliki jarak pandang yang berbeda, kondisi pencahayaan, dan alur kerja produksi.', 'Tantangan itu tidak hanya teknis - itu operasional. Beberapa vendor menangani pekerjaan cetak yang berbeda, dan perusahaan perlu memastikan hasil yang konsisten dan dapat dipindai terlepas dari siapa yang menghasilkan apa. Solusi mereka berpusat pada ekspor SVG dan dokumentasi handoff ketat.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kolase yang menunjukkan kode QR yang sama menyebar di lima ukuran berbeda, dari lencana ke banner',
          caption: 'Satu kode QR, lima ukuran penyebaran: tantangan untuk mempertahankan scannability dari sentimeter ke meter',
        },
      ],
    },
    {
      heading: 'Mengapa Kejadian Sebelumnya Memiliki Masalah',
      paragraphs: ['Pada konferensi terakhir mereka, perusahaan mengalami kegagalan memalukan. Panji panggung QR dihasilkan sebagai PNG kecil dan skala dalam perangkat lunak desain - hasilnya tampak diterima dari kejauhan tapi gagal untuk memindai dapat diandalkan dari penonton. Lencana QRs terlalu bergaya dan terlalu kecil, peserta frustasi mencoba menambahkan kontak. Pengaturan tidak konsisten di seluruh format berarti \'sama\' QR sebenarnya tampak berbeda pada setiap bagian.', 'Analisis post- mengungkapkan penyebab akar: tidak ada sumber kebenaran. Setiap perancang telah membuat ulang QR dengan pengaturan yang sedikit berbeda, dan setiap vendor cetak telah memproses file secara berbeda. Kualitas menurun melalui permainan telepon handoffs file.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Tutup-up foto-foto menampilkan kegagalan pemindaian: modul banner pixelated, kode lencana kurang ukurannya, gaya tidak konsisten di seluruh format',
          caption: 'Analisis forensik dari kegagalan peristiwa sebelumnya: setiap format telah memperkenalkan masalah kualitas yang berbeda',
        },
      ],
    },
    {
      heading: 'The SVG-First Workflow',
      paragraphs: ['Untuk acara ini, perusahaan menetapkan protokol yang ketat: satu master QR dihasilkan di ANQR dengan pengaturan optimal (Galat Koreksi H, zona tenang murah hati, gaya bersih), diekspor sebagai SVG, dan disimpan sebagai sumber otoritas tunggal. Link konfigurasi ANQR didokumentasikan bersama berkas SVG sehingga kode dapat diregenerasi jika diperlukan.', 'Setiap desainer dan penjual menerima master SVG yang sama dengan instruksi eksplisit: tempat pada ukuran yang diperlukan, tidak memodifikasi, mempertahankan izin zona tenang. Untuk vendor yang membutuhkan format raster, perusahaan yang diberikan PNG sebelumnya dengan ukuran khusus dengan konvensi penamaan yang jelas menunjukkan penggunaan yang dimaksudkan.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Paket berkas menampilkan master SVG, size- spesifik PNG, dokumen spesifikasi, dan link konfigurasi',
          caption: 'Paket handoff: semua vendor dibutuhkan untuk menghasilkan hasil yang konsisten tanpa menebak',
        },
      ],
    },
    {
      heading: 'Size- Konsistensi Spesifik',
      paragraphs: ['Setiap format membutuhkan perhatian khusus. Lencana dimasukkan pada 3cm diperlukan QR untuk menempati ruang maksimum yang tersedia - jarak pemindaian akan panjang lengan. Tenda meja di 8cm bisa termasuk bingkai dekorasi di luar zona tenang. Banner 4 meter membutuhkan perhitungan: dari jarak penonton yang khas (15-20 meter), modul harus dibedakan dengan jelas oleh kamera telepon, yang berarti QR harus setidaknya 80 cm dalam desain banner.', 'Perusahaan menciptakan panduan ukuran mendokumentasikan dimensi QR minimum untuk setiap jarak pemindaian yang diharapkan. Hal ini menjadi aset yang dapat digunakan kembali untuk peristiwa mendatang, menghilangkan tebakan dari proses desain.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Sebuah bagan yang menampilkan hubungan antara jarak pemindaian, ukuran QR minimum, dan dimensi modul untuk setiap format acara',
          caption: 'Matriks ukuran: dimensi dihitung memastikan pemindaian dapat diandalkan di setiap format diharapkan jarak melihat',
        },
      ],
    },
    {
      heading: 'Hasil Produksi',
      paragraphs: ['Validasi hari konferensi secara sistematis: staf menguji setiap QR yang dikerahkan sebelum pintu terbuka. Lencana memasukkan pemindaian langsung pada panjang lengan. Tenda tabel bekerja dengan baik dalam pencahayaan variabel kamar breakout. Panji panggung - acara sebelumnya memalukan - dipindai berhasil dari tengah area penonton.', 'Tak ada keluhan pemindaian yang dicatat di seluruh 2.000 + peserta. Kemenangan operasional itu sama pentingnya: ketika sponsor terakhir menit tambahan diperlukan tanda tangan baru, tim produksi dihasilkan dari master SVG dalam beberapa menit, yakin itu akan cocok segala sesuatu yang lain.', 'Lihat panduan Belajar pada print- siap QR kode untuk SVG vs PNG kerangka keputusan dan handoff praktek terbaik.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografi acara menunjukkan peserta berhasil memindai kode QR pada berbagai ukuran dan jarak sepanjang lokasi',
          caption: 'Sukses hari konferensi: pemindaian dapat diandalkan di setiap format, dari penutupan lencana-up ke gambar jarak spanduk panggung',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Ramban artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Studi Kasus: Tampilan Digital Airport Lounge',
      paragraphs: ['Contoh ini mengikuti ruang penerbangan yang menggunakan kode QR statis pada layar selamat datang digital mereka. Layar yang ditampilkan konten promosi berputar, tetapi kode QR untuk lounge check-in duduk di sudut, statis dan mudah diabaikan. Analisa hanya menunjukkan 15% dari tamu yang memenuhi syarat menggunakan check-in QR walaupun lebih cepat dari antrian meja. Kebanyakan tamu tidak menyadarinya.', 'Hipotesis ini sederhana: dalam lingkungan yang sibuk dengan pergerakan konten, sebuah QR statis menjadi tidak terlihat. Solusinya diperlukan untuk membuat QR terlihat tanpa mengorbankan ketergantungan yang diperlukan untuk arus check-in di mana kegagalan akan berarti frustrasi wisatawan dan antrean meja panjang.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Tampilan digital di ruang tunggu bandara menunjukkan konten promosi dengan kode QR statis kecil di pojok',
          caption: 'Pengaturan asli: sebuah QR statis hilang dalam lautan konten promosi dinamis, hanya mencapai 15% adopsi',
        },
      ],
    },
    {
      heading: 'Mendesain Animasi Aman',
      paragraphs: ['Tanda tangan digital lounge menggunakan panel LED besar - lingkungan yang menantang di mana animasi agresif dapat menciptakan masalah pemindaian. Tim desain mulai konservatif: efek pulsa lembut yang diperluas dan diperluas dan dikontrak kehadiran visual QR tanpa memodifikasi struktur kode sebenarnya. Waktu bingkai ditetapkan lambat (250ms) untuk menghindari masalah kedipan pada tingkat LED.', 'Validasi Mode Keselamatan dikonfirmasi setiap frame tetap dapat dipindai. Pengujian tambahan pada panel LED yang sebenarnya mengungkapkan bahwa denyut nadi perlu lebih halus daripada pratilik desktop menyarankan - LED kecerahan dan sudut melihat terpengaruh kontras yang lebih dari yang diharapkan.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Panel pengaturan animasi ANQR menampilkan konfigurasi pulse: waktu lambat, intensitas yang halus, Mode Keselamatan diaktifkan',
          caption: 'Konfigurasi animasi: parameter yang disetel untuk tampilan panel LED ketika mempertahankan kemampuan memindai dalam setiap bingkai',
        },
      ],
    },
    {
      heading: 'Integrasi dengan Konten Sinyal',
      paragraphs: ['QR diposisikan dalam \'zona stabil\' yang berdedikasi dari tata letak layar - area yang tetap konstan sementara konten promosi diputar di area tampilan utama. Pemisahan ini sangat penting: QR membutuhkan stabilitas visual untuk memindai bahkan ketika menarik perhatian melalui animasi halus.', 'Panggilan yang jelas untuk tindakan ditambahkan berdekatan dengan QR: \'Lewati antrian - pindai untuk memeriksa.\' Teks tetap statis sementara QR berdenyut, menciptakan hirarki visual yang menarik mata ke kesempatan pemindaian tanpa melampaui konten promosi.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Diagram tata letak layar menampilkan animasi QR dalam zona stabil sementara isi promosi diputar di area utama',
          caption: 'Alokasi real estate layar: animasi QR menempati zona stabil terpisah dari konten promosi berputar',
        },
      ],
    },
    {
      heading: 'Penyebaran Teknis',
      paragraphs: ['QR animasi diekspor sebagai GIF dengan pengaturan teroptimasi untuk CMS signage. Pertimbangan ukuran berkas penting - sistem manajemen isi lounge memiliki batas upload, dan terlalu besar file menyebabkan pemutaran gagap. ekspor akhir seimbang kualitas visual terhadap ukuran berkas dengan membatasi palet warna dan optimasi jumlah frame.', 'Penyebaran termasuk fallback: jika GIF gagal bermain untuk alasan apapun, sistem tanda tangan akan menampilkan backup PNG statis. Redundansi ini memastikan kemampuan pemeriksaan tidak pernah hilang karena masalah teknis dengan animasi.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Antarmuka CMS menampilkan upload QR animasi dengan gambar static fallback yang dikonfigurasi',
          caption: 'Konfigurasi CMS signage: animasi primer dengan fallback statis memastikan check-dalam kemampuan tidak pernah terganggu',
        },
      ],
    },
    {
      heading: 'Impact Pengukuran',
      paragraphs: ['Setelah satu bulan operasi, QR memeriksa adopsi meningkat dari 15% menjadi 24% - peningkatan 60% relatif. Survey umpan balik tamu menunjukkan animasi QR adalah \'lebih mudah untuk pemberitahuan\' dan \'merasa lebih modern\'. Waktu antrian di meja menurun secara minimal selama periode puncak sebagai tamu sendiri-dilayani melalui QR.', 'Tak ada kegagalan pemindaian yang dilaporkan meskipun ribuan scan harian. Pendekatan animasi konservatif telah mencapai tujuan perhatian tanpa mengorbankan ketergantungan aliran check-in menuntut. lounge kemudian digulung mirip animasi QRs ke lokasi mereka yang lain.', 'Lihat panduan Belajar pada kode QR animasi untuk tanda tangan digital untuk prinsip teknis belakang desain animasi aman.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Sebuah dashboard menunjukkan peningkatan kecepatan adopsi, pengurangan waktu antrian, dan zero- gagal memindai keandalan selama periode penyebaran',
          caption: 'Satu bulan data: 60% peningkatan adopsi, mengurangi waktu antrian, dan mempertahankan keandalan pemindaian yang sempurna',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Ramban artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Studi Kasus: Kampanye Global Product Peluncuran QR',
      paragraphs: ['Contoh ini mengikuti perusahaan elektronik konsumen meluncurkan produk baru secara bersamaan di 12 pasar di 8 bahasa. Setiap tim pemasaran regional diperlukan untuk membuat kemasan, tampilan ritel, dan bahan promosi yang menampilkan kode QR yang menghubungkan ke lokalisasi halaman produk. Peluncuran sebelumnya telah menghasilkan gaya QR yang tidak konsisten, kadang-kadang gagal pemindaian, dan sebuah \'permainan telepon\' pergeseran konfigurasi sebagai setiap tim diciptakan kode dari screenshot.', 'Solusinya memanfaatkan konfigurasi tajam ANQR untuk membangun satu sumber kebenaran yang setiap tim regional bisa akses, terlepas dari bahasa antarmuka mereka. Muatan QR menggunakan redirect cerdas yang terdeteksi bahasa pengguna, jadi satu kode bekerja secara global sambil memberikan pengalaman lokalisasi.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Peta dunia menunjukkan 12 lokasi pasar dengan kode QR, beberapa visual tidak konsisten satu sama lain',
          caption: 'Tantangannya: 12 pasar, 8 bahasa, dan sejarah implementasi QR yang tidak konsisten di seluruh daerah',
        },
      ],
    },
    {
      heading: 'Membangun Konfigurasi Master',
      paragraphs: ['Tim merek global menciptakan konfigurasi berwibawa QR dalam ANQR: warna merek yang cocok dengan identitas visual produk, Error Correction H untuk keandalan seluruh cetakan dan aplikasi digital, dan styling yang akan mereproduksi secara konsisten terlepas dari metode produksi lokal. Konfigurasi terkunci dan link berbagi didokumentasikan dalam singkat kampanye global.', 'Kritis, URL yang dikodekan menggunakan layanan redirect terdeteksi. Ketika dipindai, pengguna secara otomatis diarahkan ke halaman produk bahasa lokal mereka. Ini berarti semua 12 pasar bisa menggunakan kode QR yang identik - tidak ada variasi muatan per- pasar yang dapat memperkenalkan kesalahan.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Antarmuka ANQR menampilkan konfigurasi master dengan warna merek, ECC H, dan URL redirect pintar',
          caption: 'Konfigurasi master: standar merek global dikodekan ke dalam satu sumber kebenaran yang dapat dibagi',
        },
      ],
    },
    {
      heading: 'Area Kerja Tim Regional',
      paragraphs: ['Setiap tim pemasaran regional menerima link konfigurasi dengan instruksi sederhana: buka link, verifikasi pratilik cocok dengan pedoman merek, ekspor dalam format yang diperlukan untuk aplikasi Anda. Antarmuka ANQR yang ditampilkan dalam bahasa yang disukai setiap tim, tetapi pengaturan QR yang mendasari tetap identik terlepas dari bahasa antar muka.', 'Ketika tim Jepang membutuhkan SVG untuk highend tampilan ritel dan tim Brasil diperlukan PNG untuk media sosial, keduanya diekspor dari konfigurasi yang sama. Ketika tim Jerman mencetak vendor meminta nilai-nilai warna tertentu, mereka bisa referensi konfigurasi langsung daripada menebak dari screenshot.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Cuplikan layar menunjukkan link konfigurasi yang sama dibuka dalam antarmuka Jepang, Portugis, dan Jerman',
          caption: 'Konfigurasi yang sama, antarmuka yang berbeda: tim regional bekerja dalam bahasa yang mereka sukai sambil menjaga konsistensi global',
        },
      ],
    },
    {
      heading: 'Menangani Variabel Regional',
      paragraphs: ['Beberapa pasar membutuhkan adaptasi kecil. Tim Cina membutuhkan versi dengan WeChat--frame teroptimasi untuk berbagi sosial. Daripada memodifikasi master, mereka membuat varian terdokumentasi dengan link konfigurasi sendiri, jelas berlabel sebagai \'CN- WeChat varian\' dalam pustaka aset kampanye. Alat ini bisa dilacak selagi memungkinkan lokalisasi diperlukan.', 'Tim merek tersebut membuat aturan sederhana: variasi apapun dari master memerlukan link konfigurasi baru yang terdokumentasi. Tidak ada modifikasi untuk mengekspor berkas, tidak ada \'perbaikan cepat\' dalam perangkat lunak desain. Ini mencegah pergeseran konfigurasi yang telah terganggu peluncuran sebelumnya.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Antar muka pustaka aset menampilkan konfigurasi utama dan varian regional yang disetujui, masing-masing dengan link sendiri',
          caption: 'Pemerintahan aset kampanye: konfigurasi master ditambah varian terdokumentasi, semua link konfigurasi yang dilacak',
        },
      ],
    },
    {
      heading: 'Hasil Peluncuran',
      paragraphs: ['Hari peluncuran produk melihat kode QR menyebar di seluruh kemasan, tampilan ritel, materi acara, dan kampanye digital di 12 pasar secara bersamaan. Audit kualitas mengkonfirmasi konsistensi visual di seluruh daerah - QR di Tokyo tampilan ritel cocok dengan QR pada São Paulo kemasan sesuai dengan QR pada bendera acara Berlin.', 'Tidak ada pemindaian kegagalan dilaporkan di seluruh pasar. Ketika perubahan halaman produk post- peluncuran diperlukan, layanan redirect menanganinya tanpa terlihat - tidak perlu mencetak ulang. Tim global memperkirakan pendekatan link konfigurasi disimpan 40 + jam koordinasi waktu dibandingkan dengan metodologi peluncuran mereka sebelumnya.', 'Lihat panduan Belajar pada kolaborasi lintas lingual QR untuk prinsip-prinsip alur kerja di belakang konsistensi kampanye global.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Jaringan foto menunjukkan penyebaran QR konsisten di pasar yang berbeda: Retail Tokyo, paket São Paulo, peristiwa Berlin',
          caption: 'Konsistensi global dicapai: presentasi QR identik di 12 pasar meskipun berbagai bahasa, vendor, dan format',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Ramban artikel Pelajari',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Ramban artikel Pelajari', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Buka Panduan Pengguna penuh', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Buka galeri', type: 'gallery' },
  ],
};
