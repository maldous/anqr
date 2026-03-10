/**
 * Media Store Writer
 * Writes files to Android MediaStore (Documents folder) via Capacitor plugin
 */

import { registerPlugin } from '@capacitor/core';
import { createLogger } from '../../lib/logger';

const _log = createLogger('STORAGE');

export interface MediaStoreWriterPlugin {
  saveBase64ToDocuments?: (options: {
    filename: string;
    base64Data: string;
    mimeType: string;
    subfolder?: string;
  }) => Promise<{ uri?: string; path?: string; displayName?: string }>;
  // Backward-compatible native method name used by Android plugin
  saveToDocuments?: (options: {
    filename: string;
    data: string;
    mimeType: string;
    subdir?: string;
  }) => Promise<{ uri?: string; path?: string; displayName?: string }>;
}

// Lazy-loaded plugin instance to avoid circular dependency initialization issues
// The plugin is only registered when first used, not at module load time
let _mediaStoreWriter: MediaStoreWriterPlugin | null = null;

function getMediaStoreWriter(): MediaStoreWriterPlugin {
  _mediaStoreWriter ??= registerPlugin<MediaStoreWriterPlugin>('MediaStoreWriter');
  return _mediaStoreWriter;
}

/**
 * @deprecated Use saveBase64ToDocuments instead. This export is kept for backward compatibility.
 */
export const MediaStoreWriter: MediaStoreWriterPlugin = {
  saveBase64ToDocuments: async (options) => {
    const plugin = getMediaStoreWriter();

    // Android plugin implementation is saveToDocuments; prefer it first.
    // Some Capacitor proxies expose any method name, which can make
    // saveBase64ToDocuments look available even when native doesn't implement it.
    if (plugin.saveToDocuments) {
      return plugin.saveToDocuments({
        filename: options.filename,
        data: options.base64Data,
        mimeType: options.mimeType,
        subdir: options.subfolder,
      });
    }

    if (plugin.saveBase64ToDocuments) {
      return plugin.saveBase64ToDocuments(options);
    }
    throw new Error('MediaStoreWriter plugin method not available');
  },
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
): Promise<{ uri?: string; path?: string; displayName?: string }> {
  return MediaStoreWriter.saveBase64ToDocuments!({
    filename,
    base64Data,
    mimeType,
    subfolder,
  });
}
