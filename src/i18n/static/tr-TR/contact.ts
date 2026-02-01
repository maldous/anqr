import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Bize Ulaşın',
  description: 'Geri bildirimleri, hata raporlarını, özellik isteklerini ve genel soruları memnuniyetle karşılıyoruz.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Bize nasıl ulaşabilirsiniz?',
      paragraphs: ['İhtiyaçlarınıza bağlı olarak bizimle iletişime geçmeniz için çeşitli yollar sunuyoruz. Yanıt süreleri yoğunluk ve sorgu türüne göre değişiklik gösterse de her mesajı okuyoruz.'],
    },
    {
      heading: 'E-posta',
      paragraphs: ['Tüm sorularınız için: email@anqr.link', 'Bu bize ulaşmanın en güvenilir yoludur ve ayrıntılı sorular, iş soruları veya diğer sorularınız için önerilir.'],
    },
    {
      heading: 'Sorgu türleri',
      bullets: ['Genel sorular: ANQR\'nin nasıl kullanılacağı, özellik açıklamaları veya genel geri bildirimlerle ilgili sorular.', 'Hata raporları: Lütfen tarayıcınızı, işletim sisteminizi, çoğaltma adımlarını ve gördüğünüz hata mesajlarını ekleyin.', 'Özellik istekleri: Yeni özellikler veya iyileştirmeler için öneriler. Uygulama sözü veremesek de tüm talepleri değerlendiriyoruz.', 'İşle ilgili sorular: Ortaklık fırsatları, lisanslamayla ilgili sorular veya ticari kullanımla ilgili sorular.', 'Gizlilik talepleri: GDPR, CCPA veya diğer gizlilik yasaları kapsamındaki gizlilik haklarınızı kullanma talepleri (bkz. Gizlilik Politikası).', 'DMCA/Telif Hakkı: Yayından kaldırma bildirimi gereklilikleri için aşağıdaki DMCA bölümüne bakın.'],
    },
    {
      heading: 'Yanıt süreleri',
      paragraphs: ['Sorularınıza 5-7 iş günü içinde yanıt vermeyi hedefliyoruz. Gizlilikle ilgili talepler, yasaların gerektirdiği şekilde 30 gün içinde ele alınacaktır.', 'Yoğun dönemlerde yanıt süreleri daha uzun olabilir. Acil konular için lütfen konu satırında "ACİL" ifadesini belirtiniz.'],
    },
    {
      heading: 'Bizimle iletişime geçmeden önce',
      paragraphs: ['ANQR özelliklerinin nasıl kullanılacağına ilişkin sık sorulan soruların yanıtları için lütfen Belgeler sayfamıza bakın. Burada QR kodu oluşturma, stillendirme ve dışa aktarma seçenekleriyle ilgili birçok soru ele alınmaktadır.'],
    },
    {
      heading: 'DMCA Telif Hakkı Bildirimleri',
      paragraphs: ['ANQR\'da bulunan içeriğin telif hakkınızı ihlal ettiğini düşünüyorsanız Dijital Binyıl Telif Hakkı Yasası (DMCA) yayından kaldırma bildirimi gönderebilirsiniz. Geçerli olabilmesi için bildiriminizin şunları içermesi gerekir:'],
      bullets: ['Telif hakkı sahibinin veya yetkili temsilcisinin fiziksel veya elektronik imzası.', 'İhlal edildiği iddia edilen telif hakkıyla korunan eserin tanımı.', 'İhlal ettiği iddia edilen materyalin, yerini belirlemeye yetecek bilgilerle birlikte tanımlanması.', 'İletişim bilgileriniz (adres, telefon numarası ve e-posta adresi).', 'Materyalin kullanımına telif hakkı sahibi tarafından izin verilmediğine iyi niyetle inandığınızı belirten bir beyan.', 'Yalancı şahitlik cezası kapsamında, bildiriminizdeki bilgilerin doğru olduğunu ve telif hakkı sahibi olduğunuzu veya onlar adına hareket etmeye yetkili olduğunuzu belirten bir beyan.'],
    },
    {
      heading: 'DMCA İletişim',
      paragraphs: ['DMCA bildirimlerini şu adrese gönderin: email@anqr.link', 'Lütfen konu satırına "DMCA Bildirimi"ni ekleyin. Geçerli bildirimlere yürürlükteki yasalara uygun olarak yanıt vereceğiz. ANQR\'nin kullanıcıların cihazlarında yerel olarak QR kodları oluşturduğunu ve kullanıcı tarafından oluşturulan içeriği barındırmadığını unutmayın.'],
    },
    {
      heading: 'Reddit Topluluğu',
      paragraphs: ['QR kreasyonlarınızı paylaşmak, sorular sormak, yardım almak ve diğer ANQR kullanıcılarıyla bağlantı kurmak için r/ANQR adresindeki Reddit topluluğumuza katılın.'],
    },
  ],
};

export default contact;
