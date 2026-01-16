/**
 * Exporter Module - Utilities
 * Common utility functions for file export
 */

import { Capacitor } from '@capacitor/core';
import { saveBase64ToDocuments } from '../media-store-writer';

/**
 * Convert canvas to blob
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
 * Escape XML special characters
 */
export function escapeXml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Save file on native platform (Android/iOS) using MediaStore API
 */
export async function saveFileNative(filename: string, blob: Blob): Promise<boolean> {
  try {
    // Convert blob to base64 data URL
    const base64DataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Determine mime type from blob
    const mimeType = blob.type || 'application/octet-stream';

    // Write to Documents directory via MediaStore
    const result = await saveBase64ToDocuments({
      filename,
      base64: base64DataUrl,
      mimeType,
      subdir: 'ANQR',
    });

    console.log('File saved:', result);

    // Show a simple alert to confirm save
    alert(`Saved to Documents/ANQR: ${filename}`);

    return true;
  } catch (error) {
    console.error('Failed to save file on native platform:', error);
    alert(`Failed to save file: ${error}`);
    return false;
  }
}

/**
 * Download from URL (web) or save file (native)
 */
export function downloadUrl(url: string, filename: string, blob?: Blob): void {
  // On native platforms, use Filesystem API
  if (Capacitor.isNativePlatform() && blob) {
    saveFileNative(filename, blob); // Fire and forget
  } else {
    // On web, use standard download approach
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
