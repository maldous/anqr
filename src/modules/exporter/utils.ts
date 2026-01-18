/**
 * Exporter Module - Utilities
 * Common utility functions for file export
 */

// Re-export from browser-io (canonical source)
export {
  canvasToBlob,
  downloadUrl,
  saveFileNative,
} from '../browser-io';

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
