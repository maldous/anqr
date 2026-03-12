/**
 * Convert canvas to data URL
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.9
): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    png: 'image/png',
  };
  const mimeType = mimeTypes[format] || 'image/png';
  return canvas.toDataURL(mimeType, quality);
}
