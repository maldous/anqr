import type { QRGeneratorConfig } from '../../../../modules/qr-generator/types';
import type { ScaledOverlayModeInfo } from '../scaled-render-types';

export function classifyScaledOverlayMode(config: QRGeneratorConfig): ScaledOverlayModeInfo {
  const isDitheredMode =
    config.overlayMode === 'dithered' ||
    config.overlayMode === 'blue_noise' ||
    config.overlayMode === 'blue-noise';
  const isSubpixelMode =
    config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  return {
    isDitheredMode,
    forceBinaryFunctionPatterns: isDitheredMode,
    isSubpixelMode,
    needsBothDarkAndLightColors: isSubpixelMode,
  };
}
