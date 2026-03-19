/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Read pixel data from canvas for QR-Art worker.
 */

import { getCanvas2DContext } from "@/domain/render/canvas";

export function readCanvasImageData(canvas: HTMLCanvasElement | OffscreenCanvas): ImageData {
  const ctx = getCanvas2DContext(canvas, {
    willReadFrequently: true,
    desynchronized: true,
  });
  if (!ctx) {
    throw new Error("Unable to read overlay pixels for QR-Art worker");
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
