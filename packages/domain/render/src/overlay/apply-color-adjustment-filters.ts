import type { FilterOptions } from "./overlay-filters.types";
import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

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
