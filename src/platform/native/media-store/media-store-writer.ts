import type { MediaStoreWriterPlugin } from './media-store.types';
import { getMediaStoreWriter } from './get-media-store-writer';

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
