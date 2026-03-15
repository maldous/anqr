/**
 * Generate a readability heatmap
 */
export function generateReadabilityHeatmap(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;

  // Simple implementation - darker areas are more readable
  const sourceCtx = canvas.getContext('2d');
  if (!sourceCtx) return canvas;

  const imageData = sourceCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Green = readable (high contrast), Red = problematic
    if (brightness < 128) {
      data[i] = 0; // R
      data[i + 1] = 255; // G
      data[i + 2] = 0; // B
    } else {
      data[i] = 255; // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
    }
    data[i + 3] = 128; // Semi-transparent
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}
