import type { GalleryItem } from "./gallery-items.types";
import { buildGallerySearchParams } from "./build-gallery-search-params";

export function buildGalleryUrl(item: GalleryItem): string {
  const params = buildGallerySearchParams(item);
  return `/?${params.toString()}`;
}
