/**
 * Apply blur simulation to test readability
 */
export function applyBlurSimulation(
  canvas: HTMLCanvasElement,
  blurRadius: number
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (ctx) {
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(canvas, 0, 0);
  }
  return result;
}
