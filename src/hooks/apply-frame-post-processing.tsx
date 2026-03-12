import { applyColorCycle } from '../domain/render/animation';
import { applyWatermarkToCanvas } from './apply-watermark-to-canvas';
import { cloneCanvasSimple } from './clone-canvas-simple';
import type { PatternEffect } from './pattern-effect';

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
