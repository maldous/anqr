/**
 * Share Utilities - Clipboard
 * Clipboard operations for text and images
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error_) {
    console.warn('Clipboard API failed, using fallback:', error_);
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
    } catch (fallbackError_) {
      console.warn('Fallback copy failed:', fallbackError_);
      return false;
    } finally {
      textarea.remove();
    }
  }
}

/**
 * Copy image to clipboard (if supported)
 */
export async function copyImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) return false;

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (error_) {
    console.warn('Copy image to clipboard failed:', error_);
    return false;
  }
}
