/**
 * Media Store Writer
 * Writes files to Android MediaStore (Documents folder) via Capacitor plugin
 */

import { registerPlugin } from '@capacitor/core';

export interface MediaStoreWriterPlugin {
  saveBase64ToDocuments(options: {
    filename: string;
    base64Data: string;
    mimeType: string;
    subfolder?: string;
  }): Promise<{ uri: string; path: string }>;
}

// Lazy-loaded plugin instance to avoid circular dependency initialization issues
// The plugin is only registered when first used, not at module load time
let _mediaStoreWriter: MediaStoreWriterPlugin | null = null;

function getMediaStoreWriter(): MediaStoreWriterPlugin {
  if (!_mediaStoreWriter) {
    _mediaStoreWriter = registerPlugin<MediaStoreWriterPlugin>('MediaStoreWriter');
  }
  return _mediaStoreWriter;
}

/**
 * @deprecated Use saveBase64ToDocuments instead. This export is kept for backward compatibility.
 */
export const MediaStoreWriter: MediaStoreWriterPlugin = {
  saveBase64ToDocuments: (options) => getMediaStoreWriter().saveBase64ToDocuments(options),
};

/**
 * Save a base64-encoded file to the Documents folder
 * @param filename - Name of the file (e.g., "qr-code.png")
 * @param base64Data - Base64-encoded file data (without data URI prefix)
 * @param mimeType - MIME type (e.g., "image/png")
 * @param subfolder - Optional subfolder within Documents (e.g., "ANQR")
 * @returns Promise with the saved file's URI and path
 */
export async function saveBase64ToDocuments(
  filename: string,
  base64Data: string,
  mimeType: string,
  subfolder?: string
): Promise<{ uri: string; path: string }> {
  return getMediaStoreWriter().saveBase64ToDocuments({
    filename,
    base64Data,
    mimeType,
    subfolder,
  });
}
