import { CRC32_TABLE } from './crc32-table.const';

/**
 * CRC32 calculation for PNG chunks
 */
export function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}
