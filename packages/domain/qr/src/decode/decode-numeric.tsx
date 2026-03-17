import { qrDecoderLog } from "./qr-decoder-log";
import { decodeNumericRemainder } from "./decode-numeric-remainder";
import { BitStream } from "./bit-stream";

/**
 * Decode numeric mode data
 */
export function decodeNumeric(bits: BitStream, count: number): string {
  let result = "";

  // Read groups of 3 digits (10 bits each)
  let remaining = count;
  while (remaining >= 3) {
    if (bits.available() < 10) break;
    const value = bits.read(10);
    // Validate numeric value (should be 0-999)
    if (value > 999) {
      qrDecoderLog.debug("numeric: Invalid 3-digit value", { value });
      result += "???";
    } else {
      result += value.toString().padStart(3, "0");
    }
    remaining -= 3;
  }

  result += decodeNumericRemainder(bits, remaining);

  return result;
}
