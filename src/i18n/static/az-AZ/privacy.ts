import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Qeydiyyat',
  description:
    'İnformasiya ANQR, necə istifadə olunur, və mövcud gizlilik tərəfindən sizin hüquqları toplamaq.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Xidmətləri', type: 'external' }],
  sections: [
    {
      heading: 'Tarix',
      paragraphs: [
        'ANQR bir müştəri-ilk yanaşma ilə QR kodu generatorudur. Biz hesabı yaratmaq istəyirik. default tərəfindən, QR kodları yerli sizin browser istehsal edir - biz kod kodunuzu dəstəkləyirik.',
        'Professional istifadə üçün ANQR, URL parametrləri QR kodları yaradır server-side API verir. API istifadə zaman, Sizin QR məlumat bizim server işləyir, lakin saxlamaq və ya giriş deyil.',
        'Biz reklam üçün Google AdSense istifadə edin və analitik xidmətlər istifadə edə bilərsiniz. Bu xidmətlər cookies və benzer texnologiyalar vasitəsilə məlumat toplamaq. Bu siyasət məlumatların toplandığını, necə istifadə olunur, və hüquqlarınızı izah edir.',
      ],
    },
    {
      heading: 'Biz toplamaq',
      bullets: [
        'Sifariş edin: Siz e-poçt və ya bizim əlaqə forması ilə əlaqədar varsa, biz adı, e-poçt ünvanı, və mesaj content toplamaq.',
        'Avtomatik məlumat: Bizim hosting təchizatçı (Netlify), reklam tərəfdaşları, və analitik xidmətlər toplamaq ola bilər: IP ünvanı, browser növü və versiyası, əməliyyat sistemi, cihaz növü, əməlumat, səhifə, səhifə, səhifə, səhifə, səhifə, səhifə, səhifə, səhifə məsləhəti, sayt, sayt və mərkəzi coğrafi yer.',
        'Üçüncü tərəfli cookies: Bizim reklam tərəfdaşları (Google AdSense) reklam xidmət və ölçmək üçün cookies və benzer texnologiyaları istifadə edin. ANQR özü heç bir ilk partiya cookies təşkil etmir.',
      ],
    },
    {
      heading: 'Cookies və üçüncü texnologiya',
      paragraphs: [
        'ANQR heç bir ilk partiya cookies təşkil etmir. Sizin tercihləriniz (səfərlik rejimi kimi) hər bir serverə göstərilmədiyiniz cihazda yerli saxlanılır.',
        'Lakin, reklam tərəfdaşlarımız (Google AdSense) və hosting təchizatçıları cookies və səyahət texnologiyaları istifadə edə bilər:',
      ],
      bullets: [
        'Reklam cookies (üçüncü partiya): Google AdSense və reklam tərəfdaşları tərəfindən müəyyən reklam xidmət etmək, reklam performansını ölçüləyin və istifadəçi maraqlarını anlamaq. Bu cookies müxtəlif saytlarda fəaliyyətini izləyə bilər.',
        'Analytics cookies (üçüncü partiya): Domen adı qeydiyyatdan keçirt ».',
      ],
    },
    {
      heading: 'Google AdSense və reklam',
      paragraphs: [
        'Biz Google AdSense ilə reklam göstərir. Google və onun tərəfdaşları bu saytın və digər web saytında gözəl reklam xidmət üçün cookies istifadə edin (səs-based reklam).',
        'Google məlumatlarınızı necə istifadə edin: https://policies.google.com/technologies/partner-sites',
        'Manage: https://adssettings.google.com',
        'Network Reklam İnkişafı ilə çıxış: https://optout.networkadvertising.org',
        'Digital Reklam Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Biz məlumat istifadə edirik',
      bullets: [
        'Sizin enquiries cavab vermək və əlavə etmək.',
        'Bizim reklam tərəfindən müxtəlif reklam göstərmək.',
        'Site istifadə etmək və xidmətlərimizi inkişaf etmək.',
        'Axtarış, qarşılamaq və qazanmaq, istismar və təhlükəsizlik problemləri.',
        'Hüquqlar qorunur.',
      ],
    },
    {
      heading: 'Üçüncü kateqoriyalar',
      bullets: [
        'Google AdSense: reklam xidmət və ölçmək üçün məlumat almaq.',
        'Analytics: Anonim istifadə etmək data.',
        'Netlify Proseslər məlumatları və IP ünvanları ola bilər.',
        'Biz sizin xüsusi məlumat satmaq. Lakin, reklam tərəfdaşları ilə məlumatları CCPA altında "satış" ola bilər (aşağıya bax).',
      ],
    },
    {
      heading: 'Data tutmaq',
      bullets: [
        'Yadda saxla 2 ildən artıq.',
        'Yadda saxla 30 gün qeydiyyatdan keçirilmişdir.',
        'Analitik məlumat: 26 aya qədər (anonymed).',
        'Reklam cookies: Tipik 13 ay (orta tərəfindən).',
      ],
    },
    {
      heading: 'GDPR altında hüquqlar (AEA istifadəçiləri)',
      paragraphs: [
        'Avropa İqtisadi Alandaysanız, Baş Data Müdafiə Təhlükəsizlik Tərəfliyi altında aşağıdakı hüquqları var:',
      ],
      bullets: [
        'Giriş: Sizin haqqımızda saxlamaq istədiyimiz məlumatların bir kopyasını istəyirsiniz.',
        'Redaksiya üçün doğru: Inaccurate datanın düzelməsini istehsal edin.',
        'Qeydiyyatdan keçmək üçün: Sizin məlumatların deletion istəyirəm ("qaçılmış olmaqla).',
        'Emal qarşılaşdırmaq üçün: Sizin məlumat istifadə etdiyimiz haqqında məlumatları qorunur.',
        'Data portability üçün doğru: Sizin data portativ format.',
        'Obyekt: Daxili marketinq üçün deyil.',
        'Razılaşmaq üçün sağ: Əməliyyatdan keçirilən hər hansı bir zamanda razılaşma.',
        'Şirkətin qarşısını almaq üçün: Sizin məlumat qorunması mövcudluğu ilə məlumat verin.',
      ],
    },
    {
      heading: 'Təhlükəsizliyi',
      paragraphs: [
        'Biz bu üslublar üzrə data prosesi: (a) Consent - xüsusi reklam üçün ( reklam tərəfdaşlarımız tərəfindən); (b) Legitimate maraqları - analitik, təhlükəsizlik və inkişaf üçün; (c) konsepsiyası - enquiries cavab vermək.',
        'Sizin hüquqlarınızı, əlaqə e-mail@anqr.link. 30 gün ərzində cavab veririk.',
      ],
    },
    {
      heading: 'CCPA (California users) altında olan hüquqlar',
      bullets: [
        'Bilmək üçün: məlumatlar haqqında məlumatların alınması, məhsullar, məhsullar və üçüncü tərəflər.',
        'Açıq: Kişisel məlumatlarınızı cavab etmək.',
        'Qeydiyyatdan keçin: Müəlliflik hüququqları üzrə "satış" qəbul edə bilər.',
        'Qeydiyyatdan keçmək üçün: Biz sizin hüquqlarınızı təmin etmək üçün diskriminat deyil.',
      ],
    },
    {
      heading: 'CCPA kateqoriyaları toplanmışdır',
      paragraphs: [
        'Kateqoriyalar: Identifiers (IP ünvanı, cihaz ID), İnternet fəaliyyəti (browsing, ad mübadilələri), Geolocation (təssis), Inferences (baxışdan).',
        'Qeydiyyat və ya çıxış: e-poçt@anqr.link və ya cookies ayarlarını.',
      ],
    },
    {
      heading: 'Beynəlxalq transfer',
      paragraphs: [
        'Sizin məlumat Amerika Birləşmiş Ştatları daxil olmaqla müxtəlif data qorunması tərəfindən ölkələrə transfer ola bilər. Standart müqavilələr kimi uyğun qorunması istifadə edirik.',
      ],
    },
    {
      heading: 'Uşaqların gizlilik',
      paragraphs: [
        'ANQR 13-ci ildən çox uşaqlara qarşı deyil (ya da 16 AEA-da). Uşaqdan veri toplamaq deyil. Yadda saxla.',
      ],
    },
    {
      heading: 'Elanlar',
      paragraphs: [
        'HTTPS şifreleme daxil olmaqla məlumatların qarşısını almaq üçün uyğun texnologiya və təhlükəsizliyi istifadə edin. Lakin, internet aktivləşdirilməsi 100% təhlükəsizdir.',
      ],
    },
    {
      heading: 'Daxil ol',
      paragraphs: [
        'Biz qeyd Do Not Track browser mümkün deyil, reklam tərəfdaşları DNT cavab vermir.',
      ],
    },
    {
      heading: 'Bu siyasətin dəyişiklikləri',
      paragraphs: [
        'Bu siyasəti dəyişdirə bilərsiniz. "Son yeniləndirilmiş" tarixi ən son revizyonu göstərir. Xüsusi dəyişikliklər bir sayt banner vasitəsilə əlaqəli ola bilər.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: ['Yadda saxla 30 gün ərzində gizlilik istəyirəm.'],
    },
    {
      heading: 'Tam Məxfilik Siyasəti',
      paragraphs: [
        'Bu səhifə məxfilik təcrübələrimizin xülasəsini təqdim edir. Məlumatların emalı, hüquqlarınız və GDPR, CCPA və digər məxfilik qanunları üzrə öhdəliklərimizlə bağlı tam təfərrüatları olan tam, qanuni məcburi məxfilik siyasəti üçün lütfən, iubenda tərəfindən təşkil edilən tam siyasətimizə baxın.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Tam Məxfilik Siyasətinə iubenda-da baxın',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
