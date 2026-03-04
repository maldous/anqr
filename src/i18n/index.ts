/**
 * i18n Configuration
 *
 * Internationalization setup using react-i18next
 * Uses Google Play language codes for compatibility
 *
 * OPTIMIZATION: Only English is bundled. Other locales are lazy-loaded on demand.
 */

import { Capacitor } from '@capacitor/core';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { createLogger } from '@/lib/logger';

// Only import English - other locales are lazy-loaded
import en from './locales/en-GB.json';

const log = createLogger('I18N');

// Language metadata for the selector - using Google Play language codes
// Authoritative list of all Google Play supported languages (86 locales)
export const languages = [
  // Primary languages
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧', rtl: false },
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English', flag: '🇦🇺', rtl: false },
  { code: 'en-CA', name: 'English (Canada)', nativeName: 'English', flag: '🇨🇦', rtl: false },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English', flag: '🇮🇳', rtl: false },
  { code: 'en-SG', name: 'English (Singapore)', nativeName: 'English', flag: '🇸🇬', rtl: false },
  { code: 'en-ZA', name: 'English (South Africa)', nativeName: 'English', flag: '🇿🇦', rtl: false },
  // A-Z languages
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', rtl: false },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'az-AZ', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿', rtl: false },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾', rtl: false },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', rtl: false },
  { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸', rtl: false },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', rtl: false },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', rtl: false },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  {
    code: 'es-419',
    name: 'Spanish (Latin America)',
    nativeName: 'Español',
    flag: '🌎',
    rtl: false,
  },
  { code: 'es-US', name: 'Spanish (US)', nativeName: 'Español', flag: '🇺🇸', rtl: false },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪', rtl: false },
  { code: 'eu-ES', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸', rtl: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'fa-AE', name: 'Persian (UAE)', nativeName: 'فارسی', flag: '🇦🇪', rtl: true },
  { code: 'fa-AF', name: 'Persian (Afghanistan)', nativeName: 'فارسی', flag: '🇦🇫', rtl: true },
  { code: 'fa-IR', name: 'Persian (Iran)', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', rtl: false },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français', flag: '🇨🇦', rtl: false },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'gl-ES', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸', rtl: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', rtl: false },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', rtl: false },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', rtl: false },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', rtl: false },
  { code: 'hy-AM', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', rtl: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
  { code: 'is-IS', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸', rtl: false },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
  { code: 'iw-IL', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'ka-GE', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', rtl: false },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ', flag: '🇰🇿', rtl: false },
  { code: 'km-KH', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭', rtl: false },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', rtl: false },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
  { code: 'ky-KG', name: 'Kyrgyz', nativeName: 'Кыргызча', flag: '🇰🇬', rtl: false },
  { code: 'lo-LA', name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦', rtl: false },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', rtl: false },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', rtl: false },
  { code: 'mk-MK', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰', rtl: false },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', rtl: false },
  { code: 'mn-MN', name: 'Mongolian', nativeName: 'Монгол', flag: '🇲🇳', rtl: false },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', rtl: false },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
  { code: 'ms-MY', name: 'Malay (Malaysia)', nativeName: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
  { code: 'my-MM', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲', rtl: false },
  { code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', rtl: false },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', rtl: false },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flag: '🇧🇷', rtl: false },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', flag: '🇵🇹', rtl: false },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', rtl: false },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', rtl: false },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', rtl: false },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮', rtl: false },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱', rtl: false },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', rtl: false },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', rtl: false },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', rtl: false },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', rtl: false },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
  { code: 'zh-HK', name: 'Chinese (Hong Kong)', nativeName: '繁體中文', flag: '🇭🇰', rtl: false },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', rtl: false },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', rtl: false },
] as const;

/**
 * Check if a language code is RTL
 */
export function isRtlLanguage(langCode: string): boolean {
  // Check exact match first, then base language
  const lang =
    languages.find((l) => l.code === langCode) ||
    languages.find((l) => l.code === langCode.split('-')[0]);
  return lang?.rtl ?? false;
}

export type LanguageCode = (typeof languages)[number]['code'];

// Initial resources - only English bundled, others lazy-loaded
const resources: Record<string, { translation: Record<string, unknown> }> = {
  'en-GB': { translation: en },
};

// List of supported language codes for detection
const supportedLngs: string[] = languages.map((l) => l.code);

