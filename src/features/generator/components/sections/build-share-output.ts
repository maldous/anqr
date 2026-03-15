import type { StoreState } from './share-config-store-state.type';
import { buildOutputFormatDetails } from './build-output-format-details';
import { falseIfFalse, undefinedIfEqual, undefinedIfFalsy } from './share-config-field-helpers';

export function buildShareOutput(output: StoreState['output']) {
  return {
    width: undefinedIfEqual(output.widthPx, 400),
    height: undefinedIfEqual(output.heightPx, 400),
    format: undefinedIfEqual(output.format, 'gif'),
    quality: undefinedIfEqual(output.quality, 0.9),
    filename: undefinedIfEqual(output.filename, 'anqr-qrcode'),
    dpi: undefinedIfEqual(output.dpi, 72),
    includeQuietZone: falseIfFalse(output.includeQuietZone),
    bgOverride: undefinedIfFalsy(output.bgOverride),
    formatExtra: undefinedIfEqual(output.formatExtra, 'none'),
    ...buildOutputFormatDetails(output),
  };
}
