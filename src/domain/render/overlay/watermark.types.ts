// ============================================
// TYPES
// ============================================

export type WatermarkKind = 'text' | 'image' | 'pattern';

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type WatermarkBlend = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export interface WatermarkOptions {
  kind: WatermarkKind;
  text?: string;
  image?: HTMLCanvasElement | HTMLImageElement;
  position?: WatermarkPosition;
  opacity?: number;
  blend?: WatermarkBlend;
  scale?: number;
  padding?: number;
  font?: string;
  color?: string;
  tiled?: boolean;
}

export interface WatermarkResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}
