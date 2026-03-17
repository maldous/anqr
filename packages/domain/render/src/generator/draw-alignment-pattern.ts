import type { QRGeneratorConfig } from "@/modules/qr-generator/types";
import { validateColor } from "@/modules/qr-generator/utils";
import { drawAlignmentRing } from "./draw-alignment-ring";

/**
 * Draw an alignment pattern at the specified center position
 */
export function drawAlignmentPattern(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  moduleSize: number,
  style: string,
  config: QRGeneratorConfig,
): void {
  // IMPORTANT: Validate colors - invalid fillStyle values cause canvas to use black
  const fgColor = validateColor(config.fgColor, "#000000");
  const bgColor = validateColor(config.bgColor, "#ffffff");

  // Alignment pattern is 5x5 modules
  const outerSize = 5 * moduleSize;
  const middleSize = 3 * moduleSize;
  const innerSize = 1 * moduleSize;

  const effectiveStyle = style === "match_finder" ? config.finderStyle || "square" : style;

  // Outer ring (dark)
  ctx.fillStyle = fgColor;
  drawAlignmentRing(
    ctx,
    centerX - outerSize / 2,
    centerY - outerSize / 2,
    outerSize,
    effectiveStyle,
  );

  // Middle ring (light)
  ctx.fillStyle = bgColor;
  drawAlignmentRing(
    ctx,
    centerX - middleSize / 2,
    centerY - middleSize / 2,
    middleSize,
    effectiveStyle,
  );

  // Inner dot (dark)
  ctx.fillStyle = fgColor;
  drawAlignmentRing(
    ctx,
    centerX - innerSize / 2,
    centerY - innerSize / 2,
    innerSize,
    effectiveStyle,
  );
}
