import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Panduan Pengguna ANQR',
  description: 'Panduan lengkap menggunakan ANQR untuk membuat kod QR.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buka penjana', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Semak imbas artikel Pelajari', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Bermula',
      paragraphs: [
        'ANQR ialah penjana kod QR dengan pendekatan mengutamakan pelanggan. Secara lalai, kod QR dijana secara setempat dalam penyemak imbas anda - tiada akaun diperlukan dan data anda kekal peribadi. Untuk pembenaman profesional, anda juga boleh menggunakan API bahagian pelayan.',
        'Antara muka mempunyai tiga peringkat antara muka: Asas, Lanjutan dan Profesional. Pilih tahap anda menggunakan tab dalam pengepala. Setiap peringkat membuka kunci ciri tambahan sambil memastikan antara muka tertumpu pada perkara yang anda perlukan.',
      ],
      bullets: [
        'Asas: Penciptaan kod QR mudah dengan kandungan teks/URL biasa dan tindanan imej.',
        'Lanjutan: Pilihan pengekodan QR, gaya pemaparan, animasi, format output, jenis kandungan lanjutan dan penyesuaian tindanan.',
        'Profesional: Tera air, metadata, perkongsian, analisis keselamatan, kod QR pembayaran dan ciri perusahaan.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Buka penjana', type: 'generator' }],
    },
    {
      heading: 'Mula Pantas',
      paragraphs: ['Untuk membuat kod QR pertama anda:'],
      bullets: [
        '1. Pilih jenis kandungan (URL, teks, WiFi, dll.) daripada menu lungsur Jenis Kandungan.',
        '2. Masukkan data anda dalam medan yang disediakan.',
        '3. Sesuaikan warna, gaya dan tambah imej tindanan secara pilihan.',
        '4. Klik Eksport untuk memuat turun kod QR anda sebagai PNG, GIF, WebP atau SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Ciri-ciri Asas',
      paragraphs: [
        'Tahap Asas menyediakan antara muka yang diperkemas untuk mencipta kod QR dengan kandungan muatan dan tindanan imej. Ini adalah cara paling mudah untuk bermula.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Jenis Kandungan (Asas)',
      paragraphs: [
        'Teks Biasa: Kodkan sebarang teks sehingga had kapasiti kod QR. Sesuai untuk mesej ringkas, kod atau pengecam.',
        'URL: Mengekodkan alamat web. Kod QR akan membuka URL apabila diimbas. Menyokong protokol http:// dan https://.',
      ],
    },
    {
      heading: 'Tindanan Imej (Asas)',
      paragraphs: [
        'Muat naik imej (JPG, PNG, GIF, WebP) untuk digabungkan dengan kod QR anda. Ciri tindanan asas termasuk:',
      ],
      bullets: [
        'Muat naik daripada fail: Pilih imej daripada peranti anda.',
        'Muatkan dari URL: Masukkan URL imej (mesti membenarkan CORS).',
        'Logo Pusat: Meletakkan imej di tengah, bergantung pada pembetulan ralat.',
        'Campuran: Campuran alfa ringkas imej dengan corak QR.',
        'Intensiti: Mengawal seberapa kuat tindanan mempengaruhi kod QR (0-100%).',
        'Mod Warna: Warna Penuh, Skala Kelabu atau Hitam & Putih.',
        'Kekalkan Corak Pencari: Pastikan corak sudut tidak diubah suai untuk pengimbasan yang boleh dipercayai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Ciri Lanjutan',
      paragraphs: [
        'Tahap Lanjutan membuka kunci pilihan pengekodan QR, gaya pemaparan, animasi, format output, jenis kandungan lanjutan dan penyesuaian tindanan lanjutan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tetapan Pengekodan QR',
      paragraphs: [
        'Versi: Kod QR datang dalam versi 1-40, dengan versi yang lebih tinggi menyimpan lebih banyak data tetapi lebih besar. Tetapkan kepada 0 (Auto) untuk membenarkan ANQR memilih versi terkecil yang sesuai dengan kandungan anda.',
        'Pembetulan Ralat: Menentukan berapa banyak kerosakan yang boleh dialami oleh kod QR sambil kekal boleh diimbas.',
      ],
      bullets: [
        'L (Rendah): 7% pembetulan ralat - saiz terkecil, redundansi paling sedikit.',
        'M (Sederhana): 15% pembetulan ralat - pilihan seimbang.',
        'Q (Kuartil): 25% pembetulan ralat - bagus untuk kod bercetak.',
        'H (Tinggi): 30% pembetulan ralat - terbaik untuk kod dengan tindanan atau dalam keadaan yang teruk.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Zon Tenang (Margin)',
      paragraphs: [
        'Zon senyap ialah ruang putih di sekeliling kod QR. Pengimbas memerlukan margin ini untuk mengesan tempat kod bermula. Piawaian mengesyorkan sekurang-kurangnya 4 modul. Mengurangkan di bawah 4 boleh menyebabkan masalah pengimbasan.',
      ],
    },
    {
      heading: 'Gaya Modul',
      paragraphs: ['Modul ialah petak individu yang membentuk kod QR. ANQR menawarkan lima gaya:'],
      bullets: [
        'Segi empat: Penampilan QR klasik dengan bucu tajam.',
        'Bulat: Sudut lembut untuk penampilan yang lebih mesra.',
        'Titik: Modul bulat untuk estetika moden.',
        'Berlian: segi empat sama berpusing 45° untuk corak tersendiri.',
        'Bersambung: Modul bergabung apabila bersebelahan, menghasilkan bentuk organik.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Gaya Corak Pencari',
      paragraphs: [
        'Corak pencari ialah tiga petak besar di sudut QR yang membantu pengimbas mengorientasikan kod. Gaya yang tersedia:',
      ],
      bullets: [
        'Segi empat: Sudut segi empat sama standard.',
        'Bundar: Bucu lembut sepadan dengan gaya modul bulat.',
        'Bulatan: Corak pencari bulat untuk kod gaya titik.',
      ],
    },
    {
      heading: 'Penjajaran & Corak Masa',
      paragraphs: [
        'Corak penjajaran muncul dalam kod QR yang lebih besar (versi 2+) untuk membantu membetulkan herotan. Corak masa ialah garisan bergantian yang menghubungkan corak pencari.',
      ],
      bullets: [
        'Gaya Penjajaran: Pencari Padanan, Segi Empat, Bulat atau Bulatan.',
        'Gaya Pemasa: Modul Padanan, Pepejal atau Putus-putus.',
      ],
    },
    {
      heading: 'warna',
      paragraphs: [
        'Latar Depan: Warna modul QR. Hitam (#000000) adalah standard tetapi mana-mana warna gelap berfungsi.',
        'Latar Belakang: Warna latar belakang. Putih (#ffffff) adalah standard. Pastikan kontras yang mencukupi dengan latar depan.',
        'Latar Belakang Lutsinar: Keluarkan latar belakang sepenuhnya untuk digunakan pada permukaan berwarna. Pastikan permukaan memberikan kontras yang mencukupi.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Saiz & Jurang Modul',
      paragraphs: [
        'Saiz Modul: Mengawal berapa besar setiap modul dipaparkan dalam piksel. Nilai yang lebih besar menghasilkan kod yang lebih besar dan lebih mudah untuk diimbas.',
        'Jurang Modul: Menambah ruang antara modul sebagai peratusan. Jurang kecil (5-15%) boleh meningkatkan kebolehimbasan dalam sesetengah keadaan tetapi jurang yang berlebihan mengurangkan kebolehpercayaan.',
      ],
    },
    {
      heading: 'Tetapan Output',
      paragraphs: ['Format: Pilih format eksport anda berdasarkan kes penggunaan.'],
      bullets: [
        'PNG: Format raster tanpa rugi, sesuai untuk kebanyakan kegunaan. Terbaik untuk cetakan dan digital.',
        'WebP: Format moden dengan saiz fail yang lebih kecil. Baik untuk kegunaan web.',
        'GIF: Diperlukan untuk kod QR animasi. Menyokong ketelusan.',
        'SVG: Format vektor yang berskala tidak terhingga. Terbaik untuk cetakan besar atau apabila anda perlu mengedit kod.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Dimensi Output',
      paragraphs: [
        'Lebar/Tinggi: Tetapkan saiz output dalam piksel. Untuk cetakan, kira berdasarkan DPI (cth., 300 DPI pada 1 inci = 300px). Saiz yang lebih besar mengimbas dengan lebih dipercayai pada jarak.',
      ],
    },
    {
      heading: 'Tetapan Animasi (Lanjutan)',
      paragraphs: ['Kawal tingkah laku kod QR animasi:'],
      bullets: [
        'Kelajuan: Kadar bingkai animasi dalam milisaat.',
        'Gelung: Animasi berterusan atau satu main.',
        'Lantunan: Arah animasi ping-pong.',
        'Bingkai Mula: Mulakan animasi daripada bingkai tertentu.',
        'Bingkai Maks: Hadkan jumlah bingkai dalam animasi.',
        'Langkah Bingkai: Langkau bingkai untuk animasi yang lebih pantas.',
        'Interpolasi: Tiada, Crossfade atau Morph antara bingkai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Jenis Kandungan (Lanjutan)',
      paragraphs: ['Tahap lanjutan membuka kunci format muatan tambahan:'],
      bullets: [
        'Nombor Telefon (tel:): Mencipta pautan telefon boleh dipanggil.',
        'E-mel (mailto:): Membuka klien e-mel dengan subjek dan kandungan pilihan.',
        'SMS: Mesej teks pra-isi ke nombor telefon.',
        'vCard: Kad hubungan penuh dengan nama, organisasi, telefon, e-mel, alamat.',
        'MeCard: Format hubungan padat yang popular di Jepun.',
        'BizCard: Format kad perniagaan warisan.',
        'Lokasi Geo: Koordinat GPS yang dibuka dalam peta.',
        'WiFi: Bukti kelayakan rangkaian untuk sambungan automatik (SSID, kata laluan, jenis keselamatan).',
        'Acara Kalendar: Format iCalendar dengan tajuk, lokasi, tarikh/masa.',
        'RSVP Acara: Pautan ke halaman pendaftaran acara.',
        'Langgan Kalendar: Langgan suapan ICS/WebCal.',
        'URL Fail/Dokumen: Pautan terus ke fail yang boleh dimuat turun.',
        'Pautan Storan Awan: Pautan ke Google Drive, Dropbox, OneDrive, dsb.',
        'Profil Sosial: Pautan ke LinkedIn, Twitter, Instagram, dsb.',
        'Pautan Pemesejan: WhatsApp, Telegram, Pautan dalam isyarat.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ciri Tindanan Lanjutan',
      paragraphs: ['Keupayaan tindanan tambahan:'],
      bullets: [
        'Pangkas: Dayakan pemangkasan untuk memilih kawasan segi empat sama imej anda.',
        'Halftone: Corak titik gaya cetakan klasik berdasarkan kecerahan imej.',
        'Dithered: Ralat resapan dithering untuk pembiakan terperinci.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mod Campuran Tindanan (Lanjutan)',
      paragraphs: ['Mod campuran tambahan dalam tahap Lanjutan:'],
      bullets: [
        'Subpiksel: Membahagikan setiap modul kepada subpiksel untuk perincian yang lebih tinggi.',
        'Blue Noise: Menggunakan blue noise dithering untuk corak tanpa artifak.',
        'Mozek: Kesan berasaskan jubin memelihara struktur imej.',
        'Pengisian Jurang: Meletakkan imej dalam jurang antara modul.',
        'Kecerahan: Mengubah saiz modul berdasarkan kecerahan imej.',
        'Duotone: Peta imej kepada dua warna untuk kontras yang menarik.',
      ],
    },
    {
      heading: 'Intensiti Tindanan',
      paragraphs: [
        'Mengawal seberapa kuat tindanan mempengaruhi kod QR (0-100%). Nilai yang lebih tinggi menunjukkan lebih banyak butiran imej tetapi mungkin mengurangkan kebolehimbasan. Mulakan sekitar 70% dan laraskan berdasarkan ujian.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Mod Warna',
      paragraphs: ['Cara imej tindanan diproses:'],
      bullets: [
        'Warna Penuh: Mengekalkan warna imej asal.',
        'Skala kelabu: Menukar kepada ton hitam dan putih.',
        'Hitam & Putih: Penukaran binari kontras tinggi.',
      ],
    },
    {
      heading: 'Kekalkan Corak Finder',
      paragraphs: [
        'Apabila didayakan, pastikan corak pencari tiga penjuru tidak diubah suai oleh tindanan. Sangat disyorkan untuk pengimbasan yang boleh dipercayai.',
      ],
    },
    {
      heading: 'Prapemprosesan Imej',
      paragraphs: [
        'Gunakan penapis pada imej tindanan anda sebelum mengadun. Pelarasan ini boleh menambah baik cara imej muncul dalam kod QR akhir.',
      ],
      bullets: [
        'Kecerahan (-100 hingga +100): Cerahkan atau gelapkan imej.',
        'Kontras (-100 hingga +100): Menambah atau mengurangkan julat tonal.',
        'Gamma (0.2 hingga 3.0): Pelarasan kecerahan bukan linear. Nilai di bawah 1 mencerahkan nada tengah, di atas 1 menggelapkannya.',
        'Ketepuan (-100 hingga +100): Keamatan warna. -100 adalah skala kelabu, +100 adalah terlalu tepu.',
        'Putar Hue (0-360°): Alihkan semua warna di sekeliling roda warna.',
        'Kabur (0-20px): Lembutkan butiran imej.',
        'Tajam (0-100%): Tingkatkan tepi dan butiran.',
        'Posterize (0-16 tahap): Kurangkan tahap warna untuk kesan poster.',
        'Ambang (0-255): Tukar kepada binari hitam/putih pada titik potong.',
        'Pengesanan Tepi: Algoritma Sobel atau Canny untuk menunjukkan tepi sahaja.',
        'Songsang: Balikkan semua warna.',
      ],
    },
    {
      heading: 'Mod Fit',
      paragraphs: ['Cara imej tindanan sesuai dengan kawasan kod QR:'],
      bullets: [
        'Muka depan: Imej memenuhi seluruh kawasan, memangkas jika perlu.',
        'Mengandungi: Keseluruhan imej kelihatan, mungkin mempunyai jidar.',
        'Regangan: Imej herot untuk diisi dengan tepat.',
      ],
    },
    {
      heading: 'Pilihan Transformasi',
      paragraphs: [
        'Putaran: Putar tindanan dalam kenaikan 90°.',
        'Flip X/Y: Cerminkan imej secara mendatar atau menegak.',
      ],
    },
    {
      heading: 'Algoritma Dithering',
      paragraphs: [
        'Dithering menukar imej nada berterusan kepada corak yang boleh diwakili oleh kod QR. Tersedia apabila menggunakan mod campuran Dithered, Blue Noise atau True Dither.',
      ],
      bullets: [
        'Penyebaran Ralat: Gaya Floyd-Steinberg Klasik. Menyebarkan ralat pengkuantitian ke piksel jiran.',
        'Dipesan (Bayer): Menggunakan matriks ambang untuk corak biasa.',
        'Titik Berkelompok: Mensimulasikan pencetakan halftone.',
        'Void & Kluster: Dithering tertib yang dioptimumkan.',
        'Bunyi Biru: Corak yang kelihatan rawak dari segi visual.',
        'Ambang Bunyi Biru: Ambang ambang dengan tekstur hingar biru.',
        'White Noise: Dithering ambang rawak.',
        'Bunyi Gaussian/Segi Tiga: Bunyi dengan taburan yang berbeza.',
        'Blue Noise + Error Diffusion: Hibrid menggabungkan kedua-dua teknik.',
        'Bunyi Biru Disaring: Corak hingar biru seperti skrin.',
        'Persepsi: Berwajaran cahaya untuk hasil visual yang lebih baik.',
        'Edge-Aware: Mengekalkan tepi imej semasa dithering.',
        'Ambang Adaptif: Ambang Adaptif setempat.',
        'Bunyi Biru Temporal: Untuk GIF animasi, berbeza-beza corak setiap bingkai.',
      ],
    },
    {
      heading: 'Inti resapan',
      paragraphs: ['Apabila menggunakan Ralat Diffusion dithering, pilih cara ralat diedarkan:'],
      bullets: [
        'Floyd-Steinberg: Resapan 4 jiran klasik. Pilihan umum yang baik.',
        'Jarvis-Judice-Ninke: 12-jiran, lebih lancar tetapi lebih perlahan.',
        'Stucki: Serupa dengan JJN dengan berat yang berbeza.',
        'Burkes: JJN yang dipermudahkan, lebih pantas.',
        'Sierra: Keluarga isirong mengimbangi kualiti dan kelajuan.',
        'Atkinson: Resapan cahaya, mengekalkan perincian tetapi boleh menjadi berbutir.',
      ],
    },
    {
      heading: 'Kekuatan Dither',
      paragraphs: [
        'Mengawal berapa banyak dithering digunakan (0-100%). Nilai yang lebih rendah mengekalkan lebih banyak corak asal, nilai yang lebih tinggi menunjukkan lebih banyak butiran imej.',
      ],
    },
    {
      heading: 'Tetapan Subpiksel',
      paragraphs: ['Apabila menggunakan mod campuran Subpiksel:'],
      bullets: [
        'Saiz Grid: 2×2, 3×3 atau 4×4 subpiksel setiap modul. Lebih tinggi = lebih terperinci.',
        'Peraturan Pusat: Ketat memerlukan subpiksel tengah untuk memadankan modul. Halftone Center membenarkan variasi.',
        'Warna Neutral: Warna digunakan untuk subpiksel yang tidak ditentukan.',
        'Finder Override: Cara corak pencari dipaparkan (Pepejal atau Bergaya).',
      ],
    },
    {
      heading: 'Tetapan Halftone',
      paragraphs: ['Apabila menggunakan mod campuran Halftone:'],
      bullets: [
        'Saiz Sel: Setiap Modul atau grid N×N.',
        'Bentuk Titik: Bulatan, Segi Empat atau Garisan.',
        'Lengkung Kecerahan: Linear, Lengkung S atau Gamma.',
      ],
    },
    {
      heading: 'Warna Duotone',
      paragraphs: [
        'Apabila menggunakan mod campuran Duotone, tetapkan warna Bayang-bayang (kawasan gelap) dan Warna Serlahkan (kawasan terang).',
      ],
    },
    {
      heading: 'Tetapan Animasi GIF',
      paragraphs: ['Apabila menggunakan tindanan GIF animasi:'],
      bullets: [
        'Gunakan Kelewatan Bingkai: Hormati pemasaan GIF asal.',
        'FPS Maks: Hadkan kadar bingkai (1-60 fps).',
        'Pengendalian Pelupusan: Hormati atau Permudahkan kaedah pelupusan bingkai.',
      ],
    },
    {
      heading: 'Pilihan Paparan Lanjutan',
      paragraphs: ['Kawalan pemaparan tambahan:'],
      bullets: [
        'Mod Jurang: Tiada, Inset, Strok atau Penggayaan jurang Negatif Space.',
        'Jejari Sudut: Peratusan bucu bulat untuk modul.',
        'Kecerunan: Tiada, Kecerunan Linear, Jejari atau Kon pada modul.',
        'Gaya Luar/Dalaman Mata: Penggayaan bebas untuk cincin corak pencari.',
        'Putaran Titik: Putar modul berlian/titik.',
        'Skala Mata: Pelarasan saiz untuk corak pencari.',
        'Gaya Bingkai: Tambahkan bingkai hiasan (Bingkai Bulat, Pelekat, Tag).',
        'Teks Bingkai: Tambahkan teks seperti "Imbas Saya!" kepada bingkai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pengekodan QR Lanjutan',
      paragraphs: ['Perhalusi pengekodan QR:'],
      bullets: [
        'Mod Pengekodan: Auto, Angka, Alphanumeric, Byte/UTF-8 atau Kanji.',
        'Kuatkuasakan Zon Senyap Min: Pastikan sekurang-kurangnya 4 margin modul.',
        'Corak Topeng: Auto (optimum), atau pilih corak 0-7 secara manual untuk mengawal pengedaran modul. Corak yang berbeza mencipta penampilan visual yang berbeza sambil mengekod data yang sama.',
        'Pengekodan Aksara: ISO-8859-1 (Latin-1 lalai), UTF-8 (Unikod penuh termasuk emoji), atau Shift-JIS (Bahasa Jepun). Pilih berdasarkan keperluan aksara kandungan anda.',
      ],
    },
    {
      heading: 'Pilihan Output Lanjutan',
      paragraphs: ['Tetapan eksport tambahan:'],
      bullets: [
        'Nama fail: Nama fail tersuai untuk muat turun.',
        'Saiz Palet GIF: 2-256 warna dalam output GIF.',
        'GIF Quantizer: Pengurangan warna Median Cut, NeuQuant atau Octree.',
        'GIF Dithering: Mati, Floyd-Steinberg atau Dipesan.',
        'Warna Telus GIF: Tetapkan warna menjadi lutsinar.',
        'SVG True Vector: Gunakan laluan dan bukannya raster terbenam.',
        'Ketepatan Bentuk SVG: Penyampaian laluan Piksel atau Tepat.',
        'Tindanan Raster Benam SVG: Sertakan tindanan sebagai imej terbenam.',
        'Penggantian Latar Belakang: Paksa warna latar belakang tertentu dalam output.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pilihan Pengesahan',
      paragraphs: ['Tetapan pemprosesan input:'],
      bullets: [
        'Sahkan Input: Semak format kandungan sebelum pengekodan.',
        'Potong Ruang Putih: Alih keluar ruang hadapan/belakang.',
        'Normalize Newlines: Tukar semua pengakhiran baris kepada LF.',
        'Pengawal Panjang Maks: Beri amaran jika kandungan melebihi kapasiti QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Ciri-ciri Profesional',
      paragraphs: [
        'Tahap Profesional menambah tera air, metadata, pilihan perkongsian, analisis keselamatan, kod QR pembayaran dan ciri perusahaan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tera air',
      paragraphs: ['Tambahkan tera air pada kod QR anda:'],
      bullets: [
        'Jenis: Teks, Imej atau Tera air Corak.',
        'Kedudukan: Tengah, Sudut, Tepi, Belakang atau Zon Tenang.',
        'Kelegapan: Ketelusan tera air (0-100%).',
        'Mod Campuran: Campuran Biasa, Darab, Skrin atau Tindanan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Benamkan metadata dalam fail yang dieksport:'],
      bullets: [
        'Medan Tajuk, Pengarang, Hak Cipta, Lesen, Penerangan.',
        'Masa Penciptaan: Benamkan cap masa penjanaan.',
        'Nilai Kunci Tersuai: Tambahkan pasangan metadata arbitrari.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Berkongsi',
      paragraphs: ['Kongsi konfigurasi kod QR anda:'],
      bullets: [
        'Pautan Terus: Hasilkan URL yang boleh dikongsi dengan tetapan semasa anda.',
        'Benamkan HTML: Dapatkan kod benam untuk tapak web.',
        'Parameter Pengekodan: Sertakan semua tetapan dalam URL kongsi.',
        'Nota: Imej tindanan daripada fail tempatan tidak boleh dikongsi melalui URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Analisis Keselamatan',
      paragraphs: ['Pastikan kod QR kekal boleh diimbas:'],
      bullets: [
        'Mod Keselamatan: Mati, Seimbang atau Keperluan pengimbasan yang ketat.',
        'Saiz Modul Min: Saiz piksel minimum bagi setiap modul.',
        'Zon Senyap Min: Modul margin minimum.',
        'Pencari Kunci/Masa/Jajar/Format/Versi: Lindungi elemen tertentu.',
        'Intensiti Tindanan Maks oleh ECC: Had keamatan automatik berdasarkan tahap pembetulan ralat.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Jenis Kandungan (Profesional)',
      paragraphs: ['Tahap profesional menambah jenis kandungan pembayaran dan perusahaan:'],
      bullets: [
        'EPC/SEPA (EU): Kod QR pindahan bank Eropah dengan IBAN, BIC, amaun, rujukan.',
        'UPI (India): Antara Muka Pembayaran Disatukan dengan VPA, nama penerima, amaun.',
        'PayNow (Singapura): Pembayaran pantas Singapura dengan UEN atau nombor mudah alih.',
        'PromptPay (Thailand): Sistem pembayaran negara Thai.',
        'PIX (Brazil): Pembayaran segera Brazil dengan kunci PIX.',
        'Kripto: Alamat pembayaran Bitcoin, Ethereum, Litecoin dengan jumlah pilihan.',
        'Pautan Kempen Pemasaran: URL dengan penjejakan parameter UTM penuh (Teg Pemasaran).',
        'Pautan Pendek: Untuk digunakan dengan pemendek URL untuk kod QR dinamik/boleh dikesan.',
        'Pautan Digital GS1: Pengenalan produk dengan GTIN, bersiri, kelompok, tamat tempoh.',
        'Pautan Dalam Apl: Pautan dalam apl iOS/Android dengan skema tersuai.',
        'Format Tersuai: Data mentah tanpa pemformatan atau pengesahan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Pembayaran Berkaitan Bahasa dalam Mod Lanjutan',
      paragraphs: [
        'Apabila menggunakan mod Lanjutan, ANQR secara automatik menunjukkan kaedah pembayaran yang berkaitan dengan bahasa pilihan anda. Sebagai contoh, pengguna Vietnam melihat VietQR, pengguna Thai melihat PromptPay, dan pengguna bahasa India melihat UPI dan BharatQR. Kaedah pembayaran global (mata wang kripto, PayPal, Apl Tunai) tersedia untuk semua bahasa. Mod profesional membuka kunci semua standard pembayaran tanpa mengira bahasa.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Piawaian Pembayaran Eropah',
      bullets: [
        'EPC/SEPA (EU): Kod QR pindahan bank Eropah mengikut Piawaian Kod QR EPC. Menyokong IBAN, BIC (pilihan untuk domestik), jumlah dalam EUR dan rujukan pembayaran berstruktur atau tidak berstruktur. Digunakan merentasi zon SEPA termasuk negara EU serta Switzerland, Norway, Iceland, Liechtenstein, Monaco dan San Marino.',
        'Bil QR Switzerland: Standard pembayaran Switzerland mengikut ENAM Garis Panduan Pelaksanaan. Menyokong CHF dan EUR, Rujukan QR (QRR), Rujukan Pemiutang (ISO 11649), alamat pemiutang/penghutang berstruktur dan maklumat bil. Diperlukan untuk invois Switzerland sejak 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Piawaian Pembayaran India',
      bullets: [
        'UPI (India): Antara Muka Pembayaran Disatukan mengikut Spesifikasi Pautan Dalam NPCI. Menyokong VPA (Alamat Pembayaran Maya), nama penerima, jumlah dalam INR, nota transaksi, ID rujukan, kod kategori pedagang dan mod transaksi.',
        'BharatQR (India): Standard QR bersatu yang menyokong kedua-dua UPI dan pembayaran berasaskan kad. Menggabungkan UPI VPA dengan kad PAN untuk keserasian maksimum. Termasuk nama pedagang, bandar, MCC, butiran GST dan nombor invois/rujukan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Piawaian Pembayaran Asia Tenggara',
      bullets: [
        'PayNow (Singapura): Sistem pembayaran pantas Singapura menggunakan spesifikasi QR EMVCo dengan profil SGQR. Menyokong UEN (pendaftaran perniagaan), nombor mudah alih atau NRIC sebagai pengecam proksi. Termasuk bendera keboleheditan jumlah dan tarikh luput.',
        'PromptPay (Thailand): Sistem pembayaran negara Thai mengikut profil EMV Bank of Thailand. Menyokong nombor mudah alih, ID kebangsaan, ID cukai, ID e-dompet dan pembayaran bil dengan pelbagai medan rujukan.',
        'QRIS (Indonesia): Kod Respons Pantas Standard Indonesia. Standard pembayaran nasional berasaskan EMV menyokong ID pedagang, NMID (National Merchant ID), klasifikasi kriteria pedagang dan yuran kemudahan (tetap atau peratusan).',
        'DuitNow (Malaysia): Sistem pembayaran segera Malaysia. Menyokong berbilang jenis proksi termasuk NRIC, mudah alih, pasport, ID tentera dan nombor pendaftaran perniagaan.',
        'VietQR (Vietnam): Piawaian pemindahan antara bank Vietnam. Memerlukan BIN bank (pengenalan NAPAS) dan nombor akaun. Menyokong berbilang kod perkhidmatan untuk jenis pemindahan yang berbeza (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Filipina): Standard pembayaran QR Filipina untuk InstaPay dan PESONet. Menggunakan nombor akaun dengan pengenalan saudagar untuk transaksi P2M (orang-ke-peniaga).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Piawaian Pembayaran Asia Timur',
      bullets: [
        'TWQR (Taiwan): Piawaian pembayaran QR Taiwan. Menyokong ID pedagang, ID cukai dan jumlah TWD.',
        'HKQR/FPS (Hong Kong): Kod QR Sistem Pembayaran Lebih Cepat Hong Kong. Menyokong ID FPS, nombor mudah alih atau e-mel sebagai pengecam pembayaran. Jumlah dalam HKD.',
        'JPQR (Jepun): Piawaian pembayaran kod QR bersatu Jepun. Menggunakan ID kedai untuk pengenalan pedagang dengan jumlah JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Piawaian Pembayaran Serantau Lain',
      bullets: [
        'PIX (Brazil): Sistem pembayaran segera Bank Pusat Brazil mengikut spesifikasi Kod BR. Menyokong kunci PIX (CPF, CNPJ, e-mel, telefon atau kunci rawak), nama pedagang/bandar, ID transaksi dan amaun BRL.',
        'AusPayNet/NPP PayID (Australia): Sistem PayID Platform Pembayaran Baharu Australia. Menyokong jenis PayID (e-mel, mudah alih, ABN, ID organisasi) atau nombor akaun BSB + tradisional. Nama pedagang adalah pilihan kerana pembayar melihat nama berdaftar daripada carian NPP.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pembayaran Cryptocurrency',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): URI pembayaran mata wang kripto standard dengan alamat dompet, jumlah pilihan dan label. Serasi dengan semua dompet Bitcoin dan Litecoin utama.',
        'Rangkaian Kilat (BOLT11): Invois pembayaran Rangkaian Kilat. Tampal rentetan invois yang dikodkan BOLT11 untuk pembayaran Bitcoin segera dengan bayaran yang minimum.',
        'Ethereum (EIP-681): Transaksi Ethereum meminta URI yang menyokong pemindahan ETH asli dan pemindahan token ERC-20. Termasuk ID rantaian untuk sokongan berbilang rangkaian (Mainnet, Poligon, BSC, Arbitrum, Optimisme, Avalanche), parameter gas dan panggilan fungsi kontrak.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Perkhidmatan Pautan Pembayaran',
      bullets: [
        'PayPal.Me: Pautan pembayaran PayPal dengan nama pengguna dan jumlah pra-isi pilihan. Penerima boleh membayar melalui baki PayPal, kad atau akaun bank.',
        'Apl Tunai: Pautan pembayaran Apl Tunai menggunakan $cashtag dengan jumlah pilihan. Popular di Amerika Syarikat untuk pembayaran peer-to-peer.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR EMV generik',
      bullets: [
        'EMV Generik: Cipta kod QR Mod Persembahan Pedagang EMV tersuai untuk skim pembayaran yang tidak disenaraikan secara khusus. Konfigurasikan nama pedagang, bandar, kod negara (ISO 3166-1), kod mata wang (numerik ISO 4217), MCC, pilihan petua/yuran kemudahan dan medan data tambahan. Berguna untuk ujian atau penyepaduan tersuai.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Mod Campuran Tindanan (Profesional)',
      paragraphs: ['Mod campuran tambahan dalam tahap Profesional:'],
      bullets: [
        'Pixelate: Kesan tindanan piksel.',
        'Rangka: Tindanan pengesanan tepi hanya menunjukkan kontur.',
        'Gelombang: Kesan herotan beralun.',
        'Saiz Subpiksel: Saiz subpiksel berubah berdasarkan imej.',
        'True Dither: Dithering lanjutan dengan pemilihan matriks tersusun.',
        'Melampau: Keterlihatan imej maksimum, boleh menjejaskan kebolehimbasan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tetapan Perlindungan',
      paragraphs: [
        'Kawalan halus ke atas elemen QR yang dilindungi daripada pengubahsuaian tindanan:',
      ],
      bullets: [
        'Kekalkan Masa: Pastikan corak pemasaan tidak diubah suai.',
        'Kekalkan Penjajaran: Pastikan corak penjajaran tidak diubah suai.',
        'Lindungi Maklumat Format: Modul maklumat format perisai.',
        'Lindungi Maklumat Versi: Perisai modul maklumat versi.',
      ],
    },
    {
      heading: 'Mod ECC-Aware',
      paragraphs: [
        'Pintar mengedarkan keamatan tindanan berdasarkan kapasiti pembetulan ralat. Sistem menganalisis modul mana yang boleh diubah suai sambil mengekalkan kebolehimbasan.',
      ],
      bullets: [
        'Belanjawan Risiko: Peratusan kapasiti pembetulan ralat untuk digunakan (0-100%).',
        'Belanjawan lebih tinggi = tindanan lebih kelihatan tetapi kebolehimbasan lebih berisiko.',
        'Belanjawan lebih rendah = pengimbasan lebih selamat tetapi tindanan kurang kelihatan.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pilihan Rendering Profesional',
      paragraphs: ['Kawalan pemaparan lanjutan:'],
      bullets: [
        'Tepi Renyah: Gunakan pemaparan imej berpiksel untuk tepi modul yang tajam.',
        'Pixel Snap: Penjajaran piksel Lantai, Bulat atau Siling.',
        'Mod Warna Per-Modul: Pepejal, Mengikut Kecerahan, Mengikut Kedudukan, Mengikut Tindanan, Mengikut Kelompok.',
        'Palet Warna: Tentukan palet warna tersuai untuk pewarnaan setiap modul.',
        'Pengawal Kontras: Pastikan nisbah kontras minimum antara warna.',
        'Nisbah Kontras Min: Keperluan kontras gaya WCAG (1:1 hingga 21:1).',
        'Modul Sempadan Tambahan: Sempadan tambahan di luar zon tenang.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Pilihan Output Profesional',
      paragraphs: ['Tetapan eksport perusahaan:'],
      bullets: [
        'DPI: Tetapkan resolusi cetakan (72-600 DPI). 300 DPI disyorkan untuk cetakan.',
        'Sertakan Zon Tenang: Togol zon senyap dalam dimensi output.',
        'Eksport Sebagai Tambahan: Jana PDF bersama format utama.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tetapan Animasi (Profesional)',
      paragraphs: ['Ciri animasi profesional tambahan:'],
      bullets: [
        'Kekacauan Temporal: Mati, Bunyi Biru atau Flicker Safe setiap bingkai dithering.',
        'Corak: Tiada, Denyutan, Gelombang, Garis Imbasan, Shimmer atau kesan Drift.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Rujukan API',
      paragraphs: [
        'ANQR menyediakan API bahagian pelayan untuk menjana kod QR melalui parameter URL. Ini sesuai untuk membenamkan kod QR dalam tapak web, e-mel, dokumen atau aliran kerja automatik tanpa JavaScript sisi pelanggan.',
        'URL asas: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' }],
    },
    {
      heading: 'Parameter Asas',
      paragraphs: ['Parameter yang diperlukan dan biasa (nama parameter tidak diterjemahkan):'],
      bullets: [
        'data (diperlukan): Kandungan untuk dikodkan dalam kod QR. URL-encode aksara khas.',
        'saiz: Saiz imej dalam piksel (lalai: 400, maks: 2000). Digunakan jika w/j tidak dinyatakan.',
        'w, h: Lebar dan ketinggian output dalam piksel. Mengatasi parameter saiz.',
        'format: Format output - png, webp atau gif (lalai: png).',
        'ec: Tahap pembetulan ralat - L, M, Q atau H (lalai: H).',
        'fg: Warna latar depan sebagai hex tanpa # (lalai: 000000).',
        'bg: Warna latar belakang sebagai heks tanpa # (lalai: ffffff).',
        'lutsinar: Tetapkan kepada 1 untuk latar belakang lutsinar.',
        'margin: Zon senyap dalam modul (lalai: 4).',
      ],
    },
    {
      heading: 'Parameter Penggayaan',
      paragraphs: ['Penggayaan modul dan corak:'],
      bullets: [
        'gaya: Gaya modul - segi empat sama, bulat, titik, berlian, bersambung.',
        'pencari: Gaya corak pencari - segi empat sama, bulat, bulatan.',
        'jajaran: Gaya corak penjajaran - pencari_madani, segi empat sama, bulat, bulatan.',
        'pemasaan: Gaya corak pemasaan - modul_padan, pepejal, putus-putus.',
        'jejari: Peratus jejari penjuru 0-100.',
        'jurang: Peratusan jurang modul 0-50.',
        'gapMode: Mod gap - tiada, inset, stroke, negative_space.',
        'eyeOuter, eyeInner: Gaya mata - segi empat sama, bulat, bulatan.',
        'Skala mata: Peratusan skala mata (lalai: 100).',
        'grad: Jenis kecerunan - tiada, linear, jejari, kon.',
        'gradAngle: Sudut kecerunan untuk kecerunan linear.',
        'gradStops: Kecerunan berhenti sebagai color1,pos1,color2,pos2,... (cth., ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Parameter Tindanan',
      paragraphs: ['Pilihan tindanan imej (imej tindanan diambil dari sisi pelayan):'],
      bullets: [
        'img: URL untuk tindanan imej (mesti boleh diakses secara umum).',
        'mod: Mod tindanan - tengah, halftone, campuran, kecerahan, mozek, dithered, blue-noise, subpiksel.',
        'keamatan: Keamatan tindanan 0-100 (lalai: 100).',
        'colorMode: Mod warna tindanan - warna, skala kelabu, bw.',
        'muat: Cara tindanan sesuai - tutup, isi, regangan.',
        'reput: Putaran tindanan dalam darjah.',
        'flipX, flipY: Tetapkan kepada 1 untuk tindanan flip.',
        'keepFinders: Kekalkan corak pencari (lalai: 1).',
        'keepTiming, keepAlign: Tetapkan kepada 1 untuk mengekalkan corak pemasaan/penjajaran.',
      ],
    },
    {
      heading: 'Parameter Prapemprosesan',
      paragraphs: ['Prapemprosesan imej digunakan untuk tindanan:'],
      bullets: [
        'kecerahan: Pelarasan -100 hingga 100 (lalai: 0).',
        'kontras: Pelarasan -100 hingga 100 (lalai: 0).',
        'gamma: Nilai 0.1 hingga 3 (lalai: 1).',
        'ketepuan: Pelarasan -100 hingga 100 (lalai: 0).',
        'rona: Putaran rona dalam darjah.',
        'kabur: Kabur dalam piksel.',
        'tajamkan: Tajamkan jumlah 0-100.',
        'posterize: tahap posterize.',
        'ambang: Ambang binari 0-255.',
        'tepi: Pengesanan tepi - off, sobel, canny.',
        'songsang: Tetapkan kepada 1 untuk menyongsangkan warna.',
      ],
    },
    {
      heading: 'Parameter Tera Air',
      paragraphs: ['Tambahkan tera air pada kod QR yang dijana:'],
      bullets: [
        'wmEn: Tetapkan kepada 1 untuk mendayakan tera air.',
        'wmKind: Jenis tera air - teks, imej, corak.',
        'wmText: Teks tera air (berkod URL).',
        'wmImg: URL kepada imej tera air.',
        'wmPos: Kedudukan - tengah, bucu, tepi, belakang, zon_senyap.',
        'wmOpacity: Opacity 0-100 (lalai: 50).',
        'wmBlend: Mod campuran - normal, darab, skrin, tindanan.',
      ],
    },
    {
      heading: 'Parameter Animasi',
      paragraphs: ['Untuk output GIF animasi (memerlukan format=gif):'],
      bullets: [
        'animPattern: Corak animasi - tiada, nadi, gelombang, garis imbasan, shimmer, drift, color_cycle.',
        'animFrames: Bilangan bingkai 1-60 (lalai: 24).',
        'animSpeed: Kelewatan bingkai dalam milisaat 10-1000 (lalai: 100).',
        'animSeed: Benih rawak untuk animasi.',
        'pelonggaran: Pelonggaran animasi - linear, ease_in, ease_out, ease_in_out, lantunan.',
      ],
    },
    {
      heading: 'Parameter Output',
      paragraphs: ['Pilihan format output:'],
      bullets: [
        'kualiti: Kualiti WebP 0-1 (lalai: 0.9).',
        'webpQ: Kualiti WebP 0-100 (lalai: 90).',
        'gifColors: saiz palet GIF 2-256 (lalai: 256).',
        'dpi: Output DPI untuk PNG (lalai: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: medan metadata PNG.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Parameter Tanaman',
      paragraphs: ['Pilihan pemangkasan imej tindanan:'],
      bullets: [
        'cropEn: Dayakan pemangkasan tindanan 0/1 (lalai: 0).',
        'cropX: Pusat tanaman X sebagai pecahan 0-1 (lalai: 0.5).',
        'cropY: Pusat tanaman Y sebagai pecahan 0-1 (lalai: 0.5).',
        'cropSize: Saiz pangkas sebagai pecahan imej 0-1 (lalai: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Parameter Kunci Keselamatan',
      paragraphs: ['Kawal elemen QR yang dilindungi daripada pengubahsuaian tindanan:'],
      bullets: [
        'lockF: Corak pencari kunci 0/1 (lalai: 1).',
        'lockT: Corak pemasaan kunci 0/1 (lalai: 1).',
        'lockA: Corak penjajaran kunci 0/1 (lalai: 1).',
        'lockFmt: Maklumat format kunci 0/1 (lalai: 1).',
        'lockV: Kunci maklumat versi 0/1 (lalai: 1).',
        'safeMode: Mod keselamatan - mati, seimbang, ketat (lalai: mati).',
        'safeMinPx: Saiz modul minimum dalam piksel (lalai: 2).',
        'safeMinQz: Modul zon senyap minimum (lalai: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parameter penalaan automatik',
      paragraphs: ['Tetapan pengoptimuman automatik:'],
      bullets: [
        'autoVer: Autopilih QR versi 0/1 (lalai: 1).',
        'autoEcc: Auto-pilih tahap ECC 0/1 (lalai: 0) - pembayang sebelah pelayan sahaja.',
        'autoReduce: [CLIENT-ONLY] Auto-kurangkan keamatan sehingga boleh diimbas - memerlukan gelung pengesahan imbasan.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Parameter Animasi Tambahan',
      paragraphs: ['Kawalan animasi lanjutan untuk output GIF:'],
      bullets: [
        'gelung: Gelung animasi secara berterusan 0/1 (lalai: 1).',
        'lantunan: Arah animasi ping-pong 0/1 (lalai: 0).',
        'terbalik: Mainkan animasi secara terbalik 0/1 (lalai: 0).',
        'colorCycle: Dayakan kesan kitaran warna 0/1 (lalai: 0).',
        'interp: Interpolasi bingkai - tiada, luntur silang, morf (lalai: tiada).',
        'tempDither: Dithering sementara - dimatikan, blue_noise, flicker_safe (lalai: dimatikan).',
        'startF: Bingkai permulaan animasi (lalai: 0).',
        'maxF: Bingkai maksimum untuk dipaparkan (lalai: 0 = auto).',
        'stepF: Selang langkah bingkai (lalai: 1).',
        'jitter: [CLIENT-ONLY] Jitter modul dalam piksel - memerlukan penjanaan semula QR setiap bingkai.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Parameter Dithering',
      paragraphs: ['Kawal algoritma dithering untuk pemprosesan tindanan:'],
      bullets: [
        'ditherKind: Algoritma dither - error_diffusion, ordered_bayer, blue_noise, dll (lalai: ordered_bayer).',
        'diffusionKernel: Ralat inti resapan - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (lalai: floyd_steinberg).',
        'ditherStrength: Keamatan dither 0-100 (lalai: 50).',
        'serpentine: Serpentine dithering 0/1 (lalai: 0).',
        'matriks: Matriks dither tersusun - bayer2, bayer4, bayer8 (lalai: bayer4).',
        'bnTile: Saiz jubin hingar biru (lalai: 64).',
        'bnSeed: Benih rawak hingar biru (lalai: 0).',
        'colorDither: Warna dithering - tiada, per_channel, persepsi (lalai: tiada).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Parameter Subpiksel',
      paragraphs: ['Tetapan untuk mod campuran subpiksel:'],
      bullets: [
        'spGrid: Saiz grid subpiksel - 2x2, 3x3, 4x4 (lalai: 3x3).',
        'spCenter: Peraturan pusat - ketat, halftone_center (lalai: ketat).',
        'spNeutral: Hex warna neutral tanpa # (lalai: 808080).',
        'spFinder: Pencari menimpa - pepejal, digayakan (lalai: pepejal).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Parameter Halftone',
      paragraphs: ['Tetapan untuk mod campuran halftone:'],
      bullets: [
        'htCell: Saiz sel Halftone - per_module atau grid nxn (lalai: per_module).',
        'htDot: Bentuk titik - bulatan, segi empat sama, garis (lalai: bulatan).',
        'htCurve: Lengkung kecerahan - linear, s-curve, gamma (lalai: linear).',
        'duo1: Hex warna bayang duotone tanpa # (lalai: 000000).',
        'duo2: Hex warna serlahkan Duotone tanpa # (lalai: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Parameter Mod Sedar ECC',
      paragraphs: ['Pengagihan tindanan pintar berdasarkan kapasiti pembetulan ralat:'],
      bullets: [
        'eccAware: Dayakan mod ECC-aware 0/1 (lalai: 0).',
        'eccRisk: Peratusan belanjawan risiko 0-100 (lalai: 50).',
        'eccMap: Peta berat - distance_to_finders, block_heatmap, empirical_scan_heatmap (lalai: distance_to_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Parameter Bingkai',
      paragraphs: ['Tetapan bingkai hiasan:'],
      bullets: [
        'bingkai: Gaya bingkai - tiada, bingkai_bulat, pelekat, tag (lalai: tiada).',
        'frameText: Teks untuk dipaparkan dalam bingkai (URL dikodkan).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Parameter Warna Per-Modul',
      paragraphs: ['Pilihan pewarna modul individu:'],
      bullets: [
        'modColor: Mod warna - pepejal, by_brightness, by_position, by_overlay, by_cluster (lalai: solid).',
        'cGuard: Pengawal kontras 0/1 (lalai: 0).',
        'minContrast: Nisbah kontras minimum 1-21 (lalai: 4.5).',
        'palet: Warna heks yang dipisahkan koma untuk mod palet.',
        'paletteMode: Taburan palet - kedudukan, kecerahan, pepenjuru, jejari, rawak, baris, lajur (lalai: kedudukan).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'Parameter Tindanan GIF',
      paragraphs: ['Tetapan untuk imej tindanan GIF animasi:'],
      bullets: [
        'ovType: Jenis tindanan - statik, gif, apng, webp_anim, video (lalai: statik).',
        'ovFramePick: Pemilihan bingkai - semua, every_n, max_frames, duration_limit (lalai: semua).',
        'gifDelays: Gunakan kelewatan bingkai GIF asal 0/1 (lalai: 1).',
        'gifDispH: pengendalian pelupusan GIF - hormati, mudahkan (lalai: hormat).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Had Intensiti Per-ECC',
      paragraphs: ['Keamatan tindanan maksimum setiap tahap pembetulan ralat:'],
      bullets: [
        'maxIntL: Keamatan maksimum untuk ECC L 0-100 (lalai: 100).',
        'maxIntM: Keamatan maksimum untuk ECC M 0-100 (lalai: 100).',
        'maxIntQ: Keamatan maksimum untuk ECC Q 0-100 (lalai: 100).',
        'maxIntH: Keamatan maksimum untuk ECC H 0-100 (lalai: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Parameter Simulasi QA (Klien Sahaja)',
      paragraphs: [
        'Parameter ini dihuraikan untuk keserasian URL tetapi hanya berfungsi dalam penyemak imbas:',
      ],
      bullets: [
        'qaContrast: Dayakan semakan kontras 0/1 - memerlukan pengesahan interaktif.',
        'qaBlur: Simulasikan kabur dalam piksel - untuk ujian interaktif sahaja.',
        'qaNoise: Simulasikan tahap hingar - untuk ujian interaktif sahaja.',
        'qaHeatmap: Tunjukkan peta haba kebolehbacaan 0/1 - memerlukan UI tindanan kanvas.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Parameter Pelanggan Sahaja',
      paragraphs: [
        'Kebanyakan parameter API disokong sepenuhnya bahagian pelayan. Parameter yang ditanda [CLIENT-ONLY] dihuraikan untuk keserasian URL tetapi memerlukan ciri penyemak imbas:',
      ],
      bullets: [
        'jitter: Jitter modul memerlukan penjanaan semula QR setiap bingkai dengan rawak.',
        'autoReduce: Auto-mengurangkan keamatan memerlukan ujian imbasan berulang.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: Simulasi QA memerlukan pengesahan kanvas interaktif.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Parameter Output Tambahan',
      paragraphs: ['Tetapan output dan eksport lanjutan:'],
      bullets: [
        'fname: Nama fail tersuai untuk muat turun (lalai: anqr-qrcode).',
        'inclQz: Sertakan zon senyap dalam dimensi output 0/1 (lalai: 1).',
        'bgOver: Warna latar belakang mengatasi hex tanpa # (mengatasi parameter bg).',
        'fmtExtra: Output format tambahan - tiada, eps, animated_webp (lalai: tiada). Nota: eps ialah [PARTIAL].',
        'svgPrec: ketepatan bentuk SVG - piksel, tepat (lalai: piksel). [PARTIAL] Output SVG di bahagian pelayan terhad.',
        'svgEmbed: Benamkan tindanan raster dalam SVG 0/1 (lalai: 1). [PARTIAL] Output SVG di bahagian pelayan terhad.',
        'modulePx: Saiz piksel modul (lalai: dikira secara automatik daripada saiz).',
        'sempadan: Modul sempadan tambahan di luar zon senyap (lalai: 0).',
        'crisp: Dayakan rendering imej crisp/pixel 0/1 (lalai: 1).',
        'snap: Mod snap piksel - lantai, bulat, siling (lalai: lantai).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Parameter Pemeliharaan Corak',
      paragraphs: ['Kawal elemen struktur mana yang dilindungi daripada tindanan:'],
      bullets: [
        'keepFinders: Kekalkan corak pencari 0/1 (lalai: 1).',
        'keepTiming: Kekalkan corak pemasaan 0/1 (lalai: 0).',
        'keepAlign: Kekalkan corak penjajaran 0/1 (lalai: 0).',
        'protectFmt: Lindungi modul maklumat format 0/1 (lalai: 0).',
        'protectVer: Lindungi modul maklumat versi 0/1 (lalai: 0).',
      ],
    },
    {
      heading: 'Contoh Penggunaan',
      paragraphs: [
        'Kod QR asas:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Kod QR yang digayakan dengan warna tersuai:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'Kod QR dengan imej tindanan:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF animasi:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' }],
    },
    {
      heading: 'Membenamkan Kod QR',
      paragraphs: [
        'Dalam mod Profesional, ciri Kongsi menjana HTML dan URL yang boleh dibenamkan. Berikut ialah cara pembenaman berfungsi:',
      ],
      bullets: [
        'Kongsi Pautan: Mencipta URL ke apl ANQR dengan semua tetapan anda dikodkan sebagai parameter URL. Penerima boleh melihat dan mengubah suai kod QR.',
        'Benamkan Imej: Menghasilkan teg <img> yang menghala ke API pelayan. Kod QR dipaparkan di sebelah pelayan dan disajikan sebagai imej.',
        'Benamkan Markdown: Mencipta sintaks imej Markdown untuk dokumentasi dan fail README.',
        'URL API Langsung: URL API mentah untuk digunakan dalam aplikasi, skrip atau penyepaduan lain.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Contoh HTML',
      paragraphs: [
        'Untuk membenamkan kod QR dalam tapak web anda:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="Kod QR" />',
        'Untuk saiz responsif:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />',
        'Pelayan cache jawapan dengan pengepala cache yang panjang, jadi permintaan berulang untuk URL yang sama adalah pantas.',
      ],
    },
    {
      heading: 'Kongsi Format URL',
      paragraphs: [
        'Apabila anda mengklik Kongsi dalam mod Profesional, ANQR mengekod tetapan semasa anda ke dalam parameter URL. Formatnya ialah:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Parameter ini mencerminkan parameter API, jadi anda boleh menukar URL kongsi kepada URL API dengan menukar laluan asas daripada / kepada /api/qr dan melaraskan parameter w/j mengikut keperluan.',
        'Nota: Imej tindanan yang dimuat naik daripada fail setempat tidak boleh dikongsi melalui URL - hanya tindanan berasaskan URL (parameter img) berfungsi dalam pautan kongsi dan panggilan API.',
      ],
    },
    {
      heading: 'Had Kadar dan Penggunaan',
      paragraphs: [
        'API adalah percuma untuk digunakan untuk volum yang munasabah. Untuk penggunaan volum tinggi atau aplikasi komersial yang memerlukan masa operasi terjamin, sila hubungi kami.',
        'Respons API termasuk pengepala caching yang agresif. Untuk prestasi terbaik, cache respons pada hujung anda atau gunakan URL yang sama secara konsisten untuk kod QR yang sama.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Amalan Terbaik',
      paragraphs: ['Ikuti garis panduan ini untuk kod QR yang boleh dipercayai:'],
      bullets: [
        'Sentiasa uji kod QR anda dengan berbilang apl pengimbas sebelum mencetak.',
        'Gunakan Pembetulan Ralat H (Tinggi) apabila menambah tindanan.',
        'Simpan sekurang-kurangnya 4 modul zon senyap (margin).',
        'Pastikan kontras tinggi antara latar depan dan latar belakang.',
        'Untuk cetakan, gunakan sekurang-kurangnya 300 DPI dan uji pada saiz cetakan sebenar.',
        'Dayakan Kekalkan Corak Pencari apabila menggunakan tindanan.',
        'Mulakan dengan keamatan tindanan yang lebih rendah dan tingkatkan secara beransur-ansur.',
        'Untuk kegunaan luar, pertimbangkan saiz modul yang lebih besar dan pembetulan ralat yang lebih tinggi.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Semak imbas artikel Pelajari', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
      ],
    },
    {
      heading: 'Menyelesaikan masalah',
      paragraphs: ['Isu dan penyelesaian biasa:'],
      bullets: [
        'QR tidak akan mengimbas: Kurangkan keamatan tindanan, tingkatkan pembetulan ralat, semak kontras.',
        'Kod terlalu besar: Kurangkan panjang kandungan, gunakan pemendek URL, versi yang lebih rendah.',
        'Output kabur: Tingkatkan saiz modul, gunakan PNG dan bukannya format termampat.',
        'Warna kelihatan salah: Semak kontras warna, cuba mod tindanan skala kelabu.',
        'GIF tidak menganimasikan: Pastikan menggunakan output format GIF, semak kiraan bingkai.',
        'Tindanan imej tidak dimuatkan: Semak kebenaran CORS pada imej jauh.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Lihat panduan dan contoh berkaitan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Pintasan Papan Kekunci',
      paragraphs: [
        'ANQR menyokong pintasan papan kekunci standard. Gunakan Ctrl/Cmd+S untuk mencetuskan eksport (apabila tertumpu pada pratonton).',
      ],
    },
    {
      heading: 'Berkongsi & Membenamkan',
      paragraphs: [
        'Dalam mod Profesional, klik butang Kongsi untuk menyalin URL dengan tetapan semasa anda. Penerima boleh membuka URL ini untuk melihat konfigurasi tepat anda. Nota: Imej tindanan daripada fail tempatan tidak boleh dikongsi melalui URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Cuba konfigurasi ini terus dalam penjana ANQR.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Semak imbas artikel Pelajari', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Lihat contoh QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Buka penjana', type: 'generator' },
  ],
};

export default guide;
