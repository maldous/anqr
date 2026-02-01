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
    { href: '/?lang=${lang}', label: 'Buka penjana', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Semak imbas artikel Pelajari', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Buka Panduan Pengguna penuh', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Kajian Kes: Peningkatan QR Kaunter Runcit',
      paragraphs: ['Contoh dunia sebenar ini mengikuti sebuah kafe kecil yang telah menggunakan kod QR yang sama di kaunter mereka selama tiga tahun. Kod asal dijana dengan cepat semasa pandemik tergesa-gesa, dicetak pada kertas standard, dan dimasukkan ke dalam bekas plastik. Ia masih berfungsi - secara teknikal - tetapi pelanggan sering memerlukan beberapa percubaan untuk mengimbasnya, dan ia tidak melakukan apa-apa untuk mengukuhkan identiti jenama kafe yang direka dengan teliti.', 'Transformasi bermula dengan audit mudah: kod sedia ada mengekod URL menu dalam talian kafe, yang mereka mahu simpan. Cabarannya ialah menjadikan QR terasa seperti sebahagian daripada pengalaman kafe dan bukannya utiliti yang difikirkan semula dari 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Kod QR lapuk dalam dirian plastik yang menunjukkan haus yang boleh dilihat, cap jari dan cetakan pudar',
          caption: 'Titik permulaan: tiga tahun perkhidmatan kaunter telah menyebabkan QR asal hampir tidak berfungsi',
        },
      ],
    },
    {
      heading: 'Mendiagnosis Masalah Kod Asal',
      paragraphs: ['Ujian mendedahkan beberapa isu: kod asal menggunakan Pembetulan Ralat L (penyelewahan minimum), mempunyai zon tenang hanya 2 modul dan dicetak pada peleraian rendah. Di bawah pencahayaan tungsten hangat kafe, modul hitam yang sudah pudar hampir tidak bertentangan dengan kertas kuning. Telefon lama bergelut; telefon baru berjaya tetapi dengan kelewatan yang ketara.', 'Di sebalik isu teknikal, dataran hitam-putih generik tidak menyampaikan apa-apa tentang jenama itu. Pelanggan teragak-agak sebelum mengimbas - halangan amanah halus yang mengurangkan penglibatan dengan menu digital yang direka dengan teliti oleh kafe.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Tindanan diagnostik yang menunjukkan kekurangan teknikal QR asal: ECC rendah, zon senyap minimum, kontras yang lemah',
          caption: 'Analisis teknikal mendedahkan sebab kod warisan kurang berprestasi dalam keadaan dunia sebenar',
        },
      ],
    },
    {
      heading: 'Proses Peningkatan',
      paragraphs: ['Menggunakan ANQR, pemilik kafe mencipta semula kod dengan URL menu yang sama tetapi tetapan yang dipertingkatkan secara dramatik: Pembetulan Ralat H untuk daya tahan maksimum, zon tenang 6 modul untuk pengesanan sempadan yang boleh dipercayai dan warna jenama (modul burgundy dalam pada latar belakang krim) yang sepadan dengan palet dalaman kafe.', 'Lapisan tengah kecil yang memaparkan logo kafe telah ditambah - disimpan dengan sengaja secara halus untuk mengekalkan kebolehimbasan sambil memberikan pengiktirafan jenama segera. Mod Keselamatan mengesahkan reka bentuk baharu diimbas dengan pasti pada peranti ujian sebelum sebarang cetakan.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Antara muka ANQR menunjukkan konfigurasi: warna jenama, ECC yang sesuai, zon tenang yang luas, tindanan logo halus',
          caption: 'Membina konfigurasi yang dipertingkatkan: setiap tetapan yang dipilih untuk mengimbangi ekspresi jenama dengan kebolehpercayaan imbasan',
        },
      ],
    },
    {
      heading: 'Keputusan Boleh Diukur',
      paragraphs: ['Selepas menggunakan QR baharu pada stok kad berlamina matte profesional, kafe itu menjejaki keputusan selama empat minggu. Kadar kejayaan imbasan bertambah baik daripada anggaran 70% kepada hampir-100%. Purata masa imbasan menurun daripada 3-4 saat kepada kurang daripada 1 saat. Paling ketara, penglibatan menu meningkat 40% - pelanggan yang sebelum ini melihat QR dan berputus asa kini mengimbas dengan yakin.', 'Kakitangan melaporkan lebih sedikit soalan pelanggan tentang \'cara menggunakan QR\' dan tiada lagi kejadian menaip URL secara manual untuk pelanggan yang kecewa. Penampilan berjenama itu juga mencetuskan perbualan, dengan pelanggan memberi komen positif mengenai reka bentuk yang padu.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Perbandingan sebelum/selepas dengan metrik: kadar kejayaan imbasan, purata masa imbasan dan peningkatan kiraan imbasan mingguan',
          caption: 'Empat minggu data yang menunjukkan kesan yang boleh diukur daripada peningkatan QR yang bertimbang rasa',
        },
      ],
    },
    {
      heading: 'Buat Semula Konfigurasi Ini',
      paragraphs: ['Konfigurasi kafe menunjukkan penjenamaan yang konservatif tetapi berkesan: Pembetulan Ralat H, zon tenang 6 modul, warna jenama kontras tinggi dan tindanan tengah yang minimum. Baki ini berfungsi untuk kebanyakan aplikasi kaunter runcit di mana kebolehpercayaan mesti diutamakan tetapi kehadiran jenama masih penting.', 'Buka penjana dengan tetapan ini dipramuat dan sesuaikan warna serta tindanan kepada jenama anda sendiri. Wawasan utama: penambahbaikan kebolehpercayaan sahaja boleh meningkatkan penglibatan secara mendadak, walaupun sebelum menambah sebarang penggayaan visual.', 'Lihat panduan Pelajari berkaitan untuk menambah baik kempen QR sedia ada untuk metodologi penuh di sebalik pendekatan ini.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Pautan ke penjana yang diprakonfigurasikan dengan tetapan kafe untuk penyesuaian segera',
          caption: 'Mulakan dengan konfigurasi yang terbukti dan sesuaikan untuk jenama anda',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Buka penjana',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Semak imbas artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Kajian Kes: Paparan Kaunter Berbilang Bayaran',
      paragraphs: ['Contoh ini mengikuti kedai pakaian butik yang telah mengumpul lima kod QR berbeza di daftar mereka: pembayaran bank, petua, Instagram, ulasan Google dan pautan pengambilan pekerja. Setiap satu dijana daripada sumber yang berbeza, dicetak pada masa yang berbeza dan dipaparkan dalam dirian yang tidak sepadan. Kekacauan visual telah menjejaskan estetika kedai yang disusun dengan teliti, dan kakitangan kerap berurusan dengan pelanggan yang mengimbas kod yang salah.', 'Penyelesaiannya memerlukan memisahkan kebimbangan: kod pembayaran memerlukan kebolehpercayaan maksimum dengan penggayaan konservatif, manakala kod pemasaran mungkin lebih ekspresif. Sistem paparan bersatu yang muncul menunjukkan cara mengimbangi kehadiran jenama terhadap permintaan fungsi kes penggunaan QR yang berbeza.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Kawasan daftar bersepah menunjukkan lima kod QR yang tidak sepadan dalam pelbagai tempat berdiri dan bahan bercetak',
          caption: 'Titik permulaan huru-hara: lima kod QR terputus bersaing untuk mendapatkan perhatian dan menyebabkan kekeliruan pelanggan',
        },
      ],
    },
    {
      heading: 'Mengutamakan Pengalaman Pembayaran',
      paragraphs: ['Kaedah pembayaran utama kedai menggunakan standard serantau yang memerlukan pematuhan muatan yang ketat. Ujian mendedahkan bahawa walaupun penggayaan kecil menjejaskan kelajuan imbasan dengan apl perbankan tertentu. Keputusan: pastikan pembayaran QR tidak diubah suai sepenuhnya kecuali untuk pengoptimuman saiz dan pencetakan profesional pada stok kad matte.', 'Pendekatan konservatif ini bermakna kod pembayaran kelihatan kurang \'berjenama\' daripada ideal, tetapi kadar penyelesaian transaksi meningkat secara mendadak. Wawasan: detik pembayaran bukanlah peluang penjenamaan - ia adalah detik kebolehpercayaan. Pelanggan menghargai kepantasan dan kepastian berbanding estetika apabila wang terlibat.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Kod QR pembayaran yang bersih dan besar pada stok kad matte profesional, diletakkan dengan jelas di daftar',
          caption: 'QR pembayaran: bersaiz besar, dicetak secara profesional, digayakan secara konservatif untuk pengiktirafan segera oleh apl perbankan',
        },
      ],
    },
    {
      heading: 'Mencipta Paparan Tindakan Sekunder',
      paragraphs: ['Untuk petua, ulasan, sosial dan pengambilan pekerja, kedai mungkin lebih ekspresif. Kod ini telah dijana semula dalam ANQR dengan penggayaan jenama yang konsisten: hijau zaitun khas kedai pada krim, gaya modul bulat dan tindanan tengah halus dengan ikon kedai. Pembetulan Ralat H memastikan kebolehpercayaan walaupun dengan penggayaan.', 'Empat kod ini disusun dalam panel berjenama yang diletakkan di sebelah (tidak bersaing dengan) kod pembayaran. Label yang jelas dalam tipografi kedai menerangkan tujuan setiap kod. Hierarki visual adalah disengajakan: pembayaran berdiri sendiri dan menonjol; tindakan sekunder dikumpulkan bersama sebagai pilihan.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Panel berjenama menunjukkan empat kod QR gaya untuk petua, ulasan, sosial dan pengambilan pekerja, dengan label yang jelas',
          caption: 'Panel tindakan kedua: penjenamaan yang konsisten, pelabelan yang jelas, diletakkan sebagai pilihan dan bukannya gangguan',
        },
      ],
    },
    {
      heading: 'Reka Bentuk Sistem Paparan',
      paragraphs: ['Paparan fizikal menyelesaikan beberapa masalah secara serentak. Kedua-dua tempat pembayaran dan panel kedua menggunakan bahan matte untuk menghilangkan silau daripada pencahayaan atas. Ketinggian telah dioptimumkan untuk pelanggan yang berbeza perawakan. Sudut dihalakan ke arah barisan pelanggan dan bukannya rata di kaunter.', 'Secara kritis, kedai mencipta cetakan ganti daripada pautan konfigurasi ANQR yang dikunci. Apabila kod petua akhirnya mendapat kopi, kakitangan menggantikannya dalam beberapa minit menggunakan konfigurasi yang disimpan - tiada tangkapan skrin, tiada tekaan pada tetapan, tiada penurunan kualiti.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Gambar rajah yang menunjukkan reka letak paparan fizikal: ketinggian, sudut, bahan dan hubungan antara pembayaran dan paparan sekunder',
          caption: 'Rangka tindakan sistem paparan: ergonomik fizikal dioptimumkan untuk pengimbasan yang boleh dipercayai merentas ketinggian pelanggan dan keadaan pencahayaan',
        },
      ],
    },
    {
      heading: 'Penambahbaikan Operasi',
      paragraphs: ['Enam minggu selepas penggunaan, kedai itu mendokumenkan peningkatan yang ketara: sifar aduan pelanggan tentang kekeliruan \'kod salah\', masa transaksi yang lebih pantas dan peningkatan 3x ganda dalam penyerahan petua (pelanggan kini boleh mencari dan mengimbas kod tip tanpa bertanya kepada kakitangan dengan canggung). Ulasan Google juga meningkat apabila QR yang berdedikasi dan dilabel dengan baik telah menghilangkan geseran.', 'Latihan kakitangan menjadi lebih mudah: \'kod pembayaran adalah yang besar, semua yang lain ada pada panel.\' Apabila apl pembayaran dikemas kini dan satu apl secara ringkas menunjukkan pengimbasan yang lebih perlahan, reka bentuk kod pembayaran yang konservatif bermakna ia masih berfungsi - hanya perlahan sedikit daripada gagal sepenuhnya.', 'Lihat panduan Ketahui tentang kod QR untuk pembayaran runcit untuk prinsip di sebalik reka bentuk sistem paparan ini.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Papan pemuka metrik yang menunjukkan perbandingan sebelum/selepas: insiden kekeliruan, masa transaksi, kekerapan petua, penyerahan semakan',
          caption: 'Enam minggu data operasi menunjukkan kesan perniagaan sistem paparan multi-QR yang bertimbang rasa',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Buka penjana',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Semak imbas artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Kajian Kes: Daripada Kad Perniagaan ke Papan Iklan',
      paragraphs: ['Contoh ini mengikuti syarikat produksi acara yang sedang bersiap untuk persidangan besar. Mereka memerlukan kod QR yang sama - memaut ke apl acara - digunakan merentas format yang sangat berbeza: sisipan lencana peserta (3cm), kad khemah meja (8cm), papan tanda meja pendaftaran (30cm), poster pencari laluan (60cm) dan sepanduk latar belakang pentas besar (4 meter). Setiap format mempunyai jarak tontonan yang berbeza, keadaan pencahayaan dan aliran kerja pengeluaran.', 'Cabarannya bukan hanya teknikal - ia beroperasi. Berbilang vendor mengendalikan kerja cetakan yang berbeza, dan syarikat perlu memastikan hasil yang konsisten dan boleh diimbas tanpa mengira siapa yang menghasilkan apa. Penyelesaian mereka tertumpu pada eksport SVG dan dokumentasi penyerahan yang ketat.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Kolaj yang menunjukkan kod QR yang sama digunakan dalam lima saiz berbeza, daripada lencana hingga sepanduk',
          caption: 'Satu kod QR, lima saiz penggunaan: cabaran untuk mengekalkan kebolehimbasan dari sentimeter hingga meter',
        },
      ],
    },
    {
      heading: 'Mengapa Peristiwa Terdahulu Menghadapi Masalah',
      paragraphs: ['Pada persidangan terakhir mereka, syarikat itu telah mengalami kegagalan yang memalukan. QR sepanduk pentas dijana sebagai PNG kecil dan ditingkatkan dalam perisian reka bentuk - hasilnya kelihatan boleh diterima dari jauh tetapi gagal mengimbas dengan pasti daripada penonton. QR Lencana terlalu gaya dan terlalu kecil, menghampakan hadirin yang cuba menambah kenalan. Tetapan yang tidak konsisten merentas format bermakna QR \'sama\' sebenarnya kelihatan berbeza pada setiap bahagian.', 'Analisis selepas peristiwa mendedahkan punca utama: tiada sumber kebenaran tunggal. Setiap pereka bentuk telah mencipta semula QR dengan tetapan yang sedikit berbeza, dan setiap vendor cetakan telah memproses fail secara berbeza. Kualiti merosot melalui permainan telefon penyerahan fail.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Gambar jarak dekat yang menunjukkan kegagalan pengimbasan: modul sepanduk berpiksel, kod lencana bersaiz kecil, penggayaan tidak konsisten merentas format',
          caption: 'Analisis forensik kegagalan peristiwa sebelumnya: setiap format telah memperkenalkan masalah kualiti yang berbeza',
        },
      ],
    },
    {
      heading: 'Aliran Kerja SVG-Pertama',
      paragraphs: ['Untuk acara ini, syarikat menetapkan protokol yang ketat: satu QR induk yang dijana dalam ANQR dengan tetapan optimum (Pembetulan Ralat H, zon tenang yang murah hati, penggayaan bersih), dieksport sebagai SVG dan disimpan sebagai sumber tunggal yang berwibawa. Pautan konfigurasi ANQR telah didokumenkan bersama fail SVG supaya kod itu boleh dijana semula jika perlu.', 'Setiap pereka bentuk dan vendor menerima induk SVG yang sama dengan arahan yang jelas: letak pada saiz yang diperlukan, jangan ubah suai, kekalkan pelepasan zon senyap. Bagi vendor yang memerlukan format raster, syarikat itu menyediakan PNG pra-pamer pada saiz tertentu dengan konvensyen penamaan yang jelas menunjukkan penggunaan yang dimaksudkan.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Pakej fail yang menunjukkan induk SVG, PNG khusus saiz, dokumen spesifikasi dan pautan konfigurasi',
          caption: 'Pakej penyerahan: semua yang diperlukan vendor untuk menghasilkan hasil yang konsisten tanpa meneka',
        },
      ],
    },
    {
      heading: 'Pertimbangan Khusus Saiz',
      paragraphs: ['Setiap format memerlukan perhatian khusus. Sisipan lencana pada 3cm memerlukan QR untuk menduduki ruang maksimum yang tersedia - jarak pengimbasan adalah sepanjang lengan. Khemah meja pada 8cm boleh termasuk rangka hiasan di luar zon tenang. Sepanduk 4 meter memerlukan pengiraan: dari jarak penonton biasa (15-20 meter), modul perlu dibezakan dengan jelas oleh kamera telefon, yang bermaksud QR perlu sekurang-kurangnya 80cm dalam reka bentuk sepanduk.', 'Syarikat itu mencipta panduan saiz yang mendokumenkan dimensi QR minimum untuk setiap jarak pengimbasan yang dijangkakan. Ini menjadi aset boleh guna semula untuk acara masa hadapan, mengalih keluar tekaan daripada proses reka bentuk.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Carta yang menunjukkan hubungan antara jarak imbasan, saiz QR minimum dan dimensi modul untuk setiap format acara',
          caption: 'Matriks saiz: dimensi yang dikira memastikan pengimbasan yang boleh dipercayai pada setiap jarak tontonan yang dijangkakan',
        },
      ],
    },
    {
      heading: 'Hasil Pengeluaran',
      paragraphs: ['Pengesahan hari persidangan adalah sistematik: kakitangan menguji setiap QR yang digunakan sebelum pintu dibuka. Sisipan lencana diimbas serta-merta pada paras lengan. Khemah meja berfungsi dengan pasti dalam pencahayaan berubah-ubah bilik pelarian. Sepanduk pentas - memalukan acara sebelumnya - berjaya diimbas dari tengah kawasan penonton.', 'Aduan pengimbasan sifar telah direkodkan merentasi 2,000+ peserta. Kemenangan operasi adalah sama penting: apabila penambahan penaja pada saat-saat akhir memerlukan papan tanda baharu, pasukan produksi menjananya daripada SVG induk dalam beberapa minit, yakin ia akan sepadan dengan semua yang lain.', 'Lihat panduan Ketahui tentang kod QR sedia cetak untuk rangka kerja keputusan SVG lwn PNG dan amalan terbaik penyerahan.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Fotografi acara menunjukkan peserta berjaya mengimbas kod QR pada pelbagai saiz dan jarak di seluruh tempat',
          caption: 'Kejayaan hari persidangan: pengimbasan yang boleh dipercayai merentas setiap format, daripada jarak dekat lencana hingga tangkapan jarak sepanduk pentas',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Buka penjana',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Semak imbas artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Kajian Kes: Paparan Digital Lounge Lapangan Terbang',
      paragraphs: ['Contoh ini mengikuti ruang istirahat syarikat penerbangan yang telah menggunakan kod QR statik pada skrin alu-aluan digital mereka. Skrin memaparkan kandungan promosi yang berputar, tetapi kod QR untuk daftar masuk lounge terletak di sudut, statik dan mudah diabaikan. Analitis menunjukkan hanya 15% tetamu yang layak menggunakan daftar masuk QR walaupun lebih pantas daripada baris gilir meja. Kebanyakan tetamu langsung tidak menyedarinya.', 'Hipotesisnya adalah mudah: dalam persekitaran visual yang sibuk dengan kandungan bergerak, QR statik menjadi tidak kelihatan. Penyelesaian yang diperlukan untuk menjadikan QR ketara tanpa menjejaskan kebolehpercayaan yang diperlukan untuk aliran daftar masuk di mana kegagalan akan bermakna pengembara yang kecewa dan barisan meja yang lebih panjang.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Paparan digital di ruang istirahat lapangan terbang yang menunjukkan kandungan promosi dengan kod QR statik yang kecil di sudut',
          caption: 'Persediaan asal: QR statik hilang dalam lautan kandungan promosi dinamik, mencapai hanya 15% penerimaan',
        },
      ],
    },
    {
      heading: 'Mereka bentuk Animasi Selamat',
      paragraphs: ['Papan tanda digital ruang istirahat menggunakan panel LED yang besar - persekitaran yang mencabar di mana animasi agresif boleh menimbulkan masalah pengimbasan. Pasukan reka bentuk bermula secara konservatif: kesan nadi lembut yang berkembang secara halus dan mengurangkan kehadiran visual QR tanpa mengubah suai struktur kod sebenar. Masa bingkai ditetapkan perlahan (250ms) untuk mengelakkan sebarang masalah kelipan dengan kadar segar semula LED.', 'Pengesahan Mod Keselamatan mengesahkan setiap bingkai kekal boleh diimbas. Ujian tambahan pada panel LED sebenar mendedahkan bahawa nadi perlu lebih halus daripada pratonton desktop yang dicadangkan - kecerahan LED dan sudut tontonan mempengaruhi kontras yang dirasakan lebih daripada yang dijangkakan.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Panel tetapan animasi ANQR menunjukkan konfigurasi nadi: pemasaan perlahan, keamatan halus, Mod Keselamatan didayakan',
          caption: 'Konfigurasi animasi: parameter ditala untuk paparan panel LED sambil mengekalkan kebolehpercayaan imbasan dalam setiap bingkai',
        },
      ],
    },
    {
      heading: 'Penyepaduan dengan Kandungan Papan Tanda',
      paragraphs: ['QR animasi diletakkan dalam \'zon stabil\' khusus susun atur skrin - kawasan yang kekal malar semasa kandungan promosi diputar di kawasan paparan utama. Pemisahan ini adalah penting: QR memerlukan kestabilan visual untuk mengimbas walaupun semasa menarik perhatian melalui animasi halusnya.', 'Seruan tindak yang jelas telah ditambahkan bersebelahan dengan QR: \'Langkau baris gilir - imbas untuk mendaftar masuk.\' Teks kekal statik semasa QR berdenyut, mewujudkan hierarki visual yang menarik mata kepada peluang pengimbasan tanpa mengatasi kandungan promosi.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Gambar rajah susun atur skrin yang menunjukkan QR animasi dalam zon stabil manakala kandungan promosi berputar di kawasan utama',
          caption: 'Skrin peruntukan hartanah: QR animasi menduduki zon stabil yang berasingan daripada kandungan promosi berputar',
        },
      ],
    },
    {
      heading: 'Penggunaan Teknikal',
      paragraphs: ['QR animasi telah dieksport sebagai GIF dengan tetapan yang dioptimumkan untuk CMS papan tanda. Pertimbangan saiz fail adalah penting - sistem pengurusan kandungan ruang istirahat mempunyai had muat naik, dan fail yang terlalu besar menyebabkan main balik gagap. Eksport akhir mengimbangi kualiti visual terhadap saiz fail dengan mengehadkan palet warna dan mengoptimumkan kiraan bingkai.', 'Penggunaan termasuk sandaran: jika GIF gagal dimainkan atas sebarang sebab, sistem papan tanda akan memaparkan sandaran PNG statik. Lebihan ini memastikan keupayaan daftar masuk tidak pernah hilang disebabkan masalah teknikal dengan animasi.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Antara muka CMS yang menunjukkan muat naik QR animasi dengan imej statik sandaran dikonfigurasikan',
          caption: 'Konfigurasi CMS papan tanda: animasi utama dengan sandaran statik memastikan keupayaan daftar masuk tidak pernah terganggu',
        },
      ],
    },
    {
      heading: 'Kesan Terukur',
      paragraphs: ['Selepas sebulan beroperasi, penggunaan daftar masuk QR meningkat daripada 15% kepada 24% - peningkatan relatif 60%. Tinjauan maklum balas tetamu menunjukkan QR animasi adalah \'lebih mudah untuk diperhatikan\' dan \'terasa lebih moden.\' Masa giliran meja berkurangan dengan ketara semasa waktu puncak apabila lebih ramai tetamu melayan diri melalui QR.', 'Yang penting, kegagalan pengimbasan sifar dilaporkan walaupun beribu-ribu imbasan setiap hari. Pendekatan animasi konservatif telah mencapai matlamat perhatian tanpa mengorbankan kebolehpercayaan aliran daftar masuk yang dituntut. Lounge kemudiannya melancarkan QR animasi yang serupa ke lokasi mereka yang lain.', 'Lihat panduan Belajar tentang kod QR animasi untuk papan tanda digital untuk prinsip teknikal di sebalik reka bentuk animasi yang selamat.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Papan pemuka yang menunjukkan peningkatan kadar penggunaan, pengurangan masa gilir dan kebolehpercayaan imbasan sifar kegagalan sepanjang tempoh penggunaan',
          caption: 'Satu bulan data: 60% peningkatan penggunaan, mengurangkan masa giliran dan mengekalkan kebolehpercayaan imbasan yang sempurna',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Buka penjana',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Semak imbas artikel Pelajari',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Kajian Kes: Kempen QR Pelancaran Produk Global',
      paragraphs: ['Contoh ini mengikuti syarikat elektronik pengguna melancarkan produk baharu secara serentak di 12 pasaran merentas 8 bahasa. Setiap pasukan pemasaran serantau perlu menghasilkan pembungkusan, paparan runcit dan bahan promosi yang menampilkan kod QR yang memautkan ke halaman produk setempat. Pelancaran sebelumnya telah mengakibatkan penggayaan QR yang tidak konsisten, kegagalan pengimbasan sekali-sekala dan \'permainan telefon\' hanyut konfigurasi apabila setiap pasukan mencipta semula kod daripada tangkapan skrin.', 'Penyelesaian itu memanfaatkan pautan konfigurasi boleh kongsi ANQR untuk mewujudkan satu sumber kebenaran yang boleh diakses oleh setiap pasukan serantau, tanpa mengira bahasa antara muka mereka. Muatan QR menggunakan ubah hala pintar yang mengesan bahasa pengguna, jadi satu kod berfungsi secara global sambil menyampaikan pengalaman setempat.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Peta dunia yang menunjukkan 12 lokasi pasaran dengan kod QR, beberapa secara visual tidak konsisten antara satu sama lain',
          caption: 'Cabarannya: 12 pasaran, 8 bahasa dan sejarah pelaksanaan QR yang tidak konsisten merentas wilayah',
        },
      ],
    },
    {
      heading: 'Menubuhkan Konfigurasi Induk',
      paragraphs: ['Pasukan jenama global mencipta konfigurasi QR yang berwibawa dalam ANQR: warna jenama yang sepadan dengan identiti visual barisan produk, Pembetulan Ralat H untuk kebolehpercayaan merentas semua aplikasi cetak dan digital, dan penggayaan yang akan menghasilkan semula secara konsisten tanpa mengira kaedah pengeluaran tempatan. Konfigurasi telah dikunci dan pautan kongsi didokumenkan dalam ringkasan kempen global.', 'Secara kritikal, URL yang dikodkan menggunakan perkhidmatan ubah hala pengesan bahasa. Apabila diimbas, pengguna dihalakan secara automatik ke halaman produk bahasa tempatan mereka. Ini bermakna semua 12 pasaran boleh menggunakan kod QR yang sama - tiada variasi muatan setiap pasaran yang boleh menimbulkan ralat.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Antara muka ANQR menunjukkan konfigurasi induk dengan warna jenama, ECC H dan URL ubah hala pintar',
          caption: 'Konfigurasi induk: piawaian jenama global yang dikodkan menjadi satu sumber kebenaran yang boleh dikongsi',
        },
      ],
    },
    {
      heading: 'Aliran Kerja Pasukan Serantau',
      paragraphs: ['Setiap pasukan pemasaran serantau menerima pautan konfigurasi dengan arahan mudah: buka pautan, sahkan pratonton sepadan dengan garis panduan jenama, eksport dalam format yang diperlukan untuk aplikasi anda. Antara muka ANQR dipaparkan dalam bahasa pilihan setiap pasukan, tetapi tetapan QR asas kekal sama tanpa mengira bahasa antara muka.', 'Apabila pasukan Jepun memerlukan SVG untuk paparan runcit mewah dan pasukan Brazil memerlukan PNG untuk media sosial, kedua-duanya dieksport daripada konfigurasi yang sama. Apabila vendor cetakan pasukan Jerman meminta nilai warna tertentu, mereka boleh merujuk konfigurasi secara langsung dan bukannya meneka daripada tangkapan skrin.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Tangkapan skrin yang menunjukkan pautan konfigurasi yang sama dibuka dalam antara muka Jepun, Portugis dan Jerman',
          caption: 'Konfigurasi yang sama, antara muka yang berbeza: pasukan serantau bekerja dalam bahasa pilihan mereka sambil mengekalkan konsistensi global',
        },
      ],
    },
    {
      heading: 'Mengendalikan Variasi Serantau',
      paragraphs: ['Sesetengah pasaran memerlukan penyesuaian kecil. Pasukan China memerlukan versi dengan bingkai yang dioptimumkan WeChat untuk perkongsian sosial. Daripada mengubah suai induk, mereka mencipta varian yang didokumenkan dengan pautan konfigurasinya sendiri, dilabel dengan jelas sebagai \'varian CN-WeChat\' dalam pustaka aset kempen. Ini mengekalkan kebolehkesanan sambil membenarkan penyetempatan yang diperlukan.', 'Pasukan jenama menetapkan peraturan mudah: sebarang variasi daripada induk memerlukan pautan konfigurasi baharu yang didokumenkan. Tiada pengubahsuaian pada fail yang dieksport, tiada \'pembetulan cepat\' dalam perisian reka bentuk. Ini menghalang drift konfigurasi yang telah melanda pelancaran sebelumnya.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Antara muka perpustakaan aset yang menunjukkan konfigurasi induk dan varian serantau yang diluluskan, setiap satu dengan pautannya sendiri',
          caption: 'Tadbir urus aset kempen: konfigurasi induk serta varian yang didokumenkan, semuanya boleh dikesan melalui pautan konfigurasi',
        },
      ],
    },
    {
      heading: 'Hasil Pelancaran',
      paragraphs: ['Hari pelancaran produk menyaksikan kod QR digunakan merentas pembungkusan, paparan runcit, bahan acara dan kempen digital di semua 12 pasaran secara serentak. Audit kualiti mengesahkan konsistensi visual merentas rantau - QR pada paparan runcit Tokyo sepadan dengan QR pada pembungkusan São Paulo sepadan dengan QR pada sepanduk acara Berlin.', 'Kegagalan pengimbasan sifar dilaporkan di seluruh pasaran. Apabila perubahan URL halaman produk selepas pelancaran diperlukan, perkhidmatan ubah hala mengendalikannya secara tidak kelihatan - tiada pencetakan semula diperlukan. Pasukan global menganggarkan pendekatan pautan konfigurasi menjimatkan 40+ jam masa penyelarasan berbanding metodologi pelancaran mereka sebelum ini.', 'Lihat panduan Belajar tentang kerjasama QR merentas bahasa untuk prinsip aliran kerja di sebalik konsistensi kempen global.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Grid gambar yang menunjukkan penggunaan QR yang konsisten merentas pasaran berbeza: runcit Tokyo, pembungkusan São Paulo, acara Berlin',
          caption: 'Konsistensi global dicapai: pembentangan QR yang sama merentas 12 pasaran walaupun berbeza bahasa, vendor dan format',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Buka penjana',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Semak imbas artikel Pelajari',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Semak imbas artikel Pelajari', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Buka Panduan Pengguna penuh', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Buka galeri', type: 'gallery' },
  ],
};
