export function getNumericGroupMax(bits: number): number {
  return bits === 10 ? 999 : bits === 7 ? 99 : 9;
}
