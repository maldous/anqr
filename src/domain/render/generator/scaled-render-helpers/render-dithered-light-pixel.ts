import { adjustLumaPreserveChroma } from './adjust-luma-preserve-chroma';
import type { PixelColor, PixelGridCtx } from '../scaled-render-types';
import { hash01 } from '../hash01';

export function renderDitheredLightPixel(
  pgctx: PixelGridCtx,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: PixelColor | null
): void {
  const {
    ctx,
    seed,
    lightGrainDensity,
    lightGrainAlpha,
    qrFirstMode,
    dotMinRadiusPx,
    quantizeRadius,
    localVariance,
    drawDitherDot,
  } = pgctx;
  const sourceLuma = color ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255 : 1;
  const toneN = 1 - sourceLuma;
  const varN = localVariance(x, y);
  const noiseN = hash01(x, y, seed + 149);
  const grainChance = Math.max(
    0,
    Math.min(
      qrFirstMode ? 0.2 : 0.08,
      lightGrainDensity * (0.9 + toneN * 1.5 + varN * 1.1 + (noiseN - 0.5) * 0.3)
    )
  );
  if (grainChance > 0 && hash01(x, y, seed + 131) < grainChance) {
    const lightTarget = Math.max(0.32, Math.min(0.76, 0.46 + sourceLuma * 0.22 - varN * 0.06));
    const grain = color
      ? adjustLumaPreserveChroma(color, lightTarget, 1.42)
      : { r: 226, g: 226, b: 226 };
    ctx.fillStyle = `rgb(${grain.r},${grain.g},${grain.b})`;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = Math.min(
      0.12,
      Math.max(0.02, lightGrainAlpha * (0.55 + toneN * 0.4 + varN * 0.18 + (noiseN - 0.5) * 0.08))
    );
    const grainRadius = Math.max(
      0.04,
      quantizeRadius(dotMinRadiusPx * (0.95 + toneN * 0.7 + varN * 0.22 + noiseN * 0.16))
    );
    drawDitherDot(dx, dy, grainRadius, 0.25 + 0.08 * noiseN);
    ctx.globalAlpha = prevAlpha;
  }
}
