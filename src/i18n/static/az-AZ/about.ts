import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'ANQR',
  description: 'ANQR, bir müştəri-ilk yanaşma ilə pulsuz QR kodu generatorudur - yerli QR kodları yaradır və ya əlavə üçün API istifadə edin.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'İstehsalçı', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Elanlar', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Qeydiyyat', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Xidmətləri', type: 'external' },
  ],
  sections: [
    {
      heading: 'ANQR nedir?',
      paragraphs: ['E-poçt ünvanı.', 'Bu, qeyd, kiçik biznes, marketinq və proqramlar üçün inşa edilmişdir. müştəri-ilk dizaynı QR kodları yerli istehsal edir, istehsalçılıq və inteqrasiya üçün isteğe bağlı server API ilə.'],
    },
    {
      heading: 'Keyfiyyətlər',
      bullets: ['Sizin browser-da qalın QR kodları - heç bir hesab lazımdır.', 'Xüsusiyyətlər, modul üslubu, bulucu nümunələr, və image overlays əlavə.', 'Bir çox formatda səyahət: PNG, SVG, WebP və axtarış GIF.', 'İnformasiya səviyyəsi, QR versiyası, kodlama rejimi və mask seçimi üçün proqramlar.', 'Scan-safety guide and live preview to help keep codes print və ekranlarda oxumaq.', 'Tam parametr dəstəkləşdirilməsi ilə əməkdaşlıq API.', 'Domen adı qeydiyyatdan keçirt ».'],
    },
    {
      heading: 'ANQR işləyir',
      paragraphs: ['ANQR sizin browser çalışır və Reed-Solomon məlumat ilə standart QR matrix giriş kodlaşdırır, sonra seçdiyiniz formata verir.', 'Default tərəfindən, istehsal sizin browser yerli olur. Professional istifadə üçün, URL parametrləri ilə QR kodları yaratmaq üçün server-side API istifadə edə bilərsiniz - web saytları, e-poçtları və ya avtomatik işləyir.', 'Overlays və ya animalar əlavə etdiyiniz zaman, ANQR balansları tarama etibarlılığı ilə üslub taranır.', 'ANQR statik kodlara baxır (formalar QR daxildir). Dinamik kodu (editable hedef) ehtiyac varsa, öz yönləmə URL və ya qısa linkini kodlaya bilərsiniz.'],
    },
    {
      heading: 'Kim ANQR-i işləyir?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Reklam və pulsuz necə',
      paragraphs: ['ANQR istifadə üçün pulsuzdur və reklam tərəfindən dəstəklənir. Biz Google AdSense və / ya digər reklam tərəfindən reklam göstərir.', 'Ad avadanlıqları sizin maraqlıq və gözəllik fəaliyyəti əsaslanan elanlar və ya şəkillər istifadə edə bilər. Sizin cihaz parametrləri və Google ad parametrləri ilə reklam tercihləri idarə edə bilərsiniz və Gizlilik Siyasətimizdə daha çox öyrənmək.', 'QR kodlarına kod kod kodlanan content satmaq deyil. Reklamlar layihəsində çalışan və layihənin artırılmasına kömək edir.'],
    },
    {
      heading: 'Açıq standartlar',
      paragraphs: ['ANQR ISO/IEC 18004 standart əsasən QR kodları yaradır və browsers, kameralar və çap işıqları arasında geniş uyğunluğu təmin edir.'],
    },
    {
      heading: 'Trademark',
      paragraphs: ['QR Code ® DENSO WAVE INCORPORATED-nin qeyd edilmiş markadır. ANQR, DENSO WAVE INCORPORATED tərəfindən təsdiq edilmiş və ya sponsorluqla bağlı deyil.'],
    },
    {
      heading: 'Qeydiyyat və əlavə',
      paragraphs: ['Geri bildirim, bug hesabatları, və xüsusiyyət təkliflər. E-poçt və ya kontakt səhifəsi ilə əlaqə edin - biz hər mesaj olaraq, cavab vaxtları dəyişik ola bilər.'],
    },
  ],
};

export default about;
