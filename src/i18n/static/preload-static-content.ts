import { contentCache } from './static-content-cache';
import { loadLanguageContent } from './load-language-content';
import { resolveLanguageCode } from './resolve-language-code';

export async function preloadStaticContent(language: string): Promise<void> {
  const resolvedLang = resolveLanguageCode(language);

  if (!contentCache.has(resolvedLang)) {
    await loadLanguageContent(resolvedLang);
  }
}
