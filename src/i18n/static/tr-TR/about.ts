import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'ANQR Hakkında',
  description: 'ANQR, müşteri odaklı bir yaklaşıma sahip ücretsiz bir QR kod oluşturucudur; yerel olarak QR kodları oluşturun veya yerleştirme için API\'mızı kullanın.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Jeneratörü aç', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Learn makalelerine göz atın', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Gizlilik Politikası', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Hizmet Şartları', type: 'external' },
  ],
  sections: [
    {
      heading: 'ANQR nedir?',
      paragraphs: ['ANQR ("çapa" olarak telaffuz edilir), URL\'ler, metinler, Wi-Fi kimlik bilgileri, kişi kartları, takvim etkinlikleri ve daha fazlası için taranabilir kodlar oluşturan ücretsiz bir QR kodu oluşturucudur.', 'Kayıt olmadan güçlü QR araçları isteyen bireyler, küçük işletmeler, pazarlamacılar ve geliştiriciler için tasarlanmıştır. İstemci öncelikli tasarım, profesyonel yerleştirme ve entegrasyon için isteğe bağlı bir sunucu API\'si ile QR kodlarının varsayılan olarak tarayıcınızda yerel olarak oluşturulduğu anlamına gelir.'],
    },
    {
      heading: 'Temel özellikler',
      bullets: ['Tarayıcınızda anında QR kodları oluşturun; hesap gerektirmez.', 'Renkleri, modül stillerini, bulucu desenlerini özelleştirin ve görüntü katmanları ekleyin.', 'Birden fazla formatta dışa aktarın: PNG, SVG, WebP ve animasyonlu GIF.', 'Hata düzeltme düzeyi, QR sürümü, kodlama modu ve maske seçimi için gelişmiş kontroller.', 'Kodların baskıda ve ekranlarda okunabilir kalmasına yardımcı olmak için tarama güvenliği kılavuzu ve canlı önizleme.', 'Tam parametre desteğiyle profesyonel yerleştirme için sunucu tarafı API\'si.', 'Yüklendikten sonra çevrimdışı çalışır; her yerde çalıştırabileceğiniz statik bir web uygulamasıdır.'],
    },
    {
      heading: 'ANQR nasıl çalışır?',
      paragraphs: ['ANQR, tarayıcınızda çalışır ve girişinizi Reed-Solomon hata düzeltmesiyle standart bir QR matrisine kodlar ve ardından onu seçtiğiniz formatta işler.', 'Varsayılan olarak oluşturma, tarayıcınızda yerel olarak gerçekleşir. Profesyonel kullanım için, URL parametreleri aracılığıyla QR kodları oluşturmak için sunucu tarafı API\'sini de kullanabilirsiniz; web sitelerine, e-postalara veya otomatik iş akışlarına yerleştirmek için mükemmeldir.', 'Kaplamalar veya animasyonlar eklediğinizde ANQR, stil ile tarama güvenilirliğini dengeler, böylece sonuç taranabilir kalır.', 'ANQR statik kodlara odaklanır (veriler QR\'nin içindedir). Dinamik bir koda (düzenlenebilir hedef) ihtiyacınız varsa, kendi yönlendirme URL\'nizi veya kısa bağlantınızı kodlayabilirsiniz.'],
    },
    {
      heading: 'ANQR\'yi kim işletiyor?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklamcılık ve nasıl özgür kalıyoruz',
      paragraphs: ['ANQR\'nin kullanımı ücretsizdir ve reklamlarla desteklenmektedir. Google AdSense ve/veya diğer reklam ortakları aracılığıyla reklam gösterebiliriz.', 'Reklam sağlayıcılar, reklamları ilgi alanlarınıza ve tarama etkinliğinize göre kişiselleştirmek için çerezler veya benzer teknolojiler kullanabilir. Reklam tercihlerini cihaz ayarlarınızdan ve Google reklam ayarlarından yönetebilir ve Gizlilik Politikamızdan daha fazla bilgi edinebilirsiniz.', 'QR kod olarak kodladığınız içerikleri satmıyoruz. Reklamlar, projeyi yürütme ve geliştirme maliyetlerinin karşılanmasına yardımcı olur.'],
    },
    {
      heading: 'Açık standartlar',
      paragraphs: ['ANQR, ISO/IEC 18004 standardını temel alan QR kodları oluşturur ve tarayıcılar, kameralar ve baskı iş akışları arasında geniş uyumluluğu amaçlar.'],
    },
    {
      heading: 'Ticari marka bildirimi',
      paragraphs: ['QR Code®, DENSO WAVE INCORPORATED\'ın tescilli ticari markasıdır. ANQR, DENSO WAVE INCORPORATED\'a bağlı değildir, onun tarafından desteklenmez veya onun sponsorluğunda değildir.'],
    },
    {
      heading: 'Geri bildirim ve katkılar',
      paragraphs: ['Geri bildirimleri, hata raporlarını ve özellik önerilerini memnuniyetle karşılıyoruz. Lütfen e-posta veya iletişim sayfası aracılığıyla iletişime geçin; yanıt süreleri farklılık gösterse de her mesajı okuyoruz.'],
    },
  ],
};

export default about;
