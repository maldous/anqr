import { getMediaStoreWriter } from './get-media-store-writer';

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
  const plugin = getMediaStoreWriter();
  if (plugin.saveToDocuments) {
    return plugin.saveToDocuments({
      filename,
      data: base64Data,
      mimeType,
      subdir: subfolder,
    });
  }
  return plugin.saveBase64ToDocuments!({
    filename,
    base64Data,
    mimeType,
    subfolder,
  });
}
