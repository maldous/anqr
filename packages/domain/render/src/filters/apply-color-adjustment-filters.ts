import type { FilterOptions } from "@/modules/overlay";
import type { QRGeneratorConfig } from "@/modules/qr-generator/types";

/**
 * Build FilterOptions from QR generator config.
 *
 * NOTE: UI/store values for overlay preprocessing use overlay module ranges.
 * We keep QRGeneratorConfig.filter* in those same ranges to avoid double scaling.
 * - brightness: -100..100
 * - contrast:   -100..100 (overlay supports broader range, but -100..100 is fine)
 * - saturation: -100..100 (overlay expects 0..200, where 100 is neutral)
 * - hue:        0..360 degrees
 * - blur:       px radius (0..)
 * - sharpen:    0..100
 * - posterize:  0..16 levels
 * - threshold:  0..255, where 0 means disabled
 */
export function applyColorAdjustmentFilters(
  config: QRGeneratorConfig,
  filterOptions: FilterOptions,
): void {
  if (config.filterBrightness !== undefined && config.filterBrightness !== 0)
    filterOptions.brightness = config.filterBrightness;
  if (config.filterContrast !== undefined && config.filterContrast !== 0)
    filterOptions.contrast = config.filterContrast;
  if (config.filterSaturation !== undefined && config.filterSaturation !== 0)
    filterOptions.saturation = config.filterSaturation + 100;
  if (config.filterHue !== undefined && config.filterHue !== 0)
    filterOptions.hue = config.filterHue;
  if (config.filterGamma !== undefined && config.filterGamma !== 1)
    filterOptions.gamma = config.filterGamma;
  if (config.filterInvert) filterOptions.invert = true;
  if (config.filterGrayscale) filterOptions.grayscale = true;
}
