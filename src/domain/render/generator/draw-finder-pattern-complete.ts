import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';
import { validateColor } from '../../../modules/qr-generator/utils';
import { drawFinderRing } from './draw-finder-ring';

/**
 * Draw a complete finder pattern at the specified position
 */
export function drawFinderPatternComplete(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  config: QRGeneratorConfig
): void {
  const outerStyle = config.eyeOuterStyle || config.finderStyle || 'square';
  const innerStyle = config.eyeInnerStyle || config.finderStyle || 'square';
  // eyeScale is stored as percentage (100 = 100%) in the store, convert to decimal multiplier
  const eyeScale = (config.eyeScale ?? 100) / 100;
  // IMPORTANT: Validate colors - invalid fillStyle values cause canvas to use black
  const fgColor = validateColor(config.fgColor, '#000000');
  const bgColor = validateColor(config.bgColor, '#ffffff');

  const outerSize = 7 * moduleSize;
  const middleSize = 5 * moduleSize;
  const innerSize = 3 * moduleSize;

  const scaledOuterSize = outerSize * eyeScale;
  const scaledMiddleSize = middleSize * eyeScale;
  const scaledInnerSize = innerSize * eyeScale;

  const outerOffset = (outerSize - scaledOuterSize) / 2;
  const _middleOffset = moduleSize + (outerSize - scaledOuterSize) / 2;
  const _innerOffset = 2 * moduleSize + (outerSize - scaledOuterSize) / 2;

  // Draw outer ring (dark)
  ctx.fillStyle = fgColor;
  drawFinderRing(ctx, x + outerOffset, y + outerOffset, scaledOuterSize, outerStyle);

  // Draw middle ring (light/background)
  ctx.fillStyle = bgColor;
  const middleRingSize = scaledMiddleSize;
  const middleRingOffset = (scaledOuterSize - middleRingSize) / 2;
  drawFinderRing(
    ctx,
    x + outerOffset + middleRingOffset,
    y + outerOffset + middleRingOffset,
    middleRingSize,
    outerStyle
  );

  // Draw inner dot (dark)
  ctx.fillStyle = fgColor;
  const innerDotSize = scaledInnerSize;
  const innerDotOffset = (scaledOuterSize - innerDotSize) / 2;
  drawFinderRing(
    ctx,
    x + outerOffset + innerDotOffset,
    y + outerOffset + innerDotOffset,
    innerDotSize,
    innerStyle
  );
}
