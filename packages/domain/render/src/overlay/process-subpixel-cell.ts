import { isFinderPattern } from "@/domain/qr/spec";
import type { RGBWithMeta } from "@/domain/render/qr-generator-shared";
import { isFinderSeparator } from "./is-finder-separator";
import { shouldLockModule } from "./should-lock-module";
import { resolveOverlayColor } from "./resolve-overlay-color";
import { resolveHalftoneColor } from "./resolve-halftone-color";
import type { SubpixelCellCtx } from "./subpixel-cell-ctx";

export function processSubpixelCell(
  ctx: SubpixelCellCtx,
  x: number,
  y: number,
  matrix: boolean[][],
  colorMatrix: (RGBWithMeta | null)[][],
): void {
  const moduleRow = Math.floor(y / ctx.actualScale);
  const moduleCol = Math.floor(x / ctx.actualScale);
  const subX = x % ctx.actualScale;
  const subY = y % ctx.actualScale;
  const isCenter = subX === ctx.centerIdx && subY === ctx.centerIdx;

  const qrValue = ctx.qr.isDark(moduleRow, moduleCol);
  const overlayBrightness = ctx.brightness[y]?.[x] ?? 0.5;
  const overlayColor = ctx.colors[y]?.[x];

  const lockModule = shouldLockModule(
    moduleRow,
    moduleCol,
    ctx.moduleCount,
    ctx.version,
    ctx.config,
  );
  const isFinderModule =
    isFinderPattern(moduleRow, moduleCol, ctx.moduleCount) ||
    isFinderSeparator(moduleRow, moduleCol, ctx.moduleCount);
  const forceSolidFinder = ctx.finderOverride === "solid" && isFinderModule && lockModule;

  if (lockModule || forceSolidFinder) {
    matrix[y][x] = qrValue;
    colorMatrix[y][x] = null;
    return;
  }

  if (isCenter) {
    matrix[y][x] = qrValue;
    colorMatrix[y][x] =
      ctx.useHalftone && qrValue
        ? resolveHalftoneColor(overlayColor, ctx.neutralColor, overlayBrightness)
        : resolveOverlayColor(overlayColor, ctx.neutralColor);
    return;
  }

  const threshold = 0.5 - ctx.intensity * 0.3;
  matrix[y][x] = overlayBrightness < threshold;
  colorMatrix[y][x] = resolveOverlayColor(overlayColor, ctx.neutralColor);
}
