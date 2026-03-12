import type { AnimationFrame, GifCompositor } from '../domain/render/animation';
import { log } from './log';
import { loadFileAsCanvas } from './load-file-as-canvas';

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
