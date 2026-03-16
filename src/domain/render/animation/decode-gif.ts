import { decompressFrames, parseGIF } from "gifuct-js";
import type { DecodedGif, GifPatchFrame } from "./gif-codec.types";
import { getGifFrameStats } from "./gif-frame-stats";
import { log } from "./log";

export function decodeGif(arrayBuffer: ArrayBuffer): DecodedGif {
  const parsed = parseGIF(arrayBuffer);
  const frames = decompressFrames(parsed, true) as unknown as GifPatchFrame[];
  const { width, height } = parsed.lsd;

  const { uniqueDelays, uniqueDisposals, totalDurationMs } = getGifFrameStats(frames);

  log.debug("decodeGif: decoded", {
    width,
    height,
    frameCount: frames.length,
    firstDelays: frames.slice(0, 5).map((f) => f.delay),
    uniqueDelays,
    uniqueDisposals,
    totalDurationMs,
    bytesIn: arrayBuffer.byteLength,
  });

  return { width, height, frames };
}
