import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function applyTemporalNoiseToCanvasServer(
  sourceCanvas: Canvas,
  offset: number,
  strength = 0.012,
): Canvas {
  if (offset === 0 || strength <= 0) {
    return sourceCanvas;
  }

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const output = createCanvas(width, height);
  const ctx = output.getContext("2d");
  ctx.drawImage(sourceCanvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const phi = 1.618033988749895;
  const phiSq = phi * phi;
  const offsetTerm = offset * 1000;
  const strengthScale = strength * 255;

  // Nested y/x loop so x/y are loop indices instead of a per-pixel mod/divide
  // on `i`. The `y * phiSq` term and the constant offsetTerm are hoisted out
  // of the inner loop. Output is bit-identical to the legacy loop. See
  // review-2026-05-24 A-F6.
  for (let y = 0; y < height; y++) {
    const yPhi = y * phiSq;
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      const i = (rowBase + x) << 2;
      if (data[i + 3] === 0) continue;
      const noise = ((x * phi + yPhi + offsetTerm) % 1) - 0.5;
      const adjust = Math.round(noise * strengthScale);
      let v = data[i] + adjust;
      data[i] = v < 0 ? 0 : v > 255 ? 255 : v;
      v = data[i + 1] + adjust;
      data[i + 1] = v < 0 ? 0 : v > 255 ? 255 : v;
      v = data[i + 2] + adjust;
      data[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return output;
}
