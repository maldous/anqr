import { describe, expect, it } from 'vitest';
import { isRtlLanguage, languages, loadLocale } from '../../src/i18n';
import {
  getStaticContent,
  getStaticContentAsync,
  hasStaticTranslation,
  preloadStaticContent,
} from '../../src/i18n/static';

describe('i18n runtime', () => {
  it('exposes language metadata and rtl resolution', () => {
    expect(languages.length).toBeGreaterThan(20);
    expect(isRtlLanguage('ar')).toBe(true);
    expect(isRtlLanguage('iw-IL')).toBe(true);
    expect(isRtlLanguage('en-GB')).toBe(false);
    expect(isRtlLanguage('unknown-language')).toBe(false);
  });

  it('loadLocale resolves gracefully for unknown locale', async () => {
    await expect(loadLocale('xx-XX')).resolves.toBeUndefined();
  });
});

describe('static i18n content', () => {
  it('returns english fallback for unsupported language codes', () => {
    const about = getStaticContent('xx-XX', 'about');
    expect(about).toBeDefined();
    expect(about.title).toBeTypeOf('string');
    expect(about.sections.length).toBeGreaterThan(0);
  });

  it('supports sync and async fetch paths', async () => {
    const syncGuide = getStaticContent('en-GB', 'guide');
    const asyncGuide = await getStaticContentAsync('en-GB', 'guide');
    expect(asyncGuide.title).toBe(syncGuide.title);
  });

  it('preload and availability checks behave consistently', async () => {
    expect(hasStaticTranslation('en-GB')).toBe(true);
    // Unknown codes resolve to English fallback, so availability remains true.
    expect(hasStaticTranslation('zz-ZZ')).toBe(true);
    await expect(preloadStaticContent('en-GB')).resolves.toBeUndefined();
    await expect(preloadStaticContent('zz-ZZ')).resolves.toBeUndefined();
  });
});
