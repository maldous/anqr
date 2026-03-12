import { Capacitor } from '@capacitor/core';
import { saveFileNative } from './native-save';

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
