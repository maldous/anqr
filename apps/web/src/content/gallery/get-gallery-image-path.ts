import type { GalleryItem } from "./gallery-items.types";
import { GALLERY_IMAGE_PATH } from "./gallery-image-path.const";
import { getGalleryBaseUrl } from "./get-gallery-base-url";

export function getGalleryImagePath(
  item: GalleryItem,
  galleryCacheKey: string,
  formatOverride: "png" | "gif" = "png",
): string {
  // Thumbnails are prerendered as PNG from the client renderer
  // (see tools/gallery/prerender-gallery-thumbs.ts). isAnimated still
  // describes the *item* (animation params present) but the thumbnail is
  // always a single canvas-equivalent frame, matching click-through.
  const encodedId = encodeURIComponent(item.id);
  const relativePath = `${GALLERY_IMAGE_PATH}/${encodedId}.${formatOverride}`;
  const remotePath = `${getGalleryBaseUrl()}${relativePath}`;
  return `${remotePath}?v=${galleryCacheKey}`;
}
