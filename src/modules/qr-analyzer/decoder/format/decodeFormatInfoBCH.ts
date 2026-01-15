import {DecodedFormatInfo, ECC_LEVEL_MAP, FORMAT_CODEWORDS_MASKED, FORMAT_DATA_ECC, FORMAT_DATA_MASK, MaskPattern, POPCNT16, bit, bits, dist, distance, eccLevel, for, i, maskPattern} from '../shared';
/**
 * BCH-correct and decode the 15-bit *masked* format info.
 * Returns null if distance > 3 (uncorrectable per spec).
 */
export function decodeFormatInfoBCH(maskedBits15: number): DecodedFormatInfo | null {
  const bits = maskedBits15 & 0x7fff;

  let bestIdx = -1;
  let bestDist = 4; // >3 means undecodable per QR spec

  for (let i = 0; i < 32; i++) {
    const dist = POPCNT16[(FORMAT_CODEWORDS_MASKED[i] ^ bits) & 0x7fff];
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
      if (dist === 0) break;
    }
  }

  if (bestIdx < 0 || bestDist > 3) return null;

  const eccCode = FORMAT_DATA_ECC[bestIdx];
  const eccLevel = ECC_LEVEL_MAP[eccCode] ?? 'M';
  const maskPattern = (FORMAT_DATA_MASK[bestIdx] as MaskPattern);

  return {
    eccLevel,
    maskPattern,
    dist: bestDist,
    eccCode,
    rawBits: bits,
  };
}

