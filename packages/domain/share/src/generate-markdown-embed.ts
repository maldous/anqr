import { convertToImageApiUrl } from "./convert-to-image-api-url";

/**
 * Generate markdown embed
 */
export function generateMarkdownEmbed(
  shareableUrl: string,
  alt: string = "QR Code",
  size: number = 200,
  width?: number,
  height?: number,
): string {
  const imageUrl = convertToImageApiUrl(shareableUrl, size, width, height);
  return `![${alt}](${imageUrl})`;
}
