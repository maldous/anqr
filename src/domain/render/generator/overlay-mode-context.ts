import type { OverlayData, QRGeneratorConfig } from './types';

export type OverlayModeContext = {
  overlayMode: string | undefined;
  isDark: boolean;
  brightness: number;
  overlayData: OverlayData;
  row: number;
  col: number;
  moduleCount: number;
  effectiveIntensity: number;
  config: QRGeneratorConfig;
  isFunctionalPattern: boolean;
};
