import type { OverlayData } from '../../../modules/qr-generator/types';

export const COLOR_PRESENT_FLAG = 0x01000000;

export type LegacyOverlayData = {
  [row: number]: {
    [col: number]: number;
  };
  colors?: {
    [row: number]: {
      [col: number]: { r: number; g: number; b: number };
    };
  };
};

export function isPackedOverlayData(
  overlayData: OverlayData | null | undefined
): overlayData is OverlayData {
  return (
    !!overlayData &&
    overlayData.size > 0 &&
    overlayData.brightness instanceof Float32Array &&
    overlayData.brightness.length >= overlayData.size * overlayData.size
  );
}
