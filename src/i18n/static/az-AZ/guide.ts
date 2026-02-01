import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const guide: PageDefinition = {
  title: 'Yadda saxla',
  description: 'QR kodları yaratmaq üçün ANQR istifadəçisi.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'İstehsalçı', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Elanlar', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR nümunələrini baxın', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Başlamaq',
      paragraphs: ['ANQR bir müştəri-ilk yanaşma ilə QR kodu generatorudur. default, QR kodları sizin browser yerli istehsal edir - heç bir heç bir hesab lazımdır və data xüsusi olar. Professional əlavə üçün, server-side API istifadə edə bilərsiniz.', 'Interfeys üç interfeys səviyyəsi var: Basic, Advanced və Professional. səviyyətinizi başlığında istifadə etmək. Hər hansı bir səviyyə lazım olan həyata əlavə xüsusiyyətləri açar.'],
      bullets: ['Əsas: düz məhsul / URL content və image overlay ilə Simple QR kodu yaradılması.', 'Advanced: QR encoding variantları, render üsulları, axtarış, çıxış formatları, geniş content növləri və overlay özelleştirme.', 'Professional: Sumarks, metadata, paylaşma, təhlükəsizlik analizi, ödəniş QR kodları və mühüm xüsusiyyətləri.'],
      links: [{ href: '/?lang=${lang}', label: 'İstehsalçı', type: 'generator' }],
    },
    {
      heading: 'Quick Start',
      paragraphs: ['İlk QR kodunu yaratmaq üçün:'],
      bullets: ['1. Qeyd nömrəsini seçin (URL, məhsul, WiFi, və s.).', '2. Versiya sahəsində məlumatlarınızı daxil edin.', '3. Seçilmiş rəngləri, üslubları, və overlay image əlavə edin.', '4. PNG, GIF, WebP və ya SVG kimi QR kodunu yükləmək üçün İdman basın.'],
      links: [{ href: '/?lang=${lang}', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Xüsusiyyətləri',
      paragraphs: ['Əsas səviyyəsi ödəniş yükü content və image overlays ilə QR kodları yaratmaq üçün alüminium interfeys edir. Bu başlamaq üçün sadə yoldur.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Xüsusiyyətlər (Basic)',
      paragraphs: ['Düz Text: QR kodu gücü limiti ilə hər bir məhsul. Pulsuz mesajlar, kodlar və ya simvollar üçün ideal.', 'URL: Encode web ünvanları. QR kodu taran zaman URL açıqdır. E-poçt ünvanı.'],
    },
    {
      heading: 'Image Overlay (Basic)',
      paragraphs: ['QR kodu ilə qarşılaşdırmaq üçün image (JPG, PNG, GIF, WebP) istifadə edin. Basic overlay xüsusiyyətləri daxildir:'],
      bullets: ['Fayldan istifadə edin: Cihazınızdan bir görüntü seçin.', 'URL-dən yükləyin: bir image URL daxil edin (MSN\'a imkan verir).', 'Mərkəzi Logo: Mərkəzinin yerlər image, məsləhətinə qəbul.', 'Blend: QR model ilə image Simple alfa mixing.', 'Intensity: Overlay QR kodunu necə güclü edir (0-100%).', 'Yadda saxla.', 'Finder Patterns: Daxili tarama üçün sütun nümunələrini qeyd edin.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'E-poçt ünvanı',
      paragraphs: ['Advanced səviyyəsi QR encoding variantları açar, render üslubları, animasiya, çıxış formatları, geniş content nömrələri və inkişaf.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'QR Encoding Ayarlar',
      paragraphs: ['Version: QR kodları daha çox data saxlamaq daha yüksək verən daha yüksək versiyaları ilə 1-40 versiyalarında gəlir. E-poçt ünvanı.', 'Yadda saxla Kalan taramanable vasitəsində bir QR kodu neçə sənaye qarşısını yükləyin.'],
      bullets: ['L (Dən aşağı): 7% hata düzeltme - ən yaxşı ölçüsü, en azı qırmızı.', 'M (Medium): 15% qeyd düzeltme - qarşı seçim.', 'Q (Quartile): 25% hata düzeltme - çap kodları üçün yaxşı.', 'H (High): 30% hata düzeltme - overlays və ya ağır şərtlər ilə kodlar üçün yaxşı.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Daxili Zone (Margin)',
      paragraphs: ['Sənaye zəng qrupu QR kodu daxildir. Scanners kodun başladığı yeri algılamaq üçün bu marj lazımdır. Standart ən azı 4 modul tələb edir. Aşağıdakı azaldılması 4 tarama problemləri əlavə edə bilər.'],
    },
    {
      heading: 'Modul',
      paragraphs: ['Modullar bir QR kodu edən müxtəlif kvadratlardır. ANQR beş stil təklif edir:'],
      bullets: ['Square: Klassik QR görünüşü ilə.', 'Ümumi: Bir dostlu baxmaq üçün güclü köşelər.', 'Dots: Müasir estetik üçün çap modulları.', 'Diamond: müxtəlif model üçün 45° düzlənmiş meydanlar.', 'Axtarış: Domen adı qeydiyyatdan keçdiyiniz zaman modulları birləşdirir.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Finder Pattern Style',
      paragraphs: ['Finder nümunələri, browsers qazanmaq üçün köçürməyə kömək edir QR köşelər üç böyük meydanlar var. Mövcud üsullar:'],
      bullets: ['Square: Standart klublar.', 'Ümumi: Yuxarıqlı sütunlar uyğun modul stil.', 'Circle: Dot-style kodları üçün əsas bulucu nümunələr.'],
    },
    {
      heading: 'Kompüter və Timing Patterns',
      paragraphs: ['İnformasiya nümunələri daha böyük QR kodlarında görünür (vers 2 +) düzgün müdafiə kömək edir. Timing klassikləri tapma nümunələri bağlayan alternating linelardır.'],
      bullets: ['Match Finder, Square, Rounded, və ya Circle.', 'Timing Style: Match Modul, Solid və ya Dashed.'],
    },
    {
      heading: 'Color',
      paragraphs: ['Foreground: QR modullarının rəsmi. Black (#000000) standart lakin hər hansı bir rəng rəng işləridir.', 'Background: fon rəsmi. White (#ffffffffffffff) standartdır. Foreground ilə dəyişik kontrasta baxın.', 'İctimai: rəsmi dəyişdirilməsi üçün fondan istifadə edin. Sənayenin səviyyətli kontrast təmin edir.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Modul ölçüsü və açıq',
      paragraphs: ['Modul ölçüsü: hər bir modul pikseldə necə böyük təqdim edir. Böyük məlumatlar daha böyük, daha asan kodlar yaradır.', 'Modul Gap: Modullar arasında bir faiz kimi yerləşdirin. Kiçik boşluqlar (5-15%) bir şəkildə taramalıq inkişaf edə bilər, lakin aşırı boşluqlar etibarlılığı azaldır.'],
    },
    {
      heading: 'Output',
      paragraphs: ['Format: istifadə edilən ixrac format seçin.'],
      bullets: ['PNG: Çıxışsız raster format, ən istifadə üçün ideal. Çap və digital üçün ən yaxşı.', 'WebP: Kiçik fayl ölçüləri ilə müasir format. Web istifadə üçün yaxşı.', 'GIF: Xüsusi QR kodları üçün lazımdır. Qeydiyyatdan keçirilir.', 'SVG: Vektor formatı sonsuzdur. böyük çap üçün ya da kod redaktə etmək lazımdır.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' },
      ],
    },
    {
      heading: 'Çıxış ölçüləri',
      paragraphs: ['Eni/Height: pikseldə çıxış ölçüsü çıxarın. çap üçün, DPI (e.g., 300 DPI 1 düym = 300px). Geniş ölçülər uzaqdan daha etibarlı tarayır.'],
    },
    {
      heading: 'Xidmət moduluqları (Advanced)',
      paragraphs: ['Yadda saxla'],
      bullets: ['Speed: Xüsusi xüsusiyyəti.', 'Loop: Daxili və ya single-play anima.', 'Bounce: Ping-pong axtarışı.', 'Start Frame: Xüsusi çərçivəsindən axtarış başlayın.', 'Max Frames: Müxtəlif haqqında ümumi qazanmaq.', 'Frame Step: Daha sürətli anima üçün çərçivələr.', 'İnterpolation: Heç bir, Crossfade, və ya qanunlar arasında Morph.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' },
      ],
    },
    {
      heading: 'İnformasiya nömrələri (Advanced)',
      paragraphs: ['E-poçt ünvanı:'],
      bullets: [
        'Telefon nömrəsi (tel:): Çağrılı telefon bağlantısı yaradır.',
        'E-poçt: E-poçt ünvanı.',
        'SMS: Telefon nömrəsini doldurmuş məhsul mesajı.',
        'vCard: Adı, təşkilatı, telefon, e-poçt, ünvanı ilə tam kontakt kartı.',
        'MeCard: Yaponiyada populyar əlaqə formatı.',
        'BizCard: Legacy biznes kartı format.',
        'Geo Location: Kartlarda açıq GPS koordinatları.',
        'WiFi: Avtomatik əməliyyat (SSID, şəkil, təhlükəsizlik nömrəsi).',
        'Calendar Event: ad, yer, tarix / vaxt ilə iCalendar format.',
        'Event RSVP: Komponentin qeydiyyatı səhifəsini dəstəkləyin.',
        'Sertifikatlaşdırma: ICS/WebCal feed üçün abone olun.',
        'File/Document URL: downloadable faylları doğrudan link.',
        'Yadda saxla.',
        'Sosial Profil: LinkedIn, Twitter, Instagram və s.',
        'Mes: WhatsApp, Telegram, Signal  deep.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Advanced Overlay Features',
      paragraphs: ['Ek overlay imkanları:'],
      bullets: ['Ekspert: Sizin image bir meydan rayon seçin.', 'Halftone: image parlaqlıq əsaslanan Classic print-style dot model.', 'Dithered: ətraflı reaksiya üçün Error-diffusion dithering.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Overlay Mix Modus (Advanced)',
      paragraphs: ['Advanced səvətin əlavə konfransı:'],
      bullets: ['Subpik: Daha yüksək ətraflı üçün subpiksiyalara hər bir modul bölünür.', 'Mavi səhifə: Artifact-free modellər üçün mavi səs dithering istifadə edin.', 'Mozaik: Tile-based effektiv strukturu saxlamaq.', 'Tarix: Modullar arasında boşluqları image.', 'Sifariş: image parlaqlıqdan əsaslanan Varies modul ölçüsü.', 'Duotone: Xüsusi kontrast üçün iki rəng.'],
    },
    {
      heading: 'Overlay Intensity',
      paragraphs: ['Overlay necə güclü olaraq QR kodu (0-100% edir). Daha çox image məlumat göstərir, lakin taramanability azaldır. 70%-dən başlayır və test əsaslanır.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' }],
    },
    {
      heading: 'Yadda saxla',
      paragraphs: ['Overlay image necə işləyir:'],
      bullets: ['Tam rəng: orijinal image rəsmi saxlayın.', 'Grayscale: qara və ağ tonları çevirmək.', 'Black & White: Yüksək kontrast ikili dönüşüm.'],
    },
    {
      heading: 'Finder Patterns tapmaq',
      paragraphs: ['Əməliyyatdan keçdiyiniz zaman, overlay tərəfindən dəstəkləndirilmən üç köşe tapma nümunələrini saxlayır. etibarlı tarama üçün güclü tavsiye.'],
    },
    {
      heading: 'Fotoqrafiya',
      paragraphs: ['Kompüterinizi qarşılaşdırmadan əvvəl əlavə etmək. Bu dəyişikliklər son QR kodunda görünür necə artıra bilər.'],
      bullets: ['Sifariş (-100 +100): İşıqlıq və ya da image qarşılaşdırmaq.', 'Contrast (-100 +100): Artan və ya aşağı tonal sıra azaldır.', 'Gamma (0.2 - 3.0): Non-linear parlaq məlumatlaşdırma. 1 səhifə ortatonlar aşağıdakı qiymətlər, 1 da onları qarşılamaq.', 'Saturation (-100 +100): Rəsmi fəaliyyət. -100 griscale, +100 doyğundur.', 'Hüe Rotate (0-360°): Bütün rəngləri rəsmi dəyişdirin.', 'Blur (0-20px): Soften image məlumatları.', 'Sharpen (0-100%): Uşaq kağızı və məlumatları.', 'Posterize (0-16 səviyyəsi): Bir poster təsiri üçün rəng səviyyələri azaldır.', 'Threshold (0-255): cutoff point ikili qara / ağ çevir.', 'Edge Detection: Sobel və ya Canny alqoriyaları yalnız qarşıları göstərmək üçün.', 'Invert: bütün rənglər.'],
    },
    {
      heading: 'Qeydiyyat',
      paragraphs: ['Overlay image QR kodu sahə uyğundur:'],
      bullets: ['Cover: Image bütün sahəsi doldurur, lazımsa ekstr.', 'Conta: Entire image görünür, marjları ola bilər.', 'Stretch: Image distorts tam doldurmaq.'],
    },
    {
      heading: 'Seçimləri',
      paragraphs: ['Rotation: 90° artıqlarında Rotate overlay.', 'Flip X/Y: Rəsmi düz və ya səvəl.'],
    },
    {
      heading: 'Alqoritma',
      paragraphs: ['Dithering QR kodları rəng edə bilər ki, nümunələrin davamlı-ton görüntüləri çevirir. Dithered, Blue Noise və ya True Dither mix modu istifadə zaman mövcuddur.'],
      bullets: [
        'Yadda saxla qonşulu piksel qeyd edilməsi.',
        'Xidmət (Bayer): Daxili nümunlər üçün bir eşik matrix istifadə edin.',
        'Seted Dot: Yarımton çap.',
        'Void & Cluster: Redaktor xidmət.',
        'Blue Noise: Visually xüsusi görünüşlü model.',
        'Mavi səhifə Kateqoriya: mavi sənaye doku ilə arxa.',
        'White Noise: Random eşik dithering.',
        'Kateqoriyalar Səs: müxtəlif paylamalar ilə səs.',
        'Blue Noise + Hata Diffusion: Hibrid həm texnologiyaları birləşdirir.',
        'Screened Blue Noise: Ekran kimi mavi səs model.',
        'Perceptual: daha yaxşı qiymət üçün Luminance-weighted.',
        'Edge-Aware: dithering zamanı image kənarları saxlayın.',
        'Adaptive Threshold: Locally-adaptive eşiklik.',
        'Temporal Blue Noise: Müxtəlif GIFs üçün, qanun başına model dəyişdirir.',
      ],
    },
    {
      heading: 'Diffusion',
      paragraphs: ['Hata Diffusion dithering istifadə edilən zaman, hansı qeyd edilir:'],
      bullets: ['Floyd-Steinberg: Classic 4-neighbor diffusion. Yadda saxla.', 'Jarvis-Judice-Ninke: 12nighbor, düzgün, lakin yavaş.', 'Stucki: müxtəlif səs ilə JJN.', 'Burkes: Simplified JJN, daha sürətli.', 'Sierra: İnkişaf keyfiyyətli və sürətli.', 'Atkinson: İşıq diffusion, ətraflı saxlamaq, lakin ümumi ola bilər.'],
    },
    {
      heading: 'Dither Strength',
      paragraphs: ['Neçə dithering tətbiq edilmişdir (0-100%). Aşağı qiymətlər orijinal model daha çox saxlamaq, daha yüksək qiymətləri daha çox image dəyişdirir.'],
    },
    {
      heading: 'Subpik Ayarlar',
      paragraphs: ['Subpik mix rejimi istifadə zaman:'],
      bullets: ['Grid Ölçüsü: 2 ×2, 3 ×3, və ya 4 ×4 modulları Yüksək = daha ətraflı.', 'Mərkəzi Siyasəti: Strict strategiyası üçün mərkəzi subpiklik edir. Halftone Center varyasyona imkan verir.', 'Neutral Color: Undetermined subpik üçün istifadə edilmiş rəsmi.', 'Oxunub: Necə axtarış nümunələri verilir (Solid və ya Stylized).'],
    },
    {
      heading: 'Yarımton Ayarlar',
      paragraphs: ['Yarımtone mix rejimi istifadə etdiyi zaman:'],
      bullets: ['Cell Size: Modul və ya N ×N grid.', 'Dot Shape: Circle, Square, və ya Line.', 'Qeydiyyat: Linear, S-Curve, və ya Gamma.'],
    },
    {
      heading: 'Duotone Colors',
      paragraphs: ['Duotone mix rejimi istifadə zaman, Shadow rəng (dark sahələr) və Highlight rəng (bright sahəsi).'],
    },
    {
      heading: 'Yadda saxla',
      paragraphs: ['Axtarış GIF overlays istifadə zaman:'],
      bullets: ['Frame gecikmələri istifadə edin: Əsas GIF zamanlaması.', 'Maks FPS: Limit çərçivəsi (1-60 fps).', 'İctimai məlumat: Müqavimət və ya Simplify məlumat metodları.'],
    },
    {
      heading: 'Advanced Rendering Options',
      paragraphs: ['Additional:'],
      bullets: ['Gap Modu: Heç bir, Inset, İnseksiya, və ya pis Space boşluğu stil.', 'Daxili Radius: Modullar üçün yuvarlanmış sütunlar.', 'Gradient: Heç bir, Linear, Radial, və ya modul gradient.', 'Göz Xarici / Inner Style: tapma model hissələri üçün bağımsız stil.', 'Dot Rotation: Rotate Diamond/dot modulları.', 'Göz Scale: Finder klassikləri üçün ölçüsü.', 'Frame Style: Konfranslar (Rounded Frame, Etiket, Etiket).', 'Frame Text: "Scan Me" kimi məhsulları daxil edin.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'E-poçt ünvanı',
      paragraphs: ['Fine-tune QR encoding:'],
      bullets: ['Encoding Mode: Auto, Numeric, Alphanumeric, Byte/UTF-8, və ya Kanji.', 'Enforce Min Sessiz Zone: ən azı 4 modul marjını təmin edin.', 'Mask Pattern: Avtomobil (optimal), və ya eləcə klassik nümunələri 0-7 modul paylamaq üçün. Müxtəlif nümunələr eyni məlumatları yaradır.', 'Oyuncaq: ISO-8859-1 (Latin-1 default), UTF-8 ( emoji da tam Unicode), və ya Shift-JIS (Japon).  content s . . . .'],
    },
    {
      heading: 'E-poçt ünvanı',
      paragraphs: ['Ek valyuta ayarları:'],
      bullets: ['Filename: downloads üçün xüsusi fayl.', 'GIF  Palet: GIF çıxış 2-256 rəng.', 'GIF Quantizer: Median Cut, NeuQuant, və ya Octree rəng azaldılması.', 'GIF Dithering: Off, Floyd-Steinberg, və ya sifariş.', 'GIF Çap: Bir rəsmi rəsmi olacaq.', 'Böyük True Vector: Daxil edilmiş raster əlavə yolları istifadə edin.', 'Böyük Çap Precision: Pixel və ya Precise yol render.', 'Böyük Embed Raster Overlay: gömülmüş image kimi overlay daxildir.', 'Background Override: çıxışda xüsusi fon rəng.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Daxil olmaq',
      paragraphs: ['Giriş emal ayarları:'],
      bullets: ['Qeydiyyatdan əvvəl məlumat.', 'Dəniz Whitespace: Baş aparıcı / otaqlı yerlər.', 'Yeniliklərin normallaşdırılması: LF bütün line sons.', 'Maks Uzunluğu Guard: Əgər dəyişiklik qaldırırsa Warn.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Professional Xüsusiyyətləri',
      paragraphs: ['Professional səviyyəsi sumarks, metadata, paylaşma variantları, təhlükəsizlik analizi, ödəniş QR kodları və mühüm xüsusiyyətləri əlavə edir.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Sual',
      paragraphs: ['QR kodları sumarks əlavə edin:'],
      bullets: ['Tarix: Text, Image və ya Pattern sumark.', 'Position: Center, Corners, Edges, Behind, or Quiet Zone.', 'Opacity: Sumark şəhərlik (0-100%).', 'Blend: Normal, Multiply, Screen və ya Overlay mixing.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
      ],
    },
    {
      heading: 'Elan',
      paragraphs: ['Copyright © 2019 Bütün hüquqlar qorunur'],
      bullets: ['Title, Author, Copyright, Lisenziya,  Description.', 'Yaradıcı vaxt: Embed istehsal vaxtları.', 'Xüsusi Key-Value: Kiçik metadata cütlərini daxil edin.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
      ],
    },
    {
      heading: 'Sharing',
      paragraphs: ['QR kodu konfiqurasiyalarınızı paylaşın:'],
      bullets: ['Yadda saxla.', 'Yadda saxla.', 'Encode Parametrlər: pay URL bütün ayarları daxil edin.', 'Qeyd: Yerli fayllardan Overlay images URL ilə paylaşa bilər.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' },
      ],
    },
    {
      heading: 'Təhlükəsizlik Analizi',
      paragraphs: ['QR kodları taranmış deyil:'],
      bullets: ['Təhlükəsizlik Modu: Off, Balanced, və ya Strict tarama tələbləri.', 'Min Modul Ölçü: modul başına minimum piksel ölçüsü.', 'Qida Zone: Minimum marj modulları.', 'Lock Finders/Timing/Align/Format/Version: Xüsusi elementlər qorunması.', 'ECC tərəfindən Max Overlay Intensity: hata düzeltme səviyyəsinə əsaslanan avtomatik inteqrasiya limitləri.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' },
      ],
    },
    {
      heading: 'İnformasiya növləri (Professional)',
      paragraphs: ['Professional səviyyəsi ödəniş və təhlükəsizlik nömrələrini dəstəkləyir:'],
      bullets: ['EPC/SEPA (AB): Avropa bank transferi IBAN, BIC, məlumat, referans ilə QR kodları.', 'UPI (Hindistan): VPA ilə birləşmiş ödənişləri, ödəniş adı, dəyişiklik.', 'PayNow (Singapore): UEN və ya mobil nömrə ilə Singapore sürətli ödəniş.', 'PromptPay (Thailand): Tayland milli ödəniş sistemi.', 'PIX (Brazil): Braziliya PIX əsas ilə anında ödəniş.', 'Crypto: Bitcoin, Ethereum, Litecoin ödəniş xidmət ünvanları.', 'Marketinq Kampaniyası Link: Tam UTM parametr (Marketing Tags) izləyir.', 'Tarix: Dinamik / trackable QR kodları üçün URL shorteners ilə istifadə edin.', 'GS1 Digital Link: GTIN, seriyası, toplu, expiry ilə texnologiya.', 'App Deep Link: iOS / Android app xüsusi kompüterlər ilə dəri bağlantılar.', 'Xüsusi Format: No formatting və ya validation ilə Raw data.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Advanced Modenda Dil-Relevant Payments',
      paragraphs: ['Advanced rejimi istifadə etdiyiniz zaman, ANQR avtomatik olaraq seçilmiş dilinizə dair ödəniş metodlarını göstərir. Mövcudlar VietQR, Thai istifadəçiləri PromptPay görür və Hindistan dil istifadəçiləri UPI və BharatQR görür. Global ödəniş metodları (cryptocurrency, PayPal, Cash App) bütün dillər üçün mövcuddur. Professional rejimi dildən asılı olaraq bütün ödəniş standartlarını açar.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Avropa Ödəniş Standartları',
      bullets: ['EPC/SEPA (AB): Avropa bank transfer QR kodları EPC QR kodu standart sonra. E-poçt ünvanı AB ölkələri artı İsveçrə, Norveç, İslandiya, Lichtenstein, Monako və San Marino daxil olmaqla SEPA zonası arasında istifadə olunur.', 'İsveçrə QR-bill: İsveçrə ödəniş standartı SIX Tədqiqatları aşağıdakıdır. E-poçt ünvanı 2022-ci ildən etibarən İsveçrə faturaları üçün lazımdır.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Hindistan Ödəniş Standartları',
      bullets: ['UPI (Hindistan): NPCI Deep Linking spesifikasiyası aşağıdakı birləşmiş ödənişləri.  Support VPA (Virtual Payment Address), ödəniş adı, INR məbləği, məbləhət notu, məlumat ID, tacir kataloq kodu və əməliyyat rejimi.', 'BharatQR (Hindistan): Birləşmiş QR standart UPI və kart-based ödənişləri dəstəkləyir. Maksimum uyğunluğu üçün kart PAN ilə UPI VPA birləşdirin. Ticarət adı, şəhər, MCC, GST məlumatları, və qazanma sayı daxildir.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Böyük Britaniya İnformasiya Standartları',
      bullets: ['PayNow (Singapore): EMVCo QR spesifikasiyasını SGQR profili ilə istifadə edən Singapore fast ödəniş sistemi. UEN (işə qeydiyyat), mobil nömrə, və ya proxy simptomlar kimi NRIC. dəyişiklik bayrağı və sürətli tarixi daxildir.', 'PromptPay (Thailand): Tayland EMV profilində Tayland milli ödəniş sistemi. Yadda saxla.', 'QRIS (Indonesia): Quick Response Code Indonesian Standard. E-poçt ünvanı.', 'DuitNow (Malaysia): Malaysian ani ödəniş sistemi. NRIC, mobil, pasport, ordu ID və biznes qeydiyyat sayı daxil olmaqla bir çox proxy nömrəsi.', 'VietQR (Vietnam): Vietnam interbank transfer standart. Bank BIN (NAPAS nəzarət) və hesab nömrəsi. müxtəlif transfer növləri üçün çox xidmət kodu (QRPUSH, QRIBFTTA, QRIBFTTC).', 'QR Ph (Philippines): Filipin QR ödəniş standartı InstaPay və PESONet üçün. P2M (kişi-to-merchant) əməliyyatları üçün tarix sayı istifadə edin.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'East Asiya Ödəniş Standartları',
      bullets: ['TWQR (Taiwan): Tayvanlı QR ödəniş standart. Ticarət ID, vergi ID və TWD dəstək.', 'Qalereya (Hong Kong): Hong Kong Faster Payment System QR kodları. Yadda saxla  HKD  HKD  HKD.', 'JPQR (İspaniya): Birləşmiş QR kodu ödəniş standart. Əməliyyat üçün mağaza ID istifadə edin JPY dəyişiklikləri ilə.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Digər Regional Ödəniş Standartları',
      bullets: ['PIX (Brazil): Braziliya Mərkəzi Bankı BR Kodu spesifikasiyası aşağıdakı anında ödəniş sistemi. PIX tuşlar (CPF, CNPJ, e-poçt, telefon, və ya random key), tarix adı/city, əməliyyat ID, və 304 s.', 'AusPayNet/NPP Qeydiyyat (Australiya): Avstraliya Yeni ödənişlər Platform PayID sistemi. Ödəniş edir ID növü (email, mobil, ABN, təhlükəsizlik ID) və ya xüsusi BSB + hesab nömrəsi. İctimai adı NPP baxışdan qeydiyyatdan keçmiş adı görür.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'E-poçt ünvanı',
      bullets: ['Bitcoin/Litecoin (BIP-21): Maşın ünvanı ilə standart kriptovalyuta ödəniş URIs, isteğe bağlı miqdar və etiket. bütün böyük Bitcoin və Litecoin cüzdanları ilə uyğun.', 'Yıldırım Ağ (BOLT11):  Lightning . . . Minimum qiymət ilə ani Bitcoin ödənişləri üçün bir BOLT11 kodlanmış məsləhət əlavə.', 'Ethereum (EIP-681): Ethereum əməliyyat tərəfindən yerli ETH transferləri və ERC-20 token transferləri dəstəkləyir. Multi-network dəstək üçün blockchain ID daxildir (Mainnet, Polygon, BSC, Arbitrum, Optimizm, Avalanche), qaz parametrləri və konsepsiyasiya funksiyaları.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Domen adı qeydiyyatdan keçirt',
      bullets: ['PayPal.Me: istifadəçi adı ilə PayPal ödəniş bağlantıları və isteğe bağlı məlumat. Recipients PayPal balans, kartları və ya bank hesabı ilə ödə bilər.', 'Cash App: Cash Domen adı qeydiyyatdan istifadə edir. Amerika Birləşmiş Ştatları üçün populyar.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Genric EMV QR',
      bullets: ['Oxunub Genric: Xüsusi EMV Merchant-Presented Mode yaradır Ödəniş planları üçün QR kodları xüsusi qeyd deyil. İdman adı, şəhər, ölkə kodu (ISO 3166-1), valyuta kodu (ISO 4217 numeric), MCC, tip/konvenience məlumat variantları və əlavə data sahəsi. Test və ya xüsusi inteqrasiyalar üçün faydalı.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Mix Modes (Professional)',
      paragraphs: ['Professional səviyyətlərin əlavə edilməsi:'],
      bullets: ['Pixelate: Pixelated overlay effekt.', 'Outline: Yalnız kontur gösteren Edge aşkar overlay.', 'Wave: Wavy təsiri.', 'Subpik ölçüsü: image əsaslanan subpik sümük ölçüsü.', 'True Dither: Sifariş olunan matrix seçimi ilə Advanced dithering.', 'Extreme: Maksimum image görünürlük, taramanability edə bilər.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Qeydiyyat',
      paragraphs: ['QR elementlərinin overlay dəyişdirilməsindən qarşılaşdırılmış nəzarət:'],
      bullets: ['Kateqoriya: Daxil ol.', 'Qeydiyyatdan keçmək.', 'Qeydiyyat  Info: Shield format informasiya modulları.', 'Proqram  Info: Shield versiya modulları.'],
    },
    {
      heading: 'ECC-Aware Mode',
      paragraphs: ['Smartly hata düzeltme gücü tərəfindən overlay sənaye dağıtmaq. Testinability qarşısında modulları dəyişdirilməsi sistemi analiz edir.'],
      bullets: ['Risk səyahəti: (0-100%) istifadə etmək üçün səyahətin sabitliyinin artırılması.', 'Yadda saxla • Şifrəni unutmusunuz.', 'Aşağı qiymət = daha güvenli tarama lakin daha az görünür overlay.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Professional Rendering Options',
      paragraphs: ['Qeyd proqramları:'],
      bullets: ['Pulsuz Edges: Flash modulları üçün pixelated image render istifadə edin.', 'Pixel Snap: Floor, Round, və ya Ceil piksel uyğunluğu.', 'Per-Module Color Mode: Solid, Təhlükəsizlik tərəfindən, Mövcud, Overlay tərəfindən, Komitə.', 'Color: Per-module rəng üçün xüsusi rəsmi paleti.', 'Contrast Guard: Renklər arasında minimum kontrast nisbəti təmin edin.', 'Min Contrast Oranı: WCAG-style kontrast tərəfindən (1:1 - 21:1).', 'Digər Limit Modullar: Dövlət bölgəsindən əlavə məsləhət.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Professional Çıxış Seçimləri',
      paragraphs: ['Enterprise ixrac ayarları:'],
      bullets: ['DPI: Set print qəbul (72-600 DPI). 300 DPI çap üçün tələb.', 'Silent Zone daxil edin: çıxış ölçülərində sakit zone.', 'Ekspert kimi: Genrate PDF birincil formatda.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'Axtarış ayarları (Professional)',
      paragraphs: ['Ek professional aviasiya xüsusiyyətləri:'],
      bullets: ['Temporal Dither: Off, Blue Noise, və ya Flicker sifariş per-frame dithering.', 'Pattern: Heç bir, Pulse, Wave, Scanline, Shimmer, və ya Drift effektləri.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Axtar Ad Soyad',
      paragraphs: ['ANQR, URL parametrləri ilə QR kodları yaratmaq üçün server-side API verir. Bu, müştəri-side JavaScript olmadan web site, e-poçt, səhifə və ya avtomatlaşdırılmış işləri yerləşdirilməsi üçün idealdır.', 'Base: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'QR nümunələrini baxın', type: 'example' }],
    },
    {
      heading: 'Əsas parametrlər',
      paragraphs: ['Xidmət və ümumi parametrlər (paramet adları çevirilməz):'],
      bullets: ['data (required): QR kodu kod kod kod kod kod kod kod kod kodlaşdırmaq. URL-encode xüsusi simvol.', 'ölçüsü: piksellərin Image ölçüsü (default: 400, maks: 2000). w/h xüsusi deyil.', 'w, h: pikseldə dəyişiklik və hündürlük. Overrides ölçüsü parametr.', 'format: Çap formatı - png, webp, və ya gif (default: png).', 'ekspert: Hata düzeltme səviyyəsi - L, M, Q və ya H (default: H).', 'fg: # olmadan hex (default: 000000).', 'bg: # olmadan hex (default: ffffffffffffffffffff.).', 'şəffaf: şəffaf fon üçün 1 növü.', 'margin: Modullar (default: 4).'],
    },
    {
      heading: 'Styling Parametrlər',
      paragraphs: ['Modul və model dizaynı:'],
      bullets: ['stil: Modul üslubu - kvadrat, yuvarlanmış, dots, Diamond, bağlıdır.', 'axtarış: Finder model üslubu - kvadrat, yuvarlanmış, s.', 'uyğunlaşdırma model üslubu - Match_finder, kvadrat, yuvarlanmış, səhifə.', 'vaxt: Timing model stil - Match_module, böyük, dashed.', 'radius: Corner radius faiz 0-100.', 'açıq: Modul boşluğu faiz 0-50.', 'boşluq: Gap rejimi - heç bir şey, inset, vuruş, pis_space.', 'gözəl  Outer, gözInner: Göz üslubları - kvadrat, yuvarlanmış, s.', 'eye: Göz ölçüsü faizi (default: 100).', 'grad: Gradient növü - heç bir, lineer, radial, konic.', 'gradAngle.', 'gradStops: Gradient rəng1,pos1,color2,pos2, ... (e.g., ff0000,0,0000ff,1).'],
    },
    {
      heading: 'Overlay Parametrlər',
      paragraphs: ['Image overlay variantları (overlay image server-side almaq):'],
      bullets: ['im: URL to overlay image (must be public accessible).', 'mode: Overlay rejimi - mərkəzi, yarımton, mix, parlaq, mozaik, dithered, mavi-noise, subpik.', 'səhifə: Gənclik 0-100 (default: 100).', 'rəng Mode: Overlay rəng rejimi - rəng, bozscale, bw.', 'uyğun: Necə uyğundur - örtük, daxildir.', 'çürük: səviyyətlərin sürəti.', 'flipX, flipY: Çıxış çevirmək üçün 1 növü.', 'daxil ol Axtarış: tapşırıq formaları (default: 1).', 'daxil ol Timing, saxlamaqAlign: Vaxt / nümunələri saxlamaq üçün 1 növü.'],
    },
    {
      heading: 'Parametrlərin hazırlanması',
      paragraphs: ['Overlay üçün proqram məlumat:'],
      bullets: ['i̇şıq: Təhlükəsizlik - 100 100 (default: 0).', 'kontrast: Düzləşdirilməsi - 100 100 (default: 0).', 'gamma: Valyuta 0.1 üçün 3 (default: 1).', 'saturation: İşıqlandırma - 100 - 100 (default: 0).', 'hue: Hüe reytinq.', 'bulanık: piksel Blur.', 'sharpen: 0-100.', 'poster: Posterize s.', 'threshold: İkili qadın 0-255.', 'edge: Edge algılama - off, sobel, canny.', 'invert: 1 üçün invert rənglər.'],
    },
    {
      heading: 'Sumark Parametrləri',
      paragraphs: ['QR kodları yaratmaq üçün sumarks daxil edin:'],
      bullets: ['wmEn: sumarka imkan vermək üçün 1 növü.', 'w Tarix: Sumark növü - məhsul, image, model.', 'wmText: Sumark məhsul (URL-encoded).', 'wmImg: sumark image URL.', 'wmPos: məhsul - mərkəzi, arxalar, kəndlər, arxa, sakit_zone.', 'wmOpacity: Opacity 0-100 (default: 50).', 'wmBlend: Mix rejimi - normal, çarpar, ekran, overlay.'],
    },
    {
      heading: 'Oyuncaq parametrləri',
      paragraphs: ['Axtarış GIF çıxış (requires format=gif):'],
      bullets: ['an Pattern: Animation model - heç bir, dərman, dalğa, tarama, shimmer, dalğa, rəng_cycle.', 'an Frames: 1-60 sayı (default: 24).', 'an Sürət: milisans 101000 (default: 100).', 'an Seed: anima üçün Random fizi.', 'domen adı qeydiyyatdan keçirt ».'],
    },
    {
      heading: 'Çıxış parametrləri',
      paragraphs: ['Çap format variantları:'],
      bullets: ['keyfiyyət: WebP keyfiyyət 0-1 (default: 0.9).', 'webpQ: WebP keyfiyyət 0-100 (default: 90).', 'gifColors: GIF 2256 (default: 256).', 'dpi: PNG üçün çap DPI (default: 72).', 'metaTitle, metaAuthor, metaCopy, meta Desc: PNG metadata sahəsi.'],
    },
    // Crop Parameters
    {
      heading: 'Bitki Parametrləri',
      paragraphs: ['Overlay şəkil kəsmə seçimləri:'],
      bullets: ['cropEn: 0/1 örtük kəsilməsini aktivləşdirin (defolt: 0).', 'cropX: X kəsir mərkəzi 0-1 fraksiya kimi (defolt: 0.5).', 'cropY: Kəsmə mərkəzi Y fraksiya 0-1 (defolt: 0.5).', 'cropSize: Şəklin 0-1 hissəsi kimi kəsmə ölçüsü (defolt: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Təhlükəsizlik Kilidi Parametrləri',
      paragraphs: ['Hansı QR elementlərinin üst-üstə düşmə modifikasiyasından qorunduğuna nəzarət edin:'],
      bullets: ['lockF: Kilid tapıcı nümunələri 0/1 (defolt: 1).', 'lockT: Kilid vaxtı nümunələri 0/1 (defolt: 1).', 'lockA: Hizalanma nümunələrini kilidləyin 0/1 (defolt: 1).', 'lockFmt: Kilid formatı məlumatı 0/1 (defolt: 1).', 'lockV: Kilid versiyası məlumatı 0/1 (defolt: 1).', 'SafeMode: Təhlükəsizlik rejimi - söndürülmüş, balanslaşdırılmış, ciddi (standart: söndürülmüş).', 'safeMinPx: Minimum modul ölçüsü piksellə (defolt: 2).', 'safeMinQz: Minimum sakit zona modulları (defolt: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Parametrlərin avtomatik tənzimlənməsi',
      paragraphs: ['Avtomatik optimallaşdırma parametrləri:'],
      bullets: ['autoVer: QR versiyasını avtomatik seçin 0/1 (defolt: 1).', 'autoEcc: Avtomatik seçim ECC səviyyəsi 0/1 (defolt: 0) - yalnız server tərəfi göstərişi.', 'autoReduce: [YALNIZ MÜŞTƏRİDƏ] Skan edilə bilənə qədər intensivliyi avtomatik azaldın - skan doğrulama dövrəsini tələb edir.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Əlavə Animasiya Parametrləri',
      paragraphs: ['GIF çıxışı üçün genişləndirilmiş animasiya nəzarətləri:'],
      bullets: ['loop: Animasiya davamlı olaraq 0/1 dövrə edir (defolt: 1).', 'sıçrayış: Ping-pong animasiya istiqaməti 0/1 (defolt: 0).', 'tərs: Animasiyanı tərs 0/1 (defolt: 0) ilə səsləndirin.', 'colorCycle: Rəng dövriyyəsi effektini aktivləşdirin 0/1 (defolt: 0).', 'interp: Çərçivə interpolasiyası - heç biri, crossfade, morph (defolt: heç biri).', 'tempDither: Müvəqqəti dithering - söndürülür, mavi_səs, flicker_safe (defolt: söndürülür).', 'startF: Animasiya başlanğıc çərçivəsi (standart: 0).', 'maxF: Göstəriləcək maksimum çərçivələr (defolt: 0 = avtomatik).', 'stepF: Çərçivə addım intervalı (defolt: 1).', 'jitter: [YALNIZ MÜŞTƏRİDƏ] Piksellərdə modul titrəməsi - hər çərçivədə QR bərpası tələb olunur.'],
    },
    // Dithering Parameters
    {
      heading: 'Dithering Parametrləri',
      paragraphs: ['Overlay emal üçün dithering alqoritmlərinə nəzarət edin:'],
      bullets: ['ditherKind: Dither alqoritmi - error_diffusion, ordered_bayer, blue_noise və s (defolt: ordered_bayer).', 'diffusionKernel: Səhv diffuziya nüvəsi - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (defolt: floyd_steinberg).', 'ditherStrength: Dither intensivliyi 0-100 (defolt: 50).', 'serpentine: Serpentine dithering 0/1 (defolt: 0).', 'matris: Sıralı dither matrisi - bayer2, bayer4, bayer8 (defolt: bayer4).', 'bnTile: Mavi səs-küy kafel ölçüsü (defolt: 64).', 'bnSeed: Mavi səs-küylü təsadüfi toxum (defolt: 0).', 'colorDither: Rəng dəyişməsi - heç biri, hər_kanal, qavrayış (defolt: heç biri).'],
    },
    // Subpixel Parameters
    {
      heading: 'Subpiksel Parametrləri',
      paragraphs: ['Subpiksel qarışığı rejimi üçün parametrlər:'],
      bullets: ['spGrid: Subpiksel şəbəkə ölçüsü - 2x2, 3x3, 4x4 (defolt: 3x3).', 'spCenter: Mərkəz qaydası - ciddi, yarım ton_mərkəz (defolt: ciddi).', 'spNeutral: Neytral rəngli hex # olmadan (defolt: 808080).', 'spFinder: Finder ləğvi - möhkəm, stilize (defolt: bərk).'],
    },
    // Halftone Parameters
    {
      heading: 'Yarım ton parametrləri',
      paragraphs: ['Yarım ton qarışdırma rejimi üçün parametrlər:'],
      bullets: ['htCell: Yarım ton hüceyrə ölçüsü - per_module və ya nxn grid (defolt: per_module).', 'htDot: Nöqtə forması - dairə, kvadrat, xətt (standart: dairə).', 'htCurve: Parlaqlıq əyrisi - xətti, s-əyri, qamma (defolt: xətti).', 'duo1: # olmadan iki ton kölgə rəng altılıq (defolt: 000000).', 'duo2: # olmadan iki tonlu vurğu rəng altılıq (defolt: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-dən xəbərdar rejim parametrləri',
      paragraphs: ['Səhvlərin düzəltmə qabiliyyətinə əsaslanan ağıllı overlay paylanması:'],
      bullets: ['eccAware: ECC-dən xəbərdar rejimi 0/1 aktivləşdirin (defolt: 0).', 'eccRisk: Risk büdcəsi faizi 0-100 (defolt: 50).', 'eccMap: Çəki xəritəsi - finders_to_to_mesafe, block_heatmap, empirical_scan_heatmap (defolt: məsafə_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Çərçivə parametrləri',
      paragraphs: ['Dekorativ çərçivə parametrləri:'],
      bullets: ['çərçivə: Çərçivə tərzi - heç biri, yuvarlaqlaşdırılmış_çərçivə, etiket, etiket (defolt: heç biri).', 'frameText: Çərçivədə göstəriləcək mətn (URL kodlu).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Modul Başına Rəng Parametrləri',
      paragraphs: ['Fərdi modul rəngləmə seçimləri:'],
      bullets: ['modColor: Rəng rejimi - bərk, parlaqlığa görə, mövqeyə görə, üst-üstə düşməyə görə, klasterə görə (defolt: bərk).', 'cGuard: Kontrast qoruyucu 0/1 (defolt: 0).', 'minContrast: Minimum kontrast nisbəti 1-21 (defolt: 4.5).', 'palitrası: Palitra rejimi üçün vergüllə ayrılmış altıbucaqlı rənglər.', 'paletteMode: Palitra paylanması - mövqe, parlaqlıq, diaqonal, radial, təsadüfi, sıra, sütun (defolt: mövqe).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF Overlay Parametrləri',
      paragraphs: ['Animasiyalı GIF örtük şəkilləri üçün parametrlər:'],
      bullets: ['ovType: Overlay növü - statik, gif, apng, webp_anim, video (defolt: statik).', 'ovFramePick: Çərçivə seçimi - hamısı, hər_n, maksimum_kadrlar, müddət_limiti (defolt: hamısı).', 'gifDelays: Orijinal GIF çərçivə gecikmələrindən istifadə edin 0/1 (defolt: 1).', 'gifDispH: GIF xaric edilməsi - hörmət et, sadələşdir (defolt: hörmət).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Hər ECC İntensivlik Limitləri',
      paragraphs: ['Səhv düzəliş səviyyəsinə görə maksimum üst-üstə düşmə intensivliyi:'],
      bullets: ['maxIntL: ECC L 0-100 üçün maksimum intensivlik (defolt: 100).', 'maxIntM: ECC M 0-100 üçün maksimum intensivlik (defolt: 100).', 'maxIntQ: ECC Q 0-100 üçün maksimum intensivlik (defolt: 100).', 'maxIntH: ECC H 0-100 üçün maksimum intensivlik (defolt: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA Simulyasiya Parametrləri (Yalnız Müştəri üçün)',
      paragraphs: ['Bu parametrlər URL uyğunluğu üçün təhlil edilir, lakin yalnız brauzerdə işləyir:'],
      bullets: ['qaContrast: Kontrast yoxlamasını aktivləşdirin 0/1 - interaktiv yoxlama tələb olunur.', 'qaBlur: Bulanıqlığı piksellərdə simulyasiya edin - yalnız interaktiv test üçün.', 'qaNoise: Səs-küy səviyyəsini simulyasiya edin - yalnız interaktiv test üçün.', 'qaHeatmap: Oxunabilirlik istilik xəritəsini göstər 0/1 - kətan örtüyü UI tələb edir.'],
    },
    // Client-Only Parameters
    {
      heading: 'Yalnız Müştəri Parametrləri',
      paragraphs: ['Əksər API parametrləri server tərəfində tam dəstəklənir. [YALNIZ MÜŞTƏRİYƏ] ilə işarələnmiş parametrlər URL uyğunluğu üçün təhlil edilir, lakin brauzer funksiyalarını tələb edir:'],
      bullets: ['jitter: Modul titrəməsi təsadüfiliklə hər çərçivədə QR regenerasiyasını tələb edir.', 'autoReduce: Avtomatik azaltma intensivliyi iterativ skan testini tələb edir.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: QA simulyasiyası interaktiv kətan təsdiqini tələb edir.'],
    },
    // Additional Output Parameters
    {
      heading: 'Əlavə Çıxış Parametrləri',
      paragraphs: ['Genişləndirilmiş çıxış və ixrac parametrləri:'],
      bullets: ['fname: Yükləmələr üçün fərdi fayl adı (defolt: anqr-qrcode).', 'inclQz: Səssiz zonanı çıxış ölçülərinə 0/1 daxil edin (defolt: 1).', 'bgOver: Arxa fon rəngini # olmadan hex əvəz edir (bg parametrini ləğv edir).', 'fmtExtra: Əlavə format çıxışı - heç biri, eps, animated_webp (defolt: heç biri). Qeyd: eps [PARTIAL]dır.', 'svgPrec: SVG forma dəqiqliyi - piksel, dəqiq (defolt: piksel). [PARTIAL] SVG çıxışı məhdud server tərəfində.', 'svgEmbed: Raster örtüyünü SVG 0/1-də yerləşdirin (defolt: 1). [PARTIAL] SVG çıxışı məhdud server tərəfində.', 'modulePx: Modul piksel ölçüsü (defolt: ölçüdən avtomatik hesablanır).', 'sərhəd: Sakit zonadan kənarda əlavə sərhəd modulları (defolt: 0).', 'xırtıldayan: Xırtıldayan/pikselləşdirilmiş təsvirin 0/1 göstərilməsini aktivləşdirin (defolt: 1).', 'snap: Pixel snap rejimi - mərtəbə, dairəvi, tavan (defolt: mərtəbə).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Nümunə Qoruma Parametrləri',
      paragraphs: ['Hansı struktur elementlərin üst-üstə düşmədən qorunduğuna nəzarət edin:'],
      bullets: ['keepFinders: Tapıcı nümunələrini qoruyun 0/1 (defolt: 1).', 'keepTiming: Vaxt sxemlərini qoruyun 0/1 (defolt: 0).', 'keepAlign: Hizalanma nümunələrini qoruyun 0/1 (defolt: 0).', 'protectFmt: 0/1 format məlumat modullarını qoruyun (defolt: 0).', 'protectVer: Versiya məlumat modullarını qoruyun 0/1 (defolt: 0).'],
    },
    {
      heading: 'Qeydiyyat',
      paragraphs: ['Basic QR kodu:', 'https://anqr.link/api/qr?data=https://ör.com', 'Xüsusi rənglər ilə Styled QR kodu:', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffffffffffffffffffffffffff&style=rounded&radius=30', 'Overlay image ilə QR kodu:', 'https://anqr.link/api/qr?data=https://ör.com&ec=H&img=https://ör.com/logo.png&mode= yarımtone&intensity=70', 'Oyuncaq GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'QR nümunələrini baxın', type: 'example' }],
    },
    {
      heading: 'QR kodları',
      paragraphs: ['Professional rejimdə, Paylaş xüsusiyyəti HTML və URLs yaradılmışdır. Burada əvvəl işləyir:'],
      bullets: ['Yadda saxla Recipients QR kodunu baxa bilər və dəyişdirir.', 'Yadda saxla QR kodu server-side verilir və bir image kimi xidmət edilir.', 'Embed Markdown: Sertifikatlaşdırma və yeniləmə faktorları üçün Markdown image nümunikasiyası yaradır.', 'Yadda saxla proqramlar, scriptlər və ya digər inteqrasiyalarda istifadə üçün ham API URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
    {
      heading: 'E-poçt',
      paragraphs: ['Veb saytında QR kodu yerləşdirmək üçün:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Kodu" />', 'Təhlükəsizlik üçün:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Kodu" style="max- Genişlik: 100%; hüquq: auto;" />', 'Server uzun önbellek başlığı ilə cavablar, eyni URL üçün təkliflər sürətlidir.'],
    },
    {
      heading: 'URL Formatı',
      paragraphs: ['Siz Professional rejimində Paylaşmaq zaman, ANQR URL parametrlərinə cari ayarları kodlayır. format:', 'https://anqr.link/?data=...&ec=H&style=rounded&...', 'Bu parametrlər API parametrlərini göstərir, buna görə baz yolu dəyişən bir API URL çevirə bilərsiniz / to /api/qr və lazım olduğu kimi w/h parametrləri uyğun olaraq.', 'Qeyd: Yerli fayllardan yükləndirilmiş Overlay images URL ilə paylaşa bilər - yalnız URL-based overlays (img parametr) paylaşılan bağlantılar və API çağrıları iş.'],
    },
    {
      heading: 'Qeydiyyat və istifadə',
      paragraphs: ['API məhsulları istifadə etmək üçün pulsuzdur. Yüksək sürətli istifadə etmək üçün yüksək istehsalçılıq və ya kommersiya proqramları bizimlə əlaqə saxlayın.', 'API caching başlığı daxildir. Ən yaxşı performans üçün, sonunuzda önəl cavablar və ya eyni URL-dən eyni QR kodları üçün.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Best Practices',
      paragraphs: ['Etibarlı QR kodları üçün bu talimatları baxın:'],
      bullets: ['Hər zaman çapdan əvvəl çox browser apps ilə QR kodları test edin.', 'Overlays əlavə etdiyi hallarda Error Yeniləyir H (High).', 'Ən az 4 modulu sakitin modulları (margin).', 'Foreground və fon arasında yüksək kontrasta baxın.', 'Çap üçün, ən azı 300 DPI istifadə və real çap ölçüsü test.', 'Overlays istifadə edərkən Finder Patterns.', 'Aşağı overlay inteqrasiyası ilə başlayın və yavaş artır.', 'Açıq istifadə üçün, daha böyük modul ölçüləri və daha yüksək səviyyə düzeltmesini düşünün.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Elanlar', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'QR nümunələrini baxın', type: 'example' },
      ],
    },
    {
      heading: 'Qeydiyyat',
      paragraphs: ['Ümumi məhsullar və haqqında'],
      bullets: ['QR taramaq olmaz: Overlay inteqrasiyasını azaltmaq, hata düzeltmesini artırmaq, cavab kontrastını kontrol edin.', 'Kod çox böyük:  content uzunluğu, URL shortener istifadə, aşağı versiya.', 'Blurry çıxış: Modul ölçüsünü artırmaq, sıxılmış formatlarda PNG istifadə edin.', 'Colors yanlış görünür: rəsmi kontrasta baxın, bozscale overlay rejiminə çalışın.', 'GIF animating deyil: GIF format çıxış istifadə edin, çek qurma sayı.', 'Image Overlay yükləmir: Check CORS uzaq şəkillərində saxlayın.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Xüsusi şəkillər və nümunələr baxın', type: 'learn' }],
    },
    {
      heading: 'Pulsuz',
      paragraphs: ['ANQR standart simptomları dəstəkləyir. FX / Cmd +S ixtisaslaşdırmaq üçün istifadə edin (qoşulma qarşısında).'],
    },
    {
      heading: 'Yadda saxla',
      paragraphs: ['Professional rejimi, cari ayarları ilə URL kopyalamaq üçün Share düyməsini basın. Recipients tam konfiqurasiya görmək üçün bu URL açıqla bilər. Qeyd: Yerli fayllardan uzunluqlar URL ilə paylaşa bilər.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'ANQR generatorunda bu konfiqurasiyaya çalışın.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Elanlar', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR nümunələrini baxın', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'QR nümunələrini baxın', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'İstehsalçı', type: 'generator' },
  ],
};

export default guide;
