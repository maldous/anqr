import { drawAlignmentPatternsToMask } from "./draw-alignment-patterns-to-mask";
import { drawFinderPatternsToMask } from "./draw-finder-patterns-to-mask";
import type { QRGeneratorConfig } from "./types";

export function drawStructuralPatterns(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  config: QRGeneratorConfig,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  overlayData: unknown,
  version: number,
): Uint8Array {
  const skipMask = new Uint8Array(moduleCount * moduleCount);

  if (config.preserveFinders !== false || !overlayData) {
    drawFinderPatternsToMask(ctx, config, moduleCount, moduleSize, margin, skipMask);
  }

  if (version >= 2 && (config.preserveAlignment !== false || !overlayData)) {
    drawAlignmentPatternsToMask(ctx, config, moduleCount, moduleSize, margin, version, skipMask);
  }

  return skipMask;
}
