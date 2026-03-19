/**
 * Decode QR
 * Main QR code decoding logic
 */

import { invertImageData } from "./invert-image-data";
import { tryDecode } from "./try-decode-qr";
import type { DecodeResult } from "../qr-decoder/types";

/**
 * Decode a QR code from ImageData
 * This is the main entry point, replacing jsQR
 */
export function decodeQR(
  imageData: ImageData,
  options: { inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" } = {},
): DecodeResult | null {
  const { inversionAttempts = "attemptBoth" } = options;

  // Try normal first
  if (inversionAttempts !== "onlyInvert") {
    const result = tryDecode(imageData);
    if (result) return result;
  }

  // Try inverted if needed
  if (inversionAttempts !== "dontInvert") {
    const inverted = invertImageData(imageData);
    const result = tryDecode(inverted);
    if (result) return result;
  }

  return null;
}
