import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function rotateOverlayServer(source: Canvas, degrees: number): Canvas {
  if (degrees === 0) return source;

  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const newWidth = Math.round(source.width * cos + source.height * sin);
  const newHeight = Math.round(source.width * sin + source.height * cos);

  const result = createCanvas(newWidth, newHeight);
  const ctx = result.getContext("2d");

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return result;
}
