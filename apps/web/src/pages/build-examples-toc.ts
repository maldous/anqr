import type { PageSection } from "../i18n/static";
import type { TocGroup } from "./static-page-types";

export function buildExamplesToc(sections: PageSection[]): TocGroup[] {
  const groups: TocGroup[] = [];
  const exampleStartIndices = new Set([0, 5, 10, 15, 20]);

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;

    if (exampleStartIndices.has(index)) {
      groups.push({ key: `example-${groups.length}`, title: section.heading, id, items: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].items.push({ id, title: section.heading });
    }
  }

  return groups.filter((group) => group.items.length > 0);
}
