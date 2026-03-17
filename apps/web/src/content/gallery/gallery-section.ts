import type { GalleryCategory } from "./gallery-manifest";
import type { GalleryItem } from "./gallery-item";

export type GallerySection = {
  id: GalleryCategory;
  title: string;
  description: string;
  icon: string;
  items: GalleryItem[];
};
