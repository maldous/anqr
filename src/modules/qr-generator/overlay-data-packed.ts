/**
 * Overlay data access helpers.
 * Supports packed typed-array overlay data and legacy sparse object fallback.
 */

import type { OverlayData, RGBWithMeta } from './types';

const COLOR_PRESENT_FLAG = 0x01000000;

type LegacyOverlayData = {
  [row: number]: {
    [col: number]: number;
  };
  colors?: {
    [row: number]: {
      [col: number]: { r: number; g: number; b: number };
    };
  };
};

export function packOverlayColor(r: number, g: number, b: number): number {
  return COLOR_PRESENT_FLAG | (r << 16) | (g << 8) | b;
}

export function unpackOverlayColor(packed: number): RGBWithMeta | null {
  if ((packed & COLOR_PRESENT_FLAG) === 0) return null;
  return {
    r: (packed >> 16) & 0xff,
    g: (packed >> 8) & 0xff,
    b: packed & 0xff,
  };
}

function isPackedOverlayData(
  overlayData: OverlayData | null | undefined
): overlayData is OverlayData {
  return (
    !!overlayData &&
    overlayData.size > 0 &&
    overlayData.brightness instanceof Float32Array &&
    overlayData.brightness.length >= overlayData.size * overlayData.size
  );
}

export function getOverlayBrightness(
  overlayData: OverlayData | null | undefined,
  row: number,
  col: number,
  fallback: number = 0.5
): number {
  if (isPackedOverlayData(overlayData)) {
    const size = overlayData.size;
    if (row >= 0 && col >= 0 && row < size && col < size) {
      const value = overlayData.brightness[row * size + col];
      return Number.isFinite(value) ? value : fallback;
    }
  }

  const legacy = overlayData as LegacyOverlayData | null | undefined;
  const legacyValue = legacy?.[row]?.[col];
  return typeof legacyValue === 'number' && Number.isFinite(legacyValue) ? legacyValue : fallback;
}

export function getOverlayColorPacked(
  overlayData: OverlayData | null | undefined,
  row: number,
  col: number
): number {
  if (isPackedOverlayData(overlayData) && overlayData.colorsPacked) {
    const size = overlayData.size;
    if (row >= 0 && col >= 0 && row < size && col < size) {
      return overlayData.colorsPacked[row * size + col];
    }
  }

  const legacy = overlayData as LegacyOverlayData | null | undefined;
  const legacyColor = legacy?.colors?.[row]?.[col];
  if (!legacyColor) return 0;
  return packOverlayColor(legacyColor.r, legacyColor.g, legacyColor.b);
}

export function getOverlayColor(
  overlayData: OverlayData | null | undefined,
  row: number,
  col: number
): RGBWithMeta | null {
  return unpackOverlayColor(getOverlayColorPacked(overlayData, row, col));
}
