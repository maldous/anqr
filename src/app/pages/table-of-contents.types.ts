import type { TocGroup } from "./static-page-types";

export type TableOfContentsProps = Readonly<{
  groups: TocGroup[];
  activeSlug: string;
  onNavigate: (slug: string) => void;
  onClose: () => void;
  isOpen: boolean;
  t: (key: string) => string;
}>;
