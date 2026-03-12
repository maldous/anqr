import { getHeaderBitCount } from './get-header-bit-count';

/**
 * Calculate the number of CONTENT bits (header + data + terminator) for a given version and data length.
 * These bits encode the actual message and must NOT be modified or the decoded data will be corrupted.
 *
 * Content bits = mode(4) + charCount(8-16) + data(8*length) + terminator(up to 4)
 *
 * @param version QR version (1-40)
 * @param dataLength Length of the data string in characters
 * @returns Number of content bits that must be protected
 */
export function getContentBitCount(version: number, dataLength: number): number {
  const headerBits = getHeaderBitCount(version);
  const dataBits = dataLength * 8; // Byte mode: 8 bits per character
  const terminatorBits = 4; // Terminator is up to 4 bits
  return headerBits + dataBits + terminatorBits;
}
