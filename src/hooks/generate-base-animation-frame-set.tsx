import type { AnimationFrame } from '../domain/render/animation';
import type { QRGeneratorConfig } from '../domain/render/generator';
import { YieldController } from './yield-controller';
import { generateJitteredFrameLoop } from './generate-jittered-frame-loop';
import { canvasListToAnimationFrames } from './canvas-list-to-animation-frames';
import { generatePatternOnlyFrames } from './generate-pattern-only-frames';
import { generateStaticBaseFrames } from './generate-static-base-frames';

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