// Share locale payloads for variants that currently have identical translations.
// This keeps language selection intact while avoiding duplicate emitted locale chunks.
const LOCALE_ALIASES: Record<string, string> = {
  'en-AU': 'en-US',
  'en-CA': 'en-US',
  'en-IN': 'en-US',
  'en-SG': 'en-US',
  'en-ZA': 'en-US',
  'fa-AE': 'fa',
  'fa-IR': 'fa',
};

// Track which locales have been loaded
const loadedLocales = new Set<string>(['en-GB']);

// Track which font scripts have been loaded (to avoid duplicate link tags)
const loadedFontScripts = new Set<string>(['latin']);
const isNativePlatform = Capacitor.isNativePlatform();

// Use Vite glob loading so unsupported locales can be excluded from emitted chunks.
const localeModules = import.meta.glob<Record<string, unknown>>(
  [
    './locales/*.json',
    '!./locales/en-GB.json',
    '!./locales/rm.json',
    '!./locales/en-AU.json',
    '!./locales/en-CA.json',
    '!./locales/en-IN.json',
    '!./locales/en-SG.json',
    '!./locales/en-ZA.json',
    '!./locales/fa-AE.json',
    '!./locales/fa-IR.json',
  ],
  {
    import: 'default',
    eager: false,
  }
);

/**
 * Font script mapping for languages that require non-Latin fonts
 * Maps language codes to Google Fonts family names
 * Latin-based languages don't need additional fonts (already loaded in index.html)
 */
const LANGUAGE_FONT_MAP: Record<string, string> = {
  // Devanagari script (Hindi, Marathi, Nepali)
  'hi-IN': 'Noto+Sans+Devanagari',
  'mr-IN': 'Noto+Sans+Devanagari',
  'ne-NP': 'Noto+Sans+Devanagari',
  // Chinese
  'zh-CN': 'Noto+Sans+SC',
  'zh-HK': 'Noto+Sans+TC',
  'zh-TW': 'Noto+Sans+TC',
  // Tamil
  'ta-IN': 'Noto+Sans+Tamil',
  // Thai
  th: 'Noto+Sans+Thai',
  // Bengali
  'bn-BD': 'Noto+Sans+Bengali',
  // Telugu
  'te-IN': 'Noto+Sans+Telugu',
  // Kannada
  'kn-IN': 'Noto+Sans+Kannada',
  // Malayalam
  'ml-IN': 'Noto+Sans+Malayalam',
  // Gujarati
  gu: 'Noto+Sans+Gujarati',
  // Punjabi (Gurmukhi script)
  pa: 'Noto+Sans+Gurmukhi',
  // Japanese
  'ja-JP': 'Noto+Sans+JP',
  // Korean
  'ko-KR': 'Noto+Sans+KR',
  // Arabic script (Arabic, Persian, Urdu)
  ar: 'Noto+Sans+Arabic',
  fa: 'Noto+Sans+Arabic',
  'fa-AE': 'Noto+Sans+Arabic',
  'fa-AF': 'Noto+Sans+Arabic',
  'fa-IR': 'Noto+Sans+Arabic',
  ur: 'Noto+Sans+Arabic',
  // Hebrew
  'iw-IL': 'Noto+Sans+Hebrew',
  // Armenian
  'hy-AM': 'Noto+Sans+Armenian',
  // Georgian
  'ka-GE': 'Noto+Sans+Georgian',
  // Khmer
  'km-KH': 'Noto+Sans+Khmer',
  // Lao
  'lo-LA': 'Noto+Sans+Lao',
  // Myanmar/Burmese
  'my-MM': 'Noto+Sans+Myanmar',
  // Sinhala
  'si-LK': 'Noto+Sans+Sinhala',
  // Amharic (Ethiopic script)
  am: 'Noto+Sans+Ethiopic',
};

/**
 * Dynamically load a Google Font for a specific script
 * This reduces initial page load by ~110KB for most users
 */
function loadFontForLanguage(lang: string): void {
  if (isNativePlatform) return;

  const fontFamily = LANGUAGE_FONT_MAP[lang];
  if (!fontFamily) return; // Latin-based language, no extra font needed

  // Don't load the same font twice
  if (loadedFontScripts.has(fontFamily)) return;
  loadedFontScripts.add(fontFamily);

  // Create and inject the stylesheet link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);

  log.debug('Loaded font', { fontFamily, lang });
}

