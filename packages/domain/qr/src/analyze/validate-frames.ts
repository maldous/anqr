import { validateQRCode } from "./validate-qr-code";

/**
 * Validate multiple frames (for animated QR codes)
 */
export function validateFrames(
  frames: HTMLCanvasElement[],
  expectedContent?: string,
): { valid: boolean; validCount: number; totalCount: number } {
  let validCount = 0;
  for (const frame of frames) {
    const result = validateQRCode(frame, expectedContent);
    if (result.valid) validCount++;
  }

  return {
    valid: validCount === frames.length,
    validCount,
    totalCount: frames.length,
  };
}
