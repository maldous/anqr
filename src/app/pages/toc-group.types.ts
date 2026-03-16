import type { TocItem } from "./toc-item.types";

export type TocGroup = {
  key: string;
  title: string;
  id?: string;
  items: TocItem[];
};
