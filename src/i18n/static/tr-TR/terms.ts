import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Hizmet Şartları',
  description: 'Siteye erişerek veya siteyi kullanarak bu şartlara bağlı kalmayı kabul etmiş olursunuz.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Gizlilik Politikası', type: 'external' }],
  sections: [
    {
      heading: 'Şartların kabulü',
      paragraphs: ['ANQR\'ye (anqr.link) erişerek veya onu kullanarak, bu Hizmet Koşullarına ve Gizlilik Politikamıza bağlı kalmayı kabul edersiniz. Bu şartları kabul etmiyorsanız siteyi kullanmayınız.', 'Bu Koşulları zaman zaman güncelleyebiliriz. Değişikliklerden sonra sitenin kullanılmaya devam edilmesi yeni şartların kabul edildiği anlamına gelir.'],
    },
    {
      heading: 'Uygunluk',
      paragraphs: ['ANQR\'ı kullanabilmek için en az 13 yaşında olmanız gerekir. Siteyi kullanarak bu yaş şartını karşıladığınızı beyan etmiş olursunuz. 18 yaşın altındaysanız, siteyi kullanmak için ebeveyninizin veya vasinizin iznine sahip olduğunuzu beyan etmiş olursunuz.'],
    },
    {
      heading: 'İzin verilen kullanım',
      paragraphs: ['ANQR\'yi yalnızca yasal amaçlarla kullanabilirsiniz. QR kodlarına kodladığınız içerikten ve oluşturduğunuz QR kodlarını nasıl kullandığınızdan yalnızca siz sorumlusunuz.'],
    },
    {
      heading: 'Yasaklanmış davranış',
      paragraphs: ['Aşağıdakileri yapmamayı kabul edersiniz:'],
      bullets: ['Kimlik avını, kötü amaçlı yazılım dağıtımını, dolandırıcılığı, dolandırıcılığı, tacizi, iftirayı veya herhangi bir yasa dışı faaliyeti kolaylaştıran QR kodları oluşturmak için ANQR\'yi kullanın.', 'Fikri mülkiyet haklarını ihlal eden, gizliliği ihlal eden veya yasa dışı materyal içeren içeriği kodlayın.', 'Sitenin çalışmasını veya güvenliğini bozmaya, aşırı yüklemeye veya bunlara müdahale etmeye çalışmak.', 'Sitede tersine mühendislik yapın, kaynak koda dönüştürün veya kaynak kodunu çıkarmaya çalışın.', 'Siteye diğer kullanıcıların performansını düşürecek şekilde erişmek için otomatik araçlar (botlar, kazıyıcılar) kullanın.', 'Herhangi bir güvenlik veya erişim kontrolü özelliğini atlatın veya devre dışı bırakın.', 'Herhangi bir kişi veya kuruluşu taklit etmek veya üyeliğinizi yanlış tanıtmak.'],
    },
    {
      heading: 'Fikri mülkiyet',
      paragraphs: ['QR kodlarına kodladığınız içeriğin mülkiyeti sizde kalır. ANQR verilerinizin sahipliğini iddia etmez.', 'ANQR adı, logosu, arayüz tasarımı ve temel kodu, telif hakkı, ticari marka ve diğer fikri mülkiyet yasalarıyla korunmaktadır. İznimiz olmadan kopyalayamaz, değiştiremez, dağıtamaz veya türev çalışmalar oluşturamazsınız.', 'QR Code®, DENSO WAVE INCORPORATED\'ın tescilli ticari markasıdır. ANQR, DENSO WAVE\'e bağlı değildir.'],
    },
    {
      heading: 'Kullanıcı içeriği lisansı',
      paragraphs: ['ANQR\'yi kullanarak bize içeriğinize ilişkin hiçbir hak vermezsiniz. Yerel oluşturma (varsayılan) kullanıldığında, tüm QR kodu oluşturma işlemi tarayıcınızda gerçekleşir ve kodlanmış verilerinize erişmez, saklamaz veya aktarmayız.', 'Sunucu tarafı API\'sini kullanırken, içeriğiniz QR görüntüsünü oluşturmak için işlenir ancak istenen görüntüyü oluşturmanın ötesinde saklanmaz, günlüğe kaydedilmez veya başka herhangi bir amaçla kullanılmaz.'],
    },
    {
      heading: 'Üçüncü taraf hizmetleri ve reklamları',
      paragraphs: ['Site, Google AdSense aracılığıyla reklamlar görüntüler ve üçüncü taraf web sitelerine bağlantılar içerebilir. Üçüncü taraf içeriğinden, hizmetlerinden veya gizlilik uygulamalarından sorumlu değiliz.', 'Reklamverenlerle ve üçüncü taraflarla olan etkileşimleriniz yalnızca sizinle onlar arasındadır. Reklam verileri uygulamaları hakkında bilgi için Gizlilik Politikamıza bakın.'],
    },
    {
      heading: 'Garantilerin reddi',
      paragraphs: ['ANQR, TİCARİ ELVERİŞLİLİK, BELİRLİ BİR AMACA UYGUNLUK VE İHLAL ETMEME KONUSUNDA ZIMNİ GARANTİLER DAHİL ANCAK BUNLARLA SINIRLI OLMAMAK ÜZERE AÇIK VEYA ZIMNİ HERHANGİ BİR GARANTİ OLMAKSIZIN "OLDUĞU GİBİ" VE "MEVCUT OLDUĞU GİBİ" SAĞLANIR.', 'Şunları garanti etmiyoruz: (a) sitenin kesintisiz, güvenli veya hatasız olacağını; (b) QR kodları tüm ortamlarda, tüm cihazlarda veya tüm tarayıcı uygulamalarında taranacaktır; (c) sitenin gereksinimlerinizi karşılayacağı.', 'QR kodlarını her zaman kullanılacağı koşullarda (baskı boyutu, aydınlatma, ekran tipi, mesafe, kamera kalitesi) test etmelisiniz.'],
    },
    {
      heading: 'Sorumluluğun Sınırlandırılması',
      paragraphs: ['YASALARIN İZİN VERDİĞİ AZAMİ ÖLÇÜDE, ANQR VE OPERATÖRLERİ, BAĞLI KURULUŞLARI VE LİSANS VERENLERİ, KÂR KAYBI ZARARLARI DAHİL ANCAK BUNLARLA SINIRLI OLMAMAK ÜZERE, HERHANGİ BİR DOĞRUDAN, DOLAYLI, ARIZİ, ÖZEL, SONUÇ OLARAK ORTAYA ÇIKAN, CEZAİ VEYA ÖRNEK TEŞKİL EDEN ZARARLARDAN SORUMLU OLMAYACAKTIR. HİZMETE ERİŞİMİNİZDEN VEYA HİZMETİ KULLANMANIZDAN (YA DA HİZMETE ERİŞİM VEYA KULLANAMAMANIZDAN) KAYNAKLANAN GELİR, VERİ, ŞEREFİYE, KULLANIM VEYA DİĞER MADDİ OLMAYAN KAYIPLAR.', 'HİZMETİ KULLANMANIZIN RİSKİNİN TAMAMEN SİZE AİT OLDUĞUNU AÇIKÇA ANLAR VE KABUL EDERSİNİZ. HİZMET ÜCRETSİZ SUNULMAKTADIR VE BU NEDENLE ANQR VE OPERATÖRLERİNİN HERHANGİ BİR ZARAR VEYA KAYIPLAR İÇİN SİZE KARŞI HİÇBİR SORUMLULUK OLMADIĞINI KABUL EDİYORSUNUZ. TOPLAM YÜKÜMLÜLÜĞÜMÜZ HİÇBİR DURUMDA SIFIR DOLARI (0 AUD) AŞAMAYACAKTIR.', 'HİZMETİ KULLANMANIZDAN KAYNAKLANAN ANQR VE OPERATÖRLERİNE KARŞI TÜM İDDİALARI, TALEPLERİ VE DAVA NEDENLERİNİ FERAGAT ETTİĞİNİZİ, FERAGAT ETTİĞİNİZİ VE REDDEDİYORSUNUZ.', 'BAZI YARGI ALANLARI BELİRLİ GARANTİLERİN VEYA SORUMLULUK SINIRLAMALARININ HARİÇ TUTULMASINA İZİN VERMEZ. BU TÜR YARGI ALANLARINDA YÜKÜMLÜLÜĞÜMÜZ, GEÇERLİ YASALARIN İZİN VERDİĞİ AZAMİ ÖLÇÜDE SINIRLI OLACAKTIR.'],
    },
    {
      heading: 'Tazminat',
      paragraphs: ['ANQR\'yi, operatörlerini, bağlı kuruluşlarını ve ilgili görevlilerini, yöneticilerini, çalışanlarını ve acentelerini aşağıdakilerden kaynaklanan her türlü talep, zarar, kayıp, yükümlülük, maliyet ve harcamaya (yasal ücretler dahil) karşı tazmin etmeyi, savunmayı ve masun tutmayı kabul edersiniz: (a) siteyi kullanmanız; (b) bu ​​Şartları ihlal etmeniz; (c) herhangi bir üçüncü taraf hakkını ihlal etmeniz; (d) QR kodlarına kodladığınız herhangi bir içerik.'],
    },
    {
      heading: 'Uyuşmazlık çözümü',
      paragraphs: ['Bu Koşullardan veya ANQR kullanımınızdan kaynaklanan herhangi bir anlaşmazlık, öncelikle email@anqr.link ile iletişime geçilerek resmi olmayan müzakere yoluyla çözülmeye çalışılacaktır.', 'Gayri resmi çözüm başarısız olursa, anlaşmazlıklar Victoria, Avustralya\'da bağlayıcı tahkim yoluyla çözülecektir; ancak taraflardan herhangi biri fikri mülkiyet ihlalleri için mahkemede ihtiyati tedbir talebinde bulunabilir.'],
    },
    {
      heading: 'Toplu davadan feragat',
      paragraphs: ['YASALARIN İZİN VERDİĞİ ÖLÇÜDE, HER TÜRLÜ ANLAŞMAZLIK ÇÖZÜM İŞLEMLERİNİN TOPLU, KONSOLİDE VEYA TEMSİLCİ DAVA OLARAK DEĞİL, YALNIZCA BİREYSEL OLARAK YAPILMASINI KABUL EDİYORSUNUZ.'],
    },
    {
      heading: 'Geçerli hukuk',
      paragraphs: ['Bu Şartlar, kanunlar ihtilafı ilkelerine bakılmaksızın Victoria, Avustralya kanunlarına tabidir. Victoria, Avustralya\'da bulunan mahkemelerin münhasır yargı yetkisini kabul ediyorsunuz.'],
    },
    {
      heading: 'Değişiklikler ve kullanılabilirlik',
      paragraphs: ['Siteyi (veya herhangi bir bölümünü) herhangi bir zamanda bildirimde bulunmaksızın veya herhangi bir sorumluluk üstlenmeksizin değiştirebilir, askıya alabilir veya sonlandırabiliriz.', 'Bu Şartları istediğimiz zaman güncelleyebiliriz. "Son güncelleme" tarihi, bunların en son ne zaman revize edildiğini gösterir. Değişikliklerden sonra kullanıma devam edilmesi kabul anlamına gelir.'],
    },
    {
      heading: 'Bölünebilirlik',
      paragraphs: ['Bu Koşulların herhangi bir hükmünün geçersiz veya uygulanamaz görülmesi halinde, bu hüküm izin verilen azami ölçüde uygulanacak ve geri kalan hükümler tam olarak yürürlükte kalacaktır.'],
    },
    {
      heading: 'Feragat',
      paragraphs: ['Bu Şartların herhangi bir hakkını veya hükmünü uygulamamamız, söz konusu hak veya hükümden feragat edildiği anlamına gelmez.'],
    },
    {
      heading: 'Anlaşmanın tamamı',
      paragraphs: ['Bu Koşullar, Gizlilik Politikamızla birlikte, siteyi kullanımınıza ilişkin siz ve ANQR arasındaki anlaşmanın tamamını oluşturur ve daha önceki tüm anlaşmaların yerine geçer.'],
    },
    {
      heading: 'Mücbir sebep',
      paragraphs: ['Doğal afetler, savaş, terörizm, ayaklanmalar, hükümet eylemleri veya internet/altyapı arızaları dahil olmak üzere makul kontrolümüz dışındaki durumlardan kaynaklanan herhangi bir performans başarısızlığı veya gecikmesinden sorumlu olmayacağız.'],
    },
    {
      heading: 'İletişim',
      paragraphs: ['Bu Şartlarla ilgili sorular şu adrese gönderilebilir: email@anqr.link'],
    },
  ],
};

export default terms;
