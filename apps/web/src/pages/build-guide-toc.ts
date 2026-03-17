import type { PageSection } from "../i18n/static";
import type { TocGroup } from "./static-page-types";

export function buildGuideToc(sections: PageSection[], t: (key: string) => string): TocGroup[] {
  const groups: TocGroup[] = [
    { key: "guide-0", title: t("nav.guide"), id: "", items: [] },
    { key: "guide-1", title: t("tiers.basic"), id: "", items: [] },
    { key: "guide-2", title: t("tiers.advanced"), id: "", items: [] },
    { key: "guide-3", title: t("tiers.professional"), id: "", items: [] },
    { key: "guide-4", title: "API", id: "", items: [] },
    { key: "guide-5", title: t("payload.other"), id: "", items: [] },
  ];

  const getGroupIndex = (sectionIndex: number): number => {
    if (sectionIndex <= 1) return 0;
    if (sectionIndex <= 4) return 1;
    if (sectionIndex <= 40) return 2;
    if (sectionIndex <= 56) return 3;
    if (sectionIndex <= 69) return 4;
    return 5;
  };

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;
    const groupIndex = getGroupIndex(index);
    if (!groups[groupIndex].id) {
      groups[groupIndex].id = id;
    }
    groups[groupIndex].items.push({ id, title: section.heading });
  }

  return groups.filter((group) => group.items.length > 0);
}
