import type { ExportConfig } from "../../../modules/exporter/types";

export function resolveExportConfig(
  config: Partial<ExportConfig>,
  defaults: { width: number; height: number; format: ExportConfig["outputFormat"] },
): ExportConfig {
  return {
    outputFormat: defaults.format,
    outputWidth: config.outputWidth ?? defaults.width,
    outputHeight: config.outputHeight ?? defaults.height,
    outputQuality: config.outputQuality ?? 0.9,
    filename: config.filename ?? "anqr-qrcode",
    animationSpeed: config.animationSpeed ?? 100,
    loopAnimation: config.loopAnimation ?? true,
    transparentBackground: config.transparentBackground ?? false,
    dpi: config.dpi ?? 72,
    includeMetadata: config.includeMetadata ?? false,
    includeQuietZone: config.includeQuietZone ?? true,
    bgOverride: config.bgOverride ?? "",
    gifDisposal: config.gifDisposal ?? "keep",
    metadata: config.metadata,
  };
}
