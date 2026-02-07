/**
 * Static page content loader
 * Returns page content based on current language with English fallback
 * Uses Google Play language codes for compatibility
 *
 * OPTIMIZATION: Only English is bundled. Other languages are lazy-loaded on demand.
 */

import { createLogger } from '@/lib/logger';
import type { PageDefinition, StaticPageType } from './types';

// Re-export types for convenience
export type { PageDefinition, PageImage, PageLink, PageSection, StaticPageType } from './types';

// Only import English - other languages are lazy-loaded
import * as enGB from './en-GB';

const log = createLogger('STATIC');

// Cache for loaded static content
const contentCache = new Map<string, Record<StaticPageType, PageDefinition>>();

// Pre-populate cache with English
// The module exports match the expected Record type structure
contentCache.set('en-GB', enGB);

// Use import.meta.glob for Vite to properly analyze and code-split
// Each language folder gets its own chunk
// Exclude txt/ folder (build tools) and use single-level glob to avoid matching root index.ts
const staticModules = import.meta.glob<Record<StaticPageType, PageDefinition>>(
  ['./*/index.ts', '!./txt/index.ts', '!./rm/index.ts'],
  {
    import: '*',
    eager: false,
  }
);

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

// List of supported language codes (all Google Play languages)
const supportedLanguages = new Set([
  // English variants
  'en-GB',
  'en-US',
  'en-AU',
  'en-CA',
  'en-IN',
  'en-SG',
  'en-ZA',
  // A-Z languages
  'af',
  'am',
  'ar',
  'az-AZ',
  'be',
  'bg',
  'bn-BD',
  'ca',
  'cs-CZ',
  'da-DK',
  'de-DE',
  'el-GR',
  'es-ES',
  'es-419',
  'es-US',
  'et',
  'eu-ES',
  'fa',
  'fa-AE',
  'fa-AF',
  'fa-IR',
  'fi-FI',
  'fil',
  'fr-CA',
  'fr-FR',
  'gl-ES',
  'gu',
  'hi-IN',
  'hr',
  'hu-HU',
  'hy-AM',
  'id',
  'is-IS',
  'it-IT',
  'iw-IL',
  'ja-JP',
  'ka-GE',
  'kk',
  'km-KH',
  'kn-IN',
  'ko-KR',
  'ky-KG',
  'lo-LA',
  'lt',
  'lv',
  'mk-MK',
  'ml-IN',
  'mn-MN',
  'mr-IN',
  'ms',
  'ms-MY',
  'my-MM',
  'ne-NP',
  'nl-NL',
  'no-NO',
  'pa',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'ro',
  'ru-RU',
  'si-LK',
  'sk',
  'sl',
  'sq',
  'sr',
  'sv-SE',
  'sw',
  'ta-IN',
  'te-IN',
  'th',
  'tr-TR',
  'uk',
  'ur',
  'vi',
  'zh-CN',
  'zh-HK',
  'zh-TW',
  'zu',
]);

/**
 * Resolve a language code to a supported language code
 */
function resolveLanguageCode(language: string): string {
  // Direct match
  if (supportedLanguages.has(language)) return language;

  // Try mapped code
  const mappedCode = browserToGooglePlay[language];
  if (mappedCode && supportedLanguages.has(mappedCode)) return mappedCode;

  // Try base language mapping
  const baseLanguage = language.split('-')[0];
  const mappedBase = browserToGooglePlay[baseLanguage];
  if (mappedBase && supportedLanguages.has(mappedBase)) return mappedBase;

  // Try base language direct match
  if (supportedLanguages.has(baseLanguage)) return baseLanguage;

  // Fallback to English
  return 'en-GB';
}

/**
 * Lazy load static content for a language
 * Vite will code-split these into separate chunks
 */
async function loadLanguageContent(lang: string): Promise<Record<StaticPageType, PageDefinition>> {
  // Check cache first
  const cached = contentCache.get(lang);
  if (cached) {
    return cached;
  }

  try {
    // Use the glob-imported modules for proper Vite code-splitting
    const modulePath = `./${lang}/index.ts`;
    const loader = staticModules[modulePath];

    if (!loader) {
      log.warn('No static content module found', { lang });
      const fallback = contentCache.get('en-GB');
      if (!fallback) {
        throw new Error('English fallback content not loaded');
      }
      return fallback;
    }

    const content = await loader();
    contentCache.set(lang, content);
    return content;
  } catch (error) {
    log.error('Failed to load static content', { lang, error });
    // Fall back to English
    const fallback = contentCache.get('en-GB');
    if (!fallback) throw new Error('English fallback not available');
    return fallback;
  }
}

/**
 * Get static page content for a given language and page type (async)
 * Falls back to English if translation not available
 */
export async function getStaticContentAsync(
  language: string,
  page: StaticPageType
): Promise<PageDefinition> {
  const resolvedLang = resolveLanguageCode(language);
  const content = await loadLanguageContent(resolvedLang);
  const englishFallback = contentCache.get('en-GB');
  return content[page] || (englishFallback ? englishFallback[page] : content[page]);
}

/**
 * Get static page content synchronously (only works for cached/English content)
 * Use getStaticContentAsync for full language support
 * @deprecated Use getStaticContentAsync instead for proper lazy loading
 */
export function getStaticContent(language: string, page: StaticPageType): PageDefinition {
  const resolvedLang = resolveLanguageCode(language);

  // Return cached content if available
  const cached = contentCache.get(resolvedLang);
  if (cached) {
    return cached[page];
  }

  // Trigger async load for next time (fire and forget)
  loadLanguageContent(resolvedLang);

  // Return English as fallback for immediate render
  const englishFallback = contentCache.get('en-GB');
  if (!englishFallback) throw new Error('English fallback not available');
  return englishFallback[page];
}

/**
 * Preload static content for a language (call this when language changes)
 */
export async function preloadStaticContent(language: string): Promise<void> {
  const resolvedLang = resolveLanguageCode(language);
  if (!contentCache.has(resolvedLang)) {
    await loadLanguageContent(resolvedLang);
  }
}

/**
 * Check if a language has translations available
 */
export function hasStaticTranslation(language: string): boolean {
  const resolvedLang = resolveLanguageCode(language);
  return supportedLanguages.has(resolvedLang);
}
