import type { ServerAnimationFrame } from "./server-animation-frame.types";
import { decimateFramesToMaxCount } from "./decimate-frames-to-max-count";

export function decimateFramesToMaxFps(
  frames: ServerAnimationFrame[],
  targetFps: number,
): ServerAnimationFrame[] {
  if (frames.length <= 1 || targetFps <= 0) {
    return frames;
  }

  const frameDelays = frames.map((frame) => {
    const delay = Number.isFinite(frame.delay) ? frame.delay : 100;
    return delay > 0 ? delay : 100;
  });
  const totalDelay = frameDelays.reduce((sum, delay) => sum + delay, 0);
  const sourceFps = totalDelay > 0 ? (frames.length * 1000) / totalDelay : 0;

  if (!sourceFps || sourceFps <= targetFps) {
    return frames;
  }

  // Keep duration constant while reducing frame count based on requested FPS.
  const targetFrameCount = Math.max(1, Math.floor((totalDelay * targetFps) / 1000));
  return decimateFramesToMaxCount(frames, targetFrameCount);
}
