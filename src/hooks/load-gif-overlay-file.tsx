import {
  type AnimationFrame,
  createGifCompositor,
  type GifCompositor,
} from '../domain/render/animation';
import { log } from './log';
import { loadFileAsCanvas } from './load-file-as-canvas';

export function loadGifOverlayFile(
  file: File,
  setGifCompositor: (c: GifCompositor | null) => void,
  setGifFrames: (f: AnimationFrame[]) => void,
  setCurrentFrame: (n: number) => void,
  setRawOverlayCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void,
  setIsLoadingOverlay: (v: boolean) => void
): void {
  file
    .arrayBuffer()
    .then((arrayBuffer) => {
      try {
        const compositor = createGifCompositor(arrayBuffer);
        setGifCompositor(compositor);
        setGifFrames([]);
        setCurrentFrame(0);
        compositor.reset();
        compositor.apply(0);
        setRawOverlayCanvas(compositor.canvas);
      } catch (err) {
        log.error('Failed to create GIF compositor', { error: err });
        setGifCompositor(null);
        loadFileAsCanvas(file)
          .then((canvas) => {
            setRawOverlayCanvas(canvas);
            setGifFrames([{ canvas, delay: 100, disposalType: 0 }]);
            setIsLoadingOverlay(false);
          })
          .catch(() => {
            setRawOverlayCanvas(null);
            setIsLoadingOverlay(false);
          });
      }
    })
    .catch((err) => {
      log.error('Failed to read GIF file', { error: err });
      setRawOverlayCanvas(null);
      setIsLoadingOverlay(false);
    });
}
