import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function cropOverlayServer(
  source: Canvas,
  centerX: number,
  centerY: number,
  sizeFraction: number,
): Canvas {
  const minDim = Math.min(source.width, source.height);
  const cropSize = Math.round(minDim * Math.max(0.1, Math.min(1, sizeFraction)));

  // Calculate crop region centered at (centerX, centerY)
  let cropX = Math.round(source.width * centerX - cropSize / 2);
  let cropY = Math.round(source.height * centerY - cropSize / 2);

  // Clamp to image bounds
  cropX = Math.max(0, Math.min(source.width - cropSize, cropX));
  cropY = Math.max(0, Math.min(source.height - cropSize, cropY));

  const result = createCanvas(cropSize, cropSize);
  const ctx = result.getContext("2d");
  ctx.drawImage(source, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);

  return result;
}
