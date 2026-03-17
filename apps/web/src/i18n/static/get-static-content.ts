import type { PageDefinition, StaticPageType } from "./types";
import { contentCache } from "./static-content-cache";
import { loadLanguageContent } from "./load-language-content";
import { resolveLanguageCode } from "./resolve-language-code";

export function getStaticContent(language: string, page: StaticPageType): PageDefinition {
  const resolvedLang = resolveLanguageCode(language);
  const cached = contentCache.get(resolvedLang);

  if (cached) {
    return cached[page];
  }

  loadLanguageContent(resolvedLang);

  const englishFallback = contentCache.get("en-GB");
  if (!englishFallback) {
    throw new Error("English fallback not available");
  }

  return englishFallback[page];
}
