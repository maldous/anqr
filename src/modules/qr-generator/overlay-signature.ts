import { hashCanvasContent } from './utils';
import type { QRGeneratorConfig } from './types';
import { buildFixedVisualPolicy } from './build-fixed-visual-policy';
import { buildOverlayFamilyKey } from './build-overlay-family-key';
import { buildScanCacheKey } from './build-scan-cache-key';

export { buildFixedVisualPolicy, buildOverlayFamilyKey, buildScanCacheKey };

export async function computeOverlaySignature(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  isAnimatedFrame: boolean,
  overlayFamilyKey: string,
  createCanvas: (w: number, h: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
): Promise<string> {
  if (!overlayCanvas) return 'overlay:none';
  if (isAnimatedFrame) return `anim-family:${overlayFamilyKey}`;
  const hash = await hashCanvasContent(overlayCanvas, createCanvas);
  return `${overlayCanvas.width}x${overlayCanvas.height}:${hash}`;
}
