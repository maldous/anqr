/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Compute which base animation frames to process.
 */

import type { AnimationFrame } from '@/modules/animation/types';
import type { QRGeneratorConfig } from '@/modules/qr-generator/types';
import { generateBaseAnimationFrameSet } from '@/features/generator/application/frames/frames-fn-baseanimation';
import { YieldController } from '@/features/generator/application/generation/generation-class-yieldcontroller';


export function computeBaseAnimationFramesToProcess(params: {
  shouldGenerateBaseAnimation: boolean;
  shouldGenerateStaticOverlayAnimation: boolean;
  effectiveFrames: AnimationFrame[];
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  speedMs: number;
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  computeJitter: (fi: number, tf: number) => number;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
}): Promise<{ framesToProcess: AnimationFrame[] | null }> {
  return (async () => {
    if (params.shouldGenerateBaseAnimation) {
      const frameCount = 24;
      const baseFrameResult = await generateBaseAnimationFrameSet({
        hasPattern: params.hasPattern,
        hasJitter: params.hasJitter,
        previewScanConfigBase: params.previewScanConfigBase,
        frameCount,
        speedMs: params.speedMs,
        isRunCancelled: params.isRunCancelled,
        yieldCtrl: params.yieldCtrl,
        computeJitter: params.computeJitter,
        applyResultPersistent: params.applyResultPersistent,
      });
      if (!baseFrameResult || params.isRunCancelled()) return { framesToProcess: null };
      return { framesToProcess: baseFrameResult };
    }
    if (params.shouldGenerateStaticOverlayAnimation && params.effectiveFrames.length === 1) {
      const frameCount = 24;
      const baseCanvas = params.applyGeometricTransforms(params.effectiveFrames[0].canvas);
      return {
        framesToProcess: Array.from({ length: frameCount }, () => ({
          canvas: baseCanvas,
          delay: params.speedMs,
          disposalType: 0,
        })),
      };
    }
    return { framesToProcess: params.effectiveFrames };
  })();
}

