export function getLinearBit(data: Uint8Array, bitIndex: number): number {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitInByte = bitIndex % 8;
  const byte = data[byteIndex] ?? 0;
  // bitIndex 0 is MSB of byte 0
  return (byte >> (7 - bitInByte)) & 1;
}
