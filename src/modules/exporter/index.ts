/**
 * Exporter Module
 * File export functionality for PNG, GIF, SVG, and vector SVG
 */

// Types
export type {
  OutputFormat,
  ExportConfig,
  ExportResult,
  PngMetadata,
  VectorModuleStyle,
  VectorFinderStyle,
  VectorAlignmentStyle,
  VectorTimingStyle,
  VectorGradient,
  VectorSvgConfig,
} from './types';
export { getDefaultExportConfig } from './types';

// Utilities (re-exported from browser-io)
export { canvasToBlob, saveFileNative, downloadUrl } from './utils';
export { escapeXml } from './utils';

// PNG metadata
export {
  calculateCrc32,
  createPngPhysChunk,
  embedPngDpi,
  createPngTextChunk,
  embedPngMetadata,
} from './png-metadata';

// Image export (PNG, WebP, JPEG)
export { exportImage, downloadImage } from './image-export';

// GIF export
export { exportGif, downloadGif } from './gif-export';

// SVG export (raster embedded)
export { exportSvg, downloadSvg } from './svg-export';

// Vector SVG export (true vector)
export { exportVectorSvg, downloadVectorSvg } from './vector-svg';


