import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'E-poçt',
  description: 'QR kodlarının measurable dəyişiklik yaratmaq olduğunu göstərir ki, beş real-world, istehsal üslubu məhsulları məhsullaşdırmaq: miras ictimai tərəf kodu, markalı məhsulları və "scan-to" həyataları, uçuşçulardan billboards, digital imzalamaq üçün fəaliyyətli QR, və paylanabilir Anchor bağlantılar istifadə edən cross-lingual əlaqə. Hər bir nümunə fotoşəkillər, praktik zənglər, və generator geri bir remix link daxildir.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'İstehsalçı', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Elanlar', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Tam User Guide Açıq', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Case Study: Retail Counter QR Uplift',
      paragraphs: ['Bu real dünya məhsul üç il üçün onların counter üçün eyni QR kodu istifadə edilmiş kiçik bir kafeyi izləyir. Orijinal kodu avtomatik tərəfindən hazırlanmış, standart kağızda basılmış və plastik standa düşmüşdür. Hala işləyir - texniki - lakin müştərilər çox müştərilər onu taramaq üçün lazımdır, və kafenin müasir markalıqlıq təşkil edir.', 'Dönüşüm sadə audit ilə başladı: mövcud kodu kafenin online meneceri URL kod, ki, saxlamaq istədi. Həyahət 2020-ci ildən etibarlıqdan daha çox kafe təcrübəsinin bir hissəsi kimi hiss etdi.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Bir plastik standda havalanmış QR kodu görünür aşınma, parmak izi, və sollanmış çap',
          caption: 'Başlanğıc növü: üç il müraciət xidməti orijinal QR zar zor funksiyasını qaldırdı',
        },
      ],
    },
    {
      heading: 'Orijinal Kodun Problemlərini Diagnoz',
      paragraphs: ['Test bir çox məlumat verdi: orijinal kodu istifadə edilən Hata Düzelmə L (minimum qırmızılıq), yalnız 2 modulları sakin bir yer idi və aşağı qəbul edildi. Kafein istilik səyahəti altında, artıq qarşılanmış qadınlara qarşı qarşısını alır. Yaşlı telefonlar müxtəlif; yeni telefonlar baxmaq lakin gözəl gecikmə ilə.', 'Texniki problemlərində, ümumi black-and-white kvadrat marka haqqında heç bir şey təqdim edir. İstehsalçılar taramadan dəstəkləndi - kafenin əsasən hazırlanmış digital meneceri ilə əməkdaşlıq azaldır.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Orijinal QR texniki məlumatları göstərir: aşağı ECC, minimal sakit region, pis kontrast',
          caption: 'Texniki analiz, real dünya şəhərində əsas kodun informasiya olduğunu ortaya çıxarır',
        },
      ],
    },
    {
      heading: 'Uplift prosesi',
      paragraphs: ['ANQR istifadə etmək, kafe sahibi eyni menyu URL ilə kodu yaradılıb, lakin dramatik birləşdirilmiş ayarları: Qeydiyyat  H . . . . . . . . . . .', 'Kafenin logosu daxil olan kiçik bir mərkəzi əlavə edildi - ani marka tanınırlığı təhlükəsizliyi qarşılaşdırmaq üçün diqqqətli diqqqəti əlavə etdi. Təhlükəsizlik Modu, hər bir çapdan əvvvəl test cihazları arasında etibarlı yeni dizaynı təmin edir.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'ANQR interfeys konfiqurasiya göstərir: marka rəngləri, uyğun ECC, sənaye zəng, ince logo overlay',
          caption: 'Yeniləndirilmiş konfiqurasiyanın yaradılması: taramanın etibarlılığı ilə seçilən hər yer',
        },
      ],
    },
    {
      heading: 'Measurable',
      paragraphs: ['Professional matte-laminated kartı stomatında yeni QR quraşdırmaqdan sonra, kafe dört həyatdan keçirildi. Scan uğur dəyişiklik 70%-dən yaxın%-dən yaxınlaşdırılmışdır. Ortalama tarama vaxtı 3-4 saniyə-dən 1 ikinci qədər düşmüşdür. Ən çox səhifə, meneceri 40% artırdı - daha əvvəl QR baxdı və indi əvvəl tarandı.', 'Ətraflı müştərilər üçün URL yazmaq üçün daha çox müştəri məsləhət etdi. markalı görünüş də danışıqları, müştərilər ilə cohesive dizaynda sərhət edir.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Metrics ilə əvvəl / sonra: təhlükəsizlik dərəcəsi, orta tarama vaxtı və həftəlik tarama xidməti',
          caption: 'Bir fikirli QR uplift measurable effekt göstərir ki, 4 həftə',
        },
      ],
    },
    {
      heading: 'Bu konfiqurasiya',
      paragraphs: ['Kafein konfiqurasiyası müsabiqə lakin effektiv markalıq göstərir: Qeydiyyat H, 6-module sakit zone, yüksək-kontrast marka rəngləri, və minimal mərkəzi overlay. Bu balans, etibarlıq ilk gəlməlidir, lakin marka varlığı həm də mövcuddur.', 'Bu ayarları pre-loaded ilə generator açın və öz marka qoymaq üçün rəng və overlay uyğun. Əsas fikir: yalnız etibarlı inkişaf edə bilər, hər hansı bir görsel stil əlavə etmək əvvəl.', 'Bu yanaşmanın tam metodolojisi üçün mövcud QR kampaniyalarının inkişafına dair əlaqədar öyrənməsini baxın.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'generator s s s s s s s',
          caption: 'Sizin markanız üçün kanıtlanmış konfiqurasiya və xüsusilə başlayın',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Elanlar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Case Study: Multi-Payment Counter Display',
      paragraphs: ['Bu səhifə onların qeydiyyatında beş müxtəlif QR kodu yerləşdirilmiş butik paltar mağazasını izləyir: bank ödəniş, məsləhət, Instagram, Google baxışlar, və bir iş link. Hər bir müxtəlif məhsuldan yaranılmış, müxtəlif dəfə çap edilmişdir və yanlış uyğundur. Bakı şəhərindəki sənaye sənayesi, müştərilərin yanlış kodu tarayıb.', 'Müəllifliklərin qarşısını almaq üçün lazım olan həyata keçirilib: marketinq kodları daha səhifə edə bilər. yaradılmış bir ekran sistemi müxtəlif QR istifadə hallarda funksional tələblər qarşı marka varlığını necə bilməyini göstərir.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Müxtəlif stand və çap materiallarında beş qarşılaşdırılmış QR kodları göstərici sahəsi göstərir',
          caption: 'Kaotik başlanğıc növü: əməliyyat üçün yarışan beş qarşılıq QR kodları və müştəri qarşılıq qarşısını almaq',
        },
      ],
    },
    {
      heading: 'Ödənişin təcrübəsi',
      paragraphs: ['Mağazanın əsas ödəniş metodu ciddi ödəniş yükü uyğunlaşdırılmış regional standart istifadə edib. Test, kiçik stil müxtəlif bank apps ilə tarama sürəti təsdiq etmişdir. Qeyd: ödəniş QR dəyişdirilməsi və matte kartı stokunda professional çap istisna olmaqla tamamilə yoxdur.', 'Bu müraciət ödəniş kodu ideal daha az \'markalı\' baxıb, lakin əməliyyat dəyişiklikləri dramatik inkişaf.  insight: ödəniş anları markalaşma imkanları deyil - onlar etibarlı anlar. Şirkətlər pul əvvəl estetikalar üzərində sürət və həyata təsdiq edir.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Yüksək, böyük ödəniş QR kodu, professional matte kartı stomatında yerləşdirilmişdir',
          caption: 'Ödəniş QR: ölçülü səsləndirilmiş, səvəl hazırlanmış, bank apps tərəfindən ani tanıma üsullub',
        },
      ],
    },
    {
      heading: 'Orta Action Display yaratmaq',
      paragraphs: ['tips, baxışlar, sosial, və almaq, mağaza daha ekspresive ola bilər. Bu kodlar müxtəlif marka üsulları ilə ANQR yeniləndi: mağazanın imza zeytin yaşıl krem, yuvarlanmış modu stil və mağazanın icon ilə ince bir mərkəzi. Qeydiyyat H üsullubla da etibarlılığı təmin edir.', 'Bu böyük kodlar aşağıdakı markalı paneldə təşkil olunmuşdur (gər yarışan deyil) Mağazanın tipoqrafiyasında Clear etiketləri haqqında haqqında izah. Sənaye proqramı istədi: ödəniş yalnız və mövcud idi; ikincil fəaliyyətlər forma kimi qruped.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Avtomatik şəkillər, səhifə, sosial, və işləyir, açıq etiketlər üçün 4 stild QR kodu göstərir',
          caption: 'Orta fəaliyyət paneli: tutarlı markalıq, açıq etiketləşdirici, boşluqlardan daha çox variantlar kimi yerləşdirilmişdir',
        },
      ],
    },
    {
      heading: 'Proqramlar',
      paragraphs: ['Fiziki ekran bir neçə problemləri birləşdirdi. Hem ödəniş standı və orta panel yük işıqlandırmadan glare aradan qaldırılması üçün matte materialları istifadə etdi. Yüksəklər müxtəlif stature müştərilər üçün optimize edilmişdir. müştəri sıraya qarşı müştəri qaldırmaq.', 'E-poçt ünvanı Əgərlər kodunun sonunda istehsal edilməsi olduqda, heyvanlı konfiqurasiya istifadə edərək dəyişdi - heç bir ekran görüntüsü, heç bir parametrləri, heç bir keyfiyyətli deyil.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Fiziki ekran strategiyasını göstərir: yükseklik, açıqlar, materiallar, və ödəniş və orta ekran arasında əlaqə',
          caption: 'Ekran sistemi maviprint: müştəri hüquqları və işıqlandırma şəkilləri arasında etibarlı tarama üçün fiziki ergonomik',
        },
      ],
    },
    {
      heading: 'Əməliyyat',
      paragraphs: ['Satışdan sonra altı ay sonra mağaza mövcud inkişaf edir: \'wrong kodu\' qarşılıq, daha sürətli məlumat vasitələri və növbəti 3x qaldırmaq üçün sıfır müştəri məsləhət. Google baxışlar da xüsusi kimi artırıldı, yaxşı-labeled QR çıxdı.', 'Staff təhsil daha asan oldu: \'Kredit kodu böyük, hər şey panel.\' Ödəniş proqramları yeniləndiyi zaman və bir əvvəl yavaş tarama göstərdiyi zaman, müxtəlif ödəniş kodu dizaynı həyata işlədi - tamamilə qoşulmaq daha yavaş idi.', 'Bu ekran sisteminin dizaynının ardıcıl prinsipləri üçün qiymətlər üçün QR kodlarına baxın.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Daha əvvvəlki / müqavilələrindən sonra göstərilən metrik panel: qarışıq hadisələri, məlumat vaxtı, tip tezlik, baxış tədbirləri',
          caption: 'Altı aylıq əməliyyat data fikirli multi-QR ekran sisteminin iş təsvirini göstərir',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Elanlar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Case Study: Biznes Kartdan Billboarda',
      paragraphs: ['Bu səhifə əsas konfrans üçün hazırlıq şirkətini izləyir. Onlar eyni QR kodu lazımdır - ictimai müxtəlif formatlarda qoşulmaq - səviyyəli müxtəlif formatlarda qoşulmaq üçün lazımdır: badge daxil olmaq (3cm), masa çadır kartları (8cm), qeydiyyat masaları (30cm), yolfinding posterlər (60cm), və böyük bir məhsul geridrop banner (4 metr). Hər bir format müxtəlif baxış ölçüləri, işıqlandırma şəhəri və istehsal işləri idi.', 'Bu problem yalnız texniki deyil - bu əməliyyat idi. Bir çox satıcı müxtəlif çap işləri işləyir, və şirkət kim istehsal edəcək ki, tutarlı, taranable nəticələr təmin etmək lazımdır. SVG sənaye və sıx məlumat üzrə həyata keçirilib.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Beş müxtəlif ölçülərdə qarşılanan eyni QR kodunu göstərir',
          caption: 'One QR kodu, beş quraşdırma ölçüləri: sərnişindən çıxarmaq problemləri',
        },
      ],
    },
    {
      heading: 'Niyə Əvvəlki Hadisələr Problemləri',
      paragraphs: ['Onların son konfransında, şirkət utandırıcı uğursuzluqlar yaşadı.  The . . . . . . . . . . . . . . Qeydiyyat QRs over-styled və çox kiçik idi, sinir bozucu iştirakçılar kontaktları əlavə etmək. Foronsistent parametrləri "same" QR haqqında hər bir parça müxtəlif idi.', 'Post-event analizi kök mövzu ortaya çıxdı: hər hansı bir məhsul. Hər bir dizayner bir xüsusi ayarları ilə QR yeniləyirdi və hər bir çap satıcısı müxtəlif faylları işlədi. fayllar telefon oyunu ilə üstünlük.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'scanning: pikselli banner modulları, ölçülü badge kodları altında, formatlar arasında uyğun stil',
          caption: 'Əvvəlki haldakı məlumatların analizi: hər format müxtəlif keyfiyyət problemlərini təqdim edib',
        },
      ],
    },
    {
      heading: 'SVG-First Workflow',
      paragraphs: ['Bu halda, şirkət müxtəlif protokol yaradılıb: optimal parametrlər ilə ANQR bir master QR yaradılıb (Error Yeniləyir H, sənaye zəngin rayon, təmiz stil), SVG kimi dəstəkləndirilmiş və bir mövzu kimi saxlanılmışdır. ANQR konfiqurasiya linki SVG faylına əlavə edilmişdir, buna görə kod yenilənmiş ola bilər.', 'Hər bir dizayner və satıcı müxtəlif talimatları ilə eyni SVG master aldı: lazımi ölçüdə yer, dəyişdirilməsi, sakit zəmanlığı saxlamaq. Domen adı qeydiyyatdan keçirt ».'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'SVG master, ölçülü PNGs, spesifikasiya nümunəsi və konfiqurasiya linkini gösteren bir fayl paketi',
          caption: 'Eloff paketi: heç bir satıcının tahmin olmadan tutarlı sonuçlar istehsal etmək lazımdır',
        },
      ],
    },
    {
      heading: 'Size S',
      paragraphs: ['Xüsusi diqqqoriya. 3cm-də qapılar maksimum mövcud yer tutmaq üçün QR lazımdır - tarama uzaq uzunluğu olacaq. 8cm-dəki masa çadırları sakitindən sənaye framı daxil ola bilər. 4-metr banner tərəfindən təhlükəsiz hesab: tipik bazardan (15-20 metr), modul dizaynı ən azı 80cm olmaq üçün lazım olan telefon kameraları tərəfindən aydınlaşdırılması lazım olan modullar.', 'Şirkət hər bir gözəl tarama səviyyəsi üçün minimum QR ölçüləri yaradılıb. Bu, dizayn prosesindən hesablamaq üçün yeni bir aktiv oldu.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'A , , , , , , , ,',
          caption: 'Xüsusiyyət: hesablanmış ölçülər hər bir formatda etibarlı tarama imkanı',
        },
      ],
    },
    {
      heading: 'İstehsalçılar',
      paragraphs: ['Konfrans günü təhlükəsizliyi sistemləndirilmişdir: qapılar açıldıqdan əvvəl hər çıxdı QR test edilmişdir. Kol uzunluğu anında taranan badge addımları. Masa çadırları boşluq otaqları müxtəlif işləyir.  stage . . s s s s s . . s.', '2000+ iştirakçıları arasında sıfır tarama məlumatları qəbul edildi. Əməliyyat qazandıqda, son dəqiqə sponsoru əlavə etdiyi zaman, yeni imzalama, istehsal komanda dərhal SVG tərəfindən yaradılıb, hər şeyə uyğun olardı.', 'SVG vs PNG qaydası və ən yaxşı proqramlar üçün print-ready QR kodları təklif edir.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'İştirakçıların məkan boyu müxtəlif ölçülərdə və məsafələrdə QR kodlarını uğurla skan etdiyini göstərən hadisə fotoşəkili',
          caption: 'Konfrans günü uğur: hər hansı bir formatda etibarlı tarama, badge close-ups mərkəzi banner səyahət atışları',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Elanlar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Case Study: Airport Lounge Digital Display',
      paragraphs: ['Bu səhifə onların digital xüsusiyyət ekranlarında statik QR kodları istifadə edilmiş bir hava limanını izləyir. Ekranlar geri dönüş promosyon content göstərdi, lakin lounge check-in oturmaq üçün QR kodu, statik və asan gözəl gözləndirilir. Analytics masa sıra daha sürətli olmasına baxmayaraq QR check-in istifadə edilən keyfiyyətli xidmətlərin yalnız 15%-ini göstərdi. Ən çox qonaqlar onu fark etmədi.', 'Hipokrat sadə idi: inkişaf etdiyi gözəl məhsul, statik QR görünür. qarşısını almaq üçün lazım olan hər bir çek-in axtarışı üçün lazım olan həyata keçirmək lazımdır.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Avtomatik ekran bir hava limanında promosyon content kiçik, statik QR kodu ilə göstərir',
          caption: 'Orijinal quraşdırma: dinamik promosyon content bir dəyişdirilmiş statik QR, yalnız 15% qəbul',
        },
      ],
    },
    {
      heading: 'Daxil olmaq',
      paragraphs: ['Loungenin rəng imzaajı böyük LED panelləri istifadə edir - axtarıcı animasiya tarama problemləri yaradılmış ola bilər. Dizayn komandası müsabiqə başlamışdır: subtly genişləndirilmiş və müasir kod strukturunu dəyişdirməden QR səviyyəli məlumat. LED yeniləmə faizi ilə hər hansı bir flicker problemləri aradan qaldırmaq üçün Frame vaxtı yavaş (250ms) set edildi.', 'Təhlükəsizlik rejimi hər hansı bir çərçivənin taranmışdır. Daxili LED panellərin əlavə testləri, həmçinin masa üstü səhifələrindən daha diqqqətli olması üçün lazım olduğunu ortaya çıxdı - LED parlaq və gözlənmiş səfərlərin görüntüləndirilməsi daha çox görünür.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'ANQR animasiya ayarları panel: yavaş vaxt, diqqqət, Təhlükəsizlik Modu',
          caption: 'Animasiya konfiqurasiyası: LED panel ekran üçün parametrlər hər hansı bir çərçivəsində pulsuzluğu saxlamaq üçün uyğunlaşdırılmışdır',
        },
      ],
    },
    {
      heading: 'Signage Content',
      paragraphs: ['The . . . . . . . . . . . Bu ayrılıq əvvəlli idi: QR onun ince fəaliyyəti ilə diqqqət çıxarırmaq üçün gözəllik lazımdır.', 'Bir açıq çağrı-to-aktiv QR əlavə edildi: \'Skip sıra - check in.\' Bu məhsul QR namizəddi, promosyon məlumat olmadan tarama imkanı göz edən bir visual qiymət yaratmaq.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Əsas sahəsində reklam məsləhəti QR göstərir bir ekran strategiyası',
          caption: 'Screen real tikinti ayrılması: axtarış QR geri dönüş promosyon content ayrı sabit bir yer tutur',
        },
      ],
    },
    {
      heading: 'Texniki məlumatlar',
      paragraphs: ['Rəsmi QR imzalama CMS üçün optimize edilmiş ayarları ilə bir GIF kimi ixtisas edildi. Fayl ölçüsü gözlənir - loungenin content idarəetmə sistemi limit yüksək idi və çox böyük fayllar playback stuttering səbəb. Son ixtisaslaşdırma rəsmi keyfiyyəti rəsmi keyfiyyətli rəsmi keyfiyyətli rəsmi şəkildə rəsmi şəkillərin qarşısını alır.', 'Yüksəklik bir düşmə daxildir: GIF hər hansı bir səs üçün oynamaq olmasaydı, imza sistemi statik PNG backup göstərir. Bu qalınlığı check-in xidməti animasiya ilə texnologiya problemlərindən heç vacib olmadı.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Yadda saxla',
          caption: 'Signage CMS konfiqurasiya: Check-in imkanlarını qarşılaşdırmaq üçün statik payızdırma ilə əsaslanan əsas',
        },
      ],
    },
    {
      heading: 'Qeydiyyat',
      paragraphs: ['Bir ay əməliyyatdan sonra, QR check-in qəbul 15%-dən 24%-dən artıb - 60% nisbəti. Qeydiyyatdan keçirt » Ofis sıra vaxtları QR vasitəsilə daha çox qonaqlar öz-served kimi səfər səfər zaman məhsulları azaldır.', 'Müxtəlif, gündəlik taramalara qarşı qeyd edildi. Müxtəlif axtarış həyata keçirilməsindən istifadə etdi. lounge sonra digər yerlərinə oxuyucu fəaliyyət göstərdi.', 'Müəlliflik dizaynının texniki prinsipləri üçün digital imzalama üçün fəaliyyətli QR kodları haqqında öyrənmək.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Tədqiqatın qəbul edilməsi, qarşı vaxtın azaldılması və qeyd edilməsi üzrə qeyd edilməsi',
          caption: 'Bir ay məlumat: 60% qəbul artdırma, aşağı qarşı sıra, və mükəmməl tarama etibarlılığı',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Elanlar',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Case Study: Global Product QR Kampaniyası',
      paragraphs: ['Bu səfər 8 dildə 12 bazarda yeni bir məhsul başlatmaq istehsal edir. Yerli məhsul səhifə səhifə səhifələri ilə bağlı QR kodları olan nümayişlərin qablaşdırılması üçün lazım olan bir regional market komandası lazımdır. Əvvəlki çıxışlar hər bir komanda ekran ekran ekranlarından yenilənmiş kodlar kimi istifadə edilən konfiqurasiya qarşısını almaqla qarşılaşdırılmışdır.', 'Hər bir regional komandanın onların interfeys dilindən asılı olaraq, hər hansı bir məhsul yaratmaq üçün ANQR payable konfiqurasiya linkləri istifadə etdi. QR ödəniş yüksək istifadəçi dili qəbul edilmiş smart bir simvol istifadə edilən, belə ki, bir kod yerli təcrübə təcrübəsi təhlükəsizlik göstərir.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'QR kodları ilə 12 bazar yerləri göstərir dünya xəritə, bir digər diqqqət ilə əlaqə saxlayın',
          caption: 'Bu problem: 12 bazar, 8 dil və regionlar arasında qarşılıqlı QR tətbiqi',
        },
      ],
    },
    {
      heading: 'Master konfiqurasiyasının yaradılması',
      paragraphs: ['Global marka komandası ANQR-da müasir QR konfiqurasiyası yaradılıb: məhsul xüsusiyyətlərini uyğunlaşdırmaq, bütün çap və digital proqramlar arasında etibarlıq üçün Error Yeniləyir və yerli istehsal üsulları qəbul edəcək üsullar. Konfiqurasiya kilitləndi və qlobal kampaniyadakı pay linki kısa idi.', 'E-poçt ünvanı Gözəl, istifadəçilər avtomatik olaraq yerli dil məhsul səhifəsinə keçirildi. Bu, bütün 12 bazarları eyni QR kodları istifadə edə bilər - hər hansı bir marketinq ödənişlərini təqdim edə bilər.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'ANQR interfeys marka rəngləri ilə master konfiqurasiya göstərir, ECC H, və smart yönəldirici URL',
          caption: 'Master konfiqurasiyası: qlobal marka standartları bir kodlaşdırılmışdır, hər hansı bir məhsul mövcuddur',
        },
      ],
    },
    {
      heading: 'Regional Team Workflow',
      paragraphs: ['Hər bir regional marketinq komandası sadə tətbiqi ilə konfiqurasiya linkini aldı: link açmaq, təqdim edilməsinə qoymaq, proqram üçün lazım olan formatda ixrac. Hər bir komandanın tercih dili ilə göstərilən ANQR interfeys, lakin əsas QR ayarları interfeys dili qədər eyni olaraq eyni olaraq.', 'Yaponiya komandası yüksək səviyyəli nümayiş ekranları üçün SVG lazımdır və Braziliya komandası sosial media üçün PNG lazımdır, həm də eyni konfiqurasiyadan çıxarılır. Alman komandanın çap satıcısı xüsusi rəsmi qiymətləri istədiyi zaman, ekrandan baxmaqdan daha çox konfiqurasiyaya tətbiq edə bilər.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Yaponiya, Portekiz və Alman interfeyslərində açılan eyni konfiqurasiya linkini göstərir',
          caption: 'Eyni konfiqurasiya, müxtəlif interfeyslər: regional komandalar öz tercih dil işləyir',
        },
      ],
    },
    {
      heading: 'Regional Variations',
      paragraphs: ['Ətraflı bazarlar kiçik inkişaf lazımdır. Çin komandası sosial paylaşım üçün bir WeChat-optimasiya qazanmaq lazımdır. Ustayı dəyişdirmək üçün, onlar öz konfiqurasiya linki ilə sertifikatlanmış bir variant yaradı, kampaniya aktiv kitabçası kimi açıkça etiketlədi. Bu, lazımi yerlilaşmaya imkan verir zaman izləyir.', 'Marka komandası sadə qeyd etdi: ustadan hər bir varyasyon yeni, sertifikatlaşdırılmış konfiqurasiya linkini tələb etdi. Dizayn proqramında No məlumatları, No \'quick fixes\' Bu, əvvəlki başlanğıcları olan konfiqurasiyasını qarşıladı.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Master konfiqurasiyası və sertifikatlaşdırılmış regional variantları göstərir, hər bir öz bağlantısı ilə',
          caption: 'Kampaniya aktiv idarəetmə: master konfiqurasiya plus sertifikatlaşdırılmış variantlar, bütün izləyir konfiqurasiya bağlantılar',
        },
      ],
    },
    {
      heading: 'Proqramlar',
      paragraphs: ['Product start günü qablaşdırma, mərkəzi ekranları, ictimai materiallar və bütün 12 bazarda digital kampaniyalar həyata keçirilmiş QR kodları gördüm. São Paulo qablaşdırma haqqında QR həyata keçirilir - regionlar arasında səyahətli təsdiq edir.', 'Proqramlar arasında sıfır tarama hataları bildirilir. Bir post-start məhsul səhifə URL dəyişdirilməsi lazım olduqda, yönləmə xidməti işləyir - heç bir reprinting tələb. Qlobal komanda konfiqurasiya linki həyata keçirdi 40 + əvvvəl koordinasiya vasitəsi ilə əvvəl onların əvvvəl başlatma metodolojisi ilə müraciət vasitəsi.', 'Global kampaniya tutarlılığı ardıcıllığında işgüzar prinsipləri üçün cross-lingual QR əməkdaşlıq üzrə öyrənmək guide baxın.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Müxtəlif bazarlarda tutarlı QR quraşdırma göstərir fotoşəkillərin grid: Tokyo məhsul, São Paulo qablaşdırma, Berlin hadisələri',
          caption: 'Global tutarlılıq qəbul edildi: müxtəlif dillər, satıcılar və formatlara qarşı 12 bazarda eyni QR təqdimatı',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Elanlar',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Elanlar', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Tam User Guide Açıq', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Qalereya açın', type: 'gallery' },
  ],
};
