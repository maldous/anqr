import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: 'Gizlilik Politikası',
  description: 'ANQR\'un topladığı bilgiler, bunların nasıl kullanıldığı ve geçerli gizlilik yasaları kapsamındaki haklarınız.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Hizmet Şartları', type: 'external' }],
  sections: [
    {
      heading: 'Özet',
      paragraphs: ['ANQR, müşteri odaklı bir yaklaşıma sahip bir QR kod oluşturucudur. Hesap oluşturmanızı talep etmiyoruz. Varsayılan olarak QR kodları tarayıcınızda yerel olarak oluşturulur; kodladığınız içeriğe erişimimiz yoktur.', 'Profesyonel kullanım için ANQR, URL parametrelerinden QR kodları üreten sunucu tarafı bir API sağlar. API\'yi kullanırken QR içeriğiniz, görüntüyü oluşturmak için sunucularımızda işlenir, ancak saklanmaz veya günlüğe kaydedilmez.', 'Reklamcılık için Google AdSense\'i kullanıyoruz ve analiz hizmetlerini kullanabiliriz. Bu hizmetler çerezler ve benzeri teknolojiler aracılığıyla bilgi toplar. Bu politikada hangi verilerin toplandığı, nasıl kullanıldığı ve haklarınız açıklanmaktadır.'],
    },
    {
      heading: 'Topladığımız bilgiler',
      bullets: ['Sağladığınız bilgiler: Bizimle e-posta veya iletişim formumuz aracılığıyla iletişime geçerseniz adınızı, e-posta adresinizi ve mesaj içeriğinizi toplarız.', 'Otomatik olarak toplanan bilgiler: Barındırma sağlayıcımız (Netlify), reklam ortaklarımız ve analiz hizmetlerimiz şunları toplayabilir: IP adresi, tarayıcı türü ve sürümü, işletim sistemi, cihaz türü, yönlendiren URL, ziyaret edilen sayfalar, sitede geçirilen süre ve yaklaşık coğrafi konum.', 'Üçüncü taraf çerezleri: Reklam ortaklarımız (Google AdSense), reklamları sunmak ve ölçmek için çerezleri ve benzer teknolojileri kullanır. ANQR\'un kendisi herhangi bir birinci taraf çerezi ayarlamaz.'],
    },
    {
      heading: 'Çerezler ve üçüncü taraf teknolojileri',
      paragraphs: ['ANQR herhangi bir birinci taraf çerezi ayarlamaz. Tercihleriniz (karanlık mod gibi) cihazınızda yerel olarak saklanır ve herhangi bir sunucuya iletilmez.', 'Ancak reklam ortaklarımız (Google AdSense) ve barındırma sağlayıcımız çerezleri ve benzer izleme teknolojilerini kullanabilir:'],
      bullets: ['Reklam çerezleri (üçüncü taraf): İlgili reklamları sunmak, reklam performansını ölçmek ve kullanıcı ilgi alanlarını anlamak için Google AdSense ve reklam ortakları tarafından ayarlanır. Bu çerezler farklı web sitelerindeki etkinliklerinizi izleyebilir.', 'Analiz çerezleri (üçüncü taraf): Barındırma sağlayıcımız veya analiz hizmetlerimiz tarafından anonimleştirilmiş kullanım verilerini toplamak için kullanılabilir.'],
    },
    {
      heading: 'Google AdSense ve reklamcılık',
      paragraphs: ['Reklamları Google AdSense aracılığıyla gösteriyoruz. Google ve ortakları, bu sitedeki ve diğer web sitelerindeki tarama geçmişinize dayalı reklamlar (ilgi alanına dayalı reklamcılık) sunmak için çerezleri kullanır.', 'Google\'ın bilgilerinizi nasıl kullandığını öğrenin: https://policies.google.com/technologies/partner-sites', 'Reklam kişiselleştirmeyi yönetin: https://adssettings.google.com', 'Ağ Reklamcılığı Girişimi aracılığıyla kapsam dışında kalmayı seçin: https://optout.networkadvertising.org', 'Dijital Reklamcılık İttifakı aracılığıyla devre dışı bırakma: https://optout.aboutads.info'],
    },
    {
      heading: 'Bilgileri nasıl kullanıyoruz?',
      bullets: ['Sorularınıza yanıt vermek ve destek sağlamak.', 'Reklam ortaklarımız aracılığıyla ilgili reklamları görüntülemek.', 'Site kullanımını analiz etmek ve hizmetlerimizi geliştirmek.', 'Dolandırıcılık, kötüye kullanım ve güvenlik sorunlarını tespit etmek, önlemek ve çözmek.', 'Yasal yükümlülüklere uymak.'],
    },
    {
      heading: 'Üçüncü taraf hizmetleri',
      bullets: ['Google AdSense: Reklamları sunmak ve ölçmek için verileri alır.', 'Analiz sağlayıcıları: Anonimleştirilmiş kullanım verilerini alın.', 'Netlify (barındırma): İstekleri işler ve IP adreslerini günlüğe kaydedebilir.', 'Kişisel bilgilerinizi satmıyoruz. Ancak verilerin reklam ortaklarıyla paylaşılması CCPA kapsamında bir "satış" olarak değerlendirilebilir (aşağıya bakın).'],
    },
    {
      heading: 'Veri saklama',
      bullets: ['İletişim başvuruları: 2 yıla kadar.', 'Sunucu günlükleri: 30 güne kadar (barındırma sağlayıcısı).', 'Analitik verileri: 26 aya kadar (anonimleştirilmiş).', 'Reklam çerezleri: Genellikle 13 ay (ortaklara göre değişir).'],
    },
    {
      heading: 'GDPR kapsamındaki haklarınız (AEA kullanıcıları)',
      paragraphs: ['Avrupa Ekonomik Alanı\'nda bulunuyorsanız Genel Veri Koruma Yönetmeliği kapsamında aşağıdaki haklara sahipsiniz:'],
      bullets: ['Erişim hakkı: Hakkınızda tuttuğumuz kişisel verilerin bir kopyasını isteyin.', 'Düzeltme hakkı: Yanlış verilerin düzeltilmesini talep etme.', 'Silme hakkı: Verilerinizin silinmesini talep etme ("unutulma hakkı").', 'İşlemeyi kısıtlama hakkı: Verilerinizi nasıl kullandığımıza ilişkin sınırlamalar talep edin.', 'Veri taşınabilirliği hakkı: Verilerinizi taşınabilir bir formatta talep edin.', 'İtiraz hakkı: Doğrudan pazarlama da dahil olmak üzere işlemeye itiraz.', 'Rızayı geri çekme hakkı: İşlemenin rızaya dayalı olduğu durumlarda izni istediğiniz zaman geri çekebilirsiniz.', 'Şikayette bulunma hakkı: Veri koruma yetkilinize şikayette bulunun.'],
    },
    {
      heading: 'GDPR yasal dayanağı',
      paragraphs: ['Verileri şu temellere dayanarak işleriz: (a) Onay - kişiselleştirilmiş reklamcılık için (reklam ortaklarımız tarafından yönetilir); (b) Meşru menfaatler - analiz, güvenlik ve iyileştirmeye yönelik; (c) Sözleşme – sorulara yanıt vermek için.', 'Haklarınızı kullanmak için email@anqr.link ile iletişime geçin. 30 gün içinde yanıt veriyoruz.'],
    },
    {
      heading: 'CCPA kapsamındaki haklarınız (Kaliforniya kullanıcıları)',
      bullets: ['Bilme hakkı: Toplanan veriler, kaynaklar, amaçlar ve üçüncü taraflar hakkında bilgi talep etme.', 'Silme hakkı: Kişisel bilgilerinizin silinmesini talep edin.', 'Vazgeçme hakkı: Kişisel bilgilerin "satılmasını" devre dışı bırakın (reklam ortaklarıyla paylaşmak uygun olabilir).', 'Ayrımcılık yapmama hakkı: Haklarınızı kullanırken ayrımcılık yapmayacağız.'],
    },
    {
      heading: 'Toplanan CCPA kategorileri',
      paragraphs: ['Kategoriler: Tanımlayıcılar (IP adresi, cihaz kimliği), İnternet etkinliği (göz atma, reklam etkileşimleri), Coğrafi Konum (yaklaşık), Çıkarımlar (göz atmadan kaynaklanan ilgi alanları).', 'Hakları kullanmak veya vazgeçmek için: email@anqr.link veya çerez ayarlarını düzenleyin.'],
    },
    {
      heading: 'Uluslararası transferler',
      paragraphs: ['Bilgileriniz Amerika Birleşik Devletleri dahil farklı veri koruma kanunlarına sahip ülkelere aktarılabilir. Standart Sözleşme Maddeleri gibi uygun önlemleri kullanırız.'],
    },
    {
      heading: 'Çocukların mahremiyeti',
      paragraphs: ['ANQR 13 yaşın (veya AEA\'da 16 yaşın) altındaki çocuklara yönelik değildir. Çocuklardan bilerek veri toplamıyoruz. Bir çocuğun bilgi sağladığını düşünüyorsanız email@anqr.link ile iletişime geçin.'],
    },
    {
      heading: 'Güvenlik',
      paragraphs: ['Verileri korumak için HTTPS şifrelemesi de dahil olmak üzere uygun teknik ve organizasyonel önlemleri kullanıyoruz. Ancak hiçbir internet aktarımı %100 güvenli değildir.'],
    },
    {
      heading: 'Takip Etme',
      paragraphs: ['Reklam ortakları DNT\'ye yanıt vermese de mümkün olduğu durumlarda Do Not Track tarayıcı sinyallerini dikkate alırız.'],
    },
    {
      heading: 'Bu politikadaki değişiklikler',
      paragraphs: ['Bu politikayı periyodik olarak güncelleyebiliriz. "Son güncelleme" tarihi en son revizyonu gösterir. Önemli değişiklikler bir site başlığı aracılığıyla iletilebilir.'],
    },
    {
      heading: 'Bize ulaşın',
      paragraphs: ['Gizlilikle ilgili sorularınız veya haklarınızı kullanmak için: email@anqr.link veya İletişim sayfamızı kullanın. Gizlilik taleplerine 30 gün içinde yanıt veririz.'],
    },
    {
      heading: 'Tam Gizlilik Politikası',
      paragraphs: ['Bu sayfada gizlilik uygulamalarımızın bir özeti sunulmaktadır. Veri işleme, haklarınız ve GDPR, CCPA ve diğer gizlilik yasaları kapsamındaki yükümlülüklerimize ilişkin tüm ayrıntıları içeren yasal olarak bağlayıcı gizlilik politikasının tamamı için lütfen iubenda tarafından barındırılan politikamızın tamamını görüntüleyin.'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'iubenda\'da Gizlilik Politikasının tamamını görüntüleyin',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
