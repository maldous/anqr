import { type Canvas, createCanvas } from "@napi-rs/canvas";
import { adjustPixelColor } from "./adjust-pixel-color.ts";
import { applyPostProcessFilters } from "./apply-post-process-filters.ts";

export function applyOverlayFiltersServer(
  source: Canvas,
  options: {
    brightness?: number;
    contrast?: number;
    gamma?: number;
    saturation?: number;
    hue?: number;
    invert?: boolean;
    blur?: number;
    sharpen?: number;
    posterize?: number;
    threshold?: number;
    edge?: "off" | "sobel" | "canny";
  },
): Canvas {
  const result = createCanvas(source.width, source.height);
  const resultCtx = result.getContext("2d");
  resultCtx.drawImage(source, 0, 0);

  const imageData = resultCtx.getImageData(0, 0, result.width, result.height);
  const data = imageData.data;

  const brightness = (options.brightness ?? 0) / 100;
  const contrast = (options.contrast ?? 0) / 100;
  const gamma = options.gamma ?? 1;
  const saturation = (options.saturation ?? 0) / 100;
  const hue = (options.hue ?? 0) * (Math.PI / 180);
  const invert = options.invert ?? false;
  const contrastFactor = (1 + contrast) / (1 - contrast * 0.5);

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = adjustPixelColor(
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
      invert,
      brightness,
      contrastFactor,
      gamma,
      saturation,
      hue,
    );
    data[i] = Math.round(Math.max(0, Math.min(1, r)) * 255);
    data[i + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
    data[i + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
  }

  applyPostProcessFilters(
    data,
    result.width,
    result.height,
    options.blur ?? 0,
    options.sharpen ?? 0,
    options.posterize ?? 0,
    options.threshold,
    options.edge ?? "off",
  );

  resultCtx.putImageData(imageData, 0, 0);
  return result;
}
