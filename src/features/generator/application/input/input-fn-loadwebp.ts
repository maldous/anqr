/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Load animated WebP file for overlay.
 */

import { createLogger } from '@/infra/logging/logger';
import { parseAnimatedImage, type AnimationFrame, type GifCompositor } from '@/modules/animation';
import { handleOverlayLoadFallback } from '@/features/generator/application/input/input-fn-handleloadfallback';

const log = createLogger('QR');

export function loadAnimatedWebPOverlayFile(
  file: File,
  gifDisposalHandling: 'respect' | 'simplify' | undefined,
  setGifFrames: (f: AnimationFrame[]) => void,
  setGifCompositor: (c: GifCompositor | null) => void,
  setCurrentFrame: (n: number) => void,
  setRawOverlayCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void,
  setIsLoadingOverlay: (v: boolean) => void
): void {
  file
    .arrayBuffer()
    .then(async (arrayBuffer) => {
      try {
        const frames = await parseAnimatedImage(arrayBuffer, gifDisposalHandling);
        setGifFrames(frames);
        setGifCompositor(null);
        setCurrentFrame(0);
        if (frames.length > 0) {
          setRawOverlayCanvas(frames[0].canvas);
        }
        if (frames.length <= 1) {
          setIsLoadingOverlay(false);
        }
      } catch (err) {
        log.error('Failed to parse animated WebP', { error: err });
        void handleOverlayLoadFallback(
          file,
          setRawOverlayCanvas,
          setGifFrames,
          setIsLoadingOverlay
        );
      }
    })
    .catch((err) => {
      log.error('Failed to read WebP file', { error: err });
      setRawOverlayCanvas(null);
      setIsLoadingOverlay(false);
    });
}
