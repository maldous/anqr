/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Apply post-processing to animation frame.
 */

import { applyColorCycle } from '@/domain/render/animation/color-cycle';
import { cloneCanvasSimple } from '@/features/generator/application/frames/frames-fn-clonesimple';
import { PatternEffect } from '@/features/generator/application/frames/frames-type-patterneffect';
import { applyWatermarkToCanvas } from '@/features/generator/application/generation/generation-fn-watermark';


export async function applyFramePostProcessing<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: {
  result: HTMLCanvasElement | OffscreenCanvas;
  shouldGenerateBaseAnimation: boolean;
  resultPatternEffects: PatternEffect[];
  applyResultEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  framesToProcessLength: number;
  hasColorCycle: boolean;
  watermarkConfig: W;
  watermarkImage: HTMLImageElement | HTMLCanvasElement | null;
}): Promise<HTMLCanvasElement | OffscreenCanvas> {
  let finalResult: HTMLCanvasElement | OffscreenCanvas = params.result;
  if (!params.shouldGenerateBaseAnimation && params.resultPatternEffects.length > 0) {
    finalResult = params.applyResultEphemeral(
      finalResult,
      params.frameIdx,
      params.framesToProcessLength
    );
  }
  if (params.hasColorCycle) {
    const colorCycleTarget = cloneCanvasSimple(finalResult);
    finalResult = applyColorCycle(
      finalResult,
      params.frameIdx,
      params.framesToProcessLength,
      colorCycleTarget
    );
  }
  let previewFrame: HTMLCanvasElement | OffscreenCanvas = finalResult;
  if (params.watermarkConfig.enabled) {
    previewFrame = await applyWatermarkToCanvas(finalResult, params.watermarkConfig);
  }
  return previewFrame;
}

