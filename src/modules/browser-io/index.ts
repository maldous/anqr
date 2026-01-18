/**
 * Browser I/O Module
 * Canvas to Blob conversion and download utilities
 * 
 * This module provides:
 * - Canvas to Blob conversion
 * - Download from URL/Blob
 * - Native file saving (Android/iOS via Capacitor)
 * 
 * Rules:
 * - Browser-only APIs (canvas, download, Capacitor)
 * - No dependencies on other modules except platform
 */

import { Capacitor } from '@capacitor/core';
import { saveBase64ToDocuments } from '../platform';

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

/**
 * Create a download link for a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
    const result = await saveBase64ToDocuments(
      filename,
      base64DataUrl,
      mimeType,
      'ANQR'
    );

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
