import { renderDitheredDarkPixel } from "./render-dithered-dark-pixel";
import { renderDitheredLightPixel } from "./render-dithered-light-pixel";
import { renderNonDitheredDarkPixel } from "./render-nondithered-dark-pixel";
import { renderNonDitheredLightPixel } from "./render-nondithered-light-pixel";
import type { PixelColor, PixelGridCtx } from "../scaled-render-types";

export function dispatchPixelRender(
  pgctx: PixelGridCtx,
  x: number,
  y: number,
  isDark: boolean | undefined,
  color: PixelColor | null,
  shouldDrawLightPixel: boolean,
): void {
  const dx = pgctx.marginPx + x * pgctx.subPixelSize;
  const dy = pgctx.marginPx + y * pgctx.subPixelSize;
  const moduleRow = Math.floor(y / pgctx.scale);
  const moduleCol = Math.floor(x / pgctx.scale);
  const moduleLocked = pgctx.shouldForceBinaryModule(moduleRow, moduleCol);
  if (!isDark) {
    if (pgctx.isDitheredMode) return renderDitheredLightPixel(pgctx, x, y, dx, dy, color);
    if (!shouldDrawLightPixel) return;
  }
  if (isDark) {
    if (pgctx.isDitheredMode) {
      return renderDitheredDarkPixel(pgctx, x, y, dx, dy, color, moduleLocked);
    }
    return renderNonDitheredDarkPixel(pgctx, dx, dy, color);
  }
  renderNonDitheredLightPixel(pgctx, dx, dy, color);
}
