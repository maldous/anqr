import type { QRGeneratorConfig } from "./types";

export function buildEffectiveConfig(
  config: QRGeneratorConfig,
  typeNumber: number,
  processedOverlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
): QRGeneratorConfig {
  const overlayModeWithDefault =
    processedOverlayCanvas && !config.overlayMode ? "dithered" : config.overlayMode;
  const blendPreservationMode: "overlay" | "dither" =
    config.blendPreservationMode === "dither" ? "dither" : "overlay";

  return {
    ...config,
    typeNumber,
    overlayMode: overlayModeWithDefault,
    blendPreservationMode,
  };
}
