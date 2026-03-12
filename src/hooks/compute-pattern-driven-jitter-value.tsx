import type { PatternEffect } from './pattern-effect';

export function computePatternDrivenJitterValue(
  frameIndex: number,
  totalFrames: number,
  baseJitterPx: number,
  modulePatternEffects: PatternEffect[]
): number {
  let jitter = baseJitterPx;
  for (const effect of modulePatternEffects) {
    const progress = frameIndex / Math.max(1, totalFrames - 1);
    const phase = Math.sin(progress * Math.PI * 2 + effect.seed * 0.013);
    const intensity = (phase + 1) / 2;
    switch (effect.pattern) {
      case 'pulse':
        jitter += 0.3 + intensity * 0.7;
        break;
      case 'wave':
        jitter += 0.6 + intensity * 0.65;
        break;
      case 'scanline':
        jitter += intensity * 0.8;
        break;
      case 'shimmer':
        jitter += (Math.sin((frameIndex + effect.seed * 3) * 1.6) + 1) * 0.35;
        break;
      case 'drift':
        jitter += 0.4 + intensity * 0.75;
        break;
      default:
        break;
    }
  }
  return Math.min(2.4, Math.max(0, Number(jitter.toFixed(3))));
}
