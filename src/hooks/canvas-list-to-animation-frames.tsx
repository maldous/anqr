import type { AnimationFrame } from "../domain/render/animation";

export function canvasListToAnimationFrames(
  canvases: (HTMLCanvasElement | OffscreenCanvas)[],
  speedMs: number,
): AnimationFrame[] {
  return canvases.map((canvas) => ({ canvas, delay: speedMs, disposalType: 0 }));
}
