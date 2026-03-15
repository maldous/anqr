import type { GalleryItem } from './gallery-items.types';
import { buildGallerySearchParams } from './build-gallery-search-params';
import { getGalleryBaseUrl } from './get-gallery-base-url';

export function buildGalleryRenderImageUrl(
  item: GalleryItem,
  formatOverride?: 'png' | 'gif'
): string {
  const baseUrl = getGalleryBaseUrl();
  const params = buildGallerySearchParams(item);
  params.set('format', formatOverride || (item.isAnimated ? 'gif' : 'png'));
  params.set('_fullRender', '1');
  return `${baseUrl}/api/qr?${params.toString()}`;
}
