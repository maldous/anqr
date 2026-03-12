import { saveBase64ToDocuments } from './save-base64-to-documents';

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
