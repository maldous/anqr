import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function scaleToOutputDimensions(
  canvas: Canvas,
  outputWidth: number,
  outputHeight: number,
): Canvas {
  if (canvas.width === outputWidth && canvas.height === outputHeight) {
    return canvas;
  }
  const outputCanvas = createCanvas(outputWidth, outputHeight);
  const ctx = outputCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, outputWidth, outputHeight);
  return outputCanvas;
}
