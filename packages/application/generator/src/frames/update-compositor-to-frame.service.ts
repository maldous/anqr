/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Advance GIF compositor to target frame.
 */

import type { GifCompositor } from "@/domain/render/animation";

export function updateCompositorToFrame(
  gifCompositor: GifCompositor,
  frameIdx: number,
  lastRendered: number,
): void {
  if (lastRendered < 0 || frameIdx < lastRendered) {
    gifCompositor.reset();
    for (let i = 0; i <= frameIdx; i++) {
      if (i > 0) gifCompositor.dispose(i - 1);
      gifCompositor.apply(i);
    }
  } else if (frameIdx > lastRendered) {
    for (let i = lastRendered + 1; i <= frameIdx; i++) {
      if (i > 0) gifCompositor.dispose(i - 1);
      gifCompositor.apply(i);
    }
  }
}
