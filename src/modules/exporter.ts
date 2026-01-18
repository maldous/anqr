/**
 * Exporter Module
 * Re-exports export functionality from exporter/ subdirectory
 */

import {
  downloadImage,
  downloadSvg,
  downloadVectorSvg,
  downloadGif,
  downloadUrl,
  exportImage,
  exportSvg,
  exportVectorSvg,
  exportGif,
  canvasToBlob,
  Exporter,
  ExporterModule,
  type ExportConfig,
  type ExportResult,
  type OutputFormat,
  type PngMetadata,
  type VectorModuleStyle,
  type VectorFinderStyle,
  type VectorAlignmentStyle,
  type VectorTimingStyle,
  type VectorSvgConfig,
} from './exporter/';

// Re-export types
export type {
  ExportConfig,
  ExportResult,
  OutputFormat,
  PngMetadata,
  VectorModuleStyle,
  VectorFinderStyle,
  VectorAlignmentStyle,
  VectorTimingStyle,
  VectorSvgConfig,
};

// Re-export functions and namespace
export {
  downloadImage,
  downloadSvg,
  downloadVectorSvg,
  downloadGif,
  downloadUrl,
  exportImage,
  exportSvg,
  exportVectorSvg,
  exportGif,
  canvasToBlob,
  Exporter,
  ExporterModule,
};

export default Exporter;
