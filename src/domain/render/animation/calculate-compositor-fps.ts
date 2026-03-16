import type { GifCompositor } from "../../../modules/animation/types";

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
