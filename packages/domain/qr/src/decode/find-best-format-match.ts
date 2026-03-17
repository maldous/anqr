import type { FormatInfo } from "@/modules/qr-decoder/types";
import { hammingDistance } from "./hamming-distance";
import { FORMAT_INFO_DECODE_TABLE } from "./format-info-decode-table";

export function findBestFormatMatch(
  bits1: number,
  bits2: number,
): {
  match: FormatInfo | null;
  distance: number;
  distCopy1: number;
  distCopy2: number;
  fromCopy: number;
} {
  let match: FormatInfo | null = null;
  let distance = 4;
  let distCopy1 = 15;
  let distCopy2 = 15;
  let fromCopy = 0;

  for (const [pattern, info] of FORMAT_INFO_DECODE_TABLE) {
    const d1 = hammingDistance(bits1, pattern);
    const d2 = hammingDistance(bits2, pattern);
    const minD = Math.min(d1, d2);

    if (minD < distance) {
      distance = minD;
      distCopy1 = d1;
      distCopy2 = d2;
      fromCopy = d1 <= d2 ? 1 : 2;
      match = info;
    }
  }

  return { match, distance, distCopy1, distCopy2, fromCopy };
}
