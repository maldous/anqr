import type { ECCLevel } from "./encoder-api.types";
import { createQRInstance } from "./create-qr-instance";

/**
 * Calculate optimal version for data
 *
 * IMPORTANT: Do NOT pass mode: 'auto' here! The qr-generator-class.ts uses
 * undefined mode which defaults to byte encoding. If we use 'auto' here,
 * it triggers optimizeSegments() for mixed-mode encoding which is more
 * efficient, causing version calculation to pick a smaller version than
 * what the actual QR generation needs (which uses byte mode).
 */
export function calculateOptimalVersion(
  data: string,
  errorCorrectionLevel: ECCLevel = "M",
): number {
  // Try each version until one fits
  // Note: We intentionally don't pass mode option - this matches the behavior
  // in qr-generator-class.ts which uses undefined mode (defaults to byte)
  for (let v = 1; v <= 40; v++) {
    try {
      createQRInstance(data, errorCorrectionLevel, v);
      return v;
    } catch {
      // Version too small, try next
    }
  }
  return 40; // Max version
}
