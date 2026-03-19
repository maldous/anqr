import { type Canvas } from "@napi-rs/canvas";
import {
  createGifEncoder,
  indexGifPixels,
  isGifEncodingAvailable,
  quantizeGifPalette,
} from "../animation";
import { prepareGifFramePixels } from "./prepare-gif-frame-pixels";
import { parseGifBackgroundColor } from "./parse-gif-background-color";
import { ensureGifPaletteAnchors } from "./ensure-gif-palette-anchors";

export function encodeGif(
  canvas: Canvas,
  colors: number = 256,
  disposal: number = 2,
  backgroundColor = "#ffffff",
  preserveTransparency = false,
): Buffer {
  if (!isGifEncodingAvailable()) {
    throw new Error("GIF encoder is unavailable in this runtime");
  }
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = new Uint8ClampedArray(imageData.data);
  const preparedData = prepareGifFramePixels(
    rgba,
    parseGifBackgroundColor(backgroundColor),
    preserveTransparency,
  );

  const gif = createGifEncoder();
  const palette = ensureGifPaletteAnchors(
    quantizeGifPalette(preparedData, Math.min(256, Math.max(2, colors))),
    Math.min(256, Math.max(2, colors)),
  );
  const index = indexGifPixels(preparedData, palette);
  const safeIndex = index.slice();

  gif.writeFrame(safeIndex, width, height, {
    palette,
    delay: 100,
    repeat: 0,
    dispose: disposal,
  });

  gif.finish();
  return Buffer.from(gif.bytes());
}
