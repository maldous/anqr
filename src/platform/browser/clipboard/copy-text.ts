/**
 * Copy Text to Clipboard
 * Text clipboard operations
 */

import { createLogger } from "../../../infra/logging/logger";

const log = createLogger("CLIPBOARD");

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    log.debug("Clipboard API failed", { error });
    return false;
  }
}
