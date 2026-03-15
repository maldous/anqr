import { drawAlignmentPattern } from '../../domain/render/generator/drawing';
import { getAlignmentPositionsCached } from '../../domain/render/generator/pattern-helpers';
import { fillSkipMaskRect } from './fill-skip-mask-rect';
import type { QRGeneratorConfig } from './types';

export function drawAlignmentPatternsToMask(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  config: QRGeneratorConfig,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  version: number,
  skipMask: Uint8Array
): void {
  const alignmentStyle = config.alignmentStyle || 'match_finder';
  const alignPositions = getAlignmentPositionsCached(version, moduleCount);
  for (const pos of alignPositions) {
    const centerX = (pos.col + margin) * moduleSize + moduleSize / 2;
    const centerY = (pos.row + margin) * moduleSize + moduleSize / 2;
    drawAlignmentPattern(
      ctx as CanvasRenderingContext2D,
      centerX,
      centerY,
      moduleSize,
      alignmentStyle,
      config
    );
    fillSkipMaskRect(skipMask, moduleCount, pos.row - 2, pos.row + 2, pos.col - 2, pos.col + 2);
  }
}
