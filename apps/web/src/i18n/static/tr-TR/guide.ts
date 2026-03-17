import type { PageDefinition } from "../types";

export const guide: PageDefinition = {
  title: "ANQR Kullanım Kılavuzu",
  description: "QR kodları oluşturmak için ANQR kullanımına ilişkin eksiksiz kılavuz.",
  lastUpdated: "1 Şubat 2026",
  breadcrumb: ["Rehber"],
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Jeneratörü aç", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Learn makalelerine göz atın", type: "learn" },
    { href: "/examples?lang=${lang}", label: "QR örneklerini görüntüleyin", type: "example" },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: "Başlarken",
      paragraphs: [
        "ANQR, müşteri odaklı bir yaklaşıma sahip bir QR kod oluşturucudur. Varsayılan olarak QR kodları tarayıcınızda yerel olarak oluşturulur; hesap gerektirmez ve verileriniz gizli kalır. Profesyonel yerleştirme için sunucu tarafı API'sini de kullanabilirsiniz.",
        "Arayüzün üç arayüz seviyesi vardır: Temel, Gelişmiş ve Profesyonel. Başlıktaki sekmeleri kullanarak seviyenizi seçin. Her seviye, arayüzün ihtiyacınız olan şeye odaklanmasını sağlarken ek özelliklerin kilidini açar.",
      ],
      bullets: [
        "Temel: Düz metin/URL içeriği ve resim kaplamasıyla basit QR kodu oluşturma.",
        "Gelişmiş: QR kodlama seçenekleri, oluşturma stilleri, animasyon, çıktı formatları, genişletilmiş içerik türleri ve kaplama özelleştirmesi.",
        "Profesyonel: Filigranlar, meta veriler, paylaşım, güvenlik analizi, ödeme QR kodları ve kurumsal özellikler.",
      ],
      links: [{ href: "/?lang=${lang}", label: "Jeneratörü aç", type: "generator" }],
    },
    {
      heading: "Hızlı Başlangıç",
      paragraphs: ["İlk QR kodunuzu oluşturmak için:"],
      bullets: [
        "1. İçerik Türü açılır menüsünden bir içerik türü (URL, metin, WiFi vb.) seçin.",
        "2. Verilerinizi sağlanan alanlara girin.",
        "3. İsteğe bağlı olarak renkleri, stilleri özelleştirin ve bir kaplama görüntüsü ekleyin.",
        "4. QR kodunuzu PNG, GIF, WebP veya SVG olarak indirmek için Dışa Aktar'a tıklayın.",
      ],
      links: [
        {
          href: "/?lang=${lang}",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: "Temel Özellikler",
      paragraphs: [
        "Temel düzey, yük içeriği ve görüntü katmanları ile QR kodları oluşturmak için kolaylaştırılmış bir arayüz sağlar. Bu, başlamanın en basit yoludur.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "İçerik Türleri (Temel)",
      paragraphs: [
        "Düz Metin: Herhangi bir metni QR kod kapasitesi sınırına kadar kodlayın. Kısa mesajlar, kodlar veya tanımlayıcılar için idealdir.",
        "URL: Web adreslerini kodlayın. QR kodu tarandığında URL'yi açacaktır. http:// ve https:// protokollerini destekler.",
      ],
    },
    {
      heading: "Görüntü Yerleşimi (Temel)",
      paragraphs: [
        "QR kodunuzla harmanlanacak bir resim (JPG, PNG, GIF, WebP) yükleyin. Temel kaplama özellikleri şunları içerir:",
      ],
      bullets: [
        "Dosyadan yükle: Cihazınızdan bir resim seçin.",
        "URL'den yükle: Bir resim URL'si girin (CORS'a izin verilmelidir).",
        "Merkez Logosu: Hata düzeltmeye dayalı olarak görüntüyü merkeze yerleştirir.",
        "Karışım: Görüntünün QR deseniyle basit alfa karışımı.",
        "Yoğunluk: Kaplamanın QR kodunu ne kadar güçlü etkileyeceğini kontrol eder (%0-100).",
        "Renk Modu: Tam Renkli, Gri Tonlamalı veya Siyah Beyaz.",
        "Bulucu Desenlerini Koru: Güvenilir tarama için köşe desenlerini değiştirilmeden tutar.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic#overlay",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: "Gelişmiş Özellikler",
      paragraphs: [
        "Gelişmiş düzey, QR kodlama seçeneklerinin, oluşturma stillerinin, animasyonun, çıktı formatlarının, genişletilmiş içerik türlerinin ve gelişmiş katman özelleştirmesinin kilidini açar.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "QR Kodlama Ayarları",
      paragraphs: [
        "Sürüm: QR kodları 1-40 arası sürümlerle gelir; daha yüksek sürümler daha fazla veri tutar ancak daha büyüktür. ANQR'un içeriğinize uyan en küçük sürümü seçmesine izin vermek için 0 (Otomatik) olarak ayarlayın.",
        "Hata Düzeltme: Bir QR kodunun taranabilir durumdayken ne kadar hasara maruz kalabileceğini belirler.",
      ],
      bullets: [
        "L (Düşük): %7 hata düzeltme - en küçük boyut, en az artıklık.",
        "M (Orta): %15 hata düzeltme - dengeli seçenek.",
        "Q (Çeyrek): %25 hata düzeltme - basılı kodlar için iyidir.",
        "H (Yüksek): %30 hata düzeltme - kaplamalı kodlar veya zorlu koşullar için en iyisi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#qr-encoding",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Sessiz Bölge (Kenar)",
      paragraphs: [
        "Sessiz bölge, QR kodunun etrafındaki beyaz alandır. Tarayıcıların, kodun nerede başladığını tespit etmek için bu kenar boşluğuna ihtiyacı vardır. Standart en az 4 modül önermektedir. 4'ün altına düşürmek tarama sorunlarına neden olabilir.",
      ],
    },
    {
      heading: "Modül Stili",
      paragraphs: ["Modüller, bir QR kodunu oluşturan ayrı karelerdir. ANQR beş stil sunar:"],
      bullets: [
        "Kare: Keskin köşelere sahip klasik QR görünümü.",
        "Yuvarlatılmış: Daha samimi bir görünüm için yumuşatılmış köşeler.",
        "Noktalar: Modern bir estetik için dairesel modüller.",
        "Elmas: Ayırt edici bir desen için 45° döndürülmüş kareler.",
        "Bağlantılı: Modüller bitişik olduklarında birleşerek organik şekiller oluştururlar.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Bulucu Desen Stili",
      paragraphs: [
        "Bulucu desenleri, tarayıcıların kodu yönlendirmesine yardımcı olan QR köşelerindeki üç büyük karedir. Mevcut stiller:",
      ],
      bullets: [
        "Kare: Standart kare köşeler.",
        "Yuvarlatılmış: Yuvarlatılmış modül stiline uygun yumuşatılmış köşeler.",
        "Daire: Nokta stili kodlar için dairesel bulucu desenleri.",
      ],
    },
    {
      heading: "Hizalama ve Zamanlama Modelleri",
      paragraphs: [
        "Hizalama desenleri, distorsiyonun düzeltilmesine yardımcı olmak için daha büyük QR kodlarında (sürüm 2+) görünür. Zamanlama modelleri, bulucu modellerini birbirine bağlayan alternatif çizgilerdir.",
      ],
      bullets: [
        "Hizalama Stili: Eşleştirme Bulucu, Kare, Yuvarlak veya Daire.",
        "Zamanlama Stili: Eşleştirme Modülü, Düz veya Kesikli.",
      ],
    },
    {
      heading: "Renkler",
      paragraphs: [
        "Ön plan: QR modüllerinin rengi. Siyah (#000000) standarttır ancak her türlü koyu renk işe yarar.",
        "Arka Plan: Arka plan rengi. Beyaz (#ffffff) standarttır. Ön planla yeterli kontrastın olduğundan emin olun.",
        "Şeffaf Arka Plan: Renkli yüzeylerde kullanmak için arka planı tamamen kaldırın. Yüzeyin yeterli kontrast sağladığından emin olun.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Modül Boyutu ve Boşluğu",
      paragraphs: [
        "Modül Boyutu: Her modülün piksel cinsinden ne kadar büyük görüntüleneceğini kontrol eder. Daha büyük değerler daha büyük, taranması daha kolay kodlar oluşturur.",
        "Modül Boşluğu: Modüller arasına yüzde olarak boşluk ekler. Küçük boşluklar (%5-15) bazı durumlarda taranabilirliği artırabilir ancak aşırı boşluklar güvenilirliği azaltır.",
      ],
    },
    {
      heading: "Çıkış Ayarları",
      paragraphs: ["Format: Kullanım senaryosuna göre dışa aktarma formatınızı seçin."],
      bullets: [
        "PNG: Kayıpsız tarama formatı, çoğu kullanım için idealdir. Basılı ve dijital için en iyisi.",
        "WebP: Daha küçük dosya boyutlarına sahip modern format. Web kullanımı için iyi.",
        "GIF: Animasyonlu QR kodları için gereklidir. Şeffaflığı destekler.",
        "SVG: Sonsuz ölçeklenen vektör formatı. Büyük baskılar için veya kodu düzenlemeniz gerektiğinde en iyisi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-3",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    {
      heading: "Çıkış Boyutları",
      paragraphs: [
        "Genişlik/Yükseklik: Çıktı boyutunu piksel cinsinden ayarlayın. Yazdırma için DPI'ya göre hesaplama yapın (örneğin, 1 inçte 300 DPI = 300 piksel). Daha büyük boyutlar uzaktan daha güvenilir şekilde tarama yapar.",
      ],
    },
    {
      heading: "Animasyon Ayarları (Gelişmiş)",
      paragraphs: ["Animasyonlu QR kodu davranışını kontrol edin:"],
      bullets: [
        "Hız: Milisaniye cinsinden animasyon kare hızı.",
        "Döngü: Sürekli veya tek oynatımlı animasyon.",
        "Sıçrama: Ping-pong animasyonu yönü.",
        "Çerçeveyi Başlat: Animasyonu belirli bir kareden başlatın.",
        "Maksimum Kare Sayısı: Animasyondaki toplam kareleri sınırlayın.",
        "Kare Adımı: Daha hızlı animasyon için kareleri atlayın.",
        "Enterpolasyon: Yok, Çapraz Geçiş veya Kareler arasında Dönüşüm.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    {
      heading: "İçerik Türleri (Gelişmiş)",
      paragraphs: ["Gelişmiş düzey, ek yük biçimlerinin kilidini açar:"],
      bullets: [
        "Telefon Numarası (tel:): Aranabilir bir telefon bağlantısı oluşturur.",
        "E-posta (mailto:): İsteğe bağlı konu ve gövde içeren e-posta istemcisini açar.",
        "SMS: Bir telefon numarasına önceden doldurulmuş kısa mesaj.",
        "vCard: Ad, kuruluş, telefon, e-posta ve adresin yer aldığı tam kişi kartı.",
        "MeCard: Japonya'da popüler olan kompakt iletişim formatı.",
        "BizCard: Eski kartvizit formatı.",
        "Coğrafi Konum: Haritalarda açılan GPS koordinatları.",
        "WiFi: Otomatik bağlantı için ağ kimlik bilgileri (SSID, şifre, güvenlik türü).",
        "Takvim Etkinliği: Başlık, konum, tarih/saati içeren iCalendar biçimi.",
        "Etkinlik RSVP'si: Etkinlik kayıt sayfasına bağlantı.",
        "Takvim Aboneliği: Bir ICS/WebCal yayınına abone olun.",
        "Dosya/Belge URL'si: İndirilebilir dosyalara doğrudan bağlantı.",
        "Bulut Depolama Bağlantısı: Google Drive, Dropbox, OneDrive vb. bağlantılar",
        "Sosyal Profil: LinkedIn, Twitter, Instagram vb.ye bağlantılar.",
        "Mesajlaşma Bağlantısı: WhatsApp, Telegram, Signal derin bağlantıları.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Gelişmiş Yer Paylaşımı Özellikleri",
      paragraphs: ["Ek yer paylaşımı yetenekleri:"],
      bullets: [
        "Kırp: Görüntünüzün kare bir bölgesini seçmek için kırpmayı etkinleştirin.",
        "Yarı ton: Görüntü parlaklığına dayalı klasik baskı stili nokta deseni.",
        "Titreme: Ayrıntılı çoğaltma için hata dağılımlı renk taklidi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#overlay",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Kaplama Karışım Modları (Gelişmiş)",
      paragraphs: ["Gelişmiş seviyedeki ek karışım modları:"],
      bullets: [
        "Alt Piksel: Daha fazla ayrıntı için her modülü alt piksellere böler.",
        "Mavi Gürültü: Artefakt içermeyen desenler için mavi gürültü renk taklidini kullanır.",
        "Mozaik: Görüntü yapısını koruyan döşeme tabanlı efekt.",
        "Boşluk Doldurma: Görüntüyü modüller arasındaki boşluklara yerleştirir.",
        "Parlaklık: Görüntü parlaklığına göre modül boyutunu değiştirir.",
        "Çift Ton: Çarpıcı kontrast için görüntüyü iki renkle eşler.",
      ],
    },
    {
      heading: "Kaplama Yoğunluğu",
      paragraphs: [
        "Yer paylaşımının QR kodunu ne kadar güçlü etkileyeceğini kontrol eder (%0-100). Daha yüksek değerler daha fazla görüntü ayrıntısı gösterir ancak taranabilirliği azaltabilir. %70 civarından başlayın ve teste göre ayarlayın.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    {
      heading: "Renk Modu",
      paragraphs: ["Yer paylaşımlı görüntü nasıl işlenir:"],
      bullets: [
        "Tam Renkli: Orijinal görüntü renklerini korur.",
        "Gri tonlamalı: Siyah beyaz tonlara dönüştürür.",
        "Siyah Beyaz: Yüksek kontrastlı ikili dönüşüm.",
      ],
    },
    {
      heading: "Bulucu Desenlerini Koru",
      paragraphs: [
        "Etkinleştirildiğinde, üç köşe bulma desenini kaplama tarafından değiştirilmeden tutar. Güvenilir tarama için kesinlikle önerilir.",
      ],
    },
    {
      heading: "Görüntü Ön İşleme",
      paragraphs: [
        "Karıştırmadan önce kaplama görüntünüze filtreler uygulayın. Bu ayarlamalar, görüntünün son QR kodunda nasıl göründüğünü iyileştirebilir.",
      ],
      bullets: [
        "Parlaklık (-100 ila +100): Görüntüyü aydınlatın veya karartın.",
        "Kontrast (-100 ila +100): Ton aralığını artırın veya azaltın.",
        "Gama (0,2 ila 3,0): Doğrusal olmayan parlaklık ayarı. 1'in altındaki değerler orta tonları açar, 1'in üzerindeki değerler ise koyulaştırır.",
        "Doygunluk (-100 ila +100): Renk yoğunluğu. -100 gri tonlamalı, +100 ise aşırı doygunluktur.",
        "Ton Döndürme (0-360°): Renk tekerleğinin etrafındaki tüm renkleri kaydırın.",
        "Bulanıklaştırma (0-20 piksel): Görüntü ayrıntılarını yumuşatır.",
        "Keskinleştir (%0-100): Kenarları ve ayrıntıları geliştirin.",
        "Posterleştir (0-16 düzey): Poster efekti için renk düzeylerini azaltın.",
        "Eşik (0-255): Kesim noktasında ikili siyah/beyaza dönüştürür.",
        "Kenar Algılama: Yalnızca kenarları gösteren Sobel veya Canny algoritmaları.",
        "Ters Çevir: Tüm renkleri ters çevirin.",
      ],
    },
    {
      heading: "Sığdırma Modu",
      paragraphs: ["Kaplama görseli QR kodu alanına nasıl uyuyor:"],
      bullets: [
        "Kapak: Görüntü tüm alanı doldurur, gerekirse kırpılır.",
        "İçerik: Görüntünün tamamı görünür, kenar boşlukları olabilir.",
        "Esnetme: Görüntü tam olarak dolacak şekilde bozulur.",
      ],
    },
    {
      heading: "Dönüştürme Seçenekleri",
      paragraphs: [
        "Döndürme: Kaplamayı 90°'lik artışlarla döndürün.",
        "X/Y Çevirme: Görüntüyü yatay veya dikey olarak yansıtın.",
      ],
    },
    {
      heading: "Titreme Algoritmaları",
      paragraphs: [
        "Titreme, sürekli tonlu görüntüleri QR kodlarının temsil edebileceği desenlere dönüştürür. Titreme, Mavi Gürültü veya Gerçek Renk Taklidi karışım modları kullanıldığında kullanılabilir.",
      ],
      bullets: [
        "Hata Dağılımı: Klasik Floyd-Steinberg stili. Niceleme hatasını komşu piksellere yayar.",
        "Sıralı (Bayer): Düzenli modeller için bir eşik matrisi kullanır.",
        "Kümelenmiş Nokta: Yarı tonlu yazdırmayı simüle eder.",
        "Boşluk ve Küme: Optimize edilmiş sıralı renk taklidi.",
        "Mavi Gürültü: Görsel olarak hoş rastgele görünümlü desen.",
        "Mavi Gürültü Eşiği: Mavi gürültü dokusuyla eşik titremesi.",
        "Beyaz Gürültü: Rastgele eşik titremesi.",
        "Gauss/Üçgensel Gürültü: Farklı dağılımlara sahip gürültü.",
        "Mavi Gürültü + Hata Dağılımı: Her iki tekniği birleştiren hibrit.",
        "Ekranlı Mavi Gürültü: Ekran benzeri mavi gürültü modeli.",
        "Algısal: Daha iyi görsel sonuçlar için parlaklık ağırlıklı.",
        "Kenar Farkında: Renk taklidi sırasında görüntü kenarlarını korur.",
        "Uyarlanabilir Eşik: Yerel olarak uyarlanabilir eşikleme.",
        "Geçici Mavi Gürültü: Animasyonlu GIF'lerde, çerçeve başına desen değişir.",
      ],
    },
    {
      heading: "Difüzyon Çekirdekleri",
      paragraphs: ["Hata Dağılımı renk taklidini kullanırken hatanın nasıl dağıtılacağını seçin:"],
      bullets: [
        "Floyd-Steinberg: Klasik 4 komşulu difüzyon. İyi genel seçim.",
        "Jarvis-Judice-Ninke: 12-komşu, daha yumuşak ama daha yavaş.",
        "Stucki: Farklı ağırlıklarla JJN'ye benzer.",
        "Burkes: Basitleştirilmiş JJN, daha hızlı.",
        "Sierra: Kaliteyi ve hızı dengeleyen çekirdek ailesi.",
        "Atkinson: Işık yayılımı, ayrıntıları korur ancak grenli olabilir.",
      ],
    },
    {
      heading: "Titreşim Gücü",
      paragraphs: [
        "Ne kadar renk taklidinin uygulandığını kontrol eder (%0-100). Daha düşük değerler orijinal desenin daha fazlasını korur, daha yüksek değerler ise daha fazla görüntü ayrıntısını gösterir.",
      ],
    },
    {
      heading: "Alt Piksel Ayarları",
      paragraphs: ["Alt Piksel karışım modunu kullanırken:"],
      bullets: [
        "Izgara Boyutu: Modül başına 2×2, 3×3 veya 4×4 alt piksel. Daha yüksek = daha fazla ayrıntı.",
        "Merkez Kuralı: Katı, modülle eşleşmek için merkez alt pikseli gerektirir. Yarı Ton Merkezi varyasyona izin verir.",
        "Nötr Renk: Belirlenmemiş alt pikseller için kullanılan renk.",
        "Bulucuyu Geçersiz Kılma: Bulucu desenleri nasıl oluşturulur (Katı veya Stilize).",
      ],
    },
    {
      heading: "Noktalı Resim Ayarları",
      paragraphs: ["Yarı ton karışım modunu kullanırken:"],
      bullets: [
        "Hücre Boyutu: Modül Başına veya N×N ızgara.",
        "Nokta Şekli: Daire, Kare veya Çizgi.",
        "Parlaklık Eğrisi: Doğrusal, S Eğrisi veya Gama.",
      ],
    },
    {
      heading: "Çift Tonlu Renkler",
      paragraphs: [
        "Çift tonlu karışım modunu kullanırken Gölge rengini (koyu alanlar) ve Vurgu rengini (parlak alanlar) ayarlayın.",
      ],
    },
    {
      heading: "GIF Animasyon Ayarları",
      paragraphs: ["Animasyonlu GIF katmanlarını kullanırken:"],
      bullets: [
        "Çerçeve Gecikmelerini Kullan: Orijinal GIF zamanlamasına uyun.",
        "Maksimum FPS: Kare hızını sınırlayın (1-60 fps).",
        "İmha İşlemleri: Çerçeve imha yöntemlerine uyun veya basitleştirin.",
      ],
    },
    {
      heading: "Gelişmiş İşleme Seçenekleri",
      paragraphs: ["Ek oluşturma kontrolleri:"],
      bullets: [
        "Boşluk Modu: Yok, İç Metin, Kontur veya Negatif Boşluk boşluğu stili.",
        "Köşe Yarıçapı: Modüller için yuvarlatılmış köşelerin yüzdesi.",
        "Degrade: Modüllerde Yok, Doğrusal, Radyal veya Konik degrade.",
        "Göz Dış/İç Stil: Bulucu desen halkaları için bağımsız stil.",
        "Nokta Döndürme: Elmas/nokta modüllerini döndürün.",
        "Göz Ölçeği: Bulucu desenleri için boyut ayarı.",
        "Çerçeve Stili: Dekoratif çerçeveler ekleyin (Yuvarlak Çerçeve, Çıkartma, Etiket).",
        'Çerçeve Metni: "Beni Tara!" gibi bir metin ekleyin. çerçevelere.',
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Gelişmiş QR Kodlama",
      paragraphs: ["QR kodlamasında ince ayar yapın:"],
      bullets: [
        "Kodlama Modu: Otomatik, Sayısal, Alfanümerik, Bayt/UTF-8 veya Kanji.",
        "Minimum Sessiz Bölgeyi Zorunlu Kıl: En az 4 modül kenar boşluğu sağlayın.",
        "Maske Deseni: Modül dağıtımını kontrol etmek için otomatik (optimum) veya 0-7 arasındaki desenleri manuel olarak seçin. Farklı desenler aynı veriyi kodlarken farklı görsel görünümler oluşturur.",
        "Karakter Kodlaması: ISO-8859-1 (varsayılan Latin-1), UTF-8 (emoji dahil tam Unicode) veya Shift-JIS (Japonca). İçeriğinizin karakter gereksinimlerine göre seçim yapın.",
      ],
    },
    {
      heading: "Gelişmiş Çıkış Seçenekleri",
      paragraphs: ["Ek dışa aktarma ayarları:"],
      bullets: [
        "Dosya adı: İndirmeler için özel dosya adı.",
        "GIF Palet Boyutu: GIF çıkışında 2-256 renk.",
        "GIF Niceleyici: Medyan Kesim, NeuQuant veya Octree renk azaltma.",
        "GIF Renk Taklidi: Kapalı, Floyd-Steinberg veya Sıralı.",
        "GIF Şeffaf Rengi: Şeffaf olacak bir renk ayarlayın.",
        "SVG True Vector: Gömülü raster yerine yolları kullanın.",
        "SVG Şekil Hassasiyeti: Piksel veya Hassas yol oluşturma.",
        "SVG Gömülü Raster Yer Paylaşımı: Yer paylaşımını gömülü görüntü olarak ekleyin.",
        "Arka Planı Geçersiz Kılma: Çıktıda belirli bir arka plan rengini zorunlu kılar.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Doğrulama Seçenekleri",
      paragraphs: ["Giriş işleme ayarları:"],
      bullets: [
        "Girişi Doğrula: Kodlamadan önce içerik formatını kontrol edin.",
        "Boşlukları Kırp: Baştaki/sondaki boşlukları kaldırın.",
        "Yeni Satırları Normalleştir: Tüm satır sonlarını LF'ye dönüştürün.",
        "Maksimum Uzunluk Koruması: İçerik QR kapasitesini aşarsa uyarı verir.",
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: "Profesyonel Özellikler",
      paragraphs: [
        "Profesyonel düzey; filigranlar, meta veriler, paylaşım seçenekleri, güvenlik analizi, ödeme QR kodları ve kurumsal özellikler ekler.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Filigran",
      paragraphs: ["QR kodlarınıza filigran ekleyin:"],
      bullets: [
        "Tür: Metin, Resim veya Desen filigranı.",
        "Konum: Merkez, Köşeler, Kenarlar, Arka veya Sessiz Bölge.",
        "Opaklık: Filigran şeffaflığı (%0-100).",
        "Karışım Modu: Normal, Çarpma, Ekran veya Kaplama karıştırma.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#watermark",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Meta veriler",
      paragraphs: ["Dışa aktarılan dosyalara meta verileri gömün:"],
      bullets: [
        "Başlık, Yazar, Telif Hakkı, Lisans, Açıklama alanları.",
        "Oluşturma Zamanı: Oluşturma zaman damgasını gömün.",
        "Özel Anahtar/Değer: Rastgele meta veri çiftleri ekleyin.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#metadata",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Paylaşma",
      paragraphs: ["QR kodu yapılandırmalarınızı paylaşın:"],
      bullets: [
        "Doğrudan Bağlantı: Mevcut ayarlarınızla paylaşılabilir bir URL oluşturun.",
        "HTML Göm: Web siteleri için gömme kodunu alın.",
        "Kodlama Parametreleri: Tüm ayarları paylaşım URL'sine ekleyin.",
        "Not: Yerel dosyalardaki yer paylaşımlı görseller URL aracılığıyla paylaşılamaz.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-7",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    {
      heading: "Güvenlik Analizi",
      paragraphs: ["QR kodlarının taranabilir kalmasını sağlayın:"],
      bullets: [
        "Güvenlik Modu: Kapalı, Dengeli veya Katı tarama gereksinimleri.",
        "Min Modül Boyutu: Modül başına minimum piksel boyutu.",
        "Min Sessiz Bölge: Minimum marj modülleri.",
        "Bulucuları/Zamanlama/Hizalama/Format/Sürüm'ü Kilitle: Belirli öğeleri koruyun.",
        "ECC'ye göre Maksimum Yerleşim Yoğunluğu: Hata düzeltme düzeyine dayalı otomatik yoğunluk sınırları.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#safety",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    {
      heading: "İçerik Türleri (Profesyonel)",
      paragraphs: ["Profesyonel düzeyde ödeme ve kurumsal içerik türleri eklenir:"],
      bullets: [
        "EPC/SEPA (AB): IBAN, BIC, tutar, referans içeren Avrupa banka transferi QR kodları.",
        "UPI (Hindistan): VPA, alacaklı adı ve tutarı içeren Birleşik Ödeme Arayüzü.",
        "PayNow (Singapur): Singapur'da UEN veya cep telefonu numarasıyla hızlı ödeme.",
        "PromptPay (Tayland): Tayland ulusal ödeme sistemi.",
        "PIX (Brezilya): PIX anahtarıyla Brezilya'da anında ödeme.",
        "Kripto: İsteğe bağlı tutarda Bitcoin, Ethereum, Litecoin ödeme adresleri.",
        "Pazarlama Kampanyası Bağlantısı: Tam UTM parametresi (Pazarlama Etiketleri) takibine sahip URL'ler.",
        "Kısa Bağlantı: Dinamik/izlenebilir QR kodları için URL kısaltıcılarla kullanım içindir.",
        "GS1 Dijital Bağlantı: GTIN, seri, parti, son kullanma tarihi ile ürün tanımlaması.",
        "Uygulama Derin Bağlantısı: Özel şemalara sahip iOS/Android uygulaması derin bağlantıları.",
        "Özel Format: Formatlama veya doğrulama gerektirmeyen ham veriler.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-2",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: "Gelişmiş Modda Dille İlgili Ödemeler",
      paragraphs: [
        "Gelişmiş modu kullanırken ANQR, seçtiğiniz dille ilgili ödeme yöntemlerini otomatik olarak gösterir. Örneğin, Vietnamlı kullanıcılar VietQR'yi, Taylandlı kullanıcılar PromptPay'i ve Hint dili kullanıcıları UPI ve BharatQR'yi görüyor. Global ödeme yöntemleri (kripto para birimi, PayPal, Cash App) tüm dillerde mevcuttur. Profesyonel mod, dilden bağımsız olarak tüm ödeme standartlarının kilidini açar.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Avrupa Ödeme Standartları",
      bullets: [
        "EPC/SEPA (AB): EPC QR Kod Standardını izleyen Avrupa banka transferi QR kodları. IBAN, BIC (yurt içi için isteğe bağlı), EUR cinsinden tutar ve yapılandırılmış veya yapılandırılmamış ödeme referanslarını destekler. AB ülkelerinin yanı sıra İsviçre, Norveç, İzlanda, Lihtenştayn, Monako ve San Marino dahil olmak üzere SEPA bölgesinde kullanılır.",
        "İsviçre QR-faturası: SIX Uygulama Yönergelerine uygun İsviçre ödeme standardı. CHF ve EUR, QR-Referansını (QRR), Alacaklı Referansını (ISO 11649), yapılandırılmış alacaklı/borçlu adreslerini ve fatura bilgilerini destekler. 2022'den beri İsviçre faturaları için zorunludur.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Hindistan Ödeme Standartları",
      bullets: [
        "UPI (Hindistan): NPCI Derin Bağlantı Spesifikasyonunu izleyen Birleşik Ödeme Arayüzü. VPA'yı (Sanal Ödeme Adresi), alacaklı adını, INR cinsinden tutarı, işlem notunu, referans kimliğini, satıcı kategori kodunu ve işlem modunu destekler.",
        "BharatQR (Hindistan): Hem UPI hem de kart tabanlı ödemeleri destekleyen birleşik QR standardı. Maksimum uyumluluk için UPI VPA'yı kart PAN ile birleştirir. Satıcı adını, şehri, MM'yi, GST ayrıntılarını ve fatura/referans numaralarını içerir.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Güneydoğu Asya Ödeme Standartları",
      bullets: [
        "PayNow (Singapur): SGQR profiliyle EMVCo QR spesifikasyonunu kullanan Singapur hızlı ödeme sistemi. Proxy tanımlayıcıları olarak UEN (işletme kaydı), cep telefonu numarası veya NRIC'yi destekler. Tutar düzenlenebilirlik işaretini ve son kullanma tarihini içerir.",
        "PromptPay (Tayland): Bank of Tayland EMV profilini takip eden Tayland ulusal ödeme sistemi. Birden fazla referans alanıyla cep telefonu numarasını, ulusal kimliği, vergi kimliğini, e-cüzdan kimliğini ve fatura ödemesini destekler.",
        "QRIS (Endonezya): Hızlı Yanıt Kodu Endonezya Standardı. Satıcı kimliğini, NMID'yi (Ulusal Satıcı Kimliği), üye işyeri kriterleri sınıflandırmasını ve kolaylık ücretlerini (sabit veya yüzde) destekleyen EMV tabanlı ulusal ödeme standardı.",
        "DuitNow (Malezya): Malezya'nın anında ödeme sistemi. NRIC, mobil, pasaport, ordu kimliği ve işletme kayıt numaraları dahil olmak üzere birden fazla proxy türünü destekler.",
        "VietnamQR (Vietnam): Vietnam bankalararası transfer standardı. Banka BIN'i (NAPAS kimliği) ve hesap numarasını gerektirir. Farklı aktarım türleri (QRPUSH, QRIBFTTA, QRIBFTTC) için birden fazla hizmet kodunu destekler.",
        "QR Ph (Filipinler): InstaPay ve PESONet için Filipin QR ödeme standardı. P2M (kişiden satıcıya) işlemler için satıcı kimliğine sahip hesap numaralarını kullanır.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Doğu Asya Ödeme Standartları",
      bullets: [
        "TWQR (Tayvan): Tayvan QR ödeme standardı. Satıcı kimliğini, vergi kimliğini ve TWD tutarlarını destekler.",
        "HKQR/FPS (Hong Kong): Hong Kong Daha Hızlı Ödeme Sistemi QR kodları. Ödeme tanımlayıcıları olarak FPS kimliğini, cep telefonu numarasını veya e-postayı destekler. Tutarlar HKD cinsindendir.",
        "JPQR (Japonya): Japon birleşik QR kodu ödeme standardı. JPY tutarlarıyla satıcı kimliğini belirlemek için mağaza kimliğini kullanır.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Diğer Bölgesel Ödeme Standartları",
      bullets: [
        "PIX (Brezilya): BR Kodu spesifikasyonunu izleyen Brezilya Merkez Bankası anlık ödeme sistemi. PIX anahtarlarını (CPF, CNPJ, e-posta, telefon veya rastgele anahtar), satıcı adını/şehir, işlem kimliğini ve BRL tutarlarını destekler.",
        "AusPayNet/NPP PayID (Avustralya): Avustralya Yeni Ödeme Platformu PayID sistemi. PayID türlerini (e-posta, mobil, ABN, kuruluş kimliği) veya geleneksel BSB + hesap numarasını destekler. Ödeme yapanlar kayıtlı adı NPP aramasında gördükleri için satıcı adı isteğe bağlıdır.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Kripto Para Ödemeleri",
      bullets: [
        "Bitcoin/Litecoin (BIP-21): Cüzdan adresi, isteğe bağlı tutar ve etiket içeren standart kripto para birimi ödeme URI'leri. Tüm önemli Bitcoin ve Litecoin cüzdanlarıyla uyumludur.",
        "Lightning Network (BOLT11): Lightning Network ödeme faturaları. Minimum ücretle anında Bitcoin ödemeleri için BOLT11 kodlu fatura dizesini yapıştırın.",
        "Ethereum (EIP-681): Yerel ETH transferlerini ve ERC-20 token transferlerini destekleyen Ethereum işlem isteği URI'leri. Çoklu ağ desteği (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gaz parametreleri ve sözleşme işlev çağrıları için zincir kimliğini içerir.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Ödeme Bağlantısı Hizmetleri",
      bullets: [
        "PayPal.Me: Kullanıcı adı ve isteğe bağlı önceden doldurulmuş tutar ile PayPal ödeme bağlantıları. Alıcılar PayPal bakiyesi, kartlar veya banka hesapları aracılığıyla ödeme yapabilir.",
        "Nakit Uygulaması: İsteğe bağlı tutarla $cashtag'i kullanan Nakit Uygulaması ödeme bağlantıları. Eşler arası ödemeler için Amerika Birleşik Devletleri'nde popülerdir.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Genel EMV QR",
      bullets: [
        "EMV Genel: Özel olarak listelenmeyen ödeme planları için özel EMV Satıcı Tarafından Sunulan Mod QR kodları oluşturun. Satıcı adını, şehri, ülke kodunu (ISO 3166-1), para birimi kodunu (ISO 4217 sayısal), MM'yi, bahşiş/kolaylık ücreti seçeneklerini ve ek veri alanlarını yapılandırın. Test veya özel entegrasyonlar için kullanışlıdır.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: "Kaplama Karışım Modları (Profesyonel)",
      paragraphs: ["Profesyonel seviyede ek karışım modları:"],
      bullets: [
        "Pixelate: Pikselleştirilmiş kaplama efekti.",
        "Anahat: Yalnızca konturları gösteren kenar algılama katmanı.",
        "Dalga: Dalgalı distorsiyon efekti.",
        "Alt Piksel Boyutu: Görüntüye bağlı olarak değişken alt piksel boyutlandırması.",
        "Gerçek Titreşim: Sıralı matris seçimiyle gelişmiş renk taklidi.",
        "Aşırı: Maksimum görüntü görünürlüğü, taranabilirliği etkileyebilir.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Koruma Ayarları",
      paragraphs: [
        "Hangi QR öğelerinin katman değişikliğinden korunacağı üzerinde ayrıntılı kontrol:",
      ],
      bullets: [
        "Zamanlamayı Koru: Zamanlama modellerini değiştirilmeden tutun.",
        "Hizalamayı Koru: Hizalama desenlerini değiştirilmeden tutun.",
        "Format Bilgisini Koru: Kalkan formatı bilgi modülleri.",
        "Sürüm Bilgisini Koruyun: Kalkan sürüm bilgisi modülleri.",
      ],
    },
    {
      heading: "ECC Farkındalık Modu",
      paragraphs: [
        "Hata düzeltme kapasitesine dayalı olarak katman yoğunluğunu akıllıca dağıtır. Sistem, taranabilirliği korurken hangi modüllerin değiştirilebileceğini analiz eder.",
      ],
      bullets: [
        "Risk Bütçesi: Kullanılacak hata düzeltme kapasitesinin yüzdesi (%0-100).",
        "Daha yüksek bütçe = daha görünür yer paylaşımı ancak daha riskli taranabilirlik.",
        "Daha düşük bütçe = daha güvenli tarama ancak daha az görünür yer paylaşımı.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesyonel İşleme Seçenekleri",
      paragraphs: ["Gelişmiş oluşturma kontrolleri:"],
      bullets: [
        "Keskin Kenarlar: Keskin modül kenarları için pikselli görüntü oluşturmayı kullanın.",
        "Piksel Snap: Zemin, Yuvarlak veya Tavan piksel hizalaması.",
        "Modül Başına Renk Modu: Düz, Parlaklığa Göre, Konuma Göre, Kaplamaya Göre, Kümeye Göre.",
        "Renk Paleti: Modül başına renklendirme için özel renk paleti tanımlayın.",
        "Kontrast Koruması: Renkler arasında minimum kontrast oranını sağlayın.",
        "Min Kontrast Oranı: WCAG tarzı kontrast gereksinimi (1:1 ila 21:1).",
        "Ekstra Sınır Modülleri: Sessiz bölgenin ötesinde ek sınır.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#render",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Profesyonel Çıkış Seçenekleri",
      paragraphs: ["Kurumsal dışa aktarma ayarları:"],
      bullets: [
        "DPI: Yazdırma çözünürlüğünü ayarlayın (72-600 DPI). Baskı için 300 DPI önerilir.",
        "Sessiz Bölgeyi Dahil Et: Çıkış boyutlarında sessiz bölgeyi değiştirin.",
        "Ek Olarak Dışa Aktar: Birincil formatın yanında PDF oluşturun.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#output",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Animasyon Ayarları (Profesyonel)",
      paragraphs: ["Ek profesyonel animasyon özellikleri:"],
      bullets: [
        "Geçici Titreme: Kapalı, Mavi Gürültü veya Titreşim Korumalı kare başına renk taklidi.",
        "Desen: Yok, Darbe, Dalga, Tarama Çizgisi, Parıltı veya Sürüklenme efektleri.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#animation",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: "API Referansı",
      paragraphs: [
        "ANQR, URL parametreleri aracılığıyla QR kodları oluşturmak için sunucu tarafı bir API sağlar. Bu, istemci tarafı JavaScript olmadan web sitelerine, e-postalara, belgelere veya otomatik iş akışlarına QR kodlarını yerleştirmek için idealdir.",
        "Temel URL: https://anqr.link/api/qr",
      ],
      links: [
        { href: "/examples?lang=${lang}", label: "QR örneklerini görüntüleyin", type: "example" },
      ],
    },
    {
      heading: "Temel Parametreler",
      paragraphs: ["Gerekli ve ortak parametreler (parametre adları çevrilmez):"],
      bullets: [
        "veri (gerekli): QR kodunda kodlanacak içerik. URL kodlamalı özel karakterler.",
        "size: Piksel cinsinden resim boyutu (varsayılan: 400, maks: 2000). Belirtilmemişse kullanılır.",
        "w, h: Piksel cinsinden çıktı genişliği ve yüksekliği. Boyut parametresini geçersiz kılar.",
        "format: Çıktı formatı - png, webp veya gif (varsayılan: png).",
        "ec: Hata düzeltme düzeyi - L, M, Q veya H (varsayılan: H).",
        "fg: # olmadan onaltılık olarak ön plan rengi (varsayılan: 000000).",
        "bg: # olmadan onaltılık arka plan rengi (varsayılan: ffffff).",
        "şeffaf: Şeffaf arka plan için 1'e ayarlayın.",
        "kenar boşluğu: Modüllerdeki sessiz bölge (varsayılan: 4).",
      ],
    },
    {
      heading: "Şekillendirme Parametreleri",
      paragraphs: ["Modül ve desen stili:"],
      bullets: [
        "stil: Modül stili - kare, yuvarlak, noktalar, baklava desenli, bağlantılı.",
        "bulucu: Bulucu desen stili - kare, yuvarlak, daire.",
        "hizalama: Hizalama deseni stili - match_finder, kare, yuvarlak, daire.",
        "zamanlama: Zamanlama modeli stili - match_module, düz, kesikli.",
        "yarıçap: Köşe yarıçapı yüzdesi 0-100.",
        "boşluk: Modül boşluğu yüzdesi 0-50.",
        "boşlukModu: Boşluk modu - yok, iç metin, vuruş, negatif_boşluk.",
        "eyeOuter, eyeInner: Göz stilleri - kare, yuvarlak, daire.",
        "eyeScale: Göz ölçeği yüzdesi (varsayılan: 100).",
        "grad: Degrade türü - yok, doğrusal, radyal, konik.",
        "gradAngle: Doğrusal degradeler için degrade açısı.",
        "gradStops: Renk1, konum1, renk2, konum2,... olarak degrade durakları (ör. ff0000,0,0000ff,1).",
      ],
    },
    {
      heading: "Kaplama Parametreleri",
      paragraphs: [
        "Resim yer paylaşımı seçenekleri (yer paylaşımlı resim sunucu tarafından getirilir):",
      ],
      bullets: [
        "img: Yer paylaşımlı görselin URL'si (herkese açık olmalıdır).",
        "mod: Kaplama modu - merkez, yarı ton, karışım, parlaklık, mozaik, renk taklidi, mavi gürültü, alt piksel.",
        "yoğunluk: Kaplama yoğunluğu 0-100 (varsayılan: 100).",
        "colorMode: Kaplama renk modu - renkli, gri tonlamalı, siyah beyaz.",
        "sığdır: Kaplama nasıl uyuyor - örtün, muhafaza edin, uzatın.",
        "rot: Derece cinsinden kaplama dönüşü.",
        "flipX, flipY: Kaplamayı çevirmek için 1'e ayarlayın.",
        "keepFinders: Bulucu modellerini koruyun (varsayılan: 1).",
        "keepTiming, keepAlign: Zamanlama/hizalama modellerini korumak için 1'e ayarlayın.",
      ],
    },
    {
      heading: "Ön İşleme Parametreleri",
      paragraphs: ["Kaplamaya uygulanan görüntü ön işleme:"],
      bullets: [
        "parlaklık: Ayar -100 ila 100 (varsayılan: 0).",
        "kontrast: Ayar -100 ila 100 (varsayılan: 0).",
        "gama: Değer 0,1 ila 3 (varsayılan: 1).",
        "doygunluk: Ayar -100 ila 100 (varsayılan: 0).",
        "hue: Derece cinsinden renk tonu döndürme.",
        "bulanıklaştırma: Pikselleri bulanıklaştırın.",
        "keskinleştir: Keskinleştirme miktarı 0-100.",
        "posterleştirme: Düzeyleri posterleştirme.",
        "eşik: İkili eşik 0-255.",
        "kenar: Kenar algılama - kapalı, sobel, canny.",
        "ters çevir: Renkleri ters çevirmek için 1'e ayarlayın.",
      ],
    },
    {
      heading: "Filigran Parametreleri",
      paragraphs: ["Oluşturulan QR kodlarına filigran ekleyin:"],
      bullets: [
        "wmEn: Filigranı etkinleştirmek için 1'e ayarlayın.",
        "wmKind: Filigran türü - metin, resim, desen.",
        "wmText: Filigran metni (URL kodlu).",
        "wmImg: Filigran resminin URL'si.",
        "wmPos: Konum - merkez, köşeler, kenarlar, arka, sessiz bölge.",
        "wmOpacity: Opaklık 0-100 (varsayılan: 50).",
        "wmBlend: Karışım modu - normal, çarpma, ekran, kaplama.",
      ],
    },
    {
      heading: "Animasyon Parametreleri",
      paragraphs: ["Animasyonlu GIF çıktısı için (format=gif gerektirir):"],
      bullets: [
        "animPattern: Animasyon deseni - yok, darbe, dalga, tarama çizgisi, parıltı, kayma, color_cycle.",
        "animFrames: 1-60 arası kare sayısı (varsayılan: 24).",
        "animSpeed: Milisaniye cinsinden kare gecikmesi 10-1000 (varsayılan: 100).",
        "animSeed: Animasyon için rastgele tohum.",
        "hareket hızı: Animasyon hareket hızı - doğrusal, easy_in, easy_out, easy_in_out, sıçrama.",
      ],
    },
    {
      heading: "Çıkış Parametreleri",
      paragraphs: ["Çıkış formatı seçenekleri:"],
      bullets: [
        "kalite: WebP kalitesi 0-1 (varsayılan: 0,9).",
        "webpQ: WebP kalitesi 0-100 (varsayılan: 90).",
        "gifColors: GIF paleti boyutu 2-256 (varsayılan: 256).",
        "dpi: PNG için çıktı DPI'sı (varsayılan: 72).",
        "metaTitle, metaAuthor, metaCopy, metaDesc: PNG meta veri alanları.",
      ],
    },
    // Crop Parameters
    {
      heading: "Kırpma Parametreleri",
      paragraphs: ["Yer paylaşımlı görüntü kırpma seçenekleri:"],
      bullets: [
        "cropEn: Yer paylaşımlı kırpmayı etkinleştir 0/1 (varsayılan: 0).",
        "kırpmaX: Merkezi X'i 0-1 kesri olarak kırpın (varsayılan: 0,5).",
        "kırpmaY: Kırpma merkezi Y'yi 0-1 kesri olarak kırpın (varsayılan: 0,5).",
        "kırpmaBoyutu: Görüntünün kesri olarak kırpma boyutu 0-1 (varsayılan: 1).",
      ],
    },
    // Safety Lock Parameters
    {
      heading: "Emniyet Kilidi Parametreleri",
      paragraphs: ["Hangi QR öğelerinin katman değişikliğinden korunacağını kontrol edin:"],
      bullets: [
        "lockF: Bulucu modellerini kilitle 0/1 (varsayılan: 1).",
        "lockT: Zamanlama modellerini kilitle 0/1 (varsayılan: 1).",
        "lockA: Hizalama desenlerini kilitle 0/1 (varsayılan: 1).",
        "lockFmt: Format bilgisini kilitle 0/1 (varsayılan: 1).",
        "lockV: Sürüm bilgisini kilitle 0/1 (varsayılan: 1).",
        "SafeMode: Güvenlik modu - kapalı, dengeli, katı (varsayılan: kapalı).",
        "SafeMinPx: Piksel cinsinden minimum modül boyutu (varsayılan: 2).",
        "SafeMinQz: Minimum sessiz bölge modülleri (varsayılan: 4).",
      ],
    },
    // Auto-tuning Parameters
    {
      heading: "Otomatik Ayarlama Parametreleri",
      paragraphs: ["Otomatik optimizasyon ayarları:"],
      bullets: [
        "autoVer: QR sürümünü 0/1 otomatik olarak seç (varsayılan: 1).",
        "autoEcc: ECC düzeyini otomatik seç 0/1 (varsayılan: 0) - yalnızca sunucu tarafı ipucu.",
        "autoReduce: [YALNIZCA İSTEMCİ] Taranabilir hale gelinceye kadar yoğunluğu otomatik azalt - tarama doğrulama döngüsü gerektirir.",
      ],
    },
    // Additional Animation Parameters
    {
      heading: "Ek Animasyon Parametreleri",
      paragraphs: ["GIF çıkışı için genişletilmiş animasyon kontrolleri:"],
      bullets: [
        "döngü: Animasyon sürekli olarak 0/1 döngüye girer (varsayılan: 1).",
        "sıçrama: Masa tenisi animasyon yönü 0/1 (varsayılan: 0).",
        "ters: Animasyonu ters yönde oynat 0/1 (varsayılan: 0).",
        "colorCycle: Renk döngüsü efektini etkinleştirin 0/1 (varsayılan: 0).",
        "interp: Çerçeve enterpolasyonu - yok, çapraz geçiş, morf (varsayılan: yok).",
        "tempDither: Geçici renk taklidi - kapalı, blue_noise, flicker_safe (varsayılan: kapalı).",
        "startF: Animasyon başlangıç çerçevesi (varsayılan: 0).",
        "maxF: Oluşturulacak maksimum kare (varsayılan: 0 = otomatik).",
        "stepF: Çerçeve adım aralığı (varsayılan: 1).",
        "titreşim: [YALNIZCA İSTEMCİ] Piksel cinsinden modül titreşimi - kare başına QR yeniden oluşturma gerektirir.",
      ],
    },
    // Dithering Parameters
    {
      heading: "Titreme Parametreleri",
      paragraphs: ["Kaplama işleme için renk taklidi algoritmalarını kontrol edin:"],
      bullets: [
        "ditherKind: Titreme algoritması - error_diffusion,order_bayer, blue_noise, vb. (varsayılan:order_bayer).",
        "diffusionKernel: Hata difüzyon çekirdeği - floyd_steinberg, jarvis_judice_ninke, studi, burkes, sierra, atkinson (varsayılan: floyd_steinberg).",
        "ditherStrength: Titreme yoğunluğu 0-100 (varsayılan: 50).",
        "serpantin: Serpantin renk taklidi 0/1 (varsayılan: 0).",
        "matris: Sıralı renk taklidi matrisi - bayer2, bayer4, bayer8 (varsayılan: bayer4).",
        "bnTile: Mavi gürültü döşemesi boyutu (varsayılan: 64).",
        "bnSeed: Mavi gürültü rastgele tohum (varsayılan: 0).",
        "colorDither: Renk taklidi - yok, kanal başına, algısal (varsayılan: yok).",
      ],
    },
    // Subpixel Parameters
    {
      heading: "Alt Piksel Parametreleri",
      paragraphs: ["Alt piksel karışım modu ayarları:"],
      bullets: [
        "spGrid: Alt piksel ızgara boyutu - 2x2, 3x3, 4x4 (varsayılan: 3x3).",
        "spCenter: Merkez kuralı - katı, yarı ton_merkezli (varsayılan: katı).",
        "spNeutral: # olmadan nötr renk altıgen (varsayılan: 808080).",
        "spFinder: Bulucuyu geçersiz kılma - katı, stilize (varsayılan: katı).",
      ],
    },
    // Halftone Parameters
    {
      heading: "Noktalı Resim Parametreleri",
      paragraphs: ["Yarım ton karışım modu ayarları:"],
      bullets: [
        "htCell: Yarı ton hücre boyutu - modül başına veya nxn ızgarası (varsayılan: modül başına).",
        "htDot: Nokta şekli - daire, kare, çizgi (varsayılan: daire).",
        "htCurve: Parlaklık eğrisi - doğrusal, s eğrisi, gama (varsayılan: doğrusal).",
        "duo1: Çift tonlu gölge rengi onaltılı # olmadan (varsayılan: 000000).",
        "duo2: # olmadan çift tonlu vurgu rengi onaltılı (varsayılan: ffffff).",
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: "ECC Farkındalık Modu Parametreleri",
      paragraphs: ["Hata düzeltme kapasitesine dayalı akıllı katman dağıtımı:"],
      bullets: [
        "eccAware: ECC uyumlu modunu etkinleştirin 0/1 (varsayılan: 0).",
        "eccRisk: Risk bütçesi yüzdesi 0-100 (varsayılan: 50).",
        "eccMap: Ağırlık haritası - distance_to_finders, block_heatmap, ampirik_scan_heatmap (varsayılan: distance_to_finders).",
      ],
    },
    // Frame Parameters
    {
      heading: "Çerçeve Parametreleri",
      paragraphs: ["Dekoratif çerçeve ayarları:"],
      bullets: [
        "çerçeve: Çerçeve stili - yok, rounded_frame, çıkartma, etiket (varsayılan: yok).",
        "FrameText: Çerçevede görüntülenecek metin (URL kodlu).",
      ],
    },
    // Per-Module Color Parameters
    {
      heading: "Modül Başına Renk Parametreleri",
      paragraphs: ["Bireysel modül renklendirme seçenekleri:"],
      bullets: [
        "modColor: Renk modu - düz, parlaklığa göre, konuma göre, kaplamaya göre, kümeye göre (varsayılan: düz).",
        "cGuard: Kontrast koruması 0/1 (varsayılan: 0).",
        "minContrast: Minimum kontrast oranı 1-21 (varsayılan: 4,5).",
        "palet: Palet modu için virgülle ayrılmış onaltılık renkler.",
        "paletModu: Palet dağıtımı - konum, parlaklık, çapraz, radyal, rastgele, satır, sütun (varsayılan: konum).",
      ],
    },
    // GIF Overlay Parameters
    {
      heading: "GIF Yer Paylaşımı Parametreleri",
      paragraphs: ["Animasyonlu GIF yer paylaşımlı görsellerine ilişkin ayarlar:"],
      bullets: [
        "ovType: Kaplama türü - statik, gif, apng, webp_anim, video (varsayılan: statik).",
        "ovFramePick: Çerçeve seçimi - tümü, her_n, maksimum_kareler, süre_limit (varsayılan: tümü).",
        "gifDelays: Orijinal GIF çerçeve gecikmelerini 0/1 kullanın (varsayılan: 1).",
        "gifDispH: GIF imha işlemi - saygı gösterin, basitleştirin (varsayılan: saygı gösterin).",
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: "ECC Başına Yoğunluk Limitleri",
      paragraphs: ["Hata düzeltme düzeyi başına maksimum katman yoğunluğu:"],
      bullets: [
        "maxIntL: ECC L 0-100 için maksimum yoğunluk (varsayılan: 100).",
        "maxIntM: ECC M 0-100 için maksimum yoğunluk (varsayılan: 100).",
        "maxIntQ: ECC Q 0-100 için maksimum yoğunluk (varsayılan: 100).",
        "maxIntH: ECC H 0-100 için maksimum yoğunluk (varsayılan: 100).",
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: "QA Simülasyon Parametreleri (Yalnızca İstemci)",
      paragraphs: [
        "Bu parametreler URL uyumluluğu açısından ayrıştırılır ancak yalnızca tarayıcıda çalışır:",
      ],
      bullets: [
        "qaContrast: Kontrast kontrolünü etkinleştir 0/1 - etkileşimli doğrulama gerektirir.",
        "qaBlur: Piksel cinsinden bulanıklığı simüle edin - yalnızca etkileşimli testler için.",
        "qaNoise: Gürültü seviyesini simüle edin - yalnızca etkileşimli testler için.",
        "qaHeatmap: Okunabilirlik ısı haritasını göster 0/1 - tuval kaplama kullanıcı arayüzü gerektirir.",
      ],
    },
    // Client-Only Parameters
    {
      heading: "Yalnızca İstemci Parametreleri",
      paragraphs: [
        "Çoğu API parametresi sunucu tarafında tamamen desteklenir. [YALNIZCA İSTEMCİ] olarak işaretlenen parametreler, URL uyumluluğu açısından ayrıştırılır ancak tarayıcı özellikleri gerektirir:",
      ],
      bullets: [
        "titreşim: Modül titreşimi, kare başına QR'nin rastgele bir şekilde yeniden oluşturulmasını gerektirir.",
        "autoReduce: Yoğunluğu otomatik olarak azaltmak, yinelemeli tarama testi gerektirir.",
        "qaContrast, qaBlur, qaNoise, qaHeatmap: QA simülasyonu etkileşimli tuval doğrulaması gerektirir.",
      ],
    },
    // Additional Output Parameters
    {
      heading: "Ek Çıkış Parametreleri",
      paragraphs: ["Genişletilmiş çıktı ve dışa aktarma ayarları:"],
      bullets: [
        "fname: İndirilenler için özel dosya adı (varsayılan: anqr-qrcode).",
        "inclQz: Sessiz bölgeyi 0/1 çıkış boyutlarına dahil edin (varsayılan: 1).",
        "bgOver: # olmadan arka plan rengi onaltılıyı geçersiz kılar (bg parametresini geçersiz kılar).",
        "fmtExtra: Ek format çıktısı - yok, eps, animasyonlu_webp (varsayılan: yok). Not: eps [KISMİ]'dir.",
        "svgPrec: SVG şekil hassasiyeti - piksel, hassas (varsayılan: piksel). [KISMİ] SVG çıkışı sunucu tarafında sınırlıdır.",
        "svgEmbed: SVG 0/1'e tarama katmanını gömün (varsayılan: 1). [KISMİ] SVG çıkışı sunucu tarafında sınırlıdır.",
        "modulePx: Modül piksel boyutu (varsayılan: boyuttan otomatik olarak hesaplanır).",
        "sınır: Sessiz bölgenin ötesinde ekstra sınır modülleri (varsayılan: 0).",
        "net: Net/pikselli görüntü oluşturmayı etkinleştir 0/1 (varsayılan: 1).",
        "snap: Piksel snap modu - zemin, yuvarlak, tavan (varsayılan: zemin).",
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: "Desen Koruma Parametreleri",
      paragraphs: ["Hangi yapısal elemanların kaplamaya karşı korunduğunu kontrol edin:"],
      bullets: [
        "keepFinders: Bulucu modellerini koru 0/1 (varsayılan: 1).",
        "keepTiming: Zamanlama modellerini koru 0/1 (varsayılan: 0).",
        "keepAlign: Hizalama desenlerini koru 0/1 (varsayılan: 0).",
        "protectFmt: Format bilgi modüllerini koruyun 0/1 (varsayılan: 0).",
        "protectVer: Sürüm bilgisi modüllerini koruyun 0/1 (varsayılan: 0).",
      ],
    },
    {
      heading: "Örnek Kullanım",
      paragraphs: [
        "Temel QR kodu:",
        "https://anqr.link/api/qr?data=https://example.com",
        "Özel renklerle tasarlanmış QR kodu:",
        "https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30",
        "Yer paylaşımlı görseli içeren QR kodu:",
        "https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70",
        "Animasyonlu GIF:",
        "https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out",
      ],
      links: [
        { href: "/examples?lang=${lang}", label: "QR örneklerini görüntüleyin", type: "example" },
      ],
    },
    {
      heading: "QR Kodlarını Yerleştirme",
      paragraphs: [
        "Profesyonel modda, Paylaş özelliği yerleştirilebilir HTML ve URL'ler oluşturur. Yerleştirme şu şekilde çalışır:",
      ],
      bullets: [
        "Bağlantıyı Paylaş: Tüm ayarlarınızın URL parametreleri olarak kodlandığı ANQR uygulamasına bir URL oluşturur. Alıcılar QR kodunu görüntüleyebilir ve değiştirebilir.",
        "Resim Göm: Sunucu API'sine işaret eden bir <img> etiketi oluşturur. QR kodu sunucu tarafında işlenir ve resim olarak sunulur.",
        "Markdown'ı Göm: Belgeler ve README dosyaları için Markdown görüntü söz dizimi oluşturur.",
        "Doğrudan API URL'si: Uygulamalarda, komut dosyalarında veya diğer entegrasyonlarda kullanılacak ham API URL'si.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
    {
      heading: "HTML Örneği",
      paragraphs: [
        "Web sitenize bir QR kodu yerleştirmek için:",
        '<img src = "https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt = "QR Kodu" />',
        "Duyarlı boyutlandırma için:",
        '<img src = "https://anqr.link/api/qr? />',
        "Sunucu, uzun önbellek başlıklarına sahip yanıtları önbelleğe alır, böylece aynı URL için tekrarlanan istekler hızlı olur.",
      ],
    },
    {
      heading: "URL Formatını Paylaş",
      paragraphs: [
        "Profesyonel modda Paylaş'ı tıklattığınızda ANQR, geçerli ayarlarınızı URL parametrelerine kodlar. Format şu şekildedir:",
        "https://anqr.link/?data=...&ec=H&style=rounded&....",
        "Bu parametreler API parametrelerini yansıtır, böylece temel yolu /'den /api/qr'ye değiştirerek ve w/h parametrelerini gerektiği gibi ayarlayarak bir paylaşım URL'sini API URL'sine dönüştürebilirsiniz.",
        "Not: Yerel dosyalardan yüklenen yer paylaşımlı görseller, URL aracılığıyla paylaşılamaz; paylaşılan bağlantılarda ve API çağrılarında yalnızca URL tabanlı yer paylaşımları (img parametresi) çalışır.",
      ],
    },
    {
      heading: "Hız Limitleri ve Kullanım",
      paragraphs: [
        "API'nin makul hacimlerde kullanımı ücretsizdir. Yüksek hacimli kullanım veya garantili çalışma süresi gerektiren ticari uygulamalar için lütfen bizimle iletişime geçin.",
        "API yanıtları agresif önbelleğe alma başlıklarını içerir. En iyi performansı elde etmek için yanıtları önbelleğe alın veya aynı QR kodları için tutarlı bir şekilde aynı URL'yi kullanın.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: "En İyi Uygulamalar",
      paragraphs: ["Güvenilir QR kodları için şu yönergeleri izleyin:"],
      bullets: [
        "Yazdırmadan önce daima QR kodlarınızı birden fazla tarayıcı uygulamasıyla test edin.",
        "Kaplamaları eklerken Hata Düzeltme H (Yüksek) seçeneğini kullanın.",
        "En az 4 modül sessiz bölge (kenar boşluğu) bulundurun.",
        "Ön plan ve arka plan arasında yüksek kontrast sağlayın.",
        "Yazdırma için en az 300 DPI kullanın ve gerçek baskı boyutunda test edin.",
        "Kaplamaları kullanırken Finder Desenlerini Koru'yu etkinleştirin.",
        "Daha düşük kaplama yoğunluğuyla başlayın ve yavaş yavaş artırın.",
        "Dış mekan kullanımı için daha büyük modül boyutlarını ve daha yüksek hata düzeltmeyi düşünün.",
      ],
      links: [
        { href: "/learn?lang=${lang}", label: "Learn makalelerine göz atın", type: "learn" },
        { href: "/examples?lang=${lang}", label: "QR örneklerini görüntüleyin", type: "example" },
      ],
    },
    {
      heading: "Sorun giderme",
      paragraphs: ["Yaygın sorunlar ve çözümler:"],
      bullets: [
        "QR taramıyor: Kaplama yoğunluğunu azaltın, hata düzeltmeyi artırın, kontrastı kontrol edin.",
        "Kod çok büyük: İçerik uzunluğunu azaltın, URL kısaltıcı kullanın, daha düşük sürüm.",
        "Bulanık çıktı: Modül boyutunu artırın, sıkıştırılmış formatlar yerine PNG kullanın.",
        "Renkler yanlış görünüyor: Renk kontrastını kontrol edin, gri tonlamalı kaplama modunu deneyin.",
        "GIF animasyonlu değil: GIF formatındaki çıktıyı kullandığınızdan emin olun, kare sayısını kontrol edin.",
        "Görüntü yer paylaşımı yüklenmiyor: Uzak görüntülerdeki CORS izinlerini kontrol edin.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "İlgili kılavuzlara ve örneklere bakın",
          type: "learn",
        },
      ],
    },
    {
      heading: "Klavye Kısayolları",
      paragraphs: [
        "ANQR standart klavye kısayollarını destekler. Dışa aktarmayı tetiklemek için Ctrl/Cmd+S tuşlarını kullanın (önizlemeye odaklanıldığında).",
      ],
    },
    {
      heading: "Paylaşma ve Yerleştirme",
      paragraphs: [
        "Profesyonel modda, mevcut ayarlarınızla bir URL kopyalamak için Paylaş düğmesini tıklayın. Alıcılar tam yapılandırmanızı görmek için bu URL'yi açabilir. Not: Yerel dosyalardaki yer paylaşımlı görseller URL aracılığıyla paylaşılamaz.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Bu yapılandırmayı doğrudan ANQR oluşturucuda deneyin.",
          type: "generator",
        },
      ],
    },
  ],
  relatedLinks: [
    { href: "/learn?lang=${lang}", label: "Learn makalelerine göz atın", type: "learn" },
    { href: "/examples?lang=${lang}", label: "QR örneklerini görüntüleyin", type: "example" },
    { href: "/gallery?lang=${lang}", label: "QR örneklerini görüntüleyin", type: "gallery" },
    { href: "/?lang=${lang}", label: "Jeneratörü aç", type: "generator" },
  ],
};

export default guide;
