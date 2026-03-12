import type { VectorFinderStyle } from '../../../modules/exporter/types';

/**
 * Generate SVG for finder pattern with styling
 */
export function generateFinderSvg(
  startX: number,
  startY: number,
  moduleSize: number,
  outerStyle: VectorFinderStyle,
  innerStyle: VectorFinderStyle,
  fillColor: string
): string {
  const outerSize = 7 * moduleSize;
  const middleSize = 5 * moduleSize;
  const innerSize = 3 * moduleSize;
  const middleOffset = moduleSize;
  const innerOffset = 2 * moduleSize;

  let paths = '';

  if (outerStyle === 'circle') {
    const cx = startX + outerSize / 2;
    const cy = startY + outerSize / 2;
    const outerR = outerSize / 2;
    const innerR = middleSize / 2;
    paths += `<path d="M${cx - outerR},${cy}a${outerR},${outerR} 0 1 0 ${outerR * 2},0a${outerR},${outerR} 0 1 0 ${-outerR * 2},0Z M${cx - innerR},${cy}a${innerR},${innerR} 0 1 1 ${innerR * 2},0a${innerR},${innerR} 0 1 1 ${-innerR * 2},0Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else if (outerStyle === 'rounded') {
    const r = moduleSize;
    const ir = moduleSize * 0.5;
    const mx = startX + middleOffset;
    const my = startY + middleOffset;
    paths += `<path d="M${startX + r},${startY}h${outerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${outerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z M${mx + ir},${my}h${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${ir},${ir}v${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${-ir},${ir}h${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${-ir},${-ir}v${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${ir},${-ir}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else {
    paths += `<path d="M${startX},${startY}h${outerSize}v${outerSize}h${-outerSize}Z M${startX + middleOffset},${startY + middleOffset}h${middleSize}v${middleSize}h${-middleSize}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  }

  const ix = startX + innerOffset;
  const iy = startY + innerOffset;
  if (innerStyle === 'circle') {
    const cx = ix + innerSize / 2;
    const cy = iy + innerSize / 2;
    paths += `<circle cx="${cx}" cy="${cy}" r="${innerSize / 2}" fill="${fillColor}"/>`;
  } else if (innerStyle === 'rounded') {
    const r = moduleSize * 0.5;
    paths += `<path d="M${ix + r},${iy}h${innerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${innerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z" fill="${fillColor}"/>`;
  } else {
    paths += `<rect x="${ix}" y="${iy}" width="${innerSize}" height="${innerSize}" fill="${fillColor}"/>`;
  }

  return paths;
}
