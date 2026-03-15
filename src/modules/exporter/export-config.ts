import type { OutputFormat } from './output-format';

export interface ExportConfig {
  outputFormat: OutputFormat;
  outputWidth: number;
  outputHeight: number;
  outputQuality: number;
  filename: string;
  animationSpeed: number;
  loopAnimation: boolean;
  transparentBackground: boolean;
  dpi: number;
  includeMetadata: boolean;
  includeQuietZone: boolean;
  bgOverride: string;
  gifDisposal: string;
  metadata?: {
    title?: string;
    author?: string;
    copyright?: string;
    description?: string;
  };
}
