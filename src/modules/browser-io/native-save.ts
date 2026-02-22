/**
 * Native Save Utilities
 * Save file on native platform (Android/iOS) using MediaStore API
 */

import { createLogger } from '../../lib/logger';
import { saveBase64ToDocuments, showNativeToast } from '../platform';

const _log = createLogger('DOWNLOAD');

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
    const result = await saveBase64ToDocuments(filename, base64DataUrl, mimeType, 'ANQR');

    await showNativeToast(`Saved to Documents/ANQR: ${filename}`, 'short');
    _log.info('Native save complete', { filename, mimeType, hasUri: Boolean(result?.uri) });

    return Boolean(result);
  } catch (error) {
    _log.error('Native save failed', { filename, error });
    await showNativeToast('Failed to save file', 'long');
    return false;
  }
}
