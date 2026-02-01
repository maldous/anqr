import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const guide: PageDefinition = {
  title: 'Panduan Pengguna ANQR',
  description: 'Lengkap panduan untuk menggunakan ANQR untuk membuat kode QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buka generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Ramban artikel Pelajari', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Mulai',
      paragraphs: ['ANQR adalah generator kode QR dengan pendekatan pertama. Secara baku, kode QR dihasilkan secara lokal dalam peramban Anda - tidak ada akun yang diperlukan dan data Anda tetap pribadi. Untuk embedding profesional, Anda juga dapat menggunakan server-sisi API.', 'Antarmuka memiliki tiga tingkat antarmuka: Dasar, Tingkat Lanjut, dan Profesional. Pilih level Anda memakai tab di header. Setiap tingkat membuka fitur tambahan saat menjaga antarmuka fokus pada apa yang Anda butuhkan.'],
      bullets: ['Dasar: Pembuatan kode QR sederhana dengan isi teks / URL polos dan gambar overlay.', 'Advanced: pilihan pengkodean QR, gaya rendering, animasi, format keluaran, tipe isi ekstended, dan penyesuaian overlay.', 'Tanda air, metadata, berbagi, analisis keselamatan, pembayaran QR kode, dan fitur perusahaan.'],
      links: [{ href: '/?lang=${lang}', label: 'Buka generator', type: 'generator' }],
    },
    {
      heading: 'Cepat Mulai',
      paragraphs: ['Untuk membuat kode QR pertama Anda:'],
      bullets: ['1. Pilih suatu tipe isi (URL, teks, WiFi, dsb.) dari dropdown Tipe Isi.', '2. Masukkan data Anda di ruas yang disediakan.', '3. Opsional menyesuaikan warna, gaya, dan menambahkan gambar overlay.', '4. Klik Ekspor untuk mengunduh kode QR Anda sebagai PNG, GIF, WebP, atau SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Fitur Dasar',
      paragraphs: ['Tingkat dasar menyediakan antarmuka yang diperkecil untuk membuat kode QR dengan isi muatan dan overlay gambar. Ini adalah cara paling sederhana untuk memulai.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Tipe Isi (Dasar)',
      paragraphs: ['Teks Biasa: Enkode teks apapun hingga batas kapasitas QR. Ideal untuk pesan pendek, kode, atau identifier.', 'URL: Encode alamat web. Kode QR akan membuka URL ketika dipindai. Mendukung http: / / dan https: / / protokol.'],
    },
    {
      heading: 'Gambar Overlay (Dasar)',
      paragraphs: ['Unggah gambar (JPG, PNG, GIF, WebP) untuk berbaur dengan kode QR Anda. Fitur overlay dasar termasuk:'],
      bullets: ['Unggah dari berkas: Pilih gambar dari perangkat Anda.', 'Muat dari URL: Masukkan suatu URL image (harus mengijinkan CORS).', 'Logo Pusat: Lokasi gambar di tengah, mengandalkan koreksi kesalahan.', 'Blend: Campuran gambar alpha sederhana dengan pola QR.', 'Intensitas: Mengendalikan betapa kuatnya overlay mempengaruhi kode QR (0-100%).', 'Mode Warna: Warna Penuh, Grayscale, atau Hitam & Putih.', 'Pertahankan Pola Pencari: Menjaga pola sudut tidak diubah untuk pemindaian yang dapat diandalkan.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Lihat panduan dan contoh terkait', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Fitur Lanjutan',
      paragraphs: ['Tingkat lanjut membuka opsi pengkodean QR, gaya rendering, animasi, format keluaran, tipe isi ekstended, dan penyesuaian overlay lanjutan.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pengaturan Pengkodean QR',
      paragraphs: ['Versi: kode QR datang dalam versi 1-40, dengan lebih tinggi versi memegang lebih banyak data tetapi menjadi lebih besar. Set ke 0 (Auto) untuk membiarkan ANQR memilih versi terkecil yang cocok dengan isi Anda.', 'Koreksi Galat: Menentukan berapa banyak kerusakan pada kode QR yang dapat dipertahankan ketika tersisa yang dapat dipindai.'],
      bullets: ['L (Rendah): 7% koreksi kesalahan - ukuran terkecil, setidaknya redundansi.', 'M (Medium): 15% koreksi kesalahan - pilihan seimbang.', 'Q (Quartile): 25% koreksi kesalahan - baik untuk kode cetak.', 'H (Tinggi): 30% koreksi kesalahan - terbaik untuk kode dengan overlay atau dalam kondisi keras.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Zona Tenang (Margin)',
      paragraphs: ['Zona tenang adalah ruang putih sekitar kode QR. Pemindai perlu margin ini untuk mendeteksi di mana kode dimulai. Standar merekomendasikan setidaknya 4 modul. Mengurangi di bawah 4 dapat menyebabkan masalah pemindaian.'],
    },
    {
      heading: 'Gaya Modul',
      paragraphs: ['Modul adalah kotak individu yang menyusun kode QR. ANQR menawarkan lima gaya:'],
      bullets: ['Square: penampilan QR klasik dengan sudut tajam.', 'Dibulatkan: Sudut yang lembut untuk tampilan ramah.', 'Dots: modul melingkar untuk estetika modern.', 'Berlian: 45 ° kotak berputar untuk pola yang khas.', 'Terhubung: Modules merge ketika berdekatan, menciptakan bentuk organik.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Gaya Pola Finder',
      paragraphs: ['Pola Finder adalah tiga kotak besar di sudut-sudut QR yang membantu scanner menentukan kodenya. Gaya tersedia:'],
      bullets: ['Sudut persegi standar.', 'Dibulatkan: Sudut lembut cocok dengan gaya modul bulat.', 'Lingkaran: pola penemu melingkar untuk kode dot- gaya.'],
    },
    {
      heading: 'Pola Perataan & Waktu',
      paragraphs: ['Pola perataan muncul dalam kode QR yang lebih besar (versi 2 +) untuk membantu distorsi yang benar. Pola waktu adalah baris alternatif yang menghubungkan pola penemu.'],
      bullets: ['Perataan Gaya: Match Finder, Square, Rounded, atau Circle.', 'Gaya Waktu: Cocok Modul, Solid, atau Dashed.'],
    },
    {
      heading: 'Warna',
      paragraphs: ['Latar depan: Warna modul QR. Hitam (# 0000000) adalah standar tetapi warna gelap apapun bekerja.', 'Latar Belakang: Warna latar belakang. Putih adalah standar. Pastikan cukup kontras dengan latar depan.', 'Latar Belakang Transparan: Hapus latar belakang sepenuhnya untuk digunakan pada permukaan berwarna. Pastikan permukaan menyediakan kontras yang memadai.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Ukuran Modul & Gap',
      paragraphs: ['Ukuran Modul: Mengendalikan seberapa besar setiap modul dirender dalam piksel. Nilai yang lebih besar akan membuat kode yang lebih besar.', 'Foto Modul: Tambahkan ruang antar modul sebagai persentase. Jarak kecil (5- 15%) dapat meningkatkan kemampuan panca dalam beberapa kondisi tapi kesenjangan yang berlebihan mengurangi keandalannya.'],
    },
    {
      heading: 'Pengaturan Keluaran',
      paragraphs: ['Format: Pilih format ekspor Anda berdasar pada kasus penggunaan.'],
      bullets: ['PNG: format raster lossless, ideal untuk kebanyakan digunakan. Terbaik untuk cetak dan digital.', 'WebP: Format modern dengan ukuran berkas yang lebih kecil. Bagus untuk penggunaan web.', 'Perlu untuk animasi kode QR. Mendukung transparansi.', 'Format vektor yang skala jauh. Terbaik untuk cetak besar atau ketika Anda perlu untuk menyunting kode.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Lihat panduan dan contoh terkait', type: 'learn' },
      ],
    },
    {
      heading: 'Dimensi Keluaran',
      paragraphs: ['Lebar / Tinggi: Atur ukuran keluaran dalam piksel. Untuk dicetak, hitung berdasarkan DPI (misalnya, 300 DPI pada 1 inci = 300 px). Ukuran yang lebih besar memindai lebih handal di kejauhan.'],
    },
    {
      heading: 'Pengaturan Animasi (Lanjutan)',
      paragraphs: ['Kontrol perilaku kode QR animasi:'],
      bullets: ['Laju bingkai animasi dalam milidetik.', 'Loop: Animasi diputar terus-menerus atau tunggal.', 'Bounce: Arah animasi ping-pong.', 'Mulai Bingkai: Mulai animasi dari bingkai tertentu.', 'Max Frames: Batasi total frame dalam animasi.', 'Bingkai Langkah: Skip frame untuk animasi lebih cepat.', 'Tidak ada, Crossfade, atau Morph diantara frame.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Lihat panduan dan contoh terkait', type: 'learn' },
      ],
    },
    {
      heading: 'Tipe Isi (Lanjutan)',
      paragraphs: ['Tingkat lanjut membuka format muatan tambahan:'],
      bullets: [
        'Nomor Telepon (tel:): Membuat sambungan telepon yang dapat dihubungi.',
        'Surel (mailto:): Buka klien surel dengan subjek opsional dan tubuh.',
        'SMS: Pesan teks Pre-filled ke nomor telepon.',
        'vCard: kartu kontak penuh dengan nama, organisasi, telepon, email, alamat.',
        'MeCard: Format kontak kompak populer di Jepang.',
        'BizCard: Format kartu kredit.',
        'Lokasi Geo: Koordinat GPS yang terbuka dalam peta.',
        'WiFi: Kredensial jaringan bagi koneksi otomatis (SSID, sandi, tipe keamanan).',
        'Acara Kalender: format iCalendar dengan judul, lokasi, tanggal / waktu.',
        'Sambungan ke halaman pendaftaran acara.',
        'Berlangganan Kalender: Berlangganan ke feed ICS / WebCal.',
        'URL Berkas / Dokumen: Tautan langsung ke berkas yang dapat diunduh.',
        'Tautan Penyimpanan Awan: Taut ke Google Drive, Dropbox, OneDrive, dll.',
        'Profil Sosial: Tautan ke LinkedIn, Twitter, Instagram, dll.',
        'Pesan Link: WhatsApp, Telegram, sinyal link dalam.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Fitur Overlay Lanjutan',
      paragraphs: ['Kemampuan overlay tambahan:'],
      bullets: ['Crop: Aktifkan cropping untuk memilih daerah kuadrat dari gambar Anda.', 'Halftone: Pola titik gaya klasik berdasarkan kecerahan gambar.', 'Dithered: difusi yang berkembang biak secara rinci.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Mode Campuran Bernuansa (Lanjutan)',
      paragraphs: ['Mode campuran tambahan di tingkat lanjut:'],
      bullets: ['Subpiksel: Bagi setiap modul ke dalam sub-piksel untuk detail yang lebih tinggi.', 'Suara bising: Menggunakan suara biru untuk membentuk pola bebas.', 'Mosaik: Efek berbasis Tile- menjaga struktur gambar.', 'Isi Gap: Gambar pada celah antara modul.', 'Kecerahan: ukuran modul dilihat dari kecerahan gambar.', 'Duotone: Peta gambar ke dua warna untuk mencolok kontras.'],
    },
    {
      heading: 'Intensitas Overlay',
      paragraphs: ['Mengendalikan betapa kuatnya overlay mempengaruhi kode QR (0-100%). Nilai yang lebih tinggi menunjukkan lebih banyak gambar detail tetapi dapat mengurangi scannability. Mulai sekitar 70% dan menyesuaikan berdasarkan pengujian.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Lihat panduan dan contoh terkait', type: 'learn' }],
    },
    {
      heading: 'Mode Warna',
      paragraphs: ['Bagaimana gambar overlay diproses:'],
      bullets: ['Warna Penuh: Pertahankan warna asli gambar.', 'Mengubah nada hitam dan putih.', 'Hitam & Putih: Konversi binari kontras tinggi.'],
    },
    {
      heading: 'Pertahankan Pola Pencari',
      paragraphs: ['Ketika diaktifkan, membuat tiga pola pencari sudut tidak dimodifikasi oleh overlay. Direkomendasikan untuk pemindaian yang dapat diandalkan.'],
    },
    {
      heading: 'Preproses Gambar',
      paragraphs: ['Terapkan filter ke gambar overlay Anda sebelum membaur. Penyesuaian ini dapat meningkatkan bagaimana gambar muncul dalam kode QR akhir.'],
      bullets: ['Kecerahan (-100 sampai + 100): Ringankan atau gelapkan gambar.', 'Kontras (-100 sampai + 100): Naikkan atau turunkan jangkauan tonal.', 'Gamma (0.2 sampai 3.0): Penyesuaian kecerahan Non-linear. Nilai di bawah 1 nada tengah, di atas 1 gelap mereka.', 'Saturasi (-100 ke + 100): Intensitas warna. -100 adalah skala abu-abu, + 100 adalah terlalu jenuh.', 'Hue Rotasi (0- 360 °): Geser semua warna di sekitar roda warna.', 'Blur (0- 20px): Detil gambar yang perlahan.', 'Tajamkan (0- 100%): Enhance tepi dan rincian.', 'Posterize (0- 16 tingkat): Kurangi tingkat warna untuk efek poster.', 'Ambang (0- 255): Ubah ke binari hitam / putih di titik cutoff.', 'Deteksi Tepi: Algoritma Sobel atau Canny untuk hanya menampilkan pinggiran.', 'Balik semua warna.'],
    },
    {
      heading: 'Moda Fit',
      paragraphs: ['Bagaimana gambar overlay cocok dengan daerah kode QR:'],
      bullets: ['Cover: Gambar mengisi seluruh area, crapping jika diperlukan.', 'Berisi: gambar keseluruhan terlihat, mungkin memiliki margin.', 'Stretch: Gambar disorts untuk mengisi tepat.'],
    },
    {
      heading: 'Ubah Opsi',
      paragraphs: ['Rotasi: Rotasi overlay dalam 90 ° peningkatan.', 'Balik X / Y: Sorot gambar secara horisontal atau vertikal.'],
    },
    {
      heading: 'Algoritma Diuthering',
      paragraphs: ['Menggali konversi terus menerus-nada gambar ke pola bahwa kode QR dapat mewakili. Tersedia ketika menggunakan Dithered, Blue Noise, atau Mode campuran True Dither.'],
      bullets: [
        'Kesalahan Difusi: Gaya Falid- Steinberg Klasik. Kesalahan penyebaran kuantisasi pada piksel tetangga.',
        'Dipesan (Bayer): Menggunakan matriks threshold untuk pola biasa.',
        'Pencetakan setengah nada.',
        'Void & Cluster: Teroptimasi memerintahkan mati.',
        'Suara Suara Biru: Pola acak yang tampak menyenangkan secara visual.',
        'Suara Suara Biru Ambang batas: Threshold menggali dengan tekstur kebisingan biru.',
        'White Noise: batas acak layu.',
        'Gaussian / Triangular Suara bising dengan distribusi yang berbeda.',
        'Suara Biru + Error Difusi: Hibrida menggabungkan kedua teknik.',
        'Layar seperti pola suara biru.',
        'Perseptual: pelumas, berat untuk hasil visual yang lebih baik.',
        'Edge- Sadar: Menjaga tepi gambar selama layu.',
        'Ambang Adaptif: Pemalpaan adaptif yang salah.',
        'Untuk GIFs animasi, bervariasi pola per frame.',
      ],
    },
    {
      heading: 'Kernel Difusi',
      paragraphs: ['Ketika menggunakan Galat Difusi dighering, pilih bagaimana kesalahan didistribusikan:'],
      bullets: ['Flidd--Steinberg: penyebaran tetangga 4 klasik. Pilihan umum yang bagus.', 'Jarvis- Judice- Ninke: 12- tetangga, halus tapi lambat.', 'Stucki: Mirip JJN dengan bobot berbeda.', 'Disederhanakan JJN, lebih cepat.', 'Sierra: Keluarga kernel menyeimbangkan kualitas dan kecepatan.', 'Difusi cahaya, menjaga detail tapi bisa menjadi kasar.'],
    },
    {
      heading: 'Kekuatan Dither',
      paragraphs: ['Mengendalikan berapa banyak difhering diterapkan (0-100%). Nilai lebih rendah mempertahankan lebih dari pola asli, nilai yang lebih tinggi menunjukkan detail gambar lebih lanjut.'],
    },
    {
      heading: 'Pengaturan Subpiksel',
      paragraphs: ['Ketika memakai mode campuran Subpiksel:'],
      bullets: ['Ukuran Grid: 2 x 2, 3 x 3, atau 4 x 4 subpiksel per modul. Lebih tinggi = lebih detail.', 'Aturan Pusat: Strict membutuhkan pusat subpiksel untuk mencocokkan modul. Halftone Center memungkinkan variasi.', 'Warna Netral: Warna yang dipakai untuk sub piksel yang tidak ditentukan.', 'Finder Override: Bagaimana pola penemu dirender (Solid atau Stylisasi).'],
    },
    {
      heading: 'Pengaturan Halftone',
      paragraphs: ['Ketika memakai mode campuran Halftone:'],
      bullets: ['Ukuran Sel: Per Modul atau kisi N ×.', 'Lingkaran, Square, atau Line.', 'Brightness Curve, Linear, S-Curve, atau Gamma.'],
    },
    {
      heading: 'Warna Duotone',
      paragraphs: ['Ketika menggunakan mode campuran Duotone, tata warna Shadow (daerah gelap) dan Sorot warna (daerah terang).'],
    },
    {
      heading: 'Pengaturan Animasi GIF',
      paragraphs: ['Ketika menggunakan GIF animasi overlay:'],
      bullets: ['Gunakan Frame Delaps: menghormati waktu GIF asli.', 'Laju frame maksimum (1- 60 fps).', 'Disposal Handling: Menghormati atau Sederhanakan metode pembuangan frame.'],
    },
    {
      heading: 'Opsi Peringkat Tingkat Lanjut',
      paragraphs: ['Kontrol render tambahan:'],
      bullets: ['Mode Gap: Tidak ada, Inset, Stroke, atau gaya kesenjangan Ruang Negatif.', 'Radius sudut: Persentase sudut yang dikelilingi oleh modul.', 'Gradien: Tidak ada, Linear, Radial, atau gradien Conic pada modul.', 'Eye Outer / Inner Style: Gaya independen untuk menemukan pola cincin.', 'Rotasi Titik: Putar modul berlian / titik.', 'Skala Mata: Penyesuaian Ukuran untuk pola penemu.', 'Gaya Bingkai: Tambah frame dekoratif (Rounded Frame, Sticker, Tag).', 'Teks Bingkai: Tambahkan teks seperti "Pindai Me!" ke frame.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Enkoding QR Lanjutan',
      paragraphs: ['Encoding QR -tune:'],
      bullets: ['Mode Pengkodean: Otomatis, Numerik, Alfanumerik, Byte / UTF-8, atau Kanji.', 'Paksa Min Quiet Zone: Pastikan setidaknya 4 modul marjin.', 'Pola Topeng: Otomatis (optimal), atau pilih pola secara manual 0-7 untuk mengontrol distribusi modul. Pola yang berbeda membuat penampilan visual yang berbeda ketika mengkodean data yang sama.', 'Pengkodean Karakter: ISO-859-1 (Baku Latin- 1), UTF-8 (Unicode penuh termasuk emoji), atau Shift- JIS (Jepang). Pilih berdasarkan persyaratan karakter konten Anda.'],
    },
    {
      heading: 'Opsi Keluaran Lanjutan',
      paragraphs: ['Pengaturan ekspor tambahan:'],
      bullets: ['Nama berkas: Nama berkas gubahan untuk pengunduhan.', 'GIF Ukuran Palet: 2- 256 warna dalam keluaran GIF.', 'GIF Quantizer: Potongan Median, NeuQuant, atau pengurangan warna Octree.', 'GIF Mati, Flandd- Steinberg, atau Ordered.', 'GIF Warna Transparan: Atur warna agar transparan.', 'SVG Vektor sejati: Gunakan tapak bukan raster tertanam.', 'SVG Shape Precision: merender jalur Pixel atau Precise.', 'SVG Embed Raster Overlay: Termasuk overlay sebagai gambar yang tertanam.', 'Latar Belakang Timpa: Paksa warna latar belakang spesifik dalam keluaran.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opsi Validasi',
      paragraphs: ['Pengaturan pemrosesan masukan:'],
      bullets: ['Validate Masukan: Periksa format isi sebelum pengkodean.', 'Trim Whitespace: Hapus ruang terkemuka / trailing.', 'Normalize Newlines: Ubah semua akhir baris ke LF.', 'Max Panjang Guard: Peringatkan jika isi melebihi kapasitas QR.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Fitur Profesional',
      paragraphs: ['Tingkat profesional menambahkan watermark, metadata, opsi berbagi, analisis keselamatan, pembayaran QR kode, dan fitur perusahaan.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Watermark',
      paragraphs: ['Tambahkan tanda air ke kode QR Anda:'],
      bullets: ['Jenis: teks, gambar, atau pola pola air.', 'Pusat, Corners, Edges, Behind, atau Quiet Zone.', 'Opasitas: Transparansi Watermark (0- 100%).', 'Mode Blend: Normal, Multiply, Screen, atau Overlay blending.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Tempelkan metadata dalam berkas yang diekspor:'],
      bullets: ['Judul, Penulis, Hak Cipta, Lisensi, ruas Deskripsi.', 'Pembuatan Waktu: Embed timestamp generasi.', 'Nilai Tombol-Ubahan: Tambahkan pasangan metadata sewenang-wenang.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Berbagi',
      paragraphs: ['Berbagi konfigurasi kode QR Anda:'],
      bullets: ['Tautan Langsung: Buat sebuah URL sharable dengan pengaturan Anda saat ini.', 'Tempelkan HTML: Dapatkan kode embed untuk website.', 'Parameter Encode: Sertakan semua pengaturan dalam URL berbagi.', 'Catatan: Gambar overlay dari berkas lokal tidak dapat dibagikan melalui URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Lihat panduan dan contoh terkait', type: 'learn' },
      ],
    },
    {
      heading: 'Analisis Keselamatan',
      paragraphs: ['Pastikan kode QR tetap dapat dipindai:'],
      bullets: ['Mode Keselamatan: Off, Balanced, atau Strict pemindaian persyaratan.', 'Min Modul Ukuran: Ukuran piksel minimal per modul.', 'Min Tenang Zone: modul batas minimum.', 'Kunci Finders / Timing / Align / Format / Versi: Lindungi elemen spesifik.', 'Max Overlay Intensity by ECC: intensitas otomatis membatasi berdasarkan tingkat koreksi kesalahan.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Lihat panduan dan contoh terkait', type: 'learn' },
      ],
    },
    {
      heading: 'Tipe Isi (Profesional)',
      paragraphs: ['Tingkat profesional menambahkan pembayaran dan jenis konten perusahaan:'],
      bullets: ['EPC / SEPA (EU): Transfer bank Eropa QR kode dengan IBAN, BIC, jumlah, referensi.', 'UPI (India): Unified Payments Interface dengan VPA, nama payee, jumlah.', 'Paynow (Singapura): Pembayaran cepat Singapura dengan UEN atau nomor ponsel.', 'PromptPay (Thailand): Sistem pembayaran nasional Thailand.', 'Upah instan Brasil dengan kunci PIX.', 'Bitcoin, Ethereum, Litecoin alamat pembayaran dengan jumlah opsional.', 'Pemasaran Sambungan Kampanye: URL dengan parameter penuh UTM (Tanda Pemasaran) pelacakan.', 'Tautan Singkat: Untuk digunakan dengan URL shorteners untuk dinamis / trackable QR kode.', 'GS1 Digital Link: Identifikasi produk dengan GTIN, serial, batch, kadaluarsa.', 'App Deep Link: iOS / Android app deep link dengan skema gubahan.', 'Format Gubahan: Data mentah tanpa format atau validasi.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Lihat panduan dan contoh terkait', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Bahasa - Relevant Payments dalam Mode Lanjutan',
      paragraphs: ['Ketika menggunakan mode Lanjutan, ANQR otomatis menampilkan metode pembayaran yang relevan dengan bahasa yang Anda pilih. Misalnya, pengguna Vietnam melihat VietQR, pengguna Thailand melihat PromptPay, dan pengguna bahasa India melihat UPI dan BharatQR. Metode pembayaran global (cryptocure, PayPal, Cash App) tersedia bagi semua bahasa. Mode profesional membuka semua standar pembayaran terlepas dari bahasa.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standar Pembayaran Eropa',
      bullets: ['EPC / SEPA (EU): Transfer bank Eropa QR kode berikut EPC QR Kode Standar. Mendukung IBAN, BIC (opsional untuk domestik), jumlah di EUR, dan terstruktur atau referensi pembayaran tidak terstruktur. Digunakan di zona SEPA termasuk negara Uni Eropa ditambah Swiss, Norwegia, Islandia, Liechtenstein, Monaco, dan San Marino.', 'Swiss QR-bill: standar pembayaran Swiss berikut Six Impolmentation Guidnets. Mendukung CHF dan EUR, Referensi QR- (QRR), Referensi Kredit (ISO 11649), terstruktur alamat kreditur / debitur, dan informasi tagihan. Diperlukan untuk faktur Swiss sejak 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standar Pembayaran India',
      bullets: ['UPI (India): Interface Pembayaran Bersatu mengikuti Spesifikasi NPCI Deep Linking. Mendukung VPA (Alamat Pembayaran Virtual), nama payee, jumlah dalam INR, catatan transaksi, ID referensi, kode kategori pedagang, dan mode transaksi.', 'BharatQR (India): Standar QR terpadu mendukung pembayaran UPI dan Cards. Combins UPI VPA dengan kartu PAN untuk kompatibilitas maksimum. Termasuk nama pedagang, kota, MCC, rincian GST, dan faktur nomor referensi.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standar Pembayaran Asia Tenggara',
      bullets: ['Paynow (Singapura): Sistem pembayaran cepat Singapura menggunakan spesifikasi EMVCo QR dengan profil SGQR. Mendukung UEN (pendaftaran bisnis), nomor ponsel, atau NRIC sebagai pengidentifikasi proksi. Termasuk jumlah tanda yang dapat disuntik dan tanggal kadaluarsa.', 'PromptPay (Thailand): Sistem pembayaran nasional Thailand mengikuti profil EMV Bank of Thailand. Mendukung nomor ponsel, ID nasional, ID pajak, ID e-wallet, dan pembayaran tagihan dengan berbagai bidang referensi.', 'QRIS (Indonesia): Standar Indonesia Response Cepat. EMV-based standar pembayaran nasional mendukung ID pedagang, NMID (National Merchant ID), klasifikasi kriteria pedagang, dan biaya kenyamanan (tetap atau persentase).', 'DuitNow (Malaysia): sistem pembayaran instan Malaysia. Mendukung beberapa jenis proksi termasuk NRIC, mobile, paspor, ID tentara, dan nomor pendaftaran bisnis.', 'Vietnam. Butuh bank BIN (identifikasi NAPAS) dan nomor rekening. Mendukung multiple service codes untuk tipe transfer yang berbeda (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Filipina): Standar pembayaran Filipina QR untuk InstaPay dan Pesonet. Menggunakan nomor rekening dengan identifikasi pedagang untuk P2M (orang ke-pedagang) transaksi.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standar Pembayaran Asia Timur',
      bullets: ['TWQR (Taiwan): Standar pembayaran QR Taiwan. Supports pedagang ID, pajak ID, dan jumlah TWD.', 'HKQR / FPS Hong Kong: Mendukung ID FPS, nomor ponsel, atau email sebagai identifikasi pembayaran. Amounts di HKD.', 'JPQR (Jepang): Standar pembayaran kode QR terpadu Jepang. Gunakan ID toko untuk identifikasi pedagang dengan jumlah JPY.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Standar Pembayaran Regional lainnya',
      bullets: ['Sistem pembayaran Bank Sentral Brazil mengikuti spesifikasi BR Code. Mendukung kunci PIX (CPF, CNPJ, email, telepon, atau kunci acak), nama / kota pedagang, ID transaksi, dan jumlah BRL.', 'AusPayNet / NPP PayID (Australia): sistem Payment baru Australia. Membayar Dukungan Tipe ID (email, mobile, ABN, ID organisasi) atau nomor akun BSB + tradisional. Nama dagang adalah opsional sebagai pembayar melihat nama terdaftar dari NPP lookup.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pembayaran Cryptocure',
      bullets: ['Bitcoin / Litecoin (BIP-21): UANG pembayaran cryptowee standar dengan alamat dompet, jumlah opsional, dan label. Cocok dengan semua Bitcoin utama dan dompet Litecoin.', 'Lightning Network (BOLT11): Biaya pembayaran Lightning Network. Tempelkan string faktur tersandi BOLT11 untuk pembayaran Bitcoin instan dengan biaya minimal.', 'Etherum (EIP-681): permintaan transaksi etherum URI pendukung transfer penduduk asli ETH dan 20 transfer token. Termasuk ID rantai untuk dukungan multi- jaringan (Mainnet, Polygon, BSC, Arbitrum, Optimisme, Avalanche), parameter gas, dan panggilan fungsi kontrak.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Layanan Tautan Pembayaran',
      bullets: ['PayPal.Me: PayPal link pembayaran dengan nama pengguna dan jumlah pre- opsional yang diisi. Penerima dapat membayar melalui saldo PayPal, kartu, atau rekening bank.', 'Aplikasi Tunai: Tautan pembayaran Aplikasi Tunai menggunakan $cashtag dengan jumlah opsional. Populer di Amerika Serikat untuk pembayaran peer-to-peer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'EMV QR Generik',
      bullets: ['EMV Generik: Buat MEMV Gubahan - Mode Yang Disajikan Kode QR untuk skema pembayaran tidak secara khusus terdaftar. Atur nama pedagang, kota, kode negara (ISO 3166-1), kode mata uang (ISO 4217 numerik), MCC, pilihan tip / kenyamanan, dan data tambahan. Berguna untuk pengujian atau integrasi gubahan.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Undo-type',
      paragraphs: ['Mode campuran tambahan dalam level Profesional:'],
      bullets: ['Pixelate: Efek overlay pixelated.', 'Garis luar: deteksi tepi hanya menunjukkan kontur.', 'Efek distorsi gelombang.', 'Ukuran Subpiksel: Ukuran subpiksel variabel berdasarkan gambar.', 'True Dither: berkembang pesat dengan seleksi matriks yang dipesan.', 'Extreme: visibilitas gambar maksimum, dapat mempengaruhi scannability.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pengaturan Perlindungan',
      paragraphs: ['Kontrol halus di mana elemen QR dilindungi dari modifikasi overlay:'],
      bullets: ['Mempertahankan Waktu: Jaga pola waktu tidak dimodifikasi.', 'Pertahankan Perataan: Pertahankan pola alignmen tidak diubah.', 'Format Lindungi Info: Modul informasi format perisai.', 'Lindungi Versi Info: Modul informasi versi Shield.'],
    },
    {
      heading: 'Moda EC-EC-Innotified',
      paragraphs: ['Intelligently mendistribusikan intensitas overlay berdasarkan kapasitas kesalahan koreksi. Sistem menganalisa modul mana yang dapat diubah sambil mempertahankan kemampuan melihat.'],
      bullets: ['Anggaran Resiko: Persentase kapasitas kesalahan yang digunakan (0-100%).', 'Anggaran yang lebih tinggi = lebih terlihat overlay tapi berisiko scrannability.', 'Anggaran lebih rendah = pemindaian lebih aman tetapi tidak terlihat overlay.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opsi Perkembangan Profesional',
      paragraphs: ['Kontrol render tingkat lanjut:'],
      bullets: ['Crisp Edges: Gunakan penyerapan gambar piksel untuk sudut modul yang tajam.', 'Pixel Snap: Lantai, Round, atau keselarasan piksel Ceil.', 'Mode Warna Per- Module: Solid, By Brightness, By Position, By Overlay, By Cluster.', 'Palet Warna: Tentukan palet warna kustom untuk pewarnaan per- modul.', 'Contrast Guard: Pastikan rasio kontras minimum antara warna.', 'Min Contrast Rasio: Kontras WCAG gaya (1: 1 sampai 21: 1).', 'Batas Ekstra Modul: Perbatasan tambahan di luar zona tenang.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opsi Keluaran Profesional',
      paragraphs: ['Pengaturan ekspor Enterprise:'],
      bullets: ['DPI: Atur resolusi pencetakan (72- 600 DPI). 300 DPI direkomendasikan untuk dicetak.', 'Sertakan Zona Diam: Jungkitkan zona tenang dalam dimensi keluaran.', 'Ekspor Sebagai Tambahan: Hasilkan PDF bersama format primer.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pengaturan Animasi (Profesional)',
      paragraphs: ['Fitur animasi profesional tambahan:'],
      bullets: ['Off, Blue Noise, atau Flicker Aman per- frame dithing.', 'Tidak ada, denyut nadi, Gelombang, Scanline, Shimmer, atau efek Drift.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Lihat panduan dan contoh terkait', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Referensi',
      paragraphs: ['ANQR menyediakan API sisi server- untuk menghasilkan kode QR melalui parameter URL. Hal ini ideal untuk memasukkan kode QR dalam situs web, email, dokumen, atau arus kerja otomatis tanpa klien-sisi JavaScript.', 'URL Dasar: https: / / anqr.link / api / qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' }],
    },
    {
      heading: 'Parameter Dasar',
      paragraphs: ['Parameter yang diperlukan dan umum (nama parameter tidak diterjemahkan):'],
      bullets: ['data (dibutuhkan): Isi untuk menyandi kode QR. URL-encode karakter khusus.', 'ukuran: Ukuran gambar dalam piksel (baku: 400, max: 2000). Digunakan jika w / h tidak dispesifikasikan.', 'w, h: Lebar keluaran dan tinggi dalam piksel. Timpa parameter ukuran.', 'format: Format keluaran - png, webp, atau gif (baku: png).', 'ec: Tingkat koreksi galat - L, M, Q, atau H (baku: H).', 'fg: Warna depan sebagai hex tanpa # (baku: 0000000).', 'bg: Warna latar belakang sebagai hex tanpa # (baku: ffinez).', 'transparansi: Atur ke 1 untuk latar belakang transparan.', 'margin: Zona diam dalam modul (baku: 4).'],
    },
    {
      heading: 'Parameter Gaya',
      paragraphs: ['Gaya modul dan pola:'],
      bullets: ['gaya: Gaya modul - persegi, bulat, titik, berlian, terhubung.', 'finder: Gaya pola Finder - persegi, bulat, lingkaran.', 'align: Gaya pola perataan - cocokkan _ finder, kuadrat, bulat, lingkaran.', 'waktu: pola waktu gaya - cocok _ modul, padat, berlari.', 'radius sudut persen 0- 100.', 'gap: gap modul persentase 0- 50.', 'gapMode: Mode Gap - tidak ada, inset, stroke, negatif _ space.', 'mata Gaya mata, persegi, bulat, lingkaran.', 'skala mata: Persentase skala mata (baku: 100).', 'gradien type - none, linear, radial, conic.', 'gradAngle: Sudut gradien untuk gradien linear.', 'gradien berhenti sebagai warna 1, pos1, warna 2, pos2,...'],
    },
    {
      heading: 'Parameter Overlay',
      paragraphs: ['Opsi overlay gambar (gambar overlay diambil sisi server-):'],
      bullets: ['img: URL untuk gambar overlay (harus dapat diakses publik).', 'mode: Mode overlay - tengah, halftone, berbaur, kecerahan, mosaic, dids, blue- kebisingan, sub pixel.', 'intensitas: intensitas overlay 0-100 (baku: 100).', 'warna Mode: Mode warna overlay - warna, skala abu-abu, bw.', 'fit: bagaimana overlay cocok - penutup, mengandung, peregangan.', 'membusuk: rotasi overlay dalam derajat.', 'flipX, flipY: Set ke 1 untuk membalik overlay.', 'simpan Finders: Pertahankan pola penemu (baku: 1).', 'simpan Waktu, keeparAlign: Atur ke 1 untuk melestarikan pola waktu / perataan.'],
    },
    {
      heading: 'Parameter Pemrosesan',
      paragraphs: ['Preprosesing gambar yang diterapkan untuk overlay:'],
      bullets: ['kecerahan: Penyesuaian -100-100 (baku: 0).', 'kontras: Penyesuaian -100-100 (baku: 0).', 'gamma: Nilai 0.1 sampai 3 (baku: 1).', 'saturasi: Penyesuaian -100 ke 100 (baku: 0).', 'hue: rotasi Hue di derajat.', 'blur: Pengaburan dalam piksel.', 'sharpen: jumlah sharpen 0-100.', 'tingkat posterisasi.', 'ambang: Batas biner 0- 255.', 'edge: deteksi tepi - off, sobel, cerdik.', 'invert: Atur ke 1 untuk mengubah warna.'],
    },
    {
      heading: 'Parameter Tanda Air',
      paragraphs: ['Tambahkan tanda air ke kode QR yang dihasilkan:'],
      bullets: ['wmEn: Atur ke 1 untuk mengaktifkan watermark.', 'wm Jenis: tipe Watermark - teks, gambar, pola.', 'wmText: Teks Watermark (URL- dikodekan).', 'wmImg: URL ke gambar watermark.', 'wmPos: Posisi - tengah, sudut, tepi, belakang, zona tenang.', 'wmopasitas: Opasitas 0-100 (baku: 50).', 'wmBlend: Mode blend - normal, perkalian, layar, overlay.'],
    },
    {
      heading: 'Parameter Animasi',
      paragraphs: ['Untuk keluaran GIF animasi (membutuhkan format = gif):'],
      bullets: ['anim Pola animasi - tidak ada, pulsa, gelombang, scanline, shimmer, drift, color _ cycle.', 'anim Frame: Jumlah frame 1-60 (baku: 24).', 'anim Kecepatan: penundaan bingkai dalam milidetik 10-1000 (baku: 100).', 'anim Benih: Benih acak untuk animasi.', 'ealing: Animation eising - linear, ease _ in, ease _ out, ease _ in _ out, bounce.'],
    },
    {
      heading: 'Parameter Keluaran',
      paragraphs: ['Opsi format keluaran:'],
      bullets: ['kualitas: Kualitas WebP 0-1 (baku: 0.9).', 'webpQ: Kualitas WebP 0-100 (baku: 90).', 'gifColors: GIF palet berukuran 2- 256 (baku: 256).', 'dpi: Keluaran DPI untuk PNG (baku: 72).', 'metaCopy, meta Bagian metadata PNG.'],
    },
    // Crop Parameters
    {
      heading: 'Parameter Pangkas',
      paragraphs: ['Opsi pemotongan gambar hamparan:'],
      bullets: ['cropEn: Mengaktifkan pemotongan overlay 0/1 (default: 0).', 'cropX: Pangkas pusat X sebagai pecahan 0-1 (default: 0,5).', 'cropY: Pangkas pusat Y sebagai pecahan 0-1 (default: 0,5).', 'cropSize: Pangkas ukuran sebagai pecahan gambar 0-1 (default: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Parameter Kunci Pengaman',
      paragraphs: ['Kontrol elemen QR mana yang dilindungi dari modifikasi overlay:'],
      bullets: ['lockF: Pola pencari kunci 0/1 (default: 1).', 'lockT: Pola waktu kunci 0/1 (default: 1).', 'lockA: Kunci pola penyelarasan 0/1 (default: 1).', 'lockFmt: Info format kunci 0/1 (default: 1).', 'lockV: Info versi kunci 0/1 (default: 1).', 'safeMode: Mode keamanan - mati, seimbang, ketat (default: mati).', 'safeMinPx: Ukuran modul minimum dalam piksel (default: 2).', 'safeMinQz: Modul zona tenang minimum (default: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parameter Penyetelan Otomatis',
      paragraphs: ['Pengaturan pengoptimalan otomatis:'],
      bullets: ['autoVer: Pilih otomatis QR versi 0/1 (default: 1).', 'autoEcc: Pilih otomatis level ECC 0/1 (default: 0) - petunjuk sisi server saja.', 'autoReduce: [KHUSUS KLIEN] Mengurangi intensitas secara otomatis hingga dapat dipindai - memerlukan loop validasi pemindaian.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Parameter Animasi Tambahan',
      paragraphs: ['Kontrol animasi yang diperluas untuk keluaran GIF:'],
      bullets: ['loop: Animasi berulang terus menerus 0/1 (default: 1).', 'pentalan: Arah animasi ping-pong 0/1 (default: 0).', 'terbalik: Memutar animasi secara terbalik 0/1 (default: 0).', 'colorCycle: Mengaktifkan efek perputaran warna 0/1 (default: 0).', 'interp: Interpolasi bingkai - tidak ada, crossfade, morph (default: tidak ada).', 'tempDither: Dithering sementara - mati, blue_noise, flick_safe (default: mati).', 'startF: Bingkai awal animasi (default: 0).', 'maxF: Bingkai maksimum yang akan dirender (default: 0 = otomatis).', 'stepF: Interval langkah bingkai (default: 1).', 'jitter: [KHUSUS KLIEN] Modul jitter dalam piksel - memerlukan regenerasi QR per frame.'],
    },
    // Dithering Parameters
    {
      heading: 'Parameter Dithering',
      paragraphs: ['Kontrol algoritme dithering untuk pemrosesan overlay:'],
      bullets: ['ditherKind: Algoritma gentar - error_diffusion, order_bayer, blue_noise, dll (default: order_bayer).', 'diffusionKernel: Kernel difusi kesalahan - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (default: floyd_steinberg).', 'ditherStrength: Intensitas gentar 0-100 (default: 50).', 'serpentine: Keragu-raguan serpentine 0/1 (default: 0).', 'matriks: Matriks gentar yang diurutkan - bayer2, bayer4, bayer8 (default: bayer4).', 'bnTile: Ukuran ubin derau biru (default: 64).', 'bnSeed: Benih acak derau biru (default: 0).', 'colorDither: Keragu-raguan warna - tidak ada, per_saluran, perseptual (default: tidak ada).'],
    },
    // Subpixel Parameters
    {
      heading: 'Parameter Subpiksel',
      paragraphs: ['Pengaturan untuk mode campuran subpiksel:'],
      bullets: ['spGrid: Ukuran kisi subpiksel - 2x2, 3x3, 4x4 (default: 3x3).', 'spCenter: Aturan tengah - ketat, halftone_center (default: ketat).', 'spNeutral: Hex warna netral tanpa # (default: 808080).', 'spFinder: Finder override - solid, bergaya (default: solid).'],
    },
    // Halftone Parameters
    {
      heading: 'Parameter Setengah Nada',
      paragraphs: ['Pengaturan untuk mode campuran halftone:'],
      bullets: ['htCell: Ukuran sel halftone - per_module atau nxn grid (default: per_module).', 'htDot: Bentuk titik - lingkaran, persegi, garis (default: lingkaran).', 'htCurve: Kurva kecerahan - linier, kurva s, gamma (default: linier).', 'duo1: Warna bayangan duotone hex tanpa # (default: 000000).', 'duo2: Warna highlight Duotone hex tanpa # (default: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parameter Mode Sadar ECC',
      paragraphs: ['Distribusi overlay cerdas berdasarkan kapasitas koreksi kesalahan:'],
      bullets: ['eccAware: Mengaktifkan mode sadar ECC 0/1 (default: 0).', 'eccRisk: Persentase anggaran risiko 0-100 (default: 50).', 'eccMap: Peta berat - distance_to_finders, block_heatmap, empiris_scan_heatmap (default: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Parameter Bingkai',
      paragraphs: ['Pengaturan bingkai dekoratif:'],
      bullets: ['bingkai: Gaya bingkai - tidak ada, bingkai_bulat, stiker, tag (default: tidak ada).', 'frameText: Teks untuk ditampilkan dalam bingkai (URL dikodekan).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parameter Warna Per Modul',
      paragraphs: ['Opsi pewarnaan modul individual:'],
      bullets: ['modColor: Mode warna - solid, by_brightness, by_position, by_overlay, by_cluster (default: solid).', 'cGuard: Penjaga kontras 0/1 (default: 0).', 'minContrast: Rasio kontras minimum 1-21 (default: 4,5).', 'palet: Warna hex yang dipisahkan koma untuk mode palet.', 'paletMode: Distribusi palet - posisi, kecerahan, diagonal, radial, acak, baris, kolom (default: posisi).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parameter Hamparan GIF',
      paragraphs: ['Pengaturan untuk gambar hamparan GIF animasi:'],
      bullets: ['ovType: Jenis overlay - statis, gif, apng, webp_anim, video (default: statis).', 'ovFramePick: Pemilihan bingkai - semua, setiap_n, max_frames, durasi_batas (default: semua).', 'gifDelays: Gunakan penundaan bingkai GIF asli 0/1 (default: 1).', 'gifDispH: Penanganan pembuangan GIF - hormati, sederhanakan (default: hormati).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Batas Intensitas Per-ECC',
      paragraphs: ['Intensitas overlay maksimum per tingkat koreksi kesalahan:'],
      bullets: ['maxIntL: Intensitas maks untuk ECC L 0-100 (default: 100).', 'maxIntM: Intensitas maks untuk ECC M 0-100 (default: 100).', 'maxIntQ: Intensitas maks untuk ECC Q 0-100 (default: 100).', 'maxIntH: Intensitas maks untuk ECC H 0-100 (default: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parameter Simulasi QA (Khusus Klien)',
      paragraphs: ['Parameter berikut diurai untuk kompatibilitas URL tetapi hanya berfungsi di browser:'],
      bullets: ['qaContrast: Aktifkan pemeriksaan kontras 0/1 - memerlukan validasi interaktif.', 'qaBlur: Simulasikan keburaman dalam piksel - hanya untuk pengujian interaktif.', 'qaNoise: Simulasikan tingkat kebisingan - hanya untuk pengujian interaktif.', 'qaHeatmap: Tampilkan peta panas keterbacaan 0/1 - memerlukan UI hamparan kanvas.'],
    },
    // Client-Only Parameters
    {
      heading: 'Parameter Khusus Klien',
      paragraphs: ['Sebagian besar parameter API didukung sepenuhnya di sisi server. Parameter yang ditandai [KHUSUS KLIEN] diurai untuk kompatibilitas URL tetapi memerlukan fitur browser:'],
      bullets: ['jitter: Jitter modul memerlukan regenerasi QR per-frame secara acak.', 'autoReduce: Pengurangan intensitas otomatis memerlukan pengujian pemindaian berulang.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: Simulasi QA memerlukan validasi kanvas interaktif.'],
    },
    // Additional Output Parameters
    {
      heading: 'Parameter Keluaran Tambahan',
      paragraphs: ['Pengaturan keluaran dan ekspor yang diperluas:'],
      bullets: ['fname: Nama file khusus untuk unduhan (default: anqr-qrcode).', 'inclQz: Sertakan zona tenang dalam dimensi keluaran 0/1 (default: 1).', 'bgOver: Warna latar belakang menggantikan hex tanpa # (mengganti parameter bg).', 'fmtExtra: Output format tambahan - tidak ada, eps, animasi_webp (default: tidak ada). Catatan: eps adalah [PARTIAL].', 'svgPrec: Presisi bentuk SVG - piksel, presisi (default: piksel). [PARTIAL] Output SVG terbatas pada sisi server.', 'svgEmbed: Sematkan overlay raster di SVG 0/1 (default: 1). [PARTIAL] Output SVG terbatas pada sisi server.', 'modulePx: Ukuran piksel modul (default: dihitung otomatis dari ukuran).', 'perbatasan: Modul perbatasan ekstra di luar zona tenang (default: 0).', 'garing: Mengaktifkan rendering gambar tajam/piksel 0/1 (default: 1).', 'jepret: Mode jepret piksel - lantai, bulat, langit-langit (default: lantai).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parameter Pelestarian Pola',
      paragraphs: ['Kontrol elemen struktural mana yang dilindungi dari overlay:'],
      bullets: ['keepFinders: Pertahankan pola pencari 0/1 (default: 1).', 'keepTiming: Pertahankan pola waktu 0/1 (default: 0).', 'keepAlign: Mempertahankan pola perataan 0/1 (default: 0).', 'proteksiFmt: Lindungi modul info format 0/1 (default: 0).', 'proteksiVer: Lindungi modul info versi 0/1 (default: 0).'],
    },
    {
      heading: 'Penggunaan Contoh',
      paragraphs: ['Kode QR dasar:', 'https: / / anqr.link / api / qr? data = https: / / example.com', 'Gaya kode QR dengan warna gubahan:', 'https: / / anqr.link / api / qr? data = Hello & size = 300 & fg = 1e40af & bg = ffdney & style = dibulatkan & radius = 30', 'Kode QR dengan gambar overlay:', 'https: / / anqr.link / ap.qr? data = https: / / example.com & ec = H & img = https: / / example.com / logo.png & mode = halftone & intensitas = 70', 'Animated GIF:', 'https: / / anqr.link / api / qr? data = Hello & format = gif & anisPattern = pulse & animes Frames = 24 & easing = ease _ in _ out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' }],
    },
    {
      heading: 'Kode QR Embedding',
      paragraphs: ['Dalam mode Profesional, Fitur Share menghasilkan HTML dan URL yang dapat digelapkan. Berikut adalah bagaimana embedding bekerja:'],
      bullets: ['Berbagi Link: Membuat sebuah URL ke aplikasi ANQR dengan semua pengaturan Anda dikodekan sebagai parameter URL. Penerima dapat melihat dan mengubah kode QR.', 'Tempelkan Gambar: Menghasilkan tag < img > menunjuk ke server API. Kode QR dibuat server-side dan berfungsi sebagai gambar.', 'Embed Markdown: Membuat sintaks gambar Markdown untuk dokumentasi dan berkas README.', 'URL API langsung: URL API mentah yang dipakai dalam aplikasi, skrip, atau integrasinya lain.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
    {
      heading: 'Contoh HTML',
      paragraphs: ['Untuk memasukkan kode QR di website Anda:', '< img src = "https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 200" alt = "QR Code" / >', 'Untuk ukuran responsif:', '< img src = "https: / / anqr.link / api / qr? data = https: / / yoursite.com & size = 400" alt = "QR Code" style = "max-width: 100%; tinggi: auto;" / >', 'Server cache menanggapi header cache panjang, jadi permintaan berulang untuk URL yang sama cepat.'],
    },
    {
      heading: 'Berbagi Format URL',
      paragraphs: ['Ketika Anda mengklik Share dalam mode Profesional, ANQR mengkodekan pengaturan Anda ke parameter URL. Format:', 'https: / / anqr.link /? data =... & ec = H & style = dibulatkan &....', 'Parameter ini mencerminkan parameter API, sehingga Anda dapat mengonversi URL berbagi menjadi URL API dengan mengubah jalur dasar dari / ke /api/qr dan menyesuaikan parameter w/h sesuai kebutuhan.', 'Catatan: Gambar overlay diupload dari berkas lokal tidak dapat dibagikan via URL - hanya URL-based overlay (img parameter) bekerja dalam shared link dan API calls.'],
    },
    {
      heading: 'Batas Laju dan Penggunaan',
      paragraphs: ['API bebas digunakan untuk volume yang masuk akal. Untuk penggunaan volume tinggi atau aplikasi komersial yang membutuhkan jaminan uptime, silakan hubungi kami.', 'Respon API termasuk header caching agresif. Untuk kinerja terbaik, cache respon pada akhir Anda atau menggunakan URL yang sama konsisten untuk kode QR identik.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Terbaik Praktek',
      paragraphs: ['Ikuti pedoman ini untuk kode QR yang terpercaya:'],
      bullets: ['Selalu uji kode QR Anda dengan beberapa aplikasi pemindai sebelum mencetak.', 'Gunakan Galat Koreksi H (Tinggi) ketika menambahkan overlay.', 'Jaga setidaknya 4 modul zona tenang (margin).', 'Pastikan kontras tinggi antara latar depan dan latar belakang.', 'Untuk pencetakan, gunakan setidaknya 300 DPI dan uji pada ukuran cetak yang sebenarnya.', 'Aktifkan Pertahankan Pola Pencari ketika memakai overlay.', 'Mulailah dengan intensitas overlay lebih rendah dan meningkat secara bertahap.', 'Untuk penggunaan di luar ruangan, pertimbangkan ukuran modul yang lebih besar dan koreksi kesalahan yang lebih tinggi.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Ramban artikel Pelajari', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
      ],
    },
    {
      heading: 'Penelusuran masalah',
      paragraphs: ['Masalah dan solusi umum:'],
      bullets: ['QR tidak akan memindai: Kurangi intensitas overlay, peningkatan koreksi kesalahan, cek kontras.', 'Kode terlalu besar: Kurangi panjang isi, gunakan pengpendek URL, versi lebih rendah.', 'Keluaran Blurry: Naikkan ukuran modul, gunakan PNG daripada format terkompresi.', 'Warna terlihat salah: Periksa kontras warna, coba mode overlay skala abu-abu.', 'GIF tidak animasi: Pastikan menggunakan keluaran format GIF, periksa jumlah frame.', 'Gambar overlay tidak loading: Periksa izin CORS pada gambar jarak jauh.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Lihat panduan dan contoh terkait', type: 'learn' }],
    },
    {
      heading: 'Pintas Papan Ketik',
      paragraphs: ['ANQR mendukung pintasan papan tik standar. Gunakan Ctrl / Cmd + S untuk memicu ekspor (ketika difokuskan pada pratinjau).'],
    },
    {
      heading: 'Berbagi & Embedding',
      paragraphs: ['Dalam mode Profesional, klik tombol Share untuk menyalin URL dengan pengaturan Anda saat ini. Penerima dapat membuka URL ini untuk melihat konfigurasi tepat Anda. Catatan: Gambar overlay dari berkas lokal tidak dapat dibagikan melalui URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Coba konfigurasi ini langsung di generator ANQR.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Ramban artikel Pelajari', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Lihat contoh QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Buka generator', type: 'generator' },
  ],
};

export default guide;
