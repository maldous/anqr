import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Belajarlah dengan ANQR',
  description: 'Panduan praktikal yang mengutamakan perniagaan untuk menukar kod QR menjadi aset pemasaran sebenar - bukan hanya petak berfungsi. Ketahui cara untuk menaik taraf kod tempat jualan lama, membuat papan tanda QR pembayaran yang mematuhi, menyediakan eksport sedia cetak, menggunakan animasi dengan selamat pada paparan digital dan berkongsi konfigurasi terkunci dalam merentas pasukan berbilang bahasa menggunakan pautan ANQR ("sauh").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: '♪ Buka generatornya ♪', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: '[ Gambar di hlm', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Kampanye QR Terwujud yang Improvisasi',
      paragraphs: ['Sebagian besar bisnis memiliki kode QR yang tersebar di seluruh operasi mereka - pada menu, konter berdiri, kemasan, dan bahan promosi. Kode-kode ini diciptakan bertahun-tahun yang lalu dengan generator dasar, menghasilkan kotak hitam-putih generik yang gagal menginspirasi keyakinan atau cocok dengan identitas merek Anda. Panduan komprehensif ini membimbing Anda melalui pendekatan sistematis untuk mengaudit, meningkatkan, dan mengoptimalkan infrastruktur QR Anda yang sudah ada tanpa mengganggu perjalanan pelanggan yang telah Anda tetapkan.', 'Keuntungan strategis dari meningkatkan daripada mengganti kode QR Anda terletak dalam menjaga kesinambungan. Pelanggan Anda telah belajar untuk mengharapkan tujuan tertentu ketika mereka memindai kode Anda. Dengan menjaga URL yang dikodekan identik sementara secara dramatis meningkatkan presentasi visual, keandalan pemindaian, dan keselarasan merek, Anda membuat transisi tak terbatas yang meningkatkan kepercayaan tanpa memerlukan perubahan pada infrastruktur digital atau pelacakan analitik Anda.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Perbandingan sisi-sisi menunjukkan kode QR yang pudar dan generik di sebelah pengkodean versi bermerek modern URL yang sama',
          caption: 'Sebelum dan sesudah: URL destinasi yang sama berubah dari kode generik tertanggal menjadi aset bermerek profesional',
        },
      ],
    },
    {
      heading: 'Mengapa Kode QR Legasi Berdasar',
      paragraphs: ['Kode-kode QR yang dibuat selama fase adopsi awal - khususnya selama 2020-2021 ketika bisnis bergegas untuk menerapkan solusi tanpa kontak - sering menderita beberapa masalah kritis. Pengaturan pembetulan kesalahan yang rendah hati membuat mereka rapuh ketika dicetak di permukaan bertekstur atau dilihat di bawah pencahayaan yang menantang. Zona diam yang tidak mencukupi menyebabkan kegagalan pemindaian ketika kode ditempatkan di dekat elemen visual lainnya. styling generik gagal untuk mengkomunikasikan legitimasi merek, menyebabkan keraguan dan pengurangan tingkat scan.', 'Di luar keterbatasan teknis, kode warisan sering kali mewakili peluang branding yang tidak terjawab. Setiap kode QR adalah titik sentuh dengan pelanggan Anda - saat di mana mereka terlibat aktif dan bersedia untuk mengambil tindakan. Kode bergaya profesional yang cocok dengan warna merek Anda, termasuk margin keselamatan yang sesuai, dan fitur elemen branded opsional mengubah utilitas ini menjadi aset pemasaran yang memperkuat identitas Anda pada setiap interaksi.'],
    },
    {
      heading: 'Mengkonduksi Audit Kode QR',
      paragraphs: ['Mulailah proyek upgrade Anda dengan membuat inventaris komprehensif setiap kode QR yang saat ini dikerahkan di seluruh bisnis Anda. Dokumenkan lokasi fisik, tujuan yang dikodekan, kondisi saat ini dari bahan tercetak, dan lingkungan pemindaian yang khas termasuk kondisi pencahayaan dan sudut pandang. Uji setiap kode dengan beberapa perangkat - ponsel pintar yang lebih tua dan perangkat anggaran sering mengungkapkan masalah keandalan bahwa masker telepon premium.', 'Ketertarikan khusus untuk kode di lokasi pengambilan-tinggi: titik pembayaran, area check-in, dan tampilan promosi di mana kegagalan pemindaian berdampak langsung pendapatan atau pengalaman pelanggan. Ini harus diprioritaskan untuk peningkatan segera. Kode-kode catatan yang muncul dalam fotografi atau konten video, karena ini akan membutuhkan koordinasi dengan tim pemasaran Anda untuk memperbarui aset visual.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Antarmuka daftar cek yang menampilkan kategori audit QR: lokasi, kondisi, keandalan pemindaian, dan peringkat prioritas',
          caption: 'Templat audit Sistematika Sistematika QR untuk mendokumentasikan dan memprioritaskan calon penataran Anda',
        },
      ],
    },
    {
      heading: 'Strategi Penataran Aman yang Aman',
      paragraphs: ['Kardinal aturan tatar QR adalah pelestarian tujuan. Ekstrak URL yang tepat dari setiap kode yang ada dan codekan secara identik dalam versi baru Anda. Ini memastikan semua analitik yang ada, mengarahkan logika, dan harapan pelanggan tetap utuh. Fleksibilitas jika Anda membutuhkan destinasi untuk pembaruan di masa depan, ini adalah waktu yang ideal untuk memperkenalkan URL pendek bermerek atau layanan pengalihan - tetapi menerapkan ini sebagai proyek terpisah untuk menghindari perubahan kompaun.', 'Untuk penataran visual, terapkan peningkatan pada lapisan: pertama memastikan keandalan teknis (acpropriate error koreksi dan zona tenang), kemudian tambahkan styling merek (warna, bentuk modul), dan akhirnya mempertimbangkan peningkatan opsional (centre overlays, frames). Setiap lapisan harus divalidasi melalui pengujian sebelum melanjutkan. Mode Keselamatan ANQR membantu menegakkan prioritas ini dengan peringatan ketika pilihan yang mencekik mungkin membahayakan scannabilitas.'],
    },
    {
      heading: 'Memerlukan Identitas Merek Tanpa Menyatukan Keandalan',
      paragraphs: ['Efektif QR mencap keseimbangan dampak visual terhadap keandalan scan. Mulai dengan warna: ganti latar belakang hitam baku dengan warna merek primer Anda, memastikan kontras yang cukup terhadap latar belakang Anda. Untuk kebanyakan merek, warna gelap pada latar belakang cahaya bekerja terbaik. Hindari kombinasi rendah-kontras, gradien yang mengurangi kejelasan tepi, atau warna yang muncul serupa di bawah kondisi pencahayaan umum.', 'Kustomisasi bentuk module menawarkan kesempatan merek lain dengan dampak keandalan minimal. Modul yang dibulatkan membuat penampilan yang lebih lembut dan lebih mudah didekati sambil mempertahankan scannabilitas yang sangat baik. Modul gaya Dot bekerja dengan baik untuk modern, merek maju teknologi. Modul yang terhubung sesuai dengan industri atau identitas perusahaan. gaya apa pun yang Anda pilih, mempertahankan konsistensi di seluruh QR penyebaran Anda untuk pengenalan merek instan.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Diagram roda warna bagi para pemain diagram roda warna menunjukkan kombinasi warna QR yang optimal dengan penunjuk rasio kontras',
          caption: 'Panduan pemilihan warna merek nird menunjukkan kombinasi kontras tinggi yang mempertahankan keandalan pemindaian',
        },
      ],
    },
    {
      heading: 'Protokol Pengujian dan Validasi',
      paragraphs: ['Jangan pernah meng-upgrade kode QR tanpa pengujian ketat. Mecetak bukti fisik pada ukuran yang tepat dan pada bahan yang sama dengan penyebaran akhir Anda. Tes di lokasi sebenarnya di mana kode akan hidup, pada waktu yang berbeda hari untuk memperhitungkan variasi pencahayaan. paling tidak menggunakan tiga perangkat berbeda: telepon flagship saat ini, perangkat jarak menengah, dan telepon pintar yang lebih tua atau anggaran.', 'Waktu pemindaian rekor dan tingkat keberhasilan untuk setiap tes. Kode yang dioptimalkan dengan baik harus dipindai dalam waktu 1-2 detik pada perangkat yang cukup modern. Jika Anda melihat penundaan atau kegagalan yang konsisten, kurangi intensitas styling - buang atau kecilkan overlay, tingkatkan ukuran zona yang tenang, atau tukar ke tingkat koreksi kesalahan yang lebih tinggi. Keandalan dialirkan selalu mengambil alih kecanggihan visual.'],
    },
    {
      heading: 'Andika Mengunci Konfigurasi Anda untuk Konsistensi',
      paragraphs: ['Setelah Anda telah divalidasi konfigurasi optimal, melestarikannya menggunakan link yang dapat dibagikan ANQR. Ini menciptakan catatan permanen dari setiap pengaturan yang digunakan untuk menghasilkan kode - warna, gaya modul yang disetujui, koreksi kesalahan, pengukuran, dan overlay apapun yang disetujui. Kongsi link ini dengan tim desain Anda, vendor cetak, dan siapa pun yang mungkin perlu untuk mereproduksi kode di masa depan.', 'Kunci konfigurasi ini mencegah degradasi bertahap yang melanda banyak penyebaran QR. Tanpa itu, anggota staf menciptakan ulang kode dari screenshot, desainer membangun kembali pengaturan dari memori, dan vendor cetak membuat penyesuaian \'berguna\'. Setiap variasi memperkenalkan isu potensial. Dengan link konfigurasi terkunci, setiap reproduksi identik dengan tesmu, asli yang disetujui.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Gambar rajah yang menunjukkan hanyut konfigurasi: tangkapan skrin yang membawa kepada rekreasi yang membawa kepada variasi, berbanding pautan sumber-kebenaran tunggal',
          caption: 'Melarang perubahan konfigurasi dengan menetapkan sumber otoritatif tunggal untuk semua reproduksi QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: '♪ Buka generatornya ♪',
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
      heading: 'Kode QR untuk Bayaran Retail',
      paragraphs: ['Kode-kode QR payment yury QR beroperasi di lingkungan yang paling menuntut di ritel: momen transaksi. Para pelanggan sudah siap membayar, sering kali dengan antrian yang membentuk di belakang mereka, dan setiap detik penundaan menimbulkan gesekan. Namun momen tekanan tinggi ini juga real estate prima untuk penguatan merek. Pedoman ini menjelaskan bagaimana membuat kode QR pembayaran yang memindai langsung pada aplikasi perbankan saat masih menyajikan penampilan bermerek profesional yang membangun kepercayaan pelanggan.', 'Prinsip dasar untuk pembayaran kode QR adalah keandalan atas estetika. Sebuah kode yang dirancang dengan indah yang gagal memindai aplikasi perbankan pelanggan akan dikenakan biaya yang jauh lebih dalam transaksi yang ditinggalkan dan frustrasi pelanggan daripada desain konservatif yang pernah bisa. Mulailah dengan kepatuhan, tambahkan keandalan, kemudian lapisan cermat dalam mencap hanya di mana ia tidak berkompromi dengan fungsi utama.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Sebuah tampilan counter ritel menunjukkan kode QR pembayaran yang dipindai oleh telepon pintar dengan aplikasi perbankan',
          caption: 'Kode QR payment [P] harus bekerja secara instan dengan perbankan dan aplikasi dompet di bawah kondisi kontra dunia nyata',
        },
      ],
    },
    {
      heading: 'Standar QR Pembayaran [P]',
      paragraphs: ['Kode-kode payton QR biasanya mengikuti standar regional yang mendikte format muatan. Di Singapura, PayNow QR menggunakan pemformatan spesifik. Di India, kode UPI mengikuti standar link dalam BharatQR atau UPI. Pembayaran SPPA Eropa berjangka menggunakan kode EPC QR. Setiap standard yang ada untuk memastikan aplikasi perbankan dapat langsung mengenali dan memproses informasi pembayaran. Pembohongan dari standar - bahkan sedikit - bahkan dapat menyebabkan aplikasi pembayaran menolak kode yang dibaca oleh pemindai kamera generik tanpa masalah.', 'XAQR mencakup template untuk standar pembayaran utama yang secara otomatis memformat rincian pedagang Anda ke muatan yang sesuai. Other selalu menggunakan template ini daripada secara manual mengkonstruksi string pembayaran, seperti halnya kesalahan pemformatan minor sekalipun dapat menyebabkan kegagalan transaksi. Jika standar pembayaran wilayah Anda tidak tersedia sebagai templat, berkonsultasi dengan dokumentasi teknis penyedia pembayaran Anda untuk persyaratan pemformatan yang tepat.'],
    },
    {
      heading: 'Pengubahsaizan dan Penempatan untuk Paparan Penanggulangan',
      paragraphs: ['Kod QR kaunter teratas menghadapi cabaran fizikal yang unik. Pelanggan mengimbas pada paras lengan, selalunya pada sudut, kadang-kadang melalui pelindung bersin atau kotak paparan. Pencahayaan atas kepala menghasilkan bintik silau. Kod ini bersaing dengan kekacauan kaunter lain untuk perhatian dan pandangan yang jelas. Saiz QR pembayaran anda dengan murah hati - sekurang-kurangnya 4-5cm disyorkan untuk kebanyakan aplikasi kaunter, ditingkatkan jika kod terletak di belakang kaca atau di kawasan yang bercahaya malap.', 'Posisi posisi penting sebanyak ukuran. Letakkan kode di mana pelanggan dapat dengan nyaman memegang telepon mereka tanpa menghalangi antrian atau mencapai canggung. Sudutkan tampilan ke arah pelanggan daripada meletakkannya datar. Jika memungkinkan, gunakan laminasi matte atau bahan tampilan non-reflektif untuk meminimalkan silau dari pencahayaan overhead. Tes posisi akhir di waktu yang berbeda hari untuk menangkap masalah pencahayaan.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Diagram diagram menunjukkan tinggi dan sudut penempatan QR yang optimal untuk konfigurasi penghitung yang berbeda',
          caption: 'Panduan Counter penempatan: tinggi, sudut, dan jarak optimal untuk pemindaian pembayaran yang dapat diandalkan',
        },
      ],
    },
    {
      heading: 'Konservatif Branding untuk Kode Pembayaran',
      paragraphs: ['Aplikasi pembayaran gaji gaji lebih sedikit memaafkan daripada pengimbas kamera generik. Banyak aplikasi perbankan menggunakan algoritma pembacaan QR yang lebih tua dan sederhana yang dioptimalkan untuk kecepatan daripada fleksibilitas. Ini berarti styling yang bekerja sempurna dengan kamera telepon mungkin gagal dengan aplikasi pembayaran tertentu. Tetap branding konservatif: gunakan warna merek Anda untuk latar depan jika mempertahankan kontras yang kuat, tetapi hindari gradien, overlay berat, atau elemen dekoratif yang dapat mengganggu pengenalan.', 'Jika Anda ingin logo pusat atau overlay, tetap sangat kecil - tidak lebih dari 10-15% dari daerah QR - dan tes secara ekstensif dengan setiap aplikasi pembayaran yang mungkin digunakan pelanggan Anda. Banyak bisnis bisnis yang tidak menggunakan kode pembayaran secara khusus, mempertahankan bahwa Styling untuk pemasaran kode QR di mana persyaratan keandalan kurang stringent. Tugas kode pembayaran adalah memproses transaksi, bukan mengesankan secara visual.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Perbandingan yang menunjukkan tingkat branding yang dapat diterima vs berisiko untuk kode QR pembayaran',
          caption: 'Pembayaran yuran QR branding spectrum: dari styling konservatif aman ke pendekatan dekoratif berisiko',
        },
      ],
    },
    {
      heading: 'Pertimbangan Bahan dan Cetak',
      paragraphs: ['Penampakan fisik material secara signifikan berdampak pada keandalan scan. Glossy laminasi glass mencerminkan overhead lampu langsung ke kamera pelanggan. Bahan-bahan yang tertekstur dapat mendistorsi tepi modul. Pencetakan yang murah dapat mengaburkan perincian yang baik. Untuk kode QR pembayaran, berinvestasi dalam kualitas: menggunakan laminasi matte atau satin, memastikan pencetakan resolusi tinggi, dan mengganti tampilan sebelum mereka menunjukkan pakaian. Kau harus melakukan transaksi.', 'Dia menganggap keawetan dan kehandalan tampilan. Pertunjukan Counter Counter mendapat sentuhan, bergerak, percikan, dan kadang-kadang mengetuk. Anda akan mengubah sistem tampilan Anda sehingga sisipan QR dapat dengan mudah diganti tanpa mengganti seluruh stand. Simpan cetakan cadangan siap, dihasilkan dari link konfigurasi terkunci Anda, sehingga kode yang dikenakan dapat ditukar segera.'],
    },
    {
      heading: 'Pengujian dengan Pembayaran Nyata Apps',
      paragraphs: ['Pemindai kamera generik akan memecahkan kode QR yang diformat dengan cukup jelas. Aplikasi pembayaran gaji lebih memilih. Sebelum mengerahkan kode QR pembayaran apapun, ujilah dengan setiap aplikasi pembayaran yang mungkin digunakan pelangganmu. Di lingkungan multi-pembayaran, ini mungkin berarti pengujian dengan beberapa aplikasi perbankan, dompet digital, dan platform pembayaran. Dokumen dokumen yang telah anda uji dan versi mereka - aplikasi pembayaran sering diperbarui, dan sebuah pembaruan dapat mengubah perilaku pemindaian.', 'Uji coba di bawah kondisi realistis: tampilan yang sebenarnya, pencahayaan yang sebenarnya, jarak pemindaian yang sebenarnya. Kode yang memindai langsung di meja Anda mungkin berjuang di meja pada pukul 5 sore ketika matahari sore menciptakan silau. Tes dengan smartphone termurah dan paling murah yang dapat Anda temukan - jika bekerja dengan baik pada perangkat anggaran, itu akan bekerja pada segalanya. Bendera apapun waktu scan lebih dari 2 detik untuk penyelidikan dan desain ulang potensial.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Daftar cek pengujian uji coba menunjukkan berbagai aplikasi pembayaran, jenis perangkat, dan kondisi lingkungan untuk memverifikasi',
          caption: 'Pembayaran koprehensif QR pengujian matriks meliputi aplikasi, perangkat, dan faktor lingkungan',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '♪ Buka generatornya ♪',
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
      heading: 'Kode QR Sedia Cetak: SVG vs PNG',
      paragraphs: ['Perbedaan antara kode QR yang memindai dengan sempurna dan salah satu yang gagal sering turun ke bagaimana itu diekspor dan ditangani dalam alur kerja cetak. Panduan ini menjelaskan perbedaan kritis antara format vektor (SVG) dan raster (PNG), ketika menggunakan masing-masing, dan bagaimana menyerahkan karya seni QR kepada desainer dan vendor cetak dengan cara yang menjaga keandalan pemindaian dari kartu bisnis ke signage ukuran papan reklame.', 'Produksi cetakan molford memperkenalkan variabel yang tidak ada di layar: penyebaran tinta, tekstur substrat, proses finishing, dan efek kumulatif dari konversi berkas berganda. Kode QR yang terlihat sempurna dalam perangkat lunak desain Anda dapat muncul dari pencetak dengan ujung yang dilembutkan, kontras yang berkurang, atau modul yang menyimpang secara subtly. Memahami pemilihan format dan praktik terbaik alur kerja mencegah kegagalan diam ini.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Pandangan yang diperbesar membandingkan modul QR vektor dengan tepi yang tepat berbanding modul raster yang menunjukkan artefak pixel',
          caption: 'Vektor VV vs raster pada skala cetak: perbedaan presisi yang menentukan keandalan pemindaian',
        },
      ],
    },
    {
      heading: 'Vektor Mengapa (SVG) Penting untuk Dicetak',
      paragraphs: ['Berkas SVG menjelaskan kode QR sebagai bentuk matematika daripada kisi piksel. Ini berarti kode dapat diskalakan ke ukuran apapun - dari label 1cm ke spanduk 10 meter - tanpa kehilangan ketajaman tepi. Mesin pencetak printer RIP (Raster Image Processor) merender vektor pada resolusi asli perangkat output, memastikan setiap ujung modul sama renyah seperti yang memungkinkan perangkat keras. Tidak ada interpolasi, tidak ada artefak anti-aliasing, tidak ada akumulasi kabur dari beberapa operasi resize.', 'Di luar scalability, file SVG lebih kuat dalam alur kerja profesional. Mereka bertahan dengan round-trips melalui perangkat lunak desain tanpa degradasi. Mereka dapat dikoreksi dengan warna tanpa pencairan kembali. Mereka dimasukkan secara bersih ke dalam file PDF untuk keluaran siap tekan. Untuk aplikasi cetak mana pun yang penting kualitas, SVG harus menjadi format ekspor default Anda.'],
    },
    {
      heading: 'PNG Diterima',
      paragraphs: ['PNG menjadi diperlukan ketika alur kerja atau platform tujuan Anda tidak mendukung format vektor. Beberapa platform web, sistem CMS signage, dan alur kerja pencetakan warisan membutuhkan gambar raster. Pada kasus-kasus ini, PNG dapat bekerja dengan baik - tetapi hanya jika Anda mengikuti aturan yang ketat: ekspor pada ukuran fisik akhir dan resolusi, tidak pernah skala atas setelah ekspor, dan menghindari setiap kompresi lossy atau konversi format.', 'Hukum kritis untuk PNG adalah untuk menghitung dimensi piksel yang diperlukan sebelum mengekspor. Jika QR Anda akan mencetak pada 5cm dan printer Anda beroperasi pada 300 DPI, Anda perlu sekitar 590 piksel. Ekspor pada ukuran ini atau lebih besar, kemudian dikecilkan jika perlu - tidak pernah naik. Kemasukkan informasi ini dalam nama berkas atau data meta Anda sehingga pengguna di masa depan tidak secara tidak sengaja menyalahgunakan ekspor spesifik ukuran.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Antarmuka kalkulator yang menunjukkan hubungan antara ukuran fisik, DPI, dan dimensi piksel yang diperlukan',
          caption: 'Kalkulator resolusi cetakan: menentukan dimensi piksel minimum untuk ukuran output target Anda',
        },
      ],
    },
    {
      heading: 'Opsi Ekspor ANQR Dijelaskan',
      paragraphs: ['ANQR menawarkan beberapa mode ekspor SVG untuk sesuai dengan alur kerja yang berbeda. Mode Vektor Trude Vektor menghasilkan output berbasis jalur murni yang ideal untuk alat cetak dan desain profesional. Ketika Anda menambahkan overlay raster atau efek tertentu, ANQR dapat membenamkan ini saat mempertahankan modul vektor, atau Anda dapat mengekspor versi sepenuhnya terrasterisasi pada resolusi yang telah ditentukan. Memahami opsi ini membantu Anda memilih ekspor yang tepat untuk setiap kasus penggunaan.', 'Untuk ekspor PNG, ANQR memungkinkan anda menentukan dimensi yang tepat dan termasuk pilihan untuk latar belakang transparan. Pengaturan DPI membantu Anda menghitung ukuran yang sesuai untuk cetakan, meskipun ingatlah bahwa DPI adalah data meta - yang penting untuk cetak adalah memiliki piksel yang cukup untuk ukuran fisik Anda. Ketika ragu-ragu, ekspor lebih besar dari yang Anda pikir Anda butuhkan; skala bawah menjaga kualitas sementara skala naik menghancurkannya.'],
    },
    {
      heading: 'Pilot Mempersiapkan Berkas untuk Dilepas',
      paragraphs: ['Wiski saat melewati karya seni QR ke desainer atau vendor cetak, termasuk spesifikasi yang jelas: ukuran fisik yang dimaksudkan, persyaratan zona tenang minimum, dan pertimbangan ruang warna apapun. Untuk aplikasi kritis, menyediakan baik master SVG dan cadangan PNG resolusi tinggi, jelas dilabel dengan penggunaan mereka yang dimaksudkan. Termasuk link konfigurasi ANQR Anda sehingga kode dapat diregenerasi jika diperlukan.', 'Antisipasi kesalahan umum dalam proses handoff. Secara eksplisit menyatakan bahwa QR tidak boleh diskalakan, diputar, miring, atau memiliki efek yang diterapkan. Nyatakan bahwa zona tenang harus tetap jelas - tidak ada tanda panen, tanda pendaftaran, atau elemen desain yang mengganggu. Jika QR akan diletakkan pada latar belakang berwarna atau fotografi, memberikan versi dengan bentuk backing legap untuk memastikan kontras yang memadai.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Diagram paket berkas yang menunjukkan master SVG, backup PNG, dokumen spesifikasi, dan link konfigurasi',
          caption: 'Paket QR handoff profesional: segala sesuatu yang dibutuhkan perancang atau vendor cetak untuk reproduksi akurat',
        },
      ],
    },
    {
      heading: 'Kepastian Cetak Sidik Siar',
      paragraphs: ['Jangan pernah menyetujui pencetakan tanpa memindai bukti fisik. Meminta bukti yang dicetak pada substrat yang sebenarnya dengan finishing yang sebenarnya akan digunakan dalam produksi. Memindai bukti di bawah kondisi pencahayaan yang mirip dengan di mana potongan akhir akan ditampilkan. Uji coba dengan berbagai perangkat, termasuk ponsel pintar yang lebih tua yang mungkin bergelut dengan kualitas marjinal.', 'Jika bukti memindai perlahan atau tidak konsisten, selidiki sebelum menyetujui. Isu-isu yang umum termasuk tidak cukup kontras pada substrat berwarna, pelanggaran zona tenang dari pemangkasan, penyebaran tinta melunakkan pinggiran modul, atau laminasi menciptakan silau. Semua ini bisa dialamatkan sebelum melakukan pencarian cetak penuh tapi hanya jika kau menangkap mereka di tahap pembuktian.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Daftar cek ulasan bukti dengan hasil tes pemindaian, pengukuran kontras, dan tandatangan persetujuan',
          caption: 'Uji kerja verifikasi pembuktian uji coba uji coba uji sistematis sebelum melakukan produksi kuantitas',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: '♪ Buka generatornya ♪',
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
      heading: 'Menciptakan Kode QR Animasi',
      paragraphs: ['Kode-kode anime Animasi QR menggabungkan fungsionalitas kode QR standar dengan gerakan pengecatan mata yang secara dramatis meningkatkan tingkat keterlibatan. Dalam signage digital, media sosial, dan tampilan interaktif, animasi mengubah utilitas statis menjadi elemen visual menarik yang menarik mata dan mengundang interaksi. Panduan ini mencakup prinsip, teknik, dan kekangan praktis menciptakan kode QR animasi yang dapat dipindai sambil menyampaikan dampak visual.', 'Tantangan mendasar kode QR animasi adalah menyeimbangkan kepentingan visual terhadap keandalan scan. Setiap frame harus dapat dipindai secara individual - pemindai mungkin menangkap kode pada setiap titik dalam siklus animasi. Kekangan ini membentuk setiap keputusan desain: yang elemen dapat bergerak, berapa banyak mereka dapat berubah, dan apa yang harus tetap stabil sepanjang animasi.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Tampilan signage digital yang menampilkan kode QR animasi menangkap perhatian penonton di ruang publik',
          caption: 'Kode QR Animasi anime dalam tanda digital: gerakan yang menarik perhatian dan mendorong pemindaian',
        },
      ],
    },
    {
      heading: 'Bagaimana Animasi Mempengaruhi Pengimbasan',
      paragraphs: ['Pemindai QR WHAV bekerja dengan menangkap satu frame dan menganalisis pola modul cahaya dan gelap. Agar kode animasi berfungsi, setiap frame harus memuat pola QR yang lengkap dan valid. Ini mengeluarkan animasi yang mengubah struktur kode, melarutkan modul, atau mengubah pola kontras secara signifikan. Modul pembawa data - pola yang tampaknya acak di tengah - harus tetap stabil secara visual di seluruh.', 'Animasi aman pendekatan modifikasi elemen yang tidak membawa data: latar belakang, warna, bingkai dekoratif, dan elemen overlay. Pola - mencari komponen struktural (sudut persegi besar), pola waktu (garis berselang-seling), dan pola perataan (garis yang lebih kecil dalam kode yang lebih besar) - harus mempertahankan posisi dan proporsinya. Kerja-kerja di dalam kekangan ini masih memungkinkan untuk mengejutkan dinamis dan terlibat animasi.'],
    },
    {
      heading: 'Teknik Animasi Wajar Itu',
      paragraphs: ['Pesepedaan warna wourdon menganimasikan warna latar depan dan latar belakang melalui palet sambil mempertahankan kontras yang cukup pada setiap langkah. Ini menciptakan efek menarik perhatian yang bersemangat dengan risiko pemindaian minimal - selama kontras tidak pernah turun di bawah tingkat yang dapat dibaca. Preset siklus warna ANQR dirancang untuk menjaga scannabilitas sepanjang siklus.', 'Animated overlays place bergerak citra di balik pola QR semi transparan. Kode tersebut tetap stabil sementara latar belakang animasi - mungkin sebuah video looping, elemen merek animasi, atau grafik gerakan abstrak. Teknik ini membutuhkan manajemen intensitas yang cermat untuk mencegah latar belakang dari luar biasanya pola QR, tetapi menciptakan hasil yang paling mencolok secara visual.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Diagram yang menampilkan struktur berlapis dari QR animasi: lapisan kode stabil di atas lapisan latar belakang animasi',
          caption: 'Prinsip pelapisan animasi: pola QR tetap konstan sementara elemen latar belakang animasi di bawah',
        },
      ],
    },
    {
      heading: 'Parameter Animasi berkonfigurasi',
      paragraphs: ['Laju frame falak mempengaruhi kelancaran visual maupun ukuran berkas. Untuk kebanyakan aplikasi, 10-15 frame per detik menyediakan mosi yang terlihat halus tanpa ukuran file yang berlebihan. Kadar bingkai yang lebih tinggi dari tungkai ini menawarkan penurunan kembalian visual sementara secara signifikan meningkatkan ukuran berkas. Pertimbangkan konteks pengiriman Anda - sebuah tanda digital yang besar dapat menangani berkas yang lebih besar daripada penempatan iklan mobile.', 'Perilaku belacu menentukan bagaimana siklus animasi. Gelung tanpa tepi menghasilkan gerakan yang terus menerus ideal untuk signage dan tampilan ambient. Loop Ping-pong (forward-then-reverse) bekerja dengan baik untuk animasi sederhana. Untuk denyut perhatian-pengumpulan, perhatikan animasi dengan periode hold - stillness yang diselingi oleh gerakan yang menarik mata tanpa kelelahan gerak konstan.'],
    },
    {
      heading: 'Menciptakan Pelapis Animasi',
      paragraphs: ['Ketika menggunakan gambar animasi (GIF, WebP animasi, atau video) sebagai overlay, ANQR ekstrak bingkai dan komposit mereka dengan kode QR Anda. Pengaturan keamatan overlay kontrol berapa banyak animasi menunjukkan melalui - nilai yang lebih rendah prioritise scannabilitas sementara nilai yang lebih tinggi mendukung dampak visual. Uji keamatanmu yang dipilih melintasi beberapa frame untuk memastikan scannabilitas yang konsisten.', 'Kualitas material sumber secara signifikan berdampak pada hasil. Ungkapkan tindihan dengan subjek yang jelas dan kontras yang baik. Hindari animasi sumber dengan kilatan cepat atau perubahan kecerahan ekstrem yang dapat menciptakan bingkai berkontras rendah sesekali. Kitar animasi lengkap sebelum mengekspor untuk menangkap bingkai problematik yang mungkin gagal dipindai.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Pandangan frame-by-frame dari overlay animasi menunjukkan tingkat kontras dipertahankan di seluruh urutan',
          caption: 'Analisis kerangka morfika: memverifikasi scannabilitas konsisten di seluruh siklus animasi',
        },
      ],
    },
    {
      heading: 'Perumpamaan Ekspor dan Pengiriman',
      paragraphs: ['GIF tetap menjadi format animasi yang paling banyak didukung, bermain secara otomatis dalam kebanyakan konteks tanpa memerlukan dukungan pemain video. Namun, GIF memiliki batas palet 256 warna. Untuk animasi berwarna-kritis, pertimbangkan WebP animasi di mana didukung, atau jatuh kembali ke format video untuk kualitas tertinggi. Ekspor GIF ANQR termasuk pilihan dithering untuk memaksimalkan kualitas dalam keterbatasan palet.', 'Masalah ukuran file untuk pengiriman. Sistem signage digital, klien email, dan platform sosial sering memberlakukan batasan ukuran. Jika animasi Anda melebihi batas ini, kurangi jumlah bingkai, dimensi, atau kedalaman warna. Kadang-kadang pemilahan suatu animasi kompleks menjadi loop yang lebih pendek mencapai hasil yang lebih baik daripada kompresi agresif yang menurunkan setiap frame.'],
    },
    {
      heading: 'Metode Animasi Animasi QR',
      paragraphs: ['Kode animasi tesdosis memerlukan pemindaian di beberapa titik dalam siklus animasi. Jangan hanya memindai sekali dan menganggap sukses - scan berulang kali, pada saat yang berbeda, untuk memverifikasi bahwa setiap frame dapat dibaca. Kecerdasan khususnya terhadap bingkai pada ekstrem siklus warna atau puncak intensitas overlay di mana kontras mungkin terendah.', 'Tes pada perangkat keras tampilan sebenarnya di mana mungkin. Kalibrasi warna monitor, sudut pandang, dan pencahayaan ambien semua mempengaruhi bagaimana animasi muncul dan memindai. Sebuah animasi cerah yang dapat memindai dengan sempurna monitor Anda dapat keluar pada layar luar atau menjadi tidak terbaca pada sudut pandang oblique.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Uji coba matriks menunjukkan tingkat keberhasilan pemindaian melalui bingkai, perangkat, dan kondisi tampilan yang berbeda',
          caption: 'Protokol uji coba QR Animasi: verifikasi sistematis melintasi frame, perangkat, dan kondisi tampilan',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: '♪ Buka generatornya ♪',
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
      heading: 'Praktek Terbaik Keselamatan dan Kepatuhan QR',
      paragraphs: ['Kode QR yang dirancang dengan indah yang gagal dipindai lebih buruk daripada tidak berguna - itu membuat frustrasi pelanggan, merusak persepsi merek, dan membuang setiap sumber yang diinvestasikan dalam pembuatan dan distribusinya. Panduan ini meliputi faktor-faktor teknis dan praktis yang menentukan apakah kode QR akan memindai secara layak, dan bagaimana menggunakan fitur keselamatan ANQR untuk menangkap masalah potensial sebelum mereka mencapai produksi.', 'Keandalan kode QR bukan biner. Kode code yang mungkin dipindai dengan sempurna pada telepon kapal tapi gagal pada perangkat anggaran. Ini mungkin bekerja dalam pencahayaan yang ideal tetapi berjuang di restoran redup atau sinar matahari terang. Memahami faktor-faktor yang mempengaruhi kepekaan pemindaian membantu Anda membuat perdagangan informasi antara gaya visual dan keandalan dunia nyata.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Spektrum keandalan menunjukkan kode QR mulai dari yang sangat dapat dipindai hingga terbaca secara marginal',
          caption: 'Spektrum scannabilitas: dari kode anti peluru ke styling yang mendorong batas keandalan',
        },
      ],
    },
    {
      heading: 'Memahami Tingkat Pembetulan Kesalahan',
      paragraphs: ['Kode QR kode QR termasuk built-in redundancy yang memungkinkan mereka untuk dibaca bahkan ketika sebagian rusak atau dikaburkan. Tingkat pembetulan kesalahan - L (7%), M (15%), Q (25%), atau H (30%) - menentukan berapa banyak kode dapat hilang saat masih mendekoding dengan benar. Pembetulan kesalahan yang lebih tinggi membuat kode yang lebih besar tetapi menyediakan margin keselamatan untuk overlay, mencetak ketidaksempurnaan, dan kerusakan lingkungan.', 'Untuk kode kode dengan overlay gambar, tingkat pembetulan kesalahan Kau perlu 30% redundansi untuk mempertahankan keandalan. Untuk kode bersih dan tidak bergaya di lingkungan terkendali, tingkat M sering cukup. Aras Kau bisa menjamin kondisi murni.'],
    },
    {
      heading: 'Critical Quiet Zone',
      paragraphs: ['Zona diam adalah margin kosong mengelilingi setiap kode QR. Scanners menggunakan batas ini untuk mengidentifikasi di mana kode dimulai dan berakhir. Standar ISO Veadon menentukan zona tenang minimum dari empat modul (empat kali lebar kuadrat terkecil dalam kode). Violating ruang ini - dengan elemen desain, tepi trim, atau konten yang berdekatan - adalah salah satu penyebab paling umum dari kegagalan pemindaian.', 'Penegasan zona tenang ANQR membantu menjaga jarak kritis ini, tetapi Anda juga harus memastikan itu dipertahankan dalam desain akhir Anda. Ketika menyerahkan karya seni QR, secara eksplisit nyatakan persyaratan zona yang tenang. Saat menempatkan kode dalam tata letak, pastikan tak ada elemen yang masuk ke ruang ini. Ada beberapa milimeter ruang yang jelas yang dapat berarti perbedaan antara pemindaian yang dapat diandalkan dan pelanggan yang frustrasi.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Sebuah diagram yang menunjukkan diagram yang menunjukkan lingkungan zona tenang yang benar melawan pelanggaran umum yang menyebabkan kegagalan pemindaian',
          caption: 'Persyaratan zona diam: margin halimunan yang menentukan keberhasilan pemindaian',
        },
      ],
    },
    {
      heading: 'Kontras dan Keselamatan Warna',
      paragraphs: ['Pengimbas QR availa mendeteksi pola modul cahaya dan gelap. Setiap styling yang mengurangi warna latar depan yang terang dan kontras ini, latar belakang gelap, efek gradien, atau overlay low-opacity - membuat kode lebih sulit dibaca. ANQR menghitung rasio kontras dan memperingatkan ketika pilihan warna Anda mendekati tingkat berbahaya, tetapi arbiter akhir selalu pengujian dunia nyata.', 'Persepsi warna bervariasi dengan kondisi pencahayaan. Sebuah kombinasi warna yang muncul berkontras tinggi pada monitor Anda mungkin menjadi sulit untuk membedakan di bawah pencahayaan kandesensi hangat atau tabung fluoresen dingin. Jika kode Anda akan dikerahkan dalam kondisi pencahayaan yang bervariasi, uji di bawah beberapa sumber cahaya, dan mempertimbangkan rasio kontras yang lebih konservatif sebagai margin keselamatan.'],
    },
    {
      heading: 'Ruang dan Jarak Melihat Modul Modul Modul Modul',
      paragraphs: ['Ukuran fisik physical modul individu menentukan jarak maksimum dari mana sebuah kode dapat dipindai. Modul yang lebih kecil berarti kode yang lebih kecil tetapi membutuhkan jarak pemindaian yang lebih dekat. Aturan umum adalah bahwa setiap modul harus setidaknya 0.5mm pada jarak pemindaian yang dimaksudkan, menskalakan secara proporsional untuk jarak yang lebih besar. Kode pada papan reklame membutuhkan modul yang jauh lebih besar dari kode pada kartu nama.', 'Menghitung ukuran modul, mempertimbangkan skenario terburuk: pelanggan dengan telepon yang lebih tua, dalam pencahayaan yang tidak sempurna, memindai pada jarak maksimum kemungkinan. Desain untuk pengguna ini, dan orang lain akan memiliki pengalaman yang lebih baik. Faktor rekomendasi ukuran dari ANQR dalam variabel dunia nyata ini untuk menyarankan dimensi yang sesuai untuk tujuan penggunaan Anda.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Bagan bagan yang berhubungan dengan ukuran modul, dimensi cetak, dan jarak pemindaian efektif maksimum',
          caption: 'Panduan jarak pengimbasan: mencocokkan ukuran modul sesuai dengan persyaratan penyebaran Anda',
        },
      ],
    },
    {
      heading: 'Menggunakan Mod Keselamatan ANQR',
      paragraphs: ['Mode Keselamatan ANQR menyediakan umpan balik waktu-nyata pada keandalan pemindaian. Hal ini memonitor rasio kontras, kepatuhan zona tenang, intensitas overlay, dan faktor lain yang mempengaruhi scannabilitas. Ketika parameter apapun mendekati tingkat berisiko, Anda akan melihat peringatan dengan panduan spesifik tentang bagaimana meningkatkan keandalan. Untuk penyebaran profesional di mana kegagalan adalah mahal, menjaga Safety Mode aktif sepanjang proses desain.', 'Mode Keselamatan Kemanduan juga mencakup fitur verifikasi pemindaian yang mencoba untuk mendekode kode yang dihasilkan dan melaporkan keberhasilan atau kegagalan. Sedangkan verifikasi in-app ini tidak dapat meniru setiap kondisi dunia nyata, ia menangkap banyak isu umum sebelum anda berinvestasi dalam percetakan atau distribusi. Perlakukan verifikasi yang berhasil sebagai bar minimum, bukan jaminan - pengujian dunia nyata tetap penting.'],
    },
    {
      heading: 'Protokol Pengujian Real-Dunia',
      paragraphs: ['Tidak ada jumlah verifikasi perangkat lunak menggantikan pengujian fisik. Cetak kode Anda pada ukuran yang dimaksudkan pada materi perwakilan. Dia mengujinya di lingkungan penyebaran yang sebenarnya dengan kondisi pencahayaan yang cocok dengan penggunaan nyata. Memindai dengan beberapa perangkat - bukan hanya telepon flagship Anda, tetapi perangkat Android anggaran, iPhone yang lebih tua, dan perangkat spesifik yang biasa digunakan oleh penonton Anda.', 'Dokumen pengujianmu secara sistematis. Rekaman perangkat mana yang diuji, dalam kondisi apa, dengan hasil apa. Jika Anda mengerahkan kode pada skala, menetapkan kriteria penerimaan: mungkin tingkat keberhasilan 95% melintasi kolam uji perangkat Anda, atau berhasil memindai dalam waktu 2 detik pada semua perangkat yang diuji. Standar-standar ini membantu membuat keputusan go/no-go obyektif daripada berharap yang terbaik.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Daftar cek pengujian komprehensif yang meliputi perangkat, kondisi, dan kriteria penerimaan',
          caption: 'Protokol pengujian pengerahan QR UGAS QR: verifikasi sistematis sebelum komitmen produksi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: '♪ Buka generatornya ♪',
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
    { href: '/guide?lang=${lang}', label: '[ Gambar di hlm', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Open galeri', type: 'gallery' },
  ],
};
