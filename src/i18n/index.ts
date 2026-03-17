/**
 * i18n Configuration
 *
 * Internationalization setup using react-i18next
 * Uses Google Play language codes for compatibility
 *
 * OPTIMIZATION: Only English is bundled. Other locales are lazy-loaded on demand.
 */

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { createLogger } from "@/infra/logging/logger";
import { BROWSER_TO_GOOGLE_PLAY } from "./browser-language-map";
import { languages } from "./languages";
import { loadFontForLanguage } from "./load-font-for-language";
import { LOCALE_ALIASES } from "./locale-aliases";
import { resources } from "./resources";

const log = createLogger("I18N");
export { languages } from "./languages";
export type { LanguageCode } from "./language-code";
export { isRtlLanguage } from "./is-rtl-language";

// List of supported language codes for detection
const supportedLngs: string[] = languages.map((l) => l.code);

// Share locale payloads for variants that currently have identical translations.
// This keeps language selection intact while avoiding duplicate emitted locale chunks.
// Track which locales have been loaded
const loadedLocales = new Set<string>(["en-GB"]);

// Use Vite glob loading so unsupported locales can be excluded from emitted chunks.
const localeModules = import.meta.glob<Record<string, unknown>>(
  [
    "./locales/*.json",
    "!./locales/en-GB.json",
    "!./locales/rm.json",
    "!./locales/en-AU.json",
    "!./locales/en-CA.json",
    "!./locales/en-IN.json",
    "!./locales/en-SG.json",
    "!./locales/en-ZA.json",
    "!./locales/fa-AE.json",
    "!./locales/fa-IR.json",
  ],
  {
    import: "default",
    eager: false,
  },
);

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
      const cachedData = i18n.getResourceBundle(sourceLang, "translation");
      if (cachedData) {
        i18n.addResourceBundle(lang, "translation", cachedData, true, true);
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
    i18n.addResourceBundle(sourceLang, "translation", localeData, true, true);
    loadedLocales.add(sourceLang);
    if (lang !== sourceLang) {
      i18n.addResourceBundle(lang, "translation", localeData, true, true);
    }
    loadedLocales.add(lang);
  } catch (error) {
    log.error("Failed to load locale", { lang, error });
    // Fall back to English if locale fails to load
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en-GB",
    supportedLngs,
    // Don't strip region codes - we need them for Google Play compatibility
    load: "currentOnly",
    debug: false, // Disable debug logging in all environments

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Check localStorage first (user's previous choice), then browser language
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "anqr-language",
      // Map browser language codes to our supported codes
      convertDetectedLanguage: (lng: string) => {
        // Direct match
        if (supportedLngs.includes(lng)) return lng;

        // Map common browser codes to our Google Play codes
        if (BROWSER_TO_GOOGLE_PLAY[lng]) return BROWSER_TO_GOOGLE_PLAY[lng];

        // Try base language match
        const baseLang = lng.split("-")[0];
        if (BROWSER_TO_GOOGLE_PLAY[baseLang]) return BROWSER_TO_GOOGLE_PLAY[baseLang];

        // Check if base language is directly supported
        if (supportedLngs.includes(baseLang)) return baseLang;

        return "en-GB";
      },
    },
  });

// Listen for language changes and lazy-load locales + fonts
i18n.on("languageChanged", async (lng) => {
  if (!loadedLocales.has(lng)) {
    await loadLocale(lng);
  }
  // Load script-specific font if needed (non-blocking)
  loadFontForLanguage(lng);
});

// Pre-load detected language if not English
const detectedLang = i18n.language;
if (detectedLang && detectedLang !== "en-GB" && !loadedLocales.has(detectedLang)) {
  await loadLocale(detectedLang);
  loadFontForLanguage(detectedLang);
}

export { default as i18n } from "i18next";
