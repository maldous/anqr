import type { FilterOptions } from "../overlay/overlay-filters.types";
import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";
import { applyBasicFilterOptions } from "./apply-basic-filter-options";
import { applyDuotoneAndColorMode } from "./apply-duotone-and-color-mode";

export function buildFilterOptionsFromConfig(config: QRGeneratorConfig): FilterOptions {
  const filterOptions: FilterOptions = {};
  applyBasicFilterOptions(config, filterOptions);
  applyDuotoneAndColorMode(config, filterOptions);
  return filterOptions;
}
