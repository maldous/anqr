export function moduleCenterWeight(x: number, y: number, scale: number): number {
  const fx = ((x % scale) + 0.5) / Math.max(1, scale) - 0.5;
  const fy = ((y % scale) + 0.5) / Math.max(1, scale) - 0.5;
  const r2 = fx * fx + fy * fy;
  const radial = Math.max(0, 1 - r2 * 3.8);
  return radial * radial;
}
