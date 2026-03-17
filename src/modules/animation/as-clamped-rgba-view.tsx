export function asClampedRgbaView(pixels: Uint8Array): Uint8ClampedArray<ArrayBuffer> {
  if (pixels instanceof Uint8ClampedArray) {
    return pixels;
  }
  return new Uint8ClampedArray(
    pixels.buffer,
    pixels.byteOffset,
    pixels.byteLength,
  ) as Uint8ClampedArray<ArrayBuffer>;
}
