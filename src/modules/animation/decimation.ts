/**
 * Frame Decimation Utilities
 */

import type { AnimationFrame, GifCompositor } from './types';

/**
 * Calculate effective FPS from frame delays
 */
export function calculateSourceFps(frames: AnimationFrame[]): number {
  if (frames.length === 0) return 10;
  const totalDelay = frames.reduce((sum, f) => sum + (f.delay || 100), 0);
  const avgDelay = totalDelay / frames.length;
  return 1000 / avgDelay;
}

/**
 * Calculate FPS from a GIF compositor
 */
export function calculateCompositorFps(compositor: GifCompositor): number {
  if (compositor.frameCount === 0) return 10;
  let totalDelay = 0;
  for (let i = 0; i < compositor.frameCount; i++) {
    totalDelay += compositor.delayMs(i);
  }
  const avgDelay = totalDelay / compositor.frameCount;
  return 1000 / avgDelay;
}

/**
 * Calculate which frame indices to keep for target FPS (compositor version)
 */
export function decimateCompositorFrames(compositor: GifCompositor, targetFps: number): number[] {
  if (compositor.frameCount <= 1 || targetFps <= 0) {
    return Array.from({ length: compositor.frameCount }, (_, i) => i);
  }

  const sourceFps = calculateCompositorFps(compositor);

  if (sourceFps <= targetFps) {
    return Array.from({ length: compositor.frameCount }, (_, i) => i);
  }

  const ratio = sourceFps / targetFps;
  const keepIndices: number[] = [];

  let accumulator = 0;
  for (let i = 0; i < compositor.frameCount; i++) {
    accumulator += 1;
    if (accumulator >= ratio) {
      keepIndices.push(i);
      accumulator -= ratio;
    }
  }

  const lastIdx = compositor.frameCount - 1;
  if (keepIndices.length > 0) {
    if (keepIndices[0] !== 0) {
      keepIndices.unshift(0);
    }
    if (keepIndices[keepIndices.length - 1] !== lastIdx) {
      keepIndices.push(lastIdx);
    }
  }

  return keepIndices;
}

/**
 * Decimate frames to target FPS by skipping frames
 * @deprecated Use decimateCompositorFrames with GifCompositor instead
 */
export function decimateFramesToFps(frames: AnimationFrame[], targetFps: number): number[] {
  if (frames.length <= 1 || targetFps <= 0) {
    return frames.map((_, i) => i);
  }

  const sourceFps = calculateSourceFps(frames);

  if (sourceFps <= targetFps) {
    return frames.map((_, i) => i);
  }

  const ratio = sourceFps / targetFps;
  const keepIndices: number[] = [];

  let accumulator = 0;
  for (let i = 0; i < frames.length; i++) {
    accumulator += 1;
    if (accumulator >= ratio) {
      keepIndices.push(i);
      accumulator -= ratio;
    }
  }

  if (keepIndices.length > 0 && keepIndices[0] !== 0) {
    keepIndices.unshift(0);
  }
  if (keepIndices.length > 0 && keepIndices[keepIndices.length - 1] !== frames.length - 1) {
    keepIndices.push(frames.length - 1);
  }

  return keepIndices;
}