/**
 * Lazy load a locale on demand
 * This significantly reduces initial bundle size by ~1.5MB
 */
export async function loadLocale(lang: string): Promise<void> {
  if (loadedLocales.has(lang)) return;

  try {
    const sourceLang = LOCALE_ALIASES[lang] ?? lang;

    // If the source locale is already loaded, reuse it for the alias.
    if (loadedLocales.has(sourceLang)) {
      const cachedData = i18n.getResourceBundle(sourceLang, 'translation');
      if (cachedData) {
        i18n.addResourceBundle(lang, 'translation', cachedData, true, true);
      }
      loadedLocales.add(lang);
      return;
    }

    const modulePath = `./locales/${sourceLang}.json`;
    const loader = localeModules[modulePath];
    if (!loader) {
      throw new Error(`Locale module not found for ${sourceLang}`);
    }
    const localeData = await loader();
    i18n.addResourceBundle(sourceLang, 'translation', localeData, true, true);
    loadedLocales.add(sourceLang);
    if (lang !== sourceLang) {
      i18n.addResourceBundle(lang, 'translation', localeData, true, true);
    }
    loadedLocales.add(lang);
  } catch (error) {
    log.error('Failed to load locale', { lang, error });
    // Fall back to English if locale fails to load
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-GB',
    supportedLngs,
    // Don't strip region codes - we need them for Google Play compatibility
    load: 'currentOnly',
    debug: false, // Disable debug logging in all environments

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Check localStorage first (user's previous choice), then browser language
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'anqr-language',
      // Map browser language codes to our supported codes
      convertDetectedLanguage: (lng: string) => {
        // Direct match
        if (supportedLngs.includes(lng)) return lng;

        // Map common browser codes to our Google Play codes
        const browserToGooglePlay: Record<string, string> = {
          // English variants
          en: 'en-GB',
          // Base language mappings
          hi: 'hi-IN',
          zh: 'zh-CN',
          ta: 'ta-IN',
          pt: 'pt-BR',
          tl: 'fil',
          ja: 'ja-JP',
          ko: 'ko-KR',
          es: 'es-ES',
          'es-MX': 'es-419',
          'es-AR': 'es-419',
          ru: 'ru-RU',
          te: 'te-IN',
          mr: 'mr-IN',
          bn: 'bn-BD',
          'bn-IN': 'bn-BD',
          kn: 'kn-IN',
          ml: 'ml-IN',
          // Regional mappings
          az: 'az-AZ',
          cs: 'cs-CZ',
          da: 'da-DK',
          de: 'de-DE',
          el: 'el-GR',
          eu: 'eu-ES',
          fi: 'fi-FI',
          fr: 'fr-FR',
          gl: 'gl-ES',
          he: 'iw-IL',
          hu: 'hu-HU',
          hy: 'hy-AM',
          is: 'is-IS',
          it: 'it-IT',
          ka: 'ka-GE',
          km: 'km-KH',
          ky: 'ky-KG',
          lo: 'lo-LA',
          mk: 'mk-MK',
          mn: 'mn-MN',
          my: 'my-MM',
          ne: 'ne-NP',
          nl: 'nl-NL',
          no: 'no-NO',
          nb: 'no-NO',
          nn: 'no-NO',
          pl: 'pl-PL',
          si: 'si-LK',
          sv: 'sv-SE',
          tr: 'tr-TR',
        };

        if (browserToGooglePlay[lng]) return browserToGooglePlay[lng];

        // Try base language match
        const baseLang = lng.split('-')[0];
        if (browserToGooglePlay[baseLang]) return browserToGooglePlay[baseLang];

        // Check if base language is directly supported
        if (supportedLngs.includes(baseLang)) return baseLang;

        return 'en-GB';
      },
    },
  });

// Listen for language changes and lazy-load locales + fonts
i18n.on('languageChanged', async (lng) => {
  if (!loadedLocales.has(lng)) {
    await loadLocale(lng);
  }
  // Load script-specific font if needed (non-blocking)
  loadFontForLanguage(lng);
});

// Pre-load detected language if not English
const detectedLang = i18n.language;
if (detectedLang && detectedLang !== 'en-GB' && !loadedLocales.has(detectedLang)) {
  loadLocale(detectedLang);
  // Also pre-load the font for the detected language
  loadFontForLanguage(detectedLang);
}

export default i18n;
