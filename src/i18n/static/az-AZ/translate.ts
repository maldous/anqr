import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Yadda saxla',
  description: 'Dünyadakı istifadəçilər üçün ANQR-nin əlaqədar olmasına kömək edir. Heç bir kodlama təcrübəsi tərəfindən tərəfindən tələb olunur - browserdan birbaşa kömək edir.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Qeydiyyat', type: 'external' },
    { href: '/?lang=${lang}', label: 'Generator açıq', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Əməkdaşlıq', type: 'external' },
  ],
  sections: [
    {
      heading: 'Niyə kontribute?',
      paragraphs: ['ANQR şirkətlər, hadisələr, ödənişlər və şəxsi layihələr üçün QR kodları yaratmaq üçün dünyada insanlar tərəfindən istifadə olunur. çevirilərinə əlavə etdiyiniz zaman, bu güclü alətin yerli dilini tercih etdiyi istifadəçilərdən keçirilməsinə kömək edirsiniz.', 'Hər bir çeviri əlavə - bir tipo və ya bütün dil çevirmək olsun - ictimai istifadəçilər üçün real fərq edir.'],
    },
    {
      heading: 'Yadda saxlaya bilərsiniz?',
      paragraphs: ['ANQR translatable content iki növü var:'],
      bullets: ['UI Strings: Pulsuzluq etiketləri, mentiplər, və app boyunca görünür interfeys.', 'Statik Content: Kılavuzlar, nümunələr, gizlilik siyasəti, və məhsullar daxil olmaqla dəstək.', 'Her neçə növü sizin browser birbaşa redaktə edə bilərsiniz sadə məhsullar kimi saxlanılır - heç bir xüsusi proqram lazımdır.', 'Komponentlər keyfiyyət və tutarlılığı təmin etmək üçün birləşdirilməsindən çıxarılır.'],
    },
    {
      heading: 'Contribute',
      paragraphs: ['Kontributing asan və heç bir Git məlumat lazımdır:'],
      bullets: ['GitHub-da ictimai çeviri nümunəsini ziyarət edin.', 'Dil faylını tapın (yaxırsanız yeni bir yaratmaq).', 'Sizin browser birbaşa redaktor ikon basın.', 'Sizin dəyişikliklər edin və "Propose dəyişiklikləri" baxın - GitHub avtomatik olacaq.', 'Sizin əməliyyat bir neçə gün ərzində müəyyən edilmiş və birləşmiş olacaq.'],
    },
    {
      heading: 'Tərəfdaşlar',
      paragraphs: ['When, please keep placeholders like {name}, {count}, and {{variable}}  unchanged - Bu runtime dinamik qiymətləri ilə əvvəl edilir.  Also  [[  [[  [[  [[  [[  [[  [[  [[  [[  [[  [[  [[  [[.', 'Bir çeviri haqqında emin değilseniz, yanlış bir çeviri təmin etmək istəyə daha yaxşıdır. Oxunub:.'],
    },
    {
      heading: 'İnformasiya dili',
      paragraphs: ['ANQR şu anda 40 dildə dəstəkləyir:'],
      bullets: ['Böyük Britaniya dilləri: İngilis, Çin, İspan, Ərəb, Hindi, Portuqi, Koreya, Fransız, Alman, Rusiya, və daha çox.', 'Böyük Britaniya, Filippin, Malay, Khmer, Lao, Burmese.', 'Asiya dili: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Recognition',
      paragraphs: ['Bütün iştirakçılar bizim depozitdə kredit edilir. Sizin iş müxtəlif istifadəçilərin xüsusiyyətlərindən çox istifadə edir.', 'ANQR-in dünyada xüsusiyyət göstərilməsinə kömək etmək üçün bütün çeviri səviyyələrimiz üçün təqdim edirik!'],
    },
    {
      heading: 'Tarix?',
      paragraphs: ['E-poçt ünvanı Başlamaq üçün kömək edirəm.'],
    },
  ],
};

export default translate;
