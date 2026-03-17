export interface OverlayFilterOptions {
  brightness: number;
  contrast: number;
  gamma: number;
  saturation: number;
  hue: number;
  invert: boolean;
  blur: number;
  sharpen: number;
  posterize: number;
  threshold?: number;
  edge: "off" | "sobel" | "canny";
}
