export function getNumericGroupMax(bits: number): number {
  if (bits === 10) return 999;
  if (bits === 7) return 99;
  return 9;
}
