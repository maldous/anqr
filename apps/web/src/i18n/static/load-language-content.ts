import { createLogger } from "@/lib/logger";
import { contentCache } from "./static-content-cache";
import { staticModules } from "./static-modules";
import type { PageDefinition, StaticPageType } from "./types";

const log = createLogger("STATIC");

export async function loadLanguageContent(
  lang: string,
): Promise<Record<StaticPageType, PageDefinition>> {
  const cached = contentCache.get(lang);
  if (cached) {
    return cached;
  }

  try {
    const modulePath = `./${lang}/index.ts`;
    const loader = staticModules[modulePath];

    if (!loader) {
      log.warn("No static content module found", { lang });
      const fallback = contentCache.get("en-GB");
      if (!fallback) {
        throw new Error("English fallback content not loaded");
      }
      return fallback;
    }

    const content = await loader();
    contentCache.set(lang, content);
    return content;
  } catch (error) {
    log.error("Failed to load static content", { lang, error });
    const fallback = contentCache.get("en-GB");
    if (!fallback) throw new Error("English fallback not available");
    return fallback;
  }
}
