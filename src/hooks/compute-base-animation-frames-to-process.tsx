import type { AnimationFrame } from '../domain/render/animation';
import type { QRGeneratorConfig } from '../domain/render/generator';
import { YieldController } from './yield-controller';
import { generateBaseAnimationFrameSet } from './generate-base-animation-frame-set';

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
