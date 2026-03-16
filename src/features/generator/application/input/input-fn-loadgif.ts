/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Load GIF file for overlay.
 */

import { createLogger } from "@/infra/logging/logger";
import { createGifCompositor } from "@/domain/render/animation/gif-compositor";
import type { AnimationFrame, GifCompositor } from "@/modules/animation";
import { handleOverlayLoadFallback } from "@/features/generator/application/input/input-fn-handleloadfallback";

const log = createLogger("QR");

export function loadGifOverlayFile(
  file: File,
  setGifCompositor: (c: GifCompositor | null) => void,
  setGifFrames: (f: AnimationFrame[]) => void,
  setCurrentFrame: (n: number) => void,
  setRawOverlayCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void,
  setIsLoadingOverlay: (v: boolean) => void,
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
        log.error("Failed to create GIF compositor", { error: err });
        setGifCompositor(null);
        void handleOverlayLoadFallback(
          file,
          setRawOverlayCanvas,
          setGifFrames,
          setIsLoadingOverlay,
        );
      }
    })
    .catch((err) => {
      log.error("Failed to read GIF file", { error: err });
      setRawOverlayCanvas(null);
      setIsLoadingOverlay(false);
    });
}
