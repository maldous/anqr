import { isSectionVisibleForTier } from "./is-section-visible-for-tier";
import type { SidebarSectionVisibility } from "./sidebar-section-visibility.types";

export function filterStillVisibleSections(
  sections: readonly SidebarSectionVisibility[],
  prev: string[],
  tier: "basic" | "advanced" | "professional",
): string[] {
  const stillVisible = prev.filter((sectionId) => {
    const section = sections.find((candidate) => candidate.id === sectionId);
    return section ? isSectionVisibleForTier(section, tier) : false;
  });
  return stillVisible.length > 0 ? stillVisible : ["payload"];
}
