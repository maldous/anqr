import type { ExportConfig, PngMetadata, VectorSvgConfig } from "@/domain/render/exporter";

export interface ExporterModule {
  downloadGif: (
    frames: HTMLCanvasElement[],
    config?: Partial<ExportConfig>,
    frameDelays?: number[],
    frameDisposals?: number[],
  ) => Promise<void>;
  downloadImage: (
    canvas: HTMLCanvasElement,
    config?: Partial<ExportConfig>,
    pngMetadata?: PngMetadata,
    dpi?: number,
  ) => Promise<void>;
  downloadSvg: (canvas: HTMLCanvasElement, config?: Partial<ExportConfig>) => Promise<void>;
  downloadVectorSvg: (matrix: boolean[][], config?: VectorSvgConfig) => void;
}
