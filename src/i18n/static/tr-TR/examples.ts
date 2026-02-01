import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR Örnekleri',
  description: 'QR kodlarının nerede ölçülebilir değer yarattığını gösteren gerçek dünyadan beş üretim tarzı örnek: eski bir perakende sayaç kodunun geliştirilmesi, markalı perakende ödemeleri ve "tarama" eylemleri, el ilanlarından reklam panolarına kadar baskı ölçeklendirmesi, dijital tabela için animasyonlu QR ve paylaşılabilir Bağlantı bağlantılarını kullanarak diller arası işbirliği. Her örnekte görüntüler, pratik kısıtlamalar ve oluşturucuya giden bir remiks bağlantısı bulunur.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Jeneratörü aç', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Learn makalelerine göz atın', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Kullanım Kılavuzunun tamamını açın', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Örnek Olay: Perakende Satış Bankosu QR Artışı',
      paragraphs: ['Bu gerçek dünya örneği, üç yıldır tezgahında aynı QR kodunu kullanan küçük bir kafeyi anlatıyor. Orijinal kod, pandemi telaşı sırasında hızlı bir şekilde oluşturuldu, standart kağıda basıldı ve plastik bir standa yerleştirildi. Teknik olarak hâlâ işe yaradı, ancak müşterilerin genellikle onu taramak için birden fazla denemeye ihtiyacı vardı ve bu, kafenin özenle hazırlanmış marka kimliğini güçlendirmek için hiçbir şey yapmadı.', 'Dönüşüm basit bir denetimle başladı: Mevcut kod, kafenin saklamak istediği çevrimiçi menü URL\'sini kodluyordu. Buradaki zorluk, QR\'nin 2020\'den sonra düşünülmüş bir yardımcı programdan ziyade kafe deneyiminin bir parçası gibi hissettirmesiydi.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Görünür aşınmayı, parmak izlerini ve solmuş baskıyı gösteren plastik bir standdaki yıpranmış QR kodu',
          caption: 'Başlangıç noktası: Üç yıllık gişe hizmeti, orijinal QR\'yi zar zor işlevsel hale getirmişti',
        },
      ],
    },
    {
      heading: 'Orijinal Kodun Sorunlarını Teşhis Etme',
      paragraphs: ['Testler birden fazla sorunu ortaya çıkardı: Hata Düzeltme L (minimum artıklık) kullanılan orijinal kod, yalnızca 2 modülden oluşan sessiz bir bölgeye sahipti ve düşük çözünürlükte basılmıştı. Kafenin sıcak tungsten aydınlatması altında, zaten solmuş olan siyah modüller sararmış kağıtla zar zor kontrast oluşturuyordu. Eski telefonlar zorlandı; daha yeni telefonlar başarılı oldu, ancak gözle görülür bir gecikmeyle.', 'Teknik sorunların ötesinde, genel siyah-beyaz kare, marka hakkında hiçbir şey ifade etmiyordu. Müşteriler taramadan önce tereddüt ediyordu; bu, kafenin özenle tasarlanmış dijital menüsüyle etkileşimi azaltan ince bir güven engeliydi.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Orijinal QR\'nin teknik eksikliklerini gösteren teşhis katmanı: düşük ECC, minimum sessiz bölge, zayıf kontrast',
          caption: 'Eski kodun gerçek dünya koşullarında neden düşük performans gösterdiğini ortaya koyan teknik analiz',
        },
      ],
    },
    {
      heading: 'Yükseltme Süreci',
      paragraphs: ['Kafe sahibi, ANQR\'yi kullanarak kodu aynı menü URL\'siyle yeniden oluşturdu ancak ayarları önemli ölçüde geliştirdi: Maksimum dayanıklılık için Hata Düzeltme H, güvenilir sınır tespiti için 6 modüllü sessiz bölge ve kafenin iç paletiyle eşleşen marka renkleri (krem arka plan üzerinde derin bordo modüller).', 'Kafenin logosunu içeren küçük bir merkez kaplaması eklendi; anında marka bilinirliği sağlarken taranabilirliği korumak için kasıtlı olarak incelikli tutuldu. Güvenlik Modu, yeni tasarımın herhangi bir baskı öncesinde test cihazlarında güvenilir bir şekilde tarandığını doğruladı.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Yapılandırmayı gösteren ANQR arayüzü: marka renkleri, uygun ECC, geniş sessiz bölge, zarif logo katmanı',
          caption: 'Yükseltilmiş yapılandırmanın oluşturulması: marka ifadesini tarama güvenilirliğiyle dengelemek için seçilen her ayar',
        },
      ],
    },
    {
      heading: 'Ölçülebilir Sonuçlar',
      paragraphs: ['Kafe, yeni QR\'yi profesyonel mat lamine kart stoğuna uyguladıktan sonra sonuçları dört hafta boyunca takip etti. Tarama başarı oranı tahmini %70\'ten neredeyse %100\'e yükseldi. Ortalama tarama süresi 3-4 saniyeden 1 saniyenin altına düştü. En önemlisi, menü etkileşimi %40 arttı; daha önce QR\'ye bakıp vazgeçen müşteriler artık güvenle taramaya başlıyordu.', 'Personel, müşterilerin \'QR\'nin nasıl kullanılacağı\' konusunda daha az soru sorduğunu ve hayal kırıklığına uğramış müşteriler için artık URL\'nin manuel olarak yazılmadığını bildirdi. Markalı görünüm aynı zamanda müşterilerin uyumlu tasarım hakkında olumlu yorum yapmasıyla tartışmalara da yol açtı.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Metriklerle öncesi/sonrası karşılaştırması: tarama başarı oranı, ortalama tarama süresi ve haftalık tarama sayısında iyileştirmeler',
          caption: 'Dikkatli bir QR artışının ölçülebilir etkisini gösteren dört haftalık veriler',
        },
      ],
    },
    {
      heading: 'Bu Yapılandırmayı Yeniden Oluştur',
      paragraphs: ['Kafenin konfigürasyonu muhafazakar ama etkili bir markalamayı yansıtıyor: Hata Düzeltme H, 6 modüllü sessiz bölge, yüksek kontrastlı marka renkleri ve minimal bir merkez kaplaması. Bu denge, güvenilirliğin önce gelmesi gereken ancak marka varlığının hâlâ önemli olduğu çoğu perakende satış tezgahı uygulamasında işe yarar.', 'Jeneratörü bu ayarlar önceden yüklenmiş olarak açın ve renkleri ve kaplamayı kendi markanıza göre uyarlayın. Temel bilgi: Güvenilirlik iyileştirmeleri tek başına, herhangi bir görsel stil eklemeden önce bile etkileşimi önemli ölçüde artırabilir.', 'Bu yaklaşımın arkasındaki metodolojinin tamamı için mevcut QR kampanyalarının iyileştirilmesine ilişkin ilgili Öğrenme kılavuzunu görüntüleyin.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Anında kişiselleştirme için kafenin ayarlarıyla önceden yapılandırılmış jeneratöre bağlantı',
          caption: 'Kanıtlanmış bir konfigürasyonla başlayın ve markanıza göre özelleştirin',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Learn makalelerine göz atın',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Örnek Olay İncelemesi: Çoklu Ödeme Sayacının Görüntülenmesi',
      paragraphs: ['Bu örnek, kasasında beş farklı QR kodu biriktirmiş olan bir butik giyim mağazasının örneğidir: banka ödemesi, ipuçları, Instagram, Google incelemeleri ve işe alma bağlantısı. Her biri farklı bir kaynaktan üretilmiş, farklı zamanlarda basılmış ve uyumsuz stantlarda sergilenmiştir. Görsel kaos mağazanın özenle seçilmiş estetiğini baltalıyordu ve personel düzenli olarak yanlış kodu tarayan müşterilerle ilgileniyordu.', 'Çözüm, farklı kaygılar gerektiriyordu: Ödeme kodlarının muhafazakar bir stil ile maksimum güvenilirliğe ihtiyacı vardı, pazarlama kodları ise daha anlamlı olabilirdi. Ortaya çıkan birleşik görüntüleme sistemi, marka varlığının farklı QR kullanım durumlarının işlevsel taleplerine karşı nasıl dengeleneceğini gösteriyor.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Çeşitli stantlarda ve basılı materyallerde birbirine uymayan beş QR kodunu gösteren karmaşık bir kayıt alanı',
          caption: 'Kaotik başlangıç noktası: dikkat çekmek için yarışan ve müşterinin kafa karışıklığına neden olan, bağlantısız beş QR kodu',
        },
      ],
    },
    {
      heading: 'Ödeme Deneyimine Öncelik Verme',
      paragraphs: ['Mağazanın birincil ödeme yöntemi, sıkı yük uyumluluğu gerektiren bölgesel bir standart kullanıyordu. Testler, küçük stillerin bile belirli bankacılık uygulamalarında tarama hızını etkilediğini ortaya çıkardı. Karar: Boyut optimizasyonu ve mat kart stoğu üzerine profesyonel baskı haricinde ödeme QR\'sini tamamen değiştirilmeden tutmak.', 'Bu ihtiyatlı yaklaşım, ödeme kodunun idealden daha az "markalı" görünmesi anlamına geliyordu, ancak işlem tamamlama oranları önemli ölçüde arttı. İçgörü: Ödeme anları markalaşma fırsatları değil, güvenilirlik anlarıdır. Söz konusu para olduğunda müşteriler estetikten ziyade hız ve kesinliği takdir ediyor.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Kasada belirgin bir şekilde konumlandırılmış, profesyonel mat kart stoğu üzerinde temiz, büyük boyutlu bir ödeme QR kodu',
          caption: 'Ödeme QR\'si: cömertçe boyutlandırılmış, profesyonelce basılmış, bankacılık uygulamaları tarafından anında tanınması için muhafazakar bir şekilde tasarlanmış',
        },
      ],
    },
    {
      heading: 'İkincil Eylem Ekranını Oluşturma',
      paragraphs: ['İpuçları, incelemeler, sosyal medya ve işe alımlar için mağaza daha anlamlı olabilir. Bu kodlar ANQR\'de tutarlı marka stiliyle yeniden oluşturuldu: mağazanın imzası olan krem ​​rengi zeytin yeşili, yuvarlak modül stili ve mağaza simgesinin yer aldığı zarif bir orta katman. Error Correction H, stilde bile güvenilirliği garantiledi.', 'Bu dört kod, ödeme kodunun yanında (onunla rekabet etmeyecek şekilde) konumlandırılan markalı bir panelde düzenlenmiştir. Mağazanın tipografisindeki net etiketler her kodun amacını açıklıyordu. Görsel hiyerarşi kasıtlıydı: Ödeme tek başına ve göze çarpıyordu; seçenekler halinde gruplandırılmış ikincil eylemler.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'İpuçları, incelemeler, sosyal medya ve işe alım için net etiketlerle dört stil QR kodunu gösteren markalı bir panel',
          caption: 'İkincil eylem paneli: tutarlı markalama, net etiketleme, dikkat dağıtıcı değil seçenek olarak konumlandırılmış',
        },
      ],
    },
    {
      heading: 'Görüntüleme Sistemi Tasarımı',
      paragraphs: ['Fiziksel ekran aynı anda birçok sorunu çözdü. Hem ödeme standında hem de ikincil panelde, tavan aydınlatmasından kaynaklanan parlamayı ortadan kaldırmak için mat malzemeler kullanıldı. Yükseklikler, farklı boydaki müşteriler için optimize edildi. Tezgahın üzerinde düz olmak yerine müşteri kuyruğuna doğru yönlendirilmiş açılar.', 'Mağazanın kilitli ANQR yapılandırma bağlantılarından yedek baskılar oluşturması kritik önem taşıyor. Sonunda ipucu kodu kahveye sıçradığında, personel depolanan yapılandırmayı kullanarak kodu birkaç dakika içinde değiştirdi; ekran görüntüsü yok, ayarlarda tahmin yok, kalite kaybı yok.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Fiziksel ekran düzenini gösteren bir diyagram: yükseklikler, açılar, malzemeler ve ödeme ile ikincil ekranlar arasındaki ilişki',
          caption: 'Görüntüleme sistemi planı: Müşteri yükseklikleri ve aydınlatma koşullarında güvenilir tarama için optimize edilmiş fiziksel ergonomi',
        },
      ],
    },
    {
      heading: 'Operasyonel İyileştirmeler',
      paragraphs: ['Mağaza, dağıtımdan altı hafta sonra önemli iyileştirmeler belgeledi: \'yanlış kod\' karışıklığıyla ilgili sıfır müşteri şikayeti, daha hızlı işlem süreleri ve bahşiş gönderimlerinde 3 kat artış (müşteriler artık personele tuhaf bir şekilde sormadan bahşiş kodunu bulup tarayabiliyordu). Özel, iyi etiketlenmiş QR sürtünmeyi ortadan kaldırdıkça Google incelemeleri de arttı.', 'Personel eğitimi daha basit hale geldi: \'ödeme kodu en büyük koddur, geri kalan her şey paneldedir.\' Ödeme uygulamaları güncellendiğinde ve bir tanesi kısa süreliğine daha yavaş tarama gösterdiğinde, muhafazakar ödeme kodu tasarımı, uygulamanın hala çalıştığı anlamına geliyordu; tamamen başarısız olmak yerine sadece biraz daha yavaştı.', 'Bu ekran sistemi tasarımının ardındaki ilkeler için perakende ödemelere yönelik QR kodlarıyla ilgili Öğrenme kılavuzuna bakın.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Önceki/sonraki karşılaştırmaları gösteren bir ölçüm panosu: karışıklık olayları, işlem süresi, bahşiş sıklığı, inceleme gönderimleri',
          caption: 'Düşünceli bir çoklu QR görüntüleme sisteminin iş üzerindeki etkisini gösteren altı haftalık operasyonel veriler',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Learn makalelerine göz atın',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Örnek Olay: Kartvizitten Billboard\'a',
      paragraphs: ['Bu örnekte büyük bir konferansa hazırlanan bir etkinlik yapım şirketi anlatılmaktadır. Etkinlik uygulamasına bağlantı sağlayan aynı QR kodunun kökten farklı formatlarda dağıtılmasına ihtiyaçları vardı: katılımcı rozetleri (3 cm), masa çadırı kartları (8 cm), kayıt masası tabelaları (30 cm), yol bulma posterleri (60 cm) ve büyük bir sahne arka pankartı (4 metre). Her formatın farklı izleme mesafeleri, aydınlatma koşulları ve prodüksiyon iş akışları vardı.', 'Zorluk sadece teknik değildi; operasyoneldi. Birden fazla tedarikçi farklı baskı işlerini yürütüyordu ve şirketin kimin neyi ürettiğine bakılmaksızın tutarlı, taranabilir sonuçlar sağlaması gerekiyordu. Çözümleri SVG dışa aktarımına ve sıkı aktarım belgelerine odaklanıyordu.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Rozetten banner\'a kadar beş farklı boyutta aynı QR kodunu gösteren bir kolaj',
          caption: 'Bir QR kodu, beş dağıtım boyutu: santimetrelerden metrelere kadar taranabilirliği koruma zorluğu',
        },
      ],
    },
    {
      heading: 'Önceki Etkinliklerde Neden Sorunlar Yaşandı?',
      paragraphs: ['Son konferanslarında şirket utanç verici başarısızlıklar yaşadı. Sahne banner\'ı QR, küçük bir PNG olarak oluşturuldu ve tasarım yazılımında büyütüldü; sonuç, uzaktan kabul edilebilir görünüyordu ancak izleyici tarafından güvenilir bir şekilde taranamadı. Rozet QR\'leri aşırı biçimlendirilmiş ve çok küçüktü; bu da katılımcıları kişi eklemeye çalışırken sinir bozucu hale getiriyordu. Formatlar arasındaki tutarsız ayarlar, \'aynı\' QR\'nin aslında her parçada farklı görünmesi anlamına geliyordu.', 'Olay sonrası analiz temel nedeni ortaya çıkardı: Tek bir gerçeğin kaynağı yok. Her tasarımcı QR\'yi biraz farklı ayarlarla yeniden oluşturdu ve her baskı satıcısı dosyaları farklı şekilde işledi. Dosya aktarımının telefon oyunu nedeniyle kalite düştü.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Tarama hatalarını gösteren yakın çekim fotoğraflar: pikselli banner modülleri, küçük boyutlu rozet kodları, formatlar arasında tutarsız stil',
          caption: 'Önceki olay başarısızlıklarının adli analizi: her format farklı kalite sorunlarına neden olmuştu',
        },
      ],
    },
    {
      heading: 'SVG-İlk İş Akışı',
      paragraphs: ['Bu etkinlik için şirket sıkı bir protokol oluşturdu: ANQR\'de optimum ayarlarla (Hata Düzeltme H, cömert sessiz bölge, temiz stil) oluşturulan bir ana QR, SVG olarak dışa aktarıldı ve tek yetkili kaynak olarak saklandı. ANQR yapılandırma bağlantısı, gerektiğinde kodun yeniden oluşturulabilmesi için SVG dosyasıyla birlikte belgelendi.', 'Her tasarımcı ve satıcı, açık talimatlar içeren aynı SVG ana dosyasını aldı: gerekli boyuta yerleştirin, değişiklik yapmayın, sessiz bölge açıklığını koruyun. Raster formatlarına ihtiyaç duyan satıcılar için şirket, kullanım amacını belirten net adlandırma kurallarına sahip belirli boyutlarda önceden oluşturulmuş PNG\'ler sağladı.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'SVG ana dosyasını, boyuta özel PNG\'leri, spesifikasyon belgesini ve yapılandırma bağlantısını gösteren bir dosya paketi',
          caption: 'Aktarma paketi: satıcıların tahmin etmeden tutarlı sonuçlar elde etmek için ihtiyaç duyduğu her şey',
        },
      ],
    },
    {
      heading: 'Boyuta Özel Hususlar',
      paragraphs: ['Her format özel dikkat gerektiriyordu. 3 cm\'lik rozet eklerinin mevcut maksimum alanı kaplaması için QR\'ye ihtiyaç vardı; tarama mesafesi kol boyu kadar olacaktı. 8 cm\'lik masa çadırları, sessiz bölgenin dışında dekoratif çerçeveler içerebilir. 4 metrelik banner hesaplama gerektiriyordu: tipik izleyici mesafesinden (15-20 metre) modüllerin telefon kameraları tarafından açıkça ayırt edilebilmesi gerekiyordu; bu da QR\'nin banner tasarımı içinde en az 80 cm olması gerektiği anlamına geliyordu.', 'Şirket, beklenen her tarama mesafesi için minimum QR boyutlarını belgeleyen bir boyutlandırma kılavuzu oluşturdu. Bu, gelecekteki etkinlikler için yeniden kullanılabilir bir varlık haline geldi ve tasarım sürecindeki tahminleri ortadan kaldırdı.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Her etkinlik formatı için tarama mesafesi, minimum QR boyutu ve modül boyutları arasındaki ilişkiyi gösteren bir grafik',
          caption: 'Boyutlandırma matrisi: her formatın beklenen görüntüleme mesafesinde güvenilir taramayı sağlayan hesaplanmış boyutlar',
        },
      ],
    },
    {
      heading: 'Üretim Sonuçları',
      paragraphs: ['Konferans günü doğrulaması sistematikti: personel, kapılar açılmadan önce dağıtılan her QR\'yi test etti. Rozet ekleri anında kol boyu mesafede tarandı. Masa çadırları, ara odalarının değişken aydınlatmasında güvenilir bir şekilde çalıştı. Önceki etkinliğin utancı olan sahne pankartı seyirci alanının ortasından başarıyla tarandı.', '2.000\'den fazla katılımcıda sıfır tarama şikayeti kaydedildi. Operasyonel kazanç da aynı derecede önemliydi: Son dakikada sponsor eklenmesi yeni tabela gerektirdiğinde, yapım ekibi bunu dakikalar içinde ana SVG\'den üretti ve diğer her şeyle eşleşeceğinden emin oldu.', 'SVG ve PNG karar çerçevesi ve aktarmayla ilgili en iyi uygulamalar için baskıya hazır QR kodları hakkında Öğrenme kılavuzuna bakın.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Katılımcıların mekan genelinde çeşitli boyut ve mesafelerdeki QR kodlarını başarılı bir şekilde taradığını gösteren etkinlik fotoğrafı',
          caption: 'Konferans günü başarısı: Rozet yakın çekimlerinden sahne pankartı uzaktan çekimlerine kadar her formatta güvenilir tarama',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Learn makalelerine göz atın',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Örnek Olay İncelemesi: Havaalanı Dinlenme Salonu Dijital Ekranı',
      paragraphs: ['Bu örnek, dijital karşılama ekranlarında statik QR kodları kullanan bir havayolu bekleme salonunu göstermektedir. Ekranlarda dönüşümlü tanıtım içerikleri görüntüleniyordu ancak dinlenme salonu check-in işlemleri için kullanılan QR kodu, statik ve kolayca gözden kaçabilen bir köşede duruyordu. Analizler, masa kuyruğundan daha hızlı olmasına rağmen uygun misafirlerin yalnızca %15\'inin QR check-in\'i kullandığını gösterdi. Çoğu misafir bunu fark etmedi.', 'Hipotez basitti: Hareketli içeriğe sahip görsel olarak yoğun bir ortamda statik bir QR görünmez hale gelir. Başarısızlığın hayal kırıklığına uğramış yolcular ve daha uzun masa kuyrukları anlamına geldiği bir check-in akışı için gereken güvenilirlikten ödün vermeden QR\'yi fark edilebilir hale getirmek için çözüm gerekiyordu.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Havaalanı bekleme salonunda, köşesinde küçük, statik bir QR kodu bulunan, tanıtım içeriğini gösteren dijital bir ekran',
          caption: 'Orijinal kurulum: Dinamik tanıtım içeriği denizinde kaybolan ve yalnızca %15 benimsenme oranına ulaşan statik bir QR',
        },
      ],
    },
    {
      heading: 'Güvenli Animasyon Tasarlama',
      paragraphs: ['Salonun dijital tabelasında büyük LED paneller kullanıldı; agresif animasyonların tarama sorunları yaratabileceği zorlu bir ortam. Tasarım ekibi ihtiyatlı bir şekilde başladı: gerçek kod yapısını değiştirmeden QR\'nin görsel varlığını ustaca genişleten ve daraltan hafif bir darbe efekti. LED yenileme hızında herhangi bir titreme sorununu önlemek için kare zamanlaması yavaş (250 ms) olarak ayarlandı.', 'Güvenlik Modu doğrulaması her karenin taranabilir kaldığını doğruladı. Gerçek LED paneller üzerinde yapılan ek testler, titreşimin masaüstü önizlemelerinde önerilenden çok daha incelikli olması gerektiğini ortaya çıkardı; LED parlaklığı ve görüş açıları, algılanan kontrastı beklenenden daha fazla etkiledi.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Darbe yapılandırmasını gösteren ANQR animasyon ayarları paneli: yavaş zamanlama, ince yoğunluk, Güvenlik Modu etkin',
          caption: 'Animasyon yapılandırması: Her karede tarama güvenilirliğini korurken LED panel ekranı için ayarlanan parametreler',
        },
      ],
    },
    {
      heading: 'Tabela İçeriğiyle Entegrasyon',
      paragraphs: ['Animasyonlu QR, ekran düzeninin özel bir \'sabit bölgesine\' yerleştirildi; bu alan, tanıtım içeriği ana görüntüleme alanında döndürülürken sabit kaldı. Bu ayrım çok önemliydi: QR, ince animasyonuyla dikkat çekerken bile tarama için görsel stabiliteye ihtiyaç duyuyordu.', 'QR\'nin yanına net bir harekete geçirici mesaj eklendi: \'Sırayı atlayın - check-in yapmak için tarayın.\' QR titreşirken metin statik kaldı ve tanıtım içeriğini bunaltmadan, dikkatleri tarama fırsatına çeken görsel bir hiyerarşi yarattı.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Promosyon içeriği ana alanda dönerken animasyonlu QR\'yi sabit bir bölgede gösteren bir ekran düzeni diyagramı',
          caption: 'Ekran alanı tahsisi: Animasyonlu QR, dönen promosyon içeriğinden ayrı, sabit bir alanı kaplar',
        },
      ],
    },
    {
      heading: 'Teknik Dağıtım',
      paragraphs: ['Animasyonlu QR, tabela CMS\'si için optimize edilmiş ayarlarla GIF olarak dışa aktarıldı. Dosya boyutuyla ilgili hususlar önemliydi; salonun içerik yönetim sisteminin yükleme sınırları vardı ve aşırı büyük dosyalar oynatma sırasında takılmalara neden oluyordu. Son dışa aktarma, renk paletini sınırlayarak ve kare sayısını optimize ederek görsel kaliteyi dosya boyutuna göre dengeledi.', 'Dağıtım bir geri dönüş içeriyordu: GIF herhangi bir nedenle oynatılamazsa tabela sistemi statik bir PNG yedeği görüntüleyecekti. Bu yedeklilik, animasyondaki teknik sorunlar nedeniyle check-in yeteneğinin asla kaybolmamasını sağladı.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Geri dönüş statik görüntüsünün yapılandırılmış olduğu animasyonlu QR yüklemesini gösteren bir CMS arayüzü',
          caption: 'Tabela CMS yapılandırması: check-in özelliğinin hiçbir zaman kesintiye uğramamasını sağlayan statik geri dönüşlü animasyonlu birincil',
        },
      ],
    },
    {
      heading: 'Ölçülen Etki',
      paragraphs: ['Bir aylık operasyonun ardından QR check-in\'in benimsenme oranı %15\'ten %24\'e yükseldi; bu da %60\'lık bir göreceli iyileşme anlamına geliyor. Misafir geri bildirim anketleri, animasyonlu QR\'nin \'fark edilmesinin daha kolay\' olduğunu ve \'daha modern hissettirdiğini\' gösterdi. Yoğun dönemlerde daha fazla misafirin QR aracılığıyla kendi kendine hizmet vermesi nedeniyle masa kuyruğu süreleri ölçülebilir şekilde azaldı.', 'Daha da önemlisi, binlerce günlük taramaya rağmen sıfır tarama hatası rapor edildi. Muhafazakâr animasyon yaklaşımı, check-in akışının gerektirdiği güvenilirlikten ödün vermeden dikkat hedefine ulaşmıştı. Salon daha sonra benzer animasyonlu QR\'leri diğer konumlarına da sundu.', 'Güvenli animasyon tasarımının ardındaki teknik ilkeler için dijital tabelalara yönelik animasyonlu QR kodlarıyla ilgili Öğrenme kılavuzuna bakın.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Dağıtım süresi boyunca benimseme oranındaki artışı, kuyruk süresindeki azalmayı ve sıfır arızalı tarama güvenilirliğini gösteren bir kontrol paneli',
          caption: 'Bir aylık veri: benimsenmede %60 artış, kuyruk sürelerinde azalma ve mükemmel tarama güvenilirliğinin sürdürülmesi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Learn makalelerine göz atın',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Örnek Olay İncelemesi: Küresel Ürün Lansmanı QR Kampanyası',
      paragraphs: ['Bu örnek, bir tüketici elektroniği şirketinin 8 dilde 12 pazarda eş zamanlı olarak yeni bir ürün piyasaya sürmesini konu alıyor. Her bölgesel pazarlama ekibinin, yerelleştirilmiş ürün sayfalarına bağlantı sağlayan QR kodlarını içeren ambalaj, perakende vitrinler ve promosyon malzemeleri üretmesi gerekiyordu. Önceki lansmanlar tutarsız QR stiline, zaman zaman tarama hatalarına ve her ekibin ekran görüntülerinden kodları yeniden oluşturduğu bir \'telefon oyunu\' konfigürasyon kaymasına neden olmuştu.', 'Çözüm, arayüz dillerinden bağımsız olarak her bölgesel ekibin erişebileceği tek bir doğruluk kaynağı oluşturmak için ANQR\'nin paylaşılabilir yapılandırma bağlantılarından yararlandı. QR verisi, kullanıcı dilini algılayan akıllı bir yönlendirme kullandı; böylece tek bir kod, yerelleştirilmiş deneyimler sunarken küresel olarak çalıştı.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Bazıları görsel olarak birbiriyle tutarsız olan QR kodlu 12 pazar konumunu gösteren bir dünya haritası',
          caption: 'Zorluk: 12 pazar, 8 dil ve bölgeler arasında tutarsız QR uygulamaları geçmişi',
        },
      ],
    },
    {
      heading: 'Ana Yapılandırmanın Kurulması',
      paragraphs: ['Küresel marka ekibi, ANQR\'da yetkili QR yapılandırmasını oluşturdu: ürün serisinin görsel kimliğiyle eşleşen marka renkleri, tüm baskı ve dijital uygulamalarda güvenilirlik için Hata Düzeltme H ve yerel üretim yöntemlerinden bağımsız olarak tutarlı bir şekilde yeniden üretilecek stil. Yapılandırma kilitlendi ve paylaşım bağlantısı küresel kampanya özetinde belgelendi.', 'Kritik olarak, kodlanmış URL, dili algılayan bir yönlendirme hizmeti kullanıyordu. Kullanıcılar tarandığında otomatik olarak yerel dildeki ürün sayfalarına yönlendirildi. Bu, 12 pazarın tamamının aynı QR kodlarını kullanabileceği anlamına geliyordu; hatalara yol açabilecek pazar bazında veri yükü farklılıkları yoktu.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Marka renklerini, ECC H\'yi ve akıllı yönlendirme URL\'sini içeren ana yapılandırmayı gösteren ANQR arayüzü',
          caption: 'Ana yapılandırma: tek, paylaşılabilir bir doğruluk kaynağına kodlanmış küresel marka standartları',
        },
      ],
    },
    {
      heading: 'Bölgesel Ekip İş Akışı',
      paragraphs: ['Her bölgesel pazarlama ekibi, basit talimatlar içeren yapılandırma bağlantısını aldı: bağlantıyı açın, önizlemenin marka yönergeleriyle eşleştiğini doğrulayın, uygulamanız için gerekli formatta dışa aktarın. ANQR arayüzü her ekibin tercih ettiği dilde görüntülendi ancak temel QR ayarları, arayüz dili ne olursa olsun aynı kaldı.', 'Japon ekibinin üst düzey perakende vitrinleri için SVG\'ye, Brezilya ekibinin ise sosyal medya için PNG\'ye ihtiyacı olduğunda, her ikisi de aynı yapılandırmadan dışa aktarıldı. Alman ekibin baskı tedarikçisi belirli renk değerleri talep ettiğinde, ekran görüntüsünden tahminde bulunmak yerine doğrudan konfigürasyona referans verebiliyordu.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Japonca, Portekizce ve Almanca arayüzlerde açılan aynı yapılandırma bağlantısını gösteren ekran görüntüleri',
          caption: 'Aynı konfigürasyon, farklı arayüzler: Bölgesel ekipler küresel tutarlılığı korurken tercih ettikleri dilde çalışır',
        },
      ],
    },
    {
      heading: 'Bölgesel Farklılıkların Ele Alınması',
      paragraphs: ['Bazı pazarlar küçük uyarlamalar gerektiriyordu. Çinli ekibin sosyal paylaşım için WeChat için optimize edilmiş çerçeveye sahip bir sürüme ihtiyacı vardı. Ana kopyayı değiştirmek yerine, kendi yapılandırma bağlantısına sahip, kampanya varlık kitaplığında \'CN-WeChat çeşidi\' olarak açıkça etiketlenen, belgelenmiş bir varyant oluşturdular. Bu, gerekli yerelleştirmeye izin verirken izlenebilirliği de korudu.', 'Marka ekibi basit bir kural belirledi: Ana kuraldan herhangi bir değişiklik, yeni, belgelenmiş bir yapılandırma bağlantısı gerektiriyordu. Dışa aktarılan dosyalarda değişiklik yapılmaz, tasarım yazılımında \'hızlı düzeltmeler\' yapılmaz. Bu, önceki lansmanlarda sorun yaratan konfigürasyon kaymasını önledi.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Her biri kendi bağlantısına sahip olan, ana yapılandırmayı ve onaylanmış bölgesel değişkenleri gösteren bir varlık kitaplığı arayüzü',
          caption: 'Kampanya varlık yönetimi: ana yapılandırma artı belgelenmiş değişkenler, tümü yapılandırma bağlantıları aracılığıyla izlenebilir',
        },
      ],
    },
    {
      heading: 'Lansman Sonuçları',
      paragraphs: ['Ürün lansman gününde, QR kodlarının 12 pazarın tamamındaki ambalajlarda, perakende satış vitrinlerinde, etkinlik materyallerinde ve dijital kampanyalarda eş zamanlı olarak kullanıldığı görüldü. Kalite denetimleri bölgeler arasında görsel tutarlılığı doğruladı; Tokyo perakende vitrinlerindeki QR, São Paulo ambalajındaki QR ile Berlin etkinlik afişlerindeki QR ile eşleşti.', 'Pazarlarda sıfır tarama hatası bildirildi. Lansman sonrası ürün sayfası URL\'sinde değişiklik yapılması gerektiğinde, yönlendirme hizmeti bunu görünmez bir şekilde gerçekleştirdi; yeniden yazdırmaya gerek kalmadı. Küresel ekip, yapılandırma bağlantısı yaklaşımının, önceki lansman metodolojilerine kıyasla 40 saatten fazla koordinasyon süresi tasarrufu sağladığını tahmin etti.', 'Küresel kampanya tutarlılığının ardındaki iş akışı ilkeleri için diller arası QR işbirliğine ilişkin Öğrenme kılavuzuna bakın.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Farklı pazarlarda tutarlı QR dağıtımını gösteren bir fotoğraf tablosu: Tokyo perakende satış, São Paulo paketleme, Berlin etkinlikleri',
          caption: 'Küresel tutarlılığa ulaşıldı: Farklı dillere, satıcılara ve formatlara rağmen 12 pazarda aynı QR sunumu',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Jeneratörü aç',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Learn makalelerine göz atın',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Learn makalelerine göz atın', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Kullanım Kılavuzunun tamamını açın', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Galeriyi aç', type: 'gallery' },
  ],
};
