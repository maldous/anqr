/**
 * Calculate CRC16-CCITT (polynomial 0x1021, init 0xFFFF)
 */
export function crc16CCITT(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
