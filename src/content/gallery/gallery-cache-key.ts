import { hashFnv1a } from './gallery-hash';
import type { GallerySection } from './gallery-items.types';

export function buildGalleryCacheKey(sections: GallerySection[]): string {
  const seed = sections
    .map(
      (section) =>
        `${section.id}:${section.items
          .map((item) => `${item.id}.${item.isAnimated ? 'gif' : 'png'}`)
          .join(',')}`
    )
    .join('|');
  return hashFnv1a(seed);
}
