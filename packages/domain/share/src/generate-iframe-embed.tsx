import type { EmbedOptions } from "@/modules/share-links/types";

/**
 * Generate iframe embed code
 */
export function generateIframeEmbed(url: string, options: Partial<EmbedOptions> = {}): string {
  const opts: EmbedOptions = {
    width: options.width ?? 300,
    height: options.height ?? 300,
    responsive: options.responsive ?? false,
    showBorder: options.showBorder ?? false,
    includeLink: options.includeLink ?? false,
  };

  const style = opts.responsive
    ? "width: 100%; aspect-ratio: 1;"
    : `width: ${opts.width}px; height: ${opts.height}px;`;

  const border = opts.showBorder ? " border: 1px solid #ccc;" : " border: none;";

  return `<iframe src="${url}" style="${style}${border}" loading="lazy" title="QR Code"></iframe>`;
}
