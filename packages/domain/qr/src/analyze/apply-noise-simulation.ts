/**
 * Apply noise simulation to test readability
 */
export function applyNoiseSimulation(
  canvas: HTMLCanvasElement,
  noiseLevel: number,
): HTMLCanvasElement {
  const result = document.createElement("canvas");
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext("2d");
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, result.width, result.height);
  const data = imageData.data;
  const pixelCount = data.length / 4;
  const noiseBytes = new Uint8Array(pixelCount);
  for (let off = 0; off < pixelCount; off += 65536) {
    crypto.getRandomValues(noiseBytes.subarray(off, Math.min(off + 65536, pixelCount)));
  }

  for (let i = 0; i < data.length; i += 4) {
    const noise = (noiseBytes[i / 4] / 255 - 0.5) * noiseLevel * 255;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}
