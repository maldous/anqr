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
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy'); // NOSONAR: deprecated but necessary for older browser fallback
      return true;
    } catch (fallbackError) {
      return false;
    } finally {
      textarea.remove();
    }
  }
}
