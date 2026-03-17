/** Convert linear-light 0..1 channel to 8-bit sRGB channel */
export function linearToSrgb8(linear: number): number {
  const clamped = Math.max(0, Math.min(1, linear));
  const encoded = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}
