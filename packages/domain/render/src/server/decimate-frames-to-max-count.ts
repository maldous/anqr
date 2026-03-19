import type { ServerAnimationFrame } from "./server-animation-frame.types";

export function decimateFramesToMaxCount(
  frames: ServerAnimationFrame[],
  maxFrames: number,
): ServerAnimationFrame[] {
  if (frames.length <= 1 || maxFrames <= 0 || frames.length <= maxFrames) {
    return frames;
  }

  const delays = frames.map((frame) => {
    const delay = Number.isFinite(frame.delay) ? frame.delay : 100;
    return delay > 0 ? delay : 100;
  });
  const totalDelay = delays.reduce((sum, delay) => sum + delay, 0);
  if (totalDelay <= 0) {
    return frames.slice(0, maxFrames);
  }

  const desiredFrameCount = Math.min(frames.length, Math.max(1, Math.floor(maxFrames)));
  if (desiredFrameCount === 1) {
    return [{ ...frames[0], delay: totalDelay }];
  }

  const keepIndices = new Set<number>([0, frames.length - 1]);
  const intervals = desiredFrameCount - 1;
  for (let step = 1; step < intervals; step++) {
    const targetTime = (totalDelay * step) / intervals;
    let idx = 0;
    let elapsed = 0;
    while (idx < frames.length - 1 && elapsed + delays[idx] <= targetTime) {
      elapsed += delays[idx];
      idx += 1;
    }
    keepIndices.add(idx);
  }

  const orderedKeepIndices = Array.from(keepIndices).sort((a, b) => a - b);
  const decimated: ServerAnimationFrame[] = [];
  for (let pos = 0; pos < orderedKeepIndices.length; pos++) {
    const startIdx = orderedKeepIndices[pos];
    const endExclusive =
      pos + 1 < orderedKeepIndices.length ? orderedKeepIndices[pos + 1] : frames.length;
    let mergedDelay = 0;
    for (let i = startIdx; i < endExclusive; i++) {
      mergedDelay += delays[i];
    }
    decimated.push({
      ...frames[startIdx],
      delay: mergedDelay,
    });
  }
  return decimated;
}
