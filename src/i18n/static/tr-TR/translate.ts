import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'ANQR\'yi Çevirmeye Yardım Edin',
  description: 'ANQR\'un dünya çapındaki kullanıcılar için erişilebilir olmasına yardımcı olan çevirmen topluluğumuza katılın. Kodlama deneyimi gerekmez; doğrudan tarayıcınızdan katkıda bulunun.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Çeviri Deposunu Aç', type: 'external' },
    { href: '/?lang=${lang}', label: 'Jeneratörü açın', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'ANQR Hakkında', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Bize Ulaşın', type: 'external' },
  ],
  sections: [
    {
      heading: 'Neden Katkıda Bulunmalısınız?',
      paragraphs: ['ANQR, dünyanın her yerindeki insanlar tarafından işletmeler, etkinlikler, ödemeler ve kişisel projeler için QR kodları oluşturmak amacıyla kullanılıyor. Çevirilere katkıda bulunarak, bu güçlü aracın kendi ana dillerini tercih eden kullanıcılar için erişilebilir olmasına yardımcı olursunuz.', 'İster bir yazım hatasını düzeltmek ister bir dilin tamamını çevirmek olsun, her çeviri katkısı, topluluğunuzdaki kullanıcılar için gerçek bir fark yaratır.'],
    },
    {
      heading: 'Ne Çevirebilirsin?',
      paragraphs: ['ANQR\'da iki tür çevrilebilir içerik bulunur:'],
      bullets: ['Kullanıcı Arayüzü Dizeleri: Uygulama genelinde görünen düğme etiketleri, menü öğeleri, araç ipuçları ve arayüz metni.', 'Statik İçerik: Kılavuzlar, örnekler, gizlilik politikası ve yardım makalelerini içeren belge sayfaları.', 'Her iki tür de doğrudan tarayıcınızda düzenleyebileceğiniz basit metin dosyaları olarak saklanır; özel bir yazılıma gerek yoktur.', 'Kalite ve tutarlılığı sağlamak için çeviriler birleştirilmeden önce incelenir.'],
    },
    {
      heading: 'Nasıl Katkıda Bulunulur?',
      paragraphs: ['Katkıda bulunmak kolaydır ve Git bilgisi gerektirmez:'],
      bullets: ['GitHub\'daki genel çeviri havuzumuzu ziyaret edin.', 'Dil dosyanızı bulun (veya diliniz henüz desteklenmiyorsa yeni bir tane oluşturun).', 'Doğrudan tarayıcınızda düzenlemek için kalem simgesini tıklayın.', 'Değişikliklerinizi yapın ve "Değişiklik öner"e tıklayın; GitHub otomatik olarak bir çekme isteği oluşturacaktır.', 'Katkınız genellikle birkaç gün içinde incelenecek ve birleştirilecektir.'],
    },
    {
      heading: 'Çeviri Kuralları',
      paragraphs: ['Çeviri yaparken lütfen {name}, {count} ve {{variable}} gibi yer tutucuları değiştirmeden tutun; bunlar çalışma zamanında dinamik değerlerle değiştirilir. Ayrıca [[/path|Label]] biçimindeki bağlantılar gibi HTML benzeri sözdizimlerini de koruyun.', 'Bir çeviriden emin değilseniz, yanlış bir çeviri yapmaktansa İngilizce olarak bırakmak daha iyidir. Ayrıca açıklama istemek için GitHub\'da bir konu açabilirsiniz.'],
    },
    {
      heading: 'Şu anda Desteklenen Diller',
      paragraphs: ['ANQR şu anda aşağıdakiler dahil 40\'tan fazla dili desteklemektedir:'],
      bullets: ['Başlıca dünya dilleri: İngilizce, Çince, İspanyolca, Arapça, Hintçe, Portekizce, Japonca, Korece, Fransızca, Almanca, Rusça ve daha fazlası.', 'Güneydoğu Asya dilleri: Tayca, Vietnamca, Endonezce, Filipince, Malayca, Khmerce, Laoca, Burmaca.', 'Güney Asya dilleri: Hintçe, Tamilce, Telugu dili, Bengalce, Marathi, Guceratça, Kannadaca, Malayalamca, Pencapça, Nepalce.'],
    },
    {
      heading: 'Tanıma',
      paragraphs: ['Tüm katkıda bulunanlar depomuza yatırılmıştır. Çalışmanız binlerce kullanıcının ANQR\'a tercih ettikleri dilde erişmesine yardımcı oluyor.', 'ANQR\'un dünya çapında erişilebilir olmasına yardımcı oldukları için tüm çeviri ortaklarımıza teşekkür ederiz!'],
    },
    {
      heading: 'Sorunuz mu var?',
      paragraphs: ['Çevirilere katkıda bulunma konusunda sorularınız varsa lütfen GitHub depomuzda bir konu açın veya e-posta yoluyla bizimle iletişime geçin. Başlamanıza yardımcı olmaktan mutluluk duyarız.'],
    },
  ],
};

export default translate;
