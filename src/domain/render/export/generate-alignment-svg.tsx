import { generateStyledRingSvg } from "./generate-styled-ring-svg";
import { generateStyledCenterShapeSvg } from "./generate-styled-center-shape-svg";
import type { VectorAlignmentStyle, VectorFinderStyle } from "../../../modules/exporter/types";

/**
 * Generate SVG for alignment pattern with styling
 */
export function generateAlignmentSvg(
  centerX: number,
  centerY: number,
  moduleSize: number,
  style: VectorAlignmentStyle,
  finderStyle: VectorFinderStyle,
  fillColor: string,
): string {
  const effectiveStyle: VectorFinderStyle =
    style === "match_finder" ? finderStyle : (style as VectorFinderStyle);

  const outerSize = 5 * moduleSize;
  const middleSize = 3 * moduleSize;
  const innerSize = 1 * moduleSize;

  const startX = centerX - outerSize / 2;
  const startY = centerY - outerSize / 2;
  const innerOffset = 2 * moduleSize;
  let paths = generateStyledRingSvg(
    startX,
    startY,
    outerSize,
    middleSize,
    effectiveStyle,
    moduleSize,
    fillColor,
  );

  paths += generateStyledCenterShapeSvg(
    startX + innerOffset,
    startY + innerOffset,
    innerSize,
    moduleSize,
    effectiveStyle,
    fillColor,
  );

  return paths;
}
