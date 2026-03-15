import type { GalleryItem } from './gallery-items.types';
import { getGalleryBaseUrl } from './get-gallery-base-url';

export function buildGallerySearchParams(item: GalleryItem): URLSearchParams {
  const baseUrl = getGalleryBaseUrl();
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(item.params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if ((key === 'fg' || key === 'bg') && typeof value === 'string') {
      params.set(key, value.replace('#', ''));
    } else if (key === 'img' && typeof value === 'string' && value.startsWith('/')) {
      params.set(key, `${baseUrl}${value}`);
    } else {
      params.set(key, String(value));
    }
  }

  return params;
}
