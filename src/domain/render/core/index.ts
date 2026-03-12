// Barrel: domain/render/core — re-exports color utilities
export { blendColors } from '../color/blend-colors';
export { blendColorsLinear } from '../color/blend-colors-linear';
export { blendColorsLinear as blendColorsLinear2 } from '../color/blend-colors-linear';
export { parseColor } from '../color/parse-color';
export {
  rgbToHex,
  rgbaToHex,
  rgbToString,
  rgbaToString,
  rgbToGray,
  getRelativeLuminance,
  getContrastRatio,
  isDark,
  getTextColor,
  alphaBlend,
  multiplyBlend,
  screenBlend,
  overlayBlend,
} from '../color/color';
