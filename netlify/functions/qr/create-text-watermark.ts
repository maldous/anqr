import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function createTextWatermark(
  text: string,
  fontSize: number = 14,
  fontFamily: string = "sans-serif",
  color: string = "#000000",
): Canvas {
  // First measure the text
  const measureCanvas = createCanvas(1, 1);
  const measureCtx = measureCanvas.getContext("2d");
  measureCtx.font = `${fontSize}px ${fontFamily}`;
  const metrics = measureCtx.measureText(text);
  const textHeight = fontSize * 1.2;

  const canvas = createCanvas(Math.ceil(metrics.width) + 10, Math.ceil(textHeight) + 10);
  const ctx = canvas.getContext("2d");

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 5, canvas.height / 2);

  return canvas;
}
