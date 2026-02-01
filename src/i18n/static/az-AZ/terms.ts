import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Xidmətləri',
  description: 'Saytın giriş və ya istifadə edilən, bu şərtlərin qarşısını almaq razıdır.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Qeydiyyat', type: 'external' }],
  sections: [
    {
      heading: 'Mühasibatlar',
      paragraphs: ['E-poçt ünvanı Bu şəkilə razı deyilsə, saytdan istifadə edin.', 'Biz vaxtdan vaxta bilər. dəyişikliklərdən sonra saytın istifadəsi yeni şərtlərin qəbul edib.'],
    },
    {
      heading: 'Elan',
      paragraphs: ['ANQR istifadə etmək üçün ən azı 13 yaş olmalıdır. Saytdan istifadə etdiyiniz zaman, bu yaş tərəfindən məlumat verirsiniz. 18 altındaysanız, əvvəl və ya əvvəlçinin saytdan istifadə etmək üçün məlumatınız var.'],
    },
    {
      heading: 'Daxili istifadə',
      paragraphs: ['Həmkarlar üçün ANQR istifadə edə bilərsiniz. Siz yalnız QR kodlarına kod kod kodlanan və yaraddığınız QR kodları istifadə etmək üçün məlumatdan əvvəl edir.'],
    },
    {
      heading: 'Qeydiyyat',
      paragraphs: ['Siz razı deyil:'],
      bullets: ['Yadda saxla.', 'İntellektual mülk hüquqlarını qarşılaşdırmaq, gizlilik pozulmaq, və ya qanunsuz material var.', 'Əməliyyat, yüksək və ya saytın əməliyyat və ya təhlükəsizliyi ilə əməkdaşlıq.', 'Ters maşın, decompile, və ya saytdan əsas kodu çıxmaq.', 'Digər istifadəçilər üçün saytın performansını azaltmaq üçün avtomatlaşdırmaq üçün avtomatlaşdırılmış alətlər (botlar, çıxışçılar) istifadə edin.', 'Yadda saxla.', 'Heç bir şəxs və ya səhifə və ya səhifəsizliyinizi təmin edir.'],
    },
    {
      heading: 'İnformasiya',
      paragraphs: ['Siz QR kodlarına kod kod kodlanan content mülkiyyətini saxlayın. ANQR məlumatların mülkiyyətini iddia etmir.', 'ANQR adı, logo, interfeys dizaynı və əsas kodu məlumat, marka və digər intellektual mülk hüquqları ilə qorunur. Siz kopyalaya bilərsiniz, dəyişiklik, dağıtmaq və ya bizim məlumat olmadan türklik işləri yaratmaq.', 'QR Code ® DENSO WAVE INCORPORATED-nin qeyd edilmiş markadır. ANQR DENSO WAVE ilə bağlı deyil.'],
    },
    {
      heading: 'Daxili məlumatlar',
      paragraphs: ['ANQR istifadə etdiyiniz zaman, bizə məlumat verməyin. Yerli istehsal istifadə etdiyiniz zaman (en default), bütün QR kodu istehsal sizin browser olur və biz giriş deyil, mağaza və ya kodlaşdırılmış məlumatları ödəyin.', 'Server-side API istifadə edilən zaman, məlumat QR image yaratmaq üçün işlənir, lakin saxlanılır, qeydiyyatdan keçmiş və ya istənilən image qeydiyyatdan digər məqsəd üçün istifadə olunur.'],
    },
    {
      heading: 'Üçüncü partiya xidmətləri və reklam',
      paragraphs: ['Saytın Google AdSense ilə reklam göstərir və üçüncü tərəfli saytlara bağlantılar daxil edə bilər. Üçüncü tərəfli content, xidmətlər və ya gizlilik proqramlarından əməliyyatdan keçmir.', 'Yadda saxla Reklam data proqramları haqqında məlumat üçün Gizlilik Siyasəti baxın.'],
    },
    {
      heading: 'Əməliyyat vasitəsi',
      paragraphs: ['ANQR IS PROVIDED ON AN "AS IS" VƏ "AS AVAILABLE" ANY KIND, PRESS OR IMPLIED, INCLUDING BUT IMPLIED WARRANTIES MERCHANTABILITY, FITNESS, AND NON-INFRINGEMENT.', 'Biz məhsul deyil ki,: (a) site sorunsuz, təhlükəsiz, və ya məsulsuz olacaq; (b) QR kodları bütün təhlükəsizliklər, bütün cihazlar, və ya bütün browser applications ilə taranacaq; (c) sayt sizin tərəfindən tanış olacaq.', 'Onlar istifadə edəcək şərtlər QR kodları test lazımdır (print ölçüsü, işıqlandırma, ekran növü, səhifə, kamera keyfiyyət).'],
    },
    {
      heading: 'Əməliyyat',
      paragraphs: ['AZƏRBAYCAN RESPUBLİKLƏR, ƏLƏR VƏ MƏHƏLƏLƏLƏRƏLƏR VƏ ƏLƏR VƏ ƏLƏLƏR VƏ ƏLƏLƏR VƏLƏLƏR VƏLƏLƏR VƏLƏLƏR VƏLƏLƏLƏR VƏLƏLƏLƏR VƏLƏLƏLƏLƏRİNİN TƏMƏLƏLƏLƏLƏRİNİN TƏRİNİN TƏRLİYYƏRİNİN TƏRLİYYƏRİNİN TƏRİNİN TƏRİNİN TƏRİNLİYYƏRİNLİYYƏRƏRƏRƏRƏRƏRƏRƏRƏRİNƏRƏRƏRƏRƏRƏRƏRƏRƏRƏRƏRƏRƏR.', 'ƏMƏKDAŞLIQ ƏMƏKDAŞLIQ ƏLIYEVA ƏGƏRLIK HÜQUQUQLARI QORUNUR. NO EVENT SHALL ONUN TOTAL AGGREGATE LIABILITY EXCEED ZERO DOLLAR (0 AUD).', 'AGAINST ANQR AND ITS OPERATORS ARISING ÜZRƏ ÜZRƏ ÜZRƏ ÜZRƏ OPERATORLAR TƏHLÜKLƏR VƏ ÜZRƏ ƏLƏRİNİN TƏHLÜKƏLƏRİNİN TƏHLÜKƏLƏRİNİN TƏHLÜKƏRİNİN TƏHLÜKƏRİNİN TƏHLÜKƏR.', 'SOME JURISDICTIONS İNFORMASİYALARININ İNFORMASİYALARININ İNFORMASİYALARININ İNFORMASİYASI SUCH JURISDICTIONS, NEIMUM EXTENT PERMITTED BY APPLICABLE İNFORMASİYASINDA ƏLƏLƏLƏLƏLƏLƏR.'],
    },
    {
      heading: 'İnformasiya',
      paragraphs: ['Siz indemnify, müdafiə, və onun operatorları, iştirakçıları və onların müxtəlif müştərilər, müştərilər, müştərilər, hər hansı bir iddia, ziyanlar, qazanmaqlar, mallar və mallar (həmkarlıqlar daxil olmaqla) saytdan istifadə etmək; (b) Bu Terms pozulması; (c) Hər üçüncü tərəfli hüquqların pozulması; (d) QR kodlarına kodlanan hər hansı bir content.'],
    },
    {
      heading: 'Müəlliflik',
      paragraphs: ['E-poçt ünvanı.', 'İctimai qarşılaşdırma, mübahisələr Victoria, Avstraliya müxtəlif arbitraj vasitəsilə müzakirə olunacaq, həmçinin ya partiya injunctive məlumat ala bilər istisna olmaqla.'],
    },
    {
      heading: 'Təhlükəsizlik haqqında',
      paragraphs: ['AZƏRBAYCAN RESOLUTION PROCEEDING RESOLUTION PROCEEDINGSİYASİYA MƏHƏLƏLƏR VƏ KƏBƏLƏLƏRİNİN ƏLƏRİNİN TƏHLÜKƏLƏLƏRİNİN TƏHLÜKƏLƏLƏR VƏ ƏMƏLƏR, TƏDƏDƏLƏR, ƏMƏDƏLƏLƏLƏLƏR, ƏMƏLƏLƏR, ƏMƏLƏLƏLƏRLİYYƏR.'],
    },
    {
      heading: 'Hüquq',
      paragraphs: ['Bu Şərhlər, Avstraliyanın qanunları tərəfindən idarə olunur, qanunlar məhsullarının münasibəsi olmadan. Victoria, Avstraliyada yerləşən korporasiyaların xüsusi məlumatlarına razıdır.'],
    },
    {
      heading: 'İnformasiya',
      paragraphs: ['Biz dəyişdirə bilər, axtarış və ya sayt olmadan hər hansı bir hissə (yaxşı bir hissəsi) site dəyişdirir.', 'Biz hər zaman bu Terms yeniləyə bilər. "Son yeniləndirilmiş" tarixi onlar ən son zamanlardan silindi zaman göstərir. dəyişikliklər qəbul olduqdan sonra istifadə olunur.'],
    },
    {
      heading: 'Ağırlıq',
      paragraphs: ['Bu Şərhlərin hər hansı bir təhlükəsiz və ya qeyd olunmuşdursa, təhlükəsizlik maksimum dəyişiklikə davam edəcəkdir və qeyd olunan məhsullar tam güc və effektdə olacaq.'],
    },
    {
      heading: 'Axtarış',
      paragraphs: ['Bu şəxslərin hər bir sağ və ya təhlükəsizliyini qəbul etməyə qoşulmaq, bu doğru və ya təhlükəsizliyinin bir waiver deyil.'],
    },
    {
      heading: 'Entira müqaviləsi',
      paragraphs: ['Bizim Gizlilik Siyasəti ilə birlikdə, saytınızın istifadəsi və heç bir əvvvəl müəyyən mübadilələrində sizin və ANQR arasında bütün əməkdaşlıq yaradır.'],
    },
    {
      heading: 'Qalereya',
      paragraphs: ['Biz səhifə, sənaye, həyahət, səyahət, sənaye və ya internet / sənaye qurğuları daxil olmaqla, sənaye səyahətimizdəki hallarda ifadə etməyə qəbul olunacaq.'],
    },
    {
      heading: 'Bakı',
      paragraphs: ['Bu haqqında  Terms: email@anqr.link'],
    },
  ],
};

export default terms;
