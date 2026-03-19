import type { QRGeneratorConfig } from "./config.types";

export interface OverlayData {
  size: number;
  brightness: Float32Array;
  colorsPacked?: Uint32Array;
  [row: number]:
    | { [col: number]: number }
    | { [row: number]: { [col: number]: { r: number; g: number; b: number } } }
    | number
    | Float32Array
    | Uint32Array
    | undefined;
  colors?: {
    [row: number]: {
      [col: number]: { r: number; g: number; b: number };
    };
  };
}

export interface OverlayModeResult {
  moduleColor: string;
  moduleSizeModifier: number;
  moduleOpacity: number;
  waveOffsetX: number;
  waveOffsetY: number;
  drawOutlineOnly: boolean;
  useHalftoneRendering: boolean;
  halftoneBrightness: number;
  shouldDrawCell: boolean;
}

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
