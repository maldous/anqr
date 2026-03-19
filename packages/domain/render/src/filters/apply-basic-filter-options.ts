import type { FilterOptions } from "../overlay/overlay-filters.types";
import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";
import { applyColorAdjustmentFilters } from "./apply-color-adjustment-filters";
import { applyEffectFilters } from "./apply-effect-filters";

export function applyBasicFilterOptions(
  config: QRGeneratorConfig,
  filterOptions: FilterOptions,
): void {
  applyColorAdjustmentFilters(config, filterOptions);
  applyEffectFilters(config, filterOptions);
}
