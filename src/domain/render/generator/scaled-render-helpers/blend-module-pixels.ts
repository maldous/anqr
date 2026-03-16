import type { BlendPreservationCtx } from "../scaled-render-types";
import { computeInkCoverage } from "./compute-ink-coverage";

export function blendModulePixels(
  bctx: BlendPreservationCtx,
  data: Uint8ClampedArray,
  row: number,
  col: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  const moduleDark = bctx.qr.isDark(row, col);

  for (let py = y0; py < y1; py++) {
    let idx = (py * bctx.size + x0) * 4;
    const scaledRow = Math.max(
      0,
      Math.min(
        bctx.scaledSize - 1,
        Math.floor((py - bctx.marginPx) / Math.max(1e-6, bctx.subPixelSize)),
      ),
    );

    for (let px = x0; px < x1; px++) {
      const scaledCol = Math.max(
        0,
        Math.min(
          bctx.scaledSize - 1,
          Math.floor((px - bctx.marginPx) / Math.max(1e-6, bctx.subPixelSize)),
        ),
      );
      const sampled = bctx.colors[scaledRow]?.[scaledCol] ?? bctx.sampleModuleColor(row, col);
      const paperLuma = bctx.estimatePaperLuma(sampled ?? null);
      const pixelLuma = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
      const inkCoverageN = computeInkCoverage(bctx, paperLuma, pixelLuma, moduleDark);

      if (inkCoverageN > 1e-3) {
        const target = bctx.getBlendTarget(row, col, scaledRow, scaledCol);
        const t = bctx.finderStrengthN * inkCoverageN;
        data[idx] = bctx.blendChannelToward(data[idx], target.r, t);
        data[idx + 1] = bctx.blendChannelToward(data[idx + 1], target.g, t);
        data[idx + 2] = bctx.blendChannelToward(data[idx + 2], target.b, t);
      }

      idx += 4;
    }
  }
}
