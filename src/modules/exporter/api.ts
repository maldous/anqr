/**
 * Exporter Module - Public API Manifest
 *
 * This file documents all public exports from the exporter module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("EXPORT");

// Image export (PNG, WebP, JPEG)
export const IMAGE_API = ["exportImage", "downloadImage"] as const;

// GIF export
export const GIF_API = ["exportGif", "downloadGif"] as const;

// SVG export (raster embedded)
export const SVG_API = ["exportSvg", "downloadSvg"] as const;

// Vector SVG export (true vector)
export const VECTOR_SVG_API = ["exportVectorSvg", "downloadVectorSvg"] as const;

// PNG metadata
export const METADATA_API = [
  "calculateCrc32",
  "createPngPhysChunk",
  "createPngTextChunk",
  "embedPngDpi",
  "embedPngMetadata",
] as const;

// Utilities (re-exported from browser-io)
export const UTILS_API = ["canvasToBlob", "downloadUrl", "escapeXml", "saveFileNative"] as const;

// Config helpers
export const CONFIG_API = ["getDefaultExportConfig"] as const;

// Types
export const TYPES = [
  "ExportConfig",
  "ExportResult",
  "OutputFormat",
  "PngMetadata",
  "VectorAlignmentStyle",
  "VectorFinderStyle",
  "VectorGradient",
  "VectorModuleStyle",
  "VectorSvgConfig",
  "VectorTimingStyle",
] as const;

// All public exports
export const PUBLIC_API = [
  ...IMAGE_API,
  ...GIF_API,
  ...SVG_API,
  ...VECTOR_SVG_API,
  ...METADATA_API,
  ...UTILS_API,
  ...CONFIG_API,
] as const;
