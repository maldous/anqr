import { loadFileAsCanvas } from "./load-file-as-canvas.service";
import type { AnimationFrame } from "@/modules/animation";

export function handleOverlayLoadFallback(
  file: File,
  setRawOverlayCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void,
  setGifFrames: (f: AnimationFrame[]) => void,
  setIsLoadingOverlay: (v: boolean) => void,
): Promise<void> {
  return loadFileAsCanvas(file)
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
