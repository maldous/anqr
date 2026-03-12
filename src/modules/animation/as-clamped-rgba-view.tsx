export function asClampedRgbaView(pixels: Uint8Array): Uint8ClampedArray<ArrayBuffer> {
  if (pixels instanceof Uint8ClampedArray) {
    return pixels as Uint8ClampedArray<ArrayBuffer>;
  }
  return new Uint8ClampedArray(
    pixels.buffer as ArrayBuffer,
    pixels.byteOffset,
    pixels.byteLength
  ) as Uint8ClampedArray<ArrayBuffer>;
}
