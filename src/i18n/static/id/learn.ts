import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Pelajari dengan ANQR',
  description: 'Panduan praktis dan mengutamakan bisnis untuk mengubah kode QR menjadi aset pemasaran nyata - bukan hanya kotak fungsional. Pelajari cara meningkatkan kode tempat penjualan lama, membuat tanda QR pembayaran yang sesuai, menyiapkan ekspor siap cetak, menggunakan animasi dengan aman di tampilan digital, dan berbagi konfigurasi terkunci ke seluruh tim multibahasa menggunakan tautan ANQR ("anchor").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buka generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Buka Panduan Pengguna penuh', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Campaigns QR yang Tak Membuktikan',
      paragraphs: ['Kebanyakan bisnis memiliki kode QR yang tersebar di seluruh operasi mereka - pada menu, stand counter, kemasan, dan bahan promosi. Banyak dari kode-kode ini diciptakan tahun lalu dengan generator dasar, menghasilkan warna-hitam dan-kotak putih umum yang gagal untuk menginspirasi kepercayaan atau mencocokkan identitas merek Anda. Panduan komprehensif ini membimbing Anda melalui pendekatan sistematis untuk audit, upgrade, dan mengoptimalkan infrastruktur QR Anda yang sudah ada tanpa mengganggu perjalanan pelanggan yang telah Anda dirikan.', 'Keuntungan strategis dari meningkatkan alih-alih mengganti kode QR-mu terletak pada kelanjutan. Pelanggan Anda telah belajar untuk mengharapkan tujuan tertentu ketika mereka memindai kode Anda. Dengan menjaga URL yang dikodekan identik secara dramatis meningkatkan presentasi visual, memindai keandalan, dan keselarasan merek, Anda membuat transisi mulus yang meningkatkan kepercayaan tanpa membutuhkan perubahan apapun untuk infrastruktur digital atau pelacakan analisis Anda.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Perbandingan sisi samping menunjukkan kode QR generik yang memudar di sebelah pengkodean versi bermerek modern URL yang sama',
          caption: 'Sebelum dan sesudah: URL tujuan yang sama berubah dari kode generik tertanggal ke aset bermerek profesional',
        },
      ],
    },
    {
      heading: 'Mengapa Kode Warisan QR Menggarap',
      paragraphs: ['Kode QR dibuat selama fase adopsi awal - terutama pada tahun 2020- 2021 ketika bisnis bergegas untuk melaksanakan solusi kontacIess - sering menderita beberapa isu kritis. Pengaturan kesalahan rendah membuatnya rapuh ketika dicetak pada permukaan bertekstur atau dilihat di bawah pencahayaan yang menantang. Zona tenang tidak cukup menyebabkan kegagalan pemindaian ketika kode ditempatkan dekat elemen visual lainnya. Gaya umum gagal untuk mengkomunikasikan legitimasi merek, menyebabkan keraguan dan mengurangi tingkat pemindaian.', 'Di luar keterbatasan teknis, kode warisan seringkali mewakili peluang yang hilang. Setiap kode QR adalah titik sentuh dengan pelanggan Anda - saat di mana mereka aktif terlibat dan bersedia untuk mengambil tindakan. Sebuah gaya kode profesional yang cocok dengan warna merek Anda, termasuk margin keselamatan yang sesuai, dan fitur elemen bermerek opsional mengubah utilitas ini menjadi aset pemasaran yang memperkuat identitas Anda pada setiap interaksi.'],
    },
    {
      heading: 'Melengkapi Audit Kode QR',
      paragraphs: ['Mulai proyek upgrade Anda dengan membuat inventaris komprehensif dari setiap kode QR yang saat ini dikerahkan di seluruh bisnis Anda. Dokumen lokasi fisik, tujuan tersandi, kondisi saat ini dari bahan cetak, dan lingkungan pemindaian khas termasuk kondisi pencahayaan dan sudut pandang. Uji setiap kode dengan beberapa perangkat - smartphone dan perangkat anggaran yang lebih tua sering mengungkapkan masalah keandalan bahwa mask telepon premium.', 'Perhatikan secara khusus untuk kode di lokasi berisiko tinggi: titik pembayaran, check-in daerah, dan tampilan promosi dimana memindai kegagalan langsung berdampak pendapatan atau pengalaman pelanggan. Ini harus diutamakan untuk upgrade segera. Juga catatan kode yang muncul dalam fotografi atau konten video, karena ini akan membutuhkan koordinasi dengan tim pemasaran Anda untuk memperbarui aset visual.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Antar muka checklist menampilkan kategori audit QR: lokasi, kondisi, pemindaian daya tahan, dan peringkat prioritas',
          caption: 'Templat audit QR sistematis untuk mendokumentasikan dan memprioritaskan kandidat peningkatan Anda',
        },
      ],
    },
    {
      heading: 'Strategi Upgrade Aman',
      paragraphs: ['Aturan utama QR upgrade adalah pelestarian tujuan. Ekstrak URL yang tepat dari setiap kode yang ada dan masukkan ke dalam versi baru Anda. Ini menjamin semua analisis yang ada, mengarahkan logika, dan harapan pelanggan tetap utuh. Jika Anda membutuhkan tujuan fleksibel untuk pemutakhiran masa depan, ini adalah waktu yang ideal untuk memperkenalkan URL pendek atau layanan redirect yang bermerek - tetapi mengimplementasikan ini sebagai proyek terpisah untuk menghindari perubahan kompon.', 'Untuk peningkatan visual, menerapkan peningkatan dalam lapisan: pertama pastikan ketergantungan teknis (koreksi kesalahan yang tepat dan zona tenang), kemudian tambahkan gaya merek (warna, bentuk modul), dan akhirnya mempertimbangkan peningkatan opsional (center overplain, frame). Setiap lapisan harus divalidasi melalui pengujian sebelum melanjutkan. Mode Keselamatan ANQR membantu memaksakan prioritas ini dengan peringatan ketika pilihan styling mungkin kompromi scrannability.'],
    },
    {
      heading: 'Menambahkan Identitas Merek Tanpa Relibilitas Berkompromi',
      paragraphs: ['Efek QR branding keseimbangan visual dampak terhadap kemampuan pemindaian. Mulailah dengan warna: ganti latar belakang hitam bawaan dengan warna merek primer Anda, memastikan kontras yang cukup terhadap latar belakang Anda. Untuk kebanyakan merek, warna gelap pada latar belakang cahaya bekerja terbaik. Hindari kombinasi rendah kontras, gradien yang mengurangi kejelasan tepi, atau warna yang tampak sama dalam kondisi pencahayaan umum.', 'Pengaturan bentuk modul menawarkan kesempatan branding lain dengan dampak minimal ketergantungan. Modul yang berkelok-kelok membuat penampilan yang lebih lembut, dan lebih mudah didekati sambil menjaga kemampuan gerak yang sangat baik. Modul bergaya Dot- bekerja dengan baik untuk merek modern, teknologi maju. Modul terhubung sesuai industri atau identitas perusahaan. Apapun gaya yang kau pilih, pertahankan konsistensi di semua penyebaran QR-mu untuk pengenalan merek instan.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Diagram roda warna menunjukkan kombinasi warna QR optimal dengan indikator rasio kontras',
          caption: 'Panduan seleksi warna merek menunjukkan kombinasi berkontras tinggi yang mempertahankan ketergantungan pemindaian',
        },
      ],
    },
    {
      heading: 'Protokol Pengujian dan Validasi',
      paragraphs: ['Jangan pernah perbarui kode QR tanpa pengujian ketat. Cetak bukti fisik pada ukuran yang tepat dan pada bahan yang sama sebagai penyebaran akhir Anda. Uji di lokasi sebenarnya di mana kode akan hidup, pada waktu yang berbeda hari untuk memperhitungkan variasi pencahayaan. Gunakan setidaknya tiga perangkat berbeda: telepon flagship saat ini, perangkat mid- range, dan smartphone yang lebih tua atau anggaran.', 'Catatan pemindaian kali dan tingkat keberhasilan untuk setiap tes. Sebuah kode teroptimasi baik harus memindai dalam 1-2 detik pada perangkat modern yang cukup. Jika Anda melihat penundaan atau kegagalan yang konsisten, mengurangi intensitas styling - menghapus atau mengecilkan overlay, meningkatkan ukuran zona tenang, atau beralih ke tingkat koreksi kesalahan yang lebih tinggi. Refabilitas selalu mengambil prioritas atas kecanggihan visual.'],
    },
    {
      heading: 'Mengunci Konfigurasi Anda untuk Konsistensi',
      paragraphs: ['Setelah Anda memvalidasi konfigurasi optimal, pertahankan menggunakan link yang dapat dibagi ANQR. Ini menciptakan catatan permanen dari setiap pengaturan yang digunakan untuk menghasilkan kode yang disetujui Anda - warna, gaya modul, koreksi kesalahan, ukuran, dan setiap overlay. Berbagi link ini dengan tim desain Anda, mencetak vendor, dan siapa pun yang mungkin perlu untuk mereproduksi kode di masa depan.', 'Konfigurasi ini terkunci mencegah degradasi bertahap yang mengganggu penyebaran QR banyak. Tanpa itu, anggota staf menciptakan kode dari cuplikan layar, desainer membangun ulang pengaturan dari memori, dan mencetak vendor membuat \'membantu\' penyesuaian. Setiap variasi memperkenalkan masalah potensial. Dengan link konfigurasi terkunci, setiap reproduksi identik dengan tes Anda, disetujui asli.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Diagram yang menunjukkan pergeseran konfigurasi: cuplikan layar yang mengarah ke rekreasi yang mengarah ke varian, dibandingkan sumber tunggal dari hubungan kebenaran',
          caption: 'Mencegah pergeseran konfigurasi dengan membangun sumber otoriter tunggal untuk semua reproduksi QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Lihat contoh QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Kode QR untuk Pembayaran Ekor',
      paragraphs: ['Pembayaran kode QR beroperasi dalam lingkungan yang paling menuntut di ritel: saat transaksi. Pelanggan siap membayar, sering dengan antrian membentuk di belakang mereka, dan setiap detik penundaan menciptakan gesekan. Namun saat ini tekanan tinggi juga real estate utama untuk memperkuat merek. Pemandu ini menjelaskan bagaimana cara membuat kode pembayaran QR yang memindai langsung pada aplikasi perbankan sementara masih menyajikan penampilan profesional bermerek yang membangun kepercayaan pelanggan.', 'Prinsip dasar untuk pembayaran kode QR adalah keandalan atas estetika. Sebuah kode dirancang indah yang gagal untuk memindai pada aplikasi perbankan satu pelanggan akan dikenakan biaya jauh lebih dalam transaksi ditinggalkan dan pelanggan frustrasi daripada desain konservatif yang pernah bisa. Mulai dengan kepatuhan, tambahkan ketergantungan, kemudian hati-hati lapisan di branding hanya di mana tidak kompromi fungsi utama.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Sebuah tampilan counter ritel menunjukkan pembayaran QR kode yang dipindai oleh smartphone dengan aplikasi perbankan',
          caption: 'Pembayaran kode QR harus bekerja langsung dengan aplikasi perbankan dan dompet di bawah kondisi counter realworld',
        },
      ],
    },
    {
      heading: 'Memahami Pembayaran Standar QR',
      paragraphs: ['Pembayaran kode QR biasanya mengikuti standar regional yang mendikte format muatan. Di Singapura, PayNow QR menggunakan format spesifik. Di India, kode UPI mengikuti BharatQR atau UPI dalam standar link. Pembayaran SEPA Eropa menggunakan kode EPC QR. Setiap standar ada untuk memastikan aplikasi perbankan dapat langsung mengenali dan memproses informasi pembayaran. Mengembangkan dari standar ini - bahkan sedikit - dapat menyebabkan aplikasi pembayaran untuk menolak kode-kode bahwa scanner kamera generik dibaca tanpa masalah.', 'ANQR termasuk template untuk standar pembayaran utama yang secara otomatis format rincian pedagang Anda ke payloads compliant. Selalu gunakan template ini daripada membangun string pembayaran secara manual, karena kesalahan format kecil dapat menyebabkan kegagalan transaksi. Jika standar pembayaran wilayah Anda tidak tersedia sebagai template, berkonsultasi dengan penyedia pembayaran Anda untuk dokumen teknis untuk persyaratan format yang tepat.'],
    },
    {
      heading: 'Ukuran dan Penempatan untuk Tampilan Konter',
      paragraphs: ['Counter- top QR kode menghadapi tantangan fisik yang unik. Pelanggan memindai pada panjang lengan, sering pada sudut, kadang-kadang melalui petugas bersin atau menampilkan kasus. Lampu di atas membuat bintik-bintik silau. Kode bersaing dengan lain counter kekacauan untuk perhatian dan pandangan yang jelas. Ukuran pembayaran Anda QR murah hati - minimal 4-5cm direkomendasikan untuk aplikasi kontra kebanyakan, skala up jika kode duduk di balik kaca atau dalam daerah menyala suram.', 'Posisi sama pentingnya dengan ukuran. Tempatkan kode di mana pelanggan dapat dengan nyaman memegang telepon mereka tanpa memblokir antrian atau mencapai canggung. Sudut tampilan terhadap pelanggan daripada meletakkannya datar. Jika mungkin, gunakan laminasi matte atau non-reflektif tampilan bahan untuk meminimalkan silau dari pencahayaan atas. Uji penempatan akhir pada waktu yang berbeda hari untuk menangkap masalah pencahayaan.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Sebuah diagram menunjukkan penempatan QR optimal tinggi dan sudut untuk konfigurasi counter berbeda',
          caption: 'Panduan penempatan balasan: ketinggian optimal, sudut, dan jarak untuk pemindaian pembayaran yang dapat diandalkan',
        },
      ],
    },
    {
      heading: 'Branding Konservatif untuk Kode Pembayaran',
      paragraphs: ['Aplikasi pembayaran kurang pemaaf daripada pemindai kamera generik. Banyak aplikasi perbankan menggunakan algoritma pembaca QR yang lebih tua, lebih sederhana dioptimalkan untuk kecepatan daripada fleksibel. Ini berarti styling yang bekerja sempurna dengan kamera telepon mungkin gagal dengan aplikasi pembayaran tertentu. Jauhkan merek konservatif: gunakan warna merek Anda untuk latar depan jika mempertahankan kontras yang kuat, tetapi menghindari gradien, lapisan berat, atau elemen dekorasi yang dapat mengganggu pengakuan.', 'Jika Anda ingin logo tengah atau overlay, tetap sangat kecil - tidak lebih dari 10- 15% dari daerah QR - dan tes ekstensif dengan setiap aplikasi pembayaran pelanggan Anda mungkin gunakan. Banyak bisnis memilih untuk tidak overlay pada kode pembayaran secara khusus, mempertahankan gaya untuk kode QR pemasaran di mana persyaratan kewajiban kurang kuat. Tugas pembayaran kode adalah untuk memproses transaksi, bukan untuk mengesankan secara visual.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Perbandingan menunjukkan diterima vs tingkat percabangan berisiko untuk pembayaran kode QR',
          caption: 'Pembayaran spektrum branding QR: dari gaya konservatif yang aman ke pendekatan dekoratif berisiko',
        },
      ],
    },
    {
      heading: 'Materi dan Konsistensi Cetak',
      paragraphs: ['Material tampilan fisik secara signifikan berdampak scan daya tahan. Laminasi Glossy mencerminkan lampu di atas kepala langsung ke kamera pelanggan. Material bertekstur dapat mengubah tepi modul. Cetakan murah dapat mengaburkan rincian baik. Untuk pembayaran kode QR, investasikan dalam kualitas: gunakan laminasi matte atau satin, pastikan pencetakan resolusi tinggi, dan ganti tampilan sebelum mereka menampilkan pakaian. Sebuah kode pembayaran tergores atau memudar biaya transaksi Anda.', 'Pertimbangkan daya tahan tampilan dan pengganti. Pertunjukkan counter bisa disentuh, dipindahkan, disiram, dan kadang-kadang mengetuk atas. Mendesain sistem tampilan Anda sehingga masukan QR dapat dengan mudah diganti tanpa mengganti seluruh stand. Jauhkan cetakan cadangan siap, dihasilkan dari link konfigurasi terkunci Anda, sehingga kode yang dipakai dapat ditukar segera.'],
    },
    {
      heading: 'Pengujian dengan Pembayaran Real Apps',
      paragraphs: ['Pemindai kamera umum akan memecahkan kode hampir semua kode QR yang diformat secara wajar. Aplikasi pembayaran lebih pilih-pilih. Sebelum menerapkan kode QR pembayaran apa pun, ujilah kode tersebut dengan setiap aplikasi pembayaran yang mungkin digunakan pelanggan Anda. Dalam lingkungan multi-pembayaran, hal ini mungkin berarti pengujian dengan beberapa aplikasi perbankan, dompet digital, dan platform pembayaran. Dokumentasikan aplikasi mana yang telah Anda uji dan versinya - aplikasi pembayaran sering diperbarui, dan pembaruan dapat mengubah perilaku pemindaian.', 'Uji di bawah kondisi realistis: tampilan yang sebenarnya, pencahayaan yang sebenarnya, jarak pemindaian yang sebenarnya. Sebuah kode yang scan langsung di meja Anda mungkin perjuangan di meja pukul 5 sore ketika matahari sore menciptakan silo. Uji dengan ponsel pintar tertua dan termurah yang dapat Anda temukan - jika dapat bekerja dengan baik pada perangkat anggaran, itu akan bekerja pada segala sesuatu. Tanda setiap pemindaian waktu lebih dari 2 detik untuk penyelidikan dan potensi desain ulang.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Sebuah checklist pengujian menunjukkan berbagai aplikasi pembayaran, jenis perangkat, dan kondisi lingkungan untuk memverifikasi',
          caption: 'Pembayaran komprehensif QR pengujian matriks meliputi aplikasi, perangkat, dan faktor lingkungan',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Lihat contoh QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Print- Kode QR Ready: SVG vs PNG',
      paragraphs: ['Perbedaan antara kode QR yang memindai sempurna dan salah satu yang sering gagal datang ke bagaimana itu diekspor dan ditangani dalam arus kerja cetak. Panduan ini menjelaskan perbedaan kritis antara vektor (SVG) dan format raster (PNG), ketika menggunakan masing-masing, dan bagaimana menyerahkan karya seni QR ke desainer dan mencetak vendor dengan cara-cara yang mempertahankan pemindaian kemampuan dari kartu bisnis ke penanda billboard berukuran.', 'Cetak produksi memperkenalkan variabel yang tidak ada di layar: tinta menyebar, substrat tekstur, menyelesaikan proses, dan efek kumulatif dari beberapa berkas konversi. Kode QR yang tampak sempurna dalam perangkat lunak desain Anda dapat muncul dari pencetak dengan tepi lunak, kontras berkurang, atau modul yang terdistorsi bawah. Memahami seleksi format dan praktek-praktek terbaik untuk bekerja mencegah kegagalan keheningan ini.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Tilikan yang diperbesar membandingkan vektor modul QR dengan pinggiran pinggiran versus modul raster menampilkan artefak pixel',
          caption: 'Vektor vs raster pada skala cetak: perbedaan presisi yang menentukan kemampuan pemindaian',
        },
      ],
    },
    {
      heading: 'Mengapa Vektor (SVG) Disukai untuk Cetak',
      paragraphs: ['Berkas SVG menggambarkan kode QR sebagai bentuk matematika daripada grid piksel. Ini berarti kode dapat diperbesar ke ukuran apapun - dari label 1cm ke panji 10 meter - tanpa kehilangan tajam tepi. Pencetak RIP (Prosesor Gambar Raster) membuat vektor pada resolusi asli perangkat keluaran, memastikan setiap sudut modul serenyah seperti yang perangkat keras mengijinkan. Tidak ada interpolasi, tidak ada artefak anti- aliasing, tidak ada akumulasi dari beberapa operasi resize.', 'Selain skalabilitas, berkas SVG lebih kuat dalam arus kerja profesional. Mereka bertahan dalam perjalanan melalui perangkat lunak desain tanpa degradasi. Mereka bisa berwarna - dikoreksi tanpa resampling. Mereka embed bersih ke dalam berkas PDF untuk tekan-siap keluaran. Untuk aplikasi cetak dimana kualitas penting, SVG harus menjadi format ekspor baku Anda.'],
    },
    {
      heading: 'Ketika PNG Dapat Diterima',
      paragraphs: ['PNG menjadi diperlukan ketika platform tujuan atau alur kerja Anda tidak mendukung format vektor. Beberapa platform web, sistem tanda tangan CMS, dan alur kerja cetak warisan memerlukan gambar raster. Dalam kasus ini, PNG dapat bekerja dengan baik - tetapi hanya jika Anda mengikuti aturan ketat: ekspor pada ukuran fisik dan resolusi akhir, tidak pernah skala setelah ekspor, dan menghindari kompresi lossy apapun atau konversi format.', 'Aturan kritis PNG adalah menghitung dimensi pixel yang diperlukan sebelum mengekspor. Jika QR Anda akan mencetak pada 5cm dan pencetak Anda beroperasi di 300 DPI, Anda perlu sekitar 590 piksel. Ekspor ukuran ini atau lebih besar, maka perkecil jika diperlukan - tidak pernah naik. Sertakan informasi ini dalam nama berkas atau metadata Anda sehingga pengguna masa depan tidak sengaja menyalahgunakan ekspor size- spesifik.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Antar muka kalkulator menampilkan hubungan antara ukuran fisik, DPI, dan dimensi pixel yang diperlukan',
          caption: 'Cetak kalkulator resolusi: menentukan dimensi piksel minimum untuk ukuran keluaran target Anda',
        },
      ],
    },
    {
      heading: 'Opsi Ekspor ANQR Dijelaskan',
      paragraphs: ['ANQR menawarkan beberapa mode ekspor SVG sesuai dengan arus kerja yang berbeda. Mode Vektor benar menghasilkan jalur murni - berdasarkan keluaran ideal untuk cetak dan perangkat desain profesional. Bila Anda telah menambahkan overlay raster atau efek tertentu, ANQR dapat embed ini sambil mempertahankan modul vektor, atau Anda dapat mengekspor versi sepenuhnya rasterised pada resolusi yang ditentukan Anda. Memahami opsi ini membantu Anda memilih ekspor yang tepat untuk setiap kasus penggunaan.', 'Untuk ekspor PNG, ANQR memungkinkan Anda menentukan dimensi yang tepat dan termasuk pilihan untuk latar belakang transparan. Pengaturan DPI membantu Anda menghitung ukuran yang sesuai untuk pencetakan, meskipun ingat bahwa DPI adalah metadata - apa yang penting untuk pencetakan adalah memiliki cukup piksel untuk ukuran fisik Anda. Ketika ragu, ekspor lebih besar dari yang Anda pikir Anda butuhkan; skala bawah menjaga kualitas sementara skala Facebook menghancurkannya.'],
    },
    {
      heading: 'Menyiapkan Berkas untuk Handoff',
      paragraphs: ['Ketika menyerahkan karya seni QR kepada desainer atau vendor cetak, termasuk spesifikasi yang jelas: ukuran fisik yang dimaksudkan, persyaratan zona tenang minimum, dan pertimbangan ruang warna apapun. Untuk aplikasi kritis, menyediakan baik master SVG dan resolusi tinggi PNG cadangan, jelas berlabel dengan mereka dimaksudkan menggunakan. Termasuk link konfigurasi ANQR Anda sehingga kode dapat diregenerasi jika diperlukan.', 'Antik kesalahan umum dalam proses handoff. Secara eksplisit menyatakan bahwa QR tidak boleh diskala, diputar, miring, atau memiliki efek yang diterapkan. Spesifikasikan bahwa zona tenang harus tetap jelas - tidak ada tanda tanaman, tanda pendaftaran, atau unsur desain mengganggu. Jika QR akan ditempatkan pada latar belakang berwarna atau fotografi, menyediakan versi dengan bentuk punggung buram untuk memastikan kontras yang memadai.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Diagram paket berkas menampilkan master SVG, backup PNG, spesifikasi dokumen, dan link konfigurasi',
          caption: 'Paket handoff profesional QR: semua yang dibutuhkan desainer atau penjual cetak untuk reproduksi yang akurat',
        },
      ],
    },
    {
      heading: 'Verifikasi Profess Cetak',
      paragraphs: ['Jangan pernah menyetujui menjalankan cetak tanpa memindai bukti fisik. Meminta bukti yang dicetak pada substrat aktual dengan finish aktual yang akan digunakan dalam produksi. Pindai bukti di bawah kondisi pencahayaan mirip dengan di mana potongan terakhir akan ditampilkan. Uji dengan beberapa perangkat, termasuk smartphone yang lebih tua yang mungkin berjuang dengan kualitas marjinal.', 'Jika scan bukti perlahan atau tidak konsisten, menyelidiki sebelum menyetujui. Isu umum termasuk tidak cukup kontras pada substrat berwarna, pelanggaran zona tenang dari pemangkasan, tinta menyebar modul lembut, atau laminasi menciptakan silas. Salah satu dari ini dapat ditangani sebelum berkomitmen untuk menjalankan cetak lengkap - tetapi hanya jika Anda menangkap mereka pada tahap bukti.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Daftar cek bukti dengan hasil scan, pengukuran kontras, dan tanda tangan persetujuan',
          caption: 'Cetak bukti proses proses verifikasi: pengujian sistematis sebelum melakukan jumlah produksi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Lihat contoh QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Membuat Kode QR Teranimasi',
      paragraphs: ['Mengaktifkan kode QR menggabungkan fungsionalitas standar kode QR dengan gerakan menangkap mata yang secara dramatis meningkatkan tingkat keterlibatan. Dalam tanda tangan digital, media sosial, dan tampilan interaktif, animasi mengubah utilitas statis menjadi elemen visual yang menarik yang menarik mata dan mengundang interaksi. Panduan ini mencakup prinsip-prinsip, teknik, dan keterbatasan praktis menciptakan kode QR animasi yang dapat dipindai sambil memberikan dampak visual.', 'Tantangan fundamental dari kode-kode QR adalah menyeimbangkan ketertarikan visual terhadap kemampuan pemindaian. Setiap frame harus dipindai secara individual - scanner mungkin menangkap kode pada setiap titik dalam siklus animasi. Batas ini membentuk setiap keputusan desain: elemen mana yang dapat bergerak, seberapa banyak mereka dapat berubah, dan apa yang harus tetap stabil sepanjang animasi.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Tampilan penanda digital menampilkan kode QR animasi yang menangkap perhatian penonton dalam ruang publik',
          caption: 'Menganimasi kode QR dalam tanda tangan digital: gerak yang menarik perhatian dan mendorong pemindaian',
        },
      ],
    },
    {
      heading: 'Bagaimana Animasi Berpengaruh Scandability',
      paragraphs: ['Pemindai QR bekerja dengan menangkap satu bingkai dan menganalisis pola modul cahaya dan gelap. Untuk kode animasi untuk bekerja, setiap frame harus berisi pola QR yang lengkap dan valid. Hal ini menghilangkan animasi yang morph struktur kode, modul larut, atau secara signifikan mengubah pola kontras. Data-membawa modul - pola tampaknya acak di tengah - harus tetap visual stabil seluruh.', 'Animasi aman pendekatan memodifikasi elemen yang tidak membawa data: latar belakang, warna, frame dekoratif, dan unsur-unsur overlay. Komponen struktural - penemu pola (kotak sudut besar), pola waktu (garis bolak-balik), dan pola alignment (kotak kecil dalam kode yang lebih besar) - harus mempertahankan posisi dan proporsi mereka. Bekerja dalam kendala ini masih memungkinkan untuk mengejutkan dinamis dan menarik animasi.'],
    },
    {
      heading: 'Teknik Animasi Itu Pekerjaan',
      paragraphs: ['Warna bersepeda animates latar depan dan latar belakang warna melalui palet sambil mempertahankan perbedaan yang cukup di setiap langkah. Ini menciptakan efek getar, perhatian, meraih dengan risiko minimal scan - selama kontras tidak pernah turun di bawah tingkat yang dapat dibaca. Jangkauan siklus warna ANQR dirancang untuk mempertahankan scannability sepanjang siklus.', 'Animasi overlay tempat bergerak citra belakang pola QR semi-transparan. Kodenya tetap stabil ketika animasi latar belakang - mungkin video loop, elemen merek animasi, atau grafis gerak abstrak. Teknik ini membutuhkan manajemen intensitas hati-hati untuk mencegah latar belakang dari melampaui pola QR, tetapi menciptakan hasil yang paling visual mencolok.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Diagram yang menampilkan struktur berlapis dari QR yang animasi: lapisan kode stabil di atas lapisan latar belakang animasi',
          caption: 'Prinsip lapisan animasi: pola QR tetap konstan sementara elemen latar belakang hidup di bawah',
        },
      ],
    },
    {
      heading: 'Mengatur Parameter Animasi',
      paragraphs: ['Laju bingkai mempengaruhi smootness visual dan ukuran berkas. Bagi kebanyakan aplikasi, 10- 15 frame per detik memberikan gerak yang halus tanpa ukuran berkas yang berlebihan. Tingkat frame yang lebih tinggi menawarkan pengurangan keuntungan visual sementara secara signifikan meningkatkan ukuran berkas. Pertimbangkan konteks pengiriman Anda - tanda digital yang besar dapat menangani berkas yang lebih besar daripada penempatan iklan mobile.', 'Lap perilaku menentukan bagaimana siklus animasi. Loop mulus membuat gerak terus menerus ideal untuk penandaan dan tampilan ambien. Ping- pong (forward- then -reverse) loop bekerja dengan baik untuk animasi sederhana. Untuk perhatian-menyambar pulsa, pertimbangkan animasi dengan memegang - periode keheningan diselenggarakan oleh gerakan yang menarik mata tanpa gerakan konstan kelelahan.'],
    },
    {
      heading: 'Membuat Lapisan Teranimasi',
      paragraphs: ['Ketika menggunakan gambar animasi (GIFs, animasi WebPs, atau video) sebagai overlay, ANQR mengekstrak frame dan mengkomposit mereka dengan kode QR Anda. Pengaturan intensitas overlay mengontrol berapa banyak animasi menunjukkan melalui - nilai yang lebih rendah prioritas scannability sementara nilai yang lebih tinggi mendukung dampak visual. Uji intensitas yang Anda pilih di beberapa frame untuk memastikan scrannability konsisten.', 'Kualitas material sumber secara signifikan berdampak hasil. Gunakan overlay dengan subjek yang jelas dan kontras yang baik. Hindari animasi sumber dengan cepat berkedip atau perubahan kecerahan ekstrim yang bisa membuat sesekali rendah kontras frame. Pratilik siklus animasi penuh sebelum mengekspor untuk menangkap frame bermasalah yang mungkin gagal dipindai.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Sebuah tampilan frame-by- dari overlay animasi menunjukkan tingkat kontras dipertahankan di seluruh urutan',
          caption: 'Analisa bingkai: memverifikasi scannability konsisten di seluruh siklus animasi',
        },
      ],
    },
    {
      heading: 'Ekspor dan Konsistensi Pengiriman',
      paragraphs: ['GIF tetap menjadi format animasi yang paling banyak didukung, bermain secara otomatis dalam konteks tanpa membutuhkan dukungan pemutar video. Namun, GIF 256 warna palet membatasi kesetiaan warna. Untuk animasi warna-kritis, pertimbangkan animasi WebP dimana didukung, atau mundur ke format video untuk kualitas tertinggi. ekspor GIF ANQR termasuk opsi untuk memaksimalkan kualitas dalam keterbatasan palet.', 'Ukuran berkas penting untuk pengiriman. Sistem tanda tangan digital, klien email, dan platform sosial sering memaksakan batas ukuran. Jika animasi Anda melebihi batas ini, mengurangi jumlah frame, dimensi, atau kedalaman warna. Kadang-kadang membelah animasi kompleks menjadi loop yang lebih pendek mencapai hasil yang lebih baik daripada kompresi agresif yang menurunkan setiap frame.'],
    },
    {
      heading: 'Pengujian Kode QR Diaktifkan',
      paragraphs: ['Pengujian kode animasi membutuhkan pemindaian pada beberapa titik dalam siklus animasi. Jangan hanya memindai sekali dan menganggap sukses - scan berulang kali, pada saat yang berbeda, untuk memverifikasi bahwa setiap frame dapat dibaca. Perhatikan baik-baik pada frame pada siklus warna ekstrim atau puncak intensitas overlay dimana kontras mungkin rendah.', 'Uji pada perangkat keras tampilan aktual di mana mungkin. Monitor kalibrasi warna, sudut pandang, dan pencahayaan ambient semua mempengaruhi bagaimana animasi muncul dan scan. Animasi cerah yang memindai sempurna pada monitor Anda mungkin mencuci layar luar atau menjadi tidak dapat dibaca pada sudut pandang miring.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Sebuah matriks pengujian menunjukkan tingkat keberhasilan pemindaian di berbagai frame, perangkat, dan kondisi tampilan',
          caption: 'Menganimasi protokol pengujian QR: verifikasi sistematis di frame, perangkat, dan kondisi melihat',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Lihat contoh QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Keselamatan QR dan Komplain Terbaik Praktek',
      paragraphs: ['Sebuah kode QR yang dirancang dengan indah yang gagal memindai lebih buruk daripada tidak berguna - itu membuat pelanggan frustasi, merusak persepsi merek, dan membuang semua sumber daya yang diinvestasikan dalam penciptaan dan distribusi. Panduan ini mencakup faktor teknis dan praktis yang menentukan apakah kode QR akan memindai dapat diandalkan, dan bagaimana menggunakan fitur keselamatan ANQR untuk menangkap masalah potensial sebelum mereka mencapai produksi.', 'Keandalan kode QR bukan biner. Sebuah kode mungkin memindai sempurna pada telepon flagship tapi gagal pada perangkat anggaran. Mungkin bekerja dalam pencahayaan ideal tapi perjuangan di restoran redup atau sinar matahari terang. Memahami faktor-faktor yang mempengaruhi scannability membantu Anda membuat pertukaran informasi antara gaya visual dan keandalan dunia.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Spektrum keandalan menampilkan kode QR mulai dari yang sangat dapat disransikan ke mudah dibaca',
          caption: 'Spektrum scanebility: dari kode antipeluru untuk styling yang mendorong batas daya tahan',
        },
      ],
    },
    {
      heading: 'Memahami Galat Tingkat Koreksi',
      paragraphs: ['Kode QR termasuk built-in redudancy yang memungkinkan mereka untuk dibaca bahkan ketika sebagian rusak atau dikaburkan. Tingkat koreksi kesalahan - L (7%), M (15%), Q (25%), atau H (30%) - menentukan berapa banyak kode yang hilang ketika masih memecahkan kode dengan benar. Koreksi kesalahan yang lebih tinggi menciptakan kode yang lebih besar tapi menyediakan batas keamanan untuk overlay, pencetakan ketidaksempurnaan, dan kerusakan lingkungan.', 'Untuk kode dengan overlay gambar, tingkat koreksi kesalahan H adalah penting - overlay fisik obscures bagian dari kode, dan Anda perlu bahwa 30% redundansi untuk mempertahankan ketergantungan. Untuk kode yang bersih, tidak bergaya di lingkungan yang terkendali, tingkat M sering cukup. Tingkat L harus dipesan untuk situasi di mana ukuran kode secara kritis dibatasi dan Anda dapat menjamin kondisi murni.'],
    },
    {
      heading: 'Zona Tenang Kritis',
      paragraphs: ['Zona tenang adalah margin kosong mengelilingi setiap kode QR. Pemindai menggunakan batas ini untuk mengidentifikasi di mana kode dimulai dan berakhir. Standar ISO menspesifikasikan zona minimum tenang dari empat modul (empat kali lebar persegi terkecil dalam kode). Melanggar ruang ini - dengan elemen desain, tepi trim, atau konten yang berdekatan - adalah salah satu penyebab yang paling umum dari kegagalan scan.', 'Penegak zona tenang ANQR membantu mempertahankan jarak kritis ini, tetapi Anda juga harus memastikan itu diawetkan dalam desain akhir Anda. Ketika menyerahkan karya seni QR, secara eksplisit menentukan persyaratan zona tenang. Ketika menempatkan kode dalam tata letak, verifikasi bahwa tidak ada elemen mengganggu ke ruang ini. Beberapa milimeter ruang jelas dapat berarti perbedaan antara pemindaian dapat diandalkan dan pelanggan frustrasi.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Diagram menunjukkan jarak zona tenang yang benar melawan pelanggaran umum yang menyebabkan kegagalan pemindaian',
          caption: 'Ketentuan zona tenang: margin tak terlihat yang menentukan keberhasilan pemindaian',
        },
      ],
    },
    {
      heading: 'Kontras dan Keselamatan Warna',
      paragraphs: ['Pemindai QR mendeteksi pola modul cahaya dan gelap. Gaya apapun yang mengurangi kontras ini - latar depan cahaya, latar belakang gelap, efek gradien, atau lapisan opasitas rendah - membuat kode lebih sulit untuk dibaca. ANQR menghitung rasio kontras dan memperingatkan ketika pilihan warna Anda mendekati tingkat berbahaya, tetapi arbiternya yang terakhir selalu nyata-dunia pengujian.', 'Persepsi warna bervariasi dengan kondisi pencahayaan. Kombinasi warna yang muncul sangat kontras pada monitor Anda mungkin sulit untuk membedakan di bawah pencahayaan pijar hangat atau tabung fluorescent dingin. Jika kode Anda akan digunakan dalam berbagai kondisi pencahayaan, tes di bawah beberapa sumber cahaya, dan mempertimbangkan lebih konservatif rasio kontras sebagai margin keselamatan.'],
    },
    {
      heading: 'Ukuran Modul dan Jarak Penglihatan',
      paragraphs: ['Ukuran fisik modul individu menentukan jarak maksimum dari mana kode dapat dipindai. Modul kecil berarti kode yang lebih kecil tapi membutuhkan jarak pemindaian lebih dekat. Aturan umum adalah bahwa setiap modul harus setidaknya 0.5mm di jarak pemindaian yang dimaksudkan, skala proporsional untuk jarak yang lebih besar. Sebuah kode di papan iklan membutuhkan modul yang jauh lebih besar daripada kode pada kartu nama.', 'Ketika menghitung ukuran modul, pertimbangkan skenario terburuk: pelanggan dengan telepon yang lebih tua, pencahayaan yang tidak sempurna, pemindaian pada jarak maksimum mungkin. Desain untuk pengguna ini, dan orang lain akan memiliki pengalaman yang lebih baik. Ukuran ANQR \'s rekomendasi faktor dalam variabel ini dunia real untuk menyarankan dimensi yang sesuai untuk penggunaan yang dimaksudkan.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Sebuah bagan ukuran modul yang berhubungan, dimensi cetak, dan jarak pemindaian maksimum efektif',
          caption: 'Memindai pemandu jarak: ukuran modul sesuai dengan persyaratan penyebaran Anda',
        },
      ],
    },
    {
      heading: 'Menggunakan Mode Keselamatan ANQR',
      paragraphs: ['Mode Keselamatan ANQR menyediakan umpan balik real-time pada kemampuan pemindaian. Ini memonitor rasio kontras, keabsahan zona tenang, intensitas overlay, dan faktor-faktor lain yang mempengaruhi scrannability. Ketika parameter apapun mendekati tingkat berisiko, Anda akan melihat peringatan dengan panduan spesifik tentang bagaimana untuk meningkatkan daya tahan. Untuk pengungkapan profesional dimana kegagalan adalah mahal, Tetap aktifkan Mode Keselamatan sepanjang proses desain.', 'Mode Keselamatan juga termasuk fitur verifikasi pemindaian yang mencoba untuk memecahkan kode yang dihasilkan dan laporan sukses atau gagal. Sementara verifikasi in- app ini tidak dapat meniru setiap kondisi dunia-nyata, itu menangkap banyak masalah umum sebelum Anda berinvestasi dalam mencetak atau distribusi. Perlakukan verifikasi sukses sebagai bar minimum, bukan jaminan - dunia pengujian tetap penting.'],
    },
    {
      heading: 'Real- Protokol Pengujian Dunia',
      paragraphs: ['Tidak ada jumlah perangkat lunak verifikasi menggantikan pengujian fisik. Cetak kode Anda pada ukuran yang dimaksudkan pada bahan perwakilan. Mengujinya di lingkungan penyebaran yang sebenarnya dengan kondisi pencahayaan yang cocok dengan penggunaan nyata. Pindai dengan beberapa perangkat - tidak hanya telepon flagship Anda, tetapi perangkat Android anggaran, iPhone tua, dan perangkat tertentu penonton Anda umumnya menggunakan.', 'Dokumen pengujian Anda secara sistematis. Rekam perangkat mana yang diuji, dalam kondisi apa, dengan hasil apa. Jika Anda menyebarkan kode dalam skala, membangun kriteria penerimaan: mungkin tingkat keberhasilan 95% di seluruh kolam alat Anda, atau pemindaian sukses dalam waktu 2 detik pada semua perangkat yang diuji. Standar ini membantu membuat keputusan pergi / tidak-pergi objektif daripada berharap yang terbaik.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Sebuah checklist pengujian komprehensif meliputi perangkat, kondisi, dan kriteria penerimaan',
          caption: 'Protokol pengujian QR: verifikasi sistematis sebelum komitmen produksi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Buka generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Lihat contoh QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Buka Panduan Pengguna penuh', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Buka galeri', type: 'gallery' },
  ],
};
