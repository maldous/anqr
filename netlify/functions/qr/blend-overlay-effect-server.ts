import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function _blendOverlayEffectServer(
  baseFrame: Canvas,
  effectFrame: Canvas,
  effectOpacity: number,
): Canvas {
  const width = baseFrame.width;
  const height = baseFrame.height;
  const output = createCanvas(width, height);
  const ctx = output.getContext("2d");
  ctx.drawImage(baseFrame, 0, 0);
  ctx.globalAlpha = Math.max(0, Math.min(1, effectOpacity));
  ctx.drawImage(effectFrame, 0, 0);
  ctx.globalAlpha = 1;
  return output;
}
