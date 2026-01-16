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

// Default export object for backwards compatibility
export const Exporter = {
  // Image
  exportImage: async () => (await import('./image-export')).exportImage,
  downloadImage: async () => (await import('./image-export')).downloadImage,
  // GIF
  exportGif: async () => (await import('./gif-export')).exportGif,
  downloadGif: async () => (await import('./gif-export')).downloadGif,
  // SVG
  exportSvg: async () => (await import('./svg-export')).exportSvg,
  downloadSvg: async () => (await import('./svg-export')).downloadSvg,
  // Vector SVG
  exportVectorSvg: async () => (await import('./vector-svg')).exportVectorSvg,
  downloadVectorSvg: async () => (await import('./vector-svg')).downloadVectorSvg,
};

export default Exporter;
