/**
 * Generate BBCode embed
 */
export function generateBBCodeEmbed(imageUrl: string, linkUrl?: string): string {
  if (linkUrl) {
    return `[url=${linkUrl}][img]${imageUrl}[/img][/url]`;
  }
  return `[img]${imageUrl}[/img]`;
}
