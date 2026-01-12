import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Panduan Pengguna ANQR',
  description: 'Panduan lengkap untuk menggunakan ANQR untuk menciptakan kode QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: '♪ Buka generatornya ♪', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Artikel - artikel yang telah diulas', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Mulai Dimulai',
      paragraphs: [
        'ANCAR adalah generator kode QR dengan pendekatan klien pertama. Secara default, kode QR dihasilkan secara lokal di peramban Anda - tidak diperlukan akun dan data Anda tetap pribadi. Untuk pembenaman profesional, Anda juga dapat menggunakan API sisi-server.',
        'Antarmuka antarmuka memiliki tiga tingkat antarmuka: Dasar, Lanjutan, dan Profesional. Pilih level Anda menggunakan tab di header. Setiap tingkatan membuka fitur tambahan sambil menjaga antarmuka berfokus pada apa yang Anda butuhkan.',
      ],
      bullets: [
        'Dasar: Penciptaan kode QR sederhana dengan isi teks/URL polos dan overlay gambar.',
        'Lanjutan: Opsi pengkodean QR, gaya rendering, animasi, format output, tipe konten lanjutan, dan kustomisasi overlay.',
        'Professional: Tanda Air, metadata, berbagi, analisis keselamatan, kode QR pembayaran, dan fitur perusahaan.',
      ],
      links: [{ href: '/?lang=${lang}', label: '♪ Buka generatornya ♪', type: 'generator' }],
    },
    {
      heading: 'Fanta Cepat',
      paragraphs: ['Untuk membuat kode QR pertama Anda:'],
      bullets: [
        '1. ^ a b c d e f g h i j k l m n Pilih jenis konten (URL, teks, WiFi, dll) dari dropdown Content Type.',
        'Kampung 2. Masukkan data Anda di bidang yang disediakan.',
        'Kampung 3. Secara opsional, warna, gaya, dan menambahkan gambar overlay.',
        'KMC Click Export untuk mengunduh kode QR anda sebagai PNG, GIF, WebP, atau SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Fitur - Fitur Dasar Kebendaan',
      paragraphs: [
        'Level Basic menyediakan antarmuka streamline untuk menciptakan kode QR dengan konten muatan dan overlay gambar. Ini adalah cara paling sederhana untuk memulai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Jenis Kandungan (Basik)',
      paragraphs: [
        'Teks Plain: Kodkan teks apapun hingga batas kapasitas kode QR. Ideologi untuk pesan singkat, kode, atau pengenal.',
        'URL: Mengkodekan alamat web. Kode QR akan membuka URL ketika dipindai. Protokol http:// dan https://.',
      ],
    },
    {
      heading: 'Imej Atasan (Basik)',
      paragraphs: [
        'Muat naik gambar (JPG, PNG, GIF, WebP) untuk berbaur dengan kode QR anda. Fitur overlay dasar faks termasuk:',
      ],
      bullets: [
        'Muat dari berkas: Pilih gambar dari perangkat Anda.',
        'Muat dari URL: Masukkan URL gambar (harus mengizinkan CORS).',
        'Logo Pusat Bahasa: Ada gambar di tengah, mengandalkan pembetulan kesalahan.',
        'Campuran Alfa sederhana dengan pola QR.',
        'Keintensitan: Mengendalikan seberapa kuat overlay mempengaruhi kode QR (0-100%).',
        'Moda Warna: Warna Penuh, Skala Kelabu, atau Hitam & Putih.',
        'Pola Pencari Beragam: Terus mempertahankan pola sudut tidak dimodifikasi untuk pemindaian yang dapat diandalkan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Fitur - Fitur Keunggulan Keunggulan',
      paragraphs: [
        'Level Advanced membuka kunci opsi pengkodean QR, penerapan gaya, animasi, format output, tipe konten lanjutan, dan kustomisasi overlay lanjutan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pengaturan Pengekodan QR',
      paragraphs: [
        'Version Version: Kode QR datang dalam versi 1-40, dengan versi yang lebih tinggi memegang lebih banyak data tetapi menjadi lebih besar. Nama Anda bisa memilih versi terkecil yang sesuai dengan isi Anda.',
        'Pembetulan Kesalahan: Pemanah Menentukan berapa banyak kerusakan yang dapat diderita oleh sebuah kode QR sementara scannable yang tersisa.',
      ],
      bullets: [
        'Pembetulan kesalahan 7% - ukuran terkecil, paling tidak redundansi.',
        'Koreksi - pilihan yang seimbang.',
        'Koreksi kesalahan 25% - baik untuk kode cetak.',
        '(Tinggi): pembetulan kesalahan 30% - terbaik untuk kode dengan overlay atau dalam kondisi kasar.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zona Senyap (Margin)',
      paragraphs: [
        'Zona sepi adalah ruang putih di sekitar kode QR. Scanners membutuhkan margin ini untuk mendeteksi di mana kode dimulai. Standar merekomendasikan minimal 4 modul. Redukasi di bawah 4 bisa menyebabkan masalah pemindaian.',
      ],
    },
    {
      heading: 'Gaya Modul',
      paragraphs: [
        'Modul adalah petak individu yang membentuk kode QR. ANQR menawarkan lima gaya:',
      ],
      bullets: [
        'Square: Penampilan QR klasik dengan sudut tajam.',
        'Dibulatkan: Sudut lembut untuk tampilan ramah.',
        'Modulular untuk estetika modern.',
        'Berlian: 45° diputar persegi untuk pola yang khas.',
        'Terhubung: Modul bergabung ketika bersebelahan, menciptakan bentuk organik.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Gaya Corak Pencari',
      paragraphs: [
        'Pola cari-cari adalah tiga petak besar di sudut QR yang membantu scanner orient kode. Gaya yang tersedia:',
      ],
      bullets: [
        'Lapangan persegi standar.',
        'Dibulatkan: Sudut lembut yang cocok dengan gaya modul membulat.',
        'Bulatan: Pola finder melingkar untuk kode gaya titik.',
      ],
    },
    {
      heading: 'Pola Penjajaran & Timing Jajaran',
      paragraphs: [
        'Pola alignment dia muncul dalam kode QR yang lebih besar (versi 2+) untuk membantu memperbaiki distorsi. Pola waktu siang adalah garis-garis berselang yang menghubungkan pola finder.',
      ],
      bullets: [
        'Gaya Jajaran: Match Finder, Square, Rounded, atau Circle.',
        'Gaya Waktu: Match Module, Solid, atau Dashed.',
      ],
    },
    {
      heading: 'Warna',
      paragraphs: [
        'Latar depan: Warna modul QRR. Kodok Hitam (#00000) adalah standar tetapi warna gelap apapun bekerja.',
        'Latar Belakang: Warna latar belakang. Kodok putih (#ffffff) adalah standar. Pastikan cukup kontras dengan latar depan.',
        'Latar Belakang Transparan XML: Keluarkan latar belakang seluruhnya untuk digunakan pada permukaan berwarna. Pastikan permukaannya cukup kontras.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ukuran Modul Modul Module & Gap',
      paragraphs: [
        'Ukuran Modul: Mengendalikan seberapa besar setiap modul dirender dalam piksel. Nilai yang lebih besar membuat kode yang lebih besar, lebih mudah di-scan.',
        'Peta Modul: Tambah ruang antar modul sebagai persentase. Celah kecil (5-15%) dapat meningkatkan scanability dalam beberapa kondisi tetapi kesenjangan berlebihan mengurangi keandalan.',
      ],
    },
    {
      heading: 'Seting Keluaran',
      paragraphs: ['Pilih format ekspor berdasarkan use case.'],
      bullets: [
        'PNG: Format raster tak hilang, ideal untuk kebanyakan kegunaan. Terbaik untuk cetak dan digital.',
        'WebP: Format modern dengan ukuran berkas yang lebih kecil. Bagus untuk penggunaan web.',
        'GIF: Diperlukan untuk kode QR animasi. Sodium mendukung transparansi.',
        'SVG: Format Vektor yang skalanya tak terbatas. Terbaik untuk cetakan besar atau ketika Anda perlu untuk mengedit kode.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Dimensi Output',
      paragraphs: [
        'Lebar/Tinggi: Set ukuran output dalam piksel. Untuk cetakan, dihitung berdasarkan DPI (misalnya, 300 DPI pada 1 inci = 300px). Ukuran yang lebih besar dipandai lebih dapat diandalkan pada jarak jauh.',
      ],
    },
    {
      heading: 'Pengaturan Animasi (Lanjutan)',
      paragraphs: ['Perilaku kode animasi QR:'],
      bullets: [
        'Kecepatan: Laju frame animasi dalam milidetik.',
        'Gelung: Animasi continuous atau single-play.',
        'Bounce: Arah animasi Ping-pong.',
        'Mulai dari frame tertentu.',
        'Frames Maksima: Batas total frame dalam animasi.',
        'Langkah Bingkai: Lewatkan bingkai untuk animasi lebih cepat.',
        'None, Crossfade, atau Morph antara frame.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Jenis Kandungan Ule (Lanjutan)',
      paragraphs: ['Level lanjutan membuka format muatan tambahan:'],
      bullets: [
        'Nomor Telepon (tel:): Membuat sambungan telepon yang dapat dihubungi.',
        'Email (mailto:): Klien email terbuka dengan subjek dan tubuh opsional.',
        'SMS pra-isi ke nomor telepon.',
        'kartu kontak penuh dengan nama, organisasi, telepon, email, alamat.',
        'MeCard: Format kontak Compact yang populer di Jepang.',
        'BizCard: Format kartu bisnis Legacy.',
        'Lokasi Geo: Koordinat GPS yang terbuka di peta.',
        'WiFi: Bukti kelayakan rangkaian untuk sambungan automatik (SSID, kata laluan, jenis keselamatan).',
        'Peristiwa Kalendar Calendar: format iCalendar dengan judul, lokasi, tanggal/waktu.',
        'Korban peristiwa: Tautan ke halaman pendaftaran peristiwa.',
        'Langganan Calendar: Berlangganan ke feed ICS/WebCal.',
        'URL Berkas/Dokumen: Sambungan langsung ke berkas yang dapat diunduh.',
        'Tautan Penyimpanan Awan Ukiran: Tautan ke Google Drive, Dropbox, OneDrive, dll.',
        'Profil Sosial: Pautan ke LinkedIn, Twitter, Instagram, dsb.',
        'Link Pesanan: WhatsApp, Telegram, Signal deep link.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Fitur - Fitur Lapisan Berkelanjutan',
      paragraphs: ['Kemampuan overlay tambahan:'],
      bullets: [
        'Potong: Mengaktifkan pemotongan untuk memilih wilayah persegi dari gambar Anda.',
        'Halfttone: Pola titik gaya cetak klasik berdasarkan kecerahan gambar.',
        'Ditambatkan: Pembilasan diffusi untuk reproduksi rinci.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mod Campuran Lapisan (Lanjutan)',
      paragraphs: ['Modus campuran tambahan dalam tingkat Lanjutan:'],
      bullets: [
        'Subpiksel: Setiap modul dibagi menjadi subpiksel untuk perincian yang lebih tinggi.',
        'Suara Biru: Kau menggunakan suara biru untuk pola bebas artefak.',
        'Efek berbasis tile menjaga struktur gambar.',
        'Isian Peta Peta: Gambar di antara modul.',
        'Kecerahan: Variasi ukuran modul berdasarkan kecerahan gambar.',
        'Dua warna untuk kontras yang mencolok.',
      ],
    },
    {
      heading: 'Keintensitan Tinta',
      paragraphs: [
        'Kekontrolan acap seberapa kuat overlay mempengaruhi kode QR (0-100%). Nilai yang lebih tinggi menunjukkan lebih banyak detail gambar tetapi mungkin mengurangi scannabilitas. Mulai sekitar 70% dan menyesuaikan berdasarkan pengujian.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Mod Warna',
      paragraphs: ['Bagaimana gambar overlay diproses:'],
      bullets: [
        'Warna Penuh: Melestarikan warna asli gambar.',
        'Skala kelabu: Konversi ke nada hitam dan putih.',
        'Hitam Hitam & Putih: Konversi biner kontras tinggi.',
      ],
    },
    {
      heading: 'Jaga Pola Pencari yang Baik',
      paragraphs: [
        'Ketika diaktifkan, membuat tiga pola pencari sudut tidak dimodifikasi oleh overlay. Disarankan untuk pemindaian yang dapat diandalkan.',
      ],
    },
    {
      heading: 'Praproses Imej',
      paragraphs: [
        'Gunakan filter ke gambar overlay sebelum membaur. Penyesuaian ini dapat meningkatkan bagaimana gambar muncul dalam kode QR akhir.',
      ],
      bullets: [
        'Kecerahan (-100 hingga +100): Cerahkan atau gelapkan imej.',
        'Kontras (-100 hingga +100): Menambah atau mengurangkan julat tonal.',
        'Gamma (0.2 hingga 3.0): Penyesuaian kecerahan non-linear. Nilai di bawah 1 nada tengah ringan, di atas 1 gelap mereka.',
        'Ketepuan (-100 hingga +100): Keamatan warna. -100 adalah skala kelabu, +100 terlalu jenuh.',
        'Rotan Rona Rona Rona (0-360°): Anjakkan semua warna di roda warna.',
        'Kaburkan (0-20px): Gambar halus detail.',
        'Tajamkan ketajam (0-100%): Perbesar tepi dan rinciannya.',
        'Memposterkan (0-16 tingkat): Kurangi kadar warna untuk efek poster.',
        'Ambang (0-955): Konversi ke biner hitam/putih pada titik terputus.',
        'Deteksi Edge: Algoritma Sobel atau Canny untuk hanya menampilkan tepi.',
        'Balikkan semua warna.',
      ],
    },
    {
      heading: 'Moda Muatan',
      paragraphs: ['Bagaimana gambar overlay cocok dengan area kode QR:'],
      bullets: [
        'Cover: Gambar memenuhi seluruh area, memotong jika diperlukan.',
        'Berisi: Seluruh gambar tampak, mungkin memiliki margin.',
        'Regangkan: Gambar mendistorsi untuk mengisi tepat.',
      ],
    },
    {
      heading: 'Pilihan Jelma Jelma',
      paragraphs: [
        'Putaran: Putar overlay dalam 90° toko.',
        'Flip X/Y: Cerminkan gambar secara mendatar atau vertikal.',
      ],
    },
    {
      heading: 'Algoritma Penggetaran',
      paragraphs: [
        'Darithering berkonversi gambar nada-berterusan ke pola yang kode QR dapat mewakili. Ada ketika menggunakan Dithered, Blue Noise, atau True Dither blended mode.',
      ],
      bullets: [
        'Diffusion Error: Gaya Floyd-Steinberg Klasik. Sebaran kesalahan kuantisasi ke piksel tetangga.',
        'Dipesan (Bayer): Guna matriks ambang untuk pola biasa.',
        'Clustered Dot: Simulasikan pencetakan setengah ton.',
        'Kluster Void & Penggetaran teroptimum.',
        'Kebisingan Biru: Pola tampak acak yang menyenangkan.',
        'Hingar Biru Ambang: Penggetaran ambang batas dengan tekstur suara biru.',
        'Noise Putih: Penggetaran ambang acak.',
        'Gaussian/Triangular Kebisingan dengan distribusi yang berbeda.',
        'Adonan Kebisingan Biru + Penyebaran Galat: Hibrid menggabungkan kedua teknik tersebut.',
        'Layar Blue Noise: Pola kebisingan biru seperti layar.',
        'Perseptual: Luminansi-berat untuk hasil visual yang lebih baik.',
        'Edge-Aware: Melestarikan tepi gambar saat dithering.',
        'Ambang Mudah Alih: Melewati ambang batas.',
        'Noise Biru Temporal: Untuk GIF animasi, bervariasi pola per bingkai.',
      ],
    },
    {
      heading: 'Kernel Penyebaran yang Dikejutkan',
      paragraphs: [
        'Ketika menggunakan Pembilasan Penyebaran Kesalahan, pilih bagaimana kesalahan didistribusikan:',
      ],
      bullets: [
        'Floyd-Steinberg: Penyebaran 4-neighbor klasik. Pilihan umum yang bagus.',
        'Jarvis-Judice-Ninke: 12-neighbor, lebih halus tapi lebih lambat.',
        '** Stucki: Mirip dengan JJN dengan berat yang berbeda.',
        'Burkes: Dipermudah JJN, lebih cepat.',
        'Keluarga kernel menyeimbangkan kualitas dan kecepatan.',
        'Difusi ringan, menjaga detail tapi bisa berbutir.',
      ],
    },
    {
      heading: 'Kekuatan Kumparan',
      paragraphs: [
        'Pengendalian hewan nirawak berapa banyak dithering diterapkan (0-100%). Nilai-nilai yang lebih rendah menjaga lebih banyak pola asli, nilai yang lebih tinggi menunjukkan lebih banyak detail gambar.',
      ],
    },
    {
      heading: 'Liputan Subpiksel',
      paragraphs: ['Saat menggunakan mode campuran Subpiksel:'],
      bullets: [
        'Maze grid: 2×2, 3×3, atau 4×4 subpiksel per modul. Lebih tinggi = lebih detail.',
        'Aturan Pusat: Strict memerlukan subpiksel pusat agar sesuai dengan modul. Pusat Halftone Halftone memungkinkan variasi.',
        'Warna Netral: Warna yang digunakan untuk subpiksel yang belum ditentukan.',
        'Penggelintir: Pola finder finder yang dirender (Solid atau Stylized).',
      ],
    },
    {
      heading: 'Pengaturan Halftone Halftone',
      paragraphs: ['Saat menggunakan mode campuran Halftone:'],
      bullets: [
        'Ukuran Sel XANZ: Per Modul atau grid N×N.',
        'Bentuk Dot: Lingkaran, Alun-alun, atau Garis.',
        'Kecerahan Curve: Linear, S-Curve, atau Gamma.',
      ],
    },
    {
      heading: '[ Gambar di hlm',
      paragraphs: [
        'Saat menggunakan mode campuran duotone, set warna Bayangan (daerah gelap) dan warna Tonjolan (daerah kanan).',
      ],
    },
    {
      heading: 'Tetapan Animasi GIF',
      paragraphs: ['Zaidon ketika menggunakan overlay GIF animasi:'],
      bullets: [
        'Use Frame delays: Hormati waktu GIF asli.',
        'FPS Maksimal: Laju bingkai batas (1-160 fps).',
        'Pengendalian Beban: Menghormati atau Sederhanakan metode pembuangan rangka.',
      ],
    },
    {
      heading: 'Pilihan Penerapan Tingkat Lanjut',
      paragraphs: ['Kontrol penerapan tambahan [N]:'],
      bullets: [
        'Tak ada, Inset, Stroke, atau Native Space gap styling.',
        'Radius Sudut: persentase sudut bulat untuk modul.',
        'Gradien: Tidak ada, Linear, Radial, atau Conic gradien pada modul.',
        'Gaya Eye Outer/Inner: Bergaya independen untuk menemukan cincin pola.',
        'Putaran Dot: Memputar modul berlian/titik.',
        'Skala Mata: Penyesuaian ukuran pola pencari.',
        'Frame Gaya: Tambah bingkai dekoratif (Rounded Frame, Stiker, Tag).',
        'Teks Bingkai Fon: Tambahkan teks seperti "Scan Me!" ke bingkai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pengekodan QR Lanjutan',
      paragraphs: ['Pengkodean QR Fine-tune:'],
      bullets: [
        'Moda Pengekodan: Auto, Numerik, Alfanumerik, Byte/UTF-8, atau Kanji.',
        'Pastikan setidaknya 4 marjin modul.',
        'Corak Topeng: Auto (optimum), atau pilih corak 0-7 secara manual untuk mengawal pengedaran modul. Corak yang berbeza mencipta penampilan visual yang berbeza sambil mengekod data yang sama.',
        'Pengekodan Aksara: ISO-8859-1 (Latin-1 lalai), UTF-8 (Unikod penuh termasuk emoji), atau Shift-JIS (Bahasa Jepun). Pilih berdasarkan keperluan aksara kandungan anda.',
      ],
    },
    {
      heading: 'Pilihan Keluaran Lanjutan',
      paragraphs: ['Seting eksport tambahan:'],
      bullets: [
        'Nama berkas: Nama nama sendiri untuk unduhan.',
        'GIF Ukuran Palet: 2-256 warna pada output GIF.',
        'GIF Kuantizer: Medium Cut, NeuQuent, atau Pengurangan warna Oktree.',
        'GIF Dithering: Off, Floyd- Steinberg, atau Ordered.',
        'GIF Warna Transparan XML: Ukrainian membuat warna menjadi transparan.',
        'SVG Vektor Sejati: Kelainan menggunakan jalur daripada raster tertanam.',
        'SVG Kepersisan Bentuk: Perataan peta pixel atau precise path rendering.',
        'SVG Terbenamkan Pelapis Raster: Sertakan overlay sebagai gambar tertanam.',
        'Latar Belakang Pengalihan: Paksa warna latar belakang spesifik dalam output.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pilihan Validasi Kepastian',
      paragraphs: ['Pemrosesan input:'],
      bullets: [
        'Validasi Masukan: Periksa format konten sebelum pengkodean.',
        'Bandung: Hapus ruang leading/trailing.',
        'Normalkan Newlines: Konversi semua akhir baris ke LF.',
        'Penjaga Panjang Maksimal: Peringatkan jika konten melebihi kapasitas QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Fitur Profesional Profesional',
      paragraphs: [
        'Level Professional menambahkan watermark, metadata, opsi berbagi, analisis keselamatan, kode QR pembayaran, dan fitur perusahaan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Watermark',
      paragraphs: ['Tambahkan watermarks ke kode QR Anda:'],
      bullets: [
        'Jenis: Teks, Gambar, atau Pola watermark.',
        'Posisi: Pusat, Sudut, Pinggir, Belakang, atau Zona Sunyi.',
        'Kelegapan: transparansi tanda air (0-100%).',
        'Moda Campuran: Normal, Multiply, Screen, atau Overlay Campuran.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Terbenam data meta dalam berkas tereksport:'],
      bullets: [
        'Gelar, Penulis, Hak Cipta, Lisensi, Bidang Keterangan.',
        'Masa Penciptaan Manusia: Masa Setem Masa Generasi Terbenam.',
        'Nilai Kunci Tersendiri: Tambahkan pasangan metadata yang sewenang-wenang.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Perkongsian',
      paragraphs: ['Kongsi konfigurasi kode QR anda:'],
      bullets: [
        'Liut Langsung Liut: Janakan URL yang dapat dibagikan dengan pengaturan anda saat ini.',
        'Terbenam HTML: Dapatkan kode embed untuk situs web.',
        'Parameter code= yang tidak diketahui akan diabaikan (bantuan)Pemeliharaan CS1: Bahasa yang tidak diketahui (link) Sertakan semua pengaturan dalam URL share.',
        'Catatan: Tindih imej dari berkas lokal tidak dapat dibagi melalui URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Analisis Keselamatan Biogasia',
      paragraphs: ['Pastikan kode QR tetap dapat dipindai:'],
      bullets: [
        'Moda Keselamatan: Persyaratan pemindaian mati, seimbang, atau Strict.',
        'Modul Ukuran: Ukuran piksel minimum per modul.',
        'Min Chiet Zona: Modul margin minimum.',
        'Koin Pencari Kunci/Pencari/Pekerja/Jajaran/Format/Versi: Lindungi unsur tertentu.',
        'Keintensitasan Tintaan Maksimum oleh ECC: Batas intensitas otomatis berdasarkan tingkat pembetulan kesalahan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Jenis Kandungan (Profesional)',
      paragraphs: ['Level profesionalis menambahkan pembayaran dan jenis konten perusahaan:'],
      bullets: [
        'Arondisemen EPC/SEPA (EU): Kode QR transfer bank Eropa dengan IBAN, BIC, jumlah, referensi.',
        '[pranala nonaktif] (India): Unified Payments Interface dengan VPA, nama pembayaran, jumlah.',
        '(Singapura): Transaksi cepat Singapura dengan UEN atau nomor seluler.',
        'PromptPay (Thailand): Sistem pembayaran nasional Thailand.',
        'Eliza PIX (Brazil): Pembayaran instan Brasil dengan kunci PIX.',
        'Crypto: Bitcoin, Ethereum, alamat pembayaran Litecoin dengan jumlah opsional.',
        'Business Marketing Campaign Link: URL dengan parameter full UTM (Marketing Tags) tracking.',
        'Link Singkat: Untuk penggunaan dengan shortener URL untuk kode QR dinamis/trackable.',
        'Digital Link GS1: Identifikasi produk dengan GTIN, serial, batch, expiry.',
        'App Deep Link: iOS/Android app deep link dengan skema custom.',
        'Format Kebiasaan: Data mentah tanpa pemformatan atau validasi.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Pembayaran Berkaitan Bahasa-Bahasa di Mode Lanjutan',
      paragraphs: [
        'Saat menggunakan mode Advanced, ANQR secara otomatis menunjukkan metode pembayaran yang relevan dengan bahasa pilihan Anda. Misalnya, pengguna Vietnam melihat VietQR, pengguna Thailand melihat PromptPay, dan pengguna bahasa India melihat UPI dan BharatQR. Metode pembayaran global (cryptocurrency, PayPal, Cash App) tersedia untuk semua bahasa. Mode profesionalis membuka semua standar pembayaran terlepas dari bahasa.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standar Pembayaran Euro',
      bullets: [
        'Arondisemen EPC/SEPA (EU): transfer bank QR Eropa kode QR mengikuti EPC QR Code Standard. Diagios Supports IBAN, BIC (opsional untuk domestik), jumlah dalam EUR, dan referensi pembayaran terstruktur atau tidak terstruktur. Terpakai di seluruh zona SEPA termasuk negara-negara UE ditambah Swiss, Norwegia, Islandia, Liechtenstein, Monako, dan San Marino.',
        'Bil QR Switzerland: Standard pembayaran Switzerland mengikut ENAM Garis Panduan Pelaksanaan. Menyokong CHF dan EUR, Rujukan QR (QRR), Rujukan Pemiutang (ISO 11649), alamat pemiutang/penghutang berstruktur dan maklumat bil. Diperlukan untuk invois Switzerland sejak 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standar Pembayaran yuran India',
      bullets: [
        '[pranala nonaktif] (India): Unified Payments Interface mengikuti Spesifikasi Linking Deep NPCI. Vinogue Supports VPA (Virtual Payment Address), nama gaji, jumlah dalam INR, catatan transaksi, ID referensi, kode kategori pedagang, dan mode transaksi.',
        'BharatQR (India): Standar QR Unified mendukung baik UPI maupun pembayaran berbasis kartu. Kocok UPI VPA dengan kartu PAN untuk keserasian maksimum. Waldane menyertakan nama pedagang, kota, MCC, rincian GST, dan nomor invoice/rujukan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standar Pembayaran Asia Tenggara',
      bullets: [
        '(Singapura): Sistem pembayaran cepat Singapura menggunakan spesifikasi EMVCo QR dengan profil SGQR. Sodium Mendukung UEN (register bisnis), nomor seluler, atau NRIC sebagai pengidentifikasi proksi. Termasuk jumlah bendera pengeditan dan tanggal kadaluarsa.',
        'PromptPay (Thailand): Sistem pembayaran negara Thai mengikut profil EMV Bank of Thailand. Menyokong nombor mudah alih, ID kebangsaan, ID cukai, ID e-dompet dan pembayaran bil dengan pelbagai medan rujukan.',
        'AVADIS QRIS (Indonesia): Kode Cepat Respons Kode Pos Indonesia Standar. Hak pembayaran nasional berbasis-EMV yang mendukung ID pedagang, NMID (National Merchant ID), klasifikasi kriteria pedagang, dan biaya kemudahan (fixed atau persentase).',
        'Aquino DuitNow (Malaysia): Sistem pembayaran instan Malaysia. Ogodia mendukung berbagai jenis proxy termasuk NRIC, mobile, paspor, ID tentara, dan nomor registrasi bisnis.',
        'VietQR (Vietnam): standar transfer antarbank Vietnam. Persyaratan BIN bank (naPAS identifikasi) dan nomor rekening. Arondisemen Mendukung kode layanan multiple untuk tipe transfer yang berbeda (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipina): Standard pembayaran QR Filipina untuk InstaPay dan PESONet. Menggunakan nombor akaun dengan pengenalan pedagang untuk transaksi P2M (orang-ke-peniaga).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standar Pembayaran Asia Timur',
      bullets: [
        'Taiwan QR standar pembayaran. Wadina mendukung identitas pedagang, ID pajak, dan jumlah TWD.',
        'HKQR/FPS Kode QR Sistem Pembayaran Cepat Hong Kong. Sodium mendukung FPS ID, nomor seluler, atau email sebagai pengidentifikasi pembayaran. Jumlah orang di HKD.',
        'JPQR (Jepang): Standar pembayaran kode QR terpadu Jepang. Uses uses stor ID untuk identifikasi pedagang dengan jumlah JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Standar Pembayaran Regional Terpaun Lainnya',
      bullets: [
        'Eliza PIX (Brazil): Sistem pembayaran instan Bank Sentral Brasil mengikuti spesifikasi BR Code. Athezia mendukung kunci PIX (CPF, CNPJ, email, telepon, atau kunci acak), nama/kota dagang, ID transaksi, dan jumlah BRL.',
        'AusPayNet/NPP PayID Sistem PayID Platform Pembayaran Baru Australia. Sodium Mendukung Bayaran Jenis-jenis ID (email, mobile, ABN, ID organisasi) atau nomor akun BSB + tradisional. Nama pedagang adalah opsional sebagai pembayaran melihat nama terdaftar dari NPP lookup.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pembayaran Kriptocurrency',
      bullets: [
        'Adonan Bitcoin/Litecoin (BIP-21): URI pembayaran cryptocurrency standar dengan alamat dompet, jumlah opsional, dan label. Cocok dengan semua dompet Bitcoin dan Litecoin.',
        'Jaringan Petir (BOLT11): \\"Faktur Pembayaran Jaringan Lightning\\". Tampalkan sebuah string invoice berkode BOLT11 untuk pembayaran Bitcoin instan dengan biaya minimal.',
        'Ethereum (EIP-681): URI permintaan transaksi Ethereum yang mendukung transfer ETH asli dan transfer token ERC-20. Transkulasi ID rantai untuk dukungan multi-jaringan (Mainnet, Polygon, BSC, Arbitrum, Optimisme, Avalanche), parameter gas, dan panggilan fungsi kontrak.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Layanan Tautan Pembayaran Bayaran',
      bullets: [
        'PayPal.Me: Sambungan pembayaran PayPal dengan nama pengguna dan jumlah pra-penuh pilihan. Penerima wasiat dapat membayar melalui saldo PayPal, kartu, atau rekening bank.',
        'Apl Tunai: Pautan pembayaran Apl Tunai menggunakan $cashtag dengan jumlah pilihan. Popular di Amerika Syarikat untuk pembayaran peer-to-peer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'EMV QR Generik',
      bullets: [
        'AlfaName & Generik: Buat Mod Penyajian EMV Biasa Kode QR untuk skema pembayaran tidak terdaftar secara khusus. Atur nama dagang, kota, kode negara (ISO 3166-1), kode mata uang (ISO 4217 numerik), MCC, pilihan biaya tip/konveniensi, dan bidang data tambahan. Berguna untuk pengujian atau integrasi adat.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Mode Pencampuran Overlay (Profesional)',
      paragraphs: ['Modus campuran tambahan pada tingkat Profesional:'],
      bullets: [
        'Pixelate: Efek overlay terpixel.',
        'Outline: Overlay deteksi pinggir hanya menampilkan kontur.',
        'Wave: Wavy distorsi efek.',
        'Ukuran subpiksel: Variabel subpiksel berdasarkan gambar.',
        'True Dither: Penggetaran lanjutan dengan pemilihan matriks terurut.',
        'Extreme Extreme: Visibilitas gambar maksimum, mungkin mempengaruhi pemindaian.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pengaturan Perlindungan Variabel',
      paragraphs: [
        'Kontrol berurat-halus yang mana elemen QR dilindungi dari pengubahsuaian overlay:',
      ],
      bullets: [
        'Pewaktuan Simpanan: Terus menjaga pola waktu tidak dimodifikasi.',
        'Jajaran kelestarian: Menjaga pola kesejajaran tidak dimodifikasi.',
        'Lindung Format Info: Modul informasi format Shield.',
        'Versi Protect Info: Modul informasi versi Shield.',
      ],
    },
    {
      heading: 'Mode ECC-Aware',
      paragraphs: [
        'Secara cerdas mendistribusikan intensitas overlay berdasarkan kapasitas pembetulan kesalahan. Sistem menganalisis modul mana yang dapat dimodifikasi sambil mempertahankan scannabilitas.',
      ],
      bullets: [
        'Peratusan kemampuan pembetulan kesalahan untuk menggunakan (0-10%).',
        'Anggaran yang lebih tinggi = lebih terlihat overlay tetapi lebih berisiko scannabilitas.',
        'Anggaran belanja lebih rendah = pemindaian yang lebih aman tetapi overlay kurang terlihat.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pilihan Penerapan Profesional Professional',
      paragraphs: ['Kontrol penerapan tahap lanjut:'],
      bullets: [
        'Crisp Edges: Polidonasi menggunakan pengambaran piksel untuk ujung modul tajam.',
        'Diatas, Round, atau keselarasan piksel Ceil.',
        'Moda Warna Per-Module: Solid, By Kecerahan, By Position, By Overlay, By Cluster.',
        'Palet Warna: Tentukan palet warna tersendiri untuk pewarnaan per-module.',
        'Penjaga Kontras: Pastikan rasio kontras minimum antara warna.',
        'Hal Rasio Kontras Infus: Persyaratan kontras ala WCAG (1:1 hingga 21:1).',
        'Border Ekstra Modul Perbatasan tambahan di luar zona tenang.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pilihan Keluaran Profesional Professional',
      paragraphs: ['Seting eksport produk:'],
      bullets: [
        'DPI: Tetapkan resolusi cetak (72-600 DPI). merekomendasikan cetakan sebanyak 300 DPI.',
        'Zon Diam-diam: Togol zona tenang dalam dimensi output.',
        'Ekspor sebagai Tambahan: Hasilkan PDF bersama format primer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pengaturan Animasi (Profesional)',
      paragraphs: ['Fitur animasi profesional tambahan:'],
      bullets: [
        'Dither Temporal: Off, Blue Noise, atau Flicker Safe per-frame dithering.',
        'Pola: Tidak ada, Denyut, Gelombang, Scanline, Shimmer, atau efek Drift.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Rujukan',
      paragraphs: [
        'API sisi-server untuk menghasilkan kode QR melalui parameter URL. Ini ideal untuk membenamkan kode QR dalam situs web, email, dokumen, atau alur kerja otomatis tanpa JavaScript sisi klien.',
        'URL Dasar: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' }],
    },
    {
      heading: 'Parameter Dasar-Farch',
      paragraphs: ['Parameter yang diperlukan dan umum (nama parameter tidak diterjemahkan):'],
      bullets: [
        'data kinosis (dibutuhkan): Kandungan untuk encode dalam kode QR. Karakter khusus URL-encode.',
        'ukuran fíax: Ukuran gambar dalam piksel (lalai: 400, maks: 2000). Digunakan jika w/h tidak dinyatakan.',
        'lebar dan tinggi keluaran dalam piksel. Parameter ukuran overrides.',
        'format Format keluaran - png, webp, atau gif (lalai: png).',
        'ec: Tingkat pembetulan kesalahan - L, M, Q, atau H (lalai: H).',
        'fg: Warna latar depan sebagai heksa tanpa # (lalai: 000).',
        'warna latar belakang sebagai heksa tanpa # (lalai: ffffff).',
        'lutsinar: Tetapkan 1 untuk latar belakang transparan.',
        'margin: Zona diam-diam zone dalam modul (baku: 4).',
      ],
    },
    {
      heading: 'Parameter Styling',
      paragraphs: ['Module dan pola styling:'],
      bullets: [
        'gaya: Gaya modul - persegi, bulat, titik, berlian, terhubung.',
        'pencari: Cari pola gaya - persegi, bulat, lingkaran.',
        'aligned: Alignment pola gaya - match_finder, persegi, bulat, lingkaran.',
        'waktu permainan: Gaya pola waktu - match_module, solid, putus.',
        'radius sudut: persentase radius 0-100.',
        'celah nonfax: Persentase kesenjangan module 0-50.',
        'xEVE: Mode Celah - tidak ada, inset, stroke, negatif_space.',
        'mata mata Outer, eyeInner: Gaya mata - persegi, bulat, lingkaran.',
        'skala mata mata mata: Persentase skala mata (lalai: 100).',
        'gradien tipe - tidak ada, linear, radial, conic.',
        'gradAngle: sudut gradien untuk gradien linear.',
        'gradien berhenti sebagai warna1.',
      ],
    },
    {
      heading: 'Parameter Hamparan Fesen',
      paragraphs: ['Pilihan overlay Image image (image overlay diambil sisi-server):'],
      bullets: [
        'img org: URL untuk overlay image (harus dapat diakses publik).',
        'mode: Moda overlay - tengah, halftone, campuran, kecerahan, mosaik, dithered, blue-noise, subpiksel.',
        'keamatan keamatan: Keamatan overlay 0-100 (lalai: 100).',
        'warna Mode: Mod warna overlay - warna, skala kelabu, bw.',
        'fit: Bagaimana overlay cocok - penutup, berisi, meregang.',
        'putaran overlay dalam derajat.',
        'set ke 1 untuk flip overlay.',
        'jaga Finders: Pola penelusuran kelestarian (baku: 1).',
        'jaga Memasak, menjaga Align: Tetapkan ke 1 untuk menjaga pola timing/alignment.',
      ],
    },
    {
      heading: 'Parameter Pra Pemprosesan Prafodin',
      paragraphs: ['Praprosesan gambar moldi diterapkan ke overlay:'],
      bullets: [
        'kecerahan: Penyesuaian -100 ke 100 (lalai: 0).',
        'beza jelas: Penyesuaian -100 ke 100 (lalai: 0).',
        'gama: Nilai 0,1 sampai 3 (baku: 1).',
        'ketepuan: Pelarasan Xavier -100 ke 100 (baku: 0).',
        'rona rona: Rona rotasi dalam derajat.',
        'kaburkan: Kabur dalam piksel.',
        'jumlah Sharpen 0-100.',
        'posterisasi tingkat.',
        'ambang: Ambang binary 0-255.',
        'tepi: Pengesanan pinggir - off, sobel, canny.',
        'invert: Tetapkan 1 ke warna terbalik.',
      ],
    },
    {
      heading: 'Parameter watermark',
      paragraphs: ['Tambahkan watermark untuk menghasilkan kode QR:'],
      bullets: [
        'wmEn: Tetapkan ke 1 untuk mengaktifkan watermark.',
        'perancis Jenis: Tipe watermark - teks, gambar, pola.',
        'bAHASA wmText: Teks Tanda Air (URL-encoded).',
        'uRL ke gambar watermark.',
        'wmPos: Posisi - tengah, sudut, tepi, belakang, quiet_zone.',
        'kelegapan: Kelegapan 0-100 (lalai: 50).',
        '- Modus campuran - normal, perkalian, layar, overlay.',
      ],
    },
    {
      heading: 'Parameter Animasi',
      paragraphs: ['Untuk keluaran animasi GIF (perlu format=gif):'],
      bullets: [
        '♪ anim ♪ Pola: pola animasi - tidak ada, pulsa, gelombang, scanline, berkilauan, hanyut, daur warna.',
        '♪ anim ♪ Frame: Jumlah frame 1-60 (baku: 24).',
        '♪ anim ♪ Kecepatan women: Jeda bingkai dalam milidetik 10-1000 (lalai: 100).',
        '♪ anim ♪ Benih Rawak untuk animasi.',
        'easing: Animation easing - linear, easy_in, easy_out, easy_in_out, bounce.',
      ],
    },
    {
      heading: 'Parameter Keluaran Fefter',
      paragraphs: ['Pilihan format output:'],
      bullets: [
        'kualitas kualitas: kualitas WebP 0-1 (baku: 0.9).',
        'webpQ: Kualitas WebP 0-100 (lalai: 90).',
        'gifColors: Ukuran palet GIF 2-256 (lalai: 256).',
        'dyanias dpi: Output DPI untuk PNG (lalai: 72).',
        'metaTitle, metaAuthor, metaCopy, meta Data metadata PNG.',
      ],
    },
    {
      heading: 'Contoh Contoh Contoh Penggunaan',
      paragraphs: [
        'Kode QR Basic:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Kode QR Styled zodiak dengan warna suai:',
        'https://anqr.link/api/qr?data=Halo&size=300&fg=1e40af&bg=ffffffff&style=rounded&radius=30',
        'Kode QR Ukraina dengan gambar overlay:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'Animasi Animasi Animasi:',
        'https://anqr.link/api/qr?data=Halo&format=gif&animCoattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' }],
    },
    {
      heading: 'Kode QR Pengemasan',
      paragraphs: [
        'Dalam mode Professional, fitur Share menghasilkan HTML dan URL yang dapat disematkan. Berikut adalah bagaimana pembenaman bekerja:',
      ],
      bullets: [
        'Kongsi Link: Membuat URL ke aplikasi ANQR dengan semua pengaturan Anda yang dikodekan sebagai parameter URL. Penerima wasiat dapat melihat dan memodifikasi kode QR.',
        'Image Embed Terbenam: Menjana tag <img> yang menunjuk ke API server. Kode QR dirender server-side dan berfungsi sebagai gambar.',
        'Terbenam Embed Markdown: Menciptakan sintaks gambar Markdown untuk berkas dokumentasi dan README.',
        'URL API Langsung Liar: URL API mentah untuk digunakan dalam aplikasi, skrip, atau integrasi lainnya.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Contoh HTML senam',
      paragraphs: [
        'Untuk membenamkan kode QR di website Anda:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        'Untuk responsif:',
        'Mazed <img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; tinggi: auto;  />',
        'Server cache menerima respon dengan header cache panjang, sehingga permintaan berulang untuk URL yang sama adalah cepat.',
      ],
    },
    {
      heading: 'Memformat URL Kongsi',
      paragraphs: [
        'Ketika Anda klik Kongsi dalam mode Profesional, ANQR mengkodekan pengaturan Anda saat ini ke dalam parameter URL. Formatnya adalah:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Parameter ini mencerminkan parameter API, sehingga Anda dapat mengubah URL berbagi ke URL API dengan mengubah jalur dasar dari / ke /api/qr dan menyesuaikan parameter w/h sesuai kebutuhan.',
        'Catatan: Gambar overlay yang diunggah dari berkas lokal tidak dapat dibagikan melalui URL - hanya overlay berbasis URL (img parameter) yang bekerja dalam link bersama dan panggilan API.',
      ],
    },
    {
      heading: 'Keterbatasan dan Penggunaan Kadar morfoid',
      paragraphs: [
        'API bebas digunakan untuk volume yang masuk akal. Untuk penggunaan volume tinggi atau aplikasi komersial yang memerlukan jaminan waktu, silakan hubungi kami.',
        'Tanggapan API termasuk header caching agresif. Untuk kinerja terbaik, respon cache pada akhir Anda atau menggunakan URL yang sama secara konsisten untuk kode QR yang identik.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Praktek Terbaik',
      paragraphs: ['Ikuti pedoman ini untuk kode QR yang dapat diandalkan:'],
      bullets: [
        'Selalu uji kode QR Anda dengan beberapa aplikasi pemindai sebelum mencetak.',
        'Guna Pembetulan Kesalahan H (Tinggi) ketika menambahkan overlay.',
        'Indianapolis Jaga setidaknya 4 modul zona tenang (margin).',
        'Pastikan kontras tinggi antara latar depan dan latar belakang.',
        'Untuk cetakan, gunakan setidaknya 300 DPI dan uji pada ukuran cetakan sebenarnya.',
        'Melestarikan Pola Pencari bila menggunakan overlay.',
        'Mulai dengan intensitas overlay yang lebih rendah dan meningkat secara bertahap.',
        'Untuk penggunaan luar ruangan, perhatikan ukuran modul yang lebih besar dan pembetulan kesalahan yang lebih tinggi.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}',
          label: 'Artikel - artikel yang telah diulas',
          type: 'learn',
        },
        { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
      ],
    },
    {
      heading: 'Penerjemahan Masalah',
      paragraphs: ['Masalah dan solusi umum:'],
      bullets: [
        'QR tidak akan memindai: Kurangi intensitas overlay, tingkatkan pembetulan kesalahan, periksa kontras.',
        'Kode Code terlalu besar: Kurangi panjang kandungan, gunakan URL shortener, versi bawah.',
        'Keluaran kabur: Ekspansi ukuran modul, gunakan PNG daripada format yang dikompresi.',
        'Warna terlihat salah: Periksa kontras warna, coba mode overlay skala kelabu.',
        'GIF: Pastikan menggunakan output format GIF, periksa jumlah frame.',
        'Tindihan atas imej tidak dimuatkan: Periksa ijin CORS pada gambar remote.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh terkait yang berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Pintasan Papan Kekunci',
      paragraphs: [
        'KANQR mendukung pintasan papan kekunci standar. Use Ctrl/Cmd+S untuk memicu ekspor (bila difokuskan pada preview).',
      ],
    },
    {
      heading: 'Perkongsian Perkongsian & Pembenaman',
      paragraphs: [
        'Dalam mode Profesionalis, klik tombol Kongsi untuk menyalin URL dengan pengaturan Anda saat ini. Penerima wasiat dapat membuka URL ini untuk melihat konfigurasi yang tepat. Catatan: Tindih imej dari berkas lokal tidak dapat dibagi melalui URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Coba konfigurasi ini langsung di generator ANQR.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Artikel - artikel yang telah diulas', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Lihat contoh QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: '♪ Buka generatornya ♪', type: 'generator' },
  ],
};

export default guide;
