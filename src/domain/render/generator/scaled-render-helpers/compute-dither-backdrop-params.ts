import type { QRGeneratorConfig } from '../../../../modules/qr-generator/types';
import type { DitherBackdropParams } from '../scaled-render-types';
import { parseColor } from '../../color/color';
import { curveIntensity } from '../pixel-matrix-utils';

export function computeDitherBackdropParams(
  config: QRGeneratorConfig,
  effectiveBgColor: string,
  isDitheredMode: boolean,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  useColorRendering: boolean
): DitherBackdropParams {
  const ditherBackdropAlpha = Math.max(0, Math.min(0.75, config.ditherBackdropAlpha ?? 0.4));
  const overlayTone = curveIntensity(config.overlayIntensity ?? 100);
  const adaptiveBackdropWash = Math.max(0.06, Math.min(0.22, 0.06 + overlayTone * 0.14));
  const ditherBackdropWash = Math.max(
    0,
    Math.min(1, config.ditherBackdropWash ?? adaptiveBackdropWash)
  );
  const bgRgb = parseColor(effectiveBgColor) ?? { r: 255, g: 255, b: 255, a: 1 };
  const bgLuma = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) / 255;
  const ditherPaperOverlayMix =
    isDitheredMode && overlayCanvas && useColorRendering
      ? Math.max(0, Math.min(1, ditherBackdropAlpha * (1 - ditherBackdropWash)))
      : 0;
  return { ditherBackdropAlpha, ditherBackdropWash, bgLuma, ditherPaperOverlayMix };
}
