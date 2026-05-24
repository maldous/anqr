import type { GalleryItem } from "../../apps/web/src/content/gallery/gallery-items.types";
import { buildGallerySearchParams } from "../../apps/web/src/content/gallery/build-gallery-search-params";

export function buildItemUrl(item: GalleryItem, baseUrl: string): string {
  const params = buildGallerySearchParams(item);
  return `${baseUrl}/?${params.toString()}`;
}
