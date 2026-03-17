import type { PageSection } from "@/i18n/static";
import type { TocGroup } from "./static-page-types";

export function buildLearnToc(sections: PageSection[]): TocGroup[] {
  const groups: TocGroup[] = [];
  const guideStartIndices = new Set([0, 7, 13, 19, 26]);

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;

    if (guideStartIndices.has(index)) {
      groups.push({ key: `learn-${groups.length}`, title: section.heading, id, items: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].items.push({ id, title: section.heading });
    }
  }

  return groups.filter((group) => group.items.length > 0);
}
