import { browserToGooglePlay } from "./browser-to-google-play";
import { STATIC_LANGUAGE_ALIASES } from "./static-language-aliases";
import { supportedLanguages } from "./supported-languages";

export function resolveLanguageCode(language: string): string {
  const resolveAlias = (code: string): string => STATIC_LANGUAGE_ALIASES[code] ?? code;

  if (supportedLanguages.has(language)) return resolveAlias(language);

  const mappedCode = browserToGooglePlay[language];
  if (mappedCode && supportedLanguages.has(mappedCode)) return resolveAlias(mappedCode);

  const baseLanguage = language.split("-")[0];
  const mappedBase = browserToGooglePlay[baseLanguage];
  if (mappedBase && supportedLanguages.has(mappedBase)) return resolveAlias(mappedBase);

  if (supportedLanguages.has(baseLanguage)) return resolveAlias(baseLanguage);

  return "en-GB";
}
