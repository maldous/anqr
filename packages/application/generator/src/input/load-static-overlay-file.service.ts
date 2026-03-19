/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Load static image for overlay.
 */

import { createLogger } from "@/domain/logging";
import type { AnimationFrame, GifCompositor } from "@/domain/render/animation";
import { loadFileAsCanvas } from "./load-file-as-canvas.service";

const log = createLogger("QR");

export function loadStaticOverlayFile(
  file: File,
  setGifFrames: (f: AnimationFrame[]) => void,
  setGifCompositor: (c: GifCompositor | null) => void,
  setRawOverlayCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void,
  setIsLoadingOverlay: (v: boolean) => void,
): void {
  setGifFrames([]);
  setGifCompositor(null);
  loadFileAsCanvas(file)
    .then((canvas) => {
      setRawOverlayCanvas(canvas);
      setIsLoadingOverlay(false);
    })
    .catch((err) => {
      log.error("Failed to load overlay", { error: err });
      setRawOverlayCanvas(null);
      setIsLoadingOverlay(false);
    });
}
