import type { FilterOptions } from '../../../modules/overlay';
import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';
import { applyColorAdjustmentFilters } from './apply-color-adjustment-filters';
import { applyEffectFilters } from './apply-effect-filters';

export function applyBasicFilterOptions(
  config: QRGeneratorConfig,
  filterOptions: FilterOptions
): void {
  applyColorAdjustmentFilters(config, filterOptions);
  applyEffectFilters(config, filterOptions);
}
