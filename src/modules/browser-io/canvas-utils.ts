/**
 * Canvas Utilities
 * Canvas to Blob/DataURL conversion
 */

/**
 * Convert canvas to Blob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = 'image/png',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
      format,
      quality
    );
  });
}

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
