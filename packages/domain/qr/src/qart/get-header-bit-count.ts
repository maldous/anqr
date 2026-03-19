import { QRMode } from "../qr-encoder/types";
import { getLengthInBits } from "../encode/utils";

/**
 * Calculate the number of header bits (mode indicator + character count) for a given version.
 * These bits must NOT be modified by QR-Art or the QR code won't decode properly.
 *
 * @param version QR version (1-40)
 * @returns Number of header bits to skip
 */
export function getHeaderBitCount(version: number): number {
  // Mode indicator is always 4 bits
  const modeBits = 4;
  // Character count length depends on version (for byte mode)
  const charCountBits = getLengthInBits(QRMode.MODE_8BIT_BYTE, version);
  return modeBits + charCountBits;
}
