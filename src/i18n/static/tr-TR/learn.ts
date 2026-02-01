import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'ANQR ile öğrenin',
  description: 'QR kodlarını yalnızca işlevsel karelere değil, gerçek pazarlama varlıklarına dönüştürmek için pratik, öncelikli iş kılavuzları. Eski satış noktası kodlarını nasıl yükselteceğinizi, uyumlu ödeme QR tabelasını nasıl oluşturacağınızı, baskıya hazır dışa aktarımlar hazırlamayı, dijital ekranlarda animasyonu güvenli bir şekilde kullanmayı ve ANQR ("bağlantı") bağlantılarını kullanarak çok dilli ekipler arasında kilitli yapılandırmaları nasıl paylaşacağınızı öğrenin.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Jeneratörü aç', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'QR örneklerini görüntüleyin', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Kullanım Kılavuzunun tamamını açın', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Mevcut QR Kampanyalarını İyileştirme',
      paragraphs: ['Çoğu işletmenin menülerinde, tezgah standlarında, ambalajlarında ve promosyon malzemelerinde operasyonlarının her yerine dağılmış QR kodları vardır. Bu kodların çoğu yıllar önce temel oluşturucularla oluşturuldu ve sonuçta güven uyandırmayan veya marka kimliğinizle eşleşmeyen genel siyah beyaz kareler ortaya çıktı. Bu kapsamlı kılavuz, halihazırda oluşturduğunuz müşteri yolculuklarını aksatmadan mevcut QR altyapınızı denetlemek, yükseltmek ve optimize etmek için sistematik bir yaklaşımla size yol gösterir.', 'QR kodlarınızı değiştirmek yerine yükseltmenin stratejik avantajı, sürekliliğin korunmasında yatmaktadır. Müşterileriniz kodlarınızı tararken belirli hedefleri beklemeyi zaten öğrenmişlerdir. Kodlanmış URL\'leri aynı tutarken görsel sunumu, tarama güvenilirliğini ve marka uyumunu önemli ölçüde geliştirerek, dijital altyapınızda veya analitik takibinizde herhangi bir değişiklik gerektirmeden güveni artıran kusursuz bir geçiş yaratırsınız.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Aynı URL\'yi kodlayan modern markalı sürümün yanında soluk, genel bir QR kodunu gösteren yan yana karşılaştırma',
          caption: 'Öncesi ve sonrası: Aynı hedef URL, eski bir genel koddan profesyonel markalı bir varlığa dönüştürüldü',
        },
      ],
    },
    {
      heading: 'Eski QR Kodları Neden Düşük Performans Gösteriyor?',
      paragraphs: ['Erken benimseme aşamasında (özellikle işletmelerin temassız çözümleri uygulamaya acele ettiği 2020-2021 döneminde) oluşturulan QR kodları genellikle birkaç kritik sorundan muzdariptir. Düşük hata düzeltme ayarları, dokulu yüzeylere basıldığında veya zorlu ışık altında görüntülendiğinde onları kırılgan hale getirir. Yetersiz sessiz alanlar, kodlar diğer görsel öğelerin yakınına yerleştirildiğinde tarama hatalarına neden olur. Genel stil, marka meşruiyetini iletmekte başarısız olur, bu da tereddütlere ve tarama oranlarının düşmesine yol açar.', 'Teknik sınırlamaların ötesinde, eski kodlar genellikle kaçırılan markalama fırsatlarını temsil eder. Her QR kodu, müşterinizle bir temas noktasıdır; aktif olarak meşgul oldukları ve harekete geçmeye istekli oldukları bir an. Marka renklerinizle eşleşen, uygun güvenlik marjlarını içeren ve isteğe bağlı markalı öğeler içeren profesyonelce tasarlanmış bir kod, bu yardımcı programı her etkileşimde kimliğinizi güçlendiren bir pazarlama varlığına dönüştürür.'],
    },
    {
      heading: 'QR Kod Denetimi Gerçekleştirme',
      paragraphs: ['İşletmenizde halihazırda dağıtılan her QR kodunun kapsamlı bir envanterini oluşturarak yükseltme projenize başlayın. Fiziksel konumu, kodlanmış hedefi, yazdırılan malzemenin mevcut durumunu ve aydınlatma koşulları ve görüş açıları dahil olmak üzere tipik tarama ortamını belgeleyin. Her kodu birden fazla cihazla test edin; eski akıllı telefonlar ve uygun fiyatlı cihazlar genellikle premium telefonların maskelediği güvenilirlik sorunlarını ortaya çıkarır.', 'Tarama hatasının geliri veya müşteri deneyimini doğrudan etkilediği ödeme noktaları, check-in alanları ve promosyon vitrinleri gibi riskli konumlardaki kodlara özellikle dikkat edin. Acil yükseltme için bunlara öncelik verilmelidir. Ayrıca fotoğraf veya video içeriğinde görünen kodları da not edin; çünkü bunlar, görsel öğeleri güncellemek için pazarlama ekibinizle koordinasyon gerektirecektir.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'QR denetim kategorilerini gösteren bir kontrol listesi arayüzü: konum, durum, tarama güvenilirliği ve öncelik derecelendirmesi',
          caption: 'Yükseltme adaylarınızı belgelemek ve önceliklendirmek için sistematik QR denetim şablonu',
        },
      ],
    },
    {
      heading: 'Güvenli Yükseltme Stratejisi',
      paragraphs: ['QR yükseltmelerinin temel kuralı hedefin korunmasıdır. Mevcut her koddan tam URL\'yi çıkarın ve yeni sürümünüzde aynı şekilde kodlayın. Bu, mevcut tüm analizlerin, yönlendirme mantığının ve müşteri beklentilerinin bozulmadan kalmasını sağlar. Gelecekteki güncellemeler için hedef esnekliğine ihtiyacınız varsa, markalı bir kısa URL veya yönlendirme hizmeti sunmak için ideal zaman budur; ancak değişikliklerin bir araya gelmesini önlemek için bunu ayrı bir proje olarak uygulayın.', 'Görsel yükseltme için katmanlarda iyileştirmeler uygulayın: önce teknik güvenilirliği sağlayın (uygun hata düzeltme ve sessiz bölge), ardından marka stili ekleyin (renkler, modül şekilleri) ve son olarak isteğe bağlı geliştirmeleri (orta katmanlar, çerçeveler) düşünün. Devam etmeden önce her katman test yoluyla doğrulanmalıdır. ANQR\'nin Güvenlik Modu, stil seçimlerinin taranabilirliği tehlikeye atabileceği durumlarda uyarı vererek bu önceliklerin uygulanmasına yardımcı olur.'],
    },
    {
      heading: 'Güvenilirlikten Ödün Vermeden Marka Kimliği Ekleme',
      paragraphs: ['Etkili QR markalama, görsel etki ile tarama güvenilirliğini dengeler. Renkle başlayın: Varsayılan siyah ön planı ana marka renginizle değiştirerek arka planınızla yeterli kontrastı sağlayın. Çoğu marka için açık renkli arka plan üzerine koyu renkler en iyi sonucu verir. Düşük kontrastlı kombinasyonlardan, kenar netliğini azaltan degradelerden veya genel aydınlatma koşullarında benzer görünen renklerden kaçının.', 'Modül şeklinin özelleştirilmesi, minimum güvenilirlik etkisi ile başka bir markalama fırsatı sunar. Yuvarlak modüller, mükemmel taranabilirliği korurken daha yumuşak, daha ulaşılabilir bir görünüm oluşturur. Nokta tarzı modüller modern, ileri teknolojiye sahip markalar için iyi çalışır. Bağlantılı modüller endüstriyel veya kurumsal kimliklere uygundur. Hangi stili seçerseniz seçin, anında marka bilinirliği için tüm QR dağıtımlarınızda tutarlılığı koruyun.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Kontrast oranı göstergeleriyle birlikte optimum QR renk kombinasyonlarını gösteren bir renk tekerleği diyagramı',
          caption: 'Tarama güvenilirliğini koruyan yüksek kontrast kombinasyonlarını gösteren marka renk seçimi kılavuzu',
        },
      ],
    },
    {
      heading: 'Test ve Doğrulama Protokolü',
      paragraphs: ['Yükseltilmiş QR kodlarını sıkı testler olmadan asla dağıtmayın. Son dağıtımınızla aynı boyutta ve aynı malzeme üzerine fiziksel bir prova yazdırın. Aydınlatma değişikliklerini hesaba katmak için kodun bulunacağı gerçek yerde günün farklı saatlerinde test yapın. En az üç farklı cihaz kullanın: güncel bir amiral gemisi telefon, orta sınıf bir cihaz ve daha eski veya uygun fiyatlı bir akıllı telefon.', 'Her test için tarama sürelerini ve başarı oranlarını kaydedin. İyi optimize edilmiş bir kod, makul ölçüde modern herhangi bir cihazda 1-2 saniye içinde taranmalıdır. Tutarlı gecikmeler veya hatalar görüyorsanız, şekillendirme yoğunluğunu azaltın; kaplamaları kaldırın veya küçültün, sessiz alan boyutunu artırın veya daha yüksek bir hata düzeltme düzeyine geçin. Güvenilirlik her zaman görsel gelişmişlikten önceliklidir.'],
    },
    {
      heading: 'Tutarlılık İçin Yapılandırmanızı Kilitleme',
      paragraphs: ['Optimum yapılandırmayı doğruladıktan sonra ANQR\'nin paylaşılabilir bağlantılarını kullanarak onu koruyun. Bu, onaylanmış kodunuzu oluşturmak için kullanılan her ayarın (renkler, modül stili, hata düzeltme, boyutlandırma ve tüm kaplamalar) kalıcı bir kaydını oluşturur. Bu bağlantıyı tasarım ekibinizle, baskı sağlayıcılarınızla ve gelecekte kodu çoğaltması gerekebilecek herkesle paylaşın.', 'Bu yapılandırma kilidi, birçok QR dağıtımını rahatsız eden kademeli bozulmayı önler. Bu olmadan, personel ekran görüntülerinden kodları yeniden oluşturur, tasarımcılar ayarları bellekten yeniden oluşturur ve baskı satıcıları \'yararlı\' ayarlamalar yapar. Her varyasyon potansiyel sorunları beraberinde getirir. Kilitli bir yapılandırma bağlantısıyla her kopya, test edilmiş, onaylanmış orijinalinizle aynıdır.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Yapılandırma sapmasını gösteren bir diyagram: tek bir doğruluk kaynağı bağlantısına karşı, varyantlara yol açan yeniden yaratmalara yol açan ekran görüntüleri',
          caption: 'Tüm QR çoğaltmaları için tek bir yetkili kaynak oluşturarak konfigürasyon kaymasını önleyin',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR örneklerini görüntüleyin',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Perakende Ödemeler için QR Kodları',
      paragraphs: ['Ödeme QR kodları perakende sektörünün en zorlu ortamında, yani işlem anında çalışır. Müşteriler genellikle arkalarında kuyruk oluşurken ödemeye hazırdır ve gecikmenin her saniyesi sürtüşmeye neden olur. Ancak bu yüksek baskı anı aynı zamanda markanın güçlendirilmesi için de önemli bir fırsattır. Bu kılavuz, müşteri güvenini oluşturan profesyonel, markalı bir görünüm sunarken bankacılık uygulamalarında anında tarayan ödeme QR kodlarının nasıl oluşturulacağını açıklamaktadır.', 'QR kod ödemelerinin temel prensibi estetikten ziyade güvenilirliktir. Bir müşterinin bankacılık uygulamasında taranamayan, güzel tasarlanmış bir kod, yarım kalan işlemlerde ve hayal kırıklığına uğramış müşterilerde, muhafazakar bir tasarımın yapabileceğinden çok daha fazlasına mal olacaktır. Uyumlulukla başlayın, güvenilirliği ekleyin, ardından markalamayı yalnızca birincil işlevden ödün vermeyecek şekilde dikkatli bir şekilde katmanlayın.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Bankacılık uygulamasına sahip bir akıllı telefon tarafından taranan ödeme QR kodunu gösteren perakende satış tezgahı ekranı',
          caption: 'Ödeme QR kodları, gerçek dünyadaki sayaç koşulları altında bankacılık ve cüzdan uygulamalarıyla anında çalışmalıdır',
        },
      ],
    },
    {
      heading: 'Ödeme QR Standartlarını Anlamak',
      paragraphs: ['Ödeme QR kodları genellikle yük formatını belirleyen bölgesel standartlara uygundur. Singapur\'da PayNow QR özel bir biçimlendirme kullanır. Hindistan\'da UPI kodları BharatQR veya UPI derin bağlantı standartlarına uygundur. Avrupa SEPA ödemelerinde EPC QR kodları kullanılır. Her standart, bankacılık uygulamalarının ödeme bilgilerini anında tanıyabilmesini ve işleyebilmesini sağlamak için mevcuttur. Bu standartlardan biraz bile sapmak, ödeme uygulamalarının genel kamera tarayıcılarının sorunsuzca okuduğu kodları reddetmesine neden olabilir.', 'ANQR, satıcı ayrıntılarınızı otomatik olarak uyumlu veriler halinde biçimlendiren başlıca ödeme standartlarına yönelik şablonlar içerir. Küçük biçimlendirme hataları bile işlem hatalarına neden olabileceğinden, ödeme dizelerini manuel olarak oluşturmak yerine her zaman bu şablonları kullanın. Bölgenizin ödeme standardı şablon olarak mevcut değilse tam biçimlendirme gereksinimleri için ödeme sağlayıcınızın teknik belgelerine bakın.'],
    },
    {
      heading: 'Sayaç Göstergeleri için Boyutlandırma ve Yerleştirme',
      paragraphs: ['Tezgah üstü QR kodları benzersiz fiziksel zorluklarla karşı karşıyadır. Müşteriler kol mesafesinde, genellikle açılı olarak, bazen hapşırma korumaları veya vitrinler aracılığıyla tarama yapar. Tepe aydınlatması parlama noktaları oluşturur. Kod, dikkat ve net görüş açısı için diğer sayaç karmaşasıyla rekabet eder. Ödeme QR\'nizi cömertçe boyutlandırın - çoğu sayaç uygulaması için minimum 4-5 cm önerilir; kod camın arkasında veya loş bir alanda bulunuyorsa ölçek büyütülür.', 'Boyut kadar konum da önemlidir. Kodu, müşterilerin kuyruğu engellemeden veya garip bir şekilde uzanmadan telefonlarını rahatça tutabilecekleri bir yere yerleştirin. Ekranı düz bir şekilde yerleştirmek yerine müşteriye doğru açı verin. Mümkünse, tavan aydınlatmasından kaynaklanan parlamayı en aza indirmek için mat laminasyon veya yansıtıcı olmayan ekran malzemeleri kullanın. Aydınlatma sorunlarını yakalamak için son yerleşimi günün farklı saatlerinde test edin.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Farklı sayaç konfigürasyonları için en uygun QR yerleştirme yüksekliklerini ve açılarını gösteren bir diyagram',
          caption: 'Sayaç yerleştirme kılavuzu: güvenilir ödeme taraması için optimum yükseklikler, açılar ve mesafeler',
        },
      ],
    },
    {
      heading: 'Ödeme Kodları için Muhafazakar Markalama',
      paragraphs: ['Ödeme uygulamaları genel kamera tarayıcılarına göre daha az bağışlayıcıdır. Birçok bankacılık uygulaması, esneklik yerine hız için optimize edilmiş daha eski, daha basit QR okuma algoritmalarını kullanır. Bu, bir telefon kamerasıyla mükemmel şekilde çalışan stilin belirli ödeme uygulamalarında başarısız olabileceği anlamına gelir. Marka bilinci oluşturmada muhafazakar olun: Güçlü kontrastı koruyorsa ön planda marka renginizi kullanın, ancak tanınmayı engelleyebilecek degradelerden, ağır kaplamalardan veya dekoratif öğelerden kaçının.', 'Ortada bir logo veya yer paylaşımı istiyorsanız, bunu son derece küçük tutun (QR alanının %10-15\'ini geçmeyecek şekilde) ve müşterilerinizin kullanabileceği her ödeme uygulamasıyla kapsamlı bir şekilde test edin. Pek çok işletme, özellikle ödeme kodlarında herhangi bir yer paylaşımı yapılmamasını tercih ediyor ve bu stili, güvenilirlik gereksinimlerinin daha az sıkı olduğu QR kodlarını pazarlamak için kullanıyor. Ödeme kodunun görevi görsel olarak etkilemek değil, işlemleri gerçekleştirmektir.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Ödeme QR kodları için kabul edilebilir ve riskli markalama düzeylerini gösteren bir karşılaştırma',
          caption: 'Ödeme QR markalama yelpazesi: güvenli muhafazakar stilden riskli dekoratif yaklaşımlara kadar',
        },
      ],
    },
    {
      heading: 'Malzeme ve Baskıyla İlgili Hususlar',
      paragraphs: ['Fiziksel ekran malzemesi tarama güvenilirliğini önemli ölçüde etkiler. Parlak laminasyon, tavan ışıklarını doğrudan müşterinin kamerasına yansıtır. Dokulu malzemeler modül kenarlarını bozabilir. Ucuz baskı ince ayrıntıları bulanıklaştırabilir. Ödeme QR kodları için kaliteye yatırım yapın: mat veya saten laminasyon kullanın, yüksek çözünürlüklü baskı sağlayın ve ekranları aşınma göstermeden değiştirin. Çizilmiş veya soluk bir ödeme kodu, işlemlerinize mal olur.', 'Ekranın dayanıklılığını ve değiştirilebilirliğini göz önünde bulundurun. Tezgah ekranlarına dokunulur, hareket ettirilir, sıçrar ve ara sıra devrilir. Görüntüleme sisteminizi, standın tamamını değiştirmeden QR eklentisinin kolayca değiştirilebileceği şekilde tasarlayın. Kilitli yapılandırma bağlantınızdan oluşturulan yedek baskıları hazır tutun, böylece aşınmış kodlar hemen değiştirilebilir.'],
    },
    {
      heading: 'Gerçek Ödeme Uygulamalarıyla Test Etme',
      paragraphs: ['Genel kamera tarayıcıları hemen hemen tüm makul biçimlendirilmiş QR kodlarını çözecektir. Ödeme uygulamaları daha seçicidir. Herhangi bir ödeme QR kodunu dağıtmadan önce, onu müşterilerinizin kullanabileceği her ödeme uygulamasında test edin. Çoklu ödeme ortamlarında bu, birden fazla bankacılık uygulaması, dijital cüzdan ve ödeme platformuyla test yapmak anlamına gelebilir. Hangi uygulamaları test ettiğinizi ve sürümlerini belgeleyin; ödeme uygulamaları sık sık güncellenir ve bir güncelleme, tarama davranışını değiştirebilir.', 'Gerçekçi koşullar altında test edin: gerçek ekran, gerçek aydınlatma, gerçek tarama mesafesi. Masanızda anında taranan bir kod, öğleden sonra güneşinin parıldadığı saat 17.00\'de tezgahta zorlanabilir. Bulabileceğiniz en eski, en ucuz akıllı telefonla test edin; eğer uygun fiyatlı bir cihazda güvenilir bir şekilde çalışıyorsa, her şey üzerinde çalışacaktır. Araştırma ve olası yeniden tasarım için 2 saniyenin üzerindeki tarama sürelerini işaretleyin.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Doğrulanacak çeşitli ödeme uygulamalarını, cihaz türlerini ve çevre koşullarını gösteren bir test kontrol listesi',
          caption: 'Uygulamaları, cihazları ve çevresel faktörleri kapsayan kapsamlı ödeme QR test matrisi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'QR örneklerini görüntüleyin',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Baskıya Hazır QR Kodları: SVG vs PNG',
      paragraphs: ['Mükemmel şekilde taranan bir QR kodu ile başarısız olan bir QR kodu arasındaki fark, genellikle bunun nasıl dışa aktarıldığına ve yazdırma iş akışında nasıl işlendiğine bağlıdır. Bu kılavuz, vektör (SVG) ve raster (PNG) formatları arasındaki kritik farkları, her birinin ne zaman kullanılacağını ve QR resminin, kartvizitlerden reklam panosu boyutundaki tabelalara kadar tarama güvenilirliğini koruyacak şekilde tasarımcılara ve baskı satıcılarına nasıl dağıtılacağını açıklamaktadır.', 'Baskı üretimi, ekranda bulunmayan değişkenleri ortaya çıkarır: mürekkep yayılımı, alt tabaka dokusu, sonlandırma işlemleri ve birden fazla dosya dönüştürmenin kümülatif etkisi. Tasarım yazılımınızda mükemmel görünen bir QR kodu, yazıcıdan kenarları yumuşatılmış, kontrastı azaltılmış veya hafifçe bozulmuş modüllerle ortaya çıkabilir. Format seçimini ve iş akışındaki en iyi uygulamaları anlamak bu sessiz hataları önler.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Keskin kenarlara sahip vektör QR modüllerini piksel yapaylıklarını gösteren raster modüllerle karşılaştıran büyütülmüş bir görünüm',
          caption: 'Baskı ölçeğinde vektör ve raster: tarama güvenilirliğini belirleyen hassasiyet farkı',
        },
      ],
    },
    {
      heading: 'Baskı İçin Neden Vektör (SVG) Tercih Edilir?',
      paragraphs: ['SVG dosyaları, QR kodlarını piksel ızgaraları yerine matematiksel şekiller olarak tanımlar. Bu, kodun, herhangi bir kenar keskinliği kaybı olmadan, 1 cm\'lik bir etiketten 10 metrelik bir banner\'a kadar herhangi bir boyuta ölçeklendirilebileceği anlamına gelir. Yazıcının RIP\'si (Raster Görüntü İşlemcisi), vektörleri çıkış cihazının doğal çözünürlüğünde işleyerek her modülün kenarının donanımın izin verdiği ölçüde net olmasını sağlar. Enterpolasyon yok, kenar yumuşatma bozuklukları yok, çoklu yeniden boyutlandırma işlemlerinden kaynaklanan birikmiş bulanıklık yok.', 'Ölçeklenebilirliğin ötesinde, SVG dosyaları profesyonel iş akışlarında daha sağlamdır. Tasarım yazılımı aracılığıyla gidiş-dönüş yolculuklarda bozulma olmadan hayatta kalırlar. Yeniden örneklemeye gerek kalmadan renk düzeltmesi yapılabilir. Baskıya hazır çıktı için PDF dosyalarına temiz bir şekilde yerleştirilirler. Kalitenin önemli olduğu tüm baskı uygulamaları için SVG, varsayılan dışa aktarma formatınız olmalıdır.'],
    },
    {
      heading: 'PNG Ne Zaman Kabul Edilebilir?',
      paragraphs: ['İş akışınız veya hedef platformunuz vektör formatlarını desteklemediğinde PNG gerekli hale gelir. Bazı web platformları, tabela CMS sistemleri ve eski yazdırma iş akışları taramalı görüntüler gerektirir. Bu durumlarda PNG iyi çalışabilir; ancak yalnızca katı kurallara uymanız durumunda: Son fiziksel boyutta ve çözünürlükte dışa aktarın, dışa aktardıktan sonra asla ölçeği büyütmeyin ve kayıplı sıkıştırma veya format dönüştürme işlemlerinden kaçının.', 'PNG için kritik kural, dışa aktarmadan önce gerekli piksel boyutlarını hesaplamaktır. QR\'niz 5 cm\'de yazdıracaksa ve yazıcınız 300 DPI\'da çalışıyorsa yaklaşık 590 piksele ihtiyacınız vardır. Bu boyutta veya daha büyük boyutta dışa aktarın, ardından gerekirse ölçeği küçültün; asla büyütmeyin. Gelecekteki kullanıcıların yanlışlıkla boyuta özel bir dışa aktarma işlemini kötüye kullanmaması için bu bilgiyi dosya adınıza veya meta verilerinize ekleyin.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Fiziksel boyut, DPI ve gerekli piksel boyutları arasındaki ilişkiyi gösteren bir hesap makinesi arayüzü',
          caption: 'Baskı çözünürlüğü hesaplayıcısı: hedef çıktı boyutunuz için minimum piksel boyutlarını belirleme',
        },
      ],
    },
    {
      heading: 'ANQR Dışa Aktarma Seçenekleri Açıklandı',
      paragraphs: ['ANQR, farklı iş akışlarına uyacak çeşitli SVG dışa aktarma modları sunar. True Vector modu, baskı ve profesyonel tasarım araçları için ideal, saf yol tabanlı çıktı üretir. Raster kaplamalar veya belirli efektler eklediğinizde ANQR, vektör modüllerini korurken bunları gömebilir veya tamamen rasterleştirilmiş bir sürümü belirttiğiniz çözünürlükte dışa aktarabilirsiniz. Bu seçenekleri anlamak, her kullanım durumu için doğru dışa aktarımı seçmenize yardımcı olur.', 'PNG dışa aktarmaları için ANQR, tam boyutları belirtmenize olanak tanır ve şeffaf arka planlar için seçenekler içerir. DPI ayarı, baskı için uygun boyutları hesaplamanıza yardımcı olur, ancak DPI\'nın meta veri olduğunu unutmayın; baskı için önemli olan, fiziksel boyutunuz için yeterli piksele sahip olmaktır. Şüpheye düştüğünüzde, ihtiyacınız olduğunu düşündüğünüzden daha fazlasını ihraç edin; ölçeği küçültmek kaliteyi korurken, büyütmek kaliteyi yok eder.'],
    },
    {
      heading: 'Dosyaları Aktarma İçin Hazırlama',
      paragraphs: ['QR resmini tasarımcılara veya baskı satıcılarına verirken net spesifikasyonlara yer verin: amaçlanan fiziksel boyut, minimum sessiz bölge gereksinimleri ve renk alanıyla ilgili hususlar. Kritik uygulamalar için, kullanım amaçları açıkça etiketlenmiş, hem bir SVG ana kopyası hem de yüksek çözünürlüklü bir PNG yedeği sağlayın. Gerektiğinde kodun yeniden oluşturulabilmesi için ANQR yapılandırma bağlantınızı ekleyin.', 'Devir işlemindeki yaygın hataları tahmin edin. QR\'nin ölçeklenmemesi, döndürülmemesi, eğilmemesi veya efekt uygulanmaması gerektiğini açıkça belirtin. Sessiz bölgenin temiz kalması gerektiğini belirtin; kırpma işaretleri, kayıt işaretleri veya izinsiz giren tasarım öğeleri olmamalıdır. QR renkli veya fotografik bir arka plan üzerine yerleştirilecekse, yeterli kontrastı sağlamak için opak arka planlı bir versiyon sağlayın.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'SVG ana dosyasını, PNG yedeklemesini, teknik özellikler belgesini ve yapılandırma bağlantısını gösteren bir dosya paketi şeması',
          caption: 'Profesyonel QR aktarma paketi: Bir tasarımcının veya baskı satıcısının doğru çoğaltım için ihtiyaç duyduğu her şey',
        },
      ],
    },
    {
      heading: 'Baskı Provalarının Doğrulanması',
      paragraphs: ['Fiziksel bir provayı taramadan asla bir baskı işlemini onaylamayın. Üretimde kullanılacak gerçek son işlemin gerçek alt tabaka üzerine basılmış bir provasını talep edin. Provayı, son parçanın sergileneceği yere benzer aydınlatma koşulları altında tarayın. Marjinal kalite sorunu yaşayabilecek eski akıllı telefonlar da dahil olmak üzere birden fazla cihazla test yapın.', 'Kanıt yavaş veya tutarsız bir şekilde taranıyorsa onaylamadan önce araştırın. Yaygın sorunlar arasında renkli alt tabakalarda yetersiz kontrast, kesmeden kaynaklanan sessiz bölge ihlalleri, mürekkep yayılımı yumuşatıcı modül kenarları veya laminasyonun parlama yaratması yer alır. Bunlardan herhangi biri, tam bir baskı işlemine başlamadan önce ele alınabilir; ancak yalnızca bunları prova aşamasında yakalarsanız.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Tarama testi sonuçlarını, kontrast ölçümlerini ve onay imzalarını içeren bir prova inceleme kontrol listesi',
          caption: 'Baskı kanıtı doğrulama iş akışı: üretim miktarlarına karar vermeden önce sistematik testler',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'QR örneklerini görüntüleyin',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Animasyonlu QR Kodları Oluşturma',
      paragraphs: ['Animasyonlu QR kodları, standart QR kodlarının işlevselliğini, etkileşim oranlarını önemli ölçüde artıran göz alıcı hareketle birleştirir. Dijital tabelalarda, sosyal medyada ve etkileşimli ekranlarda animasyon, statik bir yardımcı programı, dikkat çeken ve etkileşime davet eden ilgi çekici bir görsel öğeye dönüştürür. Bu kılavuz, görsel etki sağlarken güvenilir bir şekilde tarayan animasyonlu QR kodları oluşturmanın ilkelerini, tekniklerini ve pratik kısıtlamalarını kapsar.', 'Animasyonlu QR kodlarının temel zorluğu, görsel ilgi ile tarama güvenilirliğini dengelemektir. Her kare ayrı ayrı taranabilir olmalıdır; bir tarayıcı, animasyon döngüsünün herhangi bir noktasında kodu yakalayabilir. Bu kısıtlama her tasarım kararını şekillendirir: hangi öğeler hareket edebilir, ne kadar değişebilir ve animasyon boyunca nelerin sabit kalması gerekir.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Kamusal alanda izleyicinin dikkatini çeken animasyonlu bir QR kodunu gösteren dijital tabela ekranı',
          caption: 'Dijital tabelada animasyonlu QR kodları: dikkat çeken ve taramayı teşvik eden hareket',
        },
      ],
    },
    {
      heading: 'Animasyon Taranabilirliği Nasıl Etkiler?',
      paragraphs: ['QR tarayıcılar, tek bir kareyi yakalayıp açık ve koyu modüllerin desenini analiz ederek çalışır. Animasyonlu bir kodun çalışması için her karenin eksiksiz, geçerli QR modelini içermesi gerekir. Bu, kod yapısını değiştiren, modülleri çözen veya kontrast modelini önemli ölçüde değiştiren animasyonları hariç tutar. Veri taşıyan modüller (merkezdeki görünüşte rastgele desen) baştan sona görsel olarak sabit kalmalıdır.', 'Güvenli animasyon yaklaşımları, veri taşımayan öğeleri değiştirir: arka planlar, renkler, dekoratif çerçeveler ve kaplama öğeleri. Yapısal bileşenler (bulucu desenler (büyük köşe kareleri), zamanlama desenleri (alternatif çizgiler) ve hizalama desenleri (büyük kodlarda daha küçük kareler) konumlarını ve oranlarını korumalıdır. Bu kısıtlamalar dahilinde çalışmak hâlâ şaşırtıcı derecede dinamik ve ilgi çekici animasyonlara olanak tanıyor.'],
    },
    {
      heading: 'İşe Yarayan Animasyon Teknikleri',
      paragraphs: ['Renk döngüsü, her adımda yeterli kontrastı korurken ön plan ve arka plan renklerini bir palet aracılığıyla canlandırır. Bu, kontrast asla okunabilir seviyelerin altına düşmediği sürece minimum tarama riskiyle canlı, dikkat çekici bir etki yaratır. ANQR\'nin renk döngüsü ön ayarları, döngü boyunca taranabilirliği koruyacak şekilde tasarlanmıştır.', 'Animasyonlu katmanlar, hareketli görüntüleri yarı şeffaf bir QR modelinin arkasına yerleştirir. Arka plan canlandırılırken kod sabit kalır (örneğin, döngü halindeki bir video, animasyonlu marka öğeleri veya soyut hareketli grafikler). Bu teknik, arka planın QR desenini aşmasını önlemek için dikkatli yoğunluk yönetimi gerektirir, ancak görsel olarak en çarpıcı sonuçları yaratır.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Animasyonlu bir QR\'nin katmanlı yapısını gösteren bir diyagram: animasyonlu arka plan katmanı üzerinde kararlı kod katmanı',
          caption: 'Animasyon katmanlama ilkesi: Arka plan öğeleri altta hareket ederken QR deseni sabit kalır',
        },
      ],
    },
    {
      heading: 'Animasyon Parametrelerini Yapılandırma',
      paragraphs: ['Kare hızı hem görsel düzgünlüğü hem de dosya boyutunu etkiler. Çoğu uygulama için saniyede 10-15 kare, aşırı dosya boyutları olmadan düzgün görünümlü hareket sağlar. Daha yüksek kare hızları, dosya boyutlarını önemli ölçüde artırırken görsel getirilerin azalmasını sağlar. Teslimat bağlamınızı göz önünde bulundurun; büyük bir dijital tabela, mobil reklam yerleşimine göre daha büyük dosyaları işleyebilir.', 'Döngü davranışı, animasyonun nasıl döndüğünü belirler. Kesintisiz döngüler, tabelalar ve ortam gösterimleri için ideal olan sürekli hareket oluşturur. Ping-pong (ileri-sonra-geri) döngüleri basit animasyonlar için iyi çalışır. Dikkat çekici darbeler için, sürekli hareket yorgunluğu olmadan gözü çeken hareketlerle noktalanan hareketsizlik dönemleri olan tutmalı animasyonları düşünün.'],
    },
    {
      heading: 'Animasyonlu Kaplamalar Oluşturma',
      paragraphs: ['Animasyonlu görüntüleri (GIF\'ler, animasyonlu WebP\'ler veya video) kaplama olarak kullanırken, ANQR çerçeveleri çıkarır ve bunları QR kodunuzla birleştirir. Kaplama yoğunluğu ayarı, animasyonun ne kadarının gösterileceğini kontrol eder; daha düşük değerler taranabilirliğe öncelik verirken, daha yüksek değerler görsel etkiyi destekler. Tutarlı taranabilirlik sağlamak için seçtiğiniz yoğunluğu birden fazla karede test edin.', 'Kaynak malzeme kalitesi sonuçları önemli ölçüde etkiler. Net konulara ve iyi kontrasta sahip kaplamalar kullanın. Ara sıra düşük kontrastlı kareler oluşturabilecek hızlı yanıp sönen veya aşırı parlaklık değişiklikleri içeren kaynak animasyonlarından kaçının. Taranmaması muhtemel sorunlu kareleri yakalamak için dışa aktarmadan önce tam animasyon döngüsünü önizleyin.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Sekans boyunca korunan kontrast seviyelerini gösteren animasyonlu bir kaplamanın kare kare görünümü',
          caption: 'Çerçeve analizi: tüm animasyon döngüsü boyunca tutarlı taranabilirliğin doğrulanması',
        },
      ],
    },
    {
      heading: 'İhracat ve Teslimatla İlgili Hususlar',
      paragraphs: ['GIF, en yaygın olarak desteklenen animasyon formatı olmaya devam ediyor ve çoğu bağlamda video oynatıcı desteği gerektirmeden otomatik olarak oynatılıyor. Ancak GIF\'in 256 renkli paleti renk doğruluğunu sınırlar. Renk açısından kritik animasyonlar için, desteklendiği durumlarda animasyonlu WebP\'yi düşünün veya en yüksek kalite için video formatlarına geri dönün. ANQR\'ın GIF dışa aktarımı, palet sınırlamaları dahilinde kaliteyi en üst düzeye çıkarmak için renk taklidi seçeneklerini içerir.', 'Dosya boyutu teslimat için önemlidir. Dijital tabela sistemleri, e-posta istemcileri ve sosyal platformlar genellikle boyut sınırlamaları getirir. Animasyonunuz bu sınırları aşarsa kare sayısını, boyutları veya renk derinliğini azaltın. Bazen karmaşık bir animasyonu daha kısa bir döngüye bölmek, her kareyi bozan agresif sıkıştırmadan daha iyi sonuçlar verir.'],
    },
    {
      heading: 'Animasyonlu QR Kodlarını Test Etme',
      paragraphs: ['Animasyonlu kodları test etmek, animasyon döngüsünde birden fazla noktada tarama yapılmasını gerektirir. Yalnızca bir kez tarayıp başarılı olduğunuzu varsaymayın; her karenin okunabilir olduğunu doğrulamak için farklı zamanlarda tekrar tekrar tarayın. Renk döngüsünün uç noktalarındaki veya kontrastın en düşük olabileceği yoğunluk zirvelerindeki karelere özellikle dikkat edin.', 'Mümkün olduğunda gerçek ekran donanımını test edin. Monitörün renk kalibrasyonu, görüntüleme açısı ve ortam aydınlatması, animasyonun nasıl göründüğünü ve tarandığını etkiler. Monitörünüzde mükemmel bir şekilde taranan parlak bir animasyon, dış mekan ekranında soluklaşabilir veya eğik görüş açılarında okunamaz hale gelebilir.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Farklı çerçeveler, cihazlar ve görüntüleme koşullarında tarama başarı oranlarını gösteren bir test matrisi',
          caption: 'Animasyonlu QR test protokolü: çerçeveler, cihazlar ve görüntüleme koşulları arasında sistematik doğrulama',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'QR örneklerini görüntüleyin',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR Güvenliği ve Uyumluluğuna İlişkin En İyi Uygulamalar',
      paragraphs: ['Güzel tasarlanmış ve taranamayan bir QR kodu işe yaramazdan da kötüdür; müşterileri hayal kırıklığına uğratır, marka algısına zarar verir ve oluşturulmasına ve dağıtımına yatırılan her kaynağı boşa harcar. Bu kılavuz, bir QR kodunun güvenilir bir şekilde taranıp taranmayacağını belirleyen teknik ve pratik faktörleri ve potansiyel sorunları üretime ulaşmadan önce yakalamak için ANQR\'nin güvenlik özelliklerinin nasıl kullanılacağını kapsar.', 'QR kod güvenilirliği ikili değildir. Bir kod, amiral gemisi telefonlarda mükemmel şekilde taranabilir ancak uygun fiyatlı cihazlarda başarısız olabilir. İdeal aydınlatmada çalışabilir ancak loş restoranlarda veya parlak güneş ışığında zorluk yaşayabilir. Taranabilirliği etkileyen faktörleri anlamak, görsel stil ile gerçek dünyadaki güvenilirlik arasında bilinçli seçimler yapmanıza yardımcı olur.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Yüksek oranda taranabilirden marjinal olarak okunabilirliğe kadar değişen QR kodlarını gösteren bir güvenilirlik spektrumu',
          caption: 'Taranabilirlik yelpazesi: kurşun geçirmez kodlardan güvenilirlik sınırlarını zorlayan stile kadar',
        },
      ],
    },
    {
      heading: 'Hata Düzeltme Düzeylerini Anlamak',
      paragraphs: ['QR kodları, kısmen hasar görmüş veya engellenmiş olsalar bile okunmalarına olanak tanıyan yerleşik bir yedeklilik içerir. Hata düzeltme düzeyi - L (%7), M (%15), Q (%25) veya H (%30) doğru kod çözme sırasında kodun ne kadarının eksik olabileceğini belirler. Daha yüksek hata düzeltmesi, daha büyük kodlar oluşturur ancak kaplamalar, yazdırma kusurları ve çevresel zararlar için bir güvenlik payı sağlar.', 'Görüntü yer paylaşımlı kodlar için, hata düzeltme düzeyi H önemlidir; yer paylaşımı, kodun bir bölümünü fiziksel olarak gizler ve güvenilirliği korumak için bu %30 artıklığa ihtiyacınız vardır. Kontrollü ortamlardaki temiz, biçimlendirilmemiş kodlar için M düzeyi genellikle yeterlidir. L Düzeyi, kod boyutunun kritik düzeyde kısıtlandığı ve bozulmamış koşulları garanti edebileceğiniz durumlar için ayrılmalıdır.'],
    },
    {
      heading: 'Kritik Sessiz Bölge',
      paragraphs: ['Sessiz bölge, her QR kodunu çevreleyen boş kenar boşluğudur. Tarayıcılar bu sınırı kodun nerede başlayıp nerede bittiğini belirlemek için kullanır. ISO standardı, dört modülden oluşan minimum sessiz bölgeyi belirtir (koddaki en küçük karenin genişliğinin dört katı). Bu alanın tasarım öğeleri, kırpma kenarları veya bitişik içerikle ihlal edilmesi, tarama hatalarının en yaygın nedenlerinden biridir.', 'ANQR\'nin sessiz bölge uygulaması bu kritik aralığın korunmasına yardımcı olur, ancak aynı zamanda bunun son tasarımlarınızda da korunduğundan emin olmalısınız. QR resmini dağıtırken sessiz bölge gereksinimlerini açıkça belirtin. Kodları yerleşimlere yerleştirirken, bu alana hiçbir öğenin girmediğinden emin olun. Birkaç milimetrelik boş alan, güvenilir tarama ile hayal kırıklığına uğramış müşteriler arasındaki fark anlamına gelebilir.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Tarama hatalarına neden olan yaygın ihlallere karşı doğru sessiz bölge aralığını gösteren bir diyagram',
          caption: 'Sessiz bölge gereksinimleri: tarama başarısını belirleyen görünmez kenar boşluğu',
        },
      ],
    },
    {
      heading: 'Kontrast ve Renk Güvenliği',
      paragraphs: ['QR tarayıcılar açık ve koyu modüllerin düzenini algılar. Bu kontrastı azaltan herhangi bir stil (açık ön planlar, koyu arka planlar, degrade efektleri veya düşük opaklığa sahip kaplamalar) kodun okunmasını zorlaştırır. ANQR kontrast oranlarını hesaplar ve renk seçimleriniz tehlikeli seviyelere yaklaştığında uyarı verir, ancak son karar her zaman gerçek dünya testleridir.', 'Renk algısı aydınlatma koşullarına göre değişir. Monitörünüzde yüksek kontrastlı görünen bir renk kombinasyonunun, sıcak akkor ışık veya soğuk floresan tüpleri altında ayırt edilmesi zorlaşabilir. Kodunuz değişen aydınlatma koşullarında kullanılacaksa birden fazla ışık kaynağı altında test edin ve güvenlik payı olarak daha muhafazakar kontrast oranlarını göz önünde bulundurun.'],
    },
    {
      heading: 'Modül Boyutu ve İzleme Mesafesi',
      paragraphs: ['Bireysel modüllerin fiziksel boyutu, bir kodun taranabileceği maksimum mesafeyi belirler. Daha küçük modüller daha küçük kodlar anlamına gelir ancak daha yakın tarama mesafeleri gerektirir. Genel kural, her modülün amaçlanan tarama mesafesinde en az 0,5 mm olması ve daha büyük mesafeler için orantılı olarak ölçeklendirilmesidir. Reklam panosundaki kod, kartvizitteki koddan çok daha büyük modüllere ihtiyaç duyar.', 'Modül boyutunu hesaplarken en kötü senaryoyu göz önünde bulundurun: daha eski bir telefona sahip olan, yetersiz ışık koşullarında, mümkün olan maksimum mesafeden tarama yapan müşteri. Bu kullanıcı için tasarlayın ve diğer herkes daha da iyi bir deneyime sahip olacak. ANQR\'ın boyut önerileri, kullanım amacınıza uygun boyutları önermek için bu gerçek dünya değişkenlerini dikkate alır.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Modül boyutu, baskı boyutları ve maksimum etkili tarama mesafesiyle ilgili bir grafik',
          caption: 'Tarama mesafesi kılavuzu: modül boyutunu dağıtım gereksinimlerinize göre eşleştirme',
        },
      ],
    },
    {
      heading: 'ANQR Güvenlik Modunu Kullanma',
      paragraphs: ['ANQR\'nin Güvenlik Modu, tarama güvenilirliği konusunda gerçek zamanlı geri bildirim sağlar. Kontrast oranlarını, sessiz bölge uyumluluğunu, kaplama yoğunluğunu ve taranabilirliği etkileyen diğer faktörleri izler. Herhangi bir parametre riskli seviyelere yaklaştığında, güvenilirliğin nasıl artırılacağına ilişkin özel rehberlik içeren uyarılar görürsünüz. Arızanın maliyetli olduğu profesyonel dağıtımlar için Güvenlik Modu\'nu tasarım süreci boyunca etkin tutun.', 'Güvenlik Modu ayrıca, oluşturulan kodunuzun kodunu çözmeye çalışan ve başarı veya başarısızlığı bildiren bir tarama doğrulama özelliği içerir. Bu uygulama içi doğrulama, gerçek dünyadaki her durumu kopyalayamasa da, baskı veya dağıtıma yatırım yapmadan önce birçok yaygın sorunu yakalar. Başarılı doğrulamayı bir garanti olarak değil, minimum bir ölçü olarak ele alın; gerçek dünyada yapılan testler hâlâ vazgeçilmezdir.'],
    },
    {
      heading: 'Gerçek Dünya Test Protokolleri',
      paragraphs: ['Hiçbir yazılım doğrulaması fiziksel testin yerini alamaz. Kodunuzu temsili malzeme üzerine istenilen boyutta yazdırın. Gerçek kullanımla eşleşen aydınlatma koşullarıyla gerçek dağıtım ortamında test edin. Yalnızca amiral gemisi telefonunuzla değil, bütçenize uygun Android cihazları, eski iPhone\'lar ve hedef kitlenizin yaygın olarak kullandığı tüm belirli cihazlarla birden fazla cihazla tarama yapın.', 'Testinizi sistematik olarak belgeleyin. Hangi cihazların, hangi koşullar altında, hangi sonuçlarla test edildiğini kaydedin. Kodları geniş ölçekte dağıtıyorsanız kabul kriterleri belirleyin: cihaz test havuzunuzda %95 başarı oranı veya test edilen tüm cihazlarda 2 saniye içinde başarılı taramalar. Bu standartlar, en iyiyi ummak yerine, git/gitme kararlarını objektif hale getirmeye yardımcı olur.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Cihazları, koşulları ve kabul kriterlerini kapsayan kapsamlı bir test kontrol listesi',
          caption: 'QR dağıtım testi protokolü: üretim taahhüdünden önce sistematik doğrulama',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR örneklerini görüntüleyin',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'QR örneklerini görüntüleyin', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Kullanım Kılavuzunun tamamını açın', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Galeriyi aç', type: 'gallery' },
  ],
};
