import type { PageDefinition, StaticPageType } from "./types";
import { contentCache } from "./static-content-cache";
import { loadLanguageContent } from "./load-language-content";
import { resolveLanguageCode } from "./resolve-language-code";

export async function getStaticContentAsync(
  language: string,
  page: StaticPageType,
): Promise<PageDefinition> {
  const resolvedLang = resolveLanguageCode(language);
  const content = await loadLanguageContent(resolvedLang);
  const englishFallback = contentCache.get("en-GB");
  return content[page] || (englishFallback ? englishFallback[page] : content[page]);
}
