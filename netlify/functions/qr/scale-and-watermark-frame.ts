import { type Canvas, createCanvas } from "@napi-rs/canvas";
import { WatermarkOptions } from "./watermark-options.types.ts";
import { applyWatermarkServer } from "./apply-watermark-server.ts";

export function scaleAndWatermarkFrame(
  frameCanvas: Canvas,
  outputWidth: number,
  outputHeight: number,
  watermarkOpts: WatermarkOptions | null,
): Canvas {
  let scaledFrame = frameCanvas;
  if (frameCanvas.width !== outputWidth || frameCanvas.height !== outputHeight) {
    scaledFrame = createCanvas(outputWidth, outputHeight);
    const ctx = scaledFrame.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(frameCanvas, 0, 0, outputWidth, outputHeight);
  }
  if (watermarkOpts) {
    scaledFrame = applyWatermarkServer(scaledFrame, watermarkOpts);
  }
  return scaledFrame;
}
