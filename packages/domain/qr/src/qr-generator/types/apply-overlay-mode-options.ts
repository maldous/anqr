import type { OverlayData } from "./overlay-data";
import type { QRGeneratorConfig } from "./qr-generator-config";

export interface ApplyOverlayModeOptions {
  overlayMode: string | undefined;
  isDark: boolean;
  brightness: number;
  overlayData: OverlayData;
  row: number;
  col: number;
  moduleCount: number;
  effectiveIntensity: number;
  config: QRGeneratorConfig;
  isFunctionalPattern?: boolean;
}
