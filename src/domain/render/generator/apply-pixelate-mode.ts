import { blendColors } from '../core';
import { getOverlayColorPacked } from '../overlay/overlay-data-packed';
import type { OverlayModeContext } from './overlay-mode-context';
import type { OverlayModeResult } from './render-modes.types';
import { computeDarkFactor } from './compute-dark-factor';

export function applyPixelateMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, row, col, moduleCount, overlayData, effectiveIntensity, config } = context;
  // True pixelation - 3x3 blocks get same averaged color for chunky pixel look
  if (!isDark) return;
  const blockSize = 3;
  const blockRow = Math.floor(row / blockSize) * blockSize;
  const blockCol = Math.floor(col / blockSize) * blockSize;
  let avgR = 0;
  let avgG = 0;
  let avgB = 0;
  let pixCount = 0;
  for (let br = 0; br < blockSize && blockRow + br < moduleCount; br++) {
    for (let bc = 0; bc < blockSize && blockCol + bc < moduleCount; bc++) {
      const c = getOverlayColorPacked(overlayData, blockRow + br, blockCol + bc);
      if (!c) continue;
      avgR += (c >> 16) & 0xff;
      avgG += (c >> 8) & 0xff;
      avgB += c & 0xff;
      pixCount++;
    }
  }
  if (pixCount <= 0) return;
  avgR = Math.round(avgR / pixCount);
  avgG = Math.round(avgG / pixCount);
  avgB = Math.round(avgB / pixCount);
  const pixIntensity = effectiveIntensity;
  const darkFactor = computeDarkFactor(pixIntensity, 0.7);
  const darkR = Math.round(avgR * darkFactor);
  const darkG = Math.round(avgG * darkFactor);
  const darkB = Math.round(avgB * darkFactor);
  const blockColor = `rgb(${darkR},${darkG},${darkB})`;
  result.moduleColor = blendColors(config.fgColor, blockColor, pixIntensity);
}
