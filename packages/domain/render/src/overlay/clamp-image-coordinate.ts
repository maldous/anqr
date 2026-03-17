export function clampImageCoordinate(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}
