/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Convert canvas list to AnimationFrame array.
 */

import type { AnimationFrame } from "@/modules/animation";

export function canvasListToAnimationFrames(
  canvases: (HTMLCanvasElement | OffscreenCanvas)[],
  speedMs: number,
): AnimationFrame[] {
  return canvases.map((canvas) => ({ canvas, delay: speedMs, disposalType: 0 }));
}
