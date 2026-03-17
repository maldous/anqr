/** Clamp value to 0-255 range */
export function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
