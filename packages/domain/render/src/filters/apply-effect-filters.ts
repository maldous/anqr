import type { FilterOptions } from "../overlay/overlay-filters.types";
import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

export function applyEffectFilters(config: QRGeneratorConfig, filterOptions: FilterOptions): void {
  if (config.filterThreshold !== undefined && config.filterThreshold > 0)
    filterOptions.threshold = config.filterThreshold;
  if (config.filterBlur !== undefined && config.filterBlur > 0)
    filterOptions.blur = config.filterBlur;
  if (config.filterSharpen !== undefined && config.filterSharpen > 0)
    filterOptions.sharpen = config.filterSharpen;
  if (config.filterPosterize !== undefined && config.filterPosterize > 0)
    filterOptions.posterize = config.filterPosterize;
}
