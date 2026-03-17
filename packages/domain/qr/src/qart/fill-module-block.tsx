/**
 * Scan a boolean matrix using jsQR to verify it's a valid, scannable QR code.
 * Returns the decoded data if successful, or an error message if not.
 * Tries multiple scale factors and decoder settings for robustness.
 *
 * IMPORTANT: A successful scan means:
 * - The decoder found and decoded the QR code
 * - The data was extracted
 *
 * This does NOT guarantee the data is correct - caller must verify content!
 *
 * STRUCTURAL VALIDITY:
 * The result includes `structurallyValid` to indicate if the QR code has a clean
 * segment structure (no truncated/fake segments after the primary data).
 * When terminator bits get flipped to fake mode indicators (like 0x8 = Kanji),
 * structurallyValid will be false even if data was extracted.
 */
export function fillModuleBlock(
  data: Uint8ClampedArray,
  size: number,
  startX: number,
  startY: number,
  scale: number,
  color: number,
): void {
  for (let py = 0; py < scale; py++) {
    for (let px = 0; px < scale; px++) {
      const idx = ((startY + py) * size + (startX + px)) * 4;
      data[idx] = color;
      data[idx + 1] = color;
      data[idx + 2] = color;
    }
  }
}
