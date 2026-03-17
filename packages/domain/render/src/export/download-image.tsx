import { Capacitor } from "@capacitor/core";
import type { ExportConfig } from "@/modules/exporter/types";
import type { PngMetadata } from "@/modules/exporter/png-metadata.types";
import { downloadUrl } from "@/modules/exporter/utils";
import { exportImage } from "./export-image";

/**
 * Download an image from canvas
 */
export async function downloadImage(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {},
  pngMetadata?: PngMetadata,
  dpi?: number,
): Promise<void> {
  const result = await exportImage(canvas, config, pngMetadata, dpi);
  downloadUrl(result.url, result.filename, result.blob);
  // Don't revoke URL immediately on native - file save is async
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}
