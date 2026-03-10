/**
 * Copy Text to Clipboard
 * Text clipboard operations
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('CLIPBOARD');

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_error) {
    // Clipboard API failed, use fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      // execCommand is deprecated but necessary for older browser fallback
      // NOSONAR - intentionally using deprecated API for browser compatibility
      document.execCommand('copy');
      return true;
    } catch (_fallbackError) {
      // Both clipboard methods failed
      return false;
    } finally {
      textarea.remove();
    }
  }
}
