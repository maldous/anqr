import { Capacitor } from "@capacitor/core";
import { exportGif, exportImage, exportSvg, exportVectorSvg } from "@/domain/render/exporter";
import type { ExporterModule } from "../export/exporter-module.types";
import { getDownloadRuntime } from "../runtime/generator-runtime";

export const browserExporterModule: ExporterModule = {
  async downloadGif(frames, config, frameDelays, frameDisposals) {
    const exportConfig = config ?? {};
    const result = await exportGif(frames, exportConfig, frameDelays, frameDisposals);
    getDownloadRuntime().downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
  async downloadImage(canvas, config, pngMetadata, dpi) {
    const exportConfig = config ?? {};
    const result = await exportImage(canvas, exportConfig, pngMetadata, dpi);
    getDownloadRuntime().downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
  async downloadSvg(canvas, config = {}) {
    const result = await exportSvg(canvas, config);
    getDownloadRuntime().downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
  downloadVectorSvg(matrix, config = {}) {
    const result = exportVectorSvg(matrix, config);
    getDownloadRuntime().downloadUrl(result.url, result.filename, result.blob);
    if (!Capacitor.isNativePlatform()) {
      URL.revokeObjectURL(result.url);
    }
  },
};
