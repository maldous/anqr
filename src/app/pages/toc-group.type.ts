import type { TocItem } from "./toc-item.type";

export type TocGroup = {
  key: string;
  title: string;
  id?: string;
  items: TocItem[];
};
