import { parseColor } from '../color/color';
import type { ColorMode, FilterOptions } from '../../../modules/overlay';
import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';

export function applyDuotoneAndColorMode(
  config: QRGeneratorConfig,
  filterOptions: FilterOptions
): void {
  if (
    config.overlayMode === 'duotone' &&
    config.filterDuotone1 &&
    config.filterDuotone2 &&
    config.colorMode !== 'color'
  ) {
    const lightRgb = parseColor(config.filterDuotone1);
    const darkRgb = parseColor(config.filterDuotone2);
    if (lightRgb && darkRgb) {
      filterOptions.duotone = { light: lightRgb, dark: darkRgb };
    }
  }

  if (config.colorMode) {
    if (config.colorMode === 'color') {
      filterOptions.grayscale = false;
    } else {
      filterOptions.colorMode = config.colorMode as ColorMode;
      filterOptions.grayscale = false;
    }
  }
}
