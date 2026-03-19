import { drawFinderPatternComplete } from "@/domain/render/qr-render";
import { fillSkipMaskRect } from "./fill-skip-mask-rect";
import { FINDER_POSITIONS } from "./finder-positions.const";
import type { QRGeneratorConfig } from "./types";

export function drawFinderPatternsToMask(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  config: QRGeneratorConfig,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  skipMask: Uint8Array,
): void {
  for (const basePosition of FINDER_POSITIONS) {
    const position = {
      row: basePosition.row < 0 ? moduleCount + basePosition.row : basePosition.row,
      col: basePosition.col < 0 ? moduleCount + basePosition.col : basePosition.col,
    };
    const x = (position.col + margin) * moduleSize;
    const y = (position.row + margin) * moduleSize;
    drawFinderPatternComplete(ctx as CanvasRenderingContext2D, x, y, moduleSize, config);
    fillSkipMaskRect(
      skipMask,
      moduleCount,
      position.row,
      position.row + 6,
      position.col,
      position.col + 6,
    );
  }
}
