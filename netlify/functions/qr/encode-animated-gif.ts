import { type Canvas } from "@napi-rs/canvas";
import {
  createGifEncoder,
  indexGifPixels,
  isGifEncodingAvailable,
} from "../../src/modules/animation";
import { parseGifBackgroundColor } from "./parse-gif-background-color.ts";
import { prepareGifFramePixels } from "./prepare-gif-frame-pixels.ts";
import { buildGlobalGifPalette } from "./build-global-gif-palette.ts";

export function encodeAnimatedGif(
  frames: Canvas[],
  frameDelayMs: number = 100,
  colors: number = 256,
  disposal: number = 1,
  backgroundColor = "#ffffff",
  preserveTransparency = false,
): Buffer {
  if (!isGifEncodingAvailable()) {
    throw new Error("GIF encoder is unavailable in this runtime");
  }
  if (frames.length === 0) {
    throw new Error("No frames to encode");
  }

  const width = frames[0].width;
  const height = frames[0].height;
  const gif = createGifEncoder();
  const paletteSize = Math.min(256, Math.max(2, colors));
  const bgRgb = parseGifBackgroundColor(backgroundColor);
  const sampledFrameCache = new Map<number, Uint8ClampedArray>();
  const getFrameData = (i: number, allowCache = false): Uint8ClampedArray => {
    if (allowCache) {
      const cached = sampledFrameCache.get(i);
      if (cached) return cached;
    }
    const ctx = frames[i].getContext("2d");
    const imageData = ctx.getImageData(0, 0, width, height);
    const rgba = new Uint8ClampedArray(imageData.data);
    const prepared = prepareGifFramePixels(rgba, bgRgb, preserveTransparency);
    if (allowCache) {
      sampledFrameCache.set(i, prepared.slice());
    }
    return prepared;
  };
  const globalPalette = buildGlobalGifPalette(
    (i) => getFrameData(i, true),
    frames.length,
    width,
    height,
    paletteSize,
  );

  // gifenc expects delay in milliseconds (it converts to centiseconds internally)
  // Minimum 20ms — gifenc rounds <20ms to 0-1 centiseconds which browsers treat as 100ms
  const delayMs = Math.max(20, frameDelayMs);

  for (let i = 0; i < frames.length; i++) {
    const preparedData = sampledFrameCache.get(i) ?? getFrameData(i, false);
    const index = indexGifPixels(preparedData, globalPalette);
    const safeIndex = index.slice();

    // Only set repeat on first frame
    const frameOptions: Record<string, unknown> = {
      palette: globalPalette,
      delay: delayMs,
      dispose: disposal,
    };
    if (i === 0) {
      frameOptions.repeat = 0; // 0 = loop forever
    }

    gif.writeFrame(safeIndex, width, height, frameOptions);
  }

  gif.finish();
  sampledFrameCache.clear();
  return Buffer.from(gif.bytes());
}
