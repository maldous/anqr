import type { SidebarSectionVisibility } from "./sidebar-section-visibility.types";

export function isSectionVisibleForTier(
  section: SidebarSectionVisibility,
  tier: string,
): boolean {
  if (section.tier === "basic") return true;
  if (section.tier === "advanced") return tier === "advanced" || tier === "professional";
  return tier === "professional";
}
