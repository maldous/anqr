import type { ContentType } from "./content.types";

export interface ContentAnalysis {
  type: ContentType;
  raw: string;
}
