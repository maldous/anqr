import type { VectorFinderStyle } from "../../../modules/exporter/types";

export function generateStyledRingSvg(
  startX: number,
  startY: number,
  outerSize: number,
  middleSize: number,
  style: VectorFinderStyle,
  moduleSize: number,
  fillColor: string,
): string {
  const middleOffset = (outerSize - middleSize) / 2;

  if (style === "circle") {
    const cx = startX + outerSize / 2;
    const cy = startY + outerSize / 2;
    const outerR = outerSize / 2;
    const innerR = middleSize / 2;
    return `<path d="M${cx - outerR},${cy}a${outerR},${outerR} 0 1 0 ${outerR * 2},0a${outerR},${outerR} 0 1 0 ${-outerR * 2},0Z M${cx - innerR},${cy}a${innerR},${innerR} 0 1 1 ${innerR * 2},0a${innerR},${innerR} 0 1 1 ${-innerR * 2},0Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  }

  if (style === "rounded") {
    const roundedRadius = (outerSize - middleSize) / 2;
    const middleRadius = roundedRadius / 2;
    const middleX = startX + middleOffset;
    const middleY = startY + middleOffset;
    return `<path d="M${startX + roundedRadius},${startY}h${outerSize - 2 * roundedRadius}a${roundedRadius},${roundedRadius} 0 0 1 ${roundedRadius},${roundedRadius}v${outerSize - 2 * roundedRadius}a${roundedRadius},${roundedRadius} 0 0 1 ${-roundedRadius},${roundedRadius}h${-(outerSize - 2 * roundedRadius)}a${roundedRadius},${roundedRadius} 0 0 1 ${-roundedRadius},${-roundedRadius}v${-(outerSize - 2 * roundedRadius)}a${roundedRadius},${roundedRadius} 0 0 1 ${roundedRadius},${-roundedRadius}Z M${middleX + middleRadius},${middleY}h${middleSize - 2 * middleRadius}a${middleRadius},${middleRadius} 0 0 1 ${middleRadius},${middleRadius}v${middleSize - 2 * middleRadius}a${middleRadius},${middleRadius} 0 0 1 ${-middleRadius},${middleRadius}h${-(middleSize - 2 * middleRadius)}a${middleRadius},${middleRadius} 0 0 1 ${-middleRadius},${-middleRadius}v${-(middleSize - 2 * middleRadius)}a${middleRadius},${middleRadius} 0 0 1 ${middleRadius},${-middleRadius}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  }

  return `<path d="M${startX},${startY}h${outerSize}v${outerSize}h${-outerSize}Z M${startX + middleOffset},${startY + middleOffset}h${middleSize}v${middleSize}h${-middleSize}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
}
