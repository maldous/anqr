import { SECTION_KEYWORDS } from "./section-keywords.const";

export function getAvailableKeywords(
  sectionId: string,
  currentTier: "basic" | "advanced" | "professional",
): string[] {
  const keywords = SECTION_KEYWORDS[sectionId];
  if (!keywords) return [];
  let available = [...keywords.basic];
  if (currentTier !== "basic") available = [...available, ...keywords.advanced];
  if (currentTier === "professional") available = [...available, ...keywords.professional];
  return available;
}
