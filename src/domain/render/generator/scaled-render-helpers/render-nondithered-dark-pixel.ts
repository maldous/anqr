import { adjustLumaPreserveChroma } from './adjust-luma-preserve-chroma';
import type { PixelColor, PixelGridCtx } from '../scaled-render-types';

export function renderNonDitheredDarkPixel(
  pgctx: PixelGridCtx,
  dx: number,
  dy: number,
  color: PixelColor | null
): void {
  const {
    ctx,
    subPixelSize,
    useColorRendering,
    needsBothDarkAndLightColors,
    useGradient,
    gradientFill,
    effectiveFgColor,
    subpixelDarkTargetLuma,
    subpixelDarkChroma,
  } = pgctx;
  if (useColorRendering && color) {
    const adjusted = adjustLumaPreserveChroma(color, subpixelDarkTargetLuma, subpixelDarkChroma);
    ctx.fillStyle = needsBothDarkAndLightColors
      ? `rgb(${adjusted.r},${adjusted.g},${adjusted.b})`
      : `rgb(${color.r},${color.g},${color.b})`;
  } else {
    ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
  }
  ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
}
