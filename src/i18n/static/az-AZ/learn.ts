import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'ANQR',
  description: 'İnformasiya, biznes-ilk sifarişlər QR kodları real marketinq aktivləri - yalnız funksional meydanlar deyil. ANQR ("anchor") dəstəkləri istifadə edən müxtəlif komandalar üçün müxtəlif təhlükəsizlik təşkilatçıları üzrə fəaliyyət göstərir.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'İstehsalçı', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'QR nümunələrini baxın', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Tam User Guide Açıq', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Xidmətlərin yaradılması',
      paragraphs: ['Ən çox şirkətlərində fəaliyyətlər arasında qarşılaşdırılmış QR kodları var - menyularda, qarşı durmaq, qablaşdırma və promosyon materialları. Bu kodların bir çoxu əsas generatorlarla il əvvəl yaradılıb, qəbul ehtiyac və ya markalıqla qarşılaşdırmaq üçün uğursuz olan ümumi black-and-white kvadratları yaradılıb. Bu müxtəlif guide sizi audit, yeniləndirilməsi, yeniləndirilməsi və müştəri səyahətsiz var QR infrastrukturunu təmin edir.', 'QR kodlarının qarşısını almaqdan daha çox inkişaf strateji üstünlük. Sizin müştərilər kodlarınızı tarayır zaman məsulları gözləyir. E-poçt ünvanı.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Bir yan tərəfdaşlıq göstərir, müasir markalı versiyası sonra ümumi QR kodu eyni URL\'si',
          caption: 'Əvvəl və sonra:  The  The  a  a  a  a  a',
        },
      ],
    },
    {
      heading: 'Niyə qoşulmaq',
      paragraphs: ['Ən yaxşı qəbul fazasında yaradılan QR kodları - əsasən 2020-2021-də biznes əlaqəsiz həyata keçirdikdə - tez-tez bir neçə kritik problemlərdən çox acıdır. Aşağı hata düzeltme ayarları dokud əvvəllər üzərində çap və ya zor işıqlandırma altında görülən zaman onları səvəlsiz edir. Xüsusi sakin hissələr digər vizit elementlərinin yaxınlığında kodların yerləşdirilməsi zamanı tarama hatalarına səviyyət verir. Genric üslubu, qarşılıq və aşağı tarama nisbəti qarşılaşdırmaq üçün marka idarə etməz.', 'Texniki məqsədlərində, əsas kodlar çox mövcud markalıq imkanlarını temsil edir. Hər bir QR kodu müştəri ilə bir touchpointdir - onların aktivləşdirilməsi və davam etmək istəyən bir an. Sizin marka rəsmlərini qarşılayan professional stild kodu, uyğun təhlükəsizlik marjları daxildir və xüsusiyyətli markalı elementlər bu faydalını hər hansı bir təşkil edir marketinq aktivləri.'],
    },
    {
      heading: 'QR Kodu Auditi',
      paragraphs: ['Sizin biznes haqqında istifadə olunan hər bir QR kodun mütəlif bir stok yaratmaq ilə yükseltme layihə başlayın. Fiziki yer, kodlanmış yer, çap material cari xüsusiyyəti və işıqlandırma şəraitləri, açıqları daxil olmaqla tipik tarama mühiti. Bir çox cihaz ilə hər bir kodu test - yaşlı smartfonlar və büdcə cihazları çox premium telefonlar maskasının etibarlıq problemləri ifşa edir.', 'Yüksək-stakes yerlərin kodlarına xüsusiyyət göstərin: ödəniş puanları, çek-in sahələri və promosyon ekranları birbaşa ödənişin və ya müştəri təcrübəsi. Bu dərhal yükseltme üçün əvvəl olmalıdır. Fotoqrafiya və ya video məlumatlarında görünən not kodları, bu, marketinq komandası ilə kompüter aktivləri yeniləmək üçün interfeys edəcək.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'QR audit kateqoriyaları göstərir: yer, kondisioner, tarama etibarlılığı və əvvəlliyi reytinq',
          caption: 'Yadda saxla',
        },
      ],
    },
    {
      heading: 'Sifariş Proqramı',
      paragraphs: ['QR yükseltmelərin kartinal qaydası qeyd edilir. hər mövcud koddan tam URL çıxarın və yeni versiyanızda eyni kodlayın. Bu, bütün mövcud analitiki, idarə effektivliyi və müştəri gözləndirilməsi təmin edir. Uşaq yenilikləri üçün yerləşdirmək lazımdırsa, bu, markalı qısa URL və ya yönləmə xidmətini təmin etmək üçün ideal vaxtdır - lakin bu, birləşdirilmə dəyişikliklərini qarşılamaq üçün ayrı bir layihə kimi istifadə edin.', 'Bakı şəhəri, Azərbaycan Respublikası, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti, Azərbaycan Respublikasının Prezidenti Hər bir qadın davamdan əvvəl test vasitəsilə tətbiq olunmalıdır. ANQR-nin Təhlükəsizliyi Modu, bu əvvəlliyi stil seçimlərinin taranması mümkün deyil zaman uyarı ilə təmin edə bilər.'],
    },
    {
      heading: 'Əməliyyat olmadan Brand Identity',
      paragraphs: ['Effektiv QR markalıq balansları tarama qeydiyyatına qarşı effektiv. rəng ilə başlayın: birincil marka rəng ilə default black foreground dəyişdirin, fonunuza qarşı qazanmaq. Ən çox markalar üçün, işıq fonlar ən yaxşı işləyir. ümumi işıqlandırma şəraitləri altında görünür ki, aşağı-kontrast komponentləri, kənar açıqlığı azaltmaq, və ya rənglər.', 'Modul forması xüsusilaşdırma minimal etibarlılıqla digər markalaşma imkanı verir. Rounded modulları ən yaxşı taramanability saxlamaq zaman daha uyğun görünüş yaratmaq. Dot-style modulları müasir, texnologiya-yə markaları üçün yaxşı işləyir. Bağlı modullar sənaye və ya korporativ kimliklər uyğundur. Siz seçdiyiniz üslub, ani marka tanıma üçün bütün QR yerləşdirilməsində tutarlılığı saxlayın.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Bir rəsmi kağız diqqqoriyaları ilə optimal QR rəsmi komponentləri göstərir',
          caption: 'Tarama etibarlılığı saxlayan yüksək-kontrast komponentlərini göstərir',
        },
      ],
    },
    {
      heading: 'Test və Validation Protokolu',
      paragraphs: ['Hesabsız test olmadan QR kodları dağıtmaq. Tam ölçüsü və son təşkilatınız kimi eyni materialda bir fiziki sübut. Kod yaşayır, gün müxtəlif vaxtlarda işləyir. Ən az üç müxtəlif cihazlar istifadə edin: cari bazar telefon, orta səhifə cihaz, və yaşlı və ya büdcə smartfon.', 'Hər bir test üçün pul tarama vaxtları və uğurlu nisbəti. Yadda saxla • Şifrəni unutmusunuz? Müxtəlif gecikmələr və ya uğursuzluqlar görə, üsulun inkişafını azaltmaq və ya daha yüksək bir hata düzeltme səviyyəsini artırmaq. İctimailik həm əvvəl əvvəl əvvəllik edir.'],
    },
    {
      heading: 'Consistency üçün konfiqurasiyası',
      paragraphs: ['Siz optimal konfiqurasiya təsdiq etdikdən sonra, ANQR-nin payladlı bağlantılar istifadə etmək. Bu, sertifikatlaşdırılmış kodu yaratmaq üçün istifadə olunan hər hansı bir forma daimi rekort yaradır - rəng, modul stil, səviyyə düzelmə, böyüking və hər bir overlays. Bu linki dizayn komandası, çap satıcılarla paylaşın və həmçinin gətirmək lazım olan hər şey.', 'Bu konfiqurasiya kilidi bir çox QR yerləşdirilməsi çıxarır. Bu olmadan, komanda üzvləri ekran görüntülərini yeniləyir, dizaynerləri yaxşılaşdırma ayarları, və çap satıcıları \'yardımçılıq\' inkişaf edir. Hər hansı bir varyasyon potensial məlumat verir. Daxili konfiqurasiya linki ilə, hər bir reaksiya sınaq sizin test, orijinal təsdiq edilir.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Konfiqurasiyanın qarşısını göstərir: variantlara qarşılanan reaksiyalar, bir məhsul-of-hazır bir linkində',
          caption: 'Bütün QR reaksiyaları üçün bir mövcud məhsulun yaradılması ilə konfiqurasiyanın qarşısını almaq',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR nümunələrini baxın',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Yadda saxla',
      paragraphs: ['Ödəniş QR kodları ən tərəfdaşlıq mühitində çalışır: Əməliyyat anı. İstehsalçılar ödəməyə hazırdırlar, çox vaxt üzərindən çıxarılır və gecikmənin hər saniyesi sürətlənir. Lakin bu yüksək səfərli an da markalıq üçün əsas tikintidir. Bu guide, müştəri əməliyyatını təqdim etdiyiniz zaman bank apps həyata keçirmək üçün necə ödəcəyini izah edir.', 'Ödəniş QR kodları üçün əsas prinsipəsi estetik üzərində etibarlıdır. Bir müştəri bank proqramını taramaq üçün köçürməyən gözəl hazırlanmış kod sizə daha çox ola bilər ki, müxtəlif dizayndan daha çox mal olacaq. Müəllifliklə başlayır, etibarlılığı əlavə edin, sonra markalaşdırmaqda əsas funksiyasını qarşılamaq deyil.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Bir bank proqramı ilə bir smartfon ilə çıxış QR kodu göstərir',
          caption: 'Domen adı qeydiyyatdan keçirt »',
        },
      ],
    },
    {
      heading: 'Ödəniş QR Standartları',
      paragraphs: ['Ödəniş QR kodları əsasən ödəniş formatını diktən regional standartlara uyğundur. Domen adı qeydiyyatdan keçirt » Hindistanda, UPI kodları BharatQR və ya UPI əsas link standartlarına uyğundur. Avropa SEPA ödənişləri EPC QR kodları istifadə edir. Hər bir standart bank apps anında təhlükəsiz ola bilər və ödəniş məlumat prosesi. Bu standartlara uyğunluq - də az - məlumat proqramlarına məlumat verməyə bilər.', 'ANQR, avtomatik olaraq əsas ödəniş standartlarına şablonları daxildir. Hər zaman bu şablonları dəyişdirilməsindən daha çox istifadə edir, ki, kiçik formatlı səhvələr əməliyyat hatalarına səbəb ola bilər. Sizin regionun ödəniş standart bir şablon kimi mövcud deyil, tam formatlama tələbləri üçün ödəniş təchizatçının texniki məlumatlarına baxın.'],
    },
    {
      heading: 'Counter Displays üçün Sizing və yerləşdirmək',
      paragraphs: ['Counter-top QR kodları unikal fiziki problemlər üzrə. Yadda saxla Overhead işıqlandırma glare spotları yaradır. kodunun diqqqət və açıq gözləşdirilməsi üçün digər counter clutter ilə yarışır. Ödənişinizin qarşılıqla ölçüsü - minimum 4-5cm çox counter proqramları üçün tərəfindən tərəfindən tələb olunur, kod cam və ya dimly lit sahəsində oturursa ölçül.', 'İştirak ölçüsü çoxdur. müştərilər sıra blok olmadan telefonlarını rahatlaya bilər və ya qarşılaşdırmaq. müştəridən daha çox ekran açar. Mümkünse, matte laminat və ya non-reflective ekran materiallarından yüksək işıqlandırmadan minimise glare istifadə edin. İşıqlandırma problemlərini tutmaq üçün günün müxtəlif dəfə son yerləşdirilməsi.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Müxtəlif counter konfiqurasiyaları üçün optimal QR yerləşdirilməsi və açıqlarını göstərir',
          caption: 'Counter yerləşdirilməsi guide: optimal yüksəklər, açıqlar və etibarlı ödəniş tarama üçün səviyyələr',
        },
      ],
    },
    {
      heading: 'Ödəniş kodları üçün komissiya Branding',
      paragraphs: ['Ödəniş proqramları ümumi kamera tarayıcılarından daha az bağışlamalıdır. Bir çox bank apps böyük istifadə edir, daha yaxşı QR oxumaq alqoriyalar rahatlaşdırılmışdır. Bu, telefon kamera ilə mükəmməl işləyir üsulları xüsusi ödəniş apps ilə başarısız ola bilər. Müəllif markalıq saxlayın: güclü kontrast saxlamaq üçün foreground üçün marka rəng istifadə edin, lakin gradients, ağır overlays, və ya tanınırlığa müdafiə edə bilər dekorativ elementlər.', 'Bir mərkəzi logo və ya overlay istəyirsinizsə, çox kiçik saxlayın - QR sahəsinin 10-15%-dən çoxdur - və müştərilərin istifadə edə bilərsiniz hər bir ödəniş app ilə geniş test. Bir çox biznes xidmət kodları heç bir overlay üçün seçin xüsusi, etibarlıq tələbləri daha az böyük olduğu marketinq QR kodları üçün reserving. Ödəniş kodunun işi əməliyyatları prosesindən ibarətdir, diqqqəti nüfuz etmir.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Ödəniş QR kodları üçün risksiz markalıq səviyyələri göstərir',
          caption: 'Domen adı qeydiyyatdan keçirt »',
        },
      ],
    },
    {
      heading: 'Material və Çap Baxışlar',
      paragraphs: ['Fiziki ekran materialı xüsusi dəstəklər tarama etibarlılığı edir. Glossy laminatlıq müştəri kamera birbaşa yüksək işıqları yandırır. Textured materialları distort modulları edə bilər. Ucuz çap gözəl məlumatları bulanık ola bilər. Ödəniş QR kodları üçün, keyfiyyətli investisiya: matte və ya satin laminatından istifadə, yüksək keyfiyyətli çap təmin etmək və çıxışdan əvvvəl ekran əvvəl. Qarışıq və ya qarışıqlı ödəniş kodu əməliyyatları edir.', 'Ekranın dayanıqlıq və dəyişiklik düşünün. Counter ekranlar əlavə edir, axtarış, və əvvəl çıxış. Sizin ekran sistemini dizayn edin, ki, QR daxil bütün standı dəyişdirməden asan ola bilər. Daxili konfiqurasiya linkinizdən yaradılmış pulsuz prints hazır olun, belə qarşı kodlar həyata keçirilir.'],
    },
    {
      heading: 'Real Payment ilə test Proqramlar',
      paragraphs: ['Genric kamera tarayıcıları hər hansı bir səhifə formatlı QR kodunu kodlaşdıracaq. Ödəniş apps pickier. Heç bir ödəniş QR kodunu dağıtmaqdan əvvəl, müştəriləriniz istifadə edə bilərsiniz. çox ödəniş avadanlığı, bu çox bank apps, digital cüzdanlar və ödəniş platformları ilə test edə bilər. Test edilmiş apps və onların versiyaları - ödəniş apps çox yeniləyir, və yeniləndirilməsi tarama davranışı dəyişdirə bilər.', 'Real şərtlər altında test: real ekran, real işıqlandırma, real tarama uzaqlığı. Hər gün saat 5:00-da saat 10.00-da saat 10.00-da saat 10.00-da saat 10.00-da qaldırmaq mümkündür. Ən yaxşı, ucuz smartfonu ilə sınaq - bu, bir qiymətli çalışırsa, hər şey işləyir. İdman və potensial redesign üçün 2 saniyə üzərində hər bir tarama vaxtı.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Müxtəlif ödəniş apps, cihaz nömrələri və ekoloji şərtlər göstərir',
          caption: 'Xüsusi ödəniş QR test maşın apps, cihazlar, və ekoloji aparıcılar',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'QR nümunələrini baxın',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Print-Ready QR kodları: SVG vs PNG',
      paragraphs: ['Bir QR kodu arasında müxtəlif və tezsiz olan bir şey tez-tez çıxarılması və çap işıq işıqlarında işıqlandırmaq necə aşağı gəlir. Bu guide, vektör (SVG) və raster (PNG) formatları arasında kritik diqqqəti izah edir, hər bir istifadə etmək üçün zaman, və necə iş kartlarından parlament və çap satıcılara QR məhsulları qəbul edir.', 'Çap istehsalçısı ekranda mövcud olmayan növbətləri təklif edir: ink yayılmış, substrat doku, son proseslər, və çox fayl dönüşümlərinin kümülasiyası. Sizin dizayn proqramında mükəmməl görünür QR kodu istehsallı kəslər, aşağı kontrast, və ya subtly silinmiş modulları olan printerdə ortaya çıxa bilər. Format seçimi və işıqlandırma ən yaxşı proqramları bu səhifəsizliklərin qarşısını alır.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Pixel məhsulları göstərir raster modulları ilə crisp qarşıları ilə vektör QR modulları ilə müqayisə olunub',
          caption: 'Vector seriyasında raster vs: tarama etibarlılığı təsvir etdiyi dərmanlıq',
        },
      ],
    },
    {
      heading: 'Niyə Vector (SVG) Print üçün əldə olunur',
      paragraphs: ['SVG faylları piksel gridləri daha çox matematiksel şekiller kimi QR kodları tarif edir. Bu, kodun hər hansı bir ölçüsü dəyişdirilməsi ola bilər - bir 1cm etiketdən 10-metr banner - kənar kağızı olmadan. printerin RIP (Raster Image Processor) çıxış cihazının yerli qaynaqında vektörləri təklif edir, hər bir modul krisp kimi hardware imkan verir. Heç bir interpolation deyil, heç bir anti-aliasing məhsulları yoxdur, bir çox resize əməliyyatdan keçmiş deyil.', 'Ölçülülükləşdirilməsində SVG faylları peşəkar işlərdə daha sağlamdır. Onlar reaksiya olmadan dizayn proqram vasitəsilə yuvarlanmışdır. Onlar resampling olmadan rəng-korrected ola bilər. Onlar pre-ready çıxış üçün PDF faylları təmizləşir. Heç bir çap proqramı üçün keyfiyyətli mövzu, SVG sizin default ixrac formatı olmalıdır.'],
    },
    {
      heading: 'PNG qəbul edilir',
      paragraphs: ['PNG işləyiciniz və ya hedef platformanız vektör formatlarını dəstəyir zaman lazım olur. Ən çox web platformaları, imzalama CMS sistemləri, və miras çap işıqları raster images edir. Bu hallarda PNG yaxşı işləyə bilər - lakin yalnız ciddi qaydaları izləyirsinizsə: son fiziki ölçüsü və qarşısında ixrac, ixracdan sonra heç bir dəyişmə və ya format dönüşüm qaldırmaq.', 'PNG üçün kritik qaynaq ixtisaslaşdırmaq üçün lazım olan piksel ölçülərini hesablamaqdır. Sizin QR 5cm-də çap edəcək və printeriniz 300 DPI-da çalışırsa, 590 piksel lazımdır. Bu ölçüsü və ya daha böyük səyahət, sonra lazım olsaydı aşağı - heç vaxt. Sizin fayl və ya metadata bu məlumat daxildir, bu məlumat daxil olmaqla bağlı istifadəçilər həyata keçirməz.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Fiziki ölçüsü, DPI və tələb olunan piksel ölçüləri arasında əlaqədar interfeys',
          caption: 'Çap qaynaq kalkulyatoru: hedef çıxış ölçüsü üçün minimum piksel ölçülərini təyin edin',
        },
      ],
    },
    {
      heading: 'ANQR İqtisadiyyat Seçimləri izah',
      paragraphs: ['ANQR, müxtəlif işləri uyğunlaşdırmaq üçün bir neçə SVG ixrac rejimi təklif edir. True Vector rejimi çap və professional dizayn tools üçün saf yol-based çıxış ideal edir. Siz raster overlays və ya müəyyən effektləri əlavə etdiyiniz zaman, ANQR bu əlavə edə bilər, və ya qeyd edilməsində tam bir rasterized versiya edə bilərsiniz. Bu variantları anlamaq, hər bir istifadə üçün doğru ixrac seçmək kömək edir.', 'PNG dəyişikliklər üçün ANQR tam ölçüləri göstərir və şəffaf fonlar üçün variantları daxildir. DPI ayarları, DPI metadata olduğunu unutmayın, çap üçün mövcud ölçüləri hesab edir, lakin unutmayın ki, DPI-nin metadata olduğunu unutmayın - çap üçün mövcud piksel var fiziki ölçüsü. Hər zaman, sizin lazım olduğunu düşünmək daha böyük ixrac; səviyyət aşağı qaldırmaq, səviyyət onu qarşılamaq zaman.'],
    },
    {
      heading: 'Handoff üçün Files hazırlanması',
      paragraphs: ['Proqramçılara və ya çap satıcılara QR səyahət keçirmək zaman, aydın spesifikasiyalar daxildir: istehsal olunan fiziki ölçüsü, minimum sakit zone tələbləri və hər hansı bir rəsmi yer baxışları. kritik proqramlar üçün, hem SVG master və yüksək istifadə PNG backup təmin edir, həmçinin müasir istifadə edilən istifadə olunur. ANQR konfiqurasiya linkini daxil edin, buna görə kod yenilənir.', 'İdman prosesində ümumi fayllar. QR dəyişməmiş, dönməmiş, skewed, və ya təhlükəsiz ehtiyacları olması lazımdır. Saxlamaq lazımdır ki, sakitin açıq olması lazımdır - heç bir ekspert nişanları, qeydiyyat nişanları, və ya dizayn elementləri intruding. QR rəng və ya fotoşəkil fon yerləşdirilməsində yerləşdirilirse, düzgün kontrast təmin etmək üçün bir opaque backing forması ilə bir versiya təmin edir.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'SVG master, PNG backup, spesifikasiya səhifəsi və konfiqurasiya linkini göstərir',
          caption: 'Professional QR handoff paketi: bir dizayner və ya çap satıcısı doğru reaksiya üçün lazımdır',
        },
      ],
    },
    {
      heading: 'Proqramlar',
      paragraphs: ['Daxil olmaqla bir çap işləyir. istehsalda istifadə olunacaq real başa çatacaq mövcuddur. Son parçanın göstərilən yerləşdirilən işıqlandırma şəraitləri altında sübut. Daha yaşlı smartfonlar daxil olmaqla çox cihazlarla test.', 'Proqram yavaş və ya zövqli tararsa, approving əvvəl araşdırmaq. Ümumi məsləhətlər rəsmi substratlar üzərindən qarşısını almaq, ink yayılmış yumşaq modulları, və ya laminatlıq glare yaratmaq. Bu hər bir tam çap run işləyə əvvəl mövcud ola bilər - lakin yalnız siz onları sübut məhsulunda tutmaq.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Scan test nəticələri, kontrast ölçüləri və tədqiqat imzaları ilə hesablama baxmaq',
          caption: 'Proqram proqramı: istehsal etməyə əvvəl sistemli test',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'QR nümunələrini baxın',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Animated QR kodları yaratmaq',
      paragraphs: ['Animated QR kodları, müxtəlif əməliyyat sənayesi ilə standart QR kodlarının funksiyasını birləşdirir. Digital signage, sosial media, və interaktiv ekranlarda, anima gözləyir və əməkdaşlıq sənaye elementində statik faydalı çevirir. Bu guide, proqram təsviri təqdim edilən həyata keçirilən, həyata effektiv qaydaların yaradılması üsulları, üsulları və praktik qarşısını alır.', 'Axtarış QR kodlarının əsas meydançası tarama etibarlıq qarşısında səviyyəli məsləhətdir. Hər bir çərçivə ayrı ayrılıq olmalıdır - bir browser axtarış dövründə hər hansı bir növ kodu tuta bilər. Bu diqqət hər dizayn qəbul edir: elementlər həyata edə bilər, necə dəyişiklik edə bilər, və anima boyunca sabit olacaq.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Bir ictimai sahəsində axtarış QR kodu göstərir',
          caption: 'Elektron imzalama haqqında Animated QR kodları: diqqqəti dəstəkləyir və tarama edir',
        },
      ],
    },
    {
      heading: 'Necə Animation Scannability',
      paragraphs: ['QR tarayıcıları işləyir, bir qurmaq və işıq və qısa modul analiz. İşləşdirmək üçün, hər hansı bir çərçivə tam, valideyn QR model olmalıdır. Bu, kodu strukturu, modulları qarşılaşdırmaq, və ya kontrast model dəstək. Data-carrying modulları - mərkəzinin görünüşlü random model - diqqqətli sabit olmalıdır.', 'Təhlükəsizlik axtarış elementlərini dəstəkləyir: fonlar, rənglər, dekorasiya çərçivələri və overlay elementləri. Struktur komponentləri - tapma nümunələri (bu böyük köşe meydanları), vaxt nümunələri (ki alternating line), və daha böyük kodlarda daha az kvadrat nümunələri (daha böyük kağızları) - onların mövcudları və nisbətlərini tutmalıdır. Bu zənglərdə işləyir, həmçinin dinamik və maraqlı axtarışları üçün imkan verir.'],
    },
    {
      heading: 'Oyuncaqlar Bu iş',
      paragraphs: ['Hər bir addımda əvvəl böyük döyüş və fon rəsmlərini izləyir. Bu, minimal tarama risk ilə canlı, diqqqəti yaradır - uzun müddət olaraq oxumaq oxuyur. ANQR\'nin rəng dövrü çıxışları dövründə taramalıq saxlamaq üçün hazırlanmışdır.', 'Animated . . . . kodu fon animates zamanı sabit olmayaraq - əvvəl bir looping video, axtarışıq marka elementləri, və ya soyut fərq qrafik. Bu texnologiya QR model böyük çərçivəsindən fon qarşısını almaq üçün ehtiyacı inkişaf edir, lakin ən gözəl çarpıcı sonuçlar yaradır.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Bir animasiya QR kənd strukturunu göstərir bir diqqqoriya göstərir: anima fon kağızı üzərində sabit kod kağızı',
          caption: 'Animasiya kağızı asanlıq: QR model iz elementləri aşağıdakı',
        },
      ],
    },
    {
      heading: 'Animasiya parametrlərinin konfiqurasiyası',
      paragraphs: ['Frame faizi həyata səviyyə və fayl ölçüsü edir. Ən çox proqramlar üçün, ikinci başına 10-15 dəfəli fayl ölçüsü olmadan düzgün görünüşlü həyata keçirir. Yüksək qutusu səviyyəli faylları yüksək səviyyəli yüksək səviyyələrini yüksəkləndirir. Sizin çatdırılma konsepsiyası düşünün - böyük bir digital imza mobil reklam yerləşdirilməsi daha böyük faylları işləyə bilər.', 'Loop . . . sorunsuz looplar imzalama və avadanlıq ekranları üçün davamlı həyata ideal yaratmaq. Ping-pong (pro-then-reverse) loops sadə animasiyalar üçün yaxşı işləyir. Dəstəkləşdirilməsindən əvvvəl əvvvəl dəyişdirilməsindən istifadə edərək həyata keçirilir.'],
    },
    {
      heading: 'Animated Overlays yaradılması',
      paragraphs: ['Axtarış şəkilləri istifadə etdiyiniz zaman (GIFs, axtarış WebPs, və ya video) overlays kimi, ANQR ekstraksiyaları və QR kodu ilə onları kompozitlər. Overlay inteqrasiyanın neçə nümayişini - daha yüksək dəstək dəstək qiymətləndirilməsindən daha aşağı səviyyəli qiymətləndirilməsi. Müxtəlif taramanability təmin etmək üçün bir çox çərçivəsində seçilmiş fəaliyyət test edin.', 'Source material keyfiyyətli dəstəkliyyatları nəticə edir. açıq mövzu və yaxşı kontrast ilə overlays istifadə edin. vaxt aşağı-kontrast çərçivələr yaratmaq ola bilər ki, sürətli flashing və ya aşırı parlaq dəyişiklik dəyişiklikləri ilə məhsul axtarır. taramaq ola bilər ki, hər hansı bir problemli qazanmaq üçün əvvəl tam anima dövrünü seçin.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Ardıcıl səviyyətlər arasında qarşılanan kontrast səviyyələrini göstərir',
          caption: 'Frame analizi: bütün axtarış dövründə tutarlı taramalıq doğrulamak',
        },
      ],
    },
    {
      heading: 'İqtisadiyyat və məlumatlar',
      paragraphs: ['GIF video oyunçu dəstək dəstəyi olmadan ən çox dəstək dəstəkləyir. Lakin, GIF\'nin 256-lik rəng örtükləri rəsmi qəbul edir. rəsmi animasiyalar üçün, dəstək keyfiyyətli WebP dəstəkləyir və ya yüksək keyfiyyət üçün video formatlarına geri düşür. ANQR-nin GIF qiyməti, Trate limitlərində maksimise keyfiyyətli üstünlüklərin dithering variantları daxildir.', 'Qeydiyyatdan keçmək Digital imzalama sistemləri, e-poçt müştəriləri və sosial platformalar çox ümumi limitləri təmin edir. Müəlliflikiniz bu limitlərdən çoxdursa, qanun sayı, ölçüləri və ya rəng dəyişiklikləri azaldır. Əgər bir kompleks axtarış daha qarşı bir loop hər hansı bir çərçivəsindən daha yaxşı sonuçlar verir.'],
    },
    {
      heading: 'Monitorinqinq QR kodları',
      paragraphs: ['Tədqiqasiya kodlarını test, anima dövründə bir çox xüsusiyyətdə taramaq edir. Yalnız bir çıxış etmək və uğur edərək - müxtəlif anlarda, hər hansı bir çərçivənin oxucu olduğunu doğrulamak üçün. Xüsusi diqqqoriyalar üzərində çərçivəsində səvvəl və ya aşırı səviyyəli səviyyəli səviyyəli səviyyətli səvviyyətli səviyyətli səvəllərin aşağı ola bilər.', 'Mümkün olan real ekran hardware test. Monitor rəng qaldırma, izləyir, və ümumi işıqlandırma bütün axtarış görünür və taramaları necə edir. Sizin monitor həll bir parlaq ekran üzərində yaxşı tarayan və ya oblique monitor açıqlamaq ola bilər ki, parlaq animasiya.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Müxtəlif çərçivələr, cihazlar və ekran şərtləri arasında tarama uğurlu nisbəti göstərir test matrix',
          caption: 'Animated QR test protokolu: haqqında sistemləşdirilməsi, cihazlar, və şərtlər baxmaq',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'QR nümunələrini baxın',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Yadda saxla',
      paragraphs: ['Gözəl hazırlanmış QR kodu çıxışsız daha pisdir - bu frustrates müştərilər, qablaşdırma marka algısı və onun yaradılması və paylanması hər hansı bir qurğu itirilir. Bu guide, bir QR kodu güvenilir taranacaq və ANQR-nin təhlükəsizlik xüsusiyyətlərini istehsal etməyə imkan vermək üçün texnologiya və praktik faktları daxildir.', 'QR kodu etibarlılığı ikili deyil. Bir kod tikinti telefonlarda mükəmməl tara bilər, lakin qiymət cihazlarında başarısız deyil. Bu ideal işləyə bilər, lakin dim restoranlarında və ya parlaq səyahət. Gözəllik effektivlik effektivliyini inkişaf etdirməyə kömək edir.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Digər oxumaq qeyd olunan QR kodları göstərir',
          caption: 'Skan edilə bilən spektr: güllə keçirməz kodlardan etibarlılıq həddini aşan üsluba qədər',
        },
      ],
    },
    {
      heading: 'Yadda saxla',
      paragraphs: ['QR kodları, əsasən hasar görmüş və ya qarşılaşdırılmış zaman onları oxumaq oxumaq olaraq oxumaq qırmızı dəstəyir. Q (50%), M (15%), Q (25%), və ya H (30%) - həmçinin düzgün qarşılaşdırmaq olaraq kodun neçə dəyişik ola bilər. Yüksək səviyyə düzeltmesi daha böyük kodlar yaradır, lakin overlays, çap immutions, və ekoloji sənaye.', 'Image overlays ilə kodlar üçün, hata düzeltme səviyyəsi H əsasdır - kodun fiziki qarşı hiss hiss hiss hiss hissəsi, və etibarlılığı saxlamaq üçün 30% qırmızı qırmızı lazımdır. təmizləndirilməsində təmizlənmiş kodlar, səviyyət M tez-tez. Qeydiyyat L kod ölçüsü effektivləşdirilmiş və pristine şərtlərini təmin edə bilərsiniz.'],
    },
    {
      heading: 'E-poçt ünvanı',
      paragraphs: ['Dövlət bölməsi hər bir QR kodu ərzində boş marjdır. Çaplar kodun başladığı və bitdiyi yerləşdirilməsi üçün bu limiti istifadə edin. ISO standartı 4 modulların minimum sakitli yerləşdirir ( kodun ən yaxşı kvadratın eni üç dəfə). Bu yer pozmaq - dizayn elementləri, kəslər, və ya bitişik məlumat ilə - tarama hatalarının ən çox ixtisaslarından biridir.', 'ANQR-nin sakit zövqü bu kritik spacing saxlamaq kömək edir, lakin siz də son dizaynlarda saxlanılmasını təmin etmək lazımdır. QR məhsul əlavə etdiyi zaman, açıq səyahət tələbləri göstərir. Sifarişlərdə kodlar yerləşdirilməsi zaman, bu yerdə heç bir element yoxdur. açıq yer bir neçə milimetrlər etibarlı tarama və güclü müştərilər arasında fərq deyil.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Doğru sakit zəngin zona sənaye sənaye sənaye sənaye sənaye sənaye sənaye sənaye axtarır',
          caption: 'Silent zone tələbləri: tarama uğurunu təsvir edilən görünmez marj',
        },
      ],
    },
    {
      heading: 'Kontrast və Color Təhlükəsizlik',
      paragraphs: ['QR tarayıcıları işıq və qırmızı modulları model aşkar. Bu kontrastı azaltmaq üçün hər bir stil - yerüstü, qurma fonları, gradient effektləri, və ya aşağı toopacity overlays - oxuyucu kodu daha çox edir. ANQR rəsmi seçimlərin səviyyəli səviyyətlərinə uyğun səviyyətlərini hesab edir, lakin son arbiter həmsal testdir.', 'Renk algısı işıqlandırma şərtləri ilə dəyişdirir. Sizin monitor yüksək-kontrast görünür rəng bir rəsmi birləşdirici istehsalçılıq və ya soyuq florescent borular altında ayırmaq zor ola bilər. kodunuz müxtəlif işıqlandırma şərtlərindən istifadə olunacaqsa, çox işıq məhsulları altında test və daha çox mühafizə nisbət nisbət nisbət göstərir.'],
    },
    {
      heading: 'Modul ölçüsü və görünüşü',
      paragraphs: ['Fiziki modulların fiziki ölçüsü bir kod taranmış ola bilər ki, maksimum uzaq səviyyəsini təmin edir. Kiçik modullar daha kiçik kodlar deyil, lakin daha yaxşı tarama nömrələri lazımdır. Ümumi qeyd, hər bir modul müəyyən tarama səviyyəti ən azı 0,5mm olmalıdır, daha böyük səviyyələr üçün ölçülü səvəl. Bir billboard kodu bir biznes kartında koddan çox daha böyük modullara ehtiyac verir.', 'Modul ölçüsüni hesablamaq zaman, ən yaxşı səhifəyini düşünün: yaşlı bir telefon ilə müştəri, ən yaxşı işıqlandırma, maksimum səvəl uzaq mesafede taran. Bu istifadəçi üçün dizayn və hər şey daha yaxşı bir təcrübə olacaq. ANQR-nin bu real dünya sənayesindəki xüsusiyyətləri faktoru sizin müasir istifadə etmək üçün uyğun ölçüləri təklif edir.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Modul ölçüsü, çap ölçüləri və maksimum effektiv tarama uzaq',
          caption: 'Qeydiyyatdan keçirmək: Sizin quraşdırma tərəfindən uyğun modul ölçüsü',
        },
      ],
    },
    {
      heading: 'E-poçt ünvanı',
      paragraphs: ['ANQR-nin Təhlükəsizliyi Modu, tarama etibarlılığı üzrə real vaxt verir. Bu, kontrast nisbəti, sakit zone uyğunluğu, overlay sənayesi, və digər faylları taramanability. Heç bir parametr risk səviyyətləri hər zaman, etibarlılığı necə yaxşılaşdırmaq üçün xüsusi səyahətlə uyarıları görəcəksiniz. Proqramın sürətli olduğu peşəkar təşkilatlar üçün dizayn prosesi boyunca aktivliyini saxlayın.', 'Təhlükəsizlik Modu, yaradılmış kodu və təhlükəsizliyini və ya çatışmazlığınızı kodunuzu kodlaşdırmağa çalışır. Bu in-app doğrulama hər hansı bir real dünya şəkilini reaksiya etməyəcək, çap və ya paylamaq üçün əvvəl bir çox ümumi məlumat tutur. Minimum bar kimi uğurlu təhlükəsizlik, təhlükəsizlik deyil - real dünya sınaqları əsas olmayacaq.'],
    },
    {
      heading: 'Real-World Test Protokolları',
      paragraphs: ['Proqram proqramının qiyməti fiziki sınaqdan keçir. Sertifikatınızı nümayiş edirik. Real istifadə edən işıqlandırma şərtləri ilə real quraşdırma mühitində test edin. Bir çox cihaz ilə Scan - yalnız sizin bazar telefon deyil, lakin qiymət Android cihazlar, yaşlı iPhones, və hər hansı bir xüsusi cihazlar sizin gözəl istifadə edir.', 'Testinizi sistematik birləşdirin. Cihazların test edilməsi, nə şərtlər altında, nəticələrlə. Ölçül kodları dağıtmaq varsa, qəbul ölçütlərini qəbul edin: əvvvəl cihaz test hovuzu arasında% 95 uğur dərəcəsi, və ya bütün test cihazlarında 2 saniyədə uğurlu taramalar. Bu standartların ən yaxşısını qazanmaqdan daha çox olaraq go/no-go qaydalarına kömək edir.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Ətraflı sınaqlar, şəhərlər, və qəbul ölçüləri',
          caption: 'QR quraşdırma test protokolu: istehsal təhlükəsizliyi əvvəl sistemləndirilməsi',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'İstehsalçı',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'QR nümunələrini baxın',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'QR nümunələrini baxın', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Tam User Guide Açıq', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Qalereya açın', type: 'gallery' },
  ],
};
