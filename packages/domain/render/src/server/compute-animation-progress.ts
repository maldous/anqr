import { type AnimationEasing, applyAnimationEasing } from "../animation";

export function computeAnimationProgress(
  frameIndex: number,
  totalFrames: number,
  easing: AnimationEasing,
  reverse = false,
  bounce = false,
): number {
  let progress = frameIndex / Math.max(1, totalFrames - 1);
  if (reverse) {
    progress = 1 - progress;
  }
  if (bounce) {
    progress = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
  }
  return applyAnimationEasing(progress, easing);
}
