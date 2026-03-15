import type { EmbedOptions } from '../../modules/share-links/types';
import { convertToImageApiUrl } from './convert-to-image-api-url';

/**
 * Generate HTML embed code for an image
 */
export function generateImageEmbed(
  shareableUrl: string,
  alt: string = 'QR Code',
  options: Partial<EmbedOptions> = {}
): string {
  const opts: EmbedOptions = {
    width: options.width ?? 200,
    height: options.height ?? 200,
    responsive: options.responsive ?? false,
    showBorder: options.showBorder ?? false,
    includeLink: options.includeLink ?? false,
  };

  const imageUrl = convertToImageApiUrl(
    shareableUrl,
    opts.width,
    opts.width === opts.height ? undefined : opts.width,
    opts.width === opts.height ? undefined : opts.height
  );

  const style = opts.responsive
    ? 'max-width: 100%; height: auto;'
    : `width: ${opts.width}px; height: ${opts.height}px;`;

  const border = opts.showBorder ? ' border: 1px solid #ccc;' : '';

  const imgTag = `<img src="${imageUrl}" alt="${alt}" style="${style}${border}" />`;

  if (opts.includeLink) {
    return `<a href="${shareableUrl}" target="_blank">${imgTag}</a>`;
  }

  return imgTag;
}
