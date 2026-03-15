/** Convert 8-bit sRGB channel to linear-light 0..1 channel */
export function srgbToLinear01(channel: number): number {
  const normalized = Math.max(0, Math.min(1, channel / 255));
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}
