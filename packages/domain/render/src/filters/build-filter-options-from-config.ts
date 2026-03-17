import type { FilterOptions } from "@/modules/overlay";
import type { QRGeneratorConfig } from "@/modules/qr-generator/types";
import { applyBasicFilterOptions } from "./apply-basic-filter-options";
import { applyDuotoneAndColorMode } from "./apply-duotone-and-color-mode";

export function buildFilterOptionsFromConfig(config: QRGeneratorConfig): FilterOptions {
  const filterOptions: FilterOptions = {};
  applyBasicFilterOptions(config, filterOptions);
  applyDuotoneAndColorMode(config, filterOptions);
  return filterOptions;
}
