/**
 * Exporter Module - Vector SVG Export
 * Handles true vector SVG export from QR matrix
 */

import { Capacitor } from '@capacitor/core';
import {
  getAlignmentPatternCenters,
  isAlignmentPattern,
  isFinderPattern,
  isTimingPattern,
} from '../qr-encoder';
import type {
  ExportResult,
  VectorAlignmentStyle,
  VectorFinderStyle,
  VectorGradient,
  VectorModuleStyle,
  VectorSvgConfig,
  VectorTimingStyle,
} from './types';
import { downloadUrl, escapeXml } from './utils';

/**
 * Helper: Get alignment pattern positions for a given moduleCount
 */
function getAlignmentPositions(moduleCount: number): Array<{ row: number; col: number }> {
  const version = Math.round((moduleCount - 17) / 4);
  return getAlignmentPatternCenters(version);
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

/**
 * Export QR matrix as true vector SVG with full styling support
 */
export function exportVectorSvg(matrix: boolean[][], config: VectorSvgConfig = {}): ExportResult {
  const moduleCount = matrix.length;
  const moduleSize = config.moduleSize ?? 10;
  const margin = config.margin ?? 4;
  const fgColor = config.fgColor ?? '#000000';
  const bgColor = config.bgColor ?? '#ffffff';
  const filename = config.filename ?? 'anqr-qrcode';
  const moduleStyle = config.moduleStyle ?? 'square';
  const cornerRadius = config.cornerRadius ?? 0;
  const finderStyle = config.finderStyle ?? 'square';
  const eyeOuterStyle = config.eyeOuterStyle ?? finderStyle;
  const eyeInnerStyle = config.eyeInnerStyle ?? finderStyle;
  const alignmentStyle = config.alignmentStyle ?? 'match_finder';
  const timingStyle = config.timingStyle ?? 'match_module';
  const gradient = config.gradient;

  const size = (moduleCount + margin * 2) * moduleSize;
  const marginPx = margin * moduleSize;

  const hasGradient =
    gradient && gradient.type !== 'none' && gradient.stops && gradient.stops.length > 0;
  const gradientId = 'qr-gradient';
  const fillColor = hasGradient ? `url(#${gradientId})` : fgColor;

  let defs = '';
  if (hasGradient && gradient) {
    defs = `<defs>${generateGradientDef(gradient, gradientId)}</defs>`;
  }

  let finderPaths = '';
  const finderPositions = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ];

  for (const pos of finderPositions) {
    const x = marginPx + pos.col * moduleSize;
    const y = marginPx + pos.row * moduleSize;
    finderPaths += generateFinderSvg(x, y, moduleSize, eyeOuterStyle, eyeInnerStyle, fillColor);
  }

  let alignmentPaths = '';
  const alignmentPositions = getAlignmentPositions(moduleCount);
  for (const pos of alignmentPositions) {
    const centerX = marginPx + pos.col * moduleSize + moduleSize / 2;
    const centerY = marginPx + pos.row * moduleSize + moduleSize / 2;
    alignmentPaths += generateAlignmentSvg(
      centerX,
      centerY,
      moduleSize,
      alignmentStyle,
      finderStyle,
      fillColor
    );
  }

  let timingPathData = '';
  for (let col = 8; col < moduleCount - 8; col++) {
    if (matrix[6][col]) {
      const x = marginPx + col * moduleSize;
      const y = marginPx + 6 * moduleSize;
      timingPathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }
  for (let row = 8; row < moduleCount - 8; row++) {
    if (matrix[row][6]) {
      const x = marginPx + 6 * moduleSize;
      const y = marginPx + row * moduleSize;
      timingPathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }

  let dataPathData = '';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderPattern(row, col, moduleCount)) continue;
      if (isAlignmentPattern(row, col, moduleCount)) continue;
      if (isTimingPattern(row, col, moduleCount)) continue;

      if (matrix[row][col]) {
        const x = marginPx + col * moduleSize;
        const y = marginPx + row * moduleSize;
        dataPathData += `${generateModulePath(x, y, moduleSize, moduleStyle, cornerRadius)} `;
      }
    }
  }

  let metadataContent = '';
  if (config.metadata) {
    const m = config.metadata;
    if (m.title) {
      metadataContent += `  <title>${escapeXml(m.title)}</title>\n`;
    }
    if (m.description) {
      metadataContent += `  <desc>${escapeXml(m.description)}</desc>\n`;
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
      metadataContent += `  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
${dcElements.join('\n')}
      </rdf:Description>
    </rdf:RDF>
  </metadata>\n`;
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
${metadataContent}  ${defs}
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${finderPaths}
  ${alignmentPaths}
  <path d="${timingPathData.trim()}" fill="${fillColor}"/>
  <path d="${dataPathData.trim()}" fill="${fillColor}"/>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename: `${filename}.svg`,
    format: 'svg',
    width: size,
    height: size,
  };
}

/**
 * Download QR matrix as true vector SVG
 */
export function downloadVectorSvg(matrix: boolean[][], config: VectorSvgConfig = {}): void {
  const result = exportVectorSvg(matrix, config);
  downloadUrl(result.url, result.filename, result.blob);
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}
