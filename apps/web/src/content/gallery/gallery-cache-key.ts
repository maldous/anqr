import { hashFnv1a } from "./gallery-hash";
import type { GallerySection } from "./gallery-items.types";

export function buildGalleryCacheKey(sections: GallerySection[]): string {
  // Thumbnails are now uniformly PNG (prerendered from the client renderer);
  // see tools/gallery/prerender-gallery-thumbs.ts. The seed is also tagged
  // "v2" so a stale Netlify edge cache from the .gif era gets bypassed.
  const seed = sections
    .map((section) => {
      const items = section.items.map((item) => `${item.id}.png`).join(",");
      return `${section.id}:${items}`;
    })
    .join("|");
  return hashFnv1a(`v2|${seed}`);
}
