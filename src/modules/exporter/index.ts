/**
 * Exporter Module
 * File export functionality for PNG, GIF, SVG, and vector SVG
 */

// GIF export
export { downloadGif, exportGif } from './gif-export';
// Image export (PNG, WebP, JPEG)
export { downloadImage, exportImage } from './image-export';
// PNG metadata
export {
  calculateCrc32,
  createPngPhysChunk,
  createPngTextChunk,
  embedPngDpi,
  embedPngMetadata,
} from './png-metadata';
// SVG export (raster embedded)
export { downloadSvg, exportSvg } from './svg-export';
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
export { downloadVectorSvg, exportVectorSvg } from './vector-svg';
