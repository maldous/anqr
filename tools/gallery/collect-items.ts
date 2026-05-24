import type { GalleryItem } from "../../apps/web/src/content/gallery/gallery-items.types";
import { generatedGallerySections } from "../../apps/web/src/content/generated/gallery-showcase.generated";

export function collectItems(only?: string[]): GalleryItem[] {
  const items: GalleryItem[] = [];
  for (const section of generatedGallerySections as unknown as Array<{ items: GalleryItem[] }>) {
    for (const item of section.items) items.push(item);
  }
  return only ? items.filter((it) => only.includes(it.id)) : items;
}
