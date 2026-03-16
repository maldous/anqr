import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function interpolateOverlayFramesServer(
  previousFrame: Canvas,
  currentFrame: Canvas,
  mode: "none" | "crossfade" | "morph",
  t = 0.5,
): Canvas {
  if (mode === "none") return currentFrame;

  const width = currentFrame.width;
  const height = currentFrame.height;
  const output = createCanvas(width, height);
  const outCtx = output.getContext("2d");

  if (mode === "crossfade") {
    outCtx.globalAlpha = Math.max(0, Math.min(1, 1 - t));
    outCtx.drawImage(previousFrame, 0, 0);
    outCtx.globalAlpha = Math.max(0, Math.min(1, t));
    outCtx.drawImage(currentFrame, 0, 0);
    outCtx.globalAlpha = 1;
    return output;
  }

  const prevCtx = previousFrame.getContext("2d");
  const currCtx = currentFrame.getContext("2d");
  const prevData = prevCtx.getImageData(0, 0, width, height);
  const currData = currCtx.getImageData(0, 0, width, height);
  const mixed = outCtx.createImageData(width, height);

  for (let i = 0; i < mixed.data.length; i++) {
    mixed.data[i] = Math.round(prevData.data[i] * (1 - t) + currData.data[i] * t);
  }

  outCtx.putImageData(mixed, 0, 0);
  return output;
}
