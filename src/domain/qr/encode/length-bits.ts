// Length bits lookup: mode -> [small, medium, large] version ranges
export const LENGTH_BITS: Record<number, [number, number, number]> = {
  1: [10, 12, 14], // Numeric
  2: [9, 11, 13], // Alphanumeric
  4: [8, 16, 16], // Byte
  8: [8, 10, 12], // Kanji
};
