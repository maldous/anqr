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

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    const noise = ((x * phi + y * phi * phi + offset * 1000) % 1) - 0.5;
    const adjust = Math.round(noise * strength * 255);
    data[i] = Math.max(0, Math.min(255, data[i] + adjust));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjust));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjust));
  }

  ctx.putImageData(imageData, 0, 0);
  return output;
}
