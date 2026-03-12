import { type ECCLevel } from './bit-mapping';
import { getSemanticBitLayout } from './get-semantic-bit-layout';
import { log } from './log';

/**
 * Find the smallest QR version that can encode the data with at least
 * minPadCodewords of padding codewords available for QR-Art manipulation.
 *
 * @param dataLength Length of the data string
 * @param ecc Error correction level
 * @param minPadCodewords Minimum padding codewords required (default: 20)
 * @returns Optimal version number
 */
export function calculateVersionForSlack(
  dataLength: number,
  ecc: ECCLevel,
  minPadCodewords: number = 20
): number {
  for (let version = 1; version <= 40; version++) {
    const layout = getSemanticBitLayout(version, ecc, dataLength);

    if (layout.padCodewords.byteCount >= minPadCodewords) {
      log.debug('Found version with sufficient slack', {
        version,
        padCodewords: layout.padCodewords.byteCount,
        minRequired: minPadCodewords,
      });
      return version;
    }
  }

  // If no version has enough slack, return the largest
  log.warn('No version has sufficient pad codewords, using version 40', {
    dataLength,
    ecc,
    minPadCodewords,
  });
  return 40;
}
