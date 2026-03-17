import { type Canvas } from "@napi-rs/canvas";
import { FetchedImage } from "./fetched-image.types";
import { ServerAnimationFrame } from "./server-animation-frame.types";
import { parseGifFramesServer } from "./parse-gif-frames-server";
import { qrFnLog } from "./qr-fn-log";
import { SERVER_MAX_ANIMATION_FRAMES } from "./server-max-animation-frames.const";
import { decimateFramesToMaxCount } from "./decimate-frames-to-max-count";
import { decimateFramesToMaxFps } from "./decimate-frames-to-max-fps";

export function processAnimatedGifFrames(
  fetchedImage: FetchedImage,
  gifDisposalHandling: string,
  gifMaxFps: number,
  preprocess: (c: Canvas) => Canvas,
): { overlayCanvas: Canvas; overlayFrames: ServerAnimationFrame[] } {
  const tParse = Date.now();
  let rawFrames = parseGifFramesServer(
    fetchedImage.arrayBuffer,
    gifDisposalHandling === "simplify" ? "simplify" : "respect",
  );
  qrFnLog("[TIMING] GIF frame parsing", {
    frames: rawFrames.length,
    parseMs: Date.now() - tParse,
  });

  if (rawFrames.length > SERVER_MAX_ANIMATION_FRAMES) {
    qrFnLog("[TIMING] limiting frames", {
      from: rawFrames.length,
      to: SERVER_MAX_ANIMATION_FRAMES,
    });
    rawFrames = decimateFramesToMaxCount(rawFrames, SERVER_MAX_ANIMATION_FRAMES);
  }

  const tPreprocess = Date.now();
  let overlayFrames = rawFrames.map((frame) => ({
    ...frame,
    canvas: preprocess(frame.canvas),
  }));
  qrFnLog("[TIMING] frame preprocessing", {
    frames: overlayFrames.length,
    preprocessMs: Date.now() - tPreprocess,
  });
  if (gifMaxFps > 0 && overlayFrames.length > 1 && !Number.isNaN(gifMaxFps)) {
    overlayFrames = decimateFramesToMaxFps(overlayFrames, gifMaxFps);
  }
  const overlayCanvas = overlayFrames[0]?.canvas ?? preprocess(fetchedImage.canvas);
  return { overlayCanvas, overlayFrames };
}
