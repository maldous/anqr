import {
  applyGeometricTransforms,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  preprocessOverlay,
} from "@/domain/render/overlay";
import { generatorLog as log } from "./generator-log";
import type { QRGeneratorConfig } from "./types";
import type { AnyCanvas } from "./any-canvas";

export type { AnyCanvas } from "./any-canvas";

export async function preprocessOverlayCanvas(
  overlayCanvas: AnyCanvas | null,
  config: QRGeneratorConfig,
  createCanvas: (width: number, height: number) => Promise<AnyCanvas>,
): Promise<AnyCanvas | null> {
  let processedOverlayCanvas: AnyCanvas | null = overlayCanvas;
  if (overlayCanvas && hasGeometricTransforms(config)) {
    processedOverlayCanvas = await applyGeometricTransforms(overlayCanvas, config, createCanvas);
  }

  const needsPreprocessing = hasPreprocessingOptions(config);
  log.trace("Preprocessing check", {
    hasOverlay: !!processedOverlayCanvas,
    needsPreprocessing,
    overlayMode: config.overlayMode,
    colorMode: config.colorMode,
    filterGrayscale: config.filterGrayscale,
    filterBrightness: config.filterBrightness,
    filterContrast: config.filterContrast,
  });

  if (processedOverlayCanvas && needsPreprocessing && !config.fastPreview) {
    log.trace("Preprocessing overlay", {
      overlayMode: config.overlayMode,
      colorMode: config.colorMode,
      filterBrightness: config.filterBrightness,
      filterContrast: config.filterContrast,
      filterGamma: config.filterGamma,
      filterSaturation: config.filterSaturation,
      filterHue: config.filterHue,
      filterBlur: config.filterBlur,
      filterSharpen: config.filterSharpen,
      filterPosterize: config.filterPosterize,
      filterThreshold: config.filterThreshold,
      filterEdgeDetect: config.filterEdgeDetect,
      filterInvert: config.filterInvert,
      filterGrayscale: config.filterGrayscale,
    });

    processedOverlayCanvas = await preprocessOverlay(processedOverlayCanvas, config, createCanvas);

    log.trace("Preprocessing complete", {
      width: processedOverlayCanvas.width,
      height: processedOverlayCanvas.height,
    });
  } else if (processedOverlayCanvas) {
    log.trace("Skipping preprocessing - no filters to apply");
  }

  return processedOverlayCanvas;
}
