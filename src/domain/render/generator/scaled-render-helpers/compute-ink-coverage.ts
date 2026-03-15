import type { BlendPreservationCtx } from '../scaled-render-types';

export function computeInkCoverage(
  bctx: BlendPreservationCtx,
  paperLuma: number,
  pixelLuma: number,
  moduleDark: boolean
): number {
  const rawInkContrast = paperLuma - pixelLuma;
  if (!(bctx.blendPreservationMode === 'dither' && bctx.isDitheredMode)) return 1;
  return moduleDark
    ? Math.max(0, Math.min(1, (rawInkContrast - 0.015) / 0.28))
    : Math.max(0, Math.min(1, (rawInkContrast + 0.03) / 0.22));
}
