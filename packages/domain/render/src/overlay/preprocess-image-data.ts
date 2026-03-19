import { applyFilters, copyImageData } from "./overlay-filters";
import { cannyEdge, sobelEdge } from "./overlay-filters";
import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";
import { applyAdaptiveNormalizationIfNeeded } from "./apply-adaptive-normalization-if-needed";
import { autoSoftenIfNeeded } from "./auto-soften-if-needed";
import { buildFilterOptionsFromConfig } from "./build-filter-options-from-config";
import { log } from "./log";

export function preprocessImageData(
  imageData: ImageData,
  config: QRGeneratorConfig,
  debug = false,
): ImageData {
  const filterOptions = buildFilterOptionsFromConfig(config);

  if (debug) {
    log.debug("preprocessImageData - filter options", {
      brightness: filterOptions.brightness,
      contrast: filterOptions.contrast,
      saturation: filterOptions.saturation,
      hue: filterOptions.hue,
      gamma: filterOptions.gamma,
      invert: filterOptions.invert,
      grayscale: filterOptions.grayscale,
      threshold: filterOptions.threshold,
      blur: filterOptions.blur,
      sharpen: filterOptions.sharpen,
      posterize: filterOptions.posterize,
      colorMode: filterOptions.colorMode,
      hasDuotone: !!filterOptions.duotone,
      configColorMode: config.colorMode,
    });
  }

  let workingData = copyImageData(imageData);
  workingData = autoSoftenIfNeeded(workingData, config, debug);

  if (Object.keys(filterOptions).length === 0) {
    if (debug) {
      log.debug("preprocessImageData - no additional filters to apply");
    }
    return workingData;
  }

  if (debug) {
    log.debug("preprocessImageData - applying filters");
  }
  let out = applyFilters(workingData, filterOptions);

  out = applyAdaptiveNormalizationIfNeeded(out, config, debug);

  if (config.filterEdgeDetect) {
    const mode = (config.filterEdgeMode || "sobel").toLowerCase();
    if (debug) {
      log.debug("preprocessImageData - applying edge detection", { mode });
    }
    out = mode === "canny" ? cannyEdge(out) : sobelEdge(out);
  }

  if (debug) {
    log.debug("preprocessImageData - complete");
  }
  return out;
}
