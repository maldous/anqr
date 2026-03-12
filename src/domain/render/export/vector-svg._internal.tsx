import {
  getAlignmentPatternCenters,
  getVersionFromModuleCount,
  isAlignmentPattern,
  isFinderPattern,
  isTimingPattern,
} from '../../../modules/qr-spec/index';
import type {
  VectorAlignmentStyle,
  VectorFinderStyle,
  VectorGradient,
  VectorModuleStyle,
  VectorSvgConfig,
  VectorTimingStyle,
} from '../../../modules/exporter/types';
import { escapeXml } from '../../../modules/exporter/utils';

/**
 * Helper: Get alignment pattern positions for a given moduleCount
 * Uses getAlignmentPatternCenters from qr-encoder
 */

/**
 * Get alignment positions as {row, col} objects for a given module count
 * Wrapper that uses qr-spec's getAlignmentPositions internally
 */
function getAlignmentPositionsFromModuleCount(
  moduleCount: number
): Array<{ row: number; col: number }> {
  const version = Math.round((moduleCount - 17) / 4);
  return getAlignmentPatternCenters(version, moduleCount);
}

/**
 * Generate SVG path for a single module with styling
 */
function generateModulePath(
  x: number,
  y: number,
  size: number,
  style: VectorModuleStyle,
  cornerRadius: number
): string {
  const r = (cornerRadius / 100) * (size / 2);

  switch (style) {
    case 'rounded': {
      if (r <= 0) return `M${x},${y}h${size}v${size}h${-size}Z`;
      return (
        `M${x + r},${y}` +
        `h${size - 2 * r}` +
        `a${r},${r} 0 0 1 ${r},${r}` +
        `v${size - 2 * r}` +
        `a${r},${r} 0 0 1 ${-r},${r}` +
        `h${-(size - 2 * r)}` +
        `a${r},${r} 0 0 1 ${-r},${-r}` +
        `v${-(size - 2 * r)}` +
        `a${r},${r} 0 0 1 ${r},${-r}Z`
      );
    }
    case 'dots': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const radius = (size / 2) * 0.85;
      return (
        `M${cx - radius},${cy}` +
        `a${radius},${radius} 0 1 0 ${radius * 2},0` +
        `a${radius},${radius} 0 1 0 ${-radius * 2},0Z`
      );
    }
    case 'diamond': {
      const half = size / 2;
      return `M${x + half},${y}l${half},${half}l${-half},${half}l${-half},${-half}Z`;
    }
    case 'connected': {
      return `M${x},${y}h${size}v${size}h${-size}Z`;
    }
    default:
      return `M${x},${y}h${size}v${size}h${-size}Z`;
  }
}

/**
 * Generate SVG for finder pattern with styling
 */
function generateFinderSvg(
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

/**
 * Generate SVG for alignment pattern with styling
 */
function generateAlignmentSvg(
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

/**
 * Generate SVG path for timing pattern modules
 */
function generateTimingModulePath(
  x: number,
  y: number,
  size: number,
  timingStyle: VectorTimingStyle,
  moduleStyle: VectorModuleStyle,
  cornerRadius: number
): string {
  if (timingStyle === 'match_module') {
    return generateModulePath(x, y, size, moduleStyle, cornerRadius);
  }

  if (timingStyle === 'solid') {
    return `M${x},${y}h${size}v${size}h${-size}Z`;
  }

  const dashSize = size * 0.7;
  const offset = (size - dashSize) / 2;
  return `M${x + offset},${y + offset}h${dashSize}v${dashSize}h${-dashSize}Z`;
}

/**
 * Generate gradient definition for SVG
 */
function generateGradientDef(gradient: VectorGradient, id: string): string {
  if (gradient.type === 'none' || !gradient.stops?.length) return '';

  const stops = gradient.stops
    .map((s) => `<stop offset="${s.pos * 100}%" stop-color="${s.color}"/>`)
    .join('');

  switch (gradient.type) {
    case 'linear': {
      const angle = gradient.angle ?? 0;
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 - Math.cos(rad) * 50;
      const y1 = 50 - Math.sin(rad) * 50;
      const x2 = 50 + Math.cos(rad) * 50;
      const y2 = 50 + Math.sin(rad) * 50;
      return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
    }
    case 'radial':
    case 'conic':
      return `<radialGradient id="${id}" cx="50%" cy="50%" r="70%">${stops}</radialGradient>`;
    default:
      return '';
  }
}

export function buildSvgTimingPaths(
  matrix: boolean[][],
  moduleCount: number,
  marginPx: number,
  moduleSize: number,
  timingStyle: VectorTimingStyle,
  moduleStyle: VectorModuleStyle,
  cornerRadius: number
): string {
  let pathData = '';
  for (let col = 8; col < moduleCount - 8; col++) {
    if (matrix[6][col]) {
      const x = marginPx + col * moduleSize;
      const y = marginPx + 6 * moduleSize;
      pathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }
  for (let row = 8; row < moduleCount - 8; row++) {
    if (matrix[row][6]) {
      const x = marginPx + 6 * moduleSize;
      const y = marginPx + row * moduleSize;
      pathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }
  return pathData;
}

export function buildSvgDataPaths(
  matrix: boolean[][],
  moduleCount: number,
  marginPx: number,
  moduleSize: number,
  moduleStyle: VectorModuleStyle,
  cornerRadius: number
): string {
  let pathData = '';
  const version = getVersionFromModuleCount(moduleCount);
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderPattern(row, col, moduleCount)) continue;
      if (isAlignmentPattern(row, col, moduleCount, version)) continue;
      if (isTimingPattern(row, col, moduleCount)) continue;

      if (matrix[row][col]) {
        const x = marginPx + col * moduleSize;
        const y = marginPx + row * moduleSize;
        pathData += `${generateModulePath(x, y, moduleSize, moduleStyle, cornerRadius)} `;
      }
    }
  }
  return pathData;
}

export function buildSvgMetadata(metadata: VectorSvgConfig['metadata']): string {
  if (!metadata) return '';
  const m = metadata;
  let content = '';
  if (m.title) {
    content += `  <title>${escapeXml(m.title)}</title>\n`;
  }
  if (m.description) {
    content += `  <desc>${escapeXml(m.description)}</desc>\n`;
  }
  const dcElements: string[] = [];
  if (m.author) {
    dcElements.push(`        <dc:creator>${escapeXml(m.author)}</dc:creator>`);
  }
  if (m.copyright) {
    dcElements.push(`        <dc:rights>${escapeXml(m.copyright)}</dc:rights>`);
  }
  if (m.creationTime) {
    dcElements.push(`        <dc:date>${new Date().toISOString()}</dc:date>`);
  }
  if (m.software) {
    dcElements.push(`        <dc:source>${escapeXml(m.software)}</dc:source>`);
  }
  if (dcElements.length > 0) {
    content += `  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
${dcElements.join('\n')}
      </rdf:Description>
    </rdf:RDF>
  </metadata>\n`;
  }
  return content;
}

export { getAlignmentPositionsFromModuleCount, generateModulePath, generateFinderSvg, generateAlignmentSvg, generateTimingModulePath, generateGradientDef };
