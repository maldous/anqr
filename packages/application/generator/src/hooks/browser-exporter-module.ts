import { Capacitor } from "@capacitor/core";
import { downloadUrl } from "@/platform/browser/io";
import {
  exportGif,
  exportImage,
  exportSvg,
  exportVectorSvg,
} from "@/domain/render/exporter";
import type { ExporterModule } from "./exporter-module";

export const browserExporterModule: ExporterModule = {
  async downloadGif(frames, config = {}, frameDelays, frameDisposals) {
    const result = await exportGif(frames, config, frameDelays, frameDisposals);
    downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
  async downloadImage(canvas, config = {}, pngMetadata, dpi) {
    const result = await exportImage(canvas, config, pngMetadata, dpi);
    downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
  async downloadSvg(canvas, config = {}) {
    const result = await exportSvg(canvas, config);
    downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
  downloadVectorSvg(matrix, config = {}) {
    const result = exportVectorSvg(matrix, config);
    downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
};
