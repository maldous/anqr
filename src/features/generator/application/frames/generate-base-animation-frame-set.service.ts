/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Generate base animation frame set.
 */

import type { AnimationFrame } from "@/modules/animation";
import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { canvasListToAnimationFrames } from "@/features/generator/application/frames/canvas-list-to-animation-frames.service";
import { generateJitteredFrameLoop } from "@/features/generator/application/frames/generate-jittered-frame-loop.service";
import { generatePatternOnlyFrames } from "@/features/generator/application/frames/generate-pattern-only-frames.service";
import { generateStaticBaseFrames } from "@/features/generator/application/frames/generate-static-base-frames.service";
import { YieldController } from "@/features/generator/application/generation/generation-class-yieldcontroller";

export async function generateBaseAnimationFrameSet(params: {
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  speedMs: number;
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  computeJitter: (frameIndex: number, totalFrames: number) => number;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number,
  ) => HTMLCanvasElement | OffscreenCanvas;
}): Promise<AnimationFrame[] | null> {
  if (params.hasPattern && !params.hasJitter) {
    return generatePatternOnlyFrames(params);
  }

  if (params.hasPattern && params.hasJitter) {
    const collected = await generateJitteredFrameLoop(params);
    if (!collected) return null;
    return canvasListToAnimationFrames(collected, params.speedMs);
  }

  if (params.hasJitter) {
    const collected = await generateJitteredFrameLoop(params);
    if (!collected) return null;
    return canvasListToAnimationFrames(collected, params.speedMs);
  }

  return generateStaticBaseFrames(params);
}
