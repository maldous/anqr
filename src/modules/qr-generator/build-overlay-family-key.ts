import type { QRGeneratorConfig } from './types';

export function buildOverlayFamilyKey(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  config: QRGeneratorConfig
): string {
  if (!overlayCanvas) return 'overlay:none';
  return [
    overlayCanvas.width,
    overlayCanvas.height,
    config.overlayMode ?? 'none',
    config.colorMode ?? 'color',
    Math.round(config.overlayIntensity ?? 100),
    Math.round(config.ditherStrength ?? 50),
    Math.round(config.finderDitherStrength ?? 65),
    config.ditherKind ?? 'none',
    config.ditherMode ?? 'none',
    Math.round(config.renderScalePerModule ?? 18),
    config.blendPreservations === true ? 1 : 0,
    config.blendPreservationMode === 'dither' ? 'dither' : 'overlay',
  ].join('|');
}
