import { Capacitor } from "@capacitor/core";
import type { ExportConfig } from "@/modules/exporter/types";
import { downloadUrl } from "@/modules/exporter/utils";
import { exportSvg } from "./export-svg";

/**
 * Download canvas as SVG
 */
export async function downloadSvg(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {},
): Promise<void> {
  const result = await exportSvg(canvas, config);
  downloadUrl(result.url, result.filename, result.blob);
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}
