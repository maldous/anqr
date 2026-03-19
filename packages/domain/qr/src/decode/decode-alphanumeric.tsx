import { ALPHANUMERIC_CHARS } from "../qr-decoder/types";
import { qrDecoderLog } from "./qr-decoder-log";
import { BitStream } from "./bit-stream";

/**
 * Decode alphanumeric mode data
 */
export function decodeAlphanumeric(bits: BitStream, count: number): string {
  let result = "";

  // Read pairs of characters (11 bits each)
  let remaining = count;
  while (remaining >= 2) {
    if (bits.available() < 11) break;
    const value = bits.read(11);
    const c1 = Math.floor(value / 45);
    const c2 = value % 45;

    // Bounds checking to prevent 'undefined' in output
    if (c1 >= 0 && c1 < ALPHANUMERIC_CHARS.length && c2 >= 0 && c2 < ALPHANUMERIC_CHARS.length) {
      result += ALPHANUMERIC_CHARS[c1] + ALPHANUMERIC_CHARS[c2];
    } else {
      qrDecoderLog.debug("alphanumeric: Invalid character index", { value, c1, c2 });
      result += "??"; // Placeholder for invalid characters
    }
    remaining -= 2;
  }

  // Read remaining character (6 bits)
  if (remaining === 1 && bits.available() >= 6) {
    const value = bits.read(6);
    if (value >= 0 && value < ALPHANUMERIC_CHARS.length) {
      result += ALPHANUMERIC_CHARS[value];
    } else {
      qrDecoderLog.debug("alphanumeric: Invalid single character index", { value });
      result += "?";
    }
  }

  return result;
}
