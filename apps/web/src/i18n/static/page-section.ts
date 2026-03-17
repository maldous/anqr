import type { PageImage } from "./page-image";
import type { PageLink } from "./page-link";

export type PageSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  images?: PageImage[];
  links?: PageLink[];
};
