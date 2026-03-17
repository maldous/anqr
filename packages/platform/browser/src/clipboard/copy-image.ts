/**
 * Copy Image to Clipboard
 * Image clipboard operations
 */

import { createLogger } from "../../../../observability/logging/src";

const log = createLogger("CLIPBOARD");

/**
 * Copy image to clipboard (if supported)
 */
export async function copyImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) return false;

    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch (error) {
    log.debug("Clipboard image copy failed", { error });
    return false;
  }
}
