import { decodeGif } from "../../src/modules/animation";
import { createCanvas } from "@napi-rs/canvas";
import { FetchedImage } from "./fetched-image.types.ts";
import { MAX_OVERLAY_BYTES } from "./max-overlay-bytes.const.ts";
import { isGifBuffer } from "./is-gif-buffer.ts";
import { nodeCanvasFactory } from "./node-canvas-factory.const.ts";
import { MAX_OVERLAY_PIXELS } from "./max-overlay-pixels.const.ts";

export async function decodeOverlayBuffer(buffer: Buffer): Promise<FetchedImage | null> {
  if (buffer.byteLength <= 0 || buffer.byteLength > MAX_OVERLAY_BYTES) {
    return null;
  }

  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;

  let isAnimatedGif = false;
  if (isGifBuffer(arrayBuffer)) {
    try {
      const decoded = decodeGif(arrayBuffer);
      isAnimatedGif = decoded.frames.length > 1;
    } catch {}
  }

  const img = await nodeCanvasFactory.loadImage(buffer);

  // Validate image dimensions
  if (!(img.width && img.height) || img.width <= 0 || img.height <= 0) {
    return null;
  }

  // Validate pixel count to prevent memory issues
  const pixelCount = img.width * img.height;
  if (pixelCount > MAX_OVERLAY_PIXELS) {
    return null;
  }

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  return {
    canvas,
    arrayBuffer,
    isAnimatedGif,
  };
}
