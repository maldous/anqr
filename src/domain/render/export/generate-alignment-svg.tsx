import type { VectorAlignmentStyle, VectorFinderStyle } from '../../../modules/exporter/types';

/**
 * Generate SVG for alignment pattern with styling
 */
export function generateAlignmentSvg(
  centerX: number,
  centerY: number,
  moduleSize: number,
  style: VectorAlignmentStyle,
  finderStyle: VectorFinderStyle,
  fillColor: string
): string {
  const effectiveStyle: VectorFinderStyle =
    style === 'match_finder' ? finderStyle : (style as VectorFinderStyle);

  const outerSize = 5 * moduleSize;
  const middleSize = 3 * moduleSize;
  const innerSize = 1 * moduleSize;

  const startX = centerX - outerSize / 2;
  const startY = centerY - outerSize / 2;
  const middleOffset = moduleSize;
  const innerOffset = 2 * moduleSize;

  let paths = '';

  if (effectiveStyle === 'circle') {
    const outerR = outerSize / 2;
    const middleR = middleSize / 2;
    paths += `<path d="M${centerX - outerR},${centerY}a${outerR},${outerR} 0 1 0 ${outerR * 2},0a${outerR},${outerR} 0 1 0 ${-outerR * 2},0Z M${centerX - middleR},${centerY}a${middleR},${middleR} 0 1 1 ${middleR * 2},0a${middleR},${middleR} 0 1 1 ${-middleR * 2},0Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else if (effectiveStyle === 'rounded') {
    const r = moduleSize * 0.5;
    const ir = moduleSize * 0.3;
    const mx = startX + middleOffset;
    const my = startY + middleOffset;
    paths += `<path d="M${startX + r},${startY}h${outerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${outerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z M${mx + ir},${my}h${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${ir},${ir}v${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${-ir},${ir}h${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${-ir},${-ir}v${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${ir},${-ir}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else {
    paths += `<path d="M${startX},${startY}h${outerSize}v${outerSize}h${-outerSize}Z M${startX + middleOffset},${startY + middleOffset}h${middleSize}v${middleSize}h${-middleSize}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  }

  const ix = startX + innerOffset;
  const iy = startY + innerOffset;
  if (effectiveStyle === 'circle') {
    paths += `<circle cx="${centerX}" cy="${centerY}" r="${innerSize / 2}" fill="${fillColor}"/>`;
  } else if (effectiveStyle === 'rounded') {
    const r = moduleSize * 0.2;
    paths += `<path d="M${ix + r},${iy}h${innerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${innerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z" fill="${fillColor}"/>`;
  } else {
    paths += `<rect x="${ix}" y="${iy}" width="${innerSize}" height="${innerSize}" fill="${fillColor}"/>`;
  }

  return paths;
}
