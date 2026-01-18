/**
 * Blue Noise Dithering Module for QR Codes
 *
 * @deprecated Import from './qr-generator' instead:
 *   import { generateBlueNoiseDithered } from './qr-generator';
 */

export {
  generateBlueNoiseDithered,
  blueNoiseCanvasFactory as defaultBrowserCanvasFactory,
} from './qr-generator';

export type {
  ColorMode,
  CanvasFactory,
  BlueNoiseOptions,
  RGB,
  BlueNoiseResult,
  GenerateOptions,
} from './qr-generator/internal/blue-noise';
