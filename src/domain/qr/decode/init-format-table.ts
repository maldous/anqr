import { FORMAT_INFO_DECODE_TABLE } from './format-info-decode-table';
// Generate the decode table
export function initFormatTable(): void {
  if (FORMAT_INFO_DECODE_TABLE.size > 0) return;

  // BCH(15,5) generator polynomial: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 0x537
  const G15 = 0x537;
  const G15_MASK = 0x5412;

  for (let eccLevel = 0; eccLevel < 4; eccLevel++) {
    for (let mask = 0; mask < 8; mask++) {
      const data = (eccLevel << 3) | mask;
      let bits = data << 10;

      // BCH division
      for (let i = 4; i >= 0; i--) {
        if (bits & (1 << (i + 10))) {
          bits ^= G15 << i;
        }
      }

      const encoded = ((data << 10) | bits) ^ G15_MASK;
      FORMAT_INFO_DECODE_TABLE.set(encoded, { eccLevel, maskPattern: mask });
    }
  }
}
