import { Capacitor } from "@capacitor/core";
import type { ExportConfig } from "../../../modules/exporter/types";
import { downloadUrl } from "../../../modules/exporter/utils";
import { exportGif } from "./export-gif";

/**
 * Download animation as GIF
 */
export async function downloadGif(
  frames: HTMLCanvasElement[],
  config: Partial<ExportConfig> = {},
  frameDelays?: number[],
  frameDisposals?: number[],
): Promise<void> {
  const result = await exportGif(frames, config, frameDelays, frameDisposals);
  downloadUrl(result.url, result.filename, result.blob);
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}
