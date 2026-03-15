/**
 * Exporter Module
 * File export functionality for PNG, GIF, SVG, and vector SVG
 */

import { createLogger } from '../../infra/logging/logger';

const _log = createLogger('EXPORT');

// GIF export
export { downloadGif, exportGif } from '../../domain/render/export/gif-export';
// Image export (PNG, WebP, JPEG)
export { downloadImage, exportImage } from '../../domain/render/export/image-export';
// PNG metadata
export {
  calculateCrc32,
  createPngPhysChunk,
  createPngTextChunk,
  embedPngDpi,
  embedPngMetadata,
} from '../../domain/render/export/png-metadata';
// SVG export (raster embedded)
export { downloadSvg, exportSvg } from '../../domain/render/export/svg-export';
// Types
export type {
  ExportConfig,
  ExportResult,
  OutputFormat,
  PngMetadata,
  VectorAlignmentStyle,
  VectorFinderStyle,
  VectorGradient,
  VectorModuleStyle,
  VectorSvgConfig,
  VectorTimingStyle,
} from './types';
export { getDefaultExportConfig } from './types';
// Utilities (re-exported from browser-io)
export { canvasToBlob, downloadUrl, escapeXml, saveFileNative } from './utils';

// Vector SVG export (true vector)
export { downloadVectorSvg, exportVectorSvg } from '../../domain/render/export/vector-svg';
