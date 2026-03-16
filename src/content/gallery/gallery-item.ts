import type { GalleryCategory } from "@/content/gallery/gallery-manifest";

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  params: Record<string, string | number | boolean>;
  isAnimated?: boolean;
};
