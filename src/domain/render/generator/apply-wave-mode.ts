import { blendColors } from '../core';
import { getOverlayColorPacked } from '../overlay/overlay-data-packed';
import type { OverlayModeContext } from './overlay-mode-context';
import type { OverlayModeResult } from './render-modes.types';
import { computeDarkFactor } from './compute-dark-factor';

export function applyWaveMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, effectiveIntensity, brightness, row, col, overlayData, config } = context;
  if (!isDark) return;
  const waveIntensity = effectiveIntensity;
  const waveStrength = (1 - brightness) * waveIntensity * 4;
  result.waveOffsetX = Math.sin(row * 0.5 + col * 0.15) * waveStrength;
  result.waveOffsetY = Math.cos(col * 0.5 + row * 0.15) * waveStrength;

  const waveColor = getOverlayColorPacked(overlayData, row, col);
  if (!waveColor || waveIntensity <= 0) return;
  const waveR = (waveColor >> 16) & 0xff;
  const waveG = (waveColor >> 8) & 0xff;
  const waveB = waveColor & 0xff;
  const darkFactor = computeDarkFactor(waveIntensity, 0.7);
  const colorStr = `rgb(${Math.round(waveR * darkFactor)},${Math.round(waveG * darkFactor)},${Math.round(waveB * darkFactor)})`;
  result.moduleColor = blendColors(config.fgColor, colorStr, waveIntensity);
}
