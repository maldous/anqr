import { type Canvas, createCanvas } from "@napi-rs/canvas";

export function _compositeArtworkOverlayServer(
  artworkFrame: Canvas,
  overlayFrame: Canvas,
  opacity: number,
  blendMode: GlobalCompositeOperation = "soft-light",
): Canvas {
  const width = artworkFrame.width;
  const height = artworkFrame.height;
  const output = createCanvas(width, height);
  const ctx = output.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(artworkFrame, 0, 0);

  const effectiveOpacity = Math.max(0, Math.min(1, opacity));
  if (effectiveOpacity > 0) {
    ctx.save();
    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = effectiveOpacity;
    ctx.drawImage(overlayFrame, 0, 0, width, height);
    ctx.restore();
  }
  return output;
}
