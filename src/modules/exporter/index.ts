/**
 * Exporter Module
 * Re-exports from split module files
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

// Utilities
export { canvasToBlob, escapeXml, saveFileNative, downloadUrl } from './utils';

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

// Import functions for the Exporter object
import { exportImage, downloadImage } from './image-export';
import { exportGif, downloadGif } from './gif-export';
import { exportSvg, downloadSvg } from './svg-export';
import { exportVectorSvg, downloadVectorSvg } from './vector-svg';

// Default export object for backwards compatibility
export const Exporter = {
  exportImage,
  downloadImage,
  exportGif,
  downloadGif,
  exportSvg,
  downloadSvg,
  exportVectorSvg,
  downloadVectorSvg,
};

// Also export as ExporterModule for backward compatibility
export const ExporterModule = Exporter;

export default Exporter;
