import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Əməkdaşlıq',
  description: 'Geri bildirim, bug hesabatları, xüsusiyyət məlumatları və ümumi məlumatları qoşun.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Bizimlə necə çatdırmaq',
      paragraphs: ['Biz sizin ehtiyaclarına qəbul etmək üçün bir neçə yol təklif. Biz hər hansı bir mesaj oxumaq, cavab dəstək və sorğu növü dəyişiklik edə bilər.'],
    },
    {
      heading: 'E-mail',
      paragraphs: ['Bütün uşaqlar üçün: email@anqr.link', 'Bu, bizə çatmaq üçün ən etibarlı yoldur və ətraflı suallar, biznes enquiries, və ya digər məlumatlar üçün tələb olunur.'],
    },
    {
      heading: 'Enquiries növləri',
      bullets: ['Ümumi suallar: ANQR, xüsusiyyət izahları və ya ümumi geribildirim istifadə etmək haqqında suallar.', 'Bug hesabatları: Sizin browser daxildir, əməliyyat sistemi, yeniləmək üçün addımlar, və görmək hər hansı bir səhv mesajları.', 'Xüsusiyyətlər: Yeni xüsusiyyətlər və ya inkişaflar üçün proqramlar. Biz haqqında bütün məlumatları baxmaq.', 'Biznes enquiries: Əməkdaşlıq imkanları, lisenziya məlumatları, və ya kommersiya istifadəsi enquiries.', 'Gizlilik məlumatları: GDPR, CCPA, və ya digər gizlilik hüquqları altında gizlilik hüquqlarını təmin etmək istəyirəm ( Gizlilik Siyasət).', 'Proqramlar: Əməliyyat tərəfindən aşağıdakı səhifələri baxın.'],
    },
    {
      heading: 'Vaxtlar',
      paragraphs: ['Biz 5-7 iş günü əlavə etmək istəyirik. Müəlliflik hüquqları haqqında 30 gün əlavə olunacaq.', 'Müxtəlif vaxtlarda, cavab vaxtları daha uzun ola bilər. Ətraflı məsləhətlər üçün, məsafətinizdə "URGENT" göstərir.'],
    },
    {
      heading: 'Bizimlə əlaqə saxlayın',
      paragraphs: ['ANQR xüsusiyyətlərini necə istifadə etmək üçün ümumi suallara cavab vermək üçün bizim Documentation page kontrol edin. QR kodu istehsal, stil və ixrac variantları haqqında bir çox soruşur.'],
    },
    {
      heading: 'Bakı Qeydiyyat',
      paragraphs: ['E-poçt ünvanı Qeydiyyatdan keçmək lazımdır:'],
      bullets: ['E-poçt ünvanı.', 'İctimai məhsulların qeyd edilməsi haqqında.', 'Əməliyyatdan keçən materialların təyin edilməsi, onu yerləşdirmək üçün məlumatla.', 'Yadda saxla.', 'Material istifadə etdiyiniz yaxşı iman inancınız var ki, məsləhət sahibi tərəfindən mövcud deyil.', 'Bir məlumat, perjury altında, sizin bildirişin məlumat doğru və sizin adınıza həyata keçirmək üçün məlumat.'],
    },
    {
      heading: 'E-poçt',
      paragraphs: ['Yadda saxla', 'Please  "  " . . . . Qeyd olunan hüquqlara uyğun olacaq. ANQR istifadəçilər cihazlarında yerli QR kodları yaratmaq və istifadəçinin yaradılmış məlumat almaq.'],
    },
    {
      heading: 'Reddit İcması',
      paragraphs: ['QR yaradıcılığınızı bölüşmək, suallar vermək, kömək almaq və digər ANQR istifadəçiləri ilə əlaqə yaratmaq üçün r/ANQR-də Reddit icmamıza qoşulun.'],
    },
  ],
};

export default contact;
