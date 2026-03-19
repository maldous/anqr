import type { AnimationOptions } from "../animation/types";

export function resolveEffectBounds(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options: Partial<AnimationOptions>,
): { x: number; y: number; width: number; height: number } {
  const raw = options.effectBounds;
  if (!raw) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }

  const x = Math.max(0, Math.min(canvas.width, Math.floor(raw.x)));
  const y = Math.max(0, Math.min(canvas.height, Math.floor(raw.y)));
  const width = Math.max(0, Math.min(canvas.width - x, Math.floor(raw.width)));
  const height = Math.max(0, Math.min(canvas.height - y, Math.floor(raw.height)));
  if (width === 0 || height === 0) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }

  return { x, y, width, height };
}
