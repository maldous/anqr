import type { GalleryCategory } from '@/content/gallery/gallery-items';

export interface GalleryProps {
  readonly filter: GalleryCategory | 'all';
}
