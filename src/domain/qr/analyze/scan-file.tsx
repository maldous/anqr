import type { ScanResult } from "./scanner.types";
import { loadFileImageCanvas } from "./load-file-image-canvas";
import { scanCanvas } from "./scan-canvas";

/**
 * Scan a file for QR code
 */
export async function scanFile(file: File): Promise<ScanResult> {
  const canvasResult = await loadFileImageCanvas(file);
  return canvasResult.error === null
    ? scanCanvas(canvasResult.canvas)
    : { data: null, location: null };
}
