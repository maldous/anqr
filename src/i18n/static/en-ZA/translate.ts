import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Help Translate ANQR',
  description: 'Join our community of translators helping make ANQR accessible to users worldwide. No coding experience required - contribute directly from your browser.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Open Translation Repository', type: 'external' },
    { href: '/?lang=${lang}', label: 'Open the Generator', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'About ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contact Us', type: 'external' },
  ],
  sections: [
    {
      heading: 'Why Contribute?',
      paragraphs: ['ANQR is used by people around the world to create QR codes for businesses, events, payments, and personal projects. By contributing translations, you help make this powerful tool accessible to users who prefer their native language.', 'Every translation contribution - whether fixing a typo or translating an entire language - makes a real difference for users in your community.'],
    },
    {
      heading: 'What Can You Translate?',
      paragraphs: ['ANQR has two types of translatable content:'],
      bullets: ['UI Strings: Button labels, menu items, tooltips, and interface text that appears throughout the app.', 'Static Content: Documentation pages including guides, examples, privacy policy, and help articles.', 'Both types are stored as simple text files that you can edit directly in your browser - no special software needed.', 'Translations are reviewed before being merged to ensure quality and consistency.'],
    },
    {
      heading: 'How to Contribute',
      paragraphs: ['Contributing is easy and requires no Git knowledge:'],
      bullets: ['Visit our public translation repository on GitHub.', 'Find your language file (or create a new one if your language is not yet supported).', 'Click the pencil icon to edit directly in your browser.', 'Make your changes and click "Propose changes" - GitHub will automatically create a pull request.', 'Your contribution will be reviewed and merged, typically within a few days.'],
    },
    {
      heading: 'Translation Guidelines',
      paragraphs: ['When translating, please keep placeholders like {name}, {count}, and {{variable}} unchanged - these are replaced with dynamic values at runtime. Also preserve any HTML-like syntax such as links in the format [[/path|Label]].', 'If you are unsure about a translation, it is better to leave it in English than to provide an incorrect translation. You can also open an issue on GitHub to ask for clarification.'],
    },
    {
      heading: 'Currently Supported Languages',
      paragraphs: ['ANQR currently supports over 40 languages, including:'],
      bullets: ['Major world languages: English, Chinese, Spanish, Arabic, Hindi, Portuguese, Japanese, Korean, French, German, Russian, and more.', 'Southeast Asian languages: Thai, Vietnamese, Indonesian, Filipino, Malay, Khmer, Lao, Burmese.', 'South Asian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Recognition',
      paragraphs: ['All contributors are credited in our repository. Your work helps thousands of users access ANQR in their preferred language.', 'Thank you to all our translation contributors for helping make ANQR accessible worldwide!'],
    },
    {
      heading: 'Questions?',
      paragraphs: ['If you have questions about contributing translations, please open an issue on our GitHub repository or contact us via email. We are happy to help you get started.'],
    },
  ],
};

export default translate;
