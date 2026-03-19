import { generateStyledRingSvg } from "./generate-styled-ring-svg";
import { generateStyledCenterShapeSvg } from "./generate-styled-center-shape-svg";
import type { VectorFinderStyle } from "../export-shared/types";

/**
 * Generate SVG for finder pattern with styling
 */
export function generateFinderSvg(
  startX: number,
  startY: number,
  moduleSize: number,
  outerStyle: VectorFinderStyle,
  innerStyle: VectorFinderStyle,
  fillColor: string,
): string {
  const outerSize = 7 * moduleSize;
  const middleSize = 5 * moduleSize;
  const innerSize = 3 * moduleSize;
  const innerOffset = 2 * moduleSize;
  let paths = generateStyledRingSvg(
    startX,
    startY,
    outerSize,
    middleSize,
    outerStyle,
    moduleSize,
    fillColor,
  );

  paths += generateStyledCenterShapeSvg(
    startX + innerOffset,
    startY + innerOffset,
    innerSize,
    moduleSize,
    innerStyle,
    fillColor,
  );

  return paths;
}
