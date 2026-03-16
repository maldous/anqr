import type { GalleryItem } from "./gallery-items.types";
import { GALLERY_IMAGE_PATH } from "./gallery-image-path.const";
import { getGalleryBaseUrl } from "./get-gallery-base-url";

export function getGalleryImagePath(
  item: GalleryItem,
  galleryCacheKey: string,
  formatOverride?: "png" | "gif",
): string {
  const ext = formatOverride || (item.isAnimated ? "gif" : "png");
  const encodedId = encodeURIComponent(item.id);
  const relativePath = `${GALLERY_IMAGE_PATH}/${encodedId}.${ext}`;
  const remotePath = `${getGalleryBaseUrl()}${relativePath}`;
  return `${remotePath}?v=${galleryCacheKey}`;
}
