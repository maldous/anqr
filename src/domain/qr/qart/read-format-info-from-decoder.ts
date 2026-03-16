import { readFormatInfo as decoderReadFormatInfo } from "../decode/format";

/**
 * Read format info using the decoder's proven format parser.
 * This is the PREFERRED method for reading format info as it uses
 * BCH error correction and handles edge cases correctly.
 *
 * @param matrix The QR matrix to read format info from
 * @returns FormatInfo with eccLevel (0-3) and maskPattern (0-7), or null if unreadable
 */
export function readFormatInfoFromDecoder(matrix: boolean[][]): {
  eccLevel: number;
  maskPattern: number;
} | null {
  const moduleCount = matrix.length;
  return decoderReadFormatInfo(matrix, moduleCount);
}
