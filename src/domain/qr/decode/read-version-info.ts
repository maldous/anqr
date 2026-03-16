import { readVersionBitsBottomLeft } from "./read-version-bits-bottom-left";
import { readVersionBitsTopRight } from "./read-version-bits-top-right";

/**
 * Read version info from the matrix (for versions 7+)
 */
export function readVersionInfo(matrix: boolean[][], moduleCount: number): number | null {
  const version = (moduleCount - 17) / 4;

  // Version info only exists for version 7+
  if (version < 7) return version;

  const bits1 = readVersionBitsBottomLeft(matrix, moduleCount);
  const bits2 = readVersionBitsTopRight(matrix, moduleCount);

  // BCH(18,6) decoding with error correction
  // For simplicity, we'll check if the extracted version matches expected
  const extractedVersion1 = bits1 >> 12;
  const extractedVersion2 = bits2 >> 12;

  if (extractedVersion1 >= 7 && extractedVersion1 <= 40) {
    return extractedVersion1;
  }
  if (extractedVersion2 >= 7 && extractedVersion2 <= 40) {
    return extractedVersion2;
  }

  // Fall back to calculated version
  return version;
}
