import { getAvailableKeywords } from "./sidebar-keywords";
import { isSectionVisibleForTier } from "./is-section-visible-for-tier";
import type { SidebarSectionVisibility } from "./sidebar-section-visibility.types";

export function getVisibleSectionIds(
  sections: readonly SidebarSectionVisibility[],
  tier: "basic" | "advanced" | "professional",
  searchQuery: string,
  translate: (key: string) => string,
): string[] {
  return sections
    .filter((section) => {
      if (!isSectionVisibleForTier(section, tier)) return false;
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      const translatedLabel = translate(section.labelKey);
      const labelMatch = translatedLabel.toLowerCase().includes(query);
      const keywords = getAvailableKeywords(section.id, tier, translate);
      const keywordMatch = keywords.some((keyword) => keyword.toLowerCase().includes(query));
      return labelMatch || keywordMatch;
    })
    .map((section) => section.id);
}
