import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Belajar dengan ANQR',
  description: 'Panduan praktikal yang mengutamakan perniagaan untuk menukar kod QR menjadi aset pemasaran sebenar - bukan hanya petak berfungsi. Ketahui cara untuk menaik taraf kod tempat jualan lama, membuat papan tanda QR pembayaran yang mematuhi, menyediakan eksport sedia cetak, menggunakan animasi dengan selamat pada paparan digital dan berkongsi konfigurasi terkunci dalam merentas pasukan berbilang bahasa menggunakan pautan ANQR ("sauh").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buka penjana', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Lihat contoh QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Buka Panduan Pengguna penuh', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Meningkatkan Kempen QR Sedia Ada',
      paragraphs: ['Kebanyakan perniagaan mempunyai kod QR yang tersebar di seluruh operasi mereka - pada menu, kaunter berdiri, pembungkusan dan bahan promosi. Kebanyakan kod ini telah dicipta bertahun-tahun yang lalu dengan penjana asas, menghasilkan petak generik hitam-putih yang gagal memberi inspirasi kepada keyakinan atau sepadan dengan identiti jenama anda. Panduan komprehensif ini membimbing anda melalui pendekatan sistematik untuk mengaudit, menaik taraf dan mengoptimumkan infrastruktur QR sedia ada anda tanpa mengganggu perjalanan pelanggan yang telah anda sediakan.', 'Kelebihan strategik untuk menaik taraf dan bukannya menggantikan kod QR anda terletak pada mengekalkan kesinambungan. Pelanggan anda telah belajar untuk mengharapkan destinasi tertentu apabila mereka mengimbas kod anda. Dengan mengekalkan URL yang dikodkan sama sambil meningkatkan persembahan visual, kebolehpercayaan imbasan dan penjajaran jenama secara dramatik, anda mencipta peralihan yang lancar yang meningkatkan kepercayaan tanpa memerlukan sebarang perubahan pada infrastruktur digital atau penjejakan analitik anda.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Perbandingan sebelah menyebelah yang menunjukkan kod QR generik yang pudar di sebelah versi berjenama moden yang mengekod URL yang sama',
          caption: 'Sebelum dan selepas: URL destinasi yang sama berubah daripada kod generik bertarikh kepada aset berjenama profesional',
        },
      ],
    },
    {
      heading: 'Mengapa Kod QR Warisan Kurang Berprestasi',
      paragraphs: ['Kod QR yang dibuat semasa fasa penggunaan awal - terutamanya semasa 2020-2021 apabila perniagaan tergesa-gesa untuk melaksanakan penyelesaian tanpa sentuh - sering mengalami beberapa isu kritikal. Tetapan pembetulan ralat yang rendah menjadikannya rapuh apabila dicetak pada permukaan bertekstur atau dilihat di bawah pencahayaan yang mencabar. Zon senyap yang tidak mencukupi menyebabkan kegagalan pengimbasan apabila kod diletakkan berhampiran elemen visual lain. Penggayaan generik gagal untuk menyampaikan kesahihan jenama, membawa kepada teragak-agak dan mengurangkan kadar imbasan.', 'Melangkaui had teknikal, kod lama sering mewakili peluang penjenamaan yang terlepas. Setiap kod QR ialah titik sentuh dengan pelanggan anda - saat mereka terlibat secara aktif dan bersedia untuk mengambil tindakan. Kod gaya profesional yang sepadan dengan warna jenama anda, termasuk margin keselamatan yang sesuai dan menampilkan elemen berjenama pilihan mengubah utiliti ini menjadi aset pemasaran yang mengukuhkan identiti anda pada setiap interaksi.'],
    },
    {
      heading: 'Menjalankan Audit Kod QR',
      paragraphs: ['Mulakan projek peningkatan anda dengan membuat inventori komprehensif bagi setiap kod QR yang digunakan pada masa ini merentas perniagaan anda. Dokumentasikan lokasi fizikal, destinasi yang dikodkan, keadaan semasa bahan bercetak dan persekitaran pengimbasan biasa termasuk keadaan pencahayaan dan sudut tontonan. Uji setiap kod dengan berbilang peranti - telefon pintar lama dan peranti bajet sering mendedahkan isu kebolehpercayaan yang ditutup oleh telefon premium.', 'Beri perhatian khusus kepada kod di lokasi berkepentingan tinggi: tempat pembayaran, kawasan daftar masuk dan paparan promosi yang kegagalan imbasan memberi kesan secara langsung kepada hasil atau pengalaman pelanggan. Ini harus diutamakan untuk naik taraf segera. Juga perhatikan kod yang muncul dalam kandungan fotografi atau video, kerana ini memerlukan penyelarasan dengan pasukan pemasaran anda untuk mengemas kini aset visual.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Antara muka senarai semak yang menunjukkan kategori audit QR: lokasi, keadaan, kebolehpercayaan imbasan dan penilaian keutamaan',
          caption: 'Templat audit QR sistematik untuk mendokumentasikan dan mengutamakan calon naik taraf anda',
        },
      ],
    },
    {
      heading: 'Strategi Naik Taraf Selamat',
      paragraphs: ['Peraturan utama peningkatan QR ialah pemeliharaan destinasi. Ekstrak URL yang tepat daripada setiap kod sedia ada dan kodkannya secara serupa dalam versi baharu anda. Ini memastikan semua analitik sedia ada, logik ubah hala dan jangkaan pelanggan kekal utuh. Jika anda memerlukan fleksibiliti destinasi untuk kemas kini masa hadapan, ini adalah masa yang sesuai untuk memperkenalkan URL pendek berjenama atau perkhidmatan ubah hala - tetapi laksanakan ini sebagai projek berasingan untuk mengelakkan perubahan pengkompaunan.', 'Untuk peningkatan visual, gunakan penambahbaikan dalam lapisan: mula-mula pastikan kebolehpercayaan teknikal (pembetulan ralat yang sesuai dan zon senyap), kemudian tambah penggayaan jenama (warna, bentuk modul), dan akhirnya pertimbangkan peningkatan pilihan (tindihan tengah, bingkai). Setiap lapisan hendaklah disahkan melalui ujian sebelum meneruskan. Mod Keselamatan ANQR membantu menguatkuasakan keutamaan ini dengan memberi amaran apabila pilihan penggayaan mungkin menjejaskan kebolehimbasan.'],
    },
    {
      heading: 'Menambah Identiti Jenama Tanpa Mengkompromi Kebolehpercayaan',
      paragraphs: ['Penjenamaan QR yang berkesan mengimbangi kesan visual terhadap kebolehpercayaan imbasan. Mulakan dengan warna: gantikan latar depan hitam lalai dengan warna jenama utama anda, memastikan kontras yang mencukupi dengan latar belakang anda. Untuk kebanyakan jenama, warna gelap pada latar belakang terang berfungsi paling baik. Elakkan gabungan kontras rendah, kecerunan yang mengurangkan kejelasan tepi atau warna yang kelihatan serupa dalam keadaan pencahayaan biasa.', 'Penyesuaian bentuk modul menawarkan satu lagi peluang penjenamaan dengan kesan kebolehpercayaan yang minimum. Modul bulat mencipta penampilan yang lebih lembut dan mudah didekati sambil mengekalkan kebolehimbasan yang sangat baik. Modul gaya titik berfungsi dengan baik untuk jenama moden yang maju ke hadapan. Modul yang disambungkan sesuai dengan identiti industri atau korporat. Walau apa pun gaya yang anda pilih, kekalkan konsistensi merentas semua penggunaan QR anda untuk pengecaman jenama segera.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Gambar rajah roda warna menunjukkan kombinasi warna QR optimum dengan penunjuk nisbah kontras',
          caption: 'Panduan pemilihan warna jenama menunjukkan kombinasi kontras tinggi yang mengekalkan kebolehpercayaan imbasan',
        },
      ],
    },
    {
      heading: 'Protokol Pengujian dan Pengesahan',
      paragraphs: ['Jangan sekali-kali menggunakan kod QR yang dinaik taraf tanpa ujian yang ketat. Cetak bukti fizikal pada saiz yang tepat dan pada bahan yang sama dengan penggunaan terakhir anda. Uji di lokasi sebenar tempat kod itu akan hidup, pada masa yang berbeza dalam sehari untuk mengambil kira variasi pencahayaan. Gunakan sekurang-kurangnya tiga peranti berbeza: telefon perdana semasa, peranti jarak pertengahan dan telefon pintar yang lebih lama atau bajet.', 'Catatkan masa imbasan dan kadar kejayaan untuk setiap ujian. Kod yang dioptimumkan dengan baik harus mengimbas dalam masa 1-2 saat pada mana-mana peranti yang agak moden. Jika anda melihat kelewatan atau kegagalan yang konsisten, kurangkan keamatan penggayaan - alih keluar atau kecilkan tindanan, tingkatkan saiz zon senyap atau tukar kepada tahap pembetulan ralat yang lebih tinggi. Kebolehpercayaan sentiasa diutamakan daripada kecanggihan visual.'],
    },
    {
      heading: 'Mengunci Konfigurasi Anda untuk Ketekalan',
      paragraphs: ['Sebaik sahaja anda telah mengesahkan konfigurasi optimum, simpannya menggunakan pautan boleh kongsi ANQR. Ini mencipta rekod kekal bagi setiap tetapan yang digunakan untuk menjana kod anda yang diluluskan - warna, gaya modul, pembetulan ralat, saiz dan sebarang tindanan. Kongsi pautan ini dengan pasukan reka bentuk anda, vendor cetakan dan sesiapa sahaja yang mungkin perlu menghasilkan semula kod pada masa hadapan.', 'Kunci konfigurasi ini menghalang kemerosotan beransur-ansur yang melanda banyak penggunaan QR. Tanpa itu, ahli kakitangan mencipta semula kod daripada tangkapan skrin, pereka bentuk membina semula tetapan daripada memori, dan vendor cetakan membuat pelarasan \'bermanfaat\'. Setiap variasi memperkenalkan isu yang berpotensi. Dengan pautan konfigurasi yang dikunci, setiap pengeluaran semula adalah sama dengan asal anda yang diuji dan diluluskan.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Gambar rajah yang menunjukkan hanyut konfigurasi: tangkapan skrin yang membawa kepada rekreasi yang membawa kepada variasi, berbanding pautan sumber-kebenaran tunggal',
          caption: 'Cegah hanyut konfigurasi dengan mewujudkan satu sumber berwibawa untuk semua pengeluaran semula QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Buka penjana',
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
      heading: 'Kod QR untuk Pembayaran Runcit',
      paragraphs: ['Kod QR pembayaran beroperasi dalam persekitaran yang paling mencabar dalam runcit: saat transaksi. Pelanggan bersedia untuk membayar, selalunya dengan baris gilir terbentuk di belakang mereka, dan setiap saat kelewatan menimbulkan geseran. Namun detik tekanan tinggi ini juga merupakan hartanah utama untuk pengukuhan jenama. Panduan ini menerangkan cara membuat kod QR pembayaran yang mengimbas serta-merta pada apl perbankan sambil tetap menampilkan penampilan berjenama profesional yang membina kepercayaan pelanggan.', 'Prinsip asas untuk pembayaran kod QR adalah kebolehpercayaan berbanding estetika. Kod yang direka dengan cantik yang gagal mengimbas pada apl perbankan satu pelanggan akan menyebabkan anda menanggung kos yang jauh lebih tinggi dalam urus niaga terbengkalai dan pelanggan yang kecewa berbanding reka bentuk konservatif. Mulakan dengan pematuhan, tambahkan kebolehpercayaan, kemudian lapisan penjenamaan dengan berhati-hati sahaja di mana ia tidak menjejaskan fungsi utama.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Paparan kaunter runcit menunjukkan kod QR pembayaran diimbas oleh telefon pintar dengan apl perbankan',
          caption: 'Kod QR pembayaran mesti berfungsi serta-merta dengan apl perbankan dan dompet di bawah keadaan kaunter dunia sebenar',
        },
      ],
    },
    {
      heading: 'Memahami Piawaian QR Pembayaran',
      paragraphs: ['Kod QR pembayaran biasanya mengikut piawaian serantau yang menentukan format muatan. Di Singapura, PayNow QR menggunakan pemformatan khusus. Di India, kod UPI mengikut piawaian pautan dalam BharatQR atau UPI. Pembayaran SEPA Eropah menggunakan kod QR EPC. Setiap standard wujud untuk memastikan apl perbankan dapat mengenali dan memproses maklumat pembayaran dengan serta-merta. Menyimpang daripada piawaian ini - walaupun sedikit - boleh menyebabkan apl pembayaran menolak kod yang dibaca oleh pengimbas kamera generik tanpa masalah.', 'ANQR termasuk templat untuk piawaian pembayaran utama yang secara automatik memformat butiran pedagang anda ke dalam muatan yang mematuhi. Sentiasa gunakan templat ini daripada membina rentetan pembayaran secara manual, kerana walaupun ralat pemformatan kecil boleh menyebabkan kegagalan transaksi. Jika standard pembayaran wilayah anda tidak tersedia sebagai templat, rujuk dokumentasi teknikal pembekal pembayaran anda untuk keperluan pemformatan yang tepat.'],
    },
    {
      heading: 'Saiz dan Peletakan untuk Paparan Kaunter',
      paragraphs: ['Kod QR kaunter teratas menghadapi cabaran fizikal yang unik. Pelanggan mengimbas pada paras lengan, selalunya pada sudut, kadang-kadang melalui pelindung bersin atau kotak paparan. Pencahayaan atas kepala menghasilkan bintik silau. Kod ini bersaing dengan kekacauan kaunter lain untuk perhatian dan pandangan yang jelas. Saiz QR pembayaran anda dengan murah hati - sekurang-kurangnya 4-5cm disyorkan untuk kebanyakan aplikasi kaunter, ditingkatkan jika kod terletak di belakang kaca atau di kawasan yang bercahaya malap.', 'Kedudukan adalah sama pentingnya dengan saiz. Letakkan kod di mana pelanggan boleh memegang telefon mereka dengan selesa tanpa menyekat baris gilir atau menghubungi dengan janggal. Sudut paparan ke arah pelanggan dan bukannya meletakkannya rata. Jika boleh, gunakan laminasi matte atau bahan paparan bukan reflektif untuk meminimumkan silau daripada pencahayaan atas. Uji peletakan terakhir pada masa yang berbeza dalam sehari untuk menangkap isu pencahayaan.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Gambar rajah yang menunjukkan ketinggian dan sudut penempatan QR yang optimum untuk konfigurasi kaunter yang berbeza',
          caption: 'Panduan penempatan kaunter: ketinggian, sudut dan jarak optimum untuk pengimbasan pembayaran yang boleh dipercayai',
        },
      ],
    },
    {
      heading: 'Penjenamaan Konservatif untuk Kod Pembayaran',
      paragraphs: ['Apl pembayaran kurang memaafkan berbanding pengimbas kamera generik. Banyak apl perbankan menggunakan algoritma bacaan QR yang lebih lama dan lebih ringkas yang dioptimumkan untuk kelajuan dan bukannya fleksibiliti. Ini bermakna penggayaan yang berfungsi dengan sempurna dengan kamera telefon mungkin gagal dengan apl pembayaran tertentu. Teruskan penjenamaan konservatif: gunakan warna jenama anda untuk latar depan jika ia mengekalkan kontras yang kuat, tetapi elakkan kecerunan, tindanan berat atau unsur hiasan yang boleh mengganggu pengecaman.', 'Jika anda mahukan logo pusat atau tindanan, pastikan ia sangat kecil - tidak lebih daripada 10-15% daripada kawasan QR - dan uji secara meluas dengan setiap apl pembayaran yang mungkin digunakan oleh pelanggan anda. Banyak perniagaan memilih untuk tiada tindanan pada kod pembayaran secara khusus, mengekalkan penggayaan itu untuk memasarkan kod QR yang keperluan kebolehpercayaan adalah kurang ketat. Tugas kod pembayaran adalah untuk memproses transaksi, bukan untuk menarik perhatian secara visual.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Perbandingan yang menunjukkan tahap penjenamaan boleh diterima vs berisiko untuk kod QR pembayaran',
          caption: 'Spektrum penjenamaan QR Pembayaran: daripada penggayaan konservatif yang selamat kepada pendekatan hiasan yang berisiko',
        },
      ],
    },
    {
      heading: 'Bahan dan Pertimbangan Cetakan',
      paragraphs: ['Bahan paparan fizikal memberi kesan ketara kepada kebolehpercayaan imbasan. Laminasi berkilat memantulkan lampu atas terus ke dalam kamera pelanggan. Bahan bertekstur boleh memesongkan tepi modul. Percetakan murah boleh mengaburkan butiran halus. Untuk pembayaran kod QR, melabur dalam kualiti: gunakan laminasi matte atau satin, pastikan pencetakan resolusi tinggi dan gantikan paparan sebelum ia menunjukkan kehausan. Kod pembayaran yang tercalar atau pudar menyebabkan anda mengalami urus niaga.', 'Pertimbangkan ketahanan dan kebolehgantian paparan. Paparan kaunter disentuh, dialihkan, terpercik dan sekali-sekala terhantuk. Reka bentuk sistem paparan anda supaya sisipan QR boleh diganti dengan mudah tanpa menggantikan keseluruhan dirian. Simpan cetakan ganti sedia, dijana daripada pautan konfigurasi anda yang terkunci, jadi kod yang haus boleh ditukar serta-merta.'],
    },
    {
      heading: 'Menguji dengan Apl Pembayaran Sebenar',
      paragraphs: ['Pengimbas kamera generik akan menyahkod hampir mana-mana kod QR yang diformatkan secara munasabah. Apl pembayaran lebih memilih. Sebelum menggunakan sebarang kod QR pembayaran, uji ia dengan setiap apl pembayaran yang mungkin digunakan oleh pelanggan anda. Dalam persekitaran berbilang pembayaran, ini mungkin bermakna ujian dengan berbilang apl perbankan, dompet digital dan platform pembayaran. Dokumentasikan apl yang telah anda uji dan versinya - apl pembayaran dikemas kini dengan kerap dan kemas kini boleh mengubah gelagat pengimbasan.', 'Uji dalam keadaan realistik: paparan sebenar, pencahayaan sebenar, jarak pengimbasan sebenar. Kod yang mengimbas serta-merta di meja anda mungkin sukar di kaunter pada pukul 5 petang apabila matahari petang mencipta silau. Uji dengan telefon pintar tertua dan paling murah yang boleh anda temui - jika ia berfungsi dengan pasti pada peranti bajet, ia akan berfungsi pada segala-galanya. Benderakan sebarang masa imbasan melebihi 2 saat untuk penyiasatan dan kemungkinan reka bentuk semula.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Senarai semak ujian yang menunjukkan pelbagai apl pembayaran, jenis peranti dan keadaan persekitaran untuk disahkan',
          caption: 'Matriks ujian QR pembayaran komprehensif yang meliputi apl, peranti dan faktor persekitaran',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Buka penjana',
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
      heading: 'Kod QR Sedia Cetak: SVG lwn PNG',
      paragraphs: ['Perbezaan antara kod QR yang mengimbas dengan sempurna dan yang gagal selalunya terletak pada cara ia dieksport dan dikendalikan dalam aliran kerja cetakan. Panduan ini menerangkan perbezaan kritikal antara format vektor (SVG) dan raster (PNG), masa untuk menggunakannya dan cara menyerahkan karya seni QR kepada pereka bentuk dan vendor cetakan dengan cara yang mengekalkan kebolehpercayaan imbasan daripada kad perniagaan kepada papan tanda bersaiz papan iklan.', 'Pengeluaran cetakan memperkenalkan pembolehubah yang tidak wujud pada skrin: hamparan dakwat, tekstur substrat, proses kemasan dan kesan kumulatif berbilang penukaran fail. Kod QR yang kelihatan sempurna dalam perisian reka bentuk anda boleh muncul daripada pencetak dengan bahagian tepi yang lembut, kontras yang dikurangkan atau modul yang diherotkan secara halus. Memahami pemilihan format dan amalan terbaik aliran kerja menghalang kegagalan senyap ini.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Pandangan yang diperbesarkan membandingkan modul QR vektor dengan tepi yang tajam berbanding modul raster yang menunjukkan artifak piksel',
          caption: 'Vektor vs raster pada skala cetakan: perbezaan ketepatan yang menentukan kebolehpercayaan imbasan',
        },
      ],
    },
    {
      heading: 'Mengapa Vektor (SVG) Diutamakan untuk Cetakan',
      paragraphs: ['Fail SVG menerangkan kod QR sebagai bentuk matematik dan bukannya grid piksel. Ini bermakna kod boleh diskalakan kepada sebarang saiz - daripada label 1cm kepada sepanduk 10 meter - tanpa kehilangan ketajaman tepi. RIP pencetak (Pemproses Imej Raster) memaparkan vektor pada resolusi asli peranti output, memastikan setiap tepi modul adalah segar seperti yang dibenarkan oleh perkakasan. Tiada interpolasi, tiada artifak anti-aliasing, tiada kabur terkumpul daripada berbilang operasi ubah saiz.', 'Di luar skalabiliti, fail SVG lebih teguh dalam aliran kerja profesional. Mereka bertahan dalam perjalanan pergi dan balik melalui perisian reka bentuk tanpa degradasi. Ia boleh diperbetulkan warna tanpa pensampelan semula. Mereka membenamkan dengan bersih ke dalam fail PDF untuk keluaran sedia tekan. Untuk mana-mana aplikasi cetakan di mana kualiti penting, SVG hendaklah menjadi format eksport lalai anda.'],
    },
    {
      heading: 'Apabila PNG Boleh Diterima',
      paragraphs: ['PNG menjadi perlu apabila aliran kerja atau platform destinasi anda tidak menyokong format vektor. Sesetengah platform web, sistem CMS papan tanda dan aliran kerja cetakan lama memerlukan imej raster. Dalam kes ini, PNG boleh berfungsi dengan baik - tetapi hanya jika anda mengikut peraturan yang ketat: eksport pada saiz dan peleraian fizikal terakhir, jangan sekali-kali meningkat selepas eksport dan elakkan sebarang pemampatan atau penukaran format yang hilang.', 'Peraturan kritikal untuk PNG ialah mengira dimensi piksel yang anda perlukan sebelum mengeksport. Jika QR anda akan mencetak pada 5cm dan pencetak anda beroperasi pada 300 DPI, anda memerlukan kira-kira 590 piksel. Eksport pada saiz ini atau lebih besar, kemudian turunkan jika perlu - jangan sekali-kali naik. Sertakan maklumat ini dalam nama fail atau metadata anda supaya pengguna akan datang tidak menyalahgunakan eksport khusus saiz secara tidak sengaja.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Antara muka kalkulator yang menunjukkan hubungan antara saiz fizikal, DPI dan dimensi piksel yang diperlukan',
          caption: 'Kalkulator resolusi cetakan: menentukan dimensi piksel minimum untuk saiz output sasaran anda',
        },
      ],
    },
    {
      heading: 'Pilihan Eksport ANQR Diterangkan',
      paragraphs: ['ANQR menawarkan beberapa mod eksport SVG untuk disesuaikan dengan aliran kerja yang berbeza. Mod True Vector menghasilkan output berasaskan laluan tulen yang sesuai untuk alat cetakan dan reka bentuk profesional. Apabila anda telah menambah tindanan raster atau kesan tertentu, ANQR boleh membenamkannya sambil mengekalkan modul vektor, atau anda boleh mengeksport versi raster sepenuhnya pada resolusi yang anda tentukan. Memahami pilihan ini membantu anda memilih eksport yang betul untuk setiap kes penggunaan.', 'Untuk eksport PNG, ANQR membolehkan anda menentukan dimensi yang tepat dan termasuk pilihan untuk latar belakang telus. Tetapan DPI membantu anda mengira saiz yang sesuai untuk cetakan, walaupun ingat bahawa DPI ialah metadata - perkara yang penting untuk cetakan ialah mempunyai piksel yang mencukupi untuk saiz fizikal anda. Apabila ragu-ragu, eksport lebih besar daripada yang anda fikir anda perlukan; mengecilkan mengekalkan kualiti manakala mengecilkan memusnahkannya.'],
    },
    {
      heading: 'Menyediakan Fail untuk Handoff',
      paragraphs: ['Apabila menghantar karya seni QR kepada pereka bentuk atau vendor cetakan, sertakan spesifikasi yang jelas: saiz fizikal yang dimaksudkan, keperluan zon senyap minimum dan sebarang pertimbangan ruang warna. Untuk aplikasi kritikal, sediakan induk SVG dan sandaran PNG resolusi tinggi, yang dilabel dengan jelas dengan kegunaan yang dimaksudkan. Sertakan pautan konfigurasi ANQR anda supaya kod boleh dijana semula jika perlu.', 'Jangkakan kesilapan biasa dalam proses penyerahan. Nyatakan dengan jelas bahawa QR tidak boleh berskala, diputar, condong atau mempunyai kesan yang dikenakan. Tentukan bahawa zon senyap mesti kekal jelas - tiada tanda potong, tanda pendaftaran atau elemen reka bentuk yang mengganggu. Jika QR akan diletakkan pada latar belakang berwarna atau fotografi, sediakan versi dengan bentuk sandaran legap untuk memastikan kontras yang mencukupi.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Gambar rajah pakej fail yang menunjukkan induk SVG, sandaran PNG, dokumen spesifikasi dan pautan konfigurasi',
          caption: 'Pakej penyerahan QR profesional: semua yang diperlukan oleh pereka bentuk atau vendor cetakan untuk pembiakan yang tepat',
        },
      ],
    },
    {
      heading: 'Mengesahkan Bukti Cetakan',
      paragraphs: ['Jangan sekali-kali meluluskan cetakan tanpa mengimbas bukti fizikal. Minta bukti yang dicetak pada substrat sebenar dengan kemasan sebenar yang akan digunakan dalam pengeluaran. Imbas bukti di bawah keadaan pencahayaan yang serupa dengan tempat bahagian akhir akan dipaparkan. Uji dengan berbilang peranti, termasuk telefon pintar lama yang mungkin bergelut dengan kualiti kecil.', 'Jika bukti mengimbas secara perlahan atau tidak konsisten, siasat sebelum meluluskan. Isu biasa termasuk kontras yang tidak mencukupi pada substrat berwarna, pelanggaran zon senyap daripada pemangkasan, tepi modul pelembut hamparan dakwat atau laminasi menghasilkan silau. Mana-mana perkara ini boleh ditangani sebelum melakukan cetakan penuh - tetapi hanya jika anda menangkapnya di peringkat pembuktian.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Senarai semak semakan bukti dengan keputusan ujian imbasan, ukuran kontras dan tandatangan kelulusan',
          caption: 'Aliran kerja pengesahan bukti cetakan: ujian sistematik sebelum melakukan kuantiti pengeluaran',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Buka penjana',
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
      heading: 'Mencipta Kod QR Animasi',
      paragraphs: ['Kod QR animasi menggabungkan kefungsian kod QR standard dengan gerakan yang menarik perhatian yang meningkatkan kadar penglibatan secara mendadak. Dalam papan tanda digital, media sosial dan paparan interaktif, animasi mengubah utiliti statik menjadi elemen visual yang menarik yang menarik perhatian dan mengundang interaksi. Panduan ini merangkumi prinsip, teknik dan kekangan praktikal untuk mencipta kod QR animasi yang mengimbas dengan pasti sambil memberikan kesan visual.', 'Cabaran asas kod QR animasi ialah mengimbangi minat visual terhadap kebolehpercayaan imbasan. Setiap bingkai mestilah boleh diimbas secara individu - pengimbas mungkin menangkap kod pada bila-bila masa dalam kitaran animasi. Kekangan ini membentuk setiap keputusan reka bentuk: elemen mana yang boleh bergerak, berapa banyak ia boleh berubah dan perkara yang mesti kekal stabil sepanjang animasi.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Paparan papan tanda digital yang menunjukkan kod QR animasi yang menarik perhatian penonton di ruang awam',
          caption: 'Kod QR animasi dalam papan tanda digital: gerakan yang menarik perhatian dan menggalakkan pengimbasan',
        },
      ],
    },
    {
      heading: 'Bagaimana Animasi Mempengaruhi Kebolehimbasan',
      paragraphs: ['Pengimbas QR berfungsi dengan menangkap satu bingkai dan menganalisis corak modul terang dan gelap. Untuk kod animasi berfungsi, setiap bingkai mesti mengandungi corak QR yang lengkap dan sah. Ini menolak animasi yang mengubah struktur kod, melarutkan modul atau mengubah corak kontras dengan ketara. Modul pembawa data - corak yang kelihatan rawak di tengah - mesti kekal secara visual stabil sepanjang masa.', 'Pendekatan animasi selamat mengubah suai elemen yang tidak membawa data: latar belakang, warna, bingkai hiasan dan elemen tindanan. Komponen struktur - pola pencari (segi empat sudut besar), pola masa (garisan berselang-seli), dan pola penjajaran (segi empat yang lebih kecil dalam kod yang lebih besar) - mesti mengekalkan kedudukan dan perkadarannya. Bekerja dalam kekangan ini masih membenarkan animasi yang dinamik dan menarik.'],
    },
    {
      heading: 'Teknik Animasi Yang Berfungsi',
      paragraphs: ['Berbasikal warna menghidupkan warna latar depan dan latar belakang melalui palet sambil mengekalkan kontras yang mencukupi pada setiap langkah. Ini menghasilkan kesan yang bertenaga dan menarik perhatian dengan risiko imbasan yang minimum - selagi kontras tidak pernah jatuh di bawah paras yang boleh dibaca. Pratetap kitaran warna ANQR direka untuk mengekalkan kebolehimbasan sepanjang kitaran.', 'Tindanan animasi meletakkan imejan bergerak di belakang corak QR separa lutsinar. Kod itu kekal stabil semasa latar belakang bernyawa - mungkin video bergelung, elemen jenama animasi atau grafik gerakan abstrak. Teknik ini memerlukan pengurusan keamatan yang teliti untuk mengelakkan latar belakang daripada mengatasi corak QR, tetapi menghasilkan hasil yang paling menarik secara visual.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Gambar rajah yang menunjukkan struktur berlapis bagi QR animasi: lapisan kod stabil di atas lapisan latar belakang animasi',
          caption: 'Prinsip pelapisan animasi: corak QR kekal malar manakala elemen latar belakang bernyawa di bawahnya',
        },
      ],
    },
    {
      heading: 'Mengkonfigurasi Parameter Animasi',
      paragraphs: ['Kadar bingkai mempengaruhi kedua-dua kelancaran visual dan saiz fail. Untuk kebanyakan aplikasi, 10-15 bingkai sesaat menyediakan gerakan yang kelihatan lancar tanpa saiz fail yang berlebihan. Kadar bingkai yang lebih tinggi menawarkan pulangan visual yang semakin berkurangan sambil meningkatkan saiz fail dengan ketara. Pertimbangkan konteks penyampaian anda - tanda digital yang besar boleh mengendalikan fail yang lebih besar daripada peletakan iklan mudah alih.', 'Tingkah laku gelung menentukan bagaimana kitaran animasi. Gelung lancar mencipta gerakan berterusan sesuai untuk papan tanda dan paparan ambien. Gelung ping-pong (maju-kemudian-undur) berfungsi dengan baik untuk animasi mudah. Untuk denyutan yang menarik perhatian, pertimbangkan animasi dengan penahanan - tempoh senyap yang diselingi oleh pergerakan yang menarik mata tanpa keletihan gerakan yang berterusan.'],
    },
    {
      heading: 'Mencipta Tindanan Animasi',
      paragraphs: ['Apabila menggunakan imej animasi (GIF, WebP animasi atau video) sebagai tindanan, ANQR mengekstrak bingkai dan menggabungkannya dengan kod QR anda. Tetapan keamatan tindanan mengawal jumlah animasi yang ditunjukkan - nilai yang lebih rendah mengutamakan kebolehimbasan manakala nilai yang lebih tinggi mengutamakan kesan visual. Uji keamatan pilihan anda merentas berbilang bingkai untuk memastikan kebolehimbasan yang konsisten.', 'Kualiti bahan sumber memberi kesan ketara kepada hasil. Gunakan tindanan dengan subjek yang jelas dan kontras yang baik. Elakkan animasi sumber dengan berkelip pantas atau perubahan kecerahan melampau yang boleh mencipta bingkai kontras rendah sekali-sekala. Pratonton kitaran animasi penuh sebelum mengeksport untuk menangkap sebarang bingkai bermasalah yang mungkin gagal untuk mengimbas.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Paparan bingkai demi bingkai bagi tindanan animasi yang menunjukkan tahap kontras dikekalkan merentas jujukan',
          caption: 'Analisis bingkai: mengesahkan kebolehimbasan yang konsisten merentas keseluruhan kitaran animasi',
        },
      ],
    },
    {
      heading: 'Pertimbangan Eksport dan Penghantaran',
      paragraphs: ['GIF kekal sebagai format animasi yang paling banyak disokong, dimainkan secara automatik dalam kebanyakan konteks tanpa memerlukan sokongan pemain video. Walau bagaimanapun, palet 256 warna GIF mengehadkan kesetiaan warna. Untuk animasi kritikal warna, pertimbangkan WebP animasi jika disokong, atau kembali kepada format video untuk kualiti tertinggi. Eksport GIF ANQR termasuk pilihan dithering untuk memaksimumkan kualiti dalam had palet.', 'Saiz fail penting untuk penghantaran. Sistem papan tanda digital, pelanggan e-mel dan platform sosial sering mengenakan had saiz. Jika animasi anda melebihi had ini, kurangkan kiraan bingkai, dimensi atau kedalaman warna. Kadangkala pemisahan animasi yang kompleks kepada gelung yang lebih pendek mencapai hasil yang lebih baik daripada pemampatan agresif yang merendahkan setiap bingkai.'],
    },
    {
      heading: 'Menguji Kod QR Beranimasi',
      paragraphs: ['Menguji kod animasi memerlukan pengimbasan pada berbilang titik dalam kitaran animasi. Jangan hanya mengimbas sekali dan menganggap kejayaan - imbas berulang kali, pada saat yang berbeza, untuk mengesahkan bahawa setiap bingkai boleh dibaca. Beri perhatian khusus kepada bingkai pada keterlaluan kitaran warna atau keamatan tindanan puncak di mana kontras mungkin paling rendah.', 'Uji pada perkakasan paparan sebenar jika boleh. Pantau penentukuran warna, sudut tontonan dan pencahayaan ambien semuanya mempengaruhi cara animasi muncul dan mengimbas. Animasi terang yang mengimbas dengan sempurna pada monitor anda mungkin hilang pada skrin luar atau menjadi tidak boleh dibaca pada sudut tontonan serong.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Matriks ujian yang menunjukkan kadar kejayaan imbasan merentas bingkai, peranti dan keadaan paparan yang berbeza',
          caption: 'Protokol ujian QR animasi: pengesahan sistematik merentas bingkai, peranti dan keadaan tontonan',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Buka penjana',
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
      heading: 'Amalan Terbaik Keselamatan dan Pematuhan QR',
      paragraphs: ['Kod QR yang direka dengan cantik yang gagal diimbas adalah lebih teruk daripada tidak berguna - ia mengecewakan pelanggan, merosakkan persepsi jenama dan membazirkan setiap sumber yang dilaburkan dalam penciptaan dan pengedarannya. Panduan ini merangkumi faktor teknikal dan praktikal yang menentukan sama ada kod QR akan mengimbas dengan pasti, dan cara menggunakan ciri keselamatan ANQR untuk menangkap masalah yang berpotensi sebelum ia mencapai pengeluaran.', 'Kebolehpercayaan kod QR bukan binari. Kod mungkin mengimbas dengan sempurna pada telefon perdana tetapi gagal pada peranti bajet. Ia mungkin berfungsi dalam pencahayaan yang ideal tetapi sukar di restoran yang malap atau cahaya matahari yang terang. Memahami faktor yang mempengaruhi kebolehimbasan membantu anda membuat pertukaran termaklum antara penggayaan visual dan kebolehpercayaan dunia sebenar.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Spektrum kebolehpercayaan yang menunjukkan kod QR daripada sangat boleh diimbas hingga boleh dibaca sedikit',
          caption: 'Spektrum kebolehimbasan: daripada kod kalis peluru kepada penggayaan yang menolak had kebolehpercayaan',
        },
      ],
    },
    {
      heading: 'Memahami Tahap Pembetulan Ralat',
      paragraphs: ['Kod QR termasuk redundansi terbina dalam yang membolehkannya dibaca walaupun sebahagiannya rosak atau dikaburkan. Tahap pembetulan ralat - L (7%), M (15%), Q (25%) atau H (30%) - menentukan berapa banyak kod yang boleh hilang semasa masih menyahkod dengan betul. Pembetulan ralat yang lebih tinggi menghasilkan kod yang lebih besar tetapi memberikan margin keselamatan untuk tindanan, ketidaksempurnaan pencetakan dan kerosakan alam sekitar.', 'Untuk kod dengan tindanan imej, tahap pembetulan ralat H adalah penting - tindanan mengaburkan sebahagian kod secara fizikal dan anda memerlukan lebihan 30% untuk mengekalkan kebolehpercayaan. Untuk kod yang bersih dan tidak digayakan dalam persekitaran terkawal, tahap M selalunya memadai. Tahap L hendaklah dikhaskan untuk situasi di mana saiz kod dikekang secara kritikal dan anda boleh menjamin keadaan murni.'],
    },
    {
      heading: 'Zon Senyap Kritikal',
      paragraphs: ['Zon senyap ialah jidar kosong yang mengelilingi setiap kod QR. Pengimbas menggunakan sempadan ini untuk mengenal pasti tempat kod bermula dan berakhir. Piawaian ISO menetapkan zon senyap minimum empat modul (empat kali lebar persegi terkecil dalam kod). Melanggar ruang ini - dengan elemen reka bentuk, tepi trim atau kandungan bersebelahan - ialah salah satu punca kegagalan imbasan yang paling biasa.', 'Penguatkuasaan zon tenang ANQR membantu mengekalkan jarak kritikal ini, tetapi anda juga mesti memastikan ia disimpan dalam reka bentuk akhir anda. Apabila menyerahkan karya seni QR, nyatakan dengan jelas keperluan zon senyap. Apabila meletakkan kod dalam reka letak, sahkan bahawa tiada unsur menceroboh ruang ini. Beberapa milimeter ruang kosong boleh bermakna perbezaan antara pengimbasan yang boleh dipercayai dan pelanggan yang kecewa.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Gambar rajah yang menunjukkan jarak zon senyap yang betul berbanding pelanggaran biasa yang menyebabkan kegagalan imbasan',
          caption: 'Keperluan zon senyap: margin tidak kelihatan yang menentukan kejayaan imbasan',
        },
      ],
    },
    {
      heading: 'Kontras dan Keselamatan Warna',
      paragraphs: ['Pengimbas QR mengesan corak modul terang dan gelap. Sebarang penggayaan yang mengurangkan kontras ini - latar depan terang, latar belakang gelap, kesan kecerunan atau tindanan kelegapan rendah - menjadikan kod lebih sukar dibaca. ANQR mengira nisbah kontras dan memberi amaran apabila pilihan warna anda menghampiri tahap berbahaya, tetapi penimbang tara terakhir sentiasa menguji dunia sebenar.', 'Persepsi warna berbeza dengan keadaan pencahayaan. Kombinasi warna yang kelihatan kontras tinggi pada monitor anda mungkin menjadi sukar untuk dibezakan di bawah lampu pijar hangat atau tiub pendarfluor yang sejuk. Jika kod anda akan digunakan dalam keadaan pencahayaan yang berbeza-beza, uji di bawah berbilang sumber cahaya dan pertimbangkan nisbah kontras yang lebih konservatif sebagai margin keselamatan.'],
    },
    {
      heading: 'Saiz Modul dan Jarak Pandangan',
      paragraphs: ['Saiz fizikal modul individu menentukan jarak maksimum dari mana kod boleh diimbas. Modul yang lebih kecil bermakna kod yang lebih kecil tetapi memerlukan jarak imbasan yang lebih dekat. Peraturan am ialah setiap modul hendaklah sekurang-kurangnya 0.5mm pada jarak pengimbasan yang dimaksudkan, meningkat secara berkadar untuk jarak yang lebih jauh. Kod pada papan iklan memerlukan modul yang lebih besar daripada kod pada kad perniagaan.', 'Apabila mengira saiz modul, pertimbangkan senario terburuk: pelanggan dengan telefon lama, dalam pencahayaan tidak sempurna, mengimbas pada jarak maksimum yang mungkin. Reka bentuk untuk pengguna ini dan semua orang akan mendapat pengalaman yang lebih baik. Pengesyoran saiz ANQR menjadi faktor dalam pembolehubah dunia sebenar ini untuk mencadangkan dimensi yang sesuai untuk kegunaan anda.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Carta yang berkaitan dengan saiz modul, dimensi cetakan dan jarak pengimbasan berkesan maksimum',
          caption: 'Panduan jarak mengimbas: memadankan saiz modul dengan keperluan penggunaan anda',
        },
      ],
    },
    {
      heading: 'Menggunakan Mod Keselamatan ANQR',
      paragraphs: ['Mod Keselamatan ANQR menyediakan maklum balas masa nyata tentang kebolehpercayaan imbasan. Ia memantau nisbah kontras, pematuhan zon senyap, keamatan tindanan dan faktor lain yang mempengaruhi kebolehimbasan. Apabila mana-mana parameter menghampiri tahap berisiko, anda akan melihat amaran dengan panduan khusus tentang cara meningkatkan kebolehpercayaan. Untuk penggunaan profesional di mana kegagalan adalah mahal, pastikan Mod Keselamatan aktif sepanjang proses reka bentuk.', 'Mod Keselamatan juga termasuk ciri pengesahan imbasan yang cuba menyahkod kod yang anda hasilkan dan melaporkan kejayaan atau kegagalan. Walaupun pengesahan dalam apl ini tidak dapat meniru setiap keadaan dunia sebenar, ia menangkap banyak isu biasa sebelum anda melabur dalam percetakan atau pengedaran. Anggap pengesahan yang berjaya sebagai bar minimum, bukan jaminan - ujian dunia sebenar kekal penting.'],
    },
    {
      heading: 'Protokol Pengujian Dunia Sebenar',
      paragraphs: ['Tiada jumlah pengesahan perisian menggantikan ujian fizikal. Cetak kod anda pada saiz yang dimaksudkan pada bahan yang mewakili. Ujinya dalam persekitaran penggunaan sebenar dengan keadaan pencahayaan yang sepadan dengan penggunaan sebenar. Imbas dengan berbilang peranti - bukan sahaja telefon utama anda, tetapi peranti Android bajet, iPhone lama dan sebarang peranti khusus yang biasa digunakan khalayak anda.', 'Dokumentasikan ujian anda secara sistematik. Rekod peranti yang diuji, dalam keadaan apa, dengan keputusan apa. Jika anda menggunakan kod pada skala besar, wujudkan kriteria penerimaan: mungkin 95% kadar kejayaan merentas kumpulan ujian peranti anda atau imbasan yang berjaya dalam masa 2 saat pada semua peranti yang diuji. Piawaian ini membantu menjadikan keputusan go/no-go objektif daripada mengharapkan yang terbaik.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Senarai semak ujian komprehensif yang meliputi peranti, syarat dan kriteria penerimaan',
          caption: 'Protokol ujian penggunaan QR: pengesahan sistematik sebelum komitmen pengeluaran',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Buka penjana',
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
