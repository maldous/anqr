import type { PageLink } from "./page-link";
import type { PageSection } from "./page-section";

export type PageDefinition = {
  title: string;
  description: string;
  lastUpdated?: string;
  breadcrumb?: string[];
  primaryLinks?: PageLink[];
  sections: PageSection[];
  relatedLinks?: PageLink[];
};
