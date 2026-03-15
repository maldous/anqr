import type { ExportResult, VectorSvgConfig } from '../../../modules/exporter/types';
import { buildSvgDataPaths } from './build-svg-data-paths';
import { buildSvgMetadata } from './build-svg-metadata';
import { buildSvgTimingPaths } from './build-svg-timing-paths';
import { generateAlignmentSvg } from './generate-alignment-svg';
import { generateFinderSvg } from './generate-finder-svg';
import { generateGradientDef } from './generate-gradient-def';
import { getAlignmentPositionsFromModuleCount } from './get-alignment-positions-from-module-count';

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
  const alignmentPositions = getAlignmentPositionsFromModuleCount(moduleCount);
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

  const timingPathData = buildSvgTimingPaths(
    matrix,
    moduleCount,
    marginPx,
    moduleSize,
    timingStyle,
    moduleStyle,
    cornerRadius
  );
  const dataPathData = buildSvgDataPaths(
    matrix,
    moduleCount,
    marginPx,
    moduleSize,
    moduleStyle,
    cornerRadius
  );
  const metadataContent = buildSvgMetadata(config.metadata);

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
