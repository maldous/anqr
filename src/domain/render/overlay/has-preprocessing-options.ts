import type { QRGeneratorConfig } from "../../../modules/qr-generator/types";

/**
 * Check if overlay has preprocessing options that need to be applied
 */
export function hasPreprocessingOptions(config: QRGeneratorConfig): boolean {
  return (
    (config.filterBrightness !== undefined && config.filterBrightness !== 0) ||
    (config.filterContrast !== undefined && config.filterContrast !== 0) ||
    (config.filterSaturation !== undefined && config.filterSaturation !== 0) ||
    (config.filterHue !== undefined && config.filterHue !== 0) ||
    (config.filterGamma !== undefined && config.filterGamma !== 1) ||
    !!config.filterInvert ||
    !!config.filterGrayscale ||
    (config.filterThreshold !== undefined && config.filterThreshold > 0) ||
    (config.filterBlur !== undefined && config.filterBlur > 0) ||
    (config.filterSharpen !== undefined && config.filterSharpen > 0) ||
    (config.filterPosterize !== undefined && config.filterPosterize > 0) ||
    (!!config.filterDuotone1 && !!config.filterDuotone2) ||
    !!config.filterEdgeDetect ||
    // colorMode 'grayscale' or 'bw' requires preprocessing
    (config.colorMode !== undefined && config.colorMode !== "color")
  );
}
