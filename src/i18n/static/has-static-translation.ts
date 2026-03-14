import { resolveLanguageCode } from './resolve-language-code';
import { supportedLanguages } from './supported-languages';

export function hasStaticTranslation(language: string): boolean {
  const resolvedLang = resolveLanguageCode(language);
  return supportedLanguages.has(resolvedLang);
}
