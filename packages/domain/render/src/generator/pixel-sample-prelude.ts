import { pixelIndex } from "./pixel-index";
import { luma01 } from "./luma01";
import { shapeOverlayDarkness } from "./shape-overlay-darkness";
import { shouldLockModule } from "./should-lock-module";
import { isFixedDarkModule } from "./is-fixed-dark-module";

import type { QRGeneratorConfig } from "./types";

export function pixelSamplePrelude(
  ctx: {
    config: QRGeneratorConfig;
    data: Uint8ClampedArray;
    moduleCount: number;
    qr: { isDark: (row: number, col: number) => boolean };
    scale: number;
    scaledSize: number;
    version: number;
  },
  x: number,
  y: number,
) {
  const sampleIdx = pixelIndex(x, y, ctx.scaledSize);
  const idx = sampleIdx * 4;
  const r = ctx.data[idx];
  const g = ctx.data[idx + 1];
  const b = ctx.data[idx + 2];
  const moduleRow = Math.floor(y / ctx.scale);
  const moduleCol = Math.floor(x / ctx.scale);
  const qrIsDark = ctx.qr.isDark(moduleRow, moduleCol);
  const moduleLocked = shouldLockModule(
    moduleRow,
    moduleCol,
    ctx.moduleCount,
    ctx.version,
    ctx.config,
  );
  const fixedDarkUnlocked =
    !moduleLocked && isFixedDarkModule(moduleRow, moduleCol, ctx.moduleCount);
  const overlayDark = shapeOverlayDarkness(1 - luma01(r, g, b));

  return {
    b,
    fixedDarkUnlocked,
    g,
    moduleCol,
    moduleLocked,
    moduleRow,
    overlayDark,
    qrIsDark,
    r,
    sampleIdx,
  };
}
