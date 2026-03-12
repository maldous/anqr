import type { DitherBlendFlags } from './dither-blend-flags';

export function computeOverlayLightBlendParams(flags: DitherBlendFlags): {
  maxBlend: number;
  whiteBase: number;
  whitePush: number;
} {
  if (flags.functionalExtremeBlend) return { maxBlend: 0.62, whiteBase: 0.58, whitePush: 0.32 };
  if (flags.blendPresFunctionalOverlay && flags.isExtreme)
    return { maxBlend: 0.42, whiteBase: 0.82, whitePush: 0.18 };
  if (flags.blendPresFunctionalOverlay) return { maxBlend: 0.36, whiteBase: 0.7, whitePush: 0.3 };
  if (flags.isExtreme) return { maxBlend: 0.34, whiteBase: 0.82, whitePush: 0.18 };
  return { maxBlend: 0.25, whiteBase: 0.7, whitePush: 0.3 };
}
