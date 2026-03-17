export type { RGB, RGBA, HSL, ColorMode, FilterOptions } from "./overlay-filters.types";
export { copyImageData } from "./copy-image-data";
export { brightness } from "./brightness";
export { contrast } from "./contrast";
export { saturation } from "./saturation";
export { hueRotate } from "./hue-rotate";
export { gamma } from "./gamma";
export { invert } from "./invert";
export { grayscale } from "./grayscale";
export { threshold } from "./threshold";
export { posterize } from "./posterize";
export { duotone } from "./duotone";
export { convolve } from "./convolve";
export { sharpen } from "./sharpen";
export { blur } from "./blur";
export { gaussianBlur } from "./gaussian-blur";
export { emboss } from "./emboss";
export { sobelEdge } from "./sobel-edge";
export { cannyEdge } from "./canny-edge";
export { getBrightnessMap } from "./get-brightness-map";
export { getRGBMap } from "./get-rgb-map";
export { applyColorMode } from "./apply-color-mode";
export { applyFilters } from "./apply-filters";

// Re-export core functions for backwards compatibility
export { clamp, clamp01 } from "../primitives/math";
export { hslToRgb, rgbToGray, rgbToHsl } from "../color/color";
