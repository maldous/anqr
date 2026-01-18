/**
 * Native Save Utilities
 * Save file on native platform (Android/iOS) using MediaStore API
 */

import { saveBase64ToDocuments } from '../platform';

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

    // Show a simple alert to confirm save
    alert(`Saved to Documents/ANQR: ${filename}`);

    return Boolean(result);
  } catch (error) {
    alert(`Failed to save file: ${error}`);
    return false;
  }
}
