import { createGifCompositor } from "@/domain/render/animation/gif-compositor";
import type { AnimationFrame } from "./types";

export function extractGifFramesViaCompositor(
  compositor: ReturnType<typeof createGifCompositor>,
  disposalHandling: "respect" | "simplify",
): AnimationFrame[] {
  const animationFrames: AnimationFrame[] = [];
  for (let i = 0; i < compositor.frameCount; i++) {
    compositor.apply(i);
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = compositor.width;
    frameCanvas.height = compositor.height;
    const frameCtx = frameCanvas.getContext("2d");
    if (frameCtx) {
      frameCtx.drawImage(compositor.canvas, 0, 0);
    }
    const srcDisposal = compositor.disposalType(i);
    const effectiveDisposal =
      disposalHandling === "simplify" && srcDisposal === 3 ? 2 : srcDisposal;
    animationFrames.push({
      canvas: frameCanvas,
      delay: compositor.delayMs(i),
      disposalType: effectiveDisposal,
    });
    compositor.dispose(i);
  }
  return animationFrames;
}
