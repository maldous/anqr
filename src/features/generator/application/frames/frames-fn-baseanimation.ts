/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Generate base animation frame set.
 */

import type { AnimationFrame } from '@/modules/animation';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { canvasListToAnimationFrames } from '@/features/generator/application/frames/frames-fn-canvastoframes';
import { generateJitteredFrameLoop } from '@/features/generator/application/frames/frames-fn-jitteredloop';
import { generatePatternOnlyFrames } from '@/features/generator/application/frames/frames-fn-patternonly';
import { generateStaticBaseFrames } from '@/features/generator/application/frames/frames-fn-staticbase';
import { YieldController } from '@/features/generator/application/generation/generation-class-yieldcontroller';


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
    tf: number
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

