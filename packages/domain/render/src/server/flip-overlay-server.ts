import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function flipOverlayServer(source: Canvas, horizontal: boolean, vertical: boolean): Canvas {
  if (!(horizontal || vertical)) return source;

  const result = createCanvas(source.width, source.height);
  const ctx = result.getContext("2d");

  ctx.translate(horizontal ? source.width : 0, vertical ? source.height : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(source, 0, 0);

  return result;
}
