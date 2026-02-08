/**
 * Exporter Module - Types
 * Type definitions for export functionality
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('EXPORT');

export type OutputFormat = 'png' | 'webp' | 'gif' | 'svg' | 'jpeg';

export interface ExportConfig {
  outputFormat: OutputFormat;
  outputWidth: number;
  outputHeight: number;
  outputQuality: number; // 0-1
  filename: string;
  animationSpeed: number; // ms per frame
  loopAnimation: boolean;
  transparentBackground: boolean;
  dpi: number;
  includeMetadata: boolean;
  includeQuietZone: boolean; // If false, crop quiet zone from output
  bgOverride: string; // Override background color (empty = use original)
  gifDisposal: string; // GIF frame disposal method
  metadata?: {
    title?: string;
    author?: string;
    copyright?: string;
    description?: string;
  };
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  format: OutputFormat;
  width: number;
  height: number;
}

export interface PngMetadata {
  title?: string;
  author?: string;
  description?: string;
  copyright?: string;
  creationTime?: string;
  software?: string;
  comment?: string;
  [key: string]: string | undefined;
}

/**
 * Module style types for vector SVG
 */
export type VectorModuleStyle = 'square' | 'rounded' | 'dots' | 'diamond' | 'connected';
export type VectorFinderStyle = 'square' | 'rounded' | 'circle';
export type VectorAlignmentStyle = 'match_finder' | 'square' | 'rounded' | 'circle';
export type VectorTimingStyle = 'match_module' | 'solid' | 'dashed';

export interface VectorGradient {
  type: 'none' | 'linear' | 'radial' | 'conic';
  stops: Array<{ pos: number; color: string }>;
  angle?: number;
}

/**
 * Configuration for styled vector SVG export
 */
export interface VectorSvgConfig {
  moduleSize?: number;
  margin?: number;
  fgColor?: string;
  bgColor?: string;
  filename?: string;
  moduleStyle?: VectorModuleStyle;
  cornerRadius?: number;
  finderStyle?: VectorFinderStyle;
  eyeOuterStyle?: VectorFinderStyle;
  eyeInnerStyle?: VectorFinderStyle;
  alignmentStyle?: VectorAlignmentStyle;
  timingStyle?: VectorTimingStyle;
  gradient?: VectorGradient;
  /** Metadata to embed in the SVG */
  metadata?: {
    title?: string;
    author?: string;
    copyright?: string;
    description?: string;
    creationTime?: boolean;
    software?: string;
  };
}

/**
 * Default export config values
 */
export function getDefaultExportConfig(): ExportConfig {
  return {
    outputFormat: 'png',
    outputWidth: 400,
    outputHeight: 400,
    outputQuality: 0.9,
    filename: 'anqr-qrcode',
    animationSpeed: 100,
    loopAnimation: true,
    transparentBackground: false,
    dpi: 72,
    includeMetadata: false,
    includeQuietZone: true,
    bgOverride: '',
    gifDisposal: 'keep',
  };
}
