import {FormatInfo, bits, decoded, distance, eccLevel, maskPattern} from '../shared';
import { decodeFormatInfoBCH } from '../format/decodeFormatInfoBCH';
/**
 * Decode format info bits to extract ECC level and mask pattern.
 * This returns the decoded values (without distance metadata).
 */
export function decodeFormatInfo(bits: number): FormatInfo | null {
  const d = decodeFormatInfoBCH(bits);
  if (!d) return null;
  return { eccLevel: d.eccLevel, maskPattern: d.maskPattern };
}

