import type { ContentType } from './content-type';

export interface ContentAnalysis {
  type: ContentType;
  raw: string;
}
