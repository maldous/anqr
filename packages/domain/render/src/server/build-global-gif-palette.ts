import { quantizeGifPalette } from "../animation";
import { ensureGifPaletteAnchors } from "./ensure-gif-palette-anchors";

export function buildGlobalGifPalette(
  frameDataProvider: (frameIndex: number) => Uint8ClampedArray,
  frameCount: number,
  width: number,
  height: number,
  paletteSize: number,
): number[][] {
  if (frameCount <= 0) {
    return ensureGifPaletteAnchors(
      [
        [0, 0, 0],
        [255, 255, 255],
      ],
      paletteSize,
    );
  }

  const indices =
    frameCount > 10
      ? [0, Math.floor(frameCount / 2), frameCount - 1]
      : Array.from({ length: frameCount }, (_, i) => i);
  const maxSamplePixels = 180_000;
  const totalPixels = Math.max(1, indices.length * width * height);
  const stride = Math.max(1, Math.floor(Math.sqrt(totalPixels / maxSamplePixels)));
  const sampledWidth = Math.max(1, Math.ceil(width / stride));
  const sampledHeight = Math.max(1, Math.ceil(height / stride));
  const samplePixels = new Uint8ClampedArray(indices.length * sampledWidth * sampledHeight * 4);
  let offset = 0;

  for (const idx of indices) {
    const data = frameDataProvider(idx);
    if (stride === 1) {
      samplePixels.set(data, offset);
      offset += data.length;
      continue;
    }

    for (let y = 0; y < height; y += stride) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x += stride) {
        const srcIdx = rowOffset + x * 4;
        samplePixels[offset] = data[srcIdx];
        samplePixels[offset + 1] = data[srcIdx + 1];
        samplePixels[offset + 2] = data[srcIdx + 2];
        samplePixels[offset + 3] = data[srcIdx + 3];
        offset += 4;
      }
    }
  }

  const basePalette = quantizeGifPalette(
    offset === samplePixels.length ? samplePixels : samplePixels.subarray(0, offset),
    paletteSize,
  );
  return ensureGifPaletteAnchors(basePalette, paletteSize);
}
