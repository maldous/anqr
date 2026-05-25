import { SECTION_KEYWORDS } from "./section-keywords.const";

type Tier = "basic" | "advanced" | "professional";
type T = (key: string, defaultValue?: string) => string;

// Read keywords for one (section, tier) pair from i18n with the
// English const as the fallback default. The pipeline that produces
// per-locale translations can override `searchKeywords.<section>.<tier>`
// with a comma-separated list in any language; until it does, English
// users see the original list and other locales also get the English
// list (better than matching nothing — a non-English user typing an
// English keyword can still find the section). See D-F1 / S10.
function loadTierKeywords(
  sectionId: string,
  tier: Tier,
  translate: T | undefined,
): string[] {
  const fallback = SECTION_KEYWORDS[sectionId]?.[tier] ?? [];
  if (!translate) return fallback;
  const fallbackJoined = fallback.join(", ");
  const translated = translate(`searchKeywords.${sectionId}.${tier}`, fallbackJoined);
  if (!translated) return fallback;
  return translated
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export function getAvailableKeywords(
  sectionId: string,
  currentTier: Tier,
  translate?: T,
): string[] {
  const basic = loadTierKeywords(sectionId, "basic", translate);
  if (currentTier === "basic") return basic;
  const withAdvanced = [...basic, ...loadTierKeywords(sectionId, "advanced", translate)];
  if (currentTier === "advanced") return withAdvanced;
  return [...withAdvanced, ...loadTierKeywords(sectionId, "professional", translate)];
}
