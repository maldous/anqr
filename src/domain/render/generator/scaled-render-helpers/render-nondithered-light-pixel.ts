import { adjustLumaPreserveChroma } from "./adjust-luma-preserve-chroma";
import type { PixelColor, PixelGridCtx } from "../scaled-render-types";

export function renderNonDitheredLightPixel(
  pgctx: PixelGridCtx,
  dx: number,
  dy: number,
  color: PixelColor | null,
): void {
  const {
    ctx,
    subPixelSize,
    useColorRendering,
    needsBothDarkAndLightColors,
    effectiveBgColor,
    subpixelLightTargetLuma,
    subpixelLightChroma,
  } = pgctx;
  if (needsBothDarkAndLightColors && useColorRendering && color) {
    const light = adjustLumaPreserveChroma(color, subpixelLightTargetLuma, subpixelLightChroma);
    ctx.fillStyle = `rgb(${light.r},${light.g},${light.b})`;
  } else {
    ctx.fillStyle = effectiveBgColor;
  }
  ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
}
