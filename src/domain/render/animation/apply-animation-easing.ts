import type { AnimationEasing } from './shared-patterns.types';

// ============================================
// EASING
// ============================================

/**
 * Apply easing function to progress value (0-1)
 */
export function applyAnimationEasing(progress: number, easing: AnimationEasing): number {
  switch (easing) {
    case 'ease_in':
      return progress * progress;
    case 'ease_out':
      return 1 - (1 - progress) * (1 - progress);
    case 'ease_in_out':
      return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
    case 'bounce':
      if (progress < 0.5) {
        return 8 * progress * progress * progress * progress;
      } else {
        return 1 - (-2 * progress + 2) ** 4 / 2;
      }
    default:
      return progress;
  }
}
