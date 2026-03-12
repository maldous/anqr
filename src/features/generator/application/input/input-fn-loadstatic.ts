/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Load static image for overlay.
 */

import { createLogger } from '@/infra/logging/logger';
import type { GifCompositor } from '@/modules/animation';
import type { AnimationFrame } from '@/modules/animation';
import { loadFileAsCanvas } from '@/features/generator/application/input/input-fn-loadfilecanvas';

const log = createLogger('QR');


export function loadStaticOverlayFile(
  file: File,
  setGifFrames: (f: AnimationFrame[]) => void,
  setGifCompositor: (c: GifCompositor | null) => void,
  setRawOverlayCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void,
  setIsLoadingOverlay: (v: boolean) => void
): void {
  setGifFrames([]);
  setGifCompositor(null);
  loadFileAsCanvas(file)
    .then((canvas) => {
      setRawOverlayCanvas(canvas);
      setIsLoadingOverlay(false);
    })
    .catch((err) => {
      log.error('Failed to load overlay', { error: err });
      setRawOverlayCanvas(null);
      setIsLoadingOverlay(false);
    });
}

