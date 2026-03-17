// ============================================
// WATERMARK CREATION
// ============================================

export function renderTextWatermark(
  text: string,
  font: string = "16px Arial",
  color: string = "rgba(0, 0, 0, 0.3)",
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  ctx.font = font;
  const metrics = ctx.measureText(text);
  const height = Number.parseInt(font, 10) || 16;

  canvas.width = Math.ceil(metrics.width) + 4;
  canvas.height = height + 4;

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(text, 2, 2);

  return canvas;
}
