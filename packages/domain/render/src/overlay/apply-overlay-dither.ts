import { applyDither } from "../dither/apply-dither";
import type { OverlayDitherOptions } from "./processor.types";

export function applyOverlayDither(imageData: ImageData, options: OverlayDitherOptions): ImageData {
  if (!options.enabled || options.kind === "none") {
    return imageData;
  }

  const result = applyDither(imageData, {
    kind: options.kind ?? "floyd_steinberg",
    strength: options.strength ?? 1,
    levels: options.levels ?? 2,
    serpentine: options.serpentine ?? false,
    colorMode: "color",
    diffusionKernel: options.kernel,
    orderedMatrix: options.matrix,
  });

  // Convert DitherResult back to ImageData
  const { width, height } = imageData;
  const outputData = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const color = result.colors[y]?.[x];
      if (color) {
        outputData[i] = color.r;
        outputData[i + 1] = color.g;
        outputData[i + 2] = color.b;
        outputData[i + 3] = imageData.data[i + 3]; // Preserve alpha
      } else {
        // Fallback: copy original
        outputData[i] = imageData.data[i];
        outputData[i + 1] = imageData.data[i + 1];
        outputData[i + 2] = imageData.data[i + 2];
        outputData[i + 3] = imageData.data[i + 3];
      }
    }
  }

  return new ImageData(outputData, width, height);
}
