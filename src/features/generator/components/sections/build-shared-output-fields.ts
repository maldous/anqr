import { falseIfFalse, undefinedIfEqual, undefinedIfFalsy } from "./share-config-field-helpers";

export function buildSharedOutputFields(output: {
  widthPx: number;
  heightPx: number;
  format: string;
  quality: number;
  filename: string;
  dpi: number;
  includeQuietZone: boolean;
  bgOverride: string;
  formatExtra: string;
}) {
  return {
    width: undefinedIfEqual(output.widthPx, 400),
    height: undefinedIfEqual(output.heightPx, 400),
    format: undefinedIfEqual(output.format, "gif"),
    quality: undefinedIfEqual(output.quality, 0.9),
    filename: undefinedIfEqual(output.filename, "anqr-qrcode"),
    dpi: undefinedIfEqual(output.dpi, 72),
    includeQuietZone: falseIfFalse(output.includeQuietZone),
    bgOverride: undefinedIfFalsy(output.bgOverride),
    formatExtra: undefinedIfEqual(output.formatExtra, "none"),
  };
}
