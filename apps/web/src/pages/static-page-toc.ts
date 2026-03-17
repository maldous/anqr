import type { PageSection } from "@/i18n/static";
import type { StaticPageType } from "./static-page-types.types";
import type { TocGroup } from "./static-page-types";
import { buildExamplesToc } from "./build-examples-toc";
import { buildGuideToc } from "./build-guide-toc";
import { buildLearnToc } from "./build-learn-toc";

export function buildToc(
  page: StaticPageType,
  sections: PageSection[],
  t: (key: string) => string,
): TocGroup[] {
  switch (page) {
    case "guide":
      return buildGuideToc(sections, t);
    case "learn":
      return buildLearnToc(sections);
    case "examples":
      return buildExamplesToc(sections);
    default:
      return [];
  }
}
