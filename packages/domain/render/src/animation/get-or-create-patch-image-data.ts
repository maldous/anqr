import { asClampedRgbaView } from "./as-clamped-rgba-view";

export function getOrCreatePatchImageData(
  patchImageDataCache: Array<ImageData | null>,
  index: number,
  patch: Uint8Array,
  width: number,
  height: number,
): ImageData {
  let imageData = patchImageDataCache[index];
  if (!imageData) {
    imageData = new ImageData(asClampedRgbaView(patch), width, height);
    patchImageDataCache[index] = imageData;
  }
  return imageData;
}
