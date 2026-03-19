import { type Canvas } from "@napi-rs/canvas";
import { encodeAnimatedGifWithDelays } from "./encode-animated-gif-with-delays";
import type { ServerAnimationFrame } from "./server-animation-frame.types";

export function encodeAnimatedGif(
  frames: Canvas[],
  frameDelayMs: number = 100,
  colors: number = 256,
  disposal: number = 1,
  backgroundColor = "#ffffff",
  preserveTransparency = false,
): Buffer {
  const delayedFrames: ServerAnimationFrame[] = frames.map((canvas) => ({
    canvas,
    delay: frameDelayMs,
    disposalType: disposal,
  }));
  return encodeAnimatedGifWithDelays(
    delayedFrames,
    colors,
    disposal,
    backgroundColor,
    preserveTransparency,
  );
}
