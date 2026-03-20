import { i18n, loadLocale } from ".";
import { loadFontForLanguage } from "./load-font-for-language";

export async function preloadDetectedLocale(): Promise<void> {
  const detectedLang = i18n.language;
  if (!detectedLang || detectedLang === "en-GB") {
    return;
  }

  await loadLocale(detectedLang);
  loadFontForLanguage(detectedLang);
}
